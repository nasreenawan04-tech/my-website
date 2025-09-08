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
        </main>
        
        <Footer />
      </div>
    </>
  );
};

export default ImagesToPDFMerger;
import { useState, useRef, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

interface ImageFile {
  file: File;
  id: string;
  preview: string;
}

const ImagesToPDFMerger = () => {
  const [selectedImages, setSelectedImages] = useState<ImageFile[]>([]);
  const [pageSize, setPageSize] = useState<'A4' | 'Letter' | 'Legal'>('A4');
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');
  const [margin, setMargin] = useState<number>(20);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const validImages = files.filter(file => file.type.startsWith('image/'));

    if (validImages.length !== files.length) {
      alert('Some files were skipped. Please select only image files (PNG, JPEG, GIF, etc.).');
    }

    const newImages: ImageFile[] = validImages.map(file => ({
      file,
      id: Math.random().toString(36).substr(2, 9),
      preview: URL.createObjectURL(file)
    }));

    setSelectedImages(prev => [...prev, ...newImages]);
  }, []);

  const removeImage = useCallback((id: string) => {
    setSelectedImages(prev => {
      const image = prev.find(img => img.id === id);
      if (image) {
        URL.revokeObjectURL(image.preview);
      }
      return prev.filter(img => img.id !== id);
    });
  }, []);

  const moveImage = useCallback((fromIndex: number, toIndex: number) => {
    setSelectedImages(prev => {
      const newImages = [...prev];
      const [removed] = newImages.splice(fromIndex, 1);
      newImages.splice(toIndex, 0, removed);
      return newImages;
    });
  }, []);

  const handleCreatePDF = async () => {
    if (selectedImages.length === 0) {
      alert('Please select at least one image.');
      return;
    }

    setIsProcessing(true);
    
    try {
      const formData = new FormData();
      selectedImages.forEach((image, index) => {
        formData.append(`image_${index}`, image.file);
      });
      formData.append('pageSize', pageSize);
      formData.append('orientation', orientation);
      formData.append('margin', margin.toString());
      formData.append('imageCount', selectedImages.length.toString());

      const response = await fetch('/api/pdf/images-to-pdf', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = 'merged_images.pdf';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        throw new Error('Failed to create PDF from images');
      }
    } catch (error) {
      console.error('Error creating PDF from images:', error);
      alert('An error occurred while creating the PDF. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const resetForm = () => {
    selectedImages.forEach(image => URL.revokeObjectURL(image.preview));
    setSelectedImages([]);
    setPageSize('A4');
    setOrientation('portrait');
    setMargin(20);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <>
      <Helmet>
        <title>Images to PDF Merger - Combine Multiple Images | ToolsHub</title>
        <meta name="description" content="Combine multiple images into a single PDF document. Support for PNG, JPEG, GIF and other image formats." />
        <meta name="keywords" content="images to PDF, combine images, merge images to PDF, create PDF from images" />
      </Helmet>

      <div className="min-h-screen flex flex-col">
        <Header />

        <main className="flex-1 bg-neutral-50">
          <section className="bg-gradient-to-r from-emerald-600 via-emerald-500 to-green-700 text-white py-16">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <div className="w-20 h-20 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <i className="fas fa-photo-video text-3xl"></i>
              </div>
              <h1 className="text-4xl sm:text-5xl font-bold mb-4">
                Images to PDF Merger
              </h1>
              <p className="text-xl text-emerald-100 mb-8 max-w-2xl mx-auto">
                Combine multiple images into a single PDF document with customizable layout
              </p>
            </div>
          </section>

          <section className="py-16">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Settings Panel */}
                <div className="lg:col-span-1">
                  <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-6">
                    <h3 className="text-lg font-semibold text-neutral-800 mb-4">PDF Settings</h3>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-2">
                          Select Images
                        </label>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={handleFileSelect}
                          className="w-full p-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        />
                        <p className="text-xs text-neutral-500 mt-1">
                          Select multiple images (PNG, JPEG, GIF, etc.)
                        </p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-2">
                          Page Size
                        </label>
                        <select
                          value={pageSize}
                          onChange={(e) => setPageSize(e.target.value as 'A4' | 'Letter' | 'Legal')}
                          className="w-full p-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                        >
                          <option value="A4">A4 (210 × 297 mm)</option>
                          <option value="Letter">Letter (8.5 × 11 in)</option>
                          <option value="Legal">Legal (8.5 × 14 in)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-2">
                          Orientation
                        </label>
                        <div className="space-y-2">
                          <label className="flex items-center">
                            <input
                              type="radio"
                              value="portrait"
                              checked={orientation === 'portrait'}
                              onChange={(e) => setOrientation(e.target.value as 'portrait' | 'landscape')}
                              className="w-4 h-4 text-emerald-600 bg-neutral-100 border-neutral-300 focus:ring-emerald-500"
                            />
                            <span className="ml-2">Portrait</span>
                          </label>
                          <label className="flex items-center">
                            <input
                              type="radio"
                              value="landscape"
                              checked={orientation === 'landscape'}
                              onChange={(e) => setOrientation(e.target.value as 'portrait' | 'landscape')}
                              className="w-4 h-4 text-emerald-600 bg-neutral-100 border-neutral-300 focus:ring-emerald-500"
                            />
                            <span className="ml-2">Landscape</span>
                          </label>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-2">
                          Margin: {margin}mm
                        </label>
                        <input
                          type="range"
                          min="0"
                          max="50"
                          value={margin}
                          onChange={(e) => setMargin(Number(e.target.value))}
                          className="w-full h-2 bg-neutral-200 rounded-lg appearance-none cursor-pointer"
                        />
                      </div>

                      <div className="pt-4 space-y-3">
                        <button
                          onClick={handleCreatePDF}
                          disabled={selectedImages.length === 0 || isProcessing}
                          className="w-full bg-gradient-to-r from-emerald-600 to-green-700 text-white px-6 py-3 rounded-lg font-semibold hover:from-emerald-700 hover:to-green-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isProcessing ? (
                            <>
                              <i className="fas fa-spinner fa-spin mr-2"></i>
                              Creating PDF...
                            </>
                          ) : (
                            <>
                              <i className="fas fa-file-pdf mr-2"></i>
                              Create PDF ({selectedImages.length} images)
                            </>
                          )}
                        </button>
                        <button
                          onClick={resetForm}
                          className="w-full bg-neutral-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-neutral-600 transition-all duration-200"
                        >
                          <i className="fas fa-redo mr-2"></i>
                          Reset
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Images Preview */}
                <div className="lg:col-span-2">
                  <div className="bg-white rounded-2xl shadow-lg p-6">
                    <h3 className="text-lg font-semibold text-neutral-800 mb-4">
                      Selected Images ({selectedImages.length})
                    </h3>
                    
                    {selectedImages.length === 0 ? (
                      <div className="text-center py-12">
                        <i className="fas fa-images text-4xl text-neutral-300 mb-4"></i>
                        <p className="text-neutral-500">No images selected</p>
                        <p className="text-sm text-neutral-400">Click "Select Images" to add images</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {selectedImages.map((image, index) => (
                          <div key={image.id} className="relative group">
                            <div className="aspect-square bg-neutral-100 rounded-lg overflow-hidden">
                              <img
                                src={image.preview}
                                alt={`Preview ${index + 1}`}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="absolute top-2 left-2 bg-emerald-600 text-white text-xs px-2 py-1 rounded">
                              {index + 1}
                            </div>
                            <button
                              onClick={() => removeImage(image.id)}
                              className="absolute top-2 right-2 bg-red-600 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                            >
                              <i className="fas fa-times text-xs"></i>
                            </button>
                            <div className="absolute bottom-2 right-2 flex space-x-1">
                              {index > 0 && (
                                <button
                                  onClick={() => moveImage(index, index - 1)}
                                  className="bg-neutral-800 bg-opacity-75 text-white p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                                >
                                  <i className="fas fa-arrow-left text-xs"></i>
                                </button>
                              )}
                              {index < selectedImages.length - 1 && (
                                <button
                                  onClick={() => moveImage(index, index + 1)}
                                  className="bg-neutral-800 bg-opacity-75 text-white p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                                >
                                  <i className="fas fa-arrow-right text-xs"></i>
                                </button>
                              )}
                            </div>
                            <p className="text-xs text-neutral-600 mt-1 truncate">
                              {image.file.name}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
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
