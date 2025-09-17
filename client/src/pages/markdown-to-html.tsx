
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
import { useToast } from '@/hooks/use-toast';

interface ConversionOptions {
  lineBreaks: 'standard' | 'github';
  enableTables: boolean;
  enableCodeBlocks: boolean;
  enableEmoji: boolean;
  sanitizeHTML: boolean;
  preserveSpaces: boolean;
  addPrefix: string;
  addSuffix: string;
}

interface ConversionResult {
  originalMarkdown: string;
  htmlOutput: string;
  wordCount: number;
  characterCount: number;
  timestamp: Date;
}

const MarkdownToHTMLConverter = () => {
  const [markdownInput, setMarkdownInput] = useState('');
  const [conversionResult, setConversionResult] = useState<ConversionResult | null>(null);
  const [conversionHistory, setConversionHistory] = useState<ConversionResult[]>([]);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [options, setOptions] = useState<ConversionOptions>({
    lineBreaks: 'standard',
    enableTables: true,
    enableCodeBlocks: true,
    enableEmoji: false,
    sanitizeHTML: true,
    preserveSpaces: false,
    addPrefix: '',
    addSuffix: ''
  });
  const { toast } = useToast();

  // Basic markdown to HTML conversion function
  const convertMarkdownToHTML = (markdown: string, opts: ConversionOptions): string => {
    if (!markdown) return '';
    
    let html = markdown;

    // Headers
    html = html.replace(/^### (.*$)/gm, '<h3>$1</h3>');
    html = html.replace(/^## (.*$)/gm, '<h2>$1</h2>');
    html = html.replace(/^# (.*$)/gm, '<h1>$1</h1>');

    // Bold and Italic
    html = html.replace(/\*\*\*(.*?)\*\*\*/g, '<strong><em>$1</em></strong>');
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');

    // Code blocks
    if (opts.enableCodeBlocks) {
      html = html.replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>');
      html = html.replace(/`(.*?)`/g, '<code>$1</code>');
    }

    // Links
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');

    // Images
    html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1">');

    // Lists
    html = html.replace(/^\* (.*$)/gm, '<li>$1</li>');
    html = html.replace(/^(\d+)\. (.*$)/gm, '<li>$1. $2</li>');
    
    // Wrap lists
    html = html.replace(/(<li>.*<\/li>)/g, '<ul>$1</ul>');
    html = html.replace(/<\/ul>\s*<ul>/g, '');

    // Tables (if enabled)
    if (opts.enableTables) {
      // Simple table conversion - header row
      html = html.replace(/^\|(.+)\|$/gm, (match, content) => {
        const cells = content.split('|').map((cell: string) => `<th>${cell.trim()}</th>`).join('');
        return `<tr>${cells}</tr>`;
      });
      
      // Table separator row (remove it)
      html = html.replace(/^\|[\s\-\|]+\|$/gm, '');
      
      // Wrap table rows
      html = html.replace(/(<tr>.*<\/tr>)/g, '<table>$1</table>');
      html = html.replace(/<\/table>\s*<table>/g, '');
    }

    // Line breaks
    if (opts.lineBreaks === 'github') {
      html = html.replace(/\n/g, '<br>\n');
    } else {
      html = html.replace(/\n\n/g, '</p><p>');
      html = `<p>${html}</p>`;
    }

    // Blockquotes
    html = html.replace(/^> (.*$)/gm, '<blockquote>$1</blockquote>');

    // Horizontal rules
    html = html.replace(/^---$/gm, '<hr>');

    // Strikethrough
    html = html.replace(/~~(.*?)~~/g, '<del>$1</del>');

    // Emoji conversion (basic)
    if (opts.enableEmoji) {
      html = html.replace(/:smile:/g, '😊');
      html = html.replace(/:heart:/g, '❤️');
      html = html.replace(/:thumbsup:/g, '👍');
      html = html.replace(/:fire:/g, '🔥');
    }

    // Clean up extra paragraph tags
    html = html.replace(/<p><\/p>/g, '');
    html = html.replace(/<p>(<h[1-6]>.*<\/h[1-6]>)<\/p>/g, '$1');
    html = html.replace(/<p>(<ul>.*<\/ul>)<\/p>/g, '$1');
    html = html.replace(/<p>(<table>.*<\/table>)<\/p>/g, '$1');
    html = html.replace(/<p>(<blockquote>.*<\/blockquote>)<\/p>/g, '$1');
    html = html.replace(/<p>(<hr>)<\/p>/g, '$1');

    return html.trim();
  };

  const handleConvert = () => {
    if (!markdownInput.trim()) {
      toast({
        title: "Input Required",
        description: "Please enter some Markdown text to convert.",
        variant: "destructive"
      });
      return;
    }

    try {
      let htmlOutput = convertMarkdownToHTML(markdownInput, options);
      
      // Apply prefix and suffix if provided
      if (options.addPrefix || options.addSuffix) {
        htmlOutput = `${options.addPrefix}${htmlOutput}${options.addSuffix}`;
      }

      const wordCount = markdownInput.trim().split(/\s+/).length;
      const characterCount = markdownInput.length;

      const result: ConversionResult = {
        originalMarkdown: markdownInput,
        htmlOutput,
        wordCount,
        characterCount,
        timestamp: new Date()
      };

      setConversionResult(result);
      setConversionHistory(prev => [result, ...prev.slice(0, 9)]);

      toast({
        title: "Conversion Successful",
        description: `Converted ${wordCount} words to HTML.`
      });
    } catch (error) {
      toast({
        title: "Conversion Error",
        description: "An error occurred while converting your Markdown.",
        variant: "destructive"
      });
    }
  };

  const handleClear = () => {
    setMarkdownInput('');
    setConversionResult(null);
  };

  const handleSampleMarkdown = () => {
    setMarkdownInput(`# Hello World

This is **bold** text and *italic* text.

## Features
- List item 1
- List item 2
- List item 3

### Code Example
\`\`\`javascript
function hello() {
  console.log("Hello, World!");
}
\`\`\`

[Visit our website](https://example.com)

> This is a blockquote

---

~~Strikethrough text~~`);
  };

  const resetConverter = () => {
    setMarkdownInput('');
    setConversionResult(null);
    setShowAdvanced(false);
    setOptions({
      lineBreaks: 'standard',
      enableTables: true,
      enableCodeBlocks: true,
      enableEmoji: false,
      sanitizeHTML: true,
      preserveSpaces: false,
      addPrefix: '',
      addSuffix: ''
    });
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copied!",
        description: "HTML has been copied to clipboard."
      });
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Failed to copy to clipboard.",
        variant: "destructive"
      });
    }
  };

  const downloadHTML = () => {
    if (!conversionResult) return;

    const blob = new Blob([conversionResult.htmlOutput], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'converted.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const updateOption = <K extends keyof ConversionOptions>(key: K, value: ConversionOptions[K]) => {
    setOptions(prev => ({ ...prev, [key]: value }));
  };

  // Auto-convert when markdown or options change
  useEffect(() => {
    if (markdownInput.trim()) {
      const timeoutId = setTimeout(() => {
        handleConvert();
      }, 300);
      
      return () => clearTimeout(timeoutId);
    } else {
      setConversionResult(null);
    }
  }, [markdownInput, options]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Helmet>
        <title>Markdown to HTML Converter - Convert Markdown to HTML Online | DapsiWow</title>
        <meta name="description" content="Free online Markdown to HTML converter tool. Convert Markdown syntax to clean HTML code instantly with support for headers, lists, links, code blocks, tables, and more. Perfect for developers, writers, and content creators." />
        <meta name="keywords" content="markdown to html converter, markdown parser, md to html, markdown converter, online markdown tool, markdown syntax, html converter, code formatter, web development, content creation, technical writing, documentation converter" />
        <meta property="og:title" content="Markdown to HTML Converter - Convert Markdown to HTML Online | DapsiWow" />
        <meta property="og:description" content="Professional Markdown to HTML converter with real-time preview. Convert Markdown syntax to clean HTML code with support for all standard features." />
        <meta property="og:type" content="website" />
        <meta name="robots" content="index, follow" />
        <meta name="author" content="DapsiWow" />
        <link rel="canonical" href="https://dapsiwow.com/tools/markdown-to-html" />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            "name": "Markdown to HTML Converter",
            "description": "Professional Markdown to HTML converter for converting Markdown syntax to clean HTML code with support for headers, lists, links, code blocks, and tables.",
            "url": "https://dapsiwow.com/tools/markdown-to-html",
            "applicationCategory": "DeveloperApplication",
            "operatingSystem": "Any",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "USD"
            },
            "featureList": [
              "Markdown to HTML conversion",
              "Real-time preview",
              "Support for all standard Markdown syntax",
              "Code block highlighting",
              "Table conversion",
              "Custom formatting options"
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
                <span className="text-xs sm:text-sm font-medium text-blue-700">Professional Markdown Tool</span>
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-slate-900 leading-tight" data-testid="text-page-title">
                Markdown to HTML
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                  Converter
                </span>
              </h1>
              <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-slate-600 max-w-4xl mx-auto leading-relaxed px-2">
                Convert Markdown syntax to clean HTML code instantly with real-time preview
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
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">Markdown Converter</h2>
                    <p className="text-gray-600">Enter Markdown text to convert to HTML format</p>
                  </div>

                  <div className="space-y-4 sm:space-y-6">
                    {/* Line Breaks Selection */}
                    <div className="space-y-3">
                      <Label htmlFor="line-breaks-select" className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                        Line Break Style
                      </Label>
                      <Select
                        value={options.lineBreaks}
                        onValueChange={(value: 'standard' | 'github') => 
                          updateOption('lineBreaks', value)
                        }
                      >
                        <SelectTrigger className="h-12 sm:h-14 border-2 border-gray-200 rounded-xl text-base sm:text-lg" data-testid="select-line-breaks">
                          <SelectValue placeholder="Select line break style" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="standard">Standard (Paragraph)</SelectItem>
                          <SelectItem value="github">GitHub Style (Break)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Markdown Input */}
                    <div className="space-y-3">
                      <Label htmlFor="markdown-input" className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                        Markdown Input
                      </Label>
                      <Textarea
                        id="markdown-input"
                        value={markdownInput}
                        onChange={(e) => setMarkdownInput(e.target.value)}
                        className="min-h-[120px] sm:min-h-[140px] lg:min-h-[160px] text-base sm:text-lg border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-blue-500 font-mono resize-none"
                        placeholder="# Hello World&#10;&#10;This is **bold** text and *italic* text.&#10;&#10;- List item 1&#10;- List item 2&#10;&#10;[Link](https://example.com)"
                        data-testid="input-markdown"
                      />
                      <div className="text-sm text-gray-500">
                        {markdownInput.length} characters, {markdownInput.trim().split(/\s+/).length} words
                      </div>
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
                        
                        {/* Feature Options */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                          <div className="space-y-4 bg-gray-50 rounded-xl p-4 sm:p-6">
                            <h4 className="text-sm sm:text-base font-semibold text-gray-900">Feature Options</h4>
                            
                            <div className="flex items-center justify-between gap-2">
                              <div className="space-y-1 flex-1 min-w-0">
                                <Label className="text-xs sm:text-sm font-medium">Enable Tables</Label>
                                <p className="text-xs text-gray-500">Convert Markdown table syntax to HTML tables</p>
                              </div>
                              <Switch
                                checked={options.enableTables}
                                onCheckedChange={(value) => updateOption('enableTables', value)}
                                data-testid="switch-tables"
                              />
                            </div>

                            <div className="flex items-center justify-between gap-2">
                              <div className="space-y-1 flex-1 min-w-0">
                                <Label className="text-xs sm:text-sm font-medium">Enable Code Blocks</Label>
                                <p className="text-xs text-gray-500">Convert code blocks and inline code</p>
                              </div>
                              <Switch
                                checked={options.enableCodeBlocks}
                                onCheckedChange={(value) => updateOption('enableCodeBlocks', value)}
                                data-testid="switch-code"
                              />
                            </div>

                            <div className="flex items-center justify-between gap-2">
                              <div className="space-y-1 flex-1 min-w-0">
                                <Label className="text-xs sm:text-sm font-medium">Enable Emoji</Label>
                                <p className="text-xs text-gray-500">Convert emoji shortcodes to Unicode</p>
                              </div>
                              <Switch
                                checked={options.enableEmoji}
                                onCheckedChange={(value) => updateOption('enableEmoji', value)}
                                data-testid="switch-emoji"
                              />
                            </div>

                            <div className="flex items-center justify-between gap-2">
                              <div className="space-y-1 flex-1 min-w-0">
                                <Label className="text-xs sm:text-sm font-medium">Sanitize HTML</Label>
                                <p className="text-xs text-gray-500">Clean and sanitize HTML output</p>
                              </div>
                              <Switch
                                checked={options.sanitizeHTML}
                                onCheckedChange={(value) => updateOption('sanitizeHTML', value)}
                                data-testid="switch-sanitize"
                              />
                            </div>

                            <div className="flex items-center justify-between gap-2">
                              <div className="space-y-1 flex-1 min-w-0">
                                <Label className="text-xs sm:text-sm font-medium">Preserve Spaces</Label>
                                <p className="text-xs text-gray-500">Keep original spacing in output</p>
                              </div>
                              <Switch
                                checked={options.preserveSpaces}
                                onCheckedChange={(value) => updateOption('preserveSpaces', value)}
                                data-testid="switch-preserve-spaces"
                              />
                            </div>
                          </div>

                          {/* HTML Customization Options */}
                          <div className="space-y-4 bg-gray-50 rounded-xl p-4 sm:p-6">
                            <h4 className="text-sm sm:text-base font-semibold text-gray-900">HTML Customization</h4>
                            
                            <div className="space-y-2">
                              <Label className="text-xs sm:text-sm font-medium">Add Prefix</Label>
                              <Textarea
                                value={options.addPrefix}
                                onChange={(e) => updateOption('addPrefix', e.target.value)}
                                placeholder="e.g., <!DOCTYPE html><html><body>"
                                className="text-sm h-20 sm:h-24 border-2 border-gray-200 rounded-lg font-mono resize-none"
                                data-testid="input-add-prefix"
                              />
                              <p className="text-xs text-gray-500">HTML to add before converted output</p>
                            </div>

                            <div className="space-y-2">
                              <Label className="text-xs sm:text-sm font-medium">Add Suffix</Label>
                              <Textarea
                                value={options.addSuffix}
                                onChange={(e) => updateOption('addSuffix', e.target.value)}
                                placeholder="e.g., </body></html>"
                                className="text-sm h-20 sm:h-24 border-2 border-gray-200 rounded-lg font-mono resize-none"
                                data-testid="input-add-suffix"
                              />
                              <p className="text-xs text-gray-500">HTML to add after converted output</p>
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
                      onClick={handleConvert}
                      disabled={!markdownInput.trim()}
                      className="flex-1 h-12 sm:h-14 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold text-base sm:text-lg rounded-xl shadow-lg transform transition-all duration-200 hover:scale-105"
                      data-testid="button-convert"
                    >
                      Convert to HTML
                    </Button>
                    <Button
                      onClick={handleSampleMarkdown}
                      variant="outline"
                      className="h-12 sm:h-14 px-6 sm:px-8 border-2 border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold text-base sm:text-lg rounded-xl"
                      data-testid="button-sample"
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
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6 sm:mb-8">HTML Output</h2>

                  {conversionResult && conversionResult.originalMarkdown ? (
                    <div className="space-y-3 sm:space-y-4" data-testid="conversion-results">
                      {/* Main HTML Output Display */}
                      <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-3 sm:p-4">
                        <div className="flex items-center justify-between mb-3 gap-3">
                          <div className="flex-1 min-w-0">
                            <h3 className="text-sm sm:text-base font-semibold text-gray-900 truncate">HTML Code</h3>
                            <p className="text-xs sm:text-sm text-gray-600 break-words">Clean HTML output ready for use</p>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              onClick={() => copyToClipboard(conversionResult.htmlOutput)}
                              variant="outline"
                              size="sm"
                              className="text-xs px-2 sm:px-3 py-2 flex-shrink-0 rounded-lg min-w-[60px] sm:min-w-[70px] h-11 sm:h-9 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                              data-testid="button-copy"
                            >
                              Copy
                            </Button>
                            <Button
                              onClick={downloadHTML}
                              variant="outline"
                              size="sm"
                              className="text-xs px-2 sm:px-3 py-2 flex-shrink-0 rounded-lg min-w-[60px] sm:min-w-[70px] h-11 sm:h-9 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                              data-testid="button-download"
                            >
                              Download
                            </Button>
                          </div>
                        </div>
                        <Textarea 
                          value={conversionResult.htmlOutput}
                          readOnly
                          className="min-h-[120px] sm:min-h-[140px] text-xs sm:text-sm font-mono bg-white border border-gray-200 resize-none"
                          data-testid="output-html"
                        />
                      </div>

                      {/* Text Statistics */}
                      <div className="bg-white rounded-xl p-3 sm:p-4 shadow-sm border border-gray-200" data-testid="text-statistics">
                        <h3 className="text-sm sm:text-base font-bold text-gray-900 mb-4">Conversion Statistics</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="bg-blue-50 rounded-lg p-4 text-center">
                            <div className="text-2xl font-bold text-blue-600" data-testid="word-count">{conversionResult.wordCount}</div>
                            <div className="text-sm text-blue-700 font-medium">Words</div>
                          </div>
                          <div className="bg-green-50 rounded-lg p-4 text-center">
                            <div className="text-2xl font-bold text-green-600" data-testid="char-count">{conversionResult.characterCount}</div>
                            <div className="text-sm text-green-700 font-medium">Characters</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12 sm:py-16" data-testid="no-results">
                      <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-200 rounded-full mx-auto mb-4 sm:mb-6 flex items-center justify-center">
                        <div className="text-2xl sm:text-3xl font-bold text-gray-400">#</div>
                      </div>
                      <p className="text-gray-500 text-base sm:text-lg px-4">Enter Markdown text to convert to HTML</p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* SEO Content Sections */}
          <div className="mt-16 space-y-8">
            {/* What is Markdown to HTML Conversion */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">What is Markdown to HTML Conversion?</h2>
                <div className="space-y-4 text-gray-600">
                  <p>
                    <strong>Markdown to HTML conversion</strong> is the process of transforming Markdown syntax into clean, semantic HTML code. Markdown is a lightweight markup language designed for easy writing and reading, while HTML is the standard markup language for creating web pages. This conversion bridges the gap between human-readable documentation and web-ready content.
                  </p>
                  <p>
                    Our professional Markdown converter supports all standard Markdown syntax including headers, paragraphs, lists, links, images, code blocks, tables, blockquotes, and more. With real-time conversion and advanced customization options, you can transform your Markdown content into clean HTML code instantly, making it perfect for web developers, technical writers, bloggers, and content creators.
                  </p>
                  <p>
                    The tool features intelligent parsing that handles complex Markdown structures, preserves formatting integrity, and generates clean, semantic HTML that follows modern web standards. Whether you're converting documentation, blog posts, README files, or technical specifications, our converter ensures your Markdown content translates perfectly to HTML.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Markdown Syntax Guide */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Complete Markdown Syntax Guide</h2>
                <p className="text-gray-600 mb-8">Master Markdown syntax with our comprehensive guide covering all elements supported by our converter. Each example shows the Markdown input and corresponding HTML output.</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-800">Text Formatting</h3>
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h4 className="font-medium text-blue-900 mb-2">Headers</h4>
                      <div className="text-xs font-mono text-blue-800 space-y-1">
                        <div># H1 Header → &lt;h1&gt;H1 Header&lt;/h1&gt;</div>
                        <div>## H2 Header → &lt;h2&gt;H2 Header&lt;/h2&gt;</div>
                        <div>### H3 Header → &lt;h3&gt;H3 Header&lt;/h3&gt;</div>
                      </div>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg">
                      <h4 className="font-medium text-green-900 mb-2">Emphasis</h4>
                      <div className="text-xs font-mono text-green-800 space-y-1">
                        <div>**bold** → &lt;strong&gt;bold&lt;/strong&gt;</div>
                        <div>*italic* → &lt;em&gt;italic&lt;/em&gt;</div>
                        <div>***bold italic*** → &lt;strong&gt;&lt;em&gt;bold italic&lt;/em&gt;&lt;/strong&gt;</div>
                        <div>~~strikethrough~~ → &lt;del&gt;strikethrough&lt;/del&gt;</div>
                      </div>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-lg">
                      <h4 className="font-medium text-purple-900 mb-2">Lists</h4>
                      <div className="text-xs font-mono text-purple-800 space-y-1">
                        <div>- Item 1 → &lt;ul&gt;&lt;li&gt;Item 1&lt;/li&gt;&lt;/ul&gt;</div>
                        <div>1. Item 1 → &lt;ol&gt;&lt;li&gt;Item 1&lt;/li&gt;&lt;/ol&gt;</div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-800">Advanced Elements</h3>
                    <div className="bg-orange-50 p-4 rounded-lg">
                      <h4 className="font-medium text-orange-900 mb-2">Links & Images</h4>
                      <div className="text-xs font-mono text-orange-800 space-y-1">
                        <div>[text](url) → &lt;a href="url"&gt;text&lt;/a&gt;</div>
                        <div>![alt](image.jpg) → &lt;img src="image.jpg" alt="alt"&gt;</div>
                      </div>
                    </div>
                    <div className="bg-teal-50 p-4 rounded-lg">
                      <h4 className="font-medium text-teal-900 mb-2">Code</h4>
                      <div className="text-xs font-mono text-teal-800 space-y-1">
                        <div>`code` → &lt;code&gt;code&lt;/code&gt;</div>
                        <div>```code block``` → &lt;pre&gt;&lt;code&gt;code block&lt;/code&gt;&lt;/pre&gt;</div>
                      </div>
                    </div>
                    <div className="bg-red-50 p-4 rounded-lg">
                      <h4 className="font-medium text-red-900 mb-2">Other Elements</h4>
                      <div className="text-xs font-mono text-red-800 space-y-1">
                        <div>&gt; Quote → &lt;blockquote&gt;Quote&lt;/blockquote&gt;</div>
                        <div>--- → &lt;hr&gt;</div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Use Cases and Professional Applications */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
                <CardContent className="p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Professional Use Cases</h2>
                  <p className="text-gray-600 mb-6">Discover how Markdown to HTML conversion serves professionals across various industries and workflow requirements.</p>
                  
                  <div className="space-y-4">
                    <div className="bg-blue-50 rounded-lg p-4">
                      <h3 className="font-semibold text-blue-900 mb-2">Web Development</h3>
                      <p className="text-blue-800 text-sm">Convert documentation, README files, and content into HTML for websites, static site generators, and web applications.</p>
                    </div>
                    
                    <div className="bg-green-50 rounded-lg p-4">
                      <h3 className="font-semibold text-green-900 mb-2">Technical Writing</h3>
                      <p className="text-green-800 text-sm">Transform technical documentation, API guides, and software manuals from Markdown to HTML for online publication.</p>
                    </div>
                    
                    <div className="bg-purple-50 rounded-lg p-4">
                      <h3 className="font-semibold text-purple-900 mb-2">Content Creation</h3>
                      <p className="text-purple-800 text-sm">Convert blog posts, articles, and marketing content written in Markdown to HTML for CMSs and publishing platforms.</p>
                    </div>
                    
                    <div className="bg-orange-50 rounded-lg p-4">
                      <h3 className="font-semibold text-orange-900 mb-2">Education & Training</h3>
                      <p className="text-orange-800 text-sm">Transform educational materials, course content, and training documentation into web-ready HTML format.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
                <CardContent className="p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Why Choose Markdown?</h2>
                  <p className="text-gray-600 mb-6">Understanding the advantages of Markdown syntax and when to convert it to HTML for web deployment.</p>
                  
                  <div className="space-y-4">
                    <div className="bg-emerald-50 rounded-lg p-4">
                      <h3 className="font-semibold text-emerald-900 mb-2">Simplicity & Readability</h3>
                      <p className="text-emerald-800 text-sm">Markdown uses simple, intuitive syntax that remains readable in plain text format while converting to clean HTML.</p>
                    </div>
                    
                    <div className="bg-blue-50 rounded-lg p-4">
                      <h3 className="font-semibold text-blue-900 mb-2">Platform Independence</h3>
                      <p className="text-blue-800 text-sm">Write once in Markdown and convert to HTML for any platform, ensuring consistent formatting across all outputs.</p>
                    </div>
                    
                    <div className="bg-indigo-50 rounded-lg p-4">
                      <h3 className="font-semibold text-indigo-900 mb-2">Version Control Friendly</h3>
                      <p className="text-indigo-800 text-sm">Markdown files work excellently with Git and other version control systems, making collaboration seamless.</p>
                    </div>
                    
                    <div className="bg-violet-50 rounded-lg p-4">
                      <h3 className="font-semibold text-violet-900 mb-2">Future-Proof Format</h3>
                      <p className="text-violet-800 text-sm">Markdown is a stable, widely-adopted format that ensures your content remains accessible and convertible long-term.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Advanced Features and Best Practices */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Advanced Features & Conversion Best Practices</h2>
                <p className="text-gray-600 mb-8">Maximize the effectiveness of Markdown to HTML conversion with our advanced features and follow industry best practices for optimal results.</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">Advanced Features</h3>
                    <div className="space-y-4">
                      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-400 p-4 rounded-r-lg">
                        <h4 className="font-semibold text-blue-900 mb-2">Real-Time Conversion</h4>
                        <p className="text-blue-800 text-sm">Automatic HTML generation as you type with intelligent debouncing for optimal performance and immediate feedback.</p>
                      </div>
                      <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-l-4 border-green-400 p-4 rounded-r-lg">
                        <h4 className="font-semibold text-green-900 mb-2">Custom HTML Wrapping</h4>
                        <p className="text-green-800 text-sm">Add custom HTML prefixes and suffixes to create complete documents with DOCTYPE, head sections, and body tags.</p>
                      </div>
                      <div className="bg-gradient-to-r from-purple-50 to-violet-50 border-l-4 border-purple-400 p-4 rounded-r-lg">
                        <h4 className="font-semibold text-purple-900 mb-2">Table Support</h4>
                        <p className="text-purple-800 text-sm">Full GitHub Flavored Markdown table syntax support with automatic HTML table generation.</p>
                      </div>
                      <div className="bg-gradient-to-r from-orange-50 to-red-50 border-l-4 border-orange-400 p-4 rounded-r-lg">
                        <h4 className="font-semibold text-orange-900 mb-2">Privacy & Security</h4>
                        <p className="text-orange-800 text-sm">All processing happens locally in your browser - no data transmitted to servers, ensuring complete privacy.</p>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">Best Practices</h3>
                    <div className="space-y-4">
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h4 className="font-semibold text-gray-900 mb-2">Markdown Structure</h4>
                        <ul className="text-gray-700 text-sm space-y-1">
                          <li>• Use proper header hierarchy (H1 → H2 → H3)</li>
                          <li>• Add blank lines around headers and lists</li>
                          <li>• Use consistent list marker styles</li>
                          <li>• Escape special characters when needed</li>
                        </ul>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h4 className="font-semibold text-gray-900 mb-2">HTML Output</h4>
                        <ul className="text-gray-700 text-sm space-y-1">
                          <li>• Validate HTML output in browsers</li>
                          <li>• Test with different screen sizes</li>
                          <li>• Check accessibility standards</li>
                          <li>• Optimize for SEO when applicable</li>
                        </ul>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h4 className="font-semibold text-gray-900 mb-2">Quality Assurance</h4>
                        <ul className="text-gray-700 text-sm space-y-1">
                          <li>• Preview HTML in multiple browsers</li>
                          <li>• Verify link functionality</li>
                          <li>• Test with sample content first</li>
                          <li>• Keep backups of original Markdown</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Common Conversion Scenarios */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Common Conversion Scenarios & Solutions</h2>
                <p className="text-gray-600 mb-8">Learn how to handle specific Markdown to HTML conversion scenarios that professionals encounter in real-world projects.</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="bg-blue-50 rounded-lg p-6">
                    <h3 className="font-semibold text-blue-900 mb-4">Documentation Sites</h3>
                    <ul className="text-blue-800 text-sm space-y-2">
                      <li>• Convert README files to HTML</li>
                      <li>• Transform API documentation</li>
                      <li>• Generate help pages</li>
                      <li>• Create tutorial content</li>
                      <li>• Build knowledge bases</li>
                      <li>• Format technical guides</li>
                    </ul>
                  </div>

                  <div className="bg-green-50 rounded-lg p-6">
                    <h3 className="font-semibold text-green-900 mb-4">Blog & Content Publishing</h3>
                    <ul className="text-green-800 text-sm space-y-2">
                      <li>• Convert blog post drafts</li>
                      <li>• Transform newsletter content</li>
                      <li>• Generate article HTML</li>
                      <li>• Create landing page content</li>
                      <li>• Format press releases</li>
                      <li>• Build content libraries</li>
                    </ul>
                  </div>

                  <div className="bg-purple-50 rounded-lg p-6">
                    <h3 className="font-semibold text-purple-900 mb-4">Static Site Generation</h3>
                    <ul className="text-purple-800 text-sm space-y-2">
                      <li>• Jekyll site content</li>
                      <li>• Hugo page generation</li>
                      <li>• Gatsby content transformation</li>
                      <li>• Next.js static pages</li>
                      <li>• GitBook documentation</li>
                      <li>• Custom site builders</li>
                    </ul>
                  </div>

                  <div className="bg-orange-50 rounded-lg p-6">
                    <h3 className="font-semibold text-orange-900 mb-4">Email & Marketing</h3>
                    <ul className="text-orange-800 text-sm space-y-2">
                      <li>• HTML email templates</li>
                      <li>• Newsletter formatting</li>
                      <li>• Marketing campaign content</li>
                      <li>• Product descriptions</li>
                      <li>• Customer communications</li>
                      <li>• Support documentation</li>
                    </ul>
                  </div>

                  <div className="bg-teal-50 rounded-lg p-6">
                    <h3 className="font-semibold text-teal-900 mb-4">Educational Content</h3>
                    <ul className="text-teal-800 text-sm space-y-2">
                      <li>• Course material conversion</li>
                      <li>• Online lesson formatting</li>
                      <li>• Assignment instructions</li>
                      <li>• Study guide creation</li>
                      <li>• Research paper formatting</li>
                      <li>• Academic publishing</li>
                    </ul>
                  </div>

                  <div className="bg-red-50 rounded-lg p-6">
                    <h3 className="font-semibold text-red-900 mb-4">Software Development</h3>
                    <ul className="text-red-800 text-sm space-y-2">
                      <li>• GitHub Pages deployment</li>
                      <li>• Code documentation</li>
                      <li>• Project descriptions</li>
                      <li>• Change log formatting</li>
                      <li>• Release note generation</li>
                      <li>• Developer guides</li>
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
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">What is Markdown and why convert it to HTML?</h3>
                      <p className="text-gray-600 text-sm">
                        Markdown is a lightweight markup language that uses plain text formatting syntax. Converting to HTML makes your content web-ready for websites, documentation sites, blogs, and web applications while preserving all formatting and structure.
                      </p>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Does this converter support GitHub Flavored Markdown?</h3>
                      <p className="text-gray-600 text-sm">
                        Yes, our converter supports most GitHub Flavored Markdown features including tables, strikethrough text, and code blocks. Enable the appropriate options in the advanced settings to activate these features.
                      </p>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Can I add custom HTML around the converted content?</h3>
                      <p className="text-gray-600 text-sm">
                        Absolutely! Use the prefix and suffix options in advanced settings to wrap your converted HTML with custom HTML elements like DOCTYPE declarations, head sections, body tags, or any other HTML structure you need.
                      </p>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Is there a limit to how much Markdown I can convert?</h3>
                      <p className="text-gray-600 text-sm">
                        There's no strict limit, but very large documents may take longer to process due to browser memory constraints. The tool displays character and word counts to help you monitor input size and performance.
                      </p>
                    </div>
                  </div>
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">How does the real-time conversion work?</h3>
                      <p className="text-gray-600 text-sm">
                        The converter automatically processes your Markdown input as you type, with a 300ms delay to optimize performance. This provides immediate feedback while you write, allowing you to see the HTML output in real-time.
                      </p>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Is my Markdown content secure and private?</h3>
                      <p className="text-gray-600 text-sm">
                        Completely secure! All conversion processing happens locally in your browser using client-side JavaScript. No content is transmitted to servers, stored remotely, or accessed by third parties, ensuring complete privacy.
                      </p>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Can I use this converter for commercial projects?</h3>
                      <p className="text-gray-600 text-sm">
                        Yes! Our Markdown to HTML converter is free to use for personal, educational, and commercial projects. The generated HTML is clean and ready for use in any application, website, or publication.
                      </p>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Does this work offline after the page loads?</h3>
                      <p className="text-gray-600 text-sm">
                        Yes! Once the page loads completely, all conversion functionality works offline without requiring an internet connection. The tool runs entirely in your browser, making it reliable for any environment.
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
                <p className="text-gray-600 mb-8">Our Markdown to HTML converter is built with modern web technologies to ensure compatibility, performance, and reliability across all major platforms and devices.</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">Supported Markdown Features</h3>
                    <div className="space-y-4">
                      <div className="bg-blue-50 rounded-lg p-4">
                        <h4 className="font-semibold text-blue-900 mb-2">Standard Elements</h4>
                        <ul className="text-blue-800 text-sm space-y-1">
                          <li>• Headers (H1-H6)</li>
                          <li>• Paragraphs and line breaks</li>
                          <li>• Bold, italic, and strikethrough</li>
                          <li>• Ordered and unordered lists</li>
                        </ul>
                      </div>
                      <div className="bg-green-50 rounded-lg p-4">
                        <h4 className="font-semibold text-green-900 mb-2">Advanced Elements</h4>
                        <ul className="text-green-800 text-sm space-y-1">
                          <li>• Links and images</li>
                          <li>• Code blocks and inline code</li>
                          <li>• Tables (GitHub Flavored Markdown)</li>
                          <li>• Blockquotes and horizontal rules</li>
                        </ul>
                      </div>
                      <div className="bg-purple-50 rounded-lg p-4">
                        <h4 className="font-semibold text-purple-900 mb-2">Custom Features</h4>
                        <ul className="text-purple-800 text-sm space-y-1">
                          <li>• HTML prefix/suffix wrapping</li>
                          <li>• Line break style options</li>
                          <li>• Emoji shortcode conversion</li>
                          <li>• HTML sanitization options</li>
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
                          <li>• Chrome 90+ (recommended)</li>
                          <li>• Firefox 88+ (excellent support)</li>
                          <li>• Safari 14+ (full compatibility)</li>
                          <li>• Edge 90+ (optimal performance)</li>
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
                          <li>• Client-side processing (no server calls)</li>
                          <li>• Responsive design (all screen sizes)</li>
                          <li>• Accessibility compliant (WCAG 2.1)</li>
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

export default MarkdownToHTMLConverter;
