const { createCanvas } = require('canvas');
const ftClient = require('./ft-client');

const canvas = createCanvas();
const context = canvas.getContext('2d');
context.globalAlpha = 0.5;

const LED_HEIGHT = 128;
const LED_WIDTH = 196;
const PORT = 1337;
const HOSTNAME = '192.168.86.49';
const ledClient = new ftClient(context, HOSTNAME, PORT, LED_WIDTH, LED_HEIGHT);

canvas.height = LED_HEIGHT;
canvas.width = LED_WIDTH;

function generateColor() {
    let hexSet = "0123456789ABCDEF";
    let finalHexString = "#";
    for (let i = 0; i < 6; i++) {
        finalHexString += hexSet[Math.ceil(Math.random() * 15)];
    }
    return finalHexString;
}

function generateParticles(amount, yOffset) {
    const particles = [];
    for (let i = 0; i < amount; i++) {
        particles.push(new Particle(
            Math.random() * LED_WIDTH,
            yOffset + (Math.random() * LED_HEIGHT / 3),
            4,
            generateColor(),
            0.02
        ));
    }
    return particles;
}

function Particle(x, y, particleTrailWidth, strokeColor, rotateSpeed) {
    this.x = x;
    this.y = y;
    this.particleTrailWidth = particleTrailWidth;
    this.strokeColor = strokeColor;
    this.theta = Math.random() * Math.PI * 2;
    this.rotateSpeed = rotateSpeed;

    this.rotate = () => {
        const ls = { x: this.x, y: this.y };
        this.theta += this.rotateSpeed;
        this.x += Math.cos(this.theta);
        this.y += Math.sin(this.theta);
        context.beginPath();
        context.lineWidth = this.particleTrailWidth;
        context.strokeStyle = this.strokeColor;
        context.moveTo(ls.x, ls.y);
        context.lineTo(this.x, this.y);
        context.stroke();
    };
}

function updateTimeParticles() {
    const currentTime = new Date();
    const hours = currentTime.getHours();
    const minutes = currentTime.getMinutes();
    const seconds = currentTime.getSeconds();

    particlesArray = [
        ...generateParticles(hours, 0),        // Top third for hours
        ...generateParticles(minutes, LED_HEIGHT / 3), // Middle third for minutes
        ...generateParticles(seconds, (LED_HEIGHT / 3) * 2) // Bottom third for seconds
    ];
}

function anim() {
    requestAnimationFrame(anim);

    context.fillStyle = "rgba(0,0,0,0.05)";
    context.fillRect(0, 0, canvas.width, canvas.height);

    particlesArray.forEach((particle) => particle.rotate());

    ledClient.copyToBuffer(context);
}

function requestAnimationFrame(f) {
    setImmediate(() => f(Date.now()))
}

// Initialize and start animation
updateTimeParticles();
anim();

// Update time particles every second
setInterval(updateTimeParticles, 1000);
