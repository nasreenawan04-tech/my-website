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
                {/* How it Works */}
                <div className="bg-white rounded-2xl shadow-lg p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">How to Rotate PDF Pages</h2>
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

                {/* Use Cases */}
                <div className="bg-white rounded-2xl shadow-lg p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Common Use Cases</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="bg-orange-50 rounded-lg p-4">
                      <h3 className="font-semibold text-gray-900 mb-2">🔄 Fix Scanned Documents</h3>
                      <p className="text-sm text-gray-600">Correct orientation of scanned pages that are upside down.</p>
                    </div>
                    
                    <div className="bg-blue-50 rounded-lg p-4">
                      <h3 className="font-semibold text-gray-900 mb-2">📱 Mobile Documents</h3>
                      <p className="text-sm text-gray-600">Rotate pages for better mobile viewing experience.</p>
                    </div>
                    
                    <div className="bg-green-50 rounded-lg p-4">
                      <h3 className="font-semibold text-gray-900 mb-2">📊 Presentation Pages</h3>
                      <p className="text-sm text-gray-600">Fix landscape slides in portrait documents.</p>
                    </div>
                    
                    <div className="bg-purple-50 rounded-lg p-4">
                      <h3 className="font-semibold text-gray-900 mb-2">📄 Mixed Orientations</h3>
                      <p className="text-sm text-gray-600">Standardize page orientation in mixed documents.</p>
                    </div>
                    
                    <div className="bg-red-50 rounded-lg p-4">
                      <h3 className="font-semibold text-gray-900 mb-2">📋 Forms & Contracts</h3>
                      <p className="text-sm text-gray-600">Ensure all form pages have correct orientation.</p>
                    </div>
                    
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h3 className="font-semibold text-gray-900 mb-2">🖨️ Print Preparation</h3>
                      <p className="text-sm text-gray-600">Prepare documents for proper printing alignment.</p>
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

export default RotatePDFTool;