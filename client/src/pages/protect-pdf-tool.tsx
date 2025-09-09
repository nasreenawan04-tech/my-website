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
import { Upload, FileText, Download, Trash2, Lock, Shield, Eye, EyeOff, Unlock } from 'lucide-react';

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

                {/* What is PDF Password Protection */}
                <div className="bg-white rounded-2xl shadow-lg p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">What is PDF Password Protection?</h2>
                  <div className="prose max-w-none text-gray-600 leading-relaxed space-y-4">
                    <p>
                      PDF password protection is a security feature that adds encryption to PDF documents, requiring users to enter a password before they can open, view, or interact with the file. This digital security measure transforms your vulnerable documents into fortified files that protect sensitive information from unauthorized access.
                    </p>
                    <p>
                      When you password protect a PDF, the document undergoes encryption using advanced algorithms that scramble the content into an unreadable format. Only users with the correct password can decrypt and access the original content. This process ensures that confidential information remains secure during storage, transmission, and sharing.
                    </p>
                    <p>
                      Modern PDF encryption typically uses AES (Advanced Encryption Standard) with 128-bit or 256-bit keys, providing military-grade security for your documents. This level of protection is suitable for everything from personal documents to highly confidential business materials.
                    </p>
                  </div>
                </div>

                {/* Types of PDF Passwords */}
                <div className="bg-white rounded-2xl shadow-lg p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Types of PDF Password Protection</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="bg-blue-50 rounded-xl p-6">
                      <div className="flex items-center mb-4">
                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                          <Eye className="w-4 h-4 text-blue-600" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900">User Password (Open Password)</h3>
                      </div>
                      <p className="text-gray-600 mb-4">
                        Also known as a document open password, this restricts who can open and view the PDF file. Without the correct password, the document cannot be accessed at all.
                      </p>
                      <ul className="text-sm text-gray-600 space-y-2">
                        <li>• Required to open the document</li>
                        <li>• Prevents unauthorized viewing</li>
                        <li>• Most common type of PDF protection</li>
                        <li>• Essential for confidential documents</li>
                      </ul>
                    </div>
                    
                    <div className="bg-green-50 rounded-xl p-6">
                      <div className="flex items-center mb-4">
                        <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                          <Shield className="w-4 h-4 text-green-600" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900">Owner Password (Permissions Password)</h3>
                      </div>
                      <p className="text-gray-600 mb-4">
                        Controls what users can do with the document once it's open. This password manages permissions like printing, copying, editing, and adding annotations.
                      </p>
                      <ul className="text-sm text-gray-600 space-y-2">
                        <li>• Controls document permissions</li>
                        <li>• Allows viewing without password</li>
                        <li>• Restricts printing and editing</li>
                        <li>• Prevents unauthorized modifications</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Security Features */}
                <div className="bg-white rounded-2xl shadow-lg p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Advanced Security Features</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex items-start">
                      <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mr-3 mt-1">
                        <i className="fas fa-check text-xs text-green-600"></i>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">256-bit AES Encryption</h3>
                        <p className="text-gray-600 text-sm">Military-grade encryption standard that provides maximum security for your documents.</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mr-3 mt-1">
                        <i className="fas fa-check text-xs text-green-600"></i>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">Granular Permission Control</h3>
                        <p className="text-gray-600 text-sm">Fine-tune access rights including printing, copying, editing, and annotation permissions.</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mr-3 mt-1">
                        <i className="fas fa-check text-xs text-green-600"></i>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">Cross-Platform Compatibility</h3>
                        <p className="text-gray-600 text-sm">Protected PDFs work across all major operating systems and PDF readers.</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mr-3 mt-1">
                        <i className="fas fa-check text-xs text-green-600"></i>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">Metadata Protection</h3>
                        <p className="text-gray-600 text-sm">Prevents access to document properties and metadata without proper authorization.</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Why Password Protect PDFs */}
                <div className="bg-white rounded-2xl shadow-lg p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Why Should You Password Protect Your PDFs?</h2>
                  <div className="space-y-6">
                    <div className="border-l-4 border-blue-500 bg-blue-50 p-6 rounded-r-lg">
                      <h3 className="font-semibold text-gray-900 mb-2">🔐 Data Security and Privacy</h3>
                      <p className="text-gray-600">
                        In today's digital world, data breaches and unauthorized access are constant threats. Password protection ensures that sensitive information remains confidential, whether you're sharing financial reports, legal documents, or personal information.
                      </p>
                    </div>
                    
                    <div className="border-l-4 border-green-500 bg-green-50 p-6 rounded-r-lg">
                      <h3 className="font-semibold text-gray-900 mb-2">🏢 Business Compliance</h3>
                      <p className="text-gray-600">
                        Many industries have strict compliance requirements for document security. Password-protected PDFs help organizations meet GDPR, HIPAA, SOX, and other regulatory standards by ensuring proper access controls.
                      </p>
                    </div>
                    
                    <div className="border-l-4 border-purple-500 bg-purple-50 p-6 rounded-r-lg">
                      <h3 className="font-semibold text-gray-900 mb-2">📧 Secure Document Sharing</h3>
                      <p className="text-gray-600">
                        When sharing documents via email, cloud storage, or other digital channels, password protection ensures that only intended recipients can access the content, even if the file falls into the wrong hands.
                      </p>
                    </div>
                    
                    <div className="border-l-4 border-orange-500 bg-orange-50 p-6 rounded-r-lg">
                      <h3 className="font-semibold text-gray-900 mb-2">🛡️ Intellectual Property Protection</h3>
                      <p className="text-gray-600">
                        Protect your valuable intellectual property, research, designs, and creative works from unauthorized copying, distribution, or modification by implementing strong password security.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Use Cases */}
                <div className="bg-white rounded-2xl shadow-lg p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Common Use Cases for PDF Password Protection</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="bg-green-50 rounded-lg p-4">
                      <h3 className="font-semibold text-gray-900 mb-2">🔒 Confidential Business Documents</h3>
                      <p className="text-sm text-gray-600">Protect sensitive business documents, strategic plans, and confidential contracts from unauthorized access.</p>
                    </div>
                    
                    <div className="bg-blue-50 rounded-lg p-4">
                      <h3 className="font-semibold text-gray-900 mb-2">💰 Financial Reports and Statements</h3>
                      <p className="text-sm text-gray-600">Secure financial statements, tax documents, and accounting records with robust password protection.</p>
                    </div>
                    
                    <div className="bg-purple-50 rounded-lg p-4">
                      <h3 className="font-semibold text-gray-900 mb-2">📚 Educational and Training Materials</h3>
                      <p className="text-sm text-gray-600">Protect copyrighted study materials, course content, and training manuals from unauthorized distribution.</p>
                    </div>
                    
                    <div className="bg-orange-50 rounded-lg p-4">
                      <h3 className="font-semibold text-gray-900 mb-2">🏥 Healthcare and Medical Records</h3>
                      <p className="text-sm text-gray-600">Secure patient records, medical reports, and healthcare documentation in compliance with HIPAA regulations.</p>
                    </div>
                    
                    <div className="bg-red-50 rounded-lg p-4">
                      <h3 className="font-semibold text-gray-900 mb-2">⚖️ Legal Documents and Contracts</h3>
                      <p className="text-sm text-gray-600">Protect legal contracts, court documents, and attorney-client privileged materials with strong encryption.</p>
                    </div>
                    
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h3 className="font-semibold text-gray-900 mb-2">🔬 Research Papers and IP</h3>
                      <p className="text-sm text-gray-600">Secure academic research, patent applications, and valuable intellectual property from unauthorized access.</p>
                    </div>
                  </div>
                </div>

                {/* Best Practices */}
                <div className="bg-white rounded-2xl shadow-lg p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">PDF Password Security Best Practices</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Password Creation Tips</h3>
                      <ul className="space-y-3 text-gray-600">
                        <li className="flex items-start">
                          <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                          <span>Use a minimum of 8-12 characters for stronger security</span>
                        </li>
                        <li className="flex items-start">
                          <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                          <span>Combine uppercase, lowercase, numbers, and special characters</span>
                        </li>
                        <li className="flex items-start">
                          <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                          <span>Avoid dictionary words and personal information</span>
                        </li>
                        <li className="flex items-start">
                          <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                          <span>Use different passwords for user and owner protection</span>
                        </li>
                        <li className="flex items-start">
                          <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                          <span>Consider using a reputable password manager</span>
                        </li>
                      </ul>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Security Guidelines</h3>
                      <ul className="space-y-3 text-gray-600">
                        <li className="flex items-start">
                          <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                          <span>Always use 256-bit AES encryption when available</span>
                        </li>
                        <li className="flex items-start">
                          <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                          <span>Set appropriate permissions based on document sensitivity</span>
                        </li>
                        <li className="flex items-start">
                          <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                          <span>Share passwords through secure channels only</span>
                        </li>
                        <li className="flex items-start">
                          <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                          <span>Regularly update passwords for highly sensitive documents</span>
                        </li>
                        <li className="flex items-start">
                          <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                          <span>Keep backup copies of important protected documents</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* FAQ Section */}
                <div className="bg-white rounded-2xl shadow-lg p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Frequently Asked Questions</h2>
                  <div className="space-y-6">
                    <div className="border-b border-gray-200 pb-4">
                      <h3 className="font-semibold text-gray-900 mb-2">Can password-protected PDFs be opened on mobile devices?</h3>
                      <p className="text-gray-600 text-sm">
                        Yes, password-protected PDFs work on all devices with PDF readers that support encryption, including smartphones, tablets, and computers across all operating systems.
                      </p>
                    </div>
                    
                    <div className="border-b border-gray-200 pb-4">
                      <h3 className="font-semibold text-gray-900 mb-2">How secure is PDF password protection?</h3>
                      <p className="text-gray-600 text-sm">
                        Modern PDF encryption using 256-bit AES is extremely secure and used by government and military organizations. The security ultimately depends on password strength and proper handling.
                      </p>
                    </div>
                    
                    <div className="border-b border-gray-200 pb-4">
                      <h3 className="font-semibold text-gray-900 mb-2">What happens if I forget the PDF password?</h3>
                      <p className="text-gray-600 text-sm">
                        If you forget the password, you'll need password recovery tools or the original unprotected document. Strong encryption makes password recovery extremely difficult without the original password.
                      </p>
                    </div>
                    
                    <div className="border-b border-gray-200 pb-4">
                      <h3 className="font-semibold text-gray-900 mb-2">Can I remove password protection later?</h3>
                      <p className="text-gray-600 text-sm">
                        Yes, if you know the password, you can remove protection using PDF editing software or online tools that support password removal.
                      </p>
                    </div>
                    
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">Do protected PDFs take up more storage space?</h3>
                      <p className="text-gray-600 text-sm">
                        Password protection adds minimal overhead to file size. The encryption process typically increases file size by less than 1%, making it negligible for most use cases.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Benefits Section */}
                <div className="bg-gradient-to-r from-green-600 to-blue-600 rounded-2xl shadow-lg p-8 text-white">
                  <h2 className="text-2xl font-bold mb-6">Benefits of Using Our PDF Protection Tool</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="bg-white bg-opacity-10 rounded-xl p-4">
                      <div className="w-8 h-8 bg-white bg-opacity-20 rounded-lg flex items-center justify-center mb-3">
                        <i className="fas fa-bolt text-white text-lg"></i>
                      </div>
                      <h3 className="font-semibold mb-2">Lightning Fast</h3>
                      <p className="text-sm text-green-100">Encrypt your PDFs in seconds with our optimized processing engine.</p>
                    </div>
                    
                    <div className="bg-white bg-opacity-10 rounded-xl p-4">
                      <div className="w-8 h-8 bg-white bg-opacity-20 rounded-lg flex items-center justify-center mb-3">
                        <i className="fas fa-shield-alt text-white text-lg"></i>
                      </div>
                      <h3 className="font-semibold mb-2">Military-Grade Security</h3>
                      <p className="text-sm text-blue-100">256-bit AES encryption provides maximum protection for your documents.</p>
                    </div>
                    
                    <div className="bg-white bg-opacity-10 rounded-xl p-4">
                      <div className="w-8 h-8 bg-white bg-opacity-20 rounded-lg flex items-center justify-center mb-3">
                        <i className="fas fa-cloud-upload text-white text-lg"></i>
                      </div>
                      <h3 className="font-semibold mb-2">No Installation Required</h3>
                      <p className="text-sm text-green-100">Browser-based tool works instantly without downloading software.</p>
                    </div>
                    
                    <div className="bg-white bg-opacity-10 rounded-xl p-4">
                      <div className="w-8 h-8 bg-white bg-opacity-20 rounded-lg flex items-center justify-center mb-3">
                        <i className="fas fa-user-secret text-white text-lg"></i>
                      </div>
                      <h3 className="font-semibold mb-2">Complete Privacy</h3>
                      <p className="text-sm text-blue-100">Files are processed locally and automatically deleted from our servers.</p>
                    </div>
                    
                    <div className="bg-white bg-opacity-10 rounded-xl p-4">
                      <div className="w-8 h-8 bg-white bg-opacity-20 rounded-lg flex items-center justify-center mb-3">
                        <i className="fas fa-mobile-alt text-white text-lg"></i>
                      </div>
                      <h3 className="font-semibold mb-2">Mobile Friendly</h3>
                      <p className="text-sm text-green-100">Works perfectly on all devices - desktop, tablet, and smartphone.</p>
                    </div>
                    
                    <div className="bg-white bg-opacity-10 rounded-xl p-4">
                      <div className="w-8 h-8 bg-white bg-opacity-20 rounded-lg flex items-center justify-center mb-3">
                        <i className="fas fa-infinity text-white text-lg"></i>
                      </div>
                      <h3 className="font-semibold mb-2">Unlimited Usage</h3>
                      <p className="text-sm text-blue-100">Protect as many PDFs as you need without any restrictions or limits.</p>
                    </div>
                  </div>
                </div>

                {/* Industry-Specific Use Cases */}
                <div className="bg-white rounded-2xl shadow-lg p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Professional Use Cases for PDF Password Protection</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">👨‍🎓 Students & Academics</h3>
                      <ul className="space-y-3 text-gray-600">
                        <li className="flex items-start">
                          <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                          <span>Protect thesis and research papers from unauthorized distribution</span>
                        </li>
                        <li className="flex items-start">
                          <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                          <span>Secure academic portfolios and assignment submissions</span>
                        </li>
                        <li className="flex items-start">
                          <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                          <span>Control access to study materials and course notes</span>
                        </li>
                        <li className="flex items-start">
                          <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                          <span>Prevent plagiarism by restricting copying of original work</span>
                        </li>
                      </ul>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">👔 Business Professionals</h3>
                      <ul className="space-y-3 text-gray-600">
                        <li className="flex items-start">
                          <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                          <span>Secure confidential business proposals and contracts</span>
                        </li>
                        <li className="flex items-start">
                          <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                          <span>Protect financial reports and strategic documents</span>
                        </li>
                        <li className="flex items-start">
                          <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                          <span>Control access to employee handbooks and HR documents</span>
                        </li>
                        <li className="flex items-start">
                          <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                          <span>Secure client presentations and marketing materials</span>
                        </li>
                      </ul>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">🏥 Healthcare & Legal</h3>
                      <ul className="space-y-3 text-gray-600">
                        <li className="flex items-start">
                          <span className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                          <span>HIPAA-compliant protection for patient records and medical reports</span>
                        </li>
                        <li className="flex items-start">
                          <span className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                          <span>Secure legal documents and attorney-client communications</span>
                        </li>
                        <li className="flex items-start">
                          <span className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                          <span>Protect case files and court document submissions</span>
                        </li>
                        <li className="flex items-start">
                          <span className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                          <span>Ensure confidentiality in insurance claim processing</span>
                        </li>
                      </ul>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">🔬 Researchers & Authors</h3>
                      <ul className="space-y-3 text-gray-600">
                        <li className="flex items-start">
                          <span className="w-2 h-2 bg-purple-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                          <span>Protect intellectual property and patent applications</span>
                        </li>
                        <li className="flex items-start">
                          <span className="w-2 h-2 bg-purple-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                          <span>Secure unpublished manuscripts and research data</span>
                        </li>
                        <li className="flex items-start">
                          <span className="w-2 h-2 bg-purple-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                          <span>Control distribution of proprietary research findings</span>
                        </li>
                        <li className="flex items-start">
                          <span className="w-2 h-2 bg-purple-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                          <span>Prevent unauthorized copying of creative works</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Security Compliance */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl shadow-lg p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Security Standards & Compliance</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Regulatory Compliance</h3>
                      <div className="space-y-4">
                        <div className="bg-white rounded-lg p-4 shadow-sm">
                          <h4 className="font-semibold text-gray-900 mb-2">GDPR Compliance</h4>
                          <p className="text-sm text-gray-600">Password protection helps meet GDPR requirements for data security and privacy protection in the European Union.</p>
                        </div>
                        <div className="bg-white rounded-lg p-4 shadow-sm">
                          <h4 className="font-semibold text-gray-900 mb-2">HIPAA Standards</h4>
                          <p className="text-sm text-gray-600">Essential for healthcare organizations to protect patient information and maintain HIPAA compliance.</p>
                        </div>
                        <div className="bg-white rounded-lg p-4 shadow-sm">
                          <h4 className="font-semibold text-gray-900 mb-2">SOX Requirements</h4>
                          <p className="text-sm text-gray-600">Helps financial organizations meet Sarbanes-Oxley Act requirements for document security and access control.</p>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">International Standards</h3>
                      <div className="space-y-4">
                        <div className="bg-white rounded-lg p-4 shadow-sm">
                          <h4 className="font-semibold text-gray-900 mb-2">ISO 27001</h4>
                          <p className="text-sm text-gray-600">Supports information security management system requirements with proper document access controls.</p>
                        </div>
                        <div className="bg-white rounded-lg p-4 shadow-sm">
                          <h4 className="font-semibold text-gray-900 mb-2">PCI DSS</h4>
                          <p className="text-sm text-gray-600">Helps organizations handling payment card data meet security standards for document protection.</p>
                        </div>
                        <div className="bg-white rounded-lg p-4 shadow-sm">
                          <h4 className="font-semibold text-gray-900 mb-2">FERPA</h4>
                          <p className="text-sm text-gray-600">Protects student educational records in compliance with Family Educational Rights and Privacy Act.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Complete PDF Workflow */}
                <div className="bg-white rounded-2xl shadow-lg p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Complete PDF Document Workflow</h2>
                  <p className="text-gray-600 mb-8">
                    PDF protection is part of a comprehensive document management strategy. Our suite of PDF tools helps you through every stage of document creation, editing, and security.
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6">
                      <h3 className="font-semibold text-gray-900 mb-4">📝 Document Creation & Editing</h3>
                      <div className="space-y-3">
                        <a href="/tools/merge-pdf" className="flex items-center text-blue-600 hover:text-blue-700 text-sm">
                          <i className="fas fa-object-group w-4 mr-2"></i>
                          Merge PDF Files
                        </a>
                        <a href="/tools/split-pdf" className="flex items-center text-blue-600 hover:text-blue-700 text-sm">
                          <i className="fas fa-cut w-4 mr-2"></i>
                          Split PDF Documents
                        </a>
                        <a href="/tools/rotate-pdf" className="flex items-center text-blue-600 hover:text-blue-700 text-sm">
                          <i className="fas fa-undo w-4 mr-2"></i>
                          Rotate PDF Pages
                        </a>
                        <a href="/tools/organize-pdf-pages" className="flex items-center text-blue-600 hover:text-blue-700 text-sm">
                          <i className="fas fa-sort w-4 mr-2"></i>
                          Organize PDF Pages
                        </a>
                        <a href="/tools/add-page-numbers" className="flex items-center text-blue-600 hover:text-blue-700 text-sm">
                          <i className="fas fa-list-ol w-4 mr-2"></i>
                          Add Page Numbers
                        </a>
                      </div>
                    </div>
                    
                    <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6">
                      <h3 className="font-semibold text-gray-900 mb-4">🛡️ Security & Protection</h3>
                      <div className="space-y-3">
                        <div className="flex items-center text-green-600 font-medium text-sm">
                          <i className="fas fa-lock w-4 mr-2"></i>
                          Protect PDF (Current Tool)
                        </div>
                        <a href="/tools/unlock-pdf" className="flex items-center text-green-600 hover:text-green-700 text-sm">
                          <i className="fas fa-unlock w-4 mr-2"></i>
                          Unlock PDF Files
                        </a>
                        <a href="/tools/watermark-pdf" className="flex items-center text-green-600 hover:text-green-700 text-sm">
                          <i className="fas fa-tint w-4 mr-2"></i>
                          Add PDF Watermarks
                        </a>
                        <a href="/tools/pdf-redaction-tool" className="flex items-center text-green-600 hover:text-green-700 text-sm">
                          <i className="fas fa-user-secret w-4 mr-2"></i>
                          Redact Sensitive Content
                        </a>
                      </div>
                    </div>
                    
                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6">
                      <h3 className="font-semibold text-gray-900 mb-4">⚡ Optimization & Analysis</h3>
                      <div className="space-y-3">
                        <a href="/tools/pdf-compressor-advanced" className="flex items-center text-purple-600 hover:text-purple-700 text-sm">
                          <i className="fas fa-compress-alt w-4 mr-2"></i>
                          Compress PDF Files
                        </a>
                        <a href="/tools/pdf-page-counter" className="flex items-center text-purple-600 hover:text-purple-700 text-sm">
                          <i className="fas fa-info w-4 mr-2"></i>
                          PDF Information Tool
                        </a>
                        <a href="/tools/pdf-comparison-tool" className="flex items-center text-purple-600 hover:text-purple-700 text-sm">
                          <i className="fas fa-not-equal w-4 mr-2"></i>
                          Compare PDF Files
                        </a>
                        <a href="/tools/extract-pdf-pages" className="flex items-center text-purple-600 hover:text-purple-700 text-sm">
                          <i className="fas fa-file-export w-4 mr-2"></i>
                          Extract PDF Pages
                        </a>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Related Tools */}
                <div className="bg-white rounded-2xl shadow-lg p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Essential PDF Security & Management Tools</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="bg-gray-50 rounded-xl p-6 hover:shadow-md transition-shadow">
                      <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                        <Unlock className="w-6 h-6 text-red-600" />
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-2">Unlock PDF Tool</h3>
                      <p className="text-sm text-gray-600 mb-4">Remove password protection from PDFs when you have the password. Essential for accessing locked documents.</p>
                      <a href="/tools/unlock-pdf" className="text-red-600 hover:text-red-700 font-medium text-sm">
                        Unlock PDFs →
                      </a>
                    </div>
                    
                    <div className="bg-gray-50 rounded-xl p-6 hover:shadow-md transition-shadow">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                        <i className="fas fa-compress-alt text-blue-600 text-xl"></i>
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-2">Advanced PDF Compressor</h3>
                      <p className="text-sm text-gray-600 mb-4">Reduce PDF file size while maintaining security features. Perfect for sharing protected documents efficiently.</p>
                      <a href="/tools/pdf-compressor-advanced" className="text-blue-600 hover:text-blue-700 font-medium text-sm">
                        Compress PDFs →
                      </a>
                    </div>
                    
                    <div className="bg-gray-50 rounded-xl p-6 hover:shadow-md transition-shadow">
                      <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                        <i className="fas fa-tint text-purple-600 text-xl"></i>
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-2">PDF Watermark Tool</h3>
                      <p className="text-sm text-gray-600 mb-4">Add visible watermarks to PDFs for additional layer of protection and brand identification.</p>
                      <a href="/tools/watermark-pdf" className="text-purple-600 hover:text-purple-700 font-medium text-sm">
                        Add Watermarks →
                      </a>
                    </div>
                    
                    <div className="bg-gray-50 rounded-xl p-6 hover:shadow-md transition-shadow">
                      <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                        <i className="fas fa-object-group text-green-600 text-xl"></i>
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-2">Merge PDF Files</h3>
                      <p className="text-sm text-gray-600 mb-4">Combine multiple documents before applying password protection for streamlined security management.</p>
                      <a href="/tools/merge-pdf" className="text-green-600 hover:text-green-700 font-medium text-sm">
                        Merge PDFs →
                      </a>
                    </div>
                    
                    <div className="bg-gray-50 rounded-xl p-6 hover:shadow-md transition-shadow">
                      <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mb-4">
                        <i className="fas fa-user-secret text-yellow-600 text-xl"></i>
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-2">PDF Redaction Tool</h3>
                      <p className="text-sm text-gray-600 mb-4">Black out sensitive information permanently before password protecting your documents.</p>
                      <a href="/tools/pdf-redaction-tool" className="text-yellow-600 hover:text-yellow-700 font-medium text-sm">
                        Redact Content →
                      </a>
                    </div>
                    
                    <div className="bg-gray-50 rounded-xl p-6 hover:shadow-md transition-shadow">
                      <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                        <i className="fas fa-cut text-indigo-600 text-xl"></i>
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-2">Split PDF Tool</h3>
                      <p className="text-sm text-gray-600 mb-4">Split large documents into smaller files before applying individual password protection.</p>
                      <a href="/tools/split-pdf" className="text-indigo-600 hover:text-indigo-700 font-medium text-sm">
                        Split PDFs →
                      </a>
                    </div>
                  </div>
                  
                  <div className="mt-8 text-center">
                    <a href="/pdf" className="inline-flex items-center bg-gradient-to-r from-green-600 to-blue-600 text-white px-6 py-3 rounded-xl font-medium hover:from-green-700 hover:to-blue-700 transition-all duration-200">
                      <i className="fas fa-tools mr-2"></i>
                      Explore All 30+ PDF Tools
                    </a>
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