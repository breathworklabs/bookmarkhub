import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import compression from 'compression';
import helmet from 'helmet';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: [
        "'self'",
        "'unsafe-inline'",
        "'unsafe-eval'",
        "https://platform.twitter.com",
        "https://cdn.jsdelivr.net",
        "https://static.cloudflareinsights.com"
      ],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:", "blob:"],
      connectSrc: [
        "'self'",
        "https://api.twitter.com",
        "https://x.com",
        "https://*.sentry.io",
        "https://cloudflareinsights.com"
      ],
      frameSrc: ["'self'", "https://platform.twitter.com"],
      mediaSrc: ["'self'", "https:", "blob:"],
    },
  },
  crossOriginEmbedderPolicy: false,
}));

// Compression middleware
app.use(compression());

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'production'
  });
});

// Serve static files from the dist directory
app.use(express.static(path.join(__dirname, 'dist'), {
  etag: true,
  lastModified: true,
  setHeaders: (res, filepath) => {
    // Cache static assets for 1 year
    if (filepath.match(/\.(js|css|png|jpg|jpeg|gif|svg|woff|woff2|ttf|eot)$/)) {
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    }
    // Don't cache HTML files
    if (filepath.match(/\.html$/)) {
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    }
  }
}));

// API proxy for Twitter/X API (if needed in production)
if (process.env.ENABLE_API_PROXY === 'true') {
  const { createProxyMiddleware } = await import('http-proxy-middleware');

  app.use('/api/twitter', createProxyMiddleware({
    target: 'https://api.twitter.com',
    changeOrigin: true,
    pathRewrite: { '^/api/twitter': '' },
    headers: {
      'Authorization': `Bearer ${process.env.TWITTER_BEARER_TOKEN}`,
    },
  }));

  app.use('/api/x', createProxyMiddleware({
    target: 'https://x.com',
    changeOrigin: true,
    pathRewrite: { '^/api/x': '' },
  }));
}

// Handle client-side routing - serve index.html for all routes
app.get('*', (req, res) => {
  const indexPath = path.join(__dirname, 'dist', 'index.html');

  // Check if index.html exists
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(404).send('Build files not found. Please run "npm run build" first.');
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`
  🚀 BookmarkHub server is running!

  📍 Local:    http://localhost:${PORT}
  📍 Network:  http://0.0.0.0:${PORT}
  🌍 Environment: ${process.env.NODE_ENV || 'production'}

  Ready to serve bookmarks! 📚
  `);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  app.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});