import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { CharacterCountResult, analyzeText } from '@/types/text-tool.types';

export default function CharacterCounter() {
  const [text, setText] = useState('');
  const [result, setResult] = useState<CharacterCountResult | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showAdvancedStats, setShowAdvancedStats] = useState(false);

  const calculateCharacterCount = (inputText: string): CharacterCountResult => {
    const analysis = analyzeText(inputText);
    return analysis as CharacterCountResult;
  };

  // Real-time calculation as user types
  useEffect(() => {
    const result = calculateCharacterCount(text);
    setResult(result);
  }, [text]);

  const handleClear = () => {
    setText('');
  };

  const handleCopy = () => {
    if (result) {
      const avgWordLength = result.words > 0 ? (result.charactersWithoutSpaces / result.words).toFixed(1) : '0';
      const avgWordsPerSentence = result.sentences > 0 ? (result.words / result.sentences).toFixed(1) : '0';
      const readingTime = result.words > 0 ? Math.ceil(result.words / 200) : 0;
      const speakingTime = result.words > 0 ? Math.ceil(result.words / 130) : 0;
      
      const stats = `Character Count Statistics:
Total Characters: ${result.totalCharacters.toLocaleString()}
Characters (without spaces): ${result.charactersWithoutSpaces.toLocaleString()}
Alphabetic Characters: ${result.alphabeticCharacters.toLocaleString()}
Numeric Characters: ${result.numericCharacters.toLocaleString()}
Special Characters: ${result.specialCharacters.toLocaleString()}
Uppercase Letters: ${result.upperCaseLetters.toLocaleString()}
Lowercase Letters: ${result.lowerCaseLetters.toLocaleString()}
Words: ${result.words.toLocaleString()}
Sentences: ${result.sentences.toLocaleString()}
Paragraphs: ${result.paragraphs.toLocaleString()}
Lines: ${result.lines.toLocaleString()}
Spaces: ${result.spaces.toLocaleString()}
Punctuation: ${result.punctuation.toLocaleString()}

Advanced Metrics:
Average Word Length: ${avgWordLength} characters
Average Words per Sentence: ${avgWordsPerSentence} words
Reading Time: ${readingTime} minute(s)
Speaking Time: ${speakingTime} minute(s)`;

      navigator.clipboard.writeText(stats);
    }
  };

  const handleSampleText = () => {
    const sample = `Welcome to DapsiWow! This is a sample text to demonstrate the Character Counter tool. 

It includes UPPERCASE and lowercase letters, numbers like 123 and 456, special characters such as @#$%^&*(), and various punctuation marks: periods, commas, semicolons; question marks? and exclamation points!

This tool provides detailed analysis of your text content for social media optimization and content planning.`;
    setText(sample);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Helmet>
        <title>Character Counter - Real-Time Text Analysis | DapsiWow</title>
        <meta name="description" content="Count characters, letters, words, and sentences in real-time instantly. Perfect for social media character limits and content planning. Free text analysis tool!" />
        <meta name="keywords" content="character counter, letter counter, text character count, character count tool, text analysis, character statistics, text length calculator, social media character limit, Twitter character counter, Instagram character limit, word counter, sentence counter" />
        <meta property="og:title" content="Character Counter - Count Characters, Letters & Text Analysis | DapsiWow" />
        <meta property="og:description" content="Professional character counter tool with detailed text analysis. Perfect for social media optimization and meeting platform character limits." />
        <meta property="og:type" content="website" />
        <meta name="robots" content="index, follow" />
        <meta name="author" content="DapsiWow" />
        <link rel="canonical" href="https://dapsiwow.com/tools/character-counter" />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            "name": "Character Counter",
            "description": "Free online character counter tool for counting characters, letters, numbers, and analyzing text composition in real-time.",
            "url": "https://dapsiwow.com/tools/character-counter",
            "applicationCategory": "UtilityApplication",
            "operatingSystem": "Any",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "USD"
            },
            "featureList": [
              "Real-time character counting",
              "Character type analysis",
              "Social media optimization",
              "Detailed text statistics"
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
                <span className="text-xs sm:text-sm font-medium text-blue-700">Professional Text Analysis</span>
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl 2xl:text-8xl font-bold text-slate-900 leading-tight tracking-tight">
                <span className="block">Smart Character</span>
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 mt-1 sm:mt-2">
                  Counter
                </span>
              </h1>
              <p className="text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl text-slate-600 max-w-sm sm:max-w-lg md:max-w-2xl lg:max-w-3xl xl:max-w-4xl mx-auto leading-relaxed px-2 sm:px-0">
                Count characters with precision, analyze text composition, and optimize content for all platforms
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
                    <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">Text Analysis</h2>
                    <p className="text-sm sm:text-base text-gray-600">Enter your text to get instant character count and detailed analysis</p>
                  </div>

                  {/* Text Area */}
                  <div className="space-y-2 sm:space-y-3">
                    <Label htmlFor="text-input" className="text-xs sm:text-sm font-semibold text-gray-800 uppercase tracking-wide">
                      Text to Analyze
                    </Label>
                    <Textarea
                      id="text-input"
                      value={text}
                      onChange={(e) => setText(e.target.value)}
                      className="min-h-[250px] sm:min-h-[300px] lg:min-h-[400px] text-sm sm:text-base border-2 border-gray-200 rounded-lg sm:rounded-xl focus:border-blue-500 focus:ring-blue-500 resize-none w-full"
                      placeholder="Type or paste your text here to get instant character count and detailed text analysis..."
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
                      onClick={handleSampleText}
                      variant="outline"
                      className="w-full sm:w-auto h-10 sm:h-12 md:h-14 px-4 sm:px-6 md:px-8 border-2 border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold text-sm sm:text-base md:text-lg rounded-lg sm:rounded-xl"
                      data-testid="button-sample-text"
                    >
                      Sample Text
                    </Button>
                    <Button
                      onClick={handleCopy}
                      className="w-full sm:flex-1 h-10 sm:h-12 md:h-14 px-4 sm:px-6 md:px-8 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold text-sm sm:text-base md:text-lg rounded-lg sm:rounded-xl shadow-lg"
                      disabled={!result || result.totalCharacters === 0}
                      data-testid="button-copy-stats"
                    >
                      Copy Statistics
                    </Button>
                  </div>

                  {/* Advanced Options */}
                  {result && result.totalCharacters > 0 && (
                    <div className="flex flex-wrap gap-2 sm:gap-3 pt-3 sm:pt-4">
                      <Button
                        onClick={() => setShowDetails(!showDetails)}
                        variant="outline"
                        size="sm"
                        className="rounded-full text-xs sm:text-sm px-3 sm:px-4 py-1 sm:py-2"
                        data-testid="button-show-details"
                      >
                        {showDetails ? 'Hide' : 'Show'} Detailed Analysis
                      </Button>
                      <Button
                        onClick={() => setShowAdvancedStats(!showAdvancedStats)}
                        variant="outline"
                        size="sm"
                        className="rounded-full text-xs sm:text-sm px-3 sm:px-4 py-1 sm:py-2"
                      >
                        {showAdvancedStats ? 'Hide' : 'Show'} Advanced Stats
                      </Button>
                    </div>
                  )}
                </div>

                {/* Results Section */}
                {result !== null && result.totalCharacters >= 0 && (
                  <div className="bg-gradient-to-br from-gray-50 to-blue-50 p-3 sm:p-4 md:p-6 lg:p-8 xl:p-10 2xl:p-12 border-t">
                    <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 mb-4 sm:mb-6 md:mb-8 text-center sm:text-left">Character Statistics</h2>

                  <div className="space-y-4 sm:space-y-6 md:space-y-8" data-testid="character-statistics">
                      {/* Character Count Highlight */}
                      <div className="bg-white rounded-lg sm:rounded-xl p-4 sm:p-6 shadow-lg border border-blue-100">
                        <div className="text-xs sm:text-sm font-semibold text-gray-600 uppercase tracking-wide mb-1 sm:mb-2">Total Characters</div>
                        <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 break-all" data-testid="stat-total-characters">
                          {result.totalCharacters.toLocaleString()}
                        </div>
                      </div>

                      {/* Main Statistics - Column Layout */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                        <div className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 shadow-sm">
                          <div className="flex justify-between items-center">
                            <span className="font-medium text-gray-700 text-xs sm:text-sm md:text-base">Characters (no spaces)</span>
                            <span className="font-bold text-purple-600 text-sm sm:text-base md:text-lg" data-testid="stat-characters-no-spaces">
                              {result.charactersWithoutSpaces.toLocaleString()}
                            </span>
                          </div>
                        </div>
                        <div className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 shadow-sm">
                          <div className="flex justify-between items-center">
                            <span className="font-medium text-gray-700 text-xs sm:text-sm md:text-base">Words</span>
                            <span className="font-bold text-green-600 text-sm sm:text-base md:text-lg" data-testid="stat-words">
                              {result.words.toLocaleString()}
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
                            <span className="font-bold text-indigo-600 text-sm sm:text-base md:text-lg" data-testid="stat-paragraphs">
                              {result.paragraphs.toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Detailed Analysis */}
                      {showDetails && (
                        <div className="space-y-3 sm:space-y-4">
                          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg sm:rounded-xl p-4 sm:p-6 border border-blue-200">
                            <h4 className="font-bold text-blue-800 mb-3 sm:mb-4 text-sm sm:text-base md:text-lg">Character Breakdown</h4>
                            <div className="space-y-2 sm:space-y-3">
                              <div className="flex justify-between items-center">
                                <span className="text-blue-700 font-medium text-xs sm:text-sm">Alphabetic:</span>
                                <span className="font-bold text-blue-800 text-sm sm:text-base md:text-lg" data-testid="stat-alphabetic">
                                  {result.alphabeticCharacters.toLocaleString()}
                                </span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-blue-700 font-medium text-xs sm:text-sm">Numeric:</span>
                                <span className="font-bold text-blue-800 text-sm sm:text-base md:text-lg" data-testid="stat-numeric">
                                  {result.numericCharacters.toLocaleString()}
                                </span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-blue-700 font-medium text-xs sm:text-sm">Special Characters:</span>
                                <span className="font-bold text-blue-800 text-sm sm:text-base md:text-lg" data-testid="stat-special">
                                  {result.specialCharacters.toLocaleString()}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg sm:rounded-xl p-4 sm:p-6 border border-green-200">
                            <h4 className="font-bold text-green-800 mb-3 sm:mb-4 text-sm sm:text-base md:text-lg">Case Analysis</h4>
                            <div className="space-y-2 sm:space-y-3">
                              <div className="flex justify-between items-center">
                                <span className="text-green-700 font-medium text-xs sm:text-sm">Uppercase:</span>
                                <span className="font-bold text-green-800 text-sm sm:text-base md:text-lg" data-testid="stat-uppercase">
                                  {result.upperCaseLetters.toLocaleString()}
                                </span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-green-700 font-medium text-xs sm:text-sm">Lowercase:</span>
                                <span className="font-bold text-green-800 text-sm sm:text-base md:text-lg" data-testid="stat-lowercase">
                                  {result.lowerCaseLetters.toLocaleString()}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="bg-gradient-to-r from-purple-50 to-violet-50 rounded-lg sm:rounded-xl p-4 sm:p-6 border border-purple-200">
                            <h4 className="font-bold text-purple-800 mb-3 sm:mb-4 text-sm sm:text-base md:text-lg">Additional Statistics</h4>
                            <div className="space-y-2 sm:space-y-3">
                              <div className="flex justify-between items-center">
                                <span className="text-purple-700 font-medium text-xs sm:text-sm">Spaces:</span>
                                <span className="font-bold text-purple-800 text-sm sm:text-base md:text-lg" data-testid="stat-spaces">
                                  {result.spaces.toLocaleString()}
                                </span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-purple-700 font-medium text-xs sm:text-sm">Punctuation:</span>
                                <span className="font-bold text-purple-800 text-sm sm:text-base md:text-lg" data-testid="stat-punctuation">
                                  {result.punctuation.toLocaleString()}
                                </span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-purple-700 font-medium text-xs sm:text-sm">Lines:</span>
                                <span className="font-bold text-purple-800 text-sm sm:text-base md:text-lg" data-testid="stat-lines">
                                  {result.lines.toLocaleString()}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Advanced Statistics */}
                      {showAdvancedStats && (
                        <div className="space-y-3 sm:space-y-4 mt-4">
                          <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-lg sm:rounded-xl p-4 sm:p-6 border border-orange-200">
                            <h4 className="font-bold text-orange-800 mb-3 sm:mb-4 text-sm sm:text-base md:text-lg">Reading & Speaking Time</h4>
                            <div className="space-y-2 sm:space-y-3">
                              <div className="flex justify-between items-center">
                                <span className="text-orange-700 font-medium text-xs sm:text-sm">Reading Time (200 wpm):</span>
                                <span className="font-bold text-orange-800 text-sm sm:text-base md:text-lg">
                                  {result.words > 0 ? `${Math.ceil(result.words / 200)} min` : '0 min'}
                                </span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-orange-700 font-medium text-xs sm:text-sm">Speaking Time (130 wpm):</span>
                                <span className="font-bold text-orange-800 text-sm sm:text-base md:text-lg">
                                  {result.words > 0 ? `${Math.ceil(result.words / 130)} min` : '0 min'}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="bg-gradient-to-r from-teal-50 to-cyan-50 rounded-lg sm:rounded-xl p-4 sm:p-6 border border-teal-200">
                            <h4 className="font-bold text-teal-800 mb-3 sm:mb-4 text-sm sm:text-base md:text-lg">Average Metrics</h4>
                            <div className="space-y-2 sm:space-y-3">
                              <div className="flex justify-between items-center">
                                <span className="text-teal-700 font-medium text-xs sm:text-sm">Unique Words:</span>
                                <span className="font-bold text-teal-800 text-sm sm:text-base md:text-lg">
                                  {result.uniqueWords.toLocaleString()}
                                </span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-teal-700 font-medium text-xs sm:text-sm">Avg. Word Length:</span>
                                <span className="font-bold text-teal-800 text-sm sm:text-base md:text-lg">
                                  {result.words > 0 
                                    ? `${(result.charactersWithoutSpaces / result.words).toFixed(1)} chars`
                                    : '0 chars'}
                                </span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-teal-700 font-medium text-xs sm:text-sm">Avg. Words per Sentence:</span>
                                <span className="font-bold text-teal-800 text-sm sm:text-base md:text-lg">
                                  {result.sentences > 0 
                                    ? `${(result.words / result.sentences).toFixed(1)} words`
                                    : '0 words'}
                                </span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-teal-700 font-medium text-xs sm:text-sm">Avg. Chars per Sentence:</span>
                                <span className="font-bold text-teal-800 text-sm sm:text-base md:text-lg">
                                  {result.sentences > 0 
                                    ? `${(result.totalCharacters / result.sentences).toFixed(1)} chars`
                                    : '0 chars'}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="bg-gradient-to-r from-rose-50 to-pink-50 rounded-lg sm:rounded-xl p-4 sm:p-6 border border-rose-200">
                            <h4 className="font-bold text-rose-800 mb-3 sm:mb-4 text-sm sm:text-base md:text-lg">Density Analysis</h4>
                            <div className="space-y-2 sm:space-y-3">
                              <div className="flex justify-between items-center">
                                <span className="text-rose-700 font-medium text-xs sm:text-sm">Letter Density:</span>
                                <span className="font-bold text-rose-800 text-sm sm:text-base md:text-lg">
                                  {result.totalCharacters > 0 
                                    ? `${((result.alphabeticCharacters / result.totalCharacters) * 100).toFixed(1)}%`
                                    : '0%'}
                                </span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-rose-700 font-medium text-xs sm:text-sm">Number Density:</span>
                                <span className="font-bold text-rose-800 text-sm sm:text-base md:text-lg">
                                  {result.totalCharacters > 0 
                                    ? `${((result.numericCharacters / result.totalCharacters) * 100).toFixed(1)}%`
                                    : '0%'}
                                </span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-rose-700 font-medium text-xs sm:text-sm">Whitespace Density:</span>
                                <span className="font-bold text-rose-800 text-sm sm:text-base md:text-lg">
                                  {result.totalCharacters > 0 
                                    ? `${((result.spaces / result.totalCharacters) * 100).toFixed(1)}%`
                                    : '0%'}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Content Sections */}
          <div className="mt-16 space-y-12">
            {/* What is a Character Counter */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-6">What is a Character Counter Tool?</h2>
                <div className="prose max-w-none text-gray-700 space-y-4">
                  <p className="text-lg leading-relaxed">
                    A <strong>character counter</strong> is an essential digital tool that provides comprehensive text analysis
                    by calculating various character-based metrics in your content. Unlike simple counting applications,
                    our advanced character counter delivers real-time insights including precise character counts (with and without spaces),
                    alphabetic and numeric character analysis, special character identification, case analysis, and detailed
                    text composition statistics that are crucial for content optimization across different platforms.
                  </p>

                  <p className="leading-relaxed">
                    This powerful text analysis tool works instantaneously, automatically updating all statistics as you
                    type or paste content. The real-time functionality makes it indispensable for social media managers
                    optimizing posts for platform character limits, content creators crafting platform-specific content,
                    students meeting academic assignment requirements, and professionals preparing business communications
                    with specific length constraints.
                  </p>

                  <p className="leading-relaxed">
                    Our character counter distinguishes between different character types, providing separate counts for
                    uppercase letters, lowercase letters, numeric characters, special symbols, punctuation marks, and
                    whitespace characters. This detailed breakdown helps users understand their text composition better
                    and optimize content for specific requirements, whether it's social media character limits, meta
                    description optimization, or academic writing standards.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Platform Character Limits Guide */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Platform Character Limits Guide</h2>
                <p className="text-gray-600 mb-8">
                  Different platforms have specific character limits. Our character counter helps you optimize content for each platform:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
                    <h3 className="font-bold text-blue-800 mb-4 text-lg">Twitter/X</h3>
                    <div className="space-y-2 text-blue-700">
                      <p><strong>280 characters</strong> per tweet</p>
                      <p className="text-sm text-blue-600">Includes spaces, links, and media attachments</p>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-pink-50 to-pink-100 rounded-xl p-6 border border-pink-200">
                    <h3 className="font-bold text-pink-800 mb-4 text-lg">Instagram</h3>
                    <div className="space-y-2 text-pink-700">
                      <p><strong>2,200 characters</strong> caption limit</p>
                      <p className="text-sm text-pink-600">Optimal: 125-150 characters for engagement</p>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-indigo-50 to-indigo-100 rounded-xl p-6 border border-indigo-200">
                    <h3 className="font-bold text-indigo-800 mb-4 text-lg">LinkedIn</h3>
                    <div className="space-y-2 text-indigo-700">
                      <p><strong>1,300 characters</strong> for posts</p>
                      <p className="text-sm text-indigo-600">Professional bio: 2,000 characters</p>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-xl p-6 border border-green-200">
                    <h3 className="font-bold text-green-800 mb-4 text-lg">Facebook</h3>
                    <div className="space-y-2 text-green-700">
                      <p><strong>63,206 characters</strong> maximum</p>
                      <p className="text-sm text-green-600">Optimal: 40-80 characters for engagement</p>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-xl p-6 border border-orange-200">
                    <h3 className="font-bold text-orange-800 mb-4 text-lg">Meta Description</h3>
                    <div className="space-y-2 text-orange-700">
                      <p><strong>150-160 characters</strong> optimal</p>
                      <p className="text-sm text-orange-600">Critical for SEO and click-through rates</p>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl p-6 border border-purple-200">
                    <h3 className="font-bold text-purple-800 mb-4 text-lg">SMS Text</h3>
                    <div className="space-y-2 text-purple-700">
                      <p><strong>160 characters</strong> per message</p>
                      <p className="text-sm text-purple-600">Longer messages split into multiple parts</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Professional Use Cases */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-8">Professional Use Cases</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="text-center p-6 bg-blue-50 rounded-xl border border-blue-200">
                    <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                      S
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-4">Students & Academics</h3>
                    <ul className="text-gray-600 text-sm space-y-2">
                      <li>Meet essay character requirements</li>
                      <li>Optimize research paper abstracts</li>
                      <li>Track assignment progress</li>
                      <li>Ensure formatting compliance</li>
                    </ul>
                  </div>

                  <div className="text-center p-6 bg-green-50 rounded-xl border border-green-200">
                    <div className="w-16 h-16 bg-green-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                      M
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-4">Social Media Managers</h3>
                    <ul className="text-gray-600 text-sm space-y-2">
                      <li>Twitter/X post optimization</li>
                      <li>Instagram caption crafting</li>
                      <li>LinkedIn content planning</li>
                      <li>Facebook ad copy creation</li>
                    </ul>
                  </div>

                  <div className="text-center p-6 bg-purple-50 rounded-xl border border-purple-200">
                    <div className="w-16 h-16 bg-purple-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                      W
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-4">Writers & Authors</h3>
                    <ul className="text-gray-600 text-sm space-y-2">
                      <li>Meet publisher requirements</li>
                      <li>Optimize book descriptions</li>
                      <li>Craft story summaries</li>
                      <li>Analyze writing patterns</li>
                    </ul>
                  </div>

                  <div className="text-center p-6 bg-orange-50 rounded-xl border border-orange-200">
                    <div className="w-16 h-16 bg-orange-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                      B
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-4">Business Professionals</h3>
                    <ul className="text-gray-600 text-sm space-y-2">
                      <li>Email subject line optimization</li>
                      <li>Marketing copy creation</li>
                      <li>Presentation content planning</li>
                      <li>Proposal writing assistance</li>
                    </ul>
                  </div>
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
                      <p className="text-gray-600 text-sm">Get instant feedback as you type with live character counting and text statistics that update automatically.</p>
                    </div>
                    <div className="border-l-4 border-green-500 pl-4">
                      <h3 className="font-semibold text-gray-800 mb-2">Comprehensive Statistics</h3>
                      <p className="text-gray-600 text-sm">Track multiple metrics including characters, words, sentences, paragraphs, and detailed character type analysis.</p>
                    </div>
                    <div className="border-l-4 border-purple-500 pl-4">
                      <h3 className="font-semibold text-gray-800 mb-2">Character Type Breakdown</h3>
                      <p className="text-gray-600 text-sm">Analyze alphabetic, numeric, special characters, uppercase, lowercase, and punctuation separately.</p>
                    </div>
                    <div className="border-l-4 border-orange-500 pl-4">
                      <h3 className="font-semibold text-gray-800 mb-2">Export and Share</h3>
                      <p className="text-gray-600 text-sm">Copy detailed statistics to your clipboard for reports, documentation, or sharing with team members.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
                <CardContent className="p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Why Use Our Tool?</h2>
                  <div className="space-y-4">
                    <div className="border-l-4 border-indigo-500 pl-4">
                      <h3 className="font-semibold text-gray-800 mb-2">Platform Optimization</h3>
                      <p className="text-gray-600 text-sm">Perfect for optimizing content for social media platforms, ensuring your messages fit within character limits.</p>
                    </div>
                    <div className="border-l-4 border-cyan-500 pl-4">
                      <h3 className="font-semibold text-gray-800 mb-2">SEO Enhancement</h3>
                      <p className="text-gray-600 text-sm">Optimize meta descriptions, title tags, and web content by monitoring character counts for better search performance.</p>
                    </div>
                    <div className="border-l-4 border-teal-500 pl-4">
                      <h3 className="font-semibold text-gray-800 mb-2">Academic Support</h3>
                      <p className="text-gray-600 text-sm">Meet university and academic requirements for essays, research papers, and assignments with precise character tracking.</p>
                    </div>
                    <div className="border-l-4 border-rose-500 pl-4">
                      <h3 className="font-semibold text-gray-800 mb-2">Privacy Focused</h3>
                      <p className="text-gray-600 text-sm">All analysis happens locally in your browser - your text is never transmitted or stored on our servers.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* How to Use Guide */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-6">How to Use the Character Counter</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full flex items-center justify-center font-bold">1</div>
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-2">Enter Your Text</h3>
                        <p className="text-gray-600 text-sm">Type directly in the text area or paste content from any document, website, or application for instant analysis.</p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full flex items-center justify-center font-bold">2</div>
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-2">View Real-Time Results</h3>
                        <p className="text-gray-600 text-sm">Watch character statistics update instantly as you type or edit your text content with live analysis.</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full flex items-center justify-center font-bold">3</div>
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-2">Enable Detailed Analysis</h3>
                        <p className="text-gray-600 text-sm">Click "Show Detailed Analysis" to see comprehensive character type breakdowns and advanced statistics.</p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full flex items-center justify-center font-bold">4</div>
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-2">Export or Clear</h3>
                        <p className="text-gray-600 text-sm">Copy detailed statistics for your records or clear the text to start analyzing new content.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Character Counting Best Practices */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Character Counting Best Practices</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">Content Optimization Tips</h3>
                    <ul className="space-y-3 text-gray-700">
                      <li className="flex items-start">
                        <span className="font-medium text-blue-600 mr-2">•</span>
                        <span><strong>Plan Ahead:</strong> Check character limits before writing to avoid extensive editing later</span>
                      </li>
                      <li className="flex items-start">
                        <span className="font-medium text-blue-600 mr-2">•</span>
                        <span><strong>Leave Buffer Space:</strong> Stay 5-10 characters under limits for platform safety margins</span>
                      </li>
                      <li className="flex items-start">
                        <span className="font-medium text-blue-600 mr-2">•</span>
                        <span><strong>Use Abbreviations Wisely:</strong> Employ shorter forms when appropriate to save character space</span>
                      </li>
                      <li className="flex items-start">
                        <span className="font-medium text-blue-600 mr-2">•</span>
                        <span><strong>Prioritize Keywords:</strong> In limited space, ensure important keywords are included first</span>
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">Platform-Specific Strategies</h3>
                    <ul className="space-y-3 text-gray-700">
                      <li className="flex items-start">
                        <span className="font-medium text-blue-600 mr-2">•</span>
                        <span><strong>Social Media:</strong> Test different versions to find the most impactful within limits</span>
                      </li>
                      <li className="flex items-start">
                        <span className="font-medium text-blue-600 mr-2">•</span>
                        <span><strong>SEO Content:</strong> Monitor meta description lengths for optimal search result display</span>
                      </li>
                      <li className="flex items-start">
                        <span className="font-medium text-blue-600 mr-2">•</span>
                        <span><strong>Academic Writing:</strong> Track progress toward word and character count requirements</span>
                      </li>
                      <li className="flex items-start">
                        <span className="font-medium text-blue-600 mr-2">•</span>
                        <span><strong>Business Content:</strong> Ensure professional communications meet length specifications</span>
                      </li>
                    </ul>
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
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">What's the difference between characters with and without spaces?</h3>
                      <p className="text-gray-600 text-sm">Characters with spaces count every single character including spaces, tabs, and line breaks. Characters without spaces only count visible, printable characters, excluding all forms of whitespace.</p>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">How accurate is the character count?</h3>
                      <p className="text-gray-600 text-sm">Our character counter is 100% accurate and counts every single character, including hidden characters like tabs, line breaks, and Unicode characters using precise algorithms.</p>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Can I use this for social media posts?</h3>
                      <p className="text-gray-600 text-sm">Absolutely! This tool is perfect for optimizing content for all social media platforms: Twitter/X (280 chars), Instagram (2,200 chars), LinkedIn (1,300 chars), and Facebook posts.</p>
                    </div>
                  </div>
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">What counts as a special character?</h3>
                      <p className="text-gray-600 text-sm">Special characters include symbols, punctuation marks, and any character that isn't a letter, number, or space. Examples include @, #, $, %, &, *, +, =, ?, !, and many more.</p>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Is my text data secure and private?</h3>
                      <p className="text-gray-600 text-sm">Yes, all text analysis happens locally in your browser. Your content is never transmitted to our servers, stored, or shared with any third parties, ensuring complete privacy.</p>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Can I copy the character count results?</h3>
                      <p className="text-gray-600 text-sm">Yes! Use the "Copy Statistics" button to copy all character statistics to your clipboard, including detailed breakdowns for easy sharing or record-keeping.</p>
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
                  <a href="/tools/word-counter" className="block bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-xl hover:shadow-lg transition-shadow group border border-blue-100">
                    <div className="w-12 h-12 bg-blue-600 text-white rounded-lg flex items-center justify-center mb-4 group-hover:bg-blue-700 transition-colors text-xl font-bold">
                      W
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-blue-600">Word Counter</h3>
                    <p className="text-gray-600 text-sm">Count words, paragraphs, and estimate reading time with comprehensive text analysis features.</p>
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
}