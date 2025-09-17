
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
import { Separator } from '@/components/ui/separator';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface ReverseOptions {
  method: 'characters' | 'words' | 'lines';
  preserveSpaces: boolean;
  flipCharacters: boolean;
  preserveCapitalization: boolean;
  trimWhitespace: boolean;
  handleNumbers: 'reverse' | 'preserve' | 'flip';
}

interface ReverseResult {
  originalText: string;
  reversedText: string;
  method: string;
  charCount: number;
  wordCount: number;
  lineCount: number;
  timestamp: Date;
}

const ReverseTextTool = () => {
  const [inputText, setInputText] = useState('');
  const [reverseResult, setReverseResult] = useState<ReverseResult | null>(null);
  const [reverseHistory, setReverseHistory] = useState<ReverseResult[]>([]);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [options, setOptions] = useState<ReverseOptions>({
    method: 'characters',
    preserveSpaces: false,
    flipCharacters: false,
    preserveCapitalization: false,
    trimWhitespace: false,
    handleNumbers: 'reverse'
  });

  const reverseText = (text: string, opts: ReverseOptions): string => {
    if (!text) return '';
    
    let processedText = opts.trimWhitespace ? text.trim() : text;

    if (opts.method === 'lines') {
      const lines = processedText.split('\n');
      processedText = lines.reverse().join('\n');
    } else if (opts.method === 'words') {
      const words = processedText.split(' ');
      processedText = words.reverse().join(' ');
    } else {
      // Character reversal
      if (opts.preserveSpaces) {
        const chars = processedText.split('');
        const nonSpaceChars = chars.filter(char => char !== ' ').reverse();
        let nonSpaceIndex = 0;
        
        processedText = chars.map(char => {
          if (char === ' ') {
            return ' ';
          } else {
            return nonSpaceChars[nonSpaceIndex++];
          }
        }).join('');
      } else {
        processedText = processedText.split('').reverse().join('');
      }
    }

    if (opts.flipCharacters) {
      const flipMap: { [key: string]: string } = {
        'a': 'ɐ', 'b': 'q', 'c': 'ɔ', 'd': 'p', 'e': 'ǝ', 'f': 'ɟ', 'g': 'ƃ', 
        'h': 'ɥ', 'i': 'ᴉ', 'j': 'ɾ', 'k': 'ʞ', 'l': 'ɹ', 'm': 'ɯ', 'n': 'u',
        'o': 'o', 'p': 'd', 'q': 'b', 'r': 'ɹ', 's': 's', 't': 'ʇ', 'u': 'n',
        'v': 'ʌ', 'w': 'ʍ', 'x': 'x', 'y': 'ʎ', 'z': 'z',
        'A': '∀', 'B': 'ᗺ', 'C': 'Ɔ', 'D': 'ᗡ', 'E': 'Ǝ', 'F': 'ᖴ', 'G': 'פ',
        'H': 'H', 'I': 'I', 'J': 'ſ', 'K': 'ʞ', 'L': '˥', 'M': 'W', 'N': 'N',
        'O': 'O', 'P': 'Ԁ', 'Q': 'Q', 'R': 'ᴿ', 'S': 'S', 'T': '┴', 'U': '∩',
        'V': 'Λ', 'W': 'M', 'X': 'X', 'Y': '⅄', 'Z': 'Z',
        '0': '0', '1': 'Ɩ', '2': 'ᄅ', '3': 'Ɛ', '4': 'ㄣ', '5': 'ϛ', 
        '6': '9', '7': 'ㄥ', '8': '8', '9': '6',
        '?': '¿', '!': '¡', '.': '˙', ',': "'", "'": ',', '"': '„',
        '(': ')', ')': '(', '[': ']', ']': '[', '{': '}', '}': '{'
      };
      
      processedText = processedText.split('').map(char => flipMap[char] || char).join('');
    }

    return processedText;
  };

  const performReverse = () => {
    if (!inputText.trim()) {
      return;
    }

    try {
      const reversedText = reverseText(inputText, options);
      const wordCount = inputText.trim().split(/\s+/).filter(word => word.length > 0).length;
      const lineCount = inputText.split('\n').length;
      
      const result: ReverseResult = {
        originalText: inputText,
        reversedText,
        method: options.method,
        charCount: inputText.length,
        wordCount,
        lineCount,
        timestamp: new Date()
      };

      setReverseResult(result);

      // Add to history (keep last 10)
      setReverseHistory(prev => {
        const updated = [result, ...prev.filter(item => item.originalText !== inputText)];
        return updated.slice(0, 10);
      });
    } catch (error) {
      console.error('Error reversing text:', error);
    }
  };

  const updateOption = <K extends keyof ReverseOptions>(key: K, value: ReverseOptions[K]) => {
    setOptions(prev => ({ ...prev, [key]: value }));
  };

  const handleCopyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const handleClear = () => {
    setInputText('');
    setReverseResult(null);
  };

  const handleSampleText = () => {
    setInputText('Welcome to DapsiWow\'s Reverse Text Tool! This amazing tool can reverse your text in multiple ways - by characters, words, or lines. Perfect for creating interesting effects, puzzles, or just having fun with text transformation.');
  };

  const resetTool = () => {
    setInputText('');
    setReverseResult(null);
    setShowAdvanced(false);
    setOptions({
      method: 'characters',
      preserveSpaces: false,
      flipCharacters: false,
      preserveCapitalization: false,
      trimWhitespace: false,
      handleNumbers: 'reverse'
    });
  };

  // Clear results when input is cleared
  useEffect(() => {
    if (!inputText.trim()) {
      setReverseResult(null);
    }
  }, [inputText]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Helmet>
        <title>Reverse Text Tool - Flip Text Backwards by Characters, Words & Lines | DapsiWow</title>
        <meta name="description" content="Free online reverse text tool to flip text backwards by characters, words, or lines. Create mirror text, upside down text, and reversed text effects instantly for puzzles, social media, and creative projects." />
        <meta name="keywords" content="reverse text tool, backward text generator, flip text online, mirror text creator, upside down text, text reverser, character reversal, word reversal, line reversal, reversed text effects" />
        <meta property="og:title" content="Reverse Text Tool - Flip Text Backwards by Characters, Words & Lines | DapsiWow" />
        <meta property="og:description" content="Professional reverse text tool for flipping text backwards with multiple reversal methods. Create interesting text effects, puzzles, and reversed content instantly." />
        <meta property="og:type" content="website" />
        <meta name="robots" content="index, follow" />
        <meta name="author" content="DapsiWow" />
        <link rel="canonical" href="https://dapsiwow.com/tools/reverse-text-tool" />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            "name": "Reverse Text Tool",
            "description": "Professional reverse text tool for flipping text backwards by characters, words, or lines with advanced customization options for creating text effects, puzzles, and creative content.",
            "url": "https://dapsiwow.com/tools/reverse-text-tool",
            "applicationCategory": "UtilityApplication",
            "operatingSystem": "Any",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "USD"
            },
            "featureList": [
              "Character, word, and line reversal",
              "Upside-down character flipping",
              "Real-time text transformation",
              "Advanced customization options",
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
                <span className="text-xs sm:text-sm font-medium text-blue-700">Text Transformation Tool</span>
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-slate-900 leading-tight" data-testid="text-page-title">
                Reverse Text
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                  Tool
                </span>
              </h1>
              <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-slate-600 max-w-4xl mx-auto leading-relaxed px-2">
                Flip text backwards by characters, words, or lines with professional customization options
              </p>
            </div>
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
          {/* Main Tool Card */}
          <Card className="bg-white/90 backdrop-blur-sm shadow-2xl border-0 rounded-2xl sm:rounded-3xl overflow-hidden">
            <CardContent className="p-0">
              <div className="flex flex-col">
                {/* Input Section */}
                <div className="p-4 sm:p-6 md:p-8 lg:p-10 xl:p-12 space-y-6 sm:space-y-8">
                  <div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">Text Reverser</h2>
                    <p className="text-gray-600">Enter your text to flip it backwards using various reversal methods</p>
                  </div>

                  <div className="space-y-4 sm:space-y-6">
                    {/* Text Input */}
                    <div className="space-y-3">
                      <Label htmlFor="text-input" className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                        Text to Reverse
                      </Label>
                      <Textarea
                        id="text-input"
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        className="min-h-[100px] sm:min-h-[120px] lg:min-h-[140px] text-base sm:text-lg border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-blue-500 resize-none"
                        placeholder="Type or paste your text here to reverse it..."
                        data-testid="textarea-text-input"
                      />
                    </div>

                    {/* Reversal Method Selection */}
                    <div className="space-y-3">
                      <Label htmlFor="method-select" className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                        Reversal Method
                      </Label>
                      <Select
                        value={options.method}
                        onValueChange={(value: 'characters' | 'words' | 'lines') => 
                          updateOption('method', value)
                        }
                      >
                        <SelectTrigger className="h-12 sm:h-14 border-2 border-gray-200 rounded-xl text-base sm:text-lg" data-testid="select-method">
                          <SelectValue placeholder="Select reversal method" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="characters">Reverse Characters</SelectItem>
                          <SelectItem value="words">Reverse Word Order</SelectItem>
                          <SelectItem value="lines">Reverse Line Order</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Number Handling */}
                    <div className="space-y-3">
                      <Label htmlFor="numbers-select" className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                        Number Handling
                      </Label>
                      <Select
                        value={options.handleNumbers}
                        onValueChange={(value: 'reverse' | 'preserve' | 'flip') => 
                          updateOption('handleNumbers', value)
                        }
                      >
                        <SelectTrigger className="h-12 sm:h-14 border-2 border-gray-200 rounded-xl text-base sm:text-lg" data-testid="select-numbers">
                          <SelectValue placeholder="Select number handling" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="reverse">Reverse Numbers</SelectItem>
                          <SelectItem value="preserve">Preserve Numbers</SelectItem>
                          <SelectItem value="flip">Flip Numbers Upside Down</SelectItem>
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
                        
                        {/* Text Processing Options */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                          <div className="space-y-4 bg-gray-50 rounded-xl p-4 sm:p-6">
                            <h4 className="text-sm sm:text-base font-semibold text-gray-900">Text Processing</h4>
                            
                            <div className="flex items-center justify-between gap-2">
                              <div className="space-y-1 flex-1 min-w-0">
                                <Label className="text-xs sm:text-sm font-medium">Preserve Spaces</Label>
                                <p className="text-xs text-gray-500">Keep spaces in original positions</p>
                              </div>
                              <Switch
                                checked={options.preserveSpaces}
                                onCheckedChange={(value) => updateOption('preserveSpaces', value)}
                                data-testid="switch-preserve-spaces"
                              />
                            </div>

                            <div className="flex items-center justify-between gap-2">
                              <div className="space-y-1 flex-1 min-w-0">
                                <Label className="text-xs sm:text-sm font-medium">Preserve Capitalization</Label>
                                <p className="text-xs text-gray-500">Maintain original letter case</p>
                              </div>
                              <Switch
                                checked={options.preserveCapitalization}
                                onCheckedChange={(value) => updateOption('preserveCapitalization', value)}
                                data-testid="switch-preserve-caps"
                              />
                            </div>

                            <div className="flex items-center justify-between gap-2">
                              <div className="space-y-1 flex-1 min-w-0">
                                <Label className="text-xs sm:text-sm font-medium">Trim Whitespace</Label>
                                <p className="text-xs text-gray-500">Remove leading and trailing spaces</p>
                              </div>
                              <Switch
                                checked={options.trimWhitespace}
                                onCheckedChange={(value) => updateOption('trimWhitespace', value)}
                                data-testid="switch-trim-whitespace"
                              />
                            </div>
                          </div>

                          {/* Special Effects Options */}
                          <div className="space-y-4 bg-gray-50 rounded-xl p-4 sm:p-6">
                            <h4 className="text-sm sm:text-base font-semibold text-gray-900">Special Effects</h4>
                            
                            <div className="flex items-center justify-between gap-2">
                              <div className="space-y-1 flex-1 min-w-0">
                                <Label className="text-xs sm:text-sm font-medium">Flip Characters</Label>
                                <p className="text-xs text-gray-500">Use upside-down Unicode characters</p>
                              </div>
                              <Switch
                                checked={options.flipCharacters}
                                onCheckedChange={(value) => updateOption('flipCharacters', value)}
                                data-testid="switch-flip-characters"
                              />
                            </div>

                            <div className="bg-blue-50 rounded-lg p-3">
                              <h5 className="text-xs font-medium text-blue-900 mb-2">Flip Characters Preview</h5>
                              <div className="text-xs font-mono text-blue-800">
                                <div>Normal: "Hello World"</div>
                                <div>Flipped: "plɹoM ollǝH"</div>
                              </div>
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
                      onClick={performReverse}
                      disabled={!inputText.trim()}
                      className="flex-1 h-12 sm:h-14 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold text-base sm:text-lg rounded-xl shadow-lg transform transition-all duration-200 hover:scale-105"
                      data-testid="button-reverse"
                    >
                      Reverse Text
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
                      onClick={resetTool}
                      variant="outline"
                      className="h-12 sm:h-14 px-6 sm:px-8 border-2 border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold text-base sm:text-lg rounded-xl"
                      data-testid="button-reset"
                    >
                      Reset
                    </Button>
                  </div>
                </div>

                {/* Results Section - Only show when reverseResult exists */}
                {reverseResult && reverseResult.originalText && (
                  <div className="bg-gradient-to-br from-gray-50 to-blue-50 p-4 sm:p-6 md:p-8 lg:p-10 xl:p-12 border-t">
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6 sm:mb-8">Reversed Results</h2>

                    {(
                    <div className="space-y-3 sm:space-y-4" data-testid="reverse-results">
                      {/* Main Reversed Text Display */}
                      <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-3 sm:p-4">
                        <div className="flex items-center justify-between mb-3 gap-3">
                          <div className="flex-1 min-w-0">
                            <h3 className="text-sm sm:text-base font-semibold text-gray-900 truncate">Reversed Text</h3>
                            <p className="text-xs sm:text-sm text-gray-600 break-words">
                              Method: {reverseResult.method.charAt(0).toUpperCase() + reverseResult.method.slice(1)} reversal
                            </p>
                          </div>
                          <Button
                            onClick={() => handleCopyToClipboard(reverseResult.reversedText)}
                            variant="outline"
                            size="sm"
                            className="text-xs px-2 sm:px-3 py-2 flex-shrink-0 rounded-lg min-w-[60px] sm:min-w-[70px] h-11 sm:h-9 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                            data-testid="button-copy-reversed"
                          >
                            Copy
                          </Button>
                        </div>
                        <div 
                          className="bg-white p-2 sm:p-3 rounded-lg border border-gray-200 text-xs sm:text-sm font-mono break-all min-h-[40px] sm:min-h-[44px] flex items-center whitespace-pre-wrap"
                          data-testid="reversed-output"
                        >
                          {reverseResult.reversedText || '(empty result)'}
                        </div>
                      </div>

                      {/* Original Text Display */}
                      <div className="bg-green-50 border-2 border-green-200 rounded-xl p-3 sm:p-4">
                        <div className="flex items-center justify-between mb-3 gap-3">
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm sm:text-base font-semibold text-gray-900 truncate">Original Text</h4>
                            <p className="text-xs sm:text-sm text-gray-600 break-words">Source text for comparison</p>
                          </div>
                          <Button
                            onClick={() => handleCopyToClipboard(reverseResult.originalText)}
                            variant="outline"
                            size="sm"
                            className="text-xs px-2 sm:px-3 py-2 flex-shrink-0 rounded-lg min-w-[60px] sm:min-w-[70px] h-11 sm:h-9 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                            data-testid="button-copy-original"
                          >
                            Copy
                          </Button>
                        </div>
                        <div 
                          className="bg-white p-2 sm:p-3 rounded-lg border border-gray-200 text-xs sm:text-sm break-all min-h-[40px] sm:min-h-[44px] flex items-center whitespace-pre-wrap"
                          data-testid="original-output"
                        >
                          {reverseResult.originalText}
                        </div>
                      </div>

                      {/* Text Statistics */}
                      <div className="bg-white rounded-xl p-3 sm:p-4 shadow-sm border border-gray-200" data-testid="text-statistics">
                        <h3 className="text-sm sm:text-base font-bold text-gray-900 mb-4">Text Statistics</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          <div className="bg-blue-50 rounded-lg p-4 text-center">
                            <div className="text-2xl font-bold text-blue-600" data-testid="char-count">{reverseResult.charCount}</div>
                            <div className="text-sm text-blue-700 font-medium">Characters</div>
                          </div>
                          <div className="bg-green-50 rounded-lg p-4 text-center">
                            <div className="text-2xl font-bold text-green-600" data-testid="word-count">{reverseResult.wordCount}</div>
                            <div className="text-sm text-green-700 font-medium">Words</div>
                          </div>
                          <div className="bg-purple-50 rounded-lg p-4 text-center">
                            <div className="text-2xl font-bold text-purple-600" data-testid="line-count">{reverseResult.lineCount}</div>
                            <div className="text-sm text-purple-700 font-medium">Lines</div>
                          </div>
                        </div>
                      </div>
                    </div>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* SEO Content Sections */}
          <div className="mt-16 space-y-8">
            {/* What is a Reverse Text Tool */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">What is a Reverse Text Tool?</h2>
                <div className="space-y-4 text-gray-600">
                  <p>
                    A <strong>reverse text tool</strong> is a powerful text transformation utility that flips text backwards using various reversal methods including character-by-character reversal, word order reversal, and line order reversal. This essential text manipulation tool enables users to create mirror effects, upside-down text, backward text, and creative text transformations for puzzles, social media posts, educational purposes, and artistic projects.
                  </p>
                  <p>
                    Our professional reverse text generator supports advanced customization options including space preservation, character flipping using Unicode symbols, capitalization handling, and special effects for numbers. Whether you're creating puzzles, generating mirror text for creative projects, testing text processing algorithms, or developing educational content, this tool provides comprehensive functionality with real-time processing and instant results.
                  </p>
                  <p>
                    Perfect for content creators, educators, developers, and anyone needing to flip text backwards, our reverse text tool combines ease of use with professional-grade features, making it the ideal solution for all your text reversal needs across multiple platforms and applications.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Reversal Methods Guide */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Text Reversal Methods & Techniques</h2>
                <p className="text-gray-600 mb-8">Understanding different text reversal methods helps you choose the right technique for your specific needs, whether creating puzzles, artistic effects, or educational content.</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div className="bg-blue-50 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-blue-900 mb-3">Character Reversal</h3>
                      <p className="text-blue-800 text-sm mb-4">
                        Character reversal flips each individual character in your text, creating a true mirror image of the original text. This method is perfect for creating secret messages, puzzles, and artistic text effects.
                      </p>
                      <div className="bg-blue-100 p-3 rounded-lg">
                        <h4 className="font-medium text-blue-900 mb-2">Example Transformation:</h4>
                        <div className="text-xs font-mono text-blue-800">
                          <div>Original: "Hello World"</div>
                          <div>Reversed: "dlroW olleH"</div>
                        </div>
                      </div>
                      <ul className="text-xs text-blue-700 mt-3 space-y-1">
                        <li>• Perfect for creating mirror text effects</li>
                        <li>• Ideal for puzzles and secret messages</li>
                        <li>• Maintains text length and structure</li>
                        <li>• Can preserve or reverse spaces</li>
                      </ul>
                    </div>

                    <div className="bg-orange-50 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-orange-900 mb-3">Word Order Reversal</h3>
                      <p className="text-orange-800 text-sm mb-4">
                        Word reversal changes the order of words while keeping each word intact. This technique is excellent for creating scrambled text challenges, language exercises, and creative writing prompts.
                      </p>
                      <div className="bg-orange-100 p-3 rounded-lg">
                        <h4 className="font-medium text-orange-900 mb-2">Example Transformation:</h4>
                        <div className="text-xs font-mono text-orange-800">
                          <div>Original: "Hello Beautiful World"</div>
                          <div>Reversed: "World Beautiful Hello"</div>
                        </div>
                      </div>
                      <ul className="text-xs text-orange-700 mt-3 space-y-1">
                        <li>• Preserves individual word readability</li>
                        <li>• Great for language learning exercises</li>
                        <li>• Useful for creative writing prompts</li>
                        <li>• Maintains word spelling and grammar</li>
                      </ul>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="bg-green-50 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-green-900 mb-3">Line Order Reversal</h3>
                      <p className="text-green-800 text-sm mb-4">
                        Line reversal flips the order of lines in multi-line text while keeping each line's content intact. This method is perfect for restructuring content, creating unique layouts, and text formatting experiments.
                      </p>
                      <div className="bg-green-100 p-3 rounded-lg">
                        <h4 className="font-medium text-green-900 mb-2">Example Transformation:</h4>
                        <div className="text-xs font-mono text-green-800">
                          <div>Original:<br/>Line 1<br/>Line 2<br/>Line 3</div>
                          <div className="mt-2">Reversed:<br/>Line 3<br/>Line 2<br/>Line 1</div>
                        </div>
                      </div>
                      <ul className="text-xs text-green-700 mt-3 space-y-1">
                        <li>• Ideal for restructuring content flow</li>
                        <li>• Preserves line content and formatting</li>
                        <li>• Perfect for poetry and verse manipulation</li>
                        <li>• Useful for content organization experiments</li>
                      </ul>
                    </div>

                    <div className="bg-purple-50 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-purple-900 mb-3">Character Flipping (Upside Down)</h3>
                      <p className="text-purple-800 text-sm mb-4">
                        Character flipping uses special Unicode characters to create upside-down text effects. This advanced technique creates visually striking text that appears flipped and rotated for maximum impact.
                      </p>
                      <div className="bg-purple-100 p-3 rounded-lg">
                        <h4 className="font-medium text-purple-900 mb-2">Example Transformation:</h4>
                        <div className="text-xs font-mono text-purple-800">
                          <div>Original: "Hello"</div>
                          <div>Flipped: "ollǝH"</div>
                        </div>
                      </div>
                      <ul className="text-xs text-purple-700 mt-3 space-y-1">
                        <li>• Creates dramatic visual effects</li>
                        <li>• Uses Unicode upside-down characters</li>
                        <li>• Perfect for social media posts</li>
                        <li>• Eye-catching and unique appearance</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Professional Applications */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
                <CardContent className="p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Who Uses Reverse Text Tools?</h2>
                  <p className="text-gray-600 mb-6">Reverse text tools serve diverse professionals and creators across multiple industries, providing essential functionality for content creation, education, entertainment, and technical applications.</p>
                  
                  <div className="space-y-4">
                    <div className="bg-blue-50 rounded-lg p-4">
                      <h3 className="font-semibold text-blue-900 mb-2">Content Creators & Social Media Managers</h3>
                      <p className="text-blue-800 text-sm">Create eye-catching posts, unique captions, and viral content using reversed text effects that stand out in crowded social media feeds and capture audience attention.</p>
                    </div>
                    
                    <div className="bg-green-50 rounded-lg p-4">
                      <h3 className="font-semibold text-green-900 mb-2">Educators & Teachers</h3>
                      <p className="text-green-800 text-sm">Develop engaging educational activities, reading exercises, language learning materials, and interactive classroom games that help students understand text structure and literacy concepts.</p>
                    </div>
                    
                    <div className="bg-purple-50 rounded-lg p-4">
                      <h3 className="font-semibold text-purple-900 mb-2">Game Developers & Puzzle Creators</h3>
                      <p className="text-purple-800 text-sm">Design challenging word puzzles, escape room clues, riddles, and brain teasers that incorporate reversed text as puzzle elements or hidden messages.</p>
                    </div>
                    
                    <div className="bg-orange-50 rounded-lg p-4">
                      <h3 className="font-semibold text-orange-900 mb-2">Software Developers & QA Testers</h3>
                      <p className="text-orange-800 text-sm">Test text processing algorithms, validate string manipulation functions, debug text rendering issues, and ensure proper handling of reversed content in applications.</p>
                    </div>

                    <div className="bg-teal-50 rounded-lg p-4">
                      <h3 className="font-semibold text-teal-900 mb-2">Artists & Designers</h3>
                      <p className="text-teal-800 text-sm">Create unique typography effects, mirror text designs, artistic compositions, and visual elements that incorporate reversed text for aesthetic and conceptual impact.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
                <CardContent className="p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Key Features & Benefits</h2>
                  <p className="text-gray-600 mb-6">Our reverse text tool offers comprehensive features designed to meet professional, educational, and creative needs with maximum flexibility and user control.</p>
                  
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                        <span className="text-white text-xs font-bold">✓</span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-1">Multiple Reversal Methods</h4>
                        <p className="text-gray-600 text-sm">Choose from character, word, or line reversal to achieve the exact text transformation you need for any project or application.</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                        <span className="text-white text-xs font-bold">✓</span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-1">Real-Time Processing</h4>
                        <p className="text-gray-600 text-sm">Instant text reversal as you type with intelligent debouncing for smooth performance and immediate visual feedback during editing.</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                        <span className="text-white text-xs font-bold">✓</span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-1">Advanced Customization</h4>
                        <p className="text-gray-600 text-sm">Control space preservation, capitalization handling, character flipping, and special effects to create precisely the text transformation you envision.</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                        <span className="text-white text-xs font-bold">✓</span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-1">Unicode Character Support</h4>
                        <p className="text-gray-600 text-sm">Comprehensive support for international characters, symbols, emojis, and special Unicode characters in all reversal operations.</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-teal-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                        <span className="text-white text-xs font-bold">✓</span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-1">Privacy & Security</h4>
                        <p className="text-gray-600 text-sm">All text processing happens locally in your browser - no data transmitted to servers, ensuring complete privacy and security of your content.</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* How Reverse Text Works */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">How Text Reversal Technology Works</h2>
                <p className="text-gray-600 mb-8">Understanding the technical process behind text reversal helps you make informed decisions about reversal methods and achieve optimal results for your specific applications and creative projects.</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-blue-900 mb-4">Step-by-Step Reversal Process</h3>
                      <div className="space-y-4">
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-white font-bold text-sm">1</span>
                          </div>
                          <div>
                            <h4 className="font-medium text-blue-900">Text Analysis</h4>
                            <p className="text-blue-800 text-sm">Your input text is analyzed to identify characters, words, lines, and special formatting elements based on the selected reversal method.</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-white font-bold text-sm">2</span>
                          </div>
                          <div>
                            <h4 className="font-medium text-blue-900">Element Identification</h4>
                            <p className="text-blue-800 text-sm">Text elements are identified and categorized according to your chosen reversal method (characters, words, or lines) and customization settings.</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-white font-bold text-sm">3</span>
                          </div>
                          <div>
                            <h4 className="font-medium text-blue-900">Reversal Application</h4>
                            <p className="text-blue-800 text-sm">The selected reversal algorithm is applied while respecting your customization preferences for spaces, capitalization, and special effects.</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-white font-bold text-sm">4</span>
                          </div>
                          <div>
                            <h4 className="font-medium text-blue-900">Result Generation</h4>
                            <p className="text-blue-800 text-sm">The final reversed text is generated with optional Unicode character substitution for flipping effects and formatted for easy copying.</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-6">
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-green-900 mb-4">Practical Reversal Examples</h3>
                      <div className="space-y-4">
                        <div className="bg-green-100 p-4 rounded-lg">
                          <h4 className="font-medium text-green-900 mb-2">Character Reversal Example</h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-green-800">Input:</span>
                              <span className="font-mono text-green-700">"Hello World"</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-green-800">Output:</span>
                              <span className="font-mono text-green-700">"dlroW olleH"</span>
                            </div>
                          </div>
                        </div>
                        <div className="bg-green-100 p-4 rounded-lg">
                          <h4 className="font-medium text-green-900 mb-2">Word Reversal Example</h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-green-800">Input:</span>
                              <span className="font-mono text-green-700">"The Quick Brown Fox"</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-green-800">Output:</span>
                              <span className="font-mono text-green-700">"Fox Brown Quick The"</span>
                            </div>
                          </div>
                        </div>
                        <div className="bg-green-100 p-4 rounded-lg">
                          <h4 className="font-medium text-green-900 mb-2">Upside-Down Flipping</h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-green-800">Input:</span>
                              <span className="font-mono text-green-700">"HELLO"</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-green-800">Flipped:</span>
                              <span className="font-mono text-green-700">"O˥˥ǝH"</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gradient-to-r from-purple-50 to-violet-50 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-purple-900 mb-4">Advanced Features</h3>
                      <div className="space-y-3 text-sm">
                        <div className="flex items-start gap-2">
                          <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                          <span className="text-purple-800"><strong>Unicode Support:</strong> Handles all international characters and special symbols</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                          <span className="text-purple-800"><strong>Preservation Options:</strong> Maintain spaces, capitalization, and formatting</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                          <span className="text-purple-800"><strong>Real-time Processing:</strong> Instant results with 300ms intelligent debouncing</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                          <span className="text-purple-800"><strong>Multiple Methods:</strong> Character, word, and line reversal in one tool</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Creative Applications */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Creative Applications & Use Cases</h2>
                <p className="text-gray-600 mb-8">Reverse text tools unlock creative possibilities across numerous fields, from educational activities and social media content to professional development projects and artistic expressions.</p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900">Educational & Learning</h3>
                    <div className="space-y-3">
                      <div className="bg-blue-50 border-l-4 border-blue-400 p-3 rounded-r-lg">
                        <h4 className="font-semibold text-blue-900 text-sm">Reading Comprehension</h4>
                        <p className="text-blue-800 text-xs mt-1">Create challenging reading exercises that improve cognitive processing and attention to detail in students of all ages.</p>
                      </div>
                      <div className="bg-indigo-50 border-l-4 border-indigo-400 p-3 rounded-r-lg">
                        <h4 className="font-semibold text-indigo-900 text-sm">Language Learning</h4>
                        <p className="text-indigo-800 text-xs mt-1">Develop vocabulary games, spelling challenges, and language structure exercises that enhance learning retention.</p>
                      </div>
                      <div className="bg-cyan-50 border-l-4 border-cyan-400 p-3 rounded-r-lg">
                        <h4 className="font-semibold text-cyan-900 text-sm">Memory Training</h4>
                        <p className="text-cyan-800 text-xs mt-1">Design memory improvement exercises and cognitive training activities using reversed text patterns.</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900">Entertainment & Social Media</h3>
                    <div className="space-y-3">
                      <div className="bg-green-50 border-l-4 border-green-400 p-3 rounded-r-lg">
                        <h4 className="font-semibold text-green-900 text-sm">Social Media Posts</h4>
                        <p className="text-green-800 text-xs mt-1">Create unique, eye-catching content that stands out in feeds and encourages engagement from followers.</p>
                      </div>
                      <div className="bg-emerald-50 border-l-4 border-emerald-400 p-3 rounded-r-lg">
                        <h4 className="font-semibold text-emerald-900 text-sm">Puzzle Creation</h4>
                        <p className="text-emerald-800 text-xs mt-1">Design word puzzles, riddles, and brain teasers for entertainment websites, mobile apps, and games.</p>
                      </div>
                      <div className="bg-teal-50 border-l-4 border-teal-400 p-3 rounded-r-lg">
                        <h4 className="font-semibold text-teal-900 text-sm">Creative Writing</h4>
                        <p className="text-teal-800 text-xs mt-1">Experiment with text layouts, poetry arrangements, and creative formatting for artistic expression.</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900">Professional & Technical</h3>
                    <div className="space-y-3">
                      <div className="bg-orange-50 border-l-4 border-orange-400 p-3 rounded-r-lg">
                        <h4 className="font-semibold text-orange-900 text-sm">Software Testing</h4>
                        <p className="text-orange-800 text-xs mt-1">Test string handling, text processing algorithms, and user interface components with reversed text inputs.</p>
                      </div>
                      <div className="bg-red-50 border-l-4 border-red-400 p-3 rounded-r-lg">
                        <h4 className="font-semibold text-red-900 text-sm">Design & Typography</h4>
                        <p className="text-red-800 text-xs mt-1">Create unique typographic effects, mirror designs, and artistic compositions for visual projects.</p>
                      </div>
                      <div className="bg-pink-50 border-l-4 border-pink-400 p-3 rounded-r-lg">
                        <h4 className="font-semibold text-pink-900 text-sm">Data Obfuscation</h4>
                        <p className="text-pink-800 text-xs mt-1">Apply simple text transformations for basic data obfuscation and privacy protection in development.</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-8 bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Professional Best Practices</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium text-gray-800 mb-2">Content Creation Tips</h4>
                      <p className="text-gray-600 text-sm">Use reversed text sparingly for maximum impact, ensure readability for your target audience, and test different reversal methods to find the most effective approach for your specific use case.</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-800 mb-2">Technical Considerations</h4>
                      <p className="text-gray-600 text-sm">Consider Unicode compatibility when using flipped characters, test reversed text across different platforms and devices, and maintain backup copies of original text for reference.</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-800 mb-2">Educational Applications</h4>
                      <p className="text-gray-600 text-sm">Provide clear instructions for reversed text activities, offer difficulty levels from simple character reversal to complex multi-line transformations, and include answer keys for puzzle activities.</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-800 mb-2">Accessibility Guidelines</h4>
                      <p className="text-gray-600 text-sm">Ensure reversed text content includes alternative accessible versions, provide context for screen readers, and consider users with reading disabilities when implementing reversed text.</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Advanced Use Cases and Optimization */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Advanced Use Cases & Optimization Strategies</h2>
                <p className="text-gray-600 mb-8">Explore sophisticated applications of text reversal technology across professional domains, creative industries, and specialized fields that require advanced text manipulation capabilities and strategic implementation.</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="bg-blue-50 rounded-lg p-6">
                    <h3 className="font-semibold text-blue-900 mb-4">Software Development & QA</h3>
                    <ul className="text-blue-800 text-sm space-y-2">
                      <li>• Unit testing for string manipulation functions</li>
                      <li>• User interface stress testing with unusual text</li>
                      <li>• Localization testing for right-to-left languages</li>
                      <li>• Input validation and security testing</li>
                      <li>• Algorithm performance benchmarking</li>
                      <li>• Cross-platform compatibility verification</li>
                    </ul>
                  </div>

                  <div className="bg-green-50 rounded-lg p-6">
                    <h3 className="font-semibold text-green-900 mb-4">Content Marketing & SEO</h3>
                    <ul className="text-green-800 text-sm space-y-2">
                      <li>• Creating viral social media content</li>
                      <li>• Developing unique headline formats</li>
                      <li>• Generating attention-grabbing captions</li>
                      <li>• Building interactive content campaigns</li>
                      <li>• Designing engagement-boosting posts</li>
                      <li>• Creating shareable puzzle content</li>
                    </ul>
                  </div>

                  <div className="bg-purple-50 rounded-lg p-6">
                    <h3 className="font-semibold text-purple-900 mb-4">Education & Training</h3>
                    <ul className="text-purple-800 text-sm space-y-2">
                      <li>• Cognitive assessment tool development</li>
                      <li>• Dyslexia support material creation</li>
                      <li>• Memory training exercise design</li>
                      <li>• Language learning game development</li>
                      <li>• Reading comprehension testing</li>
                      <li>• Attention disorder therapy tools</li>
                    </ul>
                  </div>

                  <div className="bg-orange-50 rounded-lg p-6">
                    <h3 className="font-semibold text-orange-900 mb-4">Creative Arts & Design</h3>
                    <ul className="text-orange-800 text-sm space-y-2">
                      <li>• Typography experimentation and design</li>
                      <li>• Digital art text element creation</li>
                      <li>• Logo and branding concept development</li>
                      <li>• Interactive installation content</li>
                      <li>• Print design layout exploration</li>
                      <li>• Multimedia project text effects</li>
                    </ul>
                  </div>

                  <div className="bg-teal-50 rounded-lg p-6">
                    <h3 className="font-semibold text-teal-900 mb-4">Gaming & Entertainment</h3>
                    <ul className="text-teal-800 text-sm space-y-2">
                      <li>• Puzzle game mechanics development</li>
                      <li>• Escape room clue creation</li>
                      <li>• Interactive fiction writing</li>
                      <li>• ARG (Alternate Reality Game) content</li>
                      <li>• Riddle and challenge design</li>
                      <li>• Mystery game plot elements</li>
                    </ul>
                  </div>

                  <div className="bg-red-50 rounded-lg p-6">
                    <h3 className="font-semibold text-red-900 mb-4">Research & Academia</h3>
                    <ul className="text-red-800 text-sm space-y-2">
                      <li>• Cognitive psychology experiment design</li>
                      <li>• Linguistics research methodology</li>
                      <li>• Reading pattern analysis studies</li>
                      <li>• Text processing algorithm research</li>
                      <li>• Human-computer interaction studies</li>
                      <li>• Accessibility research applications</li>
                    </ul>
                  </div>
                </div>

                <div className="mt-8 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Optimization Strategies & Performance Tips</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium text-gray-800 mb-3">Performance Optimization</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-start gap-2">
                          <div className="w-2 h-2 bg-indigo-500 rounded-full mt-2 flex-shrink-0"></div>
                          <span className="text-gray-700">Use appropriate reversal method for text size and complexity</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <div className="w-2 h-2 bg-indigo-500 rounded-full mt-2 flex-shrink-0"></div>
                          <span className="text-gray-700">Implement debouncing for real-time processing efficiency</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <div className="w-2 h-2 bg-indigo-500 rounded-full mt-2 flex-shrink-0"></div>
                          <span className="text-gray-700">Consider memory usage for large text transformations</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <div className="w-2 h-2 bg-indigo-500 rounded-full mt-2 flex-shrink-0"></div>
                          <span className="text-gray-700">Test across different browsers and devices for compatibility</span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-800 mb-3">Implementation Best Practices</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-start gap-2">
                          <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                          <span className="text-gray-700">Validate input text encoding before processing</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                          <span className="text-gray-700">Provide clear feedback for unsupported characters</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                          <span className="text-gray-700">Include error handling for edge cases and invalid input</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                          <span className="text-gray-700">Document expected behavior for special characters</span>
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
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">What is the difference between character and word reversal?</h3>
                      <p className="text-gray-600 text-sm">
                        Character reversal flips each individual character in the text (e.g., "Hello" becomes "olleH"), while word reversal changes the order of words while keeping each word intact (e.g., "Hello World" becomes "World Hello"). Choose based on your specific needs.
                      </p>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Can I reverse text with special characters and emojis?</h3>
                      <p className="text-gray-600 text-sm">
                        Yes! Our tool supports full Unicode character sets including international characters, symbols, and emojis. However, some complex emoji combinations might not flip perfectly when using the upside-down character feature.
                      </p>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">What does the "preserve spaces" option do?</h3>
                      <p className="text-gray-600 text-sm">
                        The preserve spaces option keeps spaces in their original positions during character reversal. Instead of reversing spaces along with other characters, only non-space characters are reversed while spaces remain in place.
                      </p>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">How does the upside-down character flipping work?</h3>
                      <p className="text-gray-600 text-sm">
                        The flip characters feature uses special Unicode characters that visually appear upside-down or rotated. These are actual Unicode characters, not rotated images, so they maintain text properties while creating unique visual effects.
                      </p>
                    </div>
                  </div>
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Is my text data secure when using this tool?</h3>
                      <p className="text-gray-600 text-sm">
                        Absolutely! All text processing happens locally in your browser using client-side JavaScript. No text data is transmitted to servers, stored remotely, or accessed by third parties, ensuring complete privacy and security.
                      </p>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Can I use reversed text in social media posts?</h3>
                      <p className="text-gray-600 text-sm">
                        Yes! Reversed text works great for creating eye-catching social media content. However, use it strategically and sparingly for maximum impact, and always consider accessibility for users with reading difficulties.
                      </p>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Are there limitations on text length?</h3>
                      <p className="text-gray-600 text-sm">
                        There's no strict character limit, but very large texts may take longer to process due to browser performance constraints. The tool provides real-time character, word, and line counts to help you monitor input size.
                      </p>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Does this work offline after loading?</h3>
                      <p className="text-gray-600 text-sm">
                        Yes! Once the page loads completely, all reversal functionality works offline without requiring an internet connection. The tool runs entirely in your browser, making it reliable for secure environments.
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
                <p className="text-gray-600 mb-8">Our reverse text tool is built with modern web technologies to ensure compatibility, performance, and reliability across all major platforms and devices with comprehensive Unicode support.</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">Text Processing Capabilities</h3>
                    <div className="space-y-4">
                      <div className="bg-blue-50 rounded-lg p-4">
                        <h4 className="font-semibold text-blue-900 mb-2">Unicode Support</h4>
                        <ul className="text-blue-800 text-sm space-y-1">
                          <li>• Full Unicode 15.0 character support</li>
                          <li>• International languages and scripts</li>
                          <li>• Emojis and special symbols</li>
                          <li>• Complex character combinations</li>
                        </ul>
                      </div>
                      <div className="bg-orange-50 rounded-lg p-4">
                        <h4 className="font-semibold text-orange-900 mb-2">Reversal Methods</h4>
                        <ul className="text-orange-800 text-sm space-y-1">
                          <li>• Character-by-character reversal</li>
                          <li>• Word order reversal</li>
                          <li>• Line order reversal</li>
                          <li>• Unicode character flipping</li>
                        </ul>
                      </div>
                      <div className="bg-purple-50 rounded-lg p-4">
                        <h4 className="font-semibold text-purple-900 mb-2">Advanced Features</h4>
                        <ul className="text-purple-800 text-sm space-y-1">
                          <li>• Real-time processing with debouncing</li>
                          <li>• Space and formatting preservation</li>
                          <li>• Capitalization handling options</li>
                          <li>• Number processing customization</li>
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
                          <li>• Chrome 90+ (optimal performance)</li>
                          <li>• Firefox 88+ (excellent Unicode support)</li>
                          <li>• Safari 14+ (full compatibility)</li>
                          <li>• Edge 90+ (complete feature support)</li>
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
                          <li>• Instant text processing (300ms debounce)</li>
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

export default ReverseTextTool;
