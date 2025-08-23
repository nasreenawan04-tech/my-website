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
import { Calculator, Droplets } from 'lucide-react';

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
  const [weight, setWeight] = useState('');
  const [age, setAge] = useState('');
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
    setWeight('');
    setAge('');
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
    <>
      <Helmet>
        <title>Water Intake Calculator - Calculate Your Daily Water Needs | DapsiWow</title>
        <meta name="description" content="Calculate your daily water intake needs based on weight, activity level, climate, and health conditions. Get personalized hydration recommendations for optimal health." />
        <meta name="keywords" content="water intake calculator, daily water needs, hydration calculator, water requirement, daily fluid intake, dehydration prevention" />
        <meta property="og:title" content="Water Intake Calculator - Calculate Your Daily Water Needs | DapsiWow" />
        <meta property="og:description" content="Calculate your personalized daily water intake requirements and get hydration recommendations based on your lifestyle and health." />
        <meta property="og:type" content="website" />
        <link rel="canonical" href="/tools/water-intake-calculator" />
      </Helmet>

      <div className="min-h-screen flex flex-col" data-testid="page-water-intake-calculator">
        <Header />
        
        <main className="flex-1 bg-neutral-50">
          {/* Hero Section */}
          <section className="text-white py-16" style={{ background: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)' }}>
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <div className="w-20 h-20 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Droplets className="text-3xl w-8 h-8" />
              </div>
              <h1 className="text-4xl sm:text-5xl font-bold mb-6" data-testid="text-page-title">
                Water Intake Calculator
              </h1>
              <p className="text-xl text-sky-100 max-w-2xl mx-auto">
                Calculate your daily water intake needs based on your body, lifestyle, and environmental factors
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
                      <h2 className="text-2xl font-semibold text-gray-900 mb-8">Personal Information</h2>
                      
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
                        <Label htmlFor="weight" className="text-sm font-medium text-gray-700">
                          Weight {unitSystem === 'metric' ? '(kg)' : '(lbs)'} <span className="text-red-500">*</span>
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

                      {/* Age */}
                      <div className="space-y-3">
                        <Label htmlFor="age" className="text-sm font-medium text-gray-700">
                          Age (years) <span className="text-red-500">*</span>
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
                          Gender <span className="text-red-500">*</span>
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

                      {/* Activity Level */}
                      <div className="space-y-3">
                        <Label className="text-sm font-medium text-gray-700">
                          Activity Level <span className="text-red-500">*</span>
                        </Label>
                        <Select value={activityLevel} onValueChange={setActivityLevel}>
                          <SelectTrigger className="h-12 border-gray-200 rounded-lg" data-testid="select-activity">
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
                        <Label className="text-sm font-medium text-gray-700">
                          Climate
                        </Label>
                        <Select value={climate} onValueChange={setClimate}>
                          <SelectTrigger className="h-12 border-gray-200 rounded-lg" data-testid="select-climate">
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

                      {/* Health Conditions */}
                      <div className="space-y-3">
                        <Label className="text-sm font-medium text-gray-700">
                          Health Conditions
                        </Label>
                        <Select value={healthConditions} onValueChange={setHealthConditions}>
                          <SelectTrigger className="h-12 border-gray-200 rounded-lg" data-testid="select-health">
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
                        <>
                          <div className="space-y-3">
                            <Label className="text-sm font-medium text-gray-700">
                              Are you pregnant?
                            </Label>
                            <Select value={isPregnant} onValueChange={setIsPregnant}>
                              <SelectTrigger className="h-12 border-gray-200 rounded-lg" data-testid="select-pregnant">
                                <SelectValue placeholder="Select" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="no">No</SelectItem>
                                <SelectItem value="yes">Yes</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-3">
                            <Label className="text-sm font-medium text-gray-700">
                              Are you breastfeeding?
                            </Label>
                            <Select value={isBreastfeeding} onValueChange={setIsBreastfeeding}>
                              <SelectTrigger className="h-12 border-gray-200 rounded-lg" data-testid="select-breastfeeding">
                                <SelectValue placeholder="Select" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="no">No</SelectItem>
                                <SelectItem value="yes">Yes</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </>
                      )}

                      {/* Action Buttons */}
                      <div className="flex gap-4 pt-6">
                        <Button
                          onClick={calculateWaterIntake}
                          className="flex-1 h-12 text-white font-medium rounded-lg"
                          style={{ backgroundColor: '#0ea5e9' }}
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#0284c7'}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#0ea5e9'}
                          data-testid="button-calculate"
                        >
                          <Calculator className="w-4 h-4 mr-2" />
                          Calculate Water Intake
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
                      <h2 className="text-2xl font-semibold text-gray-900 mb-8">Water Intake Results</h2>
                      
                      {result ? (
                        <div className="space-y-4" data-testid="water-intake-results">
                          {/* Daily Water Intake */}
                          <div className="bg-white rounded-lg p-4 border-l-4 border-sky-500">
                            <div className="flex justify-between items-center">
                              <span className="font-semibold text-gray-700">Daily Water Intake</span>
                              <span className="text-2xl font-bold text-sky-600" data-testid="text-daily-intake">
                                {formatVolume(result.dailyWaterIntake)}
                              </span>
                            </div>
                          </div>

                          {/* Practical Measurements */}
                          <div className="bg-sky-50 rounded-lg p-4">
                            <h3 className="font-semibold text-gray-900 mb-3">Practical Measurements</h3>
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span>Glasses of water (250ml)</span>
                                <span className="font-medium" data-testid="text-glasses">
                                  {result.glassesOfWater} glasses
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span>Water bottles (500ml)</span>
                                <span className="font-medium" data-testid="text-bottles">
                                  {result.bottlesOfWater} bottles
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Breakdown */}
                          <div className="bg-white rounded-lg p-4">
                            <h3 className="font-semibold text-gray-900 mb-3">Calculation Breakdown</h3>
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span>Base water need</span>
                                <span className="font-medium">{formatVolume(result.baseWaterNeed)}</span>
                              </div>
                              {result.activityAdjustment > 0 && (
                                <div className="flex justify-between">
                                  <span>Activity adjustment</span>
                                  <span className="font-medium text-orange-600">+{formatVolume(result.activityAdjustment)}</span>
                                </div>
                              )}
                              {result.climateAdjustment > 0 && (
                                <div className="flex justify-between">
                                  <span>Climate adjustment</span>
                                  <span className="font-medium text-red-600">+{formatVolume(result.climateAdjustment)}</span>
                                </div>
                              )}
                              {result.healthAdjustment > 0 && (
                                <div className="flex justify-between">
                                  <span>Health/Special adjustment</span>
                                  <span className="font-medium text-purple-600">+{formatVolume(result.healthAdjustment)}</span>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Recommendations */}
                          <div className="bg-blue-50 rounded-lg p-4">
                            <h3 className="font-semibold text-gray-900 mb-3">Hydration Tips</h3>
                            <ul className="space-y-1 text-sm text-gray-600">
                              {result.recommendations.map((rec, index) => (
                                <li key={index} className="flex items-start">
                                  <span className="text-blue-500 mr-2">•</span>
                                  {rec}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-8" data-testid="no-results">
                          <Droplets className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                          <p className="text-gray-500">Enter your information to calculate daily water intake</p>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Educational Content */}
              <div className="mt-12 space-y-8">
                {/* Understanding Water Intake */}
                <div className="bg-white rounded-2xl shadow-lg p-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-8">Understanding Daily Water Intake</h2>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-4">Why Water Intake Matters</h3>
                      <p className="text-gray-600 mb-6 leading-relaxed">
                        Water is essential for virtually every bodily function, including temperature regulation, joint lubrication, 
                        nutrient transport, and waste elimination. Proper hydration helps maintain energy levels, cognitive function, 
                        and overall health.
                      </p>
                      
                      <h3 className="text-xl font-semibold text-gray-900 mb-4">Factors Affecting Water Needs</h3>
                      <ul className="text-gray-600 space-y-2 text-sm">
                        <li>• Body weight and composition</li>
                        <li>• Physical activity level</li>
                        <li>• Climate and temperature</li>
                        <li>• Overall health and medical conditions</li>
                        <li>• Pregnancy and breastfeeding</li>
                      </ul>
                    </div>
                    
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-4">Signs of Proper Hydration</h3>
                      <div className="space-y-3">
                        <div className="flex items-center p-3 bg-green-50 rounded-lg">
                          <div className="w-4 h-4 bg-green-500 rounded-full mr-3"></div>
                          <div>
                            <div className="font-medium">Pale Yellow Urine</div>
                            <div className="text-sm text-gray-600">Indicates good hydration</div>
                          </div>
                        </div>
                        
                        <div className="flex items-center p-3 bg-blue-50 rounded-lg">
                          <div className="w-4 h-4 bg-blue-500 rounded-full mr-3"></div>
                          <div>
                            <div className="font-medium">Steady Energy Levels</div>
                            <div className="text-sm text-gray-600">Proper hydration supports energy</div>
                          </div>
                        </div>
                        
                        <div className="flex items-center p-3 bg-purple-50 rounded-lg">
                          <div className="w-4 h-4 bg-purple-500 rounded-full mr-3"></div>
                          <div>
                            <div className="font-medium">Moist Skin and Lips</div>
                            <div className="text-sm text-gray-600">Skin elasticity is maintained</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Tips and Guidelines */}
                <div className="bg-gradient-to-r from-sky-50 to-blue-50 rounded-2xl p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Hydration Tips & Guidelines</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Daily Hydration Tips</h3>
                      <ul className="text-gray-600 space-y-2 text-sm">
                        <li>• Start your day with a glass of water</li>
                        <li>• Keep a water bottle with you throughout the day</li>
                        <li>• Drink water before, during, and after exercise</li>
                        <li>• Set reminders to drink water regularly</li>
                        <li>• Eat water-rich foods like fruits and vegetables</li>
                      </ul>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">When to Increase Intake</h3>
                      <ul className="text-gray-600 space-y-2 text-sm">
                        <li>• Hot or humid weather conditions</li>
                        <li>• During and after physical activity</li>
                        <li>• When experiencing fever or illness</li>
                        <li>• At high altitudes</li>
                        <li>• When consuming alcohol or caffeine</li>
                      </ul>
                    </div>
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

export default WaterIntakeCalculator;