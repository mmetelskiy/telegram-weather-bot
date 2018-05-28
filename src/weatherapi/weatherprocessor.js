const _ = require('lodash');
const moment = require('moment');
const WError = require('verror').WError;
const timezoneApi = require('../timezoneapi');

const iconToEmoji = {
  '01d': '\u2600',
  '02d': '\uD83C\uDF24',
  '03d': '\u2601',
  '04d': '\u2601\u2601',
  '09d': '\uD83C\uDF27',
  '10d': '\uD83C\uDF26',
  '11d': '\uD83C\uDF29',
  '13d': '\uD83C\uDF28',
  '50d': '\uD83C\uDF2B',

  '01n': '\uD83C\uDF11',
  '02n': '\uD83C\uDF11\u2601\uFE0F',
  '03n': '\u2601',
  '04n': '\u2601\u2601',
  '09n': '\uD83C\uDF27',
  '10n': '\uD83C\uDF11\uD83C\uDF27',
  '11n': '\uD83C\uDF29',
  '13n': '\uD83C\uDF28',
  '50n': '\uD83C\uDF2B'
};

const getFormattedTime = function (utcTimestamp, utcOffset) {
  const date = new Date((utcTimestamp + utcOffset) * 1000);

  // moment(date).locale('ru').calendar();
  return moment(date).calendar(new Date().getTime() + utcOffset * 1000);
};

/* weatherObj:
  {
    main: {
      temp
    },
    wind: {
      speed
    },
    weather: [
      {
        description,
        icon
      }
    ],
    dt,
    dt_txt
  }
*/
exports.transformWeatherObjectToText = function (weatherObj) {
  const temperature = _.get(weatherObj, ['main', 'temp'], '?');
  const windSpeed = _.get(weatherObj, ['wind', 'speed'], '?');

  const weather = _.get(weatherObj, ['weather', 0], {});
  const description = _.get(weather, 'description', '?');

  const icon = _.get(weather, ['icon'], '?');
  const emoji = _.get(iconToEmoji, [icon], '?');

  return `${emoji} ${description}\n` +
    `${temperature}\u2103, ${windSpeed}m/s`;
};

/*
  {
    city: {
      coord: {
        lat,
        lon
      }
    }
    list: [
      weatherObj,
      weatherObj,
      ...
    ]
  }
*/

const indexesToSend = {
  0: true, // nearest
  1: true, // +3
  2: true, // +6
  3: true, // +9
  4: true, // +12
  5: true, // +15
  6: false, // +18
  7: false // +21
};

const getLocalTime = function (timezoneApiError, utcOffset) {
  let localDateString = moment(new Date().getTime() + utcOffset * 1000).format('LT');

  if (timezoneApiError) {
    localDateString += ' GMT+0';
  }

  return localDateString;
};

exports.transformWeatherForecastToText = function (forecastObj, callback) {
  const list = _.get(forecastObj, ['list'], []);

  if (!Array.isArray(list)) {
    callback(null, 'Failed to get forecast.');
    return;
  }

  const lat = _.get(forecastObj, ['city', 'coord', 'lat'], '?');
  const lon = _.get(forecastObj, ['city', 'coord', 'lon'], '?');

  timezoneApi.getUtcFullOffset(lat, lon, function processOffset(timezoneApiError, utcOffset) {
    if (timezoneApiError) {
      console.log(new WError(timezoneApiError, 'Failed to get time offset by location.'));

      utcOffset = 0;
    }

    const resultPrefix = getLocalTime(timezoneApiError, utcOffset);

    const result = list
      .filter((obj, index) => indexesToSend[index])
      .map((weatherObj) => {
        const utcTimestamp = _.get(weatherObj, ['dt']);
        let time;

        if (!utcTimestamp) {
          time = '?';
        } else {
          time = getFormattedTime(utcTimestamp, utcOffset);
        }

        if (timezoneApiError && utcTimestamp) {
          time += ' GMT+0';
        }

        return time + '\n    ' +
          exports.transformWeatherObjectToText(weatherObj)
            .split('\n')
            .join('\n    ');
      })
      .join('\n\n');

    callback(null, `${resultPrefix}\n\n${result}`);
  });
};
