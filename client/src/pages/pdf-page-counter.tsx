import { useState, useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PDFDocument } from 'pdf-lib';
import { Upload, FileText, Info, Clock, HardDrive, Calendar, FileIcon, Eye, RotateCcw } from 'lucide-react';

interface PDFInfo {
  name: string;
  size: string;
  sizeBytes: number;
  pages: number;
  title?: string;
  author?: string;
  subject?: string;
  creator?: string;
  producer?: string;
  creationDate?: string;
  modificationDate?: string;
  keywords?: string;
  estimatedReadingTime: string;
  pageDetails: PageInfo[];
}

interface PageInfo {
  pageNumber: number;
  width: number;
  height: number;
  orientation: string;
  dimensions: string;
}

const PDFPageCounter = () => {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfInfo, setPdfInfo] = useState<PDFInfo | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (date: Date | null): string => {
    if (!date) return 'Unknown';
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const calculateReadingTime = (pages: number): string => {
    const minutesPerPage = 2.5;
    const totalMinutes = Math.round(pages * minutesPerPage);

    if (totalMinutes < 60) {
      return `${totalMinutes} minutes`;
    } else {
      const hours = Math.floor(totalMinutes / 60);
      const minutes = totalMinutes % 60;
      return minutes > 0 ? `${hours}h ${minutes}m` : `${hours} hour${hours > 1 ? 's' : ''}`;
    }
  };

  const getPageOrientation = (width: number, height: number): string => {
    if (width > height) return 'Landscape';
    if (height > width) return 'Portrait';
    return 'Square';
  };

  const formatDimensions = (width: number, height: number): string => {
    const widthMm = Math.round(width * 0.352778);
    const heightMm = Math.round(height * 0.352778);

    if (Math.abs(widthMm - 210) < 5 && Math.abs(heightMm - 297) < 5) return 'A4 (210×297mm)';
    if (Math.abs(widthMm - 216) < 5 && Math.abs(heightMm - 279) < 5) return 'Letter (8.5×11in)';
    if (Math.abs(widthMm - 216) < 5 && Math.abs(heightMm - 356) < 5) return 'Legal (8.5×14in)';
    if (Math.abs(widthMm - 148) < 5 && Math.abs(heightMm - 210) < 5) return 'A5 (148×210mm)';
    if (Math.abs(widthMm - 297) < 5 && Math.abs(heightMm - 420) < 5) return 'A3 (297×420mm)';

    return `${widthMm}×${heightMm}mm`;
  };

  const handleFileSelect = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const file = files[0];
    if (file.type !== 'application/pdf') {
      alert('Please select a valid PDF file.');
      return;
    }

    setPdfFile(file);
    setIsProcessing(true);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await PDFDocument.load(arrayBuffer);

      const pageCount = pdf.getPageCount();
      const pageDetails: PageInfo[] = [];

      for (let i = 0; i < pageCount; i++) {
        const page = pdf.getPage(i);
        const { width, height } = page.getSize();
        pageDetails.push({
          pageNumber: i + 1,
          width,
          height,
          orientation: getPageOrientation(width, height),
          dimensions: formatDimensions(width, height)
        });
      }

      const info: PDFInfo = {
        name: file.name,
        size: formatFileSize(file.size),
        sizeBytes: file.size,
        pages: pageCount,
        title: pdf.getTitle() || undefined,
        author: pdf.getAuthor() || undefined,
        subject: pdf.getSubject() || undefined,
        creator: pdf.getCreator() || undefined,
        producer: pdf.getProducer() || undefined,
        creationDate: formatDate(pdf.getCreationDate() || null),
        modificationDate: formatDate(pdf.getModificationDate() || null),
        keywords: (() => {
          const keywords = pdf.getKeywords();
          if (Array.isArray(keywords)) {
            return keywords.join(', ');
          }
          return typeof keywords === 'string' ? keywords : undefined;
        })(),
        estimatedReadingTime: calculateReadingTime(pageCount),
        pageDetails
      };

      setPdfInfo(info);
    } catch (error) {
      console.error('Error analyzing PDF:', error);
      alert('Error analyzing PDF file. Please try again with a valid PDF.');
    }

    setIsProcessing(false);
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

  const resetTool = () => {
    setPdfFile(null);
    setPdfInfo(null);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Helmet>
        <title>Free PDF Page Counter & Info Tool - Count Pages, File Size, Metadata Analysis | ToolsHub</title>
        <meta 
          name="description" 
          content="Professional PDF page counter tool with comprehensive analysis. Get instant page count, file size, metadata extraction, reading time estimates, and page dimensions. Perfect for students, businesses, and legal professionals. 100% free and secure." 
        />
        <meta name="keywords" content="PDF page counter, PDF analyzer, count PDF pages, PDF file info, PDF metadata extractor, PDF statistics, document analysis, page count tool, PDF information, file size checker" />
        <meta property="og:title" content="Free PDF Page Counter & Info Tool - Instant Analysis | ToolsHub" />
        <meta property="og:description" content="Count PDF pages instantly with our comprehensive analysis tool. Extract metadata, check file sizes, and get reading time estimates. Free and secure PDF analyzer." />
        <meta property="og:type" content="website" />
        <link rel="canonical" href="/tools/pdf-page-counter" />
      </Helmet>

      <Header />

      <main className="flex-1 bg-neutral-50">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-red-600 via-red-500 to-pink-600 text-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="w-16 h-16 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Info className="w-8 h-8" />
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold mb-4">
              PDF Page Counter & Info
            </h1>
            <p className="text-xl text-red-100 mb-8 max-w-3xl mx-auto">
              Upload a PDF to get detailed information including page count, file size, creation date, page dimensions, and estimated reading time
            </p>
          </div>
        </section>

        {/* Tool Content */}
        <section className="py-16">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <Card className="shadow-xl">
              <CardHeader className="text-center pb-2">
                <CardTitle className="text-2xl font-bold text-neutral-800">
                  Analyze Your PDF
                </CardTitle>
                <p className="text-neutral-600 mt-2">
                  Upload a PDF file to get comprehensive information and statistics
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                {!pdfFile ? (
                  <div
                    className={`border-2 border-dashed rounded-xl p-12 text-center transition-all duration-200 cursor-pointer ${
                      dragOver 
                        ? 'border-red-500 bg-red-50' 
                        : 'border-neutral-300 hover:border-neutral-400 hover:bg-neutral-50'
                    }`}
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onClick={() => fileInputRef.current?.click()}
                    data-testid="drag-drop-upload-area"
                  >
                    <Upload className="w-16 h-16 text-neutral-400 mx-auto mb-4" />
                    <h3 className="text-xl font-medium text-neutral-900 mb-2">
                      Drop your PDF file here
                    </h3>
                    <p className="text-neutral-600 mb-4">
                      or click to browse and select a file
                    </p>
                    <Button className="bg-red-600 hover:bg-red-700 text-white">
                      Select PDF File
                    </Button>

                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf"
                      onChange={(e) => handleFileSelect(e.target.files)}
                      className="hidden"
                      data-testid="input-file-upload"
                    />
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* File Header */}
                    <div className="flex items-center justify-between p-4 bg-neutral-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <FileText className="w-8 h-8 text-red-500" />
                        <div>
                          <h3 className="font-medium text-neutral-900">{pdfFile.name}</h3>
                          <p className="text-sm text-neutral-500">PDF Document</p>
                        </div>
                      </div>
                      <Button
                        onClick={resetTool}
                        variant="outline"
                        size="sm"
                        className="flex items-center space-x-2"
                      >
                        <RotateCcw className="w-4 h-4" />
                        <span>New File</span>
                      </Button>
                    </div>

                    {isProcessing ? (
                      <div className="text-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
                        <p className="text-neutral-600 text-lg">Analyzing PDF...</p>
                      </div>
                    ) : pdfInfo && (
                      <div className="space-y-8">
                        {/* Basic Information Cards */}
                        <div>
                          <h4 className="text-lg font-semibold text-neutral-900 mb-4 flex items-center">
                            <Info className="w-5 h-5 mr-2 text-red-500" />
                            Basic Information
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <Card>
                              <CardContent className="p-4 text-center">
                                <FileIcon className="w-8 h-8 text-red-500 mx-auto mb-2" />
                                <div className="text-2xl font-bold text-neutral-900">{pdfInfo.pages}</div>
                                <div className="text-sm text-neutral-600">Total Pages</div>
                              </CardContent>
                            </Card>

                            <Card>
                              <CardContent className="p-4 text-center">
                                <HardDrive className="w-8 h-8 text-green-500 mx-auto mb-2" />
                                <div className="text-2xl font-bold text-neutral-900">{pdfInfo.size}</div>
                                <div className="text-sm text-neutral-600">File Size</div>
                              </CardContent>
                            </Card>

                            <Card>
                              <CardContent className="p-4 text-center">
                                <Clock className="w-8 h-8 text-purple-500 mx-auto mb-2" />
                                <div className="text-2xl font-bold text-neutral-900">{pdfInfo.estimatedReadingTime}</div>
                                <div className="text-sm text-neutral-600">Reading Time</div>
                              </CardContent>
                            </Card>
                          </div>
                        </div>

                        {/* Document Metadata */}
                        {(pdfInfo.title || pdfInfo.author || pdfInfo.subject || pdfInfo.creator || pdfInfo.producer || pdfInfo.keywords) && (
                          <Card>
                            <CardHeader>
                              <CardTitle className="flex items-center">
                                <FileText className="w-5 h-5 mr-2 text-green-500" />
                                Document Metadata
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                {pdfInfo.title && (
                                  <div>
                                    <span className="font-medium text-neutral-700">Title:</span>
                                    <p className="text-neutral-900 mt-1">{pdfInfo.title}</p>
                                  </div>
                                )}
                                {pdfInfo.author && (
                                  <div>
                                    <span className="font-medium text-neutral-700">Author:</span>
                                    <p className="text-neutral-900 mt-1">{pdfInfo.author}</p>
                                  </div>
                                )}
                                {pdfInfo.subject && (
                                  <div>
                                    <span className="font-medium text-neutral-700">Subject:</span>
                                    <p className="text-neutral-900 mt-1">{pdfInfo.subject}</p>
                                  </div>
                                )}
                                {pdfInfo.creator && (
                                  <div>
                                    <span className="font-medium text-neutral-700">Creator:</span>
                                    <p className="text-neutral-900 mt-1">{pdfInfo.creator}</p>
                                  </div>
                                )}
                                {pdfInfo.producer && (
                                  <div>
                                    <span className="font-medium text-neutral-700">Producer:</span>
                                    <p className="text-neutral-900 mt-1">{pdfInfo.producer}</p>
                                  </div>
                                )}
                                {pdfInfo.keywords && (
                                  <div className="md:col-span-2">
                                    <span className="font-medium text-neutral-700">Keywords:</span>
                                    <p className="text-neutral-900 mt-1">{pdfInfo.keywords}</p>
                                  </div>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        )}

                        {/* Date Information */}
                        <Card>
                          <CardHeader>
                            <CardTitle className="flex items-center">
                              <Calendar className="w-5 h-5 mr-2 text-orange-500" />
                              Date Information
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <span className="font-medium text-neutral-700">Created:</span>
                                <p className="text-neutral-900 mt-1">{pdfInfo.creationDate}</p>
                              </div>
                              <div>
                                <span className="font-medium text-neutral-700">Last Modified:</span>
                                <p className="text-neutral-900 mt-1">{pdfInfo.modificationDate}</p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>

                        {/* Page Details */}
                        <Card>
                          <CardHeader>
                            <CardTitle className="flex items-center">
                              <Eye className="w-5 h-5 mr-2 text-indigo-500" />
                              Page Details
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="max-h-64 overflow-y-auto">
                              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                {pdfInfo.pageDetails.map((page) => (
                                  <div 
                                    key={page.pageNumber} 
                                    className="bg-neutral-50 rounded-lg p-3 text-sm"
                                  >
                                    <div className="font-medium text-neutral-900 mb-1">
                                      Page {page.pageNumber}
                                    </div>
                                    <div className="text-neutral-600 space-y-1">
                                      <div>{page.dimensions}</div>
                                      <div className="text-xs text-neutral-500">{page.orientation}</div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Features Section */}
            <div className="mt-12 text-center">
              <h2 className="text-2xl font-bold text-neutral-900 mb-8">What You Get</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <FileIcon className="w-6 h-6 text-red-600" />
                  </div>
                  <h3 className="font-semibold text-neutral-900 mb-2">Page Count</h3>
                  <p className="text-sm text-neutral-600">Accurate count of total pages in your PDF document</p>
                </div>

                <div className="text-center">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <Info className="w-6 h-6 text-green-600" />
                  </div>
                  <h3 className="font-semibold text-neutral-900 mb-2">File Information</h3>
                  <p className="text-sm text-neutral-600">File size, creation date, and modification details</p>
                </div>

                <div className="text-center">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <Clock className="w-6 h-6 text-purple-600" />
                  </div>
                  <h3 className="font-semibold text-neutral-900 mb-2">Reading Time</h3>
                  <p className="text-sm text-neutral-600">Estimated reading time based on document length</p>
                </div>

                <div className="text-center">
                  <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <Eye className="w-6 h-6 text-orange-600" />
                  </div>
                  <h3 className="font-semibold text-neutral-900 mb-2">Page Details</h3>
                  <p className="text-sm text-neutral-600">Dimensions and orientation for each page</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Comprehensive SEO Content Section */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                What is the PDF Page Counter & Info Tool?
              </h2>
              <p className="text-xl text-gray-700 max-w-4xl mx-auto leading-relaxed">
                Our PDF Page Counter & Info tool is a powerful, free online utility that instantly analyzes your PDF documents to provide comprehensive information about their structure, content, and metadata. Whether you need to quickly count pages for printing costs, check file sizes for upload limits, or extract document metadata for research purposes, this tool delivers accurate results in seconds.
              </p>
            </div>

            {/* How It Works */}
            <div className="bg-gradient-to-br from-red-50 to-pink-50 rounded-2xl p-8 mb-16">
              <h3 className="text-3xl font-bold text-gray-900 mb-8 text-center">How the PDF Page Counter Works</h3>
              <div className="grid md:grid-cols-3 gap-8">
                <div className="text-center">
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Upload className="w-8 h-8 text-red-600" />
                  </div>
                  <h4 className="text-xl font-semibold text-gray-900 mb-3">1. Upload Your PDF</h4>
                  <p className="text-gray-600">
                    Simply drag and drop your PDF file or click to browse and select from your device. Our tool supports all standard PDF formats and file sizes up to 50MB.
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Info className="w-8 h-8 text-red-600" />
                  </div>
                  <h4 className="text-xl font-semibold text-gray-900 mb-3">2. Instant Analysis</h4>
                  <p className="text-gray-600">
                    Our advanced PDF parsing engine immediately analyzes your document, extracting page count, file size, dimensions, metadata, and creation details.
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Eye className="w-8 h-8 text-red-600" />
                  </div>
                  <h4 className="text-xl font-semibold text-gray-900 mb-3">3. View Detailed Results</h4>
                  <p className="text-gray-600">
                    Get comprehensive information including page count, file size, creation date, author details, page dimensions, and estimated reading time.
                  </p>
                </div>
              </div>
            </div>

            {/* Benefits by User Type */}
            <div className="mb-16">
              <h3 className="text-3xl font-bold text-gray-900 mb-8 text-center">Perfect for Every User Type</h3>
              <div className="grid lg:grid-cols-2 gap-8">
                <div className="bg-blue-50 rounded-2xl p-8">
                  <div className="flex items-center mb-6">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                      <FileText className="w-6 h-6 text-blue-600" />
                    </div>
                    <h4 className="text-2xl font-bold text-gray-900">Students & Academics</h4>
                  </div>
                  <p className="text-gray-700 mb-6">
                    Essential for academic work, research papers, and document management. Quickly check if your thesis meets page requirements or calculate printing costs for lengthy research materials.
                  </p>
                  <ul className="space-y-3 text-gray-700">
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      <span>Verify assignment page count requirements for submissions</span>
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      <span>Calculate printing costs before visiting print shops</span>
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      <span>Extract citation information from PDF metadata</span>
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      <span>Estimate reading time for study planning</span>
                    </li>
                  </ul>
                  <div className="mt-6 pt-6 border-t border-blue-200">
                    <p className="text-sm text-gray-600">
                      <strong>Pro Tip:</strong> Use our <a href="/tools/merge-pdf" className="text-blue-600 hover:text-blue-700 underline">PDF merger tool</a> to combine multiple research papers before counting total pages.
                    </p>
                  </div>
                </div>

                <div className="bg-green-50 rounded-2xl p-8">
                  <div className="flex items-center mb-6">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                      <HardDrive className="w-6 h-6 text-green-600" />
                    </div>
                    <h4 className="text-2xl font-bold text-gray-900">Business Professionals</h4>
                  </div>
                  <p className="text-gray-700 mb-6">
                    Streamline document workflows, manage file sizes for email attachments, and ensure compliance with document specifications in corporate environments.
                  </p>
                  <ul className="space-y-3 text-gray-700">
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      <span>Check file sizes before email attachments (avoid size limits)</span>
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      <span>Verify contract and proposal page counts for compliance</span>
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      <span>Extract document metadata for version control</span>
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      <span>Plan meeting time based on document reading estimates</span>
                    </li>
                  </ul>
                  <div className="mt-6 pt-6 border-t border-green-200">
                    <p className="text-sm text-gray-600">
                      <strong>Pro Tip:</strong> Use our <a href="/tools/protect-pdf" className="text-green-600 hover:text-green-700 underline">PDF password protection tool</a> to secure sensitive business documents after analysis.
                    </p>
                  </div>
                </div>

                <div className="bg-purple-50 rounded-2xl p-8">
                  <div className="flex items-center mb-6">
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mr-4">
                      <Clock className="w-6 h-6 text-purple-600" />
                    </div>
                    <h4 className="text-2xl font-bold text-gray-900">Content Creators & Publishers</h4>
                  </div>
                  <p className="text-gray-700 mb-6">
                    Perfect for authors, publishers, and content creators who need precise document specifications for publishing, printing, or digital distribution requirements.
                  </p>
                  <ul className="space-y-3 text-gray-700">
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-purple-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      <span>Verify manuscript page counts for publishing requirements</span>
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-purple-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      <span>Check file dimensions for print specifications</span>
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-purple-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      <span>Extract author and title metadata for cataloging</span>
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-purple-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      <span>Estimate reading time for content marketing</span>
                    </li>
                  </ul>
                  <div className="mt-6 pt-6 border-t border-purple-200">
                    <p className="text-sm text-gray-600">
                      <strong>Pro Tip:</strong> Use our <a href="/tools/pdf-compressor-advanced" className="text-purple-600 hover:text-purple-700 underline">PDF compressor</a> to reduce file sizes for online distribution.
                    </p>
                  </div>
                </div>

                <div className="bg-orange-50 rounded-2xl p-8">
                  <div className="flex items-center mb-6">
                    <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mr-4">
                      <Calendar className="w-6 h-6 text-orange-600" />
                    </div>
                    <h4 className="text-2xl font-bold text-gray-900">Legal & Compliance Teams</h4>
                  </div>
                  <p className="text-gray-700 mb-6">
                    Essential for legal professionals who need precise document specifications, metadata verification, and compliance with court filing requirements.
                  </p>
                  <ul className="space-y-3 text-gray-700">
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-orange-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      <span>Verify document page limits for court filings</span>
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-orange-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      <span>Check file sizes for electronic filing systems</span>
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-orange-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      <span>Extract creation dates for document authenticity</span>
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-orange-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      <span>Verify document metadata for evidence management</span>
                    </li>
                  </ul>
                  <div className="mt-6 pt-6 border-t border-orange-200">
                    <p className="text-sm text-gray-600">
                      <strong>Pro Tip:</strong> Use our <a href="/tools/pdf-redaction-tool" className="text-orange-600 hover:text-orange-700 underline">PDF redaction tool</a> to secure sensitive information in legal documents.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Key Features */}
            <div className="bg-gray-50 rounded-2xl p-8 mb-16">
              <h3 className="text-3xl font-bold text-gray-900 mb-8 text-center">Comprehensive PDF Analysis Features</h3>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                <div className="bg-white rounded-lg p-6 shadow-sm">
                  <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                    <FileIcon className="w-6 h-6 text-red-600" />
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">Precise Page Counting</h4>
                  <p className="text-gray-600">
                    Get exact page counts with 100% accuracy. Our tool correctly handles complex PDFs with mixed orientations, embedded content, and multi-layered documents.
                  </p>
                </div>
                
                <div className="bg-white rounded-lg p-6 shadow-sm">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                    <HardDrive className="w-6 h-6 text-green-600" />
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">File Size Analysis</h4>
                  <p className="text-gray-600">
                    View detailed file size information in multiple formats (bytes, KB, MB, GB) to help you manage storage and meet upload requirements.
                  </p>
                </div>
                
                <div className="bg-white rounded-lg p-6 shadow-sm">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                    <Info className="w-6 h-6 text-blue-600" />
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">Metadata Extraction</h4>
                  <p className="text-gray-600">
                    Extract comprehensive metadata including title, author, subject, keywords, creator application, and document properties.
                  </p>
                </div>
                
                <div className="bg-white rounded-lg p-6 shadow-sm">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                    <Clock className="w-6 h-6 text-purple-600" />
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">Reading Time Estimation</h4>
                  <p className="text-gray-600">
                    Get accurate reading time estimates based on average reading speeds to help plan study sessions or meeting durations.
                  </p>
                </div>
                
                <div className="bg-white rounded-lg p-6 shadow-sm">
                  <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                    <Calendar className="w-6 h-6 text-orange-600" />
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">Date Information</h4>
                  <p className="text-gray-600">
                    View creation and modification dates to track document history, version control, and authenticity verification.
                  </p>
                </div>
                
                <div className="bg-white rounded-lg p-6 shadow-sm">
                  <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                    <Eye className="w-6 h-6 text-indigo-600" />
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">Page Dimensions</h4>
                  <p className="text-gray-600">
                    Analyze individual page dimensions, orientations, and formats (A4, Letter, Legal, etc.) for print and layout planning.
                  </p>
                </div>
              </div>
            </div>

            {/* SEO Content Block */}
            <div className="bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-2xl p-8 mb-16">
              <div className="max-w-4xl mx-auto text-center">
                <h3 className="text-3xl font-bold mb-6">Why Choose Our PDF Page Counter Tool?</h3>
                <p className="text-xl text-red-100 mb-8">
                  Experience the most comprehensive PDF analysis tool available online. Our advanced technology ensures accuracy, speed, and detailed insights for all your PDF documents.
                </p>
                <div className="grid md:grid-cols-2 gap-6 text-left">
                  <div>
                    <h4 className="text-xl font-semibold mb-3 flex items-center">
                      <span className="w-6 h-6 bg-white bg-opacity-20 rounded-full flex items-center justify-center mr-3 text-sm">✓</span>
                      100% Free & Unlimited
                    </h4>
                    <p className="text-red-100">
                      No registration required, no hidden fees, and no usage limits. Analyze as many PDFs as you need, whenever you need.
                    </p>
                  </div>
                  <div>
                    <h4 className="text-xl font-semibold mb-3 flex items-center">
                      <span className="w-6 h-6 bg-white bg-opacity-20 rounded-full flex items-center justify-center mr-3 text-sm">✓</span>
                      Privacy & Security
                    </h4>
                    <p className="text-red-100">
                      Your files are processed locally in your browser. No uploads to servers, ensuring complete privacy and data security.
                    </p>
                  </div>
                  <div>
                    <h4 className="text-xl font-semibold mb-3 flex items-center">
                      <span className="w-6 h-6 bg-white bg-opacity-20 rounded-full flex items-center justify-center mr-3 text-sm">✓</span>
                      Lightning Fast Results
                    </h4>
                    <p className="text-red-100">
                      Get instant results in seconds, not minutes. Our optimized processing engine handles large files efficiently.
                    </p>
                  </div>
                  <div>
                    <h4 className="text-xl font-semibold mb-3 flex items-center">
                      <span className="w-6 h-6 bg-white bg-opacity-20 rounded-full flex items-center justify-center mr-3 text-sm">✓</span>
                      Cross-Platform Compatible
                    </h4>
                    <p className="text-red-100">
                      Works on all devices and browsers. Access from desktop, tablet, or mobile without any software installation.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Related Tools */}
            <div className="bg-white border-2 border-gray-100 rounded-2xl p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">Explore Related PDF Tools</h3>
              <p className="text-gray-600 text-center mb-8">
                Complete your PDF workflow with our comprehensive suite of professional PDF tools
              </p>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                <a href="/tools/merge-pdf" className="block p-6 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mb-3">
                    <FileText className="w-5 h-5 text-blue-600" />
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-2">Merge PDFs</h4>
                  <p className="text-sm text-gray-600">Combine multiple PDF files into one document</p>
                </a>
                
                <a href="/tools/split-pdf" className="block p-6 bg-green-50 rounded-xl hover:bg-green-100 transition-colors">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mb-3">
                    <FileText className="w-5 h-5 text-green-600" />
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-2">Split PDF</h4>
                  <p className="text-sm text-gray-600">Separate PDF pages into individual files</p>
                </a>
                
                <a href="/tools/pdf-compressor-advanced" className="block p-6 bg-purple-50 rounded-xl hover:bg-purple-100 transition-colors">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mb-3">
                    <HardDrive className="w-5 h-5 text-purple-600" />
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-2">Compress PDF</h4>
                  <p className="text-sm text-gray-600">Reduce PDF file size while maintaining quality</p>
                </a>
                
                <a href="/tools/protect-pdf" className="block p-6 bg-orange-50 rounded-xl hover:bg-orange-100 transition-colors">
                  <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center mb-3">
                    <FileIcon className="w-5 h-5 text-orange-600" />
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-2">Protect PDF</h4>
                  <p className="text-sm text-gray-600">Add password protection to secure your PDFs</p>
                </a>
              </div>
              
              <div className="text-center mt-8">
                <a 
                  href="/pdf" 
                  className="inline-flex items-center px-6 py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors"
                >
                  View All PDF Tools
                  <span className="ml-2">→</span>
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default PDFPageCounter;