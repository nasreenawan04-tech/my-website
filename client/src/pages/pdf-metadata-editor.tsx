import { useState, useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Upload, FileText, Download, Trash2, Info, Settings, Edit3, Calendar, User, BookOpen } from 'lucide-react';

interface PDFFile {
  id: string;
  file: File;
  name: string;
  size: string;
}

interface PDFMetadata {
  title: string;
  author: string;
  subject: string;
  keywords: string;
  creator: string;
  producer: string;
  creationDate: string | null;
  modificationDate: string | null;
  pageCount: number;
}

const PDFMetadataEditor = () => {
  const [pdfFile, setPdfFile] = useState<PDFFile | null>(null);
  const [metadata, setMetadata] = useState<PDFMetadata | null>(null);
  const [editedMetadata, setEditedMetadata] = useState<Partial<PDFMetadata>>({});
  const [editedPdfUrl, setEditedPdfUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isReading, setIsReading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
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

  const formatDate = (dateString: string | null): string => {
    if (!dateString) return 'Not available';
    try {
      return new Date(dateString).toLocaleString();
    } catch {
      return 'Invalid date';
    }
  };

  const handleFileSelect = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const file = files[0];
    if (file.type === 'application/pdf') {
      const newFile = {
        id: generateId(),
        file,
        name: file.name,
        size: formatFileSize(file.size)
      };
      setPdfFile(newFile);
      setMetadata(null);
      setEditedMetadata({});
      setEditedPdfUrl(null);
      
      // Automatically read metadata
      await readMetadata(newFile);
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

  const readMetadata = async (file: PDFFile) => {
    if (!file) return;

    setIsReading(true);
    
    try {
      const formData = new FormData();
      formData.append('pdf', file.file);
      
      const response = await fetch('/api/get-pdf-metadata', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Server error: ${response.status}`);
      }

      const result = await response.json();
      setMetadata(result.metadata);
      setEditedMetadata({
        title: result.metadata.title,
        author: result.metadata.author,
        subject: result.metadata.subject,
        keywords: result.metadata.keywords,
        creator: result.metadata.creator,
        producer: result.metadata.producer
      });
      
    } catch (error) {
      console.error('Error reading PDF metadata:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      
      if (errorMessage.toLowerCase().includes('encrypt') || errorMessage.toLowerCase().includes('password')) {
        alert(`The PDF is password-protected or encrypted. Please use the "Unlock PDF" tool first to remove the password protection, then try reading metadata again.`);
      } else if (errorMessage.toLowerCase().includes('invalid') || errorMessage.toLowerCase().includes('corrupt')) {
        alert(`The PDF file appears to be invalid or corrupted. Please try with a different PDF file.`);
      } else {
        alert(`Error reading PDF metadata: ${errorMessage}. Please try again with a valid PDF file.`);
      }
    }

    setIsReading(false);
  };

  const updateMetadata = async () => {
    if (!pdfFile) return;

    setIsProcessing(true);
    
    try {
      const formData = new FormData();
      formData.append('pdf', pdfFile.file);
      
      // Only append non-empty metadata fields
      Object.entries(editedMetadata).forEach(([key, value]) => {
        if (value && typeof value === 'string' && value.trim()) {
          formData.append(key, value.trim());
        }
      });
      
      const response = await fetch('/api/edit-pdf-metadata', {
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
      console.error('Error updating PDF metadata:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      
      if (errorMessage.toLowerCase().includes('encrypt') || errorMessage.toLowerCase().includes('password')) {
        alert(`The PDF is password-protected or encrypted. Please use the "Unlock PDF" tool first to remove the password protection, then try editing metadata again.`);
      } else if (errorMessage.toLowerCase().includes('invalid') || errorMessage.toLowerCase().includes('corrupt')) {
        alert(`The PDF file appears to be invalid or corrupted. Please try with a different PDF file.`);
      } else {
        alert(`Error updating PDF metadata: ${errorMessage}. Please try again with a valid PDF file.`);
      }
    }

    setIsProcessing(false);
  };

  const downloadEditedPDF = () => {
    if (!editedPdfUrl || !pdfFile) return;

    const link = document.createElement('a');
    link.href = editedPdfUrl;
    link.download = `metadata-edited-${pdfFile.name}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const resetTool = () => {
    setPdfFile(null);
    setMetadata(null);
    setEditedMetadata({});
    setEditedPdfUrl(null);
    if (editedPdfUrl) {
      URL.revokeObjectURL(editedPdfUrl);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Helmet>
        <title>PDF Metadata Editor - Edit PDF Document Properties | CalcEasy</title>
        <meta name="description" content="Edit PDF metadata including title, author, subject, keywords, and other document properties. Free online PDF metadata editor tool." />
        <meta name="keywords" content="PDF metadata editor, edit PDF properties, PDF document information, PDF title author" />
      </Helmet>
      
      <Header />
      
      <main className="pt-16">
        {/* Hero Section */}
        <section className="relative py-20 px-4 text-center overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10" />
          <div className="relative max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Info className="h-4 w-4" />
              PDF Document Properties
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              PDF Metadata <span className="text-blue-600">Editor</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Edit and update PDF document properties including title, author, subject, keywords, and other metadata information.
            </p>
          </div>
        </section>

        {/* Tool Section */}
        <section className="py-16 px-4">
          <div className="max-w-6xl mx-auto">
            
            {/* Upload Area */}
            <Card className="mb-8">
              <CardContent className="p-8">
                <div className="text-center">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Upload PDF Document</h2>
                  <p className="text-gray-600 mb-6">Select a PDF file to view and edit its metadata properties</p>
                  
                  <div
                    className={`border-2 border-dashed rounded-xl p-8 transition-all duration-200 ${
                      dragOver 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
                    }`}
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    data-testid="drag-drop-upload-area"
                  >
                    <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-lg font-medium text-gray-700 mb-2">
                      Drop your PDF file here, or click to browse
                    </p>
                    <p className="text-sm text-gray-500 mb-4">
                      Supports PDF files up to 50MB
                    </p>
                    <Button 
                      onClick={() => fileInputRef.current?.click()}
                      variant="outline"
                      className="bg-white hover:bg-gray-50"
                      data-testid="button-select-file"
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      Select PDF File
                    </Button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf"
                      onChange={(e) => handleFileSelect(e.target.files)}
                      className="hidden"
                      data-testid="input-file-upload"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* File Info */}
            {pdfFile && (
              <Card className="mb-8">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <FileText className="h-10 w-10 text-red-500" />
                      <div>
                        <h3 className="font-medium text-gray-900" data-testid="text-filename">{pdfFile.name}</h3>
                        <p className="text-sm text-gray-500" data-testid="text-filesize">{pdfFile.size}</p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={resetTool}
                      data-testid="button-remove-file"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Remove
                    </Button>
                  </div>
                  
                  {isReading && (
                    <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                        <span className="text-sm text-blue-700">Reading PDF metadata...</span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Metadata Display and Edit */}
            {metadata && (
              <div className="grid md:grid-cols-2 gap-8 mb-8">
                {/* Current Metadata */}
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <Info className="h-5 w-5 text-blue-600" />
                      <h3 className="text-lg font-semibold text-gray-900">Current Metadata</h3>
                    </div>
                    
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm font-medium text-gray-700">Title</label>
                        <p className="text-sm text-gray-600 mt-1" data-testid="text-current-title">
                          {metadata.title || 'Not set'}
                        </p>
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium text-gray-700">Author</label>
                        <p className="text-sm text-gray-600 mt-1" data-testid="text-current-author">
                          {metadata.author || 'Not set'}
                        </p>
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium text-gray-700">Subject</label>
                        <p className="text-sm text-gray-600 mt-1" data-testid="text-current-subject">
                          {metadata.subject || 'Not set'}
                        </p>
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium text-gray-700">Keywords</label>
                        <p className="text-sm text-gray-600 mt-1" data-testid="text-current-keywords">
                          {metadata.keywords || 'Not set'}
                        </p>
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium text-gray-700">Creator</label>
                        <p className="text-sm text-gray-600 mt-1" data-testid="text-current-creator">
                          {metadata.creator || 'Not set'}
                        </p>
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium text-gray-700">Producer</label>
                        <p className="text-sm text-gray-600 mt-1" data-testid="text-current-producer">
                          {metadata.producer || 'Not set'}
                        </p>
                      </div>
                      
                      <div className="pt-3 border-t">
                        <div className="flex items-center gap-2 mb-2">
                          <Calendar className="h-4 w-4 text-gray-500" />
                          <label className="text-sm font-medium text-gray-700">Creation Date</label>
                        </div>
                        <p className="text-sm text-gray-600" data-testid="text-creation-date">
                          {formatDate(metadata.creationDate)}
                        </p>
                      </div>
                      
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Calendar className="h-4 w-4 text-gray-500" />
                          <label className="text-sm font-medium text-gray-700">Modification Date</label>
                        </div>
                        <p className="text-sm text-gray-600" data-testid="text-modification-date">
                          {formatDate(metadata.modificationDate)}
                        </p>
                      </div>
                      
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <BookOpen className="h-4 w-4 text-gray-500" />
                          <label className="text-sm font-medium text-gray-700">Page Count</label>
                        </div>
                        <p className="text-sm text-gray-600" data-testid="text-page-count">
                          {metadata.pageCount} pages
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Edit Metadata */}
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <Edit3 className="h-5 w-5 text-green-600" />
                      <h3 className="text-lg font-semibold text-gray-900">Edit Metadata</h3>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="title" className="text-sm font-medium text-gray-700">
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4" />
                            Title
                          </div>
                        </Label>
                        <Input
                          id="title"
                          type="text"
                          value={editedMetadata.title || ''}
                          onChange={(e) => setEditedMetadata({...editedMetadata, title: e.target.value})}
                          placeholder="Enter document title"
                          className="mt-1"
                          data-testid="input-title"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="author" className="text-sm font-medium text-gray-700">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4" />
                            Author
                          </div>
                        </Label>
                        <Input
                          id="author"
                          type="text"
                          value={editedMetadata.author || ''}
                          onChange={(e) => setEditedMetadata({...editedMetadata, author: e.target.value})}
                          placeholder="Enter author name"
                          className="mt-1"
                          data-testid="input-author"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="subject" className="text-sm font-medium text-gray-700">
                          <div className="flex items-center gap-2">
                            <BookOpen className="h-4 w-4" />
                            Subject
                          </div>
                        </Label>
                        <Input
                          id="subject"
                          type="text"
                          value={editedMetadata.subject || ''}
                          onChange={(e) => setEditedMetadata({...editedMetadata, subject: e.target.value})}
                          placeholder="Enter document subject"
                          className="mt-1"
                          data-testid="input-subject"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="keywords" className="text-sm font-medium text-gray-700">Keywords</Label>
                        <Textarea
                          id="keywords"
                          value={editedMetadata.keywords || ''}
                          onChange={(e) => setEditedMetadata({...editedMetadata, keywords: e.target.value})}
                          placeholder="Enter keywords (comma-separated)"
                          className="mt-1"
                          rows={2}
                          data-testid="input-keywords"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="creator" className="text-sm font-medium text-gray-700">
                          <div className="flex items-center gap-2">
                            <Settings className="h-4 w-4" />
                            Creator
                          </div>
                        </Label>
                        <Input
                          id="creator"
                          type="text"
                          value={editedMetadata.creator || ''}
                          onChange={(e) => setEditedMetadata({...editedMetadata, creator: e.target.value})}
                          placeholder="Enter creator application"
                          className="mt-1"
                          data-testid="input-creator"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="producer" className="text-sm font-medium text-gray-700">Producer</Label>
                        <Input
                          id="producer"
                          type="text"
                          value={editedMetadata.producer || ''}
                          onChange={(e) => setEditedMetadata({...editedMetadata, producer: e.target.value})}
                          placeholder="Enter producer application"
                          className="mt-1"
                          data-testid="input-producer"
                        />
                      </div>
                    </div>
                    
                    <Button 
                      onClick={updateMetadata}
                      disabled={isProcessing}
                      className="w-full mt-6 bg-blue-600 hover:bg-blue-700"
                      data-testid="button-update-metadata"
                    >
                      {isProcessing ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Updating Metadata...
                        </>
                      ) : (
                        <>
                          <Edit3 className="h-4 w-4 mr-2" />
                          Update Metadata
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Download Section */}
            {editedPdfUrl && (
              <Card className="mb-8">
                <CardContent className="p-6">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Download className="h-8 w-8 text-green-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Metadata Updated Successfully!</h3>
                    <p className="text-gray-600 mb-4">Your PDF metadata has been updated. Download the file below.</p>
                    <Button 
                      onClick={downloadEditedPDF}
                      className="bg-green-600 hover:bg-green-700"
                      data-testid="button-download-edited"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download PDF with Updated Metadata
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Info Section */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">About PDF Metadata Editor</h3>
                <div className="prose prose-sm text-gray-600 max-w-none">
                  <p className="mb-4">
                    PDF metadata contains important information about your document that helps with organization, 
                    searchability, and identification. This tool allows you to view and edit various metadata fields.
                  </p>
                  
                  <h4 className="font-semibold text-gray-900 mb-2">Editable Metadata Fields:</h4>
                  <ul className="list-disc list-inside space-y-1 mb-4">
                    <li><strong>Title:</strong> The document's title or name</li>
                    <li><strong>Author:</strong> The person or organization who created the document</li>
                    <li><strong>Subject:</strong> A brief description of the document's content</li>
                    <li><strong>Keywords:</strong> Searchable terms related to the document</li>
                    <li><strong>Creator:</strong> The application used to create the original document</li>
                    <li><strong>Producer:</strong> The application used to convert or produce the PDF</li>
                  </ul>
                  
                  <h4 className="font-semibold text-gray-900 mb-2">Features:</h4>
                  <ul className="list-disc list-inside space-y-1">
                    <li>View existing PDF metadata properties</li>
                    <li>Edit document title, author, subject, and other fields</li>
                    <li>Preserve original document formatting and content</li>
                    <li>Download updated PDF with new metadata</li>
                    <li>Works with password-protected PDFs (after unlocking)</li>
                    <li>Secure processing - files are not stored on our servers</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default PDFMetadataEditor;