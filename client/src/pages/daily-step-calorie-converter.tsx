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
import { Calculator } from 'lucide-react';

interface CalorieResult {
  caloriesBurned: number;
  stepCategory: string;
  distanceWalked: number;
  activityIntensity: string;
  weeklyCalories: number;
  monthlyCalories: number;
  weightLossEquivalent: number;
}

const DailyStepCalorieConverter = () => {
  const [steps, setSteps] = useState('');
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [feet, setFeet] = useState('');
  const [inches, setInches] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
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
      // Imperial system
      weightKg = parseFloat(weight) * 0.453592; // Convert lbs to kg
      const totalInches = (parseFloat(feet) * 12) + parseFloat(inches);
      heightM = totalInches * 0.0254; // Convert inches to meters
    }

    const stepCount = parseFloat(steps);
    const ageYears = parseFloat(age);

    if (stepCount && weightKg && heightM && ageYears && gender) {
      // Calculate stride length based on height and gender
      let strideLength: number;
      if (gender === 'male') {
        strideLength = heightM * 0.415; // meters
      } else {
        strideLength = heightM * 0.413; // meters
      }

      // Calculate distance walked
      const distanceKm = (stepCount * strideLength) / 1000;
      const distanceMiles = distanceKm * 0.621371;
      const displayDistance = unitSystem === 'metric' ? distanceKm : distanceMiles;

      // Base calories per step calculation
      // Formula: calories per step = (weight in kg * 0.57) / 2000
      const baseCaloriesPerStep = (weightKg * 0.57) / 2000;

      // Apply intensity multiplier
      const intensity = intensityLevels[intensityLevel as keyof typeof intensityLevels];
      const caloriesPerStep = baseCaloriesPerStep * intensity.multiplier;
      
      // Apply age and gender adjustments
      let ageMultiplier = 1.0;
      if (ageYears > 40) ageMultiplier = 0.95;
      if (ageYears > 60) ageMultiplier = 0.90;
      
      let genderMultiplier = gender === 'male' ? 1.0 : 0.88;
      
      const totalCalories = stepCount * caloriesPerStep * ageMultiplier * genderMultiplier;

      // Determine step category
      let stepCategory = '';
      if (stepCount < 5000) stepCategory = 'Sedentary';
      else if (stepCount < 7500) stepCategory = 'Lightly Active';
      else if (stepCount < 10000) stepCategory = 'Somewhat Active';
      else if (stepCount < 12500) stepCategory = 'Active';
      else stepCategory = 'Highly Active';

      // Calculate weekly and monthly projections
      const weeklyCalories = totalCalories * 7;
      const monthlyCalories = totalCalories * 30;

      // Calculate weight loss equivalent (3500 calories = 1 pound of fat)
      const weightLossLbs = monthlyCalories / 3500;
      const weightLossKg = weightLossLbs * 0.453592;
      const weightLossDisplay = unitSystem === 'metric' ? weightLossKg : weightLossLbs;

      setResult({
        caloriesBurned: Math.round(totalCalories * 100) / 100,
        stepCategory,
        distanceWalked: Math.round(displayDistance * 100) / 100,
        activityIntensity: intensity.name,
        weeklyCalories: Math.round(weeklyCalories),
        monthlyCalories: Math.round(monthlyCalories),
        weightLossEquivalent: Math.round(weightLossDisplay * 100) / 100
      });
    }
  };

  const resetCalculator = () => {
    setSteps('');
    setWeight('');
    setHeight('');
    setFeet('');
    setInches('');
    setAge('');
    setGender('');
    setIntensityLevel('moderate');
    setUnitSystem('metric');
    setResult(null);
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

  const formatDistance = (distance: number) => {
    const unit = unitSystem === 'metric' ? 'km' : 'miles';
    return `${distance.toFixed(2)} ${unit}`;
  };

  const formatWeight = (weight: number) => {
    const unit = unitSystem === 'metric' ? 'kg' : 'lbs';
    return `${weight.toFixed(2)} ${unit}`;
  };

  return (
    <>
      <Helmet>
        <title>Daily Step to Calorie Converter - Calculate Calories Burned Walking | DapsiWow</title>
        <meta name="description" content="Convert your daily steps to calories burned. Calculate distance walked, weight loss potential, and activity level based on steps worldwide." />
        <meta name="keywords" content="step calorie calculator, steps to calories converter, walking calorie calculator, daily steps tracker, calories burned walking" />
        <meta property="og:title" content="Daily Step to Calorie Converter - Calculate Calories Burned Walking | DapsiWow" />
        <meta property="og:description" content="Convert your daily steps to calories burned with personalized calculations for worldwide users." />
        <meta property="og:type" content="website" />
        <link rel="canonical" href="/tools/daily-step-calorie-converter" />
      </Helmet>

      <div className="min-h-screen flex flex-col" data-testid="page-step-calorie-converter">
        <Header />
        
        <main className="flex-1 bg-neutral-50">
          {/* Hero Section */}
          <section className="text-white py-16" style={{ background: 'linear-gradient(135deg, #f43f5e 0%, #e11d48 100%)' }}>
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <div className="w-20 h-20 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <i className="fas fa-walking text-3xl"></i>
              </div>
              <h1 className="text-4xl sm:text-5xl font-bold mb-6" data-testid="text-page-title">
                Step to Calorie Converter
              </h1>
              <p className="text-xl text-blue-100 max-w-2xl mx-auto">
                Convert your daily steps to calories burned and track your fitness progress with worldwide support
              </p>
            </div>
          </section>

          {/* Calculator Section */}
          <section className="py-16">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
              <Card className="bg-white shadow-sm border-0">
                <CardContent className="p-8">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    {/* Input Section */}
                    <div className="space-y-6">
                      <h2 className="text-2xl font-semibold text-gray-900 mb-8">Step & Personal Information</h2>
                      
                      {/* Unit System */}
                      <div className="space-y-3">
                        <Label>Unit System</Label>
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

                      {/* Daily Steps */}
                      <div className="space-y-3">
                        <Label htmlFor="steps" className="text-sm font-medium text-gray-700">
                          Daily Steps *
                        </Label>
                        <Input
                          id="steps"
                          type="number"
                          value={steps}
                          onChange={(e) => setSteps(e.target.value)}
                          className="h-12 text-base border-gray-200 rounded-lg"
                          placeholder="10000"
                          min="0"
                          data-testid="input-steps"
                        />
                      </div>

                      {/* Weight */}
                      <div className="space-y-3">
                        <Label htmlFor="weight" className="text-sm font-medium text-gray-700">
                          Weight {unitSystem === 'metric' ? '(kg)' : '(lbs)'} *
                        </Label>
                        <Input
                          id="weight"
                          type="number"
                          value={weight}
                          onChange={(e) => setWeight(e.target.value)}
                          className="h-12 text-base border-gray-200 rounded-lg"
                          placeholder={unitSystem === 'metric' ? "70" : "154"}
                          min="0"
                          step="0.1"
                          data-testid="input-weight"
                        />
                      </div>

                      {/* Height */}
                      <div className="space-y-3">
                        <Label className="text-sm font-medium text-gray-700">
                          Height {unitSystem === 'metric' ? '(cm)' : '(ft/in)'} *
                        </Label>
                        {unitSystem === 'metric' ? (
                          <Input
                            type="number"
                            value={height}
                            onChange={(e) => setHeight(e.target.value)}
                            className="h-12 text-base border-gray-200 rounded-lg"
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
                                className="h-12 text-base border-gray-200 rounded-lg"
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
                                className="h-12 text-base border-gray-200 rounded-lg"
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
                        <Label htmlFor="age" className="text-sm font-medium text-gray-700">
                          Age (years) *
                        </Label>
                        <Input
                          id="age"
                          type="number"
                          value={age}
                          onChange={(e) => setAge(e.target.value)}
                          className="h-12 text-base border-gray-200 rounded-lg"
                          placeholder="30"
                          min="1"
                          max="120"
                          data-testid="input-age"
                        />
                      </div>

                      {/* Gender */}
                      <div className="space-y-3">
                        <Label className="text-sm font-medium text-gray-700">
                          Gender *
                        </Label>
                        <Select value={gender} onValueChange={setGender}>
                          <SelectTrigger className="h-12 border-gray-200 rounded-lg" data-testid="select-gender">
                            <SelectValue placeholder="Select gender" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="male">Male</SelectItem>
                            <SelectItem value="female">Female</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Walking Intensity */}
                      <div className="space-y-3">
                        <Label className="text-sm font-medium text-gray-700">
                          Walking Intensity
                        </Label>
                        <Select value={intensityLevel} onValueChange={setIntensityLevel}>
                          <SelectTrigger className="h-12 border-gray-200 rounded-lg" data-testid="select-intensity">
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

                      {/* Action Buttons */}
                      <div className="flex gap-4 pt-6">
                        <Button
                          onClick={calculateCalories}
                          className="flex-1 h-12 text-white font-medium rounded-lg"
                          style={{ backgroundColor: '#f43f5e' }}
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#e11d48'}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#f43f5e'}
                          data-testid="button-calculate"
                        >
                          <Calculator className="w-4 h-4 mr-2" />
                          Calculate Calories
                        </Button>
                        <Button
                          onClick={resetCalculator}
                          variant="outline"
                          className="h-12 px-8 border-gray-200 text-gray-600 hover:bg-gray-50 font-medium rounded-lg"
                          data-testid="button-reset"
                        >
                          Reset
                        </Button>
                      </div>
                    </div>

                    {/* Results Section */}
                    <div className="bg-gray-50 rounded-xl p-8">
                      <h2 className="text-2xl font-semibold text-gray-900 mb-8">Calorie Results</h2>
                      
                      {result ? (
                        <div className="space-y-4" data-testid="calorie-results">
                          {/* Calories Burned Today */}
                          <div className="bg-white rounded-lg p-4 border-l-4 border-orange-500">
                            <div className="flex justify-between items-center">
                              <span className="font-semibold text-gray-700">Calories Burned</span>
                              <span className="text-2xl font-bold text-orange-600" data-testid="text-calories-burned">
                                {result.caloriesBurned}
                              </span>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">Today's walking session</p>
                          </div>

                          {/* Activity Level */}
                          <div className="bg-white rounded-lg p-4">
                            <div className="flex justify-between items-center">
                              <span className="text-gray-600">Activity Level</span>
                              <span className={`font-semibold ${getActivityColor(result.stepCategory)}`} data-testid="text-activity-level">
                                {result.stepCategory}
                              </span>
                            </div>
                          </div>

                          {/* Distance Walked */}
                          <div className="bg-white rounded-lg p-4">
                            <div className="flex justify-between items-center">
                              <span className="text-gray-600">Distance Walked</span>
                              <span className="font-medium" data-testid="text-distance">
                                {formatDistance(result.distanceWalked)}
                              </span>
                            </div>
                          </div>

                          {/* Walking Intensity */}
                          <div className="bg-white rounded-lg p-4">
                            <div className="flex justify-between items-center">
                              <span className="text-gray-600">Walking Pace</span>
                              <span className="font-medium text-sm" data-testid="text-intensity">
                                {result.activityIntensity}
                              </span>
                            </div>
                          </div>

                          {/* Projections */}
                          <div className="bg-blue-50 rounded-lg p-4">
                            <h3 className="font-semibold text-gray-900 mb-3">Calorie Projections</h3>
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span className="text-gray-600">Weekly (7 days)</span>
                                <span className="font-medium" data-testid="text-weekly-calories">
                                  {result.weeklyCalories.toLocaleString()} calories
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Monthly (30 days)</span>
                                <span className="font-medium" data-testid="text-monthly-calories">
                                  {result.monthlyCalories.toLocaleString()} calories
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Weight Loss Potential */}
                          <div className="bg-green-50 rounded-lg p-4">
                            <h3 className="font-semibold text-gray-900 mb-2">Monthly Weight Loss Potential</h3>
                            <p className="text-sm text-gray-600">
                              Walking this many steps daily could help you lose approximately{' '}
                              <span className="font-medium" data-testid="text-weight-loss">
                                {formatWeight(result.weightLossEquivalent)}
                              </span>{' '}
                              per month through exercise alone.
                            </p>
                          </div>

                          {/* Step Goals */}
                          <div className="mt-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-3">Daily Step Goals</h3>
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span>Sedentary</span>
                                <span className="text-red-600 font-medium">Less than 5,000 steps</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Lightly Active</span>
                                <span className="text-orange-600 font-medium">5,000 - 7,500 steps</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Somewhat Active</span>
                                <span className="text-yellow-600 font-medium">7,500 - 10,000 steps</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Active</span>
                                <span className="text-green-600 font-medium">10,000 - 12,500 steps</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Highly Active</span>
                                <span className="text-blue-600 font-medium">12,500+ steps</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-8" data-testid="no-results">
                          <i className="fas fa-walking text-4xl text-gray-400 mb-4"></i>
                          <p className="text-gray-500">Enter your information to calculate calories burned from steps</p>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Educational Content */}
              <div className="mt-12 space-y-8">
                {/* Walking for Health */}
                <div className="bg-white rounded-2xl shadow-lg p-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-8">Walking for Health & Fitness</h2>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-4">Why Count Steps?</h3>
                      <p className="text-gray-600 mb-6 leading-relaxed">
                        Step counting is an easy way to track your daily physical activity. Walking is one of the most 
                        accessible forms of exercise and provides numerous health benefits. The number of calories you 
                        burn depends on your weight, pace, and individual metabolism.
                      </p>
                      
                      <h3 className="text-xl font-semibold text-gray-900 mb-4">How We Calculate</h3>
                      <div className="bg-blue-50 rounded-lg p-4 mb-4">
                        <p className="text-sm text-blue-800">
                          <strong>Formula:</strong> Calories = (Steps × Weight × Intensity × Personal Factors) ÷ 2000
                        </p>
                      </div>
                      <p className="text-gray-600 text-sm">
                        We factor in your weight, height, age, gender, and walking intensity to provide accurate estimates.
                      </p>
                    </div>
                    
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-4">Health Benefits of Walking</h3>
                      <div className="space-y-3">
                        <div className="flex items-center p-3 bg-green-50 rounded-lg">
                          <div className="w-4 h-4 bg-green-500 rounded-full mr-3"></div>
                          <div>
                            <div className="font-medium">Cardiovascular Health</div>
                            <div className="text-sm text-gray-600">Strengthens heart and improves circulation</div>
                          </div>
                        </div>
                        
                        <div className="flex items-center p-3 bg-blue-50 rounded-lg">
                          <div className="w-4 h-4 bg-blue-500 rounded-full mr-3"></div>
                          <div>
                            <div className="font-medium">Weight Management</div>
                            <div className="text-sm text-gray-600">Burns calories and helps maintain healthy weight</div>
                          </div>
                        </div>
                        
                        <div className="flex items-center p-3 bg-purple-50 rounded-lg">
                          <div className="w-4 h-4 bg-purple-500 rounded-full mr-3"></div>
                          <div>
                            <div className="font-medium">Mental Wellbeing</div>
                            <div className="text-sm text-gray-600">Reduces stress and improves mood</div>
                          </div>
                        </div>
                        
                        <div className="flex items-center p-3 bg-orange-50 rounded-lg">
                          <div className="w-4 h-4 bg-orange-500 rounded-full mr-3"></div>
                          <div>
                            <div className="font-medium">Bone Strength</div>
                            <div className="text-sm text-gray-600">Improves bone density and reduces fracture risk</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Walking Tips */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Maximize Your Walking Benefits</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Getting More Steps</h3>
                      <ul className="text-gray-600 space-y-2 text-sm">
                        <li>• Take stairs instead of elevators</li>
                        <li>• Park farther away from destinations</li>
                        <li>• Take walking meetings when possible</li>
                        <li>• Walk during phone calls</li>
                        <li>• Use a standing desk with walking breaks</li>
                        <li>• Take the dog for longer walks</li>
                      </ul>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Walking Best Practices</h3>
                      <ul className="text-gray-600 space-y-2 text-sm">
                        <li>• Wear comfortable, supportive shoes</li>
                        <li>• Start slowly and gradually increase distance</li>
                        <li>• Stay hydrated, especially in hot weather</li>
                        <li>• Maintain good posture while walking</li>
                        <li>• Track your progress with a step counter</li>
                        <li>• Make it social - walk with friends or family</li>
                      </ul>
                    </div>
                  </div>
                  
                  <div className="mt-6 p-4 bg-green-100 rounded-lg border-l-4 border-green-500">
                    <p className="text-sm text-green-800">
                      <strong>Goal Setting:</strong> Aim for at least 150 minutes of moderate-intensity walking per week, 
                      or about 7,000-10,000 steps daily, as recommended by health organizations worldwide.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default DailyStepCalorieConverter;