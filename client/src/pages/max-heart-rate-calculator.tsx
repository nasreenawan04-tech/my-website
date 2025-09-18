
import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface MaxHeartRateResult {
  traditional: number;
  tanaka: number;
  gulati?: number;
  nes: number;
  roppeLynch?: number;
  recommended: number;
  recommendedFormula: string;
  ageGroup: string;
  percentages: {
    fifty: number;
    sixty: number;
    seventy: number;
    eighty: number;
    ninety: number;
  };
}

export default function MaxHeartRateCalculator() {
  const [age, setAge] = useState('30');
  const [gender, setGender] = useState('');
  const [fitnessLevel, setFitnessLevel] = useState('');
  const [result, setResult] = useState<MaxHeartRateResult | null>(null);

  const calculateMaxHeartRate = () => {
    const ageNum = parseFloat(age);

    if (ageNum && ageNum >= 15 && ageNum <= 100) {
      // Calculate using different formulas
      const traditional = 220 - ageNum;
      const tanaka = 208 - (0.7 * ageNum);
      const nes = 211 - (0.64 * ageNum);
      let gulati: number | undefined;
      let roppeLynch: number | undefined;

      // Gender-specific formulas
      if (gender === 'female') {
        gulati = 206 - (0.88 * ageNum);
        roppeLynch = 209 - (0.7 * ageNum);
      }

      // Determine recommended formula based on age, gender, and fitness level
      let recommended: number;
      let recommendedFormula: string;

      if (gender === 'female' && gulati) {
        recommended = gulati;
        recommendedFormula = 'Gulati (Female-specific)';
      } else if (fitnessLevel === 'athlete' || fitnessLevel === 'advanced') {
        recommended = nes;
        recommendedFormula = 'Nes (Active individuals)';
      } else if (ageNum > 40) {
        recommended = tanaka;
        recommendedFormula = 'Tanaka (Age-adjusted)';
      } else {
        recommended = tanaka;
        recommendedFormula = 'Tanaka (Most accurate)';
      }

      // Determine age group
      let ageGroup: string;
      if (ageNum < 25) {
        ageGroup = 'Young Adult';
      } else if (ageNum < 40) {
        ageGroup = 'Adult';
      } else if (ageNum < 55) {
        ageGroup = 'Middle-aged';
      } else {
        ageGroup = 'Older Adult';
      }

      // Calculate percentage zones based on recommended max HR
      const percentages = {
        fifty: Math.round(recommended * 0.50),
        sixty: Math.round(recommended * 0.60),
        seventy: Math.round(recommended * 0.70),
        eighty: Math.round(recommended * 0.80),
        ninety: Math.round(recommended * 0.90)
      };

      setResult({
        traditional: Math.round(traditional),
        tanaka: Math.round(tanaka),
        gulati: gulati ? Math.round(gulati) : undefined,
        nes: Math.round(nes),
        roppeLynch: roppeLynch ? Math.round(roppeLynch) : undefined,
        recommended: Math.round(recommended),
        recommendedFormula,
        ageGroup,
        percentages
      });
    }
  };

  const resetCalculator = () => {
    setAge('30');
    setGender('');
    setFitnessLevel('');
    setResult(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Helmet>
        <title>Max Heart Rate Calculator - Calculate Maximum Heart Rate | DapsiWow</title>
        <meta name="description" content="Free maximum heart rate calculator using multiple scientifically-proven formulas. Calculate your max heart rate for optimal training zones, cardio fitness, and exercise planning with age-specific, gender-specific calculations." />
        <meta name="keywords" content="max heart rate calculator, maximum heart rate formula, heart rate training zones, cardio fitness calculator, age-predicted heart rate, HRmax calculator, training heart rate, fitness heart rate zones, exercise heart rate calculator" />
        <meta property="og:title" content="Max Heart Rate Calculator - Calculate Maximum Heart Rate | DapsiWow" />
        <meta property="og:description" content="Calculate your maximum heart rate using multiple scientific formulas including Tanaka, Gulati, and Nes formulas. Get accurate max heart rate for optimal training." />
        <meta property="og:type" content="website" />
        <meta name="robots" content="index, follow" />
        <meta name="author" content="DapsiWow" />
        <link rel="canonical" href="https://dapsiwow.com/tools/max-heart-rate-calculator" />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            "name": "Max Heart Rate Calculator",
            "description": "Free online maximum heart rate calculator using multiple scientific formulas including Traditional, Tanaka, Gulati, and Nes formulas for accurate heart rate training zone calculations.",
            "url": "https://dapsiwow.com/tools/max-heart-rate-calculator",
            "applicationCategory": "HealthApplication",
            "operatingSystem": "Any",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "USD"
            },
            "featureList": [
              "Multiple scientific formulas for accuracy",
              "Gender-specific calculations",
              "Age group recommendations",
              "Training zone percentages",
              "Fitness level considerations",
              "Instant calculations"
            ]
          })}
        </script>
      </Helmet>
      
      <Header />
      
      <main>
        {/* Hero Section */}
        <section className="relative py-20 sm:py-28 lg:py-32 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-red-600/10 to-pink-600/20"></div>
          <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="space-y-8">
              <div className="inline-flex items-center px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full border border-red-200">
                <span className="text-sm font-medium text-red-700">Professional Max Heart Rate Calculator</span>
              </div>
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-slate-900 leading-tight">
                Maximum Heart Rate
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-pink-600">
                  Calculator
                </span>
              </h1>
              <p className="text-xl sm:text-2xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
                Calculate your maximum heart rate using multiple scientific formulas for optimal training zones and cardiovascular fitness
              </p>
            </div>
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-4 py-16">
          {/* Main Calculator Card */}
          <Card className="bg-white/90 backdrop-blur-sm shadow-2xl border-0 rounded-3xl overflow-hidden">
            <CardContent className="p-0">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-0">
                {/* Input Section */}
                <div className="lg:col-span-2 p-8 lg:p-12 space-y-8">
                  <div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">Personal Information</h2>
                    <p className="text-gray-600">Enter your details to calculate maximum heart rate using scientific formulas</p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Age */}
                    <div className="space-y-3">
                      <Label htmlFor="age" className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                        Age (Years)
                      </Label>
                      <Input
                        id="age"
                        type="number"
                        value={age}
                        onChange={(e) => setAge(e.target.value)}
                        className="h-14 text-lg border-2 border-gray-200 rounded-xl focus:border-red-500 focus:ring-red-500"
                        placeholder="30"
                        min="15"
                        max="100"
                        data-testid="input-age"
                      />
                      <p className="text-sm text-gray-500">
                        Enter your current age (15-100 years)
                      </p>
                    </div>

                    {/* Gender */}
                    <div className="space-y-3">
                      <Label className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                        Gender <span className="text-gray-500 font-normal">(Optional)</span>
                      </Label>
                      <Select value={gender} onValueChange={setGender}>
                        <SelectTrigger className="h-14 border-2 border-gray-200 rounded-xl text-lg" data-testid="select-gender">
                          <SelectValue placeholder="Select gender for accuracy" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="male">Male</SelectItem>
                          <SelectItem value="female">Female</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-sm text-gray-500">
                        Gender helps select the most accurate formula
                      </p>
                    </div>

                    {/* Fitness Level */}
                    <div className="space-y-3 md:col-span-2">
                      <Label className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                        Fitness Level <span className="text-gray-500 font-normal">(Optional)</span>
                      </Label>
                      <Select value={fitnessLevel} onValueChange={setFitnessLevel}>
                        <SelectTrigger className="h-14 border-2 border-gray-200 rounded-xl text-lg" data-testid="select-fitness-level">
                          <SelectValue placeholder="Select your fitness level" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="sedentary">Sedentary - Little to no exercise</SelectItem>
                          <SelectItem value="beginner">Beginner - Light exercise occasionally</SelectItem>
                          <SelectItem value="intermediate">Intermediate - Regular exercise 2-4 times/week</SelectItem>
                          <SelectItem value="advanced">Advanced - Intense exercise 5+ times/week</SelectItem>
                          <SelectItem value="athlete">Athlete - Professional/competitive training</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-sm text-gray-500">
                        Your fitness level helps determine the most appropriate formula
                      </p>
                    </div>
                  </div>

                  {/* Information Box */}
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6">
                    <h3 className="font-bold text-blue-900 mb-3 text-lg">About Maximum Heart Rate</h3>
                    <p className="text-blue-800 mb-4">
                      Maximum heart rate (HRmax) is the highest number of beats per minute your heart can achieve during maximum physical exertion. 
                      It's essential for calculating training zones and optimizing cardiovascular fitness.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <h4 className="font-semibold text-blue-900 mb-2">Key Benefits:</h4>
                        <ul className="text-blue-700 space-y-1 list-disc list-inside">
                          <li>Optimize training intensity</li>
                          <li>Improve cardiovascular fitness</li>
                          <li>Monitor exercise safety</li>
                          <li>Track fitness improvements</li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-semibold text-blue-900 mb-2">Formula Accuracy:</h4>
                        <ul className="text-blue-700 space-y-1 list-disc list-inside">
                          <li>Tanaka: Most accurate for adults</li>
                          <li>Gulati: Best for women</li>
                          <li>Nes: Optimal for athletes</li>
                          <li>Traditional: Quick estimates</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-4 pt-6">
                    <Button
                      onClick={calculateMaxHeartRate}
                      className="flex-1 h-14 bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white font-semibold text-lg rounded-xl shadow-lg transform transition-all duration-200 hover:scale-105"
                      data-testid="button-calculate"
                    >
                      Calculate Max Heart Rate
                    </Button>
                    <Button
                      onClick={resetCalculator}
                      variant="outline"
                      className="h-14 px-8 border-2 border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold text-lg rounded-xl"
                      data-testid="button-reset"
                    >
                      Reset
                    </Button>
                  </div>
                </div>

                {/* Results Section */}
                <div className="bg-gradient-to-br from-gray-50 to-red-50 p-8 lg:p-12">
                  <h2 className="text-2xl font-bold text-gray-900 mb-8">Results</h2>
                  
                  {result ? (
                    <div className="space-y-6" data-testid="max-heart-rate-results">
                      {/* Recommended Max HR Highlight */}
                      <div className="bg-white rounded-2xl p-6 shadow-lg border border-red-100">
                        <div className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-2">Recommended Max HR</div>
                        <div className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-pink-600" data-testid="text-recommended-max-hr">
                          {result.recommended} bpm
                        </div>
                        <div className="mt-2 text-sm text-gray-600">
                          <div>{result.recommendedFormula}</div>
                          <div>Age Group: {result.ageGroup}</div>
                        </div>
                      </div>

                      {/* All Formula Results */}
                      <div className="bg-white rounded-xl p-6 shadow-sm">
                        <h3 className="font-bold text-gray-900 mb-4 text-lg">All Formula Results</h3>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center py-2 border-b border-gray-100">
                            <div>
                              <span className="font-medium text-gray-900">Traditional Formula</span>
                              <div className="text-xs text-gray-500">220 - age</div>
                            </div>
                            <span className="font-bold text-gray-900 text-lg" data-testid="text-traditional-result">
                              {result.traditional} bpm
                            </span>
                          </div>
                          <div className="flex justify-between items-center py-2 border-b border-gray-100">
                            <div>
                              <span className="font-medium text-gray-900">Tanaka Formula</span>
                              <div className="text-xs text-gray-500">208 - (0.7 × age)</div>
                            </div>
                            <span className="font-bold text-gray-900 text-lg" data-testid="text-tanaka-result">
                              {result.tanaka} bpm
                            </span>
                          </div>
                          {result.gulati && (
                            <div className="flex justify-between items-center py-2 border-b border-gray-100">
                              <div>
                                <span className="font-medium text-gray-900">Gulati Formula (Women)</span>
                                <div className="text-xs text-gray-500">206 - (0.88 × age)</div>
                              </div>
                              <span className="font-bold text-gray-900 text-lg" data-testid="text-gulati-result">
                                {result.gulati} bpm
                              </span>
                            </div>
                          )}
                          <div className="flex justify-between items-center py-2 border-b border-gray-100">
                            <div>
                              <span className="font-medium text-gray-900">Nes Formula</span>
                              <div className="text-xs text-gray-500">211 - (0.64 × age)</div>
                            </div>
                            <span className="font-bold text-gray-900 text-lg" data-testid="text-nes-result">
                              {result.nes} bpm
                            </span>
                          </div>
                          {result.roppeLynch && (
                            <div className="flex justify-between items-center py-2">
                              <div>
                                <span className="font-medium text-gray-900">Roppe-Lynch Formula (Women)</span>
                                <div className="text-xs text-gray-500">209 - (0.7 × age)</div>
                              </div>
                              <span className="font-bold text-gray-900 text-lg" data-testid="text-roppe-lynch-result">
                                {result.roppeLynch} bpm
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Training Zone Percentages */}
                      <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
                        <h3 className="font-bold text-green-800 mb-4 text-lg">Training Zone Percentages</h3>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-green-700 font-medium">50% (Very Light)</span>
                            <span className="font-bold text-green-800 text-lg" data-testid="text-fifty-percent">
                              {result.percentages.fifty} bpm
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-green-700 font-medium">60% (Light)</span>
                            <span className="font-bold text-green-800 text-lg" data-testid="text-sixty-percent">
                              {result.percentages.sixty} bpm
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-green-700 font-medium">70% (Moderate)</span>
                            <span className="font-bold text-green-800 text-lg" data-testid="text-seventy-percent">
                              {result.percentages.seventy} bpm
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-green-700 font-medium">80% (Hard)</span>
                            <span className="font-bold text-green-800 text-lg" data-testid="text-eighty-percent">
                              {result.percentages.eighty} bpm
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-green-700 font-medium">90% (Very Hard)</span>
                            <span className="font-bold text-green-800 text-lg" data-testid="text-ninety-percent">
                              {result.percentages.ninety} bpm
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-16" data-testid="no-results">
                      <div className="w-20 h-20 bg-gray-200 rounded-full mx-auto mb-6 flex items-center justify-center">
                        <div className="text-3xl font-bold text-gray-400">♥</div>
                      </div>
                      <p className="text-gray-500 text-lg">Enter your details and calculate to see max heart rate results</p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* SEO Content Section */}
          <div className="mt-16 grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">What is Maximum Heart Rate?</h3>
                <div className="space-y-4 text-gray-600">
                  <p>
                    Maximum heart rate (HRmax) is the highest number of beats per minute (BPM) that your heart can achieve during 
                    maximum physical exertion. It represents the upper limit of your cardiovascular system's capacity and is a 
                    crucial metric for designing effective exercise programs and monitoring training intensity.
                  </p>
                  <p>
                    Understanding your maximum heart rate helps you establish training zones, optimize workout intensity, and 
                    ensure you're exercising safely within your cardiovascular limits. Our calculator uses multiple scientifically-proven 
                    formulas to provide the most accurate estimate based on your age, gender, and fitness level.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">How to Calculate Maximum Heart Rate</h3>
                <div className="space-y-4 text-gray-600">
                  <p>
                    Our calculator uses four main formulas for maximum heart rate calculation:
                  </p>
                  <div className="space-y-3">
                    <div className="bg-blue-50 rounded-lg p-3">
                      <div className="font-semibold text-blue-900">Traditional: 220 - age</div>
                      <div className="text-sm text-blue-700">Widely used but less accurate for all populations</div>
                    </div>
                    <div className="bg-green-50 rounded-lg p-3">
                      <div className="font-semibold text-green-900">Tanaka: 208 - (0.7 × age)</div>
                      <div className="text-sm text-green-700">More accurate than traditional, especially for adults</div>
                    </div>
                    <div className="bg-purple-50 rounded-lg p-3">
                      <div className="font-semibold text-purple-900">Gulati: 206 - (0.88 × age)</div>
                      <div className="text-sm text-purple-700">Specifically developed for women</div>
                    </div>
                    <div className="bg-orange-50 rounded-lg p-3">
                      <div className="font-semibold text-orange-900">Nes: 211 - (0.64 × age)</div>
                      <div className="text-sm text-orange-700">Best for active individuals and athletes</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Heart Rate Training Zones</h3>
                <div className="space-y-4 text-gray-600">
                  <p>
                    Training zones based on maximum heart rate percentages help optimize different aspects of fitness:
                  </p>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 bg-gray-400 rounded-full flex-shrink-0"></div>
                      <div>
                        <span className="font-medium">50-60% (Recovery Zone):</span>
                        <span className="text-sm"> Light activity for warm-up and recovery</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 bg-blue-400 rounded-full flex-shrink-0"></div>
                      <div>
                        <span className="font-medium">60-70% (Fat Burn Zone):</span>
                        <span className="text-sm"> Optimal for fat burning and endurance</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 bg-green-400 rounded-full flex-shrink-0"></div>
                      <div>
                        <span className="font-medium">70-80% (Aerobic Zone):</span>
                        <span className="text-sm"> Improves cardiovascular fitness</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 bg-orange-400 rounded-full flex-shrink-0"></div>
                      <div>
                        <span className="font-medium">80-90% (Anaerobic Zone):</span>
                        <span className="text-sm"> High-intensity training for performance</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 bg-red-400 rounded-full flex-shrink-0"></div>
                      <div>
                        <span className="font-medium">90-100% (Neuromuscular Zone):</span>
                        <span className="text-sm"> Maximum effort training</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Benefits of Using Our Calculator</h3>
                <div className="space-y-3 text-gray-600">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Multiple scientific formulas for maximum accuracy</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Gender-specific calculations for better precision</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Fitness level considerations for personalized results</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Training zone percentages for workout planning</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Free to use with instant calculations</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>No registration or personal data required</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Additional SEO Content Sections */}
          <div className="mt-12 space-y-8">
            {/* Formula Comparison Section */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Maximum Heart Rate Formula Comparison</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-gray-800">Formula Accuracy by Population</h4>
                    <div className="space-y-3 text-sm">
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <h5 className="font-semibold text-green-800 mb-2">Most Accurate for Women</h5>
                        <p className="text-green-700">The Gulati formula (206 - 0.88 × age) was specifically developed from a study of over 5,000 women and provides the most accurate results for female athletes and fitness enthusiasts.</p>
                      </div>
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <h5 className="font-semibold text-blue-800 mb-2">Best for General Population</h5>
                        <p className="text-blue-700">The Tanaka formula (208 - 0.7 × age) is considered more accurate than the traditional formula for the general adult population and is widely recommended by fitness professionals.</p>
                      </div>
                      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                        <h5 className="font-semibold text-purple-800 mb-2">Optimal for Athletes</h5>
                        <p className="text-purple-700">The Nes formula (211 - 0.64 × age) tends to be more accurate for highly trained individuals and competitive athletes who typically have higher maximum heart rates.</p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-gray-800">Age-Related Considerations</h4>
                    <div className="space-y-3 text-sm">
                      <div className="border-l-4 border-red-400 pl-4">
                        <h5 className="font-semibold text-gray-800 mb-2">Young Adults (15-25)</h5>
                        <p className="text-gray-600">All formulas tend to be fairly accurate. The traditional formula may slightly underestimate maximum heart rate in this age group.</p>
                      </div>
                      <div className="border-l-4 border-orange-400 pl-4">
                        <h5 className="font-semibold text-gray-800 mb-2">Middle-Aged Adults (26-50)</h5>
                        <p className="text-gray-600">The Tanaka formula shows superior accuracy. Gender-specific formulas like Gulati provide better precision for women in this age range.</p>
                      </div>
                      <div className="border-l-4 border-blue-400 pl-4">
                        <h5 className="font-semibold text-gray-800 mb-2">Older Adults (50+)</h5>
                        <p className="text-gray-600">Age-adjusted formulas become increasingly important. The traditional formula may overestimate maximum heart rate significantly.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Training Applications */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
                <CardContent className="p-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">Training Applications</h3>
                  <div className="space-y-4 text-gray-600">
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4">
                      <h4 className="font-semibold text-blue-800 mb-2">Cardiovascular Training</h4>
                      <p className="text-sm text-blue-700">Use 60-80% of max heart rate for optimal cardiovascular improvements. This zone enhances heart efficiency, stroke volume, and overall endurance capacity.</p>
                    </div>
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4">
                      <h4 className="font-semibold text-green-800 mb-2">Fat Burning</h4>
                      <p className="text-sm text-green-700">The 60-70% zone maximizes fat oxidation while maintaining sustainable exercise intensity. Perfect for weight loss and metabolic health improvements.</p>
                    </div>
                    <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-lg p-4">
                      <h4 className="font-semibold text-orange-800 mb-2">High-Intensity Training</h4>
                      <p className="text-sm text-orange-700">Training at 80-90% develops anaerobic power, lactate threshold, and performance capacity. Use sparingly and with adequate recovery.</p>
                    </div>
                    <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4">
                      <h4 className="font-semibold text-purple-800 mb-2">Recovery Training</h4>
                      <p className="text-sm text-purple-700">Active recovery at 50-60% promotes blood flow, reduces muscle stiffness, and accelerates recovery between intense training sessions.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
                <CardContent className="p-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">Safety Considerations</h3>
                  <div className="space-y-4 text-gray-600">
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <h4 className="font-semibold text-red-800 mb-2">Medical Conditions</h4>
                      <p className="text-sm text-red-700">Consult healthcare providers before starting exercise programs if you have heart conditions, diabetes, or take medications that affect heart rate response.</p>
                    </div>
                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                      <h4 className="font-semibold text-orange-800 mb-2">Medication Effects</h4>
                      <p className="text-sm text-orange-700">Beta-blockers, calcium channel blockers, and some antidepressants can significantly lower heart rate responses. Adjust training zones accordingly.</p>
                    </div>
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <h4 className="font-semibold text-yellow-800 mb-2">Environmental Factors</h4>
                      <p className="text-sm text-yellow-700">Heat, humidity, altitude, and dehydration can all affect heart rate. Monitor perceived exertion alongside heart rate measurements.</p>
                    </div>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h4 className="font-semibold text-blue-800 mb-2">Individual Variation</h4>
                      <p className="text-sm text-blue-700">Maximum heart rate can vary ±10-12 BPM from predictions. Use formulas as guidelines and listen to your body's signals during exercise.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Advanced Topics */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-8">Advanced Maximum Heart Rate Topics</h3>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-gray-800">Heart Rate Variability</h4>
                    <p className="text-gray-600 text-sm">
                      Heart rate variability (HRV) measures the variation in time between heartbeats and indicates autonomic nervous system health. 
                      Higher HRV generally correlates with better cardiovascular fitness and recovery capacity.
                    </p>
                    <div className="space-y-2">
                      <h5 className="font-medium text-gray-800 text-sm">Key Benefits:</h5>
                      <ul className="text-xs text-gray-600 space-y-1 list-disc list-inside">
                        <li>Training readiness assessment</li>
                        <li>Recovery monitoring</li>
                        <li>Stress level evaluation</li>
                        <li>Overtraining prevention</li>
                      </ul>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-gray-800">Resting Heart Rate</h4>
                    <p className="text-gray-600 text-sm">
                      Resting heart rate (RHR) is your heart rate when completely at rest, typically measured upon waking. 
                      It's an excellent indicator of cardiovascular fitness and can be used with maximum heart rate to calculate heart rate reserve.
                    </p>
                    <div className="space-y-2">
                      <h5 className="font-medium text-gray-800 text-sm">Typical Ranges:</h5>
                      <ul className="text-xs text-gray-600 space-y-1">
                        <li>• Adults: 60-100 BPM</li>
                        <li>• Athletes: 40-60 BPM</li>
                        <li>• Highly trained: 30-50 BPM</li>
                      </ul>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-gray-800">Heart Rate Reserve</h4>
                    <p className="text-gray-600 text-sm">
                      Heart rate reserve (HRR) is the difference between maximum and resting heart rate. 
                      The Karvonen formula uses HRR to calculate more personalized training zones that account for individual fitness levels.
                    </p>
                    <div className="bg-blue-50 rounded-lg p-3 mt-3">
                      <div className="font-medium text-blue-800 text-sm mb-1">Karvonen Formula:</div>
                      <div className="text-xs text-blue-700">Target HR = ((Max HR - Resting HR) × %Intensity) + Resting HR</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* FAQ Section */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-8">Frequently Asked Questions</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">How accurate are maximum heart rate formulas?</h4>
                      <p className="text-gray-600 text-sm">Formula accuracy varies by individual, but most provide estimates within ±10-12 BPM. Gender-specific and age-adjusted formulas like Tanaka and Gulati are more accurate than the traditional 220-age formula. For the most precise measurement, consider professional exercise testing.</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">Does fitness level affect maximum heart rate?</h4>
                      <p className="text-gray-600 text-sm">Fitness level doesn't significantly change maximum heart rate, but it does affect how efficiently you reach and sustain high heart rates. Trained athletes often have higher actual max heart rates than predicted by age-based formulas, which is why the Nes formula works better for this population.</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">Can I increase my maximum heart rate?</h4>
                      <p className="text-gray-600 text-sm">Maximum heart rate is primarily determined by age and genetics and cannot be significantly increased through training. However, regular cardiovascular exercise improves your ability to work at higher percentages of your max heart rate for longer periods.</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">Why do women have different maximum heart rates?</h4>
                      <p className="text-gray-600 text-sm">Women typically have smaller hearts and higher resting heart rates than men, but their maximum heart rates decline more slowly with age. The Gulati formula accounts for these physiological differences, providing more accurate estimates for female athletes and fitness enthusiasts.</p>
                    </div>
                  </div>
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">What factors can affect my heart rate during exercise?</h4>
                      <p className="text-gray-600 text-sm">Several factors influence exercise heart rate: temperature, humidity, altitude, hydration status, caffeine intake, stress levels, sleep quality, and medications. These factors can cause heart rate to be higher or lower than expected for a given exercise intensity.</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">Is it safe to exercise at maximum heart rate?</h4>
                      <p className="text-gray-600 text-sm">Healthy individuals can safely reach maximum heart rate during exercise, but this should only be done occasionally and for short periods. Most training should occur at 60-85% of maximum heart rate. Always consult healthcare providers if you have cardiovascular conditions.</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">How often should I test my maximum heart rate?</h4>
                      <p className="text-gray-600 text-sm">Maximum heart rate decreases with age, so recalculate annually or after significant changes in fitness level. Professional testing every 2-3 years provides the most accurate measurements for serious athletes or those with specific performance goals.</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">Should I use heart rate monitors during training?</h4>
                      <p className="text-gray-600 text-sm">Heart rate monitors are valuable tools for maintaining target training zones, tracking progress, and preventing overexertion. They're especially useful for beginners learning to gauge exercise intensity and experienced athletes fine-tuning their training.</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Exercise Types and Heart Rate */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Heart Rate Response by Exercise Type</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-gray-800">Cardio Exercises</h4>
                    <div className="space-y-3">
                      <div className="bg-blue-50 rounded-lg p-3">
                        <h5 className="font-medium text-blue-800 mb-1">Running/Jogging</h5>
                        <p className="text-xs text-blue-700">Typically reaches 70-85% max HR. Easy pace: 60-70%, Tempo: 80-85%, Intervals: 85-95%</p>
                      </div>
                      <div className="bg-green-50 rounded-lg p-3">
                        <h5 className="font-medium text-green-800 mb-1">Cycling</h5>
                        <p className="text-xs text-green-700">Endurance rides: 65-75%, Hill climbs: 75-85%, Sprint intervals: 90-95%</p>
                      </div>
                      <div className="bg-purple-50 rounded-lg p-3">
                        <h5 className="font-medium text-purple-800 mb-1">Swimming</h5>
                        <p className="text-xs text-purple-700">Generally 10-15 BPM lower than land-based activities due to body position and water pressure</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-gray-800">Strength Training</h4>
                    <div className="space-y-3">
                      <div className="bg-orange-50 rounded-lg p-3">
                        <h5 className="font-medium text-orange-800 mb-1">Heavy Lifting</h5>
                        <p className="text-xs text-orange-700">Moderate increases (60-70% max HR) with brief spikes during maximum effort sets</p>
                      </div>
                      <div className="bg-red-50 rounded-lg p-3">
                        <h5 className="font-medium text-red-800 mb-1">Circuit Training</h5>
                        <p className="text-xs text-red-700">Sustained elevation (70-80% max HR) combining strength and cardiovascular demands</p>
                      </div>
                      <div className="bg-yellow-50 rounded-lg p-3">
                        <h5 className="font-medium text-yellow-800 mb-1">High-Intensity Intervals</h5>
                        <p className="text-xs text-yellow-700">Alternates between 50-60% (rest) and 85-95% (work) intervals</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-gray-800">Low-Impact Activities</h4>
                    <div className="space-y-3">
                      <div className="bg-teal-50 rounded-lg p-3">
                        <h5 className="font-medium text-teal-800 mb-1">Walking</h5>
                        <p className="text-xs text-teal-700">Leisurely: 40-50%, Brisk: 50-60%, Power walking: 60-70%</p>
                      </div>
                      <div className="bg-indigo-50 rounded-lg p-3">
                        <h5 className="font-medium text-indigo-800 mb-1">Yoga/Pilates</h5>
                        <p className="text-xs text-indigo-700">Generally 40-60% max HR, with brief increases during challenging poses</p>
                      </div>
                      <div className="bg-pink-50 rounded-lg p-3">
                        <h5 className="font-medium text-pink-800 mb-1">Elliptical/Rowing</h5>
                        <p className="text-xs text-pink-700">Steady state: 60-75%, Intervals: 80-90%, Recovery: 50-60%</p>
                      </div>
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
