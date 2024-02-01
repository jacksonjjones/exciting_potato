var apiKey = "0ba8cf5bfc8f65eb31ed52a9b2605a18";
var savedSearches = [];

var searchHistoryList = function(cityName) {

    var searchHistoryEntry = $("<p>");
    searchHistoryEntry.text(cityName);

    var searchEntryContainer = $("<div>");
    searchEntryContainer.addClass("past-search-container");

    searchEntryContainer.append(searchHistoryEntry);

    var searchHistoryContainerEl = $("#search-history-container");
    searchHistoryContainerEl.append(searchEntryContainer);

    if (savedSearches.length > 0){
        var previousSavedSearches = localStorage.getItem("savedSearches");
        savedSearches = JSON.parse(previousSavedSearches);
    }

    savedSearches.push(cityName);
    localStorage.setItem("savedSearches", JSON.stringify(savedSearches));

    $("#searched-city").val("");

};

var loadSearchHistory = function() {
    var savedSearchHistory = localStorage.getItem("savedSearches");

    if (!savedSearchHistory) {
        return false;
    }

    savedSearchHistory = JSON.parse(savedSearchHistory);

    for (var i = 0; i < savedSearchHistory.length; i++) {
        searchHistoryList(savedSearchHistory[i]);
    }
};

var currentWeatherSection = function(cityName) {
    
    fetch(`https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${apiKey}&units=imperial`)

        .then(function(response) {
            return response.json();
        })
        
        .then(function(response) {
            var cityLon = response.coord.lon;
            var cityLat = response.coord.lat;

            fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${cityLat}&lon=${cityLon}&appid=${apiKey}&units=imperial`)

                .then(function(response) {
                    return response.json();
                })
                
                .then(function(response){
                    searchHistoryList(cityName);

                    var currentWeatherContainer = $("#current-weather-container");
                    currentWeatherContainer.addClass("current-weather-container");

                    var currentTitle = $("#current-title");
                    var currentDay = dayjs().format("M/D/YYYY");
                    currentTitle.text(`${cityName} ${currentDay}`);
                    var currentIcon = $("#current-weather-icon");
                    currentIcon.addClass("current-weather-icon");
                    var currentIconCode = response.weather[0].icon;
                    currentIcon.attr("src", `https://openweathermap.org/img/wn/${currentIconCode}@2x.png`);

                    var currentTemperature = $("#current-temperature");
                    currentTemperature.text("Temperature: " + response.main.temp + " \u00B0F");

                    var currentHumidity = $("#current-humidity");
                    currentHumidity.text("Humidity: " + response.main.humidity + "%");

                    var currentWindSpeed = $("#current-wind-speed");
                    currentWindSpeed.text("Wind Speed: " + response.wind.speed + " MPH");

                })

        })
};

var fiveDayForecastSection = function(cityName) {
    fetch(`https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${apiKey}&units=imperial`)
        
        .then(function(response) {
            return response.json();
            
        })
        .then(function(response) {
            var cityLon = response.coord.lon;
            var cityLat = response.coord.lat;

            fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${cityLat}&lon=${cityLon}&appid=${apiKey}&units=imperial`)
                
                .then(function(response) {
                    return response.json();
                })

                .then(function(response) {
                    
                    var uniqueForecastDays = [];
                    var fiveDaysForecast = response.list.filter(function(forecast){
                        var forecastDateTime = new Date(forecast.dt_txt);
                        var forecastDate = forecastDateTime.getDate();
                        var forecastTime = forecastDateTime.getHours();

                        if(!uniqueForecastDays.includes(forecastDate) && forecastTime === 15) {
                            return uniqueForecastDays.push(forecastDate);
                        } 
                    });

                    var futureForecastTitle = $("#future-forecast-title");
                    futureForecastTitle.text("5-Day Forecast:")

                    var futureCard = $("#future-forecast-container");
                    futureCard.addClass("future-forecast-container");
                    
                    for (var i = 0; i <= fiveDaysForecast.length; i++) {
                        var futureCard = $(".future-card");
                        futureCard.addClass("future-card-details");

                        var futureDate = $("#future-date-" + i);
                        date = dayjs().add(i, "d").format("M/D/YYYY");
                        futureDate.text(date);

                        if (fiveDaysForecast[i] && fiveDaysForecast[i].weather && fiveDaysForecast[i].weather[0]) {
                        var futureIcon = $("#future-icon-" + (i + 1));
                        futureIcon.addClass("future-icon");
                        var futureIconCode = fiveDaysForecast[i].weather[0].icon;
                        futureIcon.attr("src", `https://openweathermap.org/img/wn/${futureIconCode}@2x.png`);

                        var futureTemp = $("#future-temp-" + (i + 1));
                        futureTemp.text("Temp: " + fiveDaysForecast[i].main.temp + " \u00B0F");

                        var futureWind = $("#future-wind-" + (i + 1));
                        futureWind.text("Wind Speed: " + fiveDaysForecast[i].wind.speed + "MPH");

                        var futureHumidity = $("#future-humidity-" + (i + 1));
                        futureHumidity.text("Humidity: " + fiveDaysForecast[i].main.humidity + "%");
                        }
                    }
                })
       
        });
};

$("#search-input").on("submit", function(event) {
    event.preventDefault();
    
    var cityName = $("#searched-city").val();

        currentWeatherSection(cityName);
        fiveDayForecastSection(cityName);
    
});

$("#search-history-container").on("click", "p", function() {
    var previousCityName = $(this).text();
    currentWeatherSection(previousCityName);
    fiveDayForecastSection(previousCityName);

    var previousCityClicked = $(this);
    previousCityClicked.remove();
});


loadSearchHistory();
