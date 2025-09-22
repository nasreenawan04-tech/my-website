
import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Droplets, Activity, Thermometer, MapPin, Clock, Calculator, Info, CheckCircle } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ToolHeroSection from '@/components/ToolHeroSection';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';

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
    setResult(null);
    setErrors({});
  };

  return (
    <>
      <Helmet>
        <title>Hydration Calculator - Calculate Daily Water Intake Needs | DapsiWow</title>
        <meta name="description" content="Calculate your optimal daily water intake based on weight, activity level, climate, and health factors. Get personalized hydration recommendations and tips for healthy water consumption." />
        <meta name="keywords" content="hydration calculator, water intake calculator, daily water needs, hydration requirements, water consumption, dehydration prevention" />
        <meta property="og:title" content="Hydration Calculator - Calculate Daily Water Intake Needs | DapsiWow" />
        <meta property="og:description" content="Calculate your optimal daily water intake based on weight, activity level, climate, and health factors." />
        <meta property="og:type" content="website" />
        <link rel="canonical" href="https://dapsiwow.com/tools/hydration-calculator" />
      </Helmet>

      <div className="min-h-screen flex flex-col" data-testid="page-hydration-calculator">
        <Header />
        
        <main className="flex-1">
          <ToolHeroSection
            title="Hydration Calculator"
            description="Calculate your optimal daily water intake based on your weight, activity level, climate conditions, and health factors for proper hydration."
          />

          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Calculator Input */}
              <Card className="shadow-lg">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20">
                  <CardTitle className="flex items-center gap-2 text-blue-800 dark:text-blue-200">
                    <Calculator className="h-5 w-5" />
                    Hydration Calculator
                  </CardTitle>
                  <CardDescription>
                    Enter your details to calculate your daily water needs
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6 p-6">
                  {/* Weight Input */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="weight">Weight</Label>
                      <Input
                        id="weight"
                        type="number"
                        placeholder="Enter weight"
                        value={weight}
                        onChange={(e) => setWeight(e.target.value)}
                        className={errors.weight ? 'border-red-500' : ''}
                      />
                      {errors.weight && <p className="text-sm text-red-500">{errors.weight}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="weight-unit">Unit</Label>
                      <Select value={weightUnit} onValueChange={(value: 'kg' | 'lbs') => setWeightUnit(value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="kg">Kilograms</SelectItem>
                          <SelectItem value="lbs">Pounds</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Age Input */}
                  <div className="space-y-2">
                    <Label htmlFor="age">Age (years)</Label>
                    <Input
                      id="age"
                      type="number"
                      placeholder="Enter age"
                      value={age}
                      onChange={(e) => setAge(e.target.value)}
                      className={errors.age ? 'border-red-500' : ''}
                    />
                    {errors.age && <p className="text-sm text-red-500">{errors.age}</p>}
                  </div>

                  {/* Activity Level */}
                  <div className="space-y-2">
                    <Label htmlFor="activity-level">Activity Level</Label>
                    <Select value={activityLevel} onValueChange={setActivityLevel}>
                      <SelectTrigger>
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
                  <div className="space-y-2">
                    <Label htmlFor="exercise-duration">
                      <Clock className="inline w-4 h-4 mr-1" />
                      Exercise Duration (minutes/day)
                    </Label>
                    <Input
                      id="exercise-duration"
                      type="number"
                      placeholder="Enter exercise duration"
                      value={exerciseDuration}
                      onChange={(e) => setExerciseDuration(e.target.value)}
                      className={errors.exerciseDuration ? 'border-red-500' : ''}
                    />
                    {errors.exerciseDuration && <p className="text-sm text-red-500">{errors.exerciseDuration}</p>}
                  </div>

                  {/* Climate */}
                  <div className="space-y-2">
                    <Label htmlFor="climate">
                      <Thermometer className="inline w-4 h-4 mr-1" />
                      Climate Conditions
                    </Label>
                    <Select value={climate} onValueChange={setClimate}>
                      <SelectTrigger>
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
                  <div className="space-y-2">
                    <Label>Health Factors (check all that apply)</Label>
                    <div className="space-y-2">
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

                  {/* Buttons */}
                  <div className="flex gap-4">
                    <Button 
                      onClick={calculateHydration} 
                      className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
                    >
                      <Droplets className="mr-2 h-4 w-4" />
                      Calculate Hydration
                    </Button>
                    <Button onClick={resetCalculator} variant="outline" className="flex-1">
                      Reset
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Results */}
              <Card className="shadow-lg">
                <CardHeader className="bg-gradient-to-r from-cyan-50 to-blue-50 dark:from-cyan-900/20 dark:to-blue-900/20">
                  <CardTitle className="flex items-center gap-2 text-cyan-800 dark:text-cyan-200">
                    <Droplets className="h-5 w-5" />
                    Your Hydration Results
                  </CardTitle>
                  <CardDescription>
                    Personalized water intake recommendations
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  {result ? (
                    <div className="space-y-6">
                      {/* Total Water Intake */}
                      <div className="text-center p-6 bg-gradient-to-r from-blue-100 to-cyan-100 dark:from-blue-900/30 dark:to-cyan-900/30 rounded-lg">
                        <div className="text-3xl font-bold text-blue-800 dark:text-blue-200">
                          {result.totalWater} mL
                        </div>
                        <div className="text-lg text-blue-600 dark:text-blue-300">
                          Daily Water Intake
                        </div>
                        <div className="text-sm text-blue-500 dark:text-blue-400 mt-2">
                          ≈ {result.cupEquivalent} cups or {result.bottleEquivalent} bottles (500mL)
                        </div>
                      </div>

                      {/* Breakdown */}
                      <div className="space-y-3">
                        <h3 className="font-semibold text-gray-800 dark:text-gray-200">Water Intake Breakdown:</h3>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span>Base requirement:</span>
                            <span className="font-medium">{result.baseWater} mL</span>
                          </div>
                          {result.exerciseWater > 0 && (
                            <div className="flex justify-between">
                              <span>Exercise addition:</span>
                              <span className="font-medium text-orange-600">+{result.exerciseWater} mL</span>
                            </div>
                          )}
                          {result.climateWater !== 0 && (
                            <div className="flex justify-between">
                              <span>Climate adjustment:</span>
                              <span className={`font-medium ${result.climateWater > 0 ? 'text-red-600' : 'text-blue-600'}`}>
                                {result.climateWater > 0 ? '+' : ''}{result.climateWater} mL
                              </span>
                            </div>
                          )}
                          {result.healthWater > 0 && (
                            <div className="flex justify-between">
                              <span>Health factors:</span>
                              <span className="font-medium text-purple-600">+{result.healthWater} mL</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Recommendations */}
                      <div className="space-y-3">
                        <h3 className="font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          Hydration Tips:
                        </h3>
                        <ul className="space-y-2">
                          {result.recommendations.map((rec, index) => (
                            <li key={index} className="flex items-start gap-2 text-sm">
                              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                              <span>{rec}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Warning for extreme values */}
                      {result.totalWater > 4000 && (
                        <Alert>
                          <Info className="h-4 w-4" />
                          <AlertDescription>
                            Your calculated water intake is quite high. Consider consulting a healthcare professional for personalized advice.
                          </AlertDescription>
                        </Alert>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-12 text-gray-500">
                      <Droplets className="mx-auto h-12 w-12 mb-4 text-gray-300" />
                      <p>Enter your details and click "Calculate Hydration" to see your personalized water intake recommendations.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Educational Content */}
            <div className="mt-12 space-y-8">
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="text-2xl text-center">Understanding Proper Hydration</CardTitle>
                </CardHeader>
                <CardContent className="prose prose-blue max-w-none">
                  <div className="grid md:grid-cols-2 gap-8">
                    <div>
                      <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                        <Info className="h-5 w-5 text-blue-600" />
                        Why Hydration Matters
                      </h3>
                      <p className="text-gray-600 mb-4">
                        Proper hydration is essential for optimal body function. Water regulates body temperature, 
                        lubricates joints, transports nutrients, and helps remove waste products. Even mild 
                        dehydration can affect physical performance, cognitive function, and mood.
                      </p>
                      <ul className="space-y-2 text-sm text-gray-600">
                        <li>• Maintains blood volume and circulation</li>
                        <li>• Supports kidney function and waste elimination</li>
                        <li>• Regulates body temperature through sweating</li>
                        <li>• Aids digestion and nutrient absorption</li>
                        <li>• Maintains skin health and elasticity</li>
                      </ul>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                        <Activity className="h-5 w-5 text-green-600" />
                        Factors Affecting Water Needs
                      </h3>
                      <p className="text-gray-600 mb-4">
                        Your daily water requirements vary based on several factors. Our calculator considers 
                        the most important variables to provide personalized recommendations.
                      </p>
                      <ul className="space-y-2 text-sm text-gray-600">
                        <li>• <strong>Body weight:</strong> Larger bodies need more water</li>
                        <li>• <strong>Physical activity:</strong> Exercise increases fluid loss</li>
                        <li>• <strong>Climate:</strong> Hot weather increases water needs</li>
                        <li>• <strong>Health conditions:</strong> Illness can affect hydration</li>
                        <li>• <strong>Age:</strong> Older adults have different requirements</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="text-xl">Signs of Proper Hydration</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-3 gap-6">
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <CheckCircle className="mx-auto h-8 w-8 text-green-600 mb-2" />
                      <h4 className="font-semibold text-green-800">Well Hydrated</h4>
                      <ul className="text-sm text-green-700 mt-2 space-y-1">
                        <li>Pale yellow urine</li>
                        <li>Regular urination</li>
                        <li>Moist mouth and lips</li>
                        <li>Good energy levels</li>
                      </ul>
                    </div>
                    <div className="text-center p-4 bg-yellow-50 rounded-lg">
                      <Info className="mx-auto h-8 w-8 text-yellow-600 mb-2" />
                      <h4 className="font-semibold text-yellow-800">Mild Dehydration</h4>
                      <ul className="text-sm text-yellow-700 mt-2 space-y-1">
                        <li>Dark yellow urine</li>
                        <li>Dry mouth</li>
                        <li>Mild headache</li>
                        <li>Feeling tired</li>
                      </ul>
                    </div>
                    <div className="text-center p-4 bg-red-50 rounded-lg">
                      <AlertDescription className="mx-auto h-8 w-8 text-red-600 mb-2" />
                      <h4 className="font-semibold text-red-800">Severe Dehydration</h4>
                      <ul className="text-sm text-red-700 mt-2 space-y-1">
                        <li>Very dark urine</li>
                        <li>Dizziness</li>
                        <li>Rapid heartbeat</li>
                        <li>Seek medical help</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="text-xl">Hydration Tips for Different Situations</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold mb-3 flex items-center gap-2">
                        <Activity className="h-4 w-4 text-orange-600" />
                        During Exercise
                      </h4>
                      <ul className="space-y-2 text-sm text-gray-600">
                        <li>• Drink 150-250mL every 15-20 minutes during exercise</li>
                        <li>• Start hydrating 2-3 hours before intense workouts</li>
                        <li>• Consider electrolyte drinks for sessions over 1 hour</li>
                        <li>• Weigh yourself before and after to gauge fluid loss</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-3 flex items-center gap-2">
                        <Thermometer className="h-4 w-4 text-red-600" />
                        In Hot Weather
                      </h4>
                      <ul className="space-y-2 text-sm text-gray-600">
                        <li>• Increase intake by 300-500mL in hot climates</li>
                        <li>• Drink cool (not ice-cold) water for better absorption</li>
                        <li>• Include water-rich foods like fruits and vegetables</li>
                        <li>• Avoid excessive caffeine and alcohol</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Disclaimer */}
            <div className="mt-8">
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  This calculator provides general hydration guidance based on common recommendations. 
                  Individual needs may vary due to medical conditions, medications, or other factors. 
                  Consult with a healthcare professional for personalized advice, especially if you have 
                  kidney disease, heart conditions, or other health concerns.
                </AlertDescription>
              </Alert>
            </div>
          </div>
        </main>
        
        <Footer />
      </div>
    </>
  );
};

export default HydrationCalculator;
