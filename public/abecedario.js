let model, webcam, labelContainer, maxPredictions;
let lastDetectedObject = '';
let letters = ["A","B","C","NONE","CH","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","S","T","U / V","W","X","Y","Z"];
let detections = {};
let lastDetectedLetter = '';
let detectionTimeout;

// Inicializar las claves del objeto 'detections'
letters.forEach(letter => {
    detections[letter] = [];
});

async function init() {
    const modelURL = 'model.json';
    const metadataURL = 'metadata.json';

    model = await tmImage.load(modelURL, metadataURL);
    maxPredictions = model.getTotalClasses();

    const flip = true;
    webcam = new tmImage.Webcam(390, 240, flip);
    await webcam.setup();
    await webcam.play();
    window.requestAnimationFrame(loop);

    document.getElementById("webcam-container").appendChild(webcam.canvas);
    labelContainer = document.getElementById("label-container");
    for (let i = 0; i < maxPredictions; i++) {
        labelContainer.appendChild(document.createElement("div"));
    }

    // Ocultar el botón de inicio
    document.getElementById("startButton").style.display = 'none';
}

async function loop() {
    webcam.update();
    await predict();
    window.requestAnimationFrame(loop);
}

async function predict() {
    const prediction = await model.predict(webcam.canvas);
    let detectedLetter = null;

    for (let i = 0; i < maxPredictions; i++) {
        if (prediction[i].probability > 0.5) {
            detectedLetter = prediction[i].className;
            if (letters.includes(detectedLetter) && detectedLetter !== lastDetectedLetter) {
                detections[detectedLetter].push(detectedLetter);
                const inputElement = document.getElementById("messageInput");
                inputElement.value += detectedLetter + ' ';
                lastDetectedLetter = detectedLetter;
            }
            break;
        }
    }

    if (detectedLetter === null) {
        clearTimeout(detectionTimeout);
        detectionTimeout = setTimeout(sendMessage, 2000); // Enviar mensaje después de 2 segundos sin detección
    }

    updateInterface();
}

function sendMessage() {
    const inputElement = document.getElementById("messageInput");
    if (inputElement.value.trim() !== '') {
        const event = new Event('submit');
        document.getElementById('messageForm').dispatchEvent(event);
        inputElement.value = ''; // Limpia el campo de entrada después de enviar el mensaje
    }
}

function updateInterface() {
    for (const key in detections) {
        if (detections.hasOwnProperty(key)) {
            const letters = detections[key].join(' ');
            const element = document.getElementById(key);
            if (element) {
                element.innerText = letters;
            }
        }
    }
}
