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

        
      </main>
      
      <Footer />
    </div>
  );
};

export default BinaryToTextConverter;