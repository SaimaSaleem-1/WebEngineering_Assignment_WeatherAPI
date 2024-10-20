document.getElementById("searchButton").addEventListener("click", function() {
    const city = document.getElementById("searchbar").value;
    getWeatherData(city);
});

const apiKey = '75f1635daf67bab4df564b825f648a14';
let weatherData = [];
let originalWeatherData = []; // Store the original data here
let currentPage = 1;
const rowsPerPage = 15;

function getWeatherData(city) {
    const url = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`;
    
    fetch(url)
        .then(response => {
            if (!response.ok) throw new Error("City not found");
            return response.json();
        })
        .then(data => {
            weatherData = data.list;
            originalWeatherData = [...data.list]; // Store a copy of the original data
            displayTable(currentPage);
            setupPagination();
        })
        .catch(error => alert("Error: " + error.message));
}

function displayTable(page) {
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    const tableBody = document.getElementById("forecast-body");
    tableBody.innerHTML = "";

    weatherData.slice(start, end).forEach(item => {
        const row = document.createElement("tr");

        const date = new Date(item.dt_txt).toLocaleDateString();
        const temp = `${item.main.temp} °C`;
        const weather = item.weather[0].description;

        row.innerHTML = `
            <td>${date}</td>
            <td>${temp}</td>
            <td>${weather}</td>
        `;

        tableBody.appendChild(row);
    });
}

function setupPagination() {
    const totalPages = Math.ceil(weatherData.length / rowsPerPage);
    const pagination = document.getElementById("pagination");
    pagination.innerHTML = "";
    
    for (let i = 1; i <= totalPages; i++) {
        const button = document.createElement("button");
        button.innerText = i;
        button.classList.add("page-btn");
        if (i === currentPage) {
            button.classList.add("active");
        }

        button.addEventListener("click", function() {
            currentPage = i;
            displayTable(currentPage);
        });

        pagination.appendChild(button);
    }
}

// Filter Functions
function sortTemperaturesAscending() {
    weatherData.sort((a, b) => a.main.temp - b.main.temp);
    displayTable(currentPage);
}

function sortTemperaturesDescending() {
    weatherData.sort((a, b) => b.main.temp - a.main.temp);
    displayTable(currentPage);
}

function filterRainyDays() {
    const rainyDays = originalWeatherData.filter(item => item.weather[0].description.includes('rain'));
    weatherData = rainyDays; 
    currentPage = 1; 
    displayTable(currentPage); 
    setupPagination(); 
}

function findHighestTemperature() {
    const highestTempDay = originalWeatherData.reduce((prev, curr) => (prev.main.temp > curr.main.temp) ? prev : curr);
    weatherData = [highestTempDay];
    currentPage = 1; 
    displayTable(currentPage); 
    setupPagination(); 
}

function showAllData() {
    weatherData = [...originalWeatherData]; // Reset weatherData to the original data
    currentPage = 1; 
    displayTable(currentPage); 
    setupPagination(); 
}

// Event listeners for filter buttons
document.getElementById("sortAscBtn").addEventListener("click", sortTemperaturesAscending);
document.getElementById("sortDescBtn").addEventListener("click", sortTemperaturesDescending);
document.getElementById("filterRainyBtn").addEventListener("click", filterRainyDays);
document.getElementById("highestTempBtn").addEventListener("click", findHighestTemperature);
document.getElementById("all").addEventListener("click", showAllData);

// Chatbot functionality remains unchanged
const chatInput = document.getElementById("chat-input");
const sendButton = document.getElementById("chat-send");
const messagesDiv = document.getElementById("chat-messages");

sendButton.addEventListener("click", handleChatInput);
chatInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") handleChatInput();
});

async function handleChatInput() {
    const message = chatInput.value.trim();
    if (!message) return;

    displayMessage("user", message);
    chatInput.value = "";

    try {
        const response = await processUserMessage(message);
        displayMessage("bot", response);
    } catch (error) {
        displayMessage("bot", "I'm having trouble processing your request. Please try again.");
    }
}

function displayMessage(type, content) {
    const messageDiv = document.createElement("div");
    messageDiv.classList.add("message", type);
    messageDiv.textContent = content;
    messagesDiv.appendChild(messageDiv);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

async function processUserMessage(message) {
    const lowercaseMsg = message.toLowerCase();
    
    if (weatherData.length === 0) {
        return "Please search for a city first to get weather information.";
    }

    if (lowercaseMsg.includes("temperature")) {
        const currentTemp = weatherData[0].main.temp;
        return `The current temperature is ${currentTemp}°C.`;
    }

    if (lowercaseMsg.includes("weather")) {
        const condition = weatherData[0].weather[0].description;
        return `The current weather condition is ${condition}.`;
    }

    if (lowercaseMsg.includes("forecast")) {
        const nextDay = weatherData[8].main.temp;
        return `Tomorrow's temperature will be around ${nextDay}°C.`;
    }

    return "You can ask me about current temperature, weather conditions, or forecast!";
}
