const connectionPool = require('./connectionpool');
const SqlQuery = require('./sqlquery');
const WError = require('verror').WError;

const CITIES_TABLE = 'cities';
const SETTINGS_TABLE = 'chat_settings';

const getCityEntry = function (connection, city, callback) {
  const query = new SqlQuery()
    .select(['city_id', 'city_name'])
    .from(CITIES_TABLE)
    .where({
      'city_name': city
    })
    .toString();

  connection.query(query, function processCity(error, result) {
    callback(error, result && result[0] && {
      city: result[0].city,
      cityId: result[0].city_id
    });
  });
};

// eslint-disable-next-line max-params
const saveCity = function (connection, cityInfo, utcOffset, callback) {
  const query = new SqlQuery()
    .insertInto(CITIES_TABLE, {
      city_name: cityInfo.city,
      latitude: cityInfo.latitude,
      longtitude: cityInfo.longtitude,
      utc_offset: utcOffset,
      last_offset_update: new Date()
    })
    .toString();

  connection.query(query, (error, result) => {
    if (error) {
      callback(error);
    } else {
      callback(null, result.insertId);
    }
  });
};

// eslint-disable-next-line max-params
const addCityEntry = function (connection, city, getCityInfo, getUtcOffset, callback) {
  getCityInfo(city, (error, cityInfo) => {
    if (error) {
      callback(new WError(error, 'Failed to get city info.'));
      return;
    }

    if (!cityInfo.city || !cityInfo.latitude || !cityInfo.longtitude) {
      callback(new WError('Some required properties are empty: %s.', JSON.stringify(cityInfo)));
      return;
    }

    // check matched city
    getCityEntry(connection, cityInfo.city, (getCityError, entry) => {
      if (getCityError) {
        callback(new WError(getCityError, 'Failed to check city existence.'));
        return;
      }

      if (entry) {
        callback(null, entry.id);
        return;
      }

      getUtcOffset(cityInfo.latitude, cityInfo.longtitude, (timezoneApiError, utcOffset) => {
        if (timezoneApiError) {
          callback(new WError(timezoneApiError, 'Failed to get utc offset.'));
          return;
        }

        // eslint-disable-next-line max-nested-callbacks
        saveCity(connection, cityInfo, utcOffset, (saveError, cityId) => {
          if (saveError) {
            callback(new WError(saveError, 'Failed to save city.'));
          } else {
            callback(null, cityId);
          }
        });
      });
    });
  });
};

const getChatEntry = function (connection, chatId, callback) {
  const query = new SqlQuery()
    .select('id_chat_settings')
    .from(SETTINGS_TABLE)
    .where({
      chat_id: chatId
    })
    .toString();

  connection.query(query, (error, result) => {
    callback(error, result && result[0] && {
      id: result[0].id_chat_settings
    });
  });
};

const addSettingsEntry = function (connection, chatId, callback) {
  const query = new SqlQuery()
    .insertInto(SETTINGS_TABLE, {
      chat_id: chatId
    })
    .toString();

  connection.query(query, (error, result) => {
    if (error) {
      callback(error);
    } else {
      callback(null, result.insertId);
    }
  });
};

// eslint-disable-next-line max-params
const setCityForChat = function (connection, settingsId, cityId, callback) {
  const query = new SqlQuery()
    .update(SETTINGS_TABLE)
    .set({
      city_foreign_id: cityId
    })
    .where({
      id_chat_settings: settingsId
    })
    .toString();

  connection.query(query, callback);
};

exports.getChatSettingsByChatId = function (chatId, callback) {
  const query = new SqlQuery()
    .select(['city_name', 'locale'])
    .from(SETTINGS_TABLE)
    .joinOn(CITIES_TABLE, 'city_foreign_id', 'city_id')
    .where({
      chat_id: chatId
    })
    .toString();

  connectionPool.query(query, (error, result) => {
    if (error) {
      callback(error);
    } else {
      callback(null, result && result[0] && {
        city: result[0].city_name,
        locale: result[0].locale
      } || {
        city: '<not set>',
        locale: '<not set>'
      });
    }
  });
};

exports.setCity = function (chatId, city, callback) {
  // check city exists in city table
  // get city offset
  callback(new Error('Db not started'));
};

// eslint-disable-next-line max-params
exports.saveCityForChat = function (chatId, city, getCityInfo, getUtcOffset, callback) {
  // check city existence
  //   get city info using weather api (matche city name and coordinates)
  //   check again with city found
  //   get utc_offset using timezone api
  //   save city
  // check chat_id existence
  // add city_id in settings or create entry with (chat_id, city_id)
  let cityId;
  let chatPrimaryId;

  connectionPool.performTransaction([
    function saveCityIfNotExists(connection, next) {
      getCityEntry(connection, city, (error, cityFromDb) => {
        if (error) {
          next(error);
        } else if (cityFromDb) {
          cityId = cityFromDb.cityId;

          next(null);
        } else {
          addCityEntry(connection, city, getCityInfo, getUtcOffset, (error, savedCityId) => {
            cityId = savedCityId;

            next(error);
          });
        }
      });
    },
    function getChatSettingsId(connection, next) {
      getChatEntry(connection, chatId, (error, chatEntry) => {
        if (error) {
          next(error);
        } else if (chatEntry) {
          chatPrimaryId = chatEntry.id;

          next(null);
        } else {
          addSettingsEntry(connection, chatId, (error, entryId) => {
            chatPrimaryId = entryId;

            next(error);
          });
        }
      });
    },
    function setSitySettings(connection, next) {
      setCityForChat(connection, chatPrimaryId, cityId, (error) => {
        next(error);
      });
    }
  ], function finish(saveCityError) {
    if (saveCityError) {
      callback(new WError(saveCityError, 'Failed to save city for chat.'));
      return;
    }

    exports.getChatSettingsByChatId(chatId, (error, settings) => {
      callback(error, settings);
    });
  });
};
