
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

export default function TextScrambler() {
  const [inputText, setInputText] = useState('');
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

  const scrambleText = (text: string, opts: ScrambleOptions): ScrambleResult => {
    if (!text.trim()) {
      return {
        originalText: text,
        scrambledText: '',
        mode: opts.mode,
        wordsCount: 0,
        charactersCount: 0,
        linesCount: 0
      };
    }

    let scrambledText = '';
    const words = text.trim().split(/\s+/).length;
    const characters = text.length;
    const lines = text.split('\n').length;

    switch (opts.mode) {
      case 'characters':
        if (opts.preserveSpaces && opts.preservePunctuation) {
          // Only scramble letters and numbers
          const chars = text.split('');
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
          scrambledText = shuffleArray(text.split(''), opts.intensity).join('');
        }
        break;

      case 'words':
        const wordArray = text.split(/(\s+)/); // Preserve whitespace
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
        const linesArray = text.split('\n');
        const scrambledLines = shuffleArray(linesArray, opts.intensity);
        scrambledText = scrambledLines.join('\n');
        break;

      case 'smart':
        // Smart scramble preserves word boundaries and first/last letters
        scrambledText = text.replace(/\b\w+\b/g, (word) => {
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
      const originalChars = text.split('');
      const scrambledChars = scrambledText.split('');
      
      scrambledText = scrambledChars.map((char, index) => {
        if (originalChars[index] && originalChars[index] === originalChars[index].toUpperCase()) {
          return char.toUpperCase();
        }
        return char.toLowerCase();
      }).join('');
    }

    return {
      originalText: text,
      scrambledText,
      mode: opts.mode,
      wordsCount: words,
      charactersCount: characters,
      linesCount: lines
    };
  };

  // Real-time scrambling
  useEffect(() => {
    if (inputText.trim()) {
      const result = scrambleText(inputText, options);
      setResult(result);
    } else {
      setResult(null);
    }
  }, [inputText, options]);

  const handleClear = () => {
    setInputText('');
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
    const sample = `Welcome to our amazing text scrambling tool!
This innovative application allows you to scramble text in various creative ways.
You can choose from different modes like character scrambling, word shuffling, or smart scrambling.
Perfect for creating puzzles, testing readability, or just having fun with text manipulation.`;
    setInputText(sample);
  };

  const handleRegenerateScramble = () => {
    if (inputText.trim()) {
      const newResult = scrambleText(inputText, options);
      setResult(newResult);
    }
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
        <section className="relative py-20 sm:py-28 lg:py-32 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-indigo-600/20"></div>
          <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="space-y-8">
              <div className="inline-flex items-center px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full border border-blue-200">
                <span className="text-sm font-medium text-blue-700">Advanced Text Manipulation</span>
              </div>
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-slate-900 leading-tight">
                Text
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                  Scrambler
                </span>
              </h1>
              <p className="text-xl sm:text-2xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
                Transform text with multiple scrambling algorithms - perfect for puzzles, privacy, and creative text manipulation
              </p>
            </div>
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-4 py-16">
          {/* Main Generator Card */}
          <Card className="bg-white/90 backdrop-blur-sm shadow-2xl border-0 rounded-3xl overflow-hidden">
            <CardContent className="p-0">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
                {/* Input Section */}
                <div className="p-8 lg:p-12 space-y-8">
                  <div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">Scrambling Settings</h2>
                    <p className="text-gray-600">Configure your text scrambling preferences</p>
                  </div>

                  <div className="space-y-6">
                    {/* Text Input */}
                    <div className="space-y-3">
                      <Label htmlFor="text-input" className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                        Text to Scramble
                      </Label>
                      <Textarea
                        id="text-input"
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        className="min-h-[200px] text-base border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-blue-500 resize-none"
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
                          setOptions(prev => ({ ...prev, mode: value }))
                        }
                      >
                        <SelectTrigger className="h-14 border-2 border-gray-200 rounded-xl text-lg" data-testid="select-scramble-mode">
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
                          setOptions(prev => ({ ...prev, intensity: value }))
                        }
                      >
                        <SelectTrigger className="h-14 border-2 border-gray-200 rounded-xl text-lg" data-testid="select-intensity">
                          <SelectValue placeholder="Select intensity" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Light Scrambling</SelectItem>
                          <SelectItem value="medium">Moderate Scrambling</SelectItem>
                          <SelectItem value="high">Heavy Scrambling</SelectItem>
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
                                <Label className="text-xs sm:text-sm font-medium">Preserve Case Patterns</Label>
                                <p className="text-xs text-gray-500">Maintain uppercase/lowercase structure</p>
                              </div>
                              <Switch
                                checked={options.preserveCase}
                                onCheckedChange={(checked) => setOptions(prev => ({ ...prev, preserveCase: checked }))}
                                data-testid="switch-preserve-case"
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
                        onClick={handleRegenerateScramble}
                        className="flex-1 h-14 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold text-lg rounded-xl shadow-lg transform transition-all duration-200 hover:scale-105"
                        data-testid="button-regenerate"
                        disabled={!inputText.trim()}
                      >
                        Regenerate
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Results Section */}
                <div className="bg-gradient-to-br from-gray-50 to-blue-50 p-8 lg:p-12">
                  <h2 className="text-2xl font-bold text-gray-900 mb-8">Scrambled Results</h2>

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
                    <div className="text-center py-16" data-testid="no-results">
                      <div className="w-20 h-20 bg-gray-200 rounded-full mx-auto mb-6 flex items-center justify-center">
                        <div className="text-3xl font-bold text-gray-400">⚡</div>
                      </div>
                      <p className="text-gray-500 text-lg">Configure settings and enter text to see scrambled results</p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* SEO Content Section */}
          <div className="mt-16 grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">What is Text Scrambling?</h3>
                <div className="space-y-4 text-gray-600">
                  <p>
                    Text scrambling is a powerful technique for rearranging text elements while maintaining certain structural properties. 
                    Our advanced text scrambler offers multiple algorithms including character-level scrambling, word shuffling, 
                    line reordering, and smart scrambling that preserves readability through first and last letter preservation.
                  </p>
                  <p>
                    This professional tool is perfect for creating word puzzles, anagrams, privacy protection, educational activities, 
                    and testing text processing systems. Each scrambling algorithm serves different purposes, from complete randomization 
                    to intelligent rearrangement that maintains partial readability.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Why Use Our Text Scrambler?</h3>
                <div className="space-y-4 text-gray-600">
                  <p>
                    Our text scrambler combines advanced algorithms with user-friendly controls to deliver professional-grade 
                    text manipulation capabilities. Unlike basic scramblers, our tool offers granular control over preservation 
                    settings, multiple intensity levels, and real-time processing for immediate results.
                  </p>
                  <ul className="space-y-2 list-disc list-inside">
                    <li>Four distinct scrambling algorithms for different use cases</li>
                    <li>Advanced preservation options for spaces, punctuation, and case</li>
                    <li>Adjustable intensity levels from light to heavy scrambling</li>
                    <li>Real-time processing with instant visual feedback</li>
                    <li>Professional-grade results suitable for educational and commercial use</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Scrambling Algorithms</h3>
                <div className="space-y-3 text-gray-600">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <div>
                      <span className="font-semibold text-gray-800">Character Scrambling:</span> Randomly rearranges individual characters while optionally preserving spaces and punctuation
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <div>
                      <span className="font-semibold text-gray-800">Word Shuffling:</span> Reorders complete words while maintaining word boundaries and text structure
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                    <div>
                      <span className="font-semibold text-gray-800">Line Reordering:</span> Randomly rearranges entire lines of text while preserving line content
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                    <div>
                      <span className="font-semibold text-gray-800">Smart Scrambling:</span> Preserves first and last letters of words for maintained readability
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Professional Applications</h3>
                <div className="space-y-3 text-gray-600">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Educational puzzle creation and word games</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Privacy protection through text obfuscation</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Testing text processing and NLP systems</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Creative writing exercises and inspiration</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Anagram generation and word puzzle development</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Additional SEO Content Sections */}
          <div className="mt-12 space-y-8">
            {/* Use Cases by Profession */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Text Scrambler Use Cases by Industry</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-gray-800">Education & Training</h4>
                    <p className="text-gray-600">
                      Teachers and trainers use text scrambling to create engaging word puzzles, spelling exercises, 
                      and reading comprehension activities. Smart scrambling maintains readability while challenging 
                      students to decode the original message, making it perfect for language learning and cognitive exercises.
                    </p>
                  </div>
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-gray-800">Game Development</h4>
                    <p className="text-gray-600">
                      Game developers utilize text scrambling algorithms to create word games, puzzle challenges, 
                      and interactive story elements. Our multiple scrambling modes offer varying difficulty levels, 
                      from simple character shuffling to complex word rearrangements for diverse gaming experiences.
                    </p>
                  </div>
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-gray-800">Data Privacy & Security</h4>
                    <p className="text-gray-600">
                      Security professionals use text scrambling for data obfuscation, testing anonymization systems, 
                      and creating sample datasets that maintain structure while protecting sensitive information. 
                      This is essential for GDPR compliance and privacy-preserving data analysis.
                    </p>
                  </div>
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-gray-800">Software Testing</h4>
                    <p className="text-gray-600">
                      QA engineers and developers leverage scrambled text to test text processing algorithms, 
                      natural language processing systems, and user interface components with varied text inputs. 
                      This helps identify edge cases and ensures robust application behavior.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Detailed Algorithm Comparison */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
                <CardContent className="p-8">
                  <h3 className="text-xl font-bold text-gray-900 mb-6">Character Scrambling</h3>
                  <div className="space-y-4 text-gray-600">
                    <p className="text-sm">
                      Randomly rearranges individual letters and numbers while optionally preserving structural elements 
                      like spaces and punctuation marks.
                    </p>
                    <div className="space-y-2">
                      <h4 className="font-semibold text-blue-800 text-sm">Ideal for:</h4>
                      <ul className="text-xs space-y-1 list-disc list-inside text-blue-700">
                        <li>Maximum text obfuscation</li>
                        <li>Character-level puzzles</li>
                        <li>Cryptographic demonstrations</li>
                        <li>Data anonymization testing</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
                <CardContent className="p-8">
                  <h3 className="text-xl font-bold text-gray-900 mb-6">Word Shuffling</h3>
                  <div className="space-y-4 text-gray-600">
                    <p className="text-sm">
                      Reorders complete words while maintaining word integrity and spacing, creating readable 
                      scrambled sentences with preserved word boundaries.
                    </p>
                    <div className="space-y-2">
                      <h4 className="font-semibold text-green-800 text-sm">Ideal for:</h4>
                      <ul className="text-xs space-y-1 list-disc list-inside text-green-700">
                        <li>Sentence reconstruction puzzles</li>
                        <li>Language learning exercises</li>
                        <li>Creative writing prompts</li>
                        <li>Grammar practice activities</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
                <CardContent className="p-8">
                  <h3 className="text-xl font-bold text-gray-900 mb-6">Line Reordering</h3>
                  <div className="space-y-4 text-gray-600">
                    <p className="text-sm">
                      Randomly rearranges entire lines of text while keeping each line's content intact, 
                      perfect for paragraph reconstruction activities.
                    </p>
                    <div className="space-y-2">
                      <h4 className="font-semibold text-purple-800 text-sm">Ideal for:</h4>
                      <ul className="text-xs space-y-1 list-disc list-inside text-purple-700">
                        <li>Story sequence puzzles</li>
                        <li>Process step reordering</li>
                        <li>Poetry reconstruction</li>
                        <li>Logical flow exercises</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
                <CardContent className="p-8">
                  <h3 className="text-xl font-bold text-gray-900 mb-6">Smart Scrambling</h3>
                  <div className="space-y-4 text-gray-600">
                    <p className="text-sm">
                      Preserves first and last letters of each word while scrambling middle letters, 
                      maintaining surprising readability despite rearrangement.
                    </p>
                    <div className="space-y-2">
                      <h4 className="font-semibold text-orange-800 text-sm">Ideal for:</h4>
                      <ul className="text-xs space-y-1 list-disc list-inside text-orange-700">
                        <li>Readability studies</li>
                        <li>Cognitive research</li>
                        <li>Brain training exercises</li>
                        <li>Dyslexia awareness demos</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Advanced Features and Tips */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Advanced Features and Tips</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="space-y-4 text-gray-600">
                    <h4 className="font-semibold text-gray-800 mb-2">Intensity Levels Explained</h4>
                    <p className="text-sm">
                      Our intensity system controls how thoroughly text gets scrambled. Light intensity performs minimal 
                      shuffling for subtle changes, medium intensity provides balanced randomization suitable for most 
                      applications, while heavy intensity ensures maximum scrambling through multiple shuffle passes.
                    </p>
                    <h4 className="font-semibold text-gray-800 mb-2">Preservation Options</h4>
                    <p className="text-sm">
                      Fine-tune your scrambling with preservation controls. Space preservation maintains text formatting, 
                      punctuation preservation keeps sentences readable, and case preservation maintains the original 
                      capitalization patterns for professional-looking results.
                    </p>
                  </div>
                  <div className="space-y-4 text-gray-600">
                    <h4 className="font-semibold text-gray-800 mb-2">Best Practices</h4>
                    <p className="text-sm">
                      For educational puzzles, use word shuffling or smart scrambling to maintain some readability. 
                      For privacy protection, character scrambling with high intensity provides maximum obfuscation. 
                      Always test different settings to find the perfect balance for your specific use case.
                    </p>
                    <h4 className="font-semibold text-gray-800 mb-2">Performance Tips</h4>
                    <p className="text-sm">
                      The tool processes text in real-time for immediate feedback. For very large texts, consider 
                      processing in smaller chunks. Use the regenerate function to create multiple versions of 
                      the same scrambled text with different random patterns.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* FAQ Section */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Frequently Asked Questions</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">What's the difference between scrambling algorithms?</h4>
                      <p className="text-gray-600 text-sm">
                        Each algorithm serves different purposes: character scrambling maximally obscures text, 
                        word shuffling maintains word integrity while reordering, line reordering preserves 
                        line content while changing sequence, and smart scrambling keeps readability while 
                        demonstrating cognitive reading patterns.
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">Can I reverse the scrambling process?</h4>
                      <p className="text-gray-600 text-sm">
                        Text scrambling is a one-way process that cannot be automatically reversed since it uses 
                        random algorithms. However, humans can often decode word-shuffled or smart-scrambled text, 
                        and the original text remains available for comparison until you clear or change it.
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">Is scrambled text suitable for privacy protection?</h4>
                      <p className="text-gray-600 text-sm">
                        Character scrambling with high intensity and no preservation options provides good 
                        obfuscation for casual privacy needs. However, for sensitive data protection, use 
                        proper encryption methods. Our tool is ideal for demonstrations, testing, and 
                        non-sensitive data anonymization.
                      </p>
                    </div>
                  </div>
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">How does smart scrambling maintain readability?</h4>
                      <p className="text-gray-600 text-sm">
                        Smart scrambling leverages a cognitive phenomenon where readers can understand words 
                        even when middle letters are scrambled, as long as first and last letters remain in 
                        position. This creates fascinating demonstrations of how the human brain processes text.
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">Can I use this tool for commercial projects?</h4>
                      <p className="text-gray-600 text-sm">
                        Yes, our text scrambler is completely free for personal, educational, and commercial use. 
                        Generate unlimited scrambled text for your projects, games, educational materials, or 
                        applications without any restrictions or licensing requirements.
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">What languages does the scrambler support?</h4>
                      <p className="text-gray-600 text-sm">
                        The scrambler works with any text input regardless of language, including Latin scripts, 
                        Cyrillic, numbers, and special characters. The smart scrambling algorithm is optimized 
                        for languages that use word boundaries, while other modes work universally with any 
                        character set.
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
}
