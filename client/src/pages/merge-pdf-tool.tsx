import { useState, useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { PDFDocument } from 'pdf-lib';
import { Upload, FileText, Download, Trash2, GripVertical } from 'lucide-react';

interface PDFFile {
  id: string;
  file: File;
  name: string;
  size: string;
  pages?: number;
}

const MergePDFTool = () => {
  const [pdfFiles, setPdfFiles] = useState<PDFFile[]>([]);
  const [mergedPdfUrl, setMergedPdfUrl] = useState<string | null>(null);
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
    if (!files) return;

    const newFiles: PDFFile[] = [];
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.type === 'application/pdf') {
        const pages = await getPageCount(file);
        newFiles.push({
          id: generateId(),
          file,
          name: file.name,
          size: formatFileSize(file.size),
          pages
        });
      }
    }

    setPdfFiles(prev => [...prev, ...newFiles]);
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

  const removeFile = (id: string) => {
    setPdfFiles(prev => prev.filter(file => file.id !== id));
  };

  const moveFile = (id: string, direction: 'up' | 'down') => {
    const currentIndex = pdfFiles.findIndex(file => file.id === id);
    if (
      (direction === 'up' && currentIndex === 0) ||
      (direction === 'down' && currentIndex === pdfFiles.length - 1)
    ) {
      return;
    }

    const newFiles = [...pdfFiles];
    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    [newFiles[currentIndex], newFiles[targetIndex]] = [newFiles[targetIndex], newFiles[currentIndex]];
    setPdfFiles(newFiles);
  };

  const mergePDFs = async () => {
    if (pdfFiles.length < 2) return;

    setIsProcessing(true);
    
    try {
      const mergedPdf = await PDFDocument.create();

      for (const pdfFile of pdfFiles) {
        const arrayBuffer = await pdfFile.file.arrayBuffer();
        const pdf = await PDFDocument.load(arrayBuffer);
        const pages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
        pages.forEach((page) => mergedPdf.addPage(page));
      }

      const pdfBytes = await mergedPdf.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      setMergedPdfUrl(url);
    } catch (error) {
      console.error('Error merging PDFs:', error);
      alert('Error merging PDFs. Please try again with valid PDF files.');
    }

    setIsProcessing(false);
  };

  const downloadMergedPDF = () => {
    if (!mergedPdfUrl) return;

    const link = document.createElement('a');
    link.href = mergedPdfUrl;
    link.download = 'merged-document.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const resetTool = () => {
    setPdfFiles([]);
    setMergedPdfUrl(null);
    if (mergedPdfUrl) {
      URL.revokeObjectURL(mergedPdfUrl);
    }
  };

  return (
    <>
      <Helmet>
        <title>Merge PDF Files - Free Online PDF Merger Tool | ToolsHub</title>
        <meta name="description" content="Merge multiple PDF files into one document for free. Drag and drop PDF files, reorder pages, and download your merged PDF instantly. No registration required." />
        <meta name="keywords" content="merge PDF, combine PDF, PDF merger, join PDF files, PDF combiner, merge documents online" />
        <meta property="og:title" content="Merge PDF Files - Free Online PDF Merger Tool | ToolsHub" />
        <meta property="og:description" content="Merge multiple PDF files into one document for free. Drag and drop PDF files, reorder pages, and download instantly." />
        <meta property="og:type" content="website" />
        <link rel="canonical" href="/tools/merge-pdf" />
      </Helmet>

      <div className="min-h-screen flex flex-col" data-testid="page-merge-pdf">
        <Header />
        
        <main className="flex-1 bg-neutral-50">
          {/* Hero Section */}
          <section className="bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-700 text-white py-16">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <div className="w-20 h-20 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <i className="fas fa-object-group text-3xl"></i>
              </div>
              <h1 className="text-4xl sm:text-5xl font-bold mb-6" data-testid="text-page-title">
                Merge PDF Files
              </h1>
              <p className="text-xl text-blue-100 max-w-2xl mx-auto">
                Combine multiple PDF documents into one file. Drag, drop, reorder, and merge your PDFs in seconds.
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
                      <h2 className="text-2xl font-semibold text-gray-900 mb-6">Select PDF Files to Merge</h2>
                      
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
                          Drag and drop PDF files here
                        </h3>
                        <p className="text-gray-600 mb-4">
                          or click to select files from your computer
                        </p>
                        <Button
                          className="bg-blue-600 hover:bg-blue-700 text-white"
                          data-testid="button-select-files"
                        >
                          Select PDF Files
                        </Button>
                        
                        <input
                          ref={fileInputRef}
                          type="file"
                          multiple
                          accept=".pdf,application/pdf"
                          onChange={(e) => handleFileSelect(e.target.files)}
                          className="hidden"
                          data-testid="input-file"
                        />
                      </div>
                    </div>

                    {/* File List */}
                    {pdfFiles.length > 0 && (
                      <div>
                        <div className="flex justify-between items-center mb-4">
                          <h3 className="text-lg font-medium text-gray-900">
                            PDF Files ({pdfFiles.length})
                          </h3>
                          <Button
                            onClick={resetTool}
                            variant="outline"
                            className="text-red-600 border-red-200 hover:bg-red-50"
                          >
                            Clear All
                          </Button>
                        </div>
                        
                        <div className="space-y-3" data-testid="file-list">
                          {pdfFiles.map((file, index) => (
                            <div
                              key={file.id}
                              className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg"
                            >
                              <div className="flex flex-col gap-1">
                                <Button
                                  onClick={() => moveFile(file.id, 'up')}
                                  disabled={index === 0}
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 w-6 p-0"
                                >
                                  ↑
                                </Button>
                                <Button
                                  onClick={() => moveFile(file.id, 'down')}
                                  disabled={index === pdfFiles.length - 1}
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 w-6 p-0"
                                >
                                  ↓
                                </Button>
                              </div>
                              
                              <GripVertical className="w-5 h-5 text-gray-400" />
                              <FileText className="w-6 h-6 text-red-600" />
                              
                              <div className="flex-1">
                                <div className="font-medium text-gray-900">{file.name}</div>
                                <div className="text-sm text-gray-600">
                                  {file.size} • {file.pages} pages
                                </div>
                              </div>
                              
                              <Button
                                onClick={() => removeFile(file.id)}
                                variant="ghost"
                                size="sm"
                                className="text-red-600 hover:bg-red-50"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Merge Section */}
                    {pdfFiles.length >= 2 && (
                      <div className="text-center">
                        <Button
                          onClick={mergePDFs}
                          disabled={isProcessing}
                          className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 text-lg"
                          data-testid="button-merge"
                        >
                          {isProcessing ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                              Merging PDFs...
                            </>
                          ) : (
                            <>
                              <i className="fas fa-object-group mr-2"></i>
                              Merge {pdfFiles.length} PDF Files
                            </>
                          )}
                        </Button>
                      </div>
                    )}

                    {/* Results Section */}
                    {mergedPdfUrl && (
                      <div className="bg-green-50 rounded-xl p-6 text-center" data-testid="merge-results">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <i className="fas fa-check text-2xl text-green-600"></i>
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">
                          PDFs Successfully Merged!
                        </h3>
                        <p className="text-gray-600 mb-6">
                          Your {pdfFiles.length} PDF files have been combined into one document.
                        </p>
                        <Button
                          onClick={downloadMergedPDF}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3"
                          data-testid="button-download"
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Download Merged PDF
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Comprehensive SEO Content */}
              <div className="mt-12 space-y-8">
                {/* About PDF Merging */}
                <div className="bg-white rounded-2xl shadow-lg p-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-6">The Complete Guide to PDF Merging</h2>
                  <div className="prose max-w-none text-gray-700 space-y-6">
                    <p className="text-lg leading-relaxed">
                      PDF merging is an essential document management process that combines multiple Portable Document Format (PDF) files into a single, cohesive document. Whether you're a business professional consolidating reports, a student combining research materials, or an individual organizing personal documents, our free online PDF merger tool provides the perfect solution for all your document combination needs.
                    </p>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-4">Why Merge PDF Files?</h3>
                        <ul className="space-y-3 text-gray-700">
                          <li className="flex items-start">
                            <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                            <span><strong>Streamlined Organization:</strong> Consolidate related documents into single files for easier management and sharing</span>
                          </li>
                          <li className="flex items-start">
                            <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                            <span><strong>Professional Presentation:</strong> Create comprehensive reports, proposals, and presentations from multiple sources</span>
                          </li>
                          <li className="flex items-start">
                            <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                            <span><strong>Reduced File Clutter:</strong> Minimize the number of separate files while maintaining document integrity</span>
                          </li>
                          <li className="flex items-start">
                            <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                            <span><strong>Enhanced Collaboration:</strong> Share complete document sets as single files for improved team collaboration</span>
                          </li>
                        </ul>
                      </div>
                      
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-4">PDF Merger Benefits</h3>
                        <ul className="space-y-3 text-gray-700">
                          <li className="flex items-start">
                            <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                            <span><strong>Time Efficiency:</strong> Instantly combine multiple PDFs without manual copying and pasting</span>
                          </li>
                          <li className="flex items-start">
                            <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                            <span><strong>Format Preservation:</strong> Maintain original formatting, fonts, and layouts across all merged documents</span>
                          </li>
                          <li className="flex items-start">
                            <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                            <span><strong>Cross-Platform Compatibility:</strong> Works seamlessly across Windows, Mac, Linux, and mobile devices</span>
                          </li>
                          <li className="flex items-start">
                            <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                            <span><strong>File Size Optimization:</strong> Smart compression ensures merged files remain manageable in size</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                {/* How it Works */}
                <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-2xl shadow-lg p-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-6">How to Merge PDF Files Online</h2>
                  <p className="text-gray-700 mb-8 text-lg">
                    Our intuitive PDF merger makes combining documents effortless. Follow these simple steps to merge your PDF files in seconds:
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="text-center bg-white rounded-xl p-6 shadow-sm">
                      <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Upload className="w-8 h-8 text-blue-600" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Step 1: Upload PDF Files</h3>
                      <p className="text-gray-600">
                        Drag and drop your PDF files into the upload area or click to select files from your computer. Upload multiple PDFs simultaneously for batch processing.
                      </p>
                    </div>
                    
                    <div className="text-center bg-white rounded-xl p-6 shadow-sm">
                      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <GripVertical className="w-8 h-8 text-green-600" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Step 2: Arrange Document Order</h3>
                      <p className="text-gray-600">
                        Use the intuitive drag-and-drop interface or arrow buttons to reorder your PDFs. Preview page counts to ensure proper document sequence.
                      </p>
                    </div>
                    
                    <div className="text-center bg-white rounded-xl p-6 shadow-sm">
                      <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Download className="w-8 h-8 text-purple-600" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Step 3: Download Merged PDF</h3>
                      <p className="text-gray-600">
                        Click the merge button to combine your PDFs instantly. Download your professionally merged document in seconds.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Advanced Features */}
                <div className="bg-white rounded-2xl shadow-lg p-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-6">Advanced PDF Merger Features</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-4">Smart Document Processing</h3>
                      <div className="space-y-4">
                        <div className="flex items-start">
                          <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mr-3 mt-1">
                            <i className="fas fa-check text-xs text-green-600"></i>
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900">Unlimited File Merging</h4>
                            <p className="text-gray-600 text-sm">Combine unlimited PDF files without restrictions on file count or total size.</p>
                          </div>
                        </div>
                        
                        <div className="flex items-start">
                          <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mr-3 mt-1">
                            <i className="fas fa-check text-xs text-green-600"></i>
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900">Instant Processing</h4>
                            <p className="text-gray-600 text-sm">Lightning-fast PDF merging with real-time progress indicators and instant downloads.</p>
                          </div>
                        </div>
                        
                        <div className="flex items-start">
                          <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mr-3 mt-1">
                            <i className="fas fa-check text-xs text-green-600"></i>
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900">Format Preservation</h4>
                            <p className="text-gray-600 text-sm">Maintain original document quality, fonts, images, and formatting in merged files.</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-4">Security & Privacy</h3>
                      <div className="space-y-4">
                        <div className="flex items-start">
                          <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mr-3 mt-1">
                            <i className="fas fa-shield-alt text-xs text-green-600"></i>
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900">Client-Side Processing</h4>
                            <p className="text-gray-600 text-sm">All PDF merging happens in your browser - files never leave your device.</p>
                          </div>
                        </div>
                        
                        <div className="flex items-start">
                          <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mr-3 mt-1">
                            <i className="fas fa-user-shield text-xs text-green-600"></i>
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900">No Registration Required</h4>
                            <p className="text-gray-600 text-sm">Start merging PDFs immediately without creating accounts or providing personal information.</p>
                          </div>
                        </div>
                        
                        <div className="flex items-start">
                          <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mr-3 mt-1">
                            <i className="fas fa-trash text-xs text-green-600"></i>
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900">Automatic Cleanup</h4>
                            <p className="text-gray-600 text-sm">Temporary files are automatically removed to protect your privacy and device storage.</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Professional Use Cases */}
                <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-2xl shadow-lg p-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-6">Professional PDF Merging Applications</h2>
                  <p className="text-gray-700 mb-8 text-lg">
                    Our PDF merger serves diverse professional needs across industries. Discover how different sectors leverage document combining for enhanced productivity:
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                        <i className="fas fa-building text-blue-600 text-xl"></i>
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-3">Corporate Documentation</h3>
                      <p className="text-gray-600 text-sm mb-3">
                        Combine financial reports, board meeting minutes, policy documents, and compliance materials into comprehensive corporate packages.
                      </p>
                      <ul className="text-xs text-gray-500 space-y-1">
                        <li>• Annual reports compilation</li>
                        <li>• Policy manual creation</li>
                        <li>• Board presentation packages</li>
                      </ul>
                    </div>
                    
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                      <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                        <i className="fas fa-graduation-cap text-green-600 text-xl"></i>
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-3">Educational Materials</h3>
                      <p className="text-gray-600 text-sm mb-3">
                        Merge lecture notes, research papers, assignments, and reference materials into organized academic resources for students and educators.
                      </p>
                      <ul className="text-xs text-gray-500 space-y-1">
                        <li>• Course material compilation</li>
                        <li>• Research paper assembly</li>
                        <li>• Student portfolio creation</li>
                      </ul>
                    </div>
                    
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                      <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                        <i className="fas fa-balance-scale text-purple-600 text-xl"></i>
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-3">Legal Documentation</h3>
                      <p className="text-gray-600 text-sm mb-3">
                        Consolidate contracts, legal briefs, evidence documents, and case files into complete legal packages for court submissions and client review.
                      </p>
                      <ul className="text-xs text-gray-500 space-y-1">
                        <li>• Case file compilation</li>
                        <li>• Contract bundling</li>
                        <li>• Evidence documentation</li>
                      </ul>
                    </div>
                    
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                      <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                        <i className="fas fa-heartbeat text-red-600 text-xl"></i>
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-3">Healthcare Records</h3>
                      <p className="text-gray-600 text-sm mb-3">
                        Merge patient records, test results, treatment plans, and medical histories into comprehensive healthcare documentation packages.
                      </p>
                      <ul className="text-xs text-gray-500 space-y-1">
                        <li>• Patient file consolidation</li>
                        <li>• Medical report compilation</li>
                        <li>• Treatment documentation</li>
                      </ul>
                    </div>
                    
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                      <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                        <i className="fas fa-chart-line text-orange-600 text-xl"></i>
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-3">Marketing Materials</h3>
                      <p className="text-gray-600 text-sm mb-3">
                        Combine brochures, case studies, product specifications, and promotional materials into comprehensive marketing packages.
                      </p>
                      <ul className="text-xs text-gray-500 space-y-1">
                        <li>• Sales presentation kits</li>
                        <li>• Product catalog creation</li>
                        <li>• Campaign material bundles</li>
                      </ul>
                    </div>
                    
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                      <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                        <i className="fas fa-home text-indigo-600 text-xl"></i>
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-3">Real Estate Documentation</h3>
                      <p className="text-gray-600 text-sm mb-3">
                        Merge property listings, inspection reports, legal documents, and financial records into complete real estate transaction packages.
                      </p>
                      <ul className="text-xs text-gray-500 space-y-1">
                        <li>• Property package creation</li>
                        <li>• Transaction documentation</li>
                        <li>• Listing material compilation</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Technical Specifications */}
                <div className="bg-white rounded-2xl shadow-lg p-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-6">Technical Specifications & Compatibility</h2>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-4">Supported File Formats</h3>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <ul className="space-y-2 text-gray-700">
                          <li className="flex items-center">
                            <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                            <strong>PDF 1.0 - 1.7:</strong> Complete compatibility with all PDF versions
                          </li>
                          <li className="flex items-center">
                            <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                            <strong>PDF/A formats:</strong> Archive-quality PDF preservation
                          </li>
                          <li className="flex items-center">
                            <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                            <strong>Encrypted PDFs:</strong> Merge password-protected documents
                          </li>
                          <li className="flex items-center">
                            <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                            <strong>Form-enabled PDFs:</strong> Preserve interactive form fields
                          </li>
                        </ul>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-4">Browser & Device Support</h3>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <ul className="space-y-2 text-gray-700">
                          <li className="flex items-center">
                            <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                            <strong>Chrome, Firefox, Safari, Edge:</strong> Full functionality
                          </li>
                          <li className="flex items-center">
                            <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                            <strong>Mobile browsers:</strong> Complete mobile optimization
                          </li>
                          <li className="flex items-center">
                            <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                            <strong>Tablets & smartphones:</strong> Touch-friendly interface
                          </li>
                          <li className="flex items-center">
                            <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                            <strong>No plugins required:</strong> Pure web-based technology
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Frequently Asked Questions */}
                <div className="bg-gradient-to-br from-indigo-50 to-purple-100 rounded-2xl shadow-lg p-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-6">Frequently Asked Questions</h2>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="space-y-6">
                      <div className="bg-white rounded-lg p-6 shadow-sm">
                        <h3 className="font-semibold text-gray-900 mb-2">Is there a limit to how many PDFs I can merge?</h3>
                        <p className="text-gray-600 text-sm">
                          No, our PDF merger supports unlimited file combining. You can merge as many PDF documents as needed without restrictions on file count or total size.
                        </p>
                      </div>
                      
                      <div className="bg-white rounded-lg p-6 shadow-sm">
                        <h3 className="font-semibold text-gray-900 mb-2">Will the quality of my PDFs be affected after merging?</h3>
                        <p className="text-gray-600 text-sm">
                          No, our merger preserves original document quality, including fonts, images, formatting, and layout. The merged PDF maintains the same quality as your original files.
                        </p>
                      </div>
                      
                      <div className="bg-white rounded-lg p-6 shadow-sm">
                        <h3 className="font-semibold text-gray-900 mb-2">Can I merge password-protected PDFs?</h3>
                        <p className="text-gray-600 text-sm">
                          Yes, our tool can process password-protected PDFs. However, you may need to unlock them first or provide the password during the merging process.
                        </p>
                      </div>
                    </div>
                    
                    <div className="space-y-6">
                      <div className="bg-white rounded-lg p-6 shadow-sm">
                        <h3 className="font-semibold text-gray-900 mb-2">How secure is the PDF merging process?</h3>
                        <p className="text-gray-600 text-sm">
                          Completely secure. All processing happens locally in your browser - your files never leave your device or get uploaded to external servers.
                        </p>
                      </div>
                      
                      <div className="bg-white rounded-lg p-6 shadow-sm">
                        <h3 className="font-semibold text-gray-900 mb-2">Can I rearrange the order of PDFs before merging?</h3>
                        <p className="text-gray-600 text-sm">
                          Absolutely! Use our intuitive drag-and-drop interface or arrow buttons to reorder your PDFs exactly how you want them in the final merged document.
                        </p>
                      </div>
                      
                      <div className="bg-white rounded-lg p-6 shadow-sm">
                        <h3 className="font-semibold text-gray-900 mb-2">What file formats are supported for merging?</h3>
                        <p className="text-gray-600 text-sm">
                          Our tool specifically merges PDF files. All PDF versions (1.0-1.7) are supported, including PDF/A formats and form-enabled documents.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Related PDF Tools */}
                <div className="bg-white rounded-2xl shadow-lg p-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-6">Complete PDF Management Suite</h2>
                  <p className="text-gray-700 mb-8 text-lg">
                    Enhance your PDF workflow with our comprehensive collection of professional-grade PDF tools. Create a complete document management solution by combining multiple utilities.
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 hover:shadow-md transition-shadow border border-blue-200">
                      <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center mb-4">
                        <i className="fas fa-cut text-white text-xl"></i>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Split PDF Files</h3>
                      <p className="text-gray-600 text-sm mb-4">
                        Extract specific pages or split large PDF documents into smaller, manageable files. Perfect for separating chapters or sections.
                      </p>
                      <a href="/tools/split-pdf" className="text-blue-600 hover:text-blue-700 font-medium text-sm">
                        Try PDF Splitter →
                      </a>
                    </div>
                    
                    <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 hover:shadow-md transition-shadow border border-green-200">
                      <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center mb-4">
                        <i className="fas fa-compress text-white text-xl"></i>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Compress PDF Files</h3>
                      <p className="text-gray-600 text-sm mb-4">
                        Reduce file size of your merged PDFs for easier sharing and storage. Maintain quality while optimizing for web and email.
                      </p>
                      <a href="/tools/compress-pdf" className="text-green-600 hover:text-green-700 font-medium text-sm">
                        Try PDF Compressor →
                      </a>
                    </div>
                    
                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 hover:shadow-md transition-shadow border border-purple-200">
                      <div className="w-12 h-12 bg-purple-600 rounded-xl flex items-center justify-center mb-4">
                        <i className="fas fa-sort text-white text-xl"></i>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Organize PDF Pages</h3>
                      <p className="text-gray-600 text-sm mb-4">
                        Reorder, remove, or duplicate pages in your merged PDFs to ensure optimal document structure and flow.
                      </p>
                      <a href="/tools/organize-pdf" className="text-purple-600 hover:text-purple-700 font-medium text-sm">
                        Try Page Organizer →
                      </a>
                    </div>
                    
                    <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-6 hover:shadow-md transition-shadow border border-orange-200">
                      <div className="w-12 h-12 bg-orange-600 rounded-xl flex items-center justify-center mb-4">
                        <i className="fas fa-undo text-white text-xl"></i>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Rotate PDF Pages</h3>
                      <p className="text-gray-600 text-sm mb-4">
                        Correct page orientation before merging to ensure all pages have proper rotation and alignment in the final document.
                      </p>
                      <a href="/tools/rotate-pdf" className="text-orange-600 hover:text-orange-700 font-medium text-sm">
                        Try PDF Rotator →
                      </a>
                    </div>
                    
                    <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-6 hover:shadow-md transition-shadow border border-red-200">
                      <div className="w-12 h-12 bg-red-600 rounded-xl flex items-center justify-center mb-4">
                        <i className="fas fa-list-ol text-white text-xl"></i>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Add Page Numbers</h3>
                      <p className="text-gray-600 text-sm mb-4">
                        Add professional page numbering to your merged PDF documents for better organization and navigation.
                      </p>
                      <a href="/tools/add-page-numbers" className="text-red-600 hover:text-red-700 font-medium text-sm">
                        Try Page Numbering →
                      </a>
                    </div>
                    
                    <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-xl p-6 hover:shadow-md transition-shadow border border-indigo-200">
                      <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center mb-4">
                        <i className="fas fa-lock text-white text-xl"></i>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Protect PDF Files</h3>
                      <p className="text-gray-600 text-sm mb-4">
                        Add password protection and permissions to your merged PDF files to secure sensitive combined content.
                      </p>
                      <a href="/tools/protect-pdf" className="text-indigo-600 hover:text-indigo-700 font-medium text-sm">
                        Try PDF Protection →
                      </a>
                    </div>
                  </div>
                </div>

                {/* SEO Benefits Section */}
                <div className="bg-gradient-to-br from-gray-900 to-blue-900 text-white rounded-2xl shadow-lg p-8">
                  <h2 className="text-3xl font-bold mb-6">Why Choose Our PDF Merger Tool</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div>
                      <h3 className="text-xl font-semibold mb-3">🚀 Performance Excellence</h3>
                      <ul className="space-y-2 text-gray-300">
                        <li>• Lightning-fast processing speeds</li>
                        <li>• Instant file combination</li>
                        <li>• Real-time progress tracking</li>
                        <li>• Optimized for large files</li>
                      </ul>
                    </div>
                    
                    <div>
                      <h3 className="text-xl font-semibold mb-3">🔒 Security & Privacy</h3>
                      <ul className="space-y-2 text-gray-300">
                        <li>• Client-side processing only</li>
                        <li>• No file uploads to servers</li>
                        <li>• Automatic data cleanup</li>
                        <li>• GDPR compliant operation</li>
                      </ul>
                    </div>
                    
                    <div>
                      <h3 className="text-xl font-semibold mb-3">💎 Professional Quality</h3>
                      <ul className="space-y-2 text-gray-300">
                        <li>• Format preservation guarantee</li>
                        <li>• High-resolution output</li>
                        <li>• Metadata preservation</li>
                        <li>• Professional-grade results</li>
                      </ul>
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

export default MergePDFTool;