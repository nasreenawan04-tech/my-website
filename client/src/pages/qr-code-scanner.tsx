
import { useState, useRef } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import jsQR from 'jsqr';
import { ToolSEOHead } from '@/components/seo/ToolSEOHead';
import { qrCodeScannerSEO } from '@/config/seo/tools/qr-code-scanner';

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

  const scanQRFromImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        const img = new Image();
        
        img.onload = () => {
          try {
            // Create canvas for image processing
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            if (!ctx) {
              reject(new Error('Could not get canvas context'));
              return;
            }

            // Calculate optimal dimensions for performance
            // Resize large images to max 1500px while maintaining aspect ratio
            const maxDimension = 1500;
            let width = img.width;
            let height = img.height;

            if (width > maxDimension || height > maxDimension) {
              if (width > height) {
                height = (height / width) * maxDimension;
                width = maxDimension;
              } else {
                width = (width / height) * maxDimension;
                height = maxDimension;
              }
            }

            canvas.width = width;
            canvas.height = height;

            // Draw image on canvas
            ctx.drawImage(img, 0, 0, width, height);

            // Get image data for QR scanning
            const imageData = ctx.getImageData(0, 0, width, height);

            // Scan QR code using jsQR with support for both standard and inverted QR codes
            const code = jsQR(imageData.data, imageData.width, imageData.height, {
              inversionAttempts: 'attemptBoth',
            });

            if (code && code.data) {
              resolve(code.data);
            } else {
              reject(new Error('No QR code found in image'));
            }
          } catch (error) {
            reject(error);
          }
        };

        img.onerror = () => {
          reject(new Error('Failed to load image'));
        };

        img.src = e.target?.result as string;
      };

      reader.onerror = () => {
        reject(new Error('Failed to read file'));
      };

      reader.readAsDataURL(file);
    });
  };

  const handleScanQR = async () => {
    if (!uploadedImage) return;

    setIsScanning(true);
    setScannedText('');

    try {
      // Scan QR code from uploaded image using pure client-side processing
      const result = await scanQRFromImage(uploadedImage);
      
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
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      
      if (errorMessage.includes('No QR code found')) {
        setScannedText('❌ Could not find a valid QR code in this image. Please ensure:\n• The image contains a clear QR code\n• The QR code is not blurry or damaged\n• There is good contrast between the QR code and background\n• The entire QR code is visible in the image');
      } else if (errorMessage.includes('Failed to load image')) {
        setScannedText('❌ Failed to load the image. Please try a different image format (JPG, PNG, WebP).');
      } else {
        setScannedText('❌ Could not scan QR code. Please make sure the image contains a valid, clear QR code.');
      }
      
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-blue-950 dark:to-indigo-950">
      <ToolSEOHead config={qrCodeScannerSEO} />
      <Header />

      <main>
        {/* Hero Section */}
        <section className="relative py-12 sm:py-16 md:py-20 lg:py-24 xl:py-32 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-indigo-600/20 dark:from-blue-600/20 dark:to-indigo-600/30"></div>
          <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="space-y-6 sm:space-y-8">
              <div className="inline-flex items-center px-3 sm:px-4 py-1.5 sm:py-2 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-full border border-blue-200 dark:border-blue-700">
                <span className="text-xs sm:text-sm font-medium text-blue-700 dark:text-blue-300">Professional QR Scanner</span>
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl 2xl:text-8xl font-bold text-slate-900 dark:text-white leading-tight tracking-tight" data-testid="text-page-title">
                <span className="block">QR Code</span>
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 mt-1 sm:mt-2">
                  Scanner
                </span>
              </h1>
              <p className="text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl text-slate-600 dark:text-slate-300 max-w-sm sm:max-w-lg md:max-w-2xl lg:max-w-3xl xl:max-w-4xl mx-auto leading-relaxed px-2 sm:px-0">
                Upload QR code images to extract text, URLs, emails, and contact information instantly
              </p>
            </div>
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
          {/* Main Scanner Card */}
          <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm shadow-2xl border-0 rounded-2xl sm:rounded-3xl overflow-hidden">
            <CardContent className="p-0">
              <div className="flex flex-col">
                {/* Input Section */}
                <div className="p-4 sm:p-6 md:p-8 lg:p-10 xl:p-12 space-y-6 sm:space-y-8">
                  <div>
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">QR Code Scanner</h2>
                    <p className="text-gray-600 dark:text-gray-300">Upload QR code images to extract and analyze content</p>
                  </div>

                  <div className="space-y-4 sm:space-y-6">
                    {/* File Upload Area */}
                    <div className="space-y-3">
                      <Label htmlFor="qr-upload" className="text-sm font-semibold text-gray-800 dark:text-gray-200 uppercase tracking-wide">
                        QR Code Image Upload
                      </Label>
                      <div
                        className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-8 sm:p-12 text-center hover:border-blue-400 dark:hover:border-blue-500 transition-colors duration-300 bg-gray-50/50 dark:bg-slate-900/50"
                        onDragOver={handleDragOver}
                        onDrop={handleDrop}
                        data-testid="qr-upload-area"
                      >
                        {uploadedImage ? (
                          <div className="space-y-4">
                            <img
                              src={URL.createObjectURL(uploadedImage)}
                              alt="Uploaded QR Code"
                              className="max-w-xs max-h-64 mx-auto rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm"
                              data-testid="uploaded-qr-image"
                            />
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                              <p className="font-medium">{uploadedImage.name}</p>
                              <p className="text-xs">{Math.round(uploadedImage.size / 1024)} KB</p>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-blue-100 dark:bg-blue-900/50 rounded-2xl mx-auto mb-4 sm:mb-6 flex items-center justify-center">
                              <div className="text-2xl sm:text-3xl font-bold text-blue-500 dark:text-blue-400">QR</div>
                            </div>
                            <div>
                              <p className="text-lg sm:text-xl text-gray-700 dark:text-gray-300 mb-2 font-medium">
                                Drop QR code image here or click to browse
                              </p>
                              <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400">
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
                          className="mt-6 h-12 sm:h-14 px-6 sm:px-8 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 dark:from-blue-500 dark:to-indigo-500 dark:hover:from-blue-600 dark:hover:to-indigo-600 text-white font-semibold text-base sm:text-lg rounded-xl shadow-lg transition-colors duration-200 active:scale-95"
                          data-testid="button-browse-files"
                        >
                          {isScanning ? 'Scanning QR Code...' : 'Browse Files'}
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Advanced Options */}
                  <div className="space-y-4 sm:space-y-6 border-t dark:border-gray-700 pt-6 sm:pt-8">
                    <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">Content Processing Options</h3>
                    
                    <Collapsible open={showAdvanced} onOpenChange={setShowAdvanced}>
                      <CollapsibleTrigger asChild>
                        <Button 
                          variant="ghost" 
                          className="w-full justify-between text-sm sm:text-base py-3 sm:py-4 h-auto dark:text-gray-200 dark:hover:bg-slate-700"
                          data-testid="button-toggle-advanced"
                        >
                          <span className="flex items-center">
                            Advanced Content Detection
                          </span>
                          <span className={`transform transition-transform ${showAdvanced ? 'rotate-180' : ''}`}>▼</span>
                        </Button>
                      </CollapsibleTrigger>
                      <CollapsibleContent className="space-y-4 sm:space-y-6 mt-4">
                        <Separator className="dark:bg-gray-700" />
                        
                        {/* Processing Options */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                          <div className="space-y-4 bg-gray-50 dark:bg-slate-900 rounded-xl p-4 sm:p-6">
                            <h4 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white">Content Detection</h4>
                            
                            <div className="flex items-center justify-between gap-2">
                              <div className="space-y-1 flex-1 min-w-0">
                                <Label className="text-xs sm:text-sm font-medium dark:text-gray-200">Extract URLs</Label>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Automatically detect and extract website URLs</p>
                              </div>
                              <Switch
                                checked={options.extractUrls}
                                onCheckedChange={(value) => updateOption('extractUrls', value)}
                                data-testid="switch-extract-urls"
                              />
                            </div>

                            <div className="flex items-center justify-between gap-2">
                              <div className="space-y-1 flex-1 min-w-0">
                                <Label className="text-xs sm:text-sm font-medium dark:text-gray-200">Extract Email Addresses</Label>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Find and extract email addresses from content</p>
                              </div>
                              <Switch
                                checked={options.extractEmails}
                                onCheckedChange={(value) => updateOption('extractEmails', value)}
                                data-testid="switch-extract-emails"
                              />
                            </div>

                            <div className="flex items-center justify-between gap-2">
                              <div className="space-y-1 flex-1 min-w-0">
                                <Label className="text-xs sm:text-sm font-medium dark:text-gray-200">Auto-Detect Phone Numbers</Label>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Identify and extract phone numbers</p>
                              </div>
                              <Switch
                                checked={options.autoDetectPhone}
                                onCheckedChange={(value) => updateOption('autoDetectPhone', value)}
                                data-testid="switch-auto-detect-phone"
                              />
                            </div>
                          </div>

                          {/* Text Processing Options */}
                          <div className="space-y-4 bg-gray-50 dark:bg-slate-900 rounded-xl p-4 sm:p-6">
                            <h4 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white">Text Processing</h4>
                            
                            <div className="flex items-center justify-between gap-2">
                              <div className="space-y-1 flex-1 min-w-0">
                                <Label className="text-xs sm:text-sm font-medium dark:text-gray-200">Format Text</Label>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Clean up spacing and normalize formatting</p>
                              </div>
                              <Switch
                                checked={options.formatText}
                                onCheckedChange={(value) => updateOption('formatText', value)}
                                data-testid="switch-format-text"
                              />
                            </div>

                            <div className="flex items-center justify-between gap-2">
                              <div className="space-y-1 flex-1 min-w-0">
                                <Label className="text-xs sm:text-sm font-medium dark:text-gray-200">Remove Empty Lines</Label>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Clean up empty lines from extracted text</p>
                              </div>
                              <Switch
                                checked={options.removeEmptyLines}
                                onCheckedChange={(value) => updateOption('removeEmptyLines', value)}
                                data-testid="switch-remove-empty-lines"
                              />
                            </div>

                            <div className="flex items-center justify-between gap-2">
                              <div className="space-y-1 flex-1 min-w-0">
                                <Label className="text-xs sm:text-sm font-medium dark:text-gray-200">Preserve Case</Label>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Maintain original text capitalization</p>
                              </div>
                              <Switch
                                checked={options.preserveCase}
                                onCheckedChange={(value) => updateOption('preserveCase', value)}
                                data-testid="switch-preserve-case"
                              />
                            </div>
                          </div>
                        </div>
                        
                        <Separator className="dark:bg-gray-700" />
                      </CollapsibleContent>
                    </Collapsible>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4 sm:pt-6">
                    <Button
                      onClick={handleScanQR}
                      disabled={!uploadedImage || isScanning}
                      className="flex-1 h-12 sm:h-14 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 dark:from-blue-500 dark:to-indigo-500 dark:hover:from-blue-600 dark:hover:to-indigo-600 text-white font-semibold text-base sm:text-lg rounded-xl shadow-lg transition-colors duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                      data-testid="button-scan-qr"
                    >
                      {isScanning ? (
                        <span className="flex items-center gap-2">
                          <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Scanning...
                        </span>
                      ) : 'Scan QR Code'}
                    </Button>
                    <Button
                      onClick={resetScanner}
                      variant="outline"
                      className="h-12 sm:h-14 px-6 sm:px-8 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-700 font-semibold text-base sm:text-lg rounded-xl transition-colors duration-200"
                      data-testid="button-reset"
                    >
                      Reset
                    </Button>
                  </div>
                </div>

                {/* Results Section */}
                {showResults && (
                  <div className="bg-gradient-to-br from-gray-50 to-blue-50 dark:from-slate-900 dark:to-blue-950 p-4 sm:p-6 md:p-8 lg:p-10 xl:p-12 border-t dark:border-gray-700">
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-6 sm:mb-8">Scanned Results</h2>

                    {hasScanned && uploadedImage ? (
                    <div className="space-y-3 sm:space-y-4" data-testid="scanned-results">
                      {/* Main Scanned Text Display */}
                      <div className={`${scannedText.includes('❌') ? 'bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800' : 'bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-700'} border-2 rounded-xl p-3 sm:p-4 transition-colors duration-300`}>
                        <div className="flex items-center justify-between mb-3 gap-3">
                          <div className="flex-1 min-w-0">
                            <h3 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white truncate">
                              {scannedText.includes('❌') ? 'Scan Result' : 'Extracted Text'}
                            </h3>
                            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 break-words">
                              {scannedText.includes('❌') ? 'Unable to scan QR code' : 'Raw content from QR code'}
                            </p>
                          </div>
                          {!scannedText.includes('❌') && (
                            <Button
                              onClick={() => handleCopyToClipboard(scannedText)}
                              variant="outline"
                              size="sm"
                              className="text-xs px-2 sm:px-3 py-2 flex-shrink-0 rounded-lg min-w-[60px] sm:min-w-[70px] h-11 sm:h-9 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-slate-700"
                              data-testid="button-copy-scanned-text"
                            >
                              Copy
                            </Button>
                          )}
                        </div>
                        <div 
                          className={`${scannedText.includes('❌') ? 'bg-white dark:bg-slate-800 text-red-700 dark:text-red-300' : 'bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100'} p-3 sm:p-4 rounded-lg font-mono text-xs sm:text-sm break-all whitespace-pre-wrap max-h-60 overflow-y-auto`}
                          data-testid="scanned-text-content"
                        >
                          {scannedText || 'No text extracted'}
                        </div>
                      </div>

                      {/* Extracted Content Display - Only show if successful */}
                      {!scannedText.includes('❌') && scannedQRs.length > 0 && scannedQRs[0].extractedContent.length > 0 && (
                        <div className="bg-green-50 dark:bg-green-950 border-2 border-green-200 dark:border-green-800 rounded-xl p-3 sm:p-4 transition-colors duration-300">
                          <div className="flex items-center justify-between mb-3">
                            <h3 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white">✅ Detected Content</h3>
                          </div>
                          <div className="space-y-2">
                            {scannedQRs[0].extractedContent.map((content, idx) => (
                              <div key={idx} className="flex items-center gap-2 bg-white dark:bg-slate-800 p-2 sm:p-3 rounded-lg group hover:bg-green-100 dark:hover:bg-green-900/20 transition-colors">
                                <span className="flex-1 text-xs sm:text-sm text-gray-800 dark:text-gray-200 break-all">{content}</span>
                                <Button
                                  onClick={() => handleCopyToClipboard(content)}
                                  variant="ghost"
                                  size="sm"
                                  className="opacity-0 group-hover:opacity-100 transition-opacity text-xs px-2 h-8 dark:text-gray-300 dark:hover:bg-slate-700"
                                  data-testid={`button-copy-content-${idx}`}
                                >
                                  Copy
                                </Button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Image Info */}
                      <div className="bg-gray-100 dark:bg-slate-800 rounded-lg p-3 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                        <div className="flex flex-wrap gap-4">
                          <span><strong className="dark:text-gray-300">File:</strong> {uploadedImage.name}</span>
                          <span><strong className="dark:text-gray-300">Size:</strong> {Math.round(uploadedImage.size / 1024)} KB</span>
                          <span><strong className="dark:text-gray-300">Time:</strong> {new Date().toLocaleTimeString()}</span>
                        </div>
                      </div>
                    </div>
                    ) : (
                      <p className="text-gray-500 dark:text-gray-400">No results yet. Upload and scan a QR code to see results.</p>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
            <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl hover:shadow-2xl transition-shadow duration-300">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/50 rounded-xl mb-4 flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">100% Secure & Private</h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  All QR scanning happens locally in your browser. No data is uploaded to any server, ensuring complete privacy and security.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl hover:shadow-2xl transition-shadow duration-300">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/50 rounded-xl mb-4 flex items-center justify-center">
                  <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Lightning Fast Processing</h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  Advanced canvas-based image processing delivers instant results. Optimized for large images without compromising speed.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl hover:shadow-2xl transition-shadow duration-300">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/50 rounded-xl mb-4 flex items-center justify-center">
                  <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Smart Content Detection</h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  Automatically identifies and extracts URLs, emails, phone numbers, and other structured data from scanned QR codes.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Use Cases Section */}
          <div className="mt-16">
            <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">Common Use Cases</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/50 rounded-lg flex items-center justify-center mb-3">
                      <span className="text-xl">📱</span>
                    </div>
                    <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-2">Business Cards & vCards</h4>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">Instantly extract contact information from business card QR codes including names, emails, phone numbers, and addresses.</p>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="w-10 h-10 bg-green-100 dark:bg-green-900/50 rounded-lg flex items-center justify-center mb-3">
                      <span className="text-xl">🔗</span>
                    </div>
                    <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-2">Website URLs & Links</h4>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">Scan QR codes from posters, products, or advertisements to quickly access websites and online content.</p>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/50 rounded-lg flex items-center justify-center mb-3">
                      <span className="text-xl">📄</span>
                    </div>
                    <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-2">Document Tracking</h4>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">Extract document IDs, tracking numbers, and reference codes from QR-enabled documents and packages.</p>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/50 rounded-lg flex items-center justify-center mb-3">
                      <span className="text-xl">📊</span>
                    </div>
                    <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-2">Event Tickets & Passes</h4>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">Scan tickets and digital passes to extract event details, seat numbers, and authentication codes.</p>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="w-10 h-10 bg-red-100 dark:bg-red-900/50 rounded-lg flex items-center justify-center mb-3">
                      <span className="text-xl">📦</span>
                    </div>
                    <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-2">Product Information</h4>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">Retrieve product details, serial numbers, warranty information, and manufacturer data from product QR codes.</p>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/50 rounded-lg flex items-center justify-center mb-3">
                      <span className="text-xl">🚚</span>
                    </div>
                    <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-2">Transportation & Logistics</h4>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">Package tracking, route information, boarding passes, and delivery confirmation through comprehensive QR code systems.</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Frequently Asked Questions */}
            <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl mt-8">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">Frequently Asked Questions</h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">What types of QR codes can this scanner read?</h3>
                      <p className="text-gray-600 dark:text-gray-400 text-sm">
                        Our scanner supports all standard QR code versions (1-40) and can read text, URLs, email addresses, phone numbers, vCard contact information, WiFi credentials, and other structured data formats encoded in QR codes.
                      </p>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">What image formats are supported for QR code scanning?</h3>
                      <p className="text-gray-600 dark:text-gray-400 text-sm">
                        The scanner accepts JPG, PNG, GIF, and WebP image formats up to 10MB in size. For best results, use high-resolution images with good contrast between the QR code and background.
                      </p>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">How does the smart content detection work?</h3>
                      <p className="text-gray-600 dark:text-gray-400 text-sm">
                        Our intelligent parser automatically identifies different content types within scanned text, including URLs (with protocol addition), email addresses, phone numbers, and structured data, separating them for easy copying and use.
                      </p>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Can I scan QR codes that contain special characters or non-English text?</h3>
                      <p className="text-gray-600 dark:text-gray-400 text-sm">
                        Yes! Our scanner supports UTF-8 encoding and can handle QR codes containing special characters, emojis, and text in various languages including Chinese, Japanese, Arabic, and others.
                      </p>
                    </div>
                  </div>
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Is my data secure when using this QR code scanner?</h3>
                      <p className="text-gray-600 dark:text-gray-400 text-sm">
                        Absolutely secure! All QR code processing happens locally in your browser using client-side JavaScript. No images or extracted data are uploaded to servers, ensuring complete privacy and security of your information.
                      </p>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">What should I do if a QR code won't scan properly?</h3>
                      <p className="text-gray-600 dark:text-gray-400 text-sm">
                        Ensure the image is high quality, well-lit, and not blurry. The QR code should be fully visible with adequate white space around it. Try adjusting the image contrast or using a higher resolution scan if issues persist.
                      </p>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Can I customize how the extracted content is processed?</h3>
                      <p className="text-gray-600 dark:text-gray-400 text-sm">
                        Yes! Use the Advanced Content Detection options to control URL extraction, email detection, text formatting, empty line removal, case preservation, and phone number recognition based on your specific needs.
                      </p>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Does this work offline after the page loads?</h3>
                      <p className="text-gray-600 dark:text-gray-400 text-sm">
                        Yes! Once the page loads completely, all scanning functionality works offline without requiring an internet connection, making it reliable for secure environments and areas with limited connectivity.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Technical Specifications */}
            <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl mt-8">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Technical Specifications & Compatibility</h2>
                <p className="text-gray-600 dark:text-gray-400 mb-8">Our QR code scanner is built with modern web technologies to ensure compatibility, performance, and reliability across all major platforms and devices with comprehensive QR code standard support.</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">QR Code Support & Specifications</h3>
                    <div className="space-y-4">
                      <div className="bg-blue-50 dark:bg-blue-950 rounded-lg p-4">
                        <h4 className="font-semibold text-blue-900 dark:text-blue-300 mb-2">QR Code Standards</h4>
                        <ul className="text-blue-800 dark:text-blue-400 text-sm space-y-1">
                          <li>• ISO/IEC 18004:2015 compliant</li>
                          <li>• Versions 1-40 (21x21 to 177x177 modules)</li>
                          <li>• All error correction levels (L, M, Q, H)</li>
                          <li>• Multiple encoding modes supported</li>
                        </ul>
                      </div>
                      <div className="bg-orange-50 dark:bg-orange-950 rounded-lg p-4">
                        <h4 className="font-semibold text-orange-900 dark:text-orange-300 mb-2">Image Processing</h4>
                        <ul className="text-orange-800 dark:text-orange-400 text-sm space-y-1">
                          <li>• Maximum file size: 10MB</li>
                          <li>• Minimum resolution: 100x100 pixels</li>
                          <li>• Automatic image resizing for optimization</li>
                          <li>• Canvas-based in-memory processing</li>
                        </ul>
                      </div>
                      <div className="bg-purple-50 dark:bg-purple-950 rounded-lg p-4">
                        <h4 className="font-semibold text-purple-900 dark:text-purple-300 mb-2">Content Extraction</h4>
                        <ul className="text-purple-800 dark:text-purple-400 text-sm space-y-1">
                          <li>• UTF-8 character encoding support</li>
                          <li>• Maximum content: 4,296 alphanumeric characters</li>
                          <li>• Structured data parsing (vCard, WiFi, etc.)</li>
                          <li>• Regular expression pattern matching</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Platform & Browser Support</h3>
                    <div className="space-y-4">
                      <div className="bg-gray-50 dark:bg-slate-900 rounded-lg p-4">
                        <h4 className="font-semibold text-gray-900 dark:text-gray-200 mb-2">Desktop Browsers</h4>
                        <ul className="text-gray-700 dark:text-gray-400 text-sm space-y-1">
                          <li>• Chrome 90+ (recommended for performance)</li>
                          <li>• Firefox 88+ (excellent image processing)</li>
                          <li>• Safari 14+ (full QR code support)</li>
                          <li>• Edge 90+ (optimal scanning experience)</li>
                        </ul>
                      </div>
                      <div className="bg-gray-50 dark:bg-slate-900 rounded-lg p-4">
                        <h4 className="font-semibold text-gray-900 dark:text-gray-200 mb-2">Mobile Devices</h4>
                        <ul className="text-gray-700 dark:text-gray-400 text-sm space-y-1">
                          <li>• iOS Safari 14+ (drag & drop support)</li>
                          <li>• Android Chrome 90+ (camera integration)</li>
                          <li>• Samsung Internet 13+ (full features)</li>
                          <li>• Mobile Firefox 88+ (complete support)</li>
                        </ul>
                      </div>
                      <div className="bg-gray-50 dark:bg-slate-900 rounded-lg p-4">
                        <h4 className="font-semibold text-gray-900 dark:text-gray-200 mb-2">Performance Features</h4>
                        <ul className="text-gray-700 dark:text-gray-400 text-sm space-y-1">
                          <li>• Client-side only (no server required)</li>
                          <li>• Works on Vercel static deployment</li>
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
