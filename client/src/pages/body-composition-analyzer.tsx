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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';

interface BodyCompositionResult {
  bodyFatPercentage: number;
  leanBodyMass: number;
  muscleMass: number;
  boneMass: number;
  fatMass: number;
  bmi: number;
  bmiCategory: string;
  bodyFatCategory: string;
  healthyBodyFatMin: number;
  healthyBodyFatMax: number;
  recommendations: string[];
  macroTargets: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  workoutPlan: string[];
  bodyCompositionGoals: string[];
}

const BodyCompositionAnalyzer = () => {
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [feet, setFeet] = useState('');
  const [inches, setInches] = useState('');
  const [unitSystem, setUnitSystem] = useState('metric');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [neck, setNeck] = useState('');
  const [waist, setWaist] = useState('');
  const [hip, setHip] = useState('');
  const [activityLevel, setActivityLevel] = useState('');
  const [fitnessGoal, setFitnessGoal] = useState('');
  const [bodyType, setBodyType] = useState('');
  const [result, setResult] = useState<BodyCompositionResult | null>(null);

  const calculateBodyComposition = () => {
    // Validate inputs based on unit system
    if (!weight || !age || !gender || !neck || !waist || !activityLevel || !fitnessGoal) return;
    
    // Validate height based on unit system
    if (unitSystem === 'metric' && !height) return;
    if (unitSystem === 'imperial' && !feet) return;

    let weightKg: number;
    let heightCm: number;
    let neckCm: number;
    let waistCm: number;
    let hipCm: number = 0;

    if (unitSystem === 'metric') {
      weightKg = parseFloat(weight);
      heightCm = parseFloat(height);
      neckCm = parseFloat(neck);
      waistCm = parseFloat(waist);
      if (hip) hipCm = parseFloat(hip);
    } else {
      // Imperial system
      weightKg = parseFloat(weight) * 0.453592;
      const feetValue = parseFloat(feet) || 0;
      const inchesValue = parseFloat(inches) || 0; // Default to 0 if not provided
      const totalInches = (feetValue * 12) + inchesValue;
      heightCm = totalInches * 2.54;
      neckCm = parseFloat(neck) * 2.54;
      waistCm = parseFloat(waist) * 2.54;
      if (hip) hipCm = parseFloat(hip) * 2.54;
    }

    const ageNum = parseFloat(age);
    const heightM = heightCm / 100;

    // Calculate BMI
    const bmi = weightKg / (heightM * heightM);
    let bmiCategory = '';
    
    if (bmi < 18.5) bmiCategory = 'Underweight';
    else if (bmi < 25) bmiCategory = 'Normal weight';
    else if (bmi < 30) bmiCategory = 'Overweight';
    else bmiCategory = 'Obese';

    // Calculate body fat percentage using US Navy method
    let bodyFatPercentage: number;
    
    if (gender === 'male') {
      bodyFatPercentage = 495 / (1.0324 - 0.19077 * Math.log10(waistCm - neckCm) + 0.15456 * Math.log10(heightCm)) - 450;
    } else {
      if (hipCm === 0) {
        // Estimate hip if not provided (hip ≈ waist × 1.3 for women)
        hipCm = waistCm * 1.3;
      }
      bodyFatPercentage = 495 / (1.29579 - 0.35004 * Math.log10(waistCm + hipCm - neckCm) + 0.22100 * Math.log10(heightCm)) - 450;
    }

    // Ensure body fat percentage is within reasonable bounds
    bodyFatPercentage = Math.max(3, Math.min(bodyFatPercentage, 50));

    // Calculate body composition
    const fatMass = (bodyFatPercentage / 100) * weightKg;
    const leanBodyMass = weightKg - fatMass;
    const muscleMass = leanBodyMass * 0.45; // Approximate muscle mass from LBM
    const boneMass = weightKg * 0.15; // Approximate bone mass

    // Determine body fat category and healthy ranges
    let bodyFatCategory: string;
    let healthyBodyFatMin: number;
    let healthyBodyFatMax: number;

    if (gender === 'male') {
      healthyBodyFatMin = 10;
      healthyBodyFatMax = 20;
      if (bodyFatPercentage < 6) bodyFatCategory = 'Essential Fat';
      else if (bodyFatPercentage <= 13) bodyFatCategory = 'Athletes';
      else if (bodyFatPercentage <= 17) bodyFatCategory = 'Fitness';
      else if (bodyFatPercentage <= 25) bodyFatCategory = 'Average';
      else bodyFatCategory = 'Obese';
    } else {
      healthyBodyFatMin = 16;
      healthyBodyFatMax = 25;
      if (bodyFatPercentage < 10) bodyFatCategory = 'Essential Fat';
      else if (bodyFatPercentage <= 20) bodyFatCategory = 'Athletes';
      else if (bodyFatPercentage <= 24) bodyFatCategory = 'Fitness';
      else if (bodyFatPercentage <= 31) bodyFatCategory = 'Average';
      else bodyFatCategory = 'Obese';
    }

    // Calculate TDEE for macro targets
    let bmr: number;
    if (gender === 'male') {
      bmr = 88.362 + (13.397 * weightKg) + (4.799 * heightCm) - (5.677 * ageNum);
    } else {
      bmr = 447.593 + (9.247 * weightKg) + (3.098 * heightCm) - (4.330 * ageNum);
    }

    const activityMultipliers: { [key: string]: number } = {
      sedentary: 1.2,
      light: 1.375,
      moderate: 1.55,
      active: 1.725,
      very_active: 1.9
    };

    const tdee = bmr * (activityMultipliers[activityLevel] || 1.55);
    
    // Adjust calories based on fitness goal
    let targetCalories = tdee;
    if (fitnessGoal === 'weight_loss') targetCalories = tdee - 500;
    else if (fitnessGoal === 'muscle_gain') targetCalories = tdee + 300;
    else if (fitnessGoal === 'cutting') targetCalories = tdee - 300;
    else if (fitnessGoal === 'bulking') targetCalories = tdee + 500;

    // Calculate macro targets
    const protein = weightKg * (fitnessGoal === 'muscle_gain' || fitnessGoal === 'bulking' ? 2.2 : 1.8);
    const fat = targetCalories * 0.25 / 9; // 25% of calories from fat
    const carbs = (targetCalories - (protein * 4) - (fat * 9)) / 4;

    // Generate recommendations
    const recommendations: string[] = [];
    
    if (bodyFatPercentage < healthyBodyFatMin) {
      recommendations.push('Your body fat is below the healthy range. Consider gaining some healthy weight.');
      recommendations.push('Focus on strength training and adequate nutrition to build muscle mass.');
    } else if (bodyFatPercentage > healthyBodyFatMax) {
      recommendations.push('Your body fat is above the optimal range. Consider a fat loss program.');
      recommendations.push('Combine cardio exercise with strength training for best results.');
    } else {
      recommendations.push('Your body fat percentage is within the healthy range. Great job!');
      recommendations.push('Focus on maintaining your current body composition with regular exercise.');
    }

    if (bmi > 25) {
      recommendations.push('Your BMI indicates overweight. Consider a comprehensive fitness program.');
    } else if (bmi < 18.5) {
      recommendations.push('Your BMI indicates underweight. Focus on building muscle mass.');
    }

    recommendations.push('Stay hydrated and get adequate sleep for optimal body composition.');
    recommendations.push('Consider consulting with a fitness professional for personalized guidance.');

    // Generate workout plan
    const workoutPlan: string[] = [];
    
    if (fitnessGoal === 'weight_loss' || fitnessGoal === 'cutting') {
      workoutPlan.push('Strength training: 3-4 times per week');
      workoutPlan.push('Cardio: 4-5 times per week (20-30 minutes)');
      workoutPlan.push('HIIT: 2-3 times per week');
    } else if (fitnessGoal === 'muscle_gain' || fitnessGoal === 'bulking') {
      workoutPlan.push('Strength training: 4-5 times per week');
      workoutPlan.push('Cardio: 2-3 times per week (light to moderate)');
      workoutPlan.push('Focus on compound movements and progressive overload');
    } else {
      workoutPlan.push('Strength training: 3-4 times per week');
      workoutPlan.push('Cardio: 3-4 times per week');
      workoutPlan.push('Mix of compound and isolation exercises');
    }

    // Generate body composition goals
    const bodyCompositionGoals: string[] = [];
    
    if (bodyFatPercentage > healthyBodyFatMax) {
      const targetBodyFat = healthyBodyFatMax;
      const fatToLose = fatMass - ((targetBodyFat / 100) * weightKg);
      bodyCompositionGoals.push(`Target: Reduce body fat to ${targetBodyFat}%`);
      bodyCompositionGoals.push(`Fat to lose: ${fatToLose.toFixed(1)} kg`);
    } else if (bodyFatPercentage < healthyBodyFatMin) {
      const targetBodyFat = healthyBodyFatMin;
      bodyCompositionGoals.push(`Target: Increase body fat to ${targetBodyFat}%`);
      bodyCompositionGoals.push('Focus on building muscle mass');
    } else {
      bodyCompositionGoals.push('Maintain current body composition');
      bodyCompositionGoals.push('Focus on strength and performance gains');
    }

    const calculatedResult: BodyCompositionResult = {
      bodyFatPercentage,
      leanBodyMass,
      muscleMass,
      boneMass,
      fatMass,
      bmi,
      bmiCategory,
      bodyFatCategory,
      healthyBodyFatMin,
      healthyBodyFatMax,
      recommendations,
      macroTargets: {
        calories: Math.round(targetCalories),
        protein: Math.round(protein),
        carbs: Math.round(carbs),
        fat: Math.round(fat)
      },
      workoutPlan,
      bodyCompositionGoals
    };

    setResult(calculatedResult);
  };

  const resetForm = () => {
    setWeight('');
    setHeight('');
    setFeet('');
    setInches('');
    setAge('');
    setGender('');
    setNeck('');
    setWaist('');
    setHip('');
    setActivityLevel('');
    setFitnessGoal('');
    setBodyType('');
    setResult(null);
  };

  return (
    <>
      <Helmet>
        <title>Body Composition Analyzer - Free Body Fat & Muscle Mass Calculator | DapsiWow</title>
        <meta name="description" content="Analyze your body composition with our free calculator. Get accurate body fat percentage, muscle mass, and personalized fitness recommendations. Includes macro targets and workout plans." />
        <meta name="keywords" content="body composition analyzer, body fat calculator, muscle mass calculator, lean body mass, fitness assessment, body fat percentage" />
        <meta property="og:title" content="Body Composition Analyzer - Free Body Fat & Muscle Mass Calculator" />
        <meta property="og:description" content="Analyze your body composition with our free calculator. Get accurate body fat percentage, muscle mass, and personalized fitness recommendations." />
        <meta property="og:type" content="website" />
        <link rel="canonical" href="https://dapsiwow.com/tools/body-composition-analyzer" />
      </Helmet>

      <div className="min-h-screen flex flex-col" data-testid="page-body-composition-analyzer">
        <Header />
        
        <main className="flex-1 bg-neutral-50">
          {/* Hero Section */}
          <section className="bg-gradient-to-r from-emerald-600 via-teal-500 to-cyan-700 text-white py-16">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <h1 className="text-4xl sm:text-5xl font-bold mb-6" data-testid="page-title">
                Body Composition Analyzer
              </h1>
              <p className="text-xl mb-8 text-emerald-100">
                Get a comprehensive analysis of your body composition including body fat percentage, 
                muscle mass, and personalized fitness recommendations.
              </p>
            </div>
          </section>

          {/* Calculator Section */}
          <section className="py-16">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
              <Card className="shadow-lg">
                <CardContent className="p-8">
                  <div className="grid md:grid-cols-2 gap-8">
                    {/* Input Form */}
                    <div className="space-y-6">
                      <h2 className="text-2xl font-bold text-gray-900 mb-6">Body Measurements</h2>
                      
                      {/* Unit System */}
                      <div className="space-y-3">
                        <Label className="text-base font-medium">Unit System</Label>
                        <RadioGroup value={unitSystem} onValueChange={setUnitSystem} className="flex gap-6">
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

                      {/* Basic Information */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="age" className="text-sm font-medium">Age</Label>
                          <Input
                            id="age"
                            type="number"
                            placeholder="30"
                            value={age}
                            onChange={(e) => setAge(e.target.value)}
                            data-testid="input-age"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="gender" className="text-sm font-medium">Gender</Label>
                          <Select value={gender} onValueChange={setGender}>
                            <SelectTrigger data-testid="select-gender">
                              <SelectValue placeholder="Select gender" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="male">Male</SelectItem>
                              <SelectItem value="female">Female</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      {/* Weight and Height */}
                      {unitSystem === 'metric' ? (
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="weight" className="text-sm font-medium">Weight (kg)</Label>
                            <Input
                              id="weight"
                              type="number"
                              placeholder="70"
                              value={weight}
                              onChange={(e) => setWeight(e.target.value)}
                              data-testid="input-weight"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="height" className="text-sm font-medium">Height (cm)</Label>
                            <Input
                              id="height"
                              type="number"
                              placeholder="175"
                              value={height}
                              onChange={(e) => setHeight(e.target.value)}
                              data-testid="input-height"
                            />
                          </div>
                        </div>
                      ) : (
                        <div className="grid grid-cols-3 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="weight-lbs" className="text-sm font-medium">Weight (lbs)</Label>
                            <Input
                              id="weight-lbs"
                              type="number"
                              placeholder="154"
                              value={weight}
                              onChange={(e) => setWeight(e.target.value)}
                              data-testid="input-weight-imperial"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="feet" className="text-sm font-medium">Height (ft)</Label>
                            <Input
                              id="feet"
                              type="number"
                              placeholder="5"
                              value={feet}
                              onChange={(e) => setFeet(e.target.value)}
                              data-testid="input-feet"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="inches" className="text-sm font-medium">Height (in)</Label>
                            <Input
                              id="inches"
                              type="number"
                              placeholder="9"
                              value={inches}
                              onChange={(e) => setInches(e.target.value)}
                              data-testid="input-inches"
                            />
                          </div>
                        </div>
                      )}

                      {/* Body Measurements */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="neck" className="text-sm font-medium">
                            Neck {unitSystem === 'metric' ? '(cm)' : '(inches)'}
                          </Label>
                          <Input
                            id="neck"
                            type="number"
                            placeholder={unitSystem === 'metric' ? '38' : '15'}
                            value={neck}
                            onChange={(e) => setNeck(e.target.value)}
                            data-testid="input-neck"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="waist" className="text-sm font-medium">
                            Waist {unitSystem === 'metric' ? '(cm)' : '(inches)'}
                          </Label>
                          <Input
                            id="waist"
                            type="number"
                            placeholder={unitSystem === 'metric' ? '85' : '33'}
                            value={waist}
                            onChange={(e) => setWaist(e.target.value)}
                            data-testid="input-waist"
                          />
                        </div>
                      </div>

                      {gender === 'female' && (
                        <div className="space-y-2">
                          <Label htmlFor="hip" className="text-sm font-medium">
                            Hip {unitSystem === 'metric' ? '(cm)' : '(inches)'} (Optional but recommended)
                          </Label>
                          <Input
                            id="hip"
                            type="number"
                            placeholder={unitSystem === 'metric' ? '95' : '37'}
                            value={hip}
                            onChange={(e) => setHip(e.target.value)}
                            data-testid="input-hip"
                          />
                        </div>
                      )}

                      {/* Activity Level */}
                      <div className="space-y-2">
                        <Label htmlFor="activity-level" className="text-sm font-medium">Activity Level</Label>
                        <Select value={activityLevel} onValueChange={setActivityLevel}>
                          <SelectTrigger data-testid="select-activity-level">
                            <SelectValue placeholder="Select activity level" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="sedentary">Sedentary (little/no exercise)</SelectItem>
                            <SelectItem value="light">Light (light exercise 1-3 days/week)</SelectItem>
                            <SelectItem value="moderate">Moderate (moderate exercise 3-5 days/week)</SelectItem>
                            <SelectItem value="active">Active (hard exercise 6-7 days/week)</SelectItem>
                            <SelectItem value="very_active">Very Active (very hard exercise & physical job)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Fitness Goal */}
                      <div className="space-y-2">
                        <Label htmlFor="fitness-goal" className="text-sm font-medium">Fitness Goal</Label>
                        <Select value={fitnessGoal} onValueChange={setFitnessGoal}>
                          <SelectTrigger data-testid="select-fitness-goal">
                            <SelectValue placeholder="Select fitness goal" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="maintain">Maintain current weight</SelectItem>
                            <SelectItem value="weight_loss">Weight loss</SelectItem>
                            <SelectItem value="muscle_gain">Muscle gain</SelectItem>
                            <SelectItem value="cutting">Cutting (lose fat, maintain muscle)</SelectItem>
                            <SelectItem value="bulking">Bulking (gain muscle and weight)</SelectItem>
                            <SelectItem value="recomposition">Body recomposition</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-4 pt-6">
                        <Button 
                          onClick={calculateBodyComposition}
                          className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                          data-testid="button-calculate"
                        >
                          Analyze Body Composition
                        </Button>
                        <Button 
                          onClick={resetForm}
                          variant="outline"
                          className="flex-1"
                          data-testid="button-reset"
                        >
                          Reset
                        </Button>
                      </div>
                    </div>

                    {/* Results */}
                    {result && (
                      <div className="space-y-6">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6" data-testid="results-title">
                          Your Body Composition Analysis
                        </h2>
                        
                        <Tabs defaultValue="overview" className="w-full">
                          <TabsList className="grid w-full grid-cols-3">
                            <TabsTrigger value="overview">Overview</TabsTrigger>
                            <TabsTrigger value="nutrition">Nutrition</TabsTrigger>
                            <TabsTrigger value="fitness">Fitness</TabsTrigger>
                          </TabsList>
                          
                          <TabsContent value="overview" className="space-y-4">
                            {/* Body Fat Percentage */}
                            <div className="bg-emerald-50 p-4 rounded-lg">
                              <h3 className="font-semibold text-emerald-900 mb-2">Body Fat Percentage</h3>
                              <div className="flex items-center justify-between">
                                <span className="text-2xl font-bold text-emerald-700" data-testid="result-body-fat">
                                  {result.bodyFatPercentage.toFixed(1)}%
                                </span>
                                <span className="text-sm text-emerald-600">
                                  {result.bodyFatCategory}
                                </span>
                              </div>
                              <Progress 
                                value={(result.bodyFatPercentage / 40) * 100} 
                                className="mt-2"
                              />
                              <p className="text-xs text-emerald-600 mt-1">
                                Healthy range: {result.healthyBodyFatMin}% - {result.healthyBodyFatMax}%
                              </p>
                            </div>

                            {/* Body Composition Breakdown */}
                            <div className="grid grid-cols-2 gap-4">
                              <div className="bg-blue-50 p-4 rounded-lg">
                                <h4 className="font-semibold text-blue-900">Lean Body Mass</h4>
                                <p className="text-xl font-bold text-blue-700" data-testid="result-lean-mass">
                                  {result.leanBodyMass.toFixed(1)} kg
                                </p>
                              </div>
                              <div className="bg-purple-50 p-4 rounded-lg">
                                <h4 className="font-semibold text-purple-900">Muscle Mass</h4>
                                <p className="text-xl font-bold text-purple-700" data-testid="result-muscle-mass">
                                  {result.muscleMass.toFixed(1)} kg
                                </p>
                              </div>
                              <div className="bg-red-50 p-4 rounded-lg">
                                <h4 className="font-semibold text-red-900">Fat Mass</h4>
                                <p className="text-xl font-bold text-red-700" data-testid="result-fat-mass">
                                  {result.fatMass.toFixed(1)} kg
                                </p>
                              </div>
                              <div className="bg-gray-50 p-4 rounded-lg">
                                <h4 className="font-semibold text-gray-900">BMI</h4>
                                <p className="text-xl font-bold text-gray-700" data-testid="result-bmi">
                                  {result.bmi.toFixed(1)}
                                </p>
                                <p className="text-xs text-gray-600">{result.bmiCategory}</p>
                              </div>
                            </div>

                            {/* Body Composition Goals */}
                            <div className="bg-yellow-50 p-4 rounded-lg">
                              <h3 className="font-semibold text-yellow-900 mb-2">Body Composition Goals</h3>
                              <ul className="space-y-1">
                                {result.bodyCompositionGoals.map((goal, index) => (
                                  <li key={index} className="text-sm text-yellow-800 flex items-start">
                                    <span className="w-2 h-2 bg-yellow-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                                    {goal}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </TabsContent>
                          
                          <TabsContent value="nutrition" className="space-y-4">
                            {/* Macro Targets */}
                            <div className="bg-orange-50 p-4 rounded-lg">
                              <h3 className="font-semibold text-orange-900 mb-3">Daily Macro Targets</h3>
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <span className="text-sm text-orange-700">Calories</span>
                                  <p className="text-xl font-bold text-orange-800" data-testid="result-calories">
                                    {result.macroTargets.calories}
                                  </p>
                                </div>
                                <div>
                                  <span className="text-sm text-orange-700">Protein</span>
                                  <p className="text-xl font-bold text-orange-800" data-testid="result-protein">
                                    {result.macroTargets.protein}g
                                  </p>
                                </div>
                                <div>
                                  <span className="text-sm text-orange-700">Carbs</span>
                                  <p className="text-xl font-bold text-orange-800" data-testid="result-carbs">
                                    {result.macroTargets.carbs}g
                                  </p>
                                </div>
                                <div>
                                  <span className="text-sm text-orange-700">Fat</span>
                                  <p className="text-xl font-bold text-orange-800" data-testid="result-fat">
                                    {result.macroTargets.fat}g
                                  </p>
                                </div>
                              </div>
                            </div>
                          </TabsContent>
                          
                          <TabsContent value="fitness" className="space-y-4">
                            {/* Workout Plan */}
                            <div className="bg-indigo-50 p-4 rounded-lg">
                              <h3 className="font-semibold text-indigo-900 mb-2">Recommended Workout Plan</h3>
                              <ul className="space-y-1">
                                {result.workoutPlan.map((item, index) => (
                                  <li key={index} className="text-sm text-indigo-800 flex items-start">
                                    <span className="w-2 h-2 bg-indigo-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                                    {item}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </TabsContent>
                        </Tabs>

                        {/* Recommendations */}
                        <div className="bg-teal-50 p-4 rounded-lg">
                          <h3 className="font-semibold text-teal-900 mb-2">Personalized Recommendations</h3>
                          <ul className="space-y-1">
                            {result.recommendations.map((recommendation, index) => (
                              <li key={index} className="text-sm text-teal-800 flex items-start">
                                <span className="w-2 h-2 bg-teal-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                                {recommendation}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Educational Content */}
          <section className="py-16 bg-white">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  Understanding Body Composition
                </h2>
                <p className="text-xl text-gray-600">
                  Learn about the science behind body composition analysis and how to optimize your results
                </p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {/* Body Fat Percentage */}
                <Card className="h-full">
                  <CardContent className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Body Fat Percentage</h3>
                    <div className="space-y-3 text-gray-600 text-sm">
                      <p>
                        Body fat percentage is the proportion of fat tissue in your body compared to 
                        total body weight. It's a more accurate indicator of health than BMI alone.
                      </p>
                      <div className="space-y-2">
                        <p className="font-semibold">Healthy Ranges:</p>
                        <ul className="space-y-1 text-xs">
                          <li>• Men: 10-20% (optimal), 6-13% (athletes)</li>
                          <li>• Women: 16-25% (optimal), 10-20% (athletes)</li>
                        </ul>
                      </div>
                      <p>
                        Our calculator uses the US Navy method, which is considered one of the most 
                        accurate field methods for estimating body fat percentage.
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Lean Body Mass */}
                <Card className="h-full">
                  <CardContent className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Lean Body Mass</h3>
                    <div className="space-y-3 text-gray-600 text-sm">
                      <p>
                        Lean body mass includes all weight that is not fat - muscles, bones, organs, 
                        and water. It's crucial for metabolism and overall health.
                      </p>
                      <div className="space-y-2">
                        <p className="font-semibold">Benefits of Higher LBM:</p>
                        <ul className="space-y-1 text-xs">
                          <li>• Higher resting metabolic rate</li>
                          <li>• Better insulin sensitivity</li>
                          <li>• Improved bone density</li>
                          <li>• Enhanced physical performance</li>
                        </ul>
                      </div>
                      <p>
                        Resistance training and adequate protein intake are key to maintaining 
                        and building lean body mass.
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Body Recomposition */}
                <Card className="h-full">
                  <CardContent className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Body Recomposition</h3>
                    <div className="space-y-3 text-gray-600 text-sm">
                      <p>
                        Body recomposition involves simultaneously losing fat and gaining muscle, 
                        improving your body composition without necessarily changing weight.
                      </p>
                      <div className="space-y-2">
                        <p className="font-semibold">Key Strategies:</p>
                        <ul className="space-y-1 text-xs">
                          <li>• Progressive resistance training</li>
                          <li>• Adequate protein intake (1.6-2.2g/kg)</li>
                          <li>• Moderate caloric deficit or maintenance</li>
                          <li>• Consistent sleep and recovery</li>
                        </ul>
                      </div>
                      <p>
                        This approach is ideal for individuals who want to improve their physique 
                        and health without dramatic weight changes.
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Measurement Tips */}
                <Card className="h-full">
                  <CardContent className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Accurate Measurements</h3>
                    <div className="space-y-3 text-gray-600 text-sm">
                      <p>
                        Accurate measurements are crucial for reliable body composition analysis. 
                        Follow these guidelines for best results.
                      </p>
                      <div className="space-y-2">
                        <p className="font-semibold">Measurement Guidelines:</p>
                        <ul className="space-y-1 text-xs">
                          <li>• Measure at the same time of day</li>
                          <li>• Use a flexible tape measure</li>
                          <li>• Neck: just below the Adam's apple</li>
                          <li>• Waist: at the narrowest point</li>
                          <li>• Hip (women): at the widest point</li>
                        </ul>
                      </div>
                      <p>
                        Consistency in measurement technique and timing will provide the most 
                        accurate tracking of your progress over time.
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Nutrition for Body Composition */}
                <Card className="h-full">
                  <CardContent className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Nutrition Optimization</h3>
                    <div className="space-y-3 text-gray-600 text-sm">
                      <p>
                        Proper nutrition is fundamental to achieving your body composition goals. 
                        The right balance of macronutrients supports both fat loss and muscle gain.
                      </p>
                      <div className="space-y-2">
                        <p className="font-semibold">Macro Distribution:</p>
                        <ul className="space-y-1 text-xs">
                          <li>• Protein: 25-30% of calories</li>
                          <li>• Fat: 20-30% of calories</li>
                          <li>• Carbs: 40-55% of calories</li>
                          <li>• Adjust based on activity and goals</li>
                        </ul>
                      </div>
                      <p>
                        Focus on whole foods, adequate hydration, and consistent meal timing 
                        to optimize your body composition results.
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Training Considerations */}
                <Card className="h-full">
                  <CardContent className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Training Principles</h3>
                    <div className="space-y-3 text-gray-600 text-sm">
                      <p>
                        Effective training combines resistance exercise for muscle preservation/growth 
                        with cardiovascular exercise for heart health and calorie burn.
                      </p>
                      <div className="space-y-2">
                        <p className="font-semibold">Training Guidelines:</p>
                        <ul className="space-y-1 text-xs">
                          <li>• Resistance training: 3-5x per week</li>
                          <li>• Progressive overload is essential</li>
                          <li>• Compound movements for efficiency</li>
                          <li>• Cardio: 150-300 min moderate/week</li>
                        </ul>
                      </div>
                      <p>
                        Consistency and progressive overload in your training program are more 
                        important than perfect program design.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </section>
        </main>
        
        <Footer />
      </div>
    </>
  );
};

export default BodyCompositionAnalyzer;