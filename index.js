const WebSocket = require('ws');
const express = require('express');
const { google } = require('googleapis');

const app = express();

// ── CORS para que Unity WebGL pueda hacer fetch ──
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  next();
});

// ── Auth con Service Account ──
const auth = new google.auth.GoogleAuth({
  credentials: JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON),
  scopes: ['https://www.googleapis.com/auth/drive.readonly'],
});

// ── Endpoint de audio ──
app.get('/audio/:fileId', async (req, res) => {
  try {
    const { fileId } = req.params;
    const client = await auth.getClient();
    const token = await client.getAccessToken();

    const driveUrl = `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`;
    const response = await fetch(driveUrl, {
      headers: { Authorization: `Bearer ${token.token}` }
    });

    if (!response.ok) {
      return res.status(response.status).send('Error al obtener audio de Drive');
    }

    res.setHeader('Content-Type', response.headers.get('content-type') || 'audio/mpeg');
    res.setHeader('Cache-Control', 'public, max-age=3600');
    response.body.pipe(res);

  } catch (e) {
    console.error('Error en /audio:', e);
    res.status(500).send('Error interno');
  }
});
const http = require('http');
const fs = require('fs').promises;
const path = require('path');
const server = http.createServer(app);


const wss = new WebSocket.Server({ noServer: true });

// Almacenamiento del último mensaje
let lastMessage = null;
server.on('upgrade', (request, socket, head) => {
  wss.handleUpgrade(request, socket, head, (ws) => {
    wss.emit('connection', ws, request);
  });
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

const PORT = process.env.PORT || 10000;
server.listen(PORT, () => {
  console.log(`Servidor HTTP + WebSocket iniciado en puerto ${PORT}`);
});
console.log(`Servidor WebSocket iniciado en puerto ${process.env.PORT || 10000}`);
