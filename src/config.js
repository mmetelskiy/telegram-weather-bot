const fs = require('fs');
const path = require('path');
const querystring = require('querystring');
const privateConfig = require('../private/config');

const dbEnvFilePath = path.join(__dirname, '../private/db.env');
const dbEnvFileContent = fs.readFileSync(dbEnvFilePath, 'utf8');
const dbSecrets = querystring.parse(dbEnvFileContent, '\n', '=');
const dbPassword = dbSecrets.MYSQL_PASSWORD.trim();

module.exports = {
  server: {
    basePath: `/${privateConfig.botToken}`,
    port: 8443,
    options: {
      key: fs.readFileSync(path.join(__dirname, '../private/cert/YOURPRIVATE.key')),
      cert: fs.readFileSync(path.join(__dirname, '../private/cert/YOURPUBLIC.pem'))
    }
  },
  db: {
    host: 'localhost',
    port: '3306',
    database: 'weather-bot-db',
    user: 'weather-bot',
    password: dbPassword
  },
  telegram: {
    baseUrl: `https://api.telegram.org/bot${privateConfig.botToken}`
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
