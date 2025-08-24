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

interface LifeExpectancyResult {
  currentLifeExpectancy: number;
  adjustedLifeExpectancy: number;
  yearsGained: number;
  yearsLost: number;
  healthScore: number;
  recommendations: string[];
  riskFactors: string[];
  positiveFactors: string[];
}

const LifeExpectancyCalculator = () => {
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [feet, setFeet] = useState('');
  const [inches, setInches] = useState('');
  const [unitSystem, setUnitSystem] = useState('metric');
  const [smokingStatus, setSmokingStatus] = useState('');
  const [alcoholConsumption, setAlcoholConsumption] = useState('');
  const [exerciseFrequency, setExerciseFrequency] = useState('');
  const [dietQuality, setDietQuality] = useState('');
  const [sleepHours, setSleepHours] = useState('');
  const [stressLevel, setStressLevel] = useState('');
  const [maritalStatus, setMaritalStatus] = useState('');
  const [result, setResult] = useState<LifeExpectancyResult | null>(null);

  const calculateLifeExpectancy = () => {
    const currentAge = parseInt(age);
    if (!currentAge || !gender) return;

    // Base life expectancy by gender (global average)
    let baseLifeExpectancy = gender === 'male' ? 72.6 : 77.8;

    let adjustments = 0;
    const riskFactors: string[] = [];
    const positiveFactors: string[] = [];

    // BMI calculation and adjustment
    if (height && weight) {
      let weightKg: number;
      let heightM: number;

      if (unitSystem === 'metric') {
        weightKg = parseFloat(weight);
        heightM = parseFloat(height) / 100;
      } else {
        weightKg = parseFloat(weight) * 0.453592;
        const totalInches = (parseFloat(feet) * 12) + parseFloat(inches);
        heightM = totalInches * 0.0254;
      }

      const bmi = weightKg / (heightM * heightM);
      
      if (bmi < 18.5) {
        adjustments -= 2;
        riskFactors.push('Underweight (BMI < 18.5)');
      } else if (bmi >= 18.5 && bmi < 25) {
        adjustments += 2;
        positiveFactors.push('Healthy weight (BMI 18.5-24.9)');
      } else if (bmi >= 25 && bmi < 30) {
        adjustments -= 1;
        riskFactors.push('Overweight (BMI 25-29.9)');
      } else {
        adjustments -= 4;
        riskFactors.push('Obese (BMI ≥ 30)');
      }
    }

    // Smoking adjustments
    if (smokingStatus === 'never') {
      adjustments += 3;
      positiveFactors.push('Never smoked');
    } else if (smokingStatus === 'former') {
      adjustments += 1;
      positiveFactors.push('Former smoker');
    } else if (smokingStatus === 'light') {
      adjustments -= 5;
      riskFactors.push('Light smoking (1-10 cigarettes/day)');
    } else if (smokingStatus === 'moderate') {
      adjustments -= 8;
      riskFactors.push('Moderate smoking (11-20 cigarettes/day)');
    } else if (smokingStatus === 'heavy') {
      adjustments -= 12;
      riskFactors.push('Heavy smoking (>20 cigarettes/day)');
    }

    // Alcohol adjustments
    if (alcoholConsumption === 'none') {
      adjustments += 1;
      positiveFactors.push('No alcohol consumption');
    } else if (alcoholConsumption === 'light') {
      adjustments += 2;
      positiveFactors.push('Light alcohol consumption');
    } else if (alcoholConsumption === 'moderate') {
      adjustments += 0;
    } else if (alcoholConsumption === 'heavy') {
      adjustments -= 4;
      riskFactors.push('Heavy alcohol consumption');
    }

    // Exercise adjustments
    if (exerciseFrequency === 'daily') {
      adjustments += 4;
      positiveFactors.push('Daily exercise');
    } else if (exerciseFrequency === 'regular') {
      adjustments += 3;
      positiveFactors.push('Regular exercise (3-5 times/week)');
    } else if (exerciseFrequency === 'occasional') {
      adjustments += 1;
      positiveFactors.push('Occasional exercise');
    } else if (exerciseFrequency === 'none') {
      adjustments -= 3;
      riskFactors.push('Sedentary lifestyle');
    }

    // Diet quality adjustments
    if (dietQuality === 'excellent') {
      adjustments += 3;
      positiveFactors.push('Excellent diet quality');
    } else if (dietQuality === 'good') {
      adjustments += 2;
      positiveFactors.push('Good diet quality');
    } else if (dietQuality === 'average') {
      adjustments += 0;
    } else if (dietQuality === 'poor') {
      adjustments -= 2;
      riskFactors.push('Poor diet quality');
    }

    // Sleep adjustments
    if (sleepHours) {
      const hours = parseInt(sleepHours);
      if (hours >= 7 && hours <= 9) {
        adjustments += 2;
        positiveFactors.push('Adequate sleep (7-9 hours)');
      } else if (hours < 6 || hours > 10) {
        adjustments -= 2;
        riskFactors.push('Poor sleep duration');
      }
    }

    // Stress level adjustments
    if (stressLevel === 'low') {
      adjustments += 2;
      positiveFactors.push('Low stress levels');
    } else if (stressLevel === 'moderate') {
      adjustments += 0;
    } else if (stressLevel === 'high') {
      adjustments -= 3;
      riskFactors.push('High stress levels');
    }

    // Marital status adjustments
    if (maritalStatus === 'married') {
      adjustments += 1.5;
      positiveFactors.push('Married (social support)');
    } else if (maritalStatus === 'partnered') {
      adjustments += 1;
      positiveFactors.push('In relationship (social support)');
    }

    const adjustedLifeExpectancy = Math.max(baseLifeExpectancy + adjustments, currentAge + 1);
    const yearsGained = Math.max(0, adjustments);
    const yearsLost = Math.max(0, -adjustments);
    const healthScore = Math.min(100, Math.max(0, 50 + adjustments * 2));

    // Generate recommendations
    const recommendations: string[] = [];
    if (riskFactors.includes('Heavy smoking (>20 cigarettes/day)') || riskFactors.includes('Moderate smoking (11-20 cigarettes/day)')) {
      recommendations.push('Quit smoking - this is the single most important change you can make');
    }
    if (riskFactors.includes('Sedentary lifestyle')) {
      recommendations.push('Increase physical activity to at least 150 minutes per week');
    }
    if (riskFactors.includes('Obese (BMI ≥ 30)') || riskFactors.includes('Overweight (BMI 25-29.9)')) {
      recommendations.push('Work towards a healthy weight through diet and exercise');
    }
    if (riskFactors.includes('Heavy alcohol consumption')) {
      recommendations.push('Reduce alcohol consumption to moderate levels');
    }
    if (riskFactors.includes('Poor diet quality')) {
      recommendations.push('Improve diet with more fruits, vegetables, and whole grains');
    }
    if (riskFactors.includes('High stress levels')) {
      recommendations.push('Practice stress management techniques like meditation or yoga');
    }
    if (riskFactors.includes('Poor sleep duration')) {
      recommendations.push('Aim for 7-9 hours of quality sleep per night');
    }

    if (recommendations.length === 0) {
      recommendations.push('Maintain your current healthy lifestyle habits');
      recommendations.push('Regular health check-ups with your healthcare provider');
      recommendations.push('Continue staying active and eating well');
    }

    setResult({
      currentLifeExpectancy: Math.round(baseLifeExpectancy * 10) / 10,
      adjustedLifeExpectancy: Math.round(adjustedLifeExpectancy * 10) / 10,
      yearsGained: Math.round(yearsGained * 10) / 10,
      yearsLost: Math.round(yearsLost * 10) / 10,
      healthScore: Math.round(healthScore),
      recommendations,
      riskFactors,
      positiveFactors
    });
  };

  const resetCalculator = () => {
    setAge('');
    setGender('');
    setHeight('');
    setWeight('');
    setFeet('');
    setInches('');
    setSmokingStatus('');
    setAlcoholConsumption('');
    setExerciseFrequency('');
    setDietQuality('');
    setSleepHours('');
    setStressLevel('');
    setMaritalStatus('');
    setUnitSystem('metric');
    setResult(null);
  };

  const getHealthScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    if (score >= 40) return 'text-orange-600';
    return 'text-red-600';
  };

  return (
    <>
      <Helmet>
        <title>Life Expectancy Calculator - Estimate Your Lifespan Based on Lifestyle | DapsiWow</title>
        <meta name="description" content="Calculate your life expectancy based on lifestyle factors, health habits, and demographics. Get personalized recommendations to improve longevity." />
        <meta name="keywords" content="life expectancy calculator, lifespan calculator, longevity calculator, health assessment, mortality calculator, lifestyle health" />
        <meta property="og:title" content="Life Expectancy Calculator - Estimate Your Lifespan Based on Lifestyle | DapsiWow" />
        <meta property="og:description" content="Calculate your life expectancy based on lifestyle factors and get personalized recommendations for longevity." />
        <meta property="og:type" content="website" />
        <link rel="canonical" href="/tools/life-expectancy-calculator" />
      </Helmet>

      <div className="min-h-screen flex flex-col" data-testid="page-life-expectancy-calculator">
        <Header />
        
        <main className="flex-1 bg-neutral-50">
          {/* Hero Section */}
          <section className="text-white py-16" style={{ background: 'linear-gradient(135deg, #f43f5e 0%, #e11d48 100%)' }}>
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <div className="w-20 h-20 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <i className="fas fa-hourglass text-3xl"></i>
              </div>
              <h1 className="text-4xl sm:text-5xl font-bold mb-6" data-testid="text-page-title">
                Life Expectancy Calculator
              </h1>
              <p className="text-xl text-blue-100 max-w-2xl mx-auto">
                Estimate your life expectancy based on lifestyle factors and get personalized recommendations for longevity
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

                      {/* Age */}
                      <div className="space-y-3">
                        <Label htmlFor="age" className="text-sm font-medium text-gray-700">
                          Current Age (years) *
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

                      {/* Weight */}
                      <div className="space-y-3">
                        <Label htmlFor="weight" className="text-sm font-medium text-gray-700">
                          Weight {unitSystem === 'metric' ? '(kg)' : '(lbs)'} <span className="text-gray-400 font-normal">- Optional</span>
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
                          Height {unitSystem === 'metric' ? '(cm)' : '(ft/in)'} <span className="text-gray-400 font-normal">- Optional</span>
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

                      <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-4">Lifestyle Factors</h3>

                      {/* Smoking Status */}
                      <div className="space-y-3">
                        <Label className="text-sm font-medium text-gray-700">
                          Smoking Status *
                        </Label>
                        <Select value={smokingStatus} onValueChange={setSmokingStatus}>
                          <SelectTrigger className="h-12 border-gray-200 rounded-lg" data-testid="select-smoking">
                            <SelectValue placeholder="Select smoking status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="never">Never smoked</SelectItem>
                            <SelectItem value="former">Former smoker (quit {'>'}1 year ago)</SelectItem>
                            <SelectItem value="light">Light smoker (1-10 cigarettes/day)</SelectItem>
                            <SelectItem value="moderate">Moderate smoker (11-20 cigarettes/day)</SelectItem>
                            <SelectItem value="heavy">Heavy smoker ({'>'}20 cigarettes/day)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Exercise Frequency */}
                      <div className="space-y-3">
                        <Label className="text-sm font-medium text-gray-700">
                          Exercise Frequency *
                        </Label>
                        <Select value={exerciseFrequency} onValueChange={setExerciseFrequency}>
                          <SelectTrigger className="h-12 border-gray-200 rounded-lg" data-testid="select-exercise">
                            <SelectValue placeholder="Select exercise frequency" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="daily">Daily exercise</SelectItem>
                            <SelectItem value="regular">Regular (3-5 times/week)</SelectItem>
                            <SelectItem value="occasional">Occasional (1-2 times/week)</SelectItem>
                            <SelectItem value="none">Sedentary/No exercise</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-4 pt-6">
                        <Button
                          onClick={calculateLifeExpectancy}
                          className="flex-1 h-12 text-white font-medium rounded-lg"
                          style={{ backgroundColor: '#f43f5e' }}
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#e11d48'}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#f43f5e'}
                          data-testid="button-calculate"
                        >
                          <Calculator className="w-4 h-4 mr-2" />
                          Calculate Life Expectancy
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

                    {/* Lifestyle Factors Column 2 */}
                    <div className="space-y-6">
                      <h2 className="text-2xl font-semibold text-gray-900 mb-8">Additional Factors</h2>

                      {/* Alcohol Consumption */}
                      <div className="space-y-3">
                        <Label className="text-sm font-medium text-gray-700">
                          Alcohol Consumption <span className="text-gray-400 font-normal">- Optional</span>
                        </Label>
                        <Select value={alcoholConsumption} onValueChange={setAlcoholConsumption}>
                          <SelectTrigger className="h-12 border-gray-200 rounded-lg" data-testid="select-alcohol">
                            <SelectValue placeholder="Select alcohol consumption" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">None</SelectItem>
                            <SelectItem value="light">Light (1-3 drinks/week)</SelectItem>
                            <SelectItem value="moderate">Moderate (4-7 drinks/week)</SelectItem>
                            <SelectItem value="heavy">Heavy ({'>'}7 drinks/week)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Diet Quality */}
                      <div className="space-y-3">
                        <Label className="text-sm font-medium text-gray-700">
                          Diet Quality <span className="text-gray-400 font-normal">- Optional</span>
                        </Label>
                        <Select value={dietQuality} onValueChange={setDietQuality}>
                          <SelectTrigger className="h-12 border-gray-200 rounded-lg" data-testid="select-diet">
                            <SelectValue placeholder="Select diet quality" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="excellent">Excellent (Mediterranean/DASH style)</SelectItem>
                            <SelectItem value="good">Good (Balanced, mostly whole foods)</SelectItem>
                            <SelectItem value="average">Average (Mixed diet)</SelectItem>
                            <SelectItem value="poor">Poor (Processed foods, low fruits/vegetables)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Sleep Hours */}
                      <div className="space-y-3">
                        <Label htmlFor="sleep" className="text-sm font-medium text-gray-700">
                          Sleep Hours per Night <span className="text-gray-400 font-normal">- Optional</span>
                        </Label>
                        <Input
                          id="sleep"
                          type="number"
                          value={sleepHours}
                          onChange={(e) => setSleepHours(e.target.value)}
                          className="h-12 text-base border-gray-200 rounded-lg"
                          placeholder="8"
                          min="3"
                          max="12"
                          data-testid="input-sleep"
                        />
                      </div>

                      {/* Stress Level */}
                      <div className="space-y-3">
                        <Label className="text-sm font-medium text-gray-700">
                          Stress Level <span className="text-gray-400 font-normal">- Optional</span>
                        </Label>
                        <Select value={stressLevel} onValueChange={setStressLevel}>
                          <SelectTrigger className="h-12 border-gray-200 rounded-lg" data-testid="select-stress">
                            <SelectValue placeholder="Select stress level" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="low">Low stress</SelectItem>
                            <SelectItem value="moderate">Moderate stress</SelectItem>
                            <SelectItem value="high">High stress</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Marital Status */}
                      <div className="space-y-3">
                        <Label className="text-sm font-medium text-gray-700">
                          Relationship Status <span className="text-gray-400 font-normal">- Optional</span>
                        </Label>
                        <Select value={maritalStatus} onValueChange={setMaritalStatus}>
                          <SelectTrigger className="h-12 border-gray-200 rounded-lg" data-testid="select-marital">
                            <SelectValue placeholder="Select relationship status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="married">Married</SelectItem>
                            <SelectItem value="partnered">In relationship</SelectItem>
                            <SelectItem value="single">Single</SelectItem>
                            <SelectItem value="divorced">Divorced</SelectItem>
                            <SelectItem value="widowed">Widowed</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Results Section */}
                      <div className="bg-gray-50 rounded-xl p-8 mt-8">
                        <h2 className="text-2xl font-semibold text-gray-900 mb-8">Life Expectancy Results</h2>
                        
                        {result ? (
                          <div className="space-y-4" data-testid="life-expectancy-results">
                            {/* Life Expectancy */}
                            <div className="bg-white rounded-lg p-4 border-l-4 border-indigo-500">
                              <div className="flex justify-between items-center">
                                <span className="font-semibold text-gray-700">Estimated Life Expectancy</span>
                                <span className="text-2xl font-bold text-indigo-600" data-testid="text-life-expectancy">
                                  {result.adjustedLifeExpectancy} years
                                </span>
                              </div>
                            </div>

                            {/* Health Score */}
                            <div className="bg-white rounded-lg p-4">
                              <div className="flex justify-between items-center">
                                <span className="text-gray-600">Health Score</span>
                                <span className={`font-semibold text-2xl ${getHealthScoreColor(result.healthScore)}`} data-testid="text-health-score">
                                  {result.healthScore}/100
                                </span>
                              </div>
                            </div>

                            {/* Years Impact */}
                            {(result.yearsGained > 0 || result.yearsLost > 0) && (
                              <div className="bg-white rounded-lg p-4">
                                <h3 className="font-semibold text-gray-900 mb-2">Lifestyle Impact</h3>
                                {result.yearsGained > 0 && (
                                  <div className="text-sm text-green-600" data-testid="text-years-gained">
                                    +{result.yearsGained} years from positive factors
                                  </div>
                                )}
                                {result.yearsLost > 0 && (
                                  <div className="text-sm text-red-600" data-testid="text-years-lost">
                                    -{result.yearsLost} years from risk factors
                                  </div>
                                )}
                              </div>
                            )}

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
                          </div>
                        ) : (
                          <div className="text-center py-8" data-testid="no-results">
                            <i className="fas fa-hourglass text-4xl text-gray-400 mb-4"></i>
                            <p className="text-gray-500">Fill in your information to calculate life expectancy</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Educational Content */}
              <div className="mt-12 space-y-8">
                <div className="bg-white rounded-2xl shadow-lg p-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-8">Understanding Life Expectancy</h2>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-4">What Affects Life Expectancy?</h3>
                      <p className="text-gray-600 mb-6 leading-relaxed">
                        Life expectancy is influenced by a complex combination of genetic, lifestyle, environmental, 
                        and social factors. While genetics play a role (about 25%), lifestyle choices have the 
                        biggest impact on how long and how well you live.
                      </p>
                      
                      <h3 className="text-xl font-semibold text-gray-900 mb-4">Key Longevity Factors</h3>
                      <ul className="text-gray-600 space-y-2 text-sm">
                        <li>• <strong>Physical Activity:</strong> Regular exercise can add 3-7 years</li>
                        <li>• <strong>Diet Quality:</strong> Mediterranean diet linked to longer life</li>
                        <li>• <strong>Social Connections:</strong> Strong relationships reduce mortality risk</li>
                        <li>• <strong>Sleep Quality:</strong> 7-9 hours optimal for longevity</li>
                        <li>• <strong>Stress Management:</strong> Chronic stress accelerates aging</li>
                        <li>• <strong>Purpose in Life:</strong> Having goals increases lifespan</li>
                      </ul>
                    </div>
                    
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-4">Risk Factors to Avoid</h3>
                      <div className="space-y-3">
                        <div className="p-3 bg-red-50 rounded-lg">
                          <div className="font-medium text-gray-900">Smoking</div>
                          <div className="text-sm text-gray-600">Reduces life expectancy by 10-12 years on average</div>
                        </div>
                        
                        <div className="p-3 bg-orange-50 rounded-lg">
                          <div className="font-medium text-gray-900">Obesity</div>
                          <div className="text-sm text-gray-600">Can reduce life expectancy by 3-10 years</div>
                        </div>
                        
                        <div className="p-3 bg-yellow-50 rounded-lg">
                          <div className="font-medium text-gray-900">Excessive Alcohol</div>
                          <div className="text-sm text-gray-600">Heavy drinking shortens life by 4-5 years</div>
                        </div>
                        
                        <div className="p-3 bg-gray-50 rounded-lg">
                          <div className="font-medium text-gray-900">Sedentary Lifestyle</div>
                          <div className="text-sm text-gray-600">Lack of exercise reduces life expectancy by 3-5 years</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Strategies for Longevity</h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Physical Health</h3>
                      <ul className="text-gray-600 space-y-2 text-sm">
                        <li>• Exercise 150+ minutes per week</li>
                        <li>• Maintain healthy weight (BMI 18.5-24.9)</li>
                        <li>• Get regular health screenings</li>
                        <li>• Don't smoke or quit if you do</li>
                        <li>• Limit alcohol consumption</li>
                      </ul>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Mental & Social</h3>
                      <ul className="text-gray-600 space-y-2 text-sm">
                        <li>• Maintain strong social connections</li>
                        <li>• Practice stress management</li>
                        <li>• Keep learning new things</li>
                        <li>• Have a sense of purpose</li>
                        <li>• Practice gratitude and mindfulness</li>
                      </ul>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Lifestyle</h3>
                      <ul className="text-gray-600 space-y-2 text-sm">
                        <li>• Follow a Mediterranean-style diet</li>
                        <li>• Get 7-9 hours of quality sleep</li>
                        <li>• Stay hydrated and limit processed foods</li>
                        <li>• Spend time in nature</li>
                        <li>• Practice safety (seatbelts, helmets)</li>
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

export default LifeExpectancyCalculator;