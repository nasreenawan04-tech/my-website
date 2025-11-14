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
  
  // Content Security Policy - REPORT-ONLY MODE for testing Vercel Live integration
  // Includes: Google Fonts, Ads, Firebase, reCAPTCHA, Vercel Live, and Pusher (for real-time)
  // CANONICAL CSP - Must match vercel.json and client/index.html exactly
  res.setHeader('Content-Security-Policy-Report-Only', 
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://vercel.live https://*.vercel.live https://vercel.com https://pagead2.googlesyndication.com https://partner.googleadservices.com https://www.googletagmanager.com https://googleads.g.doubleclick.net https://www.google.com https://apis.google.com https://recaptcha.google.com https://www.recaptcha.net https://www.gstatic.com https://fonts.googleapis.com https://fonts.gstatic.com https://*.adtrafficquality.google; " +
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://vercel.com https://vercel.live/fonts; " +
    "font-src 'self' https://fonts.gstatic.com https://vercel.live/ https://assets.vercel.com data:; " +
    "img-src 'self' data: blob: https://*.google.com https://*.g.doubleclick.net https://pagead2.googlesyndication.com https://vercel.com https:; " +
    "connect-src 'self' https://vercel.live https://*.vercel.live https://*.pusher.com wss://*.pusher.com https://vitals.vercel-insights.com https://firebaseinstallations.googleapis.com https://identitytoolkit.googleapis.com https://securetoken.googleapis.com https://firestore.googleapis.com https://oauth2.googleapis.com https://www.google-analytics.com https://www.googletagmanager.com https://pagead2.googlesyndication.com https://googleads.g.doubleclick.net https://*.firebaseio.com https://www.googleapis.com https://accounts.google.com https://www.google.com https://www.gstatic.com https://*.adtrafficquality.google wss://*.firebaseio.com wss://*.replit.dev ws://localhost:*; " +
    "frame-src 'self' https://vercel.live/ https://googleads.g.doubleclick.net https://www.google.com https://recaptcha.google.com https://pagead2.googlesyndication.com https://tpc.googlesyndication.com https://dapsiwow.firebaseapp.com https://accounts.google.com https://www.recaptcha.net https://*.adtrafficquality.google; " +
    "worker-src 'self' blob:; " +
    "object-src 'none'; " +
    "base-uri 'self'; " +
    "form-action 'self'; " +
    "frame-ancestors 'none'; " +
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

// Define route metadata for unique SEO content (prevents soft-404s)
function getRouteMetadata(route, req) {
  const templates = {
    '/': {
      title: 'DapsiWow: Free AI Writing, Text, and other Online Tools',
      description: 'Support your productivity with premium tools that stay out of your way and work smarter. Create without limits, ads, or roadblocks. Get instant access to 180+ free online tools including finance calculators, text converters, and health trackers.'
    },
    '/all-tools': {
      title: 'All Tools - 180+ Free Online Calculators & Utilities | DapsiWow',
      description: 'Browse our complete collection of 180+ free online tools including finance calculators, text converters, health trackers, and productivity utilities. No registration required.'
    },
    '/finance-tools': {
      title: 'Free Finance Calculators & Tools | DapsiWow',
      description: 'Professional finance calculators for loans, mortgages, investments, taxes, and retirement planning. Free online tools for personal and business financial planning.'
    },
    '/text-tools': {
      title: 'Free Text Tools & Converters | DapsiWow',
      description: 'Powerful text processing tools including word counters, case converters, text formatters, and encoding/decoding utilities. Free online text manipulation tools.'
    },
    '/health-tools': {
      title: 'Free Health Calculators & Trackers | DapsiWow',
      description: 'Health and fitness calculators for BMI, calorie needs, heart rate, body composition, and wellness tracking. Free online health assessment tools.'
    },
    '/about-us': {
      title: 'About DapsiWow - Free Online Tools Platform',
      description: 'Learn about DapsiWow, the leading platform for free online tools and calculators. Our mission to provide accessible, professional-grade utilities for everyone.'
    },
    '/contact-us': {
      title: 'Contact DapsiWow - Get Support & Feedback',
      description: 'Contact DapsiWow for support, feedback, or suggestions. We value your input and are here to help with any questions about our free online tools.'
    },
    '/privacy-policy': {
      title: 'Privacy Policy - DapsiWow',
      description: 'Read DapsiWow privacy policy to understand how we protect your data and privacy when using our free online tools and calculators.'
    },
    '/terms-of-service': {
      title: 'Terms of Service - DapsiWow',
      description: 'Review DapsiWow terms of service for using our free online tools and calculators. Learn about usage policies and user responsibilities.'
    },
    '/help-center': {
      title: 'Help Center - DapsiWow Support & FAQs',
      description: 'Get help using DapsiWow tools and calculators. Find answers to frequently asked questions and tutorials for our free online utilities.'
    }
  };
  
  const template = templates[route] || templates['/'];
  return {
    ...template,
    canonical: getCanonicalUrl(route, req)
  };
}

// Function to generate tool metadata dynamically
function generateToolMetadata(toolSlug, req) {
  const toolName = toolSlug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  const baseUrl = `${req.protocol}://${req.get('host')}`;
  
  return {
    title: `${toolName} - Free Online Tool | DapsiWow`,
    description: `Use our free ${toolName.toLowerCase()} online. Fast, accurate, and secure calculator with no registration required. Professional-grade tool for instant results.`,
    canonical: `${baseUrl}${req.path}` // Use path instead of originalUrl to avoid query string fragmentation
  };
}

// Legacy route mapping table
const legacyRedirectMap = {
  '/about': '/about-us',
  // All other legacy routes redirect to /tools/ + slug
};

function getLegacyRedirectPath(legacyPath) {
  // Check explicit mapping first
  if (legacyRedirectMap[legacyPath]) {
    return legacyRedirectMap[legacyPath];
  }
  
  // For tool routes, redirect to /tools/ + slug only if target exists
  const toolPath = `/tools${legacyPath}`;
  if (isValidToolRoute(toolPath)) {
    return toolPath;
  }
  
  // No valid redirect found
  return null;
}

// Function to get dynamic canonical URL
function getCanonicalUrl(route, req) {
  const baseUrl = `${req.protocol}://${req.get('host')}`;
  return `${baseUrl}${route}`;
}

// Get known routes  
const knownRoutes = ['/', '/all-tools', '/finance-tools', '/text-tools', '/health-tools', '/about-us', '/contact-us', '/privacy-policy', '/terms-of-service', '/help-center'];

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

// Legacy redirect routes that exist in client-side router - extracted from App.tsx
const legacyRedirectRoutes = new Set([
  '/about',
  '/alcohol-calorie-calculator',
  '/baby-growth-chart',
  '/base64-encoder-decoder',
  '/binary-to-text-converter',
  '/blood-pressure-tracker',
  '/bmi-calculator',
  '/bmr-calculator',
  '/body-composition-analyzer',
  '/body-fat-calculator',
  '/body-water-percentage-calculator',
  '/break-even-calculator',
  '/budget-calculator',
  '/business-loan-calculator',
  '/calorie-calculator',
  '/carb-calculator',
  '/car-loan-calculator',
  '/case-converter',
  '/character-counter',
  '/cholesterol-risk-calculator',
  '/compound-interest-calculator',
  '/credit-card-interest-calculator',
  '/currency-percentage-change-calculator',
  '/cycling-speed-calculator',
  '/daily-step-calorie-converter',
  '/debt-consolidation-calculator',
  '/debt-payoff-calculator',
  '/decimal-to-text-converter',
  '/discount-calculator',
  '/dti-ratio-calculator',
  '/duplicate-line-remover',
  '/education-loan-calculator',
  '/emi-calculator',
  '/future-value-investment-calculator',
  '/fake-address-generator',
  '/fake-name-generator',
  '/font-style-changer',
  '/heart-rate-calculator',
  '/hex-to-text-converter',
  '/home-loan-calculator',
  '/hydration-calculator',
  '/ideal-weight-calculator',
  '/inflation-calculator',
  '/intermittent-fasting-timer',
  '/investment-return-calculator',
  '/keto-macro-calculator',
  '/lean-body-mass-calculator',
  '/lease-calculator',
  '/life-expectancy-calculator',
  '/loan-calculator',
  '/loan-comparison-calculator',
  '/lorem-ipsum-generator',
  '/max-heart-rate-calculator',
  '/markdown-to-html',
  '/metabolic-age-calculator',
  '/mortgage-calculator',
  '/net-worth-calculator',
  '/ovulation-calculator',
  '/paragraph-counter',
  '/password-generator',
  '/password-strength-checker',
  '/paypal-fee-calculator',
  '/percentage-calculator',
  '/personal-finance-dashboard',
  '/pregnancy-due-date-calculator',
  '/protein-intake-calculator',
  '/qr-code-scanner',
  '/retirement-calculator',
  '/roi-calculator',
  '/reverse-text-tool',
  '/running-pace-calculator',
  '/salary-to-hourly-calculator',
  '/savings-goal-calculator',
  '/sentence-counter',
  '/simple-interest-calculator',
  '/sip-calculator',
  '/sleep-calculator',
  '/sleep-quality-calculator',
  '/smoking-cost-calculator',
  '/stock-profit-calculator',
  '/stress-level-calculator',
  '/swimming-calorie-calculator',
  '/tax-calculator',
  '/tdee-calculator',
  '/text-cleaner-formatter',
  '/text-diff-checker',
  '/text-formatter-beautifier',
  '/text-pattern-generator',
  '/text-scrambler',
  '/text-statistics-analyzer',
  '/text-to-binary-converter',
  '/text-to-decimal-converter',
  '/text-to-hex-converter',
  '/text-to-qr-code',
  '/tip-calculator',
  '/url-extractor',
  '/username-generator',
  '/vat-gst-calculator',
  '/waist-to-height-ratio-calculator',
  '/water-intake-calculator',
  '/whr-calculator',
  '/word-counter',
]);

// Check if this is a legacy route that should be redirected by client-side router
const isLegacyRedirectRoute = (path) => {
  return legacyRedirectRoutes.has(path);
};

// Serve prerendered files with proper HTTP status codes  
app.use(async (req, res) => {
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
      // Handle legacy redirects first (301 redirect to canonical URLs)
      if (isLegacyRedirectRoute(requestPath)) {
        const canonicalPath = getLegacyRedirectPath(requestPath);
        if (canonicalPath) {
          const canonicalUrl = getCanonicalUrl(canonicalPath, req);
          console.log(`🔀 301 redirect: ${requestPath} -> ${canonicalPath}`);
          res.setHeader('Cache-Control', 'public, max-age=86400'); // Cache redirects
          return res.redirect(301, canonicalUrl);
        } else {
          // Legacy route exists but no valid target - return 404
          console.log(`❌ 404 for invalid legacy route: ${requestPath}`);
          return res.status(404)
            .setHeader('Cache-Control', 'public, max-age=300')
            .setHeader('X-Robots-Tag', 'noindex')
            .send('<!DOCTYPE html><html><head><title>Page Not Found</title></head><body><h1>404 - Page Not Found</h1><p>The requested page could not be found.</p></body></html>');
        }
      }
      
      // Check if this is a known route or valid tool route
      if (knownRoutes.includes(requestPath) || isValidToolRoute(requestPath)) {
        // Generate appropriate metadata for the route
        let metadata;
        if (requestPath.startsWith('/tools/')) {
          const toolSlug = requestPath.replace('/tools/', '');
          metadata = generateToolMetadata(toolSlug, req);
        } else {
          metadata = getRouteMetadata(requestPath, req);
        }
        
        // Read and modify HTML with route-specific metadata
        filePath = path.join(__dirname, 'dist', 'index.html');
        fileStats = await fs.stat(filePath);
        const htmlContent = await fs.readFile(filePath, 'utf8');
        
        // Inject unique metadata for this route
        const modifiedHtml = htmlContent
          .replace(/<title>.*?<\/title>/, `<title>${metadata.title}</title>`)
          .replace(/name="title" content=".*?"/, `name="title" content="${metadata.title}"`)
          .replace(/name="description" content=".*?"/, `name="description" content="${metadata.description}"`)
          .replace(/rel="canonical" href=".*?"/, `rel="canonical" href="${metadata.canonical}"`)
          .replace(/property="og:url" content=".*?"/, `property="og:url" content="${metadata.canonical}"`)
          .replace(/property="og:title" content=".*?"/, `property="og:title" content="${metadata.title}"`)
          .replace(/property="og:description" content=".*?"/, `property="og:description" content="${metadata.description}"`)
          .replace(/name="twitter:title" content=".*?"/, `name="twitter:title" content="${metadata.title}"`)
          .replace(/name="twitter:description" content=".*?"/, `name="twitter:description" content="${metadata.description}"`);
        
        console.log(`🔄 SPA with unique metadata: ${requestPath}`);
        
        // Set HTML-specific SEO headers
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        res.setHeader('X-Robots-Tag', 'index, follow');
        res.setHeader('Cache-Control', 'public, max-age=300, must-revalidate');
        
        if (fileStats) {
          res.setHeader('Last-Modified', fileStats.mtime.toUTCString());
        }
        
        return res.send(modifiedHtml);
      } else {
        // Return 404 for unknown routes to prevent soft-404s
        console.log(`❌ 404 for unknown route: ${requestPath}`);
        return res.status(404)
          .setHeader('Cache-Control', 'public, max-age=300')
          .setHeader('X-Robots-Tag', 'noindex')
          .send('<!DOCTYPE html><html><head><title>Page Not Found</title></head><body><h1>404 - Page Not Found</h1><p>The requested page could not be found.</p></body></html>');
      }
    }
    
    // Handle prerendered content
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('X-Robots-Tag', 'index, follow');
    res.setHeader('Cache-Control', 'public, max-age=3600, must-revalidate');
    
    if (fileStats) {
      res.setHeader('Last-Modified', fileStats.mtime.toUTCString());
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