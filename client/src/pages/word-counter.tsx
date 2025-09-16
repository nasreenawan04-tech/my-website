import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface WordCountResult {
  characters: number;
  charactersNoSpaces: number;
  words: number;
  sentences: number;
  paragraphs: number;
  lines: number;
  readingTime: number;
  speakingTime: number;
}

const WordCounter = () => {
  const [text, setText] = useState('');
  const [result, setResult] = useState<WordCountResult | null>(null);
  const [showAdvancedStats, setShowAdvancedStats] = useState(false);

  const calculateWordCount = (inputText: string): WordCountResult => {
    // Characters (including spaces)
    const characters = inputText.length;

    // Characters (excluding spaces)
    const charactersNoSpaces = inputText.replace(/\s/g, '').length;

    // Words - split by whitespace and filter out empty strings
    const words = inputText.trim() === '' ? 0 : inputText.trim().split(/\s+/).filter(word => word.length > 0).length;

    // Sentences - split by sentence-ending punctuation
    const sentences = inputText.trim() === '' ? 0 : inputText.split(/[.!?]+/).filter(sentence => sentence.trim().length > 0).length;

    // Paragraphs - split by double line breaks or single line breaks
    const paragraphs = inputText.trim() === '' ? 0 : inputText.split(/\n\s*\n/).filter(paragraph => paragraph.trim().length > 0).length;

    // Lines - split by line breaks
    const lines = inputText === '' ? 0 : inputText.split('\n').length;

    // Reading time (average 200 words per minute)
    const readingTime = Math.ceil(words / 200);

    // Speaking time (average 130 words per minute)
    const speakingTime = Math.ceil(words / 130);

    return {
      characters,
      charactersNoSpaces,
      words,
      sentences,
      paragraphs,
      lines,
      readingTime,
      speakingTime
    };
  };

  // Real-time calculation as user types
  useEffect(() => {
    const result = calculateWordCount(text);
    setResult(result);
  }, [text]);

  const handleClear = () => {
    setText('');
  };

  const handleCopy = () => {
    if (result) {
      const stats = `Text Statistics:
Words: ${result.words}
Characters: ${result.characters}
Characters (no spaces): ${result.charactersNoSpaces}
Sentences: ${result.sentences}
Paragraphs: ${result.paragraphs}
Lines: ${result.lines}
Reading time: ${result.readingTime} minute(s)
Speaking time: ${result.speakingTime} minute(s)`;

      navigator.clipboard.writeText(stats);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Helmet>
        <title>Word Counter - Count Words, Characters & Text Statistics | DapsiWow</title>
        <meta name="description" content="Free online word counter tool to count words, characters, sentences, paragraphs and calculate reading time. Real-time text analysis for writers, students and professionals." />
        <meta name="keywords" content="word counter, character counter, text statistics, word count tool, sentence counter, paragraph counter, reading time calculator, text analyzer" />
        <meta property="og:title" content="Word Counter - Count Words, Characters & Text Statistics" />
        <meta property="og:description" content="Free online word counter with real-time text analysis. Count words, characters, sentences and calculate reading time instantly." />
        <meta property="og:type" content="website" />
        <link rel="canonical" href="/tools/word-counter" />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            "name": "Word Counter",
            "description": "Free online word counter tool for counting words, characters, sentences, paragraphs with real-time analysis and reading time estimates.",
            "url": "https://dapsiwow.com/tools/word-counter",
            "applicationCategory": "UtilityApplication",
            "operatingSystem": "Any",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "USD"
            },
            "featureList": [
              "Real-time word counting",
              "Character analysis with and without spaces",
              "Sentence and paragraph counting",
              "Reading time estimation",
              "Speaking time calculation",
              "Text statistics export"
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
                <span className="text-sm font-medium text-blue-700">Professional Text Analysis</span>
              </div>
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-slate-900 leading-tight" data-testid="text-page-title">
                Smart Word
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                  Counter
                </span>
              </h1>
              <p className="text-xl sm:text-2xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
                Count words, characters, sentences, and paragraphs with real-time analysis and reading time estimates
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
                    <p className="text-gray-600">Enter your text to get instant word count and detailed statistics</p>
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
                      className="min-h-[300px] lg:min-h-[400px] text-base border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-blue-500 resize-none"
                      placeholder="Type or paste your text here to get instant word count and text statistics..."
                      data-testid="textarea-text-input"
                    />
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-4 pt-6">
                    <Button
                      onClick={handleClear}
                      variant="outline"
                      className="h-14 px-8 border-2 border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold text-lg rounded-xl"
                      data-testid="button-clear-text"
                    >
                      Clear Text
                    </Button>
                    <Button
                      onClick={handleCopy}
                      className="flex-1 h-14 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold text-lg rounded-xl shadow-lg transform transition-all duration-200 hover:scale-105"
                      disabled={!result || result.words === 0}
                      data-testid="button-copy-stats"
                    >
                      Copy Statistics
                    </Button>
                  </div>

                  {/* Advanced Options */}
                  {result && (
                    <div className="flex flex-wrap gap-3 pt-4">
                      <Button
                        onClick={() => setShowAdvancedStats(!showAdvancedStats)}
                        variant="outline"
                        size="sm"
                        className="rounded-full"
                        data-testid="button-show-advanced"
                      >
                        {showAdvancedStats ? 'Hide' : 'Show'} Advanced Statistics
                      </Button>
                    </div>
                  )}
                </div>

                {/* Results Section */}
                <div className="bg-gradient-to-br from-gray-50 to-blue-50 p-8 lg:p-12">
                  <h2 className="text-2xl font-bold text-gray-900 mb-8">Text Statistics</h2>

                  {result ? (
                    <div className="space-y-6" data-testid="text-statistics">
                      {/* Word Count Highlight */}
                      <div className="bg-white rounded-2xl p-6 shadow-lg border border-blue-100">
                        <div className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-2">Total Words</div>
                        <div className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600" data-testid="stat-words">
                          {result.words.toLocaleString()}
                        </div>
                      </div>

                      {/* Main Statistics */}
                      <div className="space-y-4">
                        <div className="bg-white rounded-xl p-4 shadow-sm">
                          <div className="flex justify-between items-center">
                            <span className="font-medium text-gray-700">Characters (with spaces)</span>
                            <span className="font-bold text-gray-900" data-testid="stat-characters">
                              {result.characters.toLocaleString()}
                            </span>
                          </div>
                        </div>
                        <div className="bg-white rounded-xl p-4 shadow-sm">
                          <div className="flex justify-between items-center">
                            <span className="font-medium text-gray-700">Characters (without spaces)</span>
                            <span className="font-bold text-purple-600" data-testid="stat-characters-no-spaces">
                              {result.charactersNoSpaces.toLocaleString()}
                            </span>
                          </div>
                        </div>
                        <div className="bg-white rounded-xl p-4 shadow-sm">
                          <div className="flex justify-between items-center">
                            <span className="font-medium text-gray-700">Sentences</span>
                            <span className="font-bold text-orange-600" data-testid="stat-sentences">
                              {result.sentences.toLocaleString()}
                            </span>
                          </div>
                        </div>
                        <div className="bg-white rounded-xl p-4 shadow-sm">
                          <div className="flex justify-between items-center">
                            <span className="font-medium text-gray-700">Paragraphs</span>
                            <span className="font-bold text-green-600" data-testid="stat-paragraphs">
                              {result.paragraphs.toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Advanced Statistics */}
                      {showAdvancedStats && (
                        <div className="space-y-4">
                          <div className="bg-white rounded-xl p-4 shadow-sm">
                            <div className="flex justify-between items-center">
                              <span className="font-medium text-gray-700">Lines</span>
                              <span className="font-bold text-gray-600" data-testid="stat-lines">
                                {result.lines.toLocaleString()}
                              </span>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Reading Time Analysis */}
                      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-6 border border-indigo-200">
                        <h4 className="font-bold text-indigo-800 mb-4 text-lg">Reading & Speaking Time</h4>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-indigo-700 font-medium">Reading time:</span>
                            <span className="font-bold text-indigo-800 text-lg" data-testid="stat-reading-time">
                              {result.readingTime} min
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-indigo-700 font-medium">Speaking time:</span>
                            <span className="font-bold text-indigo-800 text-lg" data-testid="stat-speaking-time">
                              {result.speakingTime} min
                            </span>
                          </div>
                          <div className="text-xs text-indigo-600 mt-2">
                            Based on 200 wpm reading, 130 wpm speaking
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-16" data-testid="no-results">
                      <div className="w-20 h-20 bg-gray-200 rounded-full mx-auto mb-6 flex items-center justify-center">
                        <div className="text-3xl font-bold text-gray-400">Aa</div>
                      </div>
                      <p className="text-gray-500 text-lg">Enter text above to see detailed statistics</p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Content Sections */}
          <div className="mt-16 space-y-12">
            {/* What is a Word Counter */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-6">What is a Word Counter Tool?</h2>
                <div className="prose max-w-none text-gray-700 space-y-4">
                  <p className="text-lg leading-relaxed">
                    A <strong>word counter</strong> is an essential digital tool that provides comprehensive text analysis
                    by calculating various statistical metrics about your written content. Unlike simple counting applications,
                    our advanced word counter delivers real-time insights including precise word counts, character analysis
                    (with and without spaces), sentence structure evaluation, paragraph organization assessment, and
                    estimated reading and speaking times.
                  </p>

                  <p className="leading-relaxed">
                    This powerful text analysis tool works instantaneously, automatically updating all statistics as you
                    type or paste content. The real-time functionality makes it indispensable for writers crafting novels,
                    students completing academic assignments, content creators developing blog posts, marketers creating
                    social media campaigns, and professionals preparing business documents with specific length requirements.
                  </p>

                  <p className="leading-relaxed">
                    Our word counter calculates reading time based on the standard adult reading speed of 200 words per
                    minute, while speaking time estimates use an average conversational pace of 130 words per minute.
                    These calculations are particularly valuable for content creators planning presentations, educators
                    preparing lectures, speakers timing their talks, and writers estimating content consumption duration
                    for their audiences.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Features and Benefits */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
                <CardContent className="p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Key Features</h2>
                  <div className="space-y-4">
                    <div className="border-l-4 border-blue-500 pl-4">
                      <h3 className="font-semibold text-gray-800 mb-2">Real-Time Analysis</h3>
                      <p className="text-gray-600 text-sm">Get instant feedback as you type with live word counting and text statistics that update automatically without page refreshes.</p>
                    </div>
                    <div className="border-l-4 border-green-500 pl-4">
                      <h3 className="font-semibold text-gray-800 mb-2">Comprehensive Statistics</h3>
                      <p className="text-gray-600 text-sm">Track multiple metrics including words, characters, sentences, paragraphs, lines, and time estimates in one location.</p>
                    </div>
                    <div className="border-l-4 border-purple-500 pl-4">
                      <h3 className="font-semibold text-gray-800 mb-2">Reading Time Calculator</h3>
                      <p className="text-gray-600 text-sm">Estimate how long it takes to read or speak your content based on standard reading and speaking speeds.</p>
                    </div>
                    <div className="border-l-4 border-orange-500 pl-4">
                      <h3 className="font-semibold text-gray-800 mb-2">Mobile Responsive</h3>
                      <p className="text-gray-600 text-sm">Count words and analyze text on any device with our fully responsive design optimized for desktop, tablet, and mobile.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
                <CardContent className="p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Why Use Our Tool?</h2>
                  <div className="space-y-4">
                    <div className="border-l-4 border-indigo-500 pl-4">
                      <h3 className="font-semibold text-gray-800 mb-2">Academic Excellence</h3>
                      <p className="text-gray-600 text-sm">Perfect for students who need to meet specific word count requirements for essays, research papers, and academic assignments.</p>
                    </div>
                    <div className="border-l-4 border-cyan-500 pl-4">
                      <h3 className="font-semibold text-gray-800 mb-2">Professional Content Creation</h3>
                      <p className="text-gray-600 text-sm">Ideal for copywriters, marketers, and content creators who need precise text metrics for various platforms and requirements.</p>
                    </div>
                    <div className="border-l-4 border-teal-500 pl-4">
                      <h3 className="font-semibold text-gray-800 mb-2">SEO Optimization</h3>
                      <p className="text-gray-600 text-sm">Optimize blog posts, meta descriptions, and web content by monitoring word counts for better search engine performance.</p>
                    </div>
                    <div className="border-l-4 border-rose-500 pl-4">
                      <h3 className="font-semibold text-gray-800 mb-2">Free and Accessible</h3>
                      <p className="text-gray-600 text-sm">No registration required, completely free to use, and accessible from any browser on any device worldwide.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Use Cases by Profession */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-8">Professional Use Cases</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="text-center p-6 bg-blue-50 rounded-xl">
                    <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                      S
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">Students</h3>
                    <p className="text-gray-600 text-sm">Meet essay requirements, track assignment progress, and ensure academic compliance with precise word count monitoring.</p>
                  </div>
                  <div className="text-center p-6 bg-green-50 rounded-xl">
                    <div className="w-16 h-16 bg-green-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                      W
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">Writers</h3>
                    <p className="text-gray-600 text-sm">Track daily writing goals, monitor novel progress, and optimize content length for different publishing platforms.</p>
                  </div>
                  <div className="text-center p-6 bg-purple-50 rounded-xl">
                    <div className="w-16 h-16 bg-purple-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                      M
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">Marketers</h3>
                    <p className="text-gray-600 text-sm">Create platform-specific content, optimize ad copy length, and ensure social media posts meet character limits.</p>
                  </div>
                  <div className="text-center p-6 bg-orange-50 rounded-xl">
                    <div className="w-16 h-16 bg-orange-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                      P
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">Professionals</h3>
                    <p className="text-gray-600 text-sm">Prepare business documents, create executive summaries, and ensure professional communication meets length requirements.</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Content Optimization Guide */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Content Length Guidelines</h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-4">Digital Content</h3>
                      <div className="space-y-3 text-gray-700">
                        <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                          <span className="font-medium">Blog Posts:</span>
                          <span className="text-blue-600 font-semibold">1,500-2,500 words</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                          <span className="font-medium">Social Media Posts:</span>
                          <span className="text-green-600 font-semibold">40-100 characters</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                          <span className="font-medium">Meta Descriptions:</span>
                          <span className="text-purple-600 font-semibold">150-160 characters</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
                          <span className="font-medium">Email Newsletters:</span>
                          <span className="text-orange-600 font-semibold">50-125 words</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-4">Academic Writing</h3>
                      <div className="space-y-3 text-gray-700">
                        <div className="flex justify-between items-center p-3 bg-indigo-50 rounded-lg">
                          <span className="font-medium">Short Essays:</span>
                          <span className="text-indigo-600 font-semibold">500-1,000 words</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-cyan-50 rounded-lg">
                          <span className="font-medium">Research Papers:</span>
                          <span className="text-cyan-600 font-semibold">3,000-5,000 words</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-teal-50 rounded-lg">
                          <span className="font-medium">Thesis Chapters:</span>
                          <span className="text-teal-600 font-semibold">8,000-12,000 words</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-rose-50 rounded-lg">
                          <span className="font-medium">Abstracts:</span>
                          <span className="text-rose-600 font-semibold">150-300 words</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* How to Use Guide */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-6">How to Use the Word Counter</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full flex items-center justify-center font-bold">1</div>
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-2">Enter Your Text</h3>
                        <p className="text-gray-600 text-sm">Type directly in the text area or paste content from any document, website, or application.</p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full flex items-center justify-center font-bold">2</div>
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-2">View Real-Time Results</h3>
                        <p className="text-gray-600 text-sm">Watch statistics update instantly as you type or edit your text content.</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full flex items-center justify-center font-bold">3</div>
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-2">Analyze Statistics</h3>
                        <p className="text-gray-600 text-sm">Review comprehensive text metrics including reading time and character analysis.</p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full flex items-center justify-center font-bold">4</div>
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-2">Export or Clear</h3>
                        <p className="text-gray-600 text-sm">Copy statistics for your records or clear the text to start analyzing new content.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* FAQ Section */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-8">Frequently Asked Questions</h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">How accurate is the word count?</h3>
                      <p className="text-gray-600 text-sm">Our word counter uses industry-standard algorithms identical to those used by Microsoft Word, Google Docs, and other professional writing software, ensuring consistent and accurate results.</p>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">What defines a word in the count?</h3>
                      <p className="text-gray-600 text-sm">A word is any sequence of characters separated by spaces, including numbers, abbreviations, hyphenated words, and contractions, each counted as individual words.</p>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">How is reading time calculated?</h3>
                      <p className="text-gray-600 text-sm">Reading time uses an average speed of 200 words per minute for adults, while speaking time is calculated at 130 words per minute based on conversational pace.</p>
                    </div>
                  </div>
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Is my text data secure and private?</h3>
                      <p className="text-gray-600 text-sm">Yes, all text analysis happens locally in your browser. Your content is never transmitted to our servers, stored, or shared with any third parties.</p>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Does the tool work with different languages?</h3>
                      <p className="text-gray-600 text-sm">Our word counter works with most languages that use space-separated words, including English, Spanish, French, German, and many other Latin script languages.</p>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Can I use this for academic writing?</h3>
                      <p className="text-gray-600 text-sm">Absolutely! Our tool is perfect for academic assignments, research papers, dissertations, and any writing with specific word count requirements.</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Related Tools */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Related Text Tools</h2>
                <p className="text-gray-600 mb-8">Enhance your text analysis workflow with our comprehensive suite of complementary tools.</p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <a href="/tools/character-counter" className="block bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-xl hover:shadow-lg transition-shadow group border border-blue-100">
                    <div className="w-12 h-12 bg-blue-600 text-white rounded-lg flex items-center justify-center mb-4 group-hover:bg-blue-700 transition-colors text-xl font-bold">
                      C
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-blue-600">Character Counter</h3>
                    <p className="text-gray-600 text-sm">Count characters with precision for social media posts, meta descriptions, and character-limited content.</p>
                  </a>

                  <a href="/tools/sentence-counter" className="block bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-xl hover:shadow-lg transition-shadow group border border-green-100">
                    <div className="w-12 h-12 bg-green-600 text-white rounded-lg flex items-center justify-center mb-4 group-hover:bg-green-700 transition-colors text-xl font-bold">
                      S
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-green-600">Sentence Counter</h3>
                    <p className="text-gray-600 text-sm">Analyze sentence structure and count sentences to improve readability and writing flow.</p>
                  </a>

                  <a href="/tools/paragraph-counter" className="block bg-gradient-to-br from-purple-50 to-violet-50 p-6 rounded-xl hover:shadow-lg transition-shadow group border border-purple-100">
                    <div className="w-12 h-12 bg-purple-600 text-white rounded-lg flex items-center justify-center mb-4 group-hover:bg-purple-700 transition-colors text-xl font-bold">
                      P
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-purple-600">Paragraph Counter</h3>
                    <p className="text-gray-600 text-sm">Count paragraphs and analyze text structure for better content organization and formatting.</p>
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

export default WordCounter;