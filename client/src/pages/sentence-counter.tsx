
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
        <section className="gradient-hero text-white py-16 pt-24">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="w-20 h-20 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <i className="fas fa-list text-3xl"></i>
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold mb-6" data-testid="text-page-title">
              Sentence Counter
            </h1>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto">
              Count sentences, analyze sentence types, and get detailed text structure statistics for better writing
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
                        placeholder="Type or paste your text here to get instant sentence count and analysis..."
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
                        disabled={!result || result.totalSentences === 0}
                        data-testid="button-copy-stats"
                      >
                        <i className="fas fa-copy mr-2"></i>
                        Copy Stats
                      </Button>
                    </div>
                  </div>

                  {/* Results Section */}
                  <div className="space-y-6">
                    <h2 className="text-2xl font-semibold text-gray-900 mb-8">Sentence Analysis</h2>
                    
                    {result && result.totalSentences > 0 ? (
                      <div className="space-y-4" data-testid="sentence-statistics">
                        {/* Total Sentences */}
                        <div className="bg-blue-50 rounded-lg p-6 text-center">
                          <div className="text-3xl font-bold text-blue-600" data-testid="stat-total-sentences">
                            {result.totalSentences.toLocaleString()}
                          </div>
                          <div className="text-sm text-gray-600">Total Sentences</div>
                        </div>

                        {/* Sentence Types */}
                        <div className="grid grid-cols-3 gap-4">
                          <div className="bg-green-50 rounded-lg p-4 text-center">
                            <div className="text-xl font-bold text-green-600" data-testid="stat-declarative">
                              {result.declarativeSentences}
                            </div>
                            <div className="text-xs text-gray-600">Declarative (.)</div>
                          </div>
                          <div className="bg-purple-50 rounded-lg p-4 text-center">
                            <div className="text-xl font-bold text-purple-600" data-testid="stat-interrogative">
                              {result.interrogativeSentences}
                            </div>
                            <div className="text-xs text-gray-600">Questions (?)</div>
                          </div>
                          <div className="bg-orange-50 rounded-lg p-4 text-center">
                            <div className="text-xl font-bold text-orange-600" data-testid="stat-exclamatory">
                              {result.exclamatorySentences}
                            </div>
                            <div className="text-xs text-gray-600">Exclamatory (!)</div>
                          </div>
                        </div>

                        {/* Sentence Statistics */}
                        <div className="bg-gray-50 rounded-lg p-6">
                          <h3 className="font-semibold text-gray-900 mb-4">Sentence Statistics</h3>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="text-center">
                              <div className="text-lg font-bold text-gray-600" data-testid="stat-avg-words">
                                {result.averageWordsPerSentence}
                              </div>
                              <div className="text-sm text-gray-600">Avg Words/Sentence</div>
                            </div>
                            <div className="text-center">
                              <div className="text-lg font-bold text-gray-600" data-testid="stat-avg-chars">
                                {result.averageCharactersPerSentence}
                              </div>
                              <div className="text-sm text-gray-600">Avg Chars/Sentence</div>
                            </div>
                            <div className="text-center">
                              <div className="text-lg font-bold text-gray-600" data-testid="stat-longest">
                                {result.longestSentence}
                              </div>
                              <div className="text-sm text-gray-600">Longest Sentence</div>
                            </div>
                            <div className="text-center">
                              <div className="text-lg font-bold text-gray-600" data-testid="stat-shortest">
                                {result.shortestSentence}
                              </div>
                              <div className="text-sm text-gray-600">Shortest Sentence</div>
                            </div>
                          </div>
                        </div>

                        {/* Additional Stats */}
                        <div className="grid grid-cols-2 gap-4">
                          <div className="bg-indigo-50 rounded-lg p-4 text-center">
                            <div className="text-xl font-bold text-indigo-600" data-testid="stat-words">
                              {result.words.toLocaleString()}
                            </div>
                            <div className="text-sm text-gray-600">Total Words</div>
                          </div>
                          <div className="bg-pink-50 rounded-lg p-4 text-center">
                            <div className="text-xl font-bold text-pink-600" data-testid="stat-reading-time">
                              {result.readingTime} min
                            </div>
                            <div className="text-sm text-gray-600">Reading Time</div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-12 text-gray-500">
                        <i className="fas fa-list text-4xl mb-4"></i>
                        <p className="text-lg">Start typing to see your sentence analysis</p>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Information Sections */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
          {/* What is a Sentence Counter */}
          <div className="mt-12 bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">What is a Sentence Counter?</h2>
            <div className="prose max-w-none">
              <p className="text-lg text-gray-700 mb-6">
                A <strong>sentence counter</strong> is a specialized text analysis tool that counts and analyzes sentences in your writing. It goes beyond simple counting to provide insights into sentence structure, types, and readability patterns that can help improve your writing style.
              </p>
              
              <p className="text-gray-700 mb-6">
                Our sentence counter identifies different sentence types (declarative, interrogative, and exclamatory), calculates average sentence length, and provides statistics that help writers create more engaging and readable content.
              </p>
            </div>
          </div>

          {/* Sentence Types */}
          <div className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Understanding Sentence Types</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                  <span className="text-green-600 font-bold text-xl">.</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Declarative</h3>
                <p className="text-gray-600 text-sm">Statements that provide information or express facts. They end with periods and make up most written content.</p>
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
          <div className="mt-8 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Key Features of Our Sentence Counter</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-green-600 text-white rounded-full flex items-center justify-center mx-auto mb-4">
                  <i className="fas fa-chart-line text-2xl"></i>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Detailed Analysis</h3>
                <p className="text-gray-600">Get comprehensive statistics about sentence structure and composition.</p>
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

          {/* Use Cases */}
          <div className="mt-8 bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Who Uses Sentence Counters?</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <i className="fas fa-pen text-blue-600 text-xl"></i>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Writers</h3>
                <p className="text-gray-600 text-sm">Improve writing style and sentence variety.</p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <i className="fas fa-user-edit text-purple-600 text-xl"></i>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Editors</h3>
                <p className="text-gray-600 text-sm">Analyze text structure and readability patterns.</p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <i className="fas fa-graduation-cap text-green-600 text-xl"></i>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Students</h3>
                <p className="text-gray-600 text-sm">Improve academic writing and essay structure.</p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <i className="fas fa-chalkboard-teacher text-orange-600 text-xl"></i>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Teachers</h3>
                <p className="text-gray-600 text-sm">Assess student writing and provide feedback.</p>
              </div>
            </div>
          </div>

          {/* FAQ */}
          <div className="mt-8 bg-gradient-to-r from-gray-50 to-blue-50 rounded-2xl p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Frequently Asked Questions</h2>
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">How does the sentence counter identify different sentence types?</h3>
                <p className="text-gray-600">Our tool analyzes punctuation marks at the end of sentences. Periods indicate declarative sentences, question marks identify interrogative sentences, and exclamation points mark exclamatory sentences.</p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">What is considered a good average sentence length?</h3>
                <p className="text-gray-600">For most writing, an average of 15-20 words per sentence is considered readable. Shorter sentences are easier to understand, while longer sentences can provide detailed information.</p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">How can sentence analysis improve my writing?</h3>
                <p className="text-gray-600">By understanding your sentence patterns, you can vary sentence length and type to create more engaging, readable content. Too many long sentences can be hard to follow, while too many short ones can seem choppy.</p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Does the tool work with different languages?</h3>
                <p className="text-gray-600">The sentence counter works best with English text, as it relies on English punctuation patterns and sentence structure rules for accurate analysis.</p>
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
