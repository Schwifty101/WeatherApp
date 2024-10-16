let openWeatherApiKey = '';
let forecastData = []; // Store fetched forecast data for manipulation
let isCelsius = true;  // Toggle state for unit conversion
let currentPage = 1; // Track the current page
const itemsPerPage = 5; // Number of items to display per page

// Function to fetch API keys from the server
function fetchApiKeys() {
    return fetch('/api/config')
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to fetch API keys.');
            }
            return response.json();
        })
        .then(data => {
            openWeatherApiKey = data.openWeatherApiKey;
        })
        .catch(error => {
            console.error('Error fetching API keys:', error);
            alert('Failed to retrieve API keys. Please try again.');
        });
}

// Function to fetch weather data
function fetchWeather() {
    const city = document.getElementById('cityInput').value.trim();
    if (!openWeatherApiKey) {
        alert('API key is missing. Please try again.');
        return;
    }

    const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${openWeatherApiKey}&units=metric`;

    if (!city) {
        alert("Please enter a city.");
        return;
    }

    fetch(forecastUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error('City not found or API limit reached.');
            }
            return response.json();
        })
        .then(data => {
            forecastData = data.list;  // Store fetched forecast data
            populateForecastTable(forecastData);
        })
        .catch(error => {
            console.error(error);
            alert(error.message);
        });
}

// Function to toggle between Celsius and Fahrenheit
function toggleUnit() {
    isCelsius = !isCelsius; // Toggle state
    const unitButton = document.getElementById('unitToggle');
    unitButton.textContent = isCelsius ? 'Switch to Fahrenheit' : 'Switch to Celsius';
    populateForecastTable(forecastData); // Re-render table
}

// Function to sort temperatures in ascending or descending order
function sortTemperatures(order = 'asc') {
    forecastData.sort((a, b) => {
        const tempA = a.main.temp;
        const tempB = b.main.temp;
        return order === 'asc' ? tempA - tempB : tempB - tempA;
    });
    populateForecastTable(forecastData);
}

// Function to filter out days without rain
function filterRain() {
    const filteredData = forecastData.filter(item => item.weather[0].description.includes('rain'));
    populateForecastTable(filteredData);
}

// Function to find the day with the highest temperature
function findHighestTemperature() {
    const highestTempDay = forecastData.reduce((prev, current) => {
        return (prev.main.temp > current.main.temp) ? prev : current;
    });
    alert(`The highest temperature is on ${new Date(highestTempDay.dt * 1000).toLocaleDateString()} with ${highestTempDay.main.temp}°C`);
}

// Function to populate the forecast table with pagination
function populateForecastTable(data) {
    const forecastTable = document.getElementById('forecastTable');
    forecastTable.innerHTML = ''; // Clear previous data

    const unitSymbol = isCelsius ? '°C' : '°F';
    const startIndex = (currentPage - 1) * itemsPerPage; // Calculate the start index
    const endIndex = startIndex + itemsPerPage; // Calculate the end index
    const paginatedData = data.slice(startIndex, endIndex); // Get the paginated data

    paginatedData.forEach(item => {
        const date = new Date(item.dt * 1000);
        const dateString = date.toLocaleDateString();
        let temperature = item.main.temp;

        if (!isCelsius) {
            temperature = (temperature * 9 / 5) + 32; // Convert Celsius to Fahrenheit
        }

        const condition = item.weather[0].description;
        const humidity = item.main.humidity; // New field
        const windSpeed = item.wind.speed; // New field
        const pressure = item.main.pressure; // New field

        const row = document.createElement('tr');
        row.innerHTML = `
            <td class="py-2 px-4">${dateString}</td>
            <td class="py-2 px-4">${temperature.toFixed(1)} ${unitSymbol}</td>
            <td class="py-2 px-4 capitalize">${condition}</td>
            <td class="py-2 px-4">${humidity}%</td> 
            <td class="py-2 px-4">${windSpeed} m/s</td> 
            <td class="py-2 px-4">${pressure} hPa</td> 
        `;
        forecastTable.appendChild(row);
    });

    updatePaginationControls(data.length); // Update pagination controls
}

// Function to update pagination controls
function updatePaginationControls(totalItems) {
    const totalPages = Math.ceil(totalItems / itemsPerPage); // Calculate total pages
    const pageInfo = document.getElementById('pageInfo');
    if (pageInfo) {
        pageInfo.textContent = `Page ${currentPage} of ${totalPages}`; // Update page info
    }

    const prevButton = document.getElementById('prevPage');
    const nextButton = document.getElementById('nextPage');
    if (prevButton) prevButton.disabled = currentPage === 1; // Disable previous button if on first page
    if (nextButton) nextButton.disabled = currentPage === totalPages; // Disable next button if on last page
}

// Event listeners for pagination buttons
document.getElementById('prevPage').addEventListener('click', () => {
    if (currentPage > 1) {
        currentPage--;
        populateForecastTable(forecastData);
    }
});

document.getElementById('nextPage').addEventListener('click', () => {
    const totalPages = Math.ceil(forecastData.length / itemsPerPage);
    if (currentPage < totalPages) {
        currentPage++;
        populateForecastTable(forecastData);
    }
});

// Event listeners for other actions
document.getElementById('getWeather').addEventListener('click', fetchWeather);
document.getElementById('cityInput').addEventListener('keydown', function (event) {
    if (event.key === 'Enter') {
        fetchWeather();
    }
});
document.getElementById('unitToggle').addEventListener('click', toggleUnit);
document.getElementById('sortAsc').addEventListener('click', () => sortTemperatures('asc'));
document.getElementById('sortDesc').addEventListener('click', () => sortTemperatures('desc'));
document.getElementById('filterRain').addEventListener('click', filterRain);
document.getElementById('highestTemp').addEventListener('click', findHighestTemperature);

// Call fetchApiKeys when the page loads to get the API keys
window.onload = function () {
    fetchApiKeys();
};
