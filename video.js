document.getElementById("ai").addEventListener("change", toggleAi)
document.getElementById("fps").addEventListener("input", changeFps)

const video = document.getElementById("video");
const c1 = document.getElementById('c1');
const ctx1 = c1.getContext('2d');

let cameraAvailable = false;
let aiEnabled = false;
let fps = 16;

const facingMode = "environment";
const constraints = {
    audio: false,
    video: {
        facingMode: facingMode
    }
};

window.onload = function () {
    requestCameraPermission();
}

function requestCameraPermission() {
    navigator.mediaDevices.getUserMedia(constraints)
        .then(function (stream) {
            cameraAvailable = true;
            video.srcObject = stream;

            video.onloadedmetadata = () => {
                video.play();
                setResolution();
                timerCallback(); // Start frame drawing once video metadata is loaded
                document.getElementById("loadingText").style.display = "none";
                document.getElementById("ai").disabled = false;
            };
        })
        .catch(function (err) {
            cameraAvailable = false;
            console.error("Camera error:", err);
            if (err.name === "NotAllowedError") {
                document.getElementById("loadingText").innerText = "Camera permission is required to use this app.";
            } else if (err.name === "NotFoundError") {
                document.getElementById("loadingText").innerText = "No camera device found.";
            } else {
                document.getElementById("loadingText").innerText = "Camera access error. Please refresh.";
            }
        });
}

function timerCallback() {
    if (isReady()) {
        ctx1.save();
        ctx1.scale(-1, 1); // Flip horizontally
        ctx1.drawImage(video, -c1.width, 0, c1.width, c1.height);
        ctx1.restore();

        if (aiEnabled) {
            ai();
        }
    }
    setTimeout(timerCallback, fps);
}

function isReady() {
    return modelIsLoaded && cameraAvailable && video.readyState >= 2;
}

function setResolution() {
    // Make canvas match video resolution
    const width = video.videoWidth;
    const height = video.videoHeight;

    if (width && height) {
        c1.width = width;
        c1.height = height;
    }
}

function toggleAi() {
    aiEnabled = document.getElementById("ai").checked;
}

function changeFps() {
    fps = 1000 / document.getElementById("fps").value;
}

function ai() {
    objectDetector.detect(c1, (err, results) => {
        if (err) {
            console.error("Detection error:", err);
            return;
        }

        for (let i = 0; i < results.length; i++) {
            const item = results[i];
            ctx1.font = "15px Arial";
            ctx1.fillStyle = "red";
            ctx1.fillText(item.label + " - " + (item.confidence * 100).toFixed(2) + "%", item.x + 10, item.y + 15);
            ctx1.beginPath();
            ctx1.strokeStyle = "red";
            ctx1.rect(item.x, item.y, item.width, item.height);
            ctx1.stroke();
        }
    });
}
