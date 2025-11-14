import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Separator } from '@/components/ui/separator';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { Copy, Eye, EyeOff, RefreshCw, Trash2, Download, CheckCircle, FileDown } from 'lucide-react';
import { ToolSEOHead } from '@/components/seo/ToolSEOHead';
import { passwordGeneratorSEO } from '@/config/seo/tools/password-generator';

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

interface PasswordEntropy {
  entropy: number;
  charsetSize: number;
  crackTime: string;
}

export default function PasswordGenerator() {
  const { toast } = useToast();
  const [password, setPassword] = useState('');
  const [passwordHistory, setPasswordHistory] = useState<string[]>([]);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showPassword, setShowPassword] = useState(true);
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
  const [passwordEntropy, setPasswordEntropy] = useState<PasswordEntropy | null>(null);

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

  const calculateEntropy = (pwd: string, opts: PasswordOptions): PasswordEntropy => {
    let charsetSize = 0;
    if (opts.includeUppercase) charsetSize += 26;
    if (opts.includeLowercase) charsetSize += 26;
    if (opts.includeNumbers) charsetSize += 10;
    if (opts.includeSymbols) charsetSize += 25;
    if (opts.customCharacters) charsetSize += opts.customCharacters.length;

    const entropy = pwd.length * Math.log2(charsetSize);
    
    const guessesPerSecond = 1_000_000_000; // 1 billion guesses per second
    const totalCombinations = Math.pow(charsetSize, pwd.length);
    const secondsToCrack = totalCombinations / (2 * guessesPerSecond); // divide by 2 for average case

    let crackTime = '';
    if (secondsToCrack < 1) crackTime = 'Instant';
    else if (secondsToCrack < 60) crackTime = `${Math.round(secondsToCrack)} seconds`;
    else if (secondsToCrack < 3600) crackTime = `${Math.round(secondsToCrack / 60)} minutes`;
    else if (secondsToCrack < 86400) crackTime = `${Math.round(secondsToCrack / 3600)} hours`;
    else if (secondsToCrack < 31536000) crackTime = `${Math.round(secondsToCrack / 86400)} days`;
    else if (secondsToCrack < 31536000000) crackTime = `${Math.round(secondsToCrack / 31536000)} years`;
    else if (secondsToCrack < 31536000000000) crackTime = `${Math.round(secondsToCrack / 31536000000)} thousand years`;
    else if (secondsToCrack < 31536000000000000) crackTime = `${Math.round(secondsToCrack / 31536000000000)} million years`;
    else crackTime = 'Billions of years';

    return { entropy: Math.round(entropy), charsetSize, crackTime };
  };

  const updateOption = (key: keyof PasswordOptions, value: boolean | number | string) => {
    setOptions(prev => ({ ...prev, [key]: value }));
  };

  const handleCopyToClipboard = (textToCopy: string) => {
    navigator.clipboard.writeText(textToCopy);
    toast({
      title: "✓ Copied to clipboard!",
      description: "Password has been copied successfully.",
      duration: 2000,
    });
  };

  const clearHistory = () => {
    setPasswordHistory([]);
    toast({
      title: "✓ History cleared",
      description: "All password history has been removed.",
      duration: 2000,
    });
  };

  const downloadPassword = () => {
    const blob = new Blob([password], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `password-${new Date().getTime()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast({
      title: "↓ Password downloaded",
      description: "Your password has been saved to a text file.",
      duration: 2000,
    });
  };

  const resetGenerator = () => {
    setPassword('');
    setPasswordHistory([]);
    setShowAdvanced(false);
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
      setPasswordEntropy(calculateEntropy(password, options));
    } else {
      setPasswordStrength(null);
      setPasswordEntropy(null);
    }
  }, [password, options]);

  // Auto-regenerate when options change
  useEffect(() => {
    if (password) {
      handleGeneratePassword();
    }
  }, [options.length, options.includeUppercase, options.includeLowercase, options.includeNumbers, options.includeSymbols, options.excludeSimilar, options.excludeAmbiguous, options.customCharacters]);

  useEffect(() => {
    handleGeneratePassword();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <ToolSEOHead config={passwordGeneratorSEO} />
      <Header />

      <main>
        {/* Hero Section */}
        <section className="relative py-12 sm:py-16 md:py-20 lg:py-24 xl:py-28 2xl:py-32 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-indigo-600/20"></div>
          <div className="relative max-w-sm sm:max-w-lg md:max-w-2xl lg:max-w-4xl xl:max-w-5xl 2xl:max-w-6xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 xl:px-12 text-center">
            <div className="space-y-4 sm:space-y-6 md:space-y-8 lg:space-y-10">
              <div className="inline-flex items-center px-3 py-1.5 sm:px-4 sm:py-2 bg-white/80 backdrop-blur-sm rounded-full border border-blue-200">
                <span className="text-xs sm:text-sm font-medium text-blue-700">Cryptographically Secure Generator</span>
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl 2xl:text-8xl font-bold text-slate-900 leading-tight tracking-tight">
                <span className="block">Random Password</span>
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 mt-1 sm:mt-2">
                  Generator
                </span>
              </h1>
              <p className="text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl text-slate-600 max-w-sm sm:max-w-lg md:max-w-2xl lg:max-w-3xl xl:max-w-4xl mx-auto leading-relaxed px-2 sm:px-0">
                Create cryptographically secure passwords with advanced customization options to protect your digital accounts
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
                <div className="p-3 sm:p-4 md:p-6 lg:p-8 xl:p-10 2xl:p-12 space-y-4 sm:space-y-6 md:space-y-8">
                  <div className="text-center sm:text-left">
                    <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">Password Configuration</h2>
                    <p className="text-sm sm:text-base text-gray-600">Customize your password settings for maximum security</p>
                  </div>

                  {/* Password Length */}
                  <div className="space-y-4 sm:space-y-6">
                    <div className="space-y-2 sm:space-y-3">
                      <div className="flex items-center justify-between">
                        <Label className="text-xs sm:text-sm font-semibold text-gray-800 uppercase tracking-wide">Password Length</Label>
                        <span className="text-xl sm:text-2xl font-bold text-blue-600">{options.length}</span>
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
                  <div className="space-y-4 sm:space-y-6 border-t pt-4 sm:pt-6 md:pt-8">
                    <h3 className="text-lg sm:text-xl font-bold text-gray-900">Character Types</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 md:gap-6">
                      <div className="space-y-3 sm:space-y-4 bg-gray-50 rounded-lg sm:rounded-xl p-4 sm:p-6">
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5 sm:space-y-1">
                            <Label className="text-xs sm:text-sm font-semibold text-gray-800 uppercase tracking-wide">
                              Uppercase Letters (A-Z)
                            </Label>
                            <p className="text-xs text-gray-500">Include capital letters</p>
                          </div>
                          <Switch
                            checked={options.includeUppercase}
                            onCheckedChange={(value) => updateOption('includeUppercase', value)}
                            data-testid="switch-uppercase"
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5 sm:space-y-1">
                            <Label className="text-xs sm:text-sm font-semibold text-gray-800 uppercase tracking-wide">
                              Lowercase Letters (a-z)
                            </Label>
                            <p className="text-xs text-gray-500">Include small letters</p>
                          </div>
                          <Switch
                            checked={options.includeLowercase}
                            onCheckedChange={(value) => updateOption('includeLowercase', value)}
                            data-testid="switch-lowercase"
                          />
                        </div>
                      </div>

                      <div className="space-y-3 sm:space-y-4 bg-gray-50 rounded-lg sm:rounded-xl p-4 sm:p-6">
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5 sm:space-y-1">
                            <Label className="text-xs sm:text-sm font-semibold text-gray-800 uppercase tracking-wide">
                              Numbers (0-9)
                            </Label>
                            <p className="text-xs text-gray-500">Include digits</p>
                          </div>
                          <Switch
                            checked={options.includeNumbers}
                            onCheckedChange={(value) => updateOption('includeNumbers', value)}
                            data-testid="switch-numbers"
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5 sm:space-y-1">
                            <Label className="text-xs sm:text-sm font-semibold text-gray-800 uppercase tracking-wide">
                              Symbols (!@#$%^&*)
                            </Label>
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
                        
                        {/* Character Filtering and Customization Options */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                          <div className="space-y-4 bg-gray-50 rounded-xl p-4 sm:p-6">
                            <h4 className="text-sm sm:text-base font-semibold text-gray-900">Character Filtering</h4>
                            
                            <div className="flex items-center justify-between gap-2">
                              <div className="space-y-1 flex-1 min-w-0">
                                <Label className="text-xs sm:text-sm font-medium">Exclude Similar Characters</Label>
                                <p className="text-xs text-gray-500">Avoid 0, O, 1, l, I for better readability</p>
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
                                <p className="text-xs text-gray-500">Avoid {}[]()/\'"`~,;.&lt;&gt; for clarity</p>
                              </div>
                              <Switch
                                checked={options.excludeAmbiguous}
                                onCheckedChange={(value) => updateOption('excludeAmbiguous', value)}
                                data-testid="switch-exclude-ambiguous"
                              />
                            </div>
                          </div>

                          {/* Character Customization Options */}
                          <div className="space-y-4 bg-gray-50 rounded-xl p-4 sm:p-6">
                            <h4 className="text-sm sm:text-base font-semibold text-gray-900">Character Customization</h4>
                            
                            <div className="space-y-2">
                              <Label className="text-xs sm:text-sm font-medium">Custom Characters</Label>
                              <Input
                                value={options.customCharacters}
                                onChange={(e) => updateOption('customCharacters', e.target.value)}
                                placeholder="e.g., @#$, αβγ, 你好"
                                className="text-sm h-10 sm:h-12 border-2 border-gray-200 rounded-lg"
                                data-testid="input-custom-characters"
                              />
                              <p className="text-xs text-gray-500">Additional characters to include in generation</p>
                            </div>
                          </div>
                        </div>
                        
                        <Separator />
                      </CollapsibleContent>
                    </Collapsible>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 md:gap-4 pt-3 sm:pt-4 md:pt-6">
                    <Button
                      onClick={handleGeneratePassword}
                      className="flex-1 h-10 sm:h-12 md:h-14 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold text-sm sm:text-base md:text-lg rounded-lg sm:rounded-xl shadow-lg"
                      data-testid="button-generate-password"
                    >
                      Generate Password
                    </Button>
                    <Button
                      onClick={resetGenerator}
                      variant="outline"
                      className="h-10 sm:h-12 md:h-14 px-4 sm:px-6 md:px-8 border-2 border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold text-sm sm:text-base md:text-lg rounded-lg sm:rounded-xl"
                      data-testid="button-reset"
                    >
                      Reset
                    </Button>
                  </div>
                </div>

                {/* Results Section */}
                <div className="bg-gradient-to-br from-gray-50 to-blue-50 p-3 sm:p-4 md:p-6 lg:p-8 xl:p-10 2xl:p-12 border-t lg:border-t-0 lg:border-l">
                  <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 mb-4 sm:mb-6 md:mb-8 text-center sm:text-left">Generated Password</h2>

                  {password ? (
                    <div className="space-y-4 sm:space-y-6 md:space-y-8" data-testid="password-results">
                      {/* Generated Password Display */}
                      <div className="bg-white rounded-lg sm:rounded-xl md:rounded-2xl p-4 sm:p-6 shadow-lg border border-blue-100">
                        <div className="flex justify-between items-center mb-1 sm:mb-2">
                          <div className="text-xs sm:text-sm font-semibold text-gray-600 uppercase tracking-wide">Your Password</div>
                          <Button
                            onClick={() => setShowPassword(!showPassword)}
                            variant="ghost"
                            size="sm"
                            className="h-6 px-2 text-xs"
                            data-testid="button-toggle-visibility"
                          >
                            {showPassword ? <EyeOff className="h-3 w-3 sm:h-4 sm:w-4" /> : <Eye className="h-3 w-3 sm:h-4 sm:w-4" />}
                          </Button>
                        </div>
                        <div className="relative">
                          <div
                            className="text-sm sm:text-base md:text-lg font-mono bg-gray-50 p-3 sm:p-4 pr-12 sm:pr-16 rounded-lg sm:rounded-xl border-2 border-gray-200 break-all cursor-pointer hover:bg-gray-100 transition-colors"
                            onClick={() => handleCopyToClipboard(password)}
                            data-testid="text-generated-password"
                          >
                            {showPassword ? password : '•'.repeat(password.length)}
                          </div>
                          <Button
                            onClick={() => handleCopyToClipboard(password)}
                            variant="outline"
                            size="sm"
                            className="absolute top-1 sm:top-2 right-1 sm:right-2 text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-2 rounded-md sm:rounded-lg flex items-center gap-1"
                            data-testid="button-copy-password"
                          >
                            <Copy className="h-3 w-3 sm:h-4 sm:w-4" />
                            <span className="hidden sm:inline">Copy</span>
                          </Button>
                        </div>
                        
                        {/* Quick Action Buttons */}
                        <div className="flex gap-2 mt-3 sm:mt-4">
                          <Button
                            onClick={downloadPassword}
                            variant="outline"
                            size="sm"
                            className="flex-1 text-xs sm:text-sm flex items-center justify-center gap-1 sm:gap-2"
                            data-testid="button-download"
                          >
                            <Download className="h-3 w-3 sm:h-4 sm:w-4" />
                            Download
                          </Button>
                          <Button
                            onClick={handleGeneratePassword}
                            variant="outline"
                            size="sm"
                            className="flex-1 text-xs sm:text-sm flex items-center justify-center gap-1 sm:gap-2"
                            data-testid="button-regenerate"
                          >
                            <RefreshCw className="h-3 w-3 sm:h-4 sm:w-4" />
                            Regenerate
                          </Button>
                        </div>
                      </div>

                      {/* Password Strength */}
                      {passwordStrength && (
                        <div className="bg-white rounded-lg sm:rounded-xl p-4 sm:p-6 shadow-sm">
                          <div className="flex justify-between items-center mb-2 sm:mb-3">
                            <span className="font-medium text-gray-700 text-sm sm:text-base">Password Strength</span>
                            <span className={`text-xs sm:text-sm font-bold text-white px-2 sm:px-3 py-0.5 sm:py-1 rounded-full ${passwordStrength.color}`} data-testid="text-password-strength">
                              {passwordStrength.label}
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2 sm:h-3 mb-2 sm:mb-3">
                            <div
                              className={`h-2 sm:h-3 rounded-full transition-colors duration-300 ${passwordStrength.color}`}
                              style={{ width: `${(passwordStrength.score / 8) * 100}%` }}
                            ></div>
                          </div>
                          <p className="text-xs sm:text-sm text-gray-600">{passwordStrength.description}</p>
                        </div>
                      )}

                      {/* Password Entropy & Security Metrics */}
                      {passwordEntropy && (
                        <div className="bg-white rounded-lg sm:rounded-xl p-4 sm:p-6 shadow-sm">
                          <h3 className="font-medium text-gray-700 text-sm sm:text-base mb-3 sm:mb-4">Security Analysis</h3>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-3 sm:p-4 border border-blue-100">
                              <div className="text-xs text-blue-700 font-medium mb-1">Entropy</div>
                              <div className="text-lg sm:text-xl font-bold text-blue-900" data-testid="text-entropy">
                                {passwordEntropy.entropy} bits
                              </div>
                            </div>
                            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-3 sm:p-4 border border-green-100">
                              <div className="text-xs text-green-700 font-medium mb-1">Character Pool</div>
                              <div className="text-lg sm:text-xl font-bold text-green-900" data-testid="text-charset">
                                {passwordEntropy.charsetSize} chars
                              </div>
                            </div>
                            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-3 sm:p-4 border border-purple-100">
                              <div className="text-xs text-purple-700 font-medium mb-1">Crack Time</div>
                              <div className="text-sm sm:text-base font-bold text-purple-900" data-testid="text-crack-time">
                                {passwordEntropy.crackTime}
                              </div>
                            </div>
                          </div>
                          <p className="text-xs text-gray-500 mt-3 sm:mt-4">
                            Based on 1 billion guesses per second using modern hardware
                          </p>
                        </div>
                      )}

                      {/* Password History */}
                      {passwordHistory.length > 0 && (
                        <div className="space-y-3 sm:space-y-4">
                          <div className="flex justify-between items-center">
                            <h3 className="font-bold text-gray-900 text-base sm:text-lg">Recent Passwords</h3>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-xs sm:text-sm text-red-600 hover:text-red-700 hover:bg-red-50 flex items-center gap-1"
                                  data-testid="button-clear-history"
                                >
                                  <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                                  Clear
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Clear Password History?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    This will permanently delete all saved passwords from your history. This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel data-testid="button-cancel-clear">Cancel</AlertDialogCancel>
                                  <AlertDialogAction 
                                    onClick={clearHistory}
                                    className="bg-red-600 hover:bg-red-700"
                                    data-testid="button-confirm-clear"
                                  >
                                    Clear History
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                          {passwordHistory.slice(0, 3).map((historyPassword, index) => (
                            <div key={index} className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 shadow-sm">
                              <div className="flex justify-between items-center">
                                <span className="font-medium text-gray-700 text-xs sm:text-sm">Password #{index + 1}</span>
                                <Button
                                  onClick={() => handleCopyToClipboard(historyPassword)}
                                  variant="outline"
                                  size="sm"
                                  className="text-xs sm:text-sm px-2 sm:px-3 py-1 rounded-md sm:rounded-lg flex items-center gap-1"
                                  data-testid={`button-copy-history-${index}`}
                                >
                                  <Copy className="h-3 w-3" />
                                  <span className="hidden sm:inline">Copy</span>
                                </Button>
                              </div>
                              <div className="font-mono text-xs sm:text-sm text-gray-600 mt-1 sm:mt-2 truncate" data-testid={`text-history-password-${index}`}>
                                {historyPassword}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-8 sm:py-12 md:py-16">
                      <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full mx-auto mb-4 sm:mb-6 flex items-center justify-center">
                        <div className="text-2xl sm:text-3xl">🔐</div>
                      </div>
                      <h3 className="text-base sm:text-lg font-semibold text-gray-700 mb-2">Ready to Generate</h3>
                      <p className="text-sm sm:text-base text-gray-500 mb-4 sm:mb-6">Click "Generate Password" to create your secure password</p>
                      <Button
                        onClick={handleGeneratePassword}
                        className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-sm sm:text-base"
                        data-testid="button-generate-first"
                      >
                        Generate Password
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* SEO Content Sections */}
          <div className="mt-8 sm:mt-12 md:mt-16 grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 md:gap-8">
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-xl sm:rounded-2xl">
              <CardContent className="p-4 sm:p-6 md:p-8">
                <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 mb-3 sm:mb-4 md:mb-6">What is a Random Password Generator?</h3>
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

            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-xl sm:rounded-2xl">
              <CardContent className="p-4 sm:p-6 md:p-8">
                <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 mb-3 sm:mb-4 md:mb-6">Why Use Strong Passwords?</h3>
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
          <div className="mt-8 sm:mt-10 md:mt-12 space-y-4 sm:space-y-6 md:space-y-8">
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-xl sm:rounded-2xl">
              <CardContent className="p-4 sm:p-6 md:p-8">
                <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 mb-4 sm:mb-5 md:mb-6">Password Strength Guidelines</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
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
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-xl sm:rounded-2xl">
              <CardContent className="p-4 sm:p-6 md:p-8">
                <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 mb-4 sm:mb-5 md:mb-6">Understanding Character Sets</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 md:gap-8">
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
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-xl sm:rounded-2xl">
              <CardContent className="p-4 sm:p-6 md:p-8">
                <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 mb-4 sm:mb-5 md:mb-6">Industry Password Requirements</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
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
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 md:gap-8">
              <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-xl sm:rounded-2xl">
                <CardContent className="p-4 sm:p-6 md:p-8">
                  <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 mb-4 sm:mb-5 md:mb-6">Common Password Mistakes</h3>
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

              <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-xl sm:rounded-2xl">
                <CardContent className="p-4 sm:p-6 md:p-8">
                  <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 mb-4 sm:mb-5 md:mb-6">Password Management Tips</h3>
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
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-xl sm:rounded-2xl">
              <CardContent className="p-4 sm:p-6 md:p-8">
                <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 mb-4 sm:mb-6 md:mb-8">Frequently Asked Questions</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 md:gap-8">
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
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-xl sm:rounded-2xl">
              <CardContent className="p-4 sm:p-6 md:p-8">
                <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 mb-4 sm:mb-5 md:mb-6">Technical Security Features</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
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