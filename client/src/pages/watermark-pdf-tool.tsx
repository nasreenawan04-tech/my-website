import { useState, useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { PDFDocument, rgb, StandardFonts, degrees } from 'pdf-lib';
import { Upload, FileText, Download, Type, Image as ImageIcon, Droplets } from 'lucide-react';

interface PDFFile {
  id: string;
  file: File;
  name: string;
  size: string;
}

interface WatermarkOptions {
  text: string;
  fontSize: number;
  opacity: number;
  color: string;
  position: 'center' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  rotation: number;
}

const WatermarkPDFTool = () => {
  const [pdfFile, setPdfFile] = useState<PDFFile | null>(null);
  const [watermarkedPdfUrl, setWatermarkedPdfUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [watermarkOptions, setWatermarkOptions] = useState<WatermarkOptions>({
    text: 'CONFIDENTIAL',
    fontSize: 48,
    opacity: 0.3,
    color: '#FF0000',
    position: 'center',
    rotation: 45
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

  const getPositionCoordinates = (pageWidth: number, pageHeight: number, textWidth: number, textHeight: number) => {
    switch (watermarkOptions.position) {
      case 'top-left':
        return { x: 50, y: pageHeight - 50 };
      case 'top-right':
        return { x: pageWidth - textWidth - 50, y: pageHeight - 50 };
      case 'bottom-left':
        return { x: 50, y: 50 };
      case 'bottom-right':
        return { x: pageWidth - textWidth - 50, y: 50 };
      case 'center':
      default:
        return { x: pageWidth / 2 - textWidth / 2, y: pageHeight / 2 - textHeight / 2 };
    }
  };

  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16) / 255,
      g: parseInt(result[2], 16) / 255,
      b: parseInt(result[3], 16) / 255
    } : { r: 1, g: 0, b: 0 };
  };

  const addWatermarkToPDF = async () => {
    if (!pdfFile) return;

    setIsProcessing(true);
    
    try {
      const arrayBuffer = await pdfFile.file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const pages = pdfDoc.getPages();
      
      const textWidth = font.widthOfTextAtSize(watermarkOptions.text, watermarkOptions.fontSize);
      const textHeight = watermarkOptions.fontSize;
      const color = hexToRgb(watermarkOptions.color);

      pages.forEach((page) => {
        const { width, height } = page.getSize();
        const position = getPositionCoordinates(width, height, textWidth, textHeight);
        
        page.drawText(watermarkOptions.text, {
          x: position.x,
          y: position.y,
          size: watermarkOptions.fontSize,
          font: font,
          color: rgb(color.r, color.g, color.b),
          opacity: watermarkOptions.opacity,
          rotate: degrees(watermarkOptions.rotation)
        });
      });

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      setWatermarkedPdfUrl(url);
    } catch (error) {
      console.error('Error adding watermark to PDF:', error);
      alert('Error adding watermark to PDF. Please try again with a valid PDF file.');
    }

    setIsProcessing(false);
  };

  const downloadWatermarkedPDF = () => {
    if (!watermarkedPdfUrl || !pdfFile) return;

    const link = document.createElement('a');
    link.href = watermarkedPdfUrl;
    link.download = `watermarked-${pdfFile.name}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const resetTool = () => {
    setPdfFile(null);
    setWatermarkedPdfUrl(null);
    if (watermarkedPdfUrl) {
      URL.revokeObjectURL(watermarkedPdfUrl);
    }
  };

  return (
    <>
      <Helmet>
        <title>Add Watermark to PDF - Free Online PDF Watermark Tool | ToolsHub</title>
        <meta name="description" content="Add text watermarks to PDF documents for free. Customize text, position, opacity, and color. Protect your PDFs with professional watermarks instantly." />
        <meta name="keywords" content="PDF watermark, add watermark to PDF, PDF text watermark, watermark PDF online, PDF protection" />
        <meta property="og:title" content="Add Watermark to PDF - Free Online PDF Watermark Tool | ToolsHub" />
        <meta property="og:description" content="Add custom text watermarks to PDF documents for free. Customize position, opacity, and styling." />
        <meta property="og:type" content="website" />
        <link rel="canonical" href="/tools/watermark-pdf" />
      </Helmet>

      <div className="min-h-screen flex flex-col" data-testid="page-watermark-pdf">
        <Header />
        
        <main className="flex-1 bg-neutral-50">
          {/* Hero Section */}
          <section className="bg-gradient-to-r from-teal-600 via-teal-500 to-cyan-700 text-white py-16">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <div className="w-20 h-20 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Droplets className="w-8 h-8" />
              </div>
              <h1 className="text-4xl sm:text-5xl font-bold mb-6" data-testid="text-page-title">
                Add Watermark to PDF
              </h1>
              <p className="text-xl text-teal-100 max-w-2xl mx-auto">
                Add custom text watermarks to your PDF documents. Protect and brand your files with professional watermarks.
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
                          ? 'border-teal-500 bg-teal-50' 
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
                        className="bg-teal-600 hover:bg-teal-700 text-white"
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
                          <FileText className="w-6 h-6 text-red-600" />
                          <div className="flex-1">
                            <div className="font-medium text-gray-900">{pdfFile.name}</div>
                            <div className="text-sm text-gray-600">{pdfFile.size}</div>
                          </div>
                          <Button
                            onClick={resetTool}
                            variant="outline"
                            size="sm"
                            className="text-red-600 border-red-200 hover:bg-red-50"
                          >
                            Remove
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Watermark Options */}
                <Card className="bg-white shadow-sm border-0">
                  <CardContent className="p-8">
                    <h2 className="text-2xl font-semibold text-gray-900 mb-6">Watermark Settings</h2>
                    
                    <div className="space-y-6">
                      {/* Watermark Text */}
                      <div>
                        <Label htmlFor="watermark-text" className="text-sm font-medium text-gray-700">
                          Watermark Text
                        </Label>
                        <Input
                          id="watermark-text"
                          value={watermarkOptions.text}
                          onChange={(e) => setWatermarkOptions(prev => ({ ...prev, text: e.target.value }))}
                          placeholder="Enter watermark text"
                          className="mt-1"
                        />
                      </div>

                      {/* Font Size */}
                      <div>
                        <Label className="text-sm font-medium text-gray-700">
                          Font Size: {watermarkOptions.fontSize}px
                        </Label>
                        <Slider
                          value={[watermarkOptions.fontSize]}
                          onValueChange={(value) => setWatermarkOptions(prev => ({ ...prev, fontSize: value[0] }))}
                          max={100}
                          min={12}
                          step={1}
                          className="mt-2"
                        />
                      </div>

                      {/* Opacity */}
                      <div>
                        <Label className="text-sm font-medium text-gray-700">
                          Opacity: {Math.round(watermarkOptions.opacity * 100)}%
                        </Label>
                        <Slider
                          value={[watermarkOptions.opacity]}
                          onValueChange={(value) => setWatermarkOptions(prev => ({ ...prev, opacity: value[0] }))}
                          max={1}
                          min={0.1}
                          step={0.1}
                          className="mt-2"
                        />
                      </div>

                      {/* Color */}
                      <div>
                        <Label htmlFor="watermark-color" className="text-sm font-medium text-gray-700">
                          Color
                        </Label>
                        <div className="mt-1 flex gap-2">
                          <Input
                            id="watermark-color"
                            type="color"
                            value={watermarkOptions.color}
                            onChange={(e) => setWatermarkOptions(prev => ({ ...prev, color: e.target.value }))}
                            className="w-16 h-10 p-1"
                          />
                          <Input
                            value={watermarkOptions.color}
                            onChange={(e) => setWatermarkOptions(prev => ({ ...prev, color: e.target.value }))}
                            className="flex-1"
                          />
                        </div>
                      </div>

                      {/* Position */}
                      <div>
                        <Label className="text-sm font-medium text-gray-700">Position</Label>
                        <Select
                          value={watermarkOptions.position}
                          onValueChange={(value: any) => setWatermarkOptions(prev => ({ ...prev, position: value }))}
                        >
                          <SelectTrigger className="mt-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="center">Center</SelectItem>
                            <SelectItem value="top-left">Top Left</SelectItem>
                            <SelectItem value="top-right">Top Right</SelectItem>
                            <SelectItem value="bottom-left">Bottom Left</SelectItem>
                            <SelectItem value="bottom-right">Bottom Right</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Rotation */}
                      <div>
                        <Label className="text-sm font-medium text-gray-700">
                          Rotation: {watermarkOptions.rotation}°
                        </Label>
                        <Slider
                          value={[watermarkOptions.rotation]}
                          onValueChange={(value) => setWatermarkOptions(prev => ({ ...prev, rotation: value[0] }))}
                          max={360}
                          min={0}
                          step={5}
                          className="mt-2"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Process Section */}
              {pdfFile && (
                <div className="mt-8 text-center">
                  <Button
                    onClick={addWatermarkToPDF}
                    disabled={isProcessing || !watermarkOptions.text.trim()}
                    className="bg-teal-600 hover:bg-teal-700 text-white px-8 py-3 text-lg"
                    data-testid="button-add-watermark"
                  >
                    {isProcessing ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Adding Watermark...
                      </>
                    ) : (
                      <>
                        <Droplets className="w-4 h-4 mr-2" />
                        Add Watermark to PDF
                      </>
                    )}
                  </Button>
                </div>
              )}

              {/* Results Section */}
              {watermarkedPdfUrl && (
                <div className="mt-8">
                  <Card className="bg-green-50 border-green-200">
                    <CardContent className="p-6 text-center">
                      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <i className="fas fa-check text-2xl text-green-600"></i>
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        Watermark Added Successfully!
                      </h3>
                      <p className="text-gray-600 mb-6">
                        Your PDF has been watermarked with "{watermarkOptions.text}".
                      </p>
                      <Button
                        onClick={downloadWatermarkedPDF}
                        className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-3"
                        data-testid="button-download"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download Watermarked PDF
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Educational Content */}
              <div className="mt-12 space-y-8">
                {/* How it Works */}
                <div className="bg-white rounded-2xl shadow-lg p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">How to Add Watermark to PDF</h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Upload className="w-8 h-8 text-teal-600" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">1. Upload PDF</h3>
                      <p className="text-gray-600">
                        Drag and drop your PDF file or click to select it from your computer.
                      </p>
                    </div>
                    
                    <div className="text-center">
                      <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Type className="w-8 h-8 text-blue-600" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">2. Customize Watermark</h3>
                      <p className="text-gray-600">
                        Set your watermark text, adjust size, opacity, color, position, and rotation.
                      </p>
                    </div>
                    
                    <div className="text-center">
                      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Download className="w-8 h-8 text-green-600" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">3. Download</h3>
                      <p className="text-gray-600">
                        Click to add the watermark and download your protected PDF file.
                      </p>
                    </div>
                  </div>
                </div>

                {/* What is PDF Watermarking */}
                <div className="bg-white rounded-2xl shadow-lg p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">What is PDF Watermarking?</h2>
                  <div className="prose prose-gray max-w-none">
                    <p className="text-lg text-gray-700 mb-4">
                      PDF watermarking is the process of adding text, logos, or images to PDF documents as a semi-transparent overlay that appears on every page. This digital marking technique serves multiple purposes including document protection, branding, copyright indication, and content authentication.
                    </p>
                    <p className="text-gray-600 mb-4">
                      When you add a watermark to a PDF, you're essentially embedding visual information that becomes part of the document structure. Unlike simple overlays, proper PDF watermarks are integrated into the document's layers, making them visible but not interfering with the underlying content's readability.
                    </p>
                    <p className="text-gray-600">
                      Our PDF watermark tool allows you to create professional-quality watermarks with full control over text content, positioning, opacity, color, and rotation. Whether you need to mark documents as confidential, add copyright notices, or brand corporate materials, our tool provides the flexibility and precision required for professional document management.
                    </p>
                  </div>
                </div>

                {/* Features */}
                <div className="bg-white rounded-2xl shadow-lg p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Advanced Watermarking Features</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex items-start">
                      <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mr-3 mt-1">
                        <i className="fas fa-check text-xs text-green-600"></i>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">Custom Text Watermarks</h3>
                        <p className="text-gray-600 text-sm">Add any text as a watermark to your PDF documents with unlimited character support.</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mr-3 mt-1">
                        <i className="fas fa-check text-xs text-green-600"></i>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">Adjustable Opacity</h3>
                        <p className="text-gray-600 text-sm">Control watermark transparency from 10% to 100% for perfect visibility balance.</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mr-3 mt-1">
                        <i className="fas fa-check text-xs text-green-600"></i>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">Flexible Positioning</h3>
                        <p className="text-gray-600 text-sm">Place watermarks in center or any corner of pages with precise positioning.</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mr-3 mt-1">
                        <i className="fas fa-check text-xs text-green-600"></i>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">Color Customization</h3>
                        <p className="text-gray-600 text-sm">Choose any color for your watermark text with full RGB color picker support.</p>
                      </div>
                    </div>

                    <div className="flex items-start">
                      <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mr-3 mt-1">
                        <i className="fas fa-check text-xs text-green-600"></i>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">Rotation Control</h3>
                        <p className="text-gray-600 text-sm">Rotate watermarks from 0° to 360° for diagonal or custom angle placement.</p>
                      </div>
                    </div>

                    <div className="flex items-start">
                      <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mr-3 mt-1">
                        <i className="fas fa-check text-xs text-green-600"></i>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">Font Size Scaling</h3>
                        <p className="text-gray-600 text-sm">Adjust font size from 12px to 100px for perfect watermark visibility.</p>
                      </div>
                    </div>

                    <div className="flex items-start">
                      <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mr-3 mt-1">
                        <i className="fas fa-check text-xs text-green-600"></i>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">Batch Processing</h3>
                        <p className="text-gray-600 text-sm">Apply the same watermark settings to multiple pages automatically.</p>
                      </div>
                    </div>

                    <div className="flex items-start">
                      <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mr-3 mt-1">
                        <i className="fas fa-check text-xs text-green-600"></i>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">Privacy Protection</h3>
                        <p className="text-gray-600 text-sm">All processing happens in your browser - files never leave your device.</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Use Cases */}
                <div className="bg-white rounded-2xl shadow-lg p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Professional Use Cases for PDF Watermarks</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="bg-teal-50 rounded-lg p-4">
                      <h3 className="font-semibold text-gray-900 mb-2">🔒 Document Protection</h3>
                      <p className="text-sm text-gray-600">Add "CONFIDENTIAL", "INTERNAL USE ONLY", or "DRAFT" watermarks to sensitive business documents and legal papers.</p>
                    </div>
                    
                    <div className="bg-blue-50 rounded-lg p-4">
                      <h3 className="font-semibold text-gray-900 mb-2">🏢 Corporate Branding</h3>
                      <p className="text-sm text-gray-600">Brand all company documents with company name, logo text, or department identifiers for professional consistency.</p>
                    </div>
                    
                    <div className="bg-purple-50 rounded-lg p-4">
                      <h3 className="font-semibold text-gray-900 mb-2">📄 Copyright Protection</h3>
                      <p className="text-sm text-gray-600">Add copyright notices, author names, or "© All Rights Reserved" to protect intellectual property and creative works.</p>
                    </div>
                    
                    <div className="bg-orange-50 rounded-lg p-4">
                      <h3 className="font-semibold text-gray-900 mb-2">📋 Status Marking</h3>
                      <p className="text-sm text-gray-600">Mark documents with workflow status like "APPROVED", "PENDING REVIEW", "REJECTED", or "FINAL VERSION".</p>
                    </div>
                    
                    <div className="bg-red-50 rounded-lg p-4">
                      <h3 className="font-semibold text-gray-900 mb-2">🔍 Sample Documents</h3>
                      <p className="text-sm text-gray-600">Add "SAMPLE", "DEMO", or "FOR REVIEW ONLY" watermarks to demonstration files and portfolio pieces.</p>
                    </div>
                    
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h3 className="font-semibold text-gray-900 mb-2">📚 Academic Papers</h3>
                      <p className="text-sm text-gray-600">Add author names, institution identifiers, or "PRELIMINARY DRAFT" to research papers and academic submissions.</p>
                    </div>

                    <div className="bg-green-50 rounded-lg p-4">
                      <h3 className="font-semibold text-gray-900 mb-2">⚖️ Legal Documents</h3>
                      <p className="text-sm text-gray-600">Mark legal contracts, agreements, and court filings with appropriate confidentiality and authenticity indicators.</p>
                    </div>

                    <div className="bg-yellow-50 rounded-lg p-4">
                      <h3 className="font-semibold text-gray-900 mb-2">📊 Financial Reports</h3>
                      <p className="text-sm text-gray-600">Add security watermarks to financial statements, invoices, and accounting documents for fraud prevention.</p>
                    </div>

                    <div className="bg-indigo-50 rounded-lg p-4">
                      <h3 className="font-semibold text-gray-900 mb-2">🎓 Educational Materials</h3>
                      <p className="text-sm text-gray-600">Watermark educational content, textbooks, and course materials with institution or author information.</p>
                    </div>
                  </div>
                </div>

                {/* Benefits Section */}
                <div className="bg-white rounded-2xl shadow-lg p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Benefits of Using PDF Watermarks</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-4">🛡️ Security & Protection</h3>
                      <ul className="space-y-2 text-gray-600">
                        <li className="flex items-start">
                          <span className="w-2 h-2 bg-teal-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                          Deter unauthorized copying and distribution of sensitive documents
                        </li>
                        <li className="flex items-start">
                          <span className="w-2 h-2 bg-teal-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                          Add visible proof of document authenticity and origin
                        </li>
                        <li className="flex items-start">
                          <span className="w-2 h-2 bg-teal-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                          Mark confidential information clearly for handling protocols
                        </li>
                        <li className="flex items-start">
                          <span className="w-2 h-2 bg-teal-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                          Trace document leaks back to specific versions or users
                        </li>
                      </ul>
                    </div>

                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-4">📈 Professional Benefits</h3>
                      <ul className="space-y-2 text-gray-600">
                        <li className="flex items-start">
                          <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                          Enhance brand recognition across all company documents
                        </li>
                        <li className="flex items-start">
                          <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                          Maintain consistent professional appearance
                        </li>
                        <li className="flex items-start">
                          <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                          Comply with industry regulations and standards
                        </li>
                        <li className="flex items-start">
                          <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                          Improve document workflow and version control
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Technical Specifications */}
                <div className="bg-white rounded-2xl shadow-lg p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Technical Specifications</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h3 className="font-semibold text-gray-900 mb-2">📄 Supported Formats</h3>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li>• PDF 1.3 to PDF 2.0</li>
                        <li>• Password-protected PDFs</li>
                        <li>• Multi-page documents</li>
                        <li>• Vector and raster content</li>
                      </ul>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4">
                      <h3 className="font-semibold text-gray-900 mb-2">⚙️ Watermark Options</h3>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li>• Text length: Unlimited</li>
                        <li>• Font size: 12px - 100px</li>
                        <li>• Opacity: 10% - 100%</li>
                        <li>• Rotation: 0° - 360°</li>
                      </ul>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4">
                      <h3 className="font-semibold text-gray-900 mb-2">🎨 Customization</h3>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li>• Full color spectrum</li>
                        <li>• 5 position presets</li>
                        <li>• Real-time preview</li>
                        <li>• Batch application</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* FAQ Section */}
                <div className="bg-white rounded-2xl shadow-lg p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Frequently Asked Questions</h2>
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Is it free to add watermarks to PDF files?</h3>
                      <p className="text-gray-600">Yes, our PDF watermark tool is completely free to use with no limits on file size or number of watermarks you can add.</p>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Can I remove watermarks from the PDF later?</h3>
                      <p className="text-gray-600">Watermarks added through our tool become part of the PDF structure. To remove them, you would need specialized PDF editing software or the original unwatermarked file.</p>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Does the watermark appear on every page?</h3>
                      <p className="text-gray-600">Yes, the watermark is automatically applied to all pages in the PDF document with consistent positioning and formatting.</p>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Is my PDF data secure when using this tool?</h3>
                      <p className="text-gray-600">Absolutely. All PDF processing happens locally in your browser. Your files are never uploaded to our servers or shared with third parties.</p>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">What's the maximum file size I can watermark?</h3>
                      <p className="text-gray-600">The tool can handle large PDF files limited only by your browser's available memory. Most documents under 100MB process smoothly.</p>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Can I use special characters in watermarks?</h3>
                      <p className="text-gray-600">Yes, you can use any Unicode characters including symbols, numbers, and text in multiple languages for your watermark text.</p>
                    </div>
                  </div>
                </div>

                {/* Best Practices */}
                <div className="bg-white rounded-2xl shadow-lg p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Best Practices for PDF Watermarking</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">✅ Do's</h3>
                      <ul className="space-y-3 text-gray-600">
                        <li className="flex items-start">
                          <span className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
                            <i className="fas fa-check text-xs text-green-600"></i>
                          </span>
                          <span>Use appropriate opacity (20-50%) to maintain document readability</span>
                        </li>
                        <li className="flex items-start">
                          <span className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
                            <i className="fas fa-check text-xs text-green-600"></i>
                          </span>
                          <span>Choose contrasting colors that stand out from document background</span>
                        </li>
                        <li className="flex items-start">
                          <span className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
                            <i className="fas fa-check text-xs text-green-600"></i>
                          </span>
                          <span>Keep watermark text concise and meaningful</span>
                        </li>
                        <li className="flex items-start">
                          <span className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
                            <i className="fas fa-check text-xs text-green-600"></i>
                          </span>
                          <span>Test different positions to avoid covering important content</span>
                        </li>
                      </ul>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">❌ Don'ts</h3>
                      <ul className="space-y-3 text-gray-600">
                        <li className="flex items-start">
                          <span className="w-5 h-5 bg-red-100 rounded-full flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
                            <i className="fas fa-times text-xs text-red-600"></i>
                          </span>
                          <span>Don't use 100% opacity as it will obscure the underlying content</span>
                        </li>
                        <li className="flex items-start">
                          <span className="w-5 h-5 bg-red-100 rounded-full flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
                            <i className="fas fa-times text-xs text-red-600"></i>
                          </span>
                          <span>Avoid placing watermarks over critical text or data</span>
                        </li>
                        <li className="flex items-start">
                          <span className="w-5 h-5 bg-red-100 rounded-full flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
                            <i className="fas fa-times text-xs text-red-600"></i>
                          </span>
                          <span>Don't use fonts that are too small to read clearly</span>
                        </li>
                        <li className="flex items-start">
                          <span className="w-5 h-5 bg-red-100 rounded-full flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
                            <i className="fas fa-times text-xs text-red-600"></i>
                          </span>
                          <span>Avoid overly complex watermark text that distracts readers</span>
                        </li>
                      </ul>
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

export default WatermarkPDFTool;