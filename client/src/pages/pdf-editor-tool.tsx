import { useState, useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { 
  Upload, FileText, Download, Trash2, Edit3, Type, Image, 
  Highlighter, Square, Circle, ArrowRight, Minus, Plus,
  RotateCcw, Save, Palette, Move, MousePointer, Hand, X,
  Lock, Settings, Layers, ZoomIn, ZoomOut, ChevronLeft, ChevronRight,
  Archive
} from 'lucide-react';

interface PDFFile {
  id: string;
  file: File;
  name: string;
  size: string;
}

interface PDFPageData {
  totalPages: number;
  pages: Array<{
    index: number;
    width: number;
    height: number;
    ratio: number;
  }>;
}

interface Annotation {
  id: string;
  type: 'text' | 'highlight' | 'rectangle' | 'circle' | 'line' | 'arrow';
  x: number;
  y: number;
  width?: number;
  height?: number;
  text?: string;
  color: string;
  fontSize?: number;
  pageIndex: number;
}

const PDFEditorTool = () => {
  const [pdfFile, setPdfFile] = useState<PDFFile | null>(null);
  const [pageData, setPageData] = useState<PDFPageData | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [selectedTool, setSelectedTool] = useState<string>('pointer');
  const [selectedColor, setSelectedColor] = useState('#ff0000');
  const [fontSize, setFontSize] = useState([16]);
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [editedPdfUrl, setEditedPdfUrl] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [textInput, setTextInput] = useState('');
  const [advancedMode, setAdvancedMode] = useState(false);
  const [encryptionOptions, setEncryptionOptions] = useState({
    password: '',
    allowPrint: true,
    allowModify: false,
    allowCopy: true,
    keyLength: 256
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
      const pdfFileObj = {
        id: generateId(),
        file,
        name: file.name,
        size: formatFileSize(file.size)
      };
      
      setPdfFile(pdfFileObj);
      setPageData(null);
      setAnnotations([]);
      setEditedPdfUrl(null);
      setCurrentPage(0);
      
      await analyzePDF(file);
    } else {
      alert('Please select a valid PDF file. Only PDF files are supported.');
    }
  };

  const analyzePDF = async (file: File) => {
    setIsLoading(true);
    
    try {
      const formData = new FormData();
      formData.append('pdf', file);
      
      const response = await fetch('/api/pdf-page-info', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Server error: ${response.status}`);
      }

      const data = await response.json();
      setPageData(data);
      
    } catch (error) {
      console.error('Error analyzing PDF:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      alert(`Error analyzing PDF: ${errorMessage}. Please try again with a valid PDF file.`);
    }

    setIsLoading(false);
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

  const addAnnotation = (e: React.MouseEvent<HTMLDivElement>) => {
    if (selectedTool === 'pointer' || selectedTool === 'hand') return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const annotation: Annotation = {
      id: generateId(),
      type: selectedTool as any,
      x,
      y,
      color: selectedColor,
      pageIndex: currentPage,
      fontSize: fontSize[0]
    };

    if (selectedTool === 'text') {
      annotation.text = textInput || 'Sample Text';
    }

    if (selectedTool === 'rectangle' || selectedTool === 'highlight') {
      annotation.width = 100;
      annotation.height = 50;
    }

    if (selectedTool === 'circle') {
      annotation.width = 80;
      annotation.height = 80;
    }

    setAnnotations(prev => [...prev, annotation]);
  };

  const removeAnnotation = (id: string) => {
    setAnnotations(prev => prev.filter(ann => ann.id !== id));
  };

  const savePDF = async () => {
    if (!pdfFile || annotations.length === 0) {
      alert('Please add some annotations before saving.');
      return;
    }

    setIsProcessing(true);
    
    try {
      const formData = new FormData();
      formData.append('pdf', pdfFile.file);
      formData.append('annotations', JSON.stringify(annotations));
      
      const response = await fetch('/api/edit-pdf', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Server error: ${response.status}`);
      }

      const editedBlob = await response.blob();
      const url = URL.createObjectURL(editedBlob);
      setEditedPdfUrl(url);
      
    } catch (error) {
      console.error('Error saving PDF:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      alert(`Error saving PDF: ${errorMessage}. Please try again.`);
    }

    setIsProcessing(false);
  };

  const downloadEditedPDF = () => {
    if (!editedPdfUrl || !pdfFile) return;

    const link = document.createElement('a');
    link.href = editedPdfUrl;
    link.download = `edited-${pdfFile.name}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const processAdvancedPDF = async (operation: string) => {
    if (!pdfFile) return;

    setIsProcessing(true);
    try {
      const formData = new FormData();
      formData.append('pdf', pdfFile.file);
      formData.append('operation', operation);
      
      if (operation === 'create_overlay') {
        formData.append('annotations', JSON.stringify(annotations));
      } else if (operation === 'encrypt_with_permissions') {
        formData.append('password', encryptionOptions.password);
        formData.append('allowPrint', encryptionOptions.allowPrint.toString());
        formData.append('allowModify', encryptionOptions.allowModify.toString());
        formData.append('allowCopy', encryptionOptions.allowCopy.toString());
        formData.append('keyLength', encryptionOptions.keyLength.toString());
      }

      const response = await fetch('/api/advanced-edit-pdf', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Server error: ${response.status}`);
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      setEditedPdfUrl(url);
    } catch (error) {
      console.error('Error processing advanced PDF:', error);
      alert('Failed to process PDF with advanced features. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const resetEditor = () => {
    setPdfFile(null);
    setPageData(null);
    setAnnotations([]);
    setEditedPdfUrl(null);
    setCurrentPage(0);
    setSelectedTool('pointer');
    if (editedPdfUrl) {
      URL.revokeObjectURL(editedPdfUrl);
    }
  };

  const currentPageAnnotations = annotations.filter(ann => ann.pageIndex === currentPage);

  return (
    <>
      <Helmet>
        <title>PDF Editor - Edit PDF Files Online | ToolsHub</title>
        <meta name="description" content="Edit PDF files online with our advanced PDF editor. Add text, highlights, shapes, and annotations to your PDF documents." />
        <meta name="keywords" content="PDF editor, edit PDF online, PDF annotations, PDF text editor, PDF markup tool" />
        <meta property="og:title" content="PDF Editor - Edit PDF Files Online | ToolsHub" />
        <meta property="og:description" content="Professional PDF editing tool with annotations, text editing, and markup features." />
        <meta property="og:type" content="website" />
        <link rel="canonical" href="/tools/pdf-editor" />
      </Helmet>

      <div className="min-h-screen flex flex-col" data-testid="page-pdf-editor">
        <Header />
        
        <main className="flex-1 bg-neutral-50">
          {/* Hero Section */}
          <section className="bg-gradient-to-r from-purple-600 via-purple-500 to-indigo-700 text-white py-16">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <div className="w-20 h-20 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Edit3 className="w-8 h-8" />
              </div>
              <h1 className="text-4xl sm:text-5xl font-bold mb-6" data-testid="text-page-title">
                PDF Editor
              </h1>
              <p className="text-xl text-purple-100 max-w-2xl mx-auto">
                Edit PDF files online with our advanced editor. Add text, highlights, shapes, and annotations to your documents.
              </p>
            </div>
          </section>

          {/* Tool Section */}
          <section className="py-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              {/* Upload Section */}
              {!pageData && (
                <Card className="bg-white shadow-sm border-0 max-w-2xl mx-auto">
                  <CardContent className="p-8">
                    <h2 className="text-2xl font-semibold text-gray-900 mb-6 text-center">Select PDF File to Edit</h2>
                    
                    <div
                      className={`border-2 border-dashed rounded-xl p-12 text-center transition-colors cursor-pointer ${
                        dragOver 
                          ? 'border-purple-500 bg-purple-50' 
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
                        or click to select a PDF from your computer
                      </p>
                      <Button
                        className="bg-purple-600 hover:bg-purple-700 text-white"
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Loading PDF...
                          </>
                        ) : (
                          'Select PDF File'
                        )}
                      </Button>
                      
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".pdf,application/pdf"
                        onChange={(e) => handleFileSelect(e.target.files)}
                        className="hidden"
                        data-testid="input-file"
                        key={Date.now()}
                      />
                    </div>

                    {/* Selected File */}
                    {pdfFile && (
                      <div className="mt-6">
                        <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                          <FileText className="w-6 h-6 text-purple-600" />
                          <div className="flex-1">
                            <div className="font-medium text-gray-900">{pdfFile.name}</div>
                            <div className="text-sm text-gray-600">{pdfFile.size}</div>
                          </div>
                          <Button
                            onClick={resetEditor}
                            variant="outline"
                            size="sm"
                            className="text-purple-600 border-purple-200 hover:bg-purple-50"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Remove
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* PDF Editor Interface */}
              {pageData && (
                <div className="space-y-6">
                  {/* Toolbar */}
                  <Card className="bg-white shadow-sm border-0">
                    <CardContent className="p-6">
                      <Tabs defaultValue="tools" className="w-full">
                        <TabsList className="grid w-full grid-cols-3">
                          <TabsTrigger value="tools">Drawing Tools</TabsTrigger>
                          <TabsTrigger value="text">Text Settings</TabsTrigger>
                          <TabsTrigger value="pages">Page Navigation</TabsTrigger>
                        </TabsList>
                        
                        <TabsContent value="tools" className="mt-6">
                          <div className="flex flex-wrap gap-3">
                            {[
                              { id: 'pointer', icon: MousePointer, label: 'Select' },
                              { id: 'hand', icon: Hand, label: 'Pan' },
                              { id: 'text', icon: Type, label: 'Text' },
                              { id: 'highlight', icon: Highlighter, label: 'Highlight' },
                              { id: 'rectangle', icon: Square, label: 'Rectangle' },
                              { id: 'circle', icon: Circle, label: 'Circle' },
                              { id: 'line', icon: Minus, label: 'Line' },
                              { id: 'arrow', icon: ArrowRight, label: 'Arrow' }
                            ].map((tool) => (
                              <Button
                                key={tool.id}
                                variant={selectedTool === tool.id ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setSelectedTool(tool.id)}
                                className={selectedTool === tool.id ? 'bg-purple-600 hover:bg-purple-700' : ''}
                              >
                                <tool.icon className="w-4 h-4 mr-2" />
                                {tool.label}
                              </Button>
                            ))}
                          </div>
                          
                          <div className="mt-4 flex items-center gap-4">
                            <Label>Color:</Label>
                            <input
                              type="color"
                              value={selectedColor}
                              onChange={(e) => setSelectedColor(e.target.value)}
                              className="w-8 h-8 rounded border cursor-pointer"
                            />
                            <div className="flex gap-2">
                              {['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff', '#000000'].map(color => (
                                <button
                                  key={color}
                                  onClick={() => setSelectedColor(color)}
                                  className={`w-6 h-6 rounded border-2 ${selectedColor === color ? 'border-gray-800' : 'border-gray-300'}`}
                                  style={{ backgroundColor: color }}
                                />
                              ))}
                            </div>
                          </div>
                        </TabsContent>
                        
                        <TabsContent value="text" className="mt-6">
                          <div className="space-y-4">
                            <div>
                              <Label htmlFor="text-input">Text Content:</Label>
                              <Input
                                id="text-input"
                                value={textInput}
                                onChange={(e) => setTextInput(e.target.value)}
                                placeholder="Enter text to add to PDF..."
                                className="mt-1"
                              />
                            </div>
                            <div>
                              <Label>Font Size: {fontSize[0]}px</Label>
                              <Slider
                                value={fontSize}
                                onValueChange={setFontSize}
                                max={48}
                                min={8}
                                step={1}
                                className="mt-2"
                              />
                            </div>
                          </div>
                        </TabsContent>
                        
                        <TabsContent value="pages" className="mt-6">
                          <div className="flex items-center gap-4">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                              disabled={currentPage === 0}
                            >
                              Previous
                            </Button>
                            <span className="font-medium">
                              Page {currentPage + 1} of {pageData.totalPages}
                            </span>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setCurrentPage(Math.min(pageData.totalPages - 1, currentPage + 1))}
                              disabled={currentPage === pageData.totalPages - 1}
                            >
                              Next
                            </Button>
                            <div className="ml-auto flex gap-2">
                              <Tabs defaultValue="basic" className="w-full">
                                <TabsList className="grid w-full grid-cols-2">
                                  <TabsTrigger value="basic">Basic Edit</TabsTrigger>
                                  <TabsTrigger value="advanced">Advanced</TabsTrigger>
                                </TabsList>
                                
                                <TabsContent value="basic" className="space-y-4">
                                  <Button
                                    onClick={savePDF}
                                    disabled={isProcessing || annotations.length === 0}
                                    className="bg-purple-600 hover:bg-purple-700 text-white w-full"
                                  >
                                    {isProcessing ? (
                                      <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                        Saving...
                                      </>
                                    ) : (
                                      <>
                                        <Save className="w-4 h-4 mr-2" />
                                        Save with pdf-lib
                                      </>
                                    )}
                                  </Button>
                                </TabsContent>
                                
                                <TabsContent value="advanced" className="space-y-4">
                                  <div className="grid grid-cols-1 gap-4">
                                    <Button
                                      onClick={() => processAdvancedPDF('create_overlay')}
                                      disabled={isProcessing || annotations.length === 0}
                                      className="bg-green-600 hover:bg-green-700 text-white"
                                    >
                                      {isProcessing ? (
                                        <>
                                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                          Processing...
                                        </>
                                      ) : (
                                        <>
                                          <Layers className="w-4 h-4 mr-2" />
                                          Create with PDFKit Overlay
                                        </>
                                      )}
                                    </Button>
                                    
                                    <div className="border rounded-lg p-4 space-y-3">
                                      <h4 className="font-medium text-gray-900 flex items-center">
                                        <Lock className="w-4 h-4 mr-2" />
                                        Encrypt with qpdf
                                      </h4>
                                      
                                      <div className="space-y-2">
                                        <Label htmlFor="password">Password</Label>
                                        <Input
                                          id="password"
                                          type="password"
                                          value={encryptionOptions.password}
                                          onChange={(e) => setEncryptionOptions({
                                            ...encryptionOptions,
                                            password: e.target.value
                                          })}
                                          placeholder="Enter encryption password"
                                        />
                                      </div>
                                      
                                      <div className="grid grid-cols-2 gap-4">
                                        <div className="flex items-center space-x-2">
                                          <input
                                            type="checkbox"
                                            id="allowPrint"
                                            checked={encryptionOptions.allowPrint}
                                            onChange={(e) => setEncryptionOptions({
                                              ...encryptionOptions,
                                              allowPrint: e.target.checked
                                            })}
                                          />
                                          <Label htmlFor="allowPrint">Allow Print</Label>
                                        </div>
                                        
                                        <div className="flex items-center space-x-2">
                                          <input
                                            type="checkbox"
                                            id="allowCopy"
                                            checked={encryptionOptions.allowCopy}
                                            onChange={(e) => setEncryptionOptions({
                                              ...encryptionOptions,
                                              allowCopy: e.target.checked
                                            })}
                                          />
                                          <Label htmlFor="allowCopy">Allow Copy</Label>
                                        </div>
                                        
                                        <div className="flex items-center space-x-2">
                                          <input
                                            type="checkbox"
                                            id="allowModify"
                                            checked={encryptionOptions.allowModify}
                                            onChange={(e) => setEncryptionOptions({
                                              ...encryptionOptions,
                                              allowModify: e.target.checked
                                            })}
                                          />
                                          <Label htmlFor="allowModify">Allow Modify</Label>
                                        </div>
                                        
                                        <div className="space-y-1">
                                          <Label htmlFor="keyLength">Key Length</Label>
                                          <select
                                            id="keyLength"
                                            value={encryptionOptions.keyLength}
                                            onChange={(e) => setEncryptionOptions({
                                              ...encryptionOptions,
                                              keyLength: parseInt(e.target.value)
                                            })}
                                            className="w-full border rounded px-2 py-1"
                                          >
                                            <option value="128">128-bit</option>
                                            <option value="256">256-bit</option>
                                          </select>
                                        </div>
                                      </div>
                                      
                                      <Button
                                        onClick={() => processAdvancedPDF('encrypt_with_permissions')}
                                        disabled={isProcessing || !encryptionOptions.password}
                                        className="bg-red-600 hover:bg-red-700 text-white w-full"
                                      >
                                        {isProcessing ? (
                                          <>
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                            Encrypting...
                                          </>
                                        ) : (
                                          <>
                                            <Lock className="w-4 h-4 mr-2" />
                                            Encrypt PDF
                                          </>
                                        )}
                                      </Button>
                                    </div>
                                  </div>
                                </TabsContent>
                              </Tabs>
                              <Button
                                onClick={resetEditor}
                                variant="outline"
                                className="text-purple-600 border-purple-200 hover:bg-purple-50"
                              >
                                <Upload className="w-4 h-4 mr-2" />
                                New PDF
                              </Button>
                            </div>
                          </div>
                        </TabsContent>
                      </Tabs>
                    </CardContent>
                  </Card>

                  {/* PDF Canvas */}
                  <Card className="bg-white shadow-sm border-0">
                    <CardContent className="p-6">
                      <div className="text-center mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">
                          Page {currentPage + 1} - Click to add annotations
                        </h3>
                        <p className="text-sm text-gray-600">
                          Selected tool: <span className="font-medium capitalize">{selectedTool}</span>
                        </p>
                      </div>
                      
                      <div className="relative mx-auto max-w-4xl">
                        <div
                          className="relative bg-white border-2 border-gray-200 rounded-lg shadow-lg cursor-crosshair"
                          style={{
                            width: '100%',
                            height: '600px',
                            backgroundImage: 'url("data:image/svg+xml,%3Csvg width="20" height="20" xmlns="http://www.w3.org/2000/svg"%3E%3Cdefs%3E%3Cpattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse"%3E%3Cpath d="M 20 0 L 0 0 0 20" fill="none" stroke="%23e5e7eb" stroke-width="1"/%3E%3C/pattern%3E%3C/defs%3E%3Crect width="100%25" height="100%25" fill="url(%23grid)" /%3E%3C/svg%3E")'
                          }}
                          onClick={addAnnotation}
                        >
                          {/* Render annotations for current page */}
                          {currentPageAnnotations.map((annotation) => (
                            <div
                              key={annotation.id}
                              className="absolute group"
                              style={{
                                left: `${annotation.x}px`,
                                top: `${annotation.y}px`,
                                width: annotation.width ? `${annotation.width}px` : 'auto',
                                height: annotation.height ? `${annotation.height}px` : 'auto'
                              }}
                            >
                              {annotation.type === 'text' && (
                                <div
                                  style={{
                                    color: annotation.color,
                                    fontSize: `${annotation.fontSize}px`,
                                    fontWeight: 'bold',
                                    textShadow: '1px 1px 2px rgba(0,0,0,0.1)'
                                  }}
                                  className="whitespace-nowrap"
                                >
                                  {annotation.text}
                                </div>
                              )}
                              
                              {annotation.type === 'highlight' && (
                                <div
                                  style={{
                                    backgroundColor: annotation.color,
                                    opacity: 0.3,
                                    width: '100%',
                                    height: '100%'
                                  }}
                                  className="rounded"
                                />
                              )}
                              
                              {annotation.type === 'rectangle' && (
                                <div
                                  style={{
                                    border: `2px solid ${annotation.color}`,
                                    width: '100%',
                                    height: '100%'
                                  }}
                                  className="rounded"
                                />
                              )}
                              
                              {annotation.type === 'circle' && (
                                <div
                                  style={{
                                    border: `2px solid ${annotation.color}`,
                                    width: '100%',
                                    height: '100%'
                                  }}
                                  className="rounded-full"
                                />
                              )}
                              
                              {/* Delete button */}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  removeAnnotation(annotation.id);
                                }}
                                className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 flex items-center justify-center"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      {/* Annotations List */}
                      {currentPageAnnotations.length > 0 && (
                        <div className="mt-6">
                          <h4 className="text-sm font-medium text-gray-900 mb-3">
                            Annotations on Page {currentPage + 1} ({currentPageAnnotations.length})
                          </h4>
                          <div className="space-y-2">
                            {currentPageAnnotations.map((annotation) => (
                              <div key={annotation.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                                <div className="flex items-center gap-2">
                                  <div
                                    className="w-4 h-4 rounded"
                                    style={{ backgroundColor: annotation.color }}
                                  />
                                  <span className="text-sm text-gray-700 capitalize">
                                    {annotation.type}
                                    {annotation.text && `: "${annotation.text}"`}
                                  </span>
                                </div>
                                <Button
                                  onClick={() => removeAnnotation(annotation.id)}
                                  variant="outline"
                                  size="sm"
                                  className="text-red-600 border-red-200 hover:bg-red-50"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Results Section */}
              {editedPdfUrl && (
                <Card className="bg-green-50 border-green-200">
                  <CardContent className="p-6 text-center">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Edit3 className="w-8 h-8 text-green-600" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      PDF Edited Successfully!
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Your PDF has been edited with {annotations.length} annotations across {pageData?.totalPages} pages.
                    </p>
                    <Button
                      onClick={downloadEditedPDF}
                      className="bg-green-600 hover:bg-green-700 text-white px-6 py-3"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download Edited PDF
                    </Button>
                  </CardContent>
                </Card>
              )}

              {/* Educational Content */}
              <div className="mt-12 space-y-8">
                {/* How it Works */}
                <div className="bg-white rounded-2xl shadow-lg p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">How to Use the PDF Editor</h2>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Upload className="w-8 h-8 text-purple-600" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">1. Upload PDF</h3>
                      <p className="text-gray-600">
                        Upload your PDF file to start editing with our online editor.
                      </p>
                    </div>
                    
                    <div className="text-center">
                      <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Edit3 className="w-8 h-8 text-blue-600" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">2. Add Annotations</h3>
                      <p className="text-gray-600">
                        Use drawing tools to add text, highlights, shapes, and other annotations.
                      </p>
                    </div>
                    
                    <div className="text-center">
                      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Palette className="w-8 h-8 text-green-600" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">3. Customize</h3>
                      <p className="text-gray-600">
                        Choose colors, font sizes, and styles to match your requirements.
                      </p>
                    </div>
                    
                    <div className="text-center">
                      <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Download className="w-8 h-8 text-orange-600" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">4. Download</h3>
                      <p className="text-gray-600">
                        Save and download your edited PDF with all annotations preserved.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Features */}
                <div className="bg-white rounded-2xl shadow-lg p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">PDF Editor Features</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Type className="w-4 h-4 text-purple-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-1">Text Annotations</h3>
                        <p className="text-gray-600 text-sm">
                          Add custom text with adjustable font sizes and colors anywhere on your PDF.
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Highlighter className="w-4 h-4 text-yellow-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-1">Highlighting & Markup</h3>
                        <p className="text-gray-600 text-sm">
                          Highlight important text and add colorful markup to emphasize content.
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Square className="w-4 h-4 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-1">Shapes & Drawing</h3>
                        <p className="text-gray-600 text-sm">
                          Draw rectangles, circles, lines, and arrows to annotate your documents.
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Palette className="w-4 h-4 text-green-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-1">Color Customization</h3>
                        <p className="text-gray-600 text-sm">
                          Choose from a wide range of colors or use the color picker for precise control.
                        </p>
                      </div>
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

export default PDFEditorTool;