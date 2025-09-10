
import { useState, useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Upload, FileText, Download, Zap, Shield, Clock, Globe } from 'lucide-react';

interface CompressionResult {
  originalSize: number;
  compressedSize: number;
  compressionRatio: number;
  downloadUrl: string;
  filename: string;
}

const CompressPDFTool = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [result, setResult] = useState<CompressionResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleFileSelect = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    
    const file = files[0];
    if (file.type !== 'application/pdf') {
      setError('Please select a PDF file.');
      return;
    }

    setSelectedFile(file);
    setError(null);
    setResult(null);
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

  const compressPDF = async () => {
    if (!selectedFile) return;

    setIsProcessing(true);
    setError(null);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append('pdf', selectedFile);

      const response = await fetch('/api/compress-pdf', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Compression failed');
      }

      const compressionRatio = parseInt(response.headers.get('X-Compression-Ratio') || '0');
      const blob = await response.blob();
      const downloadUrl = URL.createObjectURL(blob);

      setResult({
        originalSize: selectedFile.size,
        compressedSize: blob.size,
        compressionRatio,
        downloadUrl,
        filename: `compressed-${selectedFile.name}`
      });
    } catch (error) {
      console.error('Error compressing PDF:', error);
      setError(error instanceof Error ? error.message : 'Error compressing PDF. Please try again.');
    }

    setIsProcessing(false);
  };

  const resetTool = () => {
    setSelectedFile(null);
    setResult(null);
    setError(null);
  };

  return (
    <>
      <Helmet>
        <title>Compress PDF Online Free - Reduce PDF File Size | ToolsHub</title>
        <meta name="description" content="Compress PDF files online for free. Reduce PDF file size without losing quality. Fast, secure, and easy-to-use PDF compression tool." />
        <meta name="keywords" content="compress PDF, reduce PDF size, PDF compressor, PDF optimizer, compress PDF online, reduce file size" />
        <meta property="og:title" content="Compress PDF Online Free - Reduce PDF File Size | ToolsHub" />
        <meta property="og:description" content="Compress PDF files online for free. Reduce PDF file size without losing quality." />
        <meta property="og:type" content="website" />
        <link rel="canonical" href="/tools/compress-pdf-tool" />
      </Helmet>

      <div className="min-h-screen flex flex-col" data-testid="page-compress-pdf">
        <Header />
        
        <main className="flex-1 bg-neutral-50">
          {/* Hero Section */}
          <section className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 text-white py-16">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <div className="w-20 h-20 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Zap className="w-10 h-10" />
              </div>
              <h1 className="text-4xl sm:text-5xl font-bold mb-6" data-testid="text-page-title">
                Compress PDF Online
              </h1>
              <p className="text-xl text-blue-100 max-w-2xl mx-auto mb-8">
                Reduce PDF file size instantly without compromising quality. Fast, secure, and completely free PDF compression tool.
              </p>
              <div className="flex flex-wrap justify-center gap-6 text-blue-100">
                <div className="flex items-center">
                  <Shield className="w-5 h-5 mr-2" />
                  <span>100% Secure</span>
                </div>
                <div className="flex items-center">
                  <Clock className="w-5 h-5 mr-2" />
                  <span>Fast Processing</span>
                </div>
                <div className="flex items-center">
                  <Globe className="w-5 h-5 mr-2" />
                  <span>No Installation</span>
                </div>
              </div>
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
                      <h2 className="text-2xl font-semibold text-gray-900 mb-6">Upload PDF File</h2>
                      
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
                          accept=".pdf,application/pdf"
                          onChange={(e) => handleFileSelect(e.target.files)}
                          className="hidden"
                          data-testid="input-file"
                        />
                      </div>
                    </div>

                    {/* File Info */}
                    {selectedFile && (
                      <div className="bg-gray-50 rounded-lg p-4" data-testid="file-info">
                        <div className="flex items-center gap-4">
                          <FileText className="w-8 h-8 text-red-600" />
                          <div className="flex-1">
                            <div className="font-medium text-gray-900">{selectedFile.name}</div>
                            <div className="text-sm text-gray-600">
                              {formatFileSize(selectedFile.size)}
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

                    {/* Compress Button */}
                    {selectedFile && (
                      <Button
                        onClick={compressPDF}
                        disabled={isProcessing}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3"
                        data-testid="button-compress"
                      >
                        {isProcessing ? (
                          <>
                            <Zap className="w-4 h-4 mr-2 animate-spin" />
                            Compressing PDF...
                          </>
                        ) : (
                          <>
                            <Zap className="w-4 h-4 mr-2" />
                            Compress PDF
                          </>
                        )}
                      </Button>
                    )}

                    {/* Error Display */}
                    {error && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <div className="text-red-800 text-sm">{error}</div>
                      </div>
                    )}

                    {/* Results */}
                    {result && (
                      <div className="bg-green-50 rounded-lg p-6" data-testid="compression-results">
                        <h3 className="text-xl font-semibold text-green-900 mb-4">
                          Compression Complete!
                        </h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                          <div className="text-center">
                            <div className="text-2xl font-bold text-green-700">
                              {formatFileSize(result.originalSize)}
                            </div>
                            <div className="text-sm text-green-600">Original Size</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-green-700">
                              {formatFileSize(result.compressedSize)}
                            </div>
                            <div className="text-sm text-green-600">Compressed Size</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-green-700">
                              {result.compressionRatio}%
                            </div>
                            <div className="text-sm text-green-600">Size Reduction</div>
                          </div>
                        </div>

                        <Button
                          asChild
                          className="w-full bg-green-600 hover:bg-green-700 text-white"
                          data-testid="button-download"
                        >
                          <a href={result.downloadUrl} download={result.filename}>
                            <Download className="w-4 h-4 mr-2" />
                            Download Compressed PDF
                          </a>
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* SEO Content - How It Works */}
          <section className="py-16 bg-white">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-6">How to Compress PDF Files Online</h2>
                <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                  Our free PDF compressor uses advanced algorithms to reduce file size while maintaining document quality and readability.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Upload className="w-8 h-8 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">1. Upload Your PDF</h3>
                  <p className="text-gray-600">
                    Simply drag and drop your PDF file or click to browse and select it from your device. No registration required.
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Zap className="w-8 h-8 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">2. Compress Instantly</h3>
                  <p className="text-gray-600">
                    Click the compress button and our tool will automatically optimize your PDF using smart compression algorithms.
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Download className="w-8 h-8 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">3. Download Result</h3>
                  <p className="text-gray-600">
                    Download your compressed PDF file with reduced size while preserving the original quality and formatting.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Benefits Section */}
          <section className="py-16 bg-gray-50">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Why Choose Our PDF Compressor?</h2>
                <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                  Experience the best online PDF compression tool with advanced features and uncompromising security.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                  <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center mb-4">
                    <Shield className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">100% Secure & Private</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Your files are processed securely with SSL encryption. All documents are automatically deleted from our servers after compression.
                  </p>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                  <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mb-4">
                    <Zap className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">Lightning Fast</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Advanced compression algorithms process your PDFs in seconds, delivering optimized files without the wait.
                  </p>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                  <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center mb-4">
                    <i className="fas fa-gem text-white text-xl"></i>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">Quality Preserved</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Smart compression maintains text clarity, image sharpness, and document formatting while reducing file size.
                  </p>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                  <div className="w-12 h-12 bg-orange-600 rounded-lg flex items-center justify-center mb-4">
                    <Globe className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">Works Everywhere</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Browser-based tool works on Windows, Mac, Linux, iOS, and Android. No software installation required.
                  </p>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                  <div className="w-12 h-12 bg-red-600 rounded-lg flex items-center justify-center mb-4">
                    <i className="fas fa-heart text-white text-xl"></i>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">Completely Free</h3>
                  <p className="text-gray-600 leading-relaxed">
                    No hidden fees, subscriptions, or watermarks. Compress unlimited PDF files without any restrictions.
                  </p>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                  <div className="w-12 h-12 bg-indigo-600 rounded-lg flex items-center justify-center mb-4">
                    <i className="fas fa-users text-white text-xl"></i>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">Trusted by Millions</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Join millions of users worldwide who trust our PDF compression tool for their document optimization needs.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Use Cases */}
          <section className="py-16 bg-white">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Perfect for Every PDF Compression Need</h2>
                <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                  Whether you're sending emails, uploading to websites, or saving storage space, our compressor handles all scenarios.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <i className="fas fa-envelope text-blue-600 text-2xl"></i>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Email Attachments</h3>
                  <p className="text-gray-600 text-sm">
                    Reduce PDF size to meet email attachment limits and ensure faster delivery to recipients.
                  </p>
                </div>

                <div className="text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <i className="fas fa-cloud-upload-alt text-green-600 text-2xl"></i>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Web Uploads</h3>
                  <p className="text-gray-600 text-sm">
                    Optimize PDFs for website uploads, job applications, and online form submissions with size restrictions.
                  </p>
                </div>

                <div className="text-center">
                  <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <i className="fas fa-hdd text-purple-600 text-2xl"></i>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Storage Savings</h3>
                  <p className="text-gray-600 text-sm">
                    Free up valuable disk space by compressing large PDF collections and document archives.
                  </p>
                </div>

                <div className="text-center">
                  <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <i className="fas fa-mobile-alt text-orange-600 text-2xl"></i>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Mobile Sharing</h3>
                  <p className="text-gray-600 text-sm">
                    Compress PDFs for faster mobile sharing and reduced data usage when viewing on smartphones.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Technical Details */}
          <section className="py-16 bg-gradient-to-r from-blue-50 to-indigo-50">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-8">Advanced PDF Compression Technology</h2>
                  
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-3">Smart Image Optimization</h3>
                      <p className="text-gray-600 leading-relaxed">
                        Our compression engine intelligently analyzes images within your PDF and applies optimal compression 
                        techniques. JPEG images are recompressed with quality preservation algorithms, while unnecessary 
                        metadata is removed to reduce file size without affecting visual quality.
                      </p>
                    </div>

                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-3">Font and Vector Optimization</h3>
                      <p className="text-gray-600 leading-relaxed">
                        Text and vector graphics are optimized using lossless compression methods that maintain perfect 
                        clarity while reducing redundant data. Font subsetting eliminates unused characters to minimize 
                        file size without compromising readability.
                      </p>
                    </div>

                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-3">Structure Optimization</h3>
                      <p className="text-gray-600 leading-relaxed">
                        The PDF structure is analyzed and optimized by removing duplicate objects, compressing content 
                        streams, and reorganizing the file structure for maximum efficiency and faster loading times.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-8">
                  <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">Compression Statistics</h3>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Average Size Reduction:</span>
                        <span className="text-2xl font-bold text-blue-600">60%</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Processing Time:</span>
                        <span className="text-2xl font-bold text-green-600">&lt; 10 sec</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Files Processed:</span>
                        <span className="text-2xl font-bold text-purple-600">10M+</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Storage Saved:</span>
                        <span className="text-2xl font-bold text-orange-600">100TB+</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
                    <h3 className="text-xl font-semibold text-blue-900 mb-4">Supported File Types</h3>
                    <ul className="space-y-2 text-blue-800">
                      <li className="flex items-center">
                        <span className="text-blue-600 mr-2">✓</span>
                        All PDF versions (1.0 to 2.0)
                      </li>
                      <li className="flex items-center">
                        <span className="text-blue-600 mr-2">✓</span>
                        Password-protected PDFs
                      </li>
                      <li className="flex items-center">
                        <span className="text-blue-600 mr-2">✓</span>
                        PDFs with forms and annotations
                      </li>
                      <li className="flex items-center">
                        <span className="text-blue-600 mr-2">✓</span>
                        Multi-page documents
                      </li>
                      <li className="flex items-center">
                        <span className="text-blue-600 mr-2">✓</span>
                        Files up to 100MB
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* FAQ Section */}
          <section className="py-16 bg-white">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Frequently Asked Questions</h2>
                <p className="text-xl text-gray-600">
                  Everything you need to know about PDF compression
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">How much can I compress my PDF?</h4>
                    <p className="text-gray-600 text-sm">Compression rates vary depending on your PDF content. Documents with many images can be compressed by 70-90%, while text-heavy documents typically see 30-60% reduction.</p>
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">Will compression affect PDF quality?</h4>
                    <p className="text-gray-600 text-sm">Our smart compression algorithms preserve text clarity and maintain image quality while reducing file size. The visual difference is minimal and often unnoticeable.</p>
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">Is my PDF safe during compression?</h4>
                    <p className="text-gray-600 text-sm">Yes, all files are processed securely with SSL encryption. Your documents are automatically deleted from our servers immediately after compression.</p>
                  </div>
                </div>
                
                <div className="space-y-6">
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">What's the maximum file size I can compress?</h4>
                    <p className="text-gray-600 text-sm">Our tool supports PDF files up to 100MB in size. For larger files, consider splitting them into smaller parts first.</p>
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">Can I compress password-protected PDFs?</h4>
                    <p className="text-gray-600 text-sm">Yes, you can compress password-protected PDFs. However, you may need to unlock them first for optimal compression results.</p>
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">Do I need to install any software?</h4>
                    <p className="text-gray-600 text-sm">No installation required! Our tool works entirely in your web browser on any device - Windows, Mac, Linux, iOS, or Android.</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Related Tools */}
          <section className="py-16 bg-gradient-to-r from-gray-50 to-blue-50">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Related PDF Tools</h2>
                <p className="text-xl text-gray-600">
                  Discover more powerful PDF tools to enhance your document workflow
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                  <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center mb-4">
                    <i className="fas fa-cog text-white text-xl"></i>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">Advanced PDF Compressor</h3>
                  <p className="text-gray-600 mb-4">
                    Full control over compression settings with image quality adjustment and optimization options.
                  </p>
                  <a href="/tools/pdf-compressor-advanced" className="text-purple-600 hover:text-purple-700 font-medium">
                    Try Advanced Compressor →
                  </a>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                  <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mb-4">
                    <i className="fas fa-shield-alt text-white text-xl"></i>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">Protect PDF</h3>
                  <p className="text-gray-600 mb-4">
                    Add password protection and security settings to your compressed PDFs for enhanced safety.
                  </p>
                  <a href="/tools/protect-pdf-tool" className="text-blue-600 hover:text-blue-700 font-medium">
                    Secure PDFs →
                  </a>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                  <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center mb-4">
                    <i className="fas fa-object-group text-white text-xl"></i>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">Merge PDFs</h3>
                  <p className="text-gray-600 mb-4">
                    Combine multiple PDF files into one document and then compress for optimal file size.
                  </p>
                  <a href="/tools/merge-pdf-tool" className="text-green-600 hover:text-green-700 font-medium">
                    Merge PDFs →
                  </a>
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
