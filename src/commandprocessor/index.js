const WError = require('verror').WError;
const async = require('async');
const _ = require('lodash');

const telegramApi = require('../telegramapi');
const weatherApi = require('../weatherapi');
const timezoneApi = require('../timezoneapi');

const weatherProcessor = require('../weatherapi/weatherprocessor');

const dataprovider = require('../dataprovider');

const getCurrentWeatherByLocation = function (update) {
  telegramApi.sendLocationRequest(update.message.from.id);
};

const get24hForecastByCity = function (update, args) {
  async.waterfall([
    function getCity(next) {
      const city = Array.isArray(args) && args.join(' ');

      if (city) {
        next(null, city);
        return;
      }

      dataprovider.getChatSettingsByChatId(update.message.chat.id, (error, settings) => {
        if (error) {
          next(new WError(error, 'Failed to get city.'));
        } else {
          next(null, settings.city);
        }
      });
    },
    function getForecast(city, next) {
      if (!city) {
        next(new WError('City wasn\'t provided'));
        return;
      }

      weatherApi.get24hForecastByCity(city, (error, result) => {
        if (error) {
          next(new WError(error, 'Failed to get weather forecast'));
        } else {
          next(null, result);
        }
      });
    },
    function transformForecastToText(result, next) {
      weatherProcessor.transformWeatherForecastToText(result, (error, reply) => {
        if (error) {
          next(new WError(error, 'Something went wrong'));
        } else {
          next(null, reply);
        }
      });
    }
  ], function processResult(error, reply) {
    if (error) {
      console.log(error);

      exports.replyWithError(update, error.message);
    } else {
      telegramApi.sendText(update.message.chat.id, reply);
    }
  });
};

const processUnknownCommand = function (update) {
  exports.replyWithError(update, 'I don\'t know this command :(');
};

const setCity = function (update, args) {
  const city = Array.isArray(args) && args.join(' ');

  if (!city) {
    exports.replyWithError(update, 'City wasn\'t provided');
    return;
  }

  dataprovider.saveCityForChat(
    update.message.chat.id,
    city,
    function getCityCoordinates(city, callback) {
      weatherApi.getCurrentWeatherByCity(city, (error, result) => {
        if (error) {
          callback(error);
        } else {
          callback(null, {
            city: result.name,
            latitude: result.coord.lat,
            longtitude: result.coord.lon
          });
        }
      });
    },
    function getUtcOffset(latitude, longitude, callback) {
      timezoneApi.getUtcFullOffset(latitude, longitude, callback);
    },
    function finish(error, savedOptions) {
      if (error) {
        console.log(error);
        exports.replyWithError(update);
        return;
      }

      telegramApi.sendText(update.message.chat.id, `City saved as ${savedOptions.city}.`);
    });
};

const showSettings = function (update) {
  dataprovider.getChatSettingsByChatId(update.message.chat.id, (error, settings) => {
    if (error) {
      console.log(error);
      exports.replyWithError(update, 'Failed to get settings');
      return;
    }

    const city = _.get(settings, 'city', '<not set>');
    const locale = _.get(settings, 'locale', '<not set>');

    telegramApi.sendText(update.message.chat.id, `Settings:\n  City: ${city}\n  Locale: ${locale}`);
  });
};

const start = function (update) {
  telegramApi.sendText(update.message.chat.id, 'Hello :)');
};

const knownCommands = {
  '/here': getCurrentWeatherByLocation,
  '/24h': get24hForecastByCity,
  '/setcity': setCity,
  '/settings': showSettings,
  '/start': start
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
