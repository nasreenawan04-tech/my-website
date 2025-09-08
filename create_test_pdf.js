import fs from 'fs';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

async function createTestPDF() {
  try {
    console.log('Creating test PDF with form fields...');
    
    // Create a new PDF document
    const pdfDoc = await PDFDocument.create();
    
    // Add a page
    const page = pdfDoc.addPage([600, 800]);
    
    // Get form
    const form = pdfDoc.getForm();
    
    // Embed a font
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    
    // Add title
    page.drawText('Sample Form with Fields', {
      x: 200,
      y: 750,
      size: 20,
      font,
      color: rgb(0, 0, 0),
    });
    
    // Add text field
    const textField = form.createTextField('first_name');
    textField.setText('John');
    textField.addToPage(page, {
      x: 100,
      y: 650,
      width: 200,
      height: 30,
    });
    
    // Add label for text field
    page.drawText('First Name:', {
      x: 100,
      y: 685,
      size: 12,
      font,
    });
    
    // Add another text field
    const lastNameField = form.createTextField('last_name');
    lastNameField.setText('Doe');
    lastNameField.addToPage(page, {
      x: 100,
      y: 590,
      width: 200,
      height: 30,
    });
    
    // Add label for last name field
    page.drawText('Last Name:', {
      x: 100,
      y: 625,
      size: 12,
      font,
    });
    
    // Add checkbox
    const checkbox = form.createCheckBox('newsletter');
    checkbox.check();
    checkbox.addToPage(page, {
      x: 100,
      y: 540,
      width: 20,
      height: 20,
    });
    
    // Add label for checkbox
    page.drawText('Subscribe to newsletter', {
      x: 130,
      y: 545,
      size: 12,
      font,
    });
    
    // Add dropdown
    const dropdown = form.createDropdown('country');
    dropdown.addOptions(['USA', 'Canada', 'UK', 'Germany', 'France']);
    dropdown.select('USA');
    dropdown.addToPage(page, {
      x: 100,
      y: 480,
      width: 150,
      height: 25,
    });
    
    // Add label for dropdown
    page.drawText('Country:', {
      x: 100,
      y: 510,
      size: 12,
      font,
    });
    
    // Add multiline text field
    const commentField = form.createTextField('comments');
    commentField.enableMultiline();
    commentField.setText('This is a sample comment in a multiline text field.');
    commentField.addToPage(page, {
      x: 100,
      y: 380,
      width: 300,
      height: 80,
    });
    
    // Add label for comment field
    page.drawText('Comments:', {
      x: 100,
      y: 470,
      size: 12,
      font,
    });
    
    // Save the PDF to a file
    const pdfBytes = await pdfDoc.save();
    fs.writeFileSync('test_form.pdf', pdfBytes);
    
    console.log('Test PDF created successfully: test_form.pdf');
    console.log('PDF contains:');
    console.log('- Text field: first_name');
    console.log('- Text field: last_name');
    console.log('- Checkbox: newsletter');
    console.log('- Dropdown: country');
    console.log('- Multiline text: comments');
    
  } catch (error) {
    console.error('Error creating test PDF:', error);
  }
}

createTestPDF();