const https = require('https');
const httpProxy = require('http-proxy');
const fs = require('fs');
const path = require('path');

// Load SSL certificates
const options = {
  key: fs.readFileSync(path.join(__dirname, '.certs/bookmarkhub.app+3-key.pem')),
  cert: fs.readFileSync(path.join(__dirname, '.certs/bookmarkhub.app+3.pem'))
};

const proxy = httpProxy.createProxyServer({
  target: 'https://localhost:5173',
  ws: true, // Enable websocket proxy for HMR
  secure: false, // Accept self-signed certificates
  changeOrigin: true
});

const server = https.createServer(options, (req, res) => {
  proxy.web(req, res);
});

// Proxy websocket connections for Vite HMR
server.on('upgrade', (req, socket, head) => {
  proxy.ws(req, socket, head);
});

server.listen(443, () => {
  console.log('✓ HTTPS Proxy server listening on port 443');
  console.log('✓ Forwarding to https://localhost:5173');
  console.log('✓ Access your app at: https://bookmarkhub.app');
  console.log('\n⚠️  Run with: sudo node proxy-server.cjs');
  console.log('Press Ctrl+C to stop the proxy server');
});

proxy.on('error', (err, req, res) => {
  console.error('Proxy error:', err);
  if (res && res.writeHead) {
    res.writeHead(500, { 'Content-Type': 'text/plain' });
    res.end('Proxy error');
  }
});
