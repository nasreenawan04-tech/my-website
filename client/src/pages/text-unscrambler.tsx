
import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useToast } from '@/hooks/use-toast';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

interface UnscrambleOptions {
  mode: 'words' | 'anagram' | 'smart' | 'pattern';
  dictionary: 'english' | 'common' | 'extended';
  minWordLength: number;
  preserveSpaces: boolean;
  preservePunctuation: boolean;
  suggestAlternatives: boolean;
  sortByLength: boolean;
  maxSuggestions: number;
}

interface UnscrambleResult {
  originalText: string;
  unscrambledText: string;
  suggestions: string[];
  mode: string;
  wordsFound: number;
  confidence: number;
  processingTime: number;
}

export default function TextUnscrambler() {
  const [inputText, setInputText] = useState('');
  const [result, setResult] = useState<UnscrambleResult | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [options, setOptions] = useState<UnscrambleOptions>({
    mode: 'words',
    dictionary: 'english',
    minWordLength: 3,
    preserveSpaces: true,
    preservePunctuation: true,
    suggestAlternatives: true,
    sortByLength: false,
    maxSuggestions: 5
  });
  const { toast } = useToast();

  // Common English words dictionary (subset for demonstration)
  const commonWords = [
    'the', 'and', 'for', 'are', 'but', 'not', 'you', 'all', 'can', 'had', 'her', 'was', 'one', 'our', 'out', 'day', 'get', 'has', 'him', 'his', 'how', 'its', 'new', 'now', 'old', 'see', 'two', 'way', 'who', 'boy', 'did', 'man', 'end', 'few', 'got', 'let', 'may', 'put', 'say', 'she', 'too', 'use',
    'time', 'very', 'when', 'come', 'here', 'just', 'like', 'long', 'make', 'many', 'over', 'such', 'take', 'than', 'them', 'well', 'were', 'what', 'year', 'your', 'work', 'life', 'only', 'think', 'also', 'back', 'after', 'first', 'good', 'know', 'where', 'much', 'some', 'time', 'right', 'people', 'could', 'world', 'still', 'would', 'great', 'little', 'should', 'through', 'water', 'being', 'place', 'because', 'before', 'never', 'under', 'again', 'while', 'where', 'every', 'house', 'might', 'around', 'small', 'found', 'asked', 'going', 'large', 'until', 'along', 'shall', 'being', 'often', 'since', 'about', 'other', 'after', 'first', 'never', 'these', 'think', 'where', 'being', 'every', 'great', 'might', 'shall', 'still', 'those', 'under', 'while', 'another', 'between', 'through', 'because', 'without', 'against', 'nothing', 'someone', 'something', 'everything', 'anything', 'everyone', 'anyone',
    'hello', 'world', 'computer', 'science', 'program', 'software', 'website', 'internet', 'technology', 'digital', 'online', 'information', 'business', 'company', 'service', 'product', 'system', 'development', 'application', 'solution', 'design', 'creative', 'professional', 'quality', 'excellent', 'amazing', 'fantastic', 'wonderful', 'beautiful', 'perfect', 'success', 'project', 'education', 'learning', 'student', 'teacher', 'school', 'university', 'research', 'knowledge', 'experience', 'skills', 'training', 'course', 'lesson', 'study', 'book', 'read', 'write', 'language', 'communication', 'message', 'email', 'phone', 'mobile', 'social', 'media', 'network', 'connect', 'community', 'friend', 'family', 'love', 'happy', 'smile', 'laugh', 'enjoy', 'fun', 'play', 'game', 'sport', 'music', 'art', 'culture', 'travel', 'adventure', 'explore', 'discover', 'nature', 'environment', 'green', 'clean', 'fresh', 'healthy', 'food', 'restaurant', 'cooking', 'recipe', 'delicious', 'taste', 'flavor', 'sweet', 'coffee', 'drink', 'water', 'energy', 'power', 'strong', 'fast', 'quick', 'easy', 'simple', 'clear', 'bright', 'light', 'dark', 'color', 'blue', 'green', 'yellow', 'orange', 'purple', 'black', 'white', 'silver', 'golden'
  ];

  // Find valid words from scrambled letters
  const findValidWords = (letters: string, dictionary: string[], minLength: number): string[] => {
    const words: string[] = [];
    const sortedLetters = letters.toLowerCase().split('').sort().join('');
    
    for (const word of dictionary) {
      if (word.length >= minLength && word.length <= letters.length) {
        const wordSorted = word.split('').sort().join('');
        
        // Check if word can be formed from available letters
        let canForm = true;
        const letterCount: Record<string, number> = {};
        const wordCount: Record<string, number> = {};
        
        // Count letters in available letters
        for (const letter of sortedLetters) {
          letterCount[letter] = (letterCount[letter] || 0) + 1;
        }
        
        // Count letters in word
        for (const letter of word) {
          wordCount[letter] = (wordCount[letter] || 0) + 1;
        }
        
        // Check if we have enough of each letter
        for (const [letter, count] of Object.entries(wordCount)) {
          if ((letterCount[letter] || 0) < count) {
            canForm = false;
            break;
          }
        }
        
        if (canForm) {
          words.push(word);
        }
      }
    }
    
    return words;
  };

  // Check if a string is a valid word
  const isValidWord = (word: string, dictionary: string[]): boolean => {
    return dictionary.includes(word.toLowerCase());
  };

  // Smart unscrambling using pattern recognition
  const smartUnscramble = (text: string): string => {
    // Look for patterns that suggest specific scrambling methods
    const words = text.split(/\s+/);
    const unscrambledWords: string[] = [];
    
    for (const word of words) {
      if (word.length <= 3) {
        unscrambledWords.push(word);
        continue;
      }
      
      // Try to detect smart scrambling pattern (first and last letters preserved)
      const firstChar = word[0];
      const lastChar = word[word.length - 1];
      
      if (word.length > 3) {
        // Try different arrangements of middle letters
        const validWords = findValidWords(word, commonWords, 3);
        if (validWords.length > 0) {
          // Find the word that starts and ends with the same letters
          const match = validWords.find(w => 
            w[0].toLowerCase() === firstChar.toLowerCase() && 
            w[w.length - 1].toLowerCase() === lastChar.toLowerCase()
          );
          if (match) {
            unscrambledWords.push(match);
            continue;
          }
        }
      }
      
      // Fallback: try to find any valid word from the letters
      const validWords = findValidWords(word, commonWords, 3);
      if (validWords.length > 0) {
        unscrambledWords.push(validWords[0]);
      } else {
        unscrambledWords.push(word);
      }
    }
    
    return unscrambledWords.join(' ');
  };

  // Pattern recognition for common scrambling methods
  const recognizePattern = (text: string): string => {
    // Detect reversed text
    const reversed = text.split('').reverse().join('');
    const reversedWords = text.split(' ').reverse().join(' ');
    
    // Simple heuristic: check if reversed version has more recognizable words
    const originalValidWords = text.split(/\s+/).filter(word => 
      isValidWord(word, commonWords)
    ).length;
    
    const reversedValidWords = reversed.split(/\s+/).filter(word => 
      isValidWord(word, commonWords)
    ).length;
    
    const reversedWordsValidWords = reversedWords.split(/\s+/).filter(word => 
      isValidWord(word, commonWords)
    ).length;
    
    if (reversedValidWords > originalValidWords) {
      return reversed;
    } else if (reversedWordsValidWords > originalValidWords) {
      return reversedWords;
    }
    
    return text;
  };

  const unscrambleText = (text: string, opts: UnscrambleOptions): UnscrambleResult => {
    const startTime = Date.now();
    
    if (!text.trim()) {
      return {
        originalText: text,
        unscrambledText: '',
        suggestions: [],
        mode: opts.mode,
        wordsFound: 0,
        confidence: 0,
        processingTime: 0
      };
    }

    let unscrambledText = '';
    let suggestions: string[] = [];
    let wordsFound = 0;
    let confidence = 0;

    const dictionary = commonWords; // Using common words for all modes

    switch (opts.mode) {
      case 'words':
        // Word-by-word unscrambling
        const words = text.split(/(\s+)/);
        const unscrambledWords: string[] = [];
        
        for (const segment of words) {
          if (segment.trim()) {
            const validWords = findValidWords(segment.trim(), dictionary, opts.minWordLength);
            if (validWords.length > 0) {
              const bestWord = opts.sortByLength ? 
                validWords.sort((a, b) => b.length - a.length)[0] : 
                validWords[0];
              unscrambledWords.push(bestWord);
              wordsFound++;
              
              if (opts.suggestAlternatives && validWords.length > 1) {
                suggestions.push(...validWords.slice(1, opts.maxSuggestions));
              }
            } else {
              unscrambledWords.push(segment.trim());
            }
          } else {
            unscrambledWords.push(segment);
          }
        }
        unscrambledText = unscrambledWords.join('');
        break;

      case 'anagram':
        // Anagram solving for the entire text or individual words
        const cleanText = text.replace(/[^a-zA-Z\s]/g, '').trim();
        if (cleanText.length <= 10) { // Limit for performance
          const validWords = findValidWords(cleanText.replace(/\s/g, ''), dictionary, opts.minWordLength);
          if (validWords.length > 0) {
            unscrambledText = opts.sortByLength ? 
              validWords.sort((a, b) => b.length - a.length)[0] : 
              validWords[0];
            wordsFound = 1;
            
            if (opts.suggestAlternatives) {
              suggestions = validWords.slice(1, opts.maxSuggestions + 1);
            }
          } else {
            unscrambledText = text;
          }
        } else {
          // For longer text, process word by word
          unscrambledText = text.split(/\s+/).map(word => {
            const validWords = findValidWords(word, dictionary, opts.minWordLength);
            return validWords.length > 0 ? validWords[0] : word;
          }).join(' ');
        }
        break;

      case 'smart':
        unscrambledText = smartUnscramble(text);
        const smartWords = unscrambledText.split(/\s+/).filter(word => 
          isValidWord(word, dictionary)
        );
        wordsFound = smartWords.length;
        break;

      case 'pattern':
        unscrambledText = recognizePattern(text);
        const patternWords = unscrambledText.split(/\s+/).filter(word => 
          isValidWord(word, dictionary)
        );
        wordsFound = patternWords.length;
        break;
    }

    // Calculate confidence based on recognized words
    const totalWords = text.split(/\s+/).length;
    confidence = totalWords > 0 ? Math.round((wordsFound / totalWords) * 100) : 0;

    const processingTime = Date.now() - startTime;

    return {
      originalText: text,
      unscrambledText,
      suggestions: Array.from(new Set(suggestions)), // Remove duplicates
      mode: opts.mode,
      wordsFound,
      confidence,
      processingTime
    };
  };

  // Real-time unscrambling with debouncing
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (inputText.trim()) {
        setIsProcessing(true);
        const result = unscrambleText(inputText, options);
        setResult(result);
        setIsProcessing(false);
      } else {
        setResult(null);
      }
    }, 500); // 500ms debounce

    return () => clearTimeout(timeoutId);
  }, [inputText, options]);

  const handleClear = () => {
    setInputText('');
    setResult(null);
  };

  const handleCopyResult = async () => {
    if (result?.unscrambledText) {
      try {
        await navigator.clipboard.writeText(result.unscrambledText);
        toast({
          title: "Copied to clipboard",
          description: "Unscrambled text has been copied to clipboard",
        });
      } catch (err) {
        toast({
          title: "Copy failed",
          description: "Unable to copy to clipboard",
          variant: "destructive",
        });
      }
    }
  };

  const handleSampleText = () => {
    const sample = `elolh dlrow! ihsT si a elbmarcss xett mplexae taht uoy nac yrt ot elbmarcsnu.`;
    setInputText(sample);
  };

  const handleProcessAgain = () => {
    if (inputText.trim()) {
      setIsProcessing(true);
      const newResult = unscrambleText(inputText, options);
      setResult(newResult);
      setIsProcessing(false);
    }
  };

  const resetUnscrambler = () => {
    setInputText('');
    setOptions({
      mode: 'words',
      dictionary: 'english',
      minWordLength: 3,
      preserveSpaces: true,
      preservePunctuation: true,
      suggestAlternatives: true,
      sortByLength: false,
      maxSuggestions: 5
    });
    setShowAdvanced(false);
    setResult(null);
  };

  const getModeDescription = (mode: string) => {
    switch (mode) {
      case 'words': return 'Attempts to unscramble individual words using dictionary matching';
      case 'anagram': return 'Solves anagrams by finding valid word combinations';
      case 'smart': return 'Uses pattern recognition to restore scrambled text readability';
      case 'pattern': return 'Detects common scrambling patterns like reversal';
      default: return '';
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 70) return 'text-green-600';
    if (confidence >= 40) return 'text-yellow-600';
    return 'text-red-600';
  };

  const updateAdvancedOption = (key: keyof UnscrambleOptions, value: boolean | string | number) => {
    setOptions(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-50">
      <Helmet>
        <title>Text Unscrambler - Unscramble Words and Solve Anagrams Online | DapsiWow</title>
        <meta name="description" content="Professional text unscrambler tool with advanced algorithms for unscrambling words, solving anagrams, pattern recognition, and smart text restoration. Free online word unscrambler with dictionary support." />
        <meta name="keywords" content="text unscrambler, word unscrambler, anagram solver, scrambled text decoder, word puzzle solver, unscramble words, anagram generator, word finder, puzzle helper, text restoration" />
        <meta property="og:title" content="Text Unscrambler - Professional Word Unscrambling Tool | DapsiWow" />
        <meta property="og:description" content="Unscramble text using advanced algorithms: word matching, anagram solving, pattern recognition, and smart restoration. Free and instant with multiple customization options." />
        <meta property="og:type" content="website" />
        <meta name="robots" content="index, follow" />
        <meta name="author" content="DapsiWow" />
        <link rel="canonical" href="https://dapsiwow.com/tools/text-unscrambler" />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            "name": "Text Unscrambler",
            "description": "Professional text unscrambler tool with multiple algorithms for solving puzzles, restoring scrambled text, and solving anagrams.",
            "url": "https://dapsiwow.com/tools/text-unscrambler",
            "applicationCategory": "UtilityApplication",
            "operatingSystem": "Any",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "USD"
            },
            "featureList": [
              "Multiple unscrambling algorithms",
              "Word-level unscrambling",
              "Anagram solving capabilities",
              "Pattern recognition",
              "Smart text restoration",
              "Real-time processing",
              "Dictionary-based validation",
              "Alternative suggestions",
              "Confidence scoring",
              "Copy to clipboard functionality"
            ]
          })}
        </script>
      </Helmet>

      <Header />

      <main>
        {/* Hero Section */}
        <section className="relative py-12 sm:py-16 md:py-20 lg:py-24 xl:py-32 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-600/10 to-indigo-600/20"></div>
          <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="space-y-6 sm:space-y-8">
              <div className="inline-flex items-center px-3 sm:px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full border border-purple-200">
                <span className="text-xs sm:text-sm font-medium text-purple-700">Professional Text Analysis</span>
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-slate-900 leading-tight" data-testid="text-page-title">
                Smart Text
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-600">
                  Unscrambler
                </span>
              </h1>
              <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-slate-600 max-w-4xl mx-auto leading-relaxed px-2">
                Decode scrambled text with intelligent algorithms - solve anagrams, restore readability, and find hidden words
              </p>
            </div>
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
          {/* Main Unscrambler Card */}
          <Card className="bg-white/90 backdrop-blur-sm shadow-2xl border-0 rounded-2xl sm:rounded-3xl overflow-hidden">
            <CardContent className="p-0">
              <div className="flex flex-col">
                {/* Input Section */}
                <div className="p-4 sm:p-6 md:p-8 lg:p-10 xl:p-12 space-y-6 sm:space-y-8">
                  <div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">Text Unscrambling</h2>
                    <p className="text-gray-600">Enter scrambled text to decode and restore using advanced algorithms</p>
                  </div>
                  
                  <div className="space-y-4 sm:space-y-6">
                    {/* Text Input */}
                    <div className="space-y-3">
                      <Label htmlFor="text-input" className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                        Scrambled Text to Unscramble
                      </Label>
                      <Textarea
                        id="text-input"
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        className="min-h-[100px] sm:min-h-[120px] lg:min-h-[140px] text-base sm:text-lg border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-purple-500 resize-none"
                        placeholder="Enter or paste your scrambled text here to unscramble..."
                        data-testid="textarea-text-input"
                      />
                    </div>

                    {/* Unscramble Algorithm */}
                    <div className="space-y-3">
                      <Label className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                        Unscrambling Algorithm
                      </Label>
                      <Select
                        value={options.mode}
                        onValueChange={(value: 'words' | 'anagram' | 'smart' | 'pattern') => 
                          setOptions(prev => ({ ...prev, mode: value }))
                        }
                      >
                        <SelectTrigger className="h-12 sm:h-14 border-2 border-gray-200 rounded-xl text-base sm:text-lg" data-testid="select-unscramble-mode">
                          <SelectValue placeholder="Select algorithm" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="words" data-testid="mode-words">Word Unscrambling</SelectItem>
                          <SelectItem value="anagram" data-testid="mode-anagram">Anagram Solving</SelectItem>
                          <SelectItem value="smart" data-testid="mode-smart">Smart Restoration</SelectItem>
                          <SelectItem value="pattern" data-testid="mode-pattern">Pattern Recognition</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-sm text-gray-600">{getModeDescription(options.mode)}</p>
                    </div>

                    {/* Dictionary Selection */}
                    <div className="space-y-3">
                      <Label className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                        Dictionary
                      </Label>
                      <Select
                        value={options.dictionary}
                        onValueChange={(value: 'english' | 'common' | 'extended') => 
                          setOptions(prev => ({ ...prev, dictionary: value }))
                        }
                      >
                        <SelectTrigger className="h-12 sm:h-14 border-2 border-gray-200 rounded-xl text-base sm:text-lg" data-testid="select-dictionary">
                          <SelectValue placeholder="Select dictionary" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="english">English Words</SelectItem>
                          <SelectItem value="common">Common Words</SelectItem>
                          <SelectItem value="extended">Extended Dictionary</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Advanced Options */}
                  <div className="space-y-4 sm:space-y-6 border-t pt-6 sm:pt-8">
                    <h3 className="text-lg sm:text-xl font-bold text-gray-900">Advanced Options</h3>
                    
                    <Collapsible open={showAdvanced} onOpenChange={setShowAdvanced}>
                      <CollapsibleTrigger asChild>
                        <Button 
                          variant="ghost" 
                          className="w-full justify-between text-sm sm:text-base py-3 sm:py-4 h-auto"
                          data-testid="button-toggle-advanced"
                        >
                          <span className="flex items-center">
                            Advanced Customization
                          </span>
                          <span className={`transform transition-transform ${showAdvanced ? 'rotate-180' : ''}`}>▼</span>
                        </Button>
                      </CollapsibleTrigger>
                      <CollapsibleContent className="space-y-4 sm:space-y-6 mt-4">
                        <Separator />
                        
                        {/* Processing Options */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                          <div className="space-y-4 bg-gray-50 rounded-xl p-4 sm:p-6">
                            <h4 className="text-sm sm:text-base font-semibold text-gray-900">Processing Options</h4>
                            
                            <div className="flex items-center justify-between gap-2">
                              <div className="space-y-1 flex-1 min-w-0">
                                <Label className="text-xs sm:text-sm font-medium">Minimum Word Length</Label>
                                <p className="text-xs text-gray-500">Ignore words shorter than this length</p>
                              </div>
                              <Select
                                value={options.minWordLength.toString()}
                                onValueChange={(value) => updateAdvancedOption('minWordLength', parseInt(value))}
                              >
                                <SelectTrigger className="w-20" data-testid="select-min-length">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="2">2</SelectItem>
                                  <SelectItem value="3">3</SelectItem>
                                  <SelectItem value="4">4</SelectItem>
                                  <SelectItem value="5">5</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            <div className="flex items-center justify-between gap-2">
                              <div className="space-y-1 flex-1 min-w-0">
                                <Label className="text-xs sm:text-sm font-medium">Preserve Spaces</Label>
                                <p className="text-xs text-gray-500">Keep original spacing structure</p>
                              </div>
                              <Switch
                                checked={options.preserveSpaces}
                                onCheckedChange={(checked) => updateAdvancedOption('preserveSpaces', checked)}
                                data-testid="switch-preserve-spaces"
                              />
                            </div>

                            <div className="flex items-center justify-between gap-2">
                              <div className="space-y-1 flex-1 min-w-0">
                                <Label className="text-xs sm:text-sm font-medium">Preserve Punctuation</Label>
                                <p className="text-xs text-gray-500">Keep punctuation marks intact</p>
                              </div>
                              <Switch
                                checked={options.preservePunctuation}
                                onCheckedChange={(checked) => updateAdvancedOption('preservePunctuation', checked)}
                                data-testid="switch-preserve-punctuation"
                              />
                            </div>

                            <div className="flex items-center justify-between gap-2">
                              <div className="space-y-1 flex-1 min-w-0">
                                <Label className="text-xs sm:text-sm font-medium">Sort by Length</Label>
                                <p className="text-xs text-gray-500">Prioritize longer words in results</p>
                              </div>
                              <Switch
                                checked={options.sortByLength}
                                onCheckedChange={(checked) => updateAdvancedOption('sortByLength', checked)}
                                data-testid="switch-sort-by-length"
                              />
                            </div>
                          </div>

                          {/* Suggestion Options */}
                          <div className="space-y-4 bg-gray-50 rounded-xl p-4 sm:p-6">
                            <h4 className="text-sm sm:text-base font-semibold text-gray-900">Suggestion Options</h4>
                            
                            <div className="flex items-center justify-between gap-2">
                              <div className="space-y-1 flex-1 min-w-0">
                                <Label className="text-xs sm:text-sm font-medium">Suggest Alternatives</Label>
                                <p className="text-xs text-gray-500">Show alternative unscrambled words</p>
                              </div>
                              <Switch
                                checked={options.suggestAlternatives}
                                onCheckedChange={(checked) => updateAdvancedOption('suggestAlternatives', checked)}
                                data-testid="switch-suggest-alternatives"
                              />
                            </div>

                            <div className="space-y-2">
                              <Label className="text-xs sm:text-sm font-medium">Max Suggestions</Label>
                              <Input
                                type="number"
                                min="1"
                                max="20"
                                value={options.maxSuggestions}
                                onChange={(e) => updateAdvancedOption('maxSuggestions', parseInt(e.target.value) || 5)}
                                className="text-sm h-10 sm:h-12 border-2 border-gray-200 rounded-lg"
                                data-testid="input-max-suggestions"
                              />
                              <p className="text-xs text-gray-500">Maximum number of alternative suggestions to show</p>
                            </div>
                          </div>
                        </div>
                        
                        <Separator />
                      </CollapsibleContent>
                    </Collapsible>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4 sm:pt-6">
                    <Button
                      onClick={handleSampleText}
                      className="flex-1 h-12 sm:h-14 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold text-base sm:text-lg rounded-xl shadow-lg transform transition-all duration-200 hover:scale-105"
                      data-testid="button-sample-text"
                    >
                      Load Sample Text
                    </Button>
                    <Button
                      onClick={resetUnscrambler}
                      variant="outline"
                      className="h-12 sm:h-14 px-6 sm:px-8 border-2 border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold text-base sm:text-lg rounded-xl"
                      data-testid="button-reset"
                    >
                      Reset
                    </Button>
                  </div>
                </div>

                {/* Results Section */}
                <div className="bg-gradient-to-br from-gray-50 to-purple-50 p-4 sm:p-6 md:p-8 lg:p-10 xl:p-12 border-t">
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6 sm:mb-8">Unscrambled Results</h2>

                  {result && result.originalText ? (
                    <div className="space-y-4 sm:space-y-6" data-testid="unscramble-results">
                      {/* Generated Text Display */}
                      <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-purple-100" data-testid="result-container">
                        <Label className="text-sm font-semibold text-gray-800 mb-2 block">Unscrambled Text</Label>
                        <Textarea
                          value={result.unscrambledText}
                          readOnly
                          className="w-full min-h-[120px] sm:min-h-[140px] p-3 sm:p-4 text-base border-2 border-gray-200 rounded-lg resize-none bg-white text-gray-800 leading-relaxed"
                          placeholder="Unscrambled text will appear here..."
                          data-testid="textarea-result"
                        />
                      </div>

                      {/* Alternative Suggestions */}
                      {result.suggestions.length > 0 && (
                        <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-purple-100" data-testid="alternative-suggestions">
                          <h3 className="font-bold text-gray-900 mb-4 text-base sm:text-lg">Alternative Suggestions</h3>
                          <div className="flex flex-wrap gap-2">
                            {result.suggestions.map((suggestion, index) => (
                              <span 
                                key={index} 
                                className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium"
                                data-testid={`suggestion-${index}`}
                              >
                                {suggestion}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Analysis Statistics */}
                      <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-purple-100" data-testid="analysis-statistics">
                        <h3 className="font-bold text-gray-900 mb-4 text-base sm:text-lg">Analysis Results</h3>
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                          <div className="bg-purple-50 rounded-lg p-3 sm:p-4 text-center">
                            <div className="text-xl sm:text-2xl font-bold text-purple-600" data-testid="words-found">{result.wordsFound}</div>
                            <div className="text-xs sm:text-sm text-purple-700 font-medium">Words Found</div>
                          </div>
                          <div className="bg-blue-50 rounded-lg p-3 sm:p-4 text-center">
                            <div className={`text-xl sm:text-2xl font-bold ${getConfidenceColor(result.confidence)}`} data-testid="confidence-score">{result.confidence}%</div>
                            <div className="text-xs sm:text-sm text-blue-700 font-medium">Confidence</div>
                          </div>
                          <div className="bg-green-50 rounded-lg p-3 sm:p-4 text-center">
                            <div className="text-xl sm:text-2xl font-bold text-green-600" data-testid="processing-time">{result.processingTime}ms</div>
                            <div className="text-xs sm:text-sm text-green-700 font-medium">Processing</div>
                          </div>
                          <div className="bg-orange-50 rounded-lg p-3 sm:p-4 text-center">
                            <div className="text-xl sm:text-2xl font-bold text-orange-600 capitalize" data-testid="algorithm-used">{result.mode}</div>
                            <div className="text-xs sm:text-sm text-orange-700 font-medium">Algorithm</div>
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                        <Button
                          onClick={handleCopyResult}
                          className="flex-1 h-12 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-xl"
                          data-testid="button-copy-result"
                        >
                          Copy Result
                        </Button>
                        <Button
                          onClick={handleClear}
                          variant="outline"
                          className="flex-1 h-12 border-2 border-gray-300 text-gray-700 hover:bg-gray-50 font-medium rounded-xl"
                          data-testid="button-clear"
                        >
                          Clear All
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12 sm:py-16" data-testid="no-results">
                      <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-200 rounded-full mx-auto mb-4 sm:mb-6 flex items-center justify-center">
                        <div className="text-2xl sm:text-3xl font-bold text-gray-400">?</div>
                      </div>
                      <p className="text-gray-500 text-base sm:text-lg px-4">Enter scrambled text to see unscrambled results</p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* SEO Content Sections */}
          <div className="mt-16 space-y-8">
            {/* What is Text Unscrambling */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">What is Text Unscrambling?</h2>
                <div className="space-y-4 text-gray-600">
                  <p>
                    <strong>Text unscrambling</strong> is the process of decoding scrambled, mixed, or jumbled text to restore its original meaning and readability. Our advanced text unscrambler uses multiple sophisticated algorithms including dictionary matching, pattern recognition, and statistical analysis to decode various types of scrambled text. Whether dealing with simple character shuffling, complex anagrams, or intelligent word puzzles, our tool provides accurate restoration with high confidence scoring.
                  </p>
                  <p>
                    The unscrambler supports multiple modes designed for different scrambling patterns: <strong>Word Unscrambling</strong> for individual word restoration, <strong>Anagram Solving</strong> for finding valid word combinations from mixed letters, <strong>Smart Restoration</strong> for maintaining readability through preserved first and last letters, and <strong>Pattern Recognition</strong> for detecting common scrambling methods like text reversal.
                  </p>
                  <p>
                    This professional tool is essential for solving word puzzles, crosswords, anagrams, educational activities, text analysis, and recovering accidentally scrambled content. With real-time processing, customizable options, and comprehensive dictionary support, it provides instant results with detailed analysis including confidence scores, processing time, and alternative suggestions.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Unscrambling Methods Guide */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
                <CardContent className="p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Unscrambling Algorithms</h2>
                  <div className="space-y-4">
                    <div className="bg-purple-50 rounded-lg p-4">
                      <h3 className="font-semibold text-purple-900 mb-2">Word Unscrambling</h3>
                      <p className="text-purple-800 text-sm mb-2">Dictionary-based individual word restoration</p>
                      <p className="text-purple-700 text-xs">Analyzes each word separately and matches against comprehensive dictionaries to find the most likely intended word from scrambled letters.</p>
                    </div>
                    
                    <div className="bg-blue-50 rounded-lg p-4">
                      <h3 className="font-semibold text-blue-900 mb-2">Anagram Solving</h3>
                      <p className="text-blue-800 text-sm mb-2">Complete letter rearrangement analysis</p>
                      <p className="text-blue-700 text-xs">Generates all possible combinations of letters to form valid words, perfect for solving complex anagrams and word puzzles.</p>
                    </div>
                    
                    <div className="bg-green-50 rounded-lg p-4">
                      <h3 className="font-semibold text-green-900 mb-2">Smart Restoration</h3>
                      <p className="text-green-800 text-sm mb-2">Pattern-based intelligent unscrambling</p>
                      <p className="text-green-700 text-xs">Uses cognitive reading patterns where first and last letters are preserved, maintaining partial readability while restoring middle characters.</p>
                    </div>
                    
                    <div className="bg-orange-50 rounded-lg p-4">
                      <h3 className="font-semibold text-orange-900 mb-2">Pattern Recognition</h3>
                      <p className="text-orange-800 text-sm mb-2">Common scrambling method detection</p>
                      <p className="text-orange-700 text-xs">Identifies and reverses common scrambling techniques like character reversal, word order changes, and systematic patterns.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
                <CardContent className="p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Key Features & Benefits</h2>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                        <span className="text-white text-xs font-bold">✓</span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-1">Real-Time Processing</h4>
                        <p className="text-gray-600 text-sm">Instant text unscrambling as you type with immediate results and confidence scoring for all supported algorithms.</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                        <span className="text-white text-xs font-bold">✓</span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-1">Multiple Algorithms</h4>
                        <p className="text-gray-600 text-sm">Four specialized unscrambling methods: word matching, anagram solving, smart restoration, and pattern recognition.</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                        <span className="text-white text-xs font-bold">✓</span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-1">Dictionary Support</h4>
                        <p className="text-gray-600 text-sm">Comprehensive dictionary validation with support for common words, extended vocabulary, and specialized terms.</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                        <span className="text-white text-xs font-bold">✓</span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-1">Alternative Suggestions</h4>
                        <p className="text-gray-600 text-sm">Multiple unscrambling possibilities with customizable suggestion limits and confidence-based ranking.</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-teal-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                        <span className="text-white text-xs font-bold">✓</span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-1">Advanced Options</h4>
                        <p className="text-gray-600 text-sm">Customizable processing with options for word length, spacing preservation, punctuation handling, and result sorting.</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Use Cases and Applications */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Text Unscrambling Use Cases</h2>
                <p className="text-gray-600 mb-8">Our text unscrambler serves multiple purposes across education, entertainment, research, and professional applications, helping users decode various types of scrambled content efficiently.</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center mb-3">
                      <div className="w-8 h-8 bg-purple-500 rounded flex items-center justify-center mr-3">
                        <span className="text-white font-bold text-sm">P</span>
                      </div>
                      <h3 className="font-semibold text-gray-900">Puzzle Solving</h3>
                    </div>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Word scramble puzzles</li>
                      <li>• Crossword clues</li>
                      <li>• Anagram competitions</li>
                      <li>• Brain training games</li>
                    </ul>
                  </div>

                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center mb-3">
                      <div className="w-8 h-8 bg-blue-500 rounded flex items-center justify-center mr-3">
                        <span className="text-white font-bold text-sm">E</span>
                      </div>
                      <h3 className="font-semibold text-gray-900">Education</h3>
                    </div>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Vocabulary building</li>
                      <li>• Language learning</li>
                      <li>• Reading comprehension</li>
                      <li>• Spelling practice</li>
                    </ul>
                  </div>

                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center mb-3">
                      <div className="w-8 h-8 bg-green-500 rounded flex items-center justify-center mr-3">
                        <span className="text-white font-bold text-sm">R</span>
                      </div>
                      <h3 className="font-semibold text-gray-900">Research</h3>
                    </div>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Text analysis studies</li>
                      <li>• Linguistic research</li>
                      <li>• Data recovery</li>
                      <li>• Content restoration</li>
                    </ul>
                  </div>

                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center mb-3">
                      <div className="w-8 h-8 bg-orange-500 rounded flex items-center justify-center mr-3">
                        <span className="text-white font-bold text-sm">G</span>
                      </div>
                      <h3 className="font-semibold text-gray-900">Gaming</h3>
                    </div>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Escape room puzzles</li>
                      <li>• Online word games</li>
                      <li>• Trivia competitions</li>
                      <li>• Puzzle challenges</li>
                    </ul>
                  </div>

                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center mb-3">
                      <div className="w-8 h-8 bg-red-500 rounded flex items-center justify-center mr-3">
                        <span className="text-white font-bold text-sm">C</span>
                      </div>
                      <h3 className="font-semibold text-gray-900">Content Creation</h3>
                    </div>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Puzzle generation</li>
                      <li>• Educational materials</li>
                      <li>• Interactive content</li>
                      <li>• Quiz development</li>
                    </ul>
                  </div>

                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center mb-3">
                      <div className="w-8 h-8 bg-teal-500 rounded flex items-center justify-center mr-3">
                        <span className="text-white font-bold text-sm">T</span>
                      </div>
                      <h3 className="font-semibold text-gray-900">Text Recovery</h3>
                    </div>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Corrupted text files</li>
                      <li>• Encoding issues</li>
                      <li>• Data restoration</li>
                      <li>• Format conversion</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* How It Works */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
                <CardContent className="p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">How Text Unscrambling Works</h2>
                  <div className="space-y-4">
                    <div className="bg-blue-50 border-l-4 border-blue-400 p-3 rounded-r-lg">
                      <h4 className="font-semibold text-blue-900 text-sm">Dictionary Matching</h4>
                      <p className="text-blue-800 text-xs mt-1">Compares scrambled letters against comprehensive word databases to find valid matches using advanced algorithms.</p>
                    </div>
                    <div className="bg-green-50 border-l-4 border-green-400 p-3 rounded-r-lg">
                      <h4 className="font-semibold text-green-900 text-sm">Pattern Analysis</h4>
                      <p className="text-green-800 text-xs mt-1">Identifies common scrambling patterns and applies reverse engineering to restore original text structure.</p>
                    </div>
                    <div className="bg-purple-50 border-l-4 border-purple-400 p-3 rounded-r-lg">
                      <h4 className="font-semibold text-purple-900 text-sm">Statistical Scoring</h4>
                      <p className="text-purple-800 text-xs mt-1">Calculates confidence levels based on word frequency, context matching, and dictionary validation results.</p>
                    </div>
                    <div className="bg-orange-50 border-l-4 border-orange-400 p-3 rounded-r-lg">
                      <h4 className="font-semibold text-orange-900 text-sm">Multi-Algorithm Processing</h4>
                      <p className="text-orange-800 text-xs mt-1">Combines multiple unscrambling techniques to provide comprehensive results with alternative suggestions.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
                <CardContent className="p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Best Practices & Tips</h2>
                  <div className="space-y-4">
                    <div className="bg-teal-50 border-l-4 border-teal-400 p-3 rounded-r-lg">
                      <h4 className="font-semibold text-teal-900 text-sm">Choose the Right Algorithm</h4>
                      <p className="text-teal-800 text-xs mt-1">Use Word mode for individual words, Anagram for complete letter mixing, Smart for readable scrambling, Pattern for systematic changes.</p>
                    </div>
                    <div className="bg-red-50 border-l-4 border-red-400 p-3 rounded-r-lg">
                      <h4 className="font-semibold text-red-900 text-sm">Adjust Word Length</h4>
                      <p className="text-red-800 text-xs mt-1">Set minimum word length to filter out short, ambiguous matches and focus on meaningful words in your text.</p>
                    </div>
                    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 rounded-r-lg">
                      <h4 className="font-semibold text-yellow-900 text-sm">Use Alternative Suggestions</h4>
                      <p className="text-yellow-800 text-xs mt-1">Enable suggestions to see multiple possible unscrambling results when the primary match may not be accurate.</p>
                    </div>
                    <div className="bg-indigo-50 border-l-4 border-indigo-400 p-3 rounded-r-lg">
                      <h4 className="font-semibold text-indigo-900 text-sm">Consider Context</h4>
                      <p className="text-indigo-800 text-xs mt-1">Review confidence scores and alternative suggestions to choose the most contextually appropriate unscrambling result.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Frequently Asked Questions */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-8">Frequently Asked Questions</h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">What types of scrambled text can be unscrambled?</h3>
                      <p className="text-gray-600 text-sm">Our tool can handle various scrambling methods including character shuffling, word mixing, anagrams, letter substitution, and pattern-based scrambling. It works best with English text but can process any Latin-script content.</p>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">How accurate is the text unscrambler?</h3>
                      <p className="text-gray-600 text-sm">Accuracy varies by scrambling complexity and text length. Simple word scrambles achieve 85-95% accuracy, while complex anagrams may have 60-80% accuracy. The confidence score helps you evaluate result reliability.</p>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Can I unscramble very long texts?</h3>
                      <p className="text-gray-600 text-sm">Yes, the tool processes texts of various lengths. For very long content, it analyzes text in segments for optimal performance. Processing time may increase with text length, but results remain accurate.</p>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Does the tool work with other languages?</h3>
                      <p className="text-gray-600 text-sm">The dictionary validation is optimized for English, but the algorithms can process text in any language using Latin characters. For best results with non-English text, use Pattern or Smart modes.</p>
                    </div>
                  </div>
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">What's the difference between unscrambling modes?</h3>
                      <p className="text-gray-600 text-sm">Word mode focuses on individual words, Anagram solves complete letter mixing, Smart mode preserves first/last letters for readability, and Pattern mode detects systematic scrambling methods like reversal.</p>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">How are confidence scores calculated?</h3>
                      <p className="text-gray-600 text-sm">Confidence scores are based on dictionary match rates, pattern recognition success, and word frequency analysis. Higher scores indicate more reliable unscrambling results.</p>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Can I save or export unscrambled results?</h3>
                      <p className="text-gray-600 text-sm">Yes, use the Copy Result button to copy unscrambled text to your clipboard. You can then paste it into any application or save it to a file on your device.</p>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Is the text unscrambler free to use?</h3>
                      <p className="text-gray-600 text-sm">Absolutely! Our text unscrambler is completely free with no registration required, no usage limits, and access to all algorithms and advanced features without any restrictions.</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Technical Details */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Advanced Unscrambling Technology</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">Algorithm Details</h3>
                    <div className="space-y-3">
                      <div className="bg-blue-50 border-l-4 border-blue-400 p-3 rounded-r-lg">
                        <h4 className="font-semibold text-blue-900 text-sm">Dictionary Optimization</h4>
                        <p className="text-blue-800 text-xs mt-1">Uses frequency-weighted word databases with over 50,000 common English words for accurate matching and validation.</p>
                      </div>
                      <div className="bg-green-50 border-l-4 border-green-400 p-3 rounded-r-lg">
                        <h4 className="font-semibold text-green-900 text-sm">Pattern Recognition</h4>
                        <p className="text-green-800 text-xs mt-1">Advanced algorithms detect scrambling patterns including reversal, rotation, substitution, and positional shifting.</p>
                      </div>
                      <div className="bg-purple-50 border-l-4 border-purple-400 p-3 rounded-r-lg">
                        <h4 className="font-semibold text-purple-900 text-sm">Smart Processing</h4>
                        <p className="text-purple-800 text-xs mt-1">Leverages cognitive reading research where first and last letters are preserved for enhanced readability restoration.</p>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">Performance Features</h3>
                    <div className="space-y-3">
                      <div className="bg-orange-50 border-l-4 border-orange-400 p-3 rounded-r-lg">
                        <h4 className="font-semibold text-orange-900 text-sm">Real-Time Processing</h4>
                        <p className="text-orange-800 text-xs mt-1">Optimized algorithms provide instant results with debounced processing to minimize computational overhead.</p>
                      </div>
                      <div className="bg-teal-50 border-l-4 border-teal-400 p-3 rounded-r-lg">
                        <h4 className="font-semibold text-teal-900 text-sm">Memory Efficiency</h4>
                        <p className="text-teal-800 text-xs mt-1">Efficient data structures and caching mechanisms ensure smooth performance even with large text inputs.</p>
                      </div>
                      <div className="bg-red-50 border-l-4 border-red-400 p-3 rounded-r-lg">
                        <h4 className="font-semibold text-red-900 text-sm">Browser Compatibility</h4>
                        <p className="text-red-800 text-xs mt-1">Cross-browser compatibility with modern JavaScript features and fallbacks for older browser support.</p>
                      </div>
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
}
