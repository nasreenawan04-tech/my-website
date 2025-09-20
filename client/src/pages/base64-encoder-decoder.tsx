
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
import { useToast } from '@/hooks/use-toast';

interface ConversionOptions {
  mode: 'encode' | 'decode';
  lineBreakEvery: number;
  addLineBreaks: boolean;
  urlSafe: boolean;
  validateInput: boolean;
  addPadding: boolean;
  stripWhitespace: boolean;
  addPrefix: string;
  addSuffix: string;
}

interface ConversionResult {
  originalText: string;
  convertedText: string;
  mode: 'encode' | 'decode';
  charCount: number;
  byteCount: number;
  isValid: boolean;
  errorMessage?: string;
  timestamp: Date;
}

const Base64EncoderDecoder = () => {
  const [inputText, setInputText] = useState('');
  const [conversionResult, setConversionResult] = useState<ConversionResult | null>(null);
  const [conversionHistory, setConversionHistory] = useState<ConversionResult[]>([]);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [options, setOptions] = useState<ConversionOptions>({
    mode: 'encode',
    lineBreakEvery: 76,
    addLineBreaks: false,
    urlSafe: false,
    validateInput: true,
    addPadding: true,
    stripWhitespace: true,
    addPrefix: '',
    addSuffix: ''
  });
  const { toast } = useToast();

  const isValidBase64 = (str: string, opts: ConversionOptions): boolean => {
    if (!str) return false;
    try {
      let processedStr = str;
      
      // Strip whitespace if option is enabled
      if (opts.stripWhitespace) {
        processedStr = processedStr.replace(/\s/g, '');
      }
      
      // Handle URL-safe base64 - convert to standard base64 for validation
      if (opts.urlSafe) {
        processedStr = processedStr.replace(/-/g, '+').replace(/_/g, '/');
      }
      
      // Add padding if needed
      if (opts.addPadding) {
        while (processedStr.length % 4) {
          processedStr += '=';
        }
      }
      
      // Test with a regex first for basic format validation
      const base64Regex = /^[A-Za-z0-9+/]*={0,2}$/;
      if (!base64Regex.test(processedStr)) {
        return false;
      }
      
      // Try to decode and re-encode to verify validity
      const decoded = atob(processedStr);
      const reencoded = btoa(decoded);
      return reencoded === processedStr || 
             reencoded === processedStr + '=' || 
             reencoded === processedStr + '==';
    } catch {
      return false;
    }
  };

  const encodeToBase64 = (text: string, opts: ConversionOptions): string => {
    if (!text) return '';
    
    try {
      // Properly handle Unicode by encoding to UTF-8 bytes first
      const bytes = new TextEncoder().encode(text);
      const binaryString = Array.from(bytes, byte => String.fromCharCode(byte)).join('');
      let encoded = btoa(binaryString);
      
      // Remove padding if requested (works for both URL-safe and standard)
      if (!opts.addPadding) {
        encoded = encoded.replace(/=/g, '');
      }
      
      // URL-safe base64
      if (opts.urlSafe) {
        encoded = encoded.replace(/\+/g, '-').replace(/\//g, '_');
      }
      
      // Add line breaks
      if (opts.addLineBreaks && opts.lineBreakEvery > 0) {
        const regex = new RegExp(`.{1,${opts.lineBreakEvery}}`, 'g');
        encoded = encoded.match(regex)?.join('\n') || encoded;
      }
      
      return encoded;
    } catch (error) {
      throw new Error('Failed to encode text to Base64');
    }
  };

  const decodeFromBase64 = (base64: string, opts: ConversionOptions): string => {
    if (!base64) return '';
    
    try {
      let processedBase64 = base64;
      
      // Strip whitespace
      if (opts.stripWhitespace) {
        processedBase64 = processedBase64.replace(/\s/g, '');
      }
      
      // Handle URL-safe base64
      if (opts.urlSafe) {
        processedBase64 = processedBase64.replace(/-/g, '+').replace(/_/g, '/');
      }
      
      // Add padding if needed
      if (opts.addPadding) {
        while (processedBase64.length % 4) {
          processedBase64 += '=';
        }
      }
      
      // Decode and properly handle Unicode
      const binaryString = atob(processedBase64);
      const bytes = Uint8Array.from(binaryString, char => char.charCodeAt(0));
      return new TextDecoder().decode(bytes);
    } catch (error) {
      throw new Error('Invalid Base64 input - cannot decode');
    }
  };

  const convertText = () => {
    if (!inputText.trim()) {
      setConversionResult(null);
      setShowResults(false);
      return;
    }

    try {
      let convertedText: string;
      let isValid = true;
      let errorMessage: string | undefined;

      if (options.mode === 'encode') {
        convertedText = encodeToBase64(inputText, options);
      } else {
        // Validate input for decode mode
        if (options.validateInput && !isValidBase64(inputText, options)) {
          isValid = false;
          errorMessage = 'Input is not valid Base64';
          convertedText = '';
        } else {
          convertedText = decodeFromBase64(inputText, options);
        }
      }

      // Apply prefix and suffix if provided
      let formattedText = convertedText;
      if (isValid && (options.addPrefix || options.addSuffix)) {
        formattedText = `${options.addPrefix}${convertedText}${options.addSuffix}`;
      }

      const result: ConversionResult = {
        originalText: inputText,
        convertedText: formattedText,
        mode: options.mode,
        charCount: inputText.length,
        byteCount: new Blob([inputText]).size,
        isValid,
        errorMessage,
        timestamp: new Date()
      };

      setConversionResult(result);
      setShowResults(true);

      // Add to history (keep last 10)
      if (isValid) {
        setConversionHistory(prev => {
          const updated = [result, ...prev.filter(item => 
            item.originalText !== inputText || item.mode !== options.mode
          )];
          return updated.slice(0, 10);
        });
      }
    } catch (error) {
      const errorResult: ConversionResult = {
        originalText: inputText,
        convertedText: '',
        mode: options.mode,
        charCount: inputText.length,
        byteCount: 0,
        isValid: false,
        errorMessage: error instanceof Error ? error.message : 'Conversion failed',
        timestamp: new Date()
      };
      setConversionResult(errorResult);
      setShowResults(true);
    }
  };

  const updateOption = <K extends keyof ConversionOptions>(key: K, value: ConversionOptions[K]) => {
    setOptions(prev => ({ ...prev, [key]: value }));
  };

  const handleCopyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast({
        title: "Copied to clipboard",
        description: `${options.mode === 'encode' ? 'Encoded' : 'Decoded'} text has been copied`,
      });
    }).catch(() => {
      toast({
        title: "Copy failed",
        description: "Unable to copy to clipboard",
        variant: "destructive",
      });
    });
  };

  const handleSwapMode = () => {
    setOptions(prev => ({
      ...prev,
      mode: prev.mode === 'encode' ? 'decode' : 'encode'
    }));
    
    // Swap input and output if there's a valid result
    if (conversionResult?.isValid && conversionResult.convertedText) {
      setInputText(conversionResult.convertedText);
    }
  };

  const handleClear = () => {
    setInputText('');
    setConversionResult(null);
    setShowResults(false);
  };

  const handleSampleText = () => {
    if (options.mode === 'encode') {
      setInputText('Hello World! Welcome to DapsiWow\'s Base64 Encoder/Decoder. This tool converts text to Base64 and vice versa with advanced options.');
    } else {
      setInputText('SGVsbG8gV29ybGQhIFdlbGNvbWUgdG8gRGFwc2lXb3cncyBCYXNlNjQgRW5jb2Rlci9EZWNvZGVyLiBUaGlzIHRvb2wgY29udmVydHMgdGV4dCB0byBCYXNlNjQgYW5kIHZpY2UgdmVyc2Egd2l0aCBhZHZhbmNlZCBvcHRpb25zLg==');
    }
  };

  const resetConverter = () => {
    setInputText('');
    setConversionResult(null);
    setShowResults(false);
    setShowAdvanced(false);
    setOptions({
      mode: 'encode',
      lineBreakEvery: 76,
      addLineBreaks: false,
      urlSafe: false,
      validateInput: true,
      addPadding: true,
      stripWhitespace: true,
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
    if (options.mode === 'encode') {
      return options.urlSafe ? 'URL-safe Base64 encoded text' : 'Standard Base64 encoded text';
    } else {
      return 'Decoded text from Base64 input';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Helmet>
        <title>Base64 Encoder/Decoder - Convert Text to Base64 Online | DapsiWow</title>
        <meta name="description" content="Free Base64 encoder and decoder tool. Convert text to Base64 and decode Base64 to text with advanced options including URL-safe encoding, line breaks, and validation. Professional tool for developers and data processing." />
        <meta name="keywords" content="base64 encoder, base64 decoder, base64 converter, encode decode, url safe base64, text converter, developer tools, data encoding, base64 online, binary to text, text encoding" />
        <meta property="og:title" content="Base64 Encoder/Decoder - Convert Text to Base64 Online | DapsiWow" />
        <meta property="og:description" content="Professional Base64 encoder and decoder with advanced features. Convert text to Base64 and decode Base64 strings with URL-safe options, line breaks, and custom formatting." />
        <meta property="og:type" content="website" />
        <meta name="robots" content="index, follow" />
        <meta name="author" content="DapsiWow" />
        <link rel="canonical" href="https://dapsiwow.com/tools/base64-encoder-decoder" />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            "name": "Base64 Encoder/Decoder",
            "description": "Professional Base64 encoder and decoder for converting text to Base64 format and decoding Base64 strings back to readable text with advanced encoding options and validation.",
            "url": "https://dapsiwow.com/tools/base64-encoder-decoder",
            "applicationCategory": "DeveloperApplication",
            "operatingSystem": "Any",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "USD"
            },
            "featureList": [
              "Text to Base64 encoding",
              "Base64 to text decoding",
              "URL-safe Base64 support",
              "Custom line break formatting",
              "Input validation and error handling",
              "Real-time conversion",
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
                <span className="font-medium text-blue-700">Professional Base64 Tool</span>
              </div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl 2xl:text-7xl font-bold text-slate-900 leading-tight tracking-tight" data-testid="text-page-title">
                <span className="block">Base64 Encoder</span>
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                  & Decoder
                </span>
              </h1>
              <p className="text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl text-slate-600 max-w-xs sm:max-w-md md:max-w-2xl lg:max-w-4xl xl:max-w-5xl mx-auto leading-relaxed px-2 sm:px-4 md:px-6">
                Convert text to Base64 and decode Base64 strings with professional encoding options instantly
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
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">
                      Base64 {options.mode === 'encode' ? 'Encoder' : 'Decoder'}
                    </h2>
                    <p className="text-gray-600">
                      {options.mode === 'encode' 
                        ? 'Enter text to convert it to Base64 format'
                        : 'Enter Base64 string to decode it back to readable text'
                      }
                    </p>
                  </div>

                  <div className="space-y-4 sm:space-y-6">
                    {/* Text Input */}
                    <div className="space-y-3">
                      <Label htmlFor="text-input" className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                        {options.mode === 'encode' ? 'Text to Encode' : 'Base64 to Decode'}
                      </Label>
                      <Textarea
                        id="text-input"
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        className="min-h-[100px] sm:min-h-[120px] lg:min-h-[140px] text-base sm:text-lg border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-blue-500 resize-none"
                        placeholder={options.mode === 'encode' 
                          ? 'Type or paste your text here to encode to Base64...'
                          : 'Type or paste your Base64 string here to decode...'
                        }
                        data-testid="textarea-text-input"
                      />
                    </div>

                    {/* Mode Selection */}
                    <div className="space-y-3">
                      <Label htmlFor="mode-select" className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                        Conversion Mode
                      </Label>
                      <Select
                        value={options.mode}
                        onValueChange={(value: 'encode' | 'decode') => 
                          updateOption('mode', value)
                        }
                      >
                        <SelectTrigger className="h-12 sm:h-14 border-2 border-gray-200 rounded-xl text-base sm:text-lg" data-testid="select-mode">
                          <SelectValue placeholder="Select mode" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="encode">Encode (Text → Base64)</SelectItem>
                          <SelectItem value="decode">Decode (Base64 → Text)</SelectItem>
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
                        
                        {/* Encoding and Processing Options */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                          <div className="space-y-4 bg-gray-50 rounded-xl p-4 sm:p-6">
                            <h4 className="text-sm sm:text-base font-semibold text-gray-900">Encoding Options</h4>
                            
                            <div className="flex items-center justify-between gap-2">
                              <div className="space-y-1 flex-1 min-w-0">
                                <Label className="text-xs sm:text-sm font-medium">URL-Safe Base64</Label>
                                <p className="text-xs text-gray-500">Use URL and filename safe encoding</p>
                              </div>
                              <Switch
                                checked={options.urlSafe}
                                onCheckedChange={(value) => updateOption('urlSafe', value)}
                                data-testid="switch-url-safe"
                              />
                            </div>

                            <div className="flex items-center justify-between gap-2">
                              <div className="space-y-1 flex-1 min-w-0">
                                <Label className="text-xs sm:text-sm font-medium">Add Padding</Label>
                                <p className="text-xs text-gray-500">Include padding characters (=)</p>
                              </div>
                              <Switch
                                checked={options.addPadding}
                                onCheckedChange={(value) => updateOption('addPadding', value)}
                                data-testid="switch-add-padding"
                              />
                            </div>

                            <div className="flex items-center justify-between gap-2">
                              <div className="space-y-1 flex-1 min-w-0">
                                <Label className="text-xs sm:text-sm font-medium">Add Line Breaks</Label>
                                <p className="text-xs text-gray-500">Insert line breaks for readability</p>
                              </div>
                              <Switch
                                checked={options.addLineBreaks}
                                onCheckedChange={(value) => updateOption('addLineBreaks', value)}
                                data-testid="switch-line-breaks"
                              />
                            </div>

                            {options.mode === 'decode' && (
                              <div className="flex items-center justify-between gap-2">
                                <div className="space-y-1 flex-1 min-w-0">
                                  <Label className="text-xs sm:text-sm font-medium">Validate Input</Label>
                                  <p className="text-xs text-gray-500">Check if input is valid Base64</p>
                                </div>
                                <Switch
                                  checked={options.validateInput}
                                  onCheckedChange={(value) => updateOption('validateInput', value)}
                                  data-testid="switch-validate"
                                />
                              </div>
                            )}

                            <div className="flex items-center justify-between gap-2">
                              <div className="space-y-1 flex-1 min-w-0">
                                <Label className="text-xs sm:text-sm font-medium">Strip Whitespace</Label>
                                <p className="text-xs text-gray-500">Remove spaces and line breaks</p>
                              </div>
                              <Switch
                                checked={options.stripWhitespace}
                                onCheckedChange={(value) => updateOption('stripWhitespace', value)}
                                data-testid="switch-strip-whitespace"
                              />
                            </div>

                            {options.addLineBreaks && options.mode === 'encode' && (
                              <div className="space-y-2">
                                <Label className="text-xs sm:text-sm font-medium">Line Break Every</Label>
                                <Input
                                  type="number"
                                  min="1"
                                  max="200"
                                  value={options.lineBreakEvery}
                                  onChange={(e) => updateOption('lineBreakEvery', Math.max(1, parseInt(e.target.value) || 76))}
                                  className="text-sm h-10 sm:h-12 border-2 border-gray-200 rounded-lg"
                                  data-testid="input-line-break-length"
                                />
                                <p className="text-xs text-gray-500">Number of characters per line</p>
                              </div>
                            )}
                          </div>

                          {/* Text Customization Options */}
                          <div className="space-y-4 bg-gray-50 rounded-xl p-4 sm:p-6">
                            <h4 className="text-sm sm:text-base font-semibold text-gray-900">Text Customization</h4>
                            
                            <div className="space-y-2">
                              <Label className="text-xs sm:text-sm font-medium">Add Prefix</Label>
                              <Input
                                value={options.addPrefix}
                                onChange={(e) => updateOption('addPrefix', e.target.value)}
                                placeholder="e.g., data:text/plain;base64,"
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
                      {options.mode === 'encode' ? 'Encode to Base64' : 'Decode from Base64'}
                    </Button>
                    <Button
                      onClick={handleSwapMode}
                      variant="outline"
                      className="h-12 sm:h-14 px-6 sm:px-8 border-2 border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold text-base sm:text-lg rounded-xl"
                      data-testid="button-swap-mode"
                    >
                      Switch Mode
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
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6 sm:mb-8">
                    {options.mode === 'encode' ? 'Encoded Results' : 'Decoded Results'}
                  </h2>

                  {showResults && conversionResult ? (
                    <div className="space-y-3 sm:space-y-4" data-testid="conversion-results">
                      {conversionResult.isValid ? (
                        <>
                          {/* Main Output Display */}
                          <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-3 sm:p-4">
                            <div className="flex items-center justify-between mb-3 gap-3">
                              <div className="flex-1 min-w-0">
                                <h3 className="text-sm sm:text-base font-semibold text-gray-900 truncate">
                                  {options.mode === 'encode' ? 'Base64 Encoded Text' : 'Decoded Text'}
                                </h3>
                                <p className="text-xs sm:text-sm text-gray-600 break-words">{getOutputFormatLabel()}</p>
                              </div>
                              <Button
                                onClick={() => handleCopyToClipboard(conversionResult.convertedText)}
                                variant="outline"
                                size="sm"
                                className="text-xs px-2 sm:px-3 py-2 flex-shrink-0 rounded-lg min-w-[60px] sm:min-w-[70px] h-11 sm:h-9 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                                data-testid="button-copy-result"
                              >
                                Copy
                              </Button>
                            </div>
                            <div 
                              className="bg-white p-2 sm:p-3 rounded-lg border border-gray-200 text-xs sm:text-sm font-mono break-all min-h-[40px] sm:min-h-[44px] flex items-center"
                              data-testid="conversion-output"
                            >
                              {conversionResult.convertedText || '(empty result)'}
                            </div>
                          </div>

                          {/* Text Statistics */}
                          <div className="bg-white rounded-xl p-3 sm:p-4 shadow-sm border border-gray-200" data-testid="text-statistics">
                            <h3 className="text-sm sm:text-base font-bold text-gray-900 mb-4">Conversion Statistics</h3>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                              <div className="bg-blue-50 rounded-lg p-4 text-center">
                                <div className="text-2xl font-bold text-blue-600" data-testid="input-length">{conversionResult.charCount}</div>
                                <div className="text-sm text-blue-700 font-medium">Input Length</div>
                              </div>
                              <div className="bg-green-50 rounded-lg p-4 text-center">
                                <div className="text-2xl font-bold text-green-600" data-testid="output-length">{conversionResult.convertedText.length}</div>
                                <div className="text-sm text-green-700 font-medium">Output Length</div>
                              </div>
                              <div className="bg-purple-50 rounded-lg p-4 text-center">
                                <div className="text-2xl font-bold text-purple-600" data-testid="conversion-mode">{conversionResult.mode.toUpperCase()}</div>
                                <div className="text-sm text-purple-700 font-medium">Mode</div>
                              </div>
                              <div className="bg-orange-50 rounded-lg p-4 text-center">
                                <div className="text-2xl font-bold text-orange-600" data-testid="byte-size">{conversionResult.byteCount}</div>
                                <div className="text-sm text-orange-700 font-medium">Bytes</div>
                              </div>
                            </div>
                          </div>
                        </>
                      ) : (
                        <div className="text-center py-12 sm:py-16" data-testid="error-result">
                          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-red-200 rounded-full mx-auto mb-4 sm:mb-6 flex items-center justify-center">
                            <div className="text-2xl sm:text-3xl font-bold text-red-500">!</div>
                          </div>
                          <p className="text-red-600 text-base sm:text-lg px-4 font-medium" data-testid="error-message">
                            {conversionResult.errorMessage}
                          </p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-12 sm:py-16" data-testid="no-results">
                      <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-200 rounded-full mx-auto mb-4 sm:mb-6 flex items-center justify-center">
                        <div className="text-2xl sm:text-3xl font-bold text-gray-400">B64</div>
                      </div>
                      <p className="text-gray-500 text-base sm:text-lg px-4">
                        Enter text to {options.mode === 'encode' ? 'encode to Base64' : 'decode from Base64'}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* SEO Content Sections */}
          <div className="mt-16 space-y-8">
            {/* What is Base64 Encoding */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">What is Base64 Encoding?</h2>
                <div className="space-y-4 text-gray-600">
                  <p>
                    <strong>Base64 encoding</strong> is a binary-to-text encoding scheme that represents binary data in an ASCII string format using a radix-64 representation. This fundamental encoding method transforms binary data into a sequence of printable characters, making it safe for transmission over text-based protocols that may not handle binary data correctly.
                  </p>
                  <p>
                    Our professional Base64 encoder/decoder supports both standard and URL-safe Base64 encoding with comprehensive customization options including line breaks, padding control, and input validation. The tool handles UTF-8 text encoding properly, ensuring international characters and special symbols are converted accurately without data loss.
                  </p>
                  <p>
                    Base64 encoding increases the data size by approximately 33% due to the encoding overhead, but provides universal compatibility across different systems and protocols. The encoding process converts every 3 bytes of input into 4 Base64 characters, making it ideal for embedding binary data in text formats like JSON, XML, or HTML.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Base64 Character Set and Encoding Process */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Understanding Base64 Character Set and Encoding Process</h2>
                <p className="text-gray-600 mb-8">Base64 encoding uses a specific set of 64 characters to represent binary data in text format. Understanding this character set and the encoding process helps you work effectively with Base64 data and troubleshoot encoding issues.</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold text-gray-900">Standard Base64 Character Set</h3>
                    <div className="bg-blue-50 rounded-lg p-6">
                      <p className="text-blue-800 text-sm mb-4">
                        Standard Base64 uses 64 characters: A-Z (uppercase), a-z (lowercase), 0-9 (digits), plus (+), and slash (/). Padding is done with equals signs (=) when needed.
                      </p>
                      <div className="space-y-3">
                        <div className="bg-white p-3 rounded border">
                          <h4 className="font-medium text-blue-900 mb-1">Character Range Breakdown</h4>
                          <div className="text-xs font-mono text-blue-800 space-y-1">
                            <div>A-Z: Values 0-25</div>
                            <div>a-z: Values 26-51</div>
                            <div>0-9: Values 52-61</div>
                            <div>+: Value 62, /: Value 63</div>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <h4 className="font-medium text-blue-900 text-sm">Best for:</h4>
                          <ul className="text-xs text-blue-700 space-y-1">
                            <li>• Email attachments and MIME encoding</li>
                            <li>• Data URLs and embedded content</li>
                            <li>• XML and JSON data embedding</li>
                            <li>• General purpose data encoding</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold text-gray-900">URL-Safe Base64 Variant</h3>
                    <div className="bg-green-50 rounded-lg p-6">
                      <p className="text-green-800 text-sm mb-4">
                        URL-safe Base64 replaces problematic characters: plus (+) becomes hyphen (-) and slash (/) becomes underscore (_). This ensures the encoded data is safe for URLs and filenames.
                      </p>
                      <div className="space-y-3">
                        <div className="bg-white p-3 rounded border">
                          <h4 className="font-medium text-green-900 mb-1">Character Substitutions</h4>
                          <div className="text-xs font-mono text-green-800 space-y-1">
                            <div>Standard: + / =</div>
                            <div>URL-Safe: - _ (no padding)</div>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <h4 className="font-medium text-green-900 text-sm">Best for:</h4>
                          <ul className="text-xs text-green-700 space-y-1">
                            <li>• URL parameters and query strings</li>
                            <li>• Filename-safe encoding</li>
                            <li>• Web APIs and REST services</li>
                            <li>• JWT tokens and authentication</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-8">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Encoding Process Breakdown</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-purple-50 rounded-lg p-4">
                      <h4 className="font-semibold text-purple-900 mb-2">Step 1: Binary Conversion</h4>
                      <p className="text-xs text-purple-700 mb-2">Text is converted to binary representation using UTF-8 encoding to handle international characters properly.</p>
                      <code className="text-xs font-mono text-purple-800 block bg-white p-2 rounded">"Hi" → 01001000 01101001</code>
                    </div>
                    <div className="bg-orange-50 rounded-lg p-4">
                      <h4 className="font-semibold text-orange-900 mb-2">Step 2: 6-Bit Grouping</h4>
                      <p className="text-xs text-orange-700 mb-2">Binary data is grouped into 6-bit chunks, each representing a Base64 character index (0-63).</p>
                      <code className="text-xs font-mono text-orange-800 block bg-white p-2 rounded">010010 000110 1001(00)</code>
                    </div>
                    <div className="bg-teal-50 rounded-lg p-4">
                      <h4 className="font-semibold text-teal-900 mb-2">Step 3: Character Mapping</h4>
                      <p className="text-xs text-teal-700 mb-2">Each 6-bit value is mapped to its corresponding Base64 character from the character set.</p>
                      <code className="text-xs font-mono text-teal-800 block bg-white p-2 rounded">18→S, 6→G, 36→k</code>
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
                  <p className="text-gray-600 mb-6">Base64 encoding serves critical functions across web development, data transmission, and security applications. Understanding these use cases helps you apply Base64 encoding effectively in your projects.</p>
                  
                  <div className="space-y-4">
                    <div className="bg-blue-50 rounded-lg p-4">
                      <h3 className="font-semibold text-blue-900 mb-2">Web Development</h3>
                      <ul className="text-blue-800 text-sm space-y-1">
                        <li>• Data URLs for inline images and assets</li>
                        <li>• JSON and XML data embedding</li>
                        <li>• Form data encoding and transmission</li>
                        <li>• Browser-based file processing</li>
                      </ul>
                    </div>
                    
                    <div className="bg-green-50 rounded-lg p-4">
                      <h3 className="font-semibold text-green-900 mb-2">API & Data Exchange</h3>
                      <ul className="text-green-800 text-sm space-y-1">
                        <li>• REST API binary data transmission</li>
                        <li>• Authentication tokens and credentials</li>
                        <li>• Configuration file encoding</li>
                        <li>• Cross-platform data serialization</li>
                      </ul>
                    </div>
                    
                    <div className="bg-purple-50 rounded-lg p-4">
                      <h3 className="font-semibold text-purple-900 mb-2">Email & Communication</h3>
                      <ul className="text-purple-800 text-sm space-y-1">
                        <li>• MIME email attachment encoding</li>
                        <li>• Secure message transmission</li>
                        <li>• Binary data in text protocols</li>
                        <li>• Legacy system compatibility</li>
                      </ul>
                    </div>

                    <div className="bg-orange-50 rounded-lg p-4">
                      <h3 className="font-semibold text-orange-900 mb-2">Security & Authentication</h3>
                      <ul className="text-orange-800 text-sm space-y-1">
                        <li>• JWT token encoding and transmission</li>
                        <li>• Basic HTTP authentication headers</li>
                        <li>• Certificate and key encoding</li>
                        <li>• Cryptographic data representation</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
                <CardContent className="p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Advanced Features & Options</h2>
                  <p className="text-gray-600 mb-6">Our Base64 encoder/decoder provides professional-grade features designed for accuracy, customization, and integration with various workflows and systems.</p>
                  
                  <div className="space-y-4">
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-400 p-4 rounded-r-lg">
                      <h4 className="font-semibold text-blue-900 mb-2">Smart Format Detection</h4>
                      <p className="text-blue-800 text-sm">Automatic detection of input format with intelligent validation and error handling for both encoding and decoding operations.</p>
                    </div>
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-l-4 border-green-400 p-4 rounded-r-lg">
                      <h4 className="font-semibold text-green-900 mb-2">Flexible Line Breaking</h4>
                      <p className="text-green-800 text-sm">Customizable line break insertion for improved readability and compatibility with systems that require specific formatting.</p>
                    </div>
                    <div className="bg-gradient-to-r from-purple-50 to-violet-50 border-l-4 border-purple-400 p-4 rounded-r-lg">
                      <h4 className="font-semibold text-purple-900 mb-2">Output Customization</h4>
                      <p className="text-purple-800 text-sm">Add custom prefixes and suffixes to encoded output for data URLs, MIME types, or specific application requirements.</p>
                    </div>
                    <div className="bg-gradient-to-r from-orange-50 to-red-50 border-l-4 border-orange-400 p-4 rounded-r-lg">
                      <h4 className="font-semibold text-orange-900 mb-2">Privacy & Security</h4>
                      <p className="text-orange-800 text-sm">All processing happens locally in your browser with no data transmission to servers, ensuring complete privacy and security.</p>
                    </div>
                    <div className="bg-gradient-to-r from-teal-50 to-cyan-50 border-l-4 border-teal-400 p-4 rounded-r-lg">
                      <h4 className="font-semibold text-teal-900 mb-2">Multi-Mode Operation</h4>
                      <p className="text-teal-800 text-sm">Seamless switching between encoding and decoding modes with automatic sample text generation for testing and learning.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Common Examples and Data URL Usage */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Common Base64 Examples & Data URL Usage</h2>
                <p className="text-gray-600 mb-8">Understanding practical Base64 examples helps you recognize encoded data and implement Base64 encoding in real-world applications. These examples demonstrate common patterns and use cases.</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="bg-blue-50 rounded-lg p-6">
                    <h3 className="font-semibold text-blue-900 mb-4">Text Encoding Examples</h3>
                    <div className="space-y-3">
                      <div className="bg-white p-3 rounded border">
                        <h4 className="font-medium text-blue-900 mb-1">Simple Text</h4>
                        <code className="text-xs font-mono text-blue-800 break-all">"Hello" → SGVsbG8=</code>
                      </div>
                      <div className="bg-white p-3 rounded border">
                        <h4 className="font-medium text-blue-900 mb-1">Special Characters</h4>
                        <code className="text-xs font-mono text-blue-800 break-all">"Hello, 世界!" → SGVsbG8sIOS4lueVjCE=</code>
                      </div>
                      <div className="bg-white p-3 rounded border">
                        <h4 className="font-medium text-blue-900 mb-1">JSON Data</h4>
                        <code className="text-xs font-mono text-blue-800 break-all">{`{"user":"admin"} → eyJ1c2VyIjoiYWRtaW4ifQ==`}</code>
                      </div>
                    </div>
                  </div>

                  <div className="bg-green-50 rounded-lg p-6">
                    <h3 className="font-semibold text-green-900 mb-4">URL-Safe Base64</h3>
                    <div className="space-y-3">
                      <div className="bg-white p-3 rounded border">
                        <h4 className="font-medium text-green-900 mb-1">Standard vs URL-Safe</h4>
                        <div className="text-xs font-mono text-green-800 space-y-1">
                          <div>Standard: a+b/c=</div>
                          <div>URL-Safe: a-b_c</div>
                        </div>
                      </div>
                      <div className="bg-white p-3 rounded border">
                        <h4 className="font-medium text-green-900 mb-1">JWT Token Example</h4>
                        <code className="text-xs font-mono text-green-800 break-all">eyJhbGciOiJIUzI1NiJ9</code>
                      </div>
                      <div className="bg-white p-3 rounded border">
                        <h4 className="font-medium text-green-900 mb-1">URL Parameter</h4>
                        <code className="text-xs font-mono text-green-800 break-all">?data=SGVsbG8gV29ybGQ</code>
                      </div>
                    </div>
                  </div>

                  <div className="bg-purple-50 rounded-lg p-6">
                    <h3 className="font-semibold text-purple-900 mb-4">Data URLs</h3>
                    <div className="space-y-3">
                      <div className="bg-white p-3 rounded border">
                        <h4 className="font-medium text-purple-900 mb-1">Text Content</h4>
                        <code className="text-xs font-mono text-purple-800 break-all">data:text/plain;base64,SGVsbG8=</code>
                      </div>
                      <div className="bg-white p-3 rounded border">
                        <h4 className="font-medium text-purple-900 mb-1">HTML Content</h4>
                        <code className="text-xs font-mono text-purple-800 break-all">data:text/html;base64,PGgxPkhlbGxvPC9oMT4=</code>
                      </div>
                      <div className="bg-white p-3 rounded border">
                        <h4 className="font-medium text-purple-900 mb-1">JSON Data</h4>
                        <code className="text-xs font-mono text-purple-800 break-all">data:application/json;base64,eyJuYW1lIjoiSm9obiJ9</code>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-8 bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Practical Implementation Examples</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="bg-white p-4 rounded border">
                        <h4 className="font-medium text-gray-900 mb-2">Basic Authentication Header</h4>
                        <p className="text-sm text-gray-600 mb-2">HTTP Basic Auth encodes username:password</p>
                        <code className="text-xs font-mono text-gray-800 block">Authorization: Basic dXNlcjpwYXNzd29yZA==</code>
                      </div>
                      <div className="bg-white p-4 rounded border">
                        <h4 className="font-medium text-gray-900 mb-2">Email Attachment</h4>
                        <p className="text-sm text-gray-600 mb-2">MIME encoding for email attachments</p>
                        <code className="text-xs font-mono text-gray-800 block">Content-Transfer-Encoding: base64</code>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="bg-white p-4 rounded border">
                        <h4 className="font-medium text-gray-900 mb-2">Configuration File</h4>
                        <p className="text-sm text-gray-600 mb-2">Encoded configuration data</p>
                        <code className="text-xs font-mono text-gray-800 block">config: "c2VydmVyPWxvY2FsaG9zdA=="</code>
                      </div>
                      <div className="bg-white p-4 rounded border">
                        <h4 className="font-medium text-gray-900 mb-2">API Response</h4>
                        <p className="text-sm text-gray-600 mb-2">Binary data in JSON response</p>
                        <code className="text-xs font-mono text-gray-800 block">"image": "iVBORw0KGgoAAAANS..."</code>
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
                <p className="text-gray-600 mb-8">Follow these professional guidelines to ensure successful Base64 encoding and decoding operations while avoiding common pitfalls and issues that can occur during implementation.</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">Encoding Best Practices</h3>
                    <div className="space-y-4">
                      <div className="bg-blue-50 rounded-lg p-4">
                        <h4 className="font-semibold text-blue-900 mb-2">Choose the Right Variant</h4>
                        <ul className="text-blue-800 text-sm space-y-1">
                          <li>• Use standard Base64 for email and general encoding</li>
                          <li>• Select URL-safe Base64 for web APIs and URLs</li>
                          <li>• Consider padding requirements for your use case</li>
                          <li>• Test compatibility with target systems</li>
                        </ul>
                      </div>
                      <div className="bg-green-50 rounded-lg p-4">
                        <h4 className="font-semibold text-green-900 mb-2">Handle Text Encoding Properly</h4>
                        <ul className="text-green-800 text-sm space-y-1">
                          <li>• Always use UTF-8 encoding for text input</li>
                          <li>• Be aware of character encoding in source data</li>
                          <li>• Test with international characters and symbols</li>
                          <li>• Validate encoding results with known test cases</li>
                        </ul>
                      </div>
                      <div className="bg-purple-50 rounded-lg p-4">
                        <h4 className="font-semibold text-purple-900 mb-2">Optimize for Performance</h4>
                        <ul className="text-purple-800 text-sm space-y-1">
                          <li>• Consider data size increase (33% overhead)</li>
                          <li>• Use appropriate line breaking for readability</li>
                          <li>• Implement proper error handling for invalid input</li>
                          <li>• Cache encoded results when appropriate</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">Common Issues & Solutions</h3>
                    <div className="space-y-4">
                      <div className="bg-red-50 rounded-lg p-4">
                        <h4 className="font-semibold text-red-900 mb-2">Invalid Character Errors</h4>
                        <p className="text-red-800 text-sm mb-2">Problem: "Invalid character in Base64 string"</p>
                        <p className="text-red-700 text-xs">Solution: Check for non-Base64 characters, ensure proper URL-safe conversion, and verify input format consistency.</p>
                      </div>
                      <div className="bg-orange-50 rounded-lg p-4">
                        <h4 className="font-semibold text-orange-900 mb-2">Padding Issues</h4>
                        <p className="text-orange-800 text-sm mb-2">Problem: Incorrect padding causing decode errors</p>
                        <p className="text-orange-700 text-xs">Solution: Enable automatic padding addition, check if URL-safe encoding removes padding, and validate padding requirements.</p>
                      </div>
                      <div className="bg-yellow-50 rounded-lg p-4">
                        <h4 className="font-semibold text-yellow-900 mb-2">Character Encoding Problems</h4>
                        <p className="text-yellow-800 text-sm mb-2">Problem: Special characters not encoding/decoding correctly</p>
                        <p className="text-yellow-700 text-xs">Solution: Ensure UTF-8 text encoding, verify character set compatibility, and test with international characters.</p>
                      </div>
                      <div className="bg-teal-50 rounded-lg p-4">
                        <h4 className="font-semibold text-teal-900 mb-2">Line Break Handling</h4>
                        <p className="text-teal-800 text-sm mb-2">Problem: Unexpected line breaks in encoded output</p>
                        <p className="text-teal-700 text-xs">Solution: Configure line break settings appropriately, strip whitespace for decoding, and check MIME formatting requirements.</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-8 bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Security Considerations</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white p-4 rounded border">
                      <h4 className="font-medium text-gray-900 mb-2">Data Privacy</h4>
                      <p className="text-gray-700 text-sm">Base64 is encoding, not encryption. Sensitive data should be encrypted before Base64 encoding for transmission.</p>
                    </div>
                    <div className="bg-white p-4 rounded border">
                      <h4 className="font-medium text-gray-900 mb-2">Input Validation</h4>
                      <p className="text-gray-700 text-sm">Always validate Base64 input before decoding to prevent injection attacks and ensure data integrity.</p>
                    </div>
                    <div className="bg-white p-4 rounded border">
                      <h4 className="font-medium text-gray-900 mb-2">Size Limitations</h4>
                      <p className="text-gray-700 text-sm">Be aware of system limitations for Base64 data size, especially in URLs and HTTP headers.</p>
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
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">What is Base64 encoding used for?</h3>
                      <p className="text-gray-600 text-sm">
                        Base64 encoding converts binary data into text format for safe transmission over text-based protocols. It's used for email attachments, data URLs, API authentication, JSON data embedding, and ensuring binary data compatibility across different systems.
                      </p>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">What's the difference between standard and URL-safe Base64?</h3>
                      <p className="text-gray-600 text-sm">
                        Standard Base64 uses +, /, and = characters which can cause issues in URLs. URL-safe Base64 replaces + with -, / with _, and often omits padding (=) to ensure the encoded data is safe for use in URLs and filenames.
                      </p>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Does Base64 encoding provide security?</h3>
                      <p className="text-gray-600 text-sm">
                        No, Base64 is encoding, not encryption. It makes data unreadable to casual observation but provides no security. Anyone can easily decode Base64 data. For security, encrypt data first, then apply Base64 encoding if needed for transmission.
                      </p>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Why does Base64 increase data size?</h3>
                      <p className="text-gray-600 text-sm">
                        Base64 increases data size by approximately 33% because it converts every 3 bytes of binary data into 4 text characters. This overhead is the trade-off for ensuring binary data can be safely transmitted through text-based systems.
                      </p>
                    </div>
                  </div>
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">How do I handle line breaks in Base64?</h3>
                      <p className="text-gray-600 text-sm">
                        Line breaks improve readability but must be handled correctly. For decoding, enable whitespace stripping to remove line breaks. For encoding, configure line break insertion based on your target system's requirements (MIME uses 76 characters per line).
                      </p>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">What causes "Invalid Base64" errors?</h3>
                      <p className="text-gray-600 text-sm">
                        Common causes include invalid characters (not A-Z, a-z, 0-9, +, /), incorrect padding, mixing standard and URL-safe formats, or corrupted data. Enable input validation and check for proper character set usage.
                      </p>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Can I encode files with this tool?</h3>
                      <p className="text-gray-600 text-sm">
                        This tool is optimized for text data. While you can paste Base64-encoded file content for decoding, encoding large files should be done with specialized tools or programming libraries that handle binary data more efficiently.
                      </p>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Is this Base64 tool secure and private?</h3>
                      <p className="text-gray-600 text-sm">
                        Yes! All encoding and decoding happens locally in your browser using JavaScript. No data is transmitted to servers or stored remotely, ensuring complete privacy and security for your sensitive information.
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
                <p className="text-gray-600 mb-8">Our Base64 encoder/decoder is built with modern web technologies to ensure maximum compatibility, performance, and reliability across all platforms and browsers while adhering to RFC 4648 standards.</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">Encoding Standards & Features</h3>
                    <div className="space-y-4">
                      <div className="bg-blue-50 rounded-lg p-4">
                        <h4 className="font-semibold text-blue-900 mb-2">RFC 4648 Compliance</h4>
                        <ul className="text-blue-800 text-sm space-y-1">
                          <li>• Standard Base64 alphabet (A-Za-z0-9+/)</li>
                          <li>• URL and filename safe alphabet (A-Za-z0-9-_)</li>
                          <li>• Proper padding handling with equals signs</li>
                          <li>• Strict input validation and error reporting</li>
                        </ul>
                      </div>
                      <div className="bg-green-50 rounded-lg p-4">
                        <h4 className="font-semibold text-green-900 mb-2">Text Encoding Support</h4>
                        <ul className="text-green-800 text-sm space-y-1">
                          <li>• UTF-8 character encoding (full Unicode support)</li>
                          <li>• International characters and symbols</li>
                          <li>• Emoji and special Unicode characters</li>
                          <li>• Proper binary data handling</li>
                        </ul>
                      </div>
                      <div className="bg-purple-50 rounded-lg p-4">
                        <h4 className="font-semibold text-purple-900 mb-2">Advanced Options</h4>
                        <ul className="text-purple-800 text-sm space-y-1">
                          <li>• Configurable line break insertion</li>
                          <li>• Custom prefix and suffix support</li>
                          <li>• Whitespace handling and stripping</li>
                          <li>• Real-time validation and error detection</li>
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
                          <li>• Chrome 90+ (optimal performance)</li>
                          <li>• Firefox 88+ (full feature support)</li>
                          <li>• Safari 14+ (complete compatibility)</li>
                          <li>• Edge 90+ (enhanced user experience)</li>
                        </ul>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h4 className="font-semibold text-gray-900 mb-2">Mobile Devices</h4>
                        <ul className="text-gray-700 text-sm space-y-1">
                          <li>• iOS Safari 14+ (touch-optimized interface)</li>
                          <li>• Android Chrome 90+ (responsive design)</li>
                          <li>• Samsung Internet 13+ (full functionality)</li>
                          <li>• Mobile Firefox 88+ (complete support)</li>
                        </ul>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h4 className="font-semibold text-gray-900 mb-2">Performance Features</h4>
                        <ul className="text-gray-700 text-sm space-y-1">
                          <li>• Client-side processing (no server dependency)</li>
                          <li>• Efficient memory usage for large text</li>
                          <li>• Real-time conversion and validation</li>
                          <li>• Accessible design (WCAG 2.1 compliant)</li>
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

export default Base64EncoderDecoder;
