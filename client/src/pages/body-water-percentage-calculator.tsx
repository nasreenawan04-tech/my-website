
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
import { ToolSEOHead } from '@/components/seo/ToolSEOHead';
import { bodyWaterPercentageCalculatorSEO } from '@/config/seo/tools/body-water-percentage-calculator';

interface BodyWaterResult {
  tbwPercentage: number;
  tbwLiters: number;
  tbwKg: number;
  dailyWaterIntake: number;
  hydrationStatus: string;
  statusColor: string;
  recommendations: string[];
}

const BodyWaterPercentageCalculator = () => {
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [feet, setFeet] = useState('');
  const [inches, setInches] = useState('');
  const [unitSystem, setUnitSystem] = useState('metric');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [activityLevel, setActivityLevel] = useState('');
  const [result, setResult] = useState<BodyWaterResult | null>(null);

  const calculateBodyWater = () => {
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

    if (weightKg && heightM && heightM > 0 && age && gender) {
      const ageNum = parseFloat(age);

      // Watson formula for Total Body Water (TBW)
      let tbwLiters: number;
      
      if (gender === 'male') {
        tbwLiters = 2.447 - (0.09156 * ageNum) + (0.1074 * heightM * 100) + (0.3362 * weightKg);
      } else {
        tbwLiters = -2.097 + (0.1069 * heightM * 100) + (0.2466 * weightKg);
      }

      // Activity level adjustments
      const activityMultipliers: { [key: string]: number } = {
        sedentary: 0.95,
        light: 0.98,
        moderate: 1.0,
        active: 1.02,
        very_active: 1.05
      };

      if (activityLevel && activityMultipliers[activityLevel]) {
        tbwLiters *= activityMultipliers[activityLevel];
      }

      const tbwPercentage = (tbwLiters / weightKg) * 100;
      const tbwKg = tbwLiters; // 1 liter = 1 kg for water

      // Calculate daily water intake recommendation
      const baseWaterIntake = weightKg * 35; // 35ml per kg body weight
      const dailyWaterIntake = Math.round(baseWaterIntake);

      // Determine hydration status
      let hydrationStatus = '';
      let statusColor = '';
      let recommendations: string[] = [];

      if (gender === 'male') {
        if (tbwPercentage >= 60) {
          hydrationStatus = 'Excellent';
          statusColor = 'text-green-600';
          recommendations.push('Maintain your excellent hydration levels');
          recommendations.push('Continue current water intake routine');
        } else if (tbwPercentage >= 55) {
          hydrationStatus = 'Good';
          statusColor = 'text-blue-600';
          recommendations.push('Good hydration, maintain current intake');
          recommendations.push('Monitor hydration during exercise');
        } else if (tbwPercentage >= 50) {
          hydrationStatus = 'Fair';
          statusColor = 'text-orange-600';
          recommendations.push('Consider increasing water intake slightly');
          recommendations.push('Drink more water throughout the day');
        } else {
          hydrationStatus = 'Low';
          statusColor = 'text-red-600';
          recommendations.push('Increase water intake significantly');
          recommendations.push('Consult healthcare provider if persistent');
        }
      } else {
        if (tbwPercentage >= 55) {
          hydrationStatus = 'Excellent';
          statusColor = 'text-green-600';
          recommendations.push('Maintain your excellent hydration levels');
          recommendations.push('Continue current water intake routine');
        } else if (tbwPercentage >= 50) {
          hydrationStatus = 'Good';
          statusColor = 'text-blue-600';
          recommendations.push('Good hydration, maintain current intake');
          recommendations.push('Monitor hydration during exercise');
        } else if (tbwPercentage >= 45) {
          hydrationStatus = 'Fair';
          statusColor = 'text-orange-600';
          recommendations.push('Consider increasing water intake slightly');
          recommendations.push('Drink more water throughout the day');
        } else {
          hydrationStatus = 'Low';
          statusColor = 'text-red-600';
          recommendations.push('Increase water intake significantly');
          recommendations.push('Consult healthcare provider if persistent');
        }
      }

      setResult({
        tbwPercentage: Math.round(tbwPercentage * 10) / 10,
        tbwLiters: Math.round(tbwLiters * 10) / 10,
        tbwKg: Math.round(tbwKg * 10) / 10,
        dailyWaterIntake,
        hydrationStatus,
        statusColor,
        recommendations
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
    setActivityLevel('');
    setUnitSystem('metric');
    setResult(null);
  };

  const formatVolume = (volume: number) => {
    return `${volume.toFixed(1)} L`;
  };

  const formatIntake = (intake: number) => {
    return `${intake} ml`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <ToolSEOHead config={bodyWaterPercentageCalculatorSEO} />
      <Helmet>
        <title>Body Water Percentage Calculator - Free Total Body Water Calculator | DapsiWow</title>
        <meta name="description" content="Calculate your total body water percentage with our free Watson formula calculator. Monitor hydration levels, get personalized recommendations, and optimize your health with accurate TBW calculations." />
        <meta name="keywords" content="body water percentage calculator, total body water calculator, TBW calculator, hydration calculator, Watson formula, body water composition, hydration status, water intake calculator, health assessment tool" />
        <meta property="og:title" content="Body Water Percentage Calculator - Free Total Body Water Calculator | DapsiWow" />
        <meta property="og:description" content="Calculate your total body water percentage and get personalized hydration recommendations for optimal health and wellness." />
        <meta property="og:type" content="website" />
        <meta name="robots" content="index, follow" />
        <meta name="author" content="DapsiWow" />
        <link rel="canonical" href="https://dapsiwow.com/tools/body-water-percentage-calculator" />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            "name": "Body Water Percentage Calculator",
            "description": "Free online body water percentage calculator using Watson formula to calculate Total Body Water (TBW) for health assessment and hydration monitoring. Features metric and imperial units with personalized recommendations.",
            "url": "https://dapsiwow.com/tools/body-water-percentage-calculator",
            "applicationCategory": "HealthApplication",
            "operatingSystem": "Any",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "USD"
            },
            "featureList": [
              "Calculate total body water percentage",
              "Watson formula calculations",
              "Metric and imperial units",
              "Hydration status assessment",
              "Daily water intake recommendations",
              "Activity level adjustments",
              "Age and gender considerations"
            ]
          })}
        </script>
      </Helmet>
      
      <Header />
      
      <main>
        {/* Hero Section */}
        <section className="relative py-12 sm:py-16 md:py-20 lg:py-24 xl:py-28 2xl:py-32 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-indigo-600/20"></div>
          <div className="relative max-w-sm sm:max-w-lg md:max-w-2xl lg:max-w-4xl xl:max-w-5xl 2xl:max-w-6xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 xl:px-12 text-center">
            <div className="space-y-4 sm:space-y-6 md:space-y-8 lg:space-y-10">
              <div className="inline-flex items-center px-3 py-1.5 sm:px-4 sm:py-2 bg-white/80 backdrop-blur-sm rounded-full border border-blue-200">
                <span className="text-xs sm:text-sm font-medium text-blue-700">Professional Hydration Calculator</span>
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl 2xl:text-8xl font-bold text-slate-900 leading-tight tracking-tight" data-testid="text-body-water-title">
                <span className="block">Body Water</span>
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 mt-1 sm:mt-2">
                  Calculator
                </span>
              </h1>
              <p className="text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl text-slate-600 max-w-sm sm:max-w-lg md:max-w-2xl lg:max-w-3xl xl:max-w-4xl mx-auto leading-relaxed px-2 sm:px-0">
                Calculate your total body water percentage with advanced hydration insights and personalized water intake recommendations
              </p>
            </div>
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-4 py-16" data-testid="page-body-water-calculator">
          {/* Main Calculator Card */}
          <Card className="bg-white/90 backdrop-blur-sm shadow-2xl border-0 rounded-3xl overflow-hidden">
            <CardContent className="p-0">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-0">
                {/* Input Section */}
                <div className="lg:col-span-2 p-8 lg:p-12 space-y-8">
                  <div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">Body Water Configuration</h2>
                    <p className="text-gray-600">Enter your body measurements to get accurate hydration calculations</p>
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

                    {/* Age */}
                    <div className="space-y-3">
                      <Label htmlFor="age" className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                        Age (years)
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

                    {/* Activity Level */}
                    <div className="md:col-span-2 space-y-3">
                      <Label className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                        Activity Level <span className="text-gray-400 font-normal">- Optional</span>
                      </Label>
                      <Select value={activityLevel} onValueChange={setActivityLevel}>
                        <SelectTrigger className="h-14 border-2 border-gray-200 rounded-xl text-lg" data-testid="select-activity">
                          <SelectValue placeholder="Select activity level" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="sedentary">Sedentary (little/no exercise)</SelectItem>
                          <SelectItem value="light">Light (light exercise 1-3 days/week)</SelectItem>
                          <SelectItem value="moderate">Moderate (moderate exercise 3-5 days/week)</SelectItem>
                          <SelectItem value="active">Active (hard exercise 6-7 days/week)</SelectItem>
                          <SelectItem value="very_active">Very Active (very hard exercise, physical job)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-4 pt-6">
                    <Button
                      onClick={calculateBodyWater}
                      className="flex-1 h-14 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold text-lg rounded-xl shadow-lg transition-colors duration-200"
                      data-testid="button-calculate"
                    >
                      Calculate Body Water
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
                  <h2 className="text-2xl font-bold text-gray-900 mb-8">Body Water Results</h2>
                  
                  {result ? (
                    <div className="space-y-6" data-testid="body-water-results">
                      {/* Body Water Percentage Highlight */}
                      <div className="bg-white rounded-2xl p-6 shadow-lg border border-blue-100">
                        <div className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-2">Body Water Percentage</div>
                        <div className={`text-4xl font-bold ${result.statusColor}`} data-testid="text-tbw-percentage">
                          {result.tbwPercentage}%
                        </div>
                      </div>

                      {/* Hydration Status */}
                      <div className="bg-white rounded-xl p-4 shadow-sm">
                        <div className="flex justify-between items-center">
                          <span className="font-medium text-gray-700">Hydration Status</span>
                          <span className={`font-semibold ${result.statusColor}`} data-testid="text-hydration-status">
                            {result.hydrationStatus}
                          </span>
                        </div>
                      </div>

                      {/* Body Water Volume */}
                      <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                        <h3 className="font-semibold text-blue-800 mb-2">Total Body Water</h3>
                        <div className="text-sm text-blue-700">
                          <span className="font-medium" data-testid="text-water-volume">
                            {formatVolume(result.tbwLiters)} ({result.tbwKg.toFixed(1)} kg)
                          </span>
                        </div>
                      </div>

                      {/* Daily Water Intake */}
                      <div className="bg-green-50 rounded-xl p-4 border border-green-200">
                        <h3 className="font-semibold text-green-800 mb-2">Daily Water Goal</h3>
                        <div className="text-sm text-green-700">
                          <span className="font-medium" data-testid="text-daily-intake">
                            {formatIntake(result.dailyWaterIntake)} per day
                          </span>
                        </div>
                      </div>

                      {/* Recommendations */}
                      {result.recommendations.length > 0 && (
                        <div className="bg-orange-50 rounded-xl p-4 border border-orange-200">
                          <h3 className="font-semibold text-orange-800 mb-2">Recommendations</h3>
                          {result.recommendations.map((rec, index) => (
                            <p key={index} className="text-sm text-orange-700 mb-1" data-testid={`text-recommendation-${index}`}>
                              • {rec}
                            </p>
                          ))}
                        </div>
                      )}

                      {/* Body Water Ranges */}
                      <div className="mt-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-3">Normal Ranges</h3>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span>Men - Excellent</span>
                            <span className="text-green-600 font-medium">60-65%</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Men - Good</span>
                            <span className="text-blue-600 font-medium">55-60%</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Women - Excellent</span>
                            <span className="text-green-600 font-medium">55-60%</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Women - Good</span>
                            <span className="text-blue-600 font-medium">50-55%</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-16" data-testid="no-results">
                      <div className="w-20 h-20 bg-gray-200 rounded-full mx-auto mb-6 flex items-center justify-center">
                        <div className="text-3xl font-bold text-gray-400">TBW</div>
                      </div>
                      <p className="text-gray-500 text-lg">Enter your measurements and calculate to see body water results</p>
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
                <h3 className="text-2xl font-bold text-gray-900 mb-6">What is Total Body Water (TBW)?</h3>
                <div className="space-y-4 text-gray-600">
                  <p>
                    Total Body Water (TBW) represents the total amount of water in your body, typically expressed as a percentage 
                    of your total body weight. Water is the most abundant component of the human body, essential for virtually 
                    every physiological function including cellular metabolism, temperature regulation, joint lubrication, 
                    nutrient transport, and waste elimination.
                  </p>
                  <p>
                    Our body water percentage calculator uses the scientifically validated Watson formula to provide accurate 
                    TBW estimations. This formula considers age, gender, height, and weight to calculate your total body water 
                    content, helping you understand your hydration status and optimize your daily water intake for better health.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">How to Use Our Body Water Calculator</h3>
                <div className="space-y-4 text-gray-600">
                  <p>
                    Our body water percentage calculator is designed for precision and ease of use. Simply enter your weight, 
                    height, age, and gender using either metric or imperial units. Optionally, select your activity level for 
                    more personalized results, then click "Calculate Body Water" to get instant, comprehensive hydration analysis.
                  </p>
                  <div className="bg-blue-50 rounded-lg p-4">
                    <h4 className="font-semibold text-blue-800 mb-2">Watson Formula for Men</h4>
                    <p className="font-mono text-center text-sm text-blue-700 mb-2">
                      TBW = 2.447 - (0.09156 × Age) + (0.1074 × Height) + (0.3362 × Weight)
                    </p>
                    <h4 className="font-semibold text-blue-800 mb-2">Watson Formula for Women</h4>
                    <p className="font-mono text-center text-sm text-blue-700">
                      TBW = -2.097 + (0.1069 × Height) + (0.2466 × Weight)
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Normal Body Water Percentages by Demographics</h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <h4 className="font-semibold text-blue-800 mb-3">Men</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Excellent:</span>
                          <span className="font-medium text-green-600">60-65%</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Good:</span>
                          <span className="font-medium text-blue-600">55-60%</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Fair:</span>
                          <span className="font-medium text-orange-600">50-55%</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Low:</span>
                          <span className="font-medium text-red-600">Below 50%</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-4 bg-pink-50 rounded-lg">
                      <h4 className="font-semibold text-pink-800 mb-3">Women</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Excellent:</span>
                          <span className="font-medium text-green-600">55-60%</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Good:</span>
                          <span className="font-medium text-blue-600">50-55%</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Fair:</span>
                          <span className="font-medium text-orange-600">45-50%</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Low:</span>
                          <span className="font-medium text-red-600">Below 45%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mt-4">
                    These ranges are general guidelines for healthy adults. Individual variations exist based on body 
                    composition, fitness level, and health status.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Benefits of Body Water Monitoring</h3>
                <div className="space-y-3 text-gray-600">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Early detection of dehydration and overhydration</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Optimization of athletic performance and recovery</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Support for weight management and body composition goals</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Assessment of kidney function and fluid balance</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Monitoring health during illness or medical treatment</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Personalized hydration strategies for different life stages</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Additional SEO Content Sections */}
          <div className="mt-12 space-y-8">
            {/* Body Water Calculator Applications */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Body Water Calculator Applications</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-6">
                    <h4 className="text-lg font-semibold text-gray-900 mb-3">Athletic Performance</h4>
                    <p className="text-gray-600 text-sm">
                      Athletes use body water calculations to optimize hydration strategies, prevent dehydration during 
                      training, and enhance recovery. Proper hydration directly impacts endurance, strength, and cognitive function.
                    </p>
                  </div>
                  
                  <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg p-6">
                    <h4 className="text-lg font-semibold text-gray-900 mb-3">Medical Assessment</h4>
                    <p className="text-gray-600 text-sm">
                      Healthcare providers use TBW calculations for fluid management, medication dosing, kidney function 
                      assessment, and monitoring patients with conditions affecting fluid balance like heart failure or diabetes.
                    </p>
                  </div>
                  
                  <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-lg p-6">
                    <h4 className="text-lg font-semibold text-gray-900 mb-3">Wellness Tracking</h4>
                    <p className="text-gray-600 text-sm">
                      Wellness enthusiasts monitor body water percentage to maintain optimal hydration, support metabolic 
                      health, improve skin condition, and enhance overall well-being through proper fluid balance.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Factors Affecting Body Water */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Factors Affecting Body Water Percentage</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg">
                        <th className="text-left py-4 px-6 font-bold text-gray-900 rounded-l-lg">Factor</th>
                        <th className="text-left py-4 px-6 font-bold text-gray-900">Impact on TBW</th>
                        <th className="text-left py-4 px-6 font-bold text-gray-900">Explanation</th>
                        <th className="text-left py-4 px-6 font-bold text-gray-900 rounded-r-lg">Recommendations</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      <tr className="hover:bg-blue-50 transition-colors">
                        <td className="py-4 px-6 font-medium">Age</td>
                        <td className="py-4 px-6 text-gray-600">Decreases with age</td>
                        <td className="py-4 px-6 text-gray-600">Loss of muscle mass and cellular water content</td>
                        <td className="py-4 px-6 text-gray-600">Maintain muscle through exercise</td>
                      </tr>
                      <tr className="hover:bg-blue-50 transition-colors">
                        <td className="py-4 px-6 font-medium">Gender</td>
                        <td className="py-4 px-6 text-gray-600">Higher in males</td>
                        <td className="py-4 px-6 text-gray-600">Men have more muscle mass, less body fat</td>
                        <td className="py-4 px-6 text-gray-600">Consider gender-specific hydration needs</td>
                      </tr>
                      <tr className="hover:bg-blue-50 transition-colors">
                        <td className="py-4 px-6 font-medium">Body Composition</td>
                        <td className="py-4 px-6 text-gray-600">Varies significantly</td>
                        <td className="py-4 px-6 text-gray-600">Muscle is 75% water, fat is 20% water</td>
                        <td className="py-4 px-6 text-gray-600">Build lean muscle mass</td>
                      </tr>
                      <tr className="hover:bg-blue-50 transition-colors">
                        <td className="py-4 px-6 font-medium">Physical Activity</td>
                        <td className="py-4 px-6 text-gray-600">Increases needs</td>
                        <td className="py-4 px-6 text-gray-600">Exercise increases water loss through sweat</td>
                        <td className="py-4 px-6 text-gray-600">Adjust intake based on activity level</td>
                      </tr>
                      <tr className="hover:bg-blue-50 transition-colors">
                        <td className="py-4 px-6 font-medium">Health Status</td>
                        <td className="py-4 px-6 text-gray-600">Variable impact</td>
                        <td className="py-4 px-6 text-gray-600">Diseases affect fluid balance and regulation</td>
                        <td className="py-4 px-6 text-gray-600">Monitor with healthcare provider</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Hydration Guidelines and Tips */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
                <CardContent className="p-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">Optimal Hydration Guidelines</h3>
                  <div className="space-y-4 text-gray-600">
                    <div className="border-l-4 border-blue-400 pl-4 bg-blue-50 p-3 rounded-r-lg">
                      <h4 className="font-semibold text-blue-800 mb-2">Daily Water Intake</h4>
                      <p className="text-sm text-blue-700">General recommendation is 35ml per kg body weight, adjusted for activity level and climate.</p>
                    </div>
                    <div className="border-l-4 border-green-400 pl-4 bg-green-50 p-3 rounded-r-lg">
                      <h4 className="font-semibold text-green-800 mb-2">Hydration Timing</h4>
                      <p className="text-sm text-green-700">Spread water intake throughout the day rather than consuming large amounts at once.</p>
                    </div>
                    <div className="border-l-4 border-orange-400 pl-4 bg-orange-50 p-3 rounded-r-lg">
                      <h4 className="font-semibold text-orange-800 mb-2">Exercise Hydration</h4>
                      <p className="text-sm text-orange-700">Drink 500-600ml of water 2-3 hours before exercise, 200-300ml every 10-20 minutes during activity.</p>
                    </div>
                    <div className="border-l-4 border-purple-400 pl-4 bg-purple-50 p-3 rounded-r-lg">
                      <h4 className="font-semibold text-purple-800 mb-2">Quality Matters</h4>
                      <p className="text-sm text-purple-700">Choose clean, filtered water and include electrolytes during prolonged exercise or hot weather.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
                <CardContent className="p-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">Signs of Proper Hydration</h3>
                  <div className="space-y-4 text-gray-600">
                    <div className="bg-green-50 rounded-lg p-4">
                      <h4 className="font-semibold text-green-800 mb-2">Well-Hydrated Indicators</h4>
                      <ul className="text-sm text-green-700 space-y-1">
                        <li>• Pale yellow or clear urine</li>
                        <li>• Regular urination every 3-4 hours</li>
                        <li>• Good skin elasticity</li>
                        <li>• Steady energy levels</li>
                        <li>• Normal blood pressure</li>
                      </ul>
                    </div>
                    <div className="bg-red-50 rounded-lg p-4">
                      <h4 className="font-semibold text-red-800 mb-2">Dehydration Warning Signs</h4>
                      <ul className="text-sm text-red-700 space-y-1">
                        <li>• Dark yellow or amber urine</li>
                        <li>• Persistent thirst</li>
                        <li>• Fatigue and dizziness</li>
                        <li>• Dry mouth and lips</li>
                        <li>• Decreased urination</li>
                      </ul>
                    </div>
                    <div className="bg-blue-50 rounded-lg p-4">
                      <h4 className="font-semibold text-blue-800 mb-2">Overhydration Symptoms</h4>
                      <ul className="text-sm text-blue-700 space-y-1">
                        <li>• Very clear urine (like water)</li>
                        <li>• Frequent urination</li>
                        <li>• Nausea or vomiting</li>
                        <li>• Headache</li>
                        <li>• Confusion or irritability</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* FAQ Section */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-8">Frequently Asked Questions About Body Water Percentage</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">How accurate is the Watson formula for calculating TBW?</h4>
                      <p className="text-gray-600 text-sm">The Watson formula is considered the gold standard for TBW estimation, with accuracy rates of 95-98% when compared to dilution methods. It's widely used in clinical and research settings for its reliability and ease of use.</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">How often should I monitor my body water percentage?</h4>
                      <p className="text-gray-600 text-sm">For general health monitoring, weekly calculations are sufficient. Athletes or those managing medical conditions may benefit from daily monitoring. Consistency in timing and conditions improves result reliability.</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">Can body water percentage help with weight management?</h4>
                      <p className="text-gray-600 text-sm">Yes, monitoring TBW helps distinguish between water weight and fat loss during dieting. Proper hydration also supports metabolism, appetite regulation, and exercise performance, all crucial for healthy weight management.</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">What's the difference between intracellular and extracellular water?</h4>
                      <p className="text-gray-600 text-sm">Intracellular water (inside cells) comprises about 60% of TBW, while extracellular water (blood plasma, lymph, interstitial fluid) makes up 40%. Both are essential for proper cellular function and overall health.</p>
                    </div>
                  </div>
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">Does body water percentage change throughout the day?</h4>
                      <p className="text-gray-600 text-sm">Yes, TBW can fluctuate 1-3% daily due to fluid intake, physical activity, hormonal changes, and environmental factors. Morning measurements tend to be most consistent for tracking purposes.</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">How does aging affect body water content?</h4>
                      <p className="text-gray-600 text-sm">Body water percentage naturally decreases with age due to muscle mass loss and cellular changes. Adults over 65 may have 5-10% lower TBW than younger adults, requiring adjusted hydration strategies.</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">Can medications affect body water balance?</h4>
                      <p className="text-gray-600 text-sm">Yes, certain medications like diuretics, blood pressure medications, and some antidepressants can affect fluid balance. Always consult your healthcare provider about hydration needs when taking medications.</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">Is there a connection between body water and skin health?</h4>
                      <p className="text-gray-600 text-sm">Proper hydration is crucial for skin health, affecting elasticity, moisture content, and appearance. Well-hydrated skin appears more youthful and heals better from injuries or environmental damage.</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Scientific Background and Research */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Scientific Foundation of Body Water Calculations</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="space-y-4 text-gray-600">
                    <h4 className="text-lg font-semibold text-gray-900">Watson Formula Development</h4>
                    <p className="text-sm">
                      The Watson formula was developed through extensive research using deuterium dilution methods, considered 
                      the most accurate technique for measuring total body water. Published in 1980, it remains the standard 
                      for clinical TBW estimation due to its high correlation with direct measurement methods.
                    </p>
                    <p className="text-sm">
                      The formula accounts for gender differences in body composition, recognizing that men typically have 
                      higher muscle mass and lower body fat percentages, leading to higher water content per unit of body weight.
                    </p>
                    <h4 className="text-lg font-semibold text-gray-900">Clinical Applications</h4>
                    <p className="text-sm">
                      Medical professionals use TBW calculations for drug dosing, especially for water-soluble medications. 
                      Accurate TBW estimation is crucial in critical care, dialysis management, and fluid resuscitation protocols.
                    </p>
                  </div>
                  <div className="space-y-4 text-gray-600">
                    <h4 className="text-lg font-semibold text-gray-900">Research Validation</h4>
                    <p className="text-sm">
                      Multiple studies have validated the Watson formula across diverse populations, showing consistent 
                      accuracy across different ethnicities, age groups, and health conditions. The formula has been refined 
                      but maintains its core structure due to proven reliability.
                    </p>
                    <h4 className="text-lg font-semibold text-gray-900">Modern Applications</h4>
                    <p className="text-sm">
                      Today's body composition analyzers often use the Watson formula as a reference point, combining it with 
                      bioelectrical impedance analysis for comprehensive body composition assessment in fitness and medical settings.
                    </p>
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 mt-6">
                      <h4 className="font-semibold text-blue-800 mb-2">Research Insight</h4>
                      <p className="text-sm text-blue-700">
                        Studies show that maintaining optimal body water percentage can improve cognitive function, physical 
                        performance, and overall health outcomes, making TBW monitoring valuable for preventive healthcare.
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

export default BodyWaterPercentageCalculator;
