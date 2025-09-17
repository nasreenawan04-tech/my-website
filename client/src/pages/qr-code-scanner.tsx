
import { useState, useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import QrScanner from 'qr-scanner';

interface QROptions {
  extractUrls: boolean;
  extractEmails: boolean;
  formatText: boolean;
  removeEmptyLines: boolean;
  preserveCase: boolean;
  autoDetectPhone: boolean;
}

interface ScannedQR {
  scannedText: string;
  extractedContent: string[];
  originalImageUrl: string;
  timestamp: Date;
  fileSize: number;
  fileName: string;
}

const QRCodeScanner = () => {
  const [scannedQRs, setScannedQRs] = useState<ScannedQR[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const [scannedText, setScannedText] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [hasScanned, setHasScanned] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [options, setOptions] = useState<QROptions>({
    extractUrls: true,
    extractEmails: true,
    formatText: true,
    removeEmptyLines: true,
    preserveCase: false,
    autoDetectPhone: true
  });

  const extractTextContent = (text: string): string[] => {
    if (!text.trim()) return [];

    let processed = text;
    const extracted: string[] = [];

    // Remove empty lines if enabled
    if (options.removeEmptyLines) {
      processed = processed.split('\n').filter(line => line.trim() !== '').join('\n');
    }

    // Format text if enabled (remove extra spaces, normalize)
    if (options.formatText) {
      processed = processed.replace(/\s+/g, ' ').trim();
    }

    // Preserve or normalize case
    if (!options.preserveCase) {
      processed = processed.toLowerCase();
    }

    // Extract URLs if enabled
    if (options.extractUrls) {
      const urlRegex = /(https?:\/\/[^\s]+|www\.[^\s]+|[^\s]+\.[a-z]{2,}(?:\/[^\s]*)?)/gi;
      const urls = processed.match(urlRegex);
      if (urls) {
        urls.forEach(url => {
          // Ensure URL has protocol
          const formattedUrl = url.startsWith('http') ? url : `https://${url}`;
          extracted.push(formattedUrl);
        });
      }
    }

    // Extract email addresses if enabled
    if (options.extractEmails) {
      const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
      const emails = processed.match(emailRegex);
      if (emails) {
        extracted.push(...emails);
      }
    }

    // Auto-detect phone numbers if enabled
    if (options.autoDetectPhone) {
      const phoneRegex = /(\+?1?[-.\s]?\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4}|\+?[1-9]\d{1,14})/g;
      const phones = processed.match(phoneRegex);
      if (phones) {
        extracted.push(...phones);
      }
    }

    // If no specific content extracted, use the processed text
    if (extracted.length === 0) {
      extracted.push(processed);
    }

    return extracted.filter((item, index, arr) => arr.indexOf(item) === index); // Remove duplicates
  };

  const updateOption = <K extends keyof QROptions>(key: K, value: QROptions[K]) => {
    setOptions(prev => ({ ...prev, [key]: value }));
  };

  const handleCopyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadedImage(file);
    setScannedText('');
    setHasScanned(false);
    setShowResults(false);
  };

  const handleScanQR = async () => {
    if (!uploadedImage) return;

    setIsScanning(true);
    setScannedText('');

    try {
      // Scan QR code from uploaded image
      const result = await QrScanner.scanImage(uploadedImage);
      
      if (result) {
        setScannedText(result);
        
        // Extract content from scanned text
        const extractedContent = extractTextContent(result);
        
        const scannedQR: ScannedQR = {
          scannedText: result,
          extractedContent: extractedContent.length > 0 ? extractedContent : [result],
          originalImageUrl: URL.createObjectURL(uploadedImage),
          timestamp: new Date(),
          fileSize: uploadedImage.size,
          fileName: uploadedImage.name
        };

        setScannedQRs(prev => {
          const updated = [scannedQR, ...prev.filter(qr => qr.scannedText !== result)];
          return updated.slice(0, 10);
        });
        
        setHasScanned(true);
        setShowResults(true);
      }
    } catch (error) {
      console.error('Error scanning QR code:', error);
      setScannedText('Could not scan QR code. Please make sure the image contains a valid QR code.');
      setHasScanned(true);
      setShowResults(true);
    } finally {
      setIsScanning(false);
    }
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      setUploadedImage(file);
      setScannedText('');
      setHasScanned(false);
      setShowResults(false);
    }
  };

  const clearScannedData = () => {
    setUploadedImage(null);
    setScannedText('');
    setHasScanned(false);
    setShowResults(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const resetScanner = () => {
    setUploadedImage(null);
    setScannedText('');
    setHasScanned(false);
    setShowResults(false);
    setShowAdvanced(false);
    setOptions({
      extractUrls: true,
      extractEmails: true,
      formatText: true,
      removeEmptyLines: true,
      preserveCase: false,
      autoDetectPhone: true
    });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSampleUpload = () => {
    // This would typically load a sample QR code image
    alert('Sample QR code upload feature would be implemented here');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Helmet>
        <title>QR Code Scanner - Scan QR Codes to Extract Text | DapsiWow</title>
        <meta name="description" content="Free QR code scanner tool. Upload QR code images to extract text, URLs, emails, and phone numbers instantly. Professional scanner with smart content detection for business and personal use." />
        <meta name="keywords" content="QR code scanner, QR reader, scan QR code, QR code decoder, extract text from QR, QR to text converter, barcode scanner, QR code reader online, mobile QR scanner, business QR scanner" />
        <meta property="og:title" content="QR Code Scanner - Scan QR Codes to Extract Text | DapsiWow" />
        <meta property="og:description" content="Free online QR code scanner. Upload images to extract text, URLs, emails, and contact information. Professional tool for business and personal QR code scanning." />
        <meta property="og:type" content="website" />
        <meta name="robots" content="index, follow" />
        <meta name="author" content="DapsiWow" />
        <link rel="canonical" href="https://dapsiwow.com/tools/qr-code-scanner" />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            "name": "QR Code Scanner",
            "description": "Professional QR code scanner for extracting text, URLs, emails, and contact information from QR code images with smart content detection and formatting options.",
            "url": "https://dapsiwow.com/tools/qr-code-scanner",
            "applicationCategory": "BusinessApplication",
            "operatingSystem": "Any",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "USD"
            },
            "featureList": [
              "Multiple image format support",
              "Smart content extraction",
              "URL and email detection",
              "Contact information parsing",
              "Batch scanning history"
            ]
          })}
        </script>
      </Helmet>

      <Header />

      <main>
        {/* Hero Section */}
        <section className="relative py-12 sm:py-16 md:py-20 lg:py-24 xl:py-32 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-indigo-600/20"></div>
          <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="space-y-6 sm:space-y-8">
              <div className="inline-flex items-center px-3 sm:px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full border border-blue-200">
                <span className="text-xs sm:text-sm font-medium text-blue-700">Professional QR Scanner</span>
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-slate-900 leading-tight" data-testid="text-page-title">
                QR Code
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                  Scanner
                </span>
              </h1>
              <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-slate-600 max-w-4xl mx-auto leading-relaxed px-2">
                Upload QR code images to extract text, URLs, emails, and contact information instantly
              </p>
            </div>
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
          {/* Main Scanner Card */}
          <Card className="bg-white/90 backdrop-blur-sm shadow-2xl border-0 rounded-2xl sm:rounded-3xl overflow-hidden">
            <CardContent className="p-0">
              <div className="flex flex-col">
                {/* Input Section */}
                <div className="p-4 sm:p-6 md:p-8 lg:p-10 xl:p-12 space-y-6 sm:space-y-8">
                  <div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">QR Code Scanner</h2>
                    <p className="text-gray-600">Upload QR code images to extract and analyze content</p>
                  </div>

                  <div className="space-y-4 sm:space-y-6">
                    {/* File Upload Area */}
                    <div className="space-y-3">
                      <Label htmlFor="qr-upload" className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                        QR Code Image Upload
                      </Label>
                      <div
                        className="border-2 border-dashed border-gray-300 rounded-xl p-8 sm:p-12 text-center hover:border-blue-400 transition-colors bg-gray-50/50"
                        onDragOver={handleDragOver}
                        onDrop={handleDrop}
                        data-testid="qr-upload-area"
                      >
                        {uploadedImage ? (
                          <div className="space-y-4">
                            <img
                              src={URL.createObjectURL(uploadedImage)}
                              alt="Uploaded QR Code"
                              className="max-w-xs max-h-64 mx-auto rounded-lg border border-gray-200 shadow-sm"
                              data-testid="uploaded-qr-image"
                            />
                            <div className="text-sm text-gray-600">
                              <p className="font-medium">{uploadedImage.name}</p>
                              <p className="text-xs">{Math.round(uploadedImage.size / 1024)} KB</p>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-blue-100 rounded-2xl mx-auto mb-4 sm:mb-6 flex items-center justify-center">
                              <div className="text-2xl sm:text-3xl font-bold text-blue-500">QR</div>
                            </div>
                            <div>
                              <p className="text-lg sm:text-xl text-gray-700 mb-2 font-medium">
                                Drop QR code image here or click to browse
                              </p>
                              <p className="text-sm sm:text-base text-gray-500">
                                Supports JPG, PNG, GIF, WebP formats up to 10MB
                              </p>
                            </div>
                          </div>
                        )}
                        
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleFileUpload}
                          className="hidden"
                          data-testid="file-input"
                          id="qr-upload"
                        />
                        
                        <Button
                          onClick={() => fileInputRef.current?.click()}
                          disabled={isScanning}
                          className="mt-6 h-12 sm:h-14 px-6 sm:px-8 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold text-base sm:text-lg rounded-xl shadow-lg transform transition-all duration-200 hover:scale-105"
                          data-testid="button-browse-files"
                        >
                          {isScanning ? 'Scanning QR Code...' : 'Browse Files'}
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Advanced Options */}
                  <div className="space-y-4 sm:space-y-6 border-t pt-6 sm:pt-8">
                    <h3 className="text-lg sm:text-xl font-bold text-gray-900">Content Processing Options</h3>
                    
                    <Collapsible open={showAdvanced} onOpenChange={setShowAdvanced}>
                      <CollapsibleTrigger asChild>
                        <Button 
                          variant="ghost" 
                          className="w-full justify-between text-sm sm:text-base py-3 sm:py-4 h-auto"
                          data-testid="button-toggle-advanced"
                        >
                          <span className="flex items-center">
                            Advanced Content Detection
                          </span>
                          <span className={`transform transition-transform ${showAdvanced ? 'rotate-180' : ''}`}>▼</span>
                        </Button>
                      </CollapsibleTrigger>
                      <CollapsibleContent className="space-y-4 sm:space-y-6 mt-4">
                        <Separator />
                        
                        {/* Processing Options */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                          <div className="space-y-4 bg-gray-50 rounded-xl p-4 sm:p-6">
                            <h4 className="text-sm sm:text-base font-semibold text-gray-900">Content Detection</h4>
                            
                            <div className="flex items-center justify-between gap-2">
                              <div className="space-y-1 flex-1 min-w-0">
                                <Label className="text-xs sm:text-sm font-medium">Extract URLs</Label>
                                <p className="text-xs text-gray-500">Automatically detect and extract website URLs</p>
                              </div>
                              <Switch
                                checked={options.extractUrls}
                                onCheckedChange={(value) => updateOption('extractUrls', value)}
                                data-testid="switch-extract-urls"
                              />
                            </div>

                            <div className="flex items-center justify-between gap-2">
                              <div className="space-y-1 flex-1 min-w-0">
                                <Label className="text-xs sm:text-sm font-medium">Extract Email Addresses</Label>
                                <p className="text-xs text-gray-500">Find and extract email addresses from content</p>
                              </div>
                              <Switch
                                checked={options.extractEmails}
                                onCheckedChange={(value) => updateOption('extractEmails', value)}
                                data-testid="switch-extract-emails"
                              />
                            </div>

                            <div className="flex items-center justify-between gap-2">
                              <div className="space-y-1 flex-1 min-w-0">
                                <Label className="text-xs sm:text-sm font-medium">Auto-Detect Phone Numbers</Label>
                                <p className="text-xs text-gray-500">Identify and extract phone numbers</p>
                              </div>
                              <Switch
                                checked={options.autoDetectPhone}
                                onCheckedChange={(value) => updateOption('autoDetectPhone', value)}
                                data-testid="switch-auto-detect-phone"
                              />
                            </div>
                          </div>

                          {/* Text Processing Options */}
                          <div className="space-y-4 bg-gray-50 rounded-xl p-4 sm:p-6">
                            <h4 className="text-sm sm:text-base font-semibold text-gray-900">Text Processing</h4>
                            
                            <div className="flex items-center justify-between gap-2">
                              <div className="space-y-1 flex-1 min-w-0">
                                <Label className="text-xs sm:text-sm font-medium">Format Text</Label>
                                <p className="text-xs text-gray-500">Clean up spacing and normalize formatting</p>
                              </div>
                              <Switch
                                checked={options.formatText}
                                onCheckedChange={(value) => updateOption('formatText', value)}
                                data-testid="switch-format-text"
                              />
                            </div>

                            <div className="flex items-center justify-between gap-2">
                              <div className="space-y-1 flex-1 min-w-0">
                                <Label className="text-xs sm:text-sm font-medium">Remove Empty Lines</Label>
                                <p className="text-xs text-gray-500">Clean up empty lines from extracted text</p>
                              </div>
                              <Switch
                                checked={options.removeEmptyLines}
                                onCheckedChange={(value) => updateOption('removeEmptyLines', value)}
                                data-testid="switch-remove-empty-lines"
                              />
                            </div>

                            <div className="flex items-center justify-between gap-2">
                              <div className="space-y-1 flex-1 min-w-0">
                                <Label className="text-xs sm:text-sm font-medium">Preserve Case</Label>
                                <p className="text-xs text-gray-500">Maintain original text capitalization</p>
                              </div>
                              <Switch
                                checked={options.preserveCase}
                                onCheckedChange={(value) => updateOption('preserveCase', value)}
                                data-testid="switch-preserve-case"
                              />
                            </div>
                          </div>
                        </div>
                        
                        <Separator />
                      </CollapsibleContent>
                    </Collapsible>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4 sm:pt-6">
                    <Button
                      onClick={handleScanQR}
                      disabled={!uploadedImage || isScanning}
                      className="flex-1 h-12 sm:h-14 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold text-base sm:text-lg rounded-xl shadow-lg transform transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                      data-testid="button-scan-qr"
                    >
                      {isScanning ? 'Scanning...' : 'Scan QR Code'}
                    </Button>
                    <Button
                      onClick={resetScanner}
                      variant="outline"
                      className="h-12 sm:h-14 px-6 sm:px-8 border-2 border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold text-base sm:text-lg rounded-xl"
                      data-testid="button-reset"
                    >
                      Reset
                    </Button>
                  </div>
                </div>

                {/* Results Section */}
                {showResults && (
                  <div className="bg-gradient-to-br from-gray-50 to-blue-50 p-4 sm:p-6 md:p-8 lg:p-10 xl:p-12 border-t">
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6 sm:mb-8">Scanned Results</h2>

                    {hasScanned && uploadedImage ? (
                    <div className="space-y-3 sm:space-y-4" data-testid="scanned-results">
                      {/* Main Scanned Text Display */}
                      <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-3 sm:p-4">
                        <div className="flex items-center justify-between mb-3 gap-3">
                          <div className="flex-1 min-w-0">
                            <h3 className="text-sm sm:text-base font-semibold text-gray-900 truncate">Extracted Text</h3>
                            <p className="text-xs sm:text-sm text-gray-600 break-words">Raw content from QR code</p>
                          </div>
                          <Button
                            onClick={() => handleCopyToClipboard(scannedText)}
                            variant="outline"
                            size="sm"
                            className="text-xs px-2 sm:px-3 py-2 flex-shrink-0 rounded-lg min-w-[60px] sm:min-w-[70px] h-11 sm:h-9"
                            data-testid="button-copy-scanned-text"
                          >
                            Copy
                          </Button>
                        </div>
                        <div 
                          className="bg-white p-2 sm:p-3 rounded-lg border border-gray-200 text-xs sm:text-sm font-mono break-all min-h-[40px] sm:min-h-[44px] flex items-center"
                          data-testid="scanned-text-content"
                        >
                          {scannedText || '(empty result)'}
                        </div>
                      </div>

                      {/* Extracted Components */}
                      {scannedQRs.length > 0 && scannedQRs[0].extractedContent.length > 1 && (
                        <div className="bg-green-50 border-2 border-green-200 rounded-xl p-3 sm:p-4">
                          <div className="flex items-center justify-between mb-3 gap-3">
                            <div className="flex-1 min-w-0">
                              <h4 className="text-sm sm:text-base font-semibold text-gray-900 truncate">Detected Content</h4>
                              <p className="text-xs sm:text-sm text-gray-600 break-words">Smart content extraction results</p>
                            </div>
                          </div>
                          <div className="space-y-2">
                            {scannedQRs[0].extractedContent.map((content, index) => (
                              <div key={index} className="flex items-center justify-between bg-white p-2 sm:p-3 rounded-lg border border-gray-200">
                                <span className="text-xs sm:text-sm text-gray-700 break-words flex-1" data-testid={`extracted-component-${index}`}>
                                  {content}
                                </span>
                                <Button
                                  onClick={() => handleCopyToClipboard(content)}
                                  variant="outline"
                                  size="sm"
                                  className="text-xs px-2 sm:px-3 py-2 flex-shrink-0 rounded-lg min-w-[60px] sm:min-w-[70px] h-11 sm:h-9"
                                  data-testid={`button-copy-component-${index}`}
                                >
                                  Copy
                                </Button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* File Statistics */}
                      {scannedQRs.length > 0 && (
                        <div className="bg-white rounded-xl p-3 sm:p-4 shadow-sm border border-gray-200" data-testid="scan-statistics">
                          <h3 className="text-sm sm:text-base font-bold text-gray-900 mb-4">Scan Statistics</h3>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div className="bg-blue-50 rounded-lg p-4 text-center">
                              <div className="text-2xl font-bold text-blue-600" data-testid="character-count">{scannedText.length}</div>
                              <div className="text-sm text-blue-700 font-medium">Characters</div>
                            </div>
                            <div className="bg-green-50 rounded-lg p-4 text-center">
                              <div className="text-2xl font-bold text-green-600" data-testid="file-size">{Math.round((scannedQRs[0]?.fileSize || 0) / 1024)} KB</div>
                              <div className="text-sm text-green-700 font-medium">File Size</div>
                            </div>
                            <div className="bg-purple-50 rounded-lg p-4 text-center">
                              <div className="text-2xl font-bold text-purple-600" data-testid="content-types">{scannedQRs[0]?.extractedContent.length || 0}</div>
                              <div className="text-sm text-purple-700 font-medium">Content Types</div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-12 sm:py-16" data-testid="no-results">
                      <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-200 rounded-full mx-auto mb-4 sm:mb-6 flex items-center justify-center">
                        <div className="text-2xl sm:text-3xl font-bold text-gray-400">QR</div>
                      </div>
                      <p className="text-gray-500 text-base sm:text-lg px-4">
                        {!hasScanned ? "Upload a QR code image and click 'Scan QR Code' to see extraction results" : "No QR code detected in the uploaded image"}
                      </p>
                    </div>
                  )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* SEO Content Sections */}
          <div className="mt-16 space-y-8">
            {/* What is QR Code Scanning */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">What is QR Code Scanning?</h2>
                <div className="space-y-4 text-gray-600">
                  <p>
                    <strong>QR code scanning</strong> is the process of analyzing Quick Response (QR) code images to extract their encoded information, including text, URLs, contact details, email addresses, phone numbers, and other digital content. This essential technology bridges physical and digital experiences, enabling instant access to information through simple image capture and processing.
                  </p>
                  <p>
                    Our professional QR code scanner supports comprehensive image format compatibility and intelligent content detection, automatically identifying and separating different types of information within scanned codes. With advanced processing options including text formatting, content extraction, and smart parsing capabilities, this tool serves businesses, marketers, educators, and individuals who need reliable QR code analysis.
                  </p>
                  <p>
                    Whether you're processing business cards, marketing materials, event tickets, product labels, or contact information, this scanner provides instant, accurate content extraction with professional formatting options to organize and utilize the extracted data effectively for your specific needs.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* QR Code Content Types Guide */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">QR Code Content Types & Detection</h2>
                <p className="text-gray-600 mb-8">Understanding different QR code content types and our scanner's intelligent detection capabilities helps you extract maximum value from scanned codes across various applications and industries.</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div className="bg-blue-50 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-blue-900 mb-3">Website URLs & Links</h3>
                      <p className="text-blue-800 text-sm mb-4">
                        QR codes commonly contain website URLs, social media links, and digital resources. Our scanner automatically detects and formats URLs, adding protocols when necessary and validating link structures for immediate access.
                      </p>
                      <div className="bg-blue-100 p-3 rounded-lg">
                        <h4 className="font-medium text-blue-900 mb-2">Example Detection:</h4>
                        <div className="text-xs font-mono text-blue-800">
                          <div>Raw: "dapsiwow.com/tools"</div>
                          <div>Detected: "https://dapsiwow.com/tools"</div>
                        </div>
                      </div>
                      <ul className="text-xs text-blue-700 mt-3 space-y-1">
                        <li>• Automatic protocol addition (http/https)</li>
                        <li>• URL validation and formatting</li>
                        <li>• Social media link detection</li>
                        <li>• Deep link and app URL support</li>
                      </ul>
                    </div>

                    <div className="bg-orange-50 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-orange-900 mb-3">Contact Information</h3>
                      <p className="text-orange-800 text-sm mb-4">
                        Business cards and contact QR codes contain vCard data including names, phone numbers, email addresses, and physical addresses. Our parser extracts each component separately for easy organization and import.
                      </p>
                      <div className="bg-orange-100 p-3 rounded-lg">
                        <h4 className="font-medium text-orange-900 mb-2">Example vCard:</h4>
                        <div className="text-xs font-mono text-orange-800">
                          <div>Email: john@company.com</div>
                          <div>Phone: +1-555-123-4567</div>
                          <div>URL: company.com</div>
                        </div>
                      </div>
                      <ul className="text-xs text-orange-700 mt-3 space-y-1">
                        <li>• Email address extraction</li>
                        <li>• Phone number formatting</li>
                        <li>• Name and title parsing</li>
                        <li>• Address component separation</li>
                      </ul>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="bg-green-50 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-green-900 mb-3">Plain Text & Messages</h3>
                      <p className="text-green-800 text-sm mb-4">
                        Many QR codes contain simple text messages, instructions, or informational content. Our scanner applies intelligent formatting to improve readability and remove unnecessary whitespace or formatting artifacts.
                      </p>
                      <div className="space-y-3">
                        <div className="bg-green-100 p-3 rounded-lg">
                          <h4 className="font-medium text-green-900 text-sm">Text Cleaning</h4>
                          <div className="text-xs font-mono text-green-800">Before: "  Welcome   to\n\nour    store!  "</div>
                          <div className="text-xs font-mono text-green-800">After: "Welcome to our store!"</div>
                        </div>
                      </div>
                      <ul className="text-xs text-green-700 mt-3 space-y-1">
                        <li>• Whitespace normalization</li>
                        <li>• Empty line removal</li>
                        <li>• Character encoding detection</li>
                        <li>• Special character preservation</li>
                      </ul>
                    </div>

                    <div className="bg-purple-50 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-purple-900 mb-3">Structured Data Types</h3>
                      <p className="text-purple-800 text-sm mb-4">
                        Advanced QR codes may contain WiFi credentials, payment information, event details, or location data. Our scanner recognizes these formats and extracts key information for easy access and use.
                      </p>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                          <span className="text-purple-800 text-sm"><strong>WiFi:</strong> SSID, password, security type</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                          <span className="text-purple-800 text-sm"><strong>Events:</strong> Calendar entries with dates/times</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                          <span className="text-purple-800 text-sm"><strong>Location:</strong> GPS coordinates and addresses</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Professional Applications */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
                <CardContent className="p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Who Uses QR Code Scanners?</h2>
                  <p className="text-gray-600 mb-6">QR code scanning technology serves diverse professionals and organizations across multiple industries, providing essential functionality for accessing, analyzing, and managing encoded digital information efficiently.</p>
                  
                  <div className="space-y-4">
                    <div className="bg-blue-50 rounded-lg p-4">
                      <h3 className="font-semibold text-blue-900 mb-2">Marketing & Sales Teams</h3>
                      <p className="text-blue-800 text-sm">Analyze campaign QR codes, track engagement metrics, extract customer contact information, and verify marketing material content for accuracy and compliance across campaigns.</p>
                    </div>
                    
                    <div className="bg-green-50 rounded-lg p-4">
                      <h3 className="font-semibold text-green-900 mb-2">Event & Conference Organizers</h3>
                      <p className="text-green-800 text-sm">Process attendee tickets, extract contact information from business cards, verify event credentials, and manage digital check-in systems for streamlined event operations.</p>
                    </div>
                    
                    <div className="bg-purple-50 rounded-lg p-4">
                      <h3 className="font-semibold text-purple-900 mb-2">Retail & E-commerce</h3>
                      <p className="text-purple-800 text-sm">Scan product codes, verify inventory information, process customer feedback QR codes, and analyze competitor marketing materials for business intelligence.</p>
                    </div>
                    
                    <div className="bg-orange-50 rounded-lg p-4">
                      <h3 className="font-semibold text-orange-900 mb-2">Educators & Researchers</h3>
                      <p className="text-orange-800 text-sm">Extract educational content from textbooks, analyze research QR codes, process survey responses, and create interactive learning materials for enhanced student engagement.</p>
                    </div>

                    <div className="bg-teal-50 rounded-lg p-4">
                      <h3 className="font-semibold text-teal-900 mb-2">IT & Security Professionals</h3>
                      <p className="text-teal-800 text-sm">Audit QR code security, analyze potential threats, extract configuration data, and verify authenticity of QR codes in enterprise environments.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
                <CardContent className="p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Key Features & Benefits</h2>
                  <p className="text-gray-600 mb-6">Our QR code scanner offers comprehensive features designed to meet professional, educational, and personal scanning needs with maximum accuracy and intelligent content processing.</p>
                  
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                        <span className="text-white text-xs font-bold">✓</span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-1">Multiple Image Format Support</h4>
                        <p className="text-gray-600 text-sm">Process JPG, PNG, GIF, and WebP images up to 10MB with automatic format detection and optimization for best scanning results.</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                        <span className="text-white text-xs font-bold">✓</span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-1">Smart Content Detection</h4>
                        <p className="text-gray-600 text-sm">Automatically identify and extract URLs, email addresses, phone numbers, and structured data with intelligent parsing and formatting.</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                        <span className="text-white text-xs font-bold">✓</span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-1">Advanced Text Processing</h4>
                        <p className="text-gray-600 text-sm">Clean formatting, remove empty lines, normalize spacing, and preserve or adjust text case based on your specific requirements.</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                        <span className="text-white text-xs font-bold">✓</span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-1">Scanning History & Statistics</h4>
                        <p className="text-gray-600 text-sm">Track recently scanned codes with detailed statistics including character counts, file sizes, and content type analysis for reference.</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-teal-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                        <span className="text-white text-xs font-bold">✓</span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-1">Privacy & Security</h4>
                        <p className="text-gray-600 text-sm">All scanning happens locally in your browser - no images or data uploaded to servers, ensuring complete privacy and security of your content.</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* How QR Code Scanning Works */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">How QR Code Scanning Technology Works</h2>
                <p className="text-gray-600 mb-8">Understanding the technical process behind QR code scanning helps you optimize image quality and interpret results accurately for your specific applications and use cases.</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-blue-900 mb-4">Step-by-Step Scanning Process</h3>
                      <div className="space-y-4">
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-white font-bold text-sm">1</span>
                          </div>
                          <div>
                            <h4 className="font-medium text-blue-900">Image Analysis</h4>
                            <p className="text-blue-800 text-sm">The uploaded image is processed to detect QR code patterns, including finder patterns, alignment markers, and timing patterns for accurate positioning.</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-white font-bold text-sm">2</span>
                          </div>
                          <div>
                            <h4 className="font-medium text-blue-900">Data Extraction</h4>
                            <p className="text-blue-800 text-sm">The QR code modules (black and white squares) are decoded using error correction algorithms to extract the raw binary data accurately.</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-white font-bold text-sm">3</span>
                          </div>
                          <div>
                            <h4 className="font-medium text-blue-900">Content Decoding</h4>
                            <p className="text-blue-800 text-sm">Binary data is converted back to readable content using appropriate character encoding (UTF-8, ISO-8859-1, etc.) based on the QR code's encoding mode.</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-white font-bold text-sm">4</span>
                          </div>
                          <div>
                            <h4 className="font-medium text-blue-900">Smart Processing</h4>
                            <p className="text-blue-800 text-sm">Extracted content is analyzed for URLs, emails, phone numbers, and other structured data, then formatted according to your processing preferences.</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-6">
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-green-900 mb-4">Scanning Optimization Tips</h3>
                      <div className="space-y-4">
                        <div className="bg-green-100 p-4 rounded-lg">
                          <h4 className="font-medium text-green-900 mb-2">Image Quality Guidelines</h4>
                          <ul className="text-sm text-green-800 space-y-1">
                            <li>• Use high-resolution images (300+ DPI recommended)</li>
                            <li>• Ensure good contrast between QR code and background</li>
                            <li>• Avoid blurry or distorted images</li>
                            <li>• Include quiet zone (white space) around QR code</li>
                          </ul>
                        </div>
                        <div className="bg-green-100 p-4 rounded-lg">
                          <h4 className="font-medium text-green-900 mb-2">Common Scanning Issues</h4>
                          <ul className="text-sm text-green-800 space-y-1">
                            <li>• Insufficient lighting or shadows</li>
                            <li>• QR code too small or pixelated</li>
                            <li>• Damaged or partially obscured codes</li>
                            <li>• Reflective surfaces causing glare</li>
                          </ul>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gradient-to-r from-purple-50 to-violet-50 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-purple-900 mb-4">Technical Specifications</h3>
                      <div className="space-y-3 text-sm">
                        <div className="flex items-start gap-2">
                          <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                          <span className="text-purple-800"><strong>Version Support:</strong> QR Code versions 1-40 (21x21 to 177x177 modules)</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                          <span className="text-purple-800"><strong>Error Correction:</strong> L (~7%), M (~15%), Q (~25%), H (~30%)</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                          <span className="text-purple-800"><strong>Data Capacity:</strong> Up to 4,296 alphanumeric characters</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                          <span className="text-purple-800"><strong>Encoding Modes:</strong> Numeric, Alphanumeric, Byte, Kanji</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Business Applications */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Business Applications & Use Cases</h2>
                <p className="text-gray-600 mb-8">QR code scanning extends beyond simple information access, serving critical business functions across industries from marketing analytics to inventory management and customer engagement tracking.</p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900">Marketing & Analytics</h3>
                    <div className="space-y-3">
                      <div className="bg-blue-50 border-l-4 border-blue-400 p-3 rounded-r-lg">
                        <h4 className="font-semibold text-blue-900 text-sm">Campaign Tracking</h4>
                        <p className="text-blue-800 text-xs mt-1">Analyze QR codes from marketing materials to verify campaign URLs, track content accuracy, and ensure proper attribution.</p>
                      </div>
                      <div className="bg-indigo-50 border-l-4 border-indigo-400 p-3 rounded-r-lg">
                        <h4 className="font-semibold text-indigo-900 text-sm">Customer Engagement</h4>
                        <p className="text-indigo-800 text-xs mt-1">Extract contact information from business cards, process feedback QR codes, and analyze customer interaction data.</p>
                      </div>
                      <div className="bg-cyan-50 border-l-4 border-cyan-400 p-3 rounded-r-lg">
                        <h4 className="font-semibold text-cyan-900 text-sm">Content Verification</h4>
                        <p className="text-cyan-800 text-xs mt-1">Verify promotional content accuracy, check link destinations, and ensure marketing compliance across materials.</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900">Operations & Management</h3>
                    <div className="space-y-3">
                      <div className="bg-green-50 border-l-4 border-green-400 p-3 rounded-r-lg">
                        <h4 className="font-semibold text-green-900 text-sm">Inventory Control</h4>
                        <p className="text-green-800 text-xs mt-1">Scan product QR codes to extract SKU information, pricing data, and inventory details for management systems.</p>
                      </div>
                      <div className="bg-emerald-50 border-l-4 border-emerald-400 p-3 rounded-r-lg">
                        <h4 className="font-semibold text-emerald-900 text-sm">Event Management</h4>
                        <p className="text-emerald-800 text-xs mt-1">Process event tickets, extract attendee information, and verify credentials for streamlined check-in processes.</p>
                      </div>
                      <div className="bg-teal-50 border-l-4 border-teal-400 p-3 rounded-r-lg">
                        <h4 className="font-semibold text-teal-900 text-sm">Document Processing</h4>
                        <p className="text-teal-800 text-xs mt-1">Extract metadata from document QR codes, process form submissions, and automate data entry workflows.</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900">Security & Compliance</h3>
                    <div className="space-y-3">
                      <div className="bg-orange-50 border-l-4 border-orange-400 p-3 rounded-r-lg">
                        <h4 className="font-semibold text-orange-900 text-sm">Authentication</h4>
                        <p className="text-orange-800 text-xs mt-1">Verify QR code authenticity, check digital signatures, and validate secure access credentials.</p>
                      </div>
                      <div className="bg-red-50 border-l-4 border-red-400 p-3 rounded-r-lg">
                        <h4 className="font-semibold text-red-900 text-sm">Audit Trails</h4>
                        <p className="text-red-800 text-xs mt-1">Extract audit information from QR codes, track compliance data, and maintain security logs.</p>
                      </div>
                      <div className="bg-pink-50 border-l-4 border-pink-400 p-3 rounded-r-lg">
                        <h4 className="font-semibold text-pink-900 text-sm">Risk Assessment</h4>
                        <p className="text-pink-800 text-xs mt-1">Analyze QR code content for potential security risks, malicious URLs, and compliance violations.</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-8 bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Industry-Specific Applications</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium text-gray-800 mb-2">Healthcare & Medical</h4>
                      <p className="text-gray-600 text-sm">Patient identification, medication tracking, medical record access, and equipment management through QR code scanning systems.</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-800 mb-2">Retail & E-commerce</h4>
                      <p className="text-gray-600 text-sm">Product information extraction, price verification, customer reviews access, and loyalty program integration for enhanced shopping experiences.</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-800 mb-2">Education & Training</h4>
                      <p className="text-gray-600 text-sm">Course material access, assignment submission, attendance tracking, and interactive learning content delivery through QR codes.</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-800 mb-2">Transportation & Logistics</h4>
                      <p className="text-gray-600 text-sm">Package tracking, route information, boarding passes, and delivery confirmation through comprehensive QR code systems.</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Frequently Asked Questions */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-8">Frequently Asked Questions</h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">What types of QR codes can this scanner read?</h3>
                      <p className="text-gray-600 text-sm">
                        Our scanner supports all standard QR code versions (1-40) and can read text, URLs, email addresses, phone numbers, vCard contact information, WiFi credentials, and other structured data formats encoded in QR codes.
                      </p>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">What image formats are supported for QR code scanning?</h3>
                      <p className="text-gray-600 text-sm">
                        The scanner accepts JPG, PNG, GIF, and WebP image formats up to 10MB in size. For best results, use high-resolution images with good contrast between the QR code and background.
                      </p>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">How does the smart content detection work?</h3>
                      <p className="text-gray-600 text-sm">
                        Our intelligent parser automatically identifies different content types within scanned text, including URLs (with protocol addition), email addresses, phone numbers, and structured data, separating them for easy copying and use.
                      </p>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Can I scan QR codes that contain special characters or non-English text?</h3>
                      <p className="text-gray-600 text-sm">
                        Yes! Our scanner supports UTF-8 encoding and can handle QR codes containing special characters, emojis, and text in various languages including Chinese, Japanese, Arabic, and others.
                      </p>
                    </div>
                  </div>
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Is my data secure when using this QR code scanner?</h3>
                      <p className="text-gray-600 text-sm">
                        Absolutely secure! All QR code processing happens locally in your browser using client-side JavaScript. No images or extracted data are uploaded to servers, ensuring complete privacy and security of your information.
                      </p>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">What should I do if a QR code won't scan properly?</h3>
                      <p className="text-gray-600 text-sm">
                        Ensure the image is high quality, well-lit, and not blurry. The QR code should be fully visible with adequate white space around it. Try adjusting the image contrast or using a higher resolution scan if issues persist.
                      </p>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Can I customize how the extracted content is processed?</h3>
                      <p className="text-gray-600 text-sm">
                        Yes! Use the Advanced Content Detection options to control URL extraction, email detection, text formatting, empty line removal, case preservation, and phone number recognition based on your specific needs.
                      </p>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Does this work offline after the page loads?</h3>
                      <p className="text-gray-600 text-sm">
                        Yes! Once the page loads completely, all scanning functionality works offline without requiring an internet connection, making it reliable for secure environments and areas with limited connectivity.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Technical Specifications */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Technical Specifications & Compatibility</h2>
                <p className="text-gray-600 mb-8">Our QR code scanner is built with modern web technologies to ensure compatibility, performance, and reliability across all major platforms and devices with comprehensive QR code standard support.</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">QR Code Support & Specifications</h3>
                    <div className="space-y-4">
                      <div className="bg-blue-50 rounded-lg p-4">
                        <h4 className="font-semibold text-blue-900 mb-2">QR Code Standards</h4>
                        <ul className="text-blue-800 text-sm space-y-1">
                          <li>• ISO/IEC 18004:2015 compliant</li>
                          <li>• Versions 1-40 (21x21 to 177x177 modules)</li>
                          <li>• All error correction levels (L, M, Q, H)</li>
                          <li>• Multiple encoding modes supported</li>
                        </ul>
                      </div>
                      <div className="bg-orange-50 rounded-lg p-4">
                        <h4 className="font-semibold text-orange-900 mb-2">Image Processing</h4>
                        <ul className="text-orange-800 text-sm space-y-1">
                          <li>• Maximum file size: 10MB</li>
                          <li>• Minimum resolution: 100x100 pixels</li>
                          <li>• Automatic contrast adjustment</li>
                          <li>• Noise reduction and enhancement</li>
                        </ul>
                      </div>
                      <div className="bg-purple-50 rounded-lg p-4">
                        <h4 className="font-semibold text-purple-900 mb-2">Content Extraction</h4>
                        <ul className="text-purple-800 text-sm space-y-1">
                          <li>• UTF-8 character encoding support</li>
                          <li>• Maximum content: 4,296 alphanumeric characters</li>
                          <li>• Structured data parsing (vCard, WiFi, etc.)</li>
                          <li>• Regular expression pattern matching</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">Platform & Browser Support</h3>
                    <div className="space-y-4">
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h4 className="font-semibold text-gray-900 mb-2">Desktop Browsers</h4>
                        <ul className="text-gray-700 text-sm space-y-1">
                          <li>• Chrome 90+ (recommended for performance)</li>
                          <li>• Firefox 88+ (excellent image processing)</li>
                          <li>• Safari 14+ (full QR code support)</li>
                          <li>• Edge 90+ (optimal scanning experience)</li>
                        </ul>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h4 className="font-semibold text-gray-900 mb-2">Mobile Devices</h4>
                        <ul className="text-gray-700 text-sm space-y-1">
                          <li>• iOS Safari 14+ (drag & drop support)</li>
                          <li>• Android Chrome 90+ (camera integration)</li>
                          <li>• Samsung Internet 13+ (full features)</li>
                          <li>• Mobile Firefox 88+ (complete support)</li>
                        </ul>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h4 className="font-semibold text-gray-900 mb-2">Performance Features</h4>
                        <ul className="text-gray-700 text-sm space-y-1">
                          <li>• Real-time image processing</li>
                          <li>• Client-side scanning (no server dependency)</li>
                          <li>• Responsive design (all screen sizes)</li>
                          <li>• Accessibility compliant (WCAG 2.1 AA)</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default QRCodeScanner;
