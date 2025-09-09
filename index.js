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
    ws.send('Hola');
    console.log('Mensaje');
    
    ws.on('message', (message) => {
        console.log('Mensaje recibido:', message.toString());
        // Aquí puedes procesar los mensajes
        ws.send('Mensaje recibido: ' + message);
    });
    
    ws.on('close', () => {
        console.log('Cliente desconectado');
    });
});


console.log(`Servidor WebSocket iniciado en puerto ${process.env.PORT || 10000}`);
