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
import { Calculator } from 'lucide-react';

interface CalorieResult {
  bmr: number;
  tdee: number;
  goalCalories: number;
  macros: {
    protein: { grams: number; calories: number };
    carbs: { grams: number; calories: number };
    fat: { grams: number; calories: number };
  };
  weeklyWeightChange: number;
}

const CalorieCalculator = () => {
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [feet, setFeet] = useState('');
  const [inches, setInches] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [unitSystem, setUnitSystem] = useState('metric');
  const [activityLevel, setActivityLevel] = useState('');
  const [goal, setGoal] = useState('');
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

    if (weightKg && heightCm && ageYears && gender && activityLevel && goal) {
      // Calculate BMR using Mifflin-St Jeor Equation
      let bmr: number;
      if (gender === 'male') {
        bmr = 10 * weightKg + 6.25 * heightCm - 5 * ageYears + 5;
      } else {
        bmr = 10 * weightKg + 6.25 * heightCm - 5 * ageYears - 161;
      }

      // Activity multipliers
      const activityMultipliers = {
        sedentary: 1.2,
        lightlyActive: 1.375,
        moderatelyActive: 1.55,
        veryActive: 1.725,
        extraActive: 1.9
      };

      const tdee = bmr * activityMultipliers[activityLevel as keyof typeof activityMultipliers];

      // Goal adjustments
      let goalCalories: number;
      let weeklyWeightChange: number;

      switch (goal) {
        case 'lose2':
          goalCalories = tdee - 1000; // 2 lbs/week
          weeklyWeightChange = -2;
          break;
        case 'lose1':
          goalCalories = tdee - 500; // 1 lb/week
          weeklyWeightChange = -1;
          break;
        case 'lose0.5':
          goalCalories = tdee - 250; // 0.5 lbs/week
          weeklyWeightChange = -0.5;
          break;
        case 'maintain':
          goalCalories = tdee;
          weeklyWeightChange = 0;
          break;
        case 'gain0.5':
          goalCalories = tdee + 250; // 0.5 lbs/week
          weeklyWeightChange = 0.5;
          break;
        case 'gain1':
          goalCalories = tdee + 500; // 1 lb/week
          weeklyWeightChange = 1;
          break;
        default:
          goalCalories = tdee;
          weeklyWeightChange = 0;
      }

      // Calculate macros (protein: 25%, carbs: 45%, fat: 30%)
      const proteinCalories = goalCalories * 0.25;
      const carbsCalories = goalCalories * 0.45;
      const fatCalories = goalCalories * 0.30;

      const macros = {
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
        goalCalories: Math.round(goalCalories),
        macros,
        weeklyWeightChange
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
    setGoal('');
    setUnitSystem('metric');
    setResult(null);
  };

  const getGoalDescription = (goalValue: string) => {
    const descriptions = {
      'lose2': 'Aggressive Weight Loss (2 lbs/week)',
      'lose1': 'Moderate Weight Loss (1 lb/week)',
      'lose0.5': 'Mild Weight Loss (0.5 lbs/week)',
      'maintain': 'Maintain Current Weight',
      'gain0.5': 'Mild Weight Gain (0.5 lbs/week)',
      'gain1': 'Moderate Weight Gain (1 lb/week)'
    };
    return descriptions[goalValue as keyof typeof descriptions] || '';
  };

  return (
    <>
      <Helmet>
        <title>Calorie Calculator - Daily Calorie Needs & Macros | DapsiWow</title>
        <meta name="description" content="Calculate your daily calorie needs and macronutrient breakdown. Get personalized calorie targets for weight loss, maintenance, or muscle gain." />
        <meta name="keywords" content="calorie calculator, daily calorie needs, macro calculator, TDEE calculator, weight loss calories, nutrition calculator" />
        <meta property="og:title" content="Calorie Calculator - Daily Calorie Needs & Macros | DapsiWow" />
        <meta property="og:description" content="Calculate your daily calorie needs and macronutrient breakdown for optimal nutrition and fitness goals." />
        <meta property="og:type" content="website" />
        <link rel="canonical" href="/tools/calorie-calculator" />
      </Helmet>

      <div className="min-h-screen flex flex-col" data-testid="page-calorie-calculator">
        <Header />
        
        <main className="flex-1 bg-neutral-50">
          {/* Hero Section */}
          <section className="text-white py-16" style={{ background: 'linear-gradient(135deg, #f43f5e 0%, #e11d48 100%)' }}>
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <div className="w-20 h-20 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <i className="fas fa-utensils text-3xl"></i>
              </div>
              <h1 className="text-4xl sm:text-5xl font-bold mb-6" data-testid="text-page-title">
                Calorie Calculator
              </h1>
              <p className="text-xl text-red-100 max-w-2xl mx-auto">
                Calculate your daily calorie needs and macronutrient breakdown for achieving your fitness and health goals
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

                      {/* Gender */}
                      <div className="space-y-3">
                        <Label className="text-sm font-medium text-gray-700">
                          Gender *
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

                      {/* Age */}
                      <div className="space-y-3">
                        <Label htmlFor="age" className="text-sm font-medium text-gray-700">
                          Age (years) *
                        </Label>
                        <Input
                          id="age"
                          type="number"
                          value={age}
                          onChange={(e) => setAge(e.target.value)}
                          className="h-12 text-base border-gray-200 rounded-lg"
                          placeholder="30"
                          min="15"
                          max="120"
                          data-testid="input-age"
                        />
                      </div>

                      {/* Weight */}
                      <div className="space-y-3">
                        <Label htmlFor="weight" className="text-sm font-medium text-gray-700">
                          Weight {unitSystem === 'metric' ? '(kg)' : '(lbs)'} *
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
                          Height {unitSystem === 'metric' ? '(cm)' : '(ft/in)'} *
                        </Label>
                        {unitSystem === 'metric' ? (
                          <Input
                            type="number"
                            value={height}
                            onChange={(e) => setHeight(e.target.value)}
                            className="h-12 text-base border-gray-200 rounded-lg"
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
                                className="h-12 text-base border-gray-200 rounded-lg"
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

                      {/* Activity Level */}
                      <div className="space-y-3">
                        <Label className="text-sm font-medium text-gray-700">
                          Activity Level *
                        </Label>
                        <Select value={activityLevel} onValueChange={setActivityLevel}>
                          <SelectTrigger className="h-12 border-gray-200 rounded-lg" data-testid="select-activity">
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
                        <Label className="text-sm font-medium text-gray-700">
                          Goal *
                        </Label>
                        <Select value={goal} onValueChange={setGoal}>
                          <SelectTrigger className="h-12 border-gray-200 rounded-lg" data-testid="select-goal">
                            <SelectValue placeholder="Select your goal" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="lose2">Aggressive Weight Loss (2 lbs/week)</SelectItem>
                            <SelectItem value="lose1">Moderate Weight Loss (1 lb/week)</SelectItem>
                            <SelectItem value="lose0.5">Mild Weight Loss (0.5 lbs/week)</SelectItem>
                            <SelectItem value="maintain">Maintain Current Weight</SelectItem>
                            <SelectItem value="gain0.5">Mild Weight Gain (0.5 lbs/week)</SelectItem>
                            <SelectItem value="gain1">Moderate Weight Gain (1 lb/week)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-4 pt-6">
                        <Button
                          onClick={calculateCalories}
                          className="flex-1 h-12 text-white font-medium rounded-lg"
                          style={{ backgroundColor: '#f43f5e' }}
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#e11d48'}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#f43f5e'}
                          data-testid="button-calculate"
                        >
                          <Calculator className="w-4 h-4 mr-2" />
                          Calculate Calories
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
                      <h2 className="text-2xl font-semibold text-gray-900 mb-8">Calorie Results</h2>
                      
                      {result ? (
                        <div className="space-y-4" data-testid="calorie-results">
                          {/* Daily Calorie Goal */}
                          <div className="bg-white rounded-lg p-4 border-l-4 border-rose-500">
                            <div className="flex justify-between items-center">
                              <span className="font-semibold text-gray-700">Daily Calorie Goal</span>
                              <span className="text-2xl font-bold text-rose-600" data-testid="text-goal-calories">
                                {result.goalCalories} cal/day
                              </span>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                              {result.weeklyWeightChange > 0 
                                ? `+${result.weeklyWeightChange} lbs/week gain`
                                : result.weeklyWeightChange < 0 
                                ? `${Math.abs(result.weeklyWeightChange)} lbs/week loss`
                                : 'Maintain current weight'
                              }
                            </p>
                          </div>

                          {/* BMR and TDEE */}
                          <div className="bg-white rounded-lg p-4">
                            <h3 className="font-semibold text-gray-900 mb-3">Metabolic Information</h3>
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span className="text-gray-600">Basal Metabolic Rate (BMR)</span>
                                <span className="font-medium" data-testid="text-bmr">
                                  {result.bmr} cal/day
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Total Daily Energy Expenditure (TDEE)</span>
                                <span className="font-medium" data-testid="text-tdee">
                                  {result.tdee} cal/day
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Macronutrient Breakdown */}
                          <div className="bg-white rounded-lg p-4">
                            <h3 className="font-semibold text-gray-900 mb-3">Macronutrient Breakdown</h3>
                            <div className="space-y-3">
                              <div className="bg-blue-50 rounded-lg p-3">
                                <div className="flex justify-between items-center">
                                  <span className="text-blue-800 font-medium">Protein (25%)</span>
                                  <span className="text-blue-800 font-bold" data-testid="text-protein">
                                    {result.macros.protein.grams}g / {result.macros.protein.calories} cal
                                  </span>
                                </div>
                              </div>
                              <div className="bg-green-50 rounded-lg p-3">
                                <div className="flex justify-between items-center">
                                  <span className="text-green-800 font-medium">Carbs (45%)</span>
                                  <span className="text-green-800 font-bold" data-testid="text-carbs">
                                    {result.macros.carbs.grams}g / {result.macros.carbs.calories} cal
                                  </span>
                                </div>
                              </div>
                              <div className="bg-orange-50 rounded-lg p-3">
                                <div className="flex justify-between items-center">
                                  <span className="text-orange-800 font-medium">Fat (30%)</span>
                                  <span className="text-orange-800 font-bold" data-testid="text-fat">
                                    {result.macros.fat.grams}g / {result.macros.fat.calories} cal
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Tips */}
                          <div className="bg-blue-50 rounded-lg p-4">
                            <h3 className="font-semibold text-gray-900 mb-2">Nutrition Tips</h3>
                            <ul className="text-sm text-gray-600 space-y-1">
                              <li>• Track your food intake for better accuracy</li>
                              <li>• Adjust portions based on your progress</li>
                              <li>• Stay hydrated and eat whole foods</li>
                              <li>• Consider consulting a nutritionist for personalized advice</li>
                            </ul>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-8" data-testid="no-results">
                          <i className="fas fa-utensils text-4xl text-gray-400 mb-4"></i>
                          <p className="text-gray-500">Enter your information to calculate daily calorie needs</p>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Educational Content */}
              <div className="mt-12 space-y-8">
                {/* What is Calorie Calculator Section */}
                <div className="bg-white rounded-2xl shadow-lg p-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">What is a Calorie Calculator?</h2>
                  <div className="max-w-4xl mx-auto">
                    <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                      A calorie calculator is an essential health and fitness tool that determines your daily caloric needs 
                      based on your personal characteristics including age, gender, weight, height, and activity level. Our 
                      comprehensive daily calorie calculator uses scientifically proven formulas like the Mifflin-St Jeor 
                      equation to calculate your Basal Metabolic Rate (BMR) and Total Daily Energy Expenditure (TDEE), 
                      providing accurate calorie targets for weight loss, weight gain, or weight maintenance goals.
                    </p>
                    <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                      This powerful nutrition calculator not only determines your calorie needs but also provides a detailed 
                      macronutrient breakdown including protein, carbohydrates, and fat requirements. Whether you're planning 
                      a diet for weight loss, muscle gain, or maintaining a healthy lifestyle, our calorie counter helps you 
                      make informed decisions about your nutrition and fitness journey with personalized recommendations 
                      tailored to your specific goals and lifestyle.
                    </p>
                  </div>
                </div>

                {/* How to Use Calorie Calculator */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">How to Use the Calorie Calculator</h2>
                  <div className="max-w-4xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-6">
                        <div className="flex items-start space-x-4">
                          <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm">1</div>
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Enter Personal Information</h3>
                            <p className="text-gray-600 text-sm">
                              Input your age, gender, weight, and height. Choose between metric (kg, cm) or imperial (lbs, ft/in) units for convenience.
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-start space-x-4">
                          <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm">2</div>
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Select Activity Level</h3>
                            <p className="text-gray-600 text-sm">
                              Choose your activity level from sedentary to extra active based on your weekly exercise routine and daily movement.
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-start space-x-4">
                          <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm">3</div>
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Define Your Goal</h3>
                            <p className="text-gray-600 text-sm">
                              Select whether you want to lose weight, maintain current weight, or gain weight, along with your preferred rate of change.
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-6">
                        <div className="flex items-start space-x-4">
                          <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm">4</div>
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Get Your Results</h3>
                            <p className="text-gray-600 text-sm">
                              Receive your personalized daily calorie target, BMR, TDEE, and detailed macronutrient breakdown for optimal nutrition.
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-start space-x-4">
                          <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm">5</div>
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Track and Adjust</h3>
                            <p className="text-gray-600 text-sm">
                              Use the results to plan your meals and monitor your progress, adjusting as needed based on your body's response.
                            </p>
                          </div>
                        </div>
                        
                        <div className="bg-white rounded-lg p-4 border border-blue-200">
                          <h4 className="font-semibold text-gray-900 mb-2">💡 Pro Tip</h4>
                          <p className="text-gray-600 text-sm">
                            Recalculate your calories every 10-15 pounds of weight change for the most accurate results.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Use Cases */}
                <div className="bg-white rounded-2xl shadow-lg p-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">When to Use a Calorie Calculator</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="bg-red-50 rounded-lg p-6 border border-red-100">
                      <i className="fas fa-weight text-2xl text-red-600 mb-4"></i>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Weight Loss Journey</h3>
                      <p className="text-gray-600 text-sm mb-4">
                        Create a sustainable caloric deficit to lose weight safely and effectively while maintaining muscle mass and energy levels.
                      </p>
                      <ul className="text-gray-600 text-xs space-y-1">
                        <li>• Planning a weight loss diet</li>
                        <li>• Setting realistic weight loss goals</li>
                        <li>• Avoiding extreme calorie restriction</li>
                      </ul>
                    </div>
                    
                    <div className="bg-green-50 rounded-lg p-6 border border-green-100">
                      <i className="fas fa-dumbbell text-2xl text-green-600 mb-4"></i>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Muscle Building</h3>
                      <p className="text-gray-600 text-sm mb-4">
                        Determine the right caloric surplus and protein intake needed to support muscle growth and strength training goals.
                      </p>
                      <ul className="text-gray-600 text-xs space-y-1">
                        <li>• Bulking phase planning</li>
                        <li>• Optimizing protein intake</li>
                        <li>• Supporting workout recovery</li>
                      </ul>
                    </div>
                    
                    <div className="bg-blue-50 rounded-lg p-6 border border-blue-100">
                      <i className="fas fa-balance-scale text-2xl text-blue-600 mb-4"></i>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Weight Maintenance</h3>
                      <p className="text-gray-600 text-sm mb-4">
                        Maintain your current weight by eating the right amount of calories to match your daily energy expenditure.
                      </p>
                      <ul className="text-gray-600 text-xs space-y-1">
                        <li>• Preventing weight regain</li>
                        <li>• Establishing healthy habits</li>
                        <li>• Long-term weight management</li>
                      </ul>
                    </div>
                    
                    <div className="bg-purple-50 rounded-lg p-6 border border-purple-100">
                      <i className="fas fa-heartbeat text-2xl text-purple-600 mb-4"></i>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Health Improvement</h3>
                      <p className="text-gray-600 text-sm mb-4">
                        Support overall health goals including managing diabetes, heart disease, or metabolic syndrome through proper nutrition.
                      </p>
                      <ul className="text-gray-600 text-xs space-y-1">
                        <li>• Managing chronic conditions</li>
                        <li>• Improving metabolic health</li>
                        <li>• Supporting medical treatment</li>
                      </ul>
                    </div>
                    
                    <div className="bg-orange-50 rounded-lg p-6 border border-orange-100">
                      <i className="fas fa-running text-2xl text-orange-600 mb-4"></i>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Athletic Performance</h3>
                      <p className="text-gray-600 text-sm mb-4">
                        Optimize nutrition for athletic performance, endurance training, and competitive sports activities.
                      </p>
                      <ul className="text-gray-600 text-xs space-y-1">
                        <li>• Fueling training sessions</li>
                        <li>• Competition preparation</li>
                        <li>• Recovery optimization</li>
                      </ul>
                    </div>
                    
                    <div className="bg-yellow-50 rounded-lg p-6 border border-yellow-100">
                      <i className="fas fa-seedling text-2xl text-yellow-600 mb-4"></i>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Lifestyle Changes</h3>
                      <p className="text-gray-600 text-sm mb-4">
                        Adapt your nutrition when starting new exercise routines, changing jobs, or experiencing life transitions.
                      </p>
                      <ul className="text-gray-600 text-xs space-y-1">
                        <li>• Starting a fitness program</li>
                        <li>• Career changes affecting activity</li>
                        <li>• Age-related metabolism changes</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Understanding Calories */}
                <div className="bg-white rounded-2xl shadow-lg p-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-8">Understanding Calories & Nutrition Science</h2>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-4">What are Calories?</h3>
                      <p className="text-gray-600 mb-6 leading-relaxed">
                        A calorie is a unit of energy that measures how much energy food provides to your body. 
                        Your body needs a certain number of calories each day to function properly, including 
                        breathing, digestion, circulation, cellular repair, and physical activity. Understanding 
                        calorie balance is fundamental to achieving any health or fitness goal.
                      </p>
                      
                      <h3 className="text-xl font-semibold text-gray-900 mb-4">BMR vs TDEE</h3>
                      <div className="bg-blue-50 rounded-lg p-4 mb-4">
                        <div className="space-y-2 text-sm">
                          <div><strong className="text-blue-800">BMR (Basal Metabolic Rate):</strong> <span className="text-gray-700">Calories needed for basic bodily functions at rest</span></div>
                          <div><strong className="text-blue-800">TDEE (Total Daily Energy Expenditure):</strong> <span className="text-gray-700">BMR plus calories burned through activity and exercise</span></div>
                        </div>
                      </div>
                      
                      <h3 className="text-xl font-semibold text-gray-900 mb-4">Weight Management Principles</h3>
                      <div className="bg-rose-50 rounded-lg p-4 mb-4">
                        <ul className="text-rose-800 text-sm space-y-1">
                          <li><strong>Weight Loss:</strong> Create a caloric deficit (eat fewer calories than you burn)</li>
                          <li><strong>Weight Maintenance:</strong> Energy balance (calories in = calories out)</li>
                          <li><strong>Weight Gain:</strong> Create a caloric surplus (eat more calories than you burn)</li>
                        </ul>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-4">Macronutrients Explained</h3>
                      <div className="space-y-3">
                        <div className="flex items-center p-3 bg-blue-50 rounded-lg">
                          <div className="w-4 h-4 bg-blue-500 rounded-full mr-3"></div>
                          <div>
                            <div className="font-medium">Protein (4 calories per gram)</div>
                            <div className="text-sm text-gray-600">Builds and repairs tissues, supports immune function, preserves muscle mass</div>
                          </div>
                        </div>
                        
                        <div className="flex items-center p-3 bg-green-50 rounded-lg">
                          <div className="w-4 h-4 bg-green-500 rounded-full mr-3"></div>
                          <div>
                            <div className="font-medium">Carbohydrates (4 calories per gram)</div>
                            <div className="text-sm text-gray-600">Primary energy source for brain and muscles, fuels physical activity</div>
                          </div>
                        </div>
                        
                        <div className="flex items-center p-3 bg-orange-50 rounded-lg">
                          <div className="w-4 h-4 bg-orange-500 rounded-full mr-3"></div>
                          <div>
                            <div className="font-medium">Fat (9 calories per gram)</div>
                            <div className="text-sm text-gray-600">Essential for hormone production, nutrient absorption, and cell structure</div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-gray-50 rounded-lg p-4 mt-6">
                        <h4 className="font-semibold text-gray-900 mb-2">Recommended Macro Ratios</h4>
                        <div className="text-sm text-gray-600 space-y-1">
                          <div>• <strong>General Health:</strong> 45-65% carbs, 20-35% fat, 10-35% protein</div>
                          <div>• <strong>Weight Loss:</strong> 40% carbs, 30% fat, 30% protein</div>
                          <div>• <strong>Muscle Building:</strong> 40% carbs, 25% fat, 35% protein</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Factors Affecting Calorie Needs */}
                <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl p-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Factors That Affect Your Calorie Needs</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="bg-white rounded-lg p-6 shadow-sm">
                      <i className="fas fa-birthday-cake text-2xl text-indigo-600 mb-4"></i>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Age</h3>
                      <p className="text-gray-600 text-sm">
                        Metabolism generally slows with age due to muscle mass loss and hormonal changes. 
                        Calorie needs typically decrease by 1-2% per decade after age 30.
                      </p>
                    </div>
                    
                    <div className="bg-white rounded-lg p-6 shadow-sm">
                      <i className="fas fa-venus-mars text-2xl text-pink-600 mb-4"></i>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Gender</h3>
                      <p className="text-gray-600 text-sm">
                        Men typically have higher calorie needs due to greater muscle mass and larger body size. 
                        Hormonal differences also affect metabolism and energy expenditure.
                      </p>
                    </div>
                    
                    <div className="bg-white rounded-lg p-6 shadow-sm">
                      <i className="fas fa-weight text-2xl text-blue-600 mb-4"></i>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Body Composition</h3>
                      <p className="text-gray-600 text-sm">
                        Muscle tissue burns more calories at rest than fat tissue. 
                        Higher muscle mass increases your metabolic rate and calorie needs.
                      </p>
                    </div>
                    
                    <div className="bg-white rounded-lg p-6 shadow-sm">
                      <i className="fas fa-thermometer-half text-2xl text-red-600 mb-4"></i>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Genetics</h3>
                      <p className="text-gray-600 text-sm">
                        Some people naturally have faster or slower metabolisms. 
                        Genetic factors can influence how efficiently your body uses energy.
                      </p>
                    </div>
                    
                    <div className="bg-white rounded-lg p-6 shadow-sm">
                      <i className="fas fa-pills text-2xl text-green-600 mb-4"></i>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Health Conditions</h3>
                      <p className="text-gray-600 text-sm">
                        Thyroid disorders, PCOS, diabetes, and certain medications can significantly 
                        affect metabolism and calorie requirements.
                      </p>
                    </div>
                    
                    <div className="bg-white rounded-lg p-6 shadow-sm">
                      <i className="fas fa-bed text-2xl text-purple-600 mb-4"></i>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Sleep Quality</h3>
                      <p className="text-gray-600 text-sm">
                        Poor sleep affects hormones that regulate hunger and metabolism. 
                        Lack of sleep can increase appetite and reduce metabolic efficiency.
                      </p>
                    </div>
                    
                    <div className="bg-white rounded-lg p-6 shadow-sm">
                      <i className="fas fa-fire text-2xl text-orange-600 mb-4"></i>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Activity Level</h3>
                      <p className="text-gray-600 text-sm">
                        Both structured exercise and daily activities (NEAT) significantly impact 
                        calorie needs. Active individuals require substantially more calories.
                      </p>
                    </div>
                    
                    <div className="bg-white rounded-lg p-6 shadow-sm">
                      <i className="fas fa-utensils text-2xl text-yellow-600 mb-4"></i>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Diet History</h3>
                      <p className="text-gray-600 text-sm">
                        Previous dieting history can affect metabolic rate. 
                        Extreme calorie restriction may lead to adaptive metabolic slowdown.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Nutrition Tips */}
                <div className="bg-gradient-to-r from-rose-50 to-pink-50 rounded-2xl p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Evidence-Based Nutrition Guidelines</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="bg-white rounded-lg p-6 shadow-sm">
                      <i className="fas fa-apple-alt text-2xl text-green-600 mb-4"></i>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Prioritize Whole Foods</h3>
                      <p className="text-gray-600 text-sm">
                        Focus on nutrient-dense, minimally processed foods like fruits, vegetables, lean proteins, 
                        whole grains, nuts, and legumes for optimal nutrition and satiety.
                      </p>
                    </div>
                    
                    <div className="bg-white rounded-lg p-6 shadow-sm">
                      <i className="fas fa-tint text-2xl text-blue-600 mb-4"></i>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Stay Properly Hydrated</h3>
                      <p className="text-gray-600 text-sm">
                        Drink water throughout the day. Aim for clear, pale yellow urine as a hydration indicator. 
                        Sometimes thirst is mistaken for hunger.
                      </p>
                    </div>
                    
                    <div className="bg-white rounded-lg p-6 shadow-sm">
                      <i className="fas fa-utensils text-2xl text-purple-600 mb-4"></i>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Practice Portion Awareness</h3>
                      <p className="text-gray-600 text-sm">
                        Use measuring tools initially to learn proper portions. Eat slowly and mindfully to 
                        recognize hunger and fullness cues.
                      </p>
                    </div>
                    
                    <div className="bg-white rounded-lg p-6 shadow-sm">
                      <i className="fas fa-clock text-2xl text-orange-600 mb-4"></i>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Optimize Meal Timing</h3>
                      <p className="text-gray-600 text-sm">
                        Eat regular meals to maintain stable blood sugar and energy. Consider your schedule 
                        and exercise timing when planning meals.
                      </p>
                    </div>
                    
                    <div className="bg-white rounded-lg p-6 shadow-sm">
                      <i className="fas fa-chart-line text-2xl text-red-600 mb-4"></i>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Monitor and Adjust</h3>
                      <p className="text-gray-600 text-sm">
                        Track your progress through multiple metrics including weight, energy levels, 
                        performance, and how you feel. Adjust calories as needed.
                      </p>
                    </div>
                    
                    <div className="bg-white rounded-lg p-6 shadow-sm">
                      <i className="fas fa-user-md text-2xl text-indigo-600 mb-4"></i>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Seek Professional Guidance</h3>
                      <p className="text-gray-600 text-sm">
                        Consider consulting registered dietitians, nutritionists, or healthcare providers 
                        for personalized advice, especially with medical conditions.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Common Mistakes */}
                <div className="bg-white rounded-2xl shadow-lg p-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Common Calorie Counting Mistakes to Avoid</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-6">
                      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <h3 className="text-lg font-semibold text-red-800 mb-2">❌ Extreme Calorie Restriction</h3>
                        <p className="text-red-700 text-sm">
                          Eating too few calories can slow metabolism, cause muscle loss, and lead to nutrient deficiencies. 
                          Aim for moderate deficits of 500-750 calories per day for sustainable weight loss.
                        </p>
                      </div>
                      
                      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <h3 className="text-lg font-semibold text-red-800 mb-2">❌ Ignoring Liquid Calories</h3>
                        <p className="text-red-700 text-sm">
                          Beverages like sodas, juices, coffee drinks, and alcohol can add significant calories. 
                          Track all liquid intake including oils and dressings used in cooking.
                        </p>
                      </div>
                      
                      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <h3 className="text-lg font-semibold text-red-800 mb-2">❌ Overestimating Exercise Calories</h3>
                        <p className="text-red-700 text-sm">
                          Many people overestimate calories burned during exercise. Be conservative with exercise 
                          calorie estimates and focus on consistent activity rather than eating back all exercise calories.
                        </p>
                      </div>
                    </div>
                    
                    <div className="space-y-6">
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <h3 className="text-lg font-semibold text-green-800 mb-2">✅ Focus on Food Quality</h3>
                        <p className="text-green-700 text-sm">
                          Prioritize nutrient-dense foods that provide satiety and essential nutrients. 
                          Quality matters as much as quantity for long-term health and weight management.
                        </p>
                      </div>
                      
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <h3 className="text-lg font-semibold text-green-800 mb-2">✅ Be Patient and Consistent</h3>
                        <p className="text-green-700 text-sm">
                          Sustainable results take time. Focus on building healthy habits and making gradual 
                          changes rather than seeking rapid transformations that are difficult to maintain.
                        </p>
                      </div>
                      
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <h3 className="text-lg font-semibold text-green-800 mb-2">✅ Regular Reassessment</h3>
                        <p className="text-green-700 text-sm">
                          Recalculate your calorie needs as your weight, activity level, or goals change. 
                          Your calorie needs will evolve as you progress toward your goals.
                        </p>
                      </div>
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

export default CalorieCalculator;