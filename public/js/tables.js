let openWeatherApiKey = '';
let forecastData = [];
let isCelsius = true; 
let currentPage = 1; 
const itemsPerPage = 5;

// fetch API keys from the server
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

// fetch weather data
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
            forecastData = data.list;
            populateForecastTable(forecastData);
        })
        .catch(error => {
            console.error(error);
            alert(error.message);
        });
}

// Toggle b/w F and C
const selectElement = document.getElementById('filterOptions');
function toggleUnit() {
    isCelsius = !isCelsius;
    const unitButton = document.getElementById('unitToggle');
    unitButton.textContent = isCelsius ? 'Switch to Fahrenheit' : 'Switch to Celsius';

    for (let i = 0; i < selectElement.options.length; i++) {
        if (selectElement.options[i].value === 'unitToggle') {
            selectElement.options[i].text = isCelsius ? 'Switch to Fahrenheit' : 'Switch to Celsius';
            break;
        }
    }
    populateForecastTable(forecastData);
}

// sort temperatures in ascending/descending order
function sortTemperatures(order = 'asc') {
    forecastData.sort((a, b) => {
        const tempA = a.main.temp;
        const tempB = b.main.temp;
        return order === 'asc' ? tempA - tempB : tempB - tempA;
    });
    populateForecastTable(forecastData);
}

// filter out days without rain
function filterRain() {
    const filteredData = forecastData.filter(item => item.weather[0].description.includes('rain'));
    populateForecastTable(filteredData);
}

// find the day with the highest temperature
function findHighestTemperature() {
    const highestTempDay = forecastData.reduce((prev, current) => {
        return (prev.main.temp > current.main.temp) ? prev : current;
    });
    alert(`The highest temperature is on ${new Date(highestTempDay.dt * 1000).toLocaleDateString()} with ${highestTempDay.main.temp}°C`);
}

function populateForecastTable(data) {
    const forecastTable = document.getElementById('forecastTable');
    forecastTable.innerHTML = '';

    const unitSymbol = isCelsius ? '°C' : '°F';
    const startIndex = (currentPage - 1) * itemsPerPage; 
    const endIndex = startIndex + itemsPerPage; 
    const paginatedData = data.slice(startIndex, endIndex);

    paginatedData.forEach(item => {
        const date = new Date(item.dt * 1000);
        const dateString = date.toLocaleDateString();
        const timeString = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        let temperature = item.main.temp;
        if (!isCelsius) {
            temperature = (temperature * 9 / 5) + 32; // Convert Celsius to Fahrenheit
        }

        const condition = item.weather[0].description;
        const humidity = item.main.humidity;
        const windSpeed = item.wind.speed;
        const pressure = item.main.pressure;

        const row = document.createElement('tr');
        row.innerHTML = `
            <td class="py-2 px-4">${dateString}</td>
            <td class="py-2 px-4">${timeString}</td> <!-- New Time column -->
            <td class="py-2 px-4">${temperature.toFixed(1)} ${unitSymbol}</td>
            <td class="py-2 px-4 capitalize">${condition}</td>
            <td class="py-2 px-4">${humidity}%</td>
            <td class="py-2 px-4">${windSpeed} m/s</td>
            <td class="py-2 px-4">${pressure} hPa</td>
        `;
        forecastTable.appendChild(row);
    });

    updatePaginationControls(data.length);
}


// update pagination controls
function updatePaginationControls(totalItems) {
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const pageInfo = document.getElementById('pageInfo');
    if (pageInfo) {
        pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;
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

window.onload = function () {
    fetchApiKeys();
};
