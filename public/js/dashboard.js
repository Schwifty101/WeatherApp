// dashboard.js

// Wait for the DOM to fully load before executing the script
document.addEventListener('DOMContentLoaded', async function () {
    // === DOM Elements ===
    const weatherWidget = document.getElementById('weatherWidget');
    const cityNameElem = document.getElementById('cityName');
    const temperatureElem = document.getElementById('temperature');
    const weatherDescriptionElem = document.getElementById('weatherDescription');
    const cityInput = document.getElementById('cityInput');
    const getWeatherButton = document.getElementById('getWeather');
    const fiveDayForecast = document.getElementById('fiveDayForecast');

    // === Chart Instances ===
    let verticalBarChart = null;
    let doughnutChart = null;
    let lineChart = null;

    // === Retrieve Last City from Cookies ===
    let lastCity = getCookie('lastCity') || "";

    // === Function to Fetch API Key from Server ===
    async function fetchApiKey() {
        try {
            const response = await fetch('/api/config');
            if (!response.ok) {
                throw new Error('Failed to fetch API keys.');
            }
            const data = await response.json();
            return data.openWeatherApiKey;
        } catch (error) {
            console.error('Error fetching API keys:', error);
            alert('Failed to retrieve API keys. Please try again later.');
            throw error; // Rethrow to handle initialization failure
        }
    }

    // === Initialize API Key ===
    let apiKey;
    try {
        apiKey = await fetchApiKey(); // Set API key as a const
    } catch (error) {
        // If fetching API key fails, disable weather functionality
        getWeatherButton.disabled = true;
        cityInput.disabled = true;
        return; // Exit the script
    }

    // === Event Listeners ===
    getWeatherButton.addEventListener('click', handleWeatherRequest);
    cityInput.addEventListener('keydown', handleWeatherRequest);

    // === Check and Display Last City's Weather Data ===
    if (lastCity) {
        const storedData = localStorage.getItem(`weatherData_${lastCity}`);
        if (storedData) {
            displayWeather(JSON.parse(storedData)); // Display cached data
        } else {
            fetchWeather(lastCity); // Fetch new data if not cached
        }
    }

    // === Function to Fetch Weather Data ===
    async function fetchWeather(city) {
        if (city === lastCity) return; // Prevent redundant API calls
        lastCity = city; // Update last queried city
        setCookie('lastCity', city, 7); // Store last city in cookies

        const apiUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(city)}&appid=${apiKey}&units=metric`;

        try {
            const response = await fetch(apiUrl);
            if (!response.ok) throw new Error("City not found");

            const data = await response.json();
            localStorage.setItem(`weatherData_${city}`, JSON.stringify(data)); // Cache the data
            displayWeather(data);
        } catch (error) {
            handleError(error.message);
        }
    }

    // === Function to Format Timestamp into Readable Date ===
    function formatDate(timestamp) {
        const date = new Date(timestamp * 1000);
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        return date.toLocaleDateString(undefined, options);
    }

    // === Function to Display Weather Data ===
    function displayWeather(data) {
        // Filter forecasts to get data for 12 PM each day
        const dailyForecasts = data.list.filter(forecast => {
            return forecast.dt_txt.includes('12:00:00');
        });

        if (dailyForecasts.length === 0) {
            handleError("No forecast data available.");
            return;
        }

        // Display basic weather information
        const todayWeather = dailyForecasts[0].weather[0].description.toLowerCase();
        cityNameElem.textContent = data.city.name;
        temperatureElem.textContent = `Temperature: ${dailyForecasts[0].main.temp} °C`;
        weatherDescriptionElem.textContent = `Weather: ${dailyForecasts[0].weather[0].description}`;

        // Setup Charts with the forecast data
        setupCharts(dailyForecasts);

        // Create a container for the 5-day forecast
        const forecastContainer = document.createElement('div');
        forecastContainer.className = 'mt-6 bg-blue-200 p-4 rounded-lg shadow-lg flex space-x-4';

        // Populate the forecast container with daily data
        dailyForecasts.forEach((forecast) => {
            const dayElement = document.createElement('div');
            dayElement.className = 'flex-1 border rounded p-2';
            dayElement.innerHTML = `
                <strong>${formatDate(forecast.dt)}:</strong>
                <p>Weather: ${forecast.weather[0].description}</p>
                <p>Min Temp: ${forecast.main.temp_min} °C</p>
                <p>Max Temp: ${forecast.main.temp_max} °C</p>
                <p>Pressure: ${forecast.main.pressure} hPa</p>
                <p>Humidity: ${forecast.main.humidity}%</p>
            `;
            forecastContainer.appendChild(dayElement);
        });

        // Dynamically set the background color based on today's weather
        setWeatherBackground(todayWeather);

        // Clear any previous forecast and append the new one
        fiveDayForecast.innerHTML = '';
        fiveDayForecast.appendChild(forecastContainer);
        weatherWidget.classList.remove('hidden');
    }

    // === Function to Handle Errors ===
    function handleError(message) {
        cityNameElem.textContent = message; // Display error message
        temperatureElem.textContent = '';
        weatherDescriptionElem.textContent = '';
    }

    // === Event Handler for Weather Requests ===
    function handleWeatherRequest(event) {
        // Trigger on button click or Enter key press
        if (event.type === 'click' || (event.type === 'keydown' && event.key === 'Enter')) {
            const city = cityInput.value.trim();
            if (city) {
                document.getElementById("weatherWidget").classList.remove("hidden");
                document.getElementById("chartContainer").classList.remove("hidden");
                fetchWeather(city);
            }
        }
    }

    // === Function to Set a Cookie ===
    function setCookie(name, value, days) {
        const expires = new Date(Date.now() + days * 864e5).toUTCString(); // Calculate expiration date
        document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/`; // Set the cookie
    }

    // === Function to Get a Cookie Value ===
    function getCookie(name) {
        return document.cookie.split('; ').reduce((accumulator, currentCookie) => {
            const [cookieName, cookieValue] = currentCookie.split('=');
            return cookieName === name ? decodeURIComponent(cookieValue) : accumulator;
        }, '');
    }

    // === Function to Setup Charts ===
    function setupCharts(dailyForecasts) {
        const tempChartElem = document.getElementById('VerticalBarChart');
        const doughnutChartElem = document.getElementById('DoughnutChart');
        const lineChartElem = document.getElementById('LineChart');

        // Validate chart elements
        if (!tempChartElem || !doughnutChartElem || !lineChartElem) {
            console.error("Chart elements not found in DOM");
            return;
        }

        // Get chart contexts
        const tempChartCtx = tempChartElem.getContext('2d');
        const doughnutCtx = doughnutChartElem.getContext('2d');
        const lineChartCtx = lineChartElem.getContext('2d');

        // Destroy existing charts to prevent duplication
        if (verticalBarChart !== null) {
            verticalBarChart.destroy();
        }
        if (doughnutChart !== null) {
            doughnutChart.destroy();
        }
        if (lineChart !== null) {
            lineChart.destroy();
        }

        // === Vertical Bar Chart for Temperature ===
        verticalBarChart = new Chart(tempChartCtx, {
            type: 'bar',
            data: {
                labels: dailyForecasts.map(forecast => formatDate(forecast.dt)),
                datasets: [{
                    label: 'Temperature (°C)',
                    data: dailyForecasts.map(forecast => forecast.main.temp),
                    backgroundColor: 'rgba(54, 162, 235, 0.5)', // Semi-transparent blue
                    borderColor: 'rgba(54, 162, 235, 1)', // Solid blue
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                animation: {
                    duration: 1000,
                    easing: 'easeInOutBounce'
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Temperature (°C)'
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Day'
                        }
                    }
                }
            }
        });

        // Doughnut Chart for weather conditions
        const weatherConditions = dailyForecasts.reduce((acc, forecast) => {
            const condition = forecast.weather[0].main;
            acc[condition] = (acc[condition] || 0) + 1;
            return acc;
        }, {});

        doughnutChart = new Chart(doughnutCtx, {
            type: 'doughnut',
            data: {
                labels: Object.keys(weatherConditions),
                datasets: [{
                    data: Object.values(weatherConditions),
                    backgroundColor: [
                        'rgba(255, 99, 132, 0.7)',  // Red
                        'rgba(54, 162, 235, 0.7)',  // Blue
                        'rgba(255, 206, 86, 0.7)',  // Yellow
                        'rgba(75, 192, 192, 0.7)',  // Teal
                        'rgba(153, 102, 255, 0.7)', // Purple
                        'rgba(255, 159, 64, 0.7)',  // Orange
                        'rgba(105, 105, 105, 0.7)', // Dark Gray
                        'rgba(60, 179, 113, 0.7)',  // Medium Sea Green
                        'rgba(220, 20, 60, 0.7)'    // Crimson
                    ],
                    borderColor: [
                        'rgba(255, 99, 132, 1)',
                        'rgba(54, 162, 235, 1)',
                        'rgba(255, 206, 86, 1)',
                        'rgba(75, 192, 192, 1)',
                        'rgba(153, 102, 255, 1)',
                        'rgba(255, 159, 64, 1)',
                        'rgba(105, 105, 105, 1)',
                        'rgba(60, 179, 113, 1)',
                        'rgba(220, 20, 60, 1)'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                animation: {
                    duration: 1000
                }
            }
        });

        // === Line Chart for Temperature Changes ===
        lineChart = new Chart(lineChartCtx, {
            type: 'line',
            data: {
                labels: dailyForecasts.map(forecast => formatDate(forecast.dt)),
                datasets: [{
                    label: 'Temperature (°C)',
                    data: dailyForecasts.map(forecast => forecast.main.temp),
                    fill: false,
                    backgroundColor: 'rgba(75, 192, 192, 0.2)', // Semi-transparent teal
                    borderColor: 'rgba(75, 192, 192, 1)', // Solid teal
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                animation: {
                    duration: 1000
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Temperature (°C)'
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Day'
                        }
                    }
                }
            }
        });
    }

    // === Function to Set a Cookie ===
    function setCookie(name, value, days) {
        const expires = new Date(Date.now() + days * 864e5).toUTCString(); // Calculate expiration date
        document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/`; // Set the cookie
    }

    // === Function to Get a Cookie Value ===
    function getCookie(name) {
        return document.cookie.split('; ').reduce((accumulator, currentCookie) => {
            const [cookieName, cookieValue] = currentCookie.split('=');
            return cookieName === name ? decodeURIComponent(cookieValue) : accumulator;
        }, '');
    }

    // === Function to Dynamically Set Weather Widget Background Color ===
    function setWeatherBackground(weatherDescription) {
        if (weatherDescription.includes('clear') || weatherDescription.includes('sunny')) {
            weatherWidget.style.backgroundColor = '#87CEEB'; // Light blue for clear or sunny weather
        } else if (weatherDescription.includes('rain') || weatherDescription.includes('drizzle')) {
            weatherWidget.style.backgroundColor = '#A9A9A9'; // Grey for rain or drizzle
        } else if (weatherDescription.includes('cloud')) {
            weatherWidget.style.backgroundColor = '#B0C4DE'; // Light steel blue for cloudy weather
        } else if (weatherDescription.includes('snow')) {
            weatherWidget.style.backgroundColor = '#F0FFFF'; // Light cyan for snowy weather
        } else if (weatherDescription.includes('thunderstorm')) {
            weatherWidget.style.backgroundColor = '#778899'; // Dark grey for thunderstorms
        } else if (weatherDescription.includes('mist') || weatherDescription.includes('fog') || weatherDescription.includes('haze')) {
            weatherWidget.style.backgroundColor = '#696969'; // Dim grey for mist, fog, or haze
        } else if (weatherDescription.includes('tornado')) {
            weatherWidget.style.backgroundColor = '#4B0082'; // Indigo for tornadoes
        } else if (weatherDescription.includes('smoke')) {
            weatherWidget.style.backgroundColor = '#708090'; // Slate grey for smoke
        } else if (weatherDescription.includes('sand') || weatherDescription.includes('dust') || weatherDescription.includes('ash')) {
            weatherWidget.style.backgroundColor = '#F4A460'; // Sandy brown for sand, dust, or volcanic ash
        } else {
            weatherWidget.style.backgroundColor = '#FFFFFF'; // Default to white if no specific condition
        }
    }
});
