const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 5000;
const SRC = path.join(__dirname, 'src');
const DB_FILE = path.join(__dirname, 'db.json');

const mimeTypes = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml'
};

// Load or init DB
let dbData = null;
try {
  if (fs.existsSync(DB_FILE)) {
    dbData = fs.readFileSync(DB_FILE, 'utf8');
  }
} catch(e) {}

http.createServer((req, res) => {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  // API endpoints for DB persistence
  if (req.url === '/api/db' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(dbData || '{}');
    return;
  }

  if (req.url === '/api/db' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      dbData = body;
      try {
        fs.writeFileSync(DB_FILE, body, 'utf8');
      } catch(e) {
        console.error('Error saving DB:', e);
      }
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end('{"ok":true}');
    });
    return;
  }

  // Static files
  let filePath = req.url === '/' ? '/index.html' : req.url.split('?')[0];
  filePath = path.join(SRC, filePath);
  const ext = path.extname(filePath);
  const contentType = mimeTypes[ext] || 'text/plain';
  
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404);
      res.end('Not found');
      return;
    }
    res.writeHead(200, { 'Content-Type': contentType + '; charset=utf-8' });
    res.end(data);
  });
}).listen(PORT, () => console.log(`StockPro server on port ${PORT}`));
