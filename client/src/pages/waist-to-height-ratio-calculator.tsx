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

interface WaistHeightResult {
  ratio: number;
  category: string;
  healthRisk: string;
  recommendations: string[];
  idealWaistRange: {
    min: number;
    max: number;
  };
}

const WaistToHeightRatioCalculator = () => {
  const [waist, setWaist] = useState('');
  const [height, setHeight] = useState('');
  const [feet, setFeet] = useState('');
  const [inches, setInches] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [unitSystem, setUnitSystem] = useState('metric');
  const [result, setResult] = useState<WaistHeightResult | null>(null);

  const calculateWaistHeightRatio = () => {
    let waistCm: number;
    let heightCm: number;

    if (unitSystem === 'metric') {
      waistCm = parseFloat(waist);
      heightCm = parseFloat(height);
    } else {
      // Imperial system
      waistCm = parseFloat(waist) * 2.54; // Convert inches to cm
      const totalInches = (parseFloat(feet) * 12) + parseFloat(inches);
      heightCm = totalInches * 2.54; // Convert inches to cm
    }

    if (waistCm && heightCm && heightCm > 0) {
      const ratio = waistCm / heightCm;
      let category = '';
      let healthRisk = '';
      let recommendations: string[] = [];

      // Classification based on research
      if (ratio < 0.4) {
        category = 'Underweight';
        healthRisk = 'Very Low Risk';
        recommendations = [
          'Consider consulting a healthcare provider about healthy weight gain',
          'Focus on building muscle mass through strength training',
          'Ensure adequate nutrition and caloric intake'
        ];
      } else if (ratio >= 0.4 && ratio < 0.5) {
        category = 'Healthy';
        healthRisk = 'Low Risk';
        recommendations = [
          'Maintain current healthy lifestyle',
          'Continue regular physical activity',
          'Follow a balanced diet with proper portion control'
        ];
      } else if (ratio >= 0.5 && ratio < 0.6) {
        category = 'Increased Risk';
        healthRisk = 'Moderate Risk';
        recommendations = [
          'Consider reducing waist circumference through diet and exercise',
          'Increase cardiovascular exercise to 150+ minutes per week',
          'Focus on core strengthening exercises',
          'Reduce processed foods and added sugars'
        ];
      } else {
        category = 'High Risk';
        healthRisk = 'High Risk';
        recommendations = [
          'Consult with a healthcare provider for personalized advice',
          'Implement a structured weight loss plan',
          'Significantly increase physical activity',
          'Consider working with a nutritionist',
          'Monitor for metabolic syndrome risk factors'
        ];
      }

      // Calculate ideal waist range (0.4-0.5 ratio)
      const idealWaistRange = {
        min: unitSystem === 'metric' ? heightCm * 0.4 : (heightCm * 0.4) / 2.54,
        max: unitSystem === 'metric' ? heightCm * 0.5 : (heightCm * 0.5) / 2.54
      };

      setResult({
        ratio: Math.round(ratio * 1000) / 1000,
        category,
        healthRisk,
        recommendations,
        idealWaistRange
      });
    }
  };

  const resetCalculator = () => {
    setWaist('');
    setHeight('');
    setFeet('');
    setInches('');
    setAge('');
    setGender('');
    setUnitSystem('metric');
    setResult(null);
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'Very Low Risk':
      case 'Low Risk':
        return 'text-green-600';
      case 'Moderate Risk':
        return 'text-orange-600';
      case 'High Risk':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const formatMeasurement = (measurement: number) => {
    const unit = unitSystem === 'metric' ? 'cm' : 'inches';
    return `${measurement.toFixed(1)} ${unit}`;
  };

  return (
    <>
      <Helmet>
        <title>Waist-to-Height Ratio Calculator - Health Risk Assessment Tool | DapsiWow</title>
        <meta name="description" content="Calculate your waist-to-height ratio and assess health risks. Get personalized recommendations for cardiovascular and metabolic health improvement." />
        <meta name="keywords" content="waist to height ratio calculator, health risk assessment, abdominal obesity, cardiovascular health, metabolic syndrome" />
        <meta property="og:title" content="Waist-to-Height Ratio Calculator - Health Risk Assessment Tool | DapsiWow" />
        <meta property="og:description" content="Calculate your waist-to-height ratio and assess health risks with personalized recommendations." />
        <meta property="og:type" content="website" />
        <link rel="canonical" href="/tools/waist-to-height-ratio-calculator" />
      </Helmet>

      <div className="min-h-screen flex flex-col" data-testid="page-waist-height-calculator">
        <Header />
        
        <main className="flex-1 bg-neutral-50">
          {/* Hero Section */}
          <section className="text-white py-16" style={{ background: 'linear-gradient(135deg, #f43f5e 0%, #e11d48 100%)' }}>
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <div className="w-20 h-20 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <i className="fas fa-ruler text-3xl"></i>
              </div>
              <h1 className="text-4xl sm:text-5xl font-bold mb-6" data-testid="text-page-title">
                Waist-to-Height Ratio Calculator
              </h1>
              <p className="text-xl text-blue-100 max-w-2xl mx-auto">
                Assess your health risks with the waist-to-height ratio - a simple yet powerful indicator of cardiovascular health
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
                            <Label htmlFor="metric">Metric (cm)</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="imperial" id="imperial" data-testid="radio-imperial" />
                            <Label htmlFor="imperial">Imperial (inches, ft/in)</Label>
                          </div>
                        </RadioGroup>
                      </div>

                      {/* Waist Circumference */}
                      <div className="space-y-3">
                        <Label htmlFor="waist" className="text-sm font-medium text-gray-700">
                          Waist Circumference {unitSystem === 'metric' ? '(cm)' : '(inches)'} *
                        </Label>
                        <Input
                          id="waist"
                          type="number"
                          value={waist}
                          onChange={(e) => setWaist(e.target.value)}
                          className="h-12 text-base border-gray-200 rounded-lg"
                          placeholder={unitSystem === 'metric' ? "80" : "32"}
                          min="0"
                          step="0.1"
                          data-testid="input-waist"
                        />
                        <p className="text-xs text-gray-500">
                          Measure at the narrowest point, usually just above the navel
                        </p>
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
                          onClick={calculateWaistHeightRatio}
                          className="flex-1 h-12 text-white font-medium rounded-lg"
                          style={{ backgroundColor: '#f43f5e' }}
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#e11d48'}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#f43f5e'}
                          data-testid="button-calculate"
                        >
                          <Calculator className="w-4 h-4 mr-2" />
                          Calculate Ratio
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
                      <h2 className="text-2xl font-semibold text-gray-900 mb-8">Assessment Results</h2>
                      
                      {result ? (
                        <div className="space-y-4" data-testid="waist-height-results">
                          {/* Ratio Value */}
                          <div className="bg-white rounded-lg p-4 border-l-4 border-blue-500">
                            <div className="flex justify-between items-center">
                              <span className="font-semibold text-gray-700">Waist-to-Height Ratio</span>
                              <span className="text-2xl font-bold text-blue-600" data-testid="text-ratio-value">
                                {result.ratio}
                              </span>
                            </div>
                          </div>

                          {/* Category */}
                          <div className="bg-white rounded-lg p-4">
                            <div className="flex justify-between items-center">
                              <span className="text-gray-600">Category</span>
                              <span className="font-semibold text-gray-900" data-testid="text-category">
                                {result.category}
                              </span>
                            </div>
                          </div>

                          {/* Health Risk */}
                          <div className="bg-white rounded-lg p-4">
                            <div className="flex justify-between items-center">
                              <span className="text-gray-600">Health Risk</span>
                              <span className={`font-semibold ${getRiskColor(result.healthRisk)}`} data-testid="text-health-risk">
                                {result.healthRisk}
                              </span>
                            </div>
                          </div>

                          {/* Ideal Waist Range */}
                          <div className="bg-green-50 rounded-lg p-4">
                            <h3 className="font-semibold text-gray-900 mb-2">Healthy Waist Range</h3>
                            <div className="text-sm text-gray-600">
                              <span className="font-medium" data-testid="text-ideal-waist-range">
                                {formatMeasurement(result.idealWaistRange.min)} - {formatMeasurement(result.idealWaistRange.max)}
                              </span>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">Based on 0.4-0.5 ratio range</p>
                          </div>

                          {/* Recommendations */}
                          <div className="bg-blue-50 rounded-lg p-4">
                            <h3 className="font-semibold text-gray-900 mb-3">Recommendations</h3>
                            <div className="space-y-2" data-testid="recommendations">
                              {result.recommendations.map((recommendation, index) => (
                                <div key={index} className="flex items-start">
                                  <span className="text-blue-600 mr-2 mt-1">•</span>
                                  <span className="text-sm text-gray-600">{recommendation}</span>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Reference Chart */}
                          <div className="mt-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-3">Ratio Categories</h3>
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span>Underweight</span>
                                <span className="text-blue-600 font-medium">&lt; 0.40</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Healthy</span>
                                <span className="text-green-600 font-medium">0.40 - 0.49</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Increased Risk</span>
                                <span className="text-orange-600 font-medium">0.50 - 0.59</span>
                              </div>
                              <div className="flex justify-between">
                                <span>High Risk</span>
                                <span className="text-red-600 font-medium">≥ 0.60</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-8" data-testid="no-results">
                          <i className="fas fa-ruler text-4xl text-gray-400 mb-4"></i>
                          <p className="text-gray-500">Enter your waist and height measurements to calculate the ratio</p>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Educational Content */}
              <div className="mt-12 space-y-8">
                <div className="bg-white rounded-2xl shadow-lg p-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-8">Understanding Waist-to-Height Ratio</h2>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-4">What is Waist-to-Height Ratio?</h3>
                      <p className="text-gray-600 mb-6 leading-relaxed">
                        The waist-to-height ratio (WHtR) is calculated by dividing your waist circumference by your height. 
                        Research shows it may be a better predictor of cardiovascular disease and metabolic syndrome than BMI, 
                        as it specifically measures abdominal fat distribution.
                      </p>
                      
                      <h3 className="text-xl font-semibold text-gray-900 mb-4">How to Measure</h3>
                      <ul className="text-gray-600 space-y-2 text-sm">
                        <li>• Stand up straight and breathe normally</li>
                        <li>• Locate your natural waist (narrowest point)</li>
                        <li>• Usually just above the navel</li>
                        <li>• Wrap tape measure snugly but not tight</li>
                        <li>• Keep tape parallel to the floor</li>
                        <li>• Take measurement at the end of normal exhale</li>
                      </ul>
                    </div>
                    
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-4">Why It Matters</h3>
                      <div className="space-y-3">
                        <div className="p-3 bg-red-50 rounded-lg">
                          <div className="font-medium text-gray-900">Cardiovascular Health</div>
                          <div className="text-sm text-gray-600">Predicts heart disease risk better than BMI</div>
                        </div>
                        
                        <div className="p-3 bg-orange-50 rounded-lg">
                          <div className="font-medium text-gray-900">Metabolic Syndrome</div>
                          <div className="text-sm text-gray-600">Early indicator of diabetes and insulin resistance</div>
                        </div>
                        
                        <div className="p-3 bg-yellow-50 rounded-lg">
                          <div className="font-medium text-gray-900">Simple Screening</div>
                          <div className="text-sm text-gray-600">Easy to measure and universally applicable</div>
                        </div>
                        
                        <div className="p-3 bg-blue-50 rounded-lg">
                          <div className="font-medium text-gray-900">Age Independent</div>
                          <div className="text-sm text-gray-600">Consistent thresholds across age groups</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Improving Your Waist-to-Height Ratio</h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Diet Strategies</h3>
                      <ul className="text-gray-600 space-y-2 text-sm">
                        <li>• Reduce refined carbohydrates and added sugars</li>
                        <li>• Increase fiber intake from vegetables and fruits</li>
                        <li>• Choose lean proteins and healthy fats</li>
                        <li>• Control portion sizes</li>
                        <li>• Stay hydrated with water</li>
                      </ul>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Exercise</h3>
                      <ul className="text-gray-600 space-y-2 text-sm">
                        <li>• Combine cardio and strength training</li>
                        <li>• Include core-strengthening exercises</li>
                        <li>• Aim for 150+ minutes moderate activity weekly</li>
                        <li>• Add high-intensity interval training (HIIT)</li>
                        <li>• Stay consistent with daily movement</li>
                      </ul>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Lifestyle</h3>
                      <ul className="text-gray-600 space-y-2 text-sm">
                        <li>• Get 7-9 hours of quality sleep</li>
                        <li>• Manage stress through relaxation techniques</li>
                        <li>• Avoid smoking and limit alcohol</li>
                        <li>• Monitor progress regularly</li>
                        <li>• Seek professional guidance when needed</li>
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

export default WaistToHeightRatioCalculator;