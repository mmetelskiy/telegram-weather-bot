const WError = require('verror').WError;

const telegramApi = require('../telegramapi');
const weatherApi = require('../weatherapi');
const weatherProcessor = require('../weatherapi/weatherprocessor');

const getCurrentWeatherByLocation = function (update) {
  telegramApi.sendLocationRequest(update.message.from.id);
};

const get24hForecastByCity = function (update, args) {
  const city = Array.isArray(args) && args.join(' ');

  if (!city) {
    exports.replyWithError(update, 'City wasn\'t provided :(');
    return;
  }

  weatherApi.get24hForecastByCity(city, function processWeather(error, result) {
    if (error) {
      console.log(new WError(error, 'Failed to get weather forecast.'));

      exports.replyWithError(update, 'Failed to get weather forecast :(');
      return;
    }

    const reply = weatherProcessor.transformWeatherForecastToText(result);

    telegramApi.sendText(update.message.chat.id, reply);
  });
};

const processUnknownCommand = function (update) {
  exports.replyWithError(update, 'I don\'t know this command :(');
};

const knownCommands = {
  '/w': getCurrentWeatherByLocation,
  '/here': getCurrentWeatherByLocation,
  '/24h': get24hForecastByCity
};

const parseBotCommand = function (update) {
  const text = update.message.text;
  const commandEntityMeta = update.message.entities.find((entity) => {
    return entity.type === 'bot_command';
  });

  const command = text.substr(commandEntityMeta.offset, commandEntityMeta.length);
  const args = text.replace(command, '').trim().split(/\s+/);

  return {
    command,
    args
  };
};

exports.isBotCommand = function (update) {
  return update &&
    update.message &&
    Array.isArray(update.message.entities) &&
    update.message.entities.some((entity) => {
      return entity.type === 'bot_command' &&
        entity.offset === 0;
    });
};

exports.isLocation = function (update) {
  return update &&
    update.message &&
    update.message.location;
};

exports.processBotCommand = function (update) {
  const parsedCommand = parseBotCommand(update);
  const commandProcessor = knownCommands[parsedCommand.command] || processUnknownCommand;

  commandProcessor(update, parsedCommand.args);
};

exports.processLocationSharing = function (update) {
  const location = update.message.location;

  weatherApi.getCurrentWeatherByLocation({
    longitude: location.longitude,
    latitude: location.latitude
  }, function processWeather(error, weather) {
    if (error) {
      console.log(new WError(error, 'Failed to get weather.'));

      exports.replyWithError(update, 'Failed to get weather :(');
      return;
    }

    const reply = weatherProcessor.transformWeatherObjectToText(weather);

    telegramApi.sendText(update.message.chat.id, reply);
  });
};

exports.replyWithError = function (update, text) {
  telegramApi.sendText(update.message.chat.id, text || 'Something went wrong :(');
};
