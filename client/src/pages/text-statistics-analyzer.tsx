
import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';

interface TextStatistics {
  // Basic counts
  characters: number;
  charactersNoSpaces: number;
  words: number;
  sentences: number;
  paragraphs: number;
  lines: number;
  
  // Advanced metrics
  averageWordsPerSentence: number;
  averageCharactersPerWord: number;
  averageSentencesPerParagraph: number;
  
  // Reading metrics
  readingTimeMinutes: number;
  speakingTimeMinutes: number;
  
  // Readability scores
  fleschReadingEase: number;
  fleschKincaidGrade: number;
  
  // Content analysis
  uniqueWords: number;
  wordDensity: { [word: string]: number };
  topWords: Array<{ word: string; count: number; percentage: number }>;
  
  // Text complexity
  complexWords: number;
  shortSentences: number;
  longSentences: number;
  
  // Language patterns
  questionMarks: number;
  exclamationMarks: number;
  upperCaseWords: number;
  numbersCount: number;
}

export default function TextStatisticsAnalyzer() {
  const [text, setText] = useState('');
  const [stats, setStats] = useState<TextStatistics | null>(null);

  const calculateTextStatistics = (inputText: string): TextStatistics => {
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
        averageSentencesPerParagraph: 0,
        readingTimeMinutes: 0,
        speakingTimeMinutes: 0,
        fleschReadingEase: 0,
        fleschKincaidGrade: 0,
        uniqueWords: 0,
        wordDensity: {},
        topWords: [],
        complexWords: 0,
        shortSentences: 0,
        longSentences: 0,
        questionMarks: 0,
        exclamationMarks: 0,
        upperCaseWords: 0,
        numbersCount: 0
      };
    }

    // Basic counts
    const characters = inputText.length;
    const charactersNoSpaces = inputText.replace(/\s/g, '').length;
    const lines = inputText.split('\n').length;
    
    // Words analysis
    const words = inputText.trim().split(/\s+/).filter(word => word.length > 0);
    const wordCount = words.length;
    const cleanWords = words.map(word => word.toLowerCase().replace(/[^\w]/g, ''));
    const uniqueWordsSet = new Set(cleanWords.filter(word => word.length > 0));
    const uniqueWords = uniqueWordsSet.size;
    
    // Sentences analysis
    const sentences = inputText.split(/[.!?]+/).filter(sentence => sentence.trim().length > 0);
    const sentenceCount = sentences.length;
    
    // Paragraphs analysis
    const paragraphs = inputText.split(/\n\s*\n/).filter(paragraph => paragraph.trim().length > 0);
    const paragraphCount = paragraphs.length;
    
    // Average calculations
    const averageWordsPerSentence = sentenceCount > 0 ? wordCount / sentenceCount : 0;
    const averageCharactersPerWord = wordCount > 0 ? charactersNoSpaces / wordCount : 0;
    const averageSentencesPerParagraph = paragraphCount > 0 ? sentenceCount / paragraphCount : 0;
    
    // Reading time (average 200 words per minute)
    const readingTimeMinutes = wordCount / 200;
    // Speaking time (average 150 words per minute)
    const speakingTimeMinutes = wordCount / 150;
    
    // Word frequency analysis
    const wordFrequency: { [word: string]: number } = {};
    cleanWords.forEach(word => {
      if (word.length > 0) {
        wordFrequency[word] = (wordFrequency[word] || 0) + 1;
      }
    });
    
    // Calculate word density and top words
    const wordDensity: { [word: string]: number } = {};
    const topWords: Array<{ word: string; count: number; percentage: number }> = [];
    
    Object.entries(wordFrequency)
      .filter(([word]) => word.length > 2) // Filter out very short words
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .forEach(([word, count]) => {
        const percentage = (count / wordCount) * 100;
        wordDensity[word] = percentage;
        topWords.push({ word, count, percentage });
      });
    
    // Complex words (3+ syllables - simplified estimation)
    const complexWords = words.filter(word => {
      const syllableCount = word.toLowerCase().replace(/[^aeiou]/g, '').length;
      return syllableCount >= 3;
    }).length;
    
    // Sentence length analysis
    const shortSentences = sentences.filter(sentence => {
      const sentenceWords = sentence.trim().split(/\s+/).length;
      return sentenceWords <= 10;
    }).length;
    
    const longSentences = sentences.filter(sentence => {
      const sentenceWords = sentence.trim().split(/\s+/).length;
      return sentenceWords >= 20;
    }).length;
    
    // Language pattern analysis
    const questionMarks = (inputText.match(/\?/g) || []).length;
    const exclamationMarks = (inputText.match(/!/g) || []).length;
    const upperCaseWords = words.filter(word => 
      word === word.toUpperCase() && word.length > 1 && /[A-Z]/.test(word)
    ).length;
    const numbersCount = (inputText.match(/\d+/g) || []).length;
    
    // Flesch Reading Ease Score
    // Formula: 206.835 - (1.015 × ASL) - (84.6 × ASW)
    // ASL = Average Sentence Length, ASW = Average Syllables per Word
    const averageSyllablesPerWord = words.reduce((sum, word) => {
      const syllables = Math.max(1, word.toLowerCase().replace(/[^aeiou]/g, '').length);
      return sum + syllables;
    }, 0) / wordCount;
    
    const fleschReadingEase = Math.max(0, Math.min(100,
      206.835 - (1.015 * averageWordsPerSentence) - (84.6 * averageSyllablesPerWord)
    ));
    
    // Flesch-Kincaid Grade Level
    // Formula: (0.39 × ASL) + (11.8 × ASW) - 15.59
    const fleschKincaidGrade = Math.max(0,
      (0.39 * averageWordsPerSentence) + (11.8 * averageSyllablesPerWord) - 15.59
    );
    
    return {
      characters,
      charactersNoSpaces,
      words: wordCount,
      sentences: sentenceCount,
      paragraphs: paragraphCount,
      lines,
      averageWordsPerSentence,
      averageCharactersPerWord,
      averageSentencesPerParagraph,
      readingTimeMinutes,
      speakingTimeMinutes,
      fleschReadingEase,
      fleschKincaidGrade,
      uniqueWords,
      wordDensity,
      topWords,
      complexWords,
      shortSentences,
      longSentences,
      questionMarks,
      exclamationMarks,
      upperCaseWords,
      numbersCount
    };
  };

  // Real-time analysis
  useEffect(() => {
    const statistics = calculateTextStatistics(text);
    setStats(statistics);
  }, [text]);

  const handleCopyStats = () => {
    if (stats) {
      const report = `Text Statistics Report:

Basic Statistics:
- Characters: ${stats.characters.toLocaleString()}
- Characters (no spaces): ${stats.charactersNoSpaces.toLocaleString()}
- Words: ${stats.words.toLocaleString()}
- Sentences: ${stats.sentences}
- Paragraphs: ${stats.paragraphs}
- Lines: ${stats.lines}

Readability:
- Flesch Reading Ease: ${stats.fleschReadingEase.toFixed(1)}
- Flesch-Kincaid Grade: ${stats.fleschKincaidGrade.toFixed(1)}
- Reading Time: ${Math.ceil(stats.readingTimeMinutes)} minutes
- Speaking Time: ${Math.ceil(stats.speakingTimeMinutes)} minutes

Averages:
- Words per sentence: ${stats.averageWordsPerSentence.toFixed(1)}
- Characters per word: ${stats.averageCharactersPerWord.toFixed(1)}
- Sentences per paragraph: ${stats.averageSentencesPerParagraph.toFixed(1)}

Content Analysis:
- Unique words: ${stats.uniqueWords.toLocaleString()}
- Complex words: ${stats.complexWords}
- Question marks: ${stats.questionMarks}
- Exclamation marks: ${stats.exclamationMarks}`;

      navigator.clipboard.writeText(report);
    }
  };

  const handleSampleText = () => {
    setText(`The art of effective communication lies in the ability to convey complex ideas clearly and concisely. In today's fast-paced world, readers have limited attention spans, making it crucial for writers to craft content that is both engaging and accessible.

Research shows that well-structured text with shorter sentences and familiar vocabulary significantly improves comprehension. However, this doesn't mean dumbing down content. Instead, it's about finding the perfect balance between sophistication and clarity.

Consider your audience when writing. Are they experts in the field, or are they newcomers seeking basic understanding? This fundamental question should guide every writing decision you make. Use active voice whenever possible, as it creates more direct and powerful statements.

Finally, remember that great writing is rewriting. The first draft is just the beginning. Through careful revision and editing, you can transform good content into exceptional communication that truly resonates with your readers.`);
  };

  const getReadabilityLevel = (score: number): { level: string; color: string; description: string } => {
    if (score >= 90) return { level: 'Very Easy', color: 'text-green-600', description: '5th grade level' };
    if (score >= 80) return { level: 'Easy', color: 'text-green-500', description: '6th grade level' };
    if (score >= 70) return { level: 'Fairly Easy', color: 'text-blue-600', description: '7th grade level' };
    if (score >= 60) return { level: 'Standard', color: 'text-blue-500', description: '8th-9th grade level' };
    if (score >= 50) return { level: 'Fairly Difficult', color: 'text-yellow-600', description: '10th-12th grade level' };
    if (score >= 30) return { level: 'Difficult', color: 'text-orange-600', description: 'College level' };
    return { level: 'Very Difficult', color: 'text-red-600', description: 'Graduate level' };
  };

  const formatTime = (minutes: number): string => {
    if (minutes < 1) return 'Less than 1 minute';
    if (minutes < 60) return `${Math.ceil(minutes)} minute${Math.ceil(minutes) > 1 ? 's' : ''}`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = Math.ceil(minutes % 60);
    return `${hours} hour${hours > 1 ? 's' : ''} ${remainingMinutes} minute${remainingMinutes > 1 ? 's' : ''}`;
  };

  const resultTypes = [
    { key: 'characters', label: 'Characters', getValue: () => stats?.characters.toLocaleString() || '0', color: 'bg-blue-50 border-blue-200' },
    { key: 'charactersNoSpaces', label: 'Characters (no spaces)', getValue: () => stats?.charactersNoSpaces.toLocaleString() || '0', color: 'bg-green-50 border-green-200' },
    { key: 'words', label: 'Words', getValue: () => stats?.words.toLocaleString() || '0', color: 'bg-purple-50 border-purple-200' },
    { key: 'sentences', label: 'Sentences', getValue: () => stats?.sentences.toString() || '0', color: 'bg-orange-50 border-orange-200' },
    { key: 'paragraphs', label: 'Paragraphs', getValue: () => stats?.paragraphs.toString() || '0', color: 'bg-pink-50 border-pink-200' },
    { key: 'lines', label: 'Lines', getValue: () => stats?.lines.toString() || '0', color: 'bg-indigo-50 border-indigo-200' },
    { key: 'readingTime', label: 'Reading Time', getValue: () => formatTime(stats?.readingTimeMinutes || 0), color: 'bg-teal-50 border-teal-200' },
    { key: 'speakingTime', label: 'Speaking Time', getValue: () => formatTime(stats?.speakingTimeMinutes || 0), color: 'bg-red-50 border-red-200' },
    { key: 'fleschEase', label: 'Flesch Reading Ease', getValue: () => `${stats?.fleschReadingEase.toFixed(1) || '0'} (${getReadabilityLevel(stats?.fleschReadingEase || 0).level})`, color: 'bg-yellow-50 border-yellow-200' },
    { key: 'fleschGrade', label: 'Flesch-Kincaid Grade', getValue: () => `Grade ${stats?.fleschKincaidGrade.toFixed(1) || '0'}`, color: 'bg-cyan-50 border-cyan-200' },
    { key: 'avgWordsPerSentence', label: 'Average Words per Sentence', getValue: () => stats?.averageWordsPerSentence.toFixed(1) || '0', color: 'bg-emerald-50 border-emerald-200' },
    { key: 'avgCharsPerWord', label: 'Average Characters per Word', getValue: () => stats?.averageCharactersPerWord.toFixed(1) || '0', color: 'bg-rose-50 border-rose-200' }
  ];

  const resetCalculator = () => {
    setText('');
    setStats(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Helmet>
        <title>Text Statistics & Readability Analyzer - Free Text Analysis Tool | DapsiWow</title>
        <meta name="description" content="Free text statistics and readability analyzer. Analyze text complexity, get Flesch Reading Ease scores, word frequency, reading time estimates, and comprehensive text metrics for better writing." />
        <meta name="keywords" content="text statistics analyzer, readability checker, Flesch reading ease, text analysis tool, word frequency analysis, content readability, text complexity checker, writing analysis, text metrics" />
        <meta property="og:title" content="Text Statistics & Readability Analyzer - Free Text Analysis Tool" />
        <meta property="og:description" content="Comprehensive text analysis tool with readability scores, statistics, word frequency, and reading time estimates. Perfect for writers, content creators, and educators." />
        <meta property="og:type" content="website" />
        <meta name="robots" content="index, follow" />
        <meta name="author" content="DapsiWow" />
        <link rel="canonical" href="https://dapsiwow.com/tools/text-statistics-analyzer" />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            "name": "Text Statistics & Readability Analyzer",
            "description": "Free comprehensive text analysis tool with readability scores, statistics, and detailed text metrics for content optimization and writing improvement.",
            "url": "https://dapsiwow.com/tools/text-statistics-analyzer",
            "applicationCategory": "ProductivityApplication",
            "operatingSystem": "Any",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "USD"
            },
            "featureList": [
              "Text readability analysis",
              "Flesch Reading Ease scoring",
              "Word frequency analysis",
              "Reading time estimation",
              "Text complexity metrics",
              "Real-time text statistics"
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
                <span className="text-xs sm:text-sm font-medium text-blue-700">Advanced Text Analysis</span>
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-slate-900 leading-tight" data-testid="text-page-title">
                Text Statistics &
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                  Readability Analyzer
                </span>
              </h1>
              <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-slate-600 max-w-4xl mx-auto leading-relaxed px-2">
                Analyze text readability, get comprehensive statistics, and optimize content for your audience
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
                    <p className="text-gray-600">Enter your text to get detailed statistics and readability analysis</p>
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
                        className="min-h-[200px] sm:min-h-[250px] lg:min-h-[300px] text-base sm:text-lg border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-blue-500 resize-none"
                        placeholder="Paste or type your text here for comprehensive analysis including readability scores, statistics, and content metrics..."
                        data-testid="textarea-text-input"
                      />
                    </div>
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
                      onClick={handleCopyStats}
                      variant="outline"
                      className="h-12 sm:h-14 px-6 sm:px-8 border-2 border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold text-base sm:text-lg rounded-xl"
                      disabled={!stats || stats.words === 0}
                      data-testid="button-copy-stats"
                    >
                      Copy Report
                    </Button>
                    <Button
                      onClick={resetCalculator}
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
                  
                  {stats && stats.words > 0 ? (
                    <div className="space-y-3 sm:space-y-4" data-testid="statistics-results">
                      {resultTypes.map((type, index) => {
                        const value = type.getValue();
                        
                        return (
                          <div 
                            key={type.key} 
                            className={`border-2 rounded-xl p-3 sm:p-4 ${type.color}`}
                          >
                            <div className="flex items-start justify-between mb-3 gap-3">
                              <div className="flex-1 min-w-0">
                                <h3 className="text-sm sm:text-base font-semibold text-gray-900 truncate">{type.label}</h3>
                              </div>
                              <Button
                                onClick={() => navigator.clipboard.writeText(value)}
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
                              data-testid={`stat-${type.key}`}
                            >
                              {value}
                            </div>
                          </div>
                        );
                      })}

                      {/* Word Frequency Analysis */}
                      {stats.topWords.length > 0 && (
                        <div className="border-2 rounded-xl p-3 sm:p-4 bg-slate-50 border-slate-200">
                          <div className="flex items-start justify-between mb-3 gap-3">
                            <div className="flex-1 min-w-0">
                              <h3 className="text-sm sm:text-base font-semibold text-gray-900">Most Frequent Words</h3>
                            </div>
                          </div>
                          <div className="bg-white p-2 sm:p-3 rounded-lg border border-gray-200 min-h-[40px] sm:min-h-[44px]">
                            <div className="space-y-2">
                              {stats.topWords.slice(0, 5).map((wordInfo, index) => (
                                <div key={wordInfo.word} className="flex justify-between items-center text-xs sm:text-sm" data-testid={`top-word-${index}`}>
                                  <span className="font-medium text-gray-700">{wordInfo.word}</span>
                                  <div className="flex items-center gap-2">
                                    <span className="text-gray-500">{wordInfo.count}x</span>
                                    <span className="font-semibold text-blue-600">
                                      {wordInfo.percentage.toFixed(1)}%
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Readability Progress */}
                      {stats.fleschReadingEase > 0 && (
                        <div className="border-2 rounded-xl p-3 sm:p-4 bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
                          <div className="flex items-start justify-between mb-3 gap-3">
                            <div className="flex-1 min-w-0">
                              <h3 className="text-sm sm:text-base font-semibold text-gray-900">Readability Score</h3>
                            </div>
                          </div>
                          <div className="bg-white p-2 sm:p-3 rounded-lg border border-gray-200 min-h-[40px] sm:min-h-[44px]">
                            <div className="space-y-2">
                              <Progress value={stats.fleschReadingEase} className="h-3" />
                              <div className="flex justify-between text-xs sm:text-sm">
                                <span className={getReadabilityLevel(stats.fleschReadingEase).color}>
                                  {getReadabilityLevel(stats.fleschReadingEase).level}
                                </span>
                                <span className="text-gray-500">
                                  {getReadabilityLevel(stats.fleschReadingEase).description}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-12 sm:py-16" data-testid="no-statistics-results">
                      <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-200 rounded-full mx-auto mb-4 sm:mb-6 flex items-center justify-center">
                        <div className="text-2xl sm:text-3xl font-bold text-gray-400">📊</div>
                      </div>
                      <p className="text-gray-500 text-base sm:text-lg px-4">Enter text above to see detailed statistics and readability analysis</p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* SEO Content Sections */}
          <div className="mt-16 space-y-8">
            {/* What is Text Statistics & Readability Analyzer */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">What is a Text Statistics & Readability Analyzer?</h2>
                <div className="space-y-4 text-gray-600">
                  <p>
                    A text statistics and readability analyzer is a comprehensive tool that evaluates written content to provide detailed insights into text complexity, structure, and accessibility. This analysis helps writers, content creators, educators, and professionals optimize their text for specific audiences by measuring readability scores, word frequency, sentence structure, and various linguistic patterns that impact comprehension and engagement.
                  </p>
                  <p>
                    Our advanced analyzer uses proven readability formulas including Flesch Reading Ease and Flesch-Kincaid Grade Level calculations to scientifically assess text difficulty. The tool provides real-time analysis of character counts, word statistics, sentence composition, paragraph structure, and content complexity metrics, enabling users to make data-driven decisions about their writing style and content optimization strategies.
                  </p>
                  <p>
                    Perfect for content marketers optimizing for SEO, educators creating grade-appropriate materials, technical writers simplifying documentation, bloggers improving engagement, and anyone seeking to enhance their writing clarity and effectiveness. The analyzer helps transform complex content into accessible, reader-friendly text while maintaining professional quality and informational depth.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Understanding Readability Scores */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
                <CardContent className="p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Understanding Readability Metrics</h2>
                  <div className="space-y-4">
                    <div className="bg-blue-50 rounded-lg p-4">
                      <h3 className="font-semibold text-blue-900 mb-2">Flesch Reading Ease Score</h3>
                      <p className="text-blue-800 text-sm mb-3">Measures text difficulty on a 0-100 scale where higher scores indicate easier reading</p>
                      <div className="space-y-2 text-blue-700 text-xs">
                        <div className="flex justify-between"><span>90-100:</span><span className="font-semibold">Very Easy (5th grade)</span></div>
                        <div className="flex justify-between"><span>80-90:</span><span className="font-semibold">Easy (6th grade)</span></div>
                        <div className="flex justify-between"><span>70-80:</span><span className="font-semibold">Fairly Easy (7th grade)</span></div>
                        <div className="flex justify-between"><span>60-70:</span><span className="font-semibold">Standard (8th-9th grade)</span></div>
                        <div className="flex justify-between"><span>50-60:</span><span className="font-semibold">Fairly Difficult (10th-12th grade)</span></div>
                        <div className="flex justify-between"><span>30-50:</span><span className="font-semibold">Difficult (College level)</span></div>
                        <div className="flex justify-between"><span>0-30:</span><span className="font-semibold">Very Difficult (Graduate level)</span></div>
                      </div>
                    </div>
                    
                    <div className="bg-green-50 rounded-lg p-4">
                      <h3 className="font-semibold text-green-900 mb-2">Flesch-Kincaid Grade Level</h3>
                      <p className="text-green-800 text-sm mb-3">Indicates the U.S. grade level needed to understand the text</p>
                      <div className="space-y-1 text-green-700 text-xs">
                        <div>• <strong>Grade 1-6:</strong> Elementary school reading level</div>
                        <div>• <strong>Grade 7-9:</strong> Middle school reading level</div>
                        <div>• <strong>Grade 10-12:</strong> High school reading level</div>
                        <div>• <strong>Grade 13+:</strong> College and graduate level</div>
                      </div>
                    </div>

                    <div className="bg-purple-50 rounded-lg p-4">
                      <h3 className="font-semibold text-purple-900 mb-2">Reading Time Estimation</h3>
                      <p className="text-purple-800 text-sm">Calculated using average reading speed of 200 words per minute and speaking speed of 150 words per minute for content planning and presentation timing.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
                <CardContent className="p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Text Analysis Features</h2>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                        <span className="text-white text-xs font-bold">✓</span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-1">Real-Time Analysis</h4>
                        <p className="text-gray-600 text-sm">Instant text analysis as you type with immediate readability scoring and statistical calculations without delays.</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                        <span className="text-white text-xs font-bold">✓</span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-1">Word Frequency Analysis</h4>
                        <p className="text-gray-600 text-sm">Identify overused terms, vocabulary diversity, and keyword density patterns to optimize content for better engagement.</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                        <span className="text-white text-xs font-bold">✓</span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-1">Comprehensive Statistics</h4>
                        <p className="text-gray-600 text-sm">Character counts, word analysis, sentence structure, paragraph organization, and content complexity metrics.</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                        <span className="text-white text-xs font-bold">✓</span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-1">Export & Reporting</h4>
                        <p className="text-gray-600 text-sm">Generate comprehensive analysis reports with all metrics and recommendations for professional documentation.</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-teal-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                        <span className="text-white text-xs font-bold">✓</span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-1">Privacy Protection</h4>
                        <p className="text-gray-600 text-sm">All analysis happens locally in your browser - no data transmitted to servers, ensuring complete content privacy.</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Professional Applications */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Professional Applications & Use Cases</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
                    <h3 className="font-bold text-blue-800 mb-4 text-lg">Content Marketing & SEO</h3>
                    <ul className="space-y-2 text-blue-700 text-sm">
                      <li>• Optimize content readability for target audiences</li>
                      <li>• Improve search engine rankings with accessible content</li>
                      <li>• Analyze competitor content complexity</li>
                      <li>• Create audience-appropriate blog posts</li>
                      <li>• Optimize meta descriptions and marketing copy</li>
                      <li>• Ensure consistent brand voice across campaigns</li>
                    </ul>
                  </div>

                  <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-xl p-6 border border-green-200">
                    <h3 className="font-bold text-green-800 mb-4 text-lg">Education & Academic Writing</h3>
                    <ul className="space-y-2 text-green-700 text-sm">
                      <li>• Create grade-appropriate learning materials</li>
                      <li>• Assess student writing complexity</li>
                      <li>• Develop reading comprehension exercises</li>
                      <li>• Ensure curriculum accessibility for diverse learners</li>
                      <li>• Analyze research papers for publication</li>
                      <li>• Create standardized assessment materials</li>
                    </ul>
                  </div>

                  <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl p-6 border border-purple-200">
                    <h3 className="font-bold text-purple-800 mb-4 text-lg">Technical & Business Writing</h3>
                    <ul className="space-y-2 text-purple-700 text-sm">
                      <li>• Simplify technical documentation</li>
                      <li>• Create user-friendly software guides</li>
                      <li>• Optimize help content for clarity</li>
                      <li>• Ensure regulatory compliance documentation</li>
                      <li>• Improve internal communication effectiveness</li>
                      <li>• Analyze legal documents for accessibility</li>
                    </ul>
                  </div>

                  <div className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-xl p-6 border border-orange-200">
                    <h3 className="font-bold text-orange-800 mb-4 text-lg">Healthcare & Medical Writing</h3>
                    <ul className="space-y-2 text-orange-700 text-sm">
                      <li>• Create patient-friendly medical information</li>
                      <li>• Simplify informed consent documents</li>
                      <li>• Improve healthcare communication</li>
                      <li>• Analyze medical research for public understanding</li>
                      <li>• Develop health education materials</li>
                      <li>• Optimize pharmaceutical information</li>
                    </ul>
                  </div>

                  <div className="bg-gradient-to-r from-teal-50 to-teal-100 rounded-xl p-6 border border-teal-200">
                    <h3 className="font-bold text-teal-800 mb-4 text-lg">Publishing & Journalism</h3>
                    <ul className="space-y-2 text-teal-700 text-sm">
                      <li>• Match content complexity to publication standards</li>
                      <li>• Ensure news accessibility for broad audiences</li>
                      <li>• Optimize headlines and summaries</li>
                      <li>• Analyze editorial content for consistency</li>
                      <li>• Develop style guides based on readability</li>
                      <li>• Create targeted content strategies</li>
                    </ul>
                  </div>

                  <div className="bg-gradient-to-r from-red-50 to-red-100 rounded-xl p-6 border border-red-200">
                    <h3 className="font-bold text-red-800 mb-4 text-lg">Research & Analysis</h3>
                    <ul className="space-y-2 text-red-700 text-sm">
                      <li>• Analyze text complexity trends</li>
                      <li>• Study language patterns in demographics</li>
                      <li>• Evaluate readability across disciplines</li>
                      <li>• Compare writing styles and metrics</li>
                      <li>• Research content effectiveness</li>
                      <li>• Analyze qualitative survey data</li>
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
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">How accurate are the readability scores?</h3>
                      <p className="text-gray-600 text-sm">Our analyzer uses standard Flesch Reading Ease and Flesch-Kincaid formulas that are widely accepted in academic and professional settings. These formulas have been validated through extensive research and are used by major organizations for content assessment.</p>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">What's the ideal readability score for my content?</h3>
                      <p className="text-gray-600 text-sm">For general web content and marketing materials, aim for 60-70 (8th-9th grade level). Academic papers may require 30-50 (college level), while children's content should score 80+ (6th grade or easier). Consider your audience's education level and reading context.</p>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Can I analyze content in languages other than English?</h3>
                      <p className="text-gray-600 text-sm">While the tool works with any text input, the readability formulas were designed for English language patterns. Basic statistics like word count and character analysis work for all languages, but readability scores are most reliable for English text.</p>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">How does word frequency analysis help improve writing?</h3>
                      <p className="text-gray-600 text-sm">Word frequency analysis identifies overused terms that might make content repetitive. It helps ensure balanced keyword usage for SEO while maintaining natural language flow and vocabulary diversity for better reader engagement.</p>
                    </div>
                  </div>
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Is my text data secure and private?</h3>
                      <p className="text-gray-600 text-sm">Absolutely. All text analysis happens entirely in your browser using JavaScript. No content is transmitted to servers or stored anywhere. Your text never leaves your device, ensuring complete privacy for sensitive documents.</p>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">What file types can I analyze?</h3>
                      <p className="text-gray-600 text-sm">The tool accepts plain text through copy and paste. You can analyze content from Word documents, Google Docs, emails, web pages, PDFs, and any other text source by copying and pasting into the analysis area.</p>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">How should I interpret reading time estimates?</h3>
                      <p className="text-gray-600 text-sm">Reading time is calculated using average reading speed of 200 words per minute, while speaking time uses 150 words per minute. These estimates help with content planning, presentation timing, and user experience optimization.</p>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Can I use this tool for SEO content optimization?</h3>
                      <p className="text-gray-600 text-sm">Yes! Readable content typically performs better in search rankings. Use readability scores to ensure accessibility, word frequency for keyword optimization, and reading time estimates for content planning and user engagement improvement.</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Related Tools */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Related Text Analysis Tools</h2>
                <p className="text-gray-600 mb-8">Enhance your writing analysis workflow with our comprehensive suite of text tools designed for content creators, writers, and digital marketers.</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
                    <h3 className="font-semibold text-blue-900 mb-2">
                      <a href="/tools/word-counter" className="text-blue-600 hover:text-blue-800 transition-colors">Word Counter</a>
                    </h3>
                    <p className="text-blue-700 text-sm">Count words, characters, sentences, and paragraphs with detailed text statistics for content planning.</p>
                  </div>

                  <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
                    <h3 className="font-semibold text-green-900 mb-2">
                      <a href="/tools/character-counter" className="text-green-600 hover:text-green-800 transition-colors">Character Counter</a>
                    </h3>
                    <p className="text-green-700 text-sm">Precise character counting for social media posts, meta descriptions, and character-limited content.</p>
                  </div>

                  <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg p-4 border border-purple-200">
                    <h3 className="font-semibold text-purple-900 mb-2">
                      <a href="/tools/case-converter" className="text-purple-600 hover:text-purple-800 transition-colors">Case Converter</a>
                    </h3>
                    <p className="text-purple-700 text-sm">Transform text between uppercase, lowercase, title case, and other formatting styles.</p>
                  </div>

                  <div className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-lg p-4 border border-orange-200">
                    <h3 className="font-semibold text-orange-900 mb-2">
                      <a href="/tools/text-formatter-beautifier" className="text-orange-600 hover:text-orange-800 transition-colors">Text Formatter</a>
                    </h3>
                    <p className="text-orange-700 text-sm">Clean and beautify text by removing extra spaces, fixing punctuation, and standardizing formatting.</p>
                  </div>

                  <div className="bg-gradient-to-r from-teal-50 to-teal-100 rounded-lg p-4 border border-teal-200">
                    <h3 className="font-semibold text-teal-900 mb-2">
                      <a href="/tools/text-diff-checker" className="text-teal-600 hover:text-teal-800 transition-colors">Text Diff Checker</a>
                    </h3>
                    <p className="text-teal-700 text-sm">Compare two pieces of text side-by-side to identify differences and changes for content review.</p>
                  </div>

                  <div className="bg-gradient-to-r from-pink-50 to-pink-100 rounded-lg p-4 border border-pink-200">
                    <h3 className="font-semibold text-pink-900 mb-2">
                      <a href="/tools/sentence-counter" className="text-pink-600 hover:text-pink-800 transition-colors">Sentence Counter</a>
                    </h3>
                    <p className="text-pink-700 text-sm">Analyze sentence structure and count sentences for improved readability and text organization.</p>
                  </div>
                </div>

                <div className="mt-8 text-center">
                  <a
                    href="/text"
                    className="inline-flex items-center bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
                  >
                    Explore All Text Tools
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
}
