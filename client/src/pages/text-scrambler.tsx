import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import Header from '@/components/Header';

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
        <title>Text Scrambler - Scramble Text in Multiple Ways | DapsiWow</title>
        <meta name="description" content="Free text scrambler tool to shuffle characters, words, or lines. Create puzzles, test readability, or have fun with various scrambling modes and options." />
        <meta name="keywords" content="text scrambler, text shuffler, word scrambler, character scrambler, text mixer, scramble generator, text puzzle maker, word puzzle" />
        <meta property="og:title" content="Text Scrambler - Scramble Text in Multiple Ways" />
        <meta property="og:description" content="Scramble text using various modes: character shuffling, word scrambling, line mixing, and smart scrambling. Free and instant." />
        <meta property="og:type" content="website" />
        <link rel="canonical" href="https://dapsiwow.com/tools/text-scrambler" />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            "name": "Text Scrambler",
            "description": "Free online text scrambler tool with multiple scrambling modes for creating puzzles and testing text readability.",
            "url": "https://dapsiwow.com/tools/text-scrambler",
            "applicationCategory": "UtilityApplication",
            "operatingSystem": "Any",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "USD"
            },
            "featureList": [
              "Multiple scrambling modes",
              "Character-level scrambling",
              "Word shuffling",
              "Line reordering",
              "Smart scrambling with readability",
              "Real-time processing",
              "Copy to clipboard functionality"
            ]
          })}
        </script>
      </Helmet>

      <Header />

      <main>
        {/* Hero Section */}
        <section className="relative py-8 sm:py-12 lg:py-16 xl:py-20 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-4xl mx-auto">
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-slate-900 leading-tight" data-testid="text-page-title">
                Text
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                  Scrambler
                </span>
              </h1>
              <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-slate-600 max-w-4xl mx-auto leading-relaxed px-2">
                Scramble text in creative ways - characters, words, lines, or smart scrambling
              </p>
            </div>
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
          {/* Main Tool Card */}
          <Card className="bg-white/90 backdrop-blur-sm shadow-2xl border-0 rounded-2xl sm:rounded-3xl overflow-hidden">
            <CardContent className="p-0">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-0">
                {/* Input Section */}
                <div className="lg:col-span-2 p-8 lg:p-12 space-y-8">
                  <div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">Text Input</h2>
                    <p className="text-gray-600">Enter text to scramble using various mixing algorithms</p>
                  </div>
                  
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
                      placeholder="Type or paste your text here to scramble..."
                      data-testid="textarea-text-input"
                    />
                  </div>

                  {/* Scrambling Options */}
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-gray-800">Scrambling Options</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Scramble Mode */}
                      <div className="space-y-2 md:col-span-2">
                        <Label className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                          Scrambling Mode
                        </Label>
                        <Select
                          value={options.mode}
                          onValueChange={(value: 'characters' | 'words' | 'lines' | 'smart') => 
                            setOptions(prev => ({ ...prev, mode: value }))
                          }
                        >
                          <SelectTrigger className="h-12 border-2 border-gray-200 rounded-xl" data-testid="select-scramble-mode">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="characters" data-testid="mode-characters">Character Scrambling</SelectItem>
                            <SelectItem value="words" data-testid="mode-words">Word Shuffling</SelectItem>
                            <SelectItem value="lines" data-testid="mode-lines">Line Reordering</SelectItem>
                            <SelectItem value="smart" data-testid="mode-smart">Smart Scrambling</SelectItem>
                          </SelectContent>
                        </Select>
                        <p className="text-xs text-gray-500">{getModeDescription(options.mode)}</p>
                      </div>

                      {/* Intensity */}
                      <div className="space-y-2">
                        <Label className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                          Scramble Intensity
                        </Label>
                        <Select
                          value={options.intensity}
                          onValueChange={(value: 'low' | 'medium' | 'high') => 
                            setOptions(prev => ({ ...prev, intensity: value }))
                          }
                        >
                          <SelectTrigger className="h-12 border-2 border-gray-200 rounded-xl" data-testid="select-intensity">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="low">Low (Light Mix)</SelectItem>
                            <SelectItem value="medium">Medium (Moderate Mix)</SelectItem>
                            <SelectItem value="high">High (Heavy Mix)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Preserve Spaces */}
                      <div className="flex items-center justify-between space-x-3">
                        <div>
                          <Label htmlFor="preserve-spaces" className="text-sm font-medium text-gray-700">
                            Preserve Spaces
                          </Label>
                          <p className="text-xs text-gray-500">Keep spaces in original positions</p>
                        </div>
                        <Switch
                          id="preserve-spaces"
                          checked={options.preserveSpaces}
                          onCheckedChange={(checked) => setOptions(prev => ({ ...prev, preserveSpaces: checked }))}
                          data-testid="switch-preserve-spaces"
                        />
                      </div>

                      {/* Preserve Punctuation */}
                      <div className="flex items-center justify-between space-x-3">
                        <div>
                          <Label htmlFor="preserve-punctuation" className="text-sm font-medium text-gray-700">
                            Preserve Punctuation
                          </Label>
                          <p className="text-xs text-gray-500">Keep punctuation in place</p>
                        </div>
                        <Switch
                          id="preserve-punctuation"
                          checked={options.preservePunctuation}
                          onCheckedChange={(checked) => setOptions(prev => ({ ...prev, preservePunctuation: checked }))}
                          data-testid="switch-preserve-punctuation"
                        />
                      </div>

                      {/* Preserve Case */}
                      <div className="flex items-center justify-between space-x-3">
                        <div>
                          <Label htmlFor="preserve-case" className="text-sm font-medium text-gray-700">
                            Preserve Case
                          </Label>
                          <p className="text-xs text-gray-500">Maintain upper/lowercase patterns</p>
                        </div>
                        <Switch
                          id="preserve-case"
                          checked={options.preserveCase}
                          onCheckedChange={(checked) => setOptions(prev => ({ ...prev, preserveCase: checked }))}
                          data-testid="switch-preserve-case"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-4 pt-4">
                    <Button
                      onClick={handleSampleText}
                      variant="outline"
                      className="h-14 px-8 border-2 border-blue-200 text-blue-700 hover:bg-blue-50 font-semibold text-lg rounded-xl"
                      data-testid="button-sample-text"
                    >
                      Sample Text
                    </Button>
                    <Button
                      onClick={handleRegenerateScramble}
                      variant="outline"
                      className="h-14 px-8 border-2 border-green-200 text-green-700 hover:bg-green-50 font-semibold text-lg rounded-xl"
                      data-testid="button-regenerate"
                      disabled={!inputText.trim()}
                    >
                      Regenerate
                    </Button>
                    <Button
                      onClick={handleClear}
                      variant="outline"
                      className="h-14 px-8 border-2 border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold text-lg rounded-xl"
                      data-testid="button-clear"
                    >
                      Clear
                    </Button>
                  </div>
                </div>

                {/* Results Section */}
                <div className="bg-gradient-to-br from-gray-50 to-blue-50 p-8 lg:p-12">
                  <h2 className="text-2xl font-bold text-gray-900 mb-8">Results</h2>
                  
                  {result ? (
                    <div className="space-y-6" data-testid="scramble-results">
                      {/* Statistics */}
                      <div className="grid grid-cols-1 gap-4">
                        <div className="bg-white rounded-xl p-4 shadow-sm">
                          <div className="text-sm font-medium text-gray-600 mb-1">Mode Used</div>
                          <div className="text-lg font-bold text-blue-600 capitalize" data-testid="text-mode">
                            {result.mode}
                          </div>
                        </div>
                        
                        <div className="bg-white rounded-xl p-4 shadow-sm">
                          <div className="text-sm font-medium text-gray-600 mb-1">Characters</div>
                          <div className="text-2xl font-bold text-gray-900" data-testid="text-characters">
                            {result.charactersCount}
                          </div>
                        </div>
                        
                        <div className="bg-white rounded-xl p-4 shadow-sm">
                          <div className="text-sm font-medium text-gray-600 mb-1">Words</div>
                          <div className="text-2xl font-bold text-gray-900" data-testid="text-words">
                            {result.wordsCount}
                          </div>
                        </div>

                        <div className="bg-white rounded-xl p-4 shadow-sm">
                          <div className="text-sm font-medium text-gray-600 mb-1">Lines</div>
                          <div className="text-2xl font-bold text-gray-900" data-testid="text-lines">
                            {result.linesCount}
                          </div>
                        </div>
                      </div>

                      {/* Output Text */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <Label className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                            Scrambled Text
                          </Label>
                          <Button
                            onClick={handleCopyResult}
                            size="sm"
                            className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
                            data-testid="button-copy-result"
                          >
                            Copy Result
                          </Button>
                        </div>
                        <Textarea
                          value={result.scrambledText}
                          readOnly
                          className="min-h-[200px] text-sm bg-white border-2 border-gray-200 rounded-xl resize-none"
                          data-testid="textarea-result"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12" data-testid="no-results">
                      <div className="text-gray-400 mb-4">
                        <svg className="w-16 h-16 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <p className="text-gray-500 text-lg">Enter text to scramble</p>
                      <p className="text-gray-400 text-sm mt-2">Scrambled text will appear here</p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}