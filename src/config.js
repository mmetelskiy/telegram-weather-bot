const fs = require('fs');
const path = require('path');
const privateConfig = require('../private/config');

module.exports = {
  server: {
    basePath: '/' + privateConfig.botToken,
    port: 8443,
    options: {
      key: fs.readFileSync(path.join(__dirname, '../private/cert/YOURPRIVATE.key')),
      cert: fs.readFileSync(path.join(__dirname, '../private/cert/YOURPUBLIC.pem'))
    }
  },
  telegram: {
    baseUrl: 'https://api.telegram.org/bot' + privateConfig.botToken
  },
  weather: {
    baseUrl: 'https://api.openweathermap.org/data/2.5',
    token: privateConfig.openWeatherMapToken
  },
  timezone: {
    baseUrl: 'https://api.timezonedb.com/v2/get-time-zone',
    token: privateConfig.timezoneDBToken
  }
};
