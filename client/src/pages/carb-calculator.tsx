
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

interface CarbIntakeResult {
  dailyCarbIntake: number;
  carbsPerMeal: number;
  carbCalories: number;
  percentageOfCalories: number;
  carbSources: {
    rice: number;
    bread: number;
    pasta: number;
    oats: number;
    banana: number;
    potato: number;
  };
  recommendations: string[];
  timing: string[];
}

const CarbCalculator = () => {
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [feet, setFeet] = useState('');
  const [inches, setInches] = useState('');
  const [age, setAge] = useState('');
  const [unitSystem, setUnitSystem] = useState('metric');
  const [gender, setGender] = useState('');
  const [activityLevel, setActivityLevel] = useState('');
  const [goal, setGoal] = useState('');
  const [dietType, setDietType] = useState('');
  const [healthConditions, setHealthConditions] = useState('');
  const [result, setResult] = useState<CarbIntakeResult | null>(null);

  const calculateCarbIntake = () => {
    if (!weight || !height || !age || !gender || !activityLevel || !goal) return;

    const weightKg = unitSystem === 'metric' ? parseFloat(weight) : parseFloat(weight) * 0.453592;
    let heightCm: number;

    if (unitSystem === 'metric') {
      heightCm = parseFloat(height);
    } else {
      const totalInches = (parseFloat(feet) * 12) + parseFloat(inches);
      heightCm = totalInches * 2.54;
    }

    const ageNum = parseInt(age);

    // Calculate BMR (Basal Metabolic Rate)
    let bmr: number;
    if (gender === 'male') {
      bmr = 88.362 + (13.397 * weightKg) + (4.799 * heightCm) - (5.677 * ageNum);
    } else {
      bmr = 447.593 + (9.247 * weightKg) + (3.098 * heightCm) - (4.330 * ageNum);
    }

    // Calculate TDEE (Total Daily Energy Expenditure)
    let activityMultiplier = 1.2;
    switch (activityLevel) {
      case 'sedentary':
        activityMultiplier = 1.2;
        break;
      case 'light':
        activityMultiplier = 1.375;
        break;
      case 'moderate':
        activityMultiplier = 1.55;
        break;
      case 'active':
        activityMultiplier = 1.725;
        break;
      case 'very_active':
        activityMultiplier = 1.9;
        break;
    }

    let tdee = bmr * activityMultiplier;

    // Adjust calories based on goal
    switch (goal) {
      case 'weight_loss':
        tdee *= 0.8; // 20% deficit
        break;
      case 'maintenance':
        // Keep TDEE as is
        break;
      case 'muscle_gain':
        tdee *= 1.15; // 15% surplus
        break;
      case 'athletic_performance':
        tdee *= 1.1; // 10% surplus
        break;
    }

    // Determine carb percentage based on diet type and goal
    let carbPercentage = 0.45; // Default 45% of calories from carbs

    switch (dietType) {
      case 'balanced':
        carbPercentage = 0.45;
        break;
      case 'low_carb':
        carbPercentage = 0.25;
        break;
      case 'high_carb':
        carbPercentage = 0.60;
        break;
      case 'paleo':
        carbPercentage = 0.35;
        break;
      case 'mediterranean':
        carbPercentage = 0.50;
        break;
    }

    // Adjust for activity level
    if (activityLevel === 'very_active' || activityLevel === 'active') {
      carbPercentage += 0.05; // Increase carbs for active individuals
    }

    // Adjust for health conditions
    if (healthConditions === 'diabetes') {
      carbPercentage = Math.min(carbPercentage, 0.40); // Lower carbs for diabetes
    } else if (healthConditions === 'insulin_resistance') {
      carbPercentage = Math.min(carbPercentage, 0.35);
    }

    // Calculate carb intake
    const carbCalories = tdee * carbPercentage;
    const dailyCarbIntake = carbCalories / 4; // 4 calories per gram of carbs
    const carbsPerMeal = dailyCarbIntake / 3; // Assuming 3 meals per day

    // Calculate food sources (grams needed from each source to meet daily carbs)
    const carbSources = {
      rice: Math.ceil(dailyCarbIntake / 0.23), // White rice has ~23g carbs per 100g
      bread: Math.ceil(dailyCarbIntake / 49), // Whole grain bread has ~49g carbs per 100g (2 slices)
      pasta: Math.ceil(dailyCarbIntake / 0.31), // Pasta has ~31g carbs per 100g
      oats: Math.ceil(dailyCarbIntake / 0.66), // Oats have ~66g carbs per 100g
      banana: Math.ceil(dailyCarbIntake / 23), // Medium banana has ~23g carbs
      potato: Math.ceil(dailyCarbIntake / 0.17), // Potato has ~17g carbs per 100g
    };

    // Generate recommendations
    const recommendations = [];
    
    if (goal === 'weight_loss') {
      recommendations.push('Focus on complex carbs and fiber-rich sources');
      recommendations.push('Time carbs around workouts for better utilization');
    }
    
    if (goal === 'muscle_gain' || activityLevel === 'very_active') {
      recommendations.push('Include fast-digesting carbs post-workout');
      recommendations.push('Spread carbs throughout the day for sustained energy');
    }
    
    if (healthConditions === 'diabetes' || healthConditions === 'insulin_resistance') {
      recommendations.push('Choose low glycemic index carbohydrates');
      recommendations.push('Pair carbs with protein and healthy fats');
    }
    
    recommendations.push('Stay hydrated when increasing carb intake');
    recommendations.push('Monitor energy levels and adjust as needed');

    // Carb timing recommendations
    const timing = [
      'Have carbs 1-2 hours before workouts for energy',
      'Include carbs in post-workout meals for recovery',
      'Distribute carbs evenly throughout the day'
    ];

    if (goal === 'weight_loss') {
      timing.push('Consider reducing carbs in the evening');
    }

    if (activityLevel === 'very_active') {
      timing.push('Increase carb intake on high-intensity training days');
    }

    setResult({
      dailyCarbIntake: Math.round(dailyCarbIntake),
      carbsPerMeal: Math.round(carbsPerMeal),
      carbCalories: Math.round(carbCalories),
      percentageOfCalories: Math.round(carbPercentage * 100),
      carbSources,
      recommendations,
      timing
    });
  };

  const resetCalculator = () => {
    setWeight('');
    setHeight('');
    setFeet('');
    setInches('');
    setAge('');
    setGender('');
    setActivityLevel('');
    setGoal('');
    setDietType('');
    setHealthConditions('');
    setUnitSystem('metric');
    setResult(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50 to-green-50">
      <Helmet>
        <title>Carb Calculator - Calculate Your Daily Carbohydrate Intake | DapsiWow</title>
        <meta name="description" content="Free carbohydrate calculator to determine your daily carb intake needs based on weight, activity level, fitness goals, and diet type. Get personalized carb recommendations with meal planning suggestions." />
        <meta name="keywords" content="carb calculator, carbohydrate calculator, daily carb intake, carb requirements, macronutrient calculator, diet carbs, carbohydrate needs, carb intake calculator, nutrition calculator, meal planning carbs" />
        <meta property="og:title" content="Carb Calculator - Calculate Your Daily Carbohydrate Intake | DapsiWow" />
        <meta property="og:description" content="Free carbohydrate calculator for determining optimal daily carb intake based on your personal goals and activity level." />
        <meta property="og:type" content="website" />
        <meta name="robots" content="index, follow" />
        <meta name="author" content="DapsiWow" />
        <link rel="canonical" href="https://dapsiwow.com/tools/carb-calculator" />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            "name": "Carb Calculator",
            "description": "Free online carbohydrate calculator to determine daily carb intake needs based on personal metrics, activity level, and fitness goals. Features personalized recommendations for different diet types.",
            "url": "https://dapsiwow.com/tools/carb-calculator",
            "applicationCategory": "HealthApplication",
            "operatingSystem": "Any",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "USD"
            },
            "featureList": [
              "Calculate daily carbohydrate needs",
              "Support for different diet types",
              "Activity level adjustments",
              "Health condition considerations",
              "Meal timing recommendations",
              "Food source suggestions"
            ]
          })}
        </script>
      </Helmet>
      
      <Header />
      
      <main>
        {/* Hero Section */}
        <section className="relative py-12 sm:py-16 md:py-20 lg:py-24 xl:py-28 2xl:py-32 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-600/10 to-green-600/20"></div>
          <div className="relative max-w-sm sm:max-w-lg md:max-w-2xl lg:max-w-4xl xl:max-w-5xl 2xl:max-w-6xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 xl:px-12 text-center">
            <div className="space-y-4 sm:space-y-6 md:space-y-8 lg:space-y-10">
              <div className="inline-flex items-center px-3 py-1.5 sm:px-4 sm:py-2 bg-white/80 backdrop-blur-sm rounded-full border border-emerald-200">
                <span className="text-xs sm:text-sm font-medium text-emerald-700">Professional Carb Calculator</span>
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl 2xl:text-8xl font-bold text-slate-900 leading-tight tracking-tight">
                <span className="block">Smart Carb</span>
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-green-600 mt-1 sm:mt-2">
                  Calculator
                </span>
              </h1>
              <p className="text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl text-slate-600 max-w-sm sm:max-w-lg md:max-w-2xl lg:max-w-3xl xl:max-w-4xl mx-auto leading-relaxed px-2 sm:px-0">
                Calculate your optimal daily carbohydrate intake with personalized recommendations based on your goals and lifestyle
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
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">Carb Configuration</h2>
                    <p className="text-gray-600">Enter your personal details to get accurate carbohydrate recommendations</p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Unit System */}
                    <div className="space-y-3 md:col-span-2">
                      <Label className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                        Unit System
                      </Label>
                      <RadioGroup 
                        value={unitSystem} 
                        onValueChange={setUnitSystem}
                        className="flex gap-8"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="metric" id="metric" data-testid="radio-metric" />
                          <Label htmlFor="metric" className="font-medium">Metric (kg, cm)</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="imperial" id="imperial" data-testid="radio-imperial" />
                          <Label htmlFor="imperial" className="font-medium">Imperial (lbs, ft/in)</Label>
                        </div>
                      </RadioGroup>
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
                        className="h-14 text-lg border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-emerald-500"
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
                          className="h-14 text-lg border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-emerald-500"
                          placeholder="175"
                          min="100"
                          max="250"
                          step="0.1"
                          data-testid="input-height"
                        />
                      ) : (
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <Label htmlFor="feet" className="text-xs text-gray-500 mb-1 block">Feet</Label>
                            <Input
                              id="feet"
                              type="number"
                              value={feet}
                              onChange={(e) => setFeet(e.target.value)}
                              className="h-14 text-lg border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-emerald-500"
                              placeholder="5"
                              min="3"
                              max="8"
                              data-testid="input-feet"
                            />
                          </div>
                          <div>
                            <Label htmlFor="inches" className="text-xs text-gray-500 mb-1 block">Inches</Label>
                            <Input
                              id="inches"
                              type="number"
                              value={inches}
                              onChange={(e) => setInches(e.target.value)}
                              className="h-14 text-lg border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-emerald-500"
                              placeholder="9"
                              min="0"
                              max="11"
                              data-testid="input-inches"
                            />
                          </div>
                        </div>
                      )}
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
                        className="h-14 text-lg border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-emerald-500"
                        placeholder="30"
                        min="1"
                        max="120"
                        data-testid="input-age"
                      />
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
                  </div>

                  {/* Advanced Options */}
                  <div className="space-y-6 border-t pt-8">
                    <h3 className="text-xl font-bold text-gray-900">Lifestyle & Goals</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                            <SelectItem value="sedentary">Sedentary (little/no exercise)</SelectItem>
                            <SelectItem value="light">Light (light exercise 1-3 days/week)</SelectItem>
                            <SelectItem value="moderate">Moderate (moderate exercise 3-5 days/week)</SelectItem>
                            <SelectItem value="active">Active (hard exercise 6-7 days/week)</SelectItem>
                            <SelectItem value="very_active">Very Active (very hard exercise, physical job)</SelectItem>
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
                            <SelectItem value="weight_loss">Weight Loss</SelectItem>
                            <SelectItem value="maintenance">Weight Maintenance</SelectItem>
                            <SelectItem value="muscle_gain">Muscle Gain</SelectItem>
                            <SelectItem value="athletic_performance">Athletic Performance</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Diet Type */}
                      <div className="space-y-3">
                        <Label className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                          Diet Preference
                        </Label>
                        <Select value={dietType} onValueChange={setDietType}>
                          <SelectTrigger className="h-14 border-2 border-gray-200 rounded-xl text-lg" data-testid="select-diet">
                            <SelectValue placeholder="Select diet type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="balanced">Balanced Diet</SelectItem>
                            <SelectItem value="low_carb">Low Carb</SelectItem>
                            <SelectItem value="high_carb">High Carb</SelectItem>
                            <SelectItem value="paleo">Paleo</SelectItem>
                            <SelectItem value="mediterranean">Mediterranean</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Health Conditions */}
                      <div className="space-y-3">
                        <Label className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                          Health Conditions
                        </Label>
                        <Select value={healthConditions} onValueChange={setHealthConditions}>
                          <SelectTrigger className="h-14 border-2 border-gray-200 rounded-xl text-lg" data-testid="select-health">
                            <SelectValue placeholder="Select any relevant conditions" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">None</SelectItem>
                            <SelectItem value="diabetes">Diabetes</SelectItem>
                            <SelectItem value="insulin_resistance">Insulin Resistance</SelectItem>
                            <SelectItem value="metabolic_syndrome">Metabolic Syndrome</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-4 pt-6">
                    <Button
                      onClick={calculateCarbIntake}
                      className="flex-1 h-14 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white font-semibold text-lg rounded-xl shadow-lg transform transition-all duration-200 hover:scale-105"
                      data-testid="button-calculate"
                    >
                      Calculate Carb Intake
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
                <div className="bg-gradient-to-br from-gray-50 to-emerald-50 p-8 lg:p-12">
                  <h2 className="text-2xl font-bold text-gray-900 mb-8">Results</h2>
                  
                  {result ? (
                    <div className="space-y-6" data-testid="carb-intake-results">
                      {/* Daily Carb Intake Highlight */}
                      <div className="bg-white rounded-2xl p-6 shadow-lg border border-emerald-100">
                        <div className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-2">Daily Carb Intake</div>
                        <div className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-green-600" data-testid="text-daily-carbs">
                          {result.dailyCarbIntake}g
                        </div>
                      </div>

                      {/* Carb Distribution */}
                      <div className="space-y-4">
                        <div className="bg-white rounded-xl p-4 shadow-sm">
                          <div className="flex justify-between items-center">
                            <span className="font-medium text-gray-700">Per Meal (3 meals)</span>
                            <span className="font-bold text-gray-900" data-testid="text-carbs-per-meal">
                              ~{result.carbsPerMeal}g
                            </span>
                          </div>
                        </div>
                        <div className="bg-white rounded-xl p-4 shadow-sm">
                          <div className="flex justify-between items-center">
                            <span className="font-medium text-gray-700">Calories from Carbs</span>
                            <span className="font-bold text-orange-600">
                              {result.carbCalories} cal
                            </span>
                          </div>
                        </div>
                        <div className="bg-white rounded-xl p-4 shadow-sm">
                          <div className="flex justify-between items-center">
                            <span className="font-medium text-gray-700">% of Total Calories</span>
                            <span className="font-bold text-gray-900">
                              {result.percentageOfCalories}%
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Food Sources */}
                      <div className="bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl p-6 border border-emerald-200">
                        <h4 className="font-bold text-emerald-800 mb-4 text-lg">Food Sources (to meet daily needs)</h4>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-emerald-700 font-medium">White Rice (cooked):</span>
                            <span className="font-bold text-emerald-800 text-lg">{result.carbSources.rice}g</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-emerald-700 font-medium">Whole Grain Bread:</span>
                            <span className="font-bold text-emerald-800 text-lg">{result.carbSources.bread}g</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-emerald-700 font-medium">Pasta (cooked):</span>
                            <span className="font-bold text-emerald-800 text-lg">{result.carbSources.pasta}g</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-emerald-700 font-medium">Bananas (medium):</span>
                            <span className="font-bold text-emerald-800 text-lg">{result.carbSources.banana}</span>
                          </div>
                        </div>
                      </div>

                      {/* Timing Recommendations */}
                      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
                        <h4 className="font-bold text-blue-800 mb-4 text-lg">Carb Timing Tips</h4>
                        <div className="space-y-2">
                          {result.timing.map((tip, index) => (
                            <div key={index} className="flex items-start gap-3">
                              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                              <span className="text-blue-700 text-sm">{tip}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Recommendations */}
                      <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-6 border border-purple-200">
                        <h4 className="font-bold text-purple-800 mb-4 text-lg">Personalized Recommendations</h4>
                        <div className="space-y-2">
                          {result.recommendations.map((rec, index) => (
                            <div key={index} className="flex items-start gap-3">
                              <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                              <span className="text-purple-700 text-sm">{rec}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-16" data-testid="no-results">
                      <div className="w-20 h-20 bg-gray-200 rounded-full mx-auto mb-6 flex items-center justify-center">
                        <div className="text-3xl font-bold text-gray-400">C</div>
                      </div>
                      <p className="text-gray-500 text-lg">Enter your details and calculate to see carb intake results</p>
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
                <h3 className="text-2xl font-bold text-gray-900 mb-6">What Are Carbohydrates?</h3>
                <div className="space-y-4 text-gray-600">
                  <p>
                    Carbohydrates are one of the three main macronutrients that provide energy for your body. 
                    They're broken down into glucose, which serves as the primary fuel source for your brain, 
                    muscles, and other vital organs.
                  </p>
                  <p>
                    Our carbohydrate calculator helps you determine the optimal daily carb intake based on your 
                    individual needs, activity level, and health goals. Whether you're trying to lose weight, 
                    gain muscle, or maintain your current physique, getting your carb intake right is crucial.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">How to Calculate Carb Intake?</h3>
                <div className="space-y-4 text-gray-600">
                  <p>
                    The formula for calculating carb intake considers your Total Daily Energy Expenditure (TDEE) 
                    and allocates a percentage of calories from carbohydrates based on your goals and diet type.
                  </p>
                  <ul className="space-y-2 list-disc list-inside">
                    <li>Weight Loss: 25-40% of total calories</li>
                    <li>Maintenance: 45-50% of total calories</li>
                    <li>Muscle Gain: 50-60% of total calories</li>
                    <li>Athletic Performance: 55-65% of total calories</li>
                  </ul>
                  <p>
                    Our calculator automatically adjusts these percentages based on your activity level and 
                    any health conditions you may have.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Features of Our Carb Calculator</h3>
                <div className="space-y-3 text-gray-600">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Personalized calculations based on individual metrics</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Support for different diet types and preferences</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Activity level and goal-specific adjustments</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Health condition considerations</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Food source recommendations and meal timing tips</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Benefits of Proper Carb Intake</h3>
                <div className="space-y-3 text-gray-600">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Sustained energy levels throughout the day</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Better workout performance and recovery</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Improved brain function and mental clarity</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Support for your specific health and fitness goals</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Better mood regulation and appetite control</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Additional SEO Content Sections */}
          <div className="mt-12 space-y-8">
            {/* Types of Carbohydrates Section */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Types of Carbohydrates for Optimal Health</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-gray-800">Complex Carbs</h4>
                    <p className="text-gray-600 text-sm">
                      Found in whole grains, vegetables, and legumes, complex carbs provide sustained energy 
                      and are rich in fiber, vitamins, and minerals. They're ideal for weight management 
                      and long-term health.
                    </p>
                    <div className="space-y-1 text-sm text-gray-500">
                      <p>• Oats and quinoa</p>
                      <p>• Sweet potatoes</p>
                      <p>• Brown rice</p>
                      <p>• Beans and lentils</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-gray-800">Simple Carbs</h4>
                    <p className="text-gray-600 text-sm">
                      Quick-digesting carbohydrates that provide rapid energy. Best consumed around 
                      workouts or when you need immediate energy. Natural sources are preferred 
                      over processed options.
                    </p>
                    <div className="space-y-1 text-sm text-gray-500">
                      <p>• Fresh fruits</p>
                      <p>• Dairy products</p>
                      <p>• Honey and maple syrup</p>
                      <p>• White rice (post-workout)</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-gray-800">Fiber</h4>
                    <p className="text-gray-600 text-sm">
                      A type of carbohydrate that your body can't digest, fiber is essential for 
                      digestive health, blood sugar control, and satiety. It doesn't contribute 
                      calories but provides numerous health benefits.
                    </p>
                    <div className="space-y-1 text-sm text-gray-500">
                      <p>• Vegetables and fruits</p>
                      <p>• Whole grains</p>
                      <p>• Nuts and seeds</p>
                      <p>• Psyllium husk</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Carb Timing and Diet Types */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
                <CardContent className="p-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">Carb Timing Strategies</h3>
                  <div className="space-y-4 text-gray-600">
                    <div className="border-l-4 border-emerald-500 pl-4">
                      <h4 className="font-semibold text-gray-800 mb-2">Pre-Workout</h4>
                      <p className="text-sm">Consume 30-60g of easily digestible carbs 1-2 hours before exercise for optimal energy and performance.</p>
                    </div>
                    <div className="border-l-4 border-blue-500 pl-4">
                      <h4 className="font-semibold text-gray-800 mb-2">Post-Workout</h4>
                      <p className="text-sm">Include fast-digesting carbs within 30 minutes post-workout to replenish glycogen stores and support recovery.</p>
                    </div>
                    <div className="border-l-4 border-orange-500 pl-4">
                      <h4 className="font-semibold text-gray-800 mb-2">Throughout the Day</h4>
                      <p className="text-sm">Spread carb intake evenly across meals to maintain stable blood sugar and consistent energy levels.</p>
                    </div>
                    <div className="border-l-4 border-purple-500 pl-4">
                      <h4 className="font-semibold text-gray-800 mb-2">Evening Considerations</h4>
                      <p className="text-sm">For weight loss goals, consider reducing carb intake in the evening and focusing on protein and vegetables.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
                <CardContent className="p-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">Diet-Specific Carb Guidelines</h3>
                  <div className="space-y-4 text-gray-600">
                    <div className="bg-green-50 rounded-lg p-4">
                      <h4 className="font-semibold text-green-800 mb-2">Balanced Diet</h4>
                      <p className="text-sm text-green-700">45-50% of calories from carbs, focusing on whole grains, fruits, and vegetables for optimal health.</p>
                    </div>
                    <div className="bg-blue-50 rounded-lg p-4">
                      <h4 className="font-semibold text-blue-800 mb-2">Low Carb</h4>
                      <p className="text-sm text-blue-700">20-25% of calories from carbs, emphasizing nutrient-dense vegetables and limiting grains and sugars.</p>
                    </div>
                    <div className="bg-orange-50 rounded-lg p-4">
                      <h4 className="font-semibold text-orange-800 mb-2">High Carb</h4>
                      <p className="text-sm text-orange-700">55-65% of calories from carbs, ideal for endurance athletes and highly active individuals.</p>
                    </div>
                    <div className="bg-purple-50 rounded-lg p-4">
                      <h4 className="font-semibold text-purple-800 mb-2">Mediterranean</h4>
                      <p className="text-sm text-purple-700">50-55% of calories from carbs, emphasizing whole grains, legumes, fruits, and vegetables.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Carb Calculator FAQs Section */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-8">Frequently Asked Questions about Carb Intake</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">How many carbs should I eat per day?</h4>
                      <p className="text-gray-600 text-sm">Daily carb intake varies based on your goals, activity level, and health status. Generally, it ranges from 100-300g per day, with our calculator providing personalized recommendations.</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">Are carbs bad for weight loss?</h4>
                      <p className="text-gray-600 text-sm">Carbs aren't inherently bad for weight loss. The key is choosing the right types and amounts. Complex carbs can actually support weight loss by providing satiety and stable energy.</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">Should I eat carbs before or after working out?</h4>
                      <p className="text-gray-600 text-sm">Both! Eat complex carbs 1-2 hours before workouts for energy, and simple carbs within 30 minutes post-workout for recovery and glycogen replenishment.</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">What happens if I eat too few carbs?</h4>
                      <p className="text-gray-600 text-sm">Very low carb intake can lead to fatigue, brain fog, poor workout performance, and difficulty concentrating. Most people need at least 100-130g daily for optimal brain function.</p>
                    </div>
                  </div>
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">Can diabetics use this carb calculator?</h4>
                      <p className="text-gray-600 text-sm">Our calculator includes diabetes considerations and provides lower carb recommendations. However, always consult your healthcare provider for personalized diabetes management advice.</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">How do I track my carb intake?</h4>
                      <p className="text-gray-600 text-sm">Use food tracking apps, read nutrition labels, and measure portions. Focus on whole foods and learn to estimate serving sizes for common carb sources.</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">Is it better to count total carbs or net carbs?</h4>
                      <p className="text-gray-600 text-sm">For general health, total carbs work fine. Net carbs (total minus fiber) are more relevant for ketogenic diets or blood sugar management.</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">How often should I recalculate my carb needs?</h4>
                      <p className="text-gray-600 text-sm">Recalculate when your weight changes significantly, activity level changes, or when switching fitness goals. Generally, every 4-6 weeks is reasonable.</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Health Benefits and Considerations */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
                <CardContent className="p-8">
                  <h3 className="text-xl font-bold text-gray-900 mb-6">Weight Management</h3>
                  <div className="space-y-4 text-gray-600">
                    <p className="text-sm">
                      Proper carb intake is crucial for sustainable weight management. Too few carbs can slow metabolism, while too many can lead to weight gain.
                    </p>
                    <div className="space-y-2">
                      <h4 className="font-semibold text-green-800 text-sm">For Weight Loss:</h4>
                      <ul className="text-xs space-y-1 list-disc list-inside text-green-700">
                        <li>Focus on complex carbs</li>
                        <li>Time carbs around workouts</li>
                        <li>Reduce evening carb intake</li>
                        <li>Prioritize fiber-rich sources</li>
                      </ul>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-semibold text-blue-800 text-sm">For Weight Gain:</h4>
                      <ul className="text-xs space-y-1 list-disc list-inside text-blue-700">
                        <li>Include more starchy carbs</li>
                        <li>Add healthy carb snacks</li>
                        <li>Don't fear fruit sugars</li>
                        <li>Include post-workout carbs</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
                <CardContent className="p-8">
                  <h3 className="text-xl font-bold text-gray-900 mb-6">Athletic Performance</h3>
                  <div className="space-y-4 text-gray-600">
                    <p className="text-sm">
                      Athletes and active individuals need adequate carbs to fuel performance, support recovery, and maintain training intensity.
                    </p>
                    <div className="space-y-2">
                      <h4 className="font-semibold text-orange-800 text-sm">Endurance Sports:</h4>
                      <ul className="text-xs space-y-1 list-disc list-inside text-orange-700">
                        <li>Higher carb intake (60-65%)</li>
                        <li>Carb loading before events</li>
                        <li>During-exercise fueling</li>
                        <li>Focus on glycogen stores</li>
                      </ul>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-semibold text-purple-800 text-sm">Strength Training:</h4>
                      <ul className="text-xs space-y-1 list-disc list-inside text-purple-700">
                        <li>Moderate carb intake (45-55%)</li>
                        <li>Pre-workout carbs for energy</li>
                        <li>Post-workout recovery carbs</li>
                        <li>Support muscle building</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
                <CardContent className="p-8">
                  <h3 className="text-xl font-bold text-gray-900 mb-6">Health Conditions</h3>
                  <div className="space-y-4 text-gray-600">
                    <p className="text-sm">
                      Certain health conditions require special consideration when determining carb intake. Our calculator accounts for these factors.
                    </p>
                    <div className="space-y-2">
                      <h4 className="font-semibold text-red-800 text-sm">Diabetes:</h4>
                      <ul className="text-xs space-y-1 list-disc list-inside text-red-700">
                        <li>Lower carb percentages</li>
                        <li>Focus on low glycemic foods</li>
                        <li>Consistent carb timing</li>
                        <li>Blood sugar monitoring</li>
                      </ul>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-semibold text-indigo-800 text-sm">PCOS/Insulin Resistance:</h4>
                      <ul className="text-xs space-y-1 list-disc list-inside text-indigo-700">
                        <li>Reduced carb intake</li>
                        <li>Emphasize complex carbs</li>
                        <li>Pair with protein/fat</li>
                        <li>Regular meal timing</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Common Mistakes Section */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Common Carb Intake Mistakes to Avoid</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-r-lg">
                      <h4 className="font-semibold text-red-800 mb-2">Eliminating Carbs Completely</h4>
                      <p className="text-red-700 text-sm">Cutting all carbs can lead to fatigue, poor performance, and unsustainable eating patterns. Your brain needs glucose to function optimally.</p>
                    </div>
                    <div className="bg-orange-50 border-l-4 border-orange-400 p-4 rounded-r-lg">
                      <h4 className="font-semibold text-orange-800 mb-2">Not Considering Activity Level</h4>
                      <p className="text-orange-700 text-sm">Your carb needs change dramatically with activity level. Sedentary individuals need fewer carbs than athletes or highly active people.</p>
                    </div>
                    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-lg">
                      <h4 className="font-semibold text-yellow-800 mb-2">Ignoring Carb Quality</h4>
                      <p className="text-yellow-700 text-sm">Not all carbs are equal. Focus on nutrient-dense sources like vegetables, fruits, and whole grains rather than processed foods.</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-lg">
                      <h4 className="font-semibold text-blue-800 mb-2">Poor Timing Strategies</h4>
                      <p className="text-blue-700 text-sm">Eating large amounts of carbs late at night or skipping pre/post-workout carbs can negatively impact results and recovery.</p>
                    </div>
                    <div className="bg-purple-50 border-l-4 border-purple-400 p-4 rounded-r-lg">
                      <h4 className="font-semibold text-purple-800 mb-2">Not Adjusting for Goals</h4>
                      <p className="text-purple-700 text-sm">Your carb needs differ significantly whether you're trying to lose weight, build muscle, or maintain your current physique.</p>
                    </div>
                    <div className="bg-green-50 border-l-4 border-green-400 p-4 rounded-r-lg">
                      <h4 className="font-semibold text-green-800 mb-2">Forgetting About Fiber</h4>
                      <p className="text-green-700 text-sm">Fiber is crucial for digestive health and satiety. Aim for 25-35g daily from various plant-based sources.</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Meal Planning Section */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Carb-Smart Meal Planning Strategies</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-gray-800">Sample Daily Meal Plan</h4>
                    <div className="space-y-3 text-gray-600">
                      <div className="flex items-start gap-3">
                        <div className="w-4 h-4 bg-emerald-500 rounded-full mt-1 flex-shrink-0"></div>
                        <div>
                          <span className="font-semibold">Breakfast:</span> Oatmeal with berries and nuts (40g carbs)
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-4 h-4 bg-blue-500 rounded-full mt-1 flex-shrink-0"></div>
                        <div>
                          <span className="font-semibold">Snack:</span> Apple with almond butter (25g carbs)
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-4 h-4 bg-orange-500 rounded-full mt-1 flex-shrink-0"></div>
                        <div>
                          <span className="font-semibold">Lunch:</span> Quinoa salad with vegetables (45g carbs)
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-4 h-4 bg-purple-500 rounded-full mt-1 flex-shrink-0"></div>
                        <div>
                          <span className="font-semibold">Pre-workout:</span> Banana (25g carbs)
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-4 h-4 bg-green-500 rounded-full mt-1 flex-shrink-0"></div>
                        <div>
                          <span className="font-semibold">Dinner:</span> Sweet potato with lean protein (35g carbs)
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-gray-800">Smart Shopping Tips</h4>
                    <div className="space-y-3 text-gray-600">
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-sm">Shop the perimeter of the store for whole foods</span>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-sm">Choose brown/wild rice over white rice varieties</span>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-sm">Look for "100% whole grain" on bread labels</span>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-sm">Buy seasonal fruits and vegetables for variety</span>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-sm">Stock up on legumes and beans for plant protein</span>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-sm">Read labels to avoid added sugars in packaged foods</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-6 p-4 bg-gradient-to-r from-emerald-50 to-green-50 rounded-lg">
                  <h4 className="font-semibold text-emerald-800 mb-2">Pro Tip</h4>
                  <p className="text-emerald-700 text-sm">
                    Use our carb calculator weekly to adjust your intake as your activity level, weight, or 
                    goals change. Consistency with quality carb sources is more important than perfection 
                    with exact numbers.
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
};

export default CarbCalculator;
