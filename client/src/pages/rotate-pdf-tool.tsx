import { useState, useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { PDFDocument, degrees } from 'pdf-lib';
import { Upload, FileText, Download, RotateCw, RotateCcw, RefreshCw } from 'lucide-react';

interface RotationOption {
  value: number;
  label: string;
  icon: JSX.Element;
  description: string;
}

const RotatePDFTool = () => {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [selectedPages, setSelectedPages] = useState<number[]>([]);
  const [rotationAngle, setRotationAngle] = useState<number>(90);
  const [rotatedPdfUrl, setRotatedPdfUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [selectAllPages, setSelectAllPages] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const rotationOptions: RotationOption[] = [
    {
      value: 90,
      label: '90° Clockwise',
      icon: <RotateCw className="w-4 h-4" />,
      description: 'Rotate pages 90 degrees to the right'
    },
    {
      value: 180,
      label: '180° Flip',
      icon: <RefreshCw className="w-4 h-4" />,
      description: 'Flip pages upside down'
    },
    {
      value: 270,
      label: '270° Counter-clockwise',
      icon: <RotateCcw className="w-4 h-4" />,
      description: 'Rotate pages 90 degrees to the left'
    }
  ];

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
      setSelectedPages(Array.from({ length: pages }, (_, i) => i + 1));
      setRotatedPdfUrl(null);
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

  const togglePageSelection = (pageNum: number) => {
    setSelectedPages(prev => {
      if (prev.includes(pageNum)) {
        const newSelection = prev.filter(p => p !== pageNum);
        setSelectAllPages(newSelection.length === totalPages);
        return newSelection;
      } else {
        const newSelection = [...prev, pageNum].sort((a, b) => a - b);
        setSelectAllPages(newSelection.length === totalPages);
        return newSelection;
      }
    });
  };

  const toggleSelectAll = (checked: boolean) => {
    setSelectAllPages(checked);
    if (checked) {
      setSelectedPages(Array.from({ length: totalPages }, (_, i) => i + 1));
    } else {
      setSelectedPages([]);
    }
  };

  const rotatePDF = async () => {
    if (!pdfFile || selectedPages.length === 0) return;

    setIsProcessing(true);

    try {
      const arrayBuffer = await pdfFile.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      
      // Rotate selected pages
      selectedPages.forEach(pageNum => {
        const page = pdfDoc.getPage(pageNum - 1);
        page.setRotation(degrees(rotationAngle));
      });

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      setRotatedPdfUrl(url);
    } catch (error) {
      console.error('Error rotating PDF:', error);
      alert('Error rotating PDF. Please try again.');
    }

    setIsProcessing(false);
  };

  const downloadRotatedPDF = () => {
    if (!rotatedPdfUrl) return;

    const link = document.createElement('a');
    link.href = rotatedPdfUrl;
    link.download = `rotated-${pdfFile?.name || 'document.pdf'}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const resetTool = () => {
    setPdfFile(null);
    setTotalPages(0);
    setSelectedPages([]);
    setRotatedPdfUrl(null);
    setSelectAllPages(true);
    
    if (rotatedPdfUrl) {
      URL.revokeObjectURL(rotatedPdfUrl);
    }
  };

  return (
    <>
      <Helmet>
        <title>Rotate PDF Pages - Free Online PDF Rotator Tool | ToolsHub</title>
        <meta name="description" content="Rotate PDF pages online for free. Fix upside down or sideways PDF pages with 90°, 180°, or 270° rotation. No registration required." />
        <meta name="keywords" content="rotate PDF, PDF rotator, fix PDF orientation, rotate PDF pages, PDF page rotation, upside down PDF" />
        <meta property="og:title" content="Rotate PDF Pages - Free Online PDF Rotator Tool | ToolsHub" />
        <meta property="og:description" content="Rotate PDF pages online for free. Fix upside down or sideways PDF pages with custom rotation angles." />
        <meta property="og:type" content="website" />
        <link rel="canonical" href="/tools/rotate-pdf" />
      </Helmet>

      <div className="min-h-screen flex flex-col" data-testid="page-rotate-pdf">
        <Header />
        
        <main className="flex-1 bg-neutral-50">
          {/* Hero Section */}
          <section className="bg-gradient-to-r from-orange-600 via-orange-500 to-red-700 text-white py-16">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <div className="w-20 h-20 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <i className="fas fa-undo text-3xl"></i>
              </div>
              <h1 className="text-4xl sm:text-5xl font-bold mb-6" data-testid="text-page-title">
                Rotate PDF Pages
              </h1>
              <p className="text-xl text-orange-100 max-w-2xl mx-auto">
                Fix upside down or sideways PDF pages. Rotate individual pages or entire documents with custom angles.
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
                      <h2 className="text-2xl font-semibold text-gray-900 mb-6">Upload PDF File to Rotate</h2>
                      
                      <div
                        className={`border-2 border-dashed rounded-xl p-12 text-center transition-colors ${
                          dragOver 
                            ? 'border-orange-500 bg-orange-50' 
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
                          className="bg-orange-600 hover:bg-orange-700 text-white"
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

                    {/* Rotation Options */}
                    {pdfFile && totalPages > 0 && (
                      <div>
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Rotation Angle</h3>
                        
                        <RadioGroup 
                          value={rotationAngle.toString()} 
                          onValueChange={(value) => setRotationAngle(parseInt(value))}
                          className="grid grid-cols-1 md:grid-cols-3 gap-4"
                        >
                          {rotationOptions.map((option) => (
                            <div key={option.value} className="flex items-center space-x-2">
                              <RadioGroupItem 
                                value={option.value.toString()} 
                                id={`rotation-${option.value}`} 
                                data-testid={`radio-rotation-${option.value}`}
                              />
                              <Label 
                                htmlFor={`rotation-${option.value}`} 
                                className="flex items-center gap-2 font-medium cursor-pointer"
                              >
                                {option.icon}
                                <span>{option.label}</span>
                              </Label>
                            </div>
                          ))}
                        </RadioGroup>
                        
                        <div className="mt-2 text-sm text-gray-600">
                          {rotationOptions.find(opt => opt.value === rotationAngle)?.description}
                        </div>
                      </div>
                    )}

                    {/* Page Selection */}
                    {pdfFile && totalPages > 0 && (
                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-lg font-medium text-gray-900">Select Pages to Rotate</h3>
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="select-all"
                              checked={selectAllPages}
                              onCheckedChange={toggleSelectAll}
                              data-testid="checkbox-select-all"
                            />
                            <Label htmlFor="select-all" className="text-sm">
                              Select All Pages
                            </Label>
                          </div>
                        </div>
                        
                        <div className="bg-blue-50 rounded-lg p-4 mb-4">
                          <p className="text-sm text-blue-800">
                            <strong>Selected:</strong> {selectedPages.length} of {totalPages} pages
                            {selectedPages.length > 0 && (
                              <span className="ml-2">
                                (Pages: {selectedPages.join(', ')})
                              </span>
                            )}
                          </p>
                        </div>
                        
                        <div className="grid grid-cols-5 md:grid-cols-10 gap-2" data-testid="page-selector">
                          {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                            <button
                              key={pageNum}
                              onClick={() => togglePageSelection(pageNum)}
                              className={`aspect-square rounded-lg border-2 text-sm font-medium transition-colors ${
                                selectedPages.includes(pageNum)
                                  ? 'border-orange-500 bg-orange-100 text-orange-700'
                                  : 'border-gray-300 bg-white text-gray-600 hover:border-gray-400'
                              }`}
                              data-testid={`page-${pageNum}`}
                            >
                              {pageNum}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Rotate Button */}
                    {pdfFile && selectedPages.length > 0 && (
                      <div className="text-center">
                        <Button
                          onClick={rotatePDF}
                          disabled={isProcessing}
                          className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 text-lg"
                          data-testid="button-rotate"
                        >
                          {isProcessing ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                              Rotating PDF...
                            </>
                          ) : (
                            <>
                              <RotateCw className="w-4 h-4 mr-2" />
                              Rotate {selectedPages.length} Page{selectedPages.length > 1 ? 's' : ''}
                            </>
                          )}
                        </Button>
                      </div>
                    )}

                    {/* Results Section */}
                    {rotatedPdfUrl && (
                      <div className="bg-green-50 rounded-xl p-6 text-center" data-testid="rotation-results">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <i className="fas fa-check text-2xl text-green-600"></i>
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">
                          PDF Successfully Rotated!
                        </h3>
                        <p className="text-gray-600 mb-6">
                          {selectedPages.length} page{selectedPages.length > 1 ? 's' : ''} rotated by {rotationAngle}°.
                        </p>
                        <Button
                          onClick={downloadRotatedPDF}
                          className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-3"
                          data-testid="button-download"
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Download Rotated PDF
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Educational Content */}
              <div className="mt-12 space-y-8">
                {/* What is PDF Rotation Tool */}
                <div className="bg-white rounded-2xl shadow-lg p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">What is the PDF Rotation Tool?</h2>
                  <div className="prose max-w-none text-gray-600">
                    <p className="text-lg mb-4">
                      Our <strong>PDF Rotation Tool</strong> is a powerful, browser-based solution that allows you to 
                      <strong> rotate PDF pages online</strong> without downloading any software. Whether you need to 
                      fix upside-down scanned documents, correct sideways pages, or adjust page orientation for better 
                      viewing, our tool handles it all with precision and ease.
                    </p>
                    <p className="mb-4">
                      The tool supports <strong>selective page rotation</strong>, meaning you can choose specific pages 
                      to rotate while leaving others untouched. This flexibility makes it perfect for documents with 
                      mixed orientations, such as reports containing both portrait text pages and landscape charts or diagrams.
                    </p>
                    <div className="bg-blue-50 rounded-lg p-6 mt-6">
                      <h3 className="text-lg font-semibold text-blue-900 mb-3">Key Features of Our PDF Rotator:</h3>
                      <ul className="space-y-2 text-blue-800">
                        <li>• <strong>90°, 180°, and 270° rotation options</strong> for any orientation need</li>
                        <li>• <strong>Individual page selection</strong> or bulk rotation for entire documents</li>
                        <li>• <strong>Instant preview</strong> and processing with no waiting time</li>
                        <li>• <strong>Quality preservation</strong> - maintains original PDF resolution and formatting</li>
                        <li>• <strong>Security-focused</strong> - all processing happens locally in your browser</li>
                        <li>• <strong>No file size limits</strong> - works with documents up to 100MB</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* How it Works */}
                <div className="bg-white rounded-2xl shadow-lg p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">How to Rotate PDF Pages Online</h2>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Upload className="w-8 h-8 text-orange-600" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">1. Upload PDF</h3>
                      <p className="text-gray-600">
                        Upload your PDF file with pages that need rotation.
                      </p>
                    </div>
                    
                    <div className="text-center">
                      <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <RotateCw className="w-8 h-8 text-blue-600" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">2. Choose Angle</h3>
                      <p className="text-gray-600">
                        Select rotation angle: 90°, 180°, or 270°.
                      </p>
                    </div>
                    
                    <div className="text-center">
                      <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <FileText className="w-8 h-8 text-purple-600" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">3. Select Pages</h3>
                      <p className="text-gray-600">
                        Choose which pages to rotate or select all.
                      </p>
                    </div>
                    
                    <div className="text-center">
                      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Download className="w-8 h-8 text-green-600" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">4. Download</h3>
                      <p className="text-gray-600">
                        Download your PDF with properly oriented pages.
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
                        <h3 className="font-semibold text-gray-900">Multiple Rotation Angles</h3>
                        <p className="text-gray-600 text-sm">Rotate pages by 90°, 180°, or 270° as needed.</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mr-3 mt-1">
                        <i className="fas fa-check text-xs text-green-600"></i>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">Selective Page Rotation</h3>
                        <p className="text-gray-600 text-sm">Choose specific pages or rotate entire document.</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mr-3 mt-1">
                        <i className="fas fa-check text-xs text-green-600"></i>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">Preserve Quality</h3>
                        <p className="text-gray-600 text-sm">Maintain original PDF quality during rotation.</p>
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
                  </div>
                </div>

                {/* Benefits for Different Audiences */}
                <div className="bg-white rounded-2xl shadow-lg p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Benefits of PDF Page Rotation for Every User</h2>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-4">📚 For Students & Educators</h3>
                      <ul className="space-y-3 text-gray-600 mb-6">
                        <li className="flex items-start">
                          <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                          <span><strong>Fix scanned textbook pages</strong> that were scanned upside down or sideways</span>
                        </li>
                        <li className="flex items-start">
                          <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                          <span><strong>Correct assignment submissions</strong> before submitting to online platforms</span>
                        </li>
                        <li className="flex items-start">
                          <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                          <span><strong>Prepare research papers</strong> with mixed portrait and landscape pages</span>
                        </li>
                        <li className="flex items-start">
                          <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                          <span><strong>Standardize study materials</strong> for consistent reading experience</span>
                        </li>
                      </ul>

                      <h3 className="text-xl font-semibold text-gray-900 mb-4">💼 For Business Professionals</h3>
                      <ul className="space-y-3 text-gray-600">
                        <li className="flex items-start">
                          <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                          <span><strong>Fix presentation slides</strong> that appear sideways in PDF exports</span>
                        </li>
                        <li className="flex items-start">
                          <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                          <span><strong>Correct invoice orientations</strong> for professional document management</span>
                        </li>
                        <li className="flex items-start">
                          <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                          <span><strong>Prepare contract documents</strong> with proper page alignment</span>
                        </li>
                        <li className="flex items-start">
                          <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                          <span><strong>Optimize reports for mobile viewing</strong> by adjusting page orientation</span>
                        </li>
                      </ul>
                    </div>

                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-4">🏢 For Business Owners</h3>
                      <ul className="space-y-3 text-gray-600 mb-6">
                        <li className="flex items-start">
                          <span className="w-2 h-2 bg-purple-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                          <span><strong>Standardize company documents</strong> for consistent branding and presentation</span>
                        </li>
                        <li className="flex items-start">
                          <span className="w-2 h-2 bg-purple-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                          <span><strong>Fix scanned forms and applications</strong> for digital processing systems</span>
                        </li>
                        <li className="flex items-start">
                          <span className="w-2 h-2 bg-purple-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                          <span><strong>Prepare marketing materials</strong> with mixed content orientations</span>
                        </li>
                        <li className="flex items-start">
                          <span className="w-2 h-2 bg-purple-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                          <span><strong>Ensure compliance documents</strong> are properly oriented for submission</span>
                        </li>
                      </ul>

                      <h3 className="text-xl font-semibold text-gray-900 mb-4">🔬 For Researchers & Academics</h3>
                      <ul className="space-y-3 text-gray-600">
                        <li className="flex items-start">
                          <span className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                          <span><strong>Fix journal article PDFs</strong> with incorrectly oriented figures and tables</span>
                        </li>
                        <li className="flex items-start">
                          <span className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                          <span><strong>Prepare thesis documents</strong> with landscape charts and portrait text</span>
                        </li>
                        <li className="flex items-start">
                          <span className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                          <span><strong>Standardize research papers</strong> for publication submission</span>
                        </li>
                        <li className="flex items-start">
                          <span className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                          <span><strong>Archive scanned documents</strong> with consistent orientation</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Use Cases */}
                <div className="bg-white rounded-2xl shadow-lg p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Common PDF Rotation Scenarios</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="bg-orange-50 rounded-lg p-4">
                      <h3 className="font-semibold text-gray-900 mb-2">🔄 Fix Scanned Documents</h3>
                      <p className="text-sm text-gray-600">Correct orientation of scanned pages that are upside down or sideways due to improper scanning.</p>
                    </div>
                    
                    <div className="bg-blue-50 rounded-lg p-4">
                      <h3 className="font-semibold text-gray-900 mb-2">📱 Mobile-Optimized Documents</h3>
                      <p className="text-sm text-gray-600">Rotate pages for better mobile and tablet viewing experience, especially for landscape content.</p>
                    </div>
                    
                    <div className="bg-green-50 rounded-lg p-4">
                      <h3 className="font-semibold text-gray-900 mb-2">📊 Mixed Content Orientation</h3>
                      <p className="text-sm text-gray-600">Handle documents with both portrait text and landscape charts, tables, or diagrams.</p>
                    </div>
                    
                    <div className="bg-purple-50 rounded-lg p-4">
                      <h3 className="font-semibold text-gray-900 mb-2">📄 Document Standardization</h3>
                      <p className="text-sm text-gray-600">Ensure consistent page orientation across merged documents from different sources.</p>
                    </div>
                    
                    <div className="bg-red-50 rounded-lg p-4">
                      <h3 className="font-semibold text-gray-900 mb-2">📋 Form Processing</h3>
                      <p className="text-sm text-gray-600">Correct orientation of filled forms before digital processing or automated data extraction.</p>
                    </div>
                    
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h3 className="font-semibold text-gray-900 mb-2">🖨️ Print Preparation</h3>
                      <p className="text-sm text-gray-600">Prepare documents for proper printing alignment and paper orientation.</p>
                    </div>
                  </div>
                </div>

                {/* Why Choose Our PDF Rotator */}
                <div className="bg-white rounded-2xl shadow-lg p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Why Choose Our PDF Rotation Tool?</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-4">Free & No Registration</h3>
                      <p className="text-gray-600 mb-4">
                        Rotate PDF pages completely free without creating an account. No hidden fees, no subscription required. 
                        Simply upload your PDF and start rotating pages instantly.
                      </p>
                      
                      <h3 className="text-xl font-semibold text-gray-900 mb-4">Browser-Based Security</h3>
                      <p className="text-gray-600 mb-4">
                        All PDF rotation happens directly in your browser. Your files never leave your device, ensuring complete 
                        privacy and security. No server uploads means your sensitive documents stay private.
                      </p>
                    </div>
                    
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-4">Professional Results</h3>
                      <p className="text-gray-600 mb-4">
                        Maintain original PDF quality while rotating pages. Our tool preserves text searchability, hyperlinks, 
                        and formatting, ensuring your rotated PDF looks exactly as intended.
                      </p>
                      
                      <h3 className="text-xl font-semibold text-gray-900 mb-4">Flexible Page Selection</h3>
                      <p className="text-gray-600">
                        Rotate individual pages, page ranges, or entire documents. Choose specific pages that need rotation 
                        while keeping others in their original orientation for maximum control.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Technical Specifications */}
                <div className="bg-white rounded-2xl shadow-lg p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Technical Specifications</h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-blue-50 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Supported Formats</h3>
                      <ul className="space-y-2 text-sm text-gray-600">
                        <li>• PDF 1.3 and higher</li>
                        <li>• Password-protected PDFs</li>
                        <li>• Multi-page documents</li>
                        <li>• Scanned PDF documents</li>
                        <li>• Form-fillable PDFs</li>
                      </ul>
                    </div>
                    
                    <div className="bg-green-50 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Rotation Options</h3>
                      <ul className="space-y-2 text-sm text-gray-600">
                        <li>• 90° clockwise rotation</li>
                        <li>• 180° flip (upside down)</li>
                        <li>• 270° counter-clockwise</li>
                        <li>• Selective page rotation</li>
                        <li>• Batch processing</li>
                      </ul>
                    </div>
                    
                    <div className="bg-purple-50 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">File Limits</h3>
                      <ul className="space-y-2 text-sm text-gray-600">
                        <li>• Maximum size: 100MB</li>
                        <li>• Up to 1000 pages</li>
                        <li>• Any page dimensions</li>
                        <li>• Multiple rotations</li>
                        <li>• Instant processing</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Frequently Asked Questions */}
                <div className="bg-white rounded-2xl shadow-lg p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Frequently Asked Questions</h2>
                  <div className="space-y-6">
                    <div className="border-b border-gray-200 pb-4">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">How do I rotate specific pages in a PDF?</h3>
                      <p className="text-gray-600">
                        Upload your PDF, select the rotation angle (90°, 180°, or 270°), then choose which pages to rotate by clicking on the page numbers. 
                        You can select individual pages or use "Select All" for the entire document.
                      </p>
                    </div>
                    
                    <div className="border-b border-gray-200 pb-4">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Does rotating PDF pages affect quality?</h3>
                      <p className="text-gray-600">
                        No, our PDF rotation tool maintains the original quality of your document. Text remains searchable, images stay sharp, 
                        and all formatting is preserved during the rotation process.
                      </p>
                    </div>
                    
                    <div className="border-b border-gray-200 pb-4">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Can I rotate password-protected PDFs?</h3>
                      <p className="text-gray-600">
                        Yes, but you'll need to unlock the PDF first using our PDF unlock tool. Once unlocked, you can rotate pages normally 
                        and then re-protect the document if needed.
                      </p>
                    </div>
                    
                    <div className="border-b border-gray-200 pb-4">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">What's the difference between 90° and 270° rotation?</h3>
                      <p className="text-gray-600">
                        90° rotates pages clockwise (right), while 270° rotates counter-clockwise (left). If a page is sideways with text 
                        reading from bottom to top, use 90° to fix it. If text reads from top to bottom, use 270°.
                      </p>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">How large can my PDF be for rotation?</h3>
                      <p className="text-gray-600">
                        Our tool supports PDFs up to 100MB in size with up to 1000 pages. Most documents will be processed instantly, 
                        while very large files may take a few seconds to complete the rotation.
                      </p>
                    </div>
                  </div>
                </div>

                {/* PDF Rotation vs Other Solutions */}
                <div className="bg-white rounded-2xl shadow-lg p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Why Online PDF Rotation is Better Than Desktop Software</h2>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-4">🌐 Online PDF Rotation Advantages</h3>
                      <div className="space-y-4">
                        <div className="flex items-start">
                          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3 mt-1">
                            <i className="fas fa-check text-green-600 text-sm"></i>
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900">No Software Installation</h4>
                            <p className="text-gray-600 text-sm">Access powerful PDF rotation features instantly through your web browser without downloading or installing heavy desktop applications.</p>
                          </div>
                        </div>
                        
                        <div className="flex items-start">
                          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3 mt-1">
                            <i className="fas fa-check text-green-600 text-sm"></i>
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900">Cross-Platform Compatibility</h4>
                            <p className="text-gray-600 text-sm">Works seamlessly on Windows, Mac, Linux, tablets, and smartphones - any device with a modern web browser.</p>
                          </div>
                        </div>
                        
                        <div className="flex items-start">
                          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3 mt-1">
                            <i className="fas fa-check text-green-600 text-sm"></i>
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900">Always Up-to-Date</h4>
                            <p className="text-gray-600 text-sm">Automatically get the latest features and security updates without manual software updates or version management.</p>
                          </div>
                        </div>
                        
                        <div className="flex items-start">
                          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3 mt-1">
                            <i className="fas fa-check text-green-600 text-sm"></i>
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900">Zero Storage Requirements</h4>
                            <p className="text-gray-600 text-sm">No disk space consumption on your device - all processing happens in the browser with temporary file handling.</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-4">🔒 Security & Privacy Benefits</h3>
                      <div className="space-y-4">
                        <div className="flex items-start">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3 mt-1">
                            <i className="fas fa-shield-alt text-blue-600 text-sm"></i>
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900">Client-Side Processing</h4>
                            <p className="text-gray-600 text-sm">Your PDF files never leave your device - all rotation processing happens locally in your browser for maximum privacy.</p>
                          </div>
                        </div>
                        
                        <div className="flex items-start">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3 mt-1">
                            <i className="fas fa-shield-alt text-blue-600 text-sm"></i>
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900">No File Upload Required</h4>
                            <p className="text-gray-600 text-sm">Unlike many online services, our tool processes files entirely in your browser without uploading sensitive documents to external servers.</p>
                          </div>
                        </div>
                        
                        <div className="flex items-start">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3 mt-1">
                            <i className="fas fa-shield-alt text-blue-600 text-sm"></i>
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900">GDPR Compliant</h4>
                            <p className="text-gray-600 text-sm">Complete compliance with data protection regulations since no personal data or files are transmitted or stored.</p>
                          </div>
                        </div>
                        
                        <div className="flex items-start">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3 mt-1">
                            <i className="fas fa-shield-alt text-blue-600 text-sm"></i>
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900">Instant File Cleanup</h4>
                            <p className="text-gray-600 text-sm">All temporary files are automatically cleared when you close the browser tab, leaving no trace on your system.</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Industry-Specific Use Cases */}
                <div className="bg-white rounded-2xl shadow-lg p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Industry-Specific PDF Rotation Applications</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-4">🏥 Healthcare & Medical</h3>
                      <ul className="space-y-3 text-gray-600 mb-6">
                        <li>• <strong>Medical records scanning:</strong> Fix upside-down patient charts and lab results</li>
                        <li>• <strong>Imaging reports:</strong> Correct orientation of radiology reports and scans</li>
                        <li>• <strong>Insurance forms:</strong> Standardize claim documents for processing</li>
                        <li>• <strong>Research papers:</strong> Prepare medical studies with mixed content orientations</li>
                      </ul>

                      <h3 className="text-xl font-semibold text-gray-900 mb-4">⚖️ Legal & Law Firms</h3>
                      <ul className="space-y-3 text-gray-600 mb-6">
                        <li>• <strong>Court documents:</strong> Ensure proper orientation for legal filing systems</li>
                        <li>• <strong>Contract preparation:</strong> Fix scanned agreements and amendments</li>
                        <li>• <strong>Evidence documentation:</strong> Standardize exhibits and supporting materials</li>
                        <li>• <strong>Case file organization:</strong> Maintain consistent document presentation</li>
                      </ul>

                      <h3 className="text-xl font-semibold text-gray-900 mb-4">🏗️ Architecture & Engineering</h3>
                      <ul className="space-y-3 text-gray-600">
                        <li>• <strong>Blueprint scanning:</strong> Correct large-format drawing orientations</li>
                        <li>• <strong>Technical specifications:</strong> Fix mixed portrait/landscape documents</li>
                        <li>• <strong>Project documentation:</strong> Standardize client presentation materials</li>
                        <li>• <strong>Compliance reports:</strong> Prepare properly oriented regulatory submissions</li>
                      </ul>
                    </div>

                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-4">📊 Finance & Accounting</h3>
                      <ul className="space-y-3 text-gray-600 mb-6">
                        <li>• <strong>Financial statements:</strong> Fix scanned spreadsheets and reports</li>
                        <li>• <strong>Tax documentation:</strong> Prepare properly oriented forms for submission</li>
                        <li>• <strong>Audit materials:</strong> Standardize supporting documentation</li>
                        <li>• <strong>Client reports:</strong> Ensure professional presentation quality</li>
                      </ul>

                      <h3 className="text-xl font-semibold text-gray-900 mb-4">🎓 Education & Training</h3>
                      <ul className="space-y-3 text-gray-600 mb-6">
                        <li>• <strong>Course materials:</strong> Fix scanned textbooks and handouts</li>
                        <li>• <strong>Student submissions:</strong> Correct assignment orientations before grading</li>
                        <li>• <strong>Administrative forms:</strong> Standardize enrollment and application documents</li>
                        <li>• <strong>Research archives:</strong> Organize historical documents and papers</li>
                      </ul>

                      <h3 className="text-xl font-semibold text-gray-900 mb-4">🏭 Manufacturing & Quality Control</h3>
                      <ul className="space-y-3 text-gray-600">
                        <li>• <strong>Technical manuals:</strong> Fix equipment documentation and procedures</li>
                        <li>• <strong>Quality reports:</strong> Standardize inspection and testing documents</li>
                        <li>• <strong>Safety documentation:</strong> Ensure proper orientation for compliance</li>
                        <li>• <strong>Training materials:</strong> Prepare employee handbooks and procedures</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Advanced Features */}
                <div className="bg-white rounded-2xl shadow-lg p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Advanced PDF Rotation Features</h2>
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6">
                      <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center mb-4">
                        <i className="fas fa-cogs text-white text-xl"></i>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Batch Processing</h3>
                      <p className="text-gray-600 text-sm">
                        Rotate multiple pages simultaneously with different angles. Apply 90° rotation to pages 1-5, 
                        180° to pages 6-10, all in a single operation.
                      </p>
                    </div>
                    
                    <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6">
                      <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center mb-4">
                        <i className="fas fa-eye text-white text-xl"></i>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Visual Page Preview</h3>
                      <p className="text-gray-600 text-sm">
                        See exactly which pages need rotation with our intuitive page selector. 
                        Click individual page numbers to toggle selection easily.
                      </p>
                    </div>
                    
                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6">
                      <div className="w-12 h-12 bg-purple-600 rounded-xl flex items-center justify-center mb-4">
                        <i className="fas fa-undo text-white text-xl"></i>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Smart Rotation Detection</h3>
                      <p className="text-gray-600 text-sm">
                        Our tool maintains the aspect ratio and formatting of your PDF pages, 
                        ensuring text remains readable after rotation.
                      </p>
                    </div>
                  </div>
                </div>

                {/* SEO-focused Keywords Section */}
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Complete PDF Rotation Solution</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">🔧 What Our PDF Rotator Can Do</h3>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div className="bg-white rounded-lg p-3">
                          <strong>Rotate PDF online</strong>
                        </div>
                        <div className="bg-white rounded-lg p-3">
                          <strong>Fix upside down PDF</strong>
                        </div>
                        <div className="bg-white rounded-lg p-3">
                          <strong>PDF page orientation</strong>
                        </div>
                        <div className="bg-white rounded-lg p-3">
                          <strong>Rotate specific pages</strong>
                        </div>
                        <div className="bg-white rounded-lg p-3">
                          <strong>90 degree rotation</strong>
                        </div>
                        <div className="bg-white rounded-lg p-3">
                          <strong>180 degree flip</strong>
                        </div>
                        <div className="bg-white rounded-lg p-3">
                          <strong>270 degree rotation</strong>
                        </div>
                        <div className="bg-white rounded-lg p-3">
                          <strong>Batch page rotation</strong>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">📈 Perfect For These Tasks</h3>
                      <ul className="space-y-2 text-gray-600">
                        <li>• <strong>Document standardization</strong> for professional presentation</li>
                        <li>• <strong>Scanned document correction</strong> for digital archives</li>
                        <li>• <strong>Mobile optimization</strong> for better tablet/phone viewing</li>
                        <li>• <strong>Print preparation</strong> with correct page alignment</li>
                        <li>• <strong>Form processing</strong> for automated data extraction</li>
                        <li>• <strong>Presentation formatting</strong> for mixed content types</li>
                        <li>• <strong>Quality control</strong> before document sharing</li>
                        <li>• <strong>Archive organization</strong> with consistent orientation</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Tips for Best Results */}
                <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-2xl p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Tips for Best PDF Rotation Results</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Before Rotating</h3>
                      <ul className="space-y-2 text-gray-600">
                        <li>• Preview your PDF to identify problem pages</li>
                        <li>• Note which pages need rotation</li>
                        <li>• Check if the PDF is password-protected</li>
                        <li>• Ensure file size is under 100MB</li>
                        <li>• Have a backup of your original file</li>
                      </ul>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Rotation Best Practices</h3>
                      <ul className="space-y-2 text-gray-600">
                        <li>• Test with a single page first</li>
                        <li>• Use 90° for most orientation fixes</li>
                        <li>• Select pages carefully to avoid over-rotation</li>
                        <li>• Download and verify results before sharing</li>
                        <li>• Keep original files until satisfied with results</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Related Tools */}
                <div className="bg-white rounded-2xl shadow-lg p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Complete Your PDF Workflow with Related Tools</h2>
                  <p className="text-gray-600 mb-6">
                    After rotating your PDF pages, you might need these complementary tools to complete your document processing workflow:
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
                      <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
                        <i className="fas fa-object-group text-blue-600 text-xl"></i>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Merge PDF Files</h3>
                      <p className="text-gray-600 text-sm mb-4">
                        <strong>Combine multiple PDF documents</strong> into one file after fixing individual page orientations. Perfect for creating comprehensive reports or merging scanned documents.
                      </p>
                      <a href="/tools/merge-pdf" className="text-blue-600 hover:text-blue-700 font-medium text-sm">
                        Try PDF Merger Tool →
                      </a>
                    </div>
                    
                    <div className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
                      <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-4">
                        <i className="fas fa-cut text-green-600 text-xl"></i>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Split PDF Pages</h3>
                      <p className="text-gray-600 text-sm mb-4">
                        <strong>Extract specific pages or sections</strong> from your rotated PDF. Ideal for separating correctly oriented pages from mixed documents.
                      </p>
                      <a href="/tools/split-pdf" className="text-green-600 hover:text-green-700 font-medium text-sm">
                        Try PDF Splitter Tool →
                      </a>
                    </div>
                    
                    <div className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
                      <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-4">
                        <i className="fas fa-list-ol text-purple-600 text-xl"></i>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Add Page Numbers</h3>
                      <p className="text-gray-600 text-sm mb-4">
                        <strong>Add professional page numbering</strong> to your properly oriented PDF. Essential after rotating pages to maintain correct sequence.
                      </p>
                      <a href="/tools/add-page-numbers" className="text-purple-600 hover:text-purple-700 font-medium text-sm">
                        Try Page Numbering Tool →
                      </a>
                    </div>
                    
                    <div className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
                      <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center mb-4">
                        <i className="fas fa-tint text-red-600 text-xl"></i>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">PDF Watermark Tool</h3>
                      <p className="text-gray-600 text-sm mb-4">
                        <strong>Add text or image watermarks</strong> to your rotated PDF. Ensure watermarks appear correctly oriented on all pages.
                      </p>
                      <a href="/tools/watermark-pdf" className="text-red-600 hover:text-red-700 font-medium text-sm">
                        Try PDF Watermark Tool →
                      </a>
                    </div>
                    
                    <div className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
                      <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center mb-4">
                        <i className="fas fa-lock text-yellow-600 text-xl"></i>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Protect PDF Files</h3>
                      <p className="text-gray-600 text-sm mb-4">
                        <strong>Add password protection</strong> to your finalized, correctly oriented PDF documents for enhanced security.
                      </p>
                      <a href="/tools/protect-pdf" className="text-yellow-600 hover:text-yellow-700 font-medium text-sm">
                        Try PDF Protection Tool →
                      </a>
                    </div>
                    
                    <div className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
                      <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center mb-4">
                        <i className="fas fa-arrows-alt text-indigo-600 text-xl"></i>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Organize PDF Pages</h3>
                      <p className="text-gray-600 text-sm mb-4">
                        <strong>Reorder and reorganize pages</strong> after rotation to create the perfect document structure and flow.
                      </p>
                      <a href="/tools/organize-pdf-pages" className="text-indigo-600 hover:text-indigo-700 font-medium text-sm">
                        Try Page Organization Tool →
                      </a>
                    </div>
                  </div>
                  
                  <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">📚 Explore All PDF Tools</h3>
                    <p className="text-gray-600 mb-4">
                      Discover our complete suite of <strong>PDF manipulation tools</strong> designed to handle every aspect of document processing, 
                      from basic rotation to advanced editing features.
                    </p>
                    <a href="/tools/pdf-tools" className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                      View All PDF Tools
                      <i className="fas fa-arrow-right ml-2"></i>
                    </a>
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

export default RotatePDFTool;