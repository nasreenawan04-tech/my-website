
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

interface CalorieResult {
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
  weeklyCalorieDeficit?: number;
  monthlyWeightLoss?: number;
}

export default function CalorieCalculator() {
  const [weight, setWeight] = useState('70');
  const [height, setHeight] = useState('175');
  const [feet, setFeet] = useState('5');
  const [inches, setInches] = useState('9');
  const [age, setAge] = useState('30');
  const [gender, setGender] = useState('male');
  const [unitSystem, setUnitSystem] = useState('metric');
  const [activityLevel, setActivityLevel] = useState('moderately-active');
  const [goal, setGoal] = useState('maintain');
  const [equation, setEquation] = useState('mifflin');
  const [customDeficit, setCustomDeficit] = useState('500');
  const [result, setResult] = useState<CalorieResult | null>(null);

  const calculateCalories = () => {
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

      // Calculate calorie goals based on selected goal
      let maintenanceCalories = tdee;
      let weightLossCalories, weightGainCalories;
      let weeklyCalorieDeficit, monthlyWeightLoss;

      if (goal === 'lose') {
        const customDeficitValue = parseFloat(customDeficit) || 500;
        weightLossCalories = {
          mild: tdee - 250,      // 0.5 lbs/week
          moderate: tdee - customDeficitValue,  // Custom deficit
          aggressive: tdee - 750 // 1.5 lbs/week
        };
        weightGainCalories = {
          mild: tdee + 250,
          moderate: tdee + 500
        };
        weeklyCalorieDeficit = customDeficitValue * 7;
        monthlyWeightLoss = (customDeficitValue * 30) / 3500; // 3500 cal = 1 lb
      } else if (goal === 'gain') {
        weightLossCalories = {
          mild: tdee - 250,
          moderate: tdee - 500,
          aggressive: tdee - 750
        };
        weightGainCalories = {
          mild: tdee + 250,      // 0.5 lbs/week
          moderate: tdee + 500   // 1 lb/week
        };
      } else {
        // Maintain weight
        weightLossCalories = {
          mild: tdee - 250,
          moderate: tdee - 500,
          aggressive: tdee - 750
        };
        weightGainCalories = {
          mild: tdee + 250,
          moderate: tdee + 500
        };
      }

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
        equation: equationUsed,
        weeklyCalorieDeficit,
        monthlyWeightLoss
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
    setGoal('maintain');
    setEquation('mifflin');
    setCustomDeficit('500');
    setResult(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Helmet>
        <title>Calorie Calculator - Calculate Daily Calorie Needs | DapsiWow</title>
        <meta name="description" content="Free calorie calculator to determine your daily calorie needs for weight loss, maintenance, or gain. Get personalized calorie targets based on BMR, activity level, and fitness goals with macronutrient breakdown." />
        <meta name="keywords" content="calorie calculator, daily calorie needs, calorie counter, weight loss calculator, maintenance calories, BMR calculator, TDEE calculator, macro calculator, calorie deficit calculator, calorie surplus calculator" />
        <meta property="og:title" content="Calorie Calculator - Calculate Daily Calorie Needs | DapsiWow" />
        <meta property="og:description" content="Calculate your daily calorie needs for weight management with our accurate calorie calculator. Get personalized targets and macro breakdowns." />
        <meta property="og:type" content="website" />
        <meta name="robots" content="index, follow" />
        <meta name="author" content="DapsiWow" />
        <link rel="canonical" href="https://dapsiwow.com/tools/calorie-calculator" />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            "name": "Calorie Calculator",
            "description": "Free online calorie calculator to determine daily calorie needs for weight management, including BMR, TDEE, and macronutrient calculations.",
            "url": "https://dapsiwow.com/tools/calorie-calculator",
            "applicationCategory": "HealthApplication",
            "operatingSystem": "Any",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "USD"
            },
            "featureList": [
              "Calculate daily calorie needs",
              "BMR and TDEE calculations",
              "Weight loss and gain targets",
              "Macronutrient breakdown",
              "Multiple calculation methods",
              "Activity level adjustments"
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
                <span className="text-sm font-medium text-blue-700">Professional Calorie Calculator</span>
              </div>
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-slate-900 leading-tight">
                Smart Calorie
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                  Calculator
                </span>
              </h1>
              <p className="text-xl sm:text-2xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
                Calculate your daily calorie needs for optimal weight management and health goals
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
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">Calorie Configuration</h2>
                    <p className="text-gray-600">Enter your details to calculate personalized daily calorie needs</p>
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

                    {/* Goal */}
                    <div className="space-y-3">
                      <Label className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                        Primary Goal
                      </Label>
                      <Select value={goal} onValueChange={setGoal}>
                        <SelectTrigger className="h-14 border-2 border-gray-200 rounded-xl text-lg" data-testid="select-goal">
                          <SelectValue placeholder="Select your goal" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="lose">Lose Weight</SelectItem>
                          <SelectItem value="maintain">Maintain Weight</SelectItem>
                          <SelectItem value="gain">Gain Weight</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Calculation Method */}
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

                    {/* Custom Deficit (only show if goal is lose weight) */}
                    {goal === 'lose' && (
                      <div className="space-y-3">
                        <Label htmlFor="custom-deficit" className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                          Daily Calorie Deficit
                        </Label>
                        <Input
                          id="custom-deficit"
                          type="number"
                          value={customDeficit}
                          onChange={(e) => setCustomDeficit(e.target.value)}
                          className="h-14 text-lg border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-blue-500"
                          placeholder="500"
                          min="200"
                          max="1000"
                          data-testid="input-custom-deficit"
                        />
                        <p className="text-xs text-gray-500">Recommended: 250-750 calories/day</p>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-4 pt-6">
                    <Button
                      onClick={calculateCalories}
                      className="flex-1 h-14 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold text-lg rounded-xl shadow-lg transform transition-all duration-200 hover:scale-105"
                      data-testid="button-calculate"
                    >
                      Calculate Calories
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
                    <div className="space-y-6" data-testid="calorie-results">
                      {/* Daily Calorie Needs Highlight */}
                      <div className="bg-white rounded-2xl p-6 shadow-lg border border-blue-100">
                        <div className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-2">Daily Calorie Needs</div>
                        <div className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 mb-2" data-testid="text-daily-calories">
                          {result.maintenanceCalories} cal/day
                        </div>
                        <div className="text-xs text-gray-500">Using {result.equation} equation</div>
                      </div>

                      {/* BMR & TDEE */}
                      <div className="space-y-4">
                        <div className="bg-white rounded-xl p-4 shadow-sm">
                          <div className="flex justify-between items-center">
                            <span className="font-medium text-gray-700">Basal Metabolic Rate (BMR)</span>
                            <span className="font-bold text-gray-900" data-testid="text-bmr">
                              {result.bmr} cal/day
                            </span>
                          </div>
                        </div>
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
                      </div>

                      {/* Goal-based recommendations */}
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

                      {/* Weekly Progress Insight */}
                      {result.weeklyCalorieDeficit && result.monthlyWeightLoss && (
                        <div className="bg-purple-50 rounded-xl p-4 border border-purple-200">
                          <h4 className="font-semibold text-purple-800 mb-3">Progress Insights</h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-purple-700">Weekly Calorie Deficit:</span>
                              <span className="font-bold text-purple-800">{result.weeklyCalorieDeficit} calories</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-purple-700">Expected Monthly Weight Loss:</span>
                              <span className="font-bold text-purple-800">{result.monthlyWeightLoss?.toFixed(1)} lbs</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-16" data-testid="no-results">
                      <div className="w-20 h-20 bg-gray-200 rounded-full mx-auto mb-6 flex items-center justify-center">
                        <div className="text-3xl font-bold text-gray-400">CAL</div>
                      </div>
                      <p className="text-gray-500 text-lg">Enter your details and calculate to see calorie results</p>
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
                <h3 className="text-2xl font-bold text-gray-900 mb-6">What is a Calorie Calculator?</h3>
                <div className="space-y-4 text-gray-600">
                  <p>
                    A calorie calculator is an essential tool that determines your daily caloric needs based on personal 
                    factors like age, gender, weight, height, and activity level. It calculates your Basal Metabolic Rate (BMR) 
                    and Total Daily Energy Expenditure (TDEE) to provide accurate calorie targets for your specific health goals.
                  </p>
                  <p>
                    Our advanced calorie calculator uses scientifically proven equations like Mifflin-St Jeor and Harris-Benedict 
                    to deliver precise results. Whether you want to lose weight, maintain your current weight, or build muscle, 
                    this calculator provides personalized recommendations with detailed macronutrient breakdowns.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">How to Calculate Daily Calories?</h3>
                <div className="space-y-4 text-gray-600">
                  <p>
                    Daily calorie calculation involves two main steps:
                  </p>
                  <div className="bg-blue-50 rounded-lg p-4">
                    <p className="font-mono text-sm mb-2"><strong>Step 1: BMR Calculation</strong></p>
                    <p className="text-sm">Mifflin-St Jeor: BMR = 10×weight(kg) + 6.25×height(cm) - 5×age + gender factor</p>
                  </div>
                  <div className="bg-green-50 rounded-lg p-4">
                    <p className="font-mono text-sm mb-2"><strong>Step 2: Activity Adjustment</strong></p>
                    <p className="text-sm">TDEE = BMR × Activity Factor (1.2 to 1.9)</p>
                  </div>
                  <p>
                    Our calculator then adjusts these values based on your specific goals, creating personalized 
                    calorie targets for weight loss, maintenance, or muscle gain.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">BMR vs TDEE vs Daily Calories</h3>
                <div className="space-y-3 text-gray-600">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <div>
                      <strong>BMR (Basal Metabolic Rate):</strong> Calories needed for basic body functions at rest
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
                      <strong>Daily Calorie Goal:</strong> TDEE adjusted for your specific weight management goals
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                    <div>
                      <strong>Calorie Deficit/Surplus:</strong> Amount below or above TDEE for weight change
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Benefits of Our Calculator</h3>
                <div className="space-y-3 text-gray-600">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Accurate calculations using validated scientific equations</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Personalized calorie targets for any fitness goal</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Detailed macronutrient breakdown recommendations</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Support for both metric and imperial units</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Multiple activity levels and goal options</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Additional SEO Content Sections */}
          <div className="mt-12 space-y-8">
            {/* Factors Affecting Daily Calorie Needs */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Factors That Affect Your Daily Calorie Needs</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-gray-800">Age and Gender</h4>
                    <p className="text-gray-600">
                      Metabolism typically slows with age, requiring fewer calories. Men generally need more calories than 
                      women due to higher muscle mass and larger body size. Our calculator accounts for these biological 
                      differences using gender-specific equations.
                    </p>
                  </div>
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-gray-800">Body Composition</h4>
                    <p className="text-gray-600">
                      Muscle tissue burns more calories at rest than fat tissue. People with higher muscle mass have 
                      higher metabolic rates and calorie needs. Weight training can increase your daily calorie requirements 
                      by building lean muscle mass.
                    </p>
                  </div>
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-gray-800">Activity Level</h4>
                    <p className="text-gray-600">
                      Physical activity significantly impacts daily calorie needs. Our calculator uses activity multipliers 
                      ranging from 1.2 (sedentary) to 1.9 (extremely active) to adjust your BMR for your lifestyle and 
                      exercise habits.
                    </p>
                  </div>
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-gray-800">Health Conditions</h4>
                    <p className="text-gray-600">
                      Certain medical conditions like thyroid disorders, diabetes, and PCOS can affect metabolism. 
                      While our calculator provides general estimates, consult healthcare providers for personalized 
                      advice if you have metabolic conditions.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Weight Management Strategies */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
                <CardContent className="p-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">Weight Loss Strategies</h3>
                  <div className="space-y-4">
                    <div className="bg-red-50 rounded-lg p-4">
                      <h4 className="font-semibold text-red-800 mb-2">Safe Calorie Deficit</h4>
                      <p className="text-sm text-red-700">Create a deficit of 250-750 calories per day for sustainable weight loss of 0.5-1.5 pounds per week.</p>
                    </div>
                    <div className="bg-orange-50 rounded-lg p-4">
                      <h4 className="font-semibold text-orange-800 mb-2">Never Go Below BMR</h4>
                      <p className="text-sm text-orange-700">Eating below your BMR can slow metabolism and cause muscle loss. Always eat at least your BMR calories.</p>
                    </div>
                    <div className="bg-yellow-50 rounded-lg p-4">
                      <h4 className="font-semibold text-yellow-800 mb-2">Focus on Protein</h4>
                      <p className="text-sm text-yellow-700">High protein intake (30% of calories) helps preserve muscle mass and increases satiety during weight loss.</p>
                    </div>
                    <div className="bg-blue-50 rounded-lg p-4">
                      <h4 className="font-semibold text-blue-800 mb-2">Track Progress</h4>
                      <p className="text-sm text-blue-700">Monitor weight changes weekly and adjust calorie intake based on actual results, not just calculations.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
                <CardContent className="p-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">Weight Gain Strategies</h3>
                  <div className="space-y-4">
                    <div className="bg-green-50 rounded-lg p-4">
                      <h4 className="font-semibold text-green-800 mb-2">Controlled Surplus</h4>
                      <p className="text-sm text-green-700">Add 250-500 calories above TDEE for lean muscle gain without excessive fat accumulation.</p>
                    </div>
                    <div className="bg-blue-50 rounded-lg p-4">
                      <h4 className="font-semibold text-blue-800 mb-2">Strength Training</h4>
                      <p className="text-sm text-blue-700">Combine calorie surplus with resistance training to ensure weight gain comes from muscle, not just fat.</p>
                    </div>
                    <div className="bg-purple-50 rounded-lg p-4">
                      <h4 className="font-semibold text-purple-800 mb-2">Quality Calories</h4>
                      <p className="text-sm text-purple-700">Choose nutrient-dense foods over empty calories to support healthy weight gain and body composition.</p>
                    </div>
                    <div className="bg-indigo-50 rounded-lg p-4">
                      <h4 className="font-semibold text-indigo-800 mb-2">Patient Progress</h4>
                      <p className="text-sm text-indigo-700">Aim for 0.5-1 pound weight gain per week. Faster gains typically result in more fat than muscle.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Calorie Calculation Methods */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-8">Calorie Calculation Methods Comparison</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
                      <h4 className="font-semibold text-blue-800 mb-3">Mifflin-St Jeor Equation (1990)</h4>
                      <p className="text-sm text-blue-700 mb-3">Most accurate for normal weight individuals and widely recommended by nutritionists</p>
                      <div className="space-y-2 text-xs font-mono text-blue-600">
                        <div><strong>Men:</strong> 10W + 6.25H - 5A + 5</div>
                        <div><strong>Women:</strong> 10W + 6.25H - 5A - 161</div>
                      </div>
                      <div className="mt-3 text-xs text-blue-600">
                        <strong>Accuracy:</strong> ±10% for most individuals
                      </div>
                    </div>
                    <div className="bg-green-50 rounded-lg p-6 border border-green-200">
                      <h4 className="font-semibold text-green-800 mb-3">Harris-Benedict Equation (1984)</h4>
                      <p className="text-sm text-green-700 mb-3">Revised version of the original 1919 equation, good general accuracy</p>
                      <div className="space-y-2 text-xs font-mono text-green-600">
                        <div><strong>Men:</strong> 88.362 + 13.397W + 4.799H - 5.677A</div>
                        <div><strong>Women:</strong> 447.593 + 9.247W + 3.098H - 4.330A</div>
                      </div>
                      <div className="mt-3 text-xs text-green-600">
                        <strong>Accuracy:</strong> ±15% for most individuals
                      </div>
                    </div>
                  </div>
                  <div className="space-y-6">
                    <div className="bg-orange-50 rounded-lg p-6 border border-orange-200">
                      <h4 className="font-semibold text-orange-800 mb-3">Activity Level Multipliers</h4>
                      <div className="space-y-3 text-sm">
                        <div className="flex justify-between items-center">
                          <span className="text-orange-700">Sedentary:</span>
                          <span className="font-bold text-orange-800">BMR × 1.2</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-orange-700">Lightly Active:</span>
                          <span className="font-bold text-orange-800">BMR × 1.375</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-orange-700">Moderately Active:</span>
                          <span className="font-bold text-orange-800">BMR × 1.55</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-orange-700">Very Active:</span>
                          <span className="font-bold text-orange-800">BMR × 1.725</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-orange-700">Extra Active:</span>
                          <span className="font-bold text-orange-800">BMR × 1.9</span>
                        </div>
                      </div>
                    </div>
                    <div className="bg-purple-50 rounded-lg p-6 border border-purple-200">
                      <h4 className="font-semibold text-purple-800 mb-3">Calculation Accuracy Tips</h4>
                      <div className="space-y-2 text-sm text-purple-700">
                        <div>• Use body composition for better accuracy</div>
                        <div>• Account for metabolic adaptation</div>
                        <div>• Adjust based on real-world results</div>
                        <div>• Consider individual health factors</div>
                        <div>• Recalculate with weight changes</div>
                      </div>
                    </div>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-4">W = Weight (kg), H = Height (cm), A = Age (years)</p>
              </CardContent>
            </Card>

            {/* Macronutrient Guidelines */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Macronutrient Distribution Guidelines</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg p-6 border border-blue-100">
                    <h4 className="text-lg font-semibold text-blue-800 mb-4">Protein (25-35%)</h4>
                    <div className="space-y-3 text-sm text-blue-700">
                      <div><strong>Function:</strong> Muscle building and repair</div>
                      <div><strong>Calories per gram:</strong> 4</div>
                      <div><strong>Recommended:</strong> 0.8-1.2g per kg body weight</div>
                      <div><strong>Sources:</strong> Lean meats, fish, eggs, dairy, legumes</div>
                      <div><strong>Weight Loss:</strong> Increase to 30-35% for satiety</div>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-6 border border-green-100">
                    <h4 className="text-lg font-semibold text-green-800 mb-4">Carbohydrates (35-50%)</h4>
                    <div className="space-y-3 text-sm text-green-700">
                      <div><strong>Function:</strong> Primary energy source</div>
                      <div><strong>Calories per gram:</strong> 4</div>
                      <div><strong>Minimum:</strong> 130g per day for brain function</div>
                      <div><strong>Sources:</strong> Whole grains, fruits, vegetables</div>
                      <div><strong>Athletes:</strong> Increase to 50-60% for performance</div>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-lg p-6 border border-orange-100">
                    <h4 className="text-lg font-semibold text-orange-800 mb-4">Fats (20-35%)</h4>
                    <div className="space-y-3 text-sm text-orange-700">
                      <div><strong>Function:</strong> Hormone production, absorption</div>
                      <div><strong>Calories per gram:</strong> 9</div>
                      <div><strong>Minimum:</strong> 20% for essential functions</div>
                      <div><strong>Sources:</strong> Nuts, oils, avocado, fish</div>
                      <div><strong>Keto Diet:</strong> Increase to 70-80% of calories</div>
                    </div>
                  </div>
                </div>
                <div className="mt-6 p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg">
                  <h4 className="font-semibold text-gray-800 mb-2">Personalization Tips</h4>
                  <p className="text-gray-700 text-sm">
                    Adjust macronutrient ratios based on your goals: higher protein for muscle building, 
                    moderate carbs for sustained energy, and adequate fats for hormone health. Our calculator 
                    provides balanced recommendations that you can modify based on your preferences and results.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Common Calorie Calculation Mistakes */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Common Calorie Calculation Mistakes to Avoid</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-r-lg">
                      <h4 className="font-semibold text-red-800 mb-2">Overestimating Activity Level</h4>
                      <p className="text-red-700 text-sm">Many people overestimate their activity level. Be honest about your actual exercise frequency and intensity to get accurate calorie targets.</p>
                    </div>
                    <div className="bg-orange-50 border-l-4 border-orange-400 p-4 rounded-r-lg">
                      <h4 className="font-semibold text-orange-800 mb-2">Ignoring Metabolic Adaptation</h4>
                      <p className="text-orange-700 text-sm">Your metabolism adapts to calorie restriction over time. Regularly reassess and adjust your calorie needs based on progress and plateaus.</p>
                    </div>
                    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-lg">
                      <h4 className="font-semibold text-yellow-800 mb-2">Setting Unrealistic Deficits</h4>
                      <p className="text-yellow-700 text-sm">Extreme calorie deficits (over 1000 calories) can lead to muscle loss and metabolic slowdown. Stick to moderate, sustainable deficits.</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-lg">
                      <h4 className="font-semibold text-blue-800 mb-2">Not Tracking Accurately</h4>
                      <p className="text-blue-700 text-sm">Inaccurate food tracking can undermine calorie calculations. Use food scales and reliable databases for precise calorie counting.</p>
                    </div>
                    <div className="bg-purple-50 border-l-4 border-purple-400 p-4 rounded-r-lg">
                      <h4 className="font-semibold text-purple-800 mb-2">Forgetting Liquid Calories</h4>
                      <p className="text-purple-700 text-sm">Beverages, oils, and condiments contain significant calories that are often overlooked but can derail calorie goals.</p>
                    </div>
                    <div className="bg-green-50 border-l-4 border-green-400 p-4 rounded-r-lg">
                      <h4 className="font-semibold text-green-800 mb-2">Not Adjusting for Weight Changes</h4>
                      <p className="text-green-700 text-sm">As you lose or gain weight, your calorie needs change. Recalculate your needs every 10-15 pounds of weight change.</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Calorie Calculator FAQs */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-8">Frequently Asked Questions about Calorie Calculations</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">How accurate are calorie calculators?</h4>
                      <p className="text-gray-600 text-sm">Calorie calculators provide estimates with 10-15% accuracy for most people. Individual factors like genetics, hormones, and metabolic health can affect actual needs. Use results as starting points and adjust based on real-world progress.</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">Should I eat the same calories every day?</h4>
                      <p className="text-gray-600 text-sm">You can vary daily calories as long as your weekly average meets your goals. Some people prefer higher calories on training days and lower on rest days, known as calorie cycling.</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">What if I'm not losing weight with calculated calories?</h4>
                      <p className="text-gray-600 text-sm">If weight loss stalls after 2-3 weeks, reduce calories by 100-200 per day or increase activity. Metabolic adaptation and inaccurate tracking are common causes of plateaus.</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">Can I eat below my BMR?</h4>
                      <p className="text-gray-600 text-sm">Eating below BMR is generally not recommended as it can slow metabolism and cause muscle loss. Always eat at least your BMR and create deficits through activity or eating between BMR and TDEE.</p>
                    </div>
                  </div>
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">How often should I recalculate my calorie needs?</h4>
                      <p className="text-gray-600 text-sm">Recalculate every 10-15 pounds of weight change or if your activity level significantly changes. Also reassess if you experience weight loss plateaus or unexpected weight changes.</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">Do men and women need different calorie calculations?</h4>
                      <p className="text-gray-600 text-sm">Yes, men typically have higher muscle mass and different hormonal profiles, requiring separate equations. Our calculator uses gender-specific formulas for accurate results.</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">What's the difference between weight loss and fat loss calories?</h4>
                      <p className="text-gray-600 text-sm">Weight loss includes fat, muscle, and water. For fat loss specifically, maintain adequate protein (30% of calories) and avoid extreme deficits to preserve muscle mass while losing weight.</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">Can medications affect my calorie needs?</h4>
                      <p className="text-gray-600 text-sm">Yes, medications for thyroid, diabetes, depression, and other conditions can affect metabolism. Consult healthcare providers for personalized advice if you take medications that impact weight or metabolism.</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Special Populations */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
                <CardContent className="p-8">
                  <h3 className="text-xl font-bold text-gray-900 mb-6">Athletes & Active Individuals</h3>
                  <div className="space-y-4 text-gray-600">
                    <p className="text-sm">
                      Athletes require specialized calorie calculations that account for training intensity, duration, and sport-specific demands.
                    </p>
                    <div className="space-y-2">
                      <h4 className="font-semibold text-green-800 text-sm">Endurance Athletes:</h4>
                      <ul className="text-xs space-y-1 list-disc list-inside text-green-700">
                        <li>Higher carbohydrate needs (60-70%)</li>
                        <li>Activity multiplier often exceeds 1.9</li>
                        <li>Focus on fueling and recovery</li>
                      </ul>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-semibold text-blue-800 text-sm">Strength Athletes:</h4>
                      <ul className="text-xs space-y-1 list-disc list-inside text-blue-700">
                        <li>Higher protein needs (2-2.5g/kg)</li>
                        <li>Moderate calorie surplus for muscle gain</li>
                        <li>Periodized nutrition plans</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
                <CardContent className="p-8">
                  <h3 className="text-xl font-bold text-gray-900 mb-6">Older Adults (65+)</h3>
                  <div className="space-y-4 text-gray-600">
                    <p className="text-sm">
                      Aging affects metabolism, muscle mass, and nutrient needs, requiring adjusted calorie calculations.
                    </p>
                    <div className="space-y-2">
                      <h4 className="font-semibold text-orange-800 text-sm">Key Considerations:</h4>
                      <ul className="text-xs space-y-1 list-disc list-inside text-orange-700">
                        <li>Lower BMR due to muscle loss</li>
                        <li>Higher protein needs (1.2-1.6g/kg)</li>
                        <li>Focus on nutrient density</li>
                        <li>Account for medication effects</li>
                      </ul>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-semibold text-purple-800 text-sm">Recommendations:</h4>
                      <ul className="text-xs space-y-1 list-disc list-inside text-purple-700">
                        <li>Maintain muscle through resistance training</li>
                        <li>Avoid aggressive calorie deficits</li>
                        <li>Regular health monitoring</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
                <CardContent className="p-8">
                  <h3 className="text-xl font-bold text-gray-900 mb-6">Medical Conditions</h3>
                  <div className="space-y-4 text-gray-600">
                    <p className="text-sm">
                      Certain health conditions require modified calorie calculations and medical supervision.
                    </p>
                    <div className="space-y-2">
                      <h4 className="font-semibold text-red-800 text-sm">Conditions Affecting Metabolism:</h4>
                      <ul className="text-xs space-y-1 list-disc list-inside text-red-700">
                        <li>Thyroid disorders</li>
                        <li>PCOS and insulin resistance</li>
                        <li>Diabetes (Type 1 & 2)</li>
                        <li>Metabolic syndrome</li>
                      </ul>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-semibold text-blue-800 text-sm">Important Notes:</h4>
                      <ul className="text-xs space-y-1 list-disc list-inside text-blue-700">
                        <li>Consult healthcare providers</li>
                        <li>Monitor blood markers</li>
                        <li>Adjust calculations based on response</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
