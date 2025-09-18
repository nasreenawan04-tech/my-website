
import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

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

export default function WaistToHeightRatioCalculator() {
  const [waist, setWaist] = useState('80');
  const [height, setHeight] = useState('170');
  const [feet, setFeet] = useState('5');
  const [inches, setInches] = useState('7');
  const [age, setAge] = useState('30');
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
    setWaist('80');
    setHeight('170');
    setFeet('5');
    setInches('7');
    setAge('30');
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Helmet>
        <title>Waist-to-Height Ratio Calculator - Health Risk Assessment Tool | DapsiWow</title>
        <meta name="description" content="Free waist-to-height ratio calculator to assess cardiovascular health risks and metabolic syndrome. Get instant WHtR calculations with personalized health recommendations and ideal waist measurements." />
        <meta name="keywords" content="waist to height ratio calculator, WHtR calculator, waist height ratio, cardiovascular health calculator, metabolic syndrome assessment, abdominal obesity calculator, health risk calculator, waist circumference calculator" />
        <meta property="og:title" content="Waist-to-Height Ratio Calculator - Health Risk Assessment Tool | DapsiWow" />
        <meta property="og:description" content="Calculate your waist-to-height ratio and assess health risks with personalized recommendations for better cardiovascular health." />
        <meta property="og:type" content="website" />
        <meta name="robots" content="index, follow" />
        <meta name="author" content="DapsiWow" />
        <link rel="canonical" href="https://dapsiwow.com/tools/waist-to-height-ratio-calculator" />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            "name": "Waist-to-Height Ratio Calculator",
            "description": "Free online waist-to-height ratio calculator for health risk assessment. Calculate WHtR to evaluate cardiovascular health and metabolic syndrome risks with personalized recommendations.",
            "url": "https://dapsiwow.com/tools/waist-to-height-ratio-calculator",
            "applicationCategory": "HealthApplication",
            "operatingSystem": "Any",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "USD"
            },
            "featureList": [
              "Calculate waist-to-height ratio",
              "Health risk assessment",
              "Personalized recommendations",
              "Metric and imperial units",
              "Ideal waist range calculation",
              "Cardiovascular health insights"
            ]
          })}
        </script>
      </Helmet>
      
      <Header />
      
      <main>
        {/* Hero Section */}
        <section className="relative py-20 sm:py-28 lg:py-32 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-indigo-600/20"></div>
          <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="space-y-8">
              <div className="inline-flex items-center px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full border border-blue-200">
                <span className="text-sm font-medium text-blue-700">Professional Health Assessment</span>
              </div>
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-slate-900 leading-tight">
                Waist-to-Height
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                  Ratio Calculator
                </span>
              </h1>
              <p className="text-xl sm:text-2xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
                Assess cardiovascular health risks and metabolic syndrome with the scientifically proven waist-to-height ratio
              </p>
            </div>
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-4 py-16">
          {/* Main Calculator Card */}
          <Card className="bg-white/90 backdrop-blur-sm shadow-2xl border-0 rounded-3xl overflow-hidden">
            <CardContent className="p-0">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-0">
                {/* Input Section */}
                <div className="lg:col-span-2 p-8 lg:p-12 space-y-8">
                  <div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">Health Assessment Configuration</h2>
                    <p className="text-gray-600">Enter your body measurements to calculate waist-to-height ratio</p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Unit System Selection */}
                    <div className="space-y-3">
                      <Label className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                        Unit System
                      </Label>
                      <Select value={unitSystem} onValueChange={setUnitSystem}>
                        <SelectTrigger className="h-14 border-2 border-gray-200 rounded-xl text-lg" data-testid="select-unit-system">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="metric">Metric (cm)</SelectItem>
                          <SelectItem value="imperial">Imperial (inches, ft/in)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Waist Circumference */}
                    <div className="space-y-3">
                      <Label htmlFor="waist" className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                        Waist Circumference {unitSystem === 'metric' ? '(cm)' : '(inches)'}
                      </Label>
                      <Input
                        id="waist"
                        type="number"
                        value={waist}
                        onChange={(e) => setWaist(e.target.value)}
                        className="h-14 text-lg border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-blue-500"
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
                      <Label className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                        Height {unitSystem === 'metric' ? '(cm)' : '(ft/in)'}
                      </Label>
                      {unitSystem === 'metric' ? (
                        <Input
                          type="number"
                          value={height}
                          onChange={(e) => setHeight(e.target.value)}
                          className="h-14 text-lg border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-blue-500"
                          placeholder="170"
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
                              className="h-14 text-lg border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-blue-500"
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
                              className="h-14 text-lg border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-blue-500"
                              placeholder="7"
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
                      <Label htmlFor="age" className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                        Age (years) <span className="text-gray-400 font-normal">- Optional</span>
                      </Label>
                      <Input
                        id="age"
                        type="number"
                        value={age}
                        onChange={(e) => setAge(e.target.value)}
                        className="h-14 text-lg border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-blue-500"
                        placeholder="30"
                        min="1"
                        max="120"
                        data-testid="input-age"
                      />
                    </div>
                  </div>

                  {/* Gender Selection */}
                  <div className="space-y-3">
                    <Label className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                      Gender <span className="text-gray-400 font-normal">- Optional</span>
                    </Label>
                    <Select value={gender} onValueChange={setGender}>
                      <SelectTrigger className="h-14 border-2 border-gray-200 rounded-xl text-lg" data-testid="select-gender">
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
                  <div className="flex flex-col sm:flex-row gap-4 pt-6">
                    <Button
                      onClick={calculateWaistHeightRatio}
                      className="flex-1 h-14 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold text-lg rounded-xl shadow-lg transform transition-all duration-200 hover:scale-105"
                      data-testid="button-calculate"
                    >
                      Calculate Ratio
                    </Button>
                    <Button
                      onClick={resetCalculator}
                      variant="outline"
                      className="h-14 px-8 border-2 border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold text-lg rounded-xl"
                      data-testid="button-reset"
                    >
                      Reset
                    </Button>
                  </div>
                </div>

                {/* Results Section */}
                <div className="bg-gradient-to-br from-gray-50 to-blue-50 p-8 lg:p-12">
                  <h2 className="text-2xl font-bold text-gray-900 mb-8">Health Assessment Results</h2>
                  
                  {result ? (
                    <div className="space-y-6" data-testid="waist-height-results">
                      {/* Ratio Value Highlight */}
                      <div className="bg-white rounded-2xl p-6 shadow-lg border border-blue-100">
                        <div className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-2">Waist-to-Height Ratio</div>
                        <div className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600" data-testid="text-ratio-value">
                          {result.ratio}
                        </div>
                      </div>

                      {/* Health Assessment */}
                      <div className="space-y-4">
                        <div className="bg-white rounded-xl p-4 shadow-sm">
                          <div className="flex justify-between items-center">
                            <span className="font-medium text-gray-700">Category</span>
                            <span className="font-bold text-gray-900" data-testid="text-category">
                              {result.category}
                            </span>
                          </div>
                        </div>
                        <div className="bg-white rounded-xl p-4 shadow-sm">
                          <div className="flex justify-between items-center">
                            <span className="font-medium text-gray-700">Health Risk Level</span>
                            <span className={`font-bold ${getRiskColor(result.healthRisk)}`} data-testid="text-health-risk">
                              {result.healthRisk}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Ideal Waist Range */}
                      <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
                        <h4 className="font-bold text-green-800 mb-4 text-lg">Healthy Waist Range</h4>
                        <div className="text-sm text-green-700 mb-2">
                          <span className="font-medium" data-testid="text-ideal-waist-range">
                            {formatMeasurement(result.idealWaistRange.min)} - {formatMeasurement(result.idealWaistRange.max)}
                          </span>
                        </div>
                        <p className="text-xs text-green-600">Based on 0.4-0.5 ratio range for optimal health</p>
                      </div>

                      {/* Recommendations */}
                      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
                        <h4 className="font-bold text-blue-800 mb-4 text-lg">Health Recommendations</h4>
                        <div className="space-y-2" data-testid="recommendations">
                          {result.recommendations.map((recommendation, index) => (
                            <div key={index} className="flex items-start">
                              <span className="text-blue-600 mr-2 mt-1">•</span>
                              <span className="text-sm text-blue-700">{recommendation}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-16" data-testid="no-results">
                      <div className="w-20 h-20 bg-gray-200 rounded-full mx-auto mb-6 flex items-center justify-center">
                        <div className="text-3xl font-bold text-gray-400">⚖</div>
                      </div>
                      <p className="text-gray-500 text-lg">Enter your measurements to calculate waist-to-height ratio and assess health risks</p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* SEO Content Section */}
          <div className="mt-16 grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Understanding Waist-to-Height Ratio</h3>
                <div className="space-y-4 text-gray-600">
                  <p>
                    The waist-to-height ratio (WHtR) is a simple but powerful health indicator that measures abdominal 
                    obesity by dividing waist circumference by height. Unlike BMI, which doesn't distinguish between 
                    muscle and fat, WHtR specifically targets central adiposity - the dangerous fat around your organs.
                  </p>
                  <p>
                    Research shows that WHtR is a superior predictor of cardiovascular disease, type 2 diabetes, and 
                    metabolic syndrome compared to BMI alone. A ratio of 0.5 or higher indicates increased health risks, 
                    while maintaining a ratio below 0.5 is associated with better long-term health outcomes.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Why Waist-to-Height Ratio Matters</h3>
                <div className="space-y-4 text-gray-600">
                  <p>
                    Central obesity, measured by waist-to-height ratio, is strongly linked to metabolic dysfunction. 
                    Visceral fat around the abdomen produces inflammatory substances and hormones that interfere with 
                    insulin sensitivity, blood pressure regulation, and cholesterol metabolism.
                  </p>
                  <p>
                    Our calculator provides instant assessment using evidence-based thresholds: ratios under 0.4 may 
                    indicate underweight, 0.4-0.5 represents healthy range, 0.5-0.6 shows increased risk, and above 
                    0.6 indicates high risk for cardiovascular complications.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Scientific Foundation of WHtR</h3>
                <div className="space-y-3 text-gray-600">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-sm">Validated across diverse populations and age groups</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-sm">Better predictor than BMI for cardiometabolic risks</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-sm">Simple measurement requiring only waist and height</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-sm">Consistent cut-off values across ethnic groups</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-sm">Endorsed by health organizations worldwide</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">How to Measure Waist Correctly</h3>
                <div className="space-y-3 text-gray-600">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-sm">Stand upright with feet together and arms at sides</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-sm">Locate natural waist at narrowest point above hips</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-sm">Place tape measure horizontal and snug but not tight</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-sm">Breathe normally and measure at end of gentle exhale</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-sm">Take measurement to nearest 0.1 cm or 0.5 inch</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Health Risk Categories */}
          <div className="mt-12 space-y-8">
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-8">Waist-to-Height Ratio Categories and Health Implications</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div className="border-l-4 border-blue-500 pl-6">
                      <h4 className="text-lg font-semibold text-blue-800 mb-2">Underweight (&lt; 0.40)</h4>
                      <p className="text-sm text-gray-600 mb-3">
                        May indicate insufficient body weight or muscle mass. While cardiovascular risk is low, 
                        nutritional deficiencies and osteoporosis risks should be considered.
                      </p>
                      <ul className="text-xs text-gray-500 space-y-1">
                        <li>• Consider medical evaluation for underlying conditions</li>
                        <li>• Focus on healthy weight gain through proper nutrition</li>
                        <li>• Include resistance training to build muscle mass</li>
                      </ul>
                    </div>
                    
                    <div className="border-l-4 border-green-500 pl-6">
                      <h4 className="text-lg font-semibold text-green-800 mb-2">Healthy (0.40 - 0.49)</h4>
                      <p className="text-sm text-gray-600 mb-3">
                        Optimal range associated with lowest risk of cardiovascular disease, diabetes, and metabolic 
                        syndrome. Maintain this ratio for long-term health benefits.
                      </p>
                      <ul className="text-xs text-gray-500 space-y-1">
                        <li>• Continue current healthy lifestyle practices</li>
                        <li>• Regular physical activity and balanced nutrition</li>
                        <li>• Annual health check-ups for monitoring</li>
                      </ul>
                    </div>
                  </div>
                  
                  <div className="space-y-6">
                    <div className="border-l-4 border-orange-500 pl-6">
                      <h4 className="text-lg font-semibold text-orange-800 mb-2">Increased Risk (0.50 - 0.59)</h4>
                      <p className="text-sm text-gray-600 mb-3">
                        Moderate elevation in cardiometabolic risk. Early intervention through lifestyle 
                        modifications can prevent progression to higher risk categories.
                      </p>
                      <ul className="text-xs text-gray-500 space-y-1">
                        <li>• Implement structured exercise program</li>
                        <li>• Consider nutritional counseling</li>
                        <li>• Monitor blood pressure and glucose levels</li>
                      </ul>
                    </div>
                    
                    <div className="border-l-4 border-red-500 pl-6">
                      <h4 className="text-lg font-semibold text-red-800 mb-2">High Risk (≥ 0.60)</h4>
                      <p className="text-sm text-gray-600 mb-3">
                        Significantly increased risk for cardiovascular disease, type 2 diabetes, and metabolic 
                        syndrome. Medical consultation and comprehensive intervention recommended.
                      </p>
                      <ul className="text-xs text-gray-500 space-y-1">
                        <li>• Seek medical evaluation and personalized treatment plan</li>
                        <li>• Consider supervised weight management programs</li>
                        <li>• Regular monitoring of cardiovascular risk factors</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Improvement Strategies */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
                <CardContent className="p-8">
                  <h3 className="text-xl font-bold text-gray-900 mb-6">Nutrition Strategies</h3>
                  <div className="space-y-4 text-gray-600">
                    <div className="bg-green-50 rounded-lg p-4">
                      <h4 className="font-semibold text-green-800 mb-2 text-sm">Reduce Refined Carbohydrates</h4>
                      <p className="text-xs text-green-700">Limit sugar, white bread, and processed foods that promote abdominal fat storage.</p>
                    </div>
                    <div className="bg-blue-50 rounded-lg p-4">
                      <h4 className="font-semibold text-blue-800 mb-2 text-sm">Increase Fiber Intake</h4>
                      <p className="text-xs text-blue-700">Soluble fiber helps reduce visceral fat and improves metabolic health.</p>
                    </div>
                    <div className="bg-purple-50 rounded-lg p-4">
                      <h4 className="font-semibold text-purple-800 mb-2 text-sm">Choose Lean Proteins</h4>
                      <p className="text-xs text-purple-700">High-quality proteins support muscle maintenance during weight loss.</p>
                    </div>
                    <div className="bg-orange-50 rounded-lg p-4">
                      <h4 className="font-semibold text-orange-800 mb-2 text-sm">Healthy Fats</h4>
                      <p className="text-xs text-orange-700">Omega-3 fatty acids and monounsaturated fats reduce inflammation.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
                <CardContent className="p-8">
                  <h3 className="text-xl font-bold text-gray-900 mb-6">Exercise Recommendations</h3>
                  <div className="space-y-4 text-gray-600">
                    <div className="bg-red-50 rounded-lg p-4">
                      <h4 className="font-semibold text-red-800 mb-2 text-sm">Cardiovascular Exercise</h4>
                      <p className="text-xs text-red-700">150+ minutes moderate intensity or 75+ minutes vigorous activity weekly.</p>
                    </div>
                    <div className="bg-indigo-50 rounded-lg p-4">
                      <h4 className="font-semibold text-indigo-800 mb-2 text-sm">Strength Training</h4>
                      <p className="text-xs text-indigo-700">2-3 sessions per week targeting all major muscle groups.</p>
                    </div>
                    <div className="bg-teal-50 rounded-lg p-4">
                      <h4 className="font-semibold text-teal-800 mb-2 text-sm">Core Strengthening</h4>
                      <p className="text-xs text-teal-700">Specific exercises to target abdominal and back muscles.</p>
                    </div>
                    <div className="bg-yellow-50 rounded-lg p-4">
                      <h4 className="font-semibold text-yellow-800 mb-2 text-sm">HIIT Training</h4>
                      <p className="text-xs text-yellow-700">High-intensity intervals effectively reduce visceral adipose tissue.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
                <CardContent className="p-8">
                  <h3 className="text-xl font-bold text-gray-900 mb-6">Lifestyle Modifications</h3>
                  <div className="space-y-4 text-gray-600">
                    <div className="bg-violet-50 rounded-lg p-4">
                      <h4 className="font-semibold text-violet-800 mb-2 text-sm">Sleep Quality</h4>
                      <p className="text-xs text-violet-700">7-9 hours of quality sleep supports healthy metabolism and weight management.</p>
                    </div>
                    <div className="bg-rose-50 rounded-lg p-4">
                      <h4 className="font-semibold text-rose-800 mb-2 text-sm">Stress Management</h4>
                      <p className="text-xs text-rose-700">Chronic stress increases cortisol levels, promoting abdominal fat storage.</p>
                    </div>
                    <div className="bg-cyan-50 rounded-lg p-4">
                      <h4 className="font-semibold text-cyan-800 mb-2 text-sm">Hydration</h4>
                      <p className="text-xs text-cyan-700">Adequate water intake supports metabolism and may reduce appetite.</p>
                    </div>
                    <div className="bg-lime-50 rounded-lg p-4">
                      <h4 className="font-semibold text-lime-800 mb-2 text-sm">Regular Monitoring</h4>
                      <p className="text-xs text-lime-700">Track progress monthly to maintain motivation and adjust strategies.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Medical Considerations */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-8">Medical Considerations and Associated Conditions</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-lg font-semibold text-gray-800 mb-4">Metabolic Syndrome Components</h4>
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <div className="w-3 h-3 bg-red-500 rounded-full flex-shrink-0"></div>
                          <span className="text-sm text-gray-600">Central obesity (waist-to-height ratio ≥ 0.5)</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-3 h-3 bg-orange-500 rounded-full flex-shrink-0"></div>
                          <span className="text-sm text-gray-600">Elevated blood pressure (≥ 130/85 mmHg)</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-3 h-3 bg-yellow-500 rounded-full flex-shrink-0"></div>
                          <span className="text-sm text-gray-600">High fasting glucose (≥ 100 mg/dL)</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-3 h-3 bg-blue-500 rounded-full flex-shrink-0"></div>
                          <span className="text-sm text-gray-600">Low HDL cholesterol</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-3 h-3 bg-purple-500 rounded-full flex-shrink-0"></div>
                          <span className="text-sm text-gray-600">Elevated triglycerides (≥ 150 mg/dL)</span>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="text-lg font-semibold text-gray-800 mb-4">When to Seek Medical Advice</h4>
                      <div className="space-y-2 text-sm text-gray-600">
                        <p>• Waist-to-height ratio ≥ 0.6 with family history of diabetes or heart disease</p>
                        <p>• Rapid increase in waist circumference over short periods</p>
                        <p>• Presence of additional metabolic syndrome criteria</p>
                        <p>• Difficulty losing weight despite lifestyle modifications</p>
                        <p>• Development of symptoms like frequent urination or excessive thirst</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-lg font-semibold text-gray-800 mb-4">Associated Health Conditions</h4>
                      <div className="grid grid-cols-1 gap-3">
                        <div className="bg-red-50 rounded-lg p-3 border-l-4 border-red-400">
                          <div className="font-medium text-red-800 text-sm">Cardiovascular Disease</div>
                          <div className="text-xs text-red-600">Increased risk of heart attack, stroke, and hypertension</div>
                        </div>
                        <div className="bg-orange-50 rounded-lg p-3 border-l-4 border-orange-400">
                          <div className="font-medium text-orange-800 text-sm">Type 2 Diabetes</div>
                          <div className="text-xs text-orange-600">Insulin resistance and glucose metabolism dysfunction</div>
                        </div>
                        <div className="bg-yellow-50 rounded-lg p-3 border-l-4 border-yellow-400">
                          <div className="font-medium text-yellow-800 text-sm">Sleep Apnea</div>
                          <div className="text-xs text-yellow-600">Breathing disruptions during sleep affecting quality of rest</div>
                        </div>
                        <div className="bg-green-50 rounded-lg p-3 border-l-4 border-green-400">
                          <div className="font-medium text-green-800 text-sm">Fatty Liver Disease</div>
                          <div className="text-xs text-green-600">Non-alcoholic steatohepatitis and liver dysfunction</div>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="text-lg font-semibold text-gray-800 mb-4">Monitoring Recommendations</h4>
                      <div className="space-y-2 text-sm text-gray-600">
                        <p>• Monthly waist measurements for progress tracking</p>
                        <p>• Annual lipid profile and glucose screening</p>
                        <p>• Regular blood pressure monitoring</p>
                        <p>• Comprehensive metabolic panel as recommended by physician</p>
                        <p>• Consider cardiac risk assessment if ratio remains elevated</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* FAQ Section */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-8">Frequently Asked Questions</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">How often should I measure my waist-to-height ratio?</h4>
                      <p className="text-gray-600 text-sm">Monthly measurements are recommended for tracking progress. Significant changes in body composition typically occur over weeks to months, making frequent daily measurements unnecessary and potentially misleading.</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">Is waist-to-height ratio better than BMI?</h4>
                      <p className="text-gray-600 text-sm">WHtR is generally considered superior for assessing cardiometabolic risk because it specifically measures central obesity. Unlike BMI, it distinguishes between muscle and fat distribution, providing better insight into health risks.</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">Can genetics affect my waist-to-height ratio?</h4>
                      <p className="text-gray-600 text-sm">Genetic factors influence fat distribution patterns, but lifestyle factors like diet, exercise, and stress management have the greatest impact on waist circumference and overall health outcomes.</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">What if my ratio is in the healthy range but I feel overweight?</h4>
                      <p className="text-gray-600 text-sm">A healthy WHtR indicates low cardiometabolic risk regardless of how you feel about your appearance. Focus on overall health markers rather than aesthetic concerns, and consult healthcare providers for personalized advice.</p>
                    </div>
                  </div>
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">Does age affect waist-to-height ratio interpretation?</h4>
                      <p className="text-gray-600 text-sm">The 0.5 threshold remains consistent across age groups, but older adults may have slightly different risk profiles. Age-related muscle loss and metabolic changes should be considered in overall health assessment.</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">Can medications affect waist circumference?</h4>
                      <p className="text-gray-600 text-sm">Certain medications, including some antidepressants, corticosteroids, and diabetes medications, can influence weight distribution. Discuss concerns with your healthcare provider rather than discontinuing prescribed medications.</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">How quickly can I improve my waist-to-height ratio?</h4>
                      <p className="text-gray-600 text-sm">Healthy weight loss of 1-2 pounds per week can lead to noticeable improvements in 8-12 weeks. Sustainable lifestyle changes produce better long-term results than rapid weight loss approaches.</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">Is the calculator accurate for pregnant women?</h4>
                      <p className="text-gray-600 text-sm">Pregnancy significantly alters body composition and waist measurements. Pregnant women should use pregnancy-specific health assessments and consult their healthcare providers for appropriate monitoring.</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
