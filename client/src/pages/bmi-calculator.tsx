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

interface BMIResult {
  bmi: number;
  category: string;
  healthyWeightMin: number;
  healthyWeightMax: number;
  weightToLose?: number;
  weightToGain?: number;
}

const BMICalculator = () => {
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [feet, setFeet] = useState('');
  const [inches, setInches] = useState('');
  const [unitSystem, setUnitSystem] = useState('metric');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [result, setResult] = useState<BMIResult | null>(null);

  const calculateBMI = () => {
    let weightKg: number;
    let heightM: number;

    if (unitSystem === 'metric') {
      weightKg = parseFloat(weight);
      heightM = parseFloat(height) / 100; // Convert cm to meters
    } else {
      // Imperial system
      weightKg = parseFloat(weight) * 0.453592; // Convert lbs to kg
      const totalInches = (parseFloat(feet) * 12) + parseFloat(inches);
      heightM = totalInches * 0.0254; // Convert inches to meters
    }

    if (weightKg && heightM && heightM > 0) {
      const bmi = weightKg / (heightM * heightM);
      let category = '';
      let healthyWeightMin = 18.5 * (heightM * heightM);
      let healthyWeightMax = 24.9 * (heightM * heightM);

      // Convert healthy weight to appropriate units
      if (unitSystem === 'imperial') {
        healthyWeightMin = healthyWeightMin / 0.453592; // Convert to lbs
        healthyWeightMax = healthyWeightMax / 0.453592; // Convert to lbs
      }

      if (bmi < 18.5) {
        category = 'Underweight';
      } else if (bmi >= 18.5 && bmi < 25) {
        category = 'Normal weight';
      } else if (bmi >= 25 && bmi < 30) {
        category = 'Overweight';
      } else {
        category = 'Obese';
      }

      let weightToLose: number | undefined;
      let weightToGain: number | undefined;

      const currentWeight = unitSystem === 'metric' ? weightKg : parseFloat(weight);
      const targetWeightMin = unitSystem === 'metric' ? healthyWeightMin : healthyWeightMin;
      const targetWeightMax = unitSystem === 'metric' ? healthyWeightMax : healthyWeightMax;

      if (bmi > 25) {
        weightToLose = currentWeight - targetWeightMax;
      } else if (bmi < 18.5) {
        weightToGain = targetWeightMin - currentWeight;
      }

      setResult({
        bmi: Math.round(bmi * 100) / 100,
        category,
        healthyWeightMin: Math.round(healthyWeightMin * 100) / 100,
        healthyWeightMax: Math.round(healthyWeightMax * 100) / 100,
        weightToLose: weightToLose ? Math.round(weightToLose * 100) / 100 : undefined,
        weightToGain: weightToGain ? Math.round(weightToGain * 100) / 100 : undefined
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
    setUnitSystem('metric');
    setResult(null);
  };

  const getBMIColor = (bmi: number) => {
    if (bmi < 18.5) return 'text-blue-600';
    if (bmi < 25) return 'text-green-600';
    if (bmi < 30) return 'text-orange-600';
    return 'text-red-600';
  };

  const formatWeight = (weight: number) => {
    const unit = unitSystem === 'metric' ? 'kg' : 'lbs';
    return `${weight.toFixed(1)} ${unit}`;
  };

  return (
    <>
      <Helmet>
        <title>BMI Calculator - Free Body Mass Index Calculator | DapsiWow</title>
        <meta name="description" content="Calculate your BMI (Body Mass Index) with our free calculator. Get instant results, health category, and weight recommendations. Supports metric and imperial units." />
        <meta name="keywords" content="BMI calculator, body mass index calculator, BMI chart, healthy weight calculator, weight category, obesity calculator" />
        <meta property="og:title" content="BMI Calculator - Free Body Mass Index Calculator | DapsiWow" />
        <meta property="og:description" content="Calculate your BMI (Body Mass Index) with our free calculator. Get instant results, health category, and weight recommendations." />
        <meta property="og:type" content="website" />
        <link rel="canonical" href="/tools/bmi-calculator" />
      </Helmet>

      <div className="min-h-screen flex flex-col" data-testid="page-bmi-calculator">
        <Header />
        
        <main className="flex-1 bg-neutral-50">
          {/* Hero Section */}
          <section className="text-white py-16" style={{ background: 'linear-gradient(135deg, #f43f5e 0%, #e11d48 100%)' }}>
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <div className="w-20 h-20 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <i className="fas fa-weight text-3xl"></i>
              </div>
              <h1 className="text-4xl sm:text-5xl font-bold mb-6" data-testid="text-page-title">
                BMI Calculator
              </h1>
              <p className="text-xl text-blue-100 max-w-2xl mx-auto">
                Calculate your Body Mass Index (BMI) and get personalized health insights with worldwide unit support
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
                      <h2 className="text-2xl font-semibold text-gray-900 mb-8">Body Measurements</h2>
                      
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

                      {/* Weight */}
                      <div className="space-y-3">
                        <Label htmlFor="weight" className="text-sm font-medium text-gray-700">
                          Weight {unitSystem === 'metric' ? '(kg)' : '(lbs)'}
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
                          Height {unitSystem === 'metric' ? '(cm)' : '(ft/in)'}
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

                      {/* Age (Optional) */}
                      <div className="space-y-3">
                        <Label htmlFor="age" className="text-sm font-medium text-gray-700">
                          Age (years) <span className="text-gray-400 font-normal">- Optional</span>
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

                      {/* Gender (Optional) */}
                      <div className="space-y-3">
                        <Label className="text-sm font-medium text-gray-700">
                          Gender <span className="text-gray-400 font-normal">- Optional</span>
                        </Label>
                        <Select value={gender} onValueChange={setGender}>
                          <SelectTrigger className="h-12 border-gray-200 rounded-lg" data-testid="select-gender">
                            <SelectValue placeholder="Select gender" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="male">Male</SelectItem>
                            <SelectItem value="female">Female</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-4 pt-6">
                        <Button
                          onClick={calculateBMI}
                          className="flex-1 h-12 text-white font-medium rounded-lg"
                          style={{ backgroundColor: '#f43f5e' }}
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#e11d48'}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#f43f5e'}
                          data-testid="button-calculate"
                        >
                          <Calculator className="w-4 h-4 mr-2" />
                          Calculate BMI
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
                      <h2 className="text-2xl font-semibold text-gray-900 mb-8">BMI Results</h2>
                      
                      {result ? (
                        <div className="space-y-4" data-testid="bmi-results">
                          {/* BMI Value */}
                          <div className="bg-white rounded-lg p-4 border-l-4 border-blue-500">
                            <div className="flex justify-between items-center">
                              <span className="font-semibold text-gray-700">Your BMI</span>
                              <span className={`text-2xl font-bold ${getBMIColor(result.bmi)}`} data-testid="text-bmi-value">
                                {result.bmi}
                              </span>
                            </div>
                          </div>

                          {/* BMI Category */}
                          <div className="bg-white rounded-lg p-4">
                            <div className="flex justify-between items-center">
                              <span className="text-gray-600">Category</span>
                              <span className={`font-semibold ${getBMIColor(result.bmi)}`} data-testid="text-bmi-category">
                                {result.category}
                              </span>
                            </div>
                          </div>

                          {/* Healthy Weight Range */}
                          <div className="bg-green-50 rounded-lg p-4">
                            <h3 className="font-semibold text-gray-900 mb-2">Healthy Weight Range</h3>
                            <div className="text-sm text-gray-600">
                              <span className="font-medium" data-testid="text-healthy-weight-range">
                                {formatWeight(result.healthyWeightMin)} - {formatWeight(result.healthyWeightMax)}
                              </span>
                            </div>
                          </div>

                          {/* Weight Recommendations */}
                          {(result.weightToLose || result.weightToGain) && (
                            <div className="bg-blue-50 rounded-lg p-4">
                              <h3 className="font-semibold text-gray-900 mb-2">Recommendation</h3>
                              {result.weightToLose && (
                                <p className="text-sm text-gray-600" data-testid="text-weight-to-lose">
                                  To reach a healthy weight, consider losing about{' '}
                                  <span className="font-medium">{formatWeight(result.weightToLose)}</span>
                                </p>
                              )}
                              {result.weightToGain && (
                                <p className="text-sm text-gray-600" data-testid="text-weight-to-gain">
                                  To reach a healthy weight, consider gaining about{' '}
                                  <span className="font-medium">{formatWeight(result.weightToGain)}</span>
                                </p>
                              )}
                            </div>
                          )}

                          {/* BMI Chart */}
                          <div className="mt-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-3">BMI Categories</h3>
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span>Underweight</span>
                                <span className="text-blue-600 font-medium">Below 18.5</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Normal weight</span>
                                <span className="text-green-600 font-medium">18.5 - 24.9</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Overweight</span>
                                <span className="text-orange-600 font-medium">25.0 - 29.9</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Obese</span>
                                <span className="text-red-600 font-medium">30.0 and above</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-8" data-testid="no-results">
                          <i className="fas fa-weight text-4xl text-gray-400 mb-4"></i>
                          <p className="text-gray-500">Enter your weight and height to calculate BMI</p>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Educational Content */}
              <div className="mt-12 space-y-8">
                {/* SEO Content Section */}
                <section className="py-16">
                  <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 mb-6">
                      Free BMI Calculator - Calculate Your Body Mass Index Online
                    </h2>
                    <p className="text-lg text-gray-600 max-w-4xl mx-auto leading-relaxed">
                      Use our accurate BMI calculator to determine your Body Mass Index and understand your weight category. 
                      Get instant results with detailed health insights, weight recommendations, and worldwide unit support. 
                      Perfect for tracking fitness goals, health monitoring, and maintaining optimal body weight.
                    </p>
                  </div>
                </section>

                {/* What is BMI */}
                <div className="bg-white rounded-2xl shadow-lg p-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-8">Understanding BMI (Body Mass Index)</h2>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-4">What is BMI?</h3>
                      <p className="text-gray-600 mb-6 leading-relaxed">
                        BMI (Body Mass Index) is a widely used screening tool that measures body fat based on height and weight. 
                        It's calculated by dividing a person's weight in kilograms by the square of their height in meters (kg/m²). 
                        While BMI is a useful indicator of overall health, it doesn't measure body composition directly.
                      </p>
                      
                      <h3 className="text-xl font-semibold text-gray-900 mb-4">BMI Formula</h3>
                      <div className="bg-blue-50 rounded-lg p-4 mb-4">
                        <p className="font-mono text-center text-lg text-blue-800 font-semibold">
                          BMI = Weight (kg) ÷ Height² (m²)
                        </p>
                      </div>
                      <p className="text-gray-600 text-sm">
                        For imperial units: BMI = (Weight in pounds × 703) ÷ (Height in inches)²
                      </p>
                    </div>
                    
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-4">BMI Categories & Health Risks</h3>
                      <div className="space-y-3">
                        <div className="flex items-center p-3 bg-blue-50 rounded-lg">
                          <div className="w-4 h-4 bg-blue-500 rounded-full mr-3"></div>
                          <div>
                            <div className="font-medium">Underweight (BMI &lt; 18.5)</div>
                            <div className="text-sm text-gray-600">May indicate malnutrition or health issues</div>
                          </div>
                        </div>
                        
                        <div className="flex items-center p-3 bg-green-50 rounded-lg">
                          <div className="w-4 h-4 bg-green-500 rounded-full mr-3"></div>
                          <div>
                            <div className="font-medium">Normal weight (BMI 18.5-24.9)</div>
                            <div className="text-sm text-gray-600">Associated with lowest health risks</div>
                          </div>
                        </div>
                        
                        <div className="flex items-center p-3 bg-orange-50 rounded-lg">
                          <div className="w-4 h-4 bg-orange-500 rounded-full mr-3"></div>
                          <div>
                            <div className="font-medium">Overweight (BMI 25-29.9)</div>
                            <div className="text-sm text-gray-600">Increased risk of health problems</div>
                          </div>
                        </div>
                        
                        <div className="flex items-center p-3 bg-red-50 rounded-lg">
                          <div className="w-4 h-4 bg-red-500 rounded-full mr-3"></div>
                          <div>
                            <div className="font-medium">Obese (BMI ≥ 30)</div>
                            <div className="text-sm text-gray-600">High risk of serious health conditions</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* How to Use BMI Calculator */}
                <div className="bg-white rounded-2xl shadow-lg p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">How to Use Our BMI Calculator</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Step-by-Step Instructions</h3>
                      <ol className="space-y-3 text-gray-600">
                        <li className="flex">
                          <span className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full text-sm flex items-center justify-center mr-3">1</span>
                          <span>Choose your preferred unit system (Metric or Imperial)</span>
                        </li>
                        <li className="flex">
                          <span className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full text-sm flex items-center justify-center mr-3">2</span>
                          <span>Enter your weight in kg (Metric) or lbs (Imperial)</span>
                        </li>
                        <li className="flex">
                          <span className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full text-sm flex items-center justify-center mr-3">3</span>
                          <span>Enter your height in cm (Metric) or ft/in (Imperial)</span>
                        </li>
                        <li className="flex">
                          <span className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full text-sm flex items-center justify-center mr-3">4</span>
                          <span>Optionally add your age and gender for context</span>
                        </li>
                        <li className="flex">
                          <span className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full text-sm flex items-center justify-center mr-3">5</span>
                          <span>Click "Calculate BMI" to get instant results</span>
                        </li>
                      </ol>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">What You'll Get</h3>
                      <ul className="space-y-2 text-gray-600">
                        <li className="flex items-center">
                          <i className="fas fa-check-circle text-green-500 mr-2"></i>
                          <span>Your exact BMI value with color-coded category</span>
                        </li>
                        <li className="flex items-center">
                          <i className="fas fa-check-circle text-green-500 mr-2"></i>
                          <span>Health category classification</span>
                        </li>
                        <li className="flex items-center">
                          <i className="fas fa-check-circle text-green-500 mr-2"></i>
                          <span>Healthy weight range for your height</span>
                        </li>
                        <li className="flex items-center">
                          <i className="fas fa-check-circle text-green-500 mr-2"></i>
                          <span>Weight recommendations if needed</span>
                        </li>
                        <li className="flex items-center">
                          <i className="fas fa-check-circle text-green-500 mr-2"></i>
                          <span>Complete BMI reference chart</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* BMI Use Cases */}
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">When to Use a BMI Calculator</h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white rounded-lg p-6 shadow-sm">
                      <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                        <i className="fas fa-dumbbell text-green-600 text-xl"></i>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Fitness Tracking</h3>
                      <p className="text-gray-600 text-sm">
                        Monitor your progress during weight loss or muscle gain journeys. Track BMI changes over time to assess the effectiveness of your fitness routine.
                      </p>
                    </div>
                    
                    <div className="bg-white rounded-lg p-6 shadow-sm">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                        <i className="fas fa-heartbeat text-blue-600 text-xl"></i>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Health Screening</h3>
                      <p className="text-gray-600 text-sm">
                        Use BMI as an initial health assessment tool before medical consultations. Helpful for identifying potential weight-related health risks.
                      </p>
                    </div>
                    
                    <div className="bg-white rounded-lg p-6 shadow-sm">
                      <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                        <i className="fas fa-chart-line text-purple-600 text-xl"></i>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Goal Setting</h3>
                      <p className="text-gray-600 text-sm">
                        Set realistic weight goals based on healthy BMI ranges. Plan your nutrition and exercise programs with specific BMI targets in mind.
                      </p>
                    </div>
                  </div>
                </div>

                {/* BMI vs Other Measurements */}
                <div className="bg-white rounded-2xl shadow-lg p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">BMI vs Other Body Composition Measurements</h2>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-left py-3 px-4 font-semibold text-gray-900">Measurement</th>
                          <th className="text-left py-3 px-4 font-semibold text-gray-900">What It Measures</th>
                          <th className="text-left py-3 px-4 font-semibold text-gray-900">Pros</th>
                          <th className="text-left py-3 px-4 font-semibold text-gray-900">Cons</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        <tr>
                          <td className="py-3 px-4 font-medium">BMI</td>
                          <td className="py-3 px-4 text-gray-600">Weight relative to height</td>
                          <td className="py-3 px-4 text-gray-600">Simple, quick, standardized</td>
                          <td className="py-3 px-4 text-gray-600">Doesn't account for muscle mass</td>
                        </tr>
                        <tr>
                          <td className="py-3 px-4 font-medium">Body Fat Percentage</td>
                          <td className="py-3 px-4 text-gray-600">Proportion of fat tissue</td>
                          <td className="py-3 px-4 text-gray-600">More accurate body composition</td>
                          <td className="py-3 px-4 text-gray-600">Requires special equipment</td>
                        </tr>
                        <tr>
                          <td className="py-3 px-4 font-medium">Waist Circumference</td>
                          <td className="py-3 px-4 text-gray-600">Abdominal fat distribution</td>
                          <td className="py-3 px-4 text-gray-600">Indicates health risks</td>
                          <td className="py-3 px-4 text-gray-600">Limited to one body area</td>
                        </tr>
                        <tr>
                          <td className="py-3 px-4 font-medium">Waist-to-Hip Ratio</td>
                          <td className="py-3 px-4 text-gray-600">Fat distribution pattern</td>
                          <td className="py-3 px-4 text-gray-600">Shows fat distribution</td>
                          <td className="py-3 px-4 text-gray-600">More complex measurement</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* BMI Limitations and Tips */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">BMI Limitations & Health Tips</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">BMI Limitations</h3>
                      <ul className="text-gray-600 space-y-2 text-sm">
                        <li>• Doesn't distinguish between muscle and fat mass</li>
                        <li>• May not be accurate for athletes with high muscle mass</li>
                        <li>• Doesn't account for bone density and body composition</li>
                        <li>• May not reflect health risks in older adults</li>
                        <li>• Ethnic variations aren't considered in standard BMI ranges</li>
                        <li>• Cannot assess regional fat distribution</li>
                        <li>• May misclassify pregnant women</li>
                        <li>• Less accurate for individuals under 18 or over 65</li>
                      </ul>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Healthy Weight Management Tips</h3>
                      <ul className="text-gray-600 space-y-2 text-sm">
                        <li>• Maintain a balanced diet with proper portion sizes</li>
                        <li>• Include regular physical activity in your routine</li>
                        <li>• Stay hydrated and get adequate sleep</li>
                        <li>• Consider body composition, not just weight</li>
                        <li>• Consult healthcare professionals for personalized advice</li>
                        <li>• Focus on sustainable lifestyle changes</li>
                        <li>• Monitor multiple health indicators</li>
                        <li>• Set realistic and achievable goals</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* FAQ Section */}
                <div className="bg-white rounded-2xl shadow-lg p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Frequently Asked Questions About BMI</h2>
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">How accurate is BMI?</h3>
                      <p className="text-gray-600">
                        BMI is a useful screening tool but has limitations. It's about 80% accurate for the general population but may misclassify athletes, bodybuilders, and individuals with high muscle mass. It's best used alongside other health assessments.
                      </p>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Is BMI different for men and women?</h3>
                      <p className="text-gray-600">
                        The BMI calculation formula is the same for both men and women. However, women typically have more body fat than men at the same BMI level. Some health professionals consider this when interpreting results.
                      </p>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">At what age should you start tracking BMI?</h3>
                      <p className="text-gray-600">
                        BMI calculations for adults (18+) use standard categories. For children and teens, BMI is compared to age and gender-specific percentiles. Regular BMI tracking can begin in early adulthood as part of routine health monitoring.
                      </p>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">How often should I calculate my BMI?</h3>
                      <p className="text-gray-600">
                        For general health monitoring, calculating BMI monthly or quarterly is sufficient. During active weight management, weekly calculations can help track progress. Daily calculations aren't necessary due to normal weight fluctuations.
                      </p>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">What's a healthy BMI range?</h3>
                      <p className="text-gray-600">
                        A healthy BMI for most adults is between 18.5 and 24.9. However, optimal BMI can vary based on ethnicity, age, muscle mass, and overall health. Consult healthcare providers for personalized healthy weight ranges.
                      </p>
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

export default BMICalculator;