import express from 'express';
import { storage } from './server/storage.js';
import { insertCollectionSchema } from './shared/schema.js';

const app = express();
app.use(express.json());

app.post('/api/collections', async (req, res) => {
  try {
    const data = insertCollectionSchema.parse(req.body);
    const collection = await storage.createCollection(data);
    res.json(collection);
  } catch (error) {
    res.status(400).json({ error: "Invalid collection data" });
  }
});

app.get('/api/collections/:shareId', async (req, res) => {
  try {
    const collection = await storage.getCollection(req.params.shareId);
    if (!collection) {
      return res.status(404).json({ error: "Collection not found" });
    }
    res.json(collection);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

// ... existing server logic ...
