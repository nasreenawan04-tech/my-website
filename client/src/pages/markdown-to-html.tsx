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
    <>
      <Helmet>
        <title>Markdown to HTML Converter - Free Online Tool | CalcEasy</title>
        <meta name="description" content="Convert Markdown text to HTML format instantly. Free online tool with support for headers, lists, links, code blocks, tables, and more. No signup required." />
        <meta name="keywords" content="markdown to html, markdown converter, md to html, markdown parser, text converter" />
        <meta property="og:title" content="Markdown to HTML Converter - Free Online Tool" />
        <meta property="og:description" content="Convert Markdown text to HTML format instantly with our free online tool." />
        <meta property="og:type" content="website" />
        <link rel="canonical" href="/tools/markdown-to-html" />
      </Helmet>

      <div className="min-h-screen flex flex-col" data-testid="page-markdown-to-html">
        <Header />
        
        <main className="flex-1 bg-neutral-50">
          {/* Hero Section */}
          <section className="bg-gradient-to-r from-yellow-500 to-orange-600 text-white py-16">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <div className="w-20 h-20 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <i className="fab fa-markdown text-3xl"></i>
              </div>
              <h1 className="text-4xl sm:text-5xl font-bold mb-4" data-testid="text-page-title">
                Markdown to HTML Converter
              </h1>
              <p className="text-xl text-yellow-100 mb-8 max-w-3xl mx-auto">
                Convert your Markdown text to clean HTML format with support for headers, lists, links, code blocks, and more
              </p>
            </div>
          </section>

          {/* Main Calculator */}
          <section className="py-12">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
              <Card className="shadow-xl">
                <CardContent className="p-8">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Input Section */}
                    <div className="space-y-6">
                      <div>
                        <Label htmlFor="markdown-input" className="text-lg font-semibold text-neutral-700 mb-3 block">
                          Markdown Input
                        </Label>
                        <Textarea
                          id="markdown-input"
                          placeholder="# Hello World&#10;&#10;This is **bold** text and *italic* text.&#10;&#10;- List item 1&#10;- List item 2&#10;&#10;[Link](https://example.com)"
                          className="min-h-[300px] text-sm font-mono"
                          value={markdownInput}
                          onChange={(e) => setMarkdownInput(e.target.value)}
                          data-testid="input-markdown"
                        />
                        <div className="mt-2 text-sm text-neutral-500">
                          {markdownInput.length} characters, {markdownInput.trim().split(/\s+/).length} words
                        </div>
                      </div>

                      {/* Conversion Options */}
                      <div className="space-y-4">
                        <h3 className="font-semibold text-neutral-700">Conversion Options</h3>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="line-breaks" className="text-sm font-medium mb-2 block">
                              Line Breaks
                            </Label>
                            <Select value={options.lineBreaks} onValueChange={(value: 'standard' | 'github') => 
                              setOptions(prev => ({ ...prev, lineBreaks: value }))}>
                              <SelectTrigger data-testid="select-line-breaks">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="standard">Standard</SelectItem>
                                <SelectItem value="github">GitHub Style</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
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

                      {/* Action Buttons */}
                      <div className="flex flex-col sm:flex-row gap-3">
                        <Button 
                          onClick={handleConvert} 
                          className="flex-1 bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700"
                          data-testid="button-convert"
                        >
                          <i className="fas fa-exchange-alt mr-2"></i>
                          Convert to HTML
                        </Button>
                        <Button 
                          variant="outline" 
                          onClick={handleClear}
                          data-testid="button-clear"
                        >
                          <i className="fas fa-trash mr-2"></i>
                          Clear
                        </Button>
                      </div>
                    </div>

                    {/* Results Section */}
                    <div className="space-y-6">
                      <div>
                        <Label className="text-lg font-semibold text-neutral-700 mb-3 block">
                          HTML Output
                        </Label>
                        
                        {conversionResult ? (
                          <div className="space-y-4">
                            <Textarea
                              value={conversionResult.htmlOutput}
                              readOnly
                              className="min-h-[300px] text-sm font-mono bg-neutral-50"
                              data-testid="output-html"
                            />
                            
                            <div className="flex flex-col sm:flex-row gap-3">
                              <Button 
                                variant="outline" 
                                onClick={() => copyToClipboard(conversionResult.htmlOutput)}
                                className="flex-1"
                                data-testid="button-copy"
                              >
                                <i className="fas fa-copy mr-2"></i>
                                Copy HTML
                              </Button>
                              <Button 
                                variant="outline" 
                                onClick={downloadHTML}
                                className="flex-1"
                                data-testid="button-download"
                              >
                                <i className="fas fa-download mr-2"></i>
                                Download
                              </Button>
                            </div>

                            <div className="bg-neutral-100 p-4 rounded-lg text-sm">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <span className="font-semibold">Word Count:</span> {conversionResult.wordCount}
                                </div>
                                <div>
                                  <span className="font-semibold">Character Count:</span> {conversionResult.characterCount}
                                </div>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="min-h-[300px] border-2 border-dashed border-neutral-300 rounded-lg flex items-center justify-center text-neutral-500">
                            <div className="text-center">
                              <i className="fas fa-code text-4xl mb-4"></i>
                              <p>HTML output will appear here after conversion</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Conversion History */}
                  {conversionHistory.length > 0 && (
                    <div className="mt-8 pt-8 border-t border-neutral-200">
                      <h3 className="text-lg font-semibold text-neutral-700 mb-4">Conversion History</h3>
                      <div className="space-y-3 max-h-48 overflow-y-auto">
                        {conversionHistory.map((result, index) => (
                          <div 
                            key={index} 
                            className="p-3 bg-neutral-50 rounded-lg cursor-pointer hover:bg-neutral-100 transition-colors"
                            onClick={() => {
                              setMarkdownInput(result.originalMarkdown);
                              setConversionResult(result);
                            }}
                          >
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <p className="text-sm text-neutral-600 truncate">
                                  {result.originalMarkdown.slice(0, 100)}...
                                </p>
                                <p className="text-xs text-neutral-500 mt-1">
                                  {result.wordCount} words • {result.timestamp.toLocaleTimeString()}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Educational Content */}
          <section className="py-12 bg-white">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="prose prose-lg max-w-none">
                <h2 className="text-3xl font-bold text-neutral-800 mb-8">About Markdown to HTML Conversion</h2>
                
                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-xl font-semibold text-neutral-700 mb-4">What is Markdown?</h3>
                    <p className="text-neutral-600 mb-4">
                      Markdown is a lightweight markup language with plain-text formatting syntax. It's designed to be easy to read and write, 
                      and can be converted to HTML and many other formats.
                    </p>
                    <ul className="text-neutral-600 space-y-2">
                      <li>• Simple and readable syntax</li>
                      <li>• Widely supported across platforms</li>
                      <li>• Perfect for documentation and web content</li>
                      <li>• No complex tags or formatting</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="text-xl font-semibold text-neutral-700 mb-4">Common Use Cases</h3>
                    <ul className="text-neutral-600 space-y-2">
                      <li>• Converting README files to HTML</li>
                      <li>• Creating web content from Markdown</li>
                      <li>• Documentation conversion</li>
                      <li>• Blog post formatting</li>
                      <li>• Email template creation</li>
                      <li>• Static site generation</li>
                    </ul>
                  </div>
                </div>

                <div className="mt-8">
                  <h3 className="text-xl font-semibold text-neutral-700 mb-4">Supported Markdown Features</h3>
                  <div className="bg-neutral-50 p-6 rounded-lg">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-semibold text-neutral-700 mb-2">Text Formatting</h4>
                        <ul className="text-sm text-neutral-600 space-y-1">
                          <li>• Headers (H1, H2, H3)</li>
                          <li>• Bold and italic text</li>
                          <li>• Strikethrough text</li>
                          <li>• Inline code</li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-semibold text-neutral-700 mb-2">Structure Elements</h4>
                        <ul className="text-sm text-neutral-600 space-y-1">
                          <li>• Unordered and ordered lists</li>
                          <li>• Links and images</li>
                          <li>• Code blocks</li>
                          <li>• Tables (optional)</li>
                          <li>• Blockquotes</li>
                          <li>• Horizontal rules</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default MarkdownToHTMLConverter;