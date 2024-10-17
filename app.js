require('dotenv').config();
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const fs = require('fs');
const csvParser = require('csv-parser');
const { GoogleGenerativeAI } = require("@google/generative-ai");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse JSON bodies
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Initialize Google Generative AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY); // Use your API key from .env
const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
    generationConfig: {
        candidateCount: 1,
        stopSequences: ["x"],
        maxOutputTokens: 25,
        temperature: 0.0,
    },
});

let citiesList = [];  // To store the list of cities

// Function to load city data from the CSV file
function loadCitiesFromCSV() {
    fs.createReadStream('worldcities.csv')
        .pipe(csvParser())
        .on('data', (row) => {
            citiesList.push(row.city_ascii);  // Add the city name to the list
        })
        .on('end', () => {
            console.log(`Loaded ${citiesList.length} cities from CSV.`);
        })
        .on('error', (error) => {
            console.error('Error reading CSV file:', error);
        });
}

// Call the function to load cities from CSV when the server starts
loadCitiesFromCSV();

// Weather-related keywords
const weatherKeywords = ['weather', 'temperature', 'forecast', 'rain', 'sun', 'humidity', 'snow', 'wind'];

// Function to check if the message contains a city from the city list
function extractCityFromMessage(message) {
    const messageLowerCase = message.toLowerCase();
    const messageWords = messageLowerCase.split(/\s+/);

    // Find a matching city in the user's message
    const city = citiesList.find(city => messageWords.includes(city.toLowerCase()));
    // Debugging: log the extracted city
    console.log("Extracted City:", city);

    return city;
}

// Function to check if the message contains weather-related keywords
function containsWeatherKeywords(message) {
    const messageLowerCase = message.toLowerCase();
    return weatherKeywords.some(keyword => messageLowerCase.includes(keyword));
}

// Function to fetch weather data for a city using OpenWeather API
async function fetchWeatherData(city) {
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${process.env.OPEN_WEATHER_API_KEY}&units=metric`;
    const response = await fetch(url);
    const data = await response.json();
    if (data.cod !== 200) {
        throw new Error(data.message);
    }
    return `The weather in ${city}: ${data.weather[0].description}, Temperature: ${data.main.temp}°C, Humidity: ${data.main.humidity}%`;
}

// Serve the dashboard HTML file on the root route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});

// Endpoint to get environment variables
app.get('/api/config', (req, res) => {
    res.json({
        openWeatherApiKey: process.env.OPEN_WEATHER_API_KEY,
    });
});

// Route to handle chat messages
app.post('/chat', async (req, res) => {
    const userMessage = req.body.message;

    try {
        let botMessage;

        // Check if the message contains weather-related keywords
        if (containsWeatherKeywords(userMessage)) {
            const city = extractCityFromMessage(userMessage); // Extract city from the message

            if (city) {
                botMessage = await fetchWeatherData(city); // Fetch weather if a city is found
            } else {
                botMessage = 'Please specify a valid city to get the weather information.';
            }
        } else {
            // If no weather keywords, forward the message to Gemini model for a response
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

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
