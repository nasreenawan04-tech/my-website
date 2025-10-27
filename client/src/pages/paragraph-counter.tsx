import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';

interface ParagraphCountResult {
  totalParagraphs: number;
  shortParagraphs: number;
  mediumParagraphs: number;
  longParagraphs: number;
  averageWordsPerParagraph: number;
  averageSentencesPerParagraph: number;
  averageCharactersPerParagraph: number;
  longestParagraph: number;
  shortestParagraph: number;
  words: number;
  sentences: number;
  characters: number;
  lines: number;
  readingTime: number;
}

const ParagraphCounter = () => {
  const [text, setText] = useState('');
  const [showDetails, setShowDetails] = useState(false);
  const [result, setResult] = useState<ParagraphCountResult | null>(null);

  const calculateParagraphCount = (inputText: string): ParagraphCountResult => {
    if (inputText.trim() === '') {
      return {
        totalParagraphs: 0,
        shortParagraphs: 0,
        mediumParagraphs: 0,
        longParagraphs: 0,
        averageWordsPerParagraph: 0,
        averageSentencesPerParagraph: 0,
        averageCharactersPerParagraph: 0,
        longestParagraph: 0,
        shortestParagraph: 0,
        words: 0,
        sentences: 0,
        characters: 0,
        lines: 0,
        readingTime: 0
      };
    }

    // Split text into paragraphs - handle both double line breaks and single line text
    let paragraphs = inputText.split(/\n\s*\n/).filter(paragraph => paragraph.trim().length > 0);

    // If no double line breaks found, treat single line text as one paragraph
    if (paragraphs.length === 0 && inputText.trim().length > 0) {
      paragraphs = [inputText.trim()];
    }

    const totalParagraphs = paragraphs.length;

    // Calculate word counts for each paragraph
    const paragraphWordCounts = paragraphs.map(paragraph => {
      return paragraph.trim().split(/\s+/).filter(word => word.length > 0).length;
    });

    // Calculate sentence counts for each paragraph
    const paragraphSentenceCounts = paragraphs.map(paragraph => {
      return paragraph.split(/[.!?]+/).filter(sentence => sentence.trim().length > 0).length;
    });

    // Calculate character counts for each paragraph
    const paragraphCharacterCounts = paragraphs.map(paragraph => paragraph.length);

    // Categorize paragraphs by length (words)
    const shortParagraphs = paragraphWordCounts.filter(count => count <= 50).length;
    const mediumParagraphs = paragraphWordCounts.filter(count => count > 50 && count <= 150).length;
    const longParagraphs = paragraphWordCounts.filter(count => count > 150).length;

    // Calculate averages
    const totalWords = paragraphWordCounts.reduce((sum, count) => sum + count, 0);
    const totalSentences = paragraphSentenceCounts.reduce((sum, count) => sum + count, 0);
    const totalCharacters = paragraphCharacterCounts.reduce((sum, count) => sum + count, 0);

    const averageWordsPerParagraph = totalParagraphs > 0 ? Math.round(totalWords / totalParagraphs) : 0;
    const averageSentencesPerParagraph = totalParagraphs > 0 ? Math.round((totalSentences / totalParagraphs) * 10) / 10 : 0;
    const averageCharactersPerParagraph = totalParagraphs > 0 ? Math.round(totalCharacters / totalParagraphs) : 0;

    // Find longest and shortest paragraphs (by word count)
    const longestParagraph = paragraphWordCounts.length > 0 ? Math.max(...paragraphWordCounts) : 0;
    const shortestParagraph = paragraphWordCounts.length > 0 ? Math.min(...paragraphWordCounts) : 0;

    // Calculate other text statistics
    const words = inputText.trim().split(/\s+/).filter(word => word.length > 0).length;
    const sentences = inputText.split(/[.!?]+/).filter(sentence => sentence.trim().length > 0).length;
    const characters = inputText.length;
    const lines = inputText === '' ? 0 : inputText.split('\n').length;
    const readingTime = Math.ceil(words / 200);

    return {
      totalParagraphs,
      shortParagraphs,
      mediumParagraphs,
      longParagraphs,
      averageWordsPerParagraph,
      averageSentencesPerParagraph,
      averageCharactersPerParagraph,
      longestParagraph,
      shortestParagraph,
      words,
      sentences,
      characters,
      lines,
      readingTime
    };
  };

  // Real-time calculation as user types
  useEffect(() => {
    const result = calculateParagraphCount(text);
    setResult(result);
  }, [text]);

  const handleClear = () => {
    setText('');
  };

  const handleCopy = () => {
    if (result) {
      const stats = `Paragraph Count Statistics:
Total Paragraphs: ${result.totalParagraphs}
Short Paragraphs (≤50 words): ${result.shortParagraphs}
Medium Paragraphs (51-150 words): ${result.mediumParagraphs}
Long Paragraphs (>150 words): ${result.longParagraphs}
Average Words per Paragraph: ${result.averageWordsPerParagraph}
Average Sentences per Paragraph: ${result.averageSentencesPerParagraph}
Average Characters per Paragraph: ${result.averageCharactersPerParagraph}
Longest Paragraph: ${result.longestParagraph} words
Shortest Paragraph: ${result.shortestParagraph} words
Total Words: ${result.words}
Total Sentences: ${result.sentences}
Total Characters: ${result.characters}
Total Lines: ${result.lines}
Reading Time: ${result.readingTime} minute(s)`;

      navigator.clipboard.writeText(stats);
    }
  };

  const handleSampleText = () => {
    const sample = `Welcome to DapsiWow's Paragraph Counter! This tool helps you analyze the structure of your text by counting paragraphs and providing detailed insights about paragraph composition.

This is the second paragraph of our sample text. It demonstrates how the tool can identify different paragraphs separated by line breaks. The paragraph counter will analyze each paragraph individually to give you comprehensive statistics.

Here's a third paragraph that shows how our tool works with multiple paragraphs of varying lengths. Some paragraphs might be short and concise, while others could be much longer and more detailed, containing multiple sentences that express complex ideas and provide extensive information about a particular topic.

Finally, this last paragraph completes our sample text, giving you four distinct paragraphs to analyze. Each paragraph serves a different purpose and has a different length, which will help demonstrate the various statistics and categorizations that our paragraph counter provides.`;
    setText(sample);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Helmet>
        <title>Paragraph Counter - Count Paragraphs & Text Structure Analysis | DapsiWow</title>
        <meta name="description" content="Free online paragraph counter tool to analyze text structure, count paragraphs, and get detailed paragraph statistics for better writing and content organization." />
        <meta name="keywords" content="paragraph counter, text structure analysis, paragraph count tool, writing analysis, paragraph statistics, content structure, document analysis, text organization" />
        <meta property="og:title" content="Paragraph Counter - Count Paragraphs & Text Structure Analysis | DapsiWow" />
        <meta property="og:description" content="Free paragraph counter with detailed text structure analysis. Count paragraphs and analyze text composition instantly with our professional tool." />
        <meta property="og:type" content="website" />
        <meta name="robots" content="index, follow" />
        <meta name="author" content="DapsiWow" />
        <link rel="canonical" href="https://dapsiwow.com/tools/paragraph-counter" />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            "name": "Paragraph Counter",
            "description": "Free online paragraph counter tool to analyze text structure, count paragraphs, and get detailed paragraph statistics for better writing and content organization.",
            "url": "https://dapsiwow.com/tools/paragraph-counter",
            "applicationCategory": "UtilityApplication",
            "operatingSystem": "Any",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "USD"
            },
            "featureList": [
              "Real-time paragraph counting",
              "Paragraph length categorization",
              "Text structure analysis",
              "Reading time estimation",
              "Detailed paragraph statistics",
              "Writing insights and metrics"
            ]
          })}
        </script>
      </Helmet>

      <Header />

      <main>
        {/* Hero Section */}
        <section className="relative py-8 sm:py-12 md:py-16 lg:py-20 xl:py-24 2xl:py-32 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-indigo-600/20"></div>
          <div className="relative max-w-5xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 text-center">
            <div className="space-y-4 sm:space-y-6 md:space-y-8">
              <div className="inline-flex items-center px-2 sm:px-3 md:px-4 py-1 sm:py-1.5 md:py-2 bg-white/80 backdrop-blur-sm rounded-full border border-blue-200">
                <span className="text-xs sm:text-sm font-medium text-blue-700">Professional Text Analysis</span>
              </div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl 2xl:text-7xl font-bold text-slate-900 leading-tight tracking-tight px-2 sm:px-0" data-testid="page-title">
                <span className="block">Paragraph</span>
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 mt-1 sm:mt-2">
                  Counter
                </span>
              </h1>
              <p className="text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl 2xl:text-2xl text-slate-600 max-w-xs sm:max-w-sm md:max-w-lg lg:max-w-2xl xl:max-w-3xl 2xl:max-w-4xl mx-auto leading-relaxed px-3 sm:px-2 md:px-0">
                Analyze text structure, count paragraphs, and get detailed insights for better content organization
              </p>
            </div>
          </div>
        </section>

        <div className="w-full max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-6 sm:py-8 md:py-12 lg:py-16">
          {/* Main Calculator Card */}
          <Card className="bg-white/90 backdrop-blur-sm shadow-2xl border-0 rounded-xl sm:rounded-2xl md:rounded-3xl overflow-hidden">
            <CardContent className="p-0">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-0">
                {/* Input Section */}
                <div className="lg:col-span-2 p-3 sm:p-4 md:p-6 lg:p-8 xl:p-10 2xl:p-12 space-y-4 sm:space-y-6 md:space-y-8">
                  <div className="text-center sm:text-left">
                    <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">Text Analysis</h2>
                    <p className="text-sm sm:text-base text-gray-600">Enter your text to get instant paragraph statistics and structure analysis</p>
                  </div>

                  <div className="space-y-4 sm:space-y-6">
                    {/* Text Area */}
                    <div className="space-y-2 sm:space-y-3">
                      <Label htmlFor="text-input" className="text-xs sm:text-sm font-semibold text-gray-800 uppercase tracking-wide">
                        Text to Analyze
                      </Label>
                      <Textarea
                        id="text-input"
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        className="min-h-[250px] sm:min-h-[300px] lg:min-h-[400px] text-sm sm:text-base border-2 border-gray-200 rounded-lg sm:rounded-xl focus:border-blue-500 focus:ring-blue-500 resize-none"
                        placeholder="Type or paste your text here to get instant paragraph count and detailed text structure analysis..."
                        data-testid="textarea-text-input"
                      />
                    </div>

                    {/* Options */}
                    <div className="space-y-3 sm:space-y-4 bg-gray-50 rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-6">
                      <div className="flex items-start sm:items-center space-x-2 sm:space-x-3">
                        <Checkbox
                          id="show-details"
                          checked={showDetails}
                          onCheckedChange={(checked) => setShowDetails(checked === true)}
                          className="h-4 w-4 text-blue-600 border-2 border-gray-300 rounded focus:ring-blue-500 flex-shrink-0 mt-0.5 sm:mt-0"
                          data-testid="checkbox-show-details"
                        />
                        <div className="flex-1">
                          <Label htmlFor="show-details" className="text-xs sm:text-sm font-semibold text-gray-800 uppercase tracking-wide cursor-pointer">
                            Enable Detailed Analysis
                          </Label>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row justify-center items-stretch sm:items-center gap-2 sm:gap-3 md:gap-4 pt-3 sm:pt-4 md:pt-6">
                    <Button
                      onClick={handleSampleText}
                      className="w-full sm:w-auto min-w-0 sm:min-w-[120px] md:min-w-[140px] h-11 sm:h-12 md:h-14 px-4 sm:px-6 md:px-8 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold text-sm sm:text-base md:text-lg rounded-lg sm:rounded-xl shadow-lg transform transition-all duration-200 hover:scale-105 active:scale-95"
                      data-testid="button-sample-text"
                    >
                      <span className="truncate">Sample Text</span>
                    </Button>
                    <Button
                      onClick={handleClear}
                      variant="outline"
                      className="w-full sm:w-auto min-w-0 sm:min-w-[100px] md:min-w-[120px] h-11 sm:h-12 md:h-14 px-4 sm:px-6 md:px-8 border-2 border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold text-sm sm:text-base md:text-lg rounded-lg sm:rounded-xl transition-all duration-200 active:scale-95"
                      data-testid="button-clear-text"
                    >
                      Clear
                    </Button>
                    <Button
                      onClick={handleCopy}
                      variant="outline"
                      className="w-full sm:w-auto min-w-0 sm:min-w-[120px] md:min-w-[140px] h-11 sm:h-12 md:h-14 px-4 sm:px-6 md:px-8 border-2 border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold text-sm sm:text-base md:text-lg rounded-lg sm:rounded-xl transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={!result || result.totalParagraphs === 0}
                      data-testid="button-copy-stats"
                    >
                      <span className="truncate">Copy Stats</span>
                    </Button>
                  </div>
                </div>

                {/* Results Section */}
                <div className="bg-gradient-to-br from-gray-50 to-blue-50 p-3 sm:p-4 md:p-6 lg:p-8 xl:p-10 2xl:p-12 border-t lg:border-t-0 lg:border-l">
                  <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 mb-4 sm:mb-6 md:mb-8 text-center sm:text-left">Results</h2>

                  {result ? (
                    <div className="space-y-4 sm:space-y-6" data-testid="paragraph-statistics">
                      {/* Main Paragraph Count Highlight */}
                      <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg border border-blue-100">
                        <div className="text-xs sm:text-sm font-semibold text-gray-600 uppercase tracking-wide mb-2">Total Paragraphs</div>
                        <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600" data-testid="stat-total-paragraphs">
                          {result.totalParagraphs.toLocaleString()}
                        </div>
                      </div>

                      {/* Category Breakdown */}
                      <div className="space-y-3 sm:space-y-4">
                        <div className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 shadow-sm">
                          <div className="flex justify-between items-center gap-2">
                            <span className="font-medium text-gray-700 text-xs sm:text-sm md:text-base">Short Paragraphs (≤50 words)</span>
                            <span className="font-bold text-green-600 text-sm sm:text-base md:text-lg" data-testid="stat-short-paragraphs">
                              {result.shortParagraphs.toLocaleString()}
                            </span>
                          </div>
                        </div>
                        <div className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 shadow-sm">
                          <div className="flex justify-between items-center gap-2">
                            <span className="font-medium text-gray-700 text-xs sm:text-sm md:text-base">Medium Paragraphs (51-150)</span>
                            <span className="font-bold text-yellow-600 text-sm sm:text-base md:text-lg" data-testid="stat-medium-paragraphs">
                              {result.mediumParagraphs.toLocaleString()}
                            </span>
                          </div>
                        </div>
                        <div className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 shadow-sm">
                          <div className="flex justify-between items-center gap-2">
                            <span className="font-medium text-gray-700 text-xs sm:text-sm md:text-base">Long Paragraphs (&gt;150 words)</span>
                            <span className="font-bold text-red-600 text-sm sm:text-base md:text-lg" data-testid="stat-long-paragraphs">
                              {result.longParagraphs.toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Quick Stats */}
                      <div className="space-y-3 sm:space-y-4">
                        <div className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 shadow-sm">
                          <div className="flex justify-between items-center gap-2">
                            <span className="font-medium text-gray-700 text-xs sm:text-sm md:text-base">Total Words</span>
                            <span className="font-bold text-gray-900 text-sm sm:text-base md:text-lg" data-testid="stat-words">
                              {result.words.toLocaleString()}
                            </span>
                          </div>
                        </div>
                        <div className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 shadow-sm">
                          <div className="flex justify-between items-center gap-2">
                            <span className="font-medium text-gray-700 text-xs sm:text-sm md:text-base">Reading Time</span>
                            <span className="font-bold text-gray-900 text-sm sm:text-base md:text-lg" data-testid="stat-reading-time">
                              {result.readingTime} min
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Detailed Analysis */}
                      {showDetails && (
                        <div className="space-y-3 sm:space-y-4">
                          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg sm:rounded-xl p-4 sm:p-6 border border-indigo-200">
                            <h4 className="font-bold text-indigo-800 mb-3 sm:mb-4 text-sm sm:text-base md:text-lg">Average Statistics</h4>
                            <div className="space-y-2 sm:space-y-3">
                              <div className="flex justify-between items-center gap-2">
                                <span className="text-indigo-700 font-medium text-xs sm:text-sm">Words per Paragraph:</span>
                                <span className="font-bold text-indigo-800 text-sm sm:text-base md:text-lg" data-testid="stat-avg-words">
                                  {result.averageWordsPerParagraph.toLocaleString()}
                                </span>
                              </div>
                              <div className="flex justify-between items-center gap-2">
                                <span className="text-indigo-700 font-medium text-xs sm:text-sm">Sentences per Paragraph:</span>
                                <span className="font-bold text-indigo-800 text-sm sm:text-base md:text-lg" data-testid="stat-avg-sentences">
                                  {result.averageSentencesPerParagraph}
                                </span>
                              </div>
                              <div className="flex justify-between items-center gap-2">
                                <span className="text-indigo-700 font-medium text-xs sm:text-sm">Characters per Paragraph:</span>
                                <span className="font-bold text-indigo-800 text-sm sm:text-base md:text-lg" data-testid="stat-avg-characters">
                                  {result.averageCharactersPerParagraph.toLocaleString()}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-lg sm:rounded-xl p-4 sm:p-6 border border-orange-200">
                            <h4 className="font-bold text-orange-800 mb-3 sm:mb-4 text-sm sm:text-base md:text-lg">Length Range</h4>
                            <div className="space-y-2 sm:space-y-3">
                              <div className="flex justify-between items-center gap-2">
                                <span className="text-orange-700 font-medium text-xs sm:text-sm">Longest Paragraph:</span>
                                <span className="font-bold text-orange-800 text-sm sm:text-base md:text-lg" data-testid="stat-longest">
                                  {result.longestParagraph.toLocaleString()} words
                                </span>
                              </div>
                              <div className="flex justify-between items-center gap-2">
                                <span className="text-orange-700 font-medium text-xs sm:text-sm">Shortest Paragraph:</span>
                                <span className="font-bold text-orange-800 text-sm sm:text-base md:text-lg" data-testid="stat-shortest">
                                  {result.shortestParagraph.toLocaleString()} words
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-8 sm:py-12 md:py-16" data-testid="no-results">
                      <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-200 rounded-full mx-auto mb-4 sm:mb-6 flex items-center justify-center">
                        <div className="text-2xl sm:text-3xl font-bold text-gray-400">¶</div>
                      </div>
                      <p className="text-gray-500 text-sm sm:text-base md:text-lg px-4">Enter text to see paragraph analysis</p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* SEO Content Sections */}
          <div className="mt-16 grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">What is a Paragraph Counter?</h3>
                <div className="space-y-4 text-gray-600">
                  <p>
                    A paragraph counter is a specialized text analysis tool that counts and examines the structural organization 
                    of written content. Unlike basic word counters or character counters, our paragraph counter provides 
                    comprehensive insights into text structure, paragraph distribution, and content organization patterns.
                  </p>
                  <p>
                    This advanced tool categorizes paragraphs by length (short, medium, long), calculates reading time, 
                    and provides detailed statistics about your writing composition. It's essential for writers, editors, 
                    students, and content creators who need to optimize text structure for better readability and engagement.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">How to Use Our Paragraph Counter</h3>
                <div className="space-y-4 text-gray-600">
                  <p>
                    Using our paragraph counter is simple and intuitive. Simply paste or type your text into the input area, 
                    and the tool will instantly analyze your content structure. The real-time analysis provides immediate 
                    feedback as you type or edit your text.
                  </p>
                  <ul className="space-y-2 list-disc list-inside">
                    <li>Paste your text into the analysis area</li>
                    <li>View real-time paragraph counts and categorization</li>
                    <li>Enable detailed analysis for comprehensive statistics</li>
                    <li>Copy results for documentation or reports</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Benefits of Paragraph Analysis</h3>
                <div className="space-y-3 text-gray-600">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Improve content structure and readability</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Ensure balanced paragraph distribution</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Meet academic and professional formatting requirements</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Optimize content for different audiences and platforms</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Enhance reader engagement and comprehension</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Features of Our Tool</h3>
                <div className="space-y-3 text-gray-600">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Real-time paragraph counting and analysis</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Automatic paragraph length categorization</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Detailed statistical analysis and insights</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Reading time estimation for content planning</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Free to use with no registration required</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Additional SEO Content Sections */}
          <div className="mt-12 space-y-8">
            {/* Who Benefits Section */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-8">Who Benefits from Paragraph Analysis?</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Students & Academics */}
                  <div className="bg-blue-50 rounded-xl p-6">
                    <h4 className="text-xl font-bold text-blue-800 mb-4">Students & Academics</h4>
                    <ul className="space-y-3 text-gray-700">
                      <li className="flex items-start space-x-2">
                        <span className="text-blue-600 font-bold">•</span>
                        <span>Ensure essays meet paragraph count requirements</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <span className="text-blue-600 font-bold">•</span>
                        <span>Analyze thesis and dissertation structure</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <span className="text-blue-600 font-bold">•</span>
                        <span>Improve academic writing flow and organization</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <span className="text-blue-600 font-bold">•</span>
                        <span>Meet formatting guidelines for assignments</span>
                      </li>
                    </ul>
                  </div>

                  {/* Content Creators */}
                  <div className="bg-green-50 rounded-xl p-6">
                    <h4 className="text-xl font-bold text-green-800 mb-4">Content Creators</h4>
                    <ul className="space-y-3 text-gray-700">
                      <li className="flex items-start space-x-2">
                        <span className="text-green-600 font-bold">•</span>
                        <span>Optimize blog posts for better readability</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <span className="text-green-600 font-bold">•</span>
                        <span>Ensure content meets platform requirements</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <span className="text-green-600 font-bold">•</span>
                        <span>Improve user engagement and retention</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <span className="text-green-600 font-bold">•</span>
                        <span>Analyze competitor content structures</span>
                      </li>
                    </ul>
                  </div>

                  {/* Professional Writers */}
                  <div className="bg-purple-50 rounded-xl p-6">
                    <h4 className="text-xl font-bold text-purple-800 mb-4">Professional Writers</h4>
                    <ul className="space-y-3 text-gray-700">
                      <li className="flex items-start space-x-2">
                        <span className="text-purple-600 font-bold">•</span>
                        <span>Maintain consistent narrative pacing</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <span className="text-purple-600 font-bold">•</span>
                        <span>Balance dialogue and narrative paragraphs</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <span className="text-purple-600 font-bold">•</span>
                        <span>Ensure proper chapter structure</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <span className="text-purple-600 font-bold">•</span>
                        <span>Optimize reader engagement patterns</span>
                      </li>
                    </ul>
                  </div>

                  {/* Business Professionals */}
                  <div className="bg-orange-50 rounded-xl p-6">
                    <h4 className="text-xl font-bold text-orange-800 mb-4">Business Professionals</h4>
                    <ul className="space-y-3 text-gray-700">
                      <li className="flex items-start space-x-2">
                        <span className="text-orange-600 font-bold">•</span>
                        <span>Structure reports and proposals effectively</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <span className="text-orange-600 font-bold">•</span>
                        <span>Optimize executive summaries</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <span className="text-orange-600 font-bold">•</span>
                        <span>Meet corporate communication standards</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <span className="text-orange-600 font-bold">•</span>
                        <span>Improve presentation documentation</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Writing Guidelines */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Paragraph Writing Best Practices</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <h4 className="text-xl font-semibold text-gray-900 mb-4">Structure Guidelines</h4>
                    <div className="space-y-4">
                      <div className="bg-yellow-50 rounded-lg p-4 border-l-4 border-yellow-400">
                        <h5 className="font-semibold text-yellow-800 mb-2">One Main Idea</h5>
                        <p className="text-yellow-700 text-sm">Each paragraph should focus on a single main idea or topic to maintain clarity and coherence.</p>
                      </div>
                      <div className="bg-green-50 rounded-lg p-4 border-l-4 border-green-400">
                        <h5 className="font-semibold text-green-800 mb-2">Vary Length</h5>
                        <p className="text-green-700 text-sm">Mix short, medium, and long paragraphs to create rhythm and maintain reader interest.</p>
                      </div>
                      <div className="bg-blue-50 rounded-lg p-4 border-l-4 border-blue-400">
                        <h5 className="font-semibold text-blue-800 mb-2">Use Transitions</h5>
                        <p className="text-blue-700 text-sm">Connect paragraphs with smooth transitions to maintain logical flow throughout your content.</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-xl font-semibold text-gray-900 mb-4">Length Recommendations</h4>
                    <div className="space-y-4">
                      <div className="bg-white rounded-lg p-4 border border-gray-200">
                        <h5 className="font-semibold text-gray-900 mb-2">Academic Writing</h5>
                        <p className="text-gray-600 text-sm">4-8 sentences (100-200 words) for most academic paragraphs, with longer paragraphs for complex arguments.</p>
                      </div>
                      <div className="bg-white rounded-lg p-4 border border-gray-200">
                        <h5 className="font-semibold text-gray-900 mb-2">Web Content</h5>
                        <p className="text-gray-600 text-sm">2-4 sentences (50-100 words) for better online readability and mobile viewing experience.</p>
                      </div>
                      <div className="bg-white rounded-lg p-4 border border-gray-200">
                        <h5 className="font-semibold text-gray-900 mb-2">Business Writing</h5>
                        <p className="text-gray-600 text-sm">3-5 sentences (75-150 words) for professional documents, reports, and proposals.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* FAQ Section */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-8">Frequently Asked Questions</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">How does the tool identify paragraphs?</h4>
                      <p className="text-gray-600 text-sm">Paragraphs are identified by double line breaks (blank lines between text blocks). This is the standard method used in most word processors and publishing formats.</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">What do the length categories mean?</h4>
                      <p className="text-gray-600 text-sm">Short paragraphs have 50 words or fewer, medium paragraphs have 51-150 words, and long paragraphs have more than 150 words. These categories help analyze text density and readability.</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">How accurate are the statistics?</h4>
                      <p className="text-gray-600 text-sm">Our paragraph counter uses precise algorithms to count and analyze text structure. All statistics are calculated in real-time and provide accurate measurements.</p>
                    </div>
                  </div>
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">Can I use this for different document types?</h4>
                      <p className="text-gray-600 text-sm">Yes! This tool works with any type of text including essays, articles, reports, stories, and academic papers. It's perfect for analyzing any document structure.</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">Is the reading time calculation accurate?</h4>
                      <p className="text-gray-600 text-sm">Reading time is estimated based on an average reading speed of 200 words per minute, which is standard for adult readers. Actual reading time may vary.</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">Can I export the analysis results?</h4>
                      <p className="text-gray-600 text-sm">Yes, you can copy all paragraph statistics to your clipboard using the "Copy Stats" button for use in reports or documentation.</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Related Tools */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Related Text Analysis Tools</h3>
                <p className="text-gray-600 mb-8">Enhance your writing analysis with our comprehensive suite of text tools:</p>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="bg-blue-50 rounded-lg p-4 text-center hover:bg-blue-100 transition-colors">
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">
                      <a href="/tools/word-counter" className="text-blue-600 hover:text-blue-800 transition-colors">
                        Word Counter
                      </a>
                    </h4>
                    <p className="text-gray-600 text-sm">Count words, characters, and analyze basic text statistics for any content type.</p>
                  </div>

                  <div className="bg-green-50 rounded-lg p-4 text-center hover:bg-green-100 transition-colors">
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">
                      <a href="/tools/sentence-counter" className="text-green-600 hover:text-green-800 transition-colors">
                        Sentence Counter
                      </a>
                    </h4>
                    <p className="text-gray-600 text-sm">Analyze sentence structure, count sentences, and improve text flow and readability.</p>
                  </div>

                  <div className="bg-purple-50 rounded-lg p-4 text-center hover:bg-purple-100 transition-colors">
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">
                      <a href="/tools/character-counter" className="text-purple-600 hover:text-purple-800 transition-colors">
                        Character Counter
                      </a>
                    </h4>
                    <p className="text-gray-600 text-sm">Precise character counting for social media, forms, and length-restricted content.</p>
                  </div>
                </div>

                <div className="mt-6 text-center">
                  <a href="/tools" className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium transition-colors">
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

export default ParagraphCounter;