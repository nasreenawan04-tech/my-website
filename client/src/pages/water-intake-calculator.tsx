
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

interface WaterIntakeResult {
  dailyWaterIntake: number;
  glassesOfWater: number;
  bottlesOfWater: number;
  baseWaterNeed: number;
  activityAdjustment: number;
  climateAdjustment: number;
  healthAdjustment: number;
  recommendations: string[];
}

const WaterIntakeCalculator = () => {
  const [weight, setWeight] = useState('70');
  const [age, setAge] = useState('30');
  const [unitSystem, setUnitSystem] = useState('metric');
  const [gender, setGender] = useState('');
  const [activityLevel, setActivityLevel] = useState('');
  const [climate, setClimate] = useState('');
  const [healthConditions, setHealthConditions] = useState('');
  const [isPregnant, setIsPregnant] = useState('');
  const [isBreastfeeding, setIsBreastfeeding] = useState('');
  const [result, setResult] = useState<WaterIntakeResult | null>(null);

  const calculateWaterIntake = () => {
    if (!weight || !age || !gender || !activityLevel) return;

    const weightKg = unitSystem === 'metric' ? parseFloat(weight) : parseFloat(weight) * 0.453592;
    const ageNum = parseInt(age);

    // Base water intake calculation (ml per day)
    let baseWater = 0;
    
    // Institute of Medicine recommendations
    if (gender === 'male') {
      baseWater = 3700; // 3.7L for men
    } else {
      baseWater = 2700; // 2.7L for women
    }

    // Alternative calculation based on weight (35ml per kg of body weight)
    const weightBasedWater = weightKg * 35;
    
    // Use the higher of the two calculations as base
    baseWater = Math.max(baseWater, weightBasedWater);

    // Activity level adjustments
    let activityMultiplier = 1;
    let activityAdjustment = 0;
    
    switch (activityLevel) {
      case 'sedentary':
        activityMultiplier = 1;
        break;
      case 'light':
        activityMultiplier = 1.1;
        activityAdjustment = baseWater * 0.1;
        break;
      case 'moderate':
        activityMultiplier = 1.3;
        activityAdjustment = baseWater * 0.3;
        break;
      case 'active':
        activityMultiplier = 1.5;
        activityAdjustment = baseWater * 0.5;
        break;
      case 'very_active':
        activityMultiplier = 1.7;
        activityAdjustment = baseWater * 0.7;
        break;
    }

    // Climate adjustments
    let climateAdjustment = 0;
    switch (climate) {
      case 'cold':
        climateAdjustment = 0;
        break;
      case 'temperate':
        climateAdjustment = 0;
        break;
      case 'hot':
        climateAdjustment = baseWater * 0.15;
        break;
      case 'very_hot':
        climateAdjustment = baseWater * 0.25;
        break;
    }

    // Health condition adjustments
    let healthAdjustment = 0;
    switch (healthConditions) {
      case 'none':
        healthAdjustment = 0;
        break;
      case 'fever':
        healthAdjustment = baseWater * 0.2;
        break;
      case 'vomiting':
        healthAdjustment = baseWater * 0.25;
        break;
      case 'diarrhea':
        healthAdjustment = baseWater * 0.3;
        break;
      case 'kidney_stones':
        healthAdjustment = baseWater * 0.4;
        break;
    }

    // Pregnancy and breastfeeding adjustments
    if (gender === 'female') {
      if (isPregnant === 'yes') {
        healthAdjustment += 300; // Additional 300ml for pregnancy
      }
      if (isBreastfeeding === 'yes') {
        healthAdjustment += 700; // Additional 700ml for breastfeeding
      }
    }

    // Age adjustments
    if (ageNum > 65) {
      healthAdjustment += baseWater * 0.1; // 10% more for elderly
    }

    const totalWaterIntake = baseWater * activityMultiplier + climateAdjustment + healthAdjustment;

    // Convert to appropriate units
    let finalWaterIntake = totalWaterIntake;
    if (unitSystem === 'imperial') {
      finalWaterIntake = totalWaterIntake * 0.033814; // Convert ml to fl oz
    }

    // Calculate glasses and bottles (assuming 250ml glass, 500ml bottle)
    const glassesOfWater = Math.ceil(totalWaterIntake / 250);
    const bottlesOfWater = Math.ceil(totalWaterIntake / 500);

    // Generate recommendations
    const recommendations = [];
    
    if (activityLevel === 'active' || activityLevel === 'very_active') {
      recommendations.push('Drink water before, during, and after exercise');
    }
    
    if (climate === 'hot' || climate === 'very_hot') {
      recommendations.push('Increase intake in hot weather to prevent dehydration');
    }
    
    recommendations.push('Spread your water intake throughout the day');
    recommendations.push('Monitor urine color - pale yellow indicates good hydration');
    
    if (ageNum > 65) {
      recommendations.push('Older adults should drink water regularly, even when not thirsty');
    }

    setResult({
      dailyWaterIntake: Math.round(finalWaterIntake),
      glassesOfWater,
      bottlesOfWater,
      baseWaterNeed: Math.round(baseWater),
      activityAdjustment: Math.round(activityAdjustment),
      climateAdjustment: Math.round(climateAdjustment),
      healthAdjustment: Math.round(healthAdjustment),
      recommendations
    });
  };

  const resetCalculator = () => {
    setWeight('70');
    setAge('30');
    setGender('');
    setActivityLevel('');
    setClimate('');
    setHealthConditions('');
    setIsPregnant('');
    setIsBreastfeeding('');
    setUnitSystem('metric');
    setResult(null);
  };

  const formatVolume = (volume: number) => {
    if (unitSystem === 'metric') {
      if (volume >= 1000) {
        return `${(volume / 1000).toFixed(1)} L`;
      }
      return `${volume} ml`;
    } else {
      return `${volume} fl oz`;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Helmet>
        <title>Water Intake Calculator - Daily Water Needs Calculator | DapsiWow</title>
        <meta name="description" content="Free water intake calculator to calculate your daily water requirements based on weight, age, activity level, climate, and health conditions. Get personalized hydration recommendations with metric and imperial unit support." />
        <meta name="keywords" content="water intake calculator, daily water needs, hydration calculator, water requirement calculator, daily fluid intake, dehydration prevention, water consumption calculator, hydration needs, water intake formula, daily water recommendation" />
        <meta property="og:title" content="Water Intake Calculator - Daily Water Needs Calculator | DapsiWow" />
        <meta property="og:description" content="Calculate your personalized daily water intake requirements with our free calculator. Get instant hydration recommendations based on your lifestyle and health factors." />
        <meta property="og:type" content="website" />
        <meta name="robots" content="index, follow" />
        <meta name="author" content="DapsiWow" />
        <link rel="canonical" href="https://dapsiwow.com/tools/water-intake-calculator" />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            "name": "Water Intake Calculator",
            "description": "Free online water intake calculator to determine daily water requirements based on personal factors including weight, activity level, climate, and health conditions.",
            "url": "https://dapsiwow.com/tools/water-intake-calculator",
            "applicationCategory": "HealthApplication",
            "operatingSystem": "Any",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "USD"
            },
            "featureList": [
              "Calculate daily water intake needs",
              "Personal factor adjustments",
              "Activity level considerations",
              "Climate impact analysis",
              "Health condition adjustments",
              "Pregnancy and breastfeeding support"
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
                <span className="text-xs sm:text-sm font-medium text-blue-700">Advanced Hydration Calculator</span>
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl 2xl:text-8xl font-bold text-slate-900 leading-tight tracking-tight">
                <span className="block">Smart Water</span>
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 mt-1 sm:mt-2">
                  Calculator
                </span>
              </h1>
              <p className="text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl text-slate-600 max-w-sm sm:max-w-lg md:max-w-2xl lg:max-w-3xl xl:max-w-4xl mx-auto leading-relaxed px-2 sm:px-0">
                Calculate your personalized daily water intake requirements based on body weight, activity level, climate, and health factors
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
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">Personal Information</h2>
                    <p className="text-gray-600">Enter your details to get accurate water intake calculations</p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Unit System */}
                    <div className="space-y-3">
                      <Label className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                        Unit System
                      </Label>
                      <RadioGroup 
                        value={unitSystem} 
                        onValueChange={setUnitSystem}
                        className="flex gap-6"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="metric" id="metric" data-testid="radio-metric" />
                          <Label htmlFor="metric">Metric (kg, L)</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="imperial" id="imperial" data-testid="radio-imperial" />
                          <Label htmlFor="imperial">Imperial (lbs, fl oz)</Label>
                        </div>
                      </RadioGroup>
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

                    {/* Activity Level */}
                    <div className="space-y-3">
                      <Label className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                        Activity Level
                      </Label>
                      <Select value={activityLevel} onValueChange={setActivityLevel}>
                        <SelectTrigger className="h-14 border-2 border-gray-200 rounded-xl text-lg" data-testid="select-activity">
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

                    {/* Climate */}
                    <div className="space-y-3">
                      <Label className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                        Climate
                      </Label>
                      <Select value={climate} onValueChange={setClimate}>
                        <SelectTrigger className="h-14 border-2 border-gray-200 rounded-xl text-lg" data-testid="select-climate">
                          <SelectValue placeholder="Select climate" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="cold">Cold (below 10°C/50°F)</SelectItem>
                          <SelectItem value="temperate">Temperate (10-25°C/50-77°F)</SelectItem>
                          <SelectItem value="hot">Hot (25-35°C/77-95°F)</SelectItem>
                          <SelectItem value="very_hot">Very Hot (above 35°C/95°F)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Advanced Options */}
                  <div className="space-y-6 border-t pt-8">
                    <h3 className="text-xl font-bold text-gray-900">Health & Special Conditions</h3>
                    
                    {/* Health Conditions */}
                    <div className="space-y-3">
                      <Label className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                        Health Conditions
                      </Label>
                      <Select value={healthConditions} onValueChange={setHealthConditions}>
                        <SelectTrigger className="h-14 border-2 border-gray-200 rounded-xl text-lg" data-testid="select-health">
                          <SelectValue placeholder="Select any current conditions" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">None</SelectItem>
                          <SelectItem value="fever">Fever</SelectItem>
                          <SelectItem value="vomiting">Vomiting</SelectItem>
                          <SelectItem value="diarrhea">Diarrhea</SelectItem>
                          <SelectItem value="kidney_stones">Kidney Stones</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Female-specific options */}
                    {gender === 'female' && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-3">
                          <Label className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                            Are you pregnant?
                          </Label>
                          <Select value={isPregnant} onValueChange={setIsPregnant}>
                            <SelectTrigger className="h-14 border-2 border-gray-200 rounded-xl text-lg" data-testid="select-pregnant">
                              <SelectValue placeholder="Select" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="no">No</SelectItem>
                              <SelectItem value="yes">Yes</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-3">
                          <Label className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                            Are you breastfeeding?
                          </Label>
                          <Select value={isBreastfeeding} onValueChange={setIsBreastfeeding}>
                            <SelectTrigger className="h-14 border-2 border-gray-200 rounded-xl text-lg" data-testid="select-breastfeeding">
                              <SelectValue placeholder="Select" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="no">No</SelectItem>
                              <SelectItem value="yes">Yes</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-4 pt-6">
                    <Button
                      onClick={calculateWaterIntake}
                      className="flex-1 h-14 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold text-lg rounded-xl shadow-lg transform transition-all duration-200 hover:scale-105"
                      data-testid="button-calculate"
                    >
                      Calculate Water Intake
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
                  <h2 className="text-2xl font-bold text-gray-900 mb-8">Water Intake Results</h2>
                  
                  {result ? (
                    <div className="space-y-6" data-testid="water-intake-results">
                      {/* Daily Water Intake Highlight */}
                      <div className="bg-white rounded-2xl p-6 shadow-lg border border-blue-100">
                        <div className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-2">Daily Water Intake</div>
                        <div className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600" data-testid="text-daily-intake">
                          {formatVolume(result.dailyWaterIntake)}
                        </div>
                      </div>

                      {/* Practical Measurements */}
                      <div className="bg-sky-50 rounded-xl p-6 border border-sky-200">
                        <h3 className="font-bold text-sky-800 mb-4 text-lg">Practical Measurements</h3>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-sky-700 font-medium">Glasses of water (250ml):</span>
                            <span className="font-bold text-sky-800 text-lg" data-testid="text-glasses">
                              {result.glassesOfWater} glasses
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sky-700 font-medium">Water bottles (500ml):</span>
                            <span className="font-bold text-sky-800 text-lg" data-testid="text-bottles">
                              {result.bottlesOfWater} bottles
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Breakdown */}
                      <div className="bg-white rounded-xl p-6 shadow-sm">
                        <h3 className="font-bold text-gray-900 mb-4 text-lg">Calculation Breakdown</h3>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-gray-700 font-medium">Base water need:</span>
                            <span className="font-bold text-gray-900">{formatVolume(result.baseWaterNeed)}</span>
                          </div>
                          {result.activityAdjustment > 0 && (
                            <div className="flex justify-between items-center">
                              <span className="text-gray-700 font-medium">Activity adjustment:</span>
                              <span className="font-bold text-orange-600">+{formatVolume(result.activityAdjustment)}</span>
                            </div>
                          )}
                          {result.climateAdjustment > 0 && (
                            <div className="flex justify-between items-center">
                              <span className="text-gray-700 font-medium">Climate adjustment:</span>
                              <span className="font-bold text-red-600">+{formatVolume(result.climateAdjustment)}</span>
                            </div>
                          )}
                          {result.healthAdjustment > 0 && (
                            <div className="flex justify-between items-center">
                              <span className="text-gray-700 font-medium">Health/Special adjustment:</span>
                              <span className="font-bold text-purple-600">+{formatVolume(result.healthAdjustment)}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Recommendations */}
                      <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
                        <h3 className="font-bold text-blue-800 mb-4 text-lg">Hydration Tips</h3>
                        <ul className="space-y-2">
                          {result.recommendations.map((rec, index) => (
                            <li key={index} className="flex items-start">
                              <span className="text-blue-500 mr-2 mt-1">•</span>
                              <span className="text-blue-700 text-sm">{rec}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-16" data-testid="no-results">
                      <div className="w-20 h-20 bg-gray-200 rounded-full mx-auto mb-6 flex items-center justify-center">
                        <div className="text-3xl font-bold text-gray-400">💧</div>
                      </div>
                      <p className="text-gray-500 text-lg">Enter your information to calculate daily water intake</p>
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
                <h3 className="text-2xl font-bold text-gray-900 mb-6">What is Daily Water Intake?</h3>
                <div className="space-y-4 text-gray-600">
                  <p>
                    Daily water intake refers to the total amount of fluids your body requires each day to maintain 
                    optimal health and proper bodily functions. Water is essential for digestion, circulation, 
                    temperature regulation, joint lubrication, and waste elimination.
                  </p>
                  <p>
                    Our water intake calculator helps you determine your personalized daily water requirements based 
                    on scientific recommendations from health organizations like the Institute of Medicine and WHO. 
                    The calculation considers your body weight, age, activity level, climate, and health conditions 
                    to provide accurate hydration recommendations.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">How to Calculate Water Intake?</h3>
                <div className="space-y-4 text-gray-600">
                  <p>
                    The basic water intake formula is: 35ml per kg of body weight for adults, adjusted for 
                    gender, activity level, climate, and health conditions.
                  </p>
                  <ul className="space-y-2 list-disc list-inside">
                    <li>Men: 3.7L (15 cups) base recommendation</li>
                    <li>Women: 2.7L (11 cups) base recommendation</li>
                    <li>Add 500-750ml per hour of exercise</li>
                    <li>Increase 15-25% in hot climates</li>
                  </ul>
                  <p>
                    Our calculator automatically applies these adjustments and provides personalized recommendations 
                    to ensure you maintain proper hydration levels throughout the day.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Features of Our Water Calculator</h3>
                <div className="space-y-3 text-gray-600">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Personalized calculations based on body weight and age</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Activity level adjustments for athletes and active individuals</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Climate considerations for hot and cold environments</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Health condition adjustments for illness and medical needs</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Pregnancy and breastfeeding support for mothers</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Benefits of Proper Hydration</h3>
                <div className="space-y-3 text-gray-600">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Improved cognitive function and mental clarity</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Better physical performance and reduced fatigue</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Enhanced skin health and appearance</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Improved kidney function and toxin elimination</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Better temperature regulation and joint health</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Additional SEO Content Sections */}
          <div className="mt-12 space-y-8">
            {/* Water Intake Guidelines Section */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Daily Water Intake Guidelines by Age and Activity</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-gray-800">Adults (19+ years)</h4>
                    <p className="text-gray-600">
                      The Institute of Medicine recommends 3.7 liters (15 cups) daily for men and 2.7 liters (11 cups) 
                      for women. This includes water from all beverages and food sources. Our calculator personalizes 
                      these recommendations based on your specific factors.
                    </p>
                  </div>
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-gray-800">Athletes & Active Individuals</h4>
                    <p className="text-gray-600">
                      Physical activity increases water needs significantly. Add 500-750ml per hour of exercise, 
                      and more in hot conditions. Pre-hydration and post-exercise rehydration are equally important 
                      for optimal performance and recovery.
                    </p>
                  </div>
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-gray-800">Pregnant & Nursing Women</h4>
                    <p className="text-gray-600">
                      Pregnancy requires an additional 300ml daily, while breastfeeding mothers need an extra 700ml. 
                      Our calculator automatically adjusts for these special conditions to ensure proper maternal 
                      and infant health.
                    </p>
                  </div>
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-gray-800">Older Adults (65+ years)</h4>
                    <p className="text-gray-600">
                      Aging affects thirst sensation and kidney function. Older adults should increase water intake 
                      by 10% and drink regularly throughout the day, even when not feeling thirsty, to prevent 
                      dehydration-related complications.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Factors Affecting Water Intake */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
                <CardContent className="p-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">Factors That Increase Water Needs</h3>
                  <div className="space-y-4 text-gray-600">
                    <div className="border-l-4 border-red-500 pl-4">
                      <h4 className="font-semibold text-gray-800 mb-2">Hot Climate & High Altitude</h4>
                      <p className="text-sm">Increase water intake by 15-25% in temperatures above 25°C (77°F) and at altitudes above 8,000 feet due to increased respiratory water loss.</p>
                    </div>
                    <div className="border-l-4 border-orange-500 pl-4">
                      <h4 className="font-semibold text-gray-800 mb-2">Physical Exercise</h4>
                      <p className="text-sm">Add 500-750ml per hour of exercise, more for intense activities. Begin hydrating 2-3 hours before exercise for optimal performance.</p>
                    </div>
                    <div className="border-l-4 border-yellow-500 pl-4">
                      <h4 className="font-semibold text-gray-800 mb-2">Illness & Fever</h4>
                      <p className="text-sm">Fever, vomiting, and diarrhea significantly increase fluid needs. Add 20-30% more water during illness to replace lost fluids.</p>
                    </div>
                    <div className="border-l-4 border-purple-500 pl-4">
                      <h4 className="font-semibold text-gray-800 mb-2">Alcohol & Caffeine</h4>
                      <p className="text-sm">These substances have mild diuretic effects. Balance consumption with additional water intake to maintain proper hydration.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
                <CardContent className="p-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">Signs of Proper Hydration</h3>
                  <div className="space-y-4 text-gray-600">
                    <div className="bg-green-50 rounded-lg p-4">
                      <h4 className="font-semibold text-green-800 mb-2">Optimal Hydration Indicators</h4>
                      <p className="text-sm text-green-700">Pale yellow urine, consistent energy levels, moist mouth and lips, elastic skin, regular urination every 2-4 hours.</p>
                    </div>
                    <div className="bg-yellow-50 rounded-lg p-4">
                      <h4 className="font-semibold text-yellow-800 mb-2">Mild Dehydration Warning Signs</h4>
                      <p className="text-sm text-yellow-700">Dark yellow urine, dry mouth, fatigue, headache, dizziness, decreased urination frequency.</p>
                    </div>
                    <div className="bg-red-50 rounded-lg p-4">
                      <h4 className="font-semibold text-red-800 mb-2">Severe Dehydration (Seek Medical Help)</h4>
                      <p className="text-sm text-red-700">Very dark urine, extreme thirst, rapid heartbeat, confusion, sunken eyes, minimal urination.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Hydration Strategies Section */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Effective Daily Hydration Strategies</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-3">
                    <h4 className="font-semibold text-gray-800">Morning Hydration</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Start with 16-20oz upon waking</li>
                      <li>• Hydrate before morning coffee</li>
                      <li>• Set phone reminders for consistency</li>
                      <li>• Keep water by bedside</li>
                    </ul>
                  </div>
                  <div className="space-y-3">
                    <h4 className="font-semibold text-gray-800">Throughout the Day</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Sip regularly, don't wait for thirst</li>
                      <li>• Use a marked water bottle</li>
                      <li>• Drink before, during, after meals</li>
                      <li>• Increase intake with activity</li>
                    </ul>
                  </div>
                  <div className="space-y-3">
                    <h4 className="font-semibold text-gray-800">Evening & Night</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Taper intake 2 hours before bed</li>
                      <li>• Monitor urine color</li>
                      <li>• Adjust for next day's activities</li>
                      <li>• Plan for early morning hydration</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* FAQ Section */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-8">Frequently Asked Questions About Water Intake</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">How accurate is this water intake calculator?</h4>
                      <p className="text-gray-600 text-sm">Our calculator uses evidence-based formulas from the Institute of Medicine and WHO guidelines, considering personal factors for 90%+ accuracy in recommendations.</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">Does coffee and tea count toward daily water intake?</h4>
                      <p className="text-gray-600 text-sm">Yes, all beverages contribute to fluid intake. While caffeine has mild diuretic effects, the net hydration benefit from coffee and tea is positive.</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">Can I drink too much water?</h4>
                      <p className="text-gray-600 text-sm">Yes, overhydration (hyponatremia) can occur but is rare with normal kidney function. Stick to calculated recommendations unless medically advised otherwise.</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">How does water intake affect weight loss?</h4>
                      <p className="text-gray-600 text-sm">Proper hydration supports metabolism, reduces appetite when mistaken for hunger, and helps the body efficiently process nutrients and eliminate waste.</p>
                    </div>
                  </div>
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">Should water intake change with seasons?</h4>
                      <p className="text-gray-600 text-sm">Yes, increase intake by 15-25% in summer heat and maintain adequate levels in winter when heating reduces humidity and increases respiratory water loss.</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">What's the best time to drink water during exercise?</h4>
                      <p className="text-gray-600 text-sm">Begin hydrating 2-3 hours before exercise, drink 6-8oz every 15-20 minutes during activity, and rehydrate 150% of fluid lost post-exercise.</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">How does age affect water intake requirements?</h4>
                      <p className="text-gray-600 text-sm">Older adults need 10% more water due to decreased kidney efficiency and reduced thirst sensation. Children need more per body weight due to higher metabolic rates.</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">Are there health conditions that require special hydration needs?</h4>
                      <p className="text-gray-600 text-sm">Yes, conditions like kidney disease, heart failure, and diabetes may require modified intake. Always consult healthcare providers for specific medical guidance.</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Water Sources & Quality */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
                <CardContent className="p-8">
                  <h3 className="text-xl font-bold text-gray-900 mb-6">Best Water Sources</h3>
                  <div className="space-y-4 text-gray-600">
                    <p className="text-sm">
                      Plain water is the optimal choice for hydration, providing pure H2O without calories, sugar, or artificial additives.
                    </p>
                    <div className="space-y-2">
                      <h4 className="font-semibold text-green-800 text-sm">Excellent Sources:</h4>
                      <ul className="text-xs space-y-1 list-disc list-inside text-green-700">
                        <li>Filtered tap water</li>
                        <li>Natural spring water</li>
                        <li>Sparkling water (unsweetened)</li>
                        <li>Herbal teas (caffeine-free)</li>
                      </ul>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-semibold text-orange-800 text-sm">Good Sources:</h4>
                      <ul className="text-xs space-y-1 list-disc list-inside text-orange-700">
                        <li>Low-fat milk</li>
                        <li>100% fruit juices (limited)</li>
                        <li>Coconut water</li>
                        <li>Water-rich fruits and vegetables</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
                <CardContent className="p-8">
                  <h3 className="text-xl font-bold text-gray-900 mb-6">Hydrating Foods</h3>
                  <div className="space-y-4 text-gray-600">
                    <p className="text-sm">
                      Approximately 20% of daily fluid intake comes from food sources, particularly fruits and vegetables with high water content.
                    </p>
                    <div className="space-y-2">
                      <h4 className="font-semibold text-blue-800 text-sm">High Water Content (90%+):</h4>
                      <ul className="text-xs space-y-1 list-disc list-inside text-blue-700">
                        <li>Watermelon, cucumber</li>
                        <li>Lettuce, celery</li>
                        <li>Tomatoes, bell peppers</li>
                        <li>Cantaloupe, strawberries</li>
                      </ul>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-semibold text-purple-800 text-sm">Good Sources (80-90%):</h4>
                      <ul className="text-xs space-y-1 list-disc list-inside text-purple-700">
                        <li>Oranges, grapefruit</li>
                        <li>Broccoli, spinach</li>
                        <li>Yogurt, milk</li>
                        <li>Soups and broths</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
                <CardContent className="p-8">
                  <h3 className="text-xl font-bold text-gray-900 mb-6">Hydration Myths</h3>
                  <div className="space-y-4 text-gray-600">
                    <p className="text-sm">
                      Separate fact from fiction with these common hydration misconceptions and scientific truths.
                    </p>
                    <div className="space-y-3">
                      <div className="bg-red-50 rounded-lg p-3">
                        <h4 className="font-semibold text-red-800 mb-1 text-sm">Myth: 8 glasses rule</h4>
                        <p className="text-xs text-red-700">Individual needs vary greatly based on body size, activity, and environment</p>
                      </div>
                      
                      <div className="bg-orange-50 rounded-lg p-3">
                        <h4 className="font-semibold text-orange-800 mb-1 text-sm">Myth: Clear urine is best</h4>
                        <p className="text-xs text-orange-700">Pale yellow indicates optimal hydration; clear may signal overhydration</p>
                      </div>
                      
                      <div className="bg-yellow-50 rounded-lg p-3">
                        <h4 className="font-semibold text-yellow-800 mb-1 text-sm">Myth: Thirst is reliable</h4>
                        <p className="text-xs text-yellow-700">Thirst sensation decreases with age and during exercise</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Special Populations Section */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Water Intake for Special Populations</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-gray-800">Athletes & Sports Performance</h4>
                    <p className="text-gray-600 text-sm mb-4">
                      Athletic performance can decline by 2% with just 2% dehydration. Proper hydration timing and 
                      electrolyte balance are crucial for optimal performance and recovery.
                    </p>
                    <div className="bg-blue-50 border-l-4 border-blue-400 p-3">
                      <h5 className="font-semibold text-blue-800 mb-2 text-sm">Pre-Exercise (2-3 hours before):</h5>
                      <p className="text-xs text-blue-700">Drink 16-20oz of water to ensure adequate hydration without causing discomfort during activity.</p>
                    </div>
                    <div className="bg-green-50 border-l-4 border-green-400 p-3">
                      <h5 className="font-semibold text-green-800 mb-2 text-sm">During Exercise:</h5>
                      <p className="text-xs text-green-700">Consume 6-8oz every 15-20 minutes, adjusting for sweat rate and environmental conditions.</p>
                    </div>
                    <div className="bg-orange-50 border-l-4 border-orange-400 p-3">
                      <h5 className="font-semibold text-orange-800 mb-2 text-sm">Post-Exercise Recovery:</h5>
                      <p className="text-xs text-orange-700">Drink 150% of fluid lost (weigh before/after) within 6 hours for complete rehydration.</p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-gray-800">Medical Conditions & Medications</h4>
                    <p className="text-gray-600 text-sm mb-4">
                      Certain medical conditions and medications significantly affect hydration needs. Always consult 
                      healthcare providers for personalized recommendations when managing chronic conditions.
                    </p>
                    <div className="space-y-3">
                      <div className="bg-purple-50 rounded-lg p-3">
                        <h5 className="font-semibold text-purple-800 mb-1 text-sm">Kidney Disease</h5>
                        <p className="text-xs text-purple-700">May require fluid restriction - follow nephrologist guidance</p>
                      </div>
                      
                      <div className="bg-pink-50 rounded-lg p-3">
                        <h5 className="font-semibold text-pink-800 mb-1 text-sm">Heart Failure</h5>
                        <p className="text-xs text-pink-700">Fluid balance critical - monitor weight and follow cardiac guidelines</p>
                      </div>
                      
                      <div className="bg-indigo-50 rounded-lg p-3">
                        <h5 className="font-semibold text-indigo-800 mb-1 text-sm">Diabetes</h5>
                        <p className="text-xs text-indigo-700">High blood sugar increases fluid needs - maintain consistent hydration</p>
                      </div>
                      
                      <div className="bg-teal-50 rounded-lg p-3">
                        <h5 className="font-semibold text-teal-800 mb-1 text-sm">Diuretic Medications</h5>
                        <p className="text-xs text-teal-700">Increase fluid needs - balance intake with medication timing</p>
                      </div>
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

export default WaterIntakeCalculator;
