
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Helmet>
        <title>Ideal Weight Calculator - Calculate Your Ideal Body Weight | DapsiWow</title>
        <meta name="description" content="Calculate your ideal body weight using proven medical formulas (Devine, Robinson, Miller, Hamwi). Get personalized weight recommendations based on height and gender with our advanced ideal weight calculator." />
        <meta name="keywords" content="ideal weight calculator, ideal body weight calculator, perfect weight calculator, healthy weight calculator, target weight calculator, weight goals calculator, medical weight formulas, Devine formula, Robinson formula" />
        <meta property="og:title" content="Ideal Weight Calculator - Calculate Your Ideal Body Weight | DapsiWow" />
        <meta property="og:description" content="Calculate your ideal body weight using multiple proven medical formulas. Get personalized weight recommendations and healthy weight ranges instantly." />
        <meta property="og:type" content="website" />
        <meta name="robots" content="index, follow" />
        <meta name="author" content="DapsiWow" />
        <link rel="canonical" href="https://dapsiwow.com/tools/ideal-weight-calculator" />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            "name": "Ideal Weight Calculator",
            "description": "Calculate your ideal body weight using multiple proven medical formulas including Devine, Robinson, Miller, and Hamwi formulas. Get personalized weight recommendations based on height and gender.",
            "url": "https://dapsiwow.com/tools/ideal-weight-calculator",
            "applicationCategory": "HealthApplication",
            "operatingSystem": "Any",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "USD"
            },
            "featureList": [
              "Multiple medical weight formulas",
              "Metric and Imperial units",
              "Healthy weight range calculation",
              "Gender-specific calculations",
              "Instant results",
              "Scientific accuracy"
            ]
          })}
        </script>
      </Helmet>
      
      <Header />
      
      <main>
        {/* Hero Section */}
        <section className="relative py-12 sm:py-16 md:py-20 lg:py-24 xl:py-28 2xl:py-32 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-indigo-600/20"></div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="space-y-4 sm:space-y-6 md:space-y-7 lg:space-y-8">
              <div className="inline-flex items-center px-3 sm:px-4 py-1.5 sm:py-2 bg-white/80 backdrop-blur-sm rounded-full border border-blue-200">
                <span className="text-xs sm:text-sm font-medium text-blue-700">Professional Ideal Weight Calculator</span>
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl 2xl:text-8xl font-bold text-slate-900 leading-tight tracking-tight" data-testid="text-page-title">
                <span className="block">Smart Ideal Weight</span>
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 mt-1 sm:mt-2">
                  Calculator
                </span>
              </h1>
              <p className="text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl text-slate-600 max-w-sm sm:max-w-lg md:max-w-2xl lg:max-w-3xl xl:max-w-4xl mx-auto leading-relaxed px-2 sm:px-0">
                Calculate your ideal body weight using multiple proven medical formulas with personalized recommendations
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
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">Body Information</h2>
                    <p className="text-gray-600">Enter your physical details to calculate your ideal weight</p>
                  </div>
                  
                  <div className="space-y-6">
                    {/* Unit System */}
                    <div className="space-y-3">
                      <Label className="text-sm font-semibold text-gray-800 uppercase tracking-wide">Unit System</Label>
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
                      <Label className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                        Height {unitSystem === 'metric' ? '(cm)' : '(ft/in)'}
                      </Label>
                      {unitSystem === 'metric' ? (
                        <Input
                          type="number"
                          value={height}
                          onChange={(e) => setHeight(e.target.value)}
                          className="h-14 text-lg border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-blue-500"
                          placeholder="175"
                          min="100"
                          max="250"
                          step="0.1"
                          data-testid="input-height"
                        />
                      ) : (
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="feet" className="text-xs text-gray-500 mb-2 block">Feet</Label>
                            <Input
                              id="feet"
                              type="number"
                              value={feet}
                              onChange={(e) => setFeet(e.target.value)}
                              className="h-14 text-lg border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-blue-500"
                              placeholder="5"
                              min="3"
                              max="8"
                              data-testid="input-feet"
                            />
                          </div>
                          <div>
                            <Label htmlFor="inches" className="text-xs text-gray-500 mb-2 block">Inches</Label>
                            <Input
                              id="inches"
                              type="number"
                              value={inches}
                              onChange={(e) => setInches(e.target.value)}
                              className="h-14 text-lg border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-blue-500"
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
                      <Label className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                        Gender <span className="text-red-500">*</span>
                      </Label>
                      <Select value={gender} onValueChange={setGender}>
                        <SelectTrigger className="h-14 border-2 border-gray-200 rounded-xl text-lg" data-testid="select-gender">
                          <SelectValue placeholder="Select gender" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="male">Male</SelectItem>
                          <SelectItem value="female">Female</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-sm text-gray-500">
                        Gender is required as ideal weight formulas differ between male and female physiology
                      </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4 pt-6">
                      <Button
                        onClick={calculateIdealWeight}
                        className="flex-1 h-14 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold text-lg rounded-xl shadow-lg transform transition-all duration-200 hover:scale-105"
                        data-testid="button-calculate"
                      >
                        Calculate Ideal Weight
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
                </div>

                {/* Results Section */}
                <div className="bg-gradient-to-br from-gray-50 to-blue-50 p-8 lg:p-12">
                  <h2 className="text-2xl font-bold text-gray-900 mb-8">Ideal Weight Results</h2>
                  
                  {result ? (
                    <div className="space-y-6" data-testid="ideal-weight-results">
                      {/* Average Ideal Weight Highlight */}
                      <div className="bg-white rounded-2xl p-6 shadow-lg border border-blue-100">
                        <div className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-2">Average Ideal Weight</div>
                        <div className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600" data-testid="text-average-weight">
                          {formatWeight(result.average)}
                        </div>
                      </div>

                      {/* Healthy Weight Range */}
                      <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
                        <h4 className="font-bold text-green-800 mb-4 text-lg">Healthy Weight Range</h4>
                        <div className="text-2xl font-bold text-green-800" data-testid="text-weight-range">
                          {formatWeight(result.weightRange.min)} - {formatWeight(result.weightRange.max)}
                        </div>
                        <p className="text-sm text-green-600 mt-2">±10% of average ideal weight</p>
                      </div>

                      {/* Individual Formula Results */}
                      <div className="space-y-3">
                        <h3 className="font-semibold text-gray-900 mb-4 text-lg">Results by Formula</h3>
                        
                        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                          <div className="flex justify-between items-center">
                            <div>
                              <span className="font-medium text-gray-700">Devine Formula</span>
                              <p className="text-xs text-gray-500">Most widely used (1974)</p>
                            </div>
                            <span className="font-bold text-gray-900 text-lg" data-testid="text-devine-weight">
                              {formatWeight(result.devine)}
                            </span>
                          </div>
                        </div>

                        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                          <div className="flex justify-between items-center">
                            <div>
                              <span className="font-medium text-gray-700">Robinson Formula</span>
                              <p className="text-xs text-gray-500">Modified Devine (1983)</p>
                            </div>
                            <span className="font-bold text-gray-900 text-lg" data-testid="text-robinson-weight">
                              {formatWeight(result.robinson)}
                            </span>
                          </div>
                        </div>

                        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                          <div className="flex justify-between items-center">
                            <div>
                              <span className="font-medium text-gray-700">Miller Formula</span>
                              <p className="text-xs text-gray-500">Alternative method (1983)</p>
                            </div>
                            <span className="font-bold text-gray-900 text-lg" data-testid="text-miller-weight">
                              {formatWeight(result.miller)}
                            </span>
                          </div>
                        </div>

                        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                          <div className="flex justify-between items-center">
                            <div>
                              <span className="font-medium text-gray-700">Hamwi Formula</span>
                              <p className="text-xs text-gray-500">Clinical standard (1964)</p>
                            </div>
                            <span className="font-bold text-gray-900 text-lg" data-testid="text-hamwi-weight">
                              {formatWeight(result.hamwi)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-16" data-testid="no-results">
                      <div className="w-20 h-20 bg-gray-200 rounded-full mx-auto mb-6 flex items-center justify-center">
                        <div className="text-3xl font-bold text-gray-400">⚖</div>
                      </div>
                      <p className="text-gray-500 text-lg">Enter your height and gender to calculate ideal weight</p>
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
                <h3 className="text-2xl font-bold text-gray-900 mb-6">What is Ideal Body Weight?</h3>
                <div className="space-y-4 text-gray-600">
                  <p>
                    Ideal Body Weight (IBW) represents the optimal weight range for an individual based on their height, gender, and body frame. 
                    Our ideal weight calculator uses four scientifically validated medical formulas developed by leading researchers and healthcare 
                    professionals to provide accurate weight recommendations that support optimal health and longevity.
                  </p>
                  <p>
                    These medical formulas - Devine, Robinson, Miller, and Hamwi - have been extensively tested and are widely used in clinical 
                    settings for medication dosing, nutritional assessments, and health evaluations. By combining multiple formulas, our calculator 
                    provides a comprehensive weight range rather than a single target number.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">How to Use the Calculator?</h3>
                <div className="space-y-4 text-gray-600">
                  <p>
                    Using our ideal weight calculator is simple and provides instant results. First, select your preferred unit system 
                    (metric or imperial), then enter your height accurately. Gender selection is crucial as the medical formulas use 
                    different coefficients for male and female physiology.
                  </p>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                      <span className="text-sm">Choose between metric (kg, cm) or imperial (lbs, ft/in) units</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                      <span className="text-sm">Enter your height precisely for accurate calculations</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                      <span className="text-sm">Select your gender for formula-specific calculations</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                      <span className="text-sm">Get instant results with detailed formula breakdowns</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Medical Formulas Section */}
          <Card className="mt-8 bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
            <CardContent className="p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Understanding the Medical Weight Formulas</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
                    <h4 className="text-lg font-semibold text-blue-800 mb-3">Devine Formula (1974)</h4>
                    <p className="text-blue-700 text-sm mb-3">
                      The most widely used formula in clinical practice and pharmaceutical applications. Developed by Dr. B.J. Devine 
                      for drug dosing calculations and remains the gold standard in medical settings.
                    </p>
                    <div className="text-xs text-blue-600 bg-blue-100 rounded-lg p-3">
                      <strong>Male:</strong> 50 + 2.3 × (height in inches - 60)<br />
                      <strong>Female:</strong> 45.5 + 2.3 × (height in inches - 60)
                    </div>
                  </div>

                  <div className="bg-green-50 rounded-xl p-6 border border-green-200">
                    <h4 className="text-lg font-semibold text-green-800 mb-3">Robinson Formula (1983)</h4>
                    <p className="text-green-700 text-sm mb-3">
                      A refined version of the Devine formula with updated coefficients based on more recent population data. 
                      Widely used in nutrition assessment and clinical research studies.
                    </p>
                    <div className="text-xs text-green-600 bg-green-100 rounded-lg p-3">
                      <strong>Male:</strong> 52 + 1.9 × (height in inches - 60)<br />
                      <strong>Female:</strong> 49 + 1.7 × (height in inches - 60)
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="bg-purple-50 rounded-xl p-6 border border-purple-200">
                    <h4 className="text-lg font-semibold text-purple-800 mb-3">Miller Formula (1983)</h4>
                    <p className="text-purple-700 text-sm mb-3">
                      Developed as an alternative approach for calculating ideal weight, particularly useful for individuals 
                      with different body compositions and frame sizes.
                    </p>
                    <div className="text-xs text-purple-600 bg-purple-100 rounded-lg p-3">
                      <strong>Male:</strong> 56.2 + 1.41 × (height in inches - 60)<br />
                      <strong>Female:</strong> 53.1 + 1.36 × (height in inches - 60)
                    </div>
                  </div>

                  <div className="bg-orange-50 rounded-xl p-6 border border-orange-200">
                    <h4 className="text-lg font-semibold text-orange-800 mb-3">Hamwi Formula (1964)</h4>
                    <p className="text-orange-700 text-sm mb-3">
                      One of the original clinical standards for ideal weight calculation. Still referenced in medical 
                      literature and used as a baseline for comparison with newer formulas.
                    </p>
                    <div className="text-xs text-orange-600 bg-orange-100 rounded-lg p-3">
                      <strong>Male:</strong> 48 + 2.7 × (height in inches - 60)<br />
                      <strong>Female:</strong> 45.5 + 2.2 × (height in inches - 60)
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Applications and Benefits */}
          <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Practical Applications</h3>
                <div className="space-y-4">
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4">
                    <h4 className="font-semibold text-blue-800 mb-2">Healthcare & Medicine</h4>
                    <p className="text-blue-700 text-sm">Medical professionals use ideal weight calculations for drug dosing, anesthesia planning, and assessing health risks associated with weight status.</p>
                  </div>
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4">
                    <h4 className="font-semibold text-green-800 mb-2">Fitness & Nutrition</h4>
                    <p className="text-green-700 text-sm">Personal trainers and nutritionists use these calculations to set realistic weight goals and design appropriate meal and exercise plans.</p>
                  </div>
                  <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg p-4">
                    <h4 className="font-semibold text-purple-800 mb-2">Weight Management</h4>
                    <p className="text-purple-700 text-sm">Individuals can use ideal weight calculations to establish healthy target ranges for weight loss or weight gain programs.</p>
                  </div>
                  <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-lg p-4">
                    <h4 className="font-semibold text-orange-800 mb-2">Insurance & Screening</h4>
                    <p className="text-orange-700 text-sm">Insurance companies and health screening programs often reference ideal weight ranges for risk assessment and premium calculations.</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Important Considerations</h3>
                <div className="space-y-4">
                  <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                    <h4 className="font-semibold text-yellow-800 mb-2">Individual Variations</h4>
                    <p className="text-yellow-700 text-sm">These formulas provide general guidelines but don't account for individual factors like muscle mass, bone density, or body composition.</p>
                  </div>
                  <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                    <h4 className="font-semibold text-red-800 mb-2">Athlete Considerations</h4>
                    <p className="text-red-700 text-sm">Athletes and highly muscular individuals may weigh more than calculated ideal weight due to increased muscle mass, which is healthier than excess fat.</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <h4 className="font-semibold text-gray-800 mb-2">Age and Ethnicity</h4>
                    <p className="text-gray-700 text-sm">These formulas were developed based on specific population data and may not perfectly apply to all age groups or ethnic backgrounds.</p>
                  </div>
                  <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                    <h4 className="font-semibold text-blue-800 mb-2">Medical Consultation</h4>
                    <p className="text-blue-700 text-sm">Always consult healthcare professionals for personalized weight management advice, especially if you have underlying health conditions.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Healthy Weight Management Tips */}
          <Card className="mt-8 bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
            <CardContent className="p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Healthy Weight Management Strategies</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-gray-800 border-b border-blue-200 pb-2">Nutrition Focus</h4>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-gray-600 text-sm">Maintain a balanced diet with adequate protein, healthy fats, and complex carbohydrates</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-gray-600 text-sm">Practice portion control and mindful eating habits</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-gray-600 text-sm">Stay hydrated and limit processed foods and added sugars</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-gray-800 border-b border-blue-200 pb-2">Exercise Approach</h4>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-gray-600 text-sm">Combine cardiovascular exercise with strength training for optimal results</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-gray-600 text-sm">Aim for at least 150 minutes of moderate-intensity exercise weekly</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-gray-600 text-sm">Include flexibility and balance exercises in your routine</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-gray-800 border-b border-blue-200 pb-2">Lifestyle Factors</h4>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-gray-600 text-sm">Prioritize quality sleep (7-9 hours nightly) for metabolic health</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-gray-600 text-sm">Manage stress through meditation, yoga, or other relaxation techniques</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-gray-600 text-sm">Track progress with multiple metrics beyond just weight</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Related Tools */}
          <Card className="mt-8 bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
            <CardContent className="p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">Related Health & Weight Calculators</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <a href="/tools/bmi-calculator" className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 hover:from-blue-100 hover:to-blue-200 transition-all duration-200 text-center group">
                  <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                    <span className="text-white font-bold">BMI</span>
                  </div>
                  <h4 className="font-semibold text-blue-800 mb-2">BMI Calculator</h4>
                  <p className="text-blue-600 text-xs">Calculate Body Mass Index and health categories</p>
                </a>
                
                <a href="/tools/body-fat-calculator" className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 hover:from-green-100 hover:to-green-200 transition-all duration-200 text-center group">
                  <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                    <span className="text-white font-bold">%</span>
                  </div>
                  <h4 className="font-semibold text-green-800 mb-2">Body Fat Calculator</h4>
                  <p className="text-green-600 text-xs">Calculate body fat percentage using measurements</p>
                </a>
                
                <a href="/tools/calorie-calculator" className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 hover:from-purple-100 hover:to-purple-200 transition-all duration-200 text-center group">
                  <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                    <span className="text-white font-bold">CAL</span>
                  </div>
                  <h4 className="font-semibold text-purple-800 mb-2">Calorie Calculator</h4>
                  <p className="text-purple-600 text-xs">Calculate daily calorie needs for weight goals</p>
                </a>
                
                <a href="/tools/lean-body-mass-calculator" className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-6 hover:from-orange-100 hover:to-orange-200 transition-all duration-200 text-center group">
                  <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                    <span className="text-white font-bold">LBM</span>
                  </div>
                  <h4 className="font-semibold text-orange-800 mb-2">Lean Body Mass</h4>
                  <p className="text-orange-600 text-xs">Calculate muscle mass and body composition</p>
                </a>
              </div>
            </CardContent>
          </Card>

          {/* FAQ Section */}
          <Card className="mt-8 bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
            <CardContent className="p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-8">Frequently Asked Questions</h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div>
                    <h4 className="text-lg font-semibold text-gray-800 mb-3">How accurate are ideal weight calculations?</h4>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      Our ideal weight calculator uses scientifically validated formulas that are widely accepted in medical practice. 
                      While these provide good estimates for most people, individual factors like muscle mass, bone density, and body 
                      composition can affect accuracy. The calculator is most accurate for average body types and should be used as 
                      guidance rather than absolute targets.
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="text-lg font-semibold text-gray-800 mb-3">What's the difference between ideal weight and healthy weight?</h4>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      Ideal weight refers to theoretical optimal weight calculated using mathematical formulas based on height and gender. 
                      Healthy weight is a broader concept that considers overall health status, body composition, fitness level, and 
                      individual medical factors. Our calculator provides both an ideal weight estimate and a healthy weight range (±10%) 
                      to account for individual variations.
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="text-lg font-semibold text-gray-800 mb-3">Can athletes and bodybuilders use this calculator?</h4>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      Traditional ideal weight formulas may not be accurate for athletes and bodybuilders with above-average muscle mass. 
                      These individuals often weigh more than the calculated ideal weight due to increased muscle density. Athletes should 
                      focus on body composition analysis, performance metrics, and consult sports medicine professionals for personalized targets.
                    </p>
                  </div>
                </div>
                
                <div className="space-y-6">
                  <div>
                    <h4 className="text-lg font-semibold text-gray-800 mb-3">How often should I check my ideal weight?</h4>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      Since ideal weight is based on height and gender (which don't change frequently), you don't need to recalculate often. 
                      However, you might want to reassess if you experience significant height changes, are tracking long-term weight management goals, 
                      or want to compare with other health metrics like BMI or body fat percentage during fitness journeys.
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="text-lg font-semibold text-gray-800 mb-3">Which formula should I trust most?</h4>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      Each formula has its strengths and applications. The Devine formula is most widely used in clinical practice, while 
                      Robinson provides updated coefficients. Miller offers an alternative approach, and Hamwi represents the historical standard. 
                      Our calculator averages all four to provide a balanced estimate that considers different methodological approaches.
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="text-lg font-semibold text-gray-800 mb-3">Should I aim for the exact ideal weight number?</h4>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      Rather than targeting an exact number, focus on the healthy weight range our calculator provides (±10% of ideal weight). 
                      This range accounts for individual variations and is more realistic for long-term health goals. Remember that factors like 
                      muscle mass, hydration, and overall fitness are more important than hitting a specific weight target.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default IdealWeightCalculator;
