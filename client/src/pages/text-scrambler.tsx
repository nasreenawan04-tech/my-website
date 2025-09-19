
import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useToast } from '@/hooks/use-toast';

interface ScrambleOptions {
  mode: 'characters' | 'words' | 'lines' | 'smart';
  preserveSpaces: boolean;
  preservePunctuation: boolean;
  preserveCase: boolean;
  intensity: 'low' | 'medium' | 'high';
}

interface ScrambleResult {
  originalText: string;
  scrambledText: string;
  mode: string;
  wordsCount: number;
  charactersCount: number;
  linesCount: number;
}

const TextScrambler = () => {
  const [text, setText] = useState('');
  const [result, setResult] = useState<ScrambleResult | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [options, setOptions] = useState<ScrambleOptions>({
    mode: 'characters',
    preserveSpaces: true,
    preservePunctuation: true,
    preserveCase: false,
    intensity: 'medium'
  });
  const { toast } = useToast();

  // Utility function to shuffle array
  const shuffleArray = <T,>(array: T[], intensity: 'low' | 'medium' | 'high'): T[] => {
    const arr = [...array];
    const shuffleCount = intensity === 'low' ? 1 : intensity === 'medium' ? 3 : 5;
    
    for (let shuffle = 0; shuffle < shuffleCount; shuffle++) {
      for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
      }
    }
    return arr;
  };

  // Smart scramble - preserves first and last letter
  const smartScrambleWord = (word: string): string => {
    if (word.length <= 3) return word;
    
    const firstChar = word[0];
    const lastChar = word[word.length - 1];
    const middle = word.slice(1, -1);
    
    if (middle.length <= 1) return word;
    
    const scrambledMiddle = shuffleArray(middle.split(''), 'medium').join('');
    return firstChar + scrambledMiddle + lastChar;
  };

  const scrambleText = (inputText: string, opts: ScrambleOptions): ScrambleResult => {
    if (!inputText.trim()) {
      return {
        originalText: inputText,
        scrambledText: '',
        mode: opts.mode,
        wordsCount: 0,
        charactersCount: 0,
        linesCount: 0
      };
    }

    let scrambledText = '';
    const words = inputText.trim().split(/\s+/).length;
    const characters = inputText.length;
    const lines = inputText.split('\n').length;

    switch (opts.mode) {
      case 'characters':
        if (opts.preserveSpaces && opts.preservePunctuation) {
          // Only scramble letters and numbers
          const chars = inputText.split('');
          const letterIndices: number[] = [];
          const letters: string[] = [];
          
          chars.forEach((char, index) => {
            if (/[a-zA-Z0-9]/.test(char)) {
              letterIndices.push(index);
              letters.push(char);
            }
          });
          
          const scrambledLetters = shuffleArray(letters, opts.intensity);
          const result = [...chars];
          
          letterIndices.forEach((index, i) => {
            result[index] = scrambledLetters[i];
          });
          
          scrambledText = result.join('');
        } else {
          scrambledText = shuffleArray(inputText.split(''), opts.intensity).join('');
        }
        break;

      case 'words':
        const wordArray = inputText.split(/(\s+)/); // Preserve whitespace
        const actualWords: string[] = [];
        const wordPositions: number[] = [];
        
        wordArray.forEach((segment, index) => {
          if (segment.trim()) {
            actualWords.push(segment);
            wordPositions.push(index);
          }
        });
        
        const scrambledWords = shuffleArray(actualWords, opts.intensity);
        const result = [...wordArray];
        
        wordPositions.forEach((pos, i) => {
          result[pos] = scrambledWords[i];
        });
        
        scrambledText = result.join('');
        break;

      case 'lines':
        const linesArray = inputText.split('\n');
        const scrambledLines = shuffleArray(linesArray, opts.intensity);
        scrambledText = scrambledLines.join('\n');
        break;

      case 'smart':
        // Smart scramble preserves word boundaries and first/last letters
        scrambledText = inputText.replace(/\b\w+\b/g, (word) => {
          if (opts.preserveCase) {
            return smartScrambleWord(word);
          } else {
            const scrambled = smartScrambleWord(word.toLowerCase());
            return word[0] === word[0].toUpperCase() ? 
              scrambled.charAt(0).toUpperCase() + scrambled.slice(1) : scrambled;
          }
        });
        break;
    }

    // Apply case preservation if needed
    if (opts.preserveCase && opts.mode === 'characters') {
      const originalChars = inputText.split('');
      const scrambledChars = scrambledText.split('');
      
      scrambledText = scrambledChars.map((char, index) => {
        if (originalChars[index] && originalChars[index] === originalChars[index].toUpperCase()) {
          return char.toUpperCase();
        }
        return char.toLowerCase();
      }).join('');
    }

    return {
      originalText: inputText,
      scrambledText,
      mode: opts.mode,
      wordsCount: words,
      charactersCount: characters,
      linesCount: lines
    };
  };

  // Real-time scrambling
  useEffect(() => {
    if (text.trim()) {
      const result = scrambleText(text, options);
      setResult(result);
    } else {
      setResult(null);
    }
  }, [text, options]);

  const handleClear = () => {
    setText('');
    setResult(null);
  };

  const handleCopyResult = async () => {
    if (result?.scrambledText) {
      try {
        await navigator.clipboard.writeText(result.scrambledText);
        toast({
          title: "Copied to clipboard",
          description: "Scrambled text has been copied to clipboard",
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
    const sample = `Welcome to DapsiWow's Text Scrambler tool! This innovative application allows you to scramble text in various creative ways. You can choose from different modes like character scrambling, word shuffling, or smart scrambling. Perfect for creating puzzles, testing readability, or just having fun with text manipulation.`;
    setText(sample);
  };

  const handleRegenerateScramble = () => {
    if (text.trim()) {
      const newResult = scrambleText(text, options);
      setResult(newResult);
    }
  };

  const resetCalculator = () => {
    setText('');
    setOptions({
      mode: 'characters',
      preserveSpaces: true,
      preservePunctuation: true,
      preserveCase: false,
      intensity: 'medium'
    });
    setShowAdvanced(false);
    setResult(null);
  };

  const updateOption = (key: keyof ScrambleOptions, value: boolean | string) => {
    setOptions(prev => ({ ...prev, [key]: value }));
  };

  const getModeDescription = (mode: string) => {
    switch (mode) {
      case 'characters': return 'Scrambles individual characters randomly';
      case 'words': return 'Shuffles words while preserving word boundaries';
      case 'lines': return 'Randomly reorders lines of text';
      case 'smart': return 'Preserves first and last letters for readability';
      default: return '';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Helmet>
        <title>Text Scrambler - Scramble Text with Multiple Algorithms | DapsiWow</title>
        <meta name="description" content="Professional text scrambler tool with multiple scrambling algorithms: character shuffling, word mixing, line reordering, and smart scrambling. Perfect for creating puzzles, testing readability, and text manipulation." />
        <meta name="keywords" content="text scrambler, text shuffler, word scrambler, character scrambler, text mixer, scramble generator, text puzzle maker, word puzzle, text manipulation tool, anagram generator" />
        <meta property="og:title" content="Text Scrambler - Professional Text Scrambling Tool | DapsiWow" />
        <meta property="og:description" content="Scramble text using various advanced algorithms: character shuffling, word scrambling, line mixing, and smart scrambling. Free and instant with multiple customization options." />
        <meta property="og:type" content="website" />
        <meta name="robots" content="index, follow" />
        <meta name="author" content="DapsiWow" />
        <link rel="canonical" href="https://dapsiwow.com/tools/text-scrambler" />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            "name": "Text Scrambler",
            "description": "Professional text scrambler tool with multiple algorithms for creating puzzles, testing text readability, and creative text manipulation.",
            "url": "https://dapsiwow.com/tools/text-scrambler",
            "applicationCategory": "UtilityApplication",
            "operatingSystem": "Any",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "USD"
            },
            "featureList": [
              "Multiple scrambling algorithms",
              "Character-level scrambling",
              "Word shuffling with boundaries",
              "Line reordering",
              "Smart scrambling with readability",
              "Real-time processing",
              "Customizable intensity levels",
              "Copy to clipboard functionality"
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
                <span className="text-xs sm:text-sm font-medium text-blue-700">Advanced Text Manipulation</span>
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl 2xl:text-8xl font-bold text-slate-900 leading-tight tracking-tight" data-testid="text-page-title">
                <span className="block">Smart Text</span>
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 mt-1 sm:mt-2">
                  Scrambler
                </span>
              </h1>
              <p className="text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl text-slate-600 max-w-sm sm:max-w-lg md:max-w-2xl lg:max-w-3xl xl:max-w-4xl mx-auto leading-relaxed px-2 sm:px-0">
                Transform text with multiple scrambling algorithms - perfect for puzzles, privacy, and creative text manipulation
              </p>
            </div>
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
          {/* Main Scrambler Card */}
          <Card className="bg-white/90 backdrop-blur-sm shadow-2xl border-0 rounded-2xl sm:rounded-3xl overflow-hidden">
            <CardContent className="p-0">
              <div className="flex flex-col">
                {/* Input Section */}
                <div className="p-4 sm:p-6 md:p-8 lg:p-10 xl:p-12 space-y-6 sm:space-y-8">
                  <div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">Text Scrambling</h2>
                    <p className="text-gray-600">Configure your text scrambling preferences and algorithms</p>
                  </div>
                  
                  <div className="space-y-4 sm:space-y-6">
                    {/* Text Input */}
                    <div className="space-y-3">
                      <Label htmlFor="text-input" className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                        Text to Scramble
                      </Label>
                      <Textarea
                        id="text-input"
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        className="min-h-[100px] sm:min-h-[120px] lg:min-h-[140px] text-base sm:text-lg border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-blue-500 resize-none"
                        placeholder="Enter or paste your text here to scramble..."
                        data-testid="textarea-text-input"
                      />
                    </div>

                    {/* Scramble Mode */}
                    <div className="space-y-3">
                      <Label className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                        Scrambling Algorithm
                      </Label>
                      <Select
                        value={options.mode}
                        onValueChange={(value: 'characters' | 'words' | 'lines' | 'smart') => 
                          updateOption('mode', value)
                        }
                      >
                        <SelectTrigger className="h-12 sm:h-14 border-2 border-gray-200 rounded-xl text-base sm:text-lg" data-testid="select-scramble-mode">
                          <SelectValue placeholder="Select algorithm" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="characters" data-testid="mode-characters">Character Scrambling</SelectItem>
                          <SelectItem value="words" data-testid="mode-words">Word Shuffling</SelectItem>
                          <SelectItem value="lines" data-testid="mode-lines">Line Reordering</SelectItem>
                          <SelectItem value="smart" data-testid="mode-smart">Smart Scrambling</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-sm text-gray-600">{getModeDescription(options.mode)}</p>
                    </div>

                    {/* Intensity Level */}
                    <div className="space-y-3">
                      <Label className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                        Scramble Intensity
                      </Label>
                      <Select
                        value={options.intensity}
                        onValueChange={(value: 'low' | 'medium' | 'high') => 
                          updateOption('intensity', value)
                        }
                      >
                        <SelectTrigger className="h-12 sm:h-14 border-2 border-gray-200 rounded-xl text-base sm:text-lg" data-testid="select-intensity">
                          <SelectValue placeholder="Select intensity" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Light Scrambling</SelectItem>
                          <SelectItem value="medium">Moderate Scrambling</SelectItem>
                          <SelectItem value="high">Heavy Scrambling</SelectItem>
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
                        
                        {/* Scrambling Options */}
                        <div className="space-y-4 bg-gray-50 rounded-xl p-4 sm:p-6">
                          <h4 className="text-sm sm:text-base font-semibold text-gray-900">Scrambling Preservation</h4>
                          
                          <div className="flex items-center justify-between gap-2">
                            <div className="space-y-1 flex-1 min-w-0">
                              <Label className="text-xs sm:text-sm font-medium">Preserve Spaces</Label>
                              <p className="text-xs text-gray-500">Keep spaces in original positions</p>
                            </div>
                            <Switch
                              checked={options.preserveSpaces}
                              onCheckedChange={(checked) => updateOption('preserveSpaces', checked)}
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
                              onCheckedChange={(checked) => updateOption('preservePunctuation', checked)}
                              data-testid="switch-preserve-punctuation"
                            />
                          </div>

                          <div className="flex items-center justify-between gap-2">
                            <div className="space-y-1 flex-1 min-w-0">
                              <Label className="text-xs sm:text-sm font-medium">Preserve Case Patterns</Label>
                              <p className="text-xs text-gray-500">Maintain uppercase/lowercase structure</p>
                            </div>
                            <Switch
                              checked={options.preserveCase}
                              onCheckedChange={(checked) => updateOption('preserveCase', checked)}
                              data-testid="switch-preserve-case"
                            />
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
                      className="flex-1 h-12 sm:h-14 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold text-base sm:text-lg rounded-xl shadow-lg transform transition-all duration-200 hover:scale-105"
                      data-testid="button-sample-text"
                    >
                      Load Sample Text
                    </Button>
                    <Button
                      onClick={resetCalculator}
                      variant="outline"
                      className="h-12 sm:h-14 px-6 sm:px-8 border-2 border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold text-base sm:text-lg rounded-xl"
                      data-testid="button-reset"
                    >
                      Reset
                    </Button>
                  </div>
                </div>

                {/* Results Section */}
                <div className="bg-gradient-to-br from-gray-50 to-blue-50 p-4 sm:p-6 md:p-8 lg:p-10 xl:p-12 border-t">
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6 sm:mb-8">Scrambled Results</h2>

                  {result ? (
                    <div className="space-y-6" data-testid="scramble-results">
                      {/* Generated Text Display */}
                      <div className="bg-white rounded-2xl p-6 shadow-lg border border-blue-100">
                        <textarea
                          value={result.scrambledText}
                          readOnly
                          className="w-full h-64 lg:h-80 p-4 text-base border-0 resize-none focus:outline-none bg-transparent text-gray-800 leading-relaxed"
                          placeholder="Scrambled text will appear here..."
                          data-testid="textarea-result"
                        />
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-col sm:flex-row gap-4">
                        <Button
                          onClick={handleCopyResult}
                          className="flex-1 h-12 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl"
                          data-testid="button-copy-result"
                        >
                          Copy Result
                        </Button>
                        <Button
                          onClick={handleRegenerateScramble}
                          className="flex-1 h-12 bg-green-600 hover:bg-green-700 text-white font-medium rounded-xl"
                          data-testid="button-regenerate"
                          disabled={!text.trim()}
                        >
                          Regenerate
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

                      {/* Text Statistics */}
                      <div className="bg-white rounded-xl p-6 shadow-sm" data-testid="text-statistics">
                        <h3 className="font-bold text-gray-900 mb-4 text-lg">Text Analysis</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          <div className="bg-blue-50 rounded-lg p-4 text-center">
                            <div className="text-2xl font-bold text-blue-600" data-testid="text-characters">{result.charactersCount.toLocaleString()}</div>
                            <div className="text-sm text-blue-700 font-medium">Characters</div>
                          </div>
                          <div className="bg-green-50 rounded-lg p-4 text-center">
                            <div className="text-2xl font-bold text-green-600" data-testid="text-words">{result.wordsCount.toLocaleString()}</div>
                            <div className="text-sm text-green-700 font-medium">Words</div>
                          </div>
                          <div className="bg-purple-50 rounded-lg p-4 text-center">
                            <div className="text-2xl font-bold text-purple-600" data-testid="text-lines">{result.linesCount}</div>
                            <div className="text-sm text-purple-700 font-medium">Lines</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12 sm:py-16" data-testid="no-results">
                      <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-200 rounded-full mx-auto mb-4 sm:mb-6 flex items-center justify-center">
                        <div className="text-2xl sm:text-3xl font-bold text-gray-400">⚡</div>
                      </div>
                      <p className="text-gray-500 text-base sm:text-lg px-4">Configure settings and enter text to see scrambled results</p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* SEO Content Sections */}
          <div className="mt-16 space-y-8">
            {/* What is Text Scrambling */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">What is Text Scrambling?</h2>
                <div className="space-y-4 text-gray-600">
                  <p>
                    <strong>Text scrambling</strong> is a powerful technique for rearranging text elements while maintaining certain structural properties. Our advanced text scrambler offers multiple algorithms including character-level scrambling, word shuffling, line reordering, and smart scrambling that preserves readability through first and last letter preservation. This professional tool transforms ordinary text into puzzles, enhances privacy protection, and creates engaging educational activities.
                  </p>
                  <p>
                    The scrambling process uses sophisticated algorithms to randomly rearrange text components according to your selected mode. <strong>Character scrambling</strong> provides maximum obfuscation by mixing individual letters, <strong>word shuffling</strong> maintains word integrity while changing order, <strong>line reordering</strong> rearranges paragraphs, and <strong>smart scrambling</strong> preserves readability by keeping first and last letters in place - a technique based on cognitive reading research.
                  </p>
                  <p>
                    Our text scrambler is perfect for creating word puzzles, anagrams, privacy protection, educational activities, and testing text processing systems. Each scrambling algorithm serves different purposes, from complete randomization to intelligent rearrangement that maintains partial readability for cognitive exercises and reading comprehension studies.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Scrambling Algorithms Guide */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
                <CardContent className="p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Scrambling Algorithms Explained</h2>
                  <div className="space-y-4">
                    <div className="bg-blue-50 rounded-lg p-4">
                      <h3 className="font-semibold text-blue-900 mb-2">Character Scrambling</h3>
                      <p className="text-blue-800 text-sm mb-2">Randomly rearranges individual characters while optionally preserving spaces and punctuation</p>
                      <p className="text-blue-700 text-xs">Perfect for maximum text obfuscation, character-level puzzles, cryptographic demonstrations, and data anonymization testing.</p>
                    </div>
                    
                    <div className="bg-green-50 rounded-lg p-4">
                      <h3 className="font-semibold text-green-900 mb-2">Word Shuffling</h3>
                      <p className="text-green-800 text-sm mb-2">Reorders complete words while maintaining word boundaries and text structure</p>
                      <p className="text-green-700 text-xs">Ideal for sentence reconstruction puzzles, language learning exercises, creative writing prompts, and grammar practice activities.</p>
                    </div>
                    
                    <div className="bg-purple-50 rounded-lg p-4">
                      <h3 className="font-semibold text-purple-900 mb-2">Line Reordering</h3>
                      <p className="text-purple-800 text-sm mb-2">Randomly rearranges entire lines while preserving line content</p>
                      <p className="text-purple-700 text-xs">Great for story sequence puzzles, process step reordering, poetry reconstruction, and logical flow exercises.</p>
                    </div>
                    
                    <div className="bg-orange-50 rounded-lg p-4">
                      <h3 className="font-semibold text-orange-900 mb-2">Smart Scrambling</h3>
                      <p className="text-orange-800 text-sm mb-2">Preserves first and last letters while scrambling middle letters</p>
                      <p className="text-orange-700 text-xs">Excellent for readability studies, cognitive research, brain training exercises, and dyslexia awareness demonstrations.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
                <CardContent className="p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Why Use Our Text Scrambler?</h2>
                  <div className="space-y-4 text-gray-600">
                    <p>
                      Our text scrambler combines advanced algorithms with user-friendly controls to deliver professional-grade text manipulation capabilities. Unlike basic scramblers, our tool offers granular control over preservation settings, multiple intensity levels, and real-time processing for immediate results.
                    </p>
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                          <span className="text-white text-xs font-bold">✓</span>
                        </div>
                        <span className="text-sm">Four distinct scrambling algorithms for different use cases</span>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                          <span className="text-white text-xs font-bold">✓</span>
                        </div>
                        <span className="text-sm">Advanced preservation options for spaces, punctuation, and case</span>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                          <span className="text-white text-xs font-bold">✓</span>
                        </div>
                        <span className="text-sm">Adjustable intensity levels from light to heavy scrambling</span>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                          <span className="text-white text-xs font-bold">✓</span>
                        </div>
                        <span className="text-sm">Real-time processing with instant visual feedback</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Professional Applications */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Professional Applications and Use Cases</h2>
                <p className="text-gray-600 mb-8">Text scrambling serves numerous professional and educational purposes across various industries. Our tool provides the flexibility and precision needed for specialized applications.</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Education & Training</h3>
                      <p className="text-gray-600 text-sm mb-3">
                        Teachers and trainers use text scrambling to create engaging word puzzles, spelling exercises, and reading comprehension activities. Smart scrambling maintains readability while challenging students to decode messages, making it perfect for language learning and cognitive exercises.
                      </p>
                      <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
                        <li>Language learning vocabulary exercises</li>
                        <li>Reading comprehension challenges</li>
                        <li>Spelling and grammar practice</li>
                        <li>Critical thinking development</li>
                      </ul>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Game Development</h3>
                      <p className="text-gray-600 text-sm mb-3">
                        Game developers utilize text scrambling algorithms to create word games, puzzle challenges, and interactive story elements. Multiple scrambling modes offer varying difficulty levels for diverse gaming experiences.
                      </p>
                      <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
                        <li>Word puzzle game mechanics</li>
                        <li>Interactive story elements</li>
                        <li>Challenge progression systems</li>
                        <li>Educational game content</li>
                      </ul>
                    </div>
                  </div>
                  
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Data Privacy & Security</h3>
                      <p className="text-gray-600 text-sm mb-3">
                        Security professionals use text scrambling for data obfuscation, testing anonymization systems, and creating sample datasets that maintain structure while protecting sensitive information.
                      </p>
                      <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
                        <li>Data anonymization testing</li>
                        <li>Privacy protection demonstrations</li>
                        <li>GDPR compliance preparation</li>
                        <li>Secure sample data generation</li>
                      </ul>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Software Testing</h3>
                      <p className="text-gray-600 text-sm mb-3">
                        QA engineers and developers leverage scrambled text to test text processing algorithms, natural language processing systems, and user interface components with varied inputs.
                      </p>
                      <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
                        <li>NLP system stress testing</li>
                        <li>UI component validation</li>
                        <li>Edge case identification</li>
                        <li>Algorithm robustness testing</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Intensity Levels and Features */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
                <CardContent className="p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Scrambling Intensity Levels</h2>
                  <div className="space-y-4">
                    <div className="bg-green-50 border-l-4 border-green-400 p-4 rounded-r-lg">
                      <h3 className="font-semibold text-green-900 text-sm mb-2">Light Scrambling</h3>
                      <p className="text-green-800 text-xs">
                        Minimal shuffling with single-pass randomization. Perfect for subtle text obfuscation while maintaining some recognizable patterns. Ideal for educational exercises where partial readability is desired.
                      </p>
                    </div>
                    
                    <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-lg">
                      <h3 className="font-semibold text-blue-900 text-sm mb-2">Medium Scrambling</h3>
                      <p className="text-blue-800 text-xs">
                        Balanced randomization with triple-pass shuffling. Provides good obfuscation while maintaining algorithm efficiency. Suitable for most general-purpose scrambling applications and puzzle creation.
                      </p>
                    </div>
                    
                    <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-r-lg">
                      <h3 className="font-semibold text-red-900 text-sm mb-2">Heavy Scrambling</h3>
                      <p className="text-red-800 text-xs">
                        Maximum randomization with five-pass shuffling algorithm. Ensures complete text transformation with minimal pattern recognition. Best for high-security obfuscation and complex puzzle challenges.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
                <CardContent className="p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Advanced Features</h2>
                  <div className="space-y-4">
                    <div className="bg-indigo-50 rounded-lg p-4">
                      <h3 className="font-semibold text-indigo-900 mb-2">Preservation Controls</h3>
                      <p className="text-indigo-800 text-sm">
                        Fine-tune scrambling with options to preserve spaces, punctuation, and case patterns. Maintain text structure while achieving desired randomization levels.
                      </p>
                    </div>
                    
                    <div className="bg-teal-50 rounded-lg p-4">
                      <h3 className="font-semibold text-teal-900 mb-2">Real-Time Processing</h3>
                      <p className="text-teal-800 text-sm">
                        Instant text transformation as you type with immediate visual feedback. No waiting time or server processing delays for optimal user experience.
                      </p>
                    </div>
                    
                    <div className="bg-purple-50 rounded-lg p-4">
                      <h3 className="font-semibold text-purple-900 mb-2">Regeneration Capability</h3>
                      <p className="text-purple-800 text-sm">
                        Create multiple variations of scrambled text from the same input. Perfect for generating different puzzle versions or testing various randomization outcomes.
                      </p>
                    </div>
                    
                    <div className="bg-orange-50 rounded-lg p-4">
                      <h3 className="font-semibold text-orange-900 mb-2">Text Analytics</h3>
                      <p className="text-orange-800 text-sm">
                        Comprehensive analysis including character count, word count, and line count. Understand your text composition for better scrambling strategy selection.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Best Practices and Tips */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Best Practices for Text Scrambling</h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">Algorithm Selection Guidelines</h3>
                    <div className="space-y-3">
                      <div className="bg-blue-50 border-l-4 border-blue-400 p-3 rounded-r-lg">
                        <h4 className="font-semibold text-blue-900 text-sm">For Educational Puzzles</h4>
                        <p className="text-blue-800 text-xs mt-1">Use word shuffling or smart scrambling to maintain some readability. Students can focus on reconstruction rather than pure decoding.</p>
                      </div>
                      <div className="bg-green-50 border-l-4 border-green-400 p-3 rounded-r-lg">
                        <h4 className="font-semibold text-green-900 text-sm">For Privacy Protection</h4>
                        <p className="text-green-800 text-xs mt-1">Character scrambling with high intensity provides maximum obfuscation. Disable all preservation options for complete anonymization.</p>
                      </div>
                      <div className="bg-purple-50 border-l-4 border-purple-400 p-3 rounded-r-lg">
                        <h4 className="font-semibold text-purple-900 text-sm">For Reading Research</h4>
                        <p className="text-purple-800 text-xs mt-1">Smart scrambling demonstrates cognitive reading patterns while maintaining surprising readability through position preservation.</p>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">Optimization Tips</h3>
                    <div className="space-y-3">
                      <div className="bg-orange-50 border-l-4 border-orange-400 p-3 rounded-r-lg">
                        <h4 className="font-semibold text-orange-900 text-sm">Performance Considerations</h4>
                        <p className="text-orange-800 text-xs mt-1">The tool processes text in real-time for immediate feedback. For very large texts, consider processing in smaller chunks for optimal performance.</p>
                      </div>
                      <div className="bg-teal-50 border-l-4 border-teal-400 p-3 rounded-r-lg">
                        <h4 className="font-semibold text-teal-900 text-sm">Multiple Variations</h4>
                        <p className="text-teal-800 text-xs mt-1">Use the regenerate function to create multiple versions of the same scrambled text with different random patterns for comprehensive testing.</p>
                      </div>
                      <div className="bg-red-50 border-l-4 border-red-400 p-3 rounded-r-lg">
                        <h4 className="font-semibold text-red-900 text-sm">Testing Different Settings</h4>
                        <p className="text-red-800 text-xs mt-1">Experiment with different preservation settings and intensity levels to find the perfect balance for your specific use case and requirements.</p>
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
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">What's the difference between scrambling algorithms?</h3>
                      <p className="text-gray-600 text-sm">
                        Each algorithm serves different purposes: character scrambling maximally obscures text, word shuffling maintains word integrity while reordering, line reordering preserves line content while changing sequence, and smart scrambling keeps readability while demonstrating cognitive reading patterns.
                      </p>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Can I reverse the scrambling process?</h3>
                      <p className="text-gray-600 text-sm">
                        Text scrambling is a one-way process that cannot be automatically reversed since it uses random algorithms. However, humans can often decode word-shuffled or smart-scrambled text, and the original text remains available for comparison until you clear or change it.
                      </p>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Is scrambled text suitable for privacy protection?</h3>
                      <p className="text-gray-600 text-sm">
                        Character scrambling with high intensity and no preservation options provides good obfuscation for casual privacy needs. However, for sensitive data protection, use proper encryption methods. Our tool is ideal for demonstrations, testing, and non-sensitive data anonymization.
                      </p>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">How does intensity affect scrambling quality?</h3>
                      <p className="text-gray-600 text-sm">
                        Intensity controls how many shuffle passes the algorithm performs. Light intensity does minimal shuffling for subtle changes, medium provides balanced randomization, while heavy intensity ensures maximum scrambling through multiple passes for complete obfuscation.
                      </p>
                    </div>
                  </div>
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">How does smart scrambling maintain readability?</h3>
                      <p className="text-gray-600 text-sm">
                        Smart scrambling leverages a cognitive phenomenon where readers can understand words even when middle letters are scrambled, as long as first and last letters remain in position. This creates fascinating demonstrations of how the human brain processes text.
                      </p>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Can I use this tool for commercial projects?</h3>
                      <p className="text-gray-600 text-sm">
                        Yes, our text scrambler is completely free for personal, educational, and commercial use. Generate unlimited scrambled text for your projects, games, educational materials, or applications without any restrictions or licensing requirements.
                      </p>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">What languages does the scrambler support?</h3>
                      <p className="text-gray-600 text-sm">
                        The scrambler works with any text input regardless of language, including Latin scripts, Cyrillic, numbers, and special characters. The smart scrambling algorithm is optimized for languages that use word boundaries, while other modes work universally.
                      </p>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Does the tool work offline?</h3>
                      <p className="text-gray-600 text-sm">
                        Yes! Once the page loads, all text scrambling happens locally in your browser without requiring an internet connection. Your text never leaves your device, ensuring complete privacy and security for all your scrambling needs.
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

export default TextScrambler;
