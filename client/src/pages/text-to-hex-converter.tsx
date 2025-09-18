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

interface ConversionOptions {
  encoding: 'utf8' | 'ascii';
  outputFormat: 'spaced' | 'compact' | 'prefixed';
  spacing: 'space' | 'comma' | 'newline';
  showBinary: boolean;
  showDecimal: boolean;
  uppercase: boolean;
  addPrefix: string;
  addSuffix: string;
}

interface ConversionResult {
  originalText: string;
  hexadecimal: string;
  binary: string;
  decimal: string;
  charCount: number;
  byteCount: number;
  timestamp: Date;
}

const TextToHexConverter = () => {
  const [inputText, setInputText] = useState('');
  const [conversionResult, setConversionResult] = useState<ConversionResult | null>(null);
  const [conversionHistory, setConversionHistory] = useState<ConversionResult[]>([]);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [options, setOptions] = useState<ConversionOptions>({
    encoding: 'utf8',
    outputFormat: 'spaced',
    spacing: 'space',
    showBinary: false,
    showDecimal: false,
    uppercase: true,
    addPrefix: '',
    addSuffix: ''
  });

  const textToHex = (text: string, encoding: 'utf8' | 'ascii' = 'utf8', outputFormat: string = 'spaced', spacing: string = 'space', uppercase: boolean = true): string => {
    if (!text) return '';
    
    try {
      let processedText = text;
      
      // For ASCII mode, replace non-ASCII characters with ? before encoding (code point aware)
      if (encoding === 'ascii') {
        processedText = Array.from(text).map(char => {
          const codePoint = char.codePointAt(0)!;
          return codePoint > 0x7F ? '?' : char;
        }).join('');
      }
      
      // Use TextEncoder to get UTF-8 bytes
      const encoder = new TextEncoder();
      const bytes = encoder.encode(processedText);
      
      // Convert bytes to hex
      const hexValues: string[] = [];
      for (let i = 0; i < bytes.length; i++) {
        let hex = bytes[i].toString(16);
        if (hex.length === 1) hex = '0' + hex;
        hexValues.push(uppercase ? hex.toUpperCase() : hex.toLowerCase());
      }
      
      // Apply output formatting
      switch (outputFormat) {
        case 'spaced':
          switch (spacing) {
            case 'space':
              return hexValues.join(' ');
            case 'comma':
              return hexValues.join(', ');
            case 'newline':
              return hexValues.join('\n');
            default:
              return hexValues.join(' ');
          }
        case 'compact':
          return hexValues.join('');
        case 'prefixed':
          const prefixedValues = hexValues.map(hex => `0x${hex}`);
          switch (spacing) {
            case 'space':
              return prefixedValues.join(' ');
            case 'comma':
              return prefixedValues.join(', ');
            case 'newline':
              return prefixedValues.join('\n');
            default:
              return prefixedValues.join(' ');
          }
        default:
          return hexValues.join(' ');
      }
    } catch (error) {
      throw new Error('Invalid text input');
    }
  };

  const textToBinary = (text: string, encoding: 'utf8' | 'ascii' = 'utf8', spacing: string = 'space'): string => {
    if (!text) return '';
    
    let processedText = text;
    
    // For ASCII mode, replace non-ASCII characters with ? before encoding (code point aware)
    if (encoding === 'ascii') {
      processedText = Array.from(text).map(char => {
        const codePoint = char.codePointAt(0)!;
        return codePoint > 0x7F ? '?' : char;
      }).join('');
    }
    
    // Use TextEncoder to get UTF-8 bytes
    const encoder = new TextEncoder();
    const bytes = encoder.encode(processedText);
    
    // Convert bytes to binary
    const binaryValues: string[] = [];
    for (let i = 0; i < bytes.length; i++) {
      const binary = bytes[i].toString(2).padStart(8, '0');
      binaryValues.push(binary);
    }
    
    switch (spacing) {
      case 'space':
        return binaryValues.join(' ');
      case 'comma':
        return binaryValues.join(', ');
      case 'newline':
        return binaryValues.join('\n');
      default:
        return binaryValues.join(' ');
    }
  };

  const textToDecimal = (text: string, encoding: 'utf8' | 'ascii' = 'utf8', spacing: string = 'space'): string => {
    if (!text) return '';
    
    let processedText = text;
    
    // For ASCII mode, replace non-ASCII characters with ? before encoding (code point aware)
    if (encoding === 'ascii') {
      processedText = Array.from(text).map(char => {
        const codePoint = char.codePointAt(0)!;
        return codePoint > 0x7F ? '?' : char;
      }).join('');
    }
    
    // Use TextEncoder to get UTF-8 bytes
    const encoder = new TextEncoder();
    const bytes = encoder.encode(processedText);
    
    // Convert bytes to decimal
    const decimalValues: string[] = [];
    for (let i = 0; i < bytes.length; i++) {
      decimalValues.push(bytes[i].toString());
    }
    
    switch (spacing) {
      case 'space':
        return decimalValues.join(' ');
      case 'comma':
        return decimalValues.join(', ');
      case 'newline':
        return decimalValues.join('\n');
      default:
        return decimalValues.join(' ');
    }
  };

  const convertText = () => {
    if (!inputText.trim()) {
      setConversionResult(null);
      setShowResults(false);
      return;
    }

    try {
      setErrorMessage(null);
      let processedText = inputText;
      
      // Apply prefix and suffix if provided
      if (options.addPrefix || options.addSuffix) {
        processedText = `${options.addPrefix}${processedText}${options.addSuffix}`;
      }

      const hexadecimal = textToHex(processedText, options.encoding, options.outputFormat, options.spacing, options.uppercase);
      const binary = textToBinary(processedText, options.encoding, options.spacing);
      const decimal = textToDecimal(processedText, options.encoding, options.spacing);
      
      const result: ConversionResult = {
        originalText: inputText,
        hexadecimal,
        binary,
        decimal,
        charCount: Array.from(processedText).length,
        byteCount: new Blob([processedText]).size,
        timestamp: new Date()
      };

      setConversionResult(result);
      setShowResults(true);

      // Add to history (keep last 10)
      setConversionHistory(prev => {
        const updated = [result, ...prev.filter(item => item.originalText !== inputText)];
        return updated.slice(0, 10);
      });
    } catch (error) {
      setConversionResult(null);
      setShowResults(false);
      setErrorMessage(error instanceof Error ? error.message : 'Invalid input format');
    }
  };

  const updateOption = <K extends keyof ConversionOptions>(key: K, value: ConversionOptions[K]) => {
    setOptions(prev => ({ ...prev, [key]: value }));
  };

  const handleCopyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const handleSampleText = () => {
    setInputText('Hello World!');
  };

  const resetConverter = () => {
    setInputText('');
    setConversionResult(null);
    setShowResults(false);
    setShowAdvanced(false);
    setOptions({
      encoding: 'utf8',
      outputFormat: 'spaced',
      spacing: 'space',
      showBinary: false,
      showDecimal: false,
      uppercase: true,
      addPrefix: '',
      addSuffix: ''
    });
  };

  // Clear results and errors when input is cleared
  useEffect(() => {
    if (!inputText.trim()) {
      setConversionResult(null);
      setShowResults(false);
      setErrorMessage(null);
    }
  }, [inputText]);

  const getOutputFormatLabel = () => {
    switch (options.outputFormat) {
      case 'spaced': return 'Space-separated hex values';
      case 'compact': return 'Compact hex string';
      case 'prefixed': return 'Prefixed hex values (0x)';
      default: return 'Hexadecimal output';
    }
  };

  const getSampleOutput = () => {
    switch (options.outputFormat) {
      case 'spaced': return options.uppercase ? '48 65 6C 6C 6F' : '48 65 6c 6c 6f';
      case 'compact': return options.uppercase ? '48656C6C6F' : '48656c6c6f';
      case 'prefixed': return options.uppercase ? '0x48 0x65 0x6C' : '0x48 0x65 0x6c';
      default: return 'Example output';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Helmet>
        <title>Text to Hexadecimal Converter - Convert Text to Hex Values | DapsiWow</title>
        <meta name="description" content="Free text to hexadecimal converter tool. Convert any text to hex values instantly. Supports UTF-8 and ASCII encoding, multiple output formats for developers and students." />
        <meta name="keywords" content="text to hexadecimal converter, text to hex, hex encoder, ASCII to hex, UTF-8 to hex, programming tools, web development, hex string encoder, online hex converter, data encoding" />
        <meta property="og:title" content="Text to Hexadecimal Converter - Convert Text to Hex Values | DapsiWow" />
        <meta property="og:description" content="Free online text to hexadecimal converter. Convert any text to hex values with support for multiple output formats and encodings." />
        <meta property="og:type" content="website" />
        <meta name="robots" content="index, follow" />
        <meta name="author" content="DapsiWow" />
        <link rel="canonical" href="https://dapsiwow.com/tools/text-to-hex-converter" />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            "name": "Text to Hexadecimal Converter",
            "description": "Professional text to hexadecimal converter for encoding text to hex values with UTF-8 and ASCII encoding support.",
            "url": "https://dapsiwow.com/tools/text-to-hex-converter",
            "applicationCategory": "DeveloperApplication",
            "operatingSystem": "Any",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "USD"
            },
            "featureList": [
              "Text to hexadecimal conversion",
              "Multiple output formats support",
              "UTF-8 and ASCII encoding support",
              "Real-time conversion",
              "Copy to clipboard functionality",
              "Conversion history tracking"
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
                <span className="text-xs sm:text-sm font-medium text-blue-700">Professional Encoder Tool</span>
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-slate-900 leading-tight" data-testid="text-page-title">
                Text to Hex
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                  Converter
                </span>
              </h1>
              <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-slate-600 max-w-4xl mx-auto leading-relaxed px-2">
                Convert any text to hexadecimal values instantly with multiple format options
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
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">Text Encoder</h2>
                    <p className="text-gray-600">Enter text to convert to hexadecimal values</p>
                  </div>

                  <div className="space-y-4 sm:space-y-6">
                    {/* Output Format Selection */}
                    <div className="space-y-3">
                      <Label htmlFor="format-select" className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                        Output Format
                      </Label>
                      <Select
                        value={options.outputFormat}
                        onValueChange={(value: 'spaced' | 'compact' | 'prefixed') => 
                          updateOption('outputFormat', value)
                        }
                      >
                        <SelectTrigger className="h-12 sm:h-14 border-2 border-gray-200 rounded-xl text-base sm:text-lg" data-testid="select-output-format">
                          <SelectValue placeholder="Select format" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="spaced">Space-separated (48 65 6C 6C 6F)</SelectItem>
                          <SelectItem value="compact">Compact string (48656C6C6F)</SelectItem>
                          <SelectItem value="prefixed">0x prefixed (0x48 0x65)</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-gray-500">Preview: {getSampleOutput()}</p>
                    </div>

                    {/* Spacing Selection (for spaced and prefixed formats) */}
                    {(options.outputFormat === 'spaced' || options.outputFormat === 'prefixed') && (
                      <div className="space-y-3">
                        <Label htmlFor="spacing-select" className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                          Value Spacing
                        </Label>
                        <Select
                          value={options.spacing}
                          onValueChange={(value: 'space' | 'comma' | 'newline') => 
                            updateOption('spacing', value)
                          }
                        >
                          <SelectTrigger className="h-12 sm:h-14 border-2 border-gray-200 rounded-xl text-base sm:text-lg" data-testid="select-spacing">
                            <SelectValue placeholder="Select spacing" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="space">Space separated (48 65 6C)</SelectItem>
                            <SelectItem value="comma">Comma separated (48, 65, 6C)</SelectItem>
                            <SelectItem value="newline">Newline separated (48\n65\n6C)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    {/* Encoding Selection */}
                    <div className="space-y-3">
                      <Label htmlFor="encoding-select" className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                        Character Encoding
                      </Label>
                      <Select
                        value={options.encoding}
                        onValueChange={(value: 'utf8' | 'ascii') => 
                          updateOption('encoding', value)
                        }
                      >
                        <SelectTrigger className="h-12 sm:h-14 border-2 border-gray-200 rounded-xl text-base sm:text-lg" data-testid="select-encoding">
                          <SelectValue placeholder="Select encoding" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="utf8">UTF-8 (Unicode)</SelectItem>
                          <SelectItem value="ascii">ASCII (7-bit)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Text Input */}
                    <div className="space-y-3">
                      <Label htmlFor="text-input" className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                        Text Input
                      </Label>
                      <Textarea
                        id="text-input"
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        className="min-h-[100px] sm:min-h-[120px] lg:min-h-[140px] text-base sm:text-lg border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-blue-500 resize-none"
                        placeholder="Type or paste your text here..."
                        data-testid="textarea-text-input"
                      />
                      {errorMessage && (
                        <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded-lg">
                          <p className="text-sm text-red-600" data-testid="error-message">{errorMessage}</p>
                        </div>
                      )}
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
                        
                        {/* Display and Processing Options */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                          <div className="space-y-4 bg-gray-50 rounded-xl p-4 sm:p-6">
                            <h4 className="text-sm sm:text-base font-semibold text-gray-900">Display Options</h4>
                            
                            <div className="flex items-center justify-between gap-2">
                              <div className="space-y-1 flex-1 min-w-0">
                                <Label className="text-xs sm:text-sm font-medium">Uppercase Hex</Label>
                                <p className="text-xs text-gray-500">Use uppercase letters (A-F) in hex values</p>
                              </div>
                              <Switch
                                checked={options.uppercase}
                                onCheckedChange={(value) => updateOption('uppercase', value)}
                                data-testid="switch-uppercase"
                              />
                            </div>

                            <div className="flex items-center justify-between gap-2">
                              <div className="space-y-1 flex-1 min-w-0">
                                <Label className="text-xs sm:text-sm font-medium">Show Binary Output</Label>
                                <p className="text-xs text-gray-500">Display binary representation of text</p>
                              </div>
                              <Switch
                                checked={options.showBinary}
                                onCheckedChange={(value) => updateOption('showBinary', value)}
                                data-testid="switch-show-binary"
                              />
                            </div>

                            <div className="flex items-center justify-between gap-2">
                              <div className="space-y-1 flex-1 min-w-0">
                                <Label className="text-xs sm:text-sm font-medium">Show Decimal Output</Label>
                                <p className="text-xs text-gray-500">Display decimal representation of text</p>
                              </div>
                              <Switch
                                checked={options.showDecimal}
                                onCheckedChange={(value) => updateOption('showDecimal', value)}
                                data-testid="switch-show-decimal"
                              />
                            </div>
                          </div>

                          {/* Text Customization Options */}
                          <div className="space-y-4 bg-gray-50 rounded-xl p-4 sm:p-6">
                            <h4 className="text-sm sm:text-base font-semibold text-gray-900">Text Customization</h4>
                            
                            <div className="space-y-2">
                              <Label className="text-xs sm:text-sm font-medium">Add Prefix</Label>
                              <Input
                                value={options.addPrefix}
                                onChange={(e) => updateOption('addPrefix', e.target.value)}
                                placeholder="e.g., [START], PREFIX:"
                                className="text-sm h-10 sm:h-12 border-2 border-gray-200 rounded-lg"
                                data-testid="input-add-prefix"
                              />
                              <p className="text-xs text-gray-500">Text to add before input</p>
                            </div>

                            <div className="space-y-2">
                              <Label className="text-xs sm:text-sm font-medium">Add Suffix</Label>
                              <Input
                                value={options.addSuffix}
                                onChange={(e) => updateOption('addSuffix', e.target.value)}
                                placeholder="e.g., [END], _SUFFIX"
                                className="text-sm h-10 sm:h-12 border-2 border-gray-200 rounded-lg"
                                data-testid="input-add-suffix"
                              />
                              <p className="text-xs text-gray-500">Text to add after input</p>
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
                      onClick={convertText}
                      disabled={!inputText.trim()}
                      className="flex-1 h-12 sm:h-14 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold text-base sm:text-lg rounded-xl shadow-lg transform transition-all duration-200 hover:scale-105"
                      data-testid="button-convert"
                    >
                      Convert to Hex
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
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6 sm:mb-8">Conversion Results</h2>

                  {conversionResult && showResults ? (
                    <div className="space-y-3 sm:space-y-4" data-testid="conversion-results">
                      {/* Main Hexadecimal Display */}
                      <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-3 sm:p-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4 mb-2">
                          <h3 className="text-base sm:text-lg font-semibold text-blue-900">Hexadecimal Values</h3>
                          <Button
                            onClick={() => handleCopyToClipboard(conversionResult.hexadecimal)}
                            variant="outline"
                            size="sm"
                            className="self-start sm:self-auto border-blue-300 text-blue-700 hover:bg-blue-100 text-xs sm:text-sm"
                            data-testid="button-copy-hex"
                          >
                            Copy Hex
                          </Button>
                        </div>
                        <div className="bg-white rounded-lg p-3 sm:p-4 text-gray-900 font-mono text-sm sm:text-base word-wrap break-words max-h-40 sm:max-h-48 overflow-y-auto" data-testid="text-hex-output">
                          {conversionResult.hexadecimal || 'No output generated'}
                        </div>
                      </div>

                      {/* Additional Output Formats */}
                      {(options.showBinary || options.showDecimal) && (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
                          {options.showBinary && (
                            <div className="bg-green-50 border-2 border-green-200 rounded-xl p-3 sm:p-4">
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                                <h3 className="text-base font-semibold text-green-900">Binary Values</h3>
                                <Button
                                  onClick={() => handleCopyToClipboard(conversionResult.binary)}
                                  variant="outline"
                                  size="sm"
                                  className="self-start sm:self-auto border-green-300 text-green-700 hover:bg-green-100 text-xs sm:text-sm"
                                  data-testid="button-copy-binary"
                                >
                                  Copy
                                </Button>
                              </div>
                              <div className="bg-white rounded-lg p-2 sm:p-3 text-gray-900 font-mono text-xs sm:text-sm word-wrap break-words max-h-32 overflow-y-auto" data-testid="text-binary-output">
                                {conversionResult.binary}
                              </div>
                            </div>
                          )}

                          {options.showDecimal && (
                            <div className="bg-purple-50 border-2 border-purple-200 rounded-xl p-3 sm:p-4">
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                                <h3 className="text-base font-semibold text-purple-900">Decimal Values</h3>
                                <Button
                                  onClick={() => handleCopyToClipboard(conversionResult.decimal)}
                                  variant="outline"
                                  size="sm"
                                  className="self-start sm:self-auto border-purple-300 text-purple-700 hover:bg-purple-100 text-xs sm:text-sm"
                                  data-testid="button-copy-decimal"
                                >
                                  Copy
                                </Button>
                              </div>
                              <div className="bg-white rounded-lg p-2 sm:p-3 text-gray-900 font-mono text-xs sm:text-sm word-wrap break-words max-h-32 overflow-y-auto" data-testid="text-decimal-output">
                                {conversionResult.decimal}
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Conversion Statistics */}
                      <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-3 sm:p-4">
                        <h3 className="text-base font-semibold text-yellow-900 mb-2">Conversion Details</h3>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4 text-xs sm:text-sm">
                          <div>
                            <span className="text-yellow-700 font-medium">Characters:</span>
                            <span className="ml-1 text-gray-900" data-testid="text-char-count">{conversionResult.charCount}</span>
                          </div>
                          <div>
                            <span className="text-yellow-700 font-medium">Bytes:</span>
                            <span className="ml-1 text-gray-900" data-testid="text-byte-count">{conversionResult.byteCount}</span>
                          </div>
                          <div>
                            <span className="text-yellow-700 font-medium">Encoding:</span>
                            <span className="ml-1 text-gray-900" data-testid="text-encoding">{options.encoding.toUpperCase()}</span>
                          </div>
                          <div>
                            <span className="text-yellow-700 font-medium">Format:</span>
                            <span className="ml-1 text-gray-900" data-testid="text-format">{options.outputFormat}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 sm:py-12 text-gray-500">
                      <p className="text-base sm:text-lg">Enter text above to see the hexadecimal conversion results</p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Conversion History */}
          {conversionHistory.length > 0 && (
            <Card className="mt-6 sm:mt-8 bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl overflow-hidden">
              <CardContent className="p-4 sm:p-6">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">Recent Conversions</h2>
                <div className="space-y-3 sm:space-y-4 max-h-80 overflow-y-auto">
                  {conversionHistory.map((item, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-3 sm:p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                        <span className="text-xs sm:text-sm text-gray-500">
                          {item.timestamp.toLocaleString()}
                        </span>
                        <Button
                          onClick={() => setInputText(item.originalText)}
                          variant="outline"
                          size="sm"
                          className="self-start sm:self-auto text-xs border-gray-300"
                          data-testid={`button-history-${index}`}
                        >
                          Use Again
                        </Button>
                      </div>
                      <div className="space-y-1">
                        <div>
                          <span className="text-xs font-medium text-gray-700">Input:</span>
                          <span className="ml-2 text-xs text-gray-900">{item.originalText.slice(0, 100)}{item.originalText.length > 100 ? '...' : ''}</span>
                        </div>
                        <div>
                          <span className="text-xs font-medium text-gray-700">Hex:</span>
                          <span className="ml-2 text-xs text-gray-900 font-mono break-all">{item.hexadecimal.slice(0, 100)}{item.hexadecimal.length > 100 ? '...' : ''}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* How to Use Section */}
          <Card className="mt-6 sm:mt-8 bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl overflow-hidden">
            <CardContent className="p-4 sm:p-6 md:p-8">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">How to Use the Text to Hex Converter</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                <div className="space-y-3 sm:space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800">Basic Steps:</h3>
                  <ol className="list-decimal list-inside space-y-1 sm:space-y-2 text-gray-700 text-sm sm:text-base">
                    <li>Choose your output format (spaced, compact, or prefixed)</li>
                    <li>Select character encoding (UTF-8 or ASCII)</li>
                    <li>Type or paste your text</li>
                    <li>Click "Convert to Hex" to encode</li>
                    <li>Copy the hexadecimal result</li>
                  </ol>
                </div>
                <div className="space-y-3 sm:space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800">Output Formats:</h3>
                  <ul className="list-disc list-inside space-y-1 sm:space-y-2 text-gray-700 text-sm sm:text-base">
                    <li><strong>Space-separated:</strong> 48 65 6C 6C 6F</li>
                    <li><strong>Compact:</strong> 48656C6C6F</li>
                    <li><strong>Prefixed:</strong> 0x48 0x65 0x6C</li>
                    <li><strong>Custom spacing:</strong> Comma or newline separated</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default TextToHexConverter;