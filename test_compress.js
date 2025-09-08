import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import fs from 'fs';

async function createTestPDF() {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([600, 800]);
  const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
  
  page.drawText('Test PDF for Compression', {
    x: 50, y: 750, size: 24, font: helveticaFont, color: rgb(0, 0, 0),
  });
  
  const pdfBytes = await pdfDoc.save();
  fs.writeFileSync('test_compress.pdf', pdfBytes);
  console.log('Test PDF created');
}

createTestPDF().catch(console.error);
EOF && node test_compress.js && echo "Testing compression API..." && curl -X POST -F "pdf=@test_compress.pdf" -F "level=medium" http://localhost:5000/api/compress-pdf-advanced --output compressed_result.pdf && echo "API test successful!" && rm -f test_compress.js test_compress.pdf compressed_result.pdf
