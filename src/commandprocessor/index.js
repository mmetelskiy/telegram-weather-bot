const telegramApi = require('../telegramapi');

const knownCommands = {};

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

exports.processBotCommand = function (update) {
  const parsedCommand = parseBotCommand(update);

  telegramApi.sendText(update.chat.id, JSON.stringify(parsedCommand, null, 2));
};

exports.replyWithError = function (update) {
  telegramApi.sendText(update.chat.id, 'Cannot recognize command in your message :(');
};
