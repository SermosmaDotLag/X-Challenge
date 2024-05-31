let model, webcam, labelContainer, maxPredictions;
let lastDetectedObject = '';
let letters = ["A","B","C","NONE","CH","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","S","T","U / V","W","X","Y","Z"];
let detections = {};
let lastDetectedLetter = '';
let detectionTimeout;

// Inicializar las claves del objeto 'detections' con arrays vacíos para cada letra
letters.forEach(letter => {
    detections[letter] = [];
});

async function init() {
    const modelURL = 'model.json'; // URL del modelo
    const metadataURL = 'metadata.json'; // URL de los metadatos

    // Carga el modelo y los metadatos de Teachable Machine
    model = await tmImage.load(modelURL, metadataURL);
    maxPredictions = model.getTotalClasses(); // Obtiene el número total de clases del modelo

    // Configuración de la cámara web
    const flip = true; // Invertir la imagen horizontalmente
    webcam = new tmImage.Webcam(390, 240, flip); // Inicializa la webcam con el tamaño especificado
    await webcam.setup(); // Configura la webcam
    await webcam.play(); // Inicia la transmisión de la webcam
    window.requestAnimationFrame(loop); // Comienza el bucle de predicción

    // Añade el canvas de la webcam al contenedor en el DOM
    document.getElementById("webcam-container").appendChild(webcam.canvas);
    labelContainer = document.getElementById("label-container"); // Contenedor para las etiquetas de predicción
    for (let i = 0; i < maxPredictions; i++) {
        labelContainer.appendChild(document.createElement("div")); // Crea un div para cada predicción
    }

    // Oculta el botón de inicio una vez que la cámara esté configurada
    document.getElementById("startButton").style.display = 'none';
}

// Función de bucle para actualizar la webcam y realizar predicciones continuamente
async function loop() {
    webcam.update(); // Actualiza la imagen de la webcam
    await predict(); // Realiza una predicción
    window.requestAnimationFrame(loop); // Solicita el próximo cuadro de animación
}

// Función para realizar predicciones utilizando el modelo
async function predict() {
    const prediction = await model.predict(webcam.canvas); // Realiza una predicción sobre el canvas de la webcam
    let detectedLetter = null; // Variable para almacenar la letra detectada

    for (let i = 0; i < maxPredictions; i++) {
        // Si la probabilidad de la predicción es mayor a 0.5, considera la predicción como válida
        if (prediction[i].probability > 0.5) {
            detectedLetter = prediction[i].className; // Obtiene el nombre de la clase predicha
            // Si la letra detectada está en la lista de letras y es diferente a la última letra detectada
            if (letters.includes(detectedLetter) && detectedLetter !== lastDetectedLetter) {
                detections[detectedLetter].push(detectedLetter); // Añade la letra detectada al objeto 'detections'
                const inputElement = document.getElementById("messageInput");
                inputElement.value += detectedLetter + ' '; // Añade la letra detectada al campo de entrada de mensaje
                lastDetectedLetter = detectedLetter; // Actualiza la última letra detectada
            }
            break;
        }
    }

    // Si no se detecta ninguna letra, establece un temporizador para enviar el mensaje después de 2 segundos
    if (detectedLetter === null) {
        clearTimeout(detectionTimeout);
        detectionTimeout = setTimeout(sendMessage, 2000); // Enviar mensaje después de 2 segundos sin detección
    }

    updateInterface(); // Actualiza la interfaz de usuario
}

// Función para enviar el mensaje
function sendMessage() {
    const inputElement = document.getElementById("messageInput");
    if (inputElement.value.trim() !== '') { // Verifica que el campo de entrada no esté vacío
        const event = new Event('submit'); // Crea un nuevo evento de tipo 'submit'
        document.getElementById('messageForm').dispatchEvent(event); // Despacha el evento de envío del formulario
        inputElement.value = ''; // Limpia el campo de entrada después de enviar el mensaje
    }
}

// Función para actualizar la interfaz de usuario con las detecciones
function updateInterface() {
    for (const key in detections) {
        if (detections.hasOwnProperty(key)) {
            const letters = detections[key].join(' '); // Junta las letras detectadas con un espacio
            const element = document.getElementById(key); // Obtiene el elemento del DOM correspondiente a la letra
            if (element) {
                element.innerText = letters; // Actualiza el texto del elemento con las letras detectadas
            }
        }
    }
}
