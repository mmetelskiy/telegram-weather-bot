const _ = require('lodash');

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
    ]
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
    `${temperature}\u2103\n` +
    `${windSpeed}m/s`;
};

/*
  {
    list: [
      weatherObj,
      weatherObj,
      ...
    ]
  }
*/
exports.transformWeatherForecastToText = function (forecastObj) {
  const list = _.get(forecastObj, ['list'], []);

  if (!Array.isAray(list)) {
    return 'Failed to get forecast.';
  }

  return list
    .map((weatherObj) => {
      return _.get(weatherObj, ['dt_txt'], '?') + ' UTC\n' +
        exports.transformWeatherObjectToText(weatherObj)
          .split('\n')
          .join('  \n');
    })
    .join('\n');
};
