import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { promises as fs } from 'fs';
import compression from 'compression';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Enable compression for better performance and crawl budget
app.use(compression({
  filter: (req, res) => {
    if (req.headers['x-no-compression']) {
      return false;
    }
    return compression.filter(req, res);
  }
}));

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

// Serve static files from dist directory with optimized caching
app.use(express.static(path.join(__dirname, 'dist'), {
  maxAge: '1y',
  etag: true,
  lastModified: true,
  setHeaders: (res, path) => {
    // Cache static assets aggressively
    if (path.match(/\.(js|css|woff2?|otf|ttf|eot|ico|png|jpg|jpeg|gif|svg|webp)$/)) {
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    }
    // Cache HTML files with shorter duration for faster updates
    else if (path.match(/\.html$/)) {
      res.setHeader('Cache-Control', 'public, max-age=3600, must-revalidate');
    }
    // XML files (sitemaps, etc.) - moderate caching
    else if (path.match(/\.xml$/)) {
      res.setHeader('Cache-Control', 'public, max-age=86400, must-revalidate');
    }
  }
}));

// SEO-optimized middleware for better crawlability
app.use((req, res, next) => {
  // Compression hint for crawlers
  res.setHeader('Vary', 'Accept-Encoding, User-Agent');
  
  // Faster response for crawlers
  const userAgent = req.get('User-Agent') || '';
  if (userAgent.includes('Googlebot') || userAgent.includes('Bingbot') || userAgent.includes('spider')) {
    // Prioritize crawler requests
    res.setHeader('X-Crawler-Optimized', 'true');
  }
  
  next();
});

// Define known routes that should be served (prevent soft-404s)
const knownRoutes = [
  '/',
  '/about-us',
  '/contact-us', 
  '/privacy-policy',
  '/terms-of-service',
  '/help-center',
  '/all-tools',
  '/finance-tools',
  '/health-tools', 
  '/text-tools'
];

// Valid tool routes from sitemaps (prevent soft-404s for invalid tools)
const validToolRoutes = new Set([
  // Text tools
  '/tools/binary-to-text-converter',
  '/tools/case-converter',
  '/tools/character-counter',
  '/tools/decimal-to-text-converter',
  '/tools/fake-address-generator',
  '/tools/fake-name-generator',
  '/tools/font-style-changer',
  '/tools/hex-to-text-converter',
  '/tools/lorem-ipsum-generator',
  '/tools/markdown-to-html',
  '/tools/paragraph-counter',
  '/tools/qr-code-scanner',
  '/tools/qr-text-generator',
  '/tools/password-generator',
  '/tools/password-strength-checker',
  '/tools/username-generator',
  '/tools/reverse-text-tool',
  '/tools/sentence-counter',
  '/tools/text-to-binary-converter',
  '/tools/text-to-decimal-converter',
  '/tools/text-diff-checker',
  '/tools/text-pattern-generator',
  '/tools/text-to-hex-converter',
  '/tools/text-to-qr-code',
  '/tools/word-counter',
  '/tools/base64-encoder-decoder',
  '/tools/duplicate-line-remover',
  '/tools/text-cleaner-formatter',
  '/tools/text-formatter-beautifier',
  '/tools/text-scrambler',
  '/tools/text-statistics-analyzer',
  '/tools/url-extractor',
  // Finance tools  
  '/tools/break-even-calculator',
  '/tools/budget-calculator',
  '/tools/business-loan-calculator',
  '/tools/car-loan-calculator',
  '/tools/compound-interest-calculator',
  '/tools/credit-card-interest-calculator',
  '/tools/currency-percentage-change-calculator',
  '/tools/debt-payoff-calculator',
  '/tools/discount-calculator',
  '/tools/education-loan-calculator',
  '/tools/emi-calculator',
  '/tools/future-value-investment-calculator',
  '/tools/home-loan-calculator',
  '/tools/inflation-calculator',
  '/tools/investment-return-calculator',
  '/tools/lease-calculator',
  '/tools/loan-calculator',
  '/tools/loan-comparison-calculator',
  '/tools/mortgage-calculator',
  '/tools/net-worth-calculator',
  '/tools/paypal-fee-calculator',
  '/tools/percentage-calculator',
  '/tools/retirement-calculator',
  '/tools/roi-calculator',
  '/tools/salary-to-hourly-calculator',
  '/tools/savings-goal-calculator',
  '/tools/simple-interest-calculator',
  '/tools/sip-calculator',
  '/tools/smoking-cost-calculator',
  '/tools/stock-profit-calculator',
  '/tools/tax-calculator',
  '/tools/tip-calculator',
  '/tools/vat-gst-calculator',
  '/tools/debt-consolidation-calculator',
  '/tools/dti-ratio-calculator',
  // Health tools
  '/tools/alcohol-calorie-calculator',
  '/tools/bmi-calculator',
  '/tools/bmr-calculator',
  '/tools/baby-growth-chart',
  '/tools/blood-pressure-tracker',
  '/tools/body-fat-calculator',
  '/tools/body-water-percentage-calculator',
  '/tools/calorie-calculator',
  '/tools/carb-calculator',
  '/tools/cholesterol-risk-calculator',
  '/tools/cycling-speed-calculator',
  '/tools/daily-step-calorie-converter',
  '/tools/heart-rate-calculator',
  '/tools/hydration-calculator',
  '/tools/ideal-weight-calculator',
  '/tools/intermittent-fasting-timer',
  '/tools/keto-macro-calculator',
  '/tools/lean-body-mass-calculator',
  '/tools/life-expectancy-calculator',
  '/tools/max-heart-rate-calculator',
  '/tools/ovulation-calculator',
  '/tools/pregnancy-due-date-calculator',
  '/tools/protein-intake-calculator',
  '/tools/running-pace-calculator',
  '/tools/sleep-calculator',
  '/tools/sleep-quality-calculator',
  '/tools/swimming-calorie-calculator',
  '/tools/tdee-calculator',
  '/tools/waist-to-height-ratio-calculator',
  '/tools/water-intake-calculator',
  '/tools/whr-calculator',
  '/tools/body-composition-analyzer',
  '/tools/metabolic-age-calculator',
  '/tools/stress-level-calculator'
]);

// Check if path is a valid tool route from our sitemaps
const isValidToolRoute = (path) => {
  return validToolRoutes.has(path);
};

// Serve prerendered files with proper HTTP status codes
app.get('*', async (req, res) => {
  try {
    const requestPath = req.path;
    
    // Check if prerendered version exists
    const sanitizedPath = requestPath === '/' ? 'index.html' : `${requestPath.replace(/^\/+/, '')}.html`;
    const prerenderedPath = path.join(__dirname, 'dist/prerendered', sanitizedPath);
    
    let filePath;
    let isPrerendered = false;
    let fileStats;
    
    try {
      await fs.access(prerenderedPath);
      fileStats = await fs.stat(prerenderedPath);
      filePath = prerenderedPath;
      isPrerendered = true;
      console.log(`📄 Serving prerendered: ${requestPath} -> ${sanitizedPath}`);
    } catch {
      // Check if this is a known route or valid tool route
      if (knownRoutes.includes(requestPath) || isValidToolRoute(requestPath)) {
        // Fallback to SPA for known routes
        filePath = path.join(__dirname, 'dist', 'index.html');
        fileStats = await fs.stat(filePath);
        console.log(`🔄 SPA fallback: ${requestPath}`);
      } else {
        // Return 404 for unknown routes to prevent soft-404s
        console.log(`❌ 404 for unknown route: ${requestPath}`);
        return res.status(404).setHeader('Cache-Control', 'public, max-age=300').send('<!DOCTYPE html><html><head><title>Page Not Found</title></head><body><h1>404 - Page Not Found</h1><p>The requested page could not be found.</p></body></html>');
      }
    }
    
    // Set HTML-specific SEO headers
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('X-Robots-Tag', 'index, follow');
    
    // Set Last-Modified based on actual file modification time
    if (fileStats) {
      res.setHeader('Last-Modified', fileStats.mtime.toUTCString());
    }
    
    // Set appropriate caching headers based on content type
    if (isPrerendered) {
      // Cache prerendered pages with moderate duration
      res.setHeader('Cache-Control', 'public, max-age=3600, must-revalidate');
    } else {
      // SPA fallback - shorter cache duration
      res.setHeader('Cache-Control', 'public, max-age=300, must-revalidate');
    }
    
    res.sendFile(filePath);
  } catch (error) {
    console.error('Server error:', error);
    // Final fallback with error handling
    res.status(500).setHeader('Cache-Control', 'no-cache').send('<!DOCTYPE html><html><head><title>Server Error</title></head><body><h1>500 - Server Error</h1><p>An internal server error occurred.</p></body></html>');
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Production server running on http://localhost:${PORT}`);
  console.log('📋 Security headers enabled');
  console.log('⚡ Font loading optimized');
});