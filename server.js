import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { generateSitemap } from './server/sitemap.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import { storage } from './server/storage.js';
import { insertCalculationHistorySchema } from './shared/schema.js';

const app = express();
app.use(express.json());

// Dynamic Sitemap Route
app.get('/sitemap.xml', (req, res) => {
  const domain = req.get('host') || 'dapsiwow.com';
  const sitemap = generateSitemap(domain);
  res.header('Content-Type', 'application/xml');
  res.send(sitemap);
});

// Calculation History API
app.get('/api/history', async (req, res) => {
  try {
    const history = await storage.getCalculationHistory();
    res.json(history);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch history" });
  }
});

app.post('/api/history', async (req, res) => {
  try {
    const data = insertCalculationHistorySchema.parse(req.body);
    const result = await storage.createCalculationHistory(data);
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// API routes - collections
app.post('/api/collections', async (req, res) => {
    res.status(501).json({ error: "API not implemented in production server yet" });
});

app.get('/api/collections/:shareId', async (req, res) => {
    res.status(501).json({ error: "API not implemented in production server yet" });
});

// Serve static files from the dist directory
app.use(express.static(path.join(__dirname, 'client', 'dist')));

// SPA Fallback: Serve index.html for all other routes
app.get('/*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client', 'dist', 'index.html'));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
