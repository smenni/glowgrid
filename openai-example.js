const { createCanvas } = require('canvas');
const axios = require('axios');
require('dotenv').config(); // Using local environment variables, not required for running in replit


const canvas = createCanvas();
const context = canvas.getContext('2d');
canvas.width = LED_WIDTH = 196;
canvas.height = LED_HEIGHT = 128;

const ftClient = require('./ft-client');
const PORT = 1337;
const HOSTNAME = '192.168.86.41';
const ledClient = new ftClient(context, HOSTNAME, PORT, LED_WIDTH, LED_HEIGHT);

const { Configuration, OpenAI } = require("openai");

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

async function fetchFunWords() {
    try {
        const completion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [{ 'role': 'user', 'content': 'Generate a sentence with no more than 15 words that is funny, slightly sarcastic and relates to the tech startup scene.' }],
        });
        return completion.choices[0].message.content;


    } catch (error) {
        res.status(500).json({ error: 'Error retrieving OpenAI results' });
        console.log(error)
    }
}

async function display(){
    context.clearRect(0, 0, canvas.width, canvas.height);

    const text = await fetchFunWords();
    
    // Split and display the text
    context.font = "20px serif";
    context.fillStyle = '#0f00ff';
    const lines = wrapText(context, text, canvas.width);
    let yPosition = 30;

    for (const line of lines) {
        console.log(line);

        context.fillText(line, 10, yPosition);
        yPosition += 22;

        if (yPosition > canvas.height) {
            break;  // Stop drawing if there's no more vertical space
        }
    }

    context.save();
    ledClient.copyToBuffer(context);
}

// Utility function to wrap text
function wrapText(ctx, text, maxWidth) {
    const words = text.split(' ');
    const lines = [];
    let currentLine = words[0];

    for (let i = 1; i < words.length; i++) {
        const word = words[i];
        const width = ctx.measureText(currentLine + " " + word).width;
        if (width < maxWidth) {
            currentLine += " " + word;
        } else {
            lines.push(currentLine);
            currentLine = word;
        }
    }
    lines.push(currentLine);
    return lines;
}

display();