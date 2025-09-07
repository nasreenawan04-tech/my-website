import { useState, useEffect, useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Separator } from '@/components/ui/separator';
import QRCode from 'qrcode';

interface QROptions {
  errorCorrectionLevel: 'L' | 'M' | 'Q' | 'H';
  size: number;
  margin: number;
  darkColor: string;
  lightColor: string;
}

interface GeneratedQR {
  text: string;
  dataUrl: string;
  size: number;
  timestamp: Date;
}

const QRTextGenerator = () => {
  const [inputText, setInputText] = useState('');
  const [generatedQR, setGeneratedQR] = useState<GeneratedQR | null>(null);
  const [qrHistory, setQRHistory] = useState<GeneratedQR[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [options, setOptions] = useState<QROptions>({
    errorCorrectionLevel: 'M',
    size: 300,
    margin: 4,
    darkColor: '#000000',
    lightColor: '#FFFFFF'
  });

  const errorLevels = {
    L: 'Low (~7%)',
    M: 'Medium (~15%)',
    Q: 'Quartile (~25%)',
    H: 'High (~30%)'
  };

  const generateQRCode = async () => {
    if (!inputText.trim()) return;
    
    setIsGenerating(true);
    
    try {
      const canvas = canvasRef.current;
      if (!canvas) return;

      // Generate QR code to canvas
      await QRCode.toCanvas(canvas, inputText, {
        errorCorrectionLevel: options.errorCorrectionLevel,
        width: options.size,
        margin: options.margin,
        color: {
          dark: options.darkColor,
          light: options.lightColor
        }
      });

      // Get data URL from canvas
      const dataUrl = canvas.toDataURL('image/png');
      
      const newQR: GeneratedQR = {
        text: inputText,
        dataUrl,
        size: options.size,
        timestamp: new Date()
      };

      setGeneratedQR(newQR);
      
      // Add to history (keep last 10)
      setQRHistory(prev => {
        const updated = [newQR, ...prev.filter(qr => qr.text !== inputText)];
        return updated.slice(0, 10);
      });
      
    } catch (error) {
      console.error('Error generating QR code:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const updateOption = <K extends keyof QROptions>(key: K, value: QROptions[K]) => {
    setOptions(prev => ({ ...prev, [key]: value }));
  };

  const downloadQRCode = () => {
    if (!generatedQR) return;
    
    const link = document.createElement('a');
    link.href = generatedQR.dataUrl;
    link.download = `qr-code-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCopyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const copyImageToClipboard = async () => {
    if (!generatedQR) return;
    
    try {
      const canvas = canvasRef.current;
      if (!canvas) return;
      
      canvas.toBlob(async (blob) => {
        if (blob) {
          await navigator.clipboard.write([
            new ClipboardItem({ 'image/png': blob })
          ]);
        }
      });
    } catch (error) {
      console.error('Failed to copy image:', error);
    }
  };

  // Generate initial QR code with sample text
  useEffect(() => {
    const sampleText = 'Hello, World!';
    setInputText(sampleText);
  }, []);

  // Auto-generate when text or options change
  useEffect(() => {
    if (inputText.trim()) {
      const timeoutId = setTimeout(() => {
        generateQRCode();
      }, 500);
      
      return () => clearTimeout(timeoutId);
    }
  }, [inputText, options]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Helmet>
        <title>QR Code Text Generator - Create QR Codes from Text | DapsiWow</title>
        <meta name="description" content="Generate QR codes from any text instantly. Customize size, colors, and error correction. Download as PNG or copy to clipboard." />
        <meta name="keywords" content="QR code generator, text to QR, QR code maker, generate QR code, custom QR code" />
        <meta property="og:title" content="QR Code Text Generator - Create QR Codes from Text" />
        <meta property="og:description" content="Generate customizable QR codes from any text with options for size, colors, and error correction levels." />
        <meta property="og:type" content="website" />
        <link rel="canonical" href="/tools/qr-text-generator" />
      </Helmet>
      
      <Header />
      
      <main>
        {/* Hero Section */}
        <section className="gradient-hero text-white py-16 pt-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="w-20 h-20 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <i className="fas fa-qrcode text-3xl"></i>
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold mb-6" data-testid="text-page-title">
              QR Code Text Generator
            </h1>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto">
              Generate custom QR codes from any text with customizable colors, sizes, and error correction
            </p>
          </div>
        </section>

        {/* Generator Section */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <Card className="bg-white shadow-sm border-0">
              <CardContent className="p-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                  {/* Input and Options */}
                  <div className="space-y-8">
                    <h2 className="text-2xl font-semibold text-gray-900 mb-6">Text Input & Options</h2>
                    
                    <div className="space-y-6">
                      {/* Text Input */}
                      <div className="space-y-3">
                        <Label className="text-base font-medium">Text to Convert</Label>
                        <Textarea
                          placeholder="Enter your text, URL, or message here..."
                          value={inputText}
                          onChange={(e) => setInputText(e.target.value)}
                          className="min-h-[120px] resize-none"
                          data-testid="textarea-input-text"
                        />
                        <div className="text-sm text-gray-500">
                          {inputText.length} characters
                        </div>
                      </div>

                      {/* Size Setting */}
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <Label className="text-base font-medium">QR Code Size</Label>
                          <span className="text-lg font-bold text-blue-600">{options.size}px</span>
                        </div>
                        <div className="px-2">
                          <Slider
                            value={[options.size]}
                            onValueChange={(value) => updateOption('size', value[0])}
                            max={500}
                            min={100}
                            step={50}
                            className="w-full"
                            data-testid="slider-size"
                          />
                          <div className="flex justify-between text-sm text-gray-500 mt-1">
                            <span>100px</span>
                            <span>500px</span>
                          </div>
                        </div>
                      </div>

                      {/* Error Correction Level */}
                      <div className="space-y-3">
                        <Label className="text-base font-medium">Error Correction Level</Label>
                        <Select 
                          value={options.errorCorrectionLevel} 
                          onValueChange={(value: typeof options.errorCorrectionLevel) => updateOption('errorCorrectionLevel', value)}
                        >
                          <SelectTrigger data-testid="select-error-level">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(errorLevels).map(([key, label]) => (
                              <SelectItem key={key} value={key}>{label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <div className="text-sm text-gray-500">
                          Higher levels can recover more data if damaged but create denser codes
                        </div>
                      </div>

                      {/* Margin Setting */}
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <Label className="text-base font-medium">Margin</Label>
                          <span className="text-lg font-bold text-blue-600">{options.margin}</span>
                        </div>
                        <div className="px-2">
                          <Slider
                            value={[options.margin]}
                            onValueChange={(value) => updateOption('margin', value[0])}
                            max={10}
                            min={0}
                            step={1}
                            className="w-full"
                            data-testid="slider-margin"
                          />
                          <div className="flex justify-between text-sm text-gray-500 mt-1">
                            <span>0</span>
                            <span>10</span>
                          </div>
                        </div>
                      </div>

                      {/* Color Options */}
                      <div className="space-y-4">
                        <h3 className="font-medium text-gray-900">Colors</h3>
                        
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
                              <input
                                type="text"
                                value={options.darkColor}
                                onChange={(e) => updateOption('darkColor', e.target.value)}
                                className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm font-mono"
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
                              <input
                                type="text"
                                value={options.lightColor}
                                onChange={(e) => updateOption('lightColor', e.target.value)}
                                className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm font-mono"
                                data-testid="input-light-color-text"
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Generate Button */}
                      <Button 
                        onClick={generateQRCode}
                        disabled={!inputText.trim() || isGenerating}
                        className="w-full h-12 text-base"
                        data-testid="button-generate-qr"
                      >
                        {isGenerating ? (
                          <>
                            <i className="fas fa-spinner fa-spin mr-2"></i>
                            Generating...
                          </>
                        ) : (
                          <>
                            <i className="fas fa-qrcode mr-2"></i>
                            Generate QR Code
                          </>
                        )}
                      </Button>
                    </div>
                  </div>

                  {/* Generated QR Code Display */}
                  <div className="space-y-6">
                    <h2 className="text-2xl font-semibold text-gray-900 mb-6">Generated QR Code</h2>
                    
                    <div className="space-y-6" data-testid="generated-qr-display">
                      {/* QR Code Display */}
                      <div className="bg-gray-50 rounded-lg p-6 text-center">
                        <canvas 
                          ref={canvasRef}
                          className="mx-auto border border-gray-200 rounded-lg bg-white"
                          data-testid="qr-canvas"
                        />
                        {!generatedQR && (
                          <div className="text-gray-400 py-12">
                            <i className="fas fa-qrcode text-4xl mb-4"></i>
                            <p>Enter text above to generate QR code</p>
                          </div>
                        )}
                      </div>

                      {generatedQR && (
                        <>
                          {/* QR Code Details */}
                          <div className="space-y-4">
                            <div className="p-3 bg-gray-50 rounded-lg">
                              <div className="font-medium text-gray-900 mb-2">Text Content</div>
                              <div className="text-gray-600 break-words" data-testid="qr-text-content">
                                {generatedQR.text}
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                              <div className="p-3 bg-gray-50 rounded-lg">
                                <div className="font-medium text-gray-900">Size</div>
                                <div className="text-gray-600" data-testid="qr-size">
                                  {generatedQR.size}×{generatedQR.size}px
                                </div>
                              </div>

                              <div className="p-3 bg-gray-50 rounded-lg">
                                <div className="font-medium text-gray-900">Error Level</div>
                                <div className="text-gray-600" data-testid="qr-error-level">
                                  {errorLevels[options.errorCorrectionLevel]}
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <Button
                              onClick={downloadQRCode}
                              variant="outline"
                              className="flex-1"
                              data-testid="button-download-qr"
                            >
                              <i className="fas fa-download mr-2"></i>
                              Download PNG
                            </Button>

                            <Button
                              onClick={copyImageToClipboard}
                              variant="outline"
                              className="flex-1"
                              data-testid="button-copy-image"
                            >
                              <i className="fas fa-copy mr-2"></i>
                              Copy Image
                            </Button>
                          </div>

                          <Button
                            onClick={() => handleCopyToClipboard(generatedQR.text)}
                            variant="ghost"
                            className="w-full"
                            data-testid="button-copy-text"
                          >
                            <i className="fas fa-copy mr-2"></i>
                            Copy Text Content
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* QR History */}
                {qrHistory.length > 0 && (
                  <>
                    <Separator className="my-8" />
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-4">Recently Generated</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {qrHistory.slice(0, 6).map((qr, index) => (
                          <div key={index} className="bg-gray-50 rounded-lg p-4">
                            <div className="aspect-square mb-3 bg-white rounded-lg p-2 flex items-center justify-center border border-gray-200">
                              <img 
                                src={qr.dataUrl} 
                                alt="QR Code" 
                                className="max-w-full max-h-full"
                                data-testid={`history-qr-${index}`}
                              />
                            </div>
                            <div className="space-y-2">
                              <div className="text-sm text-gray-600 truncate" data-testid={`history-text-${index}`}>
                                {qr.text}
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-xs text-gray-400">
                                  {qr.size}px
                                </span>
                                <Button
                                  onClick={() => {
                                    const link = document.createElement('a');
                                    link.href = qr.dataUrl;
                                    link.download = `qr-code-${Date.now()}.png`;
                                    link.click();
                                  }}
                                  variant="ghost"
                                  size="sm"
                                  data-testid={`button-download-history-${index}`}
                                >
                                  <i className="fas fa-download"></i>
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Information Sections */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
          {/* What is a QR Code Generator */}
          <div className="mt-12 bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">What is a QR Code Text Generator?</h2>
            <div className="prose max-w-none">
              <p className="text-lg text-gray-700 mb-6">
                A <strong>QR code text generator</strong> is a tool that converts any text, URL, or message into a scannable QR (Quick Response) code. These square-shaped codes can be scanned by smartphones and other devices to instantly access the encoded information.
              </p>
              
              <p className="text-gray-700 mb-6">
                Our generator allows you to customize the appearance, size, error correction level, and colors of your QR codes, making them perfect for business cards, marketing materials, websites, and more.
              </p>
            </div>
          </div>

          {/* Error Correction Levels */}
          <div className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Error Correction Levels</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <span className="text-green-600 font-bold">L</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Low (~7%)</h3>
                <p className="text-gray-600 text-sm">Basic error recovery. Best for clean environments.</p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <span className="text-blue-600 font-bold">M</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Medium (~15%)</h3>
                <p className="text-gray-600 text-sm">Standard level. Good balance for most uses.</p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <span className="text-orange-600 font-bold">Q</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Quartile (~25%)</h3>
                <p className="text-gray-600 text-sm">High recovery. Good for industrial use.</p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <span className="text-red-600 font-bold">H</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">High (~30%)</h3>
                <p className="text-gray-600 text-sm">Maximum recovery. Best for harsh conditions.</p>
              </div>
            </div>
          </div>

          {/* Use Cases */}
          <div className="mt-8 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Perfect For</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <i className="fas fa-globe text-green-600 text-xl"></i>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Website URLs</h3>
                <p className="text-gray-600 text-sm">Share website links quickly and easily.</p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <i className="fas fa-id-card text-blue-600 text-xl"></i>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Contact Information</h3>
                <p className="text-gray-600 text-sm">Business cards and contact details.</p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <i className="fas fa-wifi text-purple-600 text-xl"></i>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">WiFi Passwords</h3>
                <p className="text-gray-600 text-sm">Easy WiFi sharing for guests.</p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <i className="fas fa-calendar text-orange-600 text-xl"></i>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Event Details</h3>
                <p className="text-gray-600 text-sm">Event information and registration.</p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <i className="fas fa-shopping-cart text-red-600 text-xl"></i>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Product Info</h3>
                <p className="text-gray-600 text-sm">Product details and specifications.</p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <i className="fas fa-comment text-indigo-600 text-xl"></i>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Messages</h3>
                <p className="text-gray-600 text-sm">Text messages and announcements.</p>
              </div>
            </div>
          </div>

          {/* FAQ */}
          <div className="mt-8 bg-gradient-to-r from-gray-50 to-blue-50 rounded-2xl p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Frequently Asked Questions</h2>
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">What's the maximum text length for a QR code?</h3>
                <p className="text-gray-600">QR codes can hold up to 4,296 alphanumeric characters, but practical scanning becomes difficult with very long text. For best results, keep text under 1,000 characters.</p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Which error correction level should I choose?</h3>
                <p className="text-gray-600">Medium (M) is recommended for most uses. Use Low (L) for clean environments, High (H) for outdoor or industrial applications where the code might get damaged.</p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Can I customize the colors of my QR code?</h3>
                <p className="text-gray-600">Yes! You can customize both foreground and background colors. Ensure good contrast between colors for reliable scanning - dark foreground on light background works best.</p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">What file formats are supported for download?</h3>
                <p className="text-gray-600">Generated QR codes can be downloaded as PNG images. This format provides high quality and transparency support, making it perfect for various applications.</p>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default QRTextGenerator;