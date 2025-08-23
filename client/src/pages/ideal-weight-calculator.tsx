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
  devine: number;
  robinson: number;
  miller: number;
  hamwi: number;
  average: number;
  weightRange: {
    min: number;
    max: number;
  };
}

const IdealWeightCalculator = () => {
  const [height, setHeight] = useState('');
  const [feet, setFeet] = useState('');
  const [inches, setInches] = useState('');
  const [unitSystem, setUnitSystem] = useState('metric');
  const [gender, setGender] = useState('');
  const [result, setResult] = useState<IdealWeightResult | null>(null);

  const calculateIdealWeight = () => {
    let heightCm: number;

    if (unitSystem === 'metric') {
      heightCm = parseFloat(height);
    } else {
      // Imperial system
      const totalInches = (parseFloat(feet) * 12) + parseFloat(inches);
      heightCm = totalInches * 2.54; // Convert inches to cm
    }

    if (heightCm && heightCm > 0 && gender) {
      // Convert height to different units needed for calculations
      const heightM = heightCm / 100;
      const heightIn = heightCm / 2.54;
      
      let devine = 0;
      let robinson = 0;
      let miller = 0;
      let hamwi = 0;

      if (gender === 'male') {
        // Devine formula (1974) - most commonly used
        devine = 50 + 2.3 * (heightIn - 60);
        
        // Robinson formula (1983)
        robinson = 52 + 1.9 * (heightIn - 60);
        
        // Miller formula (1983)
        miller = 56.2 + 1.41 * (heightIn - 60);
        
        // Hamwi formula (1964)
        hamwi = 48 + 2.7 * (heightIn - 60);
      } else {
        // Female formulas
        devine = 45.5 + 2.3 * (heightIn - 60);
        robinson = 49 + 1.7 * (heightIn - 60);
        miller = 53.1 + 1.36 * (heightIn - 60);
        hamwi = 45.5 + 2.2 * (heightIn - 60);
      }

      // Ensure positive values and handle short heights
      devine = Math.max(devine, 40);
      robinson = Math.max(robinson, 40);
      miller = Math.max(miller, 40);
      hamwi = Math.max(hamwi, 40);

      const average = (devine + robinson + miller + hamwi) / 4;

      // Calculate healthy weight range (±10% of average)
      const weightRange = {
        min: average * 0.9,
        max: average * 1.1
      };

      // Convert to imperial if needed
      if (unitSystem === 'imperial') {
        devine = devine * 2.20462; // Convert kg to lbs
        robinson = robinson * 2.20462;
        miller = miller * 2.20462;
        hamwi = hamwi * 2.20462;
        weightRange.min = weightRange.min * 2.20462;
        weightRange.max = weightRange.max * 2.20462;
      }

      setResult({
        devine: Math.round(devine * 10) / 10,
        robinson: Math.round(robinson * 10) / 10,
        miller: Math.round(miller * 10) / 10,
        hamwi: Math.round(hamwi * 10) / 10,
        average: Math.round((unitSystem === 'imperial' ? average * 2.20462 : average) * 10) / 10,
        weightRange: {
          min: Math.round(weightRange.min * 10) / 10,
          max: Math.round(weightRange.max * 10) / 10
        }
      });
    }
  };

  const resetCalculator = () => {
    setHeight('');
    setFeet('');
    setInches('');
    setGender('');
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
        <title>Ideal Weight Calculator - Calculate Your Ideal Body Weight | DapsiWow</title>
        <meta name="description" content="Calculate your ideal body weight using multiple proven formulas (Devine, Robinson, Miller, Hamwi). Get personalized weight recommendations based on height and gender." />
        <meta name="keywords" content="ideal weight calculator, ideal body weight, perfect weight calculator, healthy weight, target weight, weight goals" />
        <meta property="og:title" content="Ideal Weight Calculator - Calculate Your Ideal Body Weight | DapsiWow" />
        <meta property="og:description" content="Calculate your ideal body weight using multiple proven formulas. Get personalized weight recommendations based on height and gender." />
        <meta property="og:type" content="website" />
        <link rel="canonical" href="/tools/ideal-weight-calculator" />
      </Helmet>

      <div className="min-h-screen flex flex-col" data-testid="page-ideal-weight-calculator">
        <Header />
        
        <main className="flex-1 bg-neutral-50">
          {/* Hero Section */}
          <section className="text-white py-16" style={{ background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)' }}>
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <div className="w-20 h-20 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <i className="fas fa-balance-scale text-3xl"></i>
              </div>
              <h1 className="text-4xl sm:text-5xl font-bold mb-6" data-testid="text-page-title">
                Ideal Weight Calculator
              </h1>
              <p className="text-xl text-green-100 max-w-2xl mx-auto">
                Calculate your ideal body weight using multiple proven medical formulas and get personalized recommendations
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
                      <h2 className="text-2xl font-semibold text-gray-900 mb-8">Body Information</h2>
                      
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
                            min="100"
                            max="250"
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
                                min="3"
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
                        <p className="text-xs text-gray-500">
                          Gender is required as ideal weight formulas differ between male and female
                        </p>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-4 pt-6">
                        <Button
                          onClick={calculateIdealWeight}
                          className="flex-1 h-12 text-white font-medium rounded-lg"
                          style={{ backgroundColor: '#22c55e' }}
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#16a34a'}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#22c55e'}
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
                          <div className="bg-white rounded-lg p-4 border-l-4 border-green-500">
                            <div className="flex justify-between items-center">
                              <span className="font-semibold text-gray-700">Average Ideal Weight</span>
                              <span className="text-2xl font-bold text-green-600" data-testid="text-average-weight">
                                {formatWeight(result.average)}
                              </span>
                            </div>
                          </div>

                          {/* Healthy Weight Range */}
                          <div className="bg-green-50 rounded-lg p-4">
                            <h3 className="font-semibold text-gray-900 mb-2">Healthy Weight Range</h3>
                            <div className="text-sm text-gray-600">
                              <span className="font-medium" data-testid="text-weight-range">
                                {formatWeight(result.weightRange.min)} - {formatWeight(result.weightRange.max)}
                              </span>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">±10% of average ideal weight</p>
                          </div>

                          {/* Individual Formula Results */}
                          <div className="space-y-3">
                            <h3 className="font-semibold text-gray-900 mb-3">Results by Formula</h3>
                            
                            <div className="bg-white rounded-lg p-3">
                              <div className="flex justify-between items-center">
                                <div>
                                  <span className="font-medium text-gray-700">Devine Formula</span>
                                  <p className="text-xs text-gray-500">Most widely used (1974)</p>
                                </div>
                                <span className="font-semibold text-gray-900" data-testid="text-devine-weight">
                                  {formatWeight(result.devine)}
                                </span>
                              </div>
                            </div>

                            <div className="bg-white rounded-lg p-3">
                              <div className="flex justify-between items-center">
                                <div>
                                  <span className="font-medium text-gray-700">Robinson Formula</span>
                                  <p className="text-xs text-gray-500">Modified Devine (1983)</p>
                                </div>
                                <span className="font-semibold text-gray-900" data-testid="text-robinson-weight">
                                  {formatWeight(result.robinson)}
                                </span>
                              </div>
                            </div>

                            <div className="bg-white rounded-lg p-3">
                              <div className="flex justify-between items-center">
                                <div>
                                  <span className="font-medium text-gray-700">Miller Formula</span>
                                  <p className="text-xs text-gray-500">Alternative method (1983)</p>
                                </div>
                                <span className="font-semibold text-gray-900" data-testid="text-miller-weight">
                                  {formatWeight(result.miller)}
                                </span>
                              </div>
                            </div>

                            <div className="bg-white rounded-lg p-3">
                              <div className="flex justify-between items-center">
                                <div>
                                  <span className="font-medium text-gray-700">Hamwi Formula</span>
                                  <p className="text-xs text-gray-500">Clinical standard (1964)</p>
                                </div>
                                <span className="font-semibold text-gray-900" data-testid="text-hamwi-weight">
                                  {formatWeight(result.hamwi)}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-8" data-testid="no-results">
                          <i className="fas fa-balance-scale text-4xl text-gray-400 mb-4"></i>
                          <p className="text-gray-500">Enter your height and gender to calculate ideal weight</p>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Educational Content */}
              <div className="mt-12 space-y-8">
                {/* What is Ideal Weight */}
                <div className="bg-white rounded-2xl shadow-lg p-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-8">Understanding Ideal Weight</h2>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-4">What is Ideal Weight?</h3>
                      <p className="text-gray-600 mb-6 leading-relaxed">
                        Ideal body weight (IBW) is a theoretical weight that is considered optimal for health and longevity. 
                        It's calculated using mathematical formulas developed by researchers and medical professionals. 
                        While these calculations provide guidance, individual factors like muscle mass, bone density, and body composition also matter.
                      </p>
                      
                      <h3 className="text-xl font-semibold text-gray-900 mb-4">Why Multiple Formulas?</h3>
                      <p className="text-gray-600 mb-4 leading-relaxed">
                        Different formulas have been developed over time, each with slightly different approaches. 
                        Using multiple formulas and averaging the results provides a more comprehensive estimate of your ideal weight range.
                      </p>
                    </div>
                    
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-4">Popular Ideal Weight Formulas</h3>
                      <div className="space-y-3">
                        <div className="flex items-center p-3 bg-blue-50 rounded-lg">
                          <div className="w-4 h-4 bg-blue-500 rounded-full mr-3"></div>
                          <div>
                            <div className="font-medium">Devine Formula (1974)</div>
                            <div className="text-sm text-gray-600">Most widely used in clinical practice</div>
                          </div>
                        </div>
                        
                        <div className="flex items-center p-3 bg-green-50 rounded-lg">
                          <div className="w-4 h-4 bg-green-500 rounded-full mr-3"></div>
                          <div>
                            <div className="font-medium">Robinson Formula (1983)</div>
                            <div className="text-sm text-gray-600">Modified version of Devine formula</div>
                          </div>
                        </div>
                        
                        <div className="flex items-center p-3 bg-purple-50 rounded-lg">
                          <div className="w-4 h-4 bg-purple-500 rounded-full mr-3"></div>
                          <div>
                            <div className="font-medium">Miller Formula (1983)</div>
                            <div className="text-sm text-gray-600">Alternative approach to ideal weight</div>
                          </div>
                        </div>
                        
                        <div className="flex items-center p-3 bg-orange-50 rounded-lg">
                          <div className="w-4 h-4 bg-orange-500 rounded-full mr-3"></div>
                          <div>
                            <div className="font-medium">Hamwi Formula (1964)</div>
                            <div className="text-sm text-gray-600">Clinical standard for many years</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Limitations and Tips */}
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Important Considerations</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Formula Limitations</h3>
                      <ul className="text-gray-600 space-y-2 text-sm">
                        <li>• Based on average population data, not individual body composition</li>
                        <li>• Don't account for muscle mass or bone density differences</li>
                        <li>• May not be accurate for athletes or very muscular individuals</li>
                        <li>• Age and ethnicity factors aren't considered in basic formulas</li>
                        <li>• Should be used as general guidance, not absolute targets</li>
                      </ul>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Healthy Weight Tips</h3>
                      <ul className="text-gray-600 space-y-2 text-sm">
                        <li>• Focus on overall health, not just reaching a specific number</li>
                        <li>• Consider body composition (muscle vs. fat ratio)</li>
                        <li>• Consult healthcare professionals for personalized advice</li>
                        <li>• Maintain a balanced diet and regular physical activity</li>
                        <li>• Remember that healthy weights exist within a range, not a single number</li>
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

export default IdealWeightCalculator;