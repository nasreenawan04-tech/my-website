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

interface BMRResult {
  bmr: number;
  tdee: {
    sedentary: number;
    lightlyActive: number;
    moderatelyActive: number;
    veryActive: number;
    extraActive: number;
  };
  caloriesForWeightLoss: {
    mild: number;
    moderate: number;
    extreme: number;
  };
  caloriesForWeightGain: {
    mild: number;
    moderate: number;
  };
}

const BMRCalculator = () => {
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [feet, setFeet] = useState('');
  const [inches, setInches] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [unitSystem, setUnitSystem] = useState('metric');
  const [activityLevel, setActivityLevel] = useState('');
  const [result, setResult] = useState<BMRResult | null>(null);

  const calculateBMR = () => {
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

    if (weightKg && heightCm && ageYears && gender) {
      // Mifflin-St Jeor Equation (more accurate than Harris-Benedict)
      let bmr: number;
      if (gender === 'male') {
        bmr = 10 * weightKg + 6.25 * heightCm - 5 * ageYears + 5;
      } else {
        bmr = 10 * weightKg + 6.25 * heightCm - 5 * ageYears - 161;
      }

      // Calculate TDEE based on activity levels
      const tdee = {
        sedentary: bmr * 1.2,        // Little to no exercise
        lightlyActive: bmr * 1.375,  // Light exercise 1-3 days/week
        moderatelyActive: bmr * 1.55, // Moderate exercise 3-5 days/week
        veryActive: bmr * 1.725,     // Hard exercise 6-7 days/week
        extraActive: bmr * 1.9       // Very hard exercise, physical job
      };

      // Calculate calorie targets for weight management
      const selectedTDEE = activityLevel ? tdee[activityLevel as keyof typeof tdee] : tdee.moderatelyActive;
      
      const caloriesForWeightLoss = {
        mild: selectedTDEE - 250,      // 0.5 lbs/week loss
        moderate: selectedTDEE - 500,  // 1 lb/week loss
        extreme: selectedTDEE - 750    // 1.5 lbs/week loss
      };

      const caloriesForWeightGain = {
        mild: selectedTDEE + 250,      // 0.5 lbs/week gain
        moderate: selectedTDEE + 500   // 1 lb/week gain
      };

      setResult({
        bmr: Math.round(bmr),
        tdee: {
          sedentary: Math.round(tdee.sedentary),
          lightlyActive: Math.round(tdee.lightlyActive),
          moderatelyActive: Math.round(tdee.moderatelyActive),
          veryActive: Math.round(tdee.veryActive),
          extraActive: Math.round(tdee.extraActive)
        },
        caloriesForWeightLoss: {
          mild: Math.round(caloriesForWeightLoss.mild),
          moderate: Math.round(caloriesForWeightLoss.moderate),
          extreme: Math.round(caloriesForWeightLoss.extreme)
        },
        caloriesForWeightGain: {
          mild: Math.round(caloriesForWeightGain.mild),
          moderate: Math.round(caloriesForWeightGain.moderate)
        }
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

  const getActivityDescription = (level: string) => {
    const descriptions = {
      sedentary: 'Little to no exercise',
      lightlyActive: 'Light exercise 1-3 days/week',
      moderatelyActive: 'Moderate exercise 3-5 days/week',
      veryActive: 'Hard exercise 6-7 days/week',
      extraActive: 'Very hard exercise + physical job'
    };
    return descriptions[level as keyof typeof descriptions] || '';
  };

  return (
    <>
      <Helmet>
        <title>BMR Calculator - Calculate Basal Metabolic Rate & Daily Calories | DapsiWow</title>
        <meta name="description" content="Free BMR calculator to calculate your Basal Metabolic Rate and daily calorie needs. Get accurate TDEE calculations and personalized calorie targets for weight loss, muscle gain, and maintenance using the Mifflin-St Jeor equation." />
        <meta name="keywords" content="BMR calculator, basal metabolic rate calculator, daily calorie calculator, TDEE calculator, metabolism calculator, calorie needs, Mifflin St Jeor equation, weight loss calculator, muscle gain calculator, metabolic rate, daily energy expenditure, calories burned at rest, nutrition calculator, fitness calculator" />
        <meta property="og:title" content="BMR Calculator - Calculate Basal Metabolic Rate & Daily Calories | DapsiWow" />
        <meta property="og:description" content="Calculate your BMR (Basal Metabolic Rate) and daily calorie needs. Get personalized calorie targets for weight management." />
        <meta property="og:type" content="website" />
        <link rel="canonical" href="/tools/bmr-calculator" />
      </Helmet>

      <div className="min-h-screen flex flex-col" data-testid="page-bmr-calculator">
        <Header />
        
        <main className="flex-1 bg-neutral-50">
          {/* Hero Section */}
          <section className="text-white py-16" style={{ background: 'linear-gradient(135deg, #f43f5e 0%, #e11d48 100%)' }}>
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <div className="w-20 h-20 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <i className="fas fa-fire text-3xl"></i>
              </div>
              <h1 className="text-4xl sm:text-5xl font-bold mb-6" data-testid="text-page-title">
                BMR Calculator
              </h1>
              <p className="text-xl text-blue-100 max-w-2xl mx-auto">
                Calculate your Basal Metabolic Rate (BMR) and daily calorie needs for optimal health and fitness
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
                          Activity Level <span className="text-gray-400 font-normal">- Optional for TDEE calculation</span>
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
                          onClick={calculateBMR}
                          className="flex-1 h-12 text-white font-medium rounded-lg"
                          style={{ backgroundColor: '#f43f5e' }}
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#e11d48'}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#f43f5e'}
                          data-testid="button-calculate"
                        >
                          <Calculator className="w-4 h-4 mr-2" />
                          Calculate BMR
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
                      <h2 className="text-2xl font-semibold text-gray-900 mb-8">Calculation Results</h2>
                      
                      {result ? (
                        <div className="space-y-4" data-testid="bmr-results">
                          {/* BMR Value */}
                          <div className="bg-white rounded-lg p-4 border-l-4 border-orange-500">
                            <div className="flex justify-between items-center">
                              <span className="font-semibold text-gray-700">Basal Metabolic Rate (BMR)</span>
                              <span className="text-2xl font-bold text-orange-600" data-testid="text-bmr-value">
                                {result.bmr} cal/day
                              </span>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">Calories burned at rest</p>
                          </div>

                          {/* TDEE Values */}
                          <div className="bg-white rounded-lg p-4">
                            <h3 className="font-semibold text-gray-900 mb-3">Total Daily Energy Expenditure (TDEE)</h3>
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between items-center py-1">
                                <span className="text-gray-600">Sedentary</span>
                                <span className="font-medium" data-testid="text-sedentary">
                                  {result.tdee.sedentary} cal/day
                                </span>
                              </div>
                              <div className="flex justify-between items-center py-1">
                                <span className="text-gray-600">Lightly Active</span>
                                <span className="font-medium" data-testid="text-lightly-active">
                                  {result.tdee.lightlyActive} cal/day
                                </span>
                              </div>
                              <div className="flex justify-between items-center py-1">
                                <span className="text-gray-600">Moderately Active</span>
                                <span className="font-medium" data-testid="text-moderately-active">
                                  {result.tdee.moderatelyActive} cal/day
                                </span>
                              </div>
                              <div className="flex justify-between items-center py-1">
                                <span className="text-gray-600">Very Active</span>
                                <span className="font-medium" data-testid="text-very-active">
                                  {result.tdee.veryActive} cal/day
                                </span>
                              </div>
                              <div className="flex justify-between items-center py-1">
                                <span className="text-gray-600">Extra Active</span>
                                <span className="font-medium" data-testid="text-extra-active">
                                  {result.tdee.extraActive} cal/day
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Weight Management Recommendations */}
                          {activityLevel && (
                            <div className="space-y-3">
                              {/* Weight Loss */}
                              <div className="bg-red-50 rounded-lg p-4">
                                <h3 className="font-semibold text-gray-900 mb-2">Weight Loss Calories</h3>
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
                                    <span className="font-medium" data-testid="text-weight-loss-extreme">
                                      {result.caloriesForWeightLoss.extreme} cal/day
                                    </span>
                                  </div>
                                </div>
                              </div>

                              {/* Weight Gain */}
                              <div className="bg-green-50 rounded-lg p-4">
                                <h3 className="font-semibold text-gray-900 mb-2">Weight Gain Calories</h3>
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
                          )}

                          {!activityLevel && (
                            <div className="bg-blue-50 rounded-lg p-4">
                              <p className="text-sm text-blue-700">
                                💡 Select an activity level to see personalized calorie recommendations for weight management.
                              </p>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="text-center py-8" data-testid="no-results">
                          <i className="fas fa-fire text-4xl text-gray-400 mb-4"></i>
                          <p className="text-gray-500">Enter your information to calculate BMR and daily calorie needs</p>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* SEO Content Section */}
              <div className="mt-12 mb-16">
                <div className="text-center mb-12">
                  <h2 className="text-3xl font-bold text-gray-900 mb-6">
                    Free BMR Calculator - Calculate Basal Metabolic Rate & Daily Calorie Needs
                  </h2>
                  <p className="text-lg text-gray-600 max-w-4xl mx-auto leading-relaxed">
                    Calculate your BMR (Basal Metabolic Rate) and TDEE (Total Daily Energy Expenditure) with our accurate, 
                    science-based calculator. Get personalized calorie recommendations for weight loss, muscle gain, and 
                    maintenance. Perfect for fitness enthusiasts, dietitians, personal trainers, and anyone looking to 
                    optimize their nutrition and achieve their health goals.
                  </p>
                </div>

                {/* Key Benefits */}
                <div className="bg-gradient-to-r from-rose-50 to-pink-50 rounded-2xl p-8 mb-12">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">Why Use Our BMR Calculator?</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="bg-white rounded-lg p-6 shadow-sm">
                      <i className="fas fa-calculator text-2xl text-rose-600 mb-4"></i>
                      <h4 className="text-lg font-semibold text-gray-900 mb-3">Accurate Calculations</h4>
                      <p className="text-gray-600 text-sm">
                        Uses the scientifically validated Mifflin-St Jeor equation, proven to be more accurate 
                        than older Harris-Benedict formulas.
                      </p>
                    </div>
                    
                    <div className="bg-white rounded-lg p-6 shadow-sm">
                      <i className="fas fa-globe text-2xl text-rose-600 mb-4"></i>
                      <h4 className="text-lg font-semibold text-gray-900 mb-3">Multiple Units</h4>
                      <p className="text-gray-600 text-sm">
                        Supports both metric (kg, cm) and imperial (lbs, ft/in) measurement systems 
                        for worldwide accessibility.
                      </p>
                    </div>
                    
                    <div className="bg-white rounded-lg p-6 shadow-sm">
                      <i className="fas fa-chart-line text-2xl text-rose-600 mb-4"></i>
                      <h4 className="text-lg font-semibold text-gray-900 mb-3">Complete Analysis</h4>
                      <p className="text-gray-600 text-sm">
                        Get BMR, TDEE for all activity levels, plus specific calorie targets 
                        for weight management goals.
                      </p>
                    </div>
                    
                    <div className="bg-white rounded-lg p-6 shadow-sm">
                      <i className="fas fa-mobile-alt text-2xl text-rose-600 mb-4"></i>
                      <h4 className="text-lg font-semibold text-gray-900 mb-3">Mobile Friendly</h4>
                      <p className="text-gray-600 text-sm">
                        Responsive design works perfectly on desktop, tablet, and mobile devices 
                        for calculations on-the-go.
                      </p>
                    </div>
                    
                    <div className="bg-white rounded-lg p-6 shadow-sm">
                      <i className="fas fa-user-md text-2xl text-rose-600 mb-4"></i>
                      <h4 className="text-lg font-semibold text-gray-900 mb-3">Professional Grade</h4>
                      <p className="text-gray-600 text-sm">
                        Trusted by fitness professionals, nutritionists, and healthcare providers 
                        for accurate metabolic assessments.
                      </p>
                    </div>
                    
                    <div className="bg-white rounded-lg p-6 shadow-sm">
                      <i className="fas fa-lock text-2xl text-rose-600 mb-4"></i>
                      <h4 className="text-lg font-semibold text-gray-900 mb-3">Privacy First</h4>
                      <p className="text-gray-600 text-sm">
                        All calculations are performed locally in your browser. Your personal 
                        health data never leaves your device.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Use Cases */}
                <div className="bg-white rounded-2xl shadow-lg p-8 mb-12">
                  <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">Who Can Benefit from BMR Calculations?</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <h4 className="text-xl font-semibold text-gray-900 mb-4">Fitness & Weight Management</h4>
                      <ul className="text-gray-600 space-y-2 text-sm">
                        <li>• <strong>Weight Loss:</strong> Calculate precise calorie deficits for sustainable fat loss</li>
                        <li>• <strong>Muscle Building:</strong> Determine calorie surplus needed for lean muscle gain</li>
                        <li>• <strong>Body Recomposition:</strong> Balance calories for simultaneous fat loss and muscle gain</li>
                        <li>• <strong>Athletic Performance:</strong> Optimize nutrition for training and competition</li>
                        <li>• <strong>Metabolic Health:</strong> Monitor changes in metabolism over time</li>
                      </ul>
                    </div>
                    
                    <div>
                      <h4 className="text-xl font-semibold text-gray-900 mb-4">Professional Applications</h4>
                      <ul className="text-gray-600 space-y-2 text-sm">
                        <li>• <strong>Personal Trainers:</strong> Create evidence-based nutrition plans for clients</li>
                        <li>• <strong>Dietitians:</strong> Assess metabolic needs for meal planning</li>
                        <li>• <strong>Healthcare Providers:</strong> Evaluate metabolic health in patients</li>
                        <li>• <strong>Researchers:</strong> Baseline metabolic measurements for studies</li>
                        <li>• <strong>Wellness Coaches:</strong> Holistic health assessments</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              {/* Educational Content */}
              <div className="mt-12 space-y-8">
                {/* Understanding BMR */}
                <div className="bg-white rounded-2xl shadow-lg p-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-8">Understanding BMR & Metabolism</h2>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-4">What is BMR?</h3>
                      <p className="text-gray-600 mb-6 leading-relaxed">
                        BMR (Basal Metabolic Rate) is the number of calories your body needs to perform basic physiological 
                        functions at rest. This includes breathing, circulation, cell production, nutrient processing, 
                        and protein synthesis. BMR accounts for about 60-75% of total daily energy expenditure in sedentary individuals.
                      </p>
                      
                      <h3 className="text-xl font-semibold text-gray-900 mb-4">Mifflin-St Jeor Formula</h3>
                      <div className="bg-orange-50 rounded-lg p-4 mb-4">
                        <p className="font-mono text-sm text-orange-800 font-semibold">
                          <strong>Men:</strong> BMR = 10 × weight(kg) + 6.25 × height(cm) - 5 × age + 5<br />
                          <strong>Women:</strong> BMR = 10 × weight(kg) + 6.25 × height(cm) - 5 × age - 161
                        </p>
                      </div>
                      <p className="text-gray-600 text-sm">
                        This formula is considered more accurate than the older Harris-Benedict equation.
                      </p>
                    </div>
                    
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-4">Factors Affecting BMR</h3>
                      <ul className="text-gray-600 space-y-2 text-sm">
                        <li className="flex items-start">
                          <i className="fas fa-check-circle text-green-500 mt-1 mr-3"></i>
                          <span><strong>Body Size:</strong> Larger bodies burn more calories at rest</span>
                        </li>
                        <li className="flex items-start">
                          <i className="fas fa-check-circle text-green-500 mt-1 mr-3"></i>
                          <span><strong>Muscle Mass:</strong> Muscle tissue burns more calories than fat</span>
                        </li>
                        <li className="flex items-start">
                          <i className="fas fa-check-circle text-green-500 mt-1 mr-3"></i>
                          <span><strong>Age:</strong> BMR typically decreases with age</span>
                        </li>
                        <li className="flex items-start">
                          <i className="fas fa-check-circle text-green-500 mt-1 mr-3"></i>
                          <span><strong>Gender:</strong> Men generally have higher BMR than women</span>
                        </li>
                        <li className="flex items-start">
                          <i className="fas fa-check-circle text-green-500 mt-1 mr-3"></i>
                          <span><strong>Genetics:</strong> Some people naturally have faster metabolisms</span>
                        </li>
                        <li className="flex items-start">
                          <i className="fas fa-check-circle text-green-500 mt-1 mr-3"></i>
                          <span><strong>Hormones:</strong> Thyroid hormones significantly affect metabolism</span>
                        </li>
                      </ul>

                      <h3 className="text-xl font-semibold text-gray-900 mb-4 mt-6">Boosting Your Metabolism</h3>
                      <ul className="text-gray-600 space-y-2 text-sm">
                        <li>• Build muscle through strength training</li>
                        <li>• Stay active throughout the day</li>
                        <li>• Eat protein-rich foods (thermic effect)</li>
                        <li>• Get adequate sleep (7-9 hours)</li>
                        <li>• Stay hydrated and drink green tea</li>
                        <li>• Consider high-intensity interval training (HIIT)</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* TDEE and Activity Levels */}
                <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-2xl p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Understanding TDEE & Activity Levels</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="bg-white rounded-lg p-6 shadow-sm">
                      <i className="fas fa-bed text-2xl text-blue-600 mb-4"></i>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Sedentary (1.2x BMR)</h3>
                      <p className="text-gray-600 text-sm">
                        Desk job, little to no exercise, mostly sitting or lying down. 
                        Typical for office workers who don't exercise regularly.
                      </p>
                    </div>
                    
                    <div className="bg-white rounded-lg p-6 shadow-sm">
                      <i className="fas fa-walking text-2xl text-green-600 mb-4"></i>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Lightly Active (1.375x BMR)</h3>
                      <p className="text-gray-600 text-sm">
                        Light exercise or sports 1-3 days per week. May include light jogging, 
                        yoga, or recreational activities on weekends.
                      </p>
                    </div>
                    
                    <div className="bg-white rounded-lg p-6 shadow-sm">
                      <i className="fas fa-running text-2xl text-orange-600 mb-4"></i>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Moderately Active (1.55x BMR)</h3>
                      <p className="text-gray-600 text-sm">
                        Moderate exercise 3-5 days per week. Regular gym sessions, 
                        sports activities, or consistent workout routines.
                      </p>
                    </div>
                    
                    <div className="bg-white rounded-lg p-6 shadow-sm">
                      <i className="fas fa-bicycle text-2xl text-purple-600 mb-4"></i>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Very Active (1.725x BMR)</h3>
                      <p className="text-gray-600 text-sm">
                        Hard exercise 6-7 days per week. Intensive training, 
                        competitive sports, or very demanding fitness regimens.
                      </p>
                    </div>
                    
                    <div className="bg-white rounded-lg p-6 shadow-sm">
                      <i className="fas fa-dumbbell text-2xl text-red-600 mb-4"></i>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Extra Active (1.9x BMR)</h3>
                      <p className="text-gray-600 text-sm">
                        Very hard exercise plus a physical job. Athletes in training, 
                        construction workers, or those with very demanding physical careers.
                      </p>
                    </div>
                    
                    <div className="bg-white rounded-lg p-6 shadow-sm">
                      <i className="fas fa-chart-line text-2xl text-indigo-600 mb-4"></i>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Weight Management</h3>
                      <p className="text-gray-600 text-sm">
                        Use TDEE to set calorie targets: subtract 250-750 calories for weight loss, 
                        add 250-500 calories for weight gain.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Frequently Asked Questions */}
                <div className="bg-white rounded-2xl shadow-lg p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">Frequently Asked Questions About BMR</h2>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-3">What is the difference between BMR and TDEE?</h3>
                        <p className="text-gray-600 text-sm leading-relaxed">
                          BMR (Basal Metabolic Rate) is the calories your body burns at complete rest for basic functions. 
                          TDEE (Total Daily Energy Expenditure) includes BMR plus calories burned through physical activity, 
                          exercise, and daily movement. TDEE is what you need for weight maintenance.
                        </p>
                      </div>
                      
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-3">How accurate are BMR calculators?</h3>
                        <p className="text-gray-600 text-sm leading-relaxed">
                          Our calculator uses the Mifflin-St Jeor equation, which is accurate within ±10% for most people. 
                          Factors like muscle mass, body fat percentage, and metabolic health can affect individual results. 
                          For the most precise measurement, consider indirect calorimetry testing.
                        </p>
                      </div>
                      
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-3">Should I eat below my BMR for weight loss?</h3>
                        <p className="text-gray-600 text-sm leading-relaxed">
                          Generally, it's not recommended to eat below your BMR long-term as this can slow metabolism 
                          and lead to muscle loss. Instead, create a moderate deficit from your TDEE (300-500 calories) 
                          for sustainable weight loss while preserving muscle mass.
                        </p>
                      </div>
                      
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-3">How often should I recalculate my BMR?</h3>
                        <p className="text-gray-600 text-sm leading-relaxed">
                          Recalculate your BMR every 10-15 pounds of weight change, or every 3-6 months. 
                          As you lose weight or age, your BMR decreases. Regular recalculation ensures 
                          your calorie targets remain accurate for continued progress.
                        </p>
                      </div>
                    </div>
                    
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-3">Can medications affect my BMR?</h3>
                        <p className="text-gray-600 text-sm leading-relaxed">
                          Yes, certain medications can significantly impact metabolism. Thyroid medications, 
                          antidepressants, diabetes medications, and steroids can all affect BMR. 
                          Consult your healthcare provider about how medications might influence your metabolic rate.
                        </p>
                      </div>
                      
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-3">Why is my BMR lower than expected?</h3>
                        <p className="text-gray-600 text-sm leading-relaxed">
                          Several factors can lower BMR: previous extreme dieting (metabolic adaptation), 
                          low muscle mass, thyroid issues, age, genetics, or chronic stress. 
                          Building muscle through strength training can help increase metabolic rate.
                        </p>
                      </div>
                      
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-3">How does age affect BMR?</h3>
                        <p className="text-gray-600 text-sm leading-relaxed">
                          BMR typically decreases by 1-2% per decade after age 30, primarily due to muscle loss 
                          and hormonal changes. Regular strength training, adequate protein intake, and maintaining 
                          muscle mass can help minimize age-related metabolic decline.
                        </p>
                      </div>
                      
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-3">What's the best way to increase BMR?</h3>
                        <p className="text-gray-600 text-sm leading-relaxed">
                          Build lean muscle through resistance training, as muscle tissue burns more calories at rest. 
                          Eat adequate protein, stay hydrated, get quality sleep, and consider HIIT workouts. 
                          These strategies can boost your metabolic rate naturally and sustainably.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Related Tools */}
                <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-2xl p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Related Health & Fitness Calculators</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <a href="/tools/bmi-calculator" className="bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
                      <i className="fas fa-weight text-2xl text-blue-600 mb-3"></i>
                      <h3 className="font-semibold text-gray-900 mb-2">BMI Calculator</h3>
                      <p className="text-gray-600 text-xs">Calculate Body Mass Index and health status</p>
                    </a>
                    
                    <a href="/tools/tdee-calculator" className="bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
                      <i className="fas fa-running text-2xl text-green-600 mb-3"></i>
                      <h3 className="font-semibold text-gray-900 mb-2">TDEE Calculator</h3>
                      <p className="text-gray-600 text-xs">Total Daily Energy Expenditure calculator</p>
                    </a>
                    
                    <a href="/tools/body-fat-calculator" className="bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
                      <i className="fas fa-percentage text-2xl text-orange-600 mb-3"></i>
                      <h3 className="font-semibold text-gray-900 mb-2">Body Fat Calculator</h3>
                      <p className="text-gray-600 text-xs">Estimate body fat percentage accurately</p>
                    </a>
                    
                    <a href="/tools/calorie-calculator" className="bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
                      <i className="fas fa-utensils text-2xl text-purple-600 mb-3"></i>
                      <h3 className="font-semibold text-gray-900 mb-2">Calorie Calculator</h3>
                      <p className="text-gray-600 text-xs">Calculate daily calorie needs for goals</p>
                    </a>
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

export default BMRCalculator;