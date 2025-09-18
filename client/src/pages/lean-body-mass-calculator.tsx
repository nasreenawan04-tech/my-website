
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

interface LBMResult {
  boer: number;
  james: number;
  hume: number;
  average: number;
  bodyFatMass: number;
  bodyFatPercentage: number;
  leanPercentage: number;
  recommendations: {
    proteinIntake: { min: number; max: number };
    strengthTraining: string;
    cardioRecommendation: string;
  };
}

const LeanBodyMassCalculator = () => {
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [feet, setFeet] = useState('');
  const [inches, setInches] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [bodyFatPercentage, setBodyFatPercentage] = useState('');
  const [unitSystem, setUnitSystem] = useState('metric');
  const [calculationMethod, setCalculationMethod] = useState('formulas');
  const [result, setResult] = useState<LBMResult | null>(null);

  const calculateLBM = () => {
    let weightKg: number;
    let heightCm: number;

    if (unitSystem === 'metric') {
      weightKg = parseFloat(weight);
      heightCm = parseFloat(height);
    } else {
      // Imperial system
      weightKg = parseFloat(weight) * 0.453592; // Convert lbs to kg
      const totalInches = (parseFloat(feet) * 12) + parseFloat(inches);
      heightCm = totalInches * 2.54; // Convert inches to cm
    }

    const ageYears = parseFloat(age);

    if (weightKg && heightCm && gender) {
      let boer: number, james: number, hume: number;
      
      // Boer Formula
      if (gender === 'male') {
        boer = (0.407 * weightKg) + (0.267 * heightCm) - 19.2;
      } else {
        boer = (0.252 * weightKg) + (0.473 * heightCm) - 48.3;
      }

      // James Formula
      if (gender === 'male') {
        james = (1.10 * weightKg) - 128 * Math.pow(weightKg / heightCm, 2);
      } else {
        james = (1.07 * weightKg) - 148 * Math.pow(weightKg / heightCm, 2);
      }

      // Hume Formula
      if (gender === 'male') {
        hume = (0.32810 * weightKg) + (0.33929 * heightCm) - 29.5336;
      } else {
        hume = (0.29569 * weightKg) + (0.41813 * heightCm) - 43.2933;
      }

      // Calculate average
      const average = (boer + james + hume) / 3;

      // Body fat calculations
      let bodyFatMass: number = 0;
      let bodyFatPerc: number = 0;
      
      if (bodyFatPercentage && calculationMethod === 'bodyfat') {
        bodyFatPerc = parseFloat(bodyFatPercentage);
        bodyFatMass = weightKg * (bodyFatPerc / 100);
      } else {
        // Estimate body fat percentage based on demographics if not provided
        if (gender === 'male') {
          if (ageYears < 30) bodyFatPerc = 12;
          else if (ageYears < 40) bodyFatPerc = 15;
          else if (ageYears < 50) bodyFatPerc = 18;
          else bodyFatPerc = 20;
        } else {
          if (ageYears < 30) bodyFatPerc = 20;
          else if (ageYears < 40) bodyFatPerc = 23;
          else if (ageYears < 50) bodyFatPerc = 26;
          else bodyFatPerc = 28;
        }
        bodyFatMass = weightKg * (bodyFatPerc / 100);
      }

      const leanPercentage = 100 - bodyFatPerc;

      // Protein recommendations (1.6-2.2g per kg of lean body mass)
      const proteinIntake = {
        min: Math.round(average * 1.6),
        max: Math.round(average * 2.2)
      };

      // Training recommendations based on lean body mass percentage
      let strengthTraining: string;
      let cardioRecommendation: string;

      if (leanPercentage > 85) {
        strengthTraining = "3-4 strength sessions/week focusing on progressive overload";
        cardioRecommendation = "2-3 moderate cardio sessions to maintain cardiovascular health";
      } else if (leanPercentage > 75) {
        strengthTraining = "4-5 strength sessions/week with compound movements";
        cardioRecommendation = "3-4 cardio sessions combining HIIT and steady-state";
      } else {
        strengthTraining = "3-4 strength sessions/week while in caloric deficit";
        cardioRecommendation = "4-5 cardio sessions focusing on fat loss while preserving muscle";
      }

      // Convert back to appropriate units for display
      const displayWeight = unitSystem === 'metric' ? weightKg : weightKg / 0.453592;
      const lbmResults = {
        boer: unitSystem === 'metric' ? boer : boer / 0.453592,
        james: unitSystem === 'metric' ? james : james / 0.453592,
        hume: unitSystem === 'metric' ? hume : hume / 0.453592,
        average: unitSystem === 'metric' ? average : average / 0.453592,
        bodyFatMass: unitSystem === 'metric' ? bodyFatMass : bodyFatMass / 0.453592
      };

      setResult({
        ...lbmResults,
        bodyFatPercentage: bodyFatPerc,
        leanPercentage,
        recommendations: {
          proteinIntake,
          strengthTraining,
          cardioRecommendation
        }
      });
    }
  };

  const resetCalculator = () => {
    setWeight('');
    setHeight('');
    setFeet('');
    setInches('');
    setAge('');
    setGender('');
    setBodyFatPercentage('');
    setCalculationMethod('formulas');
    setUnitSystem('metric');
    setResult(null);
  };

  const formatWeight = (weight: number) => {
    const unit = unitSystem === 'metric' ? 'kg' : 'lbs';
    return `${weight.toFixed(1)} ${unit}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Helmet>
        <title>Lean Body Mass Calculator - Calculate LBM with Multiple Formulas | DapsiWow</title>
        <meta name="description" content="Free lean body mass calculator using Boer, James, and Hume formulas. Get accurate LBM calculations, body composition analysis, and personalized fitness recommendations with metric and imperial unit support." />
        <meta name="keywords" content="lean body mass calculator, LBM calculator, body composition calculator, muscle mass calculator, lean mass formula, Boer formula, James formula, Hume formula, body fat calculator, fitness calculator, lean body weight calculator" />
        <meta property="og:title" content="Lean Body Mass Calculator - Calculate LBM with Multiple Formulas | DapsiWow" />
        <meta property="og:description" content="Calculate your lean body mass using multiple scientific formulas and get personalized fitness recommendations with detailed body composition analysis." />
        <meta property="og:type" content="website" />
        <meta name="robots" content="index, follow" />
        <meta name="author" content="DapsiWow" />
        <link rel="canonical" href="https://dapsiwow.com/tools/lean-body-mass-calculator" />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            "name": "Lean Body Mass Calculator",
            "description": "Free online lean body mass calculator using multiple scientific formulas including Boer, James, and Hume methods. Features body composition analysis and personalized fitness recommendations.",
            "url": "https://dapsiwow.com/tools/lean-body-mass-calculator",
            "applicationCategory": "HealthApplication",
            "operatingSystem": "Any",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "USD"
            },
            "featureList": [
              "Calculate LBM using multiple scientific formulas",
              "Boer, James, and Hume formula calculations",
              "Body composition analysis",
              "Personalized fitness recommendations",
              "Protein intake calculations",
              "Support for metric and imperial units"
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
                <span className="text-sm font-medium text-blue-700">Professional LBM Calculator</span>
              </div>
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-slate-900 leading-tight">
                Smart LBM
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                  Calculator
                </span>
              </h1>
              <p className="text-xl sm:text-2xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
                Calculate your Lean Body Mass using multiple scientific formulas with detailed body composition analysis and personalized fitness insights
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
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">LBM Configuration</h2>
                    <p className="text-gray-600">Enter your body measurements to get accurate lean body mass calculations</p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Unit System */}
                    <div className="md:col-span-2 space-y-3">
                      <Label className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                        Unit System
                      </Label>
                      <RadioGroup 
                        value={unitSystem} 
                        onValueChange={setUnitSystem}
                        className="flex gap-6"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="metric" id="metric" data-testid="radio-metric" />
                          <Label htmlFor="metric">Metric (kg, cm)</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="imperial" id="imperial" data-testid="radio-imperial" />
                          <Label htmlFor="imperial">Imperial (lbs, ft/in)</Label>
                        </div>
                      </RadioGroup>
                    </div>

                    {/* Calculation Method */}
                    <div className="md:col-span-2 space-y-3">
                      <Label className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                        Calculation Method
                      </Label>
                      <Select value={calculationMethod} onValueChange={setCalculationMethod}>
                        <SelectTrigger className="h-14 border-2 border-gray-200 rounded-xl text-lg" data-testid="select-method">
                          <SelectValue placeholder="Select calculation method" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="formulas">Scientific Formulas (Recommended)</SelectItem>
                          <SelectItem value="bodyfat">Body Fat Percentage Method</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Gender */}
                    <div className="space-y-3">
                      <Label className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                        Gender
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
                        Weight {unitSystem === 'metric' ? '(kg)' : '(lbs)'}
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
                        Height {unitSystem === 'metric' ? '(cm)' : '(ft/in)'}
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

                    {/* Body Fat Percentage (conditional) */}
                    {calculationMethod === 'bodyfat' && (
                      <div className="md:col-span-2 space-y-3">
                        <Label htmlFor="bodyFat" className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                          Body Fat Percentage (%)
                        </Label>
                        <Input
                          id="bodyFat"
                          type="number"
                          value={bodyFatPercentage}
                          onChange={(e) => setBodyFatPercentage(e.target.value)}
                          className="h-14 text-lg border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-blue-500"
                          placeholder="15"
                          min="3"
                          max="50"
                          step="0.1"
                          data-testid="input-body-fat"
                        />
                        <p className="text-sm text-gray-500">
                          Enter your body fat percentage if known (from DEXA scan, body fat calipers, etc.)
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-4 pt-6">
                    <Button
                      onClick={calculateLBM}
                      className="flex-1 h-14 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold text-lg rounded-xl shadow-lg transform transition-all duration-200 hover:scale-105"
                      data-testid="button-calculate"
                    >
                      Calculate LBM
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
                  <h2 className="text-2xl font-bold text-gray-900 mb-8">LBM Results</h2>
                  
                  {result ? (
                    <div className="space-y-6" data-testid="lbm-results">
                      {/* Average LBM Highlight */}
                      <div className="bg-white rounded-2xl p-6 shadow-lg border border-blue-100">
                        <div className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-2">Average Lean Body Mass</div>
                        <div className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600" data-testid="text-average-lbm">
                          {formatWeight(result.average)}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Based on multiple scientific formulas</p>
                      </div>

                      {/* Formula Breakdown */}
                      <div className="space-y-4">
                        <div className="bg-white rounded-xl p-4 shadow-sm">
                          <div className="flex justify-between items-center">
                            <span className="font-medium text-gray-700">Boer Formula</span>
                            <span className="font-bold text-gray-900" data-testid="text-boer-lbm">
                              {formatWeight(result.boer)}
                            </span>
                          </div>
                        </div>
                        <div className="bg-white rounded-xl p-4 shadow-sm">
                          <div className="flex justify-between items-center">
                            <span className="font-medium text-gray-700">James Formula</span>
                            <span className="font-bold text-gray-900" data-testid="text-james-lbm">
                              {formatWeight(result.james)}
                            </span>
                          </div>
                        </div>
                        <div className="bg-white rounded-xl p-4 shadow-sm">
                          <div className="flex justify-between items-center">
                            <span className="font-medium text-gray-700">Hume Formula</span>
                            <span className="font-bold text-gray-900" data-testid="text-hume-lbm">
                              {formatWeight(result.hume)}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Body Composition */}
                      <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200">
                        <h4 className="font-bold text-green-800 mb-3 text-lg">Body Composition</h4>
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-green-700 font-medium">Lean Mass Percentage:</span>
                            <span className="font-bold text-green-800 text-lg" data-testid="text-lean-percentage">
                              {result.leanPercentage.toFixed(1)}%
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-green-700 font-medium">Body Fat Mass:</span>
                            <span className="font-bold text-green-800 text-lg" data-testid="text-body-fat-mass">
                              {formatWeight(result.bodyFatMass)}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Protein Recommendations */}
                      <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-4 border border-purple-200">
                        <h4 className="font-bold text-purple-800 mb-3 text-lg">Daily Protein Target</h4>
                        <div className="flex justify-between items-center">
                          <span className="text-purple-700 font-medium">Recommended Range:</span>
                          <span className="font-bold text-purple-800 text-lg" data-testid="text-protein-recommendation">
                            {result.recommendations.proteinIntake.min} - {result.recommendations.proteinIntake.max}g
                          </span>
                        </div>
                        <p className="text-xs text-purple-600 mt-2">
                          Based on 1.6-2.2g per kg of lean body mass
                        </p>
                      </div>

                      {/* Training Recommendations */}
                      <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-xl p-4 border border-orange-200">
                        <h4 className="font-bold text-orange-800 mb-3 text-lg">Training Recommendations</h4>
                        <div className="space-y-3">
                          <div>
                            <span className="font-medium text-orange-700">Strength Training:</span>
                            <p className="text-orange-600 text-sm" data-testid="text-strength-recommendation">
                              {result.recommendations.strengthTraining}
                            </p>
                          </div>
                          <div>
                            <span className="font-medium text-orange-700">Cardio:</span>
                            <p className="text-orange-600 text-sm" data-testid="text-cardio-recommendation">
                              {result.recommendations.cardioRecommendation}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-16" data-testid="no-results">
                      <div className="w-20 h-20 bg-gray-200 rounded-full mx-auto mb-6 flex items-center justify-center">
                        <div className="text-3xl font-bold text-gray-400">💪</div>
                      </div>
                      <p className="text-gray-500 text-lg">Enter your measurements to calculate lean body mass</p>
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
                <h3 className="text-2xl font-bold text-gray-900 mb-6">What is Lean Body Mass?</h3>
                <div className="space-y-4 text-gray-600">
                  <p>
                    Lean Body Mass (LBM) represents the total weight of your body minus all fat mass. It includes 
                    muscles, bones, organs, connective tissue, and body water. LBM is a crucial metric for athletes, 
                    fitness enthusiasts, and anyone focused on body composition optimization rather than just weight loss.
                  </p>
                  <p>
                    Our LBM calculator uses three scientifically validated formulas - Boer, James, and Hume - to provide 
                    the most accurate estimation possible. Each formula has been developed through extensive research and 
                    clinical studies, ensuring reliable results for fitness planning and health assessment.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">How to Use LBM for Fitness Goals</h3>
                <div className="space-y-4 text-gray-600">
                  <p>
                    Understanding your lean body mass is essential for creating effective nutrition and training plans. 
                    Unlike total body weight, LBM provides insight into your metabolically active tissue and helps 
                    determine accurate calorie and protein requirements.
                  </p>
                  <ul className="space-y-2 list-disc list-inside">
                    <li>Protein needs: 1.6-2.2g per kg of LBM for muscle building</li>
                    <li>Metabolic rate: LBM is the primary determinant of BMR</li>
                    <li>Training progression: Track muscle gains independent of weight changes</li>
                    <li>Body composition goals: Focus on preserving LBM during fat loss</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">LBM Calculation Methods</h3>
                <div className="space-y-3 text-gray-600">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Boer Formula: Most accurate for athletic populations and body builders</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>James Formula: Reliable for general population and fitness enthusiasts</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Hume Formula: Excellent accuracy across different age groups</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Body Fat Method: Most precise when accurate body fat percentage is known</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Multiple unit support: Metric (kg, cm) and Imperial (lbs, ft/in) systems</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Benefits of LBM Tracking</h3>
                <div className="space-y-3 text-gray-600">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Accurate protein intake calculations for muscle building and recovery</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Better understanding of body composition changes during training</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Improved metabolic rate calculations for weight management</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Evidence-based training and nutrition program development</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Scientific approach to fitness goals and progress tracking</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Comprehensive SEO Content Sections */}
          <div className="mt-12 space-y-8">
            {/* LBM Formula Deep Dive */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Understanding LBM Calculation Formulas</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-gray-800">Scientific Foundation</h4>
                    <p className="text-gray-600">
                      Lean body mass calculation has evolved through decades of research in exercise physiology and 
                      clinical medicine. Each formula incorporates different variables and has been validated against 
                      gold-standard methods like DEXA scans and hydrostatic weighing.
                    </p>
                    
                    <div className="bg-blue-50 rounded-lg p-4">
                      <h5 className="font-semibold text-blue-800 mb-2">Boer Formula (1984)</h5>
                      <p className="text-sm text-blue-700 mb-1">
                        <strong>Men:</strong> LBM = (0.407 × weight) + (0.267 × height) - 19.2
                      </p>
                      <p className="text-sm text-blue-700">
                        <strong>Women:</strong> LBM = (0.252 × weight) + (0.473 × height) - 48.3
                      </p>
                      <p className="text-xs text-blue-600 mt-2">
                        Most accurate for athletic populations and individuals with higher muscle mass
                      </p>
                    </div>
                    
                    <div className="bg-green-50 rounded-lg p-4">
                      <h5 className="font-semibold text-green-800 mb-2">James Formula (1976)</h5>
                      <p className="text-sm text-green-700 mb-1">
                        <strong>Men:</strong> LBM = (1.10 × weight) - 128 × (weight/height)²
                      </p>
                      <p className="text-sm text-green-700">
                        <strong>Women:</strong> LBM = (1.07 × weight) - 148 × (weight/height)²
                      </p>
                      <p className="text-xs text-green-600 mt-2">
                        Reliable for general population and widely used in clinical settings
                      </p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-gray-800">Formula Comparison</h4>
                    
                    <div className="bg-purple-50 rounded-lg p-4">
                      <h5 className="font-semibold text-purple-800 mb-2">Hume Formula (1966)</h5>
                      <p className="text-sm text-purple-700 mb-1">
                        <strong>Men:</strong> LBM = (0.32810 × weight) + (0.33929 × height) - 29.5336
                      </p>
                      <p className="text-sm text-purple-700">
                        <strong>Women:</strong> LBM = (0.29569 × weight) + (0.41813 × height) - 43.2933
                      </p>
                      <p className="text-xs text-purple-600 mt-2">
                        Excellent accuracy across different age groups and body types
                      </p>
                    </div>
                    
                    <div className="bg-orange-50 rounded-lg p-4">
                      <h5 className="font-semibold text-orange-800 mb-2">Body Fat Percentage Method</h5>
                      <p className="text-sm text-orange-700 mb-1">
                        LBM = Total Weight × (1 - Body Fat Percentage/100)
                      </p>
                      <p className="text-xs text-orange-600 mt-2">
                        Most accurate when precise body fat percentage is available from DEXA, BodPod, or hydrostatic weighing
                      </p>
                    </div>
                    
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h5 className="font-semibold text-gray-800 mb-2">Our Approach</h5>
                      <p className="text-sm text-gray-700">
                        Our calculator provides results from all three validated formulas and calculates an average 
                        for the most reliable estimate. This approach minimizes individual formula limitations and 
                        provides a more robust assessment of your lean body mass.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* LBM Applications and Use Cases */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Practical Applications of Lean Body Mass</h3>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-gray-800">Strength Training</h4>
                    <div className="space-y-3">
                      <div className="p-3 bg-blue-50 rounded-lg">
                        <h5 className="font-semibold text-blue-800 text-sm">Protein Requirements</h5>
                        <p className="text-blue-700 text-xs">1.6-2.2g per kg of LBM for optimal muscle protein synthesis</p>
                      </div>
                      <div className="p-3 bg-blue-50 rounded-lg">
                        <h5 className="font-semibold text-blue-800 text-sm">Progress Tracking</h5>
                        <p className="text-blue-700 text-xs">Monitor muscle gains independent of water weight and fat changes</p>
                      </div>
                      <div className="p-3 bg-blue-50 rounded-lg">
                        <h5 className="font-semibold text-blue-800 text-sm">Training Volume</h5>
                        <p className="text-blue-700 text-xs">Calculate appropriate training loads based on muscle mass</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-gray-800">Weight Management</h4>
                    <div className="space-y-3">
                      <div className="p-3 bg-green-50 rounded-lg">
                        <h5 className="font-semibold text-green-800 text-sm">Fat Loss Strategy</h5>
                        <p className="text-green-700 text-xs">Preserve LBM while losing fat through proper deficit and protein intake</p>
                      </div>
                      <div className="p-3 bg-green-50 rounded-lg">
                        <h5 className="font-semibold text-green-800 text-sm">Metabolic Rate</h5>
                        <p className="text-green-700 text-xs">LBM is the primary determinant of resting metabolic rate</p>
                      </div>
                      <div className="p-3 bg-green-50 rounded-lg">
                        <h5 className="font-semibold text-green-800 text-sm">Calorie Targets</h5>
                        <p className="text-green-700 text-xs">Set accurate calorie goals based on metabolically active tissue</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-gray-800">Clinical Applications</h4>
                    <div className="space-y-3">
                      <div className="p-3 bg-purple-50 rounded-lg">
                        <h5 className="font-semibold text-purple-800 text-sm">Sarcopenia Assessment</h5>
                        <p className="text-purple-700 text-xs">Monitor age-related muscle loss and intervention effectiveness</p>
                      </div>
                      <div className="p-3 bg-purple-50 rounded-lg">
                        <h5 className="font-semibold text-purple-800 text-sm">Medical Dosing</h5>
                        <p className="text-purple-700 text-xs">Some medications are dosed based on lean body weight</p>
                      </div>
                      <div className="p-3 bg-purple-50 rounded-lg">
                        <h5 className="font-semibold text-purple-800 text-sm">Health Monitoring</h5>
                        <p className="text-purple-700 text-xs">Track body composition changes during medical treatment</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Factors Affecting LBM */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
                <CardContent className="p-8">
                  <h3 className="text-xl font-bold text-gray-900 mb-6">Factors Affecting Lean Body Mass</h3>
                  <div className="space-y-4 text-gray-600">
                    <div className="border-l-4 border-blue-400 pl-4">
                      <h4 className="font-semibold text-gray-800 mb-2">Genetics and Gender</h4>
                      <p className="text-sm">Men typically have 15-20% higher LBM than women due to hormonal differences, particularly testosterone levels affecting muscle development and bone density.</p>
                    </div>
                    <div className="border-l-4 border-green-400 pl-4">
                      <h4 className="font-semibold text-gray-800 mb-2">Age and Sarcopenia</h4>
                      <p className="text-sm">LBM naturally decreases with age, starting around 30 years old. Adults lose approximately 3-8% of muscle mass per decade without intervention.</p>
                    </div>
                    <div className="border-l-4 border-orange-400 pl-4">
                      <h4 className="font-semibold text-gray-800 mb-2">Training and Activity</h4>
                      <p className="text-sm">Resistance training is the most effective way to increase and maintain LBM. Progressive overload stimulates muscle protein synthesis and adaptation.</p>
                    </div>
                    <div className="border-l-4 border-purple-400 pl-4">
                      <h4 className="font-semibold text-gray-800 mb-2">Nutrition and Protein</h4>
                      <p className="text-sm">Adequate protein intake (1.6-2.2g/kg LBM) and overall caloric intake significantly impact muscle preservation and growth potential.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
                <CardContent className="p-8">
                  <h3 className="text-xl font-bold text-gray-900 mb-6">Optimizing Your Lean Body Mass</h3>
                  <div className="space-y-4 text-gray-600">
                    <div className="bg-blue-50 rounded-lg p-4">
                      <h4 className="font-semibold text-blue-800 mb-2">Training Recommendations</h4>
                      <ul className="text-blue-700 space-y-1 text-sm list-disc list-inside">
                        <li>Resistance training 3-4 times per week</li>
                        <li>Focus on compound movements</li>
                        <li>Progressive overload principle</li>
                        <li>Adequate recovery between sessions</li>
                      </ul>
                    </div>
                    <div className="bg-green-50 rounded-lg p-4">
                      <h4 className="font-semibold text-green-800 mb-2">Nutritional Strategies</h4>
                      <ul className="text-green-700 space-y-1 text-sm list-disc list-inside">
                        <li>Consume 1.6-2.2g protein per kg of LBM</li>
                        <li>Distribute protein throughout the day</li>
                        <li>Include leucine-rich protein sources</li>
                        <li>Maintain adequate caloric intake</li>
                      </ul>
                    </div>
                    <div className="bg-purple-50 rounded-lg p-4">
                      <h4 className="font-semibold text-purple-800 mb-2">Lifestyle Factors</h4>
                      <ul className="text-purple-700 space-y-1 text-sm list-disc list-inside">
                        <li>Prioritize 7-9 hours of quality sleep</li>
                        <li>Manage stress levels effectively</li>
                        <li>Stay adequately hydrated</li>
                        <li>Avoid excessive alcohol consumption</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* LBM vs Other Body Composition Metrics */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">LBM vs Other Body Composition Metrics</h3>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-gray-800">Lean Body Mass vs BMI</h4>
                    <div className="space-y-3 text-gray-600">
                      <p className="text-sm">
                        While BMI only considers height and weight, LBM provides insight into body composition. 
                        Athletes with high muscle mass may have elevated BMI but excellent health markers.
                      </p>
                      <div className="bg-red-50 rounded-lg p-3">
                        <h5 className="font-semibold text-red-800 text-sm">BMI Limitations</h5>
                        <ul className="text-red-700 text-xs space-y-1 list-disc list-inside">
                          <li>Cannot distinguish muscle from fat</li>
                          <li>May misclassify muscular individuals</li>
                          <li>Doesn't account for body composition</li>
                        </ul>
                      </div>
                      <div className="bg-green-50 rounded-lg p-3">
                        <h5 className="font-semibold text-green-800 text-sm">LBM Advantages</h5>
                        <ul className="text-green-700 text-xs space-y-1 list-disc list-inside">
                          <li>Focuses on metabolically active tissue</li>
                          <li>Better indicator of fitness level</li>
                          <li>More relevant for athletic populations</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-gray-800">LBM vs Body Fat Percentage</h4>
                    <div className="space-y-3 text-gray-600">
                      <p className="text-sm">
                        Body fat percentage and LBM are complementary metrics. While body fat percentage shows 
                        the proportion of fat, LBM quantifies the absolute amount of lean tissue.
                      </p>
                      <div className="bg-blue-50 rounded-lg p-3">
                        <h5 className="font-semibold text-blue-800 text-sm">Combined Analysis</h5>
                        <ul className="text-blue-700 text-xs space-y-1 list-disc list-inside">
                          <li>LBM shows absolute muscle mass</li>
                          <li>Body fat % shows relative composition</li>
                          <li>Both metrics track progress effectively</li>
                        </ul>
                      </div>
                      <div className="bg-orange-50 rounded-lg p-3">
                        <h5 className="font-semibold text-orange-800 text-sm">Practical Application</h5>
                        <ul className="text-orange-700 text-xs space-y-1 list-disc list-inside">
                          <li>Monitor LBM during fat loss phases</li>
                          <li>Track body fat % for aesthetic goals</li>
                          <li>Use both for comprehensive assessment</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-gray-800">LBM vs Total Body Weight</h4>
                    <div className="space-y-3 text-gray-600">
                      <p className="text-sm">
                        Total body weight includes fat, muscle, bones, organs, and water. LBM provides a more 
                        specific measurement of health-promoting tissue composition.
                      </p>
                      <div className="bg-purple-50 rounded-lg p-3">
                        <h5 className="font-semibold text-purple-800 text-sm">Weight vs Composition</h5>
                        <ul className="text-purple-700 text-xs space-y-1 list-disc list-inside">
                          <li>Weight can fluctuate with hydration</li>
                          <li>LBM is more stable and meaningful</li>
                          <li>Focus on composition over scale weight</li>
                        </ul>
                      </div>
                      <div className="bg-teal-50 rounded-lg p-3">
                        <h5 className="font-semibold text-teal-800 text-sm">Goal Setting</h5>
                        <ul className="text-teal-700 text-xs space-y-1 list-disc list-inside">
                          <li>Set LBM preservation goals during cuts</li>
                          <li>Target LBM increases during bulks</li>
                          <li>Use LBM for protein calculations</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Common Mistakes and Best Practices */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Common LBM Calculation Mistakes and Best Practices</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-r-lg">
                      <h4 className="font-semibold text-red-800 mb-2">Using Only One Formula</h4>
                      <p className="text-red-700 text-sm">Relying on a single formula can lead to inaccuracies. Our calculator uses multiple validated formulas and provides an average for better reliability.</p>
                    </div>
                    <div className="bg-orange-50 border-l-4 border-orange-400 p-4 rounded-r-lg">
                      <h4 className="font-semibold text-orange-800 mb-2">Ignoring Body Fat Percentage</h4>
                      <p className="text-orange-700 text-sm">When accurate body fat percentage is available from DEXA or BodPod, it provides the most precise LBM calculation compared to predictive equations.</p>
                    </div>
                    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-lg">
                      <h4 className="font-semibold text-yellow-800 mb-2">Not Considering Individual Variation</h4>
                      <p className="text-yellow-700 text-sm">Formulas provide estimates that may vary ±5-10% from actual values due to individual differences in bone density and organ size.</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-lg">
                      <h4 className="font-semibold text-blue-800 mb-2">Expecting Rapid Changes</h4>
                      <p className="text-blue-700 text-sm">LBM changes slowly - muscle gains of 0.5-2 lbs per month are realistic for most people with proper training and nutrition.</p>
                    </div>
                    <div className="bg-purple-50 border-l-4 border-purple-400 p-4 rounded-r-lg">
                      <h4 className="font-semibold text-purple-800 mb-2">Not Tracking Progress Properly</h4>
                      <p className="text-purple-700 text-sm">Use consistent measurement conditions and track trends over time rather than focusing on daily fluctuations in calculated values.</p>
                    </div>
                    <div className="bg-green-50 border-l-4 border-green-400 p-4 rounded-r-lg">
                      <h4 className="font-semibold text-green-800 mb-2">Misunderstanding Protein Needs</h4>
                      <p className="text-green-700 text-sm">Protein requirements should be based on LBM, not total body weight, for more accurate and efficient nutrition planning.</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Related Health Calculators */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-8">Related Health and Fitness Calculators</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6 hover:shadow-md transition-shadow">
                    <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mb-4">
                      <span className="text-white text-xl font-bold">💪</span>
                    </div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-3">
                      <a href="/tools/body-fat-calculator" className="hover:text-blue-600 transition-colors">Body Fat Calculator</a>
                    </h4>
                    <p className="text-gray-600 text-sm mb-3">
                      Calculate body fat percentage using skinfold measurements and circumference methods for complete body composition analysis.
                    </p>
                    <div className="text-xs text-blue-700">Perfect complement to LBM calculations</div>
                  </div>

                  <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-6 hover:shadow-md transition-shadow">
                    <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center mb-4">
                      <span className="text-white text-xl font-bold">🥩</span>
                    </div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-3">
                      <a href="/tools/protein-intake-calculator" className="hover:text-green-600 transition-colors">Protein Calculator</a>
                    </h4>
                    <p className="text-gray-600 text-sm mb-3">
                      Calculate optimal daily protein intake based on your lean body mass, activity level, and fitness goals.
                    </p>
                    <div className="text-xs text-green-700">Use LBM results for accurate protein targets</div>
                  </div>

                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-6 hover:shadow-md transition-shadow">
                    <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center mb-4">
                      <span className="text-white text-xl font-bold">🔥</span>
                    </div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-3">
                      <a href="/tools/bmr-calculator" className="hover:text-purple-600 transition-colors">BMR Calculator</a>
                    </h4>
                    <p className="text-gray-600 text-sm mb-3">
                      Calculate your Basal Metabolic Rate to understand your body's energy needs at rest and plan nutrition accordingly.
                    </p>
                    <div className="text-xs text-purple-700">LBM directly influences metabolic rate</div>
                  </div>

                  <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-6 hover:shadow-md transition-shadow">
                    <div className="w-12 h-12 bg-orange-600 rounded-lg flex items-center justify-center mb-4">
                      <span className="text-white text-xl font-bold">⚡</span>
                    </div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-3">
                      <a href="/tools/tdee-calculator" className="hover:text-orange-600 transition-colors">TDEE Calculator</a>
                    </h4>
                    <p className="text-gray-600 text-sm mb-3">
                      Calculate Total Daily Energy Expenditure based on your activity level for comprehensive calorie planning.
                    </p>
                    <div className="text-xs text-orange-700">Complete the body composition picture</div>
                  </div>

                  <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg p-6 hover:shadow-md transition-shadow">
                    <div className="w-12 h-12 bg-red-600 rounded-lg flex items-center justify-center mb-4">
                      <span className="text-white text-xl font-bold">⚖️</span>
                    </div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-3">
                      <a href="/tools/ideal-weight-calculator" className="hover:text-red-600 transition-colors">Ideal Weight Calculator</a>
                    </h4>
                    <p className="text-gray-600 text-sm mb-3">
                      Calculate your ideal body weight using multiple proven formulas to set realistic and healthy goals.
                    </p>
                    <div className="text-xs text-red-700">Set body composition targets</div>
                  </div>

                  <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-lg p-6 hover:shadow-md transition-shadow">
                    <div className="w-12 h-12 bg-indigo-600 rounded-lg flex items-center justify-center mb-4">
                      <span className="text-white text-xl font-bold">🍽️</span>
                    </div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-3">
                      <a href="/tools/calorie-calculator" className="hover:text-indigo-600 transition-colors">Calorie Calculator</a>
                    </h4>
                    <p className="text-gray-600 text-sm mb-3">
                      Calculate daily calorie needs with detailed macronutrient breakdown based on your body composition and goals.
                    </p>
                    <div className="text-xs text-indigo-700">Optimize nutrition for LBM goals</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* LBM FAQ Section */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-8">Frequently Asked Questions about Lean Body Mass</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">How accurate are LBM calculator results?</h4>
                      <p className="text-gray-600 text-sm">Our calculator combines three validated formulas for ±5-10% accuracy. For precise measurements, consider DEXA scans or hydrostatic weighing, especially for research or clinical applications.</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">Can I increase my lean body mass naturally?</h4>
                      <p className="text-gray-600 text-sm">Yes, through progressive resistance training, adequate protein intake (1.6-2.2g/kg LBM), sufficient calories, and proper recovery. Expect 0.5-2 lbs of muscle gain per month with consistent effort.</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">How often should I calculate my LBM?</h4>
                      <p className="text-gray-600 text-sm">Monthly calculations are sufficient for tracking trends. LBM changes slowly, so daily or weekly calculations won't show meaningful differences and may lead to unnecessary frustration.</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">What's the difference between LBM and muscle mass?</h4>
                      <p className="text-gray-600 text-sm">LBM includes muscle, bones, organs, and body water, while muscle mass refers specifically to skeletal muscle tissue. LBM is typically 20-30% higher than pure muscle mass.</p>
                    </div>
                  </div>
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">Do women and men have different LBM requirements?</h4>
                      <p className="text-gray-600 text-sm">Men typically have 15-20% higher LBM due to hormonal differences. However, the principles of LBM optimization (training, protein, recovery) apply equally to both genders.</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">Can I lose fat while maintaining LBM?</h4>
                      <p className="text-gray-600 text-sm">Yes, with appropriate caloric deficit (250-750 calories), high protein intake, resistance training, and adequate sleep. Avoid extreme diets that can lead to muscle loss.</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">Is LBM more important than body weight?</h4>
                      <p className="text-gray-600 text-sm">For fitness and health goals, LBM is often more meaningful than total weight. Higher LBM improves metabolism, strength, and long-term health outcomes regardless of scale weight.</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">What supplements can help increase LBM?</h4>
                      <p className="text-gray-600 text-sm">Creatine monohydrate (3-5g daily) and protein powder to meet daily targets are evidence-based. Focus on whole foods, training, and recovery before considering other supplements.</p>
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

export default LeanBodyMassCalculator;
