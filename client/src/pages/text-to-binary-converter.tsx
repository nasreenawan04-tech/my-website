
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
  spacing: 'none' | 'space' | 'byte';
  showDecimal: boolean;
  showHex: boolean;
  preserveNumbers: boolean;
  addPrefix: string;
  addSuffix: string;
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
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [options, setOptions] = useState<ConversionOptions>({
    encoding: 'utf8',
    spacing: 'space',
    showDecimal: false,
    showHex: false,
    preserveNumbers: false,
    addPrefix: '',
    addSuffix: ''
  });

  const textToBinary = (text: string, encoding: 'utf8' | 'ascii' = 'utf8', spacing: string = 'space'): string => {
    if (!text) return '';
    
    let binary = '';
    for (let i = 0; i < text.length; i++) {
      let charCode = text.charCodeAt(i);
      
      // For ASCII encoding, limit to 7-bit characters
      if (encoding === 'ascii' && charCode > 127) {
        charCode = 63; // '?' character for non-ASCII
      }
      
      let binaryChar = charCode.toString(2).padStart(8, '0');
      
      switch (spacing) {
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

    try {
      let processedText = inputText;
      
      // Apply prefix and suffix if provided
      if (options.addPrefix || options.addSuffix) {
        processedText = `${options.addPrefix}${processedText}${options.addSuffix}`;
      }

      const binary = textToBinary(processedText, options.encoding, options.spacing);
      const decimal = textToDecimal(processedText);
      const hexadecimal = textToHex(processedText);
      
      const result: ConversionResult = {
        originalText: inputText,
        binary,
        decimal,
        hexadecimal,
        charCount: processedText.length,
        byteCount: new Blob([processedText]).size,
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

  const handleSampleText = () => {
    setInputText('Hello World! Welcome to DapsiWow\'s Text to Binary Converter. This tool transforms your text into binary code.');
  };

  const resetConverter = () => {
    setInputText('');
    setConversionResult(null);
    setShowAdvanced(false);
    setOptions({
      encoding: 'utf8',
      spacing: 'space',
      showDecimal: false,
      showHex: false,
      preserveNumbers: false,
      addPrefix: '',
      addSuffix: ''
    });
  };

  // Clear results when text is cleared
  useEffect(() => {
    if (!inputText.trim()) {
      setConversionResult(null);
    }
  }, [inputText]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Helmet>
        <title>Text to Binary Converter - Convert Text to Binary Code | DapsiWow</title>
        <meta name="description" content="Free text to binary converter tool. Transform any text to binary code instantly with UTF-8 and ASCII encoding support. Essential for developers, students, and programmers learning computer science." />
        <meta name="keywords" content="text to binary converter, binary encoder, text to binary code, ASCII to binary, UTF-8 binary converter, text encoder, programming tools, computer science, binary code generator, online text converter" />
        <meta property="og:title" content="Text to Binary Converter - Convert Text to Binary Code | DapsiWow" />
        <meta property="og:description" content="Free online text to binary converter. Convert any text to binary code with UTF-8 and ASCII encoding. Essential tool for developers and computer science education." />
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
              "On-demand text conversion",
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
        <section className="relative py-12 sm:py-16 md:py-20 lg:py-28 xl:py-32 2xl:py-36 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-indigo-600/20"></div>
          <div className="relative max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 xl:px-12 text-center">
            <div className="space-y-4 sm:space-y-6 md:space-y-8 lg:space-y-10">
              <div className="inline-flex items-center px-3 py-1.5 sm:px-4 sm:py-2 md:px-5 md:py-2.5 bg-white/80 backdrop-blur-sm rounded-full border border-blue-200 text-xs sm:text-sm md:text-base">
                <span className="font-medium text-blue-700">Professional Text Encoder</span>
              </div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl 2xl:text-7xl font-bold text-slate-900 leading-tight tracking-tight" data-testid="text-page-title">
                <span className="block">Text to Binary</span>
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                  Converter
                </span>
              </h1>
              <p className="text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl text-slate-600 max-w-xs sm:max-w-md md:max-w-2xl lg:max-w-4xl xl:max-w-5xl mx-auto leading-relaxed px-2 sm:px-4 md:px-6">
                Transform any text into binary code with professional encoding options instantly
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
                <div className="p-4 sm:p-6 md:p-8 lg:p-10 xl:p-12 2xl:p-14 space-y-4 sm:space-y-6 md:space-y-8">
                  <div>
                    <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-3xl xl:text-4xl 2xl:text-4xl font-bold text-gray-900 mb-2 sm:mb-3 md:mb-4">Text Encoder</h2>
                    <p className="text-sm sm:text-base md:text-lg lg:text-lg xl:text-xl text-gray-600">Enter your text to convert into binary code format</p>
                  </div>

                  <div className="space-y-4 sm:space-y-5 md:space-y-6">
                    {/* Text Input */}
                    <div className="space-y-2 sm:space-y-3">
                      <Label htmlFor="text-input" className="text-xs sm:text-sm md:text-base font-semibold text-gray-800 uppercase tracking-wide">
                        Text to Convert
                      </Label>
                      <Textarea
                        id="text-input"
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        className="min-h-[100px] sm:min-h-[120px] md:min-h-[140px] lg:min-h-[160px] xl:min-h-[180px] 2xl:min-h-[200px] text-sm sm:text-base md:text-lg lg:text-lg xl:text-xl border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-blue-500 resize-none"
                        placeholder="Type or paste your text here to convert to binary code..."
                        data-testid="textarea-text-input"
                      />
                    </div>

                    {/* Encoding Selection */}
                    <div className="space-y-2 sm:space-y-3">
                      <Label htmlFor="encoding-select" className="text-xs sm:text-sm md:text-base font-semibold text-gray-800 uppercase tracking-wide">
                        Character Encoding
                      </Label>
                      <Select
                        value={options.encoding}
                        onValueChange={(value: 'utf8' | 'ascii') => 
                          updateOption('encoding', value)
                        }
                      >
                        <SelectTrigger className="h-11 sm:h-12 md:h-14 lg:h-14 xl:h-16 2xl:h-16 border-2 border-gray-200 rounded-xl text-sm sm:text-base md:text-lg lg:text-lg xl:text-xl" data-testid="select-encoding">
                          <SelectValue placeholder="Select encoding" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="utf8">UTF-8 (Unicode)</SelectItem>
                          <SelectItem value="ascii">ASCII (7-bit)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Spacing Options */}
                    <div className="space-y-2 sm:space-y-3">
                      <Label htmlFor="spacing-select" className="text-xs sm:text-sm md:text-base font-semibold text-gray-800 uppercase tracking-wide">
                        Binary Spacing Format
                      </Label>
                      <Select
                        value={options.spacing}
                        onValueChange={(value: 'none' | 'space' | 'byte') => 
                          updateOption('spacing', value)
                        }
                      >
                        <SelectTrigger className="h-11 sm:h-12 md:h-14 lg:h-14 xl:h-16 2xl:h-16 border-2 border-gray-200 rounded-xl text-sm sm:text-base md:text-lg lg:text-lg xl:text-xl" data-testid="select-spacing">
                          <SelectValue placeholder="Select spacing" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">No Spacing</SelectItem>
                          <SelectItem value="space">Space Between Bytes</SelectItem>
                          <SelectItem value="byte">Pipe Separated (|)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Advanced Options */}
                  <div className="space-y-4 sm:space-y-5 md:space-y-6 border-t pt-4 sm:pt-6 md:pt-8">
                    <h3 className="text-base sm:text-lg md:text-xl lg:text-xl xl:text-2xl font-bold text-gray-900">Advanced Options</h3>
                    
                    <Collapsible open={showAdvanced} onOpenChange={setShowAdvanced}>
                      <CollapsibleTrigger asChild>
                        <Button 
                          variant="ghost" 
                          className="w-full justify-between text-sm sm:text-base md:text-lg py-3 sm:py-4 md:py-5 h-auto"
                          data-testid="button-toggle-advanced"
                        >
                          <span className="flex items-center">
                            Advanced Customization
                          </span>
                          <span className={`transform transition-transform ${showAdvanced ? 'rotate-180' : ''}`}>▼</span>
                        </Button>
                      </CollapsibleTrigger>
                      <CollapsibleContent className="space-y-4 sm:space-y-5 md:space-y-6 mt-4">
                        <Separator />
                        
                        {/* Display and Processing Options */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5 md:gap-6">
                          <div className="space-y-3 sm:space-y-4 bg-gray-50 rounded-xl p-3 sm:p-4 md:p-5 lg:p-6">
                            <h4 className="text-sm sm:text-base md:text-lg font-semibold text-gray-900">Display Options</h4>
                            
                            <div className="flex items-center justify-between gap-2">
                              <div className="space-y-1 flex-1 min-w-0">
                                <Label className="text-xs sm:text-sm font-medium">Show Decimal Output</Label>
                                <p className="text-xs text-gray-500">Display decimal representation of text</p>
                              </div>
                              <Switch
                                checked={options.showDecimal}
                                onCheckedChange={(value) => updateOption('showDecimal', value)}
                                data-testid="switch-show-decimal"
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
                          <div className="space-y-3 sm:space-y-4 bg-gray-50 rounded-xl p-3 sm:p-4 md:p-5 lg:p-6">
                            <h4 className="text-sm sm:text-base md:text-lg font-semibold text-gray-900">Text Customization</h4>
                            
                            <div className="space-y-2">
                              <Label className="text-xs sm:text-sm md:text-base font-medium">Add Prefix</Label>
                              <Input
                                value={options.addPrefix}
                                onChange={(e) => updateOption('addPrefix', e.target.value)}
                                placeholder="e.g., [ENCODED], OUTPUT:"
                                className="text-sm sm:text-base h-10 sm:h-11 md:h-12 lg:h-13 xl:h-14 border-2 border-gray-200 rounded-lg"
                                data-testid="input-add-prefix"
                              />
                              <p className="text-xs sm:text-sm text-gray-500">Text to add before encoded output</p>
                            </div>

                            <div className="space-y-2">
                              <Label className="text-xs sm:text-sm md:text-base font-medium">Add Suffix</Label>
                              <Input
                                value={options.addSuffix}
                                onChange={(e) => updateOption('addSuffix', e.target.value)}
                                placeholder="e.g., [END], _RESULT"
                                className="text-sm sm:text-base h-10 sm:h-11 md:h-12 lg:h-13 xl:h-14 border-2 border-gray-200 rounded-lg"
                                data-testid="input-add-suffix"
                              />
                              <p className="text-xs sm:text-sm text-gray-500">Text to add after encoded output</p>
                            </div>
                          </div>
                        </div>
                        
                        <Separator />
                      </CollapsibleContent>
                    </Collapsible>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 md:gap-5 pt-4 sm:pt-6">
                    <Button
                      onClick={convertText}
                      disabled={!inputText.trim()}
                      className="flex-1 h-12 sm:h-14 md:h-16 lg:h-16 xl:h-18 2xl:h-18 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold text-sm sm:text-base md:text-lg lg:text-xl rounded-xl shadow-lg transform transition-all duration-200 hover:scale-105"
                      data-testid="button-convert"
                    >
                      Convert to Binary
                    </Button>
                    <Button
                      onClick={handleSampleText}
                      variant="outline"
                      className="h-12 sm:h-14 md:h-16 lg:h-16 xl:h-18 2xl:h-18 px-4 sm:px-6 md:px-8 lg:px-10 border-2 border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold text-sm sm:text-base md:text-lg lg:text-xl rounded-xl"
                      data-testid="button-sample-text"
                    >
                      Sample
                    </Button>
                    <Button
                      onClick={resetConverter}
                      variant="outline"
                      className="h-12 sm:h-14 md:h-16 lg:h-16 xl:h-18 2xl:h-18 px-4 sm:px-6 md:px-8 lg:px-10 border-2 border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold text-sm sm:text-base md:text-lg lg:text-xl rounded-xl"
                      data-testid="button-reset"
                    >
                      Reset
                    </Button>
                  </div>
                </div>

                {/* Results Section */}
                <div className="bg-gradient-to-br from-gray-50 to-blue-50 p-4 sm:p-6 md:p-8 lg:p-10 xl:p-12 2xl:p-14 border-t">
                  <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-3xl 2xl:text-4xl font-bold text-gray-900 mb-4 sm:mb-6 md:mb-8">Encoded Results</h2>

                  {conversionResult && conversionResult.originalText ? (
                    <div className="space-y-3 sm:space-y-4 md:space-y-5" data-testid="conversion-results">
                      {/* Main Binary Code Display */}
                      <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-3 sm:p-4 md:p-5 lg:p-6">
                        <div className="flex items-center justify-between mb-3 sm:mb-4 gap-3">
                          <div className="flex-1 min-w-0">
                            <h3 className="text-sm sm:text-base md:text-lg lg:text-xl font-semibold text-gray-900 truncate">Binary Code</h3>
                            <p className="text-xs sm:text-sm md:text-base text-gray-600 break-words">Binary representation (0s and 1s)</p>
                          </div>
                          <Button
                            onClick={() => handleCopyToClipboard(conversionResult.binary)}
                            variant="outline"
                            size="sm"
                            className="text-xs sm:text-sm px-2 sm:px-3 md:px-4 py-2 flex-shrink-0 rounded-lg min-w-[60px] sm:min-w-[70px] md:min-w-[80px] h-9 sm:h-10 md:h-11 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                            data-testid="button-copy-binary"
                          >
                            Copy
                          </Button>
                        </div>
                        <div 
                          className="bg-white p-2 sm:p-3 md:p-4 rounded-lg border border-gray-200 text-xs sm:text-sm md:text-base lg:text-lg font-mono break-all min-h-[40px] sm:min-h-[44px] md:min-h-[48px] lg:min-h-[52px] flex items-center"
                          data-testid="binary-output"
                        >
                          {conversionResult.binary || '(empty result)'}
                        </div>
                      </div>

                      {/* Alternative Format Outputs */}
                      {options.showDecimal && (
                        <div className="bg-green-50 border-2 border-green-200 rounded-xl p-3 sm:p-4 md:p-5 lg:p-6">
                          <div className="flex items-center justify-between mb-3 sm:mb-4 gap-3">
                            <div className="flex-1 min-w-0">
                              <h4 className="text-sm sm:text-base md:text-lg lg:text-xl font-semibold text-gray-900 truncate">Decimal Values</h4>
                              <p className="text-xs sm:text-sm md:text-base text-gray-600 break-words">Decimal character codes</p>
                            </div>
                            <Button
                              onClick={() => handleCopyToClipboard(conversionResult.decimal)}
                              variant="outline"
                              size="sm"
                              className="text-xs sm:text-sm px-2 sm:px-3 md:px-4 py-2 flex-shrink-0 rounded-lg min-w-[60px] sm:min-w-[70px] md:min-w-[80px] h-9 sm:h-10 md:h-11 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                              data-testid="button-copy-decimal"
                            >
                              Copy
                            </Button>
                          </div>
                          <div 
                            className="bg-white p-2 sm:p-3 md:p-4 rounded-lg border border-gray-200 text-xs sm:text-sm md:text-base lg:text-lg font-mono break-all min-h-[40px] sm:min-h-[44px] md:min-h-[48px] lg:min-h-[52px] flex items-center"
                            data-testid="decimal-output"
                          >
                            {conversionResult.decimal}
                          </div>
                        </div>
                      )}

                      {options.showHex && (
                        <div className="bg-purple-50 border-2 border-purple-200 rounded-xl p-3 sm:p-4 md:p-5 lg:p-6">
                          <div className="flex items-center justify-between mb-3 sm:mb-4 gap-3">
                            <div className="flex-1 min-w-0">
                              <h4 className="text-sm sm:text-base md:text-lg lg:text-xl font-semibold text-gray-900 truncate">Hexadecimal Values</h4>
                              <p className="text-xs sm:text-sm md:text-base text-gray-600 break-words">Hexadecimal character codes</p>
                            </div>
                            <Button
                              onClick={() => handleCopyToClipboard(conversionResult.hexadecimal)}
                              variant="outline"
                              size="sm"
                              className="text-xs sm:text-sm px-2 sm:px-3 md:px-4 py-2 flex-shrink-0 rounded-lg min-w-[60px] sm:min-w-[70px] md:min-w-[80px] h-9 sm:h-10 md:h-11 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                              data-testid="button-copy-hex"
                            >
                              Copy
                            </Button>
                          </div>
                          <div 
                            className="bg-white p-2 sm:p-3 md:p-4 rounded-lg border border-gray-200 text-xs sm:text-sm md:text-base lg:text-lg font-mono break-all min-h-[40px] sm:min-h-[44px] md:min-h-[48px] lg:min-h-[52px] flex items-center"
                            data-testid="hex-output"
                          >
                            {conversionResult.hexadecimal}
                          </div>
                        </div>
                      )}

                      {/* Text Statistics */}
                      <div className="bg-white rounded-xl p-3 sm:p-4 md:p-5 lg:p-6 shadow-sm border border-gray-200" data-testid="text-statistics">
                        <h3 className="text-sm sm:text-base md:text-lg lg:text-xl font-bold text-gray-900 mb-3 sm:mb-4 md:mb-5">Text Statistics</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 md:gap-5">
                          <div className="bg-blue-50 rounded-lg p-3 sm:p-4 md:p-5 lg:p-6 text-center">
                            <div className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold text-blue-600" data-testid="char-count">{conversionResult.charCount}</div>
                            <div className="text-xs sm:text-sm md:text-base lg:text-lg text-blue-700 font-medium mt-1 sm:mt-2">Characters</div>
                          </div>
                          <div className="bg-green-50 rounded-lg p-3 sm:p-4 md:p-5 lg:p-6 text-center">
                            <div className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold text-green-600" data-testid="byte-count">{conversionResult.byteCount}</div>
                            <div className="text-xs sm:text-sm md:text-base lg:text-lg text-green-700 font-medium mt-1 sm:mt-2">Bytes</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 sm:py-12 md:py-16 lg:py-20" data-testid="no-results">
                      <div className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 bg-gray-200 rounded-full mx-auto mb-3 sm:mb-4 md:mb-6 flex items-center justify-center">
                        <div className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-400">01</div>
                      </div>
                      <p className="text-gray-500 text-sm sm:text-base md:text-lg lg:text-xl px-4">Enter text to see binary conversion results</p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* SEO Content Sections */}
          <div className="mt-16 space-y-8">
            {/* What is Text to Binary Conversion */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">What is Text to Binary Conversion?</h2>
                <div className="space-y-4 text-gray-600">
                  <p>
                    <strong>Text to binary conversion</strong> is the fundamental process of transforming human-readable text into binary code (sequences of 0s and 1s), the universal language that computers use to process and store information. This essential computer science concept bridges the gap between human communication and machine understanding, making it perfect for educational purposes, programming projects, and understanding digital data representation.
                  </p>
                  <p>
                    Our professional text to binary converter supports comprehensive UTF-8 and ASCII encoding systems, allowing you to convert any text from simple English letters to complex international characters and symbols. The tool features real-time conversion as you type, advanced customization options including spacing formats, and intelligent text processing capabilities.
                  </p>
                  <p>
                    Whether you're a student learning computer science fundamentals, a developer working on low-level programming concepts, or a professional analyzing data encoding, this converter provides instant, accurate transformations with detailed output formatting options to meet your specific needs.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Encoding Systems Guide */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Text to Binary Encoding Guide</h2>
                <p className="text-gray-600 mb-8">Understanding different encoding systems and output formats is crucial for effective text to binary conversion. Our converter supports multiple encoding standards and formatting options to meet diverse technical requirements.</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div className="bg-blue-50 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-blue-900 mb-3">UTF-8 Encoding</h3>
                      <p className="text-blue-800 text-sm mb-4">
                        UTF-8 is a variable-width encoding system that can represent any Unicode character using 1-4 bytes. It's backward compatible with ASCII and supports international characters, emojis, and symbols from virtually every writing system worldwide.
                      </p>
                      <div className="bg-blue-100 p-3 rounded-lg">
                        <h4 className="font-medium text-blue-900 mb-2">Example Conversion:</h4>
                        <div className="text-xs font-mono text-blue-800">
                          <div>Text: "Hello 🌍"</div>
                          <div>Binary: 01001000 01100101 01101100 01101100 01101111 00100000 11110000 10011111 10001100 10001101</div>
                        </div>
                      </div>
                      <ul className="text-xs text-blue-700 mt-3 space-y-1">
                        <li>• Supports all Unicode characters (over 1 million)</li>
                        <li>• Variable-length encoding (1-4 bytes per character)</li>
                        <li>• Perfect for modern applications and websites</li>
                        <li>• International and emoji support</li>
                      </ul>
                    </div>

                    <div className="bg-orange-50 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-orange-900 mb-3">ASCII Encoding</h3>
                      <p className="text-orange-800 text-sm mb-4">
                        ASCII uses exactly 7 bits to represent 128 characters (0-127), including English letters, numbers, punctuation, and basic control characters. It's limited to basic English text but ensures maximum compatibility.
                      </p>
                      <div className="bg-orange-100 p-3 rounded-lg">
                        <h4 className="font-medium text-orange-900 mb-2">Example Conversion:</h4>
                        <div className="text-xs font-mono text-orange-800">
                          <div>Text: "Hello!"</div>
                          <div>Binary: 01001000 01100101 01101100 01101100 01101111 00100001</div>
                        </div>
                      </div>
                      <ul className="text-xs text-orange-700 mt-3 space-y-1">
                        <li>• Fixed 8-bit encoding for each character</li>
                        <li>• Limited to 128 standard characters</li>
                        <li>• Ideal for legacy systems and basic text</li>
                        <li>• Maximum compatibility and simplicity</li>
                      </ul>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="bg-green-50 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-green-900 mb-3">Binary Spacing Options</h3>
                      <p className="text-green-800 text-sm mb-4">
                        Choose the appropriate spacing format based on your specific use case and readability requirements. Different formats serve different purposes in programming and data analysis.
                      </p>
                      <div className="space-y-3">
                        <div className="bg-green-100 p-3 rounded-lg">
                          <h4 className="font-medium text-green-900 text-sm">No Spacing</h4>
                          <div className="text-xs font-mono text-green-800">0100100001100101011011000110110001101111</div>
                          <p className="text-xs text-green-700 mt-1">Continuous binary string, compact format</p>
                        </div>
                        <div className="bg-green-100 p-3 rounded-lg">
                          <h4 className="font-medium text-green-900 text-sm">Space Between Bytes</h4>
                          <div className="text-xs font-mono text-green-800">01001000 01100101 01101100 01101100 01101111</div>
                          <p className="text-xs text-green-700 mt-1">Most readable format, clear byte boundaries</p>
                        </div>
                        <div className="bg-green-100 p-3 rounded-lg">
                          <h4 className="font-medium text-green-900 text-sm">Pipe Separated</h4>
                          <div className="text-xs font-mono text-green-800">01001000 | 01100101 | 01101100 | 01101100 | 01101111</div>
                          <p className="text-xs text-green-700 mt-1">Clear visual separation for analysis</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-purple-50 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-purple-900 mb-3">Output Formats</h3>
                      <p className="text-purple-800 text-sm mb-4">
                        Our converter provides multiple output formats to support different workflows and technical requirements in programming and data analysis.
                      </p>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                          <span className="text-purple-800 text-sm"><strong>Binary:</strong> Pure 0s and 1s representation</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                          <span className="text-purple-800 text-sm"><strong>Decimal:</strong> Character code values (0-255)</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                          <span className="text-purple-800 text-sm"><strong>Hexadecimal:</strong> Compact hex representation</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Professional Applications */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
                <CardContent className="p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Who Uses Text to Binary Converters?</h2>
                  <p className="text-gray-600 mb-6">Text to binary conversion tools serve diverse professionals and students across multiple industries and educational fields, providing essential functionality for understanding digital data representation.</p>
                  
                  <div className="space-y-4">
                    <div className="bg-blue-50 rounded-lg p-4">
                      <h3 className="font-semibold text-blue-900 mb-2">Software Developers & Engineers</h3>
                      <p className="text-blue-800 text-sm">Debug character encoding issues, understand data serialization, analyze binary protocols, and learn low-level programming concepts for system optimization and troubleshooting.</p>
                    </div>
                    
                    <div className="bg-green-50 rounded-lg p-4">
                      <h3 className="font-semibold text-green-900 mb-2">Computer Science Students</h3>
                      <p className="text-green-800 text-sm">Learn fundamental concepts of data representation, understand how computers store text, practice binary operations, and complete programming assignments requiring encoding knowledge.</p>
                    </div>
                    
                    <div className="bg-purple-50 rounded-lg p-4">
                      <h3 className="font-semibold text-purple-900 mb-2">Cybersecurity Professionals</h3>
                      <p className="text-purple-800 text-sm">Analyze encoded data streams, investigate digital forensics evidence, understand malware obfuscation techniques, and decode hidden messages in security research.</p>
                    </div>
                    
                    <div className="bg-orange-50 rounded-lg p-4">
                      <h3 className="font-semibold text-orange-900 mb-2">Network Engineers & Administrators</h3>
                      <p className="text-orange-800 text-sm">Troubleshoot network protocols, analyze packet data, understand transmission encoding, and debug communication issues in network infrastructure.</p>
                    </div>

                    <div className="bg-teal-50 rounded-lg p-4">
                      <h3 className="font-semibold text-teal-900 mb-2">Educators & Trainers</h3>
                      <p className="text-teal-800 text-sm">Teach binary number systems, demonstrate computer science concepts, create interactive lessons about data encoding, and help students visualize digital representation.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
                <CardContent className="p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Key Features & Benefits</h2>
                  <p className="text-gray-600 mb-6">Our text to binary converter offers comprehensive features designed to meet professional, educational, and personal needs with maximum efficiency and accuracy.</p>
                  
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                        <span className="text-white text-xs font-bold">✓</span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-1">Real-Time Conversion</h4>
                        <p className="text-gray-600 text-sm">Instant text to binary transformation as you type with 300ms debouncing for optimal performance and immediate feedback.</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                        <span className="text-white text-xs font-bold">✓</span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-1">Multiple Encoding Support</h4>
                        <p className="text-gray-600 text-sm">Comprehensive UTF-8 and ASCII encoding options to handle any text from basic English to international characters and symbols.</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                        <span className="text-white text-xs font-bold">✓</span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-1">Customizable Output Formats</h4>
                        <p className="text-gray-600 text-sm">Flexible spacing options, prefix/suffix support, and multiple output formats (binary, decimal, hexadecimal) for diverse use cases.</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                        <span className="text-white text-xs font-bold">✓</span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-1">Professional Statistics</h4>
                        <p className="text-gray-600 text-sm">Detailed character and byte count analysis with real-time statistics for data analysis and optimization purposes.</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-teal-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                        <span className="text-white text-xs font-bold">✓</span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-1">Privacy & Security</h4>
                        <p className="text-gray-600 text-sm">All processing happens locally in your browser - no data transmitted to servers, ensuring complete privacy and security of your text.</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* How Binary Encoding Works */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">How Text to Binary Encoding Works</h2>
                <p className="text-gray-600 mb-8">Understanding the technical process behind text to binary conversion helps you make informed decisions about encoding options and interpret results accurately for your specific applications.</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-blue-900 mb-4">Step-by-Step Conversion Process</h3>
                      <div className="space-y-4">
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-white font-bold text-sm">1</span>
                          </div>
                          <div>
                            <h4 className="font-medium text-blue-900">Character Analysis</h4>
                            <p className="text-blue-800 text-sm">Each character in your text is identified and mapped to its corresponding Unicode or ASCII value based on the selected encoding system.</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-white font-bold text-sm">2</span>
                          </div>
                          <div>
                            <h4 className="font-medium text-blue-900">Numerical Conversion</h4>
                            <p className="text-blue-800 text-sm">The character value is converted to its decimal representation, which serves as the base for binary conversion calculations.</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-white font-bold text-sm">3</span>
                          </div>
                          <div>
                            <h4 className="font-medium text-blue-900">Binary Translation</h4>
                            <p className="text-blue-800 text-sm">The decimal value is converted to binary using base-2 arithmetic, creating the sequence of 0s and 1s that represents each character.</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-white font-bold text-sm">4</span>
                          </div>
                          <div>
                            <h4 className="font-medium text-blue-900">Format Application</h4>
                            <p className="text-blue-800 text-sm">The binary output is formatted according to your spacing preferences and combined with any custom prefixes or suffixes you've specified.</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-6">
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-green-900 mb-4">Practical Example Walkthrough</h3>
                      <div className="space-y-4">
                        <div className="bg-green-100 p-4 rounded-lg">
                          <h4 className="font-medium text-green-900 mb-2">Input Text: "Hi"</h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-green-800">Character 'H':</span>
                              <span className="font-mono text-green-700">ASCII 72</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-green-800">Binary:</span>
                              <span className="font-mono text-green-700">01001000</span>
                            </div>
                          </div>
                        </div>
                        <div className="bg-green-100 p-4 rounded-lg">
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-green-800">Character 'i':</span>
                              <span className="font-mono text-green-700">ASCII 105</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-green-800">Binary:</span>
                              <span className="font-mono text-green-700">01101001</span>
                            </div>
                          </div>
                        </div>
                        <div className="bg-green-100 p-4 rounded-lg">
                          <h4 className="font-medium text-green-900 mb-2">Final Output:</h4>
                          <div className="font-mono text-green-700 text-sm break-all">
                            01001000 01101001
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gradient-to-r from-purple-50 to-violet-50 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-purple-900 mb-4">Technical Considerations</h3>
                      <div className="space-y-3 text-sm">
                        <div className="flex items-start gap-2">
                          <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                          <span className="text-purple-800"><strong>Byte Ordering:</strong> Each character uses exactly 8 bits in standard representation</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                          <span className="text-purple-800"><strong>Encoding Limits:</strong> ASCII supports 0-127, UTF-8 supports full Unicode range</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                          <span className="text-purple-800"><strong>Memory Usage:</strong> Binary representation is typically 8x larger than original text</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                          <span className="text-purple-800"><strong>Precision:</strong> Conversion is lossless and completely reversible</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Educational Applications */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Educational Applications & Learning Benefits</h2>
                <p className="text-gray-600 mb-8">Text to binary conversion serves as a powerful educational tool for understanding fundamental computer science concepts, making abstract ideas tangible and accessible to learners at all levels.</p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900">Computer Science Education</h3>
                    <div className="space-y-3">
                      <div className="bg-blue-50 border-l-4 border-blue-400 p-3 rounded-r-lg">
                        <h4 className="font-semibold text-blue-900 text-sm">Binary Number Systems</h4>
                        <p className="text-blue-800 text-xs mt-1">Students learn how computers represent numbers and characters using only 0s and 1s, building foundation knowledge for advanced topics.</p>
                      </div>
                      <div className="bg-indigo-50 border-l-4 border-indigo-400 p-3 rounded-r-lg">
                        <h4 className="font-semibold text-indigo-900 text-sm">Data Representation</h4>
                        <p className="text-indigo-800 text-xs mt-1">Understand how different data types (text, numbers, images) are stored and processed in computer memory and storage systems.</p>
                      </div>
                      <div className="bg-cyan-50 border-l-4 border-cyan-400 p-3 rounded-r-lg">
                        <h4 className="font-semibold text-cyan-900 text-sm">Encoding Standards</h4>
                        <p className="text-cyan-800 text-xs mt-1">Learn about ASCII, UTF-8, and Unicode standards that enable global communication and multilingual computing systems.</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900">Programming Concepts</h3>
                    <div className="space-y-3">
                      <div className="bg-green-50 border-l-4 border-green-400 p-3 rounded-r-lg">
                        <h4 className="font-semibold text-green-900 text-sm">Low-Level Programming</h4>
                        <p className="text-green-800 text-xs mt-1">Gain insights into assembly language, memory management, and system programming by understanding binary representation.</p>
                      </div>
                      <div className="bg-emerald-50 border-l-4 border-emerald-400 p-3 rounded-r-lg">
                        <h4 className="font-semibold text-emerald-900 text-sm">Debugging Skills</h4>
                        <p className="text-emerald-800 text-xs mt-1">Learn to analyze binary data, understand encoding errors, and troubleshoot character representation issues in applications.</p>
                      </div>
                      <div className="bg-teal-50 border-l-4 border-teal-400 p-3 rounded-r-lg">
                        <h4 className="font-semibold text-teal-900 text-sm">Algorithm Understanding</h4>
                        <p className="text-teal-800 text-xs mt-1">Develop algorithmic thinking by understanding conversion processes and optimization techniques for binary operations.</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900">Practical Skills</h3>
                    <div className="space-y-3">
                      <div className="bg-orange-50 border-l-4 border-orange-400 p-3 rounded-r-lg">
                        <h4 className="font-semibold text-orange-900 text-sm">Data Analysis</h4>
                        <p className="text-orange-800 text-xs mt-1">Learn to analyze text data at the binary level for forensics, security analysis, and data recovery applications.</p>
                      </div>
                      <div className="bg-red-50 border-l-4 border-red-400 p-3 rounded-r-lg">
                        <h4 className="font-semibold text-red-900 text-sm">Protocol Understanding</h4>
                        <p className="text-red-800 text-xs mt-1">Understand network protocols, file formats, and communication standards that rely on binary data transmission.</p>
                      </div>
                      <div className="bg-pink-50 border-l-4 border-pink-400 p-3 rounded-r-lg">
                        <h4 className="font-semibold text-pink-900 text-sm">Problem Solving</h4>
                        <p className="text-pink-800 text-xs mt-1">Develop logical thinking skills through hands-on experience with binary conversion and encoding challenges.</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-8 bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Interactive Learning Features</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium text-gray-800 mb-2">Real-Time Feedback</h4>
                      <p className="text-gray-600 text-sm">See immediate results as you type, helping students understand the direct relationship between text input and binary output for enhanced learning.</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-800 mb-2">Multiple Format Display</h4>
                      <p className="text-gray-600 text-sm">Compare binary, decimal, and hexadecimal representations simultaneously to understand different number systems and their relationships.</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-800 mb-2">Statistical Analysis</h4>
                      <p className="text-gray-600 text-sm">Character and byte counting features help students understand data storage requirements and optimize their coding practices.</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-800 mb-2">Customizable Examples</h4>
                      <p className="text-gray-600 text-sm">Experiment with different text inputs, encoding options, and formatting to explore various scenarios and edge cases.</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Advanced Use Cases and Best Practices */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Advanced Use Cases & Professional Applications</h2>
                <p className="text-gray-600 mb-8">Text to binary conversion extends far beyond basic education, serving critical functions in professional software development, cybersecurity, data analysis, and system administration across diverse industries and technical domains.</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="bg-blue-50 rounded-lg p-6">
                    <h3 className="font-semibold text-blue-900 mb-4">Software Development</h3>
                    <ul className="text-blue-800 text-sm space-y-2">
                      <li>• Character encoding debugging and validation</li>
                      <li>• Binary protocol design and implementation</li>
                      <li>• Data serialization format development</li>
                      <li>• Cross-platform compatibility testing</li>
                      <li>• Memory optimization analysis</li>
                      <li>• Low-level system programming</li>
                    </ul>
                  </div>

                  <div className="bg-green-50 rounded-lg p-6">
                    <h3 className="font-semibold text-green-900 mb-4">Cybersecurity & Forensics</h3>
                    <ul className="text-green-800 text-sm space-y-2">
                      <li>• Malware analysis and reverse engineering</li>
                      <li>• Steganography detection and analysis</li>
                      <li>• Digital evidence examination</li>
                      <li>• Encrypted data pattern recognition</li>
                      <li>• Network traffic content analysis</li>
                      <li>• Incident response investigation</li>
                    </ul>
                  </div>

                  <div className="bg-purple-50 rounded-lg p-6">
                    <h3 className="font-semibold text-purple-900 mb-4">Data Science & Analytics</h3>
                    <ul className="text-purple-800 text-sm space-y-2">
                      <li>• Text preprocessing for machine learning</li>
                      <li>• Character frequency analysis</li>
                      <li>• Data compression algorithm testing</li>
                      <li>• Binary pattern classification</li>
                      <li>• Statistical text analysis</li>
                      <li>• Information theory applications</li>
                    </ul>
                  </div>

                  <div className="bg-orange-50 rounded-lg p-6">
                    <h3 className="font-semibold text-orange-900 mb-4">Network Engineering</h3>
                    <ul className="text-orange-800 text-sm space-y-2">
                      <li>• Protocol implementation and testing</li>
                      <li>• Packet header analysis</li>
                      <li>• Communication standard compliance</li>
                      <li>• Data transmission optimization</li>
                      <li>• Error detection and correction</li>
                      <li>• Network troubleshooting</li>
                    </ul>
                  </div>

                  <div className="bg-teal-50 rounded-lg p-6">
                    <h3 className="font-semibold text-teal-900 mb-4">Quality Assurance</h3>
                    <ul className="text-teal-800 text-sm space-y-2">
                      <li>• Character encoding validation testing</li>
                      <li>• Internationalization testing support</li>
                      <li>• Data integrity verification</li>
                      <li>• Cross-system compatibility checks</li>
                      <li>• Performance benchmarking</li>
                      <li>• Regression testing automation</li>
                    </ul>
                  </div>

                  <div className="bg-red-50 rounded-lg p-6">
                    <h3 className="font-semibold text-red-900 mb-4">Research & Academia</h3>
                    <ul className="text-red-800 text-sm space-y-2">
                      <li>• Computational linguistics research</li>
                      <li>• Information theory experiments</li>
                      <li>• Algorithm efficiency analysis</li>
                      <li>• Digital humanities projects</li>
                      <li>• Text encoding standards research</li>
                      <li>• Educational material development</li>
                    </ul>
                  </div>
                </div>

                <div className="mt-8 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Professional Best Practices</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium text-gray-800 mb-3">Encoding Selection Guidelines</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-start gap-2">
                          <div className="w-2 h-2 bg-indigo-500 rounded-full mt-2 flex-shrink-0"></div>
                          <span className="text-gray-700">Use UTF-8 for modern applications and international text support</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <div className="w-2 h-2 bg-indigo-500 rounded-full mt-2 flex-shrink-0"></div>
                          <span className="text-gray-700">Choose ASCII only for legacy systems or strict compatibility requirements</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <div className="w-2 h-2 bg-indigo-500 rounded-full mt-2 flex-shrink-0"></div>
                          <span className="text-gray-700">Test encoding with representative sample data before production</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <div className="w-2 h-2 bg-indigo-500 rounded-full mt-2 flex-shrink-0"></div>
                          <span className="text-gray-700">Document encoding decisions for team collaboration</span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-800 mb-3">Quality Assurance Tips</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-start gap-2">
                          <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                          <span className="text-gray-700">Verify binary output matches expected patterns and formats</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                          <span className="text-gray-700">Cross-reference with multiple conversion tools for accuracy</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                          <span className="text-gray-700">Test edge cases including special characters and emojis</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                          <span className="text-gray-700">Validate reversibility by converting back to original text</span>
                        </div>
                      </div>
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
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">What is text to binary conversion?</h3>
                      <p className="text-gray-600 text-sm">
                        Text to binary conversion transforms human-readable text into binary code (0s and 1s), the fundamental language computers use for processing and storing information. Each character is converted to its numerical value and then represented as an 8-bit binary sequence.
                      </p>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Which encoding should I choose for my text?</h3>
                      <p className="text-gray-600 text-sm">
                        Use UTF-8 for modern applications, websites, and international text that may contain special characters, emojis, or non-English languages. Choose ASCII only for legacy systems or when working exclusively with basic English characters (0-127).
                      </p>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">What are the different spacing options for?</h3>
                      <p className="text-gray-600 text-sm">
                        Spacing options improve readability and serve different purposes: "No Spacing" creates compact output, "Space Between Bytes" separates each 8-bit character for easy reading, and "Pipe Separated" uses clear visual boundaries for analysis and documentation.
                      </p>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Is there a character limit for conversion?</h3>
                      <p className="text-gray-600 text-sm">
                        There's no strict character limit, but very large texts may take longer to process due to browser memory constraints. The tool displays character and byte counts to help you monitor input size and processing performance.
                      </p>
                    </div>
                  </div>
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">How secure is this text to binary converter?</h3>
                      <p className="text-gray-600 text-sm">
                        Completely secure! All conversion processing happens locally in your browser using client-side JavaScript. No data is transmitted to servers, stored remotely, or accessed by third parties, ensuring complete privacy and confidentiality.
                      </p>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Can I customize the output format?</h3>
                      <p className="text-gray-600 text-sm">
                        Yes! Advanced options include custom prefixes and suffixes for encoded text, display toggles for different format outputs (decimal, hexadecimal), and various spacing options to meet your specific formatting requirements.
                      </p>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">What's the difference between binary, decimal, and hex outputs?</h3>
                      <p className="text-gray-600 text-sm">
                        Binary shows pure 0s and 1s representation, decimal displays the numerical values (0-255) of each character, and hexadecimal provides a compact representation using 0-9 and A-F. Each serves different technical purposes and readability needs.
                      </p>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Does this work offline after loading?</h3>
                      <p className="text-gray-600 text-sm">
                        Yes! Once the page loads completely, all conversion functionality works offline without requiring an internet connection. The tool runs entirely in your browser, making it reliable for secure environments and unstable connections.
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
                <p className="text-gray-600 mb-8">Our text to binary converter is built with modern web technologies to ensure compatibility, performance, and reliability across all major platforms and devices with comprehensive encoding support.</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">Encoding Support & Specifications</h3>
                    <div className="space-y-4">
                      <div className="bg-blue-50 rounded-lg p-4">
                        <h4 className="font-semibold text-blue-900 mb-2">UTF-8 Unicode Support</h4>
                        <ul className="text-blue-800 text-sm space-y-1">
                          <li>• Full Unicode character range (0-1,114,111)</li>
                          <li>• Variable-length encoding (1-4 bytes)</li>
                          <li>• International characters and emojis</li>
                          <li>• Backward compatibility with ASCII</li>
                        </ul>
                      </div>
                      <div className="bg-orange-50 rounded-lg p-4">
                        <h4 className="font-semibold text-orange-900 mb-2">ASCII Support</h4>
                        <ul className="text-orange-800 text-sm space-y-1">
                          <li>• Standard 7-bit ASCII (0-127)</li>
                          <li>• Fixed 8-bit binary representation</li>
                          <li>• Maximum compatibility guarantee</li>
                          <li>• Legacy system support</li>
                        </ul>
                      </div>
                      <div className="bg-purple-50 rounded-lg p-4">
                        <h4 className="font-semibold text-purple-900 mb-2">Output Formats</h4>
                        <ul className="text-purple-800 text-sm space-y-1">
                          <li>• Binary: 8-bit sequences with customizable spacing</li>
                          <li>• Decimal: Character code values (space-separated)</li>
                          <li>• Hexadecimal: Compact hex representation</li>
                          <li>• Statistics: Character and byte counting</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">Platform & Browser Support</h3>
                    <div className="space-y-4">
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h4 className="font-semibold text-gray-900 mb-2">Desktop Browsers</h4>
                        <ul className="text-gray-700 text-sm space-y-1">
                          <li>• Chrome 90+ (recommended for performance)</li>
                          <li>• Firefox 88+ (excellent unicode support)</li>
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
                          <li>• Client-side processing (no server dependency)</li>
                          <li>• Responsive design (all screen sizes)</li>
                          <li>• Accessibility compliant (WCAG 2.1 AA)</li>
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

export default TextToBinaryConverter;
