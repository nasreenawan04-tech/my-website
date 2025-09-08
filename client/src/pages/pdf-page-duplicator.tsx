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
    if (file.type !== 'application/pdf') {
      setError('Please select a PDF file.');
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
    setDuplications(prev => prev.map((dup, i) => 
      i === index ? { ...dup, [field]: value } : dup
    ));
  };

  const duplicatePages = async () => {
    if (!selectedFile || duplications.length === 0) return;

    setIsProcessing(true);
    setError(null);

    try {
      const { PDFDocument } = await import('pdf-lib');
      
      const arrayBuffer = await selectedFile.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      const newPdfDoc = await PDFDocument.create();
      
      const originalPages = pdfDoc.getPages();
      const pagesToAdd: any[] = [];

      // First, copy all original pages
      for (let i = 0; i < originalPages.length; i++) {
        const [embeddedPage] = await newPdfDoc.embedPages([originalPages[i]]);
        const { width, height } = originalPages[i].getSize();
        const newPage = newPdfDoc.addPage([width, height]);
        newPage.drawPage(embeddedPage, { x: 0, y: 0, width, height });
        pagesToAdd.push({ type: 'original', pageIndex: i, page: newPage });
      }

      // Sort duplications by page number in reverse order to maintain correct insertion positions
      const sortedDuplications = [...duplications].sort((a, b) => b.pageNumber - a.pageNumber);

      // Add duplications
      for (const duplication of sortedDuplications) {
        const { pageNumber, duplicateCount, insertAfter } = duplication;
        const sourcePageIndex = pageNumber - 1; // Convert to 0-based index
        
        if (sourcePageIndex < 0 || sourcePageIndex >= originalPages.length) {
          continue; // Skip invalid page numbers
        }

        const sourcePage = originalPages[sourcePageIndex];
        const { width, height } = sourcePage.getSize();
        
        // Create duplicates
        const newDuplicates = [];
        for (let i = 0; i < duplicateCount; i++) {
          const [embeddedPage] = await newPdfDoc.embedPages([sourcePage]);
          const duplicatePage = newPdfDoc.addPage([width, height]);
          duplicatePage.drawPage(embeddedPage, { x: 0, y: 0, width, height });
          newDuplicates.push({
            type: 'duplicate',
            sourcePageIndex,
            page: duplicatePage
          });
        }

        // Insert duplicates at the correct position
        const insertPosition = insertAfter ? sourcePageIndex + 1 : sourcePageIndex;
        pagesToAdd.splice(insertPosition, 0, ...newDuplicates);
      }

      // Create final PDF with all pages in correct order
      const finalPdfDoc = await PDFDocument.create();
      
      for (const pageInfo of pagesToAdd) {
        const { width, height } = pageInfo.page.getSize();
        const finalPage = finalPdfDoc.addPage([width, height]);
        
        // Get the page content (this is simplified - in practice, you'd need to copy all content)
        const [embeddedPage] = await finalPdfDoc.embedPages([pageInfo.page]);
        finalPage.drawPage(embeddedPage, { x: 0, y: 0, width, height });
      }

      const pdfBytes = await finalPdfDoc.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      setDuplicatedPdfUrl(url);
    } catch (error) {
      console.error('Error duplicating PDF pages:', error);
      setError('Error duplicating PDF pages. Please check your page numbers and try again.');
    }

    setIsProcessing(false);
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
                              Duplicating Pages...
                            </>
                          ) : (
                            <>
                              <Copy className="w-4 h-4 mr-2" />
                              Duplicate Pages ({getTotalNewPages()} copies)
                            </>
                          )}
                        </Button>
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
import { useState, useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const PDFPageDuplicator = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [duplicateCount, setDuplicateCount] = useState<number>(1);
  const [insertAfter, setInsertAfter] = useState<boolean>(true);
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

  const handleDuplicatePage = async () => {
    if (!selectedFile) {
      alert('Please select a PDF file first.');
      return;
    }

    setIsProcessing(true);
    
    try {
      const formData = new FormData();
      formData.append('pdf', selectedFile);
      formData.append('pageNumber', pageNumber.toString());
      formData.append('duplicateCount', duplicateCount.toString());
      formData.append('insertAfter', insertAfter.toString());

      const response = await fetch('/api/pdf/duplicate-page', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = `${selectedFile.name.replace('.pdf', '')}_page_duplicated.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        throw new Error('Failed to duplicate PDF page');
      }
    } catch (error) {
      console.error('Error duplicating PDF page:', error);
      alert('An error occurred while duplicating the PDF page. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const resetForm = () => {
    setSelectedFile(null);
    setPageNumber(1);
    setDuplicateCount(1);
    setInsertAfter(true);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <>
      <Helmet>
        <title>PDF Page Duplicator - Duplicate Specific Pages | ToolsHub</title>
        <meta name="description" content="Duplicate specific pages within a PDF document. Free online PDF page duplication tool." />
        <meta name="keywords" content="PDF page duplicator, duplicate PDF pages, copy PDF pages, PDF page manipulation" />
      </Helmet>

      <div className="min-h-screen flex flex-col">
        <Header />

        <main className="flex-1 bg-neutral-50">
          <section className="bg-gradient-to-r from-purple-600 via-purple-500 to-indigo-700 text-white py-16">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <div className="w-20 h-20 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <i className="fas fa-copy text-3xl"></i>
              </div>
              <h1 className="text-4xl sm:text-5xl font-bold mb-4">
                PDF Page Duplicator
              </h1>
              <p className="text-xl text-purple-100 mb-8 max-w-2xl mx-auto">
                Duplicate specific pages within a PDF document to create multiple copies
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
                      className="w-full p-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>

                  {selectedFile && (
                    <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                      <p className="text-purple-800">
                        <i className="fas fa-file-pdf mr-2"></i>
                        Selected: {selectedFile.name}
                      </p>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-2">
                        Page Number to Duplicate
                      </label>
                      <input
                        type="number"
                        value={pageNumber}
                        onChange={(e) => setPageNumber(Number(e.target.value))}
                        className="w-full p-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                        min="1"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-2">
                        Number of Duplicates
                      </label>
                      <input
                        type="number"
                        value={duplicateCount}
                        onChange={(e) => setDuplicateCount(Number(e.target.value))}
                        className="w-full p-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                        min="1"
                        max="10"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-2">
                        Insert Position
                      </label>
                      <select
                        value={insertAfter ? 'after' : 'before'}
                        onChange={(e) => setInsertAfter(e.target.value === 'after')}
                        className="w-full p-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                      >
                        <option value="after">After original page</option>
                        <option value="before">Before original page</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4 pt-6">
                    <button
                      onClick={handleDuplicatePage}
                      disabled={!selectedFile || isProcessing}
                      className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-700 text-white px-6 py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-indigo-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isProcessing ? (
                        <>
                          <i className="fas fa-spinner fa-spin mr-2"></i>
                          Duplicating Page...
                        </>
                      ) : (
                        <>
                          <i className="fas fa-copy mr-2"></i>
                          Duplicate Page
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

export default PDFPageDuplicator;
