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

// Added more logic for favorites and deleting cities from localstorage

export function toggleFavorite(name, country) {
  const cities = getSavedCities();

  const updated = cities.map(c =>
    c.name === name && c.country === country
      ? { ...c, favorite: !c.favorite }
      : c
  );

  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  return updated.find(c => c.name === name && c.country === country)?.favorite ?? false;
}

export function deleteCity(name, country) {
  const cities = getSavedCities().filter(
    c => !(c.name === name && c.country === country)
  );
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cities));
}
