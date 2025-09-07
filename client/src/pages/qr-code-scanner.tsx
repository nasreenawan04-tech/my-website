
import { useState, useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import QrScanner from 'qr-scanner';

interface QROptions {
  extractUrls: boolean;
  extractEmails: boolean;
  formatText: boolean;
  removeEmptyLines: boolean;
}

interface ScannedQR {
  scannedText: string;
  extractedContent: string[];
  originalImageUrl: string;
  timestamp: Date;
}

const QRCodeScanner = () => {
  const [scannedQRs, setScannedQRs] = useState<ScannedQR[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const [scannedText, setScannedText] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [options, setOptions] = useState<QROptions>({
    extractUrls: true,
    extractEmails: true,
    formatText: true,
    removeEmptyLines: true
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

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadedImage(file);
    setIsScanning(true);
    setScannedText('');

    try {
      // Scan QR code from uploaded image
      const result = await QrScanner.scanImage(file);
      
      if (result) {
        setScannedText(result);
        
        // Extract content from scanned text
        const extractedContent = extractTextContent(result);
        
        const scannedQR: ScannedQR = {
          scannedText: result,
          extractedContent: extractedContent.length > 0 ? extractedContent : [result],
          originalImageUrl: URL.createObjectURL(file),
          timestamp: new Date()
        };

        setScannedQRs(prev => {
          const updated = [scannedQR, ...prev.filter(qr => qr.scannedText !== result)];
          return updated.slice(0, 10);
        });
      }
    } catch (error) {
      console.error('Error scanning QR code:', error);
      setScannedText('Could not scan QR code. Please make sure the image contains a valid QR code.');
    } finally {
      setIsScanning(false);
    }
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
  };

  const handleDrop = async (event: React.DragEvent) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      const fakeEvent = {
        target: { files: [file] }
      } as React.ChangeEvent<HTMLInputElement>;
      await handleFileUpload(fakeEvent);
    }
  };

  const clearScannedData = () => {
    setUploadedImage(null);
    setScannedText('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Helmet>
        <title>QR Code Scanner - Scan QR Codes to Extract Text | DapsiWow</title>
        <meta name="description" content="Scan QR codes from images to extract text content, URLs, and email addresses. Upload image files and get instant text extraction." />
        <meta name="keywords" content="QR scanner, QR code reader, scan QR code, extract text from QR, QR to text" />
        <meta property="og:title" content="QR Code Scanner - Scan QR Codes to Extract Text" />
        <meta property="og:description" content="Scan QR codes from images to extract and process text content with smart parsing capabilities." />
        <meta property="og:type" content="website" />
        <link rel="canonical" href="/tools/qr-code-scanner" />
      </Helmet>
      
      <Header />
      
      <main>
        {/* Hero Section */}
        <section className="gradient-hero text-white py-16 pt-24">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="w-20 h-20 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <i className="fas fa-camera text-3xl"></i>
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold mb-6" data-testid="text-page-title">
              QR Code Scanner
            </h1>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto">
              Scan QR codes from images to extract text content, URLs, and emails
            </p>
          </div>
        </section>

        {/* Main Tool Section */}
        <section className="py-16">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <Card className="bg-white shadow-sm border-0">
              <CardContent className="p-8">
                <div className="space-y-8">
                  <div>
                    <h2 className="text-2xl font-semibold text-gray-900 mb-6">Upload QR Code Image</h2>
                    
                    {/* Extraction Options */}
                    <div className="mb-6 space-y-4">
                      <h3 className="text-lg font-semibold text-gray-900">Text Processing Options</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                          <div className="space-y-1">
                            <Label className="text-sm font-medium">Extract URLs</Label>
                            <p className="text-xs text-gray-500">Automatically find and extract website URLs</p>
                          </div>
                          <Switch
                            checked={options.extractUrls}
                            onCheckedChange={(value) => updateOption('extractUrls', value)}
                            data-testid="switch-extract-urls"
                          />
                        </div>

                        <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                          <div className="space-y-1">
                            <Label className="text-sm font-medium">Extract Emails</Label>
                            <p className="text-xs text-gray-500">Automatically find and extract email addresses</p>
                          </div>
                          <Switch
                            checked={options.extractEmails}
                            onCheckedChange={(value) => updateOption('extractEmails', value)}
                            data-testid="switch-extract-emails"
                          />
                        </div>

                        <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                          <div className="space-y-1">
                            <Label className="text-sm font-medium">Format Text</Label>
                            <p className="text-xs text-gray-500">Clean up spacing and formatting</p>
                          </div>
                          <Switch
                            checked={options.formatText}
                            onCheckedChange={(value) => updateOption('formatText', value)}
                            data-testid="switch-format-text"
                          />
                        </div>

                        <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                          <div className="space-y-1">
                            <Label className="text-sm font-medium">Remove Empty Lines</Label>
                            <p className="text-xs text-gray-500">Clean up empty lines from text</p>
                          </div>
                          <Switch
                            checked={options.removeEmptyLines}
                            onCheckedChange={(value) => updateOption('removeEmptyLines', value)}
                            data-testid="switch-remove-empty-lines"
                          />
                        </div>
                      </div>
                    </div>
                    
                    {/* File Upload Area */}
                    <div className="space-y-4">
                      <Label className="text-sm font-medium text-gray-700">
                        QR Code Image
                      </Label>
                      <div
                        className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors"
                        onDragOver={handleDragOver}
                        onDrop={handleDrop}
                        data-testid="qr-upload-area"
                      >
                        {uploadedImage ? (
                          <div className="space-y-4">
                            <img
                              src={URL.createObjectURL(uploadedImage)}
                              alt="Uploaded QR Code"
                              className="max-w-xs max-h-64 mx-auto rounded-lg border border-gray-200"
                              data-testid="uploaded-qr-image"
                            />
                            <div className="text-sm text-gray-600">
                              {uploadedImage.name}
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            <i className="fas fa-cloud-upload-alt text-4xl text-gray-400"></i>
                            <div>
                              <p className="text-lg text-gray-600 mb-2">
                                Drop your QR code image here or click to browse
                              </p>
                              <p className="text-sm text-gray-500">
                                Supports JPG, PNG, GIF, WebP formats
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
                        />
                        
                        <Button
                          onClick={() => fileInputRef.current?.click()}
                          variant="outline"
                          className="mt-4"
                          disabled={isScanning}
                          data-testid="button-browse-files"
                        >
                          {isScanning ? (
                            <>
                              <i className="fas fa-spinner fa-spin mr-2"></i>
                              Scanning...
                            </>
                          ) : (
                            <>
                              <i className="fas fa-folder-open mr-2"></i>
                              Browse Files
                            </>
                          )}
                        </Button>
                      </div>

                      {uploadedImage && (
                        <div className="flex gap-4">
                          <Button
                            onClick={clearScannedData}
                            variant="outline"
                            className="flex-1"
                            data-testid="button-clear-upload"
                          >
                            <i className="fas fa-trash mr-2"></i>
                            Clear
                          </Button>
                        </div>
                      )}
                    </div>

                    {/* Scanned Results */}
                    {scannedText && (
                      <div className="space-y-6 mt-8" data-testid="scanned-results">
                        <h3 className="text-xl font-semibold text-gray-900">Scanned QR Code Content</h3>
                        
                        <div className="bg-gray-50 rounded-lg p-4">
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <Label className="text-sm font-medium text-gray-700">Extracted Text</Label>
                              <Button
                                onClick={() => handleCopyToClipboard(scannedText)}
                                variant="ghost"
                                size="sm"
                                data-testid="button-copy-scanned-text"
                              >
                                <i className="fas fa-copy mr-1"></i>
                                Copy
                              </Button>
                            </div>
                            <div className="bg-white p-3 rounded border border-gray-200 text-sm break-words max-h-48 overflow-y-auto" data-testid="scanned-text-content">
                              {scannedText}
                            </div>
                          </div>
                        </div>

                        {/* Show extracted components if any */}
                        {scannedQRs.length > 0 && scannedQRs[0].extractedContent.length > 1 && (
                          <div>
                            <h4 className="font-semibold text-gray-900 mb-3">Extracted Components</h4>
                            <div className="space-y-2">
                              {scannedQRs[0].extractedContent.map((content, index) => (
                                <div key={index} className="flex items-center justify-between bg-white p-3 rounded border border-gray-200">
                                  <span className="text-sm text-gray-700 break-words flex-1" data-testid={`extracted-component-${index}`}>
                                    {content}
                                  </span>
                                  <Button
                                    onClick={() => handleCopyToClipboard(content)}
                                    variant="ghost"
                                    size="sm"
                                    data-testid={`button-copy-component-${index}`}
                                  >
                                    <i className="fas fa-copy"></i>
                                  </Button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {!scannedText && !uploadedImage && !isScanning && (
                      <div className="text-center py-12 text-gray-500">
                        <i className="fas fa-qrcode text-4xl mb-4"></i>
                        <p className="text-lg">Upload a QR code image to extract its text content</p>
                      </div>
                    )}

                    {/* Scanning History */}
                    {scannedQRs.length > 0 && (
                      <div className="mt-8">
                        <h3 className="text-xl font-semibold text-gray-900 mb-4">Recently Scanned QR Codes</h3>
                        <div className="space-y-3">
                          {scannedQRs.slice(0, 5).map((item, index) => (
                            <div key={index} className="bg-gray-50 rounded-lg p-4">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="text-sm text-gray-600 break-words mb-2" data-testid={`history-scanned-text-${index}`}>
                                    <strong>Scanned:</strong> "{item.scannedText.length > 100 ? item.scannedText.substring(0, 100) + '...' : item.scannedText}"
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    {item.timestamp.toLocaleString()}
                                  </div>
                                </div>
                                <div className="ml-4 flex gap-2">
                                  <Button
                                    onClick={() => handleCopyToClipboard(item.scannedText)}
                                    variant="ghost"
                                    size="sm"
                                    data-testid={`button-copy-history-scanned-${index}`}
                                  >
                                    <i className="fas fa-copy"></i>
                                  </Button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Information Sections */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
          {/* What is QR Code Scanner */}
          <div className="mt-12 bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">What is QR Code Scanner?</h2>
            <div className="prose max-w-none">
              <p className="text-lg text-gray-700 mb-6">
                <strong>QR Code Scanner</strong> is a powerful tool that reads QR codes from uploaded images and extracts their text content. It can automatically identify and separate URLs, email addresses, and other formatted text from the scanned data.
              </p>
              
              <p className="text-gray-700 mb-6">
                Simply upload an image containing a QR code, and the scanner will decode it and present the content in an organized, readable format with options to copy individual components.
              </p>
            </div>
          </div>

          {/* Scanner Features */}
          <div className="mt-8 bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Scanner Features</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="p-4 bg-white rounded-lg shadow-sm">
                  <h3 className="font-semibold text-gray-900 mb-2">
                    <i className="fas fa-image mr-2 text-blue-600"></i>
                    Multiple Image Formats
                  </h3>
                  <p className="text-gray-600 text-sm">Supports JPG, PNG, GIF, and WebP image formats</p>
                </div>
                
                <div className="p-4 bg-white rounded-lg shadow-sm">
                  <h3 className="font-semibold text-gray-900 mb-2">
                    <i className="fas fa-search mr-2 text-green-600"></i>
                    Smart Content Detection
                  </h3>
                  <p className="text-gray-600 text-sm">Automatically identifies URLs and email addresses</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="p-4 bg-white rounded-lg shadow-sm">
                  <h3 className="font-semibold text-gray-900 mb-2">
                    <i className="fas fa-history mr-2 text-purple-600"></i>
                    Scan History
                  </h3>
                  <p className="text-gray-600 text-sm">Keep track of recently scanned QR codes</p>
                </div>
                
                <div className="p-4 bg-white rounded-lg shadow-sm">
                  <h3 className="font-semibold text-gray-900 mb-2">
                    <i className="fas fa-copy mr-2 text-orange-600"></i>
                    Easy Copy Functions
                  </h3>
                  <p className="text-gray-600 text-sm">One-click copying of extracted content</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default QRCodeScanner;
