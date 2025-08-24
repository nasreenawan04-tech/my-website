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

interface LBMResult {
  boer: number;
  james: number;
  hume: number;
  average: number;
  bodyFatMass: number;
  bodyFatPercentage: number;
  leanPercentage: number;
  recommendations: {
    proteinIntake: { min: number; max: number };
    strengthTraining: string;
    cardioRecommendation: string;
  };
}

const LeanBodyMassCalculator = () => {
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [feet, setFeet] = useState('');
  const [inches, setInches] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [bodyFatPercentage, setBodyFatPercentage] = useState('');
  const [unitSystem, setUnitSystem] = useState('metric');
  const [calculationMethod, setCalculationMethod] = useState('formulas');
  const [result, setResult] = useState<LBMResult | null>(null);

  const calculateLBM = () => {
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

    if (weightKg && heightCm && gender) {
      let boer: number, james: number, hume: number;
      
      // Boer Formula
      if (gender === 'male') {
        boer = (0.407 * weightKg) + (0.267 * heightCm) - 19.2;
      } else {
        boer = (0.252 * weightKg) + (0.473 * heightCm) - 48.3;
      }

      // James Formula
      if (gender === 'male') {
        james = (1.10 * weightKg) - 128 * Math.pow(weightKg / heightCm, 2);
      } else {
        james = (1.07 * weightKg) - 148 * Math.pow(weightKg / heightCm, 2);
      }

      // Hume Formula
      if (gender === 'male') {
        hume = (0.32810 * weightKg) + (0.33929 * heightCm) - 29.5336;
      } else {
        hume = (0.29569 * weightKg) + (0.41813 * heightCm) - 43.2933;
      }

      // Calculate average
      const average = (boer + james + hume) / 3;

      // Body fat calculations
      let bodyFatMass: number = 0;
      let bodyFatPerc: number = 0;
      
      if (bodyFatPercentage && calculationMethod === 'bodyfat') {
        bodyFatPerc = parseFloat(bodyFatPercentage);
        bodyFatMass = weightKg * (bodyFatPerc / 100);
      } else {
        // Estimate body fat percentage based on demographics if not provided
        if (gender === 'male') {
          if (ageYears < 30) bodyFatPerc = 12;
          else if (ageYears < 40) bodyFatPerc = 15;
          else if (ageYears < 50) bodyFatPerc = 18;
          else bodyFatPerc = 20;
        } else {
          if (ageYears < 30) bodyFatPerc = 20;
          else if (ageYears < 40) bodyFatPerc = 23;
          else if (ageYears < 50) bodyFatPerc = 26;
          else bodyFatPerc = 28;
        }
        bodyFatMass = weightKg * (bodyFatPerc / 100);
      }

      const leanPercentage = 100 - bodyFatPerc;

      // Protein recommendations (1.6-2.2g per kg of lean body mass)
      const proteinIntake = {
        min: Math.round(average * 1.6),
        max: Math.round(average * 2.2)
      };

      // Training recommendations based on lean body mass percentage
      let strengthTraining: string;
      let cardioRecommendation: string;

      if (leanPercentage > 85) {
        strengthTraining = "3-4 strength sessions/week focusing on progressive overload";
        cardioRecommendation = "2-3 moderate cardio sessions to maintain cardiovascular health";
      } else if (leanPercentage > 75) {
        strengthTraining = "4-5 strength sessions/week with compound movements";
        cardioRecommendation = "3-4 cardio sessions combining HIIT and steady-state";
      } else {
        strengthTraining = "3-4 strength sessions/week while in caloric deficit";
        cardioRecommendation = "4-5 cardio sessions focusing on fat loss while preserving muscle";
      }

      // Convert back to appropriate units for display
      const displayWeight = unitSystem === 'metric' ? weightKg : weightKg / 0.453592;
      const lbmResults = {
        boer: unitSystem === 'metric' ? boer : boer / 0.453592,
        james: unitSystem === 'metric' ? james : james / 0.453592,
        hume: unitSystem === 'metric' ? hume : hume / 0.453592,
        average: unitSystem === 'metric' ? average : average / 0.453592,
        bodyFatMass: unitSystem === 'metric' ? bodyFatMass : bodyFatMass / 0.453592
      };

      setResult({
        ...lbmResults,
        bodyFatPercentage: bodyFatPerc,
        leanPercentage,
        recommendations: {
          proteinIntake,
          strengthTraining,
          cardioRecommendation
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
    setBodyFatPercentage('');
    setCalculationMethod('formulas');
    setUnitSystem('metric');
    setResult(null);
  };

  const formatWeight = (weight: number) => {
    const unit = unitSystem === 'metric' ? 'kg' : 'lbs';
    return `${weight.toFixed(1)} ${unit}`;
  };

  return (
    <>
      <Helmet>
        <title>Lean Body Mass Calculator - Calculate LBM with Multiple Formulas | DapsiWow</title>
        <meta name="description" content="Calculate your lean body mass (LBM) using Boer, James, and Hume formulas. Get body composition analysis and personalized fitness recommendations." />
        <meta name="keywords" content="lean body mass calculator, LBM calculator, body composition, muscle mass calculator, body fat calculator, fitness calculator" />
        <meta property="og:title" content="Lean Body Mass Calculator - Calculate LBM with Multiple Formulas | DapsiWow" />
        <meta property="og:description" content="Calculate your lean body mass using multiple scientific formulas and get personalized fitness recommendations." />
        <meta property="og:type" content="website" />
        <link rel="canonical" href="/tools/lean-body-mass-calculator" />
      </Helmet>

      <div className="min-h-screen flex flex-col" data-testid="page-lean-body-mass-calculator">
        <Header />
        
        <main className="flex-1 bg-neutral-50">
          {/* Hero Section */}
          <section className="text-white py-16" style={{ background: 'linear-gradient(135deg, #f43f5e 0%, #e11d48 100%)' }}>
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <div className="w-20 h-20 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <i className="fas fa-user-md text-3xl"></i>
              </div>
              <h1 className="text-4xl sm:text-5xl font-bold mb-6" data-testid="text-page-title">
                Lean Body Mass Calculator
              </h1>
              <p className="text-xl text-blue-100 max-w-2xl mx-auto">
                Calculate your lean body mass using multiple scientific formulas and get personalized fitness insights
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

                      {/* Calculation Method */}
                      <div className="space-y-3">
                        <Label className="text-sm font-medium text-gray-700">
                          Calculation Method
                        </Label>
                        <Select value={calculationMethod} onValueChange={setCalculationMethod}>
                          <SelectTrigger className="h-12 border-gray-200 rounded-lg" data-testid="select-method">
                            <SelectValue placeholder="Select calculation method" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="formulas">Scientific Formulas (Recommended)</SelectItem>
                            <SelectItem value="bodyfat">Body Fat Percentage Method</SelectItem>
                          </SelectContent>
                        </Select>
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

                      {/* Body Fat Percentage (conditional) */}
                      {calculationMethod === 'bodyfat' && (
                        <div className="space-y-3">
                          <Label htmlFor="bodyFat" className="text-sm font-medium text-gray-700">
                            Body Fat Percentage (%) *
                          </Label>
                          <Input
                            id="bodyFat"
                            type="number"
                            value={bodyFatPercentage}
                            onChange={(e) => setBodyFatPercentage(e.target.value)}
                            className="h-12 text-base border-gray-200 rounded-lg"
                            placeholder="15"
                            min="3"
                            max="50"
                            step="0.1"
                            data-testid="input-body-fat"
                          />
                          <p className="text-xs text-gray-500">
                            Enter your body fat percentage if known (from DEXA scan, body fat calipers, etc.)
                          </p>
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="flex gap-4 pt-6">
                        <Button
                          onClick={calculateLBM}
                          className="flex-1 h-12 text-white font-medium rounded-lg"
                          style={{ backgroundColor: '#f43f5e' }}
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#e11d48'}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#f43f5e'}
                          data-testid="button-calculate"
                        >
                          <Calculator className="w-4 h-4 mr-2" />
                          Calculate LBM
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
                      <h2 className="text-2xl font-semibold text-gray-900 mb-8">Lean Body Mass Results</h2>
                      
                      {result ? (
                        <div className="space-y-4" data-testid="lbm-results">
                          {/* Average LBM */}
                          <div className="bg-white rounded-lg p-4 border-l-4 border-green-500">
                            <div className="flex justify-between items-center">
                              <span className="font-semibold text-gray-700">Average Lean Body Mass</span>
                              <span className="text-2xl font-bold text-green-600" data-testid="text-average-lbm">
                                {formatWeight(result.average)}
                              </span>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">Based on multiple scientific formulas</p>
                          </div>

                          {/* Individual Formula Results */}
                          <div className="bg-white rounded-lg p-4">
                            <h3 className="font-semibold text-gray-900 mb-3">Formula Breakdown</h3>
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between items-center">
                                <span className="text-gray-600">Boer Formula</span>
                                <span className="font-medium" data-testid="text-boer-lbm">
                                  {formatWeight(result.boer)}
                                </span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-gray-600">James Formula</span>
                                <span className="font-medium" data-testid="text-james-lbm">
                                  {formatWeight(result.james)}
                                </span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-gray-600">Hume Formula</span>
                                <span className="font-medium" data-testid="text-hume-lbm">
                                  {formatWeight(result.hume)}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Body Composition */}
                          <div className="bg-blue-50 rounded-lg p-4">
                            <h3 className="font-semibold text-gray-900 mb-3">Body Composition</h3>
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between items-center">
                                <span className="text-gray-600">Lean Body Mass</span>
                                <span className="font-medium text-green-700" data-testid="text-lean-percentage">
                                  {result.leanPercentage.toFixed(1)}%
                                </span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-gray-600">Body Fat Mass</span>
                                <span className="font-medium" data-testid="text-body-fat-mass">
                                  {formatWeight(result.bodyFatMass)}
                                </span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-gray-600">Body Fat Percentage</span>
                                <span className="font-medium text-orange-600" data-testid="text-body-fat-percentage">
                                  {result.bodyFatPercentage.toFixed(1)}%
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Protein Recommendations */}
                          <div className="bg-purple-50 rounded-lg p-4">
                            <h3 className="font-semibold text-gray-900 mb-2">Daily Protein Recommendations</h3>
                            <div className="text-sm">
                              <p className="text-gray-600" data-testid="text-protein-recommendation">
                                <span className="font-medium text-purple-700">
                                  {result.recommendations.proteinIntake.min} - {result.recommendations.proteinIntake.max}g per day
                                </span>
                              </p>
                              <p className="text-xs text-gray-500 mt-1">
                                Based on 1.6-2.2g per kg of lean body mass
                              </p>
                            </div>
                          </div>

                          {/* Training Recommendations */}
                          <div className="bg-orange-50 rounded-lg p-4">
                            <h3 className="font-semibold text-gray-900 mb-3">Training Recommendations</h3>
                            <div className="space-y-2 text-sm">
                              <div>
                                <span className="font-medium text-gray-700">Strength Training:</span>
                                <p className="text-gray-600" data-testid="text-strength-recommendation">
                                  {result.recommendations.strengthTraining}
                                </p>
                              </div>
                              <div>
                                <span className="font-medium text-gray-700">Cardio:</span>
                                <p className="text-gray-600" data-testid="text-cardio-recommendation">
                                  {result.recommendations.cardioRecommendation}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-8" data-testid="no-results">
                          <i className="fas fa-user-md text-4xl text-gray-400 mb-4"></i>
                          <p className="text-gray-500">Enter your measurements to calculate lean body mass</p>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Educational Content */}
              <div className="mt-12 space-y-8">
                <div className="bg-white rounded-2xl shadow-lg p-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-8">Understanding Lean Body Mass (LBM)</h2>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-4">What is Lean Body Mass?</h3>
                      <p className="text-gray-600 mb-6 leading-relaxed">
                        Lean Body Mass (LBM) represents the weight of your body minus all the fat. It includes muscles, 
                        bones, organs, connective tissue, and water. LBM is crucial for determining metabolic rate, 
                        protein needs, and training recommendations.
                      </p>
                      
                      <h3 className="text-xl font-semibold text-gray-900 mb-4">Why is LBM Important?</h3>
                      <ul className="text-gray-600 space-y-2 text-sm">
                        <li>• Determines your metabolic rate and calorie needs</li>
                        <li>• Helps calculate optimal protein intake</li>
                        <li>• Tracks muscle-building progress</li>
                        <li>• Assists in body composition goals</li>
                        <li>• Indicates overall health and fitness level</li>
                      </ul>
                    </div>
                    
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-4">Calculation Methods</h3>
                      <div className="space-y-3">
                        <div className="p-3 bg-green-50 rounded-lg">
                          <div className="font-medium text-gray-900">Boer Formula</div>
                          <div className="text-sm text-gray-600">Most accurate for athletic populations</div>
                        </div>
                        
                        <div className="p-3 bg-blue-50 rounded-lg">
                          <div className="font-medium text-gray-900">James Formula</div>
                          <div className="text-sm text-gray-600">Good for general population estimates</div>
                        </div>
                        
                        <div className="p-3 bg-purple-50 rounded-lg">
                          <div className="font-medium text-gray-900">Hume Formula</div>
                          <div className="text-sm text-gray-600">Reliable across different age groups</div>
                        </div>
                        
                        <div className="p-3 bg-orange-50 rounded-lg">
                          <div className="font-medium text-gray-900">Body Fat Method</div>
                          <div className="text-sm text-gray-600">Most accurate when body fat % is known</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Maximizing Your Lean Body Mass</h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Nutrition</h3>
                      <ul className="text-gray-600 space-y-2 text-sm">
                        <li>• Consume adequate protein (1.6-2.2g/kg LBM)</li>
                        <li>• Maintain caloric balance for goals</li>
                        <li>• Include leucine-rich protein sources</li>
                        <li>• Time protein intake around workouts</li>
                      </ul>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Training</h3>
                      <ul className="text-gray-600 space-y-2 text-sm">
                        <li>• Prioritize progressive resistance training</li>
                        <li>• Focus on compound movements</li>
                        <li>• Train each muscle group 2-3x per week</li>
                        <li>• Allow adequate recovery between sessions</li>
                      </ul>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Recovery</h3>
                      <ul className="text-gray-600 space-y-2 text-sm">
                        <li>• Get 7-9 hours of quality sleep</li>
                        <li>• Manage stress levels effectively</li>
                        <li>• Stay properly hydrated</li>
                        <li>• Consider active recovery days</li>
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

export default LeanBodyMassCalculator;