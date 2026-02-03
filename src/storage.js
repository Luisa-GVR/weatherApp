const STORAGE_KEY = "recentCities";

export function getSavedCities() {
  return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
}

export function saveCity(city) {
  const cities = getSavedCities();

  if (!cities.some(c => c.name === city.name && c.country === city.country)) {
    cities.unshift(city);
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(cities.slice(0, 10)));
}
