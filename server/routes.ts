import type { Express, Request, Response } from "express";
import { z } from "zod";
import { storage } from "./storage";
import { insertFeedbackSchema, insertToolUsageSchema } from "../shared/schema";
import multer from "multer";
import { PDFDocument } from "pdf-lib";

const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

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

  // PDF Encryption/Decryption route
  app.post("/api/pdf-encrypt", upload.single('pdf'), async (req: Request, res: Response) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No PDF file provided" });
      }

      const { password, action } = req.body;
      
      if (!password || password.length < 6) {
        return res.status(400).json({ error: "Password must be at least 6 characters long" });
      }

      if (!action || !['encrypt', 'decrypt'].includes(action)) {
        return res.status(400).json({ error: "Invalid action" });
      }

      const pdfDoc = await PDFDocument.load(req.file.buffer, {
        ignoreEncryption: action === 'decrypt'
      });

      let pdfBytes: Uint8Array;

      if (action === 'encrypt') {
        pdfBytes = await pdfDoc.save({
          userPassword: password,
          ownerPassword: password,
          useObjectStreams: false
        });
      } else {
        // For decryption, just save without password
        pdfBytes = await pdfDoc.save();
      }

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${action}ed.pdf"`);
      res.send(Buffer.from(pdfBytes));

    } catch (error) {
      console.error('PDF processing error:', error);
      if (error instanceof Error) {
        if (error.message.includes('password')) {
          res.status(401).json({ error: "Incorrect password or PDF is not encrypted" });
        } else {
          res.status(500).json({ error: error.message });
        }
      } else {
        res.status(500).json({ error: "Failed to process PDF" });
      }
    }
  });
}
