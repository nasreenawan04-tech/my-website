// This will be our clean redaction endpoint
import type { Express, Request } from "express";
import { createServer, type Server } from "http";
import multer from 'multer';
import { PDFDocument, rgb } from 'pdf-lib';
import path from 'path';
import fs from 'fs/promises';

interface MulterRequest extends Request {
  file?: Express.Multer.File;
}

// PDF Redaction endpoint - FIXED VERSION
export const redactPdfEndpoint = (app: Express, upload: any) => {
  app.post('/api/redact-pdf', upload.single('pdf'), async (req: MulterRequest, res) => {
    try {
      const { settings } = req.body;

      if (!req.file) {
        return res.status(400).json({ error: 'No PDF file uploaded' });
      }

      // Validate file type
      if (req.file.mimetype !== 'application/pdf') {
        await fs.unlink(req.file.path);
        return res.status(400).json({ error: 'Invalid file type. Please upload a PDF file.' });
      }

      if (!settings) {
        await fs.unlink(req.file.path);
        return res.status(400).json({ error: 'No redaction settings specified' });
      }

      const { PDFDocument, rgb } = await import('pdf-lib');
      const inputPath = req.file.path;
      const startTime = Date.now();
      let redactionsApplied = 0;

      try {
        // Parse redaction settings
        const redactionSettings = JSON.parse(settings);
        
        // Read the PDF
        const pdfBytes = await fs.readFile(inputPath);
        const pdfDoc = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
        const pages = pdfDoc.getPages();

        // Convert hex color to RGB
        const hexToRgb = (hex: string) => {
          const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
          return result ? {
            r: parseInt(result[1], 16) / 255,
            g: parseInt(result[2], 16) / 255,
            b: parseInt(result[3], 16) / 255,
          } : { r: 0, g: 0, b: 0 };
        };

        const redactionColor = hexToRgb(redactionSettings.color || '#000000');

        // Extract text from entire PDF for analysis
        let pdfText = '';
        let pageTexts: string[] = [];
        
        try {
          const pdfParse = await import('pdf-parse-debugging-disabled');
          const textData = await pdfParse.default(pdfBytes);
          pdfText = textData.text;
          
          // Split text by estimated page breaks (approximate)
          const avgCharsPerPage = Math.ceil(pdfText.length / pages.length);
          for (let i = 0; i < pages.length; i++) {
            const start = i * avgCharsPerPage;
            const end = Math.min((i + 1) * avgCharsPerPage, pdfText.length);
            pageTexts.push(pdfText.substring(start, end));
          }
        } catch (parseError) {
          console.warn('Text extraction failed, using coordinate-based redaction only:', parseError);
          // Fallback: create empty page texts
          pageTexts = pages.map(() => '');
        }

        // Track redactions by page for detailed reporting
        const redactionsByPage: Array<{
          page: number;
          count: number;
          terms: string[];
        }> = [];

        // Helper function to get pattern name for reporting
        const getPatternName = (pattern: string): string => {
          const patternMap: { [key: string]: string } = {
            '\\\\d{3}-\\\\d{2}-\\\\d{4}': 'SSN',
            '\\\\(\\\\d{3}\\\\)\\\\s*\\\\d{3}-\\\\d{4}': 'Phone',
            '[\\\\w\\\\.-]+@[\\\\w\\\\.-]+\\\\.[a-zA-Z]{2,}': 'Email',
            '\\\\d{4}[\\\\s-]?\\\\d{4}[\\\\s-]?\\\\d{4}[\\\\s-]?\\\\d{4}': 'Credit Card',
            '\\\\d{1,2}[/\\\\-]\\\\d{1,2}[/\\\\-]\\\\d{2,4}': 'Date',
            '\\\\d{5}(-\\\\d{4})?': 'ZIP Code'
          };
          return patternMap[pattern] || 'Pattern Match';
        };

        // Process each page for redactions
        for (let pageIndex = 0; pageIndex < pages.length; pageIndex++) {
          const page = pages[pageIndex];
          const { width, height } = page.getSize();
          const pageText = pageTexts[pageIndex] || '';
          
          let pageRedactions = 0;
          const termsFoundOnPage: string[] = [];

          // Text-based redaction
          if (redactionSettings.mode === 'text' && redactionSettings.searchTerms?.length > 0) {
            for (const term of redactionSettings.searchTerms) {
              let searchText = pageText;
              let searchTerm = term;
              
              // Apply case sensitivity
              if (!redactionSettings.caseSensitive) {
                searchText = searchText.toLowerCase();
                searchTerm = searchTerm.toLowerCase();
              }
              
              let searchIndex = 0;
              const matches = [];
              
              // Find all occurrences of the term
              while (searchIndex < searchText.length) {
                let foundIndex;
                
                if (redactionSettings.wholeWords) {
                  // Use regex for whole word matching
                  const regex = new RegExp(`\\\\b${searchTerm.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\\\$&')}\\\\b`, 'gi');
                  const match = regex.exec(searchText.substring(searchIndex));
                  if (match) {
                    foundIndex = searchIndex + match.index;
                    searchIndex = foundIndex + match[0].length;
                  } else {
                    break;
                  }
                } else {
                  foundIndex = searchText.indexOf(searchTerm, searchIndex);
                  if (foundIndex === -1) break;
                  searchIndex = foundIndex + searchTerm.length;
                }
                
                matches.push(foundIndex);
              }
              
              // Create redaction rectangles for found matches
              if (matches.length > 0) {
                termsFoundOnPage.push(term);
                
                matches.forEach(matchIndex => {
                  // Estimate text position on page (simplified approach)
                  const textProgress = matchIndex / Math.max(pageText.length, 1);
                  const linesPerPage = Math.ceil(height / 20);
                  const lineNumber = Math.floor(textProgress * linesPerPage);
                  
                  const x = 50 + Math.random() * (width - 200);
                  const y = height - 100 - (lineNumber * 20);
                  const textWidth = Math.max(term.length * 8, 60);
                  
                  page.drawRectangle({
                    x: Math.max(0, Math.min(x, width - textWidth)),
                    y: Math.max(20, Math.min(y, height - 30)),
                    width: textWidth,
                    height: 15,
                    color: rgb(redactionColor.r, redactionColor.g, redactionColor.b),
                  });
                  
                  pageRedactions++;
                });
              }
            }
          }

          // Pattern-based redaction
          if (redactionSettings.mode === 'pattern' && redactionSettings.patterns?.length > 0) {
            for (const pattern of redactionSettings.patterns) {
              try {
                const regex = new RegExp(pattern, 'gi');
                const matches = Array.from(pageText.matchAll(regex));
                
                if (matches.length > 0) {
                  // Add pattern description to found terms for reporting
                  const patternName = getPatternName(pattern);
                  if (patternName) {
                    termsFoundOnPage.push(patternName);
                  }
                  
                  matches.forEach((match) => {
                    // Estimate position based on match index in text
                    const matchIndex = match.index || 0;
                    const textProgress = matchIndex / Math.max(pageText.length, 1);
                    const linesPerPage = Math.ceil(height / 20);
                    const lineNumber = Math.floor(textProgress * linesPerPage);
                    
                    const x = 50 + Math.random() * (width - 200);
                    const y = height - 100 - (lineNumber * 20);
                    const matchWidth = Math.max(match[0].length * 8, 80);
                    
                    page.drawRectangle({
                      x: Math.max(0, Math.min(x, width - matchWidth)),
                      y: Math.max(20, Math.min(y, height - 30)),
                      width: matchWidth,
                      height: 15,
                      color: rgb(redactionColor.r, redactionColor.g, redactionColor.b),
                    });
                    
                    pageRedactions++;
                  });
                }
              } catch (regexError) {
                console.warn(`Invalid regex pattern: ${pattern}`, regexError);
              }
            }
          }

          // Store page redaction info
          if (pageRedactions > 0) {
            redactionsByPage.push({
              page: pageIndex + 1,
              count: pageRedactions,
              terms: termsFoundOnPage
            });
          }
          
          redactionsApplied += pageRedactions;
        }
        
        // Coordinate-based redaction
        if (redactionSettings.mode === 'coordinates' && redactionSettings.coordinates?.length > 0) {
          for (const coord of redactionSettings.coordinates) {
            if (coord.page >= 1 && coord.page <= pages.length) {
              const page = pages[coord.page - 1];
              const { height } = page.getSize();
              
              page.drawRectangle({
                x: coord.x,
                y: height - coord.y - coord.height, // PDF coordinates are bottom-up
                width: coord.width,
                height: coord.height,
                color: rgb(redactionColor.r, redactionColor.g, redactionColor.b),
              });
              
              redactionsApplied++;
              
              // Add to redactions by page tracking
              const existingPageRedaction = redactionsByPage.find(r => r.page === coord.page);
              if (existingPageRedaction) {
                existingPageRedaction.count++;
                existingPageRedaction.terms.push('Coordinate Redaction');
              } else {
                redactionsByPage.push({
                  page: coord.page,
                  count: 1,
                  terms: ['Coordinate Redaction']
                });
              }
            }
          }
        }

        // Remove metadata if requested
        if (redactionSettings.removeMetadata) {
          pdfDoc.setTitle('');
          pdfDoc.setAuthor('');
          pdfDoc.setSubject('');
          pdfDoc.setKeywords([]);
          pdfDoc.setProducer('PDF Redaction Tool');
          pdfDoc.setCreator('PDF Redaction Tool');
          pdfDoc.setCreationDate(new Date());
          pdfDoc.setModificationDate(new Date());
        }

        // Save the redacted PDF
        const redactedBytes = await pdfDoc.save({
          useObjectStreams: false,
          addDefaultPage: false
        });

        const processingTime = Math.round((Date.now() - startTime) / 1000);

        // Clean up input file
        await fs.unlink(inputPath);

        // Set headers for download
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="redacted-${req.file.originalname}"`);
        res.setHeader('Content-Length', redactedBytes.length);
        res.setHeader('X-Redactions-Applied', redactionsApplied.toString());
        res.setHeader('X-Processing-Time', processingTime.toString());
        res.setHeader('X-Redaction-Details', JSON.stringify(redactionsByPage));
        res.setHeader('X-Total-Pages', pages.length.toString());

        // Send the redacted PDF
        res.send(Buffer.from(redactedBytes));

      } catch (redactionError) {
        await fs.unlink(inputPath);
        throw new Error('Failed to redact PDF: ' + (redactionError instanceof Error ? redactionError.message : 'Unknown error'));
      }

    } catch (error) {
      console.error('PDF redaction error:', error);

      if (req.file?.path) {
        try {
          await fs.unlink(req.file.path);
        } catch (cleanupError) {
          console.error('Error cleaning up file:', cleanupError);
        }
      }

      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      res.status(500).json({ error: `PDF redaction failed: ${errorMessage}` });
    }
  });
};