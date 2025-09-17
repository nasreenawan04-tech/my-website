
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
  inputFormat: 'spaced' | 'comma' | 'newline';
  showBinary: boolean;
  showHex: boolean;
  preserveFormatting: boolean;
  addPrefix: string;
  addSuffix: string;
}

interface ConversionResult {
  originalInput: string;
  text: string;
  binary: string;
  hexadecimal: string;
  charCount: number;
  byteCount: number;
  timestamp: Date;
}

const DecimalToTextConverter = () => {
  const [inputDecimal, setInputDecimal] = useState('');
  const [conversionResult, setConversionResult] = useState<ConversionResult | null>(null);
  const [conversionHistory, setConversionHistory] = useState<ConversionResult[]>([]);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [options, setOptions] = useState<ConversionOptions>({
    encoding: 'utf8',
    inputFormat: 'spaced',
    showBinary: false,
    showHex: false,
    preserveFormatting: false,
    addPrefix: '',
    addSuffix: ''
  });

  const decimalToText = (decimal: string, encoding: 'utf8' | 'ascii' = 'utf8', inputFormat: string = 'spaced'): string => {
    if (!decimal) return '';
    
    try {
      let decimalValues: string[] = [];
      
      // Parse based on input format
      switch (inputFormat) {
        case 'spaced':
          decimalValues = decimal.trim().split(/\s+/).filter(val => val.length > 0);
          break;
        case 'comma':
          decimalValues = decimal.trim().split(',').map(val => val.trim()).filter(val => val.length > 0);
          break;
        case 'newline':
          decimalValues = decimal.trim().split('\n').map(val => val.trim()).filter(val => val.length > 0);
          break;
        default:
          decimalValues = decimal.trim().split(/\s+/).filter(val => val.length > 0);
      }
      
      let text = '';
      for (const value of decimalValues) {
        const codePoint = parseInt(value, 10);
        
        if (isNaN(codePoint) || codePoint < 0 || codePoint > 1114111) {
          throw new Error(`Invalid decimal value: ${value}`);
        }
        
        // For ASCII encoding, check if character is in valid range
        if (encoding === 'ascii' && codePoint > 127) {
          text += '?'; // Replace invalid ASCII with ?
        } else {
          text += String.fromCodePoint(codePoint);
        }
      }
      
      return text;
    } catch (error) {
      throw new Error('Invalid decimal input');
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

  const convertDecimal = () => {
    if (!inputDecimal.trim()) {
      setConversionResult(null);
      return;
    }

    try {
      let text = decimalToText(inputDecimal, options.encoding, options.inputFormat);

      // Apply prefix and suffix if provided
      if (options.addPrefix || options.addSuffix) {
        text = `${options.addPrefix}${text}${options.addSuffix}`;
      }

      const binary = textToBinary(text);
      const hexadecimal = textToHex(text);
      
      const result: ConversionResult = {
        originalInput: inputDecimal,
        text,
        binary,
        hexadecimal,
        charCount: Array.from(text).length,
        byteCount: new Blob([text]).size,
        timestamp: new Date()
      };

      setConversionResult(result);

      // Add to history (keep last 10)
      setConversionHistory(prev => {
        const updated = [result, ...prev.filter(item => item.originalInput !== inputDecimal)];
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
    setInputDecimal('');
    setConversionResult(null);
  };

  const handleSampleDecimal = () => {
    switch (options.inputFormat) {
      case 'spaced':
        setInputDecimal('72 101 108 108 111 32 87 111 114 108 100 33');
        break;
      case 'comma':
        setInputDecimal('72, 101, 108, 108, 111, 32, 87, 111, 114, 108, 100, 33');
        break;
      case 'newline':
        setInputDecimal('72\n101\n108\n108\n111\n32\n87\n111\n114\n108\n100\n33');
        break;
    }
  };

  const resetConverter = () => {
    setInputDecimal('');
    setConversionResult(null);
    setShowAdvanced(false);
    setOptions({
      encoding: 'utf8',
      inputFormat: 'spaced',
      showBinary: false,
      showHex: false,
      preserveFormatting: false,
      addPrefix: '',
      addSuffix: ''
    });
  };

  // Auto-convert when decimal or options change
  useEffect(() => {
    if (inputDecimal.trim()) {
      const timeoutId = setTimeout(() => {
        convertDecimal();
      }, 300);
      
      return () => clearTimeout(timeoutId);
    } else {
      setConversionResult(null);
    }
  }, [inputDecimal, options]);

  const getInputFormatLabel = () => {
    switch (options.inputFormat) {
      case 'spaced': return 'Space-separated decimal values';
      case 'comma': return 'Comma-separated decimal values';
      case 'newline': return 'Newline-separated decimal values';
      default: return 'Decimal values';
    }
  };

  const getInputPlaceholder = () => {
    switch (options.inputFormat) {
      case 'spaced': return '72 101 108 108 111 32 87 111 114 108 100 33';
      case 'comma': return '72, 101, 108, 108, 111, 32, 87, 111, 114, 108, 100, 33';
      case 'newline': return '72\n101\n108\n108\n111\n32\n87\n111\n114\n108\n100\n33';
      default: return 'Enter decimal values here...';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Helmet>
        <title>Decimal to Text Converter - Convert Unicode Code Points to Text | DapsiWow</title>
        <meta name="description" content="Free decimal to text converter tool. Transform decimal Unicode code points to readable text instantly with Unicode and ASCII support. Essential for developers, students, and programmers." />
        <meta name="keywords" content="decimal to text converter, decimal decoder, Unicode code points to text, ASCII codes to text, character codes to text, decimal to ASCII, programming tools, computer science, text encoding, online decimal converter" />
        <meta property="og:title" content="Decimal to Text Converter - Convert Unicode Code Points to Text | DapsiWow" />
        <meta property="og:description" content="Free online decimal to text converter. Convert decimal Unicode code points to readable text with Unicode and ASCII support. Perfect for students, developers, and programming education." />
        <meta property="og:type" content="website" />
        <meta name="robots" content="index, follow" />
        <meta name="author" content="DapsiWow" />
        <link rel="canonical" href="https://dapsiwow.com/tools/decimal-to-text-converter" />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            "name": "Decimal to Text Converter",
            "description": "Professional decimal to text converter for transforming decimal Unicode code points into readable text with Unicode and ASCII support for programming and educational purposes.",
            "url": "https://dapsiwow.com/tools/decimal-to-text-converter",
            "applicationCategory": "DeveloperApplication",
            "operatingSystem": "Any",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "USD"
            },
            "featureList": [
              "Decimal to text conversion",
              "Unicode and ASCII support",
              "Multiple input formats (space, comma, newline separated)",
              "Real-time conversion",
              "Binary and hexadecimal output options",
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
                Decimal to Text
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                  Converter
                </span>
              </h1>
              <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-slate-600 max-w-4xl mx-auto leading-relaxed px-2">
                Transform decimal character codes into readable text with professional encoding options instantly
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
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">Decimal Decoder</h2>
                    <p className="text-gray-600">Enter decimal character codes to convert them into readable text</p>
                  </div>

                  <div className="space-y-4 sm:space-y-6">
                    {/* Input Format Selection */}
                    <div className="space-y-3">
                      <Label htmlFor="format-select" className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                        Input Format
                      </Label>
                      <Select
                        value={options.inputFormat}
                        onValueChange={(value: 'spaced' | 'comma' | 'newline') => 
                          updateOption('inputFormat', value)
                        }
                      >
                        <SelectTrigger className="h-12 sm:h-14 border-2 border-gray-200 rounded-xl text-base sm:text-lg" data-testid="select-input-format">
                          <SelectValue placeholder="Select format" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="spaced">Space Separated (72 101 108)</SelectItem>
                          <SelectItem value="comma">Comma Separated (72, 101, 108)</SelectItem>
                          <SelectItem value="newline">Newline Separated</SelectItem>
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

                    {/* Decimal Input */}
                    <div className="space-y-3">
                      <Label htmlFor="decimal-input" className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                        {getInputFormatLabel()}
                      </Label>
                      <Textarea
                        id="decimal-input"
                        value={inputDecimal}
                        onChange={(e) => setInputDecimal(e.target.value)}
                        className="min-h-[100px] sm:min-h-[120px] lg:min-h-[140px] text-base sm:text-lg border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-blue-500 font-mono resize-none"
                        placeholder={getInputPlaceholder()}
                        data-testid="textarea-decimal-input"
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
                                <Label className="text-xs sm:text-sm font-medium">Preserve Formatting</Label>
                                <p className="text-xs text-gray-500">Keep original text formatting</p>
                              </div>
                              <Switch
                                checked={options.preserveFormatting}
                                onCheckedChange={(value) => updateOption('preserveFormatting', value)}
                                data-testid="switch-preserve-formatting"
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
                      onClick={convertDecimal}
                      disabled={!inputDecimal.trim()}
                      className="flex-1 h-12 sm:h-14 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold text-base sm:text-lg rounded-xl shadow-lg transform transition-all duration-200 hover:scale-105"
                      data-testid="button-convert"
                    >
                      Convert to Text
                    </Button>
                    <Button
                      onClick={handleSampleDecimal}
                      variant="outline"
                      className="h-12 sm:h-14 px-6 sm:px-8 border-2 border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold text-base sm:text-lg rounded-xl"
                      data-testid="button-sample-decimal"
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
                            <p className="text-xs sm:text-sm text-gray-600 break-words">Human-readable text from decimal codes</p>
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
                        <div className="text-2xl sm:text-3xl font-bold text-gray-400">123</div>
                      </div>
                      <p className="text-gray-500 text-base sm:text-lg px-4">Enter decimal character codes to decode text</p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* SEO Content Sections */}
          <div className="mt-16 space-y-8">
            {/* What is Decimal to Text Conversion */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">What is Decimal to Text Conversion?</h2>
                <div className="space-y-4 text-gray-600">
                  <p>
                    <strong>Decimal to text conversion</strong> is the process of transforming decimal character codes (Unicode code points) back into human-readable text. This fundamental computer science concept allows developers, students, and professionals to decode numeric representations of characters into their original textual form, bridging the gap between numerical data and readable content.
                  </p>
                  <p>
                    Our professional decimal decoder supports multiple input formats including space-separated, comma-separated, and newline-separated decimal values. With comprehensive UTF-8 and ASCII encoding options, you can decode any character codes that represent text data, making it perfect for programming education, data recovery, debugging applications, and reverse engineering projects.
                  </p>
                  <p>
                    The tool features real-time conversion with intelligent input validation, advanced customization options including custom prefixes and suffixes, and multi-format output display capabilities that show binary and hexadecimal representations alongside the decoded text for comprehensive analysis and verification.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Input Format Guide */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Decimal Code Input Formats & Usage Guide</h2>
                <p className="text-gray-600 mb-8">Understanding proper decimal input formatting is essential for accurate text conversion. Our converter supports three distinct input formats, each designed for different data sources and use cases in programming and data analysis.</p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-800">Space-Separated Format</h3>
                    <p className="text-gray-600 text-sm">
                      Input decimal values separated by spaces. This is the most common format used in programming, data dumps, and educational examples. Each number represents one character's Unicode code point.
                    </p>
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h4 className="font-medium text-blue-900 mb-2">Example Input:</h4>
                      <code className="text-xs font-mono text-blue-800 block mb-2">72 101 108 108 111 32 87 111 114 108 100 33</code>
                      <div className="text-xs text-blue-600 font-medium">Decoded Result: "Hello World!"</div>
                    </div>
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <h5 className="font-medium text-blue-900 mb-1 text-sm">Best For:</h5>
                      <ul className="text-xs text-blue-800 space-y-1">
                        <li>• Programming assignments and code examples</li>
                        <li>• Data analysis and scientific computing</li>
                        <li>• Educational tutorials and demonstrations</li>
                      </ul>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-800">Comma-Separated Format</h3>
                    <p className="text-gray-600 text-sm">
                      Input decimal values separated by commas. This format is commonly used in CSV files, spreadsheets, and data export formats. Ideal for importing character data from various data sources.
                    </p>
                    <div className="bg-green-50 p-4 rounded-lg">
                      <h4 className="font-medium text-green-900 mb-2">Example Input:</h4>
                      <code className="text-xs font-mono text-green-800 block mb-2">72, 101, 108, 108, 111, 32, 87, 111, 114, 108, 100, 33</code>
                      <div className="text-xs text-green-600 font-medium">Decoded Result: "Hello World!"</div>
                    </div>
                    <div className="bg-green-50 p-3 rounded-lg">
                      <h5 className="font-medium text-green-900 mb-1 text-sm">Best For:</h5>
                      <ul className="text-xs text-green-800 space-y-1">
                        <li>• CSV file processing and data imports</li>
                        <li>• Spreadsheet character code conversions</li>
                        <li>• Database export format processing</li>
                      </ul>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-800">Newline-Separated Format</h3>
                    <p className="text-gray-600 text-sm">
                      Input decimal values with each number on a separate line. This format is useful for processing large datasets, log files, and structured data where each character code is individually listed.
                    </p>
                    <div className="bg-purple-50 p-4 rounded-lg">
                      <h4 className="font-medium text-purple-900 mb-2">Example Input:</h4>
                      <code className="text-xs font-mono text-purple-800 block mb-2">72<br/>101<br/>108<br/>108<br/>111</code>
                      <div className="text-xs text-purple-600 font-medium">Decoded Result: "Hello"</div>
                    </div>
                    <div className="bg-purple-50 p-3 rounded-lg">
                      <h5 className="font-medium text-purple-900 mb-1 text-sm">Best For:</h5>
                      <ul className="text-xs text-purple-800 space-y-1">
                        <li>• Log file analysis and processing</li>
                        <li>• Large dataset character extraction</li>
                        <li>• Structured data format conversions</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Encoding and Character Ranges */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
                <CardContent className="p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Character Encoding Options</h2>
                  <p className="text-gray-600 mb-6">Choose the appropriate character encoding based on your data source and requirements for accurate decimal to text conversion.</p>
                  
                  <div className="space-y-6">
                    <div className="bg-blue-50 rounded-lg p-4">
                      <h3 className="font-semibold text-blue-900 mb-3">UTF-8 Unicode Encoding</h3>
                      <p className="text-blue-800 text-sm mb-3">
                        UTF-8 supports the complete Unicode character set with code points ranging from 0 to 1,114,111. This encoding handles international characters, emojis, mathematical symbols, and all modern text requirements.
                      </p>
                      <div className="space-y-2">
                        <h4 className="font-medium text-blue-900 text-sm">Supported Range:</h4>
                        <ul className="text-xs text-blue-700 space-y-1">
                          <li>• Basic ASCII: 0-127 (English letters, numbers, symbols)</li>
                          <li>• Extended ASCII: 128-255 (European characters)</li>
                          <li>• Unicode BMP: 256-65,535 (most world languages)</li>
                          <li>• Unicode Supplementary: 65,536-1,114,111 (emojis, rare characters)</li>
                        </ul>
                      </div>
                    </div>

                    <div className="bg-orange-50 rounded-lg p-4">
                      <h3 className="font-semibold text-orange-900 mb-3">ASCII 7-bit Encoding</h3>
                      <p className="text-orange-800 text-sm mb-3">
                        ASCII encoding supports only the basic 128 characters (0-127) including English letters, digits, punctuation, and control characters. Values above 127 are replaced with '?' characters.
                      </p>
                      <div className="space-y-2">
                        <h4 className="font-medium text-orange-900 text-sm">Character Categories:</h4>
                        <ul className="text-xs text-orange-700 space-y-1">
                          <li>• Control characters: 0-31 (non-printable)</li>
                          <li>• Printable symbols: 32-126 (visible characters)</li>
                          <li>• Delete character: 127 (control character)</li>
                          <li>• Out-of-range values replaced with '?' (63)</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
                <CardContent className="p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Professional Applications</h2>
                  <p className="text-gray-600 mb-6">Decimal to text conversion serves critical functions across numerous professional domains and educational contexts.</p>
                  
                  <div className="space-y-4">
                    <div className="bg-green-50 rounded-lg p-4">
                      <h3 className="font-semibold text-green-900 mb-2">Software Development</h3>
                      <p className="text-green-800 text-sm">Debug character encoding issues, analyze data serialization formats, test Unicode compatibility, and verify text processing algorithms in applications.</p>
                    </div>
                    
                    <div className="bg-purple-50 rounded-lg p-4">
                      <h3 className="font-semibold text-purple-900 mb-2">Data Recovery & Forensics</h3>
                      <p className="text-purple-800 text-sm">Recover text from corrupted files, extract readable content from binary data, analyze file formats, and decode obfuscated character data.</p>
                    </div>
                    
                    <div className="bg-blue-50 rounded-lg p-4">
                      <h3 className="font-semibold text-blue-900 mb-2">Computer Science Education</h3>
                      <p className="text-blue-800 text-sm">Teach character encoding concepts, demonstrate Unicode principles, create programming exercises, and illustrate data representation fundamentals.</p>
                    </div>
                    
                    <div className="bg-yellow-50 rounded-lg p-4">
                      <h3 className="font-semibold text-yellow-900 mb-2">System Administration</h3>
                      <p className="text-yellow-800 text-sm">Decode configuration files, analyze log entries, troubleshoot character encoding problems, and process system output data.</p>
                    </div>

                    <div className="bg-teal-50 rounded-lg p-4">
                      <h3 className="font-semibold text-teal-900 mb-2">Quality Assurance Testing</h3>
                      <p className="text-teal-800 text-sm">Verify character encoding accuracy, test internationalization features, validate data integrity, and ensure cross-platform compatibility.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Advanced Features and Best Practices */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Advanced Features & Conversion Best Practices</h2>
                <p className="text-gray-600 mb-8">Leverage advanced functionality and follow industry best practices to ensure accurate and reliable decimal to text conversion results for your projects and applications.</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">Advanced Features</h3>
                    <div className="space-y-4">
                      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-400 p-4 rounded-r-lg">
                        <h4 className="font-semibold text-blue-900 mb-2">Real-Time Processing</h4>
                        <p className="text-blue-800 text-sm">Instant conversion with 300ms debouncing for optimal performance, immediate input validation, and live error detection for seamless user experience.</p>
                      </div>
                      <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-l-4 border-green-400 p-4 rounded-r-lg">
                        <h4 className="font-semibold text-green-900 mb-2">Multi-Format Output</h4>
                        <p className="text-green-800 text-sm">Display results in text, binary, and hexadecimal formats simultaneously with customizable visibility controls for comprehensive data analysis.</p>
                      </div>
                      <div className="bg-gradient-to-r from-purple-50 to-violet-50 border-l-4 border-purple-400 p-4 rounded-r-lg">
                        <h4 className="font-semibold text-purple-900 mb-2">Text Enhancement</h4>
                        <p className="text-purple-800 text-sm">Custom prefix and suffix support for output formatting, preserving original formatting options, and professional result presentation.</p>
                      </div>
                      <div className="bg-gradient-to-r from-orange-50 to-red-50 border-l-4 border-orange-400 p-4 rounded-r-lg">
                        <h4 className="font-semibold text-orange-900 mb-2">Security & Privacy</h4>
                        <p className="text-orange-800 text-sm">Complete client-side processing with no server communication, ensuring data privacy and security for sensitive information conversion.</p>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">Best Practices</h3>
                    <div className="space-y-4">
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h4 className="font-semibold text-gray-900 mb-2">Input Validation</h4>
                        <ul className="text-gray-700 text-sm space-y-1">
                          <li>• Verify decimal values are within valid Unicode range</li>
                          <li>• Check input format matches selected type</li>
                          <li>• Validate numbers are properly formatted</li>
                          <li>• Use sample data to test functionality</li>
                        </ul>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h4 className="font-semibold text-gray-900 mb-2">Encoding Selection</h4>
                        <ul className="text-gray-700 text-sm space-y-1">
                          <li>• Choose UTF-8 for modern applications</li>
                          <li>• Use ASCII for legacy system compatibility</li>
                          <li>• Consider source data characteristics</li>
                          <li>• Test with representative data samples</li>
                        </ul>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h4 className="font-semibold text-gray-900 mb-2">Result Verification</h4>
                        <ul className="text-gray-700 text-sm space-y-1">
                          <li>• Cross-check output with expected results</li>
                          <li>• Verify special characters display correctly</li>
                          <li>• Test conversion reversibility when possible</li>
                          <li>• Validate character count and byte statistics</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Common Use Cases and Examples */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Common Use Cases & Practical Examples</h2>
                <p className="text-gray-600 mb-8">Decimal to text conversion finds application in numerous real-world scenarios across programming, data analysis, education, and professional development environments.</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="bg-blue-50 rounded-lg p-6">
                    <h3 className="font-semibold text-blue-900 mb-4">Programming & Development</h3>
                    <ul className="text-blue-800 text-sm space-y-2">
                      <li>• Debugging character encoding issues in applications</li>
                      <li>• Testing Unicode support and internationalization</li>
                      <li>• Analyzing API responses with numeric character data</li>
                      <li>• Converting configuration files with encoded text</li>
                      <li>• Processing database exports containing character codes</li>
                      <li>• Validating text processing algorithm outputs</li>
                    </ul>
                  </div>

                  <div className="bg-green-50 rounded-lg p-6">
                    <h3 className="font-semibold text-green-900 mb-4">Data Analysis & Recovery</h3>
                    <ul className="text-green-800 text-sm space-y-2">
                      <li>• Extracting text from corrupted file formats</li>
                      <li>• Converting legacy data with numeric encoding</li>
                      <li>• Analyzing CSV files with character code columns</li>
                      <li>• Processing scientific data with encoded labels</li>
                      <li>• Recovering text from binary data dumps</li>
                      <li>• Converting spreadsheet character references</li>
                    </ul>
                  </div>

                  <div className="bg-purple-50 rounded-lg p-6">
                    <h3 className="font-semibold text-purple-900 mb-4">Education & Training</h3>
                    <ul className="text-purple-800 text-sm space-y-2">
                      <li>• Teaching ASCII and Unicode concepts</li>
                      <li>• Demonstrating character encoding principles</li>
                      <li>• Creating programming exercise solutions</li>
                      <li>• Illustrating data representation fundamentals</li>
                      <li>• Building computer science curriculum examples</li>
                      <li>• Preparing coding interview questions</li>
                    </ul>
                  </div>

                  <div className="bg-orange-50 rounded-lg p-6">
                    <h3 className="font-semibold text-orange-900 mb-4">System Administration</h3>
                    <ul className="text-orange-800 text-sm space-y-2">
                      <li>• Decoding system log entries with numeric codes</li>
                      <li>• Processing configuration files with encoded text</li>
                      <li>• Analyzing network protocol data captures</li>
                      <li>• Converting command output with character codes</li>
                      <li>• Troubleshooting character display problems</li>
                      <li>• Validating file format specifications</li>
                    </ul>
                  </div>

                  <div className="bg-teal-50 rounded-lg p-6">
                    <h3 className="font-semibold text-teal-900 mb-4">Quality Assurance</h3>
                    <ul className="text-teal-800 text-sm space-y-2">
                      <li>• Testing internationalization features</li>
                      <li>• Validating character encoding accuracy</li>
                      <li>• Verifying cross-platform text compatibility</li>
                      <li>• Checking Unicode support implementation</li>
                      <li>• Testing data migration integrity</li>
                      <li>• Ensuring proper character set handling</li>
                    </ul>
                  </div>

                  <div className="bg-red-50 rounded-lg p-6">
                    <h3 className="font-semibold text-red-900 mb-4">Research & Analysis</h3>
                    <ul className="text-red-800 text-sm space-y-2">
                      <li>• Linguistic data analysis with coded characters</li>
                      <li>• Digital humanities text processing projects</li>
                      <li>• Historical document digitization workflows</li>
                      <li>• Cryptographic text analysis applications</li>
                      <li>• Machine learning dataset preparation</li>
                      <li>• Natural language processing research</li>
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
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">What is decimal to text conversion?</h3>
                      <p className="text-gray-600 text-sm">
                        Decimal to text conversion transforms numeric character codes (decimal values representing Unicode code points) back into readable text. Each decimal number corresponds to a specific character according to Unicode or ASCII standards, allowing encoded text data to be decoded into human-readable form.
                      </p>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">What's the difference between UTF-8 and ASCII encoding?</h3>
                      <p className="text-gray-600 text-sm">
                        UTF-8 supports the full Unicode character set (0-1,114,111) including international characters, emojis, and symbols. ASCII only supports basic English characters (0-127). Choose UTF-8 for modern applications and ASCII for legacy system compatibility or when working exclusively with basic English text.
                      </p>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Which input format should I use for my data?</h3>
                      <p className="text-gray-600 text-sm">
                        Use space-separated for programming and general use, comma-separated for CSV and spreadsheet data, and newline-separated for log files or structured data. The choice depends on how your decimal values are originally formatted in the source data.
                      </p>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">What decimal value ranges are supported?</h3>
                      <p className="text-gray-600 text-sm">
                        For UTF-8 encoding, values from 0 to 1,114,111 are supported (full Unicode range). For ASCII encoding, only values 0-127 are valid; higher values are automatically replaced with '?' character (code 63) to maintain compatibility.
                      </p>
                    </div>
                  </div>
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Why do I get invalid input errors?</h3>
                      <p className="text-gray-600 text-sm">
                        Invalid input errors occur when decimal values are outside the valid Unicode range (0-1,114,111), contain non-numeric characters, or are improperly formatted. Ensure your input contains only valid decimal numbers separated according to the selected format.
                      </p>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Is this tool secure for sensitive data?</h3>
                      <p className="text-gray-600 text-sm">
                        Yes, completely secure! All conversion processing occurs locally in your browser using client-side JavaScript. No data is transmitted to servers, stored remotely, or accessible to third parties, ensuring complete privacy and confidentiality for your sensitive information.
                      </p>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Can I customize the output format?</h3>
                      <p className="text-gray-600 text-sm">
                        Yes! Advanced options include custom prefixes and suffixes for decoded text, toggleable display of binary and hexadecimal representations, formatting preservation options, and copy-to-clipboard functionality for easy integration into your workflow.
                      </p>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Does this work without an internet connection?</h3>
                      <p className="text-gray-600 text-sm">
                        Yes! Once the page loads completely, all conversion functionality works offline without requiring an internet connection. The tool runs entirely in your browser, making it reliable for secure environments and situations with limited connectivity.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Technical Specifications */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Technical Specifications & Browser Compatibility</h2>
                <p className="text-gray-600 mb-8">Our decimal to text converter is built with modern web technologies to ensure optimal performance, compatibility, and reliability across all major platforms and devices.</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">Supported Formats & Ranges</h3>
                    <div className="space-y-4">
                      <div className="bg-blue-50 rounded-lg p-4">
                        <h4 className="font-semibold text-blue-900 mb-2">Decimal Input Specifications</h4>
                        <ul className="text-blue-800 text-sm space-y-1">
                          <li>• Range: 0 to 1,114,111 (Unicode full range)</li>
                          <li>• ASCII Mode: 0-127 (higher values become '?')</li>
                          <li>• Formats: Space, comma, newline separated</li>
                          <li>• Validation: Real-time input checking</li>
                        </ul>
                      </div>
                      <div className="bg-green-50 rounded-lg p-4">
                        <h4 className="font-semibold text-green-900 mb-2">Output Capabilities</h4>
                        <ul className="text-green-800 text-sm space-y-1">
                          <li>• Primary: Decoded text output</li>
                          <li>• Optional: Binary representation</li>
                          <li>• Optional: Hexadecimal values</li>
                          <li>• Statistics: Character and byte counts</li>
                        </ul>
                      </div>
                      <div className="bg-purple-50 rounded-lg p-4">
                        <h4 className="font-semibold text-purple-900 mb-2">Processing Features</h4>
                        <ul className="text-purple-800 text-sm space-y-1">
                          <li>• Real-time conversion (300ms debounce)</li>
                          <li>• Client-side processing (no server calls)</li>
                          <li>• Error handling and validation</li>
                          <li>• Copy-to-clipboard functionality</li>
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
                          <li>• Firefox 88+ (excellent compatibility)</li>
                          <li>• Safari 14+ (full feature support)</li>
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
                        <h4 className="font-semibold text-gray-900 mb-2">Accessibility & Standards</h4>
                        <ul className="text-gray-700 text-sm space-y-1">
                          <li>• WCAG 2.1 accessibility compliant</li>
                          <li>• Keyboard navigation support</li>
                          <li>• Screen reader compatible</li>
                          <li>• Responsive design (all screen sizes)</li>
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

export default DecimalToTextConverter;
