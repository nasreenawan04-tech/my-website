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
      cb(null, path.join(__dirname, '../uploads/'));
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
      const outputPath = path.join(__dirname, '../encrypted', outputFileName);

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

  // PDF Unlock endpoint using qpdf
  app.post('/api/unlock-pdf', upload.single('pdf'), async (req: MulterRequest, res) => {
    try {
      const { password } = req.body;

      if (!req.file) {
        return res.status(400).json({ error: 'No PDF file uploaded' });
      }

      if (!password || password.trim().length === 0) {
        return res.status(400).json({ error: 'Password is required to unlock the PDF' });
      }

      const inputPath = req.file.path;
      const outputFileName = `unlocked-${Date.now()}-${req.file.originalname}`;
      const outputPath = path.join(__dirname, '../encrypted', outputFileName);

      // Import decrypt function from node-qpdf2
      const { decrypt } = await import('node-qpdf2');

      // Prepare qpdf decryption options
      const decryptionOptions: any = {
        input: inputPath,
        output: outputPath,
        password: password.trim()
      };

      // Decrypt the PDF using qpdf
      await decrypt(decryptionOptions);

      // Read the decrypted file and send it back
      const decryptedBuffer = await fs.readFile(outputPath);

      // Clean up input file
      await fs.unlink(inputPath);

      // Set headers for download
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="unlocked-${req.file.originalname}"`);
      res.setHeader('Content-Length', decryptedBuffer.length);

      // Send the decrypted file
      res.send(decryptedBuffer);

      // Clean up output file after sending
      setTimeout(async () => {
        try {
          await fs.unlink(outputPath);
        } catch (error) {
          console.error('Error cleaning up output file:', error);
        }
      }, 1000);

    } catch (error) {
      console.error('PDF decryption error:', error);
      
      // Clean up files on error
      if (req.file?.path) {
        try {
          await fs.unlink(req.file.path);
        } catch (cleanupError) {
          console.error('Error cleaning up input file:', cleanupError);
        }
      }

      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      
      // Check if it's a wrong password error
      if (errorMessage.toLowerCase().includes('password') || errorMessage.toLowerCase().includes('invalid')) {
        res.status(400).json({ error: 'Invalid password. Please check your password and try again.' });
      } else {
        res.status(500).json({ error: `PDF unlock failed: ${errorMessage}` });
      }
    }
  });

  // PDF Page Number Adder endpoint using pdf-lib
  app.post('/api/add-page-numbers', upload.single('pdf'), async (req: MulterRequest, res) => {
    try {
      const { 
        position = 'bottom-center',
        startNumber = 1,
        fontSize = 12,
        fontColor = '#000000',
        marginX = 50,
        marginY = 30,
        skipFirstPage = false
      } = req.body;

      if (!req.file) {
        return res.status(400).json({ error: 'No PDF file uploaded' });
      }

      // Validate input parameters
      const validPositions = ['top-left', 'top-center', 'top-right', 'bottom-left', 'bottom-center', 'bottom-right'];
      if (!validPositions.includes(position)) {
        return res.status(400).json({ error: 'Invalid position specified' });
      }

      const startNum = parseInt(startNumber);
      const fontSizeNum = parseInt(fontSize);
      const marginXNum = parseInt(marginX);
      const marginYNum = parseInt(marginY);

      if (isNaN(startNum) || startNum < 1) {
        return res.status(400).json({ error: 'Start number must be a positive integer' });
      }
      if (isNaN(fontSizeNum) || fontSizeNum < 6 || fontSizeNum > 48) {
        return res.status(400).json({ error: 'Font size must be between 6 and 48' });
      }
      if (isNaN(marginXNum) || marginXNum < 0 || marginXNum > 200) {
        return res.status(400).json({ error: 'Horizontal margin must be between 0 and 200' });
      }
      if (isNaN(marginYNum) || marginYNum < 0 || marginYNum > 200) {
        return res.status(400).json({ error: 'Vertical margin must be between 0 and 200' });
      }

      // Validate color format
      if (!/^#[0-9A-Fa-f]{6}$/.test(fontColor)) {
        return res.status(400).json({ error: 'Invalid color format. Use hex format like #000000' });
      }

      // Import PDF-lib for page numbering
      const { PDFDocument, rgb, StandardFonts } = await import('pdf-lib');

      // Read the uploaded PDF
      const pdfBytes = await fs.readFile(req.file.path);
      const pdfDoc = await PDFDocument.load(pdfBytes);
      
      const pages = pdfDoc.getPages();
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      
      // Parse color from hex
      const hexToRgb = (hex: string) => {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
          r: parseInt(result[1], 16) / 255,
          g: parseInt(result[2], 16) / 255,
          b: parseInt(result[3], 16) / 255
        } : { r: 0, g: 0, b: 0 };
      };
      
      const color = hexToRgb(fontColor);
      const textColor = rgb(color.r, color.g, color.b);
      
      // Add page numbers
      pages.forEach((page, index) => {
        // Skip first page if requested
        if (skipFirstPage === 'true' && index === 0) {
          return;
        }
        
        // Calculate page number (adjust for skipped first page)
        const pageNumber = skipFirstPage === 'true' 
          ? startNum + index - 1
          : startNum + index;
        
        const { width, height } = page.getSize();
        const text = pageNumber.toString();
        const textWidth = font.widthOfTextAtSize(text, fontSizeNum);
        
        let x: number, y: number;
        
        // Calculate position based on selected position
        switch (position) {
          case 'top-left':
            x = marginXNum;
            y = height - marginYNum;
            break;
          case 'top-center':
            x = (width - textWidth) / 2;
            y = height - marginYNum;
            break;
          case 'top-right':
            x = width - textWidth - marginXNum;
            y = height - marginYNum;
            break;
          case 'bottom-left':
            x = marginXNum;
            y = marginYNum;
            break;
          case 'bottom-center':
            x = (width - textWidth) / 2;
            y = marginYNum;
            break;
          case 'bottom-right':
            x = width - textWidth - marginXNum;
            y = marginYNum;
            break;
          default:
            x = (width - textWidth) / 2;
            y = marginYNum;
        }
        
        // Draw the page number
        page.drawText(text, {
          x,
          y,
          size: fontSizeNum,
          font,
          color: textColor,
        });
      });
      
      // Save the PDF with page numbers
      const modifiedPdfBytes = await pdfDoc.save();
      
      // Clean up input file
      await fs.unlink(req.file.path);
      
      // Set headers for download
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="numbered-${req.file.originalname}"`);
      res.setHeader('Content-Length', modifiedPdfBytes.length);
      
      // Send the modified PDF
      res.send(Buffer.from(modifiedPdfBytes));
      
    } catch (error) {
      console.error('PDF page numbering error:', error);
      
      // Clean up files on error
      if (req.file?.path) {
        try {
          await fs.unlink(req.file.path);
        } catch (cleanupError) {
          console.error('Error cleaning up input file:', cleanupError);
        }
      }

      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      res.status(500).json({ error: `PDF page numbering failed: ${errorMessage}` });
    }
  });

  // PDF Page Organizer endpoint using pdf-lib
  app.post('/api/organize-pdf-pages', upload.single('pdf'), async (req: MulterRequest, res) => {
    try {
      const { pageOrder } = req.body;

      if (!req.file) {
        return res.status(400).json({ error: 'No PDF file uploaded' });
      }

      if (!pageOrder) {
        return res.status(400).json({ error: 'Page order not specified' });
      }

      // Parse page order (should be array of page indices)
      let parsedPageOrder: number[];
      try {
        parsedPageOrder = JSON.parse(pageOrder);
      } catch (error) {
        return res.status(400).json({ error: 'Invalid page order format' });
      }

      if (!Array.isArray(parsedPageOrder) || parsedPageOrder.length === 0) {
        return res.status(400).json({ error: 'Page order must be a non-empty array' });
      }

      // Import PDF-lib for page organization
      const { PDFDocument } = await import('pdf-lib');

      // Read the uploaded PDF
      const pdfBytes = await fs.readFile(req.file.path);
      const originalPdf = await PDFDocument.load(pdfBytes);
      
      const originalPages = originalPdf.getPages();
      const totalPages = originalPages.length;

      // Validate page indices
      for (const pageIndex of parsedPageOrder) {
        if (!Number.isInteger(pageIndex) || pageIndex < 0 || pageIndex >= totalPages) {
          return res.status(400).json({ 
            error: `Invalid page index: ${pageIndex}. Must be between 0 and ${totalPages - 1}` 
          });
        }
      }

      // Create a new PDF document
      const newPdf = await PDFDocument.create();

      // Copy pages in the specified order (batch copy for better performance)
      const indicesToCopy = Array.from(new Set(parsedPageOrder));
      const copiedPages = await newPdf.copyPages(originalPdf, indicesToCopy);
      
      // Add pages in the correct order
      for (const pageIndex of parsedPageOrder) {
        const mappedIndex = indicesToCopy.indexOf(pageIndex);
        newPdf.addPage(copiedPages[mappedIndex]);
      }

      // Save the reorganized PDF with optimization
      const reorganizedPdfBytes = await newPdf.save({ useObjectStreams: false });
      
      // Clean up input file
      await fs.unlink(req.file.path);
      
      // Set headers for download
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="organized-${req.file.originalname}"`);
      res.setHeader('Content-Length', reorganizedPdfBytes.length);
      
      // Send the reorganized PDF
      res.send(Buffer.from(reorganizedPdfBytes));
      
    } catch (error) {
      console.error('PDF page organization error:', error);
      
      // Clean up files on error
      if (req.file?.path) {
        try {
          await fs.unlink(req.file.path);
        } catch (cleanupError) {
          console.error('Error cleaning up input file:', cleanupError);
        }
      }

      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      res.status(500).json({ error: `PDF page organization failed: ${errorMessage}` });
    }
  });

  // Get PDF page info endpoint (for preview thumbnails)
  app.post('/api/pdf-page-info', upload.single('pdf'), async (req: MulterRequest, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No PDF file uploaded' });
      }

      // Import PDF-lib for page analysis
      const { PDFDocument } = await import('pdf-lib');

      // Read the uploaded PDF
      const pdfBytes = await fs.readFile(req.file.path);
      const pdfDoc = await PDFDocument.load(pdfBytes);
      
      const pages = pdfDoc.getPages();
      const pageInfo = pages.map((page, index) => {
        const { width, height } = page.getSize();
        return {
          index,
          width: Math.round(width),
          height: Math.round(height),
          ratio: Math.round((width / height) * 100) / 100
        };
      });

      // Clean up input file
      await fs.unlink(req.file.path);
      
      res.json({
        totalPages: pages.length,
        pages: pageInfo
      });
      
    } catch (error) {
      console.error('PDF page info error:', error);
      
      // Clean up files on error
      if (req.file?.path) {
        try {
          await fs.unlink(req.file.path);
        } catch (cleanupError) {
          console.error('Error cleaning up input file:', cleanupError);
        }
      }

      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      res.status(500).json({ error: `PDF analysis failed: ${errorMessage}` });
    }
  });

  // PDF Editor endpoint using pdf-lib
  app.post('/api/edit-pdf', upload.single('pdf'), async (req: MulterRequest, res) => {
    try {
      const { annotations } = req.body;

      if (!req.file) {
        return res.status(400).json({ error: 'No PDF file uploaded' });
      }

      if (!annotations) {
        return res.status(400).json({ error: 'No annotations provided' });
      }

      // Parse annotations
      let parsedAnnotations: any[];
      try {
        parsedAnnotations = JSON.parse(annotations);
      } catch (error) {
        return res.status(400).json({ error: 'Invalid annotations format' });
      }

      // Import PDF-lib for editing
      const { PDFDocument, rgb, StandardFonts } = await import('pdf-lib');

      // Read the uploaded PDF
      const pdfBytes = await fs.readFile(req.file.path);
      const pdfDoc = await PDFDocument.load(pdfBytes);
      
      const pages = pdfDoc.getPages();
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

      // Apply annotations to each page
      for (const annotation of parsedAnnotations) {
        const page = pages[annotation.pageIndex];
        if (!page) continue;

        const { width: pageWidth, height: pageHeight } = page.getSize();
        
        // Convert hex color to RGB
        const hexToRgb = (hex: string) => {
          const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
          return result ? {
            r: parseInt(result[1], 16) / 255,
            g: parseInt(result[2], 16) / 255,
            b: parseInt(result[3], 16) / 255
          } : { r: 0, g: 0, b: 0 };
        };

        const color = hexToRgb(annotation.color);
        const rgbColor = rgb(color.r, color.g, color.b);

        // Apply different annotation types
        switch (annotation.type) {
          case 'text':
            if (annotation.text) {
              page.drawText(annotation.text, {
                x: annotation.x,
                y: pageHeight - annotation.y - (annotation.fontSize || 16),
                size: annotation.fontSize || 16,
                font,
                color: rgbColor
              });
            }
            break;

          case 'highlight':
            if (annotation.width && annotation.height) {
              page.drawRectangle({
                x: annotation.x,
                y: pageHeight - annotation.y - annotation.height,
                width: annotation.width,
                height: annotation.height,
                color: rgbColor,
                opacity: 0.3
              });
            }
            break;

          case 'rectangle':
            if (annotation.width && annotation.height) {
              page.drawRectangle({
                x: annotation.x,
                y: pageHeight - annotation.y - annotation.height,
                width: annotation.width,
                height: annotation.height,
                borderColor: rgbColor,
                borderWidth: 2
              });
            }
            break;

          case 'circle':
            if (annotation.width && annotation.height) {
              page.drawEllipse({
                x: annotation.x + annotation.width / 2,
                y: pageHeight - annotation.y - annotation.height / 2,
                xScale: annotation.width / 2,
                yScale: annotation.height / 2,
                borderColor: rgbColor,
                borderWidth: 2
              });
            }
            break;

          case 'line':
            page.drawLine({
              start: { x: annotation.x, y: pageHeight - annotation.y },
              end: { x: annotation.x + (annotation.width || 100), y: pageHeight - annotation.y },
              thickness: 2,
              color: rgbColor
            });
            break;

          case 'arrow':
            // Draw line with arrowhead
            const endX = annotation.x + (annotation.width || 100);
            const endY = pageHeight - annotation.y;
            
            page.drawLine({
              start: { x: annotation.x, y: pageHeight - annotation.y },
              end: { x: endX, y: endY },
              thickness: 2,
              color: rgbColor
            });
            
            // Draw arrowhead
            page.drawLine({
              start: { x: endX - 10, y: endY - 5 },
              end: { x: endX, y: endY },
              thickness: 2,
              color: rgbColor
            });
            page.drawLine({
              start: { x: endX - 10, y: endY + 5 },
              end: { x: endX, y: endY },
              thickness: 2,
              color: rgbColor
            });
            break;
        }
      }

      // Save the edited PDF
      const editedPdfBytes = await pdfDoc.save();
      
      // Clean up input file
      await fs.unlink(req.file.path);
      
      // Set headers for download
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="edited-${req.file.originalname}"`);
      res.setHeader('Content-Length', editedPdfBytes.length);
      
      // Send the edited PDF
      res.send(Buffer.from(editedPdfBytes));
      
    } catch (error) {
      console.error('PDF editing error:', error);
      
      // Clean up files on error
      if (req.file?.path) {
        try {
          await fs.unlink(req.file.path);
        } catch (cleanupError) {
          console.error('Error cleaning up input file:', cleanupError);
        }
      }

      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      res.status(500).json({ error: `PDF editing failed: ${errorMessage}` });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
