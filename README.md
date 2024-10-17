
# Weather Forecast and Chat Integration Node.js Project

## Overview

This project is a **weather forecast application** combined with a **chat interface** for interacting with a bot. It allows users to retrieve weather data for any city using the OpenWeather API, view the results in a paginated table, and toggle between Celsius and Fahrenheit. The application also integrates a chatbot that provides responses based on user inputs.

The project is built with **Node.js** on the backend and uses **HTML**, **CSS**, **JavaScript**, and **Tailwind CSS** for the frontend. It features API integration with OpenWeather and a chatbot service (referred to as **Gemini** in the code).


## Features

### Weather Forecast:
- **Fetch Forecast**: Retrieve 5-day weather forecasts for a given city.
- **Toggle Units**: Switch between Celsius and Fahrenheit units.
- **Pagination**: View forecast results in pages, 5 results at a time.
- **Sort Temperatures**: Sort the forecast by ascending or descending temperature.
- **Rain Filter**: Filter forecasts to show only the days with rain.
- **Highest Temperature**: Identify the day with the highest temperature.
- **Additional Information**: Displays humidity, wind speed, and pressure for each day in the forecast.

### Chatbot Integration:
- **Chat Interface**: Users can send messages and receive responses from the bot.
- **Toggle Chat**: A chat widget that can be minimized or maximized.
- **Real Time Weather Queries:** The bot responds to user weather queries in real-time.

## Project Structure

```bash
.
├── /public
│   ├── /images
│   │   ├── profilePicture.jpeg    # Profile picture used in the frontend for dashboard
│   ├── /js
│   │   ├── dashboard.js           # handling logic for the dashboard interface
│   │   ├── tables.js              # displaying forecast data, sorting, and pagination
│   │   ├── script.js              # Chatbot functionality and Gemini chatbot integration
│   ├── tables.html                # HTML page for weather forecast table
│   ├── dashboard.html             # The main frontend HTML page with a dashboard
├── app.js                         # Server-side handling using CSV for fetching city data and processing
├── app2.js                        # Server-side handling using external API (OpenWeather) for fetching weather data
├── package.json                   # Project dependencies, metadata, and scripts for running the project
├── README.md                      # Project overview, structure, and setup instructions
├── Tailwind.config.js             # Configuration file for Tailwind CSS
├── worldcities.csv                # CSV for city data used for local data processing
```
### Key Files:

- **dashboard.html:**
    - The main UI for the weather application, integrating the weather display and chat interface.
    - Includes an input field for entering city names and a button to retrieve weather data.
    - Displays current weather conditions and a 5-day forecast in a visually structured format, with charts illustrating temperature trends.
- **dashboard.js:**
    - Manages interactions with the OpenWeather API, utilizing an API key to fetch and display weather forecast data.
    - Implements event listeners for user interactions, such as fetching weather data on button clicks or pressing the Enter key.
    - Handles cookie management to remember the last queried city, local storage to cache weather data, and dynamically updates the UI with weather information and charts.
    - Includes functions for error handling, formatting dates, and updating the UI based on weather conditions.

   
- **tables.html**:
   - This HTML document defines the structure and layout of the Weather Tables interface, including a sidebar navigation, input fields for city search, and a table for displaying the 5-day weather forecast. 
   - It incorporates Tailwind CSS for styling and includes scripts for handling dynamic functionalities.

- **tables.js**:
   - This JavaScript file manages the fetching, rendering, and manipulation of weather data. 
   - It includes functionalities for sorting, filtering, and toggling temperature units between Celsius and Fahrenheit, as well as pagination controls to navigate through the forecast data. 
   - The file also fetches API keys and handles user interactions such as city input and button clicks.

   
- **script.js**:
   - This JavaScript file manages the functionality of the chat widget, including opening and closing the chatbox, sending user messages, and receiving responses from the bot. 
   - It handles user interactions, toggles the chat interface between minimized and expanded states, and integrates with a server to process chat messages. 
   - The script also includes dynamic message display within the chatbox, ensuring a smooth user experience.


- **app.js**:
   - This file serves as the main entry point for the Node.js server. 
   - It sets up middleware to parse JSON bodies and serves static files from the `public` directory. 
   - The script initializes the Google Generative AI model using an API key and loads city data from a CSV file. It defines routes for serving the main dashboard, handling API requests, and processing chat messages, including fetching weather data based on user input. 
   - The server listens on a specified port and logs startup information.

- **app2.js**:
   - This server file initializes a Node.js application using Express, setting up middleware for JSON parsing and serving static files from the `public` directory. 
   - It utilizes the Google Generative AI API to process user messages. The script bulk fetches city data from the RapidGeoDB API and includes functionality to extract city names from user queries, check for weather-related keywords, and fetch weather information using the OpenWeather API. 
   - The server handles chat messages, responding with either weather data or AI-generated replies. **Note:** This server fetches data from an API, `which may incur costs.`
## Environment Variables

To run this project, you will need to add the following environment variables to your `.env` file:

- `OPEN_WEATHER_API_KEY` - Your OpenWeather API key. You can obtain one by signing up at [OpenWeather](https://home.openweathermap.org/api_keys).
- `GEMINI_API_KEY` - Your Gemini API key for chatbot integration. You can get one by visiting [Gemini](https://ai.google.dev/gemini-api/docs/api-key).
- `PORT` - The port number for your server (e.g., `3000`).

### Example .env file
```bash
OPEN_WEATHER_API_KEY=YOUR_OPENWEATHER_API_KEY
GEMINI_API_KEY=YOUR_GEMINI_API_KEY
PORT=3000
```


## Installation

### Prerequisites

Before running the project locally, ensure that you have the following tools installed:

- **Node.js** (version 12.x or higher)
- **npm** (Node Package Manager)

### Getting Started

#### 1. Clone the Repository

```bash
    git clone https://github.com/Schwifty101/weatherApp.git
```

#### 2. Install Dependencies
```  
    npm install
```

#### 3. Run project
```
    npm start
```
#### 4. Once the server is running, open your browser and navigate to:
```
    http://localhost:3000
```


    
## API Routes

#### Get API Configuration

```http
GET /api/config
```

| Parameter | Type     | Description                |
| :-------- | :------- | :------------------------- |
| `OPEN_WEATHER_API_KEY` | `string` | **Required**. Your API key |

#### Send chat message

```http
  GET /api/chat
```

| Parameter | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
| `message`      | `string` | **Required**. message sent by user |


## Dependencies
- **Node.js**: JavaScript runtime.
- **Express**: Web framework for Node.js.
- **@google/generative-ai**: Version ^0.21.0 - A library for integrating Google’s generative AI capabilities.
- **csv-parser**: Version ^3.0.0 - A streaming CSV parser for Node.js.
- **dotenv**: Version ^16.4.5 - Loads environment variables from a .env file.
- **tailwindcss**: Version ^3.4.13 (devDependency) - Utility-first CSS framework for styling.

## Future Improvements
- **Error Handling**: Improve error handling for cases when API limits are reached or the city is not found.
- **Enhance Chatbot**: Integrate more advanced NLP models for chatbot responses.
- **Improved UI**: Refine the UI for a more seamless experience, especially on mobile devices.

## License
This project is licensed under the [MIT](https://choosealicense.com/licenses/mit/) License. See the LICENSE file for details.

