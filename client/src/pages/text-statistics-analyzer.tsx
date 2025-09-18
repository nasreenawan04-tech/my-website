
import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface TextStatistics {
  // Basic counts
  characters: number;
  charactersNoSpaces: number;
  words: number;
  sentences: number;
  paragraphs: number;
  lines: number;
  
  // Advanced analysis
  averageWordsPerSentence: number;
  averageCharactersPerWord: number;
  longestWord: string;
  shortestWord: string;
  uniqueWords: number;
  
  // Reading metrics
  readingTime: number;
  speakingTime: number;
  
  // Language analysis
  uppercaseLetters: number;
  lowercaseLetters: number;
  digits: number;
  punctuation: number;
  specialCharacters: number;
  
  // Most frequent words
  mostFrequentWords: Array<{ word: string; count: number; percentage: number }>;
  
  // Readability scores
  fleischReadingEase: number;
  readabilityLevel: string;
  
  // Text complexity
  lexicalDiversity: number;
  averageSyllablesPerWord: number;
}

interface AnalysisOptions {
  includeAdvancedMetrics: boolean;
  includeWordFrequency: boolean;
  includeReadabilityScores: boolean;
  minWordLength: number;
  excludeCommonWords: boolean;
  caseSensitiveAnalysis: boolean;
}

const TextStatisticsAnalyzer = () => {
  const [text, setText] = useState('');
  const [statistics, setStatistics] = useState<TextStatistics | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [analysisOptions, setAnalysisOptions] = useState<AnalysisOptions>({
    includeAdvancedMetrics: true,
    includeWordFrequency: true,
    includeReadabilityScores: true,
    minWordLength: 3,
    excludeCommonWords: true,
    caseSensitiveAnalysis: false
  });

  const countSyllables = (word: string): number => {
    const cleanWord = word.toLowerCase().replace(/[^a-z]/g, '');
    if (cleanWord.length === 0) return 0;
    
    const vowels = 'aeiouy';
    let syllableCount = 0;
    let previousWasVowel = false;
    
    for (let i = 0; i < cleanWord.length; i++) {
      const isVowel = vowels.includes(cleanWord[i]);
      if (isVowel && !previousWasVowel) {
        syllableCount++;
      }
      previousWasVowel = isVowel;
    }
    
    // Handle silent 'e'
    if (cleanWord.endsWith('e') && syllableCount > 1) {
      syllableCount--;
    }
    
    return Math.max(1, syllableCount);
  };

  const calculateFleschReadingEase = (
    averageWordsPerSentence: number,
    averageSyllablesPerWord: number
  ): number => {
    return 206.835 - (1.015 * averageWordsPerSentence) - (84.6 * averageSyllablesPerWord);
  };

  const getReadabilityLevel = (score: number): string => {
    if (score >= 90) return 'Very Easy';
    if (score >= 80) return 'Easy';
    if (score >= 70) return 'Fairly Easy';
    if (score >= 60) return 'Standard';
    if (score >= 50) return 'Fairly Difficult';
    if (score >= 30) return 'Difficult';
    return 'Very Difficult';
  };

  const commonWords = new Set([
    'the', 'and', 'for', 'are', 'but', 'not', 'you', 'all', 'can', 'had', 'her', 'was', 'one',
    'our', 'out', 'day', 'get', 'has', 'him', 'his', 'how', 'its', 'may', 'new', 'now', 'old',
    'see', 'two', 'way', 'who', 'boy', 'did', 'she', 'use', 'any', 'man', 'say', 'own', 'too'
  ]);

  const analyzeText = (inputText: string, options: AnalysisOptions): TextStatistics => {
    if (!inputText.trim()) {
      return {
        characters: 0,
        charactersNoSpaces: 0,
        words: 0,
        sentences: 0,
        paragraphs: 0,
        lines: 0,
        averageWordsPerSentence: 0,
        averageCharactersPerWord: 0,
        longestWord: '',
        shortestWord: '',
        uniqueWords: 0,
        readingTime: 0,
        speakingTime: 0,
        uppercaseLetters: 0,
        lowercaseLetters: 0,
        digits: 0,
        punctuation: 0,
        specialCharacters: 0,
        mostFrequentWords: [],
        fleischReadingEase: 0,
        readabilityLevel: 'N/A',
        lexicalDiversity: 0,
        averageSyllablesPerWord: 0
      };
    }

    // Basic counts
    const characters = inputText.length;
    const charactersNoSpaces = inputText.replace(/\s/g, '').length;
    const lines = inputText.split('\n').length;
    
    // Words analysis
    const words = inputText.trim().split(/\s+/).filter(word => word.length > 0);
    const wordCount = words.length;
    
    let cleanWords = words.map(word => word.replace(/[^\w]/g, ''));
    if (!options.caseSensitiveAnalysis) {
      cleanWords = cleanWords.map(word => word.toLowerCase());
    }
    cleanWords = cleanWords.filter(word => word.length >= options.minWordLength);
    
    // Sentences and paragraphs
    const sentences = inputText.split(/[.!?]+/).filter(sentence => sentence.trim().length > 0);
    const sentenceCount = sentences.length;
    const paragraphs = inputText.split(/\n\s*\n/).filter(paragraph => paragraph.trim().length > 0);
    const paragraphCount = paragraphs.length;

    // Advanced word analysis
    const wordLengths = cleanWords.map(word => word.length);
    const longestWord = words.reduce((longest, current) => 
      current.replace(/[^\w]/g, '').length > longest.replace(/[^\w]/g, '').length ? current : longest, '');
    const shortestWord = words.reduce((shortest, current) => 
      current.replace(/[^\w]/g, '').length < shortest.replace(/[^\w]/g, '').length ? current : shortest, words[0] || '');
    
    const uniqueWords = new Set(cleanWords).size;
    const lexicalDiversity = wordCount > 0 ? (uniqueWords / wordCount) * 100 : 0;

    // Character type analysis
    const uppercaseLetters = (inputText.match(/[A-Z]/g) || []).length;
    const lowercaseLetters = (inputText.match(/[a-z]/g) || []).length;
    const digits = (inputText.match(/[0-9]/g) || []).length;
    const punctuation = (inputText.match(/[.,;:!?'"()[\]{}\-]/g) || []).length;
    const specialCharacters = (inputText.match(/[^a-zA-Z0-9\s.,;:!?'"()[\]{}\-]/g) || []).length;

    // Averages
    const averageWordsPerSentence = sentenceCount > 0 ? wordCount / sentenceCount : 0;
    const averageCharactersPerWord = wordCount > 0 ? 
      wordLengths.reduce((sum, length) => sum + length, 0) / wordCount : 0;

    // Syllable analysis
    const totalSyllables = cleanWords.reduce((total, word) => total + countSyllables(word), 0);
    const averageSyllablesPerWord = wordCount > 0 ? totalSyllables / wordCount : 0;

    // Reading metrics
    const readingTime = Math.ceil(wordCount / 200); // 200 words per minute
    const speakingTime = Math.ceil(wordCount / 130); // 130 words per minute

    // Word frequency analysis
    const wordFrequency: { [key: string]: number } = {};
    let wordsToAnalyze = cleanWords;
    
    if (options.excludeCommonWords) {
      wordsToAnalyze = cleanWords.filter(word => !commonWords.has(word.toLowerCase()));
    }
    
    wordsToAnalyze.forEach(word => {
      if (word.length >= options.minWordLength) {
        wordFrequency[word] = (wordFrequency[word] || 0) + 1;
      }
    });

    const mostFrequentWords = Object.entries(wordFrequency)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([word, count]) => ({
        word,
        count,
        percentage: (count / wordCount) * 100
      }));

    // Readability scores
    const fleischReadingEase = calculateFleschReadingEase(averageWordsPerSentence, averageSyllablesPerWord);
    const readabilityLevel = getReadabilityLevel(fleischReadingEase);

    return {
      characters,
      charactersNoSpaces,
      words: wordCount,
      sentences: sentenceCount,
      paragraphs: paragraphCount,
      lines,
      averageWordsPerSentence: Math.round(averageWordsPerSentence * 10) / 10,
      averageCharactersPerWord: Math.round(averageCharactersPerWord * 10) / 10,
      longestWord,
      shortestWord,
      uniqueWords,
      readingTime,
      speakingTime,
      uppercaseLetters,
      lowercaseLetters,
      digits,
      punctuation,
      specialCharacters,
      mostFrequentWords,
      fleischReadingEase: Math.round(fleischReadingEase * 10) / 10,
      readabilityLevel,
      lexicalDiversity: Math.round(lexicalDiversity * 10) / 10,
      averageSyllablesPerWord: Math.round(averageSyllablesPerWord * 10) / 10
    };
  };

  useEffect(() => {
    const stats = analyzeText(text, analysisOptions);
    setStatistics(stats);
  }, [text, analysisOptions]);

  const handleClear = () => {
    setText('');
  };

  const handleSampleText = () => {
    const sample = `Welcome to DapsiWow's comprehensive text statistics analyzer! This powerful tool provides detailed insights into your writing, helping writers, students, and professionals understand various aspects of their content quality and readability.

Our analyzer examines multiple dimensions of text including word count, character analysis, readability scores, vocabulary richness, and linguistic complexity. Whether you're crafting blog posts, academic papers, marketing copy, or creative writing, this tool gives you valuable statistics to improve your content.

The analysis includes basic metrics like word and sentence counts, advanced features such as Flesch Reading Ease scores, lexical diversity measurements, and frequency analysis of commonly used words. Understanding these metrics helps optimize your writing for target audiences, improve engagement, and ensure appropriate reading levels for your specific content goals.`;
    setText(sample);
  };

  const handleCopyToClipboard = (textToCopy: string) => {
    navigator.clipboard.writeText(textToCopy);
  };

  const resetAnalyzer = () => {
    setText('');
    setAnalysisOptions({
      includeAdvancedMetrics: true,
      includeWordFrequency: true,
      includeReadabilityScores: true,
      minWordLength: 3,
      excludeCommonWords: true,
      caseSensitiveAnalysis: false
    });
    setShowAdvanced(false);
    setStatistics(null);
  };

  const updateAnalysisOption = (key: keyof AnalysisOptions, value: boolean | number) => {
    setAnalysisOptions(prev => ({ ...prev, [key]: value }));
  };

  const analysisCards = [
    { key: 'words', label: 'Words', value: statistics?.words || 0, color: 'bg-blue-50 border-blue-200', textColor: 'text-blue-600' },
    { key: 'characters', label: 'Characters', value: statistics?.characters || 0, color: 'bg-green-50 border-green-200', textColor: 'text-green-600' },
    { key: 'sentences', label: 'Sentences', value: statistics?.sentences || 0, color: 'bg-purple-50 border-purple-200', textColor: 'text-purple-600' },
    { key: 'paragraphs', label: 'Paragraphs', value: statistics?.paragraphs || 0, color: 'bg-orange-50 border-orange-200', textColor: 'text-orange-600' },
    { key: 'readingTime', label: 'Reading Time (min)', value: statistics?.readingTime || 0, color: 'bg-pink-50 border-pink-200', textColor: 'text-pink-600' },
    { key: 'readabilityScore', label: 'Reading Ease Score', value: statistics?.fleischReadingEase || 0, color: 'bg-indigo-50 border-indigo-200', textColor: 'text-indigo-600' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Helmet>
        <title>Text Statistics Analyzer - Advanced Text Analysis & Readability Tool | DapsiWow</title>
        <meta name="description" content="Professional text statistics analyzer with readability scores, vocabulary analysis, word frequency metrics, and advanced linguistic insights for writers, students, and content creators." />
        <meta name="keywords" content="text statistics analyzer, readability score, word counter, character counter, flesch reading ease, vocabulary analysis, text metrics, writing analysis, content analysis, linguistic analysis" />
        <meta property="og:title" content="Text Statistics Analyzer - Advanced Text Analysis & Readability Tool" />
        <meta property="og:description" content="Comprehensive text analysis tool providing detailed statistics, readability scores, vocabulary metrics, and linguistic insights for better writing and content optimization." />
        <meta property="og:type" content="website" />
        <meta name="robots" content="index, follow" />
        <meta name="author" content="DapsiWow" />
        <link rel="canonical" href="https://dapsiwow.com/tools/text-statistics-analyzer" />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            "name": "Text Statistics Analyzer",
            "description": "Professional text analysis tool providing comprehensive statistics, readability scores, vocabulary analysis, and linguistic insights for writers and content creators.",
            "url": "https://dapsiwow.com/tools/text-statistics-analyzer",
            "applicationCategory": "ProductivityApplication",
            "operatingSystem": "Any",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "USD"
            },
            "featureList": [
              "Comprehensive text statistics analysis",
              "Flesch Reading Ease score calculation",
              "Vocabulary richness metrics",
              "Word frequency analysis",
              "Character and sentence counting",
              "Reading time estimation",
              "Lexical diversity measurement"
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
                <span className="text-xs sm:text-sm font-medium text-blue-700">Professional Text Analysis</span>
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-slate-900 leading-tight" data-testid="text-page-title">
                Text Statistics
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                  Analyzer
                </span>
              </h1>
              <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-slate-600 max-w-4xl mx-auto leading-relaxed px-2">
                Comprehensive text analysis with readability scores, vocabulary metrics, and advanced linguistic insights
              </p>
            </div>
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
          {/* Main Calculator Card */}
          <Card className="bg-white/90 backdrop-blur-sm shadow-2xl border-0 rounded-2xl sm:rounded-3xl overflow-hidden">
            <CardContent className="p-0">
              <div className="flex flex-col">
                {/* Input Section */}
                <div className="p-4 sm:p-6 md:p-8 lg:p-10 xl:p-12 space-y-6 sm:space-y-8">
                  <div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">Text Analysis</h2>
                    <p className="text-gray-600">Enter your text to get comprehensive statistics and linguistic insights</p>
                  </div>
                  
                  <div className="space-y-4 sm:space-y-6">
                    {/* Text Input */}
                    <div className="space-y-3">
                      <Label htmlFor="text-input" className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                        Text to Analyze
                      </Label>
                      <Textarea
                        id="text-input"
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        className="min-h-[100px] sm:min-h-[120px] lg:min-h-[140px] text-base sm:text-lg border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-blue-500 resize-none"
                        placeholder="Type or paste your text here to get comprehensive statistics, readability scores, and linguistic analysis..."
                        data-testid="textarea-text-input"
                      />
                    </div>
                  </div>

                  {/* Advanced Options */}
                  <div className="space-y-4 sm:space-y-6 border-t pt-6 sm:pt-8">
                    <h3 className="text-lg sm:text-xl font-bold text-gray-900">Analysis Options</h3>
                    
                    <Collapsible open={showAdvanced} onOpenChange={setShowAdvanced}>
                      <CollapsibleTrigger asChild>
                        <Button 
                          variant="ghost" 
                          className="w-full justify-between text-sm sm:text-base py-3 sm:py-4 h-auto"
                          data-testid="button-toggle-advanced"
                        >
                          <span className="flex items-center">
                            Advanced Analysis Settings
                          </span>
                          <span className={`transform transition-transform ${showAdvanced ? 'rotate-180' : ''}`}>▼</span>
                        </Button>
                      </CollapsibleTrigger>
                      <CollapsibleContent className="space-y-4 sm:space-y-6 mt-4">
                        <Separator />
                        
                        {/* Analysis Settings */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                          <div className="space-y-4 bg-gray-50 rounded-xl p-4 sm:p-6">
                            <h4 className="text-sm sm:text-base font-semibold text-gray-900">Analysis Features</h4>
                            
                            <div className="flex items-center justify-between gap-2">
                              <div className="space-y-1 flex-1 min-w-0">
                                <Label className="text-xs sm:text-sm font-medium">Advanced Metrics</Label>
                                <p className="text-xs text-gray-500">Include syllable count and lexical diversity</p>
                              </div>
                              <Switch
                                checked={analysisOptions.includeAdvancedMetrics}
                                onCheckedChange={(value) => updateAnalysisOption('includeAdvancedMetrics', value)}
                                data-testid="switch-advanced-metrics"
                              />
                            </div>

                            <div className="flex items-center justify-between gap-2">
                              <div className="space-y-1 flex-1 min-w-0">
                                <Label className="text-xs sm:text-sm font-medium">Word Frequency Analysis</Label>
                                <p className="text-xs text-gray-500">Show most frequently used words</p>
                              </div>
                              <Switch
                                checked={analysisOptions.includeWordFrequency}
                                onCheckedChange={(value) => updateAnalysisOption('includeWordFrequency', value)}
                                data-testid="switch-word-frequency"
                              />
                            </div>

                            <div className="flex items-center justify-between gap-2">
                              <div className="space-y-1 flex-1 min-w-0">
                                <Label className="text-xs sm:text-sm font-medium">Readability Scores</Label>
                                <p className="text-xs text-gray-500">Calculate Flesch Reading Ease score</p>
                              </div>
                              <Switch
                                checked={analysisOptions.includeReadabilityScores}
                                onCheckedChange={(value) => updateAnalysisOption('includeReadabilityScores', value)}
                                data-testid="switch-readability-scores"
                              />
                            </div>
                          </div>

                          {/* Word Analysis Settings */}
                          <div className="space-y-4 bg-gray-50 rounded-xl p-4 sm:p-6">
                            <h4 className="text-sm sm:text-base font-semibold text-gray-900">Word Analysis</h4>
                            
                            <div className="flex items-center justify-between gap-2">
                              <div className="space-y-1 flex-1 min-w-0">
                                <Label className="text-xs sm:text-sm font-medium">Exclude Common Words</Label>
                                <p className="text-xs text-gray-500">Filter out common words like 'the', 'and', 'or'</p>
                              </div>
                              <Switch
                                checked={analysisOptions.excludeCommonWords}
                                onCheckedChange={(value) => updateAnalysisOption('excludeCommonWords', value)}
                                data-testid="switch-exclude-common"
                              />
                            </div>

                            <div className="flex items-center justify-between gap-2">
                              <div className="space-y-1 flex-1 min-w-0">
                                <Label className="text-xs sm:text-sm font-medium">Case Sensitive Analysis</Label>
                                <p className="text-xs text-gray-500">Treat 'Word' and 'word' as different</p>
                              </div>
                              <Switch
                                checked={analysisOptions.caseSensitiveAnalysis}
                                onCheckedChange={(value) => updateAnalysisOption('caseSensitiveAnalysis', value)}
                                data-testid="switch-case-sensitive"
                              />
                            </div>

                            <div className="space-y-2">
                              <Label className="text-xs sm:text-sm font-medium">Minimum Word Length</Label>
                              <div className="flex items-center space-x-3">
                                <input
                                  type="range"
                                  min="1"
                                  max="10"
                                  value={analysisOptions.minWordLength}
                                  onChange={(e) => updateAnalysisOption('minWordLength', parseInt(e.target.value))}
                                  className="flex-1"
                                />
                                <span className="text-sm font-medium w-8 text-center">{analysisOptions.minWordLength}</span>
                              </div>
                              <p className="text-xs text-gray-500">Minimum letters for word frequency analysis</p>
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
                      onClick={handleSampleText}
                      className="flex-1 h-12 sm:h-14 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold text-base sm:text-lg rounded-xl shadow-lg transform transition-all duration-200 hover:scale-105"
                      data-testid="button-sample-text"
                    >
                      Load Sample Text
                    </Button>
                    <Button
                      onClick={resetAnalyzer}
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
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6 sm:mb-8">Analysis Results</h2>
                  
                  {statistics && statistics.words > 0 ? (
                    <div className="space-y-3 sm:space-y-4" data-testid="text-analysis-results">
                      {/* Basic Statistics Cards */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-6">
                        {analysisCards.map((card) => (
                          <div 
                            key={card.key} 
                            className={`border-2 rounded-xl p-3 sm:p-4 ${card.color}`}
                          >
                            <div className="text-center">
                              <div className={`text-2xl sm:text-3xl font-bold ${card.textColor} mb-1`}>
                                {card.value.toLocaleString()}
                              </div>
                              <div className="text-xs sm:text-sm font-medium text-gray-600">{card.label}</div>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Readability Score */}
                      {analysisOptions.includeReadabilityScores && (
                        <div className="bg-white border-2 border-teal-200 rounded-xl p-4 sm:p-6">
                          <div className="flex items-start justify-between mb-4 gap-3">
                            <div className="flex-1 min-w-0">
                              <h3 className="text-base sm:text-lg font-semibold text-gray-900">Readability Analysis</h3>
                              <p className="text-xs sm:text-sm text-gray-600">Flesch Reading Ease Score</p>
                            </div>
                            <Button
                              onClick={() => handleCopyToClipboard(`Readability Score: ${statistics.fleischReadingEase} (${statistics.readabilityLevel})`)}
                              variant="outline"
                              size="sm"
                              className="text-xs px-2 sm:px-3 py-2 flex-shrink-0 rounded-lg"
                              data-testid="button-copy-readability"
                            >
                              Copy
                            </Button>
                          </div>
                          <div className="space-y-3">
                            <div className="flex justify-between text-sm">
                              <span>Score: {statistics.fleischReadingEase}</span>
                              <span className="font-medium">{statistics.readabilityLevel}</span>
                            </div>
                            <Progress 
                              value={Math.max(0, Math.min(100, statistics.fleischReadingEase))} 
                              className="h-3" 
                            />
                          </div>
                        </div>
                      )}

                      {/* Advanced Metrics */}
                      {analysisOptions.includeAdvancedMetrics && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                          <div className="bg-white border-2 border-cyan-200 rounded-xl p-4">
                            <h3 className="text-base font-semibold text-gray-900 mb-3">Text Complexity</h3>
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span>Avg words per sentence</span>
                                <span className="font-bold">{statistics.averageWordsPerSentence}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Avg characters per word</span>
                                <span className="font-bold">{statistics.averageCharactersPerWord}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Avg syllables per word</span>
                                <span className="font-bold">{statistics.averageSyllablesPerWord}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Lexical diversity</span>
                                <span className="font-bold">{statistics.lexicalDiversity}%</span>
                              </div>
                            </div>
                          </div>

                          <div className="bg-white border-2 border-emerald-200 rounded-xl p-4">
                            <h3 className="text-base font-semibold text-gray-900 mb-3">Character Analysis</h3>
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span>Uppercase letters</span>
                                <span className="font-bold">{statistics.uppercaseLetters}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Lowercase letters</span>
                                <span className="font-bold">{statistics.lowercaseLetters}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Digits</span>
                                <span className="font-bold">{statistics.digits}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Punctuation marks</span>
                                <span className="font-bold">{statistics.punctuation}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Word Frequency */}
                      {analysisOptions.includeWordFrequency && statistics.mostFrequentWords.length > 0 && (
                        <div className="bg-white border-2 border-rose-200 rounded-xl p-4 sm:p-6">
                          <div className="flex items-start justify-between mb-4 gap-3">
                            <div className="flex-1 min-w-0">
                              <h3 className="text-base sm:text-lg font-semibold text-gray-900">Most Frequent Words</h3>
                              <p className="text-xs sm:text-sm text-gray-600">Top words by frequency</p>
                            </div>
                            <Button
                              onClick={() => handleCopyToClipboard(statistics.mostFrequentWords.map(w => `${w.word}: ${w.count}`).join(', '))}
                              variant="outline"
                              size="sm"
                              className="text-xs px-2 sm:px-3 py-2 flex-shrink-0 rounded-lg"
                              data-testid="button-copy-frequency"
                            >
                              Copy
                            </Button>
                          </div>
                          <div className="space-y-2">
                            {statistics.mostFrequentWords.slice(0, 8).map((item, index) => (
                              <div key={index} className="flex justify-between items-center">
                                <span className="text-sm font-medium text-gray-700">{item.word}</span>
                                <div className="flex items-center space-x-2">
                                  <span className="text-xs text-gray-500 w-12 text-right">{item.count}x</span>
                                  <Progress 
                                    value={item.percentage} 
                                    className="w-20 h-2" 
                                  />
                                  <span className="text-xs text-gray-500 w-10 text-right">{item.percentage.toFixed(1)}%</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Additional Details */}
                      <div className="bg-white border-2 border-violet-200 rounded-xl p-4">
                        <h3 className="text-base font-semibold text-gray-900 mb-3">Additional Details</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span>Lines</span>
                              <span className="font-bold">{statistics.lines}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Characters (no spaces)</span>
                              <span className="font-bold">{statistics.charactersNoSpaces.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Speaking time</span>
                              <span className="font-bold">{statistics.speakingTime} min</span>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span>Unique words</span>
                              <span className="font-bold">{statistics.uniqueWords}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Longest word</span>
                              <span className="font-bold text-xs">{statistics.longestWord}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Shortest word</span>
                              <span className="font-bold text-xs">{statistics.shortestWord}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12 sm:py-16" data-testid="no-results">
                      <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-200 rounded-full mx-auto mb-4 sm:mb-6 flex items-center justify-center">
                        <div className="text-2xl sm:text-3xl font-bold text-gray-400">ABC</div>
                      </div>
                      <p className="text-gray-500 text-base sm:text-lg px-4">Enter text to see comprehensive statistics and analysis</p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* SEO Content Sections */}
          <div className="mt-16 space-y-8">
            {/* What is Text Statistics Analysis */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">What is Text Statistics Analysis?</h2>
                <div className="space-y-4 text-gray-600">
                  <p>
                    <strong>Text statistics analysis</strong> is a comprehensive method of examining written content to understand its structure, complexity, and readability. Our advanced text analyzer provides detailed insights into various aspects of your writing, including word count, character analysis, sentence structure, vocabulary richness, and readability scores that help writers optimize their content for specific audiences and purposes.
                  </p>
                  <p>
                    Professional writers, students, content creators, and educators use text analysis tools to improve writing quality, ensure appropriate reading levels, and optimize content for better engagement. Our analyzer features real-time analysis, advanced linguistic metrics including Flesch Reading Ease scores, lexical diversity measurements, and comprehensive word frequency analysis.
                  </p>
                  <p>
                    The tool examines multiple dimensions including basic counts (words, characters, sentences), advanced metrics (syllable analysis, vocabulary complexity), readability assessments, and detailed linguistic patterns. This comprehensive approach helps users understand how their writing will be perceived by readers and provides actionable insights for improvement.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Features and Metrics Guide */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
                <CardContent className="p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Core Analysis Features</h2>
                  <div className="space-y-4">
                    <div className="bg-blue-50 rounded-lg p-4">
                      <h3 className="font-semibold text-blue-900 mb-2">Basic Text Statistics</h3>
                      <p className="text-blue-800 text-sm mb-2">Word count, character count, sentence count, and paragraph analysis</p>
                      <p className="text-blue-700 text-xs">Essential metrics for content planning, academic requirements, and publishing guidelines. Track text length for social media, articles, and professional documents.</p>
                    </div>
                    
                    <div className="bg-green-50 rounded-lg p-4">
                      <h3 className="font-semibold text-green-900 mb-2">Readability Assessment</h3>
                      <p className="text-green-800 text-sm mb-2">Flesch Reading Ease score and readability level classification</p>
                      <p className="text-green-700 text-xs">Evaluate how easily your audience can read and understand your content. Optimize for specific reading levels from elementary to college graduate.</p>
                    </div>
                    
                    <div className="bg-purple-50 rounded-lg p-4">
                      <h3 className="font-semibold text-purple-900 mb-2">Vocabulary Analysis</h3>
                      <p className="text-purple-800 text-sm mb-2">Lexical diversity, unique word count, and vocabulary richness metrics</p>
                      <p className="text-purple-700 text-xs">Measure the variety and sophistication of your vocabulary usage. Improve writing diversity and avoid repetitive language patterns.</p>
                    </div>
                    
                    <div className="bg-orange-50 rounded-lg p-4">
                      <h3 className="font-semibold text-orange-900 mb-2">Word Frequency Analysis</h3>
                      <p className="text-orange-800 text-sm mb-2">Most frequently used words with percentage breakdowns</p>
                      <p className="text-orange-700 text-xs">Identify overused words, optimize keyword density for SEO, and ensure balanced vocabulary distribution throughout your content.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
                <CardContent className="p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Advanced Linguistic Metrics</h2>
                  <div className="space-y-4">
                    <div className="bg-indigo-50 rounded-lg p-4">
                      <h3 className="font-semibold text-indigo-900 mb-2">Sentence Structure Analysis</h3>
                      <p className="text-indigo-800 text-sm mb-2">Average words per sentence and sentence complexity assessment</p>
                      <p className="text-indigo-700 text-xs">Analyze sentence length variation for better flow and readability. Balance short and long sentences for engaging content.</p>
                    </div>
                    
                    <div className="bg-teal-50 rounded-lg p-4">
                      <h3 className="font-semibold text-teal-900 mb-2">Character Type Breakdown</h3>
                      <p className="text-teal-800 text-sm mb-2">Uppercase, lowercase, digits, punctuation, and special character counts</p>
                      <p className="text-teal-700 text-xs">Understand text composition for formatting consistency, data validation, and content structure optimization.</p>
                    </div>
                    
                    <div className="bg-red-50 rounded-lg p-4">
                      <h3 className="font-semibold text-red-900 mb-2">Reading Time Estimation</h3>
                      <p className="text-red-800 text-sm mb-2">Estimated reading and speaking time based on average speeds</p>
                      <p className="text-red-700 text-xs">Plan content length for presentations, blog posts, and articles. Optimize for audience attention spans and engagement goals.</p>
                    </div>
                    
                    <div className="bg-yellow-50 rounded-lg p-4">
                      <h3 className="font-semibold text-yellow-900 mb-2">Syllable Analysis</h3>
                      <p className="text-yellow-800 text-sm mb-2">Average syllables per word for complexity measurement</p>
                      <p className="text-yellow-700 text-xs">Assess word complexity and phonetic density. Crucial for readability scores and language learning applications.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Professional Applications */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Professional Applications & Use Cases</h2>
                <p className="text-gray-600 mb-8">Text statistics analysis serves diverse professional needs across multiple industries and academic disciplines. Understanding these metrics helps optimize communication effectiveness and content performance.</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center mb-3">
                      <div className="w-8 h-8 bg-blue-500 rounded flex items-center justify-center mr-3">
                        <span className="text-white font-bold text-sm">EDU</span>
                      </div>
                      <h3 className="font-semibold text-gray-900">Academic Writing</h3>
                    </div>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li><strong>Essay Analysis:</strong> Meet word count requirements</li>
                      <li><strong>Research Papers:</strong> Optimize readability levels</li>
                      <li><strong>Thesis Writing:</strong> Maintain consistent complexity</li>
                      <li><strong>Grant Proposals:</strong> Ensure clarity and precision</li>
                    </ul>
                  </div>

                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center mb-3">
                      <div className="w-8 h-8 bg-green-500 rounded flex items-center justify-center mr-3">
                        <span className="text-white font-bold text-sm">MKT</span>
                      </div>
                      <h3 className="font-semibold text-gray-900">Content Marketing</h3>
                    </div>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li><strong>Blog Posts:</strong> Optimize for SEO and engagement</li>
                      <li><strong>Social Media:</strong> Match platform character limits</li>
                      <li><strong>Email Campaigns:</strong> Improve open rates</li>
                      <li><strong>Web Copy:</strong> Enhance conversion rates</li>
                    </ul>
                  </div>

                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center mb-3">
                      <div className="w-8 h-8 bg-purple-500 rounded flex items-center justify-center mr-3">
                        <span className="text-white font-bold text-sm">PUB</span>
                      </div>
                      <h3 className="font-semibold text-gray-900">Publishing & Media</h3>
                    </div>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li><strong>Book Manuscripts:</strong> Analyze genre conventions</li>
                      <li><strong>Journalism:</strong> Meet publication standards</li>
                      <li><strong>Technical Writing:</strong> Ensure clarity</li>
                      <li><strong>Creative Writing:</strong> Develop unique voice</li>
                    </ul>
                  </div>

                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center mb-3">
                      <div className="w-8 h-8 bg-orange-500 rounded flex items-center justify-center mr-3">
                        <span className="text-white font-bold text-sm">BUS</span>
                      </div>
                      <h3 className="font-semibold text-gray-900">Business Communication</h3>
                    </div>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li><strong>Reports:</strong> Professional presentation</li>
                      <li><strong>Proposals:</strong> Persuasive clarity</li>
                      <li><strong>Documentation:</strong> User comprehension</li>
                      <li><strong>Training Materials:</strong> Appropriate complexity</li>
                    </ul>
                  </div>

                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center mb-3">
                      <div className="w-8 h-8 bg-red-500 rounded flex items-center justify-center mr-3">
                        <span className="text-white font-bold text-sm">UX</span>
                      </div>
                      <h3 className="font-semibold text-gray-900">UX Writing</h3>
                    </div>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li><strong>Interface Copy:</strong> Concise and clear</li>
                      <li><strong>Help Documentation:</strong> User-friendly language</li>
                      <li><strong>Error Messages:</strong> Helpful and brief</li>
                      <li><strong>Onboarding:</strong> Progressive complexity</li>
                    </ul>
                  </div>

                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center mb-3">
                      <div className="w-8 h-8 bg-teal-500 rounded flex items-center justify-center mr-3">
                        <span className="text-white font-bold text-sm">SEO</span>
                      </div>
                      <h3 className="font-semibold text-gray-900">SEO Optimization</h3>
                    </div>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li><strong>Keyword Density:</strong> Optimize word frequency</li>
                      <li><strong>Content Length:</strong> Meet search requirements</li>
                      <li><strong>Readability:</strong> Improve user experience</li>
                      <li><strong>Meta Descriptions:</strong> Character count limits</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Readability Scores Explained */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
                <CardContent className="p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Understanding Readability Scores</h2>
                  <div className="space-y-4">
                    <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-4">
                      <h3 className="font-semibold text-gray-900 mb-2">Flesch Reading Ease Scale</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between border-b border-gray-200 pb-1">
                          <span className="font-medium">90-100: Very Easy</span>
                          <span className="text-gray-600">5th grade level</span>
                        </div>
                        <div className="flex justify-between border-b border-gray-200 pb-1">
                          <span className="font-medium">80-89: Easy</span>
                          <span className="text-gray-600">6th grade level</span>
                        </div>
                        <div className="flex justify-between border-b border-gray-200 pb-1">
                          <span className="font-medium">70-79: Fairly Easy</span>
                          <span className="text-gray-600">7th grade level</span>
                        </div>
                        <div className="flex justify-between border-b border-gray-200 pb-1">
                          <span className="font-medium">60-69: Standard</span>
                          <span className="text-gray-600">8th-9th grade</span>
                        </div>
                        <div className="flex justify-between border-b border-gray-200 pb-1">
                          <span className="font-medium">50-59: Fairly Difficult</span>
                          <span className="text-gray-600">10th-12th grade</span>
                        </div>
                        <div className="flex justify-between border-b border-gray-200 pb-1">
                          <span className="font-medium">30-49: Difficult</span>
                          <span className="text-gray-600">College level</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium">0-29: Very Difficult</span>
                          <span className="text-gray-600">Graduate level</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-yellow-50 rounded-lg p-4">
                      <h4 className="font-semibold text-yellow-900 mb-2">Readability Formula</h4>
                      <p className="text-yellow-800 text-sm mb-2">206.835 - (1.015 × ASL) - (84.6 × ASW)</p>
                      <p className="text-yellow-700 text-xs">
                        <strong>ASL:</strong> Average Sentence Length (words per sentence)<br/>
                        <strong>ASW:</strong> Average Syllables per Word
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
                <CardContent className="p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Optimization Best Practices</h2>
                  <div className="space-y-4">
                    <div className="bg-blue-50 border-l-4 border-blue-400 p-3 rounded-r-lg">
                      <h4 className="font-semibold text-blue-900 text-sm">Sentence Length Optimization</h4>
                      <p className="text-blue-800 text-xs mt-1">Vary sentence lengths between 15-20 words for optimal readability. Mix short impactful sentences with longer descriptive ones.</p>
                    </div>
                    
                    <div className="bg-green-50 border-l-4 border-green-400 p-3 rounded-r-lg">
                      <h4 className="font-semibold text-green-900 text-sm">Vocabulary Selection</h4>
                      <p className="text-green-800 text-xs mt-1">Choose simple, common words over complex alternatives when possible. Reserve technical terms for specialized audiences.</p>
                    </div>
                    
                    <div className="bg-purple-50 border-l-4 border-purple-400 p-3 rounded-r-lg">
                      <h4 className="font-semibold text-purple-900 text-sm">Paragraph Structure</h4>
                      <p className="text-purple-800 text-xs mt-1">Keep paragraphs between 3-5 sentences. Use topic sentences and clear transitions for better flow.</p>
                    </div>
                    
                    <div className="bg-orange-50 border-l-4 border-orange-400 p-3 rounded-r-lg">
                      <h4 className="font-semibold text-orange-900 text-sm">Word Frequency Balance</h4>
                      <p className="text-orange-800 text-xs mt-1">Monitor keyword density for SEO (1-3%) while avoiding over-repetition that hurts readability and user experience.</p>
                    </div>
                    
                    <div className="bg-teal-50 border-l-4 border-teal-400 p-3 rounded-r-lg">
                      <h4 className="font-semibold text-teal-900 text-sm">Target Audience Matching</h4>
                      <p className="text-teal-800 text-xs mt-1">Adjust complexity to audience: 8th grade for general web content, higher levels for professional or academic writing.</p>
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
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">How accurate are the readability scores?</h3>
                      <p className="text-gray-600 text-sm">Our Flesch Reading Ease scores use the standard formula adopted by educational institutions and publishers worldwide. While no formula is perfect, it provides reliable estimates based on sentence length and syllable complexity that correlate strongly with human comprehension studies.</p>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">What's considered good lexical diversity?</h3>
                      <p className="text-gray-600 text-sm">Lexical diversity scores above 50% indicate rich vocabulary usage. Creative writing typically ranges 60-80%, while technical writing may be lower (30-50%) due to specialized terminology repetition. Higher diversity generally improves reader engagement.</p>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">How does word frequency analysis help with SEO?</h3>
                      <p className="text-gray-600 text-sm">Word frequency analysis helps identify keyword density for search engine optimization. Ideal keyword density is 1-3% for primary keywords. The tool helps avoid keyword stuffing while ensuring adequate coverage of important terms for search rankings.</p>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Is the tool suitable for non-English content?</h3>
                      <p className="text-gray-600 text-sm">The basic counting features work with any language using standard characters. However, readability scores and syllable counting are optimized for English. Word frequency analysis works universally for character-based languages.</p>
                    </div>
                  </div>
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">What reading time calculation method is used?</h3>
                      <p className="text-gray-600 text-sm">Reading time estimates use 200 words per minute for average silent reading and 130 words per minute for speaking. These are standard rates used by content platforms and educational assessments, though individual speeds vary significantly.</p>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">How should I interpret syllable per word averages?</h3>
                      <p className="text-gray-600 text-sm">English averages 1.3-1.5 syllables per word. Higher averages (>1.7) suggest complex vocabulary that may challenge readers. Lower averages (<1.2) indicate simple language suitable for broad audiences or early readers.</p>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Can I use this tool for academic plagiarism detection?</h3>
                      <p className="text-gray-600 text-sm">This tool analyzes writing style and complexity but doesn't detect plagiarism. It can help identify unusual patterns in your own writing or compare stylistic consistency across documents, but dedicated plagiarism checkers are needed for content originality verification.</p>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">What's the optimal sentence length for web content?</h3>
                      <p className="text-gray-600 text-sm">Web content performs best with average sentence lengths of 15-20 words. Sentences over 25 words can reduce comprehension, while too many short sentences create choppy reading. Vary lengths for natural rhythm and engagement.</p>
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

export default TextStatisticsAnalyzer;
