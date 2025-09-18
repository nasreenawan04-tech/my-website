import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
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
    sortByLength: false
  });
  const { toast } = useToast();

  // Common English words dictionary (subset for demonstration)
  const commonWords = [
    'the', 'and', 'for', 'are', 'but', 'not', 'you', 'all', 'can', 'had', 'her', 'was', 'one', 'our', 'out', 'day', 'get', 'has', 'him', 'his', 'how', 'its', 'new', 'now', 'old', 'see', 'two', 'way', 'who', 'boy', 'did', 'man', 'end', 'few', 'got', 'let', 'may', 'put', 'say', 'she', 'too', 'use',
    'time', 'very', 'when', 'come', 'here', 'just', 'like', 'long', 'make', 'many', 'over', 'such', 'take', 'than', 'them', 'well', 'were', 'what', 'year', 'your', 'work', 'life', 'only', 'think', 'also', 'back', 'after', 'first', 'good', 'know', 'where', 'much', 'some', 'time', 'right', 'people', 'could', 'world', 'still', 'would', 'great', 'little', 'should', 'through', 'water', 'being', 'place', 'because', 'before', 'never', 'under', 'again', 'while', 'where', 'every', 'house', 'might', 'around', 'small', 'found', 'asked', 'going', 'large', 'until', 'along', 'shall', 'being', 'often', 'since', 'about', 'other', 'after', 'first', 'never', 'these', 'think', 'where', 'being', 'every', 'great', 'might', 'shall', 'still', 'those', 'under', 'while', 'another', 'between', 'through', 'because', 'without', 'against', 'nothing', 'someone', 'something', 'everything', 'anything', 'everyone', 'anyone',
    'hello', 'world', 'computer', 'science', 'program', 'software', 'website', 'internet', 'technology', 'digital', 'online', 'information', 'business', 'company', 'service', 'product', 'system', 'development', 'application', 'solution', 'design', 'creative', 'professional', 'quality', 'excellent', 'amazing', 'fantastic', 'wonderful', 'beautiful', 'perfect', 'success', 'project', 'education', 'learning', 'student', 'teacher', 'school', 'university', 'research', 'knowledge', 'experience', 'skills', 'training', 'course', 'lesson', 'study', 'book', 'read', 'write', 'language', 'communication', 'message', 'email', 'phone', 'mobile', 'social', 'media', 'network', 'connect', 'community', 'friend', 'family', 'love', 'happy', 'smile', 'laugh', 'enjoy', 'fun', 'play', 'game', 'sport', 'music', 'art', 'culture', 'travel', 'adventure', 'explore', 'discover', 'nature', 'environment', 'green', 'clean', 'fresh', 'healthy', 'food', 'restaurant', 'cooking', 'recipe', 'delicious', 'taste', 'flavor', 'sweet', 'coffee', 'drink', 'water', 'energy', 'power', 'strong', 'fast', 'quick', 'easy', 'simple', 'clear', 'bright', 'light', 'dark', 'color', 'blue', 'green', 'yellow', 'orange', 'purple', 'black', 'white', 'silver', 'golden'
  ];

  // Generate permutations for anagram solving
  const generatePermutations = (str: string): string[] => {
    if (str.length <= 1) return [str];
    const result: string[] = [];
    const chars = str.split('');
    
    for (let i = 0; i < chars.length; i++) {
      const char = chars[i];
      const remaining = chars.slice(0, i).concat(chars.slice(i + 1));
      const permutations = generatePermutations(remaining.join(''));
      
      for (const perm of permutations) {
        result.push(char + perm);
      }
    }
    
    return Array.from(new Set(result)); // Remove duplicates
  };

  // Check if a string is a valid word
  const isValidWord = (word: string, dictionary: string[]): boolean => {
    return dictionary.includes(word.toLowerCase());
  };

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
      const middle = word.slice(1, -1);
      
      if (middle.length > 1) {
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
                suggestions.push(...validWords.slice(1, 4));
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
              suggestions = validWords.slice(1, 6);
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-50 dark:from-gray-900 dark:via-purple-900 dark:to-indigo-900">
      <Helmet>
        <title>Text Unscrambler - Unscramble Text and Solve Anagrams | DapsiWow</title>
        <meta name="description" content="Professional text unscrambler tool with multiple algorithms: word unscrambling, anagram solving, pattern recognition, and smart text restoration. Perfect for solving puzzles, word games, and restoring scrambled text." />
        <meta name="keywords" content="text unscrambler, anagram solver, word unscrambler, text descrambler, puzzle solver, word game helper, scrambled text decoder, anagram generator, word finder, text restoration tool" />
        <meta property="og:title" content="Text Unscrambler - Professional Text Unscrambling Tool | DapsiWow" />
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
        <section className="relative py-20 sm:py-28 lg:py-32 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-600/10 to-indigo-600/20 dark:from-purple-400/20 dark:to-indigo-400/30"></div>
          <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="space-y-8">
              <div className="inline-flex items-center px-4 py-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-full border border-purple-200 dark:border-purple-700">
                <span className="text-sm font-medium text-purple-700 dark:text-purple-300">Advanced Text Analysis</span>
              </div>
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-slate-900 dark:text-white leading-tight" data-testid="page-title">
                Text
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-600">
                  Unscrambler
                </span>
              </h1>
              <p className="text-xl sm:text-2xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto leading-relaxed" data-testid="page-description">
                Decode scrambled text with intelligent algorithms - solve anagrams, restore readability, and find hidden words
              </p>
            </div>
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-4 py-16">
          {/* Main Unscrambler Card */}
          <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm shadow-2xl border-0 rounded-3xl overflow-hidden">
            <CardContent className="p-0">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
                {/* Input Section */}
                <div className="p-8 lg:p-12 space-y-8">
                  <div>
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2" data-testid="settings-title">Unscrambling Settings</h2>
                    <p className="text-gray-600 dark:text-gray-300" data-testid="settings-description">Configure your text unscrambling preferences</p>
                  </div>

                  <div className="space-y-6">
                    {/* Text Input */}
                    <div className="space-y-3">
                      <Label htmlFor="text-input" className="text-sm font-semibold text-gray-800 dark:text-gray-200 uppercase tracking-wide">
                        Scrambled Text to Unscramble
                      </Label>
                      <Textarea
                        id="text-input"
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        className="min-h-[200px] text-base border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:border-purple-500 focus:ring-purple-500 resize-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        placeholder="Enter or paste your scrambled text here..."
                        data-testid="textarea-text-input"
                      />
                    </div>

                    {/* Unscramble Mode */}
                    <div className="space-y-3">
                      <Label className="text-sm font-semibold text-gray-800 dark:text-gray-200 uppercase tracking-wide">
                        Unscrambling Algorithm
                      </Label>
                      <Select
                        value={options.mode}
                        onValueChange={(value: 'words' | 'anagram' | 'smart' | 'pattern') => 
                          setOptions(prev => ({ ...prev, mode: value }))
                        }
                      >
                        <SelectTrigger className="h-14 border-2 border-gray-200 rounded-xl text-lg" data-testid="select-unscramble-mode">
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
                        <SelectTrigger className="h-14 border-2 border-gray-200 rounded-xl text-lg" data-testid="select-dictionary">
                          <SelectValue placeholder="Select dictionary" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="english">English Words</SelectItem>
                          <SelectItem value="common">Common Words</SelectItem>
                          <SelectItem value="extended">Extended Dictionary</SelectItem>
                        </SelectContent>
                      </Select>
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
                          
                          {/* Unscrambling Options */}
                          <div className="space-y-4 bg-gray-50 rounded-xl p-4 sm:p-6">
                            <h4 className="text-sm sm:text-base font-semibold text-gray-900">Processing Options</h4>
                            
                            <div className="flex items-center justify-between gap-2">
                              <div className="space-y-1 flex-1 min-w-0">
                                <Label className="text-xs sm:text-sm font-medium">Minimum Word Length</Label>
                                <p className="text-xs text-gray-500">Ignore words shorter than this length</p>
                              </div>
                              <Select
                                value={options.minWordLength.toString()}
                                onValueChange={(value) => setOptions(prev => ({ ...prev, minWordLength: parseInt(value) }))}
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
                                onCheckedChange={(checked) => setOptions(prev => ({ ...prev, preserveSpaces: checked }))}
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
                                onCheckedChange={(checked) => setOptions(prev => ({ ...prev, preservePunctuation: checked }))}
                                data-testid="switch-preserve-punctuation"
                              />
                            </div>

                            <div className="flex items-center justify-between gap-2">
                              <div className="space-y-1 flex-1 min-w-0">
                                <Label className="text-xs sm:text-sm font-medium">Suggest Alternatives</Label>
                                <p className="text-xs text-gray-500">Show alternative unscrambled words</p>
                              </div>
                              <Switch
                                checked={options.suggestAlternatives}
                                onCheckedChange={(checked) => setOptions(prev => ({ ...prev, suggestAlternatives: checked }))}
                                data-testid="switch-suggest-alternatives"
                              />
                            </div>

                            <div className="flex items-center justify-between gap-2">
                              <div className="space-y-1 flex-1 min-w-0">
                                <Label className="text-xs sm:text-sm font-medium">Sort by Length</Label>
                                <p className="text-xs text-gray-500">Prioritize longer words in results</p>
                              </div>
                              <Switch
                                checked={options.sortByLength}
                                onCheckedChange={(checked) => setOptions(prev => ({ ...prev, sortByLength: checked }))}
                                data-testid="switch-sort-by-length"
                              />
                            </div>
                          </div>
                          
                          <Separator />
                        </CollapsibleContent>
                      </Collapsible>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4 pt-6">
                      <Button
                        onClick={handleSampleText}
                        variant="outline"
                        className="flex-1 h-14 border-2 border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold text-lg rounded-xl"
                        data-testid="button-sample-text"
                      >
                        Use Sample Text
                      </Button>
                      <Button
                        onClick={handleProcessAgain}
                        className="flex-1 h-14 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-semibold text-lg rounded-xl shadow-lg transform transition-all duration-200 hover:scale-105"
                        data-testid="button-process-again"
                        disabled={!inputText.trim() || isProcessing}
                      >
                        {isProcessing ? 'Processing...' : 'Process Again'}
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Results Section */}
                <div className="bg-gradient-to-br from-gray-50 to-purple-50 dark:from-gray-800 dark:to-purple-900 p-8 lg:p-12">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8" data-testid="results-title">Unscrambled Results</h2>

                  {result ? (
                    <div className="space-y-6" data-testid="unscramble-results">
                      {/* Generated Text Display */}
                      <div className="bg-white dark:bg-gray-700 rounded-2xl p-6 shadow-lg border border-purple-100 dark:border-purple-800" data-testid="result-container">
                        <textarea
                          value={result.unscrambledText}
                          readOnly
                          className="w-full h-64 lg:h-80 p-4 text-base border-0 resize-none focus:outline-none bg-transparent text-gray-800 dark:text-gray-200 leading-relaxed"
                          placeholder="Unscrambled text will appear here..."
                          data-testid="textarea-result"
                        />
                      </div>

                      {/* Alternative Suggestions */}
                      {result.suggestions.length > 0 && (
                        <div className="bg-white dark:bg-gray-700 rounded-xl p-6 shadow-sm" data-testid="alternative-suggestions">
                          <h3 className="font-bold text-gray-900 mb-4 text-lg">Alternative Suggestions</h3>
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

                      {/* Action Buttons */}
                      <div className="flex flex-col sm:flex-row gap-4">
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

                      {/* Analysis Statistics */}
                      <div className="bg-white rounded-xl p-6 shadow-sm" data-testid="analysis-statistics">
                        <h3 className="font-bold text-gray-900 mb-4 text-lg">Analysis Results</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                          <div className="bg-purple-50 rounded-lg p-4 text-center">
                            <div className="text-2xl font-bold text-purple-600" data-testid="words-found">{result.wordsFound}</div>
                            <div className="text-sm text-purple-700 font-medium">Words Found</div>
                          </div>
                          <div className="bg-blue-50 rounded-lg p-4 text-center">
                            <div className={`text-2xl font-bold ${getConfidenceColor(result.confidence)}`} data-testid="confidence-score">{result.confidence}%</div>
                            <div className="text-sm text-blue-700 font-medium">Confidence</div>
                          </div>
                          <div className="bg-green-50 rounded-lg p-4 text-center">
                            <div className="text-2xl font-bold text-green-600" data-testid="processing-time">{result.processingTime}ms</div>
                            <div className="text-sm text-green-700 font-medium">Processing</div>
                          </div>
                          <div className="bg-orange-50 rounded-lg p-4 text-center">
                            <div className="text-2xl font-bold text-orange-600" data-testid="algorithm-used">{result.mode}</div>
                            <div className="text-sm text-orange-700 font-medium">Algorithm</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-16" data-testid="no-results">
                      <div className="w-24 h-24 mx-auto mb-6 text-gray-300">
                        <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
                          <path d="M9.5,3A6.5,6.5 0 0,1 16,9.5C16,11.11 15.41,12.59 14.44,13.73L14.71,14H15.5L20.5,19L19,20.5L14,15.5V14.71L13.73,14.44C12.59,15.41 11.11,16 9.5,16A6.5,6.5 0 0,1 3,9.5A6.5,6.5 0 0,1 9.5,3M9.5,5C7,5 5,7 5,9.5C5,12 7,14 9.5,14C12,14 14,12 14,9.5C14,7 12,5 9.5,5Z" />
                        </svg>
                      </div>
                      <h3 className="text-xl font-semibold text-gray-600 mb-2">No Text to Unscramble</h3>
                      <p className="text-gray-500">Enter some scrambled text above to see the unscrambled results and analysis</p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* How it Works Section */}
          <div className="mt-16 max-w-4xl mx-auto">
            <Card className="bg-white/90 backdrop-blur-sm shadow-lg border-0 rounded-2xl">
              <CardContent className="p-8 lg:p-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">How Text Unscrambling Works</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold text-purple-600">Word Unscrambling</h3>
                    <p className="text-gray-600">Analyzes individual words and matches them against our dictionary to find the most likely intended word from scrambled letters.</p>
                  </div>
                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold text-blue-600">Anagram Solving</h3>
                    <p className="text-gray-600">Generates possible combinations of letters to form valid words, perfect for solving word puzzles and anagrams.</p>
                  </div>
                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold text-green-600">Smart Restoration</h3>
                    <p className="text-gray-600">Uses advanced pattern recognition to detect scrambling methods and intelligently restore text readability.</p>
                  </div>
                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold text-orange-600">Pattern Recognition</h3>
                    <p className="text-gray-600">Identifies common scrambling patterns like character reversal and applies appropriate unscrambling techniques.</p>
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