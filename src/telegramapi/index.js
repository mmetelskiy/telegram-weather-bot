const request = require('request');
const telegramConfig = require('../config').telegram;

const telegramRequest = request.defaults({
  baseUrl: telegramConfig.baseUrl
});

exports.sendText = function (chatId, text) {
  telegramRequest.post({
    body: {
      chat_id: chatId,
      text
    },
    json: true
  });
};
