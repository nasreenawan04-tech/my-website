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

    setSelectedFile(file);
    setError(null);
    setAdjustedPdfUrl(null);
    
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
      const { PDFDocument, rgb } = await import('pdf-lib');
      
      const arrayBuffer = await selectedFile.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      const newPdfDoc = await PDFDocument.create();
      
      const pages = pdfDoc.getPages();
      const margins = {
        top: marginTop[0],
        bottom: marginBottom[0],
        left: marginLeft[0],
        right: marginRight[0]
      };

      for (const page of pages) {
        const { width: originalWidth, height: originalHeight } = page.getSize();
        
        let newWidth, newHeight, sourceBox;
        
        if (operation === 'add') {
          // Add margins - increase page size
          newWidth = originalWidth + margins.left + margins.right;
          newHeight = originalHeight + margins.top + margins.bottom;
          
          const newPage = newPdfDoc.addPage([newWidth, newHeight]);
          
          // Add background color (optional)
          newPage.drawRectangle({
            x: 0,
            y: 0,
            width: newWidth,
            height: newHeight,
            color: rgb(1, 1, 1), // White background
          });
          
          // Embed the original page
          const [embeddedPage] = await newPdfDoc.embedPages([page]);
          
          // Draw the embedded page with margins
          newPage.drawPage(embeddedPage, {
            x: margins.left,
            y: margins.bottom,
            width: originalWidth,
            height: originalHeight,
          });
        } else {
          // Remove margins - crop the page
          newWidth = Math.max(50, originalWidth - margins.left - margins.right);
          newHeight = Math.max(50, originalHeight - margins.top - margins.bottom);
          
          const newPage = newPdfDoc.addPage([newWidth, newHeight]);
          
          // Embed the original page
          const [embeddedPage] = await newPdfDoc.embedPages([page]);
          
          // Draw the cropped portion
          newPage.drawPage(embeddedPage, {
            x: -margins.left, // Negative offset to crop from left
            y: -margins.bottom, // Negative offset to crop from bottom
            width: originalWidth,
            height: originalHeight,
          });
        }
      }

      const pdfBytes = await newPdfDoc.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      setAdjustedPdfUrl(url);
    } catch (error) {
      console.error('Error adjusting PDF margins:', error);
      setError('Error adjusting PDF margins. Please try again with a valid PDF file.');
    }

    setIsProcessing(false);
  };

  const downloadAdjustedPDF = () => {
    if (!adjustedPdfUrl) return;

    const link = document.createElement('a');
    link.href = adjustedPdfUrl;
    link.download = `${operation}-margins-document.pdf`;
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

              {/* Educational Content */}
              <div className="mt-12 space-y-8">
                {/* How it Works */}
                <div className="bg-white rounded-2xl shadow-lg p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">How PDF Margin Adjustment Works</h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Upload className="w-8 h-8 text-green-600" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">1. Upload PDF</h3>
                      <p className="text-gray-600">
                        Select a PDF file that needs margin adjustment or border cropping.
                      </p>
                    </div>
                    
                    <div className="text-center">
                      <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Crop className="w-8 h-8 text-teal-600" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">2. Adjust Margins</h3>
                      <p className="text-gray-600">
                        Choose to add or remove margins and set precise values for each side.
                      </p>
                    </div>
                    
                    <div className="text-center">
                      <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Download className="w-8 h-8 text-blue-600" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">3. Download</h3>
                      <p className="text-gray-600">
                        Get your PDF with perfectly adjusted margins for better presentation.
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
import { useState, useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const PDFMarginAdjuster = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [marginTop, setMarginTop] = useState<number>(20);
  const [marginBottom, setMarginBottom] = useState<number>(20);
  const [marginLeft, setMarginLeft] = useState<number>(20);
  const [marginRight, setMarginRight] = useState<number>(20);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      setSelectedFile(file);
    } else {
      alert('Please select a valid PDF file.');
    }
  };

  const handleAdjustMargins = async () => {
    if (!selectedFile) {
      alert('Please select a PDF file first.');
      return;
    }

    setIsProcessing(true);
    
    try {
      const formData = new FormData();
      formData.append('pdf', selectedFile);
      formData.append('marginTop', marginTop.toString());
      formData.append('marginBottom', marginBottom.toString());
      formData.append('marginLeft', marginLeft.toString());
      formData.append('marginRight', marginRight.toString());

      const response = await fetch('/api/pdf/adjust-margins', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = `${selectedFile.name.replace('.pdf', '')}_margins_adjusted.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        throw new Error('Failed to adjust PDF margins');
      }
    } catch (error) {
      console.error('Error adjusting PDF margins:', error);
      alert('An error occurred while adjusting the PDF margins. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const resetForm = () => {
    setSelectedFile(null);
    setMarginTop(20);
    setMarginBottom(20);
    setMarginLeft(20);
    setMarginRight(20);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <>
      <Helmet>
        <title>PDF Margin Adjuster - Add or Remove Margins | ToolsHub</title>
        <meta name="description" content="Adjust PDF margins by adding or removing borders and crop pages. Free online PDF margin adjustment tool." />
        <meta name="keywords" content="PDF margin adjuster, PDF crop, PDF borders, adjust PDF margins, crop PDF pages" />
      </Helmet>

      <div className="min-h-screen flex flex-col">
        <Header />

        <main className="flex-1 bg-neutral-50">
          <section className="bg-gradient-to-r from-green-600 via-green-500 to-emerald-700 text-white py-16">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <div className="w-20 h-20 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <i className="fas fa-crop text-3xl"></i>
              </div>
              <h1 className="text-4xl sm:text-5xl font-bold mb-4">
                PDF Margin Adjuster
              </h1>
              <p className="text-xl text-green-100 mb-8 max-w-2xl mx-auto">
                Add or remove margins from PDF pages and crop borders to customize page layout
              </p>
            </div>
          </section>

          <section className="py-16">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      Select PDF File
                    </label>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf"
                      onChange={handleFileSelect}
                      className="w-full p-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>

                  {selectedFile && (
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                      <p className="text-green-800">
                        <i className="fas fa-file-pdf mr-2"></i>
                        Selected: {selectedFile.name}
                      </p>
                    </div>
                  )}

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-2">
                        Top Margin (mm)
                      </label>
                      <input
                        type="number"
                        value={marginTop}
                        onChange={(e) => setMarginTop(Number(e.target.value))}
                        className="w-full p-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-green-500"
                        min="0"
                        max="100"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-2">
                        Bottom Margin (mm)
                      </label>
                      <input
                        type="number"
                        value={marginBottom}
                        onChange={(e) => setMarginBottom(Number(e.target.value))}
                        className="w-full p-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-green-500"
                        min="0"
                        max="100"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-2">
                        Left Margin (mm)
                      </label>
                      <input
                        type="number"
                        value={marginLeft}
                        onChange={(e) => setMarginLeft(Number(e.target.value))}
                        className="w-full p-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-green-500"
                        min="0"
                        max="100"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-2">
                        Right Margin (mm)
                      </label>
                      <input
                        type="number"
                        value={marginRight}
                        onChange={(e) => setMarginRight(Number(e.target.value))}
                        className="w-full p-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-green-500"
                        min="0"
                        max="100"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4 pt-6">
                    <button
                      onClick={handleAdjustMargins}
                      disabled={!selectedFile || isProcessing}
                      className="flex-1 bg-gradient-to-r from-green-600 to-emerald-700 text-white px-6 py-3 rounded-lg font-semibold hover:from-green-700 hover:to-emerald-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isProcessing ? (
                        <>
                          <i className="fas fa-spinner fa-spin mr-2"></i>
                          Adjusting Margins...
                        </>
                      ) : (
                        <>
                          <i className="fas fa-crop mr-2"></i>
                          Adjust Margins
                        </>
                      )}
                    </button>
                    <button
                      onClick={resetForm}
                      className="flex-1 bg-neutral-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-neutral-600 transition-all duration-200"
                    >
                      <i className="fas fa-redo mr-2"></i>
                      Reset
                    </button>
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
