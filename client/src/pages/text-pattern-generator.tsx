import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';

interface PatternOptions {
  baseText: string;
  repetitions: number;
  separator: string;
  increment: boolean;
  startNumber: number;
  prefix: string;
  suffix: string;
  caseTransform: 'none' | 'upper' | 'lower' | 'title';
  reverseOrder: boolean;
  addLineNumbers: boolean;
}

interface PatternResult {
  generatedText: string;
  lineCount: number;
  totalCharacters: number;
  patternLength: number;
}

export default function TextPatternGenerator() {
  const [options, setOptions] = useState<PatternOptions>({
    baseText: '',
    repetitions: 5,
    separator: '\n',
    increment: false,
    startNumber: 1,
    prefix: '',
    suffix: '',
    caseTransform: 'none',
    reverseOrder: false,
    addLineNumbers: false
  });
  const [result, setResult] = useState<PatternResult | null>(null);
  const [customSeparator, setCustomSeparator] = useState('');

  const generatePattern = (opts: PatternOptions): PatternResult => {
    if (!opts.baseText.trim()) {
      return {
        generatedText: '',
        lineCount: 0,
        totalCharacters: 0,
        patternLength: 0
      };
    }

    let patterns: string[] = [];
    
    for (let i = 0; i < opts.repetitions; i++) {
      let currentText = opts.baseText;
      
      // Apply case transformation
      switch (opts.caseTransform) {
        case 'upper':
          currentText = currentText.toUpperCase();
          break;
        case 'lower':
          currentText = currentText.toLowerCase();
          break;
        case 'title':
          currentText = currentText.replace(/\w\S*/g, (txt) => 
            txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
          );
          break;
      }
      
      // Add increment if enabled
      if (opts.increment) {
        const currentNumber = opts.startNumber + i;
        currentText = `${currentText} ${currentNumber}`;
      }
      
      // Add prefix and suffix
      currentText = `${opts.prefix}${currentText}${opts.suffix}`;
      
      // Add line numbers if enabled
      if (opts.addLineNumbers) {
        currentText = `${i + 1}. ${currentText}`;
      }
      
      patterns.push(currentText);
    }
    
    // Reverse order if enabled
    if (opts.reverseOrder) {
      patterns = patterns.reverse();
    }
    
    // Join with separator
    const separator = customSeparator || opts.separator;
    const generatedText = patterns.join(separator);
    
    return {
      generatedText,
      lineCount: patterns.length,
      totalCharacters: generatedText.length,
      patternLength: opts.baseText.length
    };
  };

  // Real-time pattern generation
  useEffect(() => {
    const result = generatePattern(options);
    setResult(result);
  }, [options, customSeparator]);

  const updateOption = <K extends keyof PatternOptions>(
    key: K, 
    value: PatternOptions[K]
  ) => {
    setOptions(prev => ({ ...prev, [key]: value }));
  };

  const handleSeparatorChange = (value: string) => {
    if (value === 'custom') {
      setCustomSeparator('');
    } else {
      setCustomSeparator('');
      updateOption('separator', value);
    }
  };

  const handleClear = () => {
    setOptions({
      baseText: '',
      repetitions: 5,
      separator: '\n',
      increment: false,
      startNumber: 1,
      prefix: '',
      suffix: '',
      caseTransform: 'none',
      reverseOrder: false,
      addLineNumbers: false
    });
    setCustomSeparator('');
  };

  const handleCopyPattern = () => {
    if (result && result.generatedText) {
      navigator.clipboard.writeText(result.generatedText);
    }
  };

  const handleLoadPreset = (preset: string) => {
    switch (preset) {
      case 'numbered-list':
        setOptions(prev => ({
          ...prev,
          baseText: 'Item',
          repetitions: 10,
          separator: '\n',
          increment: true,
          startNumber: 1,
          prefix: '',
          suffix: '',
          caseTransform: 'none',
          reverseOrder: false,
          addLineNumbers: false
        }));
        break;
      case 'bullet-points':
        setOptions(prev => ({
          ...prev,
          baseText: 'Point to discuss',
          repetitions: 8,
          separator: '\n',
          increment: false,
          startNumber: 1,
          prefix: '• ',
          suffix: '',
          caseTransform: 'none',
          reverseOrder: false,
          addLineNumbers: false
        }));
        break;
      case 'css-classes':
        setOptions(prev => ({
          ...prev,
          baseText: 'class-name',
          repetitions: 5,
          separator: '\n',
          increment: true,
          startNumber: 1,
          prefix: '.',
          suffix: ' { }',
          caseTransform: 'lower',
          reverseOrder: false,
          addLineNumbers: false
        }));
        break;
      case 'test-data':
        setOptions(prev => ({
          ...prev,
          baseText: 'test_user',
          repetitions: 15,
          separator: '\n',
          increment: true,
          startNumber: 1,
          prefix: '"',
          suffix: '@example.com"',
          caseTransform: 'lower',
          reverseOrder: false,
          addLineNumbers: false
        }));
        break;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Helmet>
        <title>Text Pattern Generator - Create Repeating Text Patterns & Sequences | DapsiWow</title>
        <meta name="description" content="Free online text pattern generator tool to create repeating text sequences with customizable separators, numbering, and formatting. Perfect for creating lists, test data, and structured content." />
        <meta name="keywords" content="text pattern generator, repeating text, sequence generator, list generator, pattern maker, text automation, bulk text creation, numbered lists, pattern sequences, template generator" />
        <meta property="og:title" content="Text Pattern Generator - Create Repeating Text Patterns & Sequences" />
        <meta property="og:description" content="Professional text pattern generator for creating customized repeating text sequences with advanced formatting options and automation features." />
        <meta property="og:type" content="website" />
        <meta name="robots" content="index, follow" />
        <meta name="author" content="DapsiWow" />
        <link rel="canonical" href="https://dapsiwow.com/tools/text-pattern-generator" />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            "name": "Text Pattern Generator",
            "description": "Free online tool to generate repeating text patterns with customizable sequences, numbering, separators, and formatting options for lists and structured content.",
            "url": "https://dapsiwow.com/tools/text-pattern-generator",
            "applicationCategory": "ProductivityApplication",
            "operatingSystem": "Any",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "USD"
            },
            "featureList": [
              "Customizable text repetition",
              "Multiple separator options",
              "Auto-numbering sequences",
              "Case transformation options",
              "Prefix and suffix support",
              "Reverse order generation",
              "Preset templates",
              "Copy to clipboard"
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
                <span className="text-sm font-medium text-blue-700">Automated Text Creation</span>
              </div>
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-slate-900 leading-tight">
                Text Pattern
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                  Generator
                </span>
              </h1>
              <p className="text-xl sm:text-2xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
                Generate repeating text patterns with customizable sequences, numbering, and formatting options
              </p>
            </div>
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-4 py-16">
          {/* Main Calculator Card */}
          <Card className="bg-white/90 backdrop-blur-sm shadow-2xl border-0 rounded-3xl overflow-hidden">
            <CardContent className="p-0">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-0">
                {/* Input Section */}
                <div className="lg:col-span-2 p-8 lg:p-12 space-y-8">
                  <div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">Pattern Configuration</h2>
                    <p className="text-gray-600">Configure your text pattern settings and generate repeating sequences</p>
                  </div>

                  {/* Quick Presets */}
                  <div className="bg-gray-50 rounded-xl p-6 space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900">Quick Presets</h3>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                      <Button
                        onClick={() => handleLoadPreset('numbered-list')}
                        variant="outline"
                        size="sm"
                        className="text-xs"
                        data-testid="preset-numbered-list"
                      >
                        Numbered List
                      </Button>
                      <Button
                        onClick={() => handleLoadPreset('bullet-points')}
                        variant="outline"
                        size="sm"
                        className="text-xs"
                        data-testid="preset-bullet-points"
                      >
                        Bullet Points
                      </Button>
                      <Button
                        onClick={() => handleLoadPreset('css-classes')}
                        variant="outline"
                        size="sm"
                        className="text-xs"
                        data-testid="preset-css-classes"
                      >
                        CSS Classes
                      </Button>
                      <Button
                        onClick={() => handleLoadPreset('test-data')}
                        variant="outline"
                        size="sm"
                        className="text-xs"
                        data-testid="preset-test-data"
                      >
                        Test Data
                      </Button>
                    </div>
                  </div>

                  {/* Base Text Input */}
                  <div className="space-y-4">
                    <Label htmlFor="base-text" className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                      Base Text Pattern
                    </Label>
                    <Input
                      id="base-text"
                      value={options.baseText}
                      onChange={(e) => updateOption('baseText', e.target.value)}
                      className="text-base border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-blue-500 h-12"
                      placeholder="Enter the text pattern to repeat..."
                      data-testid="input-base-text"
                    />
                  </div>

                  {/* Pattern Settings */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700">Repetitions</Label>
                      <Input
                        type="number"
                        min="1"
                        max="1000"
                        value={options.repetitions}
                        onChange={(e) => updateOption('repetitions', parseInt(e.target.value) || 1)}
                        className="h-10 border-2 border-gray-200 rounded-lg"
                        data-testid="input-repetitions"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700">Separator</Label>
                      <Select value={customSeparator ? 'custom' : options.separator} onValueChange={handleSeparatorChange}>
                        <SelectTrigger className="h-10 border-2 border-gray-200 rounded-lg" data-testid="select-separator">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="\n">New Line</SelectItem>
                          <SelectItem value=", ">Comma + Space</SelectItem>
                          <SelectItem value=" ">Space</SelectItem>
                          <SelectItem value=" | ">Pipe</SelectItem>
                          <SelectItem value="\t">Tab</SelectItem>
                          <SelectItem value="custom">Custom</SelectItem>
                        </SelectContent>
                      </Select>
                      {customSeparator !== '' && (
                        <Input
                          value={customSeparator}
                          onChange={(e) => setCustomSeparator(e.target.value)}
                          placeholder="Enter custom separator..."
                          className="h-10 border-2 border-gray-200 rounded-lg mt-2"
                          data-testid="input-custom-separator"
                        />
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700">Prefix</Label>
                      <Input
                        value={options.prefix}
                        onChange={(e) => updateOption('prefix', e.target.value)}
                        className="h-10 border-2 border-gray-200 rounded-lg"
                        placeholder="Text before each pattern..."
                        data-testid="input-prefix"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700">Suffix</Label>
                      <Input
                        value={options.suffix}
                        onChange={(e) => updateOption('suffix', e.target.value)}
                        className="h-10 border-2 border-gray-200 rounded-lg"
                        placeholder="Text after each pattern..."
                        data-testid="input-suffix"
                      />
                    </div>
                  </div>

                  {/* Advanced Options */}
                  <div className="bg-gray-50 rounded-xl p-6 space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900">Advanced Options</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Numbering */}
                      <div className="space-y-4">
                        <div className="flex items-center justify-between gap-2">
                          <div className="space-y-1">
                            <Label className="text-sm font-medium">Auto Increment</Label>
                            <p className="text-xs text-gray-500">Add incremental numbers</p>
                          </div>
                          <Switch
                            checked={options.increment}
                            onCheckedChange={(value) => updateOption('increment', value)}
                            data-testid="switch-increment"
                          />
                        </div>
                        
                        {options.increment && (
                          <div className="space-y-2">
                            <Label className="text-sm font-medium text-gray-700">Start Number</Label>
                            <Input
                              type="number"
                              value={options.startNumber}
                              onChange={(e) => updateOption('startNumber', parseInt(e.target.value) || 1)}
                              className="h-10 border-2 border-gray-200 rounded-lg"
                              data-testid="input-start-number"
                            />
                          </div>
                        )}
                      </div>

                      {/* Case Transform */}
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-700">Case Transform</Label>
                        <Select value={options.caseTransform} onValueChange={(value: any) => updateOption('caseTransform', value)}>
                          <SelectTrigger className="h-10 border-2 border-gray-200 rounded-lg" data-testid="select-case-transform">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">No Change</SelectItem>
                            <SelectItem value="upper">UPPERCASE</SelectItem>
                            <SelectItem value="lower">lowercase</SelectItem>
                            <SelectItem value="title">Title Case</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="flex items-center justify-between gap-2">
                        <div className="space-y-1">
                          <Label className="text-sm font-medium">Reverse Order</Label>
                          <p className="text-xs text-gray-500">Generate patterns in reverse</p>
                        </div>
                        <Switch
                          checked={options.reverseOrder}
                          onCheckedChange={(value) => updateOption('reverseOrder', value)}
                          data-testid="switch-reverse-order"
                        />
                      </div>

                      <div className="flex items-center justify-between gap-2">
                        <div className="space-y-1">
                          <Label className="text-sm font-medium">Add Line Numbers</Label>
                          <p className="text-xs text-gray-500">Prefix each line with numbers</p>
                        </div>
                        <Switch
                          checked={options.addLineNumbers}
                          onCheckedChange={(value) => updateOption('addLineNumbers', value)}
                          data-testid="switch-line-numbers"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-4 pt-6">
                    <Button
                      onClick={handleCopyPattern}
                      className="flex-1 h-14 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold text-lg rounded-xl shadow-lg transform transition-all duration-200 hover:scale-105"
                      disabled={!result || !result.generatedText}
                      data-testid="button-copy-pattern"
                    >
                      Copy Pattern
                    </Button>
                    <Button
                      onClick={handleClear}
                      variant="outline"
                      className="h-14 px-8 border-2 border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold text-lg rounded-xl"
                      data-testid="button-clear"
                    >
                      Clear All
                    </Button>
                  </div>
                </div>

                {/* Results Section */}
                <div className="bg-gradient-to-br from-gray-50 to-blue-50 p-8 lg:p-12">
                  <h2 className="text-2xl font-bold text-gray-900 mb-8">Generated Pattern</h2>

                  {result && result.generatedText ? (
                    <div className="space-y-6" data-testid="pattern-results">
                      {/* Statistics */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white rounded-xl p-4 shadow-sm">
                          <div className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-1">Patterns</div>
                          <div className="text-2xl font-bold text-blue-600" data-testid="stat-line-count">
                            {result.lineCount}
                          </div>
                        </div>
                        <div className="bg-white rounded-xl p-4 shadow-sm">
                          <div className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-1">Characters</div>
                          <div className="text-2xl font-bold text-green-600" data-testid="stat-total-characters">
                            {result.totalCharacters.toLocaleString()}
                          </div>
                        </div>
                      </div>

                      {/* Generated Text */}
                      <div className="bg-white rounded-xl p-6 shadow-sm">
                        <Label className="text-sm font-semibold text-gray-800 mb-3 block">Generated Text</Label>
                        <Textarea
                          value={result.generatedText}
                          readOnly
                          className="min-h-[300px] text-sm border-2 border-gray-200 rounded-xl resize-none font-mono"
                          data-testid="textarea-generated-text"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-16" data-testid="no-pattern-results">
                      <div className="w-20 h-20 bg-gray-200 rounded-full mx-auto mb-6 flex items-center justify-center" data-testid="no-pattern-icon">
                        <div className="text-3xl font-bold text-gray-400">⟳</div>
                      </div>
                      <p className="text-gray-500 text-lg">Enter a base text pattern to generate repeating sequences</p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Content Sections */}
          <div className="mt-16 space-y-12">
            {/* What is Text Pattern Generator */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-6">What is a Text Pattern Generator?</h2>
                <div className="prose max-w-none text-gray-700 space-y-4">
                  <p className="text-lg leading-relaxed">
                    A <strong>text pattern generator</strong> is a versatile automation tool that creates repeating text
                    sequences based on customizable patterns, rules, and formatting options. This powerful utility eliminates
                    the tedious manual work of creating repetitive content by automatically generating structured text with
                    consistent formatting, numbering, and customizable separators.
                  </p>

                  <p className="leading-relaxed">
                    Our advanced text pattern generator offers comprehensive customization options including auto-incremental
                    numbering, case transformations, prefix/suffix additions, reverse ordering, and multiple separator choices.
                    Whether you need to create numbered lists, generate test data, produce CSS class templates, or create
                    any form of structured repetitive text, this tool streamlines the process with professional-grade automation.
                  </p>

                  <p className="leading-relaxed">
                    The generator supports various output formats and includes preset templates for common use cases like
                    numbered lists, bullet points, CSS classes, and test data generation. With real-time preview and
                    instant copying functionality, it's perfect for developers, content creators, designers, and anyone
                    who needs to generate structured text efficiently and accurately.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Use Cases */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Popular Use Cases</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
                    <h3 className="font-bold text-blue-800 mb-4 text-lg">Development & Coding</h3>
                    <ul className="space-y-2 text-blue-700 text-sm">
                      <li>• Generate CSS class names</li>
                      <li>• Create test data sets</li>
                      <li>• Generate variable declarations</li>
                      <li>• Create HTML elements</li>
                    </ul>
                  </div>

                  <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-xl p-6 border border-green-200">
                    <h3 className="font-bold text-green-800 mb-4 text-lg">Content Creation</h3>
                    <ul className="space-y-2 text-green-700 text-sm">
                      <li>• Numbered article sections</li>
                      <li>• Bullet point lists</li>
                      <li>• Chapter headings</li>
                      <li>• Table of contents</li>
                    </ul>
                  </div>

                  <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl p-6 border border-purple-200">
                    <h3 className="font-bold text-purple-800 mb-4 text-lg">Data Management</h3>
                    <ul className="space-y-2 text-purple-700 text-sm">
                      <li>• Generate user IDs</li>
                      <li>• Create email templates</li>
                      <li>• Product code sequences</li>
                      <li>• Database entries</li>
                    </ul>
                  </div>

                  <div className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-xl p-6 border border-orange-200">
                    <h3 className="font-bold text-orange-800 mb-4 text-lg">Design & Layout</h3>
                    <ul className="space-y-2 text-orange-700 text-sm">
                      <li>• Lorem ipsum variations</li>
                      <li>• Placeholder text blocks</li>
                      <li>• Design element labels</li>
                      <li>• Navigation menu items</li>
                    </ul>
                  </div>

                  <div className="bg-gradient-to-r from-pink-50 to-pink-100 rounded-xl p-6 border border-pink-200">
                    <h3 className="font-bold text-pink-800 mb-4 text-lg">Documentation</h3>
                    <ul className="space-y-2 text-pink-700 text-sm">
                      <li>• Step-by-step instructions</li>
                      <li>• FAQ question formats</li>
                      <li>• Reference lists</li>
                      <li>• Index entries</li>
                    </ul>
                  </div>

                  <div className="bg-gradient-to-r from-teal-50 to-teal-100 rounded-xl p-6 border border-teal-200">
                    <h3 className="font-bold text-teal-800 mb-4 text-lg">Testing & QA</h3>
                    <ul className="space-y-2 text-teal-700 text-sm">
                      <li>• Test case scenarios</li>
                      <li>• Sample user data</li>
                      <li>• Form field testing</li>
                      <li>• Load testing content</li>
                    </ul>
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
                    <h3 className="font-bold text-indigo-800 mb-4 text-lg">Customization Options</h3>
                    <ul className="space-y-2 text-indigo-700">
                      <li>• <strong>Auto-Increment:</strong> Add sequential numbers to each pattern</li>
                      <li>• <strong>Case Transform:</strong> Apply uppercase, lowercase, or title case</li>
                      <li>• <strong>Prefix/Suffix:</strong> Add consistent text before and after patterns</li>
                      <li>• <strong>Custom Separators:</strong> Choose how patterns are separated</li>
                      <li>• <strong>Reverse Order:</strong> Generate patterns in descending sequence</li>
                      <li>• <strong>Line Numbers:</strong> Add automatic line numbering</li>
                    </ul>
                  </div>

                  <div className="bg-gradient-to-r from-emerald-50 to-emerald-100 rounded-xl p-6 border border-emerald-200">
                    <h3 className="font-bold text-emerald-800 mb-4 text-lg">Pro Tips</h3>
                    <ul className="space-y-2 text-emerald-700">
                      <li>• Use presets as starting points for common patterns</li>
                      <li>• Combine prefixes and suffixes for complex formatting</li>
                      <li>• Test with small repetition counts before generating large sets</li>
                      <li>• Use custom separators for specific output formats</li>
                      <li>• Preview patterns in real-time as you adjust settings</li>
                      <li>• Copy generated patterns directly to your clipboard</li>
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