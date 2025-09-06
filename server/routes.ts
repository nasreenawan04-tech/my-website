import type { Express, Request } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import multer from 'multer';
import { encrypt } from 'node-qpdf2';
import path from 'path';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';

interface MulterRequest extends Request {
  file?: Express.Multer.File;
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function registerRoutes(app: Express): Promise<Server> {
  // Configure multer for file uploads
  const storage_config = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, `${uniqueSuffix}-${file.originalname}`);
    }
  });

  const upload = multer({ 
    storage: storage_config,
    fileFilter: (req, file, cb) => {
      if (file.mimetype === 'application/pdf') {
        cb(null, true);
      } else {
        cb(new Error('Only PDF files are allowed'));
      }
    },
    limits: {
      fileSize: 50 * 1024 * 1024 // 50MB limit
    }
  });

  // PDF Encryption endpoint using qpdf
  app.post('/api/encrypt-pdf', upload.single('pdf'), async (req: MulterRequest, res) => {
    try {
      const { 
        userPassword, 
        ownerPassword,
        allowPrinting = false,
        allowModifying = false,
        allowCopying = false,
        allowAnnotating = false,
        keyLength = 256
      } = req.body;

      if (!req.file) {
        return res.status(400).json({ error: 'No PDF file uploaded' });
      }

      if (!userPassword || userPassword.trim().length < 4) {
        return res.status(400).json({ error: 'User password must be at least 4 characters long' });
      }

      const inputPath = req.file.path;
      const outputFileName = `encrypted-${Date.now()}-${req.file.originalname}`;
      const outputPath = path.join('encrypted', outputFileName);

      // Prepare qpdf encryption options
      const encryptionOptions: any = {
        input: inputPath,
        output: outputPath,
        password: userPassword.trim(),
        keyLength: parseInt(keyLength)
      };

      // Add owner password if provided
      if (ownerPassword && ownerPassword.trim()) {
        encryptionOptions.ownerPassword = ownerPassword.trim();
      }

      // Configure restrictions based on permissions
      const restrictions: any = {};
      
      if (keyLength === 256) {
        restrictions.print = allowPrinting ? 'full' : 'none';
        restrictions.modify = allowModifying ? 'all' : 'none';
        restrictions.extract = allowCopying ? 'y' : 'n';
        restrictions.annotate = allowAnnotating ? 'y' : 'n';
        restrictions.useAes = 'y';
      } else if (keyLength === 128) {
        restrictions.print = allowPrinting ? 'low' : 'none';
        restrictions.modify = allowModifying ? 'all' : 'none';
        restrictions.extract = allowCopying ? 'y' : 'n';
        restrictions.useAes = 'y';
      }

      encryptionOptions.restrictions = restrictions;

      // Encrypt the PDF using qpdf
      await encrypt(encryptionOptions);

      // Read the encrypted file and send it back
      const encryptedBuffer = await fs.readFile(outputPath);

      // Clean up input file
      await fs.unlink(inputPath);

      // Set headers for download
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="protected-${req.file.originalname}"`);
      res.setHeader('Content-Length', encryptedBuffer.length);

      // Send the encrypted file
      res.send(encryptedBuffer);

      // Clean up output file after sending
      setTimeout(async () => {
        try {
          await fs.unlink(outputPath);
        } catch (error) {
          console.error('Error cleaning up output file:', error);
        }
      }, 1000);

    } catch (error) {
      console.error('PDF encryption error:', error);
      
      // Clean up files on error
      if (req.file?.path) {
        try {
          await fs.unlink(req.file.path);
        } catch (cleanupError) {
          console.error('Error cleaning up input file:', cleanupError);
        }
      }

      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      res.status(500).json({ error: `PDF encryption failed: ${errorMessage}` });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
