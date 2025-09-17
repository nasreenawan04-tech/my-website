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
                          <SelectItem value="utf8">Unicode (Full Range)</SelectItem>
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
                      {/* Main Text Display */}
                      <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-3 sm:p-4">
                        <div className="flex items-center justify-between mb-3 gap-3">
                          <div className="flex-1 min-w-0">
                            <h3 className="text-sm sm:text-base font-semibold text-gray-900 truncate">Decoded Text</h3>
                            <p className="text-xs sm:text-sm text-gray-600 break-words">Readable text from decimal codes</p>
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
                        Enter decimal codes above to see the converted text
                      </div>
                      <p className="text-gray-500 text-sm sm:text-base mt-2">
                        Example: 72 101 108 108 111 (converts to "Hello")
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
                    <p>Enter decimal character codes in your preferred format (space, comma, or newline separated)</p>
                  </div>
                  <div className="flex gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold">2</span>
                    <p>Select encoding (UTF-8 for modern text, ASCII for legacy compatibility)</p>
                  </div>
                  <div className="flex gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold">3</span>
                    <p>Customize advanced options for binary/hex output and text formatting</p>
                  </div>
                  <div className="flex gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold">4</span>
                    <p>View the converted text and copy results to your clipboard</p>
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
                    <p>Multiple input formats: space, comma, and newline separated</p>
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

export default DecimalToTextConverter;