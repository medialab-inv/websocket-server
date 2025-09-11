const WebSocket = require('ws');

const http = require('http');
const fs = require('fs').promises;
const path = require('path');
const server = http.createServer();


const wss = new WebSocket.Server({ 
    port: process.env.PORT || 10000,
    clientTracking: true
});

// Almacenamiento del último mensaje
let lastMessage = null;

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
    
    ws.on('message', async (message) => {
        console.log('Mensaje recibido:', message.toString());
        
        try {
            const data = JSON.parse(message);
            console.log('Datos JSON recibidos:', data);
            
            // Manejar solicitud del último mensaje
            if (data.action === 'load' && data.fileName) {
                 console.log('Enviado:', lastMessage.toString());
                return ws.send(JSON.stringify(lastMessage));
            }
            
            
            // Verificar si el mensaje es un JSON válido
            if (typeof data === 'object' && data !== null) {
                // Guardar el último mensaje con timestamp
                lastMessage = {
                    ...data,
                    timestamp: new Date().toISOString()
                };
                console.log('Mensaje guardado:', lastMessage);
            }
            
            // Envía el mensaje a todos los clientes conectados incluyendo al remitente
            const broadcastMessage = JSON.stringify({
                ...data,
                type: data.type || 'message',
                timestamp: new Date().toISOString()
            });
            
            wss.clients.forEach((client) => {
                if (client.readyState === WebSocket.OPEN) {
                    client.send(broadcastMessage);
                }
            });
            
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
