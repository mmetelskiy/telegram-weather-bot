const https = require('https');
const fs = require('fs');
const path = require('path');

const options = {
  key: fs.readFileSync(path.join(__dirname, '../private/cert/YOURPRIVATE.key')),
  cert: fs.readFileSync(path.join(__dirname, '../private/cert/YOURPUBLIC.pem'))
};

https.createServer(options, (req, res) => {
  if (req.method === 'POST') {
    let body = '';

    req.on('data', (chunk) => {
      body += chunk.toString();
    });

    req.on('end', () => {
      console.log(body);

      res.writeHead(200);
      res.end();
    });
  } else {
    res.writeHead(200);
    res.end('hello world');
  }
}).listen(8443, () => {
  console.log('listening on 8443');
});
