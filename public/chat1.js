function initializeChat() {
    // Inicializa el reconocimiento de voz
    const recognition = new webkitSpeechRecognition() || new SpeechRecognition();
    recognition.interimResults = true; // Permite resultados intermedios mientras se habla
    recognition.lang = 'es-ES'; // Establece el idioma del reconocimiento como español

    // Obtiene referencias a los elementos del DOM necesarios
    const transcriptionElement = document.getElementById('transcription'); // Elemento donde se muestra la transcripción de voz
    const startButton = document.getElementById('startButton'); // Botón para iniciar el reconocimiento de voz
    const stopButton = document.getElementById('stopButton'); // Botón para detener el reconocimiento de voz
    const messageForm = document.getElementById('messageForm'); // Formulario de envío de mensaje
    const messageInput = document.getElementById('messageInput'); // Campo de entrada de mensaje
    const messagesList = document.getElementById('messages'); // Lista de mensajes

    // Event listener para iniciar el reconocimiento de voz al hacer clic en el botón de inicio
    startButton.addEventListener('click', () => {
        recognition.start();
        startButton.style.display = 'none'; // Oculta el botón de inicio
        stopButton.style.display = 'inline-block'; // Muestra el botón de detener
    });

    // Event listener para detener el reconocimiento de voz al hacer clic en el botón de detener
    stopButton.addEventListener('click', () => {
        recognition.stop();
        startButton.style.display = 'inline-block'; // Muestra el botón de inicio
        stopButton.style.display = 'none'; // Oculta el botón de detener
    });

    // Verifica si el elemento de transcripción está presente en el DOM
    if (transcriptionElement) {
        // Event listener para mostrar la transcripción en tiempo real durante el reconocimiento de voz
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

    // Event listener para restablecer los botones al finalizar el reconocimiento de voz
    recognition.addEventListener('end', () => {
        startButton.style.display = 'inline-block'; // Muestra el botón de inicio
        stopButton.style.display = 'none'; // Oculta el botón de detener
    });

    // Event listener para enviar el mensaje al hacer clic en enviar en el formulario
    messageForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const message = messageInput.value;
        sendMessage(message); // Llama a la función sendMessage para enviar el mensaje
    });

    // Inicializa una conexión WebSocket
    const ws = new WebSocket('ws://localhost:3000');

    // Event listener para manejar errores en la conexión WebSocket
    ws.onerror = function(event) {
        console.error('WebSocket error:', event);
    };

    // Event listener para procesar los resultados del reconocimiento de voz
    recognition.addEventListener('result', (event) => {
        const transcript = Array.from(event.results)
            .map(result => result[0].transcript)
            .join('');
    
        messageInput.value = transcript;
        transcriptionElement.innerHTML = transcript;
    
        // Envía automáticamente el mensaje después de que el usuario haya terminado de hablar
        if (event.results[0].isFinal) {
            sendMessage(transcript);
        }
    });
    
    // Función para enviar un mensaje
    function sendMessage(message) {
        // Crea un nuevo elemento div para contener el mensaje
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('row', 'justify-content-end');
        
        // Crea un nuevo elemento p para el mensaje
        const messageParagraph = document.createElement('p');
        messageParagraph.classList.add('bg-blue', 'border', 'p-3', 'w-50', 'rounded-pill');
        messageParagraph.textContent = message;
    
        // Agrega el párrafo al div
        messageDiv.appendChild(messageParagraph);
        
        // Agrega el div a la lista de mensajes
        messagesList.appendChild(messageDiv);
        
        // Envía el mensaje a través del WebSocket
        ws.send(message);
        
        // Limpia el campo de entrada después de enviar el mensaje
        messageInput.value = '';
    }
    
    // Event listener para manejar los mensajes recibidos a través del WebSocket
    ws.onmessage = function(event) {
        const message = event.data;
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('row', 'justify-content-end');
    
        // Crea un nuevo elemento p dentro del div
        const messageParagraph = document.createElement('p');

        // Si el mensaje fue enviado por el usuario, añade la clase 'bg-blue'; de lo contrario, déjalo blanco
        if (event.sender === 'user') {
            messageParagraph.classList.add('bg-blue', 'border', 'p-3', 'w-50', 'rounded-pill');
        } else {
            messageParagraph.classList.add('bg-white', 'border', 'p-3', 'w-50', 'rounded-pill');
        }

        messageParagraph.textContent = message;
    
        // Agrega el párrafo al div
        messageDiv.appendChild(messageParagraph);
    
        // Agrega el div a la lista de mensajes
        messagesList.appendChild(messageDiv); 
        
        
        // Envía el mensaje a través del WebSocket
        ws.send(message);
        
        // Limpia el campo de entrada después de enviar el mensaje
        messageInput.value = '';
    };
}
