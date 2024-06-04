function initializeChat() {
    const ws = new WebSocket('ws://localhost:3000');

    ws.onerror = function(event) {
        console.error('WebSocket error:', event);
    };

    const messageInput = document.getElementById('messageInput');
    const messagesList = document.getElementById('messages');
    const gifContainer = document.getElementById('gifContainer'); // Contenedor para mostrar gifs

    let fromForm = false;

    const messageForm = document.getElementById('messageForm');
    messageForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const message = messageInput.value;
        sendMessage(message);
    });

    function sendMessage(message) {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('row', 'justify-content-end');

        const messageParagraph = document.createElement('p');
        messageParagraph.classList.add('bg-blue', 'border', 'p-3', 'w-50', 'rounded-pill');
        messageParagraph.textContent = message;

        messageDiv.appendChild(messageParagraph);
        messagesList.appendChild(messageDiv);

        fromForm = true;
        ws.send(message);
        messageInput.value = '';
    }
    
    ws.onmessage = function(event) {
        const message = event.data;

        if (!fromForm) {
            const messageDiv = document.createElement('div');
            messageDiv.classList.add('row', 'justify-content-end');
        
            const messageParagraph = document.createElement('p');
            messageParagraph.classList.add('bg-white', 'border', 'p-3', 'w-50', 'rounded-pill');
            messageParagraph.textContent = message;
        
            messageDiv.appendChild(messageParagraph);
            messagesList.appendChild(messageDiv);

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
        }

        gifContainer.innerHTML = '';

        // Iterar sobre cada letra del mensaje
        for (let i = 0; i < message.length; i++) {
            const letter = message[i].toUpperCase();
        
            let gifSrc = '';
            if (letter === 'U' || letter === 'V') {
                gifSrc = 'gifs/UV.gif'; // Si la letra es U, O o V, asigna el gif "UV.gif"
            } else {
                gifSrc = `gifs/${letter}.gif`; // De lo contrario, asigna el gif correspondiente a la letra
            }
        
            const gif = document.createElement('img');
            gif.src = gifSrc;
            gif.alt = letter;
            gif.style.width = '200px';
        
            setTimeout(() => {
                gifContainer.appendChild(gif);
            }, 1000 * i);
        
            setTimeout(() => {
                gifContainer.removeChild(gif);
            }, 1000 * (i + 1));
        }

        fromForm = false;
    };
}
