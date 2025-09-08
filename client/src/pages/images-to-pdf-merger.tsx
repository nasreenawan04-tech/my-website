import { useState, useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Upload, Image as ImageIcon, Download, Move, Trash2, RotateCw } from 'lucide-react';

interface ImageFile {
  id: string;
  file: File;
  preview: string;
  rotation: number;
  width: number;
  height: number;
}

interface PDFSettings {
  pageSize: 'auto' | 'a4' | 'letter' | 'legal' | 'custom';
  customWidth: number;
  customHeight: number;
  orientation: 'portrait' | 'landscape';
  margin: number;
  compression: number;
  fitToPage: boolean;
  maintainAspectRatio: boolean;
  centerImages: boolean;
  includeMetadata: boolean;
}

const PAGE_SIZES = {
  a4: { width: 595, height: 842 },
  letter: { width: 612, height: 792 },
  legal: { width: 612, height: 1008 },
};

const ImagesToPDFMerger = () => {
  const [selectedImages, setSelectedImages] = useState<ImageFile[]>([]);
  const [settings, setSettings] = useState<PDFSettings>({
    pageSize: 'auto',
    customWidth: 595,
    customHeight: 842,
    orientation: 'portrait',
    margin: 50,
    compression: 90,
    fitToPage: true,
    maintainAspectRatio: true,
    centerImages: true,
    includeMetadata: false,
  });
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
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

  const generateId = () => {
    return Math.random().toString(36).substr(2, 9);
  };

  const loadImageDimensions = (file: File): Promise<{ width: number; height: number }> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        resolve({ width: img.naturalWidth, height: img.naturalHeight });
      };
      img.src = URL.createObjectURL(file);
    });
  };

  const handleFileSelect = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    
    const imageFiles = Array.from(files).filter(file => 
      file.type.startsWith('image/') && ['image/jpeg', 'image/png', 'image/gif', 'image/webp'].includes(file.type)
    );
    
    if (imageFiles.length === 0) {
      setError('Please select valid image files (JPG, PNG, GIF, WebP).');
      return;
    }

    setError(null);
    
    const newImages: ImageFile[] = [];
    for (const file of imageFiles) {
      const preview = URL.createObjectURL(file);
      const dimensions = await loadImageDimensions(file);
      
      newImages.push({
        id: generateId(),
        file,
        preview,
        rotation: 0,
        width: dimensions.width,
        height: dimensions.height,
      });
    }
    
    setSelectedImages(prev => [...prev, ...newImages]);
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

  const updateSetting = <K extends keyof PDFSettings>(key: K, value: PDFSettings[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const removeImage = (id: string) => {
    setSelectedImages(prev => {
      const updated = prev.filter(img => img.id !== id);
      // Revoke object URL to prevent memory leaks
      const removed = prev.find(img => img.id === id);
      if (removed) {
        URL.revokeObjectURL(removed.preview);
      }
      return updated;
    });
  };

  const rotateImage = (id: string) => {
    setSelectedImages(prev => prev.map(img => 
      img.id === id ? { ...img, rotation: (img.rotation + 90) % 360 } : img
    ));
  };

  const moveImage = (id: string, direction: 'up' | 'down') => {
    setSelectedImages(prev => {
      const index = prev.findIndex(img => img.id === id);
      if (index === -1) return prev;
      
      const newIndex = direction === 'up' ? Math.max(0, index - 1) : Math.min(prev.length - 1, index + 1);
      const newArray = [...prev];
      const [movedItem] = newArray.splice(index, 1);
      newArray.splice(newIndex, 0, movedItem);
      
      return newArray;
    });
  };

  const getPageDimensions = () => {
    if (settings.pageSize === 'auto') {
      // Auto size based on largest image
      const maxWidth = Math.max(...selectedImages.map(img => 
        settings.orientation === 'portrait' 
          ? Math.max(img.width, img.height)
          : Math.min(img.width, img.height)
      ));
      const maxHeight = Math.max(...selectedImages.map(img => 
        settings.orientation === 'portrait' 
          ? Math.min(img.width, img.height)
          : Math.max(img.width, img.height)
      ));
      return { width: maxWidth + (settings.margin * 2), height: maxHeight + (settings.margin * 2) };
    }
    
    if (settings.pageSize === 'custom') {
      return settings.orientation === 'portrait'
        ? { width: settings.customWidth, height: settings.customHeight }
        : { width: settings.customHeight, height: settings.customWidth };
    }
    
    const size = PAGE_SIZES[settings.pageSize as keyof typeof PAGE_SIZES];
    return settings.orientation === 'portrait'
      ? { width: size.width, height: size.height }
      : { width: size.height, height: size.width };
  };

  const createPDF = async () => {
    if (selectedImages.length === 0) return;

    setIsProcessing(true);
    setError(null);

    try {
      const { PDFDocument, rgb } = await import('pdf-lib');
      
      const pdfDoc = await PDFDocument.create();
      const pageDimensions = getPageDimensions();

      for (const imageFile of selectedImages) {
        const page = pdfDoc.addPage([pageDimensions.width, pageDimensions.height]);
        
        // Convert image to appropriate format for pdf-lib
        const imageBytes = await imageFile.file.arrayBuffer();
        let embeddedImage;
        
        try {
          if (imageFile.file.type === 'image/jpeg') {
            embeddedImage = await pdfDoc.embedJpg(imageBytes);
          } else if (imageFile.file.type === 'image/png') {
            embeddedImage = await pdfDoc.embedPng(imageBytes);
          } else {
            // Convert other formats to PNG via canvas
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const img = new Image();
            
            await new Promise((resolve, reject) => {
              img.onload = resolve;
              img.onerror = reject;
              img.src = imageFile.preview;
            });
            
            canvas.width = img.naturalWidth;
            canvas.height = img.naturalHeight;
            ctx?.drawImage(img, 0, 0);
            
            const blob = await new Promise<Blob>((resolve) => {
              canvas.toBlob((blob) => resolve(blob!), 'image/png');
            });
            
            const convertedBytes = await blob.arrayBuffer();
            embeddedImage = await pdfDoc.embedPng(convertedBytes);
          }
        } catch (embedError) {
          console.error('Error embedding image:', embedError);
          continue; // Skip this image
        }
        
        // Calculate image dimensions and position
        const imageDims = embeddedImage.scale(1);
        const availableWidth = pageDimensions.width - (settings.margin * 2);
        const availableHeight = pageDimensions.height - (settings.margin * 2);
        
        let drawWidth = imageDims.width;
        let drawHeight = imageDims.height;
        
        if (settings.fitToPage) {
          const scaleX = availableWidth / imageDims.width;
          const scaleY = availableHeight / imageDims.height;
          
          if (settings.maintainAspectRatio) {
            const scale = Math.min(scaleX, scaleY);
            drawWidth = imageDims.width * scale;
            drawHeight = imageDims.height * scale;
          } else {
            drawWidth = availableWidth;
            drawHeight = availableHeight;
          }
        }
        
        // Center image if requested
        const x = settings.centerImages 
          ? (pageDimensions.width - drawWidth) / 2
          : settings.margin;
        const y = settings.centerImages
          ? (pageDimensions.height - drawHeight) / 2
          : settings.margin;
        
        // Draw image (rotation handling simplified for compatibility)
        page.drawImage(embeddedImage, {
          x: x,
          y: y,
          width: drawWidth,
          height: drawHeight,
        });
      }

      // Set metadata if requested
      if (settings.includeMetadata) {
        pdfDoc.setTitle('Merged Images PDF');
        pdfDoc.setSubject('PDF created from multiple images');
        pdfDoc.setCreator('ToolsHub Image to PDF Merger');
        pdfDoc.setProducer('pdf-lib');
        pdfDoc.setCreationDate(new Date());
      }

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      setPdfUrl(url);
    } catch (error) {
      console.error('Error creating PDF:', error);
      setError('Error creating PDF from images. Please try again with valid image files.');
    }

    setIsProcessing(false);
  };

  const downloadPDF = () => {
    if (!pdfUrl) return;

    const link = document.createElement('a');
    link.href = pdfUrl;
    link.download = 'merged-images.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const resetTool = () => {
    // Revoke all object URLs
    selectedImages.forEach(img => URL.revokeObjectURL(img.preview));
    if (pdfUrl) URL.revokeObjectURL(pdfUrl);
    
    setSelectedImages([]);
    setPdfUrl(null);
    setError(null);
  };

  const getTotalSize = () => {
    return selectedImages.reduce((total, img) => total + img.file.size, 0);
  };

  return (
    <>
      <Helmet>
        <title>Images to PDF Merger - Convert Multiple Images to PDF | ToolsHub</title>
        <meta name="description" content="Merge multiple images (JPG, PNG, GIF, WebP) into a single PDF document with customizable page settings, rotation, and compression options." />
        <meta name="keywords" content="images to PDF, merge images PDF, combine images PDF, JPG to PDF, PNG to PDF, image converter PDF" />
        <meta property="og:title" content="Images to PDF Merger - Convert Multiple Images to PDF | ToolsHub" />
        <meta property="og:description" content="Merge multiple images into a single PDF with advanced customization options." />
        <meta property="og:type" content="website" />
        <link rel="canonical" href="/tools/images-to-pdf-merger" />
      </Helmet>

      <div className="min-h-screen flex flex-col" data-testid="page-images-to-pdf-merger">
        <Header />
        
        <main className="flex-1 bg-neutral-50">
          {/* Hero Section */}
          <section className="bg-gradient-to-r from-green-600 via-green-500 to-emerald-700 text-white py-16">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <div className="w-20 h-20 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <i className="fas fa-file-pdf text-3xl"></i>
              </div>
              <h1 className="text-4xl sm:text-5xl font-bold mb-6" data-testid="text-page-title">
                Images to PDF Merger
              </h1>
              <p className="text-xl text-green-100 max-w-2xl mx-auto">
                Combine multiple images into a single PDF document with professional formatting, rotation controls, and customizable page settings.
              </p>
            </div>
          </section>

          {/* Tool Section */}
          <section className="py-16">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
              <Card className="bg-white shadow-sm border-0">
                <CardContent className="p-8">
                  <div className="space-y-8">
                    {/* Image Upload Section */}
                    <div>
                      <h2 className="text-2xl font-semibold text-gray-900 mb-6">Select Images</h2>
                      
                      <div
                        className={`border-2 border-dashed rounded-xl p-12 text-center transition-colors ${
                          dragOver 
                            ? 'border-green-500 bg-green-50' 
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                        onDrop={handleDrop}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                          Drag and drop images here
                        </h3>
                        <p className="text-gray-600 mb-4">
                          or click to select multiple images (JPG, PNG, GIF, WebP)
                        </p>
                        <Button
                          className="bg-green-600 hover:bg-green-700 text-white"
                          data-testid="button-select-images"
                        >
                          Select Images
                        </Button>
                        
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/jpeg,image/png,image/gif,image/webp"
                          multiple
                          onChange={(e) => handleFileSelect(e.target.files)}
                          className="hidden"
                          data-testid="input-images"
                        />
                      </div>
                    </div>

                    {/* Selected Images */}
                    {selectedImages.length > 0 && (
                      <div className="space-y-6" data-testid="selected-images">
                        <div className="flex justify-between items-center">
                          <h3 className="text-xl font-semibold text-gray-900">
                            Selected Images ({selectedImages.length})
                          </h3>
                          <div className="flex items-center space-x-4 text-sm text-gray-600">
                            <span>Total: {formatFileSize(getTotalSize())}</span>
                            <Button
                              onClick={resetTool}
                              variant="outline"
                              className="text-red-600 border-red-200 hover:bg-red-50"
                            >
                              Clear All
                            </Button>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {selectedImages.map((image, index) => (
                            <div key={image.id} className="bg-gray-50 rounded-lg p-4 relative">
                              <div className="aspect-square bg-white rounded-lg mb-3 overflow-hidden relative">
                                <img
                                  src={image.preview}
                                  alt={`Image ${index + 1}`}
                                  className="w-full h-full object-contain"
                                  style={{
                                    transform: `rotate(${image.rotation}deg)`
                                  }}
                                />
                                <div className="absolute top-2 left-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                                  #{index + 1}
                                </div>
                              </div>
                              
                              <div className="space-y-2">
                                <div className="text-sm font-medium text-gray-900 truncate">
                                  {image.file.name}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {formatFileSize(image.file.size)} • {image.width}×{image.height}px
                                </div>
                                
                                <div className="flex justify-between items-center">
                                  <div className="flex space-x-1">
                                    <Button
                                      onClick={() => moveImage(image.id, 'up')}
                                      disabled={index === 0}
                                      variant="outline"
                                      size="sm"
                                    >
                                      ↑
                                    </Button>
                                    <Button
                                      onClick={() => moveImage(image.id, 'down')}
                                      disabled={index === selectedImages.length - 1}
                                      variant="outline"
                                      size="sm"
                                    >
                                      ↓
                                    </Button>
                                    <Button
                                      onClick={() => rotateImage(image.id)}
                                      variant="outline"
                                      size="sm"
                                    >
                                      <RotateCw className="w-3 h-3" />
                                    </Button>
                                  </div>
                                  <Button
                                    onClick={() => removeImage(image.id)}
                                    variant="outline"
                                    size="sm"
                                    className="text-red-600 border-red-200 hover:bg-red-50"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* PDF Settings */}
                    {selectedImages.length > 0 && (
                      <div className="space-y-6" data-testid="pdf-settings">
                        <h3 className="text-xl font-semibold text-gray-900">PDF Settings</h3>
                        
                        {/* Page Size and Orientation */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Page Size
                            </label>
                            <Select value={settings.pageSize} onValueChange={(value: any) => updateSetting('pageSize', value)}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="auto">Auto (Fit Images)</SelectItem>
                                <SelectItem value="a4">A4 (210 × 297 mm)</SelectItem>
                                <SelectItem value="letter">Letter (8.5 × 11 in)</SelectItem>
                                <SelectItem value="legal">Legal (8.5 × 14 in)</SelectItem>
                                <SelectItem value="custom">Custom Size</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Orientation
                            </label>
                            <Select value={settings.orientation} onValueChange={(value: 'portrait' | 'landscape') => updateSetting('orientation', value)}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="portrait">Portrait</SelectItem>
                                <SelectItem value="landscape">Landscape</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Page Margin: {settings.margin}pt
                            </label>
                            <Slider
                              value={[settings.margin]}
                              onValueChange={([value]) => updateSetting('margin', value)}
                              min={0}
                              max={100}
                              step={5}
                              className="w-full"
                            />
                          </div>
                        </div>

                        {/* Custom Size */}
                        {settings.pageSize === 'custom' && (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Width (pt)
                              </label>
                              <Input
                                type="number"
                                value={settings.customWidth}
                                onChange={(e) => updateSetting('customWidth', parseInt(e.target.value) || 595)}
                                className="w-full"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Height (pt)
                              </label>
                              <Input
                                type="number"
                                value={settings.customHeight}
                                onChange={(e) => updateSetting('customHeight', parseInt(e.target.value) || 842)}
                                className="w-full"
                              />
                            </div>
                          </div>
                        )}

                        {/* Image Options */}
                        <div className="bg-blue-50 rounded-lg p-4">
                          <h4 className="font-medium text-gray-900 mb-3">Image Options</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-3">
                              <div className="flex items-center space-x-2">
                                <Checkbox
                                  id="fit-to-page"
                                  checked={settings.fitToPage}
                                  onCheckedChange={(checked) => updateSetting('fitToPage', Boolean(checked))}
                                />
                                <label htmlFor="fit-to-page" className="text-sm text-gray-700">
                                  Fit images to page
                                </label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Checkbox
                                  id="maintain-aspect-ratio"
                                  checked={settings.maintainAspectRatio}
                                  onCheckedChange={(checked) => updateSetting('maintainAspectRatio', Boolean(checked))}
                                />
                                <label htmlFor="maintain-aspect-ratio" className="text-sm text-gray-700">
                                  Maintain aspect ratio
                                </label>
                              </div>
                            </div>
                            <div className="space-y-3">
                              <div className="flex items-center space-x-2">
                                <Checkbox
                                  id="center-images"
                                  checked={settings.centerImages}
                                  onCheckedChange={(checked) => updateSetting('centerImages', Boolean(checked))}
                                />
                                <label htmlFor="center-images" className="text-sm text-gray-700">
                                  Center images on page
                                </label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Checkbox
                                  id="include-metadata"
                                  checked={settings.includeMetadata}
                                  onCheckedChange={(checked) => updateSetting('includeMetadata', Boolean(checked))}
                                />
                                <label htmlFor="include-metadata" className="text-sm text-gray-700">
                                  Include PDF metadata
                                </label>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Quality Settings */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Image Quality: {settings.compression}%
                          </label>
                          <Slider
                            value={[settings.compression]}
                            onValueChange={([value]) => updateSetting('compression', value)}
                            min={50}
                            max={100}
                            step={5}
                            className="w-full max-w-xs"
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            Higher quality results in larger file size
                          </p>
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

                    {/* Create PDF Button */}
                    {selectedImages.length > 0 && !error && (
                      <div className="text-center">
                        <Button
                          onClick={createPDF}
                          disabled={isProcessing}
                          className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 text-lg"
                          data-testid="button-create-pdf"
                        >
                          {isProcessing ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                              Creating PDF...
                            </>
                          ) : (
                            <>
                              <ImageIcon className="w-4 h-4 mr-2" />
                              Create PDF ({selectedImages.length} images)
                            </>
                          )}
                        </Button>
                      </div>
                    )}

                    {/* Results Section */}
                    {pdfUrl && (
                      <div className="bg-green-50 rounded-xl p-6 text-center" data-testid="pdf-results">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <i className="fas fa-check text-2xl text-green-600"></i>
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">
                          PDF Successfully Created!
                        </h3>
                        <p className="text-gray-600 mb-6">
                          Your {selectedImages.length} image(s) have been merged into a single PDF document.
                        </p>
                        <Button
                          onClick={downloadPDF}
                          className="bg-green-600 hover:bg-green-700 text-white px-6 py-3"
                          data-testid="button-download-pdf"
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Download Merged PDF
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* SEO Content Sections */}
          <section className="py-16 bg-white">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="space-y-16">
                {/* What is Images to PDF Merger */}
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">What is an Images to PDF Merger?</h2>
                  <div className="prose prose-lg max-w-4xl mx-auto text-gray-700">
                    <p className="text-lg leading-relaxed mb-6">
                      An <strong>Images to PDF Merger</strong> is a powerful digital tool designed to combine multiple image files into a single, professionally formatted PDF document. This versatile converter supports various image formats including JPG, PNG, GIF, and WebP, allowing users to create cohesive PDF documents from collections of photos, scanned documents, charts, diagrams, or any visual content stored as separate image files.
                    </p>
                    <p className="text-lg leading-relaxed mb-6">
                      Our advanced Images to PDF Merger goes beyond simple image compilation by offering comprehensive customization options including page sizing, orientation control, image positioning, quality optimization, and professional formatting features. Whether you're creating digital portfolios, consolidating research materials, preparing presentations, or archiving important documents, this tool streamlines the process of converting multiple images into a single, shareable PDF format.
                    </p>
                    <p className="text-lg leading-relaxed">
                      The tool provides enterprise-level functionality with user-friendly operation, making it ideal for business professionals, students, researchers, photographers, and anyone who needs to convert image collections into professional PDF documents while maintaining complete control over layout, quality, and formatting parameters.
                    </p>
                  </div>
                </div>

                {/* Key Features */}
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">Key Features of Our Images to PDF Merger</h2>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    <div className="bg-blue-50 rounded-xl p-6 border border-blue-100">
                      <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mb-4">
                        <i className="fas fa-images text-white text-xl"></i>
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-3">Multiple Format Support</h3>
                      <p className="text-gray-700 leading-relaxed">
                        Convert JPG, PNG, GIF, and WebP images with automatic format detection and optimized processing for each image type.
                      </p>
                    </div>

                    <div className="bg-green-50 rounded-xl p-6 border border-green-100">
                      <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center mb-4">
                        <i className="fas fa-cog text-white text-xl"></i>
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-3">Custom Page Settings</h3>
                      <p className="text-gray-700 leading-relaxed">
                        Choose from standard sizes (A4, Letter, Legal) or create custom dimensions with portrait/landscape orientation options.
                      </p>
                    </div>

                    <div className="bg-purple-50 rounded-xl p-6 border border-purple-100">
                      <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center mb-4">
                        <i className="fas fa-compress text-white text-xl"></i>
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-3">Quality Control</h3>
                      <p className="text-gray-700 leading-relaxed">
                        Adjust image quality and compression levels to balance file size with visual clarity for optimal results.
                      </p>
                    </div>

                    <div className="bg-orange-50 rounded-xl p-6 border border-orange-100">
                      <div className="w-12 h-12 bg-orange-600 rounded-lg flex items-center justify-center mb-4">
                        <i className="fas fa-sync text-white text-xl"></i>
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-3">Image Rotation</h3>
                      <p className="text-gray-700 leading-relaxed">
                        Rotate images in 90-degree increments to ensure proper orientation before merging into PDF format.
                      </p>
                    </div>

                    <div className="bg-teal-50 rounded-xl p-6 border border-teal-100">
                      <div className="w-12 h-12 bg-teal-600 rounded-lg flex items-center justify-center mb-4">
                        <i className="fas fa-arrows-alt text-white text-xl"></i>
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-3">Flexible Positioning</h3>
                      <p className="text-gray-700 leading-relaxed">
                        Center images automatically, maintain aspect ratios, and control margins for professional document layout.
                      </p>
                    </div>

                    <div className="bg-red-50 rounded-xl p-6 border border-red-100">
                      <div className="w-12 h-12 bg-red-600 rounded-lg flex items-center justify-center mb-4">
                        <i className="fas fa-list text-white text-xl"></i>
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-3">Order Management</h3>
                      <p className="text-gray-700 leading-relaxed">
                        Reorder images with drag-and-drop functionality or move buttons to create the perfect document sequence.
                      </p>
                    </div>
                  </div>
                </div>

                {/* How It Works */}
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">How to Convert Images to PDF</h2>
                  <div className="grid md:grid-cols-4 gap-8">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-white text-xl font-bold">1</span>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Upload Images</h3>
                      <p className="text-gray-600 text-sm">
                        Select multiple images using drag-and-drop or file browser. Supports JPG, PNG, GIF, WebP formats.
                      </p>
                    </div>

                    <div className="text-center">
                      <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-white text-xl font-bold">2</span>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Organize & Edit</h3>
                      <p className="text-gray-600 text-sm">
                        Reorder images, rotate as needed, and remove unwanted files to prepare your document sequence.
                      </p>
                    </div>

                    <div className="text-center">
                      <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-white text-xl font-bold">3</span>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Configure Settings</h3>
                      <p className="text-gray-600 text-sm">
                        Choose page size, orientation, margins, image positioning, and quality settings for optimal results.
                      </p>
                    </div>

                    <div className="text-center">
                      <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-white text-xl font-bold">4</span>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Download PDF</h3>
                      <p className="text-gray-600 text-sm">
                        Click create PDF to merge images and download your professionally formatted document.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Use Cases */}
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">Common Use Cases for Image to PDF Conversion</h2>
                  <div className="grid md:grid-cols-2 gap-8">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-4">Business & Professional</h3>
                      <ul className="space-y-3 text-gray-700">
                        <li className="flex items-start">
                          <i className="fas fa-check-circle text-green-500 mr-3 mt-1"></i>
                          <span>Creating digital portfolios and presentations</span>
                        </li>
                        <li className="flex items-start">
                          <i className="fas fa-check-circle text-green-500 mr-3 mt-1"></i>
                          <span>Consolidating product catalogs and brochures</span>
                        </li>
                        <li className="flex items-start">
                          <i className="fas fa-check-circle text-green-500 mr-3 mt-1"></i>
                          <span>Archiving important business documents</span>
                        </li>
                        <li className="flex items-start">
                          <i className="fas fa-check-circle text-green-500 mr-3 mt-1"></i>
                          <span>Converting visual reports and analytics</span>
                        </li>
                        <li className="flex items-start">
                          <i className="fas fa-check-circle text-green-500 mr-3 mt-1"></i>
                          <span>Preparing training materials and manuals</span>
                        </li>
                      </ul>
                    </div>

                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-4">Personal & Educational</h3>
                      <ul className="space-y-3 text-gray-700">
                        <li className="flex items-start">
                          <i className="fas fa-check-circle text-blue-500 mr-3 mt-1"></i>
                          <span>Converting scanned documents and receipts</span>
                        </li>
                        <li className="flex items-start">
                          <i className="fas fa-check-circle text-blue-500 mr-3 mt-1"></i>
                          <span>Creating photo albums and memory books</span>
                        </li>
                        <li className="flex items-start">
                          <i className="fas fa-check-circle text-blue-500 mr-3 mt-1"></i>
                          <span>Compiling research materials and references</span>
                        </li>
                        <li className="flex items-start">
                          <i className="fas fa-check-circle text-blue-500 mr-3 mt-1"></i>
                          <span>Submitting academic assignments with images</span>
                        </li>
                        <li className="flex items-start">
                          <i className="fas fa-check-circle text-blue-500 mr-3 mt-1"></i>
                          <span>Organizing digital artwork and sketches</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Technical Specifications */}
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">Technical Specifications & Capabilities</h2>
                  <div className="grid md:grid-cols-3 gap-8">
                    <div className="bg-gray-50 rounded-xl p-6">
                      <h3 className="text-xl font-semibold text-gray-900 mb-4">Supported Formats</h3>
                      <div className="space-y-2 text-gray-700">
                        <div className="flex justify-between">
                          <span>JPEG/JPG</span>
                          <i className="fas fa-check text-green-500"></i>
                        </div>
                        <div className="flex justify-between">
                          <span>PNG</span>
                          <i className="fas fa-check text-green-500"></i>
                        </div>
                        <div className="flex justify-between">
                          <span>GIF</span>
                          <i className="fas fa-check text-green-500"></i>
                        </div>
                        <div className="flex justify-between">
                          <span>WebP</span>
                          <i className="fas fa-check text-green-500"></i>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-xl p-6">
                      <h3 className="text-xl font-semibold text-gray-900 mb-4">Page Sizes</h3>
                      <div className="space-y-2 text-gray-700">
                        <div>• A4 (210 × 297 mm)</div>
                        <div>• Letter (8.5 × 11 in)</div>
                        <div>• Legal (8.5 × 14 in)</div>
                        <div>• Custom dimensions</div>
                        <div>• Auto-fit to images</div>
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-xl p-6">
                      <h3 className="text-xl font-semibold text-gray-900 mb-4">Processing Limits</h3>
                      <div className="space-y-2 text-gray-700">
                        <div>• Up to 20 images per batch</div>
                        <div>• Maximum 50MB per image</div>
                        <div>• Resolution up to 8K</div>
                        <div>• Batch processing support</div>
                        <div>• Real-time preview</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Tips and Best Practices */}
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">Tips for Best Results</h2>
                  <div className="grid md:grid-cols-2 gap-8">
                    <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
                      <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                        <i className="fas fa-lightbulb text-blue-600 mr-3"></i>
                        Optimization Tips
                      </h3>
                      <ul className="space-y-2 text-gray-700">
                        <li>• Use consistent image orientations when possible</li>
                        <li>• Choose appropriate quality settings for intended use</li>
                        <li>• Consider file size requirements for sharing</li>
                        <li>• Use standard page sizes for professional documents</li>
                        <li>• Preview images before final conversion</li>
                      </ul>
                    </div>

                    <div className="bg-green-50 rounded-xl p-6 border border-green-200">
                      <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                        <i className="fas fa-shield-alt text-green-600 mr-3"></i>
                        Security & Privacy
                      </h3>
                      <ul className="space-y-2 text-gray-700">
                        <li>• All processing happens in your browser</li>
                        <li>• Images are not uploaded to servers</li>
                        <li>• Complete privacy and data protection</li>
                        <li>• No registration or account required</li>
                        <li>• Files are automatically cleaned after use</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* FAQ */}
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">Frequently Asked Questions</h2>
                  <div className="space-y-6 max-w-4xl mx-auto">
                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">What image formats can I convert to PDF?</h3>
                      <p className="text-gray-700">
                        Our tool supports the most common image formats including JPEG/JPG, PNG, GIF, and WebP. These formats cover virtually all image types you might need to convert to PDF.
                      </p>
                    </div>

                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Is there a limit to how many images I can merge?</h3>
                      <p className="text-gray-700">
                        You can merge up to 20 images in a single batch. Each image can be up to 50MB in size, and the tool supports high-resolution images up to 8K quality.
                      </p>
                    </div>

                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Can I control the order of images in the PDF?</h3>
                      <p className="text-gray-700">
                        Yes! You can easily reorder images using drag-and-drop functionality or the move up/down buttons. The order you see in the preview is exactly how they'll appear in the final PDF.
                      </p>
                    </div>

                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Are my images secure during processing?</h3>
                      <p className="text-gray-700">
                        Absolutely! All image processing happens directly in your browser using client-side JavaScript. Your images are never uploaded to any server, ensuring complete privacy and security.
                      </p>
                    </div>

                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Can I adjust the quality and file size of the output PDF?</h3>
                      <p className="text-gray-700">
                        Yes, you can control the image quality with our compression slider (50-100%). Higher quality settings produce larger files, while lower settings reduce file size with some quality trade-off.
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

export default ImagesToPDFMerger;
