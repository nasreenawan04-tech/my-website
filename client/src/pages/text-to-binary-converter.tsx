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
  spacing: 'none' | 'space' | 'byte';
  showDecimal: boolean;
  showHex: boolean;
}

interface ConversionResult {
  originalText: string;
  binary: string;
  decimal: string;
  hexadecimal: string;
  charCount: number;
  byteCount: number;
  timestamp: Date;
}

const TextToBinaryConverter = () => {
  const [inputText, setInputText] = useState('');
  const [conversionResult, setConversionResult] = useState<ConversionResult | null>(null);
  const [conversionHistory, setConversionHistory] = useState<ConversionResult[]>([]);
  const [options, setOptions] = useState<ConversionOptions>({
    encoding: 'utf8',
    spacing: 'space',
    showDecimal: true,
    showHex: true
  });

  const textToBinary = (text: string, encoding: 'utf8' | 'ascii' = 'utf8'): string => {
    if (!text) return '';
    
    let binary = '';
    for (let i = 0; i < text.length; i++) {
      let charCode = text.charCodeAt(i);
      
      // For ASCII encoding, limit to 7-bit characters
      if (encoding === 'ascii' && charCode > 127) {
        charCode = 63; // '?' character for non-ASCII
      }
      
      let binaryChar = charCode.toString(2).padStart(8, '0');
      
      switch (options.spacing) {
        case 'space':
          binary += (i > 0 ? ' ' : '') + binaryChar;
          break;
        case 'byte':
          binary += (i > 0 ? ' | ' : '') + binaryChar;
          break;
        default:
          binary += binaryChar;
      }
    }
    
    return binary;
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

  const convertText = () => {
    if (!inputText.trim()) {
      setConversionResult(null);
      return;
    }

    const binary = textToBinary(inputText, options.encoding);
    const decimal = textToDecimal(inputText);
    const hexadecimal = textToHex(inputText);
    
    const result: ConversionResult = {
      originalText: inputText,
      binary,
      decimal,
      hexadecimal,
      charCount: inputText.length,
      byteCount: new Blob([inputText]).size,
      timestamp: new Date()
    };

    setConversionResult(result);

    // Add to history (keep last 10)
    setConversionHistory(prev => {
      const updated = [result, ...prev.filter(item => item.originalText !== inputText)];
      return updated.slice(0, 10);
    });
  };

  const updateOption = <K extends keyof ConversionOptions>(key: K, value: ConversionOptions[K]) => {
    setOptions(prev => ({ ...prev, [key]: value }));
  };

  const handleCopyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const handleClear = () => {
    setInputText('');
    setConversionResult(null);
  };

  const handleSampleText = () => {
    setInputText('Hello World! 123');
  };

  // Auto-convert when text or options change
  useEffect(() => {
    if (inputText.trim()) {
      const timeoutId = setTimeout(() => {
        convertText();
      }, 300);
      
      return () => clearTimeout(timeoutId);
    } else {
      setConversionResult(null);
    }
  }, [inputText, options]);

  const getBinaryGrouped = (binary: string): string => {
    if (!binary) return '';
    
    // Remove existing spacing
    const cleanBinary = binary.replace(/\s/g, '');
    
    // Group by 8 bits (1 byte)
    const groups = [];
    for (let i = 0; i < cleanBinary.length; i += 8) {
      groups.push(cleanBinary.slice(i, i + 8));
    }
    
    return groups.join(' ');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Helmet>
        <title>Text to Binary Converter - Convert Text to Binary Code | DapsiWow</title>
        <meta name="description" content="Convert any text to binary code instantly. Supports UTF-8 and ASCII encoding with customizable formatting options and decimal/hex output." />
        <meta name="keywords" content="text to binary, binary converter, text encoder, binary code, ASCII converter, UTF-8 binary" />
        <meta property="og:title" content="Text to Binary Converter - Convert Text to Binary Code" />
        <meta property="og:description" content="Convert text to binary code with support for different encodings and formatting options." />
        <meta property="og:type" content="website" />
        <link rel="canonical" href="/tools/text-to-binary-converter" />
      </Helmet>
      
      <Header />
      
      <main>
        {/* Hero Section */}
        <section className="gradient-hero text-white py-16 pt-24">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="w-20 h-20 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <i className="fas fa-binary text-3xl"></i>
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold mb-6" data-testid="text-page-title">
              Text to Binary Converter
            </h1>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto">
              Convert any text to binary code with support for UTF-8 and ASCII encoding
            </p>
          </div>
        </section>

        {/* Converter Section */}
        <section className="py-16">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <Card className="bg-white shadow-sm border-0">
              <CardContent className="p-8">
                <div className="space-y-8">
                  {/* Input Section */}
                  <div>
                    <h2 className="text-2xl font-semibold text-gray-900 mb-6">Text Input</h2>
                    
                    {/* Text Area */}
                    <div className="space-y-4">
                      <Label htmlFor="text-input" className="text-sm font-medium text-gray-700">
                        Enter Text to Convert
                      </Label>
                      <Textarea
                        id="text-input"
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        className="w-full h-32 p-4 text-base border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                        placeholder="Type or paste your text here..."
                        data-testid="textarea-text-input"
                      />
                      <div className="text-sm text-gray-500 flex justify-between">
                        <span>{inputText.length} characters</span>
                        <span>{new Blob([inputText]).size} bytes</span>
                      </div>
                    </div>

                    {/* Conversion Options */}
                    <div className="mt-6 space-y-4">
                      <h3 className="text-lg font-semibold text-gray-900">Conversion Options</h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Encoding */}
                        <div className="space-y-3">
                          <Label className="text-sm font-medium">Character Encoding</Label>
                          <Select 
                            value={options.encoding} 
                            onValueChange={(value: typeof options.encoding) => updateOption('encoding', value)}
                          >
                            <SelectTrigger data-testid="select-encoding">
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

                        {/* Spacing */}
                        <div className="space-y-3">
                          <Label className="text-sm font-medium">Binary Spacing</Label>
                          <Select 
                            value={options.spacing} 
                            onValueChange={(value: typeof options.spacing) => updateOption('spacing', value)}
                          >
                            <SelectTrigger data-testid="select-spacing">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="none">No Spacing</SelectItem>
                              <SelectItem value="space">Space Between Bytes</SelectItem>
                              <SelectItem value="byte">Pipe Separated (|)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      {/* Display Options */}
                      <div className="space-y-4">
                        <h4 className="font-medium text-gray-900">Display Options</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                            <div className="space-y-1">
                              <Label className="text-sm font-medium">Show Decimal</Label>
                              <p className="text-xs text-gray-500">Display decimal representation</p>
                            </div>
                            <Switch
                              checked={options.showDecimal}
                              onCheckedChange={(value) => updateOption('showDecimal', value)}
                              data-testid="switch-show-decimal"
                            />
                          </div>

                          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                            <div className="space-y-1">
                              <Label className="text-sm font-medium">Show Hexadecimal</Label>
                              <p className="text-xs text-gray-500">Display hexadecimal representation</p>
                            </div>
                            <Switch
                              checked={options.showHex}
                              onCheckedChange={(value) => updateOption('showHex', value)}
                              data-testid="switch-show-hex"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-4 mt-6">
                      <Button
                        onClick={handleClear}
                        variant="outline"
                        className="flex-1"
                        data-testid="button-clear-text"
                      >
                        <i className="fas fa-trash mr-2"></i>
                        Clear Text
                      </Button>
                      <Button
                        onClick={handleSampleText}
                        variant="outline"
                        className="flex-1"
                        data-testid="button-sample-text"
                      >
                        <i className="fas fa-file-text mr-2"></i>
                        Sample Text
                      </Button>
                      <Button
                        onClick={convertText}
                        disabled={!inputText.trim()}
                        className="flex-1"
                        data-testid="button-convert"
                      >
                        <i className="fas fa-exchange-alt mr-2"></i>
                        Convert to Binary
                      </Button>
                    </div>
                  </div>

                  {/* Results Section */}
                  {conversionResult && (
                    <div>
                      <h2 className="text-2xl font-semibold text-gray-900 mb-6">Conversion Results</h2>
                      
                      <div className="space-y-6" data-testid="conversion-results">
                        {/* Binary Output */}
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <Label className="text-lg font-medium text-gray-900">Binary Code</Label>
                            <Button
                              onClick={() => handleCopyToClipboard(conversionResult.binary)}
                              variant="ghost"
                              size="sm"
                              data-testid="button-copy-binary"
                            >
                              <i className="fas fa-copy mr-1"></i>
                              Copy
                            </Button>
                          </div>
                          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                            <div className="font-mono text-sm break-all text-gray-800" data-testid="binary-output">
                              {conversionResult.binary}
                            </div>
                          </div>
                          <div className="text-xs text-gray-500">
                            Grouped by bytes: {getBinaryGrouped(conversionResult.binary)}
                          </div>
                        </div>

                        {/* Decimal Output */}
                        {options.showDecimal && (
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <Label className="text-lg font-medium text-gray-900">Decimal Values</Label>
                              <Button
                                onClick={() => handleCopyToClipboard(conversionResult.decimal)}
                                variant="ghost"
                                size="sm"
                                data-testid="button-copy-decimal"
                              >
                                <i className="fas fa-copy mr-1"></i>
                                Copy
                              </Button>
                            </div>
                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                              <div className="font-mono text-sm break-all text-gray-800" data-testid="decimal-output">
                                {conversionResult.decimal}
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Hexadecimal Output */}
                        {options.showHex && (
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <Label className="text-lg font-medium text-gray-900">Hexadecimal Values</Label>
                              <Button
                                onClick={() => handleCopyToClipboard(conversionResult.hexadecimal)}
                                variant="ghost"
                                size="sm"
                                data-testid="button-copy-hex"
                              >
                                <i className="fas fa-copy mr-1"></i>
                                Copy
                              </Button>
                            </div>
                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                              <div className="font-mono text-sm break-all text-gray-800" data-testid="hex-output">
                                {conversionResult.hexadecimal}
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Stats */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div className="bg-blue-50 p-4 rounded-lg text-center">
                            <div className="text-2xl font-bold text-blue-600" data-testid="char-count">
                              {conversionResult.charCount}
                            </div>
                            <div className="text-sm text-blue-800">Characters</div>
                          </div>
                          
                          <div className="bg-green-50 p-4 rounded-lg text-center">
                            <div className="text-2xl font-bold text-green-600" data-testid="byte-count">
                              {conversionResult.byteCount}
                            </div>
                            <div className="text-sm text-green-800">Bytes</div>
                          </div>
                          
                          <div className="bg-purple-50 p-4 rounded-lg text-center">
                            <div className="text-2xl font-bold text-purple-600" data-testid="binary-length">
                              {conversionResult.binary.replace(/\s/g, '').length}
                            </div>
                            <div className="text-sm text-purple-800">Binary Digits</div>
                          </div>
                          
                          <div className="bg-orange-50 p-4 rounded-lg text-center">
                            <div className="text-2xl font-bold text-orange-600">
                              {options.encoding.toUpperCase()}
                            </div>
                            <div className="text-sm text-orange-800">Encoding</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {!conversionResult && !inputText.trim() && (
                    <div className="text-center py-12 text-gray-500">
                      <i className="fas fa-binary text-4xl mb-4"></i>
                      <p className="text-lg">Enter text above to convert to binary code</p>
                    </div>
                  )}

                  {/* Conversion History */}
                  {conversionHistory.length > 0 && (
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-4">Recent Conversions</h3>
                      <div className="space-y-3">
                        {conversionHistory.slice(0, 5).map((item, index) => (
                          <div key={index} className="bg-gray-50 rounded-lg p-4">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="font-medium text-gray-900 mb-2" data-testid={`history-text-${index}`}>
                                  "{item.originalText}"
                                </div>
                                <div className="font-mono text-xs text-gray-600 break-all" data-testid={`history-binary-${index}`}>
                                  {item.binary.length > 100 ? item.binary.substring(0, 100) + '...' : item.binary}
                                </div>
                              </div>
                              <div className="ml-4 flex gap-2">
                                <Button
                                  onClick={() => handleCopyToClipboard(item.binary)}
                                  variant="ghost"
                                  size="sm"
                                  data-testid={`button-copy-history-${index}`}
                                >
                                  <i className="fas fa-copy"></i>
                                </Button>
                                <Button
                                  onClick={() => setInputText(item.originalText)}
                                  variant="ghost"
                                  size="sm"
                                  data-testid={`button-load-history-${index}`}
                                >
                                  <i className="fas fa-redo"></i>
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

        {/* Information Sections */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
          {/* What is Text to Binary Conversion */}
          <div className="mt-12 bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">What is Text to Binary Conversion?</h2>
            <div className="prose max-w-none">
              <p className="text-lg text-gray-700 mb-6">
                <strong>Text to binary conversion</strong> is the process of translating human-readable text into binary code (0s and 1s) that computers understand. Each character in your text is converted to its corresponding ASCII or Unicode value, which is then represented in binary format.
              </p>
              
              <p className="text-gray-700 mb-6">
                This tool supports both UTF-8 (Unicode) and ASCII encoding, allowing you to convert any text including special characters, emojis, and international languages. The binary output can be formatted with different spacing options for better readability.
              </p>
            </div>
          </div>

          {/* Encoding Types */}
          <div className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Encoding Types</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <i className="fas fa-globe text-blue-600 text-xl"></i>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">UTF-8 (Unicode)</h3>
                <p className="text-gray-600 text-sm mb-3">
                  Supports all Unicode characters including emojis, international languages, and special symbols. Uses variable-length encoding (1-4 bytes per character).
                </p>
                <div className="text-xs text-gray-500">
                  Example: "Hello" → 01001000 01100101 01101100 01101100 01101111
                </div>
              </div>
              
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                  <i className="fas fa-keyboard text-green-600 text-xl"></i>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">ASCII (7-bit)</h3>
                <p className="text-gray-600 text-sm mb-3">
                  Limited to basic ASCII characters (0-127). Uses fixed 8-bit encoding. Non-ASCII characters are replaced with '?' (question mark).
                </p>
                <div className="text-xs text-gray-500">
                  Example: "ABC" → 01000001 01000010 01000011
                </div>
              </div>
            </div>
          </div>

          {/* Use Cases */}
          <div className="mt-8 bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Common Use Cases</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <i className="fas fa-graduation-cap text-blue-600 text-xl"></i>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Education</h3>
                <p className="text-gray-600 text-sm">Learn how computers represent text and understand binary encoding systems.</p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <i className="fas fa-code text-green-600 text-xl"></i>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Programming</h3>
                <p className="text-gray-600 text-sm">Debug encoding issues, understand character representations, and work with binary data.</p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <i className="fas fa-shield-alt text-purple-600 text-xl"></i>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Security</h3>
                <p className="text-gray-600 text-sm">Analyze data formats, understand encoding attacks, and work with binary protocols.</p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <i className="fas fa-puzzle-piece text-orange-600 text-xl"></i>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Puzzles</h3>
                <p className="text-gray-600 text-sm">Solve binary puzzles, create encoded messages, and work with CTF challenges.</p>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default TextToBinaryConverter;