import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';

interface DiffResult {
  added: string[];
  removed: string[];
  unchanged: string[];
  changes: {
    line: number;
    type: 'added' | 'removed' | 'changed';
    oldText?: string;
    newText?: string;
  }[];
  stats: {
    addedLines: number;
    removedLines: number;
    changedLines: number;
    unchangedLines: number;
  };
}

interface DiffOptions {
  ignoreCase: boolean;
  ignoreWhitespace: boolean;
  wordLevel: boolean;
}

export default function TextDiffChecker() {
  const [text1, setText1] = useState('');
  const [text2, setText2] = useState('');
  const [result, setResult] = useState<DiffResult | null>(null);
  const [options, setOptions] = useState<DiffOptions>({
    ignoreCase: false,
    ignoreWhitespace: false,
    wordLevel: false
  });

  const calculateDiff = (originalText: string, newText: string, opts: DiffOptions): DiffResult => {
    if (originalText.trim() === '' && newText.trim() === '') {
      return {
        added: [],
        removed: [],
        unchanged: [],
        changes: [],
        stats: {
          addedLines: 0,
          removedLines: 0,
          changedLines: 0,
          unchangedLines: 0
        }
      };
    }

    let processedText1 = originalText;
    let processedText2 = newText;

    // Apply preprocessing based on options
    if (opts.ignoreCase) {
      processedText1 = processedText1.toLowerCase();
      processedText2 = processedText2.toLowerCase();
    }

    if (opts.ignoreWhitespace) {
      // Normalize spaces and tabs but preserve line breaks
      processedText1 = processedText1.replace(/[ \t]+/g, ' ').replace(/[ \t]*\n[ \t]*/g, '\n').trim();
      processedText2 = processedText2.replace(/[ \t]+/g, ' ').replace(/[ \t]*\n[ \t]*/g, '\n').trim();
    }

    // Split into lines or words based on options
    const splitText = (text: string) => {
      if (opts.wordLevel) {
        return text.split(/\s+/).filter(word => word.length > 0);
      }
      return text.split('\n');
    };

    const lines1 = splitText(processedText1);
    const lines2 = splitText(processedText2);

    // Improved diff algorithm using Longest Common Subsequence approach
    const added: string[] = [];
    const removed: string[] = [];
    const unchanged: string[] = [];
    const changes: { line: number; type: 'added' | 'removed' | 'changed'; oldText?: string; newText?: string; }[] = [];

    // Build LCS matrix for better diff detection
    const lcs = (arr1: string[], arr2: string[]): number[][] => {
      const matrix: number[][] = Array(arr1.length + 1).fill(null).map(() => Array(arr2.length + 1).fill(0));
      
      for (let i = 1; i <= arr1.length; i++) {
        for (let j = 1; j <= arr2.length; j++) {
          if (arr1[i - 1] === arr2[j - 1]) {
            matrix[i][j] = matrix[i - 1][j - 1] + 1;
          } else {
            matrix[i][j] = Math.max(matrix[i - 1][j], matrix[i][j - 1]);
          }
        }
      }
      return matrix;
    };

    // Get diff operations
    const getDiff = (arr1: string[], arr2: string[]) => {
      const matrix = lcs(arr1, arr2);
      const diffs: { type: 'added' | 'removed' | 'unchanged'; line: string; index1?: number; index2?: number }[] = [];
      
      let i = arr1.length;
      let j = arr2.length;
      
      while (i > 0 || j > 0) {
        if (i > 0 && j > 0 && arr1[i - 1] === arr2[j - 1]) {
          diffs.unshift({ type: 'unchanged', line: arr1[i - 1], index1: i - 1, index2: j - 1 });
          i--;
          j--;
        } else if (j > 0 && (i === 0 || matrix[i][j - 1] >= matrix[i - 1][j])) {
          diffs.unshift({ type: 'added', line: arr2[j - 1], index2: j - 1 });
          j--;
        } else if (i > 0) {
          diffs.unshift({ type: 'removed', line: arr1[i - 1], index1: i - 1 });
          i--;
        }
      }
      
      return diffs;
    };

    const diffResults = getDiff(lines1, lines2);
    
    diffResults.forEach((diff, index) => {
      switch (diff.type) {
        case 'added':
          added.push(diff.line);
          changes.push({
            line: (diff.index2 || 0) + 1,
            type: 'added',
            newText: diff.line
          });
          break;
        case 'removed':
          removed.push(diff.line);
          changes.push({
            line: (diff.index1 || 0) + 1,
            type: 'removed',
            oldText: diff.line
          });
          break;
        case 'unchanged':
          unchanged.push(diff.line);
          break;
      }
    });

    // Calculate statistics
    const stats = {
      addedLines: added.length,
      removedLines: removed.length,
      changedLines: added.length + removed.length, // Changed lines = total modifications
      unchangedLines: unchanged.length
    };

    return {
      added,
      removed,
      unchanged,
      changes,
      stats
    };
  };

  // Real-time diff calculation as user types
  useEffect(() => {
    const result = calculateDiff(text1, text2, options);
    setResult(result);
  }, [text1, text2, options]);

  const handleClear = () => {
    setText1('');
    setText2('');
  };

  const handleSwap = () => {
    const temp = text1;
    setText1(text2);
    setText2(temp);
  };

  const handleCopyDiff = () => {
    if (result) {
      let diffReport = `Text Diff Report:\n\n`;
      diffReport += `Statistics:\n`;
      diffReport += `- Added lines: ${result.stats.addedLines}\n`;
      diffReport += `- Removed lines: ${result.stats.removedLines}\n`;
      diffReport += `- Unchanged lines: ${result.stats.unchangedLines}\n\n`;
      
      if (result.added.length > 0) {
        diffReport += `Added Lines:\n`;
        result.added.forEach(line => diffReport += `+ ${line}\n`);
        diffReport += '\n';
      }
      
      if (result.removed.length > 0) {
        diffReport += `Removed Lines:\n`;
        result.removed.forEach(line => diffReport += `- ${line}\n`);
        diffReport += '\n';
      }

      navigator.clipboard.writeText(diffReport);
    }
  };

  const handleSampleTexts = () => {
    setText1(`Welcome to DapsiWow's Text Diff Checker!
This is the first version of the document.
It contains some content that will be modified.
This line will remain unchanged.
Another line that stays the same.
This paragraph talks about features.
Final line in original document.`);
    
    setText2(`Welcome to DapsiWow's Advanced Text Diff Checker!
This is the updated version of the document.
It contains enhanced content with improvements.
This line will remain unchanged.
Another line that stays the same.
This paragraph discusses advanced features and capabilities.
Additional content has been added here.
Final line in updated document.`);
  };

  const updateOption = (key: keyof DiffOptions, value: boolean) => {
    setOptions(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Helmet>
        <title>Text Diff Checker - Compare Two Texts & Highlight Differences | DapsiWow</title>
        <meta name="description" content="Free online text diff checker tool to compare two texts side-by-side and highlight differences. Perfect for content comparison, document versioning, and change tracking with detailed statistics." />
        <meta name="keywords" content="text diff checker, text comparison tool, compare texts, text differences, document comparison, version control, change tracking, text analyzer, side-by-side comparison, content diff" />
        <meta property="og:title" content="Text Diff Checker - Compare Two Texts & Highlight Differences" />
        <meta property="og:description" content="Professional text diff checker tool for comparing documents and tracking changes. Features side-by-side comparison with detailed statistics and highlighting." />
        <meta property="og:type" content="website" />
        <meta name="robots" content="index, follow" />
        <meta name="author" content="DapsiWow" />
        <link rel="canonical" href="https://dapsiwow.com/tools/text-diff-checker" />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            "name": "Text Diff Checker",
            "description": "Free online tool to compare two texts and highlight differences with side-by-side comparison, change statistics, and advanced filtering options.",
            "url": "https://dapsiwow.com/tools/text-diff-checker",
            "applicationCategory": "ProductivityApplication",
            "operatingSystem": "Any",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "USD"
            },
            "featureList": [
              "Side-by-side text comparison",
              "Highlight added and removed content",
              "Detailed change statistics",
              "Case-insensitive comparison option",
              "Whitespace ignoring option",
              "Word-level comparison mode",
              "Copy diff report functionality"
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
                <span className="text-xs sm:text-sm font-medium text-blue-700">Advanced Text Comparison</span>
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl 2xl:text-8xl font-bold text-slate-900 leading-tight tracking-tight">
                <span className="block">Text Diff</span>
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 mt-1 sm:mt-2">
                  Checker
                </span>
              </h1>
              <p className="text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl text-slate-600 max-w-sm sm:max-w-lg md:max-w-2xl lg:max-w-3xl xl:max-w-4xl mx-auto leading-relaxed px-2 sm:px-0">
                Compare two texts side-by-side and highlight differences with detailed change tracking and statistics
              </p>
            </div>
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-4 py-16">
          {/* Main Calculator Card */}
          <Card className="bg-white/90 backdrop-blur-sm shadow-2xl border-0 rounded-3xl overflow-hidden">
            <CardContent className="p-0">
              <div className="flex flex-col">
                {/* Input Section */}
                <div className="p-8 lg:p-12 space-y-8">
                  <div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">Text Comparison</h2>
                    <p className="text-gray-600">Enter two texts to compare and see the differences highlighted</p>
                  </div>

                  {/* Comparison Options */}
                  <div className="bg-gray-50 rounded-xl p-6 space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900">Comparison Options</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="flex items-center justify-between gap-2">
                        <div className="space-y-1">
                          <Label className="text-sm font-medium">Ignore Case</Label>
                          <p className="text-xs text-gray-500">Case-insensitive comparison</p>
                        </div>
                        <Switch
                          checked={options.ignoreCase}
                          onCheckedChange={(value) => updateOption('ignoreCase', value)}
                          data-testid="switch-ignore-case"
                        />
                      </div>

                      <div className="flex items-center justify-between gap-2">
                        <div className="space-y-1">
                          <Label className="text-sm font-medium">Ignore Whitespace</Label>
                          <p className="text-xs text-gray-500">Normalize spaces and tabs</p>
                        </div>
                        <Switch
                          checked={options.ignoreWhitespace}
                          onCheckedChange={(value) => updateOption('ignoreWhitespace', value)}
                          data-testid="switch-ignore-whitespace"
                        />
                      </div>

                      <div className="flex items-center justify-between gap-2">
                        <div className="space-y-1">
                          <Label className="text-sm font-medium">Word Level</Label>
                          <p className="text-xs text-gray-500">Compare words instead of lines</p>
                        </div>
                        <Switch
                          checked={options.wordLevel}
                          onCheckedChange={(value) => updateOption('wordLevel', value)}
                          data-testid="switch-word-level"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Text Areas */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <Label htmlFor="text1" className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                        Original Text (Text 1)
                      </Label>
                      <Textarea
                        id="text1"
                        value={text1}
                        onChange={(e) => setText1(e.target.value)}
                        className="min-h-[300px] lg:min-h-[400px] text-base border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-blue-500 resize-none"
                        placeholder="Paste your original text here..."
                        data-testid="textarea-text1"
                      />
                    </div>

                    <div className="space-y-4">
                      <Label htmlFor="text2" className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                        Modified Text (Text 2)
                      </Label>
                      <Textarea
                        id="text2"
                        value={text2}
                        onChange={(e) => setText2(e.target.value)}
                        className="min-h-[300px] lg:min-h-[400px] text-base border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-blue-500 resize-none"
                        placeholder="Paste your modified text here..."
                        data-testid="textarea-text2"
                      />
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-4 pt-6">
                    <Button
                      onClick={handleSampleTexts}
                      className="flex-1 h-14 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold text-lg rounded-xl shadow-lg transform transition-all duration-200 hover:scale-105"
                      data-testid="button-sample-texts"
                    >
                      Load Sample Texts
                    </Button>
                    <Button
                      onClick={handleSwap}
                      variant="outline"
                      className="h-14 px-8 border-2 border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold text-lg rounded-xl"
                      data-testid="button-swap-texts"
                    >
                      Swap Texts
                    </Button>
                    <Button
                      onClick={handleClear}
                      variant="outline"
                      className="h-14 px-8 border-2 border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold text-lg rounded-xl"
                      data-testid="button-clear-texts"
                    >
                      Clear All
                    </Button>
                    <Button
                      onClick={handleCopyDiff}
                      variant="outline"
                      className="h-14 px-8 border-2 border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold text-lg rounded-xl"
                      disabled={!result || (result.stats.addedLines === 0 && result.stats.removedLines === 0)}
                      data-testid="button-copy-diff"
                    >
                      Copy Diff Report
                    </Button>
                  </div>
                </div>

                {/* Results Section */}
                <div className="bg-gradient-to-br from-gray-50 to-blue-50 p-8 lg:p-12 border-t">
                  <h2 className="text-2xl font-bold text-gray-900 mb-8">Comparison Results</h2>

                  {result && (text1 || text2) ? (
                    <div className="space-y-6" data-testid="diff-results">
                      {/* Statistics */}
                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="bg-white rounded-xl p-4 shadow-sm border border-green-200">
                          <div className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-1">Added</div>
                          <div className="text-2xl font-bold text-green-600" data-testid="stat-added-lines">
                            {result.stats.addedLines}
                          </div>
                          <div className="text-xs text-gray-500">lines</div>
                        </div>
                        <div className="bg-white rounded-xl p-4 shadow-sm border border-red-200">
                          <div className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-1">Removed</div>
                          <div className="text-2xl font-bold text-red-600" data-testid="stat-removed-lines">
                            {result.stats.removedLines}
                          </div>
                          <div className="text-xs text-gray-500">lines</div>
                        </div>
                        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
                          <div className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-1">Unchanged</div>
                          <div className="text-2xl font-bold text-gray-600" data-testid="stat-unchanged-lines">
                            {result.stats.unchangedLines}
                          </div>
                          <div className="text-xs text-gray-500">lines</div>
                        </div>
                        <div className="bg-white rounded-xl p-4 shadow-sm border border-blue-200">
                          <div className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-1">Total Changes</div>
                          <div className="text-2xl font-bold text-blue-600" data-testid="stat-total-changes">
                            {result.stats.addedLines + result.stats.removedLines}
                          </div>
                          <div className="text-xs text-gray-500">lines</div>
                        </div>
                      </div>

                      {/* Changes Display */}
                      {result.changes.length > 0 && (
                        <div className="bg-white rounded-xl p-6 shadow-sm">
                          <h3 className="text-lg font-semibold text-gray-900 mb-4">Changes Detail</h3>
                          <div className="space-y-2 max-h-96 overflow-y-auto">
                            {result.added.map((line, index) => (
                              <div key={`added-${index}`} className="flex items-start gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
                                <Badge variant="outline" className="bg-green-100 text-green-700 border-green-300 flex-shrink-0">
                                  +
                                </Badge>
                                <span className="text-gray-800 break-all" data-testid={`added-line-${index}`}>{line}</span>
                              </div>
                            ))}
                            {result.removed.map((line, index) => (
                              <div key={`removed-${index}`} className="flex items-start gap-3 p-3 bg-red-50 rounded-lg border border-red-200">
                                <Badge variant="outline" className="bg-red-100 text-red-700 border-red-300 flex-shrink-0">
                                  -
                                </Badge>
                                <span className="text-gray-800 break-all" data-testid={`removed-line-${index}`}>{line}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* No Changes Message */}
                      {result.changes.length === 0 && text1 && text2 && (
                        <div className="bg-white rounded-xl p-8 shadow-sm text-center">
                          <div className="w-16 h-16 bg-green-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                            <div className="text-2xl font-bold text-green-600">✓</div>
                          </div>
                          <p className="text-gray-600 text-lg">No differences found between the two texts</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-16" data-testid="no-results">
                      <div className="w-20 h-20 bg-gray-200 rounded-full mx-auto mb-6 flex items-center justify-center">
                        <div className="text-3xl font-bold text-gray-400">⇄</div>
                      </div>
                      <p className="text-gray-500 text-lg">Enter text in both fields above to see the differences</p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Content Sections */}
          <div className="mt-16 space-y-12">
            {/* What is Text Diff Checker */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-6">What is a Text Diff Checker?</h2>
                <div className="prose max-w-none text-gray-700 space-y-4">
                  <p className="text-lg leading-relaxed">
                    A <strong>text diff checker</strong> is a powerful tool that compares two pieces of text and highlights
                    the differences between them. This essential utility is widely used in software development, content
                    management, document versioning, and quality assurance to identify changes, additions, and deletions
                    between different versions of text content.
                  </p>

                  <p className="leading-relaxed">
                    Our advanced text diff checker provides side-by-side comparison with detailed statistics, showing
                    exactly what content has been added, removed, or modified. The tool offers various comparison modes
                    including case-insensitive comparison, whitespace normalization, and word-level analysis, making it
                    suitable for different types of content analysis needs.
                  </p>

                  <p className="leading-relaxed">
                    The diff checker is particularly valuable for writers comparing document versions, developers
                    reviewing code changes, editors tracking content modifications, and anyone who needs to understand
                    the specific differences between two pieces of text. The visual highlighting and comprehensive
                    statistics make it easy to quickly identify and understand all changes between versions.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Use Cases */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Common Use Cases</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
                    <h3 className="font-bold text-blue-800 mb-4 text-lg">Document Versioning</h3>
                    <p className="text-blue-700">Compare different versions of documents, contracts, or articles to track changes and revisions over time.</p>
                  </div>

                  <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-xl p-6 border border-green-200">
                    <h3 className="font-bold text-green-800 mb-4 text-lg">Content Review</h3>
                    <p className="text-green-700">Review edits and modifications in content, ensuring all changes are intentional and properly implemented.</p>
                  </div>

                  <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl p-6 border border-purple-200">
                    <h3 className="font-bold text-purple-800 mb-4 text-lg">Code Comparison</h3>
                    <p className="text-purple-700">Compare code snippets, configuration files, or scripts to identify changes and potential issues.</p>
                  </div>

                  <div className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-xl p-6 border border-orange-200">
                    <h3 className="font-bold text-orange-800 mb-4 text-lg">Quality Assurance</h3>
                    <p className="text-orange-700">Verify that content updates match specifications and identify any unintended changes.</p>
                  </div>

                  <div className="bg-gradient-to-r from-pink-50 to-pink-100 rounded-xl p-6 border border-pink-200">
                    <h3 className="font-bold text-pink-800 mb-4 text-lg">Translation Review</h3>
                    <p className="text-pink-700">Compare original and translated text to ensure accuracy and completeness of translations.</p>
                  </div>

                  <div className="bg-gradient-to-r from-teal-50 to-teal-100 rounded-xl p-6 border border-teal-200">
                    <h3 className="font-bold text-teal-800 mb-4 text-lg">Legal Documents</h3>
                    <p className="text-teal-700">Compare contracts, agreements, or legal documents to identify modifications and amendments.</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Features and Tips */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Features and Tips</h2>
                <div className="space-y-6">
                  <div className="bg-gradient-to-r from-indigo-50 to-indigo-100 rounded-xl p-6 border border-indigo-200">
                    <h3 className="font-bold text-indigo-800 mb-4 text-lg">Advanced Comparison Options</h3>
                    <ul className="space-y-2 text-indigo-700">
                      <li>• <strong>Case Insensitive:</strong> Ignore letter case when comparing text</li>
                      <li>• <strong>Ignore Whitespace:</strong> Normalize spaces and tabs for cleaner comparison</li>
                      <li>• <strong>Word Level:</strong> Compare individual words instead of entire lines</li>
                      <li>• <strong>Detailed Statistics:</strong> Get comprehensive metrics on changes</li>
                    </ul>
                  </div>

                  <div className="bg-gradient-to-r from-emerald-50 to-emerald-100 rounded-xl p-6 border border-emerald-200">
                    <h3 className="font-bold text-emerald-800 mb-4 text-lg">Best Practices</h3>
                    <ul className="space-y-2 text-emerald-700">
                      <li>• Use meaningful text labels when comparing multiple versions</li>
                      <li>• Enable whitespace ignoring for formatted text comparison</li>
                      <li>• Use word-level comparison for precise content analysis</li>
                      <li>• Copy diff reports for documentation and review purposes</li>
                    </ul>
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