/**
 * Inicializa el chat con reconocimiento de voz y WebSocket.
 */
function initializeChat() {
    /**
     * Reconocimiento de voz.
     * @type {webkitSpeechRecognition|SpeechRecognition}
     */
    const recognition = new webkitSpeechRecognition() || new SpeechRecognition();
    recognition.interimResults = true; // Permite resultados intermedios
    recognition.lang = 'es-ES'; // Establece el idioma a español

    // Obtiene referencias a los elementos del DOM
    /**
     * Elemento para mostrar la transcripción del reconocimiento de voz.
     * @type {HTMLElement}
     */
    const transcriptionElement = document.getElementById('transcription');
    /**
     * Botón para iniciar el reconocimiento de voz.
     * @type {HTMLElement}
     */
    const startButton = document.getElementById('startButton');
    /**
     * Botón para detener el reconocimiento de voz.
     * @type {HTMLElement}
     */
    const stopButton = document.getElementById('stopButton');
    /**
     * Formulario de envío de mensajes.
     * @type {HTMLElement}
     */
    const messageForm = document.getElementById('messageForm');
    /**
     * Campo de entrada para el mensaje.
     * @type {HTMLInputElement}
     */
    const messageInput = document.getElementById('messageInput');
    /**
     * Contenedor para la lista de mensajes.
     * @type {HTMLElement}
     */
    const messagesList = document.getElementById('messages');
    /**
     * ID único para el cliente.
     * @type {string}
     */
    const clientId = Math.random().toString(36).substr(2, 9);

    // Maneja el evento de clic en el botón de inicio
    startButton.addEventListener('click', () => {
        recognition.start();
        startButton.style.display = 'none';
        stopButton.style.display = 'inline-block';
    });

    // Maneja el evento de clic en el botón de detener
    stopButton.addEventListener('click', () => {
        recognition.stop();
        startButton.style.display = 'inline-block';
        stopButton.style.display = 'none';
    });

    // Agrega un event listener para el resultado del reconocimiento de voz
    if (transcriptionElement) {
        recognition.addEventListener('result', (event) => {
            const transcript = Array.from(event.results)
                .map(result => result[0].transcript)
                .join('');
            messageInput.value = transcript;
            transcriptionElement.innerHTML = transcript;

            if (event.results[0].isFinal) {
                sendMessage(transcript);
            }
        });
    } else {
        console.error('El elemento con ID transcription no se encontró en el DOM.');
    }

    // Maneja el evento de finalización del reconocimiento de voz
    recognition.addEventListener('end', () => {
        startButton.style.display = 'inline-block';
        stopButton.style.display = 'none';
    });

    // Maneja el envío del formulario de mensajes
    messageForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const message = messageInput.value;
        sendMessage(message);
    });

    /**
     * Inicializa una conexión WebSocket.
     * @type {WebSocket}
     */
    const ws = new WebSocket('ws://10.3.99.12:3000');

    // Maneja errores del WebSocket
    ws.onerror = function(event) {
        console.error('WebSocket error:', event);
    };

    // Maneja la recepción de mensajes del WebSocket
    ws.onmessage = function(event) {
        const message = event.data;
        const [senderId, actualMessage] = message.split('##');

        // Si el mensaje no proviene del propio cliente
        if (senderId !== clientId) {
            const messageDiv = document.createElement('div');
            messageDiv.classList.add('row', 'justify-content-start');  // Cambia a justify-content-start para mensajes recibidos

            const messageParagraph = document.createElement('p');
            messageParagraph.classList.add('bg-white', 'border', 'p-3', 'w-50', 'rounded-pill');
            messageParagraph.textContent = actualMessage;

            messageDiv.appendChild(messageParagraph);
            messagesList.appendChild(messageDiv);

            // Enviar el mensaje a la ruta /speak para reproducirlo
            fetch('/speak', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams({
                    'text': actualMessage
                })
            })
            .then(response => response.text())
            .then(data => {
                console.log(data);
            })
            .catch(error => {
                console.error('Error:', error);
            });
        }
    };

    /**
     * Envía un mensaje a través del WebSocket.
     * @param {string} message - El mensaje a enviar.
     */
    function sendMessage(message) {
        const fullMessage = `${clientId}##${message}`;
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('row', 'justify-content-end');

        const messageParagraph = document.createElement('p');
        messageParagraph.classList.add('bg-blue', 'border', 'p-3', 'w-50', 'rounded-pill');
        messageParagraph.textContent = message;

        messageDiv.appendChild(messageParagraph);
        messagesList.appendChild(messageDiv);

        ws.send(fullMessage); // Envía el mensaje a través del WebSocket
        messageInput.value = ''; // Limpia el campo de entrada de mensaje
    }
}
