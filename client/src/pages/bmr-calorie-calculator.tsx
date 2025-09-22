
import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Calculator, Info, Target, TrendingUp, Heart, Activity } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ToolHeroSection from '@/components/ToolHeroSection';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const BMRCalorieCalculator = () => {
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [activityLevel, setActivityLevel] = useState('');
  const [goal, setGoal] = useState('maintain');
  const [unitSystem, setUnitSystem] = useState('metric');
  const [results, setResults] = useState(null);

  const activityLevels = [
    { value: '1.2', label: 'Sedentary (little/no exercise)', description: 'Desk job, no regular exercise' },
    { value: '1.375', label: 'Lightly Active (light exercise 1-3 days/week)', description: 'Light exercise or sports 1-3 days/week' },
    { value: '1.55', label: 'Moderately Active (moderate exercise 3-5 days/week)', description: 'Moderate exercise or sports 3-5 days/week' },
    { value: '1.725', label: 'Very Active (hard exercise 6-7 days/week)', description: 'Hard exercise or sports 6-7 days a week' },
    { value: '1.9', label: 'Extremely Active (very hard exercise/physical job)', description: 'Very hard exercise, physical job, or training twice a day' }
  ];

  const goalAdjustments = {
    'lose_aggressive': { multiplier: 0.8, label: 'Aggressive Weight Loss (20% deficit)', color: 'text-red-600' },
    'lose_moderate': { multiplier: 0.85, label: 'Moderate Weight Loss (15% deficit)', color: 'text-orange-600' },
    'lose_mild': { multiplier: 0.9, label: 'Mild Weight Loss (10% deficit)', color: 'text-yellow-600' },
    'maintain': { multiplier: 1.0, label: 'Maintain Weight', color: 'text-green-600' },
    'gain_mild': { multiplier: 1.1, label: 'Mild Weight Gain (10% surplus)', color: 'text-blue-600' },
    'gain_moderate': { multiplier: 1.15, label: 'Moderate Weight Gain (15% surplus)', color: 'text-indigo-600' },
    'gain_aggressive': { multiplier: 1.2, label: 'Aggressive Weight Gain (20% surplus)', color: 'text-purple-600' }
  };

  const calculateBMR = () => {
    if (!age || !weight || !height || !gender) return null;

    const ageNum = parseFloat(age);
    let weightKg = parseFloat(weight);
    let heightCm = parseFloat(height);

    // Convert to metric if using imperial
    if (unitSystem === 'imperial') {
      weightKg = weightKg * 0.453592; // lbs to kg
      heightCm = heightCm * 2.54; // inches to cm
    }

    let bmr;
    // Mifflin-St Jeor Equation (most accurate)
    if (gender === 'male') {
      bmr = (10 * weightKg) + (6.25 * heightCm) - (5 * ageNum) + 5;
    } else {
      bmr = (10 * weightKg) + (6.25 * heightCm) - (5 * ageNum) - 161;
    }

    return Math.round(bmr);
  };

  const calculateResults = () => {
    const bmr = calculateBMR();
    if (!bmr || !activityLevel) return;

    const tdee = Math.round(bmr * parseFloat(activityLevel));
    const goalCalories = Math.round(tdee * goalAdjustments[goal].multiplier);
    
    // Macronutrient breakdown (general recommendations)
    const protein = Math.round((goalCalories * 0.25) / 4); // 25% protein
    const carbs = Math.round((goalCalories * 0.45) / 4); // 45% carbs
    const fat = Math.round((goalCalories * 0.30) / 9); // 30% fat

    // Weekly weight change estimate
    const calorieDeficit = tdee - goalCalories;
    const weeklyWeightChange = (calorieDeficit * 7) / 3500; // 3500 cal = 1 lb

    setResults({
      bmr,
      tdee,
      goalCalories,
      macros: { protein, carbs, fat },
      weeklyWeightChange: Math.abs(weeklyWeightChange),
      weightDirection: calorieDeficit > 0 ? 'loss' : calorieDeficit < 0 ? 'gain' : 'maintain'
    });
  };

  useEffect(() => {
    if (age && weight && height && gender && activityLevel) {
      calculateResults();
    }
  }, [age, weight, height, gender, activityLevel, goal, unitSystem]);

  const resetForm = () => {
    setAge('');
    setGender('');
    setWeight('');
    setHeight('');
    setActivityLevel('');
    setGoal('maintain');
    setResults(null);
  };

  return (
    <>
      <Helmet>
        <title>BMR & Calorie Needs Calculator - Free Metabolic Rate Calculator | DapsiWow</title>
        <meta name="description" content="Calculate your Basal Metabolic Rate (BMR) and daily calorie needs based on activity level. Get personalized calorie recommendations for weight loss, gain, or maintenance with macro breakdown." />
        <meta name="keywords" content="BMR calculator, calorie calculator, metabolic rate, daily calories, TDEE calculator, weight loss calories, macro calculator" />
        <meta property="og:title" content="BMR & Calorie Needs Calculator - Free Metabolic Rate Calculator" />
        <meta property="og:description" content="Calculate your Basal Metabolic Rate (BMR) and daily calorie needs based on activity level. Get personalized recommendations for your fitness goals." />
        <meta property="og:type" content="website" />
        <link rel="canonical" href="https://dapsiwow.com/tools/bmr-calorie-calculator" />
      </Helmet>

      <div className="min-h-screen flex flex-col" data-testid="page-bmr-calorie-calculator">
        <Header />
        
        <ToolHeroSection
          title="BMR & Calorie Needs Calculator"
          description="Calculate your Basal Metabolic Rate (BMR) and daily calorie requirements based on your activity level and fitness goals. Get personalized recommendations for optimal nutrition."
        />
        
        <main className="flex-1 bg-neutral-50 py-12">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            
            {/* Calculator Section */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calculator className="w-6 h-6 mr-2" />
                  BMR & Calorie Calculator
                </CardTitle>
                <CardDescription>
                  Enter your details to calculate your metabolic rate and daily calorie needs
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                
                {/* Unit System Toggle */}
                <div className="flex items-center space-x-4">
                  <Label>Unit System:</Label>
                  <Select value={unitSystem} onValueChange={setUnitSystem}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="metric">Metric (kg, cm)</SelectItem>
                      <SelectItem value="imperial">Imperial (lbs, inches)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  
                  <div className="space-y-2">
                    <Label htmlFor="age">Age (years)</Label>
                    <Input
                      id="age"
                      type="number"
                      placeholder="25"
                      value={age}
                      onChange={(e) => setAge(e.target.value)}
                      min="1"
                      max="120"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="gender">Gender</Label>
                    <Select value={gender} onValueChange={setGender}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="weight">
                      Weight ({unitSystem === 'metric' ? 'kg' : 'lbs'})
                    </Label>
                    <Input
                      id="weight"
                      type="number"
                      placeholder={unitSystem === 'metric' ? '70' : '154'}
                      value={weight}
                      onChange={(e) => setWeight(e.target.value)}
                      min="1"
                      step="0.1"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="height">
                      Height ({unitSystem === 'metric' ? 'cm' : 'inches'})
                    </Label>
                    <Input
                      id="height"
                      type="number"
                      placeholder={unitSystem === 'metric' ? '175' : '69'}
                      value={height}
                      onChange={(e) => setHeight(e.target.value)}
                      min="1"
                      step="0.1"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="activity">Activity Level</Label>
                  <Select value={activityLevel} onValueChange={setActivityLevel}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your activity level" />
                    </SelectTrigger>
                    <SelectContent>
                      {activityLevels.map((level) => (
                        <SelectItem key={level.value} value={level.value}>
                          <div>
                            <div className="font-medium">{level.label}</div>
                            <div className="text-sm text-muted-foreground">{level.description}</div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="goal">Fitness Goal</Label>
                  <Select value={goal} onValueChange={setGoal}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(goalAdjustments).map(([key, adjustment]) => (
                        <SelectItem key={key} value={key}>
                          <span className={adjustment.color}>{adjustment.label}</span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex gap-4">
                  <Button 
                    onClick={calculateResults} 
                    className="flex-1"
                    disabled={!age || !weight || !height || !gender || !activityLevel}
                  >
                    <Calculator className="w-4 h-4 mr-2" />
                    Calculate BMR & Calories
                  </Button>
                  <Button onClick={resetForm} variant="outline">
                    Reset
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Results Section */}
            {results && (
              <Card className="mb-8">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Target className="w-6 h-6 mr-2" />
                    Your Results
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="overview" className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="overview">Overview</TabsTrigger>
                      <TabsTrigger value="macros">Macronutrients</TabsTrigger>
                      <TabsTrigger value="progress">Progress Estimate</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="overview" className="space-y-4 mt-6">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-blue-50 p-4 rounded-lg text-center">
                          <Heart className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                          <div className="text-2xl font-bold text-blue-600">{results.bmr}</div>
                          <div className="text-sm text-blue-700">BMR (calories/day)</div>
                          <div className="text-xs text-blue-600 mt-1">Calories at rest</div>
                        </div>
                        
                        <div className="bg-green-50 p-4 rounded-lg text-center">
                          <Activity className="w-8 h-8 mx-auto mb-2 text-green-600" />
                          <div className="text-2xl font-bold text-green-600">{results.tdee}</div>
                          <div className="text-sm text-green-700">TDEE (calories/day)</div>
                          <div className="text-xs text-green-600 mt-1">Total daily expenditure</div>
                        </div>
                        
                        <div className="bg-purple-50 p-4 rounded-lg text-center">
                          <Target className="w-8 h-8 mx-auto mb-2 text-purple-600" />
                          <div className="text-2xl font-bold text-purple-600">{results.goalCalories}</div>
                          <div className="text-sm text-purple-700">Goal Calories</div>
                          <div className="text-xs text-purple-600 mt-1">For your fitness goal</div>
                        </div>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="macros" className="space-y-4 mt-6">
                      <div className="bg-gradient-to-r from-orange-50 to-red-50 p-6 rounded-lg">
                        <h3 className="text-lg font-semibold mb-4">Daily Macronutrient Breakdown</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="text-center">
                            <div className="text-3xl font-bold text-red-600">{results.macros.protein}g</div>
                            <div className="text-sm text-red-700">Protein (25%)</div>
                            <div className="text-xs text-gray-600 mt-1">4 cal/gram</div>
                          </div>
                          <div className="text-center">
                            <div className="text-3xl font-bold text-yellow-600">{results.macros.carbs}g</div>
                            <div className="text-sm text-yellow-700">Carbohydrates (45%)</div>
                            <div className="text-xs text-gray-600 mt-1">4 cal/gram</div>
                          </div>
                          <div className="text-center">
                            <div className="text-3xl font-bold text-blue-600">{results.macros.fat}g</div>
                            <div className="text-sm text-blue-700">Fat (30%)</div>
                            <div className="text-xs text-gray-600 mt-1">9 cal/gram</div>
                          </div>
                        </div>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="progress" className="space-y-4 mt-6">
                      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-6 rounded-lg">
                        <h3 className="text-lg font-semibold mb-4">Estimated Progress</h3>
                        <div className="text-center">
                          <TrendingUp className="w-12 h-12 mx-auto mb-4 text-indigo-600" />
                          <div className="text-2xl font-bold text-indigo-600">
                            {results.weeklyWeightChange.toFixed(1)} {unitSystem === 'metric' ? 'kg' : 'lbs'}/week
                          </div>
                          <div className="text-sm text-indigo-700">
                            Estimated weekly weight {results.weightDirection}
                          </div>
                          <div className="text-xs text-gray-600 mt-2">
                            Based on your calorie goal vs. maintenance calories
                          </div>
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            )}

            {/* Information Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Info className="w-5 h-5 mr-2" />
                    Understanding BMR
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-2">What is BMR?</h3>
                    <p className="text-gray-600 text-sm">
                      Basal Metabolic Rate (BMR) is the number of calories your body burns at rest to maintain basic physiological functions like breathing, circulation, and cell production.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-2">BMR vs TDEE</h3>
                    <p className="text-gray-600 text-sm">
                      While BMR represents calories burned at rest, Total Daily Energy Expenditure (TDEE) includes calories burned through physical activity and exercise.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-2">Factors Affecting BMR</h3>
                    <ul className="text-gray-600 text-sm space-y-1">
                      <li>• Age (decreases with age)</li>
                      <li>• Gender (males typically higher)</li>
                      <li>• Body composition (muscle burns more)</li>
                      <li>• Genetics and hormones</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Target className="w-5 h-5 mr-2" />
                    How to Use Your Results
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-2">For Weight Loss</h3>
                    <p className="text-gray-600 text-sm">
                      Create a calorie deficit by eating below your TDEE. A deficit of 500 calories/day typically results in 1 lb of weight loss per week.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-2">For Weight Gain</h3>
                    <p className="text-gray-600 text-sm">
                      Eat above your TDEE to create a calorie surplus. Focus on nutrient-dense foods and strength training for healthy weight gain.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-2">Macro Guidelines</h3>
                    <p className="text-gray-600 text-sm">
                      The provided macro breakdown is a general guideline. Adjust based on your specific goals, preferences, and any dietary restrictions.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Educational Content */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Complete Guide to BMR and Calorie Needs</CardTitle>
              </CardHeader>
              <CardContent className="prose max-w-none">
                <div className="space-y-6">
                  <section>
                    <h2 className="text-xl font-semibold text-gray-800 mb-3">Understanding Your Metabolic Rate</h2>
                    <p className="text-gray-600 mb-4">
                      Your metabolic rate determines how many calories your body burns throughout the day. This comprehensive calculator helps you understand both your Basal Metabolic Rate (BMR) and Total Daily Energy Expenditure (TDEE), which are crucial for achieving your fitness and health goals.
                    </p>
                    
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">The Science Behind BMR</h3>
                    <p className="text-gray-600 mb-4">
                      Our calculator uses the Mifflin-St Jeor equation, which is considered one of the most accurate methods for calculating BMR. This equation takes into account your age, gender, weight, and height to determine your baseline caloric needs.
                    </p>
                    
                    <div className="bg-blue-50 p-4 rounded-lg mb-4">
                      <h4 className="font-semibold text-blue-800 mb-2">BMR Formula:</h4>
                      <p className="text-blue-700 text-sm mb-1">
                        <strong>Men:</strong> BMR = (10 × weight in kg) + (6.25 × height in cm) - (5 × age in years) + 5
                      </p>
                      <p className="text-blue-700 text-sm">
                        <strong>Women:</strong> BMR = (10 × weight in kg) + (6.25 × height in cm) - (5 × age in years) - 161
                      </p>
                    </div>
                  </section>

                  <section>
                    <h2 className="text-xl font-semibold text-gray-800 mb-3">Activity Level Impact</h2>
                    <p className="text-gray-600 mb-4">
                      Your activity level significantly impacts your total daily calorie needs. Here's how different activity levels affect your metabolism:
                    </p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div className="border border-gray-200 p-4 rounded-lg">
                        <h4 className="font-semibold text-gray-800 mb-2">Sedentary (1.2x BMR)</h4>
                        <p className="text-gray-600 text-sm">Desk job with little to no exercise. This is the baseline for people who primarily sit throughout the day.</p>
                      </div>
                      <div className="border border-gray-200 p-4 rounded-lg">
                        <h4 className="font-semibold text-gray-800 mb-2">Lightly Active (1.375x BMR)</h4>
                        <p className="text-gray-600 text-sm">Light exercise 1-3 days per week, such as walking or gentle yoga sessions.</p>
                      </div>
                      <div className="border border-gray-200 p-4 rounded-lg">
                        <h4 className="font-semibold text-gray-800 mb-2">Moderately Active (1.55x BMR)</h4>
                        <p className="text-gray-600 text-sm">Moderate exercise 3-5 days per week, including cardio and strength training.</p>
                      </div>
                      <div className="border border-gray-200 p-4 rounded-lg">
                        <h4 className="font-semibold text-gray-800 mb-2">Very Active (1.725x BMR)</h4>
                        <p className="text-gray-600 text-sm">Hard exercise 6-7 days per week, consistent high-intensity workouts.</p>
                      </div>
                    </div>
                  </section>

                  <section>
                    <h2 className="text-xl font-semibold text-gray-800 mb-3">Achieving Your Goals</h2>
                    
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">Weight Loss Strategy</h3>
                    <p className="text-gray-600 mb-4">
                      Safe and sustainable weight loss occurs when you create a moderate calorie deficit. A deficit of 10-20% below your TDEE is generally recommended for sustainable fat loss while preserving muscle mass. Extreme deficits can lead to muscle loss, metabolic slowdown, and nutritional deficiencies.
                    </p>
                    
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">Weight Gain Strategy</h3>
                    <p className="text-gray-600 mb-4">
                      For healthy weight gain, aim for a calorie surplus of 10-20% above your TDEE. Focus on nutrient-dense foods and combine your increased calorie intake with resistance training to promote muscle growth rather than just fat accumulation.
                    </p>
                    
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">Maintenance Phase</h3>
                    <p className="text-gray-600 mb-4">
                      Eating at your TDEE level maintains your current weight. This phase is important for metabolic health and can be used strategically during weight loss journeys to prevent metabolic adaptation.
                    </p>
                  </section>

                  <section>
                    <h2 className="text-xl font-semibold text-gray-800 mb-3">Macronutrient Distribution</h2>
                    <p className="text-gray-600 mb-4">
                      The calculator provides a balanced macronutrient breakdown that works well for most people:
                    </p>
                    
                    <div className="bg-gray-50 p-4 rounded-lg mb-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <h4 className="font-semibold text-red-600 mb-2">Protein (25%)</h4>
                          <p className="text-gray-600 text-sm">Essential for muscle maintenance, satiety, and metabolic function. Aim for 0.8-1.2g per kg of body weight.</p>
                        </div>
                        <div>
                          <h4 className="font-semibold text-yellow-600 mb-2">Carbohydrates (45%)</h4>
                          <p className="text-gray-600 text-sm">Primary energy source for your brain and muscles. Focus on complex carbs for sustained energy.</p>
                        </div>
                        <div>
                          <h4 className="font-semibold text-blue-600 mb-2">Fats (30%)</h4>
                          <p className="text-gray-600 text-sm">Important for hormone production and vitamin absorption. Include healthy fats like nuts, oils, and fish.</p>
                        </div>
                      </div>
                    </div>
                  </section>

                  <section>
                    <h2 className="text-xl font-semibold text-gray-800 mb-3">Tips for Success</h2>
                    <div className="space-y-3">
                      <div className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                        <p className="text-gray-600 text-sm"><strong>Track consistently:</strong> Use a food diary or app to monitor your intake and stay accountable to your goals.</p>
                      </div>
                      <div className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                        <p className="text-gray-600 text-sm"><strong>Adjust gradually:</strong> Make small changes to your calorie intake rather than dramatic shifts.</p>
                      </div>
                      <div className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                        <p className="text-gray-600 text-sm"><strong>Stay hydrated:</strong> Proper hydration supports metabolism and can help with appetite control.</p>
                      </div>
                      <div className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                        <p className="text-gray-600 text-sm"><strong>Include strength training:</strong> Building muscle increases your BMR and improves body composition.</p>
                      </div>
                      <div className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                        <p className="text-gray-600 text-sm"><strong>Be patient:</strong> Sustainable changes take time. Focus on long-term habits rather than quick fixes.</p>
                      </div>
                    </div>
                  </section>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
        
        <Footer />
      </div>
    </>
  );
};

export default BMRCalorieCalculator;
