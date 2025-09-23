
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
      const inchesValue = parseFloat(inches) || 0;
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
    let healthScore = 50;
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

    // Additional lifestyle factors
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

  const resetCalculator = () => {
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-50">
      <Helmet>
        <title>Metabolic Age Calculator - Free Health & Longevity Assessment Tool | DapsiWow</title>
        <meta name="description" content="Calculate your metabolic age based on lifestyle factors, fitness level, and health metrics. Get personalized recommendations to improve your metabolic health and longevity with our comprehensive analysis tool." />
        <meta name="keywords" content="metabolic age calculator, biological age calculator, health assessment, longevity calculator, metabolic health, fitness age, wellness assessment, anti-aging tool, health metrics, lifestyle assessment" />
        <meta property="og:title" content="Metabolic Age Calculator - Free Health & Longevity Assessment Tool | DapsiWow" />
        <meta property="og:description" content="Calculate your metabolic age based on lifestyle factors, fitness level, and health metrics. Get personalized recommendations to improve your metabolic health and longevity." />
        <meta property="og:type" content="website" />
        <meta name="robots" content="index, follow" />
        <meta name="author" content="DapsiWow" />
        <link rel="canonical" href="https://dapsiwow.com/tools/metabolic-age-calculator" />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            "name": "Metabolic Age Calculator",
            "description": "Professional metabolic age calculator for assessing biological age based on lifestyle factors, health metrics, and fitness level with personalized improvement recommendations.",
            "url": "https://dapsiwow.com/tools/metabolic-age-calculator",
            "applicationCategory": "HealthApplication",
            "operatingSystem": "Any",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "USD"
            },
            "featureList": [
              "Calculate metabolic age vs chronological age",
              "Comprehensive lifestyle assessment",
              "Health score analysis",
              "Personalized improvement recommendations",
              "Multiple health metric inputs"
            ]
          })}
        </script>
      </Helmet>

      <Header />

      <main>
        {/* Hero Section */}
        <section className="relative py-12 sm:py-16 md:py-20 lg:py-28 xl:py-32 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-600/10 to-indigo-600/20"></div>
          <div className="relative max-w-sm sm:max-w-lg md:max-w-2xl lg:max-w-4xl xl:max-w-5xl 2xl:max-w-6xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 text-center">
            <div className="space-y-4 sm:space-y-6 md:space-y-8">
              <div className="inline-flex items-center px-3 py-1.5 sm:px-4 sm:py-2 bg-white/80 backdrop-blur-sm rounded-full border border-purple-200">
                <span className="text-xs sm:text-sm font-medium text-purple-700">Health Assessment Tool</span>
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl 2xl:text-8xl font-bold text-slate-900 leading-tight tracking-tight">
                <span className="block">Metabolic Age</span>
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-600 mt-1 sm:mt-2">
                  Calculator
                </span>
              </h1>
              <p className="text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl text-slate-600 max-w-sm sm:max-w-lg md:max-w-2xl lg:max-w-3xl xl:max-w-4xl mx-auto leading-relaxed px-2 sm:px-0">
                Discover your metabolic age based on lifestyle factors and health metrics. Get personalized insights to optimize your health and longevity.
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
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">Health Assessment</h2>
                    <p className="text-gray-600">Enter your lifestyle and health information</p>
                  </div>

                  <div className="space-y-6">
                    {/* Unit System */}
                    <div className="space-y-3">
                      <Label className="text-sm font-semibold text-gray-800 uppercase tracking-wide">Unit System</Label>
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
                          className="h-14 text-lg border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-purple-500"
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
                            className="h-14 text-lg border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-purple-500"
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
                            className="h-14 text-lg border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-purple-500"
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
                            className="h-14 text-lg border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-purple-500"
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
                            className="h-14 text-lg border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-purple-500"
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
                            className="h-14 text-lg border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-purple-500"
                            data-testid="input-inches"
                          />
                        </div>
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
                      <div className="space-y-3">
                        <Label htmlFor="sleep-hours" className="text-sm font-semibold text-gray-800 uppercase tracking-wide">Sleep Hours/Night</Label>
                        <Input
                          id="sleep-hours"
                          type="number"
                          placeholder="8"
                          step="0.5"
                          value={sleepHours}
                          onChange={(e) => setSleepHours(e.target.value)}
                          className="h-14 text-lg border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-purple-500"
                          data-testid="input-sleep-hours"
                        />
                      </div>
                      <div className="space-y-3">
                        <Label htmlFor="sleep-quality" className="text-sm font-semibold text-gray-800 uppercase tracking-wide">Sleep Quality</Label>
                        <Select value={sleepQuality} onValueChange={setSleepQuality}>
                          <SelectTrigger className="h-14 border-2 border-gray-200 rounded-xl text-lg" data-testid="select-sleep-quality">
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
                      <div className="space-y-3">
                        <Label htmlFor="stress-level" className="text-sm font-semibold text-gray-800 uppercase tracking-wide">Stress Level</Label>
                        <Select value={stressLevel} onValueChange={setStressLevel}>
                          <SelectTrigger className="h-14 border-2 border-gray-200 rounded-xl text-lg" data-testid="select-stress-level">
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
                      <div className="space-y-3">
                        <Label htmlFor="diet-quality" className="text-sm font-semibold text-gray-800 uppercase tracking-wide">Diet Quality</Label>
                        <Select value={dietQuality} onValueChange={setDietQuality}>
                          <SelectTrigger className="h-14 border-2 border-gray-200 rounded-xl text-lg" data-testid="select-diet-quality">
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

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4 pt-6">
                      <Button
                        onClick={calculateMetabolicAge}
                        className="flex-1 h-14 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold text-lg rounded-xl shadow-lg transform transition-all duration-200 hover:scale-105"
                        data-testid="button-calculate"
                      >
                        Calculate Metabolic Age
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
                </div>

                {/* Results Section */}
                <div className="bg-gradient-to-br from-gray-50 to-purple-50 p-8 lg:p-12">
                  <h2 className="text-2xl font-bold text-gray-900 mb-8">Metabolic Age Analysis</h2>

                  {result ? (
                    <div className="space-y-6" data-testid="results-section">
                      {/* Metabolic Age Result */}
                      <div className="bg-white rounded-2xl p-6 shadow-lg border border-purple-100">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">Your Metabolic Age</h3>
                        <div className="text-center">
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
                      <div className="bg-white rounded-2xl p-6 shadow-lg border border-indigo-100">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">Health Score</h3>
                        <div className="text-center">
                          <div className="text-3xl font-bold text-indigo-600" data-testid="result-health-score">
                            {result.healthScore}/100
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-3 mt-3">
                            <div 
                              className="bg-gradient-to-r from-indigo-500 to-purple-500 h-3 rounded-full transition-all duration-500"
                              style={{ width: `${result.healthScore}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>

                      {/* Metabolic Metrics */}
                      <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">Metabolic Metrics</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="text-center p-3 bg-orange-50 rounded-lg">
                            <div className="text-lg font-bold text-orange-600" data-testid="result-bmr">
                              {result.bmr}
                            </div>
                            <div className="text-xs text-gray-600">BMR (cal/day)</div>
                          </div>
                          <div className="text-center p-3 bg-green-50 rounded-lg">
                            <div className="text-lg font-bold text-green-600" data-testid="result-recommended-calories">
                              {result.recommendedCalories}
                            </div>
                            <div className="text-xs text-gray-600">Daily Calories</div>
                          </div>
                        </div>
                      </div>

                      {/* Positive Factors */}
                      {result.positiveFactors.length > 0 && (
                        <div className="bg-green-50 rounded-2xl p-6 shadow-lg border border-green-200">
                          <h3 className="text-lg font-bold text-green-900 mb-4">Positive Health Factors</h3>
                          <div className="space-y-2">
                            {result.positiveFactors.map((factor, index) => (
                              <div key={index} className="flex items-center text-green-800">
                                <span className="text-green-600 mr-2">✓</span>
                                {factor}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Improvement Areas */}
                      {result.improvementAreas.length > 0 && (
                        <div className="bg-yellow-50 rounded-2xl p-6 shadow-lg border border-yellow-200">
                          <h3 className="text-lg font-bold text-yellow-900 mb-4">Areas for Improvement</h3>
                          <div className="space-y-2">
                            {result.improvementAreas.map((area, index) => (
                              <div key={index} className="flex items-center text-yellow-800">
                                <span className="text-yellow-600 mr-2">•</span>
                                {area}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-16" data-testid="no-results">
                      <div className="w-20 h-20 bg-gray-200 rounded-full mx-auto mb-6 flex items-center justify-center">
                        <div className="text-3xl font-bold text-gray-400">⚡</div>
                      </div>
                      <p className="text-gray-500 text-lg">Enter your health details to see metabolic age analysis</p>
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
                <h3 className="text-2xl font-bold text-gray-900 mb-6">What is a Metabolic Age Calculator?</h3>
                <div className="space-y-4 text-gray-600">
                  <p>
                    A metabolic age calculator is an advanced health assessment tool that determines your biological age 
                    based on metabolic factors and lifestyle choices. Unlike chronological age, metabolic age reflects 
                    how efficiently your body functions and burns calories compared to others your age.
                  </p>
                  <p>
                    Our comprehensive metabolic age calculator analyzes multiple health metrics including physical activity, 
                    sleep quality, stress levels, nutrition habits, and body composition to provide an accurate assessment 
                    of your metabolic health and biological aging process.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Why Use Our Metabolic Age Calculator?</h3>
                <div className="space-y-4 text-gray-600">
                  <p>
                    Understanding your metabolic age provides valuable insights into your overall health status and 
                    longevity potential. This information helps identify areas for improvement and track the effectiveness 
                    of lifestyle changes over time.
                  </p>
                  <ul className="space-y-2 list-disc list-inside">
                    <li>Comprehensive health and lifestyle assessment</li>
                    <li>Personalized improvement recommendations</li>
                    <li>BMR and calorie requirement calculations</li>
                    <li>Risk factor identification and mitigation</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Calculator Features</h3>
                <div className="space-y-3 text-gray-600">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Multi-factor metabolic age assessment</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>BMR and daily calorie calculations</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Lifestyle impact analysis</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Personalized action plans</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Health risk factor identification</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Understanding Metabolic Age</h3>
                <div className="space-y-3 text-gray-600">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-indigo-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Based on metabolic rate and efficiency</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-indigo-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Influenced by lifestyle and genetics</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-indigo-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Can be improved through healthy habits</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-indigo-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Reflects biological vs chronological aging</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-indigo-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Indicates longevity and health potential</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Additional SEO Content Sections */}
          <div className="mt-12 space-y-8">
            {/* Factors Affecting Metabolic Age */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Factors That Influence Your Metabolic Age</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-gray-800">Physical Activity</h4>
                    <p className="text-gray-600 text-sm">
                      Regular exercise, especially strength training, significantly impacts metabolic age by maintaining 
                      muscle mass and improving cardiovascular efficiency. Both aerobic exercise and resistance training 
                      contribute to a younger metabolic age by increasing daily energy expenditure and improving insulin sensitivity.
                    </p>
                  </div>
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-gray-800">Sleep Quality</h4>
                    <p className="text-gray-600 text-sm">
                      Quality sleep is essential for metabolic health and cellular repair processes. Poor sleep disrupts 
                      hormone production, increases cortisol levels, and negatively affects metabolism. Consistently getting 
                      7-9 hours of quality sleep helps maintain a younger metabolic age.
                    </p>
                  </div>
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-gray-800">Nutrition Quality</h4>
                    <p className="text-gray-600 text-sm">
                      Diet quality directly impacts metabolic efficiency and cellular aging. A diet rich in whole foods, 
                      lean proteins, healthy fats, and antioxidants supports optimal metabolism, while processed foods 
                      and excessive sugar can accelerate metabolic aging.
                    </p>
                  </div>
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-gray-800">Stress Management</h4>
                    <p className="text-gray-600 text-sm">
                      Chronic stress elevates cortisol levels, leading to metabolic dysfunction and accelerated aging. 
                      Effective stress management through meditation, yoga, or other relaxation techniques helps maintain 
                      hormonal balance and supports a younger metabolic age.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Metabolic Age by Demographics */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
                <CardContent className="p-8">
                  <h3 className="text-xl font-bold text-gray-900 mb-6">Metabolic Age by Age Group</h3>
                  <div className="space-y-4 text-gray-600">
                    <div className="text-sm">
                      <h4 className="font-semibold text-gray-800 mb-2">Ages 20-30</h4>
                      <p>Peak metabolic efficiency</p>
                      <p>Focus: Building healthy habits</p>
                    </div>
                    <div className="text-sm">
                      <h4 className="font-semibold text-gray-800 mb-2">Ages 30-50</h4>
                      <p>Gradual metabolic decline</p>
                      <p>Focus: Maintaining muscle mass</p>
                    </div>
                    <div className="text-sm">
                      <h4 className="font-semibold text-gray-800 mb-2">Ages 50+</h4>
                      <p>Accelerated metabolic changes</p>
                      <p>Focus: Active lifestyle maintenance</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
                <CardContent className="p-8">
                  <h3 className="text-xl font-bold text-gray-900 mb-6">Gender Differences</h3>
                  <div className="space-y-4 text-gray-600">
                    <div className="text-sm">
                      <h4 className="font-semibold text-gray-800 mb-2">Men</h4>
                      <p>Higher baseline BMR</p>
                      <p>More muscle mass naturally</p>
                      <p>Different hormonal influences</p>
                    </div>
                    <div className="text-sm">
                      <h4 className="font-semibold text-gray-800 mb-2">Women</h4>
                      <p>Hormonal cycle impacts</p>
                      <p>Menopause affects metabolism</p>
                      <p>Different fat distribution patterns</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
                <CardContent className="p-8">
                  <h3 className="text-xl font-bold text-gray-900 mb-6">Improvement Potential</h3>
                  <div className="space-y-4 text-gray-600">
                    <p className="text-sm">
                      Metabolic age can be improved at any chronological age through targeted lifestyle interventions.
                    </p>
                    <div className="text-sm">
                      <h4 className="font-semibold text-gray-800 mb-2">Expected Changes:</h4>
                      <p>3-6 months: Initial improvements</p>
                      <p>6-12 months: Significant changes</p>
                      <p>12+ months: Sustained benefits</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Benefits of Knowing Your Metabolic Age */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Benefits of Monitoring Your Metabolic Age</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <h4 className="font-semibold text-gray-800 mb-3">Health Insights</h4>
                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <div className="w-3 h-3 bg-green-500 rounded-full mt-1 flex-shrink-0"></div>
                        <div>
                          <h5 className="font-medium text-gray-800">Early Detection</h5>
                          <p className="text-gray-600 text-sm">Identify potential health issues before they become serious</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-3 h-3 bg-green-500 rounded-full mt-1 flex-shrink-0"></div>
                        <div>
                          <h5 className="font-medium text-gray-800">Personalized Approach</h5>
                          <p className="text-gray-600 text-sm">Tailored recommendations based on your specific metrics</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-3 h-3 bg-green-500 rounded-full mt-1 flex-shrink-0"></div>
                        <div>
                          <h5 className="font-medium text-gray-800">Progress Tracking</h5>
                          <p className="text-gray-600 text-sm">Monitor improvements over time with regular assessments</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-6">
                    <h4 className="font-semibold text-gray-800 mb-3">Lifestyle Optimization</h4>
                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <div className="w-3 h-3 bg-blue-500 rounded-full mt-1 flex-shrink-0"></div>
                        <div>
                          <h5 className="font-medium text-gray-800">Motivation</h5>
                          <p className="text-gray-600 text-sm">Clear metrics to motivate healthy lifestyle changes</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-3 h-3 bg-blue-500 rounded-full mt-1 flex-shrink-0"></div>
                        <div>
                          <h5 className="font-medium text-gray-800">Goal Setting</h5>
                          <p className="text-gray-600 text-sm">Set realistic health and fitness goals based on current status</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-3 h-3 bg-blue-500 rounded-full mt-1 flex-shrink-0"></div>
                        <div>
                          <h5 className="font-medium text-gray-800">Prevention Focus</h5>
                          <p className="text-gray-600 text-sm">Proactive approach to health and aging</p>
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
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Frequently Asked Questions</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">How accurate is this metabolic age calculator?</h4>
                      <p className="text-gray-600 text-sm">
                        Our calculator uses scientifically validated formulas and considers multiple lifestyle factors 
                        to provide a comprehensive assessment. While individual results may vary, the tool provides 
                        reliable insights into your metabolic health status and areas for improvement.
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">Can metabolic age be improved?</h4>
                      <p className="text-gray-600 text-sm">
                        Yes, metabolic age can be improved through lifestyle changes including regular exercise, 
                        better nutrition, adequate sleep, stress management, and avoiding harmful habits. Improvements 
                        can be seen within 3-6 months of consistent healthy lifestyle changes.
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">What's the difference between chronological and metabolic age?</h4>
                      <p className="text-gray-600 text-sm">
                        Chronological age is simply how many years you've been alive, while metabolic age reflects 
                        how efficiently your body functions compared to others your age. A lower metabolic age indicates 
                        better health and metabolic efficiency.
                      </p>
                    </div>
                  </div>
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">How often should I check my metabolic age?</h4>
                      <p className="text-gray-600 text-sm">
                        We recommend checking your metabolic age every 3-6 months to track progress and adjust your 
                        health strategies. This allows enough time to see meaningful changes from lifestyle modifications 
                        while maintaining motivation for continued improvement.
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">What factors have the biggest impact on metabolic age?</h4>
                      <p className="text-gray-600 text-sm">
                        Physical activity level, body composition, sleep quality, and stress management typically have 
                        the largest impact on metabolic age. Regular exercise and maintaining muscle mass are particularly 
                        important for keeping metabolic age low.
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">Should I consult a healthcare provider about my results?</h4>
                      <p className="text-gray-600 text-sm">
                        While our calculator provides valuable insights, it's always recommended to discuss your health 
                        status and any concerns with a healthcare professional, especially if your metabolic age is 
                        significantly higher than your chronological age.
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

export default MetabolicAgeCalculator;
