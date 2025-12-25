// Dynamic PDF export utility to lazy-load heavy PDF libraries only when needed
// This saves ~587KB (jsPDF 387KB + html2canvas 200KB) from the main bundle

interface PDFExportOptions {
  filename: string;
  elementId: string;
  toolName: string;
}

/**
 * Dynamically imports and uses jsPDF to generate a PDF from an HTML element.
 * Only loads jsPDF and html2canvas when this function is called, not at page load.
 * This can save 587KB from your main bundle!
 */
export async function exportToPDF({
  filename,
  elementId,
  toolName
}: PDFExportOptions): Promise<void> {
  try {
    // Dynamically import only when needed
    const { jsPDF } = await import('jspdf');
    const html2canvas = await import('html2canvas').then(m => m.default);

    const element = document.getElementById(elementId);
    if (!element) {
      throw new Error(`Element with ID "${elementId}" not found`);
    }

    // Show loading state
    const originalText = document.body.style.cursor;
    document.body.style.cursor = 'wait';

    // Convert HTML to canvas
    const canvas = await html2canvas(element, {
      backgroundColor: '#ffffff',
      scale: 2,
      useCORS: true,
      logging: false,
      allowTaint: true
    });

    // Create PDF
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'pt',
      format: 'a4'
    });

    const imgData = canvas.toDataURL('image/png');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    
    const imgWidth = pageWidth - 40;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    
    let heightLeft = imgHeight;
    let position = 20;

    pdf.addImage(imgData, 'PNG', 20, position, imgWidth, imgHeight);
    heightLeft -= pageHeight - 60;

    while (heightLeft > 0) {
      position = heightLeft - imgHeight + 20;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 20, position, imgWidth, imgHeight);
      heightLeft -= pageHeight - 60;
    }

    pdf.save(filename);

    // Restore cursor
    document.body.style.cursor = originalText;

    // Track usage
    import('@/lib/analytics').then(({ trackToolUsed }) => {
      trackToolUsed(`${toolName} - PDF Export`, 'Export', {
        export_type: 'pdf',
        filename
      });
    }).catch(() => {
      // Ignore analytics errors
    });
  } catch (error) {
    console.error('Failed to export PDF:', error);
    document.body.style.cursor = 'auto';
    throw error;
  }
}

/**
 * Helper to check if PDF export is available in the current browser
 */
export function canExportPDF(): boolean {
  return (
    typeof document !== 'undefined' &&
    typeof Blob !== 'undefined' &&
    typeof URL !== 'undefined'
  );
}
