
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
    setErrorMessage(null);
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

  const getInputPlaceholder = () => {
    return 'Type or paste your text here...';
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
        <section className="relative py-12 sm:py-16 md:py-20 lg:py-28 xl:py-32 2xl:py-36 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-indigo-600/20"></div>
          <div className="relative max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 xl:px-12 text-center">
            <div className="space-y-4 sm:space-y-6 md:space-y-8 lg:space-y-10">
              <div className="inline-flex items-center px-3 py-1.5 sm:px-4 sm:py-2 md:px-5 md:py-2.5 bg-white/80 backdrop-blur-sm rounded-full border border-blue-200 text-xs sm:text-sm md:text-base">
                <span className="font-medium text-blue-700">Professional Encoder Tool</span>
              </div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl 2xl:text-7xl font-bold text-slate-900 leading-tight tracking-tight" data-testid="text-page-title">
                <span className="block">Text to Hex</span>
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                  Converter
                </span>
              </h1>
              <p className="text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl text-slate-600 max-w-xs sm:max-w-md md:max-w-2xl lg:max-w-4xl xl:max-w-5xl mx-auto leading-relaxed px-2 sm:px-4 md:px-6">
                Transform readable text into hexadecimal values with professional encoding options instantly
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
                    <p className="text-gray-600">Enter text to convert it into hexadecimal values</p>
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
                          <SelectItem value="spaced">Space Separated (48 65 6C 6C 6F)</SelectItem>
                          <SelectItem value="compact">Compact String (48656C6C6F)</SelectItem>
                          <SelectItem value="prefixed">0x Prefixed (0x48 0x65)</SelectItem>
                        </SelectContent>
                      </Select>
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
                            <SelectItem value="space">Space Separated (48 65 6C)</SelectItem>
                            <SelectItem value="comma">Comma Separated (48, 65, 6C)</SelectItem>
                            <SelectItem value="newline">Newline Separated</SelectItem>
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
                        placeholder={getInputPlaceholder()}
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
                {showResults && (
                  <div className="bg-gradient-to-br from-gray-50 to-blue-50 p-4 sm:p-6 md:p-8 lg:p-10 xl:p-12 border-t">
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6 sm:mb-8">Encoded Results</h2>

                    {conversionResult && conversionResult.originalText ? (
                    <div className="space-y-3 sm:space-y-4" data-testid="conversion-results">
                      {/* Main Hexadecimal Display */}
                      <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-3 sm:p-4">
                        <div className="flex items-center justify-between mb-3 gap-3">
                          <div className="flex-1 min-w-0">
                            <h3 className="text-sm sm:text-base font-semibold text-gray-900 truncate">Hexadecimal Values</h3>
                            <p className="text-xs sm:text-sm text-gray-600 break-words">Hex representation of text characters</p>
                          </div>
                          <Button
                            onClick={() => handleCopyToClipboard(conversionResult.hexadecimal)}
                            variant="outline"
                            size="sm"
                            className="text-xs px-2 sm:px-3 py-2 flex-shrink-0 rounded-lg min-w-[60px] sm:min-w-[70px] h-11 sm:h-9 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                            data-testid="button-copy-hex"
                          >
                            Copy
                          </Button>
                        </div>
                        <div 
                          className="bg-white p-2 sm:p-3 rounded-lg border border-gray-200 text-xs sm:text-sm font-mono break-all min-h-[40px] sm:min-h-[44px] flex items-center"
                          data-testid="hex-output"
                        >
                          {conversionResult.hexadecimal || '(empty result)'}
                        </div>
                      </div>

                      {/* Alternative Format Outputs */}
                      {options.showBinary && (
                        <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-3 sm:p-4">
                          <div className="flex items-center justify-between mb-3 gap-3">
                            <div className="flex-1 min-w-0">
                              <h4 className="text-sm sm:text-base font-semibold text-gray-900 truncate">Binary Code</h4>
                              <p className="text-xs sm:text-sm text-gray-600 break-words">Binary representation (0s and 1s)</p>
                            </div>
                            <Button
                              onClick={() => handleCopyToClipboard(conversionResult.binary)}
                              variant="outline"
                              size="sm"
                              className="text-xs px-2 sm:px-3 py-2 flex-shrink-0 rounded-lg min-w-[60px] sm:min-w-[70px] h-11 sm:h-9 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                              data-testid="button-copy-binary"
                            >
                              Copy
                            </Button>
                          </div>
                          <div 
                            className="bg-white p-2 sm:p-3 rounded-lg border border-gray-200 text-xs sm:text-sm font-mono break-all min-h-[40px] sm:min-h-[44px] flex items-center"
                            data-testid="binary-output"
                          >
                            {conversionResult.binary}
                          </div>
                        </div>
                      )}

                      {options.showDecimal && (
                        <div className="bg-purple-50 border-2 border-purple-200 rounded-xl p-3 sm:p-4">
                          <div className="flex items-center justify-between mb-3 gap-3">
                            <div className="flex-1 min-w-0">
                              <h4 className="text-sm sm:text-base font-semibold text-gray-900 truncate">Decimal Values</h4>
                              <p className="text-xs sm:text-sm text-gray-600 break-words">Decimal character codes</p>
                            </div>
                            <Button
                              onClick={() => handleCopyToClipboard(conversionResult.decimal)}
                              variant="outline"
                              size="sm"
                              className="text-xs px-2 sm:px-3 py-2 flex-shrink-0 rounded-lg min-w-[60px] sm:min-w-[70px] h-11 sm:h-9 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                              data-testid="button-copy-decimal"
                            >
                              Copy
                            </Button>
                          </div>
                          <div 
                            className="bg-white p-2 sm:p-3 rounded-lg border border-gray-200 text-xs sm:text-sm font-mono break-all min-h-[40px] sm:min-h-[44px] flex items-center"
                            data-testid="decimal-output"
                          >
                            {conversionResult.decimal}
                          </div>
                        </div>
                      )}

                      {/* Text Statistics */}
                      <div className="bg-white rounded-xl p-3 sm:p-4 shadow-sm border border-gray-200" data-testid="text-statistics">
                        <h3 className="text-sm sm:text-base font-bold text-gray-900 mb-4">Text Statistics</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="bg-blue-50 rounded-lg p-4 text-center">
                            <div className="text-2xl font-bold text-blue-600" data-testid="char-count">{conversionResult.charCount}</div>
                            <div className="text-sm text-blue-700 font-medium">Characters</div>
                          </div>
                          <div className="bg-green-50 rounded-lg p-4 text-center">
                            <div className="text-2xl font-bold text-green-600" data-testid="byte-count">{conversionResult.byteCount}</div>
                            <div className="text-sm text-green-700 font-medium">Bytes</div>
                          </div>
                        </div>
                      </div>
                    </div>
                    ) : (
                      <div className="text-center py-12 sm:py-16" data-testid="no-results">
                        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-200 rounded-full mx-auto mb-4 sm:mb-6 flex items-center justify-center">
                          <div className="text-2xl sm:text-3xl font-bold text-gray-400">HEX</div>
                        </div>
                        <p className="text-gray-500 text-base sm:text-lg px-4">Conversion results will appear here</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* SEO Content Sections */}
          <div className="mt-16 space-y-8">
            {/* What is Text to Hex Conversion */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">What is Text to Hexadecimal Conversion?</h2>
                <div className="space-y-4 text-gray-600">
                  <p>
                    <strong>Text to hexadecimal conversion</strong> is the fundamental process of transforming human-readable text into hexadecimal (base-16) representations of each character's byte value. This essential computer science concept allows text data to be represented in a numerical format that computers can efficiently process, store, and transmit across different systems and platforms using the hexadecimal numbering system.
                  </p>
                  <p>
                    Our professional text encoder supports comprehensive UTF-8 and ASCII encoding options with multiple output formats including space-separated hex values, compact hex strings, and 0x-prefixed notation. This flexibility makes it perfect for programming projects, web development, debugging applications, educational purposes, and understanding how computers internally represent textual information in hexadecimal format.
                  </p>
                  <p>
                    The tool features real-time conversion with intelligent input validation, advanced customization options including custom prefixes and suffixes, and multi-format output display capabilities that show binary and decimal representations alongside the hexadecimal values for comprehensive analysis and verification of your text encoding results.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Output Format Guide */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Hexadecimal Output Formats & Usage Guide</h2>
                <p className="text-gray-600 mb-8">Understanding different hexadecimal output formats is essential for proper text encoding. Our converter supports three distinct output formats, each designed for different applications and use cases in programming, data transmission, and system administration.</p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-800">Space-Separated Format</h3>
                    <p className="text-gray-600 text-sm">
                      Output hexadecimal values separated by spaces. This is the most common format used in programming debuggers, memory dumps, and educational examples. Each pair represents one byte of character data in hexadecimal notation.
                    </p>
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h4 className="font-medium text-blue-900 mb-2">Example Output:</h4>
                      <code className="text-xs font-mono text-blue-800 block mb-2">48 65 6C 6C 6F 20 57 6F 72 6C 64 21</code>
                      <div className="text-xs text-blue-600 font-medium">Original Text: "Hello World!"</div>
                    </div>
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <h5 className="font-medium text-blue-900 mb-1 text-sm">Best For:</h5>
                      <ul className="text-xs text-blue-800 space-y-1">
                        <li>• Programming tutorials and documentation</li>
                        <li>• Debugging sessions and memory analysis</li>
                        <li>• Educational demonstrations of hex encoding</li>
                      </ul>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-800">Compact String Format</h3>
                    <p className="text-gray-600 text-sm">
                      Output hexadecimal values as a continuous string without separators. This format is commonly used in URLs, configuration files, and data transmission protocols where space efficiency and compactness are important.
                    </p>
                    <div className="bg-green-50 p-4 rounded-lg">
                      <h4 className="font-medium text-green-900 mb-2">Example Output:</h4>
                      <code className="text-xs font-mono text-green-800 block mb-2">48656C6C6F20576F726C6421</code>
                      <div className="text-xs text-green-600 font-medium">Original Text: "Hello World!"</div>
                    </div>
                    <div className="bg-green-50 p-3 rounded-lg">
                      <h5 className="font-medium text-green-900 mb-1 text-sm">Best For:</h5>
                      <ul className="text-xs text-green-800 space-y-1">
                        <li>• URL encoding and web development</li>
                        <li>• Configuration file processing</li>
                        <li>• Data transmission and storage</li>
                      </ul>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-800">0x Prefixed Format</h3>
                    <p className="text-gray-600 text-sm">
                      Output hexadecimal values with the standard "0x" prefix notation. This format is widely used in programming languages like C, C++, JavaScript, and assembly language to explicitly denote hexadecimal values in code.
                    </p>
                    <div className="bg-purple-50 p-4 rounded-lg">
                      <h4 className="font-medium text-purple-900 mb-2">Example Output:</h4>
                      <code className="text-xs font-mono text-purple-800 block mb-2">0x48 0x65 0x6C 0x6C 0x6F</code>
                      <div className="text-xs text-purple-600 font-medium">Original Text: "Hello"</div>
                    </div>
                    <div className="bg-purple-50 p-3 rounded-lg">
                      <h5 className="font-medium text-purple-900 mb-1 text-sm">Best For:</h5>
                      <ul className="text-xs text-purple-800 space-y-1">
                        <li>• Programming and source code integration</li>
                        <li>• Assembly language and low-level programming</li>
                        <li>• System calls and kernel development</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Encoding and Character Ranges */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
                <CardContent className="p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Character Encoding Options</h2>
                  <p className="text-gray-600 mb-6">Select the appropriate character encoding based on your text content and target system requirements for accurate text to hexadecimal conversion results.</p>
                  
                  <div className="space-y-6">
                    <div className="bg-blue-50 rounded-lg p-4">
                      <h3 className="font-semibold text-blue-900 mb-3">UTF-8 Unicode Encoding</h3>
                      <p className="text-blue-800 text-sm mb-3">
                        UTF-8 supports the complete Unicode character set with variable-length encoding for international characters. This encoding handles all modern text requirements including emojis, mathematical symbols, and characters from world languages with proper multi-byte sequences.
                      </p>
                      <div className="space-y-2">
                        <h4 className="font-medium text-blue-900 text-sm">Character Support:</h4>
                        <ul className="text-xs text-blue-700 space-y-1">
                          <li>• Basic ASCII: A-Z, a-z, 0-9, punctuation (1 byte each)</li>
                          <li>• Extended Latin: European characters (2 bytes each)</li>
                          <li>• International: Asian, Arabic, Cyrillic text (2-3 bytes each)</li>
                          <li>• Symbols & Emojis: Mathematical symbols, emojis (2-4 bytes each)</li>
                        </ul>
                      </div>
                    </div>

                    <div className="bg-orange-50 rounded-lg p-4">
                      <h3 className="font-semibold text-orange-900 mb-3">ASCII 7-bit Encoding</h3>
                      <p className="text-orange-800 text-sm mb-3">
                        ASCII encoding supports only the basic 128 characters including English letters, digits, punctuation, and control characters. Characters outside this range are automatically replaced with '?' (question mark) for compatibility.
                      </p>
                      <div className="space-y-2">
                        <h4 className="font-medium text-orange-900 text-sm">Character Categories:</h4>
                        <ul className="text-xs text-orange-700 space-y-1">
                          <li>• Control characters: 0-31 (non-printable system controls)</li>
                          <li>• Printable symbols: 32-126 (visible text characters)</li>
                          <li>• Delete character: 127 (control character)</li>
                          <li>• Out-of-range values become '?' (hex 3F)</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
                <CardContent className="p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Professional Applications</h2>
                  <p className="text-gray-600 mb-6">Text to hexadecimal conversion serves critical functions across numerous professional domains and technical applications.</p>
                  
                  <div className="space-y-4">
                    <div className="bg-green-50 rounded-lg p-4">
                      <h3 className="font-semibold text-green-900 mb-2">Web Development & APIs</h3>
                      <p className="text-green-800 text-sm">Encode text for URL parameters, generate hex-encoded form data, process API requests with text payloads, and handle character encoding in web applications.</p>
                    </div>
                    
                    <div className="bg-purple-50 rounded-lg p-4">
                      <h3 className="font-semibold text-purple-900 mb-2">Software Development</h3>
                      <p className="text-purple-800 text-sm">Debug character encoding issues, generate test data for applications, create hex literals for programming, and analyze text processing algorithms.</p>
                    </div>
                    
                    <div className="bg-blue-50 rounded-lg p-4">
                      <h3 className="font-semibold text-blue-900 mb-2">System Administration</h3>
                      <p className="text-blue-800 text-sm">Generate configuration file entries, create hex-encoded system commands, process log file data, and handle character encoding in scripts.</p>
                    </div>
                    
                    <div className="bg-yellow-50 rounded-lg p-4">
                      <h3 className="font-semibold text-yellow-900 mb-2">Database Management</h3>
                      <p className="text-yellow-800 text-sm">Encode text for database storage, generate hex-encoded BLOB data, process data imports and exports, and handle character set conversions.</p>
                    </div>

                    <div className="bg-teal-50 rounded-lg p-4">
                      <h3 className="font-semibold text-teal-900 mb-2">Cybersecurity & Forensics</h3>
                      <p className="text-teal-800 text-sm">Create encoded payloads, analyze malware strings, generate test data for security tools, and encode sensitive information for transmission.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Advanced Features and Best Practices */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Advanced Features & Encoding Best Practices</h2>
                <p className="text-gray-600 mb-8">Leverage advanced functionality and follow industry best practices to ensure accurate and reliable text to hexadecimal conversion results for your projects and workflows.</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">Advanced Features</h3>
                    <div className="space-y-4">
                      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-400 p-4 rounded-r-lg">
                        <h4 className="font-semibold text-blue-900 mb-2">Real-Time Processing</h4>
                        <p className="text-blue-800 text-sm">Instant conversion with intelligent debouncing, immediate input validation, and live error detection for seamless user experience and efficient workflow.</p>
                      </div>
                      <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-l-4 border-green-400 p-4 rounded-r-lg">
                        <h4 className="font-semibold text-green-900 mb-2">Multi-Format Display</h4>
                        <p className="text-green-800 text-sm">Show results in hexadecimal, binary, and decimal formats simultaneously with customizable visibility controls for comprehensive data analysis and verification.</p>
                      </div>
                      <div className="bg-gradient-to-r from-purple-50 to-violet-50 border-l-4 border-purple-400 p-4 rounded-r-lg">
                        <h4 className="font-semibold text-purple-900 mb-2">Text Enhancement</h4>
                        <p className="text-purple-800 text-sm">Custom prefix and suffix support for input modification, case sensitivity options for hex output, and professional result presentation capabilities.</p>
                      </div>
                      <div className="bg-gradient-to-r from-orange-50 to-red-50 border-l-4 border-orange-400 p-4 rounded-r-lg">
                        <h4 className="font-semibold text-orange-900 mb-2">Security & Privacy</h4>
                        <p className="text-orange-800 text-sm">Complete client-side processing with no server communication, ensuring data privacy and security for sensitive text encoding tasks.</p>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">Best Practices</h3>
                    <div className="space-y-4">
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h4 className="font-semibold text-gray-900 mb-2">Input Preparation</h4>
                        <ul className="text-gray-700 text-sm space-y-1">
                          <li>• Verify text contains expected character types</li>
                          <li>• Consider encoding requirements for target system</li>
                          <li>• Test with representative text samples first</li>
                          <li>• Use sample data to validate conversion accuracy</li>
                        </ul>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h4 className="font-semibold text-gray-900 mb-2">Encoding Selection</h4>
                        <ul className="text-gray-700 text-sm space-y-1">
                          <li>• Choose UTF-8 for modern international applications</li>
                          <li>• Use ASCII for legacy system compatibility</li>
                          <li>• Consider target platform character support</li>
                          <li>• Validate encoding with expected output format</li>
                        </ul>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h4 className="font-semibold text-gray-900 mb-2">Output Verification</h4>
                        <ul className="text-gray-700 text-sm space-y-1">
                          <li>• Cross-check hex output with expected results</li>
                          <li>• Verify special characters encode correctly</li>
                          <li>• Test conversion reversibility when possible</li>
                          <li>• Validate byte count and character statistics</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Common Use Cases and Examples */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Common Use Cases & Practical Examples</h2>
                <p className="text-gray-600 mb-8">Text to hexadecimal conversion finds application in numerous real-world scenarios across web development, software engineering, system administration, and cybersecurity environments.</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="bg-blue-50 rounded-lg p-6">
                    <h3 className="font-semibold text-blue-900 mb-4">Web Development & APIs</h3>
                    <ul className="text-blue-800 text-sm space-y-2">
                      <li>• Encoding text for URL parameters and query strings</li>
                      <li>• Generating hex-encoded form data submissions</li>
                      <li>• Processing API requests with text payloads</li>
                      <li>• Creating hex-encoded HTTP headers and cookies</li>
                      <li>• Handling character encoding in web applications</li>
                      <li>• Debugging text transmission issues</li>
                    </ul>
                  </div>

                  <div className="bg-green-50 rounded-lg p-6">
                    <h3 className="font-semibold text-green-900 mb-4">Software Development</h3>
                    <ul className="text-green-800 text-sm space-y-2">
                      <li>• Creating hex literals for programming languages</li>
                      <li>• Debugging character encoding issues in code</li>
                      <li>• Generating test data for application testing</li>
                      <li>• Analyzing text processing algorithm outputs</li>
                      <li>• Converting strings for binary file formats</li>
                      <li>• Validating Unicode support implementation</li>
                    </ul>
                  </div>

                  <div className="bg-purple-50 rounded-lg p-6">
                    <h3 className="font-semibold text-purple-900 mb-4">System Administration</h3>
                    <ul className="text-purple-800 text-sm space-y-2">
                      <li>• Generating hex-encoded configuration entries</li>
                      <li>• Creating system commands with encoded text</li>
                      <li>• Processing log file data and analysis</li>
                      <li>• Handling character encoding in shell scripts</li>
                      <li>• Converting text for system configuration files</li>
                      <li>• Debugging character display problems</li>
                    </ul>
                  </div>

                  <div className="bg-orange-50 rounded-lg p-6">
                    <h3 className="font-semibold text-orange-900 mb-4">Database Management</h3>
                    <ul className="text-orange-800 text-sm space-y-2">
                      <li>• Encoding text for secure database storage</li>
                      <li>• Generating hex-encoded BLOB and CLOB data</li>
                      <li>• Processing data imports and export formats</li>
                      <li>• Handling character set conversions</li>
                      <li>• Creating database migration scripts</li>
                      <li>• Validating data integrity after encoding</li>
                    </ul>
                  </div>

                  <div className="bg-teal-50 rounded-lg p-6">
                    <h3 className="font-semibold text-teal-900 mb-4">Cybersecurity & Forensics</h3>
                    <ul className="text-teal-800 text-sm space-y-2">
                      <li>• Creating encoded payloads for security testing</li>
                      <li>• Analyzing malware strings and obfuscated code</li>
                      <li>• Generating test data for security tools</li>
                      <li>• Encoding sensitive information for transmission</li>
                      <li>• Processing digital forensics evidence</li>
                      <li>• Creating steganography and hiding techniques</li>
                    </ul>
                  </div>

                  <div className="bg-red-50 rounded-lg p-6">
                    <h3 className="font-semibold text-red-900 mb-4">Education & Research</h3>
                    <ul className="text-red-800 text-sm space-y-2">
                      <li>• Teaching hexadecimal and character encoding</li>
                      <li>• Computer science curriculum demonstrations</li>
                      <li>• Creating programming exercise examples</li>
                      <li>• Digital humanities text analysis projects</li>
                      <li>• Linguistic data encoding for research</li>
                      <li>• Machine learning dataset preparation</li>
                    </ul>
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
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">What is text to hexadecimal conversion?</h3>
                      <p className="text-gray-600 text-sm">
                        Text to hexadecimal conversion transforms readable text characters into their hexadecimal (base-16) byte representations. Each character is converted to its corresponding hex value based on the character encoding (UTF-8 or ASCII), creating a numeric representation of the original text.
                      </p>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Which output format should I choose?</h3>
                      <p className="text-gray-600 text-sm">
                        Use space-separated for debugging and general use, compact format for URLs and data transmission, and 0x-prefixed for programming code integration. The choice depends on how you plan to use the hexadecimal output in your target application or system.
                      </p>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">What's the difference between UTF-8 and ASCII encoding?</h3>
                      <p className="text-gray-600 text-sm">
                        UTF-8 supports all Unicode characters including international text and emojis with variable-length encoding. ASCII only supports basic English characters (0-127). Choose UTF-8 for modern applications and ASCII for legacy systems or when working exclusively with basic English text.
                      </p>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Can I reverse the hexadecimal back to text?</h3>
                      <p className="text-gray-600 text-sm">
                        Yes! Our hexadecimal to text converter can reverse the process. Simply copy the hex output from this tool and paste it into our hex to text converter to get back the original text, ensuring the conversion is accurate and reversible.
                      </p>
                    </div>
                  </div>
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Is this tool secure for sensitive data?</h3>
                      <p className="text-gray-600 text-sm">
                        Yes, completely secure! All conversion processing occurs locally in your browser using client-side JavaScript. No data is transmitted to servers, stored remotely, or accessible to third parties, ensuring complete privacy and confidentiality for your sensitive text.
                      </p>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Can I customize the hex output format?</h3>
                      <p className="text-gray-600 text-sm">
                        Yes! Advanced options include uppercase/lowercase hex letters, custom prefixes and suffixes for input text, multiple spacing options (space, comma, newline), and toggleable display of binary and decimal representations alongside the hex output.
                      </p>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">What happens to special characters and emojis?</h3>
                      <p className="text-gray-600 text-sm">
                        In UTF-8 mode, special characters and emojis are properly encoded using their Unicode byte sequences (may use 2-4 bytes each). In ASCII mode, characters outside the basic range (0-127) are replaced with '?' to maintain compatibility with ASCII-only systems.
                      </p>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Does this work without an internet connection?</h3>
                      <p className="text-gray-600 text-sm">
                        Yes! Once the page loads completely, all conversion functionality works offline without requiring an internet connection. The tool runs entirely in your browser, making it reliable for secure environments and situations with limited connectivity.
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
                <p className="text-gray-600 mb-8">Our text to hexadecimal converter is built with modern web technologies to ensure optimal performance, compatibility, and reliability across all major platforms and devices.</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">Supported Formats & Features</h3>
                    <div className="space-y-4">
                      <div className="bg-blue-50 rounded-lg p-4">
                        <h4 className="font-semibold text-blue-900 mb-2">Text Input Specifications</h4>
                        <ul className="text-blue-800 text-sm space-y-1">
                          <li>• Encoding: UTF-8 (full Unicode) and ASCII (0-127)</li>
                          <li>• Input: Any text including international characters</li>
                          <li>• Length: No practical limits for text input</li>
                          <li>• Validation: Real-time encoding verification</li>
                        </ul>
                      </div>
                      <div className="bg-green-50 rounded-lg p-4">
                        <h4 className="font-semibold text-green-900 mb-2">Output Capabilities</h4>
                        <ul className="text-green-800 text-sm space-y-1">
                          <li>• Primary: Hexadecimal values (uppercase/lowercase)</li>
                          <li>• Optional: Binary representation display</li>
                          <li>• Optional: Decimal values conversion</li>
                          <li>• Statistics: Character and byte count analysis</li>
                        </ul>
                      </div>
                      <div className="bg-purple-50 rounded-lg p-4">
                        <h4 className="font-semibold text-purple-900 mb-2">Processing Features</h4>
                        <ul className="text-purple-800 text-sm space-y-1">
                          <li>• Real-time conversion with intelligent debouncing</li>
                          <li>• Client-side processing (no server communication)</li>
                          <li>• Comprehensive error handling and validation</li>
                          <li>• Advanced copy-to-clipboard functionality</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">Browser & Platform Support</h3>
                    <div className="space-y-4">
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h4 className="font-semibold text-gray-900 mb-2">Desktop Browsers</h4>
                        <ul className="text-gray-700 text-sm space-y-1">
                          <li>• Chrome 90+ (recommended performance)</li>
                          <li>• Firefox 88+ (excellent compatibility)</li>
                          <li>• Safari 14+ (full feature support)</li>
                          <li>• Edge 90+ (optimal user experience)</li>
                        </ul>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h4 className="font-semibold text-gray-900 mb-2">Mobile Devices</h4>
                        <ul className="text-gray-700 text-sm space-y-1">
                          <li>• iOS Safari 14+ (responsive design)</li>
                          <li>• Android Chrome 90+ (touch optimized)</li>
                          <li>• Samsung Internet 13+ (full features)</li>
                          <li>• Mobile Firefox 88+ (complete support)</li>
                        </ul>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h4 className="font-semibold text-gray-900 mb-2">Accessibility & Standards</h4>
                        <ul className="text-gray-700 text-sm space-y-1">
                          <li>• WCAG 2.1 accessibility compliant</li>
                          <li>• Keyboard navigation support</li>
                          <li>• Screen reader compatible</li>
                          <li>• Responsive design (all screen sizes)</li>
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

export default TextToHexConverter;
