import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';

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
}

export default function TextToBinaryConverter() {
  const [inputText, setInputText] = useState('');
  const [conversionResult, setConversionResult] = useState<ConversionResult | null>(null);
  const [fontSize, setFontSize] = useState([14]);
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
      byteCount: new Blob([inputText]).size
    };

    setConversionResult(result);
  };

  const handleCopy = (text: string) => {
    if (text) {
      navigator.clipboard.writeText(text);
    }
  };

  const handleClear = () => {
    setInputText('');
    setConversionResult(null);
  };

  const resetConverter = () => {
    setInputText('');
    setConversionResult(null);
    setOptions({
      encoding: 'utf8',
      spacing: 'space',
      showDecimal: true,
      showHex: true
    });
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Helmet>
        <title>Text to Binary Converter - Convert Text to Binary Code | DapsiWow</title>
        <meta name="description" content="Professional text to binary converter tool. Convert any text to binary code instantly with UTF-8 and ASCII encoding support. Essential for developers, programmers, and computer science students." />
        <meta name="keywords" content="text to binary converter, binary encoder, text to binary code, ASCII to binary, UTF-8 binary converter, text encoder, programming tools, computer science, binary code generator, online text converter" />
        <meta property="og:title" content="Text to Binary Converter - Convert Text to Binary Code | DapsiWow" />
        <meta property="og:description" content="Professional online text to binary converter. Convert any text to binary code with UTF-8 and ASCII encoding. Essential tool for developers and computer science education." />
        <meta property="og:type" content="website" />
        <meta name="robots" content="index, follow" />
        <meta name="author" content="DapsiWow" />
        <link rel="canonical" href="https://dapsiwow.com/tools/text-to-binary-converter" />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            "name": "Text to Binary Converter",
            "description": "Professional text to binary converter for transforming human-readable text into binary code with UTF-8 and ASCII encoding support for programming and educational purposes.",
            "url": "https://dapsiwow.com/tools/text-to-binary-converter",
            "applicationCategory": "DeveloperApplication",
            "operatingSystem": "Any",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "USD"
            },
            "featureList": [
              "UTF-8 and ASCII encoding support",
              "Real-time text conversion",
              "Multiple output formats (binary, decimal, hex)",
              "Customizable spacing options",
              "One-click copy functionality"
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
                <span className="text-sm font-medium text-blue-700">Professional Text Encoder</span>
              </div>
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-slate-900 leading-tight">
                Text to Binary
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                  Converter
                </span>
              </h1>
              <p className="text-xl sm:text-2xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
                Transform any text into binary code with professional encoding options for developers and students
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
                    <p className="text-gray-600">Configure your text to binary conversion options</p>
                  </div>

                  <div className="space-y-6">
                    {/* Text Input */}
                    <div className="space-y-3">
                      <Label htmlFor="text-input" className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                        Text Input
                      </Label>
                      <Textarea
                        id="text-input"
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        className="w-full h-32 text-lg border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-blue-500 resize-none"
                        placeholder="Type or paste your text here..."
                        data-testid="textarea-text-input"
                      />
                      <div className="text-sm text-gray-500 flex justify-between">
                        <span>{inputText.length} characters</span>
                        <span>{new Blob([inputText]).size} bytes</span>
                      </div>
                    </div>

                    {/* Encoding Selection */}
                    <div className="space-y-3">
                      <Label htmlFor="encoding-select" className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                        Character Encoding
                      </Label>
                      <Select
                        value={options.encoding}
                        onValueChange={(value: 'utf8' | 'ascii') => 
                          setOptions(prev => ({ ...prev, encoding: value }))
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

                    {/* Spacing Options */}
                    <div className="space-y-3">
                      <Label htmlFor="spacing-select" className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                        Binary Spacing
                      </Label>
                      <Select
                        value={options.spacing}
                        onValueChange={(value: 'none' | 'space' | 'byte') => 
                          setOptions(prev => ({ ...prev, spacing: value }))
                        }
                      >
                        <SelectTrigger className="h-14 border-2 border-gray-200 rounded-xl text-lg" data-testid="select-spacing">
                          <SelectValue placeholder="Select spacing" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">No Spacing</SelectItem>
                          <SelectItem value="space">Space Between Bytes</SelectItem>
                          <SelectItem value="byte">Pipe Separated (|)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Display Options */}
                    <div className="space-y-4 bg-gray-50 rounded-xl p-6">
                      <h4 className="text-sm font-semibold text-gray-800 uppercase tracking-wide">Display Options</h4>
                      <div className="space-y-4">
                        <div className="flex items-center space-x-3">
                          <input
                            id="show-decimal"
                            type="checkbox"
                            checked={options.showDecimal}
                            onChange={(e) => setOptions(prev => ({ ...prev, showDecimal: e.target.checked }))}
                            className="h-5 w-5 text-blue-600 border-2 border-gray-300 rounded focus:ring-blue-500"
                            data-testid="checkbox-show-decimal"
                          />
                          <label htmlFor="show-decimal" className="text-sm font-medium text-gray-700">
                            Show decimal values
                          </label>
                        </div>
                        <div className="flex items-center space-x-3">
                          <input
                            id="show-hex"
                            type="checkbox"
                            checked={options.showHex}
                            onChange={(e) => setOptions(prev => ({ ...prev, showHex: e.target.checked }))}
                            className="h-5 w-5 text-blue-600 border-2 border-gray-300 rounded focus:ring-blue-500"
                            data-testid="checkbox-show-hex"
                          />
                          <label htmlFor="show-hex" className="text-sm font-medium text-gray-700">
                            Show hexadecimal values
                          </label>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4 pt-6">
                      <Button
                        onClick={convertText}
                        disabled={!inputText.trim()}
                        className="flex-1 h-14 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold text-lg rounded-xl shadow-lg transform transition-all duration-200 hover:scale-105"
                        data-testid="button-convert"
                      >
                        Convert to Binary
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
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">Conversion Results</h2>
                  </div>

                  {/* Font Size Slider */}
                  <div className="mb-8 bg-white rounded-xl p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                      <Label className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                        Output Font Size
                      </Label>
                      <span className="text-sm text-gray-600 font-mono">{fontSize[0]}px</span>
                    </div>
                    <Slider
                      value={fontSize}
                      onValueChange={setFontSize}
                      max={24}
                      min={10}
                      step={2}
                      className="w-full"
                      data-testid="slider-font-size"
                    />
                    <div className="flex justify-between text-xs text-gray-400 mt-2">
                      <span>10px</span>
                      <span>24px</span>
                    </div>
                  </div>

                  {conversionResult ? (
                    <div className="space-y-6" data-testid="conversion-results">
                      {/* Binary Output */}
                      <div className="bg-white rounded-2xl p-6 shadow-lg border border-blue-100">
                        <div className="flex justify-between items-center mb-4">
                          <h3 className="text-lg font-bold text-gray-900">Binary Code</h3>
                          <Button
                            onClick={() => handleCopy(conversionResult.binary)}
                            className="h-10 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg"
                            data-testid="button-copy-binary"
                          >
                            Copy Binary
                          </Button>
                        </div>
                        <div 
                          className="font-mono bg-blue-50 p-4 rounded-lg border break-all" 
                          style={{ fontSize: `${fontSize[0]}px` }}
                          data-testid="binary-output"
                        >
                          {conversionResult.binary}
                        </div>
                      </div>

                      {/* Decimal Output */}
                      {options.showDecimal && (
                        <div className="bg-white rounded-2xl p-6 shadow-lg border border-green-100">
                          <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold text-gray-900">Decimal Values</h3>
                            <Button
                              onClick={() => handleCopy(conversionResult.decimal)}
                              className="h-10 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg"
                              data-testid="button-copy-decimal"
                            >
                              Copy Decimal
                            </Button>
                          </div>
                          <div 
                            className="font-mono bg-green-50 p-4 rounded-lg border break-all" 
                            style={{ fontSize: `${fontSize[0]}px` }}
                            data-testid="decimal-output"
                          >
                            {conversionResult.decimal}
                          </div>
                        </div>
                      )}

                      {/* Hexadecimal Output */}
                      {options.showHex && (
                        <div className="bg-white rounded-2xl p-6 shadow-lg border border-purple-100">
                          <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold text-gray-900">Hexadecimal Values</h3>
                            <Button
                              onClick={() => handleCopy(conversionResult.hexadecimal)}
                              className="h-10 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg"
                              data-testid="button-copy-hex"
                            >
                              Copy Hex
                            </Button>
                          </div>
                          <div 
                            className="font-mono bg-purple-50 p-4 rounded-lg border break-all" 
                            style={{ fontSize: `${fontSize[0]}px` }}
                            data-testid="hex-output"
                          >
                            {conversionResult.hexadecimal}
                          </div>
                        </div>
                      )}

                      {/* Text Statistics */}
                      <div className="bg-white rounded-xl p-6 shadow-sm" data-testid="conversion-statistics">
                        <h3 className="font-bold text-gray-900 mb-4 text-lg">Conversion Statistics</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          <div className="bg-blue-50 rounded-lg p-4 text-center">
                            <div className="text-2xl font-bold text-blue-600">{conversionResult.charCount}</div>
                            <div className="text-sm text-blue-700 font-medium">Characters</div>
                          </div>
                          <div className="bg-green-50 rounded-lg p-4 text-center">
                            <div className="text-2xl font-bold text-green-600">{conversionResult.byteCount}</div>
                            <div className="text-sm text-green-700 font-medium">Bytes</div>
                          </div>
                          <div className="bg-purple-50 rounded-lg p-4 text-center">
                            <div className="text-2xl font-bold text-purple-600">
                              {conversionResult.binary.replace(/\s/g, '').length}
                            </div>
                            <div className="text-sm text-purple-700 font-medium">Binary Digits</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-16" data-testid="no-results">
                      <div className="w-20 h-20 bg-gray-200 rounded-full mx-auto mb-6 flex items-center justify-center">
                        <div className="text-3xl font-bold text-gray-400">01</div>
                      </div>
                      <p className="text-gray-500 text-lg">Enter text to see binary conversion results</p>
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
                <h3 className="text-2xl font-bold text-gray-900 mb-6">What is Text to Binary Conversion?</h3>
                <div className="space-y-4 text-gray-600">
                  <p>
                    Text to binary conversion is the process of transforming human-readable text into binary code, 
                    the fundamental language that computers use to process and store information. Each character 
                    in your text is converted to its corresponding numerical value and then represented as a sequence 
                    of 0s and 1s.
                  </p>
                  <p>
                    Our professional text to binary converter supports both UTF-8 and ASCII encoding systems, 
                    allowing you to convert any text from simple English letters to complex international characters. 
                    This tool is essential for computer science education, programming projects, and understanding 
                    how digital data is stored and transmitted.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Why Use a Text to Binary Converter?</h3>
                <div className="space-y-4 text-gray-600">
                  <p>
                    Binary conversion is fundamental to understanding how computers process information. Whether 
                    you're a student learning computer science, a developer working on low-level programming, 
                    or simply curious about digital representation, this tool provides instant, accurate conversions.
                  </p>
                  <ul className="space-y-2 list-disc list-inside">
                    <li>Learn computer science fundamentals and data representation</li>
                    <li>Debug encoding issues in programming projects</li>
                    <li>Understand how text is stored digitally</li>
                    <li>Educational tool for teaching binary systems</li>
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
                    <span>Real-time conversion as you type</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>UTF-8 and ASCII encoding support</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Multiple output formats: binary, decimal, hexadecimal</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Customizable spacing options for readability</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>One-click copy functionality for all formats</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Character and byte count statistics</span>
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
                    <span>Computer science education and teaching</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Programming and software development debugging</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Data encoding and transmission analysis</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Understanding character encoding systems</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Cryptography and data security studies</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Additional SEO Content Sections */}
          <div className="mt-12 space-y-8">
            {/* How Binary Encoding Works */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">How Binary Encoding Works</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-gray-800">ASCII Encoding Process</h4>
                    <p className="text-gray-600">
                      ASCII (American Standard Code for Information Interchange) uses 7-bit encoding to represent 
                      128 different characters including letters, numbers, and special symbols. Each character is 
                      assigned a unique numerical value between 0-127, which is then converted to an 8-bit binary 
                      representation for storage and transmission.
                    </p>
                    <p className="text-gray-600">
                      For example, the letter 'A' has an ASCII value of 65, which converts to the binary 
                      representation 01000001. This system ensures consistent character representation across 
                      different computer systems and platforms.
                    </p>
                  </div>
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-gray-800">UTF-8 Unicode Encoding</h4>
                    <p className="text-gray-600">
                      UTF-8 (8-bit Unicode Transformation Format) extends ASCII to support international characters, 
                      emojis, and symbols from virtually every writing system. It uses variable-length encoding, 
                      where basic ASCII characters use one byte, while complex characters may use up to four bytes.
                    </p>
                    <p className="text-gray-600">
                      This backward-compatible system allows UTF-8 to handle over one million different characters 
                      while maintaining efficiency for common text. Our converter automatically handles both 
                      simple and complex character encoding to provide accurate binary representations.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Educational Value */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Educational Applications and Learning Benefits</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-gray-800">Computer Science Students</h4>
                    <p className="text-gray-600">
                      Understanding binary representation is fundamental to computer science education. Students 
                      can use this tool to visualize how text data is stored in computer memory, learn about 
                      different encoding systems, and understand the relationship between human-readable text 
                      and machine-readable binary code.
                    </p>
                  </div>
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-gray-800">Programming and Development</h4>
                    <p className="text-gray-600">
                      Developers working with low-level programming, data transmission, or file formats benefit 
                      from understanding binary representation. This tool helps debug encoding issues, understand 
                      data sizes, and verify that text is being properly encoded and decoded in applications.
                    </p>
                  </div>
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-gray-800">Digital Literacy Education</h4>
                    <p className="text-gray-600">
                      As digital literacy becomes increasingly important, understanding how computers store and 
                      process information is valuable knowledge. This converter serves as an educational tool 
                      to demonstrate the digital representation of information and how human communication 
                      translates to computer language.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Advanced Features */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Advanced Features and Technical Details</h3>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h4 className="text-lg font-semibold text-gray-800">Multiple Output Formats</h4>
                      <p className="text-gray-600">
                        Our converter provides three distinct output formats to meet different needs. Binary output 
                        shows the pure 0s and 1s representation, decimal output displays the numerical values of 
                        each character, and hexadecimal output provides a more compact representation often used 
                        in programming and debugging.
                      </p>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li>• Binary: Direct machine-readable format</li>
                        <li>• Decimal: Human-friendly numerical representation</li>
                        <li>• Hexadecimal: Compact programming format</li>
                      </ul>
                    </div>
                    <div className="space-y-4">
                      <h4 className="text-lg font-semibold text-gray-800">Customizable Spacing Options</h4>
                      <p className="text-gray-600">
                        The tool offers flexible spacing options to enhance readability and meet specific formatting 
                        requirements. Choose from no spacing for compact output, space-separated bytes for easy 
                        reading, or pipe-separated format for clear byte boundaries in technical documentation.
                      </p>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li>• No spacing: Compact continuous output</li>
                        <li>• Byte spacing: Space between 8-bit groups</li>
                        <li>• Pipe separated: Clear byte boundaries</li>
                      </ul>
                    </div>
                  </div>
                  <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
                    <h4 className="text-lg font-semibold text-gray-800 mb-3">Real-Time Conversion Technology</h4>
                    <p className="text-gray-600">
                      The converter features real-time processing that automatically updates results as you type, 
                      providing instant feedback and allowing for interactive learning. This immediate response 
                      helps users understand the relationship between input text and binary output, making it an 
                      excellent educational tool for demonstrating encoding concepts.
                    </p>
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
}