const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const path = require('path');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Servir archivos estáticos desde el directorio 'public'
app.use(express.static(path.join(__dirname, 'public')));

// Enviar mensaje como texto
wss.on('connection', function connection(ws) {
    ws.on('message', function incoming(message) {
      // Convertir el mensaje a texto
      const textMessage = message.toString();
      // Broadcast mensajes a todos los clientes
      wss.clients.forEach(function each(client) {
        if (client !== ws && client.readyState === WebSocket.OPEN) {
          client.send(textMessage);
        }
      });
    });
  });
server.listen(3000, function() {
  console.log('Server listening on http://localhost:3000');
});
