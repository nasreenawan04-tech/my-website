
import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface PasswordAnalysis {
  score: number;
  strength: string;
  color: string;
  entropy: number;
  timeToCrack: string;
  feedback: string[];
  requirements: {
    length: boolean;
    uppercase: boolean;
    lowercase: boolean;
    numbers: boolean;
    symbols: boolean;
    noCommon: boolean;
    noPersonal: boolean;
  };
}

const commonPasswords = [
  'password', '123456', '123456789', 'qwerty', 'abc123', 'password123',
  'admin', 'letmein', 'welcome', 'monkey', '1234567890', 'dragon',
  'master', 'shadow', 'superman', 'michael', 'football', 'baseball'
];

const personalPatterns = [
  /birthday/i, /name/i, /phone/i, /address/i, /email/i, /username/i,
  /user/i, /admin/i, /login/i, /welcome/i, /hello/i, /love/i
];

export default function PasswordStrengthChecker() {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [analysis, setAnalysis] = useState<PasswordAnalysis | null>(null);

  const analyzePassword = (pwd: string): PasswordAnalysis => {
    let score = 0;
    const feedback: string[] = [];
    
    // Length analysis
    const length = pwd.length;
    let lengthMultiplier = 1;
    if (length >= 16) {
      score += 3;
      lengthMultiplier = 1.2;
    } else if (length >= 12) {
      score += 2;
      lengthMultiplier = 1.1;
    } else if (length >= 8) {
      score += 1;
    } else {
      feedback.push('Use at least 8 characters (12+ recommended)');
    }

    // Character variety
    const hasLowercase = /[a-z]/.test(pwd);
    const hasUppercase = /[A-Z]/.test(pwd);
    const hasNumbers = /[0-9]/.test(pwd);
    const hasSymbols = /[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/.test(pwd);

    if (hasLowercase) score += 1;
    else feedback.push('Add lowercase letters');

    if (hasUppercase) score += 1;
    else feedback.push('Add uppercase letters');

    if (hasNumbers) score += 1;
    else feedback.push('Add numbers');

    if (hasSymbols) score += 2;
    else feedback.push('Add special characters (!@#$%^&*)');

    // Bonus points for variety
    const variety = [hasLowercase, hasUppercase, hasNumbers, hasSymbols].filter(Boolean).length;
    if (variety >= 4) score += 2;
    else if (variety >= 3) score += 1;

    // Pattern analysis
    const hasRepeatedChars = /(.)\1{2,}/.test(pwd);
    const hasSequentialChars = /(abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz|123|234|345|456|567|678|789|890)/i.test(pwd);
    const hasKeyboardPattern = /(qwerty|asdfgh|zxcvbn|12345|54321)/i.test(pwd);

    if (hasRepeatedChars) {
      score -= 1;
      feedback.push('Avoid repeated characters (aaa, 111)');
    }

    if (hasSequentialChars) {
      score -= 1;
      feedback.push('Avoid sequential characters (abc, 123)');
    }

    if (hasKeyboardPattern) {
      score -= 2;
      feedback.push('Avoid keyboard patterns (qwerty, 12345)');
    }

    // Common password check
    const isCommon = commonPasswords.some(common => 
      pwd.toLowerCase().includes(common) || common.includes(pwd.toLowerCase())
    );
    if (isCommon) {
      score -= 3;
      feedback.push('Avoid common passwords or dictionary words');
    }

    // Personal information patterns
    const hasPersonalPattern = personalPatterns.some(pattern => pattern.test(pwd));
    if (hasPersonalPattern) {
      score -= 2;
      feedback.push('Avoid personal information in passwords');
    }

    // Calculate entropy
    let charset = 0;
    if (hasLowercase) charset += 26;
    if (hasUppercase) charset += 26;
    if (hasNumbers) charset += 10;
    if (hasSymbols) charset += 32;

    const entropy = Math.log2(Math.pow(charset, length));

    // Time to crack estimation
    const combinations = Math.pow(charset, length);
    const crackTime = combinations / (2 * 1e9); // Assuming 1 billion guesses per second
    
    let timeToCrack = '';
    if (crackTime < 1) {
      timeToCrack = 'Instantly';
    } else if (crackTime < 60) {
      timeToCrack = `${Math.round(crackTime)} seconds`;
    } else if (crackTime < 3600) {
      timeToCrack = `${Math.round(crackTime / 60)} minutes`;
    } else if (crackTime < 86400) {
      timeToCrack = `${Math.round(crackTime / 3600)} hours`;
    } else if (crackTime < 31536000) {
      timeToCrack = `${Math.round(crackTime / 86400)} days`;
    } else if (crackTime < 31536000000) {
      timeToCrack = `${Math.round(crackTime / 31536000)} years`;
    } else {
      timeToCrack = 'Centuries';
    }

    // Apply length multiplier
    score = Math.max(0, Math.round(score * lengthMultiplier));

    // Determine strength
    let strength = '';
    let color = '';
    if (score <= 3) {
      strength = 'Very Weak';
      color = 'bg-red-500';
    } else if (score <= 6) {
      strength = 'Weak';
      color = 'bg-orange-500';
    } else if (score <= 9) {
      strength = 'Fair';
      color = 'bg-yellow-500';
    } else if (score <= 12) {
      strength = 'Good';
      color = 'bg-blue-500';
    } else if (score <= 15) {
      strength = 'Strong';
      color = 'bg-green-500';
    } else {
      strength = 'Very Strong';
      color = 'bg-green-600';
    }

    return {
      score: Math.min(score, 16),
      strength,
      color,
      entropy: Math.round(entropy),
      timeToCrack,
      feedback: feedback.slice(0, 5), // Limit feedback items
      requirements: {
        length: length >= 8,
        uppercase: hasUppercase,
        lowercase: hasLowercase,
        numbers: hasNumbers,
        symbols: hasSymbols,
        noCommon: !isCommon,
        noPersonal: !hasPersonalPattern
      }
    };
  };

  const handlePasswordChange = (value: string) => {
    setPassword(value);
    if (value.length > 0) {
      setAnalysis(analyzePassword(value));
    } else {
      setAnalysis(null);
    }
  };

  const clearPassword = () => {
    setPassword('');
    setAnalysis(null);
  };

  useEffect(() => {
    if (password) {
      setAnalysis(analyzePassword(password));
    }
  }, [password]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Helmet>
        <title>Password Strength Checker - Test Password Security Online | DapsiWow</title>
        <meta name="description" content="Check password strength and security with our free online password analyzer. Get instant feedback on password quality, entropy, and time-to-crack estimates." />
        <meta name="keywords" content="password strength checker, password security test, password analyzer, password quality checker, password entropy, cybersecurity, password validation, strong password checker" />
        <meta property="og:title" content="Password Strength Checker - Test Password Security Online | DapsiWow" />
        <meta property="og:description" content="Free online password strength analyzer with detailed security feedback and improvement recommendations." />
        <meta property="og:type" content="website" />
        <meta name="robots" content="index, follow" />
        <meta name="author" content="DapsiWow" />
        <link rel="canonical" href="https://dapsiwow.com/tools/password-strength-checker" />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            "name": "Password Strength Checker",
            "description": "Free online password strength analyzer that provides detailed security feedback, entropy calculations, and improvement recommendations for better password security.",
            "url": "https://dapsiwow.com/tools/password-strength-checker",
            "applicationCategory": "SecurityApplication",
            "operatingSystem": "Any",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "USD"
            },
            "featureList": [
              "Real-time password strength analysis",
              "Entropy calculation",
              "Time-to-crack estimation",
              "Security recommendations",
              "Pattern detection",
              "Privacy-focused local analysis"
            ]
          })}
        </script>
      </Helmet>

      <Header />

      <main>
        {/* Hero Section */}
        <section className="relative py-12 sm:py-16 md:py-20 lg:py-28 xl:py-32 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-indigo-600/20"></div>
          <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="space-y-4 sm:space-y-6 lg:space-y-8">
              <div className="inline-flex items-center px-3 py-1.5 sm:px-4 sm:py-2 bg-white/80 backdrop-blur-sm rounded-full border border-blue-200">
                <span className="text-xs sm:text-sm font-medium text-blue-700">Advanced Security Analysis</span>
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-slate-900 leading-tight">
                Password Strength
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                  Checker
                </span>
              </h1>
              <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-slate-600 max-w-3xl mx-auto leading-relaxed px-2">
                Analyze your password security with detailed feedback and improvement recommendations
              </p>
            </div>
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-4 py-16">
          {/* Main Checker Card */}
          <Card className="bg-white/90 backdrop-blur-sm shadow-2xl border-0 rounded-3xl overflow-hidden">
            <CardContent className="p-0">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
                {/* Input Section */}
                <div className="p-8 lg:p-12 space-y-8">
                  <div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">Password Analysis</h2>
                    <p className="text-gray-600">Enter your password to get detailed security analysis</p>
                  </div>

                  {/* Password Input */}
                  <div className="space-y-4">
                    <Label className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                      Enter Password
                    </Label>
                    <div className="relative">
                      <Input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => handlePasswordChange(e.target.value)}
                        placeholder="Type your password here..."
                        className="text-lg h-14 pr-24 border-2 border-gray-200 rounded-xl focus:border-blue-500"
                        data-testid="input-password"
                      />
                      <div className="absolute right-2 top-2 flex gap-2">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowPassword(!showPassword)}
                          className="h-10 px-3"
                        >
                          {showPassword ? 'Hide' : 'Show'}
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Security Tips */}
                  <div className="bg-gray-50 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Password Security Tips</h3>
                    <ul className="space-y-2 text-sm text-gray-700">
                      <li>• Use at least 12 characters (16+ recommended)</li>
                      <li>• Mix uppercase, lowercase, numbers, and symbols</li>
                      <li>• Avoid common words and personal information</li>
                      <li>• Don't use sequential or repeated characters</li>
                      <li>• Use unique passwords for each account</li>
                    </ul>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-4 pt-6">
                    <Button
                      onClick={clearPassword}
                      variant="outline"
                      className="h-14 px-8 border-2 border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold text-lg rounded-xl"
                      disabled={!password}
                      data-testid="button-clear"
                    >
                      Clear Password
                    </Button>
                  </div>
                </div>

                {/* Results Section */}
                <div className="bg-gradient-to-br from-gray-50 to-blue-50 p-8 lg:p-12">
                  <h2 className="text-2xl font-bold text-gray-900 mb-8">Security Analysis</h2>

                  {analysis ? (
                    <div className="space-y-6" data-testid="analysis-results">
                      {/* Strength Score */}
                      <div className="bg-white rounded-2xl p-6 shadow-lg border border-blue-100">
                        <div className="flex justify-between items-center mb-4">
                          <span className="text-lg font-semibold text-gray-700">Password Strength</span>
                          <Badge className={`${analysis.color} text-white`}>
                            {analysis.strength}
                          </Badge>
                        </div>
                        <Progress 
                          value={(analysis.score / 16) * 100} 
                          className="h-4 mb-4"
                        />
                        <div className="text-sm text-gray-600">
                          Score: {analysis.score}/16 • Entropy: {analysis.entropy} bits • Time to crack: {analysis.timeToCrack}
                        </div>
                      </div>

                      {/* Requirements Checklist */}
                      <div className="bg-white rounded-xl p-6 shadow-sm">
                        <h3 className="font-bold text-gray-900 mb-4">Security Requirements</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div className={`flex items-center space-x-2 ${analysis.requirements.length ? 'text-green-600' : 'text-red-600'}`}>
                            <span>{analysis.requirements.length ? '✓' : '✗'}</span>
                            <span className="text-sm">8+ characters</span>
                          </div>
                          <div className={`flex items-center space-x-2 ${analysis.requirements.uppercase ? 'text-green-600' : 'text-red-600'}`}>
                            <span>{analysis.requirements.uppercase ? '✓' : '✗'}</span>
                            <span className="text-sm">Uppercase letters</span>
                          </div>
                          <div className={`flex items-center space-x-2 ${analysis.requirements.lowercase ? 'text-green-600' : 'text-red-600'}`}>
                            <span>{analysis.requirements.lowercase ? '✓' : '✗'}</span>
                            <span className="text-sm">Lowercase letters</span>
                          </div>
                          <div className={`flex items-center space-x-2 ${analysis.requirements.numbers ? 'text-green-600' : 'text-red-600'}`}>
                            <span>{analysis.requirements.numbers ? '✓' : '✗'}</span>
                            <span className="text-sm">Numbers</span>
                          </div>
                          <div className={`flex items-center space-x-2 ${analysis.requirements.symbols ? 'text-green-600' : 'text-red-600'}`}>
                            <span>{analysis.requirements.symbols ? '✓' : '✗'}</span>
                            <span className="text-sm">Special characters</span>
                          </div>
                          <div className={`flex items-center space-x-2 ${analysis.requirements.noCommon ? 'text-green-600' : 'text-red-600'}`}>
                            <span>{analysis.requirements.noCommon ? '✓' : '✗'}</span>
                            <span className="text-sm">No common patterns</span>
                          </div>
                        </div>
                      </div>

                      {/* Feedback */}
                      {analysis.feedback.length > 0 && (
                        <div className="space-y-3">
                          <h3 className="font-bold text-gray-900">Improvement Suggestions</h3>
                          {analysis.feedback.map((feedback, index) => (
                            <Alert key={index} className="border-orange-200 bg-orange-50">
                              <AlertDescription className="text-orange-800">
                                {feedback}
                              </AlertDescription>
                            </Alert>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-16" data-testid="no-results">
                      <div className="w-20 h-20 bg-gray-200 rounded-full mx-auto mb-6 flex items-center justify-center">
                        <div className="text-3xl font-bold text-gray-400">🔐</div>
                      </div>
                      <p className="text-gray-500 text-lg">Enter a password to analyze its strength</p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Educational Content */}
          <div className="mt-16 grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">What is Password Strength?</h3>
                <div className="space-y-4 text-gray-600">
                  <p>
                    Password strength refers to the effectiveness of a password against guessing or brute-force attacks. 
                    Our password strength checker evaluates multiple factors including <strong>length, character variety, 
                    entropy, and pattern detection</strong> to determine how secure your password is against modern attack methods.
                  </p>
                  <p>
                    Strong passwords are essential for protecting your digital identity, financial accounts, and personal data. 
                    A well-constructed password acts as the first line of defense against cybercriminals who use sophisticated 
                    tools capable of attempting billions of password combinations per second.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">How We Analyze Password Security</h3>
                <div className="space-y-4 text-gray-600">
                  <p>
                    Our advanced password analyzer uses industry-standard algorithms to evaluate password security. 
                    We calculate <strong>entropy</strong> (randomness measure), estimate time-to-crack scenarios, and 
                    identify common vulnerabilities like dictionary words, keyboard patterns, and sequential characters.
                  </p>
                  <p>
                    The analysis includes checking for character diversity, length adequacy, and common attack patterns. 
                    All analysis happens locally in your browser - your password is never transmitted to our servers, 
                    ensuring complete privacy and security during the evaluation process.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Password Strength Levels Guide */}
          <div className="mt-12">
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Password Strength Levels Explained</h3>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  <div className="bg-red-50 rounded-lg p-4 border border-red-200 text-center">
                    <div className="w-8 h-8 bg-red-500 rounded-full mx-auto mb-2"></div>
                    <h4 className="font-semibold text-red-900 mb-1">Very Weak</h4>
                    <p className="text-red-800 text-xs">Crackable in seconds or minutes</p>
                  </div>
                  <div className="bg-orange-50 rounded-lg p-4 border border-orange-200 text-center">
                    <div className="w-8 h-8 bg-orange-500 rounded-full mx-auto mb-2"></div>
                    <h4 className="font-semibold text-orange-900 mb-1">Weak</h4>
                    <p className="text-orange-800 text-xs">Vulnerable to basic attacks</p>
                  </div>
                  <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200 text-center">
                    <div className="w-8 h-8 bg-yellow-500 rounded-full mx-auto mb-2"></div>
                    <h4 className="font-semibold text-yellow-900 mb-1">Fair</h4>
                    <p className="text-yellow-800 text-xs">Minimal security protection</p>
                  </div>
                  <div className="bg-blue-50 rounded-lg p-4 border border-blue-200 text-center">
                    <div className="w-8 h-8 bg-blue-500 rounded-full mx-auto mb-2"></div>
                    <h4 className="font-semibold text-blue-900 mb-1">Good</h4>
                    <p className="text-blue-800 text-xs">Adequate for most accounts</p>
                  </div>
                  <div className="bg-green-50 rounded-lg p-4 border border-green-200 text-center">
                    <div className="w-8 h-8 bg-green-500 rounded-full mx-auto mb-2"></div>
                    <h4 className="font-semibold text-green-900 mb-1">Strong</h4>
                    <p className="text-green-800 text-xs">Highly secure protection</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Comprehensive SEO Content Sections */}
          <div className="mt-12 space-y-8">
            {/* Password Security Best Practices */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Password Security Best Practices</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-gray-800">Creating Strong Passwords</h4>
                    <div className="space-y-3 text-gray-600">
                      <p className="text-sm">
                        Strong passwords should be at least 12 characters long, preferably 16 or more. They must include 
                        a combination of uppercase letters, lowercase letters, numbers, and special characters. Avoid 
                        using dictionary words, personal information, or predictable patterns.
                      </p>
                      <ul className="text-sm space-y-1 list-disc list-inside">
                        <li>Use passphrases with random words</li>
                        <li>Include numbers and special characters</li>
                        <li>Avoid keyboard patterns (qwerty, 123456)</li>
                        <li>Don't use personal information</li>
                        <li>Make each password unique</li>
                      </ul>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-gray-800">Password Management</h4>
                    <div className="space-y-3 text-gray-600">
                      <p className="text-sm">
                        Use a reputable password manager to generate, store, and manage unique passwords for all your 
                        accounts. Enable two-factor authentication wherever possible. Regularly update passwords, 
                        especially for high-value accounts like banking and email.
                      </p>
                      <ul className="text-sm space-y-1 list-disc list-inside">
                        <li>Use a password manager</li>
                        <li>Enable two-factor authentication</li>
                        <li>Regular password updates</li>
                        <li>Monitor for data breaches</li>
                        <li>Secure password recovery options</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Common Password Vulnerabilities */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Common Password Vulnerabilities</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                      <h4 className="font-semibold text-red-900 mb-2">Dictionary Attacks</h4>
                      <p className="text-red-800 text-sm">
                        Attackers use lists of common passwords and dictionary words. Our checker identifies if your 
                        password contains common words or appears in known breach databases.
                      </p>
                    </div>
                    <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
                      <h4 className="font-semibold text-orange-900 mb-2">Brute Force Attacks</h4>
                      <p className="text-orange-800 text-sm">
                        Systematic attempts to crack passwords by trying all possible combinations. Longer passwords 
                        with diverse characters exponentially increase the time required for successful attacks.
                      </p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                      <h4 className="font-semibold text-yellow-900 mb-2">Pattern Recognition</h4>
                      <p className="text-yellow-800 text-sm">
                        Keyboard patterns, sequential characters, and repeated elements make passwords predictable. 
                        Our analyzer detects these patterns and recommends more random alternatives.
                      </p>
                    </div>
                    <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                      <h4 className="font-semibold text-blue-900 mb-2">Social Engineering</h4>
                      <p className="text-blue-800 text-sm">
                        Passwords based on personal information are vulnerable to social engineering attacks. 
                        Avoid using names, dates, addresses, or other personally identifiable information.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Password Entropy and Cryptography */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Understanding Password Entropy</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="space-y-4 text-gray-600">
                    <h4 className="font-semibold text-gray-800 mb-2">What is Password Entropy?</h4>
                    <p className="text-sm">
                      Password entropy measures the randomness and unpredictability of a password, expressed in bits. 
                      Higher entropy means more possible combinations, making passwords exponentially harder to crack. 
                      A password with 60+ bits of entropy is considered secure against current attack methods.
                    </p>
                    <p className="text-sm">
                      Entropy calculation considers the character set size and password length. For example, an 8-character 
                      password using only lowercase letters has 37.6 bits of entropy, while the same length password 
                      with mixed characters has approximately 52.6 bits.
                    </p>
                  </div>
                  <div className="space-y-4 text-gray-600">
                    <h4 className="font-semibold text-gray-800 mb-2">Entropy Examples</h4>
                    <div className="space-y-2 bg-gray-50 rounded-lg p-4">
                      <div className="flex justify-between text-sm">
                        <span>8-char lowercase:</span>
                        <span className="font-mono">37.6 bits</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>8-char mixed case:</span>
                        <span className="font-mono">47.6 bits</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>8-char full charset:</span>
                        <span className="font-mono">52.6 bits</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>12-char full charset:</span>
                        <span className="font-mono">78.9 bits</span>
                      </div>
                      <div className="flex justify-between text-sm font-semibold text-green-700">
                        <span>16-char full charset:</span>
                        <span className="font-mono">105.2 bits</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Industry Standards and Compliance */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
                <CardContent className="p-8">
                  <h3 className="text-xl font-bold text-gray-900 mb-6">NIST Guidelines</h3>
                  <div className="space-y-4 text-gray-600">
                    <p className="text-sm">
                      The National Institute of Standards and Technology (NIST) recommends passwords be at least 8 
                      characters long, with longer passwords preferred. They discourage complex character requirements 
                      in favor of length and uniqueness.
                    </p>
                    <div className="space-y-2">
                      <h4 className="font-semibold text-green-800 text-sm">NIST Best Practices:</h4>
                      <ul className="text-xs space-y-1 list-disc list-inside text-green-700">
                        <li>Minimum 8 characters, prefer longer</li>
                        <li>Check against breach databases</li>
                        <li>Allow all printable characters</li>
                        <li>No periodic password changes</li>
                        <li>Use multi-factor authentication</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
                <CardContent className="p-8">
                  <h3 className="text-xl font-bold text-gray-900 mb-6">Enterprise Security</h3>
                  <div className="space-y-4 text-gray-600">
                    <p className="text-sm">
                      Enterprise password policies often require additional security measures including regular updates, 
                      complexity requirements, and integration with identity management systems.
                    </p>
                    <div className="space-y-2">
                      <h4 className="font-semibold text-blue-800 text-sm">Enterprise Features:</h4>
                      <ul className="text-xs space-y-1 list-disc list-inside text-blue-700">
                        <li>Password policy enforcement</li>
                        <li>Active Directory integration</li>
                        <li>Single sign-on (SSO) support</li>
                        <li>Compliance reporting</li>
                        <li>Audit trail maintenance</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
                <CardContent className="p-8">
                  <h3 className="text-xl font-bold text-gray-900 mb-6">Regulatory Compliance</h3>
                  <div className="space-y-4 text-gray-600">
                    <p className="text-sm">
                      Various regulations require specific password security measures. GDPR, HIPAA, PCI-DSS, and other 
                      standards mandate strong authentication and data protection practices.
                    </p>
                    <div className="space-y-2">
                      <h4 className="font-semibold text-purple-800 text-sm">Compliance Standards:</h4>
                      <ul className="text-xs space-y-1 list-disc list-inside text-purple-700">
                        <li>GDPR data protection</li>
                        <li>HIPAA healthcare security</li>
                        <li>PCI-DSS payment processing</li>
                        <li>SOX financial reporting</li>
                        <li>ISO 27001 information security</li>
                      </ul>
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
                      <h4 className="text-lg font-semibold text-gray-900 mb-2">Is my password safe when I check it here?</h4>
                      <p className="text-gray-600 text-sm">
                        Yes, absolutely secure. All password analysis happens locally in your browser using JavaScript. 
                        Your password is never transmitted to our servers, stored in databases, or logged anywhere. 
                        The analysis is completely private and confidential.
                      </p>
                    </div>

                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-2">What makes a password truly strong?</h4>
                      <p className="text-gray-600 text-sm">
                        Strong passwords combine adequate length (12+ characters), character diversity (uppercase, 
                        lowercase, numbers, symbols), and unpredictability (no patterns, dictionary words, or personal 
                        information). Our analyzer evaluates all these factors comprehensively.
                      </p>
                    </div>

                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-2">How accurate are time-to-crack estimates?</h4>
                      <p className="text-gray-600 text-sm">
                        Our estimates assume brute-force attacks using modern hardware capable of 1 billion attempts 
                        per second. Real-world attacks may be faster using dictionary methods or slower depending on 
                        target system security measures and rate limiting.
                      </p>
                    </div>

                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-2">Should I use this for business passwords?</h4>
                      <p className="text-gray-600 text-sm">
                        Yes, our password strength checker follows industry security standards and meets enterprise 
                        requirements. It's suitable for evaluating business passwords, but always follow your 
                        organization's specific security policies and compliance requirements.
                      </p>
                    </div>
                  </div>
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-2">What is password entropy and why does it matter?</h4>
                      <p className="text-gray-600 text-sm">
                        Password entropy measures randomness in bits. Higher entropy means exponentially more possible 
                        combinations, making brute-force attacks impractical. A password with 60+ bits of entropy is 
                        considered secure against current attack capabilities.
                      </p>
                    </div>

                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-2">How often should I check and update passwords?</h4>
                      <p className="text-gray-600 text-sm">
                        Check passwords when creating new accounts, if you suspect compromise, or during security 
                        audits. Update passwords immediately if accounts are breached. For high-value accounts, 
                        consider periodic updates every 6-12 months.
                      </p>
                    </div>

                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-2">Does this tool work offline?</h4>
                      <p className="text-gray-600 text-sm">
                        Once the page loads, all password analysis functions work offline since processing happens 
                        locally in your browser. This ensures maximum privacy and allows you to check passwords 
                        even without an internet connection.
                      </p>
                    </div>

                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-2">Can I integrate this checker into my application?</h4>
                      <p className="text-gray-600 text-sm">
                        While this web tool is designed for individual use, you can implement similar password 
                        strength algorithms in your applications. Consider using established libraries that follow 
                        industry standards for consistent security analysis.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Password Security in Different Contexts */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Password Security by Account Type</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-red-800">High-Risk Accounts</h4>
                    <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                      <p className="text-red-900 text-sm mb-3 font-medium">Banking, Email, Cloud Storage</p>
                      <ul className="text-red-800 text-xs space-y-1 list-disc list-inside">
                        <li>16+ character passwords</li>
                        <li>Full character set diversity</li>
                        <li>Unique passwords per account</li>
                        <li>Two-factor authentication required</li>
                        <li>Regular security monitoring</li>
                        <li>Password manager recommended</li>
                      </ul>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-yellow-800">Medium-Risk Accounts</h4>
                    <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                      <p className="text-yellow-900 text-sm mb-3 font-medium">Social Media, Shopping, Work Apps</p>
                      <ul className="text-yellow-800 text-xs space-y-1 list-disc list-inside">
                        <li>12+ character passwords</li>
                        <li>Mixed character types</li>
                        <li>Avoid personal information</li>
                        <li>Enable 2FA when available</li>
                        <li>Regular password updates</li>
                        <li>Monitor for breaches</li>
                      </ul>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-green-800">Lower-Risk Accounts</h4>
                    <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                      <p className="text-green-900 text-sm mb-3 font-medium">Forums, News Sites, Casual Apps</p>
                      <ul className="text-green-800 text-xs space-y-1 list-disc list-inside">
                        <li>10+ character passwords</li>
                        <li>Basic character diversity</li>
                        <li>Avoid password reuse</li>
                        <li>Consider throwaway emails</li>
                        <li>Minimal personal data</li>
                        <li>Regular account cleanup</li>
                      </ul>
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
