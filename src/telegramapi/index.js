const request = require('request');
const WError = require('verror').WError;

const telegramConfig = require('../config').telegram;

const telegramRequest = request.defaults({
  baseUrl: telegramConfig.baseUrl,
  json: true
});

exports.sendText = function (chatId, text) {
  telegramRequest.post({
    uri: '/sendMessage',
    body: {
      chat_id: chatId,
      text
    }
  }, function processApiResponse(error, response, body) {
    if (error) {
      console.log(error);
    } else if (response.statusCode !== 200) {
      console.log(new WError('Unexpected %s status code from telegram.',
        response.statusCode));
    }
  });
};

// available only in private chats
exports.sendLocationRequest = function (userId) {
  telegramRequest.post({
    uri: '/sendMessage',
    body: {
      chat_id: userId,
      text: 'Please, provide your location',
      reply_markup: {
        keyboard: [
          [
            {
              text: 'Send my location',
              request_location: true
            }
          ]
        ],
        resize_keyboard: true,
        one_time_keyboard: true
      }
    }
  }, function processApiResponse(error, response, body) {
    if (error) {
      console.log(error);
    } else if (response.statusCode !== 200) {
      console.log(new WError('Unexpected %s status code from telegram.',
        response.statusCode));
    }
  });
};
