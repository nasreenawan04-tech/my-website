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
        <title>Character Counter - Count Characters, Letters & Text Analysis | DapsiWow</title>
        <meta name="description" content="Free online character counter tool to count characters with/without spaces, letters, numbers, punctuation and special characters. Real-time text analysis for precise character counting." />
        <meta name="keywords" content="character counter, letter counter, text character count, character count tool, text analysis, character statistics, text length calculator" />
        <meta property="og:title" content="Character Counter - Count Characters, Letters & Text Analysis" />
        <meta property="og:description" content="Free online character counter with detailed text analysis. Count characters, letters, numbers and special characters instantly." />
        <meta property="og:type" content="website" />
        <link rel="canonical" href="/tools/character-counter" />
      </Helmet>
      
      <Header />
      
      <main>
        {/* Hero Section */}
        <section className="gradient-hero text-white py-16 pt-24">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="w-20 h-20 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <i className="fas fa-font text-3xl"></i>
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold mb-6" data-testid="text-page-title">
              Character Counter
            </h1>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto">
              Count characters with and without spaces, analyze text composition, and get detailed character statistics
            </p>
          </div>
        </section>

        {/* Calculator Section */}
        <section className="py-16">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <Card className="bg-white shadow-sm border-0">
              <CardContent className="p-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                  {/* Input Section */}
                  <div className="space-y-6">
                    <h2 className="text-2xl font-semibold text-gray-900 mb-8">Enter Your Text</h2>
                    
                    {/* Text Area */}
                    <div className="space-y-3">
                      <Label htmlFor="text-input" className="text-sm font-medium text-gray-700">
                        Text to Analyze
                      </Label>
                      <textarea
                        id="text-input"
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        className="w-full h-80 p-4 text-base border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                        placeholder="Type or paste your text here to get instant character count and detailed text analysis..."
                        data-testid="textarea-text-input"
                      />
                    </div>

                    {/* Options */}
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="show-details"
                          checked={showDetails}
                          onCheckedChange={(checked) => setShowDetails(checked === true)}
                          data-testid="checkbox-show-details"
                        />
                        <Label htmlFor="show-details" className="text-sm text-gray-700">
                          Show detailed character breakdown
                        </Label>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-4">
                      <Button
                        onClick={handleClear}
                        variant="outline"
                        className="flex-1"
                        data-testid="button-clear-text"
                      >
                        <i className="fas fa-trash mr-2"></i>
                        Clear Text
                      </Button>
                      <Button
                        onClick={handleSampleText}
                        variant="outline"
                        className="flex-1"
                        data-testid="button-sample-text"
                      >
                        <i className="fas fa-file-text mr-2"></i>
                        Sample Text
                      </Button>
                      <Button
                        onClick={handleCopy}
                        variant="outline"
                        className="flex-1"
                        disabled={!result || result.totalCharacters === 0}
                        data-testid="button-copy-stats"
                      >
                        <i className="fas fa-copy mr-2"></i>
                        Copy Stats
                      </Button>
                    </div>
                  </div>

                  {/* Results Section */}
                  <div className="space-y-6">
                    <h2 className="text-2xl font-semibold text-gray-900 mb-8">Character Statistics</h2>
                    
                    {result && (
                      <div className="space-y-4" data-testid="character-statistics">
                        {/* Main Character Counts */}
                        <div className="grid grid-cols-1 gap-4">
                          <div className="bg-blue-50 rounded-lg p-4 text-center">
                            <div className="text-3xl font-bold text-blue-600" data-testid="stat-total-characters">
                              {result.totalCharacters.toLocaleString()}
                            </div>
                            <div className="text-sm text-gray-600">Total Characters</div>
                          </div>
                          
                          <div className="bg-purple-50 rounded-lg p-4 text-center">
                            <div className="text-2xl font-bold text-purple-600" data-testid="stat-characters-without-spaces">
                              {result.charactersWithoutSpaces.toLocaleString()}
                            </div>
                            <div className="text-sm text-gray-600">Characters (no spaces)</div>
                          </div>
                        </div>

                        {/* Quick Stats */}
                        <div className="grid grid-cols-3 gap-4">
                          <div className="bg-gray-50 rounded-lg p-3 text-center">
                            <div className="text-lg font-bold text-gray-600" data-testid="stat-words">
                              {result.words.toLocaleString()}
                            </div>
                            <div className="text-xs text-gray-600">Words</div>
                          </div>
                          <div className="bg-gray-50 rounded-lg p-3 text-center">
                            <div className="text-lg font-bold text-gray-600" data-testid="stat-sentences">
                              {result.sentences.toLocaleString()}
                            </div>
                            <div className="text-xs text-gray-600">Sentences</div>
                          </div>
                          <div className="bg-gray-50 rounded-lg p-3 text-center">
                            <div className="text-lg font-bold text-gray-600" data-testid="stat-paragraphs">
                              {result.paragraphs.toLocaleString()}
                            </div>
                            <div className="text-xs text-gray-600">Paragraphs</div>
                          </div>
                        </div>

                        {/* Detailed Breakdown */}
                        {showDetails && (
                          <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-gray-900 border-t pt-4">Detailed Character Breakdown</h3>
                            
                            {/* Letters */}
                            <div className="bg-indigo-50 rounded-lg p-4">
                              <h4 className="font-semibold text-indigo-900 mb-3">Letters & Numbers</h4>
                              <div className="grid grid-cols-2 gap-4">
                                <div className="text-center">
                                  <div className="text-lg font-bold text-indigo-600" data-testid="stat-alphabetic">
                                    {result.alphabeticCharacters.toLocaleString()}
                                  </div>
                                  <div className="text-sm text-gray-600">Alphabetic</div>
                                </div>
                                <div className="text-center">
                                  <div className="text-lg font-bold text-indigo-600" data-testid="stat-numeric">
                                    {result.numericCharacters.toLocaleString()}
                                  </div>
                                  <div className="text-sm text-gray-600">Numeric</div>
                                </div>
                              </div>
                            </div>

                            {/* Case Analysis */}
                            <div className="bg-orange-50 rounded-lg p-4">
                              <h4 className="font-semibold text-orange-900 mb-3">Case Analysis</h4>
                              <div className="grid grid-cols-2 gap-4">
                                <div className="text-center">
                                  <div className="text-lg font-bold text-orange-600" data-testid="stat-uppercase">
                                    {result.upperCaseLetters.toLocaleString()}
                                  </div>
                                  <div className="text-sm text-gray-600">Uppercase</div>
                                </div>
                                <div className="text-center">
                                  <div className="text-lg font-bold text-orange-600" data-testid="stat-lowercase">
                                    {result.lowerCaseLetters.toLocaleString()}
                                  </div>
                                  <div className="text-sm text-gray-600">Lowercase</div>
                                </div>
                              </div>
                            </div>

                            {/* Special Characters */}
                            <div className="bg-red-50 rounded-lg p-4">
                              <h4 className="font-semibold text-red-900 mb-3">Special Characters</h4>
                              <div className="grid grid-cols-3 gap-4">
                                <div className="text-center">
                                  <div className="text-lg font-bold text-red-600" data-testid="stat-special">
                                    {result.specialCharacters.toLocaleString()}
                                  </div>
                                  <div className="text-sm text-gray-600">Special</div>
                                </div>
                                <div className="text-center">
                                  <div className="text-lg font-bold text-red-600" data-testid="stat-spaces">
                                    {result.spaces.toLocaleString()}
                                  </div>
                                  <div className="text-sm text-gray-600">Spaces</div>
                                </div>
                                <div className="text-center">
                                  <div className="text-lg font-bold text-red-600" data-testid="stat-punctuation">
                                    {result.punctuation.toLocaleString()}
                                  </div>
                                  <div className="text-sm text-gray-600">Punctuation</div>
                                </div>
                              </div>
                            </div>

                            {/* Lines */}
                            <div className="bg-teal-50 rounded-lg p-4">
                              <h4 className="font-semibold text-teal-900 mb-3">Structure</h4>
                              <div className="text-center">
                                <div className="text-lg font-bold text-teal-600" data-testid="stat-lines">
                                  {result.lines.toLocaleString()}
                                </div>
                                <div className="text-sm text-gray-600">Lines</div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {!result || result.totalCharacters === 0 ? (
                      <div className="text-center py-12 text-gray-500">
                        <i className="fas fa-font text-4xl mb-4"></i>
                        <p className="text-lg">Start typing to see your character statistics</p>
                      </div>
                    ) : null}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Information Sections */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
          {/* What is a Character Counter */}
          <div className="mt-12 bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">What is a Character Counter?</h2>
            <div className="prose max-w-none">
              <p className="text-lg text-gray-700 mb-6">
                A <strong>character counter</strong> is a specialized text analysis tool that counts individual characters in your text, providing detailed insights into text composition. Unlike simple word counters, our character counter distinguishes between characters with and without spaces, analyzes character types, and provides comprehensive text statistics.
              </p>
              
              <p className="text-gray-700 mb-6">
                This tool is essential for content creators, social media managers, developers, and writers who need to meet specific character limits or analyze text composition. Whether you're crafting tweets, writing meta descriptions, or analyzing text patterns, our character counter provides the precise data you need.
              </p>
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

          {/* Use Cases */}
          <div className="mt-8 bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Common Use Cases</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <i className="fas fa-hashtag text-blue-600 text-xl"></i>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Social Media</h3>
                <p className="text-gray-600 text-sm">Stay within character limits for Twitter, Instagram, and other platforms.</p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <i className="fas fa-search text-purple-600 text-xl"></i>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">SEO Content</h3>
                <p className="text-gray-600 text-sm">Optimize meta descriptions and title tags for search engines.</p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <i className="fas fa-mobile-alt text-green-600 text-xl"></i>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">SMS Marketing</h3>
                <p className="text-gray-600 text-sm">Create SMS messages that fit within carrier character limits.</p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <i className="fas fa-code text-orange-600 text-xl"></i>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Programming</h3>
                <p className="text-gray-600 text-sm">Analyze code length and character distribution in strings.</p>
              </div>
            </div>
          </div>

          {/* FAQ */}
          <div className="mt-8 bg-gradient-to-r from-gray-50 to-blue-50 rounded-2xl p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Frequently Asked Questions</h2>
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">What's the difference between characters with and without spaces?</h3>
                <p className="text-gray-600">Characters with spaces count every character including spaces, tabs, and line breaks. Characters without spaces only count visible characters, excluding all whitespace.</p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">What counts as a special character?</h3>
                <p className="text-gray-600">Special characters include symbols, punctuation marks, and any character that isn't a letter, number, or space. Examples: @, #, $, %, &, *, (, ), [, ], &#123;, &#125;, etc.</p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">How accurate is the character count?</h3>
                <p className="text-gray-600">Our character counter is 100% accurate and counts every single character, including hidden characters like tabs and line breaks, giving you precise measurements.</p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Can I use this for social media posts?</h3>
                <p className="text-gray-600">Absolutely! This tool is perfect for ensuring your content fits within platform limits: Twitter (280 chars), Instagram captions (2,200 chars), and more.</p>
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