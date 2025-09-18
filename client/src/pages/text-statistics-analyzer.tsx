
import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
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

const TextStatisticsAnalyzer = () => {
  const [text, setText] = useState('');
  const [statistics, setStatistics] = useState<TextStatistics | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);

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

  const analyzeText = (inputText: string): TextStatistics => {
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
    const cleanWords = words.map(word => word.replace(/[^\w]/g, '').toLowerCase()).filter(word => word.length > 0);
    
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
    cleanWords.forEach(word => {
      if (word.length > 3) { // Only count words longer than 3 characters
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
    const stats = analyzeText(text);
    setStatistics(stats);
  }, [text]);

  const handleClear = () => {
    setText('');
  };

  const handleSampleText = () => {
    const sample = `Welcome to DapsiWow's comprehensive text analysis tool! This powerful analyzer provides detailed insights into your writing, helping you understand various aspects of your content.

Our tool examines multiple dimensions of text quality including readability, complexity, and linguistic diversity. Whether you're a writer, student, researcher, or content creator, this analyzer gives you valuable statistics about your text.

The analysis includes basic metrics like word count, character count, and sentence structure. Additionally, it provides advanced features such as readability scores, vocabulary richness, and frequency analysis of commonly used words.

Understanding these metrics can help improve your writing style, ensure appropriate reading levels for your audience, and optimize content for better engagement. Use this tool to refine your writing and create more effective communication.`;
    setText(sample);
  };

  const handleCopyStats = () => {
    if (!statistics) return;
    
    const statsText = `Text Statistics Analysis:
═══════════════════════════

📊 BASIC METRICS
Words: ${statistics.words.toLocaleString()}
Characters: ${statistics.characters.toLocaleString()}
Characters (no spaces): ${statistics.charactersNoSpaces.toLocaleString()}
Sentences: ${statistics.sentences.toLocaleString()}
Paragraphs: ${statistics.paragraphs.toLocaleString()}
Lines: ${statistics.lines.toLocaleString()}

📈 AVERAGES
Words per sentence: ${statistics.averageWordsPerSentence}
Characters per word: ${statistics.averageCharactersPerWord}
Syllables per word: ${statistics.averageSyllablesPerWord}

🎯 READING METRICS
Reading time: ${statistics.readingTime} minute(s)
Speaking time: ${statistics.speakingTime} minute(s)
Flesch Reading Ease: ${statistics.fleischReadingEase}
Readability level: ${statistics.readabilityLevel}

🔤 CHARACTER ANALYSIS
Uppercase letters: ${statistics.uppercaseLetters}
Lowercase letters: ${statistics.lowercaseLetters}
Digits: ${statistics.digits}
Punctuation marks: ${statistics.punctuation}

📚 VOCABULARY
Unique words: ${statistics.uniqueWords}
Lexical diversity: ${statistics.lexicalDiversity}%
Longest word: "${statistics.longestWord}"
Shortest word: "${statistics.shortestWord}"`;

    navigator.clipboard.writeText(statsText);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Helmet>
        <title>Text Statistics Analyzer - Advanced Text Analysis Tool | DapsiWow</title>
        <meta name="description" content="Comprehensive text statistics analyzer with readability scores, vocabulary analysis, word frequency, and advanced linguistic metrics for writers and content creators." />
        <meta name="keywords" content="text statistics, text analyzer, readability score, vocabulary analysis, word frequency, flesch reading ease, text metrics, writing analysis" />
        <meta property="og:title" content="Text Statistics Analyzer - Advanced Text Analysis Tool | DapsiWow" />
        <meta property="og:description" content="Professional text analysis tool providing comprehensive statistics, readability scores, and linguistic insights for better writing." />
        <meta property="og:type" content="website" />
        <meta name="robots" content="index, follow" />
        <meta name="author" content="DapsiWow" />
        <link rel="canonical" href="https://dapsiwow.com/tools/text-statistics-analyzer" />
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
                Text Statistics
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                  Analyzer
                </span>
              </h1>
              <p className="text-xl sm:text-2xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
                Comprehensive text analysis with readability scores, vocabulary metrics, and advanced linguistic insights
              </p>
            </div>
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-4 py-16">
          <Card className="bg-white/90 backdrop-blur-sm shadow-2xl border-0 rounded-3xl overflow-hidden">
            <CardContent className="p-0">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-0">
                {/* Input Section */}
                <div className="lg:col-span-2 p-8 lg:p-12 space-y-8">
                  <div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">Text Analysis</h2>
                    <p className="text-gray-600">Enter your text to get comprehensive statistics and linguistic insights</p>
                  </div>

                  <div className="space-y-6">
                    {/* Text Input */}
                    <div className="space-y-3">
                      <Label htmlFor="text-input" className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                        Text to Analyze
                      </Label>
                      <Textarea
                        id="text-input"
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        className="min-h-[400px] text-base border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-blue-500 resize-none"
                        placeholder="Type or paste your text here to get comprehensive statistics and analysis..."
                      />
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4">
                      <Button
                        onClick={handleSampleText}
                        className="flex-1 h-14 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold text-lg rounded-xl shadow-lg transform transition-all duration-200 hover:scale-105"
                      >
                        Load Sample Text
                      </Button>
                      <Button
                        onClick={handleClear}
                        variant="outline"
                        className="h-14 px-8 border-2 border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold text-lg rounded-xl"
                      >
                        Clear
                      </Button>
                      <Button
                        onClick={handleCopyStats}
                        variant="outline"
                        className="h-14 px-8 border-2 border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold text-lg rounded-xl"
                        disabled={!statistics || statistics.words === 0}
                      >
                        Copy Stats
                      </Button>
                    </div>

                    {/* Advanced Toggle */}
                    {statistics && statistics.words > 0 && (
                      <div className="flex items-center space-x-3">
                        <Label htmlFor="advanced-toggle" className="text-sm font-medium">
                          Show Advanced Analysis
                        </Label>
                        <input
                          id="advanced-toggle"
                          type="checkbox"
                          checked={showAdvanced}
                          onChange={(e) => setShowAdvanced(e.target.checked)}
                          className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Results Section */}
                <div className="bg-gradient-to-br from-gray-50 to-blue-50 p-8 lg:p-12">
                  <h2 className="text-2xl font-bold text-gray-900 mb-8">Analysis Results</h2>

                  {statistics && statistics.words > 0 ? (
                    <div className="space-y-6">
                      {/* Basic Metrics */}
                      <div className="bg-white rounded-2xl p-6 shadow-lg border border-blue-100">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">📊 Basic Metrics</h3>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="text-center">
                            <div className="text-2xl font-bold text-blue-600">{statistics.words.toLocaleString()}</div>
                            <div className="text-xs text-gray-600">Words</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-green-600">{statistics.characters.toLocaleString()}</div>
                            <div className="text-xs text-gray-600">Characters</div>
                          </div>
                          <div className="text-center">
                            <div className="text-xl font-bold text-purple-600">{statistics.sentences}</div>
                            <div className="text-xs text-gray-600">Sentences</div>
                          </div>
                          <div className="text-center">
                            <div className="text-xl font-bold text-orange-600">{statistics.paragraphs}</div>
                            <div className="text-xs text-gray-600">Paragraphs</div>
                          </div>
                        </div>
                      </div>

                      {/* Reading Metrics */}
                      <div className="bg-white rounded-xl p-6 shadow-sm">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">⏱️ Reading Metrics</h3>
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-gray-700">Reading time</span>
                            <span className="font-bold text-blue-600">{statistics.readingTime} min</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-700">Speaking time</span>
                            <span className="font-bold text-green-600">{statistics.speakingTime} min</span>
                          </div>
                        </div>
                      </div>

                      {/* Readability Score */}
                      <div className="bg-white rounded-xl p-6 shadow-sm">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">📈 Readability</h3>
                        <div className="space-y-4">
                          <div>
                            <div className="flex justify-between mb-2">
                              <span className="text-gray-700">Flesch Reading Ease</span>
                              <span className="font-bold">{statistics.fleischReadingEase}</span>
                            </div>
                            <Progress 
                              value={Math.max(0, Math.min(100, statistics.fleischReadingEase))} 
                              className="h-2" 
                            />
                          </div>
                          <div className="text-center">
                            <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                              {statistics.readabilityLevel}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Advanced Analysis */}
                      {showAdvanced && (
                        <>
                          <div className="bg-white rounded-xl p-6 shadow-sm">
                            <h3 className="text-lg font-bold text-gray-900 mb-4">🔤 Character Analysis</h3>
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
                                <span>Punctuation</span>
                                <span className="font-bold">{statistics.punctuation}</span>
                              </div>
                            </div>
                          </div>

                          <div className="bg-white rounded-xl p-6 shadow-sm">
                            <h3 className="text-lg font-bold text-gray-900 mb-4">📚 Vocabulary</h3>
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span>Unique words</span>
                                <span className="font-bold">{statistics.uniqueWords}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Lexical diversity</span>
                                <span className="font-bold">{statistics.lexicalDiversity}%</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Longest word</span>
                                <span className="font-bold text-xs">{statistics.longestWord}</span>
                              </div>
                            </div>
                          </div>

                          {/* Most Frequent Words */}
                          {statistics.mostFrequentWords.length > 0 && (
                            <div className="bg-white rounded-xl p-6 shadow-sm">
                              <h3 className="text-lg font-bold text-gray-900 mb-4">🔥 Most Frequent Words</h3>
                              <div className="space-y-2">
                                {statistics.mostFrequentWords.slice(0, 5).map((item, index) => (
                                  <div key={index} className="flex justify-between items-center">
                                    <span className="text-sm font-medium">{item.word}</span>
                                    <div className="flex items-center space-x-2">
                                      <span className="text-xs text-gray-500">{item.count}x</span>
                                      <Progress 
                                        value={item.percentage} 
                                        className="w-16 h-1" 
                                      />
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <div className="text-6xl text-gray-300 mb-4">📊</div>
                      <h3 className="text-xl font-bold text-gray-600 mb-2">No Analysis Yet</h3>
                      <p className="text-gray-500">
                        Enter some text to see detailed statistics and analysis
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default TextStatisticsAnalyzer;
