import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface CaseConversionResult {
  original: string;
  uppercase: string;
  lowercase: string;
  titleCase: string;
  sentenceCase: string;
  camelCase: string;
  pascalCase: string;
  snakeCase: string;
  kebabCase: string;
  constantCase: string;
  alternatingCase: string;
  inverseCase: string;
  randomCase: string;
}

interface AdvancedOptions {
  preserveNumbers: boolean;
  ignorePunctuation: boolean;
  customSeparator: string;
  prefix: string;
  suffix: string;
  removeExtraSpaces: boolean;
  preserveLineBreaks: boolean;
}

const CaseConverter = () => {
  const [text, setText] = useState('');
  const [result, setResult] = useState<CaseConversionResult | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [advancedOptions, setAdvancedOptions] = useState<AdvancedOptions>({
    preserveNumbers: true,
    ignorePunctuation: false,
    customSeparator: '',
    prefix: '',
    suffix: '',
    removeExtraSpaces: true,
    preserveLineBreaks: false
  });

  const convertCases = (inputText: string, options: AdvancedOptions): CaseConversionResult => {
    if (inputText.trim() === '') {
      return {
        original: '',
        uppercase: '',
        lowercase: '',
        titleCase: '',
        sentenceCase: '',
        camelCase: '',
        pascalCase: '',
        snakeCase: '',
        kebabCase: '',
        constantCase: '',
        alternatingCase: '',
        inverseCase: '',
        randomCase: ''
      };
    }

    let processedText = inputText;
    
    // Apply preprocessing based on advanced options
    if (options.removeExtraSpaces) {
      processedText = processedText.replace(/\s+/g, ' ').trim();
    }
    
    if (!options.preserveLineBreaks) {
      processedText = processedText.replace(/\n/g, ' ');
    }

    const original = processedText;
    const uppercase = processedText.toUpperCase();
    const lowercase = processedText.toLowerCase();

    // Title Case - capitalize first letter of each word
    const titleCase = processedText.replace(/\w\S*/g, (txt) => {
      return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });

    // Sentence Case - capitalize first letter of each sentence
    const sentenceCase = processedText.toLowerCase().replace(/(^\w|\.\s+\w)/g, (match) => {
      return match.toUpperCase();
    });

    // Clean text for programming cases based on options
    let cleanText = processedText;
    if (!options.ignorePunctuation) {
      cleanText = processedText.replace(/[^\w\s]/g, '');
    }
    if (!options.preserveNumbers) {
      cleanText = cleanText.replace(/\d/g, '');
    }
    cleanText = cleanText.replace(/\s+/g, ' ').trim();
    const words = cleanText.split(' ').filter(word => word.length > 0);

    // Use custom separator if provided
    const separator = options.customSeparator || '_';
    const kebabSeparator = options.customSeparator || '-';

    // camelCase - first word lowercase, subsequent words capitalized
    let camelCase = words.length > 0 
      ? words[0].toLowerCase() + words.slice(1).map(word => 
          word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
        ).join('')
      : '';

    // PascalCase - all words capitalized
    let pascalCase = words.map(word => 
      word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    ).join('');

    // snake_case - words separated by underscores, all lowercase
    let snakeCase = words.map(word => word.toLowerCase()).join(separator === '_' ? '_' : separator);

    // kebab-case - words separated by hyphens, all lowercase
    let kebabCase = words.map(word => word.toLowerCase()).join(kebabSeparator === '-' ? '-' : kebabSeparator);
    
    // CONSTANT_CASE - all uppercase with underscores
    let constantCase = words.map(word => word.toUpperCase()).join('_');

    // aLtErNaTiNg CaSe - alternating upper and lower case
    let alternatingCase = processedText.split('').map((char, index) => {
      return index % 2 === 0 ? char.toLowerCase() : char.toUpperCase();
    }).join('');

    // iNVERSE cASE - switch case of each character
    let inverseCase = processedText.split('').map(char => {
      return char === char.toUpperCase() ? char.toLowerCase() : char.toUpperCase();
    }).join('');
    
    // rAnDoM cAsE - randomly uppercase or lowercase each character
    let randomCase = processedText.split('').map(char => {
      return Math.random() > 0.5 ? char.toUpperCase() : char.toLowerCase();
    }).join('');
    
    // Apply prefix and suffix if provided
    if (options.prefix || options.suffix) {
      const applyPrefixSuffix = (str: string) => `${options.prefix}${str}${options.suffix}`;
      
      if (camelCase) camelCase = applyPrefixSuffix(camelCase);
      if (pascalCase) pascalCase = applyPrefixSuffix(pascalCase);
      if (snakeCase) snakeCase = applyPrefixSuffix(snakeCase);
      if (kebabCase) kebabCase = applyPrefixSuffix(kebabCase);
      if (constantCase) constantCase = applyPrefixSuffix(constantCase);
      alternatingCase = applyPrefixSuffix(alternatingCase);
      inverseCase = applyPrefixSuffix(inverseCase);
      randomCase = applyPrefixSuffix(randomCase);
    }

    return {
      original,
      uppercase,
      lowercase,
      titleCase,
      sentenceCase,
      camelCase,
      pascalCase,
      snakeCase,
      kebabCase,
      constantCase,
      alternatingCase,
      inverseCase,
      randomCase
    };
  };

  // Real-time conversion as user types
  useEffect(() => {
    const result = convertCases(text, advancedOptions);
    setResult(result);
  }, [text, advancedOptions]);

  const handleClear = () => {
    setText('');
  };

  const handleCopyToClipboard = (textToCopy: string, type: string) => {
    navigator.clipboard.writeText(textToCopy);
    // You could add a toast notification here if needed
  };

  const handleSampleText = () => {
    const sample = `Welcome to DapsiWow's Case Converter tool! This amazing tool can convert your text between UPPERCASE, lowercase, Title Case, camelCase, PascalCase, snake_case, kebab-case, and many other formats. Perfect for developers, writers, and content creators who need quick text transformations.`;
    setText(sample);
  };

  const updateAdvancedOption = (key: keyof AdvancedOptions, value: boolean | string) => {
    setAdvancedOptions(prev => ({ ...prev, [key]: value }));
  };

  const conversionTypes = [
    { key: 'uppercase', label: 'UPPERCASE', description: 'ALL LETTERS CAPITALIZED' },
    { key: 'lowercase', label: 'lowercase', description: 'all letters in small case' },
    { key: 'titleCase', label: 'Title Case', description: 'First Letter Of Each Word Capitalized' },
    { key: 'sentenceCase', label: 'Sentence case', description: 'First letter of sentences capitalized' },
    { key: 'camelCase', label: 'camelCase', description: 'firstWordLowercaseOthersCapitalized' },
    { key: 'pascalCase', label: 'PascalCase', description: 'AllWordsCapitalizedNoSpaces' },
    { key: 'snakeCase', label: 'snake_case', description: 'words_separated_by_underscores' },
    { key: 'kebabCase', label: 'kebab-case', description: 'words-separated-by-hyphens' },
    { key: 'constantCase', label: 'CONSTANT_CASE', description: 'ALL_WORDS_UPPERCASE_WITH_UNDERSCORES' },
    { key: 'alternatingCase', label: 'aLtErNaTiNg CaSe', description: 'alternating upper and lower case' },
    { key: 'inverseCase', label: 'iNVERSE cASE', description: 'opposite case of original' },
    { key: 'randomCase', label: 'rAnDoM cAsE', description: 'randomly mixed upper and lower case' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Helmet>
        <title>Case Converter - Convert Text to UPPER, lower, Title, camelCase | DapsiWow</title>
        <meta name="description" content="Free online case converter tool to transform text between UPPERCASE, lowercase, Title Case, camelCase, PascalCase, snake_case, kebab-case and more. Instant text case conversion." />
        <meta name="keywords" content="case converter, text converter, uppercase, lowercase, title case, camelCase, PascalCase, snake_case, kebab-case, text transformation" />
        <meta property="og:title" content="Case Converter - Convert Text to UPPER, lower, Title, camelCase" />
        <meta property="og:description" content="Free online case converter for all text transformation needs. Convert between uppercase, lowercase, camelCase and more instantly." />
        <meta property="og:type" content="website" />
        <link rel="canonical" href="/tools/case-converter" />
      </Helmet>
      
      <Header />
      
      <main>
        {/* Hero Section */}
        <section className="gradient-hero text-white py-16 pt-24">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="w-20 h-20 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <i className="fas fa-text-height text-3xl"></i>
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold mb-6" data-testid="text-page-title">
              Case Converter
            </h1>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto">
              Transform text between UPPERCASE, lowercase, Title Case, camelCase, PascalCase and many other formats
            </p>
          </div>
        </section>

        {/* Calculator Section */}
        <section className="py-16">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <Card className="bg-white shadow-sm border-0">
              <CardContent className="p-8">
                <div className="space-y-8">
                  {/* Input Section */}
                  <div>
                    <h2 className="text-2xl font-semibold text-gray-900 mb-6">Enter Your Text</h2>
                    
                    {/* Text Area */}
                    <div className="space-y-4">
                      <Label htmlFor="text-input" className="text-sm font-medium text-gray-700">
                        Text to Convert
                      </Label>
                      <textarea
                        id="text-input"
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        className="w-full h-32 p-4 text-base border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                        placeholder="Type or paste your text here to convert between different case formats..."
                        data-testid="textarea-text-input"
                      />
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-4 mt-4">
                      <Button
                        onClick={handleClear}
                        variant="outline"
                        className="flex-1"
                        data-testid="button-clear-text"
                      >
                        <i className="fas fa-trash mr-2"></i>
                        Clear Text
                      </Button>
                      <Button
                        onClick={handleSampleText}
                        variant="outline"
                        className="flex-1"
                        data-testid="button-sample-text"
                      >
                        <i className="fas fa-file-text mr-2"></i>
                        Sample Text
                      </Button>
                    </div>

                    {/* Advanced Options */}
                    <Collapsible open={showAdvanced} onOpenChange={setShowAdvanced}>
                      <CollapsibleTrigger asChild>
                        <Button 
                          variant="ghost" 
                          className="w-full mt-4 justify-between"
                          data-testid="button-toggle-advanced"
                        >
                          <span className="flex items-center">
                            <i className="fas fa-cog mr-2"></i>
                            Advanced Options
                          </span>
                          <i className={`fas ${showAdvanced ? 'fa-chevron-up' : 'fa-chevron-down'}`}></i>
                        </Button>
                      </CollapsibleTrigger>
                      <CollapsibleContent className="space-y-6 mt-4">
                        <Separator />
                        
                        {/* Text Processing Options */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-4">
                            <h3 className="font-semibold text-gray-900">Text Processing</h3>
                            
                            <div className="flex items-center justify-between">
                              <div className="space-y-1">
                                <Label className="text-sm font-medium">Preserve Numbers</Label>
                                <p className="text-xs text-gray-500">Keep digits in programming cases</p>
                              </div>
                              <Switch
                                checked={advancedOptions.preserveNumbers}
                                onCheckedChange={(value) => updateAdvancedOption('preserveNumbers', value)}
                                data-testid="switch-preserve-numbers"
                              />
                            </div>

                            <div className="flex items-center justify-between">
                              <div className="space-y-1">
                                <Label className="text-sm font-medium">Remove Extra Spaces</Label>
                                <p className="text-xs text-gray-500">Clean up multiple consecutive spaces</p>
                              </div>
                              <Switch
                                checked={advancedOptions.removeExtraSpaces}
                                onCheckedChange={(value) => updateAdvancedOption('removeExtraSpaces', value)}
                                data-testid="switch-remove-extra-spaces"
                              />
                            </div>

                            <div className="flex items-center justify-between">
                              <div className="space-y-1">
                                <Label className="text-sm font-medium">Preserve Line Breaks</Label>
                                <p className="text-xs text-gray-500">Keep original line breaks in text</p>
                              </div>
                              <Switch
                                checked={advancedOptions.preserveLineBreaks}
                                onCheckedChange={(value) => updateAdvancedOption('preserveLineBreaks', value)}
                                data-testid="switch-preserve-line-breaks"
                              />
                            </div>

                            <div className="flex items-center justify-between">
                              <div className="space-y-1">
                                <Label className="text-sm font-medium">Ignore Punctuation</Label>
                                <p className="text-xs text-gray-500">Keep punctuation in programming cases</p>
                              </div>
                              <Switch
                                checked={advancedOptions.ignorePunctuation}
                                onCheckedChange={(value) => updateAdvancedOption('ignorePunctuation', value)}
                                data-testid="switch-ignore-punctuation"
                              />
                            </div>
                          </div>

                          {/* Customization Options */}
                          <div className="space-y-4">
                            <h3 className="font-semibold text-gray-900">Customization</h3>
                            
                            <div className="space-y-2">
                              <Label className="text-sm font-medium">Custom Separator</Label>
                              <Input
                                value={advancedOptions.customSeparator}
                                onChange={(e) => updateAdvancedOption('customSeparator', e.target.value)}
                                placeholder="e.g., _, -, |, ."
                                className="text-sm"
                                data-testid="input-custom-separator"
                              />
                              <p className="text-xs text-gray-500">Override default separators for snake_case and kebab-case</p>
                            </div>

                            <div className="space-y-2">
                              <Label className="text-sm font-medium">Prefix</Label>
                              <Input
                                value={advancedOptions.prefix}
                                onChange={(e) => updateAdvancedOption('prefix', e.target.value)}
                                placeholder="e.g., get_, set_, is_"
                                className="text-sm"
                                data-testid="input-prefix"
                              />
                              <p className="text-xs text-gray-500">Add prefix to programming case formats</p>
                            </div>

                            <div className="space-y-2">
                              <Label className="text-sm font-medium">Suffix</Label>
                              <Input
                                value={advancedOptions.suffix}
                                onChange={(e) => updateAdvancedOption('suffix', e.target.value)}
                                placeholder="e.g., _value, _count, _id"
                                className="text-sm"
                                data-testid="input-suffix"
                              />
                              <p className="text-xs text-gray-500">Add suffix to programming case formats</p>
                            </div>
                          </div>
                        </div>
                        
                        <Separator />
                      </CollapsibleContent>
                    </Collapsible>
                  </div>

                  {/* Results Section */}
                  <div>
                    <h2 className="text-2xl font-semibold text-gray-900 mb-6">Converted Text</h2>
                    
                    {result && result.original ? (
                      <div className="space-y-4" data-testid="case-conversions">
                        {conversionTypes.map((type, index) => {
                          const convertedText = result[type.key as keyof CaseConversionResult] as string;
                          const colorClasses = [
                            'bg-blue-50 border-blue-200',
                            'bg-green-50 border-green-200',
                            'bg-purple-50 border-purple-200',
                            'bg-orange-50 border-orange-200',
                            'bg-pink-50 border-pink-200',
                            'bg-indigo-50 border-indigo-200',
                            'bg-teal-50 border-teal-200',
                            'bg-red-50 border-red-200',
                            'bg-yellow-50 border-yellow-200',
                            'bg-cyan-50 border-cyan-200',
                            'bg-emerald-50 border-emerald-200',
                            'bg-rose-50 border-rose-200'
                          ];
                          
                          return (
                            <div 
                              key={type.key} 
                              className={`border-2 rounded-lg p-4 ${colorClasses[index % colorClasses.length]}`}
                            >
                              <div className="flex items-center justify-between mb-2">
                                <div>
                                  <h3 className="font-semibold text-gray-900">{type.label}</h3>
                                  <p className="text-sm text-gray-600">{type.description}</p>
                                </div>
                                <Button
                                  onClick={() => handleCopyToClipboard(convertedText, type.label)}
                                  variant="outline"
                                  size="sm"
                                  data-testid={`button-copy-${type.key}`}
                                >
                                  <i className="fas fa-copy mr-1"></i>
                                  Copy
                                </Button>
                              </div>
                              <div 
                                className="bg-white p-3 rounded border border-gray-200 text-sm font-mono break-words"
                                data-testid={`converted-${type.key}`}
                              >
                                {convertedText || '(empty)'}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="text-center py-12 text-gray-500">
                        <i className="fas fa-text-height text-4xl mb-4"></i>
                        <p className="text-lg">Start typing to see your text converted to different cases</p>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Information Sections */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
          {/* What is a Case Converter */}
          <div className="mt-12 bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">What is a Case Converter?</h2>
            <div className="prose max-w-none">
              <p className="text-lg text-gray-700 mb-6">
                A <strong>case converter</strong> is a text transformation tool that changes the capitalization pattern of your text. Our comprehensive case converter supports multiple formats including standard cases like UPPERCASE and lowercase, as well as programming conventions like camelCase, PascalCase, snake_case, and kebab-case.
              </p>
              
              <p className="text-gray-700 mb-6">
                Whether you're a developer working with different programming languages, a writer formatting content, or someone who needs to standardize text formatting, our case converter provides instant transformation between all major case formats with just one click.
              </p>
            </div>
          </div>

          {/* Case Types Explained */}
          <div className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Understanding Different Case Types</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <h3 className="font-semibold text-gray-900 mb-2">UPPERCASE</h3>
                  <p className="text-gray-600 text-sm">All letters converted to capital letters. Great for headings and emphasis.</p>
                </div>
                
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <h3 className="font-semibold text-gray-900 mb-2">Title Case</h3>
                  <p className="text-gray-600 text-sm">First letter of each word capitalized. Perfect for titles and headings.</p>
                </div>
                
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <h3 className="font-semibold text-gray-900 mb-2">camelCase</h3>
                  <p className="text-gray-600 text-sm">First word lowercase, subsequent words capitalized. Common in JavaScript and Java.</p>
                </div>
                
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <h3 className="font-semibold text-gray-900 mb-2">snake_case</h3>
                  <p className="text-gray-600 text-sm">Words separated by underscores, all lowercase. Popular in Python and databases.</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <h3 className="font-semibold text-gray-900 mb-2">lowercase</h3>
                  <p className="text-gray-600 text-sm">All letters converted to small letters. Used for general text formatting.</p>
                </div>
                
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <h3 className="font-semibold text-gray-900 mb-2">Sentence case</h3>
                  <p className="text-gray-600 text-sm">First letter of sentences capitalized. Standard for regular text writing.</p>
                </div>
                
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <h3 className="font-semibold text-gray-900 mb-2">PascalCase</h3>
                  <p className="text-gray-600 text-sm">All words capitalized without spaces. Common for class names in programming.</p>
                </div>
                
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <h3 className="font-semibold text-gray-900 mb-2">kebab-case</h3>
                  <p className="text-gray-600 text-sm">Words separated by hyphens, all lowercase. Used in URLs and CSS classes.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Key Features */}
          <div className="mt-8 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Key Features of Our Case Converter</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-green-600 text-white rounded-full flex items-center justify-center mx-auto mb-4">
                  <i className="fas fa-bolt text-2xl"></i>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Instant Conversion</h3>
                <p className="text-gray-600">Real-time conversion as you type with immediate results for all case types.</p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-green-600 text-white rounded-full flex items-center justify-center mx-auto mb-4">
                  <i className="fas fa-list text-2xl"></i>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Multiple Formats</h3>
                <p className="text-gray-600">Support for 10+ different case formats including programming conventions.</p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-green-600 text-white rounded-full flex items-center justify-center mx-auto mb-4">
                  <i className="fas fa-copy text-2xl"></i>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">One-Click Copy</h3>
                <p className="text-gray-600">Easy copy-to-clipboard functionality for each converted format.</p>
              </div>
            </div>
          </div>

          {/* Use Cases */}
          <div className="mt-8 bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Who Uses Case Converters?</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <i className="fas fa-code text-blue-600 text-xl"></i>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Developers</h3>
                <p className="text-gray-600 text-sm">Convert variable names and follow naming conventions.</p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <i className="fas fa-pen text-purple-600 text-xl"></i>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Writers</h3>
                <p className="text-gray-600 text-sm">Format titles, headings, and content properly.</p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <i className="fas fa-bullhorn text-green-600 text-xl"></i>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Marketers</h3>
                <p className="text-gray-600 text-sm">Create consistent formatting for campaigns and content.</p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <i className="fas fa-graduation-cap text-orange-600 text-xl"></i>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Students</h3>
                <p className="text-gray-600 text-sm">Format assignments and research papers correctly.</p>
              </div>
            </div>
          </div>

          {/* FAQ */}
          <div className="mt-8 bg-gradient-to-r from-gray-50 to-blue-50 rounded-2xl p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Frequently Asked Questions</h2>
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">What is the difference between camelCase and PascalCase?</h3>
                <p className="text-gray-600">CamelCase starts with a lowercase letter (myVariableName), while PascalCase starts with an uppercase letter (MyClassName). Both capitalize subsequent words.</p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">When should I use snake_case vs kebab-case?</h3>
                <p className="text-gray-600">Snake_case is commonly used in Python, databases, and file names. Kebab-case is preferred for URLs, CSS classes, and HTML attributes because hyphens are web-friendly.</p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">How does the alternating case work?</h3>
                <p className="text-gray-600">Alternating case switches between lowercase and uppercase for each character position, creating a pattern like "aLtErNaTiNg CaSe". It's often used for stylistic or mocking purposes.</p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Can I convert special characters and numbers?</h3>
                <p className="text-gray-600">Yes! Our tool handles all characters including numbers, punctuation, and special symbols. Programming cases (camelCase, snake_case, etc.) will clean special characters for valid variable names.</p>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default CaseConverter;