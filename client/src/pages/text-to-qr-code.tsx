
import { useState, useEffect, useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import QRCode from 'qrcode';

interface QROptions {
  size: number;
  margin: number;
  darkColor: string;
  lightColor: string;
  extractUrls: boolean;
  extractEmails: boolean;
  formatText: boolean;
  removeEmptyLines: boolean;
}

interface ExtractedQR {
  originalText: string;
  extractedContent: string[];
  dataUrl: string;
  timestamp: Date;
}

const TextToQRCode = () => {
  const [inputText, setInputText] = useState('');
  const [extractedText, setExtractedText] = useState('');
  const [generatedQRs, setGeneratedQRs] = useState<ExtractedQR[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedQR, setSelectedQR] = useState<ExtractedQR | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [options, setOptions] = useState<QROptions>({
    size: 300,
    margin: 4,
    darkColor: '#000000',
    lightColor: '#FFFFFF',
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

  const generateQRCodes = async () => {
    if (!inputText.trim()) return;
    
    setIsGenerating(true);
    
    try {
      const extractedContent = extractTextContent(inputText);
      const newQRs: ExtractedQR[] = [];

      for (const content of extractedContent) {
        const canvas = document.createElement('canvas');
        
        // Generate QR code to canvas
        await QRCode.toCanvas(canvas, content, {
          errorCorrectionLevel: 'M',
          width: options.size,
          margin: options.margin,
          color: {
            dark: options.darkColor,
            light: options.lightColor
          }
        });

        // Get data URL from canvas
        const dataUrl = canvas.toDataURL('image/png');
        
        newQRs.push({
          originalText: inputText,
          extractedContent: [content],
          dataUrl,
          timestamp: new Date()
        });
      }

      setGeneratedQRs(newQRs);
      setSelectedQR(newQRs[0] || null);
      setExtractedText(extractedContent.join('\n\n'));
      
    } catch (error) {
      console.error('Error generating QR codes:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const updateOption = <K extends keyof QROptions>(key: K, value: QROptions[K]) => {
    setOptions(prev => ({ ...prev, [key]: value }));
  };

  const downloadQRCode = (qr: ExtractedQR) => {
    const link = document.createElement('a');
    link.href = qr.dataUrl;
    link.download = `extracted-qr-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCopyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const copyImageToClipboard = async (qr: ExtractedQR) => {
    try {
      const response = await fetch(qr.dataUrl);
      const blob = await response.blob();
      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': blob })
      ]);
    } catch (error) {
      console.error('Failed to copy image:', error);
    }
  };

  const handleSampleText = () => {
    const sample = `Visit our website at https://example.com for more information.
    
Contact us at info@example.com or support@company.org

Check out these links:
- www.google.com
- facebook.com/yourpage
- twitter.com/handle

Phone: +1-555-123-4567
Email: contact@business.net

Additional text content that will be converted to QR code format.`;
    setInputText(sample);
  };

  const handleClear = () => {
    setInputText('');
    setExtractedText('');
    setGeneratedQRs([]);
    setSelectedQR(null);
  };

  // Auto-generate when text or extraction options change
  useEffect(() => {
    if (inputText.trim()) {
      const timeoutId = setTimeout(() => {
        generateQRCodes();
      }, 500);
      
      return () => clearTimeout(timeoutId);
    }
  }, [inputText, options.extractUrls, options.extractEmails, options.formatText, options.removeEmptyLines]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Helmet>
        <title>Text to QR Code - Convert Text Content to QR Codes | DapsiWow</title>
        <meta name="description" content="Extract and convert text content, URLs, and email addresses to QR codes. Smart text processing with customizable QR code generation." />
        <meta name="keywords" content="text to QR code, extract text QR, URL to QR, email to QR, text extraction, QR code generator" />
        <meta property="og:title" content="Text to QR Code - Convert Text Content to QR Codes" />
        <meta property="og:description" content="Extract URLs, emails, and text content and convert them to scannable QR codes with smart text processing." />
        <meta property="og:type" content="website" />
        <link rel="canonical" href="/tools/text-to-qr-code" />
      </Helmet>
      
      <Header />
      
      <main>
        {/* Hero Section */}
        <section className="gradient-hero text-white py-16 pt-24">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="w-20 h-20 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <i className="fas fa-arrow-right text-3xl"></i>
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold mb-6" data-testid="text-page-title">
              Text to QR Code
            </h1>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto">
              Extract URLs, emails, and text content and convert them to scannable QR codes
            </p>
          </div>
        </section>

        {/* Main Tool Section */}
        <section className="py-16">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <Card className="bg-white shadow-sm border-0">
              <CardContent className="p-8">
                <div className="space-y-8">
                  {/* Input Section */}
                  <div>
                    <h2 className="text-2xl font-semibold text-gray-900 mb-6">Input Text for Extraction</h2>
                    
                    {/* Text Area */}
                    <div className="space-y-4">
                      <Label htmlFor="text-input" className="text-sm font-medium text-gray-700">
                        Text Content
                      </Label>
                      <Textarea
                        id="text-input"
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        className="w-full h-48 p-4 text-base border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                        placeholder="Paste your text containing URLs, emails, or any content you want to convert to QR codes..."
                        data-testid="textarea-text-input"
                      />
                      <div className="text-sm text-gray-500">
                        {inputText.length} characters
                      </div>
                    </div>

                    {/* Extraction Options */}
                    <div className="mt-6 space-y-4">
                      <h3 className="text-lg font-semibold text-gray-900">Extraction Options</h3>
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

                    {/* QR Code Options */}
                    <div className="mt-6 space-y-4">
                      <h3 className="text-lg font-semibold text-gray-900">QR Code Options</h3>
                      
                      {/* Size Setting */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <Label className="text-sm font-medium">QR Code Size</Label>
                          <span className="text-lg font-bold text-blue-600">{options.size}px</span>
                        </div>
                        <Slider
                          value={[options.size]}
                          onValueChange={(value) => updateOption('size', value[0])}
                          max={400}
                          min={150}
                          step={50}
                          className="w-full"
                          data-testid="slider-size"
                        />
                        <div className="flex justify-between text-sm text-gray-500">
                          <span>150px</span>
                          <span>400px</span>
                        </div>
                      </div>

                      {/* Color Options */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-sm font-medium">Foreground Color</Label>
                          <div className="flex items-center gap-2">
                            <input
                              type="color"
                              value={options.darkColor}
                              onChange={(e) => updateOption('darkColor', e.target.value)}
                              className="w-12 h-10 rounded border border-gray-300"
                              data-testid="input-dark-color"
                            />
                            <Input
                              type="text"
                              value={options.darkColor}
                              onChange={(e) => updateOption('darkColor', e.target.value)}
                              className="flex-1 text-sm font-mono"
                              data-testid="input-dark-color-text"
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label className="text-sm font-medium">Background Color</Label>
                          <div className="flex items-center gap-2">
                            <input
                              type="color"
                              value={options.lightColor}
                              onChange={(e) => updateOption('lightColor', e.target.value)}
                              className="w-12 h-10 rounded border border-gray-300"
                              data-testid="input-light-color"
                            />
                            <Input
                              type="text"
                              value={options.lightColor}
                              onChange={(e) => updateOption('lightColor', e.target.value)}
                              className="flex-1 text-sm font-mono"
                              data-testid="input-light-color-text"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-4 mt-6">
                      <Button
                        onClick={handleClear}
                        variant="outline"
                        className="flex-1"
                        data-testid="button-clear-text"
                      >
                        <i className="fas fa-trash mr-2"></i>
                        Clear Text
                      </Button>
                      <Button
                        onClick={handleSampleText}
                        variant="outline"
                        className="flex-1"
                        data-testid="button-sample-text"
                      >
                        <i className="fas fa-file-text mr-2"></i>
                        Sample Text
                      </Button>
                      <Button
                        onClick={generateQRCodes}
                        disabled={!inputText.trim() || isGenerating}
                        className="flex-1"
                        data-testid="button-generate-qr"
                      >
                        {isGenerating ? (
                          <>
                            <i className="fas fa-spinner fa-spin mr-2"></i>
                            Extracting...
                          </>
                        ) : (
                          <>
                            <i className="fas fa-magic mr-2"></i>
                            Extract & Generate
                          </>
                        )}
                      </Button>
                    </div>
                  </div>

                  {/* Results Section */}
                  {extractedText && (
                    <div>
                      <h2 className="text-2xl font-semibold text-gray-900 mb-6">Extracted Content</h2>
                      
                      <div className="space-y-6" data-testid="extracted-content">
                        {/* Extracted Text Preview */}
                        <div className="bg-gray-50 rounded-lg p-4">
                          <h3 className="font-semibold text-gray-900 mb-3">Extracted Text Content</h3>
                          <div className="bg-white p-3 rounded border border-gray-200 text-sm font-mono whitespace-pre-wrap max-h-48 overflow-y-auto">
                            {extractedText}
                          </div>
                          <Button
                            onClick={() => handleCopyToClipboard(extractedText)}
                            variant="ghost"
                            size="sm"
                            className="mt-2"
                            data-testid="button-copy-extracted-text"
                          >
                            <i className="fas fa-copy mr-1"></i>
                            Copy Extracted Text
                          </Button>
                        </div>

                        {/* Generated QR Codes */}
                        <div>
                          <h3 className="font-semibold text-gray-900 mb-4">Generated QR Codes ({generatedQRs.length})</h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {generatedQRs.map((qr, index) => (
                              <div key={index} className="bg-white rounded-lg border border-gray-200 p-4">
                                <div className="aspect-square mb-4 bg-gray-50 rounded-lg p-4 flex items-center justify-center">
                                  <img 
                                    src={qr.dataUrl} 
                                    alt={`QR Code ${index + 1}`}
                                    className="max-w-full max-h-full"
                                    data-testid={`qr-image-${index}`}
                                  />
                                </div>
                                
                                <div className="space-y-3">
                                  <div className="text-sm text-gray-600 break-words">
                                    <strong>Content:</strong> {qr.extractedContent[0]}
                                  </div>
                                  
                                  <div className="flex gap-2">
                                    <Button
                                      onClick={() => downloadQRCode(qr)}
                                      variant="outline"
                                      size="sm"
                                      className="flex-1"
                                      data-testid={`button-download-${index}`}
                                    >
                                      <i className="fas fa-download mr-1"></i>
                                      Download
                                    </Button>
                                    <Button
                                      onClick={() => copyImageToClipboard(qr)}
                                      variant="outline"
                                      size="sm"
                                      className="flex-1"
                                      data-testid={`button-copy-image-${index}`}
                                    >
                                      <i className="fas fa-copy mr-1"></i>
                                      Copy
                                    </Button>
                                  </div>
                                  
                                  <Button
                                    onClick={() => handleCopyToClipboard(qr.extractedContent[0])}
                                    variant="ghost"
                                    size="sm"
                                    className="w-full"
                                    data-testid={`button-copy-content-${index}`}
                                  >
                                    <i className="fas fa-copy mr-1"></i>
                                    Copy Content
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {!extractedText && !isGenerating && (
                    <div className="text-center py-12 text-gray-500">
                      <i className="fas fa-magic text-4xl mb-4"></i>
                      <p className="text-lg">Enter text above to extract content and generate QR codes</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Information Sections */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
          {/* What is Text to QR Code Extraction */}
          <div className="mt-12 bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">What is Text to QR Code Extraction?</h2>
            <div className="prose max-w-none">
              <p className="text-lg text-gray-700 mb-6">
                <strong>Text to QR Code extraction</strong> is an intelligent tool that automatically identifies and extracts specific content from text (such as URLs, email addresses, and formatted text) and converts each piece of content into individual, scannable QR codes.
              </p>
              
              <p className="text-gray-700 mb-6">
                Unlike simple text-to-QR converters, this tool intelligently parses your input to identify different types of content and creates optimized QR codes for each element, making it perfect for processing documents, emails, business cards, or any text containing multiple actionable items.
              </p>
            </div>
          </div>

          {/* Extraction Features */}
          <div className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Smart Extraction Features</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="p-4 bg-white rounded-lg shadow-sm">
                  <h3 className="font-semibold text-gray-900 mb-2">
                    <i className="fas fa-link mr-2 text-blue-600"></i>
                    URL Detection
                  </h3>
                  <p className="text-gray-600 text-sm">Automatically finds and extracts website URLs, including those without protocols</p>
                </div>
                
                <div className="p-4 bg-white rounded-lg shadow-sm">
                  <h3 className="font-semibold text-gray-900 mb-2">
                    <i className="fas fa-envelope mr-2 text-green-600"></i>
                    Email Extraction
                  </h3>
                  <p className="text-gray-600 text-sm">Identifies and extracts email addresses from any text content</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="p-4 bg-white rounded-lg shadow-sm">
                  <h3 className="font-semibold text-gray-900 mb-2">
                    <i className="fas fa-format-text mr-2 text-purple-600"></i>
                    Text Formatting
                  </h3>
                  <p className="text-gray-600 text-sm">Cleans up text formatting and removes unnecessary whitespace</p>
                </div>
                
                <div className="p-4 bg-white rounded-lg shadow-sm">
                  <h3 className="font-semibold text-gray-900 mb-2">
                    <i className="fas fa-palette mr-2 text-orange-600"></i>
                    Custom QR Styling
                  </h3>
                  <p className="text-gray-600 text-sm">Customize colors and sizes for all generated QR codes</p>
                </div>
              </div>
            </div>
          </div>

          {/* Use Cases */}
          <div className="mt-8 bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Perfect Use Cases</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <i className="fas fa-id-card text-blue-600 text-xl"></i>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Business Cards</h3>
                <p className="text-gray-600 text-sm">Extract contact info and create individual QR codes for each detail.</p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <i className="fas fa-file-alt text-green-600 text-xl"></i>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Documents</h3>
                <p className="text-gray-600 text-sm">Process documents to extract URLs and contact information.</p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <i className="fas fa-envelope text-purple-600 text-xl"></i>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Email Content</h3>
                <p className="text-gray-600 text-sm">Extract links and addresses from email content for easy sharing.</p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <i className="fas fa-bullhorn text-orange-600 text-xl"></i>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Marketing</h3>
                <p className="text-gray-600 text-sm">Create QR codes for multiple links and social media profiles.</p>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default TextToQRCode;
