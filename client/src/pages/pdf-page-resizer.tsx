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

              {/* Educational Content */}
              <div className="mt-12 space-y-8">
                {/* How it Works */}
                <div className="bg-white rounded-2xl shadow-lg p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">How PDF Page Resizing Works</h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Upload className="w-8 h-8 text-blue-600" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">1. Upload PDF</h3>
                      <p className="text-gray-600">
                        Select a PDF file with pages you want to resize to a different format.
                      </p>
                    </div>
                    
                    <div className="text-center">
                      <div className="w-16 h-16 bg-cyan-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Maximize2 className="w-8 h-8 text-cyan-600" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">2. Choose Format</h3>
                      <p className="text-gray-600">
                        Select from standard formats like A4, Letter, Legal, or specify custom dimensions.
                      </p>
                    </div>
                    
                    <div className="text-center">
                      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Download className="w-8 h-8 text-green-600" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">3. Download</h3>
                      <p className="text-gray-600">
                        Get your resized PDF with properly scaled content and centered layout.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Features */}
                <div className="bg-white rounded-2xl shadow-lg p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Features</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex items-start">
                      <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mr-3 mt-1">
                        <i className="fas fa-check text-xs text-green-600"></i>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">Standard Formats</h3>
                        <p className="text-gray-600 text-sm">Support for A4, A3, A5, Letter, Legal, and more standard sizes.</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mr-3 mt-1">
                        <i className="fas fa-check text-xs text-green-600"></i>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">Custom Dimensions</h3>
                        <p className="text-gray-600 text-sm">Specify exact width and height in millimeters for custom page sizes.</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mr-3 mt-1">
                        <i className="fas fa-check text-xs text-green-600"></i>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">Aspect Ratio Preservation</h3>
                        <p className="text-gray-600 text-sm">Content is scaled proportionally to fit new page size perfectly.</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mr-3 mt-1">
                        <i className="fas fa-check text-xs text-green-600"></i>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">Centered Layout</h3>
                        <p className="text-gray-600 text-sm">Content is automatically centered on the new page size.</p>
                      </div>
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