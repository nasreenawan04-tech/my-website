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

  const bytesToBinary = (bytes: Uint8Array, spacing: string = 'space'): string => {
    if (bytes.length === 0) return '';
    
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

  const bytesToDecimal = (bytes: Uint8Array, spacing: string = 'space'): string => {
    if (bytes.length === 0) return '';
    
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

  const convertHex = () => {
    if (!inputHex.trim()) {
      setConversionResult(null);
      setShowResults(false);
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

      const binary = bytesToBinary(bytes, 'space');
      const decimal = bytesToDecimal(bytes, 'space');
      
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
    setOptions({
      encoding: 'utf8',
      inputFormat: 'spaced',
      showBinary: false,
      showDecimal: false,
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

  const outputTypes = [
    { key: 'text', label: 'Decoded Text', bgColor: 'bg-blue-50', borderColor: 'border-blue-200' },
    { key: 'binary', label: 'Binary Values', bgColor: 'bg-green-50', borderColor: 'border-green-200' },
    { key: 'decimal', label: 'Decimal Values', bgColor: 'bg-purple-50', borderColor: 'border-purple-200' }
  ];

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
                Convert hexadecimal values back to readable text instantly with multiple format support
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
                    <p className="text-gray-600">Enter hexadecimal values to decode back to readable text</p>
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
                          <SelectItem value="spaced">Space-separated (48 65 6C 6C 6F)</SelectItem>
                          <SelectItem value="compact">Compact string (48656C6C6F)</SelectItem>
                          <SelectItem value="prefixed">0x prefixed (0x48 0x65)</SelectItem>
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
                <div className="bg-gradient-to-br from-gray-50 to-blue-50 p-4 sm:p-6 md:p-8 lg:p-10 xl:p-12 border-t">
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6 sm:mb-8">Decoded Results</h2>

                  {conversionResult && showResults ? (
                    <div className="space-y-3 sm:space-y-4" data-testid="conversion-results">
                      {/* Main Decoded Text Display */}
                      <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-3 sm:p-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4 mb-2">
                          <h3 className="text-base sm:text-lg font-semibold text-blue-900">Decoded Text</h3>
                          <Button
                            onClick={() => handleCopyToClipboard(conversionResult.text)}
                            variant="outline"
                            size="sm"
                            className="self-start sm:self-auto border-blue-300 text-blue-700 hover:bg-blue-100 text-xs sm:text-sm"
                            data-testid="button-copy-text"
                          >
                            Copy Text
                          </Button>
                        </div>
                        <div className="bg-white rounded-lg p-3 sm:p-4 text-gray-900 font-mono text-sm sm:text-base word-wrap break-words max-h-40 sm:max-h-48 overflow-y-auto" data-testid="text-decoded-text">
                          {conversionResult.text || 'No output generated'}
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
                            <span className="ml-1 text-gray-900" data-testid="text-format">{options.inputFormat}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 sm:py-12 text-gray-500">
                      <p className="text-base sm:text-lg">Enter hexadecimal values above to see the decoded text results</p>
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
                          onClick={() => setInputHex(item.originalInput)}
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
                          <span className="ml-2 text-xs text-gray-900 font-mono break-all">{item.originalInput.slice(0, 100)}{item.originalInput.length > 100 ? '...' : ''}</span>
                        </div>
                        <div>
                          <span className="text-xs font-medium text-gray-700">Output:</span>
                          <span className="ml-2 text-xs text-gray-900">{item.text.slice(0, 100)}{item.text.length > 100 ? '...' : ''}</span>
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
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">How to Use the Hex to Text Converter</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                <div className="space-y-3 sm:space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800">Basic Steps:</h3>
                  <ol className="list-decimal list-inside space-y-1 sm:space-y-2 text-gray-700 text-sm sm:text-base">
                    <li>Choose your input format (spaced, compact, or prefixed)</li>
                    <li>Select character encoding (UTF-8 or ASCII)</li>
                    <li>Paste or type hexadecimal values</li>
                    <li>Click "Convert to Text" to decode</li>
                    <li>Copy the decoded text result</li>
                  </ol>
                </div>
                <div className="space-y-3 sm:space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800">Supported Formats:</h3>
                  <ul className="list-disc list-inside space-y-1 sm:space-y-2 text-gray-700 text-sm sm:text-base">
                    <li><strong>Space-separated:</strong> 48 65 6C 6C 6F</li>
                    <li><strong>Compact:</strong> 48656C6C6F</li>
                    <li><strong>Prefixed:</strong> 0x48 0x65 0x6C</li>
                    <li><strong>Mixed:</strong> Automatic detection</li>
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

export default HexToTextConverter;