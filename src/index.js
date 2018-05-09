const https = require('https');
const express = require('express');
const config = require('./config');

const app = express();

app.use(express.json());

app.post(config.server.basePath, (req, res) => {
  console.log(req.body);

  res.end();
});

https
  .createServer(config.server.options, app)
  .listen(config.server.port, () => {
    console.log('listening on port', config.server.port);
  });
