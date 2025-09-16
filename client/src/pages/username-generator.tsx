import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';

interface UsernameOptions {
  style: 'random' | 'adjective-noun' | 'name-based' | 'gaming' | 'professional';
  length: number;
  includeNumbers: boolean;
  includeSymbols: boolean;
  capitalizeWords: boolean;
  separator: 'none' | 'underscore' | 'dash' | 'dot';
}

interface GeneratedUsername {
  username: string;
  style: string;
  isAvailable?: boolean;
  variations: string[];
}

const UsernameGenerator = () => {
  const [generatedUsername, setGeneratedUsername] = useState<GeneratedUsername | null>(null);
  const [usernameHistory, setUsernameHistory] = useState<GeneratedUsername[]>([]);
  const [options, setOptions] = useState<UsernameOptions>({
    style: 'adjective-noun',
    length: 12,
    includeNumbers: true,
    includeSymbols: false,
    capitalizeWords: false,
    separator: 'none'
  });

  // Username generation data
  const data = {
    adjectives: [
      'cool', 'epic', 'awesome', 'super', 'mega', 'ultra', 'swift', 'quick', 'smart', 'bright',
      'dark', 'mystic', 'crypto', 'cyber', 'neon', 'pixel', 'turbo', 'atomic', 'stellar', 'cosmic',
      'fire', 'ice', 'thunder', 'shadow', 'golden', 'silver', 'royal', 'prime', 'alpha', 'beta',
      'wild', 'fierce', 'bold', 'brave', 'stealth', 'ninja', 'phantom', 'ghost', 'spirit', 'soul'
    ],
    nouns: [
      'warrior', 'ninja', 'dragon', 'tiger', 'wolf', 'eagle', 'phoenix', 'lion', 'shark', 'panther',
      'hunter', 'wizard', 'knight', 'ranger', 'assassin', 'guardian', 'champion', 'legend', 'hero', 'master',
      'storm', 'blade', 'arrow', 'shield', 'sword', 'spear', 'hammer', 'axe', 'bow', 'staff',
      'star', 'moon', 'sun', 'comet', 'nova', 'void', 'cosmos', 'galaxy', 'planet', 'meteor'
    ],
    names: [
      'alex', 'jordan', 'casey', 'taylor', 'morgan', 'riley', 'quinn', 'sage', 'river', 'phoenix',
      'sky', 'storm', 'sage', 'gray', 'blue', 'red', 'green', 'black', 'white', 'silver',
      'max', 'sam', 'kai', 'zen', 'ace', 'rex', 'zoe', 'leo', 'mia', 'ava'
    ],
    gaming: [
      'noob', 'pro', 'elite', 'legend', 'master', 'champion', 'killer', 'slayer', 'destroyer', 'crusher',
      'gamer', 'player', 'sniper', 'camper', 'rusher', 'tank', 'healer', 'mage', 'rogue', 'paladin',
      'pwner', 'owned', 'rekt', 'beast', 'savage', 'tryhard', 'casual', 'hardcore', 'mlg', 'fps'
    ],
    professional: [
      'dev', 'code', 'tech', 'data', 'cloud', 'web', 'app', 'sys', 'net', 'db',
      'admin', 'user', 'client', 'server', 'host', 'node', 'api', 'json', 'xml', 'html',
      'css', 'js', 'python', 'java', 'react', 'vue', 'angular', 'node', 'express', 'mongo'
    ],
    symbols: ['_', '-', '.'],
    separators: {
      none: '',
      underscore: '_',
      dash: '-',
      dot: '.'
    }
  };

  const getRandomItem = <T,>(array: T[]): T => {
    return array[Math.floor(Math.random() * array.length)];
  };

  const getRandomNumber = (min: number, max: number): number => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  };

  const capitalizeWord = (word: string): string => {
    return word.charAt(0).toUpperCase() + word.slice(1);
  };

  const addNumbers = (base: string, count: number = 2): string => {
    const numbers = Array.from({ length: count }, () => getRandomNumber(0, 9)).join('');
    return base + numbers;
  };

  const addSymbols = (base: string): string => {
    const symbol = getRandomItem(data.symbols);
    const position = Math.random() < 0.5 ? 'start' : 'end';
    return position === 'start' ? symbol + base : base + symbol;
  };

  const truncateToLength = (text: string, maxLength: number): string => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength);
  };

  const generateUsername = (opts: UsernameOptions): GeneratedUsername => {
    let baseUsername = '';
    const separator = data.separators[opts.separator];

    // Generate base username based on style
    switch (opts.style) {
      case 'adjective-noun':
        const adjective = getRandomItem(data.adjectives);
        const noun = getRandomItem(data.nouns);
        baseUsername = opts.capitalizeWords
          ? capitalizeWord(adjective) + separator + capitalizeWord(noun)
          : adjective + separator + noun;
        break;

      case 'name-based':
        const name = getRandomItem(data.names);
        const suffix = getRandomItem([...data.nouns, ...data.adjectives]);
        baseUsername = opts.capitalizeWords
          ? capitalizeWord(name) + separator + capitalizeWord(suffix)
          : name + separator + suffix;
        break;

      case 'gaming':
        const gamingTerm1 = getRandomItem(data.gaming);
        const gamingTerm2 = getRandomItem([...data.gaming, ...data.nouns]);
        baseUsername = opts.capitalizeWords
          ? capitalizeWord(gamingTerm1) + separator + capitalizeWord(gamingTerm2)
          : gamingTerm1 + separator + gamingTerm2;
        break;

      case 'professional':
        const techTerm = getRandomItem(data.professional);
        const profSuffix = getRandomItem([...data.professional, ...data.names]);
        baseUsername = opts.capitalizeWords
          ? capitalizeWord(techTerm) + separator + capitalizeWord(profSuffix)
          : techTerm + separator + profSuffix;
        break;

      case 'random':
      default:
        const randomWords = [
          ...data.adjectives,
          ...data.nouns,
          ...data.names,
          ...data.gaming.slice(0, 10),
          ...data.professional.slice(0, 10)
        ];
        const word1 = getRandomItem(randomWords);
        const word2 = getRandomItem(randomWords);
        baseUsername = opts.capitalizeWords
          ? capitalizeWord(word1) + separator + capitalizeWord(word2)
          : word1 + separator + word2;
        break;
    }

    // Add numbers if enabled
    if (opts.includeNumbers) {
      baseUsername = addNumbers(baseUsername, getRandomNumber(1, 3));
    }

    // Add symbols if enabled
    if (opts.includeSymbols && opts.separator === 'none') {
      baseUsername = addSymbols(baseUsername);
    }

    // Truncate to specified length
    const finalUsername = truncateToLength(baseUsername, opts.length);

    // Generate variations
    const variations: string[] = [];
    for (let i = 0; i < 5; i++) {
      // Generate variation by slightly modifying the final username
      let variation = finalUsername;
      if (opts.includeNumbers) {
        const randomNum = getRandomNumber(10, 999);
        variation = variation.replace(/\d+/g, randomNum.toString());
      } else {
        variation = variation + getRandomNumber(1, 99);
      }

      if (variation !== finalUsername && !variations.includes(variation)) {
        variations.push(variation);
      }
    }

    return {
      username: finalUsername,
      style: opts.style.charAt(0).toUpperCase() + opts.style.slice(1).replace('-', ' '),
      variations: variations.slice(0, 4)
    };
  };

  const handleGenerateUsername = () => {
    const newUsername = generateUsername(options);
    setGeneratedUsername(newUsername);

    // Add to history (keep last 10)
    setUsernameHistory(prev => {
      const updated = [newUsername, ...prev.filter(u => u.username !== newUsername.username)];
      return updated.slice(0, 10);
    });
  };

  const updateOption = <K extends keyof UsernameOptions>(key: K, value: UsernameOptions[K]) => {
    setOptions(prev => ({ ...prev, [key]: value }));
  };

  const handleCopyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const resetGenerator = () => {
    setOptions({
      style: 'adjective-noun',
      length: 12,
      includeNumbers: true,
      includeSymbols: false,
      capitalizeWords: false,
      separator: 'none'
    });
    setGeneratedUsername(null);
    setUsernameHistory([]);
  };

  // Generate initial username
  useEffect(() => {
    handleGenerateUsername();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Helmet>
        <title>Random Username Generator - Create Unique Usernames | DapsiWow</title>
        <meta name="description" content="Free username generator to create unique, creative usernames for gaming, social media, and online accounts. Customize style, length, and format to create the perfect username." />
        <meta name="keywords" content="username generator, random username, unique username, gaming username, social media username, account name generator, username creator, handle generator, online username, creative username" />
        <meta property="og:title" content="Random Username Generator - Create Unique Usernames | DapsiWow" />
        <meta property="og:description" content="Generate creative usernames with customizable options for gaming, social media, and professional accounts. Free online username generator with instant results." />
        <meta property="og:type" content="website" />
        <meta name="robots" content="index, follow" />
        <meta name="author" content="DapsiWow" />
        <link rel="canonical" href="https://dapsiwow.com/tools/username-generator" />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            "name": "Random Username Generator",
            "description": "Free online username generator to create unique, memorable usernames for gaming, social media, and online accounts with customizable options.",
            "url": "https://dapsiwow.com/tools/username-generator",
            "applicationCategory": "UtilityApplication",
            "operatingSystem": "Any",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "USD"
            },
            "featureList": [
              "Generate unique usernames instantly",
              "Multiple username styles available",
              "Customizable length and format options",
              "Gaming and professional username options",
              "Username variations generator",
              "Copy usernames with one click"
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
                <span className="text-sm font-medium text-blue-700">Smart Username Generator</span>
              </div>
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-slate-900 leading-tight" data-testid="text-page-title">
                Random Username
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                  Generator
                </span>
              </h1>
              <p className="text-xl sm:text-2xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
                Create unique, memorable usernames for gaming, social media, and professional accounts with advanced customization options
              </p>
            </div>
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-4 py-16">
          {/* Main Generator Card */}
          <Card className="bg-white/90 backdrop-blur-sm shadow-2xl border-0 rounded-3xl overflow-hidden">
            <CardContent className="p-0">
              <div className="grid grid-cols-1 lg:grid-cols-[1.7fr_1.3fr] gap-0">
                {/* Input Section */}
                <div className="p-8 lg:p-12 space-y-8">
                  <div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">Username Configuration</h2>
                    <p className="text-gray-600">Customize your username preferences to generate the perfect handle</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Style Selection */}
                    <div className="space-y-3">
                      <Label htmlFor="username-style" className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                        Username Style
                      </Label>
                      <Select value={options.style} onValueChange={(value: typeof options.style) => updateOption('style', value)}>
                        <SelectTrigger className="h-14 border-2 border-gray-200 rounded-xl text-lg" data-testid="select-style">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="adjective-noun">Adjective + Noun</SelectItem>
                          <SelectItem value="name-based">Name Based</SelectItem>
                          <SelectItem value="gaming">Gaming Style</SelectItem>
                          <SelectItem value="professional">Professional</SelectItem>
                          <SelectItem value="random">Random Mix</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Word Separator */}
                    <div className="space-y-3">
                      <Label htmlFor="separator" className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                        Word Separator
                      </Label>
                      <Select value={options.separator} onValueChange={(value: typeof options.separator) => updateOption('separator', value)}>
                        <SelectTrigger className="h-14 border-2 border-gray-200 rounded-xl text-lg" data-testid="select-separator">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">None (combined)</SelectItem>
                          <SelectItem value="underscore">Underscore (_)</SelectItem>
                          <SelectItem value="dash">Dash (-)</SelectItem>
                          <SelectItem value="dot">Dot (.)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Length Slider */}
                    <div className="md:col-span-2 space-y-4">
                      <div className="flex items-center justify-between">
                        <Label className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                          Username Length
                        </Label>
                        <span className="text-2xl font-bold text-blue-600">{options.length}</span>
                      </div>
                      <div className="px-2">
                        <Slider
                          value={[options.length]}
                          onValueChange={(value) => updateOption('length', value[0])}
                          max={30}
                          min={6}
                          step={1}
                          className="w-full"
                          data-testid="slider-length"
                        />
                        <div className="flex justify-between text-sm text-gray-500 mt-2">
                          <span>6 characters</span>
                          <span>30 characters</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Advanced Options */}
                  <div className="space-y-6 border-t pt-8">
                    <h3 className="text-xl font-bold text-gray-900">Advanced Options</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Include Numbers */}
                      <div className="space-y-4 bg-gray-50 rounded-xl p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <Label className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                              Include Numbers
                            </Label>
                            <p className="text-sm text-gray-600 mt-1">Add random numbers to make usernames unique</p>
                          </div>
                          <Switch
                            checked={options.includeNumbers}
                            onCheckedChange={(value) => updateOption('includeNumbers', value)}
                            data-testid="switch-numbers"
                          />
                        </div>
                      </div>

                      {/* Include Symbols */}
                      <div className="space-y-4 bg-gray-50 rounded-xl p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <Label className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                              Include Symbols
                            </Label>
                            <p className="text-sm text-gray-600 mt-1">Add symbols like _, -, . for uniqueness</p>
                          </div>
                          <Switch
                            checked={options.includeSymbols}
                            onCheckedChange={(value) => updateOption('includeSymbols', value)}
                            data-testid="switch-symbols"
                          />
                        </div>
                      </div>

                      {/* Capitalize Words */}
                      <div className="space-y-4 bg-gray-50 rounded-xl p-6 md:col-span-2">
                        <div className="flex items-center justify-between">
                          <div>
                            <Label className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                              Capitalize Words
                            </Label>
                            <p className="text-sm text-gray-600 mt-1">Start each word with a capital letter</p>
                          </div>
                          <Switch
                            checked={options.capitalizeWords}
                            onCheckedChange={(value) => updateOption('capitalizeWords', value)}
                            data-testid="switch-capitalize"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-4 pt-6">
                    <Button
                      onClick={handleGenerateUsername}
                      className="flex-1 h-14 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold text-lg rounded-xl shadow-lg transform transition-all duration-200 hover:scale-105"
                      data-testid="button-generate-username"
                    >
                      Generate Username
                    </Button>
                    <Button
                      onClick={resetGenerator}
                      variant="outline"
                      className="h-14 px-8 border-2 border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold text-lg rounded-xl"
                      data-testid="button-reset"
                    >
                      Reset
                    </Button>
                  </div>
                </div>

                {/* Results Section */}
                <div className="bg-gradient-to-br from-gray-50 to-blue-50 p-8 lg:p-12">
                  <h2 className="text-2xl font-bold text-gray-900 mb-8">Generated Username</h2>

                  {generatedUsername ? (
                    <div className="space-y-6" data-testid="generated-username-display">
                      {/* Main Username Display */}
                      <div className="bg-white rounded-2xl p-6 shadow-lg border border-blue-100">
                        <div className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-2">Your Username</div>
                        <div className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 font-mono mb-2" data-testid="main-username">
                          {generatedUsername.username}
                        </div>
                        <div className="text-sm text-gray-500">Style: {generatedUsername.style}</div>
                      </div>

                      {/* Username Details */}
                      <div className="space-y-4">
                        <div className="bg-white rounded-xl p-4 shadow-sm">
                          <div className="flex justify-between items-center">
                            <span className="font-medium text-gray-700">Length</span>
                            <span className="font-bold text-gray-900" data-testid="username-length">
                              {generatedUsername.username.length} characters
                            </span>
                          </div>
                        </div>
                        <div className="bg-white rounded-xl p-4 shadow-sm">
                          <div className="flex justify-between items-center">
                            <span className="font-medium text-gray-700">Contains Numbers</span>
                            <span className="font-bold text-gray-900">
                              {/\d/.test(generatedUsername.username) ? 'Yes' : 'No'}
                            </span>
                          </div>
                        </div>
                        <div className="bg-white rounded-xl p-4 shadow-sm">
                          <div className="flex justify-between items-center">
                            <span className="font-medium text-gray-700">Contains Symbols</span>
                            <span className="font-bold text-gray-900">
                              {/[_\-.]/.test(generatedUsername.username) ? 'Yes' : 'No'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Username Variations */}
                      {generatedUsername.variations.length > 0 && (
                        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
                          <h4 className="font-bold text-green-800 mb-4 text-lg">Alternative Suggestions</h4>
                          <div className="space-y-3">
                            {generatedUsername.variations.map((variation, index) => (
                              <div key={index} className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm">
                                <div className="font-mono text-gray-700" data-testid={`variation-${index}`}>
                                  {variation}
                                </div>
                                <Button
                                  onClick={() => handleCopyToClipboard(variation)}
                                  variant="ghost"
                                  size="sm"
                                  className="text-green-600 hover:text-green-700 hover:bg-green-50"
                                  data-testid={`button-copy-variation-${index}`}
                                >
                                  Copy
                                </Button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Copy Button */}
                      <Button
                        onClick={() => handleCopyToClipboard(generatedUsername.username)}
                        className="w-full h-12 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl"
                        data-testid="button-copy-main"
                      >
                        Copy Username
                      </Button>
                    </div>
                  ) : (
                    <div className="text-center py-16" data-testid="no-results">
                      <div className="w-20 h-20 bg-gray-200 rounded-full mx-auto mb-6 flex items-center justify-center">
                        <div className="text-3xl font-bold text-gray-400">@</div>
                      </div>
                      <p className="text-gray-500 text-lg">Configure options and generate to see username results</p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Username History */}
          {usernameHistory.length > 1 && (
            <Card className="mt-8 bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Recently Generated Usernames</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {usernameHistory.slice(1, 7).map((username, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-blue-50 transition-colors">
                      <div>
                        <div className="font-mono text-gray-900 font-medium" data-testid={`history-username-${index}`}>
                          {username.username}
                        </div>
                        <div className="text-sm text-gray-500">
                          {username.style}
                        </div>
                      </div>
                      <Button
                        onClick={() => handleCopyToClipboard(username.username)}
                        variant="ghost"
                        size="sm"
                        className="text-blue-600 hover:text-blue-700 hover:bg-blue-100"
                        data-testid={`button-copy-history-${index}`}
                      >
                        Copy
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* SEO Content Section */}
          <div className="mt-16 grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">What is a Username Generator?</h3>
                <div className="space-y-4 text-gray-600">
                  <p>
                    A <strong>username generator</strong> is an intelligent online tool that automatically creates unique, memorable usernames for your digital accounts across various platforms. Our advanced random username generator combines creative algorithms with customizable options to produce distinctive handles that reflect your personality and intended use case.
                  </p>
                  <p>
                    Whether you need a <strong>gaming username</strong> for your favorite online games, a professional handle for business networks, or creative usernames for social media platforms, our generator provides unlimited combinations with instant results. The tool eliminates the frustration of brainstorming usernames and ensures you always have backup options.
                  </p>
                  <p>
                    Our username generator stands out by offering extensive customization options including style selection, length control, number integration, symbol inclusion, and separator choices, making it the most versatile username creation tool available online.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">How Our Username Generator Works</h3>
                <div className="space-y-4 text-gray-600">
                  <p>
                    Our sophisticated username generator algorithm combines carefully curated word databases with intelligent randomization to create usernames that are both unique and memorable. The process involves multiple steps to ensure quality results every time.
                  </p>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-xs font-bold text-blue-600">1</span>
                      </div>
                      <span className="text-sm"><strong>Style Selection:</strong> Choose from adjective-noun, gaming, professional, or random combinations</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-xs font-bold text-blue-600">2</span>
                      </div>
                      <span className="text-sm"><strong>Word Combination:</strong> Intelligently combines words from extensive databases</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-xs font-bold text-blue-600">3</span>
                      </div>
                      <span className="text-sm"><strong>Customization:</strong> Applies your preferences for numbers, symbols, and formatting</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-xs font-bold text-blue-600">4</span>
                      </div>
                      <span className="text-sm"><strong>Variation Generation:</strong> Creates multiple alternatives for maximum availability</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Username Generation Features</h3>
                <div className="space-y-3 text-gray-600">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span><strong>Multiple Styles:</strong> Adjective-noun, gaming, professional, name-based, and random combinations</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span><strong>Customizable Length:</strong> Generate usernames from 6 to 30 characters to fit platform requirements</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span><strong>Number Integration:</strong> Add random numbers to increase uniqueness and availability</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span><strong>Symbol Options:</strong> Include underscores, dashes, or dots for better formatting</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span><strong>Capitalization Control:</strong> Choose between lowercase or capitalized words</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span><strong>Alternative Variations:</strong> Get multiple username suggestions with each generation</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Why Use Our Username Generator?</h3>
                <div className="space-y-3 text-gray-600">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span><strong>Instant Results:</strong> Generate unlimited unique usernames in seconds without delays</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span><strong>No Registration Required:</strong> Use our generator completely free without creating accounts</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span><strong>Privacy Protected:</strong> All generation happens locally in your browser</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span><strong>Cross-Platform Compatible:</strong> Create usernames suitable for any platform or service</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span><strong>Mobile Responsive:</strong> Generate usernames on any device, anywhere</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span><strong>History Tracking:</strong> Keep track of recently generated usernames for easy access</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Username Style Guide */}
          <div className="mt-8 space-y-8">
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Complete Guide to Username Styles</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-6">
                    <div className="border-l-4 border-blue-500 pl-6">
                      <h4 className="text-lg font-semibold text-gray-900 mb-2">Adjective + Noun Style</h4>
                      <p className="text-gray-600 text-sm mb-3">Combines descriptive adjectives with powerful nouns to create memorable usernames. Perfect for general use across most platforms.</p>
                      <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded-lg">
                        <strong>Examples:</strong> CoolWarrior, SwiftEagle, DarkPhoenix, BrightStorm
                      </div>
                    </div>

                    <div className="border-l-4 border-green-500 pl-6">
                      <h4 className="text-lg font-semibold text-gray-900 mb-2">Gaming Style</h4>
                      <p className="text-gray-600 text-sm mb-3">Specifically designed for gamers with terms like Pro, Elite, Slayer, and Champion. Ideal for competitive gaming platforms.</p>
                      <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded-lg">
                        <strong>Examples:</strong> ProSniper, EliteDestroyer, LegendSlayer, ChampionRusher
                      </div>
                    </div>

                    <div className="border-l-4 border-purple-500 pl-6">
                      <h4 className="text-lg font-semibold text-gray-900 mb-2">Professional Style</h4>
                      <p className="text-gray-600 text-sm mb-3">Tech and business-focused usernames perfect for professional networks, GitHub, LinkedIn, and work-related accounts.</p>
                      <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded-lg">
                        <strong>Examples:</strong> DevCoder, TechAdmin, DataAnalyst, CloudArchitect
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="border-l-4 border-orange-500 pl-6">
                      <h4 className="text-lg font-semibold text-gray-900 mb-2">Name-Based Style</h4>
                      <p className="text-gray-600 text-sm mb-3">Uses common names combined with additional words, creating personal yet unique usernames suitable for social media.</p>
                      <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded-lg">
                        <strong>Examples:</strong> AlexStorm, CaseyWolf, JordanStar, TaylorBlade
                      </div>
                    </div>

                    <div className="border-l-4 border-red-500 pl-6">
                      <h4 className="text-lg font-semibold text-gray-900 mb-2">Random Mix Style</h4>
                      <p className="text-gray-600 text-sm mb-3">Combines words from all categories randomly, producing the most diverse and unpredictable username combinations.</p>
                      <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded-lg">
                        <strong>Examples:</strong> NinjaCode, StormDev, PhoenixGamer, CyberSage
                      </div>
                    </div>

                    <div className="border-l-4 border-indigo-500 pl-6">
                      <h4 className="text-lg font-semibold text-gray-900 mb-2">Customization Options</h4>
                      <p className="text-gray-600 text-sm mb-3">All styles can be enhanced with numbers, symbols, separators, and capitalization to create truly unique combinations.</p>
                      <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded-lg">
                        <strong>Enhanced:</strong> Cool_Warrior99, swift-eagle, Dark.Phoenix, BRIGHTSTORM
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Platform-Specific Username Guidelines */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Platform-Specific Username Guidelines</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6">
                    <h4 className="font-semibold text-blue-900 mb-3">Gaming Platforms</h4>
                    <div className="space-y-2 text-sm text-blue-800">
                      <p><strong>Steam, Xbox, PlayStation:</strong></p>
                      <ul className="list-disc list-inside space-y-1 text-xs">
                        <li>Gaming or Adjective-Noun styles work best</li>
                        <li>Include numbers for uniqueness</li>
                        <li>8-20 character length recommended</li>
                        <li>Underscores widely supported</li>
                      </ul>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-6">
                    <h4 className="font-semibold text-green-900 mb-3">Social Media</h4>
                    <div className="space-y-2 text-sm text-green-800">
                      <p><strong>Instagram, Twitter, TikTok:</strong></p>
                      <ul className="list-disc list-inside space-y-1 text-xs">
                        <li>Creative and memorable styles preferred</li>
                        <li>Shorter usernames get better engagement</li>
                        <li>Avoid excessive symbols</li>
                        <li>Consider brand consistency</li>
                      </ul>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-6">
                    <h4 className="font-semibold text-purple-900 mb-3">Professional Networks</h4>
                    <div className="space-y-2 text-sm text-purple-800">
                      <p><strong>LinkedIn, GitHub:</strong></p>
                      <ul className="list-disc list-inside space-y-1 text-xs">
                        <li>Professional or Name-based styles</li>
                        <li>Clean formatting with minimal symbols</li>
                        <li>Reflect your expertise or industry</li>
                        <li>Consistent across platforms</li>
                      </ul>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-6">
                    <h4 className="font-semibold text-orange-900 mb-3">Content Creation</h4>
                    <div className="space-y-2 text-sm text-orange-800">
                      <p><strong>YouTube, Twitch, Medium:</strong></p>
                      <ul className="list-disc list-inside space-y-1 text-xs">
                        <li>Brandable and easy to remember</li>
                        <li>Easy to pronounce for verbal mention</li>
                        <li>Reflects your content niche</li>
                        <li>Available across multiple platforms</li>
                      </ul>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg p-6">
                    <h4 className="font-semibold text-red-900 mb-3">Forums & Communities</h4>
                    <div className="space-y-2 text-sm text-red-800">
                      <p><strong>Reddit, Discord, Forums:</strong></p>
                      <ul className="list-disc list-inside space-y-1 text-xs">
                        <li>Community-appropriate styles</li>
                        <li>Memorable for regular interactions</li>
                        <li>Consider community culture</li>
                        <li>Avoid offensive or controversial terms</li>
                      </ul>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-lg p-6">
                    <h4 className="font-semibold text-indigo-900 mb-3">Email & General Use</h4>
                    <div className="space-y-2 text-sm text-indigo-800">
                      <p><strong>Email, General Accounts:</strong></p>
                      <ul className="list-disc list-inside space-y-1 text-xs">
                        <li>Professional yet memorable</li>
                        <li>Easy to spell and communicate</li>
                        <li>Include numbers for availability</li>
                        <li>Balance uniqueness with simplicity</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Username Best Practices */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Username Best Practices and Tips</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div className="bg-green-50 rounded-lg p-6 border-l-4 border-green-500">
                      <h4 className="font-semibold text-green-900 mb-3">Do's for Great Usernames</h4>
                      <ul className="space-y-2 text-sm text-green-800">
                        <li className="flex items-start gap-2">
                          <span className="text-green-600 font-bold">✓</span>
                          <span>Keep it memorable and easy to spell</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-green-600 font-bold">✓</span>
                          <span>Use consistent usernames across platforms</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-green-600 font-bold">✓</span>
                          <span>Check availability before settling on a choice</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-green-600 font-bold">✓</span>
                          <span>Consider your target audience and platform culture</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-green-600 font-bold">✓</span>
                          <span>Think long-term - choose names that age well</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-green-600 font-bold">✓</span>
                          <span>Use our generator for backup options</span>
                        </li>
                      </ul>
                    </div>

                    <div className="bg-blue-50 rounded-lg p-6 border-l-4 border-blue-500">
                      <h4 className="font-semibold text-blue-900 mb-3">Character Length Guidelines</h4>
                      <div className="space-y-3 text-sm text-blue-800">
                        <div className="flex justify-between items-center p-2 bg-white rounded">
                          <span><strong>6-8 characters:</strong> Short & punchy</span>
                          <span className="text-xs bg-blue-100 px-2 py-1 rounded">Gaming</span>
                        </div>
                        <div className="flex justify-between items-center p-2 bg-white rounded">
                          <span><strong>9-15 characters:</strong> Balanced & versatile</span>
                          <span className="text-xs bg-blue-100 px-2 py-1 rounded">Social Media</span>
                        </div>
                        <div className="flex justify-between items-center p-2 bg-white rounded">
                          <span><strong>16-20 characters:</strong> Descriptive & unique</span>
                          <span className="text-xs bg-blue-100 px-2 py-1 rounded">Professional</span>
                        </div>
                        <div className="flex justify-between items-center p-2 bg-white rounded">
                          <span><strong>20+ characters:</strong> Very specific</span>
                          <span className="text-xs bg-blue-100 px-2 py-1 rounded">Specialized</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="bg-red-50 rounded-lg p-6 border-l-4 border-red-500">
                      <h4 className="font-semibold text-red-900 mb-3">Common Username Mistakes to Avoid</h4>
                      <ul className="space-y-2 text-sm text-red-800">
                        <li className="flex items-start gap-2">
                          <span className="text-red-600 font-bold">✗</span>
                          <span>Using personal information like birth dates or addresses</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-red-600 font-bold">✗</span>
                          <span>Creating usernames that are too similar to existing brands</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-red-600 font-bold">✗</span>
                          <span>Using offensive, controversial, or inappropriate terms</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-red-600 font-bold">✗</span>
                          <span>Making usernames too complex or hard to remember</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-red-600 font-bold">✗</span>
                          <span>Ignoring platform-specific character restrictions</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-red-600 font-bold">✗</span>
                          <span>Not having backup options when your first choice is taken</span>
                        </li>
                      </ul>
                    </div>

                    <div className="bg-yellow-50 rounded-lg p-6 border-l-4 border-yellow-500">
                      <h4 className="font-semibold text-yellow-900 mb-3">Pro Tips for Username Success</h4>
                      <ul className="space-y-2 text-sm text-yellow-800">
                        <li className="flex items-start gap-2">
                          <span className="text-yellow-600 font-bold">💡</span>
                          <span>Test pronunciation - can others say it easily?</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-yellow-600 font-bold">💡</span>
                          <span>Consider domain availability if building a brand</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-yellow-600 font-bold">💡</span>
                          <span>Use our generator's variations for backup options</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-yellow-600 font-bold">💡</span>
                          <span>Keep a list of favorites for different purposes</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-yellow-600 font-bold">💡</span>
                          <span>Research trademark issues for commercial use</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* FAQ Section */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Frequently Asked Questions About Username Generation</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-2">How does the random username generator work?</h4>
                      <p className="text-gray-600 text-sm">Our generator combines words from curated databases using advanced algorithms to create unique usernames. You can customize style, length, and formatting options to match your specific needs and platform requirements.</p>
                    </div>

                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-2">Are the generated usernames truly unique?</h4>
                      <p className="text-gray-600 text-sm">While our generator creates millions of possible combinations, true uniqueness depends on platform availability. We provide multiple variations with each generation to increase your chances of finding available usernames.</p>
                    </div>

                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-2">What's the best username style for gaming?</h4>
                      <p className="text-gray-600 text-sm">Gaming style or Adjective-Noun combinations work best for gaming platforms. Include numbers for uniqueness and keep the length between 8-16 characters. Avoid excessive symbols that might be hard to type quickly.</p>
                    </div>

                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-2">Can I check if a username is available on different platforms?</h4>
                      <p className="text-gray-600 text-sm">Our generator creates usernames but doesn't check availability across platforms. After generating a username you like, manually check its availability on your desired platforms using their search or registration features.</p>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-2">Should I use the same username across all platforms?</h4>
                      <p className="text-gray-600 text-sm">Using consistent usernames helps with brand recognition and makes it easier for people to find you. However, consider platform-specific cultures and whether a username appropriate for gaming is also suitable for professional networks.</p>
                    </div>

                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-2">How long should my username be?</h4>
                      <p className="text-gray-600 text-sm">The ideal length depends on your platform and purpose. 8-15 characters work well for most platforms, being memorable yet unique. Gaming platforms often accept longer usernames, while social media favors shorter, catchier handles.</p>
                    </div>

                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-2">Is it safe to use this username generator?</h4>
                      <p className="text-gray-600 text-sm">Yes, our generator is completely safe and private. All username generation happens locally in your browser, and we don't store, track, or transmit any generated usernames. Your privacy is fully protected.</p>
                    </div>

                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-2">Can I customize the word combinations used?</h4>
                      <p className="text-gray-600 text-sm">Currently, our generator uses pre-selected word databases optimized for different styles. However, you can influence the output by choosing different styles, adding numbers and symbols, and adjusting length and capitalization settings.</p>
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

export default UsernameGenerator;