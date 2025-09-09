const WebSocket = require('ws');

const http = require('http');
const server = http.createServer();


const wss = new WebSocket.Server({ 
    port: process.env.PORT || 10000,
    clientTracking: true
});

server.listen(10000, () => {
    console.log(`Servidor WebSocket`);
});
wss.on('connection', (ws) => {
    console.log('Nuevo cliente conectado');
    const serverAddress = server.address();
    const serverIP = serverAddress.address === '::' ? '127.0.0.1' : serverAddress.address;
    
    const welcomeMessage = {
        type: 'connection',
        status: 'connected',
        message: 'Bienvenido al servidor WebSocket',
        serverIP: serverIP,
        serverPort: serverAddress.port,
    };
    ws.send(JSON.stringify(welcomeMessage));
    
    ws.on('message', (message) => {
        console.log('Mensaje recibido:', message.toString());
        
        try {
            const data = JSON.parse(message);
            console.log('Datos JSON recibidos:', data);
            
            // Envía el mensaje a todos los clientes conectados excepto al remitente
            wss.clients.forEach((client) => {
                if (client !== ws && client.readyState === WebSocket.OPEN) {
                    client.send(JSON.stringify({
                        type: 'message',
                        from: 'server',
                        content: data,
                    }));
                }
            });
            
            // Confirmación al remitente
            const response = {
                status: 'success',
                message: 'Mensaje reenviado a los demás clientes',
            };
            ws.send(JSON.stringify(response));
            
        } catch (e) {
            console.error('Error al procesar el mensaje:', e);
            ws.send(JSON.stringify({
                status: 'error',
                message: 'Error al procesar el mensaje',
                error: e.message
            }));
        }
    });
    
    ws.on('close', () => {
        console.log('Cliente desconectado');
    });
});


console.log(`Servidor WebSocket iniciado en puerto ${process.env.PORT || 10000}`);
