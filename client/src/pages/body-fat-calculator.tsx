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

interface BodyFatResult {
  bodyFatPercentage: number;
  classification: string;
  leanBodyMass: number;
  fatMass: number;
  method: string;
}

const BodyFatCalculator = () => {
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [feet, setFeet] = useState('');
  const [inches, setInches] = useState('');
  const [neck, setNeck] = useState('');
  const [waist, setWaist] = useState('');
  const [hip, setHip] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [unitSystem, setUnitSystem] = useState('metric');
  const [result, setResult] = useState<BodyFatResult | null>(null);

  const calculateBodyFat = () => {
    let weightKg: number;
    let heightCm: number;
    let neckCm: number;
    let waistCm: number;
    let hipCm: number;

    if (unitSystem === 'metric') {
      weightKg = parseFloat(weight);
      heightCm = parseFloat(height);
      neckCm = parseFloat(neck);
      waistCm = parseFloat(waist);
      hipCm = parseFloat(hip);
    } else {
      // Imperial system
      weightKg = parseFloat(weight) * 0.453592; // Convert lbs to kg
      const totalInches = (parseFloat(feet) * 12) + parseFloat(inches);
      heightCm = totalInches * 2.54; // Convert inches to cm
      neckCm = parseFloat(neck) * 2.54; // Convert inches to cm
      waistCm = parseFloat(waist) * 2.54; // Convert inches to cm
      hipCm = parseFloat(hip) * 2.54; // Convert inches to cm
    }

    if (weightKg && heightCm && neckCm && waistCm && gender) {
      let bodyFatPercentage: number;
      
      // US Navy Method
      if (gender === 'male') {
        // Male formula: 495 / (1.0324 - 0.19077 * log10(waist - neck) + 0.15456 * log10(height)) - 450
        const log10WaistNeck = Math.log10(waistCm - neckCm);
        const log10Height = Math.log10(heightCm);
        bodyFatPercentage = 495 / (1.0324 - 0.19077 * log10WaistNeck + 0.15456 * log10Height) - 450;
      } else {
        // Female formula requires hip measurement
        if (!hipCm) {
          return; // Hip measurement is required for females
        }
        // Female formula: 495 / (1.29579 - 0.35004 * log10(waist + hip - neck) + 0.22100 * log10(height)) - 450
        const log10WaistHipNeck = Math.log10(waistCm + hipCm - neckCm);
        const log10Height = Math.log10(heightCm);
        bodyFatPercentage = 495 / (1.29579 - 0.35004 * log10WaistHipNeck + 0.22100 * log10Height) - 450;
      }

      // Ensure the result is within reasonable bounds
      bodyFatPercentage = Math.max(3, Math.min(50, bodyFatPercentage));

      // Classification based on gender and age
      const getClassification = (bf: number, gender: string, age: number) => {
        const ageNum = age || 30; // Default age if not provided
        
        if (gender === 'male') {
          if (ageNum <= 30) {
            if (bf < 8) return 'Essential Fat';
            if (bf < 14) return 'Athletes';
            if (bf < 18) return 'Fitness';
            if (bf < 25) return 'Average';
            return 'Obese';
          } else if (ageNum <= 50) {
            if (bf < 8) return 'Essential Fat';
            if (bf < 17) return 'Athletes';
            if (bf < 21) return 'Fitness';
            if (bf < 28) return 'Average';
            return 'Obese';
          } else {
            if (bf < 8) return 'Essential Fat';
            if (bf < 19) return 'Athletes';
            if (bf < 23) return 'Fitness';
            if (bf < 30) return 'Average';
            return 'Obese';
          }
        } else {
          if (ageNum <= 30) {
            if (bf < 14) return 'Essential Fat';
            if (bf < 21) return 'Athletes';
            if (bf < 25) return 'Fitness';
            if (bf < 32) return 'Average';
            return 'Obese';
          } else if (ageNum <= 50) {
            if (bf < 14) return 'Essential Fat';
            if (bf < 24) return 'Athletes';
            if (bf < 28) return 'Fitness';
            if (bf < 35) return 'Average';
            return 'Obese';
          } else {
            if (bf < 14) return 'Essential Fat';
            if (bf < 26) return 'Athletes';
            if (bf < 30) return 'Fitness';
            if (bf < 37) return 'Average';
            return 'Obese';
          }
        }
      };

      const classification = getClassification(bodyFatPercentage, gender, parseFloat(age));
      const fatMass = (bodyFatPercentage / 100) * weightKg;
      const leanBodyMass = weightKg - fatMass;

      setResult({
        bodyFatPercentage: Math.round(bodyFatPercentage * 10) / 10,
        classification,
        leanBodyMass: Math.round(leanBodyMass * 10) / 10,
        fatMass: Math.round(fatMass * 10) / 10,
        method: 'US Navy Method'
      });
    }
  };

  const resetCalculator = () => {
    setWeight('');
    setHeight('');
    setFeet('');
    setInches('');
    setNeck('');
    setWaist('');
    setHip('');
    setAge('');
    setGender('');
    setUnitSystem('metric');
    setResult(null);
  };

  const getClassificationColor = (classification: string) => {
    switch (classification) {
      case 'Essential Fat':
        return 'text-blue-600';
      case 'Athletes':
        return 'text-green-600';
      case 'Fitness':
        return 'text-emerald-600';
      case 'Average':
        return 'text-yellow-600';
      case 'Obese':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const formatMeasurement = (value: number, unit: string) => {
    if (unitSystem === 'metric') {
      return unit === 'weight' ? `${value} kg` : `${value} cm`;
    } else {
      return unit === 'weight' ? `${(value * 2.20462).toFixed(1)} lbs` : `${(value / 2.54).toFixed(1)} in`;
    }
  };

  return (
    <>
      <Helmet>
        <title>Body Fat Calculator - Free US Navy Method | Calculate Body Fat Percentage</title>
        <meta name="description" content="Free body fat calculator using the US Navy method. Calculate your body fat percentage, lean body mass, and body composition with accurate circumference measurements. Get instant results with metric and imperial units." />
        <meta name="keywords" content="body fat calculator, body fat percentage calculator, US Navy body fat method, body composition calculator, lean body mass calculator, circumference body fat, fat percentage formula, body fat measurement, fitness calculator, weight loss calculator, muscle mass calculator, health assessment tool" />
        <meta property="og:title" content="Body Fat Calculator - Free US Navy Method | Calculate Body Fat Percentage" />
        <meta property="og:description" content="Calculate your body fat percentage using the proven US Navy method. Free, accurate body composition analysis with worldwide unit support." />
        <meta property="og:type" content="website" />
        <link rel="canonical" href="/tools/body-fat-calculator" />
        <meta name="robots" content="index, follow" />
        <meta name="author" content="DapsiWow" />
      </Helmet>

      <div className="min-h-screen flex flex-col" data-testid="page-body-fat-calculator">
        <Header />
        
        <main className="flex-1 bg-neutral-50">
          {/* Hero Section */}
          <section className="text-white py-16" style={{ background: 'linear-gradient(135deg, #f43f5e 0%, #e11d48 100%)' }}>
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <div className="w-20 h-20 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <i className="fas fa-percentage text-3xl"></i>
              </div>
              <h1 className="text-4xl sm:text-5xl font-bold mb-6" data-testid="text-page-title">
                Body Fat Calculator
              </h1>
              <p className="text-xl text-red-100 max-w-2xl mx-auto">
                Calculate your body fat percentage and body composition using the proven US Navy method with worldwide unit support
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
                            <Label htmlFor="imperial">Imperial (lbs, in)</Label>
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

                      {/* Age */}
                      <div className="space-y-3">
                        <Label htmlFor="age" className="text-sm font-medium text-gray-700">
                          Age (years) <span className="text-gray-400 font-normal">- Optional for classification</span>
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

                      {/* Neck */}
                      <div className="space-y-3">
                        <Label htmlFor="neck" className="text-sm font-medium text-gray-700">
                          Neck Circumference {unitSystem === 'metric' ? '(cm)' : '(inches)'} *
                        </Label>
                        <Input
                          id="neck"
                          type="number"
                          value={neck}
                          onChange={(e) => setNeck(e.target.value)}
                          className="h-12 text-base border-gray-200 rounded-lg"
                          placeholder={unitSystem === 'metric' ? "38" : "15"}
                          min="0"
                          step="0.1"
                          data-testid="input-neck"
                        />
                        <p className="text-xs text-gray-500">Measure around the neck, just below the Adam's apple</p>
                      </div>

                      {/* Waist */}
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
                          placeholder={unitSystem === 'metric' ? "85" : "33.5"}
                          min="0"
                          step="0.1"
                          data-testid="input-waist"
                        />
                        <p className="text-xs text-gray-500">
                          {gender === 'male' 
                            ? 'Measure at the navel (belly button)' 
                            : 'Measure at the narrowest point, usually just above the navel'
                          }
                        </p>
                      </div>

                      {/* Hip (for females only) */}
                      {gender === 'female' && (
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
                            placeholder={unitSystem === 'metric' ? "95" : "37.4"}
                            min="0"
                            step="0.1"
                            data-testid="input-hip"
                          />
                          <p className="text-xs text-gray-500">Measure at the widest point of the hips</p>
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="flex gap-4 pt-6">
                        <Button
                          onClick={calculateBodyFat}
                          className="flex-1 h-12 text-white font-medium rounded-lg"
                          style={{ backgroundColor: '#f43f5e' }}
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#e11d48'}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#f43f5e'}
                          data-testid="button-calculate"
                        >
                          <Calculator className="w-4 h-4 mr-2" />
                          Calculate Body Fat
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
                      <h2 className="text-2xl font-semibold text-gray-900 mb-8">Body Fat Results</h2>
                      
                      {result ? (
                        <div className="space-y-4" data-testid="body-fat-results">
                          {/* Body Fat Percentage */}
                          <div className="bg-white rounded-lg p-4 border-l-4 border-rose-500">
                            <div className="flex justify-between items-center">
                              <span className="font-semibold text-gray-700">Body Fat Percentage</span>
                              <span className="text-2xl font-bold text-rose-600" data-testid="text-body-fat">
                                {result.bodyFatPercentage}%
                              </span>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">Calculated using {result.method}</p>
                          </div>

                          {/* Classification */}
                          <div className="bg-white rounded-lg p-4">
                            <div className="flex justify-between items-center">
                              <span className="text-gray-600">Classification</span>
                              <span className={`font-semibold ${getClassificationColor(result.classification)}`} data-testid="text-classification">
                                {result.classification}
                              </span>
                            </div>
                          </div>

                          {/* Body Composition */}
                          <div className="bg-white rounded-lg p-4">
                            <h3 className="font-semibold text-gray-900 mb-3">Body Composition</h3>
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span className="text-gray-600">Lean Body Mass</span>
                                <span className="font-medium" data-testid="text-lean-mass">
                                  {formatMeasurement(result.leanBodyMass, 'weight')}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Fat Mass</span>
                                <span className="font-medium" data-testid="text-fat-mass">
                                  {formatMeasurement(result.fatMass, 'weight')}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Healthy Ranges */}
                          <div className="bg-blue-50 rounded-lg p-4">
                            <h3 className="font-semibold text-gray-900 mb-3">Healthy Body Fat Ranges</h3>
                            <div className="space-y-2 text-sm">
                              {gender === 'male' ? (
                                <>
                                  <div className="flex justify-between">
                                    <span className="text-gray-600">Athletes</span>
                                    <span className="text-green-600 font-medium">6-13%</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-gray-600">Fitness</span>
                                    <span className="text-green-600 font-medium">14-17%</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-gray-600">Average</span>
                                    <span className="text-yellow-600 font-medium">18-24%</span>
                                  </div>
                                </>
                              ) : (
                                <>
                                  <div className="flex justify-between">
                                    <span className="text-gray-600">Athletes</span>
                                    <span className="text-green-600 font-medium">16-20%</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-gray-600">Fitness</span>
                                    <span className="text-green-600 font-medium">21-24%</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-gray-600">Average</span>
                                    <span className="text-yellow-600 font-medium">25-31%</span>
                                  </div>
                                </>
                              )}
                            </div>
                          </div>

                          {/* Tips */}
                          <div className="bg-green-50 rounded-lg p-4">
                            <h3 className="font-semibold text-gray-900 mb-2">Measurement Tips</h3>
                            <ul className="text-sm text-gray-600 space-y-1">
                              <li>• Measure in the morning before eating</li>
                              <li>• Use a flexible measuring tape</li>
                              <li>• Keep the tape level and snug but not tight</li>
                              <li>• Take measurements 2-3 times for accuracy</li>
                            </ul>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-8" data-testid="no-results">
                          <i className="fas fa-percentage text-4xl text-gray-400 mb-4"></i>
                          <p className="text-gray-500">Enter your measurements to calculate body fat percentage</p>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Educational Content */}
              <div className="mt-12 space-y-8">
                {/* Understanding Body Fat */}
                <div className="bg-white rounded-2xl shadow-lg p-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-8">Understanding Body Fat Percentage Calculator</h2>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-4">What is Body Fat Percentage?</h3>
                      <p className="text-gray-600 mb-6 leading-relaxed">
                        Body fat percentage is the proportion of your total body weight that consists of fat tissue compared to lean mass (muscle, bone, organs, and water). Unlike BMI calculators that only consider height and weight, a body fat calculator provides a more accurate assessment of your body composition and overall health status.
                      </p>
                      
                      <h3 className="text-xl font-semibold text-gray-900 mb-4">US Navy Body Fat Formula</h3>
                      <p className="text-gray-600 mb-4 leading-relaxed">
                        Our body fat percentage calculator uses the scientifically validated US Navy method, which calculates body fat using circumference measurements. This body fat formula is widely trusted by fitness professionals, military personnel, and health experts because it's non-invasive, cost-effective, and provides reliable results for body composition analysis.
                      </p>
                      <div className="bg-rose-50 rounded-lg p-4">
                        <p className="text-rose-800 text-sm">
                          <strong>Accuracy:</strong> ±3-4% margin of error when measurements are taken correctly. 
                          Results may vary based on individual body type, muscle mass, and measurement technique.
                        </p>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-4">Why Use a Body Fat Calculator?</h3>
                      <div className="space-y-3">
                        <div className="flex items-start p-3 bg-green-50 rounded-lg">
                          <i className="fas fa-heart text-green-600 mt-1 mr-3"></i>
                          <div>
                            <div className="font-medium">Health Risk Assessment</div>
                            <div className="text-sm text-gray-600">More accurate indicator of cardiovascular disease and diabetes risk than weight or BMI alone</div>
                          </div>
                        </div>
                        
                        <div className="flex items-start p-3 bg-blue-50 rounded-lg">
                          <i className="fas fa-dumbbell text-blue-600 mt-1 mr-3"></i>
                          <div>
                            <div className="font-medium">Fitness Progress Tracking</div>
                            <div className="text-sm text-gray-600">Monitor muscle gain and fat loss during weight training and cardio programs</div>
                          </div>
                        </div>
                        
                        <div className="flex items-start p-3 bg-purple-50 rounded-lg">
                          <i className="fas fa-bullseye text-purple-600 mt-1 mr-3"></i>
                          <div>
                            <div className="font-medium">Goal Setting & Planning</div>
                            <div className="text-sm text-gray-600">Set realistic body composition targets for weight loss, muscle building, or athletic performance</div>
                          </div>
                        </div>
                        
                        <div className="flex items-start p-3 bg-orange-50 rounded-lg">
                          <i className="fas fa-chart-line text-orange-600 mt-1 mr-3"></i>
                          <div>
                            <div className="font-medium">Athletic Performance</div>
                            <div className="text-sm text-gray-600">Optimize body composition for sports performance, endurance, and recovery</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Body Fat Calculator Usage and Applications */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Body Fat Calculator Use Cases</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-4">Who Should Use This Calculator?</h3>
                      <div className="space-y-3">
                        <div className="flex items-center p-3 bg-white rounded-lg shadow-sm">
                          <i className="fas fa-user-md text-blue-600 mr-3"></i>
                          <span className="text-gray-700">Fitness enthusiasts tracking body composition changes</span>
                        </div>
                        <div className="flex items-center p-3 bg-white rounded-lg shadow-sm">
                          <i className="fas fa-running text-green-600 mr-3"></i>
                          <span className="text-gray-700">Athletes optimizing performance and weight categories</span>
                        </div>
                        <div className="flex items-center p-3 bg-white rounded-lg shadow-sm">
                          <i className="fas fa-weight text-purple-600 mr-3"></i>
                          <span className="text-gray-700">Individuals on weight loss or muscle building programs</span>
                        </div>
                        <div className="flex items-center p-3 bg-white rounded-lg shadow-sm">
                          <i className="fas fa-stethoscope text-red-600 mr-3"></i>
                          <span className="text-gray-700">Health-conscious individuals monitoring wellness metrics</span>
                        </div>
                        <div className="flex items-center p-3 bg-white rounded-lg shadow-sm">
                          <i className="fas fa-shield-alt text-orange-600 mr-3"></i>
                          <span className="text-gray-700">Military and law enforcement personnel meeting standards</span>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-4">When to Measure Body Fat</h3>
                      <div className="space-y-4">
                        <div className="bg-white rounded-lg p-4 shadow-sm">
                          <h4 className="font-semibold text-gray-900 mb-2">Starting a Fitness Program</h4>
                          <p className="text-gray-600 text-sm">Establish baseline measurements before beginning any diet or exercise regimen</p>
                        </div>
                        <div className="bg-white rounded-lg p-4 shadow-sm">
                          <h4 className="font-semibold text-gray-900 mb-2">Monthly Progress Checks</h4>
                          <p className="text-gray-600 text-sm">Track changes in body composition during training cycles</p>
                        </div>
                        <div className="bg-white rounded-lg p-4 shadow-sm">
                          <h4 className="font-semibold text-gray-900 mb-2">Health Assessments</h4>
                          <p className="text-gray-600 text-sm">Include in regular health checkups and wellness evaluations</p>
                        </div>
                        <div className="bg-white rounded-lg p-4 shadow-sm">
                          <h4 className="font-semibold text-gray-900 mb-2">Competition Preparation</h4>
                          <p className="text-gray-600 text-sm">Monitor body fat levels for bodybuilding, wrestling, or other weight-class sports</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Body Fat Measurement Methods Comparison */}
                <div className="bg-white rounded-2xl shadow-lg p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Body Fat Measurement Methods Comparison</h2>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="border-b-2 border-gray-200">
                          <th className="text-left py-3 px-4 font-semibold text-gray-900">Method</th>
                          <th className="text-left py-3 px-4 font-semibold text-gray-900">Accuracy</th>
                          <th className="text-left py-3 px-4 font-semibold text-gray-900">Cost</th>
                          <th className="text-left py-3 px-4 font-semibold text-gray-900">Convenience</th>
                          <th className="text-left py-3 px-4 font-semibold text-gray-900">Equipment Needed</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        <tr className="bg-rose-50">
                          <td className="py-3 px-4 font-medium">US Navy Method (Our Calculator)</td>
                          <td className="py-3 px-4 text-gray-600">±3-4%</td>
                          <td className="py-3 px-4 text-green-600">Free</td>
                          <td className="py-3 px-4 text-green-600">High</td>
                          <td className="py-3 px-4 text-gray-600">Measuring tape only</td>
                        </tr>
                        <tr>
                          <td className="py-3 px-4 font-medium">DEXA Scan</td>
                          <td className="py-3 px-4 text-green-600">±1-2%</td>
                          <td className="py-3 px-4 text-red-600">$100-300</td>
                          <td className="py-3 px-4 text-yellow-600">Medium</td>
                          <td className="py-3 px-4 text-gray-600">Medical facility</td>
                        </tr>
                        <tr>
                          <td className="py-3 px-4 font-medium">Bioelectrical Impedance</td>
                          <td className="py-3 px-4 text-yellow-600">±4-6%</td>
                          <td className="py-3 px-4 text-yellow-600">$50-200</td>
                          <td className="py-3 px-4 text-green-600">High</td>
                          <td className="py-3 px-4 text-gray-600">BIA scale or device</td>
                        </tr>
                        <tr>
                          <td className="py-3 px-4 font-medium">Skinfold Calipers</td>
                          <td className="py-3 px-4 text-yellow-600">±3-5%</td>
                          <td className="py-3 px-4 text-green-600">$10-50</td>
                          <td className="py-3 px-4 text-yellow-600">Medium</td>
                          <td className="py-3 px-4 text-gray-600">Calipers + training</td>
                        </tr>
                        <tr>
                          <td className="py-3 px-4 font-medium">Hydrostatic Weighing</td>
                          <td className="py-3 px-4 text-green-600">±1-3%</td>
                          <td className="py-3 px-4 text-red-600">$75-150</td>
                          <td className="py-3 px-4 text-red-600">Low</td>
                          <td className="py-3 px-4 text-gray-600">Specialized tank</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* How to Get Accurate Measurements */}
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">How to Get Accurate Body Fat Calculator Results</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-4">Measurement Tips</h3>
                      <div className="space-y-3">
                        <div className="flex items-start p-3 bg-white rounded-lg shadow-sm">
                          <i className="fas fa-clock text-blue-600 mt-1 mr-3"></i>
                          <div>
                            <div className="font-medium">Best Time to Measure</div>
                            <div className="text-sm text-gray-600">Early morning, before eating or drinking, after using the bathroom</div>
                          </div>
                        </div>
                        <div className="flex items-start p-3 bg-white rounded-lg shadow-sm">
                          <i className="fas fa-ruler text-green-600 mt-1 mr-3"></i>
                          <div>
                            <div className="font-medium">Measuring Technique</div>
                            <div className="text-sm text-gray-600">Use a flexible measuring tape, keep it level and snug but not tight</div>
                          </div>
                        </div>
                        <div className="flex items-start p-3 bg-white rounded-lg shadow-sm">
                          <i className="fas fa-redo text-purple-600 mt-1 mr-3"></i>
                          <div>
                            <div className="font-medium">Multiple Measurements</div>
                            <div className="text-sm text-gray-600">Take 2-3 measurements of each area and use the average</div>
                          </div>
                        </div>
                        <div className="flex items-start p-3 bg-white rounded-lg shadow-sm">
                          <i className="fas fa-users text-orange-600 mt-1 mr-3"></i>
                          <div>
                            <div className="font-medium">Get Help</div>
                            <div className="text-sm text-gray-600">Have someone assist with measurements for better accuracy</div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-4">Measurement Locations</h3>
                      <div className="space-y-4">
                        <div className="bg-white rounded-lg p-4 shadow-sm">
                          <h4 className="font-semibold text-gray-900 mb-2">Neck Circumference</h4>
                          <p className="text-gray-600 text-sm">Measure just below the larynx (Adam's apple), keeping the tape horizontal</p>
                        </div>
                        <div className="bg-white rounded-lg p-4 shadow-sm">
                          <h4 className="font-semibold text-gray-900 mb-2">Waist Circumference (Men)</h4>
                          <p className="text-gray-600 text-sm">Measure horizontally at the navel (belly button) level</p>
                        </div>
                        <div className="bg-white rounded-lg p-4 shadow-sm">
                          <h4 className="font-semibold text-gray-900 mb-2">Waist Circumference (Women)</h4>
                          <p className="text-gray-600 text-sm">Measure at the narrowest point, typically just above the navel</p>
                        </div>
                        <div className="bg-white rounded-lg p-4 shadow-sm">
                          <h4 className="font-semibold text-gray-900 mb-2">Hip Circumference (Women Only)</h4>
                          <p className="text-gray-600 text-sm">Measure at the widest point of the hips and buttocks</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Improving Body Composition */}
                <div className="bg-gradient-to-r from-rose-50 to-pink-50 rounded-2xl p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">How to Improve Your Body Composition</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="bg-white rounded-lg p-6 shadow-sm">
                      <i className="fas fa-dumbbell text-2xl text-red-600 mb-4"></i>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Resistance Training</h3>
                      <p className="text-gray-600 text-sm">
                        Build lean muscle mass through progressive strength training. Muscle tissue increases metabolic rate and improves body composition by reducing body fat percentage.
                      </p>
                    </div>
                    
                    <div className="bg-white rounded-lg p-6 shadow-sm">
                      <i className="fas fa-running text-2xl text-blue-600 mb-4"></i>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Cardiovascular Exercise</h3>
                      <p className="text-gray-600 text-sm">
                        Combine steady-state cardio and high-intensity interval training (HIIT) to burn calories, reduce body fat, and improve cardiovascular health and endurance.
                      </p>
                    </div>
                    
                    <div className="bg-white rounded-lg p-6 shadow-sm">
                      <i className="fas fa-apple-alt text-2xl text-green-600 mb-4"></i>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Nutrition Optimization</h3>
                      <p className="text-gray-600 text-sm">
                        Follow a balanced diet with adequate protein (0.8-1.2g per lb body weight) to support muscle growth and recovery while maintaining a moderate calorie deficit for fat loss.
                      </p>
                    </div>
                    
                    <div className="bg-white rounded-lg p-6 shadow-sm">
                      <i className="fas fa-bed text-2xl text-purple-600 mb-4"></i>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Quality Sleep</h3>
                      <p className="text-gray-600 text-sm">
                        Prioritize 7-9 hours of quality sleep to optimize hormone production (growth hormone, testosterone, cortisol) which directly affects body composition and recovery.
                      </p>
                    </div>
                    
                    <div className="bg-white rounded-lg p-6 shadow-sm">
                      <i className="fas fa-leaf text-2xl text-teal-600 mb-4"></i>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Stress Management</h3>
                      <p className="text-gray-600 text-sm">
                        Practice stress reduction through meditation, yoga, or relaxation techniques to prevent elevated cortisol levels that can lead to increased abdominal fat storage.
                      </p>
                    </div>
                    
                    <div className="bg-white rounded-lg p-6 shadow-sm">
                      <i className="fas fa-clock text-2xl text-orange-600 mb-4"></i>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Consistency & Patience</h3>
                      <p className="text-gray-600 text-sm">
                        Stay consistent with your exercise and nutrition plan. Meaningful body composition changes typically require 8-12 weeks of dedicated effort to become visible.
                      </p>
                    </div>
                  </div>
                </div>

                {/* FAQ Section */}
                <div className="bg-white rounded-2xl shadow-lg p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Frequently Asked Questions About Body Fat Calculators</h2>
                  <div className="space-y-6">
                    <div className="border-b border-gray-200 pb-4">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">How accurate is the US Navy body fat calculator?</h3>
                      <p className="text-gray-600">The US Navy method has an accuracy of ±3-4% when measurements are taken correctly. While not as precise as DEXA scans, it's significantly more accessible and cost-effective for regular monitoring.</p>
                    </div>
                    <div className="border-b border-gray-200 pb-4">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">How often should I calculate my body fat percentage?</h3>
                      <p className="text-gray-600">For fitness tracking, measure monthly. Body fat changes occur gradually, so more frequent measurements may not show meaningful differences and could lead to unnecessary frustration.</p>
                    </div>
                    <div className="border-b border-gray-200 pb-4">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">What's a healthy body fat percentage range?</h3>
                      <p className="text-gray-600">For men: 10-20% is considered healthy, with athletes typically at 6-13%. For women: 16-24% is healthy, with athletes at 14-20%. These ranges vary by age and individual factors.</p>
                    </div>
                    <div className="border-b border-gray-200 pb-4">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Can I use this calculator if I'm very muscular or have unusual body composition?</h3>
                      <p className="text-gray-600">The US Navy method may be less accurate for very muscular individuals or those with atypical body fat distribution. Consider professional assessment methods like DEXA scans for more precise measurements.</p>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Is body fat percentage more important than BMI?</h3>
                      <p className="text-gray-600">Body fat percentage provides better insight into health and fitness than BMI alone, as it distinguishes between muscle and fat mass. However, both metrics together give a more complete picture of overall health.</p>
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

export default BodyFatCalculator;