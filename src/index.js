const https = require('https');
const fs = require('fs');

const options = {
  key: fs.readFileSync('../private/cert/YOURPRIVATE.key'),
  cert: fs.readFileSync('../private/cert/YOURPUBLIC.pem')
};

https.createServer(options, (req, res) => {
  res.writeHead(200);
  res.end('hello world');
}).listen(8443);
