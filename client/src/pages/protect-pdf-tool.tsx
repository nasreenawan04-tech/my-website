import { useState, useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
// Removed pdf-lib-with-encrypt - now using server-side qpdf encryption
import { Upload, FileText, Download, Trash2, Lock, Shield, Eye, EyeOff } from 'lucide-react';

interface PDFFile {
  id: string;
  file: File;
  name: string;
  size: string;
}

interface ProtectionOptions {
  userPassword: string;
  ownerPassword: string;
  allowPrinting: boolean;
  allowModifying: boolean;
  allowCopying: boolean;
  allowAnnotating: boolean;
}

const ProtectPDFTool = () => {
  const [pdfFile, setPdfFile] = useState<PDFFile | null>(null);
  const [protectedPdfUrl, setProtectedPdfUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [showUserPassword, setShowUserPassword] = useState(false);
  const [showOwnerPassword, setShowOwnerPassword] = useState(false);
  const [protectionOptions, setProtectionOptions] = useState<ProtectionOptions>({
    userPassword: '',
    ownerPassword: '',
    allowPrinting: true,
    allowModifying: false,
    allowCopying: false,
    allowAnnotating: true
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
      setProtectedPdfUrl(null);
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

  const validatePassword = (password: string): { isValid: boolean; message: string } => {
    if (password.length < 4) {
      return { isValid: false, message: 'Password must be at least 4 characters long' };
    }
    if (password.length > 32) {
      return { isValid: false, message: 'Password must be less than 32 characters long' };
    }
    return { isValid: true, message: '' };
  };

  const protectPDF = async () => {
    if (!pdfFile) return;

    const userPassword = protectionOptions.userPassword.trim();
    if (!userPassword) {
      alert('Please enter a password to protect the PDF.');
      return;
    }

    // Validate user password
    const userPasswordValidation = validatePassword(userPassword);
    if (!userPasswordValidation.isValid) {
      alert(`User password error: ${userPasswordValidation.message}`);
      return;
    }

    // Validate owner password if provided
    const ownerPassword = protectionOptions.ownerPassword.trim();
    if (ownerPassword) {
      const ownerPasswordValidation = validatePassword(ownerPassword);
      if (!ownerPasswordValidation.isValid) {
        alert(`Owner password error: ${ownerPasswordValidation.message}`);
        return;
      }
      
      if (userPassword === ownerPassword) {
        alert('User password and owner password should be different for better security.');
        return;
      }
    }

    setIsProcessing(true);
    
    try {
      // Create FormData for file upload to server
      const formData = new FormData();
      formData.append('pdf', pdfFile.file);
      formData.append('userPassword', userPassword);
      
      if (ownerPassword) {
        formData.append('ownerPassword', ownerPassword);
      }
      
      formData.append('allowPrinting', protectionOptions.allowPrinting.toString());
      formData.append('allowModifying', protectionOptions.allowModifying.toString());
      formData.append('allowCopying', protectionOptions.allowCopying.toString());
      formData.append('allowAnnotating', protectionOptions.allowAnnotating.toString());
      formData.append('keyLength', '256'); // Use 256-bit AES encryption
      
      // Send request to server for encryption using qpdf
      const response = await fetch('/api/encrypt-pdf', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Server error: ${response.status}`);
      }

      // Get the encrypted PDF as blob
      const encryptedBlob = await response.blob();
      const url = URL.createObjectURL(encryptedBlob);
      setProtectedPdfUrl(url);
      
    } catch (error) {
      console.error('Error protecting PDF:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      alert(`Error protecting PDF: ${errorMessage}. Please try again with a valid PDF file.`);
    }

    setIsProcessing(false);
  };

  const downloadProtectedPDF = () => {
    if (!protectedPdfUrl || !pdfFile) return;

    const link = document.createElement('a');
    link.href = protectedPdfUrl;
    link.download = `protected-${pdfFile.name}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const resetTool = () => {
    setPdfFile(null);
    setProtectedPdfUrl(null);
    setProtectionOptions({
      userPassword: '',
      ownerPassword: '',
      allowPrinting: true,
      allowModifying: false,
      allowCopying: false,
      allowAnnotating: true
    });
    if (protectedPdfUrl) {
      URL.revokeObjectURL(protectedPdfUrl);
    }
  };

  return (
    <>
      <Helmet>
        <title>Protect PDF with Password - Free Online PDF Security Tool | ToolsHub</title>
        <meta name="description" content="Add password protection to PDF documents for free. Secure your PDFs with user and owner passwords, control printing and editing permissions. No registration required." />
        <meta name="keywords" content="protect PDF, password protect PDF, PDF security, PDF encryption, secure PDF, PDF protection online" />
        <meta property="og:title" content="Protect PDF with Password - Free Online PDF Security Tool | ToolsHub" />
        <meta property="og:description" content="Add password protection to PDF documents for free. Secure your PDFs with customizable permissions." />
        <meta property="og:type" content="website" />
        <link rel="canonical" href="/tools/protect-pdf" />
      </Helmet>

      <div className="min-h-screen flex flex-col" data-testid="page-protect-pdf">
        <Header />
        
        <main className="flex-1 bg-neutral-50">
          {/* Hero Section */}
          <section className="bg-gradient-to-r from-green-600 via-green-500 to-emerald-700 text-white py-16">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <div className="w-20 h-20 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Lock className="w-8 h-8" />
              </div>
              <h1 className="text-4xl sm:text-5xl font-bold mb-6" data-testid="text-page-title">
                Protect PDF with Password
              </h1>
              <p className="text-xl text-green-100 max-w-2xl mx-auto">
                Secure your PDF documents with password protection. Control access, printing, and editing permissions to keep your files safe.
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
                        Drag and drop PDF file here
                      </h3>
                      <p className="text-gray-600 mb-4">
                        or click to select a file from your computer
                      </p>
                      <Button
                        className="bg-green-600 hover:bg-green-700 text-white"
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
                            <Trash2 className="w-4 h-4 mr-2" />
                            Remove
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Protection Settings */}
                <Card className="bg-white shadow-sm border-0">
                  <CardContent className="p-8">
                    <h2 className="text-2xl font-semibold text-gray-900 mb-6">Security Settings</h2>
                    
                    <div className="space-y-6">
                      {/* User Password */}
                      <div>
                        <Label htmlFor="user-password" className="text-sm font-medium text-gray-700">
                          User Password (Required to open PDF)
                        </Label>
                        <div className="relative mt-1">
                          <Input
                            id="user-password"
                            type={showUserPassword ? 'text' : 'password'}
                            value={protectionOptions.userPassword}
                            onChange={(e) => setProtectionOptions(prev => ({ ...prev, userPassword: e.target.value }))}
                            placeholder="Enter password to open PDF"
                            className="pr-10"
                            minLength={4}
                            maxLength={32}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                            onClick={() => setShowUserPassword(!showUserPassword)}
                          >
                            {showUserPassword ? (
                              <EyeOff className="h-4 w-4 text-gray-400" />
                            ) : (
                              <Eye className="h-4 w-4 text-gray-400" />
                            )}
                          </Button>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          Password must be 4-32 characters long
                        </p>
                      </div>

                      {/* Owner Password */}
                      <div>
                        <Label htmlFor="owner-password" className="text-sm font-medium text-gray-700">
                          Owner Password (Optional - For permissions control)
                        </Label>
                        <div className="relative mt-1">
                          <Input
                            id="owner-password"
                            type={showOwnerPassword ? 'text' : 'password'}
                            value={protectionOptions.ownerPassword}
                            onChange={(e) => setProtectionOptions(prev => ({ ...prev, ownerPassword: e.target.value }))}
                            placeholder="Enter owner password (optional)"
                            className="pr-10"
                            maxLength={32}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                            onClick={() => setShowOwnerPassword(!showOwnerPassword)}
                          >
                            {showOwnerPassword ? (
                              <EyeOff className="h-4 w-4 text-gray-400" />
                            ) : (
                              <Eye className="h-4 w-4 text-gray-400" />
                            )}
                          </Button>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          Different from user password, allows changing document permissions
                        </p>
                      </div>

                      {/* Permissions */}
                      <div>
                        <Label className="text-sm font-medium text-gray-700 mb-4 block">
                          Document Permissions
                        </Label>
                        <div className="space-y-3">
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="allow-printing"
                              checked={protectionOptions.allowPrinting}
                              onCheckedChange={(checked) => 
                                setProtectionOptions(prev => ({ ...prev, allowPrinting: !!checked }))
                              }
                            />
                            <Label htmlFor="allow-printing" className="text-sm text-gray-700">
                              Allow printing
                            </Label>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="allow-modifying"
                              checked={protectionOptions.allowModifying}
                              onCheckedChange={(checked) => 
                                setProtectionOptions(prev => ({ ...prev, allowModifying: !!checked }))
                              }
                            />
                            <Label htmlFor="allow-modifying" className="text-sm text-gray-700">
                              Allow document modification
                            </Label>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="allow-copying"
                              checked={protectionOptions.allowCopying}
                              onCheckedChange={(checked) => 
                                setProtectionOptions(prev => ({ ...prev, allowCopying: !!checked }))
                              }
                            />
                            <Label htmlFor="allow-copying" className="text-sm text-gray-700">
                              Allow text and image copying
                            </Label>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="allow-annotating"
                              checked={protectionOptions.allowAnnotating}
                              onCheckedChange={(checked) => 
                                setProtectionOptions(prev => ({ ...prev, allowAnnotating: !!checked }))
                              }
                            />
                            <Label htmlFor="allow-annotating" className="text-sm text-gray-700">
                              Allow annotations and form filling
                            </Label>
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
                    onClick={protectPDF}
                    disabled={isProcessing || !protectionOptions.userPassword.trim()}
                    className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 text-lg"
                    data-testid="button-protect"
                  >
                    {isProcessing ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Protecting PDF...
                      </>
                    ) : (
                      <>
                        <Lock className="w-4 h-4 mr-2" />
                        Protect PDF with Password
                      </>
                    )}
                  </Button>
                </div>
              )}

              {/* Results Section */}
              {protectedPdfUrl && (
                <div className="mt-8">
                  <Card className="bg-green-50 border-green-200">
                    <CardContent className="p-6 text-center">
                      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Shield className="w-8 h-8 text-green-600" />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        PDF Protected Successfully!
                      </h3>
                      <p className="text-gray-600 mb-4">
                        Your PDF has been secured with password protection and the specified permissions.
                      </p>
                      <div className="text-sm text-gray-600 mb-6 p-3 bg-green-100 rounded-lg">
                        <p className="font-medium mb-2">Applied Security Settings:</p>
                        <ul className="space-y-1 text-xs">
                          <li>✓ User password protection enabled</li>
                          {protectionOptions.ownerPassword && <li>✓ Owner password set</li>}
                          <li>{protectionOptions.allowPrinting ? '✓' : '✗'} Printing {protectionOptions.allowPrinting ? 'allowed' : 'restricted'}</li>
                          <li>{protectionOptions.allowModifying ? '✓' : '✗'} Editing {protectionOptions.allowModifying ? 'allowed' : 'restricted'}</li>
                          <li>{protectionOptions.allowCopying ? '✓' : '✗'} Copying {protectionOptions.allowCopying ? 'allowed' : 'restricted'}</li>
                          <li>{protectionOptions.allowAnnotating ? '✓' : '✗'} Annotations {protectionOptions.allowAnnotating ? 'allowed' : 'restricted'}</li>
                        </ul>
                      </div>
                      <Button
                        onClick={downloadProtectedPDF}
                        className="bg-green-600 hover:bg-green-700 text-white px-6 py-3"
                        data-testid="button-download"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download Protected PDF
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Educational Content */}
              <div className="mt-12 space-y-8">
                {/* How it Works */}
                <div className="bg-white rounded-2xl shadow-lg p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">How to Protect PDF with Password</h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Upload className="w-8 h-8 text-green-600" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">1. Upload PDF</h3>
                      <p className="text-gray-600">
                        Drag and drop your PDF file or click to select it from your computer.
                      </p>
                    </div>
                    
                    <div className="text-center">
                      <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Lock className="w-8 h-8 text-blue-600" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">2. Set Security</h3>
                      <p className="text-gray-600">
                        Enter passwords and configure document permissions for your PDF.
                      </p>
                    </div>
                    
                    <div className="text-center">
                      <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Download className="w-8 h-8 text-purple-600" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">3. Download</h3>
                      <p className="text-gray-600">
                        Apply protection and download your secure PDF file instantly.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Security Features */}
                <div className="bg-white rounded-2xl shadow-lg p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Security Features</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex items-start">
                      <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mr-3 mt-1">
                        <i className="fas fa-check text-xs text-green-600"></i>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">Password Protection</h3>
                        <p className="text-gray-600 text-sm">Require password to open and view the document.</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mr-3 mt-1">
                        <i className="fas fa-check text-xs text-green-600"></i>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">Print Control</h3>
                        <p className="text-gray-600 text-sm">Control whether users can print the document.</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mr-3 mt-1">
                        <i className="fas fa-check text-xs text-green-600"></i>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">Edit Protection</h3>
                        <p className="text-gray-600 text-sm">Prevent unauthorized modifications to your document.</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mr-3 mt-1">
                        <i className="fas fa-check text-xs text-green-600"></i>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">Copy Control</h3>
                        <p className="text-gray-600 text-sm">Restrict text and image copying from the document.</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Use Cases */}
                <div className="bg-white rounded-2xl shadow-lg p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Common Use Cases</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="bg-green-50 rounded-lg p-4">
                      <h3 className="font-semibold text-gray-900 mb-2">🔒 Confidential Documents</h3>
                      <p className="text-sm text-gray-600">Protect sensitive business documents and contracts.</p>
                    </div>
                    
                    <div className="bg-blue-50 rounded-lg p-4">
                      <h3 className="font-semibold text-gray-900 mb-2">📄 Financial Reports</h3>
                      <p className="text-sm text-gray-600">Secure financial statements and accounting documents.</p>
                    </div>
                    
                    <div className="bg-purple-50 rounded-lg p-4">
                      <h3 className="font-semibold text-gray-900 mb-2">📚 Educational Materials</h3>
                      <p className="text-sm text-gray-600">Protect copyrighted study materials and textbooks.</p>
                    </div>
                    
                    <div className="bg-orange-50 rounded-lg p-4">
                      <h3 className="font-semibold text-gray-900 mb-2">🏥 Medical Records</h3>
                      <p className="text-sm text-gray-600">Secure patient records and medical documentation.</p>
                    </div>
                    
                    <div className="bg-red-50 rounded-lg p-4">
                      <h3 className="font-semibold text-gray-900 mb-2">⚖️ Legal Documents</h3>
                      <p className="text-sm text-gray-600">Protect legal contracts and court documents.</p>
                    </div>
                    
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h3 className="font-semibold text-gray-900 mb-2">📊 Research Papers</h3>
                      <p className="text-sm text-gray-600">Secure academic research and intellectual property.</p>
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

export default ProtectPDFTool;