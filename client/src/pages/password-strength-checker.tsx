
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
                <span className="text-xs sm:text-sm font-medium text-blue-700">Real-time Security Analysis</span>
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
                          {showPassword ? '👁️' : '👁️‍🗨️'}
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Quick Tips */}
                  <div className="bg-blue-50 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-blue-900 mb-4">Password Best Practices</h3>
                    <ul className="space-y-2 text-sm text-blue-800">
                      <li>• Use at least 12 characters (16+ recommended)</li>
                      <li>• Mix uppercase, lowercase, numbers, and symbols</li>
                      <li>• Avoid common words and personal information</li>
                      <li>• Don't use sequential or repeated characters</li>
                      <li>• Use unique passwords for each account</li>
                    </ul>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-4">
                    <Button
                      onClick={clearPassword}
                      variant="outline"
                      className="h-12 px-8 border-2 border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold rounded-xl"
                      disabled={!password}
                    >
                      Clear
                    </Button>
                  </div>
                </div>

                {/* Results Section */}
                <div className="bg-gradient-to-br from-gray-50 to-blue-50 p-8 lg:p-12">
                  <h2 className="text-2xl font-bold text-gray-900 mb-8">Security Analysis</h2>

                  {analysis ? (
                    <div className="space-y-6">
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
                            <span>{analysis.requirements.length ? '✅' : '❌'}</span>
                            <span className="text-sm">8+ characters</span>
                          </div>
                          <div className={`flex items-center space-x-2 ${analysis.requirements.uppercase ? 'text-green-600' : 'text-red-600'}`}>
                            <span>{analysis.requirements.uppercase ? '✅' : '❌'}</span>
                            <span className="text-sm">Uppercase letters</span>
                          </div>
                          <div className={`flex items-center space-x-2 ${analysis.requirements.lowercase ? 'text-green-600' : 'text-red-600'}`}>
                            <span>{analysis.requirements.lowercase ? '✅' : '❌'}</span>
                            <span className="text-sm">Lowercase letters</span>
                          </div>
                          <div className={`flex items-center space-x-2 ${analysis.requirements.numbers ? 'text-green-600' : 'text-red-600'}`}>
                            <span>{analysis.requirements.numbers ? '✅' : '❌'}</span>
                            <span className="text-sm">Numbers</span>
                          </div>
                          <div className={`flex items-center space-x-2 ${analysis.requirements.symbols ? 'text-green-600' : 'text-red-600'}`}>
                            <span>{analysis.requirements.symbols ? '✅' : '❌'}</span>
                            <span className="text-sm">Special characters</span>
                          </div>
                          <div className={`flex items-center space-x-2 ${analysis.requirements.noCommon ? 'text-green-600' : 'text-red-600'}`}>
                            <span>{analysis.requirements.noCommon ? '✅' : '❌'}</span>
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
                    <div className="text-center py-16">
                      <div className="w-20 h-20 bg-gray-200 rounded-full mx-auto mb-6 flex items-center justify-center">
                        <div className="text-3xl font-bold text-gray-400">🔍</div>
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
                <h3 className="text-2xl font-bold text-gray-900 mb-6">How Password Strength is Measured</h3>
                <div className="space-y-4 text-gray-600">
                  <p>
                    Our password strength checker analyzes multiple factors to determine password security:
                    <strong> length, character variety, entropy, and pattern detection</strong>. The analysis
                    helps identify vulnerabilities and provides actionable recommendations.
                  </p>
                  <p>
                    <strong>Entropy</strong> measures the randomness of your password in bits. Higher entropy
                    means more possible combinations, making passwords exponentially harder to crack. A
                    password with 60+ bits of entropy is considered secure for most purposes.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Time-to-Crack Estimates</h3>
                <div className="space-y-4 text-gray-600">
                  <p>
                    Our calculator estimates how long it would take to crack your password using modern
                    hardware capable of 1 billion guesses per second. Real-world attacks may vary
                    based on the attack method and available resources.
                  </p>
                  <p>
                    These estimates assume a brute-force attack trying all possible combinations.
                    Passwords using common words or patterns can be cracked much faster using
                    dictionary attacks and advanced techniques.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Password Security Guide */}
          <div className="mt-12">
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Password Strength Levels</h3>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  <div className="bg-red-50 rounded-lg p-4 border border-red-200 text-center">
                    <div className="w-8 h-8 bg-red-500 rounded-full mx-auto mb-2"></div>
                    <h4 className="font-semibold text-red-900 mb-1">Very Weak</h4>
                    <p className="text-red-800 text-xs">Easily cracked in seconds</p>
                  </div>
                  <div className="bg-orange-50 rounded-lg p-4 border border-orange-200 text-center">
                    <div className="w-8 h-8 bg-orange-500 rounded-full mx-auto mb-2"></div>
                    <h4 className="font-semibold text-orange-900 mb-1">Weak</h4>
                    <p className="text-orange-800 text-xs">Vulnerable to attacks</p>
                  </div>
                  <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200 text-center">
                    <div className="w-8 h-8 bg-yellow-500 rounded-full mx-auto mb-2"></div>
                    <h4 className="font-semibold text-yellow-900 mb-1">Fair</h4>
                    <p className="text-yellow-800 text-xs">Basic protection</p>
                  </div>
                  <div className="bg-blue-50 rounded-lg p-4 border border-blue-200 text-center">
                    <div className="w-8 h-8 bg-blue-500 rounded-full mx-auto mb-2"></div>
                    <h4 className="font-semibold text-blue-900 mb-1">Good</h4>
                    <p className="text-blue-800 text-xs">Secure for most uses</p>
                  </div>
                  <div className="bg-green-50 rounded-lg p-4 border border-green-200 text-center">
                    <div className="w-8 h-8 bg-green-500 rounded-full mx-auto mb-2"></div>
                    <h4 className="font-semibold text-green-900 mb-1">Strong</h4>
                    <p className="text-green-800 text-xs">Highly secure</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* FAQ Section */}
          <div className="mt-12">
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-8">Frequently Asked Questions</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-2">Is my password safe when I check it here?</h4>
                      <p className="text-gray-600 text-sm">Yes, absolutely. All password analysis happens locally in your browser. Your password is never sent to our servers or stored anywhere. The analysis is completely private and secure.</p>
                    </div>

                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-2">What makes a password strong?</h4>
                      <p className="text-gray-600 text-sm">A strong password combines length (12+ characters), character variety (uppercase, lowercase, numbers, symbols), and unpredictability (no common words or patterns). Our checker evaluates all these factors.</p>
                    </div>

                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-2">How accurate are the time-to-crack estimates?</h4>
                      <p className="text-gray-600 text-sm">Our estimates are based on brute-force attacks using modern hardware. Real attacks may be faster using dictionary methods or slower depending on the target system's security measures.</p>
                    </div>
                  </div>
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-2">Should I use this for business passwords?</h4>
                      <p className="text-gray-600 text-sm">Yes, our checker follows industry security standards and can help evaluate passwords for business use. However, always follow your organization's specific password policies and security requirements.</p>
                    </div>

                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-2">What is password entropy?</h4>
                      <p className="text-gray-600 text-sm">Entropy measures the randomness and unpredictability of your password in bits. Higher entropy means more possible combinations, making passwords exponentially harder to crack through brute force.</p>
                    </div>

                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-2">How often should I check my passwords?</h4>
                      <p className="text-gray-600 text-sm">Check passwords when creating new accounts, updating existing passwords, or if you suspect a security breach. Regular password audits help maintain good security hygiene.</p>
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
