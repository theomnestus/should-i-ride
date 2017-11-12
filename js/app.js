// api key from js/secrets.js
var wundergroundAPIKey;

// dev mode
// set true to full from local js/dev json files
// set false to pull from api
var devMode = true;
var zipCode = '28280';

// user preferences
var myMaxTemp            = 100;
var myMinTemp            = 50;
var myMaxPrecip          = 60;
var myMaxWinds           = 15;
var willIRideInRain      = true;
var willIRideAtNight     = false;

// placeholder variables
var currentCondition     = "Sunny";
var observedTemp         = 77;
var observedHighTemp     = 88;
var observedLowTemp      = 66;
var currentChancePrecip  = 11;
var observedWindSpeed    = 22;
var observedGust         = 33;
var sunrise              = "1:11am";
var sunset               = "1:11pm";
var observedTime         = "Last Updated on June 18, 10:00"

//setting icon - TODO: add all available ---OR--- use images from json reponse
function setIconBasedOnCondition(condition, id) {
  if (condition == "Sunny") {
    document.getElementById(id).src = "img/conditions/day/clear.svg";
  } else if (condition == "Partly Cloudy") {
    document.getElementById(id).src = "img/conditions/day/partlycloudy.svg";
  } else if (condition == "Mostly Cloudy") {
    document.getElementById(id).src = "img/conditions/day/mostlycloudy.svg";
  } else if (condition == "Rain") {
    document.getElementById(id).src = "img/conditions/day/rain.svg";
  } else if (condition == "Chance of Rain") {
    document.getElementById(id).src = "img/conditions/day/chancerain.svg";
  } else if (condition == "Chance of a Thunderstorm") {
    document.getElementById(id).src = "img/conditions/day/chancetstorms.svg";
  } else if (condition == "Cloudy") {
    document.getElementById(id).src = "img/conditions/day/cloudy.svg";
  } else if (condition == "Snow") {
    document.getElementById(id).src = "img/conditions/day/snow.svg";
  }
}

// actual logic for ride or no tide
function calculateRideOrNoRide() {
   if (
     myMaxTemp   > observedTemp        &&
     myMaxWinds  > observedWindSpeed   &&
     myMaxPrecip > currentChancePrecip
   ) {
     yesDecision();
   } else {
     noDecision();
   }
}

if (devMode) {
  // use local copies of json to limit api call limits and use familiar data
  var wundergroundConditionsURL      = 'js/dev/clt-conditions.json'
  var wundergroundForecast10dayURL   = 'js/dev/clt-forecast10day.json'
  console.log("DEV MODE active, using local data."); // debug
} else {
  // use wunderground weather api for LIVE data
  var wundergroundAPIKey             = WUNDERGROUNDAPIKEY;
  var wundergroundConditionsURL      = 'http://api.wunderground.com/api/' + wundergroundAPIKey + '/geolookup/conditions/q/'    + zipCode + '.json';
  var wundergroundForecast10dayURL   = 'http://api.wunderground.com/api/' + wundergroundAPIKey + '/geolookup/forecast10day/q/' + zipCode + '.json';
  console.log("You're LIVE using wunderground data with your key.");
}

var getWundergroundJSON = function(url) {
  return new Promise(function(resolve, reject) {
    var xhr = new XMLHttpRequest();
    xhr.open('get', url, true);
    xhr.responseType = 'json';
    xhr.onload = function() {
      var status = xhr.status;
      if (status == 200) {
        resolve(xhr.response);
      } else {
        reject(status);
      }
    };
    xhr.send();
  });
};

// main function to get data and process
async function getWeatherAndCompute() {
  var conditionsData    = await getWundergroundJSON(wundergroundConditionsURL);
  var forecast10dayData = await getWundergroundJSON(wundergroundForecast10dayURL);

  console.log(conditionsData);    // debug
  console.log(forecast10dayData);    // debug

  document.getElementById("temp").textContent          = Math.round(conditionsData.current_observation.temp_f);
  document.getElementById("pop").textContent           = forecast10dayData.forecast.simpleforecast.forecastday[0].pop;
  document.getElementById("high-temp").textContent     = forecast10dayData.forecast.simpleforecast.forecastday[0].high.fahrenheit;
  document.getElementById("low-temp").textContent      = forecast10dayData.forecast.simpleforecast.forecastday[0].low.fahrenheit;
  document.getElementById("observed-time").textContent = conditionsData.current_observation.observation_time;

  var conditions = forecast10dayData.forecast.simpleforecast.forecastday[0].conditions
  document.getElementById("condition").textContent = conditions;
  setIconBasedOnCondition(conditions, "condition-icon");

  // calculateRideOrNoRide();
}
getWeatherAndCompute();
