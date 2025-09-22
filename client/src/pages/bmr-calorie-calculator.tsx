
import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface BMRResult {
  bmr: number;
  tdee: number;
  goalCalories: number;
  macros: {
    protein: number;
    carbs: number;
    fat: number;
  };
  weeklyWeightChange: number;
  weightDirection: string;
}

const BMRCalorieCalculator = () => {
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [feet, setFeet] = useState('');
  const [inches, setInches] = useState('');
  const [activityLevel, setActivityLevel] = useState('');
  const [goal, setGoal] = useState('maintain');
  const [unitSystem, setUnitSystem] = useState('metric');
  const [results, setResults] = useState<BMRResult | null>(null);

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
      const totalInches = (parseFloat(feet) * 12) + parseFloat(inches);
      heightCm = totalInches * 2.54; // inches to cm
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
    if (age && weight && ((unitSystem === 'metric' && height) || (unitSystem === 'imperial' && feet && inches)) && gender && activityLevel) {
      calculateResults();
    }
  }, [age, weight, height, feet, inches, gender, activityLevel, goal, unitSystem]);

  const resetCalculator = () => {
    setAge('');
    setGender('');
    setWeight('');
    setHeight('');
    setFeet('');
    setInches('');
    setActivityLevel('');
    setGoal('maintain');
    setResults(null);
  };

  const getCalorieColor = (calories: number, type: string) => {
    if (type === 'bmr') return 'text-blue-600';
    if (type === 'tdee') return 'text-green-600';
    return 'text-purple-600';
  };

  const formatWeight = (weight: number) => {
    const unit = unitSystem === 'metric' ? 'kg' : 'lbs';
    return `${weight.toFixed(1)} ${unit}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Helmet>
        <title>BMR & Calorie Needs Calculator - Free Metabolic Rate Calculator | DapsiWow</title>
        <meta name="description" content="Calculate your Basal Metabolic Rate (BMR) and daily calorie needs based on activity level. Get personalized calorie recommendations for weight loss, gain, or maintenance with macro breakdown." />
        <meta name="keywords" content="BMR calculator, calorie calculator, metabolic rate, daily calories, TDEE calculator, weight loss calories, macro calculator, basal metabolic rate" />
        <meta property="og:title" content="BMR & Calorie Needs Calculator - Free Metabolic Rate Calculator" />
        <meta property="og:description" content="Calculate your Basal Metabolic Rate (BMR) and daily calorie needs based on activity level. Get personalized recommendations for your fitness goals." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://dapsiwow.com/tools/bmr-calorie-calculator" />
        <meta name="robots" content="index, follow" />
        <meta name="author" content="DapsiWow" />
        <link rel="canonical" href="https://dapsiwow.com/tools/bmr-calorie-calculator" />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            "name": "BMR & Calorie Needs Calculator",
            "description": "Free online BMR calculator to calculate Basal Metabolic Rate and daily calorie requirements based on activity level and fitness goals.",
            "url": "https://dapsiwow.com/tools/bmr-calorie-calculator",
            "applicationCategory": "HealthApplication",
            "operatingSystem": "Any",
            "permissions": "browser",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "USD"
            },
            "featureList": [
              "Calculate BMR using metric or imperial units",
              "Activity level adjustments for TDEE",
              "Calorie goals for weight management",
              "Macronutrient breakdown",
              "Progress estimation"
            ],
            "provider": {
              "@type": "Organization",
              "name": "DapsiWow",
              "url": "https://dapsiwow.com"
            }
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
                <span className="text-xs sm:text-sm font-medium text-blue-700">Professional BMR & Calorie Calculator</span>
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl 2xl:text-8xl font-bold text-slate-900 leading-tight tracking-tight" data-testid="text-bmr-title">
                <span className="block">BMR & Calorie</span>
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 mt-1 sm:mt-2">
                  Needs Calculator
                </span>
              </h1>
              <p className="text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl text-slate-600 max-w-sm sm:max-w-lg md:max-w-2xl lg:max-w-3xl xl:max-w-4xl mx-auto leading-relaxed px-2 sm:px-0">
                Calculate your Basal Metabolic Rate and daily calorie requirements with advanced activity level adjustments and macronutrient breakdown
              </p>
            </div>
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-4 py-16" data-testid="page-bmr-calorie-calculator">
          {/* Main Calculator Card */}
          <Card className="bg-white/90 backdrop-blur-sm shadow-2xl border-0 rounded-3xl overflow-hidden">
            <CardContent className="p-0">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-0">
                {/* Input Section */}
                <div className="lg:col-span-2 p-8 lg:p-12 space-y-8">
                  <div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">BMR Configuration</h2>
                    <p className="text-gray-600">Enter your details to calculate metabolic rate and calorie needs</p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Unit System */}
                    <div className="md:col-span-2 space-y-3">
                      <Label className="text-sm font-semibold text-gray-800 uppercase tracking-wide">Unit System</Label>
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
                        placeholder="25"
                        min="1"
                        max="120"
                        data-testid="input-age"
                      />
                    </div>

                    {/* Gender */}
                    <div className="space-y-3">
                      <Label className="text-sm font-semibold text-gray-800 uppercase tracking-wide">Gender</Label>
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
                      <Label className="text-sm font-semibold text-gray-800 uppercase tracking-wide">Activity Level</Label>
                      <Select value={activityLevel} onValueChange={setActivityLevel}>
                        <SelectTrigger className="h-14 border-2 border-gray-200 rounded-xl text-lg" data-testid="select-activity">
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

                    {/* Fitness Goal */}
                    <div className="md:col-span-2 space-y-3">
                      <Label className="text-sm font-semibold text-gray-800 uppercase tracking-wide">Fitness Goal</Label>
                      <Select value={goal} onValueChange={setGoal}>
                        <SelectTrigger className="h-14 border-2 border-gray-200 rounded-xl text-lg" data-testid="select-goal">
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
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-4 pt-6">
                    <Button
                      onClick={calculateResults}
                      className="flex-1 h-14 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold text-lg rounded-xl shadow-lg transform transition-all duration-200 hover:scale-105"
                      disabled={!age || !weight || ((unitSystem === 'metric' && !height) || (unitSystem === 'imperial' && (!feet || !inches))) || !gender || !activityLevel}
                      data-testid="button-calculate"
                    >
                      Calculate BMR & Calories
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
                  <h2 className="text-2xl font-bold text-gray-900 mb-8">BMR & Calorie Results</h2>
                  
                  {results ? (
                    <div className="space-y-6" data-testid="bmr-results">
                      <Tabs defaultValue="overview" className="w-full">
                        <TabsList className="grid w-full grid-cols-3">
                          <TabsTrigger value="overview">Overview</TabsTrigger>
                          <TabsTrigger value="macros">Macros</TabsTrigger>
                          <TabsTrigger value="progress">Progress</TabsTrigger>
                        </TabsList>
                        
                        <TabsContent value="overview" className="space-y-4 mt-6">
                          <div className="space-y-4">
                            {/* BMR Value */}
                            <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                              <div className="flex justify-between items-center">
                                <span className="font-medium text-blue-700">BMR (Basal Metabolic Rate)</span>
                                <span className={`font-bold text-xl ${getCalorieColor(results.bmr, 'bmr')}`} data-testid="text-bmr-value">
                                  {results.bmr} cal/day
                                </span>
                              </div>
                              <p className="text-sm text-blue-600 mt-1">Calories burned at rest</p>
                            </div>

                            {/* TDEE Value */}
                            <div className="bg-green-50 rounded-xl p-4 border border-green-200">
                              <div className="flex justify-between items-center">
                                <span className="font-medium text-green-700">TDEE (Total Daily Energy)</span>
                                <span className={`font-bold text-xl ${getCalorieColor(results.tdee, 'tdee')}`} data-testid="text-tdee-value">
                                  {results.tdee} cal/day
                                </span>
                              </div>
                              <p className="text-sm text-green-600 mt-1">Total daily expenditure</p>
                            </div>

                            {/* Goal Calories */}
                            <div className="bg-purple-50 rounded-xl p-4 border border-purple-200">
                              <div className="flex justify-between items-center">
                                <span className="font-medium text-purple-700">Goal Calories</span>
                                <span className={`font-bold text-xl ${getCalorieColor(results.goalCalories, 'goal')}`} data-testid="text-goal-calories">
                                  {results.goalCalories} cal/day
                                </span>
                              </div>
                              <p className="text-sm text-purple-600 mt-1">For your fitness goal</p>
                            </div>
                          </div>
                        </TabsContent>
                        
                        <TabsContent value="macros" className="space-y-4 mt-6">
                          <div className="bg-gradient-to-r from-orange-50 to-red-50 p-4 rounded-xl">
                            <h3 className="font-semibold mb-4">Daily Macronutrient Breakdown</h3>
                            <div className="grid grid-cols-1 gap-4">
                              <div className="bg-white rounded-lg p-3">
                                <div className="flex justify-between items-center">
                                  <span className="text-red-600 font-medium">Protein (25%)</span>
                                  <span className="font-bold text-red-600" data-testid="text-protein">{results.macros.protein}g</span>
                                </div>
                              </div>
                              <div className="bg-white rounded-lg p-3">
                                <div className="flex justify-between items-center">
                                  <span className="text-yellow-600 font-medium">Carbs (45%)</span>
                                  <span className="font-bold text-yellow-600" data-testid="text-carbs">{results.macros.carbs}g</span>
                                </div>
                              </div>
                              <div className="bg-white rounded-lg p-3">
                                <div className="flex justify-between items-center">
                                  <span className="text-blue-600 font-medium">Fat (30%)</span>
                                  <span className="font-bold text-blue-600" data-testid="text-fat">{results.macros.fat}g</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </TabsContent>
                        
                        <TabsContent value="progress" className="space-y-4 mt-6">
                          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-4 rounded-xl">
                            <h3 className="font-semibold mb-4">Estimated Progress</h3>
                            <div className="text-center bg-white rounded-lg p-4">
                              <div className="text-xl font-bold text-indigo-600" data-testid="text-weight-change">
                                {results.weeklyWeightChange.toFixed(1)} {unitSystem === 'metric' ? 'kg' : 'lbs'}/week
                              </div>
                              <div className="text-sm text-indigo-700">
                                Estimated weekly weight {results.weightDirection}
                              </div>
                            </div>
                          </div>
                        </TabsContent>
                      </Tabs>
                    </div>
                  ) : (
                    <div className="text-center py-16" data-testid="no-results">
                      <div className="w-20 h-20 bg-gray-200 rounded-full mx-auto mb-6 flex items-center justify-center">
                        <div className="text-2xl font-bold text-gray-400">BMR</div>
                      </div>
                      <p className="text-gray-500 text-lg">Enter your details and calculate to see BMR & calorie results</p>
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
                    BMR (Basal Metabolic Rate) represents the minimum number of calories your body needs to maintain essential physiological functions while at complete rest. This includes vital processes such as breathing, blood circulation, cell production, nutrient processing, protein synthesis, and brain function. Understanding your BMR is fundamental to creating effective nutrition and weight management strategies.
                  </p>
                  <p>
                    Our advanced BMR calculator uses the scientifically validated Mifflin-St Jeor equation, recognized as the most accurate method for calculating metabolic rate in healthy adults. This equation accounts for age, gender, weight, and height to provide precise baseline calorie requirements that form the foundation of personalized nutrition planning.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Understanding TDEE and Activity Levels</h3>
                <div className="space-y-4 text-gray-600">
                  <p>
                    Total Daily Energy Expenditure (TDEE) represents your complete daily caloric needs, calculated by multiplying your BMR by an activity factor. This comprehensive measurement accounts for all energy expenditure including exercise, daily activities, and the thermic effect of food, providing accurate calorie targets for various fitness goals.
                  </p>
                  <div className="bg-blue-50 rounded-lg p-4">
                    <h4 className="font-semibold text-blue-800 mb-2">BMR Formula (Mifflin-St Jeor)</h4>
                    <p className="text-sm text-blue-700 mb-1">
                      <strong>Men:</strong> BMR = (10 × weight kg) + (6.25 × height cm) - (5 × age) + 5
                    </p>
                    <p className="text-sm text-blue-700">
                      <strong>Women:</strong> BMR = (10 × weight kg) + (6.25 × height cm) - (5 × age) - 161
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Activity Level Classifications</h3>
                <div className="space-y-4">
                  <div className="flex items-center p-3 bg-red-50 rounded-lg">
                    <div className="w-4 h-4 bg-red-500 rounded-full mr-3"></div>
                    <div>
                      <div className="font-medium">Sedentary (1.2x BMR)</div>
                      <div className="text-sm text-gray-600">Desk job with little to no exercise or sports</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center p-3 bg-orange-50 rounded-lg">
                    <div className="w-4 h-4 bg-orange-500 rounded-full mr-3"></div>
                    <div>
                      <div className="font-medium">Lightly Active (1.375x BMR)</div>
                      <div className="text-sm text-gray-600">Light exercise or sports 1-3 days per week</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center p-3 bg-yellow-50 rounded-lg">
                    <div className="w-4 h-4 bg-yellow-500 rounded-full mr-3"></div>
                    <div>
                      <div className="font-medium">Moderately Active (1.55x BMR)</div>
                      <div className="text-sm text-gray-600">Moderate exercise or sports 3-5 days per week</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center p-3 bg-green-50 rounded-lg">
                    <div className="w-4 h-4 bg-green-500 rounded-full mr-3"></div>
                    <div>
                      <div className="font-medium">Very Active (1.725x BMR)</div>
                      <div className="text-sm text-gray-600">Hard exercise or sports 6-7 days per week</div>
                    </div>
                  </div>

                  <div className="flex items-center p-3 bg-blue-50 rounded-lg">
                    <div className="w-4 h-4 bg-blue-500 rounded-full mr-3"></div>
                    <div>
                      <div className="font-medium">Extremely Active (1.9x BMR)</div>
                      <div className="text-sm text-gray-600">Very hard exercise, physical job, or training twice daily</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Calorie Goals for Weight Management</h3>
                <div className="space-y-3 text-gray-600">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span><strong>Weight Loss:</strong> Create a 10-20% calorie deficit below TDEE for sustainable fat loss</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span><strong>Weight Maintenance:</strong> Consume calories equal to your TDEE for stable weight</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span><strong>Weight Gain:</strong> Create a 10-20% calorie surplus above TDEE for healthy weight gain</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span><strong>Muscle Building:</strong> Combine moderate surplus with resistance training for lean mass gains</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span><strong>Body Recomposition:</strong> Eat at maintenance while optimizing macronutrient distribution</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Additional Comprehensive SEO Sections */}
          <div className="mt-12 space-y-8">
            {/* Factors Affecting BMR */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Factors That Influence Your BMR</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-gray-800">Biological Factors</h4>
                    <div className="space-y-3">
                      <div className="bg-blue-50 rounded-lg p-4">
                        <h5 className="font-medium text-blue-800 mb-2">Body Composition</h5>
                        <p className="text-sm text-blue-700">Muscle tissue burns significantly more calories at rest than fat tissue. Individuals with higher muscle mass typically have elevated BMRs, making strength training crucial for metabolic health.</p>
                      </div>
                      <div className="bg-green-50 rounded-lg p-4">
                        <h5 className="font-medium text-green-800 mb-2">Age and Gender</h5>
                        <p className="text-sm text-green-700">BMR generally decreases by 1-2% per decade after age 30 due to muscle loss. Men typically have 10-15% higher BMRs than women due to greater muscle mass and larger body size.</p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-gray-800">Environmental Factors</h4>
                    <div className="space-y-3">
                      <div className="bg-purple-50 rounded-lg p-4">
                        <h5 className="font-medium text-purple-800 mb-2">Hormonal Influences</h5>
                        <p className="text-sm text-purple-700">Thyroid hormones, testosterone, growth hormone, and cortisol significantly impact metabolic rate. Medical conditions affecting these hormones can alter BMR calculations.</p>
                      </div>
                      <div className="bg-orange-50 rounded-lg p-4">
                        <h5 className="font-medium text-orange-800 mb-2">Lifestyle Factors</h5>
                        <p className="text-sm text-orange-700">Sleep quality, stress levels, meal frequency, and environmental temperature can influence metabolic rate by 5-10%, affecting overall calorie requirements.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Macronutrient Optimization */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Optimizing Macronutrient Distribution</h3>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="bg-gradient-to-br from-red-50 to-pink-50 rounded-lg p-6">
                    <h4 className="text-lg font-semibold text-red-800 mb-4">Protein (25%)</h4>
                    <div className="space-y-3 text-sm">
                      <p className="text-red-700">Essential for muscle maintenance, satiety, and metabolic function. Protein has the highest thermic effect, burning 20-30% of calories during digestion.</p>
                      <div className="bg-red-100 rounded p-3">
                        <p className="text-red-800 font-medium">Target: 0.8-1.2g per kg body weight</p>
                        <p className="text-red-700">Sources: Lean meats, fish, eggs, dairy, legumes, protein powders</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-lg p-6">
                    <h4 className="text-lg font-semibold text-yellow-800 mb-4">Carbohydrates (45%)</h4>
                    <div className="space-y-3 text-sm">
                      <p className="text-yellow-700">Primary energy source for brain and muscles. Complex carbs provide sustained energy and support exercise performance and recovery.</p>
                      <div className="bg-yellow-100 rounded p-3">
                        <p className="text-yellow-800 font-medium">Target: 3-7g per kg body weight</p>
                        <p className="text-yellow-700">Sources: Whole grains, fruits, vegetables, legumes, quinoa</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-6">
                    <h4 className="text-lg font-semibold text-blue-800 mb-4">Fats (30%)</h4>
                    <div className="space-y-3 text-sm">
                      <p className="text-blue-700">Crucial for hormone production, vitamin absorption, and cellular function. Essential fatty acids support brain health and reduce inflammation.</p>
                      <div className="bg-blue-100 rounded p-3">
                        <p className="text-blue-800 font-medium">Target: 0.8-1.2g per kg body weight</p>
                        <p className="text-blue-700">Sources: Nuts, olive oil, avocados, fatty fish, seeds</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Practical Applications */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Practical Applications and Success Strategies</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-lg font-semibold text-gray-800 mb-4">Implementation Guidelines</h4>
                      <div className="space-y-3">
                        <div className="border-l-4 border-blue-400 pl-4 bg-blue-50 p-3 rounded-r-lg">
                          <h5 className="font-medium text-blue-800 mb-1">Start Gradually</h5>
                          <p className="text-sm text-blue-700">Begin with small calorie adjustments (100-200 calories) and monitor progress before making larger changes to prevent metabolic adaptation.</p>
                        </div>
                        <div className="border-l-4 border-green-400 pl-4 bg-green-50 p-3 rounded-r-lg">
                          <h5 className="font-medium text-green-800 mb-1">Track Consistently</h5>
                          <p className="text-sm text-green-700">Use food tracking apps and body measurements to monitor progress and adjust calorie intake based on real-world results rather than calculations alone.</p>
                        </div>
                        <div className="border-l-4 border-purple-400 pl-4 bg-purple-50 p-3 rounded-r-lg">
                          <h5 className="font-medium text-purple-800 mb-1">Periodize Approach</h5>
                          <p className="text-sm text-purple-700">Cycle between deficit, maintenance, and surplus phases to prevent metabolic slowdown and optimize long-term body composition changes.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-lg font-semibold text-gray-800 mb-4">Common Mistakes to Avoid</h4>
                      <div className="space-y-3">
                        <div className="border-l-4 border-red-400 pl-4 bg-red-50 p-3 rounded-r-lg">
                          <h5 className="font-medium text-red-800 mb-1">Extreme Deficits</h5>
                          <p className="text-sm text-red-700">Avoid deficits larger than 25% of TDEE, which can lead to muscle loss, metabolic slowdown, and nutritional deficiencies.</p>
                        </div>
                        <div className="border-l-4 border-orange-400 pl-4 bg-orange-50 p-3 rounded-r-lg">
                          <h5 className="font-medium text-orange-800 mb-1">Ignoring Activity Changes</h5>
                          <p className="text-sm text-orange-700">Adjust calorie intake when exercise routines change, as activity level significantly impacts total daily energy expenditure.</p>
                        </div>
                        <div className="border-l-4 border-yellow-400 pl-4 bg-yellow-50 p-3 rounded-r-lg">
                          <h5 className="font-medium text-yellow-800 mb-1">Static Approach</h5>
                          <p className="text-sm text-yellow-700">Regularly recalculate BMR and TDEE as body weight and composition change to maintain accurate calorie targets.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* FAQ Section */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-8">Frequently Asked Questions</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">How accurate is the BMR calculation?</h4>
                      <p className="text-gray-600 text-sm">The Mifflin-St Jeor equation used in our calculator is accurate within ±10% for about 90% of the population. Individual variations exist due to genetics, body composition, and metabolic health, so use results as starting points and adjust based on real-world progress.</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">Should I eat below my BMR for weight loss?</h4>
                      <p className="text-gray-600 text-sm">Generally no. Eating significantly below BMR can slow metabolism, cause muscle loss, and lead to nutritional deficiencies. Focus on creating moderate deficits from TDEE (10-25% below maintenance) for sustainable fat loss while preserving lean muscle mass.</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">How often should I recalculate my BMR?</h4>
                      <p className="text-gray-600 text-sm">Recalculate BMR every 10-15 pounds of weight change or every 2-3 months during active weight management. Body composition changes, age, and activity level modifications all affect metabolic rate and require calorie adjustments.</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">Why is my actual weight loss different from predictions?</h4>
                      <p className="text-gray-600 text-sm">Weight loss predictions are estimates based on average metabolic responses. Individual factors like water retention, hormonal fluctuations, measurement errors, and metabolic adaptation can cause variations from predicted results.</p>
                    </div>
                  </div>
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">Can medications affect BMR calculations?</h4>
                      <p className="text-gray-600 text-sm">Yes, certain medications including thyroid hormones, beta-blockers, antidepressants, and diabetes medications can significantly impact metabolic rate. Consult healthcare providers when using BMR calculations if you're taking medications that affect metabolism.</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">Do I need to adjust calories on rest days?</h4>
                      <p className="text-gray-600 text-sm">This depends on your goals and training intensity. For moderate exercise routines, maintaining consistent daily intake is often easier. For intense training programs, consider slightly reducing calories on complete rest days while maintaining adequate protein intake.</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">How does age affect BMR and calorie needs?</h4>
                      <p className="text-gray-600 text-sm">BMR typically decreases by 1-2% per decade after age 30 due to natural muscle loss and hormonal changes. However, regular strength training and maintaining active lifestyles can significantly slow this decline and preserve metabolic rate.</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">Should athletes use different BMR calculations?</h4>
                      <p className="text-gray-600 text-sm">Athletes with very high muscle mass may have BMRs 10-20% higher than predicted by standard equations. Consider using body composition-based calculations or working with sports nutritionists for more accurate assessments in athletic populations.</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Scientific Background */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Scientific Foundation and Research</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="space-y-4 text-gray-600">
                    <h4 className="text-lg font-semibold text-gray-900">Historical Development</h4>
                    <p className="text-sm">
                      The concept of basal metabolic rate was first established in the early 1900s by scientists studying human energy expenditure. The Harris-Benedict equation (1919) was the first widely used BMR formula, later refined by the more accurate Mifflin-St Jeor equation (1990) that our calculator employs.
                    </p>
                    <p className="text-sm">
                      Modern research has validated BMR calculations through indirect calorimetry studies involving thousands of subjects across diverse populations, establishing the reliability of these formulas for general health and fitness applications.
                    </p>
                    <h4 className="text-lg font-semibold text-gray-900">Clinical Applications</h4>
                    <p className="text-sm">
                      Healthcare professionals use BMR calculations for medical nutrition therapy, weight management programs, and metabolic disorder diagnosis. Research continues to refine these equations for specific populations, including athletes, elderly individuals, and those with metabolic conditions.
                    </p>
                  </div>
                  <div className="space-y-4 text-gray-600">
                    <h4 className="text-lg font-semibold text-gray-900">Current Research Trends</h4>
                    <p className="text-sm">
                      Contemporary research focuses on personalized nutrition approaches, investigating how genetic factors, gut microbiome, and circadian rhythms influence individual metabolic rates and calorie requirements beyond traditional BMR calculations.
                    </p>
                    <p className="text-sm">
                      Studies on metabolic flexibility, intermittent fasting, and time-restricted eating are expanding our understanding of how meal timing and frequency affect total daily energy expenditure and weight management outcomes.
                    </p>
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 mt-6">
                      <h4 className="font-semibold text-blue-800 mb-2">Evidence-Based Approach</h4>
                      <p className="text-sm text-blue-700">
                        Our calculator incorporates the latest scientific research to provide accurate, evidence-based calorie recommendations that serve as reliable starting points for achieving your health and fitness goals through proper nutrition planning.
                      </p>
                    </div>
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

export default BMRCalorieCalculator;
