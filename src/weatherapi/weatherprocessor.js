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

exports.transformWeatherObjectToText = function (weatherObj) {
  const main = weatherObj.main;
  const wind = weatherObj.wind;

  const weather = weatherObj.weather && weatherObj.weather[0];
  const icon = weather && weather.icon;
  const emoji = iconToEmoji[icon] || '?';

  return `${emoji} - ${weather.description}\n` +
    `${main.temp}\u2103\n` +
    `${wind.speed}m/s`;
};
