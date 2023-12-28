const { createCanvas } = require('canvas');
const canvas = createCanvas();
const context = canvas.getContext('2d');
canvas.width = LED_WIDTH = 196;
canvas.height = LED_HEIGHT = 128;

const ftClient = require('./ft-client');
const PORT = 1337;
const HOSTNAME = '192.168.86.49';
const ledClient = new ftClient(context, HOSTNAME, PORT, LED_WIDTH, LED_HEIGHT);

let yellowPhase = false;

function getBostonTime() {
    const now = new Date();
    const utc = now.getTime() + now.getTimezoneOffset() * 60000;
    // Boston is UTC-6 or UTC-5 based on daylight saving time, but 
    // this will give an approximation. For accurate conversion, consider libraries like `luxon`.
    return new Date(utc + (3600000 * -4));
}

function drawTime() {

    // Clear the canvas
    context.clearRect(0, 0, canvas.width, canvas.height);

    const now = new Date();
    const bostonTime = getBostonTime();

    // Format the times as HH:MM:SS
    const localTimeStr = `ZRH ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    // :${String(now.getSeconds()).padStart(2, '0')}`;
    const bostonTimeStr = `BOS ${String(bostonTime.getHours()).padStart(2, '0')}:${String(bostonTime.getMinutes()).padStart(2, '0')}`;
    // :${String(bostonTime.getSeconds()).padStart(2, '0')}`;

    context.fillStyle = 'red';
    context.font = '30px Arial';
    context.fillText(localTimeStr, 25, 50);    // Adjust positioning as needed
    
    context.fillStyle = 'purple';
    context.font = '30px Arial';
    context.fillText(bostonTimeStr, 25, 100);   // Adjust positioning as needed

    ledClient.copyToBuffer(context);
}

// Function to fill the screen yellow
function fillYellow() {
    context.fillStyle = 'rgba(88, 24, 69, 1)'; // Soft yellow color
    context.fillRect(0, 0, canvas.width, canvas.height);
    ledClient.copyToBuffer(context);
}

// Schedule the changes
setInterval(() => {
    const now = new Date();
    const minutes = now.getMinutes();

    if (minutes % 30 < 10) {
        if (!yellowPhase) {
            yellowPhase = true;
            fillYellow();
        }
    } else {
        if (yellowPhase) {
            yellowPhase = false;
            drawTime();
        }
    }
}, 1000 * 60);  // Check every minute

// Also update the time every second if not in yellow phase
setInterval(() => {
    if (!yellowPhase) {
        drawTime();
    }
}, 1000);  // Update every second
