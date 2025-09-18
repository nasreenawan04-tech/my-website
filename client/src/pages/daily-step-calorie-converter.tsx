
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

interface CalorieResult {
  caloriesBurned: number;
  stepCategory: string;
  distanceWalked: number;
  activityIntensity: string;
  weeklyCalories: number;
  monthlyCalories: number;
  weightLossEquivalent: number;
  stepsGoal: string;
  healthBenefits: string[];
}

const DailyStepCalorieConverter = () => {
  const [steps, setSteps] = useState('10000');
  const [weight, setWeight] = useState('70');
  const [height, setHeight] = useState('175');
  const [feet, setFeet] = useState('5');
  const [inches, setInches] = useState('9');
  const [age, setAge] = useState('30');
  const [gender, setGender] = useState('male');
  const [unitSystem, setUnitSystem] = useState('metric');
  const [intensityLevel, setIntensityLevel] = useState('moderate');
  const [result, setResult] = useState<CalorieResult | null>(null);

  const intensityLevels = {
    light: { name: 'Light pace (2 mph)', multiplier: 0.8, description: 'Slow, leisurely walking' },
    moderate: { name: 'Moderate pace (3 mph)', multiplier: 1.0, description: 'Normal walking pace' },
    brisk: { name: 'Brisk pace (4 mph)', multiplier: 1.3, description: 'Fast walking, slightly out of breath' },
    vigorous: { name: 'Vigorous pace (5+ mph)', multiplier: 1.6, description: 'Very fast walking or light jogging' }
  };

  const calculateCalories = () => {
    let weightKg: number;
    let heightM: number;

    if (unitSystem === 'metric') {
      weightKg = parseFloat(weight);
      heightM = parseFloat(height) / 100;
    } else {
      weightKg = parseFloat(weight) * 0.453592;
      const totalInches = (parseFloat(feet) * 12) + parseFloat(inches);
      heightM = totalInches * 0.0254;
    }

    const stepCount = parseFloat(steps);
    const ageYears = parseFloat(age);

    if (stepCount && weightKg && heightM && ageYears && gender) {
      let strideLength: number;
      if (gender === 'male') {
        strideLength = heightM * 0.415;
      } else {
        strideLength = heightM * 0.413;
      }

      const distanceKm = (stepCount * strideLength) / 1000;
      const distanceMiles = distanceKm * 0.621371;
      const displayDistance = unitSystem === 'metric' ? distanceKm : distanceMiles;

      const baseCaloriesPerStep = (weightKg * 0.57) / 2000;
      const intensity = intensityLevels[intensityLevel as keyof typeof intensityLevels];
      const caloriesPerStep = baseCaloriesPerStep * intensity.multiplier;
      
      let ageMultiplier = 1.0;
      if (ageYears > 40) ageMultiplier = 0.95;
      if (ageYears > 60) ageMultiplier = 0.90;
      
      let genderMultiplier = gender === 'male' ? 1.0 : 0.88;
      
      const totalCalories = stepCount * caloriesPerStep * ageMultiplier * genderMultiplier;

      let stepCategory = '';
      let stepsGoal = '';
      if (stepCount < 5000) {
        stepCategory = 'Sedentary';
        stepsGoal = 'Aim for 7,500+ steps daily';
      } else if (stepCount < 7500) {
        stepCategory = 'Lightly Active';
        stepsGoal = 'Try to reach 10,000 steps daily';
      } else if (stepCount < 10000) {
        stepCategory = 'Somewhat Active';
        stepsGoal = 'Great progress! Target 12,500 steps';
      } else if (stepCount < 12500) {
        stepCategory = 'Active';
        stepsGoal = 'Excellent! Maintain or increase';
      } else {
        stepCategory = 'Highly Active';
        stepsGoal = 'Outstanding activity level!';
      }

      const weeklyCalories = totalCalories * 7;
      const monthlyCalories = totalCalories * 30;

      const weightLossLbs = monthlyCalories / 3500;
      const weightLossKg = weightLossLbs * 0.453592;
      const weightLossDisplay = unitSystem === 'metric' ? weightLossKg : weightLossLbs;

      const healthBenefits = [
        'Improved cardiovascular health',
        'Enhanced mood and mental wellbeing',
        'Better sleep quality',
        'Increased bone density',
        'Lower risk of chronic diseases'
      ];

      setResult({
        caloriesBurned: Math.round(totalCalories * 100) / 100,
        stepCategory,
        distanceWalked: Math.round(displayDistance * 100) / 100,
        activityIntensity: intensity.name,
        weeklyCalories: Math.round(weeklyCalories),
        monthlyCalories: Math.round(monthlyCalories),
        weightLossEquivalent: Math.round(weightLossDisplay * 100) / 100,
        stepsGoal,
        healthBenefits
      });
    }
  };

  const resetCalculator = () => {
    setSteps('10000');
    setWeight('70');
    setHeight('175');
    setFeet('5');
    setInches('9');
    setAge('30');
    setGender('male');
    setIntensityLevel('moderate');
    setUnitSystem('metric');
    setResult(null);
  };

  const formatDistance = (distance: number) => {
    const unit = unitSystem === 'metric' ? 'km' : 'miles';
    return `${distance.toFixed(2)} ${unit}`;
  };

  const formatWeight = (weight: number) => {
    const unit = unitSystem === 'metric' ? 'kg' : 'lbs';
    return `${weight.toFixed(2)} ${unit}`;
  };

  const getActivityColor = (category: string) => {
    const colors = {
      'Sedentary': 'text-red-600',
      'Lightly Active': 'text-orange-600',
      'Somewhat Active': 'text-yellow-600',
      'Active': 'text-green-600',
      'Highly Active': 'text-blue-600'
    };
    return colors[category as keyof typeof colors] || 'text-gray-600';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Helmet>
        <title>Step to Calorie Converter - Calculate Calories Burned Walking | DapsiWow</title>
        <meta name="description" content="Free step to calorie converter to calculate calories burned from daily walking. Track your fitness progress with personalized step counting and distance calculations worldwide." />
        <meta name="keywords" content="step calorie calculator, steps to calories converter, walking calorie calculator, daily steps tracker, calories burned walking, step counter, walking distance calculator, fitness tracker, health calculator" />
        <meta property="og:title" content="Step to Calorie Converter - Calculate Calories Burned Walking | DapsiWow" />
        <meta property="og:description" content="Convert your daily steps to calories burned with personalized calculations. Track walking distance, weight loss potential, and fitness progress." />
        <meta property="og:type" content="website" />
        <meta name="robots" content="index, follow" />
        <meta name="author" content="DapsiWow" />
        <link rel="canonical" href="https://dapsiwow.com/tools/daily-step-calorie-converter" />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            "name": "Step to Calorie Converter",
            "description": "Free online step to calorie converter that calculates calories burned from daily walking based on personal factors like weight, height, age, and walking intensity.",
            "url": "https://dapsiwow.com/tools/daily-step-calorie-converter",
            "applicationCategory": "HealthApplication",
            "operatingSystem": "Any",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "USD"
            },
            "featureList": [
              "Calculate calories burned from steps",
              "Track walking distance",
              "Multiple unit system support",
              "Personalized calculations",
              "Weekly and monthly projections",
              "Weight loss estimation"
            ]
          })}
        </script>
      </Helmet>
      
      <Header />
      
      <main>
        {/* Hero Section */}
        <section className="relative py-12 sm:py-16 md:py-20 lg:py-24 xl:py-28 2xl:py-32 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-indigo-600/20"></div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="space-y-4 sm:space-y-6 md:space-y-7 lg:space-y-8">
              <div className="inline-flex items-center px-3 sm:px-4 py-1.5 sm:py-2 bg-white/80 backdrop-blur-sm rounded-full border border-blue-200">
                <span className="text-xs sm:text-sm font-medium text-blue-700">Professional Step Calculator</span>
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl 2xl:text-8xl font-bold text-slate-900 leading-tight tracking-tight">
                <span className="block">Step to Calorie</span>
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 mt-1 sm:mt-2">
                  Converter
                </span>
              </h1>
              <p className="text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl text-slate-600 max-w-sm sm:max-w-lg md:max-w-2xl lg:max-w-3xl xl:max-w-4xl mx-auto leading-relaxed px-2 sm:px-0">
                Convert your daily steps to calories burned with personalized calculations for optimal fitness tracking
              </p>
            </div>
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-4 py-16">
          {/* Main Calculator Card */}
          <Card className="bg-white/90 backdrop-blur-sm shadow-2xl border-0 rounded-3xl overflow-hidden">
            <CardContent className="p-0">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-0">
                {/* Input Section */}
                <div className="lg:col-span-2 p-8 lg:p-12 space-y-8">
                  <div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">Step Configuration</h2>
                    <p className="text-gray-600">Enter your personal details to get accurate calorie calculations</p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Unit System */}
                    <div className="space-y-3 md:col-span-2">
                      <Label className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                        Unit System
                      </Label>
                      <RadioGroup 
                        value={unitSystem} 
                        onValueChange={setUnitSystem}
                        className="flex gap-8"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="metric" id="metric" data-testid="radio-metric" />
                          <Label htmlFor="metric" className="font-medium">Metric (kg, cm)</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="imperial" id="imperial" data-testid="radio-imperial" />
                          <Label htmlFor="imperial" className="font-medium">Imperial (lbs, ft/in)</Label>
                        </div>
                      </RadioGroup>
                    </div>

                    {/* Daily Steps */}
                    <div className="space-y-3">
                      <Label htmlFor="steps" className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                        Daily Steps
                      </Label>
                      <Input
                        id="steps"
                        type="number"
                        value={steps}
                        onChange={(e) => setSteps(e.target.value)}
                        className="h-14 text-lg border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-blue-500"
                        placeholder="10000"
                        min="0"
                        data-testid="input-steps"
                      />
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
                            <Label htmlFor="feet" className="text-xs text-gray-500 mb-1 block">Feet</Label>
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
                            <Label htmlFor="inches" className="text-xs text-gray-500 mb-1 block">Inches</Label>
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
                        placeholder="30"
                        min="1"
                        max="120"
                        data-testid="input-age"
                      />
                    </div>

                    {/* Gender */}
                    <div className="space-y-3">
                      <Label className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                        Gender
                      </Label>
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

                    {/* Walking Intensity */}
                    <div className="space-y-3 md:col-span-2">
                      <Label className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                        Walking Intensity
                      </Label>
                      <Select value={intensityLevel} onValueChange={setIntensityLevel}>
                        <SelectTrigger className="h-14 border-2 border-gray-200 rounded-xl text-lg" data-testid="select-intensity">
                          <SelectValue placeholder="Select walking intensity" />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(intensityLevels).map(([key, level]) => (
                            <SelectItem key={key} value={key}>
                              {level.name} - {level.description}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-4 pt-6">
                    <Button
                      onClick={calculateCalories}
                      className="flex-1 h-14 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold text-lg rounded-xl shadow-lg transform transition-all duration-200 hover:scale-105"
                      data-testid="button-calculate"
                    >
                      Calculate Calories
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
                  <h2 className="text-2xl font-bold text-gray-900 mb-8">Results</h2>
                  
                  {result ? (
                    <div className="space-y-6" data-testid="calorie-results">
                      {/* Calories Burned Highlight */}
                      <div className="bg-white rounded-2xl p-6 shadow-lg border border-blue-100">
                        <div className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-2">Calories Burned</div>
                        <div className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600" data-testid="text-calories-burned">
                          {result.caloriesBurned}
                        </div>
                        <div className="text-sm text-gray-500 mt-1">From {steps} steps today</div>
                      </div>

                      {/* Activity Breakdown */}
                      <div className="space-y-4">
                        <div className="bg-white rounded-xl p-4 shadow-sm">
                          <div className="flex justify-between items-center">
                            <span className="font-medium text-gray-700">Activity Level</span>
                            <span className={`font-bold ${getActivityColor(result.stepCategory)}`} data-testid="text-activity-level">
                              {result.stepCategory}
                            </span>
                          </div>
                        </div>
                        <div className="bg-white rounded-xl p-4 shadow-sm">
                          <div className="flex justify-between items-center">
                            <span className="font-medium text-gray-700">Distance Walked</span>
                            <span className="font-bold text-gray-900" data-testid="text-distance">
                              {formatDistance(result.distanceWalked)}
                            </span>
                          </div>
                        </div>
                        <div className="bg-white rounded-xl p-4 shadow-sm">
                          <div className="flex justify-between items-center">
                            <span className="font-medium text-gray-700">Walking Pace</span>
                            <span className="font-bold text-gray-900" data-testid="text-intensity">
                              {result.activityIntensity}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Projections */}
                      <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
                        <h4 className="font-bold text-green-800 mb-4 text-lg">Calorie Projections</h4>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-green-700 font-medium">Weekly (7 days):</span>
                            <span className="font-bold text-green-800 text-lg" data-testid="text-weekly-calories">
                              {result.weeklyCalories.toLocaleString()}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-green-700 font-medium">Monthly (30 days):</span>
                            <span className="font-bold text-green-800 text-lg" data-testid="text-monthly-calories">
                              {result.monthlyCalories.toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Weight Loss Potential */}
                      <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-6 border border-purple-200">
                        <h4 className="font-bold text-purple-800 mb-4 text-lg">Weight Loss Potential</h4>
                        <div className="text-center">
                          <div className="text-3xl font-bold text-purple-800" data-testid="text-weight-loss">
                            {formatWeight(result.weightLossEquivalent)}
                          </div>
                          <div className="text-sm text-purple-600 mt-2">Per month from walking alone</div>
                        </div>
                      </div>

                      {/* Goal & Recommendation */}
                      <div className="bg-white rounded-xl p-6 shadow-sm border-l-4 border-blue-500">
                        <h4 className="font-bold text-gray-800 mb-2">Recommendation</h4>
                        <p className="text-gray-600 text-sm">{result.stepsGoal}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-16" data-testid="no-results">
                      <div className="w-20 h-20 bg-gray-200 rounded-full mx-auto mb-6 flex items-center justify-center">
                        <div className="text-3xl font-bold text-gray-400">👟</div>
                      </div>
                      <p className="text-gray-500 text-lg">Enter your details and calculate to see calorie results</p>
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
                <h3 className="text-2xl font-bold text-gray-900 mb-6">What is a Step to Calorie Converter?</h3>
                <div className="space-y-4 text-gray-600">
                  <p>
                    A step to calorie converter is a specialized fitness tool that calculates the number of calories 
                    burned from walking based on your daily step count. It considers personal factors like weight, height, 
                    age, gender, and walking intensity to provide accurate calorie expenditure estimates.
                  </p>
                  <p>
                    Our advanced converter uses scientifically proven formulas that factor in stride length calculations, 
                    metabolic rate adjustments, and activity intensity multipliers to deliver precise results. This helps 
                    you track your fitness progress and understand the real impact of your daily walking routine.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">How Do We Calculate Calories?</h3>
                <div className="space-y-4 text-gray-600">
                  <p>
                    The calculation formula: Calories = (Steps × Body Weight × Intensity × Personal Factors) ÷ 2000
                  </p>
                  <ul className="space-y-2 list-disc list-inside">
                    <li>Stride length based on height and gender</li>
                    <li>Base metabolic rate per step</li>
                    <li>Walking intensity multiplier</li>
                    <li>Age and gender adjustments</li>
                  </ul>
                  <p>
                    Our calculator provides accurate estimates by considering all these variables, making it more 
                    precise than simple step counters that don't account for individual differences.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Benefits of Step Counting</h3>
                <div className="space-y-3 text-gray-600">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Track daily physical activity easily</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Monitor calorie expenditure accurately</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Set and achieve fitness goals</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Improve cardiovascular health</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Support weight management</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Features of Our Calculator</h3>
                <div className="space-y-3 text-gray-600">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Support for metric and imperial units</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Multiple walking intensity levels</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Personalized stride length calculations</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Weekly and monthly projections</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Weight loss potential estimates</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Additional SEO Content Sections */}
          <div className="mt-12 space-y-8">
            {/* Step Goals and Guidelines */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Daily Step Goals and Health Guidelines</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-gray-800">Step Categories</h4>
                    <div className="space-y-3">
                      <div className="p-3 bg-red-50 rounded-lg border-l-4 border-red-400">
                        <div className="font-medium text-red-800">Sedentary: Under 5,000 steps</div>
                        <div className="text-sm text-red-600">Low activity level, increased health risks</div>
                      </div>
                      <div className="p-3 bg-orange-50 rounded-lg border-l-4 border-orange-400">
                        <div className="font-medium text-orange-800">Lightly Active: 5,000-7,500 steps</div>
                        <div className="text-sm text-orange-600">Some activity, room for improvement</div>
                      </div>
                      <div className="p-3 bg-yellow-50 rounded-lg border-l-4 border-yellow-400">
                        <div className="font-medium text-yellow-800">Somewhat Active: 7,500-10,000 steps</div>
                        <div className="text-sm text-yellow-600">Good activity level, approaching targets</div>
                      </div>
                      <div className="p-3 bg-green-50 rounded-lg border-l-4 border-green-400">
                        <div className="font-medium text-green-800">Active: 10,000-12,500 steps</div>
                        <div className="text-sm text-green-600">Excellent activity, meeting health guidelines</div>
                      </div>
                      <div className="p-3 bg-blue-50 rounded-lg border-l-4 border-blue-400">
                        <div className="font-medium text-blue-800">Highly Active: 12,500+ steps</div>
                        <div className="text-sm text-blue-600">Outstanding activity level, optimal health benefits</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-gray-800">Health Organization Recommendations</h4>
                    <div className="space-y-4">
                      <div className="bg-blue-50 rounded-lg p-4">
                        <h5 className="font-semibold text-blue-800 mb-2">WHO Guidelines</h5>
                        <p className="text-sm text-blue-700">Adults should accumulate at least 150 minutes of moderate-intensity physical activity weekly, approximately 7,000-10,000 steps daily.</p>
                      </div>
                      <div className="bg-green-50 rounded-lg p-4">
                        <h5 className="font-semibold text-green-800 mb-2">American Heart Association</h5>
                        <p className="text-sm text-green-700">Recommends 10,000 steps daily for cardiovascular health and weight management benefits.</p>
                      </div>
                      <div className="bg-purple-50 rounded-lg p-4">
                        <h5 className="font-semibold text-purple-800 mb-2">Mayo Clinic</h5>
                        <p className="text-sm text-purple-700">Suggests gradually increasing to 10,000 steps daily, with additional benefits up to 15,000 steps for active individuals.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Walking Intensity and Benefits */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
                <CardContent className="p-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">Walking Intensity Levels</h3>
                  <div className="space-y-4 text-gray-600">
                    <div className="border-l-4 border-blue-500 pl-4">
                      <h4 className="font-semibold text-gray-800 mb-2">Light Pace (2 mph)</h4>
                      <p className="text-sm">Leisurely walking, easy conversation possible. Ideal for beginners or recovery days. Burns fewer calories but still provides health benefits.</p>
                    </div>
                    <div className="border-l-4 border-green-500 pl-4">
                      <h4 className="font-semibold text-gray-800 mb-2">Moderate Pace (3 mph)</h4>
                      <p className="text-sm">Normal walking speed, slight increase in breathing. Most common pace for daily activities and fitness walking.</p>
                    </div>
                    <div className="border-l-4 border-orange-500 pl-4">
                      <h4 className="font-semibold text-gray-800 mb-2">Brisk Pace (4 mph)</h4>
                      <p className="text-sm">Fast walking, noticeable increase in heart rate and breathing. Excellent for cardiovascular fitness and calorie burning.</p>
                    </div>
                    <div className="border-l-4 border-red-500 pl-4">
                      <h4 className="font-semibold text-gray-800 mb-2">Vigorous Pace (5+ mph)</h4>
                      <p className="text-sm">Very fast walking or light jogging pace. Maximum calorie burn, significant cardiovascular benefits.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
                <CardContent className="p-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">Health Benefits of Walking</h3>
                  <div className="space-y-4 text-gray-600">
                    <div className="bg-red-50 rounded-lg p-4">
                      <h4 className="font-semibold text-red-800 mb-2">Cardiovascular Health</h4>
                      <p className="text-sm text-red-700">Strengthens heart muscle, improves circulation, lowers blood pressure, and reduces risk of heart disease.</p>
                    </div>
                    <div className="bg-blue-50 rounded-lg p-4">
                      <h4 className="font-semibold text-blue-800 mb-2">Weight Management</h4>
                      <p className="text-sm text-blue-700">Burns calories, increases metabolism, helps maintain healthy weight, and supports fat loss when combined with proper diet.</p>
                    </div>
                    <div className="bg-green-50 rounded-lg p-4">
                      <h4 className="font-semibold text-green-800 mb-2">Mental Wellbeing</h4>
                      <p className="text-sm text-green-700">Reduces stress and anxiety, improves mood, enhances cognitive function, and promotes better sleep quality.</p>
                    </div>
                    <div className="bg-purple-50 rounded-lg p-4">
                      <h4 className="font-semibold text-purple-800 mb-2">Bone and Muscle Health</h4>
                      <p className="text-sm text-purple-700">Increases bone density, strengthens leg muscles, improves balance and coordination, reduces fall risk.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Factors Affecting Calorie Burn */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Factors Affecting Calorie Burn from Walking</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-gray-800">Personal Factors</h4>
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                        <div>
                          <div className="font-medium text-gray-800">Body Weight</div>
                          <div className="text-sm text-gray-600">Heavier individuals burn more calories per step due to increased energy required for movement</div>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                        <div>
                          <div className="font-medium text-gray-800">Height and Stride Length</div>
                          <div className="text-sm text-gray-600">Taller people typically have longer strides, covering more distance per step</div>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                        <div>
                          <div className="font-medium text-gray-800">Age and Gender</div>
                          <div className="text-sm text-gray-600">Metabolic rate varies with age and gender, affecting calorie burn efficiency</div>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                        <div>
                          <div className="font-medium text-gray-800">Fitness Level</div>
                          <div className="text-sm text-gray-600">More fit individuals may burn calories more efficiently but can walk at higher intensities</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-gray-800">Environmental Factors</h4>
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                        <div>
                          <div className="font-medium text-gray-800">Walking Surface</div>
                          <div className="text-sm text-gray-600">Uneven terrain, sand, or grass requires more energy than smooth pavement</div>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></div>
                        <div>
                          <div className="font-medium text-gray-800">Incline and Elevation</div>
                          <div className="text-sm text-gray-600">Walking uphill significantly increases calorie burn compared to flat surfaces</div>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-teal-500 rounded-full mt-2 flex-shrink-0"></div>
                        <div>
                          <div className="font-medium text-gray-800">Weather Conditions</div>
                          <div className="text-sm text-gray-600">Wind resistance and temperature extremes can increase energy expenditure</div>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-indigo-500 rounded-full mt-2 flex-shrink-0"></div>
                        <div>
                          <div className="font-medium text-gray-800">Walking Speed</div>
                          <div className="text-sm text-gray-600">Faster walking speeds exponentially increase calorie burn per minute</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tips for Maximizing Benefits */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
                <CardContent className="p-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">Maximizing Your Walking Benefits</h3>
                  <div className="space-y-4 text-gray-600">
                    <h4 className="text-lg font-semibold text-gray-800">Increase Daily Steps</h4>
                    <ul className="space-y-2 text-sm list-disc list-inside">
                      <li>Take stairs instead of elevators or escalators</li>
                      <li>Park farther away from destinations</li>
                      <li>Walk during phone calls or meetings when possible</li>
                      <li>Take walking breaks every hour during work</li>
                      <li>Walk to nearby errands instead of driving</li>
                      <li>Use a standing desk with regular walking intervals</li>
                    </ul>
                    
                    <h4 className="text-lg font-semibold text-gray-800 mt-6">Improve Walking Technique</h4>
                    <ul className="space-y-2 text-sm list-disc list-inside">
                      <li>Maintain upright posture with relaxed shoulders</li>
                      <li>Swing arms naturally for better balance and calorie burn</li>
                      <li>Land on heel and roll through to toe</li>
                      <li>Take comfortable, natural stride lengths</li>
                      <li>Engage core muscles for stability</li>
                      <li>Breathe deeply and rhythmically</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
                <CardContent className="p-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">Walking Safety and Equipment</h3>
                  <div className="space-y-4 text-gray-600">
                    <h4 className="text-lg font-semibold text-gray-800">Essential Equipment</h4>
                    <ul className="space-y-2 text-sm list-disc list-inside">
                      <li>Supportive, comfortable walking shoes with good cushioning</li>
                      <li>Moisture-wicking clothing appropriate for weather</li>
                      <li>Step counter, fitness tracker, or smartphone app</li>
                      <li>Water bottle for hydration during longer walks</li>
                      <li>Reflective clothing or accessories for low-light conditions</li>
                      <li>Sun protection: hat, sunglasses, and sunscreen</li>
                    </ul>
                    
                    <h4 className="text-lg font-semibold text-gray-800 mt-6">Safety Guidelines</h4>
                    <ul className="space-y-2 text-sm list-disc list-inside">
                      <li>Start slowly and gradually increase intensity and duration</li>
                      <li>Stay hydrated, especially in hot weather conditions</li>
                      <li>Choose well-lit, safe routes for walking</li>
                      <li>Tell someone your walking route and expected return time</li>
                      <li>Listen to your body and rest when needed</li>
                      <li>Consult healthcare providers before starting new exercise routines</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Walking and Weight Loss */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Walking for Weight Loss and Fitness Goals</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-gray-800">Weight Loss Through Walking</h4>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      Walking is an excellent low-impact exercise for weight loss. To lose one pound of fat, you need to 
                      create a caloric deficit of approximately 3,500 calories. Our calculator helps you understand how 
                      your daily walking contributes to this goal.
                    </p>
                    
                    <div className="bg-blue-50 rounded-lg p-4">
                      <h5 className="font-semibold text-blue-800 mb-2">Weight Loss Formula</h5>
                      <p className="text-sm text-blue-700">
                        <strong>1 pound of fat = 3,500 calories</strong><br/>
                        Walking 10,000 steps daily (≈300 calories) = 2,100 calories/week<br/>
                        This equals approximately 0.6 pounds of weight loss per week through walking alone.
                      </p>
                    </div>
                    
                    <div className="space-y-2">
                      <h5 className="font-semibold text-gray-800">Tips for Weight Loss</h5>
                      <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
                        <li>Combine walking with a balanced, calorie-controlled diet</li>
                        <li>Increase walking intensity gradually over time</li>
                        <li>Add inclines or hills to increase calorie burn</li>
                        <li>Include interval training (fast-slow-fast patterns)</li>
                        <li>Track progress with both steps and weight measurements</li>
                      </ul>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-gray-800">Setting Realistic Goals</h4>
                    <div className="space-y-3">
                      <div className="bg-green-50 rounded-lg p-4 border-l-4 border-green-400">
                        <h5 className="font-semibold text-green-800">Beginner Goals</h5>
                        <p className="text-sm text-green-700 mt-1">
                          Start with 5,000 steps daily, increase by 500 steps weekly until reaching 10,000 steps. 
                          Focus on consistency rather than intensity initially.
                        </p>
                      </div>
                      
                      <div className="bg-yellow-50 rounded-lg p-4 border-l-4 border-yellow-400">
                        <h5 className="font-semibold text-yellow-800">Intermediate Goals</h5>
                        <p className="text-sm text-yellow-700 mt-1">
                          Maintain 10,000+ steps daily while increasing walking speed or adding challenging routes. 
                          Target 12,000-15,000 steps for enhanced benefits.
                        </p>
                      </div>
                      
                      <div className="bg-purple-50 rounded-lg p-4 border-l-4 border-purple-400">
                        <h5 className="font-semibold text-purple-800">Advanced Goals</h5>
                        <p className="text-sm text-purple-700 mt-1">
                          Maintain 15,000+ steps daily with varied intensities, incorporate hiking or race walking. 
                          Focus on performance and endurance improvements.
                        </p>
                      </div>
                    </div>
                    
                    <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                      <h5 className="font-semibold text-gray-800 mb-2">SMART Goal Framework</h5>
                      <p className="text-sm text-gray-600">
                        Set <strong>Specific</strong> step targets, make them <strong>Measurable</strong> with tracking, 
                        ensure they're <strong>Achievable</strong> for your fitness level, keep them <strong>Relevant</strong> 
                        to your health goals, and set <strong>Time-bound</strong> milestones for progress evaluation.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Common Questions and Misconceptions */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-8">Frequently Asked Questions About Step Counting</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">How accurate are step counters and fitness trackers?</h4>
                      <p className="text-gray-600 text-sm">Most modern devices are 90-95% accurate for step counting on flat surfaces. Accuracy may decrease with very slow walking, running, or irregular movements. Our calculator uses scientifically validated formulas regardless of your tracking method.</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">Do all steps count equally for calorie burning?</h4>
                      <p className="text-gray-600 text-sm">No, steps at different intensities burn different amounts of calories. Our calculator accounts for this by including walking intensity levels. Steps taken during vigorous walking burn significantly more calories than casual steps.</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">Is 10,000 steps really necessary for good health?</h4>
                      <p className="text-gray-600 text-sm">While 10,000 steps is a popular target, research shows health benefits begin at 4,000 steps daily, with significant benefits at 7,500 steps. The "10,000 steps" goal is motivational and achievable for most people, but any increase in activity is beneficial.</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">Can I lose weight with walking alone?</h4>
                      <p className="text-gray-600 text-sm">Walking can contribute to weight loss, but combining it with proper nutrition is most effective. Our calculator shows potential weight loss from walking, but actual results depend on overall caloric balance including diet.</p>
                    </div>
                  </div>
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">Should I count steps taken during other exercises?</h4>
                      <p className="text-gray-600 text-sm">Steps during activities like dancing, sports, or gym workouts do count toward daily totals, but calorie calculations may differ. Our calculator is optimized for walking and light jogging activities.</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">How do weather conditions affect calorie burn?</h4>
                      <p className="text-gray-600 text-sm">Walking in extreme temperatures, wind, or on challenging surfaces increases energy expenditure. However, our calculator provides baseline estimates for normal conditions. Actual calorie burn may be 10-20% higher in challenging conditions.</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">What's the best time of day to walk for maximum benefits?</h4>
                      <p className="text-gray-600 text-sm">Any time you can walk consistently is the best time. Morning walks can boost metabolism for the day, while evening walks can aid digestion and sleep. The key is establishing a routine that fits your lifestyle.</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">How long does it take to see health benefits from walking?</h4>
                      <p className="text-gray-600 text-sm">Immediate benefits include improved mood and energy. Cardiovascular improvements begin within 2-4 weeks of regular walking. Weight loss and fitness improvements typically become noticeable after 6-8 weeks of consistent activity.</p>
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

export default DailyStepCalorieConverter;
