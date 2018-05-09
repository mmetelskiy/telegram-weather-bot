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

const getCurrentWeather = function (params, callback) {
  weatherRequest({
    uri: '/weather',
    qs: params
  }, function processApiResponse(error, response, body) {
    if (error) {
      callback(new WError(error, 'Failed to request weather api.'));
    } else if (response.statusCode !== 200) {
      callback(new WError('Unexpected %s status rom weather api.', response.statusCode));
    } else {
      callback(null, body);
    }
  });
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

exports.getFiveDaysForecast = function () {

};
