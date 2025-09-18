
import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface WHRResult {
  ratio: number;
  category: string;
  healthRisk: string;
  recommendations: string[];
  idealWaistRange: {
    min: number;
    max: number;
  };
}

export default function WHRCalculator() {
  const [waist, setWaist] = useState('80');
  const [hip, setHip] = useState('100');
  const [age, setAge] = useState('30');
  const [gender, setGender] = useState('');
  const [unitSystem, setUnitSystem] = useState('metric');
  const [result, setResult] = useState<WHRResult | null>(null);

  const calculateWHR = () => {
    const waistValue = parseFloat(waist);
    const hipValue = parseFloat(hip);

    if (waistValue && hipValue && hipValue > 0) {
      const ratio = waistValue / hipValue;
      let category = '';
      let healthRisk = '';
      let recommendations: string[] = [];

      // Classification based on WHO standards and gender
      if (gender === 'male') {
        if (ratio < 0.85) {
          category = 'Low Risk';
          healthRisk = 'Low Risk';
          recommendations = [
            'Maintain current healthy lifestyle',
            'Continue regular physical activity',
            'Follow a balanced diet with proper portion control'
          ];
        } else if (ratio >= 0.85 && ratio < 0.95) {
          category = 'Moderate Risk';
          healthRisk = 'Moderate Risk';
          recommendations = [
            'Consider reducing waist circumference through exercise',
            'Increase cardiovascular exercise to 150+ minutes per week',
            'Focus on core strengthening exercises',
            'Monitor blood pressure and cholesterol levels'
          ];
        } else {
          category = 'High Risk';
          healthRisk = 'High Risk';
          recommendations = [
            'Consult with a healthcare provider immediately',
            'Implement a structured weight loss plan',
            'Significantly increase physical activity',
            'Consider working with a nutritionist',
            'Monitor for cardiovascular disease risk factors'
          ];
        }
      } else if (gender === 'female') {
        if (ratio < 0.80) {
          category = 'Low Risk';
          healthRisk = 'Low Risk';
          recommendations = [
            'Maintain current healthy lifestyle',
            'Continue regular physical activity',
            'Follow a balanced diet with proper portion control'
          ];
        } else if (ratio >= 0.80 && ratio < 0.90) {
          category = 'Moderate Risk';
          healthRisk = 'Moderate Risk';
          recommendations = [
            'Consider reducing waist circumference through exercise',
            'Increase cardiovascular exercise to 150+ minutes per week',
            'Focus on core strengthening exercises',
            'Monitor blood pressure and cholesterol levels'
          ];
        } else {
          category = 'High Risk';
          healthRisk = 'High Risk';
          recommendations = [
            'Consult with a healthcare provider immediately',
            'Implement a structured weight loss plan',
            'Significantly increase physical activity',
            'Consider working with a nutritionist',
            'Monitor for cardiovascular disease risk factors'
          ];
        }
      } else {
        // Generic classification when gender not specified
        if (ratio < 0.80) {
          category = 'Low Risk';
          healthRisk = 'Low Risk';
        } else if (ratio >= 0.80 && ratio < 0.90) {
          category = 'Moderate Risk';
          healthRisk = 'Moderate Risk';
        } else {
          category = 'High Risk';
          healthRisk = 'High Risk';
        }
        recommendations = [
          'Select your gender for personalized recommendations',
          'Consult healthcare provider for detailed assessment',
          'Maintain regular physical activity',
          'Follow a balanced nutrition plan'
        ];
      }

      // Calculate ideal waist range based on hip measurement and gender
      let idealWaistRange;
      if (gender === 'male') {
        idealWaistRange = {
          min: hipValue * 0.70,
          max: hipValue * 0.84
        };
      } else if (gender === 'female') {
        idealWaistRange = {
          min: hipValue * 0.65,
          max: hipValue * 0.79
        };
      } else {
        idealWaistRange = {
          min: hipValue * 0.65,
          max: hipValue * 0.82
        };
      }

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
    setHip('100');
    setAge('30');
    setGender('');
    setUnitSystem('metric');
    setResult(null);
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
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
        <title>WHR Calculator - Free Waist-to-Hip Ratio Calculator | DapsiWow</title>
        <meta name="description" content="Free WHR calculator to measure waist-to-hip ratio and assess cardiovascular health risks. Get instant WHR calculations with personalized health recommendations based on WHO standards." />
        <meta name="keywords" content="WHR calculator, waist to hip ratio calculator, waist hip ratio, cardiovascular health calculator, body shape calculator, apple pear body shape, health risk assessment, WHR formula, body fat distribution" />
        <meta property="og:title" content="WHR Calculator - Free Waist-to-Hip Ratio Calculator | DapsiWow" />
        <meta property="og:description" content="Calculate your waist-to-hip ratio (WHR) and assess health risks with our free calculator. Get personalized recommendations based on WHO standards." />
        <meta property="og:type" content="website" />
        <meta name="robots" content="index, follow" />
        <meta name="author" content="DapsiWow" />
        <link rel="canonical" href="https://dapsiwow.com/tools/whr-calculator" />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            "name": "WHR Calculator",
            "description": "Free online waist-to-hip ratio calculator for health risk assessment. Calculate WHR to evaluate cardiovascular health and body fat distribution with personalized recommendations based on WHO standards.",
            "url": "https://dapsiwow.com/tools/whr-calculator",
            "applicationCategory": "HealthApplication",
            "operatingSystem": "Any",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "USD"
            },
            "featureList": [
              "Calculate waist-to-hip ratio",
              "Health risk assessment",
              "Personalized recommendations",
              "WHO standard classifications",
              "Gender-specific analysis",
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
                WHR Calculator
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                  Waist-Hip Ratio
                </span>
              </h1>
              <p className="text-xl sm:text-2xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
                Assess your cardiovascular health and body fat distribution with the WHO-approved waist-to-hip ratio
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
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">WHR Configuration</h2>
                    <p className="text-gray-600">Enter your body measurements to calculate waist-to-hip ratio</p>
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
                          <SelectItem value="imperial">Imperial (inches)</SelectItem>
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

                    {/* Hip Circumference */}
                    <div className="space-y-3">
                      <Label htmlFor="hip" className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                        Hip Circumference {unitSystem === 'metric' ? '(cm)' : '(inches)'}
                      </Label>
                      <Input
                        id="hip"
                        type="number"
                        value={hip}
                        onChange={(e) => setHip(e.target.value)}
                        className="h-14 text-lg border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-blue-500"
                        placeholder={unitSystem === 'metric' ? "100" : "40"}
                        min="0"
                        step="0.1"
                        data-testid="input-hip"
                      />
                      <p className="text-xs text-gray-500">
                        Measure at the widest point of your hips
                      </p>
                    </div>

                    {/* Age */}
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
                      Gender
                    </Label>
                    <Select value={gender} onValueChange={setGender}>
                      <SelectTrigger className="h-14 border-2 border-gray-200 rounded-xl text-lg" data-testid="select-gender">
                        <SelectValue placeholder="Select gender for accurate assessment" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-gray-500">
                      Gender selection provides more accurate risk assessment based on WHO standards
                    </p>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-4 pt-6">
                    <Button
                      onClick={calculateWHR}
                      className="flex-1 h-14 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold text-lg rounded-xl shadow-lg transform transition-all duration-200 hover:scale-105"
                      data-testid="button-calculate"
                    >
                      Calculate WHR
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
                    <div className="space-y-6" data-testid="whr-results">
                      {/* WHR Value Highlight */}
                      <div className="bg-white rounded-2xl p-6 shadow-lg border border-blue-100">
                        <div className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-2">Waist-to-Hip Ratio</div>
                        <div className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600" data-testid="text-whr-value">
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
                        <p className="text-xs text-green-600">Based on your hip measurement and WHO guidelines</p>
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
                      <p className="text-gray-500 text-lg">Enter your waist and hip measurements to calculate WHR and assess health risks</p>
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
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Understanding Waist-to-Hip Ratio (WHR)</h3>
                <div className="space-y-4 text-gray-600">
                  <p>
                    The waist-to-hip ratio (WHR) is a crucial health metric that measures the distribution of body fat 
                    by comparing your waist circumference to your hip circumference. This simple calculation provides 
                    valuable insights into your risk of developing cardiovascular disease, diabetes, and other health conditions.
                  </p>
                  <p>
                    Unlike BMI, which doesn't distinguish between muscle and fat or consider fat distribution, WHR 
                    specifically identifies abdominal obesity - the most dangerous type of fat accumulation. Research 
                    consistently shows that people who carry excess weight around their waist (apple-shaped) face 
                    higher health risks than those who carry weight in their hips and thighs (pear-shaped).
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">WHO Standards and Health Implications</h3>
                <div className="space-y-4 text-gray-600">
                  <p>
                    The World Health Organization (WHO) has established specific WHR thresholds based on extensive 
                    research across diverse populations. For men, a WHR above 0.85 indicates increased health risks, 
                    while for women, the threshold is 0.80. These gender-specific standards reflect biological 
                    differences in fat distribution patterns.
                  </p>
                  <p>
                    Our calculator uses these WHO-approved standards to provide accurate risk assessments. A high WHR 
                    indicates excess visceral fat around internal organs, which produces inflammatory substances that 
                    interfere with normal metabolic processes, leading to insulin resistance, elevated blood pressure, 
                    and abnormal cholesterol levels.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">How to Measure Accurately</h3>
                <div className="space-y-3 text-gray-600">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-sm">Stand upright with feet together and arms at sides</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-sm">Measure waist at narrowest point, typically just above navel</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-sm">Measure hips at widest point, usually over hip bones</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-sm">Keep tape measure snug but not tight against skin</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-sm">Take measurements after normal exhale, without sucking in</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Body Shape and Health Risks</h3>
                <div className="space-y-3 text-gray-600">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-sm">Apple shape (high WHR): Higher cardiovascular disease risk</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-sm">Pear shape (low WHR): Lower metabolic disease risk</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-sm">Visceral fat accumulation increases inflammation markers</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-sm">Subcutaneous fat (hips/thighs) is metabolically safer</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-sm">WHR is independent of overall body weight</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Health Risk Categories */}
          <div className="mt-12 space-y-8">
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-8">WHR Categories and Associated Health Risks</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <h4 className="text-lg font-semibold text-gray-800 mb-4">Men's WHR Classifications</h4>
                    <div className="border-l-4 border-green-500 pl-6">
                      <h5 className="text-md font-semibold text-green-800 mb-2">Low Risk (< 0.85)</h5>
                      <p className="text-sm text-gray-600 mb-3">
                        Optimal fat distribution with minimal cardiovascular risk. Continue healthy lifestyle 
                        practices including regular exercise and balanced nutrition.
                      </p>
                      <ul className="text-xs text-gray-500 space-y-1">
                        <li>• Maintain current weight and activity levels</li>
                        <li>• Focus on preventive health measures</li>
                        <li>• Regular health screenings as recommended</li>
                      </ul>
                    </div>
                    
                    <div className="border-l-4 border-orange-500 pl-6">
                      <h5 className="text-md font-semibold text-orange-800 mb-2">Moderate Risk (0.85 - 0.94)</h5>
                      <p className="text-sm text-gray-600 mb-3">
                        Increased risk for cardiovascular disease and metabolic syndrome. Lifestyle 
                        modifications can significantly improve health outcomes.
                      </p>
                      <ul className="text-xs text-gray-500 space-y-1">
                        <li>• Increase physical activity to 300+ minutes per week</li>
                        <li>• Focus on abdominal fat reduction strategies</li>
                        <li>• Monitor blood pressure and cholesterol levels</li>
                      </ul>
                    </div>

                    <div className="border-l-4 border-red-500 pl-6">
                      <h5 className="text-md font-semibold text-red-800 mb-2">High Risk (≥ 0.95)</h5>
                      <p className="text-sm text-gray-600 mb-3">
                        Significantly elevated risk for heart disease, stroke, and type 2 diabetes. 
                        Medical consultation and comprehensive intervention recommended.
                      </p>
                      <ul className="text-xs text-gray-500 space-y-1">
                        <li>• Seek immediate medical evaluation</li>
                        <li>• Consider supervised weight management program</li>
                        <li>• Regular cardiovascular risk factor monitoring</li>
                      </ul>
                    </div>
                  </div>
                  
                  <div className="space-y-6">
                    <h4 className="text-lg font-semibold text-gray-800 mb-4">Women's WHR Classifications</h4>
                    <div className="border-l-4 border-green-500 pl-6">
                      <h5 className="text-md font-semibold text-green-800 mb-2">Low Risk (< 0.80)</h5>
                      <p className="text-sm text-gray-600 mb-3">
                        Healthy fat distribution pattern associated with lower risk of cardiovascular 
                        disease and metabolic complications.
                      </p>
                      <ul className="text-xs text-gray-500 space-y-1">
                        <li>• Continue current healthy lifestyle</li>
                        <li>• Maintain regular physical activity routine</li>
                        <li>• Focus on overall wellness and prevention</li>
                      </ul>
                    </div>
                    
                    <div className="border-l-4 border-orange-500 pl-6">
                      <h5 className="text-md font-semibold text-orange-800 mb-2">Moderate Risk (0.80 - 0.89)</h5>
                      <p className="text-sm text-gray-600 mb-3">
                        Moderately increased risk requiring attention to waist circumference reduction 
                        through targeted lifestyle interventions.
                      </p>
                      <ul className="text-xs text-gray-500 space-y-1">
                        <li>• Implement structured exercise program</li>
                        <li>• Consider nutritional counseling</li>
                        <li>• Monitor hormonal factors affecting fat distribution</li>
                      </ul>
                    </div>

                    <div className="border-l-4 border-red-500 pl-6">
                      <h5 className="text-md font-semibold text-red-800 mb-2">High Risk (≥ 0.90)</h5>
                      <p className="text-sm text-gray-600 mb-3">
                        High risk for cardiovascular disease, diabetes, and metabolic syndrome. 
                        Professional medical guidance essential for risk reduction.
                      </p>
                      <ul className="text-xs text-gray-500 space-y-1">
                        <li>• Comprehensive medical evaluation required</li>
                        <li>• Multidisciplinary approach to weight management</li>
                        <li>• Regular monitoring of metabolic parameters</li>
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
                  <h3 className="text-xl font-bold text-gray-900 mb-6">Dietary Strategies</h3>
                  <div className="space-y-4 text-gray-600">
                    <div className="bg-green-50 rounded-lg p-4">
                      <h4 className="font-semibold text-green-800 mb-2 text-sm">Mediterranean Diet</h4>
                      <p className="text-xs text-green-700">Emphasize olive oil, fish, vegetables, and whole grains to reduce abdominal fat.</p>
                    </div>
                    <div className="bg-blue-50 rounded-lg p-4">
                      <h4 className="font-semibold text-blue-800 mb-2 text-sm">Reduce Refined Sugars</h4>
                      <p className="text-xs text-blue-700">Limit processed foods and sugary drinks that promote visceral fat accumulation.</p>
                    </div>
                    <div className="bg-purple-50 rounded-lg p-4">
                      <h4 className="font-semibold text-purple-800 mb-2 text-sm">Increase Fiber Intake</h4>
                      <p className="text-xs text-purple-700">Soluble fiber helps reduce belly fat and improves metabolic health markers.</p>
                    </div>
                    <div className="bg-orange-50 rounded-lg p-4">
                      <h4 className="font-semibold text-orange-800 mb-2 text-sm">Portion Control</h4>
                      <p className="text-xs text-orange-700">Smaller, frequent meals help regulate metabolism and reduce waist circumference.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
                <CardContent className="p-8">
                  <h3 className="text-xl font-bold text-gray-900 mb-6">Exercise Programs</h3>
                  <div className="space-y-4 text-gray-600">
                    <div className="bg-red-50 rounded-lg p-4">
                      <h4 className="font-semibold text-red-800 mb-2 text-sm">High-Intensity Interval Training</h4>
                      <p className="text-xs text-red-700">HIIT effectively targets visceral fat and improves cardiovascular health.</p>
                    </div>
                    <div className="bg-indigo-50 rounded-lg p-4">
                      <h4 className="font-semibold text-indigo-800 mb-2 text-sm">Strength Training</h4>
                      <p className="text-xs text-indigo-700">Resistance exercises build muscle mass and increase metabolic rate.</p>
                    </div>
                    <div className="bg-teal-50 rounded-lg p-4">
                      <h4 className="font-semibold text-teal-800 mb-2 text-sm">Core Strengthening</h4>
                      <p className="text-xs text-teal-700">Targeted abdominal exercises improve muscle tone and posture.</p>
                    </div>
                    <div className="bg-yellow-50 rounded-lg p-4">
                      <h4 className="font-semibold text-yellow-800 mb-2 text-sm">Cardiovascular Exercise</h4>
                      <p className="text-xs text-yellow-700">Regular aerobic activity reduces overall body fat and waist circumference.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
                <CardContent className="p-8">
                  <h3 className="text-xl font-bold text-gray-900 mb-6">Lifestyle Factors</h3>
                  <div className="space-y-4 text-gray-600">
                    <div className="bg-violet-50 rounded-lg p-4">
                      <h4 className="font-semibold text-violet-800 mb-2 text-sm">Sleep Quality</h4>
                      <p className="text-xs text-violet-700">7-9 hours of quality sleep helps regulate hormones affecting fat storage.</p>
                    </div>
                    <div className="bg-rose-50 rounded-lg p-4">
                      <h4 className="font-semibold text-rose-800 mb-2 text-sm">Stress Management</h4>
                      <p className="text-xs text-rose-700">Chronic stress elevates cortisol, promoting abdominal fat accumulation.</p>
                    </div>
                    <div className="bg-cyan-50 rounded-lg p-4">
                      <h4 className="font-semibold text-cyan-800 mb-2 text-sm">Hormone Balance</h4>
                      <p className="text-xs text-cyan-700">Address hormonal imbalances that may contribute to central obesity.</p>
                    </div>
                    <div className="bg-lime-50 rounded-lg p-4">
                      <h4 className="font-semibold text-lime-800 mb-2 text-sm">Regular Monitoring</h4>
                      <p className="text-xs text-lime-700">Track WHR monthly to monitor progress and adjust strategies accordingly.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Medical Considerations */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-8">Medical Conditions Associated with High WHR</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-lg font-semibold text-gray-800 mb-4">Cardiovascular Diseases</h4>
                      <div className="space-y-3">
                        <div className="bg-red-50 rounded-lg p-3 border-l-4 border-red-400">
                          <div className="font-medium text-red-800 text-sm">Coronary Heart Disease</div>
                          <div className="text-xs text-red-600">Increased risk of heart attacks and angina due to arterial plaque buildup</div>
                        </div>
                        <div className="bg-orange-50 rounded-lg p-3 border-l-4 border-orange-400">
                          <div className="font-medium text-orange-800 text-sm">Hypertension</div>
                          <div className="text-xs text-orange-600">Elevated blood pressure from increased peripheral resistance</div>
                        </div>
                        <div className="bg-yellow-50 rounded-lg p-3 border-l-4 border-yellow-400">
                          <div className="font-medium text-yellow-800 text-sm">Stroke Risk</div>
                          <div className="text-xs text-yellow-600">Higher likelihood of cerebrovascular events and complications</div>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="text-lg font-semibold text-gray-800 mb-4">When to Consult Healthcare Providers</h4>
                      <div className="space-y-2 text-sm text-gray-600">
                        <p>• WHR above gender-specific thresholds (0.85 for men, 0.80 for women)</p>
                        <p>• Family history of cardiovascular disease or diabetes</p>
                        <p>• Presence of metabolic syndrome symptoms</p>
                        <p>• Difficulty reducing waist circumference despite lifestyle changes</p>
                        <p>• Additional risk factors like smoking or sedentary lifestyle</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-lg font-semibold text-gray-800 mb-4">Metabolic Disorders</h4>
                      <div className="grid grid-cols-1 gap-3">
                        <div className="bg-blue-50 rounded-lg p-3 border-l-4 border-blue-400">
                          <div className="font-medium text-blue-800 text-sm">Type 2 Diabetes</div>
                          <div className="text-xs text-blue-600">Insulin resistance and impaired glucose metabolism</div>
                        </div>
                        <div className="bg-green-50 rounded-lg p-3 border-l-4 border-green-400">
                          <div className="font-medium text-green-800 text-sm">Metabolic Syndrome</div>
                          <div className="text-xs text-green-600">Cluster of conditions increasing disease risk</div>
                        </div>
                        <div className="bg-purple-50 rounded-lg p-3 border-l-4 border-purple-400">
                          <div className="font-medium text-purple-800 text-sm">Dyslipidemia</div>
                          <div className="text-xs text-purple-600">Abnormal cholesterol and triglyceride levels</div>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="text-lg font-semibold text-gray-800 mb-4">Monitoring Recommendations</h4>
                      <div className="space-y-2 text-sm text-gray-600">
                        <p>• Monthly WHR measurements for progress tracking</p>
                        <p>• Annual comprehensive metabolic panel</p>
                        <p>• Blood pressure monitoring every 3-6 months</p>
                        <p>• Lipid profile assessment as recommended by physician</p>
                        <p>• HbA1c testing for diabetes screening</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* FAQ Section */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-8">Frequently Asked Questions about WHR</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">How often should I measure my WHR?</h4>
                      <p className="text-gray-600 text-sm">Monthly measurements are ideal for tracking progress. Body composition changes occur gradually, so weekly measurements may show misleading fluctuations due to factors like bloating or water retention.</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">Is WHR more accurate than BMI for health assessment?</h4>
                      <p className="text-gray-600 text-sm">WHR provides better insight into health risks because it specifically measures fat distribution. While BMI considers overall weight, WHR identifies dangerous abdominal fat that's strongly linked to cardiovascular disease.</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">Can hormones affect my WHR?</h4>
                      <p className="text-gray-600 text-sm">Yes, hormones significantly impact fat distribution. Menopause, thyroid disorders, and cortisol imbalances can increase abdominal fat storage, affecting WHR measurements and health risks.</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">What if my WHR is healthy but I still have belly fat?</h4>
                      <p className="text-gray-600 text-sm">A healthy WHR indicates good proportional fat distribution. Some abdominal fat is normal and necessary. Focus on overall health markers rather than aesthetic concerns, and consult healthcare providers if concerned.</p>
                    </div>
                  </div>
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">Does age affect WHR interpretation?</h4>
                      <p className="text-gray-600 text-sm">Age-related hormonal changes can affect fat distribution, but WHR thresholds remain consistent across age groups. However, older adults may need more comprehensive health assessments beyond WHR alone.</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">Can exercise target abdominal fat specifically?</h4>
                      <p className="text-gray-600 text-sm">While spot reduction isn't possible, certain exercises like HIIT and strength training are particularly effective at reducing visceral fat. Core exercises improve muscle tone but don't specifically burn abdominal fat.</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">How quickly can I improve my WHR?</h4>
                      <p className="text-gray-600 text-sm">Sustainable improvements typically occur over 3-6 months with consistent lifestyle changes. Rapid changes may indicate water weight fluctuations rather than actual fat reduction. Patience and consistency are key.</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">Are there genetic factors that affect WHR?</h4>
                      <p className="text-gray-600 text-sm">Genetics influence body shape and fat distribution patterns, but lifestyle factors have the greatest impact on WHR and associated health risks. Even with genetic predisposition, healthy habits can significantly improve outcomes.</p>
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
