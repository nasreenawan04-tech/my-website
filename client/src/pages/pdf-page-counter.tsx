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
        <title>PDF Page Counter & Info - Count Pages and Get PDF Information | CalcEasy</title>
        <meta 
          name="description" 
          content="Free online PDF page counter and information tool. Get detailed PDF stats including page count, file size, creation date, dimensions, and estimated reading time. No registration required." 
        />
        <meta name="keywords" content="PDF page counter, PDF info, PDF details, page count, PDF analyzer, PDF metadata, PDF statistics" />
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

        {/* SEO Content Section */}
        <section className="py-12 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-center text-neutral-900 mb-6">
              Unlock the Details of Your PDF Documents
            </h2>
            <p className="text-lg text-neutral-700 text-center max-w-4xl mx-auto mb-8">
              Our PDF Page Counter & Info tool is designed to provide you with a comprehensive understanding of your PDF files. Whether you need to quickly find the total number of pages, check the file size, or extract metadata like creation dates and authors, this tool offers a seamless experience. It's perfect for students, researchers, professionals, and anyone who frequently works with PDF documents.
            </p>

            <div className="grid md:grid-cols-3 gap-8">
              <div>
                <h3 className="text-xl font-semibold text-neutral-800 mb-3">Accurate Page Counting</h3>
                <p className="text-neutral-600">
                  Instantly determine the exact number of pages in any PDF. Simply upload your document, and our tool will display the total page count. This is invaluable for document management, printing, and academic submissions.
                </p>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-neutral-800 mb-3">Detailed File Information</h3>
                <p className="text-neutral-600">
                  Go beyond the page count. Access crucial file details such as the file size, making it easy to manage storage, and check the creation and modification dates to track document history.
                </p>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-neutral-800 mb-3">Metadata Extraction</h3>
                <p className="text-neutral-600">
                  Our tool also extracts rich metadata embedded within your PDF. Discover the document's title, author, subject, keywords, and creator, providing a deeper context for your files.
                </p>
              </div>
            </div>

            <div className="mt-12">
              <h3 className="text-2xl font-bold text-neutral-900 text-center mb-6">Why Use Our PDF Tool?</h3>
              <p className="text-neutral-700 text-center max-w-3xl mx-auto mb-8">
                We understand the importance of efficiency and accuracy when working with PDFs. Our online tool is built with user-friendliness and speed in mind, ensuring you get the information you need without any hassle. It's a reliable solution for anyone looking to analyze PDF properties quickly and effectively.
              </p>
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h4 className="text-lg font-semibold text-neutral-800 mb-3">Ease of Use</h4>
                  <p className="text-neutral-600">
                    An intuitive interface allows you to upload and analyze your PDFs in just a few clicks. No complex software installation or steep learning curve.
                  </p>
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-neutral-800 mb-3">Free and Accessible</h4>
                  <p className="text-neutral-600">
                    Access all features completely free of charge. Our tool is available online, anytime, anywhere, with no hidden costs or registration requirements.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-12 text-center">
              <h3 className="text-2xl font-bold text-neutral-900 mb-6">Get Started Today</h3>
              <p className="text-neutral-700 max-w-3xl mx-auto mb-8">
                Ready to discover more about your PDF files? Upload your document now and let our tool reveal its hidden details. It's the quickest way to count pages and gather essential PDF information.
              </p>
              <Button className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 text-lg">
                Upload Your PDF Now
              </Button>
            </div>
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
      </main>

      <Footer />
    </div>
  );
};

export default PDFPageCounter;