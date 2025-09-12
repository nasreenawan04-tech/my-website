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
        <section className="gradient-hero text-white py-12 sm:py-16 pt-20 sm:pt-24">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6">
              <i className="fas fa-calculator text-2xl sm:text-3xl"></i>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6" data-testid="text-page-title">
              Word Counter
            </h1>
            <p className="text-lg sm:text-xl text-blue-100 max-w-2xl mx-auto px-2">
              Count words, characters, sentences, and paragraphs with real-time text analysis and reading time estimates
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
                        placeholder="Type or paste your text here to get instant word count and text statistics..."
                        data-testid="textarea-text-input"
                      />
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                      <Button
                        onClick={handleClear}
                        variant="outline"
                        className="flex-1 py-2.5 sm:py-2 text-sm sm:text-base"
                        data-testid="button-clear-text"
                      >
                        <i className="fas fa-trash mr-2"></i>
                        <span className="hidden sm:inline">Clear Text</span>
                        <span className="sm:hidden">Clear</span>
                      </Button>
                      <Button
                        onClick={handleCopy}
                        variant="outline"
                        className="flex-1 py-2.5 sm:py-2 text-sm sm:text-base"
                        disabled={!result || result.words === 0}
                        data-testid="button-copy-stats"
                      >
                        <i className="fas fa-copy mr-2"></i>
                        <span className="hidden sm:inline">Copy Stats</span>
                        <span className="sm:hidden">Copy</span>
                      </Button>
                    </div>
                  </div>

                  {/* Results Section */}
                  <div className="space-y-4 sm:space-y-6">
                    <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-4 sm:mb-8">Text Statistics</h2>
                    
                    {result && (
                      <div className="space-y-4" data-testid="text-statistics">
                        {/* Main Counts */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                          <div className="bg-blue-50 rounded-lg p-3 sm:p-4 text-center">
                            <div className="text-xl sm:text-2xl font-bold text-blue-600" data-testid="stat-words">
                              {result.words.toLocaleString()}
                            </div>
                            <div className="text-xs sm:text-sm text-gray-600">Words</div>
                          </div>
                          <div className="bg-green-50 rounded-lg p-3 sm:p-4 text-center">
                            <div className="text-xl sm:text-2xl font-bold text-green-600" data-testid="stat-characters">
                              {result.characters.toLocaleString()}
                            </div>
                            <div className="text-xs sm:text-sm text-gray-600">Characters</div>
                          </div>
                          <div className="bg-purple-50 rounded-lg p-3 sm:p-4 text-center">
                            <div className="text-xl sm:text-2xl font-bold text-purple-600" data-testid="stat-characters-no-spaces">
                              {result.charactersNoSpaces.toLocaleString()}
                            </div>
                            <div className="text-xs sm:text-sm text-gray-600">Characters (no spaces)</div>
                          </div>
                          <div className="bg-orange-50 rounded-lg p-3 sm:p-4 text-center">
                            <div className="text-xl sm:text-2xl font-bold text-orange-600" data-testid="stat-sentences">
                              {result.sentences.toLocaleString()}
                            </div>
                            <div className="text-xs sm:text-sm text-gray-600">Sentences</div>
                          </div>
                        </div>

                        {/* Additional Counts */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                          <div className="bg-gray-50 rounded-lg p-3 sm:p-4 text-center">
                            <div className="text-lg sm:text-xl font-bold text-gray-600" data-testid="stat-paragraphs">
                              {result.paragraphs.toLocaleString()}
                            </div>
                            <div className="text-xs sm:text-sm text-gray-600">Paragraphs</div>
                          </div>
                          <div className="bg-gray-50 rounded-lg p-3 sm:p-4 text-center">
                            <div className="text-lg sm:text-xl font-bold text-gray-600" data-testid="stat-lines">
                              {result.lines.toLocaleString()}
                            </div>
                            <div className="text-xs sm:text-sm text-gray-600">Lines</div>
                          </div>
                        </div>

                        {/* Reading Time */}
                        <div className="bg-indigo-50 rounded-lg p-3 sm:p-4">
                          <h3 className="text-sm sm:text-base font-semibold text-indigo-900 mb-2">Reading & Speaking Time</h3>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                            <div className="text-center">
                              <div className="text-base sm:text-lg font-bold text-indigo-600" data-testid="stat-reading-time">
                                {result.readingTime} min
                              </div>
                              <div className="text-xs sm:text-sm text-gray-600">Reading time</div>
                              <div className="text-xs text-gray-500">(200 wpm)</div>
                            </div>
                            <div className="text-center">
                              <div className="text-base sm:text-lg font-bold text-indigo-600" data-testid="stat-speaking-time">
                                {result.speakingTime} min
                              </div>
                              <div className="text-xs sm:text-sm text-gray-600">Speaking time</div>
                              <div className="text-xs text-gray-500">(130 wpm)</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {!result || result.words === 0 ? (
                      <div className="text-center py-8 sm:py-12 text-gray-500">
                        <i className="fas fa-pen text-3xl sm:text-4xl mb-3 sm:mb-4"></i>
                        <p className="text-base sm:text-lg">Start typing to see your text statistics</p>
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
          {/* What is a Word Counter */}
          <div className="mt-8 sm:mt-12 bg-white rounded-2xl shadow-lg p-4 sm:p-6 lg:p-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4 sm:mb-6">What is a Word Counter Tool?</h2>
            <div className="prose max-w-none">
              <p className="text-lg text-gray-700 mb-6">
                A <strong>word counter</strong> is a powerful text analysis tool that instantly calculates various statistics about your written content. Unlike basic counting tools, our advanced word counter provides comprehensive insights including word count, character count (with and without spaces), sentence count, paragraph count, reading time estimates, and speaking time calculations.
              </p>
              
              <p className="text-gray-700 mb-6">
                Our online word counter tool works in real-time, automatically updating statistics as you type or paste text. This makes it perfect for writers, students, content creators, and professionals who need to monitor text length, meet specific requirements, or analyze content structure for optimal readability and engagement.
              </p>

              <p className="text-gray-700 mb-6">
                The tool calculates reading time based on an average reading speed of 200 words per minute and speaking time at 130 words per minute, helping you estimate how long it will take audiences to consume your content. This is particularly valuable for presentations, speeches, blog posts, and educational materials.
              </p>
            </div>
          </div>

          {/* Benefits and Features */}
          <div className="mt-6 sm:mt-8 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-4 sm:p-6 lg:p-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4 sm:mb-6">Why Use Our Word Counter Tool?</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
              <div className="space-y-4 sm:space-y-6">
                <div>
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2 sm:mb-3">Real-Time Analysis</h3>
                  <p className="text-sm sm:text-base text-gray-700">Get instant feedback as you type with live word counting, character analysis, and text statistics that update automatically without refreshing the page.</p>
                </div>
                
                <div>
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2 sm:mb-3">Comprehensive Statistics</h3>
                  <p className="text-sm sm:text-base text-gray-700">Track multiple metrics including words, characters (with/without spaces), sentences, paragraphs, lines, and estimated reading/speaking times in one convenient location.</p>
                </div>

                <div>
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2 sm:mb-3">Content Optimization</h3>
                  <p className="text-sm sm:text-base text-gray-700">Optimize your content by monitoring word count for blog posts, meta descriptions, and web content to meet best practices and improve readability.</p>
                </div>
              </div>

              <div className="space-y-4 sm:space-y-6">
                <div>
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2 sm:mb-3">Academic Writing Support</h3>
                  <p className="text-sm sm:text-base text-gray-700">Perfect for students and researchers who need to meet specific word count requirements for essays, research papers, dissertations, and academic assignments.</p>
                </div>
                
                <div>
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2 sm:mb-3">Professional Content Creation</h3>
                  <p className="text-sm sm:text-base text-gray-700">Ideal for copywriters, marketers, and content creators who need to create content that fits specific length requirements for social media, advertisements, and marketing materials.</p>
                </div>

                <div>
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2 sm:mb-3">Free and Accessible</h3>
                  <p className="text-sm sm:text-base text-gray-700">No registration required, completely free to use, and works on all devices including desktop, tablet, and mobile browsers for counting words anywhere, anytime.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Use Cases by Audience */}
          <div className="mt-6 sm:mt-8 bg-white rounded-2xl shadow-lg p-4 sm:p-6 lg:p-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4 sm:mb-6">Word Counter Use Cases for Different Audiences</h2>
            
            <div className="space-y-6 sm:space-y-8">
              {/* Students */}
              <div className="border-l-4 border-blue-500 pl-4 sm:pl-6">
                <h3 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-3 sm:mb-4">👨‍🎓 Students & Academics</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                  <div>
                    <h4 className="text-sm sm:text-base font-semibold text-gray-800 mb-2">Essay Writing</h4>
                    <p className="text-sm sm:text-base text-gray-700 mb-3 sm:mb-4">Meet exact word count requirements for college essays, scholarship applications, and academic assignments. Avoid penalties for going over or under specified limits.</p>
                    
                    <h4 className="text-sm sm:text-base font-semibold text-gray-800 mb-2">Research Papers</h4>
                    <p className="text-sm sm:text-base text-gray-700">Track progress on dissertations, theses, and research papers. Monitor section lengths to maintain balanced content distribution and meet publication requirements.</p>
                  </div>
                  <div>
                    <h4 className="text-sm sm:text-base font-semibold text-gray-800 mb-2">Study Materials</h4>
                    <p className="text-sm sm:text-base text-gray-700 mb-3 sm:mb-4">Create study guides and summaries with optimal length for retention. Estimate reading time for study sessions and exam preparation.</p>
                    
                    <h4 className="text-sm sm:text-base font-semibold text-gray-800 mb-2">Presentations</h4>
                    <p className="text-sm sm:text-base text-gray-700">Calculate speaking time for presentations and oral exams. Ensure your presentation fits within allocated time slots.</p>
                  </div>
                </div>
              </div>

              {/* Content Creators */}
              <div className="border-l-4 border-green-500 pl-4 sm:pl-6">
                <h3 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-3 sm:mb-4">✍️ Writers & Content Creators</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2">Blog Writing</h4>
                    <p className="text-gray-700 mb-4">Optimize blog post length for reader engagement. Most successful blog posts range from 1,500-2,500 words for better reader retention and comprehensive coverage.</p>
                    
                    <h4 className="font-semibold text-gray-800 mb-2">Social Media Content</h4>
                    <p className="text-gray-700">Stay within character limits for Twitter (280 characters), Facebook posts, LinkedIn articles, and Instagram captions to maximize engagement and avoid truncation.</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2">Novel Writing</h4>
                    <p className="text-gray-700 mb-4">Track daily writing goals and monitor progress toward target word counts. Most novels range from 70,000-100,000 words depending on genre.</p>
                    
                    <h4 className="font-semibold text-gray-800 mb-2">Article Submissions</h4>
                    <p className="text-gray-700">Meet publisher requirements for magazine articles, guest posts, and freelance writing assignments with precise word count tracking.</p>
                  </div>
                </div>
              </div>

              {/* Business Professionals */}
              <div className="border-l-4 border-purple-500 pl-4 sm:pl-6">
                <h3 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-3 sm:mb-4">💼 Business Professionals</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2">Marketing Copy</h4>
                    <p className="text-gray-700 mb-4">Create compelling ad copy, email campaigns, and marketing materials that fit platform requirements and maintain reader attention.</p>
                    
                    <h4 className="font-semibold text-gray-800 mb-2">Business Reports</h4>
                    <p className="text-gray-700">Ensure executive summaries, quarterly reports, and business proposals meet length requirements while maintaining clarity and impact.</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2">Website Content</h4>
                    <p className="text-gray-700 mb-4">Optimize web page content while ensuring readability. Product descriptions, landing pages, and service pages benefit from optimal word counts.</p>
                    
                    <h4 className="font-semibold text-gray-800 mb-2">Proposals & Contracts</h4>
                    <p className="text-gray-700">Maintain professional standards in business documents while meeting client specifications for length and detail.</p>
                  </div>
                </div>
              </div>

              {/* Researchers */}
              <div className="border-l-4 border-orange-500 pl-4 sm:pl-6">
                <h3 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-3 sm:mb-4">🔬 Researchers & Analysts</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2">Grant Applications</h4>
                    <p className="text-gray-700 mb-4">Meet strict word limits for research grant proposals, ensuring all critical information fits within specified constraints.</p>
                    
                    <h4 className="font-semibold text-gray-800 mb-2">Journal Submissions</h4>
                    <p className="text-gray-700">Adhere to academic journal requirements for abstracts, manuscripts, and research papers with precise word count monitoring.</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2">Survey Analysis</h4>
                    <p className="text-gray-700 mb-4">Analyze open-ended survey responses and qualitative data by measuring text length and complexity for research insights.</p>
                    
                    <h4 className="font-semibold text-gray-800 mb-2">Conference Presentations</h4>
                    <p className="text-gray-700">Prepare conference abstracts and presentation materials that meet submission guidelines and time constraints.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Related Tools Integration */}
          <div className="mt-6 sm:mt-8 bg-gradient-to-r from-indigo-50 to-cyan-50 rounded-2xl p-4 sm:p-6 lg:p-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4 sm:mb-6">Enhance Your Text Analysis with Related Tools</h2>
            <p className="text-base sm:text-lg text-gray-700 mb-6 sm:mb-8">
              Maximize your writing productivity by combining our word counter with other powerful text analysis and editing tools available on our platform.
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              <div className="bg-white rounded-lg p-4 sm:p-6 shadow-sm border border-gray-100">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-3 sm:mb-4">
                  <i className="fas fa-font text-blue-600 text-lg sm:text-xl"></i>
                </div>
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">
                  <a href="/tools/character-counter" className="text-blue-600 hover:text-blue-800 transition-colors">
                    Character Counter
                  </a>
                </h3>
                <p className="text-gray-600 text-xs sm:text-sm">Count characters with and without spaces, perfect for social media posts, meta descriptions, and text messages with character limits.</p>
              </div>

              <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                  <i className="fas fa-list text-green-600 text-xl"></i>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  <a href="/tools/sentence-counter" className="text-blue-600 hover:text-blue-800 transition-colors">
                    Sentence Counter
                  </a>
                </h3>
                <p className="text-gray-600 text-sm">Analyze sentence structure and count sentences to improve readability and writing flow for better content engagement.</p>
              </div>

              <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                  <i className="fas fa-paragraph text-purple-600 text-xl"></i>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  <a href="/tools/paragraph-counter" className="text-blue-600 hover:text-blue-800 transition-colors">
                    Paragraph Counter
                  </a>
                </h3>
                <p className="text-gray-600 text-sm">Count paragraphs and analyze text structure to ensure proper formatting and organization for academic and professional writing.</p>
              </div>

              <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                  <i className="fas fa-text-width text-orange-600 text-xl"></i>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  <a href="/tools/case-converter" className="text-blue-600 hover:text-blue-800 transition-colors">
                    Case Converter
                  </a>
                </h3>
                <p className="text-gray-600 text-sm">Convert text between uppercase, lowercase, title case, and other formats to maintain consistent formatting across your content.</p>
              </div>

              <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                  <i className="fas fa-undo text-red-600 text-xl"></i>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  <a href="/tools/reverse-text-tool" className="text-blue-600 hover:text-blue-800 transition-colors">
                    Reverse Text Tool
                  </a>
                </h3>
                <p className="text-gray-600 text-sm">Reverse text character by character or word by word for creative writing, puzzles, and unique content creation needs.</p>
              </div>

              <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
                <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                  <i className="fas fa-font text-indigo-600 text-xl"></i>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  <a href="/tools/font-style-changer" className="text-blue-600 hover:text-blue-800 transition-colors">
                    Font Style Changer
                  </a>
                </h3>
                <p className="text-gray-600 text-sm">Transform your text with various font styles and decorative characters for social media, presentations, and creative projects.</p>
              </div>
            </div>
          </div>

          {/* Content Guidelines Section */}
          <div className="mt-8 bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Word Count Guidelines for Content Marketing</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">Blog Posts and Articles</h3>
                  <ul className="space-y-2 text-gray-700">
                    <li className="flex items-start">
                      <span className="font-medium text-green-600 mr-2">•</span>
                      <span><strong>Short-form content:</strong> 300-600 words for quick reads and news updates</span>
                    </li>
                    <li className="flex items-start">
                      <span className="font-medium text-green-600 mr-2">•</span>
                      <span><strong>Medium-form content:</strong> 1,000-1,500 words for how-to guides and tutorials</span>
                    </li>
                    <li className="flex items-start">
                      <span className="font-medium text-green-600 mr-2">•</span>
                      <span><strong>Long-form content:</strong> 2,000+ words for comprehensive guides and research articles</span>
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">Social Media Optimization</h3>
                  <ul className="space-y-2 text-gray-700">
                    <li className="flex items-start">
                      <span className="font-medium text-blue-600 mr-2">•</span>
                      <span><strong>Twitter:</strong> 280 characters maximum, but 100-150 characters for better engagement</span>
                    </li>
                    <li className="flex items-start">
                      <span className="font-medium text-blue-600 mr-2">•</span>
                      <span><strong>Facebook:</strong> 40-80 characters for posts, up to 125 characters for optimal reach</span>
                    </li>
                    <li className="flex items-start">
                      <span className="font-medium text-blue-600 mr-2">•</span>
                      <span><strong>LinkedIn:</strong> 150-300 characters for posts, 150-200 words for articles</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">Web Page Content</h3>
                  <ul className="space-y-2 text-gray-700">
                    <li className="flex items-start">
                      <span className="font-medium text-purple-600 mr-2">•</span>
                      <span><strong>Homepage:</strong> 500-800 words to explain your business clearly</span>
                    </li>
                    <li className="flex items-start">
                      <span className="font-medium text-purple-600 mr-2">•</span>
                      <span><strong>Product pages:</strong> 300-500 words with detailed descriptions</span>
                    </li>
                    <li className="flex items-start">
                      <span className="font-medium text-purple-600 mr-2">•</span>
                      <span><strong>About pages:</strong> 500-1,000 words to build trust and credibility</span>
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">Email Marketing</h3>
                  <ul className="space-y-2 text-gray-700">
                    <li className="flex items-start">
                      <span className="font-medium text-orange-600 mr-2">•</span>
                      <span><strong>Subject lines:</strong> 30-50 characters for mobile optimization</span>
                    </li>
                    <li className="flex items-start">
                      <span className="font-medium text-orange-600 mr-2">•</span>
                      <span><strong>Email body:</strong> 50-125 words for newsletters, 200-300 words for detailed content</span>
                    </li>
                    <li className="flex items-start">
                      <span className="font-medium text-orange-600 mr-2">•</span>
                      <span><strong>Call-to-action:</strong> 2-5 words for maximum impact</span>
                    </li>
                  </ul>
                </div>
              </div>
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
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Frequently Asked Questions About Word Counting</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">How accurate is the word count?</h3>
                  <p className="text-gray-600">Our word counter uses industry-standard algorithms that match those used by popular word processors like Microsoft Word, Google Docs, and professional writing software, ensuring consistent and accurate results across platforms.</p>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">What counts as a word?</h3>
                  <p className="text-gray-600">A word is defined as any sequence of characters separated by spaces. This includes numbers (like "2024"), abbreviations (like "Dr."), hyphenated words (like "twenty-one"), and contractions (like "don't"), each counted as individual words.</p>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">How is reading time calculated?</h3>
                  <p className="text-gray-600">Reading time is based on an average reading speed of 200 words per minute for adults, which is the standard used by most content management systems. Speaking time uses 130 words per minute, representing average conversational speaking pace.</p>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Can I use this for academic writing?</h3>
                  <p className="text-gray-600">Absolutely! Our word counter is perfect for academic writing, including essays, research papers, dissertations, grant applications, and any assignment with specific word count requirements. It helps ensure you meet exact specifications.</p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Is my text data secure and private?</h3>
                  <p className="text-gray-600">Yes, your privacy is our priority. All text analysis happens in your browser locally - your content is never sent to our servers, stored, or shared with third parties. Your text remains completely private and secure.</p>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Does the tool work with different languages?</h3>
                  <p className="text-gray-600">Yes, our word counter works with most languages that use space-separated words, including English, Spanish, French, German, and many others. However, it's optimized for languages that use Latin script and space-based word separation.</p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">What's the maximum text length I can analyze?</h3>
                  <p className="text-gray-600">There's no hard limit on text length. Our tool can handle everything from short tweets to full-length novels and academic papers. Performance remains fast even with very large documents.</p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Can I copy the statistics for my records?</h3>
                  <p className="text-gray-600">Yes! Use the "Copy Stats" button to copy all text statistics to your clipboard in a formatted layout. This is perfect for including word count information in reports, submissions, or project documentation.</p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">How does this compare to Microsoft Word's word count?</h3>
                  <p className="text-gray-600">Our word counter follows the same counting standards as Microsoft Word and Google Docs. You should see identical or very similar results, making it a reliable alternative for when you don't have access to desktop software.</p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Is the tool optimized for mobile devices?</h3>
                  <p className="text-gray-600">Yes, our word counter is fully responsive and optimized for mobile devices, tablets, and desktop computers. The interface adapts to your screen size while maintaining full functionality across all devices.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Writing Tips Section */}
          <div className="mt-8 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Professional Writing Tips Using Word Count Analysis</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">📝 Improve Writing Quality</h3>
                  <ul className="space-y-3 text-gray-700">
                    <li className="flex items-start">
                      <span className="font-medium text-emerald-600 mr-2">•</span>
                      <span>Use word count to identify overly long sentences that may confuse readers</span>
                    </li>
                    <li className="flex items-start">
                      <span className="font-medium text-emerald-600 mr-2">•</span>
                      <span>Balance paragraph lengths for better readability and visual appeal</span>
                    </li>
                    <li className="flex items-start">
                      <span className="font-medium text-emerald-600 mr-2">•</span>
                      <span>Track daily writing goals to maintain consistent productivity</span>
                    </li>
                    <li className="flex items-start">
                      <span className="font-medium text-emerald-600 mr-2">•</span>
                      <span>Monitor reading time to ensure content fits audience attention spans</span>
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">🎯 Content Strategy</h3>
                  <ul className="space-y-3 text-gray-700">
                    <li className="flex items-start">
                      <span className="font-medium text-emerald-600 mr-2">•</span>
                      <span>Create content pillars with consistent word counts for brand voice</span>
                    </li>
                    <li className="flex items-start">
                      <span className="font-medium text-emerald-600 mr-2">•</span>
                      <span>Optimize content length based on audience engagement metrics</span>
                    </li>
                    <li className="flex items-start">
                      <span className="font-medium text-emerald-600 mr-2">•</span>
                      <span>Plan content series with progressive word count increases</span>
                    </li>
                    <li className="flex items-start">
                      <span className="font-medium text-emerald-600 mr-2">•</span>
                      <span>Analyze competitor content lengths for market positioning</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">📊 Content Optimization</h3>
                  <ul className="space-y-3 text-gray-700">
                    <li className="flex items-start">
                      <span className="font-medium text-emerald-600 mr-2">•</span>
                      <span>Target optimal word counts for different content types and audiences</span>
                    </li>
                    <li className="flex items-start">
                      <span className="font-medium text-emerald-600 mr-2">•</span>
                      <span>Create comprehensive content that provides thorough coverage</span>
                    </li>
                    <li className="flex items-start">
                      <span className="font-medium text-emerald-600 mr-2">•</span>
                      <span>Ensure meta descriptions stay within 150-160 character limits</span>
                    </li>
                    <li className="flex items-start">
                      <span className="font-medium text-emerald-600 mr-2">•</span>
                      <span>Balance content depth with natural, readable flow</span>
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">⏱️ Time Management</h3>
                  <ul className="space-y-3 text-gray-700">
                    <li className="flex items-start">
                      <span className="font-medium text-emerald-600 mr-2">•</span>
                      <span>Estimate project completion times using word count targets</span>
                    </li>
                    <li className="flex items-start">
                      <span className="font-medium text-emerald-600 mr-2">•</span>
                      <span>Plan presentation lengths based on speaking time calculations</span>
                    </li>
                    <li className="flex items-start">
                      <span className="font-medium text-emerald-600 mr-2">•</span>
                      <span>Set realistic writing quotas based on historical performance</span>
                    </li>
                    <li className="flex items-start">
                      <span className="font-medium text-emerald-600 mr-2">•</span>
                      <span>Break large projects into manageable word count milestones</span>
                    </li>
                  </ul>
                </div>
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