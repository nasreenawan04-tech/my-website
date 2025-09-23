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
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface MetabolicAgeResult {
  metabolicAge: number;
  chronologicalAge: number;
  ageDifference: number;
  metabolicCategory: string;
  healthScore: number;
  bmr: number;
  recommendedCalories: number;
  improvementAreas: string[];
  positiveFactors: string[];
  actionPlan: string[];
  lifeStyleImpact: {
    exercise: number;
    nutrition: number;
    sleep: number;
    stress: number;
    habits: number;
  };
  riskFactors: string[];
  metabolicHealthTips: string[];
}

const MetabolicAgeCalculator = () => {
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [feet, setFeet] = useState('');
  const [inches, setInches] = useState('');
  const [unitSystem, setUnitSystem] = useState('metric');
  const [activityLevel, setActivityLevel] = useState('');
  const [exerciseFrequency, setExerciseFrequency] = useState('');
  const [exerciseIntensity, setExerciseIntensity] = useState('');
  const [sleepHours, setSleepHours] = useState('');
  const [sleepQuality, setSleepQuality] = useState('');
  const [stressLevel, setStressLevel] = useState('');
  const [dietQuality, setDietQuality] = useState('');
  const [smokingStatus, setSmokingStatus] = useState('');
  const [alcoholConsumption, setAlcoholConsumption] = useState('');
  const [waterIntake, setWaterIntake] = useState('');
  const [muscleBuilding, setMuscleBuilding] = useState('');
  const [restingHeartRate, setRestingHeartRate] = useState('');
  const [bloodPressure, setBloodPressure] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [result, setResult] = useState<MetabolicAgeResult | null>(null);

  const calculateMetabolicAge = () => {
    // Validate inputs based on unit system
    if (!age || !gender || !weight || !activityLevel || !sleepHours || !stressLevel || !dietQuality) return;
    
    // Validate height based on unit system
    if (unitSystem === 'metric' && !height) return;
    if (unitSystem === 'imperial' && !feet) return;

    let weightKg: number;
    let heightCm: number;

    if (unitSystem === 'metric') {
      weightKg = parseFloat(weight);
      heightCm = parseFloat(height);
    } else {
      weightKg = parseFloat(weight) * 0.453592;
      const feetValue = parseFloat(feet) || 0;
      const inchesValue = parseFloat(inches) || 0; // Default to 0 if not provided
      const totalInches = (feetValue * 12) + inchesValue;
      heightCm = totalInches * 2.54;
    }

    const chronologicalAge = parseFloat(age);

    // Calculate BMR using Mifflin-St Jeor equation
    let bmr: number;
    if (gender === 'male') {
      bmr = 88.362 + (13.397 * weightKg) + (4.799 * heightCm) - (5.677 * chronologicalAge);
    } else {
      bmr = 447.593 + (9.247 * weightKg) + (3.098 * heightCm) - (4.330 * chronologicalAge);
    }

    // Calculate BMI
    const heightM = heightCm / 100;
    const bmi = weightKg / (heightM * heightM);

    // Start with chronological age
    let metabolicAge = chronologicalAge;
    let healthScore = 50; // Start neutral
    const improvementAreas: string[] = [];
    const positiveFactors: string[] = [];
    const riskFactors: string[] = [];

    // BMI impact on metabolic age
    if (bmi < 18.5) {
      metabolicAge += 2;
      healthScore -= 10;
      improvementAreas.push('Increase healthy weight gain');
      riskFactors.push('Underweight (BMI < 18.5)');
    } else if (bmi >= 18.5 && bmi < 25) {
      metabolicAge -= 1;
      healthScore += 10;
      positiveFactors.push('Healthy BMI range');
    } else if (bmi >= 25 && bmi < 30) {
      metabolicAge += 3;
      healthScore -= 5;
      improvementAreas.push('Weight management');
      riskFactors.push('Overweight (BMI 25-29.9)');
    } else {
      metabolicAge += 6;
      healthScore -= 15;
      improvementAreas.push('Significant weight loss needed');
      riskFactors.push('Obesity (BMI ≥ 30)');
    }

    // Activity level impact
    const activityImpact: { [key: string]: number } = {
      sedentary: 4,
      light: 2,
      moderate: -1,
      active: -3,
      very_active: -5
    };
    
    metabolicAge += activityImpact[activityLevel] || 0;
    if (activityLevel === 'sedentary') {
      healthScore -= 10;
      improvementAreas.push('Increase physical activity');
      riskFactors.push('Sedentary lifestyle');
    } else if (activityLevel === 'active' || activityLevel === 'very_active') {
      healthScore += 15;
      positiveFactors.push('Regular physical activity');
    }

    // Exercise frequency and intensity
    if (exerciseFrequency) {
      const exerciseImpact: { [key: string]: number } = {
        never: 3,
        rarely: 2,
        sometimes: 0,
        regularly: -2,
        daily: -4
      };
      metabolicAge += exerciseImpact[exerciseFrequency] || 0;
      
      if (exerciseFrequency === 'never' || exerciseFrequency === 'rarely') {
        healthScore -= 8;
        improvementAreas.push('Establish regular exercise routine');
      } else if (exerciseFrequency === 'regularly' || exerciseFrequency === 'daily') {
        healthScore += 10;
        positiveFactors.push('Consistent exercise routine');
      }
    }

    if (exerciseIntensity) {
      const intensityImpact: { [key: string]: number } = {
        low: 1,
        moderate: -1,
        high: -2,
        very_high: -3
      };
      metabolicAge += intensityImpact[exerciseIntensity] || 0;
      
      if (exerciseIntensity === 'high' || exerciseIntensity === 'very_high') {
        healthScore += 8;
        positiveFactors.push('High-intensity exercise');
      }
    }

    // Sleep impact
    const sleepHoursNum = parseFloat(sleepHours);
    if (sleepHoursNum < 6) {
      metabolicAge += 4;
      healthScore -= 12;
      improvementAreas.push('Increase sleep duration');
      riskFactors.push('Insufficient sleep (< 6 hours)');
    } else if (sleepHoursNum >= 7 && sleepHoursNum <= 9) {
      metabolicAge -= 1;
      healthScore += 10;
      positiveFactors.push('Adequate sleep duration');
    } else if (sleepHoursNum > 10) {
      metabolicAge += 2;
      healthScore -= 5;
      improvementAreas.push('Optimize sleep duration');
    }

    if (sleepQuality) {
      const sleepQualityImpact: { [key: string]: number } = {
        poor: 3,
        fair: 1,
        good: -1,
        excellent: -2
      };
      metabolicAge += sleepQualityImpact[sleepQuality] || 0;
      
      if (sleepQuality === 'poor' || sleepQuality === 'fair') {
        healthScore -= 8;
        improvementAreas.push('Improve sleep quality');
      } else if (sleepQuality === 'excellent') {
        healthScore += 8;
        positiveFactors.push('High-quality sleep');
      }
    }

    // Stress level impact
    const stressImpact: { [key: string]: number } = {
      very_low: -2,
      low: -1,
      moderate: 1,
      high: 4,
      very_high: 6
    };
    
    metabolicAge += stressImpact[stressLevel] || 0;
    if (stressLevel === 'high' || stressLevel === 'very_high') {
      healthScore -= 12;
      improvementAreas.push('Stress management');
      riskFactors.push('High chronic stress');
    } else if (stressLevel === 'very_low' || stressLevel === 'low') {
      healthScore += 8;
      positiveFactors.push('Well-managed stress levels');
    }

    // Diet quality impact
    const dietImpact: { [key: string]: number } = {
      poor: 4,
      fair: 2,
      good: -1,
      excellent: -3
    };
    
    metabolicAge += dietImpact[dietQuality] || 0;
    if (dietQuality === 'poor' || dietQuality === 'fair') {
      healthScore -= 10;
      improvementAreas.push('Improve diet quality');
    } else if (dietQuality === 'excellent') {
      healthScore += 12;
      positiveFactors.push('Excellent nutrition habits');
    }

    // Smoking impact
    if (smokingStatus) {
      const smokingImpact: { [key: string]: number } = {
        never: -1,
        former: 1,
        light: 5,
        moderate: 8,
        heavy: 12
      };
      metabolicAge += smokingImpact[smokingStatus] || 0;
      
      if (smokingStatus === 'light' || smokingStatus === 'moderate' || smokingStatus === 'heavy') {
        healthScore -= 15;
        improvementAreas.push('Smoking cessation');
        riskFactors.push('Tobacco use');
      } else if (smokingStatus === 'never') {
        healthScore += 5;
        positiveFactors.push('Non-smoker');
      }
    }

    // Alcohol consumption impact
    if (alcoholConsumption) {
      const alcoholImpact: { [key: string]: number } = {
        none: 0,
        light: -1,
        moderate: 1,
        heavy: 4,
        excessive: 7
      };
      metabolicAge += alcoholImpact[alcoholConsumption] || 0;
      
      if (alcoholConsumption === 'heavy' || alcoholConsumption === 'excessive') {
        healthScore -= 10;
        improvementAreas.push('Reduce alcohol consumption');
        riskFactors.push('Excessive alcohol consumption');
      } else if (alcoholConsumption === 'light') {
        healthScore += 3;
        positiveFactors.push('Moderate alcohol consumption');
      }
    }

    // Water intake impact
    if (waterIntake) {
      const waterImpact: { [key: string]: number } = {
        very_low: 2,
        low: 1,
        adequate: -1,
        high: -1
      };
      metabolicAge += waterImpact[waterIntake] || 0;
      
      if (waterIntake === 'very_low' || waterIntake === 'low') {
        healthScore -= 5;
        improvementAreas.push('Increase water intake');
      } else if (waterIntake === 'adequate' || waterIntake === 'high') {
        healthScore += 5;
        positiveFactors.push('Good hydration habits');
      }
    }

    // Muscle building activities
    if (muscleBuilding) {
      const muscleImpact: { [key: string]: number } = {
        never: 2,
        rarely: 1,
        sometimes: 0,
        regularly: -2,
        very_regularly: -3
      };
      metabolicAge += muscleImpact[muscleBuilding] || 0;
      
      if (muscleBuilding === 'regularly' || muscleBuilding === 'very_regularly') {
        healthScore += 10;
        positiveFactors.push('Regular strength training');
      } else if (muscleBuilding === 'never') {
        improvementAreas.push('Add resistance training');
      }
    }

    // Resting heart rate impact
    if (restingHeartRate) {
      const rhr = parseFloat(restingHeartRate);
      if (rhr < 60) {
        metabolicAge -= 2;
        healthScore += 8;
        positiveFactors.push('Excellent cardiovascular fitness');
      } else if (rhr >= 60 && rhr <= 70) {
        metabolicAge -= 1;
        healthScore += 5;
        positiveFactors.push('Good cardiovascular fitness');
      } else if (rhr > 80) {
        metabolicAge += 3;
        healthScore -= 8;
        improvementAreas.push('Improve cardiovascular fitness');
        riskFactors.push('Elevated resting heart rate');
      }
    }

    // Blood pressure impact
    if (bloodPressure) {
      const bpImpact: { [key: string]: number } = {
        low: 1,
        normal: -1,
        elevated: 2,
        high_stage1: 4,
        high_stage2: 6,
        crisis: 8
      };
      metabolicAge += bpImpact[bloodPressure] || 0;
      
      if (bloodPressure === 'high_stage1' || bloodPressure === 'high_stage2' || bloodPressure === 'crisis') {
        healthScore -= 12;
        improvementAreas.push('Blood pressure management');
        riskFactors.push('High blood pressure');
      } else if (bloodPressure === 'normal') {
        healthScore += 8;
        positiveFactors.push('Healthy blood pressure');
      }
    }

    // Ensure metabolic age is within reasonable bounds
    metabolicAge = Math.max(15, Math.min(metabolicAge, 80));
    healthScore = Math.max(0, Math.min(healthScore, 100));

    const ageDifference = metabolicAge - chronologicalAge;

    // Determine metabolic category
    let metabolicCategory: string;
    if (ageDifference <= -5) {
      metabolicCategory = 'Excellent - Much younger than chronological age';
    } else if (ageDifference <= -2) {
      metabolicCategory = 'Very Good - Younger than chronological age';
    } else if (ageDifference <= 2) {
      metabolicCategory = 'Good - Close to chronological age';
    } else if (ageDifference <= 5) {
      metabolicCategory = 'Fair - Slightly older than chronological age';
    } else {
      metabolicCategory = 'Needs Improvement - Much older than chronological age';
    }

    // Calculate lifestyle impact scores
    const lifeStyleImpact = {
      exercise: Math.max(0, 100 - (activityLevel === 'sedentary' ? 40 : activityLevel === 'light' ? 20 : 0)),
      nutrition: Math.max(0, 100 - (dietQuality === 'poor' ? 40 : dietQuality === 'fair' ? 20 : 0)),
      sleep: Math.max(0, 100 - (sleepHoursNum < 6 ? 40 : sleepQuality === 'poor' ? 30 : 0)),
      stress: Math.max(0, 100 - (stressLevel === 'very_high' ? 50 : stressLevel === 'high' ? 30 : 0)),
      habits: Math.max(0, 100 - (smokingStatus === 'heavy' ? 50 : alcoholConsumption === 'excessive' ? 30 : 0))
    };

    // Calculate recommended calories
    const activityMultipliers: { [key: string]: number } = {
      sedentary: 1.2,
      light: 1.375,
      moderate: 1.55,
      active: 1.725,
      very_active: 1.9
    };
    const recommendedCalories = bmr * (activityMultipliers[activityLevel] || 1.55);

    // Generate action plan
    const actionPlan: string[] = [];
    if (improvementAreas.includes('Increase physical activity')) {
      actionPlan.push('Start with 150 minutes of moderate exercise per week');
    }
    if (improvementAreas.includes('Weight management')) {
      actionPlan.push('Create a sustainable calorie deficit through diet and exercise');
    }
    if (improvementAreas.includes('Improve sleep quality')) {
      actionPlan.push('Establish a consistent sleep schedule and bedtime routine');
    }
    if (improvementAreas.includes('Stress management')) {
      actionPlan.push('Practice stress-reduction techniques like meditation or yoga');
    }
    if (improvementAreas.includes('Improve diet quality')) {
      actionPlan.push('Focus on whole foods, fruits, vegetables, and lean proteins');
    }
    if (actionPlan.length === 0) {
      actionPlan.push('Continue maintaining your excellent health habits');
      actionPlan.push('Consider consulting a healthcare provider for further optimization');
    }

    // Generate metabolic health tips
    const metabolicHealthTips = [
      'Build muscle mass through resistance training to increase metabolic rate',
      'Eat protein with every meal to support muscle maintenance',
      'Stay hydrated to support optimal cellular function',
      'Manage stress through regular relaxation practices',
      'Prioritize sleep quality for metabolic recovery',
      'Include both cardio and strength training in your routine',
      'Eat regularly to maintain stable blood sugar levels',
      'Consider intermittent fasting if appropriate for your lifestyle'
    ];

    const calculatedResult: MetabolicAgeResult = {
      metabolicAge: Math.round(metabolicAge),
      chronologicalAge,
      ageDifference: Math.round(ageDifference * 10) / 10,
      metabolicCategory,
      healthScore: Math.round(healthScore),
      bmr: Math.round(bmr),
      recommendedCalories: Math.round(recommendedCalories),
      improvementAreas,
      positiveFactors,
      actionPlan,
      lifeStyleImpact,
      riskFactors,
      metabolicHealthTips
    };

    setResult(calculatedResult);
  };

  const resetForm = () => {
    setAge('');
    setGender('');
    setWeight('');
    setHeight('');
    setFeet('');
    setInches('');
    setActivityLevel('');
    setExerciseFrequency('');
    setExerciseIntensity('');
    setSleepHours('');
    setSleepQuality('');
    setStressLevel('');
    setDietQuality('');
    setSmokingStatus('');
    setAlcoholConsumption('');
    setWaterIntake('');
    setMuscleBuilding('');
    setRestingHeartRate('');
    setBloodPressure('');
    setResult(null);
  };

  return (
    <>
      <Helmet>
        <title>Metabolic Age Calculator - Free Health & Longevity Assessment Tool | DapsiWow</title>
        <meta name="description" content="Calculate your metabolic age based on lifestyle factors, fitness level, and health metrics. Get personalized recommendations to improve your metabolic health and longevity." />
        <meta name="keywords" content="metabolic age calculator, biological age, health assessment, longevity calculator, metabolic health, fitness age, wellness assessment" />
        <meta property="og:title" content="Metabolic Age Calculator - Free Health & Longevity Assessment Tool" />
        <meta property="og:description" content="Calculate your metabolic age based on lifestyle factors, fitness level, and health metrics. Get personalized recommendations to improve your metabolic health." />
        <meta property="og:type" content="website" />
        <link rel="canonical" href="https://dapsiwow.com/tools/metabolic-age-calculator" />
      </Helmet>

      <div className="min-h-screen flex flex-col" data-testid="page-metabolic-age-calculator">
        <Header />
        
        <main className="flex-1 bg-neutral-50">
          {/* Hero Section */}
          <section className="bg-gradient-to-r from-purple-600 via-indigo-500 to-blue-700 text-white py-16">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <h1 className="text-4xl sm:text-5xl font-bold mb-6" data-testid="page-title">
                Metabolic Age Calculator
              </h1>
              <p className="text-xl mb-8 text-purple-100">
                Discover your metabolic age based on lifestyle factors and health metrics. 
                Get personalized insights to optimize your health and longevity.
              </p>
            </div>
          </section>

          {/* Calculator Section */}
          <section className="py-16">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
              <Card className="shadow-lg">
                <CardContent className="p-8">
                  <div className="grid lg:grid-cols-2 gap-8">
                    {/* Input Form */}
                    <div className="space-y-6">
                      <h2 className="text-2xl font-bold text-gray-900 mb-6">Health & Lifestyle Assessment</h2>
                      
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

                      {/* Activity Level */}
                      <div className="space-y-2">
                        <Label htmlFor="activity-level" className="text-sm font-medium">Overall Activity Level</Label>
                        <Select value={activityLevel} onValueChange={setActivityLevel}>
                          <SelectTrigger data-testid="select-activity-level">
                            <SelectValue placeholder="Select activity level" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="sedentary">Sedentary (desk job, little exercise)</SelectItem>
                            <SelectItem value="light">Light (light exercise 1-3 days/week)</SelectItem>
                            <SelectItem value="moderate">Moderate (moderate exercise 3-5 days/week)</SelectItem>
                            <SelectItem value="active">Active (hard exercise 6-7 days/week)</SelectItem>
                            <SelectItem value="very_active">Very Active (physical job + exercise)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Sleep */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="sleep-hours" className="text-sm font-medium">Sleep Hours/Night</Label>
                          <Input
                            id="sleep-hours"
                            type="number"
                            placeholder="8"
                            step="0.5"
                            value={sleepHours}
                            onChange={(e) => setSleepHours(e.target.value)}
                            data-testid="input-sleep-hours"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="sleep-quality" className="text-sm font-medium">Sleep Quality</Label>
                          <Select value={sleepQuality} onValueChange={setSleepQuality}>
                            <SelectTrigger data-testid="select-sleep-quality">
                              <SelectValue placeholder="Select quality" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="poor">Poor</SelectItem>
                              <SelectItem value="fair">Fair</SelectItem>
                              <SelectItem value="good">Good</SelectItem>
                              <SelectItem value="excellent">Excellent</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      {/* Stress and Diet */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="stress-level" className="text-sm font-medium">Stress Level</Label>
                          <Select value={stressLevel} onValueChange={setStressLevel}>
                            <SelectTrigger data-testid="select-stress-level">
                              <SelectValue placeholder="Select stress level" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="very_low">Very Low</SelectItem>
                              <SelectItem value="low">Low</SelectItem>
                              <SelectItem value="moderate">Moderate</SelectItem>
                              <SelectItem value="high">High</SelectItem>
                              <SelectItem value="very_high">Very High</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="diet-quality" className="text-sm font-medium">Diet Quality</Label>
                          <Select value={dietQuality} onValueChange={setDietQuality}>
                            <SelectTrigger data-testid="select-diet-quality">
                              <SelectValue placeholder="Select diet quality" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="poor">Poor (fast food, processed)</SelectItem>
                              <SelectItem value="fair">Fair (mixed diet)</SelectItem>
                              <SelectItem value="good">Good (mostly whole foods)</SelectItem>
                              <SelectItem value="excellent">Excellent (optimal nutrition)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      {/* Advanced Options */}
                      <Collapsible open={showAdvanced} onOpenChange={setShowAdvanced}>
                        <CollapsibleTrigger asChild>
                          <Button variant="outline" className="w-full justify-between" data-testid="toggle-advanced">
                            Advanced Options
                            {showAdvanced ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                          </Button>
                        </CollapsibleTrigger>
                        <CollapsibleContent className="space-y-4 mt-4">
                          {/* Exercise Details */}
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="exercise-frequency" className="text-sm font-medium">Exercise Frequency</Label>
                              <Select value={exerciseFrequency} onValueChange={setExerciseFrequency}>
                                <SelectTrigger data-testid="select-exercise-frequency">
                                  <SelectValue placeholder="Select frequency" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="never">Never</SelectItem>
                                  <SelectItem value="rarely">Rarely (&lt; 1x/week)</SelectItem>
                                  <SelectItem value="sometimes">Sometimes (1-2x/week)</SelectItem>
                                  <SelectItem value="regularly">Regularly (3-4x/week)</SelectItem>
                                  <SelectItem value="daily">Daily (5+ times/week)</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="exercise-intensity" className="text-sm font-medium">Exercise Intensity</Label>
                              <Select value={exerciseIntensity} onValueChange={setExerciseIntensity}>
                                <SelectTrigger data-testid="select-exercise-intensity">
                                  <SelectValue placeholder="Select intensity" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="low">Low (walking, light yoga)</SelectItem>
                                  <SelectItem value="moderate">Moderate (jogging, cycling)</SelectItem>
                                  <SelectItem value="high">High (running, HIIT)</SelectItem>
                                  <SelectItem value="very_high">Very High (competitive sports)</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>

                          {/* Lifestyle Factors */}
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="smoking-status" className="text-sm font-medium">Smoking Status</Label>
                              <Select value={smokingStatus} onValueChange={setSmokingStatus}>
                                <SelectTrigger data-testid="select-smoking-status">
                                  <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="never">Never smoked</SelectItem>
                                  <SelectItem value="former">Former smoker</SelectItem>
                                  <SelectItem value="light">Light smoker (&lt; 10/day)</SelectItem>
                                  <SelectItem value="moderate">Moderate smoker (10-20/day)</SelectItem>
                                  <SelectItem value="heavy">Heavy smoker (&gt; 20/day)</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="alcohol-consumption" className="text-sm font-medium">Alcohol Consumption</Label>
                              <Select value={alcoholConsumption} onValueChange={setAlcoholConsumption}>
                                <SelectTrigger data-testid="select-alcohol-consumption">
                                  <SelectValue placeholder="Select consumption" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="none">None</SelectItem>
                                  <SelectItem value="light">Light (1-3 drinks/week)</SelectItem>
                                  <SelectItem value="moderate">Moderate (4-7 drinks/week)</SelectItem>
                                  <SelectItem value="heavy">Heavy (8-14 drinks/week)</SelectItem>
                                  <SelectItem value="excessive">Excessive (&gt; 14 drinks/week)</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>

                          {/* Health Metrics */}
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="water-intake" className="text-sm font-medium">Daily Water Intake</Label>
                              <Select value={waterIntake} onValueChange={setWaterIntake}>
                                <SelectTrigger data-testid="select-water-intake">
                                  <SelectValue placeholder="Select intake" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="very_low">Very Low (&lt; 1L/day)</SelectItem>
                                  <SelectItem value="low">Low (1-1.5L/day)</SelectItem>
                                  <SelectItem value="adequate">Adequate (2-3L/day)</SelectItem>
                                  <SelectItem value="high">High (&gt; 3L/day)</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="muscle-building" className="text-sm font-medium">Strength Training</Label>
                              <Select value={muscleBuilding} onValueChange={setMuscleBuilding}>
                                <SelectTrigger data-testid="select-muscle-building">
                                  <SelectValue placeholder="Select frequency" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="never">Never</SelectItem>
                                  <SelectItem value="rarely">Rarely</SelectItem>
                                  <SelectItem value="sometimes">Sometimes</SelectItem>
                                  <SelectItem value="regularly">Regularly</SelectItem>
                                  <SelectItem value="very_regularly">Very Regularly</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>

                          {/* Optional Health Metrics */}
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="resting-heart-rate" className="text-sm font-medium">Resting Heart Rate (optional)</Label>
                              <Input
                                id="resting-heart-rate"
                                type="number"
                                placeholder="70"
                                value={restingHeartRate}
                                onChange={(e) => setRestingHeartRate(e.target.value)}
                                data-testid="input-resting-heart-rate"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="blood-pressure" className="text-sm font-medium">Blood Pressure (optional)</Label>
                              <Select value={bloodPressure} onValueChange={setBloodPressure}>
                                <SelectTrigger data-testid="select-blood-pressure">
                                  <SelectValue placeholder="Select range" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="low">Low (&lt; 90/60)</SelectItem>
                                  <SelectItem value="normal">Normal (90/60 - 120/80)</SelectItem>
                                  <SelectItem value="elevated">Elevated (120-129 / &lt; 80)</SelectItem>
                                  <SelectItem value="high_stage1">High Stage 1 (130-139 / 80-89)</SelectItem>
                                  <SelectItem value="high_stage2">High Stage 2 (≥ 140/90)</SelectItem>
                                  <SelectItem value="crisis">Crisis (&gt; 180/120)</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        </CollapsibleContent>
                      </Collapsible>

                      {/* Action Buttons */}
                      <div className="flex gap-4 pt-6">
                        <Button 
                          onClick={calculateMetabolicAge}
                          className="flex-1 bg-purple-600 hover:bg-purple-700"
                          data-testid="button-calculate"
                        >
                          Calculate Metabolic Age
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
                          Your Metabolic Age Analysis
                        </h2>
                        
                        {/* Metabolic Age Result */}
                        <div className="bg-gradient-to-r from-purple-50 to-indigo-50 p-6 rounded-lg">
                          <div className="text-center">
                            <h3 className="text-sm font-medium text-purple-600 mb-2">Your Metabolic Age</h3>
                            <div className="flex items-center justify-center gap-4">
                              <div>
                                <span className="text-4xl font-bold text-purple-700" data-testid="result-metabolic-age">
                                  {result.metabolicAge}
                                </span>
                                <span className="text-lg text-purple-600 ml-1">years</span>
                              </div>
                              <div className="text-2xl text-purple-400">vs</div>
                              <div>
                                <span className="text-2xl font-semibold text-gray-600" data-testid="result-chronological-age">
                                  {result.chronologicalAge}
                                </span>
                                <span className="text-sm text-gray-500 ml-1">actual</span>
                              </div>
                            </div>
                            <div className="mt-4">
                              <span className={`text-lg font-semibold ${
                                result.ageDifference <= 0 ? 'text-green-600' : 'text-orange-600'
                              }`} data-testid="result-age-difference">
                                {result.ageDifference > 0 ? '+' : ''}{result.ageDifference} years
                              </span>
                              <p className="text-sm text-purple-600 mt-1">
                                {result.metabolicCategory}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Health Score */}
                        <div className="bg-blue-50 p-4 rounded-lg">
                          <h3 className="font-semibold text-blue-900 mb-3">Overall Health Score</h3>
                          <div className="flex items-center gap-4">
                            <Progress value={result.healthScore} className="flex-1" />
                            <span className="text-2xl font-bold text-blue-700" data-testid="result-health-score">
                              {result.healthScore}/100
                            </span>
                          </div>
                        </div>

                        <Tabs defaultValue="overview" className="w-full">
                          <TabsList className="grid w-full grid-cols-4">
                            <TabsTrigger value="overview">Overview</TabsTrigger>
                            <TabsTrigger value="lifestyle">Lifestyle</TabsTrigger>
                            <TabsTrigger value="action">Action Plan</TabsTrigger>
                            <TabsTrigger value="tips">Tips</TabsTrigger>
                          </TabsList>
                          
                          <TabsContent value="overview" className="space-y-4">
                            {/* Metabolic Metrics */}
                            <div className="grid grid-cols-2 gap-4">
                              <div className="bg-orange-50 p-4 rounded-lg">
                                <h4 className="font-semibold text-orange-900">BMR</h4>
                                <p className="text-xl font-bold text-orange-700" data-testid="result-bmr">
                                  {result.bmr} cal/day
                                </p>
                              </div>
                              <div className="bg-green-50 p-4 rounded-lg">
                                <h4 className="font-semibold text-green-900">Daily Calories</h4>
                                <p className="text-xl font-bold text-green-700" data-testid="result-recommended-calories">
                                  {result.recommendedCalories} cal/day
                                </p>
                              </div>
                            </div>

                            {/* Positive Factors */}
                            {result.positiveFactors.length > 0 && (
                              <div className="bg-green-50 p-4 rounded-lg">
                                <h3 className="font-semibold text-green-900 mb-2">Positive Health Factors</h3>
                                <ul className="space-y-1">
                                  {result.positiveFactors.map((factor, index) => (
                                    <li key={index} className="text-sm text-green-800 flex items-start">
                                      <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                                      {factor}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}

                            {/* Risk Factors */}
                            {result.riskFactors.length > 0 && (
                              <div className="bg-red-50 p-4 rounded-lg">
                                <h3 className="font-semibold text-red-900 mb-2">Risk Factors to Address</h3>
                                <ul className="space-y-1">
                                  {result.riskFactors.map((factor, index) => (
                                    <li key={index} className="text-sm text-red-800 flex items-start">
                                      <span className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                                      {factor}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </TabsContent>
                          
                          <TabsContent value="lifestyle" className="space-y-4">
                            {/* Lifestyle Impact Scores */}
                            <div className="space-y-4">
                              <h3 className="font-semibold text-gray-900">Lifestyle Impact Scores</h3>
                              {Object.entries(result.lifeStyleImpact).map(([category, score]) => (
                                <div key={category} className="space-y-2">
                                  <div className="flex justify-between">
                                    <span className="capitalize text-sm font-medium">{category.replace('_', ' ')}</span>
                                    <span className="text-sm font-semibold">{score}/100</span>
                                  </div>
                                  <Progress value={score} className="h-2" />
                                </div>
                              ))}
                            </div>
                          </TabsContent>
                          
                          <TabsContent value="action" className="space-y-4">
                            {/* Improvement Areas */}
                            {result.improvementAreas.length > 0 && (
                              <div className="bg-yellow-50 p-4 rounded-lg">
                                <h3 className="font-semibold text-yellow-900 mb-2">Areas for Improvement</h3>
                                <ul className="space-y-1">
                                  {result.improvementAreas.map((area, index) => (
                                    <li key={index} className="text-sm text-yellow-800 flex items-start">
                                      <span className="w-2 h-2 bg-yellow-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                                      {area}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}

                            {/* Action Plan */}
                            <div className="bg-indigo-50 p-4 rounded-lg">
                              <h3 className="font-semibold text-indigo-900 mb-2">Personalized Action Plan</h3>
                              <ul className="space-y-1">
                                {result.actionPlan.map((action, index) => (
                                  <li key={index} className="text-sm text-indigo-800 flex items-start">
                                    <span className="w-2 h-2 bg-indigo-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                                    {action}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </TabsContent>
                          
                          <TabsContent value="tips" className="space-y-4">
                            {/* Metabolic Health Tips */}
                            <div className="bg-teal-50 p-4 rounded-lg">
                              <h3 className="font-semibold text-teal-900 mb-2">Metabolic Health Tips</h3>
                              <ul className="space-y-1">
                                {result.metabolicHealthTips.slice(0, 6).map((tip, index) => (
                                  <li key={index} className="text-sm text-teal-800 flex items-start">
                                    <span className="w-2 h-2 bg-teal-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                                    {tip}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </TabsContent>
                        </Tabs>
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
                  Understanding Metabolic Age
                </h2>
                <p className="text-xl text-gray-600">
                  Learn about the factors that influence your metabolic age and how to optimize your health
                </p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {/* What is Metabolic Age */}
                <Card className="h-full">
                  <CardContent className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-4">What is Metabolic Age?</h3>
                    <div className="space-y-3 text-gray-600 text-sm">
                      <p>
                        Metabolic age compares your metabolic health and fitness to others in your 
                        age group. It reflects how efficiently your body burns calories and processes nutrients.
                      </p>
                      <div className="space-y-2">
                        <p className="font-semibold">Key Factors:</p>
                        <ul className="space-y-1 text-xs">
                          <li>• Basal metabolic rate (BMR)</li>
                          <li>• Body composition and muscle mass</li>
                          <li>• Physical activity and fitness level</li>
                          <li>• Sleep quality and stress management</li>
                          <li>• Nutrition and lifestyle habits</li>
                        </ul>
                      </div>
                      <p>
                        A lower metabolic age indicates better health and longevity prospects 
                        compared to your chronological age.
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Improving Metabolic Age */}
                <Card className="h-full">
                  <CardContent className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Improving Your Metabolic Age</h3>
                    <div className="space-y-3 text-gray-600 text-sm">
                      <p>
                        Your metabolic age can be improved through lifestyle modifications 
                        that enhance your body's efficiency and overall health.
                      </p>
                      <div className="space-y-2">
                        <p className="font-semibold">Effective Strategies:</p>
                        <ul className="space-y-1 text-xs">
                          <li>• Build and maintain lean muscle mass</li>
                          <li>• Engage in regular cardio and strength training</li>
                          <li>• Optimize nutrition with whole foods</li>
                          <li>• Prioritize quality sleep (7-9 hours)</li>
                          <li>• Manage stress through relaxation techniques</li>
                          <li>• Stay hydrated and limit processed foods</li>
                        </ul>
                      </div>
                      <p>
                        Consistency in healthy habits leads to gradual but sustainable 
                        improvements in metabolic age over time.
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Exercise and Metabolism */}
                <Card className="h-full">
                  <CardContent className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Exercise & Metabolism</h3>
                    <div className="space-y-3 text-gray-600 text-sm">
                      <p>
                        Regular exercise is one of the most powerful tools for improving 
                        metabolic age by increasing muscle mass and metabolic efficiency.
                      </p>
                      <div className="space-y-2">
                        <p className="font-semibold">Exercise Benefits:</p>
                        <ul className="space-y-1 text-xs">
                          <li>• Increases muscle mass and BMR</li>
                          <li>• Improves insulin sensitivity</li>
                          <li>• Enhances cardiovascular health</li>
                          <li>• Reduces inflammation markers</li>
                          <li>• Supports healthy hormone levels</li>
                        </ul>
                      </div>
                      <p>
                        Combining resistance training with cardiovascular exercise provides 
                        the most comprehensive metabolic benefits.
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Nutrition Impact */}
                <Card className="h-full">
                  <CardContent className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Nutrition & Metabolic Health</h3>
                    <div className="space-y-3 text-gray-600 text-sm">
                      <p>
                        Proper nutrition supports optimal metabolic function by providing 
                        essential nutrients while maintaining healthy body composition.
                      </p>
                      <div className="space-y-2">
                        <p className="font-semibold">Metabolic-Friendly Foods:</p>
                        <ul className="space-y-1 text-xs">
                          <li>• Lean proteins (fish, poultry, legumes)</li>
                          <li>• Complex carbohydrates (whole grains, vegetables)</li>
                          <li>• Healthy fats (nuts, olive oil, avocado)</li>
                          <li>• Fiber-rich foods for gut health</li>
                          <li>• Antioxidant-rich fruits and vegetables</li>
                        </ul>
                      </div>
                      <p>
                        Avoid processed foods, excessive sugar, and trans fats which can 
                        negatively impact metabolic efficiency and accelerate aging.
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Sleep and Recovery */}
                <Card className="h-full">
                  <CardContent className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Sleep & Recovery</h3>
                    <div className="space-y-3 text-gray-600 text-sm">
                      <p>
                        Quality sleep is essential for metabolic health, affecting hormone 
                        regulation, cellular repair, and energy metabolism.
                      </p>
                      <div className="space-y-2">
                        <p className="font-semibold">Sleep Optimization:</p>
                        <ul className="space-y-1 text-xs">
                          <li>• Maintain consistent sleep schedule</li>
                          <li>• Create a cool, dark sleep environment</li>
                          <li>• Limit screens before bedtime</li>
                          <li>• Avoid caffeine late in the day</li>
                          <li>• Practice relaxation techniques</li>
                        </ul>
                      </div>
                      <p>
                        Poor sleep quality can accelerate metabolic aging by disrupting 
                        hormone balance and increasing inflammation.
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Stress Management */}
                <Card className="h-full">
                  <CardContent className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Stress & Metabolism</h3>
                    <div className="space-y-3 text-gray-600 text-sm">
                      <p>
                        Chronic stress accelerates metabolic aging through elevated cortisol 
                        levels, inflammation, and disrupted cellular function.
                      </p>
                      <div className="space-y-2">
                        <p className="font-semibold">Stress Reduction Techniques:</p>
                        <ul className="space-y-1 text-xs">
                          <li>• Regular meditation or mindfulness</li>
                          <li>• Deep breathing exercises</li>
                          <li>• Yoga or tai chi practice</li>
                          <li>• Time in nature and sunlight</li>
                          <li>• Social connections and support</li>
                          <li>• Hobbies and enjoyable activities</li>
                        </ul>
                      </div>
                      <p>
                        Effective stress management can significantly improve metabolic 
                        markers and slow the aging process.
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

export default MetabolicAgeCalculator;