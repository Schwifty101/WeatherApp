// This server file works exactly the same but fetches data from API
// PAY UP BUDDY CUZ API AINT FREE

require('dotenv').config();
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
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
let totalFetchedCities = 0;
let totalCities = 0; // Total number of cities available from API
const limit = 100;   // Number of cities to fetch in one request

// Function to bulk fetch all cities from RapidGeoDB API
async function bulkFetchAllCities() {
    let offset = 0;
    let moreCitiesToFetch = true;

    while (moreCitiesToFetch) {
        const success = await fetchCityData(offset);

        if (!success) break; // Stop if there's an error in the API call

        offset += limit; // Increment offset to get the next batch of cities
        moreCitiesToFetch = totalFetchedCities < totalCities; // Continue fetching until all cities are retrieved
    }

    console.log(`Successfully fetched ${totalFetchedCities} cities in total.`);
}

// Fetch a batch of city data with an offset
async function fetchCityData(offset = 0) {
    const apiKey = process.env.RAPIDAPI_API_KEY; // Your API key
    const url = `https://wft-geo-db.p.rapidapi.com/v1/geo/cities?limit=${limit}&offset=${offset}`;

    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'x-rapidapi-key': apiKey,
                'x-rapidapi-host': 'wft-geo-db.p.rapidapi.com'
            }
        });
        const data = await response.json();

        if (data && data.data) {
            citiesList = citiesList.concat(data.data.map(city => city.city)); // Append new cities
            totalFetchedCities += data.data.length;

            if (data.metadata && data.metadata.totalCount) {
                totalCities = data.metadata.totalCount; // Update the total number of cities available
            }

            console.log(`Fetched ${data.data.length} cities (Offset: ${offset}). Total fetched: ${totalFetchedCities}`);
            return true;
        } else {
            console.error("Error fetching city data:", data);
            return false;
        }
    } catch (error) {
        console.error("Error fetching city data from RapidGeoDB:", error);
        return false;
    }
}

// Call the bulkFetchAllCities function on server startup to populate the city list
bulkFetchAllCities();

// Weather-related keywords
const weatherKeywords = ['weather', 'temperature', 'forecast', 'rain', 'sun', 'humidity', 'snow', 'wind'];

// Function to check if the message contains a city from the fetched city list
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