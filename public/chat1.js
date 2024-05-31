function initializeChat() {
    // Inicializa el reconocimiento de voz
    const recognition = new webkitSpeechRecognition() || new SpeechRecognition();
    recognition.interimResults = true; // Permite resultados intermedios
    recognition.lang = 'es-ES'; // Establece el idioma a español

    // Obtiene referencias a los elementos del DOM
    const transcriptionElement = document.getElementById('transcription');
    const startButton = document.getElementById('startButton');
    const stopButton = document.getElementById('stopButton');
    const messageForm = document.getElementById('messageForm');
    const messageInput = document.getElementById('messageInput');
    const messagesList = document.getElementById('messages');
    // Genera un ID único para el cliente
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

    // Inicializa una conexión WebSocket
    const ws = new WebSocket('ws://localhost:3000');

    // Maneja errores del WebSocket
    ws.onerror = function(event) {
        console.error('WebSocket error:', event);
    };

    // Maneja el resultado final del reconocimiento de voz
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

    // Función para enviar mensajes
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

    // Maneja la recepción de mensajes del WebSocket
    ws.onmessage = function(event) {
        const message = event.data;
        const [senderId, actualMessage] = message.split('##');

        // Si el mensaje no proviene del propio cliente
        if (senderId !== clientId) {
            const messageDiv = document.createElement('div');
            messageDiv.classList.add('row', 'justify-content-end');

            const messageParagraph = document.createElement('p');
            messageParagraph.classList.add('bg-white', 'border', 'p-3', 'w-50', 'rounded-pill');
            messageParagraph.textContent = actualMessage;

            messageDiv.appendChild(messageParagraph);
            messagesList.appendChild(messageDiv);
        }
    };
}
