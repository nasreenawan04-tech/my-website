import express from 'express';
import { collections, insertCollectionSchema } from './shared/schema.js';
import { nanoid } from 'nanoid';

const app = express();
app.use(express.json());

// In-memory storage for collections since we don't have a DB set up yet
const sharedCollections = new Map();

app.post('/api/collections', async (req, res) => {
  try {
    const data = insertCollectionSchema.parse(req.body);
    sharedCollections.set(data.shareId, data);
    res.json({ success: true, shareId: data.shareId });
  } catch (error) {
    res.status(400).json({ error: "Invalid data" });
  }
});

app.get('/api/collections/:shareId', (req, res) => {
  const collection = sharedCollections.get(req.params.shareId);
  if (!collection) return res.status(404).json({ error: "Not found" });
  res.json(collection);
});

// ... existing server logic ...
