
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
  tdee: {
    sedentary: number;
    lightlyActive: number;
    moderatelyActive: number;
    veryActive: number;
    extraActive: number;
  };
  caloriesForWeightLoss: {
    mild: number;
    moderate: number;
    extreme: number;
  };
  caloriesForWeightGain: {
    mild: number;
    moderate: number;
  };
  macronutrients: {
    protein: { grams: number; calories: number };
    carbs: { grams: number; calories: number };
    fats: { grams: number; calories: number };
  };
}

const BMRCalculator = () => {
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [feet, setFeet] = useState('');
  const [inches, setInches] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [unitSystem, setUnitSystem] = useState('metric');
  const [activityLevel, setActivityLevel] = useState('');
  const [goal, setGoal] = useState('maintain');
  const [bodyFatPercentage, setBodyFatPercentage] = useState('');
  const [useAdvanced, setUseAdvanced] = useState(false);
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
    const bodyFat = parseFloat(bodyFatPercentage) || 0;

    if (weightKg && heightCm && ageYears && gender) {
      let bmr: number;

      if (useAdvanced && bodyFat > 0) {
        // Katch-McArdle Formula (more accurate with body fat percentage)
        const leanBodyMass = weightKg * (1 - bodyFat / 100);
        bmr = 370 + (21.6 * leanBodyMass);
      } else {
        // Mifflin-St Jeor Equation (most commonly used)
        if (gender === 'male') {
          bmr = 10 * weightKg + 6.25 * heightCm - 5 * ageYears + 5;
        } else {
          bmr = 10 * weightKg + 6.25 * heightCm - 5 * ageYears - 161;
        }
      }

      // Calculate TDEE based on activity levels
      const tdee = {
        sedentary: bmr * 1.2,
        lightlyActive: bmr * 1.375,
        moderatelyActive: bmr * 1.55,
        veryActive: bmr * 1.725,
        extraActive: bmr * 1.9
      };

      // Calculate calorie targets based on goal
      const selectedTDEE = activityLevel ? tdee[activityLevel as keyof typeof tdee] : tdee.moderatelyActive;
      
      let caloriesForWeightLoss, caloriesForWeightGain;

      if (goal === 'lose') {
        caloriesForWeightLoss = {
          mild: selectedTDEE - 250,
          moderate: selectedTDEE - 500,
          extreme: selectedTDEE - 750
        };
        caloriesForWeightGain = {
          mild: selectedTDEE,
          moderate: selectedTDEE
        };
      } else if (goal === 'gain') {
        caloriesForWeightLoss = {
          mild: selectedTDEE,
          moderate: selectedTDEE,
          extreme: selectedTDEE
        };
        caloriesForWeightGain = {
          mild: selectedTDEE + 250,
          moderate: selectedTDEE + 500
        };
      } else {
        caloriesForWeightLoss = {
          mild: selectedTDEE - 250,
          moderate: selectedTDEE - 500,
          extreme: selectedTDEE - 750
        };
        caloriesForWeightGain = {
          mild: selectedTDEE + 250,
          moderate: selectedTDEE + 500
        };
      }

      // Calculate macronutrients (moderate approach)
      const targetCalories = goal === 'lose' ? caloriesForWeightLoss.moderate : 
                            goal === 'gain' ? caloriesForWeightGain.moderate : selectedTDEE;
      
      const proteinGrams = Math.round(weightKg * 1.6); // 1.6g per kg bodyweight
      const proteinCalories = proteinGrams * 4;
      
      const fatCalories = Math.round(targetCalories * 0.25); // 25% of calories from fat
      const fatGrams = Math.round(fatCalories / 9);
      
      const carbCalories = targetCalories - proteinCalories - fatCalories;
      const carbGrams = Math.round(carbCalories / 4);

      setResult({
        bmr: Math.round(bmr),
        tdee: {
          sedentary: Math.round(tdee.sedentary),
          lightlyActive: Math.round(tdee.lightlyActive),
          moderatelyActive: Math.round(tdee.moderatelyActive),
          veryActive: Math.round(tdee.veryActive),
          extraActive: Math.round(tdee.extraActive)
        },
        caloriesForWeightLoss: {
          mild: Math.round(caloriesForWeightLoss.mild),
          moderate: Math.round(caloriesForWeightLoss.moderate),
          extreme: Math.round(caloriesForWeightLoss.extreme)
        },
        caloriesForWeightGain: {
          mild: Math.round(caloriesForWeightGain.mild),
          moderate: Math.round(caloriesForWeightGain.moderate)
        },
        macronutrients: {
          protein: { grams: proteinGrams, calories: proteinCalories },
          carbs: { grams: carbGrams, calories: Math.round(carbCalories) },
          fats: { grams: fatGrams, calories: fatCalories }
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
    setActivityLevel('');
    setGoal('maintain');
    setBodyFatPercentage('');
    setUnitSystem('metric');
    setUseAdvanced(false);
    setResult(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Helmet>
        <title>BMR Calculator - Calculate Basal Metabolic Rate & Daily Calories | DapsiWow</title>
        <meta name="description" content="Free BMR calculator to calculate your Basal Metabolic Rate and daily calorie needs. Get accurate TDEE calculations and personalized calorie targets for weight loss, muscle gain, and maintenance using advanced formulas." />
        <meta name="keywords" content="BMR calculator, basal metabolic rate calculator, daily calorie calculator, TDEE calculator, metabolism calculator, calorie needs, Mifflin St Jeor equation, Katch McArdle formula, weight loss calculator, muscle gain calculator, metabolic rate, daily energy expenditure, calories burned at rest, nutrition calculator, fitness calculator, macro calculator" />
        <meta property="og:title" content="BMR Calculator - Calculate Basal Metabolic Rate & Daily Calories | DapsiWow" />
        <meta property="og:description" content="Calculate your BMR (Basal Metabolic Rate) and daily calorie needs. Get personalized calorie targets and macronutrient recommendations for weight management." />
        <meta property="og:type" content="website" />
        <meta name="robots" content="index, follow" />
        <meta name="author" content="DapsiWow" />
        <link rel="canonical" href="https://dapsiwow.com/tools/bmr-calculator" />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            "name": "BMR Calculator",
            "description": "Free online BMR calculator to calculate Basal Metabolic Rate and daily calorie needs using advanced formulas including Mifflin-St Jeor and Katch-McArdle equations. Features TDEE calculation, calorie targets, and macronutrient recommendations.",
            "url": "https://dapsiwow.com/tools/bmr-calculator",
            "applicationCategory": "HealthApplication",
            "operatingSystem": "Any",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "USD"
            },
            "featureList": [
              "Calculate BMR using multiple formulas",
              "TDEE calculation for all activity levels",
              "Weight management calorie targets",
              "Macronutrient recommendations",
              "Advanced body composition analysis",
              "Support for metric and imperial units"
            ]
          })}
        </script>
      </Helmet>
      
      <Header />
      
      <main>
        {/* Hero Section */}
        <section className="relative py-20 sm:py-28 lg:py-32 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-rose-600/10 to-pink-600/20"></div>
          <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="space-y-8">
              <div className="inline-flex items-center px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full border border-rose-200">
                <span className="text-sm font-medium text-rose-700">Professional BMR Calculator</span>
              </div>
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-slate-900 leading-tight">
                Advanced BMR
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-rose-600 to-pink-600">
                  Calculator
                </span>
              </h1>
              <p className="text-xl sm:text-2xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
                Calculate your Basal Metabolic Rate and daily calorie needs with advanced formulas and personalized recommendations
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
                    <p className="text-gray-600">Enter your personal information to calculate your metabolic rate</p>
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
                        className="h-14 text-lg border-2 border-gray-200 rounded-xl focus:border-rose-500 focus:ring-rose-500"
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
                        className="h-14 text-lg border-2 border-gray-200 rounded-xl focus:border-rose-500 focus:ring-rose-500"
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
                          className="h-14 text-lg border-2 border-gray-200 rounded-xl focus:border-rose-500 focus:ring-rose-500"
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
                              className="h-14 text-lg border-2 border-gray-200 rounded-xl focus:border-rose-500 focus:ring-rose-500"
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
                              className="h-14 text-lg border-2 border-gray-200 rounded-xl focus:border-rose-500 focus:ring-rose-500"
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
                          <SelectItem value="lightlyActive">Lightly Active - Light exercise 1-3 days/week</SelectItem>
                          <SelectItem value="moderatelyActive">Moderately Active - Moderate exercise 3-5 days/week</SelectItem>
                          <SelectItem value="veryActive">Very Active - Hard exercise 6-7 days/week</SelectItem>
                          <SelectItem value="extraActive">Extra Active - Very hard exercise + physical job</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Goal */}
                    <div className="space-y-3">
                      <Label className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                        Goal
                      </Label>
                      <Select value={goal} onValueChange={setGoal}>
                        <SelectTrigger className="h-14 border-2 border-gray-200 rounded-xl text-lg" data-testid="select-goal">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="lose">Weight Loss</SelectItem>
                          <SelectItem value="maintain">Maintain Weight</SelectItem>
                          <SelectItem value="gain">Weight Gain</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Advanced Options */}
                  <div className="space-y-6 border-t pt-8">
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        id="use-advanced"
                        checked={useAdvanced}
                        onChange={(e) => setUseAdvanced(e.target.checked)}
                        className="h-5 w-5 text-rose-600 border-2 border-gray-300 rounded focus:ring-rose-500"
                        data-testid="checkbox-advanced"
                      />
                      <label htmlFor="use-advanced" className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                        Advanced Mode (Body Fat %)
                      </label>
                    </div>
                    
                    {useAdvanced && (
                      <div className="bg-gray-50 rounded-xl p-6">
                        <div className="space-y-3">
                          <Label htmlFor="body-fat" className="text-sm font-medium text-gray-700">
                            Body Fat Percentage (%)
                          </Label>
                          <Input
                            id="body-fat"
                            type="number"
                            value={bodyFatPercentage}
                            onChange={(e) => setBodyFatPercentage(e.target.value)}
                            className="h-12 border-2 border-gray-200 rounded-lg"
                            placeholder="15"
                            min="5"
                            max="50"
                            step="0.1"
                            data-testid="input-body-fat"
                          />
                          <p className="text-sm text-gray-500">
                            Uses Katch-McArdle formula for more accurate results when body fat is known
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-4 pt-6">
                    <Button
                      onClick={calculateBMR}
                      className="flex-1 h-14 bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 text-white font-semibold text-lg rounded-xl shadow-lg transform transition-all duration-200 hover:scale-105"
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
                <div className="bg-gradient-to-br from-gray-50 to-rose-50 p-8 lg:p-12">
                  <h2 className="text-2xl font-bold text-gray-900 mb-8">Results</h2>
                  
                  {result ? (
                    <div className="space-y-6" data-testid="bmr-results">
                      {/* BMR Value */}
                      <div className="bg-white rounded-2xl p-6 shadow-lg border border-rose-100">
                        <div className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-2">Basal Metabolic Rate</div>
                        <div className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-rose-600 to-pink-600" data-testid="text-bmr-value">
                          {result.bmr} cal/day
                        </div>
                        <p className="text-sm text-gray-500 mt-1">Calories burned at rest</p>
                      </div>

                      {/* TDEE Values */}
                      <div className="bg-white rounded-xl p-6 shadow-sm">
                        <h3 className="font-bold text-gray-900 mb-4 text-lg">Total Daily Energy Expenditure (TDEE)</h3>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center py-2">
                            <span className="text-gray-700 font-medium">Sedentary</span>
                            <span className="font-bold text-gray-900" data-testid="text-sedentary">
                              {result.tdee.sedentary} cal/day
                            </span>
                          </div>
                          <div className="flex justify-between items-center py-2">
                            <span className="text-gray-700 font-medium">Lightly Active</span>
                            <span className="font-bold text-gray-900" data-testid="text-lightly-active">
                              {result.tdee.lightlyActive} cal/day
                            </span>
                          </div>
                          <div className="flex justify-between items-center py-2">
                            <span className="text-gray-700 font-medium">Moderately Active</span>
                            <span className="font-bold text-gray-900" data-testid="text-moderately-active">
                              {result.tdee.moderatelyActive} cal/day
                            </span>
                          </div>
                          <div className="flex justify-between items-center py-2">
                            <span className="text-gray-700 font-medium">Very Active</span>
                            <span className="font-bold text-gray-900" data-testid="text-very-active">
                              {result.tdee.veryActive} cal/day
                            </span>
                          </div>
                          <div className="flex justify-between items-center py-2">
                            <span className="text-gray-700 font-medium">Extra Active</span>
                            <span className="font-bold text-gray-900" data-testid="text-extra-active">
                              {result.tdee.extraActive} cal/day
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Calorie Targets */}
                      {goal !== 'maintain' && (
                        <div className="space-y-4">
                          {goal === 'lose' && (
                            <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-xl p-6 border border-red-200">
                              <h4 className="font-bold text-red-800 mb-4 text-lg">Weight Loss Targets</h4>
                              <div className="space-y-2">
                                <div className="flex justify-between">
                                  <span className="text-red-700 font-medium">Mild Loss (0.5 lbs/week):</span>
                                  <span className="font-bold text-red-800" data-testid="text-weight-loss-mild">
                                    {result.caloriesForWeightLoss.mild} cal/day
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-red-700 font-medium">Moderate Loss (1 lb/week):</span>
                                  <span className="font-bold text-red-800" data-testid="text-weight-loss-moderate">
                                    {result.caloriesForWeightLoss.moderate} cal/day
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-red-700 font-medium">Aggressive Loss (1.5 lbs/week):</span>
                                  <span className="font-bold text-red-800" data-testid="text-weight-loss-extreme">
                                    {result.caloriesForWeightLoss.extreme} cal/day
                                  </span>
                                </div>
                              </div>
                            </div>
                          )}

                          {goal === 'gain' && (
                            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
                              <h4 className="font-bold text-green-800 mb-4 text-lg">Weight Gain Targets</h4>
                              <div className="space-y-2">
                                <div className="flex justify-between">
                                  <span className="text-green-700 font-medium">Mild Gain (0.5 lbs/week):</span>
                                  <span className="font-bold text-green-800" data-testid="text-weight-gain-mild">
                                    {result.caloriesForWeightGain.mild} cal/day
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-green-700 font-medium">Moderate Gain (1 lb/week):</span>
                                  <span className="font-bold text-green-800" data-testid="text-weight-gain-moderate">
                                    {result.caloriesForWeightGain.moderate} cal/day
                                  </span>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Macronutrient Breakdown */}
                      <div className="bg-white rounded-xl p-6 shadow-sm">
                        <h4 className="font-bold text-gray-900 mb-4 text-lg">Macronutrient Recommendations</h4>
                        <div className="grid grid-cols-3 gap-4">
                          <div className="text-center">
                            <div className="text-2xl font-bold text-blue-600">{result.macronutrients.protein.grams}g</div>
                            <div className="text-sm text-gray-600">Protein</div>
                            <div className="text-xs text-gray-500">{result.macronutrients.protein.calories} cal</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-orange-600">{result.macronutrients.carbs.grams}g</div>
                            <div className="text-sm text-gray-600">Carbs</div>
                            <div className="text-xs text-gray-500">{result.macronutrients.carbs.calories} cal</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-green-600">{result.macronutrients.fats.grams}g</div>
                            <div className="text-sm text-gray-600">Fats</div>
                            <div className="text-xs text-gray-500">{result.macronutrients.fats.calories} cal</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-16" data-testid="no-results">
                      <div className="w-20 h-20 bg-gray-200 rounded-full mx-auto mb-6 flex items-center justify-center">
                        <div className="text-3xl font-bold text-gray-400">🔥</div>
                      </div>
                      <p className="text-gray-500 text-lg">Enter your information to calculate BMR and daily calorie needs</p>
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
                <h3 className="text-2xl font-bold text-gray-900 mb-6">What is BMR (Basal Metabolic Rate)?</h3>
                <div className="space-y-4 text-gray-600">
                  <p>
                    BMR (Basal Metabolic Rate) represents the number of calories your body needs to perform essential 
                    physiological functions while at complete rest. This includes vital processes such as breathing, 
                    circulation, cell production, nutrient processing, protein synthesis, and maintaining organ function. 
                    BMR typically accounts for 60-75% of total daily energy expenditure in sedentary individuals.
                  </p>
                  <p>
                    Our advanced BMR calculator uses scientifically validated formulas including the Mifflin-St Jeor 
                    equation and the Katch-McArdle formula for enhanced accuracy when body composition is known. 
                    This comprehensive tool provides detailed insights into your metabolic rate, daily calorie requirements, 
                    and personalized macronutrient recommendations to support your health and fitness goals.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">How BMR Calculation Works</h3>
                <div className="space-y-4 text-gray-600">
                  <p>
                    Our calculator employs multiple scientifically proven formulas to ensure accuracy across different 
                    body compositions and metabolic profiles.
                  </p>
                  <div className="bg-rose-50 rounded-lg p-4 mb-4">
                    <h4 className="font-semibold text-rose-800 mb-2">Mifflin-St Jeor Formula (Standard)</h4>
                    <p className="font-mono text-sm text-rose-700">
                      <strong>Men:</strong> BMR = 10 × weight(kg) + 6.25 × height(cm) - 5 × age + 5<br />
                      <strong>Women:</strong> BMR = 10 × weight(kg) + 6.25 × height(cm) - 5 × age - 161
                    </p>
                  </div>
                  <div className="bg-blue-50 rounded-lg p-4">
                    <h4 className="font-semibold text-blue-800 mb-2">Katch-McArdle Formula (Advanced)</h4>
                    <p className="font-mono text-sm text-blue-700">
                      BMR = 370 + (21.6 × Lean Body Mass in kg)
                    </p>
                    <p className="text-xs text-blue-600 mt-2">
                      More accurate when body fat percentage is known
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Features of Our BMR Calculator</h3>
                <div className="space-y-3 text-gray-600">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-rose-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Multiple calculation methods (Mifflin-St Jeor & Katch-McArdle)</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-rose-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Complete TDEE calculations for all activity levels</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-rose-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Goal-specific calorie targets (weight loss/gain/maintenance)</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-rose-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Personalized macronutrient recommendations</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-rose-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Advanced body composition analysis</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-rose-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Support for metric and imperial measurement systems</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Benefits of BMR Calculation</h3>
                <div className="space-y-3 text-gray-600">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Establish accurate baseline calorie requirements</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Create effective weight management strategies</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Optimize nutrition planning and meal preparation</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Monitor metabolic changes over time</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Support athletic performance and recovery</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Free to use with professional-grade accuracy</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Additional SEO Content Sections */}
          <div className="mt-12 space-y-8">
            {/* Understanding Metabolism Section */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Understanding Your Metabolism</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div>
                    <h4 className="text-xl font-semibold text-gray-900 mb-4">Components of Total Daily Energy Expenditure</h4>
                    <div className="space-y-4">
                      <div className="border-l-4 border-rose-500 pl-4">
                        <h5 className="font-semibold text-gray-800 mb-2">BMR - Basal Metabolic Rate (60-75%)</h5>
                        <p className="text-sm text-gray-600">Energy required for essential bodily functions at rest including organ function, breathing, and cellular maintenance.</p>
                      </div>
                      <div className="border-l-4 border-blue-500 pl-4">
                        <h5 className="font-semibold text-gray-800 mb-2">NEAT - Non-Exercise Activity Thermogenesis (15-30%)</h5>
                        <p className="text-sm text-gray-600">Energy expended for activities that are not sleeping, eating, or sports-like exercise including fidgeting and maintaining posture.</p>
                      </div>
                      <div className="border-l-4 border-green-500 pl-4">
                        <h5 className="font-semibold text-gray-800 mb-2">TEF - Thermic Effect of Food (8-15%)</h5>
                        <p className="text-sm text-gray-600">Energy cost of digesting, absorbing, and processing food nutrients. Protein has the highest thermic effect.</p>
                      </div>
                      <div className="border-l-4 border-orange-500 pl-4">
                        <h5 className="font-semibold text-gray-800 mb-2">EAT - Exercise Activity Thermogenesis (15-30%)</h5>
                        <p className="text-sm text-gray-600">Energy expended during planned physical activities and structured exercise sessions.</p>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-xl font-semibold text-gray-900 mb-4">Factors Affecting BMR</h4>
                    <div className="space-y-4">
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h5 className="font-semibold text-gray-800 mb-2">Body Composition</h5>
                        <p className="text-sm text-gray-600">Muscle tissue burns significantly more calories at rest than fat tissue. Higher muscle mass correlates with increased BMR.</p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h5 className="font-semibold text-gray-800 mb-2">Age and Gender</h5>
                        <p className="text-sm text-gray-600">BMR typically decreases with age due to muscle loss. Men generally have higher BMR than women due to larger body size and muscle mass.</p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h5 className="font-semibold text-gray-800 mb-2">Genetics and Hormones</h5>
                        <p className="text-sm text-gray-600">Genetic factors and hormonal status (thyroid, insulin, cortisol) significantly influence metabolic rate and energy expenditure.</p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h5 className="font-semibold text-gray-800 mb-2">Environmental Factors</h5>
                        <p className="text-sm text-gray-600">Temperature, altitude, and stress levels can temporarily affect metabolic rate through adaptive thermogenesis.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* TDEE and Activity Levels */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">TDEE & Activity Level Guidelines</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg p-6 shadow-sm">
                    <h4 className="text-lg font-semibold text-gray-900 mb-3">Sedentary (1.2x BMR)</h4>
                    <p className="text-gray-600 text-sm mb-4">
                      Desk job with little to no exercise. Mostly sitting throughout the day with minimal physical activity.
                    </p>
                    <div className="text-xs text-blue-700 font-medium">
                      Examples: Office workers, students, remote employees without regular exercise routines
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-6 shadow-sm">
                    <h4 className="text-lg font-semibold text-gray-900 mb-3">Lightly Active (1.375x BMR)</h4>
                    <p className="text-gray-600 text-sm mb-4">
                      Light exercise or sports 1-3 days per week. May include walking, light jogging, or recreational activities.
                    </p>
                    <div className="text-xs text-green-700 font-medium">
                      Examples: Weekend warriors, casual gym-goers, recreational sports participants
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-lg p-6 shadow-sm">
                    <h4 className="text-lg font-semibold text-gray-900 mb-3">Moderately Active (1.55x BMR)</h4>
                    <p className="text-gray-600 text-sm mb-4">
                      Moderate exercise 3-5 days per week. Consistent workout routines with regular physical activity.
                    </p>
                    <div className="text-xs text-orange-700 font-medium">
                      Examples: Regular gym members, fitness enthusiasts, recreational athletes
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-lg p-6 shadow-sm">
                    <h4 className="text-lg font-semibold text-gray-900 mb-3">Very Active (1.725x BMR)</h4>
                    <p className="text-gray-600 text-sm mb-4">
                      Hard exercise 6-7 days per week. Intensive training schedules with high-intensity workouts.
                    </p>
                    <div className="text-xs text-purple-700 font-medium">
                      Examples: Serious athletes, competitive sports participants, fitness professionals
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-br from-red-50 to-pink-50 rounded-lg p-6 shadow-sm">
                    <h4 className="text-lg font-semibold text-gray-900 mb-3">Extra Active (1.9x BMR)</h4>
                    <p className="text-gray-600 text-sm mb-4">
                      Very hard exercise plus physical job or training twice daily. Extremely demanding physical lifestyle.
                    </p>
                    <div className="text-xs text-red-700 font-medium">
                      Examples: Professional athletes, military personnel, construction workers who train
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-br from-gray-50 to-slate-50 rounded-lg p-6 shadow-sm">
                    <h4 className="text-lg font-semibold text-gray-900 mb-3">Choosing Your Level</h4>
                    <p className="text-gray-600 text-sm mb-4">
                      Select the activity level that best matches your weekly exercise routine and daily physical demands.
                    </p>
                    <div className="text-xs text-gray-700 font-medium">
                      Tip: When in doubt, choose a lower activity level to avoid overestimating calorie needs
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Weight Management Strategies */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
                <CardContent className="p-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">Weight Management Strategies</h3>
                  <div className="space-y-6">
                    <div className="bg-red-50 rounded-lg p-6 border border-red-200">
                      <h4 className="text-lg font-semibold text-red-800 mb-3">Weight Loss Guidelines</h4>
                      <div className="space-y-3 text-sm">
                        <div className="flex justify-between items-center">
                          <span className="text-red-700">Safe weekly loss rate:</span>
                          <span className="font-bold text-red-800">1-2 pounds (0.5-1 kg)</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-red-700">Daily calorie deficit:</span>
                          <span className="font-bold text-red-800">250-750 calories</span>
                        </div>
                        <p className="text-red-600 text-xs leading-relaxed">
                          Maintain adequate protein intake (1.6-2.2g per kg bodyweight) and incorporate resistance training 
                          to preserve muscle mass during weight loss. Avoid extreme deficits that can slow metabolism.
                        </p>
                      </div>
                    </div>

                    <div className="bg-green-50 rounded-lg p-6 border border-green-200">
                      <h4 className="text-lg font-semibold text-green-800 mb-3">Weight Gain Guidelines</h4>
                      <div className="space-y-3 text-sm">
                        <div className="flex justify-between items-center">
                          <span className="text-green-700">Healthy weekly gain rate:</span>
                          <span className="font-bold text-green-800">0.5-1 pound (0.25-0.5 kg)</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-green-700">Daily calorie surplus:</span>
                          <span className="font-bold text-green-800">250-500 calories</span>
                        </div>
                        <p className="text-green-600 text-xs leading-relaxed">
                          Focus on nutrient-dense foods and progressive resistance training to maximize lean muscle gain 
                          while minimizing fat accumulation. Quality over quantity is key for healthy weight gain.
                        </p>
                      </div>
                    </div>

                    <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
                      <h4 className="text-lg font-semibold text-blue-800 mb-3">Maintenance Strategy</h4>
                      <p className="text-blue-600 text-sm leading-relaxed">
                        Eat at your calculated TDEE to maintain current weight. Monitor weekly averages and adjust 
                        intake based on actual results, as individual metabolic rates can vary from calculations.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
                <CardContent className="p-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">Metabolic Optimization Tips</h3>
                  <div className="space-y-4">
                    <div className="border-l-4 border-rose-500 pl-4">
                      <h4 className="font-semibold text-gray-800 mb-2">Build Lean Muscle Mass</h4>
                      <p className="text-sm text-gray-600 leading-relaxed">
                        Incorporate resistance training 3-4 times per week. Muscle tissue burns 3x more calories 
                        at rest than fat tissue, significantly boosting your BMR over time.
                      </p>
                    </div>
                    
                    <div className="border-l-4 border-blue-500 pl-4">
                      <h4 className="font-semibold text-gray-800 mb-2">Optimize Protein Intake</h4>
                      <p className="text-sm text-gray-600 leading-relaxed">
                        Consume 1.6-2.2g protein per kg bodyweight. Protein has the highest thermic effect (20-30% 
                        of calories burned in digestion) and helps preserve muscle during weight loss.
                      </p>
                    </div>
                    
                    <div className="border-l-4 border-green-500 pl-4">
                      <h4 className="font-semibold text-gray-800 mb-2">Stay Consistently Active</h4>
                      <p className="text-sm text-gray-600 leading-relaxed">
                        Increase NEAT through daily activities: take stairs, walk during calls, use standing desk, 
                        park farther away. Small activities compound to significant calorie expenditure.
                      </p>
                    </div>
                    
                    <div className="border-l-4 border-orange-500 pl-4">
                      <h4 className="font-semibold text-gray-800 mb-2">Prioritize Sleep Quality</h4>
                      <p className="text-sm text-gray-600 leading-relaxed">
                        Aim for 7-9 hours of quality sleep. Poor sleep disrupts hormones (leptin, ghrelin, cortisol) 
                        that regulate metabolism and appetite, potentially lowering BMR.
                      </p>
                    </div>
                    
                    <div className="border-l-4 border-purple-500 pl-4">
                      <h4 className="font-semibold text-gray-800 mb-2">Consider HIIT Training</h4>
                      <p className="text-sm text-gray-600 leading-relaxed">
                        High-Intensity Interval Training creates EPOC (excess post-exercise oxygen consumption), 
                        elevating metabolic rate for hours after exercise completion.
                      </p>
                    </div>
                    
                    <div className="border-l-4 border-indigo-500 pl-4">
                      <h4 className="font-semibold text-gray-800 mb-2">Maintain Hydration</h4>
                      <p className="text-sm text-gray-600 leading-relaxed">
                        Proper hydration supports optimal metabolic function. Cold water may provide small metabolic 
                        boost through thermogenesis as body warms the water to body temperature.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* BMR Applications and Use Cases */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">BMR Calculator Applications & Use Cases</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-gray-900">Personal Fitness & Nutrition</h4>
                    <ul className="text-gray-600 space-y-2 text-sm">
                      <li>• <strong>Meal Planning:</strong> Calculate precise calorie targets for daily nutrition planning</li>
                      <li>• <strong>Weight Management:</strong> Establish sustainable calorie deficits or surpluses</li>
                      <li>• <strong>Athletic Performance:</strong> Fuel training sessions with appropriate calorie intake</li>
                      <li>• <strong>Body Recomposition:</strong> Balance calories for simultaneous fat loss and muscle gain</li>
                      <li>• <strong>Metabolic Tracking:</strong> Monitor changes in metabolic rate over time</li>
                    </ul>
                  </div>
                  
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-gray-900">Professional Applications</h4>
                    <ul className="text-gray-600 space-y-2 text-sm">
                      <li>• <strong>Personal Trainers:</strong> Create evidence-based nutrition protocols for clients</li>
                      <li>• <strong>Registered Dietitians:</strong> Assess metabolic needs for clinical nutrition therapy</li>
                      <li>• <strong>Healthcare Providers:</strong> Evaluate metabolic health in patient assessments</li>
                      <li>• <strong>Fitness Facilities:</strong> Offer comprehensive metabolic assessments to members</li>
                      <li>• <strong>Research Applications:</strong> Baseline metabolic measurements for scientific studies</li>
                    </ul>
                  </div>
                  
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-gray-900">Special Populations</h4>
                    <ul className="text-gray-600 space-y-2 text-sm">
                      <li>• <strong>Athletes:</strong> Optimize performance nutrition and recovery protocols</li>
                      <li>• <strong>Older Adults:</strong> Address age-related metabolic decline and muscle loss</li>
                      <li>• <strong>Weight Management Clients:</strong> Establish realistic and sustainable goals</li>
                      <li>• <strong>Rehabilitation Patients:</strong> Support recovery with appropriate calorie provision</li>
                      <li>• <strong>Metabolic Disorders:</strong> Monitor and manage conditions affecting metabolism</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Frequently Asked Questions */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-8">Frequently Asked Questions About BMR</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-3">How accurate are BMR calculators?</h4>
                      <p className="text-gray-600 text-sm leading-relaxed">
                        BMR calculators using the Mifflin-St Jeor equation are accurate within ±10% for most people. 
                        The Katch-McArdle formula (using body fat percentage) can be more accurate for individuals 
                        with known body composition. For precise measurements, consider indirect calorimetry testing.
                      </p>
                    </div>
                    
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-3">Should I eat below my BMR for weight loss?</h4>
                      <p className="text-gray-600 text-sm leading-relaxed">
                        Generally no. Eating significantly below BMR long-term can trigger adaptive thermogenesis, 
                        slowing metabolism and potentially causing muscle loss. Instead, create a moderate deficit 
                        from your TDEE (300-500 calories) for sustainable weight loss while preserving metabolic health.
                      </p>
                    </div>
                    
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-3">Why is my BMR different from online estimates?</h4>
                      <p className="text-gray-600 text-sm leading-relaxed">
                        Individual BMR can vary due to genetics, medical conditions, medication effects, stress levels, 
                        sleep quality, and body composition variations. Formulas provide population averages - your 
                        actual BMR may be 10-15% higher or lower than calculated values.
                      </p>
                    </div>
                    
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-3">How often should I recalculate my BMR?</h4>
                      <p className="text-gray-600 text-sm leading-relaxed">
                        Recalculate BMR every 10-15 pounds of weight change, significant body composition changes, 
                        or every 3-6 months during active weight management. Age-related changes occur gradually, 
                        so annual recalculation is sufficient for maintenance phases.
                      </p>
                    </div>
                  </div>
                  
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-3">What's the difference between BMR and RMR?</h4>
                      <p className="text-gray-600 text-sm leading-relaxed">
                        BMR (Basal Metabolic Rate) is measured under strict laboratory conditions after 8+ hours sleep 
                        and 12+ hours fasting. RMR (Resting Metabolic Rate) is measured under less restrictive conditions. 
                        RMR is typically 10-20% higher than BMR and more practical for everyday applications.
                      </p>
                    </div>
                    
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-3">Can medications affect my BMR?</h4>
                      <p className="text-gray-600 text-sm leading-relaxed">
                        Yes, certain medications significantly impact metabolism. Thyroid medications, antidepressants, 
                        beta-blockers, corticosteroids, and diabetes medications can all affect BMR. Consult your 
                        healthcare provider about how medications might influence your metabolic rate and calorie needs.
                      </p>
                    </div>
                    
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-3">How does age affect BMR calculations?</h4>
                      <p className="text-gray-600 text-sm leading-relaxed">
                        BMR typically decreases 1-2% per decade after age 30, primarily due to muscle mass loss and 
                        hormonal changes. This decline can be minimized through regular strength training, adequate 
                        protein intake, and maintaining active lifestyle habits throughout life.
                      </p>
                    </div>
                    
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-3">What if my calculated calories don't match my results?</h4>
                      <p className="text-gray-600 text-sm leading-relaxed">
                        Use calculated values as starting points, then adjust based on real-world results. Track weight 
                        changes over 2-4 weeks and modify calorie intake by 100-200 calories if results don't match 
                        expectations. Individual metabolic rates can vary from population averages.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Related Tools */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Related Health & Fitness Calculators</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <a href="/tools/bmi-calculator" className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg p-4 shadow-sm hover:shadow-md transition-all duration-200 hover:scale-105 border border-blue-100">
                    <div className="text-2xl font-bold text-blue-600 mb-3">📊</div>
                    <h4 className="font-semibold text-gray-900 mb-2">BMI Calculator</h4>
                    <p className="text-gray-600 text-xs">Calculate Body Mass Index and health status</p>
                  </a>
                  
                  <a href="/tools/tdee-calculator" className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-4 shadow-sm hover:shadow-md transition-all duration-200 hover:scale-105 border border-green-100">
                    <div className="text-2xl font-bold text-green-600 mb-3">⚡</div>
                    <h4 className="font-semibold text-gray-900 mb-2">TDEE Calculator</h4>
                    <p className="text-gray-600 text-xs">Total Daily Energy Expenditure calculator</p>
                  </a>
                  
                  <a href="/tools/body-fat-calculator" className="bg-gradient-to-br from-orange-50 to-red-50 rounded-lg p-4 shadow-sm hover:shadow-md transition-all duration-200 hover:scale-105 border border-orange-100">
                    <div className="text-2xl font-bold text-orange-600 mb-3">📏</div>
                    <h4 className="font-semibold text-gray-900 mb-2">Body Fat Calculator</h4>
                    <p className="text-gray-600 text-xs">Estimate body fat percentage accurately</p>
                  </a>
                  
                  <a href="/tools/calorie-calculator" className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-lg p-4 shadow-sm hover:shadow-md transition-all duration-200 hover:scale-105 border border-purple-100">
                    <div className="text-2xl font-bold text-purple-600 mb-3">🍽️</div>
                    <h4 className="font-semibold text-gray-900 mb-2">Calorie Calculator</h4>
                    <p className="text-gray-600 text-xs">Calculate daily calorie needs for goals</p>
                  </a>

                  <a href="/tools/ideal-weight-calculator" className="bg-gradient-to-br from-rose-50 to-pink-50 rounded-lg p-4 shadow-sm hover:shadow-md transition-all duration-200 hover:scale-105 border border-rose-100">
                    <div className="text-2xl font-bold text-rose-600 mb-3">⚖️</div>
                    <h4 className="font-semibold text-gray-900 mb-2">Ideal Weight Calculator</h4>
                    <p className="text-gray-600 text-xs">Calculate ideal body weight using proven formulas</p>
                  </a>

                  <a href="/tools/protein-intake-calculator" className="bg-gradient-to-br from-teal-50 to-cyan-50 rounded-lg p-4 shadow-sm hover:shadow-md transition-all duration-200 hover:scale-105 border border-teal-100">
                    <div className="text-2xl font-bold text-teal-600 mb-3">🥩</div>
                    <h4 className="font-semibold text-gray-900 mb-2">Protein Calculator</h4>
                    <p className="text-gray-600 text-xs">Calculate daily protein requirements</p>
                  </a>

                  <a href="/tools/water-intake-calculator" className="bg-gradient-to-br from-sky-50 to-blue-50 rounded-lg p-4 shadow-sm hover:shadow-md transition-all duration-200 hover:scale-105 border border-sky-100">
                    <div className="text-2xl font-bold text-sky-600 mb-3">💧</div>
                    <h4 className="font-semibold text-gray-900 mb-2">Water Intake Calculator</h4>
                    <p className="text-gray-600 text-xs">Calculate daily water requirements</p>
                  </a>

                  <a href="/tools/heart-rate-calculator" className="bg-gradient-to-br from-red-50 to-rose-50 rounded-lg p-4 shadow-sm hover:shadow-md transition-all duration-200 hover:scale-105 border border-red-100">
                    <div className="text-2xl font-bold text-red-600 mb-3">❤️</div>
                    <h4 className="font-semibold text-gray-900 mb-2">Heart Rate Calculator</h4>
                    <p className="text-gray-600 text-xs">Calculate target heart rate zones</p>
                  </a>
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

export default BMRCalculator;
