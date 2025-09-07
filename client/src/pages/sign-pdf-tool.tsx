import { useState, useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Upload, FileText, Download, Trash2, PenTool, Calendar, User, MapPin } from 'lucide-react';

interface PDFFile {
  id: string;
  file: File;
  name: string;
  size: string;
}

interface SignatureData {
  name: string;
  title: string;
  company: string;
  email: string;
  phone: string;
  address: string;
  reason: string;
  location: string;
}

const SignPDFTool = () => {
  const [pdfFile, setPdfFile] = useState<PDFFile | null>(null);
  const [signedPdfUrl, setSignedPdfUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [signatureData, setSignatureData] = useState<SignatureData>({
    name: '',
    title: '',
    company: '',
    email: '',
    phone: '',
    address: '',
    reason: 'Document approval and authorization',
    location: ''
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
      setSignedPdfUrl(null);
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

  const handleInputChange = (field: keyof SignatureData, value: string) => {
    setSignatureData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateForm = (): { isValid: boolean; message: string } => {
    if (!signatureData.name.trim()) {
      return { isValid: false, message: 'Name is required for signing the document' };
    }
    if (!signatureData.email.trim()) {
      return { isValid: false, message: 'Email is required for the signature' };
    }
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(signatureData.email)) {
      return { isValid: false, message: 'Please enter a valid email address' };
    }
    return { isValid: true, message: '' };
  };

  const signPDF = async () => {
    if (!pdfFile) return;

    const validation = validateForm();
    if (!validation.isValid) {
      alert(validation.message);
      return;
    }

    setIsProcessing(true);

    try {
      const formData = new FormData();
      formData.append('pdf', pdfFile.file);
      
      // Add signature data to form
      Object.entries(signatureData).forEach(([key, value]) => {
        if (value && value.trim()) {
          formData.append(key, value.trim());
        }
      });

      const response = await fetch('/api/sign-pdf', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Server error: ${response.status}`);
      }

      const signedBlob = await response.blob();
      const url = URL.createObjectURL(signedBlob);
      setSignedPdfUrl(url);

    } catch (error) {
      console.error('Error signing PDF:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      
      if (errorMessage.toLowerCase().includes('encrypt') || errorMessage.toLowerCase().includes('password')) {
        alert(`The PDF is password-protected or encrypted. Please use the "Unlock PDF" tool first to remove the password protection, then try signing again.`);
      } else if (errorMessage.toLowerCase().includes('invalid') || errorMessage.toLowerCase().includes('corrupt')) {
        alert(`The PDF file appears to be invalid or corrupted. Please try with a different PDF file.`);
      } else {
        alert(`Error signing PDF: ${errorMessage}. Please try again with a valid PDF file.`);
      }
    }

    setIsProcessing(false);
  };

  const downloadSignedPDF = () => {
    if (!signedPdfUrl || !pdfFile) return;

    const link = document.createElement('a');
    link.href = signedPdfUrl;
    link.download = `signed-${pdfFile.name}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const resetTool = () => {
    setPdfFile(null);
    setSignedPdfUrl(null);
    setSignatureData({
      name: '',
      title: '',
      company: '',
      email: '',
      phone: '',
      address: '',
      reason: 'Document approval and authorization',
      location: ''
    });
    if (signedPdfUrl) {
      URL.revokeObjectURL(signedPdfUrl);
    }
  };

  return (
    <>
      <Helmet>
        <title>Sign PDF Online - Free Digital PDF Signature Tool | CalcEasy</title>
        <meta name="description" content="Add digital signatures to PDF documents online for free. Sign PDF files with your name, title, company information, and more. Secure and professional PDF signing tool." />
        <meta name="keywords" content="sign PDF online, digital signature, PDF signer, electronic signature, document signing, PDF signature tool" />
        <meta property="og:title" content="Sign PDF Online - Free Digital PDF Signature Tool | CalcEasy" />
        <meta property="og:description" content="Add digital signatures to PDF documents online for free. Sign PDF files with your name, title, company information, and more." />
        <meta property="og:type" content="website" />
        <link rel="canonical" href="/sign-pdf-tool" />
      </Helmet>

      <div className="min-h-screen flex flex-col" data-testid="page-sign-pdf">
        <Header />
        
        <main className="flex-1 bg-neutral-50">
          {/* Hero Section */}
          <section className="bg-gradient-to-r from-purple-600 via-indigo-500 to-blue-700 text-white py-16">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <div className="w-20 h-20 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <PenTool className="h-10 w-10" />
              </div>
              <h1 className="text-4xl sm:text-5xl font-bold mb-6" data-testid="text-page-title">
                Sign PDF Online
              </h1>
              <p className="text-xl text-blue-100 max-w-2xl mx-auto">
                Add professional digital signatures to PDF documents with your name, title, company information, and more.
              </p>
            </div>
          </section>

          {/* Tool Section */}
          <section className="py-16">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
              
              <Card className="bg-white shadow-sm border-0 mb-8">
                <CardContent className="p-8">
                  <div className="space-y-8">
                    {/* File Upload Section */}
                    <div>
                      <h2 className="text-2xl font-semibold text-gray-900 mb-6">Upload PDF Document</h2>
                      
                      <div
                        className={`border-2 border-dashed rounded-xl p-12 text-center transition-colors ${
                          dragOver 
                            ? 'border-blue-500 bg-blue-50' 
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                        onDrop={handleDrop}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onClick={() => fileInputRef.current?.click()}
                        data-testid="drag-drop-upload-area"
                      >
                        <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                          Drag and drop your PDF file here
                        </h3>
                        <p className="text-gray-600 mb-4">
                          or click to select a file from your computer (up to 50MB)
                        </p>
                        <Button
                          className="bg-blue-600 hover:bg-blue-700 text-white"
                          data-testid="button-select-file"
                        >
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
                  </div>
                </CardContent>
              </Card>

              {/* File Info */}
              {pdfFile && (
                <Card className="bg-white shadow-sm border-0 mb-8">
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
                  </CardContent>
                </Card>
              )}

              {/* Signature Information Form */}
              {pdfFile && (
                <Card className="bg-white shadow-sm border-0 mb-8">
                  <CardContent className="p-8">
                    <div className="space-y-8">
                      <div>
                        <h2 className="text-2xl font-semibold text-gray-900 mb-6">Signature Information</h2>
                        <p className="text-gray-600 mb-6">
                          Enter your information to create a professional digital signature for the PDF document.
                        </p>
                      </div>

                      <div className="grid md:grid-cols-2 gap-6">
                        {/* Required Fields */}
                        <div className="space-y-4">
                          <h3 className="text-lg font-medium text-gray-900 mb-4">Required Information</h3>
                          
                          <div>
                            <Label htmlFor="name" className="text-sm font-medium text-gray-700">
                              <div className="flex items-center gap-2">
                                <User className="h-4 w-4" />
                                Full Name *
                              </div>
                            </Label>
                            <Input
                              id="name"
                              type="text"
                              value={signatureData.name}
                              onChange={(e) => handleInputChange('name', e.target.value)}
                              placeholder="Enter your full name"
                              className="mt-1"
                              data-testid="input-name"
                              required
                            />
                          </div>

                          <div>
                            <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                              Email Address *
                            </Label>
                            <Input
                              id="email"
                              type="email"
                              value={signatureData.email}
                              onChange={(e) => handleInputChange('email', e.target.value)}
                              placeholder="Enter your email address"
                              className="mt-1"
                              data-testid="input-email"
                              required
                            />
                          </div>

                          <div>
                            <Label htmlFor="reason" className="text-sm font-medium text-gray-700">
                              Reason for Signing
                            </Label>
                            <Input
                              id="reason"
                              type="text"
                              value={signatureData.reason}
                              onChange={(e) => handleInputChange('reason', e.target.value)}
                              placeholder="Enter reason for signing"
                              className="mt-1"
                              data-testid="input-reason"
                            />
                          </div>
                        </div>

                        {/* Optional Fields */}
                        <div className="space-y-4">
                          <h3 className="text-lg font-medium text-gray-900 mb-4">Optional Information</h3>
                          
                          <div>
                            <Label htmlFor="title" className="text-sm font-medium text-gray-700">
                              Job Title
                            </Label>
                            <Input
                              id="title"
                              type="text"
                              value={signatureData.title}
                              onChange={(e) => handleInputChange('title', e.target.value)}
                              placeholder="Enter your job title"
                              className="mt-1"
                              data-testid="input-title"
                            />
                          </div>

                          <div>
                            <Label htmlFor="company" className="text-sm font-medium text-gray-700">
                              Company/Organization
                            </Label>
                            <Input
                              id="company"
                              type="text"
                              value={signatureData.company}
                              onChange={(e) => handleInputChange('company', e.target.value)}
                              placeholder="Enter your company name"
                              className="mt-1"
                              data-testid="input-company"
                            />
                          </div>

                          <div>
                            <Label htmlFor="phone" className="text-sm font-medium text-gray-700">
                              Phone Number
                            </Label>
                            <Input
                              id="phone"
                              type="tel"
                              value={signatureData.phone}
                              onChange={(e) => handleInputChange('phone', e.target.value)}
                              placeholder="Enter your phone number"
                              className="mt-1"
                              data-testid="input-phone"
                            />
                          </div>

                          <div>
                            <Label htmlFor="location" className="text-sm font-medium text-gray-700">
                              <div className="flex items-center gap-2">
                                <MapPin className="h-4 w-4" />
                                Signing Location
                              </div>
                            </Label>
                            <Input
                              id="location"
                              type="text"
                              value={signatureData.location}
                              onChange={(e) => handleInputChange('location', e.target.value)}
                              placeholder="Enter signing location (city, state)"
                              className="mt-1"
                              data-testid="input-location"
                            />
                          </div>
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="address" className="text-sm font-medium text-gray-700">
                          Address
                        </Label>
                        <Textarea
                          id="address"
                          value={signatureData.address}
                          onChange={(e) => handleInputChange('address', e.target.value)}
                          placeholder="Enter your full address (optional)"
                          className="mt-1"
                          rows={3}
                          data-testid="input-address"
                        />
                      </div>

                      <Button 
                        onClick={signPDF}
                        disabled={isProcessing || !signatureData.name.trim() || !signatureData.email.trim()}
                        className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                        data-testid="button-sign-pdf"
                      >
                        {isProcessing ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Signing PDF...
                          </>
                        ) : (
                          <>
                            <PenTool className="h-4 w-4 mr-2" />
                            Sign PDF Document
                          </>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Download Section */}
              {signedPdfUrl && (
                <Card className="bg-white shadow-sm border-0 mb-8">
                  <CardContent className="p-6">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Download className="h-8 w-8 text-green-600" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">PDF Signed Successfully!</h3>
                      <p className="text-gray-600 mb-4">Your PDF has been digitally signed. Download the signed document below.</p>
                      <Button 
                        onClick={downloadSignedPDF}
                        className="bg-green-600 hover:bg-green-700"
                        data-testid="button-download-signed"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download Signed PDF
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Info Section */}
              <Card className="bg-white shadow-sm border-0">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">About PDF Digital Signing</h3>
                  <div className="prose prose-sm text-gray-600 max-w-none">
                    <p className="mb-4">
                      Digital signatures provide authentication, integrity, and non-repudiation for PDF documents. 
                      This tool adds professional signature information to your PDF files.
                    </p>
                    
                    <h4 className="font-semibold text-gray-900 mb-2">Features:</h4>
                    <ul className="list-disc list-inside space-y-1 mb-4">
                      <li>Add professional digital signatures with custom information</li>
                      <li>Include signer name, title, company, and contact details</li>
                      <li>Timestamp signatures with signing date and time</li>
                      <li>Preserve original document formatting and content</li>
                      <li>Secure processing - files are not stored on our servers</li>
                      <li>Compatible with standard PDF viewers and applications</li>
                    </ul>
                    
                    <h4 className="font-semibold text-gray-900 mb-2">Use Cases:</h4>
                    <ul className="list-disc list-inside space-y-1">
                      <li>Business contracts and agreements</li>
                      <li>Legal documents and forms</li>
                      <li>Employment documents and HR forms</li>
                      <li>Financial documents and applications</li>
                      <li>Academic and educational certificates</li>
                      <li>Government and official documentation</li>
                    </ul>
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

export default SignPDFTool;