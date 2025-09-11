import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";

export async function registerRoutes(app: Express): Promise<Server> {
  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // API endpoint for future non-PDF tools if needed
  app.get('/api/tools', (req, res) => {
    res.json({ message: 'API ready for future tools' });
  });

  const httpServer = createServer(app);
  return httpServer;
}