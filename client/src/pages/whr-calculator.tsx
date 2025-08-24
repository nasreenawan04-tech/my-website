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

interface WHRResult {
  ratio: number;
  category: string;
  healthRisk: string;
  recommendations: string[];
  idealRange: {
    min: number;
    max: number;
  };
}

const WHRCalculator = () => {
  const [waist, setWaist] = useState('');
  const [hip, setHip] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [unitSystem, setUnitSystem] = useState('metric');
  const [result, setResult] = useState<WHRResult | null>(null);

  const calculateWHR = () => {
    let waistMeasurement: number;
    let hipMeasurement: number;

    waistMeasurement = parseFloat(waist);
    hipMeasurement = parseFloat(hip);

    if (waistMeasurement && hipMeasurement && hipMeasurement > 0 && gender) {
      const ratio = waistMeasurement / hipMeasurement;
      let category = '';
      let healthRisk = '';
      let recommendations: string[] = [];
      let idealRange = { min: 0, max: 0 };

      // Gender-specific thresholds
      if (gender === 'male') {
        idealRange = { min: 0.8, max: 0.9 };
        if (ratio < 0.8) {
          category = 'Low';
          healthRisk = 'Very Low Risk';
          recommendations = [
            'Maintain current healthy lifestyle',
            'Continue regular physical activity',
            'Monitor weight and waist measurements periodically'
          ];
        } else if (ratio >= 0.8 && ratio < 0.9) {
          category = 'Moderate';
          healthRisk = 'Low Risk';
          recommendations = [
            'Maintain current lifestyle with minor improvements',
            'Include core strengthening exercises',
            'Monitor cardiovascular health markers'
          ];
        } else if (ratio >= 0.9 && ratio < 1.0) {
          category = 'High';
          healthRisk = 'Moderate Risk';
          recommendations = [
            'Focus on reducing abdominal fat through diet and exercise',
            'Increase cardiovascular exercise to 150+ minutes weekly',
            'Consider consulting a healthcare provider',
            'Monitor blood pressure and cholesterol levels'
          ];
        } else {
          category = 'Very High';
          healthRisk = 'High Risk';
          recommendations = [
            'Consult healthcare provider for comprehensive evaluation',
            'Implement structured weight loss plan',
            'Regular monitoring of metabolic health markers',
            'Consider working with nutritionist and fitness professional',
            'Screen for diabetes and cardiovascular disease'
          ];
        }
      } else {
        // Female thresholds
        idealRange = { min: 0.7, max: 0.8 };
        if (ratio < 0.7) {
          category = 'Low';
          healthRisk = 'Very Low Risk';
          recommendations = [
            'Maintain current healthy lifestyle',
            'Continue regular physical activity',
            'Monitor weight and waist measurements periodically'
          ];
        } else if (ratio >= 0.7 && ratio < 0.8) {
          category = 'Moderate';
          healthRisk = 'Low Risk';
          recommendations = [
            'Maintain current lifestyle with minor improvements',
            'Include core strengthening exercises',
            'Monitor cardiovascular health markers'
          ];
        } else if (ratio >= 0.8 && ratio < 0.85) {
          category = 'High';
          healthRisk = 'Moderate Risk';
          recommendations = [
            'Focus on reducing abdominal fat through diet and exercise',
            'Increase cardiovascular exercise to 150+ minutes weekly',
            'Consider consulting a healthcare provider',
            'Monitor blood pressure and cholesterol levels'
          ];
        } else {
          category = 'Very High';
          healthRisk = 'High Risk';
          recommendations = [
            'Consult healthcare provider for comprehensive evaluation',
            'Implement structured weight loss plan',
            'Regular monitoring of metabolic health markers',
            'Consider working with nutritionist and fitness professional',
            'Screen for diabetes and cardiovascular disease'
          ];
        }
      }

      setResult({
        ratio: Math.round(ratio * 1000) / 1000,
        category,
        healthRisk,
        recommendations,
        idealRange
      });
    }
  };

  const resetCalculator = () => {
    setWaist('');
    setHip('');
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
    return `${measurement.toFixed(2)}`;
  };

  return (
    <>
      <Helmet>
        <title>WHR Calculator - Waist-Hip Ratio Health Assessment Tool | DapsiWow</title>
        <meta name="description" content="Calculate your waist-to-hip ratio (WHR) and assess health risks. Get personalized recommendations based on gender-specific thresholds." />
        <meta name="keywords" content="WHR calculator, waist hip ratio calculator, body shape assessment, health risk calculator, android obesity, gynoid obesity" />
        <meta property="og:title" content="WHR Calculator - Waist-Hip Ratio Health Assessment Tool | DapsiWow" />
        <meta property="og:description" content="Calculate your waist-to-hip ratio and assess health risks with gender-specific recommendations." />
        <meta property="og:type" content="website" />
        <link rel="canonical" href="/tools/whr-calculator" />
      </Helmet>

      <div className="min-h-screen flex flex-col" data-testid="page-whr-calculator">
        <Header />
        
        <main className="flex-1 bg-neutral-50">
          {/* Hero Section */}
          <section className="text-white py-16" style={{ background: 'linear-gradient(135deg, #f43f5e 0%, #e11d48 100%)' }}>
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <div className="w-20 h-20 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <i className="fas fa-tape text-3xl"></i>
              </div>
              <h1 className="text-4xl sm:text-5xl font-bold mb-6" data-testid="text-page-title">
                WHR Calculator
              </h1>
              <p className="text-xl text-blue-100 max-w-2xl mx-auto">
                Calculate your Waist-to-Hip Ratio and assess health risks with gender-specific analysis
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
                            <Label htmlFor="imperial">Imperial (inches)</Label>
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
                        <p className="text-xs text-gray-500">
                          Gender affects WHR thresholds for health risk assessment
                        </p>
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

                      {/* Hip Circumference */}
                      <div className="space-y-3">
                        <Label htmlFor="hip" className="text-sm font-medium text-gray-700">
                          Hip Circumference {unitSystem === 'metric' ? '(cm)' : '(inches)'} *
                        </Label>
                        <Input
                          id="hip"
                          type="number"
                          value={hip}
                          onChange={(e) => setHip(e.target.value)}
                          className="h-12 text-base border-gray-200 rounded-lg"
                          placeholder={unitSystem === 'metric' ? "100" : "40"}
                          min="0"
                          step="0.1"
                          data-testid="input-hip"
                        />
                        <p className="text-xs text-gray-500">
                          Measure at the widest point around the hips and buttocks
                        </p>
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

                      {/* Action Buttons */}
                      <div className="flex gap-4 pt-6">
                        <Button
                          onClick={calculateWHR}
                          className="flex-1 h-12 text-white font-medium rounded-lg"
                          style={{ backgroundColor: '#f43f5e' }}
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#e11d48'}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#f43f5e'}
                          data-testid="button-calculate"
                        >
                          <Calculator className="w-4 h-4 mr-2" />
                          Calculate WHR
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
                      <h2 className="text-2xl font-semibold text-gray-900 mb-8">WHR Assessment</h2>
                      
                      {result ? (
                        <div className="space-y-4" data-testid="whr-results">
                          {/* WHR Value */}
                          <div className="bg-white rounded-lg p-4 border-l-4 border-purple-500">
                            <div className="flex justify-between items-center">
                              <span className="font-semibold text-gray-700">Waist-to-Hip Ratio</span>
                              <span className="text-2xl font-bold text-purple-600" data-testid="text-whr-value">
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

                          {/* Ideal Range */}
                          <div className="bg-green-50 rounded-lg p-4">
                            <h3 className="font-semibold text-gray-900 mb-2">
                              Healthy Range ({gender === 'male' ? 'Male' : 'Female'})
                            </h3>
                            <div className="text-sm text-gray-600">
                              <span className="font-medium" data-testid="text-ideal-range">
                                {formatMeasurement(result.idealRange.min)} - {formatMeasurement(result.idealRange.max)}
                              </span>
                            </div>
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
                            <h3 className="text-lg font-semibold text-gray-900 mb-3">
                              {gender === 'male' ? 'Male' : 'Female'} WHR Categories
                            </h3>
                            <div className="space-y-2 text-sm">
                              {gender === 'male' ? (
                                <>
                                  <div className="flex justify-between">
                                    <span>Low</span>
                                    <span className="text-green-600 font-medium">&lt; 0.80</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span>Moderate</span>
                                    <span className="text-green-600 font-medium">0.80 - 0.89</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span>High</span>
                                    <span className="text-orange-600 font-medium">0.90 - 0.99</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span>Very High</span>
                                    <span className="text-red-600 font-medium">≥ 1.00</span>
                                  </div>
                                </>
                              ) : (
                                <>
                                  <div className="flex justify-between">
                                    <span>Low</span>
                                    <span className="text-green-600 font-medium">&lt; 0.70</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span>Moderate</span>
                                    <span className="text-green-600 font-medium">0.70 - 0.79</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span>High</span>
                                    <span className="text-orange-600 font-medium">0.80 - 0.84</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span>Very High</span>
                                    <span className="text-red-600 font-medium">≥ 0.85</span>
                                  </div>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-8" data-testid="no-results">
                          <i className="fas fa-tape text-4xl text-gray-400 mb-4"></i>
                          <p className="text-gray-500">Enter your waist and hip measurements to calculate WHR</p>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Educational Content */}
              <div className="mt-12 space-y-8">
                <div className="bg-white rounded-2xl shadow-lg p-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-8">Understanding Waist-to-Hip Ratio (WHR)</h2>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-4">What is WHR?</h3>
                      <p className="text-gray-600 mb-6 leading-relaxed">
                        Waist-to-Hip Ratio (WHR) measures the proportion of fat stored around your waist compared to your hips. 
                        It helps identify body shape (apple vs. pear) and associated health risks. A higher WHR indicates more 
                        abdominal fat, which is linked to increased cardiovascular and metabolic risks.
                      </p>
                      
                      <h3 className="text-xl font-semibold text-gray-900 mb-4">How to Measure Correctly</h3>
                      <div className="space-y-3">
                        <div className="p-3 bg-blue-50 rounded-lg">
                          <div className="font-medium text-gray-900">Waist Measurement</div>
                          <div className="text-sm text-gray-600">At the narrowest point, usually just above the navel</div>
                        </div>
                        
                        <div className="p-3 bg-purple-50 rounded-lg">
                          <div className="font-medium text-gray-900">Hip Measurement</div>
                          <div className="text-sm text-gray-600">At the widest point around hips and buttocks</div>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-4">Body Shape Types</h3>
                      <div className="space-y-3">
                        <div className="p-3 bg-red-50 rounded-lg">
                          <div className="font-medium text-gray-900">Apple Shape (High WHR)</div>
                          <div className="text-sm text-gray-600">
                            More fat around waist - Higher health risks
                          </div>
                        </div>
                        
                        <div className="p-3 bg-green-50 rounded-lg">
                          <div className="font-medium text-gray-900">Pear Shape (Low WHR)</div>
                          <div className="text-sm text-gray-600">
                            More fat around hips - Lower health risks
                          </div>
                        </div>
                      </div>
                      
                      <h3 className="text-xl font-semibold text-gray-900 mb-4 mt-6">Health Implications</h3>
                      <ul className="text-gray-600 space-y-2 text-sm">
                        <li>• Cardiovascular disease risk</li>
                        <li>• Type 2 diabetes development</li>
                        <li>• Metabolic syndrome indicators</li>
                        <li>• Hormonal balance assessment</li>
                        <li>• Overall mortality prediction</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Improving Your WHR</h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Targeted Exercise</h3>
                      <ul className="text-gray-600 space-y-2 text-sm">
                        <li>• Core strengthening exercises</li>
                        <li>• High-intensity interval training (HIIT)</li>
                        <li>• Resistance training for muscle building</li>
                        <li>• Cardiovascular exercise for fat burning</li>
                        <li>• Focus on compound movements</li>
                      </ul>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Nutrition Focus</h3>
                      <ul className="text-gray-600 space-y-2 text-sm">
                        <li>• Reduce refined sugars and processed foods</li>
                        <li>• Increase protein intake for muscle preservation</li>
                        <li>• Include anti-inflammatory foods</li>
                        <li>• Control overall caloric intake</li>
                        <li>• Stay consistent with meal timing</li>
                      </ul>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Lifestyle Changes</h3>
                      <ul className="text-gray-600 space-y-2 text-sm">
                        <li>• Prioritize quality sleep (7-9 hours)</li>
                        <li>• Manage stress through meditation</li>
                        <li>• Limit alcohol consumption</li>
                        <li>• Quit smoking if applicable</li>
                        <li>• Regular health monitoring</li>
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

export default WHRCalculator;