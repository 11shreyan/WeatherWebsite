const cityInput = document.querySelector(".city-input");
const searchButton = document.querySelector(".search-btn");
const loctionButton = document.querySelector(".location-btn");
const CurrentweatherDiv = document.querySelector(".current-weather");
const weatherCardsDiv = document.querySelector(".weather-cards");

const API_KEY = "a30ccc2c9fa130643b2de4987dbe1ad2"; // Unique API key from OpenWeatherApp

const createWeatherCard = (cityName, weatherItem, index) => {
    if (index === 0) { // HTML part for the main weather card
        return ` <div class="details">
                    <h2>${cityName} (${weatherItem.dt_txt.split(" ")[0]})</h2>
                    <h4>Temperature: ${(weatherItem.main.temp - 273.15).toFixed(2)}°C</h4>
                    <h4>Wind: ${weatherItem.wind.speed} M/S</h4>
                    <h4>Humidity: ${weatherItem.main.humidity}%</h4>
                </div>
                <div class="icon">
                    <img src="https://openweathermap.org/img/wn/${weatherItem.weather[0].icon}10d@4x.png" alt="weather-icon" class="src">
                    <h4>${weatherItem.weather[0].description}</h4>
                </div>`;
    } else { // HTML part for the 5-day weather cards
        return `<li class="card">
                    <h3>(${weatherItem.dt_txt.split(" ")[0]})</h3>
                    <img src="https://openweathermap.org/img/wn/${weatherItem.weather[0].icon}10d@2x.png" alt="weather-icon" class="src">
                    <h4>Temp: ${(weatherItem.main.temp - 273.15).toFixed(2)}°C</h4>
                    <h4>Wind: ${weatherItem.wind.speed} M/S</h4>
                    <h4>Humidity: ${weatherItem.main.humidity}%</h4>
                </li>`; 
    }
}

const getWeatherDetails = (cityName, lat, lon) => {
    const WEATHER_API_URL = `http://api.openweathermap.org/data/2.5/forecast/?lat=${lat}&lon=${lon}&appid=${API_KEY}`;

    fetch(WEATHER_API_URL).then(res => res.json()).then(data => {
        //  Displays only one day weather forecast
        const uniqueForecastDays = []; 
        const fiveDaysForecast = data.list.filter(forecast => {
            const forecastDate = new Date(forecast.dt_txt).getDate();
            if(!uniqueForecastDays.includes(forecastDate)) {
                return uniqueForecastDays.push(forecastDate);
            }
        });

        // To clear previous data
        cityInput.value = "";
        CurrentweatherDiv.innerHTML = "";
        weatherCardsDiv.innerHTML = "";

        // Weather cards creation and adding them to the DOM
        fiveDaysForecast.foreach((weatherItem, index) => {
            if(index === 0) {
                CurrentweatherDiv.insertAdjacentHTML("beforeend", createWeatherCard(cityName, weatherItem, index)); 
            } else {
                weatherCardsDiv.insertAdjacentHTML("beforeend", createWeatherCard(cityName, weatherItem, index)); 
            }
        });
    }).catch(() => {
        alert("An error occured while fetching the weather forecast!");
    });
}

const getCityCoordinates = () => {
    const cityName = cityInput.value.trim(); // removes extra spaces from the user input for the city name
    if(!cityName) return; 
    const GEOCODING_API_URL = `http://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=1&appid=${API_KEY}`;

    // To get the (name, latitude, and longitude) of the entered city with the help of API.
    fetch(GEOCODING_API_URL).then(res => res.json()).then(data => {
        if(!data.length) return alert(`No coordinates found for ${cityName}`);
        const { name, lat, lon } =  data[0];
        getWeatherDetails(name, lat, lon);
    }).catch(() => {
        alert("An error occured while fetching the coordinates!");
    });
}

getUserCoordinates = () => {
    navigator.geolocation.getCurrentPosition(
        position => {
            const { latitude, longitude} = position.coords; // User co-ordinates
            const REVERSE_GEOCODING_URL = `http://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=1&appid={API_KEY}`;

            // City name from coordinates using reverse geocoding API.
            fetch(REVERSE_GEOCODING_URL).then(res => res.json()).then(data => {
                const { name, latitude, longitude } =  data[0];
                getWeatherDetails(name, latitude, longitude);
            }).catch(() => {
                alert("An error occured while fetching the city!");
            });
        },
        error => {
            if(error.code === error.PERMISSION_DENIED) {
                alert("Geolocation request denied by user. Please reset location permission to grant access again.");
            }
        }
    );
}

cityInput.addEventListener("keyup", e => e.key === "Enter" && getCityCoordinates());
searchButton.addEventListener("click", getUserCoordinates);
locationButton.addEventListener("click", getCityCoordinates);