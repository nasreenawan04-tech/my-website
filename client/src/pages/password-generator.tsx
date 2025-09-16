
import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface PasswordOptions {
  length: number;
  includeUppercase: boolean;
  includeLowercase: boolean;
  includeNumbers: boolean;
  includeSymbols: boolean;
  excludeSimilar: boolean;
  excludeAmbiguous: boolean;
  customCharacters: string;
}

interface PasswordStrength {
  score: number;
  label: string;
  color: string;
  description: string;
}

const PasswordGenerator = () => {
  const [password, setPassword] = useState('');
  const [passwordHistory, setPasswordHistory] = useState<string[]>([]);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [options, setOptions] = useState<PasswordOptions>({
    length: 16,
    includeUppercase: true,
    includeLowercase: true,
    includeNumbers: true,
    includeSymbols: true,
    excludeSimilar: false,
    excludeAmbiguous: false,
    customCharacters: ''
  });
  const [passwordStrength, setPasswordStrength] = useState<PasswordStrength | null>(null);

  const generatePassword = (opts: PasswordOptions): string => {
    let charset = '';
    
    // Define character sets
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const numbers = '0123456789';
    const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';
    
    // Characters that look similar (0, O, l, 1, etc.)
    const similarChars = '0O1lI';
    // Characters that can be ambiguous in some fonts
    const ambiguousChars = '{}[]()/\\\'"`~,;.<>';

    // Build charset based on options
    if (opts.includeUppercase) charset += uppercase;
    if (opts.includeLowercase) charset += lowercase;
    if (opts.includeNumbers) charset += numbers;
    if (opts.includeSymbols) charset += symbols;
    
    // Add custom characters if provided
    if (opts.customCharacters) {
      charset += opts.customCharacters;
    }

    // Remove similar/ambiguous characters if requested
    if (opts.excludeSimilar) {
      charset = charset.split('').filter(char => !similarChars.includes(char)).join('');
    }
    if (opts.excludeAmbiguous) {
      charset = charset.split('').filter(char => !ambiguousChars.includes(char)).join('');
    }

    // Ensure we have characters to work with
    if (charset.length === 0) {
      return 'Error: No character set selected';
    }

    // Generate password
    let generatedPassword = '';
    const array = new Uint8Array(opts.length);
    crypto.getRandomValues(array);
    
    for (let i = 0; i < opts.length; i++) {
      generatedPassword += charset[array[i] % charset.length];
    }

    // Ensure password meets minimum requirements (at least one of each selected type)
    let needsFixing = false;
    if (opts.includeUppercase && !/[A-Z]/.test(generatedPassword)) needsFixing = true;
    if (opts.includeLowercase && !/[a-z]/.test(generatedPassword)) needsFixing = true;
    if (opts.includeNumbers && !/[0-9]/.test(generatedPassword)) needsFixing = true;
    if (opts.includeSymbols && !/[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/.test(generatedPassword)) needsFixing = true;

    // If password doesn't meet requirements, try a few more times
    let attempts = 0;
    while (needsFixing && attempts < 10) {
      const newArray = new Uint8Array(opts.length);
      crypto.getRandomValues(newArray);
      generatedPassword = '';
      
      for (let i = 0; i < opts.length; i++) {
        generatedPassword += charset[newArray[i] % charset.length];
      }
      
      needsFixing = false;
      if (opts.includeUppercase && !/[A-Z]/.test(generatedPassword)) needsFixing = true;
      if (opts.includeLowercase && !/[a-z]/.test(generatedPassword)) needsFixing = true;
      if (opts.includeNumbers && !/[0-9]/.test(generatedPassword)) needsFixing = true;
      if (opts.includeSymbols && !/[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/.test(generatedPassword)) needsFixing = true;
      
      attempts++;
    }

    return generatedPassword;
  };

  const calculatePasswordStrength = (pwd: string): PasswordStrength => {
    let score = 0;
    let feedback = [];

    // Length scoring
    if (pwd.length >= 12) score += 2;
    else if (pwd.length >= 8) score += 1;
    else feedback.push('Use at least 8 characters');

    // Character variety scoring
    if (/[a-z]/.test(pwd)) score += 1;
    else feedback.push('Add lowercase letters');
    
    if (/[A-Z]/.test(pwd)) score += 1;
    else feedback.push('Add uppercase letters');
    
    if (/[0-9]/.test(pwd)) score += 1;
    else feedback.push('Add numbers');
    
    if (/[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/.test(pwd)) score += 2;
    else feedback.push('Add symbols');

    // Bonus points for longer passwords
    if (pwd.length >= 16) score += 1;
    if (pwd.length >= 20) score += 1;

    // Determine strength level
    if (score <= 2) {
      return { score, label: 'Weak', color: 'bg-red-500', description: 'This password is easily guessable. ' + feedback.slice(0, 2).join(', ') };
    } else if (score <= 4) {
      return { score, label: 'Fair', color: 'bg-orange-500', description: 'This password is okay but could be stronger. ' + feedback.slice(0, 1).join('') };
    } else if (score <= 6) {
      return { score, label: 'Good', color: 'bg-yellow-500', description: 'This password is fairly secure for most uses.' };
    } else if (score <= 7) {
      return { score, label: 'Strong', color: 'bg-blue-500', description: 'This password is strong and secure.' };
    } else {
      return { score, label: 'Very Strong', color: 'bg-green-500', description: 'This password is very secure and hard to crack.' };
    }
  };

  const handleGeneratePassword = () => {
    const newPassword = generatePassword(options);
    setPassword(newPassword);
    
    // Add to history (keep last 10)
    setPasswordHistory(prev => {
      const updated = [newPassword, ...prev.filter(p => p !== newPassword)];
      return updated.slice(0, 10);
    });
  };

  const updateOption = (key: keyof PasswordOptions, value: boolean | number | string) => {
    setOptions(prev => ({ ...prev, [key]: value }));
  };

  const handleCopyToClipboard = (textToCopy: string) => {
    navigator.clipboard.writeText(textToCopy);
  };

  const handleSampleGeneration = () => {
    setOptions({
      length: 16,
      includeUppercase: true,
      includeLowercase: true,
      includeNumbers: true,
      includeSymbols: true,
      excludeSimilar: false,
      excludeAmbiguous: false,
      customCharacters: ''
    });
    handleGeneratePassword();
  };

  const handleClear = () => {
    setPassword('');
    setPasswordHistory([]);
  };

  const resetGenerator = () => {
    setPassword('');
    setPasswordHistory([]);
    setOptions({
      length: 16,
      includeUppercase: true,
      includeLowercase: true,
      includeNumbers: true,
      includeSymbols: true,
      excludeSimilar: false,
      excludeAmbiguous: false,
      customCharacters: ''
    });
    setShowAdvanced(false);
    setPasswordStrength(null);
  };

  // Calculate strength when password changes
  useEffect(() => {
    if (password && !password.startsWith('Error:')) {
      setPasswordStrength(calculatePasswordStrength(password));
    } else {
      setPasswordStrength(null);
    }
  }, [password]);

  // Generate initial password
  useEffect(() => {
    handleGeneratePassword();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Helmet>
        <title>Random Password Generator - Create Secure Passwords Online | DapsiWow</title>
        <meta name="description" content="Generate strong, secure passwords with our free online password generator. Customize length, character types, and security settings to create unbreakable passwords for your accounts." />
        <meta name="keywords" content="password generator, random password, secure password, strong password, password creator, password maker, cybersecurity, online security, cryptographic password generator" />
        <meta property="og:title" content="Random Password Generator - Create Secure Passwords Online" />
        <meta property="og:description" content="Free online password generator with advanced customization options. Create cryptographically secure passwords to protect your digital accounts." />
        <meta property="og:type" content="website" />
        <meta name="robots" content="index, follow" />
        <meta name="author" content="DapsiWow" />
        <link rel="canonical" href="https://dapsiwow.com/tools/password-generator" />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            "name": "Random Password Generator",
            "description": "Free online password generator that creates cryptographically secure passwords with customizable options including length, character types, and advanced security settings.",
            "url": "https://dapsiwow.com/tools/password-generator",
            "applicationCategory": "SecurityApplication",
            "operatingSystem": "Any",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "USD"
            },
            "featureList": [
              "Cryptographically secure password generation",
              "Customizable password length (4-128 characters)",
              "Multiple character type options",
              "Password strength analysis",
              "Privacy-focused local generation",
              "One-click copy functionality"
            ]
          })}
        </script>
      </Helmet>
      
      <Header />
      
      <main>
        {/* Hero Section */}
        <section className="relative py-12 sm:py-16 md:py-20 lg:py-24 xl:py-32 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-indigo-600/20"></div>
          <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="space-y-6 sm:space-y-8">
              <div className="inline-flex items-center px-3 sm:px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full border border-blue-200">
                <span className="text-xs sm:text-sm font-medium text-blue-700">Cryptographically Secure</span>
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-slate-900 leading-tight" data-testid="text-page-title">
                Password
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                  Generator
                </span>
              </h1>
              <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-slate-600 max-w-4xl mx-auto leading-relaxed px-2">
                Create strong, secure passwords with advanced customization options to protect your digital accounts
              </p>
            </div>
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
          {/* Main Generator Card */}
          <Card className="bg-white/90 backdrop-blur-sm shadow-2xl border-0 rounded-2xl sm:rounded-3xl overflow-hidden">
            <CardContent className="p-0">
              <div className="flex flex-col">
                {/* Generated Password Section */}
                <div className="p-4 sm:p-6 md:p-8 lg:p-10 xl:p-12 space-y-6 sm:space-y-8">
                  <div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">Password Generation</h2>
                    <p className="text-gray-600">Generate secure passwords with customizable options</p>
                  </div>
                  
                  <div className="space-y-4 sm:space-y-6">
                    {/* Generated Password Display */}
                    <div className="space-y-3">
                      <Label htmlFor="generated-password" className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                        Generated Password
                      </Label>
                      <div className="relative">
                        <Input
                          id="generated-password"
                          value={password}
                          readOnly
                          className="text-base sm:text-lg lg:text-xl font-bold pr-16 h-14 sm:h-16 text-center border-2 border-gray-200 rounded-xl focus:border-blue-500"
                          style={{ fontFamily: 'Monaco, Consolas, "Lucida Console", monospace' }}
                          data-testid="generated-password"
                        />
                        <Button
                          onClick={() => handleCopyToClipboard(password)}
                          variant="ghost"
                          size="sm"
                          className="absolute right-2 top-1/2 transform -translate-y-1/2 text-sm px-3 py-2 rounded-lg"
                          data-testid="button-copy-password"
                        >
                          Copy
                        </Button>
                      </div>

                      {/* Password Strength Indicator */}
                      {passwordStrength && (
                        <div className="bg-gray-50 rounded-xl p-4 sm:p-6">
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-sm font-semibold text-gray-800 uppercase tracking-wide">Password Strength</span>
                            <span className={`text-sm font-bold text-white px-3 py-1 rounded-full ${passwordStrength.color}`}>
                              {passwordStrength.label}
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-3 mb-3">
                            <div 
                              className={`h-3 rounded-full transition-all duration-300 ${passwordStrength.color}`}
                              style={{ width: `${(passwordStrength.score / 8) * 100}%` }}
                            ></div>
                          </div>
                          <p className="text-sm text-gray-600">{passwordStrength.description}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Password Length Setting */}
                  <div className="space-y-4 border-t pt-6 sm:pt-8">
                    <h3 className="text-lg sm:text-xl font-bold text-gray-900">Password Options</h3>
                    
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label className="text-sm font-semibold text-gray-800 uppercase tracking-wide">Password Length</Label>
                        <span className="text-xl font-bold text-blue-600">{options.length}</span>
                      </div>
                      <div className="px-2">
                        <Slider
                          value={[options.length]}
                          onValueChange={(value) => updateOption('length', value[0])}
                          max={128}
                          min={4}
                          step={1}
                          className="w-full"
                          data-testid="slider-password-length"
                        />
                        <div className="flex justify-between text-sm text-gray-500 mt-2">
                          <span>4</span>
                          <span>128</span>
                        </div>
                      </div>
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
                            Character Types & Customization
                          </span>
                          <span className={`transform transition-transform ${showAdvanced ? 'rotate-180' : ''}`}>▼</span>
                        </Button>
                      </CollapsibleTrigger>
                      <CollapsibleContent className="space-y-4 sm:space-y-6 mt-4">
                        <Separator />
                        
                        {/* Character Type Options */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                          <div className="space-y-4 bg-gray-50 rounded-xl p-4 sm:p-6">
                            <h4 className="text-sm sm:text-base font-semibold text-gray-900">Character Types</h4>
                            
                            <div className="flex items-center justify-between gap-2">
                              <div className="space-y-1 flex-1 min-w-0">
                                <Label className="text-xs sm:text-sm font-medium">Uppercase Letters (A-Z)</Label>
                                <p className="text-xs text-gray-500">Include capital letters</p>
                              </div>
                              <Switch
                                checked={options.includeUppercase}
                                onCheckedChange={(value) => updateOption('includeUppercase', value)}
                                data-testid="switch-uppercase"
                              />
                            </div>

                            <div className="flex items-center justify-between gap-2">
                              <div className="space-y-1 flex-1 min-w-0">
                                <Label className="text-xs sm:text-sm font-medium">Lowercase Letters (a-z)</Label>
                                <p className="text-xs text-gray-500">Include small letters</p>
                              </div>
                              <Switch
                                checked={options.includeLowercase}
                                onCheckedChange={(value) => updateOption('includeLowercase', value)}
                                data-testid="switch-lowercase"
                              />
                            </div>

                            <div className="flex items-center justify-between gap-2">
                              <div className="space-y-1 flex-1 min-w-0">
                                <Label className="text-xs sm:text-sm font-medium">Numbers (0-9)</Label>
                                <p className="text-xs text-gray-500">Include digits</p>
                              </div>
                              <Switch
                                checked={options.includeNumbers}
                                onCheckedChange={(value) => updateOption('includeNumbers', value)}
                                data-testid="switch-numbers"
                              />
                            </div>

                            <div className="flex items-center justify-between gap-2">
                              <div className="space-y-1 flex-1 min-w-0">
                                <Label className="text-xs sm:text-sm font-medium">Symbols (!@#$%^&*)</Label>
                                <p className="text-xs text-gray-500">Include special characters</p>
                              </div>
                              <Switch
                                checked={options.includeSymbols}
                                onCheckedChange={(value) => updateOption('includeSymbols', value)}
                                data-testid="switch-symbols"
                              />
                            </div>
                          </div>

                          {/* Advanced Customization */}
                          <div className="space-y-4 bg-gray-50 rounded-xl p-4 sm:p-6">
                            <h4 className="text-sm sm:text-base font-semibold text-gray-900">Advanced Settings</h4>
                            
                            <div className="flex items-center justify-between gap-2">
                              <div className="space-y-1 flex-1 min-w-0">
                                <Label className="text-xs sm:text-sm font-medium">Exclude Similar Characters</Label>
                                <p className="text-xs text-gray-500">Avoid 0, O, 1, l, I</p>
                              </div>
                              <Switch
                                checked={options.excludeSimilar}
                                onCheckedChange={(value) => updateOption('excludeSimilar', value)}
                                data-testid="switch-exclude-similar"
                              />
                            </div>

                            <div className="flex items-center justify-between gap-2">
                              <div className="space-y-1 flex-1 min-w-0">
                                <Label className="text-xs sm:text-sm font-medium">Exclude Ambiguous Characters</Label>
                                <p className="text-xs text-gray-500">Avoid {}[]()/'"`~,;.&lt;&gt;</p>
                              </div>
                              <Switch
                                checked={options.excludeAmbiguous}
                                onCheckedChange={(value) => updateOption('excludeAmbiguous', value)}
                                data-testid="switch-exclude-ambiguous"
                              />
                            </div>

                            <div className="space-y-2">
                              <Label className="text-xs sm:text-sm font-medium">Custom Characters</Label>
                              <Input
                                value={options.customCharacters}
                                onChange={(e) => updateOption('customCharacters', e.target.value)}
                                placeholder="Add your own characters"
                                className="text-sm h-10 sm:h-12 border-2 border-gray-200 rounded-lg"
                                data-testid="input-custom-characters"
                              />
                              <p className="text-xs text-gray-500">Additional characters to include</p>
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
                      onClick={handleGeneratePassword}
                      className="flex-1 h-12 sm:h-14 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold text-base sm:text-lg rounded-xl shadow-lg transform transition-all duration-200 hover:scale-105"
                      data-testid="button-generate-password"
                    >
                      Generate Password
                    </Button>
                    <Button
                      onClick={handleSampleGeneration}
                      variant="outline"
                      className="h-12 sm:h-14 px-6 sm:px-8 border-2 border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold text-base sm:text-lg rounded-xl"
                      data-testid="button-sample-generation"
                    >
                      Sample
                    </Button>
                    <Button
                      onClick={handleClear}
                      variant="outline"
                      className="h-12 sm:h-14 px-6 sm:px-8 border-2 border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold text-base sm:text-lg rounded-xl"
                      data-testid="button-clear"
                    >
                      Clear
                    </Button>
                    <Button
                      onClick={resetGenerator}
                      variant="outline"
                      className="h-12 sm:h-14 px-6 sm:px-8 border-2 border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold text-base sm:text-lg rounded-xl"
                      data-testid="button-reset"
                    >
                      Reset
                    </Button>
                  </div>
                </div>

                {/* Password History Section */}
                <div className="bg-gradient-to-br from-gray-50 to-blue-50 p-4 sm:p-6 md:p-8 lg:p-10 xl:p-12 border-t">
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6 sm:mb-8">Password History</h2>
                  
                  {passwordHistory.length > 0 ? (
                    <div className="space-y-3 sm:space-y-4" data-testid="password-history">
                      {passwordHistory.slice(0, 5).map((historyPassword, index) => {
                        const colorClasses = [
                          'bg-blue-50 border-blue-200',
                          'bg-green-50 border-green-200',
                          'bg-purple-50 border-purple-200',
                          'bg-orange-50 border-orange-200',
                          'bg-pink-50 border-pink-200'
                        ];
                        
                        return (
                          <div 
                            key={index} 
                            className={`border-2 rounded-xl p-3 sm:p-4 ${colorClasses[index % colorClasses.length]}`}
                          >
                            <div className="flex items-start justify-between mb-3 gap-3">
                              <div className="flex-1 min-w-0">
                                <h3 className="text-sm sm:text-base font-semibold text-gray-900">Password #{index + 1}</h3>
                                <p className="text-xs sm:text-sm text-gray-600">Generated recently</p>
                              </div>
                              <Button
                                onClick={() => handleCopyToClipboard(historyPassword)}
                                variant="outline"
                                size="sm"
                                className="text-xs px-2 sm:px-3 py-2 flex-shrink-0 rounded-lg min-w-[60px] sm:min-w-[70px] h-11 sm:h-9"
                                data-testid={`button-copy-history-${index}`}
                              >
                                Copy
                              </Button>
                            </div>
                            <div 
                              className="bg-white p-2 sm:p-3 rounded-lg border border-gray-200 text-xs sm:text-sm font-mono break-all min-h-[40px] sm:min-h-[44px] flex items-center"
                              data-testid={`password-history-${index}`}
                            >
                              {historyPassword || '(empty)'}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-12 sm:py-16" data-testid="no-history">
                      <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-200 rounded-full mx-auto mb-4 sm:mb-6 flex items-center justify-center">
                        <div className="text-2xl sm:text-3xl font-bold text-gray-400">🔐</div>
                      </div>
                      <p className="text-gray-500 text-base sm:text-lg px-4">Generate passwords to see history</p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* SEO Content Sections */}
          <div className="mt-16 space-y-8">
            {/* What is a Password Generator */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">What is a Random Password Generator?</h2>
                <div className="space-y-4 text-gray-600">
                  <p>
                    A <strong>random password generator</strong> is a cybersecurity tool that creates cryptographically secure, unpredictable passwords to protect your digital accounts from unauthorized access. Our advanced password generator uses your browser's built-in cryptographic functions to ensure maximum randomness and security, making it virtually impossible for attackers to predict or crack your passwords.
                  </p>
                  <p>
                    Unlike human-created passwords that often follow predictable patterns or contain personal information, our random password generator produces truly random character combinations using secure algorithms. This eliminates common vulnerabilities such as dictionary attacks, brute force attempts, and social engineering attacks that rely on predictable password patterns.
                  </p>
                  <p>
                    The tool supports extensive customization options including adjustable length (4-128 characters), multiple character sets (uppercase, lowercase, numbers, symbols), and advanced filtering options to exclude similar or ambiguous characters. This flexibility ensures your passwords meet the specific requirements of different websites and security policies.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Password Security Types */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
                <CardContent className="p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Password Security Levels</h2>
                  <div className="space-y-4">
                    <div className="bg-red-50 rounded-lg p-4">
                      <h3 className="font-semibold text-red-900 mb-2">Weak Passwords</h3>
                      <p className="text-red-800 text-sm mb-2">Short, simple passwords with limited character variety</p>
                      <p className="text-red-700 text-xs">Examples: "password123", "admin", "qwerty" - These can be cracked in seconds and should never be used.</p>
                    </div>
                    
                    <div className="bg-orange-50 rounded-lg p-4">
                      <h3 className="font-semibold text-orange-900 mb-2">Fair Passwords</h3>
                      <p className="text-orange-800 text-sm mb-2">8-10 characters with basic character mixing</p>
                      <p className="text-orange-700 text-xs">Acceptable for low-risk accounts but vulnerable to determined attackers with modern tools.</p>
                    </div>
                    
                    <div className="bg-blue-50 rounded-lg p-4">
                      <h3 className="font-semibold text-blue-900 mb-2">Strong Passwords</h3>
                      <p className="text-blue-800 text-sm mb-2">12+ characters with mixed case, numbers, and symbols</p>
                      <p className="text-blue-700 text-xs">Recommended for most accounts including email, social media, and work systems.</p>
                    </div>
                    
                    <div className="bg-green-50 rounded-lg p-4">
                      <h3 className="font-semibold text-green-900 mb-2">Very Strong Passwords</h3>
                      <p className="text-green-800 text-sm mb-2">16+ characters with maximum entropy and complexity</p>
                      <p className="text-green-700 text-xs">Essential for banking, cryptocurrency, and high-value accounts. Virtually uncrackable with current technology.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
                <CardContent className="p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Character Set Importance</h2>
                  <div className="space-y-4">
                    <div className="bg-purple-50 rounded-lg p-4">
                      <h3 className="font-semibold text-purple-900 mb-2">Uppercase Letters (A-Z)</h3>
                      <p className="text-purple-800 text-sm mb-2">26 possible characters per position</p>
                      <p className="text-purple-700 text-xs">Doubles the character space and significantly increases password strength against brute force attacks.</p>
                    </div>
                    
                    <div className="bg-indigo-50 rounded-lg p-4">
                      <h3 className="font-semibold text-indigo-900 mb-2">Lowercase Letters (a-z)</h3>
                      <p className="text-indigo-800 text-sm mb-2">26 possible characters per position</p>
                      <p className="text-indigo-700 text-xs">Foundation of most passwords, providing good entropy while maintaining readability.</p>
                    </div>
                    
                    <div className="bg-teal-50 rounded-lg p-4">
                      <h3 className="font-semibold text-teal-900 mb-2">Numbers (0-9)</h3>
                      <p className="text-teal-800 text-sm mb-2">10 possible characters per position</p>
                      <p className="text-teal-700 text-xs">Essential for meeting most password requirements and adding computational complexity.</p>
                    </div>
                    
                    <div className="bg-yellow-50 rounded-lg p-4">
                      <h3 className="font-semibold text-yellow-900 mb-2">Special Symbols (!@#$)</h3>
                      <p className="text-yellow-800 text-sm mb-2">30+ possible characters per position</p>
                      <p className="text-yellow-700 text-xs">Dramatically increases password strength and provides the highest entropy per character.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Industry Use Cases */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Professional Password Requirements by Industry</h2>
                <p className="text-gray-600 mb-8">Different industries have specific password requirements based on regulatory compliance and security standards. Our generator helps you meet these professional requirements.</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center mb-3">
                      <div className="w-8 h-8 bg-blue-500 rounded flex items-center justify-center mr-3">
                        <span className="text-white font-bold text-sm">🏦</span>
                      </div>
                      <h3 className="font-semibold text-gray-900">Banking & Finance</h3>
                    </div>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li><strong>Length:</strong> 12-20 characters</li>
                      <li><strong>Complexity:</strong> All character types</li>
                      <li><strong>Standards:</strong> PCI DSS, SOX compliance</li>
                      <li><strong>Rotation:</strong> Every 60-90 days</li>
                    </ul>
                  </div>

                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center mb-3">
                      <div className="w-8 h-8 bg-green-500 rounded flex items-center justify-center mr-3">
                        <span className="text-white font-bold text-sm">🏥</span>
                      </div>
                      <h3 className="font-semibold text-gray-900">Healthcare</h3>
                    </div>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li><strong>Length:</strong> 14+ characters</li>
                      <li><strong>Complexity:</strong> High entropy required</li>
                      <li><strong>Standards:</strong> HIPAA compliance</li>
                      <li><strong>Rotation:</strong> Every 90 days</li>
                    </ul>
                  </div>

                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center mb-3">
                      <div className="w-8 h-8 bg-purple-500 rounded flex items-center justify-center mr-3">
                        <span className="text-white font-bold text-sm">🏛️</span>
                      </div>
                      <h3 className="font-semibold text-gray-900">Government</h3>
                    </div>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li><strong>Length:</strong> 15+ characters</li>
                      <li><strong>Complexity:</strong> Maximum complexity</li>
                      <li><strong>Standards:</strong> NIST, FISMA</li>
                      <li><strong>Rotation:</strong> Every 60 days</li>
                    </ul>
                  </div>

                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center mb-3">
                      <div className="w-8 h-8 bg-orange-500 rounded flex items-center justify-center mr-3">
                        <span className="text-white font-bold text-sm">💻</span>
                      </div>
                      <h3 className="font-semibold text-gray-900">Technology</h3>
                    </div>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li><strong>Length:</strong> 16+ characters</li>
                      <li><strong>Complexity:</strong> All character sets</li>
                      <li><strong>Standards:</strong> ISO 27001</li>
                      <li><strong>Rotation:</strong> Every 90-120 days</li>
                    </ul>
                  </div>

                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center mb-3">
                      <div className="w-8 h-8 bg-red-500 rounded flex items-center justify-center mr-3">
                        <span className="text-white font-bold text-sm">🎓</span>
                      </div>
                      <h3 className="font-semibold text-gray-900">Education</h3>
                    </div>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li><strong>Length:</strong> 12+ characters</li>
                      <li><strong>Complexity:</strong> Mixed character types</li>
                      <li><strong>Standards:</strong> FERPA compliance</li>
                      <li><strong>Rotation:</strong> Every semester</li>
                    </ul>
                  </div>

                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center mb-3">
                      <div className="w-8 h-8 bg-indigo-500 rounded flex items-center justify-center mr-3">
                        <span className="text-white font-bold text-sm">⚖️</span>
                      </div>
                      <h3 className="font-semibold text-gray-900">Legal</h3>
                    </div>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li><strong>Length:</strong> 14+ characters</li>
                      <li><strong>Complexity:</strong> High security</li>
                      <li><strong>Standards:</strong> Client confidentiality</li>
                      <li><strong>Rotation:</strong> Every 90 days</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Common Password Mistakes */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Common Password Mistakes to Avoid</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">What NOT to Do</h3>
                    <div className="space-y-3">
                      <div className="bg-red-50 border-l-4 border-red-400 p-3 rounded-r-lg">
                        <h4 className="font-semibold text-red-900 text-sm">Using Personal Information</h4>
                        <p className="text-red-800 text-xs mt-1">Never use names, birthdates, addresses, or other personal details that can be found on social media.</p>
                      </div>
                      <div className="bg-red-50 border-l-4 border-red-400 p-3 rounded-r-lg">
                        <h4 className="font-semibold text-red-900 text-sm">Password Reuse</h4>
                        <p className="text-red-800 text-xs mt-1">Using the same password across multiple accounts creates a domino effect if one account is compromised.</p>
                      </div>
                      <div className="bg-red-50 border-l-4 border-red-400 p-3 rounded-r-lg">
                        <h4 className="font-semibold text-red-900 text-sm">Dictionary Words</h4>
                        <p className="text-red-800 text-xs mt-1">Common words, even with number substitutions (@ for a), are vulnerable to dictionary attacks.</p>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">Best Practices</h3>
                    <div className="space-y-3">
                      <div className="bg-green-50 border-l-4 border-green-400 p-3 rounded-r-lg">
                        <h4 className="font-semibold text-green-900 text-sm">Use Random Generation</h4>
                        <p className="text-green-800 text-xs mt-1">Let our cryptographically secure generator create truly random passwords for maximum security.</p>
                      </div>
                      <div className="bg-green-50 border-l-4 border-green-400 p-3 rounded-r-lg">
                        <h4 className="font-semibold text-green-900 text-sm">Enable Two-Factor Authentication</h4>
                        <p className="text-green-800 text-xs mt-1">Add an extra security layer with 2FA whenever possible, even with strong passwords.</p>
                      </div>
                      <div className="bg-green-50 border-l-4 border-green-400 p-3 rounded-r-lg">
                        <h4 className="font-semibold text-green-900 text-sm">Use a Password Manager</h4>
                        <p className="text-green-800 text-xs mt-1">Store generated passwords securely with a reputable password manager for convenience and security.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Frequently Asked Questions */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-8">Frequently Asked Questions</h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">How secure are randomly generated passwords?</h3>
                      <p className="text-gray-600 text-sm">Our passwords are generated using your browser's cryptographically secure random number generator (crypto.getRandomValues()), which provides true randomness equivalent to military-grade security standards. A 16-character password with all character types has over 6 quadrillion possible combinations.</p>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Are my generated passwords stored or transmitted?</h3>
                      <p className="text-gray-600 text-sm">No, absolutely not. All password generation happens locally in your browser using client-side JavaScript. No passwords are ever sent to our servers, stored in databases, or transmitted over the internet, ensuring complete privacy and security.</p>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">What password length should I use for different accounts?</h3>
                      <p className="text-gray-600 text-sm">For banking and high-value accounts, use 16-20 characters. For general accounts like social media, 12-14 characters is sufficient. For low-risk accounts, 10-12 characters provides good security. Longer passwords exponentially increase security.</p>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Should I exclude similar or ambiguous characters?</h3>
                      <p className="text-gray-600 text-sm">Enable these options if you frequently type passwords manually, as they prevent confusion between similar characters like 0/O or 1/l/I. This is especially helpful for mobile device entry or shared computer access.</p>
                    </div>
                  </div>
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Can I use this tool for business passwords?</h3>
                      <p className="text-gray-600 text-sm">Absolutely! Our generator meets enterprise security standards and is perfect for business accounts, corporate systems, and professional applications. Many IT departments recommend tools like ours for generating secure business passwords.</p>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">How often should I generate new passwords?</h3>
                      <p className="text-gray-600 text-sm">Generate new passwords immediately if an account is compromised, every 90 days for high-security accounts like banking, every 6 months for general accounts, and annually for low-risk accounts. Always use unique passwords for each account.</p>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">What about password managers and this tool?</h3>
                      <p className="text-gray-600 text-sm">Our generator works perfectly with password managers! Generate strong passwords here, then store them securely in your preferred password manager like 1Password, Bitwarden, or LastPass for easy access and autofill functionality.</p>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Is this password generator free to use?</h3>
                      <p className="text-gray-600 text-sm">Yes! Our password generator is completely free with no registration required, no usage limits, and access to all features including advanced customization options. Generate unlimited secure passwords anytime.</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Technical Security Information */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Technical Security Features</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-2xl">🛡️</span>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Cryptographically Secure</h3>
                    <p className="text-gray-600 text-sm">Uses Web Crypto API's secure random number generation for true entropy and unpredictability.</p>
                  </div>
                  
                  <div className="text-center">
                    <div className="w-16 h-16 bg-green-600 text-white rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-2xl">🔒</span>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Privacy Focused</h3>
                    <p className="text-gray-600 text-sm">Client-side generation ensures passwords never leave your device or get transmitted to servers.</p>
                  </div>
                  
                  <div className="text-center">
                    <div className="w-16 h-16 bg-purple-600 text-white rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-2xl">⚙️</span>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Highly Customizable</h3>
                    <p className="text-gray-600 text-sm">Extensive options for length, character sets, and filtering to meet any security requirement.</p>
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

export default PasswordGenerator;
