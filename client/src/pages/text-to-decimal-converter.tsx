
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
  outputFormat: 'spaced' | 'comma' | 'newline';
  showBinary: boolean;
  showHex: boolean;
  preserveNumbers: boolean;
  addPrefix: string;
  addSuffix: string;
}

interface ConversionResult {
  originalText: string;
  decimal: string;
  binary: string;
  hexadecimal: string;
  charCount: number;
  byteCount: number;
  timestamp: Date;
}

const TextToDecimalConverter = () => {
  const [inputText, setInputText] = useState('');
  const [conversionResult, setConversionResult] = useState<ConversionResult | null>(null);
  const [conversionHistory, setConversionHistory] = useState<ConversionResult[]>([]);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [options, setOptions] = useState<ConversionOptions>({
    encoding: 'utf8',
    outputFormat: 'spaced',
    showBinary: false,
    showHex: false,
    preserveNumbers: false,
    addPrefix: '',
    addSuffix: ''
  });

  const textToDecimal = (text: string, encoding: 'utf8' | 'ascii' = 'utf8', outputFormat: string = 'spaced'): string => {
    if (!text) return '';
    
    const codePoints = Array.from(text);
    const decimalValues = codePoints.map(char => {
      let codePoint = char.codePointAt(0)!;
      
      // For ASCII encoding, limit to 7-bit characters
      if (encoding === 'ascii' && codePoint > 127) {
        codePoint = 63; // '?' character for non-ASCII
      }
      
      return codePoint.toString();
    });
    
    // Format based on output format
    switch (outputFormat) {
      case 'spaced':
        return decimalValues.join(' ');
      case 'comma':
        return decimalValues.join(', ');
      case 'newline':
        return decimalValues.join('\n');
      default:
        return decimalValues.join(' ');
    }
  };

  const textToBinary = (text: string): string => {
    if (!text) return '';
    const codePoints = Array.from(text);
    return codePoints.map(char => 
      char.codePointAt(0)!.toString(2).padStart(8, '0')
    ).join(' ');
  };

  const textToHex = (text: string): string => {
    if (!text) return '';
    const codePoints = Array.from(text);
    return codePoints.map(char => {
      const hex = char.codePointAt(0)!.toString(16).toUpperCase();
      return hex.length === 1 ? '0' + hex : hex;
    }).join(' ');
  };

  const convertText = () => {
    if (!inputText.trim()) {
      setConversionResult(null);
      setShowResults(false);
      return;
    }

    try {
      const decimal = textToDecimal(inputText, options.encoding, options.outputFormat);
      const binary = textToBinary(inputText);
      const hexadecimal = textToHex(inputText);
      
      // Apply prefix and suffix to decimal output if provided
      let formattedDecimal = decimal;
      if (options.addPrefix || options.addSuffix) {
        formattedDecimal = `${options.addPrefix}${decimal}${options.addSuffix}`;
      }
      
      const result: ConversionResult = {
        originalText: inputText,
        decimal: formattedDecimal,
        binary,
        hexadecimal,
        charCount: Array.from(inputText).length,
        byteCount: new Blob([inputText]).size,
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
    }
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
    setShowResults(false);
  };

  const handleSampleText = () => {
    setInputText('Hello World! Welcome to DapsiWow\'s Text to Decimal Converter. This tool transforms your text into decimal character codes.');
  };

  const resetConverter = () => {
    setInputText('');
    setConversionResult(null);
    setShowResults(false);
    setShowAdvanced(false);
    setOptions({
      encoding: 'utf8',
      outputFormat: 'spaced',
      showBinary: false,
      showHex: false,
      preserveNumbers: false,
      addPrefix: '',
      addSuffix: ''
    });
  };

  // Reset results when input is cleared
  useEffect(() => {
    if (!inputText.trim()) {
      setConversionResult(null);
      setShowResults(false);
    }
  }, [inputText]);

  const getOutputFormatLabel = () => {
    switch (options.outputFormat) {
      case 'spaced': return 'Space-separated decimal values';
      case 'comma': return 'Comma-separated decimal values';
      case 'newline': return 'Newline-separated decimal values';
      default: return 'Decimal values';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Helmet>
        <title>Text to Decimal Converter - Convert Text to Unicode Code Points | DapsiWow</title>
        <meta name="description" content="Free text to decimal converter tool. Transform any text to decimal Unicode code points instantly with Unicode and ASCII support. Essential for developers, students, and programmers learning computer science." />
        <meta name="keywords" content="text to decimal converter, decimal encoder, text to Unicode code points, ASCII to decimal, Unicode decimal converter, text encoder, programming tools, computer science, decimal code generator, online text converter" />
        <meta property="og:title" content="Text to Decimal Converter - Convert Text to Unicode Code Points | DapsiWow" />
        <meta property="og:description" content="Free online text to decimal converter. Convert any text to decimal Unicode code points with Unicode and ASCII support. Essential tool for developers and computer science education." />
        <meta property="og:type" content="website" />
        <meta name="robots" content="index, follow" />
        <meta name="author" content="DapsiWow" />
        <link rel="canonical" href="https://dapsiwow.com/tools/text-to-decimal-converter" />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            "name": "Text to Decimal Converter",
            "description": "Professional text to decimal converter for transforming human-readable text into decimal Unicode code points with Unicode and ASCII support for programming and educational purposes.",
            "url": "https://dapsiwow.com/tools/text-to-decimal-converter",
            "applicationCategory": "DeveloperApplication",
            "operatingSystem": "Any",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "USD"
            },
            "featureList": [
              "Text to decimal conversion",
              "Unicode and ASCII support",
              "Multiple output formats (space, comma, newline separated)",
              "Real-time text conversion",
              "Binary and hexadecimal output options",
              "One-click copy functionality"
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
                <span className="font-medium text-blue-700">Professional Text Encoder</span>
              </div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl 2xl:text-7xl font-bold text-slate-900 leading-tight tracking-tight" data-testid="text-page-title">
                <span className="block">Text to Decimal</span>
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                  Converter
                </span>
              </h1>
              <p className="text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl text-slate-600 max-w-xs sm:max-w-md md:max-w-2xl lg:max-w-4xl xl:max-w-5xl mx-auto leading-relaxed px-2 sm:px-4 md:px-6">
                Transform any text into decimal character codes with professional encoding options instantly
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
                    <p className="text-gray-600">Enter your text to convert into decimal character codes</p>
                  </div>

                  <div className="space-y-4 sm:space-y-6">
                    {/* Text Input */}
                    <div className="space-y-3">
                      <Label htmlFor="text-input" className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                        Text to Convert
                      </Label>
                      <Textarea
                        id="text-input"
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        className="min-h-[100px] sm:min-h-[120px] lg:min-h-[140px] text-base sm:text-lg border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-blue-500 resize-none"
                        placeholder="Type or paste your text here to convert to decimal character codes..."
                        data-testid="textarea-text-input"
                      />
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

                    {/* Output Format Options */}
                    <div className="space-y-3">
                      <Label htmlFor="format-select" className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                        Output Format
                      </Label>
                      <Select
                        value={options.outputFormat}
                        onValueChange={(value: 'spaced' | 'comma' | 'newline') => 
                          updateOption('outputFormat', value)
                        }
                      >
                        <SelectTrigger className="h-12 sm:h-14 border-2 border-gray-200 rounded-xl text-base sm:text-lg" data-testid="select-output-format">
                          <SelectValue placeholder="Select format" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="spaced">Space Separated (72 101 108)</SelectItem>
                          <SelectItem value="comma">Comma Separated (72, 101, 108)</SelectItem>
                          <SelectItem value="newline">Newline Separated</SelectItem>
                        </SelectContent>
                      </Select>
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
                                <Label className="text-xs sm:text-sm font-medium">Show Hexadecimal Output</Label>
                                <p className="text-xs text-gray-500">Display hexadecimal representation of text</p>
                              </div>
                              <Switch
                                checked={options.showHex}
                                onCheckedChange={(value) => updateOption('showHex', value)}
                                data-testid="switch-show-hex"
                              />
                            </div>

                            <div className="flex items-center justify-between gap-2">
                              <div className="space-y-1 flex-1 min-w-0">
                                <Label className="text-xs sm:text-sm font-medium">Preserve Numbers</Label>
                                <p className="text-xs text-gray-500">Keep digits in encoded output</p>
                              </div>
                              <Switch
                                checked={options.preserveNumbers}
                                onCheckedChange={(value) => updateOption('preserveNumbers', value)}
                                data-testid="switch-preserve-numbers"
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
                                placeholder="e.g., [ENCODED], OUTPUT:"
                                className="text-sm h-10 sm:h-12 border-2 border-gray-200 rounded-lg"
                                data-testid="input-add-prefix"
                              />
                              <p className="text-xs text-gray-500">Text to add before encoded output</p>
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
                              <p className="text-xs text-gray-500">Text to add after encoded output</p>
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
                      Convert to Decimal
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
                <div className="bg-gradient-to-br from-gray-50 to-blue-50 p-4 sm:p-6 md:p-8 lg:p-10 xl:p-12 border-t">
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6 sm:mb-8">Encoded Results</h2>

                  {showResults && conversionResult && conversionResult.originalText ? (
                    <div className="space-y-3 sm:space-y-4" data-testid="conversion-results">
                      {/* Main Decimal Code Display */}
                      <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-3 sm:p-4">
                        <div className="flex items-center justify-between mb-3 gap-3">
                          <div className="flex-1 min-w-0">
                            <h3 className="text-sm sm:text-base font-semibold text-gray-900 truncate">Decimal Character Codes</h3>
                            <p className="text-xs sm:text-sm text-gray-600 break-words">{getOutputFormatLabel()}</p>
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
                          {conversionResult.decimal || '(empty result)'}
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
                            {conversionResult.binary || '(empty result)'}
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
                            {conversionResult.hexadecimal || '(empty result)'}
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
                        <div className="text-2xl sm:text-3xl font-bold text-gray-400">123</div>
                      </div>
                      <p className="text-gray-500 text-base sm:text-lg px-4">Enter text to convert to decimal character codes</p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* SEO Content Sections */}
          <div className="mt-16 space-y-8">
            {/* What is Text to Decimal Conversion */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">What is Text to Decimal Conversion?</h2>
                <div className="space-y-4 text-gray-600">
                  <p>
                    <strong>Text to decimal conversion</strong> is the fundamental process of transforming human-readable text into decimal numerical representations of each character's Unicode or ASCII code point. This essential computer science concept allows text data to be represented in a numerical format that computers can efficiently process, store, and transmit across different systems and platforms.
                  </p>
                  <p>
                    Our professional text encoder supports comprehensive UTF-8 and ASCII encoding options with multiple output formats including space-separated, comma-separated, and newline-separated decimal values. This flexibility makes it perfect for programming projects, data analysis, debugging applications, educational purposes, and understanding how computers internally represent textual information.
                  </p>
                  <p>
                    The tool features real-time conversion as you type, advanced customization options including prefix and suffix support, and intelligent text processing that handles special characters, numbers, and international Unicode characters appropriately for each encoding system. All processing happens locally in your browser for complete privacy and security.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Encoding Systems and Output Formats */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Understanding Character Encoding Systems</h2>
                <p className="text-gray-600 mb-8">Character encoding systems define how text characters are mapped to numerical values. Our converter supports both modern Unicode (UTF-8) and legacy ASCII encoding standards, each with specific use cases and character ranges.</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold text-gray-900">UTF-8 Encoding</h3>
                    <div className="bg-blue-50 rounded-lg p-6">
                      <p className="text-blue-800 text-sm mb-4">
                        UTF-8 is a variable-width encoding capable of representing any Unicode character using 1-4 bytes. It's backward compatible with ASCII and supports international characters, emojis, and special symbols from all languages worldwide.
                      </p>
                      <div className="space-y-3">
                        <div className="bg-white p-3 rounded border">
                          <h4 className="font-medium text-blue-900 mb-1">Example: "Hello 世界"</h4>
                          <code className="text-xs font-mono text-blue-800">72 101 108 108 111 32 19990 30028</code>
                        </div>
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
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold text-gray-900">ASCII Encoding</h3>
                    <div className="bg-orange-50 rounded-lg p-6">
                      <p className="text-orange-800 text-sm mb-4">
                        ASCII uses exactly 7 bits to represent 128 characters (0-127), including English letters, numbers, punctuation, and basic control characters. It's limited to basic English text but ensures maximum compatibility with legacy systems.
                      </p>
                      <div className="space-y-3">
                        <div className="bg-white p-3 rounded border">
                          <h4 className="font-medium text-orange-900 mb-1">Example: "Hello!"</h4>
                          <code className="text-xs font-mono text-orange-800">72 101 108 108 111 33</code>
                        </div>
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
                  </div>
                </div>

                <div className="mt-8">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Output Format Options</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-green-50 rounded-lg p-4">
                      <h4 className="font-semibold text-green-900 mb-2">Space Separated</h4>
                      <code className="text-sm font-mono text-green-800 block mb-2">72 101 108 108 111</code>
                      <p className="text-xs text-green-700">Most common format, easy to read and process. Ideal for general use and copy-paste operations.</p>
                    </div>
                    <div className="bg-purple-50 rounded-lg p-4">
                      <h4 className="font-semibold text-purple-900 mb-2">Comma Separated</h4>
                      <code className="text-sm font-mono text-purple-800 block mb-2">72, 101, 108, 108, 111</code>
                      <p className="text-xs text-purple-700">CSV-compatible format perfect for spreadsheets and data analysis applications.</p>
                    </div>
                    <div className="bg-teal-50 rounded-lg p-4">
                      <h4 className="font-semibold text-teal-900 mb-2">Newline Separated</h4>
                      <code className="text-sm font-mono text-teal-800 block mb-2">72<br/>101<br/>108</code>
                      <p className="text-xs text-teal-700">Each value on separate line, excellent for programming and data processing scripts.</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Professional Applications and Use Cases */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
                <CardContent className="p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Professional Use Cases</h2>
                  <p className="text-gray-600 mb-6">Text to decimal conversion serves critical functions across numerous professional domains and educational contexts. Understanding these applications helps you leverage the tool effectively.</p>
                  
                  <div className="space-y-4">
                    <div className="bg-blue-50 rounded-lg p-4">
                      <h3 className="font-semibold text-blue-900 mb-2">Software Development</h3>
                      <ul className="text-blue-800 text-sm space-y-1">
                        <li>• Character encoding debugging</li>
                        <li>• Data serialization and protocols</li>
                        <li>• File format specification development</li>
                        <li>• Cross-platform compatibility testing</li>
                      </ul>
                    </div>
                    
                    <div className="bg-green-50 rounded-lg p-4">
                      <h3 className="font-semibold text-green-900 mb-2">Data Analysis & Processing</h3>
                      <ul className="text-green-800 text-sm space-y-1">
                        <li>• Text preprocessing for machine learning</li>
                        <li>• Character frequency analysis</li>
                        <li>• Data migration and transformation</li>
                        <li>• Quality assurance validation</li>
                      </ul>
                    </div>
                    
                    <div className="bg-purple-50 rounded-lg p-4">
                      <h3 className="font-semibold text-purple-900 mb-2">Education & Research</h3>
                      <ul className="text-purple-800 text-sm space-y-1">
                        <li>• Computer science fundamentals</li>
                        <li>• Programming assignments</li>
                        <li>• Algorithm implementation</li>
                        <li>• Academic research projects</li>
                      </ul>
                    </div>

                    <div className="bg-orange-50 rounded-lg p-4">
                      <h3 className="font-semibold text-orange-900 mb-2">Cybersecurity & Forensics</h3>
                      <ul className="text-orange-800 text-sm space-y-1">
                        <li>• Digital evidence analysis</li>
                        <li>• Malware reverse engineering</li>
                        <li>• Data obfuscation techniques</li>
                        <li>• Incident response investigation</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
                <CardContent className="p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Advanced Features & Benefits</h2>
                  <p className="text-gray-600 mb-6">Our text to decimal converter provides professional-grade features designed for accuracy, efficiency, and ease of use across all skill levels.</p>
                  
                  <div className="space-y-4">
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-400 p-4 rounded-r-lg">
                      <h4 className="font-semibold text-blue-900 mb-2">Real-Time Conversion</h4>
                      <p className="text-blue-800 text-sm">Automatic encoding as you type with 300ms debouncing for optimal performance and immediate feedback on character processing.</p>
                    </div>
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-l-4 border-green-400 p-4 rounded-r-lg">
                      <h4 className="font-semibold text-green-900 mb-2">Multiple Output Formats</h4>
                      <p className="text-green-800 text-sm">View results in decimal, binary, and hexadecimal formats simultaneously with customizable display options and formatting.</p>
                    </div>
                    <div className="bg-gradient-to-r from-purple-50 to-violet-50 border-l-4 border-purple-400 p-4 rounded-r-lg">
                      <h4 className="font-semibold text-purple-900 mb-2">Text Customization</h4>
                      <p className="text-purple-800 text-sm">Add custom prefixes and suffixes to encoded output for specific formatting requirements and workflow integration.</p>
                    </div>
                    <div className="bg-gradient-to-r from-orange-50 to-red-50 border-l-4 border-orange-400 p-4 rounded-r-lg">
                      <h4 className="font-semibold text-orange-900 mb-2">Privacy & Security</h4>
                      <p className="text-orange-800 text-sm">All processing happens locally in your browser - no data transmitted to servers, ensuring complete privacy and security.</p>
                    </div>
                    <div className="bg-gradient-to-r from-teal-50 to-cyan-50 border-l-4 border-teal-400 p-4 rounded-r-lg">
                      <h4 className="font-semibold text-teal-900 mb-2">Cross-Platform Compatibility</h4>
                      <p className="text-teal-800 text-sm">Works on all modern browsers and devices with responsive design and accessibility features for universal access.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Common Conversion Examples and Patterns */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Common Conversion Examples & Character Patterns</h2>
                <p className="text-gray-600 mb-8">Understanding how different character types convert to decimal values helps you predict and validate conversion results. These examples demonstrate common patterns and ranges for various character categories.</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="bg-blue-50 rounded-lg p-6">
                    <h3 className="font-semibold text-blue-900 mb-4">Basic ASCII Characters</h3>
                    <div className="space-y-3">
                      <div className="bg-white p-3 rounded border">
                        <h4 className="font-medium text-blue-900 mb-1">Uppercase Letters (A-Z)</h4>
                        <code className="text-xs font-mono text-blue-800">A=65, B=66, C=67, Z=90</code>
                      </div>
                      <div className="bg-white p-3 rounded border">
                        <h4 className="font-medium text-blue-900 mb-1">Lowercase Letters (a-z)</h4>
                        <code className="text-xs font-mono text-blue-800">a=97, b=98, c=99, z=122</code>
                      </div>
                      <div className="bg-white p-3 rounded border">
                        <h4 className="font-medium text-blue-900 mb-1">Numbers (0-9)</h4>
                        <code className="text-xs font-mono text-blue-800">0=48, 1=49, 5=53, 9=57</code>
                      </div>
                    </div>
                  </div>

                  <div className="bg-green-50 rounded-lg p-6">
                    <h3 className="font-semibold text-green-900 mb-4">Special Characters</h3>
                    <div className="space-y-3">
                      <div className="bg-white p-3 rounded border">
                        <h4 className="font-medium text-green-900 mb-1">Common Punctuation</h4>
                        <code className="text-xs font-mono text-green-800">!=33, ?=63, .=46, ,=44</code>
                      </div>
                      <div className="bg-white p-3 rounded border">
                        <h4 className="font-medium text-green-900 mb-1">Whitespace Characters</h4>
                        <code className="text-xs font-mono text-green-800">Space=32, Tab=9, Newline=10</code>
                      </div>
                      <div className="bg-white p-3 rounded border">
                        <h4 className="font-medium text-green-900 mb-1">Mathematical Symbols</h4>
                        <code className="text-xs font-mono text-green-800">+=43, -=45, *=42, /=47</code>
                      </div>
                    </div>
                  </div>

                  <div className="bg-purple-50 rounded-lg p-6">
                    <h3 className="font-semibold text-purple-900 mb-4">International Characters</h3>
                    <div className="space-y-3">
                      <div className="bg-white p-3 rounded border">
                        <h4 className="font-medium text-purple-900 mb-1">European Characters</h4>
                        <code className="text-xs font-mono text-purple-800">é=233, ñ=241, ü=252</code>
                      </div>
                      <div className="bg-white p-3 rounded border">
                        <h4 className="font-medium text-purple-900 mb-1">Currency Symbols</h4>
                        <code className="text-xs font-mono text-purple-800">$=36, €=8364, £=163</code>
                      </div>
                      <div className="bg-white p-3 rounded border">
                        <h4 className="font-medium text-purple-900 mb-1">Emoji Examples</h4>
                        <code className="text-xs font-mono text-purple-800">😀=128512, ❤️=10084</code>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-8 bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Practical Conversion Examples</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="bg-white p-4 rounded border">
                        <h4 className="font-medium text-gray-900 mb-2">Programming Keywords</h4>
                        <p className="text-sm text-gray-600 mb-2">"function" converts to:</p>
                        <code className="text-xs font-mono text-gray-800 block">102 117 110 99 116 105 111 110</code>
                      </div>
                      <div className="bg-white p-4 rounded border">
                        <h4 className="font-medium text-gray-900 mb-2">Common Passwords</h4>
                        <p className="text-sm text-gray-600 mb-2">"Password123!" converts to:</p>
                        <code className="text-xs font-mono text-gray-800 block">80 97 115 115 119 111 114 100 49 50 51 33</code>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="bg-white p-4 rounded border">
                        <h4 className="font-medium text-gray-900 mb-2">Email Address</h4>
                        <p className="text-sm text-gray-600 mb-2">"user@domain.com" converts to:</p>
                        <code className="text-xs font-mono text-gray-800 block">117 115 101 114 64 100 111 109 97 105 110 46 99 111 109</code>
                      </div>
                      <div className="bg-white p-4 rounded border">
                        <h4 className="font-medium text-gray-900 mb-2">URL Components</h4>
                        <p className="text-sm text-gray-600 mb-2">"https://" converts to:</p>
                        <code className="text-xs font-mono text-gray-800 block">104 116 116 112 115 58 47 47</code>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Best Practices and Troubleshooting */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Best Practices & Troubleshooting Guide</h2>
                <p className="text-gray-600 mb-8">Follow these professional guidelines to ensure accurate text to decimal conversion results and troubleshoot common issues that may arise during the encoding process.</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">Conversion Best Practices</h3>
                    <div className="space-y-4">
                      <div className="bg-blue-50 rounded-lg p-4">
                        <h4 className="font-semibold text-blue-900 mb-2">Choose the Right Encoding</h4>
                        <ul className="text-blue-800 text-sm space-y-1">
                          <li>• Use UTF-8 for modern applications and international text</li>
                          <li>• Select ASCII only for legacy systems or basic English text</li>
                          <li>• Consider the target system's encoding capabilities</li>
                          <li>• Test with sample data before processing large amounts</li>
                        </ul>
                      </div>
                      <div className="bg-green-50 rounded-lg p-4">
                        <h4 className="font-semibold text-green-900 mb-2">Output Format Selection</h4>
                        <ul className="text-green-800 text-sm space-y-1">
                          <li>• Use space-separated for general purposes and readability</li>
                          <li>• Choose comma-separated for CSV imports and data analysis</li>
                          <li>• Select newline-separated for programming scripts</li>
                          <li>• Consider the destination application's requirements</li>
                        </ul>
                      </div>
                      <div className="bg-purple-50 rounded-lg p-4">
                        <h4 className="font-semibold text-purple-900 mb-2">Data Validation</h4>
                        <ul className="text-purple-800 text-sm space-y-1">
                          <li>• Verify output matches expected character ranges</li>
                          <li>• Check character count against original text length</li>
                          <li>• Test conversion with known character examples</li>
                          <li>• Validate special characters and unicode symbols</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">Common Issues & Solutions</h3>
                    <div className="space-y-4">
                      <div className="bg-red-50 rounded-lg p-4">
                        <h4 className="font-semibold text-red-900 mb-2">Unexpected Character Values</h4>
                        <p className="text-red-800 text-sm mb-2">Problem: Special characters showing wrong decimal values</p>
                        <p className="text-red-700 text-xs">Solution: Ensure UTF-8 encoding is selected for international characters. ASCII encoding replaces non-ASCII characters with "?" (decimal 63).</p>
                      </div>
                      <div className="bg-orange-50 rounded-lg p-4">
                        <h4 className="font-semibold text-orange-900 mb-2">Large Numbers for Simple Characters</h4>
                        <p className="text-orange-800 text-sm mb-2">Problem: Basic characters showing very high decimal values</p>
                        <p className="text-orange-700 text-xs">Solution: This indicates Unicode characters or emojis. Switch to ASCII encoding if only basic English characters are needed.</p>
                      </div>
                      <div className="bg-yellow-50 rounded-lg p-4">
                        <h4 className="font-semibold text-yellow-900 mb-2">Inconsistent Output Format</h4>
                        <p className="text-yellow-800 text-sm mb-2">Problem: Numbers not separated as expected</p>
                        <p className="text-yellow-700 text-xs">Solution: Check the output format setting (space, comma, or newline separated) and select the appropriate option for your needs.</p>
                      </div>
                      <div className="bg-teal-50 rounded-lg p-4">
                        <h4 className="font-semibold text-teal-900 mb-2">Copy-Paste Issues</h4>
                        <p className="text-teal-800 text-sm mb-2">Problem: Copied text loses formatting or contains extra characters</p>
                        <p className="text-teal-700 text-xs">Solution: Use the built-in copy buttons for each output format. Avoid manual text selection which may include extra whitespace.</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-8 bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Optimization Tips</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white p-4 rounded border">
                      <h4 className="font-medium text-gray-900 mb-2">Large Text Processing</h4>
                      <p className="text-gray-700 text-sm">For very large texts, consider processing in smaller chunks to maintain browser responsiveness and avoid memory issues.</p>
                    </div>
                    <div className="bg-white p-4 rounded border">
                      <h4 className="font-medium text-gray-900 mb-2">Real-Time Conversion</h4>
                      <p className="text-gray-700 text-sm">The tool automatically converts as you type with a 300ms delay. For immediate results, click the Convert button.</p>
                    </div>
                    <div className="bg-white p-4 rounded border">
                      <h4 className="font-medium text-gray-900 mb-2">Browser Compatibility</h4>
                      <p className="text-gray-700 text-sm">Works on all modern browsers. For older browsers, ensure JavaScript is enabled and try refreshing the page.</p>
                    </div>
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
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">What is text to decimal conversion used for?</h3>
                      <p className="text-gray-600 text-sm">
                        Text to decimal conversion transforms human-readable text into numerical character codes. It's essential for programming, data processing, debugging character encoding issues, educational purposes, and understanding how computers internally represent text data.
                      </p>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">What's the difference between UTF-8 and ASCII encoding?</h3>
                      <p className="text-gray-600 text-sm">
                        UTF-8 supports all Unicode characters (including international languages and emojis) using 1-4 bytes per character. ASCII uses exactly 1 byte for 128 basic English characters (0-127). Choose UTF-8 for modern applications and ASCII for legacy systems.
                      </p>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Can I convert emojis and special characters?</h3>
                      <p className="text-gray-600 text-sm">
                        Yes, when using UTF-8 encoding, the converter handles emojis, international characters, mathematical symbols, and other Unicode characters. ASCII encoding will replace non-ASCII characters with "?" (decimal 63).
                      </p>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">How secure is this text to decimal converter?</h3>
                      <p className="text-gray-600 text-sm">
                        Completely secure! All conversion processing happens locally in your browser using client-side JavaScript. No text data is transmitted to servers, stored remotely, or accessed by third parties, ensuring complete privacy.
                      </p>
                    </div>
                  </div>
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Which output format should I choose?</h3>
                      <p className="text-gray-600 text-sm">
                        Space-separated is most common and readable. Comma-separated works well for spreadsheets and CSV files. Newline-separated is ideal for programming scripts and databases. Choose based on your intended use case.
                      </p>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Is there a limit to how much text I can convert?</h3>
                      <p className="text-gray-600 text-sm">
                        There's no strict character limit, but very large texts may take longer to process due to browser memory constraints. The tool displays character and byte counts to help you monitor input size and processing performance.
                      </p>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Can I customize the output with prefixes and suffixes?</h3>
                      <p className="text-gray-600 text-sm">
                        Yes! Advanced options include custom prefixes and suffixes for the decimal output, display toggles for binary and hexadecimal formats, and various formatting options to match your specific workflow requirements.
                      </p>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Does this work offline after loading?</h3>
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
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Technical Specifications & Compatibility</h2>
                <p className="text-gray-600 mb-8">Our text to decimal converter is built with modern web technologies to ensure maximum compatibility, performance, and reliability across all platforms and devices.</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">Encoding Support & Ranges</h3>
                    <div className="space-y-4">
                      <div className="bg-blue-50 rounded-lg p-4">
                        <h4 className="font-semibold text-blue-900 mb-2">UTF-8 Unicode</h4>
                        <ul className="text-blue-800 text-sm space-y-1">
                          <li>• Character Range: 0 to 1,114,111 (U+10FFFF)</li>
                          <li>• Variable Length: 1-4 bytes per character</li>
                          <li>• Backward Compatible: With ASCII (0-127)</li>
                          <li>• Language Support: All modern languages and scripts</li>
                        </ul>
                      </div>
                      <div className="bg-green-50 rounded-lg p-4">
                        <h4 className="font-semibold text-green-900 mb-2">ASCII Standard</h4>
                        <ul className="text-green-800 text-sm space-y-1">
                          <li>• Character Range: 0 to 127 (7-bit)</li>
                          <li>• Fixed Length: Exactly 1 byte per character</li>
                          <li>• Character Set: Basic Latin alphabet and symbols</li>
                          <li>• Legacy Support: Maximum compatibility with old systems</li>
                        </ul>
                      </div>
                      <div className="bg-purple-50 rounded-lg p-4">
                        <h4 className="font-semibold text-purple-900 mb-2">Output Formats</h4>
                        <ul className="text-purple-800 text-sm space-y-1">
                          <li>• Space Separated: Standard readable format</li>
                          <li>• Comma Separated: CSV-compatible format</li>
                          <li>• Newline Separated: Programming-friendly format</li>
                          <li>• Custom Prefixes/Suffixes: Workflow integration</li>
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
                          <li>• Firefox 88+ (excellent Unicode support)</li>
                          <li>• Safari 14+ (full compatibility)</li>
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

export default TextToDecimalConverter;
