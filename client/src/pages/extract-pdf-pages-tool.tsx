import { useState, useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { PDFDocument } from 'pdf-lib';
import { Upload, FileText, Download, Trash2, FileOutput, FileStack } from 'lucide-react';

interface PDFFile {
  id: string;
  file: File;
  name: string;
  size: string;
  pages: number;
}

interface PageSelection {
  [key: number]: boolean;
}

const ExtractPDFPagesTool = () => {
  const [pdfFile, setPdfFile] = useState<PDFFile | null>(null);
  const [extractedPdfUrl, setExtractedPdfUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [pageSelection, setPageSelection] = useState<PageSelection>({});
  const [pageRange, setPageRange] = useState('');
  const [extractionMode, setExtractionMode] = useState<'range' | 'individual'>('individual');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const generateId = (): string => {
    return Math.random().toString(36).substr(2, 9);
  };

  const getPageCount = async (file: File): Promise<number> => {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await PDFDocument.load(arrayBuffer);
      return pdf.getPageCount();
    } catch {
      return 0;
    }
  };

  const handleFileSelect = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const file = files[0];
    if (file.type === 'application/pdf') {
      const pages = await getPageCount(file);
      setPdfFile({
        id: generateId(),
        file,
        name: file.name,
        size: formatFileSize(file.size),
        pages
      });
      setPageSelection({});
      setPageRange('');
      setExtractedPdfUrl(null);
    } else {
      alert('Please select a valid PDF file.');
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

  const handlePageToggle = (pageNum: number) => {
    setPageSelection(prev => ({
      ...prev,
      [pageNum]: !prev[pageNum]
    }));
  };

  const handleSelectAll = () => {
    if (!pdfFile) return;
    const allSelected = Object.keys(pageSelection).length === pdfFile.pages && 
                       Object.values(pageSelection).every(selected => selected);
    
    if (allSelected) {
      setPageSelection({});
    } else {
      const newSelection: PageSelection = {};
      for (let i = 1; i <= pdfFile.pages; i++) {
        newSelection[i] = true;
      }
      setPageSelection(newSelection);
    }
  };

  const parsePageRange = (range: string): number[] => {
    const pages: number[] = [];
    const parts = range.split(',');
    
    for (const part of parts) {
      const trimmed = part.trim();
      if (trimmed.includes('-')) {
        const [start, end] = trimmed.split('-').map(n => parseInt(n.trim()));
        if (!isNaN(start) && !isNaN(end) && start <= end) {
          for (let i = start; i <= end; i++) {
            if (i >= 1 && i <= (pdfFile?.pages || 0)) {
              pages.push(i);
            }
          }
        }
      } else {
        const pageNum = parseInt(trimmed);
        if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= (pdfFile?.pages || 0)) {
          pages.push(pageNum);
        }
      }
    }
    
    return Array.from(new Set(pages)).sort((a, b) => a - b);
  };

  const getSelectedPages = (): number[] => {
    if (extractionMode === 'range') {
      return parsePageRange(pageRange);
    } else {
      return Object.entries(pageSelection)
        .filter(([_, selected]) => selected)
        .map(([pageNum, _]) => parseInt(pageNum))
        .sort((a, b) => a - b);
    }
  };

  const extractPages = async () => {
    if (!pdfFile) return;

    const selectedPages = getSelectedPages();
    if (selectedPages.length === 0) {
      alert('Please select at least one page to extract.');
      return;
    }

    setIsProcessing(true);
    
    try {
      const arrayBuffer = await pdfFile.file.arrayBuffer();
      const sourcePdf = await PDFDocument.load(arrayBuffer);
      const newPdf = await PDFDocument.create();

      for (const pageNum of selectedPages) {
        const [page] = await newPdf.copyPages(sourcePdf, [pageNum - 1]);
        newPdf.addPage(page);
      }

      const pdfBytes = await newPdf.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      setExtractedPdfUrl(url);
    } catch (error) {
      console.error('Error extracting pages from PDF:', error);
      alert('Error extracting pages from PDF. Please try again with a valid PDF file.');
    }

    setIsProcessing(false);
  };

  const downloadExtractedPDF = () => {
    if (!extractedPdfUrl || !pdfFile) return;

    const selectedPages = getSelectedPages();
    const link = document.createElement('a');
    link.href = extractedPdfUrl;
    link.download = `extracted-pages-${pdfFile.name}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const resetTool = () => {
    setPdfFile(null);
    setExtractedPdfUrl(null);
    setPageSelection({});
    setPageRange('');
    if (extractedPdfUrl) {
      URL.revokeObjectURL(extractedPdfUrl);
    }
  };

  const selectedPagesCount = getSelectedPages().length;

  return (
    <>
      <Helmet>
        <title>Extract Pages from PDF - Free Online PDF Page Extractor | ToolsHub</title>
        <meta name="description" content="Extract specific pages from PDF documents for free. Select individual pages or page ranges and download as a new PDF file. No registration required." />
        <meta name="keywords" content="extract PDF pages, PDF page extractor, split PDF pages, PDF page selector, extract specific pages" />
        <meta property="og:title" content="Extract Pages from PDF - Free Online PDF Page Extractor | ToolsHub" />
        <meta property="og:description" content="Extract specific pages from PDF documents for free. Select pages and download as a new PDF." />
        <meta property="og:type" content="website" />
        <link rel="canonical" href="/tools/extract-pdf-pages" />
      </Helmet>

      <div className="min-h-screen flex flex-col" data-testid="page-extract-pdf-pages">
        <Header />
        
        <main className="flex-1 bg-neutral-50">
          {/* Hero Section */}
          <section className="bg-gradient-to-r from-purple-600 via-purple-500 to-indigo-700 text-white py-16">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <div className="w-20 h-20 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <FileOutput className="w-8 h-8" />
              </div>
              <h1 className="text-4xl sm:text-5xl font-bold mb-6" data-testid="text-page-title">
                Extract Pages from PDF
              </h1>
              <p className="text-xl text-purple-100 max-w-2xl mx-auto">
                Select and extract specific pages from your PDF documents. Choose individual pages or page ranges to create a new PDF.
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
                            ? 'border-purple-500 bg-purple-50' 
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
                          className="bg-purple-600 hover:bg-purple-700 text-white"
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

                    {/* Selected File */}
                    {pdfFile && (
                      <div>
                        <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg mb-6">
                          <FileText className="w-6 h-6 text-red-600" />
                          <div className="flex-1">
                            <div className="font-medium text-gray-900">{pdfFile.name}</div>
                            <div className="text-sm text-gray-600">
                              {pdfFile.size} • {pdfFile.pages} pages
                            </div>
                          </div>
                          <Button
                            onClick={resetTool}
                            variant="outline"
                            size="sm"
                            className="text-red-600 border-red-200 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Remove
                          </Button>
                        </div>

                        {/* Page Selection Mode */}
                        <div className="mb-6">
                          <h3 className="text-lg font-medium text-gray-900 mb-4">Select Pages to Extract</h3>
                          
                          <div className="flex gap-4 mb-4">
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="radio"
                                name="extractionMode"
                                value="individual"
                                checked={extractionMode === 'individual'}
                                onChange={(e) => setExtractionMode(e.target.value as 'individual')}
                                className="text-purple-600"
                              />
                              <span className="text-sm font-medium text-gray-700">Individual Pages</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="radio"
                                name="extractionMode"
                                value="range"
                                checked={extractionMode === 'range'}
                                onChange={(e) => setExtractionMode(e.target.value as 'range')}
                                className="text-purple-600"
                              />
                              <span className="text-sm font-medium text-gray-700">Page Range</span>
                            </label>
                          </div>

                          {extractionMode === 'range' ? (
                            <div>
                              <Label htmlFor="page-range" className="text-sm font-medium text-gray-700">
                                Page Range (e.g., 1-3, 5, 7-9)
                              </Label>
                              <Input
                                id="page-range"
                                value={pageRange}
                                onChange={(e) => setPageRange(e.target.value)}
                                placeholder="1-3, 5, 7-9"
                                className="mt-1"
                              />
                              <p className="text-xs text-gray-500 mt-1">
                                Use commas to separate individual pages or ranges. Example: 1-3, 5, 7-9
                              </p>
                            </div>
                          ) : (
                            <div>
                              <div className="flex justify-between items-center mb-4">
                                <span className="text-sm text-gray-600">
                                  {selectedPagesCount} of {pdfFile.pages} pages selected
                                </span>
                                <Button
                                  onClick={handleSelectAll}
                                  variant="outline"
                                  size="sm"
                                  className="text-purple-600 border-purple-200 hover:bg-purple-50"
                                >
                                  {Object.keys(pageSelection).length === pdfFile.pages && 
                                   Object.values(pageSelection).every(selected => selected) 
                                    ? 'Deselect All' : 'Select All'}
                                </Button>
                              </div>
                              
                              <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-12 gap-2 max-h-64 overflow-y-auto p-2 border rounded-lg">
                                {Array.from({ length: pdfFile.pages }, (_, i) => i + 1).map((pageNum) => (
                                  <div key={pageNum} className="flex items-center space-x-2">
                                    <Checkbox
                                      id={`page-${pageNum}`}
                                      checked={!!pageSelection[pageNum]}
                                      onCheckedChange={() => handlePageToggle(pageNum)}
                                      className="text-purple-600"
                                    />
                                    <Label 
                                      htmlFor={`page-${pageNum}`} 
                                      className="text-sm cursor-pointer hover:text-purple-600"
                                    >
                                      {pageNum}
                                    </Label>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Extract Button */}
                        {selectedPagesCount > 0 && (
                          <div className="text-center">
                            <Button
                              onClick={extractPages}
                              disabled={isProcessing}
                              className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 text-lg"
                              data-testid="button-extract"
                            >
                              {isProcessing ? (
                                <>
                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                  Extracting Pages...
                                </>
                              ) : (
                                <>
                                  <FileOutput className="w-4 h-4 mr-2" />
                                  Extract {selectedPagesCount} Page{selectedPagesCount !== 1 ? 's' : ''}
                                </>
                              )}
                            </Button>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Results Section */}
                    {extractedPdfUrl && (
                      <div className="bg-green-50 rounded-xl p-6 text-center" data-testid="extract-results">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <i className="fas fa-check text-2xl text-green-600"></i>
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">
                          Pages Extracted Successfully!
                        </h3>
                        <p className="text-gray-600 mb-6">
                          {selectedPagesCount} page{selectedPagesCount !== 1 ? 's' : ''} extracted from your PDF document.
                        </p>
                        <Button
                          onClick={downloadExtractedPDF}
                          className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3"
                          data-testid="button-download"
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Download Extracted PDF
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
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">How to Extract Pages from PDF</h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Upload className="w-8 h-8 text-purple-600" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">1. Upload PDF</h3>
                      <p className="text-gray-600">
                        Drag and drop your PDF file or click to select it from your computer.
                      </p>
                    </div>
                    
                    <div className="text-center">
                      <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <FileStack className="w-8 h-8 text-blue-600" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">2. Select Pages</h3>
                      <p className="text-gray-600">
                        Choose individual pages or specify page ranges to extract from your PDF.
                      </p>
                    </div>
                    
                    <div className="text-center">
                      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Download className="w-8 h-8 text-green-600" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">3. Download</h3>
                      <p className="text-gray-600">
                        Extract selected pages and download your new PDF file instantly.
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
                        <h3 className="font-semibold text-gray-900">Individual Page Selection</h3>
                        <p className="text-gray-600 text-sm">Select specific pages with checkboxes for precise control.</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mr-3 mt-1">
                        <i className="fas fa-check text-xs text-green-600"></i>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">Page Range Support</h3>
                        <p className="text-gray-600 text-sm">Extract page ranges using comma-separated notation (1-3, 5, 7-9).</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mr-3 mt-1">
                        <i className="fas fa-check text-xs text-green-600"></i>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">Bulk Operations</h3>
                        <p className="text-gray-600 text-sm">Select all or deselect all pages with one click.</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mr-3 mt-1">
                        <i className="fas fa-check text-xs text-green-600"></i>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">Quality Preservation</h3>
                        <p className="text-gray-600 text-sm">Extracted pages maintain original quality and formatting.</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Use Cases */}
                <div className="bg-white rounded-2xl shadow-lg p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Common Use Cases</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="bg-purple-50 rounded-lg p-4">
                      <h3 className="font-semibold text-gray-900 mb-2">📄 Document Sections</h3>
                      <p className="text-sm text-gray-600">Extract specific chapters or sections from large documents.</p>
                    </div>
                    
                    <div className="bg-blue-50 rounded-lg p-4">
                      <h3 className="font-semibold text-gray-900 mb-2">📋 Report Highlights</h3>
                      <p className="text-sm text-gray-600">Extract key pages from reports for quick sharing.</p>
                    </div>
                    
                    <div className="bg-green-50 rounded-lg p-4">
                      <h3 className="font-semibold text-gray-900 mb-2">📚 Study Materials</h3>
                      <p className="text-sm text-gray-600">Extract specific pages from textbooks for focused study.</p>
                    </div>
                    
                    <div className="bg-orange-50 rounded-lg p-4">
                      <h3 className="font-semibold text-gray-900 mb-2">📊 Data Sheets</h3>
                      <p className="text-sm text-gray-600">Extract charts and tables from comprehensive reports.</p>
                    </div>
                    
                    <div className="bg-red-50 rounded-lg p-4">
                      <h3 className="font-semibold text-gray-900 mb-2">✂️ Page Cleanup</h3>
                      <p className="text-sm text-gray-600">Remove unwanted pages and keep only relevant content.</p>
                    </div>
                    
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h3 className="font-semibold text-gray-900 mb-2">📱 Mobile Sharing</h3>
                      <p className="text-sm text-gray-600">Create smaller files for easier mobile sharing.</p>
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

export default ExtractPDFPagesTool;