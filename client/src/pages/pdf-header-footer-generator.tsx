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

    // Validate file size (50MB limit)
    if (file.size > 50 * 1024 * 1024) {
      setError('File size too large. Please select a PDF file smaller than 50MB.');
      return;
    }

    setSelectedFile(file);
    setError(null);
    setProcessedPdfUrl(null);
    
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

  const updateSetting = <K extends keyof HeaderFooterSettings>(key: K, value: HeaderFooterSettings[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };


  const addHeaderFooter = async () => {
    if (!selectedFile) return;

    setIsProcessing(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('pdf', selectedFile);
      formData.append('headerText', settings.headerText);
      formData.append('footerText', settings.footerText);
      formData.append('headerAlignment', settings.headerAlignment);
      formData.append('footerAlignment', settings.footerAlignment);
      formData.append('fontSize', settings.fontSize.toString());
      formData.append('fontColor', settings.fontColor);
      formData.append('includePageNumbers', settings.includePageNumbers.toString());
      formData.append('pageNumberPosition', settings.pageNumberPosition);
      formData.append('pageNumberFormat', settings.pageNumberFormat);
      formData.append('marginTop', settings.marginTop.toString());
      formData.append('marginBottom', settings.marginBottom.toString());
      formData.append('excludeFirstPage', settings.excludeFirstPage.toString());

      const response = await fetch('/api/pdf-header-footer', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      setProcessedPdfUrl(url);
    } catch (error) {
      console.error('Error adding header/footer to PDF:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setError(`Error adding header/footer to PDF: ${errorMessage}. Please try again with a valid PDF file.`);
    }

    setIsProcessing(false);
  };

  const downloadProcessedPDF = () => {
    if (!processedPdfUrl || !selectedFile) return;

    const link = document.createElement('a');
    link.href = processedPdfUrl;
    const baseName = selectedFile.name.replace('.pdf', '');
    link.download = `header-footer-${baseName}.pdf`;
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

                    {/* Error Display */}
                    {error && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-4" data-testid="error-message">
                        <div className="flex items-center">
                          <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                          </div>
                          <div className="ml-3">
                            <p className="text-sm font-medium text-red-800">{error}</p>
                          </div>
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
                                {settings.pageNumberFormat
                                  .replace('{current}', '1')
                                  .replace('{total}', (originalInfo?.pageCount || 1).toString())}
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

          {/* SEO Content Sections */}
          <section className="py-16 bg-white">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="space-y-12">
                {/* What is PDF Header/Footer Generator */}
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-6">What is a PDF Header/Footer Generator?</h2>
                  <div className="prose prose-lg max-w-none text-gray-700">
                    <p>
                      A <strong>PDF Header/Footer Generator</strong> is a specialized digital tool designed to add professional headers, footers, and page numbering to PDF documents with complete customization control. This powerful utility enables users to enhance their PDF documents by inserting consistent branding elements, document information, navigation aids, and page references that maintain visual continuity across all pages.
                    </p>
                    <p>
                      Our advanced PDF header and footer tool provides comprehensive formatting options including custom text insertion, flexible alignment controls, font customization, color selection, margin adjustments, and automated page numbering systems. Whether you're preparing business reports, academic papers, legal documents, or marketing materials, this tool ensures your PDFs maintain professional presentation standards with consistent header and footer elements.
                    </p>
                  </div>
                </div>

                {/* Features and Benefits */}
                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-2xl font-semibold text-gray-900 mb-4">Advanced Header/Footer Features</h3>
                    <ul className="space-y-3 text-gray-700">
                      <li className="flex items-start">
                        <span className="w-2 h-2 bg-teal-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        <span><strong>Custom Text Headers:</strong> Add company names, document titles, author information, or any custom text to document headers</span>
                      </li>
                      <li className="flex items-start">
                        <span className="w-2 h-2 bg-teal-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        <span><strong>Flexible Footer Content:</strong> Insert copyright notices, confidentiality statements, contact information, or legal disclaimers</span>
                      </li>
                      <li className="flex items-start">
                        <span className="w-2 h-2 bg-teal-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        <span><strong>Automatic Page Numbering:</strong> Generate sequential page numbers with customizable formats and positioning options</span>
                      </li>
                      <li className="flex items-start">
                        <span className="w-2 h-2 bg-teal-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        <span><strong>Alignment Control:</strong> Position text elements left, center, or right within headers and footers</span>
                      </li>
                      <li className="flex items-start">
                        <span className="w-2 h-2 bg-teal-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        <span><strong>Font Customization:</strong> Adjust font sizes from 6pt to 24pt and choose custom colors for optimal readability</span>
                      </li>
                      <li className="flex items-start">
                        <span className="w-2 h-2 bg-teal-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        <span><strong>Margin Adjustments:</strong> Fine-tune top and bottom margins to ensure proper spacing and document layout</span>
                      </li>
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="text-2xl font-semibold text-gray-900 mb-4">Professional Benefits</h3>
                    <ul className="space-y-3 text-gray-700">
                      <li className="flex items-start">
                        <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        <span><strong>Brand Consistency:</strong> Maintain uniform branding across all document pages with consistent header and footer elements</span>
                      </li>
                      <li className="flex items-start">
                        <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        <span><strong>Document Navigation:</strong> Improve reader experience with clear page numbering and document structure indicators</span>
                      </li>
                      <li className="flex items-start">
                        <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        <span><strong>Professional Presentation:</strong> Enhance document credibility with properly formatted headers and footers</span>
                      </li>
                      <li className="flex items-start">
                        <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        <span><strong>Legal Compliance:</strong> Add required disclaimers, copyright notices, and confidentiality statements</span>
                      </li>
                      <li className="flex items-start">
                        <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        <span><strong>Batch Processing:</strong> Apply consistent formatting to multiple documents efficiently</span>
                      </li>
                      <li className="flex items-start">
                        <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        <span><strong>Version Control:</strong> Include document versions, dates, and revision information in headers or footers</span>
                      </li>
                    </ul>
                  </div>
                </div>

                {/* Use Cases */}
                <div>
                  <h3 className="text-2xl font-semibold text-gray-900 mb-6">Common Use Cases for PDF Headers and Footers</h3>
                  <div className="grid md:grid-cols-3 gap-6">
                    <div className="bg-gray-50 rounded-lg p-6">
                      <h4 className="text-lg font-semibold text-gray-900 mb-3">Business Documents</h4>
                      <ul className="space-y-2 text-gray-700 text-sm">
                        <li>• Company annual reports</li>
                        <li>• Financial statements</li>
                        <li>• Business proposals</li>
                        <li>• Marketing materials</li>
                        <li>• Corporate presentations</li>
                        <li>• Meeting minutes</li>
                      </ul>
                    </div>
                    
                    <div className="bg-gray-50 rounded-lg p-6">
                      <h4 className="text-lg font-semibold text-gray-900 mb-3">Academic Papers</h4>
                      <ul className="space-y-2 text-gray-700 text-sm">
                        <li>• Research publications</li>
                        <li>• Thesis documents</li>
                        <li>• Study guides</li>
                        <li>• Course materials</li>
                        <li>• Academic journals</li>
                        <li>• Conference papers</li>
                      </ul>
                    </div>
                    
                    <div className="bg-gray-50 rounded-lg p-6">
                      <h4 className="text-lg font-semibold text-gray-900 mb-3">Legal Documents</h4>
                      <ul className="space-y-2 text-gray-700 text-sm">
                        <li>• Contracts and agreements</li>
                        <li>• Legal briefs</li>
                        <li>• Court filings</li>
                        <li>• Policy documents</li>
                        <li>• Compliance reports</li>
                        <li>• Legal correspondence</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Page Number Formats */}
                <div>
                  <h3 className="text-2xl font-semibold text-gray-900 mb-6">Page Numbering Options and Formats</h3>
                  <div className="bg-blue-50 rounded-lg p-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900 mb-4">Standard Number Formats</h4>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center bg-white rounded p-3">
                            <span className="text-gray-700">Simple numbering</span>
                            <code className="bg-gray-100 px-2 py-1 rounded text-sm">1</code>
                          </div>
                          <div className="flex justify-between items-center bg-white rounded p-3">
                            <span className="text-gray-700">Page of total</span>
                            <code className="bg-gray-100 px-2 py-1 rounded text-sm">Page 1 of 5</code>
                          </div>
                          <div className="flex justify-between items-center bg-white rounded p-3">
                            <span className="text-gray-700">Fraction format</span>
                            <code className="bg-gray-100 px-2 py-1 rounded text-sm">1 / 5</code>
                          </div>
                          <div className="flex justify-between items-center bg-white rounded p-3">
                            <span className="text-gray-700">Decorated format</span>
                            <code className="bg-gray-100 px-2 py-1 rounded text-sm">- 1 -</code>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900 mb-4">Positioning Options</h4>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between bg-white rounded p-3">
                            <span className="text-gray-700">Header position</span>
                            <span className="text-sm text-gray-500">Top of page</span>
                          </div>
                          <div className="flex items-center justify-between bg-white rounded p-3">
                            <span className="text-gray-700">Footer position</span>
                            <span className="text-sm text-gray-500">Bottom of page</span>
                          </div>
                          <div className="flex items-center justify-between bg-white rounded p-3">
                            <span className="text-gray-700">Left alignment</span>
                            <span className="text-sm text-gray-500">Left margin</span>
                          </div>
                          <div className="flex items-center justify-between bg-white rounded p-3">
                            <span className="text-gray-700">Center alignment</span>
                            <span className="text-sm text-gray-500">Page center</span>
                          </div>
                          <div className="flex items-center justify-between bg-white rounded p-3">
                            <span className="text-gray-700">Right alignment</span>
                            <span className="text-sm text-gray-500">Right margin</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Advanced Customization */}
                <div>
                  <h3 className="text-2xl font-semibold text-gray-900 mb-6">Advanced Customization Features</h3>
                  <div className="grid md:grid-cols-2 gap-8">
                    <div>
                      <h4 className="text-xl font-semibold text-gray-900 mb-4">Design Customization</h4>
                      <div className="space-y-4">
                        <div className="border-l-4 border-teal-500 pl-4">
                          <h5 className="font-semibold text-gray-900">Font Styling</h5>
                          <p className="text-gray-700 text-sm">Adjust font sizes from 6pt to 24pt for optimal readability and visual hierarchy</p>
                        </div>
                        <div className="border-l-4 border-teal-500 pl-4">
                          <h5 className="font-semibold text-gray-900">Color Selection</h5>
                          <p className="text-gray-700 text-sm">Choose from any color using hex codes or color picker for brand consistency</p>
                        </div>
                        <div className="border-l-4 border-teal-500 pl-4">
                          <h5 className="font-semibold text-gray-900">Margin Control</h5>
                          <p className="text-gray-700 text-sm">Fine-tune top and bottom margins from 10pt to 100pt for perfect spacing</p>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="text-xl font-semibold text-gray-900 mb-4">Content Options</h4>
                      <div className="space-y-4">
                        <div className="border-l-4 border-blue-500 pl-4">
                          <h5 className="font-semibold text-gray-900">Multi-line Text</h5>
                          <p className="text-gray-700 text-sm">Support for multi-line headers and footers with automatic text wrapping</p>
                        </div>
                        <div className="border-l-4 border-blue-500 pl-4">
                          <h5 className="font-semibold text-gray-900">First Page Exclusion</h5>
                          <p className="text-gray-700 text-sm">Option to exclude headers and footers from title pages or cover pages</p>
                        </div>
                        <div className="border-l-4 border-blue-500 pl-4">
                          <h5 className="font-semibold text-gray-900">Live Preview</h5>
                          <p className="text-gray-700 text-sm">Real-time preview showing exactly how your headers and footers will appear</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Best Practices */}
                <div className="bg-gradient-to-r from-teal-50 to-blue-50 rounded-xl p-8">
                  <h3 className="text-2xl font-semibold text-gray-900 mb-6">Best Practices for PDF Headers and Footers</h3>
                  <div className="grid md:grid-cols-2 gap-8">
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-4">Content Guidelines</h4>
                      <ul className="space-y-3 text-gray-700">
                        <li className="flex items-start">
                          <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                          <span>Keep header and footer text concise and relevant to document content</span>
                        </li>
                        <li className="flex items-start">
                          <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                          <span>Use consistent formatting across all pages for professional appearance</span>
                        </li>
                        <li className="flex items-start">
                          <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                          <span>Include essential information like document title, author, or page numbers</span>
                        </li>
                        <li className="flex items-start">
                          <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                          <span>Consider excluding headers/footers from title pages or cover sheets</span>
                        </li>
                      </ul>
                    </div>
                    
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-4">Design Recommendations</h4>
                      <ul className="space-y-3 text-gray-700">
                        <li className="flex items-start">
                          <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                          <span>Use readable font sizes (10-12pt) for optimal visibility</span>
                        </li>
                        <li className="flex items-start">
                          <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                          <span>Choose colors that contrast well with the document background</span>
                        </li>
                        <li className="flex items-start">
                          <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                          <span>Maintain adequate margins to prevent text from being cut off when printed</span>
                        </li>
                        <li className="flex items-start">
                          <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                          <span>Test different alignment options to find the best visual balance</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* FAQ Section */}
                <div>
                  <h3 className="text-2xl font-semibold text-gray-900 mb-6">Frequently Asked Questions</h3>
                  <div className="space-y-6">
                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                      <h4 className="text-lg font-semibold text-gray-900 mb-2">Can I add different headers and footers to different pages?</h4>
                      <p className="text-gray-700">Currently, our tool applies the same header and footer design to all pages (except the first page if excluded). For more complex layouts with different headers per section, you may need specialized PDF editing software.</p>
                    </div>
                    
                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                      <h4 className="text-lg font-semibold text-gray-900 mb-2">What file size limits apply to PDF header/footer generation?</h4>
                      <p className="text-gray-700">Our tool can handle PDF files up to 50MB in size. For larger files, consider compressing your PDF first or splitting it into smaller sections for processing.</p>
                    </div>
                    
                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                      <h4 className="text-lg font-semibold text-gray-900 mb-2">Will adding headers and footers affect the original document quality?</h4>
                      <p className="text-gray-700">No, our tool preserves the original document quality while adding headers and footers. The process maintains the PDF's resolution, fonts, and formatting without compression or quality loss.</p>
                    </div>
                    
                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                      <h4 className="text-lg font-semibold text-gray-900 mb-2">Can I preview how the headers and footers will look before processing?</h4>
                      <p className="text-gray-700">Yes, our tool includes a real-time preview feature that shows exactly how your headers, footers, and page numbers will appear on your document pages.</p>
                    </div>
                    
                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                      <h4 className="text-lg font-semibold text-gray-900 mb-2">Is it possible to add images or logos to headers and footers?</h4>
                      <p className="text-gray-700">Currently, our tool supports text-based headers and footers with customizable fonts, colors, and alignment. Image insertion in headers and footers is planned for future updates.</p>
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

export default PDFHeaderFooterGenerator;
