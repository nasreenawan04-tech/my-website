
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

interface ProteinIntakeResult {
  dailyProteinIntake: number;
  proteinPerMeal: number;
  proteinSources: {
    chicken: number;
    eggs: number;
    fish: number;
    beans: number;
    nuts: number;
    quinoa: number;
  };
  recommendations: string[];
  proteinTiming: string[];
}

const ProteinIntakeCalculator = () => {
  const [weight, setWeight] = useState('');
  const [age, setAge] = useState('');
  const [unitSystem, setUnitSystem] = useState('metric');
  const [gender, setGender] = useState('');
  const [activityLevel, setActivityLevel] = useState('');
  const [fitnessGoal, setFitnessGoal] = useState('');
  const [healthConditions, setHealthConditions] = useState('');
  const [isPregnant, setIsPregnant] = useState('');
  const [isBreastfeeding, setIsBreastfeeding] = useState('');
  const [result, setResult] = useState<ProteinIntakeResult | null>(null);

  const calculateProteinIntake = () => {
    if (!weight || !age || !gender || !activityLevel || !fitnessGoal) return;

    const weightKg = unitSystem === 'metric' ? parseFloat(weight) : parseFloat(weight) * 0.453592;
    const ageNum = parseInt(age);

    // Base protein requirement calculation (grams per kg of body weight)
    let proteinPerKg = 0;

    // Set base protein requirements
    if (ageNum < 18) {
      proteinPerKg = 1.2; // Growing adolescents need more protein
    } else if (ageNum > 65) {
      proteinPerKg = 1.2; // Elderly need more protein to prevent muscle loss
    } else {
      proteinPerKg = 0.8; // Standard RDA for adults
    }

    // Adjust based on activity level
    switch (activityLevel) {
      case 'sedentary':
        // Base amount already set
        break;
      case 'light':
        proteinPerKg += 0.2;
        break;
      case 'moderate':
        proteinPerKg += 0.4;
        break;
      case 'active':
        proteinPerKg += 0.6;
        break;
      case 'very_active':
        proteinPerKg += 0.8;
        break;
    }

    // Adjust based on fitness goals
    switch (fitnessGoal) {
      case 'maintenance':
        // No additional adjustment
        break;
      case 'weight_loss':
        proteinPerKg += 0.3; // Higher protein helps preserve muscle during weight loss
        break;
      case 'muscle_gain':
        proteinPerKg += 0.6; // Higher protein for muscle building
        break;
      case 'athletic_performance':
        proteinPerKg += 0.8; // Athletes need more protein
        break;
      case 'recovery':
        proteinPerKg += 0.5; // Recovery from injury or intense training
        break;
    }

    // Health condition adjustments
    switch (healthConditions) {
      case 'none':
        break;
      case 'kidney_disease':
        proteinPerKg = Math.min(proteinPerKg, 0.6); // Reduce protein for kidney disease
        break;
      case 'diabetes':
        proteinPerKg += 0.2; // Slightly higher protein can help with blood sugar
        break;
      case 'liver_disease':
        proteinPerKg = Math.min(proteinPerKg, 0.8); // Moderate protein for liver issues
        break;
    }

    // Pregnancy and breastfeeding adjustments
    if (gender === 'female') {
      if (isPregnant === 'yes') {
        proteinPerKg += 0.3; // Additional protein during pregnancy
      }
      if (isBreastfeeding === 'yes') {
        proteinPerKg += 0.5; // Additional protein for breastfeeding
      }
    }

    const dailyProtein = weightKg * proteinPerKg;
    const proteinPerMeal = dailyProtein / 3; // Assuming 3 meals per day

    // Calculate protein sources (grams needed from each source)
    const proteinSources = {
      chicken: Math.ceil(dailyProtein / 0.31), // Chicken breast has ~31g protein per 100g
      eggs: Math.ceil(dailyProtein / 6), // One large egg has ~6g protein
      fish: Math.ceil(dailyProtein / 0.25), // Fish has ~25g protein per 100g
      beans: Math.ceil(dailyProtein / 0.09), // Beans have ~9g protein per 100g
      nuts: Math.ceil(dailyProtein / 0.15), // Nuts have ~15g protein per 100g
      quinoa: Math.ceil(dailyProtein / 0.14), // Quinoa has ~14g protein per 100g
    };

    // Generate recommendations
    const recommendations = [];
    
    if (fitnessGoal === 'muscle_gain' || activityLevel === 'very_active') {
      recommendations.push('Consider protein supplements if unable to meet needs through food');
    }
    
    if (ageNum > 50) {
      recommendations.push('Focus on high-quality, easily digestible protein sources');
    }
    
    recommendations.push('Spread protein intake evenly throughout the day');
    recommendations.push('Include both animal and plant-based protein sources for variety');
    
    if (fitnessGoal === 'weight_loss') {
      recommendations.push('Higher protein intake can help preserve muscle mass during weight loss');
    }

    // Protein timing recommendations
    const proteinTiming = [
      'Have protein within 2 hours after exercise',
      'Include protein in every meal',
      'Consider a protein-rich snack before bed for muscle recovery'
    ];

    if (activityLevel === 'very_active' || fitnessGoal === 'muscle_gain') {
      proteinTiming.push('Consume 20-25g protein within 30 minutes post-workout');
    }

    setResult({
      dailyProteinIntake: Math.round(dailyProtein),
      proteinPerMeal: Math.round(proteinPerMeal),
      proteinSources,
      recommendations,
      proteinTiming
    });
  };

  const resetCalculator = () => {
    setWeight('');
    setAge('');
    setGender('');
    setActivityLevel('');
    setFitnessGoal('');
    setHealthConditions('');
    setIsPregnant('');
    setIsBreastfeeding('');
    setUnitSystem('metric');
    setResult(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-orange-50 to-red-50">
      <Helmet>
        <title>Protein Intake Calculator - Calculate Daily Protein Requirements | DapsiWow</title>
        <meta name="description" content="Free protein intake calculator to determine your daily protein needs based on weight, activity level, fitness goals, and health conditions. Get personalized protein recommendations and meal planning guidance." />
        <meta name="keywords" content="protein intake calculator, daily protein needs, protein requirement calculator, muscle building protein, weight loss protein, protein sources, protein calculator online, daily protein intake, protein planning tool" />
        <meta property="og:title" content="Protein Intake Calculator - Calculate Daily Protein Requirements | DapsiWow" />
        <meta property="og:description" content="Calculate your personalized daily protein requirements with our free protein intake calculator. Get instant recommendations for optimal health and fitness goals." />
        <meta property="og:type" content="website" />
        <meta name="robots" content="index, follow" />
        <meta name="author" content="DapsiWow" />
        <link rel="canonical" href="https://dapsiwow.com/tools/protein-intake-calculator" />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            "name": "Protein Intake Calculator",
            "description": "Free online protein intake calculator to determine daily protein requirements based on personal factors, activity level, and fitness goals. Get personalized protein recommendations.",
            "url": "https://dapsiwow.com/tools/protein-intake-calculator",
            "applicationCategory": "HealthApplication",
            "operatingSystem": "Any",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "USD"
            },
            "featureList": [
              "Calculate daily protein needs",
              "Support for metric and imperial units",
              "Activity level adjustments",
              "Fitness goal customization",
              "Health condition considerations",
              "Protein source recommendations"
            ]
          })}
        </script>
      </Helmet>
      
      <Header />
      
      <main>
        {/* Hero Section */}
        <section className="relative py-12 sm:py-16 md:py-20 lg:py-24 xl:py-28 2xl:py-32 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-orange-600/10 to-red-600/20"></div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="space-y-4 sm:space-y-6 md:space-y-7 lg:space-y-8">
              <div className="inline-flex items-center px-3 sm:px-4 py-1.5 sm:py-2 bg-white/80 backdrop-blur-sm rounded-full border border-orange-200">
                <span className="text-xs sm:text-sm font-medium text-orange-700">Professional Protein Calculator</span>
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl 2xl:text-8xl font-bold text-slate-900 leading-tight tracking-tight">
                <span className="block">Smart Protein</span>
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-red-600 mt-1 sm:mt-2">
                  Calculator
                </span>
              </h1>
              <p className="text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl text-slate-600 max-w-sm sm:max-w-lg md:max-w-2xl lg:max-w-3xl xl:max-w-4xl mx-auto leading-relaxed px-2 sm:px-0">
                Calculate your daily protein requirements with precision based on your goals, activity level, and health factors
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
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">Protein Configuration</h2>
                    <p className="text-gray-600">Enter your personal details to get accurate protein intake calculations</p>
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
                          <Label htmlFor="metric">Metric (kg)</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="imperial" id="imperial" data-testid="radio-imperial" />
                          <Label htmlFor="imperial">Imperial (lbs)</Label>
                        </div>
                      </RadioGroup>
                    </div>

                    {/* Weight */}
                    <div className="space-y-3">
                      <Label htmlFor="weight" className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                        Body Weight
                      </Label>
                      <div className="relative">
                        <Input
                          id="weight"
                          type="number"
                          value={weight}
                          onChange={(e) => setWeight(e.target.value)}
                          className="h-14 text-lg border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:ring-orange-500"
                          placeholder={unitSystem === 'metric' ? "70" : "154"}
                          min="0"
                          step="0.1"
                          data-testid="input-weight"
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 text-lg">
                          {unitSystem === 'metric' ? 'kg' : 'lbs'}
                        </span>
                      </div>
                    </div>

                    {/* Age */}
                    <div className="space-y-3">
                      <Label htmlFor="age" className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                        Age
                      </Label>
                      <div className="relative">
                        <Input
                          id="age"
                          type="number"
                          value={age}
                          onChange={(e) => setAge(e.target.value)}
                          className="h-14 text-lg border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:ring-orange-500"
                          placeholder="30"
                          min="1"
                          max="120"
                          data-testid="input-age"
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 text-lg">years</span>
                      </div>
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

                    {/* Fitness Goal */}
                    <div className="space-y-3">
                      <Label className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                        Fitness Goal
                      </Label>
                      <Select value={fitnessGoal} onValueChange={setFitnessGoal}>
                        <SelectTrigger className="h-14 border-2 border-gray-200 rounded-xl text-lg" data-testid="select-goal">
                          <SelectValue placeholder="Select your goal" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="maintenance">Weight Maintenance</SelectItem>
                          <SelectItem value="weight_loss">Weight Loss</SelectItem>
                          <SelectItem value="muscle_gain">Muscle Gain</SelectItem>
                          <SelectItem value="athletic_performance">Athletic Performance</SelectItem>
                          <SelectItem value="recovery">Recovery/Rehabilitation</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Advanced Options */}
                  <div className="space-y-6 border-t pt-8">
                    <h3 className="text-xl font-bold text-gray-900">Advanced Options</h3>
                    
                    {/* Health Conditions */}
                    <div className="space-y-4 bg-gray-50 rounded-xl p-6">
                      <div className="space-y-3">
                        <Label className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                          Health Conditions
                        </Label>
                        <Select value={healthConditions} onValueChange={setHealthConditions}>
                          <SelectTrigger className="h-12 border-2 border-gray-200 rounded-lg" data-testid="select-health">
                            <SelectValue placeholder="Select any relevant conditions" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">None</SelectItem>
                            <SelectItem value="diabetes">Diabetes</SelectItem>
                            <SelectItem value="kidney_disease">Kidney Disease</SelectItem>
                            <SelectItem value="liver_disease">Liver Disease</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Female-specific options */}
                    {gender === 'female' && (
                      <div className="space-y-4 bg-gray-50 rounded-xl p-6">
                        <h4 className="text-sm font-semibold text-gray-800 uppercase tracking-wide">Female Health Factors</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label className="text-sm font-medium text-gray-700">
                              Are you pregnant?
                            </Label>
                            <Select value={isPregnant} onValueChange={setIsPregnant}>
                              <SelectTrigger className="h-12 border-2 border-gray-200 rounded-lg" data-testid="select-pregnant">
                                <SelectValue placeholder="Select" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="no">No</SelectItem>
                                <SelectItem value="yes">Yes</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label className="text-sm font-medium text-gray-700">
                              Are you breastfeeding?
                            </Label>
                            <Select value={isBreastfeeding} onValueChange={setIsBreastfeeding}>
                              <SelectTrigger className="h-12 border-2 border-gray-200 rounded-lg" data-testid="select-breastfeeding">
                                <SelectValue placeholder="Select" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="no">No</SelectItem>
                                <SelectItem value="yes">Yes</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-4 pt-6">
                    <Button
                      onClick={calculateProteinIntake}
                      className="flex-1 h-14 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white font-semibold text-lg rounded-xl shadow-lg transform transition-all duration-200 hover:scale-105"
                      data-testid="button-calculate"
                    >
                      Calculate Protein Intake
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
                <div className="bg-gradient-to-br from-gray-50 to-orange-50 p-8 lg:p-12">
                  <h2 className="text-2xl font-bold text-gray-900 mb-8">Results</h2>
                  
                  {result ? (
                    <div className="space-y-6" data-testid="protein-intake-results">
                      {/* Daily Protein Highlight */}
                      <div className="bg-white rounded-2xl p-6 shadow-lg border border-orange-100">
                        <div className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-2">Daily Protein Intake</div>
                        <div className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-red-600" data-testid="text-daily-protein">
                          {result.dailyProteinIntake}g
                        </div>
                      </div>

                      {/* Protein Breakdown */}
                      <div className="space-y-4">
                        <div className="bg-white rounded-xl p-4 shadow-sm">
                          <div className="flex justify-between items-center">
                            <span className="font-medium text-gray-700">Per Meal</span>
                            <span className="font-bold text-gray-900" data-testid="text-protein-per-meal">
                              ~{result.proteinPerMeal}g
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Protein Sources */}
                      <div className="bg-white rounded-xl p-6 shadow-sm">
                        <h4 className="font-bold text-gray-900 mb-4 text-lg">Food Sources (to meet daily needs)</h4>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-gray-700">Chicken breast</span>
                            <span className="font-bold text-orange-600">{result.proteinSources.chicken}g</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-700">Large eggs</span>
                            <span className="font-bold text-orange-600">{result.proteinSources.eggs} eggs</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-700">Fish (salmon/tuna)</span>
                            <span className="font-bold text-orange-600">{result.proteinSources.fish}g</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-700">Beans/Lentils</span>
                            <span className="font-bold text-orange-600">{result.proteinSources.beans}g</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-700">Mixed nuts</span>
                            <span className="font-bold text-orange-600">{result.proteinSources.nuts}g</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-700">Quinoa (cooked)</span>
                            <span className="font-bold text-orange-600">{result.proteinSources.quinoa}g</span>
                          </div>
                        </div>
                      </div>

                      {/* Protein Timing */}
                      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
                        <h4 className="font-bold text-blue-800 mb-4 text-lg">Protein Timing</h4>
                        <div className="space-y-2">
                          {result.proteinTiming.map((tip, index) => (
                            <div key={index} className="flex items-start gap-3">
                              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                              <span className="text-blue-700 text-sm">{tip}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Recommendations */}
                      <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
                        <h4 className="font-bold text-green-800 mb-4 text-lg">Recommendations</h4>
                        <div className="space-y-2">
                          {result.recommendations.map((rec, index) => (
                            <div key={index} className="flex items-start gap-3">
                              <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                              <span className="text-green-700 text-sm">{rec}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-16" data-testid="no-results">
                      <div className="w-20 h-20 bg-gray-200 rounded-full mx-auto mb-6 flex items-center justify-center">
                        <div className="text-3xl font-bold text-gray-400">P</div>
                      </div>
                      <p className="text-gray-500 text-lg">Enter your details and calculate to see protein requirements</p>
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
                <h3 className="text-2xl font-bold text-gray-900 mb-6">What is Protein and Why Do You Need It?</h3>
                <div className="space-y-4 text-gray-600">
                  <p>
                    Protein is one of the three essential macronutrients your body needs to function properly. 
                    Made up of amino acids, protein serves as the building blocks for muscles, bones, cartilage, 
                    skin, blood, enzymes, and hormones. Unlike carbohydrates and fats, your body cannot store 
                    protein, making daily intake crucial for optimal health.
                  </p>
                  <p>
                    Our protein intake calculator helps you determine the exact amount of protein your body needs 
                    based on your weight, activity level, fitness goals, and health conditions. Whether you're 
                    looking to build muscle, lose weight, or maintain optimal health, getting the right amount 
                    of protein is essential for achieving your goals.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">How Much Protein Do You Really Need?</h3>
                <div className="space-y-4 text-gray-600">
                  <p>
                    The Recommended Dietary Allowance (RDA) for protein is 0.8 grams per kilogram of body weight 
                    for sedentary adults. However, this is just the minimum amount needed to prevent deficiency. 
                    Active individuals, athletes, and those with specific fitness goals often need significantly more.
                  </p>
                  <ul className="space-y-2 list-disc list-inside">
                    <li>Sedentary adults: 0.8-1.0g per kg of body weight</li>
                    <li>Active individuals: 1.2-1.4g per kg of body weight</li>
                    <li>Strength athletes: 1.6-2.2g per kg of body weight</li>
                    <li>Endurance athletes: 1.2-1.6g per kg of body weight</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Features of Our Protein Calculator</h3>
                <div className="space-y-3 text-gray-600">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Personalized calculations based on individual factors</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Activity level adjustments for accurate requirements</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Fitness goal customization for optimal results</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Health condition considerations for safety</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Protein source recommendations and meal planning</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Timing recommendations for optimal absorption</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Benefits of Using Our Calculator</h3>
                <div className="space-y-3 text-gray-600">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Optimize muscle growth and recovery</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Support weight management goals effectively</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Improve athletic performance and endurance</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Plan balanced and nutritious meals</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Free to use with instant, accurate results</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Additional SEO Content Sections */}
          <div className="mt-12 space-y-8">
            {/* Complete vs Incomplete Proteins */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Complete vs Incomplete Proteins: Understanding Protein Quality</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-gray-800">Complete Proteins</h4>
                    <p className="text-gray-600">
                      Complete proteins contain all nine essential amino acids that your body cannot produce on its own. 
                      These are typically found in animal sources and are considered high-quality proteins that provide 
                      optimal muscle protein synthesis.
                    </p>
                    <div className="bg-green-50 rounded-lg p-4">
                      <h5 className="font-semibold text-green-800 mb-2">Best Sources:</h5>
                      <ul className="text-sm text-green-700 space-y-1">
                        <li>• Chicken, turkey, and lean meats</li>
                        <li>• Fish and seafood</li>
                        <li>• Eggs and dairy products</li>
                        <li>• Quinoa and buckwheat</li>
                        <li>• Soy products (tofu, tempeh)</li>
                      </ul>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-gray-800">Incomplete Proteins</h4>
                    <p className="text-gray-600">
                      Incomplete proteins lack one or more essential amino acids. While still valuable for nutrition, 
                      they work best when combined with other protein sources to create a complete amino acid profile 
                      throughout the day.
                    </p>
                    <div className="bg-blue-50 rounded-lg p-4">
                      <h5 className="font-semibold text-blue-800 mb-2">Common Sources:</h5>
                      <ul className="text-sm text-blue-700 space-y-1">
                        <li>• Beans and legumes</li>
                        <li>• Nuts and seeds</li>
                        <li>• Grains and cereals</li>
                        <li>• Most vegetables</li>
                        <li>• Rice and wheat products</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Protein for Different Goals */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
                <CardContent className="p-8">
                  <h3 className="text-xl font-bold text-gray-900 mb-6">Protein for Muscle Building</h3>
                  <div className="space-y-4 text-gray-600">
                    <p className="text-sm">
                      Building muscle requires adequate protein intake to support muscle protein synthesis and recovery 
                      from resistance training.
                    </p>
                    <div className="space-y-3">
                      <div className="bg-orange-50 rounded-lg p-3">
                        <h4 className="font-semibold text-orange-800 text-sm">Optimal Intake:</h4>
                        <p className="text-xs text-orange-700">1.6-2.2g per kg of body weight</p>
                      </div>
                      <div className="bg-orange-50 rounded-lg p-3">
                        <h4 className="font-semibold text-orange-800 text-sm">Best Timing:</h4>
                        <p className="text-xs text-orange-700">20-25g within 2 hours post-workout</p>
                      </div>
                      <div className="bg-orange-50 rounded-lg p-3">
                        <h4 className="font-semibold text-orange-800 text-sm">Key Strategy:</h4>
                        <p className="text-xs text-orange-700">Distribute intake evenly across meals</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
                <CardContent className="p-8">
                  <h3 className="text-xl font-bold text-gray-900 mb-6">Protein for Weight Loss</h3>
                  <div className="space-y-4 text-gray-600">
                    <p className="text-sm">
                      Higher protein intake during weight loss helps preserve lean muscle mass and increases satiety, 
                      making it easier to maintain a caloric deficit.
                    </p>
                    <div className="space-y-3">
                      <div className="bg-green-50 rounded-lg p-3">
                        <h4 className="font-semibold text-green-800 text-sm">Optimal Intake:</h4>
                        <p className="text-xs text-green-700">1.2-1.6g per kg of body weight</p>
                      </div>
                      <div className="bg-green-50 rounded-lg p-3">
                        <h4 className="font-semibold text-green-800 text-sm">Benefits:</h4>
                        <p className="text-xs text-green-700">Increased metabolism and satiety</p>
                      </div>
                      <div className="bg-green-50 rounded-lg p-3">
                        <h4 className="font-semibold text-green-800 text-sm">Key Strategy:</h4>
                        <p className="text-xs text-green-700">Include protein in every meal and snack</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
                <CardContent className="p-8">
                  <h3 className="text-xl font-bold text-gray-900 mb-6">Protein for Endurance</h3>
                  <div className="space-y-4 text-gray-600">
                    <p className="text-sm">
                      Endurance athletes need additional protein to support recovery from prolonged exercise and 
                      maintain muscle mass during high training volumes.
                    </p>
                    <div className="space-y-3">
                      <div className="bg-blue-50 rounded-lg p-3">
                        <h4 className="font-semibold text-blue-800 text-sm">Optimal Intake:</h4>
                        <p className="text-xs text-blue-700">1.2-1.6g per kg of body weight</p>
                      </div>
                      <div className="bg-blue-50 rounded-lg p-3">
                        <h4 className="font-semibold text-blue-800 text-sm">Recovery Focus:</h4>
                        <p className="text-xs text-blue-700">Protein + carbs post-exercise</p>
                      </div>
                      <div className="bg-blue-50 rounded-lg p-3">
                        <h4 className="font-semibold text-blue-800 text-sm">Key Strategy:</h4>
                        <p className="text-xs text-blue-700">Consistent intake throughout training</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Common Protein Myths */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Common Protein Myths Debunked</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-r-lg">
                      <h4 className="font-semibold text-red-800 mb-2">Myth: More Protein Always Equals More Muscle</h4>
                      <p className="text-red-700 text-sm">Truth: There's an optimal range for muscle protein synthesis. Excessive protein beyond your needs won't necessarily build more muscle and may be stored as fat.</p>
                    </div>
                    <div className="bg-orange-50 border-l-4 border-orange-400 p-4 rounded-r-lg">
                      <h4 className="font-semibold text-orange-800 mb-2">Myth: Plant Proteins Are Inferior</h4>
                      <p className="text-orange-700 text-sm">Truth: While plant proteins may be incomplete individually, combining different sources throughout the day provides all essential amino acids effectively.</p>
                    </div>
                    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-lg">
                      <h4 className="font-semibold text-yellow-800 mb-2">Myth: You Must Eat Protein Immediately After Exercise</h4>
                      <p className="text-yellow-700 text-sm">Truth: The "anabolic window" is wider than once thought. Consuming protein within 2-3 hours post-workout is sufficient for most people.</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-lg">
                      <h4 className="font-semibold text-blue-800 mb-2">Myth: High Protein Damages Your Kidneys</h4>
                      <p className="text-blue-700 text-sm">Truth: For healthy individuals, high protein intake doesn't cause kidney damage. However, those with existing kidney disease should monitor protein intake carefully.</p>
                    </div>
                    <div className="bg-purple-50 border-l-4 border-purple-400 p-4 rounded-r-lg">
                      <h4 className="font-semibold text-purple-800 mb-2">Myth: Protein Supplements Are Necessary</h4>
                      <p className="text-purple-700 text-sm">Truth: Whole foods can provide all necessary protein for most people. Supplements are convenient but not essential if you eat a varied diet.</p>
                    </div>
                    <div className="bg-green-50 border-l-4 border-green-400 p-4 rounded-r-lg">
                      <h4 className="font-semibold text-green-800 mb-2">Myth: Women Need Less Protein Than Men</h4>
                      <p className="text-green-700 text-sm">Truth: While men may need more total protein due to higher body weight, protein needs per kilogram are similar for both men and women with comparable activity levels.</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Protein Timing and Absorption */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Optimal Protein Timing and Absorption</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-gray-800">Meal Distribution Strategy</h4>
                    <div className="space-y-3 text-gray-600">
                      <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-lg p-4">
                        <h5 className="font-semibold text-orange-800 mb-2">Breakfast (25-30g)</h5>
                        <p className="text-sm text-orange-700">Start your day with protein to kickstart muscle protein synthesis and maintain satiety until lunch.</p>
                      </div>
                      <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-lg p-4">
                        <h5 className="font-semibold text-orange-800 mb-2">Lunch (25-30g)</h5>
                        <p className="text-sm text-orange-700">Mid-day protein helps maintain energy levels and supports afternoon muscle recovery and growth.</p>
                      </div>
                      <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-lg p-4">
                        <h5 className="font-semibold text-orange-800 mb-2">Dinner (25-30g)</h5>
                        <p className="text-sm text-orange-700">Evening protein supports overnight muscle recovery and prevents muscle breakdown during sleep.</p>
                      </div>
                      <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-lg p-4">
                        <h5 className="font-semibold text-orange-800 mb-2">Snacks (10-15g)</h5>
                        <p className="text-sm text-orange-700">Protein-rich snacks between meals help maintain amino acid availability throughout the day.</p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-gray-800">Exercise-Specific Timing</h4>
                    <div className="space-y-3 text-gray-600">
                      <div className="bg-blue-50 rounded-lg p-4">
                        <h5 className="font-semibold text-blue-800 mb-2">Pre-Workout (1-2 hours before)</h5>
                        <p className="text-sm text-blue-700">Light protein intake can help prevent muscle breakdown during exercise and provide amino acids for immediate use.</p>
                      </div>
                      <div className="bg-green-50 rounded-lg p-4">
                        <h5 className="font-semibold text-green-800 mb-2">Post-Workout (within 2 hours)</h5>
                        <p className="text-sm text-green-700">This is when muscle protein synthesis is elevated. Aim for 20-25g of high-quality protein for optimal recovery.</p>
                      </div>
                      <div className="bg-purple-50 rounded-lg p-4">
                        <h5 className="font-semibold text-purple-800 mb-2">Before Bed</h5>
                        <p className="text-sm text-purple-700">Slow-digesting proteins like casein can provide amino acids throughout the night, supporting overnight recovery.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Protein Calculator FAQs */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-8">Frequently Asked Questions About Protein Intake</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">Can you absorb more than 30g of protein per meal?</h4>
                      <p className="text-gray-600 text-sm">Yes, your body can absorb much more than 30g per meal. This myth has been debunked by research showing that larger amounts of protein can be effectively utilized by the body.</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">Is protein powder as good as whole food protein?</h4>
                      <p className="text-gray-600 text-sm">High-quality protein powders can be just as effective as whole food proteins for muscle building. However, whole foods provide additional nutrients and tend to be more satiating.</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">Do older adults need more protein?</h4>
                      <p className="text-gray-600 text-sm">Yes, adults over 65 may benefit from higher protein intake (1.2-1.6g per kg) to help prevent age-related muscle loss and maintain bone health.</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">Can vegetarians and vegans meet their protein needs?</h4>
                      <p className="text-gray-600 text-sm">Absolutely. Plant-based diets can provide adequate protein through legumes, grains, nuts, seeds, and plant-based protein sources when properly planned.</p>
                    </div>
                  </div>
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">Does protein intake affect weight loss?</h4>
                      <p className="text-gray-600 text-sm">Higher protein intake can support weight loss by increasing satiety, preserving muscle mass during caloric restriction, and slightly increasing metabolic rate.</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">Should protein intake vary on rest days vs training days?</h4>
                      <p className="text-gray-600 text-sm">Muscle protein synthesis remains elevated for 24-48 hours after exercise, so maintaining consistent protein intake on both training and rest days is important.</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">What happens if you eat too much protein?</h4>
                      <p className="text-gray-600 text-sm">Excess protein is typically converted to glucose or stored as fat. For healthy individuals, very high protein intake isn't harmful but may be unnecessary and expensive.</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">How accurate is this protein calculator?</h4>
                      <p className="text-gray-600 text-sm">Our calculator uses evidence-based formulas and considers multiple factors for accuracy. However, individual needs may vary, and consulting a nutritionist for personalized advice is always recommended.</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Special Populations */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
                <CardContent className="p-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">Protein Needs for Special Populations</h3>
                  <div className="space-y-4">
                    <div className="border-l-4 border-pink-400 pl-4">
                      <h4 className="font-semibold text-pink-800 mb-2">Pregnant Women</h4>
                      <p className="text-pink-700 text-sm">Additional 25g protein daily during pregnancy to support fetal development and maternal tissue growth. Focus on high-quality, complete proteins.</p>
                    </div>
                    <div className="border-l-4 border-purple-400 pl-4">
                      <h4 className="font-semibold text-purple-800 mb-2">Breastfeeding Mothers</h4>
                      <p className="text-purple-700 text-sm">Extra 25g protein daily during breastfeeding to support milk production and maintain maternal muscle mass while meeting increased metabolic demands.</p>
                    </div>
                    <div className="border-l-4 border-blue-400 pl-4">
                      <h4 className="font-semibold text-blue-800 mb-2">Growing Adolescents</h4>
                      <p className="text-blue-700 text-sm">Higher protein needs (1.2-1.5g per kg) to support rapid growth, development, and increased physical activity during teenage years.</p>
                    </div>
                    <div className="border-l-4 border-green-400 pl-4">
                      <h4 className="font-semibold text-green-800 mb-2">Older Adults (65+)</h4>
                      <p className="text-green-700 text-sm">Increased protein intake (1.2-1.6g per kg) helps prevent sarcopenia, maintains bone health, and supports immune function in aging adults.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
                <CardContent className="p-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">Medical Conditions and Protein Intake</h3>
                  <div className="space-y-4">
                    <div className="border-l-4 border-red-400 pl-4">
                      <h4 className="font-semibold text-red-800 mb-2">Kidney Disease</h4>
                      <p className="text-red-700 text-sm">Reduced protein intake may be necessary to decrease kidney workload. Always consult healthcare providers for personalized recommendations.</p>
                    </div>
                    <div className="border-l-4 border-orange-400 pl-4">
                      <h4 className="font-semibold text-orange-800 mb-2">Diabetes</h4>
                      <p className="text-orange-700 text-sm">Moderate increase in protein can help with blood sugar control and satiety, but should be balanced with carbohydrate management strategies.</p>
                    </div>
                    <div className="border-l-4 border-yellow-400 pl-4">
                      <h4 className="font-semibold text-yellow-800 mb-2">Liver Disease</h4>
                      <p className="text-yellow-700 text-sm">Protein needs may be modified depending on liver function. Medical supervision is essential for determining appropriate intake levels.</p>
                    </div>
                    <div className="border-l-4 border-indigo-400 pl-4">
                      <h4 className="font-semibold text-indigo-800 mb-2">Recovery from Illness</h4>
                      <p className="text-indigo-700 text-sm">Increased protein needs during recovery from surgery, illness, or injury to support tissue repair and immune function restoration.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default ProteinIntakeCalculator;
