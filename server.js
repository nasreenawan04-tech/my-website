import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());

// API routes - stubbed out or use in-memory for simple logic if storage isn't ready
app.post('/api/collections', async (req, res) => {
    res.status(501).json({ error: "API not implemented in production server yet" });
});

app.get('/api/collections/:shareId', async (req, res) => {
    res.status(501).json({ error: "API not implemented in production server yet" });
});

// Serve static files from the dist directory
app.use(express.static(path.join(__dirname, 'client', 'dist')));

// SPA Fallback: Serve index.html for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client', 'dist', 'index.html'));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
