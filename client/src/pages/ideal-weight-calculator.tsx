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

interface IdealWeightResult {
  robinson: number;
  miller: number;
  devine: number;
  hamwi: number;
  average: number;
  weightRange: {
    min: number;
    max: number;
  };
  currentDifference: number;
  bmiRange: {
    healthyMin: number;
    healthyMax: number;
  };
}

const IdealWeightCalculator = () => {
  const [height, setHeight] = useState('');
  const [feet, setFeet] = useState('');
  const [inches, setInches] = useState('');
  const [currentWeight, setCurrentWeight] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [unitSystem, setUnitSystem] = useState('metric');
  const [result, setResult] = useState<IdealWeightResult | null>(null);

  const calculateIdealWeight = () => {
    let heightCm: number;
    let weightKg: number;

    if (unitSystem === 'metric') {
      heightCm = parseFloat(height);
      weightKg = parseFloat(currentWeight) || 0;
    } else {
      // Imperial system
      const totalInches = (parseFloat(feet) * 12) + parseFloat(inches);
      heightCm = totalInches * 2.54; // Convert inches to cm
      weightKg = (parseFloat(currentWeight) || 0) * 0.453592; // Convert lbs to kg
    }

    if (heightCm && gender) {
      const heightM = heightCm / 100;
      const heightInches = heightCm / 2.54;
      
      // Different formulas for ideal weight calculation
      let robinson: number, miller: number, devine: number, hamwi: number;

      if (gender === 'male') {
        // Male formulas
        if (heightInches > 60) {
          robinson = 52 + 1.9 * (heightInches - 60); // Robinson formula
          miller = 56.2 + 1.41 * (heightInches - 60); // Miller formula  
          devine = 50 + 2.3 * (heightInches - 60); // Devine formula
          hamwi = 48 + 2.7 * (heightInches - 60); // Hamwi formula
        } else {
          // For shorter heights, use base weights
          robinson = 52 - 1.9 * (60 - heightInches);
          miller = 56.2 - 1.41 * (60 - heightInches);
          devine = 50 - 2.3 * (60 - heightInches);
          hamwi = 48 - 2.7 * (60 - heightInches);
        }
      } else {
        // Female formulas
        if (heightInches > 60) {
          robinson = 49 + 1.7 * (heightInches - 60); // Robinson formula
          miller = 53.1 + 1.36 * (heightInches - 60); // Miller formula
          devine = 45.5 + 2.3 * (heightInches - 60); // Devine formula
          hamwi = 45.5 + 2.2 * (heightInches - 60); // Hamwi formula
        } else {
          // For shorter heights, use base weights
          robinson = 49 - 1.7 * (60 - heightInches);
          miller = 53.1 - 1.36 * (60 - heightInches);
          devine = 45.5 - 2.3 * (60 - heightInches);
          hamwi = 45.5 - 2.2 * (60 - heightInches);
        }
      }

      // Ensure minimum reasonable weights
      robinson = Math.max(35, robinson);
      miller = Math.max(35, miller);
      devine = Math.max(35, devine);
      hamwi = Math.max(35, hamwi);

      // Calculate average
      const average = (robinson + miller + devine + hamwi) / 4;

      // Calculate healthy weight range based on BMI 18.5-24.9
      const healthyMinWeight = 18.5 * heightM * heightM;
      const healthyMaxWeight = 24.9 * heightM * heightM;

      // Calculate ideal weight range (±10% of average)
      const weightRange = {
        min: average * 0.9,
        max: average * 1.1
      };

      // Calculate difference from current weight
      const currentDifference = weightKg ? weightKg - average : 0;

      // BMI range for healthy weight
      const bmiRange = {
        healthyMin: healthyMinWeight,
        healthyMax: healthyMaxWeight
      };

      setResult({
        robinson: Math.round(robinson * 10) / 10,
        miller: Math.round(miller * 10) / 10,
        devine: Math.round(devine * 10) / 10,
        hamwi: Math.round(hamwi * 10) / 10,
        average: Math.round(average * 10) / 10,
        weightRange: {
          min: Math.round(weightRange.min * 10) / 10,
          max: Math.round(weightRange.max * 10) / 10
        },
        currentDifference: Math.round(currentDifference * 10) / 10,
        bmiRange: {
          healthyMin: Math.round(healthyMinWeight * 10) / 10,
          healthyMax: Math.round(healthyMaxWeight * 10) / 10
        }
      });
    }
  };

  const resetCalculator = () => {
    setHeight('');
    setFeet('');
    setInches('');
    setCurrentWeight('');
    setAge('');
    setGender('');
    setUnitSystem('metric');
    setResult(null);
  };

  const formatWeight = (weightKg: number) => {
    if (unitSystem === 'metric') {
      return `${weightKg} kg`;
    } else {
      const weightLbs = weightKg * 2.20462;
      return `${Math.round(weightLbs * 10) / 10} lbs`;
    }
  };

  const getWeightStatus = (difference: number) => {
    if (Math.abs(difference) <= 2) {
      return { status: 'Within ideal range', color: 'text-green-600' };
    } else if (difference > 0) {
      return { status: `${Math.abs(difference)} kg above ideal`, color: 'text-orange-600' };
    } else {
      return { status: `${Math.abs(difference)} kg below ideal`, color: 'text-blue-600' };
    }
  };

  return (
    <>
      <Helmet>
        <title>Ideal Weight Calculator - Calculate Your Ideal Body Weight | DapsiWow</title>
        <meta name="description" content="Calculate your ideal body weight using multiple proven formulas (Robinson, Miller, Devine, Hamwi). Get healthy weight ranges with worldwide unit support." />
        <meta name="keywords" content="ideal weight calculator, ideal body weight, healthy weight range, Robinson formula, Devine formula, BMI calculator" />
        <meta property="og:title" content="Ideal Weight Calculator - Calculate Your Ideal Body Weight | DapsiWow" />
        <meta property="og:description" content="Calculate your ideal body weight using multiple proven scientific formulas and get personalized health recommendations." />
        <meta property="og:type" content="website" />
        <link rel="canonical" href="/tools/ideal-weight-calculator" />
      </Helmet>

      <div className="min-h-screen flex flex-col" data-testid="page-ideal-weight-calculator">
        <Header />
        
        <main className="flex-1 bg-neutral-50">
          {/* Hero Section */}
          <section className="text-white py-16" style={{ background: 'linear-gradient(135deg, #f43f5e 0%, #e11d48 100%)' }}>
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <div className="w-20 h-20 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <i className="fas fa-balance-scale text-3xl"></i>
              </div>
              <h1 className="text-4xl sm:text-5xl font-bold mb-6" data-testid="text-page-title">
                Ideal Weight Calculator
              </h1>
              <p className="text-xl text-red-100 max-w-2xl mx-auto">
                Calculate your ideal body weight using multiple proven formulas and discover your healthy weight range
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

                      {/* Current Weight */}
                      <div className="space-y-3">
                        <Label htmlFor="current-weight" className="text-sm font-medium text-gray-700">
                          Current Weight {unitSystem === 'metric' ? '(kg)' : '(lbs)'} <span className="text-gray-400 font-normal">- Optional for comparison</span>
                        </Label>
                        <Input
                          id="current-weight"
                          type="number"
                          value={currentWeight}
                          onChange={(e) => setCurrentWeight(e.target.value)}
                          className="h-12 text-base border-gray-200 rounded-lg"
                          placeholder={unitSystem === 'metric' ? "70" : "154"}
                          min="0"
                          step="0.1"
                          data-testid="input-current-weight"
                        />
                      </div>

                      {/* Age */}
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
                          min="18"
                          max="120"
                          data-testid="input-age"
                        />
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-4 pt-6">
                        <Button
                          onClick={calculateIdealWeight}
                          className="flex-1 h-12 text-white font-medium rounded-lg"
                          style={{ backgroundColor: '#f43f5e' }}
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#e11d48'}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#f43f5e'}
                          data-testid="button-calculate"
                        >
                          <Calculator className="w-4 h-4 mr-2" />
                          Calculate Ideal Weight
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
                      <h2 className="text-2xl font-semibold text-gray-900 mb-8">Ideal Weight Results</h2>
                      
                      {result ? (
                        <div className="space-y-4" data-testid="ideal-weight-results">
                          {/* Average Ideal Weight */}
                          <div className="bg-white rounded-lg p-4 border-l-4 border-rose-500">
                            <div className="flex justify-between items-center">
                              <span className="font-semibold text-gray-700">Average Ideal Weight</span>
                              <span className="text-2xl font-bold text-rose-600" data-testid="text-average-weight">
                                {formatWeight(result.average)}
                              </span>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">Based on multiple formulas</p>
                          </div>

                          {/* Current Weight Comparison */}
                          {result.currentDifference !== 0 && (
                            <div className="bg-white rounded-lg p-4">
                              <div className="flex justify-between items-center">
                                <span className="text-gray-600">Weight Status</span>
                                <span className={`font-semibold ${getWeightStatus(result.currentDifference).color}`} data-testid="text-weight-status">
                                  {getWeightStatus(result.currentDifference).status}
                                </span>
                              </div>
                            </div>
                          )}

                          {/* Formula Results */}
                          <div className="bg-white rounded-lg p-4">
                            <h3 className="font-semibold text-gray-900 mb-3">Formula-Based Results</h3>
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span className="text-gray-600">Robinson Formula</span>
                                <span className="font-medium" data-testid="text-robinson">
                                  {formatWeight(result.robinson)}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Miller Formula</span>
                                <span className="font-medium" data-testid="text-miller">
                                  {formatWeight(result.miller)}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Devine Formula</span>
                                <span className="font-medium" data-testid="text-devine">
                                  {formatWeight(result.devine)}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Hamwi Formula</span>
                                <span className="font-medium" data-testid="text-hamwi">
                                  {formatWeight(result.hamwi)}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Weight Ranges */}
                          <div className="bg-white rounded-lg p-4">
                            <h3 className="font-semibold text-gray-900 mb-3">Healthy Weight Ranges</h3>
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span className="text-gray-600">Ideal Range (±10%)</span>
                                <span className="font-medium" data-testid="text-ideal-range">
                                  {formatWeight(result.weightRange.min)} - {formatWeight(result.weightRange.max)}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">BMI Healthy Range</span>
                                <span className="font-medium" data-testid="text-bmi-range">
                                  {formatWeight(result.bmiRange.healthyMin)} - {formatWeight(result.bmiRange.healthyMax)}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Recommendations */}
                          <div className="bg-blue-50 rounded-lg p-4">
                            <h3 className="font-semibold text-gray-900 mb-2">Health Recommendations</h3>
                            <ul className="text-sm text-gray-600 space-y-1">
                              <li>• Maintain a balanced diet with proper portion control</li>
                              <li>• Include regular physical activity in your routine</li>
                              <li>• Focus on overall health, not just weight numbers</li>
                              <li>• Consult healthcare professionals for personalized advice</li>
                            </ul>
                          </div>

                          {/* Disclaimer */}
                          <div className="bg-yellow-50 rounded-lg p-4">
                            <p className="text-sm text-yellow-800">
                              <strong>Note:</strong> These calculations are estimates based on statistical formulas. 
                              Individual factors like muscle mass, bone density, and body composition should be considered. 
                              Always consult with healthcare professionals for personalized guidance.
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-8" data-testid="no-results">
                          <i className="fas fa-balance-scale text-4xl text-gray-400 mb-4"></i>
                          <p className="text-gray-500">Enter your height and gender to calculate your ideal weight</p>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Educational Content */}
              <div className="mt-12 space-y-8">
                {/* Understanding Ideal Weight */}
                <div className="bg-white rounded-2xl shadow-lg p-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-8">Understanding Ideal Weight Formulas</h2>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-4">What is Ideal Weight?</h3>
                      <p className="text-gray-600 mb-6 leading-relaxed">
                        Ideal body weight is a theoretical weight that is associated with optimal health and longevity. 
                        Unlike BMI, which only considers height and weight, ideal weight formulas were developed 
                        specifically for medical and pharmaceutical dosing purposes.
                      </p>
                      
                      <h3 className="text-xl font-semibold text-gray-900 mb-4">Why Multiple Formulas?</h3>
                      <p className="text-gray-600 mb-4 leading-relaxed">
                        Different formulas were developed by various researchers over time, each with slightly different 
                        approaches. Using multiple formulas provides a more comprehensive estimate of your ideal weight range.
                      </p>
                    </div>
                    
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-4">Formula Descriptions</h3>
                      <div className="space-y-3">
                        <div className="flex items-start p-3 bg-blue-50 rounded-lg">
                          <div className="w-4 h-4 bg-blue-500 rounded-full mr-3 mt-1"></div>
                          <div>
                            <div className="font-medium">Robinson Formula (1983)</div>
                            <div className="text-sm text-gray-600">Modified version of the Devine formula with different coefficients</div>
                          </div>
                        </div>
                        
                        <div className="flex items-start p-3 bg-green-50 rounded-lg">
                          <div className="w-4 h-4 bg-green-500 rounded-full mr-3 mt-1"></div>
                          <div>
                            <div className="font-medium">Miller Formula (1983)</div>
                            <div className="text-sm text-gray-600">Alternative formula providing different weight estimates</div>
                          </div>
                        </div>
                        
                        <div className="flex items-start p-3 bg-purple-50 rounded-lg">
                          <div className="w-4 h-4 bg-purple-500 rounded-full mr-3 mt-1"></div>
                          <div>
                            <div className="font-medium">Devine Formula (1974)</div>
                            <div className="text-sm text-gray-600">Widely used in medical settings for drug dosing calculations</div>
                          </div>
                        </div>
                        
                        <div className="flex items-start p-3 bg-orange-50 rounded-lg">
                          <div className="w-4 h-4 bg-orange-500 rounded-full mr-3 mt-1"></div>
                          <div>
                            <div className="font-medium">Hamwi Formula (1964)</div>
                            <div className="text-sm text-gray-600">One of the earliest formulas, still used in clinical practice</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Factors Affecting Ideal Weight */}
                <div className="bg-gradient-to-r from-rose-50 to-pink-50 rounded-2xl p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Factors Beyond Ideal Weight</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="bg-white rounded-lg p-6 shadow-sm">
                      <i className="fas fa-dumbbell text-2xl text-blue-600 mb-4"></i>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Muscle Mass</h3>
                      <p className="text-gray-600 text-sm">
                        Athletes and highly muscular individuals may weigh more than 
                        their "ideal" weight due to muscle density being higher than fat.
                      </p>
                    </div>
                    
                    <div className="bg-white rounded-lg p-6 shadow-sm">
                      <i className="fas fa-bone text-2xl text-gray-600 mb-4"></i>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Bone Density</h3>
                      <p className="text-gray-600 text-sm">
                        People with denser bones may have higher weights while 
                        maintaining the same body fat percentage and health status.
                      </p>
                    </div>
                    
                    <div className="bg-white rounded-lg p-6 shadow-sm">
                      <i className="fas fa-birthday-cake text-2xl text-purple-600 mb-4"></i>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Age Considerations</h3>
                      <p className="text-gray-600 text-sm">
                        Ideal weight ranges may vary with age due to changes in 
                        metabolism, muscle mass, and bone density over time.
                      </p>
                    </div>
                    
                    <div className="bg-white rounded-lg p-6 shadow-sm">
                      <i className="fas fa-dna text-2xl text-green-600 mb-4"></i>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Body Frame</h3>
                      <p className="text-gray-600 text-sm">
                        Small, medium, and large body frames can significantly 
                        affect what constitutes a healthy weight for an individual.
                      </p>
                    </div>
                    
                    <div className="bg-white rounded-lg p-6 shadow-sm">
                      <i className="fas fa-globe-americas text-2xl text-orange-600 mb-4"></i>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Ethnicity</h3>
                      <p className="text-gray-600 text-sm">
                        Different ethnic groups may have varying optimal weight 
                        ranges due to genetic and physiological differences.
                      </p>
                    </div>
                    
                    <div className="bg-white rounded-lg p-6 shadow-sm">
                      <i className="fas fa-heart text-2xl text-red-600 mb-4"></i>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Overall Health</h3>
                      <p className="text-gray-600 text-sm">
                        Health markers like blood pressure, cholesterol, and fitness 
                        level are more important than achieving a specific weight number.
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

export default IdealWeightCalculator;