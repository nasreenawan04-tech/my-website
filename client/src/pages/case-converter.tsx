
import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
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
  dotCase: string;
  pathCase: string;
  capitalCase: string;
  swapCase: string;
  spongebobCase: string;
  trainCase: string;
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
        randomCase: '',
        dotCase: '',
        pathCase: '',
        capitalCase: '',
        swapCase: '',
        spongebobCase: '',
        trainCase: ''
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

    // dot.case - words separated by dots, all lowercase
    let dotCase = words.map(word => word.toLowerCase()).join('.');

    // path/case - words separated by forward slashes, all lowercase
    let pathCase = words.map(word => word.toLowerCase()).join('/');

    // Capital Case - All Words Capitalized With Spaces
    let capitalCase = words.map(word => 
      word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    ).join(' ');

    // sWAP cASE - opposite of original case for each character
    let swapCase = processedText.split('').map(char => {
      return char === char.toUpperCase() ? char.toLowerCase() : char.toUpperCase();
    }).join('');

    // SpOnGeBoB cAsE - random mocking text style
    let spongebobCase = processedText.split('').map((char, index) => {
      // More random pattern for spongebob case
      const shouldUpper = Math.random() > 0.5;
      return shouldUpper ? char.toUpperCase() : char.toLowerCase();
    }).join('');

    // Train-Case - Words-Capitalized-Separated-By-Hyphens
    let trainCase = words.map(word => 
      word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    ).join('-');
    
    // Apply prefix and suffix if provided
    if (options.prefix || options.suffix) {
      const applyPrefixSuffix = (str: string) => `${options.prefix}${str}${options.suffix}`;
      
      if (camelCase) camelCase = applyPrefixSuffix(camelCase);
      if (pascalCase) pascalCase = applyPrefixSuffix(pascalCase);
      if (snakeCase) snakeCase = applyPrefixSuffix(snakeCase);
      if (kebabCase) kebabCase = applyPrefixSuffix(kebabCase);
      if (constantCase) constantCase = applyPrefixSuffix(constantCase);
      if (dotCase) dotCase = applyPrefixSuffix(dotCase);
      if (pathCase) pathCase = applyPrefixSuffix(pathCase);
      if (trainCase) trainCase = applyPrefixSuffix(trainCase);
      alternatingCase = applyPrefixSuffix(alternatingCase);
      inverseCase = applyPrefixSuffix(inverseCase);
      randomCase = applyPrefixSuffix(randomCase);
      swapCase = applyPrefixSuffix(swapCase);
      spongebobCase = applyPrefixSuffix(spongebobCase);
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
      randomCase,
      dotCase,
      pathCase,
      capitalCase,
      swapCase,
      spongebobCase,
      trainCase
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

  const resetCalculator = () => {
    setText('');
    setAdvancedOptions({
      preserveNumbers: true,
      ignorePunctuation: false,
      customSeparator: '',
      prefix: '',
      suffix: '',
      removeExtraSpaces: true,
      preserveLineBreaks: false
    });
    setShowAdvanced(false);
    setResult(null);
  };

  const conversionTypes = [
    { key: 'uppercase', label: 'UPPERCASE', description: 'ALL LETTERS CAPITALIZED' },
    { key: 'lowercase', label: 'lowercase', description: 'all letters in small case' },
    { key: 'titleCase', label: 'Title Case', description: 'First Letter Of Each Word Capitalized' },
    { key: 'sentenceCase', label: 'Sentence case', description: 'First letter of sentences capitalized' },
    { key: 'capitalCase', label: 'Capital Case', description: 'All Words Capitalized With Spaces' },
    { key: 'camelCase', label: 'camelCase', description: 'firstWordLowercaseOthersCapitalized' },
    { key: 'pascalCase', label: 'PascalCase', description: 'AllWordsCapitalizedNoSpaces' },
    { key: 'snakeCase', label: 'snake_case', description: 'words_separated_by_underscores' },
    { key: 'kebabCase', label: 'kebab-case', description: 'words-separated-by-hyphens' },
    { key: 'dotCase', label: 'dot.case', description: 'words.separated.by.dots' },
    { key: 'pathCase', label: 'path/case', description: 'words/separated/by/slashes' },
    { key: 'trainCase', label: 'Train-Case', description: 'Words-Capitalized-With-Hyphens' },
    { key: 'constantCase', label: 'CONSTANT_CASE', description: 'ALL_WORDS_UPPERCASE_WITH_UNDERSCORES' },
    { key: 'alternatingCase', label: 'aLtErNaTiNg CaSe', description: 'alternating upper and lower case' },
    { key: 'swapCase', label: 'sWAP cASE', description: 'opposite case of each character' },
    { key: 'inverseCase', label: 'iNVERSE cASE', description: 'opposite case of original' },
    { key: 'spongebobCase', label: 'SpOnGeBoB cAsE', description: 'random mocking text style' },
    { key: 'randomCase', label: 'rAnDoM cAsE', description: 'randomly mixed upper and lower case' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Helmet>
        <title>Case Converter - Convert Text to UPPER, lower, Title, camelCase | DapsiWow</title>
        <meta name="description" content="Free online case converter tool to transform text between UPPERCASE, lowercase, Title Case, camelCase, PascalCase, snake_case, kebab-case and more. Instant text case conversion with advanced customization options." />
        <meta name="keywords" content="case converter, text converter, uppercase, lowercase, title case, camelCase, PascalCase, snake_case, kebab-case, text transformation, programming naming conventions, variable name converter" />
        <meta property="og:title" content="Case Converter - Convert Text to UPPER, lower, Title, camelCase" />
        <meta property="og:description" content="Free online case converter for all text transformation needs. Convert between uppercase, lowercase, camelCase and more instantly with advanced customization features." />
        <meta property="og:type" content="website" />
        <meta name="robots" content="index, follow" />
        <meta name="author" content="DapsiWow" />
        <link rel="canonical" href="https://dapsiwow.com/tools/case-converter" />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            "name": "Case Converter Tool",
            "description": "Free online case converter to transform text between various case formats including UPPERCASE, lowercase, Title Case, camelCase, PascalCase, snake_case, and kebab-case.",
            "url": "https://dapsiwow.com/tools/case-converter",
            "applicationCategory": "ProductivityApplication",
            "operatingSystem": "Any",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "USD"
            },
            "featureList": [
              "Convert to 12+ different case formats",
              "Real-time text conversion",
              "Advanced customization options",
              "Programming naming conventions",
              "Copy to clipboard functionality",
              "Prefix and suffix support"
            ]
          })}
        </script>
      </Helmet>
      
      <Header />
      
      <main>
        {/* Hero Section */}
        <section className="relative py-12 sm:py-16 md:py-20 lg:py-24 xl:py-28 2xl:py-32 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-indigo-600/20"></div>
          <div className="relative max-w-sm sm:max-w-lg md:max-w-2xl lg:max-w-4xl xl:max-w-5xl 2xl:max-w-6xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 xl:px-12 text-center">
            <div className="space-y-4 sm:space-y-6 md:space-y-8 lg:space-y-10">
              <div className="inline-flex items-center px-3 py-1.5 sm:px-4 sm:py-2 bg-white/80 backdrop-blur-sm rounded-full border border-blue-200">
                <span className="text-xs sm:text-sm font-medium text-blue-700">Professional Text Converter</span>
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl 2xl:text-8xl font-bold text-slate-900 leading-tight tracking-tight" data-testid="text-page-title">
                <span className="block">Smart Case</span>
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 mt-1 sm:mt-2">
                  Converter
                </span>
              </h1>
              <p className="text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl text-slate-600 max-w-sm sm:max-w-lg md:max-w-2xl lg:max-w-3xl xl:max-w-4xl mx-auto leading-relaxed px-2 sm:px-0">
                Transform text between UPPERCASE, lowercase, Title Case, camelCase, PascalCase and many other formats instantly
              </p>
            </div>
          </div>
        </section>

        <div className="w-full max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-6 sm:py-8 md:py-12 lg:py-16">
          {/* Main Calculator Card */}
          <Card className="bg-white/90 backdrop-blur-sm shadow-2xl border-0 rounded-xl sm:rounded-2xl md:rounded-3xl overflow-hidden">
            <CardContent className="p-0">
              <div className="flex flex-col">
                {/* Input Section */}
                <div className="p-3 sm:p-4 md:p-6 lg:p-8 xl:p-10 2xl:p-12 space-y-4 sm:space-y-6 md:space-y-8">
                  <div className="text-center sm:text-left">
                    <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">Text Conversion</h2>
                    <p className="text-sm sm:text-base text-gray-600">Enter your text to convert between different case formats</p>
                  </div>
                  
                  {/* Text Area */}
                  <div className="space-y-2 sm:space-y-3 md:space-y-4">
                    <Label htmlFor="text-input" className="text-xs sm:text-sm font-semibold text-gray-800 uppercase tracking-wide">
                      Text to Convert
                    </Label>
                    <Textarea
                      id="text-input"
                      value={text}
                      onChange={(e) => setText(e.target.value)}
                      className="min-h-[200px] sm:min-h-[250px] lg:min-h-[300px] text-sm sm:text-base border-2 border-gray-200 rounded-lg sm:rounded-xl focus:border-blue-500 focus:ring-blue-500 resize-none"
                      placeholder="Type or paste your text here to convert between different case formats..."
                      data-testid="textarea-text-input"
                    />
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
                        
                        {/* Text Processing Options */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                          <div className="space-y-4 bg-gray-50 rounded-xl p-4 sm:p-6">
                            <h4 className="text-sm sm:text-base font-semibold text-gray-900">Text Processing</h4>
                            
                            <div className="flex items-center justify-between gap-2">
                              <div className="space-y-1 flex-1 min-w-0">
                                <Label className="text-xs sm:text-sm font-medium">Preserve Numbers</Label>
                                <p className="text-xs text-gray-500">Keep digits in programming cases</p>
                              </div>
                              <Switch
                                checked={advancedOptions.preserveNumbers}
                                onCheckedChange={(value) => updateAdvancedOption('preserveNumbers', value)}
                                data-testid="switch-preserve-numbers"
                              />
                            </div>

                            <div className="flex items-center justify-between gap-2">
                              <div className="space-y-1 flex-1 min-w-0">
                                <Label className="text-xs sm:text-sm font-medium">Remove Extra Spaces</Label>
                                <p className="text-xs text-gray-500">Clean up multiple consecutive spaces</p>
                              </div>
                              <Switch
                                checked={advancedOptions.removeExtraSpaces}
                                onCheckedChange={(value) => updateAdvancedOption('removeExtraSpaces', value)}
                                data-testid="switch-remove-extra-spaces"
                              />
                            </div>

                            <div className="flex items-center justify-between gap-2">
                              <div className="space-y-1 flex-1 min-w-0">
                                <Label className="text-xs sm:text-sm font-medium">Preserve Line Breaks</Label>
                                <p className="text-xs text-gray-500">Keep original line breaks in text</p>
                              </div>
                              <Switch
                                checked={advancedOptions.preserveLineBreaks}
                                onCheckedChange={(value) => updateAdvancedOption('preserveLineBreaks', value)}
                                data-testid="switch-preserve-line-breaks"
                              />
                            </div>

                            <div className="flex items-center justify-between gap-2">
                              <div className="space-y-1 flex-1 min-w-0">
                                <Label className="text-xs sm:text-sm font-medium">Ignore Punctuation</Label>
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
                          <div className="space-y-4 bg-gray-50 rounded-xl p-4 sm:p-6">
                            <h4 className="text-sm sm:text-base font-semibold text-gray-900">Customization</h4>
                            
                            <div className="space-y-2">
                              <Label className="text-xs sm:text-sm font-medium">Custom Separator</Label>
                              <Input
                                value={advancedOptions.customSeparator}
                                onChange={(e) => updateAdvancedOption('customSeparator', e.target.value)}
                                placeholder="e.g., _, -, |, ."
                                className="text-sm h-10 sm:h-12 border-2 border-gray-200 rounded-lg"
                                data-testid="input-custom-separator"
                              />
                              <p className="text-xs text-gray-500">Override default separators for snake_case and kebab-case</p>
                            </div>

                            <div className="space-y-2">
                              <Label className="text-xs sm:text-sm font-medium">Prefix</Label>
                              <Input
                                value={advancedOptions.prefix}
                                onChange={(e) => updateAdvancedOption('prefix', e.target.value)}
                                placeholder="e.g., get_, set_, is_"
                                className="text-sm h-10 sm:h-12 border-2 border-gray-200 rounded-lg"
                                data-testid="input-prefix"
                              />
                              <p className="text-xs text-gray-500">Add prefix to programming case formats</p>
                            </div>

                            <div className="space-y-2">
                              <Label className="text-xs sm:text-sm font-medium">Suffix</Label>
                              <Input
                                value={advancedOptions.suffix}
                                onChange={(e) => updateAdvancedOption('suffix', e.target.value)}
                                placeholder="e.g., _value, _count, _id"
                                className="text-sm h-10 sm:h-12 border-2 border-gray-200 rounded-lg"
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

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row justify-center items-center gap-2 sm:gap-3 md:gap-4 pt-3 sm:pt-4 md:pt-6">
                    <Button
                      onClick={resetCalculator}
                      variant="outline"
                      className="w-full sm:w-auto h-10 sm:h-12 md:h-14 px-4 sm:px-6 md:px-8 border-2 border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold text-sm sm:text-base md:text-lg rounded-lg sm:rounded-xl"
                      data-testid="button-reset"
                    >
                      Reset
                    </Button>
                    <Button
                      onClick={handleSampleText}
                      className="w-full sm:flex-1 h-10 sm:h-12 md:h-14 px-4 sm:px-6 md:px-8 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold text-sm sm:text-base md:text-lg rounded-lg sm:rounded-xl shadow-lg transform transition-all duration-200 hover:scale-[1.02]"
                      data-testid="button-sample-text"
                    >
                      Load Sample Text
                    </Button>
                  </div>
                </div>

                {/* Results Section */}
                <div className="bg-gradient-to-br from-gray-50 to-blue-50 p-3 sm:p-4 md:p-6 lg:p-8 xl:p-10 2xl:p-12 border-t">
                  <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 mb-4 sm:mb-6 md:mb-8">Converted Text</h2>
                  
                  {result && result.original ? (
                    <div className="space-y-2 sm:space-y-3 md:space-y-4" data-testid="case-conversions">
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
                          'bg-rose-50 border-rose-200',
                          'bg-violet-50 border-violet-200',
                          'bg-lime-50 border-lime-200',
                          'bg-amber-50 border-amber-200',
                          'bg-fuchsia-50 border-fuchsia-200',
                          'bg-sky-50 border-sky-200',
                          'bg-slate-50 border-slate-200'
                        ];
                        
                        return (
                          <div 
                            key={type.key} 
                            className={`border-2 rounded-xl p-3 sm:p-4 ${colorClasses[index % colorClasses.length]}`}
                          >
                            <div className="flex items-start justify-between mb-3 gap-3">
                              <div className="flex-1 min-w-0">
                                <h3 className="text-sm sm:text-base font-semibold text-gray-900 truncate">{type.label}</h3>
                                <p className="text-xs sm:text-sm text-gray-600 break-words">{type.description}</p>
                              </div>
                              <Button
                                onClick={() => handleCopyToClipboard(convertedText, type.label)}
                                variant="outline"
                                size="sm"
                                className="text-xs px-2 sm:px-3 py-2 flex-shrink-0 rounded-lg min-w-[60px] sm:min-w-[70px] h-11 sm:h-9 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                                data-testid={`button-copy-${type.key}`}
                              >
                                Copy
                              </Button>
                            </div>
                            <div 
                              className="bg-white p-2 sm:p-3 rounded-lg border border-gray-200 text-xs sm:text-sm font-mono break-all min-h-[40px] sm:min-h-[44px] flex items-center"
                              data-testid={`converted-${type.key}`}
                            >
                              {convertedText || '(empty)'}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-8 sm:py-12 md:py-16" data-testid="no-results">
                      <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-200 rounded-full mx-auto mb-4 sm:mb-6 flex items-center justify-center">
                        <div className="text-2xl sm:text-3xl font-bold text-gray-400">Aa</div>
                      </div>
                      <p className="text-gray-500 text-sm sm:text-base md:text-lg px-4">Enter text above to see converted case formats</p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* SEO Content Sections */}
          <div className="mt-16 space-y-8">
            {/* What is a Case Converter */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">What is a Case Converter?</h2>
                <div className="space-y-4 text-gray-600">
                  <p>
                    A <strong>case converter</strong> is an essential text transformation tool that automatically changes the capitalization pattern of your text according to different formatting standards. Our comprehensive case converter supports over 12 different case formats, making it the perfect solution for developers, writers, content creators, and anyone who needs to standardize text formatting quickly and efficiently.
                  </p>
                  <p>
                    Whether you're working with programming variable names, writing content for different platforms, or need to format text according to specific style guidelines, our case converter provides instant transformation between all major case formats including uppercase, lowercase, title case, and specialized programming conventions like camelCase, PascalCase, snake_case, and kebab-case.
                  </p>
                  <p>
                    The tool features real-time conversion as you type, advanced customization options including prefix and suffix support, custom separators, and intelligent text processing that handles numbers, punctuation, and special characters appropriately for each case format.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Case Types Guide */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
                <CardContent className="p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Standard Case Formats</h2>
                  <div className="space-y-4">
                    <div className="bg-blue-50 rounded-lg p-4">
                      <h3 className="font-semibold text-blue-900 mb-2">UPPERCASE</h3>
                      <p className="text-blue-800 text-sm mb-2">ALL LETTERS CONVERTED TO CAPITAL LETTERS</p>
                      <p className="text-blue-700 text-xs">Perfect for headings, emphasis, constants, and attention-grabbing text. Commonly used in marketing materials and document titles.</p>
                    </div>
                    
                    <div className="bg-green-50 rounded-lg p-4">
                      <h3 className="font-semibold text-green-900 mb-2">lowercase</h3>
                      <p className="text-green-800 text-sm mb-2">all letters converted to small letters</p>
                      <p className="text-green-700 text-xs">Standard format for general text, email addresses, URLs, and casual content. Provides a clean, readable appearance.</p>
                    </div>
                    
                    <div className="bg-purple-50 rounded-lg p-4">
                      <h3 className="font-semibold text-purple-900 mb-2">Title Case</h3>
                      <p className="text-purple-800 text-sm mb-2">First Letter Of Each Word Capitalized</p>
                      <p className="text-purple-700 text-xs">Ideal for headlines, book titles, article headings, and formal document titles following standard publishing guidelines.</p>
                    </div>
                    
                    <div className="bg-orange-50 rounded-lg p-4">
                      <h3 className="font-semibold text-orange-900 mb-2">Sentence case</h3>
                      <p className="text-orange-800 text-sm mb-2">First letter of sentences capitalized</p>
                      <p className="text-orange-700 text-xs">Standard format for paragraphs, descriptions, and regular text content following grammatical conventions.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
                <CardContent className="p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Programming Case Formats</h2>
                  <div className="space-y-4">
                    <div className="bg-indigo-50 rounded-lg p-4">
                      <h3 className="font-semibold text-indigo-900 mb-2">camelCase</h3>
                      <p className="text-indigo-800 text-sm mb-2">firstWordLowercaseOthersCapitalized</p>
                      <p className="text-indigo-700 text-xs">Standard for JavaScript variables, Java methods, and many modern programming languages. No spaces or separators.</p>
                    </div>
                    
                    <div className="bg-teal-50 rounded-lg p-4">
                      <h3 className="font-semibold text-teal-900 mb-2">PascalCase</h3>
                      <p className="text-teal-800 text-sm mb-2">AllWordsCapitalizedNoSpaces</p>
                      <p className="text-teal-700 text-xs">Used for class names, component names, and type definitions in programming. Also called UpperCamelCase.</p>
                    </div>
                    
                    <div className="bg-red-50 rounded-lg p-4">
                      <h3 className="font-semibold text-red-900 mb-2">snake_case</h3>
                      <p className="text-red-800 text-sm mb-2">words_separated_by_underscores</p>
                      <p className="text-red-700 text-xs">Popular in Python, Ruby, and database naming. All lowercase with underscores separating words.</p>
                    </div>
                    
                    <div className="bg-yellow-50 rounded-lg p-4">
                      <h3 className="font-semibold text-yellow-900 mb-2">kebab-case</h3>
                      <p className="text-yellow-800 text-sm mb-2">words-separated-by-hyphens</p>
                      <p className="text-yellow-700 text-xs">Standard for URLs, CSS classes, and HTML attributes. Also called dash-case or spinal-case.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Programming Language Conventions */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Programming Language Naming Conventions</h2>
                <p className="text-gray-600 mb-8">Different programming languages have established naming conventions that improve code readability and maintainability. Our case converter helps you follow these industry standards.</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center mb-3">
                      <div className="w-8 h-8 bg-yellow-500 rounded flex items-center justify-center mr-3">
                        <span className="text-white font-bold text-sm">JS</span>
                      </div>
                      <h3 className="font-semibold text-gray-900">JavaScript</h3>
                    </div>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li><strong>Variables:</strong> camelCase</li>
                      <li><strong>Functions:</strong> camelCase</li>
                      <li><strong>Classes:</strong> PascalCase</li>
                      <li><strong>Constants:</strong> UPPER_SNAKE_CASE</li>
                    </ul>
                  </div>

                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center mb-3">
                      <div className="w-8 h-8 bg-blue-500 rounded flex items-center justify-center mr-3">
                        <span className="text-white font-bold text-sm">PY</span>
                      </div>
                      <h3 className="font-semibold text-gray-900">Python</h3>
                    </div>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li><strong>Variables:</strong> snake_case</li>
                      <li><strong>Functions:</strong> snake_case</li>
                      <li><strong>Classes:</strong> PascalCase</li>
                      <li><strong>Constants:</strong> UPPER_SNAKE_CASE</li>
                    </ul>
                  </div>

                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center mb-3">
                      <div className="w-8 h-8 bg-orange-500 rounded flex items-center justify-center mr-3">
                        <span className="text-white font-bold text-sm">GO</span>
                      </div>
                      <h3 className="font-semibold text-gray-900">Go</h3>
                    </div>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li><strong>Public:</strong> PascalCase</li>
                      <li><strong>Private:</strong> camelCase</li>
                      <li><strong>Constants:</strong> PascalCase</li>
                      <li><strong>Packages:</strong> lowercase</li>
                    </ul>
                  </div>

                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center mb-3">
                      <div className="w-8 h-8 bg-red-500 rounded flex items-center justify-center mr-3">
                        <span className="text-white font-bold text-sm">RB</span>
                      </div>
                      <h3 className="font-semibold text-gray-900">Ruby</h3>
                    </div>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li><strong>Variables:</strong> snake_case</li>
                      <li><strong>Methods:</strong> snake_case</li>
                      <li><strong>Classes:</strong> PascalCase</li>
                      <li><strong>Constants:</strong> UPPER_SNAKE_CASE</li>
                    </ul>
                  </div>

                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center mb-3">
                      <div className="w-8 h-8 bg-purple-500 rounded flex items-center justify-center mr-3">
                        <span className="text-white font-bold text-sm">C#</span>
                      </div>
                      <h3 className="font-semibold text-gray-900">C#</h3>
                    </div>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li><strong>Properties:</strong> PascalCase</li>
                      <li><strong>Methods:</strong> PascalCase</li>
                      <li><strong>Classes:</strong> PascalCase</li>
                      <li><strong>Variables:</strong> camelCase</li>
                    </ul>
                  </div>

                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center mb-3">
                      <div className="w-8 h-8 bg-green-500 rounded flex items-center justify-center mr-3">
                        <span className="text-white font-bold text-sm">RS</span>
                      </div>
                      <h3 className="font-semibold text-gray-900">Rust</h3>
                    </div>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li><strong>Variables:</strong> snake_case</li>
                      <li><strong>Functions:</strong> snake_case</li>
                      <li><strong>Types:</strong> PascalCase</li>
                      <li><strong>Constants:</strong> UPPER_SNAKE_CASE</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Use Cases and Benefits */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
                <CardContent className="p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Who Uses Case Converters?</h2>
                  <div className="space-y-4">
                    <div className="bg-blue-50 rounded-lg p-4">
                      <h3 className="font-semibold text-blue-900 mb-2">Software Developers</h3>
                      <p className="text-blue-800 text-sm">Convert variable names, function names, and class names to follow programming language conventions. Essential for code refactoring and maintaining consistency across projects.</p>
                    </div>
                    
                    <div className="bg-green-50 rounded-lg p-4">
                      <h3 className="font-semibold text-green-900 mb-2">Content Writers & Editors</h3>
                      <p className="text-green-800 text-sm">Format titles, headings, and content for different platforms. Ensure consistency in capitalization across articles, blogs, and marketing materials.</p>
                    </div>
                    
                    <div className="bg-purple-50 rounded-lg p-4">
                      <h3 className="font-semibold text-purple-900 mb-2">Digital Marketers</h3>
                      <p className="text-purple-800 text-sm">Create consistent formatting for social media posts, email campaigns, and advertising copy. Convert text for different platform requirements.</p>
                    </div>
                    
                    <div className="bg-orange-50 rounded-lg p-4">
                      <h3 className="font-semibold text-orange-900 mb-2">Students & Researchers</h3>
                      <p className="text-orange-800 text-sm">Format citations, references, and academic papers according to different style guides. Ensure proper capitalization in research documents.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
                <CardContent className="p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Key Features & Benefits</h2>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                        <span className="text-white text-xs font-bold">✓</span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-1">Real-Time Conversion</h4>
                        <p className="text-gray-600 text-sm">Instant text transformation as you type with immediate results for all supported case formats.</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                        <span className="text-white text-xs font-bold">✓</span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-1">12+ Case Formats</h4>
                        <p className="text-gray-600 text-sm">Support for all major case types including programming conventions and standard text formats.</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                        <span className="text-white text-xs font-bold">✓</span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-1">Advanced Customization</h4>
                        <p className="text-gray-600 text-sm">Custom prefixes, suffixes, separators, and intelligent text processing options.</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                        <span className="text-white text-xs font-bold">✓</span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-1">One-Click Copy</h4>
                        <p className="text-gray-600 text-sm">Easy copy-to-clipboard functionality for each converted format with instant feedback.</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-teal-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                        <span className="text-white text-xs font-bold">✓</span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-1">Privacy Protected</h4>
                        <p className="text-gray-600 text-sm">All processing happens in your browser - no data sent to servers, ensuring complete privacy.</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Frequently Asked Questions */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-8">Frequently Asked Questions</h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">What's the difference between camelCase and PascalCase?</h3>
                      <p className="text-gray-600 text-sm">CamelCase starts with a lowercase letter (myVariableName), while PascalCase starts with an uppercase letter (MyClassName). Both capitalize subsequent words without spaces. CamelCase is typically used for variables and functions, while PascalCase is used for classes and types.</p>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">When should I use snake_case vs kebab-case?</h3>
                      <p className="text-gray-600 text-sm">Snake_case uses underscores and is common in Python, databases, and file names. Kebab-case uses hyphens and is preferred for URLs, CSS classes, and HTML attributes because hyphens are web-friendly and improve SEO readability.</p>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Can the tool handle special characters and numbers?</h3>
                      <p className="text-gray-600 text-sm">Yes! Our converter intelligently handles numbers, punctuation, and special characters. You can configure whether to preserve numbers and how to handle punctuation through the advanced options panel.</p>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Is the case converter free to use?</h3>
                      <p className="text-gray-600 text-sm">Absolutely! Our case converter is completely free with no registration required, no usage limits, and access to all features including advanced customization options.</p>
                    </div>
                  </div>
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">How does the alternating case work?</h3>
                      <p className="text-gray-600 text-sm">Alternating case switches between lowercase and uppercase for each character position, creating patterns like "aLtErNaTiNg CaSe". It's often used for stylistic purposes, mocking text, or creative content on social media.</p>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Can I add custom prefixes and suffixes?</h3>
                      <p className="text-gray-600 text-sm">Yes! The advanced options allow you to add custom prefixes (like "get_", "set_") and suffixes (like "_value", "_count") to programming case formats, making it perfect for generating consistent variable names.</p>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Does the tool work offline?</h3>
                      <p className="text-gray-600 text-sm">Yes! Once the page loads, all text conversion happens locally in your browser without requiring an internet connection. Your text never leaves your device, ensuring complete privacy and security.</p>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">What programming languages benefit from this tool?</h3>
                      <p className="text-gray-600 text-sm">All modern programming languages including JavaScript, Python, Java, C#, Go, Rust, Ruby, PHP, and more. Each language has specific naming conventions that our converter supports.</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Best Practices */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Best Practices for Text Case Conversion</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">Programming Guidelines</h3>
                    <div className="space-y-3">
                      <div className="bg-blue-50 border-l-4 border-blue-400 p-3 rounded-r-lg">
                        <h4 className="font-semibold text-blue-900 text-sm">Variable Naming</h4>
                        <p className="text-blue-800 text-xs mt-1">Use camelCase for JavaScript/Java variables, snake_case for Python variables. Be consistent within your codebase.</p>
                      </div>
                      <div className="bg-green-50 border-l-4 border-green-400 p-3 rounded-r-lg">
                        <h4 className="font-semibold text-green-900 text-sm">Class Names</h4>
                        <p className="text-green-800 text-xs mt-1">Always use PascalCase for class names across all programming languages. This improves code readability and follows industry standards.</p>
                      </div>
                      <div className="bg-purple-50 border-l-4 border-purple-400 p-3 rounded-r-lg">
                        <h4 className="font-semibold text-purple-900 text-sm">Constants</h4>
                        <p className="text-purple-800 text-xs mt-1">Use UPPER_SNAKE_CASE for constants in most languages. This makes them easily identifiable and follows convention.</p>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">Content Writing Guidelines</h3>
                    <div className="space-y-3">
                      <div className="bg-orange-50 border-l-4 border-orange-400 p-3 rounded-r-lg">
                        <h4 className="font-semibold text-orange-900 text-sm">Headlines & Titles</h4>
                        <p className="text-orange-800 text-xs mt-1">Use Title Case for headlines and article titles. Avoid capitalizing articles, prepositions, and conjunctions unless they start the title.</p>
                      </div>
                      <div className="bg-teal-50 border-l-4 border-teal-400 p-3 rounded-r-lg">
                        <h4 className="font-semibold text-teal-900 text-sm">URL Optimization</h4>
                        <p className="text-teal-800 text-xs mt-1">Use kebab-case for URLs and slugs. Search engines prefer hyphens over underscores, improving SEO performance.</p>
                      </div>
                      <div className="bg-red-50 border-l-4 border-red-400 p-3 rounded-r-lg">
                        <h4 className="font-semibold text-red-900 text-sm">Social Media</h4>
                        <p className="text-red-800 text-xs mt-1">Use sentence case for social media posts and captions. Avoid excessive capitalization which can appear as shouting.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Related Tools */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-4 sm:p-5 md:p-6 lg:p-7 xl:p-8 2xl:p-10">
                <h2 className="text-xl sm:text-2xl md:text-2xl lg:text-3xl xl:text-3xl 2xl:text-4xl font-bold text-gray-900 mb-3 sm:mb-4 md:mb-5 lg:mb-6 xl:mb-6 2xl:mb-8">Related Text Tools</h2>
                <p className="text-xs sm:text-sm md:text-base lg:text-base xl:text-lg 2xl:text-xl text-gray-600 mb-4 sm:mb-5 md:mb-6 lg:mb-7 xl:mb-8 2xl:mb-10">Enhance your text analysis workflow with our comprehensive suite of complementary tools.</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-3 gap-3 sm:gap-4 md:gap-5 lg:gap-6 xl:gap-6 2xl:gap-8">
                  <a href="/tools/word-counter" className="block bg-gradient-to-br from-blue-50 to-indigo-50 p-3 sm:p-4 md:p-5 lg:p-5 xl:p-6 2xl:p-7 rounded-lg sm:rounded-xl md:rounded-xl lg:rounded-xl xl:rounded-2xl 2xl:rounded-2xl hover:shadow-lg transition-shadow group border border-blue-100" data-testid="link-word-counter">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-11 md:h-11 lg:w-12 lg:h-12 xl:w-12 xl:h-12 2xl:w-14 2xl:h-14 bg-blue-600 text-white rounded-md sm:rounded-lg md:rounded-lg lg:rounded-lg xl:rounded-xl 2xl:rounded-xl flex items-center justify-center mb-2 sm:mb-3 md:mb-3 lg:mb-4 xl:mb-4 2xl:mb-5 group-hover:bg-blue-700 transition-colors text-sm sm:text-base md:text-lg lg:text-xl xl:text-xl 2xl:text-2xl font-bold">
                      W
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-1 sm:mb-1.5 md:mb-2 lg:mb-2 xl:mb-2 2xl:mb-3 group-hover:text-blue-600 text-sm sm:text-base md:text-base lg:text-lg xl:text-lg 2xl:text-xl">Word Counter</h3>
                    <p className="text-gray-600 text-xs sm:text-xs md:text-sm lg:text-sm xl:text-base 2xl:text-base leading-snug sm:leading-normal md:leading-relaxed">Count words, characters, and analyze text length for content creation and writing projects.</p>
                  </a>

                  <a href="/tools/character-counter" className="block bg-gradient-to-br from-green-50 to-emerald-50 p-3 sm:p-4 md:p-5 lg:p-5 xl:p-6 2xl:p-7 rounded-lg sm:rounded-xl md:rounded-xl lg:rounded-xl xl:rounded-2xl 2xl:rounded-2xl hover:shadow-lg transition-shadow group border border-green-100" data-testid="link-character-counter">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-11 md:h-11 lg:w-12 lg:h-12 xl:w-12 xl:h-12 2xl:w-14 2xl:h-14 bg-green-600 text-white rounded-md sm:rounded-lg md:rounded-lg lg:rounded-lg xl:rounded-xl 2xl:rounded-xl flex items-center justify-center mb-2 sm:mb-3 md:mb-3 lg:mb-4 xl:mb-4 2xl:mb-5 group-hover:bg-green-700 transition-colors text-sm sm:text-base md:text-lg lg:text-xl xl:text-xl 2xl:text-2xl font-bold">
                      C
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-1 sm:mb-1.5 md:mb-2 lg:mb-2 xl:mb-2 2xl:mb-3 group-hover:text-green-600 text-sm sm:text-base md:text-base lg:text-lg xl:text-lg 2xl:text-xl">Character Counter</h3>
                    <p className="text-gray-600 text-xs sm:text-xs md:text-sm lg:text-sm xl:text-base 2xl:text-base leading-snug sm:leading-normal md:leading-relaxed">Count characters with precision for social media posts, meta descriptions, and character-limited content.</p>
                  </a>

                  <a href="/tools/sentence-counter" className="block bg-gradient-to-br from-purple-50 to-violet-50 p-3 sm:p-4 md:p-5 lg:p-5 xl:p-6 2xl:p-7 rounded-lg sm:rounded-xl md:rounded-xl lg:rounded-xl xl:rounded-2xl 2xl:rounded-2xl hover:shadow-lg transition-shadow group border border-purple-100" data-testid="link-sentence-counter">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-11 md:h-11 lg:w-12 lg:h-12 xl:w-12 xl:h-12 2xl:w-14 2xl:h-14 bg-purple-600 text-white rounded-md sm:rounded-lg md:rounded-lg lg:rounded-lg xl:rounded-xl 2xl:rounded-xl flex items-center justify-center mb-2 sm:mb-3 md:mb-3 lg:mb-4 xl:mb-4 2xl:mb-5 group-hover:bg-purple-700 transition-colors text-sm sm:text-base md:text-lg lg:text-xl xl:text-xl 2xl:text-2xl font-bold">
                      S
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-1 sm:mb-1.5 md:mb-2 lg:mb-2 xl:mb-2 2xl:mb-3 group-hover:text-purple-600 text-sm sm:text-base md:text-base lg:text-lg xl:text-lg 2xl:text-xl">Sentence Counter</h3>
                    <p className="text-gray-600 text-xs sm:text-xs md:text-sm lg:text-sm xl:text-base 2xl:text-base leading-snug sm:leading-normal md:leading-relaxed">Analyze sentence structure and count sentences to improve readability and writing flow.</p>
                  </a>

                  <a href="/tools/paragraph-counter" className="block bg-gradient-to-br from-orange-50 to-amber-50 p-3 sm:p-4 md:p-5 lg:p-5 xl:p-6 2xl:p-7 rounded-lg sm:rounded-xl md:rounded-xl lg:rounded-xl xl:rounded-2xl 2xl:rounded-2xl hover:shadow-lg transition-shadow group border border-orange-100" data-testid="link-paragraph-counter">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-11 md:h-11 lg:w-12 lg:h-12 xl:w-12 xl:h-12 2xl:w-14 2xl:h-14 bg-orange-600 text-white rounded-md sm:rounded-lg md:rounded-lg lg:rounded-lg xl:rounded-xl 2xl:rounded-xl flex items-center justify-center mb-2 sm:mb-3 md:mb-3 lg:mb-4 xl:mb-4 2xl:mb-5 group-hover:bg-orange-700 transition-colors text-sm sm:text-base md:text-lg lg:text-xl xl:text-xl 2xl:text-2xl font-bold">
                      P
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-1 sm:mb-1.5 md:mb-2 lg:mb-2 xl:mb-2 2xl:mb-3 group-hover:text-orange-600 text-sm sm:text-base md:text-base lg:text-lg xl:text-lg 2xl:text-xl">Paragraph Counter</h3>
                    <p className="text-gray-600 text-xs sm:text-xs md:text-sm lg:text-sm xl:text-base 2xl:text-base leading-snug sm:leading-normal md:leading-relaxed">Track paragraph count and structure for better document organization and content formatting.</p>
                  </a>

                  <a href="/tools/line-counter" className="block bg-gradient-to-br from-pink-50 to-rose-50 p-3 sm:p-4 md:p-5 lg:p-5 xl:p-6 2xl:p-7 rounded-lg sm:rounded-xl md:rounded-xl lg:rounded-xl xl:rounded-2xl 2xl:rounded-2xl hover:shadow-lg transition-shadow group border border-pink-100" data-testid="link-line-counter">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-11 md:h-11 lg:w-12 lg:h-12 xl:w-12 xl:h-12 2xl:w-14 2xl:h-14 bg-pink-600 text-white rounded-md sm:rounded-lg md:rounded-lg lg:rounded-lg xl:rounded-xl 2xl:rounded-xl flex items-center justify-center mb-2 sm:mb-3 md:mb-3 lg:mb-4 xl:mb-4 2xl:mb-5 group-hover:bg-pink-700 transition-colors text-sm sm:text-base md:text-lg lg:text-xl xl:text-xl 2xl:text-2xl font-bold">
                      L
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-1 sm:mb-1.5 md:mb-2 lg:mb-2 xl:mb-2 2xl:mb-3 group-hover:text-pink-600 text-sm sm:text-base md:text-base lg:text-lg xl:text-lg 2xl:text-xl">Line Counter</h3>
                    <p className="text-gray-600 text-xs sm:text-xs md:text-sm lg:text-sm xl:text-base 2xl:text-base leading-snug sm:leading-normal md:leading-relaxed">Count lines in text documents, code files, and formatted content for accurate analysis.</p>
                  </a>

                  <a href="/tools/reading-time-calculator" className="block bg-gradient-to-br from-teal-50 to-cyan-50 p-3 sm:p-4 md:p-5 lg:p-5 xl:p-6 2xl:p-7 rounded-lg sm:rounded-xl md:rounded-xl lg:rounded-xl xl:rounded-2xl 2xl:rounded-2xl hover:shadow-lg transition-shadow group border border-teal-100" data-testid="link-reading-time">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-11 md:h-11 lg:w-12 lg:h-12 xl:w-12 xl:h-12 2xl:w-14 2xl:h-14 bg-teal-600 text-white rounded-md sm:rounded-lg md:rounded-lg lg:rounded-lg xl:rounded-xl 2xl:rounded-xl flex items-center justify-center mb-2 sm:mb-3 md:mb-3 lg:mb-4 xl:mb-4 2xl:mb-5 group-hover:bg-teal-700 transition-colors text-sm sm:text-base md:text-lg lg:text-xl xl:text-xl 2xl:text-2xl font-bold">
                      R
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-1 sm:mb-1.5 md:mb-2 lg:mb-2 xl:mb-2 2xl:mb-3 group-hover:text-teal-600 text-sm sm:text-base md:text-base lg:text-lg xl:text-lg 2xl:text-xl">Reading Time Calculator</h3>
                    <p className="text-gray-600 text-xs sm:text-xs md:text-sm lg:text-sm xl:text-base 2xl:text-base leading-snug sm:leading-normal md:leading-relaxed">Estimate reading time for articles and blog posts to improve user experience and engagement.</p>
                  </a>
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

export default CaseConverter;
