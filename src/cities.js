import { getSavedCities } from "./storage.js";
import { highlightActiveNav } from "./ui.js";

const list = document.querySelector("#cities-list");
const cities = getSavedCities();

if (!cities.length) {
  list.innerHTML = "<li>No cities saved yet</li>";
} else {
  cities.forEach(city => {
    const li = document.createElement("li");
    li.textContent = `${city.name}, ${city.country}`;

    li.addEventListener("click", () => {
        localStorage.setItem("selectedCity", city.name);

        // move city to top
        const cities = getSavedCities().filter(
            c => !(c.name === city.name && c.country === city.country)
        );

        cities.unshift(city);
        localStorage.setItem("recentCities", JSON.stringify(cities));

        location.href = "index.html";
    });


    list.appendChild(li);
  });
}

highlightActiveNav();
