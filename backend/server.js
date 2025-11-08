const express = require('express');
const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');
const helmet = require('helmet');
const cors = require('cors');
const selfSigned = require('selfsigned');

// Import routes
const authRoutes = require('./routes/authRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
require('./config/database');

const app = express();
const PORT = process.env.PORT || 5000;
const USE_HTTPS = process.env.USE_HTTPS === 'true'; // toggle with an env var

// =======================
// SECURITY MIDDLEWARE
// =======================
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
      },
    },
    crossOriginEmbedderPolicy: false,
  })
);

// CORS configuration
app.use(
  cors({
    origin: ['http://localhost:3000', 'https://localhost:3000'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  })
);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// =======================
// ROUTES
// =======================
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: USE_HTTPS
      ? 'Bank Portal API running securely (HTTPS mode)'
      : 'Bank Portal API running (HTTP mode)',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/payments', paymentRoutes);

// 404 handler
app.use('/api/', (req, res) => {
  res.status(404).json({ success: false, message: 'API endpoint not found' });
});

// Global error handler
app.use((error, req, res, next) => {
  console.error('Global error handler:', error);
  res.status(500).json({
    success: false,
    message: error.message || 'Internal server error',
  });
});

// =======================
// SERVER START
// =======================

let server;

if (USE_HTTPS) {
  // Try to use provided certs, otherwise generate self-signed
  const sslOptions = {
    key: process.env.SSL_KEY_PATH
      ? fs.readFileSync(process.env.SSL_KEY_PATH)
      : undefined,
    cert: process.env.SSL_CERT_PATH
      ? fs.readFileSync(process.env.SSL_CERT_PATH)
      : undefined,
  };

  if (!sslOptions.key || !sslOptions.cert) {
    console.log('No SSL certs found — generating self-signed certificate...');
    const attrs = [{ name: 'commonName', value: 'localhost' }];
    const pems = selfSigned.generate(attrs, { days: 365 });
    sslOptions.key = pems.private;
    sslOptions.cert = pems.cert;
  }

  server = https.createServer(sslOptions, app);
  server.listen(PORT, () => {
    console.log('='.repeat(60));
    console.log('🛡️  SECURE BANK PORTAL API SERVER (HTTPS MODE)');
    console.log('='.repeat(60));
    console.log(`✅ Running on: https://localhost:${PORT}`);
    console.log(`✅ Health check: https://localhost:${PORT}/api/health`);
    console.log('⚠️  Using self-signed cert for development (browser may warn)');
    console.log('='.repeat(60));
  });
} else {
  // Simpler local dev HTTP mode
  server = http.createServer(app);
  server.listen(PORT, () => {
    console.log('='.repeat(60));
    console.log('🧰  BANK PORTAL API SERVER (HTTP DEVELOPMENT MODE)');
    console.log('='.repeat(60));
    console.log(`✅ Running on: http://localhost:${PORT}`);
    console.log(`✅ Health check: http://localhost:${PORT}/api/health`);
    console.log('⚠️  HTTPS disabled — for local testing only!');
    console.log('='.repeat(60));
  });
}

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully...');
  server.close(() => console.log('Server terminated.'));
});
