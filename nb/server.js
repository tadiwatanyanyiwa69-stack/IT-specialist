const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = path.join(__dirname, 'public');

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf'
};

const https = require('https');

const TARGET_EMAIL = 'tadiwatanyanyiwa69@gmail.com';

// Helper: Forward message to email via FormSubmit API
function sendEmailToTadiwa(data, callback) {
  const payload = JSON.stringify({
    name: data.name,
    contact: data.email,
    service: data.service,
    message: data.message,
    _subject: `New IT Request from ${data.name} for ${data.service}`,
    _template: 'table'
  });

  const options = {
    hostname: 'formsubmit.co',
    path: `/ajax/${TARGET_EMAIL}`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Content-Length': Buffer.byteLength(payload)
    },
    timeout: 8000
  };

  const req = https.request(options, (res) => {
    let responseData = '';
    res.on('data', chunk => responseData += chunk);
    res.on('end', () => {
      console.log(`✉️ Email dispatched to ${TARGET_EMAIL}. Status code: ${res.statusCode}`);
      callback(null, true);
    });
  });

  req.on('error', (err) => {
    console.error(`⚠️ Email forwarding warning:`, err.message);
    callback(err, false);
  });

  req.on('timeout', () => {
    req.destroy();
    callback(new Error('Timeout'), false);
  });

  req.write(payload);
  req.end();
}

const server = http.createServer((req, res) => {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // API Endpoint: Contact Form -> Direct to tadiwatanyanyiwa69@gmail.com
  if (req.url === '/api/contact' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });

    req.on('end', () => {
      try {
        const data = JSON.parse(body);
        const { name, email, service, message } = data;

        console.log('\n=============================================');
        console.log('⚡ NEW DOC IT SERVICE INQUIRY:');
        console.log(`👤 Name:      ${name}`);
        console.log(`📞 Contact:   ${email}`);
        console.log(`💻 Service:   ${service}`);
        console.log(`📝 Message:   ${message}`);
        console.log(`📧 Target:    ${TARGET_EMAIL}`);
        console.log(`📱 WhatsApp:  +263 77 161 7226`);
        console.log('=============================================\n');

        // Dispatch email
        sendEmailToTadiwa(data, (err) => {
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({
            success: true,
            email: TARGET_EMAIL,
            message: `Message received and directed to Tadiwa's email (${TARGET_EMAIL})!`
          }));
        });

      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, message: 'Invalid data submitted' }));
      }
    });
    return;
  }

  // Static File Serving
  let reqPath = req.url.split('?')[0];
  if (reqPath === '/' || reqPath === '') {
    reqPath = '/index.html';
  }

  const filePath = path.join(PUBLIC_DIR, reqPath);

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      // Fallback to index.html for SPA/Routing
      const indexFile = path.join(PUBLIC_DIR, 'index.html');
      fs.readFile(indexFile, (err2, content) => {
        if (err2) {
          res.writeHead(404, { 'Content-Type': 'text/plain' });
          res.end('404 Not Found');
        } else {
          res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
          res.end(content);
        }
      });
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    fs.readFile(filePath, (readErr, content) => {
      if (readErr) {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('500 Internal Server Error');
      } else {
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(content);
      }
    });
  });
});

server.listen(PORT, () => {
  console.log('\n=============================================================');
  console.log(`🚀 TADIWA "DOC" 3D IT SPECIALIST WEBSITE RUNNING!`);
  console.log(`🌐 Local URL: http://localhost:${PORT}`);
  console.log(`📱 WhatsApp:  +263 77 161 7226`);
  console.log(`👤 Facebook:  Tadiwa Tanyanyiwa`);
  console.log('=============================================================\n');
});
