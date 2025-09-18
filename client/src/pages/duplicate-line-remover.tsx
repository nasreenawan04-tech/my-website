
import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';

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
      
      if (opts.trimWhitespace) {
        processedLine = line.trim();
      }
      
      const comparisonLine = opts.caseSensitive ? processedLine : processedLine.toLowerCase();
      
      if (!seen.has(comparisonLine)) {
        seen.add(comparisonLine);
        keptLines.push(line);
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

  useEffect(() => {
    if (inputText.trim()) {
      const result = removeDuplicateLines(inputText, options);
      setResult(result);
    } else {
      setResult(null);
    }
  }, [inputText, options]);

  const handleCopy = () => {
    if (result?.processedText) {
      navigator.clipboard.writeText(result.processedText);
    }
  };

  const handleClear = () => {
    setInputText('');
    setResult(null);
  };

  const resetTool = () => {
    setOptions({
      caseSensitive: true,
      trimWhitespace: true,
      outputFormat: 'removed'
    });
    setInputText('');
    setResult(null);
  };

  const handleSample = () => {
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
        <title>Duplicate Line Remover - Remove Duplicate Lines from Text Instantly | DapsiWow</title>
        <meta name="description" content="Free online duplicate line remover tool to clean up text by removing duplicate lines while preserving original order. Advanced options for case sensitivity, whitespace handling, and multiple output formats." />
        <meta name="keywords" content="duplicate line remover, remove duplicate lines, text cleaning tool, duplicate text remover, line deduplication, text processing, remove repeated lines, text cleaner, duplicate finder" />
        <meta property="og:title" content="Duplicate Line Remover - Remove Duplicate Lines from Text Instantly | DapsiWow" />
        <meta property="og:description" content="Professional duplicate line remover for cleaning text data. Remove duplicate lines instantly with advanced filtering options including case sensitivity and whitespace handling." />
        <meta property="og:type" content="website" />
        <meta name="robots" content="index, follow" />
        <meta name="author" content="DapsiWow" />
        <link rel="canonical" href="https://dapsiwow.com/tools/duplicate-line-remover" />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            "name": "Duplicate Line Remover",
            "description": "Professional duplicate line remover tool for cleaning text data by removing duplicate lines while preserving original order with advanced filtering options.",
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
              "Copy to clipboard functionality",
              "Batch text processing"
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
                <span className="text-xs sm:text-sm font-medium text-blue-700">Professional Text Cleaning Tool</span>
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl 2xl:text-8xl font-bold text-slate-900 leading-tight tracking-tight">
                <span className="block">Duplicate Line</span>
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 mt-1 sm:mt-2">
                  Remover
                </span>
              </h1>
              <p className="text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl text-slate-600 max-w-sm sm:max-w-lg md:max-w-2xl lg:max-w-3xl xl:max-w-4xl mx-auto leading-relaxed px-2 sm:px-0">
                Remove duplicate lines from text while preserving order and formatting with advanced filtering options
              </p>
            </div>
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-4 py-16">
          {/* Main Tool Card */}
          <Card className="bg-white/90 backdrop-blur-sm shadow-2xl border-0 rounded-3xl overflow-hidden">
            <CardContent className="p-0">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
                {/* Input Section */}
                <div className="p-8 lg:p-12 space-y-8">
                  <div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">Text Processing Settings</h2>
                    <p className="text-gray-600">Configure your duplicate line removal preferences</p>
                  </div>

                  <div className="space-y-6">
                    {/* Text Input */}
                    <div className="space-y-3">
                      <Label htmlFor="text-input" className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                        Input Text
                      </Label>
                      <Textarea
                        id="text-input"
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        className="min-h-[200px] border-2 border-gray-200 rounded-xl text-lg focus:border-blue-500 focus:ring-blue-500"
                        placeholder="Paste your text here (one item per line)..."
                        data-testid="textarea-text-input"
                      />
                    </div>

                    {/* Output Format Selection */}
                    <div className="space-y-3">
                      <Label htmlFor="output-format" className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                        Output Format
                      </Label>
                      <Select
                        value={options.outputFormat}
                        onValueChange={(value: 'removed' | 'kept' | 'both') => 
                          setOptions(prev => ({ ...prev, outputFormat: value }))
                        }
                      >
                        <SelectTrigger className="h-14 border-2 border-gray-200 rounded-xl text-lg" data-testid="select-output-format">
                          <SelectValue placeholder="Select output format" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="removed">Unique Lines Only</SelectItem>
                          <SelectItem value="kept">Duplicate Lines Only</SelectItem>
                          <SelectItem value="both">Both (Separated)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Processing Options */}
                    <div className="space-y-4 bg-gray-50 rounded-xl p-6">
                      <h3 className="text-sm font-semibold text-gray-800 uppercase tracking-wide">Processing Options</h3>
                      
                      <div className="flex items-center justify-between space-x-3">
                        <div>
                          <label htmlFor="case-sensitive" className="text-sm font-medium text-gray-700">
                            Case Sensitive
                          </label>
                          <p className="text-xs text-gray-500">Treat "Hello" and "hello" as different lines</p>
                        </div>
                        <Switch
                          id="case-sensitive"
                          checked={options.caseSensitive}
                          onCheckedChange={(checked) => setOptions(prev => ({ ...prev, caseSensitive: checked }))}
                          data-testid="switch-case-sensitive"
                        />
                      </div>

                      <div className="flex items-center justify-between space-x-3">
                        <div>
                          <label htmlFor="trim-whitespace" className="text-sm font-medium text-gray-700">
                            Trim Whitespace
                          </label>
                          <p className="text-xs text-gray-500">Remove leading and trailing spaces before comparison</p>
                        </div>
                        <Switch
                          id="trim-whitespace"
                          checked={options.trimWhitespace}
                          onCheckedChange={(checked) => setOptions(prev => ({ ...prev, trimWhitespace: checked }))}
                          data-testid="switch-trim-whitespace"
                        />
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4 pt-6">
                      <Button
                        onClick={handleSample}
                        className="flex-1 h-14 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold text-lg rounded-xl shadow-lg transform transition-all duration-200 hover:scale-105"
                        data-testid="button-sample"
                      >
                        Load Sample
                      </Button>
                      <Button
                        onClick={resetTool}
                        variant="outline"
                        className="h-14 px-8 border-2 border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold text-lg rounded-xl"
                        data-testid="button-reset"
                      >
                        Reset
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Results Section */}
                <div className="bg-gradient-to-br from-gray-50 to-blue-50 p-8 lg:p-12">
                  <h2 className="text-2xl font-bold text-gray-900 mb-8">Processing Results</h2>

                  {result ? (
                    <div className="space-y-6" data-testid="duplicate-results">
                      {/* Processed Text Display */}
                      <div className="bg-white rounded-2xl p-6 shadow-lg border border-blue-100">
                        <textarea
                          value={result.processedText}
                          readOnly
                          className="w-full h-64 lg:h-80 p-4 text-base border-0 resize-none focus:outline-none bg-transparent text-gray-800 leading-relaxed"
                          placeholder="Processed text will appear here..."
                          data-testid="textarea-result"
                        />
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-col sm:flex-row gap-4">
                        <Button
                          onClick={handleCopy}
                          className="flex-1 h-12 bg-green-600 hover:bg-green-700 text-white font-medium rounded-xl"
                          data-testid="button-copy-result"
                        >
                          Copy Result
                        </Button>
                        <Button
                          onClick={handleClear}
                          variant="outline"
                          className="flex-1 h-12 border-2 border-gray-300 text-gray-700 hover:bg-gray-50 font-medium rounded-xl"
                          data-testid="button-clear"
                        >
                          Clear
                        </Button>
                      </div>

                      {/* Processing Statistics */}
                      <div className="bg-white rounded-xl p-6 shadow-sm" data-testid="text-statistics">
                        <h3 className="font-bold text-gray-900 mb-4 text-lg">Processing Statistics</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          <div className="bg-blue-50 rounded-lg p-4 text-center">
                            <div className="text-2xl font-bold text-blue-600" data-testid="text-original-lines">
                              {result.originalLines.toLocaleString()}
                            </div>
                            <div className="text-sm text-blue-700 font-medium">Original Lines</div>
                          </div>
                          <div className="bg-green-50 rounded-lg p-4 text-center">
                            <div className="text-2xl font-bold text-green-600" data-testid="text-unique-lines">
                              {result.uniqueLines.toLocaleString()}
                            </div>
                            <div className="text-sm text-green-700 font-medium">Unique Lines</div>
                          </div>
                          <div className="bg-red-50 rounded-lg p-4 text-center">
                            <div className="text-2xl font-bold text-red-600" data-testid="text-duplicates-removed">
                              {result.duplicatesRemovedCount.toLocaleString()}
                            </div>
                            <div className="text-sm text-red-700 font-medium">Duplicates Removed</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-16" data-testid="no-results">
                      <div className="w-20 h-20 bg-gray-200 rounded-full mx-auto mb-6 flex items-center justify-center">
                        <div className="text-3xl font-bold text-gray-400">⧉</div>
                      </div>
                      <p className="text-gray-500 text-lg">Configure settings and add text to remove duplicates</p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Comprehensive SEO Content Section */}
          <div className="mt-16 grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">What is a Duplicate Line Remover?</h3>
                <div className="space-y-4 text-gray-600">
                  <p>
                    A duplicate line remover is a powerful text processing tool designed to identify and eliminate 
                    duplicate lines from text data while preserving the original order of unique content. This essential 
                    utility is widely used by developers, data analysts, content creators, and anyone working with 
                    large text datasets that may contain repetitive information.
                  </p>
                  <p>
                    Our advanced duplicate line remover offers sophisticated filtering options including case sensitivity 
                    control, whitespace trimming, and multiple output formats. Whether you're cleaning CSV files, 
                    removing duplicate URLs, or organizing lists, this tool provides precise control over the 
                    deduplication process.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Why Use Our Duplicate Line Remover?</h3>
                <div className="space-y-4 text-gray-600">
                  <p>
                    Duplicate lines in text data can significantly impact data quality, analysis accuracy, and storage 
                    efficiency. Our duplicate line remover helps maintain data integrity by providing clean, 
                    deduplicated text that improves processing speed and reduces file sizes while preserving 
                    essential information structure.
                  </p>
                  <ul className="space-y-2 list-disc list-inside">
                    <li>Real-time processing with instant results</li>
                    <li>Advanced case sensitivity and whitespace handling</li>
                    <li>Multiple output format options for different needs</li>
                    <li>Preserves original line order for consistent data structure</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Advanced Processing Features</h3>
                <div className="space-y-3 text-gray-600">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Case-sensitive duplicate detection for precise control</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Automatic whitespace trimming and normalization</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Flexible output formats: unique lines, duplicates, or both</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Preserves original line order and formatting</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Comprehensive processing statistics and analytics</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Professional Use Cases</h3>
                <div className="space-y-3 text-gray-600">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Data cleaning and preprocessing for analysis</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>CSV file deduplication and optimization</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>URL list cleaning and web scraping data processing</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Email list management and marketing campaigns</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Code review and documentation maintenance</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Detailed SEO Content Sections */}
          <div className="mt-12 space-y-8">
            {/* How to Use Guide */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">How to Use the Duplicate Line Remover</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-gray-800">Step-by-Step Process</h4>
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-semibold">1</div>
                        <p className="text-gray-600">Paste or type your text into the input area, with each item on a separate line</p>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-semibold">2</div>
                        <p className="text-gray-600">Choose your preferred output format: unique lines only, duplicates only, or both separated</p>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-semibold">3</div>
                        <p className="text-gray-600">Configure processing options for case sensitivity and whitespace handling</p>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-semibold">4</div>
                        <p className="text-gray-600">View instant results and copy the processed text for use in your projects</p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-gray-800">Best Practices</h4>
                    <ul className="space-y-2 text-gray-600 list-disc list-inside">
                      <li>Use case-sensitive mode when working with programming code or technical documentation</li>
                      <li>Enable whitespace trimming for general text processing and data cleaning</li>
                      <li>Choose "both" output format when you need to review what duplicates were removed</li>
                      <li>Process large files in smaller chunks for optimal performance</li>
                      <li>Always backup your original data before processing</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Processing Options Explained */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
                <CardContent className="p-8">
                  <h3 className="text-xl font-bold text-gray-900 mb-6">Case Sensitivity</h3>
                  <div className="space-y-4 text-gray-600">
                    <p className="text-sm">
                      Controls whether the tool treats lines with different capitalization as unique or duplicate. 
                      Essential for maintaining data accuracy in specific contexts.
                    </p>
                    <div className="space-y-2">
                      <h4 className="font-semibold text-green-800 text-sm">When to Enable:</h4>
                      <ul className="text-xs space-y-1 list-disc list-inside text-green-700">
                        <li>Processing programming code</li>
                        <li>Working with case-sensitive identifiers</li>
                        <li>Technical documentation</li>
                        <li>Database field values</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
                <CardContent className="p-8">
                  <h3 className="text-xl font-bold text-gray-900 mb-6">Whitespace Trimming</h3>
                  <div className="space-y-4 text-gray-600">
                    <p className="text-sm">
                      Removes leading and trailing spaces before comparing lines, ensuring that formatting 
                      inconsistencies don't prevent proper duplicate detection.
                    </p>
                    <div className="space-y-2">
                      <h4 className="font-semibold text-blue-800 text-sm">Benefits Include:</h4>
                      <ul className="text-xs space-y-1 list-disc list-inside text-blue-700">
                        <li>Normalizes inconsistent spacing</li>
                        <li>Improves duplicate detection accuracy</li>
                        <li>Handles copy-paste formatting issues</li>
                        <li>Cleans messy data imports</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
                <CardContent className="p-8">
                  <h3 className="text-xl font-bold text-gray-900 mb-6">Output Formats</h3>
                  <div className="space-y-4 text-gray-600">
                    <p className="text-sm">
                      Choose how you want to view the processing results: cleaned unique lines, 
                      identified duplicates, or both for comprehensive analysis.
                    </p>
                    <div className="space-y-2">
                      <h4 className="font-semibold text-purple-800 text-sm">Format Options:</h4>
                      <ul className="text-xs space-y-1 list-disc list-inside text-purple-700">
                        <li>Unique lines only (default)</li>
                        <li>Duplicate lines only</li>
                        <li>Both sections separated</li>
                        <li>Preserves original formatting</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Professional Applications */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Professional Applications by Industry</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="space-y-4 text-gray-600">
                    <h4 className="font-semibold text-gray-800 mb-2">Data Science & Analytics</h4>
                    <p className="text-sm">
                      Data scientists and analysts use duplicate line removers to clean datasets before analysis, 
                      ensuring statistical accuracy and preventing skewed results caused by duplicate entries. 
                      Essential for preprocessing survey data, customer lists, and experimental datasets where 
                      duplicate entries can significantly impact analytical outcomes.
                    </p>
                    <h4 className="font-semibold text-gray-800 mb-2">Web Development & SEO</h4>
                    <p className="text-sm">
                      Web developers and SEO professionals rely on duplicate line removal for cleaning URL lists, 
                      removing duplicate meta tags, and optimizing sitemaps. This tool helps maintain clean code 
                      documentation, deduplicate CSS classes, and process large lists of keywords or URLs for 
                      comprehensive website optimization strategies.
                    </p>
                  </div>
                  <div className="space-y-4 text-gray-600">
                    <h4 className="font-semibold text-gray-800 mb-2">Content Management & Marketing</h4>
                    <p className="text-sm">
                      Content managers and digital marketers use duplicate line removers to clean email lists, 
                      remove duplicate social media handles, and optimize content databases. This ensures higher 
                      engagement rates, reduces bounce rates, and maintains professional communication standards 
                      across all marketing channels.
                    </p>
                    <h4 className="font-semibold text-gray-800 mb-2">Database Administration</h4>
                    <p className="text-sm">
                      Database administrators utilize duplicate line removal for data import preparation, ensuring 
                      referential integrity and optimizing storage efficiency. Critical for maintaining clean 
                      lookup tables, removing duplicate configuration entries, and preparing data migrations 
                      while preserving database performance and consistency.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* FAQ Section */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Frequently Asked Questions</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">How does the duplicate line remover work?</h4>
                      <p className="text-gray-600 text-sm">
                        Our tool analyzes each line of text, comparing it against all previous lines to identify 
                        duplicates. It uses advanced string comparison algorithms that can handle case sensitivity 
                        and whitespace normalization, ensuring accurate duplicate detection while preserving the 
                        original order of unique lines.
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">What's the difference between case-sensitive and case-insensitive mode?</h4>
                      <p className="text-gray-600 text-sm">
                        Case-sensitive mode treats "Hello" and "hello" as different lines, while case-insensitive 
                        mode considers them duplicates. Use case-sensitive mode for programming code or technical 
                        data where capitalization matters, and case-insensitive mode for general text processing.
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">Can I process large files with this tool?</h4>
                      <p className="text-gray-600 text-sm">
                        Yes, our duplicate line remover can handle large text files efficiently. For optimal 
                        performance with very large datasets (over 100,000 lines), consider processing the data 
                        in smaller chunks or using our batch processing features for enterprise-level data cleaning.
                      </p>
                    </div>
                  </div>
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">Does the tool preserve the original line order?</h4>
                      <p className="text-gray-600 text-sm">
                        Absolutely. Our duplicate line remover maintains the original order of unique lines, 
                        removing only the subsequent duplicates. This ensures data integrity and preserves any 
                        chronological or logical ordering that may be important for your specific use case.
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">What output formats are available?</h4>
                      <p className="text-gray-600 text-sm">
                        You can choose from three output formats: unique lines only (default), duplicate lines only 
                        (for review purposes), or both sections separated. This flexibility allows you to either 
                        get clean data immediately or analyze what duplicates were found for quality assurance.
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">Is this duplicate line remover free to use?</h4>
                      <p className="text-gray-600 text-sm">
                        Yes, our duplicate line remover is completely free with no registration required. You can 
                        process unlimited text data for all your personal, educational, and professional projects 
                        without any restrictions or hidden costs.
                      </p>
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
}
