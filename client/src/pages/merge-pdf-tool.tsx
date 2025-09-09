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
                {/* What is PDF Merging */}
                <div className="bg-white rounded-2xl shadow-lg p-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-6">What is PDF Merging and How Does It Work?</h2>
                  <div className="prose max-w-none text-gray-700 space-y-6">
                    <p className="text-lg leading-relaxed">
                      PDF merging is the process of combining multiple Portable Document Format (PDF) files into a single document while preserving the original formatting, layout, and quality of each individual file. Our free online PDF merger tool uses advanced PDF processing technology to seamlessly join documents without requiring any software downloads or installations.
                    </p>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
                      <div className="bg-blue-50 rounded-xl p-6">
                        <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                          <i className="fas fa-cogs text-blue-600 mr-3"></i>
                          How PDF Merging Works
                        </h3>
                        <ul className="space-y-3 text-gray-700">
                          <li className="flex items-start">
                            <span className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold mr-3 mt-1">1</span>
                            <span><strong>Upload Process:</strong> Select and upload multiple PDF files from your device using our drag-and-drop interface</span>
                          </li>
                          <li className="flex items-start">
                            <span className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold mr-3 mt-1">2</span>
                            <span><strong>Document Analysis:</strong> Our tool analyzes each PDF structure, page count, and formatting properties</span>
                          </li>
                          <li className="flex items-start">
                            <span className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold mr-3 mt-1">3</span>
                            <span><strong>Order Arrangement:</strong> Arrange documents in your preferred sequence using intuitive controls</span>
                          </li>
                          <li className="flex items-start">
                            <span className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold mr-3 mt-1">4</span>
                            <span><strong>Merging Process:</strong> Advanced algorithms combine all pages while maintaining quality and formatting</span>
                          </li>
                          <li className="flex items-start">
                            <span className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold mr-3 mt-1">5</span>
                            <span><strong>Download:</strong> Receive your professionally merged PDF ready for immediate use</span>
                          </li>
                        </ul>
                      </div>
                      
                      <div className="bg-green-50 rounded-xl p-6">
                        <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                          <i className="fas fa-shield-alt text-green-600 mr-3"></i>
                          Security Features
                        </h3>
                        <ul className="space-y-3 text-gray-700">
                          <li className="flex items-start">
                            <i className="fas fa-check-circle text-green-600 mr-3 mt-1"></i>
                            <span><strong>Client-Side Processing:</strong> All merging happens locally in your browser for maximum security</span>
                          </li>
                          <li className="flex items-start">
                            <i className="fas fa-check-circle text-green-600 mr-3 mt-1"></i>
                            <span><strong>No File Storage:</strong> Your documents are never uploaded to external servers or stored online</span>
                          </li>
                          <li className="flex items-start">
                            <i className="fas fa-check-circle text-green-600 mr-3 mt-1"></i>
                            <span><strong>Privacy Protection:</strong> Complete confidentiality for sensitive business and personal documents</span>
                          </li>
                          <li className="flex items-start">
                            <i className="fas fa-check-circle text-green-600 mr-3 mt-1"></i>
                            <span><strong>Automatic Cleanup:</strong> Temporary files are automatically removed after processing</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Benefits by User Type */}
                <div className="bg-gradient-to-br from-indigo-50 to-purple-100 rounded-2xl shadow-lg p-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-6">PDF Merger Benefits for Every User Type</h2>
                  <p className="text-gray-700 mb-8 text-lg">
                    Our PDF merger tool serves diverse needs across different user groups, providing tailored solutions for students, professionals, businesses, and researchers. Discover how PDF combining can streamline your specific workflow.
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-indigo-200">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                        <i className="fas fa-graduation-cap text-blue-600 text-xl"></i>
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-3">Students & Academics</h3>
                      <p className="text-gray-600 mb-4">
                        Streamline academic work by combining research papers, assignments, and reference materials into organized study resources.
                      </p>
                      <ul className="text-sm text-gray-700 space-y-2">
                        <li>• Consolidate research papers and citations</li>
                        <li>• Create comprehensive assignment portfolios</li>
                        <li>• Merge lecture notes and study guides</li>
                        <li>• Combine thesis chapters and appendices</li>
                        <li>• Organize academic reference materials</li>
                      </ul>
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <p className="text-xs text-gray-500">
                          <strong>Pro Tip:</strong> Use our <a href="/tools/add-page-numbers" className="text-blue-600 hover:text-blue-700">page numbering tool</a> after merging for professional academic submissions.
                        </p>
                      </div>
                    </div>
                    
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-indigo-200">
                      <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                        <i className="fas fa-briefcase text-green-600 text-xl"></i>
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-3">Business Professionals</h3>
                      <p className="text-gray-600 mb-4">
                        Create professional document packages for presentations, proposals, and client communications.
                      </p>
                      <ul className="text-sm text-gray-700 space-y-2">
                        <li>• Merge contract documents and amendments</li>
                        <li>• Combine financial reports and analyses</li>
                        <li>• Create comprehensive proposal packages</li>
                        <li>• Consolidate meeting agendas and minutes</li>
                        <li>• Organize project documentation sets</li>
                      </ul>
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <p className="text-xs text-gray-500">
                          <strong>Pro Tip:</strong> Protect sensitive merged documents with our <a href="/tools/protect-pdf" className="text-green-600 hover:text-green-700">PDF password protection tool</a>.
                        </p>
                      </div>
                    </div>
                    
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-indigo-200">
                      <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                        <i className="fas fa-building text-purple-600 text-xl"></i>
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-3">Small Business Owners</h3>
                      <p className="text-gray-600 mb-4">
                        Simplify document management by combining invoices, contracts, and business records efficiently.
                      </p>
                      <ul className="text-sm text-gray-700 space-y-2">
                        <li>• Consolidate monthly financial statements</li>
                        <li>• Merge customer contracts and agreements</li>
                        <li>• Create comprehensive service packages</li>
                        <li>• Combine invoice batches for accounting</li>
                        <li>• Organize compliance documentation</li>
                      </ul>
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <p className="text-xs text-gray-500">
                          <strong>Pro Tip:</strong> Calculate business expenses with our <a href="/tools/business-loan-calculator" className="text-purple-600 hover:text-purple-700">business loan calculator</a> and <a href="/tools/tax-calculator" className="text-purple-600 hover:text-purple-700">tax calculator</a>.
                        </p>
                      </div>
                    </div>
                    
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-indigo-200">
                      <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                        <i className="fas fa-microscope text-red-600 text-xl"></i>
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-3">Researchers & Scientists</h3>
                      <p className="text-gray-600 mb-4">
                        Organize research findings, data sheets, and publication materials into comprehensive research packages.
                      </p>
                      <ul className="text-sm text-gray-700 space-y-2">
                        <li>• Combine research methodology documents</li>
                        <li>• Merge experimental data and results</li>
                        <li>• Create comprehensive literature reviews</li>
                        <li>• Consolidate grant application materials</li>
                        <li>• Organize publication submission packages</li>
                      </ul>
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <p className="text-xs text-gray-500">
                          <strong>Pro Tip:</strong> Use our <a href="/tools/word-counter" className="text-red-600 hover:text-red-700">word counter</a> to analyze merged research documents for publication requirements.
                        </p>
                      </div>
                    </div>
                    
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-indigo-200">
                      <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                        <i className="fas fa-balance-scale text-orange-600 text-xl"></i>
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-3">Legal Professionals</h3>
                      <p className="text-gray-600 mb-4">
                        Combine legal documents, case files, and evidence materials into organized legal packages for court submissions.
                      </p>
                      <ul className="text-sm text-gray-700 space-y-2">
                        <li>• Merge case documents and exhibits</li>
                        <li>• Combine contract drafts and revisions</li>
                        <li>• Create comprehensive legal briefs</li>
                        <li>• Consolidate discovery materials</li>
                        <li>• Organize client documentation packages</li>
                      </ul>
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <p className="text-xs text-gray-500">
                          <strong>Pro Tip:</strong> Secure sensitive legal documents using our <a href="/tools/pdf-redaction-tool" className="text-orange-600 hover:text-orange-700">PDF redaction tool</a> for confidential information.
                        </p>
                      </div>
                    </div>
                    
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-indigo-200">
                      <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center mb-4">
                        <i className="fas fa-user-md text-teal-600 text-xl"></i>
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-3">Healthcare Professionals</h3>
                      <p className="text-gray-600 mb-4">
                        Organize patient records, medical reports, and treatment documentation into comprehensive healthcare files.
                      </p>
                      <ul className="text-sm text-gray-700 space-y-2">
                        <li>• Consolidate patient medical histories</li>
                        <li>• Merge diagnostic reports and test results</li>
                        <li>• Create comprehensive treatment plans</li>
                        <li>• Combine insurance and billing documents</li>
                        <li>• Organize research and clinical trial data</li>
                      </ul>
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <p className="text-xs text-gray-500">
                          <strong>Pro Tip:</strong> Calculate health metrics with our <a href="/tools/bmi-calculator" className="text-teal-600 hover:text-teal-700">BMI calculator</a> and <a href="/tools/calorie-calculator" className="text-teal-600 hover:text-teal-700">calorie calculator</a> tools.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Practical Use Cases */}
                <div className="bg-white rounded-2xl shadow-lg p-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-6">Real-World PDF Merging Applications</h2>
                  <p className="text-gray-700 mb-8 text-lg">
                    Explore practical scenarios where PDF merging becomes essential for efficient document management and professional workflow optimization.
                  </p>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-4">📚 Educational Scenarios</h3>
                      <div className="space-y-4">
                        <div className="bg-blue-50 rounded-lg p-4">
                          <h4 className="font-semibold text-gray-900 mb-2">Assignment Compilation</h4>
                          <p className="text-gray-600 text-sm">
                            Combine multiple assignment parts, cover pages, and reference lists into a single submission file. Perfect for complex projects requiring multiple components.
                          </p>
                        </div>
                        
                        <div className="bg-blue-50 rounded-lg p-4">
                          <h4 className="font-semibold text-gray-900 mb-2">Research Paper Assembly</h4>
                          <p className="text-gray-600 text-sm">
                            Merge individual research chapters, appendices, and bibliography sections to create comprehensive academic papers ready for publication or submission.
                          </p>
                        </div>
                        
                        <div className="bg-blue-50 rounded-lg p-4">
                          <h4 className="font-semibold text-gray-900 mb-2">Study Material Organization</h4>
                          <p className="text-gray-600 text-sm">
                            Consolidate lecture slides, reading materials, and personal notes into organized study guides for efficient exam preparation and knowledge retention.
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-4">💼 Business Applications</h3>
                      <div className="space-y-4">
                        <div className="bg-green-50 rounded-lg p-4">
                          <h4 className="font-semibold text-gray-900 mb-2">Financial Report Compilation</h4>
                          <p className="text-gray-600 text-sm">
                            Merge quarterly reports, balance sheets, and profit-loss statements into comprehensive annual financial packages for stakeholders and regulatory compliance.
                          </p>
                        </div>
                        
                        <div className="bg-green-50 rounded-lg p-4">
                          <h4 className="font-semibold text-gray-900 mb-2">Proposal Package Creation</h4>
                          <p className="text-gray-600 text-sm">
                            Combine company profiles, service descriptions, pricing sheets, and testimonials into professional proposal packages that impress potential clients.
                          </p>
                        </div>
                        
                        <div className="bg-green-50 rounded-lg p-4">
                          <h4 className="font-semibold text-gray-900 mb-2">Contract Documentation</h4>
                          <p className="text-gray-600 text-sm">
                            Merge main contracts with amendments, addendums, and supporting documentation to create complete legal agreement packages for all parties involved.
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-4">🏥 Healthcare Documentation</h3>
                      <div className="space-y-4">
                        <div className="bg-red-50 rounded-lg p-4">
                          <h4 className="font-semibold text-gray-900 mb-2">Patient File Consolidation</h4>
                          <p className="text-gray-600 text-sm">
                            Combine medical histories, test results, imaging reports, and treatment plans into comprehensive patient records for improved care coordination.
                          </p>
                        </div>
                        
                        <div className="bg-red-50 rounded-lg p-4">
                          <h4 className="font-semibold text-gray-900 mb-2">Insurance Claim Packages</h4>
                          <p className="text-gray-600 text-sm">
                            Merge treatment documentation, billing statements, and supporting medical evidence into complete insurance claim submissions for faster processing.
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-4">🏠 Personal Document Management</h3>
                      <div className="space-y-4">
                        <div className="bg-purple-50 rounded-lg p-4">
                          <h4 className="font-semibold text-gray-900 mb-2">Home Purchase Documentation</h4>
                          <p className="text-gray-600 text-sm">
                            Combine inspection reports, appraisals, contracts, and loan documents into organized home buying packages for easy reference and record keeping.
                          </p>
                        </div>
                        
                        <div className="bg-purple-50 rounded-lg p-4">
                          <h4 className="font-semibold text-gray-900 mb-2">Tax Document Organization</h4>
                          <p className="text-gray-600 text-sm">
                            Merge W-2s, 1099s, receipts, and supporting documentation into complete tax filing packages for efficient preparation and future reference.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-100 rounded-xl border border-blue-200">
                    <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                      <i className="fas fa-lightbulb text-yellow-500 mr-3"></i>
                      Workflow Optimization Tips
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <ul className="space-y-2 text-sm text-gray-700">
                        <li>• <strong>Pre-organize files:</strong> Name documents clearly before merging for easier identification</li>
                        <li>• <strong>Check orientations:</strong> Use our <a href="/tools/rotate-pdf" className="text-blue-600 hover:text-blue-700">PDF rotation tool</a> to fix page orientations first</li>
                        <li>• <strong>Optimize file sizes:</strong> <a href="/tools/pdf-compressor-advanced" className="text-blue-600 hover:text-blue-700">Compress PDFs</a> before merging to reduce final file size</li>
                      </ul>
                      <ul className="space-y-2 text-sm text-gray-700">
                        <li>• <strong>Add structure:</strong> Use <a href="/tools/pdf-bookmark-extractor" className="text-blue-600 hover:text-blue-700">bookmarks</a> and <a href="/tools/add-page-numbers" className="text-blue-600 hover:text-blue-700">page numbers</a> after merging</li>
                        <li>• <strong>Security first:</strong> <a href="/tools/protect-pdf" className="text-blue-600 hover:text-blue-700">Password protect</a> sensitive merged documents</li>
                        <li>• <strong>Quality check:</strong> Preview merged files before sharing or submitting</li>
                      </ul>
                    </div>
                  </div>
                </div>

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
                  <h2 className="text-3xl font-bold text-gray-900 mb-6">Comprehensive PDF Merger FAQ</h2>
                  <p className="text-gray-700 mb-8 text-lg">
                    Get answers to the most common questions about PDF merging, from technical specifications to best practices for document management.
                  </p>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="space-y-6">
                      <div className="bg-white rounded-lg p-6 shadow-sm border border-indigo-200">
                        <h3 className="font-semibold text-gray-900 mb-2 flex items-center">
                          <i className="fas fa-infinity text-blue-600 mr-2"></i>
                          Is there a limit to how many PDFs I can merge?
                        </h3>
                        <p className="text-gray-600 text-sm mb-3">
                          No, our PDF merger supports unlimited file combining. You can merge as many PDF documents as needed without restrictions on file count or total size.
                        </p>
                        <p className="text-xs text-gray-500">
                          <strong>Pro tip:</strong> For very large merging projects, consider using our <a href="/tools/pdf-compressor-advanced" className="text-blue-600 hover:text-blue-700">PDF compressor</a> on individual files first to optimize performance.
                        </p>
                      </div>
                      
                      <div className="bg-white rounded-lg p-6 shadow-sm border border-indigo-200">
                        <h3 className="font-semibold text-gray-900 mb-2 flex items-center">
                          <i className="fas fa-gem text-purple-600 mr-2"></i>
                          Will the quality of my PDFs be affected after merging?
                        </h3>
                        <p className="text-gray-600 text-sm mb-3">
                          No, our merger preserves original document quality, including fonts, images, formatting, and layout. The merged PDF maintains the same quality as your original files using advanced PDF-lib technology.
                        </p>
                        <p className="text-xs text-gray-500">
                          <strong>Technical note:</strong> We preserve vector graphics, maintain image resolution, and keep all embedded fonts intact during the merging process.
                        </p>
                      </div>
                      
                      <div className="bg-white rounded-lg p-6 shadow-sm border border-indigo-200">
                        <h3 className="font-semibold text-gray-900 mb-2 flex items-center">
                          <i className="fas fa-lock text-orange-600 mr-2"></i>
                          Can I merge password-protected PDFs?
                        </h3>
                        <p className="text-gray-600 text-sm mb-3">
                          Yes, our tool can process password-protected PDFs. However, you may need to unlock them first using our <a href="/tools/unlock-pdf" className="text-orange-600 hover:text-orange-700">PDF unlock tool</a> or provide the password during the merging process.
                        </p>
                        <p className="text-xs text-gray-500">
                          <strong>Security tip:</strong> After merging, you can re-protect the final document using our <a href="/tools/protect-pdf" className="text-orange-600 hover:text-orange-700">PDF password protection tool</a>.
                        </p>
                      </div>
                      
                      <div className="bg-white rounded-lg p-6 shadow-sm border border-indigo-200">
                        <h3 className="font-semibold text-gray-900 mb-2 flex items-center">
                          <i className="fas fa-mobile-alt text-green-600 mr-2"></i>
                          Does PDF merging work on mobile devices and tablets?
                        </h3>
                        <p className="text-gray-600 text-sm mb-3">
                          Absolutely! Our PDF merger is fully optimized for mobile devices, tablets, and smartphones. The responsive interface adapts perfectly to any screen size while maintaining full functionality.
                        </p>
                        <p className="text-xs text-gray-500">
                          <strong>Mobile tip:</strong> Use the drag-and-drop feature on touch devices by pressing and holding files to reorder them before merging.
                        </p>
                      </div>
                      
                      <div className="bg-white rounded-lg p-6 shadow-sm border border-indigo-200">
                        <h3 className="font-semibold text-gray-900 mb-2 flex items-center">
                          <i className="fas fa-clock text-red-600 mr-2"></i>
                          How long does it take to merge PDF files?
                        </h3>
                        <p className="text-gray-600 text-sm mb-3">
                          Merging is typically instant for most documents. Processing time depends on file sizes and page counts, but even large document sets usually merge within seconds thanks to our optimized processing algorithms.
                        </p>
                        <p className="text-xs text-gray-500">
                          <strong>Performance note:</strong> Files with many high-resolution images may take slightly longer, but processing remains remarkably fast compared to desktop alternatives.
                        </p>
                      </div>
                      
                      <div className="bg-white rounded-lg p-6 shadow-sm border border-indigo-200">
                        <h3 className="font-semibold text-gray-900 mb-2 flex items-center">
                          <i className="fas fa-language text-teal-600 mr-2"></i>
                          Can I merge PDFs in different languages or with special characters?
                        </h3>
                        <p className="text-gray-600 text-sm mb-3">
                          Yes! Our merger supports Unicode and handles documents in any language, including Arabic, Chinese, Japanese, Hebrew, and documents with mathematical symbols or special characters.
                        </p>
                        <p className="text-xs text-gray-500">
                          <strong>Compatibility note:</strong> All embedded fonts and character encodings are preserved, ensuring international documents merge perfectly without formatting issues.
                        </p>
                      </div>
                    </div>
                    
                    <div className="space-y-6">
                      <div className="bg-white rounded-lg p-6 shadow-sm border border-indigo-200">
                        <h3 className="font-semibold text-gray-900 mb-2 flex items-center">
                          <i className="fas fa-shield-alt text-blue-600 mr-2"></i>
                          How secure is the PDF merging process?
                        </h3>
                        <p className="text-gray-600 text-sm mb-3">
                          Completely secure. All processing happens locally in your browser using client-side JavaScript - your files never leave your device, get uploaded to servers, or stored in the cloud.
                        </p>
                        <p className="text-xs text-gray-500">
                          <strong>Privacy guarantee:</strong> We follow GDPR compliance standards and don't track, store, or access your documents in any way during the merging process.
                        </p>
                      </div>
                      
                      <div className="bg-white rounded-lg p-6 shadow-sm border border-indigo-200">
                        <h3 className="font-semibold text-gray-900 mb-2 flex items-center">
                          <i className="fas fa-arrows-alt text-purple-600 mr-2"></i>
                          Can I rearrange the order of PDFs before merging?
                        </h3>
                        <p className="text-gray-600 text-sm mb-3">
                          Absolutely! Use our intuitive drag-and-drop interface or arrow buttons to reorder your PDFs exactly how you want them in the final merged document. Preview the arrangement before processing.
                        </p>
                        <p className="text-xs text-gray-500">
                          <strong>Organization tip:</strong> You can also remove individual files from the merge list if you change your mind before processing.
                        </p>
                      </div>
                      
                      <div className="bg-white rounded-lg p-6 shadow-sm border border-indigo-200">
                        <h3 className="font-semibold text-gray-900 mb-2 flex items-center">
                          <i className="fas fa-file-pdf text-red-600 mr-2"></i>
                          What file formats are supported for merging?
                        </h3>
                        <p className="text-gray-600 text-sm mb-3">
                          Our tool specifically merges PDF files. All PDF versions (1.0-1.7) are supported, including PDF/A formats, form-enabled documents, and PDFs with interactive elements like hyperlinks and bookmarks.
                        </p>
                        <p className="text-xs text-gray-500">
                          <strong>Format support:</strong> Need to convert other formats first? Try our <a href="/tools/images-to-pdf" className="text-red-600 hover:text-red-700">images to PDF converter</a> for JPG, PNG, and other image files.
                        </p>
                      </div>
                      
                      <div className="bg-white rounded-lg p-6 shadow-sm border border-indigo-200">
                        <h3 className="font-semibold text-gray-900 mb-2 flex items-center">
                          <i className="fas fa-bookmark text-indigo-600 mr-2"></i>
                          Will bookmarks and hyperlinks be preserved in merged PDFs?
                        </h3>
                        <p className="text-gray-600 text-sm mb-3">
                          Yes! Our advanced merging technology preserves bookmarks, hyperlinks, form fields, and other interactive elements from your original documents, maintaining full functionality in the merged file.
                        </p>
                        <p className="text-xs text-gray-500">
                          <strong>Advanced feature:</strong> Use our <a href="/tools/pdf-bookmark-extractor" className="text-indigo-600 hover:text-indigo-700">bookmark extractor</a> to analyze the bookmark structure of your merged document.
                        </p>
                      </div>
                      
                      <div className="bg-white rounded-lg p-6 shadow-sm border border-indigo-200">
                        <h3 className="font-semibold text-gray-900 mb-2 flex items-center">
                          <i className="fas fa-download text-green-600 mr-2"></i>
                          In what format will I receive the merged PDF?
                        </h3>
                        <p className="text-gray-600 text-sm mb-3">
                          The merged file is provided as a standard PDF document that's compatible with all PDF readers including Adobe Acrobat, browser PDF viewers, and mobile PDF apps.
                        </p>
                        <p className="text-xs text-gray-500">
                          <strong>File naming:</strong> The default filename is "merged-document.pdf" but you can rename it during download or save it with any filename you prefer.
                        </p>
                      </div>
                      
                      <div className="bg-white rounded-lg p-6 shadow-sm border border-indigo-200">
                        <h3 className="font-semibold text-gray-900 mb-2 flex items-center">
                          <i className="fas fa-question-circle text-orange-600 mr-2"></i>
                          What should I do if the merging process fails?
                        </h3>
                        <p className="text-gray-600 text-sm mb-3">
                          If merging fails, first ensure all uploaded files are valid PDFs. Try refreshing the page and uploading files again. For corrupted PDFs, use our diagnostic tools to check file integrity.
                        </p>
                        <p className="text-xs text-gray-500">
                          <strong>Troubleshooting:</strong> Very large files (>50MB) may need compression first. Use our <a href="/tools/pdf-compressor-advanced" className="text-orange-600 hover:text-orange-700">PDF compressor</a> to reduce file sizes before merging.
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-8 bg-white rounded-xl p-6 border border-blue-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <i className="fas fa-tools text-blue-600 mr-3"></i>
                      Still Have Questions? Explore Our Help Resources
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="text-center">
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                          <i className="fas fa-book text-blue-600"></i>
                        </div>
                        <h4 className="font-semibold text-gray-900 mb-1">Help Center</h4>
                        <p className="text-sm text-gray-600 mb-2">Comprehensive guides and tutorials</p>
                        <a href="/help-center" className="text-blue-600 hover:text-blue-700 text-sm font-medium">Browse Help Articles →</a>
                      </div>
                      
                      <div className="text-center">
                        <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                          <i className="fas fa-wrench text-green-600"></i>
                        </div>
                        <h4 className="font-semibold text-gray-900 mb-1">All PDF Tools</h4>
                        <p className="text-sm text-gray-600 mb-2">Complete PDF management suite</p>
                        <a href="/tools/pdf-tools" className="text-green-600 hover:text-green-700 text-sm font-medium">Explore PDF Tools →</a>
                      </div>
                      
                      <div className="text-center">
                        <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                          <i className="fas fa-envelope text-purple-600"></i>
                        </div>
                        <h4 className="font-semibold text-gray-900 mb-1">Contact Support</h4>
                        <p className="text-sm text-gray-600 mb-2">Get personalized assistance</p>
                        <a href="/contact-us" className="text-purple-600 hover:text-purple-700 text-sm font-medium">Contact Our Team →</a>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Tool Comparison */}
                <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-2xl shadow-lg p-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-6">PDF Merger vs. Other Document Tools</h2>
                  <p className="text-gray-700 mb-8 text-lg">
                    Understanding when to use different PDF tools can significantly improve your document workflow efficiency. Here's how our PDF merger compares with other essential document management utilities.
                  </p>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full bg-white rounded-xl shadow-sm border border-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Tool</th>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Best For</th>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Key Benefits</th>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Common Use Cases</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        <tr className="bg-blue-50">
                          <td className="px-6 py-4">
                            <div className="flex items-center">
                              <i className="fas fa-object-group text-blue-600 mr-3"></i>
                              <div>
                                <div className="font-semibold text-gray-900">PDF Merger</div>
                                <div className="text-sm text-gray-600">Current Tool</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-700">
                            Combining multiple PDFs into one document
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-700">
                            • Unlimited file combining<br>
                            • Drag & drop reordering<br>
                            • Format preservation
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-700">
                            Reports, proposals, academic papers
                          </td>
                        </tr>
                        <tr>
                          <td className="px-6 py-4">
                            <div className="flex items-center">
                              <i className="fas fa-cut text-green-600 mr-3"></i>
                              <div>
                                <div className="font-semibold text-gray-900">PDF Splitter</div>
                                <div className="text-sm text-blue-600">
                                  <a href="/tools/split-pdf" className="hover:text-blue-700">Try Tool →</a>
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-700">
                            Extracting specific pages from large PDFs
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-700">
                            • Page range selection<br>
                            • Individual page extraction<br>
                            • Multiple output files
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-700">
                            Separating chapters, extracting forms
                          </td>
                        </tr>
                        <tr>
                          <td className="px-6 py-4">
                            <div className="flex items-center">
                              <i className="fas fa-compress-alt text-purple-600 mr-3"></i>
                              <div>
                                <div className="font-semibold text-gray-900">PDF Compressor</div>
                                <div className="text-sm text-blue-600">
                                  <a href="/tools/pdf-compressor-advanced" className="hover:text-blue-700">Try Tool →</a>
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-700">
                            Reducing file size for sharing/storage
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-700">
                            • Multiple compression levels<br>
                            • Quality optimization<br>
                            • Size reduction up to 90%
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-700">
                            Email attachments, web uploads
                          </td>
                        </tr>
                        <tr>
                          <td className="px-6 py-4">
                            <div className="flex items-center">
                              <i className="fas fa-undo text-orange-600 mr-3"></i>
                              <div>
                                <div className="font-semibold text-gray-900">PDF Rotator</div>
                                <div className="text-sm text-blue-600">
                                  <a href="/tools/rotate-pdf" className="hover:text-blue-700">Try Tool →</a>
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-700">
                            Fixing page orientations and alignment
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-700">
                            • 90°, 180°, 270° rotation<br>
                            • Batch page processing<br>
                            • Preview before applying
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-700">
                            Scanned documents, mixed orientations
                          </td>
                        </tr>
                        <tr>
                          <td className="px-6 py-4">
                            <div className="flex items-center">
                              <i className="fas fa-lock text-red-600 mr-3"></i>
                              <div>
                                <div className="font-semibold text-gray-900">PDF Protector</div>
                                <div className="text-sm text-blue-600">
                                  <a href="/tools/protect-pdf" className="hover:text-blue-700">Try Tool →</a>
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-700">
                            Adding security and access control
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-700">
                            • Password protection<br>
                            • Permission controls<br>
                            • Encryption standards
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-700">
                            Confidential documents, contracts
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  
                  <div className="mt-8 bg-white rounded-xl p-6 border border-blue-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <i className="fas fa-route text-blue-600 mr-3"></i>
                      Recommended Workflow Combinations
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">📄 Document Preparation Workflow</h4>
                        <ol className="space-y-2 text-sm text-gray-700">
                          <li className="flex items-start">
                            <span className="w-5 h-5 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs mr-3 mt-0.5">1</span>
                            <span><a href="/tools/rotate-pdf" className="text-blue-600 hover:text-blue-700">Rotate pages</a> to fix orientations</span>
                          </li>
                          <li className="flex items-start">
                            <span className="w-5 h-5 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs mr-3 mt-0.5">2</span>
                            <span><strong>Merge documents</strong> (current tool)</span>
                          </li>
                          <li className="flex items-start">
                            <span className="w-5 h-5 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs mr-3 mt-0.5">3</span>
                            <span><a href="/tools/add-page-numbers" className="text-blue-600 hover:text-blue-700">Add page numbers</a> for navigation</span>
                          </li>
                          <li className="flex items-start">
                            <span className="w-5 h-5 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs mr-3 mt-0.5">4</span>
                            <span><a href="/tools/pdf-compressor-advanced" className="text-blue-600 hover:text-blue-700">Compress final file</a> for sharing</span>
                          </li>
                        </ol>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">🔒 Secure Document Processing</h4>
                        <ol className="space-y-2 text-sm text-gray-700">
                          <li className="flex items-start">
                            <span className="w-5 h-5 bg-green-600 text-white rounded-full flex items-center justify-center text-xs mr-3 mt-0.5">1</span>
                            <span><strong>Merge sensitive documents</strong></span>
                          </li>
                          <li className="flex items-start">
                            <span className="w-5 h-5 bg-green-600 text-white rounded-full flex items-center justify-center text-xs mr-3 mt-0.5">2</span>
                            <span><a href="/tools/pdf-redaction-tool" className="text-green-600 hover:text-green-700">Redact confidential information</a></span>
                          </li>
                          <li className="flex items-start">
                            <span className="w-5 h-5 bg-green-600 text-white rounded-full flex items-center justify-center text-xs mr-3 mt-0.5">3</span>
                            <span><a href="/tools/protect-pdf" className="text-green-600 hover:text-green-700">Add password protection</a></span>
                          </li>
                          <li className="flex items-start">
                            <span className="w-5 h-5 bg-green-600 text-white rounded-full flex items-center justify-center text-xs mr-3 mt-0.5">4</span>
                            <span>Distribute securely to recipients</span>
                          </li>
                        </ol>
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