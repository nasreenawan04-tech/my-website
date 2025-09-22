
import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface CleaningOptions {
  removeExtraSpaces: boolean;
  removeExtraLineBreaks: boolean;
  trimLines: boolean;
  removeEmptyLines: boolean;
  normalizeLineBreaks: boolean;
  removeSpecialChars: boolean;
  convertToLowercase: boolean;
  convertToUppercase: boolean;
  removeNumbers: boolean;
  removePunctuation: boolean;
}

interface CleaningResult {
  originalText: string;
  cleanedText: string;
  charCount: number;
  originalCharCount: number;
  charsSaved: number;
  wordCount: number;
  lineCount: number;
  timestamp: Date;
}

const TextCleanerFormatter = () => {
  const [inputText, setInputText] = useState('');
  const [cleaningResult, setCleaningResult] = useState<CleaningResult | null>(null);
  const [cleaningHistory, setCleaningHistory] = useState<CleaningResult[]>([]);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [options, setOptions] = useState<CleaningOptions>({
    removeExtraSpaces: true,
    removeExtraLineBreaks: true,
    trimLines: true,
    removeEmptyLines: false,
    normalizeLineBreaks: true,
    removeSpecialChars: false,
    convertToLowercase: false,
    convertToUppercase: false,
    removeNumbers: false,
    removePunctuation: false,
  });

  const cleanText = (text: string, cleaningOptions: CleaningOptions): string => {
    if (!text) return '';
    
    let cleaned = text;

    // Remove extra spaces
    if (cleaningOptions.removeExtraSpaces) {
      cleaned = cleaned.replace(/[ \t]+/g, ' ');
    }

    // Trim lines
    if (cleaningOptions.trimLines) {
      cleaned = cleaned.split('\n').map(line => line.trim()).join('\n');
    }

    // Remove empty lines
    if (cleaningOptions.removeEmptyLines) {
      cleaned = cleaned.split('\n').filter(line => line.trim() !== '').join('\n');
    }

    // Remove extra line breaks
    if (cleaningOptions.removeExtraLineBreaks) {
      cleaned = cleaned.replace(/\n{3,}/g, '\n\n');
    }

    // Normalize line breaks
    if (cleaningOptions.normalizeLineBreaks) {
      cleaned = cleaned.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    }

    // Remove special characters
    if (cleaningOptions.removeSpecialChars) {
      cleaned = cleaned.replace(/[^\w\s\n\r]/g, '');
    }

    // Remove numbers
    if (cleaningOptions.removeNumbers) {
      cleaned = cleaned.replace(/\d/g, '');
    }

    // Remove punctuation
    if (cleaningOptions.removePunctuation) {
      cleaned = cleaned.replace(/[^\w\s\n\r]/g, '');
    }

    // Convert case
    if (cleaningOptions.convertToLowercase) {
      cleaned = cleaned.toLowerCase();
    } else if (cleaningOptions.convertToUppercase) {
      cleaned = cleaned.toUpperCase();
    }

    return cleaned;
  };

  const performCleaning = () => {
    if (!inputText.trim()) {
      return;
    }

    try {
      const cleanedText = cleanText(inputText, options);
      const wordCount = cleanedText.trim().split(/\s+/).filter(word => word.length > 0).length;
      const lineCount = cleanedText.split('\n').length;
      const charsSaved = inputText.length - cleanedText.length;
      
      const result: CleaningResult = {
        originalText: inputText,
        cleanedText,
        charCount: cleanedText.length,
        originalCharCount: inputText.length,
        charsSaved,
        wordCount,
        lineCount,
        timestamp: new Date()
      };

      setCleaningResult(result);

      // Add to history (keep last 10)
      setCleaningHistory(prev => {
        const updated = [result, ...prev.filter(item => item.originalText !== inputText)];
        return updated.slice(0, 10);
      });
    } catch (error) {
      console.error('Error cleaning text:', error);
    }
  };

  const updateOption = <K extends keyof CleaningOptions>(key: K, value: CleaningOptions[K]) => {
    setOptions(prev => {
      const newOptions = { ...prev, [key]: value };
      
      // Ensure only one case conversion is selected
      if (key === 'convertToLowercase' && value) {
        newOptions.convertToUppercase = false;
      } else if (key === 'convertToUppercase' && value) {
        newOptions.convertToLowercase = false;
      }
      
      return newOptions;
    });
  };

  const handleCopyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const handleClear = () => {
    setInputText('');
    setCleaningResult(null);
  };

  const handleSampleText = () => {
    setInputText('Welcome    to   DapsiWow\'s     Text   Cleaner!\n\n\n\nThis    amazing   tool   can   clean   up   messy   text   with   extra   spaces,\n\n\n\nunnecessary    line   breaks,   and   other   formatting   issues.\n\n\n\n\n\nPerfect    for   cleaning   text   copied   from   PDFs,   emails,   and   websites.');
  };

  const resetTool = () => {
    setInputText('');
    setCleaningResult(null);
    setShowAdvanced(false);
    setOptions({
      removeExtraSpaces: true,
      removeExtraLineBreaks: true,
      trimLines: true,
      removeEmptyLines: false,
      normalizeLineBreaks: true,
      removeSpecialChars: false,
      convertToLowercase: false,
      convertToUppercase: false,
      removeNumbers: false,
      removePunctuation: false,
    });
  };

  const loadPreset = (presetName: string) => {
    const presets = {
      basic: {
        removeExtraSpaces: true,
        removeExtraLineBreaks: true,
        trimLines: true,
        removeEmptyLines: false,
        normalizeLineBreaks: true,
        removeSpecialChars: false,
        convertToLowercase: false,
        convertToUppercase: false,
        removeNumbers: false,
        removePunctuation: false,
      },
      aggressive: {
        removeExtraSpaces: true,
        removeExtraLineBreaks: true,
        trimLines: true,
        removeEmptyLines: true,
        normalizeLineBreaks: true,
        removeSpecialChars: true,
        convertToLowercase: false,
        convertToUppercase: false,
        removeNumbers: false,
        removePunctuation: true,
      },
      minimal: {
        removeExtraSpaces: true,
        removeExtraLineBreaks: false,
        trimLines: false,
        removeEmptyLines: false,
        normalizeLineBreaks: true,
        removeSpecialChars: false,
        convertToLowercase: false,
        convertToUppercase: false,
        removeNumbers: false,
        removePunctuation: false,
      },
    };
    
    setOptions(presets[presetName as keyof typeof presets]);
  };

  // Clear results when input is cleared
  useEffect(() => {
    if (!inputText.trim()) {
      setCleaningResult(null);
    }
  }, [inputText]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Helmet>
        <title>Text Cleaner & Formatter - Remove Extra Spaces, Line Breaks & Format Text | DapsiWow</title>
        <meta name="description" content="Professional text cleaner and formatter tool to remove extra spaces, line breaks, special characters, and format messy text. Clean up copied text, remove formatting issues, and optimize content instantly." />
        <meta name="keywords" content="text cleaner, text formatter, remove extra spaces, clean text online, text cleanup tool, format text, remove line breaks, text processing, clean copied text, text optimization" />
        <meta property="og:title" content="Text Cleaner & Formatter - Professional Text Cleanup Tool | DapsiWow" />
        <meta property="og:description" content="Advanced text cleaning tool to remove extra spaces, line breaks, and formatting issues. Perfect for cleaning copied text and optimizing content." />
        <meta property="og:type" content="website" />
        <meta name="robots" content="index, follow" />
        <meta name="author" content="DapsiWow" />
        <link rel="canonical" href="https://dapsiwow.com/tools/text-cleaner-formatter" />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            "name": "Text Cleaner & Formatter",
            "description": "Professional text cleaning and formatting tool to remove extra spaces, line breaks, special characters, and optimize text content with advanced cleaning options.",
            "url": "https://dapsiwow.com/tools/text-cleaner-formatter",
            "applicationCategory": "UtilityApplication",
            "operatingSystem": "Any",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "USD"
            },
            "featureList": [
              "Remove extra spaces and tabs",
              "Clean up line breaks and empty lines",
              "Remove special characters and punctuation",
              "Case conversion options",
              "Multiple cleaning presets",
              "Real-time statistics",
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
              <div className="inline-flex items-center px-3 sm:px-4 py-1.5 sm:py-2 bg-white/80 backdrop-blur-sm rounded-full border border-blue-200">
                <span className="text-xs sm:text-sm font-medium text-blue-700">Text Formatting Tool</span>
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl 2xl:text-8xl font-bold text-slate-900 leading-tight tracking-tight" data-testid="text-page-title">
                <span className="block">Text Cleaner &</span>
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 mt-1 sm:mt-2">
                  Formatter
                </span>
              </h1>
              <p className="text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl text-slate-600 max-w-sm sm:max-w-lg md:max-w-2xl lg:max-w-3xl xl:max-w-4xl mx-auto leading-relaxed px-2 sm:px-0">
                Clean up messy text by removing extra spaces, line breaks, and formatting issues with advanced options
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
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">Text Cleaner & Formatter</h2>
                    <p className="text-gray-600">Enter your messy text to clean and format it with customizable options</p>
                  </div>

                  <div className="space-y-4 sm:space-y-6">
                    {/* Text Input */}
                    <div className="space-y-3">
                      <Label htmlFor="text-input" className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                        Text to Clean
                      </Label>
                      <Textarea
                        id="text-input"
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        className="min-h-[100px] sm:min-h-[120px] lg:min-h-[140px] text-base sm:text-lg border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-blue-500 resize-none"
                        placeholder="Paste your messy text here... It can contain extra   spaces,


multiple line breaks, and other formatting issues that need cleaning."
                        data-testid="textarea-text-input"
                      />
                    </div>

                    {/* Quick Presets */}
                    <div className="space-y-3">
                      <Label className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                        Quick Presets
                      </Label>
                      <div className="flex flex-wrap gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => loadPreset('basic')}
                          className="text-xs sm:text-sm"
                          data-testid="preset-basic"
                        >
                          Basic Clean
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => loadPreset('aggressive')}
                          className="text-xs sm:text-sm"
                          data-testid="preset-aggressive"
                        >
                          Aggressive Clean
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => loadPreset('minimal')}
                          className="text-xs sm:text-sm"
                          data-testid="preset-minimal"
                        >
                          Minimal Clean
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Advanced Options */}
                  <div className="space-y-4 sm:space-y-6 border-t pt-6 sm:pt-8">
                    <h3 className="text-lg sm:text-xl font-bold text-gray-900">Cleaning Options</h3>
                    
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
                            <h4 className="text-sm sm:text-base font-semibold text-gray-900">Spacing & Lines</h4>
                            
                            <div className="flex items-center justify-between gap-2">
                              <div className="space-y-1 flex-1 min-w-0">
                                <Label className="text-xs sm:text-sm font-medium">Remove Extra Spaces</Label>
                                <p className="text-xs text-gray-500">Collapse multiple spaces into one</p>
                              </div>
                              <Switch
                                checked={options.removeExtraSpaces}
                                onCheckedChange={(value) => updateOption('removeExtraSpaces', value)}
                                data-testid="switch-remove-spaces"
                              />
                            </div>

                            <div className="flex items-center justify-between gap-2">
                              <div className="space-y-1 flex-1 min-w-0">
                                <Label className="text-xs sm:text-sm font-medium">Remove Extra Line Breaks</Label>
                                <p className="text-xs text-gray-500">Limit consecutive line breaks</p>
                              </div>
                              <Switch
                                checked={options.removeExtraLineBreaks}
                                onCheckedChange={(value) => updateOption('removeExtraLineBreaks', value)}
                                data-testid="switch-remove-breaks"
                              />
                            </div>

                            <div className="flex items-center justify-between gap-2">
                              <div className="space-y-1 flex-1 min-w-0">
                                <Label className="text-xs sm:text-sm font-medium">Trim Lines</Label>
                                <p className="text-xs text-gray-500">Remove spaces at start/end of lines</p>
                              </div>
                              <Switch
                                checked={options.trimLines}
                                onCheckedChange={(value) => updateOption('trimLines', value)}
                                data-testid="switch-trim-lines"
                              />
                            </div>

                            <div className="flex items-center justify-between gap-2">
                              <div className="space-y-1 flex-1 min-w-0">
                                <Label className="text-xs sm:text-sm font-medium">Remove Empty Lines</Label>
                                <p className="text-xs text-gray-500">Delete completely empty lines</p>
                              </div>
                              <Switch
                                checked={options.removeEmptyLines}
                                onCheckedChange={(value) => updateOption('removeEmptyLines', value)}
                                data-testid="switch-remove-empty"
                              />
                            </div>

                            <div className="flex items-center justify-between gap-2">
                              <div className="space-y-1 flex-1 min-w-0">
                                <Label className="text-xs sm:text-sm font-medium">Normalize Line Breaks</Label>
                                <p className="text-xs text-gray-500">Convert to standard format</p>
                              </div>
                              <Switch
                                checked={options.normalizeLineBreaks}
                                onCheckedChange={(value) => updateOption('normalizeLineBreaks', value)}
                                data-testid="switch-normalize-breaks"
                              />
                            </div>
                          </div>

                          {/* Content & Format Options */}
                          <div className="space-y-4 bg-gray-50 rounded-xl p-4 sm:p-6">
                            <h4 className="text-sm sm:text-base font-semibold text-gray-900">Content & Format</h4>
                            
                            <div className="flex items-center justify-between gap-2">
                              <div className="space-y-1 flex-1 min-w-0">
                                <Label className="text-xs sm:text-sm font-medium">Remove Special Characters</Label>
                                <p className="text-xs text-gray-500">Keep only letters, numbers, spaces</p>
                              </div>
                              <Switch
                                checked={options.removeSpecialChars}
                                onCheckedChange={(value) => updateOption('removeSpecialChars', value)}
                                data-testid="switch-remove-special"
                              />
                            </div>

                            <div className="flex items-center justify-between gap-2">
                              <div className="space-y-1 flex-1 min-w-0">
                                <Label className="text-xs sm:text-sm font-medium">Remove Numbers</Label>
                                <p className="text-xs text-gray-500">Delete all numeric characters</p>
                              </div>
                              <Switch
                                checked={options.removeNumbers}
                                onCheckedChange={(value) => updateOption('removeNumbers', value)}
                                data-testid="switch-remove-numbers"
                              />
                            </div>

                            <div className="flex items-center justify-between gap-2">
                              <div className="space-y-1 flex-1 min-w-0">
                                <Label className="text-xs sm:text-sm font-medium">Remove Punctuation</Label>
                                <p className="text-xs text-gray-500">Delete all punctuation marks</p>
                              </div>
                              <Switch
                                checked={options.removePunctuation}
                                onCheckedChange={(value) => updateOption('removePunctuation', value)}
                                data-testid="switch-remove-punctuation"
                              />
                            </div>

                            <div className="flex items-center justify-between gap-2">
                              <div className="space-y-1 flex-1 min-w-0">
                                <Label className="text-xs sm:text-sm font-medium">Convert to Lowercase</Label>
                                <p className="text-xs text-gray-500">Change all text to lowercase</p>
                              </div>
                              <Switch
                                checked={options.convertToLowercase}
                                onCheckedChange={(value) => updateOption('convertToLowercase', value)}
                                data-testid="switch-lowercase"
                              />
                            </div>

                            <div className="flex items-center justify-between gap-2">
                              <div className="space-y-1 flex-1 min-w-0">
                                <Label className="text-xs sm:text-sm font-medium">Convert to UPPERCASE</Label>
                                <p className="text-xs text-gray-500">Change all text to uppercase</p>
                              </div>
                              <Switch
                                checked={options.convertToUppercase}
                                onCheckedChange={(value) => updateOption('convertToUppercase', value)}
                                data-testid="switch-uppercase"
                              />
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
                      onClick={performCleaning}
                      disabled={!inputText.trim()}
                      className="flex-1 h-12 sm:h-14 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold text-base sm:text-lg rounded-xl shadow-lg transform transition-all duration-200 hover:scale-105"
                      data-testid="button-clean"
                    >
                      Clean Text
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
                      onClick={resetTool}
                      variant="outline"
                      className="h-12 sm:h-14 px-6 sm:px-8 border-2 border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold text-base sm:text-lg rounded-xl"
                      data-testid="button-reset"
                    >
                      Reset
                    </Button>
                  </div>
                </div>

                {/* Results Section - Only show when cleaningResult exists */}
                {cleaningResult && cleaningResult.originalText && (
                  <div className="bg-gradient-to-br from-gray-50 to-blue-50 p-4 sm:p-6 md:p-8 lg:p-10 xl:p-12 border-t">
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6 sm:mb-8">Cleaned Results</h2>

                    <div className="space-y-3 sm:space-y-4" data-testid="cleaning-results">
                      {/* Main Cleaned Text Display */}
                      <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-3 sm:p-4">
                        <div className="flex items-center justify-between mb-3 gap-3">
                          <div className="flex-1 min-w-0">
                            <h3 className="text-sm sm:text-base font-semibold text-gray-900 truncate">Cleaned Text</h3>
                            <p className="text-xs sm:text-sm text-gray-600 break-words">
                              Removed {cleaningResult.charsSaved} characters • {cleaningResult.charCount} characters remaining
                            </p>
                          </div>
                          <Button
                            onClick={() => handleCopyToClipboard(cleaningResult.cleanedText)}
                            variant="outline"
                            size="sm"
                            className="text-xs px-2 sm:px-3 py-2 flex-shrink-0 rounded-lg min-w-[60px] sm:min-w-[70px] h-11 sm:h-9 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                            data-testid="button-copy-cleaned"
                          >
                            Copy
                          </Button>
                        </div>
                        <div 
                          className="bg-white p-2 sm:p-3 rounded-lg border border-gray-200 text-xs sm:text-sm font-mono break-all min-h-[40px] sm:min-h-[44px] flex items-center whitespace-pre-wrap"
                          data-testid="cleaned-output"
                        >
                          {cleaningResult.cleanedText || '(empty result)'}
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
                            onClick={() => handleCopyToClipboard(cleaningResult.originalText)}
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
                          {cleaningResult.originalText}
                        </div>
                      </div>

                      {/* Text Statistics */}
                      <div className="bg-white rounded-xl p-3 sm:p-4 shadow-sm border border-gray-200" data-testid="text-statistics">
                        <h3 className="text-sm sm:text-base font-bold text-gray-900 mb-4">Cleaning Statistics</h3>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                          <div className="bg-blue-50 rounded-lg p-4 text-center">
                            <div className="text-2xl font-bold text-blue-600" data-testid="cleaned-char-count">{cleaningResult.charCount}</div>
                            <div className="text-sm text-blue-700 font-medium">Characters</div>
                          </div>
                          <div className="bg-green-50 rounded-lg p-4 text-center">
                            <div className="text-2xl font-bold text-green-600" data-testid="word-count">{cleaningResult.wordCount}</div>
                            <div className="text-sm text-green-700 font-medium">Words</div>
                          </div>
                          <div className="bg-red-50 rounded-lg p-4 text-center">
                            <div className="text-2xl font-bold text-red-600" data-testid="chars-saved">{cleaningResult.charsSaved}</div>
                            <div className="text-sm text-red-700 font-medium">Chars Removed</div>
                          </div>
                          <div className="bg-purple-50 rounded-lg p-4 text-center">
                            <div className="text-2xl font-bold text-purple-600" data-testid="reduction-percentage">
                              {cleaningResult.originalCharCount > 0 ? Math.round((cleaningResult.charsSaved / cleaningResult.originalCharCount) * 100) : 0}%
                            </div>
                            <div className="text-sm text-purple-700 font-medium">Reduction</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* SEO Content Sections */}
          <div className="mt-16 space-y-8">
            {/* What is a Text Cleaner & Formatter */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">What is a Text Cleaner & Formatter?</h2>
                <div className="space-y-4 text-gray-600">
                  <p>
                    A <strong>text cleaner and formatter</strong> is an advanced text processing tool designed to automatically clean up and format messy, unstructured text content. This essential utility removes unwanted formatting artifacts, extra spaces, irregular line breaks, and other common text issues that occur when copying content from PDFs, emails, websites, or other formatted documents.
                  </p>
                  <p>
                    Our professional text cleaner offers comprehensive cleaning options including space normalization, line break optimization, character removal, case conversion, and special formatting cleanup. Whether you're preparing content for publication, cleaning data for analysis, or optimizing text for specific platforms, this tool provides the precision and control needed for professional text processing.
                  </p>
                  <p>
                    Perfect for content creators, writers, data analysts, and anyone working with text from multiple sources, our text cleaner ensures consistent formatting while preserving the integrity and meaning of your original content across all your projects and applications.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Text Cleaning Methods & Features */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Advanced Text Cleaning Features & Methods</h2>
                <p className="text-gray-600 mb-8">Our text cleaner provides comprehensive cleaning options to handle various formatting issues and text optimization needs with professional-grade precision and customizable settings.</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div className="bg-blue-50 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-blue-900 mb-3">Spacing & Line Break Cleanup</h3>
                      <p className="text-blue-800 text-sm mb-4">
                        Advanced spacing normalization removes inconsistent spacing patterns, collapses multiple spaces, and optimizes line breaks for clean, readable text format.
                      </p>
                      <div className="bg-blue-100 p-3 rounded-lg">
                        <h4 className="font-medium text-blue-900 mb-2">Cleaning Example:</h4>
                        <div className="text-xs font-mono text-blue-800">
                          <div>Before: "Text   with    extra   spaces"</div>
                          <div>After: "Text with extra spaces"</div>
                        </div>
                      </div>
                      <ul className="text-xs text-blue-700 mt-3 space-y-1">
                        <li>• Remove multiple consecutive spaces</li>
                        <li>• Normalize tab characters to spaces</li>
                        <li>• Clean up excessive line breaks</li>
                        <li>• Trim whitespace from line endings</li>
                      </ul>
                    </div>

                    <div className="bg-orange-50 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-orange-900 mb-3">Character & Content Filtering</h3>
                      <p className="text-orange-800 text-sm mb-4">
                        Selective character removal options allow precise content filtering, removing unwanted special characters, numbers, or punctuation based on your specific requirements.
                      </p>
                      <div className="bg-orange-100 p-3 rounded-lg">
                        <h4 className="font-medium text-orange-900 mb-2">Filtering Example:</h4>
                        <div className="text-xs font-mono text-orange-800">
                          <div>Before: "Text123 with @#$% symbols!"</div>
                          <div>After: "Text with symbols"</div>
                        </div>
                      </div>
                      <ul className="text-xs text-orange-700 mt-3 space-y-1">
                        <li>• Remove special characters selectively</li>
                        <li>• Filter out numeric characters</li>
                        <li>• Clean unwanted punctuation marks</li>
                        <li>• Preserve essential formatting elements</li>
                      </ul>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="bg-green-50 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-green-900 mb-3">Case Conversion & Formatting</h3>
                      <p className="text-green-800 text-sm mb-4">
                        Intelligent case conversion options provide consistent text formatting with uppercase, lowercase, and normalized case options for professional content presentation.
                      </p>
                      <div className="bg-green-100 p-3 rounded-lg">
                        <h4 className="font-medium text-green-900 mb-2">Case Example:</h4>
                        <div className="text-xs font-mono text-green-800">
                          <div>Before: "MiXeD CaSe TeXt"</div>
                          <div>After: "mixed case text"</div>
                        </div>
                      </div>
                      <ul className="text-xs text-green-700 mt-3 space-y-1">
                        <li>• Convert to lowercase formatting</li>
                        <li>• Transform to uppercase style</li>
                        <li>• Maintain original case when needed</li>
                        <li>• Consistent formatting across content</li>
                      </ul>
                    </div>

                    <div className="bg-purple-50 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-purple-900 mb-3">Quick Preset Configurations</h3>
                      <p className="text-purple-800 text-sm mb-4">
                        Pre-configured cleaning presets provide instant optimization for common scenarios, from basic cleanup to aggressive formatting removal for different use cases.
                      </p>
                      <div className="bg-purple-100 p-3 rounded-lg">
                        <h4 className="font-medium text-purple-900 mb-2">Preset Options:</h4>
                        <div className="text-xs text-purple-800">
                          <div>• Basic: Standard space & line cleanup</div>
                          <div>• Aggressive: Maximum formatting removal</div>
                          <div>• Minimal: Light touch formatting only</div>
                        </div>
                      </div>
                      <ul className="text-xs text-purple-700 mt-3 space-y-1">
                        <li>• One-click cleaning configurations</li>
                        <li>• Optimized for common use cases</li>
                        <li>• Customizable after preset application</li>
                        <li>• Professional cleaning standards</li>
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
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Who Uses Text Cleaning Tools?</h2>
                  <p className="text-gray-600 mb-6">Text cleaning tools serve diverse professionals across multiple industries, providing essential functionality for content preparation, data processing, publishing, and digital content optimization workflows.</p>
                  
                  <div className="space-y-4">
                    <div className="bg-blue-50 rounded-lg p-4">
                      <h3 className="font-semibold text-blue-900 mb-2">Content Creators & Publishers</h3>
                      <p className="text-blue-800 text-sm">Clean and format content copied from various sources, prepare text for publication platforms, and ensure consistent formatting across articles, blogs, and marketing materials.</p>
                    </div>
                    
                    <div className="bg-green-50 rounded-lg p-4">
                      <h3 className="font-semibold text-green-900 mb-2">Data Analysts & Researchers</h3>
                      <p className="text-green-800 text-sm">Process text data for analysis, clean survey responses and feedback, prepare datasets for text mining, and standardize content for research studies and data science projects.</p>
                    </div>
                    
                    <div className="bg-purple-50 rounded-lg p-4">
                      <h3 className="font-semibold text-purple-900 mb-2">Technical Writers & Editors</h3>
                      <p className="text-purple-800 text-sm">Format documentation copied from various sources, clean up exported content from legacy systems, and prepare technical content for publication platforms with specific formatting requirements.</p>
                    </div>
                    
                    <div className="bg-orange-50 rounded-lg p-4">
                      <h3 className="font-semibold text-orange-900 mb-2">Digital Marketers & SEO Specialists</h3>
                      <p className="text-orange-800 text-sm">Optimize content for search engines, clean meta descriptions and title tags, prepare social media content, and format text for various digital marketing platforms and campaigns.</p>
                    </div>

                    <div className="bg-teal-50 rounded-lg p-4">
                      <h3 className="font-semibold text-teal-900 mb-2">Students & Academic Professionals</h3>
                      <p className="text-teal-800 text-sm">Format research content copied from academic sources, clean up bibliography and citation text, prepare thesis and dissertation content, and optimize text for academic publishing requirements.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
                <CardContent className="p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Key Features & Benefits</h2>
                  <p className="text-gray-600 mb-6">Our text cleaner provides comprehensive features designed to meet professional, academic, and creative text processing needs with maximum flexibility and precision control.</p>
                  
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                        <span className="text-white text-xs font-bold">✓</span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-1">Multiple Cleaning Methods</h4>
                        <p className="text-gray-600 text-sm">Choose from comprehensive cleaning options including space normalization, line break optimization, character filtering, and case conversion for precise text formatting.</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                        <span className="text-white text-xs font-bold">✓</span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-1">Real-Time Processing</h4>
                        <p className="text-gray-600 text-sm">Instant text cleaning with immediate visual feedback, allowing you to see results instantly and adjust cleaning options for optimal text formatting results.</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                        <span className="text-white text-xs font-bold">✓</span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-1">Customizable Presets</h4>
                        <p className="text-gray-600 text-sm">Quick-access presets for common cleaning scenarios including basic cleanup, aggressive formatting removal, and minimal touch processing for efficient workflow optimization.</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                        <span className="text-white text-xs font-bold">✓</span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-1">Detailed Statistics</h4>
                        <p className="text-gray-600 text-sm">Comprehensive cleaning statistics showing characters removed, reduction percentages, and before/after comparisons for complete transparency in text processing.</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-teal-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                        <span className="text-white text-xs font-bold">✓</span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-1">Privacy & Security</h4>
                        <p className="text-gray-600 text-sm">All text processing happens locally in your browser with no data transmission to servers, ensuring complete privacy and security of your sensitive content and information.</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Common Text Formatting Issues */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Common Text Formatting Issues & Solutions</h2>
                <p className="text-gray-600 mb-8">Understanding common text formatting problems helps you choose the right cleaning options and achieve optimal results for your specific text processing needs and content optimization goals.</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div className="bg-gradient-to-r from-red-50 to-pink-50 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-red-900 mb-4">PDF Copy-Paste Issues</h3>
                      <div className="space-y-4">
                        <div className="bg-red-100 p-4 rounded-lg">
                          <h4 className="font-medium text-red-900 mb-2">Common Problems:</h4>
                          <ul className="text-sm text-red-800 space-y-1">
                            <li>• Random line breaks in middle of sentences</li>
                            <li>• Inconsistent spacing between words</li>
                            <li>• Mixed character encodings and symbols</li>
                            <li>• Header and footer text mixed with content</li>
                          </ul>
                        </div>
                        <div className="bg-green-100 p-4 rounded-lg">
                          <h4 className="font-medium text-green-900 mb-2">Cleaning Solutions:</h4>
                          <ul className="text-sm text-green-800 space-y-1">
                            <li>• Use "Aggressive Clean" preset for PDF text</li>
                            <li>• Enable line break normalization</li>
                            <li>• Remove special characters selectively</li>
                            <li>• Apply space normalization</li>
                          </ul>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-blue-900 mb-4">Email & Web Content</h3>
                      <div className="space-y-4">
                        <div className="bg-blue-100 p-4 rounded-lg">
                          <h4 className="font-medium text-blue-900 mb-2">Common Problems:</h4>
                          <ul className="text-sm text-blue-800 space-y-1">
                            <li>• HTML entity codes in plain text</li>
                            <li>• Excessive spacing from HTML formatting</li>
                            <li>• Mixed case formatting inconsistencies</li>
                            <li>• Email signature and metadata included</li>
                          </ul>
                        </div>
                        <div className="bg-green-100 p-4 rounded-lg">
                          <h4 className="font-medium text-green-900 mb-2">Cleaning Solutions:</h4>
                          <ul className="text-sm text-green-800 space-y-1">
                            <li>• Remove special characters and symbols</li>
                            <li>• Normalize case formatting</li>
                            <li>• Clean excessive spacing</li>
                            <li>• Trim line endings consistently</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="bg-gradient-to-r from-orange-50 to-yellow-50 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-orange-900 mb-4">Data Import & Export</h3>
                      <div className="space-y-4">
                        <div className="bg-orange-100 p-4 rounded-lg">
                          <h4 className="font-medium text-orange-900 mb-2">Common Problems:</h4>
                          <ul className="text-sm text-orange-800 space-y-1">
                            <li>• Inconsistent delimiters and separators</li>
                            <li>• Mixed numeric and text formatting</li>
                            <li>• Trailing spaces and hidden characters</li>
                            <li>• Different line ending conventions</li>
                          </ul>
                        </div>
                        <div className="bg-green-100 p-4 rounded-lg">
                          <h4 className="font-medium text-green-900 mb-2">Cleaning Solutions:</h4>
                          <ul className="text-sm text-green-800 space-y-1">
                            <li>• Normalize line breaks to standard format</li>
                            <li>• Trim whitespace from all lines</li>
                            <li>• Remove or preserve numbers as needed</li>
                            <li>• Standardize spacing patterns</li>
                          </ul>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-purple-900 mb-4">Social Media & Content</h3>
                      <div className="space-y-4">
                        <div className="bg-purple-100 p-4 rounded-lg">
                          <h4 className="font-medium text-purple-900 mb-2">Common Problems:</h4>
                          <ul className="text-sm text-purple-800 space-y-1">
                            <li>• Character limits and length restrictions</li>
                            <li>• Emoji and special character conflicts</li>
                            <li>• Hashtag and mention formatting</li>
                            <li>• Platform-specific formatting quirks</li>
                          </ul>
                        </div>
                        <div className="bg-green-100 p-4 rounded-lg">
                          <h4 className="font-medium text-green-900 mb-2">Cleaning Solutions:</h4>
                          <ul className="text-sm text-green-800 space-y-1">
                            <li>• Character count optimization</li>
                            <li>• Selective special character removal</li>
                            <li>• Case conversion for consistency</li>
                            <li>• Space optimization for readability</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-8 bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Professional Best Practices</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium text-gray-800 mb-2">Before Cleaning</h4>
                      <p className="text-gray-600 text-sm mb-3">Always save a backup copy of your original text before applying cleaning operations, especially for important documents or irreplaceable content.</p>
                      <ul className="text-gray-600 text-sm space-y-1">
                        <li>• Review source formatting issues</li>
                        <li>• Identify specific cleaning needs</li>
                        <li>• Choose appropriate preset or custom options</li>
                        <li>• Test on small sample first</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-800 mb-2">After Cleaning</h4>
                      <p className="text-gray-600 text-sm mb-3">Review cleaned results carefully to ensure all important content is preserved and formatting meets your requirements for the intended use case.</p>
                      <ul className="text-gray-600 text-sm space-y-1">
                        <li>• Verify content integrity and completeness</li>
                        <li>• Check formatting consistency</li>
                        <li>• Validate special characters if needed</li>
                        <li>• Test in target platform or application</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Advanced Use Cases */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Advanced Use Cases & Optimization Strategies</h2>
                <p className="text-gray-600 mb-8">Explore sophisticated applications of text cleaning technology across professional domains, creative industries, and specialized fields requiring advanced text processing capabilities and strategic content optimization.</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="bg-blue-50 rounded-lg p-6">
                    <h3 className="font-semibold text-blue-900 mb-4">Content Management Systems</h3>
                    <ul className="text-blue-800 text-sm space-y-2">
                      <li>• Clean imported legacy content</li>
                      <li>• Standardize formatting across platforms</li>
                      <li>• Prepare content for migration</li>
                      <li>• Optimize for CMS requirements</li>
                      <li>• Remove proprietary formatting codes</li>
                      <li>• Ensure cross-platform compatibility</li>
                    </ul>
                  </div>

                  <div className="bg-green-50 rounded-lg p-6">
                    <h3 className="font-semibold text-green-900 mb-4">Data Science & Analytics</h3>
                    <ul className="text-green-800 text-sm space-y-2">
                      <li>• Preprocess text data for NLP analysis</li>
                      <li>• Clean survey and feedback responses</li>
                      <li>• Standardize research dataset formatting</li>
                      <li>• Prepare text for machine learning models</li>
                      <li>• Remove noise from text corpora</li>
                      <li>• Normalize text encoding standards</li>
                    </ul>
                  </div>

                  <div className="bg-purple-50 rounded-lg p-6">
                    <h3 className="font-semibold text-purple-900 mb-4">Academic & Research</h3>
                    <ul className="text-purple-800 text-sm space-y-2">
                      <li>• Format citations and bibliographies</li>
                      <li>• Clean OCR-scanned document text</li>
                      <li>• Prepare manuscripts for submission</li>
                      <li>• Standardize research data formatting</li>
                      <li>• Process historical document text</li>
                      <li>• Optimize for academic publishing</li>
                    </ul>
                  </div>

                  <div className="bg-orange-50 rounded-lg p-6">
                    <h3 className="font-semibold text-orange-900 mb-4">Digital Publishing</h3>
                    <ul className="text-orange-800 text-sm space-y-2">
                      <li>• Prepare content for e-book conversion</li>
                      <li>• Clean text for print layout systems</li>
                      <li>• Optimize for responsive web design</li>
                      <li>• Format for multiple output channels</li>
                      <li>• Remove proprietary formatting artifacts</li>
                      <li>• Ensure typography consistency</li>
                    </ul>
                  </div>

                  <div className="bg-teal-50 rounded-lg p-6">
                    <h3 className="font-semibold text-teal-900 mb-4">Legal & Compliance</h3>
                    <ul className="text-teal-800 text-sm space-y-2">
                      <li>• Process legal document text</li>
                      <li>• Clean deposition and transcript text</li>
                      <li>• Standardize contract formatting</li>
                      <li>• Prepare documents for e-discovery</li>
                      <li>• Ensure regulatory compliance formatting</li>
                      <li>• Optimize for accessibility standards</li>
                    </ul>
                  </div>

                  <div className="bg-red-50 rounded-lg p-6">
                    <h3 className="font-semibold text-red-900 mb-4">Marketing & SEO</h3>
                    <ul className="text-red-800 text-sm space-y-2">
                      <li>• Optimize content for search engines</li>
                      <li>• Clean social media content imports</li>
                      <li>• Prepare email marketing copy</li>
                      <li>• Format for marketing automation</li>
                      <li>• Standardize brand voice and tone</li>
                      <li>• Optimize character counts for platforms</li>
                    </ul>
                  </div>
                </div>

                <div className="mt-8 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance & Efficiency Tips</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium text-gray-800 mb-3">Batch Processing Strategies</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-start gap-2">
                          <div className="w-2 h-2 bg-indigo-500 rounded-full mt-2 flex-shrink-0"></div>
                          <span className="text-gray-700">Use consistent cleaning presets for similar content types</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <div className="w-2 h-2 bg-indigo-500 rounded-full mt-2 flex-shrink-0"></div>
                          <span className="text-gray-700">Process large documents in smaller, manageable sections</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <div className="w-2 h-2 bg-indigo-500 rounded-full mt-2 flex-shrink-0"></div>
                          <span className="text-gray-700">Document successful cleaning configurations for reuse</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <div className="w-2 h-2 bg-indigo-500 rounded-full mt-2 flex-shrink-0"></div>
                          <span className="text-gray-700">Test cleaning options on representative samples first</span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-800 mb-3">Quality Assurance Methods</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-start gap-2">
                          <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                          <span className="text-gray-700">Compare before and after statistics for validation</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                          <span className="text-gray-700">Verify content integrity after cleaning operations</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                          <span className="text-gray-700">Test cleaned text in target applications</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                          <span className="text-gray-700">Maintain backups of original content for reference</span>
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
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">What types of text formatting issues can this tool fix?</h3>
                      <p className="text-gray-600 text-sm">
                        Our text cleaner handles multiple formatting issues including extra spaces, irregular line breaks, special characters, case inconsistencies, empty lines, and various encoding problems commonly found in copied text from PDFs, emails, and websites.
                      </p>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Which cleaning preset should I use for PDF text?</h3>
                      <p className="text-gray-600 text-sm">
                        For PDF text, we recommend starting with the "Aggressive Clean" preset as it handles common PDF copying issues like random line breaks, extra spaces, and special characters. You can then customize additional options based on your specific needs.
                      </p>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Will the tool remove important formatting like paragraphs?</h3>
                      <p className="text-gray-600 text-sm">
                        No, the tool is designed to preserve meaningful structure while cleaning unwanted formatting. Paragraph breaks are maintained unless you specifically enable "Remove Empty Lines" option. You have full control over which formatting elements to keep or remove.
                      </p>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Can I undo cleaning operations if I'm not satisfied?</h3>
                      <p className="text-gray-600 text-sm">
                        Yes, the original text is always preserved and displayed alongside the cleaned version. You can copy the original text back anytime, and you can adjust cleaning options and re-process the text with different settings as needed.
                      </p>
                    </div>
                  </div>
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Is my text data secure when using this tool?</h3>
                      <p className="text-gray-600 text-sm">
                        Absolutely! All text processing happens locally in your browser using client-side JavaScript. No text data is transmitted to servers, stored remotely, or accessed by third parties, ensuring complete privacy and security of your content.
                      </p>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Does the tool work with non-English text and special characters?</h3>
                      <p className="text-gray-600 text-sm">
                        Yes! The tool supports full Unicode character sets including international languages, accented characters, and special symbols. However, some very specific character filtering options may affect non-English text, so test with a small sample first.
                      </p>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Are there any limitations on text length?</h3>
                      <p className="text-gray-600 text-sm">
                        There's no strict character limit, but very large texts (over 50,000 characters) may take longer to process due to browser performance constraints. For optimal performance, consider processing large documents in smaller sections.
                      </p>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Does this work offline after the page loads?</h3>
                      <p className="text-gray-600 text-sm">
                        Yes! Once the page loads completely, all cleaning functionality works offline without requiring an internet connection. The tool runs entirely in your browser, making it reliable for secure environments and offline use.
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
                <p className="text-gray-600 mb-8">Our text cleaner is built with modern web technologies to ensure compatibility, performance, and reliability across all major platforms and devices with comprehensive Unicode support and advanced text processing capabilities.</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">Text Processing Capabilities</h3>
                    <div className="space-y-4">
                      <div className="bg-blue-50 rounded-lg p-4">
                        <h4 className="font-semibold text-blue-900 mb-2">Character Support</h4>
                        <ul className="text-blue-800 text-sm space-y-1">
                          <li>• Full Unicode 15.0 character support</li>
                          <li>• International languages and scripts</li>
                          <li>• Emojis and special symbols</li>
                          <li>• Complex character combinations</li>
                        </ul>
                      </div>
                      <div className="bg-orange-50 rounded-lg p-4">
                        <h4 className="font-semibold text-orange-900 mb-2">Cleaning Operations</h4>
                        <ul className="text-orange-800 text-sm space-y-1">
                          <li>• Space and tab normalization</li>
                          <li>• Line break optimization</li>
                          <li>• Character filtering and removal</li>
                          <li>• Case conversion operations</li>
                        </ul>
                      </div>
                      <div className="bg-purple-50 rounded-lg p-4">
                        <h4 className="font-semibold text-purple-900 mb-2">Advanced Features</h4>
                        <ul className="text-purple-800 text-sm space-y-1">
                          <li>• Real-time processing with feedback</li>
                          <li>• Customizable cleaning presets</li>
                          <li>• Statistical analysis and reporting</li>
                          <li>• Before/after comparison tools</li>
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
                          <li>• Instant text processing</li>
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

export default TextCleanerFormatter;
