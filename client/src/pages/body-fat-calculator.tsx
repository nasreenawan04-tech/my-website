
import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

interface BodyFatResult {
  bodyFatPercentage: number;
  classification: string;
  leanBodyMass: number;
  fatMass: number;
  method: string;
}

const BodyFatCalculator = () => {
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [feet, setFeet] = useState('');
  const [inches, setInches] = useState('');
  const [neck, setNeck] = useState('');
  const [waist, setWaist] = useState('');
  const [hip, setHip] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [unitSystem, setUnitSystem] = useState('metric');
  const [result, setResult] = useState<BodyFatResult | null>(null);

  const calculateBodyFat = () => {
    let weightKg: number;
    let heightCm: number;
    let neckCm: number;
    let waistCm: number;
    let hipCm: number;

    if (unitSystem === 'metric') {
      weightKg = parseFloat(weight);
      heightCm = parseFloat(height);
      neckCm = parseFloat(neck);
      waistCm = parseFloat(waist);
      hipCm = parseFloat(hip);
    } else {
      // Imperial system
      weightKg = parseFloat(weight) * 0.453592; // Convert lbs to kg
      const totalInches = (parseFloat(feet) * 12) + parseFloat(inches);
      heightCm = totalInches * 2.54; // Convert inches to cm
      neckCm = parseFloat(neck) * 2.54; // Convert inches to cm
      waistCm = parseFloat(waist) * 2.54; // Convert inches to cm
      hipCm = parseFloat(hip) * 2.54; // Convert inches to cm
    }

    if (weightKg && heightCm && neckCm && waistCm && gender) {
      let bodyFatPercentage: number;
      
      // US Navy Method
      if (gender === 'male') {
        // Male formula: 495 / (1.0324 - 0.19077 * log10(waist - neck) + 0.15456 * log10(height)) - 450
        const log10WaistNeck = Math.log10(waistCm - neckCm);
        const log10Height = Math.log10(heightCm);
        bodyFatPercentage = 495 / (1.0324 - 0.19077 * log10WaistNeck + 0.15456 * log10Height) - 450;
      } else {
        // Female formula requires hip measurement
        if (!hipCm) {
          return; // Hip measurement is required for females
        }
        // Female formula: 495 / (1.29579 - 0.35004 * log10(waist + hip - neck) + 0.22100 * log10(height)) - 450
        const log10WaistHipNeck = Math.log10(waistCm + hipCm - neckCm);
        const log10Height = Math.log10(heightCm);
        bodyFatPercentage = 495 / (1.29579 - 0.35004 * log10WaistHipNeck + 0.22100 * log10Height) - 450;
      }

      // Ensure the result is within reasonable bounds
      bodyFatPercentage = Math.max(3, Math.min(50, bodyFatPercentage));

      // Classification based on gender and age
      const getClassification = (bf: number, gender: string, age: number) => {
        const ageNum = age || 30; // Default age if not provided
        
        if (gender === 'male') {
          if (ageNum <= 30) {
            if (bf < 8) return 'Essential Fat';
            if (bf < 14) return 'Athletes';
            if (bf < 18) return 'Fitness';
            if (bf < 25) return 'Average';
            return 'Obese';
          } else if (ageNum <= 50) {
            if (bf < 8) return 'Essential Fat';
            if (bf < 17) return 'Athletes';
            if (bf < 21) return 'Fitness';
            if (bf < 28) return 'Average';
            return 'Obese';
          } else {
            if (bf < 8) return 'Essential Fat';
            if (bf < 19) return 'Athletes';
            if (bf < 23) return 'Fitness';
            if (bf < 30) return 'Average';
            return 'Obese';
          }
        } else {
          if (ageNum <= 30) {
            if (bf < 14) return 'Essential Fat';
            if (bf < 21) return 'Athletes';
            if (bf < 25) return 'Fitness';
            if (bf < 32) return 'Average';
            return 'Obese';
          } else if (ageNum <= 50) {
            if (bf < 14) return 'Essential Fat';
            if (bf < 24) return 'Athletes';
            if (bf < 28) return 'Fitness';
            if (bf < 35) return 'Average';
            return 'Obese';
          } else {
            if (bf < 14) return 'Essential Fat';
            if (bf < 26) return 'Athletes';
            if (bf < 30) return 'Fitness';
            if (bf < 37) return 'Average';
            return 'Obese';
          }
        }
      };

      const classification = getClassification(bodyFatPercentage, gender, parseFloat(age));
      const fatMass = (bodyFatPercentage / 100) * weightKg;
      const leanBodyMass = weightKg - fatMass;

      setResult({
        bodyFatPercentage: Math.round(bodyFatPercentage * 10) / 10,
        classification,
        leanBodyMass: Math.round(leanBodyMass * 10) / 10,
        fatMass: Math.round(fatMass * 10) / 10,
        method: 'US Navy Method'
      });
    }
  };

  const resetCalculator = () => {
    setWeight('');
    setHeight('');
    setFeet('');
    setInches('');
    setNeck('');
    setWaist('');
    setHip('');
    setAge('');
    setGender('');
    setUnitSystem('metric');
    setResult(null);
  };

  const getClassificationColor = (classification: string) => {
    switch (classification) {
      case 'Essential Fat':
        return 'text-blue-600';
      case 'Athletes':
        return 'text-green-600';
      case 'Fitness':
        return 'text-emerald-600';
      case 'Average':
        return 'text-yellow-600';
      case 'Obese':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const formatMeasurement = (value: number, unit: string) => {
    if (unitSystem === 'metric') {
      return unit === 'weight' ? `${value} kg` : `${value} cm`;
    } else {
      return unit === 'weight' ? `${(value * 2.20462).toFixed(1)} lbs` : `${(value / 2.54).toFixed(1)} in`;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Helmet>
        <title>Body Fat Calculator - Calculate Body Fat Percentage | US Navy Method | DapsiWow</title>
        <meta name="description" content="Free body fat calculator using the US Navy method. Calculate your body fat percentage, lean body mass, and body composition with accurate circumference measurements. Support for metric and imperial units." />
        <meta name="keywords" content="body fat calculator, body fat percentage calculator, US Navy body fat method, body composition calculator, lean body mass calculator, circumference body fat, fat percentage formula, body fat measurement, fitness calculator, weight loss calculator, muscle mass calculator, health assessment tool" />
        <meta property="og:title" content="Body Fat Calculator - Calculate Body Fat Percentage | US Navy Method | DapsiWow" />
        <meta property="og:description" content="Calculate your body fat percentage using the proven US Navy method. Free, accurate body composition analysis with worldwide unit support." />
        <meta property="og:type" content="website" />
        <meta name="robots" content="index, follow" />
        <meta name="author" content="DapsiWow" />
        <link rel="canonical" href="https://dapsiwow.com/tools/body-fat-calculator" />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            "name": "Body Fat Calculator",
            "description": "Free online body fat calculator using the US Navy method to calculate body fat percentage, lean body mass, and body composition analysis.",
            "url": "https://dapsiwow.com/tools/body-fat-calculator",
            "applicationCategory": "HealthApplication",
            "operatingSystem": "Any",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "USD"
            },
            "featureList": [
              "Calculate body fat percentage using US Navy method",
              "Support for metric and imperial units",
              "Body composition analysis",
              "Lean body mass calculation",
              "Health classification system",
              "Accurate circumference-based measurements"
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
                <span className="text-sm font-medium text-blue-700">Professional Body Composition Analysis</span>
              </div>
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-slate-900 leading-tight">
                Body Fat
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                  Calculator
                </span>
              </h1>
              <p className="text-xl sm:text-2xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
                Calculate your body fat percentage and body composition using the scientifically proven US Navy method
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
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">Body Measurements</h2>
                    <p className="text-gray-600">Enter your measurements for accurate body fat calculation</p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Unit System */}
                    <div className="md:col-span-2 space-y-3">
                      <Label className="text-sm font-semibold text-gray-800 uppercase tracking-wide">Unit System</Label>
                      <RadioGroup 
                        value={unitSystem} 
                        onValueChange={setUnitSystem}
                        className="flex gap-8"
                      >
                        <div className="flex items-center space-x-3">
                          <RadioGroupItem value="metric" id="metric" data-testid="radio-metric" />
                          <Label htmlFor="metric" className="text-base">Metric (kg, cm)</Label>
                        </div>
                        <div className="flex items-center space-x-3">
                          <RadioGroupItem value="imperial" id="imperial" data-testid="radio-imperial" />
                          <Label htmlFor="imperial" className="text-base">Imperial (lbs, in)</Label>
                        </div>
                      </RadioGroup>
                    </div>

                    {/* Gender */}
                    <div className="space-y-3">
                      <Label className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                        Gender *
                      </Label>
                      <Select value={gender} onValueChange={setGender}>
                        <SelectTrigger className="h-14 border-2 border-gray-200 rounded-xl text-lg" data-testid="select-gender">
                          <SelectValue placeholder="Select gender" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="male">Male</SelectItem>
                          <SelectItem value="female">Female</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

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
                        className="h-14 text-lg border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-blue-500"
                        placeholder="30"
                        min="15"
                        max="120"
                        data-testid="input-age"
                      />
                    </div>

                    {/* Weight */}
                    <div className="space-y-3">
                      <Label htmlFor="weight" className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                        Weight {unitSystem === 'metric' ? '(kg)' : '(lbs)'} *
                      </Label>
                      <Input
                        id="weight"
                        type="number"
                        value={weight}
                        onChange={(e) => setWeight(e.target.value)}
                        className="h-14 text-lg border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-blue-500"
                        placeholder={unitSystem === 'metric' ? "70" : "154"}
                        min="0"
                        step="0.1"
                        data-testid="input-weight"
                      />
                    </div>

                    {/* Height */}
                    <div className="space-y-3">
                      <Label className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                        Height {unitSystem === 'metric' ? '(cm)' : '(ft/in)'} *
                      </Label>
                      {unitSystem === 'metric' ? (
                        <Input
                          type="number"
                          value={height}
                          onChange={(e) => setHeight(e.target.value)}
                          className="h-14 text-lg border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-blue-500"
                          placeholder="175"
                          min="0"
                          step="0.1"
                          data-testid="input-height"
                        />
                      ) : (
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <Label htmlFor="feet" className="text-xs text-gray-500">Feet</Label>
                            <Input
                              id="feet"
                              type="number"
                              value={feet}
                              onChange={(e) => setFeet(e.target.value)}
                              className="h-14 text-lg border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-blue-500"
                              placeholder="5"
                              min="0"
                              max="8"
                              data-testid="input-feet"
                            />
                          </div>
                          <div>
                            <Label htmlFor="inches" className="text-xs text-gray-500">Inches</Label>
                            <Input
                              id="inches"
                              type="number"
                              value={inches}
                              onChange={(e) => setInches(e.target.value)}
                              className="h-14 text-lg border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-blue-500"
                              placeholder="9"
                              min="0"
                              max="11"
                              data-testid="input-inches"
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Neck */}
                    <div className="space-y-3">
                      <Label htmlFor="neck" className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                        Neck Circumference {unitSystem === 'metric' ? '(cm)' : '(inches)'} *
                      </Label>
                      <Input
                        id="neck"
                        type="number"
                        value={neck}
                        onChange={(e) => setNeck(e.target.value)}
                        className="h-14 text-lg border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-blue-500"
                        placeholder={unitSystem === 'metric' ? "38" : "15"}
                        min="0"
                        step="0.1"
                        data-testid="input-neck"
                      />
                      <p className="text-xs text-gray-500">Measure around the neck, just below the Adam's apple</p>
                    </div>

                    {/* Waist */}
                    <div className="space-y-3">
                      <Label htmlFor="waist" className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                        Waist Circumference {unitSystem === 'metric' ? '(cm)' : '(inches)'} *
                      </Label>
                      <Input
                        id="waist"
                        type="number"
                        value={waist}
                        onChange={(e) => setWaist(e.target.value)}
                        className="h-14 text-lg border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-blue-500"
                        placeholder={unitSystem === 'metric' ? "85" : "33.5"}
                        min="0"
                        step="0.1"
                        data-testid="input-waist"
                      />
                      <p className="text-xs text-gray-500">
                        {gender === 'male' 
                          ? 'Measure at the navel (belly button)' 
                          : 'Measure at the narrowest point, usually just above the navel'
                        }
                      </p>
                    </div>

                    {/* Hip (for females only) */}
                    {gender === 'female' && (
                      <div className="space-y-3">
                        <Label htmlFor="hip" className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                          Hip Circumference {unitSystem === 'metric' ? '(cm)' : '(inches)'} *
                        </Label>
                        <Input
                          id="hip"
                          type="number"
                          value={hip}
                          onChange={(e) => setHip(e.target.value)}
                          className="h-14 text-lg border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-blue-500"
                          placeholder={unitSystem === 'metric' ? "95" : "37.4"}
                          min="0"
                          step="0.1"
                          data-testid="input-hip"
                        />
                        <p className="text-xs text-gray-500">Measure at the widest point of the hips</p>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-4 pt-6">
                    <Button
                      onClick={calculateBodyFat}
                      className="flex-1 h-14 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold text-lg rounded-xl shadow-lg transform transition-all duration-200 hover:scale-105"
                      data-testid="button-calculate"
                    >
                      Calculate Body Fat
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
                <div className="bg-gradient-to-br from-gray-50 to-blue-50 p-8 lg:p-12">
                  <h2 className="text-2xl font-bold text-gray-900 mb-8">Results</h2>
                  
                  {result ? (
                    <div className="space-y-6" data-testid="body-fat-results">
                      {/* Body Fat Percentage Highlight */}
                      <div className="bg-white rounded-2xl p-6 shadow-lg border border-blue-100">
                        <div className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-2">Body Fat Percentage</div>
                        <div className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 mb-2" data-testid="text-body-fat">
                          {result.bodyFatPercentage}%
                        </div>
                        <div className={`text-lg font-semibold ${getClassificationColor(result.classification)}`} data-testid="text-classification">
                          {result.classification}
                        </div>
                      </div>

                      {/* Body Composition Breakdown */}
                      <div className="space-y-4">
                        <div className="bg-white rounded-xl p-4 shadow-sm">
                          <div className="flex justify-between items-center">
                            <span className="font-medium text-gray-700">Lean Body Mass</span>
                            <span className="font-bold text-gray-900" data-testid="text-lean-mass">
                              {formatMeasurement(result.leanBodyMass, 'weight')}
                            </span>
                          </div>
                        </div>
                        <div className="bg-white rounded-xl p-4 shadow-sm">
                          <div className="flex justify-between items-center">
                            <span className="font-medium text-gray-700">Fat Mass</span>
                            <span className="font-bold text-orange-600" data-testid="text-fat-mass">
                              {formatMeasurement(result.fatMass, 'weight')}
                            </span>
                          </div>
                        </div>
                        <div className="bg-white rounded-xl p-4 shadow-sm">
                          <div className="flex justify-between items-center">
                            <span className="font-medium text-gray-700">Method Used</span>
                            <span className="font-bold text-gray-900">
                              {result.method}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Healthy Ranges */}
                      <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
                        <h4 className="font-bold text-green-800 mb-4 text-lg">Healthy Body Fat Ranges</h4>
                        <div className="space-y-3">
                          {gender === 'male' ? (
                            <>
                              <div className="flex justify-between items-center">
                                <span className="text-green-700 font-medium">Athletes:</span>
                                <span className="text-green-800 font-bold">6-13%</span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-green-700 font-medium">Fitness:</span>
                                <span className="text-green-800 font-bold">14-17%</span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-green-700 font-medium">Average:</span>
                                <span className="text-yellow-600 font-bold">18-24%</span>
                              </div>
                            </>
                          ) : (
                            <>
                              <div className="flex justify-between items-center">
                                <span className="text-green-700 font-medium">Athletes:</span>
                                <span className="text-green-800 font-bold">16-20%</span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-green-700 font-medium">Fitness:</span>
                                <span className="text-green-800 font-bold">21-24%</span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-green-700 font-medium">Average:</span>
                                <span className="text-yellow-600 font-bold">25-31%</span>
                              </div>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Tips */}
                      <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                        <h4 className="font-semibold text-blue-800 mb-2">Measurement Tips</h4>
                        <ul className="text-sm text-blue-700 space-y-1">
                          <li>• Measure in the morning before eating</li>
                          <li>• Use a flexible measuring tape</li>
                          <li>• Keep the tape level and snug but not tight</li>
                          <li>• Take measurements 2-3 times for accuracy</li>
                        </ul>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-16" data-testid="no-results">
                      <div className="w-20 h-20 bg-gray-200 rounded-full mx-auto mb-6 flex items-center justify-center">
                        <div className="text-3xl font-bold text-gray-400">%</div>
                      </div>
                      <p className="text-gray-500 text-lg">Enter your measurements to calculate body fat percentage</p>
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
                <h3 className="text-2xl font-bold text-gray-900 mb-6">What is Body Fat Percentage?</h3>
                <div className="space-y-4 text-gray-600">
                  <p>
                    Body fat percentage represents the proportion of your total body weight that consists of fat tissue, 
                    compared to lean mass (muscle, bone, organs, and water). Unlike BMI calculators that only consider 
                    height and weight, a body fat calculator provides a more accurate assessment of your body composition 
                    and overall health status.
                  </p>
                  <p>
                    Our body fat percentage calculator uses the scientifically validated US Navy method, which calculates 
                    body fat using circumference measurements. This body fat formula is widely trusted by fitness 
                    professionals, military personnel, and health experts because it's non-invasive, cost-effective, 
                    and provides reliable results for body composition analysis.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">How to Use the Body Fat Calculator</h3>
                <div className="space-y-4 text-gray-600">
                  <p>
                    The US Navy body fat formula requires specific circumference measurements that are easy to take 
                    at home with a flexible measuring tape. For men, you need neck and waist measurements, while 
                    women additionally need hip measurements for accurate calculation.
                  </p>
                  <ul className="space-y-2 list-disc list-inside">
                    <li>Select your preferred unit system (metric or imperial)</li>
                    <li>Choose your gender and enter your age (optional)</li>
                    <li>Input your weight and height measurements</li>
                    <li>Take and enter your neck, waist, and hip circumferences</li>
                    <li>Click calculate to get your body fat percentage instantly</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Benefits of Body Fat Calculation</h3>
                <div className="space-y-3 text-gray-600">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>More accurate health assessment than BMI alone</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Track fitness progress and muscle building results</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Better understanding of cardiovascular disease risk</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Set realistic weight loss and muscle gain goals</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Monitor body composition changes over time</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Accurate Measurement Guidelines</h3>
                <div className="space-y-3 text-gray-600">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Measure in the morning before eating or drinking</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Use a flexible measuring tape, not a rigid ruler</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Keep the tape level and snug but not compressed</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Take measurements 2-3 times and use the average</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Have someone assist with measurements for better accuracy</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Additional SEO Content Sections */}
          <div className="mt-12 space-y-8">
            {/* Understanding Body Fat Classifications */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-8">Understanding Body Fat Classifications</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <h4 className="text-xl font-semibold text-gray-800">Men's Body Fat Ranges</h4>
                    <div className="space-y-3">
                      <div className="bg-blue-50 rounded-lg p-4">
                        <h5 className="font-semibold text-blue-800 mb-2">Essential Fat (2-5%)</h5>
                        <p className="text-blue-700 text-sm">Minimum fat required for basic physical and physiological health. Athletes only.</p>
                      </div>
                      <div className="bg-green-50 rounded-lg p-4">
                        <h5 className="font-semibold text-green-800 mb-2">Athletes (6-13%)</h5>
                        <p className="text-green-700 text-sm">Typical for competitive athletes and fitness enthusiasts with excellent muscle definition.</p>
                      </div>
                      <div className="bg-emerald-50 rounded-lg p-4">
                        <h5 className="font-semibold text-emerald-800 mb-2">Fitness (14-17%)</h5>
                        <p className="text-emerald-700 text-sm">Lean and healthy range for active individuals with good muscle tone.</p>
                      </div>
                      <div className="bg-yellow-50 rounded-lg p-4">
                        <h5 className="font-semibold text-yellow-800 mb-2">Average (18-24%)</h5>
                        <p className="text-yellow-700 text-sm">Healthy range for general population with moderate fitness levels.</p>
                      </div>
                      <div className="bg-red-50 rounded-lg p-4">
                        <h5 className="font-semibold text-red-800 mb-2">Obese (25%+)</h5>
                        <p className="text-red-700 text-sm">Higher risk for health complications. Consider consultation with healthcare provider.</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h4 className="text-xl font-semibold text-gray-800">Women's Body Fat Ranges</h4>
                    <div className="space-y-3">
                      <div className="bg-blue-50 rounded-lg p-4">
                        <h5 className="font-semibold text-blue-800 mb-2">Essential Fat (10-13%)</h5>
                        <p className="text-blue-700 text-sm">Minimum fat required for basic physical and physiological health. Athletes only.</p>
                      </div>
                      <div className="bg-green-50 rounded-lg p-4">
                        <h5 className="font-semibold text-green-800 mb-2">Athletes (14-20%)</h5>
                        <p className="text-green-700 text-sm">Typical for competitive female athletes with excellent muscle definition.</p>
                      </div>
                      <div className="bg-emerald-50 rounded-lg p-4">
                        <h5 className="font-semibold text-emerald-800 mb-2">Fitness (21-24%)</h5>
                        <p className="text-emerald-700 text-sm">Lean and healthy range for active women with good muscle tone.</p>
                      </div>
                      <div className="bg-yellow-50 rounded-lg p-4">
                        <h5 className="font-semibold text-yellow-800 mb-2">Average (25-31%)</h5>
                        <p className="text-yellow-700 text-sm">Healthy range for general female population with moderate fitness levels.</p>
                      </div>
                      <div className="bg-red-50 rounded-lg p-4">
                        <h5 className="font-semibold text-red-800 mb-2">Obese (32%+)</h5>
                        <p className="text-red-700 text-sm">Higher risk for health complications. Consider consultation with healthcare provider.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Body Fat Measurement Methods Comparison */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Body Fat Measurement Methods Comparison</h3>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg">
                        <th className="text-left py-4 px-6 font-bold text-gray-900 rounded-l-lg">Method</th>
                        <th className="text-left py-4 px-6 font-bold text-gray-900">Accuracy</th>
                        <th className="text-left py-4 px-6 font-bold text-gray-900">Cost</th>
                        <th className="text-left py-4 px-6 font-bold text-gray-900">Convenience</th>
                        <th className="text-left py-4 px-6 font-bold text-gray-900 rounded-r-lg">Equipment</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      <tr className="bg-blue-50 hover:bg-blue-100 transition-colors">
                        <td className="py-4 px-6 font-semibold">US Navy Method (Our Calculator)</td>
                        <td className="py-4 px-6 text-gray-700">±3-4%</td>
                        <td className="py-4 px-6 text-green-600 font-medium">Free</td>
                        <td className="py-4 px-6 text-green-600 font-medium">Very High</td>
                        <td className="py-4 px-6 text-gray-700">Measuring tape only</td>
                      </tr>
                      <tr className="hover:bg-gray-50 transition-colors">
                        <td className="py-4 px-6 font-medium">DEXA Scan</td>
                        <td className="py-4 px-6 text-green-600 font-medium">±1-2%</td>
                        <td className="py-4 px-6 text-red-600">$100-300</td>
                        <td className="py-4 px-6 text-yellow-600">Medium</td>
                        <td className="py-4 px-6 text-gray-700">Medical facility</td>
                      </tr>
                      <tr className="hover:bg-gray-50 transition-colors">
                        <td className="py-4 px-6 font-medium">Bioelectrical Impedance</td>
                        <td className="py-4 px-6 text-yellow-600">±4-6%</td>
                        <td className="py-4 px-6 text-yellow-600">$50-200</td>
                        <td className="py-4 px-6 text-green-600 font-medium">High</td>
                        <td className="py-4 px-6 text-gray-700">BIA scale or device</td>
                      </tr>
                      <tr className="hover:bg-gray-50 transition-colors">
                        <td className="py-4 px-6 font-medium">Skinfold Calipers</td>
                        <td className="py-4 px-6 text-yellow-600">±3-5%</td>
                        <td className="py-4 px-6 text-green-600 font-medium">$10-50</td>
                        <td className="py-4 px-6 text-yellow-600">Medium</td>
                        <td className="py-4 px-6 text-gray-700">Calipers + training</td>
                      </tr>
                      <tr className="hover:bg-gray-50 transition-colors">
                        <td className="py-4 px-6 font-medium">Hydrostatic Weighing</td>
                        <td className="py-4 px-6 text-green-600 font-medium">±1-3%</td>
                        <td className="py-4 px-6 text-red-600">$75-150</td>
                        <td className="py-4 px-6 text-red-600">Low</td>
                        <td className="py-4 px-6 text-gray-700">Specialized tank</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Health Implications and Applications */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
                <CardContent className="p-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">Health Implications of Body Fat</h3>
                  <div className="space-y-4 text-gray-600">
                    <div className="border-l-4 border-red-500 pl-4">
                      <h4 className="font-semibold text-red-800 mb-2">High Body Fat Risks</h4>
                      <p className="text-sm">Increased cardiovascular disease risk, type 2 diabetes, sleep apnea, certain cancers, and joint problems due to excess weight.</p>
                    </div>
                    <div className="border-l-4 border-blue-500 pl-4">
                      <h4 className="font-semibold text-blue-800 mb-2">Low Body Fat Risks</h4>
                      <p className="text-sm">Hormonal imbalances, reduced immune function, loss of menstruation in women, and increased injury risk in athletes.</p>
                    </div>
                    <div className="border-l-4 border-green-500 pl-4">
                      <h4 className="font-semibold text-green-800 mb-2">Optimal Range Benefits</h4>
                      <p className="text-sm">Better insulin sensitivity, improved cardiovascular health, enhanced athletic performance, and optimal hormone production.</p>
                    </div>
                    <div className="border-l-4 border-purple-500 pl-4">
                      <h4 className="font-semibold text-purple-800 mb-2">Age Considerations</h4>
                      <p className="text-sm">Healthy body fat ranges increase slightly with age due to natural metabolic changes and muscle mass decline.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
                <CardContent className="p-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">Applications and Use Cases</h3>
                  <div className="space-y-4 text-gray-600">
                    <div className="bg-blue-50 rounded-lg p-4">
                      <h4 className="font-semibold text-blue-800 mb-2">Fitness Tracking</h4>
                      <p className="text-sm text-blue-700">Monitor progress during weight loss programs, muscle building phases, and body recomposition goals.</p>
                    </div>
                    <div className="bg-green-50 rounded-lg p-4">
                      <h4 className="font-semibold text-green-800 mb-2">Athletic Performance</h4>
                      <p className="text-sm text-green-700">Optimize body composition for specific sports, weight classes, and competitive performance standards.</p>
                    </div>
                    <div className="bg-orange-50 rounded-lg p-4">
                      <h4 className="font-semibold text-orange-800 mb-2">Health Assessment</h4>
                      <p className="text-sm text-orange-700">Complement BMI calculations for more accurate health risk evaluation and medical consultations.</p>
                    </div>
                    <div className="bg-purple-50 rounded-lg p-4">
                      <h4 className="font-semibold text-purple-800 mb-2">Military & Professional</h4>
                      <p className="text-sm text-purple-700">Meet military fitness standards, law enforcement requirements, and professional health guidelines.</p>
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
                      <h4 className="font-semibold text-gray-800 mb-2">How accurate is the US Navy body fat calculator?</h4>
                      <p className="text-gray-600 text-sm">The US Navy method has an accuracy of ±3-4% when measurements are taken correctly. While not as precise as DEXA scans, it's significantly more accessible and cost-effective for regular monitoring.</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">How often should I calculate my body fat percentage?</h4>
                      <p className="text-gray-600 text-sm">For fitness tracking, measure monthly. Body fat changes occur gradually, so more frequent measurements may not show meaningful differences and could lead to unnecessary frustration.</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">What's a healthy body fat percentage range?</h4>
                      <p className="text-gray-600 text-sm">For men: 10-20% is considered healthy, with athletes typically at 6-13%. For women: 16-24% is healthy, with athletes at 14-20%. These ranges vary by age and individual factors.</p>
                    </div>
                  </div>
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">Can I use this calculator if I'm very muscular?</h4>
                      <p className="text-gray-600 text-sm">The US Navy method may be less accurate for very muscular individuals or those with atypical body fat distribution. Consider professional assessment methods like DEXA scans for more precise measurements.</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">Is body fat percentage more important than BMI?</h4>
                      <p className="text-gray-600 text-sm">Body fat percentage provides better insight into health and fitness than BMI alone, as it distinguishes between muscle and fat mass. However, both metrics together give a more complete picture.</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">Why do women need hip measurements?</h4>
                      <p className="text-gray-600 text-sm">Women typically store more fat in the hip and thigh areas compared to men. The US Navy formula accounts for this difference by including hip measurements in the female calculation.</p>
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

export default BodyFatCalculator;
