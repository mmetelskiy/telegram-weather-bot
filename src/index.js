const https = require('https');
const express = require('express');
const config = require('./config');

const commandProcessor = require('./commandprocessor');

const app = express();

app.use(express.json());

app.post(config.server.basePath, (req, res) => {
  console.log(JSON.stringify(req.body, null, 2));

  if (commandProcessor.isBotCommand(req.body)) {
    commandProcessor.processCommand(req.body);
  } else {
    commandProcessor.replyWithError(req.body);
  }

  res.end();
});

app.use((req, res) => {
  console.log('error path:', req.path);

  res.status(404).end();
});

https
  .createServer(config.server.options, app)
  .listen(config.server.port, () => {
    console.log('listening on port', config.server.port);
  });
