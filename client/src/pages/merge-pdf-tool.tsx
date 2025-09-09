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
                <FileText className="text-3xl" />
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
                        className={`border-2 border-dashed rounded-xl p-12 text-center transition-colors cursor-pointer ${
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
                              <FileText className="w-4 h-4 mr-2" />
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
                          <Download className="text-2xl text-green-600" />
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

              {/* Information Section */}
              <div className="mt-12 bg-white rounded-xl shadow-sm p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">How to Use the PDF Merger Tool</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                      <Upload className="w-6 h-6 text-blue-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">1. Upload PDFs</h3>
                    <p className="text-gray-600 text-sm">
                      Drag and drop your PDF files or click to select them from your device.
                    </p>
                  </div>
                  
                  <div className="text-center">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                      <GripVertical className="w-6 h-6 text-green-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">2. Reorder Files</h3>
                    <p className="text-gray-600 text-sm">
                      Use the arrow buttons to arrange your PDF files in the desired order.
                    </p>
                  </div>
                  
                  <div className="text-center">
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                      <Download className="w-6 h-6 text-purple-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">3. Download Result</h3>
                    <p className="text-gray-600 text-sm">
                      Click merge to combine your PDFs and download the final document.
                    </p>
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