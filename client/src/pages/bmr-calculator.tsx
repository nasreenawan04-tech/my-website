
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

interface BMRResult {
  bmr: number;
  tdee: number;
  maintenanceCalories: number;
  weightLossCalories: {
    mild: number;
    moderate: number;
    aggressive: number;
  };
  weightGainCalories: {
    mild: number;
    moderate: number;
  };
  macroBreakdown: {
    protein: { grams: number; calories: number };
    carbs: { grams: number; calories: number };
    fat: { grams: number; calories: number };
  };
  activityMultiplier: number;
  equation: string;
}

export default function BMRCalculator() {
  const [weight, setWeight] = useState('70');
  const [height, setHeight] = useState('175');
  const [feet, setFeet] = useState('5');
  const [inches, setInches] = useState('9');
  const [age, setAge] = useState('30');
  const [gender, setGender] = useState('male');
  const [unitSystem, setUnitSystem] = useState('metric');
  const [activityLevel, setActivityLevel] = useState('moderately-active');
  const [equation, setEquation] = useState('mifflin');
  const [result, setResult] = useState<BMRResult | null>(null);

  const calculateBMR = () => {
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

    if (weightKg && heightCm && ageYears && gender) {
      let bmr: number;
      let equationUsed: string;

      // Calculate BMR using selected equation
      if (equation === 'mifflin') {
        // Mifflin-St Jeor Equation (most accurate)
        if (gender === 'male') {
          bmr = 10 * weightKg + 6.25 * heightCm - 5 * ageYears + 5;
        } else {
          bmr = 10 * weightKg + 6.25 * heightCm - 5 * ageYears - 161;
        }
        equationUsed = 'Mifflin-St Jeor';
      } else {
        // Harris-Benedict Equation (revised)
        if (gender === 'male') {
          bmr = 88.362 + (13.397 * weightKg) + (4.799 * heightCm) - (5.677 * ageYears);
        } else {
          bmr = 447.593 + (9.247 * weightKg) + (3.098 * heightCm) - (4.330 * ageYears);
        }
        equationUsed = 'Harris-Benedict';
      }

      // Activity multipliers
      const activityMultipliers = {
        'sedentary': 1.2,
        'lightly-active': 1.375,
        'moderately-active': 1.55,
        'very-active': 1.725,
        'extra-active': 1.9
      };

      const multiplier = activityMultipliers[activityLevel as keyof typeof activityMultipliers];
      const tdee = bmr * multiplier;

      // Calculate calorie goals
      const maintenanceCalories = tdee;
      const weightLossCalories = {
        mild: tdee - 250,      // 0.5 lbs/week
        moderate: tdee - 500,  // 1 lb/week
        aggressive: tdee - 750 // 1.5 lbs/week
      };
      const weightGainCalories = {
        mild: tdee + 250,      // 0.5 lbs/week
        moderate: tdee + 500   // 1 lb/week
      };

      // Calculate macro breakdown for maintenance calories (40% carbs, 30% protein, 30% fat)
      const proteinCalories = maintenanceCalories * 0.30;
      const carbsCalories = maintenanceCalories * 0.40;
      const fatCalories = maintenanceCalories * 0.30;

      const macroBreakdown = {
        protein: {
          grams: Math.round(proteinCalories / 4), // 4 cal/g
          calories: Math.round(proteinCalories)
        },
        carbs: {
          grams: Math.round(carbsCalories / 4), // 4 cal/g
          calories: Math.round(carbsCalories)
        },
        fat: {
          grams: Math.round(fatCalories / 9), // 9 cal/g
          calories: Math.round(fatCalories)
        }
      };

      setResult({
        bmr: Math.round(bmr),
        tdee: Math.round(tdee),
        maintenanceCalories: Math.round(maintenanceCalories),
        weightLossCalories: {
          mild: Math.round(weightLossCalories.mild),
          moderate: Math.round(weightLossCalories.moderate),
          aggressive: Math.round(weightLossCalories.aggressive)
        },
        weightGainCalories: {
          mild: Math.round(weightGainCalories.mild),
          moderate: Math.round(weightGainCalories.moderate)
        },
        macroBreakdown,
        activityMultiplier: multiplier,
        equation: equationUsed
      });
    }
  };

  const resetCalculator = () => {
    setWeight('70');
    setHeight('175');
    setFeet('5');
    setInches('9');
    setAge('30');
    setGender('male');
    setUnitSystem('metric');
    setActivityLevel('moderately-active');
    setEquation('mifflin');
    setResult(null);
  };

  const getActivityDescription = (level: string) => {
    const descriptions = {
      'sedentary': 'Little to no exercise',
      'lightly-active': 'Light exercise 1-3 days/week',
      'moderately-active': 'Moderate exercise 3-5 days/week',
      'very-active': 'Hard exercise 6-7 days/week',
      'extra-active': 'Very hard exercise + physical job'
    };
    return descriptions[level as keyof typeof descriptions] || '';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Helmet>
        <title>BMR Calculator - Calculate Basal Metabolic Rate | DapsiWow</title>
        <meta name="description" content="Free BMR calculator to calculate your Basal Metabolic Rate and daily calorie needs. Get accurate BMR calculations using Mifflin-St Jeor and Harris-Benedict equations with activity level adjustments." />
        <meta name="keywords" content="BMR calculator, basal metabolic rate calculator, daily calorie calculator, metabolism calculator, TDEE calculator, calorie needs calculator, BMR formula, metabolic rate" />
        <meta property="og:title" content="BMR Calculator - Calculate Basal Metabolic Rate | DapsiWow" />
        <meta property="og:description" content="Calculate your Basal Metabolic Rate (BMR) and Total Daily Energy Expenditure (TDEE) with our accurate BMR calculator." />
        <meta property="og:type" content="website" />
        <meta name="robots" content="index, follow" />
        <meta name="author" content="DapsiWow" />
        <link rel="canonical" href="https://dapsiwow.com/tools/bmr-calculator" />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            "name": "BMR Calculator",
            "description": "Free online BMR calculator to calculate Basal Metabolic Rate and daily calorie needs using scientifically proven equations.",
            "url": "https://dapsiwow.com/tools/bmr-calculator",
            "applicationCategory": "HealthApplication",
            "operatingSystem": "Any",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "USD"
            },
            "featureList": [
              "Calculate BMR using multiple equations",
              "Support for metric and imperial units",
              "Activity level adjustments",
              "TDEE calculations",
              "Weight loss and gain calorie targets",
              "Macronutrient breakdown"
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
                <span className="text-sm font-medium text-blue-700">Professional BMR Calculator</span>
              </div>
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-slate-900 leading-tight">
                Smart BMR
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                  Calculator
                </span>
              </h1>
              <p className="text-xl sm:text-2xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
                Calculate your Basal Metabolic Rate and daily calorie needs with scientifically proven equations
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
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">BMR Configuration</h2>
                    <p className="text-gray-600">Enter your personal details to calculate your metabolic rate</p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Unit System */}
                    <div className="space-y-3">
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
                    <div className="space-y-3 md:col-span-2">
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

                    {/* Activity Level */}
                    <div className="space-y-3">
                      <Label className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                        Activity Level
                      </Label>
                      <Select value={activityLevel} onValueChange={setActivityLevel}>
                        <SelectTrigger className="h-14 border-2 border-gray-200 rounded-xl text-lg" data-testid="select-activity">
                          <SelectValue placeholder="Select activity level" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="sedentary">Sedentary - Little to no exercise</SelectItem>
                          <SelectItem value="lightly-active">Lightly Active - Light exercise 1-3 days/week</SelectItem>
                          <SelectItem value="moderately-active">Moderately Active - Moderate exercise 3-5 days/week</SelectItem>
                          <SelectItem value="very-active">Very Active - Hard exercise 6-7 days/week</SelectItem>
                          <SelectItem value="extra-active">Extra Active - Very hard exercise + physical job</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Equation Selection */}
                    <div className="space-y-3">
                      <Label className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                        Calculation Method
                      </Label>
                      <Select value={equation} onValueChange={setEquation}>
                        <SelectTrigger className="h-14 border-2 border-gray-200 rounded-xl text-lg" data-testid="select-equation">
                          <SelectValue placeholder="Select equation" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="mifflin">Mifflin-St Jeor (Most Accurate)</SelectItem>
                          <SelectItem value="harris">Harris-Benedict (Revised)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-4 pt-6">
                    <Button
                      onClick={calculateBMR}
                      className="flex-1 h-14 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold text-lg rounded-xl shadow-lg transform transition-all duration-200 hover:scale-105"
                      data-testid="button-calculate"
                    >
                      Calculate BMR
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
                    <div className="space-y-6" data-testid="bmr-results">
                      {/* BMR Highlight */}
                      <div className="bg-white rounded-2xl p-6 shadow-lg border border-blue-100">
                        <div className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-2">Basal Metabolic Rate</div>
                        <div className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 mb-2" data-testid="text-bmr">
                          {result.bmr} cal/day
                        </div>
                        <div className="text-xs text-gray-500">Using {result.equation} equation</div>
                      </div>

                      {/* TDEE */}
                      <div className="bg-white rounded-xl p-4 shadow-sm">
                        <div className="flex justify-between items-center">
                          <span className="font-medium text-gray-700">Total Daily Energy Expenditure</span>
                          <span className="font-bold text-gray-900" data-testid="text-tdee">
                            {result.tdee} cal/day
                          </span>
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          Activity multiplier: {result.activityMultiplier}x
                        </div>
                      </div>

                      {/* Calorie Goals */}
                      <div className="space-y-4">
                        <h4 className="font-bold text-gray-900 text-lg">Calorie Goals</h4>
                        
                        <div className="bg-green-50 rounded-xl p-4 border border-green-200">
                          <div className="flex justify-between items-center">
                            <span className="font-medium text-green-800">Maintain Weight</span>
                            <span className="font-bold text-green-800" data-testid="text-maintenance">
                              {result.maintenanceCalories} cal/day
                            </span>
                          </div>
                        </div>

                        <div className="bg-red-50 rounded-xl p-4 border border-red-200">
                          <h5 className="font-semibold text-red-800 mb-3">Weight Loss</h5>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-red-700">Mild (0.5 lbs/week):</span>
                              <span className="font-bold text-red-800">{result.weightLossCalories.mild} cal/day</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-red-700">Moderate (1 lb/week):</span>
                              <span className="font-bold text-red-800">{result.weightLossCalories.moderate} cal/day</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-red-700">Aggressive (1.5 lbs/week):</span>
                              <span className="font-bold text-red-800">{result.weightLossCalories.aggressive} cal/day</span>
                            </div>
                          </div>
                        </div>

                        <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                          <h5 className="font-semibold text-blue-800 mb-3">Weight Gain</h5>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-blue-700">Mild (0.5 lbs/week):</span>
                              <span className="font-bold text-blue-800">{result.weightGainCalories.mild} cal/day</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-blue-700">Moderate (1 lb/week):</span>
                              <span className="font-bold text-blue-800">{result.weightGainCalories.moderate} cal/day</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Macros */}
                      <div className="bg-white rounded-xl p-4 shadow-sm">
                        <h4 className="font-semibold text-gray-900 mb-3">Recommended Macros (Maintenance)</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between items-center">
                            <span className="text-blue-700 font-medium">Protein (30%)</span>
                            <span className="font-bold text-blue-800" data-testid="text-protein">
                              {result.macroBreakdown.protein.grams}g / {result.macroBreakdown.protein.calories} cal
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-green-700 font-medium">Carbs (40%)</span>
                            <span className="font-bold text-green-800" data-testid="text-carbs">
                              {result.macroBreakdown.carbs.grams}g / {result.macroBreakdown.carbs.calories} cal
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-orange-700 font-medium">Fat (30%)</span>
                            <span className="font-bold text-orange-800" data-testid="text-fat">
                              {result.macroBreakdown.fat.grams}g / {result.macroBreakdown.fat.calories} cal
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-16" data-testid="no-results">
                      <div className="w-20 h-20 bg-gray-200 rounded-full mx-auto mb-6 flex items-center justify-center">
                        <div className="text-3xl font-bold text-gray-400">BMR</div>
                      </div>
                      <p className="text-gray-500 text-lg">Enter your details and calculate to see BMR results</p>
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
                <h3 className="text-2xl font-bold text-gray-900 mb-6">What is BMR?</h3>
                <div className="space-y-4 text-gray-600">
                  <p>
                    BMR (Basal Metabolic Rate) is the number of calories your body needs to maintain basic physiological 
                    functions while at complete rest. This includes breathing, circulation, cell production, nutrient processing, 
                    protein synthesis, and ion transport. BMR represents the minimum energy required to keep your body alive.
                  </p>
                  <p>
                    Our BMR calculator uses scientifically proven equations like the Mifflin-St Jeor equation, which is 
                    considered the most accurate method for calculating metabolic rate. Understanding your BMR is crucial 
                    for determining daily calorie needs and creating effective nutrition plans.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">How to Calculate BMR?</h3>
                <div className="space-y-4 text-gray-600">
                  <p>
                    The Mifflin-St Jeor equation is:
                  </p>
                  <div className="bg-blue-50 rounded-lg p-4">
                    <p className="font-mono text-sm"><strong>Men:</strong> BMR = 10 × weight(kg) + 6.25 × height(cm) - 5 × age + 5</p>
                    <p className="font-mono text-sm"><strong>Women:</strong> BMR = 10 × weight(kg) + 6.25 × height(cm) - 5 × age - 161</p>
                  </div>
                  <p>
                    Our calculator multiplies your BMR by an activity factor to determine your Total Daily Energy 
                    Expenditure (TDEE), which represents your total calorie needs including physical activity.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">BMR vs TDEE vs RMR</h3>
                <div className="space-y-3 text-gray-600">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <div>
                      <strong>BMR (Basal Metabolic Rate):</strong> Energy needed for basic body functions at complete rest
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <div>
                      <strong>TDEE (Total Daily Energy Expenditure):</strong> BMR plus calories burned through activity
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                    <div>
                      <strong>RMR (Resting Metabolic Rate):</strong> Similar to BMR but measured in less restrictive conditions
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                    <div>
                      <strong>TEF (Thermic Effect of Food):</strong> Energy cost of digesting and processing food
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
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Accurate BMR calculations using validated equations</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Support for both metric and imperial units</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Activity-adjusted TDEE calculations</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Personalized calorie goals for weight management</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Detailed macronutrient recommendations</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Additional SEO Content Sections */}
          <div className="mt-12 space-y-8">
            {/* Factors Affecting BMR */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Factors That Affect Your BMR</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-gray-800">Body Composition</h4>
                    <p className="text-gray-600">
                      Muscle tissue is metabolically active and burns more calories at rest than fat tissue. People with 
                      higher muscle mass typically have higher BMRs. This is why strength training can boost metabolism 
                      by increasing lean body mass.
                    </p>
                  </div>
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-gray-800">Age and Gender</h4>
                    <p className="text-gray-600">
                      BMR generally decreases with age due to loss of muscle mass and changes in hormone levels. 
                      Men typically have higher BMRs than women due to greater muscle mass and larger body size. 
                      The equations account for these differences.
                    </p>
                  </div>
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-gray-800">Genetics and Hormones</h4>
                    <p className="text-gray-600">
                      Genetic factors can influence metabolic rate by 5-10%. Thyroid hormones, particularly T3 and T4, 
                      significantly affect metabolism. Medical conditions like hypothyroidism can lower BMR, while 
                      hyperthyroidism can increase it.
                    </p>
                  </div>
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-gray-800">Environmental Factors</h4>
                    <p className="text-gray-600">
                      Temperature extremes can affect BMR as your body works harder to maintain core temperature. 
                      Altitude, pregnancy, illness, and certain medications can also influence metabolic rate. 
                      Calorie restriction can lead to adaptive thermogenesis, lowering BMR.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* BMR Equations Comparison */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
                <CardContent className="p-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">BMR Calculation Equations</h3>
                  <div className="space-y-6">
                    <div className="bg-blue-50 rounded-lg p-4">
                      <h4 className="font-semibold text-blue-800 mb-2">Mifflin-St Jeor Equation (1990)</h4>
                      <p className="text-sm text-blue-700 mb-2">Most accurate for normal weight individuals</p>
                      <div className="space-y-1 text-xs font-mono text-blue-600">
                        <div>Men: 10W + 6.25H - 5A + 5</div>
                        <div>Women: 10W + 6.25H - 5A - 161</div>
                      </div>
                    </div>
                    <div className="bg-green-50 rounded-lg p-4">
                      <h4 className="font-semibold text-green-800 mb-2">Harris-Benedict Equation (1984)</h4>
                      <p className="text-sm text-green-700 mb-2">Revised version, good general accuracy</p>
                      <div className="space-y-1 text-xs font-mono text-green-600">
                        <div>Men: 88.362 + 13.397W + 4.799H - 5.677A</div>
                        <div>Women: 447.593 + 9.247W + 3.098H - 4.330A</div>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500">W = Weight (kg), H = Height (cm), A = Age (years)</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
                <CardContent className="p-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">Activity Level Multipliers</h3>
                  <div className="space-y-4">
                    <div className="border-l-4 border-red-500 pl-4">
                      <h4 className="font-semibold text-gray-800 mb-1">Sedentary (1.2x)</h4>
                      <p className="text-sm text-gray-600">Desk job, no regular exercise, minimal physical activity</p>
                    </div>
                    <div className="border-l-4 border-orange-500 pl-4">
                      <h4 className="font-semibold text-gray-800 mb-1">Lightly Active (1.375x)</h4>
                      <p className="text-sm text-gray-600">Light exercise 1-3 days/week, some walking or light sports</p>
                    </div>
                    <div className="border-l-4 border-yellow-500 pl-4">
                      <h4 className="font-semibold text-gray-800 mb-1">Moderately Active (1.55x)</h4>
                      <p className="text-sm text-gray-600">Moderate exercise 3-5 days/week, regular gym sessions</p>
                    </div>
                    <div className="border-l-4 border-green-500 pl-4">
                      <h4 className="font-semibold text-gray-800 mb-1">Very Active (1.725x)</h4>
                      <p className="text-sm text-gray-600">Hard exercise 6-7 days/week, intense training</p>
                    </div>
                    <div className="border-l-4 border-blue-500 pl-4">
                      <h4 className="font-semibold text-gray-800 mb-1">Extra Active (1.9x)</h4>
                      <p className="text-sm text-gray-600">Very hard exercise + physical job or 2x/day training</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* BMR Applications */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-8">Practical Applications of BMR</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="bg-blue-50 rounded-lg p-6 border border-blue-100">
                    <h4 className="text-lg font-semibold text-blue-800 mb-3">Weight Management</h4>
                    <p className="text-blue-700 text-sm mb-4">
                      Use BMR to determine calorie needs for weight loss, maintenance, or gain. Create appropriate 
                      caloric deficits or surpluses based on your goals.
                    </p>
                    <ul className="text-blue-700 text-xs space-y-1">
                      <li>• Calculate daily calorie targets</li>
                      <li>• Plan sustainable deficits</li>
                      <li>• Avoid metabolic damage</li>
                    </ul>
                  </div>
                  
                  <div className="bg-green-50 rounded-lg p-6 border border-green-100">
                    <h4 className="text-lg font-semibold text-green-800 mb-3">Athletic Performance</h4>
                    <p className="text-green-700 text-sm mb-4">
                      Athletes use BMR calculations to fuel training properly and optimize recovery. Ensures adequate 
                      energy intake for performance and adaptation.
                    </p>
                    <ul className="text-green-700 text-xs space-y-1">
                      <li>• Fuel training sessions</li>
                      <li>• Optimize recovery nutrition</li>
                      <li>• Prevent relative energy deficiency</li>
                    </ul>
                  </div>
                  
                  <div className="bg-purple-50 rounded-lg p-6 border border-purple-100">
                    <h4 className="text-lg font-semibold text-purple-800 mb-3">Health Monitoring</h4>
                    <p className="text-purple-700 text-sm mb-4">
                      Healthcare providers use BMR in metabolic assessments and treatment planning for conditions 
                      affecting metabolism like thyroid disorders.
                    </p>
                    <ul className="text-purple-700 text-xs space-y-1">
                      <li>• Assess metabolic health</li>
                      <li>• Monitor treatment progress</li>
                      <li>• Detect metabolic abnormalities</li>
                    </ul>
                  </div>
                  
                  <div className="bg-orange-50 rounded-lg p-6 border border-orange-100">
                    <h4 className="text-lg font-semibold text-orange-800 mb-3">Meal Planning</h4>
                    <p className="text-orange-700 text-sm mb-4">
                      Nutritionists use BMR calculations to create personalized meal plans that meet individual 
                      energy needs while supporting health goals.
                    </p>
                    <ul className="text-orange-700 text-xs space-y-1">
                      <li>• Design balanced meal plans</li>
                      <li>• Calculate portion sizes</li>
                      <li>• Plan nutrient distribution</li>
                    </ul>
                  </div>
                  
                  <div className="bg-red-50 rounded-lg p-6 border border-red-100">
                    <h4 className="text-lg font-semibold text-red-800 mb-3">Fitness Programming</h4>
                    <p className="text-red-700 text-sm mb-4">
                      Personal trainers use BMR to design appropriate exercise programs and nutrition strategies 
                      that align with client goals and metabolic capacity.
                    </p>
                    <ul className="text-red-700 text-xs space-y-1">
                      <li>• Customize training intensity</li>
                      <li>• Plan workout frequency</li>
                      <li>• Integrate nutrition timing</li>
                    </ul>
                  </div>
                  
                  <div className="bg-indigo-50 rounded-lg p-6 border border-indigo-100">
                    <h4 className="text-lg font-semibold text-indigo-800 mb-3">Medical Applications</h4>
                    <p className="text-indigo-700 text-sm mb-4">
                      Medical professionals use BMR in clinical settings for patients with metabolic disorders, 
                      eating disorders, or those requiring specialized nutrition support.
                    </p>
                    <ul className="text-indigo-700 text-xs space-y-1">
                      <li>• Clinical nutrition assessment</li>
                      <li>• Eating disorder treatment</li>
                      <li>• Critical care nutrition</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* BMR Optimization Tips */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">How to Optimize Your BMR</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <h4 className="font-semibold text-green-800 mb-2">✅ Build Lean Muscle Mass</h4>
                      <p className="text-green-700 text-sm">
                        Resistance training increases muscle mass, which burns more calories at rest than fat tissue. 
                        Each pound of muscle burns approximately 6-7 calories per day at rest.
                      </p>
                    </div>
                    
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <h4 className="font-semibold text-green-800 mb-2">✅ Maintain Adequate Protein Intake</h4>
                      <p className="text-green-700 text-sm">
                        Protein has a higher thermic effect than carbs or fats, meaning your body burns more calories 
                        digesting it. Aim for 0.8-1.2g per kg of body weight daily.
                      </p>
                    </div>
                    
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <h4 className="font-semibold text-green-800 mb-2">✅ Stay Hydrated and Get Quality Sleep</h4>
                      <p className="text-green-700 text-sm">
                        Dehydration can slow metabolism by up to 3%. Poor sleep affects hormones that regulate 
                        metabolism, including thyroid hormones and cortisol.
                      </p>
                    </div>
                  </div>
                  
                  <div className="space-y-6">
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <h4 className="font-semibold text-red-800 mb-2">❌ Avoid Extreme Calorie Restriction</h4>
                      <p className="text-red-700 text-sm">
                        Very low-calorie diets can cause adaptive thermogenesis, lowering your BMR by 10-40%. 
                        Aim for moderate deficits of 10-20% below TDEE for sustainable weight loss.
                      </p>
                    </div>
                    
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <h4 className="font-semibold text-red-800 mb-2">❌ Don't Skip Meals Regularly</h4>
                      <p className="text-red-700 text-sm">
                        Inconsistent eating patterns can negatively affect metabolic rate and hormone regulation. 
                        Maintain regular meal timing to support optimal metabolism.
                      </p>
                    </div>
                    
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <h4 className="font-semibold text-red-800 mb-2">❌ Avoid Chronic Stress</h4>
                      <p className="text-red-700 text-sm">
                        Chronic stress elevates cortisol, which can negatively impact metabolism and promote 
                        fat storage, particularly in the abdominal area. Practice stress management techniques.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* BMR FAQs */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-8">Frequently Asked Questions about BMR</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">Can I eat below my BMR to lose weight faster?</h4>
                      <p className="text-gray-600 text-sm">
                        Eating below BMR is not recommended as it can lead to muscle loss, nutrient deficiencies, and 
                        metabolic slowdown. Always eat at least your BMR and create deficits through activity or eating 
                        between BMR and TDEE.
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">How accurate are BMR calculations?</h4>
                      <p className="text-gray-600 text-sm">
                        BMR equations are estimates with about 10-15% accuracy for most people. Individual variations in 
                        genetics, body composition, and health status can affect actual metabolic rate. Use results as 
                        starting points and adjust based on real-world results.
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">Does BMR change with weight loss?</h4>
                      <p className="text-gray-600 text-sm">
                        Yes, BMR decreases as you lose weight because there's less body mass to maintain. Additionally, 
                        adaptive thermogenesis can further reduce metabolic rate during prolonged calorie restriction. 
                        Recalculate BMR every 10-15 pounds of weight change.
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">What's the difference between BMR and RMR?</h4>
                      <p className="text-gray-600 text-sm">
                        BMR is measured under very strict conditions (12-hour fast, 8-hour sleep, controlled temperature). 
                        RMR is measured in less restrictive conditions and is typically 10-20% higher than BMR. For 
                        practical purposes, the terms are often used interchangeably.
                      </p>
                    </div>
                  </div>
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">Can medications affect my BMR?</h4>
                      <p className="text-gray-600 text-sm">
                        Yes, certain medications can significantly affect metabolic rate. Thyroid medications, stimulants, 
                        antidepressants, and some diabetes medications can increase or decrease BMR. Consult your healthcare 
                        provider if you suspect medication is affecting your metabolism.
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">How does age affect BMR?</h4>
                      <p className="text-gray-600 text-sm">
                        BMR typically decreases by 2-3% per decade after age 30, primarily due to loss of muscle mass and 
                        changes in hormone levels. However, maintaining muscle mass through resistance training can help 
                        minimize age-related metabolic decline.
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">Should I eat the same calories every day?</h4>
                      <p className="text-gray-600 text-sm">
                        Not necessarily. Some people benefit from calorie cycling, eating more on training days and less 
                        on rest days. The key is maintaining your weekly calorie target while ensuring you don't go below 
                        BMR on low-calorie days.
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">Can I increase my BMR naturally?</h4>
                      <p className="text-gray-600 text-sm">
                        While genetics largely determine BMR, you can influence it through strength training (builds muscle), 
                        adequate protein intake, proper hydration, quality sleep, and avoiding extreme dieting. These 
                        strategies can help optimize your metabolic rate within your genetic potential.
                      </p>
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
