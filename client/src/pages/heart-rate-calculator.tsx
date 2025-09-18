
import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface HeartRateResult {
  maxHeartRate: number;
  restingHeartRate: number;
  zones: {
    zone1: { min: number; max: number; name: string; description: string };
    zone2: { min: number; max: number; name: string; description: string };
    zone3: { min: number; max: number; name: string; description: string };
    zone4: { min: number; max: number; name: string; description: string };
    zone5: { min: number; max: number; name: string; description: string };
  };
  targetHeartRates: {
    fatBurn: { min: number; max: number };
    cardio: { min: number; max: number };
    peak: { min: number; max: number };
  };
  formula: string;
}

export default function HeartRateCalculator() {
  const [age, setAge] = useState('30');
  const [restingHeartRate, setRestingHeartRate] = useState('70');
  const [gender, setGender] = useState('male');
  const [fitnessLevel, setFitnessLevel] = useState('intermediate');
  const [formula, setFormula] = useState('tanaka');
  const [result, setResult] = useState<HeartRateResult | null>(null);

  const calculateHeartRate = () => {
    const ageNum = parseFloat(age);
    const restingHR = parseFloat(restingHeartRate) || 70;

    if (ageNum && ageNum >= 15 && ageNum <= 100) {
      let maxHR: number;
      let formulaName: string;

      // Calculate maximum heart rate based on selected formula
      switch (formula) {
        case 'tanaka':
          maxHR = 208 - (0.7 * ageNum);
          formulaName = 'Tanaka Formula';
          break;
        case 'gulati':
          if (gender === 'female') {
            maxHR = 206 - (0.88 * ageNum);
            formulaName = 'Gulati Formula (Women)';
          } else {
            maxHR = 220 - ageNum;
            formulaName = 'Traditional Formula';
          }
          break;
        case 'nes':
          maxHR = 211 - (0.64 * ageNum);
          formulaName = 'Nes Formula';
          break;
        default: // traditional
          maxHR = 220 - ageNum;
          formulaName = 'Traditional Formula';
      }

      // Calculate heart rate zones using Karvonen method
      const heartRateReserve = maxHR - restingHR;

      const zones = {
        zone1: {
          min: Math.round(restingHR + (heartRateReserve * 0.50)),
          max: Math.round(restingHR + (heartRateReserve * 0.60)),
          name: 'Active Recovery',
          description: 'Light activity, fat burning'
        },
        zone2: {
          min: Math.round(restingHR + (heartRateReserve * 0.60)),
          max: Math.round(restingHR + (heartRateReserve * 0.70)),
          name: 'Aerobic Base',
          description: 'Base fitness, fat burning'
        },
        zone3: {
          min: Math.round(restingHR + (heartRateReserve * 0.70)),
          max: Math.round(restingHR + (heartRateReserve * 0.80)),
          name: 'Aerobic Fitness',
          description: 'Cardio fitness improvement'
        },
        zone4: {
          min: Math.round(restingHR + (heartRateReserve * 0.80)),
          max: Math.round(restingHR + (heartRateReserve * 0.90)),
          name: 'Lactate Threshold',
          description: 'High intensity training'
        },
        zone5: {
          min: Math.round(restingHR + (heartRateReserve * 0.90)),
          max: Math.round(maxHR),
          name: 'VO2 Max',
          description: 'Maximum effort training'
        }
      };

      const targetHeartRates = {
        fatBurn: {
          min: Math.round(maxHR * 0.57),
          max: Math.round(maxHR * 0.67)
        },
        cardio: {
          min: Math.round(maxHR * 0.64),
          max: Math.round(maxHR * 0.76)
        },
        peak: {
          min: Math.round(maxHR * 0.77),
          max: Math.round(maxHR * 0.93)
        }
      };

      setResult({
        maxHeartRate: Math.round(maxHR),
        restingHeartRate: restingHR,
        zones,
        targetHeartRates,
        formula: formulaName
      });
    }
  };

  const resetCalculator = () => {
    setAge('30');
    setRestingHeartRate('70');
    setGender('male');
    setFitnessLevel('intermediate');
    setFormula('tanaka');
    setResult(null);
  };

  const getZoneColor = (zoneNumber: number) => {
    const colors = {
      1: 'text-gray-600',
      2: 'text-blue-600',
      3: 'text-green-600',
      4: 'text-orange-600',
      5: 'text-red-600'
    };
    return colors[zoneNumber as keyof typeof colors] || 'text-gray-600';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Helmet>
        <title>Heart Rate Calculator - Target Heart Rate Zones & Training | DapsiWow</title>
        <meta name="description" content="Free heart rate calculator to determine target heart rate zones for optimal training, fat burning, and cardiovascular fitness. Calculate maximum heart rate using multiple scientific formulas." />
        <meta name="keywords" content="heart rate calculator, target heart rate zones, maximum heart rate calculator, cardio training zones, fat burning heart rate, fitness heart rate, training heart rate calculator, Karvonen formula, heart rate training" />
        <meta property="og:title" content="Heart Rate Calculator - Target Heart Rate Zones & Training | DapsiWow" />
        <meta property="og:description" content="Calculate your target heart rate zones for optimal training, fat burning, and cardiovascular fitness. Free heart rate calculator with multiple scientific formulas." />
        <meta property="og:type" content="website" />
        <meta name="robots" content="index, follow" />
        <meta name="author" content="DapsiWow" />
        <link rel="canonical" href="https://dapsiwow.com/tools/heart-rate-calculator" />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            "name": "Heart Rate Calculator",
            "description": "Free online heart rate calculator to determine target heart rate zones for optimal training, fat burning, and cardiovascular fitness. Calculate maximum heart rate using multiple scientific formulas including Tanaka, Gulati, and Nes formulas.",
            "url": "https://dapsiwow.com/tools/heart-rate-calculator",
            "applicationCategory": "HealthApplication",
            "operatingSystem": "Any",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "USD"
            },
            "featureList": [
              "Calculate maximum heart rate",
              "Determine training heart rate zones",
              "Multiple scientific formulas",
              "Karvonen method calculations",
              "Fat burning zone calculator",
              "Cardio fitness zone analysis"
            ]
          })}
        </script>
      </Helmet>
      
      <Header />
      
      <main>
        {/* Hero Section */}
        <section className="relative py-12 sm:py-16 md:py-20 lg:py-24 xl:py-28 2xl:py-32 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-red-600/10 to-pink-600/20"></div>
          <div className="relative max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 xl:px-12 text-center">
            <div className="space-y-4 sm:space-y-6 md:space-y-8 lg:space-y-10">
              <div className="inline-flex items-center px-3 py-1.5 sm:px-4 sm:py-2 md:px-5 md:py-2.5 bg-white/80 backdrop-blur-sm rounded-full border border-red-200 text-xs sm:text-sm md:text-base">
                <span className="font-medium text-red-700">Professional Heart Rate Calculator</span>
              </div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl 2xl:text-7xl font-bold text-slate-900 leading-tight tracking-tight">
                <span className="block">Heart Rate</span>
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-pink-600">
                  Calculator
                </span>
              </h1>
              <p className="text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl text-slate-600 max-w-xs sm:max-w-md md:max-w-2xl lg:max-w-4xl xl:max-w-5xl mx-auto leading-relaxed px-2 sm:px-4 md:px-6">
                Calculate your target heart rate zones for optimal training, fat burning, and peak cardiovascular performance
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
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">Heart Rate Configuration</h2>
                    <p className="text-gray-600">Enter your details to calculate accurate heart rate zones</p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Age */}
                    <div className="space-y-3">
                      <Label htmlFor="age" className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                        Age (years)
                      </Label>
                      <Input
                        id="age"
                        type="number"
                        value={age}
                        onChange={(e) => setAge(e.target.value)}
                        className="h-14 border-2 border-gray-200 rounded-xl text-lg focus:border-red-500 focus:ring-red-500"
                        placeholder="30"
                        min="15"
                        max="100"
                        data-testid="input-age"
                      />
                    </div>

                    {/* Resting Heart Rate */}
                    <div className="space-y-3">
                      <Label htmlFor="resting-heart-rate" className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                        Resting Heart Rate (bpm)
                      </Label>
                      <Input
                        id="resting-heart-rate"
                        type="number"
                        value={restingHeartRate}
                        onChange={(e) => setRestingHeartRate(e.target.value)}
                        className="h-14 border-2 border-gray-200 rounded-xl text-lg focus:border-red-500 focus:ring-red-500"
                        placeholder="70"
                        min="40"
                        max="120"
                        data-testid="input-resting-heart-rate"
                      />
                    </div>

                    {/* Gender */}
                    <div className="space-y-3">
                      <Label className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                        Gender
                      </Label>
                      <Select value={gender} onValueChange={setGender}>
                        <SelectTrigger className="h-14 border-2 border-gray-200 rounded-xl text-lg" data-testid="select-gender">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="male">Male</SelectItem>
                          <SelectItem value="female">Female</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Fitness Level */}
                    <div className="space-y-3">
                      <Label className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                        Fitness Level
                      </Label>
                      <Select value={fitnessLevel} onValueChange={setFitnessLevel}>
                        <SelectTrigger className="h-14 border-2 border-gray-200 rounded-xl text-lg" data-testid="select-fitness-level">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="beginner">Beginner</SelectItem>
                          <SelectItem value="intermediate">Intermediate</SelectItem>
                          <SelectItem value="advanced">Advanced</SelectItem>
                          <SelectItem value="athlete">Athlete</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Formula Selection */}
                  <div className="space-y-6 border-t pt-8">
                    <h3 className="text-xl font-bold text-gray-900">Calculation Formula</h3>
                    
                    <div className="space-y-4 bg-gray-50 rounded-xl p-6">
                      <Label className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                        Maximum Heart Rate Formula
                      </Label>
                      <Select value={formula} onValueChange={setFormula}>
                        <SelectTrigger className="h-12 border-2 border-gray-200 rounded-lg" data-testid="select-formula">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="traditional">Traditional (220 - age)</SelectItem>
                          <SelectItem value="tanaka">Tanaka (208 - 0.7 × age) - Recommended</SelectItem>
                          <SelectItem value="gulati">Gulati (206 - 0.88 × age) - Women</SelectItem>
                          <SelectItem value="nes">Nes (211 - 0.64 × age) - Athletes</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-sm text-gray-500">
                        Different formulas provide varying accuracy based on age, gender, and fitness level
                      </p>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-4 pt-6">
                    <Button
                      onClick={calculateHeartRate}
                      className="flex-1 h-14 bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white font-semibold text-lg rounded-xl shadow-lg transform transition-all duration-200 hover:scale-105"
                      data-testid="button-calculate"
                    >
                      Calculate Heart Rate Zones
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
                    <div className="space-y-6" data-testid="heart-rate-results">
                      {/* Maximum Heart Rate Highlight */}
                      <div className="bg-white rounded-2xl p-6 shadow-lg border border-red-100">
                        <div className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-2">Maximum Heart Rate</div>
                        <div className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-pink-600" data-testid="text-max-heart-rate">
                          {result.maxHeartRate} bpm
                        </div>
                        <div className="text-sm text-gray-500 mt-2">{result.formula}</div>
                      </div>

                      {/* Training Zones */}
                      <div className="space-y-4">
                        <h3 className="font-semibold text-gray-900 text-lg">Training Heart Rate Zones</h3>
                        {Object.entries(result.zones).map(([key, zone], index) => (
                          <div key={key} className="bg-white rounded-xl p-4 shadow-sm">
                            <div className="flex justify-between items-center mb-2">
                              <span className="font-medium text-gray-900">Zone {index + 1}: {zone.name}</span>
                              <span className={`font-bold ${getZoneColor(index + 1)}`} data-testid={`text-zone-${index + 1}`}>
                                {zone.min} - {zone.max} bpm
                              </span>
                            </div>
                            <p className="text-sm text-gray-600">{zone.description}</p>
                          </div>
                        ))}
                      </div>

                      {/* Activity-Based Zones */}
                      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
                        <h4 className="font-bold text-blue-800 mb-4 text-lg">Activity-Based Target Zones</h4>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-blue-700 font-medium">Fat Burning Zone:</span>
                            <span className="font-bold text-blue-800 text-lg" data-testid="text-fat-burn-zone">
                              {result.targetHeartRates.fatBurn.min} - {result.targetHeartRates.fatBurn.max} bpm
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-blue-700 font-medium">Cardio Zone:</span>
                            <span className="font-bold text-blue-800 text-lg" data-testid="text-cardio-zone">
                              {result.targetHeartRates.cardio.min} - {result.targetHeartRates.cardio.max} bpm
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-blue-700 font-medium">Peak Zone:</span>
                            <span className="font-bold text-blue-800 text-lg" data-testid="text-peak-zone">
                              {result.targetHeartRates.peak.min} - {result.targetHeartRates.peak.max} bpm
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Training Recommendations */}
                      <div className="bg-green-50 rounded-xl p-6 border border-green-200">
                        <h4 className="font-bold text-green-800 mb-4 text-lg">Training Recommendations</h4>
                        <div className="text-sm text-green-700 space-y-2">
                          <p>• Zone 1-2: 70-80% of weekly training</p>
                          <p>• Zone 3: 10-15% of weekly training</p>
                          <p>• Zone 4-5: 5-10% of weekly training</p>
                          <p>• Use a heart rate monitor for accuracy</p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-16" data-testid="no-results">
                      <div className="w-20 h-20 bg-gray-200 rounded-full mx-auto mb-6 flex items-center justify-center">
                        <div className="text-3xl font-bold text-gray-400">♥</div>
                      </div>
                      <p className="text-gray-500 text-lg">Enter your details to calculate heart rate zones</p>
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
                <h3 className="text-2xl font-bold text-gray-900 mb-6">What is Heart Rate Training?</h3>
                <div className="space-y-4 text-gray-600">
                  <p>
                    Heart rate training is a method of exercising based on your heart rate zones to achieve specific 
                    fitness goals. By monitoring your heart rate during exercise, you can ensure you're training at 
                    the right intensity for fat burning, cardiovascular improvement, or athletic performance.
                  </p>
                  <p>
                    Our heart rate calculator uses scientifically proven formulas to determine your maximum heart rate 
                    and training zones. The Karvonen method, which considers your resting heart rate, provides the most 
                    accurate zone calculations for personalized training.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Understanding Heart Rate Zones</h3>
                <div className="space-y-4 text-gray-600">
                  <p>
                    Heart rate zones are ranges that correspond to different exercise intensities and training benefits:
                  </p>
                  <ul className="space-y-2 list-disc list-inside">
                    <li>Zone 1 (50-60%): Active recovery and fat burning</li>
                    <li>Zone 2 (60-70%): Aerobic base building</li>
                    <li>Zone 3 (70-80%): Cardio fitness improvement</li>
                    <li>Zone 4 (80-90%): Lactate threshold training</li>
                    <li>Zone 5 (90-100%): Maximum effort and VO2 max</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Benefits of Heart Rate Training</h3>
                <div className="space-y-3 text-gray-600">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Optimize fat burning efficiency</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Improve cardiovascular fitness safely</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Prevent overtraining and injury</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Track fitness progress objectively</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Maximize training effectiveness</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">How to Use Our Calculator</h3>
                <div className="space-y-3 text-gray-600">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Enter your age and resting heart rate</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Select your gender and fitness level</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Choose the most appropriate formula</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Get personalized training zones</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Use a heart rate monitor during exercise</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Additional SEO Content Sections */}
          <div className="mt-12 space-y-8">
            {/* Maximum Heart Rate Formulas */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Maximum Heart Rate Formulas Explained</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-gray-800">Traditional Formula (220 - Age)</h4>
                    <p className="text-gray-600 text-sm">
                      The most widely known formula, developed in the 1970s. While simple to use, it can be less 
                      accurate for older adults and athletes, with a standard deviation of ±10-12 beats per minute.
                    </p>
                    
                    <h4 className="text-lg font-semibold text-gray-800">Tanaka Formula (208 - 0.7 × Age)</h4>
                    <p className="text-gray-600 text-sm">
                      Developed in 2001 through analysis of over 18,000 subjects. This formula is considered more 
                      accurate than the traditional method, especially for adults over 40 years old.
                    </p>
                  </div>
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-gray-800">Gulati Formula (206 - 0.88 × Age)</h4>
                    <p className="text-gray-600 text-sm">
                      Specifically developed for women based on research showing that women typically have different 
                      heart rate responses to exercise compared to men. More accurate for female athletes and exercisers.
                    </p>
                    
                    <h4 className="text-lg font-semibold text-gray-800">Nes Formula (211 - 0.64 × Age)</h4>
                    <p className="text-gray-600 text-sm">
                      Developed for active individuals and athletes. This formula tends to predict higher maximum heart 
                      rates and may be more suitable for well-trained individuals.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Training Zone Benefits */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
                <CardContent className="p-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">Fat Burning Zone Training</h3>
                  <div className="space-y-4 text-gray-600">
                    <div className="border-l-4 border-yellow-500 pl-4">
                      <h4 className="font-semibold text-gray-800 mb-2">What is the Fat Burning Zone?</h4>
                      <p className="text-sm">The fat burning zone operates at 57-67% of your maximum heart rate, where your body primarily uses fat as fuel rather than carbohydrates.</p>
                    </div>
                    <div className="border-l-4 border-green-500 pl-4">
                      <h4 className="font-semibold text-gray-800 mb-2">Benefits of Fat Burning Zone</h4>
                      <p className="text-sm">Maximizes fat oxidation, improves metabolic efficiency, builds aerobic base, and can be sustained for longer periods without fatigue.</p>
                    </div>
                    <div className="border-l-4 border-blue-500 pl-4">
                      <h4 className="font-semibold text-gray-800 mb-2">Best Activities</h4>
                      <p className="text-sm">Brisk walking, light jogging, cycling at moderate pace, swimming at comfortable intensity, and low-impact aerobics classes.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
                <CardContent className="p-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">High-Intensity Zone Training</h3>
                  <div className="space-y-4 text-gray-600">
                    <div className="border-l-4 border-orange-500 pl-4">
                      <h4 className="font-semibold text-gray-800 mb-2">Lactate Threshold Zone (80-90%)</h4>
                      <p className="text-sm">This zone improves your body's ability to clear lactate and maintain higher intensities. Critical for competitive athletes and advanced fitness enthusiasts.</p>
                    </div>
                    <div className="border-l-4 border-red-500 pl-4">
                      <h4 className="font-semibold text-gray-800 mb-2">VO2 Max Zone (90-100%)</h4>
                      <p className="text-sm">Maximum oxygen uptake zone that improves cardiovascular capacity and peak performance. Should be used sparingly and only by well-conditioned individuals.</p>
                    </div>
                    <div className="border-l-4 border-purple-500 pl-4">
                      <h4 className="font-semibold text-gray-800 mb-2">Training Frequency</h4>
                      <p className="text-sm">High-intensity zones should comprise only 10-20% of total training time to prevent overtraining and allow adequate recovery.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Heart Rate Monitoring Tips */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-8">Heart Rate Monitoring Best Practices</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">Equipment and Accuracy</h4>
                    <ul className="text-gray-600 space-y-2 text-sm">
                      <li>• Use chest strap heart rate monitors for highest accuracy</li>
                      <li>• Wrist-based monitors are convenient but less precise during high intensity</li>
                      <li>• Calibrate your device regularly and ensure proper fit</li>
                      <li>• Consider ECG-based monitors for medical-grade accuracy</li>
                      <li>• Replace battery regularly to maintain consistent readings</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">Training Guidelines</h4>
                    <ul className="text-gray-600 space-y-2 text-sm">
                      <li>• Warm up gradually to reach target zones safely</li>
                      <li>• Allow heart rate to return to resting levels between intervals</li>
                      <li>• Monitor for signs of overtraining or unusual heart rate patterns</li>
                      <li>• Adjust zones based on fitness improvements and age</li>
                      <li>• Consult healthcare providers if you have heart conditions</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Factors Affecting Heart Rate */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
                <CardContent className="p-8">
                  <h3 className="text-xl font-bold text-gray-900 mb-6">Age and Heart Rate</h3>
                  <div className="space-y-4 text-gray-600">
                    <p className="text-sm">
                      Maximum heart rate naturally decreases with age due to changes in the heart muscle and electrical system.
                    </p>
                    <div className="space-y-2">
                      <h4 className="font-semibold text-green-800 text-sm">Age-Related Changes:</h4>
                      <ul className="text-xs space-y-1 list-disc list-inside text-green-700">
                        <li>Decreased maximum heart rate</li>
                        <li>Slower heart rate recovery</li>
                        <li>Reduced cardiac output</li>
                        <li>Increased resting heart rate</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
                <CardContent className="p-8">
                  <h3 className="text-xl font-bold text-gray-900 mb-6">Fitness Level Impact</h3>
                  <div className="space-y-4 text-gray-600">
                    <p className="text-sm">
                      Regular exercise training leads to beneficial adaptations in heart rate response and cardiovascular efficiency.
                    </p>
                    <div className="space-y-2">
                      <h4 className="font-semibold text-blue-800 text-sm">Training Adaptations:</h4>
                      <ul className="text-xs space-y-1 list-disc list-inside text-blue-700">
                        <li>Lower resting heart rate</li>
                        <li>Faster heart rate recovery</li>
                        <li>Higher stroke volume</li>
                        <li>Improved efficiency</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
                <CardContent className="p-8">
                  <h3 className="text-xl font-bold text-gray-900 mb-6">External Factors</h3>
                  <div className="space-y-4 text-gray-600">
                    <p className="text-sm">
                      Various external factors can influence heart rate during exercise and at rest.
                    </p>
                    <div className="space-y-2">
                      <h4 className="font-semibold text-orange-800 text-sm">Influencing Factors:</h4>
                      <ul className="text-xs space-y-1 list-disc list-inside text-orange-700">
                        <li>Temperature and humidity</li>
                        <li>Caffeine and medications</li>
                        <li>Stress and sleep quality</li>
                        <li>Dehydration and nutrition</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Heart Rate Training FAQs */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-8">Frequently Asked Questions about Heart Rate Training</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">How accurate are heart rate zones?</h4>
                      <p className="text-gray-600 text-sm">Heart rate zones provide good general guidelines, but individual variation exists. Laboratory testing can provide more precise zones, while our calculator offers scientifically-based estimates suitable for most people.</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">Should I always train in the fat burning zone to lose weight?</h4>
                      <p className="text-gray-600 text-sm">While the fat burning zone maximizes fat oxidation percentage, higher intensity exercise burns more total calories. A combination of zone training yields the best weight loss results.</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">Can medications affect my heart rate zones?</h4>
                      <p className="text-gray-600 text-sm">Yes, certain medications like beta-blockers can significantly lower heart rate. Consult your doctor about adjusting training zones if you take heart-affecting medications.</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">How often should I recalculate my zones?</h4>
                      <p className="text-gray-600 text-sm">Recalculate your zones annually or when you notice significant fitness improvements. Age-related changes and training adaptations can shift your optimal training ranges.</p>
                    </div>
                  </div>
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">Is it safe to exercise at maximum heart rate?</h4>
                      <p className="text-gray-600 text-sm">Healthy individuals can safely reach maximum heart rate during short intervals, but this should be done progressively and with proper fitness base. Consult a doctor if you have heart conditions.</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">Why does my heart rate vary between different activities?</h4>
                      <p className="text-gray-600 text-sm">Different activities engage varying muscle groups and movement patterns. Running typically produces higher heart rates than cycling at the same perceived effort due to greater muscle mass involvement.</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">What's a normal resting heart rate?</h4>
                      <p className="text-gray-600 text-sm">Normal resting heart rate ranges from 60-100 bpm for adults. Athletes often have resting rates of 40-60 bpm due to training adaptations. Measure upon waking for most accurate readings.</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">Can I use perceived effort instead of heart rate monitors?</h4>
                      <p className="text-gray-600 text-sm">Perceived effort (RPE) is valuable when combined with heart rate training. However, heart rate provides objective data that perceived effort alone cannot match, especially for precise zone training.</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Training Programs by Heart Rate */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Sample Training Programs Using Heart Rate Zones</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-gray-800">Beginner Program (4 weeks)</h4>
                    <div className="bg-green-50 rounded-lg p-4">
                      <h5 className="font-semibold text-green-800 text-sm mb-2">Week 1-2:</h5>
                      <ul className="text-sm text-green-700 space-y-1">
                        <li>• 3 sessions per week in Zone 1-2</li>
                        <li>• 20-30 minutes duration</li>
                        <li>• Focus on building aerobic base</li>
                        <li>• Walking or light jogging</li>
                      </ul>
                    </div>
                    <div className="bg-blue-50 rounded-lg p-4">
                      <h5 className="font-semibold text-blue-800 text-sm mb-2">Week 3-4:</h5>
                      <ul className="text-sm text-blue-700 space-y-1">
                        <li>• 4 sessions per week</li>
                        <li>• 30-40 minutes duration</li>
                        <li>• Add 1 Zone 3 session weekly</li>
                        <li>• Introduce variety in activities</li>
                      </ul>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-gray-800">Intermediate Program (6 weeks)</h4>
                    <div className="bg-orange-50 rounded-lg p-4">
                      <h5 className="font-semibold text-orange-800 text-sm mb-2">Training Distribution:</h5>
                      <ul className="text-sm text-orange-700 space-y-1">
                        <li>• 70% in Zone 1-2 (base building)</li>
                        <li>• 20% in Zone 3 (threshold work)</li>
                        <li>• 10% in Zone 4-5 (high intensity)</li>
                        <li>• 5-6 sessions per week</li>
                      </ul>
                    </div>
                    <div className="bg-purple-50 rounded-lg p-4">
                      <h5 className="font-semibold text-purple-800 text-sm mb-2">Sample Week:</h5>
                      <ul className="text-sm text-purple-700 space-y-1">
                        <li>• Mon: Zone 2 (45 min)</li>
                        <li>• Tue: Zone 4 intervals (30 min)</li>
                        <li>• Wed: Zone 1 recovery (30 min)</li>
                        <li>• Thu: Zone 3 tempo (40 min)</li>
                        <li>• Fri: Rest or Zone 1</li>
                        <li>• Sat: Zone 2 long session (60 min)</li>
                        <li>• Sun: Zone 1 active recovery</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Heart Rate and Health Benefits */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Health Benefits of Heart Rate-Based Exercise</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-gray-800">Cardiovascular Benefits</h4>
                    <div className="space-y-3 text-gray-600">
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-sm">Strengthens heart muscle and improves cardiac output</span>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-sm">Lowers resting heart rate and blood pressure</span>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-sm">Improves circulation and oxygen delivery</span>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-sm">Reduces risk of heart disease and stroke</span>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-gray-800">Metabolic Benefits</h4>
                    <div className="space-y-3 text-gray-600">
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-sm">Enhances fat burning and metabolic efficiency</span>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-sm">Improves insulin sensitivity and glucose control</span>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-sm">Increases mitochondrial density and function</span>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-sm">Supports healthy weight management</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg">
                  <h4 className="font-semibold text-green-800 mb-2">Scientific Evidence</h4>
                  <p className="text-green-700 text-sm">
                    Research consistently shows that heart rate-guided exercise training leads to superior fitness 
                    improvements compared to unstructured exercise. Studies demonstrate 15-25% greater improvements 
                    in VO2 max, cardiac efficiency, and metabolic markers when training is based on heart rate zones 
                    rather than subjective intensity alone.
                  </p>
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
