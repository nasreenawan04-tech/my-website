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
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
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

        <Footer />
      </div>
    </>
  );
};

export default PDFCompressorAdvanced;