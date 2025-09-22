import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import puppeteer from 'puppeteer';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Routes to prerender for better SEO and performance
const routes = [
  '/',
  '/finance-tools',
  '/text-tools', 
  '/health-tools',
  '/all-tools',
  '/tools/loan-calculator',
  '/tools/bmi-calculator',
  '/tools/mortgage-calculator',
  '/tools/word-counter',
  '/tools/character-counter',
  '/tools/emi-calculator',
  '/tools/tax-calculator',
  '/tools/compound-interest-calculator',
  '/tools/simple-interest-calculator',
  '/tools/roi-calculator',
  '/tools/bmi-calculator',
  '/tools/bmr-calculator',
  '/tools/calorie-calculator',
  '/tools/password-generator',
  '/tools/qr-code-generator'
];

async function prerenderRoute(browser, route, baseURL) {
  console.log(`Prerendering ${route}...`);
  
  const page = await browser.newPage();
  
  try {
    await page.goto(`${baseURL}${route}`, {
      waitUntil: 'networkidle0',
      timeout: 30000
    });

    // Wait for React to fully render
    await page.waitForSelector('[data-testid]', { timeout: 10000 });
    
    // Get the fully rendered HTML
    const html = await page.content();
    
    // Create directory structure - save to dist for production serving
    const sanitizedRoute = route === '/' ? 'index.html' : `${route.replace(/^\/+/, '')}.html`;
    const filePath = path.join(__dirname, '../dist/prerendered', sanitizedRoute);
    const dir = path.dirname(filePath);
    
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(filePath, html, 'utf8');
    
    console.log(`✓ Prerendered ${route} to ${filePath}`);
    
  } catch (error) {
    console.error(`✗ Failed to prerender ${route}:`, error.message);
  } finally {
    await page.close();
  }
}

async function prerender() {
  console.log('🚀 Starting prerendering process...');
  
  const baseURL = process.env.PRERENDER_URL || 'http://localhost:5000';
  
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    // Create prerendered directory in dist for production
    await fs.mkdir(path.join(__dirname, '../dist/prerendered'), { recursive: true });
    
    // Prerender all routes concurrently (in batches to avoid overwhelming)
    const batchSize = 5;
    for (let i = 0; i < routes.length; i += batchSize) {
      const batch = routes.slice(i, i + batchSize);
      await Promise.all(
        batch.map(route => prerenderRoute(browser, route, baseURL))
      );
    }
    
    console.log(`✅ Prerendering complete! Generated ${routes.length} static pages`);
    
  } catch (error) {
    console.error('❌ Prerendering failed:', error);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

// Generate sitemap with prerendered routes
async function generateSitemap() {
  const baseURL = 'https://dapsiwow.com';
  const currentDate = new Date().toISOString().split('T')[0];
  
  const sitemapEntries = routes.map(route => {
    const url = `${baseURL}${route}`;
    const priority = route === '/' ? '1.0' : route.includes('/tools/') ? '0.8' : '0.9';
    
    return `  <url>
    <loc>${url}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${priority}</priority>
  </url>`;
  }).join('\n');

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapEntries}
</urlset>`;

  await fs.writeFile(path.join(__dirname, '../client/public/sitemap-prerendered.xml'), sitemap, 'utf8');
  console.log('📋 Generated sitemap for prerendered pages');
}

if (import.meta.url === `file://${process.argv[1]}`) {
  prerender().then(() => generateSitemap()).catch(console.error);
}

export { prerender, generateSitemap };