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
import { ChevronDown, Copy, RotateCcw, ArrowRightLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import ToolHeroSection from '@/components/ToolHeroSection';
import ToolRecommendations from '@/components/ToolRecommendations';
import { tools } from '@/data/tools';

interface ConversionOptions {
  mode: 'encode' | 'decode';
  lineBreakEvery: number;
  addLineBreaks: boolean;
  urlSafe: boolean;
  validateInput: boolean;
  addPadding: boolean;
  stripWhitespace: boolean;
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
  const [options, setOptions] = useState<ConversionOptions>({
    mode: 'encode',
    lineBreakEvery: 76,
    addLineBreaks: false,
    urlSafe: false,
    validateInput: true,
    addPadding: true,
    stripWhitespace: true
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

      const result: ConversionResult = {
        originalText: inputText,
        convertedText,
        mode: options.mode,
        charCount: inputText.length,
        byteCount: new Blob([inputText]).size,
        isValid,
        errorMessage,
        timestamp: new Date()
      };

      setConversionResult(result);

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
    }
  };

  // Real-time conversion
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      convertText();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [inputText, options]);

  const handleClear = () => {
    setInputText('');
    setConversionResult(null);
  };

  const handleCopyResult = async () => {
    if (conversionResult?.convertedText) {
      try {
        await navigator.clipboard.writeText(conversionResult.convertedText);
        toast({
          title: "Copied to clipboard",
          description: `${options.mode === 'encode' ? 'Encoded' : 'Decoded'} text has been copied to clipboard`,
        });
      } catch (err) {
        toast({
          title: "Copy failed",
          description: "Unable to copy to clipboard",
          variant: "destructive",
        });
      }
    }
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

  const loadFromHistory = (historyItem: ConversionResult) => {
    setInputText(historyItem.originalText);
    setOptions(prev => ({ ...prev, mode: historyItem.mode }));
  };

  const clearHistory = () => {
    setConversionHistory([]);
    toast({
      title: "History cleared",
      description: "All conversion history has been removed",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      <Helmet>
        <title>Base64 Encoder/Decoder - Free Online Base64 Convert Tool | DapsiWow</title>
        <meta name="description" content="Free online Base64 encoder and decoder tool. Convert text to Base64 and decode Base64 to text with advanced options including URL-safe encoding, line breaks, and validation. Perfect for developers and data processing." />
        <meta name="keywords" content="base64 encoder, base64 decoder, base64 converter, encode decode, url safe base64, text converter, developer tools, data encoding" />
        <meta property="og:title" content="Base64 Encoder/Decoder - Free Online Tool" />
        <meta property="og:description" content="Convert text to Base64 and decode Base64 to text with advanced options. Free, fast, and secure." />
        <meta property="og:type" content="website" />
        <link rel="canonical" href="https://dapsiwow.com/tools/base64-encoder-decoder" />
      </Helmet>

      <Header />

      <ToolHeroSection
        title="Base64 Encoder/Decoder"
        description="Convert text to Base64 and decode Base64 to text with advanced options including URL-safe encoding, line breaks, and validation."
      />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Tool */}
          <div className="lg:col-span-2 space-y-8">
            <Card data-testid="card-base64-converter">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-neutral-800 dark:text-neutral-100">
                    Base64 {options.mode === 'encode' ? 'Encoder' : 'Decoder'}
                  </h2>
                  <Button
                    onClick={handleSwapMode}
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2"
                    data-testid="button-swap-mode"
                  >
                    <ArrowRightLeft size={16} />
                    Switch to {options.mode === 'encode' ? 'Decode' : 'Encode'}
                  </Button>
                </div>

                <div className="space-y-6">
                  <div>
                    <Label htmlFor="input-text" className="text-sm font-medium text-neutral-700 dark:text-neutral-200 mb-2 block">
                      {options.mode === 'encode' ? 'Text to Encode' : 'Base64 to Decode'}
                    </Label>
                    <Textarea
                      id="input-text"
                      placeholder={options.mode === 'encode' ? 'Enter text to encode to Base64...' : 'Enter Base64 string to decode...'}
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      className="min-h-[120px] text-sm"
                      data-testid="textarea-input"
                    />
                    <div className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                      Characters: {inputText.length}
                    </div>
                  </div>

                  {/* Advanced Options */}
                  <Collapsible open={showAdvanced} onOpenChange={setShowAdvanced}>
                    <CollapsibleTrigger asChild>
                      <Button variant="ghost" className="w-full justify-between" data-testid="button-toggle-advanced">
                        Advanced Options
                        <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${showAdvanced ? 'transform rotate-180' : ''}`} />
                      </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="space-y-4 pt-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="url-safe" className="text-sm">URL-Safe Base64</Label>
                          <Switch
                            id="url-safe"
                            checked={options.urlSafe}
                            onCheckedChange={(checked) => setOptions(prev => ({ ...prev, urlSafe: checked }))}
                            data-testid="switch-url-safe"
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <Label htmlFor="add-padding" className="text-sm">Add Padding</Label>
                          <Switch
                            id="add-padding"
                            checked={options.addPadding}
                            onCheckedChange={(checked) => setOptions(prev => ({ ...prev, addPadding: checked }))}
                            data-testid="switch-add-padding"
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <Label htmlFor="add-line-breaks" className="text-sm">Add Line Breaks</Label>
                          <Switch
                            id="add-line-breaks"
                            checked={options.addLineBreaks}
                            onCheckedChange={(checked) => setOptions(prev => ({ ...prev, addLineBreaks: checked }))}
                            data-testid="switch-line-breaks"
                          />
                        </div>

                        {options.mode === 'decode' && (
                          <div className="flex items-center justify-between">
                            <Label htmlFor="validate-input" className="text-sm">Validate Input</Label>
                            <Switch
                              id="validate-input"
                              checked={options.validateInput}
                              onCheckedChange={(checked) => setOptions(prev => ({ ...prev, validateInput: checked }))}
                              data-testid="switch-validate"
                            />
                          </div>
                        )}

                        <div className="flex items-center justify-between">
                          <Label htmlFor="strip-whitespace" className="text-sm">Strip Whitespace</Label>
                          <Switch
                            id="strip-whitespace"
                            checked={options.stripWhitespace}
                            onCheckedChange={(checked) => setOptions(prev => ({ ...prev, stripWhitespace: checked }))}
                            data-testid="switch-strip-whitespace"
                          />
                        </div>

                        {options.addLineBreaks && options.mode === 'encode' && (
                          <div>
                            <Label htmlFor="line-break-length" className="text-sm mb-2 block">Line Break Every</Label>
                            <Input
                              id="line-break-length"
                              type="number"
                              min="1"
                              max="200"
                              value={options.lineBreakEvery}
                              onChange={(e) => setOptions(prev => ({ 
                                ...prev, 
                                lineBreakEvery: Math.max(1, parseInt(e.target.value) || 76) 
                              }))}
                              className="w-full"
                              data-testid="input-line-break-length"
                            />
                          </div>
                        )}
                      </div>
                    </CollapsibleContent>
                  </Collapsible>

                  <div className="flex flex-wrap gap-2">
                    <Button
                      onClick={handleClear}
                      variant="outline"
                      className="flex items-center gap-2"
                      data-testid="button-clear"
                    >
                      <RotateCcw size={16} />
                      Clear
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Results */}
            {conversionResult && (
              <Card data-testid="card-conversion-result">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-semibold text-neutral-800 dark:text-neutral-100">
                      {options.mode === 'encode' ? 'Encoded Result' : 'Decoded Result'}
                    </h3>
                    {conversionResult.isValid && (
                      <Button
                        onClick={handleCopyResult}
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-2"
                        data-testid="button-copy-result"
                      >
                        <Copy size={16} />
                        Copy
                      </Button>
                    )}
                  </div>

                  {conversionResult.isValid ? (
                    <>
                      <Textarea
                        value={conversionResult.convertedText}
                        readOnly
                        className="min-h-[120px] text-sm font-mono bg-neutral-50 dark:bg-neutral-800"
                        data-testid="textarea-result"
                      />
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 text-sm">
                        <div>
                          <span className="text-neutral-500 dark:text-neutral-400">Input Length:</span>
                          <p className="font-medium" data-testid="text-input-length">{conversionResult.charCount}</p>
                        </div>
                        <div>
                          <span className="text-neutral-500 dark:text-neutral-400">Output Length:</span>
                          <p className="font-medium" data-testid="text-output-length">{conversionResult.convertedText.length}</p>
                        </div>
                        <div>
                          <span className="text-neutral-500 dark:text-neutral-400">Mode:</span>
                          <p className="font-medium capitalize" data-testid="text-conversion-mode">{conversionResult.mode}</p>
                        </div>
                        <div>
                          <span className="text-neutral-500 dark:text-neutral-400">Byte Size:</span>
                          <p className="font-medium" data-testid="text-byte-size">{conversionResult.byteCount} bytes</p>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-8">
                      <div className="text-red-500 dark:text-red-400 text-sm font-medium" data-testid="text-error-message">
                        {conversionResult.errorMessage}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* History */}
            {conversionHistory.length > 0 && (
              <Card data-testid="card-conversion-history">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-neutral-800 dark:text-neutral-100">
                      Conversion History
                    </h3>
                    <Button
                      onClick={clearHistory}
                      variant="ghost"
                      size="sm"
                      className="text-neutral-500 hover:text-neutral-700"
                      data-testid="button-clear-history"
                    >
                      Clear
                    </Button>
                  </div>
                  <div className="space-y-3">
                    {conversionHistory.map((item, index) => (
                      <div
                        key={index}
                        className="p-3 bg-neutral-50 dark:bg-neutral-800 rounded-lg cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
                        onClick={() => loadFromHistory(item)}
                        data-testid={`history-item-${index}`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-medium text-blue-600 dark:text-blue-400 uppercase">
                            {item.mode}
                          </span>
                          <span className="text-xs text-neutral-500">
                            {item.timestamp.toLocaleTimeString()}
                          </span>
                        </div>
                        <div className="text-sm text-neutral-600 dark:text-neutral-300 font-mono truncate">
                          {item.originalText.substring(0, 50)}
                          {item.originalText.length > 50 && '...'}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* How to Use */}
            <Card data-testid="card-how-to-use">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-neutral-800 dark:text-neutral-100 mb-4">
                  How to Use
                </h3>
                <div className="space-y-3 text-sm text-neutral-600 dark:text-neutral-300">
                  <div>
                    <strong>Encoding:</strong> Enter plain text to convert it to Base64 format
                  </div>
                  <div>
                    <strong>Decoding:</strong> Enter Base64 string to convert it back to plain text
                  </div>
                  <div>
                    <strong>URL-Safe:</strong> Generates Base64 that's safe for URLs (replaces + and / with - and _)
                  </div>
                  <div>
                    <strong>Line Breaks:</strong> Adds line breaks every specified number of characters for better readability
                  </div>
                  <div>
                    <strong>Validation:</strong> Checks if the input is valid Base64 before decoding
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Info Card */}
            <Card data-testid="card-base64-info">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-neutral-800 dark:text-neutral-100 mb-4">
                  About Base64
                </h3>
                <div className="space-y-3 text-sm text-neutral-600 dark:text-neutral-300">
                  <p>
                    Base64 is a binary-to-text encoding scheme that represents binary data in ASCII format by translating it into a radix-64 representation.
                  </p>
                  <p>
                    It's commonly used in email via MIME, storing complex data in XML or JSON, and in URLs where binary data needs to be transmitted in text format.
                  </p>
                  <p>
                    <strong>Use Cases:</strong> API authentication tokens, data URLs, email attachments, web development, and data serialization.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <ToolRecommendations currentTool={tools.find(t => t.id === 'base64-encoder-decoder')!} />
      <Footer />
    </div>
  );
};

export default Base64EncoderDecoder;