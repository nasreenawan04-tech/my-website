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

                {/* Industry Use Cases */}
                <div className="bg-white rounded-2xl shadow-lg p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Professional Industries Using PDF Page Numbers</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    <div>
                      <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mb-4">
                        <i className="fas fa-graduation-cap text-blue-600 text-2xl"></i>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Education & Academia</h3>
                      <ul className="text-gray-600 text-sm space-y-2">
                        <li>• Research papers and dissertations</li>
                        <li>• Course syllabi and reading materials</li>
                        <li>• Student handbooks and guides</li>
                        <li>• Academic presentation materials</li>
                        <li>• Grading rubrics and assessment forms</li>
                      </ul>
                    </div>
                    
                    <div>
                      <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mb-4">
                        <i className="fas fa-briefcase text-green-600 text-2xl"></i>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Business & Corporate</h3>
                      <ul className="text-gray-600 text-sm space-y-2">
                        <li>• Annual reports and financial statements</li>
                        <li>• Employee handbooks and policies</li>
                        <li>• Project proposals and contracts</li>
                        <li>• Training manuals and procedures</li>
                        <li>• Board meeting minutes and agendas</li>
                      </ul>
                    </div>
                    
                    <div>
                      <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mb-4">
                        <i className="fas fa-balance-scale text-purple-600 text-2xl"></i>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Legal & Healthcare</h3>
                      <ul className="text-gray-600 text-sm space-y-2">
                        <li>• Legal briefs and court documents</li>
                        <li>• Medical records and patient files</li>
                        <li>• Compliance documentation</li>
                        <li>• Insurance claim forms</li>
                        <li>• Regulatory submission documents</li>
                      </ul>
                    </div>
                    
                    <div>
                      <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center mb-4">
                        <i className="fas fa-chart-line text-orange-600 text-2xl"></i>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Marketing & Publishing</h3>
                      <ul className="text-gray-600 text-sm space-y-2">
                        <li>• Product catalogs and brochures</li>
                        <li>• Marketing campaign reports</li>
                        <li>• Brand guidelines and style guides</li>
                        <li>• Press kits and media materials</li>
                        <li>• Event programs and schedules</li>
                      </ul>
                    </div>
                    
                    <div>
                      <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mb-4">
                        <i className="fas fa-cogs text-red-600 text-2xl"></i>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Engineering & Technical</h3>
                      <ul className="text-gray-600 text-sm space-y-2">
                        <li>• Technical specifications</li>
                        <li>• User manuals and documentation</li>
                        <li>• Quality assurance reports</li>
                        <li>• Engineering drawings and blueprints</li>
                        <li>• Safety protocols and procedures</li>
                      </ul>
                    </div>
                    
                    <div>
                      <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center mb-4">
                        <i className="fas fa-users text-indigo-600 text-2xl"></i>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Non-Profit & Government</h3>
                      <ul className="text-gray-600 text-sm space-y-2">
                        <li>• Grant applications and reports</li>
                        <li>• Policy documents and white papers</li>
                        <li>• Community outreach materials</li>
                        <li>• Budget proposals and financial plans</li>
                        <li>• Public information documents</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* SEO Benefits Section */}
                <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Why Properly Numbered PDFs Improve Your Professional Image</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Document Credibility Benefits</h3>
                      <div className="space-y-4">
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <i className="fas fa-check text-emerald-600"></i>
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900">Enhanced Professional Appearance</h4>
                            <p className="text-gray-600 text-sm">Page numbers signal attention to detail and professional document preparation standards.</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <i className="fas fa-search text-emerald-600"></i>
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900">Improved Document Navigation</h4>
                            <p className="text-gray-600 text-sm">Readers can quickly reference specific sections and maintain their place in lengthy documents.</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <i className="fas fa-comments text-emerald-600"></i>
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900">Better Collaboration</h4>
                            <p className="text-gray-600 text-sm">Team members can easily reference specific pages during discussions and reviews.</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Compliance & Standards</h3>
                      <div className="space-y-4">
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 bg-teal-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <i className="fas fa-clipboard-check text-teal-600"></i>
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900">Academic Requirements</h4>
                            <p className="text-gray-600 text-sm">Meet university and journal formatting standards for academic submissions and publications.</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 bg-teal-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <i className="fas fa-gavel text-teal-600"></i>
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900">Legal Documentation</h4>
                            <p className="text-gray-600 text-sm">Ensure compliance with legal document formatting requirements and court submission standards.</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 bg-teal-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <i className="fas fa-building text-teal-600"></i>
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900">Corporate Standards</h4>
                            <p className="text-gray-600 text-sm">Maintain consistency with company document formatting guidelines and brand standards.</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Advanced Customization Guide */}
                <div className="bg-white rounded-2xl shadow-lg p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Advanced Page Numbering Techniques</h2>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Position Strategy Guide</h3>
                      <div className="space-y-4">
                        <div className="border border-gray-200 rounded-lg p-4">
                          <h4 className="font-medium text-gray-900 mb-2">Bottom Center (Recommended)</h4>
                          <p className="text-gray-600 text-sm mb-2">Most traditional and professional choice for academic papers, reports, and formal documents.</p>
                          <div className="text-xs text-gray-500">
                            <strong>Best for:</strong> Academic papers, business reports, legal documents
                          </div>
                        </div>
                        
                        <div className="border border-gray-200 rounded-lg p-4">
                          <h4 className="font-medium text-gray-900 mb-2">Top Right</h4>
                          <p className="text-gray-600 text-sm mb-2">Modern choice for technical documentation and user manuals where headers are prominent.</p>
                          <div className="text-xs text-gray-500">
                            <strong>Best for:</strong> Technical manuals, guides, instruction booklets
                          </div>
                        </div>
                        
                        <div className="border border-gray-200 rounded-lg p-4">
                          <h4 className="font-medium text-gray-900 mb-2">Bottom Right</h4>
                          <p className="text-gray-600 text-sm mb-2">Clean option for documents with left-side binding or when avoiding footer content.</p>
                          <div className="text-xs text-gray-500">
                            <strong>Best for:</strong> Bound documents, presentations, portfolios
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Styling Best Practices</h3>
                      <div className="space-y-4">
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                          <h4 className="font-medium text-blue-900 mb-2">Font Size Guidelines</h4>
                          <ul className="text-blue-800 text-sm space-y-1">
                            <li>• <strong>Academic papers:</strong> 10-11pt for subtlety</li>
                            <li>• <strong>Business documents:</strong> 11-12pt for readability</li>
                            <li>• <strong>Presentations:</strong> 12-14pt for visibility</li>
                            <li>• <strong>Large format:</strong> 14-16pt for clarity</li>
                          </ul>
                        </div>
                        
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                          <h4 className="font-medium text-green-900 mb-2">Color Selection Tips</h4>
                          <ul className="text-green-800 text-sm space-y-1">
                            <li>• <strong>Black (#000000):</strong> Classic, professional, always readable</li>
                            <li>• <strong>Dark Gray (#333333):</strong> Softer alternative to black</li>
                            <li>• <strong>Brand Colors:</strong> Match company branding when appropriate</li>
                            <li>• <strong>Avoid:</strong> Light colors, neon, or low contrast combinations</li>
                          </ul>
                        </div>
                        
                        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                          <h4 className="font-medium text-purple-900 mb-2">Margin Optimization</h4>
                          <ul className="text-purple-800 text-sm space-y-1">
                            <li>• <strong>Standard:</strong> 50px horizontal, 30px vertical</li>
                            <li>• <strong>Tight layout:</strong> 30px horizontal, 20px vertical</li>
                            <li>• <strong>Spacious:</strong> 70px horizontal, 50px vertical</li>
                            <li>• <strong>Test:</strong> Preview to ensure no content overlap</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Troubleshooting Guide */}
                <div className="bg-yellow-50 rounded-2xl p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Common Issues & Solutions</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Problem: Numbers Overlap Content</h3>
                      <div className="space-y-3">
                        <div className="flex items-start gap-3">
                          <div className="w-6 h-6 bg-yellow-200 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span className="text-yellow-700 text-xs">1</span>
                          </div>
                          <p className="text-gray-700 text-sm">Increase margin values to push numbers away from content</p>
                        </div>
                        <div className="flex items-start gap-3">
                          <div className="w-6 h-6 bg-yellow-200 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span className="text-yellow-700 text-xs">2</span>
                          </div>
                          <p className="text-gray-700 text-sm">Try different position (e.g., switch from bottom-left to top-right)</p>
                        </div>
                        <div className="flex items-start gap-3">
                          <div className="w-6 h-6 bg-yellow-200 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span className="text-yellow-700 text-xs">3</span>
                          </div>
                          <p className="text-gray-700 text-sm">Use <a href="/tools/pdf-margin-adjuster" className="text-yellow-700 underline">PDF Margin Adjuster</a> to create more space first</p>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Problem: Numbers Too Small/Large</h3>
                      <div className="space-y-3">
                        <div className="flex items-start gap-3">
                          <div className="w-6 h-6 bg-yellow-200 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span className="text-yellow-700 text-xs">1</span>
                          </div>
                          <p className="text-gray-700 text-sm">Adjust font size: 10-12pt for most documents</p>
                        </div>
                        <div className="flex items-start gap-3">
                          <div className="w-6 h-6 bg-yellow-200 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span className="text-yellow-700 text-xs">2</span>
                          </div>
                          <p className="text-gray-700 text-sm">Consider viewing distance: larger for presentations, smaller for print</p>
                        </div>
                        <div className="flex items-start gap-3">
                          <div className="w-6 h-6 bg-yellow-200 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span className="text-yellow-700 text-xs">3</span>
                          </div>
                          <p className="text-gray-700 text-sm">Test with different devices to ensure readability</p>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Problem: Encrypted PDF Error</h3>
                      <div className="space-y-3">
                        <div className="flex items-start gap-3">
                          <div className="w-6 h-6 bg-yellow-200 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span className="text-yellow-700 text-xs">1</span>
                          </div>
                          <p className="text-gray-700 text-sm">Use <a href="/tools/unlock-pdf-tool" className="text-yellow-700 underline">Unlock PDF tool</a> to remove password protection first</p>
                        </div>
                        <div className="flex items-start gap-3">
                          <div className="w-6 h-6 bg-yellow-200 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span className="text-yellow-700 text-xs">2</span>
                          </div>
                          <p className="text-gray-700 text-sm">Contact document owner for unprotected version</p>
                        </div>
                        <div className="flex items-start gap-3">
                          <div className="w-6 h-6 bg-yellow-200 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span className="text-yellow-700 text-xs">3</span>
                          </div>
                          <p className="text-gray-700 text-sm">After adding numbers, re-protect with <a href="/tools/protect-pdf-tool" className="text-yellow-700 underline">Protect PDF tool</a></p>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Problem: Inconsistent Numbering</h3>
                      <div className="space-y-3">
                        <div className="flex items-start gap-3">
                          <div className="w-6 h-6 bg-yellow-200 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span className="text-yellow-700 text-xs">1</span>
                          </div>
                          <p className="text-gray-700 text-sm">Use <a href="/tools/organize-pdf-pages-tool" className="text-yellow-700 underline">Organize PDF Pages</a> to arrange pages first</p>
                        </div>
                        <div className="flex items-start gap-3">
                          <div className="w-6 h-6 bg-yellow-200 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span className="text-yellow-700 text-xs">2</span>
                          </div>
                          <p className="text-gray-700 text-sm">Set appropriate starting number for document sections</p>
                        </div>
                        <div className="flex items-start gap-3">
                          <div className="w-6 h-6 bg-yellow-200 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span className="text-yellow-700 text-xs">3</span>
                          </div>
                          <p className="text-gray-700 text-sm">Consider skipping cover pages and table of contents</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* SEO Content - Related Tools */}
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Complete PDF Editing Workflow</h2>
                  <p className="text-gray-600 mb-6">
                    Streamline your PDF document preparation with our comprehensive suite of professional PDF tools. Create, edit, and optimize your documents with ease.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
                      <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                        <i className="fas fa-object-group text-purple-600 text-xl"></i>
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-2">Merge PDF Documents</h3>
                      <p className="text-gray-600 text-sm mb-3">
                        Combine multiple PDF files into one document before adding consistent page numbering throughout.
                      </p>
                      <a href="/tools/merge-pdf-tool" className="text-purple-600 hover:text-purple-700 text-sm font-medium">
                        Try PDF Merger →
                      </a>
                    </div>
                    
                    <div className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                        <i className="fas fa-cut text-blue-600 text-xl"></i>
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-2">Split PDF Pages</h3>
                      <p className="text-gray-600 text-sm mb-3">
                        Separate large documents into sections, then add appropriate page numbers to each section.
                      </p>
                      <a href="/tools/split-pdf-tool" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                        Try PDF Splitter →
                      </a>
                    </div>
                    
                    <div className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
                      <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                        <i className="fas fa-undo text-green-600 text-xl"></i>
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-2">Rotate PDF Pages</h3>
                      <p className="text-gray-600 text-sm mb-3">
                        Correct page orientation before adding numbers to ensure proper positioning and readability.
                      </p>
                      <a href="/tools/rotate-pdf-tool" className="text-green-600 hover:text-green-700 text-sm font-medium">
                        Try PDF Rotator →
                      </a>
                    </div>
                    
                    <div className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
                      <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                        <i className="fas fa-sort text-indigo-600 text-xl"></i>
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-2">Organize PDF Pages</h3>
                      <p className="text-gray-600 text-sm mb-3">
                        Reorder, remove, or duplicate pages to create the perfect document structure before numbering.
                      </p>
                      <a href="/tools/organize-pdf-pages-tool" className="text-indigo-600 hover:text-indigo-700 text-sm font-medium">
                        Try Page Organizer →
                      </a>
                    </div>
                    
                    <div className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
                      <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                        <i className="fas fa-unlock text-orange-600 text-xl"></i>
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-2">Unlock Protected PDFs</h3>
                      <p className="text-gray-600 text-sm mb-3">
                        Remove password protection from encrypted PDFs to enable page numbering and other modifications.
                      </p>
                      <a href="/tools/unlock-pdf-tool" className="text-orange-600 hover:text-orange-700 text-sm font-medium">
                        Try PDF Unlocker →
                      </a>
                    </div>
                    
                    <div className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
                      <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                        <i className="fas fa-lock text-red-600 text-xl"></i>
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-2">Protect With Password</h3>
                      <p className="text-gray-600 text-sm mb-3">
                        Secure your numbered documents with password protection to prevent unauthorized access or editing.
                      </p>
                      <a href="/tools/protect-pdf-tool" className="text-red-600 hover:text-red-700 text-sm font-medium">
                        Try PDF Protector →
                      </a>
                    </div>
                    
                    <div className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
                      <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center mb-4">
                        <i className="fas fa-tint text-teal-600 text-xl"></i>
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-2">Add Watermarks</h3>
                      <p className="text-gray-600 text-sm mb-3">
                        Brand your numbered documents with custom watermarks for additional professional appearance.
                      </p>
                      <a href="/tools/watermark-pdf-tool" className="text-teal-600 hover:text-teal-700 text-sm font-medium">
                        Try PDF Watermarker →
                      </a>
                    </div>
                    
                    <div className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
                      <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center mb-4">
                        <i className="fas fa-crop text-pink-600 text-xl"></i>
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-2">Adjust PDF Margins</h3>
                      <p className="text-gray-600 text-sm mb-3">
                        Create optimal spacing around your content to ensure page numbers fit perfectly without overlap.
                      </p>
                      <a href="/tools/pdf-margin-adjuster" className="text-pink-600 hover:text-pink-700 text-sm font-medium">
                        Try Margin Adjuster →
                      </a>
                    </div>
                    
                    <div className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
                      <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mb-4">
                        <i className="fas fa-heading text-yellow-600 text-xl"></i>
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-2">Add Headers & Footers</h3>
                      <p className="text-gray-600 text-sm mb-3">
                        Enhance numbered documents with professional headers and footers containing titles, dates, and more.
                      </p>
                      <a href="/tools/pdf-header-footer-generator" className="text-yellow-600 hover:text-yellow-700 text-sm font-medium">
                        Try Header/Footer Tool →
                      </a>
                    </div>
                  </div>
                </div>

                {/* Workflow Integration Guide */}
                <div className="bg-white rounded-2xl shadow-lg p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Professional PDF Workflow Integration</h2>
                  <p className="text-gray-600 mb-8">
                    Follow these step-by-step workflows to create perfectly formatted, professional PDF documents for any industry or use case.
                  </p>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="border border-gray-200 rounded-xl p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">📚 Academic Document Workflow</h3>
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold text-sm">1</div>
                          <span className="text-gray-700">Collect and <a href="/tools/merge-pdf-tool" className="text-blue-600 underline">merge all document sections</a></span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold text-sm">2</div>
                          <span className="text-gray-700"><a href="/tools/organize-pdf-pages-tool" className="text-blue-600 underline">Organize pages</a> in proper order</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold text-sm">3</div>
                          <span className="text-gray-700">Add page numbers (skip cover page)</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold text-sm">4</div>
                          <span className="text-gray-700"><a href="/tools/pdf-header-footer-generator" className="text-blue-600 underline">Add headers/footers</a> with title and date</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold text-sm">5</div>
                          <span className="text-gray-700">Final review and submission</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="border border-gray-200 rounded-xl p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">💼 Business Report Workflow</h3>
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-green-600 font-semibold text-sm">1</div>
                          <span className="text-gray-700">Prepare content sections and <a href="/tools/merge-pdf-tool" className="text-green-600 underline">merge into one PDF</a></span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-green-600 font-semibold text-sm">2</div>
                          <span className="text-gray-700">Add professional page numbering</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-green-600 font-semibold text-sm">3</div>
                          <span className="text-gray-700"><a href="/tools/watermark-pdf-tool" className="text-green-600 underline">Apply company watermark</a> for branding</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-green-600 font-semibold text-sm">4</div>
                          <span className="text-gray-700"><a href="/tools/protect-pdf-tool" className="text-green-600 underline">Protect with password</a> if confidential</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-green-600 font-semibold text-sm">5</div>
                          <span className="text-gray-700">Distribute to stakeholders</span>
                        </div>
                      </div>
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