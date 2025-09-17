
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
  inputFormat: 'binary' | 'decimal' | 'hex';
  showBinary: boolean;
  showDecimal: boolean;
  showHex: boolean;
  preserveSpaces: boolean;
  addPrefix: string;
  addSuffix: string;
}

interface ConversionResult {
  originalInput: string;
  text: string;
  binary: string;
  decimal: string;
  hexadecimal: string;
  charCount: number;
  byteCount: number;
  timestamp: Date;
}

const BinaryToTextConverter = () => {
  const [inputCode, setInputCode] = useState('');
  const [conversionResult, setConversionResult] = useState<ConversionResult | null>(null);
  const [conversionHistory, setConversionHistory] = useState<ConversionResult[]>([]);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [options, setOptions] = useState<ConversionOptions>({
    encoding: 'utf8',
    inputFormat: 'binary',
    showBinary: true,
    showDecimal: false,
    showHex: false,
    preserveSpaces: false,
    addPrefix: '',
    addSuffix: ''
  });

  const binaryToText = (binary: string, encoding: 'utf8' | 'ascii' = 'utf8'): string => {
    if (!binary) return '';
    
    try {
      // Remove all whitespace and special characters, keep only 0s and 1s
      const cleanBinary = binary.replace(/[^01]/g, '');
      
      // Check if binary string length is divisible by 8
      if (cleanBinary.length % 8 !== 0) {
        throw new Error('Binary string length must be divisible by 8');
      }
      
      let text = '';
      for (let i = 0; i < cleanBinary.length; i += 8) {
        const binaryChar = cleanBinary.slice(i, i + 8);
        const charCode = parseInt(binaryChar, 2);
        
        // For ASCII encoding, check if character is in valid range
        if (encoding === 'ascii' && charCode > 127) {
          text += '?'; // Replace invalid ASCII with ?
        } else {
          text += String.fromCharCode(charCode);
        }
      }
      
      return text;
    } catch (error) {
      throw new Error('Invalid binary input');
    }
  };

  const decimalToText = (decimal: string): string => {
    if (!decimal) return '';
    
    try {
      // Split by spaces and filter out empty strings
      const decimalValues = decimal.trim().split(/\s+/).filter(val => val.length > 0);
      
      let text = '';
      for (const value of decimalValues) {
        const charCode = parseInt(value, 10);
        if (isNaN(charCode) || charCode < 0 || charCode > 1114111) {
          throw new Error('Invalid decimal value');
        }
        text += String.fromCharCode(charCode);
      }
      
      return text;
    } catch (error) {
      throw new Error('Invalid decimal input');
    }
  };

  const hexToText = (hex: string): string => {
    if (!hex) return '';
    
    try {
      // Remove spaces and common hex prefixes
      const cleanHex = hex.replace(/[^0-9A-Fa-f]/g, '');
      
      // Check if hex string length is even
      if (cleanHex.length % 2 !== 0) {
        throw new Error('Hex string length must be even');
      }
      
      let text = '';
      for (let i = 0; i < cleanHex.length; i += 2) {
        const hexChar = cleanHex.slice(i, i + 2);
        const charCode = parseInt(hexChar, 16);
        text += String.fromCharCode(charCode);
      }
      
      return text;
    } catch (error) {
      throw new Error('Invalid hexadecimal input');
    }
  };

  const textToBinary = (text: string): string => {
    if (!text) return '';
    
    return text.split('').map(char => {
      return char.charCodeAt(0).toString(2).padStart(8, '0');
    }).join(' ');
  };

  const textToDecimal = (text: string): string => {
    if (!text) return '';
    
    return text.split('').map(char => char.charCodeAt(0)).join(' ');
  };

  const textToHex = (text: string): string => {
    if (!text) return '';
    
    return text.split('').map(char => {
      const hex = char.charCodeAt(0).toString(16).toUpperCase();
      return hex.length === 1 ? '0' + hex : hex;
    }).join(' ');
  };

  const convertCode = () => {
    if (!inputCode.trim()) {
      setConversionResult(null);
      return;
    }

    try {
      let text = '';
      
      switch (options.inputFormat) {
        case 'binary':
          text = binaryToText(inputCode, options.encoding);
          break;
        case 'decimal':
          text = decimalToText(inputCode);
          break;
        case 'hex':
          text = hexToText(inputCode);
          break;
        default:
          text = '';
      }

      // Apply prefix and suffix if provided
      if (options.addPrefix || options.addSuffix) {
        text = `${options.addPrefix}${text}${options.addSuffix}`;
      }

      const binary = textToBinary(text);
      const decimal = textToDecimal(text);
      const hexadecimal = textToHex(text);
      
      const result: ConversionResult = {
        originalInput: inputCode,
        text,
        binary,
        decimal,
        hexadecimal,
        charCount: text.length,
        byteCount: new Blob([text]).size,
        timestamp: new Date()
      };

      setConversionResult(result);

      // Add to history (keep last 10)
      setConversionHistory(prev => {
        const updated = [result, ...prev.filter(item => item.originalInput !== inputCode)];
        return updated.slice(0, 10);
      });
    } catch (error) {
      // Handle conversion errors - show user-friendly message
      setConversionResult(null);
    }
  };

  const updateOption = <K extends keyof ConversionOptions>(key: K, value: ConversionOptions[K]) => {
    setOptions(prev => ({ ...prev, [key]: value }));
  };

  const handleCopyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const handleClear = () => {
    setInputCode('');
    setConversionResult(null);
  };

  const handleSampleCode = () => {
    switch (options.inputFormat) {
      case 'binary':
        setInputCode('01001000 01100101 01101100 01101100 01101111 00100000 01010111 01101111 01110010 01101100 01100100 00100001');
        break;
      case 'decimal':
        setInputCode('72 101 108 108 111 32 87 111 114 108 100 33');
        break;
      case 'hex':
        setInputCode('48 65 6C 6C 6F 20 57 6F 72 6C 64 21');
        break;
    }
  };

  const resetConverter = () => {
    setInputCode('');
    setConversionResult(null);
    setShowAdvanced(false);
    setOptions({
      encoding: 'utf8',
      inputFormat: 'binary',
      showBinary: true,
      showDecimal: false,
      showHex: false,
      preserveSpaces: false,
      addPrefix: '',
      addSuffix: ''
    });
  };

  // Auto-convert when code or options change
  useEffect(() => {
    if (inputCode.trim()) {
      const timeoutId = setTimeout(() => {
        convertCode();
      }, 300);
      
      return () => clearTimeout(timeoutId);
    } else {
      setConversionResult(null);
    }
  }, [inputCode, options]);

  const getInputFormatLabel = () => {
    switch (options.inputFormat) {
      case 'binary': return 'Binary Code (0s and 1s)';
      case 'decimal': return 'Decimal Values (space-separated)';
      case 'hex': return 'Hexadecimal Values (space-separated)';
      default: return 'Code Input';
    }
  };

  const getInputPlaceholder = () => {
    switch (options.inputFormat) {
      case 'binary': return '01001000 01100101 01101100 01101100 01101111...';
      case 'decimal': return '72 101 108 108 111 32 87...';
      case 'hex': return '48 65 6C 6C 6F 20 57...';
      default: return 'Enter code here...';
    }
  };

  const outputTypes = [
    { key: 'text', label: 'Decoded Text', bgColor: 'bg-blue-50', borderColor: 'border-blue-200' },
    { key: 'binary', label: 'Binary Code', bgColor: 'bg-yellow-50', borderColor: 'border-yellow-200' },
    { key: 'decimal', label: 'Decimal Values', bgColor: 'bg-green-50', borderColor: 'border-green-200' },
    { key: 'hexadecimal', label: 'Hexadecimal Values', bgColor: 'bg-purple-50', borderColor: 'border-purple-200' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Helmet>
        <title>Binary to Text Converter - Decode Binary Code to Text | DapsiWow</title>
        <meta name="description" content="Free binary to text converter tool. Decode binary code, decimal values, and hexadecimal to readable text instantly. Supports UTF-8 and ASCII encoding for students, developers, and professionals." />
        <meta name="keywords" content="binary to text converter, binary decoder, ASCII to text, UTF-8 converter, hex to text, decimal to text, binary code converter, programming tools, computer science, data encoding, text decoding, online binary converter" />
        <meta property="og:title" content="Binary to Text Converter - Decode Binary Code to Text | DapsiWow" />
        <meta property="og:description" content="Free online binary to text converter. Decode binary, decimal, and hex codes to readable text. Perfect for students, developers, and cybersecurity professionals." />
        <meta property="og:type" content="website" />
        <meta name="robots" content="index, follow" />
        <meta name="author" content="DapsiWow" />
        <link rel="canonical" href="https://dapsiwow.com/tools/binary-to-text-converter" />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            "name": "Binary to Text Converter",
            "description": "Professional binary to text converter for decoding binary code, decimal values, and hexadecimal to readable text with UTF-8 and ASCII encoding support.",
            "url": "https://dapsiwow.com/tools/binary-to-text-converter",
            "applicationCategory": "DeveloperApplication",
            "operatingSystem": "Any",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "USD"
            },
            "featureList": [
              "Binary to text conversion",
              "Decimal to text conversion",
              "Hexadecimal to text conversion",
              "UTF-8 and ASCII encoding support",
              "Real-time conversion",
              "Copy to clipboard functionality"
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
                Binary to Text
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                  Converter
                </span>
              </h1>
              <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-slate-600 max-w-4xl mx-auto leading-relaxed px-2">
                Decode binary code, decimal values, and hexadecimal back to readable text instantly
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
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">Binary Decoder</h2>
                    <p className="text-gray-600">Enter binary code, decimal values, or hexadecimal to decode text</p>
                  </div>

                  <div className="space-y-4 sm:space-y-6">
                    {/* Input Format Selection */}
                    <div className="space-y-3">
                      <Label htmlFor="format-select" className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                        Input Format
                      </Label>
                      <Select
                        value={options.inputFormat}
                        onValueChange={(value: 'binary' | 'decimal' | 'hex') => 
                          updateOption('inputFormat', value)
                        }
                      >
                        <SelectTrigger className="h-12 sm:h-14 border-2 border-gray-200 rounded-xl text-base sm:text-lg" data-testid="select-input-format">
                          <SelectValue placeholder="Select format" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="binary">Binary (0s and 1s)</SelectItem>
                          <SelectItem value="decimal">Decimal Values</SelectItem>
                          <SelectItem value="hex">Hexadecimal Values</SelectItem>
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

                    {/* Code Input */}
                    <div className="space-y-3">
                      <Label htmlFor="code-input" className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                        {getInputFormatLabel()}
                      </Label>
                      <Textarea
                        id="code-input"
                        value={inputCode}
                        onChange={(e) => setInputCode(e.target.value)}
                        className="min-h-[100px] sm:min-h-[120px] lg:min-h-[140px] text-base sm:text-lg border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-blue-500 font-mono resize-none"
                        placeholder={getInputPlaceholder()}
                        data-testid="textarea-code-input"
                      />
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
                                <Label className="text-xs sm:text-sm font-medium">Show Hexadecimal Output</Label>
                                <p className="text-xs text-gray-500">Display hexadecimal representation of result</p>
                              </div>
                              <Switch
                                checked={options.showHex}
                                onCheckedChange={(value) => updateOption('showHex', value)}
                                data-testid="switch-show-hex"
                              />
                            </div>

                            <div className="flex items-center justify-between gap-2">
                              <div className="space-y-1 flex-1 min-w-0">
                                <Label className="text-xs sm:text-sm font-medium">Preserve Spaces</Label>
                                <p className="text-xs text-gray-500">Keep original spacing in output</p>
                              </div>
                              <Switch
                                checked={options.preserveSpaces}
                                onCheckedChange={(value) => updateOption('preserveSpaces', value)}
                                data-testid="switch-preserve-spaces"
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
                      onClick={convertCode}
                      disabled={!inputCode.trim()}
                      className="flex-1 h-12 sm:h-14 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold text-base sm:text-lg rounded-xl shadow-lg transform transition-all duration-200 hover:scale-105"
                      data-testid="button-convert"
                    >
                      Convert to Text
                    </Button>
                    <Button
                      onClick={handleSampleCode}
                      variant="outline"
                      className="h-12 sm:h-14 px-6 sm:px-8 border-2 border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold text-base sm:text-lg rounded-xl"
                      data-testid="button-sample-code"
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
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6 sm:mb-8">Decoded Results</h2>

                  {conversionResult && conversionResult.originalInput ? (
                    <div className="space-y-3 sm:space-y-4" data-testid="conversion-results">
                      {/* Main Decoded Text Display */}
                      <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-3 sm:p-4">
                        <div className="flex items-center justify-between mb-3 gap-3">
                          <div className="flex-1 min-w-0">
                            <h3 className="text-sm sm:text-base font-semibold text-gray-900 truncate">Decoded Text</h3>
                            <p className="text-xs sm:text-sm text-gray-600 break-words">Human-readable text output</p>
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
                        <div className="bg-green-50 border-2 border-green-200 rounded-xl p-3 sm:p-4">
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

                      {options.showHex && (
                        <div className="bg-purple-50 border-2 border-purple-200 rounded-xl p-3 sm:p-4">
                          <div className="flex items-center justify-between mb-3 gap-3">
                            <div className="flex-1 min-w-0">
                              <h4 className="text-sm sm:text-base font-semibold text-gray-900 truncate">Hexadecimal Values</h4>
                              <p className="text-xs sm:text-sm text-gray-600 break-words">Hexadecimal character codes</p>
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
                            {conversionResult.hexadecimal}
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
                        <div className="text-2xl sm:text-3xl font-bold text-gray-400">01</div>
                      </div>
                      <p className="text-gray-500 text-base sm:text-lg px-4">Enter binary, decimal, or hex code to decode text</p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* SEO Content Sections */}
          <div className="mt-16 space-y-8">
            {/* What is Binary to Text Conversion */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">What is Binary to Text Conversion?</h2>
                <div className="space-y-4 text-gray-600">
                  <p>
                    <strong>Binary to text conversion</strong> is the fundamental process of transforming binary code (sequences of 0s and 1s), decimal values, or hexadecimal codes back into human-readable text. This essential computer science concept bridges the gap between machine language and human communication, making digital data accessible and understandable to users across all technical skill levels.
                  </p>
                  <p>
                    Our professional binary decoder supports multiple input formats including pure binary code, decimal character values, and hexadecimal representations. With comprehensive UTF-8 and ASCII encoding options, you can decode any text data that was previously converted to binary format, making it perfect for educational purposes, programming projects, debugging applications, and cybersecurity analysis.
                  </p>
                  <p>
                    The tool features real-time conversion as you type, advanced customization options including prefix and suffix support, and intelligent text processing that handles special characters, numbers, and international Unicode characters appropriately for each encoding system.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Input Format Guide */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Binary to Text Conversion Guide</h2>
                <p className="text-gray-600 mb-8">Understanding different input formats and their proper usage is crucial for successful binary to text conversion. Our converter supports three primary input formats, each with specific formatting requirements and use cases.</p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-800">Binary Input Format</h3>
                    <p className="text-gray-600 text-sm">
                      Input binary code as sequences of 0s and 1s. Each character is represented by exactly 8 bits (1 byte). Spaces between bytes are optional but improve readability and help prevent input errors.
                    </p>
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h4 className="font-medium text-blue-900 mb-2">Example Input:</h4>
                      <code className="text-xs font-mono text-blue-800 block mb-2">01001000 01100101 01101100 01101100 01101111</code>
                      <div className="text-xs text-blue-600 font-medium">Decoded Result: "Hello"</div>
                    </div>
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <h5 className="font-medium text-blue-900 mb-1 text-sm">Key Requirements:</h5>
                      <ul className="text-xs text-blue-800 space-y-1">
                        <li>• Must contain only 0s and 1s</li>
                        <li>• Total length divisible by 8</li>
                        <li>• Spaces and formatting ignored</li>
                      </ul>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-800">Decimal Input Format</h3>
                    <p className="text-gray-600 text-sm">
                      Input decimal values (0-255 for ASCII, 0-1114111 for Unicode) separated by spaces. Each number represents one character's ASCII or Unicode code point value.
                    </p>
                    <div className="bg-green-50 p-4 rounded-lg">
                      <h4 className="font-medium text-green-900 mb-2">Example Input:</h4>
                      <code className="text-xs font-mono text-green-800 block mb-2">72 101 108 108 111</code>
                      <div className="text-xs text-green-600 font-medium">Decoded Result: "Hello"</div>
                    </div>
                    <div className="bg-green-50 p-3 rounded-lg">
                      <h5 className="font-medium text-green-900 mb-1 text-sm">Key Requirements:</h5>
                      <ul className="text-xs text-green-800 space-y-1">
                        <li>• Numbers separated by spaces</li>
                        <li>• ASCII: 0-127 range</li>
                        <li>• Unicode: 0-1114111 range</li>
                      </ul>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-800">Hexadecimal Input Format</h3>
                    <p className="text-gray-600 text-sm">
                      Input hexadecimal values (00-FF) separated by spaces. Each pair of hex digits represents one byte, which translates to one character in the output text.
                    </p>
                    <div className="bg-purple-50 p-4 rounded-lg">
                      <h4 className="font-medium text-purple-900 mb-2">Example Input:</h4>
                      <code className="text-xs font-mono text-purple-800 block mb-2">48 65 6C 6C 6F</code>
                      <div className="text-xs text-purple-600 font-medium">Decoded Result: "Hello"</div>
                    </div>
                    <div className="bg-purple-50 p-3 rounded-lg">
                      <h5 className="font-medium text-purple-900 mb-1 text-sm">Key Requirements:</h5>
                      <ul className="text-xs text-purple-800 space-y-1">
                        <li>• Hex pairs separated by spaces</li>
                        <li>• Valid characters: 0-9, A-F</li>
                        <li>• Case insensitive input</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Encoding Comparison and Use Cases */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
                <CardContent className="p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">UTF-8 vs ASCII Encoding</h2>
                  <p className="text-gray-600 mb-6">Understanding character encoding is essential for accurate binary to text conversion. Choose the right encoding based on your data source and requirements.</p>
                  
                  <div className="space-y-6">
                    <div className="bg-blue-50 rounded-lg p-4">
                      <h3 className="font-semibold text-blue-900 mb-3">UTF-8 Encoding</h3>
                      <p className="text-blue-800 text-sm mb-3">
                        UTF-8 is a variable-width encoding that can represent any Unicode character using 1-4 bytes. It supports international characters, emojis, special symbols, and all languages worldwide.
                      </p>
                      <div className="space-y-2">
                        <h4 className="font-medium text-blue-900 text-sm">Best for:</h4>
                        <ul className="text-xs text-blue-700 space-y-1">
                          <li>• Modern web applications and websites</li>
                          <li>• International text and multilingual content</li>
                          <li>• Unicode characters and emojis</li>
                          <li>• Contemporary software development</li>
                        </ul>
                      </div>
                    </div>

                    <div className="bg-orange-50 rounded-lg p-4">
                      <h3 className="font-semibold text-orange-900 mb-3">ASCII Encoding</h3>
                      <p className="text-orange-800 text-sm mb-3">
                        ASCII uses exactly 7 bits to represent 128 characters (0-127), including English letters, numbers, punctuation, and basic control characters. Limited to basic English text.
                      </p>
                      <div className="space-y-2">
                        <h4 className="font-medium text-orange-900 text-sm">Best for:</h4>
                        <ul className="text-xs text-orange-700 space-y-1">
                          <li>• Legacy systems and older software</li>
                          <li>• Basic English-only text processing</li>
                          <li>• Embedded systems with memory constraints</li>
                          <li>• Protocol specifications and standards</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
                <CardContent className="p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Who Uses Binary to Text Converters?</h2>
                  <p className="text-gray-600 mb-6">Binary to text conversion tools serve diverse professionals and students across multiple industries and educational fields.</p>
                  
                  <div className="space-y-4">
                    <div className="bg-green-50 rounded-lg p-4">
                      <h3 className="font-semibold text-green-900 mb-2">Software Developers & Engineers</h3>
                      <p className="text-green-800 text-sm">Debug binary data streams, analyze network protocols, reverse engineer file formats, and understand low-level data structures in applications.</p>
                    </div>
                    
                    <div className="bg-purple-50 rounded-lg p-4">
                      <h3 className="font-semibold text-purple-900 mb-2">Cybersecurity Professionals</h3>
                      <p className="text-purple-800 text-sm">Decode encoded messages, analyze malware payloads, forensic data recovery, and investigate digital evidence in security incidents.</p>
                    </div>
                    
                    <div className="bg-blue-50 rounded-lg p-4">
                      <h3 className="font-semibold text-blue-900 mb-2">Computer Science Students</h3>
                      <p className="text-blue-800 text-sm">Learn fundamental computer concepts, understand data representation, practice encoding algorithms, and complete programming assignments.</p>
                    </div>
                    
                    <div className="bg-yellow-50 rounded-lg p-4">
                      <h3 className="font-semibold text-yellow-900 mb-2">Digital Forensics Specialists</h3>
                      <p className="text-yellow-800 text-sm">Recover hidden data, analyze file signatures, decode obfuscated content, and extract readable information from binary evidence.</p>
                    </div>

                    <div className="bg-teal-50 rounded-lg p-4">
                      <h3 className="font-semibold text-teal-900 mb-2">Network Administrators</h3>
                      <p className="text-teal-800 text-sm">Troubleshoot network protocols, analyze packet captures, decode configuration data, and interpret system logs and binary outputs.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Advanced Features and Best Practices */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Advanced Features & Conversion Best Practices</h2>
                <p className="text-gray-600 mb-8">Maximize the effectiveness of binary to text conversion with our advanced features and follow industry best practices for accurate results.</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">Advanced Features</h3>
                    <div className="space-y-4">
                      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-400 p-4 rounded-r-lg">
                        <h4 className="font-semibold text-blue-900 mb-2">Real-Time Conversion</h4>
                        <p className="text-blue-800 text-sm">Automatic decoding as you type with 300ms debouncing for optimal performance and immediate feedback on input validity.</p>
                      </div>
                      <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-l-4 border-green-400 p-4 rounded-r-lg">
                        <h4 className="font-semibold text-green-900 mb-2">Multiple Output Formats</h4>
                        <p className="text-green-800 text-sm">View results in decoded text, binary, decimal, and hexadecimal formats simultaneously with customizable display options.</p>
                      </div>
                      <div className="bg-gradient-to-r from-purple-50 to-violet-50 border-l-4 border-purple-400 p-4 rounded-r-lg">
                        <h4 className="font-semibold text-purple-900 mb-2">Text Customization</h4>
                        <p className="text-purple-800 text-sm">Add custom prefixes and suffixes to decoded output for specific formatting requirements and workflow integration.</p>
                      </div>
                      <div className="bg-gradient-to-r from-orange-50 to-red-50 border-l-4 border-orange-400 p-4 rounded-r-lg">
                        <h4 className="font-semibold text-orange-900 mb-2">Privacy & Security</h4>
                        <p className="text-orange-800 text-sm">All processing happens locally in your browser - no data transmitted to servers, ensuring complete privacy and security.</p>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">Best Practices</h3>
                    <div className="space-y-4">
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h4 className="font-semibold text-gray-900 mb-2">Input Validation</h4>
                        <ul className="text-gray-700 text-sm space-y-1">
                          <li>• Verify input format matches selected type</li>
                          <li>• Check binary strings are divisible by 8</li>
                          <li>• Validate decimal values within encoding range</li>
                          <li>• Ensure hex strings have even length</li>
                        </ul>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h4 className="font-semibold text-gray-900 mb-2">Encoding Selection</h4>
                        <ul className="text-gray-700 text-sm space-y-1">
                          <li>• Use UTF-8 for modern applications</li>
                          <li>• Choose ASCII for legacy systems</li>
                          <li>• Consider source data characteristics</li>
                          <li>• Test with sample data first</li>
                        </ul>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h4 className="font-semibold text-gray-900 mb-2">Quality Assurance</h4>
                        <ul className="text-gray-700 text-sm space-y-1">
                          <li>• Verify output makes logical sense</li>
                          <li>• Cross-reference with original source</li>
                          <li>• Use sample data to test functionality</li>
                          <li>• Double-check critical conversions</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Common Use Cases and Applications */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Common Use Cases & Professional Applications</h2>
                <p className="text-gray-600 mb-8">Binary to text conversion serves critical functions across numerous professional domains and educational contexts. Understanding these applications helps you leverage the tool effectively for your specific needs.</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="bg-blue-50 rounded-lg p-6">
                    <h3 className="font-semibold text-blue-900 mb-4">Software Development</h3>
                    <ul className="text-blue-800 text-sm space-y-2">
                      <li>• Debugging binary data structures</li>
                      <li>• Analyzing file format specifications</li>
                      <li>• Reverse engineering protocols</li>
                      <li>• Testing serialization/deserialization</li>
                      <li>• Memory dump analysis</li>
                      <li>• API response debugging</li>
                    </ul>
                  </div>

                  <div className="bg-green-50 rounded-lg p-6">
                    <h3 className="font-semibold text-green-900 mb-4">Cybersecurity & Forensics</h3>
                    <ul className="text-green-800 text-sm space-y-2">
                      <li>• Malware payload analysis</li>
                      <li>• Encoded message decryption</li>
                      <li>• Digital evidence recovery</li>
                      <li>• Network traffic inspection</li>
                      <li>• Steganography detection</li>
                      <li>• Incident response investigation</li>
                    </ul>
                  </div>

                  <div className="bg-purple-50 rounded-lg p-6">
                    <h3 className="font-semibold text-purple-900 mb-4">Education & Research</h3>
                    <ul className="text-purple-800 text-sm space-y-2">
                      <li>• Computer science fundamentals</li>
                      <li>• Data representation concepts</li>
                      <li>• Algorithm implementation</li>
                      <li>• Programming assignments</li>
                      <li>• Encoding/decoding exercises</li>
                      <li>• Academic research projects</li>
                    </ul>
                  </div>

                  <div className="bg-orange-50 rounded-lg p-6">
                    <h3 className="font-semibold text-orange-900 mb-4">System Administration</h3>
                    <ul className="text-orange-800 text-sm space-y-2">
                      <li>• Log file analysis</li>
                      <li>• Configuration data decoding</li>
                      <li>• System diagnostic tools</li>
                      <li>• Database troubleshooting</li>
                      <li>• Binary configuration files</li>
                      <li>• Error message interpretation</li>
                    </ul>
                  </div>

                  <div className="bg-teal-50 rounded-lg p-6">
                    <h3 className="font-semibold text-teal-900 mb-4">Data Recovery & Migration</h3>
                    <ul className="text-teal-800 text-sm space-y-2">
                      <li>• Corrupted file recovery</li>
                      <li>• Legacy data conversion</li>
                      <li>• Archive file extraction</li>
                      <li>• Backup data verification</li>
                      <li>• Format migration projects</li>
                      <li>• Data integrity validation</li>
                    </ul>
                  </div>

                  <div className="bg-red-50 rounded-lg p-6">
                    <h3 className="font-semibold text-red-900 mb-4">Quality Assurance & Testing</h3>
                    <ul className="text-red-800 text-sm space-y-2">
                      <li>• Binary output verification</li>
                      <li>• Data transmission testing</li>
                      <li>• Encoding accuracy validation</li>
                      <li>• Cross-platform compatibility</li>
                      <li>• Performance benchmarking</li>
                      <li>• Integration testing support</li>
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
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">What is binary to text conversion?</h3>
                      <p className="text-gray-600 text-sm">
                        Binary to text conversion transforms binary code (0s and 1s), decimal values, or hexadecimal codes back into human-readable text. Each 8-bit binary sequence represents one character according to ASCII or Unicode standards, allowing computers' machine language to be translated into readable content.
                      </p>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Which encoding should I choose for my data?</h3>
                      <p className="text-gray-600 text-sm">
                        Use UTF-8 for modern applications, websites, and international text support. Choose ASCII only for legacy systems or when working exclusively with basic English characters (0-127). UTF-8 is backward compatible with ASCII and supports all Unicode characters.
                      </p>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Can I convert other number systems besides binary?</h3>
                      <p className="text-gray-600 text-sm">
                        Yes, our converter supports binary (base-2), decimal (base-10), and hexadecimal (base-16) input formats. Simply select your input format from the dropdown menu, and the tool will decode it to readable text using the appropriate conversion algorithm.
                      </p>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Is there a character limit for conversion?</h3>
                      <p className="text-gray-600 text-sm">
                        There's no strict character limit, but very large inputs may take longer to process due to browser memory constraints. The tool displays character and byte counts to help you monitor input size and processing performance.
                      </p>
                    </div>
                  </div>
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Why do I get invalid input errors?</h3>
                      <p className="text-gray-600 text-sm">
                        Invalid input errors occur when binary strings aren't divisible by 8 bits, decimal values exceed encoding ranges, or hex strings have odd lengths. Verify your input format matches the selected type and meets the specific formatting requirements.
                      </p>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">How secure is this binary converter?</h3>
                      <p className="text-gray-600 text-sm">
                        Completely secure! All conversion processing happens locally in your browser using client-side JavaScript. No data is transmitted to servers, stored remotely, or accessed by third parties, ensuring complete privacy and confidentiality.
                      </p>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Can I customize the output format?</h3>
                      <p className="text-gray-600 text-sm">
                        Yes! Advanced options include custom prefixes and suffixes for decoded text, display toggles for different format outputs (binary, decimal, hex), and preservation options for spacing and formatting in the results.
                      </p>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Does this work offline after loading?</h3>
                      <p className="text-gray-600 text-sm">
                        Yes! Once the page loads completely, all conversion functionality works offline without requiring an internet connection. The tool runs entirely in your browser, making it reliable for secure environments and unstable connections.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Technical Specifications and Compatibility */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Technical Specifications & Browser Compatibility</h2>
                <p className="text-gray-600 mb-8">Our binary to text converter is built with modern web technologies to ensure compatibility, performance, and reliability across all major platforms and devices.</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">Supported Formats & Ranges</h3>
                    <div className="space-y-4">
                      <div className="bg-blue-50 rounded-lg p-4">
                        <h4 className="font-semibold text-blue-900 mb-2">Binary Input</h4>
                        <ul className="text-blue-800 text-sm space-y-1">
                          <li>• Format: 8-bit sequences (bytes)</li>
                          <li>• Characters: 0 and 1 only</li>
                          <li>• Length: Must be divisible by 8</li>
                          <li>• Separators: Spaces ignored</li>
                        </ul>
                      </div>
                      <div className="bg-green-50 rounded-lg p-4">
                        <h4 className="font-semibold text-green-900 mb-2">Decimal Input</h4>
                        <ul className="text-green-800 text-sm space-y-1">
                          <li>• ASCII Range: 0-127</li>
                          <li>• Unicode Range: 0-1,114,111</li>
                          <li>• Format: Space-separated values</li>
                          <li>• Validation: Automatic range checking</li>
                        </ul>
                      </div>
                      <div className="bg-purple-50 rounded-lg p-4">
                        <h4 className="font-semibold text-purple-900 mb-2">Hexadecimal Input</h4>
                        <ul className="text-purple-800 text-sm space-y-1">
                          <li>• Format: Two-digit pairs (bytes)</li>
                          <li>• Characters: 0-9, A-F (case insensitive)</li>
                          <li>• Range: 00-FF per pair</li>
                          <li>• Separators: Spaces recommended</li>
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
                          <li>• Chrome 90+ (recommended)</li>
                          <li>• Firefox 88+ (excellent support)</li>
                          <li>• Safari 14+ (full compatibility)</li>
                          <li>• Edge 90+ (optimal performance)</li>
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
                        <h4 className="font-semibold text-gray-900 mb-2">Performance Features</h4>
                        <ul className="text-gray-700 text-sm space-y-1">
                          <li>• Real-time conversion (300ms debounce)</li>
                          <li>• Client-side processing (no server calls)</li>
                          <li>• Responsive design (all screen sizes)</li>
                          <li>• Accessibility compliant (WCAG 2.1)</li>
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

export default BinaryToTextConverter;
