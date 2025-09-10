import { useState, useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Upload, FileText, Download, Copy, Plus, Minus } from 'lucide-react';

interface PageDuplication {
  pageNumber: number;
  duplicateCount: number;
  insertAfter: boolean;
}

const PDFPageDuplicator = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [duplications, setDuplications] = useState<PageDuplication[]>([]);
  const [duplicatedPdfUrl, setDuplicatedPdfUrl] = useState<string | null>(null);
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
    
    // Enhanced file validation
    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      setError('Please select a valid PDF file.');
      return;
    }

    // File size validation (50MB limit)
    const maxFileSize = 50 * 1024 * 1024; // 50MB
    if (file.size > maxFileSize) {
      setError('File size is too large. Please select a PDF file smaller than 50MB.');
      return;
    }

    if (file.size === 0) {
      setError('The selected file appears to be empty. Please select a valid PDF file.');
      return;
    }

    setSelectedFile(file);
    setError(null);
    setDuplicatedPdfUrl(null);
    setDuplications([]);
    
    // Get original PDF info
    try {
      const { PDFDocument } = await import('pdf-lib');
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
      const pages = pdfDoc.getPages();
      
      if (pages.length === 0) {
        setError('This PDF file contains no pages.');
        setSelectedFile(null);
        return;
      }

      if (pages.length > 1000) {
        setError('This PDF has too many pages. Please select a PDF with fewer than 1000 pages.');
        setSelectedFile(null);
        return;
      }
      
      const firstPage = pages[0];
      const { width, height } = firstPage.getSize();
      
      setOriginalInfo({
        pageCount: pages.length,
        size: `${Math.round(width)} × ${Math.round(height)} pt`
      });

      // Show helpful message for single-page PDFs
      if (pages.length === 1) {
        setError('This PDF only has 1 page. You can still duplicate it, but consider if this is what you intended.');
      }
    } catch (error) {
      console.error('Error reading PDF info:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      if (errorMessage.toLowerCase().includes('password') || errorMessage.toLowerCase().includes('encrypt')) {
        setError('This PDF is password-protected. Please unlock it first using our PDF Unlock tool, then try again.');
      } else if (errorMessage.toLowerCase().includes('invalid') || errorMessage.toLowerCase().includes('corrupt')) {
        setError('This PDF file appears to be invalid or corrupted. Please try with a different PDF file.');
      } else {
        setError('Unable to read PDF file. Please ensure it is a valid PDF document.');
      }
      
      setSelectedFile(null);
      setOriginalInfo(null);
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

  const addDuplication = () => {
    if (!originalInfo) return;
    
    setDuplications(prev => [...prev, {
      pageNumber: 1,
      duplicateCount: 1,
      insertAfter: true
    }]);
  };

  const removeDuplication = (index: number) => {
    setDuplications(prev => prev.filter((_, i) => i !== index));
  };

  const updateDuplication = (index: number, field: keyof PageDuplication, value: any) => {
    setDuplications(prev => prev.map((dup, i) => {
      if (i !== index) return dup;
      
      const updated = { ...dup, [field]: value };
      
      // Validation for page number
      if (field === 'pageNumber') {
        const pageNum = parseInt(value);
        if (isNaN(pageNum) || pageNum < 1 || pageNum > (originalInfo?.pageCount || 0)) {
          return dup; // Don't update if invalid
        }
        updated.pageNumber = pageNum;
      }
      
      // Validation for duplicate count
      if (field === 'duplicateCount') {
        const count = parseInt(value);
        if (isNaN(count) || count < 1 || count > 10) {
          return dup; // Don't update if invalid
        }
        updated.duplicateCount = count;
      }
      
      return updated;
    }));
  };

  const duplicatePages = async () => {
    if (!selectedFile || duplications.length === 0) return;

    setIsProcessing(true);
    setError(null);

    try {
      // For files larger than 10MB, use server-side processing for better performance
      const useServerProcessing = selectedFile.size > 10 * 1024 * 1024;
      
      if (useServerProcessing) {
        await duplicatePagesServer();
      } else {
        await duplicatePagesClient();
      }
    } catch (error) {
      console.error('Error duplicating PDF pages:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setError(`Error duplicating PDF pages: ${errorMessage}. Please check your settings and try again.`);
    }

    setIsProcessing(false);
  };

  const duplicatePagesServer = async () => {
    if (!selectedFile || duplications.length === 0) return;

    // Prepare page selections for server
    const pageSelections: { [key: number]: number } = {};
    
    // Start with all original pages (1 copy each)
    for (let i = 0; i < (originalInfo?.pageCount || 0); i++) {
      pageSelections[i] = 1;
    }
    
    // Add duplications
    duplications.forEach(duplication => {
      const pageIndex = duplication.pageNumber - 1; // Convert to 0-based
      if (pageIndex >= 0 && pageIndex < (originalInfo?.pageCount || 0)) {
        pageSelections[pageIndex] = (pageSelections[pageIndex] || 1) + duplication.duplicateCount;
      }
    });

    const formData = new FormData();
    formData.append('pdf', selectedFile);
    formData.append('pageSelections', JSON.stringify(pageSelections));

    const response = await fetch('/api/pdf-page-duplicator', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Server error: ${response.status}`);
    }

    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    setDuplicatedPdfUrl(url);
  };

  const duplicatePagesClient = async () => {
    if (!selectedFile || duplications.length === 0) return;

    const { PDFDocument } = await import('pdf-lib');
    
    const arrayBuffer = await selectedFile.arrayBuffer();
    const originalPdf = await PDFDocument.load(arrayBuffer);
    const newPdf = await PDFDocument.create();
    
    const originalPages = originalPdf.getPages();
    
    // Validate all page numbers first
    for (const duplication of duplications) {
      const pageIndex = duplication.pageNumber - 1;
      if (pageIndex < 0 || pageIndex >= originalPages.length) {
        throw new Error(`Invalid page number: ${duplication.pageNumber}. PDF only has ${originalPages.length} pages.`);
      }
      if (duplication.duplicateCount < 1 || duplication.duplicateCount > 10) {
        throw new Error(`Invalid duplicate count: ${duplication.duplicateCount}. Must be between 1 and 10.`);
      }
    }

    // Create a plan for the final document structure
    const finalStructure: { sourcePageIndex: number; isOriginal: boolean }[] = [];
    
    // Add original pages and duplicates in order
    for (let i = 0; i < originalPages.length; i++) {
      // Add the original page
      finalStructure.push({ sourcePageIndex: i, isOriginal: true });
      
      // Check if this page needs duplicates
      const duplication = duplications.find(dup => dup.pageNumber - 1 === i);
      if (duplication) {
        // Add duplicates
        for (let j = 0; j < duplication.duplicateCount; j++) {
          if (duplication.insertAfter) {
            finalStructure.push({ sourcePageIndex: i, isOriginal: false });
          } else {
            // Insert before - add at current position, then original page will be after
            finalStructure.splice(-1, 0, { sourcePageIndex: i, isOriginal: false });
          }
        }
      }
    }

    // Copy pages according to the final structure
    for (const item of finalStructure) {
      const [copiedPage] = await newPdf.copyPages(originalPdf, [item.sourcePageIndex]);
      newPdf.addPage(copiedPage);
    }

    const pdfBytes = await newPdf.save();
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    setDuplicatedPdfUrl(url);
  };

  const downloadDuplicatedPDF = () => {
    if (!duplicatedPdfUrl) return;

    const link = document.createElement('a');
    link.href = duplicatedPdfUrl;
    link.download = 'duplicated-pages-document.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const resetTool = () => {
    setSelectedFile(null);
    setDuplicatedPdfUrl(null);
    setOriginalInfo(null);
    setError(null);
    setDuplications([]);
    if (duplicatedPdfUrl) {
      URL.revokeObjectURL(duplicatedPdfUrl);
    }
  };

  const getTotalNewPages = () => {
    return duplications.reduce((total, dup) => total + dup.duplicateCount, 0);
  };

  const getFinalPageCount = () => {
    return (originalInfo?.pageCount || 0) + getTotalNewPages();
  };

  return (
    <>
      <Helmet>
        <title>PDF Page Duplicator - Duplicate Specific PDF Pages | ToolsHub</title>
        <meta name="description" content="Duplicate specific pages within a PDF document. Choose which pages to duplicate, how many copies, and where to insert them." />
        <meta name="keywords" content="PDF duplicate pages, PDF page copy, PDF page duplication, repeat PDF pages, clone PDF pages" />
        <meta property="og:title" content="PDF Page Duplicator - Duplicate Specific PDF Pages | ToolsHub" />
        <meta property="og:description" content="Duplicate specific pages within a PDF document with precise control over placement and quantity." />
        <meta property="og:type" content="website" />
        <link rel="canonical" href="/tools/pdf-page-duplicator" />
      </Helmet>

      <div className="min-h-screen flex flex-col" data-testid="page-pdf-page-duplicator">
        <Header />
        
        <main className="flex-1 bg-neutral-50">
          {/* Hero Section */}
          <section className="bg-gradient-to-r from-orange-600 via-orange-500 to-red-700 text-white py-16">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <div className="w-20 h-20 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <i className="fas fa-copy text-3xl"></i>
              </div>
              <h1 className="text-4xl sm:text-5xl font-bold mb-6" data-testid="text-page-title">
                PDF Page Duplicator
              </h1>
              <p className="text-xl text-orange-100 max-w-2xl mx-auto">
                Duplicate specific pages within your PDF document. Choose which pages to copy, how many duplicates, and where to place them.
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
                            ? 'border-orange-500 bg-orange-50' 
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
                          className="bg-orange-600 hover:bg-orange-700 text-white"
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

                    {/* Duplication Settings */}
                    {selectedFile && originalInfo && (
                      <div className="space-y-6" data-testid="duplication-settings">
                        <div className="flex justify-between items-center">
                          <h3 className="text-xl font-semibold text-gray-900">Page Duplication Settings</h3>
                          <Button
                            onClick={addDuplication}
                            className="bg-orange-600 hover:bg-orange-700 text-white"
                            data-testid="button-add-duplication"
                          >
                            <Plus className="w-4 h-4 mr-2" />
                            Add Duplication Rule
                          </Button>
                        </div>

                        {/* Duplication Rules */}
                        {duplications.length > 0 && (
                          <div className="space-y-4">
                            {duplications.map((duplication, index) => (
                              <div key={index} className="bg-gray-50 rounded-lg p-4" data-testid={`duplication-rule-${index}`}>
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                  <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                      Page Number
                                    </label>
                                    <Input
                                      type="number"
                                      min={1}
                                      max={originalInfo.pageCount}
                                      value={duplication.pageNumber}
                                      onChange={(e) => updateDuplication(index, 'pageNumber', parseInt(e.target.value))}
                                      className="w-full"
                                      data-testid={`input-page-number-${index}`}
                                    />
                                    <p className="text-xs text-gray-500 mt-1">
                                      1 to {originalInfo.pageCount}
                                    </p>
                                  </div>

                                  <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                      Duplicate Count
                                    </label>
                                    <Input
                                      type="number"
                                      min={1}
                                      max={10}
                                      value={duplication.duplicateCount}
                                      onChange={(e) => updateDuplication(index, 'duplicateCount', parseInt(e.target.value))}
                                      className="w-full"
                                      data-testid={`input-duplicate-count-${index}`}
                                    />
                                    <p className="text-xs text-gray-500 mt-1">
                                      Max 10 copies
                                    </p>
                                  </div>

                                  <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                      Insert Position
                                    </label>
                                    <div className="space-y-2 pt-1">
                                      <div className="flex items-center space-x-2">
                                        <Checkbox
                                          id={`insert-after-${index}`}
                                          checked={duplication.insertAfter}
                                          onCheckedChange={(checked) => updateDuplication(index, 'insertAfter', checked)}
                                        />
                                        <label htmlFor={`insert-after-${index}`} className="text-sm text-gray-700">
                                          After page {duplication.pageNumber}
                                        </label>
                                      </div>
                                      <div className="flex items-center space-x-2">
                                        <Checkbox
                                          id={`insert-before-${index}`}
                                          checked={!duplication.insertAfter}
                                          onCheckedChange={(checked) => updateDuplication(index, 'insertAfter', !checked)}
                                        />
                                        <label htmlFor={`insert-before-${index}`} className="text-sm text-gray-700">
                                          Before page {duplication.pageNumber}
                                        </label>
                                      </div>
                                    </div>
                                  </div>

                                  <div className="flex items-end">
                                    <Button
                                      onClick={() => removeDuplication(index)}
                                      variant="outline"
                                      className="text-red-600 border-red-200 hover:bg-red-50"
                                      data-testid={`button-remove-duplication-${index}`}
                                    >
                                      <Minus className="w-4 h-4 mr-2" />
                                      Remove
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Summary */}
                        {duplications.length > 0 && (
                          <div className="bg-blue-50 rounded-lg p-4">
                            <h4 className="font-medium text-gray-900 mb-2">Duplication Summary</h4>
                            <div className="text-sm text-gray-600 space-y-1">
                              <div>Original pages: {originalInfo.pageCount}</div>
                              <div>Duplicates to add: {getTotalNewPages()}</div>
                              <div className="font-medium">Final page count: {getFinalPageCount()}</div>
                              {duplications.some(d => d.duplicateCount > 5) && (
                                <div className="text-orange-600 font-medium">⚠️ High duplicate count detected</div>
                              )}
                            </div>
                            
                            {/* Show duplication rules summary */}
                            <div className="mt-3 pt-3 border-t border-blue-200">
                              <div className="text-xs text-blue-700">
                                <strong>Rules:</strong> {duplications.map((dup, index) => (
                                  <span key={index}>
                                    Page {dup.pageNumber} → {dup.duplicateCount} {dup.duplicateCount === 1 ? 'copy' : 'copies'} 
                                    ({dup.insertAfter ? 'after' : 'before'})
                                    {index < duplications.length - 1 ? ', ' : ''}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}

                        {duplications.length === 0 && (
                          <div className="text-center py-8 text-gray-500">
                            <Copy className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                            <p>No duplication rules added yet.</p>
                            <p className="text-sm">Click "Add Duplication Rule" to start.</p>
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

                    {/* Processing Info */}
                    {selectedFile && duplications.length > 0 && (
                      <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                        <div className="flex items-start gap-3">
                          <i className="fas fa-info-circle text-blue-600 mt-0.5"></i>
                          <div className="text-sm text-blue-800">
                            <p className="font-medium mb-1">Processing Information:</p>
                            <ul className="space-y-1">
                              <li>• File size: {formatFileSize(selectedFile.size)} 
                                {selectedFile.size > 10 * 1024 * 1024 && (
                                  <span className="text-blue-600 font-medium"> (will use server processing)</span>
                                )}
                              </li>
                              <li>• {getTotalNewPages()} pages will be duplicated</li>
                              <li>• Final PDF will have {getFinalPageCount()} pages</li>
                              {getFinalPageCount() > 500 && (
                                <li className="text-orange-600 font-medium">• ⚠️ Large output file - may take longer to process</li>
                              )}
                            </ul>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Duplicate Button */}
                    {selectedFile && duplications.length > 0 && !error && (
                      <div className="text-center">
                        <Button
                          onClick={duplicatePages}
                          disabled={isProcessing}
                          className="bg-orange-600 hover:bg-orange-700 text-white px-8 py-3 text-lg"
                          data-testid="button-duplicate"
                        >
                          {isProcessing ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                              {selectedFile.size > 10 * 1024 * 1024 ? 'Processing on server...' : 'Duplicating Pages...'}
                            </>
                          ) : (
                            <>
                              <Copy className="w-4 h-4 mr-2" />
                              Duplicate Pages ({getTotalNewPages()} copies)
                            </>
                          )}
                        </Button>
                        
                        {getFinalPageCount() > 200 && (
                          <p className="text-sm text-gray-600 mt-2">
                            ⏱️ Large files may take 30-60 seconds to process
                          </p>
                        )}
                      </div>
                    )}

                    {/* Results Section */}
                    {duplicatedPdfUrl && (
                      <div className="bg-green-50 rounded-xl p-6 text-center" data-testid="duplicate-results">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <i className="fas fa-check text-2xl text-green-600"></i>
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">
                          Pages Successfully Duplicated!
                        </h3>
                        <p className="text-gray-600 mb-6">
                          Your PDF now contains {getFinalPageCount()} pages with {getTotalNewPages()} duplicated pages added.
                        </p>
                        <Button
                          onClick={downloadDuplicatedPDF}
                          className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-3"
                          data-testid="button-download"
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Download PDF with Duplicated Pages
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
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">How PDF Page Duplication Works</h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Upload className="w-8 h-8 text-orange-600" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">1. Upload PDF</h3>
                      <p className="text-gray-600">
                        Select a PDF file where you want to duplicate specific pages.
                      </p>
                    </div>
                    
                    <div className="text-center">
                      <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Copy className="w-8 h-8 text-red-600" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">2. Set Rules</h3>
                      <p className="text-gray-600">
                        Choose which pages to duplicate, how many copies, and where to insert them.
                      </p>
                    </div>
                    
                    <div className="text-center">
                      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Download className="w-8 h-8 text-green-600" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">3. Download</h3>
                      <p className="text-gray-600">
                        Get your PDF with duplicated pages inserted at the specified positions.
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
                        <h3 className="font-semibold text-gray-900">Multiple Duplication Rules</h3>
                        <p className="text-gray-600 text-sm">Set different duplication settings for multiple pages in one operation.</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mr-3 mt-1">
                        <i className="fas fa-check text-xs text-green-600"></i>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">Flexible Placement</h3>
                        <p className="text-gray-600 text-sm">Insert duplicated pages before or after the original page.</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mr-3 mt-1">
                        <i className="fas fa-check text-xs text-green-600"></i>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">Multiple Copies</h3>
                        <p className="text-gray-600 text-sm">Create up to 10 copies of any page in a single operation.</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mr-3 mt-1">
                        <i className="fas fa-check text-xs text-green-600"></i>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">Perfect Quality</h3>
                        <p className="text-gray-600 text-sm">Duplicated pages maintain original quality and formatting.</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* What is PDF Page Duplication */}
                <div className="bg-white rounded-2xl shadow-lg p-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-6">What is PDF Page Duplication?</h2>
                  <div className="prose max-w-none text-gray-600 leading-relaxed">
                    <p className="text-lg mb-4">
                      PDF page duplication is the process of creating exact copies of specific pages within a PDF document and inserting them at designated positions. This powerful technique allows you to repeat important pages, create multiple copies of forms, or build customized document structures without manually recreating content.
                    </p>
                    <p className="mb-4">
                      Unlike traditional copy-paste methods that can lose formatting and quality, professional PDF page duplication preserves all original elements including text formatting, images, fonts, colors, and layout structures. This ensures that duplicated pages maintain the exact appearance and functionality of the original.
                    </p>
                    <p className="mb-4">
                      Our advanced PDF page duplicator provides granular control over the duplication process, allowing you to specify exactly which pages to duplicate, how many copies to create, and where to position them within the document structure.
                    </p>
                  </div>
                </div>

                {/* Common Use Cases */}
                <div className="bg-white rounded-2xl shadow-lg p-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-6">Common Use Cases for PDF Page Duplication</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-6">
                      <div className="flex items-start">
                        <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center mr-4 mt-1 flex-shrink-0">
                          <i className="fas fa-file-invoice text-orange-600"></i>
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">Forms and Applications</h3>
                          <p className="text-gray-600">
                            Duplicate form pages to create multiple copies for different applicants or scenarios. Perfect for registration forms, surveys, and application documents.
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-4 mt-1 flex-shrink-0">
                          <i className="fas fa-graduation-cap text-blue-600"></i>
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">Educational Materials</h3>
                          <p className="text-gray-600">
                            Create multiple copies of worksheets, answer sheets, or reference pages for classroom distribution or student practice.
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start">
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-4 mt-1 flex-shrink-0">
                          <i className="fas fa-building text-green-600"></i>
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">Business Documentation</h3>
                          <p className="text-gray-600">
                            Duplicate contract pages, signature pages, or important clauses that need to appear multiple times in business documents.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div className="flex items-start">
                        <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mr-4 mt-1 flex-shrink-0">
                          <i className="fas fa-print text-purple-600"></i>
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">Print Optimization</h3>
                          <p className="text-gray-600">
                            Duplicate pages to optimize printing layouts, create booklets, or ensure proper page counts for binding requirements.
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start">
                        <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center mr-4 mt-1 flex-shrink-0">
                          <i className="fas fa-clipboard-list text-red-600"></i>
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">Template Creation</h3>
                          <p className="text-gray-600">
                            Build custom templates by duplicating header pages, footer pages, or standard sections that appear throughout documents.
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start">
                        <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center mr-4 mt-1 flex-shrink-0">
                          <i className="fas fa-copy text-yellow-600"></i>
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">Content Repetition</h3>
                          <p className="text-gray-600">
                            Repeat important information, instructions, or reference materials at multiple points within lengthy documents.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Benefits */}
                <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-2xl shadow-lg p-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-6">Benefits of Using Our PDF Page Duplicator</h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mx-auto mb-4">
                        <i className="fas fa-clock text-2xl text-orange-600"></i>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Time Efficiency</h3>
                      <p className="text-gray-600">
                        Duplicate multiple pages in seconds instead of manually copying and pasting content, saving hours of work.
                      </p>
                    </div>

                    <div className="text-center">
                      <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mx-auto mb-4">
                        <i className="fas fa-shield-alt text-2xl text-green-600"></i>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Quality Preservation</h3>
                      <p className="text-gray-600">
                        Maintain perfect quality with no loss of formatting, fonts, images, or layout elements during duplication.
                      </p>
                    </div>

                    <div className="text-center">
                      <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mx-auto mb-4">
                        <i className="fas fa-cog text-2xl text-blue-600"></i>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Flexible Control</h3>
                      <p className="text-gray-600">
                        Precise control over which pages to duplicate, quantity, and placement within your document structure.
                      </p>
                    </div>

                    <div className="text-center">
                      <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mx-auto mb-4">
                        <i className="fas fa-desktop text-2xl text-purple-600"></i>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">No Software Required</h3>
                      <p className="text-gray-600">
                        Work entirely online without installing expensive PDF editing software or plugins on your device.
                      </p>
                    </div>

                    <div className="text-center">
                      <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mx-auto mb-4">
                        <i className="fas fa-lock text-2xl text-red-600"></i>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Secure Processing</h3>
                      <p className="text-gray-600">
                        Your documents are processed securely with automatic deletion after processing, ensuring privacy.
                      </p>
                    </div>

                    <div className="text-center">
                      <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mx-auto mb-4">
                        <i className="fas fa-mobile-alt text-2xl text-indigo-600"></i>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Cross-Platform</h3>
                      <p className="text-gray-600">
                        Works seamlessly on all devices - desktop, tablet, and mobile - with responsive design.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Advanced Features */}
                <div className="bg-white rounded-2xl shadow-lg p-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-6">Advanced Page Duplication Features</h2>
                  <div className="space-y-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-4">Smart Processing Options</h3>
                        <ul className="space-y-3 text-gray-600">
                          <li className="flex items-start">
                            <span className="w-2 h-2 bg-orange-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                            <span>Automatic server processing for large files (10MB+) for optimal performance</span>
                          </li>
                          <li className="flex items-start">
                            <span className="w-2 h-2 bg-orange-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                            <span>Client-side processing for smaller files ensuring faster response times</span>
                          </li>
                          <li className="flex items-start">
                            <span className="w-2 h-2 bg-orange-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                            <span>Support for files up to 50MB with comprehensive error handling</span>
                          </li>
                          <li className="flex items-start">
                            <span className="w-2 h-2 bg-orange-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                            <span>Encrypted PDF handling with automatic password detection</span>
                          </li>
                        </ul>
                      </div>

                      <div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-4">Duplication Controls</h3>
                        <ul className="space-y-3 text-gray-600">
                          <li className="flex items-start">
                            <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                            <span>Multiple duplication rules per document with independent settings</span>
                          </li>
                          <li className="flex items-start">
                            <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                            <span>Flexible insertion points - before or after specified pages</span>
                          </li>
                          <li className="flex items-start">
                            <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                            <span>Up to 10 copies per page with intelligent validation</span>
                          </li>
                          <li className="flex items-start">
                            <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                            <span>Real-time preview of final document structure</span>
                          </li>
                        </ul>
                      </div>
                    </div>

                    <div className="border-t pt-8">
                      <h3 className="text-xl font-semibold text-gray-900 mb-4">Quality Assurance</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="text-center p-4 bg-gray-50 rounded-xl">
                          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                            <i className="fas fa-search text-blue-600"></i>
                          </div>
                          <h4 className="font-medium text-gray-900 mb-2">Format Validation</h4>
                          <p className="text-sm text-gray-600">
                            Comprehensive PDF format validation before processing to ensure compatibility.
                          </p>
                        </div>

                        <div className="text-center p-4 bg-gray-50 rounded-xl">
                          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                            <i className="fas fa-check-circle text-green-600"></i>
                          </div>
                          <h4 className="font-medium text-gray-900 mb-2">Error Recovery</h4>
                          <p className="text-sm text-gray-600">
                            Advanced error recovery mechanisms handle corrupted or problematic pages.
                          </p>
                        </div>

                        <div className="text-center p-4 bg-gray-50 rounded-xl">
                          <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                            <i className="fas fa-magic text-purple-600"></i>
                          </div>
                          <h4 className="font-medium text-gray-900 mb-2">Perfect Replication</h4>
                          <p className="text-sm text-gray-600">
                            Exact reproduction of all page elements including metadata and annotations.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Step by Step Guide */}
                <div className="bg-white rounded-2xl shadow-lg p-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-6">Step-by-Step Guide to Duplicate PDF Pages</h2>
                  <div className="space-y-6">
                    <div className="flex items-start">
                      <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                        <span className="text-orange-600 font-bold">1</span>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Upload Your PDF Document</h3>
                        <p className="text-gray-600 mb-3">
                          Click the upload area or drag and drop your PDF file. The tool supports files up to 50MB and automatically detects document properties including page count and dimensions.
                        </p>
                        <div className="bg-blue-50 p-3 rounded-lg">
                          <p className="text-sm text-blue-800">
                            <strong>Tip:</strong> Ensure your PDF is unlocked. If it's password-protected, unlock it first using our PDF Unlock tool.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-start">
                      <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                        <span className="text-orange-600 font-bold">2</span>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Create Duplication Rules</h3>
                        <p className="text-gray-600 mb-3">
                          Click "Add Duplication Rule" to create your first rule. Specify which page to duplicate, how many copies to create, and whether to insert them before or after the original page.
                        </p>
                        <div className="bg-green-50 p-3 rounded-lg">
                          <p className="text-sm text-green-800">
                            <strong>Example:</strong> To duplicate page 5 with 3 copies inserted after the original, set Page Number: 5, Duplicate Count: 3, Position: After page 5.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-start">
                      <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                        <span className="text-orange-600 font-bold">3</span>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Review Duplication Summary</h3>
                        <p className="text-gray-600 mb-3">
                          Check the summary panel to verify your settings. It shows the original page count, total duplicates to be added, and final document page count.
                        </p>
                        <div className="bg-yellow-50 p-3 rounded-lg">
                          <p className="text-sm text-yellow-800">
                            <strong>Warning:</strong> Large output files (500+ pages) may take longer to process. Plan accordingly for complex duplication tasks.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-start">
                      <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                        <span className="text-orange-600 font-bold">4</span>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Process and Download</h3>
                        <p className="text-gray-600 mb-3">
                          Click "Duplicate Pages" to start processing. The tool automatically chooses between client-side and server-side processing based on file size for optimal performance.
                        </p>
                        <div className="bg-purple-50 p-3 rounded-lg">
                          <p className="text-sm text-purple-800">
                            <strong>Processing:</strong> Files over 10MB use server processing for better performance, while smaller files are processed instantly in your browser.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Best Practices */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl shadow-lg p-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-6">Best Practices for PDF Page Duplication</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-4">Before You Start</h3>
                      <ul className="space-y-3">
                        <li className="flex items-start">
                          <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mr-3 mt-1 flex-shrink-0">
                            <i className="fas fa-check text-xs text-green-600"></i>
                          </div>
                          <span className="text-gray-700">Backup your original PDF file before making modifications</span>
                        </li>
                        <li className="flex items-start">
                          <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mr-3 mt-1 flex-shrink-0">
                            <i className="fas fa-check text-xs text-green-600"></i>
                          </div>
                          <span className="text-gray-700">Verify the document is unlocked and accessible</span>
                        </li>
                        <li className="flex items-start">
                          <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mr-3 mt-1 flex-shrink-0">
                            <i className="fas fa-check text-xs text-green-600"></i>
                          </div>
                          <span className="text-gray-700">Plan your duplication strategy before creating rules</span>
                        </li>
                        <li className="flex items-start">
                          <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mr-3 mt-1 flex-shrink-0">
                            <i className="fas fa-check text-xs text-green-600"></i>
                          </div>
                          <span className="text-gray-700">Check file size limits (50MB maximum) before uploading</span>
                        </li>
                      </ul>
                    </div>

                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-4">Optimization Tips</h3>
                      <ul className="space-y-3">
                        <li className="flex items-start">
                          <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-3 mt-1 flex-shrink-0">
                            <i className="fas fa-lightbulb text-xs text-blue-600"></i>
                          </div>
                          <span className="text-gray-700">Use batch duplication rules instead of individual operations</span>
                        </li>
                        <li className="flex items-start">
                          <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-3 mt-1 flex-shrink-0">
                            <i className="fas fa-lightbulb text-xs text-blue-600"></i>
                          </div>
                          <span className="text-gray-700">Keep duplicate counts reasonable (under 10 per page)</span>
                        </li>
                        <li className="flex items-start">
                          <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-3 mt-1 flex-shrink-0">
                            <i className="fas fa-lightbulb text-xs text-blue-600"></i>
                          </div>
                          <span className="text-gray-700">Consider final file size when duplicating large documents</span>
                        </li>
                        <li className="flex items-start">
                          <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-3 mt-1 flex-shrink-0">
                            <i className="fas fa-lightbulb text-xs text-blue-600"></i>
                          </div>
                          <span className="text-gray-700">Test with a small document first for complex operations</span>
                        </li>
                      </ul>
                    </div>
                  </div>

                  <div className="mt-8 p-6 bg-white rounded-xl border border-blue-200">
                    <div className="flex items-start">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-4 mt-1">
                        <i className="fas fa-info text-blue-600"></i>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">Performance Considerations</h4>
                        <p className="text-gray-600">
                          Large files (10MB+) are automatically processed on our servers for optimal performance. Smaller files are processed instantly in your browser for faster results. Complex duplication rules with multiple pages may take 30-60 seconds to complete.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* FAQ Section */}
                <div className="bg-white rounded-2xl shadow-lg p-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-8">Frequently Asked Questions</h2>
                  <div className="space-y-6">
                    <div className="border-b border-gray-200 pb-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Can I duplicate multiple different pages in one operation?</h3>
                      <p className="text-gray-600">
                        Yes! Our tool supports multiple duplication rules in a single operation. You can create separate rules for different pages, each with its own duplication count and insertion position. For example, you can duplicate page 2 (3 times) and page 5 (2 times) simultaneously.
                      </p>
                    </div>

                    <div className="border-b border-gray-200 pb-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">What happens to the quality of duplicated pages?</h3>
                      <p className="text-gray-600">
                        Duplicated pages maintain 100% original quality. All text, images, fonts, colors, formatting, and layout elements are preserved exactly as they appear in the original. The duplication process creates perfect copies without any quality loss or compression.
                      </p>
                    </div>

                    <div className="border-b border-gray-200 pb-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">How many pages can I duplicate at once?</h3>
                      <p className="text-gray-600">
                        You can duplicate up to 10 copies of any single page per rule, and create multiple rules for different pages. The tool supports PDFs with up to 1000 pages, and there's no limit on the number of duplication rules you can create for a single document.
                      </p>
                    </div>

                    <div className="border-b border-gray-200 pb-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Can I control where duplicated pages are inserted?</h3>
                      <p className="text-gray-600">
                        Absolutely! For each duplication rule, you can choose whether to insert the duplicated pages before or after the original page. This gives you complete control over the final document structure and page order.
                      </p>
                    </div>

                    <div className="border-b border-gray-200 pb-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">What file formats are supported?</h3>
                      <p className="text-gray-600">
                        The tool works exclusively with PDF files. It supports all standard PDF versions and formats, including PDFs created from various sources like Word, Excel, PowerPoint, and other document types. The maximum file size limit is 50MB.
                      </p>
                    </div>

                    <div className="border-b border-gray-200 pb-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Is there a difference between client and server processing?</h3>
                      <p className="text-gray-600">
                        Yes. Files under 10MB are processed directly in your browser (client-side) for instant results. Larger files are automatically processed on our servers for better performance and stability. Both methods produce identical quality results.
                      </p>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Are my documents secure during processing?</h3>
                      <p className="text-gray-600">
                        Your documents are completely secure. All processing happens either locally in your browser or on our encrypted servers. Server-processed files are automatically deleted immediately after processing, and no data is stored or logged.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Related Tools */}
                <div className="bg-white rounded-2xl shadow-lg p-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-6">Related PDF Tools</h2>
                  <p className="text-gray-600 mb-8">
                    Enhance your PDF workflow with these complementary tools designed to work perfectly with our page duplicator.
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
                      <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
                        <i className="fas fa-cut text-blue-600 text-xl"></i>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">PDF Page Extractor</h3>
                      <p className="text-gray-600 text-sm mb-4">
                        Extract specific pages from PDF documents to create focused documents or prepare pages for duplication.
                      </p>
                      <a href="/tools/extract-pdf-pages" className="text-blue-600 hover:text-blue-700 font-medium text-sm">
                        Try Page Extractor →
                      </a>
                    </div>

                    <div className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
                      <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-4">
                        <i className="fas fa-sort text-green-600 text-xl"></i>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">PDF Page Organizer</h3>
                      <p className="text-gray-600 text-sm mb-4">
                        Reorder, rearrange, and organize PDF pages after duplication to achieve the perfect document structure.
                      </p>
                      <a href="/tools/organize-pdf-pages" className="text-green-600 hover:text-green-700 font-medium text-sm">
                        Try Page Organizer →
                      </a>
                    </div>

                    <div className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
                      <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-4">
                        <i className="fas fa-compress text-purple-600 text-xl"></i>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">PDF Compressor</h3>
                      <p className="text-gray-600 text-sm mb-4">
                        Reduce file size of PDFs with duplicated pages while maintaining quality for easier sharing and storage.
                      </p>
                      <a href="/tools/compress-pdf-tool" className="text-purple-600 hover:text-purple-700 font-medium text-sm">
                        Try PDF Compressor →
                      </a>
                    </div>

                    <div className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
                      <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center mb-4">
                        <i className="fas fa-layer-group text-red-600 text-xl"></i>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">PDF Merger</h3>
                      <p className="text-gray-600 text-sm mb-4">
                        Combine multiple PDFs with duplicated pages into a single comprehensive document.
                      </p>
                      <a href="/tools/merge-pdf" className="text-red-600 hover:text-red-700 font-medium text-sm">
                        Try PDF Merger →
                      </a>
                    </div>

                    <div className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
                      <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mb-4">
                        <i className="fas fa-scissors text-orange-600 text-xl"></i>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">PDF Splitter</h3>
                      <p className="text-gray-600 text-sm mb-4">
                        Split large PDFs with duplicated pages into smaller, more manageable documents by page ranges.
                      </p>
                      <a href="/tools/split-pdf" className="text-orange-600 hover:text-orange-700 font-medium text-sm">
                        Try PDF Splitter →
                      </a>
                    </div>

                    <div className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
                      <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center mb-4">
                        <i className="fas fa-sync-alt text-indigo-600 text-xl"></i>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">PDF Rotator</h3>
                      <p className="text-gray-600 text-sm mb-4">
                        Rotate pages in your PDF documents before or after duplication to ensure proper orientation.
                      </p>
                      <a href="/tools/rotate-pdf" className="text-indigo-600 hover:text-indigo-700 font-medium text-sm">
                        Try PDF Rotator →
                      </a>
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

export default PDFPageDuplicator;
