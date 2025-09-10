import { useState, useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Upload, FileText, Download, Crop, Maximize } from 'lucide-react';

const PDFMarginAdjuster = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [marginTop, setMarginTop] = useState<number[]>([10]);
  const [marginBottom, setMarginBottom] = useState<number[]>([10]);
  const [marginLeft, setMarginLeft] = useState<number[]>([10]);
  const [marginRight, setMarginRight] = useState<number[]>([10]);
  const [operation, setOperation] = useState<'add' | 'remove'>('add');
  const [adjustedPdfUrl, setAdjustedPdfUrl] = useState<string | null>(null);
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

    // Validate file size (50MB limit)
    if (file.size > 50 * 1024 * 1024) {
      setError('File size too large. Please select a PDF file smaller than 50MB.');
      return;
    }

    setSelectedFile(file);
    setError(null);
    setAdjustedPdfUrl(null);
    
    // Get original PDF info
    try {
      const { PDFDocument } = await import('pdf-lib');
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
      const pages = pdfDoc.getPages();
      const firstPage = pages[0];
      const { width, height } = firstPage.getSize();
      
      setOriginalInfo({
        pageCount: pages.length,
        size: `${Math.round(width)} × ${Math.round(height)} pt`
      });
    } catch (error) {
      console.error('Error reading PDF info:', error);
      setError('Unable to read PDF file. Please ensure it is a valid PDF document.');
      setSelectedFile(null);
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

  const resetMargins = () => {
    setMarginTop([10]);
    setMarginBottom([10]);
    setMarginLeft([10]);
    setMarginRight([10]);
  };

  const adjustMargins = async () => {
    if (!selectedFile) return;

    setIsProcessing(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('pdf', selectedFile);
      formData.append('marginTop', marginTop[0].toString());
      formData.append('marginBottom', marginBottom[0].toString());
      formData.append('marginLeft', marginLeft[0].toString());
      formData.append('marginRight', marginRight[0].toString());
      formData.append('operation', operation);

      const response = await fetch('/api/pdf-margin-adjuster', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      setAdjustedPdfUrl(url);
    } catch (error) {
      console.error('Error adjusting PDF margins:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setError(`Error adjusting PDF margins: ${errorMessage}. Please try again with a valid PDF file.`);
    }

    setIsProcessing(false);
  };

  const downloadAdjustedPDF = () => {
    if (!adjustedPdfUrl || !selectedFile) return;

    const link = document.createElement('a');
    link.href = adjustedPdfUrl;
    const baseName = selectedFile.name.replace('.pdf', '');
    link.download = `${operation === 'add' ? 'margins-added' : 'margins-removed'}-${baseName}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const resetTool = () => {
    setSelectedFile(null);
    setAdjustedPdfUrl(null);
    setOriginalInfo(null);
    setError(null);
    if (adjustedPdfUrl) {
      URL.revokeObjectURL(adjustedPdfUrl);
    }
  };

  return (
    <>
      <Helmet>
        <title>PDF Margin Adjuster - Add or Remove Margins from PDF | ToolsHub</title>
        <meta name="description" content="Add margins to PDF pages or crop borders by removing margins. Adjust top, bottom, left, and right margins with precise control." />
        <meta name="keywords" content="PDF margins, PDF crop, PDF borders, add margins PDF, remove margins PDF, PDF page adjustment" />
        <meta property="og:title" content="PDF Margin Adjuster - Add or Remove Margins from PDF | ToolsHub" />
        <meta property="og:description" content="Add margins to PDF pages or crop borders by removing margins with precise control." />
        <meta property="og:type" content="website" />
        <link rel="canonical" href="/tools/pdf-margin-adjuster" />
      </Helmet>

      <div className="min-h-screen flex flex-col" data-testid="page-pdf-margin-adjuster">
        <Header />
        
        <main className="flex-1 bg-neutral-50">
          {/* Hero Section */}
          <section className="bg-gradient-to-r from-green-600 via-green-500 to-teal-700 text-white py-16">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <div className="w-20 h-20 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <i className="fas fa-crop text-3xl"></i>
              </div>
              <h1 className="text-4xl sm:text-5xl font-bold mb-6" data-testid="text-page-title">
                PDF Margin Adjuster
              </h1>
              <p className="text-xl text-green-100 max-w-2xl mx-auto">
                Add margins to PDF pages for better formatting or crop borders by removing unwanted margins with precision control.
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
                            ? 'border-green-500 bg-green-50' 
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
                          className="bg-green-600 hover:bg-green-700 text-white"
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

                    {/* Margin Settings */}
                    {selectedFile && (
                      <div className="space-y-6" data-testid="margin-settings">
                        <h3 className="text-xl font-semibold text-gray-900">Margin Settings</h3>
                        
                        {/* Operation Selection */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <button
                            onClick={() => setOperation('add')}
                            className={`p-4 rounded-lg border-2 transition-all ${
                              operation === 'add'
                                ? 'border-green-500 bg-green-50 text-green-700'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                            data-testid="button-add-margins"
                          >
                            <Maximize className="w-6 h-6 mx-auto mb-2" />
                            <div className="font-medium">Add Margins</div>
                            <div className="text-sm text-gray-600">Increase page size with white margins</div>
                          </button>
                          
                          <button
                            onClick={() => setOperation('remove')}
                            className={`p-4 rounded-lg border-2 transition-all ${
                              operation === 'remove'
                                ? 'border-green-500 bg-green-50 text-green-700'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                            data-testid="button-remove-margins"
                          >
                            <Crop className="w-6 h-6 mx-auto mb-2" />
                            <div className="font-medium">Remove Margins (Crop)</div>
                            <div className="text-sm text-gray-600">Crop borders and reduce page size</div>
                          </button>
                        </div>

                        {/* Margin Controls */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          {/* Top Margin */}
                          <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">
                              Top Margin: {marginTop[0]}mm
                            </label>
                            <Slider
                              value={marginTop}
                              onValueChange={setMarginTop}
                              max={50}
                              min={0}
                              step={1}
                              className="w-full"
                              data-testid="slider-margin-top"
                            />
                          </div>

                          {/* Bottom Margin */}
                          <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">
                              Bottom Margin: {marginBottom[0]}mm
                            </label>
                            <Slider
                              value={marginBottom}
                              onValueChange={setMarginBottom}
                              max={50}
                              min={0}
                              step={1}
                              className="w-full"
                              data-testid="slider-margin-bottom"
                            />
                          </div>

                          {/* Left Margin */}
                          <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">
                              Left Margin: {marginLeft[0]}mm
                            </label>
                            <Slider
                              value={marginLeft}
                              onValueChange={setMarginLeft}
                              max={50}
                              min={0}
                              step={1}
                              className="w-full"
                              data-testid="slider-margin-left"
                            />
                          </div>

                          {/* Right Margin */}
                          <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">
                              Right Margin: {marginRight[0]}mm
                            </label>
                            <Slider
                              value={marginRight}
                              onValueChange={setMarginRight}
                              max={50}
                              min={0}
                              step={1}
                              className="w-full"
                              data-testid="slider-margin-right"
                            />
                          </div>
                        </div>

                        {/* Reset Button */}
                        <div className="flex justify-center">
                          <Button
                            onClick={resetMargins}
                            variant="outline"
                            className="text-gray-600 border-gray-300 hover:bg-gray-50"
                          >
                            Reset to Default (10mm)
                          </Button>
                        </div>

                        {/* Preview */}
                        <div className="bg-blue-50 rounded-lg p-4">
                          <h4 className="font-medium text-gray-900 mb-2">Margin Preview</h4>
                          <div className="text-sm text-gray-600">
                            <strong>{operation === 'add' ? 'Adding' : 'Removing'}</strong> margins: 
                            Top: {marginTop[0]}mm, Bottom: {marginBottom[0]}mm, 
                            Left: {marginLeft[0]}mm, Right: {marginRight[0]}mm
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

                    {/* Adjust Button */}
                    {selectedFile && !error && (
                      <div className="text-center">
                        <Button
                          onClick={adjustMargins}
                          disabled={isProcessing}
                          className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 text-lg"
                          data-testid="button-adjust"
                        >
                          {isProcessing ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                              Adjusting Margins...
                            </>
                          ) : (
                            <>
                              <Crop className="w-4 h-4 mr-2" />
                              {operation === 'add' ? 'Add Margins' : 'Remove Margins'}
                            </>
                          )}
                        </Button>
                      </div>
                    )}

                    {/* Results Section */}
                    {adjustedPdfUrl && (
                      <div className="bg-green-50 rounded-xl p-6 text-center" data-testid="adjust-results">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <i className="fas fa-check text-2xl text-green-600"></i>
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">
                          PDF Margins Successfully Adjusted!
                        </h3>
                        <p className="text-gray-600 mb-6">
                          Your PDF margins have been {operation === 'add' ? 'added' : 'removed'} according to your specifications.
                        </p>
                        <Button
                          onClick={downloadAdjustedPDF}
                          className="bg-green-600 hover:bg-green-700 text-white px-6 py-3"
                          data-testid="button-download"
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Download Adjusted PDF
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Enhanced SEO Content Sections */}
              <div className="mt-12 space-y-12">
                {/* What is PDF Margin Adjuster */}
                <div className="bg-white rounded-2xl shadow-lg p-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-6">What is a PDF Margin Adjuster Tool?</h2>
                  <div className="prose max-w-none text-gray-700 leading-relaxed">
                    <p className="text-lg mb-6">
                      A <strong>PDF Margin Adjuster</strong> is a specialized document processing tool designed to modify the whitespace and borders around PDF content with precision control. This essential utility allows users to either add margins (creating additional whitespace for binding, annotations, or improved readability) or remove margins (cropping excessive borders to maximize content space and optimize page usage), ensuring documents meet specific formatting requirements for printing, binding, or digital presentation.
                    </p>
                    <p className="text-lg mb-6">
                      Our advanced PDF margin adjustment technology operates on a millimeter-precise level, offering individual control over top, bottom, left, and right margins for each page in your document. Unlike simple PDF cropping tools, our margin adjuster intelligently handles document structure, maintains content quality, preserves text formatting, and ensures consistent results across multi-page documents while providing real-time preview capabilities for optimal user control.
                    </p>
                    <p className="text-lg mb-6">
                      The tool supports two primary operations: <strong>Add Margins</strong> (expanding page dimensions with configurable whitespace) and <strong>Remove Margins</strong> (intelligent cropping that eliminates unwanted borders while preserving essential content). This dual functionality makes it perfect for academic paper formatting, business document standardization, print preparation, binding optimization, and digital presentation enhancement.
                    </p>
                    <p className="text-lg">
                      Whether you're preparing academic submissions with specific margin requirements, optimizing business documents for professional presentation, preparing files for binding with proper spacing, or cropping scanned documents to remove scanner borders, our PDF Margin Adjuster delivers professional-grade results with browser-based security and privacy protection.
                    </p>
                  </div>
                </div>

                {/* Benefits for Different Audiences */}
                <div className="bg-white rounded-2xl shadow-lg p-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-8">Benefits for Different Audiences</h2>
                  
                  {/* Students & Academic Researchers */}
                  <div className="mb-10">
                    <div className="flex items-center mb-6">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                        <i className="fas fa-graduation-cap text-blue-600 text-xl"></i>
                      </div>
                      <h3 className="text-2xl font-semibold text-gray-900">Students & Academic Researchers</h3>
                    </div>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900 mb-3">Academic Formatting Requirements</h4>
                        <p className="text-gray-700 mb-4">
                          Meet strict university and journal submission guidelines that require specific margin dimensions (typically 1-1.5 inches for academic papers). Our tool ensures your thesis, dissertations, and research papers comply with institutional formatting standards, preventing submission delays due to incorrect margins.
                        </p>
                        <ul className="text-gray-600 space-y-2">
                          <li className="flex items-start">
                            <span className="text-green-600 mr-2">✓</span>
                            <span>Comply with MLA, APA, and Chicago style margin requirements</span>
                          </li>
                          <li className="flex items-start">
                            <span className="text-green-600 mr-2">✓</span>
                            <span>Prepare documents for binding with proper gutter margins</span>
                          </li>
                          <li className="flex items-start">
                            <span className="text-green-600 mr-2">✓</span>
                            <span>Add space for professor comments and annotations</span>
                          </li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900 mb-3">Research Document Optimization</h4>
                        <p className="text-gray-700 mb-4">
                          Optimize scanned research papers, historical documents, and academic resources by removing scanner borders and excessive whitespace. Perfect for creating clean digital archives and improving readability of research materials.
                        </p>
                        <div className="bg-blue-50 p-4 rounded-lg">
                          <p className="text-blue-800 text-sm font-medium">Study Tip:</p>
                          <p className="text-blue-700 text-sm">Use our <a href="/tools/pdf-bookmark-extractor" className="text-blue-600 hover:text-blue-800 underline">bookmark extractor</a> to create navigation aids for your formatted research documents.</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Business Professionals */}
                  <div className="mb-10">
                    <div className="flex items-center mb-6">
                      <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                        <i className="fas fa-briefcase text-green-600 text-xl"></i>
                      </div>
                      <h3 className="text-2xl font-semibold text-gray-900">Business Professionals & Corporate Teams</h3>
                    </div>
                    <div className="grid md:grid-cols-3 gap-6">
                      <div className="bg-gray-50 p-6 rounded-lg">
                        <h4 className="text-lg font-semibold text-gray-900 mb-3">Professional Presentations</h4>
                        <p className="text-gray-700 text-sm mb-3">
                          Create polished business documents with consistent margins for client presentations, proposals, and reports. Add professional whitespace for binding or remove excessive borders from scanned contracts and agreements.
                        </p>
                        <p className="text-gray-600 text-sm">
                          Essential for maintaining brand consistency and professional appearance across all business communications.
                        </p>
                      </div>
                      <div className="bg-gray-50 p-6 rounded-lg">
                        <h4 className="text-lg font-semibold text-gray-900 mb-3">Document Standardization</h4>
                        <p className="text-gray-700 text-sm mb-3">
                          Standardize margin formatting across corporate document collections, ensuring consistent appearance for training materials, policy documents, and operational procedures across different departments and locations.
                        </p>
                        <p className="text-gray-600 text-sm">
                          Streamline document management and improve visual consistency for corporate documentation systems.
                        </p>
                      </div>
                      <div className="bg-gray-50 p-6 rounded-lg">
                        <h4 className="text-lg font-semibold text-gray-900 mb-3">Print Optimization</h4>
                        <p className="text-gray-700 text-sm mb-3">
                          Optimize documents for cost-effective printing by removing unnecessary whitespace or adding margins for binding requirements. Perfect for bulk printing of manuals, reports, and training materials.
                        </p>
                        <p className="text-gray-600 text-sm">
                          Reduce printing costs while ensuring professional presentation for bound documents and presentations.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Content Creators & Publishers */}
                  <div className="mb-10">
                    <div className="flex items-center mb-6">
                      <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mr-4">
                        <i className="fas fa-palette text-purple-600 text-xl"></i>
                      </div>
                      <h3 className="text-2xl font-semibold text-gray-900">Content Creators & Publishers</h3>
                    </div>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900 mb-3">Publishing & Print Layout</h4>
                        <p className="text-gray-700 mb-4">
                          Prepare manuscripts, eBooks, and publication layouts with precise margin control for different print formats. Add bleed margins for professional printing or remove scanner artifacts from digitized content for clean digital publishing.
                        </p>
                        <p className="text-gray-600 mb-4">
                          Essential for self-publishers, content creators, and small publishing houses requiring professional document formatting without expensive design software.
                        </p>
                      </div>
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900 mb-3">Digital Content Optimization</h4>
                        <p className="text-gray-700 mb-4">
                          Optimize PDF content for digital distribution by removing excessive whitespace, creating better screen readability, and maximizing content density for mobile and tablet viewing experiences.
                        </p>
                        <div className="bg-purple-50 p-4 rounded-lg">
                          <p className="text-purple-800 text-sm font-medium">Creator Tip:</p>
                          <p className="text-purple-700 text-sm">Combine with our <a href="/tools/compress-pdf" className="text-purple-600 hover:text-purple-800 underline">PDF compressor</a> to optimize both margins and file size for web distribution.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* How It Works - Enhanced */}
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl shadow-lg p-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-8">How Our PDF Margin Adjuster Works</h2>
                  <div className="grid md:grid-cols-4 gap-6 mb-8">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-2xl font-bold text-green-600">1</span>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Upload & Analysis</h3>
                      <p className="text-gray-600 text-sm">
                        Upload your PDF file and our tool automatically analyzes current page dimensions, content positioning, and optimal margin adjustment strategies.
                      </p>
                    </div>
                    <div className="text-center">
                      <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-2xl font-bold text-teal-600">2</span>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Operation Selection</h3>
                      <p className="text-gray-600 text-sm">
                        Choose between adding margins (expanding page size) or removing margins (cropping borders), then set precise measurements for each side.
                      </p>
                    </div>
                    <div className="text-center">
                      <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-2xl font-bold text-blue-600">3</span>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Precision Adjustment</h3>
                      <p className="text-gray-600 text-sm">
                        Use intuitive sliders to set exact margin dimensions (0-50mm) with real-time preview showing the effect on your document layout.
                      </p>
                    </div>
                    <div className="text-center">
                      <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-2xl font-bold text-orange-600">4</span>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Download Result</h3>
                      <p className="text-gray-600 text-sm">
                        Download your professionally adjusted PDF with perfect margins, maintained content quality, and consistent formatting across all pages.
                      </p>
                    </div>
                  </div>
                  
                  <div className="bg-white rounded-lg p-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">Advanced Processing Features</h3>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900 mb-3">Intelligent Content Preservation</h4>
                        <ul className="space-y-2 text-gray-600 text-sm">
                          <li className="flex items-start">
                            <span className="text-green-600 mr-2">•</span>
                            <span>Maintains text quality and vector graphics sharpness during margin adjustments</span>
                          </li>
                          <li className="flex items-start">
                            <span className="text-green-600 mr-2">•</span>
                            <span>Preserves embedded images, charts, and diagrams at original resolution</span>
                          </li>
                          <li className="flex items-start">
                            <span className="text-green-600 mr-2">•</span>
                            <span>Maintains document metadata and bookmarks throughout the process</span>
                          </li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900 mb-3">Precision Control System</h4>
                        <ul className="space-y-2 text-gray-600 text-sm">
                          <li className="flex items-start">
                            <span className="text-green-600 mr-2">•</span>
                            <span>Millimeter-precise margin adjustments for professional accuracy</span>
                          </li>
                          <li className="flex items-start">
                            <span className="text-green-600 mr-2">•</span>
                            <span>Independent control over top, bottom, left, and right margins</span>
                          </li>
                          <li className="flex items-start">
                            <span className="text-green-600 mr-2">•</span>
                            <span>Real-time preview with exact measurement display</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Use Cases by Industry */}
                <div className="bg-white rounded-2xl shadow-lg p-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-8">Industry-Specific Applications</h2>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="bg-blue-50 rounded-lg p-6">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                        <i className="fas fa-gavel text-blue-600 text-xl"></i>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Legal & Compliance</h3>
                      <p className="text-gray-700 text-sm mb-3">
                        Prepare legal documents, contracts, and court filings with precise margin requirements. Add margins for binding legal briefs or remove scanner borders from digitized case documents.
                      </p>
                      <p className="text-gray-600 text-xs">
                        Essential for law firms ensuring documents meet court formatting requirements and professional presentation standards.
                      </p>
                    </div>

                    <div className="bg-green-50 rounded-lg p-6">
                      <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                        <i className="fas fa-heartbeat text-green-600 text-xl"></i>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Healthcare & Medical</h3>
                      <p className="text-gray-700 text-sm mb-3">
                        Format medical records, research papers, and patient documentation with consistent margins. Remove borders from scanned medical documents for cleaner digital archiving.
                      </p>
                      <p className="text-gray-600 text-xs">
                        Critical for medical practices digitizing patient records and researchers preparing publication-ready medical studies.
                      </p>
                    </div>

                    <div className="bg-purple-50 rounded-lg p-6">
                      <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                        <i className="fas fa-chalkboard-teacher text-purple-600 text-xl"></i>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Education & Training</h3>
                      <p className="text-gray-700 text-sm mb-3">
                        Create standardized educational materials, course handouts, and training manuals with consistent margin formatting for professional presentation and binding.
                      </p>
                      <p className="text-gray-600 text-xs">
                        Perfect for educators, corporate trainers, and online course creators requiring consistent document formatting.
                      </p>
                    </div>

                    <div className="bg-orange-50 rounded-lg p-6">
                      <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                        <i className="fas fa-industry text-orange-600 text-xl"></i>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Manufacturing & Engineering</h3>
                      <p className="text-gray-700 text-sm mb-3">
                        Prepare technical documentation, safety manuals, and engineering specifications with precise margin control for professional binding and distribution.
                      </p>
                      <p className="text-gray-600 text-xs">
                        Essential for technical documentation teams ensuring consistent formatting across complex industrial manuals.
                      </p>
                    </div>

                    <div className="bg-teal-50 rounded-lg p-6">
                      <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center mb-4">
                        <i className="fas fa-chart-line text-teal-600 text-xl"></i>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Finance & Banking</h3>
                      <p className="text-gray-700 text-sm mb-3">
                        Format financial reports, audit documents, and regulatory submissions with proper margins for binding and professional presentation to stakeholders and regulators.
                      </p>
                      <p className="text-gray-600 text-xs">
                        Critical for financial institutions preparing documents for regulatory review and stakeholder distribution.
                      </p>
                    </div>

                    <div className="bg-red-50 rounded-lg p-6">
                      <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                        <i className="fas fa-newspaper text-red-600 text-xl"></i>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Publishing & Media</h3>
                      <p className="text-gray-700 text-sm mb-3">
                        Prepare articles, magazines, and publication layouts with proper margins for print distribution or remove borders from scanned content for digital publishing.
                      </p>
                      <p className="text-gray-600 text-xs">
                        Perfect for publishers, content creators, and media companies requiring professional document formatting standards.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Related Tools Integration */}
                <div className="bg-gradient-to-br from-green-50 to-teal-50 rounded-2xl shadow-lg p-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-6">Complete Your PDF Workflow</h2>
                  <p className="text-lg text-gray-700 mb-8">
                    Enhance your document processing workflow with our integrated PDF tools that work seamlessly with margin adjustments:
                  </p>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="bg-white p-6 rounded-xl shadow-sm">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                        <i className="fas fa-expand-arrows-alt text-blue-600 text-xl"></i>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Resize Pages</h3>
                      <p className="text-gray-600 text-sm mb-3">
                        After adjusting margins, use our <a href="/tools/pdf-page-resizer" className="text-blue-600 hover:text-blue-800 underline font-medium">page resizer</a> to convert between A4, Letter, and custom formats for complete document standardization.
                      </p>
                    </div>
                    
                    <div className="bg-white p-6 rounded-xl shadow-sm">
                      <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                        <i className="fas fa-compress-alt text-green-600 text-xl"></i>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Optimize File Size</h3>
                      <p className="text-gray-600 text-sm mb-3">
                        Reduce file size after margin adjustments with our <a href="/tools/compress-pdf" className="text-green-600 hover:text-green-800 underline font-medium">PDF compressor</a> for faster sharing and storage optimization.
                      </p>
                    </div>
                    
                    <div className="bg-white p-6 rounded-xl shadow-sm">
                      <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                        <i className="fas fa-file-text text-purple-600 text-xl"></i>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Add Page Numbers</h3>
                      <p className="text-gray-600 text-sm mb-3">
                        Complete your formatting with our <a href="/tools/add-page-numbers" className="text-purple-600 hover:text-purple-800 underline font-medium">page numbering tool</a> to add professional pagination within your adjusted margins.
                      </p>
                    </div>
                    
                    <div className="bg-white p-6 rounded-xl shadow-sm">
                      <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                        <i className="fas fa-object-group text-orange-600 text-xl"></i>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Merge Documents</h3>
                      <p className="text-gray-600 text-sm mb-3">
                        Combine multiple margin-adjusted PDFs using our <a href="/tools/merge-pdf" className="text-orange-600 hover:text-orange-800 underline font-medium">PDF merger</a> for unified document collections with consistent formatting.
                      </p>
                    </div>
                    
                    <div className="bg-white p-6 rounded-xl shadow-sm">
                      <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center mb-4">
                        <i className="fas fa-list-ol text-teal-600 text-xl"></i>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Organize Pages</h3>
                      <p className="text-gray-600 text-sm mb-3">
                        Rearrange page order with our <a href="/tools/organize-pdf-pages" className="text-teal-600 hover:text-teal-800 underline font-medium">page organizer</a> before or after margin adjustments for optimal document flow.
                      </p>
                    </div>
                    
                    <div className="bg-white p-6 rounded-xl shadow-sm">
                      <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                        <i className="fas fa-cut text-red-600 text-xl"></i>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Split Documents</h3>
                      <p className="text-gray-600 text-sm mb-3">
                        Divide large documents with our <a href="/tools/split-pdf" className="text-red-600 hover:text-red-800 underline font-medium">PDF splitter</a> before applying specific margin adjustments to individual sections.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Technical Features & FAQ */}
                <div className="bg-white rounded-2xl shadow-lg p-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-8">Technical Features & Capabilities</h2>
                  <div className="grid md:grid-cols-2 gap-8 mb-8">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-4">Advanced Processing Features</h3>
                      <div className="space-y-4">
                        <div className="flex items-start">
                          <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mr-3 mt-1">
                            <i className="fas fa-check text-xs text-green-600"></i>
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900">Precision Measurement Control</h4>
                            <p className="text-gray-600 text-sm">Millimeter-accurate margin adjustments with 0-50mm range for professional document formatting.</p>
                          </div>
                        </div>
                        <div className="flex items-start">
                          <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mr-3 mt-1">
                            <i className="fas fa-check text-xs text-green-600"></i>
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900">Multi-Page Processing</h4>
                            <p className="text-gray-600 text-sm">Consistent margin adjustments across all pages in multi-page documents.</p>
                          </div>
                        </div>
                        <div className="flex items-start">
                          <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mr-3 mt-1">
                            <i className="fas fa-check text-xs text-green-600"></i>
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900">Content Quality Preservation</h4>
                            <p className="text-gray-600 text-sm">Maintains original text quality, vector graphics sharpness, and image resolution.</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-4">Supported Operations</h3>
                      <div className="space-y-3">
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <h4 className="font-semibold text-gray-900 text-sm mb-1">Add Margins</h4>
                          <p className="text-gray-600 text-xs">Expand page dimensions with configurable whitespace for binding, annotations, or improved readability.</p>
                        </div>
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <h4 className="font-semibold text-gray-900 text-sm mb-1">Remove Margins (Crop)</h4>
                          <p className="text-gray-600 text-xs">Intelligent border removal to eliminate scanner artifacts and maximize content space.</p>
                        </div>
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <h4 className="font-semibold text-gray-900 text-sm mb-1">Independent Side Control</h4>
                          <p className="text-gray-600 text-xs">Separate adjustment controls for top, bottom, left, and right margins with real-time preview.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="border-t border-gray-200 pt-8">
                    <h3 className="text-xl font-semibold text-gray-900 mb-6">Frequently Asked Questions</h3>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div>
                          <h4 className="text-lg font-semibold text-gray-900 mb-2">What's the difference between adding and removing margins?</h4>
                          <p className="text-gray-700 text-sm">
                            Adding margins expands the page size by creating additional whitespace around existing content, perfect for binding or annotation space. Removing margins crops the document borders, reducing page size while preserving content, ideal for eliminating scanner borders or unnecessary whitespace.
                          </p>
                        </div>
                        
                        <div>
                          <h4 className="text-lg font-semibold text-gray-900 mb-2">Can I set different margins for each side?</h4>
                          <p className="text-gray-700 text-sm">
                            Yes, our tool provides independent control over top, bottom, left, and right margins. This allows for asymmetric margin adjustments, such as adding extra left margin for binding while maintaining standard margins on other sides.
                          </p>
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <div>
                          <h4 className="text-lg font-semibold text-gray-900 mb-2">Will margin adjustments affect content quality?</h4>
                          <p className="text-gray-700 text-sm">
                            No, our margin adjuster preserves original content quality. When adding margins, content remains unchanged and is simply repositioned within expanded page boundaries. When removing margins, content is preserved while only border areas are cropped.
                          </p>
                        </div>
                        
                        <div>
                          <h4 className="text-lg font-semibold text-gray-900 mb-2">Is my PDF data secure during processing?</h4>
                          <p className="text-gray-700 text-sm">
                            Yes, while margin adjustments require server processing for precision, your documents are processed securely and are not stored on our servers. Files are automatically deleted after processing to ensure your privacy and security.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Best Practices & Tips */}
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl shadow-lg p-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-8">Best Practices for PDF Margin Adjustment</h2>
                  <div className="grid md:grid-cols-2 gap-8">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-6">Before Adjusting Margins</h3>
                      <div className="space-y-4">
                        <div className="flex items-start">
                          <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-3 mt-1">
                            <span className="text-xs font-bold text-blue-600">1</span>
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900">Assess Current Layout</h4>
                            <p className="text-gray-600 text-sm">Review your document's current margins and content positioning to determine the optimal adjustment strategy for your specific needs.</p>
                          </div>
                        </div>
                        <div className="flex items-start">
                          <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-3 mt-1">
                            <span className="text-xs font-bold text-blue-600">2</span>
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900">Check Requirements</h4>
                            <p className="text-gray-600 text-sm">Verify any specific margin requirements for your intended use (academic submission, printing, binding) before making adjustments.</p>
                          </div>
                        </div>
                        <div className="flex items-start">
                          <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-3 mt-1">
                            <span className="text-xs font-bold text-blue-600">3</span>
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900">Consider Content Impact</h4>
                            <p className="text-gray-600 text-sm">Evaluate how margin changes will affect content readability, especially for documents with tables, images, or complex layouts.</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-6">After Margin Adjustment</h3>
                      <div className="space-y-4">
                        <div className="flex items-start">
                          <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mr-3 mt-1">
                            <span className="text-xs font-bold text-green-600">1</span>
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900">Review Results</h4>
                            <p className="text-gray-600 text-sm">Carefully examine the adjusted document to ensure margins meet your requirements and content remains properly positioned.</p>
                          </div>
                        </div>
                        <div className="flex items-start">
                          <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mr-3 mt-1">
                            <span className="text-xs font-bold text-green-600">2</span>
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900">Test Print Preview</h4>
                            <p className="text-gray-600 text-sm">If printing is your goal, use print preview to verify the adjusted margins display correctly on your target paper size.</p>
                          </div>
                        </div>
                        <div className="flex items-start">
                          <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mr-3 mt-1">
                            <span className="text-xs font-bold text-green-600">3</span>
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900">Apply Additional Tools</h4>
                            <p className="text-gray-600 text-sm">Consider using our <a href="/tools/compress-pdf" className="text-blue-600 hover:text-blue-800 underline">compression tool</a> to optimize file size or <a href="/tools/add-page-numbers" className="text-blue-600 hover:text-blue-800 underline">page numbering</a> for final formatting.</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* SEO Keywords Section */}
                <div className="bg-white rounded-2xl shadow-lg p-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-6">Professional PDF Margin Adjustment Solutions</h2>
                  <div className="prose prose-gray max-w-none text-gray-700">
                    <p className="text-lg mb-4">
                      Our comprehensive PDF margin adjuster provides professional document formatting solutions for businesses, educational institutions, legal firms, and content creators worldwide. Whether you need to add margins for binding requirements, remove scanner borders from digitized documents, or standardize margin formatting across document collections, our advanced tool delivers precision results with millimeter accuracy.
                    </p>
                    <p className="text-gray-600 mb-4">
                      Key capabilities include add margin functionality for binding preparation, remove margin cropping for border elimination, independent side control for asymmetric adjustments, multi-page processing for document consistency, and content quality preservation throughout the adjustment process. Perfect for academic paper formatting, legal document preparation, business presentation optimization, technical manual standardization, and digital publishing workflows.
                    </p>
                    <p className="text-gray-600">
                      Integrate with our complete PDF processing toolkit: <a href="/tools/pdf-page-resizer" className="text-blue-600 hover:text-blue-800 underline">resize page dimensions</a>, <a href="/tools/compress-pdf" className="text-blue-600 hover:text-blue-800 underline">optimize file sizes</a>, <a href="/tools/merge-pdf" className="text-blue-600 hover:text-blue-800 underline">combine documents</a>, <a href="/tools/split-pdf" className="text-blue-600 hover:text-blue-800 underline">divide large files</a>, <a href="/tools/add-page-numbers" className="text-blue-600 hover:text-blue-800 underline">add pagination</a>, and <a href="/tools/organize-pdf-pages" className="text-blue-600 hover:text-blue-800 underline">rearrange page order</a> for comprehensive document management solutions.
                    </p>
                  </div>
                </div>
                      <li><strong>Process:</strong> Click the adjust button to apply margin changes to all pages</li>
                      <li><strong>Download:</strong> Get your modified PDF with perfectly adjusted margins</li>
                    </ul>
                  </div>
                </div>

                {/* Features and Benefits */}
                <div className="bg-white rounded-2xl shadow-lg p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Key Features and Benefits</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div className="flex items-start">
                      <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mr-3 mt-1">
                        <i className="fas fa-check text-xs text-green-600"></i>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">Add or Remove Margins</h3>
                        <p className="text-gray-600 text-sm">Choose between adding white margins or cropping existing borders.</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mr-3 mt-1">
                        <i className="fas fa-check text-xs text-green-600"></i>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">Precise Control</h3>
                        <p className="text-gray-600 text-sm">Set individual values for top, bottom, left, and right margins.</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mr-3 mt-1">
                        <i className="fas fa-check text-xs text-green-600"></i>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">Visual Sliders</h3>
                        <p className="text-gray-600 text-sm">Easy-to-use sliders for quick margin adjustments up to 50mm.</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mr-3 mt-1">
                        <i className="fas fa-check text-xs text-green-600"></i>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">Content Preservation</h3>
                        <p className="text-gray-600 text-sm">Original content quality and formatting is maintained.</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mr-3 mt-1">
                        <i className="fas fa-check text-xs text-green-600"></i>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">Browser-Based Processing</h3>
                        <p className="text-gray-600 text-sm">No software installation required, works directly in your browser.</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mr-3 mt-1">
                        <i className="fas fa-check text-xs text-green-600"></i>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">Privacy & Security</h3>
                        <p className="text-gray-600 text-sm">Files processed locally in your browser, ensuring document privacy.</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-green-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Why Choose Our PDF Margin Adjuster?</h3>
                    <ul className="space-y-2 text-gray-700 text-sm">
                      <li>• <strong>Free to Use:</strong> No subscription or registration required</li>
                      <li>• <strong>High Quality:</strong> Maintains original PDF quality and resolution</li>
                      <li>• <strong>Multi-Page Support:</strong> Process entire documents with consistent margins</li>
                      <li>• <strong>Instant Processing:</strong> Fast margin adjustment without server uploads</li>
                      <li>• <strong>No File Size Limits:</strong> Handle large PDF documents efficiently</li>
                      <li>• <strong>Cross-Platform:</strong> Works on Windows, Mac, Linux, and mobile devices</li>
                    </ul>
                  </div>
                </div>

                {/* Use Cases */}
                <div className="bg-white rounded-2xl shadow-lg p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Common Use Cases for PDF Margin Adjustment</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-4">Adding Margins:</h3>
                      <ul className="space-y-3 text-gray-600">
                        <li className="flex items-start">
                          <i className="fas fa-arrow-right text-green-600 mr-3 mt-1"></i>
                          <div>
                            <strong>Academic Papers:</strong> Add margins for binding, hole punching, or professor comments
                          </div>
                        </li>
                        <li className="flex items-start">
                          <i className="fas fa-arrow-right text-green-600 mr-3 mt-1"></i>
                          <div>
                            <strong>Business Documents:</strong> Create professional white space for branding or signatures
                          </div>
                        </li>
                        <li className="flex items-start">
                          <i className="fas fa-arrow-right text-green-600 mr-3 mt-1"></i>
                          <div>
                            <strong>Presentations:</strong> Add breathing room around content for better visual appeal
                          </div>
                        </li>
                        <li className="flex items-start">
                          <i className="fas fa-arrow-right text-green-600 mr-3 mt-1"></i>
                          <div>
                            <strong>Print Preparation:</strong> Ensure content doesn't get cut off during printing
                          </div>
                        </li>
                      </ul>
                    </div>
                    
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-4">Removing Margins (Cropping):</h3>
                      <ul className="space-y-3 text-gray-600">
                        <li className="flex items-start">
                          <i className="fas fa-crop text-blue-600 mr-3 mt-1"></i>
                          <div>
                            <strong>Scanned Documents:</strong> Remove unwanted borders from scanned papers
                          </div>
                        </li>
                        <li className="flex items-start">
                          <i className="fas fa-crop text-blue-600 mr-3 mt-1"></i>
                          <div>
                            <strong>Digital Display:</strong> Maximize content area for screen viewing
                          </div>
                        </li>
                        <li className="flex items-start">
                          <i className="fas fa-crop text-blue-600 mr-3 mt-1"></i>
                          <div>
                            <strong>Mobile Optimization:</strong> Remove excessive white space for mobile reading
                          </div>
                        </li>
                        <li className="flex items-start">
                          <i className="fas fa-crop text-blue-600 mr-3 mt-1"></i>
                          <div>
                            <strong>Content Focus:</strong> Eliminate distracting borders to highlight main content
                          </div>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Technical Information */}
                <div className="bg-white rounded-2xl shadow-lg p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Technical Information</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Supported Features:</h3>
                      <ul className="space-y-2 text-gray-600 text-sm">
                        <li>• <strong>File Format:</strong> PDF documents (all versions)</li>
                        <li>• <strong>Margin Range:</strong> 0-50 millimeters per side</li>
                        <li>• <strong>Page Support:</strong> Single and multi-page documents</li>
                        <li>• <strong>Content Types:</strong> Text, images, vectors, forms</li>
                        <li>• <strong>Security:</strong> Password-protected PDFs supported</li>
                        <li>• <strong>Languages:</strong> All text languages and character sets</li>
                      </ul>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Browser Requirements:</h3>
                      <ul className="space-y-2 text-gray-600 text-sm">
                        <li>• <strong>Chrome:</strong> Version 60+ recommended</li>
                        <li>• <strong>Firefox:</strong> Version 55+ recommended</li>
                        <li>• <strong>Safari:</strong> Version 11+ recommended</li>
                        <li>• <strong>Edge:</strong> Version 79+ recommended</li>
                        <li>• <strong>JavaScript:</strong> Must be enabled</li>
                        <li>• <strong>Memory:</strong> Sufficient RAM for PDF file size</li>
                      </ul>
                    </div>
                  </div>
                  
                  <div className="mt-8 bg-blue-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">How the Technology Works:</h3>
                    <p className="text-gray-700 text-sm leading-relaxed">
                      Our PDF Margin Adjuster uses advanced PDF-lib technology to manipulate PDF page dimensions and content positioning. When adding margins, the tool creates new pages with increased dimensions and positions the original content with specified offsets. When removing margins (cropping), it creates smaller pages and adjusts content positioning to crop unwanted borders. All processing happens locally in your browser using WebAssembly for optimal performance and privacy.
                    </p>
                  </div>
                </div>

                {/* FAQ Section */}
                <div className="bg-white rounded-2xl shadow-lg p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Frequently Asked Questions</h2>
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Can I adjust margins for specific pages only?</h3>
                      <p className="text-gray-600">Currently, our tool applies margin adjustments to all pages in the PDF document. For page-specific margin adjustments, you would need to extract individual pages first, adjust margins, and then merge them back.</p>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">What's the maximum margin size I can add?</h3>
                      <p className="text-gray-600">You can add up to 50mm (approximately 2 inches) of margin on each side. This range covers most standard printing and binding requirements while maintaining reasonable file sizes.</p>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Will margin adjustment affect PDF quality?</h3>
                      <p className="text-gray-600">No, margin adjustment preserves the original content quality. We only modify page dimensions and positioning without recompressing or altering the actual content, fonts, or images.</p>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Can I undo margin adjustments?</h3>
                      <p className="text-gray-600">The tool creates a new PDF file with adjusted margins. To undo changes, you would need to use the original PDF file. We recommend keeping a backup of your original document.</p>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Does the tool work with password-protected PDFs?</h3>
                      <p className="text-gray-600">Yes, our tool can process password-protected PDFs. However, you may need to enter the password when uploading the file, depending on the PDF's security settings.</p>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Is there a file size limit?</h3>
                      <p className="text-gray-600">There's no strict file size limit, but processing very large PDFs (over 100MB) may take longer and require significant browser memory. For optimal performance, we recommend files under 50MB.</p>
                    </div>
                  </div>
                </div>

                {/* Tips and Best Practices */}
                <div className="bg-white rounded-2xl shadow-lg p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Tips for Perfect PDF Margins</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Best Practices:</h3>
                      <ul className="space-y-3 text-gray-600 text-sm">
                        <li>• <strong>Standard Margins:</strong> Use 10-25mm margins for most documents</li>
                        <li>• <strong>Binding Margins:</strong> Add 5-10mm extra to the left margin for binding</li>
                        <li>• <strong>Print Testing:</strong> Test print a sample page before processing entire document</li>
                        <li>• <strong>Consistent Margins:</strong> Use the same margins for related documents</li>
                        <li>• <strong>Preview First:</strong> Always check the margin preview before processing</li>
                      </ul>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Common Mistakes to Avoid:</h3>
                      <ul className="space-y-3 text-gray-600 text-sm">
                        <li>• <strong>Excessive Margins:</strong> Don't add margins larger than necessary</li>
                        <li>• <strong>Uneven Margins:</strong> Ensure balanced margins unless specifically needed</li>
                        <li>• <strong>Over-Cropping:</strong> Be careful not to crop important content when removing margins</li>
                        <li>• <strong>No Backup:</strong> Always keep a copy of your original PDF file</li>
                        <li>• <strong>Wrong Operation:</strong> Double-check whether you need to add or remove margins</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Related Tools */}
                <div className="bg-white rounded-2xl shadow-lg p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Related PDF Tools</h2>
                  <p className="text-gray-600 mb-6">Enhance your PDF workflow with these complementary tools:</p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-gray-50 rounded-lg p-4 text-center">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <i className="fas fa-crop text-blue-600"></i>
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-2">PDF Page Resizer</h3>
                      <p className="text-gray-600 text-sm">Change PDF page dimensions and aspect ratios</p>
                    </div>
                    
                    <div className="bg-gray-50 rounded-lg p-4 text-center">
                      <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <i className="fas fa-compress text-green-600"></i>
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-2">PDF Compressor</h3>
                      <p className="text-gray-600 text-sm">Reduce PDF file sizes while maintaining quality</p>
                    </div>
                    
                    <div className="bg-gray-50 rounded-lg p-4 text-center">
                      <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <i className="fas fa-rotate text-purple-600"></i>
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-2">PDF Rotator</h3>
                      <p className="text-gray-600 text-sm">Rotate PDF pages to correct orientation</p>
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

export default PDFMarginAdjuster;
