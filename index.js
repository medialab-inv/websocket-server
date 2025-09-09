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
    
    // Enviar un mensaje de bienvenida en formato JSON
    const welcomeMessage = {
        type: 'connection',
        status: 'connected',
        message: 'Bienvenido al servidor WebSocket',
        timestamp: new Date().toISOString()
    };
    ws.send(JSON.stringify(welcomeMessage));
    
    ws.on('message', (message) => {
        console.log('Mensaje recibido:', message.toString());
        
        try {
            // Intentar parsear el mensaje como JSON
            const data = JSON.parse(message);
            console.log('Datos JSON recibidos:', data);
            
            // Responder con un JSON
            const response = {
                status: 'success',
                received: data,
                timestamp: new Date().toISOString()
            };
            ws.send(JSON.stringify(response));
            
        } catch (e) {
            const errorResponse = {
                status: 'error',
                message: 'Mensaje no es un JSON válido',
                originalMessage: message.toString(),
                timestamp: new Date().toISOString()
            };
            ws.send(JSON.stringify(errorResponse));
        }
    });
    
    ws.on('close', () => {
        console.log('Cliente desconectado');
    });
});


console.log(`Servidor WebSocket iniciado en puerto ${process.env.PORT || 10000}`);
