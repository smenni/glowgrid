const ftClient = require('./ft-client');
const { createCanvas } = require('canvas');
const canvasSketch = require('canvas-sketch');
const math = require('canvas-sketch-util/math');
const random = require('canvas-sketch-util/random');
const risoColors = require('riso-colors');
const Color = require('canvas-sketch-util/color');

const canvas = createCanvas();
const context = canvas.getContext('2d');

canvas.width = LED_WIDTH = 196;
canvas.height = LED_HEIGHT = 128;
const PORT = 1337
const HOSTNAME = '192.168.86.49'
const STEP = 10;
const RANDOMNESS = 60;

const ledClient = new ftClient(context, HOSTNAME, PORT, LED_WIDTH, LED_HEIGHT);


let increment = 0;
const seedArray = ['030983', '220383', '070818', '123456', '654321'];
let colorSpace = 120;

/*
*  Draws a series of randomized lines on the canvas
*/
function drawLines() {
    context.clearRect(0, 0, canvas.width, canvas.height);

    const lines = [];

    let i, j;

    // Generate random lines based on step size and randomness
    for (i = 0; i <= canvas.height; i += STEP) {
        const line = [];
        for (j = 0; j <= canvas.width; j += STEP) {
            const horizontalRandomness = j > canvas.width / 2 ? canvas.width - j : j;
            const rand = Math.random() * RANDOMNESS * horizontalRandomness / canvas.width;
            line.push({ x: j, y: i + rand });
        }
        lines.push(line);
    }

    // Draw the generated lines on the canvas
    for (i = 0; i < lines.length; i++) {
        context.beginPath();
        context.moveTo(lines[i][0].x, lines[i][0].y);
        for (j = 0; j < lines[i].length; j++) {
            context.lineTo(lines[i][j].x, lines[i][j].y);
        }
        context.strokeStyle = `hsl(${STEP *
            i /
            canvas.height *
            colorSpace}, 100%, 50%)`;
        context.stroke();
    }

    // Increment the hue space for the next drawing
    colorSpace += 20;

    // Prepare for displaying and send to canvas
    draw(context);
}

/**
 * Draws a skewed rectangle on the canvas.
 * 
 * @param {Object} params - Drawing parameters.
 * @param {number} params.w - Width of the rectangle.
 * @param {number} params.h - Height of the rectangle.
 * @param {number} params.degrees - Skew degree.
 */
const drawSkewedRect = ({ context, w = LED_WIDTH, h = LED_HEIGHT, degrees = -45 }) => {
    const angle = math.degToRad(degrees);
    const rx = Math.cos(angle) * w;
    const ry = Math.sin(angle) * w;

    // Adjust context to the skewed position
    context.save();
    context.translate(rx * -0.5, (ry + h) * -0.5);

    // Draw the skewed rectangle
    context.beginPath();
    context.moveTo(0, 0);
    context.lineTo(rx, ry);
    context.lineTo(rx, ry + h);
    context.lineTo(0, h);
    context.closePath();
    context.stroke();

    // Restore the context to its original state
    context.restore();
}

/**
 * Draws a polygon on the canvas based on a specified radius and number of sides.
 * 
 * @param {Object} params - Drawing parameters.
 * @param {number} params.radius - Radius of the polygon.
 * @param {number} params.sides - Number of sides of the polygon.
 */
const drawPolygon = ({ context, radius = 20, sides = 3 }) => {
    const slice = Math.PI * 2 / sides;

    context.beginPath();
    context.moveTo(0, -radius + 20); //hardcoded 

    for (let i = 1; i < sides; i++) {
        const theta = i * slice - Math.PI * 0.5;
        context.lineTo(Math.cos(theta) * radius, Math.sin(theta) * radius);
    }

    context.closePath();
};


function draw(context) {

    // Go through the seedArray
    increment = (increment < seedArray.length - 1) ? increment + 1 : 0;

    seed = seedArray[increment];
    random.setSeed(seed);

    const width = LED_WIDTH;
    const height = LED_HEIGHT;
    const num = 40;
    const degrees = -30;
    const rects = [];

    const rectColors = [random.pick(risoColors), random.pick(risoColors)];
    const bgColor = random.pick(risoColors).hex;

    const mask = {
        radius: width * 0.4,
        sides: 3,
        x: width * 0.5,
        y: height * 0.58,
    }

    // Create rectangles
    for (let i = 0; i < num; i++) {
        rects.push({
            x: random.range(0, width),
            y: random.range(0, height),
            w: random.range(10, width),
            h: random.range(10, 50),
            fill: random.pick(rectColors).hex,
            stroke: random.pick(rectColors).hex,
            blend: (random.value() > 0.5) ? 'overlay' : 'source-over'
        });
    }

    // Draw triangle background
    context.fillStyle = bgColor;
    context.fillRect(0, 0, width, height);

    // Draw and clip inside the triangle
    context.save();
    context.translate(mask.x, mask.y);
    drawPolygon({ context, radius: mask.radius, sides: mask.sides });
    context.clip();

    // Draw rectangles on the canvas
    rects.forEach(rect => {
        const { x, y, w, h, fill, stroke, blend } = rect;

        context.save();
        context.translate(-mask.x, -mask.y);
        context.translate(x, y);
        context.strokeStyle = stroke;
        context.fillStyle = fill;
        context.lineWidth = 10;

        context.globalCompositeOperation = blend;
        drawSkewedRect({ context, w, h, degrees });

        const shadowColor = Color.offsetHSL(fill, 0, 0, -20);
        shadowColor.rgba[3] = 0.5;

        context.shadowColor = Color.style(shadowColor.rgba);
        context.shadowOffsetX = -1;
        context.shadowOffsetY = 20;

        context.fill();
        context.shadowColor = null;
        context.stroke();
        context.globalCompositeOperation = 'source-over';
        context.lineWidth = 2;
        context.strokeStyle = 'black';
        context.stroke();

        context.restore();
    });

    context.restore();

    // Draw polygon outline
    context.save();
    context.translate(mask.x, mask.y);
    drawPolygon({ context, radius: mask.radius - context.lineWidth, sides: mask.sides });
    context.globalCompositeOperation = 'color-burn';
    context.lineWidth = 5;
    context.strokeStyle = rectColors[0].hex;
    context.stroke();
    context.restore();

    ledClient.copyToBuffer(context);
}

setInterval(drawLines, 2000);
