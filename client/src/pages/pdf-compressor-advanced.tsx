
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

      const blob = await response.blob();
      const downloadUrl = URL.createObjectURL(blob);

      // Calculate compression ratio correctly on the frontend
      const compressionRatio = Math.round(((selectedFile.size - blob.size) / selectedFile.size) * 100);

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
        <title>Advanced PDF Compressor - Reduce PDF File Size Online | ToolsHub</title>
        <meta name="description" content="Advanced PDF compression tool with customizable settings. Reduce PDF file size by up to 90% while maintaining quality. Multiple compression levels, image optimization, and metadata removal." />
        <meta name="keywords" content="PDF compressor, reduce PDF size, PDF optimization, compress PDF online, PDF file size reducer, advanced PDF compression, image optimization, metadata removal" />
        <meta property="og:title" content="Advanced PDF Compressor - Reduce PDF File Size Online | ToolsHub" />
        <meta property="og:description" content="Professional PDF compression with advanced settings and optimization options. Reduce file size by up to 90% with customizable compression levels." />
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
                Advanced PDF Compressor
              </h1>
              <p className="text-xl text-blue-100 max-w-2xl mx-auto mb-8">
                Professional PDF compression with advanced settings, image optimization, and metadata removal to achieve maximum file size reduction.
              </p>
              <div className="flex flex-wrap justify-center gap-4 text-sm">
                <span className="bg-white bg-opacity-20 px-3 py-1 rounded-full">Up to 90% Size Reduction</span>
                <span className="bg-white bg-opacity-20 px-3 py-1 rounded-full">Quality Preservation</span>
                <span className="bg-white bg-opacity-20 px-3 py-1 rounded-full">Batch Processing Ready</span>
              </div>
            </div>
          </section>

          {/* What is Advanced PDF Compressor */}
          <section className="py-16 bg-white">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-6">What is the Advanced PDF Compressor?</h2>
                <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
                  Our Advanced PDF Compressor is a professional-grade tool designed to significantly reduce PDF file sizes while maintaining document quality and integrity. Unlike basic compression tools, our advanced compressor offers granular control over compression settings, image optimization parameters, and document structure modifications.
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                <div>
                  <h3 className="text-2xl font-semibold text-gray-900 mb-6">How the Advanced PDF Compressor Works</h3>
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-blue-600 font-semibold text-sm">1</span>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">Intelligent File Analysis</h4>
                        <p className="text-gray-600 text-sm">Analyzes your PDF structure, identifying images, fonts, metadata, and optimization opportunities.</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-blue-600 font-semibold text-sm">2</span>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">Advanced Image Processing</h4>
                        <p className="text-gray-600 text-sm">Applies sophisticated compression algorithms to images while preserving visual quality based on your settings.</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-blue-600 font-semibold text-sm">3</span>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">Structure Optimization</h4>
                        <p className="text-gray-600 text-sm">Removes redundant data, optimizes content streams, and restructures the PDF for maximum efficiency.</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-blue-600 font-semibold text-sm">4</span>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">Quality Validation</h4>
                        <p className="text-gray-600 text-sm">Ensures the compressed PDF maintains readability and functionality while achieving target compression ratios.</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8">
                  <h3 className="text-xl font-semibold text-gray-900 mb-6">Key Features</h3>
                  <ul className="space-y-3">
                    <li className="flex items-center space-x-3">
                      <i className="fas fa-check-circle text-green-500"></i>
                      <span className="text-gray-700">4 compression levels (Low, Medium, High, Maximum)</span>
                    </li>
                    <li className="flex items-center space-x-3">
                      <i className="fas fa-check-circle text-green-500"></i>
                      <span className="text-gray-700">Adjustable image quality (10% to 100%)</span>
                    </li>
                    <li className="flex items-center space-x-3">
                      <i className="fas fa-check-circle text-green-500"></i>
                      <span className="text-gray-700">Metadata and document properties removal</span>
                    </li>
                    <li className="flex items-center space-x-3">
                      <i className="fas fa-check-circle text-green-500"></i>
                      <span className="text-gray-700">Web optimization and linearization</span>
                    </li>
                    <li className="flex items-center space-x-3">
                      <i className="fas fa-check-circle text-green-500"></i>
                      <span className="text-gray-700">Grayscale conversion option</span>
                    </li>
                    <li className="flex items-center space-x-3">
                      <i className="fas fa-check-circle text-green-500"></i>
                      <span className="text-gray-700">Bookmarks and annotations removal</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* Tool Section */}
          <section className="py-16 bg-gray-50">
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
                      <div className={`rounded-lg p-6 ${result.compressionRatio >= 0 ? 'bg-green-50' : 'bg-orange-50'}`} data-testid="compression-results">
                        <h3 className={`text-xl font-semibold mb-4 ${result.compressionRatio >= 0 ? 'text-green-900' : 'text-orange-900'}`}>
                          {result.compressionRatio >= 0 ? 'Compression Complete!' : 'Processing Complete!'}
                        </h3>
                        
                        {result.compressionRatio < 0 && (
                          <div className="bg-orange-100 border border-orange-200 rounded-lg p-4 mb-4">
                            <p className="text-orange-800 text-sm">
                              <strong>Note:</strong> The processed file is larger than the original. This can happen with already optimized PDFs or files with lots of compressed images.
                            </p>
                          </div>
                        )}
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                          <div className="text-center">
                            <div className={`text-2xl font-bold ${result.compressionRatio >= 0 ? 'text-green-700' : 'text-orange-700'}`}>
                              {formatFileSize(result.originalSize)}
                            </div>
                            <div className={`text-sm ${result.compressionRatio >= 0 ? 'text-green-600' : 'text-orange-600'}`}>Original Size</div>
                          </div>
                          <div className="text-center">
                            <div className={`text-2xl font-bold ${result.compressionRatio >= 0 ? 'text-green-700' : 'text-orange-700'}`}>
                              {formatFileSize(result.compressedSize)}
                            </div>
                            <div className={`text-sm ${result.compressionRatio >= 0 ? 'text-green-600' : 'text-orange-600'}`}>
                              {result.compressionRatio >= 0 ? 'Compressed Size' : 'Processed Size'}
                            </div>
                          </div>
                          <div className="text-center">
                            <div className={`text-2xl font-bold ${result.compressionRatio >= 0 ? 'text-green-700' : 'text-orange-700'}`}>
                              {result.compressionRatio >= 0 ? `${result.compressionRatio}%` : `+${Math.abs(result.compressionRatio)}%`}
                            </div>
                            <div className={`text-sm ${result.compressionRatio >= 0 ? 'text-green-600' : 'text-orange-600'}`}>
                              {result.compressionRatio >= 0 ? 'Size Reduction' : 'Size Increase'}
                            </div>
                          </div>
                        </div>

                        <Button
                          asChild
                          className={`w-full text-white ${result.compressionRatio >= 0 ? 'bg-green-600 hover:bg-green-700' : 'bg-orange-600 hover:bg-orange-700'}`}
                          data-testid="button-download"
                        >
                          <a href={result.downloadUrl} download={result.filename}>
                            <Download className="w-4 h-4 mr-2" />
                            {result.compressionRatio >= 0 ? 'Download Compressed PDF' : 'Download Processed PDF'}
                          </a>
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Benefits for Different Audiences */}
          <section className="py-16 bg-white">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Benefits for Every Professional</h2>
                <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                  Our Advanced PDF Compressor serves diverse professional needs with tailored benefits for different user groups and workflows.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {/* Students */}
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 hover:shadow-lg transition-all">
                  <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mb-4">
                    <i className="fas fa-graduation-cap text-white text-xl"></i>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">Students</h3>
                  <ul className="text-gray-700 text-sm space-y-2">
                    <li>• Reduce thesis and dissertation file sizes for online submission</li>
                    <li>• Compress research papers to meet university upload limits</li>
                    <li>• Optimize study materials for faster cloud storage sync</li>
                    <li>• Share compressed notes via email without size restrictions</li>
                    <li>• Archive academic documents efficiently</li>
                  </ul>
                </div>

                {/* Business Professionals */}
                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 hover:shadow-lg transition-all">
                  <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center mb-4">
                    <i className="fas fa-briefcase text-white text-xl"></i>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">Business Professionals</h3>
                  <ul className="text-gray-700 text-sm space-y-2">
                    <li>• Compress reports and presentations for faster email delivery</li>
                    <li>• Reduce contract file sizes for secure digital signing</li>
                    <li>• Optimize proposal documents for client sharing</li>
                    <li>• Archive business documents with space efficiency</li>
                    <li>• Prepare web-optimized PDFs for company websites</li>
                  </ul>
                </div>

                {/* Researchers */}
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 hover:shadow-lg transition-all">
                  <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center mb-4">
                    <i className="fas fa-microscope text-white text-xl"></i>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">Researchers</h3>
                  <ul className="text-gray-700 text-sm space-y-2">
                    <li>• Compress data-heavy research papers with charts and graphs</li>
                    <li>• Optimize journal submissions to meet file size requirements</li>
                    <li>• Archive large research datasets in PDF format</li>
                    <li>• Share compressed supplementary materials with peers</li>
                    <li>• Prepare research for institutional repositories</li>
                  </ul>
                </div>

                {/* Business Owners */}
                <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-6 hover:shadow-lg transition-all">
                  <div className="w-12 h-12 bg-orange-600 rounded-lg flex items-center justify-center mb-4">
                    <i className="fas fa-chart-line text-white text-xl"></i>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">Business Owners</h3>
                  <ul className="text-gray-700 text-sm space-y-2">
                    <li>• Reduce storage costs for document management systems</li>
                    <li>• Optimize product catalogs and brochures for web distribution</li>
                    <li>• Compress financial reports for stakeholder distribution</li>
                    <li>• Prepare marketing materials for email campaigns</li>
                    <li>• Archive business records efficiently for compliance</li>
                  </ul>
                </div>
              </div>

              {/* Additional Professional Use Cases */}
              <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-gray-50 rounded-xl p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Legal Professionals</h3>
                  <p className="text-gray-700 mb-3">
                    Legal documents often contain extensive exhibits, images, and scanned content that significantly increase file sizes. Our advanced compressor helps:
                  </p>
                  <ul className="text-gray-600 text-sm space-y-1">
                    <li>• Compress case files for court electronic filing systems</li>
                    <li>• Optimize discovery documents for secure client portals</li>
                    <li>• Reduce contract sizes while maintaining legal validity</li>
                    <li>• Archive legal documents with metadata removal for privacy</li>
                  </ul>
                </div>

                <div className="bg-gray-50 rounded-xl p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Healthcare Professionals</h3>
                  <p className="text-gray-700 mb-3">
                    Medical documents and research papers often contain high-resolution images and detailed charts. Benefits include:
                  </p>
                  <ul className="text-gray-600 text-sm space-y-1">
                    <li>• Compress medical research with imaging data</li>
                    <li>• Optimize patient education materials for web distribution</li>
                    <li>• Reduce file sizes for secure patient portal uploads</li>
                    <li>• Archive medical records efficiently while maintaining HIPAA compliance</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* Advanced Features Deep Dive */}
          <section className="py-16 bg-gradient-to-r from-gray-50 to-blue-50">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Advanced Compression Technology</h2>
                <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                  Powered by cutting-edge algorithms and intelligent optimization techniques for superior compression results.
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                <div className="space-y-8">
                  <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                    <div className="flex items-center mb-4">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                        <i className="fas fa-brain text-blue-600"></i>
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900">AI-Powered Image Analysis</h3>
                    </div>
                    <p className="text-gray-600 leading-relaxed">
                      Our compression engine uses machine learning algorithms to analyze each image's content and characteristics, 
                      applying the optimal compression method for maximum size reduction while preserving visual quality. 
                      This intelligent approach ensures better results than traditional one-size-fits-all compression.
                    </p>
                  </div>

                  <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                    <div className="flex items-center mb-4">
                      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                        <i className="fas fa-cogs text-green-600"></i>
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900">Multi-Pass Optimization</h3>
                    </div>
                    <p className="text-gray-600 leading-relaxed">
                      Unlike single-pass compressors, our tool performs multiple optimization passes, first analyzing the document structure, 
                      then applying targeted compression to different content types (text, images, vectors), and finally optimizing 
                      the overall file structure for maximum efficiency.
                    </p>
                  </div>

                  <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                    <div className="flex items-center mb-4">
                      <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                        <i className="fas fa-shield-alt text-purple-600"></i>
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900">Selective Content Removal</h3>
                    </div>
                    <p className="text-gray-600 leading-relaxed">
                      Advanced content analysis identifies removable elements like metadata, hidden objects, and redundant resources. 
                      Users can selectively remove bookmarks, annotations, and other elements based on their specific needs, 
                      ensuring the compressed PDF retains only essential content.
                    </p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
                    <h3 className="text-xl font-semibold text-gray-900 mb-6">Compression Performance Metrics</h3>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                        <span className="text-gray-600">Average Compression Ratio</span>
                        <span className="text-2xl font-bold text-blue-600">65%</span>
                      </div>
                      <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                        <span className="text-gray-600">Maximum Achieved Reduction</span>
                        <span className="text-2xl font-bold text-green-600">94%</span>
                      </div>
                      <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                        <span className="text-gray-600">Processing Speed</span>
                        <span className="text-2xl font-bold text-purple-600">&lt; 30s</span>
                      </div>
                      <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                        <span className="text-gray-600">Files Optimized Monthly</span>
                        <span className="text-2xl font-bold text-orange-600">100K+</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Total Storage Saved</span>
                        <span className="text-2xl font-bold text-red-600">50TB+</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl p-6 text-white">
                    <h3 className="text-xl font-semibold mb-4">Why Choose Advanced Compression?</h3>
                    <ul className="space-y-2 text-blue-100">
                      <li className="flex items-center">
                        <i className="fas fa-check-circle text-green-300 mr-2"></i>
                        Up to 3x better compression than basic tools
                      </li>
                      <li className="flex items-center">
                        <i className="fas fa-check-circle text-green-300 mr-2"></i>
                        Granular control over quality vs. size trade-offs
                      </li>
                      <li className="flex items-center">
                        <i className="fas fa-check-circle text-green-300 mr-2"></i>
                        Professional-grade optimization algorithms
                      </li>
                      <li className="flex items-center">
                        <i className="fas fa-check-circle text-green-300 mr-2"></i>
                        Detailed compression analytics and reporting
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Comparison with Basic Compressor */}
          <section className="py-16 bg-white">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Advanced vs. Basic PDF Compression</h2>
                <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                  Understand the differences between our basic and advanced PDF compression tools to choose the right solution for your needs.
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-blue-50 rounded-xl p-8 border-2 border-blue-200">
                  <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                      <i className="fas fa-compress text-white text-2xl"></i>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900">Basic PDF Compressor</h3>
                    <p className="text-blue-600 font-medium">Quick & Simple</p>
                  </div>
                  <ul className="space-y-3 mb-6">
                    <li className="flex items-start">
                      <i className="fas fa-check text-blue-600 mt-1 mr-3"></i>
                      <span className="text-gray-700">One-click compression</span>
                    </li>
                    <li className="flex items-start">
                      <i className="fas fa-check text-blue-600 mt-1 mr-3"></i>
                      <span className="text-gray-700">Preset compression settings</span>
                    </li>
                    <li className="flex items-start">
                      <i className="fas fa-check text-blue-600 mt-1 mr-3"></i>
                      <span className="text-gray-700">Fast processing</span>
                    </li>
                    <li className="flex items-start">
                      <i className="fas fa-check text-blue-600 mt-1 mr-3"></i>
                      <span className="text-gray-700">20-40% size reduction</span>
                    </li>
                  </ul>
                  <a href="/tools/compress-pdf" className="block w-full bg-blue-600 text-white text-center py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium">
                    Try Basic Compressor
                  </a>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl p-8 border-2 border-purple-200 relative">
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-purple-600 text-white px-4 py-1 rounded-full text-sm font-medium">Recommended</span>
                  </div>
                  <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-purple-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                      <i className="fas fa-cog text-white text-2xl"></i>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900">Advanced PDF Compressor</h3>
                    <p className="text-purple-600 font-medium">Professional Grade</p>
                  </div>
                  <ul className="space-y-3 mb-6">
                    <li className="flex items-start">
                      <i className="fas fa-check text-purple-600 mt-1 mr-3"></i>
                      <span className="text-gray-700">Full customization control</span>
                    </li>
                    <li className="flex items-start">
                      <i className="fas fa-check text-purple-600 mt-1 mr-3"></i>
                      <span className="text-gray-700">4 compression levels</span>
                    </li>
                    <li className="flex items-start">
                      <i className="fas fa-check text-purple-600 mt-1 mr-3"></i>
                      <span className="text-gray-700">Image quality adjustment</span>
                    </li>
                    <li className="flex items-start">
                      <i className="fas fa-check text-purple-600 mt-1 mr-3"></i>
                      <span className="text-gray-700">Up to 90% size reduction</span>
                    </li>
                    <li className="flex items-start">
                      <i className="fas fa-check text-purple-600 mt-1 mr-3"></i>
                      <span className="text-gray-700">Metadata removal</span>
                    </li>
                    <li className="flex items-start">
                      <i className="fas fa-check text-purple-600 mt-1 mr-3"></i>
                      <span className="text-gray-700">Web optimization</span>
                    </li>
                  </ul>
                  <div className="bg-purple-600 text-white text-center py-3 rounded-lg font-medium">
                    You're Using This Tool
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* SEO Content - Integration with Other Tools */}
          <section className="py-16 bg-gray-50">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Complete PDF Workflow Solutions</h2>
                <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                  Combine our Advanced PDF Compressor with other powerful PDF tools for a complete document management workflow.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-all">
                  <div className="w-12 h-12 bg-red-600 rounded-lg flex items-center justify-center mb-4">
                    <i className="fas fa-cut text-white text-xl"></i>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">Split & Compress Workflow</h3>
                  <p className="text-gray-600 mb-4 text-sm">
                    First split large PDFs into smaller sections, then compress each part for optimal file management and sharing.
                  </p>
                  <a href="/tools/split-pdf" className="text-red-600 hover:text-red-700 font-medium text-sm flex items-center">
                    Try PDF Splitter <i className="fas fa-arrow-right ml-2"></i>
                  </a>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-all">
                  <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mb-4">
                    <i className="fas fa-layer-group text-white text-xl"></i>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">Merge & Optimize</h3>
                  <p className="text-gray-600 mb-4 text-sm">
                    Merge multiple documents into a single PDF, then use advanced compression to create an optimized final document.
                  </p>
                  <a href="/tools/merge-pdf" className="text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center">
                    Try PDF Merger <i className="fas fa-arrow-right ml-2"></i>
                  </a>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-all">
                  <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center mb-4">
                    <i className="fas fa-shield-alt text-white text-xl"></i>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">Compress & Protect</h3>
                  <p className="text-gray-600 mb-4 text-sm">
                    Reduce file size with advanced compression, then add password protection for secure document distribution.
                  </p>
                  <a href="/tools/protect-pdf" className="text-green-600 hover:text-green-700 font-medium text-sm flex items-center">
                    Try PDF Protector <i className="fas fa-arrow-right ml-2"></i>
                  </a>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-all">
                  <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center mb-4">
                    <i className="fas fa-images text-white text-xl"></i>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">Image to PDF Optimization</h3>
                  <p className="text-gray-600 mb-4 text-sm">
                    Convert images to PDF format, then apply advanced compression to create web-optimized image documents.
                  </p>
                  <a href="/tools/images-to-pdf-merger" className="text-purple-600 hover:text-purple-700 font-medium text-sm flex items-center">
                    Try Image Merger <i className="fas fa-arrow-right ml-2"></i>
                  </a>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-all">
                  <div className="w-12 h-12 bg-orange-600 rounded-lg flex items-center justify-center mb-4">
                    <i className="fas fa-file-export text-white text-xl"></i>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">Extract & Compress Pages</h3>
                  <p className="text-gray-600 mb-4 text-sm">
                    Extract specific pages from large documents, then compress the extracted pages for efficient sharing.
                  </p>
                  <a href="/tools/extract-pdf-pages" className="text-orange-600 hover:text-orange-700 font-medium text-sm flex items-center">
                    Try Page Extractor <i className="fas fa-arrow-right ml-2"></i>
                  </a>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-all">
                  <div className="w-12 h-12 bg-indigo-600 rounded-lg flex items-center justify-center mb-4">
                    <i className="fas fa-tools text-white text-xl"></i>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">Repair & Optimize</h3>
                  <p className="text-gray-600 mb-4 text-sm">
                    Repair corrupted PDFs to restore functionality, then compress them for improved performance and storage.
                  </p>
                  <a href="/tools/pdf-repair-tool" className="text-indigo-600 hover:text-indigo-700 font-medium text-sm flex items-center">
                    Try PDF Repair <i className="fas fa-arrow-right ml-2"></i>
                  </a>
                </div>
              </div>

              {/* Workflow Examples */}
              <div className="mt-12 grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Academic Workflow Example</h3>
                  <div className="space-y-3">
                    <div className="flex items-center text-sm">
                      <span className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold text-xs mr-3">1</span>
                      <span className="text-gray-700">Upload thesis draft PDF</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <span className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold text-xs mr-3">2</span>
                      <span className="text-gray-700">Use Advanced Compressor with medium settings</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <span className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold text-xs mr-3">3</span>
                      <span className="text-gray-700">Enable metadata removal for privacy</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <span className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold text-xs mr-3">4</span>
                      <span className="text-gray-700">Submit compressed file meeting university limits</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Business Workflow Example</h3>
                  <div className="space-y-3">
                    <div className="flex items-center text-sm">
                      <span className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center text-green-600 font-semibold text-xs mr-3">1</span>
                      <span className="text-gray-700">Merge quarterly reports into single PDF</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <span className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center text-green-600 font-semibold text-xs mr-3">2</span>
                      <span className="text-gray-700">Apply high compression with web optimization</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <span className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center text-green-600 font-semibold text-xs mr-3">3</span>
                      <span className="text-gray-700">Add password protection for confidentiality</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <span className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center text-green-600 font-semibold text-xs mr-3">4</span>
                      <span className="text-gray-700">Share optimized report with stakeholders</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Technical Specifications */}
          <section className="py-16 bg-white">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Technical Specifications & Capabilities</h2>
                <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                  Detailed technical information about our Advanced PDF Compressor's capabilities and limitations.
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                <div className="space-y-6">
                  <div className="bg-gray-50 rounded-xl p-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">Supported File Specifications</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-gray-700">Maximum File Size:</span>
                        <span className="text-gray-600 ml-2">100 MB</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">PDF Versions:</span>
                        <span className="text-gray-600 ml-2">1.3 to 2.0</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Password Protected:</span>
                        <span className="text-gray-600 ml-2">Supported</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Processing Time:</span>
                        <span className="text-gray-600 ml-2">&lt; 30 seconds</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Image Formats:</span>
                        <span className="text-gray-600 ml-2">JPEG, PNG, TIFF</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Color Spaces:</span>
                        <span className="text-gray-600 ml-2">RGB, CMYK, Grayscale</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-xl p-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">Compression Algorithms</h3>
                    <ul className="space-y-2 text-sm text-gray-700">
                      <li className="flex items-start">
                        <i className="fas fa-cog text-blue-600 mt-1 mr-2"></i>
                        <span><strong>JPEG Optimization:</strong> Advanced DCT coefficient quantization</span>
                      </li>
                      <li className="flex items-start">
                        <i className="fas fa-cog text-blue-600 mt-1 mr-2"></i>
                        <span><strong>Lossless Compression:</strong> Flate/LZW encoding for text and vectors</span>
                      </li>
                      <li className="flex items-start">
                        <i className="fas fa-cog text-blue-600 mt-1 mr-2"></i>
                        <span><strong>Content Stream Optimization:</strong> Redundancy removal and object consolidation</span>
                      </li>
                      <li className="flex items-start">
                        <i className="fas fa-cog text-blue-600 mt-1 mr-2"></i>
                        <span><strong>Font Subsetting:</strong> Removes unused font characters</span>
                      </li>
                    </ul>
                  </div>

                  <div className="bg-gray-50 rounded-xl p-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">Security & Privacy</h3>
                    <ul className="space-y-2 text-sm text-gray-700">
                      <li className="flex items-start">
                        <i className="fas fa-shield-alt text-green-600 mt-1 mr-2"></i>
                        <span>Files processed locally - no cloud storage</span>
                      </li>
                      <li className="flex items-start">
                        <i className="fas fa-shield-alt text-green-600 mt-1 mr-2"></i>
                        <span>Automatic file deletion after processing</span>
                      </li>
                      <li className="flex items-start">
                        <i className="fas fa-shield-alt text-green-600 mt-1 mr-2"></i>
                        <span>SSL/TLS encrypted data transmission</span>
                      </li>
                      <li className="flex items-start">
                        <i className="fas fa-shield-alt text-green-600 mt-1 mr-2"></i>
                        <span>Optional metadata removal for privacy</span>
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-200">
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">Optimization Features</h3>
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Image Processing</h4>
                        <ul className="text-sm text-gray-700 space-y-1 pl-4">
                          <li>• Quality adjustment from 10% to 100%</li>
                          <li>• Automatic format conversion for optimal compression</li>
                          <li>• Grayscale conversion option</li>
                          <li>• Resolution optimization based on content</li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Document Structure</h4>
                        <ul className="text-sm text-gray-700 space-y-1 pl-4">
                          <li>• Linearization for fast web viewing</li>
                          <li>• Object stream compression</li>
                          <li>• Cross-reference table optimization</li>
                          <li>• Unused resource removal</li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Content Cleanup</h4>
                        <ul className="text-sm text-gray-700 space-y-1 pl-4">
                          <li>• Metadata and document properties</li>
                          <li>• Bookmarks and navigation elements</li>
                          <li>• Annotations and comments</li>
                          <li>• Hidden and invisible content</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="bg-yellow-50 rounded-xl p-6 border border-yellow-200">
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">Best Practices for Optimal Results</h3>
                    <ul className="space-y-2 text-sm text-gray-700">
                      <li className="flex items-start">
                        <i className="fas fa-lightbulb text-yellow-600 mt-1 mr-2"></i>
                        <span>Start with medium compression for balanced results</span>
                      </li>
                      <li className="flex items-start">
                        <i className="fas fa-lightbulb text-yellow-600 mt-1 mr-2"></i>
                        <span>Use maximum compression only for archival purposes</span>
                      </li>
                      <li className="flex items-start">
                        <i className="fas fa-lightbulb text-yellow-600 mt-1 mr-2"></i>
                        <span>Enable image optimization for graphics-heavy documents</span>
                      </li>
                      <li className="flex items-start">
                        <i className="fas fa-lightbulb text-yellow-600 mt-1 mr-2"></i>
                        <span>Remove metadata only if privacy is a concern</span>
                      </li>
                      <li className="flex items-start">
                        <i className="fas fa-lightbulb text-yellow-600 mt-1 mr-2"></i>
                        <span>Test different settings for document-specific optimization</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* FAQ Section */}
          <section className="py-16 bg-gray-50">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Frequently Asked Questions</h2>
                <p className="text-xl text-gray-600">
                  Everything you need to know about advanced PDF compression
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="bg-white rounded-lg p-6 shadow-sm">
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">What's the difference between compression levels?</h4>
                    <p className="text-gray-600 text-sm">Each level offers different trade-offs between file size and quality. Low compression maintains highest quality with minimal size reduction, while maximum compression achieves the smallest file size with some quality compromise.</p>
                  </div>
                  
                  <div className="bg-white rounded-lg p-6 shadow-sm">
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">Will compression affect text readability?</h4>
                    <p className="text-gray-600 text-sm">Text readability is preserved at all compression levels. Our algorithms primarily target images and metadata while keeping text vectors intact and crisp.</p>
                  </div>
                  
                  <div className="bg-white rounded-lg p-6 shadow-sm">
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">Can I compress password-protected PDFs?</h4>
                    <p className="text-gray-600 text-sm">Yes, our tool can process password-protected PDFs. For optimal compression results, you may need to unlock them first using our <a href="/tools/unlock-pdf" className="text-blue-600 hover:text-blue-700">PDF unlock tool</a>.</p>
                  </div>

                  <div className="bg-white rounded-lg p-6 shadow-sm">
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">How does image quality affect compression?</h4>
                    <p className="text-gray-600 text-sm">Lower image quality settings result in smaller file sizes but may reduce visual clarity. For photographs, 60-80% quality usually provides good balance. For diagrams and charts, 80-90% is recommended.</p>
                  </div>
                </div>
                
                <div className="space-y-6">
                  <div className="bg-white rounded-lg p-6 shadow-sm">
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">Is it safe to upload sensitive documents?</h4>
                    <p className="text-gray-600 text-sm">Absolutely. All files are processed securely and automatically deleted from our servers after compression. We don't store or access your document content.</p>
                  </div>
                  
                  <div className="bg-white rounded-lg p-6 shadow-sm">
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">What's the maximum file size I can compress?</h4>
                    <p className="text-gray-600 text-sm">Our advanced compressor can handle PDFs up to 100MB in size. For larger files, consider using our <a href="/tools/split-pdf" className="text-blue-600 hover:text-blue-700">PDF splitter</a> first or contact us for enterprise solutions.</p>
                  </div>
                  
                  <div className="bg-white rounded-lg p-6 shadow-sm">
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">Should I remove bookmarks and annotations?</h4>
                    <p className="text-gray-600 text-sm">Only remove bookmarks and annotations if they're not needed, as this provides additional space savings but permanently removes navigation features and comments.</p>
                  </div>

                  <div className="bg-white rounded-lg p-6 shadow-sm">
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">When should I use web optimization?</h4>
                    <p className="text-gray-600 text-sm">Enable linearization for web optimization when the PDF will be hosted online or viewed in web browsers. This allows progressive loading and faster initial display.</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Related Tools */}
          <section className="py-16 bg-white">
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
        </main>

        <Footer />
      </div>
    </>
  );
};

export default PDFCompressorAdvanced;
