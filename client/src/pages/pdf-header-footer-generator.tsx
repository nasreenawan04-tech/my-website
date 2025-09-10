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
                    <p>
                      Unlike basic PDF editors that require complex software installations, our online PDF header footer generator works directly in your browser, providing instant results without compromising document quality. The tool seamlessly integrates with our other <a href="/tools/pdf-tools" className="text-teal-600 hover:text-teal-700 underline">PDF manipulation tools</a>, allowing you to create comprehensive document workflows from <a href="/tools/merge-pdf-tool" className="text-teal-600 hover:text-teal-700 underline">merging PDFs</a> to <a href="/tools/add-page-numbers-tool" className="text-teal-600 hover:text-teal-700 underline">adding page numbers</a> and applying professional formatting.
                    </p>
                  </div>
                </div>

                {/* How It Works */}
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-6">How Does the PDF Header/Footer Generator Work?</h2>
                  <div className="grid md:grid-cols-2 gap-8">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-4">Simple Process, Professional Results</h3>
                      <div className="space-y-4">
                        <div className="flex items-start space-x-3">
                          <div className="w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                            <span className="text-teal-600 font-bold text-sm">1</span>
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900">Upload Your PDF</h4>
                            <p className="text-gray-600 text-sm">Drag and drop your PDF file or click to browse. Our tool supports files up to 50MB and maintains original quality throughout the process.</p>
                          </div>
                        </div>
                        
                        <div className="flex items-start space-x-3">
                          <div className="w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                            <span className="text-teal-600 font-bold text-sm">2</span>
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900">Customize Content</h4>
                            <p className="text-gray-600 text-sm">Add your custom header and footer text, choose alignment options, and configure page numbering formats to match your document style.</p>
                          </div>
                        </div>
                        
                        <div className="flex items-start space-x-3">
                          <div className="w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                            <span className="text-teal-600 font-bold text-sm">3</span>
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900">Style and Format</h4>
                            <p className="text-gray-600 text-sm">Adjust font sizes, colors, margins, and positioning. Use our live preview to see exactly how your headers and footers will appear.</p>
                          </div>
                        </div>
                        
                        <div className="flex items-start space-x-3">
                          <div className="w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                            <span className="text-teal-600 font-bold text-sm">4</span>
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900">Generate & Download</h4>
                            <p className="text-gray-600 text-sm">Click generate to process your PDF with the new headers and footers, then download your professionally formatted document.</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-gradient-to-br from-teal-50 to-blue-50 rounded-xl p-6">
                      <h3 className="text-xl font-semibold text-gray-900 mb-4">Key Technical Features</h3>
                      <ul className="space-y-3 text-gray-700">
                        <li className="flex items-center">
                          <i className="fas fa-check-circle text-teal-500 mr-3"></i>
                          <span>Browser-based processing with no software installation required</span>
                        </li>
                        <li className="flex items-center">
                          <i className="fas fa-check-circle text-teal-500 mr-3"></i>
                          <span>Preserves original PDF quality and formatting</span>
                        </li>
                        <li className="flex items-center">
                          <i className="fas fa-check-circle text-teal-500 mr-3"></i>
                          <span>Real-time preview before applying changes</span>
                        </li>
                        <li className="flex items-center">
                          <i className="fas fa-check-circle text-teal-500 mr-3"></i>
                          <span>Support for multi-line text in headers and footers</span>
                        </li>
                        <li className="flex items-center">
                          <i className="fas fa-check-circle text-teal-500 mr-3"></i>
                          <span>Automatic page counting and numbering</span>
                        </li>
                        <li className="flex items-center">
                          <i className="fas fa-check-circle text-teal-500 mr-3"></i>
                          <span>Option to exclude title pages from headers/footers</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Benefits for Different Audiences */}
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-6">Benefits for Every Professional Need</h2>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {/* Students */}
                    <div className="bg-blue-50 rounded-xl p-6">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                        <i className="fas fa-graduation-cap text-blue-600 text-xl"></i>
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-4">For Students & Academics</h3>
                      <ul className="space-y-2 text-gray-700 text-sm">
                        <li>• Add proper citations and author information to research papers</li>
                        <li>• Include thesis titles and chapter numbers in headers</li>
                        <li>• Format academic papers according to APA, MLA, or Chicago style</li>
                        <li>• Add page numbers required for academic submissions</li>
                        <li>• Include course information and assignment details</li>
                        <li>• Create professional-looking term papers and dissertations</li>
                      </ul>
                      <div className="mt-4 pt-4 border-t border-blue-200">
                        <p className="text-xs text-blue-600">
                          <strong>Pro Tip:</strong> Combine with our <a href="/tools/merge-pdf-tool" className="hover:underline">PDF merger</a> to create complete academic portfolios.
                        </p>
                      </div>
                    </div>

                    {/* Business Professionals */}
                    <div className="bg-green-50 rounded-xl p-6">
                      <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                        <i className="fas fa-briefcase text-green-600 text-xl"></i>
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-4">For Business Professionals</h3>
                      <ul className="space-y-2 text-gray-700 text-sm">
                        <li>• Brand reports with company logos and contact information</li>
                        <li>• Add confidentiality notices to sensitive documents</li>
                        <li>• Include document versions and revision dates</li>
                        <li>• Create consistent formatting across team presentations</li>
                        <li>• Add client information to customized proposals</li>
                        <li>• Include meeting dates and project references</li>
                      </ul>
                      <div className="mt-4 pt-4 border-t border-green-200">
                        <p className="text-xs text-green-600">
                          <strong>Pro Tip:</strong> Use with our <a href="/tools/protect-pdf-tool" className="hover:underline">PDF protection tool</a> to secure business documents.
                        </p>
                      </div>
                    </div>

                    {/* Legal Professionals */}
                    <div className="bg-purple-50 rounded-xl p-6">
                      <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                        <i className="fas fa-gavel text-purple-600 text-xl"></i>
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-4">For Legal Professionals</h3>
                      <ul className="space-y-2 text-gray-700 text-sm">
                        <li>• Add case numbers and court information to legal briefs</li>
                        <li>• Include attorney contact details in headers</li>
                        <li>• Add "CONFIDENTIAL" or "PRIVILEGED" footers</li>
                        <li>• Number pages for court filing requirements</li>
                        <li>• Include document dates and revision tracking</li>
                        <li>• Add firm branding to client communications</li>
                      </ul>
                      <div className="mt-4 pt-4 border-t border-purple-200">
                        <p className="text-xs text-purple-600">
                          <strong>Pro Tip:</strong> Combine with our <a href="/tools/pdf-redaction-tool" className="hover:underline">PDF redaction tool</a> for document privacy.
                        </p>
                      </div>
                    </div>

                    {/* Healthcare Professionals */}
                    <div className="bg-red-50 rounded-xl p-6">
                      <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                        <i className="fas fa-user-md text-red-600 text-xl"></i>
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-4">For Healthcare Professionals</h3>
                      <ul className="space-y-2 text-gray-700 text-sm">
                        <li>• Add HIPAA compliance notices to patient documents</li>
                        <li>• Include practice information in medical reports</li>
                        <li>• Add "CONFIDENTIAL MEDICAL RECORD" footers</li>
                        <li>• Number pages for medical chart organization</li>
                        <li>• Include patient identifiers in headers (when appropriate)</li>
                        <li>• Add regulatory compliance statements</li>
                      </ul>
                      <div className="mt-4 pt-4 border-t border-red-200">
                        <p className="text-xs text-red-600">
                          <strong>Pro Tip:</strong> Ensure HIPAA compliance with our <a href="/tools/watermark-pdf-tool" className="hover:underline">PDF watermarking tool</a>.
                        </p>
                      </div>
                    </div>

                    {/* Researchers */}
                    <div className="bg-yellow-50 rounded-xl p-6">
                      <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mb-4">
                        <i className="fas fa-flask text-yellow-600 text-xl"></i>
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-4">For Researchers</h3>
                      <ul className="space-y-2 text-gray-700 text-sm">
                        <li>• Add study identifiers and protocol numbers</li>
                        <li>• Include institutional affiliations in headers</li>
                        <li>• Add "DRAFT" or "FINAL" status indicators</li>
                        <li>• Number pages for research documentation</li>
                        <li>• Include funding acknowledgments</li>
                        <li>• Add version control for collaborative research</li>
                      </ul>
                      <div className="mt-4 pt-4 border-t border-yellow-200">
                        <p className="text-xs text-yellow-600">
                          <strong>Pro Tip:</strong> Organize research documents with our <a href="/tools/organize-pdf-pages-tool" className="hover:underline">PDF page organizer</a>.
                        </p>
                      </div>
                    </div>

                    {/* Content Creators */}
                    <div className="bg-indigo-50 rounded-xl p-6">
                      <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                        <i className="fas fa-pencil-alt text-indigo-600 text-xl"></i>
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-4">For Content Creators</h3>
                      <ul className="space-y-2 text-gray-700 text-sm">
                        <li>• Brand ebooks with author information and website</li>
                        <li>• Add copyright notices to digital publications</li>
                        <li>• Include social media handles and contact info</li>
                        <li>• Number pages for professional presentation</li>
                        <li>• Add publication dates and version numbers</li>
                        <li>• Include QR codes or website links in footers</li>
                      </ul>
                      <div className="mt-4 pt-4 border-t border-indigo-200">
                        <p className="text-xs text-indigo-600">
                          <strong>Pro Tip:</strong> Create professional ebooks using our <a href="/tools/images-to-pdf-merger" className="hover:underline">images to PDF tool</a>.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Practical Use Cases */}
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-6">Real-World Applications and Use Cases</h2>
                  <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-8">
                    <div className="grid md:grid-cols-2 gap-8">
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-6">Professional Documentation</h3>
                        <div className="space-y-4">
                          <div className="bg-white rounded-lg p-4 shadow-sm">
                            <h4 className="font-semibold text-gray-900 mb-2">Annual Reports & Financial Documents</h4>
                            <p className="text-gray-600 text-sm mb-2">Add company branding, report periods, and page numbering to create professional annual reports.</p>
                            <div className="text-xs text-blue-600">
                              Related: <a href="/tools/pdf-page-counter" className="hover:underline">PDF Page Counter</a> | <a href="/tools/compress-pdf-tool" className="hover:underline">PDF Compressor</a>
                            </div>
                          </div>
                          
                          <div className="bg-white rounded-lg p-4 shadow-sm">
                            <h4 className="font-semibold text-gray-900 mb-2">Contract Management</h4>
                            <p className="text-gray-600 text-sm mb-2">Include contract numbers, effective dates, and confidentiality notices in legal agreements.</p>
                            <div className="text-xs text-blue-600">
                              Related: <a href="/tools/pdf-redaction-tool" className="hover:underline">PDF Redaction</a> | <a href="/tools/unlock-pdf-tool" className="hover:underline">Unlock PDF</a>
                            </div>
                          </div>
                          
                          <div className="bg-white rounded-lg p-4 shadow-sm">
                            <h4 className="font-semibold text-gray-900 mb-2">Marketing Materials</h4>
                            <p className="text-gray-600 text-sm mb-2">Brand brochures, whitepapers, and case studies with consistent company information.</p>
                            <div className="text-xs text-blue-600">
                              Related: <a href="/tools/watermark-pdf-tool" className="hover:underline">PDF Watermark</a> | <a href="/tools/pdf-background-changer" className="hover:underline">Background Changer</a>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-6">Academic & Educational</h3>
                        <div className="space-y-4">
                          <div className="bg-white rounded-lg p-4 shadow-sm">
                            <h4 className="font-semibold text-gray-900 mb-2">Thesis & Dissertation Formatting</h4>
                            <p className="text-gray-600 text-sm mb-2">Add chapter titles, author names, and page numbers according to academic style guides.</p>
                            <div className="text-xs text-blue-600">
                              Related: <a href="/tools/extract-pdf-pages-tool" className="hover:underline">Extract Pages</a> | <a href="/tools/pdf-margin-adjuster" className="hover:underline">Margin Adjuster</a>
                            </div>
                          </div>
                          
                          <div className="bg-white rounded-lg p-4 shadow-sm">
                            <h4 className="font-semibold text-gray-900 mb-2">Research Publications</h4>
                            <p className="text-gray-600 text-sm mb-2">Include journal information, DOI numbers, and institutional affiliations.</p>
                            <div className="text-xs text-blue-600">
                              Related: <a href="/tools/pdf-bookmark-extractor" className="hover:underline">Bookmark Extractor</a> | <a href="/tools/split-pdf-tool" className="hover:underline">Split PDF</a>
                            </div>
                          </div>
                          
                          <div className="bg-white rounded-lg p-4 shadow-sm">
                            <h4 className="font-semibold text-gray-900 mb-2">Course Materials & Handouts</h4>
                            <p className="text-gray-600 text-sm mb-2">Brand educational materials with course information, semester details, and instructor contact.</p>
                            <div className="text-xs text-blue-600">
                              Related: <a href="/tools/rotate-pdf-tool" className="hover:underline">Rotate PDF</a> | <a href="/tools/pdf-page-resizer" className="hover:underline">Page Resizer</a>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
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

                {/* SEO Integration Section */}
                <div className="bg-gradient-to-r from-teal-50 to-blue-50 rounded-xl p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Complete PDF Workflow Solutions</h2>
                  <p className="text-lg text-gray-700 mb-6">
                    Maximize your document productivity by combining our PDF Header/Footer Generator with other powerful PDF tools for comprehensive document management.
                  </p>
                  
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
                      <h3 className="font-semibold text-gray-900 mb-2">Document Preparation Workflow</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center text-gray-600">
                          <span className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center text-xs font-bold text-blue-600 mr-2">1</span>
                          <a href="/tools/merge-pdf-tool" className="hover:text-blue-600 hover:underline">Merge multiple PDFs</a>
                        </div>
                        <div className="flex items-center text-gray-600">
                          <span className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center text-xs font-bold text-green-600 mr-2">2</span>
                          <span>Add headers/footers (current tool)</span>
                        </div>
                        <div className="flex items-center text-gray-600">
                          <span className="w-5 h-5 bg-purple-100 rounded-full flex items-center justify-center text-xs font-bold text-purple-600 mr-2">3</span>
                          <a href="/tools/add-page-numbers-tool" className="hover:text-purple-600 hover:underline">Enhance with page numbers</a>
                        </div>
                        <div className="flex items-center text-gray-600">
                          <span className="w-5 h-5 bg-orange-100 rounded-full flex items-center justify-center text-xs font-bold text-orange-600 mr-2">4</span>
                          <a href="/tools/protect-pdf-tool" className="hover:text-orange-600 hover:underline">Secure final document</a>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
                      <h3 className="font-semibold text-gray-900 mb-2">Professional Enhancement</h3>
                      <div className="space-y-2 text-sm">
                        <a href="/tools/watermark-pdf-tool" className="block text-blue-600 hover:text-blue-700 hover:underline">
                          <i className="fas fa-stamp w-4 mr-2"></i>Add PDF Watermarks
                        </a>
                        <a href="/tools/pdf-background-changer" className="block text-green-600 hover:text-green-700 hover:underline">
                          <i className="fas fa-palette w-4 mr-2"></i>Change Background Colors
                        </a>
                        <a href="/tools/pdf-margin-adjuster" className="block text-purple-600 hover:text-purple-700 hover:underline">
                          <i className="fas fa-crop w-4 mr-2"></i>Adjust Document Margins
                        </a>
                        <a href="/tools/compress-pdf-tool" className="block text-orange-600 hover:text-orange-700 hover:underline">
                          <i className="fas fa-compress w-4 mr-2"></i>Compress File Size
                        </a>
                      </div>
                    </div>
                    
                    <div className="bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
                      <h3 className="font-semibold text-gray-900 mb-2">Document Organization</h3>
                      <div className="space-y-2 text-sm">
                        <a href="/tools/organize-pdf-pages-tool" className="block text-blue-600 hover:text-blue-700 hover:underline">
                          <i className="fas fa-sort w-4 mr-2"></i>Organize PDF Pages
                        </a>
                        <a href="/tools/extract-pdf-pages-tool" className="block text-green-600 hover:text-green-700 hover:underline">
                          <i className="fas fa-file-export w-4 mr-2"></i>Extract Specific Pages
                        </a>
                        <a href="/tools/split-pdf-tool" className="block text-purple-600 hover:text-purple-700 hover:underline">
                          <i className="fas fa-cut w-4 mr-2"></i>Split Large Documents
                        </a>
                        <a href="/tools/pdf-page-counter" className="block text-orange-600 hover:text-orange-700 hover:underline">
                          <i className="fas fa-info w-4 mr-2"></i>Get Document Info
                        </a>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-8 text-center">
                    <a href="/tools/pdf-tools" className="inline-flex items-center px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white font-medium rounded-lg transition-colors">
                      <i className="fas fa-tools mr-2"></i>
                      Explore All PDF Tools
                    </a>
                  </div>
                </div>

                {/* FAQ Section */}
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Frequently Asked Questions</h2>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-6">
                      <div className="bg-white rounded-lg border border-gray-200 p-6">
                        <h4 className="text-lg font-semibold text-gray-900 mb-2">Can I add different headers and footers to different pages?</h4>
                        <p className="text-gray-700">Currently, our tool applies the same header and footer design to all pages (except the first page if excluded). For more complex layouts with different headers per section, you may need specialized PDF editing software.</p>
                      </div>
                      
                      <div className="bg-white rounded-lg border border-gray-200 p-6">
                        <h4 className="text-lg font-semibold text-gray-900 mb-2">What file size limits apply to PDF header/footer generation?</h4>
                        <p className="text-gray-700">Our tool can handle PDF files up to 50MB in size. For larger files, consider using our <a href="/tools/compress-pdf-tool" className="text-teal-600 hover:text-teal-700 underline">PDF compressor</a> first or <a href="/tools/split-pdf-tool" className="text-teal-600 hover:text-teal-700 underline">splitting into smaller sections</a> for processing.</p>
                      </div>
                      
                      <div className="bg-white rounded-lg border border-gray-200 p-6">
                        <h4 className="text-lg font-semibold text-gray-900 mb-2">Will adding headers and footers affect the original document quality?</h4>
                        <p className="text-gray-700">No, our tool preserves the original document quality while adding headers and footers. The process maintains the PDF's resolution, fonts, and formatting without compression or quality loss.</p>
                      </div>
                      
                      <div className="bg-white rounded-lg border border-gray-200 p-6">
                        <h4 className="text-lg font-semibold text-gray-900 mb-2">How do I remove headers and footers after adding them?</h4>
                        <p className="text-gray-700">Once headers and footers are added, they become part of the PDF content. We recommend keeping a backup of your original file. You can use our <a href="/tools/pdf-editor" className="text-teal-600 hover:text-teal-700 underline">PDF editor</a> for more advanced modifications.</p>
                      </div>
                    </div>
                    
                    <div className="space-y-6">
                      <div className="bg-white rounded-lg border border-gray-200 p-6">
                        <h4 className="text-lg font-semibold text-gray-900 mb-2">Can I preview how the headers and footers will look before processing?</h4>
                        <p className="text-gray-700">Yes, our tool includes a real-time preview feature that shows exactly how your headers, footers, and page numbers will appear on your document pages.</p>
                      </div>
                      
                      <div className="bg-white rounded-lg border border-gray-200 p-6">
                        <h4 className="text-lg font-semibold text-gray-900 mb-2">Is it possible to add images or logos to headers and footers?</h4>
                        <p className="text-gray-700">Currently, our tool supports text-based headers and footers with customizable fonts, colors, and alignment. For image insertion, try our <a href="/tools/watermark-pdf-tool" className="text-teal-600 hover:text-teal-700 underline">PDF watermarking tool</a> which supports both text and image overlays.</p>
                      </div>
                      
                      <div className="bg-white rounded-lg border border-gray-200 p-6">
                        <h4 className="text-lg font-semibold text-gray-900 mb-2">Can I use this tool for batch processing multiple PDFs?</h4>
                        <p className="text-gray-700">Currently, the tool processes one PDF at a time. For multiple documents, you can save your settings and quickly apply them to each file. Consider using our <a href="/tools/merge-pdf-tool" className="text-teal-600 hover:text-teal-700 underline">PDF merger</a> to combine documents first if appropriate.</p>
                      </div>
                      
                      <div className="bg-white rounded-lg border border-gray-200 p-6">
                        <h4 className="text-lg font-semibold text-gray-900 mb-2">Are there any security or privacy concerns with uploading my PDFs?</h4>
                        <p className="text-gray-700">We prioritize your privacy and security. Uploaded files are processed securely and automatically deleted after processing. For sensitive documents, consider using our <a href="/tools/protect-pdf-tool" className="text-teal-600 hover:text-teal-700 underline">PDF password protection tool</a> before and after processing.</p>
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

export default PDFHeaderFooterGenerator;
