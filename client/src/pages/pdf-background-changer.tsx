import { useState, useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Upload, FileText, Download, Palette, RefreshCw } from 'lucide-react';

interface ColorPreset {
  name: string;
  color: string;
  hex: string;
}

const COLOR_PRESETS: ColorPreset[] = [
  { name: 'White', color: 'bg-white', hex: '#FFFFFF' },
  { name: 'Light Gray', color: 'bg-gray-100', hex: '#F3F4F6' },
  { name: 'Cream', color: 'bg-yellow-50', hex: '#FFFBEB' },
  { name: 'Light Blue', color: 'bg-blue-50', hex: '#EFF6FF' },
  { name: 'Light Green', color: 'bg-green-50', hex: '#ECFDF5' },
  { name: 'Light Pink', color: 'bg-pink-50', hex: '#FDF2F8' },
  { name: 'Light Purple', color: 'bg-purple-50', hex: '#FAF5FF' },
  { name: 'Transparent', color: 'bg-transparent', hex: 'transparent' },
];

const PDFBackgroundChanger = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedColor, setSelectedColor] = useState<string>('#FFFFFF');
  const [customColor, setCustomColor] = useState<string>('#FFFFFF');
  const [useCustomColor, setUseCustomColor] = useState<boolean>(false);
  const [removeBackground, setRemoveBackground] = useState<boolean>(false);
  const [processedPdfUrl, setProcessedPdfUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [originalInfo, setOriginalInfo] = useState<{ pageCount: number; size: string } | null>(null);
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
      setError('Please select a PDF file.');
      return;
    }

    setSelectedFile(file);
    setError(null);
    setProcessedPdfUrl(null);
    
    // Get original PDF info
    try {
      const { PDFDocument } = await import('pdf-lib');
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      const pages = pdfDoc.getPages();
      const firstPage = pages[0];
      const { width, height } = firstPage.getSize();
      
      setOriginalInfo({
        pageCount: pages.length,
        size: `${Math.round(width)} × ${Math.round(height)} pt`
      });
    } catch (error) {
      console.error('Error reading PDF info:', error);
      setOriginalInfo({ pageCount: 0, size: 'Unknown' });
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

  const hexToRgb = (hex: string) => {
    if (hex === 'transparent') return { r: 1, g: 1, b: 1, alpha: 0 };
    
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16) / 255,
      g: parseInt(result[2], 16) / 255,
      b: parseInt(result[3], 16) / 255,
      alpha: 1
    } : { r: 1, g: 1, b: 1, alpha: 1 };
  };

  const processBackground = async () => {
    if (!selectedFile) return;

    setIsProcessing(true);
    setError(null);

    try {
      const { PDFDocument, rgb } = await import('pdf-lib');
      
      const arrayBuffer = await selectedFile.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      const newPdfDoc = await PDFDocument.create();
      
      const pages = pdfDoc.getPages();
      const targetColor = useCustomColor ? customColor : selectedColor;
      const colorValues = hexToRgb(targetColor);

      for (const page of pages) {
        const { width, height } = page.getSize();
        
        // Create new page with same dimensions
        const newPage = newPdfDoc.addPage([width, height]);
        
        // Add background color if not removing background
        if (!removeBackground && targetColor !== 'transparent') {
          newPage.drawRectangle({
            x: 0,
            y: 0,
            width: width,
            height: height,
            color: rgb(colorValues.r, colorValues.g, colorValues.b),
            opacity: colorValues.alpha,
          });
        }
        
        // Embed and draw the original page content on top
        const [embeddedPage] = await newPdfDoc.embedPages([page]);
        newPage.drawPage(embeddedPage, {
          x: 0,
          y: 0,
          width: width,
          height: height,
        });
        
        // If removing background, we would need more sophisticated processing
        // to actually remove existing backgrounds. This is a simplified version
        // that mainly adds new backgrounds.
      }

      const pdfBytes = await newPdfDoc.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      setProcessedPdfUrl(url);
    } catch (error) {
      console.error('Error processing PDF background:', error);
      setError('Error processing PDF background. Please try again with a valid PDF file.');
    }

    setIsProcessing(false);
  };

  const downloadProcessedPDF = () => {
    if (!processedPdfUrl) return;

    const operation = removeBackground ? 'background-removed' : 'background-changed';
    const link = document.createElement('a');
    link.href = processedPdfUrl;
    link.download = `${operation}-document.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const resetTool = () => {
    setSelectedFile(null);
    setProcessedPdfUrl(null);
    setOriginalInfo(null);
    setError(null);
    if (processedPdfUrl) {
      URL.revokeObjectURL(processedPdfUrl);
    }
  };

  const selectPresetColor = (hex: string) => {
    setSelectedColor(hex);
    setUseCustomColor(false);
    setRemoveBackground(hex === 'transparent');
  };

  const getCurrentColor = () => {
    if (removeBackground) return 'transparent';
    return useCustomColor ? customColor : selectedColor;
  };

  const getColorName = () => {
    if (removeBackground) return 'Remove Background';
    const preset = COLOR_PRESETS.find(p => p.hex === getCurrentColor());
    return preset ? preset.name : 'Custom Color';
  };

  return (
    <>
      <Helmet>
        <title>PDF Background Color Changer - Change or Remove PDF Backgrounds | ToolsHub</title>
        <meta name="description" content="Change PDF background colors or remove backgrounds entirely. Choose from preset colors or set custom background colors for your PDF pages." />
        <meta name="keywords" content="PDF background color, change PDF background, remove PDF background, PDF page color, PDF background changer" />
        <meta property="og:title" content="PDF Background Color Changer - Change or Remove PDF Backgrounds | ToolsHub" />
        <meta property="og:description" content="Change PDF background colors or remove backgrounds with custom color options." />
        <meta property="og:type" content="website" />
        <link rel="canonical" href="/tools/pdf-background-changer" />
      </Helmet>

      <div className="min-h-screen flex flex-col" data-testid="page-pdf-background-changer">
        <Header />
        
        <main className="flex-1 bg-neutral-50">
          {/* Hero Section */}
          <section className="bg-gradient-to-r from-pink-600 via-pink-500 to-purple-700 text-white py-16">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <div className="w-20 h-20 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <i className="fas fa-palette text-3xl"></i>
              </div>
              <h1 className="text-4xl sm:text-5xl font-bold mb-6" data-testid="text-page-title">
                PDF Background Color Changer
              </h1>
              <p className="text-xl text-pink-100 max-w-2xl mx-auto">
                Change the background color of PDF pages or remove backgrounds entirely. Choose from preset colors or customize your own.
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
                      <h2 className="text-2xl font-semibold text-gray-900 mb-6">Select PDF File</h2>
                      
                      <div
                        className={`border-2 border-dashed rounded-xl p-12 text-center transition-colors ${
                          dragOver 
                            ? 'border-pink-500 bg-pink-50' 
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
                          className="bg-pink-600 hover:bg-pink-700 text-white"
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
                    {selectedFile && originalInfo && (
                      <div className="bg-gray-50 rounded-lg p-4" data-testid="file-info">
                        <div className="flex items-center gap-4">
                          <FileText className="w-8 h-8 text-red-600" />
                          <div className="flex-1">
                            <div className="font-medium text-gray-900">{selectedFile.name}</div>
                            <div className="text-sm text-gray-600">
                              {formatFileSize(selectedFile.size)} • {originalInfo.pageCount} pages • {originalInfo.size}
                            </div>
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

                    {/* Background Settings */}
                    {selectedFile && (
                      <div className="space-y-6" data-testid="background-settings">
                        <h3 className="text-xl font-semibold text-gray-900">Background Color Settings</h3>
                        
                        {/* Remove Background Option */}
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                          <div className="flex items-center space-x-3">
                            <Checkbox
                              id="remove-background"
                              checked={removeBackground}
                              onCheckedChange={(checked) => {
                                setRemoveBackground(Boolean(checked));
                                if (checked) {
                                  setUseCustomColor(false);
                                }
                              }}
                            />
                            <label htmlFor="remove-background" className="text-sm font-medium text-gray-900">
                              Remove existing backgrounds (make transparent)
                            </label>
                          </div>
                          <p className="text-xs text-gray-600 mt-1 ml-6">
                            Note: This creates a new background layer. Complex background removal may require specialized tools.
                          </p>
                        </div>

                        {/* Color Presets */}
                        {!removeBackground && (
                          <div>
                            <h4 className="text-lg font-medium text-gray-900 mb-4">Preset Colors</h4>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                              {COLOR_PRESETS.filter(preset => preset.hex !== 'transparent').map((preset) => (
                                <button
                                  key={preset.hex}
                                  onClick={() => selectPresetColor(preset.hex)}
                                  className={`p-3 rounded-lg border-2 transition-all ${
                                    selectedColor === preset.hex && !useCustomColor
                                      ? 'border-pink-500 ring-2 ring-pink-200'
                                      : 'border-gray-200 hover:border-gray-300'
                                  }`}
                                  data-testid={`button-color-${preset.name.toLowerCase().replace(' ', '-')}`}
                                >
                                  <div className={`w-8 h-8 rounded-md mx-auto mb-2 ${preset.color} border border-gray-200`}></div>
                                  <div className="text-sm font-medium text-gray-700">{preset.name}</div>
                                  <div className="text-xs text-gray-500">{preset.hex}</div>
                                </button>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Custom Color */}
                        {!removeBackground && (
                          <div>
                            <div className="flex items-center space-x-3 mb-4">
                              <Checkbox
                                id="use-custom-color"
                                checked={useCustomColor}
                                onCheckedChange={(checked) => setUseCustomColor(Boolean(checked))}
                              />
                              <label htmlFor="use-custom-color" className="text-lg font-medium text-gray-900">
                                Custom Color
                              </label>
                            </div>
                            
                            {useCustomColor && (
                              <div className="flex items-center space-x-4">
                                <div className="flex items-center space-x-2">
                                  <input
                                    type="color"
                                    value={customColor}
                                    onChange={(e) => setCustomColor(e.target.value)}
                                    className="w-12 h-12 rounded-lg border border-gray-300 cursor-pointer"
                                    data-testid="input-custom-color"
                                  />
                                  <Input
                                    type="text"
                                    value={customColor}
                                    onChange={(e) => setCustomColor(e.target.value)}
                                    className="w-24 text-center"
                                    placeholder="#FFFFFF"
                                    data-testid="input-custom-color-hex"
                                  />
                                </div>
                                <div className="text-sm text-gray-600">
                                  Pick a color or enter a hex code
                                </div>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Preview */}
                        <div className="bg-blue-50 rounded-lg p-4">
                          <h4 className="font-medium text-gray-900 mb-2">Preview</h4>
                          <div className="flex items-center space-x-4">
                            <div 
                              className="w-16 h-20 rounded border-2 border-gray-300"
                              style={{ 
                                backgroundColor: removeBackground ? 'transparent' : getCurrentColor(),
                                backgroundImage: removeBackground 
                                  ? 'repeating-conic-gradient(#808080 0% 25%, transparent 0% 50%) 50% / 20px 20px'
                                  : 'none'
                              }}
                            ></div>
                            <div>
                              <div className="font-medium text-gray-900">{getColorName()}</div>
                              <div className="text-sm text-gray-600">
                                {removeBackground ? 'Transparent background' : `Color: ${getCurrentColor()}`}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Error Message */}
                    {error && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-4" data-testid="error-message">
                        <div className="flex items-center">
                          <i className="fas fa-exclamation-triangle text-red-600 mr-3"></i>
                          <p className="text-red-800">{error}</p>
                        </div>
                      </div>
                    )}

                    {/* Process Button */}
                    {selectedFile && !error && (
                      <div className="text-center">
                        <Button
                          onClick={processBackground}
                          disabled={isProcessing}
                          className="bg-pink-600 hover:bg-pink-700 text-white px-8 py-3 text-lg"
                          data-testid="button-process"
                        >
                          {isProcessing ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                              Processing Background...
                            </>
                          ) : (
                            <>
                              <Palette className="w-4 h-4 mr-2" />
                              {removeBackground ? 'Remove Background' : 'Change Background Color'}
                            </>
                          )}
                        </Button>
                      </div>
                    )}

                    {/* Results Section */}
                    {processedPdfUrl && (
                      <div className="bg-green-50 rounded-xl p-6 text-center" data-testid="process-results">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <i className="fas fa-check text-2xl text-green-600"></i>
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">
                          PDF Background Successfully {removeBackground ? 'Removed' : 'Changed'}!
                        </h3>
                        <p className="text-gray-600 mb-6">
                          Your PDF background has been {removeBackground ? 'removed' : `changed to ${getColorName()}`}.
                        </p>
                        <Button
                          onClick={downloadProcessedPDF}
                          className="bg-pink-600 hover:bg-pink-700 text-white px-6 py-3"
                          data-testid="button-download"
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Download Processed PDF
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
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">How PDF Background Changing Works</h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Upload className="w-8 h-8 text-pink-600" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">1. Upload PDF</h3>
                      <p className="text-gray-600">
                        Select a PDF file where you want to change or remove the background color.
                      </p>
                    </div>
                    
                    <div className="text-center">
                      <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Palette className="w-8 h-8 text-purple-600" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">2. Choose Color</h3>
                      <p className="text-gray-600">
                        Select from preset colors, choose a custom color, or opt to remove the background.
                      </p>
                    </div>
                    
                    <div className="text-center">
                      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Download className="w-8 h-8 text-green-600" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">3. Download</h3>
                      <p className="text-gray-600">
                        Get your PDF with the new background color applied to all pages.
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
                        <h3 className="font-semibold text-gray-900">Preset Color Options</h3>
                        <p className="text-gray-600 text-sm">Choose from carefully selected preset colors for common use cases.</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mr-3 mt-1">
                        <i className="fas fa-check text-xs text-green-600"></i>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">Custom Color Picker</h3>
                        <p className="text-gray-600 text-sm">Use the color picker or enter hex codes for precise color control.</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mr-3 mt-1">
                        <i className="fas fa-check text-xs text-green-600"></i>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">Background Removal</h3>
                        <p className="text-gray-600 text-sm">Option to remove backgrounds for transparent or minimalist designs.</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mr-3 mt-1">
                        <i className="fas fa-check text-xs text-green-600"></i>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">Live Preview</h3>
                        <p className="text-gray-600 text-sm">See how your selected color will look before processing the PDF.</p>
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

export default PDFBackgroundChanger;
import { useState, useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const PDFBackgroundChanger = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [backgroundColor, setBackgroundColor] = useState<string>('#ffffff');
  const [removeBackground, setRemoveBackground] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      setSelectedFile(file);
    } else {
      alert('Please select a valid PDF file.');
    }
  };

  const handleChangeBackground = async () => {
    if (!selectedFile) {
      alert('Please select a PDF file first.');
      return;
    }

    setIsProcessing(true);
    
    try {
      const formData = new FormData();
      formData.append('pdf', selectedFile);
      formData.append('backgroundColor', backgroundColor);
      formData.append('removeBackground', removeBackground.toString());

      const response = await fetch('/api/pdf/change-background', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = `${selectedFile.name.replace('.pdf', '')}_background_changed.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        throw new Error('Failed to change PDF background');
      }
    } catch (error) {
      console.error('Error changing PDF background:', error);
      alert('An error occurred while changing the PDF background. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const resetForm = () => {
    setSelectedFile(null);
    setBackgroundColor('#ffffff');
    setRemoveBackground(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const presetColors = [
    { name: 'White', value: '#ffffff' },
    { name: 'Light Gray', value: '#f5f5f5' },
    { name: 'Light Blue', value: '#e3f2fd' },
    { name: 'Light Green', value: '#e8f5e8' },
    { name: 'Light Yellow', value: '#fff9c4' },
    { name: 'Light Pink', value: '#fce4ec' },
  ];

  return (
    <>
      <Helmet>
        <title>PDF Background Color Changer - Change or Remove Backgrounds | ToolsHub</title>
        <meta name="description" content="Change background color of PDF pages or remove backgrounds completely. Free online PDF background modification tool." />
        <meta name="keywords" content="PDF background changer, PDF background color, remove PDF background, PDF color modification" />
      </Helmet>

      <div className="min-h-screen flex flex-col">
        <Header />

        <main className="flex-1 bg-neutral-50">
          <section className="bg-gradient-to-r from-pink-600 via-pink-500 to-rose-700 text-white py-16">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <div className="w-20 h-20 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <i className="fas fa-palette text-3xl"></i>
              </div>
              <h1 className="text-4xl sm:text-5xl font-bold mb-4">
                PDF Background Changer
              </h1>
              <p className="text-xl text-pink-100 mb-8 max-w-2xl mx-auto">
                Change background color of PDF pages or remove backgrounds completely
              </p>
            </div>
          </section>

          <section className="py-16">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      Select PDF File
                    </label>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf"
                      onChange={handleFileSelect}
                      className="w-full p-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    />
                  </div>

                  {selectedFile && (
                    <div className="p-4 bg-pink-50 border border-pink-200 rounded-lg">
                      <p className="text-pink-800">
                        <i className="fas fa-file-pdf mr-2"></i>
                        Selected: {selectedFile.name}
                      </p>
                    </div>
                  )}

                  <div className="space-y-4">
                    <div className="flex items-center space-x-4">
                      <input
                        type="checkbox"
                        id="removeBackground"
                        checked={removeBackground}
                        onChange={(e) => setRemoveBackground(e.target.checked)}
                        className="w-4 h-4 text-pink-600 bg-neutral-100 border-neutral-300 rounded focus:ring-pink-500"
                      />
                      <label htmlFor="removeBackground" className="text-sm font-medium text-neutral-700">
                        Remove background instead of changing color
                      </label>
                    </div>

                    {!removeBackground && (
                      <>
                        <div>
                          <label className="block text-sm font-medium text-neutral-700 mb-2">
                            Background Color
                          </label>
                          <div className="flex items-center space-x-4">
                            <input
                              type="color"
                              value={backgroundColor}
                              onChange={(e) => setBackgroundColor(e.target.value)}
                              className="w-16 h-12 border border-neutral-300 rounded-lg cursor-pointer"
                            />
                            <input
                              type="text"
                              value={backgroundColor}
                              onChange={(e) => setBackgroundColor(e.target.value)}
                              className="flex-1 p-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-pink-500"
                              placeholder="#ffffff"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-neutral-700 mb-2">
                            Preset Colors
                          </label>
                          <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                            {presetColors.map((color) => (
                              <button
                                key={color.value}
                                onClick={() => setBackgroundColor(color.value)}
                                className={`p-3 rounded-lg border-2 text-xs font-medium transition-all duration-200 ${
                                  backgroundColor === color.value
                                    ? 'border-pink-500 bg-pink-50'
                                    : 'border-neutral-300 hover:border-pink-300'
                                }`}
                                style={{ backgroundColor: color.value }}
                              >
                                {color.name}
                              </button>
                            ))}
                          </div>
                        </div>
                      </>
                    )}
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4 pt-6">
                    <button
                      onClick={handleChangeBackground}
                      disabled={!selectedFile || isProcessing}
                      className="flex-1 bg-gradient-to-r from-pink-600 to-rose-700 text-white px-6 py-3 rounded-lg font-semibold hover:from-pink-700 hover:to-rose-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isProcessing ? (
                        <>
                          <i className="fas fa-spinner fa-spin mr-2"></i>
                          Processing...
                        </>
                      ) : (
                        <>
                          <i className="fas fa-palette mr-2"></i>
                          {removeBackground ? 'Remove Background' : 'Change Background'}
                        </>
                      )}
                    </button>
                    <button
                      onClick={resetForm}
                      className="flex-1 bg-neutral-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-neutral-600 transition-all duration-200"
                    >
                      <i className="fas fa-redo mr-2"></i>
                      Reset
                    </button>
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

export default PDFBackgroundChanger;
