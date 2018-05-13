const request = require('request');
const WError = require('verror').WError;

const timezoneDBConfig = require('../config').timezone;

const timezoneRequest = request.defaults({
  baseUrl: timezoneDBConfig.baseUrl,
  json: true,
  qs: {
    key: timezoneDBConfig.token,
    format: 'json',
    by: 'position',
    fields: 'ountryName,zoneName,gmtOffset,dst'
  }
});

const getOffset = function (gmtOffset, isDstUsed) {
  return gmtOffset + (3600 * Number(isDstUsed));
}

exports.getUtcFullOffset = function (latitude, longitude, callback) {
  timezoneRequest({
    lat: latitude,
    lng: longitude
  }, function processApiResponse(error, response, body) {
    if (error) {
      callback(new WError(error, 'Failed to request timezone api.'));
    } else if (response.statusCode !== 200) {
      callback(new WError('Unexpected %s response code from timezone api.',
        response.statusCode));
    } else {
      callback(null, gmtOffset(body.gmtOffset || 0, isDstUsed || 0));
    }
  });
};
