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
import { Calculator, Apple } from 'lucide-react';

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
    <>
      <Helmet>
        <title>Carb Calculator - Calculate Your Daily Carbohydrate Needs | DapsiWow</title>
        <meta name="description" content="Calculate your daily carbohydrate intake needs based on your goals, activity level, and diet type. Get personalized carb recommendations for optimal energy and performance." />
        <meta name="keywords" content="carb calculator, carbohydrate calculator, daily carb needs, carb intake, carbohydrate requirements, diet carbs" />
        <meta property="og:title" content="Carb Calculator - Calculate Your Daily Carbohydrate Needs | DapsiWow" />
        <meta property="og:description" content="Calculate your personalized daily carbohydrate requirements and get recommendations based on your fitness goals and lifestyle." />
        <meta property="og:type" content="website" />
        <link rel="canonical" href="/tools/carb-calculator" />
      </Helmet>

      <div className="min-h-screen flex flex-col" data-testid="page-carb-calculator">
        <Header />
        
        <main className="flex-1 bg-neutral-50">
          {/* Hero Section */}
          <section className="text-white py-16" style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}>
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <div className="w-20 h-20 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Apple className="text-3xl w-8 h-8" />
              </div>
              <h1 className="text-4xl sm:text-5xl font-bold mb-6" data-testid="text-page-title">
                Carb Calculator
              </h1>
              <p className="text-xl text-emerald-100 max-w-2xl mx-auto">
                Calculate your daily carbohydrate needs based on your goals, activity level, and dietary preferences
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
                      <h2 className="text-2xl font-semibold text-gray-900 mb-8">Personal Information</h2>
                      
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

                      {/* Goal */}
                      <div className="space-y-3">
                        <Label className="text-sm font-medium text-gray-700">
                          Primary Goal <span className="text-red-500">*</span>
                        </Label>
                        <Select value={goal} onValueChange={setGoal}>
                          <SelectTrigger className="h-12 border-gray-200 rounded-lg" data-testid="select-goal">
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
                        <Label className="text-sm font-medium text-gray-700">
                          Diet Preference
                        </Label>
                        <Select value={dietType} onValueChange={setDietType}>
                          <SelectTrigger className="h-12 border-gray-200 rounded-lg" data-testid="select-diet">
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
                        <Label className="text-sm font-medium text-gray-700">
                          Health Conditions
                        </Label>
                        <Select value={healthConditions} onValueChange={setHealthConditions}>
                          <SelectTrigger className="h-12 border-gray-200 rounded-lg" data-testid="select-health">
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

                      {/* Action Buttons */}
                      <div className="flex gap-4 pt-6">
                        <Button
                          onClick={calculateCarbIntake}
                          className="flex-1 h-12 text-white font-medium rounded-lg"
                          style={{ backgroundColor: '#10b981' }}
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#059669'}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#10b981'}
                          data-testid="button-calculate"
                        >
                          <Calculator className="w-4 h-4 mr-2" />
                          Calculate Carb Intake
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
                      <h2 className="text-2xl font-semibold text-gray-900 mb-8">Carb Intake Results</h2>
                      
                      {result ? (
                        <div className="space-y-4" data-testid="carb-intake-results">
                          {/* Daily Carb Intake */}
                          <div className="bg-white rounded-lg p-4 border-l-4 border-emerald-500">
                            <div className="flex justify-between items-center">
                              <span className="font-semibold text-gray-700">Daily Carb Intake</span>
                              <span className="text-2xl font-bold text-emerald-600" data-testid="text-daily-carbs">
                                {result.dailyCarbIntake}g
                              </span>
                            </div>
                          </div>

                          {/* Carb Distribution */}
                          <div className="bg-emerald-50 rounded-lg p-4">
                            <h3 className="font-semibold text-gray-900 mb-3">Carb Distribution</h3>
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span>Per meal (3 meals)</span>
                                <span className="font-medium" data-testid="text-carbs-per-meal">
                                  ~{result.carbsPerMeal}g
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span>Calories from carbs</span>
                                <span className="font-medium">{result.carbCalories} cal</span>
                              </div>
                              <div className="flex justify-between">
                                <span>% of total calories</span>
                                <span className="font-medium">{result.percentageOfCalories}%</span>
                              </div>
                            </div>
                          </div>

                          {/* Food Sources */}
                          <div className="bg-white rounded-lg p-4">
                            <h3 className="font-semibold text-gray-900 mb-3">Food Sources (to meet daily needs)</h3>
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span>White rice (cooked)</span>
                                <span className="font-medium">{result.carbSources.rice}g</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Whole grain bread</span>
                                <span className="font-medium">{result.carbSources.bread}g</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Pasta (cooked)</span>
                                <span className="font-medium">{result.carbSources.pasta}g</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Oats (dry)</span>
                                <span className="font-medium">{result.carbSources.oats}g</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Bananas</span>
                                <span className="font-medium">{result.carbSources.banana} medium</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Potato (baked)</span>
                                <span className="font-medium">{result.carbSources.potato}g</span>
                              </div>
                            </div>
                          </div>

                          {/* Carb Timing */}
                          <div className="bg-blue-50 rounded-lg p-4">
                            <h3 className="font-semibold text-gray-900 mb-3">Carb Timing</h3>
                            <ul className="space-y-1 text-sm text-gray-600">
                              {result.timing.map((tip, index) => (
                                <li key={index} className="flex items-start">
                                  <span className="text-blue-500 mr-2">•</span>
                                  {tip}
                                </li>
                              ))}
                            </ul>
                          </div>

                          {/* Recommendations */}
                          <div className="bg-green-50 rounded-lg p-4">
                            <h3 className="font-semibold text-gray-900 mb-3">Recommendations</h3>
                            <ul className="space-y-1 text-sm text-gray-600">
                              {result.recommendations.map((rec, index) => (
                                <li key={index} className="flex items-start">
                                  <span className="text-green-500 mr-2">•</span>
                                  {rec}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-8" data-testid="no-results">
                          <Apple className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                          <p className="text-gray-500">Enter your information to calculate daily carb intake</p>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Educational Content */}
              <div className="mt-12 space-y-8">
                {/* Understanding Carbohydrates */}
                <div className="bg-white rounded-2xl shadow-lg p-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-8">Understanding Carbohydrates</h2>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-4">Why Carbs Matter</h3>
                      <p className="text-gray-600 mb-6 leading-relaxed">
                        Carbohydrates are your body's primary energy source, especially for the brain and muscles during exercise. 
                        They break down into glucose, which fuels cellular activities and maintains blood sugar levels. The key is 
                        choosing the right types and amounts for your goals.
                      </p>
                      
                      <h3 className="text-xl font-semibold text-gray-900 mb-4">Factors Affecting Carb Needs</h3>
                      <ul className="text-gray-600 space-y-2 text-sm">
                        <li>• Activity level and exercise intensity</li>
                        <li>• Body composition and metabolism</li>
                        <li>• Health goals (weight loss, muscle gain, performance)</li>
                        <li>• Medical conditions (diabetes, insulin resistance)</li>
                        <li>• Dietary preferences and restrictions</li>
                      </ul>
                    </div>
                    
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-4">Types of Carbohydrates</h3>
                      <div className="space-y-3">
                        <div className="flex items-center p-3 bg-green-50 rounded-lg">
                          <div className="w-4 h-4 bg-green-500 rounded-full mr-3"></div>
                          <div>
                            <div className="font-medium">Complex Carbs</div>
                            <div className="text-sm text-gray-600">Whole grains, vegetables, legumes</div>
                          </div>
                        </div>
                        
                        <div className="flex items-center p-3 bg-yellow-50 rounded-lg">
                          <div className="w-4 h-4 bg-yellow-500 rounded-full mr-3"></div>
                          <div>
                            <div className="font-medium">Simple Carbs</div>
                            <div className="text-sm text-gray-600">Fruits, dairy, refined sugars</div>
                          </div>
                        </div>
                        
                        <div className="flex items-center p-3 bg-blue-50 rounded-lg">
                          <div className="w-4 h-4 bg-blue-500 rounded-full mr-3"></div>
                          <div>
                            <div className="font-medium">Fiber</div>
                            <div className="text-sm text-gray-600">Non-digestible carbs that aid health</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Tips and Guidelines */}
                <div className="bg-gradient-to-r from-emerald-50 to-green-50 rounded-2xl p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Carb Optimization Tips</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Smart Carb Choices</h3>
                      <ul className="text-gray-600 space-y-2 text-sm">
                        <li>• Choose whole grains over refined grains</li>
                        <li>• Include plenty of vegetables and fruits</li>
                        <li>• Combine carbs with protein and healthy fats</li>
                        <li>• Consider glycemic index for blood sugar control</li>
                        <li>• Stay consistent with portion sizes</li>
                      </ul>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Timing Strategies</h3>
                      <ul className="text-gray-600 space-y-2 text-sm">
                        <li>• Eat carbs before workouts for energy</li>
                        <li>• Include carbs post-workout for recovery</li>
                        <li>• Spread intake evenly throughout the day</li>
                        <li>• Consider carb cycling for specific goals</li>
                        <li>• Adjust based on activity and hunger cues</li>
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

export default CarbCalculator;