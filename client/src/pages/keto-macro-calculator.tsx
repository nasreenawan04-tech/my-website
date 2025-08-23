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
import { Calculator, Zap } from 'lucide-react';

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

const KetoMacroCalculator = () => {
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [feet, setFeet] = useState('');
  const [inches, setInches] = useState('');
  const [age, setAge] = useState('');
  const [unitSystem, setUnitSystem] = useState('metric');
  const [gender, setGender] = useState('');
  const [activityLevel, setActivityLevel] = useState('');
  const [ketoGoal, setKetoGoal] = useState('');
  const [ketoExperience, setKetoExperience] = useState('');
  const [bodyFatPercentage, setBodyFatPercentage] = useState('');
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
    setWeight('');
    setHeight('');
    setFeet('');
    setInches('');
    setAge('');
    setGender('');
    setActivityLevel('');
    setKetoGoal('');
    setKetoExperience('');
    setBodyFatPercentage('');
    setUnitSystem('metric');
    setResult(null);
  };

  return (
    <>
      <Helmet>
        <title>Keto Macro Calculator - Calculate Your Ketogenic Diet Macros | DapsiWow</title>
        <meta name="description" content="Calculate your personalized keto macronutrient ratios for optimal ketosis. Get precise fat, protein, and carb targets for your ketogenic diet goals." />
        <meta name="keywords" content="keto calculator, ketogenic diet calculator, keto macros, low carb calculator, ketosis calculator, keto diet planner" />
        <meta property="og:title" content="Keto Macro Calculator - Calculate Your Ketogenic Diet Macros | DapsiWow" />
        <meta property="og:description" content="Calculate your personalized ketogenic diet macronutrient ratios and get recommendations for successful ketosis." />
        <meta property="og:type" content="website" />
        <link rel="canonical" href="/tools/keto-macro-calculator" />
      </Helmet>

      <div className="min-h-screen flex flex-col" data-testid="page-keto-macro-calculator">
        <Header />
        
        <main className="flex-1 bg-neutral-50">
          {/* Hero Section */}
          <section className="text-white py-16" style={{ background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)' }}>
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <div className="w-20 h-20 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Zap className="text-3xl w-8 h-8" />
              </div>
              <h1 className="text-4xl sm:text-5xl font-bold mb-6" data-testid="text-page-title">
                Keto Macro Calculator
              </h1>
              <p className="text-xl text-violet-100 max-w-2xl mx-auto">
                Calculate your personalized ketogenic diet macronutrient ratios for optimal ketosis and results
              </p>
            </div>
          </section>

          {/* Calculator Section */}
          <section className="py-16">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
              <Card className="bg-white shadow-sm border-0">
                <CardContent className="p-8">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    {/* Input Section */}
                    <div className="space-y-6">
                      <h2 className="text-2xl font-semibold text-gray-900 mb-8">Keto Profile Information</h2>
                      
                      {/* Unit System */}
                      <div className="space-y-3">
                        <Label>Unit System</Label>
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

                      {/* Weight */}
                      <div className="space-y-3">
                        <Label htmlFor="weight" className="text-sm font-medium text-gray-700">
                          Weight {unitSystem === 'metric' ? '(kg)' : '(lbs)'} <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="weight"
                          type="number"
                          value={weight}
                          onChange={(e) => setWeight(e.target.value)}
                          className="h-12 text-base border-gray-200 rounded-lg"
                          placeholder={unitSystem === 'metric' ? "70" : "154"}
                          min="0"
                          step="0.1"
                          data-testid="input-weight"
                        />
                      </div>

                      {/* Height */}
                      <div className="space-y-3">
                        <Label className="text-sm font-medium text-gray-700">
                          Height {unitSystem === 'metric' ? '(cm)' : '(ft/in)'} <span className="text-red-500">*</span>
                        </Label>
                        {unitSystem === 'metric' ? (
                          <Input
                            type="number"
                            value={height}
                            onChange={(e) => setHeight(e.target.value)}
                            className="h-12 text-base border-gray-200 rounded-lg"
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
                                className="h-12 text-base border-gray-200 rounded-lg"
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
                                className="h-12 text-base border-gray-200 rounded-lg"
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
                        <Label htmlFor="age" className="text-sm font-medium text-gray-700">
                          Age (years) <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="age"
                          type="number"
                          value={age}
                          onChange={(e) => setAge(e.target.value)}
                          className="h-12 text-base border-gray-200 rounded-lg"
                          placeholder="30"
                          min="1"
                          max="120"
                          data-testid="input-age"
                        />
                      </div>

                      {/* Gender */}
                      <div className="space-y-3">
                        <Label className="text-sm font-medium text-gray-700">
                          Gender <span className="text-red-500">*</span>
                        </Label>
                        <Select value={gender} onValueChange={setGender}>
                          <SelectTrigger className="h-12 border-gray-200 rounded-lg" data-testid="select-gender">
                            <SelectValue placeholder="Select gender" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="male">Male</SelectItem>
                            <SelectItem value="female">Female</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Activity Level */}
                      <div className="space-y-3">
                        <Label className="text-sm font-medium text-gray-700">
                          Activity Level <span className="text-red-500">*</span>
                        </Label>
                        <Select value={activityLevel} onValueChange={setActivityLevel}>
                          <SelectTrigger className="h-12 border-gray-200 rounded-lg" data-testid="select-activity">
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

                      {/* Keto Goal */}
                      <div className="space-y-3">
                        <Label className="text-sm font-medium text-gray-700">
                          Keto Goal <span className="text-red-500">*</span>
                        </Label>
                        <Select value={ketoGoal} onValueChange={setKetoGoal}>
                          <SelectTrigger className="h-12 border-gray-200 rounded-lg" data-testid="select-keto-goal">
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
                        <Label className="text-sm font-medium text-gray-700">
                          Keto Experience
                        </Label>
                        <Select value={ketoExperience} onValueChange={setKetoExperience}>
                          <SelectTrigger className="h-12 border-gray-200 rounded-lg" data-testid="select-keto-experience">
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

                      {/* Body Fat Percentage */}
                      <div className="space-y-3">
                        <Label htmlFor="body-fat" className="text-sm font-medium text-gray-700">
                          Body Fat Percentage (optional)
                        </Label>
                        <Input
                          id="body-fat"
                          type="number"
                          value={bodyFatPercentage}
                          onChange={(e) => setBodyFatPercentage(e.target.value)}
                          className="h-12 text-base border-gray-200 rounded-lg"
                          placeholder="15"
                          min="5"
                          max="50"
                          step="0.1"
                          data-testid="input-body-fat"
                        />
                        <p className="text-xs text-gray-500">
                          Helps calculate more accurate protein needs
                        </p>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-4 pt-6">
                        <Button
                          onClick={calculateKetoMacros}
                          className="flex-1 h-12 text-white font-medium rounded-lg"
                          style={{ backgroundColor: '#8b5cf6' }}
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#7c3aed'}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#8b5cf6'}
                          data-testid="button-calculate"
                        >
                          <Calculator className="w-4 h-4 mr-2" />
                          Calculate Keto Macros
                        </Button>
                        <Button
                          onClick={resetCalculator}
                          variant="outline"
                          className="h-12 px-8 border-gray-200 text-gray-600 hover:bg-gray-50 font-medium rounded-lg"
                          data-testid="button-reset"
                        >
                          Reset
                        </Button>
                      </div>
                    </div>

                    {/* Results Section */}
                    <div className="bg-gray-50 rounded-xl p-8">
                      <h2 className="text-2xl font-semibold text-gray-900 mb-8">Keto Macro Results</h2>
                      
                      {result ? (
                        <div className="space-y-4" data-testid="keto-macro-results">
                          {/* Daily Calories */}
                          <div className="bg-white rounded-lg p-4 border-l-4 border-violet-500">
                            <div className="flex justify-between items-center">
                              <span className="font-semibold text-gray-700">Daily Calories</span>
                              <span className="text-2xl font-bold text-violet-600" data-testid="text-daily-calories">
                                {result.dailyCalories} cal
                              </span>
                            </div>
                          </div>

                          {/* Macro Breakdown */}
                          <div className="bg-violet-50 rounded-lg p-4">
                            <h3 className="font-semibold text-gray-900 mb-3">Daily Macros</h3>
                            <div className="space-y-2">
                              <div className="flex justify-between items-center">
                                <span className="text-gray-600">Fat ({result.fatPercentage}%)</span>
                                <span className="font-bold text-purple-600" data-testid="text-fat-grams">
                                  {result.totalFat}g
                                </span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-gray-600">Protein ({result.proteinPercentage}%)</span>
                                <span className="font-bold text-orange-600" data-testid="text-protein-grams">
                                  {result.totalProtein}g
                                </span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-gray-600">Total Carbs ({result.carbPercentage}%)</span>
                                <span className="font-bold text-green-600">
                                  {result.totalCarbs}g
                                </span>
                              </div>
                              <div className="flex justify-between items-center border-t pt-2">
                                <span className="text-gray-600 font-medium">Net Carbs</span>
                                <span className="font-bold text-red-600" data-testid="text-net-carbs">
                                  {result.netCarbs}g
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Per Meal Breakdown */}
                          <div className="bg-white rounded-lg p-4">
                            <h3 className="font-semibold text-gray-900 mb-3">Per Meal (3 meals)</h3>
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span>Fat per meal</span>
                                <span className="font-medium">{result.macrosByMeal.fat}g</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Protein per meal</span>
                                <span className="font-medium">{result.macrosByMeal.protein}g</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Carbs per meal</span>
                                <span className="font-medium">{result.macrosByMeal.carbs}g</span>
                              </div>
                            </div>
                          </div>

                          {/* Keto Food Sources */}
                          <div className="bg-white rounded-lg p-4">
                            <h3 className="font-semibold text-gray-900 mb-3">Keto Food Examples (daily servings)</h3>
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span>Avocado (medium)</span>
                                <span className="font-medium">{result.ketoFoods.avocado}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Butter (tbsp)</span>
                                <span className="font-medium">{result.ketoFoods.butter}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Salmon (100g)</span>
                                <span className="font-medium">{result.ketoFoods.salmon}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Eggs (large)</span>
                                <span className="font-medium">{result.ketoFoods.eggs}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Spinach (100g)</span>
                                <span className="font-medium">{result.ketoFoods.spinach}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Broccoli (100g)</span>
                                <span className="font-medium">{result.ketoFoods.broccoli}</span>
                              </div>
                            </div>
                          </div>

                          {/* Recommendations */}
                          <div className="bg-purple-50 rounded-lg p-4">
                            <h3 className="font-semibold text-gray-900 mb-3">Personalized Recommendations</h3>
                            <ul className="space-y-1 text-sm text-gray-600">
                              {result.recommendations.map((rec, index) => (
                                <li key={index} className="flex items-start">
                                  <span className="text-purple-500 mr-2">•</span>
                                  {rec}
                                </li>
                              ))}
                            </ul>
                          </div>

                          {/* Keto Tips */}
                          <div className="bg-blue-50 rounded-lg p-4">
                            <h3 className="font-semibold text-gray-900 mb-3">Keto Success Tips</h3>
                            <ul className="space-y-1 text-sm text-gray-600">
                              {result.tips.map((tip, index) => (
                                <li key={index} className="flex items-start">
                                  <span className="text-blue-500 mr-2">•</span>
                                  {tip}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-8" data-testid="no-results">
                          <Zap className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                          <p className="text-gray-500">Enter your information to calculate keto macros</p>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Educational Content */}
              <div className="mt-12 space-y-8">
                {/* Understanding Keto */}
                <div className="bg-white rounded-2xl shadow-lg p-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-8">Understanding the Ketogenic Diet</h2>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-4">What is Ketosis?</h3>
                      <p className="text-gray-600 mb-6 leading-relaxed">
                        Ketosis is a metabolic state where your body burns fat for fuel instead of carbohydrates. 
                        By severely limiting carbs (typically under 20-50g per day), your liver produces ketones 
                        from fat, which become your primary energy source.
                      </p>
                      
                      <h3 className="text-xl font-semibold text-gray-900 mb-4">Keto Macro Ratios</h3>
                      <ul className="text-gray-600 space-y-2 text-sm">
                        <li>• 70-75% of calories from fat</li>
                        <li>• 20-25% of calories from protein</li>
                        <li>• 5-10% of calories from carbohydrates</li>
                        <li>• Focus on net carbs (total carbs - fiber)</li>
                        <li>• Quality of macronutrients matters</li>
                      </ul>
                    </div>
                    
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-4">Benefits of Ketosis</h3>
                      <div className="space-y-3">
                        <div className="flex items-center p-3 bg-purple-50 rounded-lg">
                          <div className="w-4 h-4 bg-purple-500 rounded-full mr-3"></div>
                          <div>
                            <div className="font-medium">Weight Loss</div>
                            <div className="text-sm text-gray-600">Efficient fat burning and appetite control</div>
                          </div>
                        </div>
                        
                        <div className="flex items-center p-3 bg-blue-50 rounded-lg">
                          <div className="w-4 h-4 bg-blue-500 rounded-full mr-3"></div>
                          <div>
                            <div className="font-medium">Mental Clarity</div>
                            <div className="text-sm text-gray-600">Stable energy and improved focus</div>
                          </div>
                        </div>
                        
                        <div className="flex items-center p-3 bg-green-50 rounded-lg">
                          <div className="w-4 h-4 bg-green-500 rounded-full mr-3"></div>
                          <div>
                            <div className="font-medium">Blood Sugar Control</div>
                            <div className="text-sm text-gray-600">Improved insulin sensitivity</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Tips and Guidelines */}
                <div className="bg-gradient-to-r from-violet-50 to-purple-50 rounded-2xl p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Keto Success Strategies</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Getting Started</h3>
                      <ul className="text-gray-600 space-y-2 text-sm">
                        <li>• Clear out high-carb foods from your home</li>
                        <li>• Stock up on keto-friendly foods</li>
                        <li>• Plan your first week of meals</li>
                        <li>• Increase electrolyte intake (sodium, potassium, magnesium)</li>
                        <li>• Track your macros accurately using a food diary</li>
                      </ul>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Staying in Ketosis</h3>
                      <ul className="text-gray-600 space-y-2 text-sm">
                        <li>• Keep net carbs under your calculated limit</li>
                        <li>• Don't fear healthy fats - they're your primary fuel</li>
                        <li>• Eat adequate protein to preserve muscle mass</li>
                        <li>• Test ketone levels regularly</li>
                        <li>• Be patient - full adaptation takes 2-4 weeks</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </main>
        
        <Footer />
      </div>
    </>
  );
};

export default KetoMacroCalculator;