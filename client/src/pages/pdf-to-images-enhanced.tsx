import { useState, useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Upload, FileText, Download, Image, Settings } from 'lucide-react';

interface ConversionSettings {
  format: 'png' | 'jpg' | 'webp';
  quality: number;
  dpi: number;
  scale: number;
  pageRange: 'all' | 'range' | 'selection';
  startPage: number;
  endPage: number;
  selectedPages: number[];
  includeMetadata: boolean;
  transparentBackground: boolean;
}

interface ConvertedImage {
  pageNumber: number;
  dataUrl: string;
  filename: string;
  size: string;
}

const PDFToImagesEnhanced = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [settings, setSettings] = useState<ConversionSettings>({
    format: 'png',
    quality: 90,
    dpi: 150,
    scale: 1,
    pageRange: 'all',
    startPage: 1,
    endPage: 1,
    selectedPages: [],
    includeMetadata: false,
    transparentBackground: false,
  });
  const [convertedImages, setConvertedImages] = useState<ConvertedImage[]>([]);
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
    setConvertedImages([]);
    
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

      // Update settings with actual page count
      setSettings(prev => ({
        ...prev,
        endPage: pages.length,
        selectedPages: Array.from({ length: pages.length }, (_, i) => i + 1)
      }));
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

  const updateSetting = <K extends keyof ConversionSettings>(key: K, value: ConversionSettings[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const togglePageSelection = (pageNumber: number) => {
    setSettings(prev => ({
      ...prev,
      selectedPages: prev.selectedPages.includes(pageNumber)
        ? prev.selectedPages.filter(p => p !== pageNumber)
        : [...prev.selectedPages, pageNumber].sort((a, b) => a - b)
    }));
  };

  const selectAllPages = () => {
    if (!originalInfo) return;
    setSettings(prev => ({
      ...prev,
      selectedPages: Array.from({ length: originalInfo.pageCount }, (_, i) => i + 1)
    }));
  };

  const clearPageSelection = () => {
    setSettings(prev => ({ ...prev, selectedPages: [] }));
  };

  const getPagesToConvert = (): number[] => {
    if (!originalInfo) return [];
    
    switch (settings.pageRange) {
      case 'all':
        return Array.from({ length: originalInfo.pageCount }, (_, i) => i + 1);
      case 'range':
        const start = Math.max(1, Math.min(settings.startPage, originalInfo.pageCount));
        const end = Math.max(start, Math.min(settings.endPage, originalInfo.pageCount));
        return Array.from({ length: end - start + 1 }, (_, i) => start + i);
      case 'selection':
        return settings.selectedPages.filter(p => p >= 1 && p <= originalInfo.pageCount);
      default:
        return [];
    }
  };

  const convertToImages = async () => {
    if (!selectedFile) return;

    setIsProcessing(true);
    setError(null);
    setConvertedImages([]);

    try {
      const formData = new FormData();
      formData.append('pdf', selectedFile);
      formData.append('format', settings.format);
      formData.append('quality', settings.quality.toString());
      formData.append('dpi', settings.dpi.toString());
      formData.append('scale', settings.scale.toString());
      formData.append('pageRange', settings.pageRange);
      formData.append('startPage', settings.startPage.toString());
      formData.append('endPage', settings.endPage.toString());
      formData.append('selectedPages', JSON.stringify(settings.selectedPages));
      formData.append('transparentBackground', settings.transparentBackground.toString());

      const response = await fetch('/api/pdf-to-images', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to convert PDF to images');
      }

      if (result.success && result.images) {
        const images: ConvertedImage[] = result.images.map((img: any) => ({
          pageNumber: img.pageNumber,
          dataUrl: `data:${img.mimeType};base64,${img.data}`,
          filename: img.filename,
          size: formatFileSize(img.size)
        }));

        setConvertedImages(images);
      } else {
        throw new Error('No images returned from conversion');
      }
    } catch (error) {
      console.error('Error converting PDF to images:', error);
      setError(error instanceof Error ? error.message : 'Error converting PDF to images. Please try again with a valid PDF file.');
    }

    setIsProcessing(false);
  };

  const downloadImage = (image: ConvertedImage) => {
    const link = document.createElement('a');
    link.href = image.dataUrl;
    link.download = image.filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadAllImages = async () => {
    if (convertedImages.length === 0) return;

    // Download all images individually
    for (const image of convertedImages) {
      downloadImage(image);
      // Small delay to prevent browser blocking multiple downloads
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  };

  const resetTool = () => {
    setSelectedFile(null);
    setConvertedImages([]);
    setOriginalInfo(null);
    setError(null);
    setSettings(prev => ({
      ...prev,
      startPage: 1,
      endPage: 1,
      selectedPages: []
    }));
  };

  const getEstimatedOutputSize = () => {
    const pagesToConvert = getPagesToConvert();
    const estimatedSizePerPage = settings.format === 'jpg' ? 200 : settings.format === 'png' ? 800 : 400; // KB
    return formatFileSize(pagesToConvert.length * estimatedSizePerPage * 1024);
  };

  return (
    <>
      <Helmet>
        <title>PDF to Images Enhanced - Convert PDF to High-Quality Images | ToolsHub</title>
        <meta name="description" content="Convert PDF pages to high-quality images (PNG, JPG, WebP) with advanced settings for DPI, quality, page selection, and format options." />
        <meta name="keywords" content="PDF to images, PDF to PNG, PDF to JPG, PDF converter, high quality images, PDF pages to pictures" />
        <meta property="og:title" content="PDF to Images Enhanced - Convert PDF to High-Quality Images | ToolsHub" />
        <meta property="og:description" content="Convert PDF pages to images with advanced quality and format options." />
        <meta property="og:type" content="website" />
        <link rel="canonical" href="/tools/pdf-to-images-enhanced" />
      </Helmet>

      <div className="min-h-screen flex flex-col" data-testid="page-pdf-to-images-enhanced">
        <Header />
        
        <main className="flex-1 bg-neutral-50">
          {/* Hero Section */}
          <section className="bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-700 text-white py-16">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <div className="w-20 h-20 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <i className="fas fa-images text-3xl"></i>
              </div>
              <h1 className="text-4xl sm:text-5xl font-bold mb-6" data-testid="text-page-title">
                PDF to Images Enhanced
              </h1>
              <p className="text-xl text-indigo-100 max-w-2xl mx-auto">
                Convert PDF pages to high-quality images with advanced controls for format, resolution, quality, and page selection.
              </p>
            </div>
          </section>

          {/* SEO Introduction Section */}
          <section className="py-12 bg-white">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Advanced PDF to Image Converter</h2>
                <p className="text-lg text-gray-600 mb-8">
                  Transform your PDF documents into high-quality images with precise control over format, resolution, and output settings. 
                  Perfect for presentations, web publishing, and archival purposes.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                <div className="text-center">
                  <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i className="fas fa-image text-indigo-600 text-2xl"></i>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">Multiple Formats</h3>
                  <p className="text-gray-600">Export to PNG, JPG, or WebP formats with customizable quality settings for optimal results.</p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i className="fas fa-sliders-h text-indigo-600 text-2xl"></i>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">Advanced Controls</h3>
                  <p className="text-gray-600">Fine-tune DPI, scale, page selection, and quality settings for professional-grade image conversion.</p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i className="fas fa-download text-indigo-600 text-2xl"></i>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">Batch Processing</h3>
                  <p className="text-gray-600">Convert all pages or select specific pages, then download individually or as a complete set.</p>
                </div>
              </div>

              <div className="bg-blue-50 rounded-2xl p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Why Convert PDF to Images?</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">🌐 Web Publishing</h4>
                    <p className="text-gray-600 text-sm">Display PDF content on websites, blogs, and social media platforms that don't support PDF embedding.</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">📱 Mobile Compatibility</h4>
                    <p className="text-gray-600 text-sm">Create mobile-friendly versions of PDF documents for better viewing on smartphones and tablets.</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">🎨 Design Integration</h4>
                    <p className="text-gray-600 text-sm">Use PDF pages as images in graphic design projects, presentations, and marketing materials.</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">📊 Documentation</h4>
                    <p className="text-gray-600 text-sm">Create visual documentation, tutorials, and step-by-step guides from PDF content.</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Tool Section */}
          <section className="py-16 bg-neutral-50">
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
                            ? 'border-indigo-500 bg-indigo-50' 
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
                          className="bg-indigo-600 hover:bg-indigo-700 text-white"
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

                    {/* Conversion Settings */}
                    {selectedFile && originalInfo && (
                      <div className="space-y-8" data-testid="conversion-settings">
                        <h3 className="text-xl font-semibold text-gray-900 flex items-center">
                          <Settings className="w-5 h-5 mr-2" />
                          Conversion Settings
                        </h3>
                        
                        {/* Output Format */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Output Format
                            </label>
                            <Select value={settings.format} onValueChange={(value: 'png' | 'jpg' | 'webp') => updateSetting('format', value)}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="png">PNG (Best Quality)</SelectItem>
                                <SelectItem value="jpg">JPG (Smaller Size)</SelectItem>
                                <SelectItem value="webp">WebP (Modern Format)</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              DPI/Resolution: {settings.dpi}
                            </label>
                            <Slider
                              value={[settings.dpi]}
                              onValueChange={([value]) => updateSetting('dpi', value)}
                              min={72}
                              max={300}
                              step={10}
                              className="w-full"
                              data-testid="slider-dpi"
                            />
                            <div className="flex justify-between text-xs text-gray-500 mt-1">
                              <span>72 (Web)</span>
                              <span>150 (Print)</span>
                              <span>300 (High)</span>
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Scale: {settings.scale}x
                            </label>
                            <Slider
                              value={[settings.scale]}
                              onValueChange={([value]) => updateSetting('scale', value)}
                              min={0.5}
                              max={3}
                              step={0.1}
                              className="w-full"
                              data-testid="slider-scale"
                            />
                            <div className="flex justify-between text-xs text-gray-500 mt-1">
                              <span>0.5x</span>
                              <span>1x</span>
                              <span>3x</span>
                            </div>
                          </div>
                        </div>

                        {/* Quality Settings */}
                        {settings.format === 'jpg' && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              JPG Quality: {settings.quality}%
                            </label>
                            <Slider
                              value={[settings.quality]}
                              onValueChange={([value]) => updateSetting('quality', value)}
                              min={10}
                              max={100}
                              step={5}
                              className="w-full max-w-xs"
                              data-testid="slider-quality"
                            />
                          </div>
                        )}

                        {/* Advanced Options */}
                        <div className="bg-blue-50 rounded-lg p-4">
                          <h4 className="font-medium text-gray-900 mb-3">Advanced Options</h4>
                          <div className="space-y-2">
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id="transparent-background"
                                checked={settings.transparentBackground}
                                onCheckedChange={(checked) => updateSetting('transparentBackground', Boolean(checked))}
                                disabled={settings.format !== 'png'}
                              />
                              <label htmlFor="transparent-background" className="text-sm text-gray-700">
                                Transparent background (PNG only)
                              </label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id="include-metadata"
                                checked={settings.includeMetadata}
                                onCheckedChange={(checked) => updateSetting('includeMetadata', Boolean(checked))}
                              />
                              <label htmlFor="include-metadata" className="text-sm text-gray-700">
                                Include metadata in images
                              </label>
                            </div>
                          </div>
                        </div>

                        {/* Page Selection */}
                        <div className="space-y-4">
                          <h4 className="font-medium text-gray-900">Page Selection</h4>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <button
                              onClick={() => updateSetting('pageRange', 'all')}
                              className={`p-3 rounded-lg border-2 transition-all ${
                                settings.pageRange === 'all'
                                  ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                                  : 'border-gray-200 hover:border-gray-300'
                              }`}
                            >
                              <div className="font-medium">All Pages</div>
                              <div className="text-sm text-gray-600">Convert all {originalInfo.pageCount} pages</div>
                            </button>
                            
                            <button
                              onClick={() => updateSetting('pageRange', 'range')}
                              className={`p-3 rounded-lg border-2 transition-all ${
                                settings.pageRange === 'range'
                                  ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                                  : 'border-gray-200 hover:border-gray-300'
                              }`}
                            >
                              <div className="font-medium">Page Range</div>
                              <div className="text-sm text-gray-600">Convert specific page range</div>
                            </button>
                            
                            <button
                              onClick={() => updateSetting('pageRange', 'selection')}
                              className={`p-3 rounded-lg border-2 transition-all ${
                                settings.pageRange === 'selection'
                                  ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                                  : 'border-gray-200 hover:border-gray-300'
                              }`}
                            >
                              <div className="font-medium">Select Pages</div>
                              <div className="text-sm text-gray-600">Choose individual pages</div>
                            </button>
                          </div>

                          {/* Range Input */}
                          {settings.pageRange === 'range' && (
                            <div className="flex items-center space-x-4">
                              <div>
                                <label className="block text-xs text-gray-500 mb-1">From Page</label>
                                <input
                                  type="number"
                                  min={1}
                                  max={originalInfo.pageCount}
                                  value={settings.startPage}
                                  onChange={(e) => updateSetting('startPage', parseInt(e.target.value) || 1)}
                                  className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                                />
                              </div>
                              <div>
                                <label className="block text-xs text-gray-500 mb-1">To Page</label>
                                <input
                                  type="number"
                                  min={settings.startPage}
                                  max={originalInfo.pageCount}
                                  value={settings.endPage}
                                  onChange={(e) => updateSetting('endPage', parseInt(e.target.value) || originalInfo.pageCount)}
                                  className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                                />
                              </div>
                            </div>
                          )}

                          {/* Page Selection */}
                          {settings.pageRange === 'selection' && (
                            <div>
                              <div className="flex items-center justify-between mb-3">
                                <span className="text-sm text-gray-700">
                                  {settings.selectedPages.length} of {originalInfo.pageCount} pages selected
                                </span>
                                <div className="space-x-2">
                                  <Button onClick={selectAllPages} variant="outline" size="sm">
                                    Select All
                                  </Button>
                                  <Button onClick={clearPageSelection} variant="outline" size="sm">
                                    Clear
                                  </Button>
                                </div>
                              </div>
                              <div className="grid grid-cols-8 gap-2 max-h-32 overflow-y-auto">
                                {Array.from({ length: originalInfo.pageCount }, (_, i) => i + 1).map((pageNumber) => (
                                  <button
                                    key={pageNumber}
                                    onClick={() => togglePageSelection(pageNumber)}
                                    className={`p-2 text-xs rounded border transition-colors ${
                                      settings.selectedPages.includes(pageNumber)
                                        ? 'bg-indigo-100 border-indigo-300 text-indigo-700'
                                        : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                                    }`}
                                  >
                                    {pageNumber}
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Preview Info */}
                        <div className="bg-gray-50 rounded-lg p-4">
                          <h4 className="font-medium text-gray-900 mb-2">Conversion Summary</h4>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <div className="text-gray-500">Pages to Convert</div>
                              <div className="font-medium">{getPagesToConvert().length}</div>
                            </div>
                            <div>
                              <div className="text-gray-500">Output Format</div>
                              <div className="font-medium">{settings.format.toUpperCase()}</div>
                            </div>
                            <div>
                              <div className="text-gray-500">Resolution</div>
                              <div className="font-medium">{settings.dpi} DPI</div>
                            </div>
                            <div>
                              <div className="text-gray-500">Estimated Size</div>
                              <div className="font-medium">{getEstimatedOutputSize()}</div>
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

                    {/* Convert Button */}
                    {selectedFile && getPagesToConvert().length > 0 && !error && (
                      <div className="text-center">
                        <Button
                          onClick={convertToImages}
                          disabled={isProcessing}
                          className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 text-lg"
                          data-testid="button-convert"
                        >
                          {isProcessing ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                              Converting Pages...
                            </>
                          ) : (
                            <>
                              <Image className="w-4 h-4 mr-2" />
                              Convert to Images ({getPagesToConvert().length} pages)
                            </>
                          )}
                        </Button>
                      </div>
                    )}

                    {/* Results Section */}
                    {convertedImages.length > 0 && (
                      <div className="space-y-6" data-testid="conversion-results">
                        <div className="flex justify-between items-center">
                          <h3 className="text-xl font-semibold text-gray-900">
                            Converted Images ({convertedImages.length})
                          </h3>
                          <Button
                            onClick={downloadAllImages}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white"
                            data-testid="button-download-all"
                          >
                            <Download className="w-4 h-4 mr-2" />
                            Download All Images
                          </Button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                          {convertedImages.map((image) => (
                            <div key={image.pageNumber} className="bg-white rounded-lg border border-gray-200 p-4">
                              <div className="aspect-[3/4] bg-gray-100 rounded-lg mb-3 overflow-hidden">
                                <img
                                  src={image.dataUrl}
                                  alt={`Page ${image.pageNumber}`}
                                  className="w-full h-full object-contain"
                                />
                              </div>
                              <div className="space-y-2">
                                <div className="font-medium text-gray-900">
                                  Page {image.pageNumber}
                                </div>
                                <div className="text-sm text-gray-600">
                                  {image.filename} • {image.size}
                                </div>
                                <Button
                                  onClick={() => downloadImage(image)}
                                  variant="outline"
                                  className="w-full"
                                  data-testid={`button-download-${image.pageNumber}`}
                                >
                                  <Download className="w-4 h-4 mr-2" />
                                  Download
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Features & Benefits Section */}
          <section className="py-16 bg-white">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Advanced PDF to Image Features</h2>
                <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                  Our enhanced PDF to image converter offers professional-grade features for precise control over your conversions.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
                <div className="bg-gray-50 rounded-xl p-6">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                    <i className="fas fa-palette text-purple-600 text-xl"></i>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">Format Options</h3>
                  <ul className="space-y-2 text-gray-600 text-sm">
                    <li>• <strong>PNG:</strong> Best quality, supports transparency</li>
                    <li>• <strong>JPG:</strong> Smaller file size, ideal for photos</li>
                    <li>• <strong>WebP:</strong> Modern format with superior compression</li>
                    <li>• Customizable quality settings for each format</li>
                  </ul>
                </div>

                <div className="bg-gray-50 rounded-xl p-6">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                    <i className="fas fa-expand-arrows-alt text-green-600 text-xl"></i>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">Resolution Control</h3>
                  <ul className="space-y-2 text-gray-600 text-sm">
                    <li>• DPI settings from 72 (web) to 300 (print)</li>
                    <li>• Scale factor from 0.5x to 3x</li>
                    <li>• Maintain aspect ratio automatically</li>
                    <li>• Optimized for different use cases</li>
                  </ul>
                </div>

                <div className="bg-gray-50 rounded-xl p-6">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                    <i className="fas fa-list-alt text-blue-600 text-xl"></i>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">Page Selection</h3>
                  <ul className="space-y-2 text-gray-600 text-sm">
                    <li>• Convert all pages at once</li>
                    <li>• Specify custom page ranges</li>
                    <li>• Select individual pages</li>
                    <li>• Batch download capabilities</li>
                  </ul>
                </div>

                <div className="bg-gray-50 rounded-xl p-6">
                  <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                    <i className="fas fa-shield-alt text-red-600 text-xl"></i>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">Privacy & Security</h3>
                  <ul className="space-y-2 text-gray-600 text-sm">
                    <li>• Files processed locally in browser</li>
                    <li>• No data stored on servers</li>
                    <li>• Automatic file cleanup</li>
                    <li>• GDPR compliant processing</li>
                  </ul>
                </div>

                <div className="bg-gray-50 rounded-xl p-6">
                  <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mb-4">
                    <i className="fas fa-magic text-yellow-600 text-xl"></i>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">Advanced Options</h3>
                  <ul className="space-y-2 text-gray-600 text-sm">
                    <li>• Transparent backgrounds (PNG only)</li>
                    <li>• Metadata preservation options</li>
                    <li>• Color space optimization</li>
                    <li>• Compression level control</li>
                  </ul>
                </div>

                <div className="bg-gray-50 rounded-xl p-6">
                  <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                    <i className="fas fa-rocket text-indigo-600 text-xl"></i>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">Performance</h3>
                  <ul className="space-y-2 text-gray-600 text-sm">
                    <li>• Fast processing with worker threads</li>
                    <li>• Real-time preview generation</li>
                    <li>• Optimized memory usage</li>
                    <li>• Progress tracking for large files</li>
                  </ul>
                </div>
              </div>

              {/* How to Use Guide */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">How to Convert PDF to Images</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <span className="text-blue-600 font-bold">1</span>
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-2">Upload PDF</h4>
                    <p className="text-gray-600 text-sm">Drag and drop your PDF file or click to select from your computer.</p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <span className="text-blue-600 font-bold">2</span>
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-2">Configure Settings</h4>
                    <p className="text-gray-600 text-sm">Choose output format, quality, resolution, and page selection options.</p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <span className="text-blue-600 font-bold">3</span>
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-2">Convert Pages</h4>
                    <p className="text-gray-600 text-sm">Click convert to transform selected PDF pages into high-quality images.</p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <span className="text-blue-600 font-bold">4</span>
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-2">Download Results</h4>
                    <p className="text-gray-600 text-sm">Download individual images or all converted pages at once.</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Use Cases Section */}
          <section className="py-16 bg-gray-50">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Perfect for Every Use Case</h2>
                <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                  Whether you're a designer, developer, marketer, or student, our PDF to image converter adapts to your specific needs.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-white rounded-xl p-6 shadow-sm">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">👨‍💻 Web Developers</h3>
                  <ul className="space-y-2 text-gray-600">
                    <li>• Convert PDF mockups to images for web galleries</li>
                    <li>• Create thumbnails for document management systems</li>
                    <li>• Generate previews for PDF download links</li>
                    <li>• Optimize images for responsive web design</li>
                  </ul>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">🎨 Graphic Designers</h3>
                  <ul className="space-y-2 text-gray-600">
                    <li>• Extract high-resolution images from PDF layouts</li>
                    <li>• Create portfolio pieces from PDF presentations</li>
                    <li>• Convert print designs for digital marketing</li>
                    <li>• Generate social media content from PDF materials</li>
                  </ul>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">📚 Educators & Students</h3>
                  <ul className="space-y-2 text-gray-600">
                    <li>• Convert textbook pages for online learning platforms</li>
                    <li>• Create visual study guides from PDF materials</li>
                    <li>• Extract diagrams and charts for presentations</li>
                    <li>• Archive important documents as images</li>
                  </ul>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">📈 Business Professionals</h3>
                  <ul className="space-y-2 text-gray-600">
                    <li>• Convert reports to images for easy sharing</li>
                    <li>• Create visual documentation from PDF manuals</li>
                    <li>• Extract infographics for marketing materials</li>
                    <li>• Generate thumbnails for document libraries</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* FAQ Section */}
          <section className="py-16 bg-white">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Frequently Asked Questions</h2>
                <p className="text-lg text-gray-600">
                  Get answers to common questions about PDF to image conversion.
                </p>
              </div>

              <div className="space-y-6">
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">What image formats are supported?</h3>
                  <p className="text-gray-600">We support three popular image formats: PNG (best quality, supports transparency), JPG (smaller file size, ideal for photographs), and WebP (modern format with superior compression). You can adjust quality settings for optimal results.</p>
                </div>

                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">What's the maximum PDF file size I can convert?</h3>
                  <p className="text-gray-600">Our tool can handle large PDF files efficiently. The processing time depends on the number of pages, resolution settings, and your device's capabilities. For very large files, we recommend converting in smaller batches.</p>
                </div>

                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Can I convert password-protected PDFs?</h3>
                  <p className="text-gray-600">Currently, our tool works with unprotected PDF files. If you have a password-protected PDF, you'll need to remove the password protection first using our PDF Unlock tool, then proceed with the image conversion.</p>
                </div>

                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">How do I choose the right DPI setting?</h3>
                  <p className="text-gray-600">Use 72 DPI for web display and screen viewing, 150 DPI for general printing and presentations, and 300 DPI for high-quality printing and professional graphics. Higher DPI settings create larger file sizes but better image quality.</p>
                </div>

                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Are my files secure during conversion?</h3>
                  <p className="text-gray-600">Yes, your privacy is our priority. All PDF processing happens locally in your browser using JavaScript. Your files are never uploaded to our servers, ensuring complete privacy and security of your documents.</p>
                </div>

                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Can I convert specific pages instead of the entire PDF?</h3>
                  <p className="text-gray-600">Absolutely! You can choose to convert all pages, specify a custom page range (e.g., pages 5-10), or manually select individual pages. This gives you complete control over which content gets converted to images.</p>
                </div>
              </div>
            </div>
          </section>

          {/* Related Tools Section */}
          <section className="py-16 bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold mb-6">Related PDF Tools</h2>
                <p className="text-indigo-100 max-w-3xl mx-auto">
                  Enhance your PDF workflow with these complementary tools designed for comprehensive document management.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="bg-white bg-opacity-10 rounded-xl p-6 hover:bg-opacity-20 transition-all">
                  <div className="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center mb-4">
                    <i className="fas fa-photo-video text-white text-xl"></i>
                  </div>
                  <h3 className="text-xl font-semibold mb-3">Images to PDF Merger</h3>
                  <p className="text-indigo-100 text-sm mb-4">Combine multiple images into a single PDF document with custom layouts and sizing options.</p>
                  <a href="/tools/images-to-pdf" className="text-white hover:text-indigo-200 font-medium text-sm">
                    Merge Images to PDF →
                  </a>
                </div>

                <div className="bg-white bg-opacity-10 rounded-xl p-6 hover:bg-opacity-20 transition-all">
                  <div className="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center mb-4">
                    <i className="fas fa-compress text-white text-xl"></i>
                  </div>
                  <h3 className="text-xl font-semibold mb-3">PDF Compressor</h3>
                  <p className="text-indigo-100 text-sm mb-4">Reduce PDF file size while maintaining quality for easier sharing and storage.</p>
                  <a href="/tools/pdf-compressor-advanced" className="text-white hover:text-indigo-200 font-medium text-sm">
                    Compress PDFs →
                  </a>
                </div>

                <div className="bg-white bg-opacity-10 rounded-xl p-6 hover:bg-opacity-20 transition-all">
                  <div className="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center mb-4">
                    <i className="fas fa-cut text-white text-xl"></i>
                  </div>
                  <h3 className="text-xl font-semibold mb-3">Split PDF Pages</h3>
                  <p className="text-indigo-100 text-sm mb-4">Split large PDF documents into smaller files or extract specific pages.</p>
                  <a href="/tools/split-pdf" className="text-white hover:text-indigo-200 font-medium text-sm">
                    Split PDFs →
                  </a>
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

export default PDFToImagesEnhanced;
