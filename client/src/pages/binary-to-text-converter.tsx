
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

interface ConversionOptions {
  encoding: 'utf8' | 'ascii';
  inputFormat: 'binary' | 'decimal' | 'hex';
  showBinary: boolean;
  showDecimal: boolean;
  showHex: boolean;
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
  const [options, setOptions] = useState<ConversionOptions>({
    encoding: 'utf8',
    inputFormat: 'binary',
    showBinary: true,
    showDecimal: true,
    showHex: true
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
    setOptions({
      encoding: 'utf8',
      inputFormat: 'binary',
      showBinary: true,
      showDecimal: true,
      showHex: true
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
        <section className="relative py-20 sm:py-28 lg:py-32 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-indigo-600/20"></div>
          <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="space-y-8">
              <div className="inline-flex items-center px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full border border-blue-200">
                <span className="text-sm font-medium text-blue-700">Professional Decoder Tool</span>
              </div>
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-slate-900 leading-tight">
                Binary to Text
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                  Converter
                </span>
              </h1>
              <p className="text-xl sm:text-2xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
                Decode binary code, decimal values, and hexadecimal back to readable text
              </p>
            </div>
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-4 py-16">
          {/* Main Converter Card */}
          <Card className="bg-white/90 backdrop-blur-sm shadow-2xl border-0 rounded-3xl overflow-hidden">
            <CardContent className="p-0">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
                {/* Input Section */}
                <div className="p-8 lg:p-12 space-y-8">
                  <div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">Conversion Settings</h2>
                    <p className="text-gray-600">Configure your input format and encoding options</p>
                  </div>

                  <div className="space-y-6">
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
                        <SelectTrigger className="h-14 border-2 border-gray-200 rounded-xl text-lg" data-testid="select-input-format">
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
                        <SelectTrigger className="h-14 border-2 border-gray-200 rounded-xl text-lg" data-testid="select-encoding">
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
                        className="h-32 text-lg border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-blue-500 font-mono"
                        placeholder={getInputPlaceholder()}
                        data-testid="textarea-code-input"
                      />
                    </div>

                    {/* Display Options */}
                    <div className="space-y-4 bg-gray-50 rounded-xl p-6">
                      <h3 className="text-sm font-semibold text-gray-800 uppercase tracking-wide">Display Options</h3>
                      <div className="grid grid-cols-1 gap-3">
                        <div className="flex items-center justify-between">
                          <label className="text-sm font-medium text-gray-700">Show Binary</label>
                          <Switch
                            checked={options.showBinary}
                            onCheckedChange={(value) => updateOption('showBinary', value)}
                            data-testid="switch-show-binary"
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <label className="text-sm font-medium text-gray-700">Show Decimal</label>
                          <Switch
                            checked={options.showDecimal}
                            onCheckedChange={(value) => updateOption('showDecimal', value)}
                            data-testid="switch-show-decimal"
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <label className="text-sm font-medium text-gray-700">Show Hexadecimal</label>
                          <Switch
                            checked={options.showHex}
                            onCheckedChange={(value) => updateOption('showHex', value)}
                            data-testid="switch-show-hex"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4 pt-6">
                      <Button
                        onClick={convertCode}
                        disabled={!inputCode.trim()}
                        className="flex-1 h-14 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold text-lg rounded-xl shadow-lg transform transition-all duration-200 hover:scale-105"
                        data-testid="button-convert"
                      >
                        Convert to Text
                      </Button>
                      <Button
                        onClick={handleSampleCode}
                        variant="outline"
                        className="h-14 px-8 border-2 border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold text-lg rounded-xl"
                        data-testid="button-sample-code"
                      >
                        Sample
                      </Button>
                      <Button
                        onClick={resetConverter}
                        variant="outline"
                        className="h-14 px-8 border-2 border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold text-lg rounded-xl"
                        data-testid="button-reset"
                      >
                        Reset
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Results Section */}
                <div className="bg-gradient-to-br from-gray-50 to-blue-50 p-8 lg:p-12">
                  <h2 className="text-2xl font-bold text-gray-900 mb-8">Decoded Text</h2>

                  {conversionResult ? (
                    <div className="space-y-6" data-testid="conversion-results">
                      {/* Decoded Text Display */}
                      <div className="bg-white rounded-2xl p-6 shadow-lg border border-blue-100">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="font-bold text-gray-900">Decoded Text</h3>
                          <Button
                            onClick={() => handleCopyToClipboard(conversionResult.text)}
                            variant="outline"
                            size="sm"
                            className="text-sm"
                            data-testid="button-copy-text"
                          >
                            Copy
                          </Button>
                        </div>
                        <div className="bg-blue-50 rounded-lg p-4">
                          <div className="text-base break-words text-gray-800 min-h-[60px]" data-testid="text-output">
                            {conversionResult.text || '(empty result)'}
                          </div>
                        </div>
                      </div>

                      {/* Alternative Formats */}
                      {options.showBinary && (
                        <div className="bg-white rounded-xl p-6 shadow-sm">
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="font-semibold text-gray-900">Binary Code</h4>
                            <Button
                              onClick={() => handleCopyToClipboard(conversionResult.binary)}
                              variant="outline"
                              size="sm"
                              className="text-xs"
                              data-testid="button-copy-binary"
                            >
                              Copy
                            </Button>
                          </div>
                          <div className="bg-yellow-50 rounded-lg p-3">
                            <div className="font-mono text-sm break-all text-gray-800" data-testid="binary-output">
                              {conversionResult.binary}
                            </div>
                          </div>
                        </div>
                      )}

                      {options.showDecimal && (
                        <div className="bg-white rounded-xl p-6 shadow-sm">
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="font-semibold text-gray-900">Decimal Values</h4>
                            <Button
                              onClick={() => handleCopyToClipboard(conversionResult.decimal)}
                              variant="outline"
                              size="sm"
                              className="text-xs"
                              data-testid="button-copy-decimal"
                            >
                              Copy
                            </Button>
                          </div>
                          <div className="bg-green-50 rounded-lg p-3">
                            <div className="font-mono text-sm break-all text-gray-800" data-testid="decimal-output">
                              {conversionResult.decimal}
                            </div>
                          </div>
                        </div>
                      )}

                      {options.showHex && (
                        <div className="bg-white rounded-xl p-6 shadow-sm">
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="font-semibold text-gray-900">Hexadecimal Values</h4>
                            <Button
                              onClick={() => handleCopyToClipboard(conversionResult.hexadecimal)}
                              variant="outline"
                              size="sm"
                              className="text-xs"
                              data-testid="button-copy-hex"
                            >
                              Copy
                            </Button>
                          </div>
                          <div className="bg-purple-50 rounded-lg p-3">
                            <div className="font-mono text-sm break-all text-gray-800" data-testid="hex-output">
                              {conversionResult.hexadecimal}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Text Statistics */}
                      <div className="bg-white rounded-xl p-6 shadow-sm" data-testid="text-statistics">
                        <h3 className="font-bold text-gray-900 mb-4 text-lg">Text Statistics</h3>
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
                    <div className="text-center py-16" data-testid="no-results">
                      <div className="w-20 h-20 bg-gray-200 rounded-full mx-auto mb-6 flex items-center justify-center">
                        <div className="text-3xl font-bold text-gray-400">01</div>
                      </div>
                      <p className="text-gray-500 text-lg">Configure settings and input code to decode text</p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* SEO Content Section */}
          <div className="mt-16 grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">What is Binary to Text Conversion?</h3>
                <div className="space-y-4 text-gray-600">
                  <p>
                    Binary to text conversion is the process of transforming binary code (sequences of 0s and 1s) 
                    back into human-readable text. This fundamental computer science concept bridges the gap between 
                    machine language and human communication, making digital data accessible and understandable.
                  </p>
                  <p>
                    Our professional binary decoder supports multiple input formats including pure binary code, 
                    decimal values, and hexadecimal codes. With UTF-8 and ASCII encoding options, you can decode 
                    any text data that was previously converted to binary format.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Why Use Binary to Text Converter?</h3>
                <div className="space-y-4 text-gray-600">
                  <p>
                    Binary to text conversion is essential for developers, students, and cybersecurity professionals 
                    who need to decode binary data. Whether you're analyzing encoded messages, debugging programs, 
                    or learning computer science fundamentals, this tool provides instant, accurate conversion.
                  </p>
                  <ul className="space-y-2 list-disc list-inside">
                    <li>Decode binary messages and encoded data</li>
                    <li>Support for multiple input formats and encodings</li>
                    <li>Real-time conversion with instant results</li>
                    <li>Educational tool for computer science learning</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Converter Features</h3>
                <div className="space-y-3 text-gray-600">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Support for binary, decimal, and hexadecimal input</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>UTF-8 and ASCII character encoding options</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Real-time conversion as you type</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Copy results with one-click functionality</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Text statistics and format validation</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Professional Applications</h3>
                <div className="space-y-3 text-gray-600">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Software development and debugging</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Cybersecurity and data analysis</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Computer science education and research</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Digital forensics and reverse engineering</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Network protocol analysis and testing</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Additional SEO Content Sections */}
          <div className="mt-12 space-y-8">
            {/* Input Format Guide */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Binary to Text Conversion Guide</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-gray-800">Binary Input</h4>
                    <p className="text-gray-600 text-sm">
                      Input binary code as sequences of 0s and 1s. Each character is represented by 8 bits 
                      (1 byte). Spaces between bytes are optional but improve readability.
                    </p>
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <code className="text-xs font-mono text-blue-800">01001000 01100101 01101100 01101100 01101111</code>
                      <div className="text-xs text-blue-600 mt-1">Result: "Hello"</div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-gray-800">Decimal Input</h4>
                    <p className="text-gray-600 text-sm">
                      Input decimal values (0-255 for ASCII, 0-1114111 for Unicode) separated by spaces. 
                      Each number represents one character's ASCII or Unicode value.
                    </p>
                    <div className="bg-green-50 p-3 rounded-lg">
                      <code className="text-xs font-mono text-green-800">72 101 108 108 111</code>
                      <div className="text-xs text-green-600 mt-1">Result: "Hello"</div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-gray-800">Hexadecimal Input</h4>
                    <p className="text-gray-600 text-sm">
                      Input hexadecimal values (00-FF) separated by spaces. Each pair of hex digits 
                      represents one byte, which translates to one character.
                    </p>
                    <div className="bg-purple-50 p-3 rounded-lg">
                      <code className="text-xs font-mono text-purple-800">48 65 6C 6C 6F</code>
                      <div className="text-xs text-purple-600 mt-1">Result: "Hello"</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Encoding Comparison */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
                <CardContent className="p-8">
                  <h3 className="text-xl font-bold text-gray-900 mb-6">UTF-8 vs ASCII Encoding</h3>
                  <div className="space-y-4 text-gray-600">
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">UTF-8 Encoding</h4>
                      <p className="text-sm">
                        UTF-8 is a variable-width encoding that can represent any Unicode character. 
                        It supports international characters, emojis, and special symbols. Use UTF-8 
                        for modern applications and international text.
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">ASCII Encoding</h4>
                      <p className="text-sm">
                        ASCII uses 7 bits to represent 128 characters (0-127), including English letters, 
                        numbers, and basic symbols. It's limited to basic English characters but is 
                        compatible with older systems.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
                <CardContent className="p-8">
                  <h3 className="text-xl font-bold text-gray-900 mb-6">Conversion Best Practices</h3>
                  <div className="space-y-3 text-gray-600">
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-sm">Verify input format before conversion</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-sm">Use UTF-8 for international characters</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-sm">Check character encoding compatibility</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-sm">Validate binary input length (multiples of 8)</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-sm">Use sample codes to test functionality</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* FAQ Section */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Frequently Asked Questions</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">What is binary to text conversion?</h4>
                      <p className="text-gray-600 text-sm">
                        Binary to text conversion transforms binary code (0s and 1s) back into readable text. 
                        Each 8-bit binary sequence represents one character according to ASCII or Unicode standards.
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">Which encoding should I choose?</h4>
                      <p className="text-gray-600 text-sm">
                        Use UTF-8 for modern applications and international text support. Choose ASCII only 
                        for legacy systems or when working with basic English characters (0-127).
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">Can I convert other number systems?</h4>
                      <p className="text-gray-600 text-sm">
                        Yes, this converter supports binary, decimal, and hexadecimal input formats. 
                        Simply select your input format and the tool will decode it to readable text.
                      </p>
                    </div>
                  </div>
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">Is there a character limit for conversion?</h4>
                      <p className="text-gray-600 text-sm">
                        There's no strict limit, but very large inputs may take longer to process. 
                        The tool displays character and byte counts to help you monitor input size.
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">Why do I get invalid input errors?</h4>
                      <p className="text-gray-600 text-sm">
                        Invalid input errors occur when binary strings aren't divisible by 8, decimal values 
                        are out of range, or hex strings have odd lengths. Check your input format and try again.
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">Is this binary converter free to use?</h4>
                      <p className="text-gray-600 text-sm">
                        Yes, our binary to text converter is completely free with no registration required. 
                        Convert unlimited binary data for all your development and educational needs.
                      </p>
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
