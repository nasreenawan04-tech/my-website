import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';

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

export default function PasswordGenerator() {
  const [password, setPassword] = useState('');
  const [passwordHistory, setPasswordHistory] = useState<string[]>([]);
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

    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const numbers = '0123456789';
    const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';
    const similarChars = '0O1lI';
    const ambiguousChars = '{}[]()/\\\'"`~,;.<>';

    if (opts.includeUppercase) charset += uppercase;
    if (opts.includeLowercase) charset += lowercase;
    if (opts.includeNumbers) charset += numbers;
    if (opts.includeSymbols) charset += symbols;

    if (opts.customCharacters) {
      charset += opts.customCharacters;
    }

    if (opts.excludeSimilar) {
      charset = charset.split('').filter(char => !similarChars.includes(char)).join('');
    }
    if (opts.excludeAmbiguous) {
      charset = charset.split('').filter(char => !ambiguousChars.includes(char)).join('');
    }

    if (charset.length === 0) {
      return 'Error: No character set selected';
    }

    let generatedPassword = '';
    const array = new Uint8Array(opts.length);
    crypto.getRandomValues(array);

    for (let i = 0; i < opts.length; i++) {
      generatedPassword += charset[array[i] % charset.length];
    }

    let needsFixing = false;
    if (opts.includeUppercase && !/[A-Z]/.test(generatedPassword)) needsFixing = true;
    if (opts.includeLowercase && !/[a-z]/.test(generatedPassword)) needsFixing = true;
    if (opts.includeNumbers && !/[0-9]/.test(generatedPassword)) needsFixing = true;
    if (opts.includeSymbols && !/[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/.test(generatedPassword)) needsFixing = true;

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

    if (pwd.length >= 12) score += 2;
    else if (pwd.length >= 8) score += 1;
    else feedback.push('Use at least 8 characters');

    if (/[a-z]/.test(pwd)) score += 1;
    else feedback.push('Add lowercase letters');

    if (/[A-Z]/.test(pwd)) score += 1;
    else feedback.push('Add uppercase letters');

    if (/[0-9]/.test(pwd)) score += 1;
    else feedback.push('Add numbers');

    if (/[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/.test(pwd)) score += 2;
    else feedback.push('Add symbols');

    if (pwd.length >= 16) score += 1;
    if (pwd.length >= 20) score += 1;

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
    setPasswordStrength(null);
  };

  useEffect(() => {
    if (password && !password.startsWith('Error:')) {
      setPasswordStrength(calculatePasswordStrength(password));
    } else {
      setPasswordStrength(null);
    }
  }, [password]);

  useEffect(() => {
    handleGeneratePassword();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Helmet>
        <title>Random Password Generator - Create Secure Passwords Online | DapsiWow</title>
        <meta name="description" content="Generate cryptographically secure passwords with our free online password generator. Customize length, character types, and advanced security settings to protect your accounts." />
        <meta name="keywords" content="password generator, random password, secure password, strong password, password creator, password maker, cybersecurity, online security, cryptographic password generator, password strength checker" />
        <meta property="og:title" content="Random Password Generator - Create Secure Passwords Online | DapsiWow" />
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
        <section className="relative py-20 sm:py-28 lg:py-32 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-indigo-600/20"></div>
          <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="space-y-8">
              <div className="inline-flex items-center px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full border border-blue-200">
                <span className="text-sm font-medium text-blue-700">Cryptographically Secure Generator</span>
              </div>
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-slate-900 leading-tight">
                Random Password
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                  Generator
                </span>
              </h1>
              <p className="text-xl sm:text-2xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
                Create cryptographically secure passwords with advanced customization options to protect your digital accounts
              </p>
            </div>
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-4 py-16">
          {/* Main Generator Card */}
          <Card className="bg-white/90 backdrop-blur-sm shadow-2xl border-0 rounded-3xl overflow-hidden">
            <CardContent className="p-0">
              {/* Updated grid to accommodate 1.7:1.3 proportion */}
              <div className="grid grid-cols-1 lg:grid-cols-[1.7fr_1.3fr] gap-0"></div>
                {/* Input Section */}
                <div className="lg:col-span-1 p-8 lg:p-12 space-y-8">
                  <div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">Password Configuration</h2>
                    <p className="text-gray-600">Customize your password settings for maximum security</p>
                  </div>

                  {/* Password Length */}
                  <div className="space-y-6">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label className="text-sm font-semibold text-gray-800 uppercase tracking-wide">Password Length</Label>
                        <span className="text-2xl font-bold text-blue-600">{options.length}</span>
                      </div>
                      <div className="px-2">
                        <Slider
                          value={[options.length]}
                          onValueChange={(value) => updateOption('length', value[0])}
                          max={128}
                          min={4}
                          step={1}
                          className="w-full"
                        />
                        <div className="flex justify-between text-sm text-gray-500 mt-2">
                          <span>4</span>
                          <span>128</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Character Types */}
                  <div className="space-y-6 border-t pt-8">
                    <h3 className="text-xl font-bold text-gray-900">Character Types</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4 bg-gray-50 rounded-xl p-6">
                        <div className="flex items-center justify-between">
                          <div className="space-y-1">
                            <Label className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                              Uppercase Letters (A-Z)
                            </Label>
                            <p className="text-xs text-gray-500">Include capital letters</p>
                          </div>
                          <Switch
                            checked={options.includeUppercase}
                            onCheckedChange={(value) => updateOption('includeUppercase', value)}
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="space-y-1">
                            <Label className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                              Lowercase Letters (a-z)
                            </Label>
                            <p className="text-xs text-gray-500">Include small letters</p>
                          </div>
                          <Switch
                            checked={options.includeLowercase}
                            onCheckedChange={(value) => updateOption('includeLowercase', value)}
                          />
                        </div>
                      </div>

                      <div className="space-y-4 bg-gray-50 rounded-xl p-6">
                        <div className="flex items-center justify-between">
                          <div className="space-y-1">
                            <Label className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                              Numbers (0-9)
                            </Label>
                            <p className="text-xs text-gray-500">Include digits</p>
                          </div>
                          <Switch
                            checked={options.includeNumbers}
                            onCheckedChange={(value) => updateOption('includeNumbers', value)}
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="space-y-1">
                            <Label className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                              Symbols (!@#$%^&*)
                            </Label>
                            <p className="text-xs text-gray-500">Include special characters</p>
                          </div>
                          <Switch
                            checked={options.includeSymbols}
                            onCheckedChange={(value) => updateOption('includeSymbols', value)}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Advanced Options */}
                  <div className="space-y-6 border-t pt-8">
                    <h3 className="text-xl font-bold text-gray-900">Advanced Options</h3>

                    <div className="space-y-4 bg-gray-50 rounded-xl p-6">
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <Label className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                            Exclude Similar Characters
                          </Label>
                          <p className="text-xs text-gray-500">Avoid 0, O, 1, l, I for better readability</p>
                        </div>
                        <Switch
                          checked={options.excludeSimilar}
                          onCheckedChange={(value) => updateOption('excludeSimilar', value)}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <Label className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                            Exclude Ambiguous Characters
                          </Label>
                          <p className="text-xs text-gray-500">Avoid {}[]()/'"`~,;.&lt;&gt; for clarity</p>
                        </div>
                        <Switch
                          checked={options.excludeAmbiguous}
                          onCheckedChange={(value) => updateOption('excludeAmbiguous', value)}
                        />
                      </div>

                      <div className="space-y-3">
                        <Label className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                          Custom Characters
                        </Label>
                        <Input
                          value={options.customCharacters}
                          onChange={(e) => updateOption('customCharacters', e.target.value)}
                          placeholder="Add your own characters"
                          className="h-12 border-2 border-gray-200 rounded-xl"
                        />
                        <p className="text-xs text-gray-500">Additional characters to include in generation</p>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-4 pt-6">
                    <Button
                      onClick={handleGeneratePassword}
                      className="flex-1 h-14 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold text-lg rounded-xl shadow-lg transform transition-all duration-200 hover:scale-105"
                    >
                      Generate Password
                    </Button>
                    <Button
                      onClick={resetGenerator}
                      variant="outline"
                      className="h-14 px-8 border-2 border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold text-lg rounded-xl"
                    >
                      Reset
                    </Button>
                  </div>
                </div>

                {/* Results Section */}
                <div className="bg-gradient-to-br from-gray-50 to-blue-50 p-8 lg:p-12">
                  <h2 className="text-2xl font-bold text-gray-900 mb-8">Generated Password</h2>

                  {password ? (
                    <div className="space-y-6">
                      {/* Generated Password Display */}
                      <div className="bg-white rounded-2xl p-6 shadow-lg border border-blue-100">
                        <div className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-2">Your Password</div>
                        <div className="relative">
                          <div
                            className="text-lg font-mono bg-gray-50 p-4 rounded-xl border-2 border-gray-200 break-all cursor-pointer hover:bg-gray-100 transition-colors"
                            onClick={() => handleCopyToClipboard(password)}
                          >
                            {password}
                          </div>
                          <Button
                            onClick={() => handleCopyToClipboard(password)}
                            variant="outline"
                            size="sm"
                            className="absolute top-2 right-2 text-sm px-3 py-2 rounded-lg"
                          >
                            Copy
                          </Button>
                        </div>
                      </div>

                      {/* Password Strength */}
                      {passwordStrength && (
                        <div className="bg-white rounded-xl p-6 shadow-sm">
                          <div className="flex justify-between items-center mb-3">
                            <span className="font-medium text-gray-700">Password Strength</span>
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

                      {/* Password History */}
                      {passwordHistory.length > 0 && (
                        <div className="space-y-4">
                          <h3 className="font-bold text-gray-900 text-lg">Recent Passwords</h3>
                          {passwordHistory.slice(0, 3).map((historyPassword, index) => (
                            <div key={index} className="bg-white rounded-xl p-4 shadow-sm">
                              <div className="flex justify-between items-center">
                                <span className="font-medium text-gray-700 text-sm">Password #{index + 1}</span>
                                <Button
                                  onClick={() => handleCopyToClipboard(historyPassword)}
                                  variant="outline"
                                  size="sm"
                                  className="text-xs px-3 py-1 rounded-lg"
                                >
                                  Copy
                                </Button>
                              </div>
                              <div className="font-mono text-sm text-gray-600 mt-2 truncate">
                                {historyPassword}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-16">
                      <div className="w-20 h-20 bg-gray-200 rounded-full mx-auto mb-6 flex items-center justify-center">
                        <div className="text-3xl font-bold text-gray-400">🔐</div>
                      </div>
                      <p className="text-gray-500 text-lg">Generate your first secure password</p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* SEO Content Sections */}
          <div className="mt-16 grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">What is a Random Password Generator?</h3>
                <div className="space-y-4 text-gray-600">
                  <p>
                    A <strong>random password generator</strong> is a cybersecurity tool that creates cryptographically secure,
                    unpredictable passwords to protect your digital accounts from unauthorized access. Unlike human-created
                    passwords that often follow predictable patterns, our generator produces truly random character combinations
                    using secure algorithms.
                  </p>
                  <p>
                    Our password generator uses your browser's built-in cryptographic functions (Web Crypto API) to ensure
                    maximum randomness and security. This eliminates common vulnerabilities such as dictionary attacks,
                    brute force attempts, and social engineering attacks that rely on predictable password patterns.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Why Use Strong Passwords?</h3>
                <div className="space-y-4 text-gray-600">
                  <p>
                    Strong passwords are your first line of defense against cyber threats. With cybercriminals using
                    sophisticated tools capable of attempting billions of password combinations per second, weak passwords
                    can be cracked in minutes or even seconds.
                  </p>
                  <p>
                    A strong password generated by our tool typically contains 12-16+ characters with a mix of uppercase
                    and lowercase letters, numbers, and special symbols. This creates trillions of possible combinations,
                    making it virtually impossible for attackers to crack using current technology.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Password Security Guide */}
          <div className="mt-12 space-y-8">
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Password Strength Guidelines</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                    <h4 className="font-semibold text-red-900 mb-2">Weak (1-4 characters)</h4>
                    <p className="text-red-800 text-sm mb-2">Extremely vulnerable</p>
                    <p className="text-red-700 text-xs">Can be cracked instantly. Never use passwords this short.</p>
                  </div>

                  <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
                    <h4 className="font-semibold text-orange-900 mb-2">Fair (5-8 characters)</h4>
                    <p className="text-orange-800 text-sm mb-2">Basic security</p>
                    <p className="text-orange-700 text-xs">Acceptable for low-risk accounts but vulnerable to modern attacks.</p>
                  </div>

                  <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                    <h4 className="font-semibold text-blue-900 mb-2">Strong (9-15 characters)</h4>
                    <p className="text-blue-800 text-sm mb-2">Good protection</p>
                    <p className="text-blue-700 text-xs">Recommended for most accounts with mixed character types.</p>
                  </div>

                  <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                    <h4 className="font-semibold text-green-900 mb-2">Very Strong (16+ characters)</h4>
                    <p className="text-green-800 text-sm mb-2">Maximum security</p>
                    <p className="text-green-700 text-xs">Essential for banking and high-value accounts.</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Character Set Analysis */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Understanding Character Sets</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-gray-800">Character Type Impact</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <span className="font-medium">Lowercase only (a-z)</span>
                        <span className="text-sm text-gray-600">26 possibilities</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <span className="font-medium">+ Uppercase (A-Z)</span>
                        <span className="text-sm text-gray-600">52 possibilities</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <span className="font-medium">+ Numbers (0-9)</span>
                        <span className="text-sm text-gray-600">62 possibilities</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg border border-green-200">
                        <span className="font-medium">+ Symbols (!@#$)</span>
                        <span className="text-sm text-green-600">94+ possibilities</span>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-gray-800">Password Entropy</h4>
                    <p className="text-gray-600 text-sm mb-4">
                      Password entropy measures randomness. Higher entropy means stronger passwords.
                    </p>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">8-char, lowercase:</span>
                        <span className="text-sm font-mono">37 bits</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">8-char, mixed:</span>
                        <span className="text-sm font-mono">52 bits</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">12-char, mixed:</span>
                        <span className="text-sm font-mono">78 bits</span>
                      </div>
                      <div className="flex justify-between text-green-700">
                        <span className="text-sm">16-char, all types:</span>
                        <span className="text-sm font-mono">104 bits</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Industry Best Practices */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Industry Password Requirements</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="border border-blue-200 rounded-lg p-6 bg-blue-50">
                    <h4 className="font-semibold text-blue-900 mb-3">Banking & Finance</h4>
                    <ul className="text-sm text-blue-800 space-y-2">
                      <li>• 12-20 characters minimum</li>
                      <li>• All character types required</li>
                      <li>• No dictionary words</li>
                      <li>• 90-day rotation policy</li>
                      <li>• Multi-factor authentication</li>
                    </ul>
                  </div>

                  <div className="border border-green-200 rounded-lg p-6 bg-green-50">
                    <h4 className="font-semibold text-green-900 mb-3">Healthcare (HIPAA)</h4>
                    <ul className="text-sm text-green-800 space-y-2">
                      <li>• 14+ characters required</li>
                      <li>• Complex character mixing</li>
                      <li>• Regular security training</li>
                      <li>• Account lockout policies</li>
                      <li>• Audit trail requirements</li>
                    </ul>
                  </div>

                  <div className="border border-purple-200 rounded-lg p-6 bg-purple-50">
                    <h4 className="font-semibold text-purple-900 mb-3">Government (NIST)</h4>
                    <ul className="text-sm text-purple-800 space-y-2">
                      <li>• 15+ characters minimum</li>
                      <li>• Maximum entropy required</li>
                      <li>• No common patterns</li>
                      <li>• Breach monitoring</li>
                      <li>• Zero-trust architecture</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Password Security Tips */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
                <CardContent className="p-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">Common Password Mistakes</h3>
                  <div className="space-y-4">
                    <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-r-lg">
                      <h4 className="font-semibold text-red-900 text-sm">Using Personal Information</h4>
                      <p className="text-red-800 text-xs mt-1">Names, birthdates, addresses can be found on social media</p>
                    </div>
                    <div className="bg-orange-50 border-l-4 border-orange-400 p-4 rounded-r-lg">
                      <h4 className="font-semibold text-orange-900 text-sm">Password Reuse</h4>
                      <p className="text-orange-800 text-xs mt-1">One breach compromises all your accounts</p>
                    </div>
                    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-lg">
                      <h4 className="font-semibold text-yellow-900 text-sm">Predictable Patterns</h4>
                      <p className="text-yellow-800 text-xs mt-1">Sequential numbers or keyboard patterns are easily guessed</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
                <CardContent className="p-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">Password Management Tips</h3>
                  <div className="space-y-4">
                    <div className="bg-green-50 border-l-4 border-green-400 p-4 rounded-r-lg">
                      <h4 className="font-semibold text-green-900 text-sm">Use a Password Manager</h4>
                      <p className="text-green-800 text-xs mt-1">Store unique passwords securely with encryption</p>
                    </div>
                    <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-lg">
                      <h4 className="font-semibold text-blue-900 text-sm">Enable Two-Factor Authentication</h4>
                      <p className="text-blue-800 text-xs mt-1">Add extra security layer even with strong passwords</p>
                    </div>
                    <div className="bg-purple-50 border-l-4 border-purple-400 p-4 rounded-r-lg">
                      <h4 className="font-semibold text-purple-900 text-sm">Regular Security Audits</h4>
                      <p className="text-purple-800 text-xs mt-1">Check for breaches and update compromised passwords</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* FAQ Section */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-8">Frequently Asked Questions</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-2">How secure are randomly generated passwords?</h4>
                      <p className="text-gray-600 text-sm">Our passwords use cryptographically secure random number generation, providing true randomness equivalent to military-grade security standards. A 16-character password with all character types has over 6 quadrillion possible combinations.</p>
                    </div>

                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-2">Are my generated passwords stored anywhere?</h4>
                      <p className="text-gray-600 text-sm">No, absolutely not. All password generation happens locally in your browser using client-side JavaScript. No passwords are ever sent to our servers, stored in databases, or transmitted over the internet.</p>
                    </div>

                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-2">What password length should I use?</h4>
                      <p className="text-gray-600 text-sm">For banking and high-value accounts, use 16-20 characters. For general accounts, 12-14 characters is sufficient. For low-risk accounts, 10-12 characters provides good security.</p>
                    </div>
                  </div>
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-2">Can I use this for business passwords?</h4>
                      <p className="text-gray-600 text-sm">Absolutely! Our generator meets enterprise security standards and is perfect for business accounts, corporate systems, and professional applications requiring strong authentication.</p>
                    </div>

                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-2">Should I exclude similar characters?</h4>
                      <p className="text-gray-600 text-sm">Enable this option if you frequently type passwords manually, as it prevents confusion between similar characters like 0/O or 1/l/I. This is especially helpful for mobile device entry.</p>
                    </div>

                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-2">How often should I generate new passwords?</h4>
                      <p className="text-gray-600 text-sm">Generate new passwords immediately if an account is compromised, every 90 days for high-security accounts, every 6 months for general accounts, and annually for low-risk accounts.</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Technical Security Features */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Technical Security Features</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-2xl">🛡️</span>
                    </div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">Cryptographically Secure</h4>
                    <p className="text-gray-600 text-sm">Uses Web Crypto API's secure random number generation for true entropy and unpredictability that meets industry standards.</p>
                  </div>

                  <div className="text-center">
                    <div className="w-16 h-16 bg-green-600 text-white rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-2xl">🔒</span>
                    </div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">Privacy Focused</h4>
                    <p className="text-gray-600 text-sm">Client-side generation ensures passwords never leave your device. No server communication or data storage involved.</p>
                  </div>

                  <div className="text-center">
                    <div className="w-16 h-16 bg-purple-600 text-white rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-2xl">⚙️</span>
                    </div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">Highly Customizable</h4>
                    <p className="text-gray-600 text-sm">Extensive options for length, character sets, and filtering to meet any security requirement or compliance standard.</p>
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