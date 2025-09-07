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
    <div className="min-h-screen bg-gray-50">
      <Helmet>
        <title>Random Password Generator - Create Secure Passwords | DapsiWow</title>
        <meta name="description" content="Generate secure, random passwords with customizable options. Choose length, character types, and security settings to create strong passwords for your accounts." />
        <meta name="keywords" content="password generator, random password, secure password, strong password, password creator, password maker, cybersecurity" />
        <meta property="og:title" content="Random Password Generator - Create Secure Passwords" />
        <meta property="og:description" content="Generate secure, customizable passwords with advanced options for maximum security." />
        <meta property="og:type" content="website" />
        <link rel="canonical" href="/tools/password-generator" />
      </Helmet>
      
      <Header />
      
      <main>
        {/* Hero Section */}
        <section className="gradient-hero text-white py-16 pt-24">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="w-20 h-20 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <i className="fas fa-key text-3xl"></i>
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold mb-6" data-testid="text-page-title">
              Random Password Generator
            </h1>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto">
              Create strong, secure passwords with customizable options to protect your accounts and data
            </p>
          </div>
        </section>

        {/* Generator Section */}
        <section className="py-16">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <Card className="bg-white shadow-sm border-0">
              <CardContent className="p-8">
                <div className="space-y-8">
                  {/* Generated Password Display */}
                  <div>
                    <h2 className="text-2xl font-semibold text-gray-900 mb-6">Generated Password</h2>
                    
                    <div className="space-y-4">
                      <div className="flex gap-4">
                        <div className="flex-1 relative">
                          <Input
                            value={password}
                            readOnly
                            className="text-2xl font-bold pr-12 h-14"
                            style={{ fontFamily: 'Monaco, Consolas, "Lucida Console", monospace' }}
                            data-testid="generated-password"
                          />
                          <Button
                            onClick={() => handleCopyToClipboard(password)}
                            variant="ghost"
                            size="sm"
                            className="absolute right-2 top-1/2 transform -translate-y-1/2"
                            data-testid="button-copy-password"
                          >
                            <i className="fas fa-copy"></i>
                          </Button>
                        </div>
                        <Button 
                          onClick={handleGeneratePassword}
                          className="h-14 px-6"
                          data-testid="button-generate-password"
                        >
                          <i className="fas fa-refresh mr-2"></i>
                          Generate
                        </Button>
                      </div>

                      {/* Password Strength Indicator */}
                      {passwordStrength && (
                        <div className="bg-gray-50 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-gray-700">Password Strength</span>
                            <span className={`text-sm font-bold text-white px-3 py-1 rounded-full ${passwordStrength.color}`}>
                              {passwordStrength.label}
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                            <div 
                              className={`h-2 rounded-full transition-all duration-300 ${passwordStrength.color}`}
                              style={{ width: `${(passwordStrength.score / 8) * 100}%` }}
                            ></div>
                          </div>
                          <p className="text-sm text-gray-600">{passwordStrength.description}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <Separator />

                  {/* Password Options */}
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-6">Password Options</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      {/* Length Setting */}
                      <div className="md:col-span-2 space-y-4">
                        <div className="flex items-center justify-between">
                          <Label className="text-base font-medium">Password Length</Label>
                          <span className="text-lg font-bold text-blue-600">{options.length}</span>
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
                          <div className="flex justify-between text-sm text-gray-500 mt-1">
                            <span>4</span>
                            <span>128</span>
                          </div>
                        </div>
                      </div>

                      {/* Character Type Options */}
                      <div className="space-y-4">
                        <h4 className="font-medium text-gray-900">Character Types</h4>
                        
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <Label className="text-sm font-medium">Uppercase Letters (A-Z)</Label>
                              <p className="text-xs text-gray-500">Include capital letters</p>
                            </div>
                            <Switch
                              checked={options.includeUppercase}
                              onCheckedChange={(value) => updateOption('includeUppercase', value)}
                              data-testid="switch-uppercase"
                            />
                          </div>

                          <div className="flex items-center justify-between">
                            <div>
                              <Label className="text-sm font-medium">Lowercase Letters (a-z)</Label>
                              <p className="text-xs text-gray-500">Include small letters</p>
                            </div>
                            <Switch
                              checked={options.includeLowercase}
                              onCheckedChange={(value) => updateOption('includeLowercase', value)}
                              data-testid="switch-lowercase"
                            />
                          </div>

                          <div className="flex items-center justify-between">
                            <div>
                              <Label className="text-sm font-medium">Numbers (0-9)</Label>
                              <p className="text-xs text-gray-500">Include digits</p>
                            </div>
                            <Switch
                              checked={options.includeNumbers}
                              onCheckedChange={(value) => updateOption('includeNumbers', value)}
                              data-testid="switch-numbers"
                            />
                          </div>

                          <div className="flex items-center justify-between">
                            <div>
                              <Label className="text-sm font-medium">Symbols (!@#$%^&*)</Label>
                              <p className="text-xs text-gray-500">Include special characters</p>
                            </div>
                            <Switch
                              checked={options.includeSymbols}
                              onCheckedChange={(value) => updateOption('includeSymbols', value)}
                              data-testid="switch-symbols"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Advanced Options */}
                      <div className="space-y-4">
                        <h4 className="font-medium text-gray-900">Advanced Options</h4>
                        
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <Label className="text-sm font-medium">Exclude Similar Characters</Label>
                              <p className="text-xs text-gray-500">Avoid 0, O, 1, l, I</p>
                            </div>
                            <Switch
                              checked={options.excludeSimilar}
                              onCheckedChange={(value) => updateOption('excludeSimilar', value)}
                              data-testid="switch-exclude-similar"
                            />
                          </div>

                          <div className="flex items-center justify-between">
                            <div>
                              <Label className="text-sm font-medium">Exclude Ambiguous Characters</Label>
                              <p className="text-xs text-gray-500">Avoid {}[]()/'"`~,;.&lt;&gt;</p>
                            </div>
                            <Switch
                              checked={options.excludeAmbiguous}
                              onCheckedChange={(value) => updateOption('excludeAmbiguous', value)}
                              data-testid="switch-exclude-ambiguous"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label className="text-sm font-medium">Custom Characters</Label>
                            <Input
                              value={options.customCharacters}
                              onChange={(e) => updateOption('customCharacters', e.target.value)}
                              placeholder="Add your own characters"
                              className="text-sm"
                              data-testid="input-custom-characters"
                            />
                            <p className="text-xs text-gray-500">Additional characters to include</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Password History */}
                  {passwordHistory.length > 0 && (
                    <>
                      <Separator />
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-4">Recently Generated</h3>
                        <div className="space-y-2">
                          {passwordHistory.slice(0, 5).map((historyPassword, index) => (
                            <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                              <div className="flex-1 font-mono text-sm text-gray-700 break-all">
                                {historyPassword}
                              </div>
                              <Button
                                onClick={() => handleCopyToClipboard(historyPassword)}
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
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Information Sections */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
          {/* What is a Password Generator */}
          <div className="mt-12 bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">What is a Password Generator?</h2>
            <div className="prose max-w-none">
              <p className="text-lg text-gray-700 mb-6">
                A <strong>password generator</strong> is a security tool that creates random, complex passwords to protect your digital accounts. Our advanced password generator uses cryptographically secure random number generation to ensure maximum security and unpredictability.
              </p>
              
              <p className="text-gray-700 mb-6">
                Strong passwords are your first line of defense against cyber threats. By using randomly generated passwords that include a mix of uppercase letters, lowercase letters, numbers, and symbols, you can significantly reduce the risk of unauthorized access to your accounts.
              </p>
            </div>
          </div>

          {/* Password Security Tips */}
          <div className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Password Security Best Practices</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <h3 className="font-semibold text-gray-900 mb-2">Use Long Passwords</h3>
                  <p className="text-gray-600 text-sm">Passwords should be at least 12 characters long. Longer passwords are exponentially harder to crack.</p>
                </div>
                
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <h3 className="font-semibold text-gray-900 mb-2">Include All Character Types</h3>
                  <p className="text-gray-600 text-sm">Mix uppercase, lowercase, numbers, and symbols for maximum security.</p>
                </div>
                
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <h3 className="font-semibold text-gray-900 mb-2">Avoid Personal Information</h3>
                  <p className="text-gray-600 text-sm">Never use names, birthdates, or other personal details that can be easily guessed.</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <h3 className="font-semibold text-gray-900 mb-2">Unique Passwords for Each Account</h3>
                  <p className="text-gray-600 text-sm">Never reuse passwords across multiple accounts. If one is compromised, others remain safe.</p>
                </div>
                
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <h3 className="font-semibold text-gray-900 mb-2">Use a Password Manager</h3>
                  <p className="text-gray-600 text-sm">Store your generated passwords securely with a reputable password manager.</p>
                </div>
                
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <h3 className="font-semibold text-gray-900 mb-2">Enable Two-Factor Authentication</h3>
                  <p className="text-gray-600 text-sm">Add an extra layer of security with 2FA whenever possible.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Key Features */}
          <div className="mt-8 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Key Features</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-green-600 text-white rounded-full flex items-center justify-center mx-auto mb-4">
                  <i className="fas fa-shield-alt text-2xl"></i>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Cryptographically Secure</h3>
                <p className="text-gray-600">Uses your browser's secure random number generator for true randomness.</p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-green-600 text-white rounded-full flex items-center justify-center mx-auto mb-4">
                  <i className="fas fa-sliders-h text-2xl"></i>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Fully Customizable</h3>
                <p className="text-gray-600">Control length, character types, and advanced options for your specific needs.</p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-green-600 text-white rounded-full flex items-center justify-center mx-auto mb-4">
                  <i className="fas fa-user-shield text-2xl"></i>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Privacy Focused</h3>
                <p className="text-gray-600">Passwords are generated locally in your browser and never sent to our servers.</p>
              </div>
            </div>
          </div>

          {/* FAQ */}
          <div className="mt-8 bg-gradient-to-r from-gray-50 to-blue-50 rounded-2xl p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Frequently Asked Questions</h2>
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">How secure are the generated passwords?</h3>
                <p className="text-gray-600">Our passwords are generated using your browser's cryptographically secure random number generator (crypto.getRandomValues()), which is the same technology used by security professionals and password managers.</p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Are my generated passwords stored anywhere?</h3>
                <p className="text-gray-600">No, all passwords are generated locally in your browser and are never sent to our servers. Your generated passwords are completely private to you.</p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">What password length should I use?</h3>
                <p className="text-gray-600">We recommend at least 16 characters for high-security accounts like banking and email. For general accounts, 12-14 characters with mixed character types provide good security.</p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Should I exclude similar or ambiguous characters?</h3>
                <p className="text-gray-600">Enable these options if you need to type passwords manually often, as they prevent confusion between similar-looking characters like 0 and O, or 1 and l.</p>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default PasswordGenerator;