
import { useState, useEffect, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';

interface TextStatistics {
  characters: number;
  charactersNoSpaces: number;
  words: number;
  sentences: number;
  paragraphs: number;
  averageWordsPerSentence: number;
  averageSentencesPerParagraph: number;
  averageCharactersPerWord: number;
  longestWord: string;
  shortestWord: string;
  readingTimeMinutes: number;
  speakingTimeMinutes: number;
  fleschReadingEase: number;
  fleschKincaidGrade: number;
  automatedReadabilityIndex: number;
  readabilityLevel: string;
}

interface KeywordData {
  word: string;
  count: number;
  density: number;
}

const TextStatisticsAnalyzer = () => {
  const [inputText, setInputText] = useState('');
  const [statistics, setStatistics] = useState<TextStatistics | null>(null);
  const [keywordData, setKeywordData] = useState<KeywordData[]>([]);
  const { toast } = useToast();

  // Calculate syllables in a word
  const countSyllables = (word: string): number => {
    word = word.toLowerCase();
    if (word.length <= 3) return 1;
    
    word = word.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '');
    word = word.replace(/^y/, '');
    const matches = word.match(/[aeiouy]{1,2}/g);
    return matches ? matches.length : 1;
  };

  // Calculate Flesch Reading Ease
  const calculateFleschReadingEase = (sentences: number, words: number, syllables: number): number => {
    if (sentences === 0 || words === 0) return 0;
    return 206.835 - (1.015 * (words / sentences)) - (84.6 * (syllables / words));
  };

  // Calculate Flesch-Kincaid Grade Level
  const calculateFleschKincaidGrade = (sentences: number, words: number, syllables: number): number => {
    if (sentences === 0 || words === 0) return 0;
    return (0.39 * (words / sentences)) + (11.8 * (syllables / words)) - 15.59;
  };

  // Calculate Automated Readability Index
  const calculateARI = (sentences: number, words: number, characters: number): number => {
    if (sentences === 0 || words === 0) return 0;
    return (4.71 * (characters / words)) + (0.5 * (words / sentences)) - 21.43;
  };

  // Get readability level description
  const getReadabilityLevel = (fleschScore: number): string => {
    if (fleschScore >= 90) return 'Very Easy';
    if (fleschScore >= 80) return 'Easy';
    if (fleschScore >= 70) return 'Fairly Easy';
    if (fleschScore >= 60) return 'Standard';
    if (fleschScore >= 50) return 'Fairly Difficult';
    if (fleschScore >= 30) return 'Difficult';
    return 'Very Difficult';
  };

  // Analyze text and calculate statistics
  const analyzeText = useMemo(() => {
    if (!inputText.trim()) {
      setStatistics(null);
      setKeywordData([]);
      return;
    }

    const text = inputText.trim();
    
    // Basic counts
    const characters = text.length;
    const charactersNoSpaces = text.replace(/\s/g, '').length;
    
    // Word analysis
    const wordMatches = text.match(/\b\w+\b/g) || [];
    const words = wordMatches.length;
    const wordList = wordMatches.map(word => word.toLowerCase());
    
    // Sentence analysis
    const sentenceMatches = text.match(/[.!?]+/g) || [];
    const sentences = Math.max(sentenceMatches.length, 1);
    
    // Paragraph analysis
    const paragraphMatches = text.split(/\n\s*\n/).filter(p => p.trim().length > 0);
    const paragraphs = Math.max(paragraphMatches.length, 1);
    
    // Word statistics
    const longestWord = wordList.reduce((longest, current) => 
      current.length > longest.length ? current : longest, ''
    );
    const shortestWord = wordList.reduce((shortest, current) => 
      current.length < shortest.length ? current : shortest, wordList[0] || ''
    );
    
    // Calculate syllables
    const totalSyllables = wordList.reduce((total, word) => total + countSyllables(word), 0);
    
    // Readability scores
    const fleschReadingEase = calculateFleschReadingEase(sentences, words, totalSyllables);
    const fleschKincaidGrade = calculateFleschKincaidGrade(sentences, words, totalSyllables);
    const automatedReadabilityIndex = calculateARI(sentences, words, charactersNoSpaces);
    const readabilityLevel = getReadabilityLevel(fleschReadingEase);
    
    // Calculate averages
    const averageWordsPerSentence = words / sentences;
    const averageSentencesPerParagraph = sentences / paragraphs;
    const averageCharactersPerWord = charactersNoSpaces / words;
    
    // Reading and speaking time (average 200 WPM reading, 150 WPM speaking)
    const readingTimeMinutes = words / 200;
    const speakingTimeMinutes = words / 150;
    
    const newStatistics: TextStatistics = {
      characters,
      charactersNoSpaces,
      words,
      sentences,
      paragraphs,
      averageWordsPerSentence: Math.round(averageWordsPerSentence * 10) / 10,
      averageSentencesPerParagraph: Math.round(averageSentencesPerParagraph * 10) / 10,
      averageCharactersPerWord: Math.round(averageCharactersPerWord * 10) / 10,
      longestWord,
      shortestWord,
      readingTimeMinutes: Math.round(readingTimeMinutes * 10) / 10,
      speakingTimeMinutes: Math.round(speakingTimeMinutes * 10) / 10,
      fleschReadingEase: Math.round(fleschReadingEase * 10) / 10,
      fleschKincaidGrade: Math.round(fleschKincaidGrade * 10) / 10,
      automatedReadabilityIndex: Math.round(automatedReadabilityIndex * 10) / 10,
      readabilityLevel
    };
    
    // Keyword density analysis
    const stopWords = new Set([
      'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by',
      'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did',
      'will', 'would', 'could', 'should', 'may', 'might', 'must', 'can', 'this', 'that', 'these',
      'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they', 'me', 'him', 'her', 'us', 'them'
    ]);
    
    const wordFrequency: { [key: string]: number } = {};
    wordList.forEach(word => {
      if (word.length > 2 && !stopWords.has(word)) {
        wordFrequency[word] = (wordFrequency[word] || 0) + 1;
      }
    });
    
    const keywordArray: KeywordData[] = Object.entries(wordFrequency)
      .map(([word, count]) => ({
        word,
        count,
        density: Math.round((count / words) * 10000) / 100
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 20);
    
    setStatistics(newStatistics);
    setKeywordData(keywordArray);
  }, [inputText]);

  useEffect(() => {
    analyzeText;
  }, [analyzeText]);

  const handleCopyStatistics = () => {
    if (!statistics) return;
    
    const statsText = `Text Statistics Analysis:
Characters: ${statistics.characters}
Characters (no spaces): ${statistics.charactersNoSpaces}
Words: ${statistics.words}
Sentences: ${statistics.sentences}
Paragraphs: ${statistics.paragraphs}
Reading Time: ${statistics.readingTimeMinutes} minutes
Readability Level: ${statistics.readabilityLevel}
Flesch Reading Ease: ${statistics.fleschReadingEase}`;
    
    navigator.clipboard.writeText(statsText).then(() => {
      toast({
        title: "Statistics copied",
        description: "Text statistics have been copied to clipboard",
      });
    });
  };

  const handleSampleText = () => {
    setInputText(`The art of writing is a powerful tool for communication and expression. It allows us to share our thoughts, ideas, and emotions with others across time and space. Good writing requires practice, patience, and a deep understanding of language.

Writing can take many forms, from creative fiction to technical documentation. Each type of writing has its own conventions and requirements. However, all effective writing shares certain characteristics: clarity, coherence, and engagement.

To improve your writing skills, read widely and write regularly. Pay attention to how successful authors craft their sentences and organize their ideas. Practice different styles and techniques until they become second nature.

Remember that writing is a process, not a product. The first draft is rarely perfect, and revision is an essential part of creating quality content. Be willing to edit, refine, and sometimes completely rewrite your work to achieve the best possible result.`);
  };

  const handleClear = () => {
    setInputText('');
    setStatistics(null);
    setKeywordData([]);
  };

  const getReadabilityColor = (score: number) => {
    if (score >= 70) return 'text-green-600 bg-green-100';
    if (score >= 50) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Helmet>
        <title>Text Statistics Analyzer - Comprehensive Text Analysis Tool | DapsiWow</title>
        <meta name="description" content="Advanced text statistics analyzer with readability scores, keyword density analysis, and comprehensive text metrics. Analyze reading time, sentence structure, and writing complexity instantly." />
        <meta name="keywords" content="text statistics, text analyzer, readability score, keyword density, flesch reading ease, text metrics, writing analysis, content analysis, text complexity" />
        <meta property="og:title" content="Text Statistics Analyzer - Comprehensive Text Analysis Tool | DapsiWow" />
        <meta property="og:description" content="Professional text analysis tool with readability scores, keyword density, and detailed text statistics for writers and content creators." />
        <meta property="og:type" content="website" />
        <meta name="robots" content="index, follow" />
        <meta name="author" content="DapsiWow" />
        <link rel="canonical" href="https://dapsiwow.com/tools/text-statistics-analyzer" />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            "name": "Text Statistics Analyzer",
            "description": "Comprehensive text analysis tool that provides detailed statistics, readability scores, keyword density analysis, and writing metrics for content optimization and analysis.",
            "url": "https://dapsiwow.com/tools/text-statistics-analyzer",
            "applicationCategory": "UtilityApplication",
            "operatingSystem": "Any",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "USD"
            },
            "featureList": [
              "Comprehensive text statistics",
              "Readability score analysis",
              "Keyword density calculation",
              "Reading and speaking time estimation",
              "Sentence and paragraph analysis",
              "Writing complexity assessment"
            ]
          })}
        </script>
      </Helmet>

      <Header />

      <main>
        {/* Hero Section */}
        <section className="relative py-12 sm:py-16 md:py-20 lg:py-28 xl:py-32 2xl:py-36 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-indigo-600/20"></div>
          <div className="relative max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 xl:px-12 text-center">
            <div className="space-y-4 sm:space-y-6 md:space-y-8 lg:space-y-10">
              <div className="inline-flex items-center px-3 py-1.5 sm:px-4 sm:py-2 md:px-5 md:py-2.5 bg-white/80 backdrop-blur-sm rounded-full border border-blue-200 text-xs sm:text-sm md:text-base">
                <span className="font-medium text-blue-700">Advanced Text Analysis</span>
              </div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl 2xl:text-7xl font-bold text-slate-900 leading-normal tracking-tight overflow-visible" data-testid="text-page-title">
                <span className="block leading-normal">Text Statistics</span>
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 leading-normal pb-2">
                  Analyzer
                </span>
              </h1>
              <p className="text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl text-slate-600 max-w-xs sm:max-w-md md:max-w-2xl lg:max-w-4xl xl:max-w-5xl mx-auto leading-relaxed px-2 sm:px-4 md:px-6">
                Comprehensive text analysis with readability scores, keyword density, and detailed writing metrics
              </p>
            </div>
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
          {/* Main Analyzer Card */}
          <Card className="bg-white/90 backdrop-blur-sm shadow-2xl border-0 rounded-2xl sm:rounded-3xl overflow-hidden">
            <CardContent className="p-0">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
                {/* Input Section */}
                <div className="p-4 sm:p-6 md:p-8 lg:p-10 xl:p-12 space-y-6 sm:space-y-8">
                  <div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">Text Analysis</h2>
                    <p className="text-gray-600">
                      Enter your text to get comprehensive statistics and readability analysis
                    </p>
                  </div>

                  <div className="space-y-4 sm:space-y-6">
                    {/* Text Input */}
                    <div className="space-y-3">
                      <Label htmlFor="text-input" className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                        Text to Analyze
                      </Label>
                      <Textarea
                        id="text-input"
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        className="min-h-[200px] sm:min-h-[250px] lg:min-h-[300px] text-base sm:text-lg border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-blue-500 resize-none"
                        placeholder="Paste or type your text here for comprehensive analysis..."
                        data-testid="textarea-text-input"
                      />
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4 sm:pt-6">
                    <Button
                      onClick={handleSampleText}
                      variant="outline"
                      className="h-12 sm:h-14 px-6 sm:px-8 border-2 border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold text-base sm:text-lg rounded-xl"
                      data-testid="button-sample-text"
                    >
                      Load Sample
                    </Button>
                    <Button
                      onClick={handleClear}
                      variant="outline"
                      className="h-12 sm:h-14 px-6 sm:px-8 border-2 border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold text-base sm:text-lg rounded-xl"
                      data-testid="button-clear"
                    >
                      Clear
                    </Button>
                    {statistics && (
                      <Button
                        onClick={handleCopyStatistics}
                        className="h-12 sm:h-14 px-6 sm:px-8 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold text-base sm:text-lg rounded-xl shadow-lg"
                        data-testid="button-copy-stats"
                      >
                        Copy Stats
                      </Button>
                    )}
                  </div>
                </div>

                {/* Results Section */}
                <div className="bg-gradient-to-br from-gray-50 to-blue-50 p-4 sm:p-6 md:p-8 lg:p-10 xl:p-12">
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6 sm:mb-8">
                    Analysis Results
                  </h2>

                  {statistics ? (
                    <Tabs defaultValue="overview" className="space-y-6">
                      <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="overview">Overview</TabsTrigger>
                        <TabsTrigger value="readability">Readability</TabsTrigger>
                        <TabsTrigger value="keywords">Keywords</TabsTrigger>
                      </TabsList>

                      <TabsContent value="overview" className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="bg-white p-4 rounded-lg shadow-sm">
                            <div className="text-2xl font-bold text-blue-600">{statistics.words}</div>
                            <div className="text-sm text-gray-600">Words</div>
                          </div>
                          <div className="bg-white p-4 rounded-lg shadow-sm">
                            <div className="text-2xl font-bold text-green-600">{statistics.characters}</div>
                            <div className="text-sm text-gray-600">Characters</div>
                          </div>
                          <div className="bg-white p-4 rounded-lg shadow-sm">
                            <div className="text-2xl font-bold text-purple-600">{statistics.sentences}</div>
                            <div className="text-sm text-gray-600">Sentences</div>
                          </div>
                          <div className="bg-white p-4 rounded-lg shadow-sm">
                            <div className="text-2xl font-bold text-orange-600">{statistics.paragraphs}</div>
                            <div className="text-sm text-gray-600">Paragraphs</div>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <div className="bg-white p-4 rounded-lg shadow-sm">
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-sm text-gray-600">Reading Time</span>
                              <span className="font-semibold">{statistics.readingTimeMinutes} min</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-gray-600">Speaking Time</span>
                              <span className="font-semibold">{statistics.speakingTimeMinutes} min</span>
                            </div>
                          </div>

                          <div className="bg-white p-4 rounded-lg shadow-sm">
                            <div className="text-sm text-gray-600 mb-2">Average Words per Sentence</div>
                            <div className="text-xl font-bold text-gray-900">{statistics.averageWordsPerSentence}</div>
                          </div>

                          <div className="bg-white p-4 rounded-lg shadow-sm">
                            <div className="text-sm text-gray-600 mb-1">Longest Word</div>
                            <Badge variant="outline" className="text-sm">{statistics.longestWord}</Badge>
                          </div>
                        </div>
                      </TabsContent>

                      <TabsContent value="readability" className="space-y-4">
                        <div className={`p-4 rounded-lg ${getReadabilityColor(statistics.fleschReadingEase)}`}>
                          <div className="text-lg font-bold mb-1">{statistics.readabilityLevel}</div>
                          <div className="text-sm opacity-80">Overall Readability</div>
                        </div>

                        <div className="space-y-4">
                          <div className="bg-white p-4 rounded-lg shadow-sm">
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-sm text-gray-600">Flesch Reading Ease</span>
                              <span className="font-semibold">{statistics.fleschReadingEase}</span>
                            </div>
                            <Progress value={Math.max(0, Math.min(100, statistics.fleschReadingEase))} className="h-2" />
                          </div>

                          <div className="bg-white p-4 rounded-lg shadow-sm">
                            <div className="text-sm text-gray-600 mb-1">Flesch-Kincaid Grade</div>
                            <div className="text-xl font-bold text-gray-900">{statistics.fleschKincaidGrade}</div>
                          </div>

                          <div className="bg-white p-4 rounded-lg shadow-sm">
                            <div className="text-sm text-gray-600 mb-1">Automated Readability Index</div>
                            <div className="text-xl font-bold text-gray-900">{statistics.automatedReadabilityIndex}</div>
                          </div>
                        </div>
                      </TabsContent>

                      <TabsContent value="keywords" className="space-y-4">
                        <div className="text-sm text-gray-600 mb-4">
                          Top keywords by frequency (excluding common words)
                        </div>
                        <div className="space-y-2 max-h-64 overflow-y-auto">
                          {keywordData.slice(0, 15).map((keyword, index) => (
                            <div key={keyword.word} className="bg-white p-3 rounded-lg shadow-sm flex justify-between items-center">
                              <div className="flex items-center space-x-3">
                                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                                  #{index + 1}
                                </span>
                                <span className="font-medium">{keyword.word}</span>
                              </div>
                              <div className="text-right">
                                <div className="text-sm font-semibold">{keyword.count}x</div>
                                <div className="text-xs text-gray-500">{keyword.density}%</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </TabsContent>
                    </Tabs>
                  ) : (
                    <div className="text-center py-12 sm:py-16">
                      <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-200 rounded-full mx-auto mb-4 sm:mb-6 flex items-center justify-center">
                        <div className="text-2xl sm:text-3xl font-bold text-gray-400">📊</div>
                      </div>
                      <p className="text-gray-500 text-base sm:text-lg px-4">
                        Enter text to see comprehensive analysis and statistics
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* SEO Content Sections */}
          <div className="mt-16 space-y-8">
            {/* What is Text Statistics Analysis */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">What is Text Statistics Analysis?</h2>
                <div className="space-y-4 text-gray-600">
                  <p>
                    <strong>Text statistics analysis</strong> is a comprehensive method of examining written content to understand its structure, complexity, and readability. This analytical approach provides quantitative insights into various aspects of text, including word count, sentence structure, paragraph organization, and overall readability scores.
                  </p>
                  <p>
                    Our advanced text statistics analyzer goes beyond basic word counting to provide professional-grade metrics used by writers, editors, content creators, and SEO specialists. The tool calculates multiple readability scores including Flesch Reading Ease, Flesch-Kincaid Grade Level, and Automated Readability Index to help you optimize your content for specific audiences.
                  </p>
                  <p>
                    Understanding text statistics is crucial for creating effective content that matches your target audience's reading level. Whether you're writing academic papers, marketing copy, technical documentation, or web content, analyzing text statistics helps ensure your message is clear, accessible, and engaging.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Features and Applications */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
                <CardContent className="p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Key Features</h2>
                  <div className="space-y-4">
                    <div className="bg-blue-50 rounded-lg p-4">
                      <h3 className="font-semibold text-blue-900 mb-2">Comprehensive Statistics</h3>
                      <ul className="text-blue-800 text-sm space-y-1">
                        <li>• Character, word, sentence, and paragraph counts</li>
                        <li>• Average sentence length and complexity</li>
                        <li>• Reading and speaking time estimates</li>
                        <li>• Longest and shortest word identification</li>
                      </ul>
                    </div>
                    
                    <div className="bg-green-50 rounded-lg p-4">
                      <h3 className="font-semibold text-green-900 mb-2">Readability Analysis</h3>
                      <ul className="text-green-800 text-sm space-y-1">
                        <li>• Flesch Reading Ease score</li>
                        <li>• Flesch-Kincaid Grade Level</li>
                        <li>• Automated Readability Index (ARI)</li>
                        <li>• Overall readability level assessment</li>
                      </ul>
                    </div>
                    
                    <div className="bg-purple-50 rounded-lg p-4">
                      <h3 className="font-semibold text-purple-900 mb-2">Keyword Analysis</h3>
                      <ul className="text-purple-800 text-sm space-y-1">
                        <li>• Keyword frequency calculation</li>
                        <li>• Keyword density percentages</li>
                        <li>• Stop word filtering</li>
                        <li>• Top keywords ranking</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
                <CardContent className="p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Professional Applications</h2>
                  <div className="space-y-4">
                    <div className="bg-orange-50 rounded-lg p-4">
                      <h3 className="font-semibold text-orange-900 mb-2">Content Writing</h3>
                      <p className="text-orange-800 text-sm">Optimize blog posts, articles, and web content for target reading levels and improve engagement through better readability.</p>
                    </div>
                    
                    <div className="bg-teal-50 rounded-lg p-4">
                      <h3 className="font-semibold text-teal-900 mb-2">SEO Optimization</h3>
                      <p className="text-teal-800 text-sm">Analyze keyword density, optimize content length, and ensure readability scores align with SEO best practices.</p>
                    </div>
                    
                    <div className="bg-red-50 rounded-lg p-4">
                      <h3 className="font-semibold text-red-900 mb-2">Academic Writing</h3>
                      <p className="text-red-800 text-sm">Ensure academic papers meet complexity requirements while maintaining clarity and appropriate grade-level standards.</p>
                    </div>

                    <div className="bg-indigo-50 rounded-lg p-4">
                      <h3 className="font-semibold text-indigo-900 mb-2">Marketing Content</h3>
                      <p className="text-indigo-800 text-sm">Create marketing copy that resonates with target audiences by matching appropriate reading levels and keyword usage.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Understanding Readability Scores */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Understanding Readability Scores</h2>
                <p className="text-gray-600 mb-8">Readability scores help determine how easy or difficult a text is to read and understand. Different formulas use various factors like sentence length, word complexity, and syllable count to calculate these scores.</p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-blue-50 rounded-lg p-6">
                    <h3 className="font-semibold text-blue-900 mb-4">Flesch Reading Ease</h3>
                    <p className="text-blue-800 text-sm mb-4">Scores range from 0-100, with higher scores indicating easier readability.</p>
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between">
                        <span>90-100:</span>
                        <span>Very Easy</span>
                      </div>
                      <div className="flex justify-between">
                        <span>80-89:</span>
                        <span>Easy</span>
                      </div>
                      <div className="flex justify-between">
                        <span>70-79:</span>
                        <span>Fairly Easy</span>
                      </div>
                      <div className="flex justify-between">
                        <span>60-69:</span>
                        <span>Standard</span>
                      </div>
                      <div className="flex justify-between">
                        <span>50-59:</span>
                        <span>Fairly Difficult</span>
                      </div>
                      <div className="flex justify-between">
                        <span>30-49:</span>
                        <span>Difficult</span>
                      </div>
                      <div className="flex justify-between">
                        <span>0-29:</span>
                        <span>Very Difficult</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-green-50 rounded-lg p-6">
                    <h3 className="font-semibold text-green-900 mb-4">Flesch-Kincaid Grade</h3>
                    <p className="text-green-800 text-sm mb-4">Indicates the U.S. school grade level needed to understand the text.</p>
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between">
                        <span>5th grade:</span>
                        <span>Very readable</span>
                      </div>
                      <div className="flex justify-between">
                        <span>6th-8th grade:</span>
                        <span>Plain English</span>
                      </div>
                      <div className="flex justify-between">
                        <span>9th-12th grade:</span>
                        <span>Standard level</span>
                      </div>
                      <div className="flex justify-between">
                        <span>13th-16th grade:</span>
                        <span>College level</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Graduate level:</span>
                        <span>Academic/Technical</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-purple-50 rounded-lg p-6">
                    <h3 className="font-semibold text-purple-900 mb-4">Automated Readability Index</h3>
                    <p className="text-purple-800 text-sm mb-4">Uses character count instead of syllables for more precise calculation.</p>
                    <div className="space-y-2 text-xs">
                      <div className="bg-white p-2 rounded">
                        <strong>Best for:</strong> Technical writing, web content, and international audiences
                      </div>
                      <div className="bg-white p-2 rounded">
                        <strong>Accuracy:</strong> More consistent across different text types
                      </div>
                      <div className="bg-white p-2 rounded">
                        <strong>Usage:</strong> Preferred for digital content optimization
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* FAQ Section */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-8">Frequently Asked Questions</h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">What is a good readability score?</h3>
                      <p className="text-gray-600 text-sm">
                        For most web content, aim for a Flesch Reading Ease score between 60-80 (standard to fairly easy). News websites typically target 60-70, while marketing content may aim for 70-80 for broader appeal.
                      </p>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">How can I improve my text's readability?</h3>
                      <p className="text-gray-600 text-sm">
                        Use shorter sentences, choose simpler words when possible, break up long paragraphs, and vary sentence structure. Our analyzer helps identify areas for improvement by highlighting complex sections.
                      </p>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">What is keyword density and why does it matter?</h3>
                      <p className="text-gray-600 text-sm">
                        Keyword density shows how often specific words appear in your text. For SEO, aim for 1-3% density for primary keywords. Higher density may be seen as keyword stuffing, while lower density might not signal relevance.
                      </p>
                    </div>
                  </div>
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">How accurate are reading time estimates?</h3>
                      <p className="text-gray-600 text-sm">
                        Our estimates use standard rates: 200 words per minute for reading and 150 for speaking. Actual times vary based on content complexity, reader experience, and text difficulty.
                      </p>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Should I target specific grade levels?</h3>
                      <p className="text-gray-600 text-sm">
                        Yes, match your target audience. General web content should aim for 6th-8th grade level, business content for 8th-10th grade, and academic or technical content may require higher levels.
                      </p>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Is this tool suitable for non-English text?</h3>
                      <p className="text-gray-600 text-sm">
                        The tool works best with English text as readability formulas are calibrated for English language patterns. Basic statistics (word count, character count) work for any language.
                      </p>
                    </div>
                  </div>
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

export default TextStatisticsAnalyzer;
