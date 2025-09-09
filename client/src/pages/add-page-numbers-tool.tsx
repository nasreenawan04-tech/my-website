import { useState, useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Upload, FileText, Download, Trash2, Hash, Settings, Palette } from 'lucide-react';

interface PDFFile {
  id: string;
  file: File;
  name: string;
  size: string;
}

interface NumberingOptions {
  position: string;
  startNumber: number;
  fontSize: number;
  fontColor: string;
  marginX: number;
  marginY: number;
  skipFirstPage: boolean;
}

const AddPageNumbersTool = () => {
  const [pdfFile, setPdfFile] = useState<PDFFile | null>(null);
  const [numberedPdfUrl, setNumberedPdfUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [numberingOptions, setNumberingOptions] = useState<NumberingOptions>({
    position: 'bottom-center',
    startNumber: 1,
    fontSize: 12,
    fontColor: '#000000',
    marginX: 50,
    marginY: 30,
    skipFirstPage: false
  });
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

  const handleFileSelect = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const file = files[0];
    if (file.type === 'application/pdf') {
      setPdfFile({
        id: generateId(),
        file,
        name: file.name,
        size: formatFileSize(file.size)
      });
      setNumberedPdfUrl(null);
    } else {
      alert('Please select a valid PDF file.');
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

  const addPageNumbers = async () => {
    if (!pdfFile) return;

    setIsProcessing(true);
    
    try {
      const formData = new FormData();
      formData.append('pdf', pdfFile.file);
      formData.append('position', numberingOptions.position);
      formData.append('startNumber', numberingOptions.startNumber.toString());
      formData.append('fontSize', numberingOptions.fontSize.toString());
      formData.append('fontColor', numberingOptions.fontColor);
      formData.append('marginX', numberingOptions.marginX.toString());
      formData.append('marginY', numberingOptions.marginY.toString());
      formData.append('skipFirstPage', numberingOptions.skipFirstPage.toString());
      
      const response = await fetch('/api/add-page-numbers', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Server error: ${response.status}`);
      }

      const numberedBlob = await response.blob();
      const url = URL.createObjectURL(numberedBlob);
      setNumberedPdfUrl(url);
      
    } catch (error) {
      console.error('Error adding page numbers:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      
      // Provide specific guidance for encryption errors
      if (errorMessage.toLowerCase().includes('encrypt') || errorMessage.toLowerCase().includes('password')) {
        alert(`The PDF is password-protected or encrypted. Please use the "Unlock PDF" tool first to remove the password protection, then try adding page numbers again.`);
      } else if (errorMessage.toLowerCase().includes('invalid') || errorMessage.toLowerCase().includes('corrupt')) {
        alert(`The PDF file appears to be invalid or corrupted. Please try with a different PDF file.`);
      } else {
        alert(`Error adding page numbers: ${errorMessage}. Please try again with a valid PDF file.`);
      }
    }

    setIsProcessing(false);
  };

  const downloadNumberedPDF = () => {
    if (!numberedPdfUrl || !pdfFile) return;

    const link = document.createElement('a');
    link.href = numberedPdfUrl;
    link.download = `numbered-${pdfFile.name}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const resetTool = () => {
    setPdfFile(null);
    setNumberedPdfUrl(null);
    setNumberingOptions({
      position: 'bottom-center',
      startNumber: 1,
      fontSize: 12,
      fontColor: '#000000',
      marginX: 50,
      marginY: 30,
      skipFirstPage: false
    });
    if (numberedPdfUrl) {
      URL.revokeObjectURL(numberedPdfUrl);
    }
  };

  const positionOptions = [
    { value: 'top-left', label: 'Top Left' },
    { value: 'top-center', label: 'Top Center' },
    { value: 'top-right', label: 'Top Right' },
    { value: 'bottom-left', label: 'Bottom Left' },
    { value: 'bottom-center', label: 'Bottom Center' },
    { value: 'bottom-right', label: 'Bottom Right' }
  ];

  return (
    <>
      <Helmet>
        <title>Add Page Numbers to PDF - Free Online PDF Tool | ToolsHub</title>
        <meta name="description" content="Add page numbers to PDF documents for free. Customize position, font size, color, and starting number. Professional PDF page numbering tool." />
        <meta name="keywords" content="add page numbers PDF, PDF page numbering, number PDF pages, PDF pagination, add numbers to PDF online" />
        <meta property="og:title" content="Add Page Numbers to PDF - Free Online PDF Tool | ToolsHub" />
        <meta property="og:description" content="Add customizable page numbers to PDF documents for free. Choose position, font, and styling options." />
        <meta property="og:type" content="website" />
        <link rel="canonical" href="/tools/add-page-numbers" />
      </Helmet>

      <div className="min-h-screen flex flex-col" data-testid="page-add-page-numbers">
        <Header />
        
        <main className="flex-1 bg-neutral-50">
          {/* Hero Section */}
          <section className="bg-gradient-to-r from-purple-600 via-purple-500 to-indigo-700 text-white py-16">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <div className="w-20 h-20 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Hash className="w-8 h-8" />
              </div>
              <h1 className="text-4xl sm:text-5xl font-bold mb-6" data-testid="text-page-title">
                Add Page Numbers to PDF
              </h1>
              <p className="text-xl text-purple-100 max-w-2xl mx-auto">
                Add professional page numbers to your PDF documents. Customize position, font size, color, and starting number.
              </p>
            </div>
          </section>

          {/* Tool Section */}
          <section className="py-16">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Upload Section */}
                <Card className="bg-white shadow-sm border-0">
                  <CardContent className="p-8">
                    <h2 className="text-2xl font-semibold text-gray-900 mb-6">Select PDF File</h2>
                    
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
                        or click to select a PDF from your computer
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

                    {/* Selected File */}
                    {pdfFile && (
                      <div className="mt-6">
                        <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                          <FileText className="w-6 h-6 text-purple-600" />
                          <div className="flex-1">
                            <div className="font-medium text-gray-900">{pdfFile.name}</div>
                            <div className="text-sm text-gray-600">{pdfFile.size}</div>
                          </div>
                          <Button
                            onClick={resetTool}
                            variant="outline"
                            size="sm"
                            className="text-purple-600 border-purple-200 hover:bg-purple-50"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Remove
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Settings Section */}
                <Card className="bg-white shadow-sm border-0">
                  <CardContent className="p-8">
                    <h2 className="text-2xl font-semibold text-gray-900 mb-6">Page Number Settings</h2>
                    
                    <div className="space-y-6">
                      {/* Position */}
                      <div>
                        <Label className="text-sm font-medium text-gray-700 mb-2 block">
                          Position
                        </Label>
                        <Select
                          value={numberingOptions.position}
                          onValueChange={(value) => 
                            setNumberingOptions(prev => ({ ...prev, position: value }))
                          }
                        >
                          <SelectTrigger data-testid="select-position">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {positionOptions.map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Start Number */}
                      <div>
                        <Label htmlFor="start-number" className="text-sm font-medium text-gray-700">
                          Starting Number
                        </Label>
                        <Input
                          id="start-number"
                          type="number"
                          min="1"
                          value={numberingOptions.startNumber}
                          onChange={(e) => 
                            setNumberingOptions(prev => ({ 
                              ...prev, 
                              startNumber: parseInt(e.target.value) || 1 
                            }))
                          }
                          className="mt-1"
                          data-testid="input-start-number"
                        />
                      </div>

                      {/* Font Size */}
                      <div>
                        <Label htmlFor="font-size" className="text-sm font-medium text-gray-700">
                          Font Size
                        </Label>
                        <Input
                          id="font-size"
                          type="number"
                          min="6"
                          max="48"
                          value={numberingOptions.fontSize}
                          onChange={(e) => 
                            setNumberingOptions(prev => ({ 
                              ...prev, 
                              fontSize: parseInt(e.target.value) || 12 
                            }))
                          }
                          className="mt-1"
                          data-testid="input-font-size"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Font size in points (6-48)
                        </p>
                      </div>

                      {/* Font Color */}
                      <div>
                        <Label htmlFor="font-color" className="text-sm font-medium text-gray-700">
                          Font Color
                        </Label>
                        <div className="flex items-center gap-3 mt-1">
                          <input
                            id="font-color"
                            type="color"
                            value={numberingOptions.fontColor}
                            onChange={(e) => 
                              setNumberingOptions(prev => ({ 
                                ...prev, 
                                fontColor: e.target.value 
                              }))
                            }
                            className="w-12 h-10 border border-gray-300 rounded-md cursor-pointer"
                            data-testid="input-font-color"
                          />
                          <Input
                            type="text"
                            value={numberingOptions.fontColor}
                            onChange={(e) => 
                              setNumberingOptions(prev => ({ 
                                ...prev, 
                                fontColor: e.target.value 
                              }))
                            }
                            className="flex-1"
                            placeholder="#000000"
                          />
                        </div>
                      </div>

                      {/* Margins */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="margin-x" className="text-sm font-medium text-gray-700">
                            Horizontal Margin
                          </Label>
                          <Input
                            id="margin-x"
                            type="number"
                            min="0"
                            max="200"
                            value={numberingOptions.marginX}
                            onChange={(e) => 
                              setNumberingOptions(prev => ({ 
                                ...prev, 
                                marginX: parseInt(e.target.value) || 50 
                              }))
                            }
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label htmlFor="margin-y" className="text-sm font-medium text-gray-700">
                            Vertical Margin
                          </Label>
                          <Input
                            id="margin-y"
                            type="number"
                            min="0"
                            max="200"
                            value={numberingOptions.marginY}
                            onChange={(e) => 
                              setNumberingOptions(prev => ({ 
                                ...prev, 
                                marginY: parseInt(e.target.value) || 30 
                              }))
                            }
                            className="mt-1"
                          />
                        </div>
                      </div>

                      {/* Skip First Page */}
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="skip-first-page"
                          checked={numberingOptions.skipFirstPage}
                          onCheckedChange={(checked) => 
                            setNumberingOptions(prev => ({ 
                              ...prev, 
                              skipFirstPage: !!checked 
                            }))
                          }
                          data-testid="checkbox-skip-first"
                        />
                        <Label htmlFor="skip-first-page" className="text-sm text-gray-700">
                          Skip first page (useful for cover pages)
                        </Label>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Process Section */}
              {pdfFile && (
                <div className="mt-8 text-center">
                  <Button
                    onClick={addPageNumbers}
                    disabled={isProcessing}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 text-lg"
                    data-testid="button-add-numbers"
                  >
                    {isProcessing ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Adding Page Numbers...
                      </>
                    ) : (
                      <>
                        <Hash className="w-4 h-4 mr-2" />
                        Add Page Numbers
                      </>
                    )}
                  </Button>
                </div>
              )}

              {/* Results Section */}
              {numberedPdfUrl && (
                <div className="mt-8">
                  <Card className="bg-green-50 border-green-200">
                    <CardContent className="p-6 text-center">
                      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Hash className="w-8 h-8 text-green-600" />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        Page Numbers Added Successfully!
                      </h3>
                      <p className="text-gray-600 mb-4">
                        Your PDF now has page numbers with your selected styling and position.
                      </p>
                      <div className="text-sm text-gray-600 mb-6 p-3 bg-green-100 rounded-lg">
                        <p className="font-medium mb-2">Applied Settings:</p>
                        <ul className="space-y-1 text-xs">
                          <li>✓ Position: {positionOptions.find(p => p.value === numberingOptions.position)?.label}</li>
                          <li>✓ Starting from: {numberingOptions.startNumber}</li>
                          <li>✓ Font size: {numberingOptions.fontSize}pt</li>
                          <li>✓ Color: {numberingOptions.fontColor}</li>
                          {numberingOptions.skipFirstPage && <li>✓ First page skipped</li>}
                        </ul>
                      </div>
                      <Button
                        onClick={downloadNumberedPDF}
                        className="bg-green-600 hover:bg-green-700 text-white px-6 py-3"
                        data-testid="button-download"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download PDF with Page Numbers
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Educational Content */}
              <div className="mt-12 space-y-8">
                {/* Benefits Section */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Why Add Page Numbers to Your PDF Documents?</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="text-center">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                        <Hash className="w-6 h-6 text-blue-600" />
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-2">Professional Appearance</h3>
                      <p className="text-gray-600 text-sm">Make your documents look polished and organized for business presentations.</p>
                    </div>
                    <div className="text-center">
                      <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                        <FileText className="w-6 h-6 text-green-600" />
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-2">Easy Navigation</h3>
                      <p className="text-gray-600 text-sm">Help readers quickly find and reference specific pages in lengthy documents.</p>
                    </div>
                    <div className="text-center">
                      <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                        <Settings className="w-6 h-6 text-purple-600" />
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-2">Academic Standards</h3>
                      <p className="text-gray-600 text-sm">Meet academic and professional formatting requirements for reports and papers.</p>
                    </div>
                    <div className="text-center">
                      <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                        <Palette className="w-6 h-6 text-orange-600" />
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-2">Document Organization</h3>
                      <p className="text-gray-600 text-sm">Keep multi-page documents organized and maintain proper sequence order.</p>
                    </div>
                  </div>
                </div>

                {/* How it Works */}
                <div className="bg-white rounded-2xl shadow-lg p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">How to Add Page Numbers to PDF</h2>
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
                        <Settings className="w-8 h-8 text-blue-600" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">2. Customize</h3>
                      <p className="text-gray-600">
                        Choose position, font size, color, and starting number for your page numbers.
                      </p>
                    </div>
                    
                    <div className="text-center">
                      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Download className="w-8 h-8 text-green-600" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">3. Download</h3>
                      <p className="text-gray-600">
                        Click to add page numbers and download your numbered PDF instantly.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Features */}
                <div className="bg-white rounded-2xl shadow-lg p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Page Numbering Features</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Hash className="w-4 h-4 text-purple-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-1">Flexible Positioning</h3>
                        <p className="text-gray-600 text-sm">
                          Place page numbers at any corner or center position - top or bottom, left, center, or right.
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Palette className="w-4 h-4 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-1">Custom Styling</h3>
                        <p className="text-gray-600 text-sm">
                          Choose font size, color, and margins to match your document's design perfectly.
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Settings className="w-4 h-4 text-green-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-1">Smart Options</h3>
                        <p className="text-gray-600 text-sm">
                          Start from any number and optionally skip the first page for cover pages.
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <FileText className="w-4 h-4 text-orange-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-1">Professional Quality</h3>
                        <p className="text-gray-600 text-sm">
                          Add professional-looking page numbers that won't affect your PDF's original formatting.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Use Cases */}
                <div className="bg-white rounded-2xl shadow-lg p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Common Use Cases for PDF Page Numbering</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Academic Documents</h3>
                      <ul className="space-y-2 text-gray-600">
                        <li className="flex items-start gap-2">
                          <span className="w-1.5 h-1.5 bg-purple-600 rounded-full mt-2 flex-shrink-0"></span>
                          Research papers and thesis documents
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="w-1.5 h-1.5 bg-purple-600 rounded-full mt-2 flex-shrink-0"></span>
                          Academic reports and assignments
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="w-1.5 h-1.5 bg-purple-600 rounded-full mt-2 flex-shrink-0"></span>
                          Course materials and handouts
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="w-1.5 h-1.5 bg-purple-600 rounded-full mt-2 flex-shrink-0"></span>
                          Student portfolios and collections
                        </li>
                      </ul>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Business Documents</h3>
                      <ul className="space-y-2 text-gray-600">
                        <li className="flex items-start gap-2">
                          <span className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0"></span>
                          Annual reports and financial statements
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0"></span>
                          Project proposals and contracts
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0"></span>
                          Training manuals and guides
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0"></span>
                          Legal documents and agreements
                        </li>
                      </ul>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Creative Works</h3>
                      <ul className="space-y-2 text-gray-600">
                        <li className="flex items-start gap-2">
                          <span className="w-1.5 h-1.5 bg-green-600 rounded-full mt-2 flex-shrink-0"></span>
                          Books and manuscripts
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="w-1.5 h-1.5 bg-green-600 rounded-full mt-2 flex-shrink-0"></span>
                          Portfolios and lookbooks
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="w-1.5 h-1.5 bg-green-600 rounded-full mt-2 flex-shrink-0"></span>
                          Magazine layouts and catalogs
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="w-1.5 h-1.5 bg-green-600 rounded-full mt-2 flex-shrink-0"></span>
                          Photo albums and collections
                        </li>
                      </ul>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Technical Documentation</h3>
                      <ul className="space-y-2 text-gray-600">
                        <li className="flex items-start gap-2">
                          <span className="w-1.5 h-1.5 bg-orange-600 rounded-full mt-2 flex-shrink-0"></span>
                          User manuals and instructions
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="w-1.5 h-1.5 bg-orange-600 rounded-full mt-2 flex-shrink-0"></span>
                          API documentation and guides
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="w-1.5 h-1.5 bg-orange-600 rounded-full mt-2 flex-shrink-0"></span>
                          Technical specifications
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="w-1.5 h-1.5 bg-orange-600 rounded-full mt-2 flex-shrink-0"></span>
                          Software documentation
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Advanced Tips */}
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Professional Page Numbering Tips</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Best Practices</h3>
                      <div className="space-y-3">
                        <div className="flex items-start gap-3">
                          <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span className="text-green-600 text-xs font-bold">✓</span>
                          </div>
                          <p className="text-gray-700 text-sm">
                            <strong>Position Consistency:</strong> Use the same position throughout your document for professional appearance.
                          </p>
                        </div>
                        <div className="flex items-start gap-3">
                          <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span className="text-green-600 text-xs font-bold">✓</span>
                          </div>
                          <p className="text-gray-700 text-sm">
                            <strong>Font Size:</strong> Use 10-12pt for readability without being too prominent.
                          </p>
                        </div>
                        <div className="flex items-start gap-3">
                          <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span className="text-green-600 text-xs font-bold">✓</span>
                          </div>
                          <p className="text-gray-700 text-sm">
                            <strong>Cover Pages:</strong> Skip numbering on title pages and table of contents when appropriate.
                          </p>
                        </div>
                        <div className="flex items-start gap-3">
                          <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span className="text-green-600 text-xs font-bold">✓</span>
                          </div>
                          <p className="text-gray-700 text-sm">
                            <strong>Margin Space:</strong> Ensure adequate margin space to prevent overlapping with content.
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Common Mistakes to Avoid</h3>
                      <div className="space-y-3">
                        <div className="flex items-start gap-3">
                          <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span className="text-red-600 text-xs font-bold">✗</span>
                          </div>
                          <p className="text-gray-700 text-sm">
                            <strong>Inconsistent Positioning:</strong> Changing page number locations throughout the document.
                          </p>
                        </div>
                        <div className="flex items-start gap-3">
                          <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span className="text-red-600 text-xs font-bold">✗</span>
                          </div>
                          <p className="text-gray-700 text-sm">
                            <strong>Overlapping Content:</strong> Placing numbers where they cover important text or images.
                          </p>
                        </div>
                        <div className="flex items-start gap-3">
                          <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span className="text-red-600 text-xs font-bold">✗</span>
                          </div>
                          <p className="text-gray-700 text-sm">
                            <strong>Wrong Font Size:</strong> Making numbers too large (distracting) or too small (unreadable).
                          </p>
                        </div>
                        <div className="flex items-start gap-3">
                          <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span className="text-red-600 text-xs font-bold">✗</span>
                          </div>
                          <p className="text-gray-700 text-sm">
                            <strong>Poor Color Choice:</strong> Using colors that don't contrast well with the background.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Comparison Section */}
                <div className="bg-white rounded-2xl shadow-lg p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Why Choose Our PDF Page Number Tool?</h2>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-left py-3 px-4 font-semibold text-gray-900">Feature</th>
                          <th className="text-center py-3 px-4 font-semibold text-green-600">Our Tool</th>
                          <th className="text-center py-3 px-4 font-semibold text-gray-500">Desktop Software</th>
                          <th className="text-center py-3 px-4 font-semibold text-gray-500">Other Online Tools</th>
                        </tr>
                      </thead>
                      <tbody className="text-sm">
                        <tr className="border-b border-gray-100">
                          <td className="py-3 px-4 text-gray-700">Free to use</td>
                          <td className="py-3 px-4 text-center text-green-600">✓</td>
                          <td className="py-3 px-4 text-center text-red-500">✗</td>
                          <td className="py-3 px-4 text-center text-yellow-500">Limited</td>
                        </tr>
                        <tr className="border-b border-gray-100">
                          <td className="py-3 px-4 text-gray-700">No installation required</td>
                          <td className="py-3 px-4 text-center text-green-600">✓</td>
                          <td className="py-3 px-4 text-center text-red-500">✗</td>
                          <td className="py-3 px-4 text-center text-green-500">✓</td>
                        </tr>
                        <tr className="border-b border-gray-100">
                          <td className="py-3 px-4 text-gray-700">Multiple position options</td>
                          <td className="py-3 px-4 text-center text-green-600">✓</td>
                          <td className="py-3 px-4 text-center text-green-500">✓</td>
                          <td className="py-3 px-4 text-center text-yellow-500">Limited</td>
                        </tr>
                        <tr className="border-b border-gray-100">
                          <td className="py-3 px-4 text-gray-700">Custom font styling</td>
                          <td className="py-3 px-4 text-center text-green-600">✓</td>
                          <td className="py-3 px-4 text-center text-green-500">✓</td>
                          <td className="py-3 px-4 text-center text-red-500">✗</td>
                        </tr>
                        <tr className="border-b border-gray-100">
                          <td className="py-3 px-4 text-gray-700">Secure processing</td>
                          <td className="py-3 px-4 text-center text-green-600">✓</td>
                          <td className="py-3 px-4 text-center text-green-500">✓</td>
                          <td className="py-3 px-4 text-center text-yellow-500">Varies</td>
                        </tr>
                        <tr>
                          <td className="py-3 px-4 text-gray-700">Instant processing</td>
                          <td className="py-3 px-4 text-center text-green-600">✓</td>
                          <td className="py-3 px-4 text-center text-yellow-500">Varies</td>
                          <td className="py-3 px-4 text-center text-yellow-500">Varies</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* FAQ */}
                <div className="bg-white rounded-2xl shadow-lg p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Frequently Asked Questions</h2>
                  <div className="space-y-6">
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">Can I customize the appearance of page numbers?</h3>
                      <p className="text-gray-600 text-sm">
                        Yes! You can choose the position (6 options including top-left, bottom-center, etc.), font size (6-48pt), 
                        color (any hex color), margins, and starting number. You can also skip the first page if needed.
                      </p>
                    </div>
                    
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">Will page numbers overwrite existing content?</h3>
                      <p className="text-gray-600 text-sm">
                        Page numbers are overlaid on top of existing content. Use the margin settings to position 
                        them in empty areas of your pages to avoid overlapping with text or images. We recommend testing 
                        with small margins first to find the optimal placement.
                      </p>
                    </div>
                    
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">What file formats are supported?</h3>
                      <p className="text-gray-600 text-sm">
                        Our tool supports standard PDF files (.pdf). We support both text-based and image-based PDFs, 
                        with files up to 50MB in size. Most documents process within seconds.
                      </p>
                    </div>
                    
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">Can I start numbering from a specific page?</h3>
                      <p className="text-gray-600 text-sm">
                        Yes! You can set any starting number and optionally skip the first page. This is useful for documents 
                        with cover pages or when continuing numbering from a previous document section.
                      </p>
                    </div>
                    
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">Is my PDF kept secure?</h3>
                      <p className="text-gray-600 text-sm">
                        Absolutely! All uploaded files are automatically deleted from our servers immediately after processing. 
                        We use secure HTTPS connections and don't store any of your documents for privacy and security.
                      </p>
                    </div>
                    
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">Can I add page numbers to password-protected PDFs?</h3>
                      <p className="text-gray-600 text-sm">
                        No, password-protected or encrypted PDFs need to be unlocked first. Use our "Unlock PDF" tool 
                        to remove password protection, then add page numbers using this tool.
                      </p>
                    </div>
                    
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">What happens to the original PDF quality?</h3>
                      <p className="text-gray-600 text-sm">
                        The original PDF quality is preserved. We only add the page number overlay without modifying 
                        the existing content, images, or formatting of your document.
                      </p>
                    </div>
                    
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">Can I undo page numbering once applied?</h3>
                      <p className="text-gray-600 text-sm">
                        Once page numbers are added, they become part of the PDF content and cannot be automatically removed. 
                        We recommend keeping a backup of your original file before adding page numbers.
                      </p>
                    </div>
                  </div>
                </div>

                {/* SEO Content - Related Tools */}
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Related PDF Tools</h2>
                  <p className="text-gray-600 mb-6">
                    Enhance your PDF workflow with our comprehensive suite of PDF editing and manipulation tools.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white rounded-lg p-4 shadow-sm">
                      <h3 className="font-semibold text-gray-900 mb-2">PDF Header & Footer Generator</h3>
                      <p className="text-gray-600 text-sm mb-3">
                        Add professional headers and footers with custom text, dates, and page numbers.
                      </p>
                      <a href="/tools/pdf-header-footer-generator" className="text-purple-600 hover:text-purple-700 text-sm font-medium">
                        Try Header & Footer Tool →
                      </a>
                    </div>
                    
                    <div className="bg-white rounded-lg p-4 shadow-sm">
                      <h3 className="font-semibold text-gray-900 mb-2">PDF Margin Adjuster</h3>
                      <p className="text-gray-600 text-sm mb-3">
                        Adjust margins and spacing to create room for page numbers and improve layout.
                      </p>
                      <a href="/tools/pdf-margin-adjuster" className="text-purple-600 hover:text-purple-700 text-sm font-medium">
                        Try Margin Adjuster →
                      </a>
                    </div>
                    
                    <div className="bg-white rounded-lg p-4 shadow-sm">
                      <h3 className="font-semibold text-gray-900 mb-2">Organize PDF Pages</h3>
                      <p className="text-gray-600 text-sm mb-3">
                        Reorder, remove, or duplicate pages before adding numbers for perfect organization.
                      </p>
                      <a href="/tools/organize-pdf-pages" className="text-purple-600 hover:text-purple-700 text-sm font-medium">
                        Try Page Organizer →
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

export default AddPageNumbersTool;