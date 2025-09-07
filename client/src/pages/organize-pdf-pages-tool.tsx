import { useState, useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Upload, FileText, Download, Trash2, ArrowUpDown, GripVertical, X, RotateCcw } from 'lucide-react';

interface PDFFile {
  id: string;
  file: File;
  name: string;
  size: string;
}

interface PageInfo {
  index: number;
  width: number;
  height: number;
  ratio: number;
}

interface PDFPageData {
  totalPages: number;
  pages: PageInfo[];
}

const OrganizePDFPagesTool = () => {
  const [pdfFile, setPdfFile] = useState<PDFFile | null>(null);
  const [pageData, setPageData] = useState<PDFPageData | null>(null);
  const [pageOrder, setPageOrder] = useState<number[]>([]);
  const [organizedPdfUrl, setOrganizedPdfUrl] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragOver, setDragOver] = useState(false);
  const [draggedPageIndex, setDraggedPageIndex] = useState<number | null>(null);
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

  const handleFileSelect = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const file = files[0];
    if (file.type === 'application/pdf') {
      const pdfFileObj = {
        id: generateId(),
        file,
        name: file.name,
        size: formatFileSize(file.size)
      };
      
      setPdfFile(pdfFileObj);
      setPageData(null);
      setPageOrder([]);
      setOrganizedPdfUrl(null);
      
      // Analyze PDF pages
      await analyzePDFPages(file);
    } else {
      alert('Please select a valid PDF file. Only PDF files are supported.');
    }
  };

  const analyzePDFPages = async (file: File) => {
    setIsAnalyzing(true);
    
    try {
      const formData = new FormData();
      formData.append('pdf', file);
      
      const response = await fetch('/api/pdf-page-info', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Server error: ${response.status}`);
      }

      const data = await response.json();
      setPageData(data);
      // Initialize page order with original sequence
      setPageOrder(Array.from({ length: data.totalPages }, (_, i) => i));
      
    } catch (error) {
      console.error('Error analyzing PDF:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      // Better error handling with user-friendly messages
      if (errorMessage.includes('ENOENT')) {
        alert('Upload failed. Please try again with a valid PDF file.');
      } else if (errorMessage.includes('Invalid PDF')) {
        alert('The selected file appears to be corrupted or is not a valid PDF. Please try another file.');
      } else {
        alert(`Error analyzing PDF: ${errorMessage}. Please try again with a valid PDF file.`);
      }
    }

    setIsAnalyzing(false);
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

  const handlePageDragStart = (e: React.DragEvent, pageIndex: number) => {
    setDraggedPageIndex(pageIndex);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handlePageDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handlePageDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    
    if (draggedPageIndex === null || draggedPageIndex === targetIndex) {
      setDraggedPageIndex(null);
      return;
    }

    const newOrder = [...pageOrder];
    const draggedPage = newOrder[draggedPageIndex];
    
    // Remove dragged page
    newOrder.splice(draggedPageIndex, 1);
    
    // Insert at new position
    const insertIndex = draggedPageIndex < targetIndex ? targetIndex - 1 : targetIndex;
    newOrder.splice(insertIndex, 0, draggedPage);
    
    setPageOrder(newOrder);
    setDraggedPageIndex(null);
  };

  const removePage = (index: number) => {
    const newOrder = pageOrder.filter((_, i) => i !== index);
    setPageOrder(newOrder);
  };

  const resetOrder = () => {
    if (pageData) {
      setPageOrder(Array.from({ length: pageData.totalPages }, (_, i) => i));
    }
  };

  const organizePDF = async () => {
    if (!pdfFile || pageOrder.length === 0) return;

    setIsProcessing(true);
    
    try {
      const formData = new FormData();
      formData.append('pdf', pdfFile.file);
      formData.append('pageOrder', JSON.stringify(pageOrder));
      
      const response = await fetch('/api/organize-pdf-pages', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Server error: ${response.status}`);
      }

      const organizedBlob = await response.blob();
      const url = URL.createObjectURL(organizedBlob);
      setOrganizedPdfUrl(url);
      
    } catch (error) {
      console.error('Error organizing PDF:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      // Better error handling for organization failures
      if (errorMessage.includes('timeout')) {
        alert('The PDF is taking too long to process. Please try with a smaller file or try again later.');
      } else if (errorMessage.includes('memory')) {
        alert('The PDF file is too large to process. Please try with a smaller file.');
      } else {
        alert(`Error organizing PDF: ${errorMessage}. Please try again.`);
      }
    }

    setIsProcessing(false);
  };

  const downloadOrganizedPDF = () => {
    if (!organizedPdfUrl || !pdfFile) return;

    const link = document.createElement('a');
    link.href = organizedPdfUrl;
    link.download = `organized-${pdfFile.name}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const resetTool = () => {
    setPdfFile(null);
    setPageData(null);
    setPageOrder([]);
    setOrganizedPdfUrl(null);
    if (organizedPdfUrl) {
      URL.revokeObjectURL(organizedPdfUrl);
    }
  };

  return (
    <>
      <Helmet>
        <title>Organize PDF Pages - Reorder & Rearrange PDF Pages | ToolsHub</title>
        <meta name="description" content="Organize PDF pages by reordering, removing, and rearranging them. Drag and drop to reorganize your PDF documents easily." />
        <meta name="keywords" content="organize PDF pages, reorder PDF, rearrange PDF pages, sort PDF pages, PDF page organizer" />
        <meta property="og:title" content="Organize PDF Pages - Reorder & Rearrange PDF Pages | ToolsHub" />
        <meta property="og:description" content="Easily organize PDF pages with drag and drop functionality. Reorder, remove, and rearrange pages in your documents." />
        <meta property="og:type" content="website" />
        <link rel="canonical" href="/tools/organize-pdf-pages" />
      </Helmet>

      <div className="min-h-screen flex flex-col" data-testid="page-organize-pdf">
        <Header />
        
        <main className="flex-1 bg-neutral-50">
          {/* Hero Section */}
          <section className="bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-700 text-white py-16">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <div className="w-20 h-20 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <ArrowUpDown className="w-8 h-8" />
              </div>
              <h1 className="text-4xl sm:text-5xl font-bold mb-6" data-testid="text-page-title">
                Organize PDF Pages
              </h1>
              <p className="text-xl text-blue-100 max-w-2xl mx-auto">
                Reorder, remove, and rearrange pages in your PDF documents with easy drag-and-drop functionality.
              </p>
            </div>
          </section>

          {/* Tool Section */}
          <section className="py-16">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
              {/* Upload Section */}
              {!pageData && (
                <Card className="bg-white shadow-sm border-0 max-w-4xl mx-auto">
                  <CardContent className="p-8">
                    <h2 className="text-2xl font-semibold text-gray-900 mb-6 text-center">Select PDF File</h2>
                    
                    <div
                      className={`border-2 border-dashed rounded-xl p-12 text-center transition-colors ${
                        dragOver 
                          ? 'border-blue-500 bg-blue-50' 
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
                        or click to select a PDF from your computer
                      </p>
                      <Button
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                        data-testid="button-select-file"
                        disabled={isAnalyzing}
                      >
                        {isAnalyzing ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Analyzing PDF... ({Math.round(uploadProgress)}%)
                          </>
                        ) : (
                          'Select PDF File'
                        )}
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

                    {/* Selected File */}
                    {pdfFile && (
                      <div className="mt-6">
                        <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                          <FileText className="w-6 h-6 text-blue-600" />
                          <div className="flex-1">
                            <div className="font-medium text-gray-900">{pdfFile.name}</div>
                            <div className="text-sm text-gray-600">{pdfFile.size}</div>
                          </div>
                          <Button
                            onClick={resetTool}
                            variant="outline"
                            size="sm"
                            className="text-blue-600 border-blue-200 hover:bg-blue-50"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Remove
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Page Organization Section */}
              {pageData && (
                <div className="space-y-8">
                  {/* Controls */}
                  <div className="bg-white rounded-2xl shadow-lg p-6">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <div>
                        <h2 className="text-2xl font-semibold text-gray-900 mb-2">Organize Pages</h2>
                        <p className="text-gray-600">
                          Drag and drop pages to reorder them, or click the X to remove pages.
                        </p>
                        <p className="text-sm text-blue-600 mt-1">
                          Total: {pageOrder.length} of {pageData.totalPages} pages
                        </p>
                      </div>
                      <div className="flex gap-3">
                        <Button
                          onClick={resetOrder}
                          variant="outline"
                          className="text-gray-600 border-gray-300 hover:bg-gray-50"
                          data-testid="button-reset-order"
                        >
                          <RotateCcw className="w-4 h-4 mr-2" />
                          Reset Order
                        </Button>
                        <Button
                          onClick={resetTool}
                          variant="outline"
                          className="text-blue-600 border-blue-200 hover:bg-blue-50"
                        >
                          <Upload className="w-4 h-4 mr-2" />
                          New PDF
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Page Grid */}
                  <div className="bg-white rounded-2xl shadow-lg p-6">
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                      {pageOrder.map((originalIndex, currentIndex) => {
                        const page = pageData.pages[originalIndex];
                        return (
                          <div
                            key={`${originalIndex}-${currentIndex}`}
                            className={`relative bg-gray-50 border-2 rounded-lg p-3 cursor-move transition-all hover:shadow-md group ${
                              draggedPageIndex === currentIndex ? 'opacity-50 border-blue-500' : 'border-gray-200 hover:border-blue-300'
                            }`}
                            draggable
                            onDragStart={(e) => handlePageDragStart(e, currentIndex)}
                            onDragOver={handlePageDragOver}
                            onDrop={(e) => handlePageDrop(e, currentIndex)}
                            data-testid={`page-${currentIndex}`}
                          >
                            {/* Remove button */}
                            <button
                              onClick={() => removePage(currentIndex)}
                              className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 flex items-center justify-center"
                              data-testid={`remove-page-${currentIndex}`}
                            >
                              <X className="w-3 h-3" />
                            </button>

                            {/* Drag handle */}
                            <div className="absolute top-2 left-2 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">
                              <GripVertical className="w-4 h-4" />
                            </div>

                            {/* Page preview */}
                            <div 
                              className="bg-white border border-gray-200 rounded aspect-[3/4] flex items-center justify-center mb-2"
                              style={{ aspectRatio: `${page.ratio}` }}
                            >
                              <FileText className="w-8 h-8 text-gray-400" />
                            </div>

                            {/* Page info */}
                            <div className="text-center">
                              <div className="text-sm font-medium text-gray-900">
                                Page {originalIndex + 1}
                              </div>
                              <div className="text-xs text-gray-500">
                                {page.width} × {page.height}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Action Section */}
                  <div className="text-center">
                    <Button
                      onClick={organizePDF}
                      disabled={isProcessing || pageOrder.length === 0}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg"
                      data-testid="button-organize"
                    >
                      {isProcessing ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Organizing PDF... This may take a moment for large files.
                        </>
                      ) : (
                        <>
                          <ArrowUpDown className="w-4 h-4 mr-2" />
                          Organize PDF
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              )}

              {/* Results Section */}
              {organizedPdfUrl && (
                <div className="mt-8">
                  <Card className="bg-green-50 border-green-200">
                    <CardContent className="p-6 text-center">
                      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <ArrowUpDown className="w-8 h-8 text-green-600" />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        PDF Pages Organized Successfully!
                      </h3>
                      <p className="text-gray-600 mb-4">
                        Your PDF has been reorganized with {pageOrder.length} pages in the new order.
                      </p>
                      <Button
                        onClick={downloadOrganizedPDF}
                        className="bg-green-600 hover:bg-green-700 text-white px-6 py-3"
                        data-testid="button-download"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download Organized PDF
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Educational Content */}
              <div className="mt-12 space-y-8">
                {/* How it Works */}
                <div className="bg-white rounded-2xl shadow-lg p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">How to Organize PDF Pages</h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Upload className="w-8 h-8 text-blue-600" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">1. Upload PDF</h3>
                      <p className="text-gray-600">
                        Upload your PDF file and we'll analyze it to show you all the pages.
                      </p>
                    </div>
                    
                    <div className="text-center">
                      <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <GripVertical className="w-8 h-8 text-purple-600" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">2. Drag & Drop</h3>
                      <p className="text-gray-600">
                        Drag pages to reorder them or click the X button to remove unwanted pages.
                      </p>
                    </div>
                    
                    <div className="text-center">
                      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Download className="w-8 h-8 text-green-600" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">3. Download</h3>
                      <p className="text-gray-600">
                        Generate and download your newly organized PDF with the desired page order.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Features */}
                <div className="bg-white rounded-2xl shadow-lg p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Organization Features</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <ArrowUpDown className="w-4 h-4 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-1">Drag & Drop Reordering</h3>
                        <p className="text-gray-600 text-sm">
                          Easily reorder pages by dragging and dropping them into your desired sequence.
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <X className="w-4 h-4 text-red-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-1">Page Removal</h3>
                        <p className="text-gray-600 text-sm">
                          Remove unwanted pages by clicking the X button on any page you don't need.
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <FileText className="w-4 h-4 text-green-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-1">Page Preview</h3>
                        <p className="text-gray-600 text-sm">
                          View page dimensions and numbers to help you organize your document effectively.
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <RotateCcw className="w-4 h-4 text-purple-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-1">Reset Option</h3>
                        <p className="text-gray-600 text-sm">
                          Quickly reset to the original page order if you want to start over.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* FAQ */}
                <div className="bg-white rounded-2xl shadow-lg p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Frequently Asked Questions</h2>
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">Can I duplicate pages or add the same page multiple times?</h3>
                      <p className="text-gray-600 text-sm">
                        Currently, each page can only appear once in the organized PDF. Each page from the original 
                        document can be included or excluded, but not duplicated.
                      </p>
                    </div>
                    
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">What happens to the original PDF formatting?</h3>
                      <p className="text-gray-600 text-sm">
                        The page content, formatting, and quality remain exactly the same. Only the order and 
                        selection of pages change in the organized PDF.
                      </p>
                    </div>
                    
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">Is there a limit to the number of pages?</h3>
                      <p className="text-gray-600 text-sm">
                        Our tool supports PDFs with hundreds of pages. Very large documents may take longer to 
                        process but should work without issues.
                      </p>
                    </div>
                    
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">Can I undo changes after organizing?</h3>
                      <p className="text-gray-600 text-sm">
                        Yes! Use the "Reset Order" button to return to the original page sequence, or upload 
                        a new PDF to start fresh at any time.
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

export default OrganizePDFPagesTool;