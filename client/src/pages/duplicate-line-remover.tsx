import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import Header from '@/components/Header';

interface DuplicationOptions {
  caseSensitive: boolean;
  trimWhitespace: boolean;
  outputFormat: 'removed' | 'kept' | 'both';
}

interface DuplicateResult {
  originalText: string;
  processedText: string;
  duplicatesRemoved: string[];
  originalLines: number;
  uniqueLines: number;
  duplicatesCount: number;
  duplicatesRemovedCount: number;
}

export default function DuplicateLineRemover() {
  const [inputText, setInputText] = useState('');
  const [result, setResult] = useState<DuplicateResult | null>(null);
  const [options, setOptions] = useState<DuplicationOptions>({
    caseSensitive: true,
    trimWhitespace: true,
    outputFormat: 'removed'
  });
  const { toast } = useToast();

  const removeDuplicateLines = (text: string, opts: DuplicationOptions): DuplicateResult => {
    if (!text.trim()) {
      return {
        originalText: text,
        processedText: '',
        duplicatesRemoved: [],
        originalLines: 0,
        uniqueLines: 0,
        duplicatesCount: 0,
        duplicatesRemovedCount: 0
      };
    }

    const lines = text.split('\n');
    const originalCount = lines.length;
    const seen = new Set<string>();
    const duplicatesRemoved: string[] = [];
    const keptLines: string[] = [];

    for (const line of lines) {
      let processedLine = line;
      
      // Apply whitespace trimming if enabled
      if (opts.trimWhitespace) {
        processedLine = line.trim();
      }
      
      // Apply case sensitivity if disabled
      const comparisonLine = opts.caseSensitive ? processedLine : processedLine.toLowerCase();
      
      if (!seen.has(comparisonLine)) {
        seen.add(comparisonLine);
        keptLines.push(line); // Keep original formatting
      } else {
        duplicatesRemoved.push(line);
      }
    }

    let outputText = '';
    switch (opts.outputFormat) {
      case 'removed':
        outputText = keptLines.join('\n');
        break;
      case 'kept':
        outputText = duplicatesRemoved.join('\n');
        break;
      case 'both':
        outputText = `--- UNIQUE LINES ---\n${keptLines.join('\n')}\n\n--- DUPLICATE LINES ---\n${duplicatesRemoved.join('\n')}`;
        break;
    }

    return {
      originalText: text,
      processedText: outputText,
      duplicatesRemoved,
      originalLines: originalCount,
      uniqueLines: keptLines.length,
      duplicatesCount: duplicatesRemoved.length,
      duplicatesRemovedCount: duplicatesRemoved.length
    };
  };

  // Real-time processing
  useEffect(() => {
    if (inputText.trim()) {
      const result = removeDuplicateLines(inputText, options);
      setResult(result);
    } else {
      setResult(null);
    }
  }, [inputText, options]);

  const handleClear = () => {
    setInputText('');
    setResult(null);
  };

  const handleCopyResult = async () => {
    if (result?.processedText) {
      try {
        await navigator.clipboard.writeText(result.processedText);
        toast({
          title: "Copied to clipboard",
          description: "Processed text has been copied to clipboard",
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

  const handleSampleText = () => {
    const sample = `Welcome to our website
Contact us for more information
Welcome to our website
Follow us on social media
Our team is here to help
Contact us for more information
Privacy policy
Terms of service
Follow us on social media
Our mission is to provide excellent service
Welcome to our website
About our company`;
    setInputText(sample);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Helmet>
        <title>Duplicate Line Remover - Remove Duplicate Lines from Text | DapsiWow</title>
        <meta name="description" content="Free online tool to remove duplicate lines from text while preserving original order. Advanced options for case sensitivity, whitespace handling, and output formatting." />
        <meta name="keywords" content="duplicate line remover, remove duplicates, text cleaning, duplicate text, line deduplication, text processing, remove repeated lines" />
        <meta property="og:title" content="Duplicate Line Remover - Remove Duplicate Lines from Text" />
        <meta property="og:description" content="Remove duplicate lines from text instantly with advanced options for case sensitivity and formatting. Free and easy to use." />
        <meta property="og:type" content="website" />
        <link rel="canonical" href="https://dapsiwow.com/tools/duplicate-line-remover" />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            "name": "Duplicate Line Remover",
            "description": "Free online tool to remove duplicate lines from text with advanced filtering options and real-time processing.",
            "url": "https://dapsiwow.com/tools/duplicate-line-remover",
            "applicationCategory": "UtilityApplication",
            "operatingSystem": "Any",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "USD"
            },
            "featureList": [
              "Real-time duplicate line removal",
              "Case sensitivity options",
              "Whitespace trimming",
              "Preserve original order",
              "Multiple output formats",
              "Copy to clipboard functionality"
            ]
          })}
        </script>
      </Helmet>

      <Header />

      <main>
        {/* Hero Section */}
        <section className="relative py-8 sm:py-12 lg:py-16 xl:py-20 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-4xl mx-auto">
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-slate-900 leading-tight" data-testid="text-page-title">
                Duplicate Line
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                  Remover
                </span>
              </h1>
              <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-slate-600 max-w-4xl mx-auto leading-relaxed px-2">
                Remove duplicate lines from text while preserving order and formatting
              </p>
            </div>
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
          {/* Main Tool Card */}
          <Card className="bg-white/90 backdrop-blur-sm shadow-2xl border-0 rounded-2xl sm:rounded-3xl overflow-hidden">
            <CardContent className="p-0">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-0">
                {/* Input Section */}
                <div className="lg:col-span-2 p-8 lg:p-12 space-y-8">
                  <div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">Text Input</h2>
                    <p className="text-gray-600">Paste your text with duplicate lines to clean up</p>
                  </div>
                  
                  {/* Text Input */}
                  <div className="space-y-3">
                    <Label htmlFor="text-input" className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                      Text to Process
                    </Label>
                    <Textarea
                      id="text-input"
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      className="min-h-[200px] text-base border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-blue-500 resize-none"
                      placeholder="Paste your text here (one item per line)..."
                      data-testid="textarea-text-input"
                    />
                  </div>

                  {/* Options */}
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-gray-800">Processing Options</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Case Sensitivity */}
                      <div className="flex items-center justify-between space-x-3">
                        <div>
                          <Label htmlFor="case-sensitive" className="text-sm font-medium text-gray-700">
                            Case Sensitive
                          </Label>
                          <p className="text-xs text-gray-500">Treat "Hello" and "hello" as different</p>
                        </div>
                        <Switch
                          id="case-sensitive"
                          checked={options.caseSensitive}
                          onCheckedChange={(checked) => setOptions(prev => ({ ...prev, caseSensitive: checked }))}
                          data-testid="switch-case-sensitive"
                        />
                      </div>

                      {/* Trim Whitespace */}
                      <div className="flex items-center justify-between space-x-3">
                        <div>
                          <Label htmlFor="trim-whitespace" className="text-sm font-medium text-gray-700">
                            Trim Whitespace
                          </Label>
                          <p className="text-xs text-gray-500">Remove leading/trailing spaces</p>
                        </div>
                        <Switch
                          id="trim-whitespace"
                          checked={options.trimWhitespace}
                          onCheckedChange={(checked) => setOptions(prev => ({ ...prev, trimWhitespace: checked }))}
                          data-testid="switch-trim-whitespace"
                        />
                      </div>

                      {/* Output Format */}
                      <div className="space-y-2 md:col-span-2">
                        <Label className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                          Output Format
                        </Label>
                        <Select
                          value={options.outputFormat}
                          onValueChange={(value: 'removed' | 'kept' | 'both') => 
                            setOptions(prev => ({ ...prev, outputFormat: value }))
                          }
                        >
                          <SelectTrigger className="h-12 border-2 border-gray-200 rounded-xl" data-testid="select-output-format">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="removed" data-testid="option-unique">Unique Lines Only</SelectItem>
                            <SelectItem value="kept" data-testid="option-duplicates">Duplicate Lines Only</SelectItem>
                            <SelectItem value="both" data-testid="option-both">Both (Separated)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-4 pt-4">
                    <Button
                      onClick={handleSampleText}
                      variant="outline"
                      className="h-14 px-8 border-2 border-blue-200 text-blue-700 hover:bg-blue-50 font-semibold text-lg rounded-xl"
                      data-testid="button-sample-text"
                    >
                      Sample Text
                    </Button>
                    <Button
                      onClick={handleClear}
                      variant="outline"
                      className="h-14 px-8 border-2 border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold text-lg rounded-xl"
                      data-testid="button-clear"
                    >
                      Clear
                    </Button>
                  </div>
                </div>

                {/* Results Section */}
                <div className="bg-gradient-to-br from-gray-50 to-blue-50 p-8 lg:p-12">
                  <h2 className="text-2xl font-bold text-gray-900 mb-8">Results</h2>
                  
                  {result ? (
                    <div className="space-y-6" data-testid="duplicate-results">
                      {/* Statistics */}
                      <div className="grid grid-cols-1 gap-4">
                        <div className="bg-white rounded-xl p-4 shadow-sm">
                          <div className="text-sm font-medium text-gray-600 mb-1">Original Lines</div>
                          <div className="text-2xl font-bold text-gray-900" data-testid="text-original-lines">
                            {result.originalLines}
                          </div>
                        </div>
                        
                        <div className="bg-white rounded-xl p-4 shadow-sm">
                          <div className="text-sm font-medium text-gray-600 mb-1">Unique Lines</div>
                          <div className="text-2xl font-bold text-green-600" data-testid="text-unique-lines">
                            {result.uniqueLines}
                          </div>
                        </div>
                        
                        <div className="bg-white rounded-xl p-4 shadow-sm">
                          <div className="text-sm font-medium text-gray-600 mb-1">Duplicates Removed</div>
                          <div className="text-2xl font-bold text-red-600" data-testid="text-duplicates-removed">
                            {result.duplicatesRemovedCount}
                          </div>
                        </div>
                      </div>

                      {/* Output Text */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <Label className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                            Processed Text
                          </Label>
                          <Button
                            onClick={handleCopyResult}
                            size="sm"
                            className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
                            data-testid="button-copy-result"
                          >
                            Copy Result
                          </Button>
                        </div>
                        <Textarea
                          value={result.processedText}
                          readOnly
                          className="min-h-[200px] text-sm bg-white border-2 border-gray-200 rounded-xl resize-none"
                          data-testid="textarea-result"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12" data-testid="no-results">
                      <div className="text-gray-400 mb-4">
                        <svg className="w-16 h-16 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 0v12h8V4H6z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <p className="text-gray-500 text-lg">Enter text to remove duplicate lines</p>
                      <p className="text-gray-400 text-sm mt-2">Results will appear here instantly</p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}