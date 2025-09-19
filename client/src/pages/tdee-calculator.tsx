
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

interface TDEEResult {
  bmr: number;
  tdee: number;
  activityFactor: number;
  activityDescription: string;
  caloriesForWeightLoss: {
    mild: number;
    moderate: number;
    aggressive: number;
  };
  caloriesForWeightGain: {
    mild: number;
    moderate: number;
  };
  macroBreakdown: {
    protein: { grams: number; calories: number };
    carbs: { grams: number; calories: number };
    fats: { grams: number; calories: number };
  };
}

const TDEECalculator = () => {
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [feet, setFeet] = useState('');
  const [inches, setInches] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [activityLevel, setActivityLevel] = useState('');
  const [unitSystem, setUnitSystem] = useState('metric');
  const [result, setResult] = useState<TDEEResult | null>(null);

  const calculateTDEE = () => {
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

    if (weightKg && heightCm && ageYears && gender && activityLevel) {
      // Mifflin-St Jeor Equation for BMR
      let bmr: number;
      if (gender === 'male') {
        bmr = 10 * weightKg + 6.25 * heightCm - 5 * ageYears + 5;
      } else {
        bmr = 10 * weightKg + 6.25 * heightCm - 5 * ageYears - 161;
      }

      // Activity multipliers
      const activityFactors = {
        sedentary: { factor: 1.2, description: 'Little to no exercise' },
        lightlyActive: { factor: 1.375, description: 'Light exercise 1-3 days/week' },
        moderatelyActive: { factor: 1.55, description: 'Moderate exercise 3-5 days/week' },
        veryActive: { factor: 1.725, description: 'Hard exercise 6-7 days/week' },
        extraActive: { factor: 1.9, description: 'Very hard exercise + physical job' }
      };

      const selectedActivity = activityFactors[activityLevel as keyof typeof activityFactors];
      const tdee = bmr * selectedActivity.factor;

      // Weight management calorie targets
      const caloriesForWeightLoss = {
        mild: tdee - 250,      // 0.5 lbs/week loss
        moderate: tdee - 500,  // 1 lb/week loss
        aggressive: tdee - 750 // 1.5 lbs/week loss
      };

      const caloriesForWeightGain = {
        mild: tdee + 250,      // 0.5 lbs/week gain
        moderate: tdee + 500   // 1 lb/week gain
      };

      // Macro breakdown (40% carbs, 30% protein, 30% fat)
      const macroBreakdown = {
        protein: {
          calories: Math.round(tdee * 0.30),
          grams: Math.round((tdee * 0.30) / 4)
        },
        carbs: {
          calories: Math.round(tdee * 0.40),
          grams: Math.round((tdee * 0.40) / 4)
        },
        fats: {
          calories: Math.round(tdee * 0.30),
          grams: Math.round((tdee * 0.30) / 9)
        }
      };

      setResult({
        bmr: Math.round(bmr),
        tdee: Math.round(tdee),
        activityFactor: selectedActivity.factor,
        activityDescription: selectedActivity.description,
        caloriesForWeightLoss: {
          mild: Math.round(caloriesForWeightLoss.mild),
          moderate: Math.round(caloriesForWeightLoss.moderate),
          aggressive: Math.round(caloriesForWeightLoss.aggressive)
        },
        caloriesForWeightGain: {
          mild: Math.round(caloriesForWeightGain.mild),
          moderate: Math.round(caloriesForWeightGain.moderate)
        },
        macroBreakdown
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
    setActivityLevel('');
    setUnitSystem('metric');
    setResult(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Helmet>
        <title>TDEE Calculator - Calculate Total Daily Energy Expenditure | DapsiWow</title>
        <meta name="description" content="Free TDEE calculator to calculate your Total Daily Energy Expenditure and daily calorie needs. Get personalized calorie targets for weight loss, maintenance, and gain with macro breakdown. Support for metric and imperial units." />
        <meta name="keywords" content="TDEE calculator, total daily energy expenditure, calorie calculator, BMR calculator, daily calorie needs, metabolism calculator, calorie targets, weight management calculator, macro calculator, energy expenditure calculator" />
        <meta property="og:title" content="TDEE Calculator - Calculate Total Daily Energy Expenditure | DapsiWow" />
        <meta property="og:description" content="Calculate your TDEE and get personalized calorie targets for optimal weight management with detailed macro breakdown." />
        <meta property="og:type" content="website" />
        <meta name="robots" content="index, follow" />
        <meta name="author" content="DapsiWow" />
        <link rel="canonical" href="https://dapsiwow.com/tools/tdee-calculator" />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            "name": "TDEE Calculator",
            "description": "Free online TDEE calculator to calculate Total Daily Energy Expenditure and personalized calorie targets for weight management. Features BMR calculation, activity levels, and macro breakdown.",
            "url": "https://dapsiwow.com/tools/tdee-calculator",
            "applicationCategory": "HealthApplication",
            "operatingSystem": "Any",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "USD"
            },
            "featureList": [
              "Calculate TDEE for any activity level",
              "BMR calculation using Mifflin-St Jeor equation",
              "Personalized calorie targets for weight goals",
              "Detailed macro breakdown",
              "Support for metric and imperial units",
              "Weight loss and gain planning"
            ]
          })}
        </script>
      </Helmet>
      
      <Header />
      
      <main>
        {/* Hero Section */}
        <section className="relative py-12 sm:py-16 md:py-20 lg:py-24 xl:py-28 2xl:py-32 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-indigo-600/20"></div>
          <div className="relative max-w-sm sm:max-w-lg md:max-w-2xl lg:max-w-4xl xl:max-w-5xl 2xl:max-w-6xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 xl:px-12 text-center">
            <div className="space-y-4 sm:space-y-6 md:space-y-8 lg:space-y-10">
              <div className="inline-flex items-center px-3 py-1.5 sm:px-4 sm:py-2 bg-white/80 backdrop-blur-sm rounded-full border border-blue-200">
                <span className="text-xs sm:text-sm font-medium text-blue-700">Professional TDEE Calculator</span>
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl 2xl:text-8xl font-bold text-slate-900 leading-tight tracking-tight">
                <span className="block">Smart TDEE</span>
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 mt-1 sm:mt-2">
                  Calculator
                </span>
              </h1>
              <p className="text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl text-slate-600 max-w-sm sm:max-w-lg md:max-w-2xl lg:max-w-3xl xl:max-w-4xl mx-auto leading-relaxed px-2 sm:px-0">
                Calculate your Total Daily Energy Expenditure and get personalized calorie targets for optimal health and fitness goals
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
                    <p className="text-gray-600">Enter your details to calculate your daily energy expenditure</p>
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

                    {/* Activity Level */}
                    <div className="md:col-span-2 space-y-3">
                      <Label className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                        Activity Level
                      </Label>
                      <Select value={activityLevel} onValueChange={setActivityLevel}>
                        <SelectTrigger className="h-14 border-2 border-gray-200 rounded-xl text-lg" data-testid="select-activity">
                          <SelectValue placeholder="Select activity level" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="sedentary">Sedentary - Little to no exercise</SelectItem>
                          <SelectItem value="lightlyActive">Lightly Active - Light exercise 1-3 days/week</SelectItem>
                          <SelectItem value="moderatelyActive">Moderately Active - Moderate exercise 3-5 days/week</SelectItem>
                          <SelectItem value="veryActive">Very Active - Hard exercise 6-7 days/week</SelectItem>
                          <SelectItem value="extraActive">Extra Active - Very hard exercise + physical job</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-4 pt-6">
                    <Button
                      onClick={calculateTDEE}
                      className="flex-1 h-14 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold text-lg rounded-xl shadow-lg transform transition-all duration-200 hover:scale-105"
                      data-testid="button-calculate"
                    >
                      Calculate TDEE
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
                  <h2 className="text-2xl font-bold text-gray-900 mb-8">TDEE Results</h2>
                  
                  {result ? (
                    <div className="space-y-6" data-testid="tdee-results">
                      {/* TDEE Value */}
                      <div className="bg-white rounded-2xl p-6 shadow-lg border border-blue-100">
                        <div className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-2">Total Daily Energy Expenditure</div>
                        <div className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600" data-testid="text-tdee-value">
                          {result.tdee} cal/day
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          {result.activityDescription} (×{result.activityFactor})
                        </p>
                      </div>

                      {/* BMR Reference */}
                      <div className="bg-white rounded-xl p-4 shadow-sm">
                        <div className="flex justify-between items-center">
                          <span className="font-medium text-gray-700">BMR (Base Metabolic Rate)</span>
                          <span className="font-bold text-gray-900" data-testid="text-bmr-value">
                            {result.bmr} cal/day
                          </span>
                        </div>
                      </div>

                      {/* Weight Management */}
                      <div className="space-y-4">
                        {/* Weight Loss */}
                        <div className="bg-gradient-to-r from-red-50 to-pink-50 rounded-xl p-4 border border-red-200">
                          <h4 className="font-bold text-red-800 mb-3 text-lg">Weight Loss Targets</h4>
                          <div className="space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="text-red-700 font-medium">Mild Loss (0.5 lbs/week)</span>
                              <span className="font-bold text-red-800 text-lg" data-testid="text-weight-loss-mild">
                                {result.caloriesForWeightLoss.mild} cal/day
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-red-700 font-medium">Moderate Loss (1 lb/week)</span>
                              <span className="font-bold text-red-800 text-lg" data-testid="text-weight-loss-moderate">
                                {result.caloriesForWeightLoss.moderate} cal/day
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-red-700 font-medium">Aggressive Loss (1.5 lbs/week)</span>
                              <span className="font-bold text-red-800 text-lg" data-testid="text-weight-loss-aggressive">
                                {result.caloriesForWeightLoss.aggressive} cal/day
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Weight Gain */}
                        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200">
                          <h4 className="font-bold text-green-800 mb-3 text-lg">Weight Gain Targets</h4>
                          <div className="space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="text-green-700 font-medium">Mild Gain (0.5 lbs/week)</span>
                              <span className="font-bold text-green-800 text-lg" data-testid="text-weight-gain-mild">
                                {result.caloriesForWeightGain.mild} cal/day
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-green-700 font-medium">Moderate Gain (1 lb/week)</span>
                              <span className="font-bold text-green-800 text-lg" data-testid="text-weight-gain-moderate">
                                {result.caloriesForWeightGain.moderate} cal/day
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Macro Breakdown */}
                      <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-4 border border-purple-200">
                        <h4 className="font-bold text-purple-800 mb-3 text-lg">Macro Breakdown (Maintenance)</h4>
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-purple-700 font-medium">Protein (30%)</span>
                            <span className="font-bold text-purple-800" data-testid="text-protein">
                              {result.macroBreakdown.protein.grams}g ({result.macroBreakdown.protein.calories} cal)
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-purple-700 font-medium">Carbohydrates (40%)</span>
                            <span className="font-bold text-purple-800" data-testid="text-carbs">
                              {result.macroBreakdown.carbs.grams}g ({result.macroBreakdown.carbs.calories} cal)
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-purple-700 font-medium">Fats (30%)</span>
                            <span className="font-bold text-purple-800" data-testid="text-fats">
                              {result.macroBreakdown.fats.grams}g ({result.macroBreakdown.fats.calories} cal)
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-16" data-testid="no-results">
                      <div className="w-20 h-20 bg-gray-200 rounded-full mx-auto mb-6 flex items-center justify-center">
                        <div className="text-3xl font-bold text-gray-400">⚡</div>
                      </div>
                      <p className="text-gray-500 text-lg">Enter your information to calculate TDEE and calorie targets</p>
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
                <h3 className="text-2xl font-bold text-gray-900 mb-6">What is TDEE?</h3>
                <div className="space-y-4 text-gray-600">
                  <p>
                    TDEE (Total Daily Energy Expenditure) represents the total number of calories your body burns in a 24-hour period, 
                    including all activities from basic bodily functions to intense exercise. Understanding your TDEE is crucial for 
                    effective weight management, whether your goal is to lose weight, gain muscle, or maintain your current physique.
                  </p>
                  <p>
                    Our TDEE calculator uses the scientifically validated Mifflin-St Jeor equation to calculate your Basal Metabolic 
                    Rate (BMR), then multiplies it by your activity factor to determine your total daily calorie needs. This provides 
                    a personalized foundation for creating effective nutrition and fitness plans.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">How to Use TDEE for Weight Goals</h3>
                <div className="space-y-4 text-gray-600">
                  <p>
                    The TDEE calculation follows this formula: TDEE = BMR × Activity Factor
                  </p>
                  <ul className="space-y-2 list-disc list-inside">
                    <li>BMR = Your body's energy needs at rest</li>
                    <li>Activity Factor = Multiplier based on your exercise level (1.2 - 1.9)</li>
                    <li>Caloric Deficit = TDEE minus 250-750 calories for weight loss</li>
                    <li>Caloric Surplus = TDEE plus 250-500 calories for weight gain</li>
                  </ul>
                  <p>
                    Our calculator automatically provides target calories for different weight goals, making it easy to plan your 
                    nutrition strategy without complex manual calculations.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Features of Our TDEE Calculator</h3>
                <div className="space-y-3 text-gray-600">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Mifflin-St Jeor equation for accurate BMR calculation</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Five detailed activity levels for precise TDEE estimation</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Personalized calorie targets for weight loss and gain</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Detailed macronutrient breakdown for optimal nutrition</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Support for both metric and imperial measurement systems</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Benefits of TDEE Calculation</h3>
                <div className="space-y-3 text-gray-600">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Create sustainable nutrition plans based on your actual needs</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Avoid extreme dieting by understanding your minimum calorie requirements</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Optimize your fitness goals with precise calorie and macro targets</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Track progress more effectively with scientific backing</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Make informed decisions about diet and exercise programs</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Comprehensive SEO Content Sections */}
          <div className="mt-12 space-y-8">
            {/* Understanding BMR vs TDEE */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Understanding BMR vs TDEE: The Foundation of Metabolism</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-gray-800">Basal Metabolic Rate (BMR)</h4>
                    <p className="text-gray-600">
                      BMR represents the minimum number of calories your body needs to function at rest. This includes essential 
                      processes like breathing, circulation, cell production, nutrient processing, and protein synthesis. BMR 
                      typically accounts for 60-75% of your total daily energy expenditure.
                    </p>
                    <p className="text-gray-600">
                      Our calculator uses the Mifflin-St Jeor equation, which is considered the most accurate for healthy adults:
                    </p>
                    <div className="bg-blue-50 rounded-lg p-4">
                      <p className="font-mono text-sm text-blue-800">
                        <strong>Men:</strong> BMR = 10 × weight(kg) + 6.25 × height(cm) - 5 × age + 5<br/>
                        <strong>Women:</strong> BMR = 10 × weight(kg) + 6.25 × height(cm) - 5 × age - 161
                      </p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-gray-800">Total Daily Energy Expenditure (TDEE)</h4>
                    <p className="text-gray-600">
                      TDEE encompasses your BMR plus all additional calories burned through physical activity, including exercise, 
                      work activities, and even fidgeting (known as Non-Exercise Activity Thermogenesis or NEAT). TDEE provides 
                      the complete picture of your daily caloric needs.
                    </p>
                    <p className="text-gray-600">
                      The relationship between BMR and TDEE depends on your activity level:
                    </p>
                    <div className="space-y-2">
                      <div className="p-2 bg-gray-50 rounded text-sm">
                        <strong>Sedentary:</strong> BMR × 1.2 (little to no exercise)
                      </div>
                      <div className="p-2 bg-gray-50 rounded text-sm">
                        <strong>Lightly Active:</strong> BMR × 1.375 (light exercise 1-3 days/week)
                      </div>
                      <div className="p-2 bg-gray-50 rounded text-sm">
                        <strong>Moderately Active:</strong> BMR × 1.55 (moderate exercise 3-5 days/week)
                      </div>
                      <div className="p-2 bg-gray-50 rounded text-sm">
                        <strong>Very Active:</strong> BMR × 1.725 (hard exercise 6-7 days/week)
                      </div>
                      <div className="p-2 bg-gray-50 rounded text-sm">
                        <strong>Extra Active:</strong> BMR × 1.9 (very hard exercise + physical job)
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Activity Level Guidelines */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Choosing Your Activity Level: A Detailed Guide</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div className="border-l-4 border-red-400 pl-4">
                      <h4 className="font-semibold text-gray-800 mb-2">Sedentary (1.2)</h4>
                      <p className="text-gray-600 text-sm mb-2">
                        You have a desk job with little to no exercise. Your day involves mostly sitting, driving, 
                        lying down, or standing with minimal movement.
                      </p>
                      <p className="text-xs text-gray-500">
                        <strong>Examples:</strong> Office workers, students, remote workers, retirees with minimal activity
                      </p>
                    </div>
                    
                    <div className="border-l-4 border-orange-400 pl-4">
                      <h4 className="font-semibold text-gray-800 mb-2">Lightly Active (1.375)</h4>
                      <p className="text-gray-600 text-sm mb-2">
                        You exercise lightly 1-3 days per week. This includes walking for exercise, light jogging, 
                        or recreational sports played casually.
                      </p>
                      <p className="text-xs text-gray-500">
                        <strong>Examples:</strong> Weekend warriors, casual gym-goers, people who walk regularly
                      </p>
                    </div>
                    
                    <div className="border-l-4 border-yellow-400 pl-4">
                      <h4 className="font-semibold text-gray-800 mb-2">Moderately Active (1.55)</h4>
                      <p className="text-gray-600 text-sm mb-2">
                        You exercise moderately 3-5 days per week. This includes regular gym sessions, running, 
                        cycling, swimming, or playing sports consistently.
                      </p>
                      <p className="text-xs text-gray-500">
                        <strong>Examples:</strong> Regular gym members, recreational athletes, consistent exercisers
                      </p>
                    </div>
                  </div>
                  
                  <div className="space-y-6">
                    <div className="border-l-4 border-green-400 pl-4">
                      <h4 className="font-semibold text-gray-800 mb-2">Very Active (1.725)</h4>
                      <p className="text-gray-600 text-sm mb-2">
                        You exercise hard 6-7 days per week. This includes intense training sessions, competitive 
                        sports, or high-intensity workouts almost daily.
                      </p>
                      <p className="text-xs text-gray-500">
                        <strong>Examples:</strong> Competitive athletes, fitness enthusiasts, personal trainers
                      </p>
                    </div>
                    
                    <div className="border-l-4 border-blue-400 pl-4">
                      <h4 className="font-semibold text-gray-800 mb-2">Extra Active (1.9)</h4>
                      <p className="text-gray-600 text-sm mb-2">
                        You have a very physically demanding job plus exercise, or you exercise multiple times per day. 
                        This represents the highest level of daily energy expenditure.
                      </p>
                      <p className="text-xs text-gray-500">
                        <strong>Examples:</strong> Professional athletes, construction workers who also train, military personnel
                      </p>
                    </div>
                    
                    <div className="bg-blue-50 rounded-lg p-4">
                      <h4 className="font-semibold text-blue-800 mb-2">Choosing the Right Level</h4>
                      <p className="text-blue-700 text-sm">
                        When in doubt, choose a lower activity level. It's better to underestimate and adjust upward 
                        based on results than to overestimate and slow your progress. Monitor your weight changes over 
                        2-3 weeks and adjust accordingly.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Weight Management Strategies */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
                <CardContent className="p-8">
                  <h3 className="text-xl font-bold text-gray-900 mb-6">Weight Loss Strategy</h3>
                  <div className="space-y-4 text-gray-600">
                    <p className="text-sm">
                      Effective weight loss requires creating a sustainable caloric deficit while maintaining adequate 
                      nutrition and energy for daily activities.
                    </p>
                    <div className="space-y-3">
                      <div className="bg-red-50 rounded-lg p-3">
                        <h4 className="font-semibold text-red-800 text-sm">Mild Deficit (250 cal/day)</h4>
                        <p className="text-red-700 text-xs">0.5 lbs/week loss - Sustainable long-term approach</p>
                      </div>
                      <div className="bg-orange-50 rounded-lg p-3">
                        <h4 className="font-semibold text-orange-800 text-sm">Moderate Deficit (500 cal/day)</h4>
                        <p className="text-orange-700 text-xs">1 lb/week loss - Balanced approach for most people</p>
                      </div>
                      <div className="bg-yellow-50 rounded-lg p-3">
                        <h4 className="font-semibold text-yellow-800 text-sm">Aggressive Deficit (750 cal/day)</h4>
                        <p className="text-yellow-700 text-xs">1.5 lbs/week loss - Short-term approach with monitoring</p>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500">
                      <strong>Important:</strong> Never go below 1200 calories/day for women or 1500 calories/day for men 
                      without medical supervision.
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
                <CardContent className="p-8">
                  <h3 className="text-xl font-bold text-gray-900 mb-6">Weight Maintenance</h3>
                  <div className="space-y-4 text-gray-600">
                    <p className="text-sm">
                      Maintaining your current weight means eating approximately your TDEE calories while focusing 
                      on body composition improvements through exercise.
                    </p>
                    <div className="space-y-3">
                      <div className="bg-blue-50 rounded-lg p-3">
                        <h4 className="font-semibold text-blue-800 text-sm">Calorie Range</h4>
                        <p className="text-blue-700 text-xs">TDEE ± 100-200 calories for natural fluctuations</p>
                      </div>
                      <div className="bg-green-50 rounded-lg p-3">
                        <h4 className="font-semibold text-green-800 text-sm">Focus Areas</h4>
                        <p className="text-green-700 text-xs">Nutrient quality, meal timing, and exercise consistency</p>
                      </div>
                      <div className="bg-purple-50 rounded-lg p-3">
                        <h4 className="font-semibold text-purple-800 text-sm">Body Recomposition</h4>
                        <p className="text-purple-700 text-xs">Build muscle while maintaining weight through strength training</p>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500">
                      <strong>Tip:</strong> Track weekly averages rather than daily weights for better accuracy.
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
                <CardContent className="p-8">
                  <h3 className="text-xl font-bold text-gray-900 mb-6">Weight Gain Strategy</h3>
                  <div className="space-y-4 text-gray-600">
                    <p className="text-sm">
                      Healthy weight gain focuses on building lean muscle mass while minimizing excess fat gain 
                      through controlled caloric surplus and resistance training.
                    </p>
                    <div className="space-y-3">
                      <div className="bg-green-50 rounded-lg p-3">
                        <h4 className="font-semibold text-green-800 text-sm">Mild Surplus (250 cal/day)</h4>
                        <p className="text-green-700 text-xs">0.5 lbs/week gain - Lean muscle focus</p>
                      </div>
                      <div className="bg-emerald-50 rounded-lg p-3">
                        <h4 className="font-semibold text-emerald-800 text-sm">Moderate Surplus (500 cal/day)</h4>
                        <p className="text-emerald-700 text-xs">1 lb/week gain - Balanced muscle and weight gain</p>
                      </div>
                      <div className="bg-teal-50 rounded-lg p-3">
                        <h4 className="font-semibold text-teal-800 text-sm">Essential Components</h4>
                        <p className="text-teal-700 text-xs">Strength training, adequate protein, progressive overload</p>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500">
                      <strong>Key:</strong> Combine caloric surplus with resistance training for optimal muscle growth.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Macronutrient Breakdown */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Understanding Macronutrient Distribution</h3>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-gray-800">Protein (30% of calories)</h4>
                    <div className="space-y-3 text-gray-600">
                      <p className="text-sm">
                        Protein provides 4 calories per gram and is essential for muscle maintenance, growth, and repair. 
                        Our calculator allocates 30% of your TDEE to protein, which supports muscle preservation during 
                        weight loss and muscle growth during weight gain.
                      </p>
                      <div className="bg-blue-50 rounded-lg p-3">
                        <h5 className="font-semibold text-blue-800 text-sm mb-2">Benefits:</h5>
                        <ul className="text-blue-700 text-xs space-y-1 list-disc list-inside">
                          <li>Increases satiety and reduces hunger</li>
                          <li>Higher thermic effect (burns more calories to digest)</li>
                          <li>Preserves lean muscle mass during weight loss</li>
                          <li>Supports recovery and adaptation from exercise</li>
                        </ul>
                      </div>
                      <p className="text-xs text-gray-500">
                        <strong>Best Sources:</strong> Lean meats, fish, eggs, dairy, legumes, protein powders
                      </p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-gray-800">Carbohydrates (40% of calories)</h4>
                    <div className="space-y-3 text-gray-600">
                      <p className="text-sm">
                        Carbohydrates provide 4 calories per gram and serve as your body's preferred energy source, 
                        especially for brain function and high-intensity exercise. The 40% allocation supports optimal 
                        performance and recovery.
                      </p>
                      <div className="bg-green-50 rounded-lg p-3">
                        <h5 className="font-semibold text-green-800 text-sm mb-2">Benefits:</h5>
                        <ul className="text-green-700 text-xs space-y-1 list-disc list-inside">
                          <li>Provides quick energy for workouts</li>
                          <li>Supports brain function and mood</li>
                          <li>Helps with muscle glycogen replenishment</li>
                          <li>Can improve sleep quality when timed properly</li>
                        </ul>
                      </div>
                      <p className="text-xs text-gray-500">
                        <strong>Best Sources:</strong> Whole grains, fruits, vegetables, legumes, starchy vegetables
                      </p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-gray-800">Fats (30% of calories)</h4>
                    <div className="space-y-3 text-gray-600">
                      <p className="text-sm">
                        Fats provide 9 calories per gram and are crucial for hormone production, vitamin absorption, 
                        and cellular function. The 30% allocation ensures adequate essential fatty acid intake while 
                        supporting various physiological processes.
                      </p>
                      <div className="bg-purple-50 rounded-lg p-3">
                        <h5 className="font-semibold text-purple-800 text-sm mb-2">Benefits:</h5>
                        <ul className="text-purple-700 text-xs space-y-1 list-disc list-inside">
                          <li>Supports hormone production (especially testosterone)</li>
                          <li>Enhances absorption of fat-soluble vitamins</li>
                          <li>Provides sustained energy for longer activities</li>
                          <li>Improves meal satisfaction and taste</li>
                        </ul>
                      </div>
                      <p className="text-xs text-gray-500">
                        <strong>Best Sources:</strong> Nuts, seeds, avocados, olive oil, fatty fish, egg yolks
                      </p>
                    </div>
                  </div>
                </div>
                <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
                  <h4 className="font-semibold text-blue-800 mb-2">Customizing Your Macros</h4>
                  <p className="text-blue-700 text-sm">
                    While our 30/40/30 split works well for most people, you may need to adjust based on your specific goals, 
                    training style, and personal preferences. Athletes might need more carbohydrates, while those following 
                    ketogenic diets would increase fats and reduce carbohydrates significantly.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Common Mistakes and Best Practices */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Common TDEE Calculation Mistakes and How to Avoid Them</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-r-lg">
                      <h4 className="font-semibold text-red-800 mb-2">Overestimating Activity Level</h4>
                      <p className="text-red-700 text-sm">Many people choose "Very Active" when they should select "Moderately Active" or lower. Be honest about your actual exercise frequency and intensity.</p>
                    </div>
                    <div className="bg-orange-50 border-l-4 border-orange-400 p-4 rounded-r-lg">
                      <h4 className="font-semibold text-orange-800 mb-2">Not Accounting for Lifestyle Changes</h4>
                      <p className="text-orange-700 text-sm">Your TDEE changes with job changes, seasonal activity variations, and life circumstances. Recalculate every few months or when your routine changes significantly.</p>
                    </div>
                    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-lg">
                      <h4 className="font-semibold text-yellow-800 mb-2">Ignoring Individual Variations</h4>
                      <p className="text-yellow-700 text-sm">TDEE calculators provide estimates. Your actual needs may be 10-15% higher or lower due to genetics, metabolic efficiency, and other factors.</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-lg">
                      <h4 className="font-semibold text-blue-800 mb-2">Setting Unrealistic Deficits</h4>
                      <p className="text-blue-700 text-sm">Extreme caloric deficits (over 1000 calories below TDEE) can lead to muscle loss, metabolic slowdown, and unsustainable hunger levels.</p>
                    </div>
                    <div className="bg-purple-50 border-l-4 border-purple-400 p-4 rounded-r-lg">
                      <h4 className="font-semibold text-purple-800 mb-2">Not Tracking Progress Properly</h4>
                      <p className="text-purple-700 text-sm">Weight fluctuates daily due to hydration, food timing, and other factors. Track weekly averages and body measurements for better accuracy.</p>
                    </div>
                    <div className="bg-green-50 border-l-4 border-green-400 p-4 rounded-r-lg">
                      <h4 className="font-semibold text-green-800 mb-2">Forgetting to Adjust Over Time</h4>
                      <p className="text-green-700 text-sm">As you lose or gain weight, your BMR and TDEE change. Recalculate every 10-15 pounds of weight change to maintain accuracy.</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* TDEE for Special Populations */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
                <CardContent className="p-8">
                  <h3 className="text-xl font-bold text-gray-900 mb-6">TDEE Considerations for Athletes</h3>
                  <div className="space-y-4 text-gray-600">
                    <p className="text-sm">
                      Athletes and highly active individuals often have unique energy needs that may exceed standard TDEE calculations. 
                      Endurance athletes, in particular, may burn significantly more calories than the "Extra Active" category suggests.
                    </p>
                    <div className="space-y-3">
                      <div className="bg-blue-50 rounded-lg p-3">
                        <h4 className="font-semibold text-blue-800 text-sm">Endurance Athletes</h4>
                        <p className="text-blue-700 text-xs">May need 2.5-4x BMR during heavy training periods</p>
                      </div>
                      <div className="bg-green-50 rounded-lg p-3">
                        <h4 className="font-semibold text-green-800 text-sm">Strength Athletes</h4>
                        <p className="text-green-700 text-xs">Typically fall within 1.6-2.2x BMR range</p>
                      </div>
                      <div className="bg-purple-50 rounded-lg p-3">
                        <h4 className="font-semibold text-purple-800 text-sm">Team Sport Athletes</h4>
                        <p className="text-purple-700 text-xs">Variable needs based on training and competition schedule</p>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500">
                      <strong>Recommendation:</strong> Work with a sports nutritionist for precise calculations during peak training.
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
                <CardContent className="p-8">
                  <h3 className="text-xl font-bold text-gray-900 mb-6">TDEE for Older Adults</h3>
                  <div className="space-y-4 text-gray-600">
                    <p className="text-sm">
                      Metabolic rate naturally decreases with age due to loss of muscle mass, reduced physical activity, 
                      and changes in hormone levels. However, regular exercise can significantly offset these changes.
                    </p>
                    <div className="space-y-3">
                      <div className="bg-orange-50 rounded-lg p-3">
                        <h4 className="font-semibold text-orange-800 text-sm">Age-Related Changes</h4>
                        <p className="text-orange-700 text-xs">BMR decreases approximately 1-2% per decade after age 30</p>
                      </div>
                      <div className="bg-red-50 rounded-lg p-3">
                        <h4 className="font-semibold text-red-800 text-sm">Muscle Mass Priority</h4>
                        <p className="text-red-700 text-xs">Resistance training becomes crucial for maintaining metabolism</p>
                      </div>
                      <div className="bg-yellow-50 rounded-lg p-3">
                        <h4 className="font-semibold text-yellow-800 text-sm">Protein Needs</h4>
                        <p className="text-yellow-700 text-xs">May need higher protein intake (1.2-1.6g/kg) to preserve muscle</p>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500">
                      <strong>Key:</strong> Focus on maintaining muscle mass and staying active to preserve metabolic rate.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* TDEE and Health Conditions */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">TDEE Considerations for Health Conditions</h3>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-gray-800">Thyroid Conditions</h4>
                    <div className="space-y-3 text-gray-600">
                      <p className="text-sm">
                        Thyroid disorders can significantly affect metabolic rate. Hyperthyroidism increases TDEE, 
                        while hypothyroidism decreases it.
                      </p>
                      <div className="bg-blue-50 rounded-lg p-3">
                        <h5 className="font-semibold text-blue-800 text-xs mb-1">Hypothyroidism</h5>
                        <p className="text-blue-700 text-xs">May need to reduce calculated TDEE by 10-40%</p>
                      </div>
                      <div className="bg-red-50 rounded-lg p-3">
                        <h5 className="font-semibold text-red-800 text-xs mb-1">Hyperthyroidism</h5>
                        <p className="text-red-700 text-xs">May need to increase calculated TDEE by 10-30%</p>
                      </div>
                      <p className="text-xs text-gray-500">
                        Always work with healthcare providers for management.
                      </p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-gray-800">Diabetes Management</h4>
                    <div className="space-y-3 text-gray-600">
                      <p className="text-sm">
                        Both Type 1 and Type 2 diabetes require careful calorie and carbohydrate management in 
                        conjunction with TDEE calculations.
                      </p>
                      <div className="bg-green-50 rounded-lg p-3">
                        <h5 className="font-semibold text-green-800 text-xs mb-1">Type 1 Diabetes</h5>
                        <p className="text-green-700 text-xs">Focus on carb counting with TDEE-based portions</p>
                      </div>
                      <div className="bg-purple-50 rounded-lg p-3">
                        <h5 className="font-semibold text-purple-800 text-xs mb-1">Type 2 Diabetes</h5>
                        <p className="text-purple-700 text-xs">Weight management often improves insulin sensitivity</p>
                      </div>
                      <p className="text-xs text-gray-500">
                        Coordinate with diabetes care team for best results.
                      </p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-gray-800">Metabolic Syndrome</h4>
                    <div className="space-y-3 text-gray-600">
                      <p className="text-sm">
                        Metabolic syndrome can affect insulin sensitivity and fat storage, potentially requiring 
                        adjustments to standard TDEE calculations.
                      </p>
                      <div className="bg-orange-50 rounded-lg p-3">
                        <h5 className="font-semibold text-orange-800 text-xs mb-1">Insulin Resistance</h5>
                        <p className="text-orange-700 text-xs">May benefit from lower carb, higher protein ratios</p>
                      </div>
                      <div className="bg-yellow-50 rounded-lg p-3">
                        <h5 className="font-semibold text-yellow-800 text-xs mb-1">Fat Distribution</h5>
                        <p className="text-yellow-700 text-xs">Abdominal fat may require more aggressive deficits</p>
                      </div>
                      <p className="text-xs text-gray-500">
                        Medical supervision recommended for best outcomes.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Related Calculators */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-8">Related Health and Fitness Calculators</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6 hover:shadow-md transition-shadow">
                    <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mb-4">
                      <span className="text-white text-xl font-bold">📊</span>
                    </div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-3">
                      <a href="/tools/bmr-calculator" className="hover:text-blue-600 transition-colors">BMR Calculator</a>
                    </h4>
                    <p className="text-gray-600 text-sm mb-3">
                      Calculate your Basal Metabolic Rate to understand your body's minimum calorie needs at rest.
                    </p>
                    <div className="text-xs text-blue-700">Perfect companion to TDEE for detailed metabolic analysis</div>
                  </div>

                  <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-6 hover:shadow-md transition-shadow">
                    <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center mb-4">
                      <span className="text-white text-xl font-bold">⚖️</span>
                    </div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-3">
                      <a href="/tools/bmi-calculator" className="hover:text-green-600 transition-colors">BMI Calculator</a>
                    </h4>
                    <p className="text-gray-600 text-sm mb-3">
                      Calculate your Body Mass Index and get health insights based on your height and weight.
                    </p>
                    <div className="text-xs text-green-700">Essential for understanding your current health status</div>
                  </div>

                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-6 hover:shadow-md transition-shadow">
                    <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center mb-4">
                      <span className="text-white text-xl font-bold">🥗</span>
                    </div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-3">
                      <a href="/tools/calorie-calculator" className="hover:text-purple-600 transition-colors">Calorie Calculator</a>
                    </h4>
                    <p className="text-gray-600 text-sm mb-3">
                      Calculate daily calorie needs with detailed macronutrient breakdown for optimal nutrition planning.
                    </p>
                    <div className="text-xs text-purple-700">Comprehensive nutrition planning tool</div>
                  </div>

                  <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-6 hover:shadow-md transition-shadow">
                    <div className="w-12 h-12 bg-orange-600 rounded-lg flex items-center justify-center mb-4">
                      <span className="text-white text-xl font-bold">🏃</span>
                    </div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-3">
                      <a href="/tools/protein-intake-calculator" className="hover:text-orange-600 transition-colors">Protein Calculator</a>
                    </h4>
                    <p className="text-gray-600 text-sm mb-3">
                      Calculate your daily protein requirements based on activity level and fitness goals.
                    </p>
                    <div className="text-xs text-orange-700">Optimize muscle building and recovery</div>
                  </div>

                  <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg p-6 hover:shadow-md transition-shadow">
                    <div className="w-12 h-12 bg-red-600 rounded-lg flex items-center justify-center mb-4">
                      <span className="text-white text-xl font-bold">💪</span>
                    </div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-3">
                      <a href="/tools/body-fat-calculator" className="hover:text-red-600 transition-colors">Body Fat Calculator</a>
                    </h4>
                    <p className="text-gray-600 text-sm mb-3">
                      Calculate body fat percentage using proven measurement methods for accurate body composition.
                    </p>
                    <div className="text-xs text-red-700">Track body composition changes beyond weight</div>
                  </div>

                  <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-lg p-6 hover:shadow-md transition-shadow">
                    <div className="w-12 h-12 bg-indigo-600 rounded-lg flex items-center justify-center mb-4">
                      <span className="text-white text-xl font-bold">🎯</span>
                    </div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-3">
                      <a href="/tools/ideal-weight-calculator" className="hover:text-indigo-600 transition-colors">Ideal Weight Calculator</a>
                    </h4>
                    <p className="text-gray-600 text-sm mb-3">
                      Calculate your ideal body weight using multiple proven formulas and health standards.
                    </p>
                    <div className="text-xs text-indigo-700">Set realistic and healthy weight goals</div>
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

export default TDEECalculator;
