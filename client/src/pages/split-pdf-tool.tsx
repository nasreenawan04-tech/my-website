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
    
    if (!start || !end || start < 1 || end > totalPages || start > end) {
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

                {/* Features */}
                <div className="bg-white rounded-2xl shadow-lg p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Features</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex items-start">
                      <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mr-3 mt-1">
                        <i className="fas fa-check text-xs text-green-600"></i>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">Individual Pages</h3>
                        <p className="text-gray-600 text-sm">Extract each page as a separate PDF file.</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mr-3 mt-1">
                        <i className="fas fa-check text-xs text-green-600"></i>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">Custom Ranges</h3>
                        <p className="text-gray-600 text-sm">Define specific page ranges with custom names.</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mr-3 mt-1">
                        <i className="fas fa-check text-xs text-green-600"></i>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">Secure & Private</h3>
                        <p className="text-gray-600 text-sm">Files are processed locally in your browser.</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mr-3 mt-1">
                        <i className="fas fa-check text-xs text-green-600"></i>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">Batch Download</h3>
                        <p className="text-gray-600 text-sm">Download all split files at once or individually.</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Use Cases */}
                <div className="bg-white rounded-2xl shadow-lg p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Common Use Cases</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="bg-purple-50 rounded-lg p-4">
                      <h3 className="font-semibold text-gray-900 mb-2">📄 Extract Chapters</h3>
                      <p className="text-sm text-gray-600">Split ebooks or manuals into individual chapters.</p>
                    </div>
                    
                    <div className="bg-blue-50 rounded-lg p-4">
                      <h3 className="font-semibold text-gray-900 mb-2">📊 Separate Reports</h3>
                      <p className="text-sm text-gray-600">Extract specific sections from large reports.</p>
                    </div>
                    
                    <div className="bg-green-50 rounded-lg p-4">
                      <h3 className="font-semibold text-gray-900 mb-2">📋 Share Specific Pages</h3>
                      <p className="text-sm text-gray-600">Share only relevant pages from documents.</p>
                    </div>
                    
                    <div className="bg-orange-50 rounded-lg p-4">
                      <h3 className="font-semibold text-gray-900 mb-2">🎓 Study Materials</h3>
                      <p className="text-sm text-gray-600">Split textbooks into manageable study sections.</p>
                    </div>
                    
                    <div className="bg-red-50 rounded-lg p-4">
                      <h3 className="font-semibold text-gray-900 mb-2">💼 Business Documents</h3>
                      <p className="text-sm text-gray-600">Extract invoices or contracts from bundles.</p>
                    </div>
                    
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h3 className="font-semibold text-gray-900 mb-2">📱 Mobile Optimization</h3>
                      <p className="text-sm text-gray-600">Create smaller files for mobile viewing.</p>
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

export default SplitPDFTool;