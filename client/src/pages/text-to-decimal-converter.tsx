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

      // Add to history (keep last 10)
      setConversionHistory(prev => {
        const updated = [result, ...prev.filter(item => item.originalText !== inputText)];
        return updated.slice(0, 10);
      });
    } catch (error) {
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
    setInputText('');
    setConversionResult(null);
  };

  const handleSampleText = () => {
    setInputText('Hello World! Welcome to DapsiWow\'s Text to Decimal Converter. This tool transforms your text into decimal character codes.');
  };

  const resetConverter = () => {
    setInputText('');
    setConversionResult(null);
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
        <section className="relative py-12 sm:py-16 md:py-20 lg:py-24 xl:py-32 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-indigo-600/20"></div>
          <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="space-y-6 sm:space-y-8">
              <div className="inline-flex items-center px-3 sm:px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full border border-blue-200">
                <span className="text-xs sm:text-sm font-medium text-blue-700">Professional Text Encoder</span>
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-slate-900 leading-tight" data-testid="text-page-title">
                Text to Decimal
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                  Converter
                </span>
              </h1>
              <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-slate-600 max-w-4xl mx-auto leading-relaxed px-2">
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
                          <SelectItem value="utf8">Unicode (Full Range)</SelectItem>
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
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6 sm:mb-8">Encoded Results</h2>

                  {conversionResult && conversionResult.originalText ? (
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

                      {/* Conversion Statistics */}
                      <div className="bg-gray-50 border-2 border-gray-200 rounded-xl p-3 sm:p-4">
                        <h4 className="text-sm sm:text-base font-semibold text-gray-900 mb-3">Conversion Statistics</h4>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 text-xs sm:text-sm">
                          <div className="bg-white p-2 sm:p-3 rounded-lg border border-gray-200">
                            <div className="text-gray-600">Characters</div>
                            <div className="font-mono font-semibold text-blue-600" data-testid="stat-char-count">
                              {conversionResult.charCount}
                            </div>
                          </div>
                          <div className="bg-white p-2 sm:p-3 rounded-lg border border-gray-200">
                            <div className="text-gray-600">Bytes</div>
                            <div className="font-mono font-semibold text-green-600" data-testid="stat-byte-count">
                              {conversionResult.byteCount}
                            </div>
                          </div>
                          <div className="bg-white p-2 sm:p-3 rounded-lg border border-gray-200 col-span-2 sm:col-span-1">
                            <div className="text-gray-600">Timestamp</div>
                            <div className="font-mono font-semibold text-purple-600 text-xs" data-testid="stat-timestamp">
                              {conversionResult.timestamp.toLocaleTimeString()}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 sm:py-12">
                      <div className="text-gray-400 text-lg sm:text-xl font-medium">
                        Enter text above to see the converted decimal codes
                      </div>
                      <p className="text-gray-500 text-sm sm:text-base mt-2">
                        Example: "Hello" converts to 72 101 108 108 111
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Information Section */}
          <div className="mt-8 sm:mt-12 lg:mt-16 grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg rounded-xl sm:rounded-2xl">
              <CardContent className="p-6 sm:p-8">
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">How to Use This Tool</h3>
                <div className="space-y-4 text-sm sm:text-base text-gray-600">
                  <div className="flex gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold">1</span>
                    <p>Enter any text you want to convert to decimal character codes</p>
                  </div>
                  <div className="flex gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold">2</span>
                    <p>Select encoding (UTF-8 for modern text, ASCII for legacy compatibility)</p>
                  </div>
                  <div className="flex gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold">3</span>
                    <p>Choose output format (space, comma, or newline separated)</p>
                  </div>
                  <div className="flex gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold">4</span>
                    <p>View the decimal codes and copy results to your clipboard</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg rounded-xl sm:rounded-2xl">
              <CardContent className="p-6 sm:p-8">
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">Key Features</h3>
                <div className="space-y-3 text-sm sm:text-base text-gray-600">
                  <div className="flex items-start gap-3">
                    <span className="text-green-500 text-sm">✓</span>
                    <p>Support for UTF-8 and ASCII character encoding</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-green-500 text-sm">✓</span>
                    <p>Multiple output formats: space, comma, and newline separated</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-green-500 text-sm">✓</span>
                    <p>Real-time conversion with instant results</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-green-500 text-sm">✓</span>
                    <p>Optional binary and hexadecimal output display</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-green-500 text-sm">✓</span>
                    <p>Copy to clipboard functionality for easy sharing</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-green-500 text-sm">✓</span>
                    <p>Detailed conversion statistics and error handling</p>
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