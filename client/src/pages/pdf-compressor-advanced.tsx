import { useState, useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Upload, FileText, Download, Settings, Zap } from 'lucide-react';

interface CompressionSettings {
  level: 'low' | 'medium' | 'high' | 'maximum';
  imageQuality: number;
  removeMetadata: boolean;
  optimizeImages: boolean;
  linearizeForWeb: boolean;
  removeBookmarks: boolean;
  removeAnnotations: boolean;
  grayscaleImages: boolean;
}

interface CompressionResult {
  originalSize: number;
  compressedSize: number;
  compressionRatio: number;
  downloadUrl: string;
  filename: string;
}

const PDFCompressorAdvanced = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [settings, setSettings] = useState<CompressionSettings>({
    level: 'medium',
    imageQuality: 75,
    removeMetadata: true,
    optimizeImages: true,
    linearizeForWeb: true,
    removeBookmarks: false,
    removeAnnotations: false,
    grayscaleImages: false,
  });
  const [result, setResult] = useState<CompressionResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleFileSelect = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    
    const file = files[0];
    if (file.type !== 'application/pdf') {
      setError('Please select a PDF file.');
      return;
    }

    setSelectedFile(file);
    setError(null);
    setResult(null);
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

  const updateSetting = <K extends keyof CompressionSettings>(key: K, value: CompressionSettings[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const compressPDF = async () => {
    if (!selectedFile) return;

    setIsProcessing(true);
    setError(null);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append('pdf', selectedFile);
      formData.append('level', settings.level);
      formData.append('imageQuality', settings.imageQuality.toString());
      formData.append('removeMetadata', settings.removeMetadata.toString());
      formData.append('optimizeImages', settings.optimizeImages.toString());
      formData.append('linearizeForWeb', settings.linearizeForWeb.toString());
      formData.append('removeBookmarks', settings.removeBookmarks.toString());
      formData.append('removeAnnotations', settings.removeAnnotations.toString());
      formData.append('grayscaleImages', settings.grayscaleImages.toString());

      const response = await fetch('/api/compress-pdf-advanced', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Compression failed');
      }

      const compressionRatio = parseInt(response.headers.get('X-Compression-Ratio') || '0');
      const blob = await response.blob();
      const downloadUrl = URL.createObjectURL(blob);

      setResult({
        originalSize: selectedFile.size,
        compressedSize: blob.size,
        compressionRatio,
        downloadUrl,
        filename: `compressed-${selectedFile.name}`
      });
    } catch (error) {
      console.error('Error compressing PDF:', error);
      setError(error instanceof Error ? error.message : 'Error compressing PDF. Please try again.');
    }

    setIsProcessing(false);
  };

  const resetTool = () => {
    setSelectedFile(null);
    setResult(null);
    setError(null);
  };

  const getCompressionDescription = (level: string) => {
    switch (level) {
      case 'low': return 'Minimal compression, highest quality';
      case 'medium': return 'Balanced compression and quality';
      case 'high': return 'Strong compression, good quality';
      case 'maximum': return 'Maximum compression, reduced quality';
      default: return '';
    }
  };

  const getEstimatedSavings = () => {
    switch (settings.level) {
      case 'low': return '10-30%';
      case 'medium': return '30-50%';
      case 'high': return '50-70%';
      case 'maximum': return '70-90%';
      default: return '';
    }
  };

  return (
    <>
      <Helmet>
        <title>PDF Compressor (Advanced) - Reduce PDF File Size | ToolsHub</title>
        <meta name="description" content="Advanced PDF compression with multiple levels, image optimization, and metadata removal to significantly reduce file size." />
        <meta name="keywords" content="PDF compressor, reduce PDF size, PDF optimization, compress PDF online, PDF file size reducer" />
        <meta property="og:title" content="PDF Compressor (Advanced) - Reduce PDF File Size | ToolsHub" />
        <meta property="og:description" content="Advanced PDF compression with customizable settings and optimization options." />
        <meta property="og:type" content="website" />
        <link rel="canonical" href="/tools/pdf-compressor-advanced" />
      </Helmet>

      <div className="min-h-screen flex flex-col" data-testid="page-pdf-compressor-advanced">
        <Header />
        
        <main className="flex-1 bg-neutral-50">
          {/* Hero Section */}
          <section className="bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-700 text-white py-16">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <div className="w-20 h-20 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <i className="fas fa-compress-alt text-3xl"></i>
              </div>
              <h1 className="text-4xl sm:text-5xl font-bold mb-6" data-testid="text-page-title">
                PDF Compressor (Advanced)
              </h1>
              <p className="text-xl text-blue-100 max-w-2xl mx-auto">
                Reduce PDF file size with advanced compression settings, image optimization, and metadata removal for optimal results.
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
                          Drag and drop PDF file here
                        </h3>
                        <p className="text-gray-600 mb-4">
                          or click to select a file from your computer
                        </p>
                        <Button
                          className="bg-blue-600 hover:bg-blue-700 text-white"
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
                    {selectedFile && (
                      <div className="bg-gray-50 rounded-lg p-4" data-testid="file-info">
                        <div className="flex items-center gap-4">
                          <FileText className="w-8 h-8 text-red-600" />
                          <div className="flex-1">
                            <div className="font-medium text-gray-900">{selectedFile.name}</div>
                            <div className="text-sm text-gray-600">
                              {formatFileSize(selectedFile.size)}
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

                    {/* Compression Settings */}
                    {selectedFile && (
                      <div className="space-y-6" data-testid="compression-settings">
                        <h3 className="text-xl font-semibold text-gray-900 flex items-center">
                          <Settings className="w-5 h-5 mr-2" />
                          Compression Settings
                        </h3>
                        
                        {/* Compression Level */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Compression Level
                          </label>
                          <Select value={settings.level} onValueChange={(value: 'low' | 'medium' | 'high' | 'maximum') => updateSetting('level', value)}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="low">Low - {getCompressionDescription('low')}</SelectItem>
                              <SelectItem value="medium">Medium - {getCompressionDescription('medium')}</SelectItem>
                              <SelectItem value="high">High - {getCompressionDescription('high')}</SelectItem>
                              <SelectItem value="maximum">Maximum - {getCompressionDescription('maximum')}</SelectItem>
                            </SelectContent>
                          </Select>
                          <p className="text-sm text-gray-500 mt-1">
                            Estimated file size reduction: {getEstimatedSavings()}
                          </p>
                        </div>

                        {/* Image Quality */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Image Quality: {settings.imageQuality}%
                          </label>
                          <Slider
                            value={[settings.imageQuality]}
                            onValueChange={([value]) => updateSetting('imageQuality', value)}
                            min={10}
                            max={100}
                            step={5}
                            className="w-full"
                            data-testid="slider-image-quality"
                          />
                          <div className="flex justify-between text-xs text-gray-500 mt-1">
                            <span>Smaller Size</span>
                            <span>Better Quality</span>
                          </div>
                        </div>

                        {/* Optimization Options */}
                        <div className="bg-blue-50 rounded-lg p-4">
                          <h4 className="font-medium text-gray-900 mb-3">Optimization Options</h4>
                          <div className="space-y-3">
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id="optimize-images"
                                checked={settings.optimizeImages}
                                onCheckedChange={(checked) => updateSetting('optimizeImages', Boolean(checked))}
                              />
                              <label htmlFor="optimize-images" className="text-sm text-gray-700">
                                Optimize and compress images
                              </label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id="remove-metadata"
                                checked={settings.removeMetadata}
                                onCheckedChange={(checked) => updateSetting('removeMetadata', Boolean(checked))}
                              />
                              <label htmlFor="remove-metadata" className="text-sm text-gray-700">
                                Remove metadata and document properties
                              </label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id="linearize-web"
                                checked={settings.linearizeForWeb}
                                onCheckedChange={(checked) => updateSetting('linearizeForWeb', Boolean(checked))}
                              />
                              <label htmlFor="linearize-web" className="text-sm text-gray-700">
                                Linearize for fast web view
                              </label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id="grayscale-images"
                                checked={settings.grayscaleImages}
                                onCheckedChange={(checked) => updateSetting('grayscaleImages', Boolean(checked))}
                              />
                              <label htmlFor="grayscale-images" className="text-sm text-gray-700">
                                Convert images to grayscale
                              </label>
                            </div>
                          </div>
                        </div>

                        {/* Advanced Options */}
                        <div className="bg-orange-50 rounded-lg p-4">
                          <h4 className="font-medium text-gray-900 mb-3">Advanced Options (Use with Caution)</h4>
                          <div className="space-y-3">
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id="remove-bookmarks"
                                checked={settings.removeBookmarks}
                                onCheckedChange={(checked) => updateSetting('removeBookmarks', Boolean(checked))}
                              />
                              <label htmlFor="remove-bookmarks" className="text-sm text-gray-700">
                                Remove bookmarks and navigation
                              </label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id="remove-annotations"
                                checked={settings.removeAnnotations}
                                onCheckedChange={(checked) => updateSetting('removeAnnotations', Boolean(checked))}
                              />
                              <label htmlFor="remove-annotations" className="text-sm text-gray-700">
                                Remove annotations and comments
                              </label>
                            </div>
                          </div>
                        </div>

                        {/* Compress Button */}
                        <Button
                          onClick={compressPDF}
                          disabled={isProcessing}
                          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3"
                          data-testid="button-compress"
                        >
                          {isProcessing ? (
                            <>
                              <Zap className="w-4 h-4 mr-2 animate-spin" />
                              Compressing PDF...
                            </>
                          ) : (
                            <>
                              <Zap className="w-4 h-4 mr-2" />
                              Compress PDF
                            </>
                          )}
                        </Button>
                      </div>
                    )}

                    {/* Error Display */}
                    {error && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <div className="text-red-800 text-sm">{error}</div>
                      </div>
                    )}

                    {/* Results */}
                    {result && (
                      <div className="bg-green-50 rounded-lg p-6" data-testid="compression-results">
                        <h3 className="text-xl font-semibold text-green-900 mb-4">
                          Compression Complete!
                        </h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                          <div className="text-center">
                            <div className="text-2xl font-bold text-green-700">
                              {formatFileSize(result.originalSize)}
                            </div>
                            <div className="text-sm text-green-600">Original Size</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-green-700">
                              {formatFileSize(result.compressedSize)}
                            </div>
                            <div className="text-sm text-green-600">Compressed Size</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-green-700">
                              {result.compressionRatio}%
                            </div>
                            <div className="text-sm text-green-600">Size Reduction</div>
                          </div>
                        </div>

                        <Button
                          asChild
                          className="w-full bg-green-600 hover:bg-green-700 text-white"
                          data-testid="button-download"
                        >
                          <a href={result.downloadUrl} download={result.filename}>
                            <Download className="w-4 h-4 mr-2" />
                            Download Compressed PDF
                          </a>
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </section>
        </main>

        {/* SEO Content - How It Works */}
        <section className="py-16 bg-white">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">How Our Advanced PDF Compressor Works</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Our advanced PDF compression technology uses sophisticated algorithms to significantly reduce file sizes while maintaining document quality and integrity.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Upload className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">1. Upload Your PDF</h3>
                <p className="text-gray-600">
                  Simply drag and drop your PDF file or click to select it from your computer. Our tool supports PDFs of all sizes and complexities.
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Settings className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">2. Configure Settings</h3>
                <p className="text-gray-600">
                  Choose from multiple compression levels and optimization options to achieve the perfect balance between file size and quality.
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Download className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">3. Download Result</h3>
                <p className="text-gray-600">
                  Get your optimized PDF with detailed compression statistics showing exactly how much space you've saved.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Key Features */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">Advanced PDF Compression Features</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <div className="w-12 h-12 bg-emerald-600 rounded-lg flex items-center justify-center mb-4">
                  <i className="fas fa-layer-group text-white text-xl"></i>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Multi-Level Compression</h3>
                <p className="text-gray-600 leading-relaxed">
                  Choose from four compression levels: Low (10-30% reduction), Medium (30-50%), High (50-70%), and Maximum (70-90%) to match your specific needs.
                </p>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mb-4">
                  <i className="fas fa-image text-white text-xl"></i>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Image Optimization</h3>
                <p className="text-gray-600 leading-relaxed">
                  Advanced image compression with adjustable quality settings from 10% to 100%, plus options for grayscale conversion and smart optimization.
                </p>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center mb-4">
                  <i className="fas fa-database text-white text-xl"></i>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Metadata Removal</h3>
                <p className="text-gray-600 leading-relaxed">
                  Remove document metadata, properties, and hidden information to reduce file size and protect privacy while maintaining document integrity.
                </p>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <div className="w-12 h-12 bg-orange-600 rounded-lg flex items-center justify-center mb-4">
                  <i className="fas fa-globe text-white text-xl"></i>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Web Optimization</h3>
                <p className="text-gray-600 leading-relaxed">
                  Linearize PDFs for fast web viewing, enabling progressive loading and improved user experience on websites and web applications.
                </p>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <div className="w-12 h-12 bg-red-600 rounded-lg flex items-center justify-center mb-4">
                  <i className="fas fa-shield-alt text-white text-xl"></i>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Content Cleanup</h3>
                <p className="text-gray-600 leading-relaxed">
                  Advanced options to remove bookmarks, annotations, and comments while preserving essential document structure and readability.
                </p>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <div className="w-12 h-12 bg-indigo-600 rounded-lg flex items-center justify-center mb-4">
                  <i className="fas fa-chart-line text-white text-xl"></i>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Compression Analytics</h3>
                <p className="text-gray-600 leading-relaxed">
                  Detailed compression statistics showing original size, compressed size, and percentage reduction to track optimization results.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-16 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Why Choose Our Advanced PDF Compressor?</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Experience the most sophisticated PDF compression technology with unmatched customization and optimization capabilities.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-8">
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <i className="fas fa-check text-white text-sm"></i>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Maximum File Size Reduction</h3>
                    <p className="text-gray-600">
                      Achieve up to 90% file size reduction with our maximum compression setting while maintaining readable document quality.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <i className="fas fa-check text-white text-sm"></i>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Quality Preservation</h3>
                    <p className="text-gray-600">
                      Advanced algorithms ensure text clarity and image readability even at high compression levels.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <i className="fas fa-check text-white text-sm"></i>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Privacy & Security</h3>
                    <p className="text-gray-600">
                      All processing happens securely with automatic file deletion after compression and no data storage.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <i className="fas fa-check text-white text-sm"></i>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Batch Processing Ready</h3>
                    <p className="text-gray-600">
                      Perfect settings configuration for processing multiple documents with consistent compression results.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-xl p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">Compression Statistics</h3>
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Average Size Reduction:</span>
                    <span className="text-2xl font-bold text-blue-600">65%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Processing Speed:</span>
                    <span className="text-2xl font-bold text-green-600">&lt; 30 sec</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Files Compressed:</span>
                    <span className="text-2xl font-bold text-purple-600">1M+</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Storage Saved:</span>
                    <span className="text-2xl font-bold text-orange-600">50TB+</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Use Cases */}
        <section className="py-16 bg-white">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Perfect for Every PDF Compression Need</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                From business documents to academic papers, our advanced compressor handles all types of PDF optimization requirements.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <i className="fas fa-briefcase text-blue-600 text-2xl"></i>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Business Documents</h3>
                <p className="text-gray-600 text-sm">
                  Compress reports, presentations, and contracts for faster email delivery and reduced storage costs.
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <i className="fas fa-graduation-cap text-green-600 text-2xl"></i>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Academic Papers</h3>
                <p className="text-gray-600 text-sm">
                  Optimize research papers, theses, and dissertations for online submission and archival storage.
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <i className="fas fa-globe text-purple-600 text-2xl"></i>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Web Publishing</h3>
                <p className="text-gray-600 text-sm">
                  Prepare PDFs for website hosting with linearization for fast loading and better user experience.
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <i className="fas fa-archive text-orange-600 text-2xl"></i>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Digital Archives</h3>
                <p className="text-gray-600 text-sm">
                  Compress large document collections for long-term storage with minimal quality loss.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Technical Details */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-8">Advanced Compression Technology</h2>
                
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">Intelligent Image Processing</h3>
                    <p className="text-gray-600 leading-relaxed">
                      Our compression engine analyzes each image in your PDF to determine the optimal compression method. 
                      JPEG images are recompressed with adjustable quality settings, while preserving transparency in PNG images. 
                      The system can also convert color images to grayscale when maximum compression is needed.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">Content Stream Optimization</h3>
                    <p className="text-gray-600 leading-relaxed">
                      Advanced algorithms analyze PDF content streams to remove redundant data, optimize font usage, 
                      and compress vector graphics without quality loss. This process can significantly reduce file 
                      size even for text-heavy documents.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">Structural Optimization</h3>
                    <p className="text-gray-600 leading-relaxed">
                      The tool optimizes PDF structure by removing unused objects, consolidating duplicate resources, 
                      and reorganizing the file for maximum compression efficiency while maintaining full document functionality.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-8">
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Compression Level Guide</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-gray-700">Low Compression</span>
                      <span className="text-blue-600 font-semibold">10-30% reduction</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">
                      Minimal compression with highest quality preservation. Perfect for documents requiring maximum fidelity.
                    </p>
                    
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-gray-700">Medium Compression</span>
                      <span className="text-green-600 font-semibold">30-50% reduction</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">
                      Balanced approach offering good compression with excellent quality. Ideal for most business documents.
                    </p>
                    
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-gray-700">High Compression</span>
                      <span className="text-orange-600 font-semibold">50-70% reduction</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">
                      Strong compression for significant size reduction while maintaining good readability.
                    </p>
                    
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-gray-700">Maximum Compression</span>
                      <span className="text-red-600 font-semibold">70-90% reduction</span>
                    </div>
                    <p className="text-sm text-gray-600">
                      Maximum size reduction for archival storage or when extreme compression is needed.
                    </p>
                  </div>
                </div>

                <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
                  <h3 className="text-xl font-semibold text-blue-900 mb-4">Pro Tips for Best Results</h3>
                  <ul className="space-y-2 text-blue-800">
                    <li className="flex items-start">
                      <span className="text-blue-600 mr-2">•</span>
                      Use medium compression for general business documents
                    </li>
                    <li className="flex items-start">
                      <span className="text-blue-600 mr-2">•</span>
                      Enable image optimization for documents with many graphics
                    </li>
                    <li className="flex items-start">
                      <span className="text-blue-600 mr-2">•</span>
                      Remove metadata for additional privacy and space savings
                    </li>
                    <li className="flex items-start">
                      <span className="text-blue-600 mr-2">•</span>
                      Use linearization for web-hosted PDFs
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-16 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Frequently Asked Questions</h2>
              <p className="text-xl text-gray-600">
                Everything you need to know about advanced PDF compression
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="bg-gray-50 rounded-lg p-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">What's the difference between compression levels?</h4>
                  <p className="text-gray-600 text-sm">Each level offers different trade-offs between file size and quality. Low compression maintains highest quality with minimal size reduction, while maximum compression achieves the smallest file size with some quality compromise.</p>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">Will compression affect text readability?</h4>
                  <p className="text-gray-600 text-sm">Text readability is preserved at all compression levels. Our algorithms primarily target images and metadata while keeping text vectors intact and crisp.</p>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">Can I compress password-protected PDFs?</h4>
                  <p className="text-gray-600 text-sm">Yes, our tool can process password-protected PDFs. You may need to unlock them first using our PDF unlock tool for optimal compression results.</p>
                </div>
              </div>
              
              <div className="space-y-6">
                <div className="bg-gray-50 rounded-lg p-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">Is it safe to upload sensitive documents?</h4>
                  <p className="text-gray-600 text-sm">Absolutely. All files are processed securely and automatically deleted from our servers after compression. We don't store or access your document content.</p>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">What's the maximum file size I can compress?</h4>
                  <p className="text-gray-600 text-sm">Our advanced compressor can handle PDFs up to 100MB in size. For larger files, consider splitting them first or contact us for enterprise solutions.</p>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">Should I remove bookmarks and annotations?</h4>
                  <p className="text-gray-600 text-sm">Only remove bookmarks and annotations if they're not needed, as this provides additional space savings but permanently removes navigation features and comments.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Related Tools */}
        <section className="py-16 bg-gradient-to-r from-gray-50 to-blue-50">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Related PDF Tools</h2>
              <p className="text-xl text-gray-600">
                Discover more powerful PDF optimization and management tools
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mb-4">
                  <i className="fas fa-compress text-white text-xl"></i>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Basic PDF Compressor</h3>
                <p className="text-gray-600 mb-4">
                  Quick and simple PDF compression with one-click optimization for everyday use.
                </p>
                <a href="/tools/compress-pdf" className="text-blue-600 hover:text-blue-700 font-medium">
                  Try Basic Compressor →
                </a>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center mb-4">
                  <i className="fas fa-tools text-white text-xl"></i>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">PDF Repair Tool</h3>
                <p className="text-gray-600 mb-4">
                  Fix corrupted PDFs and recover damaged documents with advanced repair algorithms.
                </p>
                <a href="/tools/pdf-repair-tool" className="text-green-600 hover:text-green-700 font-medium">
                  Repair PDFs →
                </a>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center mb-4">
                  <i className="fas fa-exchange-alt text-white text-xl"></i>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">PDF Version Converter</h3>
                <p className="text-gray-600 mb-4">
                  Convert between different PDF versions for compatibility with older software and systems.
                </p>
                <a href="/tools/pdf-version-converter" className="text-purple-600 hover:text-purple-700 font-medium">
                  Convert Versions →
                </a>
              </div>
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </>
  );
};

export default PDFCompressorAdvanced;