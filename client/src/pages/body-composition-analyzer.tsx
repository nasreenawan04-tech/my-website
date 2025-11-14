
import { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ToolSEOHead } from '@/components/seo/ToolSEOHead';
import { bodyCompositionAnalyzerSEO } from '@/config/seo/tools/body-composition-analyzer';

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
      const inchesValue = parseFloat(inches) || 0;
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
        hipCm = waistCm * 1.3;
      }
      bodyFatPercentage = 495 / (1.29579 - 0.35004 * Math.log10(waistCm + hipCm - neckCm) + 0.22100 * Math.log10(heightCm)) - 450;
    }

    bodyFatPercentage = Math.max(3, Math.min(bodyFatPercentage, 50));

    // Calculate body composition
    const fatMass = (bodyFatPercentage / 100) * weightKg;
    const leanBodyMass = weightKg - fatMass;
    const muscleMass = leanBodyMass * 0.45;
    const boneMass = weightKg * 0.15;

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
    const fat = targetCalories * 0.25 / 9;
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
    setResult(null);
  };

  const formatMeasurement = (value: number, type: 'weight' | 'percentage'): string => {
    if (type === 'percentage') {
      return `${value.toFixed(1)}%`;
    }
    return unitSystem === 'metric' ? `${value.toFixed(1)} kg` : `${(value * 2.20462).toFixed(1)} lbs`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50 to-teal-50">
      <ToolSEOHead config={bodyCompositionAnalyzerSEO} />
      <Header />

      <main>
        {/* Hero Section */}
        <section className="relative py-12 sm:py-16 md:py-20 lg:py-28 xl:py-32 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-600/10 to-teal-600/20"></div>
          <div className="relative max-w-sm sm:max-w-lg md:max-w-2xl lg:max-w-4xl xl:max-w-5xl 2xl:max-w-6xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 text-center">
            <div className="space-y-4 sm:space-y-6 md:space-y-8">
              <div className="inline-flex items-center px-3 py-1.5 sm:px-4 sm:py-2 bg-white/80 backdrop-blur-sm rounded-full border border-emerald-200">
                <span className="text-xs sm:text-sm font-medium text-emerald-700">Body Composition Analysis</span>
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl 2xl:text-8xl font-bold text-slate-900 leading-relaxed tracking-tight">
                <span className="block">Body Composition</span>
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-600 mt-1 sm:mt-2 pb-2">
                  Analyzer
                </span>
              </h1>
              <p className="text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl text-slate-600 max-w-sm sm:max-w-lg md:max-w-2xl lg:max-w-3xl xl:max-w-4xl mx-auto leading-relaxed px-2 sm:px-0">
                Get a comprehensive analysis of your body composition including body fat percentage, muscle mass, and personalized fitness recommendations
              </p>
            </div>
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-4 py-16">
          {/* Main Calculator Card */}
          <Card className="bg-white/90 backdrop-blur-sm shadow-2xl border-0 rounded-3xl overflow-hidden">
            <CardContent className="p-0">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
                {/* Input Section */}
                <div className="p-8 lg:p-12 space-y-8">
                  <div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">Body Measurements</h2>
                    <p className="text-gray-600">Enter your physical measurements and details</p>
                  </div>

                  <div className="space-y-6">
                    {/* Unit System */}
                    <div className="space-y-3">
                      <Label className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                        Unit System
                      </Label>
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
                      <div className="space-y-3">
                        <Label htmlFor="age" className="text-sm font-semibold text-gray-800 uppercase tracking-wide">Age</Label>
                        <Input
                          id="age"
                          type="number"
                          placeholder="30"
                          value={age}
                          onChange={(e) => setAge(e.target.value)}
                          className="h-14 text-lg border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-emerald-500"
                          data-testid="input-age"
                        />
                      </div>
                      <div className="space-y-3">
                        <Label htmlFor="gender" className="text-sm font-semibold text-gray-800 uppercase tracking-wide">Gender</Label>
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

                    {/* Weight and Height */}
                    {unitSystem === 'metric' ? (
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-3">
                          <Label htmlFor="weight" className="text-sm font-semibold text-gray-800 uppercase tracking-wide">Weight (kg)</Label>
                          <Input
                            id="weight"
                            type="number"
                            placeholder="70"
                            value={weight}
                            onChange={(e) => setWeight(e.target.value)}
                            className="h-14 text-lg border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-emerald-500"
                            data-testid="input-weight"
                          />
                        </div>
                        <div className="space-y-3">
                          <Label htmlFor="height" className="text-sm font-semibold text-gray-800 uppercase tracking-wide">Height (cm)</Label>
                          <Input
                            id="height"
                            type="number"
                            placeholder="175"
                            value={height}
                            onChange={(e) => setHeight(e.target.value)}
                            className="h-14 text-lg border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-emerald-500"
                            data-testid="input-height"
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-3">
                          <Label htmlFor="weight-lbs" className="text-sm font-semibold text-gray-800 uppercase tracking-wide">Weight (lbs)</Label>
                          <Input
                            id="weight-lbs"
                            type="number"
                            placeholder="154"
                            value={weight}
                            onChange={(e) => setWeight(e.target.value)}
                            className="h-14 text-lg border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-emerald-500"
                            data-testid="input-weight-imperial"
                          />
                        </div>
                        <div className="space-y-3">
                          <Label htmlFor="feet" className="text-sm font-semibold text-gray-800 uppercase tracking-wide">Height (ft)</Label>
                          <Input
                            id="feet"
                            type="number"
                            placeholder="5"
                            value={feet}
                            onChange={(e) => setFeet(e.target.value)}
                            className="h-14 text-lg border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-emerald-500"
                            data-testid="input-feet"
                          />
                        </div>
                        <div className="space-y-3">
                          <Label htmlFor="inches" className="text-sm font-semibold text-gray-800 uppercase tracking-wide">Height (in)</Label>
                          <Input
                            id="inches"
                            type="number"
                            placeholder="9"
                            value={inches}
                            onChange={(e) => setInches(e.target.value)}
                            className="h-14 text-lg border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-emerald-500"
                            data-testid="input-inches"
                          />
                        </div>
                      </div>
                    )}

                    {/* Body Measurements */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-3">
                        <Label htmlFor="neck" className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                          Neck {unitSystem === 'metric' ? '(cm)' : '(inches)'}
                        </Label>
                        <Input
                          id="neck"
                          type="number"
                          placeholder={unitSystem === 'metric' ? '38' : '15'}
                          value={neck}
                          onChange={(e) => setNeck(e.target.value)}
                          className="h-14 text-lg border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-emerald-500"
                          data-testid="input-neck"
                        />
                      </div>
                      <div className="space-y-3">
                        <Label htmlFor="waist" className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                          Waist {unitSystem === 'metric' ? '(cm)' : '(inches)'}
                        </Label>
                        <Input
                          id="waist"
                          type="number"
                          placeholder={unitSystem === 'metric' ? '85' : '33'}
                          value={waist}
                          onChange={(e) => setWaist(e.target.value)}
                          className="h-14 text-lg border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-emerald-500"
                          data-testid="input-waist"
                        />
                      </div>
                    </div>

                    {gender === 'female' && (
                      <div className="space-y-3">
                        <Label htmlFor="hip" className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                          Hip {unitSystem === 'metric' ? '(cm)' : '(inches)'} (Optional but recommended)
                        </Label>
                        <Input
                          id="hip"
                          type="number"
                          placeholder={unitSystem === 'metric' ? '95' : '37'}
                          value={hip}
                          onChange={(e) => setHip(e.target.value)}
                          className="h-14 text-lg border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-emerald-500"
                          data-testid="input-hip"
                        />
                      </div>
                    )}

                    {/* Activity Level */}
                    <div className="space-y-3">
                      <Label htmlFor="activity-level" className="text-sm font-semibold text-gray-800 uppercase tracking-wide">Activity Level</Label>
                      <Select value={activityLevel} onValueChange={setActivityLevel}>
                        <SelectTrigger className="h-14 border-2 border-gray-200 rounded-xl text-lg" data-testid="select-activity-level">
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
                    <div className="space-y-3">
                      <Label htmlFor="fitness-goal" className="text-sm font-semibold text-gray-800 uppercase tracking-wide">Fitness Goal</Label>
                      <Select value={fitnessGoal} onValueChange={setFitnessGoal}>
                        <SelectTrigger className="h-14 border-2 border-gray-200 rounded-xl text-lg" data-testid="select-fitness-goal">
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
                    <div className="flex flex-col sm:flex-row gap-4 pt-6">
                      <Button
                        onClick={calculateBodyComposition}
                        className="flex-1 h-14 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold text-lg rounded-xl shadow-lg transition-colors duration-200"
                        data-testid="button-calculate"
                      >
                        Analyze Body Composition
                      </Button>
                      <Button
                        onClick={resetForm}
                        variant="outline"
                        className="h-14 px-8 border-2 border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold text-lg rounded-xl"
                        data-testid="button-reset"
                      >
                        Reset
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Results Section */}
                <div className="bg-gradient-to-br from-gray-50 to-emerald-50 p-8 lg:p-12">
                  <h2 className="text-2xl font-bold text-gray-900 mb-8">Body Composition Analysis</h2>

                  {result ? (
                    <div className="space-y-6" data-testid="results-section">
                      {/* Body Fat Percentage */}
                      <div className="bg-white rounded-2xl p-6 shadow-lg border border-emerald-100">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">Body Fat Percentage</h3>
                        <div className="text-center p-4 bg-emerald-50 rounded-lg">
                          <div className="text-3xl font-bold text-emerald-600" data-testid="result-body-fat">
                            {formatMeasurement(result.bodyFatPercentage, 'percentage')}
                          </div>
                          <div className="text-sm text-emerald-700 mt-1">{result.bodyFatCategory}</div>
                          <div className="text-xs text-emerald-600 mt-2">
                            Healthy range: {result.healthyBodyFatMin}% - {result.healthyBodyFatMax}%
                          </div>
                        </div>
                      </div>

                      {/* Body Composition Breakdown */}
                      <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">Body Composition Breakdown</h3>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="text-center p-3 bg-blue-50 rounded-lg">
                            <div className="text-lg font-bold text-blue-600" data-testid="result-lean-mass">
                              {formatMeasurement(result.leanBodyMass, 'weight')}
                            </div>
                            <div className="text-xs text-gray-600">Lean Body Mass</div>
                          </div>
                          <div className="text-center p-3 bg-purple-50 rounded-lg">
                            <div className="text-lg font-bold text-purple-600" data-testid="result-muscle-mass">
                              {formatMeasurement(result.muscleMass, 'weight')}
                            </div>
                            <div className="text-xs text-gray-600">Muscle Mass</div>
                          </div>
                          <div className="text-center p-3 bg-red-50 rounded-lg">
                            <div className="text-lg font-bold text-red-600" data-testid="result-fat-mass">
                              {formatMeasurement(result.fatMass, 'weight')}
                            </div>
                            <div className="text-xs text-gray-600">Fat Mass</div>
                          </div>
                          <div className="text-center p-3 bg-gray-50 rounded-lg">
                            <div className="text-lg font-bold text-gray-700" data-testid="result-bmi">
                              {result.bmi.toFixed(1)}
                            </div>
                            <div className="text-xs text-gray-600">BMI - {result.bmiCategory}</div>
                          </div>
                        </div>
                      </div>

                      {/* Detailed Results Tabs */}
                      <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                        <Tabs defaultValue="nutrition" className="w-full">
                          <TabsList className="grid w-full grid-cols-3">
                            <TabsTrigger value="nutrition">Nutrition</TabsTrigger>
                            <TabsTrigger value="fitness">Fitness</TabsTrigger>
                            <TabsTrigger value="goals">Goals</TabsTrigger>
                          </TabsList>
                          
                          <TabsContent value="nutrition" className="space-y-4 mt-4">
                            <h4 className="font-semibold text-gray-900 mb-3">Daily Macro Targets</h4>
                            <div className="grid grid-cols-2 gap-4">
                              <div className="text-center p-3 bg-orange-50 rounded-lg">
                                <div className="text-lg font-bold text-orange-600" data-testid="result-calories">
                                  {result.macroTargets.calories}
                                </div>
                                <div className="text-xs text-gray-600">Calories</div>
                              </div>
                              <div className="text-center p-3 bg-orange-50 rounded-lg">
                                <div className="text-lg font-bold text-orange-600" data-testid="result-protein">
                                  {result.macroTargets.protein}g
                                </div>
                                <div className="text-xs text-gray-600">Protein</div>
                              </div>
                              <div className="text-center p-3 bg-orange-50 rounded-lg">
                                <div className="text-lg font-bold text-orange-600" data-testid="result-carbs">
                                  {result.macroTargets.carbs}g
                                </div>
                                <div className="text-xs text-gray-600">Carbs</div>
                              </div>
                              <div className="text-center p-3 bg-orange-50 rounded-lg">
                                <div className="text-lg font-bold text-orange-600" data-testid="result-fat">
                                  {result.macroTargets.fat}g
                                </div>
                                <div className="text-xs text-gray-600">Fat</div>
                              </div>
                            </div>
                          </TabsContent>
                          
                          <TabsContent value="fitness" className="space-y-4 mt-4">
                            <h4 className="font-semibold text-gray-900 mb-3">Recommended Workout Plan</h4>
                            <div className="space-y-2">
                              {result.workoutPlan.map((item, index) => (
                                <div key={index} className="flex items-start gap-2 text-sm text-gray-700">
                                  <span className="w-2 h-2 bg-emerald-500 rounded-full mt-2 flex-shrink-0"></span>
                                  {item}
                                </div>
                              ))}
                            </div>
                          </TabsContent>
                          
                          <TabsContent value="goals" className="space-y-4 mt-4">
                            <h4 className="font-semibold text-gray-900 mb-3">Body Composition Goals</h4>
                            <div className="space-y-2">
                              {result.bodyCompositionGoals.map((goal, index) => (
                                <div key={index} className="flex items-start gap-2 text-sm text-gray-700">
                                  <span className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></span>
                                  {goal}
                                </div>
                              ))}
                            </div>
                          </TabsContent>
                        </Tabs>
                      </div>

                      {/* Recommendations */}
                      <div className="bg-teal-50 rounded-2xl p-6 shadow-lg border border-teal-200">
                        <h3 className="text-lg font-bold text-teal-900 mb-4">Personalized Recommendations</h3>
                        <div className="space-y-2">
                          {result.recommendations.map((recommendation, index) => (
                            <div key={index} className="flex items-start gap-2 text-sm text-teal-800">
                              <span className="w-2 h-2 bg-teal-500 rounded-full mt-2 flex-shrink-0"></span>
                              {recommendation}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-16" data-testid="no-results">
                      <div className="w-20 h-20 bg-gray-200 rounded-full mx-auto mb-6 flex items-center justify-center">
                        <div className="text-3xl font-bold text-gray-400">%</div>
                      </div>
                      <p className="text-gray-500 text-lg">Enter your measurements to see body composition analysis</p>
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
                <h3 className="text-2xl font-bold text-gray-900 mb-6">What is Body Composition Analysis?</h3>
                <div className="space-y-4 text-gray-600">
                  <p>
                    Body composition analysis is a comprehensive assessment that breaks down your total body weight into 
                    its primary components: fat mass, lean body mass, muscle mass, and bone mass. Unlike simple weight 
                    measurements or BMI calculations, body composition analysis provides a detailed picture of your 
                    physical health and fitness level.
                  </p>
                  <p>
                    Our body composition analyzer uses the scientifically validated US Navy method to calculate body fat 
                    percentage through circumference measurements. This method is widely trusted by fitness professionals, 
                    military personnel, and healthcare providers because it's accurate, non-invasive, and accessible to everyone.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Why Use Our Body Composition Calculator?</h3>
                <div className="space-y-4 text-gray-600">
                  <p>
                    Understanding your body composition is crucial for setting realistic fitness goals, tracking progress, 
                    and optimizing your health. Our calculator goes beyond basic measurements to provide personalized 
                    recommendations for nutrition, exercise, and lifestyle modifications.
                  </p>
                  <ul className="space-y-2 list-disc list-inside">
                    <li>Accurate body fat percentage using proven US Navy method</li>
                    <li>Comprehensive muscle mass and lean body mass calculations</li>
                    <li>Personalized macro nutrition targets</li>
                    <li>Custom workout plan recommendations</li>
                    <li>Support for both metric and imperial units</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Key Body Composition Components</h3>
                <div className="space-y-3 text-gray-600">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span><strong>Body Fat Percentage:</strong> The proportion of fat tissue relative to total body weight</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span><strong>Lean Body Mass:</strong> All body weight excluding fat (muscle, bone, organs, water)</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span><strong>Muscle Mass:</strong> The total weight of skeletal muscle tissue</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span><strong>BMI Integration:</strong> Body Mass Index for additional health assessment</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Understanding Body Fat Categories</h3>
                <div className="space-y-3 text-gray-600">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span><strong>Essential Fat:</strong> Minimum fat required for basic physical and physiological health</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span><strong>Athletes:</strong> Typical range for competitive athletes and very fit individuals</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span><strong>Fitness:</strong> Acceptable range for people who exercise regularly</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span><strong>Average:</strong> Typical range for the general population</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Additional SEO Content Sections */}
          <div className="mt-12 space-y-8">
            {/* Measurement Guidelines */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Accurate Measurement Guidelines for Body Composition Analysis</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-gray-800">Measurement Techniques</h4>
                    <p className="text-gray-600 text-sm">
                      Accurate measurements are crucial for reliable body composition analysis. Use a flexible tape measure 
                      and maintain consistent positioning for all measurements. Take measurements at the same time of day, 
                      preferably in the morning before eating or drinking.
                    </p>
                    <div className="space-y-2">
                      <p className="font-semibold text-sm">Key Measurement Points:</p>
                      <ul className="space-y-1 text-xs text-gray-600">
                        <li>• Neck: Just below the Adam's apple, straight across</li>
                        <li>• Waist: At the narrowest point, usually just above the navel</li>
                        <li>• Hip (women): At the widest part of the hips</li>
                        <li>• Ensure tape is snug but not compressing the skin</li>
                      </ul>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-gray-800">Factors Affecting Accuracy</h4>
                    <p className="text-gray-600 text-sm">
                      Several factors can influence the accuracy of body composition calculations. Understanding these 
                      variables helps ensure more reliable results and better progress tracking over time.
                    </p>
                    <div className="space-y-2">
                      <p className="font-semibold text-sm">Accuracy Considerations:</p>
                      <ul className="space-y-1 text-xs text-gray-600">
                        <li>• Hydration levels can affect measurements</li>
                        <li>• Time of day impacts body measurements</li>
                        <li>• Recent meals can influence waist measurements</li>
                        <li>• Consistent measurement technique is essential</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Body Composition vs Other Methods */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
                <CardContent className="p-8">
                  <h3 className="text-xl font-bold text-gray-900 mb-6">Body Composition vs BMI</h3>
                  <div className="space-y-4 text-gray-600">
                    <p className="text-sm">
                      While BMI only considers height and weight, body composition analysis provides a complete picture 
                      of your physical makeup, distinguishing between fat and lean mass.
                    </p>
                    <div className="text-sm">
                      <h4 className="font-semibold text-gray-800 mb-2">Advantages over BMI:</h4>
                      <ul className="space-y-1 text-xs">
                        <li>• Differentiates between muscle and fat</li>
                        <li>• More accurate for athletes and active individuals</li>
                        <li>• Provides actionable fitness insights</li>
                        <li>• Better indicator of health risks</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
                <CardContent className="p-8">
                  <h3 className="text-xl font-bold text-gray-900 mb-6">US Navy Method Accuracy</h3>
                  <div className="space-y-4 text-gray-600">
                    <p className="text-sm">
                      The US Navy method is one of the most accurate field methods for estimating body fat percentage, 
                      with research showing strong correlation to more expensive laboratory methods.
                    </p>
                    <div className="text-sm">
                      <h4 className="font-semibold text-gray-800 mb-2">Method Benefits:</h4>
                      <ul className="space-y-1 text-xs">
                        <li>• Validated by extensive research</li>
                        <li>• No expensive equipment required</li>
                        <li>• Accounts for gender differences</li>
                        <li>• Widely accepted by fitness professionals</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
                <CardContent className="p-8">
                  <h3 className="text-xl font-bold text-gray-900 mb-6">Body Composition for Athletes</h3>
                  <div className="space-y-4 text-gray-600">
                    <p className="text-sm">
                      Athletes and highly active individuals often have unique body composition characteristics that 
                      require specialized analysis and interpretation.
                    </p>
                    <div className="text-sm">
                      <h4 className="font-semibold text-gray-800 mb-2">Athletic Considerations:</h4>
                      <ul className="space-y-1 text-xs">
                        <li>• Higher muscle mass affects calculations</li>
                        <li>• Sport-specific body fat ranges</li>
                        <li>• Performance vs health optimization</li>
                        <li>• Seasonal body composition changes</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Fitness and Nutrition Integration */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Integrating Body Composition with Fitness and Nutrition Goals</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <h4 className="font-semibold text-gray-800 mb-3">Nutrition Optimization</h4>
                    <div className="space-y-4">
                      <p className="text-gray-600 text-sm">
                        Body composition analysis provides the foundation for creating personalized nutrition plans. 
                        Understanding your lean body mass helps determine accurate protein requirements, while body fat 
                        percentage guides caloric intake for specific goals.
                      </p>
                      <div className="space-y-2">
                        <p className="font-semibold text-sm">Macro Calculation Benefits:</p>
                        <ul className="space-y-1 text-xs text-gray-600">
                          <li>• Protein needs based on lean mass</li>
                          <li>• Caloric targets for body composition goals</li>
                          <li>• Carbohydrate timing for muscle preservation</li>
                          <li>• Fat intake for hormonal health</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-6">
                    <h4 className="font-semibold text-gray-800 mb-3">Exercise Programming</h4>
                    <div className="space-y-4">
                      <p className="text-gray-600 text-sm">
                        Your body composition results inform optimal exercise selection and programming. Different body 
                        fat percentages and muscle mass levels require tailored approaches to resistance training, 
                        cardiovascular exercise, and recovery protocols.
                      </p>
                      <div className="space-y-2">
                        <p className="font-semibold text-sm">Training Adaptations:</p>
                        <ul className="space-y-1 text-xs text-gray-600">
                          <li>• Resistance training volume and intensity</li>
                          <li>• Cardio type and duration recommendations</li>
                          <li>• Recovery time between sessions</li>
                          <li>• Progressive overload strategies</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* FAQ Section */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Frequently Asked Questions</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">How accurate is this body composition calculator?</h4>
                      <p className="text-gray-600 text-sm">
                        Our calculator uses the US Navy method, which has been validated in multiple research studies and 
                        shows strong correlation (r = 0.85-0.95) with DEXA scans and hydrostatic weighing. While not as 
                        precise as laboratory methods, it provides reliable estimates for tracking body composition changes over time.
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">How often should I measure my body composition?</h4>
                      <p className="text-gray-600 text-sm">
                        For most people, measuring body composition every 2-4 weeks is optimal. This frequency allows 
                        enough time for meaningful changes to occur while providing regular feedback for program adjustments. 
                        Athletes or those undergoing intensive training may benefit from weekly measurements.
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">What's a healthy body fat percentage for my age and gender?</h4>
                      <p className="text-gray-600 text-sm">
                        Healthy body fat ranges vary by age and gender. Generally, men should aim for 10-20% and women 
                        16-25%. However, these ranges can vary based on individual goals, health status, and athletic 
                        requirements. Our calculator provides personalized ranges based on your specific profile.
                      </p>
                    </div>
                  </div>
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">Can body composition analysis help with weight loss goals?</h4>
                      <p className="text-gray-600 text-sm">
                        Absolutely! Body composition analysis is superior to weight alone for tracking progress. It helps 
                        distinguish between fat loss and muscle loss, ensuring your weight loss efforts are targeting 
                        the right tissue. This prevents metabolic slowdown and maintains healthy body composition during 
                        caloric restriction.
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">How does muscle mass affect my metabolism?</h4>
                      <p className="text-gray-600 text-sm">
                        Muscle tissue is metabolically active, burning calories even at rest. Each pound of muscle burns 
                        approximately 6-7 calories per day compared to 2-3 calories for fat tissue. Higher muscle mass 
                        increases your basal metabolic rate, making weight management easier and improving overall health markers.
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">What factors can affect my body composition measurements?</h4>
                      <p className="text-gray-600 text-sm">
                        Several factors can influence measurements including hydration status, time of day, recent meals, 
                        menstrual cycle (for women), and measurement technique. For most consistent results, measure at 
                        the same time of day, preferably morning after using the bathroom but before eating or drinking.
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

export default BodyCompositionAnalyzer;
