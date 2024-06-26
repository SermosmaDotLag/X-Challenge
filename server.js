/**
 * Módulos requeridos.
 */
const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const path = require('path');
const bodyParser = require('body-parser');
const say = require('say');

/**
 * Inicializa la aplicación Express.
 * @type {Object}
 */
const app = express();

/**
 * Crea un servidor HTTP.
 * @type {Object}
 */
const server = http.createServer(app);

/**
 * Inicializa un servidor WebSocket asociado al servidor HTTP.
 * @type {WebSocket.Server}
 */
const wss = new WebSocket.Server({ server });

// Servir archivos estáticos desde el directorio 'public'
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: true }));

/**
 * Ruta para manejar la solicitud de texto a voz.
 * @name post/speak
 * @function
 * @inner
 * @param {string} path - Ruta para la solicitud.
 * @param {callback} middleware - Función middleware que maneja la solicitud.
 */
app.post('/speak', (req, res) => {
    /**
     * Texto recibido del cliente.
     * @type {string}
     */
    const text = req.body.text;

    // Usar la biblioteca `say` para hablar el texto
    say.speak(text, 'Microsoft Helena Desktop', 1.0, (err) => {
        if (err) {
            console.error(err);
            res.status(500).send('Error al reproducir el texto.');
        } else {
            res.send('Texto reproducido con éxito.');
        }
    });
});

/**
 * Evento de conexión del WebSocket.
 * @event WebSocket.Server#connection
 * @param {WebSocket} ws - La instancia del WebSocket.
 */
wss.on('connection', function connection(ws) {
    /**
     * Evento de mensaje del WebSocket.
     * @event WebSocket#message
     * @param {string} message - El mensaje recibido.
     */
    ws.on('message', function incoming(message) {
        // Convertir el mensaje a texto
        const textMessage = message.toString();
        /**
         * Mensaje separado en ID del cliente y contenido real.
         * @type {Array<string>}
         */
        const mensaje = textMessage.split('##');

        // Usar la biblioteca `say` para hablar el mensaje
        say.speak(mensaje[1], 'Microsoft Helena Desktop', 1.0, (err) => {
            if (err) {
                console.error('Error al reproducir el texto:', err);
            }
        });

        // Enviar el mensaje a todos los clientes conectados excepto el remitente
        wss.clients.forEach(function each(client) {
            if (client !== ws && client.readyState === WebSocket.OPEN) {
                client.send(textMessage);
            }
        });
    });
});

/**
 * Inicia el servidor en el puerto 3000.
 * @function
 */
server.listen(3000, function() {
    console.log('Server listening on http://localhost:3000');
});
