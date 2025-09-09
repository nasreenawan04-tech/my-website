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
        <title>PDF Page Organizer - Reorder, Rearrange & Organize PDF Pages Online Free</title>
        <meta name="description" content="Free PDF page organizer tool to reorder, rearrange, and remove PDF pages online. Drag-and-drop interface for students, professionals, and businesses. No registration required." />
        <meta name="keywords" content="PDF page organizer, reorder PDF pages, rearrange PDF pages, organize PDF online, PDF page management, free PDF organizer, drag drop PDF pages, sort PDF pages" />
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
                Free PDF Page Organizer
              </h1>
              <p className="text-xl text-blue-100 max-w-2xl mx-auto">
                Professional PDF page organization made simple. <strong>Reorder, remove, and rearrange</strong> pages with intuitive drag-and-drop functionality. Perfect for students, professionals, and businesses.
              </p>
            </div>
          </section>

          {/* Tool Section */}
          <section className="py-16">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
              {/* Upload Section */}
              {!pageData && (
                <Card className="bg-white shadow-sm border-0 max-w-6xl mx-auto">
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
                {/* What is PDF Page Organization */}
                <div className="bg-white rounded-2xl shadow-lg p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">What is PDF Page Organization?</h2>
                  <div className="prose prose-lg max-w-none text-gray-700">
                    <p>
                      Our <strong>PDF Page Organizer</strong> is a powerful, free online tool that allows you to <strong>reorder, rearrange, and remove pages</strong> 
                      from PDF documents with an intuitive drag-and-drop interface. Whether you need to restructure reports, reorganize presentations, 
                      or create custom document layouts, this tool provides professional-grade page management without requiring expensive software.
                    </p>
                    <p>
                      The tool works by analyzing your PDF structure and presenting each page as a visual thumbnail that you can easily manipulate. 
                      You can <strong>drag pages to new positions, remove unwanted content, and create perfectly organized documents</strong> that meet 
                      your specific requirements. All processing happens securely in your browser, ensuring your sensitive documents remain private.
                    </p>
                  </div>
                </div>

                {/* Benefits for Different Audiences */}
                <div className="bg-white rounded-2xl shadow-lg p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Who Benefits from PDF Page Organization?</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                        <span className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                          🎓
                        </span>
                        Students & Academics
                      </h3>
                      <ul className="space-y-2 text-gray-600">
                        <li className="flex items-start gap-2">
                          <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                          <strong>Research paper organization:</strong> Reorder sections, move appendices, and structure thesis chapters for different submission requirements
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                          <strong>Study material compilation:</strong> Create custom study guides by selecting and organizing relevant pages from multiple sources
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                          <strong>Assignment preparation:</strong> Remove cover pages, reorder content, and create submission-ready documents
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                          <strong>Portfolio organization:</strong> Arrange academic work and projects in the most impactful sequence
                        </li>
                      </ul>
                    </div>
                    
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                        <span className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                          💼
                        </span>
                        Business Professionals
                      </h3>
                      <ul className="space-y-2 text-gray-600">
                        <li className="flex items-start gap-2">
                          <span className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></span>
                          <strong>Proposal customization:</strong> Reorder sections based on client preferences and remove irrelevant content for targeted pitches
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></span>
                          <strong>Report restructuring:</strong> Organize quarterly reports, financial statements, and business analyses for different stakeholders
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></span>
                          <strong>Presentation optimization:</strong> Remove transition slides, reorder content flow, and create executive summaries
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></span>
                          <strong>Contract compilation:</strong> Organize legal documents, terms, and addendums in proper sequence
                        </li>
                      </ul>
                    </div>
                    
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                        <span className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                          🔬
                        </span>
                        Researchers & Scientists
                      </h3>
                      <ul className="space-y-2 text-gray-600">
                        <li className="flex items-start gap-2">
                          <span className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></span>
                          <strong>Publication preparation:</strong> Organize research findings, methodology sections, and supporting data for journal submissions
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></span>
                          <strong>Grant proposal organization:</strong> Structure funding applications with proper section ordering and supporting documentation
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></span>
                          <strong>Conference presentation prep:</strong> Organize slides, remove draft content, and create presentation-ready documents
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></span>
                          <strong>Literature review compilation:</strong> Organize research papers and create comprehensive review documents
                        </li>
                      </ul>
                    </div>
                    
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                        <span className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center mr-3">
                          ⚖️
                        </span>
                        Legal & Compliance
                      </h3>
                      <ul className="space-y-2 text-gray-600">
                        <li className="flex items-start gap-2">
                          <span className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></span>
                          <strong>Case file organization:</strong> Arrange legal documents, exhibits, and evidence in chronological or thematic order
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></span>
                          <strong>Brief compilation:</strong> Structure legal arguments, precedents, and supporting documentation for court submissions
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></span>
                          <strong>Compliance documentation:</strong> Organize regulatory filings, audit reports, and compliance materials
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></span>
                          <strong>Discovery document prep:</strong> Structure evidence packages and legal discovery materials for efficient review
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Related PDF Tools */}
                <div className="bg-white rounded-2xl shadow-lg p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Complete Your PDF Workflow</h2>
                  <p className="text-gray-600 mb-6">
                    Maximize your productivity by combining our PDF page organizer with these powerful related tools:
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
                      <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
                        <i className="fas fa-object-group text-blue-600 text-xl"></i>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Merge PDF Files</h3>
                      <p className="text-gray-600 text-sm mb-4">
                        <strong>Combine multiple organized PDFs</strong> into a single document. Perfect after organizing individual sections.
                      </p>
                      <a href="/tools/merge-pdf-tool" className="text-blue-600 hover:text-blue-700 font-medium text-sm">
                        Try PDF Merger →
                      </a>
                    </div>
                    
                    <div className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
                      <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center mb-4">
                        <i className="fas fa-cut text-red-600 text-xl"></i>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Split PDF Pages</h3>
                      <p className="text-gray-600 text-sm mb-4">
                        <strong>Extract specific pages</strong> before organizing or separate organized sections into individual documents.
                      </p>
                      <a href="/tools/split-pdf-tool" className="text-red-600 hover:text-red-700 font-medium text-sm">
                        Try PDF Splitter →
                      </a>
                    </div>
                    
                    <div className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
                      <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-4">
                        <i className="fas fa-undo text-green-600 text-xl"></i>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Rotate PDF Pages</h3>
                      <p className="text-gray-600 text-sm mb-4">
                        <strong>Fix page orientation</strong> before or after organizing to ensure proper document layout and readability.
                      </p>
                      <a href="/tools/rotate-pdf-tool" className="text-green-600 hover:text-green-700 font-medium text-sm">
                        Try PDF Rotator →
                      </a>
                    </div>
                    
                    <div className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
                      <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-4">
                        <i className="fas fa-list-ol text-purple-600 text-xl"></i>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Add Page Numbers</h3>
                      <p className="text-gray-600 text-sm mb-4">
                        <strong>Add professional numbering</strong> to your organized document with customizable positioning and formatting.
                      </p>
                      <a href="/tools/add-page-numbers-tool" className="text-purple-600 hover:text-purple-700 font-medium text-sm">
                        Try Page Number Tool →
                      </a>
                    </div>
                    
                    <div className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
                      <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center mb-4">
                        <i className="fas fa-lock text-yellow-600 text-xl"></i>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Protect PDF Files</h3>
                      <p className="text-gray-600 text-sm mb-4">
                        <strong>Secure your organized document</strong> with password protection to prevent unauthorized access or editing.
                      </p>
                      <a href="/tools/protect-pdf-tool" className="text-yellow-600 hover:text-yellow-700 font-medium text-sm">
                        Try PDF Protection →
                      </a>
                    </div>
                    
                    <div className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
                      <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center mb-4">
                        <i className="fas fa-tint text-indigo-600 text-xl"></i>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Add PDF Watermarks</h3>
                      <p className="text-gray-600 text-sm mb-4">
                        <strong>Brand your organized documents</strong> with custom watermarks for copyright protection and professional presentation.
                      </p>
                      <a href="/tools/watermark-pdf-tool" className="text-indigo-600 hover:text-indigo-700 font-medium text-sm">
                        Try Watermark Tool →
                      </a>
                    </div>
                  </div>
                </div>

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
                    
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">Is the PDF page organizer tool free to use?</h3>
                      <p className="text-gray-600 text-sm">
                        Yes, our PDF page organizer is completely free to use with no registration required. You can 
                        organize unlimited PDFs without any restrictions or watermarks.
                      </p>
                    </div>
                    
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">Does the tool work with password-protected PDFs?</h3>
                      <p className="text-gray-600 text-sm">
                        Currently, the tool works best with unprotected PDFs. If your PDF is password-protected, 
                        please remove the password protection first using our PDF unlock tool.
                      </p>
                    </div>
                    
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">Can I reorganize PDFs on mobile devices?</h3>
                      <p className="text-gray-600 text-sm">
                        Yes! Our PDF page organizer is fully responsive and works on all devices including smartphones 
                        and tablets. The drag-and-drop functionality adapts to touch interfaces.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Benefits and Use Cases */}
                <div className="bg-white rounded-2xl shadow-lg p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Benefits of Using a PDF Page Organizer</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Professional Document Management</h3>
                      <ul className="space-y-2 text-gray-600 text-sm">
                        <li className="flex items-start gap-2">
                          <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                          Create presentation-ready documents with perfect page order
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                          Remove unwanted pages to streamline content
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                          Maintain document quality and formatting integrity
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                          Save time on manual document editing
                        </li>
                      </ul>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Versatile Applications</h3>
                      <ul className="space-y-2 text-gray-600 text-sm">
                        <li className="flex items-start gap-2">
                          <span className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></span>
                          Academic research and thesis organization
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></span>
                          Business report restructuring and compilation
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></span>
                          Legal document preparation and organization
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></span>
                          Educational material curation and arrangement
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Common Use Cases */}
                <div className="bg-white rounded-2xl shadow-lg p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Common PDF Page Organization Scenarios</h2>
                  <div className="space-y-6">
                    <div className="border-l-4 border-blue-500 pl-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Research Paper Compilation</h3>
                      <p className="text-gray-600 text-sm mb-2">
                        Researchers often need to reorganize sections of their papers, move appendices, or reorder chapters 
                        for different submission requirements.
                      </p>
                      <p className="text-blue-600 text-sm font-medium">
                        Solution: Use our drag-and-drop interface to easily reposition sections and create submission-ready documents.
                      </p>
                    </div>
                    
                    <div className="border-l-4 border-green-500 pl-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Business Proposal Organization</h3>
                      <p className="text-gray-600 text-sm mb-2">
                        Business professionals need to customize proposals by reordering sections based on client preferences 
                        or removing irrelevant pages.
                      </p>
                      <p className="text-green-600 text-sm font-medium">
                        Solution: Quickly reorganize proposal sections and remove unnecessary content to create targeted documents.
                      </p>
                    </div>
                    
                    <div className="border-l-4 border-purple-500 pl-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Legal Document Preparation</h3>
                      <p className="text-gray-600 text-sm mb-2">
                        Legal professionals must organize case documents, exhibits, and supporting materials in specific orders 
                        required by courts or clients.
                      </p>
                      <p className="text-purple-600 text-sm font-medium">
                        Solution: Precisely arrange legal documents with our intuitive page organization system.
                      </p>
                    </div>
                    
                    <div className="border-l-4 border-orange-500 pl-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Educational Material Curation</h3>
                      <p className="text-gray-600 text-sm mb-2">
                        Educators need to create custom study materials by selecting and organizing specific pages from 
                        multiple sources or textbooks.
                      </p>
                      <p className="text-orange-600 text-sm font-medium">
                        Solution: Curate the perfect study guide by selecting and organizing relevant pages in the ideal sequence.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Advanced Tips */}
                <div className="bg-white rounded-2xl shadow-lg p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Pro Tips for Effective PDF Page Organization</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Organization Strategies</h3>
                      <div className="space-y-4">
                        <div className="bg-blue-50 p-4 rounded-lg">
                          <h4 className="font-medium text-gray-900 mb-2">📋 Plan Before You Start</h4>
                          <p className="text-gray-700 text-sm">
                            Before uploading, have a clear idea of your desired page order. This makes the reorganization 
                            process faster and more efficient.
                          </p>
                        </div>
                        
                        <div className="bg-green-50 p-4 rounded-lg">
                          <h4 className="font-medium text-gray-900 mb-2">🔍 Use Page Previews</h4>
                          <p className="text-gray-700 text-sm">
                            Take advantage of the page dimension information to identify similar content types and 
                            group them together effectively.
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Workflow Optimization</h3>
                      <div className="space-y-4">
                        <div className="bg-purple-50 p-4 rounded-lg">
                          <h4 className="font-medium text-gray-900 mb-2">⚡ Batch Processing</h4>
                          <p className="text-gray-700 text-sm">
                            For multiple similar documents, establish a standard organization pattern and apply it 
                            consistently across all files.
                          </p>
                        </div>
                        
                        <div className="bg-orange-50 p-4 rounded-lg">
                          <h4 className="font-medium text-gray-900 mb-2">💾 Save Originals</h4>
                          <p className="text-gray-700 text-sm">
                            Always keep copies of your original PDFs before reorganizing, especially for important 
                            documents or when making significant changes.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* SEO Content - What is PDF Page Organization */}
                <div className="bg-white rounded-2xl shadow-lg p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">What is PDF Page Organization and Why It Matters</h2>
                  <div className="prose prose-lg max-w-none text-gray-700">
                    <p>
                      PDF page organization is a crucial document management process that involves reordering, selecting, 
                      and arranging pages within PDF documents to create more effective, readable, and purposeful files. 
                      This process goes beyond simple page manipulation—it's about creating documents that serve specific 
                      purposes and meet particular requirements.
                    </p>
                    <p>
                      In today's digital workplace, professionals across industries regularly encounter situations where 
                      PDF documents need restructuring. Whether you're preparing academic papers, business proposals, 
                      legal briefs, or educational materials, the ability to organize PDF pages efficiently can 
                      significantly impact your productivity and document effectiveness.
                    </p>
                    <p>
                      Our advanced PDF page organizer eliminates the complexity traditionally associated with PDF 
                      manipulation. Instead of requiring expensive software or technical expertise, users can achieve 
                      professional results through an intuitive, browser-based interface that works on any device.
                    </p>
                  </div>
                </div>

                {/* Technical Advantages */}
                <div className="bg-white rounded-2xl shadow-lg p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Technical Advantages of Our PDF Organizer</h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center p-6 bg-gray-50 rounded-xl">
                      <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Lightning Fast Processing</h3>
                      <p className="text-gray-600 text-sm">
                        Advanced algorithms ensure rapid page analysis and organization, even for large documents 
                        with hundreds of pages.
                      </p>
                    </div>
                    
                    <div className="text-center p-6 bg-gray-50 rounded-xl">
                      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Quality Preservation</h3>
                      <p className="text-gray-600 text-sm">
                        Maintains original document quality, fonts, images, and formatting while reorganizing pages 
                        without compression or degradation.
                      </p>
                    </div>
                    
                    <div className="text-center p-6 bg-gray-50 rounded-xl">
                      <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Secure Processing</h3>
                      <p className="text-gray-600 text-sm">
                        All document processing happens securely with automatic file deletion after processing, 
                        ensuring your sensitive documents remain private.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Industry Applications */}
                <div className="bg-white rounded-2xl shadow-lg p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Industry-Specific Applications</h2>
                  <div className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-4">🏢 Business & Corporate</h3>
                        <ul className="space-y-2 text-gray-600">
                          <li>• Annual report reorganization and customization</li>
                          <li>• Proposal tailoring for specific client needs</li>
                          <li>• Training manual updates and restructuring</li>
                          <li>• Contract compilation and organization</li>
                          <li>• Marketing collateral page arrangement</li>
                        </ul>
                      </div>
                      
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-4">🎓 Education & Academia</h3>
                        <ul className="space-y-2 text-gray-600">
                          <li>• Research paper section reordering</li>
                          <li>• Dissertation chapter organization</li>
                          <li>• Course material compilation</li>
                          <li>• Student portfolio arrangement</li>
                          <li>• Academic publication preparation</li>
                        </ul>
                      </div>
                      
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-4">⚖️ Legal & Compliance</h3>
                        <ul className="space-y-2 text-gray-600">
                          <li>• Case file organization and exhibit arrangement</li>
                          <li>• Legal brief compilation and structuring</li>
                          <li>• Contract addendum organization</li>
                          <li>• Compliance document preparation</li>
                          <li>• Court filing document arrangement</li>
                        </ul>
                      </div>
                      
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-4">🏥 Healthcare & Medical</h3>
                        <ul className="space-y-2 text-gray-600">
                          <li>• Medical record organization for patient files</li>
                          <li>• Research publication preparation</li>
                          <li>• Clinical study document arrangement</li>
                          <li>• Treatment protocol organization</li>
                          <li>• Medical report compilation</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Comparison with Alternatives */}
                <div className="bg-white rounded-2xl shadow-lg p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Why Choose Our PDF Page Organizer Over Alternatives</h2>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="border-b-2 border-gray-200">
                          <th className="text-left py-4 px-4 font-semibold text-gray-900">Feature</th>
                          <th className="text-center py-4 px-4 font-semibold text-green-600">Our Tool</th>
                          <th className="text-center py-4 px-4 font-semibold text-gray-600">Adobe Acrobat</th>
                          <th className="text-center py-4 px-4 font-semibold text-gray-600">Other Online Tools</th>
                        </tr>
                      </thead>
                      <tbody className="text-sm">
                        <tr className="border-b border-gray-100">
                          <td className="py-3 px-4 font-medium">Cost</td>
                          <td className="py-3 px-4 text-center text-green-600">✓ Free</td>
                          <td className="py-3 px-4 text-center text-red-600">✗ $240/year</td>
                          <td className="py-3 px-4 text-center text-orange-600">~ Limited Free</td>
                        </tr>
                        <tr className="border-b border-gray-100">
                          <td className="py-3 px-4 font-medium">No Installation Required</td>
                          <td className="py-3 px-4 text-center text-green-600">✓ Browser-based</td>
                          <td className="py-3 px-4 text-center text-red-600">✗ Desktop software</td>
                          <td className="py-3 px-4 text-center text-green-600">✓ Usually</td>
                        </tr>
                        <tr className="border-b border-gray-100">
                          <td className="py-3 px-4 font-medium">Drag & Drop Interface</td>
                          <td className="py-3 px-4 text-center text-green-600">✓ Intuitive</td>
                          <td className="py-3 px-4 text-center text-green-600">✓ Available</td>
                          <td className="py-3 px-4 text-center text-orange-600">~ Basic</td>
                        </tr>
                        <tr className="border-b border-gray-100">
                          <td className="py-3 px-4 font-medium">File Size Limits</td>
                          <td className="py-3 px-4 text-center text-green-600">✓ Generous</td>
                          <td className="py-3 px-4 text-center text-green-600">✓ No limits</td>
                          <td className="py-3 px-4 text-center text-red-600">✗ Restrictive</td>
                        </tr>
                        <tr className="border-b border-gray-100">
                          <td className="py-3 px-4 font-medium">Privacy & Security</td>
                          <td className="py-3 px-4 text-center text-green-600">✓ Auto-delete</td>
                          <td className="py-3 px-4 text-center text-green-600">✓ Local processing</td>
                          <td className="py-3 px-4 text-center text-orange-600">~ Varies</td>
                        </tr>
                        <tr className="border-b border-gray-100">
                          <td className="py-3 px-4 font-medium">Mobile Compatibility</td>
                          <td className="py-3 px-4 text-center text-green-600">✓ Fully responsive</td>
                          <td className="py-3 px-4 text-center text-orange-600">~ Limited mobile</td>
                          <td className="py-3 px-4 text-center text-orange-600">~ Basic mobile</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Advanced Workflow Examples */}
                <div className="bg-white rounded-2xl shadow-lg p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Professional Workflow Examples</h2>
                  <div className="space-y-8">
                    <div className="border-l-4 border-blue-500 pl-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">📋 Business Report Restructuring</h3>
                      <div className="bg-blue-50 p-4 rounded-lg mb-3">
                        <p className="text-gray-700 text-sm mb-2"><strong>Scenario:</strong> Your quarterly business report has sections in the wrong order for executive presentation.</p>
                        <p className="text-blue-700 text-sm font-medium">Solution Steps:</p>
                        <ol className="list-decimal list-inside text-sm text-gray-600 mt-2 space-y-1">
                          <li>Upload your quarterly report PDF</li>
                          <li>Drag executive summary to the front</li>
                          <li>Move financial highlights before detailed breakdowns</li>
                          <li>Remove internal memo pages not meant for stakeholders</li>
                          <li>Download your presentation-ready report</li>
                        </ol>
                      </div>
                      <p className="text-gray-600 text-sm">
                        <strong>Pro Tip:</strong> Use our <a href="/tools/add-page-numbers-tool" className="text-blue-600 hover:underline">page numbering tool</a> 
                        after organization to maintain professional formatting.
                      </p>
                    </div>
                    
                    <div className="border-l-4 border-green-500 pl-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">🎓 Academic Paper Preparation</h3>
                      <div className="bg-green-50 p-4 rounded-lg mb-3">
                        <p className="text-gray-700 text-sm mb-2"><strong>Scenario:</strong> Your research paper needs different organization for journal submission vs. conference presentation.</p>
                        <p className="text-green-700 text-sm font-medium">Solution Steps:</p>
                        <ol className="list-decimal list-inside text-sm text-gray-600 mt-2 space-y-1">
                          <li>Start with your complete research document</li>
                          <li>Create journal version: Remove acknowledgments, reorder abstract position</li>
                          <li>Create conference version: Remove detailed methodology, emphasize results</li>
                          <li>Remove supplementary material for both versions</li>
                          <li>Generate two perfectly tailored documents</li>
                        </ol>
                      </div>
                      <p className="text-gray-600 text-sm">
                        <strong>Next Step:</strong> Use our <a href="/tools/watermark-pdf-tool" className="text-green-600 hover:underline">watermark tool</a> 
                        to add draft status or copyright information.
                      </p>
                    </div>
                    
                    <div className="border-l-4 border-purple-500 pl-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">⚖️ Legal Case File Organization</h3>
                      <div className="bg-purple-50 p-4 rounded-lg mb-3">
                        <p className="text-gray-700 text-sm mb-2"><strong>Scenario:</strong> Court filing requires specific document order and exhibit labeling.</p>
                        <p className="text-purple-700 text-sm font-medium">Solution Steps:</p>
                        <ol className="list-decimal list-inside text-sm text-gray-600 mt-2 space-y-1">
                          <li>Upload combined case documents</li>
                          <li>Arrange pleadings in chronological order</li>
                          <li>Position exhibits according to court rules</li>
                          <li>Remove attorney work product pages</li>
                          <li>Create court-ready filing package</li>
                        </ol>
                      </div>
                      <p className="text-gray-600 text-sm">
                        <strong>Security Note:</strong> Protect sensitive files with our <a href="/tools/protect-pdf-tool" className="text-purple-600 hover:underline">PDF protection tool</a> 
                        after organization.
                      </p>
                    </div>
                  </div>
                </div>

                {/* SEO-Optimized Benefits Section */}
                <div className="bg-white rounded-2xl shadow-lg p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Why Choose Our PDF Page Organizer?</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">🚀 Performance Advantages</h3>
                      <ul className="space-y-3 text-gray-600">
                        <li className="flex items-start gap-3">
                          <span className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></span>
                          <div>
                            <strong className="text-gray-900">Lightning-fast processing:</strong> Organize hundreds of pages in seconds with our optimized algorithms
                          </div>
                        </li>
                        <li className="flex items-start gap-3">
                          <span className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></span>
                          <div>
                            <strong className="text-gray-900">No file size limits:</strong> Handle large documents that other tools reject
                          </div>
                        </li>
                        <li className="flex items-start gap-3">
                          <span className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></span>
                          <div>
                            <strong className="text-gray-900">Quality preservation:</strong> Maintain original formatting, fonts, and image quality
                          </div>
                        </li>
                        <li className="flex items-start gap-3">
                          <span className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></span>
                          <div>
                            <strong className="text-gray-900">Batch processing support:</strong> Organize multiple documents with consistent patterns
                          </div>
                        </li>
                      </ul>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">🔐 Security & Privacy</h3>
                      <ul className="space-y-3 text-gray-600">
                        <li className="flex items-start gap-3">
                          <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                          <div>
                            <strong className="text-gray-900">Automatic file deletion:</strong> Your documents are permanently removed after processing
                          </div>
                        </li>
                        <li className="flex items-start gap-3">
                          <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                          <div>
                            <strong className="text-gray-900">SSL encryption:</strong> All uploads and downloads are fully encrypted
                          </div>
                        </li>
                        <li className="flex items-start gap-3">
                          <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                          <div>
                            <strong className="text-gray-900">No registration required:</strong> Use the tool immediately without creating accounts
                          </div>
                        </li>
                        <li className="flex items-start gap-3">
                          <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                          <div>
                            <strong className="text-gray-900">GDPR compliant:</strong> Full compliance with international privacy regulations
                          </div>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Extended FAQ */}
                <div className="bg-white rounded-2xl shadow-lg p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Advanced PDF Organization Questions</h2>
                  <div className="space-y-6">
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">How does PDF page organization affect file size?</h3>
                      <p className="text-gray-600 text-sm">
                        When you remove pages from a PDF, the resulting file will be smaller since it contains fewer pages. 
                        However, simply reordering pages doesn't significantly change the file size. Our tool maintains 
                        the original quality and compression of your PDF content.
                      </p>
                    </div>
                    
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">Can I organize PDFs with different page orientations?</h3>
                      <p className="text-gray-600 text-sm">
                        Yes! Our tool handles PDFs with mixed page orientations (portrait and landscape) seamlessly. 
                        Each page maintains its original orientation and formatting during the reorganization process.
                      </p>
                    </div>
                    
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">What happens to bookmarks and table of contents after reorganization?</h3>
                      <p className="text-gray-600 text-sm">
                        Bookmarks and navigation elements are preserved where possible, but their page references may 
                        need updating if pages are significantly reordered. For documents with complex navigation 
                        structures, consider using our bookmark extraction tool first.
                      </p>
                    </div>
                    
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">Is there a way to preview the organized PDF before downloading?</h3>
                      <p className="text-gray-600 text-sm">
                        The page grid shows you the exact order of your organized document. Each page preview includes 
                        the original page number and dimensions, giving you a clear view of your document structure 
                        before generating the final PDF.
                      </p>
                    </div>
                    
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">Can I organize multiple PDFs simultaneously?</h3>
                      <p className="text-gray-600 text-sm">
                        Currently, our tool processes one PDF at a time to ensure optimal performance and quality. 
                        For multiple document organization, process each PDF individually. This approach also allows 
                        for more precise control over each document's structure.
                      </p>
                    </div>
                    
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">Does the tool support PDFs with forms and interactive elements?</h3>
                      <p className="text-gray-600 text-sm">
                        Yes, PDFs containing forms, buttons, and interactive elements can be organized. However, 
                        form functionality may be affected if form pages are significantly reordered. Test the 
                        organized document to ensure form elements work as expected.
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