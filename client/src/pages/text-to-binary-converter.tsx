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
        <meta name="description" content="Free text to binary converter tool. Convert any text to binary code instantly with UTF-8 and ASCII encoding support. Perfect for students, developers, and programmers." />
        <meta name="keywords" content="text to binary converter, binary encoder, text to binary code, ASCII to binary, UTF-8 binary converter, text encoder, programming tools, computer science, binary code generator, online text converter" />
        <meta property="og:title" content="Text to Binary Converter - Convert Text to Binary Code" />
        <meta property="og:description" content="Free online text to binary converter. Convert any text to binary code with UTF-8 and ASCII encoding. Essential tool for developers and computer science students." />
        <meta property="og:type" content="website" />
        <link rel="canonical" href="/tools/text-to-binary-converter" />
      </Helmet>
      
      <Header />
      
      <main>
        {/* Hero Section */}
        <section className="gradient-hero text-white py-12 sm:py-16 pt-20 sm:pt-24">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6">
              <i className="fas fa-binary text-2xl sm:text-3xl"></i>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6" data-testid="text-page-title">
              Text to Binary Converter
            </h1>
            <p className="text-lg sm:text-xl text-blue-100 max-w-2xl mx-auto px-2">
              Convert any text to binary code with support for UTF-8 and ASCII encoding
            </p>
          </div>
        </section>

        {/* Introduction Section */}
        <section className="py-8 sm:py-12 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8 sm:mb-12">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4 sm:mb-6">What is a Text to Binary Converter?</h2>
              <p className="text-base sm:text-lg text-gray-700 leading-relaxed max-w-3xl mx-auto">
                A text to binary converter is an essential online tool that transforms human-readable text into binary code 
                (sequences of 0s and 1s) that computers understand. This conversion process translates each character in your 
                text into its corresponding digital representation, making it perfect for programming, education, and data analysis.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 mb-8 sm:mb-12">
              <div className="space-y-3 sm:space-y-4">
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900">How It Works</h3>
                <p className="text-sm sm:text-base text-gray-700">
                  Our text encoder processes each character by converting it to its ASCII or Unicode value, then translating 
                  that numerical value into binary format. The tool supports both UTF-8 encoding for international characters 
                  and ASCII encoding for basic text, with customizable spacing options for better readability.
                </p>
              </div>
              <div className="space-y-3 sm:space-y-4">
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900">Key Features</h3>
                <ul className="text-sm sm:text-base text-gray-700 space-y-1 sm:space-y-2">
                  <li>• UTF-8 and ASCII encoding support</li>
                  <li>• Multiple output formats (binary, decimal, hex)</li>
                  <li>• Customizable binary spacing options</li>
                  <li>• Real-time conversion as you type</li>
                  <li>• Copy results with one click</li>
                  <li>• Conversion history tracking</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Converter Section */}
        <section className="py-8 sm:py-16 bg-gray-50">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <Card className="bg-white shadow-sm border-0">
              <CardContent className="p-4 sm:p-6 lg:p-8">
                <div className="space-y-6 sm:space-y-8">
                  {/* Input Section */}
                  <div>
                    <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-4 sm:mb-6">Text Input</h2>
                    
                    {/* Text Area */}
                    <div className="space-y-3 sm:space-y-4">
                      <Label htmlFor="text-input" className="text-sm font-medium text-gray-700">
                        Enter Text to Convert
                      </Label>
                      <Textarea
                        id="text-input"
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        className="w-full h-24 sm:h-32 p-3 sm:p-4 text-sm sm:text-base border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                        placeholder="Type or paste your text here..."
                        data-testid="textarea-text-input"
                      />
                      <div className="text-xs sm:text-sm text-gray-500 flex justify-between">
                        <span>{inputText.length} characters</span>
                        <span>{new Blob([inputText]).size} bytes</span>
                      </div>
                    </div>

                    {/* Conversion Options */}
                    <div className="mt-4 sm:mt-6 space-y-3 sm:space-y-4">
                      <h3 className="text-base sm:text-lg font-semibold text-gray-900">Conversion Options</h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                        {/* Encoding */}
                        <div className="space-y-2 sm:space-y-3">
                          <Label className="text-sm font-medium">Character Encoding</Label>
                          <Select 
                            value={options.encoding} 
                            onValueChange={(value: typeof options.encoding) => updateOption('encoding', value)}
                          >
                            <SelectTrigger className="h-10 sm:h-11" data-testid="select-encoding">
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
                        <div className="space-y-2 sm:space-y-3">
                          <Label className="text-sm font-medium">Binary Spacing</Label>
                          <Select 
                            value={options.spacing} 
                            onValueChange={(value: typeof options.spacing) => updateOption('spacing', value)}
                          >
                            <SelectTrigger className="h-10 sm:h-11" data-testid="select-spacing">
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
                      <div className="space-y-3 sm:space-y-4">
                        <h4 className="text-sm sm:text-base font-medium text-gray-900">Display Options</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                          <div className="flex items-center justify-between p-3 sm:p-4 border border-gray-200 rounded-lg">
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

                          <div className="flex items-center justify-between p-3 sm:p-4 border border-gray-200 rounded-lg">
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
                    <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 mt-4 sm:mt-6">
                      <Button
                        onClick={handleClear}
                        variant="outline"
                        className="w-full sm:flex-1 text-sm sm:text-base"
                        data-testid="button-clear-text"
                      >
                        <i className="fas fa-trash mr-1 sm:mr-2"></i>
                        <span className="hidden sm:inline">Clear Text</span>
                        <span className="sm:hidden">Clear</span>
                      </Button>
                      <Button
                        onClick={handleSampleText}
                        variant="outline"
                        className="w-full sm:flex-1 text-sm sm:text-base"
                        data-testid="button-sample-text"
                      >
                        <i className="fas fa-file-text mr-1 sm:mr-2"></i>
                        <span className="hidden sm:inline">Sample Text</span>
                        <span className="sm:hidden">Sample</span>
                      </Button>
                      <Button
                        onClick={convertText}
                        disabled={!inputText.trim()}
                        className="w-full sm:flex-1 text-sm sm:text-base"
                        data-testid="button-convert"
                      >
                        <i className="fas fa-exchange-alt mr-1 sm:mr-2"></i>
                        <span className="hidden sm:inline">Convert to Binary</span>
                        <span className="sm:hidden">Convert</span>
                      </Button>
                    </div>
                  </div>

                  {/* Results Section */}
                  {conversionResult && (
                    <div>
                      <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-4 sm:mb-6">Conversion Results</h2>
                      
                      <div className="space-y-4 sm:space-y-6" data-testid="conversion-results">
                        {/* Binary Output */}
                        <div className="space-y-2 sm:space-y-3">
                          <div className="flex items-center justify-between">
                            <Label className="text-base sm:text-lg font-medium text-gray-900">Binary Code</Label>
                            <Button
                              onClick={() => handleCopyToClipboard(conversionResult.binary)}
                              variant="ghost"
                              size="sm"
                              className="text-xs sm:text-sm"
                              data-testid="button-copy-binary"
                            >
                              <i className="fas fa-copy mr-1"></i>
                              <span className="hidden sm:inline">Copy</span>
                            </Button>
                          </div>
                          <div className="bg-blue-50 p-3 sm:p-4 rounded-lg border border-blue-200">
                            <div className="font-mono text-xs sm:text-sm break-all text-gray-800" data-testid="binary-output">
                              {conversionResult.binary}
                            </div>
                          </div>
                          <div className="text-xs text-gray-500 break-words">
                            Grouped by bytes: {getBinaryGrouped(conversionResult.binary)}
                          </div>
                        </div>

                        {/* Decimal Output */}
                        {options.showDecimal && (
                          <div className="space-y-2 sm:space-y-3">
                            <div className="flex items-center justify-between">
                              <Label className="text-base sm:text-lg font-medium text-gray-900">Decimal Values</Label>
                              <Button
                                onClick={() => handleCopyToClipboard(conversionResult.decimal)}
                                variant="ghost"
                                size="sm"
                                className="text-xs sm:text-sm"
                                data-testid="button-copy-decimal"
                              >
                                <i className="fas fa-copy mr-1"></i>
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
                                className="text-xs sm:text-sm"
                                data-testid="button-copy-hex"
                              >
                                <i className="fas fa-copy mr-1"></i>
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
                            <div className="text-lg sm:text-xl lg:text-2xl font-bold text-blue-600" data-testid="char-count">
                              {conversionResult.charCount}
                            </div>
                            <div className="text-xs sm:text-sm text-blue-800">Characters</div>
                          </div>
                          
                          <div className="bg-green-50 p-3 sm:p-4 rounded-lg text-center">
                            <div className="text-lg sm:text-xl lg:text-2xl font-bold text-green-600" data-testid="byte-count">
                              {conversionResult.byteCount}
                            </div>
                            <div className="text-xs sm:text-sm text-green-800">Bytes</div>
                          </div>
                          
                          <div className="bg-purple-50 p-3 sm:p-4 rounded-lg text-center">
                            <div className="text-lg sm:text-xl lg:text-2xl font-bold text-purple-600" data-testid="binary-length">
                              {conversionResult.binary.replace(/\s/g, '').length}
                            </div>
                            <div className="text-xs sm:text-sm text-purple-800">Binary Digits</div>
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

                  {!conversionResult && !inputText.trim() && (
                    <div className="text-center py-8 sm:py-12 text-gray-500">
                      <i className="fas fa-binary text-3xl sm:text-4xl mb-3 sm:mb-4"></i>
                      <p className="text-base sm:text-lg">Enter text above to convert to binary code</p>
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
                                  "{item.originalText}"
                                </div>
                                <div className="font-mono text-xs text-gray-600 break-all" data-testid={`history-binary-${index}`}>
                                  {item.binary.length > 80 ? item.binary.substring(0, 80) + '...' : item.binary}
                                </div>
                              </div>
                              <div className="ml-2 sm:ml-4 flex gap-1 sm:gap-2 flex-shrink-0">
                                <Button
                                  onClick={() => handleCopyToClipboard(item.binary)}
                                  variant="ghost"
                                  size="sm"
                                  className="p-2"
                                  data-testid={`button-copy-history-${index}`}
                                >
                                  <i className="fas fa-copy text-xs sm:text-sm"></i>
                                </Button>
                                <Button
                                  onClick={() => setInputText(item.originalText)}
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
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Who Uses Text to Binary Converters?</h2>
              <p className="text-lg text-gray-700 max-w-3xl mx-auto">
                From computer science students to software engineers, text to binary converters are essential tools 
                across various fields and professional disciplines.
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
              <div className="bg-blue-50 p-6 rounded-lg">
                <h3 className="text-xl font-semibold text-blue-900 mb-4">Students & Educators</h3>
                <p className="text-blue-800 mb-4">
                  Essential for computer science courses, understanding data representation, and learning how computers 
                  process text at the fundamental level.
                </p>
                <ul className="text-blue-700 text-sm space-y-1">
                  <li>• Binary encoding assignments</li>
                  <li>• Data structures coursework</li>
                  <li>• Computer architecture studies</li>
                </ul>
              </div>
              
              <div className="bg-green-50 p-6 rounded-lg">
                <h3 className="text-xl font-semibold text-green-900 mb-4">Software Developers</h3>
                <p className="text-green-800 mb-4">
                  Critical for debugging character encoding issues, understanding data transmission, 
                  and working with low-level programming concepts.
                </p>
                <ul className="text-green-700 text-sm space-y-1">
                  <li>• Character encoding debugging</li>
                  <li>• Protocol development</li>
                  <li>• Data serialization</li>
                </ul>
              </div>
              
              <div className="bg-purple-50 p-6 rounded-lg">
                <h3 className="text-xl font-semibold text-purple-900 mb-4">Cybersecurity Analysts</h3>
                <p className="text-purple-800 mb-4">
                  Valuable for encoding data for steganography, analyzing binary patterns, 
                  and understanding how text is represented in digital forensics.
                </p>
                <ul className="text-purple-700 text-sm space-y-1">
                  <li>• Data hiding techniques</li>
                  <li>• Forensic analysis</li>
                  <li>• Malware reverse engineering</li>
                </ul>
              </div>
              
              <div className="bg-orange-50 p-6 rounded-lg">
                <h3 className="text-xl font-semibold text-orange-900 mb-4">Content Creators & Writers</h3>
                <p className="text-orange-800 mb-4">
                  Useful for creating encoded content, puzzle games, and educational materials 
                  that demonstrate computer concepts to audiences.
                </p>
                <ul className="text-orange-700 text-sm space-y-1">
                  <li>• Educational content creation</li>
                  <li>• Puzzle and game design</li>
                  <li>• Technical writing</li>
                </ul>
              </div>
              
              <div className="bg-red-50 p-6 rounded-lg">
                <h3 className="text-xl font-semibold text-red-900 mb-4">Network Engineers</h3>
                <p className="text-red-800 mb-4">
                  Important for understanding packet structures, protocol analysis, 
                  and troubleshooting data transmission issues.
                </p>
                <ul className="text-red-700 text-sm space-y-1">
                  <li>• Packet analysis</li>
                  <li>• Protocol troubleshooting</li>
                  <li>• Network diagnostics</li>
                </ul>
              </div>
              
              <div className="bg-teal-50 p-6 rounded-lg">
                <h3 className="text-xl font-semibold text-teal-900 mb-4">Researchers & Scientists</h3>
                <p className="text-teal-800 mb-4">
                  Essential for data encoding in research applications, working with scientific instruments, 
                  and processing experimental data.
                </p>
                <ul className="text-teal-700 text-sm space-y-1">
                  <li>• Research data encoding</li>
                  <li>• Scientific computing</li>
                  <li>• Instrument data processing</li>
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
                Enhance your text processing workflow with our comprehensive suite of conversion and analysis tools.
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <a href="/tools/binary-to-text-converter" className="block bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow border border-gray-200">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <i className="fas fa-exchange-alt text-blue-600 text-xl"></i>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Binary to Text Converter</h3>
                <p className="text-gray-600 text-sm">
                  Decode binary code, decimal values, and hexadecimal back into readable text with multiple encoding options.
                </p>
              </a>
              
              <a href="/tools/character-counter" className="block bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow border border-gray-200">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                  <i className="fas fa-calculator text-green-600 text-xl"></i>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Character Counter</h3>
                <p className="text-gray-600 text-sm">
                  Count characters, words, sentences, and paragraphs with detailed text statistics and analysis.
                </p>
              </a>
              
              <a href="/tools/word-counter" className="block bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow border border-gray-200">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                  <i className="fas fa-file-text text-purple-600 text-xl"></i>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Word Counter</h3>
                <p className="text-gray-600 text-sm">
                  Analyze text length, reading time, keyword density, and get comprehensive word statistics.
                </p>
              </a>
              
              <a href="/tools/case-converter" className="block bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow border border-gray-200">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                  <i className="fas fa-text-height text-orange-600 text-xl"></i>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Case Converter</h3>
                <p className="text-gray-600 text-sm">
                  Transform text between uppercase, lowercase, title case, and sentence case formats.
                </p>
              </a>
              
              <a href="/tools/reverse-text-tool" className="block bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow border border-gray-200">
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                  <i className="fas fa-undo text-red-600 text-xl"></i>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Reverse Text Tool</h3>
                <p className="text-gray-600 text-sm">
                  Reverse text character by character, word by word, or line by line for creative projects.
                </p>
              </a>
              
              <a href="/tools/lorem-ipsum-generator" className="block bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow border border-gray-200">
                <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center mb-4">
                  <i className="fas fa-file-alt text-teal-600 text-xl"></i>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Lorem Ipsum Generator</h3>
                <p className="text-gray-600 text-sm">
                  Generate placeholder text for design mockups, content templates, and development projects.
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
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Why would I need to convert text to binary?</h3>
                <p className="text-gray-700">
                  Text to binary conversion is essential for understanding how computers store and process information. 
                  It's used in programming education, debugging character encoding issues, data transmission protocols, 
                  cybersecurity analysis, and creating encoded messages for puzzles or games.
                </p>
              </div>
              
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">What's the difference between UTF-8 and ASCII encoding?</h3>
                <p className="text-gray-700">
                  ASCII encoding supports only 128 basic characters (English letters, numbers, common symbols) using 7 bits. 
                  UTF-8 is a more comprehensive encoding that supports over a million characters including international 
                  languages, emojis, and special symbols. Choose ASCII for basic English text or UTF-8 for full Unicode support.
                </p>
              </div>
              
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Can I convert special characters and emojis?</h3>
                <p className="text-gray-700">
                  Yes! When using UTF-8 encoding, our converter supports all Unicode characters including special symbols, 
                  international characters, and emojis. ASCII encoding will replace non-ASCII characters with a question mark (?). 
                  For full character support, always use UTF-8 encoding.
                </p>
              </div>
              
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">What are the different spacing options for?</h3>
                <p className="text-gray-700">
                  Binary spacing options improve readability of the output. "No Spacing" produces continuous binary digits, 
                  "Space Between Bytes" separates each 8-bit character with spaces, and "Pipe Separated" uses | symbols 
                  for clear byte boundaries. Choose based on your specific use case and readability preferences.
                </p>
              </div>
              
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Is there a limit to how much text I can convert?</h3>
                <p className="text-gray-700">
                  While there's no strict character limit, very large texts may take longer to process and display. 
                  For optimal performance, we recommend processing text in reasonable chunks. The tool shows character 
                  and byte counts to help you monitor your input size.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* SEO Content Section */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="prose prose-lg max-w-none">
              <h2 className="text-3xl font-bold text-gray-900 mb-8">Master Text to Binary Conversion: Complete Guide</h2>
              
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Professional Applications</h3>
                  <p className="text-gray-700 mb-4">
                    Text to binary conversion is fundamental in software development, data processing, and computer science education. 
                    Developers use binary encoding to understand character representation, debug encoding issues, and work with 
                    low-level programming concepts.
                  </p>
                  <p className="text-gray-700">
                    Network engineers rely on text encoders to understand packet structures and protocol implementations, 
                    while cybersecurity professionals use binary conversion for data analysis and forensic investigations.
                  </p>
                </div>
                
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Educational Value</h3>
                  <p className="text-gray-700 mb-4">
                    For students learning computer science, text to binary conversion demonstrates how computers represent 
                    and process human language. This fundamental concept bridges the gap between human communication 
                    and machine understanding.
                  </p>
                  <p className="text-gray-700">
                    Educators use binary converters to create interactive lessons about data representation, character encoding, 
                    and the binary number system, making abstract concepts tangible and understandable.
                  </p>
                </div>
              </div>
              
              <div className="mt-12 p-6 bg-blue-50 rounded-lg">
                <h3 className="text-xl font-semibold text-blue-900 mb-4">Best Practices for Text to Binary Conversion</h3>
                <ul className="text-blue-800 space-y-2">
                  <li>• Use UTF-8 encoding for international text and special characters</li>
                  <li>• Choose appropriate spacing options based on your output requirements</li>
                  <li>• Enable decimal and hexadecimal outputs for cross-reference verification</li>
                  <li>• Use the conversion history feature to track and compare different inputs</li>
                  <li>• Test with sample text first to understand the output format</li>
                </ul>
              </div>
              
              <div className="mt-12">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Enhance Your Text Processing Workflow</h3>
                <p className="text-gray-700 mb-6">
                  Maximize your efficiency by combining our text to binary converter with complementary text processing tools. 
                  After encoding your text, use our <a href="/tools/character-counter" className="text-blue-600 hover:text-blue-800 font-medium">character counter</a> 
                  to analyze the original text statistics and structure.
                </p>
                <p className="text-gray-700 mb-6">
                  For content creators working with encoded data, pair the binary encoder with our <a href="/tools/word-counter" className="text-blue-600 hover:text-blue-800 font-medium">word counter tool</a> 
                  to get detailed analytics, or use the <a href="/tools/case-converter" className="text-blue-600 hover:text-blue-800 font-medium">case converter</a> 
                  to standardize your text format before encoding.
                </p>
                <p className="text-gray-700">
                  Need to reverse the process? Our <a href="/tools/binary-to-text-converter" className="text-blue-600 hover:text-blue-800 font-medium">binary to text converter</a> 
                  decodes binary data back into readable text. For creative applications, try the <a href="/tools/reverse-text-tool" className="text-blue-600 hover:text-blue-800 font-medium">reverse text tool</a> 
                  to manipulate your text before binary conversion.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default TextToBinaryConverter;