import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';

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

  const handleClear = () => {
    setText('');
  };

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Helmet>
        <title>Text Statistics & Readability Analyzer - Advanced Text Analysis & Metrics | DapsiWow</title>
        <meta name="description" content="Free online text statistics and readability analyzer tool. Get comprehensive text metrics, readability scores, reading time, word frequency, and detailed content analysis with Flesch-Kincaid scoring." />
        <meta name="keywords" content="text statistics, readability analyzer, Flesch reading ease, Flesch-Kincaid grade, text metrics, reading time calculator, word frequency analysis, content analysis, text complexity, readability score" />
        <meta property="og:title" content="Text Statistics & Readability Analyzer - Advanced Text Analysis & Metrics" />
        <meta property="og:description" content="Professional text statistics and readability analysis tool with comprehensive metrics, reading time estimation, and advanced content analysis features." />
        <meta property="og:type" content="website" />
        <meta name="robots" content="index, follow" />
        <meta name="author" content="DapsiWow" />
        <link rel="canonical" href="https://dapsiwow.com/tools/text-statistics-analyzer" />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            "name": "Text Statistics & Readability Analyzer",
            "description": "Free online tool for comprehensive text analysis including readability scores, statistics, reading time estimation, and content metrics with professional reporting.",
            "url": "https://dapsiwow.com/tools/text-statistics-analyzer",
            "applicationCategory": "ProductivityApplication",
            "operatingSystem": "Any",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "USD"
            },
            "featureList": [
              "Comprehensive text statistics",
              "Flesch Reading Ease scoring",
              "Flesch-Kincaid Grade Level",
              "Reading and speaking time estimation",
              "Word frequency analysis",
              "Content complexity metrics",
              "Readability assessment",
              "Professional reporting"
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
                <span className="text-sm font-medium text-blue-700">Advanced Text Analysis</span>
              </div>
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-slate-900 leading-tight">
                Text Statistics &
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                  Readability
                </span>
              </h1>
              <p className="text-xl sm:text-2xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
                Analyze text readability, get comprehensive statistics, and optimize content for your target audience
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
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">Text Analysis</h2>
                    <p className="text-gray-600">Enter your text to get detailed statistics and readability analysis</p>
                  </div>

                  {/* Text Area */}
                  <div className="space-y-4">
                    <Label htmlFor="text-input" className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                      Text to Analyze
                    </Label>
                    <Textarea
                      id="text-input"
                      value={text}
                      onChange={(e) => setText(e.target.value)}
                      className="min-h-[400px] lg:min-h-[500px] text-base border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-blue-500 resize-none"
                      placeholder="Paste or type your text here for comprehensive analysis including readability scores, statistics, and content metrics..."
                      data-testid="textarea-text-input"
                    />
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-4 pt-6">
                    <Button
                      onClick={handleSampleText}
                      className="flex-1 h-14 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold text-lg rounded-xl shadow-lg transform transition-all duration-200 hover:scale-105"
                      data-testid="button-sample-text"
                    >
                      Load Sample Text
                    </Button>
                    <Button
                      onClick={handleCopyStats}
                      variant="outline"
                      className="h-14 px-8 border-2 border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold text-lg rounded-xl"
                      disabled={!stats || stats.words === 0}
                      data-testid="button-copy-stats"
                    >
                      Copy Report
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
                  <h2 className="text-2xl font-bold text-gray-900 mb-8">Analysis Results</h2>

                  {stats && stats.words > 0 ? (
                    <div className="space-y-6" data-testid="statistics-results">
                      {/* Basic Statistics */}
                      <div className="bg-white rounded-xl p-6 shadow-sm">
                        <h3 className="font-bold text-gray-800 mb-4 text-lg">Basic Statistics</h3>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600">Characters:</span>
                            <span className="font-semibold text-blue-600" data-testid="stat-characters">
                              {stats.characters.toLocaleString()}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600">Characters (no spaces):</span>
                            <span className="font-semibold text-purple-600" data-testid="stat-characters-no-spaces">
                              {stats.charactersNoSpaces.toLocaleString()}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600">Words:</span>
                            <span className="font-semibold text-green-600" data-testid="stat-words">
                              {stats.words.toLocaleString()}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600">Sentences:</span>
                            <span className="font-semibold text-orange-600" data-testid="stat-sentences">
                              {stats.sentences}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600">Paragraphs:</span>
                            <span className="font-semibold text-indigo-600" data-testid="stat-paragraphs">
                              {stats.paragraphs}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Readability Scores */}
                      <div className="bg-white rounded-xl p-6 shadow-sm">
                        <h3 className="font-bold text-gray-800 mb-4 text-lg">Readability Analysis</h3>
                        <div className="space-y-4">
                          <div>
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-gray-600">Flesch Reading Ease:</span>
                              <span className={`font-bold ${getReadabilityLevel(stats.fleschReadingEase).color}`} data-testid="stat-flesch-ease">
                                {stats.fleschReadingEase.toFixed(1)}
                              </span>
                            </div>
                            <Progress value={stats.fleschReadingEase} className="h-2 mb-2" />
                            <div className="flex justify-between text-sm">
                              <span className={getReadabilityLevel(stats.fleschReadingEase).color}>
                                {getReadabilityLevel(stats.fleschReadingEase).level}
                              </span>
                              <span className="text-gray-500">
                                {getReadabilityLevel(stats.fleschReadingEase).description}
                              </span>
                            </div>
                          </div>
                          
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600">Flesch-Kincaid Grade:</span>
                            <span className="font-semibold text-blue-600" data-testid="stat-flesch-grade">
                              {stats.fleschKincaidGrade.toFixed(1)}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Reading Time */}
                      <div className="bg-white rounded-xl p-6 shadow-sm">
                        <h3 className="font-bold text-gray-800 mb-4 text-lg">Time Estimates</h3>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600">Reading Time:</span>
                            <span className="font-semibold text-green-600" data-testid="stat-reading-time">
                              {formatTime(stats.readingTimeMinutes)}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600">Speaking Time:</span>
                            <span className="font-semibold text-blue-600" data-testid="stat-speaking-time">
                              {formatTime(stats.speakingTimeMinutes)}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Averages */}
                      <div className="bg-white rounded-xl p-6 shadow-sm">
                        <h3 className="font-bold text-gray-800 mb-4 text-lg">Averages</h3>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600">Words per sentence:</span>
                            <span className="font-semibold text-purple-600" data-testid="stat-avg-words-sentence">
                              {stats.averageWordsPerSentence.toFixed(1)}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600">Characters per word:</span>
                            <span className="font-semibold text-orange-600" data-testid="stat-avg-chars-word">
                              {stats.averageCharactersPerWord.toFixed(1)}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Top Words */}
                      {stats.topWords.length > 0 && (
                        <div className="bg-white rounded-xl p-6 shadow-sm">
                          <h3 className="font-bold text-gray-800 mb-4 text-lg">Most Frequent Words</h3>
                          <div className="space-y-2">
                            {stats.topWords.slice(0, 5).map((wordInfo, index) => (
                              <div key={wordInfo.word} className="flex justify-between items-center" data-testid={`top-word-${index}`}>
                                <span className="text-gray-700 font-medium">{wordInfo.word}</span>
                                <div className="flex items-center gap-2">
                                  <span className="text-sm text-gray-500">{wordInfo.count}x</span>
                                  <span className="text-sm font-semibold text-blue-600">
                                    {wordInfo.percentage.toFixed(1)}%
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Content Analysis */}
                      <div className="bg-white rounded-xl p-6 shadow-sm">
                        <h3 className="font-bold text-gray-800 mb-4 text-lg">Content Analysis</h3>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600">Unique words:</span>
                            <span className="font-semibold text-green-600" data-testid="stat-unique-words">
                              {stats.uniqueWords.toLocaleString()}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600">Complex words:</span>
                            <span className="font-semibold text-orange-600" data-testid="stat-complex-words">
                              {stats.complexWords}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600">Questions:</span>
                            <span className="font-semibold text-blue-600" data-testid="stat-questions">
                              {stats.questionMarks}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600">Exclamations:</span>
                            <span className="font-semibold text-red-600" data-testid="stat-exclamations">
                              {stats.exclamationMarks}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-16" data-testid="no-statistics-results">
                      <div className="w-20 h-20 bg-gray-200 rounded-full mx-auto mb-6 flex items-center justify-center">
                        <div className="text-3xl font-bold text-gray-400">📊</div>
                      </div>
                      <p className="text-gray-500 text-lg">Enter text above to see detailed statistics and readability analysis</p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Content Sections */}
          <div className="mt-16 space-y-12">
            {/* What is Text Statistics Analyzer */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-6">What is a Text Statistics & Readability Analyzer?</h2>
                <div className="prose max-w-none text-gray-700 space-y-4">
                  <p className="text-lg leading-relaxed">
                    A <strong>text statistics and readability analyzer</strong> is a comprehensive tool that evaluates
                    written content across multiple dimensions including readability scores, content complexity, word
                    frequency patterns, and detailed linguistic metrics. This advanced analysis helps writers, editors,
                    content creators, and researchers understand how accessible and effective their text is for target audiences.
                  </p>

                  <p className="leading-relaxed">
                    Our analyzer uses proven readability formulas including Flesch Reading Ease and Flesch-Kincaid Grade Level
                    to provide scientific assessments of text difficulty. Combined with comprehensive statistics on word count,
                    sentence structure, reading time estimates, and content patterns, it offers a complete picture of textual
                    effectiveness and accessibility for different reading levels and contexts.
                  </p>

                  <p className="leading-relaxed">
                    Perfect for content marketers optimizing for SEO, educators creating grade-appropriate materials,
                    technical writers simplifying complex concepts, and anyone seeking to improve their writing clarity
                    and impact. The analyzer provides actionable insights that help transform complex content into
                    accessible, engaging text that resonates with intended audiences.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Readability Scores Explained */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Understanding Readability Scores</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
                    <h3 className="font-bold text-blue-800 mb-4 text-lg">Flesch Reading Ease Scale</h3>
                    <div className="space-y-3 text-blue-700 text-sm">
                      <div className="flex justify-between"><span>90-100:</span><span className="font-semibold">Very Easy (5th grade)</span></div>
                      <div className="flex justify-between"><span>80-90:</span><span className="font-semibold">Easy (6th grade)</span></div>
                      <div className="flex justify-between"><span>70-80:</span><span className="font-semibold">Fairly Easy (7th grade)</span></div>
                      <div className="flex justify-between"><span>60-70:</span><span className="font-semibold">Standard (8th-9th grade)</span></div>
                      <div className="flex justify-between"><span>50-60:</span><span className="font-semibold">Fairly Difficult (10th-12th grade)</span></div>
                      <div className="flex justify-between"><span>30-50:</span><span className="font-semibold">Difficult (College)</span></div>
                      <div className="flex justify-between"><span>0-30:</span><span className="font-semibold">Very Difficult (Graduate)</span></div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-xl p-6 border border-green-200">
                    <h3 className="font-bold text-green-800 mb-4 text-lg">Flesch-Kincaid Grade Level</h3>
                    <div className="space-y-2 text-green-700">
                      <p>This score corresponds to U.S. grade levels, indicating the minimum education level needed to understand the text.</p>
                      <ul className="space-y-1 text-sm">
                        <li>• <strong>Grade 1-6:</strong> Elementary school level</li>
                        <li>• <strong>Grade 7-9:</strong> Middle school level</li>
                        <li>• <strong>Grade 10-12:</strong> High school level</li>
                        <li>• <strong>Grade 13+:</strong> College level and above</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Use Cases and Applications */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Applications and Use Cases</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl p-6 border border-purple-200">
                    <h3 className="font-bold text-purple-800 mb-4 text-lg">Content Marketing</h3>
                    <ul className="space-y-2 text-purple-700 text-sm">
                      <li>• Optimize content for target audience reading level</li>
                      <li>• Improve SEO with readable, engaging content</li>
                      <li>• Analyze competitor content complexity</li>
                      <li>• Create audience-appropriate blog posts</li>
                    </ul>
                  </div>

                  <div className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-xl p-6 border border-orange-200">
                    <h3 className="font-bold text-orange-800 mb-4 text-lg">Education</h3>
                    <ul className="space-y-2 text-orange-700 text-sm">
                      <li>• Create grade-appropriate learning materials</li>
                      <li>• Assess student writing complexity</li>
                      <li>• Develop reading comprehension exercises</li>
                      <li>• Ensure curriculum text accessibility</li>
                    </ul>
                  </div>

                  <div className="bg-gradient-to-r from-teal-50 to-teal-100 rounded-xl p-6 border border-teal-200">
                    <h3 className="font-bold text-teal-800 mb-4 text-lg">Technical Writing</h3>
                    <ul className="space-y-2 text-teal-700 text-sm">
                      <li>• Simplify complex technical documentation</li>
                      <li>• Create user-friendly manuals and guides</li>
                      <li>• Optimize help content readability</li>
                      <li>• Ensure regulatory compliance clarity</li>
                    </ul>
                  </div>

                  <div className="bg-gradient-to-r from-pink-50 to-pink-100 rounded-xl p-6 border border-pink-200">
                    <h3 className="font-bold text-pink-800 mb-4 text-lg">Publishing & Journalism</h3>
                    <ul className="space-y-2 text-pink-700 text-sm">
                      <li>• Match content to publication standards</li>
                      <li>• Ensure news articles are accessible</li>
                      <li>• Optimize headlines and summaries</li>
                      <li>• Analyze editorial content consistency</li>
                    </ul>
                  </div>

                  <div className="bg-gradient-to-r from-indigo-50 to-indigo-100 rounded-xl p-6 border border-indigo-200">
                    <h3 className="font-bold text-indigo-800 mb-4 text-lg">Healthcare & Legal</h3>
                    <ul className="space-y-2 text-indigo-700 text-sm">
                      <li>• Create patient-friendly medical information</li>
                      <li>• Simplify legal documents and contracts</li>
                      <li>• Ensure informed consent clarity</li>
                      <li>• Improve healthcare communication</li>
                    </ul>
                  </div>

                  <div className="bg-gradient-to-r from-red-50 to-red-100 rounded-xl p-6 border border-red-200">
                    <h3 className="font-bold text-red-800 mb-4 text-lg">Research & Academia</h3>
                    <ul className="space-y-2 text-red-700 text-sm">
                      <li>• Analyze text complexity in research papers</li>
                      <li>• Study language patterns and trends</li>
                      <li>• Evaluate readability across disciplines</li>
                      <li>• Compare writing styles and accessibility</li>
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