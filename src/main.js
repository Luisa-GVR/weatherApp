import { saveCity, getSavedCities } from "./storage.js";
import { highlightActiveNav } from "./ui.js";

// Load API key from environment variables

const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY;

const BASE_URL = "https://api.openweathermap.org";



const loadingOverlay = document.querySelector("[data-loading]");
const cityNameEl = document.querySelector("[data-city-name]");
const tempEl = document.querySelector("[data-current-temp]");
const rainChanceEls = document.querySelectorAll("[data-rain-chance]");
const iconEl = document.querySelector("[data-current-icon]");
const hourlyList = document.querySelector("[data-hourly-forecast]");
const weeklyList = document.querySelector("[data-weekly-forecast]");
const feelsLikeEl = document.querySelector("[data-feels-like]");
const windEl = document.querySelector("[data-wind-speed]");
const humidity = document.querySelector("[data-humidity]");
const searchInput = document.querySelector("#city-search");
const searchResults = document.querySelector("[data-search-results]");

// Retry handling

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Circuit

const circuitBreaker = {
  failures: 0,
  lastFailureTime: null,
  state: "CLOSED", // CLOSED, OPEN, HALF_OPEN
}

const CIRCUIT_CONFIG = {
  failureThreshold: 3,
  resetTimeout: 5000,
  coolOffTime: 10000
}

function canRequest() {
  if (circuitBreaker.state === "OPEN") {
    const now = Date.now();
    if (now - circuitBreaker.lastFailureTime > CIRCUIT_CONFIG.resetTimeout + CIRCUIT_CONFIG.coolOffTime) {
      circuitBreaker.state = "HALF_OPEN";
      return true;
    }
    return false;
  }

  return true;
}


// Fetch with circuit breaker

async function fetchWithCircuitBreaker(url, options) {
  if (!canRequest()) {
    throw new Error("Circuit breaker open");
  }

  try {
    const result = await fetchWithRetry(url, options);

    // Success resets breaker
    circuitBreaker.failures = 0;
    circuitBreaker.state = "CLOSED";

    return result;
  } catch (err) {
    if (err.name !== "AbortError") {
      circuitBreaker.failures++;
      circuitBreaker.lastFailureTime = Date.now();

      if (circuitBreaker.failures >= CIRCUIT_CONFIG.failureThreshold) {
        circuitBreaker.state = "OPEN";
        console.warn("Circuit breaker OPEN");
      }
    }

    throw err;
  }
}

//Helpers 


//Custom error

class UserError extends Error {
  constructor(message) {
    super(message);
    this.name = 'UserError';
  }
}

// Escape html

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Unification of error handling

function showNotification(message, type = 'info') {
  if (type === 'error' || type === 'warning') {
    alert(message);
  }
  console.log(`[${type.toUpperCase()}] ${message}`);
}


//City validation

function validateCityData(data) {
  if (!Array.isArray(data) || data.length === 0) {
    throw new UserError('City not found');
  }
 
  const city = data[0];
  if (typeof city !== 'object' || city === null) {
    throw new Error('Invalid API response');
  }
 
  const requiredFields = ['lat', 'lon', 'name', 'country'];
  for (const field of requiredFields) {
    if (city[field] == null) {
      throw new Error(`Missing required field: ${field}`);
    }
  }
 
  // Type validation
  if (typeof city.lat !== 'number' || typeof city.lon !== 'number') {
    throw new Error('Invalid coordinates');
  }
 
  return city;
}


// Retry fetcher

async function fetchWithRetry(
  url,
  options = {},
  {
    retries = 3,
    delay = 500,
    retryOn = [429, 500, 502, 503, 504]
  } = {}
) {
  try {
    return await fetchJSON(url, options);
  } catch (err) { // Extract status code from error message
   
    if (err.name === 'AbortError') throw err;

    if (typeof navigator !== 'undefined' && navigator.onLine === false) {
      throw err;
    }

    const statusMatch = err.message?.match(/API error: (\d+)/);
    const status = statusMatch ? Number(statusMatch[1]) : null;

    // No retries left
    if (retries <= 0) throw err;

    // Retry only with the status code
    if (status === null || retryOn.includes(status)) {
      await sleep(delay);
      return fetchWithRetry(url, options, {
        retries: retries - 1,
        delay: delay * 3,
        retryOn
      });
    }

    throw err;
  }
}



// Helper function to fetch JSON data with error handling

async function fetchJSON(url, options = {}) {
  const res = await fetch(url, options);
 
  if (!res.ok) {
    throw new Error(`API error: ${res.status}`);
  }
 
  return res.json();
}

// Get coords



async function getCoordinates(city) {
  const url = `${BASE_URL}/geo/1.0/direct?q=${encodeURIComponent(city)}&limit=1&appid=${API_KEY}`;
  const data = await fetchJSON(url);

  const validatedCity = validateCityData(data);

  return {
    lat: validatedCity.lat,
    lon: validatedCity.lon,
    name: validatedCity.name,
    country: validatedCity.country
  };
}



// Get info functions, added fetchWithRetry

async function getCurrentWeather(lat, lon) {
  const url = `${BASE_URL}/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`;
  return fetchWithCircuitBreaker(url);
}



async function getForecast(lat, lon) {
  const url = `${BASE_URL}/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`;
  return fetchWithCircuitBreaker(url);
}


async function searchCities(query, signal) {
  const url = `${BASE_URL}/geo/1.0/direct?q=${encodeURIComponent(query)}&limit=5&appid=${API_KEY}`;
  return fetchWithCircuitBreaker(url, { signal }); 
}


// Render functions

function renderCurrentWeather(city, current) {
  cityNameEl.textContent = city;
  tempEl.textContent = Math.round(current.temp);
  feelsLikeEl.textContent = Math.round(current.feels_like);
  windEl.textContent = current.wind_speed;

  const iconCode = escapeHtml(current.weather[0].icon);
  iconEl.src = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
  iconEl.hidden = false;
}

function createHourlyItem(item) {
  const li = document.createElement("li");
  
  const timeP = document.createElement("p");
  const time = new Date(item.dt * 1000).getHours();
  timeP.textContent = `${time}:00`;
  
  const img = document.createElement("img");
  const iconCode = escapeHtml(item.weather[0].icon);
  img.src = `https://openweathermap.org/img/wn/${iconCode}.png`;
  img.alt = "";
  
  const tempP = document.createElement("p");
  tempP.textContent = `${Math.round(item.main.temp)}°`;
  
  li.append(timeP, img, tempP);
  return li;
}


function renderHourly(list) {
  hourlyList.innerHTML = "";

  list.slice(0, 6).forEach(item => {
    const li = createHourlyItem(item);
    hourlyList.appendChild(li);
  });
}


function createWeeklyItem(day, index) {
  const li = document.createElement('li');
 
  const labelSpan = document.createElement('span');
  labelSpan.textContent = index === 0 ? "Today" :
    new Date(day.dt * 1000).toLocaleDateString(undefined, { weekday: "short" });
 
  const img = document.createElement('img');
  img.src = `https://openweathermap.org/img/wn/${escapeHtml(day.icon)}.png`;
  img.alt = '';
 
  const tempSpan = document.createElement('span');
  tempSpan.textContent = `${Math.round(day.temp.max)}° / ${Math.round(day.temp.min)}°`;
 
  li.append(labelSpan, img, tempSpan);
  return li;
}

function renderWeekly(days) {
  weeklyList.innerHTML = "";

  days.slice(0, 7).forEach((day, index) => {
    const li = createWeeklyItem(day, index);
    weeklyList.appendChild(li);
  });
}


// Helper to group forecast data by day

function groupForecastByDay(list) {
  const days = {};

  list.forEach(item => {
    const dateKey = new Date(item.dt * 1000).toISOString().split("T")[0];

    if (!days[dateKey]) {
      days[dateKey] = {
        temps: [],
        icons: [],
        dt: item.dt
      };
    }

    days[dateKey].temps.push(item.main.temp);
    days[dateKey].icons.push(item.weather[0].icon);
  });

  return Object.values(days).map(day => ({
    dt: day.dt,
    temp: {
      max: Math.max(...day.temps),
      min: Math.min(...day.temps)
    },
    icon: day.icons[Math.floor(day.icons.length / 2)]
  }));
}


// Load weather

async function loadWeather(city) {
  try {
    loadingOverlay.style.display = "grid";

    // Early validation
    if (!city || typeof city !== 'string' || city.trim().length < 2) {
      throw new UserError('Please enter a valid city name');
    }

    const { lat, lon, name, country } = await getCoordinates(city);

    const [currentData, forecastData] = await Promise.all([
      getCurrentWeather(lat, lon),
      getForecast(lat, lon)
    ]);

    // Render current weather
    renderCurrentWeather(`${name}, ${country}`, {
      ...currentData.main,
      feels_like: currentData.main.feels_like,
      wind_speed: currentData.wind.speed,
      weather: currentData.weather
    });

    // Render forecasts
    renderHourly(forecastData.list);
    const daily = groupForecastByDay(forecastData.list);
    renderWeekly(daily);

    // Update additional weather info
    const first = forecastData.list?.[0];
    if (first) {
      const rainChance = Math.round((first.pop ?? 0) * 100);
      rainChanceEls.forEach(el => el.textContent = rainChance);
      humidity.textContent = `${first.main.humidity}%`;
    }

  } catch (err) {
    // Structured error handling
    if (err instanceof UserError) {
      showNotification(err.message, 'warning');
    } else if (err.name === 'AbortError') {
      // Silent - intentional cancellation
      console.log('Request cancelled');
    } else if (typeof navigator !== 'undefined' && navigator.onLine === false) {
      showNotification('Please check your internet connection', 'error');
    } else {
      console.error('Weather load error:', err);
      showNotification('Unable to load weather data. Please try again.', 'error');
    }
  } finally {
    loadingOverlay.style.display = "none";
  }
}


// Searchbar

function renderSearchResults(cities) {
  searchResults.innerHTML = "";

  if (!cities.length) {
    searchResults.hidden = true;
    return;
  }

  cities.forEach(city => {
    const li = document.createElement("li");
    li.textContent = `${city.name}, ${city.country}`;
    
    // Store data in attributes instead of creating event listeners
    li.dataset.cityName = city.name;
    li.dataset.country = city.country;
    
    searchResults.appendChild(li);
  });

  searchResults.hidden = false;
}

// And then delegate a single listener for each result

searchResults.addEventListener("click", (e) => {
  const li = e.target.closest('li');
  if (!li) return;
 
  const cityName = li.dataset.cityName;
  const country = li.dataset.country;
 
  searchInput.value = `${cityName}, ${country}`;
  searchResults.hidden = true;
 
  saveCity({ name: cityName, country });
  loadWeather(cityName);
});


let searchTimeout;
let searchController;

searchInput.addEventListener("input", () => {
  const query = searchInput.value.trim();

  clearTimeout(searchTimeout);
  if (searchController) searchController.abort();

  if (query.length < 2) {
    searchResults.hidden = true;
    return;
  }

  searchTimeout = setTimeout(async () => {
    try {
      searchController = new AbortController();
      const cities = await searchCities(query, searchController.signal);
      renderSearchResults(cities);
    } catch (err) {
      if (err.name !== "AbortError") {
        console.error(err);
      }
    }
  }, 300);
});

document.addEventListener("click", (e) => {
  if (!e.target.closest(".search-bar")) {
    searchResults.hidden = true;
  }
});



// Initial load

const selectedCity = localStorage.getItem("selectedCity");
const recentCities = JSON.parse(localStorage.getItem("recentCities")) || [];

if (selectedCity) {
  loadWeather(selectedCity);
  localStorage.removeItem("selectedCity");
} else if (recentCities.length) {
  loadWeather(recentCities[0].name);
} else {
  loadWeather("Mexico");
}

highlightActiveNav();