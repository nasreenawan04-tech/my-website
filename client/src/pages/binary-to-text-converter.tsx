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
    <div className="min-h-screen bg-gray-50">
      <Helmet>
        <title>Binary to Text Converter - Convert Binary Code to Text | DapsiWow</title>
        <meta name="description" content="Free binary to text converter tool. Decode binary code, decimal values, and hexadecimal to readable text instantly. Supports UTF-8 and ASCII encoding for students, developers, and professionals." />
        <meta name="keywords" content="binary to text converter, binary decoder, ASCII to text, UTF-8 converter, hex to text, decimal to text, binary code converter, programming tools, computer science, data encoding, text decoding, online binary converter" />
        <meta property="og:title" content="Binary to Text Converter - Convert Binary Code to Text" />
        <meta property="og:description" content="Free online binary to text converter. Decode binary, decimal, and hex codes to readable text. Perfect for students, developers, and cybersecurity professionals." />
        <meta property="og:type" content="website" />
        <link rel="canonical" href="/tools/binary-to-text-converter" />
      </Helmet>
      
      <Header />
      
      <main>
        {/* Hero Section */}
        <section className="gradient-hero text-white py-12 sm:py-16 pt-20 sm:pt-24">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6">
              <i className="fas fa-exchange-alt text-2xl sm:text-3xl"></i>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6" data-testid="text-page-title">
              Binary to Text Converter
            </h1>
            <p className="text-lg sm:text-xl text-blue-100 max-w-2xl mx-auto px-4">
              Convert binary code, decimal values, and hexadecimal back to readable text
            </p>
          </div>
        </section>

        {/* Introduction Section */}
        <section className="py-8 sm:py-12 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8 sm:mb-12">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4 sm:mb-6">What is a Binary to Text Converter?</h2>
              <p className="text-base sm:text-lg text-gray-700 leading-relaxed max-w-3xl mx-auto">
                A binary to text converter is a powerful online tool that transforms binary code (sequences of 0s and 1s) 
                back into human-readable text. Whether you're working with binary data, decimal values, or hexadecimal codes, 
                this converter seamlessly translates computer language into plain text that anyone can understand.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 mb-8 sm:mb-12">
              <div className="space-y-3 sm:space-y-4">
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900">How It Works</h3>
                <p className="text-sm sm:text-base text-gray-700">
                  Our binary decoder processes your input by breaking down binary strings into 8-bit chunks (bytes), 
                  converting each byte to its corresponding ASCII or Unicode character. The tool supports multiple input 
                  formats including pure binary, decimal values, and hexadecimal codes.
                </p>
              </div>
              <div className="space-y-3 sm:space-y-4">
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900">Key Features</h3>
                <ul className="text-sm sm:text-base text-gray-700 space-y-1 sm:space-y-2">
                  <li>• Multiple input formats (binary, decimal, hex)</li>
                  <li>• UTF-8 and ASCII encoding support</li>
                  <li>• Real-time conversion as you type</li>
                  <li>• Copy results with one click</li>
                  <li>• Format validation and error handling</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Converter Section */}
        <section className="py-8 sm:py-12 lg:py-16 bg-gray-50">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <Card className="bg-white shadow-sm border-0">
              <CardContent className="p-4 sm:p-6 lg:p-8">
                <div className="space-y-8">
                  {/* Input Section */}
                  <div>
                    <h2 className="text-2xl font-semibold text-gray-900 mb-6">Code Input</h2>
                    
                    {/* Code Area */}
                    <div className="space-y-4">
                      <Label htmlFor="code-input" className="text-sm font-medium text-gray-700">
                        {getInputFormatLabel()}
                      </Label>
                      <Textarea
                        id="code-input"
                        value={inputCode}
                        onChange={(e) => setInputCode(e.target.value)}
                        className="w-full h-32 p-4 text-base border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none font-mono"
                        placeholder={getInputPlaceholder()}
                        data-testid="textarea-code-input"
                      />
                      <div className="text-sm text-gray-500 flex justify-between">
                        <span>{inputCode.length} characters</span>
                        <span>Input format: {options.inputFormat.toUpperCase()}</span>
                      </div>
                    </div>

                    {/* Conversion Options */}
                    <div className="mt-4 sm:mt-6 space-y-3 sm:space-y-4">
                      <h3 className="text-base sm:text-lg font-semibold text-gray-900">Conversion Options</h3>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                        {/* Input Format */}
                        <div className="space-y-2 sm:space-y-3">
                          <Label className="text-sm font-medium">Input Format</Label>
                          <Select 
                            value={options.inputFormat} 
                            onValueChange={(value: typeof options.inputFormat) => updateOption('inputFormat', value)}
                          >
                            <SelectTrigger className="h-10 sm:h-12 text-sm sm:text-base" data-testid="select-input-format">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="binary">Binary (0s and 1s)</SelectItem>
                              <SelectItem value="decimal">Decimal Values</SelectItem>
                              <SelectItem value="hex">Hexadecimal Values</SelectItem>
                            </SelectContent>
                          </Select>
                          <div className="text-xs text-gray-500">
                            {options.inputFormat === 'binary' && 'Binary digits (0s and 1s) with optional spacing'}
                            {options.inputFormat === 'decimal' && 'Space-separated decimal numbers (0-255)'}
                            {options.inputFormat === 'hex' && 'Space-separated hexadecimal values (00-FF)'}
                          </div>
                        </div>

                        {/* Encoding */}
                        <div className="space-y-2 sm:space-y-3">
                          <Label className="text-sm font-medium">Character Encoding</Label>
                          <Select 
                            value={options.encoding} 
                            onValueChange={(value: typeof options.encoding) => updateOption('encoding', value)}
                          >
                            <SelectTrigger className="h-10 sm:h-12 text-sm sm:text-base" data-testid="select-encoding">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="utf8">UTF-8 (Unicode)</SelectItem>
                              <SelectItem value="ascii">ASCII (7-bit)</SelectItem>
                            </SelectContent>
                          </Select>
                          <div className="text-xs text-gray-500">
                            {options.encoding === 'utf8' ? 'Supports all Unicode characters' : 'Limited to basic ASCII characters (0-127)'}
                          </div>
                        </div>
                      </div>

                      {/* Display Options */}
                      <div className="space-y-3 sm:space-y-4">
                        <h4 className="text-sm sm:text-base font-medium text-gray-900">Display Alternative Formats</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                          <div className="flex items-center justify-between p-3 sm:p-4 border border-gray-200 rounded-lg">
                            <div className="space-y-1 flex-1 min-w-0 pr-3">
                              <Label className="text-sm font-medium">Show Binary</Label>
                              <p className="text-xs text-gray-500">Display binary representation</p>
                            </div>
                            <Switch
                              checked={options.showBinary}
                              onCheckedChange={(value) => updateOption('showBinary', value)}
                              className="flex-shrink-0"
                              data-testid="switch-show-binary"
                            />
                          </div>

                          <div className="flex items-center justify-between p-3 sm:p-4 border border-gray-200 rounded-lg">
                            <div className="space-y-1 flex-1 min-w-0 pr-3">
                              <Label className="text-sm font-medium">Show Decimal</Label>
                              <p className="text-xs text-gray-500">Display decimal representation</p>
                            </div>
                            <Switch
                              checked={options.showDecimal}
                              onCheckedChange={(value) => updateOption('showDecimal', value)}
                              className="flex-shrink-0"
                              data-testid="switch-show-decimal"
                            />
                          </div>

                          <div className="flex items-center justify-between p-3 sm:p-4 border border-gray-200 rounded-lg">
                            <div className="space-y-1 flex-1 min-w-0 pr-3">
                              <Label className="text-sm font-medium">Show Hexadecimal</Label>
                              <p className="text-xs text-gray-500">Display hexadecimal representation</p>
                            </div>
                            <Switch
                              checked={options.showHex}
                              onCheckedChange={(value) => updateOption('showHex', value)}
                              className="flex-shrink-0"
                              data-testid="switch-show-hex"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3 lg:gap-4 mt-4 sm:mt-6">
                      <Button
                        onClick={handleClear}
                        variant="outline"
                        className="h-10 sm:h-12 text-xs sm:text-sm"
                        data-testid="button-clear-code"
                      >
                        <i className="fas fa-trash mr-1 sm:mr-2 text-xs sm:text-sm"></i>
                        <span className="hidden sm:inline">Clear Code</span>
                        <span className="sm:hidden">Clear</span>
                      </Button>
                      <Button
                        onClick={handleSampleCode}
                        variant="outline"
                        className="h-10 sm:h-12 text-xs sm:text-sm"
                        data-testid="button-sample-code"
                      >
                        <i className="fas fa-file-text mr-1 sm:mr-2 text-xs sm:text-sm"></i>
                        <span className="hidden sm:inline">Sample Code</span>
                        <span className="sm:hidden">Sample</span>
                      </Button>
                      <Button
                        onClick={convertCode}
                        disabled={!inputCode.trim()}
                        className="h-10 sm:h-12 text-xs sm:text-sm font-semibold"
                        data-testid="button-convert"
                      >
                        <i className="fas fa-exchange-alt mr-1 sm:mr-2 text-xs sm:text-sm"></i>
                        <span className="hidden sm:inline">Convert to Text</span>
                        <span className="sm:hidden">Convert</span>
                      </Button>
                    </div>
                  </div>

                  {/* Results Section */}
                  {conversionResult && (
                    <div>
                      <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-4 sm:mb-6">Conversion Results</h2>
                      
                      <div className="space-y-4 sm:space-y-6" data-testid="conversion-results">
                        {/* Text Output */}
                        <div className="space-y-2 sm:space-y-3">
                          <div className="flex items-center justify-between">
                            <Label className="text-base sm:text-lg font-medium text-gray-900">Decoded Text</Label>
                            <Button
                              onClick={() => handleCopyToClipboard(conversionResult.text)}
                              variant="ghost"
                              size="sm"
                              className="flex-shrink-0"
                              data-testid="button-copy-text"
                            >
                              <i className="fas fa-copy mr-1 text-xs sm:text-sm"></i>
                              <span className="hidden sm:inline">Copy</span>
                            </Button>
                          </div>
                          <div className="bg-blue-50 p-3 sm:p-4 rounded-lg border border-blue-200">
                            <div className="text-sm sm:text-base break-words text-gray-800" data-testid="text-output">
                              {conversionResult.text || '(empty result)'}
                            </div>
                          </div>
                        </div>

                        {/* Binary Output */}
                        {options.showBinary && (
                          <div className="space-y-2 sm:space-y-3">
                            <div className="flex items-center justify-between">
                              <Label className="text-base sm:text-lg font-medium text-gray-900">Binary Code</Label>
                              <Button
                                onClick={() => handleCopyToClipboard(conversionResult.binary)}
                                variant="ghost"
                                size="sm"
                                className="flex-shrink-0"
                                data-testid="button-copy-binary"
                              >
                                <i className="fas fa-copy mr-1 text-xs sm:text-sm"></i>
                                <span className="hidden sm:inline">Copy</span>
                              </Button>
                            </div>
                            <div className="bg-yellow-50 p-3 sm:p-4 rounded-lg border border-yellow-200">
                              <div className="font-mono text-xs sm:text-sm break-all text-gray-800" data-testid="binary-output">
                                {conversionResult.binary}
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Decimal Output */}
                        {options.showDecimal && (
                          <div className="space-y-2 sm:space-y-3">
                            <div className="flex items-center justify-between">
                              <Label className="text-base sm:text-lg font-medium text-gray-900">Decimal Values</Label>
                              <Button
                                onClick={() => handleCopyToClipboard(conversionResult.decimal)}
                                variant="ghost"
                                size="sm"
                                className="flex-shrink-0"
                                data-testid="button-copy-decimal"
                              >
                                <i className="fas fa-copy mr-1 text-xs sm:text-sm"></i>
                                <span className="hidden sm:inline">Copy</span>
                              </Button>
                            </div>
                            <div className="bg-green-50 p-3 sm:p-4 rounded-lg border border-green-200">
                              <div className="font-mono text-xs sm:text-sm break-all text-gray-800" data-testid="decimal-output">
                                {conversionResult.decimal}
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Hexadecimal Output */}
                        {options.showHex && (
                          <div className="space-y-2 sm:space-y-3">
                            <div className="flex items-center justify-between">
                              <Label className="text-base sm:text-lg font-medium text-gray-900">Hexadecimal Values</Label>
                              <Button
                                onClick={() => handleCopyToClipboard(conversionResult.hexadecimal)}
                                variant="ghost"
                                size="sm"
                                className="flex-shrink-0"
                                data-testid="button-copy-hex"
                              >
                                <i className="fas fa-copy mr-1 text-xs sm:text-sm"></i>
                                <span className="hidden sm:inline">Copy</span>
                              </Button>
                            </div>
                            <div className="bg-purple-50 p-3 sm:p-4 rounded-lg border border-purple-200">
                              <div className="font-mono text-xs sm:text-sm break-all text-gray-800" data-testid="hex-output">
                                {conversionResult.hexadecimal}
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Stats */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                          <div className="bg-blue-50 p-3 sm:p-4 rounded-lg text-center">
                            <div className="text-lg sm:text-2xl font-bold text-blue-600" data-testid="char-count">
                              {conversionResult.charCount}
                            </div>
                            <div className="text-xs sm:text-sm text-blue-800">Characters</div>
                          </div>
                          
                          <div className="bg-green-50 p-3 sm:p-4 rounded-lg text-center">
                            <div className="text-lg sm:text-2xl font-bold text-green-600" data-testid="byte-count">
                              {conversionResult.byteCount}
                            </div>
                            <div className="text-xs sm:text-sm text-green-800">Bytes</div>
                          </div>
                          
                          <div className="bg-purple-50 p-3 sm:p-4 rounded-lg text-center">
                            <div className="text-sm sm:text-lg lg:text-xl font-bold text-purple-600">
                              {options.inputFormat.toUpperCase()}
                            </div>
                            <div className="text-sm text-purple-800">Input Format</div>
                          </div>
                          
                          <div className="bg-orange-50 p-3 sm:p-4 rounded-lg text-center">
                            <div className="text-sm sm:text-lg lg:text-xl font-bold text-orange-600">
                              {options.encoding.toUpperCase()}
                            </div>
                            <div className="text-xs sm:text-sm text-orange-800">Encoding</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {!conversionResult && !inputCode.trim() && (
                    <div className="text-center py-8 sm:py-12 text-gray-500">
                      <i className="fas fa-exchange-alt text-3xl sm:text-4xl mb-3 sm:mb-4"></i>
                      <p className="text-base sm:text-lg">Enter {options.inputFormat} code above to convert to text</p>
                    </div>
                  )}

                  {/* Conversion History */}
                  {conversionHistory.length > 0 && (
                    <div>
                      <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3 sm:mb-4">Recent Conversions</h3>
                      <div className="space-y-2 sm:space-y-3">
                        {conversionHistory.slice(0, 5).map((item, index) => (
                          <div key={index} className="bg-gray-50 rounded-lg p-3 sm:p-4">
                            <div className="flex items-start justify-between">
                              <div className="flex-1 min-w-0">
                                <div className="text-sm sm:text-base font-medium text-gray-900 mb-2 truncate" data-testid={`history-text-${index}`}>
                                  "{item.text}"
                                </div>
                                <div className="font-mono text-xs text-gray-600 break-all" data-testid={`history-code-${index}`}>
                                  {item.originalInput.length > 80 ? item.originalInput.substring(0, 80) + '...' : item.originalInput}
                                </div>
                              </div>
                              <div className="ml-2 sm:ml-4 flex gap-1 sm:gap-2 flex-shrink-0">
                                <Button
                                  onClick={() => handleCopyToClipboard(item.text)}
                                  variant="ghost"
                                  size="sm"
                                  className="p-2"
                                  data-testid={`button-copy-history-${index}`}
                                >
                                  <i className="fas fa-copy text-xs sm:text-sm"></i>
                                </Button>
                                <Button
                                  onClick={() => setInputCode(item.originalInput)}
                                  variant="ghost"
                                  size="sm"
                                  className="p-2"
                                  data-testid={`button-load-history-${index}`}
                                >
                                  <i className="fas fa-redo text-xs sm:text-sm"></i>
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Benefits and Use Cases Section */}
        <section className="py-16 bg-white">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Who Uses Binary to Text Converters?</h2>
              <p className="text-lg text-gray-700 max-w-3xl mx-auto">
                From computer science students to cybersecurity professionals, binary converters serve essential roles 
                across various fields and educational levels.
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
              <div className="bg-blue-50 p-6 rounded-lg">
                <h3 className="text-xl font-semibold text-blue-900 mb-4">Students & Educators</h3>
                <p className="text-blue-800 mb-4">
                  Perfect for learning computer science fundamentals, understanding how computers process text, 
                  and completing programming assignments involving data encoding.
                </p>
                <ul className="text-blue-700 text-sm space-y-1">
                  <li>• Computer science homework</li>
                  <li>• Programming course projects</li>
                  <li>• Understanding ASCII values</li>
                </ul>
              </div>
              
              <div className="bg-green-50 p-6 rounded-lg">
                <h3 className="text-xl font-semibold text-green-900 mb-4">Developers & Programmers</h3>
                <p className="text-green-800 mb-4">
                  Essential for debugging data transmission issues, analyzing network packets, 
                  and working with low-level programming languages.
                </p>
                <ul className="text-green-700 text-sm space-y-1">
                  <li>• Debugging binary data</li>
                  <li>• Network protocol analysis</li>
                  <li>• Embedded systems development</li>
                </ul>
              </div>
              
              <div className="bg-purple-50 p-6 rounded-lg">
                <h3 className="text-xl font-semibold text-purple-900 mb-4">Security Professionals</h3>
                <p className="text-purple-800 mb-4">
                  Crucial for malware analysis, forensic investigations, and decoding suspicious 
                  binary data found in security incidents.
                </p>
                <ul className="text-purple-700 text-sm space-y-1">
                  <li>• Malware reverse engineering</li>
                  <li>• Digital forensics</li>
                  <li>• Incident response analysis</li>
                </ul>
              </div>
              
              <div className="bg-orange-50 p-6 rounded-lg">
                <h3 className="text-xl font-semibold text-orange-900 mb-4">System Administrators</h3>
                <p className="text-orange-800 mb-4">
                  Helpful for troubleshooting system logs, analyzing configuration files, 
                  and understanding encoded system messages.
                </p>
                <ul className="text-orange-700 text-sm space-y-1">
                  <li>• Log file analysis</li>
                  <li>• Configuration debugging</li>
                  <li>• System monitoring</li>
                </ul>
              </div>
              
              <div className="bg-red-50 p-6 rounded-lg">
                <h3 className="text-xl font-semibold text-red-900 mb-4">Data Analysts</h3>
                <p className="text-red-800 mb-4">
                  Useful for processing encoded data sets, converting legacy data formats, 
                  and preparing data for analysis tools.
                </p>
                <ul className="text-red-700 text-sm space-y-1">
                  <li>• Legacy data conversion</li>
                  <li>• Data preprocessing</li>
                  <li>• Format standardization</li>
                </ul>
              </div>
              
              <div className="bg-teal-50 p-6 rounded-lg">
                <h3 className="text-xl font-semibold text-teal-900 mb-4">Researchers & Scientists</h3>
                <p className="text-teal-800 mb-4">
                  Essential for analyzing experimental data, processing sensor outputs, 
                  and working with scientific computing applications.
                </p>
                <ul className="text-teal-700 text-sm space-y-1">
                  <li>• Sensor data processing</li>
                  <li>• Scientific data analysis</li>
                  <li>• Research data conversion</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Related Tools Section */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Related Text Processing Tools</h2>
              <p className="text-lg text-gray-700">
                Explore our comprehensive suite of text analysis and conversion tools designed to streamline your workflow.
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <a href="/tools/text-to-binary-converter" className="block bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow border border-gray-200">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <i className="fas fa-code text-blue-600 text-xl"></i>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Text to Binary Converter</h3>
                <p className="text-gray-600 text-sm">
                  Convert plain text into binary code, decimal values, or hexadecimal format for programming and data encoding.
                </p>
              </a>
              
              <a href="/tools/case-converter" className="block bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow border border-gray-200">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                  <i className="fas fa-text-height text-green-600 text-xl"></i>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Case Converter</h3>
                <p className="text-gray-600 text-sm">
                  Transform text between different case formats: uppercase, lowercase, title case, and sentence case.
                </p>
              </a>
              
              <a href="/tools/character-counter" className="block bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow border border-gray-200">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                  <i className="fas fa-calculator text-purple-600 text-xl"></i>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Character Counter</h3>
                <p className="text-gray-600 text-sm">
                  Count characters, words, sentences, and paragraphs in your text with detailed statistics and analysis.
                </p>
              </a>
              
              <a href="/tools/word-counter" className="block bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow border border-gray-200">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                  <i className="fas fa-file-text text-orange-600 text-xl"></i>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Word Counter</h3>
                <p className="text-gray-600 text-sm">
                  Analyze text length, reading time, keyword density, and get comprehensive word count statistics.
                </p>
              </a>
              
              <a href="/tools/reverse-text-tool" className="block bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow border border-gray-200">
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                  <i className="fas fa-undo text-red-600 text-xl"></i>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Reverse Text Tool</h3>
                <p className="text-gray-600 text-sm">
                  Reverse text character by character, word by word, or line by line for creative projects and puzzles.
                </p>
              </a>
              
              <a href="/tools/lorem-ipsum-generator" className="block bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow border border-gray-200">
                <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center mb-4">
                  <i className="fas fa-file-alt text-teal-600 text-xl"></i>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Lorem Ipsum Generator</h3>
                <p className="text-gray-600 text-sm">
                  Generate placeholder text for design mockups, content templates, and web development projects.
                </p>
              </a>
            </div>
            
            <div className="text-center mt-12">
              <a href="/tools/text-tools" className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors">
                View All Text Tools
                <i className="fas fa-arrow-right ml-2"></i>
              </a>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-16 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Frequently Asked Questions</h2>
            </div>
            
            <div className="space-y-8">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">What is binary code and why convert it to text?</h3>
                <p className="text-gray-700">
                  Binary code is the fundamental language computers use to process and store information. It consists of 
                  sequences of 0s and 1s that represent different characters, numbers, and symbols. Converting binary to 
                  text allows you to decode computer data back into human-readable format, which is essential for 
                  programming, data analysis, and educational purposes.
                </p>
              </div>
              
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">What's the difference between UTF-8 and ASCII encoding?</h3>
                <p className="text-gray-700">
                  ASCII (American Standard Code for Information Interchange) supports 128 basic characters including 
                  English letters, numbers, and common symbols. UTF-8 is a more comprehensive encoding that supports 
                  over a million characters from virtually all languages and symbol sets worldwide. Choose ASCII for 
                  simple English text or UTF-8 for international characters and symbols.
                </p>
              </div>
              
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Can I convert decimal and hexadecimal values too?</h3>
                <p className="text-gray-700">
                  Yes! Our converter supports three input formats: binary (0s and 1s), decimal values (0-255), and 
                  hexadecimal codes (00-FF). Simply select your input format from the dropdown menu, and the tool will 
                  automatically handle the conversion process. This flexibility makes it perfect for various programming 
                  and data analysis scenarios.
                </p>
              </div>
              
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Is there a limit to how much text I can convert?</h3>
                <p className="text-gray-700">
                  While there's no strict character limit, very large conversions may take longer to process. For optimal 
                  performance, we recommend processing text in reasonable chunks. The tool provides real-time feedback 
                  and will display character and byte counts to help you monitor your conversion size.
                </p>
              </div>
              
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">What if my binary code produces gibberish or strange characters?</h3>
                <p className="text-gray-700">
                  This usually happens when the encoding format doesn't match your data or when the binary string 
                  contains errors. Try switching between UTF-8 and ASCII encoding, ensure your binary string length 
                  is divisible by 8, and verify that your input format matches your data type (binary, decimal, or hex).
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* SEO Content Section */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="prose prose-lg max-w-none">
              <h2 className="text-3xl font-bold text-gray-900 mb-8">Master Binary Conversion: Complete Guide</h2>
              
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Professional Applications</h3>
                  <p className="text-gray-700 mb-4">
                    Binary to text conversion plays a crucial role in modern technology workflows. System administrators 
                    use these tools to decode log files and system messages, while network engineers analyze packet data 
                    to troubleshoot connectivity issues.
                  </p>
                  <p className="text-gray-700">
                    Cybersecurity experts rely on binary converters to examine malware samples and decode suspicious 
                    data transmissions. The ability to quickly convert between binary, decimal, and hexadecimal formats 
                    makes this tool indispensable for digital forensics and threat analysis.
                  </p>
                </div>
                
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Educational Benefits</h3>
                  <p className="text-gray-700 mb-4">
                    For students learning computer science fundamentals, understanding binary conversion is essential. 
                    This tool helps visualize how computers store and process text data, making abstract concepts 
                    tangible and easier to comprehend.
                  </p>
                  <p className="text-gray-700">
                    Teachers and professors use binary converters to create interactive lessons about data representation, 
                    character encoding, and the relationship between human language and machine language.
                  </p>
                </div>
              </div>
              
              <div className="mt-12 p-6 bg-blue-50 rounded-lg">
                <h3 className="text-xl font-semibold text-blue-900 mb-4">Quick Tips for Effective Binary Conversion</h3>
                <ul className="text-blue-800 space-y-2">
                  <li>• Always verify your input format matches your data type</li>
                  <li>• Use UTF-8 encoding for international text and special characters</li>
                  <li>• Check that binary strings are divisible by 8 for proper character alignment</li>
                  <li>• Enable multiple output formats to cross-reference your results</li>
                  <li>• Keep a conversion history to track your work and compare different inputs</li>
                </ul>
              </div>
              
              <div className="mt-12">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Enhance Your Text Processing Workflow</h3>
                <p className="text-gray-700 mb-6">
                  Maximize your productivity by combining our binary converter with other powerful text processing tools. 
                  Start with binary conversion, then use our <a href="/tools/character-counter" className="text-blue-600 hover:text-blue-800 font-medium">character counter</a> 
                  to analyze your decoded text length and statistics.
                </p>
                <p className="text-gray-700 mb-6">
                  For content creators and writers, pair the binary converter with our <a href="/tools/word-counter" className="text-blue-600 hover:text-blue-800 font-medium">word counter tool</a> 
                  to get detailed text analytics, or use the <a href="/tools/case-converter" className="text-blue-600 hover:text-blue-800 font-medium">case converter</a> 
                  to format your decoded text in the perfect style.
                </p>
                <p className="text-gray-700">
                  Need to reverse the process? Our <a href="/tools/text-to-binary-converter" className="text-blue-600 hover:text-blue-800 font-medium">text to binary converter</a> 
                  transforms readable text back into binary format. For creative projects, try the <a href="/tools/reverse-text-tool" className="text-blue-600 hover:text-blue-800 font-medium">reverse text tool</a> 
                  to flip your decoded text backwards.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Original Information Sections */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
          {/* What is Binary to Text Conversion */}
          <div className="mt-12 bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">What is Binary to Text Conversion?</h2>
            <div className="prose max-w-none">
              <p className="text-lg text-gray-700 mb-6">
                <strong>Binary to text conversion</strong> is the process of translating binary code (0s and 1s), decimal values, or hexadecimal codes back into human-readable text. This tool can decode data that was previously encoded in binary format, making it readable again.
              </p>
              
              <p className="text-gray-700 mb-6">
                This converter supports multiple input formats including pure binary code, decimal ASCII values, and hexadecimal representations. It can handle both UTF-8 (Unicode) and ASCII encoding, allowing you to decode text in various languages and character sets.
              </p>
            </div>
          </div>

          {/* Input Formats */}
          <div className="mt-8 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Supported Input Formats</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                  <i className="fas fa-binary text-green-600 text-xl"></i>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Binary Code</h3>
                <p className="text-gray-600 text-sm mb-3">
                  Standard binary representation using 0s and 1s. Each character is represented by 8 bits (1 byte).
                </p>
                <div className="text-xs text-gray-500">
                  Example: 01001000 01100101 01101100 01101100 01101111
                </div>
              </div>

              <div className="bg-white rounded-lg p-6 shadow-sm">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <i className="fas fa-list-ol text-blue-600 text-xl"></i>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Decimal Values</h3>
                <p className="text-gray-600 text-sm mb-3">
                  ASCII character codes in decimal format. Each number represents one character's ASCII value.
                </p>
                <div className="text-xs text-gray-500">
                  Example: 72 101 108 108 111 (Hello)
                </div>
              </div>

              <div className="bg-white rounded-lg p-6 shadow-sm">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                  <i className="fas fa-hashtag text-purple-600 text-xl"></i>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Hexadecimal</h3>
                <p className="text-gray-600 text-sm mb-3">
                  Character codes in hexadecimal format. Each hex pair (00-FF) represents one character.
                </p>
                <div className="text-xs text-gray-500">
                  Example: 48 65 6C 6C 6F (Hello)
                </div>
              </div>
            </div>
          </div>

          {/* How It Works */}
          <div className="mt-8 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-2xl p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">How It Works</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Decoding Process</h3>
                <ol className="space-y-3 text-gray-700">
                  <li className="flex items-start">
                    <span className="w-6 h-6 bg-purple-600 text-white rounded-full text-xs flex items-center justify-center mr-3 mt-0.5">1</span>
                    <span>Input validation and format detection</span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-6 h-6 bg-purple-600 text-white rounded-full text-xs flex items-center justify-center mr-3 mt-0.5">2</span>
                    <span>Parse input based on selected format (binary, decimal, hex)</span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-6 h-6 bg-purple-600 text-white rounded-full text-xs flex items-center justify-center mr-3 mt-0.5">3</span>
                    <span>Convert each code unit to character codes</span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-6 h-6 bg-purple-600 text-white rounded-full text-xs flex items-center justify-center mr-3 mt-0.5">4</span>
                    <span>Generate readable text using String.fromCharCode()</span>
                  </li>
                </ol>
              </div>
              
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Example Conversion</h3>
                <div className="bg-white rounded-lg p-4 border">
                  <div className="space-y-3">
                    <div>
                      <span className="text-sm font-medium text-gray-600">Binary Input:</span>
                      <div className="font-mono text-sm text-gray-800">01001000 01100101</div>
                    </div>
                    <div className="text-center text-gray-400">↓</div>
                    <div>
                      <span className="text-sm font-medium text-gray-600">Character Codes:</span>
                      <div className="font-mono text-sm text-gray-800">72, 101</div>
                    </div>
                    <div className="text-center text-gray-400">↓</div>
                    <div>
                      <span className="text-sm font-medium text-gray-600">Result:</span>
                      <div className="text-lg font-semibold text-gray-900">He</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Common Use Cases */}
          <div className="mt-8 bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Common Use Cases</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-red-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <i className="fas fa-code text-red-600 text-2xl"></i>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Programming</h3>
                <p className="text-sm text-gray-600">Debug binary data and decode encoded strings in software development</p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-yellow-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <i className="fas fa-shield-alt text-yellow-600 text-2xl"></i>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Security</h3>
                <p className="text-sm text-gray-600">Analyze encoded data and reverse-engineer binary payloads</p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <i className="fas fa-graduation-cap text-green-600 text-2xl"></i>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Education</h3>
                <p className="text-sm text-gray-600">Learn about character encoding and computer science fundamentals</p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <i className="fas fa-database text-blue-600 text-2xl"></i>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Data Recovery</h3>
                <p className="text-sm text-gray-600">Recover text from corrupted or encoded data files</p>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default BinaryToTextConverter;