import { getSavedCities, toggleFavorite, deleteCity } from "./storage.js";
import { highlightActiveNav } from "./ui.js";

const favoritesSection = document.querySelector("#favorites-section");
const recentSection = document.querySelector("#recent-section");
const favoritesList = document.querySelector("#favorites-list");
const recentList = document.querySelector("#recent-list");

function navigateToCity(name, country) {
  const allCities = getSavedCities();

  const city = allCities.find(c => c.name === name && c.country === country);
  if (!city) return;

  const updated = [
    city,
    ...allCities.filter(c => !(c.name === name && c.country === country))
  ];

  localStorage.setItem("recentCities", JSON.stringify(updated));
  localStorage.setItem("selectedCity", name);
  location.href = "index.html";
}




// Better city cards for favs and recents
function createCityCard(city) {
  const li = document.createElement("li");
  li.className = "city-card";
  li.dataset.name = city.name;
  li.dataset.country = city.country;

  // Info (clickable)
  const info = document.createElement("div");
  info.className = "city-card__info";
  info.dataset.action = "navigate";

  const iconBox = document.createElement("div");
  iconBox.className = "city-card__icon";
  const pinIcon = document.createElement("i");
  pinIcon.className = "fa-solid fa-location-dot";
  iconBox.appendChild(pinIcon);

  const text = document.createElement("div");
  text.className = "city-card__text";

  const nameSpan = document.createElement("span");
  nameSpan.className = "city-card__name";
  nameSpan.textContent = city.name;

  const countrySpan = document.createElement("span");
  countrySpan.className = "city-card__country";
  countrySpan.textContent = city.country;

  text.append(nameSpan, countrySpan);
  info.append(iconBox, text);

  // Actions
  const actions = document.createElement("div");
  actions.className = "city-card__actions";

  const starBtn = document.createElement("button");
  starBtn.className = `city-card__btn city-card__btn--star${city.favorite ? " is-favorite" : ""}`;
  starBtn.dataset.action = "favorite";
  starBtn.setAttribute("aria-label", city.favorite ? "Remove from favorites" : "Add to favorites");
  const starIcon = document.createElement("i");
  starIcon.className = `fa-${city.favorite ? "solid" : "regular"} fa-star`;
  starBtn.appendChild(starIcon);

  const deleteBtn = document.createElement("button");
  deleteBtn.className = "city-card__btn city-card__btn--delete";
  deleteBtn.dataset.action = "delete";
  deleteBtn.setAttribute("aria-label", "Remove city");
  const trashIcon = document.createElement("i");
  trashIcon.className = "fa-solid fa-trash-can";
  deleteBtn.appendChild(trashIcon);

  actions.append(starBtn, deleteBtn);
  li.append(info, actions);
  return li;
}


// HTML helper for renderCities

function createEmptyState() {
  const li = document.createElement("li");
  li.className = "city-card city-card--empty";

  const icon = document.createElement("i");
  icon.className = "fa-solid fa-magnifying-glass";

  const span = document.createElement("span");
  span.textContent = "No recent cities yet.";

  li.append(icon, span);
  return li;
}


function renderCities() {
  const cities = getSavedCities();

  const favorites = cities.filter(c => c.favorite);
  const recent = cities.filter(c => !c.favorite);

  // Favorites section
  if (favorites.length) {
    favoritesSection.hidden = false;
    favoritesList.innerHTML = "";
    favorites.forEach(city => favoritesList.appendChild(createCityCard(city)));
  } else {
    favoritesSection.hidden = true;
  }

  // Recent section
  if (recent.length) {
    recentSection.hidden = false;
    recentList.innerHTML = "";
    recent.forEach(city => recentList.appendChild(createCityCard(city)));
  } else {
    recentList.innerHTML = "";
    recentList.appendChild(createEmptyState());
    recentSection.hidden = false;
  }
}

// Single event listener

document.querySelector(".cities-content").addEventListener("click", (e) => {
  const btn = e.target.closest("[data-action]");
  if (!btn) return;

  const card = btn.closest(".city-card");
  if (!card) return;

  const { name, country } = card.dataset;
  const action = btn.dataset.action;

  if (action === "navigate") {
    navigateToCity(name, country);
  }

  if (action === "favorite") {
    const isFav = toggleFavorite(name, country);
    const icon = btn.querySelector("i");
    icon.className = `fa-${isFav ? "solid" : "regular"} fa-star`;
    btn.classList.toggle("is-favorite", isFav);
    btn.setAttribute("aria-label", isFav ? "Remove from favorites" : "Add to favorites");
    // Re-render to move card between sections
    renderCities();
  }

  if (action === "delete") {
    const card = btn.closest(".city-card");
    card.classList.add("city-card--removing");
    card.addEventListener("animationend", () => {
      deleteCity(name, country);
      renderCities();
    }, { once: true });
  }
});

renderCities();
highlightActiveNav();