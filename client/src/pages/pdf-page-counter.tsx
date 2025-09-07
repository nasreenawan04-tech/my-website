import { useState, useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { PDFDocument } from 'pdf-lib';
import { Upload, FileText, Info, Clock, HardDrive, Calendar, FileIcon, Eye } from 'lucide-react';

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
    // Average reading speed: 2-3 minutes per page for technical documents
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
    // Convert points to common paper sizes or display in points
    const widthMm = Math.round(width * 0.352778);
    const heightMm = Math.round(height * 0.352778);
    
    // Check for common paper sizes (with tolerance)
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
      
      // Get page details
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
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <Helmet>
        <title>PDF Page Counter & Info - Count Pages and Get PDF Information | CalcEasy</title>
        <meta 
          name="description" 
          content="Free online PDF page counter and information tool. Get detailed PDF stats including page count, file size, creation date, dimensions, and estimated reading time. No registration required." 
        />
        <meta name="keywords" content="PDF page counter, PDF info, PDF details, page count, PDF analyzer, PDF metadata, PDF statistics" />
      </Helmet>

      <Header />

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            PDF Page Counter & Info
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Upload a PDF to get detailed information including page count, file size, creation date, page dimensions, and estimated reading time
          </p>
        </div>

        {!pdfFile ? (
          <Card className="mb-8" data-testid="card-upload">
            <CardContent className="p-8">
              <div
                className={`border-2 border-dashed rounded-xl p-12 text-center transition-all duration-200 cursor-pointer ${
                  dragOver 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-300 hover:border-gray-400'
                }`}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onClick={() => fileInputRef.current?.click()}
                data-testid="drag-drop-upload-area"
              >
                <Upload className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-medium text-gray-900 mb-2">
                  Drag and drop your PDF file here
                </h3>
                <p className="text-gray-600 mb-4">
                  or click to select a file from your computer
                </p>
                <Button
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                  data-testid="button-select-file"
                >
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
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* File Info */}
            <Card data-testid="card-file-info">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <FileText className="w-8 h-8 text-red-500" />
                    <div>
                      <h3 className="font-medium text-gray-900">{pdfFile.name}</h3>
                      <p className="text-sm text-gray-500">PDF Document</p>
                    </div>
                  </div>
                  <Button
                    onClick={resetTool}
                    variant="outline"
                    size="sm"
                    data-testid="button-upload-new"
                  >
                    Upload New File
                  </Button>
                </div>
                
                {isProcessing ? (
                  <div className="text-center py-8" data-testid="processing-indicator">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Analyzing PDF...</p>
                  </div>
                ) : pdfInfo && (
                  <div className="space-y-6">
                    {/* Basic Information */}
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <Info className="w-5 h-5 mr-2 text-blue-500" />
                        Basic Information
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div className="bg-gray-50 rounded-lg p-4" data-testid="info-pages">
                          <div className="flex items-center mb-2">
                            <FileIcon className="w-5 h-5 text-blue-500 mr-2" />
                            <span className="font-medium text-gray-700">Total Pages</span>
                          </div>
                          <p className="text-2xl font-bold text-gray-900">{pdfInfo.pages}</p>
                        </div>
                        
                        <div className="bg-gray-50 rounded-lg p-4" data-testid="info-size">
                          <div className="flex items-center mb-2">
                            <HardDrive className="w-5 h-5 text-green-500 mr-2" />
                            <span className="font-medium text-gray-700">File Size</span>
                          </div>
                          <p className="text-2xl font-bold text-gray-900">{pdfInfo.size}</p>
                        </div>
                        
                        <div className="bg-gray-50 rounded-lg p-4" data-testid="info-reading-time">
                          <div className="flex items-center mb-2">
                            <Clock className="w-5 h-5 text-purple-500 mr-2" />
                            <span className="font-medium text-gray-700">Estimated Reading Time</span>
                          </div>
                          <p className="text-2xl font-bold text-gray-900">{pdfInfo.estimatedReadingTime}</p>
                        </div>
                      </div>
                    </div>

                    {/* Document Metadata */}
                    {(pdfInfo.title || pdfInfo.author || pdfInfo.subject || pdfInfo.creator || pdfInfo.producer || pdfInfo.keywords) && (
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                          <FileText className="w-5 h-5 mr-2 text-green-500" />
                          Document Metadata
                        </h4>
                        <div className="bg-gray-50 rounded-lg p-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            {pdfInfo.title && (
                              <div data-testid="metadata-title">
                                <span className="font-medium text-gray-700">Title:</span>
                                <p className="text-gray-900 mt-1">{pdfInfo.title}</p>
                              </div>
                            )}
                            {pdfInfo.author && (
                              <div data-testid="metadata-author">
                                <span className="font-medium text-gray-700">Author:</span>
                                <p className="text-gray-900 mt-1">{pdfInfo.author}</p>
                              </div>
                            )}
                            {pdfInfo.subject && (
                              <div data-testid="metadata-subject">
                                <span className="font-medium text-gray-700">Subject:</span>
                                <p className="text-gray-900 mt-1">{pdfInfo.subject}</p>
                              </div>
                            )}
                            {pdfInfo.creator && (
                              <div data-testid="metadata-creator">
                                <span className="font-medium text-gray-700">Creator:</span>
                                <p className="text-gray-900 mt-1">{pdfInfo.creator}</p>
                              </div>
                            )}
                            {pdfInfo.producer && (
                              <div data-testid="metadata-producer">
                                <span className="font-medium text-gray-700">Producer:</span>
                                <p className="text-gray-900 mt-1">{pdfInfo.producer}</p>
                              </div>
                            )}
                            {pdfInfo.keywords && (
                              <div data-testid="metadata-keywords" className="md:col-span-2">
                                <span className="font-medium text-gray-700">Keywords:</span>
                                <p className="text-gray-900 mt-1">{pdfInfo.keywords}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Date Information */}
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <Calendar className="w-5 h-5 mr-2 text-orange-500" />
                        Date Information
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-gray-50 rounded-lg p-4" data-testid="date-created">
                          <span className="font-medium text-gray-700">Created:</span>
                          <p className="text-gray-900 mt-1">{pdfInfo.creationDate}</p>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-4" data-testid="date-modified">
                          <span className="font-medium text-gray-700">Last Modified:</span>
                          <p className="text-gray-900 mt-1">{pdfInfo.modificationDate}</p>
                        </div>
                      </div>
                    </div>

                    {/* Page Details */}
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <Eye className="w-5 h-5 mr-2 text-indigo-500" />
                        Page Details
                      </h4>
                      <div className="bg-gray-50 rounded-lg p-4 max-h-64 overflow-y-auto" data-testid="page-details">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                          {pdfInfo.pageDetails.map((page) => (
                            <div 
                              key={page.pageNumber} 
                              className="bg-white rounded p-3 text-sm"
                              data-testid={`page-detail-${page.pageNumber}`}
                            >
                              <div className="font-medium text-gray-900 mb-1">
                                Page {page.pageNumber}
                              </div>
                              <div className="text-gray-600 space-y-1">
                                <div>{page.dimensions}</div>
                                <div className="text-xs text-gray-500">{page.orientation}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Features Section */}
        <div className="mt-12 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">What You Get</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <FileIcon className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Page Count</h3>
              <p className="text-sm text-gray-600">Accurate count of total pages in your PDF document</p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Info className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">File Information</h3>
              <p className="text-sm text-gray-600">File size, creation date, and modification details</p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Clock className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Reading Time</h3>
              <p className="text-sm text-gray-600">Estimated reading time based on document length</p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Eye className="w-6 h-6 text-orange-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Page Details</h3>
              <p className="text-sm text-gray-600">Dimensions and orientation for each page</p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default PDFPageCounter;