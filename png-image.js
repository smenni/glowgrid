const { createCanvas, loadImage } = require('canvas');
const canvas = createCanvas();
const context = canvas.getContext('2d');
canvas.width = LED_WIDTH = 196;  
canvas.height = LED_HEIGHT = 128;

const ftClient = require('./ft-client');
const PORT = 1337;
const HOSTNAME = '192.168.86.49';
const ledClient = new ftClient(context, HOSTNAME, PORT, LED_WIDTH, LED_HEIGHT);

class PNGDisplayer {
    constructor(filePath) {
        this.filePath = filePath;
    }

    async display() {
        context.clearRect(0, 0, canvas.width, canvas.height);
        
        const image = await loadImage(this.filePath);
        
        // Resize the image to fit the canvas if necessary.
        const targetWidth = Math.min(canvas.width, image.width);
        const targetHeight = Math.min(canvas.height, image.height);
        
        context.drawImage(image, 0, 0, targetWidth, targetHeight);

        context.save();

        ledClient.copyToBuffer(context);
    }
}

// Use the class
const pngDisplayer = new PNGDisplayer('images/zelda.png');
pngDisplayer.display();
