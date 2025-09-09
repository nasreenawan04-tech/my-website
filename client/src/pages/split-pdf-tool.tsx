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

                {/* What is PDF Splitting */}
                <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-2xl shadow-lg p-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-6">What is PDF Splitting?</h2>
                  <div className="prose prose-lg text-gray-700 max-w-none">
                    <p className="mb-4">
                      PDF splitting is the process of dividing a single PDF document into multiple separate PDF files. This powerful feature allows you to extract specific pages, chapters, or sections from larger documents, making it easier to organize, share, and manage your content.
                    </p>
                    <p className="mb-4">
                      Our online PDF splitter tool provides two main splitting methods: <strong>individual page extraction</strong> where each page becomes a separate PDF file, and <strong>custom range splitting</strong> where you can define specific page ranges to create targeted document sections.
                    </p>
                    <p>
                      Whether you're working with academic papers, business reports, legal documents, or personal files, PDF splitting helps you create more focused and manageable documents while maintaining the original formatting and quality.
                    </p>
                  </div>
                </div>

                {/* Benefits of Splitting PDFs */}
                <div className="bg-white rounded-2xl shadow-lg p-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-6">Benefits of Splitting PDF Files</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-4">📈 Improved Organization</h3>
                      <p className="text-gray-600 mb-4">
                        Split large documents into logical sections for better file management. Organize academic papers by chapters, business reports by departments, or manuals by topics.
                      </p>
                      
                      <h3 className="text-xl font-semibold text-gray-900 mb-4">🚀 Faster Sharing</h3>
                      <p className="text-gray-600 mb-4">
                        Share only relevant pages instead of entire documents. Reduce email attachment sizes and improve download speeds for recipients.
                      </p>
                      
                      <h3 className="text-xl font-semibold text-gray-900 mb-4">🔒 Enhanced Security</h3>
                      <p className="text-gray-600">
                        Separate sensitive information by extracting only non-confidential pages. Maintain privacy by sharing specific sections without exposing the entire document.
                      </p>
                    </div>
                    
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-4">💾 Storage Optimization</h3>
                      <p className="text-gray-600 mb-4">
                        Reduce storage requirements by keeping only necessary pages. Archive important sections separately while discarding outdated or irrelevant content.
                      </p>
                      
                      <h3 className="text-xl font-semibold text-gray-900 mb-4">📱 Mobile-Friendly</h3>
                      <p className="text-gray-600 mb-4">
                        Create smaller files that load faster on mobile devices. Improve accessibility for users with limited bandwidth or storage space.
                      </p>
                      
                      <h3 className="text-xl font-semibold text-gray-900 mb-4">⚡ Processing Efficiency</h3>
                      <p className="text-gray-600">
                        Work with smaller, focused documents for faster editing, printing, and processing. Reduce application loading times and improve overall productivity.
                      </p>
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

                {/* Related Tools */}
                <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-2xl shadow-lg p-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-6">Related PDF Tools</h2>
                  <p className="text-gray-600 mb-8">
                    Enhance your PDF workflow with these complementary tools. Create a complete document management solution by combining multiple PDF utilities.
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="bg-white rounded-xl p-6 hover:shadow-md transition-shadow border border-gray-200">
                      <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
                        <i className="fas fa-object-group text-blue-600 text-xl"></i>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Merge PDF Files</h3>
                      <p className="text-gray-600 text-sm mb-4">
                        Combine multiple PDF files into a single document. Perfect for creating comprehensive reports from split sections.
                      </p>
                      <a href="/tools/merge-pdf" className="text-blue-600 hover:text-blue-700 font-medium text-sm">
                        Try PDF Merger →
                      </a>
                    </div>
                    
                    <div className="bg-white rounded-xl p-6 hover:shadow-md transition-shadow border border-gray-200">
                      <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-4">
                        <i className="fas fa-compress text-green-600 text-xl"></i>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Compress PDF</h3>
                      <p className="text-gray-600 text-sm mb-4">
                        Reduce file sizes of your split PDFs for easier sharing and storage while maintaining quality.
                      </p>
                      <a href="/tools/compress-pdf" className="text-green-600 hover:text-green-700 font-medium text-sm">
                        Try PDF Compressor →
                      </a>
                    </div>
                    
                    <div className="bg-white rounded-xl p-6 hover:shadow-md transition-shadow border border-gray-200">
                      <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-4">
                        <i className="fas fa-sort text-purple-600 text-xl"></i>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Organize PDF Pages</h3>
                      <p className="text-gray-600 text-sm mb-4">
                        Reorder and organize PDF pages before splitting to ensure optimal document structure.
                      </p>
                      <a href="/tools/organize-pdf" className="text-purple-600 hover:text-purple-700 font-medium text-sm">
                        Try Page Organizer →
                      </a>
                    </div>
                    
                    <div className="bg-white rounded-xl p-6 hover:shadow-md transition-shadow border border-gray-200">
                      <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mb-4">
                        <i className="fas fa-undo text-orange-600 text-xl"></i>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Rotate PDF Pages</h3>
                      <p className="text-gray-600 text-sm mb-4">
                        Correct page orientation before splitting to ensure all extracted pages have proper rotation.
                      </p>
                      <a href="/tools/rotate-pdf" className="text-orange-600 hover:text-orange-700 font-medium text-sm">
                        Try PDF Rotator →
                      </a>
                    </div>
                    
                    <div className="bg-white rounded-xl p-6 hover:shadow-md transition-shadow border border-gray-200">
                      <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center mb-4">
                        <i className="fas fa-list-ol text-red-600 text-xl"></i>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Add Page Numbers</h3>
                      <p className="text-gray-600 text-sm mb-4">
                        Add page numbers to your split PDF files for better organization and professional presentation.
                      </p>
                      <a href="/tools/add-page-numbers" className="text-red-600 hover:text-red-700 font-medium text-sm">
                        Try Page Numbering →
                      </a>
                    </div>
                    
                    <div className="bg-white rounded-xl p-6 hover:shadow-md transition-shadow border border-gray-200">
                      <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center mb-4">
                        <i className="fas fa-lock text-indigo-600 text-xl"></i>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Protect PDF</h3>
                      <p className="text-gray-600 text-sm mb-4">
                        Add password protection to your split PDF files to secure sensitive extracted content.
                      </p>
                      <a href="/tools/protect-pdf" className="text-indigo-600 hover:text-indigo-700 font-medium text-sm">
                        Try PDF Protection →
                      </a>
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