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

          {/* SEO Content Sections */}
          <section className="py-16 bg-white">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="space-y-12">
                {/* What is PDF Page Extraction */}
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-6">What is PDF Page Extraction and How Does It Work?</h2>
                  <div className="prose prose-lg max-w-none text-gray-700">
                    <p>
                      PDF page extraction is the process of selecting and separating specific pages from a larger PDF document to create a new, smaller PDF file containing only the desired content. This powerful document management technique allows users to isolate important information, reduce file sizes, and create focused documents from comprehensive source materials without compromising the original formatting or quality.
                    </p>
                    <p>
                      Our advanced PDF page extractor tool provides both individual page selection and range-based extraction capabilities, enabling users to efficiently extract single pages, consecutive page sequences, or complex page combinations using intuitive selection methods. Whether you need to extract a single contract page from a multi-document file or create a focused report from a comprehensive study, our tool maintains the original document structure, fonts, images, and layout integrity.
                    </p>
                    <p>
                      The extraction process works by parsing the PDF document structure, identifying individual page objects, and allowing precise selection through either checkbox-based individual selection or range-based notation (e.g., 1-5, 8, 10-12). Once pages are selected, our tool creates a new PDF document containing only the chosen pages while preserving all original attributes including hyperlinks, bookmarks, and interactive elements.
                    </p>
                  </div>
                </div>

                {/* Benefits for Different Audiences */}
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-6">Benefits and Use Cases for PDF Page Extraction</h2>
                  <div className="grid lg:grid-cols-2 gap-8">
                    <div>
                      <h3 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
                        <i className="fas fa-graduation-cap text-blue-600 mr-3"></i>
                        For Students and Researchers
                      </h3>
                      <div className="space-y-4">
                        <div className="bg-blue-50 rounded-lg p-4">
                          <h4 className="font-semibold text-gray-900 mb-2">📚 Study Material Organization</h4>
                          <p className="text-sm text-gray-600">Extract specific chapters from textbooks or research papers to create focused study guides. Perfect for exam preparation and literature reviews.</p>
                        </div>
                        <div className="bg-blue-50 rounded-lg p-4">
                          <h4 className="font-semibold text-gray-900 mb-2">📖 Citation and Reference Management</h4>
                          <p className="text-sm text-gray-600">Isolate relevant pages from academic sources for proper citation and easy reference management in research projects.</p>
                        </div>
                        <div className="bg-blue-50 rounded-lg p-4">
                          <h4 className="font-semibold text-gray-900 mb-2">🔬 Research Compilation</h4>
                          <p className="text-sm text-gray-600">Extract methodology sections, data tables, or specific findings from multiple research papers for comparative analysis.</p>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
                        <i className="fas fa-briefcase text-purple-600 mr-3"></i>
                        For Professionals and Business Owners
                      </h3>
                      <div className="space-y-4">
                        <div className="bg-purple-50 rounded-lg p-4">
                          <h4 className="font-semibold text-gray-900 mb-2">📋 Executive Summaries</h4>
                          <p className="text-sm text-gray-600">Extract key pages from comprehensive reports to create executive briefings for stakeholder presentations and decision-making.</p>
                        </div>
                        <div className="bg-purple-50 rounded-lg p-4">
                          <h4 className="font-semibold text-gray-900 mb-2">⚖️ Legal Document Processing</h4>
                          <p className="text-sm text-gray-600">Isolate specific contract clauses, terms, or schedules for legal review without sharing entire confidential agreements.</p>
                        </div>
                        <div className="bg-purple-50 rounded-lg p-4">
                          <h4 className="font-semibold text-gray-900 mb-2">📊 Proposal Development</h4>
                          <p className="text-sm text-gray-600">Extract successful proposal sections to create templates and reference materials for new business opportunities.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Related PDF Tools */}
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-6">Related PDF Management Tools</h2>
                  <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-8">
                    <p className="text-lg text-gray-700 mb-6">
                      Enhance your PDF workflow with our comprehensive suite of professional PDF tools. Each tool is designed to work seamlessly with extracted pages and other PDF documents.
                    </p>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <a href="/tools/split-pdf-tool" className="bg-white rounded-lg p-4 hover:shadow-md transition-shadow border border-gray-200">
                        <div className="flex items-center mb-2">
                          <i className="fas fa-scissors text-blue-600 mr-3"></i>
                          <h3 className="font-semibold text-gray-900">Split PDF Tool</h3>
                        </div>
                        <p className="text-sm text-gray-600">Divide PDF documents into multiple files by page ranges or intervals.</p>
                      </a>
                      <a href="/tools/merge-pdf-tool" className="bg-white rounded-lg p-4 hover:shadow-md transition-shadow border border-gray-200">
                        <div className="flex items-center mb-2">
                          <i className="fas fa-layer-group text-green-600 mr-3"></i>
                          <h3 className="font-semibold text-gray-900">Merge PDF Files</h3>
                        </div>
                        <p className="text-sm text-gray-600">Combine multiple PDF documents or extracted pages into a single file.</p>
                      </a>
                      <a href="/tools/organize-pdf-pages-tool" className="bg-white rounded-lg p-4 hover:shadow-md transition-shadow border border-gray-200">
                        <div className="flex items-center mb-2">
                          <i className="fas fa-sort text-purple-600 mr-3"></i>
                          <h3 className="font-semibold text-gray-900">Organize PDF Pages</h3>
                        </div>
                        <p className="text-sm text-gray-600">Reorder, duplicate, or delete pages within PDF documents.</p>
                      </a>
                      <a href="/tools/rotate-pdf-tool" className="bg-white rounded-lg p-4 hover:shadow-md transition-shadow border border-gray-200">
                        <div className="flex items-center mb-2">
                          <i className="fas fa-redo text-orange-600 mr-3"></i>
                          <h3 className="font-semibold text-gray-900">Rotate PDF Pages</h3>
                        </div>
                        <p className="text-sm text-gray-600">Fix page orientation by rotating extracted or existing PDF pages.</p>
                      </a>
                      <a href="/tools/pdf-compressor-advanced" className="bg-white rounded-lg p-4 hover:shadow-md transition-shadow border border-gray-200">
                        <div className="flex items-center mb-2">
                          <i className="fas fa-compress text-red-600 mr-3"></i>
                          <h3 className="font-semibold text-gray-900">Compress PDF</h3>
                        </div>
                        <p className="text-sm text-gray-600">Reduce file sizes of extracted pages while maintaining quality.</p>
                      </a>
                      <a href="/tools/add-page-numbers-tool" className="bg-white rounded-lg p-4 hover:shadow-md transition-shadow border border-gray-200">
                        <div className="flex items-center mb-2">
                          <i className="fas fa-list-ol text-indigo-600 mr-3"></i>
                          <h3 className="font-semibold text-gray-900">Add Page Numbers</h3>
                        </div>
                        <p className="text-sm text-gray-600">Add professional page numbering to extracted PDF pages.</p>
                      </a>
                    </div>
                  </div>
                </div>

                {/* Professional Workflows */}
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-6">Professional PDF Page Extraction Workflows</h2>
                  <div className="grid md:grid-cols-2 gap-8">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-4">Document Processing Efficiency</h3>
                      <ul className="space-y-3 text-gray-700">
                        <li className="flex items-start">
                          <span className="w-2 h-2 bg-purple-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                          <span><strong>Focused Content Creation:</strong> Extract only relevant pages for specific audiences or purposes, improving document relevance and reducing information overload</span>
                        </li>
                        <li className="flex items-start">
                          <span className="w-2 h-2 bg-purple-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                          <span><strong>File Size Optimization:</strong> Create smaller, more manageable documents from large source files, enabling faster sharing and reduced storage requirements</span>
                        </li>
                        <li className="flex items-start">
                          <span className="w-2 h-2 bg-purple-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                          <span><strong>Content Segmentation:</strong> Separate different topics or sections into individual documents for better organization and targeted distribution</span>
                        </li>
                        <li className="flex items-start">
                          <span className="w-2 h-2 bg-purple-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                          <span><strong>Version Control:</strong> Maintain specific document versions by extracting relevant pages, ensuring consistency across different document iterations</span>
                        </li>
                      </ul>
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-4">Industry-Specific Applications</h3>
                      <ul className="space-y-3 text-gray-700">
                        <li className="flex items-start">
                          <span className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                          <span><strong>Legal Practice:</strong> Extract specific contract clauses, court documents, or evidence pages while maintaining legal formatting and authenticity</span>
                        </li>
                        <li className="flex items-start">
                          <span className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                          <span><strong>Healthcare Documentation:</strong> Isolate patient records, test results, or specific medical report sections for focused analysis</span>
                        </li>
                        <li className="flex items-start">
                          <span className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                          <span><strong>Financial Services:</strong> Extract financial statements, audit reports, or compliance documentation for regulatory submissions</span>
                        </li>
                        <li className="flex items-start">
                          <span className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                          <span><strong>Educational Institutions:</strong> Create customized learning materials by extracting relevant textbook chapters or research paper sections</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Complete PDF Toolkit Integration */}
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-6">Complete PDF Management Ecosystem</h2>
                  <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-8">
                    <p className="text-lg text-gray-700 mb-6">
                      Our PDF page extraction tool integrates seamlessly with our comprehensive PDF toolkit, enabling complete document workflows from extraction to final processing.
                    </p>
                    <div className="grid lg:grid-cols-3 gap-6">
                      <div className="bg-white rounded-lg p-6 shadow-sm">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                          <i className="fas fa-shield-alt text-green-600 mr-2"></i>
                          Security & Protection Tools
                        </h3>
                        <div className="space-y-3">
                          <a href="/tools/protect-pdf-tool" className="flex items-center text-blue-600 hover:text-blue-700 text-sm">
                            <i className="fas fa-lock w-4 mr-2"></i>
                            Password Protect PDF
                          </a>
                          <a href="/tools/unlock-pdf-tool" className="flex items-center text-blue-600 hover:text-blue-700 text-sm">
                            <i className="fas fa-unlock w-4 mr-2"></i>
                            Remove PDF Password
                          </a>
                          <a href="/tools/watermark-pdf-tool" className="flex items-center text-blue-600 hover:text-blue-700 text-sm">
                            <i className="fas fa-stamp w-4 mr-2"></i>
                            Add PDF Watermark
                          </a>
                          <a href="/tools/pdf-redaction-tool" className="flex items-center text-blue-600 hover:text-blue-700 text-sm">
                            <i className="fas fa-eraser w-4 mr-2"></i>
                            PDF Redaction Tool
                          </a>
                        </div>
                      </div>
                      <div className="bg-white rounded-lg p-6 shadow-sm">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                          <i className="fas fa-edit text-purple-600 mr-2"></i>
                          Enhancement & Editing
                        </h3>
                        <div className="space-y-3">
                          <a href="/tools/pdf-editor" className="flex items-center text-blue-600 hover:text-blue-700 text-sm">
                            <i className="fas fa-edit w-4 mr-2"></i>
                            PDF Editor
                          </a>
                          <a href="/tools/pdf-header-footer-generator" className="flex items-center text-blue-600 hover:text-blue-700 text-sm">
                            <i className="fas fa-align-center w-4 mr-2"></i>
                            Add Headers & Footers
                          </a>
                          <a href="/tools/pdf-margin-adjuster" className="flex items-center text-blue-600 hover:text-blue-700 text-sm">
                            <i className="fas fa-expand-arrows-alt w-4 mr-2"></i>
                            Adjust PDF Margins
                          </a>
                          <a href="/tools/pdf-page-resizer" className="flex items-center text-blue-600 hover:text-blue-700 text-sm">
                            <i className="fas fa-expand w-4 mr-2"></i>
                            Resize PDF Pages
                          </a>
                        </div>
                      </div>
                      <div className="bg-white rounded-lg p-6 shadow-sm">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                          <i className="fas fa-search text-orange-600 mr-2"></i>
                          Analysis & Information
                        </h3>
                        <div className="space-y-3">
                          <a href="/tools/pdf-link-extractor" className="flex items-center text-blue-600 hover:text-blue-700 text-sm">
                            <i className="fas fa-link w-4 mr-2"></i>
                            Extract PDF Links
                          </a>
                          <a href="/tools/pdf-form-field-extractor" className="flex items-center text-blue-600 hover:text-blue-700 text-sm">
                            <i className="fas fa-wpforms w-4 mr-2"></i>
                            Extract Form Fields
                          </a>
                          <a href="/tools/pdf-bookmark-extractor" className="flex items-center text-blue-600 hover:text-blue-700 text-sm">
                            <i className="fas fa-bookmark w-4 mr-2"></i>
                            Extract PDF Bookmarks
                          </a>
                          <a href="/tools/pdf-comparison-tool" className="flex items-center text-blue-600 hover:text-blue-700 text-sm">
                            <i className="fas fa-not-equal w-4 mr-2"></i>
                            Compare PDF Files
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Advanced PDF Page Extraction Techniques */}
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-6">Advanced PDF Page Extraction Techniques</h2>
                  <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-8">
                    <div className="grid md:grid-cols-3 gap-6">
                      <div className="bg-white rounded-lg p-6 shadow-sm">
                        <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                          <FileStack className="w-6 h-6 text-purple-600" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-3">Individual Page Selection</h3>
                        <p className="text-gray-600 text-sm">
                          Use checkbox-based selection for precise control over individual pages. Perfect for non-consecutive page extraction and cherry-picking specific content from large documents.
                        </p>
                      </div>
                      <div className="bg-white rounded-lg p-6 shadow-sm">
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                          <FileOutput className="w-6 h-6 text-blue-600" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-3">Range-Based Extraction</h3>
                        <p className="text-gray-600 text-sm">
                          Utilize comma-separated notation (1-5, 8, 10-12) for complex extraction patterns. Ideal for extracting multiple sections or chapters while maintaining document flow.
                        </p>
                      </div>
                      <div className="bg-white rounded-lg p-6 shadow-sm">
                        <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                          <i className="fas fa-layer-group text-green-600"></i>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-3">Bulk Operations</h3>
                        <p className="text-gray-600 text-sm">
                          Perform select-all or deselect-all operations for efficient page management. Streamlines workflows when dealing with large documents requiring extensive page manipulation.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* PDF Page Extraction Best Practices */}
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-6">PDF Page Extraction Best Practices</h2>
                  <div className="space-y-6">
                    <div className="border-l-4 border-purple-500 pl-6 py-2">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Quality Preservation Guidelines</h3>
                      <p className="text-gray-700">
                        Always ensure that extracted pages maintain original resolution and formatting. Our tool preserves vector graphics, embedded fonts, and interactive elements to guarantee professional-quality output that matches the source document's appearance and functionality.
                      </p>
                    </div>
                    <div className="border-l-4 border-blue-500 pl-6 py-2">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">File Organization Strategies</h3>
                      <p className="text-gray-700">
                        Implement consistent naming conventions for extracted documents. Include page numbers, dates, or content descriptions in filenames to facilitate easy identification and retrieval. Consider creating folder structures based on content type or extraction purpose.
                      </p>
                    </div>
                    <div className="border-l-4 border-green-500 pl-6 py-2">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Security and Compliance Considerations</h3>
                      <p className="text-gray-700">
                        When extracting pages containing sensitive information, ensure compliance with data protection regulations. Our tool processes files locally in your browser, providing enhanced security for confidential documents without server-side storage or transmission.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Professional PDF Page Extraction Use Cases */}
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-6">Professional PDF Page Extraction Use Cases</h2>
                  <div className="grid lg:grid-cols-2 gap-8">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                        <i className="fas fa-building text-blue-600 mr-3"></i>
                        Business and Corporate Applications
                      </h3>
                      <div className="space-y-4">
                        <div className="bg-blue-50 rounded-lg p-4">
                          <h4 className="font-semibold text-gray-900 mb-2">Executive Summaries</h4>
                          <p className="text-sm text-gray-600">Extract key pages from comprehensive reports to create focused executive briefings for stakeholder presentations and decision-making processes.</p>
                        </div>
                        <div className="bg-blue-50 rounded-lg p-4">
                          <h4 className="font-semibold text-gray-900 mb-2">Contract Management</h4>
                          <p className="text-sm text-gray-600">Isolate specific contract clauses, terms, or schedules for legal review, compliance verification, or client communication without sharing entire agreements.</p>
                        </div>
                        <div className="bg-blue-50 rounded-lg p-4">
                          <h4 className="font-semibold text-gray-900 mb-2">Proposal Development</h4>
                          <p className="text-sm text-gray-600">Extract relevant sections from previous successful proposals to create templates or reference materials for new business opportunities.</p>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                        <i className="fas fa-graduation-cap text-green-600 mr-3"></i>
                        Academic and Research Applications
                      </h3>
                      <div className="space-y-4">
                        <div className="bg-green-50 rounded-lg p-4">
                          <h4 className="font-semibold text-gray-900 mb-2">Research Paper Compilation</h4>
                          <p className="text-sm text-gray-600">Extract specific chapters, methodologies, or findings from research papers to create focused literature reviews or comparative analysis documents.</p>
                        </div>
                        <div className="bg-green-50 rounded-lg p-4">
                          <h4 className="font-semibold text-gray-900 mb-2">Study Material Organization</h4>
                          <p className="text-sm text-gray-600">Create targeted study guides by extracting relevant pages from textbooks, lecture notes, or academic publications for exam preparation or course reviews.</p>
                        </div>
                        <div className="bg-green-50 rounded-lg p-4">
                          <h4 className="font-semibold text-gray-900 mb-2">Citation and Reference Management</h4>
                          <p className="text-sm text-gray-600">Extract specific pages containing cited information for easy reference management and academic integrity verification in scholarly work.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Advanced Features and Capabilities */}
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-6">Advanced Features and Capabilities</h2>
                  <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl p-8">
                    <div className="grid md:grid-cols-2 gap-8">
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-4">Technical Specifications</h3>
                        <div className="space-y-3">
                          <div className="flex items-center">
                            <i className="fas fa-check-circle text-green-600 mr-3"></i>
                            <span className="text-gray-700">Supports PDF versions 1.4 through 2.0</span>
                          </div>
                          <div className="flex items-center">
                            <i className="fas fa-check-circle text-green-600 mr-3"></i>
                            <span className="text-gray-700">Maintains vector graphics and embedded fonts</span>
                          </div>
                          <div className="flex items-center">
                            <i className="fas fa-check-circle text-green-600 mr-3"></i>
                            <span className="text-gray-700">Preserves interactive form fields and annotations</span>
                          </div>
                          <div className="flex items-center">
                            <i className="fas fa-check-circle text-green-600 mr-3"></i>
                            <span className="text-gray-700">Handles password-protected documents</span>
                          </div>
                          <div className="flex items-center">
                            <i className="fas fa-check-circle text-green-600 mr-3"></i>
                            <span className="text-gray-700">Browser-based processing for enhanced security</span>
                          </div>
                        </div>
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-4">Performance Optimization</h3>
                        <div className="space-y-3">
                          <div className="flex items-center">
                            <i className="fas fa-lightning-bolt text-yellow-600 mr-3"></i>
                            <span className="text-gray-700">Fast processing for documents up to 1000 pages</span>
                          </div>
                          <div className="flex items-center">
                            <i className="fas fa-lightning-bolt text-yellow-600 mr-3"></i>
                            <span className="text-gray-700">Optimized memory usage for large files</span>
                          </div>
                          <div className="flex items-center">
                            <i className="fas fa-lightning-bolt text-yellow-600 mr-3"></i>
                            <span className="text-gray-700">Real-time page selection preview</span>
                          </div>
                          <div className="flex items-center">
                            <i className="fas fa-lightning-bolt text-yellow-600 mr-3"></i>
                            <span className="text-gray-700">Instant download after extraction</span>
                          </div>
                          <div className="flex items-center">
                            <i className="fas fa-lightning-bolt text-yellow-600 mr-3"></i>
                            <span className="text-gray-700">No file size limitations or restrictions</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Frequently Asked Questions */}
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-6">Frequently Asked Questions</h2>
                  <div className="space-y-6">
                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">How does the PDF page extraction process work?</h3>
                      <p className="text-gray-700">
                        Our PDF page extractor uses advanced PDF-lib technology to parse your document, identify individual pages, and allow precise selection. You can choose pages individually using checkboxes or specify ranges using comma-separated notation. The tool then creates a new PDF containing only your selected pages while preserving all original formatting, fonts, and quality.
                      </p>
                    </div>
                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">What file formats are supported for page extraction?</h3>
                      <p className="text-gray-700">
                        Our tool specifically supports PDF files in all standard versions (PDF 1.4 through PDF 2.0). This includes password-protected PDFs, documents with form fields, PDFs containing images and graphics, and files with embedded fonts. The extracted pages maintain full compatibility with all PDF viewers and editors.
                      </p>
                    </div>
                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Is there a limit to the number of pages I can extract?</h3>
                      <p className="text-gray-700">
                        There are no artificial limits on the number of pages you can extract. You can select individual pages, multiple ranges, or even extract hundreds of pages from large documents. Our tool efficiently handles documents of all sizes, from single-page extractions to complex multi-hundred-page selections.
                      </p>
                    </div>
                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">How do I specify complex page ranges for extraction?</h3>
                      <p className="text-gray-700">
                        Use comma-separated notation for complex extractions. For example: "1-3, 5, 7-9, 15" will extract pages 1, 2, 3, 5, 7, 8, 9, and 15. You can combine individual pages and ranges in any order. The tool automatically sorts and processes your selections to create a properly ordered output document.
                      </p>
                    </div>
                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Are my PDF files secure during the extraction process?</h3>
                      <p className="text-gray-700">
                        Absolutely. All PDF processing occurs locally in your web browser using client-side JavaScript. Your files are never uploaded to servers or stored online. This ensures complete privacy and security for sensitive documents. Once you close your browser or refresh the page, all file data is automatically cleared from memory.
                      </p>
                    </div>
                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Will the extracted pages maintain their original quality?</h3>
                      <p className="text-gray-700">
                        Yes, our extraction process preserves 100% of the original page quality. Vector graphics remain scalable, embedded fonts are maintained, images retain their resolution, and interactive elements like form fields and hyperlinks continue to function. The extracted pages are identical to the originals in terms of visual appearance and functionality.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Tips and Best Practices */}
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-6">Tips and Best Practices for PDF Page Extraction</h2>
                  <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-8">
                    <div className="grid md:grid-cols-2 gap-8">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                          <i className="fas fa-lightbulb text-yellow-600 mr-2"></i>
                          Extraction Efficiency Tips
                        </h3>
                        <ul className="space-y-3 text-gray-700">
                          <li>• Preview your document page count before starting selection</li>
                          <li>• Use range notation for consecutive pages to save time</li>
                          <li>• Utilize select-all feature for bulk operations</li>
                          <li>• Test with small selections first for large documents</li>
                          <li>• Keep track of extracted page numbers for reference</li>
                        </ul>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                          <i className="fas fa-shield-alt text-green-600 mr-2"></i>
                          Quality Assurance Best Practices
                        </h3>
                        <ul className="space-y-3 text-gray-700">
                          <li>• Verify page selections before extracting</li>
                          <li>• Check extracted files for completeness</li>
                          <li>• Maintain original file backups</li>
                          <li>• Use descriptive filenames for extracted documents</li>
                          <li>• Test extracted PDFs in different viewers</li>
                        </ul>
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

export default ExtractPDFPagesTool;