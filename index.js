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
    
    const clientIP = ws._socket.remoteAddress;
    
    const welcomeMessage = {
        type: 'connection',
        status: 'connected',
        message: 'Bienvenido al servidor WebSocket',
        clientIP: clientIP,
        timestamp: new Date().toISOString()
    };
    ws.send(JSON.stringify(welcomeMessage));
    
    ws.on('message', (message) => {
        console.log('Mensaje recibido:', message.toString());
        
        try {
            const data = JSON.parse(message);
            console.log('Datos JSON recibidos:', data);
            
            const response = {
                status: 'success',
                received: data,
                timestamp: new Date().toISOString()
            };
            ws.send(JSON.stringify(response));
            console.log('Mensaje enviado:', response);
            
        } catch (e) {
            console.error('Error al procesar el mensaje:', e);
        }
    });
    
    ws.on('close', () => {
        console.log('Cliente desconectado');
    });
});


console.log(`Servidor WebSocket iniciado en puerto ${process.env.PORT || 10000}`);
