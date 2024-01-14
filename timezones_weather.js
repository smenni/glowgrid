const { createCanvas } = require('canvas');
const { DateTime } = require('luxon');
const WeatherEmoji = require('./weather-emoji');
require('dotenv').config(); // Using local environment variables, not required for running in replit
const canvas = createCanvas();
const context = canvas.getContext('2d');
canvas.width = LED_WIDTH = 196;
canvas.height = LED_HEIGHT = 128;


const ftClient = require('./ft-client');
const { configDotenv } = require('dotenv');
const PORT = 1337;
const HOSTNAME = '192.168.86.41';
const ledClient = new ftClient(context, HOSTNAME, PORT, LED_WIDTH, LED_HEIGHT);
let zrhWeather = '?';
let bosWeather = '?';
let sfoWeather = '?';

const screenSaver = true;

getWeather();

function getWeather()  {
    const weatherEmoji = new WeatherEmoji(process.env.OPENWEATHER_API_KEY);

    weatherEmoji.getWeather('zug, switzerland', true)
    .then(data => {
        console.log('Weather in zug: ' , data.emoji);
        zrhWeather = data.emoji;
    })
    .catch(err => {
        console.error('Error fetching ZUG weather:', err);
    });

    weatherEmoji.getWeather('boston', true)
    .then(data => {
        console.log('Weather in Boston: ' , data.emoji);
        bosWeather = data.emoji;
    })
    .catch(err => {
        console.error('Error fetching BOS weather:', err);
    }
    );

    weatherEmoji.getWeather('San Francisco', true)
    .then(data => {
        console.log('Weather in San Francisco: ' , data.emoji);
        sfoWeather = data.emoji;
    })
    .catch(err => {
        console.error('Error fetching SFO weather:', err);
    }
    );
}

function drawTime() {

    // Clear the canvas
    context.clearRect(0, 0, canvas.width, canvas.height);

    // Get the times for Zurich, Boston and Zurich and Format them as HH:MM
    const localTime = DateTime.local().setZone('Europe/Zurich');

    // create a screen saver that doesn't render anything if time is past a specific hour
    if (screenSaver && (localTime.hour >= 19 || localTime.hour <= 8)) 
        return;


    const localTimeStr = "ZUG " + localTime.toFormat('HH:mm') + "  " + zrhWeather;

    const bostonTime = DateTime.local().setZone('America/New_York');
    const bostonTimeStr = "BOS " + bostonTime.toFormat('HH:mm') + "  " + bosWeather;

    const sanFranciscoTime = DateTime.local().setZone('America/Los_Angeles');
    const sanFranciscoTimeStr = "SFO " + sanFranciscoTime.toFormat('HH:mm') + "  " + sfoWeather;

    // define colors for each zone with rgb to be used for fill style
    
    //zrhRGB = 'rgb(160, 0, 30)';
    zrhRGB = 'olive';
    bostonRGB = 'grey' //'purple' // 'rgb(255, 0, 0)';
    sanFranciscoRGB = 'rgb(0, 70, 140)';

    context.fillStyle = zrhRGB;
    context.font = '20px Arial';
    context.fillText(localTimeStr, 30, 30);    // Adjust positioning as needed
    
    context.fillStyle = bostonRGB;
    context.font = '20px Arial';
    context.fillText(bostonTimeStr, 30, 70);   // Adjust positioning as needed

    context.fillStyle = sanFranciscoRGB;
    context.font = '20px Arial';
    context.fillText(sanFranciscoTimeStr, 30, 110);   // Adjust positioning as needed

    ledClient.copyToBuffer(context);
}

// Update every second
setInterval(drawTime, 1000);
