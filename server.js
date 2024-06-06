const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const path = require('path');
const bodyParser = require('body-parser');
const say = require('say');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Servir archivos estáticos desde el directorio 'public'
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: true }));

// Ruta para manejar la solicitud de texto a voz
app.post('/speak', (req, res) => {
    const text = req.body.text;
    say.speak(text, 'Microsoft David Desktop', 1.0, (err) => {
        if (err) {
            console.error(err);
            res.status(500).send('Error al reproducir el texto.');
        } else {
            res.send('Texto reproducido con éxito.');
        }
    });
});

// Enviar mensaje como texto
wss.on('connection', function connection(ws) {
    ws.on('message', function incoming(message) {
      // Convertir el mensaje a texto
      const textMessage = message.toString();
      
      // Usar la biblioteca `say` para hablar el mensaje
      say.speak(textMessage, 'Microsoft David Desktop', 1.0, (err) => {
          if (err) {
              console.error('Error al reproducir el texto:', err);
          }
      });

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
