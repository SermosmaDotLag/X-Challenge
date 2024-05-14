function initializeChat() {
    // Establece una conexión WebSocket con el servidor en el puerto 3000 del localhost
    const ws = new WebSocket('ws://localhost:3000');

    // Función de manejo de errores para la conexión WebSocket
    ws.onerror = function(event) {
        console.error('WebSocket error:', event);
    };

    // Obtiene referencias a los elementos del DOM necesarios
    const messageInput = document.getElementById('messageInput'); // Campo de entrada de mensajes
    const messagesList = document.getElementById('messages'); // Lista de mensajes
    let fromForm = false; // Bandera para controlar si el mensaje se envió desde el formulario

    // Obtiene referencia al formulario de envío de mensajes y agrega un event listener para manejar su envío
    const messageForm = document.getElementById('messageForm');
    messageForm.addEventListener('submit', (event) => {
        event.preventDefault(); // Evita que el formulario se envíe automáticamente
        const message = messageInput.value; // Obtiene el contenido del campo de entrada de mensajes
        sendMessage(message); // Llama a la función sendMessage para enviar el mensaje
    });

    // Función para enviar un mensaje al servidor WebSocket
    function sendMessage(message) {
        const messageDiv = document.createElement('div'); // Crea un nuevo div para el mensaje
        messageDiv.classList.add('row', 'justify-content-end'); // Agrega clases CSS al div

        const messageParagraph = document.createElement('p'); // Crea un nuevo párrafo para el mensaje
        messageParagraph.classList.add('bg-blue', 'border', 'p-3', 'w-50', 'rounded-pill'); // Agrega clases CSS al párrafo
        messageParagraph.textContent = message; // Establece el contenido del párrafo como el mensaje

        messageDiv.appendChild(messageParagraph); // Agrega el párrafo al div
        messagesList.appendChild(messageDiv); // Agrega el div a la lista de mensajes en la interfaz

        // Establece la bandera fromForm a true antes de enviar el mensaje para marcar que proviene del formulario
        fromForm = true;
        ws.send(message); // Envía el mensaje al servidor a través de WebSocket
        messageInput.value = ''; // Limpia el campo de entrada de mensajes después de enviar el mensaje
    }
    
    // Event listener para manejar los mensajes recibidos del servidor a través de WebSocket
    ws.onmessage = function(event) {
        const message = event.data; // Obtiene el mensaje recibido del evento
        
        // Verifica si el mensaje proviene del formulario de mensaje
        if (!fromForm) {
            // Crea un nuevo div y un nuevo párrafo para mostrar el mensaje recibido en la interfaz
            const messageDiv = document.createElement('div');
            messageDiv.classList.add('row', 'justify-content-end');
        
            const messageParagraph = document.createElement('p');
            messageParagraph.classList.add('bg-white', 'border', 'p-3', 'w-50', 'rounded-pill');
            messageParagraph.textContent = message;
        
            messageDiv.appendChild(messageParagraph); // Agrega el párrafo al div
            messagesList.appendChild(messageDiv); // Agrega el div a la lista de mensajes en la interfaz
        }
        
        // Restablece la bandera fromForm a false después de procesar el mensaje
        fromForm = false;
    };
}
