import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import fs from 'fs';

async function createTestPDF() {
  const pdfDoc = await PDFDocument.create();
  
  // Add first page
  const page1 = pdfDoc.addPage([600, 800]);
  const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
  
  page1.drawText('Test PDF - Page 1', {
    x: 50,
    y: 750,
    size: 30,
    font: helveticaFont,
    color: rgb(0, 0, 0),
  });
  
  page1.drawText('This is a test PDF file for testing the PDF to Images tool.', {
    x: 50,
    y: 700,
    size: 14,
    font: helveticaFont,
    color: rgb(0.2, 0.2, 0.2),
  });
  
  page1.drawRectangle({
    x: 50,
    y: 600,
    width: 500,
    height: 80,
    borderColor: rgb(0, 0, 1),
    borderWidth: 2,
  });
  
  page1.drawText('Blue Rectangle on Page 1', {
    x: 250,
    y: 630,
    size: 16,
    font: helveticaFont,
    color: rgb(0, 0, 1),
  });
  
  // Add second page
  const page2 = pdfDoc.addPage([600, 800]);
  
  page2.drawText('Test PDF - Page 2', {
    x: 50,
    y: 750,
    size: 30,
    font: helveticaFont,
    color: rgb(0, 0, 0),
  });
  
  page2.drawCircle({
    x: 300,
    y: 600,
    size: 80,
    color: rgb(1, 0, 0),
  });
  
  page2.drawText('Red Circle on Page 2', {
    x: 220,
    y: 590,
    size: 16,
    font: helveticaFont,
    color: rgb(1, 0, 0),
  });
  
  const pdfBytes = await pdfDoc.save();
  fs.writeFileSync('test.pdf', pdfBytes);
  console.log('Test PDF created successfully');
}

createTestPDF().catch(console.error);
