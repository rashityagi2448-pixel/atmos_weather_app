// Paste a NEW WeatherAPI key here. Do not publish a real key in a public repository.
const API_KEY = "PASTE_YOUR_WEATHERAPI_KEY_HERE";
const API_URL = "https://api.weatherapi.com/v1/current.json";

const form = document.getElementById("searchForm");
const input = document.getElementById("locationInput");
const button = document.getElementById("searchButton");
const statusMessage = document.getElementById("statusMessage");
const weatherPanel = document.getElementById("weatherPanel");

const $ = (id) => document.getElementById(id);

function setStatus(message = "", type = "") {
  statusMessage.textContent = message;
  statusMessage.className = `status ${type}`;
}

function weatherTip(condition, temp, humidity) {
  const text = condition.toLowerCase();
  if (text.includes("rain") || text.includes("drizzle") || text.includes("thunder"))
    return "Rain may be around. Keep an umbrella handy and enjoy the cosy weather.";
  if (text.includes("snow") || text.includes("sleet"))
    return "It's a chilly one outside. Layer up and keep yourself warm.";
  if (temp >= 35) return "It's hot outside. Stay hydrated and try to avoid the midday sun.";
  if (temp >= 28) return "A warm day ahead. Light clothes and plenty of water are a good idea.";
  if (humidity >= 80) return "The air is quite humid. Choose breathable clothes and take it easy.";
  if (text.includes("sun") || text.includes("clear"))
    return "A bright sky is calling. It's a lovely time to step outside.";
  if (text.includes("cloud")) return "A cloudy sky creates a softer day. A light layer may come in handy.";
  return "Take a moment to enjoy the day, whatever the sky has planned.";
}

function setWeatherArt(conditionText, isDay) {
  const art = $("weatherArt");
  const c = conditionText.toLowerCase();
  art.className = "weather-art";
  if (c.includes("rain") || c.includes("drizzle") || c.includes("thunder") || c.includes("sleet")) {
    art.classList.add("rain");
  } else if (c.includes("cloud") || c.includes("overcast") || c.includes("mist") || c.includes("fog")) {
    art.classList.add("cloudy");
  } else if (c.includes("sun") || c.includes("clear")) {
    art.classList.add("sunny");
  }
  if (!isDay) art.style.filter = "hue-rotate(35deg) brightness(.8)";
  else art.style.filter = "";
}

function formatLocalTime(localtime) {
  const parts = localtime.split(" ");
  return parts.length === 2 ? parts[1] : localtime;
}

function renderWeather(data) {
  const { location, current } = data;
  $("cityName").textContent = location.name;
  $("locationMeta").textContent = [location.region, location.country].filter(Boolean).join(" · ");
  $("localTime").textContent = formatLocalTime(location.localtime);
  $("temperature").textContent = Math.round(current.temp_c);
  $("conditionText").textContent = current.condition.text;
  $("feelsLike").textContent = `${Math.round(current.feelslike_c)}°C`;
  $("humidity").innerHTML = `${current.humidity}<small>%</small>`;
  $("wind").innerHTML = `${current.wind_kph}<small> km/h</small>`;
  $("visibility").innerHTML = `${current.vis_km}<small> km</small>`;
  $("pressure").innerHTML = `${Math.round(current.pressure_mb)}<small> mb</small>`;
  $("cloud").innerHTML = `${current.cloud}<small>%</small>`;
  $("uvIndex").textContent = current.uv;
  $("weatherTip").textContent = weatherTip(current.condition.text, current.temp_c, current.humidity);
  $("updatedAt").textContent = `Updated ${current.last_updated.split(" ")[1]}`;
  $("detailDate").textContent = new Date().toLocaleDateString(undefined, { weekday: "long", month: "short", day: "numeric" }).toUpperCase();
  setWeatherArt(current.condition.text, current.is_day);
  weatherPanel.style.animation = "none";
  requestAnimationFrame(() => { weatherPanel.style.animation = ""; });
}

async function getWeather(place) {
  const query = place.trim();
  if (!query) {
    setStatus("Please enter a city or location to search.");
    input.focus();
    return;
  }
  if (API_KEY === "PASTE_YOUR_WEATHERAPI_KEY_HERE") {
    setStatus("Add your WeatherAPI key in script.js first.", "error");
    return;
  }

  button.disabled = true;
  button.innerHTML = "<span>Loading</span><span>…</span>";
  setStatus("Finding the weather for you…", "loading");

  try {
    const url = new URL(API_URL);
    url.search = new URLSearchParams({ key: API_KEY, q: query, aqi: "yes" }).toString();
    const response = await fetch(url);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data?.error?.message || "Unable to find weather for that location.");
    }

    renderWeather(data);
    setStatus("");
    input.value = data.location.name;
  } catch (error) {
    setStatus(error.message || "Something went wrong. Please try again.", "error");
  } finally {
    button.disabled = false;
    button.innerHTML = "<span>Explore</span><span aria-hidden='true'>↗</span>";
  }
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  getWeather(input.value);
});

document.querySelectorAll(".city-chip").forEach((chip) => {
  chip.addEventListener("click", () => {
    input.value = chip.dataset.city;
    getWeather(chip.dataset.city);
  });
});

$("todayLabel").textContent = new Date().toLocaleDateString(undefined, {
  weekday: "long", month: "long", day: "numeric"
}).toUpperCase();

// Load a welcoming default city on first visit.
getWeather("London");
