const http = require('http');
const fs = require('fs');
const path = require('path');

const root = __dirname;
const port = Number(process.env.PORT || 3000);
const mime = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.webmanifest': 'application/manifest+json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
};

function send(res, status, body, type) {
  res.writeHead(status, { 'Content-Type': type, 'Cache-Control': 'no-cache' });
  res.end(body);
}

const server = http.createServer((req, res) => {
  const clean = decodeURIComponent((req.url || '/').split('?')[0]);
  const safe = clean.replace(/\\/g, '/');
  const publicAsset = new Set(['/manus-routes.json', '/manifest.webmanifest', '/sw.js']);
  const relative = safe === '/' ? 'index.html' : safe.replace(/^\/+/, '');
  let file = publicAsset.has(safe) ? path.join(root, 'public', relative) : path.join(root, relative);
  if (!file.startsWith(root)) return send(res, 403, 'Forbidden', 'text/plain; charset=utf-8');
  if (!fs.existsSync(file) || fs.statSync(file).isDirectory()) file = path.join(root, 'index.html');
  const ext = path.extname(file).toLowerCase();
  fs.readFile(file, (err, data) => {
    if (err) return send(res, 404, 'Not found', 'text/plain; charset=utf-8');
    send(res, 200, data, mime[ext] || 'application/octet-stream');
  });
});

server.listen(port, '0.0.0.0', () => console.log(`SafeFind listening on ${port}`));
