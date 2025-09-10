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

          {/* What is PDF to Images Enhanced Tool Section */}
          <section className="py-12 bg-white">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-6">What is the PDF to Images Enhanced Tool?</h2>
                <p className="text-lg text-gray-600 mb-8 max-w-4xl mx-auto">
                  Our PDF to Images Enhanced tool is a powerful, browser-based converter that transforms PDF documents into high-quality images with professional-grade precision. Unlike basic PDF converters, this enhanced version offers advanced control over image format, resolution, quality, page selection, and output settings, making it perfect for both casual users and professionals who demand excellence in their document conversions.
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">How the PDF to Images Tool Works</h3>
                  <div className="space-y-4">
                    <div className="flex items-start">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-4 mt-1">
                        <span className="text-blue-600 font-bold text-sm">1</span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-1">Smart PDF Analysis</h4>
                        <p className="text-gray-600 text-sm">Our tool analyzes your PDF document structure, page dimensions, and content to optimize the conversion process.</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-4 mt-1">
                        <span className="text-blue-600 font-bold text-sm">2</span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-1">Advanced Processing Engine</h4>
                        <p className="text-gray-600 text-sm">Each page is rendered using advanced algorithms that preserve text clarity, image quality, and vector graphics precision.</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-4 mt-1">
                        <span className="text-blue-600 font-bold text-sm">3</span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-1">Format Optimization</h4>
                        <p className="text-gray-600 text-sm">Images are optimized based on your selected format and quality settings while maintaining visual fidelity.</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-4 mt-1">
                        <span className="text-blue-600 font-bold text-sm">4</span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-1">Secure Download</h4>
                        <p className="text-gray-600 text-sm">Converted images are ready for instant download with proper file naming and metadata preservation.</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">Key Features & Capabilities</h3>
                  <div className="grid grid-cols-1 gap-4">
                    <div className="bg-indigo-50 rounded-lg p-4">
                      <h4 className="font-semibold text-indigo-900 mb-2">🎯 Precision Control</h4>
                      <p className="text-indigo-700 text-sm">Adjust DPI from 72 to 300, scale from 0.5x to 3x, and fine-tune quality settings for perfect results.</p>
                    </div>
                    <div className="bg-green-50 rounded-lg p-4">
                      <h4 className="font-semibold text-green-900 mb-2">📄 Smart Page Selection</h4>
                      <p className="text-green-700 text-sm">Convert all pages, specify ranges, or handpick individual pages with intuitive selection tools.</p>
                    </div>
                    <div className="bg-purple-50 rounded-lg p-4">
                      <h4 className="font-semibold text-purple-900 mb-2">⚡ Fast Processing</h4>
                      <p className="text-purple-700 text-sm">Browser-based conversion ensures your files never leave your device while delivering lightning-fast results.</p>
                    </div>
                    <div className="bg-orange-50 rounded-lg p-4">
                      <h4 className="font-semibold text-orange-900 mb-2">🔒 Complete Privacy</h4>
                      <p className="text-orange-700 text-sm">All processing happens locally in your browser - no uploading, no storage, no privacy concerns.</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                <div className="text-center">
                  <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i className="fas fa-image text-indigo-600 text-2xl"></i>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">Multiple Image Formats</h3>
                  <p className="text-gray-600">Export to PNG (best quality), JPG (smaller size), or WebP (modern format) with customizable quality settings for optimal results.</p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i className="fas fa-sliders-h text-indigo-600 text-2xl"></i>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">Professional Controls</h3>
                  <p className="text-gray-600">Fine-tune DPI, scale, transparency, and metadata settings for professional-grade image conversion and publishing.</p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i className="fas fa-download text-indigo-600 text-2xl"></i>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">Flexible Downloads</h3>
                  <p className="text-gray-600">Download images individually or in bulk, with organized file naming and instant preview capabilities.</p>
                </div>
              </div>

              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Why Choose Our Enhanced PDF to Images Converter?</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                      <span className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center mr-2">
                        <i className="fas fa-globe text-white text-xs"></i>
                      </span>
                      Web Publishing Excellence
                    </h4>
                    <p className="text-gray-600 text-sm">Perfect for displaying PDF content on websites, blogs, and social media platforms that don't support PDF embedding. Optimized formats ensure fast loading and excellent visual quality.</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                      <span className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center mr-2">
                        <i className="fas fa-mobile-alt text-white text-xs"></i>
                      </span>
                      Mobile-First Design
                    </h4>
                    <p className="text-gray-600 text-sm">Create mobile-friendly versions of PDF documents that display perfectly on smartphones and tablets, with responsive sizing and touch-friendly interfaces.</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                      <span className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center mr-2">
                        <i className="fas fa-palette text-white text-xs"></i>
                      </span>
                      Design Integration
                    </h4>
                    <p className="text-gray-600 text-sm">Use PDF pages as high-quality images in graphic design projects, presentations, marketing materials, and creative workflows with precise control over output quality.</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                      <span className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center mr-2">
                        <i className="fas fa-file-alt text-white text-xs"></i>
                      </span>
                      Documentation & Archive
                    </h4>
                    <p className="text-gray-600 text-sm">Create visual documentation, tutorials, step-by-step guides, and archival images from PDF content with professional formatting and clarity.</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Benefits for Different Audiences Section */}
          <section className="py-16 bg-gray-50">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Benefits for Every Professional</h2>
                <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                  Our enhanced PDF to images converter serves diverse professional needs with specialized features for different industries and use cases.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                    <i className="fas fa-graduation-cap text-blue-600 text-xl"></i>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Students & Educators</h3>
                  <ul className="space-y-2 text-gray-600 text-sm">
                    <li>• Convert textbook pages for online study materials</li>
                    <li>• Create visual study guides from PDF lectures</li>
                    <li>• Extract diagrams and charts for presentations</li>
                    <li>• Archive research papers as searchable images</li>
                    <li>• Share course materials on social platforms</li>
                    <li>• Optimize PDFs for mobile learning apps</li>
                  </ul>
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <p className="text-xs text-gray-500 italic">Perfect for distance learning and digital education workflows</p>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                    <i className="fas fa-briefcase text-green-600 text-xl"></i>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Business Professionals</h3>
                  <ul className="space-y-2 text-gray-600 text-sm">
                    <li>• Convert reports for email and messaging platforms</li>
                    <li>• Create thumbnails for document libraries</li>
                    <li>• Extract infographics for marketing campaigns</li>
                    <li>• Share proposals on social media as images</li>
                    <li>• Archive contracts and agreements visually</li>
                    <li>• Create presentation slides from PDF content</li>
                  </ul>
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <p className="text-xs text-gray-500 italic">Streamline business communication and documentation</p>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                    <i className="fas fa-code text-purple-600 text-xl"></i>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Web Developers</h3>
                  <ul className="space-y-2 text-gray-600 text-sm">
                    <li>• Convert PDF mockups to web-ready images</li>
                    <li>• Generate thumbnails for download links</li>
                    <li>• Create image galleries from PDF portfolios</li>
                    <li>• Optimize images for responsive web design</li>
                    <li>• Extract graphics for web development projects</li>
                    <li>• Convert documentation for online help systems</li>
                  </ul>
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <p className="text-xs text-gray-500 italic">Essential for modern web development workflows</p>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                  <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                    <i className="fas fa-palette text-red-600 text-xl"></i>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Graphic Designers</h3>
                  <ul className="space-y-2 text-gray-600 text-sm">
                    <li>• Extract high-resolution images from PDF layouts</li>
                    <li>• Convert print designs for digital marketing</li>
                    <li>• Create portfolio pieces from PDF presentations</li>
                    <li>• Generate social media content from PDFs</li>
                    <li>• Source graphics for creative projects</li>
                    <li>• Archive design work in image formats</li>
                  </ul>
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <p className="text-xs text-gray-500 italic">Bridge print and digital design workflows seamlessly</p>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                  <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                    <i className="fas fa-flask text-indigo-600 text-xl"></i>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Researchers & Scientists</h3>
                  <ul className="space-y-2 text-gray-600 text-sm">
                    <li>• Convert research papers for digital analysis</li>
                    <li>• Extract charts and graphs for publications</li>
                    <li>• Create visual abstracts from PDF manuscripts</li>
                    <li>• Archive scientific documents as images</li>
                    <li>• Share findings on academic social networks</li>
                    <li>• Prepare figures for journal submissions</li>
                  </ul>
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <p className="text-xs text-gray-500 italic">Enhance academic research and publication workflows</p>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                  <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mb-4">
                    <i className="fas fa-bullhorn text-yellow-600 text-xl"></i>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Marketing Teams</h3>
                  <ul className="space-y-2 text-gray-600 text-sm">
                    <li>• Convert brochures for digital campaigns</li>
                    <li>• Create social media content from PDFs</li>
                    <li>• Extract product images from catalogs</li>
                    <li>• Generate web banners from print materials</li>
                    <li>• Archive marketing materials visually</li>
                    <li>• Repurpose content across multiple channels</li>
                  </ul>
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <p className="text-xs text-gray-500 italic">Maximize content reach across all marketing channels</p>
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

          {/* Comprehensive Tool Integration Section */}
          <section className="py-16 bg-white">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Complete PDF Workflow Integration</h2>
                <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                  Maximize your productivity by combining our PDF to Images Enhanced tool with other powerful PDF utilities for a complete document management solution.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 hover:shadow-lg transition-all border border-blue-200">
                  <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mb-4">
                    <i className="fas fa-photo-video text-white text-xl"></i>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">Images to PDF Merger</h3>
                  <p className="text-gray-700 text-sm mb-4">Reverse the process! Combine multiple images into a single PDF document with custom layouts, page sizing, and professional formatting options.</p>
                  <a href="/tools/images-to-pdf-merger" className="text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center">
                    Merge Images to PDF <i className="fas fa-arrow-right ml-2"></i>
                  </a>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 hover:shadow-lg transition-all border border-green-200">
                  <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center mb-4">
                    <i className="fas fa-compress text-white text-xl"></i>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">Advanced PDF Compressor</h3>
                  <p className="text-gray-700 text-sm mb-4">Reduce PDF file size before conversion to optimize processing speed and storage. Maintain quality while significantly reducing file size.</p>
                  <a href="/tools/pdf-compressor-advanced" className="text-green-600 hover:text-green-700 font-medium text-sm flex items-center">
                    Compress PDFs <i className="fas fa-arrow-right ml-2"></i>
                  </a>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 hover:shadow-lg transition-all border border-purple-200">
                  <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center mb-4">
                    <i className="fas fa-cut text-white text-xl"></i>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">Split PDF Tool</h3>
                  <p className="text-gray-700 text-sm mb-4">Extract specific pages or split large PDFs into smaller sections before converting to images for better organization and processing.</p>
                  <a href="/tools/split-pdf-tool" className="text-purple-600 hover:text-purple-700 font-medium text-sm flex items-center">
                    Split PDFs <i className="fas fa-arrow-right ml-2"></i>
                  </a>
                </div>

                <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-6 hover:shadow-lg transition-all border border-orange-200">
                  <div className="w-12 h-12 bg-orange-600 rounded-lg flex items-center justify-center mb-4">
                    <i className="fas fa-sync-alt text-white text-xl"></i>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">PDF Page Organizer</h3>
                  <p className="text-gray-700 text-sm mb-4">Reorder, duplicate, or rearrange PDF pages before converting to images to ensure perfect document structure and flow.</p>
                  <a href="/tools/organize-pdf-pages-tool" className="text-orange-600 hover:text-orange-700 font-medium text-sm flex items-center">
                    Organize Pages <i className="fas fa-arrow-right ml-2"></i>
                  </a>
                </div>

                <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-6 hover:shadow-lg transition-all border border-red-200">
                  <div className="w-12 h-12 bg-red-600 rounded-lg flex items-center justify-center mb-4">
                    <i className="fas fa-redo text-white text-xl"></i>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">PDF Rotation Tool</h3>
                  <p className="text-gray-700 text-sm mb-4">Correct page orientation before converting to images to ensure proper viewing and professional presentation of your converted content.</p>
                  <a href="/tools/rotate-pdf-tool" className="text-red-600 hover:text-red-700 font-medium text-sm flex items-center">
                    Rotate PDF Pages <i className="fas fa-arrow-right ml-2"></i>
                  </a>
                </div>

                <div className="bg-gradient-to-br from-teal-50 to-teal-100 rounded-xl p-6 hover:shadow-lg transition-all border border-teal-200">
                  <div className="w-12 h-12 bg-teal-600 rounded-lg flex items-center justify-center mb-4">
                    <i className="fas fa-unlock text-white text-xl"></i>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">PDF Unlock Tool</h3>
                  <p className="text-gray-700 text-sm mb-4">Remove password protection from PDFs before converting to images, enabling processing of secured documents with proper authorization.</p>
                  <a href="/tools/unlock-pdf-tool" className="text-teal-600 hover:text-teal-700 font-medium text-sm flex items-center">
                    Unlock PDFs <i className="fas fa-arrow-right ml-2"></i>
                  </a>
                </div>
              </div>

              <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl p-8 border border-gray-200">
                <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">Recommended Workflow Combinations</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="bg-white rounded-lg p-6 border border-gray-200">
                    <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                      <span className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center mr-3">
                        <i className="fas fa-star text-white text-sm"></i>
                      </span>
                      Web Publishing Workflow
                    </h4>
                    <ol className="space-y-2 text-gray-600 text-sm">
                      <li>1. <a href="/tools/pdf-compressor-advanced" className="text-blue-600 hover:underline">Compress PDF</a> for faster processing</li>
                      <li>2. <a href="/tools/split-pdf-tool" className="text-blue-600 hover:underline">Split PDF</a> to extract specific sections</li>
                      <li>3. Use PDF to Images Enhanced for web-ready images</li>
                      <li>4. Optimize images for your website or blog</li>
                    </ol>
                  </div>
                  
                  <div className="bg-white rounded-lg p-6 border border-gray-200">
                    <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                      <span className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center mr-3">
                        <i className="fas fa-briefcase text-white text-sm"></i>
                      </span>
                      Professional Documentation
                    </h4>
                    <ol className="space-y-2 text-gray-600 text-sm">
                      <li>1. <a href="/tools/organize-pdf-pages-tool" className="text-green-600 hover:underline">Organize PDF pages</a> in correct order</li>
                      <li>2. <a href="/tools/rotate-pdf-tool" className="text-green-600 hover:underline">Rotate pages</a> to proper orientation</li>
                      <li>3. Convert to high-resolution images</li>
                      <li>4. Use for presentations and reports</li>
                    </ol>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Additional Related Tools Section */}
          <section className="py-12 bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold mb-4">Explore More PDF Tools</h2>
                <p className="text-indigo-100">Discover additional tools to enhance your PDF workflow</p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <a href="/tools/merge-pdf-tool" className="bg-white bg-opacity-10 rounded-lg p-4 hover:bg-opacity-20 transition-all text-center">
                  <i className="fas fa-object-group text-white text-2xl mb-2 block"></i>
                  <span className="text-sm">Merge PDFs</span>
                </a>
                <a href="/tools/add-page-numbers-tool" className="bg-white bg-opacity-10 rounded-lg p-4 hover:bg-opacity-20 transition-all text-center">
                  <i className="fas fa-list-ol text-white text-2xl mb-2 block"></i>
                  <span className="text-sm">Add Page Numbers</span>
                </a>
                <a href="/tools/pdf-header-footer-generator" className="bg-white bg-opacity-10 rounded-lg p-4 hover:bg-opacity-20 transition-all text-center">
                  <i className="fas fa-align-center text-white text-2xl mb-2 block"></i>
                  <span className="text-sm">Add Headers/Footers</span>
                </a>
                <a href="/tools/extract-pdf-pages-tool" className="bg-white bg-opacity-10 rounded-lg p-4 hover:bg-opacity-20 transition-all text-center">
                  <i className="fas fa-file-export text-white text-2xl mb-2 block"></i>
                  <span className="text-sm">Extract Pages</span>
                </a>
                <a href="/tools/protect-pdf-tool" className="bg-white bg-opacity-10 rounded-lg p-4 hover:bg-opacity-20 transition-all text-center">
                  <i className="fas fa-lock text-white text-2xl mb-2 block"></i>
                  <span className="text-sm">Protect PDF</span>
                </a>
                <a href="/tools/pdf-editor-tool" className="bg-white bg-opacity-10 rounded-lg p-4 hover:bg-opacity-20 transition-all text-center">
                  <i className="fas fa-edit text-white text-2xl mb-2 block"></i>
                  <span className="text-sm">Edit PDF</span>
                </a>
                <a href="/tools/pdf-blank-page-remover" className="bg-white bg-opacity-10 rounded-lg p-4 hover:bg-opacity-20 transition-all text-center">
                  <i className="fas fa-eraser text-white text-2xl mb-2 block"></i>
                  <span className="text-sm">Remove Blank Pages</span>
                </a>
                <a href="/tools/pdf-tools" className="bg-white bg-opacity-10 rounded-lg p-4 hover:bg-opacity-20 transition-all text-center">
                  <i className="fas fa-tools text-white text-2xl mb-2 block"></i>
                  <span className="text-sm">All PDF Tools</span>
                </a>
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
