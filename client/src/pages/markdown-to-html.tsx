
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
  lineBreaks: 'standard' | 'github';
  enableTables: boolean;
  enableCodeBlocks: boolean;
  enableEmoji: boolean;
  sanitizeHTML: boolean;
  showPreview: boolean;
  addPrefix: string;
  addSuffix: string;
}

interface ConversionResult {
  originalMarkdown: string;
  htmlOutput: string;
  wordCount: number;
  characterCount: number;
  lineCount: number;
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
    showPreview: false,
    addPrefix: '',
    addSuffix: ''
  });

  // Enhanced markdown to HTML conversion function
  const convertMarkdownToHTML = (markdown: string, opts: ConversionOptions): string => {
    if (!markdown) return '';
    
    let html = markdown;

    // Headers (H1-H6)
    html = html.replace(/^###### (.*$)/gm, '<h6>$1</h6>');
    html = html.replace(/^##### (.*$)/gm, '<h5>$1</h5>');
    html = html.replace(/^#### (.*$)/gm, '<h4>$1</h4>');
    html = html.replace(/^### (.*$)/gm, '<h3>$1</h3>');
    html = html.replace(/^## (.*$)/gm, '<h2>$1</h2>');
    html = html.replace(/^# (.*$)/gm, '<h1>$1</h1>');

    // Bold, Italic, and Combined
    html = html.replace(/\*\*\*(.*?)\*\*\*/g, '<strong><em>$1</em></strong>');
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
    html = html.replace(/\_\_(.*?)\_\_/g, '<strong>$1</strong>');
    html = html.replace(/\_(.*?)\_/g, '<em>$1</em>');

    // Strikethrough
    html = html.replace(/~~(.*?)~~/g, '<del>$1</del>');

    // Code blocks and inline code
    if (opts.enableCodeBlocks) {
      // Code blocks with language specification
      html = html.replace(/```(\w+)?\n([\s\S]*?)```/g, (match, lang, code) => {
        const langClass = lang ? ` class="language-${lang}"` : '';
        return `<pre><code${langClass}>${code.trim()}</code></pre>`;
      });
      
      // Simple code blocks
      html = html.replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>');
      
      // Inline code
      html = html.replace(/`(.*?)`/g, '<code>$1</code>');
    }

    // Links and Images
    html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1">');
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');

    // Auto-links
    html = html.replace(/(https?:\/\/[^\s]+)/g, '<a href="$1">$1</a>');

    // Lists
    // Unordered lists
    html = html.replace(/^\* (.+$)/gm, '<li>$1</li>');
    html = html.replace(/^- (.+$)/gm, '<li>$1</li>');
    html = html.replace(/^\+ (.+$)/gm, '<li>$1</li>');
    
    // Ordered lists
    html = html.replace(/^(\d+)\. (.+$)/gm, '<li>$2</li>');
    
    // Wrap consecutive list items
    html = html.replace(/(<li>.*<\/li>)/g, '<ul>$1</ul>');
    html = html.replace(/<\/ul>\s*<ul>/g, '');

    // Tables (if enabled)
    if (opts.enableTables) {
      // Convert table rows
      const tableRegex = /^\|(.+)\|$/gm;
      let tableRows = [];
      let match;
      
      while ((match = tableRegex.exec(html)) !== null) {
        const cells = match[1].split('|').map(cell => cell.trim());
        if (cells.every(cell => cell.match(/^[\s\-:]+$/))) {
          // Skip separator rows
          continue;
        }
        const cellTags = cells.map(cell => `<td>${cell}</td>`).join('');
        tableRows.push(`<tr>${cellTags}</tr>`);
      }
      
      if (tableRows.length > 0) {
        const tableHTML = `<table>${tableRows.join('')}</table>`;
        html = html.replace(/^\|.+\|$/gm, '').replace(/\n\n+/g, '\n\n');
        html += '\n' + tableHTML;
      }
    }

    // Blockquotes
    html = html.replace(/^> (.+$)/gm, '<blockquote>$1</blockquote>');
    html = html.replace(/<\/blockquote>\s*<blockquote>/g, '<br>');

    // Horizontal rules
    html = html.replace(/^---$/gm, '<hr>');
    html = html.replace(/^\*\*\*$/gm, '<hr>');

    // Line breaks
    if (opts.lineBreaks === 'github') {
      html = html.replace(/\n/g, '<br>\n');
    } else {
      // Convert double line breaks to paragraphs
      html = html.replace(/\n\n/g, '</p><p>');
      html = `<p>${html}</p>`;
    }

    // Emoji conversion (basic)
    if (opts.enableEmoji) {
      const emojiMap: { [key: string]: string } = {
        ':smile:': '😊', ':heart:': '❤️', ':thumbsup:': '👍', ':fire:': '🔥',
        ':star:': '⭐', ':check:': '✅', ':x:': '❌', ':warning:': '⚠️',
        ':info:': 'ℹ️', ':rocket:': '🚀', ':tada:': '🎉', ':eyes:': '👀'
      };
      
      Object.entries(emojiMap).forEach(([code, emoji]) => {
        html = html.replace(new RegExp(code, 'g'), emoji);
      });
    }

    // Clean up extra paragraph tags around block elements
    html = html.replace(/<p>(<h[1-6]>.*<\/h[1-6]>)<\/p>/g, '$1');
    html = html.replace(/<p>(<ul>.*<\/ul>)<\/p>/g, '$1');
    html = html.replace(/<p>(<table>.*<\/table>)<\/p>/g, '$1');
    html = html.replace(/<p>(<blockquote>.*<\/blockquote>)<\/p>/g, '$1');
    html = html.replace(/<p>(<hr>)<\/p>/g, '$1');
    html = html.replace(/<p>(<pre>.*<\/pre>)<\/p>/g, '$1');
    html = html.replace(/<p><\/p>/g, '');

    // Apply prefix and suffix if provided
    if (opts.addPrefix || opts.addSuffix) {
      html = `${opts.addPrefix}${html}${opts.addSuffix}`;
    }

    return html.trim();
  };

  const handleConvert = () => {
    if (!markdownInput.trim()) {
      setConversionResult(null);
      return;
    }

    try {
      const htmlOutput = convertMarkdownToHTML(markdownInput, options);
      const wordCount = markdownInput.trim().split(/\s+/).filter(word => word.length > 0).length;
      const characterCount = markdownInput.length;
      const lineCount = markdownInput.split('\n').length;

      const result: ConversionResult = {
        originalMarkdown: markdownInput,
        htmlOutput,
        wordCount,
        characterCount,
        lineCount,
        timestamp: new Date()
      };

      setConversionResult(result);

      // Add to history (keep last 10)
      setConversionHistory(prev => {
        const updated = [result, ...prev.filter(item => item.originalMarkdown !== markdownInput)];
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

  const handleClear = () => {
    setMarkdownInput('');
    setConversionResult(null);
  };

  const handleSampleMarkdown = () => {
    setMarkdownInput(`# Welcome to Markdown

This is a **bold** statement and this is *italic* text.

## Features

- Easy to write
- Easy to read
- Converts to HTML

### Code Example

\`\`\`javascript
function hello() {
  console.log("Hello World!");
}
\`\`\`

> This is a blockquote with some important information.

[Visit our website](https://example.com) for more details.`);
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
      showPreview: false,
      addPrefix: '',
      addSuffix: ''
    });
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
        <title>Markdown to HTML Converter - Convert MD to HTML Online | DapsiWow</title>
        <meta name="description" content="Free online Markdown to HTML converter tool. Transform Markdown text to clean HTML format with support for headers, lists, links, code blocks, tables, and more. Real-time conversion with advanced customization options." />
        <meta name="keywords" content="markdown to html converter, md to html, markdown parser, text converter, markdown compiler, html generator, documentation converter, markup language, web development tools, online markdown converter" />
        <meta property="og:title" content="Markdown to HTML Converter - Convert MD to HTML Online | DapsiWow" />
        <meta property="og:description" content="Professional Markdown to HTML converter with real-time conversion, syntax highlighting, and advanced formatting options. Perfect for developers and content creators." />
        <meta property="og:type" content="website" />
        <meta name="robots" content="index, follow" />
        <meta name="author" content="DapsiWow" />
        <link rel="canonical" href="https://dapsiwow.com/tools/markdown-to-html" />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            "name": "Markdown to HTML Converter",
            "description": "Professional online tool for converting Markdown text to HTML format with real-time conversion, advanced formatting options, and comprehensive syntax support.",
            "url": "https://dapsiwow.com/tools/markdown-to-html",
            "applicationCategory": "DeveloperApplication",
            "operatingSystem": "Any",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "USD"
            },
            "featureList": [
              "Real-time Markdown to HTML conversion",
              "Support for headers, lists, and links",
              "Code block and syntax highlighting",
              "Table conversion support",
              "Blockquotes and horizontal rules",
              "Custom prefix and suffix options"
            ]
          })}
        </script>
      </Helmet>

      <Header />

      <main>
        {/* Hero Section */}
        <section className="relative py-12 sm:py-16 md:py-20 lg:py-24 xl:py-32 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-orange-600/10 to-yellow-600/20"></div>
          <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="space-y-6 sm:space-y-8">
              <div className="inline-flex items-center px-3 sm:px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full border border-orange-200">
                <span className="text-xs sm:text-sm font-medium text-orange-700">Professional Markup Converter</span>
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-slate-900 leading-tight" data-testid="text-page-title">
                Markdown to HTML
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-yellow-600">
                  Converter
                </span>
              </h1>
              <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-slate-600 max-w-4xl mx-auto leading-relaxed px-2">
                Transform Markdown text into clean HTML format with advanced formatting and real-time conversion
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
                    {/* Line Break Style Selection */}
                    <div className="space-y-3">
                      <Label htmlFor="linebreaks-select" className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                        Line Break Style
                      </Label>
                      <Select
                        value={options.lineBreaks}
                        onValueChange={(value: 'standard' | 'github') => 
                          updateOption('lineBreaks', value)
                        }
                      >
                        <SelectTrigger className="h-12 sm:h-14 border-2 border-gray-200 rounded-xl text-base sm:text-lg" data-testid="select-linebreaks">
                          <SelectValue placeholder="Select line break style" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="standard">Standard (Paragraphs)</SelectItem>
                          <SelectItem value="github">GitHub Style (Line Breaks)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Markdown Input */}
                    <div className="space-y-3">
                      <Label htmlFor="markdown-input" className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                        Markdown Text
                      </Label>
                      <Textarea
                        id="markdown-input"
                        value={markdownInput}
                        onChange={(e) => setMarkdownInput(e.target.value)}
                        className="min-h-[100px] sm:min-h-[120px] lg:min-h-[140px] text-base sm:text-lg border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:ring-orange-500 font-mono resize-none"
                        placeholder="# Hello World&#10;&#10;This is **bold** text and *italic* text.&#10;&#10;- List item 1&#10;- List item 2&#10;&#10;[Link](https://example.com)"
                        data-testid="textarea-markdown-input"
                      />
                      <div className="text-sm text-gray-500">
                        {markdownInput.length} characters, {markdownInput.trim().split(/\s+/).filter(word => word.length > 0).length} words
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
                            Advanced Conversion Settings
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
                                <p className="text-xs text-gray-500">Convert Markdown tables to HTML</p>
                              </div>
                              <Switch
                                checked={options.enableTables}
                                onCheckedChange={(value) => updateOption('enableTables', value)}
                                data-testid="switch-enable-tables"
                              />
                            </div>

                            <div className="flex items-center justify-between gap-2">
                              <div className="space-y-1 flex-1 min-w-0">
                                <Label className="text-xs sm:text-sm font-medium">Enable Code Blocks</Label>
                                <p className="text-xs text-gray-500">Process code blocks and inline code</p>
                              </div>
                              <Switch
                                checked={options.enableCodeBlocks}
                                onCheckedChange={(value) => updateOption('enableCodeBlocks', value)}
                                data-testid="switch-enable-code"
                              />
                            </div>

                            <div className="flex items-center justify-between gap-2">
                              <div className="space-y-1 flex-1 min-w-0">
                                <Label className="text-xs sm:text-sm font-medium">Enable Emoji</Label>
                                <p className="text-xs text-gray-500">Convert emoji codes to Unicode</p>
                              </div>
                              <Switch
                                checked={options.enableEmoji}
                                onCheckedChange={(value) => updateOption('enableEmoji', value)}
                                data-testid="switch-enable-emoji"
                              />
                            </div>

                            <div className="flex items-center justify-between gap-2">
                              <div className="space-y-1 flex-1 min-w-0">
                                <Label className="text-xs sm:text-sm font-medium">Show Preview</Label>
                                <p className="text-xs text-gray-500">Display rendered HTML preview</p>
                              </div>
                              <Switch
                                checked={options.showPreview}
                                onCheckedChange={(value) => updateOption('showPreview', value)}
                                data-testid="switch-show-preview"
                              />
                            </div>
                          </div>

                          {/* HTML Customization Options */}
                          <div className="space-y-4 bg-gray-50 rounded-xl p-4 sm:p-6">
                            <h4 className="text-sm sm:text-base font-semibold text-gray-900">HTML Customization</h4>
                            
                            <div className="space-y-2">
                              <Label className="text-xs sm:text-sm font-medium">Add Prefix</Label>
                              <Input
                                value={options.addPrefix}
                                onChange={(e) => updateOption('addPrefix', e.target.value)}
                                placeholder="e.g., <div class='content'>"
                                className="text-sm h-10 sm:h-12 border-2 border-gray-200 rounded-lg"
                                data-testid="input-add-prefix"
                              />
                              <p className="text-xs text-gray-500">HTML to add before converted content</p>
                            </div>

                            <div className="space-y-2">
                              <Label className="text-xs sm:text-sm font-medium">Add Suffix</Label>
                              <Input
                                value={options.addSuffix}
                                onChange={(e) => updateOption('addSuffix', e.target.value)}
                                placeholder="e.g., </div>"
                                className="text-sm h-10 sm:h-12 border-2 border-gray-200 rounded-lg"
                                data-testid="input-add-suffix"
                              />
                              <p className="text-xs text-gray-500">HTML to add after converted content</p>
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
                      className="flex-1 h-12 sm:h-14 bg-gradient-to-r from-orange-600 to-yellow-600 hover:from-orange-700 hover:to-yellow-700 text-white font-semibold text-base sm:text-lg rounded-xl shadow-lg transform transition-all duration-200 hover:scale-105"
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
                <div className="bg-gradient-to-br from-gray-50 to-orange-50 p-4 sm:p-6 md:p-8 lg:p-10 xl:p-12 border-t">
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6 sm:mb-8">Conversion Results</h2>

                  {conversionResult && conversionResult.originalMarkdown ? (
                    <div className="space-y-3 sm:space-y-4" data-testid="conversion-results">
                      {/* HTML Output Display */}
                      <div className="bg-orange-50 border-2 border-orange-200 rounded-xl p-3 sm:p-4">
                        <div className="flex items-center justify-between mb-3 gap-3">
                          <div className="flex-1 min-w-0">
                            <h3 className="text-sm sm:text-base font-semibold text-gray-900 truncate">HTML Output</h3>
                            <p className="text-xs sm:text-sm text-gray-600 break-words">Clean HTML markup ready for use</p>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              onClick={() => handleCopyToClipboard(conversionResult.htmlOutput)}
                              variant="outline"
                              size="sm"
                              className="text-xs px-2 sm:px-3 py-2 flex-shrink-0 rounded-lg min-w-[60px] sm:min-w-[70px] h-11 sm:h-9 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
                              data-testid="button-copy-html"
                            >
                              Copy
                            </Button>
                            <Button
                              onClick={downloadHTML}
                              variant="outline"
                              size="sm"
                              className="text-xs px-2 sm:px-3 py-2 flex-shrink-0 rounded-lg min-w-[60px] sm:min-w-[70px] h-11 sm:h-9 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
                              data-testid="button-download"
                            >
                              Download
                            </Button>
                          </div>
                        </div>
                        <div 
                          className="bg-white p-2 sm:p-3 rounded-lg border border-gray-200 text-xs sm:text-sm break-all min-h-[40px] sm:min-h-[44px] flex items-center font-mono"
                          data-testid="html-output"
                        >
                          {conversionResult.htmlOutput || '(empty result)'}
                        </div>
                      </div>

                      {/* Preview Display */}
                      {options.showPreview && (
                        <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-3 sm:p-4">
                          <div className="flex items-center justify-between mb-3 gap-3">
                            <div className="flex-1 min-w-0">
                              <h4 className="text-sm sm:text-base font-semibold text-gray-900 truncate">HTML Preview</h4>
                              <p className="text-xs sm:text-sm text-gray-600 break-words">Rendered HTML output</p>
                            </div>
                          </div>
                          <div 
                            className="bg-white p-2 sm:p-3 rounded-lg border border-gray-200 min-h-[40px] sm:min-h-[44px]"
                            data-testid="html-preview"
                            dangerouslySetInnerHTML={{ __html: conversionResult.htmlOutput }}
                          />
                        </div>
                      )}

                      {/* Conversion Statistics */}
                      <div className="bg-white rounded-xl p-3 sm:p-4 shadow-sm border border-gray-200" data-testid="conversion-statistics">
                        <h3 className="text-sm sm:text-base font-bold text-gray-900 mb-4">Conversion Statistics</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          <div className="bg-orange-50 rounded-lg p-4 text-center">
                            <div className="text-2xl font-bold text-orange-600" data-testid="word-count">{conversionResult.wordCount}</div>
                            <div className="text-sm text-orange-700 font-medium">Words</div>
                          </div>
                          <div className="bg-yellow-50 rounded-lg p-4 text-center">
                            <div className="text-2xl font-bold text-yellow-600" data-testid="char-count">{conversionResult.characterCount}</div>
                            <div className="text-sm text-yellow-700 font-medium">Characters</div>
                          </div>
                          <div className="bg-blue-50 rounded-lg p-4 text-center">
                            <div className="text-2xl font-bold text-blue-600" data-testid="line-count">{conversionResult.lineCount}</div>
                            <div className="text-sm text-blue-700 font-medium">Lines</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12 sm:py-16" data-testid="no-results">
                      <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-200 rounded-full mx-auto mb-4 sm:mb-6 flex items-center justify-center">
                        <div className="text-2xl sm:text-3xl font-bold text-gray-400">MD</div>
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
                    <strong>Markdown to HTML conversion</strong> is the essential process of transforming lightweight markup text written in Markdown syntax into properly formatted HTML code. This conversion enables content creators, developers, and writers to create web-ready content using simple, human-readable syntax that automatically generates clean, semantic HTML markup for websites, documentation, and digital publishing.
                  </p>
                  <p>
                    Our professional Markdown converter supports comprehensive syntax including headers, bold and italic text, links, images, lists, code blocks, tables, blockquotes, and horizontal rules. With real-time conversion and advanced customization options, you can transform your Markdown content into production-ready HTML instantly while maintaining full control over formatting and output structure.
                  </p>
                  <p>
                    The tool features intelligent parsing that handles complex nested elements, automatic link detection, code syntax highlighting preparation, and customizable line break processing. Whether you're converting documentation, blog posts, README files, or technical content, our converter ensures accurate and reliable HTML output every time.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Markdown Syntax Guide */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Complete Markdown Syntax Guide</h2>
                <p className="text-gray-600 mb-8">Master Markdown syntax with our comprehensive guide covering all essential formatting elements supported by our converter. Each syntax element is designed for simplicity while providing powerful formatting capabilities.</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div className="bg-blue-50 rounded-lg p-4">
                      <h3 className="font-semibold text-blue-900 mb-3">Text Formatting</h3>
                      <div className="space-y-2 text-sm">
                        <div className="grid grid-cols-1 gap-1">
                          <code className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">**Bold Text**</code>
                          <code className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">*Italic Text*</code>
                          <code className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">***Bold Italic***</code>
                          <code className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">~~Strikethrough~~</code>
                        </div>
                      </div>
                    </div>

                    <div className="bg-green-50 rounded-lg p-4">
                      <h3 className="font-semibold text-green-900 mb-3">Headers</h3>
                      <div className="space-y-1 text-sm">
                        <code className="block bg-green-100 text-green-800 px-2 py-1 rounded text-xs"># H1 Header</code>
                        <code className="block bg-green-100 text-green-800 px-2 py-1 rounded text-xs">## H2 Header</code>
                        <code className="block bg-green-100 text-green-800 px-2 py-1 rounded text-xs">### H3 Header</code>
                        <code className="block bg-green-100 text-green-800 px-2 py-1 rounded text-xs">#### H4 Header</code>
                      </div>
                    </div>

                    <div className="bg-purple-50 rounded-lg p-4">
                      <h3 className="font-semibold text-purple-900 mb-3">Lists</h3>
                      <div className="space-y-1 text-sm">
                        <code className="block bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs">- Unordered list item</code>
                        <code className="block bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs">* Alternative bullet</code>
                        <code className="block bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs">1. Ordered list item</code>
                        <code className="block bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs">2. Numbered item</code>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="bg-orange-50 rounded-lg p-4">
                      <h3 className="font-semibold text-orange-900 mb-3">Links & Images</h3>
                      <div className="space-y-1 text-sm">
                        <code className="block bg-orange-100 text-orange-800 px-2 py-1 rounded text-xs">[Link Text](URL)</code>
                        <code className="block bg-orange-100 text-orange-800 px-2 py-1 rounded text-xs">![Alt Text](image.jpg)</code>
                        <code className="block bg-orange-100 text-orange-800 px-2 py-1 rounded text-xs">https://auto-link.com</code>
                      </div>
                    </div>

                    <div className="bg-teal-50 rounded-lg p-4">
                      <h3 className="font-semibold text-teal-900 mb-3">Code & Quotes</h3>
                      <div className="space-y-1 text-sm">
                        <code className="block bg-teal-100 text-teal-800 px-2 py-1 rounded text-xs">`inline code`</code>
                        <code className="block bg-teal-100 text-teal-800 px-2 py-1 rounded text-xs">```code block```</code>
                        <code className="block bg-teal-100 text-teal-800 px-2 py-1 rounded text-xs">&gt; Blockquote text</code>
                        <code className="block bg-teal-100 text-teal-800 px-2 py-1 rounded text-xs">--- Horizontal rule</code>
                      </div>
                    </div>

                    <div className="bg-red-50 rounded-lg p-4">
                      <h3 className="font-semibold text-red-900 mb-3">Tables</h3>
                      <div className="text-sm">
                        <code className="block bg-red-100 text-red-800 px-2 py-1 rounded text-xs">| Column 1 | Column 2 |</code>
                        <code className="block bg-red-100 text-red-800 px-2 py-1 rounded text-xs">|----------|----------|</code>
                        <code className="block bg-red-100 text-red-800 px-2 py-1 rounded text-xs">| Data 1   | Data 2   |</code>
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
                  <p className="text-gray-600 mb-6">Markdown to HTML conversion serves diverse professionals across multiple industries and creative fields, streamlining content creation and publication workflows.</p>
                  
                  <div className="space-y-4">
                    <div className="bg-blue-50 rounded-lg p-4">
                      <h3 className="font-semibold text-blue-900 mb-2">Technical Documentation</h3>
                      <p className="text-blue-800 text-sm">Convert README files, API documentation, user guides, and technical specifications into web-ready HTML for publication on websites and documentation platforms.</p>
                    </div>
                    
                    <div className="bg-green-50 rounded-lg p-4">
                      <h3 className="font-semibold text-green-900 mb-2">Content Management</h3>
                      <p className="text-green-800 text-sm">Transform blog posts, articles, and editorial content from Markdown drafts into HTML format for CMS integration and web publishing workflows.</p>
                    </div>
                    
                    <div className="bg-purple-50 rounded-lg p-4">
                      <h3 className="font-semibold text-purple-900 mb-2">Static Site Generation</h3>
                      <p className="text-purple-800 text-sm">Generate HTML content for static site generators, Jekyll sites, and GitHub Pages from Markdown source files with consistent formatting.</p>
                    </div>

                    <div className="bg-orange-50 rounded-lg p-4">
                      <h3 className="font-semibold text-orange-900 mb-2">Email Templates</h3>
                      <p className="text-orange-800 text-sm">Create HTML email templates and newsletters from easy-to-edit Markdown content, ensuring consistent formatting across email clients.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
                <CardContent className="p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Advanced Features & Benefits</h2>
                  <p className="text-gray-600 mb-6">Our Markdown to HTML converter offers professional-grade features designed to meet the demands of modern content creation and development workflows.</p>
                  
                  <div className="space-y-4">
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-400 p-4 rounded-r-lg">
                      <h4 className="font-semibold text-blue-900 mb-2">Real-Time Processing</h4>
                      <p className="text-blue-800 text-sm">Instant conversion as you type with intelligent debouncing and live preview capabilities for immediate feedback and rapid iteration.</p>
                    </div>
                    
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-l-4 border-green-400 p-4 rounded-r-lg">
                      <h4 className="font-semibold text-green-900 mb-2">Comprehensive Syntax Support</h4>
                      <p className="text-green-800 text-sm">Full CommonMark compliance with extended syntax including tables, strikethrough, task lists, and automatic link detection.</p>
                    </div>
                    
                    <div className="bg-gradient-to-r from-purple-50 to-violet-50 border-l-4 border-purple-400 p-4 rounded-r-lg">
                      <h4 className="font-semibold text-purple-900 mb-2">Customization Options</h4>
                      <p className="text-purple-800 text-sm">Advanced settings for line break handling, HTML wrapping, emoji conversion, and output formatting to match your specific requirements.</p>
                    </div>
                    
                    <div className="bg-gradient-to-r from-orange-50 to-red-50 border-l-4 border-orange-400 p-4 rounded-r-lg">
                      <h4 className="font-semibold text-orange-900 mb-2">Export & Integration</h4>
                      <p className="text-orange-800 text-sm">Direct download capabilities, clipboard integration, and clean HTML output optimized for web standards and accessibility compliance.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Comparison and Best Practices */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Markdown vs HTML: When to Use Each Format</h2>
                <p className="text-gray-600 mb-8">Understanding the strengths and applications of both Markdown and HTML helps you choose the right format for your content creation workflow and publishing requirements.</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">Markdown Advantages</h3>
                    <div className="space-y-4">
                      <div className="bg-green-50 rounded-lg p-4">
                        <h4 className="font-semibold text-green-900 mb-2">Human-Readable Format</h4>
                        <ul className="text-green-800 text-sm space-y-1">
                          <li>• Easy to read in plain text form</li>
                          <li>• Natural writing flow without markup clutter</li>
                          <li>• Version control friendly format</li>
                          <li>• Collaborative editing simplified</li>
                        </ul>
                      </div>
                      <div className="bg-blue-50 rounded-lg p-4">
                        <h4 className="font-semibold text-blue-900 mb-2">Content Focus</h4>
                        <ul className="text-blue-800 text-sm space-y-1">
                          <li>• Writers focus on content, not formatting</li>
                          <li>• Minimal syntax learning curve</li>
                          <li>• Platform-independent authoring</li>
                          <li>• Rapid content creation workflow</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">HTML Advantages</h3>
                    <div className="space-y-4">
                      <div className="bg-purple-50 rounded-lg p-4">
                        <h4 className="font-semibold text-purple-900 mb-2">Complete Control</h4>
                        <ul className="text-purple-800 text-sm space-y-1">
                          <li>• Precise formatting and styling control</li>
                          <li>• Custom attributes and metadata</li>
                          <li>• Complex layout structures possible</li>
                          <li>• Full semantic markup support</li>
                        </ul>
                      </div>
                      <div className="bg-orange-50 rounded-lg p-4">
                        <h4 className="font-semibold text-orange-900 mb-2">Web Integration</h4>
                        <ul className="text-orange-800 text-sm space-y-1">
                          <li>• Direct browser rendering capability</li>
                          <li>• CSS and JavaScript integration</li>
                          <li>• SEO optimization opportunities</li>
                          <li>• Accessibility attribute support</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-8">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Best Practices for Conversion</h3>
                  <div className="bg-gray-50 rounded-lg p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">Before Conversion</h4>
                        <ul className="text-gray-700 text-sm space-y-1">
                          <li>• Validate Markdown syntax for errors</li>
                          <li>• Test complex nested elements</li>
                          <li>• Review link and image references</li>
                          <li>• Consider target HTML standards</li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">After Conversion</h4>
                        <ul className="text-gray-700 text-sm space-y-1">
                          <li>• Validate HTML output for compliance</li>
                          <li>• Test rendering across browsers</li>
                          <li>• Verify accessibility requirements</li>
                          <li>• Optimize for SEO if needed</li>
                        </ul>
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
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">What is Markdown to HTML conversion?</h3>
                      <p className="text-gray-600 text-sm">
                        Markdown to HTML conversion transforms lightweight markup text written in Markdown syntax into properly formatted HTML code. This process enables easy content creation using simple syntax while generating web-ready HTML for websites and applications.
                      </p>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Which Markdown features are supported?</h3>
                      <p className="text-gray-600 text-sm">
                        Our converter supports comprehensive Markdown syntax including headers (H1-H6), text formatting (bold, italic, strikethrough), links, images, lists, code blocks, tables, blockquotes, horizontal rules, and automatic link detection.
                      </p>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Can I customize the HTML output?</h3>
                      <p className="text-gray-600 text-sm">
                        Yes! Advanced options include custom prefix and suffix HTML, line break handling (standard vs GitHub style), feature toggles for tables and code blocks, emoji conversion, and output preview capabilities.
                      </p>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Is the conversion process secure?</h3>
                      <p className="text-gray-600 text-sm">
                        Absolutely secure! All conversion processing happens locally in your browser using client-side JavaScript. No data is transmitted to servers, ensuring complete privacy and confidentiality of your content.
                      </p>
                    </div>
                  </div>
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">How do I handle complex Markdown syntax?</h3>
                      <p className="text-gray-600 text-sm">
                        For complex nested elements like lists within blockquotes or code blocks within tables, ensure proper spacing and indentation. Use our real-time preview to verify formatting and test complex structures before final conversion.
                      </p>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Can I convert large Markdown files?</h3>
                      <p className="text-gray-600 text-sm">
                        Yes, there's no strict size limit, though very large files may take longer to process due to browser memory constraints. The tool displays character, word, and line counts to help monitor processing performance.
                      </p>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">What's the difference between line break styles?</h3>
                      <p className="text-gray-600 text-sm">
                        Standard mode converts double line breaks to paragraphs (proper HTML structure), while GitHub style converts single line breaks to &lt;br&gt; tags, mimicking GitHub's Markdown rendering behavior.
                      </p>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">How do I download the converted HTML?</h3>
                      <p className="text-gray-600 text-sm">
                        After conversion, use the "Download" button to save the HTML output as a .html file to your device. You can also copy the HTML code to clipboard for immediate use in other applications.
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
                <p className="text-gray-600 mb-8">Our Markdown to HTML converter is built with modern web technologies ensuring compatibility, performance, and reliability across all major platforms and devices.</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">Supported Markdown Standards</h3>
                    <div className="space-y-4">
                      <div className="bg-blue-50 rounded-lg p-4">
                        <h4 className="font-semibold text-blue-900 mb-2">Core Syntax</h4>
                        <ul className="text-blue-800 text-sm space-y-1">
                          <li>• CommonMark specification compliance</li>
                          <li>• GitHub Flavored Markdown (GFM) features</li>
                          <li>• Extended syntax elements</li>
                          <li>• Custom HTML passthrough support</li>
                        </ul>
                      </div>
                      <div className="bg-green-50 rounded-lg p-4">
                        <h4 className="font-semibold text-green-900 mb-2">Advanced Features</h4>
                        <ul className="text-green-800 text-sm space-y-1">
                          <li>• Table support with alignment</li>
                          <li>• Code block language detection</li>
                          <li>• Automatic link recognition</li>
                          <li>• Emoji shortcode conversion</li>
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
                    </div>
                  </div>
                </div>

                <div className="mt-8">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Performance & Security Features</h3>
                  <div className="bg-gray-50 rounded-lg p-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">Performance</h4>
                        <ul className="text-gray-700 text-sm space-y-1">
                          <li>• Real-time conversion (300ms debounce)</li>
                          <li>• Client-side processing only</li>
                          <li>• Optimized parsing algorithms</li>
                          <li>• Memory-efficient handling</li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">Security</h4>
                        <ul className="text-gray-700 text-sm space-y-1">
                          <li>• No server data transmission</li>
                          <li>• Local processing only</li>
                          <li>• XSS protection measures</li>
                          <li>• Content sanitization options</li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">Accessibility</h4>
                        <ul className="text-gray-700 text-sm space-y-1">
                          <li>• WCAG 2.1 compliance</li>
                          <li>• Keyboard navigation support</li>
                          <li>• Screen reader compatibility</li>
                          <li>• High contrast mode support</li>
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
