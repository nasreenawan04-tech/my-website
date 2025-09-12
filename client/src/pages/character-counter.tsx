import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';

interface CharacterCountResult {
  totalCharacters: number;
  charactersWithoutSpaces: number;
  alphabeticCharacters: number;
  numericCharacters: number;
  specialCharacters: number;
  upperCaseLetters: number;
  lowerCaseLetters: number;
  words: number;
  sentences: number;
  paragraphs: number;
  lines: number;
  spaces: number;
  punctuation: number;
}

const CharacterCounter = () => {
  const [text, setText] = useState('');
  const [showDetails, setShowDetails] = useState(false);
  const [result, setResult] = useState<CharacterCountResult | null>(null);

  const calculateCharacterCount = (inputText: string): CharacterCountResult => {
    // Total characters
    const totalCharacters = inputText.length;
    
    // Characters without spaces
    const charactersWithoutSpaces = inputText.replace(/\s/g, '').length;
    
    // Alphabetic characters (letters only)
    const alphabeticCharacters = (inputText.match(/[a-zA-Z]/g) || []).length;
    
    // Numeric characters (digits only)
    const numericCharacters = (inputText.match(/[0-9]/g) || []).length;
    
    // Special characters (excluding letters, numbers, and spaces)
    const specialCharacters = (inputText.match(/[^a-zA-Z0-9\s]/g) || []).length;
    
    // Upper and lower case letters
    const upperCaseLetters = (inputText.match(/[A-Z]/g) || []).length;
    const lowerCaseLetters = (inputText.match(/[a-z]/g) || []).length;
    
    // Words
    const words = inputText.trim() === '' ? 0 : inputText.trim().split(/\s+/).filter(word => word.length > 0).length;
    
    // Sentences
    const sentences = inputText.trim() === '' ? 0 : inputText.split(/[.!?]+/).filter(sentence => sentence.trim().length > 0).length;
    
    // Paragraphs
    const paragraphs = inputText.trim() === '' ? 0 : inputText.split(/\n\s*\n/).filter(paragraph => paragraph.trim().length > 0).length;
    
    // Lines
    const lines = inputText === '' ? 0 : inputText.split('\n').length;
    
    // Spaces
    const spaces = (inputText.match(/\s/g) || []).length;
    
    // Punctuation
    const punctuation = (inputText.match(/[.,;:!?'"()[\]{}\-]/g) || []).length;

    return {
      totalCharacters,
      charactersWithoutSpaces,
      alphabeticCharacters,
      numericCharacters,
      specialCharacters,
      upperCaseLetters,
      lowerCaseLetters,
      words,
      sentences,
      paragraphs,
      lines,
      spaces,
      punctuation
    };
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
      const stats = `Character Count Statistics:
Total Characters: ${result.totalCharacters}
Characters (without spaces): ${result.charactersWithoutSpaces}
Alphabetic Characters: ${result.alphabeticCharacters}
Numeric Characters: ${result.numericCharacters}
Special Characters: ${result.specialCharacters}
Uppercase Letters: ${result.upperCaseLetters}
Lowercase Letters: ${result.lowerCaseLetters}
Words: ${result.words}
Sentences: ${result.sentences}
Paragraphs: ${result.paragraphs}
Lines: ${result.lines}
Spaces: ${result.spaces}
Punctuation: ${result.punctuation}`;
      
      navigator.clipboard.writeText(stats);
    }
  };

  const handleSampleText = () => {
    const sample = `Welcome to DapsiWow! This is a sample text to demonstrate the Character Counter tool. 

It includes UPPERCASE and lowercase letters, numbers like 123 and 456, special characters such as @#$%^&*(), and various punctuation marks: periods, commas, semicolons; question marks? and exclamation points!

This tool provides detailed analysis of your text content.`;
    setText(sample);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Helmet>
        <title>Free Character Counter Tool - Count Characters, Letters & Text Analysis | DapsiWow</title>
        <meta name="description" content="Free online character counter with real-time analysis. Count characters with/without spaces, letters, numbers, punctuation for Twitter, Instagram, and social media. Instant results!" />
        <meta name="keywords" content="character counter, letter counter, text character count, character count tool, text analysis, character statistics, text length calculator, social media character limit, Twitter character counter, Instagram character limit, word counter, sentence counter" />
        <meta property="og:title" content="Free Character Counter Tool - Instant Text Analysis & Character Counting" />
        <meta property="og:description" content="Professional character counter tool with detailed text analysis. Perfect for social media optimization and meeting platform character limits." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://dapsiwow.com/tools/character-counter" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Free Character Counter - Real-time Text Analysis Tool" />
        <meta name="twitter:description" content="Count characters instantly with our free tool. Perfect for Twitter, Instagram, social media and more." />
        <link rel="canonical" href="/tools/character-counter" />
        <script type="application/ld+json">
          {`
            {
              "@context": "https://schema.org",
              "@type": "WebApplication",
              "name": "Character Counter Tool",
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
            }
          `}
        </script>
      </Helmet>
      
      <Header />
      
      <main>
        {/* Hero Section */}
        <section className="gradient-hero text-white py-12 sm:py-16 pt-20 sm:pt-24">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6">
              <i className="fas fa-font text-2xl sm:text-3xl"></i>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6" data-testid="text-page-title">
              Character Counter
            </h1>
            <p className="text-lg sm:text-xl text-blue-100 max-w-2xl mx-auto px-2">
              Count characters with and without spaces, analyze text composition, and get detailed character statistics
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
                        placeholder="Type or paste your text here to get instant character count and detailed text analysis..."
                        data-testid="textarea-text-input"
                      />
                    </div>

                    {/* Options */}
                    <div className="space-y-2 sm:space-y-3">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="show-details"
                          checked={showDetails}
                          onCheckedChange={(checked) => setShowDetails(checked === true)}
                          data-testid="checkbox-show-details"
                        />
                        <Label htmlFor="show-details" className="text-xs sm:text-sm text-gray-700">
                          Show detailed character breakdown
                        </Label>
                      </div>
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
                        disabled={!result || result.totalCharacters === 0}
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
                    <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-4 sm:mb-8">Character Statistics</h2>
                    
                    {result && (
                      <div className="space-y-3 sm:space-y-4" data-testid="character-statistics">
                        {/* Main Character Counts */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                          <div className="bg-blue-50 rounded-lg p-3 sm:p-4 text-center">
                            <div className="text-2xl sm:text-3xl font-bold text-blue-600" data-testid="stat-total-characters">
                              {result.totalCharacters.toLocaleString()}
                            </div>
                            <div className="text-xs sm:text-sm text-gray-600">Total Characters</div>
                          </div>
                          
                          <div className="bg-purple-50 rounded-lg p-3 sm:p-4 text-center">
                            <div className="text-xl sm:text-2xl font-bold text-purple-600" data-testid="stat-characters-without-spaces">
                              {result.charactersWithoutSpaces.toLocaleString()}
                            </div>
                            <div className="text-xs sm:text-sm text-gray-600">Characters (no spaces)</div>
                          </div>
                        </div>

                        {/* Quick Stats */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3 lg:gap-4">
                          <div className="bg-gray-50 rounded-lg p-2 sm:p-3 text-center">
                            <div className="text-base sm:text-lg font-bold text-gray-600" data-testid="stat-words">
                              {result.words.toLocaleString()}
                            </div>
                            <div className="text-xs text-gray-600">Words</div>
                          </div>
                          <div className="bg-gray-50 rounded-lg p-2 sm:p-3 text-center">
                            <div className="text-base sm:text-lg font-bold text-gray-600" data-testid="stat-sentences">
                              {result.sentences.toLocaleString()}
                            </div>
                            <div className="text-xs text-gray-600">Sentences</div>
                          </div>
                          <div className="bg-gray-50 rounded-lg p-2 sm:p-3 text-center col-span-2 sm:col-span-1">
                            <div className="text-base sm:text-lg font-bold text-gray-600" data-testid="stat-paragraphs">
                              {result.paragraphs.toLocaleString()}
                            </div>
                            <div className="text-xs text-gray-600">Paragraphs</div>
                          </div>
                        </div>

                        {/* Detailed Breakdown */}
                        {showDetails && (
                          <div className="space-y-3 sm:space-y-4">
                            <h3 className="text-base sm:text-lg font-semibold text-gray-900 border-t pt-3 sm:pt-4">Detailed Character Breakdown</h3>
                            
                            {/* Letters */}
                            <div className="bg-indigo-50 rounded-lg p-3 sm:p-4">
                              <h4 className="text-sm sm:text-base font-semibold text-indigo-900 mb-2 sm:mb-3">Letters & Numbers</h4>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                                <div className="text-center">
                                  <div className="text-base sm:text-lg font-bold text-indigo-600" data-testid="stat-alphabetic">
                                    {result.alphabeticCharacters.toLocaleString()}
                                  </div>
                                  <div className="text-xs sm:text-sm text-gray-600">Alphabetic</div>
                                </div>
                                <div className="text-center">
                                  <div className="text-base sm:text-lg font-bold text-indigo-600" data-testid="stat-numeric">
                                    {result.numericCharacters.toLocaleString()}
                                  </div>
                                  <div className="text-xs sm:text-sm text-gray-600">Numeric</div>
                                </div>
                              </div>
                            </div>

                            {/* Case Analysis */}
                            <div className="bg-orange-50 rounded-lg p-3 sm:p-4">
                              <h4 className="text-sm sm:text-base font-semibold text-orange-900 mb-2 sm:mb-3">Case Analysis</h4>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                                <div className="text-center">
                                  <div className="text-base sm:text-lg font-bold text-orange-600" data-testid="stat-uppercase">
                                    {result.upperCaseLetters.toLocaleString()}
                                  </div>
                                  <div className="text-xs sm:text-sm text-gray-600">Uppercase</div>
                                </div>
                                <div className="text-center">
                                  <div className="text-base sm:text-lg font-bold text-orange-600" data-testid="stat-lowercase">
                                    {result.lowerCaseLetters.toLocaleString()}
                                  </div>
                                  <div className="text-xs sm:text-sm text-gray-600">Lowercase</div>
                                </div>
                              </div>
                            </div>

                            {/* Special Characters */}
                            <div className="bg-red-50 rounded-lg p-3 sm:p-4">
                              <h4 className="text-sm sm:text-base font-semibold text-red-900 mb-2 sm:mb-3">Special Characters</h4>
                              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3 lg:gap-4">
                                <div className="text-center">
                                  <div className="text-sm sm:text-base lg:text-lg font-bold text-red-600" data-testid="stat-special">
                                    {result.specialCharacters.toLocaleString()}
                                  </div>
                                  <div className="text-xs sm:text-sm text-gray-600">Special</div>
                                </div>
                                <div className="text-center">
                                  <div className="text-sm sm:text-base lg:text-lg font-bold text-red-600" data-testid="stat-spaces">
                                    {result.spaces.toLocaleString()}
                                  </div>
                                  <div className="text-xs sm:text-sm text-gray-600">Spaces</div>
                                </div>
                                <div className="text-center col-span-2 sm:col-span-1">
                                  <div className="text-sm sm:text-base lg:text-lg font-bold text-red-600" data-testid="stat-punctuation">
                                    {result.punctuation.toLocaleString()}
                                  </div>
                                  <div className="text-xs sm:text-sm text-gray-600">Punctuation</div>
                                </div>
                              </div>
                            </div>

                            {/* Lines */}
                            <div className="bg-teal-50 rounded-lg p-3 sm:p-4">
                              <h4 className="text-sm sm:text-base font-semibold text-teal-900 mb-2 sm:mb-3">Structure</h4>
                              <div className="text-center">
                                <div className="text-base sm:text-lg font-bold text-teal-600" data-testid="stat-lines">
                                  {result.lines.toLocaleString()}
                                </div>
                                <div className="text-xs sm:text-sm text-gray-600">Lines</div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {!result || result.totalCharacters === 0 ? (
                      <div className="text-center py-8 sm:py-12 text-gray-500">
                        <i className="fas fa-font text-3xl sm:text-4xl mb-3 sm:mb-4"></i>
                        <p className="text-base sm:text-lg">Start typing to see your character statistics</p>
                      </div>
                    ) : null}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Information Sections */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-8 sm:pb-12 lg:pb-16">
          {/* What is a Character Counter */}
          <div className="mt-8 sm:mt-12 bg-white rounded-2xl shadow-lg p-4 sm:p-6 lg:p-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4 sm:mb-6">What is a Character Counter Tool?</h2>
            <div className="prose max-w-none">
              <p className="text-lg text-gray-700 mb-6">
                A <strong>character counter</strong> is an essential text analysis tool that accurately counts individual characters in your content, providing detailed insights into text composition and structure. Unlike basic <a href="/tools/word-counter" className="text-blue-600 hover:text-blue-800 underline">word counters</a>, our advanced character counter distinguishes between characters with and without spaces, analyzes different character types, and delivers comprehensive text statistics in real-time.
              </p>
              
              <p className="text-gray-700 mb-6">
                Our free online character counter tool is designed for content creators, social media managers, writers, students, and professionals who need precise character counting for various platforms and requirements. Whether you're optimizing content for Twitter's 280-character limit, crafting social media descriptions, or analyzing text patterns for academic purposes, this character counting tool provides accurate, instant results.
              </p>

              <p className="text-gray-700 mb-6">
                The tool goes beyond simple character counting by offering detailed breakdowns of alphabetic characters, numeric characters, special characters, punctuation marks, and spacing. This comprehensive analysis helps you understand your text composition better and optimize content for specific requirements and platforms.
              </p>
            </div>
          </div>

          {/* Benefits for Different Audiences */}
          <div className="mt-6 sm:mt-8 bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-4 sm:p-6 lg:p-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4 sm:mb-6">Who Benefits from Character Counting?</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
              <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-3 sm:mb-4">
                  <i className="fas fa-graduation-cap text-blue-600 text-lg sm:text-xl"></i>
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2 sm:mb-3">📚 Students & Academics</h3>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start">
                    <span className="font-medium text-purple-600 mr-2">•</span>
                    <span>Meet essay and assignment character requirements</span>
                  </li>
                  <li className="flex items-start">
                    <span className="font-medium text-purple-600 mr-2">•</span>
                    <span>Optimize research paper abstracts and summaries</span>
                  </li>
                  <li className="flex items-start">
                    <span className="font-medium text-purple-600 mr-2">•</span>
                    <span>Ensure thesis and dissertation formatting compliance</span>
                  </li>
                  <li className="flex items-start">
                    <span className="font-medium text-purple-600 mr-2">•</span>
                    <span>Track progress on writing assignments with character targets</span>
                  </li>
                </ul>
              </div>

              <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-lg flex items-center justify-center mb-3 sm:mb-4">
                  <i className="fas fa-pen text-green-600 text-lg sm:text-xl"></i>
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2 sm:mb-3">✍️ Writers & Authors</h3>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start">
                    <span className="font-medium text-purple-600 mr-2">•</span>
                    <span>Meet publisher character limits for manuscripts</span>
                  </li>
                  <li className="flex items-start">
                    <span className="font-medium text-purple-600 mr-2">•</span>
                    <span>Optimize book descriptions and back cover copy</span>
                  </li>
                  <li className="flex items-start">
                    <span className="font-medium text-purple-600 mr-2">•</span>
                    <span>Craft compelling character-limited story summaries</span>
                  </li>
                  <li className="flex items-start">
                    <span className="font-medium text-purple-600 mr-2">•</span>
                    <span>Analyze writing style through character distribution</span>
                  </li>
                </ul>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                  <i className="fas fa-blog text-orange-600 text-xl"></i>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">📝 Bloggers & Content Creators</h3>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start">
                    <span className="font-medium text-purple-600 mr-2">•</span>
                    <span>Optimize meta descriptions for web content (150-160 characters)</span>
                  </li>
                  <li className="flex items-start">
                    <span className="font-medium text-purple-600 mr-2">•</span>
                    <span>Create engaging social media captions within limits</span>
                  </li>
                  <li className="flex items-start">
                    <span className="font-medium text-purple-600 mr-2">•</span>
                    <span>Craft compelling email subject lines (40-50 characters)</span>
                  </li>
                  <li className="flex items-start">
                    <span className="font-medium text-purple-600 mr-2">•</span>
                    <span>Ensure consistent content length across platforms</span>
                  </li>
                </ul>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm">
                <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                  <i className="fas fa-briefcase text-indigo-600 text-xl"></i>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">💼 Business Professionals</h3>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start">
                    <span className="font-medium text-purple-600 mr-2">•</span>
                    <span>Create concise elevator pitches and presentations</span>
                  </li>
                  <li className="flex items-start">
                    <span className="font-medium text-purple-600 mr-2">•</span>
                    <span>Optimize LinkedIn posts and professional bios</span>
                  </li>
                  <li className="flex items-start">
                    <span className="font-medium text-purple-600 mr-2">•</span>
                    <span>Meet proposal and report character requirements</span>
                  </li>
                  <li className="flex items-start">
                    <span className="font-medium text-purple-600 mr-2">•</span>
                    <span>Craft effective marketing copy within constraints</span>
                  </li>
                </ul>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm">
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                  <i className="fas fa-hashtag text-red-600 text-xl"></i>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">📱 Social Media Managers</h3>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start">
                    <span className="font-medium text-purple-600 mr-2">•</span>
                    <span>Twitter/X posts (280 characters maximum)</span>
                  </li>
                  <li className="flex items-start">
                    <span className="font-medium text-purple-600 mr-2">•</span>
                    <span>Instagram captions (2,200 characters optimal)</span>
                  </li>
                  <li className="flex items-start">
                    <span className="font-medium text-purple-600 mr-2">•</span>
                    <span>Facebook posts and ad copy optimization</span>
                  </li>
                  <li className="flex items-start">
                    <span className="font-medium text-purple-600 mr-2">•</span>
                    <span>LinkedIn post character optimization (1,300 limit)</span>
                  </li>
                </ul>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm">
                <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center mb-4">
                  <i className="fas fa-code text-teal-600 text-xl"></i>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">⚡ Developers & Researchers</h3>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start">
                    <span className="font-medium text-purple-600 mr-2">•</span>
                    <span>Analyze string lengths in programming projects</span>
                  </li>
                  <li className="flex items-start">
                    <span className="font-medium text-purple-600 mr-2">•</span>
                    <span>Validate input field character constraints</span>
                  </li>
                  <li className="flex items-start">
                    <span className="font-medium text-purple-600 mr-2">•</span>
                    <span>Research text patterns and linguistic analysis</span>
                  </li>
                  <li className="flex items-start">
                    <span className="font-medium text-purple-600 mr-2">•</span>
                    <span>Database field optimization and validation</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* How to Use */}
          <div className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">How to Use the Character Counter</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-semibold">1</div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Enter Your Text</h3>
                    <p className="text-gray-600">Type or paste your content into the text area for instant character analysis.</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-semibold">2</div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">View Real-time Counts</h3>
                    <p className="text-gray-600">See character counts update automatically as you type or edit your text.</p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-semibold">3</div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Enable Detailed Analysis</h3>
                    <p className="text-gray-600">Check the detailed breakdown option to see character types and composition.</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-semibold">4</div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Export or Reset</h3>
                    <p className="text-gray-600">Copy the statistics for your records or clear the text to start fresh.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Key Features */}
          <div className="mt-8 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Key Features of Our Character Counter</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-green-600 text-white rounded-full flex items-center justify-center mx-auto mb-4">
                  <i className="fas fa-search text-2xl"></i>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Detailed Analysis</h3>
                <p className="text-gray-600">Comprehensive character breakdown including letters, numbers, and special characters.</p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-green-600 text-white rounded-full flex items-center justify-center mx-auto mb-4">
                  <i className="fas fa-bolt text-2xl"></i>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Real-time Counting</h3>
                <p className="text-gray-600">Instant character count updates as you type with live text analysis.</p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-green-600 text-white rounded-full flex items-center justify-center mx-auto mb-4">
                  <i className="fas fa-chart-pie text-2xl"></i>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Character Types</h3>
                <p className="text-gray-600">Separate counts for uppercase, lowercase, numeric, and special characters.</p>
              </div>
            </div>
          </div>

          {/* Character Limits by Platform */}
          <div className="mt-8 bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Platform Character Limits Guide</h2>
            <p className="text-gray-700 mb-6">
              Different platforms have specific character limits. Our character counter helps you optimize content for each platform:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-4">
                <div className="flex items-center mb-3">
                  <i className="fab fa-twitter text-blue-500 text-xl mr-3"></i>
                  <h3 className="font-semibold text-gray-900">Twitter/X</h3>
                </div>
                <p className="text-gray-700"><strong>280 characters</strong> per tweet</p>
                <p className="text-gray-600 text-sm">Includes spaces and links</p>
              </div>
              
              <div className="bg-gradient-to-r from-pink-50 to-pink-100 rounded-lg p-4">
                <div className="flex items-center mb-3">
                  <i className="fab fa-instagram text-pink-500 text-xl mr-3"></i>
                  <h3 className="font-semibold text-gray-900">Instagram</h3>
                </div>
                <p className="text-gray-700"><strong>2,200 characters</strong> caption limit</p>
                <p className="text-gray-600 text-sm">Optimal: 125-150 characters for engagement</p>
              </div>
              
              <div className="bg-gradient-to-r from-blue-50 to-indigo-100 rounded-lg p-4">
                <div className="flex items-center mb-3">
                  <i className="fab fa-linkedin text-blue-600 text-xl mr-3"></i>
                  <h3 className="font-semibold text-gray-900">LinkedIn</h3>
                </div>
                <p className="text-gray-700"><strong>1,300 characters</strong> for posts</p>
                <p className="text-gray-600 text-sm">Professional bio: 2,000 characters</p>
              </div>

              <div className="bg-gradient-to-r from-indigo-50 to-purple-100 rounded-lg p-4">
                <div className="flex items-center mb-3">
                  <i className="fab fa-facebook text-indigo-600 text-xl mr-3"></i>
                  <h3 className="font-semibold text-gray-900">Facebook</h3>
                </div>
                <p className="text-gray-700"><strong>63,206 characters</strong> maximum</p>
                <p className="text-gray-600 text-sm">Optimal: 40-80 characters for engagement</p>
              </div>

              <div className="bg-gradient-to-r from-green-50 to-emerald-100 rounded-lg p-4">
                <div className="flex items-center mb-3">
                  <i className="fas fa-search text-green-600 text-xl mr-3"></i>
                  <h3 className="font-semibold text-gray-900">Meta Description</h3>
                </div>
                <p className="text-gray-700"><strong>150-160 characters</strong> optimal</p>
                <p className="text-gray-600 text-sm">Critical for web content optimization</p>
              </div>

              <div className="bg-gradient-to-r from-orange-50 to-yellow-100 rounded-lg p-4">
                <div className="flex items-center mb-3">
                  <i className="fas fa-sms text-orange-600 text-xl mr-3"></i>
                  <h3 className="font-semibold text-gray-900">SMS Text</h3>
                </div>
                <p className="text-gray-700"><strong>160 characters</strong> per message</p>
                <p className="text-gray-600 text-sm">Longer messages split into multiple parts</p>
              </div>
            </div>
          </div>

          {/* Related Tools Section */}
          <div className="mt-8 bg-gradient-to-r from-cyan-50 to-blue-50 rounded-2xl p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Related Text Analysis Tools</h2>
            <p className="text-gray-700 mb-6">
              Enhance your text analysis with our comprehensive suite of writing and content optimization tools:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <a href="/tools/word-counter" className="bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow group">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-3 group-hover:bg-blue-200 transition-colors">
                  <i className="fas fa-file-word text-blue-600 text-xl"></i>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-blue-600">Word Counter</h3>
                <p className="text-gray-600 text-sm">Count words, paragraphs, and estimate reading time</p>
              </a>
              
              <a href="/tools/paragraph-counter" className="bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow group">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-3 group-hover:bg-purple-200 transition-colors">
                  <i className="fas fa-paragraph text-purple-600 text-xl"></i>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-purple-600">Paragraph Counter</h3>
                <p className="text-gray-600 text-sm">Analyze paragraph structure and organization</p>
              </a>
              
              <a href="/tools/sentence-counter" className="bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow group">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-3 group-hover:bg-green-200 transition-colors">
                  <i className="fas fa-list-ol text-green-600 text-xl"></i>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-green-600">Sentence Counter</h3>
                <p className="text-gray-600 text-sm">Count sentences and analyze sentence structure</p>
              </a>
              
              <a href="/tools/case-converter" className="bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow group">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-3 group-hover:bg-orange-200 transition-colors">
                  <i className="fas fa-text-height text-orange-600 text-xl"></i>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-orange-600">Case Converter</h3>
                <p className="text-gray-600 text-sm">Convert text to uppercase, lowercase, and more</p>
              </a>

              <a href="/tools/reverse-text-tool" className="bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow group">
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-3 group-hover:bg-red-200 transition-colors">
                  <i className="fas fa-exchange-alt text-red-600 text-xl"></i>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-red-600">Reverse Text</h3>
                <p className="text-gray-600 text-sm">Reverse text characters, words, or lines instantly</p>
              </a>

              <a href="/tools/lorem-ipsum-generator" className="bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow group">
                <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-3 group-hover:bg-indigo-200 transition-colors">
                  <i className="fas fa-file-alt text-indigo-600 text-xl"></i>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-indigo-600">Lorem Ipsum</h3>
                <p className="text-gray-600 text-sm">Generate placeholder text for design and development</p>
              </a>

              <a href="/tools/font-style-changer" className="bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow group">
                <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center mb-3 group-hover:bg-teal-200 transition-colors">
                  <i className="fas fa-font text-teal-600 text-xl"></i>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-teal-600">Font Style Changer</h3>
                <p className="text-gray-600 text-sm">Apply different font styles and formatting</p>
              </a>

              <a href="/tools/markdown-to-html" className="bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow group">
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mb-3 group-hover:bg-yellow-200 transition-colors">
                  <i className="fas fa-code text-yellow-600 text-xl"></i>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-yellow-600">Markdown to HTML</h3>
                <p className="text-gray-600 text-sm">Convert Markdown text to HTML format</p>
              </a>
            </div>
          </div>


          {/* FAQ */}
          <div className="mt-8 bg-gradient-to-r from-gray-50 to-blue-50 rounded-2xl p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Frequently Asked Questions About Character Counting</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">What's the difference between characters with and without spaces?</h3>
                  <p className="text-gray-600">Characters with spaces count every single character including spaces, tabs, line breaks, and all whitespace. Characters without spaces only count visible, printable characters, excluding all forms of whitespace. This distinction is crucial for platforms with different counting methods.</p>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">What counts as a special character?</h3>
                  <p className="text-gray-600">Special characters include symbols, punctuation marks, and any character that isn't a letter, number, or space. Examples include: @, #, $, %, &, *, (, ), [, ], {'{}'}, {'{}'}, +, =, ?, !, {'<'}, {'>'}, and many more symbols used in text.</p>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">How accurate is the character count?</h3>
                  <p className="text-gray-600">Our character counter is 100% accurate and counts every single character, including hidden characters like tabs, line breaks, and Unicode characters. We use precise algorithms that match platform-specific counting methods for maximum reliability.</p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Does the tool count Unicode and emoji characters?</h3>
                  <p className="text-gray-600">Yes! Our character counter accurately counts Unicode characters, emojis, and special symbols. Note that some emojis may count as 2 characters on certain platforms, which our tool reflects for platform-specific accuracy.</p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Can I use this tool offline?</h3>
                  <p className="text-gray-600">The character counter works entirely in your browser using JavaScript, so once the page loads, you can use it without an internet connection. No data is sent to servers, ensuring privacy and offline functionality.</p>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Can I use this for social media posts?</h3>
                  <p className="text-gray-600">Absolutely! This tool is perfect for optimizing content for all social media platforms: Twitter/X (280 chars), Instagram captions (2,200 chars), LinkedIn posts (1,300 chars), Facebook posts, and more. It helps ensure your content fits perfectly within each platform's limits.</p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">How do I optimize meta descriptions with this tool?</h3>
                  <p className="text-gray-600">For web meta descriptions, aim for 150-160 characters including spaces. Our tool helps you craft compelling descriptions that display fully in search results without being truncated, improving click-through rates.</p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Is there a limit to how much text I can analyze?</h3>
                  <p className="text-gray-600">No, there's no limit! You can paste and analyze text of any length - from short tweets to entire documents. The tool processes everything in real-time without performance issues.</p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Can I copy the character count results?</h3>
                  <p className="text-gray-600">Yes! Use the "Copy Stats" button to copy all character statistics to your clipboard. This includes total characters, characters without spaces, and detailed breakdowns for easy sharing or record-keeping.</p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Why should I use this instead of other character counters?</h3>
                  <p className="text-gray-600">Our character counter provides detailed analysis beyond basic counting, including character type breakdowns, real-time updates, platform-specific optimization guidance, and additional text statistics like <a href="/tools/word-counter" className="text-blue-600 hover:underline">word counts</a> and <a href="/tools/sentence-counter" className="text-blue-600 hover:underline">sentence analysis</a>.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Tips and Best Practices */}
          <div className="mt-8 bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Character Counting Tips & Best Practices</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">💡 Writing Tips</h3>
                <ul className="space-y-3 text-gray-700">
                  <li className="flex items-start">
                    <span className="font-medium text-blue-600 mr-2">•</span>
                    <span><strong>Be Concise:</strong> Use character counting to eliminate unnecessary words and improve clarity</span>
                  </li>
                  <li className="flex items-start">
                    <span className="font-medium text-blue-600 mr-2">•</span>
                    <span><strong>Plan Ahead:</strong> Check character limits before writing to avoid extensive editing later</span>
                  </li>
                  <li className="flex items-start">
                    <span className="font-medium text-blue-600 mr-2">•</span>
                    <span><strong>Use Abbreviations:</strong> When appropriate, use shorter forms to save characters</span>
                  </li>
                  <li className="flex items-start">
                    <span className="font-medium text-blue-600 mr-2">•</span>
                    <span><strong>Prioritize Keywords:</strong> In limited space, ensure important keywords are included first</span>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">⚡ Optimization Strategies</h3>
                <ul className="space-y-3 text-gray-700">
                  <li className="flex items-start">
                    <span className="font-medium text-blue-600 mr-2">•</span>
                    <span><strong>Test Different Versions:</strong> Try multiple versions to find the most impactful within limits</span>
                  </li>
                  <li className="flex items-start">
                    <span className="font-medium text-blue-600 mr-2">•</span>
                    <span><strong>Leave Buffer Space:</strong> Stay 5-10 characters under limits for platform safety</span>
                  </li>
                  <li className="flex items-start">
                    <span className="font-medium text-blue-600 mr-2">•</span>
                    <span><strong>Monitor Trends:</strong> Platform limits can change, so stay updated with current requirements</span>
                  </li>
                  <li className="flex items-start">
                    <span className="font-medium text-blue-600 mr-2">•</span>
                    <span><strong>Analyze Competitors:</strong> Study successful content within character constraints</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default CharacterCounter;