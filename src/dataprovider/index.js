exports.getChatSettingsByChatId = function (chatId, callback) {
  callback(null, {
    city: null,
    locale: null
  });
};

exports.setCity = function (chatId, city, callback) {
  callback(new Error('Db not started'));
};
