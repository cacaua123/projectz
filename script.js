const camera = document.getElementById("camera");
const canvas = document.getElementById("detectionCanvas");
const ctx = canvas.getContext("2d");

const clock = document.getElementById("clock");
const message = document.getElementById("message");
const objectsCounter = document.getElementById("objects");

let model;


// ============================
// CÂMERA
// ============================

async function startCamera() {

    try {

        const stream = await navigator.mediaDevices.getUserMedia({
            video: {
                width: 1280,
                height: 720
            },
            audio: false
        });

        camera.srcObject = stream;

        await new Promise(resolve => {
            camera.onloadedmetadata = resolve;
        });

        canvas.width = camera.videoWidth;
        canvas.height = camera.videoHeight;

        speak("Sistema iniciado.");

        loadAI();

    } catch (error) {

        console.error(error);

        message.textContent = "ERRO NA CAMERA";

    }

}


// ============================
// CARREGAR IA
// ============================

async function loadAI() {

    message.textContent = "CARREGANDO IA...";

    console.log("Carregando modelo...");

    model = await cocoSsd.load();

    console.log("Modelo carregado!");

    message.textContent = "IA ONLINE";

    speak("Inteligência artificial online.");

    detectObjects();

}


// ============================
// DETECÇÃO
// ============================

async function detectObjects() {

    const predictions = await model.detect(camera);

    drawDetections(predictions);

    requestAnimationFrame(detectObjects);

}


// ============================
// DESENHAR OBJETOS
// ============================

function drawDetections(predictions) {

    ctx.clearRect(
        0,
        0,
        canvas.width,
        canvas.height
    );

    let validObjects = 0;

    predictions.forEach(prediction => {

        if (prediction.score < 0.55) return;

        validObjects++;

        const [
            x,
            y,
            width,
            height
        ] = prediction.bbox;

        ctx.strokeStyle = "#00eaff";

        ctx.lineWidth = 3;

        ctx.strokeRect(
            x,
            y,
            width,
            height
        );

        ctx.font = "20px Arial";

        ctx.fillStyle = "#00eaff";

        const text =
            `${prediction.class} ${Math.round(prediction.score * 100)}%`;

        ctx.fillText(
            text,
            x,
            y - 8
        );

    });

    objectsCounter.textContent = validObjects;

}


// ============================
// RELÓGIO
// ============================

function updateClock() {

    const now = new Date();

    const hours =
        String(now.getHours()).padStart(2, "0");

    const minutes =
        String(now.getMinutes()).padStart(2, "0");

    const seconds =
        String(now.getSeconds()).padStart(2, "0");

    clock.textContent =
        `${hours}:${minutes}:${seconds}`;

}

setInterval(updateClock, 1000);

updateClock();


// ============================
// VOZ
// ============================

function speak(text) {

    const speech =
        new SpeechSynthesisUtterance(text);

    speech.lang = "pt-BR";

    speech.rate = 1;

    speech.pitch = 1;

    window.speechSynthesis.speak(speech);

}


// ============================
// INICIAR
// ============================

startCamera();