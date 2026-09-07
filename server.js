const http = require('http');
const fs = require('fs');
const path = require('path');

// 1. Load .env Configuration
function loadEnv() {
  const envPath = path.join(__dirname, '.env');
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, 'utf8').split('\n');
    lines.forEach(line => {
      const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
      if (match) {
        const key = match[1];
        let val = match[2] || '';
        val = val.trim().replace(/^['"]|['"]$/g, '');
        if (!process.env[key]) process.env[key] = val;
      }
    });
  }
}
loadEnv();

// Import API Handlers
const analyzeHandler = require('./api/analyze.js');
const notifyHandler = require('./api/notify.js');
const adminHandler = require('./api/admin.js');

const PORT = process.env.PORT || 4173;
const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

const server = http.createServer((req, res) => {
  const reqPath = req.url.split('?')[0];

  // Route API requests to serverless handlers
  if (reqPath === '/api/analyze') {
    analyzeHandler(req, res);
    return;
  }

  if (reqPath === '/api/notify') {
    notifyHandler(req, res);
    return;
  }

  if (reqPath.startsWith('/api/admin') || reqPath === '/api/products/submit') {
    adminHandler(req, res);
    return;
  }

  // Static File Serving (check public/ first, then root)
  let filePath = reqPath;
  if (filePath === '/') filePath = '/index.html';
  let fullPath = path.join(__dirname, 'public', filePath);
  if (!fs.existsSync(fullPath)) {
    fullPath = path.join(__dirname, filePath);
  }

  fs.readFile(fullPath, (err, data) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('404 Not Found');
      return;
    }

    const ext = path.extname(fullPath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(data);
  });
});

server.listen(PORT, () => {
  console.log(`BetaDock local server running at http://localhost:${PORT}`);
  console.log(`- API analyze endpoint: http://localhost:${PORT}/api/analyze`);
  console.log(`- API notify endpoint:  http://localhost:${PORT}/api/notify`);
});
