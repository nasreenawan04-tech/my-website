
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

interface KetoMacroResult {
  dailyCalories: number;
  totalFat: number;
  totalProtein: number;
  totalCarbs: number;
  netCarbs: number;
  fatPercentage: number;
  proteinPercentage: number;
  carbPercentage: number;
  macrosByMeal: {
    fat: number;
    protein: number;
    carbs: number;
  };
  ketoFoods: {
    avocado: number;
    butter: number;
    salmon: number;
    eggs: number;
    spinach: number;
    broccoli: number;
  };
  recommendations: string[];
  tips: string[];
}

export default function KetoMacroCalculator() {
  const [weight, setWeight] = useState('70');
  const [height, setHeight] = useState('175');
  const [feet, setFeet] = useState('5');
  const [inches, setInches] = useState('9');
  const [age, setAge] = useState('30');
  const [unitSystem, setUnitSystem] = useState('metric');
  const [gender, setGender] = useState('');
  const [activityLevel, setActivityLevel] = useState('');
  const [ketoGoal, setKetoGoal] = useState('');
  const [ketoExperience, setKetoExperience] = useState('beginner');
  const [bodyFatPercentage, setBodyFatPercentage] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [result, setResult] = useState<KetoMacroResult | null>(null);

  const calculateKetoMacros = () => {
    if (!weight || !height || !age || !gender || !activityLevel || !ketoGoal) return;

    const weightKg = unitSystem === 'metric' ? parseFloat(weight) : parseFloat(weight) * 0.453592;
    let heightCm: number;

    if (unitSystem === 'metric') {
      heightCm = parseFloat(height);
    } else {
      const totalInches = (parseFloat(feet) * 12) + parseFloat(inches);
      heightCm = totalInches * 2.54;
    }

    const ageNum = parseInt(age);

    // Calculate BMR using Mifflin-St Jeor equation
    let bmr: number;
    if (gender === 'male') {
      bmr = 10 * weightKg + 6.25 * heightCm - 5 * ageNum + 5;
    } else {
      bmr = 10 * weightKg + 6.25 * heightCm - 5 * ageNum - 161;
    }

    // Calculate TDEE
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

    // Adjust calories based on keto goal
    switch (ketoGoal) {
      case 'weight_loss':
        tdee *= 0.75; // 25% deficit for faster weight loss
        break;
      case 'maintenance':
        // Keep TDEE as is
        break;
      case 'muscle_gain':
        tdee *= 1.1; // 10% surplus (smaller surplus for keto)
        break;
      case 'therapeutic':
        // Keep at maintenance for therapeutic ketosis
        break;
    }

    // Calculate protein needs (important to preserve muscle on keto)
    let proteinPerKg = 1.2; // Base protein for keto
    
    if (bodyFatPercentage) {
      const bfp = parseFloat(bodyFatPercentage) / 100;
      const leanMass = weightKg * (1 - bfp);
      proteinPerKg = 1.6; // Higher protein for lean mass preservation
    }

    // Adjust protein based on activity and goals
    if (activityLevel === 'very_active' || ketoGoal === 'muscle_gain') {
      proteinPerKg += 0.4;
    }

    const totalProtein = weightKg * proteinPerKg;
    const proteinCalories = totalProtein * 4;

    // Keto carb limits
    let totalCarbs = 20; // Standard keto: 20g net carbs
    let netCarbs = 20;
    
    switch (ketoExperience) {
      case 'beginner':
        totalCarbs = 20;
        netCarbs = 20;
        break;
      case 'intermediate':
        totalCarbs = 25;
        netCarbs = 25;
        break;
      case 'advanced':
        totalCarbs = 30;
        netCarbs = 25; // Can handle slightly more total carbs with fiber
        break;
      case 'therapeutic':
        totalCarbs = 15;
        netCarbs = 15;
        break;
    }

    const carbCalories = totalCarbs * 4;

    // Fat fills the rest (main keto macronutrient)
    const fatCalories = tdee - proteinCalories - carbCalories;
    const totalFat = fatCalories / 9; // 9 calories per gram of fat

    // Calculate percentages
    const fatPercentage = Math.round((fatCalories / tdee) * 100);
    const proteinPercentage = Math.round((proteinCalories / tdee) * 100);
    const carbPercentage = Math.round((carbCalories / tdee) * 100);

    // Macros per meal (assuming 3 meals)
    const macrosByMeal = {
      fat: Math.round(totalFat / 3),
      protein: Math.round(totalProtein / 3),
      carbs: Math.round(totalCarbs / 3)
    };

    // Calculate keto food sources
    const ketoFoods = {
      avocado: Math.ceil(totalFat / 21), // 1 medium avocado = ~21g fat
      butter: Math.ceil(totalFat / 11), // 1 tbsp butter = ~11g fat
      salmon: Math.ceil(totalProtein / 25), // 100g salmon = ~25g protein, 11g fat
      eggs: Math.ceil(totalProtein / 6), // 1 large egg = ~6g protein, 5g fat
      spinach: Math.ceil(netCarbs / 1.4), // 100g spinach = ~1.4g net carbs
      broccoli: Math.ceil(netCarbs / 4), // 100g broccoli = ~4g net carbs
    };

    // Generate recommendations
    const recommendations = [];
    
    if (ketoExperience === 'beginner') {
      recommendations.push('Start with 20g net carbs to ensure ketosis');
      recommendations.push('Track ketones using urine strips or blood monitor');
      recommendations.push('Increase salt and electrolyte intake');
    }
    
    if (ketoGoal === 'weight_loss') {
      recommendations.push('Prioritize whole, unprocessed foods');
      recommendations.push('Consider intermittent fasting to enhance ketosis');
    }
    
    if (activityLevel === 'very_active' || activityLevel === 'active') {
      recommendations.push('Time carbs around workouts if needed');
      recommendations.push('Consider targeted ketogenic diet (TKD) for performance');
    }
    
    recommendations.push('Drink plenty of water throughout the day');
    recommendations.push('Focus on quality fats like avocados, olive oil, and nuts');

    // Keto-specific tips
    const tips = [
      'Allow 2-4 weeks for full keto adaptation',
      'Monitor for "keto flu" symptoms in first week',
      'Supplement with magnesium, potassium, and sodium',
      'Track net carbs (total carbs minus fiber)',
      'Plan meals in advance to stay within macro limits'
    ];

    if (ketoGoal === 'muscle_gain') {
      tips.push('Resistance training is crucial for muscle growth on keto');
    }

    setResult({
      dailyCalories: Math.round(tdee),
      totalFat: Math.round(totalFat),
      totalProtein: Math.round(totalProtein),
      totalCarbs: Math.round(totalCarbs),
      netCarbs: Math.round(netCarbs),
      fatPercentage,
      proteinPercentage,
      carbPercentage,
      macrosByMeal,
      ketoFoods,
      recommendations,
      tips
    });
  };

  const resetCalculator = () => {
    setWeight('70');
    setHeight('175');
    setFeet('5');
    setInches('9');
    setAge('30');
    setGender('');
    setActivityLevel('');
    setKetoGoal('');
    setKetoExperience('beginner');
    setBodyFatPercentage('');
    setUnitSystem('metric');
    setShowAdvanced(false);
    setResult(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Helmet>
        <title>Keto Macro Calculator - Calculate Your Ketogenic Diet Macros | DapsiWow</title>
        <meta name="description" content="Free keto macro calculator to calculate personalized ketogenic diet macronutrient ratios. Get precise fat, protein, and carb targets for optimal ketosis and weight loss. Support for all fitness levels and keto goals." />
        <meta name="keywords" content="keto macro calculator, ketogenic diet calculator, keto macros, low carb calculator, ketosis calculator, keto diet planner, macronutrient calculator, keto weight loss calculator, ketogenic macros, keto nutrition calculator" />
        <meta property="og:title" content="Keto Macro Calculator - Calculate Your Ketogenic Diet Macros | DapsiWow" />
        <meta property="og:description" content="Free keto macro calculator for personalized ketogenic diet planning. Calculate optimal fat, protein, and carb ratios for successful ketosis." />
        <meta property="og:type" content="website" />
        <meta name="robots" content="index, follow" />
        <meta name="author" content="DapsiWow" />
        <link rel="canonical" href="https://dapsiwow.com/tools/keto-macro-calculator" />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            "name": "Keto Macro Calculator",
            "description": "Free online keto macro calculator to calculate personalized ketogenic diet macronutrient ratios for optimal ketosis, weight loss, and muscle gain. Features advanced calculations for all keto experience levels.",
            "url": "https://dapsiwow.com/tools/keto-macro-calculator",
            "applicationCategory": "HealthApplication",
            "operatingSystem": "Any",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "USD"
            },
            "featureList": [
              "Calculate personalized keto macros",
              "Support for all activity levels",
              "Weight loss and muscle gain goals",
              "Beginner to advanced keto experience",
              "Detailed meal planning recommendations",
              "Keto food suggestions"
            ]
          })}
        </script>
      </Helmet>
      
      <Header />
      
      <main>
        {/* Hero Section */}
        <section className="relative py-12 sm:py-16 md:py-20 lg:py-24 xl:py-28 2xl:py-32 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-600/10 to-violet-600/20"></div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="space-y-4 sm:space-y-6 md:space-y-7 lg:space-y-8">
              <div className="inline-flex items-center px-3 sm:px-4 py-1.5 sm:py-2 bg-white/80 backdrop-blur-sm rounded-full border border-purple-200">
                <span className="text-xs sm:text-sm font-medium text-purple-700">Professional Keto Calculator</span>
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl 2xl:text-8xl font-bold text-slate-900 leading-tight tracking-tight">
                <span className="block">Keto Macro</span>
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-violet-600 mt-1 sm:mt-2">
                  Calculator
                </span>
              </h1>
              <p className="text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl text-slate-600 max-w-sm sm:max-w-lg md:max-w-2xl lg:max-w-3xl xl:max-w-4xl mx-auto leading-relaxed px-2 sm:px-0">
                Calculate personalized ketogenic diet macronutrient ratios for optimal ketosis and results
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
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">Keto Profile Setup</h2>
                    <p className="text-gray-600">Enter your personal information to calculate optimal keto macros</p>
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
                        className="h-14 text-lg border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-purple-500"
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
                          className="h-14 text-lg border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-purple-500"
                          placeholder="175"
                          min="100"
                          max="250"
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
                              className="h-14 text-lg border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-purple-500"
                              placeholder="5"
                              min="3"
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
                              className="h-14 text-lg border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-purple-500"
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
                        className="h-14 text-lg border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-purple-500"
                        placeholder="30"
                        min="1"
                        max="120"
                        data-testid="input-age"
                      />
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
                          <SelectItem value="sedentary">Sedentary (little/no exercise)</SelectItem>
                          <SelectItem value="light">Light (light exercise 1-3 days/week)</SelectItem>
                          <SelectItem value="moderate">Moderate (moderate exercise 3-5 days/week)</SelectItem>
                          <SelectItem value="active">Active (hard exercise 6-7 days/week)</SelectItem>
                          <SelectItem value="very_active">Very Active (very hard exercise, physical job)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Keto Goals */}
                  <div className="space-y-6 border-t pt-8">
                    <h3 className="text-xl font-bold text-gray-900">Keto Goals & Experience</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Keto Goal */}
                      <div className="space-y-3">
                        <Label className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                          Primary Goal
                        </Label>
                        <Select value={ketoGoal} onValueChange={setKetoGoal}>
                          <SelectTrigger className="h-14 border-2 border-gray-200 rounded-xl text-lg" data-testid="select-keto-goal">
                            <SelectValue placeholder="Select your keto goal" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="weight_loss">Weight Loss</SelectItem>
                            <SelectItem value="maintenance">Weight Maintenance</SelectItem>
                            <SelectItem value="muscle_gain">Muscle Gain</SelectItem>
                            <SelectItem value="therapeutic">Therapeutic Ketosis</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Keto Experience */}
                      <div className="space-y-3">
                        <Label className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                          Keto Experience
                        </Label>
                        <Select value={ketoExperience} onValueChange={setKetoExperience}>
                          <SelectTrigger className="h-14 border-2 border-gray-200 rounded-xl text-lg" data-testid="select-keto-experience">
                            <SelectValue placeholder="Select your experience level" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="beginner">Beginner (0-3 months)</SelectItem>
                            <SelectItem value="intermediate">Intermediate (3-12 months)</SelectItem>
                            <SelectItem value="advanced">Advanced (1+ years)</SelectItem>
                            <SelectItem value="therapeutic">Therapeutic (medical supervision)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  {/* Advanced Options */}
                  <div className="space-y-6 border-t pt-8">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xl font-bold text-gray-900">Advanced Options</h3>
                      <Button
                        onClick={() => setShowAdvanced(!showAdvanced)}
                        variant="outline"
                        size="sm"
                        className="rounded-full"
                        data-testid="button-show-advanced"
                      >
                        {showAdvanced ? 'Hide' : 'Show'} Advanced
                      </Button>
                    </div>
                    
                    {showAdvanced && (
                      <div className="space-y-4 bg-gray-50 rounded-xl p-6">
                        <div className="space-y-3">
                          <Label htmlFor="body-fat" className="text-sm font-medium text-gray-700">
                            Body Fat Percentage (optional)
                          </Label>
                          <div className="relative">
                            <Input
                              id="body-fat"
                              type="number"
                              value={bodyFatPercentage}
                              onChange={(e) => setBodyFatPercentage(e.target.value)}
                              className="h-12 pr-8 border-2 border-gray-200 rounded-lg w-full md:w-48"
                              placeholder="15"
                              min="5"
                              max="50"
                              step="0.1"
                              data-testid="input-body-fat"
                            />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">%</span>
                          </div>
                          <p className="text-sm text-gray-500">
                            Helps calculate more accurate protein needs for lean body mass
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-4 pt-6">
                    <Button
                      onClick={calculateKetoMacros}
                      className="flex-1 h-14 bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 text-white font-semibold text-lg rounded-xl shadow-lg transform transition-all duration-200 hover:scale-105"
                      data-testid="button-calculate"
                    >
                      Calculate Keto Macros
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
                <div className="bg-gradient-to-br from-gray-50 to-purple-50 p-8 lg:p-12">
                  <h2 className="text-2xl font-bold text-gray-900 mb-8">Keto Macro Results</h2>
                  
                  {result ? (
                    <div className="space-y-6" data-testid="keto-macro-results">
                      {/* Daily Calories Highlight */}
                      <div className="bg-white rounded-2xl p-6 shadow-lg border border-purple-100">
                        <div className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-2">Daily Calories</div>
                        <div className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-violet-600" data-testid="text-daily-calories">
                          {result.dailyCalories} cal
                        </div>
                      </div>

                      {/* Macro Breakdown */}
                      <div className="space-y-4">
                        <div className="bg-white rounded-xl p-4 shadow-sm">
                          <div className="flex justify-between items-center">
                            <span className="font-medium text-gray-700">Fat ({result.fatPercentage}%)</span>
                            <span className="font-bold text-purple-600" data-testid="text-fat-grams">
                              {result.totalFat}g
                            </span>
                          </div>
                        </div>
                        <div className="bg-white rounded-xl p-4 shadow-sm">
                          <div className="flex justify-between items-center">
                            <span className="font-medium text-gray-700">Protein ({result.proteinPercentage}%)</span>
                            <span className="font-bold text-orange-600" data-testid="text-protein-grams">
                              {result.totalProtein}g
                            </span>
                          </div>
                        </div>
                        <div className="bg-white rounded-xl p-4 shadow-sm">
                          <div className="flex justify-between items-center">
                            <span className="font-medium text-gray-700">Net Carbs ({result.carbPercentage}%)</span>
                            <span className="font-bold text-green-600" data-testid="text-net-carbs">
                              {result.netCarbs}g
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Per Meal Breakdown */}
                      <div className="bg-gradient-to-r from-purple-50 to-violet-50 rounded-xl p-6 border border-purple-200">
                        <h4 className="font-bold text-purple-800 mb-4 text-lg">Per Meal (3 meals)</h4>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-purple-700 font-medium">Fat per meal:</span>
                            <span className="font-bold text-purple-800 text-lg">
                              {result.macrosByMeal.fat}g
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-purple-700 font-medium">Protein per meal:</span>
                            <span className="font-bold text-purple-800 text-lg">
                              {result.macrosByMeal.protein}g
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-purple-700 font-medium">Carbs per meal:</span>
                            <span className="font-bold text-purple-800 text-lg">
                              {result.macrosByMeal.carbs}g
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Keto Food Examples */}
                      <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
                        <h4 className="font-bold text-green-800 mb-4 text-lg">Daily Food Examples</h4>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-green-700 font-medium">Avocado (medium):</span>
                            <span className="font-bold text-green-800 text-lg">
                              {result.ketoFoods.avocado}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-green-700 font-medium">Eggs (large):</span>
                            <span className="font-bold text-green-800 text-lg">
                              {result.ketoFoods.eggs}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-green-700 font-medium">Salmon (100g):</span>
                            <span className="font-bold text-green-800 text-lg">
                              {result.ketoFoods.salmon}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Recommendations */}
                      {result.recommendations.length > 0 && (
                        <div className="bg-white rounded-xl p-4 shadow-sm">
                          <h4 className="font-bold text-gray-900 mb-3">Personalized Recommendations</h4>
                          <ul className="space-y-1 text-sm text-gray-600">
                            {result.recommendations.map((rec, index) => (
                              <li key={index} className="flex items-start">
                                <span className="text-purple-500 mr-2">•</span>
                                {rec}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-16" data-testid="no-results">
                      <div className="w-20 h-20 bg-gray-200 rounded-full mx-auto mb-6 flex items-center justify-center">
                        <div className="text-3xl font-bold text-gray-400">K</div>
                      </div>
                      <p className="text-gray-500 text-lg">Enter your information and calculate to see keto macro results</p>
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
                <h3 className="text-2xl font-bold text-gray-900 mb-6">What is a Keto Macro Calculator?</h3>
                <div className="space-y-4 text-gray-600">
                  <p>
                    A keto macro calculator is an essential tool for anyone following the ketogenic diet. It calculates 
                    your personalized macronutrient ratios - fat, protein, and carbohydrates - needed to achieve and 
                    maintain ketosis, the metabolic state where your body burns fat for fuel instead of carbohydrates.
                  </p>
                  <p>
                    Our advanced keto calculator considers your individual factors including age, gender, weight, height, 
                    activity level, and specific keto goals to provide precise macro targets. Whether you're aiming for 
                    weight loss, muscle gain, or therapeutic benefits, accurate macro calculation is crucial for keto success.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">How to Use the Keto Calculator?</h3>
                <div className="space-y-4 text-gray-600">
                  <p>
                    Using our keto macro calculator is simple and straightforward:
                  </p>
                  <ul className="space-y-2 list-disc list-inside">
                    <li>Enter your basic information (age, gender, weight, height)</li>
                    <li>Select your activity level and primary keto goal</li>
                    <li>Choose your keto experience level for appropriate carb limits</li>
                    <li>Optionally add body fat percentage for precise protein calculations</li>
                    <li>Click calculate to get your personalized keto macros</li>
                  </ul>
                  <p>
                    The calculator provides detailed results including daily calories, macro breakdowns, meal planning 
                    suggestions, and personalized recommendations based on your goals and experience level.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Understanding Keto Macros</h3>
                <div className="space-y-3 text-gray-600">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span><strong>Fat (70-75%):</strong> Your primary energy source on keto, focus on healthy fats</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span><strong>Protein (20-25%):</strong> Essential for muscle preservation and metabolic health</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span><strong>Net Carbs (5-10%):</strong> Limited to maintain ketosis, typically 20-50g daily</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span><strong>Ketosis:</strong> Metabolic state achieved when carbs are restricted sufficiently</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span><strong>Net Carbs:</strong> Total carbs minus fiber and sugar alcohols</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Benefits of Accurate Macro Tracking</h3>
                <div className="space-y-3 text-gray-600">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Achieve and maintain ketosis consistently</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Optimize weight loss and body composition</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Maintain stable energy levels throughout the day</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Preserve lean muscle mass during weight loss</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Plan meals effectively for keto success</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Additional SEO Content Sections */}
          <div className="mt-12 space-y-8">
            {/* Keto Diet Types */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Types of Ketogenic Diets</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-gray-800">Standard Ketogenic Diet (SKD)</h4>
                    <p className="text-gray-600">
                      The most researched and commonly followed version with 70-75% fat, 20-25% protein, and 5-10% carbs. 
                      Ideal for beginners and those seeking general health benefits and weight loss.
                    </p>
                  </div>
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-gray-800">Targeted Ketogenic Diet (TKD)</h4>
                    <p className="text-gray-600">
                      Allows for 15-30g of fast-acting carbs around workouts while maintaining ketosis. Perfect for 
                      active individuals who need extra fuel for high-intensity training sessions.
                    </p>
                  </div>
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-gray-800">Cyclical Ketogenic Diet (CKD)</h4>
                    <p className="text-gray-600">
                      Involves periods of higher-carb intake (1-2 days) followed by strict keto days. Designed for 
                      athletes and bodybuilders who need carb refeeds for performance and muscle growth.
                    </p>
                  </div>
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-gray-800">High-Protein Ketogenic Diet</h4>
                    <p className="text-gray-600">
                      Modified version with 60-65% fat, 30-35% protein, and 5% carbs. Suitable for individuals 
                      with higher protein needs, such as older adults or those focused on muscle preservation.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Keto Food Guidelines */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
                <CardContent className="p-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">Keto-Friendly Foods</h3>
                  <div className="space-y-4 text-gray-600">
                    <div className="border-l-4 border-green-500 pl-4">
                      <h4 className="font-semibold text-gray-800 mb-2">Healthy Fats</h4>
                      <p className="text-sm">Avocados, olive oil, coconut oil, nuts, seeds, fatty fish, grass-fed butter, MCT oil</p>
                    </div>
                    <div className="border-l-4 border-orange-500 pl-4">
                      <h4 className="font-semibold text-gray-800 mb-2">Quality Proteins</h4>
                      <p className="text-sm">Grass-fed meat, wild-caught fish, free-range eggs, organic poultry, full-fat dairy</p>
                    </div>
                    <div className="border-l-4 border-blue-500 pl-4">
                      <h4 className="font-semibold text-gray-800 mb-2">Low-Carb Vegetables</h4>
                      <p className="text-sm">Leafy greens, broccoli, cauliflower, zucchini, asparagus, bell peppers, Brussels sprouts</p>
                    </div>
                    <div className="border-l-4 border-purple-500 pl-4">
                      <h4 className="font-semibold text-gray-800 mb-2">Keto Beverages</h4>
                      <p className="text-sm">Water, black coffee, plain tea, bone broth, sugar-free electrolyte drinks</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
                <CardContent className="p-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">Foods to Avoid on Keto</h3>
                  <div className="space-y-4 text-gray-600">
                    <div className="bg-red-50 rounded-lg p-4">
                      <h4 className="font-semibold text-red-800 mb-2">High-Carb Foods</h4>
                      <p className="text-sm text-red-700">Grains, bread, pasta, rice, cereals, potatoes, corn, beans, legumes</p>
                    </div>
                    <div className="bg-orange-50 rounded-lg p-4">
                      <h4 className="font-semibold text-orange-800 mb-2">Sugary Foods</h4>
                      <p className="text-sm text-orange-700">Candy, chocolate, desserts, ice cream, sodas, fruit juices, honey, maple syrup</p>
                    </div>
                    <div className="bg-yellow-50 rounded-lg p-4">
                      <h4 className="font-semibold text-yellow-800 mb-2">Most Fruits</h4>
                      <p className="text-sm text-yellow-700">Bananas, apples, oranges, grapes (small amounts of berries are okay)</p>
                    </div>
                    <div className="bg-blue-50 rounded-lg p-4">
                      <h4 className="font-semibold text-blue-800 mb-2">Processed Foods</h4>
                      <p className="text-sm text-blue-700">Packaged snacks, fast food, processed meats with added sugars, low-fat products</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Keto Success Tips */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-8">Keto Success Strategies and Tips</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">Getting Started on Keto</h4>
                      <p className="text-gray-600 text-sm">Begin by calculating your macros using our calculator, then gradually reduce carbs over a week. Clear out high-carb foods and stock up on keto-friendly options. Plan your first week of meals to avoid decision fatigue.</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">Managing the Keto Flu</h4>
                      <p className="text-gray-600 text-sm">The keto flu occurs during the first week as your body adapts. Combat symptoms by increasing electrolyte intake (sodium, potassium, magnesium), staying hydrated, and getting adequate sleep.</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">Tracking Your Progress</h4>
                      <p className="text-gray-600 text-sm">Use a food diary to track macros accurately. Monitor ketone levels with urine strips or blood meters. Take body measurements and progress photos beyond just weighing yourself.</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">Meal Planning Strategies</h4>
                      <p className="text-gray-600 text-sm">Prep meals in advance to stay on track. Focus on simple, whole foods. Keep keto-friendly snacks available for when hunger strikes between meals.</p>
                    </div>
                  </div>
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">Staying in Ketosis</h4>
                      <p className="text-gray-600 text-sm">Keep net carbs under your calculated limit consistently. Don't fear healthy fats - they're your primary fuel source. Eat adequate protein to preserve muscle mass during weight loss.</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">Exercise on Keto</h4>
                      <p className="text-gray-600 text-sm">Initially, expect decreased performance as your body adapts. Focus on low-intensity activities for the first few weeks. Once keto-adapted, many people experience improved endurance and stable energy.</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">Social Situations</h4>
                      <p className="text-gray-600 text-sm">Plan ahead for dining out by researching menus. Don't be afraid to ask for modifications. Bring keto-friendly dishes to social gatherings to ensure you have options.</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">Long-term Sustainability</h4>
                      <p className="text-gray-600 text-sm">Focus on nutrient-dense whole foods rather than processed keto products. Listen to your body and adjust macros as needed. Consider working with a healthcare provider for long-term monitoring.</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Keto FAQs */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-8">Frequently Asked Questions about Keto Macros</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">How long does it take to enter ketosis?</h4>
                      <p className="text-gray-600 text-sm">Most people enter ketosis within 2-7 days of restricting carbs to under 20-50g daily. Factors like metabolism, activity level, and previous diet affect timing. Use ketone testing to confirm ketosis.</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">Can I eat too much protein on keto?</h4>
                      <p className="text-gray-600 text-sm">Excessive protein can theoretically convert to glucose through gluconeogenesis, but this is demand-driven, not supply-driven. Most people can handle the protein amounts our calculator recommends without issues.</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">Should I count total carbs or net carbs?</h4>
                      <p className="text-gray-600 text-sm">Focus on net carbs (total carbs minus fiber and sugar alcohols) as these are the carbs that affect blood sugar and ketosis. Our calculator provides net carb targets for this reason.</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">Is keto safe for everyone?</h4>
                      <p className="text-gray-600 text-sm">While generally safe for healthy individuals, those with certain medical conditions (diabetes, heart disease, eating disorders) should consult healthcare providers before starting keto.</p>
                    </div>
                  </div>
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">Why am I not losing weight on keto?</h4>
                      <p className="text-gray-600 text-sm">Common reasons include eating too many calories, hidden carbs, not being in ketosis, or needing time for adaptation. Ensure accurate macro tracking and consider adjusting calories if needed.</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">How often should I recalculate my macros?</h4>
                      <p className="text-gray-600 text-sm">Recalculate every 10-15 pounds of weight loss or if your activity level changes significantly. Your calorie and macro needs will decrease as you lose weight.</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">Can I do intermittent fasting with keto?</h4>
                      <p className="text-gray-600 text-sm">Yes, many people combine IF with keto for enhanced benefits. Start keto first, then gradually introduce fasting windows once you're fat-adapted for easier implementation.</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">What supplements do I need on keto?</h4>
                      <p className="text-gray-600 text-sm">Essential supplements include electrolytes (sodium, potassium, magnesium), especially during the adaptation phase. Consider MCT oil, omega-3s, and a quality multivitamin for optimal health.</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Keto Benefits */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
                <CardContent className="p-8">
                  <h3 className="text-xl font-bold text-gray-900 mb-6">Weight Loss Benefits</h3>
                  <div className="space-y-4 text-gray-600">
                    <p className="text-sm">
                      Keto promotes rapid initial weight loss through glycogen depletion and water loss, followed 
                      by consistent fat burning in ketosis.
                    </p>
                    <div className="space-y-2">
                      <h4 className="font-semibold text-green-800 text-sm">Key Benefits:</h4>
                      <ul className="text-xs space-y-1 list-disc list-inside text-green-700">
                        <li>Appetite suppression from ketones</li>
                        <li>Stable blood sugar levels</li>
                        <li>Increased fat oxidation</li>
                        <li>Preservation of lean muscle mass</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
                <CardContent className="p-8">
                  <h3 className="text-xl font-bold text-gray-900 mb-6">Mental Performance</h3>
                  <div className="space-y-4 text-gray-600">
                    <p className="text-sm">
                      Ketones provide a clean, efficient fuel source for the brain, often resulting in improved 
                      cognitive function and mental clarity.
                    </p>
                    <div className="space-y-2">
                      <h4 className="font-semibold text-blue-800 text-sm">Mental Benefits:</h4>
                      <ul className="text-xs space-y-1 list-disc list-inside text-blue-700">
                        <li>Enhanced focus and concentration</li>
                        <li>Stable energy without crashes</li>
                        <li>Improved memory and learning</li>
                        <li>Reduced brain fog</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
                <CardContent className="p-8">
                  <h3 className="text-xl font-bold text-gray-900 mb-6">Health Improvements</h3>
                  <div className="space-y-4 text-gray-600">
                    <p className="text-sm">
                      Research shows keto may provide therapeutic benefits for various health conditions when 
                      implemented properly under medical supervision.
                    </p>
                    <div className="space-y-2">
                      <h4 className="font-semibold text-purple-800 text-sm">Potential Benefits:</h4>
                      <ul className="text-xs space-y-1 list-disc list-inside text-purple-700">
                        <li>Improved insulin sensitivity</li>
                        <li>Better lipid profiles</li>
                        <li>Reduced inflammation markers</li>
                        <li>Enhanced metabolic flexibility</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Common Mistakes */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Common Keto Mistakes to Avoid</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-r-lg">
                      <h4 className="font-semibold text-red-800 mb-2">Not Tracking Macros Accurately</h4>
                      <p className="text-red-700 text-sm">Eyeballing portions leads to carb creep and prevents ketosis. Use a food scale and tracking app for precision, especially when starting keto.</p>
                    </div>
                    <div className="bg-orange-50 border-l-4 border-orange-400 p-4 rounded-r-lg">
                      <h4 className="font-semibold text-orange-800 mb-2">Ignoring Electrolyte Needs</h4>
                      <p className="text-orange-700 text-sm">Keto is naturally diuretic, leading to electrolyte loss. Supplement with sodium, potassium, and magnesium to prevent fatigue and cramps.</p>
                    </div>
                    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-lg">
                      <h4 className="font-semibold text-yellow-800 mb-2">Eating Too Much Protein</h4>
                      <p className="text-yellow-700 text-sm">While protein is important, excessive amounts can interfere with ketosis. Stick to moderate protein levels as calculated by our tool.</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-lg">
                      <h4 className="font-semibold text-blue-800 mb-2">Fearing Healthy Fats</h4>
                      <p className="text-blue-700 text-sm">Many people struggle to eat enough fat on keto. Embrace healthy fats like avocados, olive oil, and nuts - they're your primary fuel source.</p>
                    </div>
                    <div className="bg-purple-50 border-l-4 border-purple-400 p-4 rounded-r-lg">
                      <h4 className="font-semibold text-purple-800 mb-2">Rushing the Adaptation Process</h4>
                      <p className="text-purple-700 text-sm">Your body needs 2-4 weeks to become fully keto-adapted. Be patient and consistent rather than making frequent changes to your approach.</p>
                    </div>
                    <div className="bg-green-50 border-l-4 border-green-400 p-4 rounded-r-lg">
                      <h4 className="font-semibold text-green-800 mb-2">Relying on Processed Keto Products</h4>
                      <p className="text-green-700 text-sm">Focus on whole, nutrient-dense foods rather than packaged "keto" products that may contain hidden carbs and inflammatory ingredients.</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Keto vs Other Diets */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Keto vs Other Popular Diets</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-gray-800">Keto vs Low-Carb Diets</h4>
                    <div className="space-y-3 text-gray-600">
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-sm">Keto is more restrictive (under 50g carbs) vs low-carb (50-150g carbs)</span>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-sm">Keto specifically aims for ketosis, low-carb focuses on carb reduction</span>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-sm">Keto requires precise macro tracking, low-carb is more flexible</span>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-sm">Keto provides appetite suppression through ketones</span>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-gray-800">Keto vs Intermittent Fasting</h4>
                    <div className="space-y-3 text-gray-600">
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-sm">Keto focuses on what to eat, IF focuses on when to eat</span>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-sm">Both can be combined for enhanced benefits</span>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-sm">Keto makes IF easier due to natural appetite suppression</span>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-sm">Both promote metabolic flexibility and fat burning</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-6 p-4 bg-gradient-to-r from-purple-50 to-violet-50 rounded-lg">
                  <h4 className="font-semibold text-purple-800 mb-2">Best Choice Strategy</h4>
                  <p className="text-purple-700 text-sm">
                    Use our keto macro calculator to determine if keto aligns with your goals, lifestyle, and preferences. 
                    Consider your ability to track macros precisely, food preferences, and long-term sustainability when 
                    choosing between different dietary approaches.
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
