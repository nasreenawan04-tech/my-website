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

                {/* FAQ */}
                <div className="bg-white rounded-2xl shadow-lg p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Frequently Asked Questions</h2>
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">Can I customize the appearance of page numbers?</h3>
                      <p className="text-gray-600 text-sm">
                        Yes! You can choose the position, font size, color, margins, and starting number. 
                        You can also skip the first page if needed.
                      </p>
                    </div>
                    
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">Will page numbers overwrite existing content?</h3>
                      <p className="text-gray-600 text-sm">
                        Page numbers are added on top of existing content. Use margin settings to position 
                        them in empty areas of your pages to avoid overlapping with text.
                      </p>
                    </div>
                    
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">What's the maximum file size supported?</h3>
                      <p className="text-gray-600 text-sm">
                        Our tool supports PDF files up to 50MB in size. Most documents process within seconds.
                      </p>
                    </div>
                    
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">Is my PDF kept secure?</h3>
                      <p className="text-gray-600 text-sm">
                        Yes, all uploaded files are automatically deleted from our servers after processing 
                        for your privacy and security.
                      </p>
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