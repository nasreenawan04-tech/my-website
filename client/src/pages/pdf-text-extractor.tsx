import { useState, useRef, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import * as pdfjsLib from 'pdfjs-dist';
import { Upload, FileText, Download, RotateCcw, Copy, Check, Search, Hash } from 'lucide-react';

// Configure PDF.js for better compatibility in Replit environment
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.js`;

interface ExtractedText {
  fullText: string;
  pageTexts: { pageNumber: number; text: string; wordCount: number }[];
  totalWords: number;
  totalCharacters: number;
  totalCharactersNoSpaces: number;
}

interface ExtractionOptions {
  pageRange: 'all' | 'specific' | 'range';
  specificPages: string;
  startPage: string;
  endPage: string;
  includePageNumbers: boolean;
}

const PDFTextExtractor = () => {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [extractedText, setExtractedText] = useState<ExtractedText | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [copied, setCopied] = useState(false);
  const [totalPages, setTotalPages] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [highlightedText, setHighlightedText] = useState('');
  const [workerReady, setWorkerReady] = useState(false);
  const [workerAttempts, setWorkerAttempts] = useState(0);
  const [options, setOptions] = useState<ExtractionOptions>({
    pageRange: 'all',
    specificPages: '',
    startPage: '',
    endPage: '',
    includePageNumbers: true
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Initialize PDF.js for synchronous processing
  useEffect(() => {
    // Set up PDF.js for main thread processing (no worker)
    setWorkerReady(true);
    console.log('PDF.js initialized for synchronous processing');
  }, []);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const highlightSearchTerm = (text: string, searchTerm: string): string => {
    if (!searchTerm.trim()) return text;
    const regex = new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    return text.replace(regex, '<mark class="bg-yellow-200 px-1 rounded">$1</mark>');
  };

  const countWords = (text: string): number => {
    return text.trim().split(/\s+/).filter(word => word.length > 0).length;
  };

  const parsePageNumbers = (pageStr: string, maxPages: number): number[] => {
    const pages: number[] = [];
    const ranges = pageStr.split(',').map(s => s.trim());
    
    for (const range of ranges) {
      if (range.includes('-')) {
        const [start, end] = range.split('-').map(s => parseInt(s.trim()));
        if (!isNaN(start) && !isNaN(end) && start >= 1 && end <= maxPages && start <= end) {
          for (let i = start; i <= end; i++) {
            if (!pages.includes(i)) pages.push(i);
          }
        }
      } else {
        const pageNum = parseInt(range);
        if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= maxPages && !pages.includes(pageNum)) {
          pages.push(pageNum);
        }
      }
    }
    
    return pages.sort((a, b) => a - b);
  };

  const getPageNumbers = (): number[] => {
    switch (options.pageRange) {
      case 'all':
        return Array.from({ length: totalPages }, (_, i) => i + 1);
      case 'specific':
        return parsePageNumbers(options.specificPages, totalPages);
      case 'range':
        const start = parseInt(options.startPage) || 1;
        const end = parseInt(options.endPage) || totalPages;
        if (start >= 1 && end <= totalPages && start <= end) {
          return Array.from({ length: end - start + 1 }, (_, i) => start + i);
        }
        return [];
      default:
        return [];
    }
  };

  const getPageNumbersForExtraction = (pdfTotalPages: number): number[] => {
    switch (options.pageRange) {
      case 'all':
        return Array.from({ length: pdfTotalPages }, (_, i) => i + 1);
      case 'specific':
        return parsePageNumbers(options.specificPages, pdfTotalPages);
      case 'range':
        const start = parseInt(options.startPage) || 1;
        const end = parseInt(options.endPage) || pdfTotalPages;
        if (start >= 1 && end <= pdfTotalPages && start <= end) {
          return Array.from({ length: end - start + 1 }, (_, i) => start + i);
        }
        return [];
      default:
        return [];
    }
  };

  const extractTextFromPDF = async (file: File): Promise<ExtractedText> => {
    const arrayBuffer = await file.arrayBuffer();
    
    // Minimal PDF.js configuration for text extraction
    console.log('Extracting text from PDF:', file.name, 'Size:', arrayBuffer.byteLength, 'bytes');
    
    const loadingTask = pdfjsLib.getDocument({ 
      data: arrayBuffer,
      verbosity: 0,
      disableAutoFetch: false,
      disableStream: false,
      disableRange: false,
      cMapUrl: `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/cmaps/`,
      cMapPacked: true,
      standardFontDataUrl: `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/standard_fonts/`
    });
    
    const pdf = await loadingTask.promise;
    
    // Set total pages first, then get page numbers to extract
    const pdfTotalPages = pdf.numPages;
    setTotalPages(pdfTotalPages);
    
    // Get pages to extract based on current options and actual PDF page count
    const pagesToExtract = getPageNumbersForExtraction(pdfTotalPages);
    
    const pageTexts: { pageNumber: number; text: string; wordCount: number }[] = [];
    let fullText = '';

    for (const pageNum of pagesToExtract) {
      if (pageNum <= pdf.numPages) {
        const page = await pdf.getPage(pageNum);
        const textContent = await page.getTextContent();
        
        let pageText = textContent.items
          .map((item: any) => {
            if (typeof item.str === 'string') {
              return item.str;
            }
            return '';
          })
          .join(' ')
          .replace(/\s+/g, ' ')
          .trim();

        if (options.includePageNumbers && pageTexts.length > 0) {
          pageText = `\n\n--- Page ${pageNum} ---\n\n${pageText}`;
        } else if (options.includePageNumbers) {
          pageText = `--- Page ${pageNum} ---\n\n${pageText}`;
        }

        const wordCount = countWords(pageText);
        pageTexts.push({ pageNumber: pageNum, text: pageText, wordCount });
        fullText += pageText;
      }
    }

    const totalWords = countWords(fullText);
    const totalCharacters = fullText.length;
    const totalCharactersNoSpaces = fullText.replace(/\s/g, '').length;

    return {
      fullText,
      pageTexts,
      totalWords,
      totalCharacters,
      totalCharactersNoSpaces
    };
  };

  const handleFileSelect = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const file = files[0];
    
    // Enhanced file validation
    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      alert('Please select a valid PDF file.');
      return;
    }
    
    // Check file size (limit to 100MB)
    const maxSize = 100 * 1024 * 1024; // 100MB
    if (file.size > maxSize) {
      alert('File size too large. Please select a PDF file smaller than 100MB.');
      return;
    }
    
    if (file.size === 0) {
      alert('The selected file appears to be empty. Please choose a valid PDF file.');
      return;
    }

    setPdfFile(file);
    setExtractedText(null);
    setSearchTerm('');
    setHighlightedText('');

    // Get total pages for validation
    try {
      const arrayBuffer = await file.arrayBuffer();
      
      // Minimal PDF loading configuration
      console.log('Loading PDF file:', file.name, 'Size:', arrayBuffer.byteLength, 'bytes');
      
      const loadingTask = pdfjsLib.getDocument({ 
        data: arrayBuffer,
        verbosity: 0,
        disableAutoFetch: false,
        disableStream: false,
        disableRange: false,
        cMapUrl: `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/cmaps/`,
        cMapPacked: true,
        standardFontDataUrl: `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/standard_fonts/`
      });
      
      // Add timeout for PDF loading with more generous time for larger files
      const timeoutDuration = Math.max(30000, file.size / 1000); // At least 30s, or 1s per KB
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error(`PDF loading timeout after ${Math.round(timeoutDuration/1000)} seconds`)), timeoutDuration);
      });
      
      const pdf = await Promise.race([loadingTask.promise, timeoutPromise]) as any;
      
      const numPages = pdf.numPages;
      setTotalPages(numPages);
      
      if (numPages === 0) {
        alert('This PDF appears to have no pages. Please select a valid PDF file.');
        setPdfFile(null);
        setTotalPages(0);
        return;
      }
      
    } catch (error) {
      console.error('Error loading PDF:', error);
      console.error('Error type:', typeof error);
      console.error('Error details:', {
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : 'No stack',
        name: error instanceof Error ? error.name : 'Unknown',
        constructor: error?.constructor?.name
      });
      
      let errorMessage = 'Unable to process this PDF file.';
      
      if (error instanceof Error) {
        const msg = error.message.toLowerCase();
        console.log('Processing error message:', msg);
        
        if (msg.includes('invalid') || msg.includes('format') || msg.includes('corrupted')) {
          errorMessage = 'This PDF file appears to be corrupted or in an unsupported format. Please try a different PDF file.';
        } else if (msg.includes('password') || msg.includes('encrypted')) {
          errorMessage = 'This PDF is password protected. Please unlock it first or use a different file.';
        } else if (msg.includes('timeout')) {
          errorMessage = 'PDF processing timed out. The file might be too large. Try a smaller PDF file.';
        } else if (msg.includes('worker') || msg.includes('loading') || msg.includes('task')) {
          errorMessage = 'PDF processing failed. This might be a complex PDF. Please try a simpler PDF file.';
        } else {
          errorMessage = `Cannot process this PDF: ${error.message}. Please try a different PDF file.`;
        }
      }
      
      alert(errorMessage);
      setPdfFile(null);
      setTotalPages(0);
    }
  };

  const handleExtractText = async () => {
    if (!pdfFile) return;

    const pagesToExtract = getPageNumbers();
    if (pagesToExtract.length === 0) {
      alert('Please specify valid page numbers to extract.');
      return;
    }

    setIsProcessing(true);
    
    try {
      const result = await extractTextFromPDF(pdfFile);
      setExtractedText(result);
      setHighlightedText(result.fullText);
      
      if (result.totalWords === 0) {
        alert('No text found in the PDF. This might be a scanned document or image-based PDF. Try using an OCR tool instead.');
      }
    } catch (error) {
      console.error('Error extracting text:', error);
      let errorMessage = 'Error extracting text from PDF.';
      
      if (error instanceof Error) {
        if (error.message.includes('Invalid PDF')) {
          errorMessage = 'Invalid PDF file. Please ensure the file is not corrupted.';
        } else if (error.message.includes('encrypted') || error.message.includes('password')) {
          errorMessage = 'This PDF is password protected. Please unlock it first.';
        } else if (error.message.includes('network') || error.message.includes('fetch')) {
          errorMessage = 'Network error loading PDF.js. Please check your internet connection.';
        }
      }
      
      alert(errorMessage);
    }
    
    setIsProcessing(false);
  };

  const handleSearch = () => {
    if (!extractedText || !searchTerm.trim()) {
      setHighlightedText(extractedText?.fullText || '');
      return;
    }
    
    const highlighted = highlightSearchTerm(extractedText.fullText, searchTerm);
    setHighlightedText(highlighted);
  };

  const handleDownload = () => {
    if (!extractedText) return;

    const blob = new Blob([extractedText.fullText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${pdfFile?.name.replace('.pdf', '')}_extracted_text.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleCopy = async () => {
    if (!extractedText) return;

    try {
      await navigator.clipboard.writeText(extractedText.fullText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy text:', error);
      // Fallback for older browsers or when clipboard API fails
      const textArea = document.createElement('textarea');
      textArea.value = extractedText.fullText;
      textArea.style.position = 'fixed';
      textArea.style.opacity = '0';
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (fallbackError) {
        alert('Failed to copy text. Please manually select and copy the text.');
      }
      document.body.removeChild(textArea);
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

  const resetTool = () => {
    setPdfFile(null);
    setExtractedText(null);
    setTotalPages(0);
    setSearchTerm('');
    setHighlightedText('');
    setOptions({
      pageRange: 'all',
      specificPages: '',
      startPage: '',
      endPage: '',
      includePageNumbers: true
    });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Helmet>
        <title>PDF Text Extractor - Extract Text from PDF Documents | CalcEasy</title>
        <meta 
          name="description" 
          content="Free online PDF text extractor. Extract text from any PDF document, search through content, and download as text file. Supports page range selection and text statistics." 
        />
        <meta name="keywords" content="PDF text extractor, extract text from PDF, PDF to text, copy text from PDF, PDF text converter" />
      </Helmet>

      <Header />

      <main className="flex-1 bg-neutral-50">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-red-600 via-red-500 to-pink-600 text-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="w-16 h-16 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <FileText className="w-8 h-8" />
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold mb-4">
              PDF Text Extractor
            </h1>
            <p className="text-xl text-red-100 mb-8 max-w-3xl mx-auto">
              Extract all text content from PDF documents. Select specific pages, search through content, and download as a text file
            </p>
          </div>
        </section>

        {/* Tool Content */}
        <section className="py-16">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <Card className="shadow-xl">
              <CardHeader className="text-center pb-2">
                <CardTitle className="text-2xl font-bold text-neutral-800">
                  Extract Text from PDF
                </CardTitle>
                <p className="text-neutral-600 mt-2">
                  Upload a PDF file to extract and download its text content
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
                          <p className="text-sm text-neutral-500">
                            PDF Document • {formatFileSize(pdfFile.size)} • {totalPages} pages
                          </p>
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

                    {/* Extraction Options */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Extraction Options</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                          <div>
                            <Label htmlFor="pageRange">Page Range</Label>
                            <Select 
                              value={options.pageRange} 
                              onValueChange={(value: 'all' | 'specific' | 'range') => 
                                setOptions({...options, pageRange: value})
                              }
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="all">All Pages</SelectItem>
                                <SelectItem value="specific">Specific Pages</SelectItem>
                                <SelectItem value="range">Page Range</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          {options.pageRange === 'specific' && (
                            <div>
                              <Label htmlFor="specificPages">Specific Pages</Label>
                              <Input
                                id="specificPages"
                                placeholder="1,3,5-7,10"
                                value={options.specificPages}
                                onChange={(e) => setOptions({...options, specificPages: e.target.value})}
                                data-testid="input-specific-pages"
                              />
                            </div>
                          )}

                          {options.pageRange === 'range' && (
                            <>
                              <div>
                                <Label htmlFor="startPage">Start Page</Label>
                                <Input
                                  id="startPage"
                                  type="number"
                                  min="1"
                                  max={totalPages}
                                  placeholder="1"
                                  value={options.startPage}
                                  onChange={(e) => setOptions({...options, startPage: e.target.value})}
                                />
                              </div>
                              <div>
                                <Label htmlFor="endPage">End Page</Label>
                                <Input
                                  id="endPage"
                                  type="number"
                                  min="1"
                                  max={totalPages}
                                  placeholder={totalPages.toString()}
                                  value={options.endPage}
                                  onChange={(e) => setOptions({...options, endPage: e.target.value})}
                                />
                              </div>
                            </>
                          )}
                        </div>

                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id="includePageNumbers"
                            checked={options.includePageNumbers}
                            onChange={(e) => setOptions({...options, includePageNumbers: e.target.checked})}
                            className="rounded"
                          />
                          <Label htmlFor="includePageNumbers">Include page number headers</Label>
                        </div>

                        <Button 
                          onClick={handleExtractText}
                          disabled={isProcessing}
                          className="bg-red-600 hover:bg-red-700 text-white w-full md:w-auto"
                          data-testid="button-extract-text"
                        >
                          {isProcessing ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                              Extracting Text...
                            </>
                          ) : (
                            <>
                              <FileText className="w-4 h-4 mr-2" />
                              Extract Text
                            </>
                          )}
                        </Button>
                      </CardContent>
                    </Card>

                    {/* Extracted Text Display */}
                    {extractedText && (
                      <div className="space-y-6">
                        {/* Text Statistics */}
                        <Card>
                          <CardHeader>
                            <CardTitle className="flex items-center">
                              <Hash className="w-5 h-5 mr-2 text-green-500" />
                              Text Statistics
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                              <div className="bg-neutral-50 rounded-lg p-3">
                                <div className="text-2xl font-bold text-neutral-900">{extractedText.totalWords}</div>
                                <div className="text-sm text-neutral-600">Words</div>
                              </div>
                              <div className="bg-neutral-50 rounded-lg p-3">
                                <div className="text-2xl font-bold text-neutral-900">{extractedText.totalCharacters}</div>
                                <div className="text-sm text-neutral-600">Characters</div>
                              </div>
                              <div className="bg-neutral-50 rounded-lg p-3">
                                <div className="text-2xl font-bold text-neutral-900">{extractedText.totalCharactersNoSpaces}</div>
                                <div className="text-sm text-neutral-600">Characters (no spaces)</div>
                              </div>
                              <div className="bg-neutral-50 rounded-lg p-3">
                                <div className="text-2xl font-bold text-neutral-900">{extractedText.pageTexts.length}</div>
                                <div className="text-sm text-neutral-600">Pages Extracted</div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>

                        {/* Search and Actions */}
                        <Card>
                          <CardHeader>
                            <CardTitle>Extracted Text</CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            {/* Search Bar */}
                            <div className="flex space-x-2">
                              <div className="flex-1 relative">
                                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400" />
                                <Input
                                  placeholder="Search in extracted text..."
                                  value={searchTerm}
                                  onChange={(e) => setSearchTerm(e.target.value)}
                                  className="pl-10"
                                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                  data-testid="input-search-text"
                                />
                              </div>
                              <Button 
                                onClick={handleSearch} 
                                variant="outline"
                                data-testid="button-search-text"
                              >
                                Search
                              </Button>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex flex-wrap gap-2">
                              <Button 
                                onClick={handleCopy} 
                                variant="outline" 
                                className="flex items-center space-x-2"
                                data-testid="button-copy-text"
                              >
                                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                <span>{copied ? 'Copied!' : 'Copy Text'}</span>
                              </Button>
                              <Button 
                                onClick={handleDownload} 
                                className="bg-green-600 hover:bg-green-700 text-white flex items-center space-x-2"
                                data-testid="button-download-text"
                              >
                                <Download className="w-4 h-4" />
                                <span>Download as TXT</span>
                              </Button>
                            </div>

                            {/* Text Content */}
                            <div className="border rounded-lg p-4 bg-white max-h-96 overflow-y-auto">
                              <div 
                                className="whitespace-pre-wrap text-sm text-neutral-800 leading-relaxed"
                                dangerouslySetInnerHTML={{ __html: highlightedText }}
                              />
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
              <h2 className="text-2xl font-bold text-neutral-900 mb-8">Key Features</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <FileText className="w-6 h-6 text-red-600" />
                  </div>
                  <h3 className="font-semibold text-neutral-900 mb-2">Full Text Extraction</h3>
                  <p className="text-sm text-neutral-600">Extract all readable text from any PDF document</p>
                </div>
                
                <div className="text-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <Search className="w-6 h-6 text-blue-600" />
                  </div>
                  <h3 className="font-semibold text-neutral-900 mb-2">Text Search</h3>
                  <p className="text-sm text-neutral-600">Search and highlight specific terms in extracted text</p>
                </div>
                
                <div className="text-center">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <Download className="w-6 h-6 text-green-600" />
                  </div>
                  <h3 className="font-semibold text-neutral-900 mb-2">Download & Copy</h3>
                  <p className="text-sm text-neutral-600">Download as text file or copy to clipboard instantly</p>
                </div>
                
                <div className="text-center">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <Hash className="w-6 h-6 text-purple-600" />
                  </div>
                  <h3 className="font-semibold text-neutral-900 mb-2">Text Statistics</h3>
                  <p className="text-sm text-neutral-600">Get word count, character count, and detailed analytics</p>
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

export default PDFTextExtractor;