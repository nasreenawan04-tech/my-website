import type { Express, Request, Response } from "express";
import { z } from "zod";
import { storage } from "./storage";
import { insertFeedbackSchema, insertToolUsageSchema } from "../shared/schema";

export function registerRoutes(app: Express) {
  // Feedback routes
  app.post("/api/feedback", async (req: Request, res: Response) => {
    try {
      const validatedData = insertFeedbackSchema.parse(req.body);
      const feedback = await storage.createFeedback(validatedData);
      res.json(feedback);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: error.errors });
      } else {
        res.status(500).json({ error: "Internal server error" });
      }
    }
  });

  app.get("/api/feedback", async (req: Request, res: Response) => {
    try {
      const feedback = await storage.getAllFeedback();
      res.json(feedback);
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Tool usage tracking routes
  app.post("/api/tool-usage", async (req: Request, res: Response) => {
    try {
      const validatedData = insertToolUsageSchema.parse(req.body);
      const usage = await storage.trackToolUsage(validatedData);
      res.json(usage);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: error.errors });
      } else {
        res.status(500).json({ error: "Internal server error" });
      }
    }
  });

  app.get("/api/tool-usage/stats", async (req: Request, res: Response) => {
    try {
      const stats = await storage.getToolUsageStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  });
}
