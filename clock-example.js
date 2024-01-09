const { createCanvas } = require('canvas');
const canvas = createCanvas();
const context = canvas.getContext('2d');
canvas.width = LED_WIDTH = 196;  
canvas.height = LED_HEIGHT = 128;

const ftClient = require('./ft-client');
const PORT = 1337;
const HOSTNAME = '192.168.86.41';
const ledClient = new ftClient(context, HOSTNAME, PORT, LED_WIDTH, LED_HEIGHT);

context.fillStyle = 'white';

const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// Helper function to get the best font size for a given string
function getMaxFontSizeForWidth(ctx, text, maxWidth) {
    let fontSize = 48; // starting value
    ctx.font = `${fontSize}px serif`;
    while (ctx.measureText(text).width > maxWidth && fontSize > 0) {
        fontSize -= 1;
        ctx.font = `${fontSize}px serif`;
    }
    return fontSize;
}

function displayTime() {
    context.clearRect(0, 0, canvas.width, canvas.height);
    
    const currentTime = new Date();
    const day = daysOfWeek[currentTime.getDay()];
    const hours = String(currentTime.getHours()).padStart(2, '0');
    const minutes = String(currentTime.getMinutes()).padStart(2, '0');
    const seconds = String(currentTime.getSeconds()).padStart(2, '0');
    const timeStr = `${hours}:${minutes}:${seconds}`;

    const optimalFontSizeForTime = getMaxFontSizeForWidth(context, timeStr, canvas.width - 20);
    context.font = `${optimalFontSizeForTime}px serif`;
    
    const dayXPosition = (canvas.width - context.measureText(day).width) / 2;
    context.fillText(day, dayXPosition, 40); // position for the day of the week, adjust as needed

    const timeXPosition = (canvas.width - context.measureText(timeStr).width) / 2;
    const timeYPosition = (canvas.height + optimalFontSizeForTime) / 2; // centering vertically

    context.fillText(timeStr, timeXPosition, timeYPosition);

    context.save();

    ledClient.copyToBuffer(context);
}

// Continuously update the displayed time
setInterval(displayTime, 1000);
