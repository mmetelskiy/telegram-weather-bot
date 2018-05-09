const iconToEmoji = {};

exports.transformWeatherObjectToText = function (weatherObj) {
  const main = weatherObj.main;
  const weather = weatherObj.weather[0];
  const wind = weatherObj.wind;

  return `${weather.description}\nTemperature: ${main.temp}\u2103\n` +
    `Wind: ${wind.speed}m/s`;
};
