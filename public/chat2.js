function initializeChat() {
    // Inicializa una conexión WebSocket a la dirección especificada
    const ws = new WebSocket('ws://localhost:3000');
    // Genera un ID único para el cliente
    const clientId = Math.random().toString(36).substr(2, 9);

    // Maneja errores del WebSocket
    ws.onerror = function(event) {
        console.error('WebSocket error:', event);
    };

    // Obtiene referencias a los elementos del DOM
    const messageInput = document.getElementById('messageInput');
    const messagesList = document.getElementById('messages');
    let fromForm = false;  // Bandera para indicar si el mensaje proviene del formulario

    // Maneja el envío del formulario de mensajes
    const messageForm = document.getElementById('messageForm');
    messageForm.addEventListener('submit', (event) => {
        event.preventDefault();  // Previene el comportamiento predeterminado del formulario
        const message = messageInput.value;  // Obtiene el valor del campo de entrada de mensaje
        sendMessage(message);  // Envía el mensaje
    });

    // Función para enviar mensajes
    function sendMessage(message) {
        const fullMessage = `${clientId}##${message}`;  // Construye el mensaje con el ID del cliente
        const messageDiv = document.createElement('div');  // Crea un nuevo div para el mensaje
        messageDiv.classList.add('row', 'justify-content-end');  // Agrega clases CSS al div

        const messageParagraph = document.createElement('p');  // Crea un nuevo párrafo para el mensaje
        messageParagraph.classList.add('bg-blue', 'border', 'p-3', 'w-50', 'rounded-pill');  // Agrega clases CSS al párrafo
        messageParagraph.textContent = message;  // Establece el texto del párrafo como el mensaje

        messageDiv.appendChild(messageParagraph);  // Agrega el párrafo al div
        messagesList.appendChild(messageDiv);  // Agrega el div a la lista de mensajes

        fromForm = true;  // Indica que el mensaje proviene del formulario
        ws.send(fullMessage);  // Envía el mensaje completo a través del WebSocket
        messageInput.value = '';  // Limpia el campo de entrada de mensaje
    }

    // Maneja la recepción de mensajes del WebSocket
    ws.onmessage = function(event) {
        const message = event.data;  // Obtiene el mensaje recibido
        const [senderId, actualMessage] = message.split('##');  // Separa el ID del remitente y el mensaje real

        // Si el mensaje no proviene del propio cliente
        if (senderId !== clientId) {
            const messageDiv = document.createElement('div');  // Crea un nuevo div para el mensaje recibido
            messageDiv.classList.add('row', 'justify-content-end');  // Agrega clases CSS al div

            const messageParagraph = document.createElement('p');  // Crea un nuevo párrafo para el mensaje recibido
            messageParagraph.classList.add('bg-white', 'border', 'p-3', 'w-50', 'rounded-pill');  // Agrega clases CSS al párrafo
            messageParagraph.textContent = actualMessage;  // Establece el texto del párrafo como el mensaje recibido

            messageDiv.appendChild(messageParagraph);  // Agrega el párrafo al div
            messagesList.appendChild(messageDiv);  // Agrega el div a la lista de mensajes
        }

        fromForm = false;  // Reinicia la bandera de mensaje del formulario
    };
}
