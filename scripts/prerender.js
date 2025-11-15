import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import puppeteer from 'puppeteer';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import tools data to automatically generate all tool routes
import { readFileSync } from 'fs';

// Read and parse tools data
const toolsContent = readFileSync(path.join(__dirname, '../client/src/data/tools.ts'), 'utf8');
const toolIdMatches = toolsContent.match(/id:\s*["']([^"']+)["']/g) || [];
const toolIds = toolIdMatches.map(match => match.match(/["']([^"']+)["']/)[1]);

// Generate routes for all tools automatically
const toolRoutes = toolIds.map(id => `/tools/${id}`);

// Core routes + all tool routes
const routes = [
  '/',
  '/finance-tools',
  '/text-tools', 
  '/health-tools',
  '/all-tools',
  '/about-us',
  '/contact-us',
  '/privacy-policy',
  '/terms-of-service',
  '/help-center',
  ...toolRoutes
];

async function prerenderRoute(browser, route, baseURL) {
  console.log(`Prerendering ${route}...`);
  
  const page = await browser.newPage();
  
  try {
    // Set viewport for consistent rendering
    await page.setViewport({ width: 1280, height: 720 });
    
    await page.goto(`${baseURL}${route}`, {
      waitUntil: 'networkidle0',
      timeout: 30000
    });

    // Wait for React to fully render - try multiple selectors
    try {
      await page.waitForSelector('[data-testid]', { timeout: 10000 });
    } catch {
      // Fallback to waiting for main content
      await page.waitForSelector('main, #root > *', { timeout: 5000 });
    }
    
    // Get the fully rendered HTML
    let html = await page.content();
    
    // Optimize the HTML for static serving
    html = html.replace(/data-reactroot=""/g, '');
    html = html.replace(/data-testid="[^"]*"/g, '');
    
    // Create directory structure for proper static serving
    // For SEO-friendly URLs: /tools/foo -> /tools/foo/index.html
    let filePath;
    if (route === '/') {
      filePath = path.join(__dirname, '../dist', 'index.html');
    } else if (route.startsWith('/tools/')) {
      const toolId = route.replace('/tools/', '');
      filePath = path.join(__dirname, '../dist', 'tools', toolId, 'index.html');
    } else {
      const routePath = route.replace(/^\/+/, '');
      filePath = path.join(__dirname, '../dist', routePath, 'index.html');
    }
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
    // Ensure dist directory exists
    await fs.mkdir(path.join(__dirname, '../dist'), { recursive: true });
    
    // Prerender all routes concurrently (in batches to avoid overwhelming)
    const batchSize = 3; // Reduced batch size for better stability
    let completed = 0;
    
    for (let i = 0; i < routes.length; i += batchSize) {
      const batch = routes.slice(i, i + batchSize);
      await Promise.all(
        batch.map(route => prerenderRoute(browser, route, baseURL))
      );
      completed += batch.length;
      console.log(`Progress: ${completed}/${routes.length} pages completed`);
    }
    
    // Copy original index.html as fallback
    try {
      const originalIndex = await fs.readFile(path.join(__dirname, '../client/index.html'), 'utf8');
      await fs.writeFile(path.join(__dirname, '../dist/404.html'), originalIndex, 'utf8');
    } catch (err) {
      console.warn('Could not create 404.html fallback:', err.message);
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