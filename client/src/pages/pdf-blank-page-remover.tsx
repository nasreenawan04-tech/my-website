import { useState, useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Upload, FileText, Download, Trash2, Eye } from 'lucide-react';

interface PageAnalysis {
  pageNumber: number;
  isEmpty: boolean;
  hasText: boolean;
  hasImages: boolean;
  confidence: number;
}

const PDFBlankPageRemover = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [analyzedPages, setAnalyzedPages] = useState<PageAnalysis[]>([]);
  const [selectedPagesToRemove, setSelectedPagesToRemove] = useState<number[]>([]);
  const [processedPdfUrl, setProcessedPdfUrl] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [originalInfo, setOriginalInfo] = useState<{ pageCount: number; size: string } | null>(null);
  const [autoDetectBlankPages, setAutoDetectBlankPages] = useState<boolean>(true);
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
    setAnalyzedPages([]);
    setSelectedPagesToRemove([]);
    
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

  const analyzePages = async () => {
    if (!selectedFile) return;

    setIsAnalyzing(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('pdf', selectedFile);
      formData.append('threshold', '0.95'); // 95% confidence threshold for blank pages

      const response = await fetch('/api/analyze-blank-pages', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      setAnalyzedPages(data.analysis);
      
      if (autoDetectBlankPages) {
        setSelectedPagesToRemove(data.blankPages);
      } else {
        setSelectedPagesToRemove([]);
      }

    } catch (error) {
      console.error('Error analyzing PDF pages:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setError(`Error analyzing PDF pages: ${errorMessage}. Please try again with a valid PDF file.`);
    }

    setIsAnalyzing(false);
  };


  const togglePageSelection = (pageNumber: number) => {
    setSelectedPagesToRemove(prev => 
      prev.includes(pageNumber)
        ? prev.filter(p => p !== pageNumber)
        : [...prev, pageNumber]
    );
  };

  const selectAllBlankPages = () => {
    const blankPages = analyzedPages
      .filter(page => page.isEmpty)
      .map(page => page.pageNumber);
    setSelectedPagesToRemove(blankPages);
  };

  const clearSelection = () => {
    setSelectedPagesToRemove([]);
  };

  const removeBlankPages = async () => {
    if (!selectedFile || selectedPagesToRemove.length === 0) return;

    setIsProcessing(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('pdf', selectedFile);
      formData.append('pagesToRemove', JSON.stringify(selectedPagesToRemove));
      formData.append('autoDetect', 'false'); // Using manually selected pages
      formData.append('threshold', '0.95');

      const response = await fetch('/api/remove-blank-pages', {
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
      console.error('Error removing blank pages:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setError(`Error removing blank pages: ${errorMessage}. Please try again with a valid PDF file.`);
    }

    setIsProcessing(false);
  };

  const downloadProcessedPDF = () => {
    if (!processedPdfUrl || !selectedFile) return;

    const link = document.createElement('a');
    link.href = processedPdfUrl;
    const baseName = selectedFile.name.replace('.pdf', '');
    link.download = `blank-pages-removed-${baseName}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const resetTool = () => {
    setSelectedFile(null);
    setProcessedPdfUrl(null);
    setOriginalInfo(null);
    setAnalyzedPages([]);
    setSelectedPagesToRemove([]);
    setError(null);
    if (processedPdfUrl) {
      URL.revokeObjectURL(processedPdfUrl);
    }
  };

  const getRemainingPageCount = () => {
    return (originalInfo?.pageCount || 0) - selectedPagesToRemove.length;
  };

  const getBlankPagesCount = () => {
    return analyzedPages.filter(page => page.isEmpty).length;
  };

  return (
    <>
      <Helmet>
        <title>PDF Blank Page Remover - Remove Empty Pages from PDF | ToolsHub</title>
        <meta name="description" content="Automatically detect and remove blank or empty pages from PDF documents. Reduce file size and improve document quality by removing unnecessary pages." />
        <meta name="keywords" content="PDF blank page remover, remove empty PDF pages, PDF cleanup, PDF optimization, delete blank pages" />
        <meta property="og:title" content="PDF Blank Page Remover - Remove Empty Pages from PDF | ToolsHub" />
        <meta property="og:description" content="Automatically detect and remove blank pages from PDF documents to reduce file size." />
        <meta property="og:type" content="website" />
        <link rel="canonical" href="/tools/pdf-blank-page-remover" />
      </Helmet>

      <div className="min-h-screen flex flex-col" data-testid="page-pdf-blank-page-remover">
        <Header />
        
        <main className="flex-1 bg-neutral-50">
          {/* Hero Section */}
          <section className="bg-gradient-to-r from-red-600 via-red-500 to-orange-700 text-white py-16">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <div className="w-20 h-20 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <i className="fas fa-eraser text-3xl"></i>
              </div>
              <h1 className="text-4xl sm:text-5xl font-bold mb-6" data-testid="text-page-title">
                PDF Blank Page Remover
              </h1>
              <p className="text-xl text-red-100 max-w-2xl mx-auto">
                Automatically detect and remove blank or empty pages from your PDF documents to reduce file size and improve readability.
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
                            ? 'border-red-500 bg-red-50' 
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
                          className="bg-red-600 hover:bg-red-700 text-white"
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
                          <div className="flex flex-col md:flex-row gap-2">
                            <div className="flex items-center space-x-2 mb-2 md:mb-0">
                              <Checkbox
                                id="auto-detect"
                                checked={autoDetectBlankPages}
                                onCheckedChange={(checked) => setAutoDetectBlankPages(Boolean(checked))}
                              />
                              <label htmlFor="auto-detect" className="text-sm text-gray-700">
                                Auto-select detected blank pages
                              </label>
                            </div>
                            <div className="space-x-2">
                              <Button
                                onClick={analyzePages}
                                disabled={isAnalyzing}
                                className="bg-blue-600 hover:bg-blue-700 text-white"
                                data-testid="button-analyze"
                              >
                                {isAnalyzing ? (
                                  <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                    Analyzing...
                                  </>
                                ) : (
                                  <>
                                    <Eye className="w-4 h-4 mr-2" />
                                    Analyze Pages
                                  </>
                                )}
                              </Button>
                              <Button
                                onClick={resetTool}
                                variant="outline"
                                className="text-red-600 border-red-200 hover:bg-red-50"
                              >
                                Remove
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Analysis Results */}
                    {analyzedPages.length > 0 && (
                      <div className="space-y-6" data-testid="analysis-results">
                        <div className="flex justify-between items-center">
                          <h3 className="text-xl font-semibold text-gray-900">Page Analysis Results</h3>
                          <div className="space-x-2">
                            <Button
                              onClick={selectAllBlankPages}
                              variant="outline"
                              className="text-orange-600 border-orange-200 hover:bg-orange-50"
                            >
                              Select All Blank Pages
                            </Button>
                            <Button
                              onClick={clearSelection}
                              variant="outline"
                              className="text-gray-600 border-gray-200 hover:bg-gray-50"
                            >
                              Clear Selection
                            </Button>
                          </div>
                        </div>

                        {/* Statistics */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                          <div className="bg-blue-50 rounded-lg p-4 text-center">
                            <div className="text-2xl font-bold text-blue-600">{analyzedPages.length}</div>
                            <div className="text-sm text-gray-600">Total Pages</div>
                          </div>
                          <div className="bg-red-50 rounded-lg p-4 text-center">
                            <div className="text-2xl font-bold text-red-600">{getBlankPagesCount()}</div>
                            <div className="text-sm text-gray-600">Blank Pages Found</div>
                          </div>
                          <div className="bg-orange-50 rounded-lg p-4 text-center">
                            <div className="text-2xl font-bold text-orange-600">{selectedPagesToRemove.length}</div>
                            <div className="text-sm text-gray-600">Selected for Removal</div>
                          </div>
                          <div className="bg-green-50 rounded-lg p-4 text-center">
                            <div className="text-2xl font-bold text-green-600">{getRemainingPageCount()}</div>
                            <div className="text-sm text-gray-600">Remaining Pages</div>
                          </div>
                        </div>

                        {/* Page List */}
                        <div className="max-h-80 overflow-y-auto border border-gray-200 rounded-lg">
                          <div className="space-y-2 p-4">
                            {analyzedPages.map((page) => (
                              <div
                                key={page.pageNumber}
                                className={`flex items-center justify-between p-3 rounded-lg border ${
                                  page.isEmpty 
                                    ? 'bg-red-50 border-red-200' 
                                    : 'bg-gray-50 border-gray-200'
                                }`}
                                data-testid={`page-analysis-${page.pageNumber}`}
                              >
                                <div className="flex items-center space-x-3">
                                  <Checkbox
                                    id={`page-${page.pageNumber}`}
                                    checked={selectedPagesToRemove.includes(page.pageNumber)}
                                    onCheckedChange={() => togglePageSelection(page.pageNumber)}
                                  />
                                  <div>
                                    <div className="font-medium text-gray-900">
                                      Page {page.pageNumber}
                                    </div>
                                    <div className="text-sm text-gray-600">
                                      {page.isEmpty ? (
                                        <span className="text-red-600">⚠ Appears blank</span>
                                      ) : (
                                        <span className="text-green-600">✓ Has content</span>
                                      )}
                                      {page.hasText && <span className="ml-2 text-blue-600">📝 Text</span>}
                                      {page.hasImages && <span className="ml-2 text-purple-600">🖼 Images</span>}
                                    </div>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <div className="text-sm text-gray-500">
                                    {Math.round(page.confidence * 100)}% confidence
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Warning */}
                        {selectedPagesToRemove.length > 0 && (
                          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                            <div className="flex items-start">
                              <i className="fas fa-exclamation-triangle text-yellow-600 mr-3 mt-1"></i>
                              <div>
                                <h4 className="font-medium text-yellow-800">Review Pages Before Removal</h4>
                                <p className="text-sm text-yellow-700 mt-1">
                                  You are about to remove {selectedPagesToRemove.length} page(s). Please review the selection 
                                  to ensure important content won't be lost. This action cannot be undone.
                                </p>
                              </div>
                            </div>
                          </div>
                        )}
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

                    {/* Remove Button */}
                    {selectedFile && selectedPagesToRemove.length > 0 && !error && (
                      <div className="text-center">
                        <Button
                          onClick={removeBlankPages}
                          disabled={isProcessing}
                          className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 text-lg"
                          data-testid="button-remove"
                        >
                          {isProcessing ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                              Removing Pages...
                            </>
                          ) : (
                            <>
                              <Trash2 className="w-4 h-4 mr-2" />
                              Remove {selectedPagesToRemove.length} Pages
                            </>
                          )}
                        </Button>
                      </div>
                    )}

                    {/* Results Section */}
                    {processedPdfUrl && (
                      <div className="bg-green-50 rounded-xl p-6 text-center" data-testid="removal-results">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <i className="fas fa-check text-2xl text-green-600"></i>
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">
                          Blank Pages Successfully Removed!
                        </h3>
                        <p className="text-gray-600 mb-6">
                          {selectedPagesToRemove.length} blank page(s) removed. Your PDF now has {getRemainingPageCount()} pages.
                        </p>
                        <Button
                          onClick={downloadProcessedPDF}
                          className="bg-red-600 hover:bg-red-700 text-white px-6 py-3"
                          data-testid="button-download"
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Download Cleaned PDF
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* SEO Content Sections */}
              <div className="mt-12 space-y-8">
                {/* What is PDF Blank Page Remover */}
                <div className="bg-white rounded-2xl shadow-lg p-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-6">What is a PDF Blank Page Remover?</h2>
                  <div className="prose prose-lg max-w-none text-gray-700">
                    <p className="text-lg leading-relaxed mb-6">
                      A <strong>PDF Blank Page Remover</strong> is a specialized digital tool designed to automatically detect, identify, and remove empty or blank pages from PDF documents. This powerful utility analyzes each page of a PDF file to determine content presence, helping users eliminate unnecessary blank pages that can increase file size, complicate printing, and make document navigation more cumbersome.
                    </p>
                    <p className="text-lg leading-relaxed mb-6">
                      Our advanced PDF Blank Page Remover uses intelligent content analysis algorithms to scan for text, images, graphics, and other meaningful content on each page. The tool provides confidence scores for blank page detection, allowing users to review and manually select pages for removal to ensure no important content is accidentally deleted. This comprehensive approach makes it perfect for cleaning up scanned documents, removing separator pages, and optimizing PDF files for storage and distribution.
                    </p>
                  </div>
                </div>

                {/* How PDF Blank Page Removal Works */}
                <div className="bg-white rounded-2xl shadow-lg p-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-6">How PDF Blank Page Removal Works</h2>
                  <div className="grid md:grid-cols-2 gap-8">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-4">Intelligent Content Detection</h3>
                      <p className="text-gray-700 mb-4">
                        Our PDF Blank Page Remover employs sophisticated algorithms that go beyond simple visual analysis. The tool examines multiple content layers including:
                      </p>
                      <ul className="text-gray-700 mb-4 space-y-2">
                        <li className="flex items-center"><span className="w-2 h-2 bg-red-500 rounded-full mr-3"></span>Text content and font elements</li>
                        <li className="flex items-center"><span className="w-2 h-2 bg-red-500 rounded-full mr-3"></span>Images, graphics, and vector elements</li>
                        <li className="flex items-center"><span className="w-2 h-2 bg-red-500 rounded-full mr-3"></span>Form fields and annotations</li>
                        <li className="flex items-center"><span className="w-2 h-2 bg-red-500 rounded-full mr-3"></span>Hidden metadata and digital signatures</li>
                      </ul>
                    </div>
                    
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-4">Step-by-Step Process</h3>
                      <div className="space-y-4">
                        <div className="flex items-start">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-4 mt-1">
                            <span className="text-blue-600 font-semibold text-sm">1</span>
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900">Upload & Parse</h4>
                            <p className="text-gray-600 text-sm">Upload your PDF and analyze document structure</p>
                          </div>
                        </div>
                        <div className="flex items-start">
                          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-4 mt-1">
                            <span className="text-green-600 font-semibold text-sm">2</span>
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900">Content Analysis</h4>
                            <p className="text-gray-600 text-sm">Scan each page for meaningful content with confidence scoring</p>
                          </div>
                        </div>
                        <div className="flex items-start">
                          <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center mr-4 mt-1">
                            <span className="text-orange-600 font-semibold text-sm">3</span>
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900">Review & Select</h4>
                            <p className="text-gray-600 text-sm">Review detected blank pages and select for removal</p>
                          </div>
                        </div>
                        <div className="flex items-start">
                          <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mr-4 mt-1">
                            <span className="text-purple-600 font-semibold text-sm">4</span>
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900">Generate Clean PDF</h4>
                            <p className="text-gray-600 text-sm">Create optimized PDF with blank pages removed</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Benefits for Different User Types */}
                <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-2xl p-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-8">Benefits for Every User</h2>
                  <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="bg-white rounded-xl p-6 shadow-sm">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                        <i className="fas fa-graduation-cap text-blue-600 text-xl"></i>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Students</h3>
                      <p className="text-gray-700 text-sm mb-4">
                        Clean up research papers, remove blank pages from scanned textbooks, and optimize assignment submissions.
                      </p>
                      <ul className="text-gray-600 text-sm space-y-1">
                        <li>• Reduce file sizes for email submissions</li>
                        <li>• Clean up scanned lecture notes</li>
                        <li>• Optimize thesis documents</li>
                      </ul>
                    </div>
                    
                    <div className="bg-white rounded-xl p-6 shadow-sm">
                      <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                        <i className="fas fa-briefcase text-green-600 text-xl"></i>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Professionals</h3>
                      <p className="text-gray-700 text-sm mb-4">
                        Streamline business documents, clean up reports, and create professional presentations.
                      </p>
                      <ul className="text-gray-600 text-sm space-y-1">
                        <li>• Professional document cleanup</li>
                        <li>• Optimize client presentations</li>
                        <li>• Reduce printing costs</li>
                      </ul>
                    </div>
                    
                    <div className="bg-white rounded-xl p-6 shadow-sm">
                      <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                        <i className="fas fa-building text-purple-600 text-xl"></i>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Business Owners</h3>
                      <p className="text-gray-700 text-sm mb-4">
                        Optimize contracts, clean up financial reports, and prepare documents for digital archiving.
                      </p>
                      <ul className="text-gray-600 text-sm space-y-1">
                        <li>• Streamline legal documents</li>
                        <li>• Optimize storage space</li>
                        <li>• Improve document quality</li>
                      </ul>
                    </div>
                    
                    <div className="bg-white rounded-xl p-6 shadow-sm">
                      <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                        <i className="fas fa-microscope text-orange-600 text-xl"></i>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Researchers</h3>
                      <p className="text-gray-700 text-sm mb-4">
                        Clean up academic papers, optimize research documentation, and prepare publications.
                      </p>
                      <ul className="text-gray-600 text-sm space-y-1">
                        <li>• Publication-ready documents</li>
                        <li>• Optimize research archives</li>
                        <li>• Clean scanned materials</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Common Use Cases */}
                <div className="bg-white rounded-2xl shadow-lg p-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-6">Common Use Cases & Scenarios</h2>
                  <div className="grid md:grid-cols-2 gap-8">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-4">Document Processing Scenarios</h3>
                      <div className="space-y-4">
                        <div className="border-l-4 border-red-500 pl-4">
                          <h4 className="font-medium text-gray-900">Scanned Document Cleanup</h4>
                          <p className="text-gray-600 text-sm">Remove blank separator pages from multi-page scans, eliminating empty pages that occur during batch scanning processes.</p>
                        </div>
                        <div className="border-l-4 border-blue-500 pl-4">
                          <h4 className="font-medium text-gray-900">Print-Ready Optimization</h4>
                          <p className="text-gray-600 text-sm">Prepare documents for printing by removing unnecessary blank pages, saving paper and reducing printing costs.</p>
                        </div>
                        <div className="border-l-4 border-green-500 pl-4">
                          <h4 className="font-medium text-gray-900">Digital Archive Preparation</h4>
                          <p className="text-gray-600 text-sm">Optimize documents for long-term storage by removing blank pages and reducing file sizes.</p>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-4">Professional Applications</h3>
                      <div className="space-y-4">
                        <div className="border-l-4 border-purple-500 pl-4">
                          <h4 className="font-medium text-gray-900">Legal Document Processing</h4>
                          <p className="text-gray-600 text-sm">Clean up legal briefs, contracts, and case files while maintaining document integrity and page numbering.</p>
                        </div>
                        <div className="border-l-4 border-orange-500 pl-4">
                          <h4 className="font-medium text-gray-900">Academic Paper Preparation</h4>
                          <p className="text-gray-600 text-sm">Optimize research papers, dissertations, and academic publications for submission and review.</p>
                        </div>
                        <div className="border-l-4 border-yellow-500 pl-4">
                          <h4 className="font-medium text-gray-900">Business Report Optimization</h4>
                          <p className="text-gray-600 text-sm">Streamline quarterly reports, financial statements, and presentation materials for professional distribution.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Related PDF Tools */}
                <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-2xl p-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-6">Related PDF Tools</h2>
                  <p className="text-gray-700 mb-8">
                    Enhance your PDF workflow with our comprehensive suite of PDF tools designed to handle every aspect of document management.
                  </p>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <a href="/tools/merge-pdf-tool" className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow group">
                      <div className="flex items-center mb-3">
                        <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center mr-3">
                          <i className="fas fa-layer-group text-red-600"></i>
                        </div>
                        <h3 className="font-semibold text-gray-900 group-hover:text-red-600">PDF Merger</h3>
                      </div>
                      <p className="text-gray-600 text-sm">Combine multiple PDF files into a single document with our easy-to-use PDF merger tool.</p>
                    </a>
                    
                    <a href="/tools/extract-pdf-pages-tool" className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow group">
                      <div className="flex items-center mb-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                          <i className="fas fa-file-export text-blue-600"></i>
                        </div>
                        <h3 className="font-semibold text-gray-900 group-hover:text-blue-600">Extract PDF Pages</h3>
                      </div>
                      <p className="text-gray-600 text-sm">Extract specific pages from PDF documents to create focused, targeted documents.</p>
                    </a>
                    
                    <a href="/tools/compress-pdf-tool" className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow group">
                      <div className="flex items-center mb-3">
                        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                          <i className="fas fa-compress text-green-600"></i>
                        </div>
                        <h3 className="font-semibold text-gray-900 group-hover:text-green-600">PDF Compressor</h3>
                      </div>
                      <p className="text-gray-600 text-sm">Reduce PDF file sizes while maintaining quality for easier sharing and storage.</p>
                    </a>
                    
                    <a href="/tools/organize-pdf-pages-tool" className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow group">
                      <div className="flex items-center mb-3">
                        <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                          <i className="fas fa-sort text-purple-600"></i>
                        </div>
                        <h3 className="font-semibold text-gray-900 group-hover:text-purple-600">Organize PDF Pages</h3>
                      </div>
                      <p className="text-gray-600 text-sm">Reorder, sort, and organize PDF pages to create the perfect document structure.</p>
                    </a>
                    
                    <a href="/tools/rotate-pdf-tool" className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow group">
                      <div className="flex items-center mb-3">
                        <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center mr-3">
                          <i className="fas fa-redo text-orange-600"></i>
                        </div>
                        <h3 className="font-semibold text-gray-900 group-hover:text-orange-600">Rotate PDF Pages</h3>
                      </div>
                      <p className="text-gray-600 text-sm">Rotate PDF pages to correct orientation and improve document readability.</p>
                    </a>
                    
                    <a href="/tools/protect-pdf-tool" className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow group">
                      <div className="flex items-center mb-3">
                        <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center mr-3">
                          <i className="fas fa-lock text-yellow-600"></i>
                        </div>
                        <h3 className="font-semibold text-gray-900 group-hover:text-yellow-600">Protect PDF</h3>
                      </div>
                      <p className="text-gray-600 text-sm">Add password protection and security settings to your PDF documents.</p>
                    </a>
                  </div>
                  
                  <div className="mt-8 text-center">
                    <a href="/tools/pdf-tools" className="inline-flex items-center px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors">
                      <i className="fas fa-tools mr-2"></i>
                      View All PDF Tools
                    </a>
                  </div>
                </div>

                {/* Technical Features */}
                <div className="bg-white rounded-2xl shadow-lg p-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-6">Advanced Features & Capabilities</h2>
                  <div className="grid md:grid-cols-2 gap-8">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-4">Smart Detection Technology</h3>
                      <div className="space-y-4">
                        <div className="flex items-start">
                          <i className="fas fa-check-circle text-green-500 mr-3 mt-1"></i>
                          <div>
                            <h4 className="font-medium text-gray-900">Content Analysis Algorithm</h4>
                            <p className="text-gray-600 text-sm">Advanced AI-powered analysis that examines text, images, vectors, and metadata to accurately identify blank pages.</p>
                          </div>
                        </div>
                        <div className="flex items-start">
                          <i className="fas fa-check-circle text-green-500 mr-3 mt-1"></i>
                          <div>
                            <h4 className="font-medium text-gray-900">Confidence Scoring</h4>
                            <p className="text-gray-600 text-sm">Each page receives a confidence score indicating the likelihood it's blank, helping you make informed decisions.</p>
                          </div>
                        </div>
                        <div className="flex items-start">
                          <i className="fas fa-check-circle text-green-500 mr-3 mt-1"></i>
                          <div>
                            <h4 className="font-medium text-gray-900">Customizable Thresholds</h4>
                            <p className="text-gray-600 text-sm">Adjust detection sensitivity to match your specific requirements for blank page identification.</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-4">User Control & Safety</h3>
                      <div className="space-y-4">
                        <div className="flex items-start">
                          <i className="fas fa-shield-alt text-blue-500 mr-3 mt-1"></i>
                          <div>
                            <h4 className="font-medium text-gray-900">Manual Review Process</h4>
                            <p className="text-gray-600 text-sm">Review every detected blank page before removal to ensure no important content is accidentally deleted.</p>
                          </div>
                        </div>
                        <div className="flex items-start">
                          <i className="fas fa-shield-alt text-blue-500 mr-3 mt-1"></i>
                          <div>
                            <h4 className="font-medium text-gray-900">Batch Selection Tools</h4>
                            <p className="text-gray-600 text-sm">Select multiple pages at once with convenient bulk selection options for efficient document cleanup.</p>
                          </div>
                        </div>
                        <div className="flex items-start">
                          <i className="fas fa-shield-alt text-blue-500 mr-3 mt-1"></i>
                          <div>
                            <h4 className="font-medium text-gray-900">Format Preservation</h4>
                            <p className="text-gray-600 text-sm">Maintain original document formatting, fonts, and layout while removing only the selected blank pages.</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Performance & Security */}
                <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl p-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-6">Performance & Security</h2>
                  <div className="grid md:grid-cols-3 gap-6">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <i className="fas fa-bolt text-green-600 text-xl"></i>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Lightning Fast</h3>
                      <p className="text-gray-600">
                        Process documents locally in your browser with advanced optimization for quick analysis and page removal.
                      </p>
                    </div>
                    
                    <div className="text-center">
                      <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <i className="fas fa-lock text-blue-600 text-xl"></i>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">100% Secure</h3>
                      <p className="text-gray-600">
                        All processing happens locally in your browser. Your documents never leave your device, ensuring complete privacy.
                      </p>
                    </div>
                    
                    <div className="text-center">
                      <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <i className="fas fa-mobile-alt text-purple-600 text-xl"></i>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Cross-Platform</h3>
                      <p className="text-gray-600">
                        Works seamlessly on desktop, tablet, and mobile devices without requiring any software installation.
                      </p>
                    </div>
                  </div>
                </div>

                {/* FAQ Section */}
                <div className="bg-white rounded-2xl shadow-lg p-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-6">Frequently Asked Questions</h2>
                  <div className="space-y-6">
                    <div className="border-b border-gray-200 pb-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">How accurate is the blank page detection?</h3>
                      <p className="text-gray-700">
                        Our advanced detection algorithm analyzes multiple content factors including text, images, graphics, annotations, and metadata with over 95% accuracy. Each detected blank page receives a confidence score, and you can manually review all selections before removal to ensure no important content is lost.
                      </p>
                    </div>
                    
                    <div className="border-b border-gray-200 pb-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Will removing blank pages affect my PDF's formatting?</h3>
                      <p className="text-gray-700">
                        No, the tool only removes the selected blank pages while preserving all formatting, fonts, layout, links, bookmarks, and content of the remaining pages. Your PDF's original structure and appearance will be maintained exactly as intended.
                      </p>
                    </div>
                    
                    <div className="border-b border-gray-200 pb-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">What file size limits does the tool have?</h3>
                      <p className="text-gray-700">
                        The tool can handle PDF files up to 50MB in size. For larger files, consider using our <a href="/tools/compress-pdf-tool" className="text-red-600 hover:text-red-700">PDF Compressor</a> first to reduce file size, then use the blank page remover for optimal results.
                      </p>
                    </div>
                    
                    <div className="border-b border-gray-200 pb-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Are my documents secure when using this tool?</h3>
                      <p className="text-gray-700">
                        Yes, absolutely. All processing happens locally in your browser using client-side JavaScript. Your PDF files are never uploaded to any server, ensuring complete privacy and security of your documents. The tool works entirely offline once loaded.
                      </p>
                    </div>
                    
                    <div className="border-b border-gray-200 pb-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Can I undo the blank page removal?</h3>
                      <p className="text-gray-700">
                        The tool creates a new cleaned PDF file while leaving your original document unchanged. You can always refer back to your original file if needed. We recommend downloading and saving both versions for your records.
                      </p>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">What types of blank pages can be detected?</h3>
                      <p className="text-gray-700">
                        Our tool can detect various types of blank pages including completely empty pages, pages with only whitespace, pages with minimal artifacts from scanning, and separator pages with no meaningful content. The confidence scoring helps you make informed decisions about edge cases.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Tips and Best Practices */}
                <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-2xl p-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-6">Tips & Best Practices</h2>
                  <div className="grid md:grid-cols-2 gap-8">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-4">Before You Start</h3>
                      <ul className="space-y-3 text-gray-700">
                        <li className="flex items-start">
                          <i className="fas fa-lightbulb text-yellow-500 mr-3 mt-1"></i>
                          <span>Review your document structure to understand which pages might be intentionally blank</span>
                        </li>
                        <li className="flex items-start">
                          <i className="fas fa-lightbulb text-yellow-500 mr-3 mt-1"></i>
                          <span>Consider creating a backup copy of your original PDF before processing</span>
                        </li>
                        <li className="flex items-start">
                          <i className="fas fa-lightbulb text-yellow-500 mr-3 mt-1"></i>
                          <span>Check if your document has page numbers that might be affected by page removal</span>
                        </li>
                      </ul>
                    </div>
                    
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-4">Optimization Tips</h3>
                      <ul className="space-y-3 text-gray-700">
                        <li className="flex items-start">
                          <i className="fas fa-rocket text-orange-500 mr-3 mt-1"></i>
                          <span>Use auto-detection first, then manually review selections for best results</span>
                        </li>
                        <li className="flex items-start">
                          <i className="fas fa-rocket text-orange-500 mr-3 mt-1"></i>
                          <span>Combine with our <a href="/tools/compress-pdf-tool" className="text-red-600 hover:text-red-700">PDF Compressor</a> for maximum file size reduction</span>
                        </li>
                        <li className="flex items-start">
                          <i className="fas fa-rocket text-orange-500 mr-3 mt-1"></i>
                          <span>Pay attention to confidence scores when reviewing detected blank pages</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* SEO Content - Professional PDF Optimization */}
                <div className="bg-white rounded-2xl shadow-lg p-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-8">Professional PDF Document Optimization Made Easy</h2>
                  <div className="grid md:grid-cols-2 gap-8">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-4">Why Remove Blank Pages from PDFs?</h3>
                      <p className="text-gray-700 mb-4">
                        Blank pages in PDF documents can significantly impact document quality, file size, and user experience. Whether they're left over from document conversion, scanning errors, or intentional separators that are no longer needed, these empty pages create unnecessary bloat and confusion.
                      </p>
                      <p className="text-gray-700 mb-4">
                        Our PDF Blank Page Remover helps streamline your documents by identifying and removing these unwanted pages, resulting in cleaner, more professional PDFs that are easier to navigate and share.
                      </p>
                    </div>
                    
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-4">Advanced Detection Technology</h3>
                      <p className="text-gray-700 mb-4">
                        Our tool employs sophisticated content analysis algorithms that examine multiple factors to determine if a page is truly blank. The system analyzes text content, image presence, vector graphics, annotations, and whitespace ratios to provide accurate blank page detection.
                      </p>
                      <p className="text-gray-700">
                        With confidence scoring and manual review options, you maintain complete control over which pages to remove, ensuring important content is never accidentally deleted.
                      </p>
                    </div>
                  </div>
                </div>

                {/* How it Works */}
                <div className="bg-white rounded-2xl shadow-lg p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">How Blank Page Detection Works</h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Upload className="w-8 h-8 text-red-600" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">1. Upload & Analyze</h3>
                      <p className="text-gray-600">
                        Upload your PDF and run intelligent analysis to detect blank or empty pages using advanced content recognition algorithms.
                      </p>
                    </div>
                    
                    <div className="text-center">
                      <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Eye className="w-8 h-8 text-orange-600" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">2. Review & Select</h3>
                      <p className="text-gray-600">
                        Review detected blank pages with confidence scores and manually select which pages to remove for complete control.
                      </p>
                    </div>
                    
                    <div className="text-center">
                      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Download className="w-8 h-8 text-green-600" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">3. Clean & Download</h3>
                      <p className="text-gray-600">
                        Get a optimized PDF with blank pages removed, reduced file size, and improved document navigation.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Common Use Cases */}
                <div className="bg-white rounded-2xl shadow-lg p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Common Use Cases for PDF Blank Page Removal</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="p-4 border border-gray-200 rounded-lg">
                      <h3 className="font-semibold text-gray-900 mb-2 flex items-center">
                        <i className="fas fa-scan text-blue-600 mr-2"></i>
                        Scanned Documents
                      </h3>
                      <p className="text-gray-600 text-sm">Remove blank pages from scanned documents that often contain empty separator pages or scanning artifacts.</p>
                    </div>
                    
                    <div className="p-4 border border-gray-200 rounded-lg">
                      <h3 className="font-semibold text-gray-900 mb-2 flex items-center">
                        <i className="fas fa-file-contract text-green-600 mr-2"></i>
                        Legal Documents
                      </h3>
                      <p className="text-gray-600 text-sm">Clean up legal documents by removing unnecessary blank pages while preserving important content and formatting.</p>
                    </div>
                    
                    <div className="p-4 border border-gray-200 rounded-lg">
                      <h3 className="font-semibold text-gray-900 mb-2 flex items-center">
                        <i className="fas fa-graduation-cap text-purple-600 mr-2"></i>
                        Academic Papers
                      </h3>
                      <p className="text-gray-600 text-sm">Optimize academic documents and research papers by removing blank pages that may interfere with page numbering.</p>
                    </div>
                    
                    <div className="p-4 border border-gray-200 rounded-lg">
                      <h3 className="font-semibold text-gray-900 mb-2 flex items-center">
                        <i className="fas fa-chart-line text-red-600 mr-2"></i>
                        Business Reports
                      </h3>
                      <p className="text-gray-600 text-sm">Streamline business reports and presentations by eliminating blank pages that reduce professional appearance.</p>
                    </div>
                    
                    <div className="p-4 border border-gray-200 rounded-lg">
                      <h3 className="font-semibold text-gray-900 mb-2 flex items-center">
                        <i className="fas fa-book text-orange-600 mr-2"></i>
                        Digital Publishing
                      </h3>
                      <p className="text-gray-600 text-sm">Prepare documents for digital publishing by removing unwanted blank pages that affect reading flow.</p>
                    </div>
                    
                    <div className="p-4 border border-gray-200 rounded-lg">
                      <h3 className="font-semibold text-gray-900 mb-2 flex items-center">
                        <i className="fas fa-archive text-yellow-600 mr-2"></i>
                        Document Archival
                      </h3>
                      <p className="text-gray-600 text-sm">Optimize document archives by reducing file sizes through intelligent blank page removal.</p>
                    </div>
                  </div>
                </div>

                {/* Features */}
                <div className="bg-white rounded-2xl shadow-lg p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Advanced Features & Capabilities</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex items-start">
                      <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mr-3 mt-1">
                        <i className="fas fa-check text-xs text-green-600"></i>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">Intelligent Content Detection</h3>
                        <p className="text-gray-600 text-sm">Advanced algorithms analyze text, images, graphics, and annotations to accurately identify truly blank pages.</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mr-3 mt-1">
                        <i className="fas fa-check text-xs text-green-600"></i>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">Confidence Scoring</h3>
                        <p className="text-gray-600 text-sm">Each page receives a confidence score indicating the likelihood it's blank, helping you make informed decisions.</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mr-3 mt-1">
                        <i className="fas fa-check text-xs text-green-600"></i>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">Manual Review & Control</h3>
                        <p className="text-gray-600 text-sm">Review detected pages and manually select which to remove, preventing accidental content loss.</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mr-3 mt-1">
                        <i className="fas fa-check text-xs text-green-600"></i>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">Batch Processing</h3>
                        <p className="text-gray-600 text-sm">Select multiple pages for removal at once with bulk selection options for efficient document cleanup.</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mr-3 mt-1">
                        <i className="fas fa-check text-xs text-green-600"></i>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">File Size Optimization</h3>
                        <p className="text-gray-600 text-sm">Significantly reduce PDF file sizes by removing unnecessary blank pages, improving storage and transfer efficiency.</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mr-3 mt-1">
                        <i className="fas fa-check text-xs text-green-600"></i>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">Format Preservation</h3>
                        <p className="text-gray-600 text-sm">Maintain original PDF formatting, fonts, and layout while removing only the selected blank pages.</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mr-3 mt-1">
                        <i className="fas fa-check text-xs text-green-600"></i>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">Secure Processing</h3>
                        <p className="text-gray-600 text-sm">All processing happens in your browser - your documents are never uploaded to external servers.</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mr-3 mt-1">
                        <i className="fas fa-check text-xs text-green-600"></i>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">Cross-Platform Compatibility</h3>
                        <p className="text-gray-600 text-sm">Works seamlessly across all devices and operating systems without requiring software installation.</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Benefits */}
                <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-2xl p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Benefits of Using PDF Blank Page Remover</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="bg-white rounded-lg p-6 shadow-sm">
                      <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                        <i className="fas fa-compress-arrows-alt text-blue-600 mr-3"></i>
                        Reduced File Size
                      </h3>
                      <p className="text-gray-700">
                        Significantly decrease PDF file sizes by removing unnecessary blank pages, making documents easier to store, share, and transfer.
                      </p>
                    </div>
                    
                    <div className="bg-white rounded-lg p-6 shadow-sm">
                      <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                        <i className="fas fa-user-check text-green-600 mr-3"></i>
                        Improved User Experience
                      </h3>
                      <p className="text-gray-700">
                        Create cleaner, more professional documents that are easier to navigate and read, enhancing the overall user experience.
                      </p>
                    </div>
                    
                    <div className="bg-white rounded-lg p-6 shadow-sm">
                      <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                        <i className="fas fa-print text-purple-600 mr-3"></i>
                        Print Optimization
                      </h3>
                      <p className="text-gray-700">
                        Save paper and ink costs by eliminating blank pages before printing, making your documents more environmentally friendly.
                      </p>
                    </div>
                    
                    <div className="bg-white rounded-lg p-6 shadow-sm">
                      <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                        <i className="fas fa-clock text-orange-600 mr-3"></i>
                        Time Efficiency
                      </h3>
                      <p className="text-gray-700">
                        Automate the blank page detection process instead of manually reviewing each page, saving valuable time and effort.
                      </p>
                    </div>
                    
                    <div className="bg-white rounded-lg p-6 shadow-sm">
                      <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                        <i className="fas fa-star text-yellow-600 mr-3"></i>
                        Professional Quality
                      </h3>
                      <p className="text-gray-700">
                        Enhance document professionalism by removing unwanted blank pages that can make documents appear unfinished or poorly formatted.
                      </p>
                    </div>
                    
                    <div className="bg-white rounded-lg p-6 shadow-sm">
                      <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                        <i className="fas fa-shield-alt text-red-600 mr-3"></i>
                        Data Security
                      </h3>
                      <p className="text-gray-700">
                        Process documents securely in your browser without uploading sensitive files to external servers, maintaining complete privacy.
                      </p>
                    </div>
                  </div>
                </div>

                {/* FAQ Section */}
                <div className="bg-white rounded-2xl shadow-lg p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Frequently Asked Questions</h2>
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">How accurate is the blank page detection?</h3>
                      <p className="text-gray-700">
                        Our advanced detection algorithm analyzes multiple content factors including text, images, graphics, and annotations with high accuracy. Each detected blank page receives a confidence score, and you can manually review all selections before removal to ensure no important content is lost.
                      </p>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Will removing blank pages affect my PDF's formatting?</h3>
                      <p className="text-gray-700">
                        No, the tool only removes the selected blank pages while preserving all formatting, fonts, layout, and content of the remaining pages. Your PDF's original structure and appearance will be maintained exactly as intended.
                      </p>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Is there a file size limit for PDFs?</h3>
                      <p className="text-gray-700">
                        The tool processes files locally in your browser, so the main limitation is your device's available memory. Most standard PDF documents, even large ones with hundreds of pages, can be processed efficiently.
                      </p>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Are my documents secure when using this tool?</h3>
                      <p className="text-gray-700">
                        Yes, absolutely. All processing happens locally in your browser using client-side JavaScript. Your PDF files are never uploaded to any server, ensuring complete privacy and security of your documents.
                      </p>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Can I undo the blank page removal?</h3>
                      <p className="text-gray-700">
                        The tool creates a new cleaned PDF file while leaving your original document unchanged. You can always refer back to your original file if needed. We recommend reviewing the page selection carefully before processing.
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

export default PDFBlankPageRemover;
