function initializeChat() {
    const ws = new WebSocket('ws://localhost:3000');

    ws.onerror = function(event) {
        console.error('WebSocket error:', event);
    };

    const messageInput = document.getElementById('messageInput');
    const messagesList = document.getElementById('messages');
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

        fromForm = false;
    };
}
