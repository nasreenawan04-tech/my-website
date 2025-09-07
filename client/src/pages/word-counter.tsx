import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

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
    <div className="min-h-screen bg-gray-50">
      <Helmet>
        <title>Word Counter - Count Words, Characters & Text Statistics | DapsiWow</title>
        <meta name="description" content="Free online word counter tool to count words, characters, sentences, paragraphs and calculate reading time. Real-time text analysis for writers, students and professionals." />
        <meta name="keywords" content="word counter, character counter, text statistics, word count tool, sentence counter, paragraph counter, reading time calculator, text analyzer" />
        <meta property="og:title" content="Word Counter - Count Words, Characters & Text Statistics" />
        <meta property="og:description" content="Free online word counter with real-time text analysis. Count words, characters, sentences and calculate reading time instantly." />
        <meta property="og:type" content="website" />
        <link rel="canonical" href="/tools/word-counter" />
      </Helmet>
      
      <Header />
      
      <main>
        {/* Hero Section */}
        <section className="gradient-hero text-white py-16 pt-24">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="w-20 h-20 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <i className="fas fa-calculator text-3xl"></i>
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold mb-6" data-testid="text-page-title">
              Word Counter
            </h1>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto">
              Count words, characters, sentences, and paragraphs with real-time text analysis and reading time estimates
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
                        placeholder="Type or paste your text here to get instant word count and text statistics..."
                        data-testid="textarea-text-input"
                      />
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
                        onClick={handleCopy}
                        variant="outline"
                        className="flex-1"
                        disabled={!result || result.words === 0}
                        data-testid="button-copy-stats"
                      >
                        <i className="fas fa-copy mr-2"></i>
                        Copy Stats
                      </Button>
                    </div>
                  </div>

                  {/* Results Section */}
                  <div className="space-y-6">
                    <h2 className="text-2xl font-semibold text-gray-900 mb-8">Text Statistics</h2>
                    
                    {result && (
                      <div className="space-y-4" data-testid="text-statistics">
                        {/* Main Counts */}
                        <div className="grid grid-cols-2 gap-4">
                          <div className="bg-blue-50 rounded-lg p-4 text-center">
                            <div className="text-2xl font-bold text-blue-600" data-testid="stat-words">
                              {result.words.toLocaleString()}
                            </div>
                            <div className="text-sm text-gray-600">Words</div>
                          </div>
                          <div className="bg-green-50 rounded-lg p-4 text-center">
                            <div className="text-2xl font-bold text-green-600" data-testid="stat-characters">
                              {result.characters.toLocaleString()}
                            </div>
                            <div className="text-sm text-gray-600">Characters</div>
                          </div>
                          <div className="bg-purple-50 rounded-lg p-4 text-center">
                            <div className="text-2xl font-bold text-purple-600" data-testid="stat-characters-no-spaces">
                              {result.charactersNoSpaces.toLocaleString()}
                            </div>
                            <div className="text-sm text-gray-600">Characters (no spaces)</div>
                          </div>
                          <div className="bg-orange-50 rounded-lg p-4 text-center">
                            <div className="text-2xl font-bold text-orange-600" data-testid="stat-sentences">
                              {result.sentences.toLocaleString()}
                            </div>
                            <div className="text-sm text-gray-600">Sentences</div>
                          </div>
                        </div>

                        {/* Additional Counts */}
                        <div className="grid grid-cols-2 gap-4">
                          <div className="bg-gray-50 rounded-lg p-4 text-center">
                            <div className="text-xl font-bold text-gray-600" data-testid="stat-paragraphs">
                              {result.paragraphs.toLocaleString()}
                            </div>
                            <div className="text-sm text-gray-600">Paragraphs</div>
                          </div>
                          <div className="bg-gray-50 rounded-lg p-4 text-center">
                            <div className="text-xl font-bold text-gray-600" data-testid="stat-lines">
                              {result.lines.toLocaleString()}
                            </div>
                            <div className="text-sm text-gray-600">Lines</div>
                          </div>
                        </div>

                        {/* Reading Time */}
                        <div className="bg-indigo-50 rounded-lg p-4">
                          <h3 className="font-semibold text-indigo-900 mb-2">Reading & Speaking Time</h3>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="text-center">
                              <div className="text-lg font-bold text-indigo-600" data-testid="stat-reading-time">
                                {result.readingTime} min
                              </div>
                              <div className="text-sm text-gray-600">Reading time</div>
                              <div className="text-xs text-gray-500">(200 wpm)</div>
                            </div>
                            <div className="text-center">
                              <div className="text-lg font-bold text-indigo-600" data-testid="stat-speaking-time">
                                {result.speakingTime} min
                              </div>
                              <div className="text-sm text-gray-600">Speaking time</div>
                              <div className="text-xs text-gray-500">(130 wpm)</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {!result || result.words === 0 ? (
                      <div className="text-center py-12 text-gray-500">
                        <i className="fas fa-pen text-4xl mb-4"></i>
                        <p className="text-lg">Start typing to see your text statistics</p>
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
          {/* What is a Word Counter */}
          <div className="mt-12 bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">What is a Word Counter?</h2>
            <div className="prose max-w-none">
              <p className="text-lg text-gray-700 mb-6">
                A <strong>word counter</strong> is an essential writing tool that analyzes text to provide detailed statistics about your content. Our advanced word counter goes beyond simple word counting to offer comprehensive text analysis including character count, sentence count, paragraph count, and estimated reading time.
              </p>
              
              <p className="text-gray-700 mb-6">
                Whether you're a student working on assignments with specific word requirements, a writer tracking your daily progress, or a professional creating content for marketing, our word counter provides real-time analysis to help you meet your goals and improve your writing efficiency.
              </p>
            </div>
          </div>

          {/* How to Use */}
          <div className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">How to Use the Word Counter</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-semibold">1</div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Type or Paste Text</h3>
                    <p className="text-gray-600">Enter your text directly in the text area or paste content from another document.</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-semibold">2</div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">View Real-time Statistics</h3>
                    <p className="text-gray-600">Watch the statistics update automatically as you type or edit your text.</p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-semibold">3</div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Analyze Results</h3>
                    <p className="text-gray-600">Review detailed statistics including reading time and speaking time estimates.</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-semibold">4</div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Copy or Clear</h3>
                    <p className="text-gray-600">Copy the statistics for your records or clear the text to start fresh.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Key Features */}
          <div className="mt-8 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Key Features of Our Word Counter</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-green-600 text-white rounded-full flex items-center justify-center mx-auto mb-4">
                  <i className="fas fa-bolt text-2xl"></i>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Real-time Analysis</h3>
                <p className="text-gray-600">Get instant statistics as you type with live text analysis and counting.</p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-green-600 text-white rounded-full flex items-center justify-center mx-auto mb-4">
                  <i className="fas fa-chart-bar text-2xl"></i>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Comprehensive Stats</h3>
                <p className="text-gray-600">Track words, characters, sentences, paragraphs, and reading time in one place.</p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-green-600 text-white rounded-full flex items-center justify-center mx-auto mb-4">
                  <i className="fas fa-mobile-alt text-2xl"></i>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Mobile Friendly</h3>
                <p className="text-gray-600">Count words and analyze text on any device with our responsive design.</p>
              </div>
            </div>
          </div>

          {/* Use Cases */}
          <div className="mt-8 bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Who Uses Word Counters?</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <i className="fas fa-graduation-cap text-blue-600 text-xl"></i>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Students</h3>
                <p className="text-gray-600 text-sm">Meet essay and assignment word requirements accurately.</p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <i className="fas fa-pen text-purple-600 text-xl"></i>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Writers</h3>
                <p className="text-gray-600 text-sm">Track daily writing goals and monitor progress.</p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <i className="fas fa-bullhorn text-green-600 text-xl"></i>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Marketers</h3>
                <p className="text-gray-600 text-sm">Optimize content length for social media and ads.</p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <i className="fas fa-briefcase text-orange-600 text-xl"></i>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Professionals</h3>
                <p className="text-gray-600 text-sm">Create reports and documents with precise word counts.</p>
              </div>
            </div>
          </div>

          {/* FAQ */}
          <div className="mt-8 bg-gradient-to-r from-gray-50 to-blue-50 rounded-2xl p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Frequently Asked Questions</h2>
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">How accurate is the word count?</h3>
                <p className="text-gray-600">Our word counter uses standard algorithms that match those used by popular word processors like Microsoft Word and Google Docs, ensuring consistent and accurate results.</p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">What counts as a word?</h3>
                <p className="text-gray-600">A word is defined as any sequence of characters separated by spaces. Numbers, abbreviations, and hyphenated words are each counted as individual words.</p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">How is reading time calculated?</h3>
                <p className="text-gray-600">Reading time is based on an average reading speed of 200 words per minute for adults. Speaking time uses 130 words per minute, which is the average speaking pace.</p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Can I use this for academic writing?</h3>
                <p className="text-gray-600">Yes! Our word counter is perfect for academic writing, essays, research papers, and any assignment with specific word count requirements.</p>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default WordCounter;