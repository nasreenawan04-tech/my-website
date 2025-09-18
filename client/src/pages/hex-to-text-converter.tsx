
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
  inputFormat: 'spaced' | 'compact' | 'prefixed';
  showBinary: boolean;
  showDecimal: boolean;
  preserveFormatting: boolean;
  addPrefix: string;
  addSuffix: string;
}

interface ConversionResult {
  originalInput: string;
  text: string;
  binary: string;
  decimal: string;
  charCount: number;
  byteCount: number;
  timestamp: Date;
}

const HexToTextConverter = () => {
  const [inputHex, setInputHex] = useState('');
  const [conversionResult, setConversionResult] = useState<ConversionResult | null>(null);
  const [conversionHistory, setConversionHistory] = useState<ConversionResult[]>([]);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [options, setOptions] = useState<ConversionOptions>({
    encoding: 'utf8',
    inputFormat: 'spaced',
    showBinary: false,
    showDecimal: false,
    preserveFormatting: false,
    addPrefix: '',
    addSuffix: ''
  });

  const hexToText = (hex: string, encoding: 'utf8' | 'ascii' = 'utf8', inputFormat: string = 'spaced'): { text: string, bytes: Uint8Array } => {
    if (!hex) return { text: '', bytes: new Uint8Array(0) };
    
    try {
      let cleanHex = '';
      
      // Parse based on input format
      switch (inputFormat) {
        case 'spaced':
          cleanHex = hex.replace(/[^0-9A-Fa-f\s]/g, '').replace(/\s+/g, '');
          break;
        case 'compact':
          cleanHex = hex.replace(/[^0-9A-Fa-f]/g, '');
          break;
        case 'prefixed':
          cleanHex = hex.replace(/0x/gi, '').replace(/[^0-9A-Fa-f\s]/g, '').replace(/\s+/g, '');
          break;
        default:
          cleanHex = hex.replace(/[^0-9A-Fa-f]/g, '');
      }
      
      // Check if hex string length is even
      if (cleanHex.length % 2 !== 0) {
        throw new Error('Hex string length must be even');
      }
      
      // Convert hex to bytes
      const bytes = new Uint8Array(cleanHex.length / 2);
      for (let i = 0; i < cleanHex.length; i += 2) {
        const hexByte = cleanHex.slice(i, i + 2);
        const byteValue = parseInt(hexByte, 16);
        
        if (isNaN(byteValue) || byteValue < 0 || byteValue > 255) {
          throw new Error(`Invalid hex byte: ${hexByte}`);
        }
        
        bytes[i / 2] = byteValue;
      }
      
      let text: string;
      
      if (encoding === 'ascii') {
        // ASCII mode: map bytes directly, replace >127 with ?
        text = '';
        for (let i = 0; i < bytes.length; i++) {
          const byte = bytes[i];
          text += byte <= 0x7F ? String.fromCharCode(byte) : '?';
        }
      } else {
        // UTF-8 mode: use TextDecoder with fatal errors
        const decoder = new TextDecoder('utf-8', { fatal: true });
        try {
          text = decoder.decode(bytes);
        } catch (error) {
          throw new Error('Invalid UTF-8 sequence in hexadecimal input');
        }
      }
      
      return { text, bytes };
    } catch (error) {
      // Preserve specific error messages instead of generic one
      throw error instanceof Error ? error : new Error('Invalid hexadecimal input');
    }
  };

  const bytesToBinary = (bytes: Uint8Array): string => {
    if (bytes.length === 0) return '';
    
    const binaryValues: string[] = [];
    for (let i = 0; i < bytes.length; i++) {
      const binary = bytes[i].toString(2).padStart(8, '0');
      binaryValues.push(binary);
    }
    
    return binaryValues.join(' ');
  };

  const bytesToDecimal = (bytes: Uint8Array): string => {
    if (bytes.length === 0) return '';
    
    const decimalValues: string[] = [];
    for (let i = 0; i < bytes.length; i++) {
      decimalValues.push(bytes[i].toString());
    }
    
    return decimalValues.join(' ');
  };

  const convertHex = () => {
    if (!inputHex.trim()) {
      setConversionResult(null);
      setShowResults(false);
      setErrorMessage(null);
      return;
    }

    try {
      setErrorMessage(null);
      const { text: decodedText, bytes } = hexToText(inputHex, options.encoding, options.inputFormat);

      // Apply prefix and suffix if provided
      let text = decodedText;
      if (options.addPrefix || options.addSuffix) {
        text = `${options.addPrefix}${text}${options.addSuffix}`;
      }

      const binary = bytesToBinary(bytes);
      const decimal = bytesToDecimal(bytes);
      
      const result: ConversionResult = {
        originalInput: inputHex,
        text,
        binary,
        decimal,
        charCount: Array.from(text).length,
        byteCount: bytes.length,
        timestamp: new Date()
      };

      setConversionResult(result);
      setShowResults(true);

      // Add to history (keep last 10)
      setConversionHistory(prev => {
        const updated = [result, ...prev.filter(item => item.originalInput !== inputHex)];
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

  const handleSampleHex = () => {
    switch (options.inputFormat) {
      case 'spaced':
        setInputHex('48 65 6C 6C 6F 20 57 6F 72 6C 64 21');
        break;
      case 'compact':
        setInputHex('48656C6C6F20576F726C6421');
        break;
      case 'prefixed':
        setInputHex('0x48 0x65 0x6C 0x6C 0x6F 0x20 0x57 0x6F 0x72 0x6C 0x64 0x21');
        break;
    }
  };

  const resetConverter = () => {
    setInputHex('');
    setConversionResult(null);
    setShowResults(false);
    setShowAdvanced(false);
    setErrorMessage(null);
    setOptions({
      encoding: 'utf8',
      inputFormat: 'spaced',
      showBinary: false,
      showDecimal: false,
      preserveFormatting: false,
      addPrefix: '',
      addSuffix: ''
    });
  };

  // Clear results and errors when input is cleared
  useEffect(() => {
    if (!inputHex.trim()) {
      setConversionResult(null);
      setShowResults(false);
      setErrorMessage(null);
    }
  }, [inputHex]);

  const getInputFormatLabel = () => {
    switch (options.inputFormat) {
      case 'spaced': return 'Space-separated hex values';
      case 'compact': return 'Compact hex string';
      case 'prefixed': return 'Prefixed hex values (0x)';
      default: return 'Hexadecimal input';
    }
  };

  const getInputPlaceholder = () => {
    switch (options.inputFormat) {
      case 'spaced': return '48 65 6C 6C 6F 20 57 6F 72 6C 64 21';
      case 'compact': return '48656C6C6F20576F726C6421';
      case 'prefixed': return '0x48 0x65 0x6C 0x6C 0x6F 0x20 0x57...';
      default: return 'Enter hex values here...';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Helmet>
        <title>Hexadecimal to Text Converter - Convert Hex to Readable Text | DapsiWow</title>
        <meta name="description" content="Free hexadecimal to text converter tool. Convert hex values to readable text instantly. Supports UTF-8 and ASCII encoding, multiple input formats for developers and students." />
        <meta name="keywords" content="hexadecimal to text converter, hex to text, hex decoder, ASCII converter, UTF-8 converter, programming tools, web development, hex string decoder, online hex converter, data encoding" />
        <meta property="og:title" content="Hexadecimal to Text Converter - Convert Hex to Readable Text | DapsiWow" />
        <meta property="og:description" content="Free online hexadecimal to text converter. Convert hex values to readable text with support for multiple input formats and encodings." />
        <meta property="og:type" content="website" />
        <meta name="robots" content="index, follow" />
        <meta name="author" content="DapsiWow" />
        <link rel="canonical" href="https://dapsiwow.com/tools/hex-to-text-converter" />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            "name": "Hexadecimal to Text Converter",
            "description": "Professional hexadecimal to text converter for decoding hex values to readable text with UTF-8 and ASCII encoding support.",
            "url": "https://dapsiwow.com/tools/hex-to-text-converter",
            "applicationCategory": "DeveloperApplication",
            "operatingSystem": "Any",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "USD"
            },
            "featureList": [
              "Hexadecimal to text conversion",
              "Multiple input formats support",
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
                <span className="text-xs sm:text-sm font-medium text-blue-700">Professional Decoder Tool</span>
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-slate-900 leading-tight" data-testid="text-page-title">
                Hex to Text
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                  Converter
                </span>
              </h1>
              <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-slate-600 max-w-4xl mx-auto leading-relaxed px-2">
                Transform hexadecimal values into readable text with professional encoding options instantly
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
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">Hex Decoder</h2>
                    <p className="text-gray-600">Enter hexadecimal values to convert them into readable text</p>
                  </div>

                  <div className="space-y-4 sm:space-y-6">
                    {/* Input Format Selection */}
                    <div className="space-y-3">
                      <Label htmlFor="format-select" className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                        Input Format
                      </Label>
                      <Select
                        value={options.inputFormat}
                        onValueChange={(value: 'spaced' | 'compact' | 'prefixed') => 
                          updateOption('inputFormat', value)
                        }
                      >
                        <SelectTrigger className="h-12 sm:h-14 border-2 border-gray-200 rounded-xl text-base sm:text-lg" data-testid="select-input-format">
                          <SelectValue placeholder="Select format" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="spaced">Space Separated (48 65 6C 6C 6F)</SelectItem>
                          <SelectItem value="compact">Compact String (48656C6C6F)</SelectItem>
                          <SelectItem value="prefixed">0x Prefixed (0x48 0x65)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

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

                    {/* Hex Input */}
                    <div className="space-y-3">
                      <Label htmlFor="hex-input" className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                        {getInputFormatLabel()}
                      </Label>
                      <Textarea
                        id="hex-input"
                        value={inputHex}
                        onChange={(e) => setInputHex(e.target.value)}
                        className="min-h-[100px] sm:min-h-[120px] lg:min-h-[140px] text-base sm:text-lg border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-blue-500 font-mono resize-none"
                        placeholder={getInputPlaceholder()}
                        data-testid="textarea-hex-input"
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
                                <Label className="text-xs sm:text-sm font-medium">Show Binary Output</Label>
                                <p className="text-xs text-gray-500">Display binary representation of result</p>
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
                                <p className="text-xs text-gray-500">Display decimal representation of result</p>
                              </div>
                              <Switch
                                checked={options.showDecimal}
                                onCheckedChange={(value) => updateOption('showDecimal', value)}
                                data-testid="switch-show-decimal"
                              />
                            </div>

                            <div className="flex items-center justify-between gap-2">
                              <div className="space-y-1 flex-1 min-w-0">
                                <Label className="text-xs sm:text-sm font-medium">Preserve Formatting</Label>
                                <p className="text-xs text-gray-500">Keep original text formatting</p>
                              </div>
                              <Switch
                                checked={options.preserveFormatting}
                                onCheckedChange={(value) => updateOption('preserveFormatting', value)}
                                data-testid="switch-preserve-formatting"
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
                                placeholder="e.g., [DECODED], OUTPUT:"
                                className="text-sm h-10 sm:h-12 border-2 border-gray-200 rounded-lg"
                                data-testid="input-add-prefix"
                              />
                              <p className="text-xs text-gray-500">Text to add before decoded output</p>
                            </div>

                            <div className="space-y-2">
                              <Label className="text-xs sm:text-sm font-medium">Add Suffix</Label>
                              <Input
                                value={options.addSuffix}
                                onChange={(e) => updateOption('addSuffix', e.target.value)}
                                placeholder="e.g., [END], _RESULT"
                                className="text-sm h-10 sm:h-12 border-2 border-gray-200 rounded-lg"
                                data-testid="input-add-suffix"
                              />
                              <p className="text-xs text-gray-500">Text to add after decoded output</p>
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
                      onClick={convertHex}
                      disabled={!inputHex.trim()}
                      className="flex-1 h-12 sm:h-14 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold text-base sm:text-lg rounded-xl shadow-lg transform transition-all duration-200 hover:scale-105"
                      data-testid="button-convert"
                    >
                      Convert to Text
                    </Button>
                    <Button
                      onClick={handleSampleHex}
                      variant="outline"
                      className="h-12 sm:h-14 px-6 sm:px-8 border-2 border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold text-base sm:text-lg rounded-xl"
                      data-testid="button-sample-hex"
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
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6 sm:mb-8">Decoded Results</h2>

                    {conversionResult && conversionResult.originalInput ? (
                    <div className="space-y-3 sm:space-y-4" data-testid="conversion-results">
                      {/* Main Decoded Text Display */}
                      <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-3 sm:p-4">
                        <div className="flex items-center justify-between mb-3 gap-3">
                          <div className="flex-1 min-w-0">
                            <h3 className="text-sm sm:text-base font-semibold text-gray-900 truncate">Decoded Text</h3>
                            <p className="text-xs sm:text-sm text-gray-600 break-words">Human-readable text from hex codes</p>
                          </div>
                          <Button
                            onClick={() => handleCopyToClipboard(conversionResult.text)}
                            variant="outline"
                            size="sm"
                            className="text-xs px-2 sm:px-3 py-2 flex-shrink-0 rounded-lg min-w-[60px] sm:min-w-[70px] h-11 sm:h-9 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                            data-testid="button-copy-text"
                          >
                            Copy
                          </Button>
                        </div>
                        <div 
                          className="bg-white p-2 sm:p-3 rounded-lg border border-gray-200 text-xs sm:text-sm break-all min-h-[40px] sm:min-h-[44px] flex items-center"
                          data-testid="text-output"
                        >
                          {conversionResult.text || '(empty result)'}
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
            {/* What is Hex to Text Conversion */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">What is Hexadecimal to Text Conversion?</h2>
                <div className="space-y-4 text-gray-600">
                  <p>
                    <strong>Hexadecimal to text conversion</strong> is the essential process of transforming hexadecimal values (base-16 representations using digits 0-9 and letters A-F) back into human-readable text characters. This fundamental computer science operation converts hex-encoded data into its original textual form, making it invaluable for developers, cybersecurity professionals, and anyone working with encoded digital information.
                  </p>
                  <p>
                    Our professional hex decoder supports multiple input formats including space-separated values, compact hex strings, and 0x-prefixed notation. With comprehensive UTF-8 and ASCII encoding options, you can decode any hex-encoded text data efficiently, making it perfect for debugging applications, analyzing data dumps, educational purposes, and understanding how computers store and transmit textual information in hexadecimal format.
                  </p>
                  <p>
                    The tool features real-time conversion with intelligent input validation, advanced customization options including custom prefixes and suffixes, and multi-format output display capabilities that show binary and decimal representations alongside the decoded text for comprehensive analysis and verification of your hex conversion results.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Input Format Guide */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Hexadecimal Input Formats & Usage Guide</h2>
                <p className="text-gray-600 mb-8">Understanding proper hexadecimal input formatting is crucial for accurate text conversion. Our converter supports three distinct input formats, each designed for different data sources and use cases in programming, data analysis, and system administration.</p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-800">Space-Separated Format</h3>
                    <p className="text-gray-600 text-sm">
                      Input hexadecimal values separated by spaces. This is the most common format used in programming debuggers, memory dumps, and educational examples. Each pair represents one byte of data in hexadecimal notation.
                    </p>
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h4 className="font-medium text-blue-900 mb-2">Example Input:</h4>
                      <code className="text-xs font-mono text-blue-800 block mb-2">48 65 6C 6C 6F 20 57 6F 72 6C 64 21</code>
                      <div className="text-xs text-blue-600 font-medium">Decoded Result: "Hello World!"</div>
                    </div>
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <h5 className="font-medium text-blue-900 mb-1 text-sm">Best For:</h5>
                      <ul className="text-xs text-blue-800 space-y-1">
                        <li>• Memory dumps and binary file analysis</li>
                        <li>• Debugging sessions and log file examination</li>
                        <li>• Network packet analysis and forensics</li>
                      </ul>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-800">Compact String Format</h3>
                    <p className="text-gray-600 text-sm">
                      Input hexadecimal values as a continuous string without separators. This format is commonly used in URLs, configuration files, and data transmission protocols where space efficiency is important.
                    </p>
                    <div className="bg-green-50 p-4 rounded-lg">
                      <h4 className="font-medium text-green-900 mb-2">Example Input:</h4>
                      <code className="text-xs font-mono text-green-800 block mb-2">48656C6C6F20576F726C6421</code>
                      <div className="text-xs text-green-600 font-medium">Decoded Result: "Hello World!"</div>
                    </div>
                    <div className="bg-green-50 p-3 rounded-lg">
                      <h5 className="font-medium text-green-900 mb-1 text-sm">Best For:</h5>
                      <ul className="text-xs text-green-800 space-y-1">
                        <li>• URL encoding and web development</li>
                        <li>• Configuration file processing</li>
                        <li>• Database hex field conversion</li>
                      </ul>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-800">0x Prefixed Format</h3>
                    <p className="text-gray-600 text-sm">
                      Input hexadecimal values with the standard "0x" prefix notation. This format is widely used in programming languages like C, C++, JavaScript, and assembly language to explicitly denote hexadecimal values.
                    </p>
                    <div className="bg-purple-50 p-4 rounded-lg">
                      <h4 className="font-medium text-purple-900 mb-2">Example Input:</h4>
                      <code className="text-xs font-mono text-purple-800 block mb-2">0x48 0x65 0x6C 0x6C 0x6F</code>
                      <div className="text-xs text-purple-600 font-medium">Decoded Result: "Hello"</div>
                    </div>
                    <div className="bg-purple-50 p-3 rounded-lg">
                      <h5 className="font-medium text-purple-900 mb-1 text-sm">Best For:</h5>
                      <ul className="text-xs text-purple-800 space-y-1">
                        <li>• Programming and assembly language code</li>
                        <li>• Source code analysis and documentation</li>
                        <li>• Low-level programming and system calls</li>
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
                  <p className="text-gray-600 mb-6">Select the appropriate character encoding based on your data source and requirements for accurate hexadecimal to text conversion results.</p>
                  
                  <div className="space-y-6">
                    <div className="bg-blue-50 rounded-lg p-4">
                      <h3 className="font-semibold text-blue-900 mb-3">UTF-8 Unicode Encoding</h3>
                      <p className="text-blue-800 text-sm mb-3">
                        UTF-8 supports the complete Unicode character set with values ranging from 0x00 to 0x10FFFF. This encoding handles international characters, emojis, mathematical symbols, and all modern text requirements with variable-length encoding.
                      </p>
                      <div className="space-y-2">
                        <h4 className="font-medium text-blue-900 text-sm">Hex Range Coverage:</h4>
                        <ul className="text-xs text-blue-700 space-y-1">
                          <li>• Basic ASCII: 0x00-0x7F (English letters, numbers, symbols)</li>
                          <li>• Extended ASCII: 0x80-0xFF (European characters)</li>
                          <li>• Unicode BMP: 0x100-0xFFFF (most world languages)</li>
                          <li>• Unicode Supplementary: 0x10000-0x10FFFF (emojis, rare chars)</li>
                        </ul>
                      </div>
                    </div>

                    <div className="bg-orange-50 rounded-lg p-4">
                      <h3 className="font-semibold text-orange-900 mb-3">ASCII 7-bit Encoding</h3>
                      <p className="text-orange-800 text-sm mb-3">
                        ASCII encoding supports only the basic 128 characters (0x00-0x7F) including English letters, digits, punctuation, and control characters. Hex values above 0x7F are replaced with '?' characters.
                      </p>
                      <div className="space-y-2">
                        <h4 className="font-medium text-orange-900 text-sm">Hex Value Categories:</h4>
                        <ul className="text-xs text-orange-700 space-y-1">
                          <li>• Control characters: 0x00-0x1F (non-printable)</li>
                          <li>• Printable symbols: 0x20-0x7E (visible characters)</li>
                          <li>• Delete character: 0x7F (control character)</li>
                          <li>• Out-of-range values replaced with '?' (0x3F)</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
                <CardContent className="p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Professional Applications</h2>
                  <p className="text-gray-600 mb-6">Hexadecimal to text conversion serves critical functions across numerous professional domains and technical applications.</p>
                  
                  <div className="space-y-4">
                    <div className="bg-green-50 rounded-lg p-4">
                      <h3 className="font-semibold text-green-900 mb-2">Cybersecurity & Forensics</h3>
                      <p className="text-green-800 text-sm">Analyze malware payloads, decode network traffic, extract hidden messages, and investigate digital evidence in forensic investigations.</p>
                    </div>
                    
                    <div className="bg-purple-50 rounded-lg p-4">
                      <h3 className="font-semibold text-purple-900 mb-2">Web Development & APIs</h3>
                      <p className="text-purple-800 text-sm">Debug URL encoding issues, decode hex-encoded form data, analyze HTTP headers, and process API responses containing hexadecimal values.</p>
                    </div>
                    
                    <div className="bg-blue-50 rounded-lg p-4">
                      <h3 className="font-semibold text-blue-900 mb-2">System Administration</h3>
                      <p className="text-blue-800 text-sm">Decode configuration files, analyze system logs, process binary dumps, and troubleshoot character encoding problems in server environments.</p>
                    </div>
                    
                    <div className="bg-yellow-50 rounded-lg p-4">
                      <h3 className="font-semibold text-yellow-900 mb-2">Database Management</h3>
                      <p className="text-yellow-800 text-sm">Convert hex-encoded database fields, analyze BLOB content, process data exports, and troubleshoot character encoding issues.</p>
                    </div>

                    <div className="bg-teal-50 rounded-lg p-4">
                      <h3 className="font-semibold text-teal-900 mb-2">Reverse Engineering</h3>
                      <p className="text-teal-800 text-sm">Analyze binary files, extract embedded strings, decode firmware images, and understand proprietary data formats.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Advanced Features and Best Practices */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Advanced Features & Conversion Best Practices</h2>
                <p className="text-gray-600 mb-8">Leverage advanced functionality and follow industry best practices to ensure accurate and reliable hexadecimal to text conversion results for your projects and workflows.</p>
                
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
                        <p className="text-green-800 text-sm">Show results in text, binary, and decimal formats simultaneously with customizable visibility controls for comprehensive data analysis and verification.</p>
                      </div>
                      <div className="bg-gradient-to-r from-purple-50 to-violet-50 border-l-4 border-purple-400 p-4 rounded-r-lg">
                        <h4 className="font-semibold text-purple-900 mb-2">Text Enhancement</h4>
                        <p className="text-purple-800 text-sm">Custom prefix and suffix support for output formatting, preserving original formatting options, and professional result presentation capabilities.</p>
                      </div>
                      <div className="bg-gradient-to-r from-orange-50 to-red-50 border-l-4 border-orange-400 p-4 rounded-r-lg">
                        <h4 className="font-semibold text-orange-900 mb-2">Security & Privacy</h4>
                        <p className="text-orange-800 text-sm">Complete client-side processing with no server communication, ensuring data privacy and security for sensitive information conversion tasks.</p>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">Best Practices</h3>
                    <div className="space-y-4">
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h4 className="font-semibold text-gray-900 mb-2">Input Validation</h4>
                        <ul className="text-gray-700 text-sm space-y-1">
                          <li>• Verify hex values contain only valid characters (0-9, A-F)</li>
                          <li>• Check input format matches selected type</li>
                          <li>• Ensure even number of hex characters for byte alignment</li>
                          <li>• Use sample data to test conversion accuracy</li>
                        </ul>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h4 className="font-semibold text-gray-900 mb-2">Encoding Selection</h4>
                        <ul className="text-gray-700 text-sm space-y-1">
                          <li>• Choose UTF-8 for modern international applications</li>
                          <li>• Use ASCII for legacy system compatibility</li>
                          <li>• Consider source data characteristics and origin</li>
                          <li>• Test with representative data samples first</li>
                        </ul>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h4 className="font-semibold text-gray-900 mb-2">Result Verification</h4>
                        <ul className="text-gray-700 text-sm space-y-1">
                          <li>• Cross-check output with expected results</li>
                          <li>• Verify special characters display correctly</li>
                          <li>• Test conversion reversibility when possible</li>
                          <li>• Validate character count and byte statistics</li>
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
                <p className="text-gray-600 mb-8">Hexadecimal to text conversion finds application in numerous real-world scenarios across cybersecurity, web development, system administration, and digital forensics environments.</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="bg-blue-50 rounded-lg p-6">
                    <h3 className="font-semibold text-blue-900 mb-4">Web Development & APIs</h3>
                    <ul className="text-blue-800 text-sm space-y-2">
                      <li>• Debugging URL-encoded parameters and form data</li>
                      <li>• Analyzing hex-encoded HTTP headers and cookies</li>
                      <li>• Processing API responses with hexadecimal values</li>
                      <li>• Converting database hex fields to readable text</li>
                      <li>• Decoding authentication tokens and session data</li>
                      <li>• Troubleshooting character encoding issues</li>
                    </ul>
                  </div>

                  <div className="bg-green-50 rounded-lg p-6">
                    <h3 className="font-semibold text-green-900 mb-4">Cybersecurity & Forensics</h3>
                    <ul className="text-green-800 text-sm space-y-2">
                      <li>• Analyzing malware payloads and obfuscated code</li>
                      <li>• Decoding network packet captures and traffic</li>
                      <li>• Extracting hidden messages from binary files</li>
                      <li>• Investigating digital evidence and file signatures</li>
                      <li>• Reverse engineering proprietary protocols</li>
                      <li>• Analyzing cryptographic hash outputs</li>
                    </ul>
                  </div>

                  <div className="bg-purple-50 rounded-lg p-6">
                    <h3 className="font-semibold text-purple-900 mb-4">System Administration</h3>
                    <ul className="text-purple-800 text-sm space-y-2">
                      <li>• Decoding system configuration files and settings</li>
                      <li>• Analyzing log entries with hex-encoded data</li>
                      <li>• Processing binary dumps and memory snapshots</li>
                      <li>• Troubleshooting character encoding problems</li>
                      <li>• Converting registry values and system data</li>
                      <li>• Analyzing device driver communication</li>
                    </ul>
                  </div>

                  <div className="bg-orange-50 rounded-lg p-6">
                    <h3 className="font-semibold text-orange-900 mb-4">Database Management</h3>
                    <ul className="text-orange-800 text-sm space-y-2">
                      <li>• Converting hex-encoded BLOB and CLOB fields</li>
                      <li>• Analyzing binary data stored in databases</li>
                      <li>• Processing data migration and export files</li>
                      <li>• Debugging character set conversion issues</li>
                      <li>• Extracting readable content from hex columns</li>
                      <li>• Validating data integrity after encoding</li>
                    </ul>
                  </div>

                  <div className="bg-teal-50 rounded-lg p-6">
                    <h3 className="font-semibold text-teal-900 mb-4">Software Development</h3>
                    <ul className="text-teal-800 text-sm space-y-2">
                      <li>• Debugging serialization and deserialization</li>
                      <li>• Testing Unicode and internationalization support</li>
                      <li>• Analyzing binary file formats and protocols</li>
                      <li>• Converting embedded string resources</li>
                      <li>• Processing compiler and linker outputs</li>
                      <li>• Validating encoding algorithms and functions</li>
                    </ul>
                  </div>

                  <div className="bg-red-50 rounded-lg p-6">
                    <h3 className="font-semibold text-red-900 mb-4">Research & Education</h3>
                    <ul className="text-red-800 text-sm space-y-2">
                      <li>• Teaching hexadecimal and character encoding</li>
                      <li>• Computer science curriculum demonstrations</li>
                      <li>• Digital humanities text analysis projects</li>
                      <li>• Cryptography and steganography research</li>
                      <li>• Historical document digitization workflows</li>
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
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">What is hexadecimal to text conversion?</h3>
                      <p className="text-gray-600 text-sm">
                        Hexadecimal to text conversion transforms hex values (base-16 numbers using 0-9 and A-F) back into readable text characters. Each pair of hex digits represents one byte that corresponds to a character according to Unicode or ASCII encoding standards.
                      </p>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Which hex input format should I choose?</h3>
                      <p className="text-gray-600 text-sm">
                        Use space-separated for memory dumps and debug output, compact format for URLs and configuration files, and 0x-prefixed for programming code and assembly language. The choice depends on your data source format.
                      </p>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">What's the difference between UTF-8 and ASCII encoding?</h3>
                      <p className="text-gray-600 text-sm">
                        UTF-8 supports all Unicode characters (0x00-0x10FFFF) including international text and emojis. ASCII only supports basic English characters (0x00-0x7F). Choose UTF-8 for modern applications and ASCII for legacy systems.
                      </p>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Why do I get invalid hex input errors?</h3>
                      <p className="text-gray-600 text-sm">
                        Invalid hex errors occur when input contains non-hex characters (not 0-9, A-F), has odd number of characters, or doesn't match the selected format. Ensure your input contains only valid hexadecimal characters in the correct format.
                      </p>
                    </div>
                  </div>
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Is this tool secure for sensitive data?</h3>
                      <p className="text-gray-600 text-sm">
                        Yes, completely secure! All conversion processing occurs locally in your browser using client-side JavaScript. No data is transmitted to servers, stored remotely, or accessible to third parties, ensuring complete privacy and confidentiality.
                      </p>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Can I customize the conversion output?</h3>
                      <p className="text-gray-600 text-sm">
                        Yes! Advanced options include custom prefixes and suffixes for decoded text, toggleable display of binary and decimal representations, formatting preservation options, and copy-to-clipboard functionality for easy integration.
                      </p>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">What hex value ranges are supported?</h3>
                      <p className="text-gray-600 text-sm">
                        For UTF-8 encoding, all valid hex values (0x00-0x10FFFF) are supported. For ASCII encoding, only values 0x00-0x7F are valid; higher values are automatically replaced with '?' character to maintain compatibility.
                      </p>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Does this work without internet connection?</h3>
                      <p className="text-gray-600 text-sm">
                        Yes! Once the page loads completely, all conversion functionality works offline without requiring an internet connection. The tool runs entirely in your browser, making it reliable for secure environments.
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
                <p className="text-gray-600 mb-8">Our hexadecimal to text converter is built with modern web technologies to ensure optimal performance, compatibility, and reliability across all major platforms and devices.</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">Supported Formats & Ranges</h3>
                    <div className="space-y-4">
                      <div className="bg-blue-50 rounded-lg p-4">
                        <h4 className="font-semibold text-blue-900 mb-2">Hexadecimal Input Specifications</h4>
                        <ul className="text-blue-800 text-sm space-y-1">
                          <li>• Range: 0x00 to 0x10FFFF (Unicode full range)</li>
                          <li>• ASCII Mode: 0x00-0x7F (higher values become '?')</li>
                          <li>• Formats: Space-separated, compact, 0x-prefixed</li>
                          <li>• Validation: Real-time input checking and error detection</li>
                        </ul>
                      </div>
                      <div className="bg-green-50 rounded-lg p-4">
                        <h4 className="font-semibold text-green-900 mb-2">Output Capabilities</h4>
                        <ul className="text-green-800 text-sm space-y-1">
                          <li>• Primary: Decoded text output with formatting</li>
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

export default HexToTextConverter;
