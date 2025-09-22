import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { promises as fs } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Security headers middleware
app.use((req, res, next) => {
  // HSTS (HTTP Strict Transport Security)
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  
  // Content Security Policy - balanced security and functionality
  res.setHeader('Content-Security-Policy', 
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-inline' 'unsafe-hashes' https://www.googletagmanager.com https://www.google-analytics.com https://pagead2.googlesyndication.com https://tpc.googlesyndication.com; " +
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
    "font-src 'self' https://fonts.gstatic.com data:; " +
    "img-src 'self' data: blob: https:; " +
    "connect-src 'self' https://www.google-analytics.com https://fonts.googleapis.com https://fonts.gstatic.com https://pagead2.googlesyndication.com https://googleads.g.doubleclick.net; " +
    "frame-src https://pagead2.googlesyndication.com https://tpc.googlesyndication.com https://googleads.g.doubleclick.net; " +
    "worker-src 'self'; " +
    "frame-ancestors 'none'; " +
    "base-uri 'self'; " +
    "form-action 'self'; " +
    "upgrade-insecure-requests"
  );
  
  // X-Frame-Options
  res.setHeader('X-Frame-Options', 'DENY');
  
  // X-Content-Type-Options
  res.setHeader('X-Content-Type-Options', 'nosniff');
  
  // Referrer Policy
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // X-XSS-Protection
  res.setHeader('X-XSS-Protection', '1; mode=block');
  
  // Permissions Policy
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  
  // Cache control for security
  if (req.path.includes('/api/')) {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
  }
  
  next();
});

// Font loading optimization headers
app.use((req, res, next) => {
  if (req.path.match(/\.(woff2?|otf|ttf)$/)) {
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  }
  next();
});

// Serve static files from dist directory
app.use(express.static(path.join(__dirname, 'dist')));

// Serve prerendered files with fallback to SPA
app.get('*', async (req, res) => {
  try {
    // Check if prerendered version exists
    const sanitizedPath = req.path === '/' ? 'index.html' : `${req.path.replace(/^\/+/, '')}.html`;
    const prerenderedPath = path.join(__dirname, 'dist/prerendered', sanitizedPath);
    
    // Try prerendered file first, then fallback to SPA
    let filePath;
    try {
      await fs.access(prerenderedPath);
      filePath = prerenderedPath;
      console.log(`📄 Serving prerendered: ${req.path} -> ${sanitizedPath}`);
    } catch {
      // Fallback to SPA
      filePath = path.join(__dirname, 'dist', 'index.html');
      console.log(`🔄 SPA fallback: ${req.path}`);
    }
    
    res.sendFile(filePath);
  } catch (error) {
    // Final fallback
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Production server running on http://localhost:${PORT}`);
  console.log('📋 Security headers enabled');
  console.log('⚡ Font loading optimized');
});