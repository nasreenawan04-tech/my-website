
import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { WordCountResult, analyzeText } from '@/types/text-tool.types';

const WordCounter = () => {
  const [text, setText] = useState('');
  const [result, setResult] = useState<WordCountResult | null>(null);
  const [showAdvancedStats, setShowAdvancedStats] = useState(false);

  const calculateWordCount = (inputText: string): WordCountResult => {
    const analysis = analyzeText(inputText);
    
    return {
      ...analysis,
      characters: analysis.totalCharacters,
      charactersNoSpaces: analysis.charactersWithoutSpaces,
    } as WordCountResult;
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
Characters (with spaces): ${result.characters}
Characters (without spaces): ${result.charactersNoSpaces}
Sentences: ${result.sentences}
Paragraphs: ${result.paragraphs}
Lines: ${result.lines}
Average word length: ${result.averageWordLength} characters
Average words per sentence: ${result.averageWordsPerSentence}
Longest word: ${result.longestWord} characters
Shortest word: ${result.shortestWord} characters
Unique words: ${result.uniqueWords}
Reading time: ${result.readingTime} minute(s)
Speaking time: ${result.speakingTime} minute(s)`;

      navigator.clipboard.writeText(stats);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Helmet>
        {/* Primary Meta Tags */}
        <title>Word Counter - Free Text Analysis Tool | DapsiWow</title>
        <meta name="description" content="Free online word counter tool to count words, characters, sentences, paragraphs and calculate reading time. Real-time text analysis for writers, students and professionals." />
        <meta name="keywords" content="word counter, character counter, text statistics, word count tool, sentence counter, paragraph counter, reading time calculator, text analyzer" />
        <link rel="canonical" href="https://dapsiwow.com/tools/word-counter" />
        <meta name="robots" content="index, follow" />
        <meta name="author" content="DapsiWow" />
        <meta name="publisher" content="DapsiWow" />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://dapsiwow.com/tools/word-counter" />
        <meta property="og:title" content="Word Counter - Free Text Analysis Tool | DapsiWow" />
        <meta property="og:description" content="Free online word counter with real-time text analysis. Count words, characters, sentences and calculate reading time instantly." />
        <meta property="og:image" content="https://dapsiwow.com/images/word-counter-og.jpg" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:alt" content="DapsiWow Word Counter - Free Text Analysis Tool" />
        <meta property="og:site_name" content="DapsiWow" />
        <meta property="og:locale" content="en_US" />
        
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:url" content="https://dapsiwow.com/tools/word-counter" />
        <meta name="twitter:title" content="Word Counter - Free Text Analysis Tool | DapsiWow" />
        <meta name="twitter:description" content="Free word counter with real-time text analysis. Count words, characters, sentences, and reading time." />
        <meta name="twitter:image" content="https://dapsiwow.com/images/word-counter-og.jpg" />
        <meta name="twitter:image:alt" content="DapsiWow Word Counter" />
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

        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": [
              {
                "@type": "ListItem",
                "position": 1,
                "name": "Home",
                "item": "https://dapsiwow.com"
              },
              {
                "@type": "ListItem",
                "position": 2,
                "name": "Text Tools",
                "item": "https://dapsiwow.com/text-tools"
              },
              {
                "@type": "ListItem",
                "position": 3,
                "name": "Word Counter",
                "item": "https://dapsiwow.com/tools/word-counter"
              }
            ]
          })}
        </script>

        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "HowTo",
            "name": "How to Count Words and Analyze Text",
            "description": "Step-by-step guide to use our free word counter tool for text analysis",
            "step": [
              {
                "@type": "HowToStep",
                "name": "Enter or Paste Text",
                "text": "Type or paste your text directly into the text area. The tool supports unlimited text length for comprehensive analysis."
              },
              {
                "@type": "HowToStep",
                "name": "View Real-Time Statistics",
                "text": "As you type, watch real-time updates of word count, character count, sentences, paragraphs, and reading time estimates."
              },
              {
                "@type": "HowToStep",
                "name": "Analyze Advanced Metrics",
                "text": "Review detailed statistics including unique words, average word length, words per sentence, and longest/shortest words."
              },
              {
                "@type": "HowToStep",
                "name": "Export or Clear Data",
                "text": "Copy the statistics for your records or clear the text area to analyze new content."
              }
            ]
          })}
        </script>

        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": [
              {
                "@type": "Question",
                "name": "How accurate is the word count?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Our word counter uses industry-standard algorithms identical to those used by Microsoft Word, Google Docs, and other professional writing software, ensuring consistent and accurate results."
                }
              },
              {
                "@type": "Question",
                "name": "What defines a word in the count?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "A word is any sequence of characters separated by spaces, including numbers, abbreviations, hyphenated words, and contractions, each counted as individual words."
                }
              },
              {
                "@type": "Question",
                "name": "How is reading time calculated?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Reading time uses an average speed of 200 words per minute for adults, while speaking time is calculated at 130 words per minute based on conversational pace."
                }
              },
              {
                "@type": "Question",
                "name": "What are unique words?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Unique words represent the number of distinct words in your text, calculated case-insensitively to help measure vocabulary diversity and content richness."
                }
              },
              {
                "@type": "Question",
                "name": "Is my text data secure and private?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Yes, all text analysis happens locally in your browser. Your content is never transmitted to our servers, stored, or shared with any third parties."
                }
              },
              {
                "@type": "Question",
                "name": "Does the tool work with different languages?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Our word counter works with most languages that use space-separated words, including English, Spanish, French, German, and many other Latin script languages."
                }
              },
              {
                "@type": "Question",
                "name": "Can I use this for academic writing?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Absolutely! Our tool is perfect for academic assignments, research papers, dissertations, and any writing with specific word count requirements."
                }
              },
              {
                "@type": "Question",
                "name": "What are advanced statistics?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Advanced statistics include metrics like unique words, average word length, words per sentence, and longest/shortest words to help improve writing quality."
                }
              }
            ]
          })}
        </script>

        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            "@id": "https://dapsiwow.com/#organization",
            "name": "DapsiWow",
            "url": "https://dapsiwow.com",
            "logo": "https://dapsiwow.com/logo.png",
            "description": "Free online calculators and tools for health, finance, and productivity",
            "sameAs": [
              "https://www.facebook.com/dapsiwow",
              "https://twitter.com/dapsiwow",
              "https://www.linkedin.com/company/dapsiwow"
            ]
          })}
        </script>

        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            "@id": "https://dapsiwow.com/#website",
            "url": "https://dapsiwow.com",
            "name": "DapsiWow",
            "description": "Free online calculators and tools for finance, health, and productivity",
            "publisher": {
              "@id": "https://dapsiwow.com/#organization"
            },
            "potentialAction": {
              "@type": "SearchAction",
              "target": {
                "@type": "EntryPoint",
                "urlTemplate": "https://dapsiwow.com/search?q={search_term_string}"
              },
              "query-input": "required name=search_term_string"
            }
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
                <span className="text-xs sm:text-sm font-medium text-blue-700">Professional Text Analysis</span>
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl 2xl:text-8xl font-bold text-slate-900 leading-tight tracking-tight" data-testid="text-page-title">
                <span className="block">Smart Word</span>
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 mt-1 sm:mt-2">
                  Counter
                </span>
              </h1>
              <p className="text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl text-slate-600 max-w-sm sm:max-w-lg md:max-w-2xl lg:max-w-3xl xl:max-w-4xl mx-auto leading-relaxed px-2 sm:px-0">
                Count words, characters, sentences, and paragraphs with real-time analysis and reading time estimates
              </p>
            </div>
          </div>
        </section>

        <div className="w-full max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-6 sm:py-8 md:py-12 lg:py-16">
          {/* Main Calculator Card */}
          <Card className="bg-white/90 backdrop-blur-sm shadow-2xl border-0 rounded-xl sm:rounded-2xl md:rounded-3xl overflow-hidden">
            <CardContent className="p-0">
              <div className="grid grid-cols-1 gap-0">
                {/* Input Section */}
                <div className="p-3 sm:p-4 md:p-6 lg:p-8 xl:p-10 2xl:p-12 space-y-4 sm:space-y-6 md:space-y-8">
                  <div className="text-center sm:text-left">
                    <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">Text Analysis</h2>
                    <p className="text-sm sm:text-base text-gray-600">Enter your text to get instant word count and detailed statistics</p>
                  </div>

                  {/* Text Area */}
                  <div className="space-y-2 sm:space-y-3 md:space-y-4">
                    <Label htmlFor="text-input" className="text-xs sm:text-sm font-semibold text-gray-800 uppercase tracking-wide">
                      Text to Analyze
                    </Label>
                    <Textarea
                      id="text-input"
                      value={text}
                      onChange={(e) => setText(e.target.value)}
                      className="min-h-[250px] sm:min-h-[300px] lg:min-h-[400px] text-sm sm:text-base border-2 border-gray-200 rounded-lg sm:rounded-xl focus:border-blue-500 focus:ring-blue-500 resize-none"
                      placeholder="Type or paste your text here to get instant word count and text statistics..."
                      aria-live="polite"
                      aria-atomic="false"
                      data-testid="textarea-text-input"
                    />
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row justify-center items-center gap-2 sm:gap-3 md:gap-4 pt-3 sm:pt-4 md:pt-6">
                    <Button
                      onClick={handleClear}
                      variant="outline"
                      className="w-full sm:w-auto h-10 sm:h-12 md:h-14 px-4 sm:px-6 md:px-8 border-2 border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold text-sm sm:text-base md:text-lg rounded-lg sm:rounded-xl"
                      data-testid="button-clear-text"
                    >
                      Clear Text
                    </Button>
                    <Button
                      onClick={handleCopy}
                      className="w-full sm:flex-1 h-10 sm:h-12 md:h-14 px-4 sm:px-6 md:px-8 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold text-sm sm:text-base md:text-lg rounded-lg sm:rounded-xl shadow-lg transition-colors duration-200"
                      disabled={!result || result.words === 0}
                      data-testid="button-copy-stats"
                    >
                      Copy Statistics
                    </Button>
                  </div>

                  {/* Advanced Options */}
                  {result && result.words > 0 && (
                    <div className="flex flex-wrap gap-2 sm:gap-3 pt-2 sm:pt-3 md:pt-4">
                      <Button
                        onClick={() => setShowAdvancedStats(!showAdvancedStats)}
                        variant="outline"
                        size="sm"
                        className="rounded-full text-xs sm:text-sm"
                        data-testid="button-show-advanced"
                      >
                        {showAdvancedStats ? 'Hide' : 'Show'} Advanced Statistics
                      </Button>
                    </div>
                  )}
                </div>

                {/* Results Section */}
                <div className="bg-gradient-to-br from-gray-50 to-blue-50 p-3 sm:p-4 md:p-6 lg:p-8 xl:p-10 2xl:p-12">
                  <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 mb-4 sm:mb-6 md:mb-8">Text Statistics</h2>

                  {result && result.words > 0 ? (
                    <div className="space-y-3 sm:space-y-4 md:space-y-6" data-testid="text-statistics">
                      {/* Word Count Highlight */}
                      <div className="bg-white rounded-lg sm:rounded-xl md:rounded-2xl p-4 sm:p-5 md:p-6 shadow-lg border border-blue-100">
                        <div className="text-xs sm:text-sm font-semibold text-gray-600 uppercase tracking-wide mb-1 sm:mb-2">Total Words</div>
                        <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600" data-testid="stat-words">
                          {result.words.toLocaleString()}
                        </div>
                      </div>

                      {/* Main Statistics - 2 Column Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-3 md:gap-4">
                        <div className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 shadow-sm">
                          <div className="flex justify-between items-center">
                            <span className="font-medium text-gray-700 text-xs sm:text-sm md:text-base">Characters (with spaces)</span>
                            <span className="font-bold text-gray-900 text-sm sm:text-base md:text-lg" data-testid="stat-characters">
                              {result.characters.toLocaleString()}
                            </span>
                          </div>
                        </div>
                        <div className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 shadow-sm">
                          <div className="flex justify-between items-center">
                            <span className="font-medium text-gray-700 text-xs sm:text-sm md:text-base">Characters (without spaces)</span>
                            <span className="font-bold text-purple-600 text-sm sm:text-base md:text-lg" data-testid="stat-characters-no-spaces">
                              {result.charactersNoSpaces.toLocaleString()}
                            </span>
                          </div>
                        </div>
                        <div className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 shadow-sm">
                          <div className="flex justify-between items-center">
                            <span className="font-medium text-gray-700 text-xs sm:text-sm md:text-base">Sentences</span>
                            <span className="font-bold text-orange-600 text-sm sm:text-base md:text-lg" data-testid="stat-sentences">
                              {result.sentences.toLocaleString()}
                            </span>
                          </div>
                        </div>
                        <div className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 shadow-sm">
                          <div className="flex justify-between items-center">
                            <span className="font-medium text-gray-700 text-xs sm:text-sm md:text-base">Paragraphs</span>
                            <span className="font-bold text-green-600 text-sm sm:text-base md:text-lg" data-testid="stat-paragraphs">
                              {result.paragraphs.toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Advanced Statistics - 2 Column Grid */}
                      {showAdvancedStats && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-3 md:gap-4">
                          <div className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 shadow-sm">
                            <div className="flex justify-between items-center">
                              <span className="font-medium text-gray-700 text-xs sm:text-sm md:text-base">Lines</span>
                              <span className="font-bold text-gray-600 text-sm sm:text-base md:text-lg" data-testid="stat-lines">
                                {result.lines.toLocaleString()}
                              </span>
                            </div>
                          </div>
                          <div className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 shadow-sm">
                            <div className="flex justify-between items-center">
                              <span className="font-medium text-gray-700 text-xs sm:text-sm md:text-base">Unique words</span>
                              <span className="font-bold text-teal-600 text-sm sm:text-base md:text-lg" data-testid="stat-unique-words">
                                {result.uniqueWords.toLocaleString()}
                              </span>
                            </div>
                          </div>
                          <div className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 shadow-sm">
                            <div className="flex justify-between items-center">
                              <span className="font-medium text-gray-700 text-xs sm:text-sm md:text-base">Average word length</span>
                              <span className="font-bold text-cyan-600 text-sm sm:text-base md:text-lg" data-testid="stat-avg-word-length">
                                {result.averageWordLength} chars
                              </span>
                            </div>
                          </div>
                          <div className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 shadow-sm">
                            <div className="flex justify-between items-center">
                              <span className="font-medium text-gray-700 text-xs sm:text-sm md:text-base">Average words per sentence</span>
                              <span className="font-bold text-rose-600 text-sm sm:text-base md:text-lg" data-testid="stat-avg-words-sentence">
                                {result.averageWordsPerSentence}
                              </span>
                            </div>
                          </div>
                          <div className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 shadow-sm">
                            <div className="flex justify-between items-center">
                              <span className="font-medium text-gray-700 text-xs sm:text-sm md:text-base">Longest word</span>
                              <span className="font-bold text-amber-600 text-sm sm:text-base md:text-lg" data-testid="stat-longest-word">
                                {result.longestWord} chars
                              </span>
                            </div>
                          </div>
                          <div className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 shadow-sm">
                            <div className="flex justify-between items-center">
                              <span className="font-medium text-gray-700 text-xs sm:text-sm md:text-base">Shortest word</span>
                              <span className="font-bold text-lime-600 text-sm sm:text-base md:text-lg" data-testid="stat-shortest-word">
                                {result.shortestWord} chars
                              </span>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Reading Time Analysis */}
                      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg sm:rounded-xl p-4 sm:p-5 md:p-6 border border-indigo-200">
                        <h4 className="font-bold text-indigo-800 mb-3 sm:mb-4 text-sm sm:text-base md:text-lg">Reading & Speaking Time</h4>
                        <div className="space-y-2 sm:space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-indigo-700 font-medium text-xs sm:text-sm md:text-base">Reading time:</span>
                            <span className="font-bold text-indigo-800 text-sm sm:text-base md:text-lg" data-testid="stat-reading-time">
                              {result.readingTime} min
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-indigo-700 font-medium text-xs sm:text-sm md:text-base">Speaking time:</span>
                            <span className="font-bold text-indigo-800 text-sm sm:text-base md:text-lg" data-testid="stat-speaking-time">
                              {result.speakingTime} min
                            </span>
                          </div>
                          <div className="text-[10px] sm:text-xs text-indigo-600 mt-1 sm:mt-2">
                            Based on 200 wpm reading, 130 wpm speaking
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 sm:py-12 md:py-16" data-testid="no-results">
                      <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-200 rounded-full mx-auto mb-4 sm:mb-6 flex items-center justify-center">
                        <div className="text-2xl sm:text-3xl font-bold text-gray-400">Aa</div>
                      </div>
                      <p className="text-gray-500 text-sm sm:text-base md:text-lg">Enter text above to see detailed statistics</p>
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
                    (with and without spaces), sentence structure evaluation, paragraph organization assessment, unique word
                    identification, and estimated reading and speaking times.
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
                    for their audiences. Additionally, the tool analyzes average word length, words per sentence, and
                    identifies unique words to help improve writing quality and readability.
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
                      <p className="text-gray-600 text-sm">Track multiple metrics including words, characters, sentences, paragraphs, lines, unique words, and time estimates in one location.</p>
                    </div>
                    <div className="border-l-4 border-purple-500 pl-4">
                      <h3 className="font-semibold text-gray-800 mb-2">Advanced Text Metrics</h3>
                      <p className="text-gray-600 text-sm">Analyze average word length, words per sentence, longest and shortest words for enhanced writing quality assessment.</p>
                    </div>
                    <div className="border-l-4 border-orange-500 pl-4">
                      <h3 className="font-semibold text-gray-800 mb-2">Reading Time Calculator</h3>
                      <p className="text-gray-600 text-sm">Estimate how long it takes to read or speak your content based on standard reading and speaking speeds.</p>
                    </div>
                    <div className="border-l-4 border-teal-500 pl-4">
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
                      <h3 className="font-semibold text-gray-800 mb-2">Writing Quality Analysis</h3>
                      <p className="text-gray-600 text-sm">Improve readability with metrics on average word length, sentence structure, and vocabulary diversity.</p>
                    </div>
                    <div className="border-l-4 border-amber-500 pl-4">
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
                        <div className="flex justify-between items-center p-3 bg-teal-50 rounded-lg">
                          <span className="font-medium">Product Descriptions:</span>
                          <span className="text-teal-600 font-semibold">100-300 words</span>
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
                        <div className="flex justify-between items-center p-3 bg-amber-50 rounded-lg">
                          <span className="font-medium">Literature Reviews:</span>
                          <span className="text-amber-600 font-semibold">2,000-4,000 words</span>
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
                        <p className="text-gray-600 text-sm">Review comprehensive text metrics including reading time, character analysis, and advanced statistics.</p>
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
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">What are unique words?</h3>
                      <p className="text-gray-600 text-sm">Unique words represent the number of distinct words in your text, calculated case-insensitively to help measure vocabulary diversity and content richness.</p>
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
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">What are advanced statistics?</h3>
                      <p className="text-gray-600 text-sm">Advanced statistics include metrics like unique words, average word length, words per sentence, and longest/shortest words to help improve writing quality.</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Related Text Tools Section */}
            <section className="mt-12">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">Related Text Tools</h2>
              <p className="text-lg text-gray-700 mb-6">
                Enhance your text analysis workflow with our comprehensive suite of free writing and editing tools:
              </p>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                <a href="/tools/character-counter" className="block bg-white p-6 rounded-lg border-2 border-gray-200 hover:border-blue-500 hover:shadow-lg transition-all no-underline" data-testid="link-character-counter">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2 no-underline">Character Counter</h3>
                  <p className="text-gray-700 text-sm">Count characters with precision for social media posts, meta descriptions, and character-limited content. Includes space counting options.</p>
                  <span className="text-blue-600 font-medium text-sm mt-2 inline-block">Count Characters →</span>
                </a>

                <a href="/tools/sentence-counter" className="block bg-white p-6 rounded-lg border-2 border-gray-200 hover:border-blue-500 hover:shadow-lg transition-all no-underline" data-testid="link-sentence-counter">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2 no-underline">Sentence Counter</h3>
                  <p className="text-gray-700 text-sm">Analyze sentence structure and count sentences to improve readability and writing flow. Perfect for content optimization.</p>
                  <span className="text-blue-600 font-medium text-sm mt-2 inline-block">Count Sentences →</span>
                </a>

                <a href="/tools/paragraph-counter" className="block bg-white p-6 rounded-lg border-2 border-gray-200 hover:border-blue-500 hover:shadow-lg transition-all no-underline" data-testid="link-paragraph-counter">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2 no-underline">Paragraph Counter</h3>
                  <p className="text-gray-700 text-sm">Count paragraphs and analyze text structure for better content organization and formatting. Essential for document editing.</p>
                  <span className="text-blue-600 font-medium text-sm mt-2 inline-block">Count Paragraphs →</span>
                </a>

                <a href="/tools/text-case-converter" className="block bg-white p-6 rounded-lg border-2 border-gray-200 hover:border-blue-500 hover:shadow-lg transition-all no-underline" data-testid="link-case-converter">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2 no-underline">Text Case Converter</h3>
                  <p className="text-gray-700 text-sm">Convert text to UPPERCASE, lowercase, Title Case, or Sentence case. Instantly transform text formatting for any purpose.</p>
                  <span className="text-blue-600 font-medium text-sm mt-2 inline-block">Convert Text Case →</span>
                </a>

                <a href="/tools/line-counter" className="block bg-white p-6 rounded-lg border-2 border-gray-200 hover:border-blue-500 hover:shadow-lg transition-all no-underline" data-testid="link-line-counter">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2 no-underline">Line Counter</h3>
                  <p className="text-gray-700 text-sm">Count lines of text for coding projects, poetry analysis, or document formatting. Supports multiple line break types.</p>
                  <span className="text-blue-600 font-medium text-sm mt-2 inline-block">Count Lines →</span>
                </a>

                <a href="/tools/reading-time-calculator" className="block bg-white p-6 rounded-lg border-2 border-gray-200 hover:border-blue-500 hover:shadow-lg transition-all no-underline" data-testid="link-reading-time">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2 no-underline">Reading Time Calculator</h3>
                  <p className="text-gray-700 text-sm">Estimate reading and speaking time for articles, presentations, and speeches. Optimize content length for your audience.</p>
                  <span className="text-blue-600 font-medium text-sm mt-2 inline-block">Calculate Time →</span>
                </a>
              </div>

              <div className="bg-blue-50 p-6 rounded-lg mt-8">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Need More Text Tools?</h3>
                <p className="text-gray-700 mb-4">
                  Explore our complete collection of 20+ free text analysis and writing tools. Perfect for writers, students, editors, and content creators.
                </p>
                <a href="/text-tools" className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors no-underline" data-testid="link-all-text-tools">
                  View All Text Tools →
                </a>
              </div>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default WordCounter;
