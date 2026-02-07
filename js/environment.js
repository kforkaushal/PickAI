/**
 * Environment & Weather Dashboard Logic
 * Uses Open-Meteo API (No Key Required)
 */

const FALLBACK_CITY = 'Mumbai';
const WMO_CODE_MAP = {
    0: { desc: 'Clear sky', icon: '01d' },
    1: { desc: 'Mainly clear', icon: '02d' },
    2: { desc: 'Partly cloudy', icon: '03d' },
    3: { desc: 'Overcast', icon: '04d' },
    45: { desc: 'Fog', icon: '50d' },
    48: { desc: 'Depositing rime fog', icon: '50d' },
    51: { desc: 'Light drizzle', icon: '09d' },
    53: { desc: 'Moderate drizzle', icon: '09d' },
    55: { desc: 'Dense drizzle', icon: '09d' },
    61: { desc: 'Slight rain', icon: '10d' },
    63: { desc: 'Moderate rain', icon: '10d' },
    65: { desc: 'Heavy rain', icon: '10d' },
    71: { desc: 'Slight snow', icon: '13d' },
    73: { desc: 'Moderate snow', icon: '13d' },
    75: { desc: 'Heavy snow', icon: '13d' },
    95: { desc: 'Thunderstorm', icon: '11d' }
};

document.addEventListener('DOMContentLoaded', () => {
    initWeather();
    setupSearch();
});

async function initWeather() {
    // 1. Try Geolocation
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                let locationName = "Your Location";

                try {
                    // Reverse geocode using Nominatim (no key required)
                    const geoRes = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10`);
                    const geoData = await geoRes.json();
                    if (geoData.address) {
                        locationName = geoData.address.city || geoData.address.town || geoData.address.village || geoData.address.suburb || "Your Location";
                        if (geoData.address.country) locationName += `, ${geoData.address.country}`;
                    }
                } catch (e) {
                    console.log("Reverse geocoding failed, using generic label.");
                }

                fetchWeatherData(latitude, longitude, locationName);
            },
            (error) => {
                console.log('Geolocation declined or failed, using fallback.');
                fetchWeatherByCity(FALLBACK_CITY);
            }
        );
    } else {
        fetchWeatherByCity(FALLBACK_CITY);
    }
}

function setupSearch() {
    const searchBtn = document.getElementById('search-btn');
    const searchInput = document.getElementById('city-search');

    if (searchBtn && searchInput) {
        searchBtn.addEventListener('click', () => {
            const city = searchInput.value.trim();
            if (city) fetchWeatherByCity(city);
        });

        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const city = searchInput.value.trim();
                if (city) fetchWeatherByCity(city);
            }
        });
    }
}

async function fetchWeatherByCity(city) {
    showLoading();
    try {
        const geoRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`);
        const geoData = await geoRes.json();

        if (!geoData.results || geoData.results.length === 0) {
            throw new Error(`City "${city}" not found.`);
        }

        const { latitude, longitude, name, country } = geoData.results[0];
        fetchWeatherData(latitude, longitude, `${name}, ${country}`);
    } catch (error) {
        console.error('Geocoding error:', error);
        renderError(error.message);
    }
}

async function fetchWeatherData(lat, lon, locationName) {
    showLoading();
    try {
        // 1. Fetch Weather
        const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset&timezone=auto`;
        const weatherRes = await fetch(weatherUrl);
        const weatherData = await weatherRes.json();

        // 2. Fetch AQI
        const aqiUrl = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&current=european_aqi,us_aqi`;
        const aqiRes = await fetch(aqiUrl);
        const aqiData = await aqiRes.json();

        renderDashboard(weatherData, aqiData, locationName);
    } catch (error) {
        console.error('Weather data error:', error);
        renderError("Failed to fetch weather data. Please try again.");
    }
}

function renderDashboard(weather, aqi, locationName) {
    const container = document.getElementById('weather-content');
    const current = weather.current;
    const daily = weather.daily;

    // Mapping WMO Code
    const weatherInfo = WMO_CODE_MAP[current.weather_code] || { desc: 'Unknown', icon: '01d' };

    // Process AQI
    const usAqi = aqi.current.us_aqi;
    let aqiText = 'GOOD';
    let aqiClass = 'aqi-good';

    if (usAqi > 50 && usAqi <= 100) {
        aqiText = 'MODERATE';
        aqiClass = 'aqi-moderate';
    } else if (usAqi > 100) {
        aqiText = 'UNHEALTHY';
        aqiClass = 'aqi-unhealthy';
    }

    // Sunrise/Sunset formatting
    const sunrise = new Date(daily.sunrise[0]).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const sunset = new Date(daily.sunset[0]).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Forecast Processing
    const forecastHtml = daily.time.slice(0, 5).map((dateStr, i) => {
        const date = new Date(dateStr);
        const dayName = i === 0 ? 'Today' : date.toLocaleDateString('en-US', { weekday: 'short' });
        const code = daily.weather_code[i];
        const info = WMO_CODE_MAP[code] || { desc: 'Unknown', icon: '01d' };

        return `
            <div class="forecast-item">
                <div class="forecast-day">${dayName}</div>
                <img src="https://openweathermap.org/img/wn/${info.icon}.png" alt="icon" style="filter: grayscale(1); width: 40px;">
                <div class="forecast-temp">${Math.round(daily.temperature_2m_max[i])}°C</div>
                <div class="metric-label" style="font-size: 0.7rem; color: var(--color-text-secondary);">${info.desc}</div>
            </div>
        `;
    }).join('');

    container.innerHTML = `
        <div class="weather-hero">
            <div class="weather-main">
                <h1 class="weather-city">${locationName}</h1>
                <div class="weather-date">${new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</div>
                <div class="weather-temp-large">${Math.round(current.temperature_2m)}°C</div>
                <div class="weather-desc">${weatherInfo.desc}</div>
            </div>
            <div class="weather-visual">
                <img src="https://openweathermap.org/img/wn/${weatherInfo.icon}@4x.png" class="weather-icon-lg" alt="icon" style="filter: contrast(1.1) grayscale(0.2); width: 200px;">
            </div>
        </div>

        <div class="weather-grid">
            <div class="metric-card">
                <div class="metric-label">Apparent Temp</div>
                <div class="metric-value">${Math.round(current.apparent_temperature)}°C</div>
            </div>
            <div class="metric-card">
                <div class="metric-label">Relative Humidity</div>
                <div class="metric-value">${current.relative_humidity_2m}%</div>
            </div>
            <div class="metric-card">
                <div class="metric-label">US Air Quality Index</div>
                <div class="metric-value">
                     ${usAqi} <span style="font-size: 0.9rem; vertical-align: middle; margin-left:10px; color: ${usAqi > 100 ? '#e63946' : 'inherit'}">${aqiText}</span>
                </div>
            </div>
            <div class="metric-card">
                <div class="metric-label">Wind Velocity</div>
                <div class="metric-value">${current.wind_speed_10m} km/h</div>
            </div>
            <div class="metric-card">
                <div class="metric-label">Astronomical Sunrise</div>
                <div class="metric-value">${sunrise}</div>
            </div>
            <div class="metric-card">
                <div class="metric-label">Astronomical Sunset</div>
                <div class="metric-value">${sunset}</div>
            </div>
        </div>

        <section class="forecast-section">
            <h2 class="forecast-title">Weekly Outlook</h2>
            <div class="forecast-list">
                ${forecastHtml}
            </div>
        </section>
    `;
}

function showLoading() {
    document.getElementById('weather-content').innerHTML = `
        <div class="skeleton-container" style="animation: pulse 1.5s infinite;">
            <div class="skeleton" style="height: 300px; margin-bottom: 30px; background: #eee;"></div>
            <div class="weather-grid">
                <div class="skeleton" style="height: 120px; background: #eee;"></div>
                <div class="skeleton" style="height: 120px; background: #eee;"></div>
                <div class="skeleton" style="height: 120px; background: #eee;"></div>
                <div class="skeleton" style="height: 120px; background: #eee;"></div>
            </div>
        </div>
    `;
}

function renderError(msg) {
    document.getElementById('weather-content').innerHTML = `
        <div class="error-message" style="padding: 40px; text-align: center; background: #fff; border: 1px solid var(--color-border);">
            <h3>Oops!</h3>
            <p>${msg}</p>
            <button onclick="initWeather()" style="padding: 10px 20px; background: var(--color-text-primary); color: #fff; border: none; margin-top: 20px;">Try Again</button>
        </div>
    `;
}
