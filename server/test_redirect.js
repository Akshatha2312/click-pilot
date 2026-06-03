const http = require('http');
const url = 'http://localhost:5000/api/links/abc123';

const req = http.request(url, { method: 'GET' }, (res) => {
  console.log('statusCode =', res.statusCode);
  console.log('headers =', res.headers);
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    console.log('body =', data);
  });
});
req.on('error', (err) => {
  console.error('error =', err.message);
});
req.end();
