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
                {/* Understanding Calories */}
                <div className="bg-white rounded-2xl shadow-lg p-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-8">Understanding Calories & Nutrition</h2>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-4">What are Calories?</h3>
                      <p className="text-gray-600 mb-6 leading-relaxed">
                        A calorie is a unit of energy that measures how much energy food provides to your body. 
                        Your body needs a certain number of calories each day to function properly, including 
                        breathing, digestion, circulation, and physical activity.
                      </p>
                      
                      <h3 className="text-xl font-semibold text-gray-900 mb-4">Weight Management</h3>
                      <div className="bg-rose-50 rounded-lg p-4 mb-4">
                        <ul className="text-rose-800 text-sm space-y-1">
                          <li><strong>Weight Loss:</strong> Eat fewer calories than you burn</li>
                          <li><strong>Weight Maintenance:</strong> Eat the same calories as you burn</li>
                          <li><strong>Weight Gain:</strong> Eat more calories than you burn</li>
                        </ul>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-4">Macronutrients</h3>
                      <div className="space-y-3">
                        <div className="flex items-center p-3 bg-blue-50 rounded-lg">
                          <div className="w-4 h-4 bg-blue-500 rounded-full mr-3"></div>
                          <div>
                            <div className="font-medium">Protein (4 cal/g)</div>
                            <div className="text-sm text-gray-600">Builds and repairs tissues, supports immune function</div>
                          </div>
                        </div>
                        
                        <div className="flex items-center p-3 bg-green-50 rounded-lg">
                          <div className="w-4 h-4 bg-green-500 rounded-full mr-3"></div>
                          <div>
                            <div className="font-medium">Carbohydrates (4 cal/g)</div>
                            <div className="text-sm text-gray-600">Primary energy source for your body and brain</div>
                          </div>
                        </div>
                        
                        <div className="flex items-center p-3 bg-orange-50 rounded-lg">
                          <div className="w-4 h-4 bg-orange-500 rounded-full mr-3"></div>
                          <div>
                            <div className="font-medium">Fat (9 cal/g)</div>
                            <div className="text-sm text-gray-600">Essential for hormone production and nutrient absorption</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Nutrition Tips */}
                <div className="bg-gradient-to-r from-rose-50 to-pink-50 rounded-2xl p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Healthy Eating Guidelines</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="bg-white rounded-lg p-6 shadow-sm">
                      <i className="fas fa-apple-alt text-2xl text-green-600 mb-4"></i>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Whole Foods</h3>
                      <p className="text-gray-600 text-sm">
                        Focus on unprocessed foods like fruits, vegetables, lean meats, 
                        whole grains, and legumes for optimal nutrition.
                      </p>
                    </div>
                    
                    <div className="bg-white rounded-lg p-6 shadow-sm">
                      <i className="fas fa-tint text-2xl text-blue-600 mb-4"></i>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Stay Hydrated</h3>
                      <p className="text-gray-600 text-sm">
                        Drink plenty of water throughout the day. Aim for 8-10 glasses 
                        or more if you're active or in hot weather.
                      </p>
                    </div>
                    
                    <div className="bg-white rounded-lg p-6 shadow-sm">
                      <i className="fas fa-utensils text-2xl text-purple-600 mb-4"></i>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Portion Control</h3>
                      <p className="text-gray-600 text-sm">
                        Use smaller plates, measure portions, and eat slowly to help 
                        control calorie intake and improve digestion.
                      </p>
                    </div>
                    
                    <div className="bg-white rounded-lg p-6 shadow-sm">
                      <i className="fas fa-clock text-2xl text-orange-600 mb-4"></i>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Meal Timing</h3>
                      <p className="text-gray-600 text-sm">
                        Eat regular meals and healthy snacks to maintain stable 
                        blood sugar and energy levels throughout the day.
                      </p>
                    </div>
                    
                    <div className="bg-white rounded-lg p-6 shadow-sm">
                      <i className="fas fa-chart-line text-2xl text-red-600 mb-4"></i>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Track Progress</h3>
                      <p className="text-gray-600 text-sm">
                        Monitor your food intake and weight changes to adjust 
                        your calorie goals and achieve your health objectives.
                      </p>
                    </div>
                    
                    <div className="bg-white rounded-lg p-6 shadow-sm">
                      <i className="fas fa-user-md text-2xl text-indigo-600 mb-4"></i>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Professional Help</h3>
                      <p className="text-gray-600 text-sm">
                        Consider consulting a registered dietitian or nutritionist 
                        for personalized meal plans and dietary advice.
                      </p>
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