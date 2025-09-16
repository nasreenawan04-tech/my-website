
import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

interface SentenceCountResult {
  totalSentences: number;
  declarativeSentences: number;
  interrogativeSentences: number;
  exclamatorySentences: number;
  averageWordsPerSentence: number;
  averageCharactersPerSentence: number;
  longestSentence: number;
  shortestSentence: number;
  words: number;
  characters: number;
  readingTime: number;
}

const SentenceCounter = () => {
  const [text, setText] = useState('');
  const [result, setResult] = useState<SentenceCountResult | null>(null);

  const calculateSentenceCount = (inputText: string): SentenceCountResult => {
    if (inputText.trim() === '') {
      return {
        totalSentences: 0,
        declarativeSentences: 0,
        interrogativeSentences: 0,
        exclamatorySentences: 0,
        averageWordsPerSentence: 0,
        averageCharactersPerSentence: 0,
        longestSentence: 0,
        shortestSentence: 0,
        words: 0,
        characters: 0,
        readingTime: 0
      };
    }

    // Split text into sentences
    const sentences = inputText.split(/[.!?]+/).filter(sentence => sentence.trim().length > 0);
    const totalSentences = sentences.length;

    // Count different types of sentences by analyzing each actual sentence
    let declarativeSentences = 0;
    let interrogativeSentences = 0;
    let exclamatorySentences = 0;

    sentences.forEach(sentence => {
      const trimmed = sentence.trim();
      if (trimmed.length > 0) {
        // Check the last character to determine sentence type
        const lastChar = trimmed[trimmed.length - 1];
        if (lastChar === '.') {
          declarativeSentences++;
        } else if (lastChar === '?') {
          interrogativeSentences++;
        } else if (lastChar === '!') {
          exclamatorySentences++;
        }
      }
    });

    // Re-analyze the original text to count sentences by ending punctuation
    const declarativeMatches = inputText.match(/[^.!?]*\./g) || [];
    const interrogativeMatches = inputText.match(/[^.!?]*\?/g) || [];
    const exclamatoryMatches = inputText.match(/[^.!?]*!/g) || [];
    
    declarativeSentences = declarativeMatches.filter(s => s.trim().length > 1).length;
    interrogativeSentences = interrogativeMatches.filter(s => s.trim().length > 1).length;
    exclamatorySentences = exclamatoryMatches.filter(s => s.trim().length > 1).length;

    // Calculate word and character counts
    const words = inputText.trim().split(/\s+/).filter(word => word.length > 0).length;
    const characters = inputText.length;

    // Calculate sentence statistics
    const sentenceLengths = sentences.map(sentence => sentence.trim().split(/\s+/).filter(word => word.length > 0).length);
    const sentenceCharacterLengths = sentences.map(sentence => sentence.trim().length);

    const averageWordsPerSentence = totalSentences > 0 ? Math.round((words / totalSentences) * 10) / 10 : 0;
    const averageCharactersPerSentence = totalSentences > 0 ? Math.round((characters / totalSentences) * 10) / 10 : 0;
    const longestSentence = sentenceLengths.length > 0 ? Math.max(...sentenceLengths) : 0;
    const shortestSentence = sentenceLengths.length > 0 ? Math.min(...sentenceLengths) : 0;

    // Reading time (average 200 words per minute)
    const readingTime = Math.ceil(words / 200);

    return {
      totalSentences,
      declarativeSentences,
      interrogativeSentences,
      exclamatorySentences,
      averageWordsPerSentence,
      averageCharactersPerSentence,
      longestSentence,
      shortestSentence,
      words,
      characters,
      readingTime
    };
  };

  // Real-time calculation as user types
  useEffect(() => {
    const result = calculateSentenceCount(text);
    setResult(result);
  }, [text]);

  const handleClear = () => {
    setText('');
  };

  const handleCopy = () => {
    if (result) {
      const stats = `Sentence Analysis:
Total Sentences: ${result.totalSentences}
Declarative Sentences: ${result.declarativeSentences}
Interrogative Sentences: ${result.interrogativeSentences}
Exclamatory Sentences: ${result.exclamatorySentences}
Average Words per Sentence: ${result.averageWordsPerSentence}
Average Characters per Sentence: ${result.averageCharactersPerSentence}
Longest Sentence: ${result.longestSentence} words
Shortest Sentence: ${result.shortestSentence} words
Total Words: ${result.words}
Total Characters: ${result.characters}
Reading Time: ${result.readingTime} minute(s)`;
      
      navigator.clipboard.writeText(stats);
    }
  };

  const handleSampleText = () => {
    const sample = `This is a declarative sentence that makes a statement. Are you interested in learning about sentence types? That's fantastic! Declarative sentences end with periods. Interrogative sentences ask questions and end with question marks. Exclamatory sentences express strong emotion and end with exclamation points! 

The quick brown fox jumps over the lazy dog. How many different sentence types can you identify in this text? This tool will help you analyze your writing style. Writing with varied sentence lengths and types makes your content more engaging. Short sentences create impact. Longer sentences can provide detailed explanations and help you elaborate on complex ideas with multiple clauses and supporting information.

What makes a good sentence? Is it the length, the structure, or the meaning it conveys? Great writing combines all these elements effectively!`;
    setText(sample);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Helmet>
        <title>Sentence Counter - Count Sentences & Analyze Text Structure | DapsiWow</title>
        <meta name="description" content="Free online sentence counter tool to count sentences, analyze sentence types, and get detailed text structure statistics. Perfect for writers and editors." />
        <meta name="keywords" content="sentence counter, sentence analyzer, text analysis, sentence types, writing tool, grammar checker, text statistics" />
        <meta property="og:title" content="Sentence Counter - Count Sentences & Analyze Text Structure" />
        <meta property="og:description" content="Free online sentence counter with detailed analysis of sentence types and structure. Perfect for improving your writing." />
        <meta property="og:type" content="website" />
        <link rel="canonical" href="/tools/sentence-counter" />
      </Helmet>
      
      <Header />
      
      <main>
        {/* Hero Section */}
        <section className="gradient-hero text-white py-12 sm:py-16 pt-20 sm:pt-24">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6">
              <i className="fas fa-list text-2xl sm:text-3xl"></i>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6" data-testid="text-page-title">
              Sentence Counter
            </h1>
            <p className="text-lg sm:text-xl text-blue-100 max-w-2xl mx-auto px-2">
              Count sentences, analyze sentence types, and get detailed text structure statistics for better writing
            </p>
          </div>
        </section>

        {/* Calculator Section */}
        <section className="py-8 sm:py-12 lg:py-16">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <Card className="bg-white shadow-sm border-0">
              <CardContent className="p-4 sm:p-6 lg:p-8">
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 sm:gap-8 lg:gap-12">
                  {/* Input Section */}
                  <div className="space-y-4 sm:space-y-6">
                    <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-4 sm:mb-8">Enter Your Text</h2>
                    
                    {/* Text Area */}
                    <div className="space-y-2 sm:space-y-3">
                      <Label htmlFor="text-input" className="text-sm font-medium text-gray-700">
                        Text to Analyze
                      </Label>
                      <textarea
                        id="text-input"
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        className="w-full h-60 sm:h-72 lg:h-80 p-3 sm:p-4 text-sm sm:text-base border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                        placeholder="Type or paste your text here to get instant sentence count and analysis..."
                        data-testid="textarea-text-input"
                      />
                    </div>

                    {/* Action Buttons */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3 lg:gap-4">
                      <Button
                        onClick={handleClear}
                        variant="outline"
                        className="py-2.5 sm:py-2 text-xs sm:text-sm"
                        data-testid="button-clear-text"
                      >
                        <i className="fas fa-trash mr-1 sm:mr-2"></i>
                        <span className="hidden sm:inline">Clear Text</span>
                        <span className="sm:hidden">Clear</span>
                      </Button>
                      <Button
                        onClick={handleSampleText}
                        variant="outline"
                        className="py-2.5 sm:py-2 text-xs sm:text-sm"
                        data-testid="button-sample-text"
                      >
                        <i className="fas fa-file-text mr-1 sm:mr-2"></i>
                        <span className="hidden sm:inline">Sample Text</span>
                        <span className="sm:hidden">Sample</span>
                      </Button>
                      <Button
                        onClick={handleCopy}
                        variant="outline"
                        className="py-2.5 sm:py-2 text-xs sm:text-sm"
                        disabled={!result || result.totalSentences === 0}
                        data-testid="button-copy-stats"
                      >
                        <i className="fas fa-copy mr-1 sm:mr-2"></i>
                        <span className="hidden sm:inline">Copy Stats</span>
                        <span className="sm:hidden">Copy</span>
                      </Button>
                    </div>
                  </div>

                  {/* Results Section */}
                  <div className="space-y-4 sm:space-y-6">
                    <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-4 sm:mb-8">Sentence Analysis</h2>
                    
                    {result && result.totalSentences > 0 ? (
                      <div className="space-y-3 sm:space-y-4" data-testid="sentence-statistics">
                        {/* Total Sentences */}
                        <div className="bg-blue-50 rounded-lg p-4 sm:p-6 text-center">
                          <div className="text-2xl sm:text-3xl font-bold text-blue-600" data-testid="stat-total-sentences">
                            {result.totalSentences.toLocaleString()}
                          </div>
                          <div className="text-xs sm:text-sm text-gray-600">Total Sentences</div>
                        </div>

                        {/* Sentence Types */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3 lg:gap-4">
                          <div className="bg-green-50 rounded-lg p-3 sm:p-4 text-center">
                            <div className="text-lg sm:text-xl font-bold text-green-600" data-testid="stat-declarative">
                              {result.declarativeSentences}
                            </div>
                            <div className="text-xs sm:text-sm text-gray-600">Declarative (.)</div>
                          </div>
                          <div className="bg-purple-50 rounded-lg p-3 sm:p-4 text-center">
                            <div className="text-lg sm:text-xl font-bold text-purple-600" data-testid="stat-interrogative">
                              {result.interrogativeSentences}
                            </div>
                            <div className="text-xs sm:text-sm text-gray-600">Questions (?)</div>
                          </div>
                          <div className="bg-orange-50 rounded-lg p-3 sm:p-4 text-center">
                            <div className="text-lg sm:text-xl font-bold text-orange-600" data-testid="stat-exclamatory">
                              {result.exclamatorySentences}
                            </div>
                            <div className="text-xs sm:text-sm text-gray-600">Exclamatory (!)</div>
                          </div>
                        </div>

                        {/* Sentence Statistics */}
                        <div className="bg-gray-50 rounded-lg p-4 sm:p-6">
                          <h3 className="text-sm sm:text-base font-semibold text-gray-900 mb-3 sm:mb-4">Sentence Statistics</h3>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                            <div className="text-center">
                              <div className="text-base sm:text-lg font-bold text-gray-600" data-testid="stat-avg-words">
                                {result.averageWordsPerSentence}
                              </div>
                              <div className="text-xs sm:text-sm text-gray-600">Avg Words/Sentence</div>
                            </div>
                            <div className="text-center">
                              <div className="text-base sm:text-lg font-bold text-gray-600" data-testid="stat-avg-chars">
                                {result.averageCharactersPerSentence}
                              </div>
                              <div className="text-xs sm:text-sm text-gray-600">Avg Chars/Sentence</div>
                            </div>
                            <div className="text-center">
                              <div className="text-base sm:text-lg font-bold text-gray-600" data-testid="stat-longest">
                                {result.longestSentence}
                              </div>
                              <div className="text-xs sm:text-sm text-gray-600">Longest Sentence</div>
                            </div>
                            <div className="text-center">
                              <div className="text-base sm:text-lg font-bold text-gray-600" data-testid="stat-shortest">
                                {result.shortestSentence}
                              </div>
                              <div className="text-xs sm:text-sm text-gray-600">Shortest Sentence</div>
                            </div>
                          </div>
                        </div>

                        {/* Additional Stats */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                          <div className="bg-indigo-50 rounded-lg p-3 sm:p-4 text-center">
                            <div className="text-lg sm:text-xl font-bold text-indigo-600" data-testid="stat-words">
                              {result.words.toLocaleString()}
                            </div>
                            <div className="text-xs sm:text-sm text-gray-600">Total Words</div>
                          </div>
                          <div className="bg-pink-50 rounded-lg p-3 sm:p-4 text-center">
                            <div className="text-lg sm:text-xl font-bold text-pink-600" data-testid="stat-reading-time">
                              {result.readingTime} min
                            </div>
                            <div className="text-xs sm:text-sm text-gray-600">Reading Time</div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8 sm:py-12 text-gray-500">
                        <i className="fas fa-list text-3xl sm:text-4xl mb-3 sm:mb-4"></i>
                        <p className="text-base sm:text-lg">Start typing to see your sentence analysis</p>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Information Sections */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-8 sm:pb-12 lg:pb-16">
          {/* What is a Sentence Counter */}
          <div className="mt-8 sm:mt-12 bg-white rounded-2xl shadow-lg p-4 sm:p-6 lg:p-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4 sm:mb-6">What is a Sentence Counter Tool?</h2>
            <div className="prose max-w-none">
              <p className="text-lg text-gray-700 mb-6">
                A <strong>sentence counter</strong> is an advanced text analysis tool designed to count, categorize, and analyze sentences in any written content. Unlike basic text counters, our sentence analyzer provides comprehensive insights into sentence structure, types, length distribution, and readability metrics that are essential for effective writing.
              </p>
              
              <p className="text-gray-700 mb-6">
                Our free online sentence counter automatically identifies different sentence types (declarative, interrogative, and exclamatory), calculates average sentence length, analyzes writing patterns, and provides detailed statistics to help writers, students, and professionals improve their content quality and readability.
              </p>

              <p className="text-gray-700 mb-6">
                The tool works by parsing text using advanced algorithms to detect sentence boundaries based on punctuation marks, then categorizes each sentence by type and length. This analysis helps identify writing patterns, sentence variety, and areas for improvement in your content structure.
              </p>
            </div>
          </div>

          {/* How It Works */}
          <div className="mt-6 sm:mt-8 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl p-4 sm:p-6 lg:p-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4 sm:mb-6">How Our Sentence Counter Works</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              <div className="text-center">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                  <i className="fas fa-paste text-lg sm:text-2xl"></i>
                </div>
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">1. Input Text</h3>
                <p className="text-gray-600 text-xs sm:text-sm">Paste or type your content into the text analyzer for instant sentence counting and analysis.</p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-4">
                  <i className="fas fa-search text-2xl"></i>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">2. Parse & Analyze</h3>
                <p className="text-gray-600 text-sm">Our algorithm identifies sentence boundaries and categorizes each sentence by type and structure.</p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-4">
                  <i className="fas fa-chart-bar text-2xl"></i>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">3. Generate Stats</h3>
                <p className="text-gray-600 text-sm">Calculate comprehensive statistics including sentence counts, averages, and readability metrics.</p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-4">
                  <i className="fas fa-download text-2xl"></i>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">4. Export Results</h3>
                <p className="text-gray-600 text-sm">Copy or download your sentence analysis results for further use and reference.</p>
              </div>
            </div>
          </div>

          {/* Sentence Types */}
          <div className="mt-6 sm:mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-4 sm:p-6 lg:p-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4 sm:mb-6">Understanding Sentence Types</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              <div className="bg-white rounded-lg p-4 sm:p-6 shadow-sm">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-lg flex items-center justify-center mb-3 sm:mb-4">
                  <span className="text-green-600 font-bold text-lg sm:text-xl">.</span>
                </div>
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">Declarative</h3>
                <p className="text-gray-600 text-xs sm:text-sm">Statements that provide information or express facts. They end with periods and make up most written content.</p>
              </div>
              
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                  <span className="text-purple-600 font-bold text-xl">?</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Interrogative</h3>
                <p className="text-gray-600 text-sm">Questions that seek information or responses. They end with question marks and engage readers directly.</p>
              </div>
              
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                  <span className="text-orange-600 font-bold text-xl">!</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Exclamatory</h3>
                <p className="text-gray-600 text-sm">Statements that express strong emotion or emphasis. They end with exclamation points and add energy to writing.</p>
              </div>
            </div>
          </div>

          {/* Key Features */}
          <div className="mt-6 sm:mt-8 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-4 sm:p-6 lg:p-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4 sm:mb-6">Key Features of Our Sentence Counter</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              <div className="text-center">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-green-600 text-white rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                  <i className="fas fa-chart-line text-lg sm:text-2xl"></i>
                </div>
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">Detailed Analysis</h3>
                <p className="text-gray-600 text-sm">Get comprehensive statistics about sentence structure and composition.</p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-green-600 text-white rounded-full flex items-center justify-center mx-auto mb-4">
                  <i className="fas fa-eye text-2xl"></i>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Readability Insights</h3>
                <p className="text-gray-600">Understand sentence length patterns that affect readability and engagement.</p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-green-600 text-white rounded-full flex items-center justify-center mx-auto mb-4">
                  <i className="fas fa-bolt text-2xl"></i>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Real-time Results</h3>
                <p className="text-gray-600">See instant analysis as you type or edit your content.</p>
              </div>
            </div>
          </div>

          {/* Benefits and Use Cases */}
          <div className="mt-6 sm:mt-8 bg-white rounded-2xl shadow-lg p-4 sm:p-6 lg:p-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4 sm:mb-6">Benefits of Using a Sentence Counter</h2>
            
            <div className="mb-6 sm:mb-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6">
                  <div className="w-12 h-12 bg-blue-600 text-white rounded-lg flex items-center justify-center mb-4">
                    <i className="fas fa-chart-line text-xl"></i>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Improve Readability</h3>
                  <p className="text-gray-700 text-sm">Analyze sentence length distribution to ensure your content is easily readable and engaging for your target audience.</p>
                </div>
                
                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-6">
                  <div className="w-12 h-12 bg-green-600 text-white rounded-lg flex items-center justify-center mb-4">
                    <i className="fas fa-balance-scale text-xl"></i>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Balance Sentence Variety</h3>
                  <p className="text-gray-700 text-sm">Ensure a good mix of sentence types and lengths to create dynamic, interesting content that keeps readers engaged.</p>
                </div>
                
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-6">
                  <div className="w-12 h-12 bg-purple-600 text-white rounded-lg flex items-center justify-center mb-4">
                    <i className="fas fa-search text-xl"></i>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">SEO Optimization</h3>
                  <p className="text-gray-700 text-sm">Optimize content structure for search engines by maintaining ideal sentence lengths and improving overall readability scores.</p>
                </div>
              </div>
            </div>

            <h3 className="text-2xl font-bold text-gray-900 mb-6">Who Uses Our Sentence Counter Tool?</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <i className="fas fa-pen-fancy text-blue-600 text-xl"></i>
                </div>
                <h4 className="font-semibold text-gray-900 mb-3">Content Writers & Bloggers</h4>
                <p className="text-gray-600 text-sm mb-3">Optimize blog posts, articles, and web content for better readability and engagement. Ensure sentence variety to keep readers interested.</p>
                <ul className="text-gray-600 text-xs space-y-1">
                  <li>• Improve content flow and pacing</li>
                  <li>• Meet style guide requirements</li>
                  <li>• Enhance SEO performance</li>
                </ul>
              </div>
              
              <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                  <i className="fas fa-graduation-cap text-green-600 text-xl"></i>
                </div>
                <h4 className="font-semibold text-gray-900 mb-3">Students & Academics</h4>
                <p className="text-gray-600 text-sm mb-3">Improve academic writing, essays, and research papers by analyzing sentence structure and maintaining appropriate complexity.</p>
                <ul className="text-gray-600 text-xs space-y-1">
                  <li>• Meet assignment word limits</li>
                  <li>• Improve essay structure</li>
                  <li>• Enhance writing clarity</li>
                </ul>
              </div>
              
              <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                  <i className="fas fa-user-edit text-purple-600 text-xl"></i>
                </div>
                <h4 className="font-semibold text-gray-900 mb-3">Editors & Proofreaders</h4>
                <p className="text-gray-600 text-sm mb-3">Analyze text structure, identify readability issues, and ensure consistent writing quality across different content types.</p>
                <ul className="text-gray-600 text-xs space-y-1">
                  <li>• Quality assurance checks</li>
                  <li>• Style consistency analysis</li>
                  <li>• Readability improvements</li>
                </ul>
              </div>
              
              <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                  <i className="fas fa-chalkboard-teacher text-orange-600 text-xl"></i>
                </div>
                <h4 className="font-semibold text-gray-900 mb-3">Teachers & Educators</h4>
                <p className="text-gray-600 text-sm mb-3">Assess student writing, provide detailed feedback, and create educational materials with appropriate reading levels.</p>
                <ul className="text-gray-600 text-xs space-y-1">
                  <li>• Student assessment tools</li>
                  <li>• Writing instruction aids</li>
                  <li>• Curriculum development</li>
                </ul>
              </div>
              
              <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                  <i className="fas fa-briefcase text-red-600 text-xl"></i>
                </div>
                <h4 className="font-semibold text-gray-900 mb-3">Business Professionals</h4>
                <p className="text-gray-600 text-sm mb-3">Create clear, professional communications including reports, proposals, and presentations with optimal sentence structure.</p>
                <ul className="text-gray-600 text-xs space-y-1">
                  <li>• Professional documentation</li>
                  <li>• Client communications</li>
                  <li>• Marketing materials</li>
                </ul>
              </div>
              
              <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                  <i className="fas fa-microscope text-indigo-600 text-xl"></i>
                </div>
                <h4 className="font-semibold text-gray-900 mb-3">Researchers & Analysts</h4>
                <p className="text-gray-600 text-sm mb-3">Analyze writing patterns, conduct linguistic research, and ensure academic papers meet publication standards.</p>
                <ul className="text-gray-600 text-xs space-y-1">
                  <li>• Linguistic analysis</li>
                  <li>• Publication preparation</li>
                  <li>• Data-driven insights</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Related Tools */}
          <div className="mt-8 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Related Text Analysis Tools</h2>
            <p className="text-gray-700 mb-8">Enhance your writing analysis with our comprehensive suite of text tools. Each tool provides unique insights to help you create better content.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <a href="/tools/word-counter" className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow group border border-gray-200">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-blue-200 transition-colors">
                  <i className="fas fa-calculator text-blue-600 text-xl"></i>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-600">Word Counter</h3>
                <p className="text-gray-600 text-sm">Count words, characters, and paragraphs with detailed reading time estimates and keyword density analysis.</p>
              </a>
              
              <a href="/tools/character-counter" className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow group border border-gray-200">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-green-200 transition-colors">
                  <i className="fas fa-font text-green-600 text-xl"></i>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-green-600">Character Counter</h3>
                <p className="text-gray-600 text-sm">Analyze character count, spaces, and special characters with social media optimization features.</p>
              </a>
              
              <a href="/tools/paragraph-counter" className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow group border border-gray-200">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-purple-200 transition-colors">
                  <i className="fas fa-paragraph text-purple-600 text-xl"></i>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-purple-600">Paragraph Counter</h3>
                <p className="text-gray-600 text-sm">Count and analyze paragraph structure for improved content organization and readability.</p>
              </a>
              
              <a href="/tools/case-converter" className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow group border border-gray-200">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-orange-200 transition-colors">
                  <i className="fas fa-text-height text-orange-600 text-xl"></i>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-orange-600">Case Converter</h3>
                <p className="text-gray-600 text-sm">Convert text between different cases including uppercase, lowercase, title case, and more.</p>
              </a>
              
              <a href="/tools/reverse-text-tool" className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow group border border-gray-200">
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-red-200 transition-colors">
                  <i className="fas fa-exchange-alt text-red-600 text-xl"></i>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-red-600">Reverse Text</h3>
                <p className="text-gray-600 text-sm">Reverse text characters, words, or lines for creative writing and text manipulation.</p>
              </a>
              
              <a href="/tools/lorem-ipsum-generator" className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow group border border-gray-200">
                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-gray-200 transition-colors">
                  <i className="fas fa-file-text text-gray-600 text-xl"></i>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-gray-600">Lorem Ipsum Generator</h3>
                <p className="text-gray-600 text-sm">Generate placeholder text for design and development projects with customizable length options.</p>
              </a>
            </div>
            
            <div className="mt-8 text-center">
              <a href="/text" className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors">
                <i className="fas fa-tools mr-2"></i>
                View All Text Tools
              </a>
            </div>
          </div>

          {/* FAQ */}
          <div className="mt-8 bg-gradient-to-r from-gray-50 to-blue-50 rounded-2xl p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Frequently Asked Questions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">How does the sentence counter identify different sentence types?</h3>
                <p className="text-gray-600 mb-6">Our advanced algorithm analyzes punctuation marks at the end of sentences to categorize them. Periods indicate declarative sentences, question marks identify interrogative sentences, and exclamation points mark exclamatory sentences. The tool also considers context and sentence structure for accurate classification.</p>
                
                <h3 className="text-lg font-semibold text-gray-900 mb-3">What is considered an ideal average sentence length?</h3>
                <p className="text-gray-600 mb-6">For most writing, an average of 15-20 words per sentence is considered optimal for readability. However, this can vary by audience and purpose. Academic writing may use longer sentences (20-25 words), while web content and marketing materials benefit from shorter sentences (10-15 words) for better engagement.</p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">How can sentence analysis improve my writing quality?</h3>
                <p className="text-gray-600 mb-6">Sentence analysis helps you identify patterns in your writing, ensuring variety in sentence length and type. This creates more engaging, readable content. Too many long sentences can be difficult to follow, while too many short ones can seem choppy. Our tool helps you find the perfect balance.</p>
                
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Is this sentence counter free to use?</h3>
                <p className="text-gray-600 mb-6">Yes, our sentence counter is completely free to use with no registration required. You can analyze unlimited text, access all features including sentence type analysis, export results, and use the tool as often as needed for personal, educational, or commercial purposes.</p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Does the tool work with different languages and formats?</h3>
                <p className="text-gray-600 mb-6">The sentence counter works best with English text, as it relies on English punctuation patterns and sentence structure rules. It can handle various text formats including plain text, documents copied from Word, and web content. For other languages, accuracy may vary based on punctuation conventions.</p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">What makes your sentence counter different from others?</h3>
                <p className="text-gray-600 mb-6">Our tool provides comprehensive analysis beyond basic counting, including sentence type classification, length statistics, readability metrics, and writing insights. The real-time analysis, detailed statistics, and export capabilities make it ideal for writers, students, and professionals who need in-depth text analysis.</p>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default SentenceCounter;
