// Should i do them in english cuz everything else is in english? maybe not, maybe the spanish adds a bit of flavor, idk
// If you want to add more recommendations, here's documentation for weather codes: https://openweathermap.org/weather-conditions
const RECOMMENDATIONS = {
  // Thunderstorm (2xx)
  Thunderstorm: [
    { icon: "fa-mug-hot",              label: "Ocio",      text: "Día perfecto para una sesión de spa o relax en el hotel." },
    { icon: "fa-film",                 label: "Ocio",      text: "Aprovecha para ir al cine o explorar una galería de arte." },
    { icon: "fa-book",                 label: "Ocio",      text: "Una librería acogedora es el refugio ideal con tormenta." },
    { icon: "fa-gamepad",              label: "Ocio",      text: "Explora bares de videojuegos o salones de juegos de mesa." },
    { icon: "fa-landmark",             label: "Cultura",   text: "Los museos de historia natural o ciencia son perfectos para días de tormenta." },
    { icon: "fa-utensils",             label: "Cultura",   text: "Descubre la gastronomía local en un restaurante con ambiente." },
    { icon: "fa-triangle-exclamation", label: "Consejo",   text: "Evita zonas abiertas y ten el teléfono cargado." },
    { icon: "fa-car",                  label: "Consejo",   text: "Si conduces, reduce velocidad y mantén distancia de seguridad." },
  ],

  // Drizzle (3xx)
  Drizzle: [
    { icon: "fa-mug-saucer",           label: "Ocio",      text: "Recorre las cafeterías locales con un buen libro." },
    { icon: "fa-spa",                  label: "Ocio",      text: "Un día de spa o baños termales aprovecha la humedad del ambiente." },
    { icon: "fa-landmark",             label: "Cultura",   text: "Ideal para visitar museos o centros históricos cubiertos." },
    { icon: "fa-paint-brush",          label: "Cultura",   text: "Galería de arte o taller creativo: el clima lluvioso inspira." },
    { icon: "fa-utensils",             label: "Cultura",   text: "Prueba un restaurante local que siempre quisiste visitar." },
    { icon: "fa-umbrella",             label: "Consejo",   text: "Lleva paraguas o impermeable ligero." },
    { icon: "fa-shoe-prints",          label: "Consejo",   text: "Opta por calzado impermeable o cerrado." },
  ],

  // Rain (5xx)
  Rain: [
    { icon: "fa-landmark",             label: "Cultura",   text: "Perfecta oportunidad para museos, acuarios o galerías." },
    { icon: "fa-fish",                 label: "Cultura",   text: "Los acuarios y oceanarios son experiencias únicas bajo la lluvia." },
    { icon: "fa-utensils",             label: "Cultura",   text: "Explora la gastronomía local en restaurantes de interior." },
    { icon: "fa-mug-saucer",           label: "Ocio",      text: "Tarde de café de especialidad en el barrio más bohemio." },
    { icon: "fa-film",                 label: "Ocio",      text: "Sesión de cine o teatro local: cultura y resguardo en uno." },
    { icon: "fa-spa",                  label: "Ocio",      text: "Día de spa: la lluvia y la relajación van de la mano." },
    { icon: "fa-umbrella",             label: "Consejo",   text: "Lleva paraguas y calzado impermeable." },
    { icon: "fa-shirt",                label: "Consejo",   text: "Lleva una muda extra de ropa por si te mojas." },
  ],

  // Snow (6xx)
  Snow: [
    { icon: "fa-person-skiing",        label: "Aire libre", text: "Si hay pistas cercanas, ¡es el momento para esquiar!" },
    { icon: "fa-snowman",              label: "Aire libre", text: "Construye un muñeco de nieve o disfruta del paisaje nevado." },
    { icon: "fa-camera",               label: "Cultura",   text: "El paisaje nevado es perfecto para fotografía urbana." },
    { icon: "fa-landmark",             label: "Cultura",   text: "Los mercados navideños o invernales son mágicos con nieve." },
    { icon: "fa-mug-hot",              label: "Ocio",      text: "Chocolate caliente y chimenea: los mejores compañeros de nieve." },
    { icon: "fa-mitten",               label: "Consejo",   text: "Abrígate bien: abrigo, guantes y calzado antideslizante." },
    { icon: "fa-car",                  label: "Consejo",   text: "Conduce solo si es necesario; las calles pueden estar heladas." },
  ],

  // Atmosphere (fog, mist, haze) (7xx)
  Atmosphere: [
    { icon: "fa-person-walking",       label: "Aire libre", text: "Paseo lento por el centro histórico con ambiente misterioso." },
    { icon: "fa-camera",               label: "Aire libre", text: "La niebla crea fotos atmosféricas increíbles en parques y puentes." },
    { icon: "fa-mug-saucer",           label: "Ocio",      text: "Los cafés con vista a la niebla tienen su encanto propio." },
    { icon: "fa-book",                 label: "Ocio",      text: "Día de lectura o podcast en un rincón acogedor." },
    { icon: "fa-landmark",             label: "Cultura",   text: "Visita monumentos históricos; la neblina les da un aire cinematográfico." },
    { icon: "fa-car",                  label: "Consejo",   text: "Conduce con precaución y usa luces antiniebla." },
    { icon: "fa-eye-slash",            label: "Consejo",   text: "La visibilidad puede ser baja; ve despacio en zonas desconocidas." },
  ],

  // Clear (800)
  Clear: [
    { icon: "fa-person-biking",        label: "Aire libre", text: "Clima ideal para ciclismo, senderismo o tour a pie por la ciudad." },
    { icon: "fa-umbrella-beach",       label: "Aire libre", text: "Si hay costa o alberca cerca, es el día perfecto para disfrutarla." },
    { icon: "fa-person-hiking",        label: "Aire libre", text: "Ruta de senderismo o mirador: las vistas con cielo despejado son espectaculares." },
    { icon: "fa-sailboat",             label: "Aire libre", text: "Día ideal para actividades acuáticas: kayak, vela o snorkel." },
    { icon: "fa-camera",               label: "Cultura",   text: "Luz natural perfecta para fotografiar arquitectura y paisajes urbanos." },
    { icon: "fa-map-location-dot",     label: "Cultura",   text: "Tour histórico a pie: el buen tiempo hace que todo sea más disfrutable." },
    { icon: "fa-sun",                  label: "Consejo",   text: "Usa protector solar (mínimo SPF 30) y mantente hidratado." },
    { icon: "fa-hat-cowboy",           label: "Consejo",   text: "Sombrero o gorra te ayudarán en las horas de mayor sol." },
    { icon: "fa-dice",                 label: "Consejo",   text: "ES TU DÍA DE SUERTE. TODO AL ROJO." },

  ],

  // Clouds (80x)
  Clouds: [
    { icon: "fa-camera",               label: "Cultura",   text: "Luz difusa perfecta para fotografía y recorridos arquitectónicos." },
    { icon: "fa-person-walking",       label: "Aire libre", text: "Temperatura agradable para explorar mercados al aire libre o parques." },
    { icon: "fa-person-biking",        label: "Aire libre", text: "Cielo nublado: condiciones ideales para ciclismo sin calor excesivo." },
    { icon: "fa-mug-saucer",           label: "Ocio",      text: "Temperatura perfecta para sentarse en una terraza exterior." },
    { icon: "fa-landmark",             label: "Cultura",   text: "Sin sol directo, los recorridos por zonas históricas son más cómodos." },
    { icon: "fa-utensils",             label: "Cultura",   text: "Mercados gastronómicos al aire libre: el clima nublado es ideal." },
    { icon: "fa-shirt",                label: "Consejo",   text: "Lleva una chaqueta ligera por si refresca por la tarde." },
  ],
};

// Fallback
const FALLBACK = [
  { icon: "fa-map-location-dot", label: "Turismo",  text: "Explora la ciudad a tu propio ritmo." },
  { icon: "fa-utensils",         label: "Cultura",  text: "Prueba la gastronomía local en un restaurante típico." },
  { icon: "fa-circle-info",      label: "Consejo",  text: "Consulta las condiciones locales antes de salir." },
];

// Label, better colors
const LABEL_COLORS = {
  "Aire libre": { bg: "rgba(52, 211, 153, 0.12)", color: "#34d399" },
  "Cultura":    { bg: "rgba(129, 140, 248, 0.12)", color: "#818cf8" },
  "Ocio":       { bg: "rgba(251, 191, 36, 0.12)",  color: "#fbbf24" },
  "Consejo":    { bg: "rgba(248, 113, 113, 0.12)", color: "#f87171" },
  "Turismo":    { bg: "rgba(56, 189, 248, 0.12)",  color: "#38bdf8" },
};



function getRecommendationKey(weather) {
  const id = weather.id;

  if (id >= 200 && id < 300) return "Thunderstorm";
  if (id >= 300 && id < 400) return "Drizzle";
  if (id >= 500 && id < 600) return "Rain";
  if (id >= 600 && id < 700) return "Snow";
  if (id >= 700 && id < 800) return "Atmosphere";
  if (id === 800)            return "Clear";
  if (id > 800)              return "Clouds";

  return weather.main;
}

function pickRandom(arr, count) {
  const pool = [...arr];
  const limit = Math.min(count, pool.length);

  for (let i = 0; i < limit; i++) {
    const j = Math.floor(Math.random() * (pool.length - i)) + i;
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }

  return pool.slice(0, limit);
}

// HTML helper for renderRecommendations

function createRecommendationCard(rec) {
  const li = document.createElement("li");
  li.className = "rec-card";

  // Icon
  const iconWrap = document.createElement("div");
  iconWrap.className = "rec-card__icon";
  const icon = document.createElement("i");
  icon.className = `fa-solid ${rec.icon}`;
  iconWrap.appendChild(icon);

  // Body
  const body = document.createElement("div");
  body.className = "rec-card__body";

  // Label pill
  const pill = document.createElement("span");
  pill.className = "rec-card__label";
  pill.textContent = rec.label;

  const colors = LABEL_COLORS[rec.label] ?? LABEL_COLORS["Turismo"];
  pill.style.setProperty("--pill-bg",    colors.bg);
  pill.style.setProperty("--pill-color", colors.color);

  // Text
  const text = document.createElement("p");
  text.className = "rec-card__text";
  text.textContent = rec.text;

  body.append(pill, text);
  li.append(iconWrap, body);
  return li;
}

function createSkeletonCard() {
  const li = document.createElement("li");
  li.className = "rec-card rec-card--skeleton";
  li.setAttribute("aria-busy", "true");
  li.setAttribute("aria-label", "Loading recommendation");

  const iconWrap = document.createElement("div");
  iconWrap.className = "rec-card__icon skeleton-box";

  const body = document.createElement("div");
  body.className = "rec-card__body";

  const pill = document.createElement("span");
  pill.className = "rec-card__label skeleton-box";
  pill.style.width = "60px";
  pill.style.height = "18px";

  const text = document.createElement("p");
  text.className = "rec-card__text skeleton-box";
  text.style.height = "40px";

  body.append(pill, text);
  li.append(iconWrap, body);
  return li;
}

export function renderRecommendationsPlaceholder() {
  const list  = document.querySelector("[data-recommendations]");
  const badge = document.querySelector("[data-rec-condition]");
  if (!list) return;

  if (badge) badge.textContent = "—";

  list.innerHTML = "";
  const fragment = document.createDocumentFragment();
  for (let i = 0; i < 3; i++) fragment.appendChild(createSkeletonCard());
  list.appendChild(fragment);
}

export function renderRecommendations(weather) {
  const list  = document.querySelector("[data-recommendations]");
  const badge = document.querySelector("[data-rec-condition]");
  if (!list) return;

  const key  = getRecommendationKey(weather);
  const pool = RECOMMENDATIONS[key] ?? FALLBACK;
  const recs = pickRandom(pool, 3);

  if (badge) badge.textContent = weather.main;

  list.innerHTML = "";
  const fragment = document.createDocumentFragment();
  recs.forEach(rec => fragment.appendChild(createRecommendationCard(rec)));
  list.appendChild(fragment);
}