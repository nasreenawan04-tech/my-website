import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import PDFViewer from '@/components/PDFViewer';
import { 
  Upload, FileText, Merge, Split, RotateCw, Shield, 
  Archive, Image, Type, Eye, Download, Trash2, 
  Settings, Zap, Lock, Unlock 
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function PDFEditor() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [selectedPages, setSelectedPages] = useState<number[]>([]);
  const [activeTab, setActiveTab] = useState('upload');
  const [ocrResults, setOcrResults] = useState<any[]>([]);
  const [pageImages, setPageImages] = useState<any[]>([]);
  const { toast } = useToast();

  // Form states
  const [password, setPassword] = useState('');
  const [ownerPassword, setOwnerPassword] = useState('');
  const [rotationAngle, setRotationAngle] = useState('90');
  const [compressionQuality, setCompressionQuality] = useState('screen');
  const [imageFormat, setImageFormat] = useState('png');
  const [textToAdd, setTextToAdd] = useState('');
  const [pageOrder, setPageOrder] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const [dragOverMulti, setDragOverMulti] = useState(false);
  
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      setSelectedFile(files[0]);
      setSelectedPages([]);
      setActiveTab('viewer');
    }
  };

  const handleMultipleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      setSelectedFiles(files);
    }
  };

  const handleDrop = (e: React.DragEvent, isMultiple: boolean = false) => {
    e.preventDefault();
    setDragOver(false);
    setDragOverMulti(false);
    
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      // Filter PDF files only
      const pdfFiles = Array.from(files).filter(file => file.type === 'application/pdf');
      
      if (pdfFiles.length === 0) {
        toast({
          title: 'Invalid File Type',
          description: 'Please select PDF files only.',
          variant: 'destructive',
        });
        return;
      }
      
      if (isMultiple) {
        // Create a FileList-like object for multiple files
        const dt = new DataTransfer();
        pdfFiles.forEach(file => dt.items.add(file));
        setSelectedFiles(dt.files);
      } else {
        setSelectedFile(pdfFiles[0]);
        setSelectedPages([]);
        setActiveTab('viewer');
      }
    }
  };

  const handleDragOver = (e: React.DragEvent, isMultiple: boolean = false) => {
    e.preventDefault();
    if (isMultiple) {
      setDragOverMulti(true);
    } else {
      setDragOver(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent, isMultiple: boolean = false) => {
    e.preventDefault();
    if (isMultiple) {
      setDragOverMulti(false);
    } else {
      setDragOver(false);
    }
  };

  const handlePageSelect = useCallback((pageNumber: number) => {
    setSelectedPages(prev => {
      if (prev.includes(pageNumber)) {
        return prev.filter(p => p !== pageNumber);
      } else {
        return [...prev, pageNumber];
      }
    });
  }, []);

  const processOperation = async (endpoint: string, formData: FormData, filename?: string) => {
    setProcessing(true);
    setProgress(0);

    try {
      const response = await fetch(`/api/${endpoint}`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Operation failed');
      }

      const contentType = response.headers.get('content-type');
      
      if (contentType?.includes('application/pdf')) {
        // Download PDF file
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename || `processed-${Date.now()}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        
        toast({
          title: 'Success',
          description: 'PDF processed and downloaded successfully.',
        });
      } else {
        // JSON response (OCR, split, etc.)
        const result = await response.json();
        return result;
      }
    } catch (error) {
      console.error('Processing error:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'An error occurred during processing.',
        variant: 'destructive',
      });
      throw error;
    } finally {
      setProcessing(false);
      setProgress(100);
    }
  };

  const encryptPDF = async () => {
    if (!selectedFile || !password) {
      toast({ title: 'Error', description: 'Please select a file and enter a password.', variant: 'destructive' });
      return;
    }

    const formData = new FormData();
    formData.append('pdf', selectedFile);
    formData.append('userPassword', password);
    if (ownerPassword) formData.append('ownerPassword', ownerPassword);
    formData.append('allowPrinting', 'false');
    formData.append('allowModifying', 'false');
    formData.append('allowCopying', 'false');
    formData.append('keyLength', '256');

    await processOperation('encrypt-pdf', formData, `encrypted-${selectedFile.name}`);
  };

  const unlockPDF = async () => {
    if (!selectedFile || !password) {
      toast({ title: 'Error', description: 'Please select a file and enter the password.', variant: 'destructive' });
      return;
    }

    const formData = new FormData();
    formData.append('pdf', selectedFile);
    formData.append('password', password);

    await processOperation('unlock-pdf', formData, `unlocked-${selectedFile.name}`);
  };

  const mergePDFs = async () => {
    if (!selectedFiles || selectedFiles.length < 2) {
      toast({ title: 'Error', description: 'Please select at least 2 PDF files to merge.', variant: 'destructive' });
      return;
    }

    const formData = new FormData();
    Array.from(selectedFiles).forEach(file => {
      formData.append('pdfs', file);
    });

    await processOperation('merge-pdf', formData, 'merged-document.pdf');
  };

  const splitPDF = async () => {
    if (!selectedFile) {
      toast({ title: 'Error', description: 'Please select a PDF file.', variant: 'destructive' });
      return;
    }

    const formData = new FormData();
    formData.append('pdf', selectedFile);
    if (selectedPages.length > 0) {
      formData.append('splitPages', JSON.stringify(selectedPages.map(p => p - 1))); // Convert to 0-based
    }

    try {
      const result = await processOperation('split-pdf', formData);
      if (result?.files) {
        // Handle multiple file download
        result.files.forEach((file: any, index: number) => {
          const blob = new Blob([Buffer.from(file.data, 'base64')], { type: 'application/pdf' });
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = file.filename;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          window.URL.revokeObjectURL(url);
        });
        
        toast({
          title: 'Success',
          description: `PDF split into ${result.files.length} files and downloaded.`,
        });
      }
    } catch (error) {
      // Error handled in processOperation
    }
  };

  const rotatePDF = async () => {
    if (!selectedFile) {
      toast({ title: 'Error', description: 'Please select a PDF file.', variant: 'destructive' });
      return;
    }

    const formData = new FormData();
    formData.append('pdf', selectedFile);
    formData.append('rotation', rotationAngle);
    if (selectedPages.length > 0) {
      formData.append('pageIndices', JSON.stringify(selectedPages.map(p => p - 1))); // Convert to 0-based
    }

    await processOperation('rotate-pdf', formData, `rotated-${selectedFile.name}`);
  };

  const compressPDF = async () => {
    if (!selectedFile) {
      toast({ title: 'Error', description: 'Please select a PDF file.', variant: 'destructive' });
      return;
    }

    const formData = new FormData();
    formData.append('pdf', selectedFile);

    await processOperation('compress-pdf', formData, `compressed-${selectedFile.name}`);
  };

  const extractTextOCR = async () => {
    if (!selectedFile) {
      toast({ title: 'Error', description: 'Please select a PDF file.', variant: 'destructive' });
      return;
    }

    const formData = new FormData();
    formData.append('pdf', selectedFile);

    try {
      const result = await processOperation('ocr-pdf', formData);
      if (result?.pages) {
        setOcrResults(result.pages);
        setActiveTab('ocr-results');
        
        toast({
          title: 'Success',
          description: `Text extracted from ${result.pages.length} pages.`,
        });
      }
    } catch (error) {
      // Error handled in processOperation
    }
  };

  const convertToImages = async () => {
    if (!selectedFile) {
      toast({ title: 'Error', description: 'Please select a PDF file.', variant: 'destructive' });
      return;
    }

    const formData = new FormData();
    formData.append('pdf', selectedFile);
    formData.append('format', imageFormat);
    formData.append('quality', '150');

    try {
      const result = await processOperation('pdf-to-images', formData);
      if (result?.images) {
        setPageImages(result.images);
        setActiveTab('image-results');
        
        toast({
          title: 'Success',
          description: `PDF converted to ${result.images.length} ${imageFormat.toUpperCase()} images.`,
        });
      }
    } catch (error) {
      // Error handled in processOperation
    }
  };

  const downloadImage = (imageData: string, filename: string) => {
    const blob = new Blob([Buffer.from(imageData, 'base64')], { type: `image/${imageFormat}` });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const resetAll = () => {
    setSelectedFile(null);
    setSelectedFiles(null);
    setSelectedPages([]);
    setPassword('');
    setOwnerPassword('');
    setTextToAdd('');
    setPageOrder('');
    setOcrResults([]);
    setPageImages([]);
    setActiveTab('upload');
  };

  return (
    <div className="container mx-auto py-6 px-4 max-w-7xl" data-testid="pdf-editor-page">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">PDF Editor</h1>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
          Comprehensive PDF editing tools - merge, split, rotate, compress, add passwords, extract text with OCR, and convert to images
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="upload" data-testid="tab-upload">Upload</TabsTrigger>
          <TabsTrigger value="viewer" data-testid="tab-viewer">Viewer</TabsTrigger>
          <TabsTrigger value="operations" data-testid="tab-operations">Operations</TabsTrigger>
          <TabsTrigger value="security" data-testid="tab-security">Security</TabsTrigger>
          <TabsTrigger value="ocr-results" data-testid="tab-ocr-results">OCR Results</TabsTrigger>
          <TabsTrigger value="image-results" data-testid="tab-image-results">Images</TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="mt-6">
          <div className="grid md:grid-cols-2 gap-6">
            <Card data-testid="card-single-upload">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Single PDF Upload
                </CardTitle>
                <CardDescription>
                  Upload a single PDF for editing, viewing, or processing
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div 
                    className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                      dragOver 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                    onClick={() => document.getElementById('single-pdf-upload')?.click()}
                    onDrop={(e) => handleDrop(e, false)}
                    onDragOver={(e) => handleDragOver(e, false)}
                    onDragLeave={(e) => handleDragLeave(e, false)}
                  >
                    <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Drag and drop PDF file here
                    </h3>
                    <p className="text-gray-600 mb-4">
                      or click to select a file from your computer
                    </p>
                    <Button variant="outline" className="mb-2" data-testid="button-choose-file">
                      Choose PDF File
                    </Button>
                    <Input
                      type="file"
                      accept=".pdf,application/pdf"
                      onChange={handleFileUpload}
                      className="hidden"
                      id="single-pdf-upload"
                      data-testid="input-single-pdf"
                    />
                    {selectedFile && (
                      <p className="text-sm text-gray-600 mt-2" data-testid="text-selected-file">
                        Selected: {selectedFile.name}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card data-testid="card-multi-upload">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Merge className="h-5 w-5" />
                  Multiple PDFs Upload
                </CardTitle>
                <CardDescription>
                  Upload multiple PDFs for merging operations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div 
                    className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                      dragOverMulti 
                        ? 'border-green-500 bg-green-50' 
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                    onClick={() => document.getElementById('multi-pdf-upload')?.click()}
                    onDrop={(e) => handleDrop(e, true)}
                    onDragOver={(e) => handleDragOver(e, true)}
                    onDragLeave={(e) => handleDragLeave(e, true)}
                  >
                    <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Drag and drop PDF files here
                    </h3>
                    <p className="text-gray-600 mb-4">
                      or click to select multiple files from your computer
                    </p>
                    <Button variant="outline" className="mb-2" data-testid="button-choose-files">
                      Choose Multiple PDFs
                    </Button>
                    <Input
                      type="file"
                      accept=".pdf,application/pdf"
                      multiple
                      onChange={handleMultipleFileUpload}
                      className="hidden"
                      id="multi-pdf-upload"
                      data-testid="input-multi-pdf"
                    />
                    {selectedFiles && (
                      <div className="mt-2 text-sm text-gray-600" data-testid="text-selected-files">
                        <p>{selectedFiles.length} files selected:</p>
                        <ul className="text-left mt-1 max-h-32 overflow-y-auto">
                          {Array.from(selectedFiles).map((file, index) => (
                            <li key={index} className="truncate">• {file.name}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="viewer" className="mt-6">
          <Card data-testid="card-pdf-viewer">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                PDF Viewer
              </CardTitle>
              <CardDescription>
                View your PDF and select pages for operations. Click on pages to select/deselect them.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PDFViewer
                file={selectedFile}
                selectedPages={selectedPages}
                onPageSelect={handlePageSelect}
                multiSelect={true}
              />
              
              {selectedPages.length > 0 && (
                <Alert className="mt-4">
                  <AlertDescription>
                    Selected pages: {selectedPages.sort((a, b) => a - b).join(', ')}
                    <Button
                      variant="outline"
                      size="sm"
                      className="ml-2"
                      onClick={() => setSelectedPages([])}
                      data-testid="button-clear-selection"
                    >
                      Clear Selection
                    </Button>
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="operations" className="mt-6">
          <div className="grid md:grid-cols-2 gap-6">
            <Card data-testid="card-merge-split">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Merge className="h-5 w-5" />
                  Merge & Split
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button
                  onClick={mergePDFs}
                  disabled={processing}
                  className="w-full"
                  data-testid="button-merge-pdfs"
                >
                  <Merge className="h-4 w-4 mr-2" />
                  Merge PDFs
                </Button>
                
                <Button
                  onClick={splitPDF}
                  disabled={processing || !selectedFile}
                  variant="outline"
                  className="w-full"
                  data-testid="button-split-pdf"
                >
                  <Split className="h-4 w-4 mr-2" />
                  Split PDF {selectedPages.length > 0 && `(${selectedPages.length} pages)`}
                </Button>
              </CardContent>
            </Card>

            <Card data-testid="card-rotate-compress">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <RotateCw className="h-5 w-5" />
                  Rotate & Compress
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="rotation">Rotation Angle</Label>
                  <Select value={rotationAngle} onValueChange={setRotationAngle}>
                    <SelectTrigger data-testid="select-rotation">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="90">90°</SelectItem>
                      <SelectItem value="180">180°</SelectItem>
                      <SelectItem value="270">270°</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <Button
                  onClick={rotatePDF}
                  disabled={processing || !selectedFile}
                  variant="outline"
                  className="w-full"
                  data-testid="button-rotate-pdf"
                >
                  <RotateCw className="h-4 w-4 mr-2" />
                  Rotate PDF
                </Button>
                
                <Button
                  onClick={compressPDF}
                  disabled={processing || !selectedFile}
                  variant="outline"
                  className="w-full"
                  data-testid="button-compress-pdf"
                >
                  <Archive className="h-4 w-4 mr-2" />
                  Compress PDF
                </Button>
              </CardContent>
            </Card>

            <Card data-testid="card-ocr-convert">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Type className="h-5 w-5" />
                  OCR & Convert
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button
                  onClick={extractTextOCR}
                  disabled={processing || !selectedFile}
                  variant="outline"
                  className="w-full"
                  data-testid="button-extract-text"
                >
                  <Type className="h-4 w-4 mr-2" />
                  Extract Text (OCR)
                </Button>

                <div className="space-y-2">
                  <Label>Image Format</Label>
                  <Select value={imageFormat} onValueChange={setImageFormat}>
                    <SelectTrigger data-testid="select-image-format">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="png">PNG</SelectItem>
                      <SelectItem value="jpg">JPEG</SelectItem>
                      <SelectItem value="webp">WebP</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <Button
                  onClick={convertToImages}
                  disabled={processing || !selectedFile}
                  variant="outline"
                  className="w-full"
                  data-testid="button-convert-images"
                >
                  <Image className="h-4 w-4 mr-2" />
                  Convert to Images
                </Button>
              </CardContent>
            </Card>

            <Card data-testid="card-utilities">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Utilities
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button
                  onClick={resetAll}
                  variant="destructive"
                  className="w-full"
                  data-testid="button-reset-all"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Reset All
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="security" className="mt-6">
          <div className="grid md:grid-cols-2 gap-6">
            <Card data-testid="card-encrypt">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="h-5 w-5" />
                  Encrypt PDF
                </CardTitle>
                <CardDescription>
                  Add password protection to your PDF
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="user-password">User Password *</Label>
                  <Input
                    id="user-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password (min 4 characters)"
                    data-testid="input-password"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="owner-password">Owner Password (Optional)</Label>
                  <Input
                    id="owner-password"
                    type="password"
                    value={ownerPassword}
                    onChange={(e) => setOwnerPassword(e.target.value)}
                    placeholder="Enter owner password"
                    data-testid="input-owner-password"
                  />
                </div>
                
                <Button
                  onClick={encryptPDF}
                  disabled={processing || !selectedFile || !password}
                  className="w-full"
                  data-testid="button-encrypt-pdf"
                >
                  <Lock className="h-4 w-4 mr-2" />
                  Encrypt PDF
                </Button>
              </CardContent>
            </Card>

            <Card data-testid="card-decrypt">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Unlock className="h-5 w-5" />
                  Unlock PDF
                </CardTitle>
                <CardDescription>
                  Remove password protection from your PDF
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="unlock-password">PDF Password</Label>
                  <Input
                    id="unlock-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter PDF password"
                    data-testid="input-unlock-password"
                  />
                </div>
                
                <Button
                  onClick={unlockPDF}
                  disabled={processing || !selectedFile || !password}
                  variant="outline"
                  className="w-full"
                  data-testid="button-unlock-pdf"
                >
                  <Unlock className="h-4 w-4 mr-2" />
                  Unlock PDF
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="ocr-results" className="mt-6">
          <Card data-testid="card-ocr-results">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Type className="h-5 w-5" />
                OCR Results
              </CardTitle>
              <CardDescription>
                Extracted text from your PDF pages
              </CardDescription>
            </CardHeader>
            <CardContent>
              {ocrResults.length > 0 ? (
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {ocrResults.map((result, index) => (
                    <div key={index} className="border rounded-lg p-4" data-testid={`ocr-result-${index}`}>
                      <h3 className="font-medium mb-2">Page {result.page}</h3>
                      <Textarea
                        value={result.text}
                        readOnly
                        className="min-h-[100px] resize-none"
                        data-testid={`textarea-ocr-${index}`}
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">No OCR results yet. Use the Extract Text (OCR) function first.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="image-results" className="mt-6">
          <Card data-testid="card-image-results">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Image className="h-5 w-5" />
                Converted Images
              </CardTitle>
              <CardDescription>
                PDF pages converted to images
              </CardDescription>
            </CardHeader>
            <CardContent>
              {pageImages.length > 0 ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {pageImages.map((image, index) => (
                    <div key={index} className="border rounded-lg p-4 text-center" data-testid={`image-result-${index}`}>
                      <h3 className="font-medium mb-2">Page {image.page}</h3>
                      <img
                        src={`data:image/${imageFormat};base64,${image.data}`}
                        alt={`Page ${image.page}`}
                        className="w-full max-w-[200px] mx-auto mb-2 border"
                        data-testid={`img-page-${index}`}
                      />
                      <p className="text-xs text-gray-500 mb-2">Size: {Math.round(image.size / 1024)}KB</p>
                      <Button
                        size="sm"
                        onClick={() => downloadImage(image.data, image.filename)}
                        data-testid={`button-download-${index}`}
                      >
                        <Download className="h-3 w-3 mr-1" />
                        Download
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">No images yet. Use the Convert to Images function first.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {processing && (
        <div className="fixed bottom-4 right-4 bg-white border border-gray-200 rounded-lg shadow-lg p-4 w-80" data-testid="processing-indicator">
          <div className="flex items-center gap-3">
            <Zap className="h-5 w-5 text-blue-600 animate-pulse" />
            <div className="flex-1">
              <p className="font-medium text-sm">Processing...</p>
              <Progress value={progress} className="mt-1" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}