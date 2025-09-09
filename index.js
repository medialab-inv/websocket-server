const WebSocket = require('ws');
const http = require('http');

const server = http.createServer();
const wss = new WebSocket.Server({ server });

wss.on('connection', (ws) => {
    console.log('Nuevo cliente conectado');
    
    ws.on('message', (message) => {
        console.log('Mensaje recibido:', message.toString());
        // Aquí puedes procesar los mensajes
        ws.send('Mensaje recibido: ' + message);
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Servidor WebSocket en puerto ${PORT}`);
});