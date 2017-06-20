// api key from js/secrets.js
var wundergroundAPIKey;

// dev mode
// set true to full from local js/dev json files
// set false to pull from api
var devMode = true;
var zipCode = '29708';

// user preferences
var myMaxTemp            = 90;
var myMinTemp            = 50;
var myMaxPrecip          = 51;
var myMaxWinds           = 15;
var willIRideInRain      = true;
var willIRideAtNight     = false;

// top card
var currentCondition     = "Sunny";
var observedTemp         = 88;
var observedHighTemp     = 99;
var observedLowTemp      = 77;
var currentChancePrecip  = 11;
var observedWindSpeed    = 11;
var observedGust         = 22;
var sunrise              = "1:11am";
var sunset               = "1:11pm";
var observedTime         = "Last Updated on June 18, 10:00"

// morning afternoon evening cards
var morningCondition     = "Sunny";
var afternoonCondition   = "Partly Cloudy";
var eveningCondition     = "Chance of Rain";

// populating top card with defaults
document.getElementById("day-current-temp").textContent  = observedTemp;
document.getElementById("day-high").textContent          = observedHighTemp;
document.getElementById("day-low").textContent           = observedLowTemp;
document.getElementById("chance-of-precip").textContent  = currentChancePrecip;
document.getElementById("sunrise").textContent           = sunrise;
document.getElementById("sunset").textContent            = sunset;
document.getElementById("wind-speed").textContent        = observedWindSpeed;
document.getElementById("wind-gust").textContent         = observedGust;

// observed time for refresh
document.getElementById("today-observed-time").textContent = observedTime;

//setting icon - TODO: add all available
function setIconBasedOnCondition(condition, id) {
  if (condition == "Sunny") {
    document.getElementById(id).src = "img/conditions/day/clear.svg";
  } else if (condition == "Partly Cloudy") {
    document.getElementById(id).src = "img/conditions/day/partlycloudy.svg";
  } else if (condition == "Mostly Cloudy") {
    document.getElementById(id).src = "img/conditions/day/mostlycloudy.svg";
  } else if (condition == "Chance of Rain") {
    document.getElementById(id).src = "img/conditions/day/chancerain.svg";
  } else if (condition == "Rain") {
    document.getElementById(id).src = "img/conditions/day/rain.svg";
  }
}

// decision algorithm - not currently working with json request data
function yesDecision() {
  document.getElementById("decision").textContent = "Yes";
  document.getElementById("decision-image").src   = "img/emotions/thumbup.svg";
}

function noDecision() {
  document.getElementById("decision").textContent = "No";
  document.getElementById("decision-image").src   = "img/emotions/sad.svg";
  applyNoDecisionColor("current-conditions-card");
}

function applyNoDecisionColor(id) {
  document.getElementById(id).classList.add("no-ride-table");
}

// actual logic for ride or no tide
function calculateRideOrNoRide() {

 return new Promise(resolve => {
   if (
     myMaxTemp   > observedTemp        &&
     myMaxWinds  > observedWindSpeed   &&
     myMaxPrecip > currentChancePrecip
   ) {
     yesDecision();
     resolve();
   } else {
     noDecision();
     resolve();
   }
 });
}

if (devMode) {
  // use local copies of json
  var wundergroundConditionsURL      = 'js/dev/conditions.json'
  var wundergroundForecast10dayURL   = 'js/dev/forecast10day.json'
  var wundergroundAstronomyURL       = 'js/dev/astronomy.json'
  console.log("dev mode active - using local data");
} else {
  // use wunderground weather api
  var wundergroundAPIKey = WUNDERGROUNDAPIKEY;
  var wundergroundConditionsURL      = 'http://api.wunderground.com/api/' + wundergroundAPIKey + '/geolookup/conditions/q/'    + zipCode + '.json';
  var wundergroundForecast10dayURL   = 'http://api.wunderground.com/api/' + wundergroundAPIKey + '/geolookup/forecast10day/q/' + zipCode + '.json';
  var wundergroundAstronomyURL       = 'http://api.wunderground.com/api/' + wundergroundAPIKey + '/geolookup/astronomy/q/'     + zipCode + '.json';
  console.log("dev mode inactive. You're LIVE");
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

async function getWeatherAndCompute() {
  var conditionsData    = await getWundergroundJSON(wundergroundConditionsURL);
  var forecast10dayData = await getWundergroundJSON(wundergroundForecast10dayURL);
  var astronomyData     = await getWundergroundJSON(wundergroundAstronomyURL);
  console.log(conditionsData);    // debug
  console.log(forecast10dayData); // debug
  console.log(astronomyData);     // debug

  // conditionsData
  console.log("conditions temp: " + Math.round(conditionsData.current_observation.temp_f));    //debug
  console.log("conditions wind: " + Math.round(conditionsData.current_observation.wind_mph));  //debug
  document.getElementById("conditions-city-location").textContent = conditionsData.location.city;
  document.getElementById("day-current-temp").textContent         = Math.round(conditionsData.current_observation.temp_f);
  document.getElementById("wind-speed").textContent               = Math.round(conditionsData.current_observation.wind_mph);
  document.getElementById("wind-gust").textContent                = Math.round(conditionsData.current_observation.wind_gust_mph);
  document.getElementById("today-observed-time").textContent      = conditionsData.current_observation.observation_time;
  setIconBasedOnCondition(conditionsData.current_observation.weather, "current-condition-icon");
  console.log("Weather is " + conditionsData.current_observation.weather);
  observedTemp      = conditionsData.current_observation.temp_f
  observedWindSpeed = conditionsData.current_observation.wind_mph
  console.log("conditions temp as variable not rounded " + observedTemp);
  console.log("conditions temp as variable not rounded " + observedWindSpeed);

  // forecast10dayData
  console.log('JSON result: High ' + forecast10dayData.forecast.simpleforecast.forecastday[0].high.fahrenheit); // debug
  console.log('JSON result: Low '  + forecast10dayData.forecast.simpleforecast.forecastday[0].low.fahrenheit);  // debug
  document.getElementById("day-high").textContent            = forecast10dayData.forecast.simpleforecast.forecastday[0].high.fahrenheit;
  document.getElementById("day-low").textContent             = forecast10dayData.forecast.simpleforecast.forecastday[0].low.fahrenheit;
  document.getElementById("chance-of-precip").textContent    = forecast10dayData.forecast.simpleforecast.forecastday[0].pop;
  currentChancePrecip = forecast10dayData.forecast.simpleforecast.forecastday[0].pop;
  console.log("after Chance of precip is " + forecast10dayData.forecast.simpleforecast.forecastday[0].pop);

  // astronomyData
  console.log('JSON result: ' + astronomyData.sun_phase.sunrise.hour); // debug
  document.getElementById("sunrise").textContent = astronomyData.sun_phase.sunrise.hour + ":" +       astronomyData.sun_phase.sunrise.minute + " am";
  document.getElementById("sunset").textContent  = astronomyData.sun_phase.sunset.hour  - 12 + ":" +  astronomyData.sun_phase.sunset.minute  + " pm";

  // calculate after JSON, assigning variables, and updating DOM
  calculateRideOrNoRide();
}

getWeatherAndCompute();
