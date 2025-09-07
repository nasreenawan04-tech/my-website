
import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';

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
    <div className="min-h-screen bg-gray-50">
      <Helmet>
        <title>Paragraph Counter - Count Paragraphs & Text Structure Analysis | DapsiWow</title>
        <meta name="description" content="Free online paragraph counter tool to count paragraphs, analyze text structure, and get detailed paragraph statistics. Real-time analysis with paragraph length categorization." />
        <meta name="keywords" content="paragraph counter, paragraph count tool, text structure analysis, paragraph statistics, writing analysis, document analysis" />
        <meta property="og:title" content="Paragraph Counter - Count Paragraphs & Text Structure Analysis" />
        <meta property="og:description" content="Free online paragraph counter with detailed text structure analysis. Count paragraphs and analyze text composition instantly." />
        <meta property="og:type" content="website" />
        <link rel="canonical" href="/tools/paragraph-counter" />
      </Helmet>
      
      <Header />
      
      <main>
        {/* Hero Section */}
        <section className="gradient-hero text-white py-16 pt-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="w-20 h-20 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <i className="fas fa-paragraph text-3xl"></i>
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold mb-6" data-testid="text-page-title">
              Paragraph Counter
            </h1>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto">
              Count paragraphs, analyze text structure, and get detailed paragraph composition statistics
            </p>
          </div>
        </section>

        {/* Calculator Section */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
                        placeholder="Type or paste your text here to get instant paragraph count and detailed text structure analysis..."
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
                          Show detailed paragraph breakdown
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
                        disabled={!result || result.totalParagraphs === 0}
                        data-testid="button-copy-stats"
                      >
                        <i className="fas fa-copy mr-2"></i>
                        Copy Stats
                      </Button>
                    </div>
                  </div>

                  {/* Results Section */}
                  <div className="space-y-6">
                    <h2 className="text-2xl font-semibold text-gray-900 mb-8">Paragraph Statistics</h2>
                    
                    {result && (
                      <div className="space-y-4" data-testid="paragraph-statistics">
                        {/* Main Paragraph Count */}
                        <div className="bg-blue-50 rounded-lg p-4 text-center">
                          <div className="text-3xl font-bold text-blue-600" data-testid="stat-total-paragraphs">
                            {result.totalParagraphs.toLocaleString()}
                          </div>
                          <div className="text-sm text-gray-600">Total Paragraphs</div>
                        </div>

                        {/* Paragraph Categories */}
                        <div className="grid grid-cols-3 gap-4">
                          <div className="bg-green-50 rounded-lg p-4 text-center">
                            <div className="text-2xl font-bold text-green-600" data-testid="stat-short-paragraphs">
                              {result.shortParagraphs.toLocaleString()}
                            </div>
                            <div className="text-sm text-gray-600">Short (≤50 words)</div>
                          </div>
                          <div className="bg-yellow-50 rounded-lg p-4 text-center">
                            <div className="text-2xl font-bold text-yellow-600" data-testid="stat-medium-paragraphs">
                              {result.mediumParagraphs.toLocaleString()}
                            </div>
                            <div className="text-sm text-gray-600">Medium (51-150)</div>
                          </div>
                          <div className="bg-red-50 rounded-lg p-4 text-center">
                            <div className="text-2xl font-bold text-red-600" data-testid="stat-long-paragraphs">
                              {result.longParagraphs.toLocaleString()}
                            </div>
                            <div className="text-sm text-gray-600">Long (&gt;150 words)</div>
                          </div>
                        </div>

                        {/* Quick Stats */}
                        <div className="grid grid-cols-2 gap-4">
                          <div className="bg-gray-50 rounded-lg p-3 text-center">
                            <div className="text-lg font-bold text-gray-600" data-testid="stat-words">
                              {result.words.toLocaleString()}
                            </div>
                            <div className="text-xs text-gray-600">Total Words</div>
                          </div>
                          <div className="bg-gray-50 rounded-lg p-3 text-center">
                            <div className="text-lg font-bold text-gray-600" data-testid="stat-sentences">
                              {result.sentences.toLocaleString()}
                            </div>
                            <div className="text-xs text-gray-600">Total Sentences</div>
                          </div>
                        </div>

                        {/* Detailed Breakdown */}
                        {showDetails && (
                          <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-gray-900 border-t pt-4">Detailed Paragraph Analysis</h3>
                            
                            {/* Averages */}
                            <div className="bg-indigo-50 rounded-lg p-4">
                              <h4 className="font-semibold text-indigo-900 mb-3">Average Statistics</h4>
                              <div className="grid grid-cols-3 gap-4">
                                <div className="text-center">
                                  <div className="text-lg font-bold text-indigo-600" data-testid="stat-avg-words">
                                    {result.averageWordsPerParagraph.toLocaleString()}
                                  </div>
                                  <div className="text-sm text-gray-600">Words/Paragraph</div>
                                </div>
                                <div className="text-center">
                                  <div className="text-lg font-bold text-indigo-600" data-testid="stat-avg-sentences">
                                    {result.averageSentencesPerParagraph}
                                  </div>
                                  <div className="text-sm text-gray-600">Sentences/Paragraph</div>
                                </div>
                                <div className="text-center">
                                  <div className="text-lg font-bold text-indigo-600" data-testid="stat-avg-characters">
                                    {result.averageCharactersPerParagraph.toLocaleString()}
                                  </div>
                                  <div className="text-sm text-gray-600">Characters/Paragraph</div>
                                </div>
                              </div>
                            </div>

                            {/* Length Range */}
                            <div className="bg-orange-50 rounded-lg p-4">
                              <h4 className="font-semibold text-orange-900 mb-3">Paragraph Length Range</h4>
                              <div className="grid grid-cols-2 gap-4">
                                <div className="text-center">
                                  <div className="text-lg font-bold text-orange-600" data-testid="stat-longest">
                                    {result.longestParagraph.toLocaleString()}
                                  </div>
                                  <div className="text-sm text-gray-600">Longest (words)</div>
                                </div>
                                <div className="text-center">
                                  <div className="text-lg font-bold text-orange-600" data-testid="stat-shortest">
                                    {result.shortestParagraph.toLocaleString()}
                                  </div>
                                  <div className="text-sm text-gray-600">Shortest (words)</div>
                                </div>
                              </div>
                            </div>

                            {/* Additional Stats */}
                            <div className="bg-teal-50 rounded-lg p-4">
                              <h4 className="font-semibold text-teal-900 mb-3">Additional Information</h4>
                              <div className="grid grid-cols-2 gap-4">
                                <div className="text-center">
                                  <div className="text-lg font-bold text-teal-600" data-testid="stat-lines">
                                    {result.lines.toLocaleString()}
                                  </div>
                                  <div className="text-sm text-gray-600">Total Lines</div>
                                </div>
                                <div className="text-center">
                                  <div className="text-lg font-bold text-teal-600" data-testid="stat-reading-time">
                                    {result.readingTime} min
                                  </div>
                                  <div className="text-sm text-gray-600">Reading Time</div>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {!result || result.totalParagraphs === 0 ? (
                      <div className="text-center py-12 text-gray-500">
                        <i className="fas fa-paragraph text-4xl mb-4"></i>
                        <p className="text-lg">Start typing to see your paragraph statistics</p>
                      </div>
                    ) : null}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Information Sections */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
          {/* What is a Paragraph Counter */}
          <div className="mt-12 bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">What is a Paragraph Counter?</h2>
            <div className="prose max-w-none">
              <p className="text-lg text-gray-700 mb-6">
                A <strong>paragraph counter</strong> is a specialized text analysis tool that counts and analyzes the paragraph structure of your content. Unlike simple word or character counters, our paragraph counter provides detailed insights into text organization, paragraph length distribution, and overall document structure.
              </p>
              
              <p className="text-gray-700 mb-6">
                This tool is invaluable for writers, editors, students, and content creators who need to analyze text structure, ensure proper paragraph distribution, or meet specific formatting requirements. Whether you're writing essays, articles, or reports, understanding your paragraph structure helps improve readability and flow.
              </p>
            </div>
          </div>

          {/* How to Use */}
          <div className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">How to Use the Paragraph Counter</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-semibold">1</div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Enter Your Text</h3>
                    <p className="text-gray-600">Type or paste your content into the text area for instant paragraph analysis.</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-semibold">2</div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">View Real-time Counts</h3>
                    <p className="text-gray-600">See paragraph counts and categorizations update automatically as you type.</p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-semibold">3</div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Enable Detailed Analysis</h3>
                    <p className="text-gray-600">Check the detailed breakdown option to see averages and length statistics.</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-semibold">4</div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Export or Reset</h3>
                    <p className="text-gray-600">Copy the paragraph statistics for your records or clear to start fresh.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Key Features */}
          <div className="mt-8 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Key Features of Our Paragraph Counter</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-green-600 text-white rounded-full flex items-center justify-center mx-auto mb-4">
                  <i className="fas fa-layer-group text-2xl"></i>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Structure Analysis</h3>
                <p className="text-gray-600">Comprehensive paragraph structure analysis with length categorization.</p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-green-600 text-white rounded-full flex items-center justify-center mx-auto mb-4">
                  <i className="fas fa-chart-bar text-2xl"></i>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Detailed Statistics</h3>
                <p className="text-gray-600">Average words, sentences, and characters per paragraph with range analysis.</p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-green-600 text-white rounded-full flex items-center justify-center mx-auto mb-4">
                  <i className="fas fa-bolt text-2xl"></i>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Real-time Analysis</h3>
                <p className="text-gray-600">Instant paragraph counting and analysis as you type or edit your text.</p>
              </div>
            </div>
          </div>

          {/* Use Cases */}
          <div className="mt-8 bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Common Use Cases</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <i className="fas fa-graduation-cap text-blue-600 text-xl"></i>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Academic Writing</h3>
                <p className="text-gray-600 text-sm">Analyze essay structure and ensure proper paragraph distribution.</p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <i className="fas fa-newspaper text-purple-600 text-xl"></i>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Content Writing</h3>
                <p className="text-gray-600 text-sm">Optimize article structure and improve readability.</p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <i className="fas fa-edit text-green-600 text-xl"></i>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Editing</h3>
                <p className="text-gray-600 text-sm">Review document structure and identify paragraph length issues.</p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <i className="fas fa-book text-orange-600 text-xl"></i>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Publishing</h3>
                <p className="text-gray-600 text-sm">Ensure consistent paragraph structure across publications.</p>
              </div>
            </div>
          </div>

          {/* FAQ */}
          <div className="mt-8 bg-gradient-to-r from-gray-50 to-blue-50 rounded-2xl p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Frequently Asked Questions</h2>
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">How does the tool identify paragraphs?</h3>
                <p className="text-gray-600">Paragraphs are identified by double line breaks (blank lines between text blocks). This is the standard method used in most word processors and publishing formats.</p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">What do the paragraph length categories mean?</h3>
                <p className="text-gray-600">Short paragraphs have 50 words or fewer, medium paragraphs have 51-150 words, and long paragraphs have more than 150 words. These categories help you understand text density and readability.</p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">How accurate are the statistics?</h3>
                <p className="text-gray-600">Our paragraph counter uses precise algorithms to count and analyze text structure. All statistics are calculated in real-time and provide accurate measurements of your content.</p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Can I use this for different types of documents?</h3>
                <p className="text-gray-600">Yes! This tool works with any type of text including essays, articles, reports, stories, and academic papers. It's perfect for analyzing any document structure.</p>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default ParagraphCounter;
