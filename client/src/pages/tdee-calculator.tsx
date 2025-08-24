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

interface TDEEResult {
  bmr: number;
  tdee: number;
  activityFactor: number;
  activityDescription: string;
  caloriesForWeightLoss: {
    mild: number;
    moderate: number;
    aggressive: number;
  };
  caloriesForWeightGain: {
    mild: number;
    moderate: number;
  };
  macroBreakdown: {
    protein: { grams: number; calories: number };
    carbs: { grams: number; calories: number };
    fats: { grams: number; calories: number };
  };
}

const TDEECalculator = () => {
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [feet, setFeet] = useState('');
  const [inches, setInches] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [activityLevel, setActivityLevel] = useState('');
  const [unitSystem, setUnitSystem] = useState('metric');
  const [result, setResult] = useState<TDEEResult | null>(null);

  const calculateTDEE = () => {
    let weightKg: number;
    let heightCm: number;

    if (unitSystem === 'metric') {
      weightKg = parseFloat(weight);
      heightCm = parseFloat(height);
    } else {
      // Imperial system
      weightKg = parseFloat(weight) * 0.453592; // Convert lbs to kg
      const totalInches = (parseFloat(feet) * 12) + parseFloat(inches);
      heightCm = totalInches * 2.54; // Convert inches to cm
    }

    const ageYears = parseFloat(age);

    if (weightKg && heightCm && ageYears && gender && activityLevel) {
      // Mifflin-St Jeor Equation for BMR
      let bmr: number;
      if (gender === 'male') {
        bmr = 10 * weightKg + 6.25 * heightCm - 5 * ageYears + 5;
      } else {
        bmr = 10 * weightKg + 6.25 * heightCm - 5 * ageYears - 161;
      }

      // Activity multipliers
      const activityFactors = {
        sedentary: { factor: 1.2, description: 'Little to no exercise' },
        lightlyActive: { factor: 1.375, description: 'Light exercise 1-3 days/week' },
        moderatelyActive: { factor: 1.55, description: 'Moderate exercise 3-5 days/week' },
        veryActive: { factor: 1.725, description: 'Hard exercise 6-7 days/week' },
        extraActive: { factor: 1.9, description: 'Very hard exercise + physical job' }
      };

      const selectedActivity = activityFactors[activityLevel as keyof typeof activityFactors];
      const tdee = bmr * selectedActivity.factor;

      // Weight management calorie targets
      const caloriesForWeightLoss = {
        mild: tdee - 250,      // 0.5 lbs/week loss
        moderate: tdee - 500,  // 1 lb/week loss
        aggressive: tdee - 750 // 1.5 lbs/week loss
      };

      const caloriesForWeightGain = {
        mild: tdee + 250,      // 0.5 lbs/week gain
        moderate: tdee + 500   // 1 lb/week gain
      };

      // Macro breakdown (40% carbs, 30% protein, 30% fat)
      const macroBreakdown = {
        protein: {
          calories: Math.round(tdee * 0.30),
          grams: Math.round((tdee * 0.30) / 4)
        },
        carbs: {
          calories: Math.round(tdee * 0.40),
          grams: Math.round((tdee * 0.40) / 4)
        },
        fats: {
          calories: Math.round(tdee * 0.30),
          grams: Math.round((tdee * 0.30) / 9)
        }
      };

      setResult({
        bmr: Math.round(bmr),
        tdee: Math.round(tdee),
        activityFactor: selectedActivity.factor,
        activityDescription: selectedActivity.description,
        caloriesForWeightLoss: {
          mild: Math.round(caloriesForWeightLoss.mild),
          moderate: Math.round(caloriesForWeightLoss.moderate),
          aggressive: Math.round(caloriesForWeightLoss.aggressive)
        },
        caloriesForWeightGain: {
          mild: Math.round(caloriesForWeightGain.mild),
          moderate: Math.round(caloriesForWeightGain.moderate)
        },
        macroBreakdown
      });
    }
  };

  const resetCalculator = () => {
    setWeight('');
    setHeight('');
    setFeet('');
    setInches('');
    setAge('');
    setGender('');
    setActivityLevel('');
    setUnitSystem('metric');
    setResult(null);
  };

  return (
    <>
      <Helmet>
        <title>TDEE Calculator - Calculate Total Daily Energy Expenditure | DapsiWow</title>
        <meta name="description" content="Calculate your TDEE (Total Daily Energy Expenditure) and get personalized calorie targets for weight management. Includes macro breakdown and activity levels." />
        <meta name="keywords" content="TDEE calculator, total daily energy expenditure, calorie calculator, macro calculator, daily calories, energy expenditure" />
        <meta property="og:title" content="TDEE Calculator - Calculate Total Daily Energy Expenditure | DapsiWow" />
        <meta property="og:description" content="Calculate your TDEE and get personalized calorie targets for weight management with macro breakdown." />
        <meta property="og:type" content="website" />
        <link rel="canonical" href="/tools/tdee-calculator" />
      </Helmet>

      <div className="min-h-screen flex flex-col" data-testid="page-tdee-calculator">
        <Header />
        
        <main className="flex-1 bg-neutral-50">
          {/* Hero Section */}
          <section className="text-white py-16" style={{ background: 'linear-gradient(135deg, #f43f5e 0%, #e11d48 100%)' }}>
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <div className="w-20 h-20 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <i className="fas fa-bolt text-3xl"></i>
              </div>
              <h1 className="text-4xl sm:text-5xl font-bold mb-6" data-testid="text-page-title">
                TDEE Calculator
              </h1>
              <p className="text-xl text-blue-100 max-w-2xl mx-auto">
                Calculate your Total Daily Energy Expenditure and get personalized calorie targets for optimal health
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
                            <Label htmlFor="metric">Metric (kg, cm)</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="imperial" id="imperial" data-testid="radio-imperial" />
                            <Label htmlFor="imperial">Imperial (lbs, ft/in)</Label>
                          </div>
                        </RadioGroup>
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
                          min="15"
                          max="120"
                          data-testid="input-age"
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

                      {/* Activity Level */}
                      <div className="space-y-3">
                        <Label className="text-sm font-medium text-gray-700">
                          Activity Level *
                        </Label>
                        <Select value={activityLevel} onValueChange={setActivityLevel}>
                          <SelectTrigger className="h-12 border-gray-200 rounded-lg" data-testid="select-activity">
                            <SelectValue placeholder="Select activity level" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="sedentary">Sedentary - Little to no exercise</SelectItem>
                            <SelectItem value="lightlyActive">Lightly Active - Light exercise 1-3 days/week</SelectItem>
                            <SelectItem value="moderatelyActive">Moderately Active - Moderate exercise 3-5 days/week</SelectItem>
                            <SelectItem value="veryActive">Very Active - Hard exercise 6-7 days/week</SelectItem>
                            <SelectItem value="extraActive">Extra Active - Very hard exercise + physical job</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-4 pt-6">
                        <Button
                          onClick={calculateTDEE}
                          className="flex-1 h-12 text-white font-medium rounded-lg"
                          style={{ backgroundColor: '#f43f5e' }}
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#e11d48'}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#f43f5e'}
                          data-testid="button-calculate"
                        >
                          <Calculator className="w-4 h-4 mr-2" />
                          Calculate TDEE
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
                      <h2 className="text-2xl font-semibold text-gray-900 mb-8">TDEE Results</h2>
                      
                      {result ? (
                        <div className="space-y-4" data-testid="tdee-results">
                          {/* TDEE Value */}
                          <div className="bg-white rounded-lg p-4 border-l-4 border-blue-500">
                            <div className="flex justify-between items-center">
                              <span className="font-semibold text-gray-700">Total Daily Energy Expenditure</span>
                              <span className="text-2xl font-bold text-blue-600" data-testid="text-tdee-value">
                                {result.tdee} cal/day
                              </span>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                              {result.activityDescription} (×{result.activityFactor})
                            </p>
                          </div>

                          {/* BMR Reference */}
                          <div className="bg-white rounded-lg p-4">
                            <div className="flex justify-between items-center">
                              <span className="text-gray-600">BMR (Base Metabolic Rate)</span>
                              <span className="font-medium text-gray-900" data-testid="text-bmr-value">
                                {result.bmr} cal/day
                              </span>
                            </div>
                          </div>

                          {/* Weight Management */}
                          <div className="space-y-3">
                            {/* Weight Loss */}
                            <div className="bg-red-50 rounded-lg p-4">
                              <h3 className="font-semibold text-gray-900 mb-2">Weight Loss Targets</h3>
                              <div className="space-y-1 text-sm">
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Mild Loss (0.5 lbs/week)</span>
                                  <span className="font-medium" data-testid="text-weight-loss-mild">
                                    {result.caloriesForWeightLoss.mild} cal/day
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Moderate Loss (1 lb/week)</span>
                                  <span className="font-medium" data-testid="text-weight-loss-moderate">
                                    {result.caloriesForWeightLoss.moderate} cal/day
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Aggressive Loss (1.5 lbs/week)</span>
                                  <span className="font-medium" data-testid="text-weight-loss-aggressive">
                                    {result.caloriesForWeightLoss.aggressive} cal/day
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Weight Gain */}
                            <div className="bg-green-50 rounded-lg p-4">
                              <h3 className="font-semibold text-gray-900 mb-2">Weight Gain Targets</h3>
                              <div className="space-y-1 text-sm">
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Mild Gain (0.5 lbs/week)</span>
                                  <span className="font-medium" data-testid="text-weight-gain-mild">
                                    {result.caloriesForWeightGain.mild} cal/day
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Moderate Gain (1 lb/week)</span>
                                  <span className="font-medium" data-testid="text-weight-gain-moderate">
                                    {result.caloriesForWeightGain.moderate} cal/day
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Macro Breakdown */}
                          <div className="bg-purple-50 rounded-lg p-4">
                            <h3 className="font-semibold text-gray-900 mb-3">Macro Breakdown (Maintenance)</h3>
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between items-center">
                                <span className="text-gray-600">Protein (30%)</span>
                                <span className="font-medium" data-testid="text-protein">
                                  {result.macroBreakdown.protein.grams}g ({result.macroBreakdown.protein.calories} cal)
                                </span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-gray-600">Carbohydrates (40%)</span>
                                <span className="font-medium" data-testid="text-carbs">
                                  {result.macroBreakdown.carbs.grams}g ({result.macroBreakdown.carbs.calories} cal)
                                </span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-gray-600">Fats (30%)</span>
                                <span className="font-medium" data-testid="text-fats">
                                  {result.macroBreakdown.fats.grams}g ({result.macroBreakdown.fats.calories} cal)
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-8" data-testid="no-results">
                          <i className="fas fa-bolt text-4xl text-gray-400 mb-4"></i>
                          <p className="text-gray-500">Enter your information to calculate TDEE and calorie targets</p>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Educational Content */}
              <div className="mt-12 space-y-8">
                <div className="bg-white rounded-2xl shadow-lg p-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-8">Understanding TDEE (Total Daily Energy Expenditure)</h2>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-4">What is TDEE?</h3>
                      <p className="text-gray-600 mb-6 leading-relaxed">
                        TDEE represents the total number of calories you burn per day through all activities, including 
                        basic bodily functions (BMR), physical activity, digestion, and thermogenesis. It's your complete 
                        daily energy expenditure and forms the foundation for weight management goals.
                      </p>
                      
                      <h3 className="text-xl font-semibold text-gray-900 mb-4">TDEE Formula</h3>
                      <div className="bg-blue-50 rounded-lg p-4 mb-4">
                        <p className="font-mono text-center text-lg text-blue-800 font-semibold">
                          TDEE = BMR × Activity Factor
                        </p>
                      </div>
                      <p className="text-gray-600 text-sm">
                        Activity factors range from 1.2 (sedentary) to 1.9 (extremely active)
                      </p>
                    </div>
                    
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-4">Activity Level Guidelines</h3>
                      <div className="space-y-3">
                        <div className="p-3 bg-gray-50 rounded-lg">
                          <div className="font-medium text-gray-900">Sedentary (×1.2)</div>
                          <div className="text-sm text-gray-600">Desk job, no regular exercise</div>
                        </div>
                        
                        <div className="p-3 bg-gray-50 rounded-lg">
                          <div className="font-medium text-gray-900">Lightly Active (×1.375)</div>
                          <div className="text-sm text-gray-600">Light exercise or sports 1-3 days/week</div>
                        </div>
                        
                        <div className="p-3 bg-gray-50 rounded-lg">
                          <div className="font-medium text-gray-900">Moderately Active (×1.55)</div>
                          <div className="text-sm text-gray-600">Moderate exercise 3-5 days/week</div>
                        </div>
                        
                        <div className="p-3 bg-gray-50 rounded-lg">
                          <div className="font-medium text-gray-900">Very Active (×1.725)</div>
                          <div className="text-sm text-gray-600">Hard exercise 6-7 days/week</div>
                        </div>
                        
                        <div className="p-3 bg-gray-50 rounded-lg">
                          <div className="font-medium text-gray-900">Extra Active (×1.9)</div>
                          <div className="text-sm text-gray-600">Very hard exercise + physical job</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Using Your TDEE for Goals</h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Weight Loss</h3>
                      <ul className="text-gray-600 space-y-2 text-sm">
                        <li>• Create a caloric deficit below TDEE</li>
                        <li>• 500 cal deficit = ~1 lb/week loss</li>
                        <li>• Don't go below 1200 cal/day (women) or 1500 cal/day (men)</li>
                        <li>• Combine diet with exercise for best results</li>
                      </ul>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Maintenance</h3>
                      <ul className="text-gray-600 space-y-2 text-sm">
                        <li>• Eat approximately your TDEE calories</li>
                        <li>• Monitor weight weekly</li>
                        <li>• Adjust calories by ±100-200 as needed</li>
                        <li>• Focus on nutrient-dense foods</li>
                      </ul>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Weight Gain</h3>
                      <ul className="text-gray-600 space-y-2 text-sm">
                        <li>• Create a caloric surplus above TDEE</li>
                        <li>• 500 cal surplus = ~1 lb/week gain</li>
                        <li>• Focus on lean protein and healthy fats</li>
                        <li>• Combine with strength training</li>
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

export default TDEECalculator;