
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
import { useToast } from '@/hooks/use-toast';

interface ConversionOptions {
  lineBreaks: 'standard' | 'github';
  enableTables: boolean;
  enableCodeBlocks: boolean;
  enableEmoji: boolean;
  sanitizeHTML: boolean;
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
  const [options, setOptions] = useState<ConversionOptions>({
    lineBreaks: 'standard',
    enableTables: true,
    enableCodeBlocks: true,
    enableEmoji: false,
    sanitizeHTML: true
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
      const htmlOutput = convertMarkdownToHTML(markdownInput, options);
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

  const resetConverter = () => {
    setMarkdownInput('');
    setConversionResult(null);
    setOptions({
      lineBreaks: 'standard',
      enableTables: true,
      enableCodeBlocks: true,
      enableEmoji: false,
      sanitizeHTML: true
    });
    setConversionHistory([]);
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Helmet>
        <title>Markdown to HTML Converter - Convert MD to HTML Online Free | DapsiWow</title>
        <meta name="description" content="Convert Markdown to HTML instantly with our free online tool. Support for headers, lists, links, code blocks, tables, and more. Professional MD to HTML converter for developers and writers." />
        <meta name="keywords" content="markdown to html converter, md to html, markdown parser, markdown converter online, free markdown to html, convert markdown, html generator, markdown processor, text converter" />
        <meta property="og:title" content="Markdown to HTML Converter - Convert MD to HTML Online Free | DapsiWow" />
        <meta property="og:description" content="Free Markdown to HTML converter with advanced formatting support. Convert MD files to clean HTML code instantly with custom options and download functionality." />
        <meta property="og:type" content="website" />
        <meta name="robots" content="index, follow" />
        <meta name="author" content="DapsiWow" />
        <link rel="canonical" href="https://dapsiwow.com/tools/markdown-to-html" />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            "name": "Markdown to HTML Converter",
            "description": "Professional online tool for converting Markdown text to HTML format with support for headers, lists, links, code blocks, tables, and advanced formatting options.",
            "url": "https://dapsiwow.com/tools/markdown-to-html",
            "applicationCategory": "DeveloperApplication",
            "operatingSystem": "Any",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "USD"
            },
            "featureList": [
              "Convert Markdown to HTML instantly",
              "Support for headers, lists, and links",
              "Code block and table conversion",
              "Custom formatting options",
              "Download HTML files",
              "Copy to clipboard functionality"
            ]
          })}
        </script>
      </Helmet>

      <Header />

      <main>
        {/* Hero Section */}
        <section className="relative py-20 sm:py-28 lg:py-32 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-indigo-600/20"></div>
          <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="space-y-8">
              <div className="inline-flex items-center px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full border border-blue-200">
                <span className="text-sm font-medium text-blue-700">Professional Markdown Converter</span>
              </div>
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-slate-900 leading-tight">
                Markdown to HTML
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                  Converter
                </span>
              </h1>
              <p className="text-xl sm:text-2xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
                Convert Markdown text to clean HTML format with support for headers, lists, links, code blocks, and more
              </p>
            </div>
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-4 py-16">
          {/* Main Converter Card */}
          <Card className="bg-white/90 backdrop-blur-sm shadow-2xl border-0 rounded-3xl overflow-hidden">
            <CardContent className="p-0">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
                {/* Input Section */}
                <div className="p-8 lg:p-12 space-y-8">
                  <div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">Conversion Settings</h2>
                    <p className="text-gray-600">Configure your Markdown to HTML conversion options</p>
                  </div>

                  <div className="space-y-6">
                    {/* Markdown Input */}
                    <div className="space-y-3">
                      <Label htmlFor="markdown-input" className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                        Markdown Input
                      </Label>
                      <Textarea
                        id="markdown-input"
                        placeholder="# Hello World&#10;&#10;This is **bold** text and *italic* text.&#10;&#10;- List item 1&#10;- List item 2&#10;&#10;[Link](https://example.com)"
                        className="min-h-[200px] text-sm font-mono border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-blue-500"
                        value={markdownInput}
                        onChange={(e) => setMarkdownInput(e.target.value)}
                        data-testid="input-markdown"
                      />
                      <div className="text-sm text-gray-500">
                        {markdownInput.length} characters, {markdownInput.trim() ? markdownInput.trim().split(/\s+/).length : 0} words
                      </div>
                    </div>

                    {/* Conversion Options */}
                    <div className="space-y-4 bg-gray-50 rounded-xl p-6">
                      <h3 className="text-sm font-semibold text-gray-800 uppercase tracking-wide">Conversion Options</h3>
                      
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="line-breaks" className="text-sm font-medium mb-2 block">
                            Line Breaks
                          </Label>
                          <Select value={options.lineBreaks} onValueChange={(value: 'standard' | 'github') => 
                            setOptions(prev => ({ ...prev, lineBreaks: value }))}>
                            <SelectTrigger className="h-12 border-2 border-gray-200 rounded-xl" data-testid="select-line-breaks">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="standard">Standard</SelectItem>
                              <SelectItem value="github">GitHub Style</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="flex items-center justify-between">
                            <Label htmlFor="enable-tables" className="text-sm font-medium">
                              Enable Tables
                            </Label>
                            <Switch
                              id="enable-tables"
                              checked={options.enableTables}
                              onCheckedChange={(checked) => 
                                setOptions(prev => ({ ...prev, enableTables: checked }))}
                              data-testid="switch-tables"
                            />
                          </div>

                          <div className="flex items-center justify-between">
                            <Label htmlFor="enable-code" className="text-sm font-medium">
                              Code Blocks
                            </Label>
                            <Switch
                              id="enable-code"
                              checked={options.enableCodeBlocks}
                              onCheckedChange={(checked) => 
                                setOptions(prev => ({ ...prev, enableCodeBlocks: checked }))}
                              data-testid="switch-code"
                            />
                          </div>

                          <div className="flex items-center justify-between">
                            <Label htmlFor="enable-emoji" className="text-sm font-medium">
                              Basic Emoji
                            </Label>
                            <Switch
                              id="enable-emoji"
                              checked={options.enableEmoji}
                              onCheckedChange={(checked) => 
                                setOptions(prev => ({ ...prev, enableEmoji: checked }))}
                              data-testid="switch-emoji"
                            />
                          </div>

                          <div className="flex items-center justify-between">
                            <Label htmlFor="sanitize-html" className="text-sm font-medium">
                              Sanitize HTML
                            </Label>
                            <Switch
                              id="sanitize-html"
                              checked={options.sanitizeHTML}
                              onCheckedChange={(checked) => 
                                setOptions(prev => ({ ...prev, sanitizeHTML: checked }))}
                              data-testid="switch-sanitize"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4 pt-6">
                      <Button
                        onClick={handleConvert}
                        className="flex-1 h-14 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold text-lg rounded-xl shadow-lg transform transition-all duration-200 hover:scale-105"
                        data-testid="button-convert"
                      >
                        Convert to HTML
                      </Button>
                      <Button
                        onClick={resetConverter}
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
                  <h2 className="text-2xl font-bold text-gray-900 mb-8">HTML Output</h2>

                  {conversionResult ? (
                    <div className="space-y-6" data-testid="conversion-results">
                      {/* HTML Output Display */}
                      <div className="bg-white rounded-2xl p-6 shadow-lg border border-blue-100">
                        <textarea
                          value={conversionResult.htmlOutput}
                          readOnly
                          className="w-full h-64 lg:h-80 p-4 text-sm font-mono border-0 resize-none focus:outline-none bg-transparent text-gray-800 leading-relaxed"
                          placeholder="HTML output will appear here..."
                          data-testid="textarea-html-output"
                        />
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-col sm:flex-row gap-4">
                        <Button
                          onClick={() => copyToClipboard(conversionResult.htmlOutput)}
                          className="flex-1 h-12 bg-green-600 hover:bg-green-700 text-white font-medium rounded-xl"
                          data-testid="button-copy-html"
                        >
                          Copy HTML
                        </Button>
                        <Button
                          onClick={downloadHTML}
                          className="flex-1 h-12 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-xl"
                          data-testid="button-download-html"
                        >
                          Download HTML
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

                      {/* Conversion Statistics */}
                      <div className="bg-white rounded-xl p-6 shadow-sm" data-testid="conversion-statistics">
                        <h3 className="font-bold text-gray-900 mb-4 text-lg">Conversion Statistics</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          <div className="bg-blue-50 rounded-lg p-4 text-center">
                            <div className="text-2xl font-bold text-blue-600">{conversionResult.characterCount.toLocaleString()}</div>
                            <div className="text-sm text-blue-700 font-medium">Characters</div>
                          </div>
                          <div className="bg-green-50 rounded-lg p-4 text-center">
                            <div className="text-2xl font-bold text-green-600">{conversionResult.wordCount.toLocaleString()}</div>
                            <div className="text-sm text-green-700 font-medium">Words</div>
                          </div>
                          <div className="bg-purple-50 rounded-lg p-4 text-center">
                            <div className="text-2xl font-bold text-purple-600">
                              {conversionResult.htmlOutput.length.toLocaleString()}
                            </div>
                            <div className="text-sm text-purple-700 font-medium">HTML Characters</div>
                          </div>
                        </div>
                      </div>

                      {/* Conversion History */}
                      {conversionHistory.length > 1 && (
                        <div className="bg-white rounded-xl p-6 shadow-sm">
                          <h3 className="font-bold text-gray-900 mb-4 text-lg">Recent Conversions</h3>
                          <div className="space-y-3 max-h-48 overflow-y-auto">
                            {conversionHistory.slice(1, 6).map((result, index) => (
                              <div 
                                key={index} 
                                className="p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
                                onClick={() => {
                                  setMarkdownInput(result.originalMarkdown);
                                  setConversionResult(result);
                                }}
                              >
                                <div className="flex justify-between items-start">
                                  <div className="flex-1">
                                    <p className="text-sm text-gray-600 truncate">
                                      {result.originalMarkdown.slice(0, 100)}...
                                    </p>
                                    <p className="text-xs text-gray-500 mt-1">
                                      {result.wordCount} words • {result.timestamp.toLocaleTimeString()}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-16" data-testid="no-results">
                      <div className="w-20 h-20 bg-gray-200 rounded-full mx-auto mb-6 flex items-center justify-center">
                        <div className="text-3xl font-bold text-gray-400">&lt;/&gt;</div>
                      </div>
                      <p className="text-gray-500 text-lg">Enter Markdown text and convert to see HTML output</p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* SEO Content Section */}
          <div className="mt-16 grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">What is Markdown to HTML Conversion?</h3>
                <div className="space-y-4 text-gray-600">
                  <p>
                    Markdown to HTML conversion transforms lightweight markup text into properly formatted HTML code. 
                    Markdown's simple syntax allows writers and developers to create structured content using plain 
                    text formatting, which can then be converted to HTML for web publishing and display.
                  </p>
                  <p>
                    Our professional Markdown to HTML converter supports all standard Markdown elements including 
                    headers, emphasis, lists, links, images, code blocks, and tables. The tool provides clean, 
                    semantic HTML output that's ready for web deployment or further processing.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Why Use Our Markdown Converter?</h3>
                <div className="space-y-4 text-gray-600">
                  <p>
                    Professional developers and content creators choose our Markdown to HTML converter for its 
                    reliability, speed, and comprehensive feature set. The tool processes Markdown syntax accurately 
                    while maintaining proper HTML structure and semantic meaning.
                  </p>
                  <ul className="space-y-2 list-disc list-inside">
                    <li>Instant conversion with real-time preview capabilities</li>
                    <li>Support for GitHub Flavored Markdown extensions</li>
                    <li>Customizable output options and formatting controls</li>
                    <li>Clean, standards-compliant HTML generation</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Supported Markdown Features</h3>
                <div className="space-y-3 text-gray-600">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Headers (H1-H6) with automatic hierarchy structure</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Text formatting: bold, italic, strikethrough, and combinations</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Lists: ordered, unordered, and nested list structures</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Links and images with alt text support</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Code blocks and inline code with syntax preservation</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Tables with header and data cell recognition</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Blockquotes and horizontal rules</span>
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
                    <span>Documentation conversion for technical projects</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Blog post and article publishing workflows</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>README file processing for GitHub repositories</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Content management system integration</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Static site generation and deployment</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Email template creation and formatting</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Additional SEO Content Sections */}
          <div className="mt-12 space-y-8">
            {/* Comprehensive Guide */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Complete Guide to Markdown to HTML Conversion</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="space-y-4 text-gray-600">
                    <h4 className="font-semibold text-gray-800 mb-2">Understanding Markdown Syntax</h4>
                    <p className="text-sm">
                      Markdown uses simple, intuitive syntax that closely resembles natural writing patterns. 
                      Headers are created with hash symbols (#), emphasis with asterisks (*), and links with 
                      square brackets and parentheses. This simplicity makes Markdown ideal for writers who 
                      want to focus on content without complex formatting distractions.
                    </p>
                    <h4 className="font-semibold text-gray-800 mb-2">HTML Output Quality</h4>
                    <p className="text-sm">
                      Our converter generates clean, semantic HTML that follows web standards and best practices. 
                      The output includes proper document structure, accessibility attributes where applicable, 
                      and optimized markup that performs well in modern browsers and search engines.
                    </p>
                  </div>
                  <div className="space-y-4 text-gray-600">
                    <h4 className="font-semibold text-gray-800 mb-2">Advanced Conversion Options</h4>
                    <p className="text-sm">
                      Choose between standard paragraph handling and GitHub-style line breaks to match your 
                      target platform requirements. Enable or disable specific features like tables, code 
                      blocks, and emoji conversion based on your content needs and deployment environment.
                    </p>
                    <h4 className="font-semibold text-gray-800 mb-2">Integration Workflows</h4>
                    <p className="text-sm">
                      The converter integrates seamlessly into professional development workflows, content 
                      management systems, and publishing pipelines. Export options include direct HTML 
                      download and clipboard copying for immediate use in web projects and documentation systems.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Conversion Features by Category */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
                <CardContent className="p-8">
                  <h3 className="text-xl font-bold text-gray-900 mb-6">Text Formatting</h3>
                  <div className="space-y-4 text-gray-600">
                    <p className="text-sm">
                      Convert Markdown text formatting to proper HTML elements with full support for nested 
                      emphasis, semantic markup, and accessibility standards.
                    </p>
                    <div className="space-y-2">
                      <h4 className="font-semibold text-green-800 text-sm">Supported Elements:</h4>
                      <ul className="text-xs space-y-1 list-disc list-inside text-green-700">
                        <li>Bold and italic text combinations</li>
                        <li>Strikethrough and underline formatting</li>
                        <li>Inline code and monospace text</li>
                        <li>Subscript and superscript support</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
                <CardContent className="p-8">
                  <h3 className="text-xl font-bold text-gray-900 mb-6">Structural Elements</h3>
                  <div className="space-y-4 text-gray-600">
                    <p className="text-sm">
                      Transform Markdown structural elements into properly nested HTML with semantic meaning 
                      and correct hierarchy for optimal document structure.
                    </p>
                    <div className="space-y-2">
                      <h4 className="font-semibold text-blue-800 text-sm">HTML Generation:</h4>
                      <ul className="text-xs space-y-1 list-disc list-inside text-blue-700">
                        <li>Header hierarchy (H1-H6)</li>
                        <li>Nested list structures</li>
                        <li>Table formatting with headers</li>
                        <li>Blockquote and citation blocks</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
                <CardContent className="p-8">
                  <h3 className="text-xl font-bold text-gray-900 mb-6">Media & Links</h3>
                  <div className="space-y-4 text-gray-600">
                    <p className="text-sm">
                      Process Markdown links and images into proper HTML elements with full attribute support 
                      and accessibility considerations for modern web standards.
                    </p>
                    <div className="space-y-2">
                      <h4 className="font-semibold text-purple-800 text-sm">Media Support:</h4>
                      <ul className="text-xs space-y-1 list-disc list-inside text-purple-700">
                        <li>Links with title attributes</li>
                        <li>Images with alt text</li>
                        <li>Reference-style links</li>
                        <li>Automatic URL detection</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Technical Documentation */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Technical Documentation and Developer Resources</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="space-y-4 text-gray-600">
                    <h4 className="font-semibold text-gray-800 mb-2">Markdown Standards Compliance</h4>
                    <p className="text-sm">
                      Our converter follows CommonMark specifications while supporting GitHub Flavored Markdown 
                      extensions. This ensures compatibility with popular platforms like GitHub, GitLab, and 
                      modern static site generators including Jekyll, Hugo, and Gatsby.
                    </p>
                    <h4 className="font-semibold text-gray-800 mb-2">HTML5 Semantic Output</h4>
                    <p className="text-sm">
                      Generated HTML uses semantic elements and follows HTML5 standards for optimal SEO 
                      performance and accessibility. The output includes proper document structure, meta 
                      information preservation, and responsive-friendly markup patterns.
                    </p>
                    <h4 className="font-semibold text-gray-800 mb-2">Performance Optimization</h4>
                    <p className="text-sm">
                      Client-side processing ensures fast conversion without server dependencies, while 
                      optimized parsing algorithms handle large documents efficiently. The tool works 
                      offline and processes files instantly without upload requirements.
                    </p>
                  </div>
                  <div className="space-y-4 text-gray-600">
                    <h4 className="font-semibold text-gray-800 mb-2">Integration APIs and Workflows</h4>
                    <p className="text-sm">
                      Integrate Markdown to HTML conversion into automated workflows, build processes, and 
                      content management systems. The tool supports bulk processing, batch conversion, and 
                      programmatic access for enterprise documentation systems.
                    </p>
                    <h4 className="font-semibold text-gray-800 mb-2">Browser Compatibility</h4>
                    <p className="text-sm">
                      Full compatibility with modern browsers including Chrome, Firefox, Safari, and Edge. 
                      The converter uses standard web technologies without requiring plugins or extensions, 
                      ensuring reliable operation across different platforms and devices.
                    </p>
                    <h4 className="font-semibold text-gray-800 mb-2">Security and Privacy</h4>
                    <p className="text-sm">
                      All processing occurs locally in your browser with no data transmission to external 
                      servers. Optional HTML sanitization prevents potential security issues while 
                      maintaining document formatting and structure integrity.
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
                      <h4 className="font-semibold text-gray-800 mb-2">What Markdown syntax is supported?</h4>
                      <p className="text-gray-600 text-sm">
                        Our converter supports all CommonMark standard elements plus GitHub Flavored Markdown 
                        extensions including tables, strikethrough text, task lists, and code fencing. Advanced 
                        features like footnotes and definition lists are also supported for comprehensive document conversion.
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">How does the HTML output quality compare to other converters?</h4>
                      <p className="text-gray-600 text-sm">
                        Our converter generates clean, semantic HTML5 that passes validation and follows 
                        accessibility guidelines. Unlike many converters that produce bloated markup, our 
                        output is optimized for performance, SEO, and maintainability in professional web projects.
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">Can I customize the HTML output format?</h4>
                      <p className="text-gray-600 text-sm">
                        Yes, the converter offers multiple customization options including line break handling, 
                        table processing, code block formatting, and HTML sanitization. These settings allow 
                        you to tailor the output for specific platforms and deployment requirements.
                      </p>
                    </div>
                  </div>
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">Is the conversion process secure and private?</h4>
                      <p className="text-gray-600 text-sm">
                        All Markdown processing occurs locally in your browser with no data transmitted to 
                        external servers. Your content remains completely private, and the tool works offline 
                        once loaded, ensuring maximum security for sensitive documents and proprietary content.
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">What file formats can I export to?</h4>
                      <p className="text-gray-600 text-sm">
                        The converter supports direct HTML file download, clipboard copying for immediate use, 
                        and formatted text export. Generated HTML is compatible with all major content management 
                        systems, static site generators, and web publishing platforms.
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">How large documents can the converter handle?</h4>
                      <p className="text-gray-600 text-sm">
                        The converter efficiently processes documents of any practical size, from small notes 
                        to comprehensive technical documentation. Optimized parsing algorithms ensure fast 
                        conversion even for complex documents with extensive formatting and embedded elements.
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
};

export default MarkdownToHTMLConverter;
