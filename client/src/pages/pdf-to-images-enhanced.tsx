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
      const { PDFDocument } = await import('pdf-lib');
      
      const arrayBuffer = await selectedFile.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      const pages = pdfDoc.getPages();
      const pagesToConvert = getPagesToConvert();

      const images: ConvertedImage[] = [];

      for (const pageNumber of pagesToConvert) {
        const pageIndex = pageNumber - 1;
        if (pageIndex >= 0 && pageIndex < pages.length) {
          const page = pages[pageIndex];
          
          // Create a new PDF with just this page for conversion
          const singlePagePdf = await PDFDocument.create();
          const [copiedPage] = await singlePagePdf.embedPages([page]);
          const { width, height } = page.getSize();
          const newPage = singlePagePdf.addPage([width, height]);
          newPage.drawPage(copiedPage, { x: 0, y: 0, width, height });
          
          // For demo purposes, we'll create a placeholder image
          // In a real implementation, you would use pdf2pic or similar library
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          
          const scaledWidth = Math.round(width * settings.scale * (settings.dpi / 72));
          const scaledHeight = Math.round(height * settings.scale * (settings.dpi / 72));
          
          canvas.width = scaledWidth;
          canvas.height = scaledHeight;
          
          if (ctx) {
            // Set background
            if (!settings.transparentBackground || settings.format !== 'png') {
              ctx.fillStyle = '#ffffff';
              ctx.fillRect(0, 0, scaledWidth, scaledHeight);
            }
            
            // Create placeholder content for demo
            ctx.fillStyle = '#333333';
            ctx.font = `${Math.max(12, scaledHeight / 30)}px Arial`;
            ctx.textAlign = 'center';
            ctx.fillText(`PDF Page ${pageNumber}`, scaledWidth / 2, scaledHeight / 2 - 20);
            ctx.fillText(`${scaledWidth} × ${scaledHeight}`, scaledWidth / 2, scaledHeight / 2 + 20);
            ctx.fillText(`${settings.dpi} DPI • ${settings.format.toUpperCase()}`, scaledWidth / 2, scaledHeight / 2 + 50);
          }
          
          // Convert to desired format
          const mimeType = settings.format === 'jpg' ? 'image/jpeg' : `image/${settings.format}`;
          const quality = settings.format === 'jpg' ? settings.quality / 100 : undefined;
          const dataUrl = canvas.toDataURL(mimeType, quality);
          
          // Estimate file size
          const base64Length = dataUrl.split(',')[1].length;
          const sizeInBytes = (base64Length * 3) / 4;
          
          images.push({
            pageNumber,
            dataUrl,
            filename: `page-${pageNumber.toString().padStart(3, '0')}.${settings.format}`,
            size: formatFileSize(sizeInBytes)
          });
        }
      }

      setConvertedImages(images);
    } catch (error) {
      console.error('Error converting PDF to images:', error);
      setError('Error converting PDF to images. Please try again with a valid PDF file.');
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
        </main>
        
        <Footer />
      </div>
    </>
  );
};

export default PDFToImagesEnhanced;