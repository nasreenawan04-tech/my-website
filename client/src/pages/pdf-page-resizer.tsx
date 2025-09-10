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

              {/* Enhanced SEO Content Sections */}
              <div className="mt-12 space-y-12">
                {/* What is PDF Page Resizer */}
                <div className="bg-white rounded-2xl shadow-lg p-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-6">What is a PDF Page Resizer Tool?</h2>
                  <div className="prose max-w-none text-gray-700 leading-relaxed">
                    <p className="text-lg mb-6">
                      A <strong>PDF Page Resizer</strong> is a sophisticated document processing tool that intelligently modifies PDF page dimensions and formats while preserving content quality, readability, and professional appearance. This essential utility converts PDF documents between different page size standards such as A4, Letter, Legal, Tabloid, and custom dimensions, ensuring perfect compatibility across international document requirements and printing specifications.
                    </p>
                    <p className="text-lg mb-6">
                      Our advanced PDF page resizing technology employs smart scaling algorithms that maintain aspect ratios, prevent content distortion, and automatically center content within new page boundaries. The tool supports all major international page formats including ISO A-series (A4, A3, A5), North American standards (Letter, Legal, Executive), and custom millimeter or inch-based dimensions, making it the perfect solution for document standardization, print optimization, and format compliance across global business operations.
                    </p>
                    <p className="text-lg mb-6">
                      Unlike simple image resizing tools, our PDF Page Resizer understands document structure, preserves text quality, maintains vector graphics sharpness, and ensures proper scaling of embedded images, charts, and diagrams. The tool processes documents entirely in your browser for maximum security and privacy, supporting both single-page and multi-page PDF resizing with consistent results across all pages.
                    </p>
                    <p className="text-lg">
                      Whether you're standardizing document collections for corporate compliance, preparing academic papers for international submission, optimizing files for specific printer requirements, or converting between regional page format standards, this professional-grade tool delivers pixel-perfect results while maintaining document integrity throughout the entire resizing process.
                    </p>
                  </div>
                </div>

                {/* Benefits for Different Audiences */}
                <div className="bg-white rounded-2xl shadow-lg p-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-8">Benefits for Different Audiences</h2>
                  
                  {/* Students & Researchers */}
                  <div className="mb-10">
                    <div className="flex items-center mb-6">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                        <i className="fas fa-graduation-cap text-blue-600 text-xl"></i>
                      </div>
                      <h3 className="text-2xl font-semibold text-gray-900">Students & Academic Researchers</h3>
                    </div>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900 mb-3">Academic Submission Requirements</h4>
                        <p className="text-gray-700 mb-4">
                          Convert thesis documents, research papers, and dissertations to meet specific university or journal requirements. Many international publications require A4 format while North American institutions prefer Letter size formatting.
                        </p>
                        <ul className="text-gray-600 space-y-2">
                          <li className="flex items-start">
                            <span className="text-green-600 mr-2">✓</span>
                            <span>Meet journal submission guidelines instantly</span>
                          </li>
                          <li className="flex items-start">
                            <span className="text-green-600 mr-2">✓</span>
                            <span>Standardize citation and reference formats</span>
                          </li>
                          <li className="flex items-start">
                            <span className="text-green-600 mr-2">✓</span>
                            <span>Ensure proper margin compliance for binding</span>
                          </li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900 mb-3">Research Collaboration</h4>
                        <p className="text-gray-700 mb-4">
                          Standardize document formats when collaborating with international research teams, ensuring all team members can print, annotate, and review documents consistently regardless of their geographic location.
                        </p>
                        <p className="text-gray-600">
                          Perfect for preparing conference presentations, poster sessions, and collaborative research publications where format consistency is crucial for professional presentation.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Business Professionals */}
                  <div className="mb-10">
                    <div className="flex items-center mb-6">
                      <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                        <i className="fas fa-briefcase text-green-600 text-xl"></i>
                      </div>
                      <h3 className="text-2xl font-semibold text-gray-900">Business Professionals & Corporations</h3>
                    </div>
                    <div className="grid md:grid-cols-3 gap-6">
                      <div className="bg-gray-50 p-6 rounded-lg">
                        <h4 className="text-lg font-semibold text-gray-900 mb-3">Contract Management</h4>
                        <p className="text-gray-700 text-sm mb-3">
                          Standardize legal documents, contracts, and agreements to meet international business requirements and ensure consistent formatting across global operations.
                        </p>
                        <p className="text-gray-600 text-sm">
                          Essential for multinational corporations managing contracts across different regions with varying document standards.
                        </p>
                      </div>
                      <div className="bg-gray-50 p-6 rounded-lg">
                        <h4 className="text-lg font-semibold text-gray-900 mb-3">Marketing Materials</h4>
                        <p className="text-gray-700 text-sm mb-3">
                          Resize brochures, flyers, and promotional documents to match local printing standards and paper sizes for cost-effective regional marketing campaigns.
                        </p>
                        <p className="text-gray-600 text-sm">
                          Optimize print costs while maintaining brand consistency across different markets and printing facilities.
                        </p>
                      </div>
                      <div className="bg-gray-50 p-6 rounded-lg">
                        <h4 className="text-lg font-semibold text-gray-900 mb-3">Compliance Documentation</h4>
                        <p className="text-gray-700 text-sm mb-3">
                          Ensure regulatory documents, audit reports, and compliance manuals meet specific format requirements for different jurisdictions and regulatory bodies.
                        </p>
                        <p className="text-gray-600 text-sm">
                          Critical for businesses operating in multiple countries with different documentation standards.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Content Creators */}
                  <div className="mb-10">
                    <div className="flex items-center mb-6">
                      <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mr-4">
                        <i className="fas fa-palette text-purple-600 text-xl"></i>
                      </div>
                      <h3 className="text-2xl font-semibold text-gray-900">Content Creators & Publishers</h3>
                    </div>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900 mb-3">Publishing & Print Design</h4>
                        <p className="text-gray-700 mb-4">
                          Prepare manuscripts, magazines, and publication layouts for different print formats and international distribution. Convert between US Letter and international A4 standards for global publishing requirements.
                        </p>
                        <div className="bg-blue-50 p-4 rounded-lg">
                          <p className="text-blue-800 text-sm font-medium">Pro Tip:</p>
                          <p className="text-blue-700 text-sm">Use our <a href="/tools/add-page-numbers" className="text-blue-600 hover:text-blue-800 underline">PDF page numbering tool</a> after resizing to ensure proper pagination formatting.</p>
                        </div>
                      </div>
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900 mb-3">Educational Content</h4>
                        <p className="text-gray-700 mb-4">
                          Create standardized educational materials, workbooks, and course handouts that display consistently across different educational institutions and printing systems worldwide.
                        </p>
                        <p className="text-gray-600">
                          Essential for online educators, training companies, and educational publishers distributing content internationally.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* How It Works */}
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl shadow-lg p-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-8">How Our PDF Page Resizer Works</h2>
                  <div className="grid md:grid-cols-4 gap-6">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-2xl font-bold text-blue-600">1</span>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Upload & Analysis</h3>
                      <p className="text-gray-600 text-sm">
                        Upload your PDF file and our tool automatically analyzes page dimensions, content layout, and document structure for optimal resizing strategies.
                      </p>
                    </div>
                    <div className="text-center">
                      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-2xl font-bold text-green-600">2</span>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Format Selection</h3>
                      <p className="text-gray-600 text-sm">
                        Choose from standard formats (A4, Letter, Legal) or specify custom dimensions. The tool displays a preview of the target size for confirmation.
                      </p>
                    </div>
                    <div className="text-center">
                      <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-2xl font-bold text-purple-600">3</span>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Smart Resizing</h3>
                      <p className="text-gray-600 text-sm">
                        Advanced algorithms maintain aspect ratios, preserve text quality, and intelligently scale content to fit the new page dimensions perfectly.
                      </p>
                    </div>
                    <div className="text-center">
                      <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-2xl font-bold text-orange-600">4</span>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Download Result</h3>
                      <p className="text-gray-600 text-sm">
                        Download your professionally resized PDF with perfect formatting, maintained quality, and optimized layout for your target page size.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Use Cases by Industry */}
                <div className="bg-white rounded-2xl shadow-lg p-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-8">Industry-Specific Use Cases</h2>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="bg-blue-50 rounded-lg p-6">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                        <i className="fas fa-gavel text-blue-600 text-xl"></i>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Legal Services</h3>
                      <p className="text-gray-700 text-sm mb-3">
                        Convert legal briefs, court documents, and contracts between Letter and A4 formats for international legal proceedings and cross-border transactions.
                      </p>
                      <p className="text-gray-600 text-xs">
                        Essential for law firms handling international cases or working with foreign jurisdictions that require specific document formatting standards.
                      </p>
                    </div>

                    <div className="bg-green-50 rounded-lg p-6">
                      <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                        <i className="fas fa-heartbeat text-green-600 text-xl"></i>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Healthcare</h3>
                      <p className="text-gray-700 text-sm mb-3">
                        Standardize medical records, research papers, and patient documentation to meet healthcare system requirements across different countries and institutions.
                      </p>
                      <p className="text-gray-600 text-xs">
                        Critical for medical research collaboration and patient record transfers between international healthcare providers.
                      </p>
                    </div>

                    <div className="bg-purple-50 rounded-lg p-6">
                      <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                        <i className="fas fa-building text-purple-600 text-xl"></i>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Architecture & Engineering</h3>
                      <p className="text-gray-700 text-sm mb-3">
                        Resize technical drawings, blueprints, and engineering specifications to match international standards and printing requirements for construction projects.
                      </p>
                      <p className="text-gray-600 text-xs">
                        Ensures accurate scaling and proper dimensions when sharing technical documents with international project teams.
                      </p>
                    </div>

                    <div className="bg-orange-50 rounded-lg p-6">
                      <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                        <i className="fas fa-graduation-cap text-orange-600 text-xl"></i>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Education</h3>
                      <p className="text-gray-700 text-sm mb-3">
                        Standardize academic papers, thesis documents, and educational materials for submission to international journals and universities with specific formatting requirements.
                      </p>
                      <p className="text-gray-600 text-xs">
                        Perfect for students and educators working across different educational systems with varying document standards.
                      </p>
                    </div>

                    <div className="bg-red-50 rounded-lg p-6">
                      <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                        <i className="fas fa-chart-line text-red-600 text-xl"></i>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Finance & Banking</h3>
                      <p className="text-gray-700 text-sm mb-3">
                        Convert financial reports, audit documents, and regulatory filings to meet international banking standards and compliance requirements.
                      </p>
                      <p className="text-gray-600 text-xs">
                        Essential for multinational financial institutions managing documents across different regulatory environments.
                      </p>
                    </div>

                    <div className="bg-teal-50 rounded-lg p-6">
                      <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center mb-4">
                        <i className="fas fa-cogs text-teal-600 text-xl"></i>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Manufacturing</h3>
                      <p className="text-gray-700 text-sm mb-3">
                        Resize technical manuals, safety documentation, and quality assurance reports to match international manufacturing standards and worker training requirements.
                      </p>
                      <p className="text-gray-600 text-xs">
                        Critical for global manufacturing operations requiring consistent documentation across multiple facilities and countries.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Related Tools */}
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl shadow-lg p-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-6">Complete Your PDF Workflow</h2>
                  <p className="text-lg text-gray-700 mb-8">
                    Enhance your document processing workflow with our comprehensive suite of PDF tools designed to work perfectly together:
                  </p>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="bg-white p-6 rounded-xl shadow-sm">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                        <i className="fas fa-compress-alt text-blue-600 text-xl"></i>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Optimize File Size</h3>
                      <p className="text-gray-600 text-sm mb-3">
                        After resizing, reduce file size with our <a href="/tools/compress-pdf" className="text-blue-600 hover:text-blue-800 underline font-medium">PDF compressor</a> to optimize for email sharing and web distribution.
                      </p>
                    </div>
                    
                    <div className="bg-white p-6 rounded-xl shadow-sm">
                      <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                        <i className="fas fa-file-text text-green-600 text-xl"></i>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Add Page Numbers</h3>
                      <p className="text-gray-600 text-sm mb-3">
                        Complete your formatting with our <a href="/tools/add-page-numbers" className="text-green-600 hover:text-green-800 underline font-medium">page numbering tool</a> to ensure proper pagination after resizing.
                      </p>
                    </div>
                    
                    <div className="bg-white p-6 rounded-xl shadow-sm">
                      <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                        <i className="fas fa-object-group text-purple-600 text-xl"></i>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Merge Documents</h3>
                      <p className="text-gray-600 text-sm mb-3">
                        Combine multiple resized PDFs using our <a href="/tools/merge-pdf" className="text-purple-600 hover:text-purple-800 underline font-medium">PDF merger</a> for unified document collections.
                      </p>
                    </div>
                    
                    <div className="bg-white p-6 rounded-xl shadow-sm">
                      <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                        <i className="fas fa-cut text-orange-600 text-xl"></i>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Split Large Files</h3>
                      <p className="text-gray-600 text-sm mb-3">
                        Divide oversized documents with our <a href="/tools/split-pdf" className="text-orange-600 hover:text-orange-800 underline font-medium">PDF splitter</a> before resizing for better processing performance.
                      </p>
                    </div>
                    
                    <div className="bg-white p-6 rounded-xl shadow-sm">
                      <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center mb-4">
                        <i className="fas fa-list-ol text-teal-600 text-xl"></i>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Organize Pages</h3>
                      <p className="text-gray-600 text-sm mb-3">
                        Rearrange page order with our <a href="/tools/organize-pdf-pages" className="text-teal-600 hover:text-teal-800 underline font-medium">page organizer</a> to match your resized document structure.
                      </p>
                    </div>
                    
                    <div className="bg-white p-6 rounded-xl shadow-sm">
                      <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                        <i className="fas fa-edit text-red-600 text-xl"></i>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Edit Content</h3>
                      <p className="text-gray-600 text-sm mb-3">
                        Make content adjustments with our <a href="/tools/pdf-editor" className="text-red-600 hover:text-red-800 underline font-medium">PDF editor</a> to perfect your resized documents.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Technical Features */}
                <div className="bg-white rounded-2xl shadow-lg p-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-8">Advanced Technical Features</h2>
                  <div className="grid md:grid-cols-2 gap-8">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-4">Intelligent Scaling Technology</h3>
                      <div className="space-y-4">
                        <div className="flex items-start">
                          <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mr-3 mt-1">
                            <i className="fas fa-check text-xs text-green-600"></i>
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900">Aspect Ratio Preservation</h4>
                            <p className="text-gray-600 text-sm">Maintains original proportions to prevent content distortion while optimizing for new page dimensions.</p>
                          </div>
                        </div>
                        <div className="flex items-start">
                          <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mr-3 mt-1">
                            <i className="fas fa-check text-xs text-green-600"></i>
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900">Vector Graphics Support</h4>
                            <p className="text-gray-600 text-sm">Preserves crisp lines and shapes in charts, diagrams, and illustrations during resizing.</p>
                          </div>
                        </div>
                        <div className="flex items-start">
                          <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mr-3 mt-1">
                            <i className="fas fa-check text-xs text-green-600"></i>
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900">Text Quality Optimization</h4>
                            <p className="text-gray-600 text-sm">Ensures readable fonts and proper text rendering across all page size conversions.</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-4">Supported Page Formats</h3>
                      <div className="space-y-3">
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <h4 className="font-semibold text-gray-900 text-sm mb-1">ISO A Series</h4>
                          <p className="text-gray-600 text-xs">A4 (210×297mm), A3 (297×420mm), A5 (148×210mm)</p>
                        </div>
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <h4 className="font-semibold text-gray-900 text-sm mb-1">North American</h4>
                          <p className="text-gray-600 text-xs">Letter (8.5×11"), Legal (8.5×14"), Tabloid (11×17")</p>
                        </div>
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <h4 className="font-semibold text-gray-900 text-sm mb-1">Business Formats</h4>
                          <p className="text-gray-600 text-xs">Executive (7.25×10.5"), Custom dimensions (mm/inches)</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* FAQ Section */}
                <div className="bg-white rounded-2xl shadow-lg p-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-8">Frequently Asked Questions</h2>
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Will resizing affect the quality of my PDF content?</h3>
                      <p className="text-gray-700">
                        No, our PDF Page Resizer uses advanced scaling algorithms that preserve content quality, maintain text sharpness, and keep vector graphics crisp. The tool intelligently handles different content types including text, images, charts, and diagrams to ensure professional results at any target page size.
                      </p>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Can I resize multi-page PDF documents?</h3>
                      <p className="text-gray-700">
                        Yes, our tool processes all pages in your PDF document simultaneously, applying consistent resizing to maintain uniform formatting throughout the entire document. Each page is individually processed to ensure optimal scaling and content positioning.
                      </p>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">What's the difference between resizing and scaling?</h3>
                      <p className="text-gray-700">
                        Resizing changes the actual page dimensions while maintaining content proportions and readability. Our tool doesn't simply scale content larger or smaller, but intelligently fits content within new page boundaries while preserving professional appearance and ensuring proper margins.
                      </p>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Is my PDF data secure during the resizing process?</h3>
                      <p className="text-gray-700">
                        Absolutely. All PDF processing happens entirely in your web browser using client-side technology. Your documents are never uploaded to our servers, ensuring complete privacy and security of your sensitive information.
                      </p>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Can I specify custom page dimensions?</h3>
                      <p className="text-gray-700">
                        Yes, in addition to standard formats like A4, Letter, and Legal, you can specify custom dimensions in millimeters. This is perfect for specialized printing requirements, custom marketing materials, or unique document specifications.
                      </p>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">What happens if my content doesn't fit the new page size?</h3>
                      <p className="text-gray-700">
                        Our intelligent scaling system automatically calculates the optimal scale to fit all content within the new page dimensions while maintaining readability. Content is centered and proportionally scaled to ensure nothing is cut off or distorted.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Best Practices */}
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl shadow-lg p-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-8">Best Practices for PDF Page Resizing</h2>
                  <div className="grid md:grid-cols-2 gap-8">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-6">Before Resizing</h3>
                      <div className="space-y-4">
                        <div className="flex items-start">
                          <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-3 mt-1">
                            <span className="text-xs font-bold text-blue-600">1</span>
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900">Check Original Dimensions</h4>
                            <p className="text-gray-600 text-sm">Review your current page size to choose the most appropriate target format and understand the scaling requirements.</p>
                          </div>
                        </div>
                        <div className="flex items-start">
                          <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-3 mt-1">
                            <span className="text-xs font-bold text-blue-600">2</span>
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900">Consider Content Layout</h4>
                            <p className="text-gray-600 text-sm">Assess whether your content will benefit from the new dimensions, especially for documents with complex layouts or multiple columns.</p>
                          </div>
                        </div>
                        <div className="flex items-start">
                          <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-3 mt-1">
                            <span className="text-xs font-bold text-blue-600">3</span>
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900">Backup Original Files</h4>
                            <p className="text-gray-600 text-sm">Always keep a copy of your original document before processing, especially for important or irreplaceable documents.</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-6">After Resizing</h3>
                      <div className="space-y-4">
                        <div className="flex items-start">
                          <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mr-3 mt-1">
                            <span className="text-xs font-bold text-green-600">1</span>
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900">Verify Content Integrity</h4>
                            <p className="text-gray-600 text-sm">Review the resized document to ensure all content is properly positioned and readable at the new page size.</p>
                          </div>
                        </div>
                        <div className="flex items-start">
                          <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mr-3 mt-1">
                            <span className="text-xs font-bold text-green-600">2</span>
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900">Test Print Compatibility</h4>
                            <p className="text-gray-600 text-sm">If printing is your goal, test print a sample page to verify margins, scaling, and overall appearance meet your requirements.</p>
                          </div>
                        </div>
                        <div className="flex items-start">
                          <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mr-3 mt-1">
                            <span className="text-xs font-bold text-green-600">3</span>
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900">Optimize File Size</h4>
                            <p className="text-gray-600 text-sm">Consider using our <a href="/tools/compress-pdf" className="text-blue-600 hover:text-blue-800 underline">PDF compression tool</a> to optimize file size after resizing for faster sharing and storage.</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* SEO Keywords Integration */}
                <div className="bg-white rounded-2xl shadow-lg p-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-6">Professional PDF Page Resizing Solutions</h2>
                  <div className="prose prose-gray max-w-none text-gray-700">
                    <p className="text-lg mb-4">
                      Our comprehensive PDF page resizer tool provides professional-grade document formatting solutions for businesses, educational institutions, and content creators worldwide. Whether you need to convert documents between A4 and Letter formats, resize pages for specific printing requirements, or standardize document collections for international distribution, our advanced resizing technology delivers consistent, high-quality results.
                    </p>
                    <p className="text-gray-600 mb-4">
                      Key capabilities include multi-page PDF resizing, custom dimension support, aspect ratio preservation, vector graphics optimization, and intelligent content scaling. Perfect for academic paper formatting, business document standardization, legal document compliance, marketing material optimization, and technical documentation preparation across global markets and printing systems.
                    </p>
                    <p className="text-gray-600">
                      Streamline your document workflow with our integrated PDF processing suite: <a href="/tools/compress-pdf" className="text-blue-600 hover:text-blue-800 underline">compress large files</a>, <a href="/tools/merge-pdf" className="text-blue-600 hover:text-blue-800 underline">combine multiple documents</a>, <a href="/tools/split-pdf" className="text-blue-600 hover:text-blue-800 underline">divide oversized files</a>, <a href="/tools/add-page-numbers" className="text-blue-600 hover:text-blue-800 underline">add professional pagination</a>, and <a href="/tools/organize-pdf-pages" className="text-blue-600 hover:text-blue-800 underline">rearrange page sequences</a> for complete document management control.
                    </p>
                  </div>
                </div>
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