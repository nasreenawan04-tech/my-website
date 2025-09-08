import { useState, useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Upload, FileText, Download, Maximize2 } from 'lucide-react';

interface PageSize {
  name: string;
  width: number;
  height: number;
  unit: string;
}

const PAGE_SIZES: PageSize[] = [
  { name: 'A4 (210 × 297 mm)', width: 595, height: 842, unit: 'pt' },
  { name: 'A3 (297 × 420 mm)', width: 842, height: 1191, unit: 'pt' },
  { name: 'A5 (148 × 210 mm)', width: 420, height: 595, unit: 'pt' },
  { name: 'Letter (8.5 × 11 in)', width: 612, height: 792, unit: 'pt' },
  { name: 'Legal (8.5 × 14 in)', width: 612, height: 1008, unit: 'pt' },
  { name: 'Tabloid (11 × 17 in)', width: 792, height: 1224, unit: 'pt' },
  { name: 'Executive (7.25 × 10.5 in)', width: 522, height: 756, unit: 'pt' },
  { name: 'Custom Size', width: 0, height: 0, unit: 'pt' },
];

const PDFPageResizer = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedSize, setSelectedSize] = useState<string>('A4 (210 × 297 mm)');
  const [customWidth, setCustomWidth] = useState<string>('210');
  const [customHeight, setCustomHeight] = useState<string>('297');
  const [resizedPdfUrl, setResizedPdfUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [originalInfo, setOriginalInfo] = useState<{ pageCount: number; size: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleFileSelect = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    
    const file = files[0];
    if (file.type !== 'application/pdf') {
      setError('Please select a PDF file.');
      return;
    }

    setSelectedFile(file);
    setError(null);
    setResizedPdfUrl(null);
    
    // Get original PDF info
    try {
      const { PDFDocument } = await import('pdf-lib');
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      const pages = pdfDoc.getPages();
      const firstPage = pages[0];
      const { width, height } = firstPage.getSize();
      
      setOriginalInfo({
        pageCount: pages.length,
        size: `${Math.round(width)} × ${Math.round(height)} pt`
      });
    } catch (error) {
      console.error('Error reading PDF info:', error);
      setOriginalInfo({ pageCount: 0, size: 'Unknown' });
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const getTargetSize = (): { width: number; height: number } => {
    if (selectedSize === 'Custom Size') {
      // Convert mm to points (1 mm = 2.834645669 pt)
      const widthPt = parseFloat(customWidth) * 2.834645669;
      const heightPt = parseFloat(customHeight) * 2.834645669;
      return { width: widthPt || 595, height: heightPt || 842 };
    }
    
    const pageSize = PAGE_SIZES.find(size => size.name === selectedSize);
    return { width: pageSize?.width || 595, height: pageSize?.height || 842 };
  };

  const resizePages = async () => {
    if (!selectedFile) return;

    setIsProcessing(true);
    setError(null);

    try {
      const { PDFDocument } = await import('pdf-lib');
      
      const arrayBuffer = await selectedFile.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      const newPdfDoc = await PDFDocument.create();
      
      const targetSize = getTargetSize();
      const pages = pdfDoc.getPages();

      for (const page of pages) {
        const { width: originalWidth, height: originalHeight } = page.getSize();
        
        // Create new page with target size
        const newPage = newPdfDoc.addPage([targetSize.width, targetSize.height]);
        
        // Calculate scale to fit content while maintaining aspect ratio
        const scaleX = targetSize.width / originalWidth;
        const scaleY = targetSize.height / originalHeight;
        const scale = Math.min(scaleX, scaleY);
        
        // Calculate position to center the content
        const scaledWidth = originalWidth * scale;
        const scaledHeight = originalHeight * scale;
        const x = (targetSize.width - scaledWidth) / 2;
        const y = (targetSize.height - scaledHeight) / 2;
        
        // Embed the original page
        const [embeddedPage] = await newPdfDoc.embedPages([page]);
        
        // Draw the embedded page on the new page
        newPage.drawPage(embeddedPage, {
          x: x,
          y: y,
          width: scaledWidth,
          height: scaledHeight,
        });
      }

      const pdfBytes = await newPdfDoc.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      setResizedPdfUrl(url);
    } catch (error) {
      console.error('Error resizing PDF:', error);
      setError('Error resizing PDF pages. Please try again with a valid PDF file.');
    }

    setIsProcessing(false);
  };

  const downloadResizedPDF = () => {
    if (!resizedPdfUrl) return;

    const link = document.createElement('a');
    link.href = resizedPdfUrl;
    link.download = 'resized-document.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const resetTool = () => {
    setSelectedFile(null);
    setResizedPdfUrl(null);
    setOriginalInfo(null);
    setError(null);
    if (resizedPdfUrl) {
      URL.revokeObjectURL(resizedPdfUrl);
    }
  };

  const isCustomSize = selectedSize === 'Custom Size';

  return (
    <>
      <Helmet>
        <title>PDF Page Resizer - Resize PDF Pages to Standard Formats | ToolsHub</title>
        <meta name="description" content="Resize PDF pages to standard formats like A4, Letter, Legal, or custom dimensions. Maintain aspect ratio and fit content properly." />
        <meta name="keywords" content="PDF resize, PDF page size, A4 PDF, Letter PDF, PDF format converter, PDF page dimensions" />
        <meta property="og:title" content="PDF Page Resizer - Resize PDF Pages to Standard Formats | ToolsHub" />
        <meta property="og:description" content="Resize PDF pages to standard formats like A4, Letter, Legal, or custom dimensions." />
        <meta property="og:type" content="website" />
        <link rel="canonical" href="/tools/pdf-page-resizer" />
      </Helmet>

      <div className="min-h-screen flex flex-col" data-testid="page-pdf-page-resizer">
        <Header />
        
        <main className="flex-1 bg-neutral-50">
          {/* Hero Section */}
          <section className="bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-700 text-white py-16">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <div className="w-20 h-20 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <i className="fas fa-expand-arrows-alt text-3xl"></i>
              </div>
              <h1 className="text-4xl sm:text-5xl font-bold mb-6" data-testid="text-page-title">
                PDF Page Resizer
              </h1>
              <p className="text-xl text-blue-100 max-w-2xl mx-auto">
                Resize PDF pages to standard formats like A4, Letter, Legal, or custom dimensions while maintaining proper aspect ratio.
              </p>
            </div>
          </section>

          {/* Tool Section */}
          <section className="py-16">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
              <Card className="bg-white shadow-sm border-0">
                <CardContent className="p-8">
                  <div className="space-y-8">
                    {/* File Upload Section */}
                    <div>
                      <h2 className="text-2xl font-semibold text-gray-900 mb-6">Select PDF File</h2>
                      
                      <div
                        className={`border-2 border-dashed rounded-xl p-12 text-center transition-colors ${
                          dragOver 
                            ? 'border-blue-500 bg-blue-50' 
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                        onDrop={handleDrop}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                          Drag and drop PDF file here
                        </h3>
                        <p className="text-gray-600 mb-4">
                          or click to select a file from your computer
                        </p>
                        <Button
                          className="bg-blue-600 hover:bg-blue-700 text-white"
                          data-testid="button-select-file"
                        >
                          Select PDF File
                        </Button>
                        
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept=".pdf,application/pdf"
                          onChange={(e) => handleFileSelect(e.target.files)}
                          className="hidden"
                          data-testid="input-file"
                        />
                      </div>
                    </div>

                    {/* File Info */}
                    {selectedFile && originalInfo && (
                      <div className="bg-gray-50 rounded-lg p-4" data-testid="file-info">
                        <div className="flex items-center gap-4">
                          <FileText className="w-8 h-8 text-red-600" />
                          <div className="flex-1">
                            <div className="font-medium text-gray-900">{selectedFile.name}</div>
                            <div className="text-sm text-gray-600">
                              {formatFileSize(selectedFile.size)} • {originalInfo.pageCount} pages • {originalInfo.size}
                            </div>
                          </div>
                          <Button
                            onClick={resetTool}
                            variant="outline"
                            className="text-red-600 border-red-200 hover:bg-red-50"
                          >
                            Remove
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Size Selection */}
                    {selectedFile && (
                      <div className="space-y-6" data-testid="size-selection">
                        <h3 className="text-xl font-semibold text-gray-900">Select Target Page Size</h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Page Size Format
                            </label>
                            <Select value={selectedSize} onValueChange={setSelectedSize}>
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select page size" />
                              </SelectTrigger>
                              <SelectContent>
                                {PAGE_SIZES.map((size) => (
                                  <SelectItem key={size.name} value={size.name}>
                                    {size.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          {isCustomSize && (
                            <div className="space-y-4">
                              <label className="block text-sm font-medium text-gray-700">
                                Custom Dimensions (mm)
                              </label>
                              <div className="flex gap-4">
                                <div>
                                  <label className="block text-xs text-gray-500 mb-1">Width</label>
                                  <input
                                    type="number"
                                    value={customWidth}
                                    onChange={(e) => setCustomWidth(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="210"
                                    data-testid="input-custom-width"
                                  />
                                </div>
                                <div>
                                  <label className="block text-xs text-gray-500 mb-1">Height</label>
                                  <input
                                    type="number"
                                    value={customHeight}
                                    onChange={(e) => setCustomHeight(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="297"
                                    data-testid="input-custom-height"
                                  />
                                </div>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Size Preview */}
                        <div className="bg-blue-50 rounded-lg p-4">
                          <h4 className="font-medium text-gray-900 mb-2">Target Size Preview</h4>
                          <div className="text-sm text-gray-600">
                            {isCustomSize 
                              ? `${customWidth} × ${customHeight} mm (${Math.round(parseFloat(customWidth) * 2.834645669)} × ${Math.round(parseFloat(customHeight) * 2.834645669)} pt)`
                              : selectedSize
                            }
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Error Message */}
                    {error && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-4" data-testid="error-message">
                        <div className="flex items-center">
                          <i className="fas fa-exclamation-triangle text-red-600 mr-3"></i>
                          <p className="text-red-800">{error}</p>
                        </div>
                      </div>
                    )}

                    {/* Resize Button */}
                    {selectedFile && !error && (
                      <div className="text-center">
                        <Button
                          onClick={resizePages}
                          disabled={isProcessing || (isCustomSize && (!customWidth || !customHeight))}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg"
                          data-testid="button-resize"
                        >
                          {isProcessing ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                              Resizing Pages...
                            </>
                          ) : (
                            <>
                              <Maximize2 className="w-4 h-4 mr-2" />
                              Resize PDF Pages
                            </>
                          )}
                        </Button>
                      </div>
                    )}

                    {/* Results Section */}
                    {resizedPdfUrl && (
                      <div className="bg-green-50 rounded-xl p-6 text-center" data-testid="resize-results">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <i className="fas fa-check text-2xl text-green-600"></i>
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">
                          PDF Pages Successfully Resized!
                        </h3>
                        <p className="text-gray-600 mb-6">
                          Your PDF pages have been resized to {isCustomSize ? `${customWidth} × ${customHeight} mm` : selectedSize.split(' ')[0]}.
                        </p>
                        <Button
                          onClick={downloadResizedPDF}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3"
                          data-testid="button-download"
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Download Resized PDF
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* SEO Content Sections */}
              <div className="mt-12 space-y-12">
                {/* What is PDF Page Resizer */}
                <div className="bg-white rounded-2xl shadow-lg p-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-6">What is a PDF Page Resizer?</h2>
                  <div className="prose max-w-none text-gray-700 leading-relaxed">
                    <p className="text-lg mb-6">
                      A <strong>PDF Page Resizer</strong> is a powerful digital tool designed to modify the dimensions and format of PDF document pages while maintaining content quality and proper scaling. This specialized utility allows users to convert PDF pages from one size format to another, such as transforming Letter-sized documents to A4, resizing Legal documents to standard formats, or creating custom page dimensions to meet specific requirements.
                    </p>
                    <p className="text-lg mb-6">
                      Our advanced PDF Page Resizer employs intelligent scaling algorithms that preserve aspect ratios, ensure content readability, and automatically center content within new page boundaries. The tool supports all standard international page formats including ISO A-series (A4, A3, A5), North American sizes (Letter, Legal, Tabloid), and custom dimensions specified in millimeters or inches, making it perfect for document standardization, printing preparation, and format compliance requirements.
                    </p>
                    <p className="text-lg">
                      Whether you're standardizing document collections, preparing files for specific printer requirements, or converting between regional page format standards, this tool ensures professional results with pixel-perfect precision and maintains document integrity throughout the resizing process.
                    </p>
                  </div>
                </div>

                {/* Why Use PDF Page Resizer */}
                <div className="bg-white rounded-2xl shadow-lg p-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-8">Why Use a PDF Page Resizer Tool?</h2>
                  <div className="grid md:grid-cols-2 gap-8">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-4">Professional Document Standards</h3>
                      <p className="text-gray-700 mb-4">
                        Different industries and regions use various page size standards. Our PDF Page Resizer helps you convert documents to meet specific requirements, whether you need A4 for European standards, Letter for North American business, or custom sizes for specialized printing needs.
                      </p>
                      <p className="text-gray-700 mb-4">
                        The tool ensures your documents maintain professional appearance while conforming to required specifications, making it essential for international business, academic submissions, and compliance documentation.
                      </p>
                    </div>
                    
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-4">Print Optimization & Cost Efficiency</h3>
                      <p className="text-gray-700 mb-4">
                        Resizing PDF pages to match your printer's optimal paper size reduces waste, prevents content cutoff, and ensures proper margins. This is particularly important for bulk printing, professional presentations, and document archival where consistent formatting is crucial.
                      </p>
                      <p className="text-gray-700">
                        By optimizing page sizes before printing, you can significantly reduce paper costs, improve print quality, and ensure documents display correctly across different devices and printing systems.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Common Use Cases */}
                <div className="bg-white rounded-2xl shadow-lg p-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-8">Common Use Cases for PDF Page Resizing</h2>
                  <div className="grid md:grid-cols-3 gap-6">
                    <div className="bg-blue-50 rounded-lg p-6">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                        <i className="fas fa-building text-blue-600 text-xl"></i>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Business Documents</h3>
                      <p className="text-gray-700 text-sm">
                        Convert contracts, proposals, and reports between Letter and A4 formats for international business compatibility and professional presentation standards.
                      </p>
                    </div>

                    <div className="bg-green-50 rounded-lg p-6">
                      <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                        <i className="fas fa-graduation-cap text-green-600 text-xl"></i>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Academic Papers</h3>
                      <p className="text-gray-700 text-sm">
                        Resize research papers, theses, and academic submissions to meet university or journal requirements for specific page dimensions and formatting standards.
                      </p>
                    </div>

                    <div className="bg-purple-50 rounded-lg p-6">
                      <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                        <i className="fas fa-print text-purple-600 text-xl"></i>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Print Production</h3>
                      <p className="text-gray-700 text-sm">
                        Optimize documents for specific printer capabilities, create custom sizes for brochures, or prepare files for professional printing services.
                      </p>
                    </div>

                    <div className="bg-orange-50 rounded-lg p-6">
                      <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                        <i className="fas fa-globe text-orange-600 text-xl"></i>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">International Compliance</h3>
                      <p className="text-gray-700 text-sm">
                        Ensure documents meet regional standards when submitting to international organizations, government agencies, or global business partners.
                      </p>
                    </div>

                    <div className="bg-cyan-50 rounded-lg p-6">
                      <div className="w-12 h-12 bg-cyan-100 rounded-lg flex items-center justify-center mb-4">
                        <i className="fas fa-archive text-cyan-600 text-xl"></i>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Document Archival</h3>
                      <p className="text-gray-700 text-sm">
                        Standardize document collections to uniform page sizes for consistent archival storage and improved document management systems.
                      </p>
                    </div>

                    <div className="bg-red-50 rounded-lg p-6">
                      <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                        <i className="fas fa-mobile-alt text-red-600 text-xl"></i>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Digital Display</h3>
                      <p className="text-gray-700 text-sm">
                        Optimize PDFs for tablet reading, mobile viewing, or presentation displays by adjusting page dimensions for better screen compatibility.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Advanced Features */}
                <div className="bg-white rounded-2xl shadow-lg p-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-8">Advanced PDF Page Resizing Features</h2>
                  <div className="grid md:grid-cols-2 gap-8">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-6">Smart Content Scaling</h3>
                      <ul className="space-y-3">
                        <li className="flex items-start">
                          <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3"></div>
                          <span className="text-gray-700">Proportional scaling maintains content aspect ratios</span>
                        </li>
                        <li className="flex items-start">
                          <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3"></div>
                          <span className="text-gray-700">Automatic content centering on new page dimensions</span>
                        </li>
                        <li className="flex items-start">
                          <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3"></div>
                          <span className="text-gray-700">Text and image quality preservation during resizing</span>
                        </li>
                        <li className="flex items-start">
                          <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3"></div>
                          <span className="text-gray-700">Vector graphics maintain crisp edges at any size</span>
                        </li>
                      </ul>
                    </div>

                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-6">Format Support & Precision</h3>
                      <ul className="space-y-3">
                        <li className="flex items-start">
                          <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3"></div>
                          <span className="text-gray-700">Complete ISO A-series support (A0-A10)</span>
                        </li>
                        <li className="flex items-start">
                          <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3"></div>
                          <span className="text-gray-700">North American formats (Letter, Legal, Tabloid)</span>
                        </li>
                        <li className="flex items-start">
                          <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3"></div>
                          <span className="text-gray-700">Custom dimensions with millimeter precision</span>
                        </li>
                        <li className="flex items-start">
                          <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3"></div>
                          <span className="text-gray-700">Real-time preview of dimension changes</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Page Size Guide */}
                <div className="bg-white rounded-2xl shadow-lg p-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-8">Complete Page Size Reference Guide</h2>
                  <div className="space-y-8">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-4">ISO A-Series (International Standard)</h3>
                      <div className="grid md:grid-cols-3 gap-4">
                        <div className="bg-blue-50 p-4 rounded-lg">
                          <h4 className="font-semibold text-gray-900 mb-2">A4 (Most Common)</h4>
                          <p className="text-sm text-gray-600">210 × 297 mm (8.27 × 11.69 in)</p>
                          <p className="text-xs text-gray-500 mt-1">Standard office documents, letters, magazines</p>
                        </div>
                        <div className="bg-blue-50 p-4 rounded-lg">
                          <h4 className="font-semibold text-gray-900 mb-2">A3 (Large Format)</h4>
                          <p className="text-sm text-gray-600">297 × 420 mm (11.69 × 16.54 in)</p>
                          <p className="text-xs text-gray-500 mt-1">Posters, drawings, large tables</p>
                        </div>
                        <div className="bg-blue-50 p-4 rounded-lg">
                          <h4 className="font-semibold text-gray-900 mb-2">A5 (Compact)</h4>
                          <p className="text-sm text-gray-600">148 × 210 mm (5.83 × 8.27 in)</p>
                          <p className="text-xs text-gray-500 mt-1">Books, greeting cards, flyers</p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-4">North American Standards</h3>
                      <div className="grid md:grid-cols-3 gap-4">
                        <div className="bg-green-50 p-4 rounded-lg">
                          <h4 className="font-semibold text-gray-900 mb-2">Letter</h4>
                          <p className="text-sm text-gray-600">216 × 279 mm (8.5 × 11 in)</p>
                          <p className="text-xs text-gray-500 mt-1">US/Canada business standard</p>
                        </div>
                        <div className="bg-green-50 p-4 rounded-lg">
                          <h4 className="font-semibold text-gray-900 mb-2">Legal</h4>
                          <p className="text-sm text-gray-600">216 × 356 mm (8.5 × 14 in)</p>
                          <p className="text-xs text-gray-500 mt-1">Legal documents, contracts</p>
                        </div>
                        <div className="bg-green-50 p-4 rounded-lg">
                          <h4 className="font-semibold text-gray-900 mb-2">Tabloid</h4>
                          <p className="text-sm text-gray-600">279 × 432 mm (11 × 17 in)</p>
                          <p className="text-xs text-gray-500 mt-1">Newspapers, large presentations</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Technical Implementation */}
                <div className="bg-white rounded-2xl shadow-lg p-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-6">How PDF Page Resizing Works</h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Upload className="w-8 h-8 text-blue-600" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">1. Upload & Analysis</h3>
                      <p className="text-gray-600">
                        Upload your PDF and our system analyzes current page dimensions, content positioning, and scaling requirements.
                      </p>
                    </div>
                    
                    <div className="text-center">
                      <div className="w-16 h-16 bg-cyan-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Maximize2 className="w-8 h-8 text-cyan-600" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">2. Smart Resizing</h3>
                      <p className="text-gray-600">
                        Choose target format and our algorithms calculate optimal scaling ratios while preserving aspect ratios and content quality.
                      </p>
                    </div>
                    
                    <div className="text-center">
                      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Download className="w-8 h-8 text-green-600" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">3. Perfect Output</h3>
                      <p className="text-gray-600">
                        Download your resized PDF with properly scaled content, maintained quality, and perfect centering.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Key Features Summary */}
                <div className="bg-white rounded-2xl shadow-lg p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Key Features & Benefits</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex items-start">
                      <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mr-3 mt-1">
                        <i className="fas fa-check text-xs text-green-600"></i>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">Multiple Standard Formats</h3>
                        <p className="text-gray-600 text-sm">Support for A4, A3, A5, Letter, Legal, Tabloid, Executive, and custom dimensions.</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mr-3 mt-1">
                        <i className="fas fa-check text-xs text-green-600"></i>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">Custom Size Precision</h3>
                        <p className="text-gray-600 text-sm">Specify exact dimensions in millimeters for specialized printing or display requirements.</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mr-3 mt-1">
                        <i className="fas fa-check text-xs text-green-600"></i>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">Quality Preservation</h3>
                        <p className="text-gray-600 text-sm">Advanced algorithms maintain text clarity, image quality, and vector graphics precision.</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mr-3 mt-1">
                        <i className="fas fa-check text-xs text-green-600"></i>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">Intelligent Centering</h3>
                        <p className="text-gray-600 text-sm">Content is automatically positioned optimally within new page boundaries.</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mr-3 mt-1">
                        <i className="fas fa-check text-xs text-green-600"></i>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">Batch Processing Ready</h3>
                        <p className="text-gray-600 text-sm">Process multiple pages simultaneously while maintaining consistent results.</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mr-3 mt-1">
                        <i className="fas fa-check text-xs text-green-600"></i>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">Cross-Platform Compatibility</h3>
                        <p className="text-gray-600 text-sm">Resized PDFs work perfectly across all devices, operating systems, and PDF viewers.</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Best Practices */}
                <div className="bg-white rounded-2xl shadow-lg p-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-8">Best Practices for PDF Page Resizing</h2>
                  <div className="space-y-6">
                    <div className="bg-amber-50 border-l-4 border-amber-400 p-6 rounded-r-lg">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        <i className="fas fa-lightbulb text-amber-500 mr-2"></i>
                        Choose the Right Target Format
                      </h3>
                      <p className="text-gray-700">
                        Consider your document's intended use when selecting page size. Use A4 for international business, Letter for North American contexts, and custom sizes for specialized printing requirements.
                      </p>
                    </div>

                    <div className="bg-blue-50 border-l-4 border-blue-400 p-6 rounded-r-lg">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        <i className="fas fa-search text-blue-500 mr-2"></i>
                        Preview Before Processing
                      </h3>
                      <p className="text-gray-700">
                        Always review the target size specifications and consider how your content will fit. Documents with complex layouts may require custom dimensions for optimal results.
                      </p>
                    </div>

                    <div className="bg-green-50 border-l-4 border-green-400 p-6 rounded-r-lg">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        <i className="fas fa-print text-green-500 mr-2"></i>
                        Test Print Settings
                      </h3>
                      <p className="text-gray-700">
                        After resizing, test print a sample page to ensure margins, scaling, and content positioning meet your requirements before processing large batches.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Frequently Asked Questions */}
                <div className="bg-white rounded-2xl shadow-lg p-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-8">Frequently Asked Questions</h2>
                  <div className="space-y-6">
                    <div className="border-b border-gray-200 pb-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Will resizing affect the quality of my PDF content?</h3>
                      <p className="text-gray-700">
                        No, our advanced resizing algorithm maintains content quality by using proportional scaling and vector-aware processing. Text remains sharp, images preserve their resolution, and graphics maintain crisp edges at the new size.
                      </p>
                    </div>

                    <div className="border-b border-gray-200 pb-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Can I resize PDFs with complex layouts and multiple columns?</h3>
                      <p className="text-gray-700">
                        Yes, our tool handles complex layouts intelligently. Content is scaled proportionally and centered automatically, preserving the relative positioning of text blocks, images, and other elements while fitting them within the new page dimensions.
                      </p>
                    </div>

                    <div className="border-b border-gray-200 pb-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">What's the difference between resizing and cropping PDF pages?</h3>
                      <p className="text-gray-700">
                        Resizing changes the page dimensions while scaling content to fit the new size, preserving all content. Cropping removes parts of the page to change dimensions. Our Page Resizer ensures all your content remains visible and properly scaled.
                      </p>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Are custom dimensions precise for professional printing?</h3>
                      <p className="text-gray-700">
                        Absolutely. Our custom dimension feature accepts measurements in millimeters with high precision, making it perfect for professional printing, specialized publications, and exact specification requirements.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </main>
        
        <Footer />
      </div>
    </>
  );
};

export default PDFPageResizer;