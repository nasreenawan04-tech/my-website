import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';

interface ReverseTextOptions {
  reverseByWords: boolean;
  reverseByLines: boolean;
  preserveSpaces: boolean;
  flipCharacters: boolean;
}

const ReverseTextTool = () => {
  const [text, setText] = useState('');
  const [result, setResult] = useState('');
  const [options, setOptions] = useState<ReverseTextOptions>({
    reverseByWords: false,
    reverseByLines: false,
    preserveSpaces: false,
    flipCharacters: false
  });

  const reverseText = (inputText: string, opts: ReverseTextOptions): string => {
    if (inputText.trim() === '') {
      return '';
    }

    let processedText = inputText;

    if (opts.reverseByLines) {
      // Reverse lines
      const lines = processedText.split('\n');
      processedText = lines.reverse().join('\n');
    } else if (opts.reverseByWords) {
      // Reverse word order
      const words = processedText.split(' ');
      processedText = words.reverse().join(' ');
    } else {
      // Default: reverse characters
      if (opts.preserveSpaces) {
        // Preserve space positions while reversing non-space characters
        const chars = processedText.split('');
        const nonSpaceChars = chars.filter(char => char !== ' ').reverse();
        let nonSpaceIndex = 0;
        
        processedText = chars.map(char => {
          if (char === ' ') {
            return ' ';
          } else {
            return nonSpaceChars[nonSpaceIndex++];
          }
        }).join('');
      } else {
        // Simple character reversal
        processedText = processedText.split('').reverse().join('');
      }
    }

    if (opts.flipCharacters) {
      // Flip certain characters upside down
      const flipMap: { [key: string]: string } = {
        'a': 'ɐ', 'b': 'q', 'c': 'ɔ', 'd': 'p', 'e': 'ǝ', 'f': 'ɟ', 'g': 'ƃ', 
        'h': 'ɥ', 'i': 'ᴉ', 'j': 'ɾ', 'k': 'ʞ', 'l': 'ɹ', 'm': 'ɯ', 'n': 'u',
        'o': 'o', 'p': 'd', 'q': 'b', 'r': 'ɹ', 's': 's', 't': 'ʇ', 'u': 'n',
        'v': 'ʌ', 'w': 'ʍ', 'x': 'x', 'y': 'ʎ', 'z': 'z',
        'A': '∀', 'B': 'ᗺ', 'C': 'Ɔ', 'D': 'ᗡ', 'E': 'Ǝ', 'F': 'ᖴ', 'G': 'פ',
        'H': 'H', 'I': 'I', 'J': 'ſ', 'K': 'ʞ', 'L': '˥', 'M': 'W', 'N': 'N',
        'O': 'O', 'P': 'Ԁ', 'Q': 'Q', 'R': 'ᴿ', 'S': 'S', 'T': '┴', 'U': '∩',
        'V': 'Λ', 'W': 'M', 'X': 'X', 'Y': '⅄', 'Z': 'Z',
        '0': '0', '1': 'Ɩ', '2': 'ᄅ', '3': 'Ɛ', '4': 'ㄣ', '5': 'ϛ', 
        '6': '9', '7': 'ㄥ', '8': '8', '9': '6',
        '?': '¿', '!': '¡', '.': '˙', ',': "'", "'": ',', '"': '„',
        '(': ')', ')': '(', '[': ']', ']': '[', '{': '}', '}': '{'
      };
      
      processedText = processedText.split('').map(char => flipMap[char] || char).join('');
    }

    return processedText;
  };

  // Real-time conversion as user types
  useEffect(() => {
    const result = reverseText(text, options);
    setResult(result);
  }, [text, options]);

  const handleClear = () => {
    setText('');
  };

  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(result);
  };

  const handleSampleText = () => {
    const sample = `Welcome to DapsiWow's Reverse Text Tool! This amazing tool can reverse your text in multiple ways - by characters, words, or lines. Perfect for creating interesting effects, puzzles, or just having fun with text transformation.`;
    setText(sample);
  };

  const updateOption = (key: keyof ReverseTextOptions, value: boolean) => {
    setOptions(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Helmet>
        <title>Reverse Text Tool - Reverse Characters, Words & Lines | DapsiWow</title>
        <meta name="description" content="Free online reverse text tool to flip text backwards by characters, words, or lines. Create mirror text, upside down text, and reversed text effects instantly." />
        <meta name="keywords" content="reverse text, backward text, flip text, mirror text, upside down text, text reverser, character reversal, word reversal" />
        <meta property="og:title" content="Reverse Text Tool - Reverse Characters, Words & Lines" />
        <meta property="og:description" content="Free online tool to reverse text by characters, words, or lines. Create interesting text effects and reversed text instantly." />
        <meta property="og:type" content="website" />
        <link rel="canonical" href="/tools/reverse-text-tool" />
      </Helmet>
      
      <Header />
      
      <main>
        {/* Hero Section */}
        <section className="gradient-hero text-white py-16 pt-24">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="w-20 h-20 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <i className="fas fa-backward text-3xl"></i>
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold mb-6" data-testid="text-page-title">
              Reverse Text Tool
            </h1>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto">
              Reverse text by characters, words, or lines. Create mirror effects and upside-down text transformations
            </p>
          </div>
        </section>

        {/* Calculator Section */}
        <section className="py-16">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <Card className="bg-white shadow-sm border-0">
              <CardContent className="p-8">
                <div className="space-y-8">
                  {/* Input Section */}
                  <div>
                    <h2 className="text-2xl font-semibold text-gray-900 mb-6">Enter Your Text</h2>
                    
                    {/* Text Area */}
                    <div className="space-y-4">
                      <Label htmlFor="text-input" className="text-sm font-medium text-gray-700">
                        Text to Reverse
                      </Label>
                      <textarea
                        id="text-input"
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        className="w-full h-32 p-4 text-base border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                        placeholder="Type or paste your text here to reverse it..."
                        data-testid="textarea-text-input"
                      />
                    </div>

                    {/* Options */}
                    <div className="mt-6 space-y-4">
                      <h3 className="text-lg font-semibold text-gray-900">Reverse Options</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                          <div className="space-y-1">
                            <Label className="text-sm font-medium">Reverse by Words</Label>
                            <p className="text-xs text-gray-500">Reverse the order of words instead of characters</p>
                          </div>
                          <Switch
                            checked={options.reverseByWords}
                            onCheckedChange={(value) => updateOption('reverseByWords', value)}
                            data-testid="switch-reverse-words"
                          />
                        </div>

                        <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                          <div className="space-y-1">
                            <Label className="text-sm font-medium">Reverse by Lines</Label>
                            <p className="text-xs text-gray-500">Reverse the order of lines in your text</p>
                          </div>
                          <Switch
                            checked={options.reverseByLines}
                            onCheckedChange={(value) => updateOption('reverseByLines', value)}
                            data-testid="switch-reverse-lines"
                          />
                        </div>

                        <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                          <div className="space-y-1">
                            <Label className="text-sm font-medium">Preserve Spaces</Label>
                            <p className="text-xs text-gray-500">Keep spaces in their original positions</p>
                          </div>
                          <Switch
                            checked={options.preserveSpaces}
                            onCheckedChange={(value) => updateOption('preserveSpaces', value)}
                            data-testid="switch-preserve-spaces"
                          />
                        </div>

                        <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                          <div className="space-y-1">
                            <Label className="text-sm font-medium">Flip Characters</Label>
                            <p className="text-xs text-gray-500">Use upside-down Unicode characters</p>
                          </div>
                          <Switch
                            checked={options.flipCharacters}
                            onCheckedChange={(value) => updateOption('flipCharacters', value)}
                            data-testid="switch-flip-characters"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-4 mt-6">
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
                    </div>
                  </div>

                  {/* Results Section */}
                  <div>
                    <h2 className="text-2xl font-semibold text-gray-900 mb-6">Reversed Text</h2>
                    
                    {result ? (
                      <div className="space-y-4" data-testid="reversed-result">
                        <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6">
                          <div className="flex items-center justify-between mb-4">
                            <div>
                              <h3 className="font-semibold text-gray-900">Reversed Result</h3>
                              <p className="text-sm text-gray-600">
                                {options.reverseByLines ? 'Lines reversed' :
                                 options.reverseByWords ? 'Words reversed' :
                                 'Characters reversed'}
                                {options.preserveSpaces ? ', spaces preserved' : ''}
                                {options.flipCharacters ? ', characters flipped' : ''}
                              </p>
                            </div>
                            <Button
                              onClick={handleCopyToClipboard}
                              variant="outline"
                              size="sm"
                              data-testid="button-copy-result"
                            >
                              <i className="fas fa-copy mr-1"></i>
                              Copy
                            </Button>
                          </div>
                          <div 
                            className="bg-white p-4 rounded border border-gray-200 text-base font-mono break-words whitespace-pre-wrap"
                            data-testid="reversed-text-output"
                          >
                            {result}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-12 text-gray-500">
                        <i className="fas fa-backward text-4xl mb-4"></i>
                        <p className="text-lg">Start typing to see your text reversed</p>
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
          {/* What is a Reverse Text Tool */}
          <div className="mt-12 bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">What is a Reverse Text Tool?</h2>
            <div className="prose max-w-none">
              <p className="text-lg text-gray-700 mb-6">
                A <strong>reverse text tool</strong> is a text transformation utility that reverses the order of characters, words, or lines in your text. Our comprehensive reverse text tool offers multiple reversal methods including character-by-character reversal, word order reversal, line order reversal, and even upside-down character flipping.
              </p>
              
              <p className="text-gray-700 mb-6">
                Whether you're creating puzzles, generating mirror effects for social media, testing text processing algorithms, or just having fun with text transformations, our reverse text tool provides multiple options to achieve the exact reversal effect you need.
              </p>
            </div>
          </div>

          {/* How to Use */}
          <div className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">How to Use the Reverse Text Tool</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-semibold">1</div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Enter Your Text</h3>
                    <p className="text-gray-600">Type or paste the text you want to reverse into the input area.</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-semibold">2</div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Choose Reverse Method</h3>
                    <p className="text-gray-600">Select how you want to reverse: by characters, words, or lines.</p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-semibold">3</div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Apply Options</h3>
                    <p className="text-gray-600">Enable additional options like preserving spaces or flipping characters.</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-semibold">4</div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Copy Result</h3>
                    <p className="text-gray-600">Copy the reversed text to your clipboard for use elsewhere.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Reverse Methods */}
          <div className="mt-8 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Reverse Methods Explained</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="p-4 bg-white rounded-lg shadow-sm">
                  <h3 className="font-semibold text-gray-900 mb-2">
                    <i className="fas fa-font mr-2 text-blue-600"></i>
                    Character Reversal
                  </h3>
                  <p className="text-gray-600 text-sm mb-2">Reverses each character in the text</p>
                  <div className="text-xs text-gray-500">
                    <span className="font-mono">"Hello" → "olleH"</span>
                  </div>
                </div>
                
                <div className="p-4 bg-white rounded-lg shadow-sm">
                  <h3 className="font-semibold text-gray-900 mb-2">
                    <i className="fas fa-list mr-2 text-green-600"></i>
                    Word Reversal
                  </h3>
                  <p className="text-gray-600 text-sm mb-2">Reverses the order of words</p>
                  <div className="text-xs text-gray-500">
                    <span className="font-mono">"Hello World" → "World Hello"</span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="p-4 bg-white rounded-lg shadow-sm">
                  <h3 className="font-semibold text-gray-900 mb-2">
                    <i className="fas fa-bars mr-2 text-purple-600"></i>
                    Line Reversal
                  </h3>
                  <p className="text-gray-600 text-sm mb-2">Reverses the order of lines</p>
                  <div className="text-xs text-gray-500">
                    <span className="font-mono">Useful for multi-line text</span>
                  </div>
                </div>
                
                <div className="p-4 bg-white rounded-lg shadow-sm">
                  <h3 className="font-semibold text-gray-900 mb-2">
                    <i className="fas fa-flip-horizontal mr-2 text-orange-600"></i>
                    Character Flipping
                  </h3>
                  <p className="text-gray-600 text-sm mb-2">Uses upside-down Unicode characters</p>
                  <div className="text-xs text-gray-500">
                    <span className="font-mono">"Hello" → "oɹɹǝɥ"</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Use Cases */}
          <div className="mt-8 bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Common Use Cases</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <i className="fas fa-puzzle-piece text-blue-600 text-xl"></i>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Puzzles & Games</h3>
                <p className="text-gray-600 text-sm">Create word puzzles and riddles with reversed text.</p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <i className="fas fa-share-alt text-green-600 text-xl"></i>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Social Media</h3>
                <p className="text-gray-600 text-sm">Create interesting visual effects for posts and captions.</p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <i className="fas fa-code text-purple-600 text-xl"></i>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Development</h3>
                <p className="text-gray-600 text-sm">Test string processing and text algorithms.</p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <i className="fas fa-graduation-cap text-orange-600 text-xl"></i>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Education</h3>
                <p className="text-gray-600 text-sm">Teach text manipulation and language concepts.</p>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default ReverseTextTool;