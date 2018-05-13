const request = require('request');
const WError = require('verror').WError;

const weatherConfig = require('../config').weather;

const weatherRequest = request.defaults({
  baseUrl: weatherConfig.baseUrl,
  qs: {
    APPID: weatherConfig.token,
    units: 'metric'
  },
  json: true
});

/*
  {
    coord: {
      lon,
      lat
    },
    weather: [
      {
        id,
        main,
        description,
        icon
      }
    ],
    base,
    main: {
      temp,
      pressure,
      humidity,
      temp_min,
      temp_max,
      sea_level,
      grnd_level
    },
    wind: {
      speed,
      deg
    },
    clouds: {
      all
    },
    rain: {
      3h
    },
    snow: {
      3h
    },
    dt,
    sys: {
      type,
      id,
      message,
      country,
      sunrise,
      sunset
    },
    id,
    name,
    cod
  }
*/

const makeApiCall = function (uri, qs, callback) {
  weatherRequest({
    uri,
    qs
  }, function processApiResponse(error, response, body) {
    if (error) {
      callback(new WError(error, 'Failed to request weather api.'));
    } else if (response.statusCode !== 200) {
      callback(new WError('Unexpected %s status from weather api.', response.statusCode));
    } else {
      callback(null, body);
    }
  });
}

const getCurrentWeather = function (params, callback) {
  makeApiCall('/weather', params, callback);
};

const getWeatherForecast = function (params, callback) {
  makeApiCall('/forecast', params, callback);
};

exports.getCurrentWeatherByLocation = function ({ longitude, latitude }, callback) {
  getCurrentWeather({
    lat: latitude,
    lon: longitude
  }, function processWeather(error, result) {
    if (error) {
      callback(new WError(error, 'Failed to get current weather.'));
    } else {
      callback(null, result);
    }
  });
};

exports.get24hForecastByCity = function (city, callback) {
  getWeatherForecast({
    q: city
  }, function processWeather(error, result) {
    if (error) {
      callback(new WError(error, 'Failed to get weather forecast.'));
    } else {
      const weatherListItems = result &&
        Array.isArray(result.list) &&
        result.list.slice(0, 8);

      callback(null, {
        ...result,
        cnt: weatherListItems.length,
        list: weatherListItems
      });
    }
  });
};
