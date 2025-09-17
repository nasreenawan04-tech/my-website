
import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import QRCode from 'qrcode';

interface QROptions {
  size: number;
  margin: number;
  darkColor: string;
  lightColor: string;
  errorCorrectionLevel: 'L' | 'M' | 'Q' | 'H';
  extractUrls: boolean;
  extractEmails: boolean;
  formatText: boolean;
  removeEmptyLines: boolean;
  addPrefix: string;
  addSuffix: string;
}

interface QRResult {
  originalText: string;
  processedText: string;
  dataUrl: string;
  type: 'text' | 'url' | 'email';
  charCount: number;
  byteCount: number;
  timestamp: Date;
}

const TextToQRCode = () => {
  const [inputText, setInputText] = useState('');
  const [qrResults, setQRResults] = useState<QRResult[]>([]);
  const [qrHistory, setQRHistory] = useState<QRResult[]>([]);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [options, setOptions] = useState<QROptions>({
    size: 300,
    margin: 4,
    darkColor: '#000000',
    lightColor: '#FFFFFF',
    errorCorrectionLevel: 'M',
    extractUrls: true,
    extractEmails: true,
    formatText: true,
    removeEmptyLines: true,
    addPrefix: '',
    addSuffix: ''
  });

  const extractContentFromText = (text: string): { content: string; type: 'text' | 'url' | 'email' }[] => {
    if (!text.trim()) return [];

    let processed = text;
    const extracted: { content: string; type: 'text' | 'url' | 'email' }[] = [];

    // Remove empty lines if enabled
    if (options.removeEmptyLines) {
      processed = processed.split('\n').filter(line => line.trim() !== '').join('\n');
    }

    // Format text if enabled
    if (options.formatText) {
      processed = processed.replace(/\s+/g, ' ').trim();
    }

    // Extract URLs if enabled
    if (options.extractUrls) {
      const urlRegex = /(https?:\/\/[^\s]+|www\.[^\s]+|[^\s]+\.[a-z]{2,}(?:\/[^\s]*)?)/gi;
      const urls = processed.match(urlRegex);
      if (urls) {
        urls.forEach(url => {
          const formattedUrl = url.startsWith('http') ? url : `https://${url}`;
          extracted.push({ content: formattedUrl, type: 'url' });
        });
      }
    }

    // Extract email addresses if enabled
    if (options.extractEmails) {
      const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
      const emails = processed.match(emailRegex);
      if (emails) {
        emails.forEach(email => {
          extracted.push({ content: email, type: 'email' });
        });
      }
    }

    // If no specific content extracted, use the processed text
    if (extracted.length === 0) {
      extracted.push({ content: processed, type: 'text' });
    }

    return extracted.filter((item, index, arr) => 
      arr.findIndex(other => other.content === item.content) === index
    );
  };

  const generateQRCodes = async () => {
    if (!inputText.trim()) {
      setQRResults([]);
      return;
    }

    setIsGenerating(true);

    try {
      const extractedContent = extractContentFromText(inputText);
      const newQRResults: QRResult[] = [];

      for (const item of extractedContent) {
        let processedContent = item.content;
        
        // Apply prefix and suffix if provided
        if (options.addPrefix || options.addSuffix) {
          processedContent = `${options.addPrefix}${processedContent}${options.addSuffix}`;
        }

        // Generate QR code
        const dataUrl = await QRCode.toDataURL(processedContent, {
          errorCorrectionLevel: options.errorCorrectionLevel,
          width: options.size,
          margin: options.margin,
          color: {
            dark: options.darkColor,
            light: options.lightColor
          }
        });

        const result: QRResult = {
          originalText: inputText,
          processedText: processedContent,
          dataUrl,
          type: item.type,
          charCount: processedContent.length,
          byteCount: new Blob([processedContent]).size,
          timestamp: new Date()
        };

        newQRResults.push(result);
      }

      setQRResults(newQRResults);

      // Add to history (keep last 10)
      setQRHistory(prev => {
        const updated = [...newQRResults, ...prev.filter(item => item.originalText !== inputText)];
        return updated.slice(0, 10);
      });
    } catch (error) {
      console.error('Error generating QR codes:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const updateOption = <K extends keyof QROptions>(key: K, value: QROptions[K]) => {
    setOptions(prev => ({ ...prev, [key]: value }));
  };

  const handleCopyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const downloadQRCode = (qr: QRResult, index: number) => {
    const link = document.createElement('a');
    link.href = qr.dataUrl;
    link.download = `qr-code-${qr.type}-${index + 1}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const copyImageToClipboard = async (qr: QRResult) => {
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

  const handleClear = () => {
    setInputText('');
    setQRResults([]);
  };

  const handleSampleText = () => {
    setInputText('Visit our website at https://dapsiwow.com for amazing tools.\n\nContact us at info@dapsiwow.com or support@example.org\n\nCheck out these links:\n- www.google.com\n- facebook.com/yourpage\n- twitter.com/handle\n\nThis is additional text that will be converted to QR code format for easy sharing and scanning.');
  };

  const resetConverter = () => {
    setInputText('');
    setQRResults([]);
    setShowAdvanced(false);
    setOptions({
      size: 300,
      margin: 4,
      darkColor: '#000000',
      lightColor: '#FFFFFF',
      errorCorrectionLevel: 'M',
      extractUrls: true,
      extractEmails: true,
      formatText: true,
      removeEmptyLines: true,
      addPrefix: '',
      addSuffix: ''
    });
  };

  // Auto-generate when text or options change
  useEffect(() => {
    if (inputText.trim()) {
      const timeoutId = setTimeout(() => {
        generateQRCodes();
      }, 300);
      
      return () => clearTimeout(timeoutId);
    } else {
      setQRResults([]);
    }
  }, [inputText, options]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Helmet>
        <title>Text to QR Code Converter - Generate QR Codes from Text | DapsiWow</title>
        <meta name="description" content="Free text to QR code generator. Convert text, URLs, and email addresses to scannable QR codes instantly. Smart content extraction with customizable QR code options for business, marketing, and personal use." />
        <meta name="keywords" content="text to QR code generator, QR code maker, text to QR converter, URL to QR code, email to QR code, QR code creator, online QR generator, business QR codes, marketing tools, contact QR codes" />
        <meta property="og:title" content="Text to QR Code Converter - Generate QR Codes from Text | DapsiWow" />
        <meta property="og:description" content="Free online text to QR code generator. Convert any text, URL, or email to scannable QR codes with smart content extraction and customizable styling options." />
        <meta property="og:type" content="website" />
        <meta name="robots" content="index, follow" />
        <meta name="author" content="DapsiWow" />
        <link rel="canonical" href="https://dapsiwow.com/tools/text-to-qr-code" />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            "name": "Text to QR Code Converter",
            "description": "Professional text to QR code generator with smart content extraction for converting text, URLs, and email addresses into scannable QR codes with customizable styling options.",
            "url": "https://dapsiwow.com/tools/text-to-qr-code",
            "applicationCategory": "UtilityApplication",
            "operatingSystem": "Any",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "USD"
            },
            "featureList": [
              "Smart content extraction",
              "URL and email detection",
              "Customizable QR code styling",
              "Multiple error correction levels",
              "Real-time QR generation"
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
                <span className="text-xs sm:text-sm font-medium text-blue-700">Professional QR Generator</span>
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-slate-900 leading-tight" data-testid="text-page-title">
                Text to QR Code
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                  Converter
                </span>
              </h1>
              <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-slate-600 max-w-4xl mx-auto leading-relaxed px-2">
                Generate scannable QR codes from text, URLs, and email addresses with smart content extraction
              </p>
            </div>
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
          {/* Main Converter Card */}
          <Card className="bg-white/90 backdrop-blur-sm shadow-2xl border-0 rounded-2xl sm:rounded-3xl overflow-hidden">
            <CardContent className="p-0">
              <div className="flex flex-col">
                {/* Input Section */}
                <div className="p-4 sm:p-6 md:p-8 lg:p-10 xl:p-12 space-y-6 sm:space-y-8">
                  <div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">QR Code Generator</h2>
                    <p className="text-gray-600">Enter your text to generate scannable QR codes</p>
                  </div>

                  <div className="space-y-4 sm:space-y-6">
                    {/* Text Input */}
                    <div className="space-y-3">
                      <Label htmlFor="text-input" className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                        Text to Convert
                      </Label>
                      <Textarea
                        id="text-input"
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        className="min-h-[100px] sm:min-h-[120px] lg:min-h-[140px] text-base sm:text-lg border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-blue-500 resize-none"
                        placeholder="Type or paste your text, URLs, or email addresses here to generate QR codes..."
                        data-testid="textarea-text-input"
                      />
                    </div>

                    {/* QR Code Size */}
                    <div className="space-y-3">
                      <Label htmlFor="size-select" className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                        QR Code Size
                      </Label>
                      <Select
                        value={options.size.toString()}
                        onValueChange={(value) => updateOption('size', parseInt(value))}
                      >
                        <SelectTrigger className="h-12 sm:h-14 border-2 border-gray-200 rounded-xl text-base sm:text-lg" data-testid="select-size">
                          <SelectValue placeholder="Select size" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="200">Small (200px)</SelectItem>
                          <SelectItem value="300">Medium (300px)</SelectItem>
                          <SelectItem value="400">Large (400px)</SelectItem>
                          <SelectItem value="500">Extra Large (500px)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Error Correction Level */}
                    <div className="space-y-3">
                      <Label htmlFor="error-correction-select" className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                        Error Correction Level
                      </Label>
                      <Select
                        value={options.errorCorrectionLevel}
                        onValueChange={(value: 'L' | 'M' | 'Q' | 'H') => 
                          updateOption('errorCorrectionLevel', value)
                        }
                      >
                        <SelectTrigger className="h-12 sm:h-14 border-2 border-gray-200 rounded-xl text-base sm:text-lg" data-testid="select-error-correction">
                          <SelectValue placeholder="Select error correction" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="L">Low (~7%)</SelectItem>
                          <SelectItem value="M">Medium (~15%)</SelectItem>
                          <SelectItem value="Q">Quartile (~25%)</SelectItem>
                          <SelectItem value="H">High (~30%)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Advanced Options */}
                  <div className="space-y-4 sm:space-y-6 border-t pt-6 sm:pt-8">
                    <h3 className="text-lg sm:text-xl font-bold text-gray-900">Advanced Options</h3>
                    
                    <Collapsible open={showAdvanced} onOpenChange={setShowAdvanced}>
                      <CollapsibleTrigger asChild>
                        <Button 
                          variant="ghost" 
                          className="w-full justify-between text-sm sm:text-base py-3 sm:py-4 h-auto"
                          data-testid="button-toggle-advanced"
                        >
                          <span className="flex items-center">
                            Advanced Customization
                          </span>
                          <span className={`transform transition-transform ${showAdvanced ? 'rotate-180' : ''}`}>▼</span>
                        </Button>
                      </CollapsibleTrigger>
                      <CollapsibleContent className="space-y-4 sm:space-y-6 mt-4">
                        <Separator />
                        
                        {/* Content Extraction Options */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                          <div className="space-y-4 bg-gray-50 rounded-xl p-4 sm:p-6">
                            <h4 className="text-sm sm:text-base font-semibold text-gray-900">Content Extraction</h4>
                            
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
                                <p className="text-xs text-gray-500">Automatically detect and extract email addresses</p>
                              </div>
                              <Switch
                                checked={options.extractEmails}
                                onCheckedChange={(value) => updateOption('extractEmails', value)}
                                data-testid="switch-extract-emails"
                              />
                            </div>

                            <div className="flex items-center justify-between gap-2">
                              <div className="space-y-1 flex-1 min-w-0">
                                <Label className="text-xs sm:text-sm font-medium">Format Text</Label>
                                <p className="text-xs text-gray-500">Clean up text formatting and spacing</p>
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
                                <p className="text-xs text-gray-500">Remove blank lines from text content</p>
                              </div>
                              <Switch
                                checked={options.removeEmptyLines}
                                onCheckedChange={(value) => updateOption('removeEmptyLines', value)}
                                data-testid="switch-remove-empty-lines"
                              />
                            </div>
                          </div>

                          {/* QR Code Customization Options */}
                          <div className="space-y-4 bg-gray-50 rounded-xl p-4 sm:p-6">
                            <h4 className="text-sm sm:text-base font-semibold text-gray-900">QR Code Styling</h4>
                            
                            <div className="space-y-2">
                              <Label className="text-xs sm:text-sm font-medium">Foreground Color</Label>
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
                                  className="flex-1 text-sm font-mono h-10 sm:h-12 border-2 border-gray-200 rounded-lg"
                                  data-testid="input-dark-color-text"
                                />
                              </div>
                            </div>

                            <div className="space-y-2">
                              <Label className="text-xs sm:text-sm font-medium">Background Color</Label>
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
                                  className="flex-1 text-sm font-mono h-10 sm:h-12 border-2 border-gray-200 rounded-lg"
                                  data-testid="input-light-color-text"
                                />
                              </div>
                            </div>

                            <div className="space-y-2">
                              <Label className="text-xs sm:text-sm font-medium">Add Prefix</Label>
                              <Input
                                value={options.addPrefix}
                                onChange={(e) => updateOption('addPrefix', e.target.value)}
                                placeholder="e.g., Visit: , Contact: "
                                className="text-sm h-10 sm:h-12 border-2 border-gray-200 rounded-lg"
                                data-testid="input-add-prefix"
                              />
                              <p className="text-xs text-gray-500">Text to add before QR content</p>
                            </div>

                            <div className="space-y-2">
                              <Label className="text-xs sm:text-sm font-medium">Add Suffix</Label>
                              <Input
                                value={options.addSuffix}
                                onChange={(e) => updateOption('addSuffix', e.target.value)}
                                placeholder="e.g., - DapsiWow, ?ref=qr"
                                className="text-sm h-10 sm:h-12 border-2 border-gray-200 rounded-lg"
                                data-testid="input-add-suffix"
                              />
                              <p className="text-xs text-gray-500">Text to add after QR content</p>
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
                      onClick={generateQRCodes}
                      disabled={!inputText.trim() || isGenerating}
                      className="flex-1 h-12 sm:h-14 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold text-base sm:text-lg rounded-xl shadow-lg transform transition-all duration-200 hover:scale-105"
                      data-testid="button-generate"
                    >
                      {isGenerating ? 'Generating...' : 'Generate QR Codes'}
                    </Button>
                    <Button
                      onClick={handleSampleText}
                      variant="outline"
                      className="h-12 sm:h-14 px-6 sm:px-8 border-2 border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold text-base sm:text-lg rounded-xl"
                      data-testid="button-sample-text"
                    >
                      Sample
                    </Button>
                    <Button
                      onClick={handleClear}
                      variant="outline"
                      className="h-12 sm:h-14 px-6 sm:px-8 border-2 border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold text-base sm:text-lg rounded-xl"
                      data-testid="button-clear"
                    >
                      Clear
                    </Button>
                    <Button
                      onClick={resetConverter}
                      variant="outline"
                      className="h-12 sm:h-14 px-6 sm:px-8 border-2 border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold text-base sm:text-lg rounded-xl"
                      data-testid="button-reset"
                    >
                      Reset
                    </Button>
                  </div>
                </div>

                {/* Results Section */}
                <div className="bg-gradient-to-br from-gray-50 to-blue-50 p-4 sm:p-6 md:p-8 lg:p-10 xl:p-12 border-t">
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6 sm:mb-8">Generated QR Codes</h2>

                  {qrResults.length > 0 ? (
                    <div className="space-y-6" data-testid="qr-results">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {qrResults.map((qr, index) => (
                          <div key={index} className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-200">
                            <div className="aspect-square mb-4 bg-gray-50 rounded-lg p-4 flex items-center justify-center">
                              <img 
                                src={qr.dataUrl} 
                                alt={`QR Code ${index + 1}`}
                                className="max-w-full max-h-full"
                                data-testid={`qr-image-${index}`}
                              />
                            </div>
                            
                            <div className="space-y-3">
                              <div className="text-sm">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                    qr.type === 'url' ? 'bg-blue-100 text-blue-800' :
                                    qr.type === 'email' ? 'bg-green-100 text-green-800' :
                                    'bg-gray-100 text-gray-800'
                                  }`}>
                                    {qr.type.toUpperCase()}
                                  </span>
                                </div>
                                <p className="text-gray-600 break-words text-xs">{qr.processedText}</p>
                              </div>
                              
                              <div className="flex gap-2">
                                <Button
                                  onClick={() => downloadQRCode(qr, index)}
                                  variant="outline"
                                  size="sm"
                                  className="flex-1 text-xs px-2 py-2 rounded-lg"
                                  data-testid={`button-download-${index}`}
                                >
                                  Download
                                </Button>
                                <Button
                                  onClick={() => copyImageToClipboard(qr)}
                                  variant="outline"
                                  size="sm"
                                  className="flex-1 text-xs px-2 py-2 rounded-lg"
                                  data-testid={`button-copy-image-${index}`}
                                >
                                  Copy
                                </Button>
                              </div>
                              
                              <Button
                                onClick={() => handleCopyToClipboard(qr.processedText)}
                                variant="ghost"
                                size="sm"
                                className="w-full text-xs"
                                data-testid={`button-copy-content-${index}`}
                              >
                                Copy Content
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Statistics */}
                      <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-200" data-testid="qr-statistics">
                        <h3 className="text-base font-bold text-gray-900 mb-4">Generation Statistics</h3>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                          <div className="bg-blue-50 rounded-lg p-4 text-center">
                            <div className="text-2xl font-bold text-blue-600" data-testid="qr-count">{qrResults.length}</div>
                            <div className="text-sm text-blue-700 font-medium">QR Codes</div>
                          </div>
                          <div className="bg-green-50 rounded-lg p-4 text-center">
                            <div className="text-2xl font-bold text-green-600" data-testid="url-count">
                              {qrResults.filter(qr => qr.type === 'url').length}
                            </div>
                            <div className="text-sm text-green-700 font-medium">URLs</div>
                          </div>
                          <div className="bg-purple-50 rounded-lg p-4 text-center">
                            <div className="text-2xl font-bold text-purple-600" data-testid="email-count">
                              {qrResults.filter(qr => qr.type === 'email').length}
                            </div>
                            <div className="text-sm text-purple-700 font-medium">Emails</div>
                          </div>
                          <div className="bg-orange-50 rounded-lg p-4 text-center">
                            <div className="text-2xl font-bold text-orange-600" data-testid="text-count">
                              {qrResults.filter(qr => qr.type === 'text').length}
                            </div>
                            <div className="text-sm text-orange-700 font-medium">Text</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12 sm:py-16" data-testid="no-results">
                      <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-200 rounded-full mx-auto mb-4 sm:mb-6 flex items-center justify-center">
                        <div className="text-2xl sm:text-3xl font-bold text-gray-400">QR</div>
                      </div>
                      <p className="text-gray-500 text-base sm:text-lg px-4">Enter text to generate QR codes</p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* SEO Content Sections */}
          <div className="mt-16 space-y-8">
            {/* What is Text to QR Code Conversion */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">What is Text to QR Code Conversion?</h2>
                <div className="space-y-4 text-gray-600">
                  <p>
                    <strong>Text to QR code conversion</strong> is the process of transforming readable text, URLs, email addresses, and other content into scannable Quick Response (QR) codes. These two-dimensional barcodes can store various types of information and be scanned by smartphones, tablets, and QR code readers to instantly access the encoded content, making them perfect for bridging physical and digital experiences.
                  </p>
                  <p>
                    Our professional QR code generator features intelligent content extraction that automatically identifies URLs, email addresses, and text content within your input, creating separate QR codes for each type of information. With advanced customization options including size control, error correction levels, color customization, and content formatting, this tool serves businesses, marketers, educators, and individuals who need reliable QR code generation.
                  </p>
                  <p>
                    Whether you're creating QR codes for business cards, marketing materials, event promotions, contact information, or website links, this converter provides instant, high-quality QR codes with professional customization options to match your branding and technical requirements.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* QR Code Types and Applications */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">QR Code Types & Smart Extraction Guide</h2>
                <p className="text-gray-600 mb-8">Understanding different QR code types and content extraction methods helps you create the most effective QR codes for your specific use cases and target audiences.</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div className="bg-blue-50 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-blue-900 mb-3">URL QR Codes</h3>
                      <p className="text-blue-800 text-sm mb-4">
                        URL QR codes direct users to websites, landing pages, social media profiles, or online resources. Our smart extraction automatically detects and formats URLs for optimal scanning compatibility.
                      </p>
                      <div className="bg-blue-100 p-3 rounded-lg">
                        <h4 className="font-medium text-blue-900 mb-2">Example URLs Detected:</h4>
                        <div className="text-xs font-mono text-blue-800">
                          <div>https://dapsiwow.com</div>
                          <div>www.google.com</div>
                          <div>facebook.com/yourpage</div>
                          <div>linkedin.com/in/profile</div>
                        </div>
                      </div>
                      <ul className="text-xs text-blue-700 mt-3 space-y-1">
                        <li>• Automatically adds HTTPS protocol</li>
                        <li>• Perfect for marketing campaigns</li>
                        <li>• Supports social media links</li>
                        <li>• Ideal for business promotions</li>
                      </ul>
                    </div>

                    <div className="bg-green-50 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-green-900 mb-3">Email QR Codes</h3>
                      <p className="text-green-800 text-sm mb-4">
                        Email QR codes allow instant contact by opening the user's email client with the recipient address pre-filled. Perfect for business cards, customer service, and professional networking.
                      </p>
                      <div className="bg-green-100 p-3 rounded-lg">
                        <h4 className="font-medium text-green-900 mb-2">Example Emails Detected:</h4>
                        <div className="text-xs font-mono text-green-800">
                          <div>info@company.com</div>
                          <div>support@business.org</div>
                          <div>contact@website.net</div>
                          <div>sales@store.co</div>
                        </div>
                      </div>
                      <ul className="text-xs text-green-700 mt-3 space-y-1">
                        <li>• Instant email client activation</li>
                        <li>• Perfect for customer support</li>
                        <li>• Business card integration</li>
                        <li>• Professional contact sharing</li>
                      </ul>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="bg-purple-50 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-purple-900 mb-3">Plain Text QR Codes</h3>
                      <p className="text-purple-800 text-sm mb-4">
                        Text QR codes store any written content including messages, instructions, product information, or promotional text. Ideal for sharing information without requiring internet connectivity.
                      </p>
                      <div className="bg-purple-100 p-3 rounded-lg">
                        <h4 className="font-medium text-purple-900 mb-2">Example Text Content:</h4>
                        <div className="text-xs font-mono text-purple-800">
                          <div>Phone: +1-555-123-4567</div>
                          <div>Address: 123 Main St, City</div>
                          <div>WiFi: NetworkName Pass123</div>
                          <div>Instructions: Turn left at...</div>
                        </div>
                      </div>
                      <ul className="text-xs text-purple-700 mt-3 space-y-1">
                        <li>• Works offline after scanning</li>
                        <li>• Perfect for instructions</li>
                        <li>• Contact information sharing</li>
                        <li>• Event details and directions</li>
                      </ul>
                    </div>

                    <div className="bg-orange-50 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-orange-900 mb-3">Error Correction Levels</h3>
                      <p className="text-orange-800 text-sm mb-4">
                        QR codes include built-in error correction that allows them to remain scannable even when partially damaged or obscured. Choose the right level based on your use case.
                      </p>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between bg-orange-100 p-2 rounded">
                          <span className="text-orange-900 font-medium text-sm">Low (7%)</span>
                          <span className="text-orange-700 text-xs">Clean environments</span>
                        </div>
                        <div className="flex items-center justify-between bg-orange-100 p-2 rounded">
                          <span className="text-orange-900 font-medium text-sm">Medium (15%)</span>
                          <span className="text-orange-700 text-xs">General use (recommended)</span>
                        </div>
                        <div className="flex items-center justify-between bg-orange-100 p-2 rounded">
                          <span className="text-orange-900 font-medium text-sm">Quartile (25%)</span>
                          <span className="text-orange-700 text-xs">Industrial environments</span>
                        </div>
                        <div className="flex items-center justify-between bg-orange-100 p-2 rounded">
                          <span className="text-orange-900 font-medium text-sm">High (30%)</span>
                          <span className="text-orange-700 text-xs">Harsh conditions</span>
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
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Who Uses QR Code Generators?</h2>
                  <p className="text-gray-600 mb-6">QR code generators serve diverse professionals across industries, enabling seamless connection between physical materials and digital content for enhanced customer engagement and operational efficiency.</p>
                  
                  <div className="space-y-4">
                    <div className="bg-blue-50 rounded-lg p-4">
                      <h3 className="font-semibold text-blue-900 mb-2">Marketing & Advertising Professionals</h3>
                      <p className="text-blue-800 text-sm">Create campaign QR codes for print ads, billboards, product packaging, and promotional materials to drive traffic to landing pages, social media, and special offers.</p>
                    </div>
                    
                    <div className="bg-green-50 rounded-lg p-4">
                      <h3 className="font-semibold text-green-900 mb-2">Restaurant & Hospitality Industry</h3>
                      <p className="text-green-800 text-sm">Generate menu QR codes, contact information, WiFi access, table ordering systems, and customer feedback forms for contactless service experiences.</p>
                    </div>
                    
                    <div className="bg-purple-50 rounded-lg p-4">
                      <h3 className="font-semibold text-purple-900 mb-2">Real Estate Agents & Brokers</h3>
                      <p className="text-purple-800 text-sm">Create property listing QR codes, virtual tour links, contact information, and detailed property information for yard signs and marketing materials.</p>
                    </div>
                    
                    <div className="bg-orange-50 rounded-lg p-4">
                      <h3 className="font-semibold text-orange-900 mb-2">Event Planners & Organizers</h3>
                      <p className="text-orange-800 text-sm">Generate event information, registration links, contact details, venue directions, and social media connections for conferences, weddings, and gatherings.</p>
                    </div>

                    <div className="bg-teal-50 rounded-lg p-4">
                      <h3 className="font-semibold text-teal-900 mb-2">Retail & E-commerce Businesses</h3>
                      <p className="text-teal-800 text-sm">Create product information QR codes, customer reviews, online store links, and loyalty program registration for enhanced shopping experiences.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
                <CardContent className="p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Key Features & Benefits</h2>
                  <p className="text-gray-600 mb-6">Our text to QR code generator offers comprehensive features designed to meet professional, marketing, and personal needs with maximum efficiency and customization options.</p>
                  
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                        <span className="text-white text-xs font-bold">✓</span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-1">Smart Content Extraction</h4>
                        <p className="text-gray-600 text-sm">Automatically detects and separates URLs, email addresses, and text content for individual QR code generation with optimal formatting.</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                        <span className="text-white text-xs font-bold">✓</span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-1">Professional Customization</h4>
                        <p className="text-gray-600 text-sm">Complete control over QR code appearance including size, colors, error correction levels, and content prefixes/suffixes for brand consistency.</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                        <span className="text-white text-xs font-bold">✓</span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-1">Multiple Export Options</h4>
                        <p className="text-gray-600 text-sm">Download QR codes as high-quality PNG images or copy to clipboard for immediate use in presentations, documents, and marketing materials.</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                        <span className="text-white text-xs font-bold">✓</span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-1">Real-Time Generation</h4>
                        <p className="text-gray-600 text-sm">Instant QR code creation as you type with 300ms debouncing for optimal performance and immediate visual feedback during content creation.</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-teal-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                        <span className="text-white text-xs font-bold">✓</span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-1">Privacy & Security</h4>
                        <p className="text-gray-600 text-sm">All QR code generation happens locally in your browser - no data transmitted to servers, ensuring complete privacy and security of your content.</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Business Applications & Use Cases */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Business Applications & Marketing Use Cases</h2>
                <p className="text-gray-600 mb-8">QR codes bridge the gap between physical and digital marketing, enabling innovative customer engagement strategies and seamless user experiences across multiple touchpoints.</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-blue-900 mb-4">Marketing Campaign Integration</h3>
                      <div className="space-y-4">
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-white font-bold text-sm">1</span>
                          </div>
                          <div>
                            <h4 className="font-medium text-blue-900">Print Advertising</h4>
                            <p className="text-blue-800 text-sm">Add QR codes to magazine ads, flyers, brochures, and billboards to drive traffic to landing pages, special offers, or product information.</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-white font-bold text-sm">2</span>
                          </div>
                          <div>
                            <h4 className="font-medium text-blue-900">Product Packaging</h4>
                            <p className="text-blue-800 text-sm">Include QR codes on packaging for product registration, warranty information, user manuals, or customer support contact details.</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-white font-bold text-sm">3</span>
                          </div>
                          <div>
                            <h4 className="font-medium text-blue-900">Event Marketing</h4>
                            <p className="text-blue-800 text-sm">Create event QR codes for registration, schedules, speaker information, networking contacts, and post-event surveys.</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-6">
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-green-900 mb-4">Customer Service Enhancement</h3>
                      <div className="space-y-4">
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-white font-bold text-sm">1</span>
                          </div>
                          <div>
                            <h4 className="font-medium text-green-900">Contact Information</h4>
                            <p className="text-green-800 text-sm">Generate business card QR codes with phone numbers, email addresses, and website links for instant contact sharing.</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-white font-bold text-sm">2</span>
                          </div>
                          <div>
                            <h4 className="font-medium text-green-900">Support Resources</h4>
                            <p className="text-green-800 text-sm">Create QR codes linking to FAQ pages, troubleshooting guides, video tutorials, or live chat support for immediate assistance.</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-white font-bold text-sm">3</span>
                          </div>
                          <div>
                            <h4 className="font-medium text-green-900">Feedback Collection</h4>
                            <p className="text-green-800 text-sm">Direct customers to review platforms, feedback forms, or survey pages to gather valuable insights and testimonials.</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-8 bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Industry-Specific Applications</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <h4 className="font-medium text-gray-800 mb-2">Healthcare</h4>
                      <p className="text-gray-600 text-sm">Patient information, appointment scheduling, medication instructions, and emergency contact details for healthcare providers and patients.</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-800 mb-2">Education</h4>
                      <p className="text-gray-600 text-sm">Course materials, assignment submissions, educational resources, and parent-teacher communication for schools and universities.</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-800 mb-2">Manufacturing</h4>
                      <p className="text-gray-600 text-sm">Product specifications, quality control information, safety instructions, and inventory management for industrial applications.</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Technical Best Practices */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">QR Code Best Practices & Optimization Tips</h2>
                <p className="text-gray-600 mb-8">Following established best practices ensures your QR codes are scannable, accessible, and effective across different devices, environments, and use cases for maximum engagement and success rates.</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div className="bg-blue-50 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-blue-900 mb-4">Design & Sizing Guidelines</h3>
                      <div className="space-y-3 text-sm">
                        <div className="flex items-start gap-2">
                          <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                          <span className="text-blue-800"><strong>Minimum Size:</strong> Ensure QR codes are at least 2cm x 2cm (0.8" x 0.8") for reliable smartphone scanning</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                          <span className="text-blue-800"><strong>Contrast Ratio:</strong> Maintain high contrast between foreground and background colors for optimal scanning accuracy</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                          <span className="text-blue-800"><strong>Quiet Zone:</strong> Leave adequate white space around QR code borders to prevent scanning interference</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                          <span className="text-blue-800"><strong>Print Quality:</strong> Use high-resolution images (300+ DPI) for printed materials to maintain scanning reliability</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-green-50 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-green-900 mb-4">Content Optimization</h3>
                      <div className="space-y-3 text-sm">
                        <div className="flex items-start gap-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                          <span className="text-green-800"><strong>URL Shortening:</strong> Use short, clean URLs to reduce QR code complexity and improve scanning speed</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                          <span className="text-green-800"><strong>Mobile Optimization:</strong> Ensure destination pages are mobile-friendly and load quickly on smartphones</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                          <span className="text-green-800"><strong>Content Length:</strong> Keep text content concise to maintain QR code readability and scanning performance</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                          <span className="text-green-800"><strong>Call to Action:</strong> Include clear instructions like "Scan to visit website" or "Scan for contact info"</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="bg-purple-50 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-purple-900 mb-4">Error Correction Strategy</h3>
                      <div className="space-y-3 text-sm">
                        <div className="flex items-start gap-2">
                          <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                          <span className="text-purple-800"><strong>Indoor Use:</strong> Low to Medium error correction (7-15%) for clean, controlled environments</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                          <span className="text-purple-800"><strong>Outdoor Use:</strong> Quartile to High correction (25-30%) for weather exposure and wear resistance</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                          <span className="text-purple-800"><strong>Industrial Use:</strong> High error correction for harsh environments with potential damage or obstruction</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                          <span className="text-purple-800"><strong>Balance Trade-off:</strong> Higher error correction creates denser codes that may be harder to scan</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-orange-50 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-orange-900 mb-4">Testing & Analytics</h3>
                      <div className="space-y-3 text-sm">
                        <div className="flex items-start gap-2">
                          <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                          <span className="text-orange-800"><strong>Device Testing:</strong> Test QR codes on multiple smartphone models and QR reader apps</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                          <span className="text-orange-800"><strong>Environmental Testing:</strong> Verify scanning performance in various lighting conditions and angles</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                          <span className="text-orange-800"><strong>Analytics Tracking:</strong> Use UTM parameters or tracking URLs to measure QR code engagement rates</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                          <span className="text-orange-800"><strong>Performance Monitoring:</strong> Regularly check destination URLs and update content as needed</span>
                        </div>
                      </div>
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
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">What is a text to QR code generator?</h3>
                      <p className="text-gray-600 text-sm">
                        A text to QR code generator converts readable text, URLs, email addresses, and other content into scannable Quick Response (QR) codes. These two-dimensional barcodes can be scanned by smartphones and QR readers to instantly access the encoded information.
                      </p>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">How does smart content extraction work?</h3>
                      <p className="text-gray-600 text-sm">
                        Smart content extraction automatically identifies and separates different types of content from your input text. It detects URLs, email addresses, and plain text, then creates individual QR codes for each type with optimal formatting for the best scanning experience.
                      </p>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Which error correction level should I choose?</h3>
                      <p className="text-gray-600 text-sm">
                        Choose Low (7%) for clean indoor environments, Medium (15%) for general use, Quartile (25%) for outdoor applications, and High (30%) for harsh conditions where the QR code might be damaged or partially obscured.
                      </p>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Can I customize QR code colors and styling?</h3>
                      <p className="text-gray-600 text-sm">
                        Yes! You can customize foreground and background colors, adjust QR code size, set margins, and add custom prefixes or suffixes to your content. Maintain high contrast between colors for optimal scanning reliability.
                      </p>
                    </div>
                  </div>
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">How secure is this QR code generator?</h3>
                      <p className="text-gray-600 text-sm">
                        Completely secure! All QR code generation happens locally in your browser using client-side JavaScript. No data is transmitted to servers, stored remotely, or accessed by third parties, ensuring complete privacy of your content.
                      </p>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">What's the maximum amount of text I can encode?</h3>
                      <p className="text-gray-600 text-sm">
                        QR codes can theoretically store up to 7,089 numeric characters or 4,296 alphanumeric characters. However, longer text creates more complex codes that may be harder to scan. For best results, keep content concise and use URL shorteners for long links.
                      </p>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Can I use these QR codes for commercial purposes?</h3>
                      <p className="text-gray-600 text-sm">
                        Yes! All QR codes generated are yours to use for any purpose, including commercial applications. There are no licensing fees or restrictions on business use of the QR codes you create with this tool.
                      </p>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Do QR codes expire or stop working?</h3>
                      <p className="text-gray-600 text-sm">
                        QR codes themselves never expire - they're just encoded data. However, if your QR code links to a website or online resource, it will stop working if that destination becomes unavailable or the URL changes.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Technical Specifications */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Technical Specifications & Browser Compatibility</h2>
                <p className="text-gray-600 mb-8">Our text to QR code generator is built with modern web technologies to ensure compatibility, performance, and reliability across all major platforms and devices with comprehensive QR code standards support.</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">QR Code Standards & Specifications</h3>
                    <div className="space-y-4">
                      <div className="bg-blue-50 rounded-lg p-4">
                        <h4 className="font-semibold text-blue-900 mb-2">QR Code Format Support</h4>
                        <ul className="text-blue-800 text-sm space-y-1">
                          <li>• ISO/IEC 18004 QR Code standard compliance</li>
                          <li>• Version 1-40 automatic selection</li>
                          <li>• Four error correction levels (L, M, Q, H)</li>
                          <li>• UTF-8 and ASCII text encoding support</li>
                        </ul>
                      </div>
                      <div className="bg-green-50 rounded-lg p-4">
                        <h4 className="font-semibold text-green-900 mb-2">Output Specifications</h4>
                        <ul className="text-green-800 text-sm space-y-1">
                          <li>• PNG format with transparent background support</li>
                          <li>• Scalable vector output up to 500x500 pixels</li>
                          <li>• Customizable margins and quiet zones</li>
                          <li>• High-resolution suitable for print (300+ DPI)</li>
                        </ul>
                      </div>
                      <div className="bg-purple-50 rounded-lg p-4">
                        <h4 className="font-semibold text-purple-900 mb-2">Content Type Detection</h4>
                        <ul className="text-purple-800 text-sm space-y-1">
                          <li>• URL pattern recognition with protocol detection</li>
                          <li>• Email address validation and extraction</li>
                          <li>• Plain text processing and formatting</li>
                          <li>• Smart content separation and optimization</li>
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
                          <li>• Chrome 80+ (recommended for performance)</li>
                          <li>• Firefox 75+ (excellent canvas support)</li>
                          <li>• Safari 13+ (full HTML5 compatibility)</li>
                          <li>• Edge 80+ (optimal user experience)</li>
                        </ul>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h4 className="font-semibold text-gray-900 mb-2">Mobile Devices</h4>
                        <ul className="text-gray-700 text-sm space-y-1">
                          <li>• iOS Safari 13+ (responsive design optimized)</li>
                          <li>• Android Chrome 80+ (touch interface optimized)</li>
                          <li>• Samsung Internet 12+ (complete feature support)</li>
                          <li>• Mobile Firefox 75+ (full functionality)</li>
                        </ul>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h4 className="font-semibold text-gray-900 mb-2">Performance Features</h4>
                        <ul className="text-gray-700 text-sm space-y-1">
                          <li>• Real-time QR generation (300ms debounce)</li>
                          <li>• Client-side processing (offline capable)</li>
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

export default TextToQRCode;
