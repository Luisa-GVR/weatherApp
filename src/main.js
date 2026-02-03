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

// Helper function to fetch JSON data with error handling

async function fetchJSON(url) {
  const res = await fetch(url);

  if (!res.ok) {
    throw new Error(`API error: ${res.status}`);
  }

  return res.json();
}


// City search

async function getCoordinates(city) {
  const url = `${BASE_URL}/geo/1.0/direct?q=${city}&limit=1&appid=${API_KEY}`;
  const data = await fetchJSON(url);

  if (!data.length) {
    throw new Error("City not found");
  }

  return {
    lat: data[0].lat,
    lon: data[0].lon,
    name: data[0].name,
    country: data[0].country
  };
}


async function searchCities(query, signal) {
  const url = `${BASE_URL}/geo/1.0/direct?q=${query}&limit=5&appid=${API_KEY}`;

  const res = await fetch(url, { signal });

  if (!res.ok) {
    throw new Error("City search failed");
  }

  return res.json();
}

// Get info functions

async function getCurrentWeather(lat, lon) {
  const url = `${BASE_URL}/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`;
  return fetchJSON(url);
}



async function getForecast(lat, lon) {
  const url = `${BASE_URL}/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`;
  return fetchJSON(url);
}


// Render functions

function renderCurrentWeather(city, current) {
  cityNameEl.textContent = city;
  tempEl.textContent = Math.round(current.temp);
  feelsLikeEl.textContent = Math.round(current.feels_like);
  windEl.textContent = current.wind_speed;

  const iconCode = current.weather[0].icon;
  iconEl.src = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
  iconEl.hidden = false;
}


function renderHourly(list) {
  hourlyList.innerHTML = "";

  list.slice(0, 6).forEach(item => {
    const li = document.createElement("li");
    const time = new Date(item.dt * 1000).getHours();
    const icon = item.weather[0].icon;

    li.innerHTML = `
      <p>${time}:00</p>
      <img src="https://openweathermap.org/img/wn/${icon}.png" alt="">
      <p>${Math.round(item.main.temp)}°</p>
    `;

    hourlyList.appendChild(li);
  });
}


function renderWeekly(days) {
  weeklyList.innerHTML = "";

  days.slice(0, 7).forEach((day, index) => {
    const li = document.createElement("li");

    const label = index === 0
      ? "Today"
      : new Date(day.dt * 1000).toLocaleDateString(undefined, { weekday: "short" });

    li.innerHTML = `
      <span>${label}</span>
      <img src="https://openweathermap.org/img/wn/${day.icon}.png" alt="">
      <span>${Math.round(day.temp.max)}° / ${Math.round(day.temp.min)}°</span>
    `;

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

    const { lat, lon, name, country } = await getCoordinates(city);

    const [currentData, forecastData] = await Promise.all([
      getCurrentWeather(lat, lon),
      getForecast(lat, lon)
    ]);

    renderCurrentWeather(`${name}, ${country}`, {
      ...currentData.main,
      feels_like: currentData.main.feels_like,
      wind_speed: currentData.wind.speed,
      weather: currentData.weather
    });

    renderHourly(forecastData.list);
    const daily = groupForecastByDay(forecastData.list);
    renderWeekly(daily);

    const first = forecastData.list?.[0];
    if (first) {
      const rainChance = Math.round((first.pop ?? 0) * 100);
      rainChanceEls.forEach(el => el.textContent = rainChance);
      humidity.textContent = `${first.main.humidity}%`;
    }

    


  } catch (err) {
    alert(err.message);
    console.error(err);
  } finally {
      loadingOverlay.style.display = "none";
  }
}


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

    li.addEventListener("click", () => {
      searchInput.value = `${city.name}, ${city.country}`;
      searchResults.hidden = true;

      saveCity(city);
      loadWeather(city.name);
    });


    searchResults.appendChild(li);
  });

  searchResults.hidden = false;
}

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

highlightActiveNav();