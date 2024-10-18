require('dotenv').config();
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const fs = require('fs');
const csvParser = require('csv-parser');
const { GoogleGenerativeAI } = require("@google/generative-ai");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Initializing Gemini model
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
    generationConfig: {
        candidateCount: 1,
        stopSequences: ["x"],
        maxOutputTokens: 25,
        temperature: 0.0,
    },
});

let citiesList = [];

function loadCitiesFromCSV() {
    fs.createReadStream('worldcities.csv')
        .pipe(csvParser())
        .on('data', (row) => {
            citiesList.push(row.city_ascii);
        })
        .on('end', () => {
            console.log(`Loaded ${citiesList.length} cities from CSV.`);
        })
        .on('error', (error) => {
            console.error('Error reading CSV file:', error);
        });
}

loadCitiesFromCSV();

const weatherKeywords = ['weather', 'temperature', 'forecast', 'rain', 'sun', 'humidity', 'snow', 'wind'];

function findCityInMessage(message) {
    const messageLowerCase = message.toLowerCase();
    const messageWords = messageLowerCase.split(/\s+/);
    const city = citiesList.find(city => messageWords.includes(city.toLowerCase()));
    console.log("Extracted City:", city);
    return city;
}

function containsWeatherKeywords(message) {
    const messageLowerCase = message.toLowerCase();
    return weatherKeywords.some(keyword => messageLowerCase.includes(keyword));
}

async function fetchWeatherData(city) {
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${process.env.OPEN_WEATHER_API_KEY}&units=metric`;
    const response = await fetch(url);
    const data = await response.json();
    if (data.cod !== 200) {
        throw new Error(data.message);
    }
    return `The weather in ${city}: ${data.weather[0].description}, Temperature: ${data.main.temp}°C, Humidity: ${data.main.humidity}%`;
}

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});

// Config API for client side API access
app.get('/api/config', (req, res) => {
    res.json({
        openWeatherApiKey: process.env.OPEN_WEATHER_API_KEY,
    });
});

// Post method for ChatBot
app.post('/chat', async (req, res) => {
    const userMessage = req.body.message;

    try {
        let botMessage;

        if (containsWeatherKeywords(userMessage)) {
            const city = findCityInMessage(userMessage);

            if (city) {
                botMessage = await fetchWeatherData(city);
            } else {
                botMessage = 'Please specify a valid city to get the weather information.';
            }
        } else {
            const chat = model.startChat();
            let result = await chat.sendMessage(`Please respond in no more than 15 words: ${userMessage}`);
            botMessage = result.response ? result.response.text() : "No response";
        }

        res.json({ message: botMessage });
    } catch (error) {
        console.error("Error during chat interaction:", error);
        res.status(500).json({ error: "Error during chat interaction." });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
