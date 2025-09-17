
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Helmet>
        <title>BMI Calculator - Free Body Mass Index Calculator | DapsiWow</title>
        <meta name="description" content="Free BMI calculator to calculate your Body Mass Index instantly. Get accurate BMI results, health category classification, and personalized weight recommendations with metric and imperial unit support." />
        <meta name="keywords" content="BMI calculator, body mass index calculator, BMI chart, healthy weight calculator, weight category, obesity calculator, BMI formula, ideal weight calculator, health assessment tool, fitness calculator" />
        <meta property="og:title" content="BMI Calculator - Free Body Mass Index Calculator | DapsiWow" />
        <meta property="og:description" content="Calculate your BMI (Body Mass Index) with our free calculator. Get instant results, health category classification, and weight recommendations." />
        <meta property="og:type" content="website" />
        <meta name="robots" content="index, follow" />
        <meta name="author" content="DapsiWow" />
        <link rel="canonical" href="https://dapsiwow.com/tools/bmi-calculator" />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            "name": "BMI Calculator",
            "description": "Free online BMI calculator to calculate Body Mass Index for health assessment and weight management. Features metric and imperial units with personalized recommendations.",
            "url": "https://dapsiwow.com/tools/bmi-calculator",
            "applicationCategory": "HealthApplication",
            "operatingSystem": "Any",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "USD"
            },
            "featureList": [
              "Calculate BMI instantly",
              "Metric and imperial units",
              "Health category classification",
              "Weight recommendations",
              "Age and gender consideration",
              "Healthy weight range calculation"
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
                <span className="text-sm font-medium text-blue-700">Professional BMI Calculator</span>
              </div>
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-slate-900 leading-tight" data-testid="text-bmi-title">
                Smart BMI
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                  Calculator
                </span>
              </h1>
              <p className="text-xl sm:text-2xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
                Calculate your Body Mass Index with advanced health insights and personalized weight recommendations
              </p>
            </div>
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-4 py-16" data-testid="page-bmi-calculator">
          {/* Main Calculator Card */}
          <Card className="bg-white/90 backdrop-blur-sm shadow-2xl border-0 rounded-3xl overflow-hidden">
            <CardContent className="p-0">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-0">
                {/* Input Section */}
                <div className="lg:col-span-2 p-8 lg:p-12 space-y-8">
                  <div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">BMI Configuration</h2>
                    <p className="text-gray-600">Enter your body measurements to get accurate BMI calculations</p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Unit System */}
                    <div className="md:col-span-2 space-y-3">
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

                    {/* Weight */}
                    <div className="space-y-3">
                      <Label htmlFor="weight" className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                        Weight {unitSystem === 'metric' ? '(kg)' : '(lbs)'}
                      </Label>
                      <div className="relative">
                        <Input
                          id="weight"
                          type="number"
                          value={weight}
                          onChange={(e) => setWeight(e.target.value)}
                          className="h-14 text-lg border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-blue-500"
                          placeholder={unitSystem === 'metric' ? "70" : "154"}
                          min="0"
                          step="0.1"
                          data-testid="input-weight"
                        />
                      </div>
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

                    {/* Gender (Optional) */}
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
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-4 pt-6">
                    <Button
                      onClick={calculateBMI}
                      className="flex-1 h-14 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold text-lg rounded-xl shadow-lg transform transition-all duration-200 hover:scale-105"
                      data-testid="button-calculate"
                    >
                      Calculate BMI
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
                  <h2 className="text-2xl font-bold text-gray-900 mb-8">BMI Results</h2>
                  
                  {result ? (
                    <div className="space-y-6" data-testid="bmi-results">
                      {/* BMI Value Highlight */}
                      <div className="bg-white rounded-2xl p-6 shadow-lg border border-blue-100">
                        <div className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-2">Your BMI</div>
                        <div className={`text-4xl font-bold ${getBMIColor(result.bmi)}`} data-testid="text-bmi-value">
                          {result.bmi}
                        </div>
                      </div>

                      {/* BMI Category */}
                      <div className="bg-white rounded-xl p-4 shadow-sm">
                        <div className="flex justify-between items-center">
                          <span className="font-medium text-gray-700">Category</span>
                          <span className={`font-semibold ${getBMIColor(result.bmi)}`} data-testid="text-bmi-category">
                            {result.category}
                          </span>
                        </div>
                      </div>

                      {/* Healthy Weight Range */}
                      <div className="bg-green-50 rounded-xl p-4 border border-green-200">
                        <h3 className="font-semibold text-green-800 mb-2">Healthy Weight Range</h3>
                        <div className="text-sm text-green-700">
                          <span className="font-medium" data-testid="text-healthy-weight-range">
                            {formatWeight(result.healthyWeightMin)} - {formatWeight(result.healthyWeightMax)}
                          </span>
                        </div>
                      </div>

                      {/* Weight Recommendations */}
                      {(result.weightToLose || result.weightToGain) && (
                        <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                          <h3 className="font-semibold text-blue-800 mb-2">Recommendation</h3>
                          {result.weightToLose && (
                            <p className="text-sm text-blue-700" data-testid="text-weight-to-lose">
                              To reach a healthy weight, consider losing about{' '}
                              <span className="font-medium">{formatWeight(result.weightToLose)}</span>
                            </p>
                          )}
                          {result.weightToGain && (
                            <p className="text-sm text-blue-700" data-testid="text-weight-to-gain">
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
                    <div className="text-center py-16" data-testid="no-results">
                      <div className="w-20 h-20 bg-gray-200 rounded-full mx-auto mb-6 flex items-center justify-center">
                        <div className="text-3xl font-bold text-gray-400">BMI</div>
                      </div>
                      <p className="text-gray-500 text-lg">Enter your measurements and calculate to see BMI results</p>
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
                <h3 className="text-2xl font-bold text-gray-900 mb-6">What is BMI (Body Mass Index)?</h3>
                <div className="space-y-4 text-gray-600">
                  <p>
                    BMI (Body Mass Index) is a widely used health assessment tool that measures body fat based on height and weight. 
                    It's calculated by dividing a person's weight in kilograms by the square of their height in meters (kg/m²). 
                    This screening tool helps identify potential weight-related health risks and provides a standardized way to 
                    assess whether an individual falls within a healthy weight range.
                  </p>
                  <p>
                    Our free BMI calculator provides instant, accurate results with personalized recommendations. Whether you're 
                    monitoring your health, planning a fitness journey, or consulting with healthcare professionals, this tool 
                    offers valuable insights into your weight status and overall health indicators.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">How to Use Our BMI Calculator</h3>
                <div className="space-y-4 text-gray-600">
                  <p>
                    Our BMI calculator is designed for ease of use with both metric and imperial units. Simply enter your 
                    weight and height, optionally add your age and gender for context, then click "Calculate BMI" to get 
                    instant results including your BMI value, health category, and personalized weight recommendations.
                  </p>
                  <div className="bg-blue-50 rounded-lg p-4">
                    <h4 className="font-semibold text-blue-800 mb-2">BMI Formula</h4>
                    <p className="font-mono text-center text-lg text-blue-700">
                      BMI = Weight (kg) ÷ Height² (m²)
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">BMI Categories and Health Implications</h3>
                <div className="space-y-4">
                  <div className="flex items-center p-3 bg-blue-50 rounded-lg">
                    <div className="w-4 h-4 bg-blue-500 rounded-full mr-3"></div>
                    <div>
                      <div className="font-medium">Underweight (BMI &lt; 18.5)</div>
                      <div className="text-sm text-gray-600">May indicate malnutrition or underlying health issues</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center p-3 bg-green-50 rounded-lg">
                    <div className="w-4 h-4 bg-green-500 rounded-full mr-3"></div>
                    <div>
                      <div className="font-medium">Normal weight (BMI 18.5-24.9)</div>
                      <div className="text-sm text-gray-600">Associated with lowest health risks and optimal wellness</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center p-3 bg-orange-50 rounded-lg">
                    <div className="w-4 h-4 bg-orange-500 rounded-full mr-3"></div>
                    <div>
                      <div className="font-medium">Overweight (BMI 25-29.9)</div>
                      <div className="text-sm text-gray-600">Increased risk of cardiovascular and metabolic issues</div>
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
              </CardContent>
            </Card>

            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Benefits of BMI Monitoring</h3>
                <div className="space-y-3 text-gray-600">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Early identification of weight-related health risks</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Goal setting for weight management programs</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Progress tracking during fitness journeys</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Professional healthcare consultation preparation</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Understanding healthy weight ranges for your height</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Additional SEO Content Sections */}
          <div className="mt-12 space-y-8">
            {/* BMI Applications Section */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">BMI Calculator Applications</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-6">
                    <h4 className="text-lg font-semibold text-gray-900 mb-3">Fitness Planning</h4>
                    <p className="text-gray-600 text-sm">
                      Use BMI calculations to establish baseline fitness levels, set realistic weight goals, and track progress 
                      throughout your health journey. Perfect for personal trainers and fitness enthusiasts.
                    </p>
                  </div>
                  
                  <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg p-6">
                    <h4 className="text-lg font-semibold text-gray-900 mb-3">Medical Screening</h4>
                    <p className="text-gray-600 text-sm">
                      Healthcare providers use BMI as an initial screening tool for weight-related health risks. It helps 
                      identify patients who may benefit from nutritional counseling or weight management programs.
                    </p>
                  </div>
                  
                  <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-lg p-6">
                    <h4 className="text-lg font-semibold text-gray-900 mb-3">Research & Studies</h4>
                    <p className="text-gray-600 text-sm">
                      BMI data is crucial for population health studies, epidemiological research, and understanding 
                      obesity trends across different demographics and geographic regions.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* BMI vs Other Measurements */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">BMI vs Other Body Composition Measurements</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg">
                        <th className="text-left py-4 px-6 font-bold text-gray-900 rounded-l-lg">Measurement</th>
                        <th className="text-left py-4 px-6 font-bold text-gray-900">What It Measures</th>
                        <th className="text-left py-4 px-6 font-bold text-gray-900">Advantages</th>
                        <th className="text-left py-4 px-6 font-bold text-gray-900 rounded-r-lg">Limitations</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      <tr className="hover:bg-blue-50 transition-colors">
                        <td className="py-4 px-6 font-medium">BMI</td>
                        <td className="py-4 px-6 text-gray-600">Weight relative to height</td>
                        <td className="py-4 px-6 text-gray-600">Simple, standardized, widely accepted</td>
                        <td className="py-4 px-6 text-gray-600">Doesn't distinguish muscle from fat</td>
                      </tr>
                      <tr className="hover:bg-blue-50 transition-colors">
                        <td className="py-4 px-6 font-medium">Body Fat Percentage</td>
                        <td className="py-4 px-6 text-gray-600">Proportion of fat tissue</td>
                        <td className="py-4 px-6 text-gray-600">More accurate body composition</td>
                        <td className="py-4 px-6 text-gray-600">Requires specialized equipment</td>
                      </tr>
                      <tr className="hover:bg-blue-50 transition-colors">
                        <td className="py-4 px-6 font-medium">Waist Circumference</td>
                        <td className="py-4 px-6 text-gray-600">Abdominal fat distribution</td>
                        <td className="py-4 px-6 text-gray-600">Indicates visceral fat risks</td>
                        <td className="py-4 px-6 text-gray-600">Limited to abdominal area only</td>
                      </tr>
                      <tr className="hover:bg-blue-50 transition-colors">
                        <td className="py-4 px-6 font-medium">Waist-to-Hip Ratio</td>
                        <td className="py-4 px-6 text-gray-600">Fat distribution pattern</td>
                        <td className="py-4 px-6 text-gray-600">Shows health risk patterns</td>
                        <td className="py-4 px-6 text-gray-600">More complex to measure accurately</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* BMI Limitations and Considerations */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
                <CardContent className="p-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">BMI Limitations to Consider</h3>
                  <div className="space-y-4 text-gray-600">
                    <div className="border-l-4 border-red-400 pl-4 bg-red-50 p-3 rounded-r-lg">
                      <h4 className="font-semibold text-red-800 mb-2">Muscle Mass Impact</h4>
                      <p className="text-sm text-red-700">Athletes and bodybuilders may have high BMIs due to muscle mass, not excess fat.</p>
                    </div>
                    <div className="border-l-4 border-orange-400 pl-4 bg-orange-50 p-3 rounded-r-lg">
                      <h4 className="font-semibold text-orange-800 mb-2">Age Considerations</h4>
                      <p className="text-sm text-orange-700">BMI may be less accurate for elderly individuals due to changes in body composition.</p>
                    </div>
                    <div className="border-l-4 border-yellow-400 pl-4 bg-yellow-50 p-3 rounded-r-lg">
                      <h4 className="font-semibold text-yellow-800 mb-2">Ethnic Variations</h4>
                      <p className="text-sm text-yellow-700">Different ethnic groups may have varying health risks at the same BMI levels.</p>
                    </div>
                    <div className="border-l-4 border-blue-400 pl-4 bg-blue-50 p-3 rounded-r-lg">
                      <h4 className="font-semibold text-blue-800 mb-2">Pregnancy & Growth</h4>
                      <p className="text-sm text-blue-700">Standard BMI ranges don't apply to pregnant women or growing children and teens.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
                <CardContent className="p-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">Healthy Weight Management Tips</h3>
                  <div className="space-y-4 text-gray-600">
                    <div className="bg-green-50 rounded-lg p-4">
                      <h4 className="font-semibold text-green-800 mb-2">Balanced Nutrition</h4>
                      <p className="text-sm text-green-700">Focus on whole foods, proper portion sizes, and nutrient-dense meals for sustainable weight management.</p>
                    </div>
                    <div className="bg-blue-50 rounded-lg p-4">
                      <h4 className="font-semibold text-blue-800 mb-2">Regular Exercise</h4>
                      <p className="text-sm text-blue-700">Combine cardiovascular exercise with strength training for optimal body composition and health benefits.</p>
                    </div>
                    <div className="bg-purple-50 rounded-lg p-4">
                      <h4 className="font-semibold text-purple-800 mb-2">Lifestyle Factors</h4>
                      <p className="text-sm text-purple-700">Prioritize adequate sleep, stress management, and hydration as crucial components of weight management.</p>
                    </div>
                    <div className="bg-orange-50 rounded-lg p-4">
                      <h4 className="font-semibold text-orange-800 mb-2">Professional Guidance</h4>
                      <p className="text-sm text-orange-700">Consult healthcare providers or registered dietitians for personalized weight management strategies.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* FAQ Section */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-8">Frequently Asked Questions About BMI</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">How accurate is BMI for health assessment?</h4>
                      <p className="text-gray-600 text-sm">BMI is approximately 80% accurate for the general population as a health screening tool. It's most effective when used alongside other health indicators like waist circumference, blood pressure, and overall fitness level.</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">Does BMI differ between men and women?</h4>
                      <p className="text-gray-600 text-sm">The BMI calculation formula is identical for both sexes. However, women typically have higher body fat percentages than men at the same BMI level, which some healthcare providers consider during interpretation.</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">At what age should BMI monitoring begin?</h4>
                      <p className="text-gray-600 text-sm">For adults (18+), regular BMI monitoring can begin as part of routine health assessments. Children and teens require age and gender-specific BMI percentiles rather than adult categories.</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">How often should I calculate my BMI?</h4>
                      <p className="text-gray-600 text-sm">Monthly BMI calculations are sufficient for general health monitoring. During active weight management programs, weekly measurements can help track progress while accounting for normal weight fluctuations.</p>
                    </div>
                  </div>
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">What's considered a healthy BMI range?</h4>
                      <p className="text-gray-600 text-sm">For most adults, a BMI between 18.5 and 24.9 is considered healthy. However, optimal BMI can vary based on individual factors like muscle mass, bone density, age, and ethnicity.</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">Can I have a healthy lifestyle with a high BMI?</h4>
                      <p className="text-gray-600 text-sm">Yes, some individuals with higher BMIs can be metabolically healthy, especially if they exercise regularly, eat well, and have good cardiovascular markers. BMI is just one health indicator among many.</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">Should athletes rely on BMI calculations?</h4>
                      <p className="text-gray-600 text-sm">Athletes, especially those in strength sports, may find BMI less accurate due to higher muscle mass. Body fat percentage and performance metrics are often more relevant for athletic populations.</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">How does BMI relate to life expectancy?</h4>
                      <p className="text-gray-600 text-sm">Research shows that BMIs in the normal range (18.5-24.9) are associated with lower mortality risks. However, factors like fitness level, diet quality, and genetics also significantly impact longevity.</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* BMI History and Development */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Understanding BMI: History and Development</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="space-y-4 text-gray-600">
                    <h4 className="text-lg font-semibold text-gray-900">Origins of BMI</h4>
                    <p className="text-sm">
                      The Body Mass Index was developed by Belgian mathematician Adolphe Quetelet in the 1830s, originally 
                      called the "Quetelet Index." It was designed as a statistical tool to study population-level obesity 
                      trends rather than individual health assessment.
                    </p>
                    <p className="text-sm">
                      The modern BMI gained widespread acceptance in the 1970s when researcher Ancel Keys validated its 
                      effectiveness as a simple screening tool for weight-related health risks in large populations.
                    </p>
                    <h4 className="text-lg font-semibold text-gray-900">Global Adoption</h4>
                    <p className="text-sm">
                      The World Health Organization (WHO) adopted BMI as the standard for recording obesity statistics 
                      worldwide in the 1990s, establishing the categories we use today for international health comparisons.
                    </p>
                  </div>
                  <div className="space-y-4 text-gray-600">
                    <h4 className="text-lg font-semibold text-gray-900">Modern Applications</h4>
                    <p className="text-sm">
                      Today, BMI serves multiple purposes beyond individual health assessment. Insurance companies use it 
                      for risk assessment, public health officials track population health trends, and researchers study 
                      obesity patterns across demographics.
                    </p>
                    <h4 className="text-lg font-semibold text-gray-900">Future Developments</h4>
                    <p className="text-sm">
                      Scientists continue refining BMI applications, developing adjusted calculations for different ethnic 
                      groups and creating complementary tools like waist-to-height ratios and body adiposity indexes for 
                      more comprehensive health assessment.
                    </p>
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 mt-6">
                      <h4 className="font-semibold text-blue-800 mb-2">Did You Know?</h4>
                      <p className="text-sm text-blue-700">
                        BMI calculations remain consistent worldwide, making it possible to compare health data across 
                        different countries and healthcare systems, supporting global health research and policy development.
                      </p>
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
};

export default BMICalculator;
