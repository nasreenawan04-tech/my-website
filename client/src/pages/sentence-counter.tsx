
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

    // Count different types of sentences by analyzing punctuation
    const declarativeMatches = inputText.match(/[^.!?]*\./g) || [];
    const interrogativeMatches = inputText.match(/[^.!?]*\?/g) || [];
    const exclamatoryMatches = inputText.match(/[^.!?]*!/g) || [];
    
    const declarativeSentences = declarativeMatches.filter(s => s.trim().length > 1).length;
    const interrogativeSentences = interrogativeMatches.filter(s => s.trim().length > 1).length;
    const exclamatorySentences = exclamatoryMatches.filter(s => s.trim().length > 1).length;

    // Calculate word and character counts
    const words = inputText.trim().split(/\s+/).filter(word => word.length > 0).length;
    const characters = inputText.length;

    // Calculate sentence statistics
    const sentenceLengths = sentences.map(sentence => sentence.trim().split(/\s+/).filter(word => word.length > 0).length);

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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Helmet>
        <title>Sentence Counter - Count Sentences & Analyze Text Structure | DapsiWow</title>
        <meta name="description" content="Free online sentence counter tool to count sentences, analyze sentence types (declarative, interrogative, exclamatory), and get detailed text structure statistics. Perfect for writers, students, and content creators to improve writing quality." />
        <meta name="keywords" content="sentence counter, sentence analyzer, text analysis, sentence types, writing tool, grammar checker, text statistics, declarative sentences, interrogative sentences, exclamatory sentences, readability analysis, writing improvement" />
        <meta property="og:title" content="Sentence Counter - Count Sentences & Analyze Text Structure | DapsiWow" />
        <meta property="og:description" content="Free online sentence counter with detailed analysis of sentence types and structure. Perfect for improving your writing quality and readability." />
        <meta property="og:type" content="website" />
        <meta name="robots" content="index, follow" />
        <meta name="author" content="DapsiWow" />
        <link rel="canonical" href="https://dapsiwow.com/tools/sentence-counter" />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            "name": "Sentence Counter",
            "description": "Free online sentence counter tool to analyze text structure, count sentences by type, and get detailed writing statistics for improved content quality.",
            "url": "https://dapsiwow.com/tools/sentence-counter",
            "applicationCategory": "EducationApplication",
            "operatingSystem": "Any",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "USD"
            },
            "featureList": [
              "Count total sentences",
              "Analyze sentence types",
              "Calculate reading time",
              "Average sentence length analysis",
              "Real-time text analysis",
              "Writing improvement insights"
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
                <span className="text-sm font-medium text-blue-700">Advanced Sentence Analysis</span>
              </div>
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-slate-900 leading-tight">
                Sentence
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                  Counter
                </span>
              </h1>
              <p className="text-xl sm:text-2xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
                Analyze sentence structure and improve your writing with detailed sentence statistics and readability insights
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
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">Text Analysis</h2>
                    <p className="text-gray-600">Enter your text to get instant sentence count and detailed analysis</p>
                  </div>
                  
                  {/* Text Area */}
                  <div className="space-y-3">
                    <Label htmlFor="text-input" className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                      Text to Analyze
                    </Label>
                    <textarea
                      id="text-input"
                      value={text}
                      onChange={(e) => setText(e.target.value)}
                      className="w-full h-80 p-4 text-base border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                      placeholder="Type or paste your text here to get instant sentence count and analysis. The tool will automatically analyze sentence types, calculate averages, and provide writing insights..."
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
                      onClick={handleClear}
                      variant="outline"
                      className="h-14 px-8 border-2 border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold text-lg rounded-xl"
                      data-testid="button-clear-text"
                    >
                      Clear
                    </Button>
                    <Button
                      onClick={handleCopy}
                      variant="outline"
                      className="h-14 px-8 border-2 border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold text-lg rounded-xl"
                      disabled={!result || result.totalSentences === 0}
                      data-testid="button-copy-stats"
                    >
                      Copy Stats
                    </Button>
                  </div>
                </div>

                {/* Results Section */}
                <div className="bg-gradient-to-br from-gray-50 to-blue-50 p-8 lg:p-12">
                  <h2 className="text-2xl font-bold text-gray-900 mb-8">Analysis Results</h2>
                  
                  {result && result.totalSentences > 0 ? (
                    <div className="space-y-6" data-testid="sentence-statistics">
                      {/* Total Sentences Highlight */}
                      <div className="bg-white rounded-2xl p-6 shadow-lg border border-blue-100">
                        <div className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-2">Total Sentences</div>
                        <div className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600" data-testid="stat-total-sentences">
                          {result.totalSentences.toLocaleString()}
                        </div>
                      </div>

                      {/* Sentence Types */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-bold text-gray-900">Sentence Types</h3>
                        <div className="space-y-3">
                          <div className="bg-white rounded-xl p-4 shadow-sm">
                            <div className="flex justify-between items-center">
                              <span className="font-medium text-gray-700">Declarative (.)</span>
                              <span className="font-bold text-green-600" data-testid="stat-declarative">
                                {result.declarativeSentences}
                              </span>
                            </div>
                          </div>
                          <div className="bg-white rounded-xl p-4 shadow-sm">
                            <div className="flex justify-between items-center">
                              <span className="font-medium text-gray-700">Interrogative (?)</span>
                              <span className="font-bold text-purple-600" data-testid="stat-interrogative">
                                {result.interrogativeSentences}
                              </span>
                            </div>
                          </div>
                          <div className="bg-white rounded-xl p-4 shadow-sm">
                            <div className="flex justify-between items-center">
                              <span className="font-medium text-gray-700">Exclamatory (!)</span>
                              <span className="font-bold text-orange-600" data-testid="stat-exclamatory">
                                {result.exclamatorySentences}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Statistics */}
                      <div className="bg-white rounded-xl p-6 shadow-sm">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">Statistics</h3>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="text-center">
                            <div className="text-xl font-bold text-gray-600" data-testid="stat-avg-words">
                              {result.averageWordsPerSentence}
                            </div>
                            <div className="text-xs text-gray-600">Avg Words/Sentence</div>
                          </div>
                          <div className="text-center">
                            <div className="text-xl font-bold text-gray-600" data-testid="stat-avg-chars">
                              {result.averageCharactersPerSentence}
                            </div>
                            <div className="text-xs text-gray-600">Avg Chars/Sentence</div>
                          </div>
                          <div className="text-center">
                            <div className="text-xl font-bold text-gray-600" data-testid="stat-longest">
                              {result.longestSentence}
                            </div>
                            <div className="text-xs text-gray-600">Longest Sentence</div>
                          </div>
                          <div className="text-center">
                            <div className="text-xl font-bold text-gray-600" data-testid="stat-shortest">
                              {result.shortestSentence}
                            </div>
                            <div className="text-xs text-gray-600">Shortest Sentence</div>
                          </div>
                        </div>
                      </div>

                      {/* Additional Metrics */}
                      <div className="space-y-3">
                        <div className="bg-white rounded-xl p-4 shadow-sm">
                          <div className="flex justify-between items-center">
                            <span className="font-medium text-gray-700">Total Words</span>
                            <span className="font-bold text-indigo-600" data-testid="stat-words">
                              {result.words.toLocaleString()}
                            </span>
                          </div>
                        </div>
                        <div className="bg-white rounded-xl p-4 shadow-sm">
                          <div className="flex justify-between items-center">
                            <span className="font-medium text-gray-700">Reading Time</span>
                            <span className="font-bold text-pink-600" data-testid="stat-reading-time">
                              {result.readingTime} min
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-16" data-testid="no-results">
                      <div className="w-20 h-20 bg-gray-200 rounded-full mx-auto mb-6 flex items-center justify-center">
                        <div className="text-3xl font-bold text-gray-400">S</div>
                      </div>
                      <p className="text-gray-500 text-lg">Enter text to see sentence analysis</p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* SEO Content Section */}
          <div className="mt-16 grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">What is a Sentence Counter?</h3>
                <div className="space-y-4 text-gray-600">
                  <p>
                    A sentence counter is a sophisticated text analysis tool that counts and categorizes sentences in written content. 
                    Unlike basic text counters, our sentence analyzer provides detailed insights into sentence structure, types, and 
                    readability metrics essential for effective writing.
                  </p>
                  <p>
                    Our free online sentence counter automatically identifies different sentence types (declarative, interrogative, 
                    and exclamatory), calculates average sentence length, analyzes writing patterns, and provides comprehensive 
                    statistics to help writers, students, and professionals improve their content quality.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">How to Use the Sentence Counter</h3>
                <div className="space-y-4 text-gray-600">
                  <p>
                    Using our sentence counter is simple and intuitive. Simply paste or type your text into the analysis area, 
                    and the tool instantly provides comprehensive sentence statistics including total count, type breakdown, 
                    and readability metrics.
                  </p>
                  <ul className="space-y-2 list-disc list-inside">
                    <li>Paste text into the analyzer</li>
                    <li>View real-time sentence statistics</li>
                    <li>Analyze sentence type distribution</li>
                    <li>Review readability metrics</li>
                    <li>Copy results for further use</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Understanding Sentence Types</h3>
                <div className="space-y-4 text-gray-600">
                  <div className="border-l-4 border-green-500 pl-4">
                    <h4 className="font-semibold text-gray-800 mb-2">Declarative Sentences</h4>
                    <p className="text-sm">Statements that provide information or express facts. They end with periods and make up most written content.</p>
                  </div>
                  <div className="border-l-4 border-purple-500 pl-4">
                    <h4 className="font-semibold text-gray-800 mb-2">Interrogative Sentences</h4>
                    <p className="text-sm">Questions that seek information or responses. They end with question marks and engage readers directly.</p>
                  </div>
                  <div className="border-l-4 border-orange-500 pl-4">
                    <h4 className="font-semibold text-gray-800 mb-2">Exclamatory Sentences</h4>
                    <p className="text-sm">Statements that express strong emotion or emphasis. They end with exclamation points and add energy to writing.</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Benefits of Sentence Analysis</h3>
                <div className="space-y-3 text-gray-600">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Improve content readability and flow</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Ensure proper sentence variety in writing</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Optimize content for better engagement</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Meet academic and professional standards</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Enhance SEO through improved readability</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Additional SEO Content Sections */}
          <div className="mt-12 space-y-8">
            {/* Who Uses Sentence Counters */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Who Uses Sentence Counter Tools?</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-gray-800">Content Writers & Bloggers</h4>
                    <p className="text-gray-600 text-sm">
                      Optimize blog posts, articles, and web content for better readability and engagement. Ensure sentence 
                      variety to keep readers interested and improve SEO performance through enhanced content quality.
                    </p>
                  </div>
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-gray-800">Students & Academics</h4>
                    <p className="text-gray-600 text-sm">
                      Improve academic writing, essays, and research papers by analyzing sentence structure. Meet assignment 
                      requirements and enhance writing clarity for better grades and academic success.
                    </p>
                  </div>
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-gray-800">Professional Writers</h4>
                    <p className="text-gray-600 text-sm">
                      Create compelling copy, reports, and documentation with optimal sentence structure. Maintain consistency 
                      across different content types and ensure professional writing standards.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Writing Quality Improvement */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
                <CardContent className="p-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">Improving Writing Quality</h3>
                  <div className="space-y-4 text-gray-600">
                    <p>
                      Sentence analysis reveals important patterns in your writing that directly impact readability and engagement. 
                      Our tool helps identify areas for improvement, ensuring your content resonates with readers.
                    </p>
                    <div className="bg-blue-50 rounded-lg p-4">
                      <h4 className="font-semibold text-blue-800 mb-2">Optimal Sentence Length</h4>
                      <p className="text-sm text-blue-700">
                        Aim for 15-20 words per sentence for optimal readability. Vary length to maintain reader interest 
                        and create natural flow in your writing.
                      </p>
                    </div>
                    <div className="bg-green-50 rounded-lg p-4">
                      <h4 className="font-semibold text-green-800 mb-2">Sentence Variety</h4>
                      <p className="text-sm text-green-700">
                        Mix declarative, interrogative, and exclamatory sentences to create dynamic, engaging content 
                        that keeps readers interested throughout.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
                <CardContent className="p-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">SEO and Readability Benefits</h3>
                  <div className="space-y-4 text-gray-600">
                    <p>
                      Search engines favor content with good readability scores. Our sentence counter helps optimize 
                      your content structure for both readers and search algorithms.
                    </p>
                    <div className="space-y-3">
                      <div className="bg-orange-50 rounded-lg p-4">
                        <h4 className="font-semibold text-orange-800 mb-2">Search Engine Optimization</h4>
                        <p className="text-sm text-orange-700">
                          Well-structured sentences improve content readability scores, which search engines use 
                          as ranking factors for better visibility.
                        </p>
                      </div>
                      <div className="bg-purple-50 rounded-lg p-4">
                        <h4 className="font-semibold text-purple-800 mb-2">User Experience</h4>
                        <p className="text-sm text-purple-700">
                          Proper sentence structure reduces bounce rates and increases time on page, 
                          improving overall user engagement metrics.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Advanced Features */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Advanced Sentence Analysis Features</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-gray-800">Real-time Analysis</h4>
                    <p className="text-gray-600 text-sm mb-4">
                      Get instant feedback as you type or edit your content. Our tool provides real-time sentence 
                      statistics, helping you make improvements on the fly.
                    </p>
                    
                    <h4 className="text-lg font-semibold text-gray-800">Comprehensive Statistics</h4>
                    <p className="text-gray-600 text-sm">
                      Beyond basic counting, our tool provides detailed metrics including average sentence length, 
                      longest and shortest sentences, and reading time estimates.
                    </p>
                  </div>
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-gray-800">Export Capabilities</h4>
                    <p className="text-gray-600 text-sm mb-4">
                      Copy analysis results for use in reports, documentation, or further analysis. Perfect for 
                      professional writing workflows and content planning.
                    </p>
                    
                    <h4 className="text-lg font-semibold text-gray-800">Sample Text Learning</h4>
                    <p className="text-gray-600 text-sm">
                      Use our sample text to understand how different sentence types and structures affect 
                      readability and engagement in your writing.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* FAQ Section */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Frequently Asked Questions</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">How accurate is the sentence counting?</h4>
                      <p className="text-gray-600 text-sm">Our algorithm uses advanced punctuation analysis to accurately identify sentence boundaries and types, providing reliable results for most English text content.</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">What is the ideal sentence length?</h4>
                      <p className="text-gray-600 text-sm">For most content, 15-20 words per sentence is optimal. However, varying length creates better flow and engagement in your writing.</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">Can I use this for academic writing?</h4>
                      <p className="text-gray-600 text-sm">Yes, our tool is perfect for academic writing, helping ensure proper sentence structure and meeting academic writing standards for essays and research papers.</p>
                    </div>
                  </div>
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">Is the sentence counter free to use?</h4>
                      <p className="text-gray-600 text-sm">Yes, our sentence counter is completely free with no registration required. You can analyze unlimited text and access all features.</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">How does this help with SEO?</h4>
                      <p className="text-gray-600 text-sm">Better sentence structure improves readability scores, which search engines consider for rankings. Well-structured content also increases user engagement.</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">Can I analyze multiple languages?</h4>
                      <p className="text-gray-600 text-sm">The tool works best with English text, as it relies on English punctuation patterns. Accuracy may vary for other languages with different sentence structures.</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Related Tools */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Related Text Analysis Tools</h3>
                <p className="text-gray-700 mb-8">Enhance your writing analysis with our comprehensive suite of text tools designed to improve content quality and readability.</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <a href="/tools/word-counter" className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl hover:shadow-lg transition-shadow group border border-blue-100">
                    <div className="w-12 h-12 bg-blue-600 text-white rounded-lg flex items-center justify-center mb-4 group-hover:bg-blue-700 transition-colors text-xl font-bold">
                      W
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-2 group-hover:text-blue-600">Word Counter</h4>
                    <p className="text-gray-600 text-sm">Count words, characters, and paragraphs with detailed reading time estimates and keyword density analysis.</p>
                  </a>
                  
                  <a href="/tools/character-counter" className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-xl hover:shadow-lg transition-shadow group border border-green-100">
                    <div className="w-12 h-12 bg-green-600 text-white rounded-lg flex items-center justify-center mb-4 group-hover:bg-green-700 transition-colors text-xl font-bold">
                      C
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-2 group-hover:text-green-600">Character Counter</h4>
                    <p className="text-gray-600 text-sm">Analyze character count, spaces, and special characters with social media optimization features.</p>
                  </a>
                  
                  <a href="/tools/paragraph-counter" className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl hover:shadow-lg transition-shadow group border border-purple-100">
                    <div className="w-12 h-12 bg-purple-600 text-white rounded-lg flex items-center justify-center mb-4 group-hover:bg-purple-700 transition-colors text-xl font-bold">
                      P
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-2 group-hover:text-purple-600">Paragraph Counter</h4>
                    <p className="text-gray-600 text-sm">Count and analyze paragraph structure for improved content organization and readability.</p>
                  </a>
                </div>
                
                <div className="mt-8 text-center">
                  <a href="/text" className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors">
                    View All Text Tools
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

export default SentenceCounter;
