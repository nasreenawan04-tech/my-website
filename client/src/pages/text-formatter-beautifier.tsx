import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';

interface FormatterOptions {
  formatType: 'auto' | 'json' | 'xml' | 'html' | 'css' | 'javascript' | 'text';
  indentSize: number;
  indentType: 'spaces' | 'tabs';
  removeExtraSpaces: boolean;
  removeEmptyLines: boolean;
  sortAttributes: boolean;
  wrapLongLines: boolean;
  lineWrapLength: number;
}

interface FormatterResult {
  formattedText: string;
  originalLength: number;
  formattedLength: number;
  linesAdded: number;
  linesRemoved: number;
  detectedFormat: string;
}

export default function TextFormatterBeautifier() {
  const [inputText, setInputText] = useState('');
  const [result, setResult] = useState<FormatterResult | null>(null);
  const [options, setOptions] = useState<FormatterOptions>({
    formatType: 'auto',
    indentSize: 2,
    indentType: 'spaces',
    removeExtraSpaces: true,
    removeEmptyLines: false,
    sortAttributes: false,
    wrapLongLines: false,
    lineWrapLength: 80
  });

  const detectFormat = (text: string): string => {
    const trimmedText = text.trim();
    
    if (!trimmedText) return 'text';
    
    // JSON detection
    if ((trimmedText.startsWith('{') && trimmedText.endsWith('}')) ||
        (trimmedText.startsWith('[') && trimmedText.endsWith(']'))) {
      try {
        JSON.parse(trimmedText);
        return 'json';
      } catch {
        // Not valid JSON, continue checking
      }
    }
    
    // XML/HTML detection
    if (trimmedText.startsWith('<') && trimmedText.includes('>')) {
      if (trimmedText.includes('<!DOCTYPE html') || 
          trimmedText.includes('<html') || 
          trimmedText.includes('<head') || 
          trimmedText.includes('<body')) {
        return 'html';
      }
      return 'xml';
    }
    
    // CSS detection
    if (trimmedText.includes('{') && trimmedText.includes('}') && 
        (trimmedText.includes(':') || trimmedText.includes(';'))) {
      const cssPatterns = /[\w\-\.#\[\]:\(\)\s,>+~*]+\s*\{[^}]*\}/;
      if (cssPatterns.test(trimmedText)) {
        return 'css';
      }
    }
    
    // JavaScript detection
    if (trimmedText.includes('function') || 
        trimmedText.includes('=>') || 
        trimmedText.includes('var ') || 
        trimmedText.includes('let ') || 
        trimmedText.includes('const ') ||
        trimmedText.includes('console.')) {
      return 'javascript';
    }
    
    return 'text';
  };

  const formatJSON = (text: string, opts: FormatterOptions): string => {
    try {
      const parsed = JSON.parse(text);
      const indent = opts.indentType === 'spaces' ? ' '.repeat(opts.indentSize) : '\t';
      return JSON.stringify(parsed, null, opts.indentType === 'spaces' ? opts.indentSize : '\t');
    } catch {
      return text;
    }
  };

  const formatXML = (text: string, opts: FormatterOptions): string => {
    const indent = opts.indentType === 'spaces' ? ' '.repeat(opts.indentSize) : '\t';
    let formatted = text;
    let level = 0;
    
    // Remove existing formatting
    formatted = formatted.replace(/>\s*</g, '><');
    
    // Add line breaks and indentation
    formatted = formatted.replace(/<(?!\?)/g, (match, offset) => {
      const beforeTag = formatted.substring(0, offset);
      const afterTag = formatted.substring(offset);
      
      if (afterTag.startsWith('</')) {
        level = Math.max(0, level - 1);
        return '\n' + indent.repeat(level) + match;
      } else {
        const result = '\n' + indent.repeat(level) + match;
        if (!afterTag.includes('/>') && !afterTag.startsWith('</')) {
          level++;
        }
        return result;
      }
    });
    
    return formatted.trim();
  };

  const formatHTML = (text: string, opts: FormatterOptions): string => {
    const indent = opts.indentType === 'spaces' ? ' '.repeat(opts.indentSize) : '\t';
    let formatted = text;
    let level = 0;
    
    // Self-closing tags
    const selfClosing = /^(area|base|br|col|embed|hr|img|input|link|meta|param|source|track|wbr)$/i;
    
    // Remove existing formatting
    formatted = formatted.replace(/>\s*</g, '><');
    
    // Split by tags and format
    const parts = formatted.split(/(<\/?[^>]+>)/g);
    const result: string[] = [];
    
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      
      if (part.startsWith('<')) {
        if (part.startsWith('</')) {
          level = Math.max(0, level - 1);
          result.push('\n' + indent.repeat(level) + part);
        } else if (part.endsWith('/>') || selfClosing.test(part.replace(/<(\w+).*/, '$1'))) {
          result.push('\n' + indent.repeat(level) + part);
        } else {
          result.push('\n' + indent.repeat(level) + part);
          level++;
        }
      } else if (part.trim()) {
        result.push(part.trim());
      }
    }
    
    return result.join('').trim();
  };

  const formatCSS = (text: string, opts: FormatterOptions): string => {
    const indent = opts.indentType === 'spaces' ? ' '.repeat(opts.indentSize) : '\t';
    let formatted = text;
    
    // Remove extra spaces
    if (opts.removeExtraSpaces) {
      formatted = formatted.replace(/\s+/g, ' ').trim();
    }
    
    // Format selectors and properties
    formatted = formatted.replace(/\{/g, ' {\n');
    formatted = formatted.replace(/\}/g, '\n}\n');
    formatted = formatted.replace(/;/g, ';\n');
    
    // Add indentation
    const lines = formatted.split('\n');
    const result: string[] = [];
    let insideBlock = false;
    
    for (const line of lines) {
      const trimmedLine = line.trim();
      if (!trimmedLine) continue;
      
      if (trimmedLine.includes('{')) {
        result.push(trimmedLine);
        insideBlock = true;
      } else if (trimmedLine === '}') {
        result.push(trimmedLine);
        insideBlock = false;
      } else if (insideBlock) {
        result.push(indent + trimmedLine);
      } else {
        result.push(trimmedLine);
      }
    }
    
    return result.join('\n');
  };

  const formatJavaScript = (text: string, opts: FormatterOptions): string => {
    const indent = opts.indentType === 'spaces' ? ' '.repeat(opts.indentSize) : '\t';
    let formatted = text;
    let level = 0;
    
    // Basic JavaScript formatting
    formatted = formatted.replace(/\{/g, ' {\n');
    formatted = formatted.replace(/\}/g, '\n}\n');
    formatted = formatted.replace(/;/g, ';\n');
    formatted = formatted.replace(/,(?![^\[\]]*\])/g, ',\n');
    
    const lines = formatted.split('\n');
    const result: string[] = [];
    
    for (const line of lines) {
      const trimmedLine = line.trim();
      if (!trimmedLine) continue;
      
      if (trimmedLine === '}' || trimmedLine.startsWith('}')) {
        level = Math.max(0, level - 1);
      }
      
      result.push(indent.repeat(level) + trimmedLine);
      
      if (trimmedLine.endsWith('{')) {
        level++;
      }
    }
    
    return result.join('\n');
  };

  const formatPlainText = (text: string, opts: FormatterOptions): string => {
    let formatted = text;
    
    if (opts.removeExtraSpaces) {
      formatted = formatted.replace(/ +/g, ' ');
      formatted = formatted.replace(/\t+/g, '\t');
    }
    
    if (opts.removeEmptyLines) {
      formatted = formatted.replace(/\n\s*\n/g, '\n');
    }
    
    if (opts.wrapLongLines) {
      const lines = formatted.split('\n');
      const wrappedLines: string[] = [];
      
      for (const line of lines) {
        if (line.length <= opts.lineWrapLength) {
          wrappedLines.push(line);
        } else {
          const words = line.split(' ');
          let currentLine = '';
          
          for (const word of words) {
            if ((currentLine + ' ' + word).length <= opts.lineWrapLength) {
              currentLine = currentLine ? currentLine + ' ' + word : word;
            } else {
              if (currentLine) {
                wrappedLines.push(currentLine);
                currentLine = word;
              } else {
                wrappedLines.push(word);
              }
            }
          }
          
          if (currentLine) {
            wrappedLines.push(currentLine);
          }
        }
      }
      
      formatted = wrappedLines.join('\n');
    }
    
    return formatted;
  };

  const processText = (text: string, opts: FormatterOptions): FormatterResult => {
    if (!text.trim()) {
      return {
        formattedText: '',
        originalLength: 0,
        formattedLength: 0,
        linesAdded: 0,
        linesRemoved: 0,
        detectedFormat: 'text'
      };
    }

    const originalLines = text.split('\n').length;
    const detectedFormat = opts.formatType === 'auto' ? detectFormat(text) : opts.formatType;
    let formattedText = '';

    switch (detectedFormat) {
      case 'json':
        formattedText = formatJSON(text, opts);
        break;
      case 'xml':
        formattedText = formatXML(text, opts);
        break;
      case 'html':
        formattedText = formatHTML(text, opts);
        break;
      case 'css':
        formattedText = formatCSS(text, opts);
        break;
      case 'javascript':
        formattedText = formatJavaScript(text, opts);
        break;
      default:
        formattedText = formatPlainText(text, opts);
        break;
    }

    const formattedLines = formattedText.split('\n').length;

    return {
      formattedText,
      originalLength: text.length,
      formattedLength: formattedText.length,
      linesAdded: Math.max(0, formattedLines - originalLines),
      linesRemoved: Math.max(0, originalLines - formattedLines),
      detectedFormat: detectedFormat.toUpperCase()
    };
  };

  // Real-time formatting
  useEffect(() => {
    const result = processText(inputText, options);
    setResult(result);
  }, [inputText, options]);

  const updateOption = <K extends keyof FormatterOptions>(
    key: K, 
    value: FormatterOptions[K]
  ) => {
    setOptions(prev => ({ ...prev, [key]: value }));
  };

  const handleClear = () => {
    setInputText('');
  };

  const handleCopyFormatted = () => {
    if (result && result.formattedText) {
      navigator.clipboard.writeText(result.formattedText);
    }
  };

  const handleLoadSample = (type: string) => {
    switch (type) {
      case 'json':
        setInputText('{"name":"John Doe","age":30,"city":"New York","hobbies":["reading","coding","traveling"],"address":{"street":"123 Main St","zip":"10001"},"active":true}');
        break;
      case 'html':
        setInputText('<html><head><title>Sample Page</title></head><body><div class="container"><h1>Hello World</h1><p>This is a sample HTML document.</p><ul><li>Item 1</li><li>Item 2</li></ul></div></body></html>');
        break;
      case 'css':
        setInputText('.container{max-width:1200px;margin:0 auto;padding:20px}.header{background-color:#333;color:white;padding:10px}.button{background-color:#007bff;color:white;border:none;padding:10px 20px;border-radius:5px}');
        break;
      case 'javascript':
        setInputText('function calculateTotal(items){let total=0;for(let i=0;i<items.length;i++){total+=items[i].price*items[i].quantity;}return total;}const cart=[{name:"Product 1",price:29.99,quantity:2},{name:"Product 2",price:15.50,quantity:1}];console.log("Total:",calculateTotal(cart));');
        break;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Helmet>
        <title>Text Formatter & Beautifier - Format Code, JSON, XML, HTML & CSS | DapsiWow</title>
        <meta name="description" content="Free online text formatter and beautifier tool to format and beautify code, JSON, XML, HTML, CSS, JavaScript with proper indentation and structure. Professional code formatting with customizable options." />
        <meta name="keywords" content="text formatter, code beautifier, JSON formatter, XML formatter, HTML formatter, CSS formatter, JavaScript formatter, code indentation, text beautify, format code online, pretty print" />
        <meta property="og:title" content="Text Formatter & Beautifier - Format Code, JSON, XML, HTML & CSS" />
        <meta property="og:description" content="Professional text formatter and code beautifier with support for JSON, XML, HTML, CSS, JavaScript and customizable formatting options." />
        <meta property="og:type" content="website" />
        <meta name="robots" content="index, follow" />
        <meta name="author" content="DapsiWow" />
        <link rel="canonical" href="https://dapsiwow.com/tools/text-formatter-beautifier" />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            "name": "Text Formatter & Beautifier",
            "description": "Free online tool to format and beautify code, JSON, XML, HTML, CSS, and JavaScript with customizable indentation and structure options.",
            "url": "https://dapsiwow.com/tools/text-formatter-beautifier",
            "applicationCategory": "DeveloperApplication",
            "operatingSystem": "Any",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "USD"
            },
            "featureList": [
              "Auto-detect format type",
              "JSON formatting and validation",
              "XML and HTML beautification",
              "CSS formatting with proper indentation",
              "JavaScript code formatting",
              "Customizable indentation options",
              "Remove extra spaces and empty lines",
              "Line wrapping for long text"
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
                <span className="text-xs sm:text-sm font-medium text-blue-700">Professional Code Formatting</span>
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl 2xl:text-8xl font-bold text-slate-900 leading-tight tracking-tight">
                <span className="block">Text Formatter &</span>
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 mt-1 sm:mt-2">
                  Beautifier
                </span>
              </h1>
              <p className="text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl text-slate-600 max-w-sm sm:max-w-lg md:max-w-2xl lg:max-w-3xl xl:max-w-4xl mx-auto leading-relaxed px-2 sm:px-0">
                Format and beautify code, JSON, XML, HTML, CSS with proper indentation and professional structure
              </p>
            </div>
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-4 py-16">
          {/* Main Tool Card */}
          <Card className="bg-white/90 backdrop-blur-sm shadow-2xl border-0 rounded-3xl overflow-hidden">
            <CardContent className="p-0">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-0">
                {/* Input Section */}
                <div className="lg:col-span-2 p-8 lg:p-12 space-y-8">
                  <div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">Text Formatting</h2>
                    <p className="text-gray-600">Enter your text or code to format and beautify with professional indentation</p>
                  </div>

                  {/* Quick Sample Buttons */}
                  <div className="bg-gray-50 rounded-xl p-6 space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900">Quick Samples</h3>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                      <Button
                        onClick={() => handleLoadSample('json')}
                        variant="outline"
                        size="sm"
                        className="text-xs"
                        data-testid="sample-json"
                      >
                        JSON
                      </Button>
                      <Button
                        onClick={() => handleLoadSample('html')}
                        variant="outline"
                        size="sm"
                        className="text-xs"
                        data-testid="sample-html"
                      >
                        HTML
                      </Button>
                      <Button
                        onClick={() => handleLoadSample('css')}
                        variant="outline"
                        size="sm"
                        className="text-xs"
                        data-testid="sample-css"
                      >
                        CSS
                      </Button>
                      <Button
                        onClick={() => handleLoadSample('javascript')}
                        variant="outline"
                        size="sm"
                        className="text-xs"
                        data-testid="sample-javascript"
                      >
                        JavaScript
                      </Button>
                    </div>
                  </div>

                  {/* Text Input */}
                  <div className="space-y-4">
                    <Label htmlFor="input-text" className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                      Text to Format
                    </Label>
                    <Textarea
                      id="input-text"
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      className="min-h-[300px] lg:min-h-[400px] text-base border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-blue-500 resize-none font-mono"
                      placeholder="Paste your text, code, JSON, XML, HTML, CSS, or JavaScript here to format and beautify..."
                      data-testid="textarea-input-text"
                    />
                  </div>

                  {/* Formatting Options */}
                  <div className="bg-gray-50 rounded-xl p-6 space-y-6">
                    <h3 className="text-lg font-semibold text-gray-900">Formatting Options</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-700">Format Type</Label>
                        <Select value={options.formatType} onValueChange={(value: any) => updateOption('formatType', value)}>
                          <SelectTrigger className="h-10 border-2 border-gray-200 rounded-lg" data-testid="select-format-type">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="auto">Auto Detect</SelectItem>
                            <SelectItem value="json">JSON</SelectItem>
                            <SelectItem value="xml">XML</SelectItem>
                            <SelectItem value="html">HTML</SelectItem>
                            <SelectItem value="css">CSS</SelectItem>
                            <SelectItem value="javascript">JavaScript</SelectItem>
                            <SelectItem value="text">Plain Text</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-700">Indentation</Label>
                        <div className="flex gap-2">
                          <Select value={options.indentType} onValueChange={(value: any) => updateOption('indentType', value)}>
                            <SelectTrigger className="h-10 border-2 border-gray-200 rounded-lg" data-testid="select-indent-type">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="spaces">Spaces</SelectItem>
                              <SelectItem value="tabs">Tabs</SelectItem>
                            </SelectContent>
                          </Select>
                          <Select value={options.indentSize.toString()} onValueChange={(value) => updateOption('indentSize', parseInt(value))}>
                            <SelectTrigger className="h-10 border-2 border-gray-200 rounded-lg w-20" data-testid="select-indent-size">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="2">2</SelectItem>
                              <SelectItem value="4">4</SelectItem>
                              <SelectItem value="8">8</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between gap-2">
                          <div className="space-y-1">
                            <Label className="text-sm font-medium">Remove Extra Spaces</Label>
                            <p className="text-xs text-gray-500">Clean up multiple consecutive spaces</p>
                          </div>
                          <Switch
                            checked={options.removeExtraSpaces}
                            onCheckedChange={(value) => updateOption('removeExtraSpaces', value)}
                            data-testid="switch-remove-spaces"
                          />
                        </div>

                        <div className="flex items-center justify-between gap-2">
                          <div className="space-y-1">
                            <Label className="text-sm font-medium">Remove Empty Lines</Label>
                            <p className="text-xs text-gray-500">Remove blank lines from text</p>
                          </div>
                          <Switch
                            checked={options.removeEmptyLines}
                            onCheckedChange={(value) => updateOption('removeEmptyLines', value)}
                            data-testid="switch-remove-empty-lines"
                          />
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="flex items-center justify-between gap-2">
                          <div className="space-y-1">
                            <Label className="text-sm font-medium">Wrap Long Lines</Label>
                            <p className="text-xs text-gray-500">Wrap lines longer than specified length</p>
                          </div>
                          <Switch
                            checked={options.wrapLongLines}
                            onCheckedChange={(value) => updateOption('wrapLongLines', value)}
                            data-testid="switch-wrap-lines"
                          />
                        </div>

                        {options.wrapLongLines && (
                          <div className="space-y-2">
                            <Label className="text-sm font-medium text-gray-700">Line Length</Label>
                            <Select value={options.lineWrapLength.toString()} onValueChange={(value) => updateOption('lineWrapLength', parseInt(value))}>
                              <SelectTrigger className="h-10 border-2 border-gray-200 rounded-lg" data-testid="select-wrap-length">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="60">60</SelectItem>
                                <SelectItem value="80">80</SelectItem>
                                <SelectItem value="100">100</SelectItem>
                                <SelectItem value="120">120</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-4 pt-6">
                    <Button
                      onClick={handleCopyFormatted}
                      className="flex-1 h-14 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold text-lg rounded-xl shadow-lg transform transition-all duration-200 hover:scale-105"
                      disabled={!result || !result.formattedText}
                      data-testid="button-copy-formatted"
                    >
                      Copy Formatted Text
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
                  <h2 className="text-2xl font-bold text-gray-900 mb-8">Formatted Output</h2>

                  {result && result.formattedText ? (
                    <div className="space-y-6" data-testid="formatter-results">
                      {/* Statistics */}
                      <div className="grid grid-cols-1 gap-4">
                        <div className="bg-white rounded-xl p-4 shadow-sm">
                          <div className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-1">Detected Format</div>
                          <div className="text-xl font-bold text-blue-600" data-testid="stat-detected-format">
                            {result.detectedFormat}
                          </div>
                        </div>
                        <div className="bg-white rounded-xl p-4 shadow-sm">
                          <div className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-1">Size Change</div>
                          <div className="text-lg font-bold text-green-600" data-testid="stat-size-change">
                            {result.originalLength} → {result.formattedLength} chars
                          </div>
                        </div>
                        <div className="bg-white rounded-xl p-4 shadow-sm">
                          <div className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-1">Lines Modified</div>
                          <div className="text-lg font-bold text-purple-600" data-testid="stat-lines-modified">
                            +{result.linesAdded} -{result.linesRemoved}
                          </div>
                        </div>
                      </div>

                      {/* Formatted Text Output */}
                      <div className="bg-white rounded-xl p-6 shadow-sm">
                        <Label className="text-sm font-semibold text-gray-800 mb-3 block">Formatted Text</Label>
                        <Textarea
                          value={result.formattedText}
                          readOnly
                          className="min-h-[300px] lg:min-h-[400px] text-sm border-2 border-gray-200 rounded-xl resize-none font-mono"
                          data-testid="textarea-formatted-output"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-16" data-testid="no-formatter-results">
                      <div className="w-20 h-20 bg-gray-200 rounded-full mx-auto mb-6 flex items-center justify-center">
                        <div className="text-3xl font-bold text-gray-400">{ }</div>
                      </div>
                      <p className="text-gray-500 text-lg">Enter text above to see formatted and beautified output</p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Content Sections */}
          <div className="mt-16 space-y-12">
            {/* What is Text Formatter */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-6">What is a Text Formatter & Beautifier?</h2>
                <div className="prose max-w-none text-gray-700 space-y-4">
                  <p className="text-lg leading-relaxed">
                    A <strong>text formatter and beautifier</strong> is an essential development tool that automatically
                    formats and structures code, markup, and text content with proper indentation, spacing, and organization.
                    This professional-grade utility supports multiple programming languages and data formats, transforming
                    minified, compressed, or poorly formatted content into clean, readable, and maintainable code.
                  </p>

                  <p className="leading-relaxed">
                    Our advanced formatter supports JSON, XML, HTML, CSS, JavaScript, and plain text with intelligent
                    auto-detection capabilities. The tool provides comprehensive formatting options including customizable
                    indentation (spaces or tabs), line length control, whitespace normalization, and structure optimization.
                    Whether you're working with APIs, configuration files, web markup, or code snippets, this formatter
                    ensures consistent, professional presentation.
                  </p>

                  <p className="leading-relaxed">
                    Perfect for developers, designers, content creators, and anyone working with structured text formats,
                    the formatter enhances code readability, simplifies debugging, and maintains coding standards across
                    projects. The real-time formatting and instant preview make it indispensable for code reviews,
                    documentation preparation, and collaborative development workflows.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Supported Formats */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Supported Formats</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
                    <h3 className="font-bold text-blue-800 mb-4 text-lg">JSON</h3>
                    <ul className="space-y-2 text-blue-700 text-sm">
                      <li>• Validate and format JSON data</li>
                      <li>• Proper object and array indentation</li>
                      <li>• Error detection and validation</li>
                      <li>• Compact or expanded formatting</li>
                    </ul>
                  </div>

                  <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-xl p-6 border border-green-200">
                    <h3 className="font-bold text-green-800 mb-4 text-lg">HTML & XML</h3>
                    <ul className="space-y-2 text-green-700 text-sm">
                      <li>• Tag-based structure formatting</li>
                      <li>• Proper nesting and hierarchy</li>
                      <li>• Self-closing tag recognition</li>
                      <li>• Attribute organization</li>
                    </ul>
                  </div>

                  <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl p-6 border border-purple-200">
                    <h3 className="font-bold text-purple-800 mb-4 text-lg">CSS</h3>
                    <ul className="space-y-2 text-purple-700 text-sm">
                      <li>• Selector and property formatting</li>
                      <li>• Rule block organization</li>
                      <li>• Property value alignment</li>
                      <li>• Media query structuring</li>
                    </ul>
                  </div>

                  <div className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-xl p-6 border border-orange-200">
                    <h3 className="font-bold text-orange-800 mb-4 text-lg">JavaScript</h3>
                    <ul className="space-y-2 text-orange-700 text-sm">
                      <li>• Function and block formatting</li>
                      <li>• Variable declaration alignment</li>
                      <li>• Object and array structuring</li>
                      <li>• Statement organization</li>
                    </ul>
                  </div>

                  <div className="bg-gradient-to-r from-pink-50 to-pink-100 rounded-xl p-6 border border-pink-200">
                    <h3 className="font-bold text-pink-800 mb-4 text-lg">Plain Text</h3>
                    <ul className="space-y-2 text-pink-700 text-sm">
                      <li>• Line length wrapping</li>
                      <li>• Whitespace normalization</li>
                      <li>• Empty line removal</li>
                      <li>• Paragraph formatting</li>
                    </ul>
                  </div>

                  <div className="bg-gradient-to-r from-teal-50 to-teal-100 rounded-xl p-6 border border-teal-200">
                    <h3 className="font-bold text-teal-800 mb-4 text-lg">Auto Detection</h3>
                    <ul className="space-y-2 text-teal-700 text-sm">
                      <li>• Intelligent format recognition</li>
                      <li>• Context-aware formatting</li>
                      <li>• Multi-format document support</li>
                      <li>• Adaptive processing rules</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Features and Tips */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Features and Best Practices</h2>
                <div className="space-y-6">
                  <div className="bg-gradient-to-r from-indigo-50 to-indigo-100 rounded-xl p-6 border border-indigo-200">
                    <h3 className="font-bold text-indigo-800 mb-4 text-lg">Formatting Features</h3>
                    <ul className="space-y-2 text-indigo-700">
                      <li>• <strong>Auto-Detection:</strong> Intelligently identifies format type</li>
                      <li>• <strong>Custom Indentation:</strong> Choose between spaces or tabs with configurable size</li>
                      <li>• <strong>Whitespace Control:</strong> Remove extra spaces and normalize formatting</li>
                      <li>• <strong>Line Wrapping:</strong> Control line length for better readability</li>
                      <li>• <strong>Structure Preservation:</strong> Maintains logical hierarchy and relationships</li>
                    </ul>
                  </div>

                  <div className="bg-gradient-to-r from-emerald-50 to-emerald-100 rounded-xl p-6 border border-emerald-200">
                    <h3 className="font-bold text-emerald-800 mb-4 text-lg">Best Practices</h3>
                    <ul className="space-y-2 text-emerald-700">
                      <li>• Use consistent indentation across your projects (2 or 4 spaces)</li>
                      <li>• Enable auto-detection for mixed-format documents</li>
                      <li>• Remove empty lines for compact output, keep them for readability</li>
                      <li>• Set appropriate line wrap length for your display requirements</li>
                      <li>• Validate JSON and XML before formatting for error detection</li>
                      <li>• Use formatted output for code reviews and documentation</li>
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