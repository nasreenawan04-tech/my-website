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
import { Separator } from '@/components/ui/separator';

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

  // Generate initial username
  useEffect(() => {
    handleGenerateUsername();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Helmet>
        <title>Random Username Generator - Create Unique Usernames | DapsiWow</title>
        <meta name="description" content="Generate unique, creative usernames for social media, gaming, and online accounts. Customize style, length, and format to create the perfect username." />
        <meta name="keywords" content="username generator, random username, unique username, gaming username, social media username, account name generator" />
        <meta property="og:title" content="Random Username Generator - Create Unique Usernames" />
        <meta property="og:description" content="Generate creative usernames with customizable options for gaming, social media, and professional accounts." />
        <meta property="og:type" content="website" />
        <link rel="canonical" href="/tools/username-generator" />
      </Helmet>
      
      <Header />
      
      <main>
        {/* Hero Section */}
        <section className="gradient-hero text-white py-16 pt-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="w-20 h-20 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <i className="fas fa-user text-3xl"></i>
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold mb-6" data-testid="text-page-title">
              Random Username Generator
            </h1>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto">
              Create unique, memorable usernames for gaming, social media, and online accounts
            </p>
          </div>
        </section>

        {/* Generator Section */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <Card className="bg-white shadow-sm border-0">
              <CardContent className="p-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                  {/* Generator Options */}
                  <div className="space-y-8">
                    <h2 className="text-2xl font-semibold text-gray-900 mb-6">Generator Options</h2>
                    
                    <div className="space-y-6">
                      {/* Style Selection */}
                      <div className="space-y-3">
                        <Label className="text-base font-medium">Username Style</Label>
                        <Select 
                          value={options.style} 
                          onValueChange={(value: typeof options.style) => updateOption('style', value)}
                        >
                          <SelectTrigger data-testid="select-style">
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

                      {/* Length Setting */}
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <Label className="text-base font-medium">Username Length</Label>
                          <span className="text-lg font-bold text-blue-600">{options.length}</span>
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
                          <div className="flex justify-between text-sm text-gray-500 mt-1">
                            <span>6</span>
                            <span>30</span>
                          </div>
                        </div>
                      </div>

                      {/* Separator Selection */}
                      <div className="space-y-3">
                        <Label className="text-base font-medium">Word Separator</Label>
                        <Select 
                          value={options.separator} 
                          onValueChange={(value: typeof options.separator) => updateOption('separator', value)}
                        >
                          <SelectTrigger data-testid="select-separator">
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

                      {/* Additional Options */}
                      <div className="space-y-4">
                        <h3 className="font-medium text-gray-900">Additional Options</h3>
                        
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <Label className="text-sm font-medium">Include Numbers</Label>
                              <p className="text-xs text-gray-500">Add random numbers to username</p>
                            </div>
                            <Switch
                              checked={options.includeNumbers}
                              onCheckedChange={(value) => updateOption('includeNumbers', value)}
                              data-testid="switch-numbers"
                            />
                          </div>

                          <div className="flex items-center justify-between">
                            <div>
                              <Label className="text-sm font-medium">Include Symbols</Label>
                              <p className="text-xs text-gray-500">Add symbols like _, -, .</p>
                            </div>
                            <Switch
                              checked={options.includeSymbols}
                              onCheckedChange={(value) => updateOption('includeSymbols', value)}
                              data-testid="switch-symbols"
                            />
                          </div>

                          <div className="flex items-center justify-between">
                            <div>
                              <Label className="text-sm font-medium">Capitalize Words</Label>
                              <p className="text-xs text-gray-500">Start each word with capital letter</p>
                            </div>
                            <Switch
                              checked={options.capitalizeWords}
                              onCheckedChange={(value) => updateOption('capitalizeWords', value)}
                              data-testid="switch-capitalize"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Generate Button */}
                      <Button 
                        onClick={handleGenerateUsername}
                        className="w-full h-12 text-base"
                        data-testid="button-generate-username"
                      >
                        <i className="fas fa-refresh mr-2"></i>
                        Generate New Username
                      </Button>
                    </div>
                  </div>

                  {/* Generated Username Display */}
                  <div className="space-y-6">
                    <h2 className="text-2xl font-semibold text-gray-900 mb-6">Generated Username</h2>
                    
                    {generatedUsername && (
                      <div className="space-y-6" data-testid="generated-username-display">
                        {/* Main Username Display */}
                        <div className="bg-blue-50 rounded-lg p-6 text-center">
                          <div className="text-3xl font-bold text-blue-600 mb-2 font-mono" data-testid="main-username">
                            {generatedUsername.username}
                          </div>
                          <div className="text-sm text-gray-600">
                            Style: {generatedUsername.style}
                          </div>
                        </div>

                        {/* Username Details */}
                        <div className="space-y-4">
                          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div>
                              <div className="font-medium text-gray-900">Username</div>
                              <div className="text-gray-600 font-mono" data-testid="username-text">{generatedUsername.username}</div>
                            </div>
                            <Button
                              onClick={() => handleCopyToClipboard(generatedUsername.username)}
                              variant="ghost"
                              size="sm"
                              data-testid="button-copy-username"
                            >
                              <i className="fas fa-copy"></i>
                            </Button>
                          </div>

                          <div className="p-3 bg-gray-50 rounded-lg">
                            <div className="font-medium text-gray-900 mb-2">Length</div>
                            <div className="text-gray-600" data-testid="username-length">
                              {generatedUsername.username.length} characters
                            </div>
                          </div>
                        </div>

                        {/* Username Variations */}
                        {generatedUsername.variations.length > 0 && (
                          <div className="space-y-3">
                            <h3 className="text-lg font-semibold text-gray-900">Similar Variations</h3>
                            <div className="space-y-2">
                              {generatedUsername.variations.map((variation, index) => (
                                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                  <div className="font-mono text-gray-700" data-testid={`variation-${index}`}>
                                    {variation}
                                  </div>
                                  <Button
                                    onClick={() => handleCopyToClipboard(variation)}
                                    variant="ghost"
                                    size="sm"
                                    data-testid={`button-copy-variation-${index}`}
                                  >
                                    <i className="fas fa-copy"></i>
                                  </Button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex gap-3">
                          <Button
                            onClick={() => handleCopyToClipboard(generatedUsername.username)}
                            variant="outline"
                            className="flex-1"
                            data-testid="button-copy-main"
                          >
                            <i className="fas fa-copy mr-2"></i>
                            Copy Username
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Username History */}
                {usernameHistory.length > 0 && (
                  <>
                    <Separator className="my-8" />
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-4">Recently Generated</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {usernameHistory.slice(0, 6).map((username, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div>
                              <div className="font-mono text-gray-900" data-testid={`history-username-${index}`}>
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
                              data-testid={`button-copy-history-${index}`}
                            >
                              <i className="fas fa-copy"></i>
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Information Sections */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
          {/* What is a Username Generator */}
          <div className="mt-12 bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">What is a Random Username Generator?</h2>
            <div className="prose max-w-none">
              <p className="text-lg text-gray-700 mb-6">
                A <strong>random username generator</strong> is an intelligent tool that automatically creates unique, memorable usernames for your online accounts, gaming profiles, and social media platforms. Our advanced generator combines creative word patterns, customizable styles, and smart algorithms to produce distinctive usernames that stand out from the crowd.
              </p>
              
              <p className="text-gray-700 mb-6">
                Unlike simple username generators, our tool offers extensive customization options including style selection (gaming, professional, name-based), length control, number integration, symbol inclusion, and word separators. Whether you're creating a <strong>gaming username</strong>, professional handle, or social media identity, our generator ensures your username is both unique and memorable.
              </p>

              <p className="text-gray-700 mb-6">
                The generator works by combining carefully curated word lists with intelligent algorithms to create usernames that are not only unique but also easy to remember and type. With over 1000+ word combinations and multiple styling options, you'll never run out of creative username ideas.
              </p>
            </div>
          </div>

          {/* How It Works */}
          <div className="mt-8 bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">How Does the Username Generator Work?</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                  <i className="fas fa-cogs text-purple-600 text-xl"></i>
                </div>
                <h3 className="font-semibold text-gray-900 mb-3">1. Select Your Style</h3>
                <p className="text-gray-600 text-sm">Choose from adjective-noun, gaming, professional, name-based, or random mix styles to match your intended use case.</p>
              </div>
              
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <i className="fas fa-sliders-h text-blue-600 text-xl"></i>
                </div>
                <h3 className="font-semibold text-gray-900 mb-3">2. Customize Options</h3>
                <p className="text-gray-600 text-sm">Adjust length (6-30 characters), add numbers, include symbols, choose separators, and enable capitalization.</p>
              </div>
              
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                  <i className="fas fa-magic text-green-600 text-xl"></i>
                </div>
                <h3 className="font-semibold text-gray-900 mb-3">3. Generate & Copy</h3>
                <p className="text-gray-600 text-sm">Instantly generate unique usernames with variations. Copy your favorite with one click and use immediately.</p>
              </div>
            </div>
          </div>

          {/* Benefits Section */}
          <div className="mt-8 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Why Use Our Username Generator?</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <i className="fas fa-check text-emerald-600 text-sm"></i>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Instant Results</h3>
                    <p className="text-gray-600 text-sm">Generate unlimited unique usernames instantly without any delays or registration requirements.</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <i className="fas fa-check text-emerald-600 text-sm"></i>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Highly Customizable</h3>
                    <p className="text-gray-600 text-sm">Control every aspect of your username including style, length, symbols, numbers, and separators.</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <i className="fas fa-check text-emerald-600 text-sm"></i>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Multiple Variations</h3>
                    <p className="text-gray-600 text-sm">Get multiple username variations for each generation, increasing your chances of finding available usernames.</p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <i className="fas fa-check text-emerald-600 text-sm"></i>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Cross-Platform Ready</h3>
                    <p className="text-gray-600 text-sm">Create usernames suitable for gaming platforms, social media, forums, and professional networks.</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <i className="fas fa-check text-emerald-600 text-sm"></i>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Privacy Focused</h3>
                    <p className="text-gray-600 text-sm">Generate usernames locally in your browser - no data is stored or transmitted to our servers.</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <i className="fas fa-check text-emerald-600 text-sm"></i>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">History Tracking</h3>
                    <p className="text-gray-600 text-sm">Keep track of recently generated usernames to revisit your favorite options.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Username Styles Explained */}
          <div className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Username Styles Explained</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <h3 className="font-semibold text-gray-900 mb-2">Adjective + Noun</h3>
                  <p className="text-gray-600 text-sm">Combines descriptive words with nouns (e.g., CoolWarrior, SwiftEagle)</p>
                </div>
                
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <h3 className="font-semibold text-gray-900 mb-2">Name Based</h3>
                  <p className="text-gray-600 text-sm">Uses common names with additional words (e.g., AlexStorm, CaseyWolf)</p>
                </div>
                
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <h3 className="font-semibold text-gray-900 mb-2">Gaming Style</h3>
                  <p className="text-gray-600 text-sm">Perfect for gamers with terms like Pro, Elite, Slayer (e.g., ProSniper, EliteDestroyer)</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <h3 className="font-semibold text-gray-900 mb-2">Professional</h3>
                  <p className="text-gray-600 text-sm">Tech and business focused for work accounts (e.g., DevCoder, TechAdmin)</p>
                </div>
                
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <h3 className="font-semibold text-gray-900 mb-2">Random Mix</h3>
                  <p className="text-gray-600 text-sm">Combines words from all categories for unique results</p>
                </div>
                
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <h3 className="font-semibold text-gray-900 mb-2">Customization</h3>
                  <p className="text-gray-600 text-sm">Add numbers, symbols, separators, and capitalization</p>
                </div>
              </div>
            </div>
          </div>

          {/* Use Cases by Audience */}
          <div className="mt-8 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Perfect Username Generator for Every User</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              <div className="space-y-6">
                <div className="bg-white rounded-lg p-6 shadow-sm">
                  <div className="flex items-center mb-4">
                    <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center mr-4">
                      <i className="fas fa-gamepad text-red-600"></i>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900">Gamers</h3>
                  </div>
                  <p className="text-gray-600 mb-4">Create epic gaming usernames for Steam, Xbox Live, PlayStation Network, Discord, and online multiplayer games. Generate handles that intimidate opponents and represent your gaming persona.</p>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Battle royale game profiles</li>
                    <li>• MMORPG character names</li>
                    <li>• Esports team handles</li>
                    <li>• Streaming platform usernames</li>
                  </ul>
                </div>

                <div className="bg-white rounded-lg p-6 shadow-sm">
                  <div className="flex items-center mb-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                      <i className="fas fa-hashtag text-blue-600"></i>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900">Social Media Influencers</h3>
                  </div>
                  <p className="text-gray-600 mb-4">Build your brand with memorable usernames for Instagram, TikTok, Twitter, YouTube, and Facebook. Create handles that are easy to remember and help build your online presence.</p>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Instagram business accounts</li>
                    <li>• TikTok creator profiles</li>
                    <li>• YouTube channel names</li>
                    <li>• Twitter handles for brands</li>
                  </ul>
                </div>

                <div className="bg-white rounded-lg p-6 shadow-sm">
                  <div className="flex items-center mb-4">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                      <i className="fas fa-briefcase text-green-600"></i>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900">Professionals</h3>
                  </div>
                  <p className="text-gray-600 mb-4">Generate professional usernames for LinkedIn, GitHub, work email accounts, and business platforms. Create handles that reflect your expertise and industry.</p>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• LinkedIn professional profiles</li>
                    <li>• GitHub developer accounts</li>
                    <li>• Business email addresses</li>
                    <li>• Professional forum accounts</li>
                  </ul>
                </div>
              </div>

              <div className="space-y-6">
                <div className="bg-white rounded-lg p-6 shadow-sm">
                  <div className="flex items-center mb-4">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mr-4">
                      <i className="fas fa-graduation-cap text-purple-600"></i>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900">Students</h3>
                  </div>
                  <p className="text-gray-600 mb-4">Create appropriate usernames for educational platforms, online courses, study groups, and academic forums. Balance creativity with professionalism for school-related accounts.</p>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Online learning platforms</li>
                    <li>• Educational forums</li>
                    <li>• Study group accounts</li>
                    <li>• Academic social networks</li>
                  </ul>
                </div>

                <div className="bg-white rounded-lg p-6 shadow-sm">
                  <div className="flex items-center mb-4">
                    <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center mr-4">
                      <i className="fas fa-pen text-orange-600"></i>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900">Content Creators & Bloggers</h3>
                  </div>
                  <p className="text-gray-600 mb-4">Establish your content brand with unique usernames for blogging platforms, Medium, WordPress, and content management systems. Create memorable handles that represent your niche.</p>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Blog author profiles</li>
                    <li>• Content platform accounts</li>
                    <li>• Newsletter writer handles</li>
                    <li>• Medium publication names</li>
                  </ul>
                </div>

                <div className="bg-white rounded-lg p-6 shadow-sm">
                  <div className="flex items-center mb-4">
                    <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center mr-4">
                      <i className="fas fa-microscope text-indigo-600"></i>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900">Researchers & Academics</h3>
                  </div>
                  <p className="text-gray-600 mb-4">Generate professional yet memorable usernames for research platforms, academic databases, conference systems, and scholarly networks.</p>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Research platform accounts</li>
                    <li>• Academic conference systems</li>
                    <li>• Scholarly database profiles</li>
                    <li>• Peer review platforms</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Platform-Specific Uses */}
          <div className="mt-8 bg-gradient-to-r from-gray-50 to-slate-50 rounded-2xl p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Platform-Specific Username Ideas</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                  <i className="fab fa-discord text-indigo-600 mr-2"></i>
                  Discord & Gaming
                </h3>
                <p className="text-gray-600 text-sm mb-3">Perfect for gaming communities and voice chat platforms.</p>
                <div className="text-xs text-gray-500 space-y-1">
                  <div>• Style: Gaming or Adjective-Noun</div>
                  <div>• Include numbers for uniqueness</div>
                  <div>• 8-16 characters recommended</div>
                </div>
              </div>

              <div className="bg-white rounded-lg p-6 shadow-sm">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                  <i className="fab fa-linkedin text-blue-600 mr-2"></i>
                  LinkedIn & Professional
                </h3>
                <p className="text-gray-600 text-sm mb-3">Professional usernames for career networking.</p>
                <div className="text-xs text-gray-500 space-y-1">
                  <div>• Style: Professional or Name-based</div>
                  <div>• Avoid excessive symbols</div>
                  <div>• Keep it clean and memorable</div>
                </div>
              </div>

              <div className="bg-white rounded-lg p-6 shadow-sm">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                  <i className="fab fa-instagram text-pink-600 mr-2"></i>
                  Instagram & Social
                </h3>
                <p className="text-gray-600 text-sm mb-3">Catchy usernames for social media growth.</p>
                <div className="text-xs text-gray-500 space-y-1">
                  <div>• Style: Creative mix</div>
                  <div>• Use underscores as separators</div>
                  <div>• Keep under 15 characters</div>
                </div>
              </div>

              <div className="bg-white rounded-lg p-6 shadow-sm">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                  <i className="fab fa-github text-gray-700 mr-2"></i>
                  GitHub & Development
                </h3>
                <p className="text-gray-600 text-sm mb-3">Professional handles for code repositories.</p>
                <div className="text-xs text-gray-500 space-y-1">
                  <div>• Style: Professional or Tech-focused</div>
                  <div>• Use dashes for readability</div>
                  <div>• Reflect your coding expertise</div>
                </div>
              </div>

              <div className="bg-white rounded-lg p-6 shadow-sm">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                  <i className="fab fa-twitch text-purple-600 mr-2"></i>
                  Twitch & Streaming
                </h3>
                <p className="text-gray-600 text-sm mb-3">Memorable names for content creators.</p>
                <div className="text-xs text-gray-500 space-y-1">
                  <div>• Style: Gaming or Creative</div>
                  <div>• Easy to pronounce on stream</div>
                  <div>• Brandable and unique</div>
                </div>
              </div>

              <div className="bg-white rounded-lg p-6 shadow-sm">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                  <i className="fas fa-envelope text-blue-500 mr-2"></i>
                  Email & Forums
                </h3>
                <p className="text-gray-600 text-sm mb-3">Versatile usernames for general use.</p>
                <div className="text-xs text-gray-500 space-y-1">
                  <div>• Style: Name-based or Random</div>
                  <div>• Include numbers for availability</div>
                  <div>• Balance uniqueness and simplicity</div>
                </div>
              </div>
            </div>
          </div>

          {/* Related Tools */}
          <div className="mt-8 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Related Tools for Online Identity</h2>
            <p className="text-gray-600 mb-6">Complete your online presence with our comprehensive suite of generators and converters:</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <a href="/tools/password-generator" className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow group">
                <div className="flex items-center mb-3">
                  <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center mr-3">
                    <i className="fas fa-lock text-red-600"></i>
                  </div>
                  <h3 className="font-semibold text-gray-900 group-hover:text-blue-600">Password Generator</h3>
                </div>
                <p className="text-gray-600 text-sm">Create secure passwords to protect your new username accounts.</p>
              </a>

              <a href="/tools/fake-name-generator" className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow group">
                <div className="flex items-center mb-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                    <i className="fas fa-user text-green-600"></i>
                  </div>
                  <h3 className="font-semibold text-gray-900 group-hover:text-blue-600">Fake Name Generator</h3>
                </div>
                <p className="text-gray-600 text-sm">Generate complete fake identities for testing and creative projects.</p>
              </a>

              <a href="/tools/qr-text-generator" className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow group">
                <div className="flex items-center mb-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                    <i className="fas fa-qrcode text-blue-600"></i>
                  </div>
                  <h3 className="font-semibold text-gray-900 group-hover:text-blue-600">QR Code Generator</h3>
                </div>
                <p className="text-gray-600 text-sm">Create QR codes for your social media profiles and usernames.</p>
              </a>

              <a href="/tools/lorem-ipsum-generator" className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow group">
                <div className="flex items-center mb-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                    <i className="fas fa-paragraph text-purple-600"></i>
                  </div>
                  <h3 className="font-semibold text-gray-900 group-hover:text-blue-600">Lorem Ipsum Generator</h3>
                </div>
                <p className="text-gray-600 text-sm">Generate placeholder text for your profile descriptions and bios.</p>
              </a>

              <a href="/tools/case-converter" className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow group">
                <div className="flex items-center mb-3">
                  <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center mr-3">
                    <i className="fas fa-font text-orange-600"></i>
                  </div>
                  <h3 className="font-semibold text-gray-900 group-hover:text-blue-600">Case Converter</h3>
                </div>
                <p className="text-gray-600 text-sm">Convert username text between different case formats.</p>
              </a>

              <a href="/tools/word-counter" className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow group">
                <div className="flex items-center mb-3">
                  <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center mr-3">
                    <i className="fas fa-calculator text-teal-600"></i>
                  </div>
                  <h3 className="font-semibold text-gray-900 group-hover:text-blue-600">Word Counter</h3>
                </div>
                <p className="text-gray-600 text-sm">Count characters and words for username length requirements.</p>
              </a>
            </div>
          </div>

          {/* Enhanced FAQ */}
          <div className="mt-8 bg-gradient-to-r from-gray-50 to-blue-50 rounded-2xl p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Frequently Asked Questions About Username Generation</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">How do I choose the right username style?</h3>
                  <p className="text-gray-600">Consider your platform and purpose. Gaming style works great for games and Discord, professional style for LinkedIn and GitHub, adjective-noun combinations work well for most social media platforms, and name-based styles are perfect for personal accounts.</p>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Should I include numbers in my username?</h3>
                  <p className="text-gray-600">Numbers can help make your username unique, especially if your preferred name is taken. However, avoid too many numbers as they can make usernames harder to remember. Use 1-3 numbers maximum for the best balance.</p>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">What's the ideal username length?</h3>
                  <p className="text-gray-600">Most platforms accept 6-30 characters. Shorter usernames (6-12 characters) are easier to remember and type, while longer ones (13-20 characters) give you more creative options. We recommend 8-15 characters for optimal balance.</p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Which separators should I use?</h3>
                  <p className="text-gray-600">Underscores (_) work on most platforms, dashes (-) are professional-looking, dots (.) are good for email-style usernames, and no separators create cleaner, more modern handles.</p>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Can I check if a username is available?</h3>
                  <p className="text-gray-600">Our generator creates unique combinations, but availability depends on each platform. After generating a username you like, check its availability on your desired platforms. We provide variations to increase your chances of finding available options.</p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Are the generated usernames truly random?</h3>
                  <p className="text-gray-600">Yes, our algorithm combines words randomly from curated lists with mathematical randomization. This ensures each generated username is unique and unpredictable while maintaining readability and memorability.</p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Can I use these usernames commercially?</h3>
                  <p className="text-gray-600">Absolutely! All generated usernames are free to use for personal and commercial purposes. However, always check trademark databases if you plan to use a username for serious business purposes.</p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">How often should I change my username?</h3>
                  <p className="text-gray-600">It depends on your needs. For gaming, you might change frequently. For professional accounts, consistency is key. For social media, consider your brand and audience recognition when deciding to change.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Tips and Best Practices */}
          <div className="mt-8 bg-gradient-to-r from-yellow-50 to-amber-50 rounded-2xl p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Username Best Practices & Tips</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center mb-4">
                  <i className="fas fa-lightbulb text-yellow-600"></i>
                </div>
                <h3 className="font-semibold text-gray-900 mb-3">Keep It Memorable</h3>
                <p className="text-gray-600 text-sm">Choose usernames that are easy to remember and spell. Avoid complex combinations that people might forget or misspell.</p>
              </div>

              <div className="bg-white rounded-lg p-6 shadow-sm">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <i className="fas fa-shield-alt text-blue-600"></i>
                </div>
                <h3 className="font-semibold text-gray-900 mb-3">Avoid Personal Info</h3>
                <p className="text-gray-600 text-sm">Don't include personal information like birth dates, addresses, or real names in public usernames for privacy and security.</p>
              </div>

              <div className="bg-white rounded-lg p-6 shadow-sm">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                  <i className="fas fa-sync text-green-600"></i>
                </div>
                <h3 className="font-semibold text-gray-900 mb-3">Stay Consistent</h3>
                <p className="text-gray-600 text-sm">Use similar usernames across platforms to build brand recognition and make it easier for people to find you.</p>
              </div>

              <div className="bg-white rounded-lg p-6 shadow-sm">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                  <i className="fas fa-search text-purple-600"></i>
                </div>
                <h3 className="font-semibold text-gray-900 mb-3">Check Availability</h3>
                <p className="text-gray-600 text-sm">Before settling on a username, check its availability across all platforms you plan to use to maintain consistency.</p>
              </div>

              <div className="bg-white rounded-lg p-6 shadow-sm">
                <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                  <i className="fas fa-exclamation-triangle text-red-600"></i>
                </div>
                <h3 className="font-semibold text-gray-900 mb-3">Avoid Offensive Content</h3>
                <p className="text-gray-600 text-sm">Ensure your username is appropriate for all audiences and won't get flagged or banned on various platforms.</p>
              </div>

              <div className="bg-white rounded-lg p-6 shadow-sm">
                <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                  <i className="fas fa-rocket text-indigo-600"></i>
                </div>
                <h3 className="font-semibold text-gray-900 mb-3">Think Long-term</h3>
                <p className="text-gray-600 text-sm">Choose usernames that will still represent you in the future. Avoid trends that might become outdated quickly.</p>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default UsernameGenerator;