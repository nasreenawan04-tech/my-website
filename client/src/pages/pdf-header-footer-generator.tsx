import { useState, useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Upload, FileText, Download, Type, AlignLeft, AlignCenter, AlignRight } from 'lucide-react';

interface HeaderFooterSettings {
  headerText: string;
  footerText: string;
  headerAlignment: 'left' | 'center' | 'right';
  footerAlignment: 'left' | 'center' | 'right';
  fontSize: number;
  fontColor: string;
  includePageNumbers: boolean;
  pageNumberPosition: 'header' | 'footer';
  pageNumberFormat: string;
  marginTop: number;
  marginBottom: number;
  excludeFirstPage: boolean;
}

const PDFHeaderFooterGenerator = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [settings, setSettings] = useState<HeaderFooterSettings>({
    headerText: '',
    footerText: '',
    headerAlignment: 'center',
    footerAlignment: 'center',
    fontSize: 10,
    fontColor: '#000000',
    includePageNumbers: true,
    pageNumberPosition: 'footer',
    pageNumberFormat: 'Page {current} of {total}',
    marginTop: 20,
    marginBottom: 20,
    excludeFirstPage: false,
  });
  const [processedPdfUrl, setProcessedPdfUrl] = useState<string | null>(null);
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
    setProcessedPdfUrl(null);
    
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

  const updateSetting = <K extends keyof HeaderFooterSettings>(key: K, value: HeaderFooterSettings[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16) / 255,
      g: parseInt(result[2], 16) / 255,
      b: parseInt(result[3], 16) / 255,
    } : { r: 0, g: 0, b: 0 };
  };

  const getAlignment = (alignment: 'left' | 'center' | 'right', pageWidth: number) => {
    switch (alignment) {
      case 'left': return 50;
      case 'right': return pageWidth - 50;
      case 'center': 
      default: return pageWidth / 2;
    }
  };

  const formatPageNumber = (current: number, total: number, format: string) => {
    return format
      .replace('{current}', current.toString())
      .replace('{total}', total.toString());
  };

  const addHeaderFooter = async () => {
    if (!selectedFile) return;

    setIsProcessing(true);
    setError(null);

    try {
      const { PDFDocument, rgb } = await import('pdf-lib');
      
      const arrayBuffer = await selectedFile.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      const pages = pdfDoc.getPages();
      const totalPages = pages.length;
      const colorValues = hexToRgb(settings.fontColor);

      pages.forEach((page, index) => {
        const pageNumber = index + 1;
        const { width, height } = page.getSize();
        
        // Skip first page if excluded
        if (settings.excludeFirstPage && pageNumber === 1) return;

        // Add Header
        if (settings.headerText.trim()) {
          const headerX = getAlignment(settings.headerAlignment, width);
          const headerY = height - settings.marginTop;
          
          page.drawText(settings.headerText, {
            x: headerX,
            y: headerY,
            size: settings.fontSize,
            color: rgb(colorValues.r, colorValues.g, colorValues.b),
          });
        }

        // Add Footer
        if (settings.footerText.trim()) {
          const footerX = getAlignment(settings.footerAlignment, width);
          const footerY = settings.marginBottom;
          
          page.drawText(settings.footerText, {
            x: footerX,
            y: footerY,
            size: settings.fontSize,
            color: rgb(colorValues.r, colorValues.g, colorValues.b),
          });
        }

        // Add Page Numbers
        if (settings.includePageNumbers) {
          const pageNumberText = formatPageNumber(pageNumber, totalPages, settings.pageNumberFormat);
          const isHeader = settings.pageNumberPosition === 'header';
          const y = isHeader ? height - settings.marginTop - (settings.headerText ? 15 : 0) : settings.marginBottom - (settings.footerText ? 15 : 0);
          const x = width / 2; // Always center page numbers
          
          page.drawText(pageNumberText, {
            x: x,
            y: y,
            size: settings.fontSize,
            color: rgb(colorValues.r, colorValues.g, colorValues.b),
          });
        }
      });

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      setProcessedPdfUrl(url);
    } catch (error) {
      console.error('Error adding header/footer to PDF:', error);
      setError('Error adding header/footer to PDF. Please try again with a valid PDF file.');
    }

    setIsProcessing(false);
  };

  const downloadProcessedPDF = () => {
    if (!processedPdfUrl) return;

    const link = document.createElement('a');
    link.href = processedPdfUrl;
    link.download = 'header-footer-document.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const resetTool = () => {
    setSelectedFile(null);
    setProcessedPdfUrl(null);
    setOriginalInfo(null);
    setError(null);
    if (processedPdfUrl) {
      URL.revokeObjectURL(processedPdfUrl);
    }
  };

  const hasContent = settings.headerText.trim() || settings.footerText.trim() || settings.includePageNumbers;

  return (
    <>
      <Helmet>
        <title>PDF Header/Footer Generator - Add Headers and Footers to PDF | ToolsHub</title>
        <meta name="description" content="Add custom headers, footers, and page numbers to PDF documents. Customize alignment, font size, colors, and formatting options." />
        <meta name="keywords" content="PDF header footer, add PDF headers, PDF page numbers, PDF text overlay, PDF header generator" />
        <meta property="og:title" content="PDF Header/Footer Generator - Add Headers and Footers to PDF | ToolsHub" />
        <meta property="og:description" content="Add custom headers, footers, and page numbers to PDF documents with full customization." />
        <meta property="og:type" content="website" />
        <link rel="canonical" href="/tools/pdf-header-footer-generator" />
      </Helmet>

      <div className="min-h-screen flex flex-col" data-testid="page-pdf-header-footer-generator">
        <Header />
        
        <main className="flex-1 bg-neutral-50">
          {/* Hero Section */}
          <section className="bg-gradient-to-r from-teal-600 via-teal-500 to-blue-700 text-white py-16">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <div className="w-20 h-20 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <i className="fas fa-text-height text-3xl"></i>
              </div>
              <h1 className="text-4xl sm:text-5xl font-bold mb-6" data-testid="text-page-title">
                PDF Header/Footer Generator
              </h1>
              <p className="text-xl text-teal-100 max-w-2xl mx-auto">
                Add professional headers, footers, and page numbers to your PDF documents with customizable formatting and alignment options.
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
                            ? 'border-teal-500 bg-teal-50' 
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
                          className="bg-teal-600 hover:bg-teal-700 text-white"
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

                    {/* Header/Footer Settings */}
                    {selectedFile && (
                      <div className="space-y-8" data-testid="header-footer-settings">
                        <h3 className="text-xl font-semibold text-gray-900">Header & Footer Settings</h3>
                        
                        {/* Text Content */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Header Text
                            </label>
                            <Textarea
                              value={settings.headerText}
                              onChange={(e) => updateSetting('headerText', e.target.value)}
                              placeholder="Enter header text (optional)"
                              className="w-full"
                              rows={3}
                              data-testid="input-header-text"
                            />
                            <div className="flex items-center justify-between mt-2">
                              <span className="text-xs text-gray-500">Alignment:</span>
                              <div className="flex space-x-1">
                                <Button
                                  variant={settings.headerAlignment === 'left' ? 'default' : 'outline'}
                                  size="sm"
                                  onClick={() => updateSetting('headerAlignment', 'left')}
                                >
                                  <AlignLeft className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant={settings.headerAlignment === 'center' ? 'default' : 'outline'}
                                  size="sm"
                                  onClick={() => updateSetting('headerAlignment', 'center')}
                                >
                                  <AlignCenter className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant={settings.headerAlignment === 'right' ? 'default' : 'outline'}
                                  size="sm"
                                  onClick={() => updateSetting('headerAlignment', 'right')}
                                >
                                  <AlignRight className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Footer Text
                            </label>
                            <Textarea
                              value={settings.footerText}
                              onChange={(e) => updateSetting('footerText', e.target.value)}
                              placeholder="Enter footer text (optional)"
                              className="w-full"
                              rows={3}
                              data-testid="input-footer-text"
                            />
                            <div className="flex items-center justify-between mt-2">
                              <span className="text-xs text-gray-500">Alignment:</span>
                              <div className="flex space-x-1">
                                <Button
                                  variant={settings.footerAlignment === 'left' ? 'default' : 'outline'}
                                  size="sm"
                                  onClick={() => updateSetting('footerAlignment', 'left')}
                                >
                                  <AlignLeft className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant={settings.footerAlignment === 'center' ? 'default' : 'outline'}
                                  size="sm"
                                  onClick={() => updateSetting('footerAlignment', 'center')}
                                >
                                  <AlignCenter className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant={settings.footerAlignment === 'right' ? 'default' : 'outline'}
                                  size="sm"
                                  onClick={() => updateSetting('footerAlignment', 'right')}
                                >
                                  <AlignRight className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Page Numbers */}
                        <div className="bg-blue-50 rounded-lg p-4">
                          <div className="flex items-center space-x-3 mb-4">
                            <Checkbox
                              id="include-page-numbers"
                              checked={settings.includePageNumbers}
                              onCheckedChange={(checked) => updateSetting('includePageNumbers', Boolean(checked))}
                            />
                            <label htmlFor="include-page-numbers" className="text-sm font-medium text-gray-900">
                              Include Page Numbers
                            </label>
                          </div>
                          
                          {settings.includePageNumbers && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  Page Number Position
                                </label>
                                <Select value={settings.pageNumberPosition} onValueChange={(value: 'header' | 'footer') => updateSetting('pageNumberPosition', value)}>
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="header">Header</SelectItem>
                                    <SelectItem value="footer">Footer</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  Page Number Format
                                </label>
                                <Select value={settings.pageNumberFormat} onValueChange={(value) => updateSetting('pageNumberFormat', value)}>
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="Page {current} of {total}">Page 1 of 5</SelectItem>
                                    <SelectItem value="{current} / {total}">1 / 5</SelectItem>
                                    <SelectItem value="{current}">1</SelectItem>
                                    <SelectItem value="- {current} -">- 1 -</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Formatting Options */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Font Size
                            </label>
                            <Input
                              type="number"
                              min={6}
                              max={24}
                              value={settings.fontSize}
                              onChange={(e) => updateSetting('fontSize', parseInt(e.target.value))}
                              className="w-full"
                              data-testid="input-font-size"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Font Color
                            </label>
                            <div className="flex items-center space-x-2">
                              <input
                                type="color"
                                value={settings.fontColor}
                                onChange={(e) => updateSetting('fontColor', e.target.value)}
                                className="w-12 h-10 rounded border border-gray-300 cursor-pointer"
                                data-testid="input-font-color"
                              />
                              <Input
                                type="text"
                                value={settings.fontColor}
                                onChange={(e) => updateSetting('fontColor', e.target.value)}
                                className="flex-1"
                                placeholder="#000000"
                              />
                            </div>
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Options
                            </label>
                            <div className="space-y-2">
                              <div className="flex items-center space-x-2">
                                <Checkbox
                                  id="exclude-first-page"
                                  checked={settings.excludeFirstPage}
                                  onCheckedChange={(checked) => updateSetting('excludeFirstPage', Boolean(checked))}
                                />
                                <label htmlFor="exclude-first-page" className="text-sm text-gray-700">
                                  Skip first page
                                </label>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Margins */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Top Margin: {settings.marginTop}pt
                            </label>
                            <input
                              type="range"
                              min={10}
                              max={100}
                              value={settings.marginTop}
                              onChange={(e) => updateSetting('marginTop', parseInt(e.target.value))}
                              className="w-full"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Bottom Margin: {settings.marginBottom}pt
                            </label>
                            <input
                              type="range"
                              min={10}
                              max={100}
                              value={settings.marginBottom}
                              onChange={(e) => updateSetting('marginBottom', parseInt(e.target.value))}
                              className="w-full"
                            />
                          </div>
                        </div>

                        {/* Preview */}
                        <div className="bg-gray-50 rounded-lg p-4">
                          <h4 className="font-medium text-gray-900 mb-2">Preview</h4>
                          <div className="bg-white rounded border-2 border-gray-200 p-4 min-h-32 relative">
                            {settings.headerText && (
                              <div className={`absolute top-2 text-${settings.headerAlignment === 'center' ? 'center' : settings.headerAlignment} w-full text-xs`} style={{ color: settings.fontColor, fontSize: `${settings.fontSize * 0.8}px` }}>
                                {settings.headerText}
                              </div>
                            )}
                            <div className="flex items-center justify-center h-20 text-gray-400">
                              Document Content
                            </div>
                            {settings.footerText && (
                              <div className={`absolute bottom-2 text-${settings.footerAlignment === 'center' ? 'center' : settings.footerAlignment} w-full text-xs`} style={{ color: settings.fontColor, fontSize: `${settings.fontSize * 0.8}px` }}>
                                {settings.footerText}
                              </div>
                            )}
                            {settings.includePageNumbers && (
                              <div className={`absolute ${settings.pageNumberPosition === 'header' ? 'top-6' : 'bottom-6'} text-center w-full text-xs`} style={{ color: settings.fontColor, fontSize: `${settings.fontSize * 0.8}px` }}>
                                {formatPageNumber(1, originalInfo?.pageCount || 1, settings.pageNumberFormat)}
                              </div>
                            )}
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

                    {/* Generate Button */}
                    {selectedFile && hasContent && !error && (
                      <div className="text-center">
                        <Button
                          onClick={addHeaderFooter}
                          disabled={isProcessing}
                          className="bg-teal-600 hover:bg-teal-700 text-white px-8 py-3 text-lg"
                          data-testid="button-generate"
                        >
                          {isProcessing ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                              Adding Header/Footer...
                            </>
                          ) : (
                            <>
                              <Type className="w-4 h-4 mr-2" />
                              Add Header/Footer to PDF
                            </>
                          )}
                        </Button>
                      </div>
                    )}

                    {/* Results Section */}
                    {processedPdfUrl && (
                      <div className="bg-green-50 rounded-xl p-6 text-center" data-testid="generate-results">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <i className="fas fa-check text-2xl text-green-600"></i>
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">
                          Header/Footer Successfully Added!
                        </h3>
                        <p className="text-gray-600 mb-6">
                          Your PDF now includes the custom header, footer, and page numbering as specified.
                        </p>
                        <Button
                          onClick={downloadProcessedPDF}
                          className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-3"
                          data-testid="button-download"
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Download PDF with Header/Footer
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </section>
        </main>
        
        <Footer />
      </div>
    </>
  );
};

export default PDFHeaderFooterGenerator;