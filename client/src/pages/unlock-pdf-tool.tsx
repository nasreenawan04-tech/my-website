import { useState, useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, FileText, Download, Trash2, Unlock, Shield, Eye, EyeOff } from 'lucide-react';

interface PDFFile {
  id: string;
  file: File;
  name: string;
  size: string;
}

const UnlockPDFTool = () => {
  const [pdfFile, setPdfFile] = useState<PDFFile | null>(null);
  const [unlockedPdfUrl, setUnlockedPdfUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
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
      setUnlockedPdfUrl(null);
      setError(null);
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

  const unlockPDF = async () => {
    if (!pdfFile) return;

    const trimmedPassword = password.trim();
    if (!trimmedPassword) {
      setError('Please enter the password to unlock the PDF.');
      return;
    }

    setIsProcessing(true);
    setError(null);
    
    try {
      // Create FormData for file upload to server
      const formData = new FormData();
      formData.append('pdf', pdfFile.file);
      formData.append('password', trimmedPassword);
      
      // Send request to server for decryption using qpdf
      const response = await fetch('/api/unlock-pdf', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Server error: ${response.status}`);
      }

      // Get the unlocked PDF as blob
      const unlockedBlob = await response.blob();
      const url = URL.createObjectURL(unlockedBlob);
      setUnlockedPdfUrl(url);
      
    } catch (error) {
      console.error('Error unlocking PDF:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setError(errorMessage);
    }

    setIsProcessing(false);
  };

  const downloadUnlockedPDF = () => {
    if (!unlockedPdfUrl || !pdfFile) return;

    const link = document.createElement('a');
    link.href = unlockedPdfUrl;
    link.download = `unlocked-${pdfFile.name}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const resetTool = () => {
    setPdfFile(null);
    setUnlockedPdfUrl(null);
    setPassword('');
    setError(null);
    if (unlockedPdfUrl) {
      URL.revokeObjectURL(unlockedPdfUrl);
    }
  };

  return (
    <>
      <Helmet>
        <title>Unlock PDF - Remove Password Protection | Free Online PDF Tool | ToolsHub</title>
        <meta name="description" content="Remove password protection from PDF documents for free. Unlock password-protected PDFs instantly with our secure online tool. No registration required." />
        <meta name="keywords" content="unlock PDF, remove PDF password, PDF password remover, decrypt PDF, unlock protected PDF, PDF unlocker online" />
        <meta property="og:title" content="Unlock PDF - Remove Password Protection | Free Online PDF Tool | ToolsHub" />
        <meta property="og:description" content="Remove password protection from PDF documents for free. Unlock protected PDFs instantly." />
        <meta property="og:type" content="website" />
        <link rel="canonical" href="/tools/unlock-pdf" />
      </Helmet>

      <div className="min-h-screen flex flex-col" data-testid="page-unlock-pdf">
        <Header />
        
        <main className="flex-1 bg-neutral-50">
          {/* Hero Section */}
          <section className="bg-gradient-to-r from-red-600 via-red-500 to-orange-700 text-white py-16">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <div className="w-20 h-20 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Unlock className="w-8 h-8" />
              </div>
              <h1 className="text-4xl sm:text-5xl font-bold mb-6" data-testid="text-page-title">
                Unlock PDF
              </h1>
              <p className="text-xl text-red-100 max-w-2xl mx-auto">
                Remove password protection from PDF documents. Enter the password and unlock your protected PDFs instantly.
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
                    <h2 className="text-2xl font-semibold text-gray-900 mb-6">Select Protected PDF</h2>
                    
                    <div
                      className={`border-2 border-dashed rounded-xl p-12 text-center transition-colors ${
                        dragOver 
                          ? 'border-red-500 bg-red-50' 
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                      onDrop={handleDrop}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        Drag and drop protected PDF file here
                      </h3>
                      <p className="text-gray-600 mb-4">
                        or click to select a password-protected PDF from your computer
                      </p>
                      <Button
                        className="bg-red-600 hover:bg-red-700 text-white"
                        data-testid="button-select-file"
                      >
                        Select Protected PDF File
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
                            <Trash2 className="w-4 h-4 mr-2" />
                            Remove
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Password Section */}
                <Card className="bg-white shadow-sm border-0">
                  <CardContent className="p-8">
                    <h2 className="text-2xl font-semibold text-gray-900 mb-6">Enter Password</h2>
                    
                    <div className="space-y-6">
                      {/* Password Input */}
                      <div>
                        <Label htmlFor="pdf-password" className="text-sm font-medium text-gray-700">
                          PDF Password
                        </Label>
                        <div className="relative mt-1">
                          <Input
                            id="pdf-password"
                            type={showPassword ? 'text' : 'password'}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter the password to unlock PDF"
                            className="pr-10"
                            data-testid="input-password"
                            onKeyDown={(e) => e.key === 'Enter' && unlockPDF()}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? (
                              <EyeOff className="h-4 w-4 text-gray-400" />
                            ) : (
                              <Eye className="h-4 w-4 text-gray-400" />
                            )}
                          </Button>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          Enter the password that was used to protect this PDF
                        </p>
                      </div>

                      {/* Error Message */}
                      {error && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                          <p className="text-sm text-red-600">{error}</p>
                        </div>
                      )}

                      {/* Security Notice */}
                      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="flex items-start gap-3">
                          <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
                          <div>
                            <h4 className="text-sm font-medium text-blue-900 mb-1">Security Notice</h4>
                            <p className="text-xs text-blue-700">
                              Your PDF and password are processed securely on our servers and are not stored. 
                              Files are automatically deleted after processing.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Process Section */}
              {pdfFile && (
                <div className="mt-8 text-center">
                  <Button
                    onClick={unlockPDF}
                    disabled={isProcessing || !password.trim()}
                    className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 text-lg"
                    data-testid="button-unlock"
                  >
                    {isProcessing ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Unlocking PDF...
                      </>
                    ) : (
                      <>
                        <Unlock className="w-4 h-4 mr-2" />
                        Unlock PDF
                      </>
                    )}
                  </Button>
                </div>
              )}

              {/* Results Section */}
              {unlockedPdfUrl && (
                <div className="mt-8">
                  <Card className="bg-green-50 border-green-200">
                    <CardContent className="p-6 text-center">
                      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Unlock className="w-8 h-8 text-green-600" />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        PDF Unlocked Successfully!
                      </h3>
                      <p className="text-gray-600 mb-4">
                        Your PDF has been unlocked and is ready for download. All password protection has been removed.
                      </p>
                      <Button
                        onClick={downloadUnlockedPDF}
                        className="bg-green-600 hover:bg-green-700 text-white px-6 py-3"
                        data-testid="button-download"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download Unlocked PDF
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Educational Content */}
              <div className="mt-12 space-y-8">
                {/* How it Works */}
                <div className="bg-white rounded-2xl shadow-lg p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">How to Unlock PDF Files</h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Upload className="w-8 h-8 text-red-600" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">1. Upload PDF</h3>
                      <p className="text-gray-600">
                        Drag and drop your password-protected PDF file or click to select it from your computer.
                      </p>
                    </div>
                    
                    <div className="text-center">
                      <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Eye className="w-8 h-8 text-blue-600" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">2. Enter Password</h3>
                      <p className="text-gray-600">
                        Type in the password that was used to protect the PDF document.
                      </p>
                    </div>
                    
                    <div className="text-center">
                      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Download className="w-8 h-8 text-green-600" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">3. Download</h3>
                      <p className="text-gray-600">
                        Click unlock to remove the password protection and download your unlocked PDF.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Features */}
                <div className="bg-white rounded-2xl shadow-lg p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Why Use Our PDF Unlocker?</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Unlock className="w-4 h-4 text-red-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-1">Fast & Secure</h3>
                        <p className="text-gray-600 text-sm">
                          Quick processing with secure encryption. Your files are automatically deleted after unlocking.
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Shield className="w-4 h-4 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-1">Privacy Protected</h3>
                        <p className="text-gray-600 text-sm">
                          All processing happens on our secure servers. No data is stored or shared with third parties.
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <FileText className="w-4 h-4 text-green-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-1">No Registration</h3>
                        <p className="text-gray-600 text-sm">
                          Use our PDF unlocker tool without creating an account or providing personal information.
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Download className="w-4 h-4 text-purple-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-1">Instant Download</h3>
                        <p className="text-gray-600 text-sm">
                          Download your unlocked PDF immediately after processing. No waiting or email required.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* FAQ */}
                <div className="bg-white rounded-2xl shadow-lg p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Frequently Asked Questions</h2>
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">Is it safe to unlock PDFs online?</h3>
                      <p className="text-gray-600 text-sm">
                        Yes, our tool uses secure processing and automatically deletes all files after unlocking. 
                        Your documents and passwords are not stored on our servers.
                      </p>
                    </div>
                    
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">What if I don't know the password?</h3>
                      <p className="text-gray-600 text-sm">
                        You need the correct password to unlock a protected PDF. If you don't have the password, 
                        you won't be able to unlock the document as this would violate the security protection.
                      </p>
                    </div>
                    
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">What file size limits do you have?</h3>
                      <p className="text-gray-600 text-sm">
                        Our tool supports PDF files up to 50MB in size. Most documents will process within seconds.
                      </p>
                    </div>
                    
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">Do you keep my files?</h3>
                      <p className="text-gray-600 text-sm">
                        No, all uploaded files and processed results are automatically deleted from our servers 
                        after processing is complete for your privacy and security.
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

export default UnlockPDFTool;