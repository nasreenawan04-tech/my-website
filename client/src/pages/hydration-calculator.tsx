
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
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ToolSEOHead } from '@/components/seo/ToolSEOHead';
import { hydrationCalculatorSEO } from '@/config/seo/tools/hydration-calculator';

interface HydrationResult {
  baseWater: number;
  exerciseWater: number;
  climateWater: number;
  healthWater: number;
  totalWater: number;
  cupEquivalent: number;
  bottleEquivalent: number;
  recommendations: string[];
}

const HydrationCalculator = () => {
  const [weight, setWeight] = useState<string>('');
  const [weightUnit, setWeightUnit] = useState<'kg' | 'lbs'>('kg');
  const [activityLevel, setActivityLevel] = useState<string>('moderate');
  const [exerciseDuration, setExerciseDuration] = useState<string>('60');
  const [climate, setClimate] = useState<string>('temperate');
  const [healthFactors, setHealthFactors] = useState<string[]>([]);
  const [age, setAge] = useState<string>('30');
  const [gender, setGender] = useState<string>('');
  const [result, setResult] = useState<HydrationResult | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const activityLevels = {
    sedentary: { label: 'Sedentary (Little to no exercise)', multiplier: 35 },
    light: { label: 'Light (1-3 days/week)', multiplier: 40 },
    moderate: { label: 'Moderate (3-5 days/week)', multiplier: 45 },
    vigorous: { label: 'Vigorous (6-7 days/week)', multiplier: 50 },
    extreme: { label: 'Extreme (2x/day or intense training)', multiplier: 55 }
  };

  const climateTypes = {
    cold: { label: 'Cold Climate (Below 10°C/50°F)', adjustment: -200 },
    temperate: { label: 'Temperate Climate (10-25°C/50-77°F)', adjustment: 0 },
    hot: { label: 'Hot Climate (25-35°C/77-95°F)', adjustment: 300 },
    very_hot: { label: 'Very Hot Climate (Above 35°C/95°F)', adjustment: 500 }
  };

  const healthOptions = [
    { value: 'fever', label: 'Fever/Illness', addition: 300 },
    { value: 'pregnancy', label: 'Pregnancy', addition: 300 },
    { value: 'breastfeeding', label: 'Breastfeeding', addition: 500 },
    { value: 'high_altitude', label: 'High Altitude (Above 2500m)', addition: 200 },
    { value: 'medications', label: 'Diuretic Medications', addition: 250 }
  ];

  const validateInputs = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!weight || parseFloat(weight) <= 0) {
      newErrors.weight = 'Please enter a valid weight';
    }

    if (!age || parseInt(age) < 1 || parseInt(age) > 120) {
      newErrors.age = 'Please enter a valid age (1-120)';
    }

    if (!exerciseDuration || parseInt(exerciseDuration) < 0) {
      newErrors.exerciseDuration = 'Please enter valid exercise duration';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const calculateHydration = (): void => {
    if (!validateInputs()) return;

    const weightInKg = weightUnit === 'lbs' ? parseFloat(weight) / 2.205 : parseFloat(weight);
    const ageNum = parseInt(age);
    const exerciseMin = parseInt(exerciseDuration);

    // Base water calculation (ml per kg body weight)
    const baseMultiplier = activityLevels[activityLevel as keyof typeof activityLevels].multiplier;
    const baseWater = weightInKg * baseMultiplier;

    // Age adjustment (older adults need slightly less)
    const ageAdjustment = ageNum > 65 ? -100 : 0;

    // Exercise water (additional 150-250ml per 30 min of exercise)
    const exerciseWater = (exerciseMin / 30) * 200;

    // Climate adjustment
    const climateWater = climateTypes[climate as keyof typeof climateTypes].adjustment;

    // Health factors adjustment
    const healthWater = healthFactors.reduce((total, factor) => {
      const healthOption = healthOptions.find(option => option.value === factor);
      return total + (healthOption?.addition || 0);
    }, 0);

    const totalWater = Math.round(baseWater + exerciseWater + climateWater + healthWater + ageAdjustment);
    const cupEquivalent = Math.round(totalWater / 240); // 240ml per cup
    const bottleEquivalent = Math.round(totalWater / 500); // 500ml bottle

    // Generate recommendations
    const recommendations: string[] = [];
    
    if (totalWater > 3500) {
      recommendations.push('Spread your water intake throughout the day to avoid overhydration');
    }
    
    if (exerciseMin > 60) {
      recommendations.push('Drink 150-250ml every 15-20 minutes during exercise');
    }
    
    if (climate === 'hot' || climate === 'very_hot') {
      recommendations.push('Increase intake during hot weather and consider electrolyte replacement');
    }
    
    if (healthFactors.includes('pregnancy') || healthFactors.includes('breastfeeding')) {
      recommendations.push('Consult your healthcare provider for personalized hydration advice');
    }
    
    recommendations.push('Monitor urine color - pale yellow indicates good hydration');
    recommendations.push('Start your day with a glass of water and keep water visible as a reminder');

    setResult({
      baseWater: Math.round(baseWater),
      exerciseWater: Math.round(exerciseWater),
      climateWater,
      healthWater,
      totalWater,
      cupEquivalent,
      bottleEquivalent,
      recommendations
    });
  };

  const handleHealthFactorChange = (factor: string, checked: boolean) => {
    if (checked) {
      setHealthFactors([...healthFactors, factor]);
    } else {
      setHealthFactors(healthFactors.filter(f => f !== factor));
    }
  };

  const resetCalculator = () => {
    setWeight('');
    setAge('30');
    setActivityLevel('moderate');
    setExerciseDuration('60');
    setClimate('temperate');
    setHealthFactors([]);
    setGender('');
    setResult(null);
    setErrors({});
  };

  const formatWater = (amount: number) => {
    return `${amount.toFixed(0)} mL`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <ToolSEOHead config={hydrationCalculatorSEO} />
      <Helmet>
        <title>Hydration Calculator - Free Daily Water Intake Calculator | DapsiWow</title>
        <meta name="description" content="Free hydration calculator to calculate your optimal daily water intake. Get personalized recommendations based on weight, activity level, climate, and health factors with instant results." />
        <meta name="keywords" content="hydration calculator, water intake calculator, daily water needs, hydration requirements, water consumption calculator, dehydration prevention, optimal hydration, water calculator" />
        <meta property="og:title" content="Hydration Calculator - Free Daily Water Intake Calculator | DapsiWow" />
        <meta property="og:description" content="Calculate your optimal daily water intake with our free hydration calculator. Get personalized recommendations based on your lifestyle and health factors." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://dapsiwow.com/tools/hydration-calculator" />
        <meta name="robots" content="index, follow" />
        <meta name="author" content="DapsiWow" />
        <link rel="canonical" href="https://dapsiwow.com/tools/hydration-calculator" />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            "name": "Hydration Calculator",
            "description": "Free online hydration calculator to determine optimal daily water intake based on weight, activity level, climate, and health factors.",
            "url": "https://dapsiwow.com/tools/hydration-calculator",
            "applicationCategory": "HealthApplication",
            "operatingSystem": "Any",
            "permissions": "browser",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "USD"
            },
            "featureList": [
              "Calculate daily water intake needs",
              "Activity level adjustments",
              "Climate-based recommendations",
              "Health factor considerations",
              "Age and gender-specific calculations"
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
                <span className="text-xs sm:text-sm font-medium text-blue-700">Professional Hydration Calculator</span>
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl 2xl:text-8xl font-bold text-slate-900 leading-tight tracking-tight" data-testid="text-hydration-title">
                <span className="block">Smart Hydration</span>
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 mt-1 sm:mt-2">
                  Calculator
                </span>
              </h1>
              <p className="text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl text-slate-600 max-w-sm sm:max-w-lg md:max-w-2xl lg:max-w-3xl xl:max-w-4xl mx-auto leading-relaxed px-2 sm:px-0">
                Calculate your optimal daily water intake with personalized recommendations based on lifestyle and health factors
              </p>
            </div>
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-4 py-16" data-testid="page-hydration-calculator">
          {/* Main Calculator Card */}
          <Card className="bg-white/90 backdrop-blur-sm shadow-2xl border-0 rounded-3xl overflow-hidden">
            <CardContent className="p-0">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-0">
                {/* Input Section */}
                <div className="lg:col-span-2 p-8 lg:p-12 space-y-8">
                  <div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">Hydration Configuration</h2>
                    <p className="text-gray-600">Enter your details to get personalized water intake recommendations</p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Unit System */}
                    <div className="md:col-span-2 space-y-3">
                      <Label className="text-sm font-semibold text-gray-800 uppercase tracking-wide">Unit System</Label>
                      <RadioGroup 
                        value={weightUnit} 
                        onValueChange={(value: 'kg' | 'lbs') => setWeightUnit(value)}
                        className="flex gap-6"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="kg" id="metric" data-testid="radio-metric" />
                          <Label htmlFor="metric">Metric (kg)</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="lbs" id="imperial" data-testid="radio-imperial" />
                          <Label htmlFor="imperial">Imperial (lbs)</Label>
                        </div>
                      </RadioGroup>
                    </div>

                    {/* Weight */}
                    <div className="space-y-3">
                      <Label htmlFor="weight" className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                        Weight {weightUnit === 'kg' ? '(kg)' : '(lbs)'}
                      </Label>
                      <div className="relative">
                        <Input
                          id="weight"
                          type="number"
                          value={weight}
                          onChange={(e) => setWeight(e.target.value)}
                          className={`h-14 text-lg border-2 rounded-xl focus:border-blue-500 focus:ring-blue-500 ${errors.weight ? 'border-red-500' : 'border-gray-200'}`}
                          placeholder={weightUnit === 'kg' ? "70" : "154"}
                          min="0"
                          step="0.1"
                          data-testid="input-weight"
                        />
                        {errors.weight && <p className="text-sm text-red-500 mt-1">{errors.weight}</p>}
                      </div>
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
                        className={`h-14 text-lg border-2 rounded-xl focus:border-blue-500 focus:ring-blue-500 ${errors.age ? 'border-red-500' : 'border-gray-200'}`}
                        placeholder="30"
                        min="1"
                        max="120"
                        data-testid="input-age"
                      />
                      {errors.age && <p className="text-sm text-red-500 mt-1">{errors.age}</p>}
                    </div>

                    {/* Gender */}
                    <div className="space-y-3">
                      <Label className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                        Gender <span className="text-gray-400 font-normal">- Optional</span>
                      </Label>
                      <Select value={gender} onValueChange={setGender}>
                        <SelectTrigger className="h-14 border-2 border-gray-200 rounded-xl text-lg" data-testid="select-gender">
                          <SelectValue placeholder="Select gender" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="male">Male</SelectItem>
                          <SelectItem value="female">Female</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Activity Level */}
                    <div className="space-y-3">
                      <Label className="text-sm font-semibold text-gray-800 uppercase tracking-wide">Activity Level</Label>
                      <Select value={activityLevel} onValueChange={setActivityLevel}>
                        <SelectTrigger className="h-14 border-2 border-gray-200 rounded-xl text-lg">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(activityLevels).map(([key, value]) => (
                            <SelectItem key={key} value={key}>
                              {value.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Exercise Duration */}
                    <div className="space-y-3">
                      <Label htmlFor="exercise-duration" className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                        Exercise Duration (minutes/day)
                      </Label>
                      <Input
                        id="exercise-duration"
                        type="number"
                        placeholder="60"
                        value={exerciseDuration}
                        onChange={(e) => setExerciseDuration(e.target.value)}
                        className={`h-14 text-lg border-2 rounded-xl focus:border-blue-500 focus:ring-blue-500 ${errors.exerciseDuration ? 'border-red-500' : 'border-gray-200'}`}
                        min="0"
                        data-testid="input-exercise"
                      />
                      {errors.exerciseDuration && <p className="text-sm text-red-500 mt-1">{errors.exerciseDuration}</p>}
                    </div>

                    {/* Climate */}
                    <div className="space-y-3">
                      <Label className="text-sm font-semibold text-gray-800 uppercase tracking-wide">Climate Conditions</Label>
                      <Select value={climate} onValueChange={setClimate}>
                        <SelectTrigger className="h-14 border-2 border-gray-200 rounded-xl text-lg">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(climateTypes).map(([key, value]) => (
                            <SelectItem key={key} value={key}>
                              {value.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Health Factors */}
                    <div className="md:col-span-2 space-y-3">
                      <Label className="text-sm font-semibold text-gray-800 uppercase tracking-wide">Health Factors (check all that apply)</Label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {healthOptions.map((option) => (
                          <div key={option.value} className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id={option.value}
                              checked={healthFactors.includes(option.value)}
                              onChange={(e) => handleHealthFactorChange(option.value, e.target.checked)}
                              className="rounded border-gray-300"
                            />
                            <Label htmlFor={option.value} className="text-sm font-normal">
                              {option.label}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-4 pt-6">
                    <Button
                      onClick={calculateHydration}
                      className="flex-1 h-14 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold text-lg rounded-xl shadow-lg transition-colors duration-200"
                      data-testid="button-calculate"
                    >
                      Calculate Hydration
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
                  <h2 className="text-2xl font-bold text-gray-900 mb-8">Hydration Results</h2>
                  
                  {result ? (
                    <div className="space-y-6" data-testid="hydration-results">
                      {/* Water Intake Highlight */}
                      <div className="bg-white rounded-2xl p-6 shadow-lg border border-blue-100">
                        <div className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-2">Daily Water Intake</div>
                        <div className="text-4xl font-bold text-blue-600" data-testid="text-water-value">
                          {result.totalWater} mL
                        </div>
                        <div className="text-sm text-gray-500 mt-2">
                          ≈ {result.cupEquivalent} cups or {result.bottleEquivalent} bottles (500mL)
                        </div>
                      </div>

                      {/* Breakdown */}
                      <div className="bg-white rounded-xl p-4 shadow-sm">
                        <h3 className="font-semibold text-gray-700 mb-3">Water Intake Breakdown</h3>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span>Base requirement:</span>
                            <span className="font-medium">{formatWater(result.baseWater)}</span>
                          </div>
                          {result.exerciseWater > 0 && (
                            <div className="flex justify-between">
                              <span>Exercise addition:</span>
                              <span className="font-medium text-orange-600">+{formatWater(result.exerciseWater)}</span>
                            </div>
                          )}
                          {result.climateWater !== 0 && (
                            <div className="flex justify-between">
                              <span>Climate adjustment:</span>
                              <span className={`font-medium ${result.climateWater > 0 ? 'text-red-600' : 'text-blue-600'}`}>
                                {result.climateWater > 0 ? '+' : ''}{formatWater(result.climateWater)}
                              </span>
                            </div>
                          )}
                          {result.healthWater > 0 && (
                            <div className="flex justify-between">
                              <span>Health factors:</span>
                              <span className="font-medium text-purple-600">+{formatWater(result.healthWater)}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Recommendations */}
                      <div className="bg-green-50 rounded-xl p-4 border border-green-200">
                        <h3 className="font-semibold text-green-800 mb-3">Hydration Tips</h3>
                        <ul className="space-y-2">
                          {result.recommendations.map((rec, index) => (
                            <li key={index} className="flex items-start gap-2 text-sm text-green-700">
                              <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                              <span>{rec}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Warning for extreme values */}
                      {result.totalWater > 4000 && (
                        <Alert>
                          <AlertDescription>
                            Your calculated water intake is quite high. Consider consulting a healthcare professional for personalized advice.
                          </AlertDescription>
                        </Alert>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-16" data-testid="no-results">
                      <div className="w-20 h-20 bg-gray-200 rounded-full mx-auto mb-6 flex items-center justify-center">
                        <div className="text-3xl font-bold text-gray-400">H₂O</div>
                      </div>
                      <p className="text-gray-500 text-lg">Enter your details and calculate to see hydration results</p>
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
                <h3 className="text-2xl font-bold text-gray-900 mb-6">What is Daily Water Intake Calculation?</h3>
                <div className="space-y-4 text-gray-600">
                  <p>
                    Daily water intake calculation is a scientific method to determine the optimal amount of water your body 
                    needs based on individual factors like weight, activity level, climate, and health conditions. Unlike 
                    generic recommendations, personalized hydration calculations consider your unique lifestyle and physiological 
                    needs to prevent both dehydration and overhydration.
                  </p>
                  <p>
                    Our advanced hydration calculator uses evidence-based formulas that account for basal metabolic water needs, 
                    physical activity requirements, environmental factors, and special health considerations. This comprehensive 
                    approach ensures you receive accurate, personalized recommendations for optimal hydration and overall wellness.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">How to Use Our Hydration Calculator</h3>
                <div className="space-y-4 text-gray-600">
                  <p>
                    Using our hydration calculator is simple and provides instant, accurate results. Enter your weight, age, 
                    activity level, exercise duration, climate conditions, and any relevant health factors. The calculator 
                    processes this information using validated hydration formulas to generate personalized water intake 
                    recommendations with practical tips for implementation.
                  </p>
                  <div className="bg-blue-50 rounded-lg p-4">
                    <h4 className="font-semibold text-blue-800 mb-2">Basic Formula</h4>
                    <p className="font-mono text-center text-lg text-blue-700">
                      Daily Water = (Weight × 35-55ml) + Activity + Climate + Health Factors
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Factors Affecting Hydration Needs</h3>
                <div className="space-y-4">
                  <div className="flex items-center p-3 bg-blue-50 rounded-lg">
                    <div className="w-4 h-4 bg-blue-500 rounded-full mr-3"></div>
                    <div>
                      <div className="font-medium">Body Weight</div>
                      <div className="text-sm text-gray-600">Larger bodies require more water for proper cellular function</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center p-3 bg-green-50 rounded-lg">
                    <div className="w-4 h-4 bg-green-500 rounded-full mr-3"></div>
                    <div>
                      <div className="font-medium">Physical Activity</div>
                      <div className="text-sm text-gray-600">Exercise increases fluid loss through sweating and respiration</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center p-3 bg-orange-50 rounded-lg">
                    <div className="w-4 h-4 bg-orange-500 rounded-full mr-3"></div>
                    <div>
                      <div className="font-medium">Climate Conditions</div>
                      <div className="text-sm text-gray-600">Hot weather and high altitude significantly increase water needs</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center p-3 bg-red-50 rounded-lg">
                    <div className="w-4 h-4 bg-red-500 rounded-full mr-3"></div>
                    <div>
                      <div className="font-medium">Health Factors</div>
                      <div className="text-sm text-gray-600">Illness, pregnancy, and medications affect hydration requirements</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Benefits of Proper Hydration</h3>
                <div className="space-y-3 text-gray-600">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Enhanced cognitive function and mental clarity</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Improved physical performance and endurance</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Better temperature regulation and cooling</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Optimal kidney function and toxin elimination</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Healthy skin appearance and elasticity</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Additional SEO Content Sections */}
          <div className="mt-12 space-y-8">
            {/* Hydration Applications Section */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Hydration Calculator Applications</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-6">
                    <h4 className="text-lg font-semibold text-gray-900 mb-3">Athletic Performance</h4>
                    <p className="text-gray-600 text-sm">
                      Athletes use hydration calculators to optimize performance, prevent heat-related illness, and maintain 
                      electrolyte balance during training and competition. Proper hydration timing can improve endurance by up to 15%.
                    </p>
                  </div>
                  
                  <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg p-6">
                    <h4 className="text-lg font-semibold text-gray-900 mb-3">Health Management</h4>
                    <p className="text-gray-600 text-sm">
                      Healthcare providers recommend hydration calculators for patients with kidney disease, heart conditions, 
                      or diabetes to maintain optimal fluid balance and support treatment effectiveness.
                    </p>
                  </div>
                  
                  <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-lg p-6">
                    <h4 className="text-lg font-semibold text-gray-900 mb-3">Weight Management</h4>
                    <p className="text-gray-600 text-sm">
                      Proper hydration supports metabolism, reduces false hunger signals, and helps maintain healthy weight. 
                      Many successful weight loss programs incorporate personalized hydration strategies.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Hydration vs Dehydration Signs */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Recognizing Hydration Status</h3>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <h4 className="font-semibold text-green-800 mb-3">Well Hydrated</h4>
                    <ul className="text-sm text-green-700 space-y-2">
                      <li>Pale yellow urine</li>
                      <li>Regular urination (every 2-4 hours)</li>
                      <li>Moist mouth and lips</li>
                      <li>Good energy levels</li>
                      <li>Clear thinking</li>
                      <li>Elastic skin</li>
                    </ul>
                  </div>
                  <div className="text-center p-4 bg-yellow-50 rounded-lg">
                    <h4 className="font-semibold text-yellow-800 mb-3">Mild Dehydration</h4>
                    <ul className="text-sm text-yellow-700 space-y-2">
                      <li>Dark yellow urine</li>
                      <li>Dry mouth and throat</li>
                      <li>Mild headache</li>
                      <li>Feeling tired or sluggish</li>
                      <li>Reduced urination</li>
                      <li>Slight dizziness</li>
                    </ul>
                  </div>
                  <div className="text-center p-4 bg-red-50 rounded-lg">
                    <h4 className="font-semibold text-red-800 mb-3">Severe Dehydration</h4>
                    <ul className="text-sm text-red-700 space-y-2">
                      <li>Very dark or amber urine</li>
                      <li>Extreme thirst</li>
                      <li>Rapid heartbeat</li>
                      <li>Confusion or irritability</li>
                      <li>Sunken eyes</li>
                      <li>Seek medical attention</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Hydration Strategies and Water Sources */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
                <CardContent className="p-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">Effective Hydration Strategies</h3>
                  <div className="space-y-4 text-gray-600">
                    <div className="border-l-4 border-blue-400 pl-4 bg-blue-50 p-3 rounded-r-lg">
                      <h4 className="font-semibold text-blue-800 mb-2">Morning Hydration</h4>
                      <p className="text-sm text-blue-700">Start each day with 16-20oz of water to replenish overnight fluid losses and kickstart metabolism.</p>
                    </div>
                    <div className="border-l-4 border-green-400 pl-4 bg-green-50 p-3 rounded-r-lg">
                      <h4 className="font-semibold text-green-800 mb-2">Pre-Exercise Hydration</h4>
                      <p className="text-sm text-green-700">Drink 17-20oz of water 2-3 hours before exercise and 8oz 15-20 minutes before starting.</p>
                    </div>
                    <div className="border-l-4 border-orange-400 pl-4 bg-orange-50 p-3 rounded-r-lg">
                      <h4 className="font-semibold text-orange-800 mb-2">During Exercise</h4>
                      <p className="text-sm text-orange-700">Consume 6-12oz every 15-20 minutes during exercise, adjusting for sweat rate and intensity.</p>
                    </div>
                    <div className="border-l-4 border-purple-400 pl-4 bg-purple-50 p-3 rounded-r-lg">
                      <h4 className="font-semibold text-purple-800 mb-2">Evening Routine</h4>
                      <p className="text-sm text-purple-700">Gradually reduce intake 2 hours before bed to minimize sleep disruption while maintaining hydration.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
                <CardContent className="p-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">Water Sources and Quality</h3>
                  <div className="space-y-4 text-gray-600">
                    <div className="bg-blue-50 rounded-lg p-4">
                      <h4 className="font-semibold text-blue-800 mb-2">Pure Water Sources</h4>
                      <p className="text-sm text-blue-700">Filtered water, spring water, and properly treated tap water provide optimal hydration without additives.</p>
                    </div>
                    <div className="bg-green-50 rounded-lg p-4">
                      <h4 className="font-semibold text-green-800 mb-2">Hydrating Foods</h4>
                      <p className="text-sm text-green-700">Watermelon (92% water), cucumber (96%), oranges (87%), and soups contribute significantly to daily intake.</p>
                    </div>
                    <div className="bg-yellow-50 rounded-lg p-4">
                      <h4 className="font-semibold text-yellow-800 mb-2">Electrolyte Balance</h4>
                      <p className="text-sm text-yellow-700">For intense exercise over 1 hour, consider electrolyte replacement to maintain sodium-potassium balance.</p>
                    </div>
                    <div className="bg-red-50 rounded-lg p-4">
                      <h4 className="font-semibold text-red-800 mb-2">Avoid Dehydrating Drinks</h4>
                      <p className="text-sm text-red-700">Limit alcohol, excessive caffeine, and high-sugar beverages that can increase fluid losses.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* FAQ Section */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-8">Frequently Asked Questions About Hydration</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">How accurate are hydration calculators?</h4>
                      <p className="text-gray-600 text-sm">Hydration calculators are approximately 85-90% accurate for general populations when using validated formulas. Individual needs may vary based on genetics, health conditions, and environmental factors not captured in standard calculations.</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">Can I drink too much water?</h4>
                      <p className="text-gray-600 text-sm">Yes, overhydration (hyponatremia) can occur when drinking excessive amounts rapidly, diluting blood sodium levels. This is rare but can be serious. Follow calculated recommendations and spread intake throughout the day.</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">Do all fluids count toward hydration?</h4>
                      <p className="text-gray-600 text-sm">Most fluids contribute to hydration, including tea, coffee, milk, and soups. However, water remains the best choice as it hydrates without calories, caffeine, or other additives that may affect fluid balance.</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">When should I adjust my water intake?</h4>
                      <p className="text-gray-600 text-sm">Increase intake during illness (fever, vomiting), travel, hot weather, high altitude, pregnancy, breastfeeding, or when taking medications that affect fluid balance. Monitor urine color as a simple indicator.</p>
                    </div>
                  </div>
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">What's the best time to drink water?</h4>
                      <p className="text-gray-600 text-sm">Spread water intake throughout the day rather than consuming large amounts at once. Key times include upon waking, before meals, during exercise, and when feeling thirsty. Avoid excessive intake before bedtime.</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">How does age affect hydration needs?</h4>
                      <p className="text-gray-600 text-sm">Older adults have reduced thirst sensation and kidney function, requiring conscious effort to maintain hydration. Children have higher water turnover rates relative to body weight and need frequent fluid replenishment.</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-808 mb-2">Should athletes follow different guidelines?</h4>
                      <p className="text-gray-600 text-sm">Athletes need individualized hydration strategies based on sweat rate, exercise duration, intensity, and environmental conditions. Pre-, during, and post-exercise hydration protocols are essential for performance and safety.</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">How does climate affect water needs?</h4>
                      <p className="text-gray-600 text-sm">Hot, humid climates increase fluid losses through sweating, while cold and high-altitude environments increase respiratory fluid losses. Air conditioning and heating also affect hydration needs through humidity changes.</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Scientific Research and Health Benefits */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Scientific Research on Hydration</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="space-y-4 text-gray-600">
                    <h4 className="text-lg font-semibold text-gray-900">Research Findings</h4>
                    <p className="text-sm">
                      Recent studies show that even mild dehydration (2% body weight loss) can significantly impair cognitive 
                      performance, mood, and physical capabilities. Research published in the Journal of Nutrition demonstrates 
                      that proper hydration improves reaction time, memory, and attention span by up to 12%.
                    </p>
                    <p className="text-sm">
                      Clinical trials indicate that individuals who maintain optimal hydration levels have better cardiovascular 
                      health, improved kidney function, and enhanced exercise performance. The European Food Safety Authority 
                      recommends personalized hydration strategies based on individual factors rather than generic guidelines.
                    </p>
                    <h4 className="text-lg font-semibold text-gray-900">Metabolic Benefits</h4>
                    <p className="text-sm">
                      Proper hydration supports metabolic processes, with studies showing that drinking water can increase 
                      metabolic rate by 24-30% for up to 90 minutes. This thermogenic effect contributes to weight management 
                      and energy production at the cellular level.
                    </p>
                  </div>
                  <div className="space-y-4 text-gray-600">
                    <h4 className="text-lg font-semibold text-gray-900">Health Applications</h4>
                    <p className="text-sm">
                      Medical professionals use hydration assessments for diagnosing and managing various conditions including 
                      kidney disease, heart failure, and diabetes. Proper fluid balance is crucial for medication effectiveness 
                      and recovery from illness or surgery.
                    </p>
                    <h4 className="text-lg font-semibold text-gray-900">Future Developments</h4>
                    <p className="text-sm">
                      Emerging research focuses on personalized hydration biomarkers, smart hydration monitoring devices, and 
                      genetic factors influencing fluid requirements. Scientists are developing more precise calculation methods 
                      that account for individual metabolic differences and real-time hydration status.
                    </p>
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 mt-6">
                      <h4 className="font-semibold text-blue-800 mb-2">Did You Know?</h4>
                      <p className="text-sm text-blue-700">
                        The human brain is approximately 75% water, making proper hydration essential for optimal cognitive 
                        function. Even mild dehydration can cause brain tissue to shrink, affecting concentration and memory.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Disclaimer */}
          <div className="mt-8">
            <Alert>
              <AlertDescription>
                This hydration calculator provides general guidance based on established scientific recommendations. 
                Individual hydration needs may vary due to medical conditions, medications, or other factors. 
                Consult with a healthcare professional for personalized advice, especially if you have kidney disease, 
                heart conditions, or are taking medications that affect fluid balance.
              </AlertDescription>
            </Alert>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default HydrationCalculator;
