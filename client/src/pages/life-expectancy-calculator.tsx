
import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

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

export default function LifeExpectancyCalculator() {
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Helmet>
        <title>Life Expectancy Calculator - Estimate Your Lifespan Based on Lifestyle | DapsiWow</title>
        <meta name="description" content="Free life expectancy calculator to estimate your lifespan based on lifestyle factors including diet, exercise, smoking, and health habits. Get personalized longevity recommendations and health insights." />
        <meta name="keywords" content="life expectancy calculator, lifespan calculator, longevity calculator, health assessment, mortality calculator, lifestyle health, age calculator, health score, longevity prediction, life span estimator" />
        <meta property="og:title" content="Life Expectancy Calculator - Estimate Your Lifespan Based on Lifestyle | DapsiWow" />
        <meta property="og:description" content="Calculate your life expectancy based on lifestyle factors and get personalized recommendations for longevity and healthy living." />
        <meta property="og:type" content="website" />
        <meta name="robots" content="index, follow" />
        <meta name="author" content="DapsiWow" />
        <link rel="canonical" href="https://dapsiwow.com/tools/life-expectancy-calculator" />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            "name": "Life Expectancy Calculator",
            "description": "Free online life expectancy calculator to estimate lifespan based on lifestyle factors including diet, exercise, smoking habits, and health indicators. Get personalized recommendations for longevity.",
            "url": "https://dapsiwow.com/tools/life-expectancy-calculator",
            "applicationCategory": "HealthApplication",
            "operatingSystem": "Any",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "USD"
            },
            "featureList": [
              "Life expectancy estimation",
              "Health score calculation",
              "Lifestyle impact analysis",
              "Personalized longevity recommendations",
              "Risk factor identification",
              "BMI integration"
            ]
          })}
        </script>
      </Helmet>
      
      <Header />
      
      <main>
        {/* Hero Section */}
        <section className="relative py-12 sm:py-16 md:py-20 lg:py-24 xl:py-28 2xl:py-32 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-indigo-600/20"></div>
          <div className="relative max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 xl:px-12 text-center">
            <div className="space-y-4 sm:space-y-6 md:space-y-8 lg:space-y-10">
              <div className="inline-flex items-center px-3 py-1.5 sm:px-4 sm:py-2 md:px-5 md:py-2.5 bg-white/80 backdrop-blur-sm rounded-full border border-blue-200 text-xs sm:text-sm md:text-base">
                <span className="font-medium text-blue-700">Advanced Health Assessment</span>
              </div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl 2xl:text-7xl font-bold text-slate-900 leading-tight tracking-tight">
                <span className="block">Life Expectancy</span>
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                  Calculator
                </span>
              </h1>
              <p className="text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl text-slate-600 max-w-xs sm:max-w-md md:max-w-2xl lg:max-w-4xl xl:max-w-5xl mx-auto leading-relaxed px-2 sm:px-4 md:px-6">
                Estimate your lifespan based on lifestyle factors and get personalized recommendations for longevity
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
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">Personal Information</h2>
                    <p className="text-gray-600">Enter your details and lifestyle factors for accurate life expectancy estimation</p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Unit System */}
                    <div className="space-y-3">
                      <Label className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                        Unit System
                      </Label>
                      <Select value={unitSystem} onValueChange={setUnitSystem}>
                        <SelectTrigger className="h-14 border-2 border-gray-200 rounded-xl text-lg" data-testid="select-unit-system">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="metric">Metric (kg, cm)</SelectItem>
                          <SelectItem value="imperial">Imperial (lbs, ft/in)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Age */}
                    <div className="space-y-3">
                      <Label htmlFor="age" className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                        Current Age (years)
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

                    {/* Gender */}
                    <div className="space-y-3">
                      <Label className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                        Gender
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
                    </div>

                    {/* Weight */}
                    <div className="space-y-3">
                      <Label htmlFor="weight" className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                        Weight {unitSystem === 'metric' ? '(kg)' : '(lbs)'}
                      </Label>
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

                    {/* Height */}
                    <div className="space-y-3 md:col-span-2">
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
                  </div>

                  {/* Lifestyle Factors */}
                  <div className="space-y-6 border-t pt-8">
                    <h3 className="text-xl font-bold text-gray-900">Lifestyle Factors</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Smoking Status */}
                      <div className="space-y-3">
                        <Label className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                          Smoking Status
                        </Label>
                        <Select value={smokingStatus} onValueChange={setSmokingStatus}>
                          <SelectTrigger className="h-14 border-2 border-gray-200 rounded-xl text-lg" data-testid="select-smoking">
                            <SelectValue placeholder="Select smoking status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="never">Never smoked</SelectItem>
                            <SelectItem value="former">Former smoker (quit {'>'} 1 year ago)</SelectItem>
                            <SelectItem value="light">Light smoker (1-10 cigarettes/day)</SelectItem>
                            <SelectItem value="moderate">Moderate smoker (11-20 cigarettes/day)</SelectItem>
                            <SelectItem value="heavy">Heavy smoker ({'>'} 20 cigarettes/day)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Exercise Frequency */}
                      <div className="space-y-3">
                        <Label className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                          Exercise Frequency
                        </Label>
                        <Select value={exerciseFrequency} onValueChange={setExerciseFrequency}>
                          <SelectTrigger className="h-14 border-2 border-gray-200 rounded-xl text-lg" data-testid="select-exercise">
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

                      {/* Alcohol Consumption */}
                      <div className="space-y-3">
                        <Label className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                          Alcohol Consumption
                        </Label>
                        <Select value={alcoholConsumption} onValueChange={setAlcoholConsumption}>
                          <SelectTrigger className="h-14 border-2 border-gray-200 rounded-xl text-lg" data-testid="select-alcohol">
                            <SelectValue placeholder="Select alcohol consumption" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">None</SelectItem>
                            <SelectItem value="light">Light (1-3 drinks/week)</SelectItem>
                            <SelectItem value="moderate">Moderate (4-7 drinks/week)</SelectItem>
                            <SelectItem value="heavy">Heavy ({'>'} 7 drinks/week)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Diet Quality */}
                      <div className="space-y-3">
                        <Label className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                          Diet Quality
                        </Label>
                        <Select value={dietQuality} onValueChange={setDietQuality}>
                          <SelectTrigger className="h-14 border-2 border-gray-200 rounded-xl text-lg" data-testid="select-diet">
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
                        <Label htmlFor="sleep" className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                          Sleep Hours per Night
                        </Label>
                        <Input
                          id="sleep"
                          type="number"
                          value={sleepHours}
                          onChange={(e) => setSleepHours(e.target.value)}
                          className="h-14 text-lg border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-blue-500"
                          placeholder="8"
                          min="3"
                          max="12"
                          data-testid="input-sleep"
                        />
                      </div>

                      {/* Stress Level */}
                      <div className="space-y-3">
                        <Label className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                          Stress Level
                        </Label>
                        <Select value={stressLevel} onValueChange={setStressLevel}>
                          <SelectTrigger className="h-14 border-2 border-gray-200 rounded-xl text-lg" data-testid="select-stress">
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
                        <Label className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                          Relationship Status
                        </Label>
                        <Select value={maritalStatus} onValueChange={setMaritalStatus}>
                          <SelectTrigger className="h-14 border-2 border-gray-200 rounded-xl text-lg" data-testid="select-marital">
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
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-4 pt-6">
                    <Button
                      onClick={calculateLifeExpectancy}
                      className="flex-1 h-14 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold text-lg rounded-xl shadow-lg transform transition-all duration-200 hover:scale-105"
                      data-testid="button-calculate"
                    >
                      Calculate Life Expectancy
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
                  <h2 className="text-2xl font-bold text-gray-900 mb-8">Life Expectancy Results</h2>
                  
                  {result ? (
                    <div className="space-y-6" data-testid="life-expectancy-results">
                      {/* Life Expectancy Highlight */}
                      <div className="bg-white rounded-2xl p-6 shadow-lg border border-blue-100">
                        <div className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-2">Estimated Life Expectancy</div>
                        <div className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600" data-testid="text-life-expectancy">
                          {result.adjustedLifeExpectancy} years
                        </div>
                      </div>

                      {/* Health Score */}
                      <div className="bg-white rounded-xl p-4 shadow-sm">
                        <div className="flex justify-between items-center">
                          <span className="font-medium text-gray-700">Health Score</span>
                          <span className={`font-bold text-2xl ${getHealthScoreColor(result.healthScore)}`} data-testid="text-health-score">
                            {result.healthScore}/100
                          </span>
                        </div>
                      </div>

                      {/* Years Impact */}
                      {(result.yearsGained > 0 || result.yearsLost > 0) && (
                        <div className="bg-white rounded-xl p-4 shadow-sm">
                          <h4 className="font-medium text-gray-700 mb-2">Lifestyle Impact</h4>
                          {result.yearsGained > 0 && (
                            <div className="text-sm text-green-600 mb-1" data-testid="text-years-gained">
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

                      {/* Risk Factors */}
                      {result.riskFactors.length > 0 && (
                        <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-xl p-4 border border-red-200">
                          <h4 className="font-bold text-red-800 mb-3 text-sm">Risk Factors</h4>
                          <div className="space-y-2">
                            {result.riskFactors.map((factor, index) => (
                              <div key={index} className="flex items-start">
                                <span className="text-red-600 mr-2 mt-1">•</span>
                                <span className="text-xs text-red-700">{factor}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Positive Factors */}
                      {result.positiveFactors.length > 0 && (
                        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200">
                          <h4 className="font-bold text-green-800 mb-3 text-sm">Positive Factors</h4>
                          <div className="space-y-2">
                            {result.positiveFactors.map((factor, index) => (
                              <div key={index} className="flex items-start">
                                <span className="text-green-600 mr-2 mt-1">•</span>
                                <span className="text-xs text-green-700">{factor}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Recommendations */}
                      <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-4 border border-purple-200">
                        <h4 className="font-bold text-purple-800 mb-3 text-sm">Recommendations</h4>
                        <div className="space-y-2" data-testid="recommendations">
                          {result.recommendations.map((recommendation, index) => (
                            <div key={index} className="flex items-start">
                              <span className="text-purple-600 mr-2 mt-1">•</span>
                              <span className="text-xs text-purple-700">{recommendation}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-16" data-testid="no-results">
                      <div className="w-20 h-20 bg-gray-200 rounded-full mx-auto mb-6 flex items-center justify-center">
                        <div className="text-3xl font-bold text-gray-400">⏳</div>
                      </div>
                      <p className="text-gray-500 text-lg">Enter your information to calculate life expectancy</p>
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
                <h3 className="text-2xl font-bold text-gray-900 mb-6">What is Life Expectancy?</h3>
                <div className="space-y-4 text-gray-600">
                  <p>
                    Life expectancy is the average number of years a person is expected to live based on current 
                    mortality rates and statistical data. Our life expectancy calculator goes beyond basic demographics 
                    to consider your individual lifestyle factors, health habits, and personal choices that significantly 
                    impact longevity.
                  </p>
                  <p>
                    This advanced longevity calculator uses scientifically-backed research to assess how factors like 
                    diet, exercise, smoking, alcohol consumption, sleep quality, and stress levels affect your lifespan. 
                    By providing personalized recommendations, you can make informed decisions to potentially increase 
                    your life expectancy and improve your quality of life.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">How Life Expectancy is Calculated</h3>
                <div className="space-y-4 text-gray-600">
                  <p>
                    Our life expectancy calculator uses a comprehensive algorithm that starts with baseline life 
                    expectancy data by gender and age, then applies adjustments based on your lifestyle choices 
                    and health indicators.
                  </p>
                  <ul className="space-y-2 list-disc list-inside">
                    <li>BMI and weight status adjustments</li>
                    <li>Smoking and alcohol consumption impact</li>
                    <li>Physical activity and exercise frequency</li>
                    <li>Diet quality and nutritional habits</li>
                    <li>Sleep duration and quality assessment</li>
                    <li>Stress levels and mental health factors</li>
                    <li>Social support and relationship status</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Factors That Increase Life Expectancy</h3>
                <div className="space-y-3 text-gray-600">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Regular physical exercise (150+ minutes per week)</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Mediterranean or DASH diet patterns</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Never smoking or quitting smoking</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Maintaining healthy weight (BMI 18.5-24.9)</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Quality sleep (7-9 hours per night)</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Strong social connections and relationships</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Effective stress management techniques</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Risk Factors for Reduced Longevity</h3>
                <div className="space-y-3 text-gray-600">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Smoking (reduces life expectancy by 10-15 years)</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Obesity and being significantly overweight</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Excessive alcohol consumption</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Sedentary lifestyle with minimal physical activity</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Poor diet quality with processed foods</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Chronic high stress levels</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Inadequate sleep (less than 6 or more than 10 hours)</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Additional SEO Content Sections */}
          <div className="mt-12 space-y-8">
            {/* Lifestyle Categories */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Impact of Lifestyle Choices on Longevity</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-gray-800">Physical Health Factors</h4>
                    <div className="space-y-3">
                      <div className="border-l-4 border-blue-500 pl-4">
                        <h5 className="font-semibold text-gray-800 mb-1">Exercise and Physical Activity</h5>
                        <p className="text-sm text-gray-600">Regular exercise can add 3-7 years to life expectancy. Cardiovascular exercise, strength training, and flexibility work all contribute to longevity.</p>
                      </div>
                      <div className="border-l-4 border-green-500 pl-4">
                        <h5 className="font-semibold text-gray-800 mb-1">Body Weight and BMI</h5>
                        <p className="text-sm text-gray-600">Maintaining a healthy BMI (18.5-24.9) is associated with longer life. Both underweight and obesity increase mortality risk.</p>
                      </div>
                      <div className="border-l-4 border-purple-500 pl-4">
                        <h5 className="font-semibold text-gray-800 mb-1">Sleep Quality</h5>
                        <p className="text-sm text-gray-600">Optimal sleep duration (7-9 hours) and quality sleep patterns support immune function, mental health, and cellular repair.</p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-gray-800">Behavioral and Social Factors</h4>
                    <div className="space-y-3">
                      <div className="border-l-4 border-orange-500 pl-4">
                        <h5 className="font-semibold text-gray-800 mb-1">Smoking and Substance Use</h5>
                        <p className="text-sm text-gray-600">Smoking is the single largest preventable cause of premature death. Quitting at any age provides significant health benefits.</p>
                      </div>
                      <div className="border-l-4 border-yellow-500 pl-4">
                        <h5 className="font-semibold text-gray-800 mb-1">Social Connections</h5>
                        <p className="text-sm text-gray-600">Strong relationships and social support networks reduce stress and provide emotional resilience, contributing to longer life.</p>
                      </div>
                      <div className="border-l-4 border-indigo-500 pl-4">
                        <h5 className="font-semibold text-gray-800 mb-1">Stress Management</h5>
                        <p className="text-sm text-gray-600">Chronic stress accelerates aging and increases disease risk. Effective stress management techniques promote longevity.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Nutrition and Diet */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
                <CardContent className="p-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">Nutrition for Longevity</h3>
                  <div className="space-y-4 text-gray-600">
                    <p className="text-sm leading-relaxed">
                      Diet quality plays a crucial role in determining life expectancy. Research shows that certain 
                      dietary patterns are associated with increased longevity and reduced risk of chronic diseases.
                    </p>
                    <div className="space-y-3">
                      <div className="bg-green-50 rounded-lg p-3">
                        <h4 className="font-semibold text-green-800 mb-2 text-sm">Mediterranean Diet Benefits</h4>
                        <p className="text-xs text-green-700">Rich in olive oil, fish, vegetables, and whole grains. Associated with 8-10% reduction in mortality risk.</p>
                      </div>
                      <div className="bg-blue-50 rounded-lg p-3">
                        <h4 className="font-semibold text-blue-800 mb-2 text-sm">DASH Diet Approach</h4>
                        <p className="text-xs text-blue-700">Emphasizes fruits, vegetables, lean proteins, and low sodium. Proven to reduce cardiovascular disease risk.</p>
                      </div>
                      <div className="bg-purple-50 rounded-lg p-3">
                        <h4 className="font-semibold text-purple-800 mb-2 text-sm">Plant-Based Eating</h4>
                        <p className="text-xs text-purple-700">Higher intake of plant foods linked to lower mortality rates and reduced chronic disease risk.</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
                <CardContent className="p-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">Exercise and Physical Activity Guidelines</h3>
                  <div className="space-y-4 text-gray-600">
                    <p className="text-sm leading-relaxed">
                      Regular physical activity is one of the most powerful predictors of longevity. Different types 
                      of exercise contribute to various aspects of health and aging.
                    </p>
                    <div className="space-y-3">
                      <div className="bg-red-50 rounded-lg p-3">
                        <h4 className="font-semibold text-red-800 mb-2 text-sm">Cardiovascular Exercise</h4>
                        <p className="text-xs text-red-700">150 minutes moderate or 75 minutes vigorous activity weekly. Improves heart health and endurance.</p>
                      </div>
                      <div className="bg-orange-50 rounded-lg p-3">
                        <h4 className="font-semibold text-orange-800 mb-2 text-sm">Strength Training</h4>
                        <p className="text-xs text-orange-700">2+ sessions per week targeting major muscle groups. Maintains muscle mass and bone density with aging.</p>
                      </div>
                      <div className="bg-teal-50 rounded-lg p-3">
                        <h4 className="font-semibold text-teal-800 mb-2 text-sm">Flexibility and Balance</h4>
                        <p className="text-xs text-teal-700">Daily stretching and balance exercises. Reduces fall risk and maintains mobility in older adults.</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Life Expectancy FAQs */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-8">Frequently Asked Questions about Life Expectancy</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">How accurate are life expectancy calculators?</h4>
                      <p className="text-gray-600 text-sm">Life expectancy calculators provide estimates based on statistical models and current research. While they can't predict individual outcomes, they offer valuable insights into how lifestyle choices impact longevity.</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">Can I really increase my life expectancy?</h4>
                      <p className="text-gray-600 text-sm">Yes, lifestyle modifications can significantly impact life expectancy. Studies show that adopting healthy habits like regular exercise, good nutrition, and not smoking can add years to your life.</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">What's the most important factor for longevity?</h4>
                      <p className="text-gray-600 text-sm">While genetics play a role, lifestyle factors like not smoking, regular exercise, healthy diet, and maintaining social connections are the most modifiable and impactful factors for longevity.</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">How does stress affect life expectancy?</h4>
                      <p className="text-gray-600 text-sm">Chronic stress accelerates cellular aging, weakens immune function, and increases risk of cardiovascular disease. Effective stress management can add years to your life.</p>
                    </div>
                  </div>
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">Does genetics determine my lifespan?</h4>
                      <p className="text-gray-600 text-sm">Genetics account for about 25% of longevity factors. The remaining 75% is influenced by lifestyle choices, environment, and behaviors that you can control.</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">What's the healthiest BMI for longevity?</h4>
                      <p className="text-gray-600 text-sm">Research suggests that a BMI between 20-25 is associated with the lowest mortality risk. However, muscle mass, body composition, and overall fitness are also important factors.</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">How much exercise do I need for longevity?</h4>
                      <p className="text-gray-600 text-sm">The minimum recommended is 150 minutes of moderate exercise weekly, but studies show that even higher amounts provide additional longevity benefits, with diminishing returns after about 300-400 minutes weekly.</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">Can quitting smoking later in life still help?</h4>
                      <p className="text-gray-600 text-sm">Absolutely. Quitting smoking provides health benefits at any age. Even people who quit in their 60s or 70s can add years to their life expectancy.</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Longevity Research and Science */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Science of Longevity and Healthy Aging</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-3">Blue Zones Research</h4>
                    <p className="text-gray-600 text-sm mb-3">
                      Blue Zones are regions with the highest concentrations of centenarians. Common factors include:
                    </p>
                    <ul className="text-gray-600 space-y-1 text-xs">
                      <li>• Plant-based diets with moderate calorie intake</li>
                      <li>• Regular physical activity integrated into daily life</li>
                      <li>• Strong social connections and family bonds</li>
                      <li>• Sense of purpose and meaning in life</li>
                      <li>• Stress management and relaxation practices</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-3">Cellular Aging</h4>
                    <p className="text-gray-600 text-sm mb-3">
                      Understanding how cells age helps identify longevity factors:
                    </p>
                    <ul className="text-gray-600 space-y-1 text-xs">
                      <li>• Telomere length and cellular regeneration</li>
                      <li>• Oxidative stress and antioxidant protection</li>
                      <li>• Inflammation reduction and immune function</li>
                      <li>• DNA repair mechanisms and genetic stability</li>
                      <li>• Mitochondrial health and energy production</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-3">Preventive Medicine</h4>
                    <p className="text-gray-600 text-sm mb-3">
                      Proactive health management for longevity:
                    </p>
                    <ul className="text-gray-600 space-y-1 text-xs">
                      <li>• Regular health screenings and early detection</li>
                      <li>• Vaccination and preventive care protocols</li>
                      <li>• Biomarker monitoring and optimization</li>
                      <li>• Personalized medicine and genetic testing</li>
                      <li>• Hormone optimization and metabolic health</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Action Plan for Longevity */}
            <Card className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl shadow-xl border-0">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Your Personalized Longevity Action Plan</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="space-y-3">
                    <h4 className="text-lg font-semibold text-gray-900">Week 1-2: Assessment</h4>
                    <ul className="text-gray-600 space-y-2 text-sm">
                      <li>• Complete comprehensive health screening</li>
                      <li>• Track current diet and exercise habits</li>
                      <li>• Assess sleep quality and stress levels</li>
                      <li>• Identify primary risk factors</li>
                    </ul>
                  </div>
                  
                  <div className="space-y-3">
                    <h4 className="text-lg font-semibold text-gray-900">Month 1: Foundation</h4>
                    <ul className="text-gray-600 space-y-2 text-sm">
                      <li>• Start with 150 minutes weekly exercise</li>
                      <li>• Improve diet quality gradually</li>
                      <li>• Establish consistent sleep schedule</li>
                      <li>• Begin stress management practice</li>
                    </ul>
                  </div>
                  
                  <div className="space-y-3">
                    <h4 className="text-lg font-semibold text-gray-900">Month 2-3: Building</h4>
                    <ul className="text-gray-600 space-y-2 text-sm">
                      <li>• Increase exercise intensity and variety</li>
                      <li>• Optimize nutrition with whole foods</li>
                      <li>• Strengthen social connections</li>
                      <li>• Address specific health concerns</li>
                    </ul>
                  </div>
                  
                  <div className="space-y-3">
                    <h4 className="text-lg font-semibold text-gray-900">Month 4+: Optimization</h4>
                    <ul className="text-gray-600 space-y-2 text-sm">
                      <li>• Fine-tune all lifestyle factors</li>
                      <li>• Regular health monitoring</li>
                      <li>• Continuous learning and adaptation</li>
                      <li>• Maintain long-term motivation</li>
                    </ul>
                  </div>
                </div>
                <div className="mt-6 p-4 bg-white rounded-lg">
                  <p className="text-gray-600 text-sm">
                    <strong>Remember:</strong> Small, consistent changes compound over time. Focus on sustainable habits 
                    rather than dramatic short-term changes. Consult healthcare providers for personalized advice based 
                    on your individual health status and risk factors.
                  </p>
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
