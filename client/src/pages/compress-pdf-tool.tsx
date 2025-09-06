
import { useState, useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Upload, FileText, Download, Trash2, Archive } from 'lucide-react';

interface PDFFile {
  id: string;
  file: File;
  name: string;
  size: string;
  originalSize: number;
}

const CompressPDFTool = () => {
  const [pdfFile, setPdfFile] = useState<PDFFile | null>(null);
  const [compressedPdfUrl, setCompressedPdfUrl] = useState<string | null>(null);
  const [compressionRatio, setCompressionRatio] = useState<number | null>(null);
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

  const handleFileSelect = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const file = files[0];
    if (file.type === 'application/pdf') {
      setPdfFile({
        id: generateId(),
        file,
        name: file.name,
        size: formatFileSize(file.size),
        originalSize: file.size
      });
      setCompressedPdfUrl(null);
      setCompressionRatio(null);
    } else {
      alert('Please select a PDF file.');
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

  const removeFile = () => {
    setPdfFile(null);
    setCompressedPdfUrl(null);
    setCompressionRatio(null);
  };

  const compressPDF = async () => {
    if (!pdfFile) return;

    setIsProcessing(true);
    
    try {
      const formData = new FormData();
      formData.append('pdf', pdfFile.file);

      const response = await fetch('/api/compress-pdf-pikepdf', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Compression failed');
      }

      // Get compression ratio from headers
      const ratio = response.headers.get('X-Compression-Ratio');
      if (ratio) {
        setCompressionRatio(parseInt(ratio));
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      setCompressedPdfUrl(url);
    } catch (error) {
      console.error('Error compressing PDF:', error);
      alert(`Error compressing PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    setIsProcessing(false);
  };

  const downloadCompressedPDF = () => {
    if (!compressedPdfUrl || !pdfFile) return;

    const link = document.createElement('a');
    link.href = compressedPdfUrl;
    link.download = `compressed-${pdfFile.name}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const resetTool = () => {
    setPdfFile(null);
    setCompressedPdfUrl(null);
    setCompressionRatio(null);
    if (compressedPdfUrl) {
      URL.revokeObjectURL(compressedPdfUrl);
    }
  };

  return (
    <>
      <Helmet>
        <title>Compress PDF Files - Free Online PDF Compressor Tool | ToolsHub</title>
        <meta name="description" content="Compress PDF files to reduce file size for free. Upload your PDF and get a smaller, optimized file instantly. No registration required." />
        <meta name="keywords" content="compress PDF, reduce PDF size, PDF compressor, optimize PDF, shrink PDF, PDF compression tool" />
        <meta property="og:title" content="Compress PDF Files - Free Online PDF Compressor Tool | ToolsHub" />
        <meta property="og:description" content="Compress PDF files to reduce file size for free. Upload your PDF and get a smaller, optimized file instantly." />
        <meta property="og:type" content="website" />
        <link rel="canonical" href="/tools/compress-pdf" />
      </Helmet>

      <div className="min-h-screen flex flex-col" data-testid="page-compress-pdf">
        <Header />
        
        <main className="flex-1 bg-neutral-50">
          {/* Hero Section */}
          <section className="bg-gradient-to-r from-green-600 via-green-500 to-emerald-700 text-white py-16">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <div className="w-20 h-20 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Archive className="w-8 h-8" />
              </div>
              <h1 className="text-4xl sm:text-5xl font-bold mb-6" data-testid="text-page-title">
                Compress PDF Files
              </h1>
              <p className="text-xl text-green-100 max-w-2xl mx-auto">
                Reduce PDF file size while maintaining quality. Compress your PDFs for easier sharing and storage.
              </p>
            </div>
          </section>

          {/* Tool Section */}
          <section className="py-16">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
              <Card className="bg-white shadow-sm border-0">
                <CardContent className="p-8">
                  <div className="space-y-8">
                    {/* File Upload Section */}
                    <div>
                      <h2 className="text-2xl font-semibold text-gray-900 mb-6">Select PDF File to Compress</h2>
                      
                      <div
                        className={`border-2 border-dashed rounded-xl p-12 text-center transition-colors ${
                          dragOver 
                            ? 'border-green-500 bg-green-50' 
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                        onDrop={handleDrop}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                          Drag and drop a PDF file here
                        </h3>
                        <p className="text-gray-600 mb-4">
                          or click to select a file from your computer
                        </p>
                        <Button
                          className="bg-green-600 hover:bg-green-700 text-white"
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

                    {/* File Display */}
                    {pdfFile && (
                      <div>
                        <div className="flex justify-between items-center mb-4">
                          <h3 className="text-lg font-medium text-gray-900">Selected PDF</h3>
                          <Button
                            onClick={removeFile}
                            variant="outline"
                            className="text-red-600 border-red-200 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Remove
                          </Button>
                        </div>
                        
                        <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg" data-testid="file-display">
                          <FileText className="w-6 h-6 text-red-600" />
                          <div className="flex-1">
                            <div className="font-medium text-gray-900">{pdfFile.name}</div>
                            <div className="text-sm text-gray-600">Size: {pdfFile.size}</div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Compress Section */}
                    {pdfFile && !compressedPdfUrl && (
                      <div className="text-center">
                        <Button
                          onClick={compressPDF}
                          disabled={isProcessing}
                          className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 text-lg"
                          data-testid="button-compress"
                        >
                          {isProcessing ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                              Compressing PDF...
                            </>
                          ) : (
                            <>
                              <Archive className="w-4 h-4 mr-2" />
                              Compress PDF
                            </>
                          )}
                        </Button>
                      </div>
                    )}

                    {/* Results Section */}
                    {compressedPdfUrl && (
                      <div className="bg-green-50 rounded-xl p-6 text-center" data-testid="compress-results">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Archive className="w-8 h-8 text-green-600" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">
                          PDF Successfully Compressed!
                        </h3>
                        {compressionRatio !== null && (
                          <p className="text-gray-600 mb-6">
                            File size reduced by {compressionRatio}%
                          </p>
                        )}
                        <div className="flex gap-4 justify-center">
                          <Button
                            onClick={downloadCompressedPDF}
                            className="bg-green-600 hover:bg-green-700 text-white px-6 py-3"
                            data-testid="button-download"
                          >
                            <Download className="w-4 h-4 mr-2" />
                            Download Compressed PDF
                          </Button>
                          <Button
                            onClick={resetTool}
                            variant="outline"
                            className="px-6 py-3"
                          >
                            Compress Another PDF
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Educational Content */}
              <div className="mt-12 space-y-8">
                {/* How it Works */}
                <div className="bg-white rounded-2xl shadow-lg p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">How PDF Compression Works</h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Upload className="w-8 h-8 text-blue-600" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">1. Upload PDF</h3>
                      <p className="text-gray-600">
                        Select your PDF file that you want to compress.
                      </p>
                    </div>
                    
                    <div className="text-center">
                      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Archive className="w-8 h-8 text-green-600" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">2. Optimize</h3>
                      <p className="text-gray-600">
                        Our tool optimizes images, removes redundancy, and compresses streams.
                      </p>
                    </div>
                    
                    <div className="text-center">
                      <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Download className="w-8 h-8 text-purple-600" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">3. Download</h3>
                      <p className="text-gray-600">
                        Get your compressed PDF with reduced file size.
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
                        <h3 className="font-semibold text-gray-900">High-Quality Compression</h3>
                        <p className="text-gray-600 text-sm">Reduces file size while maintaining visual quality.</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mr-3 mt-1">
                        <i className="fas fa-check text-xs text-green-600"></i>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">Fast Processing</h3>
                        <p className="text-gray-600 text-sm">Compress your PDFs in seconds, not minutes.</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mr-3 mt-1">
                        <i className="fas fa-check text-xs text-green-600"></i>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">Secure & Private</h3>
                        <p className="text-gray-600 text-sm">Files are processed securely and deleted after compression.</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mr-3 mt-1">
                        <i className="fas fa-check text-xs text-green-600"></i>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">No Registration</h3>
                        <p className="text-gray-600 text-sm">Use the tool instantly without creating an account.</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Use Cases */}
                <div className="bg-white rounded-2xl shadow-lg p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">When to Use PDF Compression</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="bg-blue-50 rounded-lg p-4">
                      <h3 className="font-semibold text-gray-900 mb-2">📧 Email Attachments</h3>
                      <p className="text-sm text-gray-600">Reduce file size to meet email attachment limits.</p>
                    </div>
                    
                    <div className="bg-green-50 rounded-lg p-4">
                      <h3 className="font-semibold text-gray-900 mb-2">☁️ Cloud Storage</h3>
                      <p className="text-sm text-gray-600">Save storage space and reduce upload times.</p>
                    </div>
                    
                    <div className="bg-purple-50 rounded-lg p-4">
                      <h3 className="font-semibold text-gray-900 mb-2">🌐 Web Publishing</h3>
                      <p className="text-sm text-gray-600">Improve website loading speeds with smaller PDFs.</p>
                    </div>
                    
                    <div className="bg-orange-50 rounded-lg p-4">
                      <h3 className="font-semibold text-gray-900 mb-2">📱 Mobile Sharing</h3>
                      <p className="text-sm text-gray-600">Share files faster on mobile networks.</p>
                    </div>
                    
                    <div className="bg-red-50 rounded-lg p-4">
                      <h3 className="font-semibold text-gray-900 mb-2">💾 Archive Storage</h3>
                      <p className="text-sm text-gray-600">Optimize long-term document storage.</p>
                    </div>
                    
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h3 className="font-semibold text-gray-900 mb-2">🔗 File Sharing</h3>
                      <p className="text-sm text-gray-600">Share large documents more efficiently.</p>
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

export default CompressPDFTool;
