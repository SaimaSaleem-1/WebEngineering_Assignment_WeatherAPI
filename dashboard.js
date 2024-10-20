const apiKey = '75f1635daf67bab4df564b825f648a14';
const cityInput = document.getElementById('searchbar');
const getWeatherBtn = document.getElementById('searchButton');
const weatherWidget = document.querySelector('.weather-data');
const tempChart = document.getElementById('tempChart'); 
const conditionsChart = document.getElementById('conditionsChart');  
const tempLineChart = document.getElementById('tempLineChart');

getWeatherBtn.addEventListener('click', getWeather);

async function getWeather() {
    const city = cityInput.value;
    if (!city) return;

    try {
        const currentWeather = await fetchCurrentWeather(city);
        const forecast = await fetchForecast(city);

        updateWeatherWidget(currentWeather);
        updateBackgroundImage(currentWeather.weather[0].main); // Update the background
        createTemperatureChart(forecast);
        createConditionsChart(forecast);
        createTemperatureLineChart(forecast);
    } 
    catch (error) {
        console.error('Error fetching weather data:', error);
        weatherWidget.innerHTML = '<p>Error fetching weather data. Please try again.</p>';
    }
}

async function fetchCurrentWeather(city) {
    const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}`);
    if (!response.ok) throw new Error('City not found');
    return response.json();
}

async function fetchForecast(city) {
    const response = await fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&appid=${apiKey}`);
    if (!response.ok) throw new Error('Forecast not available');
    return response.json();
}

function updateWeatherWidget(data) {
    const html = `
        <h2 style="color:#2C2C54; margin-left: 30px; font-family: cursive; font-weight: bold">${data.name}, ${data.sys.country}</h2>
        <img src="http://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png" alt="${data.weather[0].description}" style="margin-left: 40px; width: 150px; height: 150px;">
        <p style="font-size: 18px; color:#2C2C54; font-family: cursive;"><strong><em>Temperature: </em></strong>${Math.round(data.main.temp)}°C</p>
        <p style="font-size: 18px; color:#2C2C54; font-family: cursive;"><strong><em>Feels like: </em></strong>${Math.round(data.main.feels_like)}°C</p>
        <p style="font-size: 18px; color:#2C2C54; font-family: cursive;"><strong><em>Humidity: </em></strong>${data.main.humidity}%</p>
        <p style="font-size: 18px; color:#2C2C54; font-family: cursive;"><strong><em>Wind Speed: </em></strong>${data.wind.speed} m/s</p>
        <p style="font-size: 18px; color:#2C2C54; font-family: cursive;"><strong><em>Condition: </em></strong>${data.weather[0].description}</p>
    `;
    weatherWidget.innerHTML = html;
}

function updateBackgroundImage(condition) {
    const conditions = {
        Clear: 'clear-sky-background',
        Clouds: 'cloudy-background',
        Rain: 'rainy-background',
        Snow: 'snowy-background',
        Thunderstorm: 'stormy-background',
    };

    weatherWidget.className = `weather-data ${conditions[condition] || 'default-background'}`;
}

// Create temperature bar chart
function createTemperatureChart(forecast) 
{
    const dailyData = getDailyData(forecast);
    const ctx = tempChart.getContext('2d');

    if (window.tempChartInstance) 
    {
        window.tempChartInstance.destroy();
    }

    window.tempChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: dailyData.map(day => day.date),
            datasets: [{
                label: 'Temperature (°C)',
                data: dailyData.map(day => day.temp),
                backgroundColor: '#15719f',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1
            }]
        },
        options: {
            layout: {
                padding: {
                    top: 10,
                    right: 10,
                    bottom: 10,
                    left: 10
                }
            },
            responsive: true,
            scales: {
                y: {
                    beginAtZero: false
                }
            },
            animation: {
                delay: (context) => context.dataIndex * 300
            }
        }
    });
}    

// Create weather conditions doughnut chart
function createConditionsChart(forecast) {
    const dailyData = getDailyData(forecast);
    const conditions = dailyData.map(day => day.condition);
    const conditionCounts = conditions.reduce((acc, condition) => {
        acc[condition] = (acc[condition] || 0) + 1;
        return acc;
    }, {});

    const ctx = conditionsChart.getContext('2d');

    if (window.conditionsChartInstance) {
        window.conditionsChartInstance.destroy();
    }

    window.conditionsChartInstance = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: Object.keys(conditionCounts),
            datasets: [{
                data: Object.values(conditionCounts),
                backgroundColor: [
                    '#15719f',
                    '#528ab4',
                    '#7bc7dd',
                    'rgba(75, 192, 192, 0.6)',
                    'rgba(153, 102, 255, 0.6)'
                ]
                
            }]
        },
        options: {
            responsive: true,
            animation: {
                delay: (context) => context.dataIndex * 300
            },
            layout: {
                padding: {
                    top: 10,
                    right: 10,
                    bottom: 10,
                    left: 10
                }
            }
        }
    });
}

// Create temperature line chart
function createTemperatureLineChart(forecast) {
    const dailyData = getDailyData(forecast);
    const ctx = tempLineChart.getContext('2d');

    if (window.tempLineChartInstance) {
        window.tempLineChartInstance.destroy();
    }

    window.tempLineChartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: dailyData.map(day => day.date),
            datasets: [{
                label: 'Temperature (°C)',
                data: dailyData.map(day => day.temp),
                fill: false,
                borderColor: '#15719f',
                tension: 0.1
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: false
                }
            },
            animation: {
                x: {
                    type: 'number',
                    easing: 'linear',
                    duration: 1000,
                    from: NaN,
                    delay(ctx) {
                        if (ctx.type !== 'data' || ctx.xStarted) {
                            return 0;
                        }
                        ctx.xStarted = true;
                        return ctx.index * 300;
                    }
                },
                y: {
                    type: 'number',
                    easing: 'linear',
                    duration: 1000,
                    from: datasetData => datasetData[0],
                    delay(ctx) {
                        if (ctx.type !== 'data' || ctx.yStarted) {
                            return 0;
                        }
                        ctx.yStarted = true;
                        return ctx.index * 300;
                    }
                }
            }
        }
    });
}

// Helper function to get daily weather data
function getDailyData(forecast) 
{
    const dailyData = [];
    for (let i = 0; i < forecast.list.length; i += 8) 
    {
        const day = forecast.list[i];
        dailyData.push({
            date: new Date(day.dt * 1000).toLocaleDateString('en-US', { weekday: 'short' }),
            temp: Math.round(day.main.temp),
            condition: day.weather[0].main
        });
    }
    return dailyData;
}

function initDashboard() 
{
    // Initialization logic if needed
}
window.addEventListener('load', initDashboard);
