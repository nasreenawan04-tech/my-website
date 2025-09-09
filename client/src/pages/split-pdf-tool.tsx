import { useState, useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { PDFDocument } from 'pdf-lib';
import { Upload, FileText, Download, Scissors, Archive } from 'lucide-react';

interface SplitResult {
  filename: string;
  url: string;
  pages: string;
}

interface PageRange {
  start: number;
  end: number;
  name: string;
}

const SplitPDFTool = () => {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [splitMode, setSplitMode] = useState<'individual' | 'ranges'>('individual');
  const [pageRanges, setPageRanges] = useState<PageRange[]>([]);
  const [newRangeStart, setNewRangeStart] = useState('');
  const [newRangeEnd, setNewRangeEnd] = useState('');
  const [newRangeName, setNewRangeName] = useState('');
  const [splitResults, setSplitResults] = useState<SplitResult[]>([]);
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

  const handleFileSelect = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const file = files[0];
    if (file.type !== 'application/pdf') {
      alert('Please select a valid PDF file.');
      return;
    }

    setPdfFile(file);
    
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await PDFDocument.load(arrayBuffer);
      const pages = pdf.getPageCount();
      setTotalPages(pages);
      setSplitResults([]);
      setPageRanges([]);
    } catch (error) {
      console.error('Error loading PDF:', error);
      alert('Error loading PDF file. Please try again with a valid PDF.');
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

  const addPageRange = () => {
    const start = parseInt(newRangeStart);
    const end = parseInt(newRangeEnd);
    
    if (isNaN(start) || isNaN(end) || start < 1 || end > totalPages || start > end) {
      alert(`Please enter valid page numbers between 1 and ${totalPages}`);
      return;
    }

    const name = newRangeName.trim() || `Pages ${start}-${end}`;
    
    setPageRanges(prev => [...prev, { start, end, name }]);
    setNewRangeStart('');
    setNewRangeEnd('');
    setNewRangeName('');
  };

  const removePageRange = (index: number) => {
    setPageRanges(prev => prev.filter((_, i) => i !== index));
  };

  const splitPDF = async () => {
    if (!pdfFile) return;

    setIsProcessing(true);
    const results: SplitResult[] = [];

    try {
      const arrayBuffer = await pdfFile.arrayBuffer();
      const originalPdf = await PDFDocument.load(arrayBuffer);

      if (splitMode === 'individual') {
        // Split into individual pages
        for (let i = 0; i < totalPages; i++) {
          const newPdf = await PDFDocument.create();
          const [copiedPage] = await newPdf.copyPages(originalPdf, [i]);
          newPdf.addPage(copiedPage);
          
          const pdfBytes = await newPdf.save();
          const blob = new Blob([pdfBytes], { type: 'application/pdf' });
          const url = URL.createObjectURL(blob);
          
          results.push({
            filename: `page-${i + 1}.pdf`,
            url,
            pages: `Page ${i + 1}`
          });
        }
      } else {
        // Split by custom ranges
        for (const range of pageRanges) {
          const newPdf = await PDFDocument.create();
          const pageIndices = [];
          
          for (let i = range.start - 1; i < range.end; i++) {
            pageIndices.push(i);
          }
          
          const copiedPages = await newPdf.copyPages(originalPdf, pageIndices);
          copiedPages.forEach(page => newPdf.addPage(page));
          
          const pdfBytes = await newPdf.save();
          const blob = new Blob([pdfBytes], { type: 'application/pdf' });
          const url = URL.createObjectURL(blob);
          
          results.push({
            filename: `${range.name.toLowerCase().replace(/\s+/g, '-')}.pdf`,
            url,
            pages: range.start === range.end ? `Page ${range.start}` : `Pages ${range.start}-${range.end}`
          });
        }
      }

      setSplitResults(results);
    } catch (error) {
      console.error('Error splitting PDF:', error);
      alert('Error splitting PDF. Please try again.');
    }

    setIsProcessing(false);
  };

  const downloadFile = (result: SplitResult) => {
    const link = document.createElement('a');
    link.href = result.url;
    link.download = result.filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadAllFiles = () => {
    splitResults.forEach((result, index) => {
      setTimeout(() => {
        downloadFile(result);
      }, index * 200); // Stagger downloads
    });
  };

  const resetTool = () => {
    setPdfFile(null);
    setTotalPages(0);
    setPageRanges([]);
    setSplitResults([]);
    setNewRangeStart('');
    setNewRangeEnd('');
    setNewRangeName('');
    
    // Clean up object URLs
    splitResults.forEach(result => {
      URL.revokeObjectURL(result.url);
    });
  };

  return (
    <>
      <Helmet>
        <title>Split PDF Files - Free Online PDF Splitter Tool | ToolsHub</title>
        <meta name="description" content="Split PDF files into individual pages or custom ranges for free. Extract specific pages from PDFs instantly. No registration required." />
        <meta name="keywords" content="split PDF, PDF splitter, extract PDF pages, divide PDF, separate PDF pages, PDF page extractor" />
        <meta property="og:title" content="Split PDF Files - Free Online PDF Splitter Tool | ToolsHub" />
        <meta property="og:description" content="Split PDF files into individual pages or custom ranges for free. Extract specific pages from PDFs instantly." />
        <meta property="og:type" content="website" />
        <link rel="canonical" href="/tools/split-pdf" />
      </Helmet>

      <div className="min-h-screen flex flex-col" data-testid="page-split-pdf">
        <Header />
        
        <main className="flex-1 bg-neutral-50">
          {/* Hero Section */}
          <section className="bg-gradient-to-r from-purple-600 via-purple-500 to-indigo-700 text-white py-16">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <div className="w-20 h-20 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <i className="fas fa-cut text-3xl"></i>
              </div>
              <h1 className="text-4xl sm:text-5xl font-bold mb-6" data-testid="text-page-title">
                Split PDF Files
              </h1>
              <p className="text-xl text-purple-100 max-w-2xl mx-auto">
                Extract individual pages or specific page ranges from your PDF documents. Split PDFs quickly and securely.
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
                      <h2 className="text-2xl font-semibold text-gray-900 mb-6">Upload PDF File to Split</h2>
                      
                      <div
                        className={`border-2 border-dashed rounded-xl p-12 text-center transition-colors ${
                          dragOver 
                            ? 'border-purple-500 bg-purple-50' 
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
                          className="bg-purple-600 hover:bg-purple-700 text-white"
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
                    {pdfFile && (
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center gap-4">
                          <FileText className="w-8 h-8 text-red-600" />
                          <div className="flex-1">
                            <h3 className="font-medium text-gray-900">{pdfFile.name}</h3>
                            <p className="text-sm text-gray-600">
                              {formatFileSize(pdfFile.size)} • {totalPages} pages
                            </p>
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

                    {/* Split Options */}
                    {pdfFile && totalPages > 0 && (
                      <div>
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Split Options</h3>
                        
                        <RadioGroup 
                          value={splitMode} 
                          onValueChange={(value: 'individual' | 'ranges') => setSplitMode(value)}
                          className="space-y-4"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="individual" id="individual" data-testid="radio-individual" />
                            <Label htmlFor="individual" className="font-medium">
                              Split into individual pages ({totalPages} files)
                            </Label>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="ranges" id="ranges" data-testid="radio-ranges" />
                            <Label htmlFor="ranges" className="font-medium">
                              Split by custom page ranges
                            </Label>
                          </div>
                        </RadioGroup>
                      </div>
                    )}

                    {/* Custom Ranges Section */}
                    {pdfFile && splitMode === 'ranges' && (
                      <div className="space-y-6">
                        <div className="bg-blue-50 rounded-lg p-4">
                          <h4 className="font-medium text-gray-900 mb-4">Add Page Range</h4>
                          
                          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div>
                              <Label htmlFor="range-start" className="text-sm">Start Page</Label>
                              <Input
                                id="range-start"
                                type="number"
                                min="1"
                                max={totalPages}
                                value={newRangeStart}
                                onChange={(e) => setNewRangeStart(e.target.value)}
                                placeholder="1"
                                className="mt-1"
                                data-testid="input-range-start"
                              />
                            </div>
                            
                            <div>
                              <Label htmlFor="range-end" className="text-sm">End Page</Label>
                              <Input
                                id="range-end"
                                type="number"
                                min="1"
                                max={totalPages}
                                value={newRangeEnd}
                                onChange={(e) => setNewRangeEnd(e.target.value)}
                                placeholder={totalPages.toString()}
                                className="mt-1"
                                data-testid="input-range-end"
                              />
                            </div>
                            
                            <div>
                              <Label htmlFor="range-name" className="text-sm">Name (optional)</Label>
                              <Input
                                id="range-name"
                                type="text"
                                value={newRangeName}
                                onChange={(e) => setNewRangeName(e.target.value)}
                                placeholder="Chapter 1"
                                className="mt-1"
                                data-testid="input-range-name"
                              />
                            </div>
                            
                            <div className="flex items-end">
                              <Button
                                onClick={addPageRange}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                                data-testid="button-add-range"
                              >
                                Add Range
                              </Button>
                            </div>
                          </div>
                        </div>

                        {/* Page Ranges List */}
                        {pageRanges.length > 0 && (
                          <div>
                            <h4 className="font-medium text-gray-900 mb-3">Page Ranges to Extract</h4>
                            <div className="space-y-2" data-testid="ranges-list">
                              {pageRanges.map((range, index) => (
                                <div key={index} className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                                  <div>
                                    <span className="font-medium">{range.name}</span>
                                    <span className="text-gray-600 ml-2">
                                      (Pages {range.start}-{range.end})
                                    </span>
                                  </div>
                                  <Button
                                    onClick={() => removePageRange(index)}
                                    variant="ghost"
                                    size="sm"
                                    className="text-red-600 hover:bg-red-50"
                                  >
                                    Remove
                                  </Button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Split Button */}
                    {pdfFile && (splitMode === 'individual' || (splitMode === 'ranges' && pageRanges.length > 0)) && (
                      <div className="text-center">
                        <Button
                          onClick={splitPDF}
                          disabled={isProcessing}
                          className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 text-lg"
                          data-testid="button-split"
                        >
                          {isProcessing ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                              Splitting PDF...
                            </>
                          ) : (
                            <>
                              <Scissors className="w-4 h-4 mr-2" />
                              Split PDF
                            </>
                          )}
                        </Button>
                      </div>
                    )}

                    {/* Results Section */}
                    {splitResults.length > 0 && (
                      <div className="bg-green-50 rounded-xl p-6" data-testid="split-results">
                        <div className="text-center mb-6">
                          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <i className="fas fa-check text-2xl text-green-600"></i>
                          </div>
                          <h3 className="text-xl font-semibold text-gray-900 mb-2">
                            PDF Successfully Split!
                          </h3>
                          <p className="text-gray-600 mb-4">
                            Your PDF has been split into {splitResults.length} files.
                          </p>
                          
                          {splitResults.length > 1 && (
                            <Button
                              onClick={downloadAllFiles}
                              className="bg-blue-600 hover:bg-blue-700 text-white mb-4"
                              data-testid="button-download-all"
                            >
                              <Archive className="w-4 h-4 mr-2" />
                              Download All Files
                            </Button>
                          )}
                        </div>

                        <div className="space-y-3">
                          <h4 className="font-medium text-gray-900">Individual Downloads:</h4>
                          {splitResults.map((result, index) => (
                            <div key={index} className="flex items-center justify-between bg-white rounded-lg p-4">
                              <div className="flex items-center gap-3">
                                <FileText className="w-5 h-5 text-red-600" />
                                <div>
                                  <div className="font-medium text-gray-900">{result.filename}</div>
                                  <div className="text-sm text-gray-600">{result.pages}</div>
                                </div>
                              </div>
                              <Button
                                onClick={() => downloadFile(result)}
                                size="sm"
                                className="bg-purple-600 hover:bg-purple-700 text-white"
                                data-testid={`button-download-${index}`}
                              >
                                <Download className="w-4 h-4 mr-1" />
                                Download
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Educational Content */}
              <div className="mt-12 space-y-8">
                {/* What is PDF Splitting - Enhanced */}
                <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl shadow-lg p-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-6">What is PDF Splitting and How Does It Work?</h2>
                  <div className="prose prose-lg text-gray-700 max-w-none">
                    <p className="mb-6 text-lg">
                      <strong>PDF splitting</strong> is a powerful document management technique that allows you to divide a single PDF file into multiple separate documents. Our advanced PDF splitter tool processes your documents entirely in your browser, ensuring complete privacy and security while delivering professional results.
                    </p>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                      <div className="bg-white rounded-xl p-6 shadow-sm">
                        <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                          <i className="fas fa-cogs text-blue-600 mr-3"></i>
                          How Our PDF Splitter Works
                        </h3>
                        <ul className="space-y-3 text-gray-700">
                          <li className="flex items-start">
                            <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                            <span><strong>Client-side Processing:</strong> All splitting happens locally in your browser using advanced PDF-lib technology</span>
                          </li>
                          <li className="flex items-start">
                            <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                            <span><strong>Page Analysis:</strong> Automatically detects and counts pages for accurate splitting</span>
                          </li>
                          <li className="flex items-start">
                            <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                            <span><strong>Quality Preservation:</strong> Maintains original formatting, images, and text quality</span>
                          </li>
                          <li className="flex items-start">
                            <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                            <span><strong>Instant Download:</strong> Generate multiple files ready for immediate download</span>
                          </li>
                        </ul>
                      </div>
                      
                      <div className="bg-white rounded-xl p-6 shadow-sm">
                        <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                          <i className="fas fa-shield-alt text-green-600 mr-3"></i>
                          Privacy & Security Features
                        </h3>
                        <ul className="space-y-3 text-gray-700">
                          <li className="flex items-start">
                            <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                            <span><strong>No File Upload:</strong> Documents never leave your device</span>
                          </li>
                          <li className="flex items-start">
                            <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                            <span><strong>Zero Data Storage:</strong> No files stored on our servers</span>
                          </li>
                          <li className="flex items-start">
                            <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                            <span><strong>GDPR Compliant:</strong> Complete privacy protection</span>
                          </li>
                          <li className="flex items-start">
                            <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                            <span><strong>Instant Processing:</strong> No waiting, no queues</span>
                          </li>
                        </ul>
                      </div>
                    </div>

                    <div className="bg-gradient-to-r from-purple-100 to-blue-100 rounded-lg p-6">
                      <h3 className="text-xl font-semibold text-gray-900 mb-3">Two Powerful Splitting Methods</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">📄 Individual Page Extraction</h4>
                          <p className="text-gray-700 text-sm">
                            Extract each page as a separate PDF file. Perfect for creating individual documents, study materials, or sharing specific pages.
                          </p>
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">📚 Custom Range Splitting</h4>
                          <p className="text-gray-700 text-sm">
                            Define specific page ranges with custom names. Ideal for extracting chapters, sections, or creating focused document collections.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* How it Works */}
                <div className="bg-white rounded-2xl shadow-lg p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">How to Split PDF Files</h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Upload className="w-8 h-8 text-purple-600" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">1. Upload PDF</h3>
                      <p className="text-gray-600">
                        Drag and drop your PDF file or click to select it from your computer.
                      </p>
                    </div>
                    
                    <div className="text-center">
                      <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Scissors className="w-8 h-8 text-blue-600" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">2. Choose Split Method</h3>
                      <p className="text-gray-600">
                        Split into individual pages or define custom page ranges.
                      </p>
                    </div>
                    
                    <div className="text-center">
                      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Download className="w-8 h-8 text-green-600" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">3. Download Files</h3>
                      <p className="text-gray-600">
                        Download individual files or all split PDFs at once.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Why Split PDFs - Enhanced Benefits */}
                <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl shadow-lg p-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-6">Why Split PDF Files? Key Benefits Explained</h2>
                  <div className="prose prose-lg text-gray-700 max-w-none">
                    <p className="mb-6 text-lg">
                      Discover how PDF splitting transforms your document workflow. From improved organization to enhanced security, splitting PDFs offers numerous advantages for individuals and businesses alike.
                    </p>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                      <div className="bg-white rounded-xl p-6 shadow-sm border border-emerald-200">
                        <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center mb-4">
                          <i className="fas fa-rocket text-emerald-600 text-xl"></i>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-3">Improved Productivity</h3>
                        <ul className="text-sm text-gray-700 space-y-2">
                          <li>• Faster access to specific content</li>
                          <li>• Reduced file loading times</li>
                          <li>• Better mobile device performance</li>
                          <li>• Streamlined workflow processes</li>
                        </ul>
                      </div>
                      
                      <div className="bg-white rounded-xl p-6 shadow-sm border border-blue-200">
                        <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
                          <i className="fas fa-share-alt text-blue-600 text-xl"></i>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-3">Enhanced Sharing</h3>
                        <ul className="text-sm text-gray-700 space-y-2">
                          <li>• Share only relevant pages</li>
                          <li>• Reduce email attachment sizes</li>
                          <li>• Faster upload/download speeds</li>
                          <li>• Better collaboration efficiency</li>
                        </ul>
                      </div>
                      
                      <div className="bg-white rounded-xl p-6 shadow-sm border border-purple-200">
                        <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-4">
                          <i className="fas fa-lock text-purple-600 text-xl"></i>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-3">Better Security</h3>
                        <ul className="text-sm text-gray-700 space-y-2">
                          <li>• Control information exposure</li>
                          <li>• Separate sensitive content</li>
                          <li>• Granular access control</li>
                          <li>• Privacy protection</li>
                        </ul>
                      </div>
                    </div>

                    <div className="bg-gradient-to-r from-emerald-100 to-teal-100 rounded-lg p-6">
                      <h3 className="text-xl font-semibold text-gray-900 mb-4">💡 Pro Tip for Maximum Efficiency</h3>
                      <p className="text-gray-700">
                        Combine PDF splitting with our other tools for a complete document management solution. After splitting, use our <a href="/tools/merge-pdf" className="text-emerald-600 hover:text-emerald-700 font-medium">PDF merger</a> to recombine specific sections, or apply <a href="/tools/watermark-pdf" className="text-emerald-600 hover:text-emerald-700 font-medium">watermarks</a> to protect your split documents.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Audience-Specific Use Cases */}
                <div className="bg-white rounded-2xl shadow-lg p-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-6">PDF Splitting for Every Professional Need</h2>
                  <p className="text-gray-600 mb-8 text-lg">
                    Discover how different professionals leverage PDF splitting to streamline their workflows and boost productivity.
                  </p>
                  
                  <div className="space-y-8">
                    {/* Students & Educators */}
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6">
                      <div className="flex items-center mb-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mr-4">
                          <i className="fas fa-graduation-cap text-blue-600 text-xl"></i>
                        </div>
                        <h3 className="text-2xl font-semibold text-gray-900">Students & Educators</h3>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h4 className="font-medium text-gray-900 mb-3">Academic Applications:</h4>
                          <ul className="space-y-2 text-gray-700 text-sm">
                            <li>• Extract specific chapters from textbooks for focused study sessions</li>
                            <li>• Separate research paper sections for peer review and collaboration</li>
                            <li>• Create individual handouts from comprehensive course materials</li>
                            <li>• Split thesis documents into chapters for easier review and editing</li>
                            <li>• Extract practice problems from solution manuals</li>
                          </ul>
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900 mb-3">Study Optimization:</h4>
                          <ul className="space-y-2 text-gray-700 text-sm">
                            <li>• Create portable study materials for mobile learning</li>
                            <li>• Organize exam preparation materials by subject</li>
                            <li>• Share relevant readings without entire textbooks</li>
                            <li>• Extract reference sections for citation purposes</li>
                            <li>• Create smaller files for better device performance</li>
                          </ul>
                        </div>
                      </div>
                      <div className="mt-4 p-3 bg-blue-100 rounded-lg">
                        <p className="text-sm text-blue-800">
                          <strong>Pro Tip:</strong> Combine with our <a href="/tools/add-page-numbers" className="text-blue-600 hover:text-blue-700 underline">page numbering tool</a> to maintain organization across split academic documents.
                        </p>
                      </div>
                    </div>

                    {/* Business Professionals */}
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6">
                      <div className="flex items-center mb-4">
                        <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mr-4">
                          <i className="fas fa-briefcase text-green-600 text-xl"></i>
                        </div>
                        <h3 className="text-2xl font-semibold text-gray-900">Business Professionals</h3>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h4 className="font-medium text-gray-900 mb-3">Document Management:</h4>
                          <ul className="space-y-2 text-gray-700 text-sm">
                            <li>• Extract executive summaries from comprehensive reports</li>
                            <li>• Separate financial statements by quarter or department</li>
                            <li>• Split proposals to share relevant sections with stakeholders</li>
                            <li>• Extract individual contracts from bundled agreements</li>
                            <li>• Create department-specific documentation from company manuals</li>
                          </ul>
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900 mb-3">Client Communication:</h4>
                          <ul className="space-y-2 text-gray-700 text-sm">
                            <li>• Share only relevant proposal sections with clients</li>
                            <li>• Extract case studies for marketing presentations</li>
                            <li>• Create client-specific reports from master documents</li>
                            <li>• Separate invoices from batch billing statements</li>
                            <li>• Extract product catalogs from comprehensive brochures</li>
                          </ul>
                        </div>
                      </div>
                      <div className="mt-4 p-3 bg-green-100 rounded-lg">
                        <p className="text-sm text-green-800">
                          <strong>Business Integration:</strong> Use with our <a href="/tools/watermark-pdf" className="text-green-600 hover:text-green-700 underline">watermarking tool</a> to brand split documents and <a href="/tools/protect-pdf" className="text-green-600 hover:text-green-700 underline">password protection</a> for sensitive business information.
                        </p>
                      </div>
                    </div>

                    {/* Legal & Healthcare */}
                    <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6">
                      <div className="flex items-center mb-4">
                        <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mr-4">
                          <i className="fas fa-balance-scale text-purple-600 text-xl"></i>
                        </div>
                        <h3 className="text-2xl font-semibold text-gray-900">Legal & Healthcare Professionals</h3>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h4 className="font-medium text-gray-900 mb-3">Legal Applications:</h4>
                          <ul className="space-y-2 text-gray-700 text-sm">
                            <li>• Extract evidence pages for case preparation</li>
                            <li>• Separate contracts from bundled legal documents</li>
                            <li>• Create exhibit documents from comprehensive case files</li>
                            <li>• Split discovery materials by relevance and privilege</li>
                            <li>• Extract witness statements from full depositions</li>
                          </ul>
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900 mb-3">Healthcare Documentation:</h4>
                          <ul className="space-y-2 text-gray-700 text-sm">
                            <li>• Extract specific test results from patient files</li>
                            <li>• Separate insurance claims documentation</li>
                            <li>• Create specialized reports from comprehensive medical records</li>
                            <li>• Split research data for statistical analysis</li>
                            <li>• Extract consent forms from patient documentation</li>
                          </ul>
                        </div>
                      </div>
                      <div className="mt-4 p-3 bg-purple-100 rounded-lg">
                        <p className="text-sm text-purple-800">
                          <strong>Compliance Note:</strong> Ensure HIPAA and confidentiality compliance when splitting sensitive documents. Our client-side processing ensures data never leaves your device.
                        </p>
                      </div>
                    </div>

                    {/* Researchers & Analysts */}
                    <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-xl p-6">
                      <div className="flex items-center mb-4">
                        <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mr-4">
                          <i className="fas fa-microscope text-orange-600 text-xl"></i>
                        </div>
                        <h3 className="text-2xl font-semibold text-gray-900">Researchers & Data Analysts</h3>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h4 className="font-medium text-gray-900 mb-3">Research Applications:</h4>
                          <ul className="space-y-2 text-gray-700 text-sm">
                            <li>• Extract methodology sections for literature reviews</li>
                            <li>• Separate data tables from comprehensive research reports</li>
                            <li>• Create focused abstracts from full research papers</li>
                            <li>• Split survey results by demographic or time period</li>
                            <li>• Extract citations and references for bibliography creation</li>
                          </ul>
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900 mb-3">Data Analysis:</h4>
                          <ul className="space-y-2 text-gray-700 text-sm">
                            <li>• Separate statistical outputs by analysis type</li>
                            <li>• Extract charts and graphs for presentation purposes</li>
                            <li>• Create dataset-specific documentation</li>
                            <li>• Split longitudinal studies by time periods</li>
                            <li>• Extract appendices for detailed data review</li>
                          </ul>
                        </div>
                      </div>
                      <div className="mt-4 p-3 bg-orange-100 rounded-lg">
                        <p className="text-sm text-orange-800">
                          <strong>Research Workflow:</strong> Enhance your research process by combining split documents with our <a href="/tools/merge-pdf" className="text-orange-600 hover:text-orange-700 underline">merge tool</a> to create comprehensive literature compilations.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Professional Use Cases */}
                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl shadow-lg p-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-6">Professional Use Cases for PDF Splitting</h2>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-4">🏢 Business Applications</h3>
                      <ul className="space-y-3 text-gray-700">
                        <li className="flex items-start">
                          <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                          <span><strong>Financial Reports:</strong> Extract quarterly summaries from annual reports for stakeholder presentations</span>
                        </li>
                        <li className="flex items-start">
                          <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                          <span><strong>Contract Management:</strong> Separate individual contracts from bundled legal documents</span>
                        </li>
                        <li className="flex items-start">
                          <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                          <span><strong>Invoice Processing:</strong> Extract individual invoices from batch-processed financial statements</span>
                        </li>
                        <li className="flex items-start">
                          <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                          <span><strong>Proposal Sections:</strong> Share relevant proposal sections with different departments</span>
                        </li>
                      </ul>
                    </div>
                    
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-4">🎓 Educational Applications</h3>
                      <ul className="space-y-3 text-gray-700">
                        <li className="flex items-start">
                          <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                          <span><strong>Textbook Chapters:</strong> Create individual study materials from comprehensive textbooks</span>
                        </li>
                        <li className="flex items-start">
                          <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                          <span><strong>Research Papers:</strong> Extract methodology sections for academic references</span>
                        </li>
                        <li className="flex items-start">
                          <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                          <span><strong>Exam Preparation:</strong> Split practice tests into subject-specific sections</span>
                        </li>
                        <li className="flex items-start">
                          <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                          <span><strong>Course Materials:</strong> Distribute specific lessons from comprehensive course guides</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                  
                  <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-4">⚖️ Legal Applications</h3>
                      <ul className="space-y-3 text-gray-700">
                        <li className="flex items-start">
                          <span className="w-2 h-2 bg-purple-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                          <span><strong>Case Documentation:</strong> Extract evidence pages from comprehensive legal files</span>
                        </li>
                        <li className="flex items-start">
                          <span className="w-2 h-2 bg-purple-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                          <span><strong>Client Records:</strong> Separate individual client documents from batch files</span>
                        </li>
                        <li className="flex items-start">
                          <span className="w-2 h-2 bg-purple-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                          <span><strong>Discovery Process:</strong> Organize evidence by relevance and case sections</span>
                        </li>
                      </ul>
                    </div>
                    
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-4">🏥 Healthcare Applications</h3>
                      <ul className="space-y-3 text-gray-700">
                        <li className="flex items-start">
                          <span className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                          <span><strong>Medical Records:</strong> Extract specific test results from comprehensive patient files</span>
                        </li>
                        <li className="flex items-start">
                          <span className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                          <span><strong>Research Studies:</strong> Separate patient data for specialized analysis</span>
                        </li>
                        <li className="flex items-start">
                          <span className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                          <span><strong>Insurance Claims:</strong> Extract relevant documentation for claim processing</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Features */}
                <div className="bg-white rounded-2xl shadow-lg p-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-6">Advanced PDF Splitting Features</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
                      <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-4">
                        <i className="fas fa-file-alt text-purple-600 text-xl"></i>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Individual Page Extraction</h3>
                      <p className="text-gray-600 text-sm">
                        Extract each page as a separate PDF file with automatic naming. Perfect for creating individual documents from multi-page files.
                      </p>
                    </div>
                    
                    <div className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
                      <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
                        <i className="fas fa-layer-group text-blue-600 text-xl"></i>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Custom Page Ranges</h3>
                      <p className="text-gray-600 text-sm">
                        Define specific page ranges with custom names. Create chapters, sections, or any logical groupings that suit your needs.
                      </p>
                    </div>
                    
                    <div className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
                      <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-4">
                        <i className="fas fa-shield-alt text-green-600 text-xl"></i>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Secure Processing</h3>
                      <p className="text-gray-600 text-sm">
                        All PDF splitting happens locally in your browser. Your files never leave your device, ensuring complete privacy and security.
                      </p>
                    </div>
                    
                    <div className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
                      <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mb-4">
                        <i className="fas fa-download text-orange-600 text-xl"></i>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Batch Download</h3>
                      <p className="text-gray-600 text-sm">
                        Download all split files at once or select individual files. Streamlined process for handling multiple extracted documents.
                      </p>
                    </div>
                    
                    <div className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
                      <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center mb-4">
                        <i className="fas fa-bolt text-red-600 text-xl"></i>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Fast Processing</h3>
                      <p className="text-gray-600 text-sm">
                        Quick and efficient PDF splitting powered by modern web technologies. Process large documents in seconds without quality loss.
                      </p>
                    </div>
                    
                    <div className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
                      <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center mb-4">
                        <i className="fas fa-mobile-alt text-indigo-600 text-xl"></i>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Mobile Friendly</h3>
                      <p className="text-gray-600 text-sm">
                        Works perfectly on all devices including smartphones and tablets. Split PDFs anywhere with responsive design and touch support.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Common Use Cases */}
                <div className="bg-white rounded-2xl shadow-lg p-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-6">Common PDF Splitting Scenarios</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6">
                      <div className="w-12 h-12 bg-purple-200 rounded-xl flex items-center justify-center mb-4">
                        <i className="fas fa-book text-purple-700 text-xl"></i>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">📄 Extract Book Chapters</h3>
                      <p className="text-gray-600 text-sm">
                        Split ebooks, manuals, and guides into individual chapters for easier reading and reference. Perfect for study materials and research.
                      </p>
                    </div>
                    
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6">
                      <div className="w-12 h-12 bg-blue-200 rounded-xl flex items-center justify-center mb-4">
                        <i className="fas fa-chart-bar text-blue-700 text-xl"></i>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">📊 Separate Report Sections</h3>
                      <p className="text-gray-600 text-sm">
                        Extract specific sections from large business reports, financial statements, and analytical documents for targeted sharing.
                      </p>
                    </div>
                    
                    <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6">
                      <div className="w-12 h-12 bg-green-200 rounded-xl flex items-center justify-center mb-4">
                        <i className="fas fa-share-alt text-green-700 text-xl"></i>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">📋 Share Specific Pages</h3>
                      <p className="text-gray-600 text-sm">
                        Share only relevant pages from contracts, presentations, or documentation without exposing unnecessary information.
                      </p>
                    </div>
                    
                    <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-6">
                      <div className="w-12 h-12 bg-orange-200 rounded-xl flex items-center justify-center mb-4">
                        <i className="fas fa-graduation-cap text-orange-700 text-xl"></i>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">🎓 Study Material Organization</h3>
                      <p className="text-gray-600 text-sm">
                        Split textbooks and academic materials into manageable study sections. Create focused materials for exam preparation.
                      </p>
                    </div>
                    
                    <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-6">
                      <div className="w-12 h-12 bg-red-200 rounded-xl flex items-center justify-center mb-4">
                        <i className="fas fa-briefcase text-red-700 text-xl"></i>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">💼 Business Document Management</h3>
                      <p className="text-gray-600 text-sm">
                        Extract invoices, contracts, and forms from bundled business documents for organized filing and processing.
                      </p>
                    </div>
                    
                    <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6">
                      <div className="w-12 h-12 bg-gray-200 rounded-xl flex items-center justify-center mb-4">
                        <i className="fas fa-mobile-alt text-gray-700 text-xl"></i>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">📱 Mobile Optimization</h3>
                      <p className="text-gray-600 text-sm">
                        Create smaller files that load faster on mobile devices and consume less bandwidth for improved user experience.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Tips and Best Practices */}
                <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl shadow-lg p-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-6">Tips for Effective PDF Splitting</h2>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-4">🎯 Planning Your Split</h3>
                      <ul className="space-y-3 text-gray-700">
                        <li className="flex items-start">
                          <span className="w-2 h-2 bg-indigo-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                          <span>Review the document structure before splitting to identify logical breakpoints</span>
                        </li>
                        <li className="flex items-start">
                          <span className="w-2 h-2 bg-indigo-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                          <span>Use descriptive names for custom ranges to improve file organization</span>
                        </li>
                        <li className="flex items-start">
                          <span className="w-2 h-2 bg-indigo-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                          <span>Consider your audience when deciding which pages to extract</span>
                        </li>
                      </ul>
                    </div>
                    
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-4">📁 File Management</h3>
                      <ul className="space-y-3 text-gray-700">
                        <li className="flex items-start">
                          <span className="w-2 h-2 bg-purple-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                          <span>Create folders to organize split files by topic or purpose</span>
                        </li>
                        <li className="flex items-start">
                          <span className="w-2 h-2 bg-purple-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                          <span>Use consistent naming conventions for easier file identification</span>
                        </li>
                        <li className="flex items-start">
                          <span className="w-2 h-2 bg-purple-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                          <span>Keep a backup of the original document before splitting</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* FAQ Section */}
                <div className="bg-white rounded-2xl shadow-lg p-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-6">Frequently Asked Questions</h2>
                  <div className="space-y-6">
                    <div className="border-l-4 border-purple-500 pl-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Is it safe to upload my PDF files?</h3>
                      <p className="text-gray-600">
                        Yes, completely safe. Our PDF splitter processes files entirely in your browser using client-side technology. Your files never leave your device or get uploaded to any server, ensuring complete privacy and security.
                      </p>
                    </div>
                    
                    <div className="border-l-4 border-blue-500 pl-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">What's the maximum file size I can split?</h3>
                      <p className="text-gray-600">
                        The tool can handle large PDF files, but performance depends on your device's memory and processing power. For optimal performance, we recommend files under 50MB, though larger files may work depending on your system capabilities.
                      </p>
                    </div>
                    
                    <div className="border-l-4 border-green-500 pl-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Will the quality of split PDFs be affected?</h3>
                      <p className="text-gray-600">
                        No, splitting preserves the original quality completely. The tool creates exact copies of the selected pages without any compression or quality loss, maintaining all text, images, and formatting.
                      </p>
                    </div>
                    
                    <div className="border-l-4 border-orange-500 pl-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Can I split password-protected PDFs?</h3>
                      <p className="text-gray-600">
                        You'll need to remove the password protection first using our PDF unlock tool. Once unlocked, you can split the PDF normally. This ensures security while allowing necessary document processing.
                      </p>
                    </div>
                    
                    <div className="border-l-4 border-red-500 pl-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">How many files can I create from one PDF?</h3>
                      <p className="text-gray-600">
                        There's no limit to the number of files you can create. You can split into individual pages (one file per page) or create as many custom ranges as needed. The tool handles both small and large splitting operations efficiently.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Complete PDF Workflow */}
                <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-2xl shadow-lg p-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-6">Complete PDF Management Workflow</h2>
                  <p className="text-gray-600 mb-8 text-lg">
                    Transform your document management with our comprehensive PDF toolkit. Combine splitting with other powerful tools for professional-grade document processing.
                  </p>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                    {/* Before Splitting */}
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-blue-200">
                      <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                        <i className="fas fa-arrow-right text-blue-600 mr-3"></i>
                        Prepare Before Splitting
                      </h3>
                      <div className="space-y-4">
                        <div className="flex items-start">
                          <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mr-3 mt-1">
                            <i className="fas fa-sort text-purple-600 text-sm"></i>
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900">Organize Pages</h4>
                            <p className="text-sm text-gray-600">Reorder pages before splitting with our <a href="/tools/organize-pdf" className="text-purple-600 hover:text-purple-700 font-medium">page organizer</a></p>
                          </div>
                        </div>
                        
                        <div className="flex items-start">
                          <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center mr-3 mt-1">
                            <i className="fas fa-undo text-orange-600 text-sm"></i>
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900">Correct Orientation</h4>
                            <p className="text-sm text-gray-600">Fix page rotation with our <a href="/tools/rotate-pdf" className="text-orange-600 hover:text-orange-700 font-medium">PDF rotator</a></p>
                          </div>
                        </div>
                        
                        <div className="flex items-start">
                          <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center mr-3 mt-1">
                            <i className="fas fa-unlock text-red-600 text-sm"></i>
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900">Remove Protection</h4>
                            <p className="text-sm text-gray-600">Unlock password-protected files with our <a href="/tools/unlock-pdf" className="text-red-600 hover:text-red-700 font-medium">PDF unlocker</a></p>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* After Splitting */}
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-green-200">
                      <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                        <i className="fas fa-arrow-left text-green-600 mr-3"></i>
                        Enhance After Splitting
                      </h3>
                      <div className="space-y-4">
                        <div className="flex items-start">
                          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3 mt-1">
                            <i className="fas fa-object-group text-blue-600 text-sm"></i>
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900">Merge Selected Files</h4>
                            <p className="text-sm text-gray-600">Recombine specific splits with our <a href="/tools/merge-pdf" className="text-blue-600 hover:text-blue-700 font-medium">PDF merger</a></p>
                          </div>
                        </div>
                        
                        <div className="flex items-start">
                          <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center mr-3 mt-1">
                            <i className="fas fa-tint text-indigo-600 text-sm"></i>
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900">Add Watermarks</h4>
                            <p className="text-sm text-gray-600">Brand your split documents with our <a href="/tools/watermark-pdf" className="text-indigo-600 hover:text-indigo-700 font-medium">watermarking tool</a></p>
                          </div>
                        </div>
                        
                        <div className="flex items-start">
                          <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mr-3 mt-1">
                            <i className="fas fa-lock text-green-600 text-sm"></i>
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900">Protect Documents</h4>
                            <p className="text-sm text-gray-600">Secure split files with our <a href="/tools/protect-pdf" className="text-green-600 hover:text-green-700 font-medium">password protector</a></p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Additional Tools Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white rounded-lg p-4 hover:shadow-md transition-shadow border border-gray-200">
                      <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mb-3">
                        <i className="fas fa-list-ol text-purple-600"></i>
                      </div>
                      <h4 className="font-medium text-gray-900 mb-1">Page Numbers</h4>
                      <p className="text-xs text-gray-600 mb-2">Add numbering to split files</p>
                      <a href="/tools/add-page-numbers" className="text-purple-600 hover:text-purple-700 text-xs font-medium">
                        Try Tool →
                      </a>
                    </div>
                    
                    <div className="bg-white rounded-lg p-4 hover:shadow-md transition-shadow border border-gray-200">
                      <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center mb-3">
                        <i className="fas fa-compress-alt text-emerald-600"></i>
                      </div>
                      <h4 className="font-medium text-gray-900 mb-1">Compress PDF</h4>
                      <p className="text-xs text-gray-600 mb-2">Reduce file sizes efficiently</p>
                      <a href="/tools/pdf-compressor-advanced" className="text-emerald-600 hover:text-emerald-700 text-xs font-medium">
                        Try Tool →
                      </a>
                    </div>
                    
                    <div className="bg-white rounded-lg p-4 hover:shadow-md transition-shadow border border-gray-200">
                      <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center mb-3">
                        <i className="fas fa-file-export text-yellow-600"></i>
                      </div>
                      <h4 className="font-medium text-gray-900 mb-1">Extract Pages</h4>
                      <p className="text-xs text-gray-600 mb-2">Advanced page extraction</p>
                      <a href="/tools/extract-pdf-pages" className="text-yellow-600 hover:text-yellow-700 text-xs font-medium">
                        Try Tool →
                      </a>
                    </div>
                    
                    <div className="bg-white rounded-lg p-4 hover:shadow-md transition-shadow border border-gray-200">
                      <div className="w-10 h-10 bg-rose-100 rounded-lg flex items-center justify-center mb-3">
                        <i className="fas fa-images text-rose-600"></i>
                      </div>
                      <h4 className="font-medium text-gray-900 mb-1">PDF to Images</h4>
                      <p className="text-xs text-gray-600 mb-2">Convert pages to images</p>
                      <a href="/tools/pdf-to-images-enhanced" className="text-rose-600 hover:text-rose-700 text-xs font-medium">
                        Try Tool →
                      </a>
                    </div>
                  </div>
                  
                  <div className="mt-6 bg-gradient-to-r from-blue-100 to-purple-100 rounded-lg p-4">
                    <p className="text-center text-gray-700">
                      <strong>Explore All PDF Tools:</strong> Visit our complete <a href="/tools/pdf-tools" className="text-blue-600 hover:text-blue-700 font-medium">PDF tools collection</a> for advanced document management capabilities.
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

export default SplitPDFTool;