function initializeChat() {
    const recognition = new webkitSpeechRecognition() || new SpeechRecognition();
    recognition.interimResults = true;
    recognition.lang = 'es-ES';

    const transcriptionElement = document.getElementById('transcription');
    const startButton = document.getElementById('startButton');
    const stopButton = document.getElementById('stopButton');
    const messageForm = document.getElementById('messageForm');
    const messageInput = document.getElementById('messageInput');
    const messagesList = document.getElementById('messages');

    startButton.addEventListener('click', () => {
        recognition.start();
        startButton.style.display = 'none';
        stopButton.style.display = 'inline-block';
    });

    stopButton.addEventListener('click', () => {
        recognition.stop();
        startButton.style.display = 'inline-block';
        stopButton.style.display = 'none';
    });

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

    recognition.addEventListener('end', () => {
        startButton.style.display = 'inline-block';
        stopButton.style.display = 'none';
    });

    messageForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const message = messageInput.value;
        sendMessage(message);
    });

    const ws = new WebSocket('ws://localhost:3000');

    ws.onerror = function(event) {
        console.error('WebSocket error:', event);
    };

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
    
    function sendMessage(message) {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('row', 'justify-content-end');
        
        const messageParagraph = document.createElement('p');
        messageParagraph.classList.add('bg-blue', 'border', 'p-3', 'w-50');
        messageParagraph.textContent = message;
    
        messageDiv.appendChild(messageParagraph);
        messagesList.appendChild(messageDiv);
        
        ws.send(message);
        messageInput.value = '';
    }
    
    ws.onmessage = function(event) {
        const message = event.data;
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('row', 'justify-content-end');

        const messageParagraph = document.createElement('p');
        messageParagraph.classList.add('bg-white', 'border', 'p-3', 'w-50');
        
        messageParagraph.textContent = message;
    
        messageDiv.appendChild(messageParagraph);
        messagesList.appendChild(messageDiv);

        // Enviar el mensaje a la ruta /speak para reproducirlo
        fetch('/speak', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                'text': message
            })
        })
        .then(response => response.text())
        .then(data => {
            console.log(data);
        })
        .catch(error => {
            console.error('Error:', error);
        });
    };
}
