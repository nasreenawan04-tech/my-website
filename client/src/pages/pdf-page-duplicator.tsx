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
