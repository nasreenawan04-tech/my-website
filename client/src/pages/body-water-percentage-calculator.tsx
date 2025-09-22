
import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ToolHeroSection from '@/components/ToolHeroSection';
import ShareResultsButton from '@/components/ShareResultsButton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Droplets, Info, TrendingUp, AlertTriangle } from 'lucide-react';

const BodyWaterPercentageCalculator = () => {
  const [age, setAge] = useState('');
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [gender, setGender] = useState('male');
  const [activityLevel, setActivityLevel] = useState('moderate');
  const [results, setResults] = useState<any>(null);
  const [errors, setErrors] = useState<any>({});

  const validateInputs = () => {
    const newErrors: any = {};
    
    if (!age || isNaN(Number(age)) || Number(age) < 1 || Number(age) > 120) {
      newErrors.age = 'Please enter a valid age between 1 and 120';
    }
    
    if (!weight || isNaN(Number(weight)) || Number(weight) < 20 || Number(weight) > 300) {
      newErrors.weight = 'Please enter a valid weight between 20 and 300 kg';
    }
    
    if (!height || isNaN(Number(height)) || Number(height) < 50 || Number(height) > 250) {
      newErrors.height = 'Please enter a valid height between 50 and 250 cm';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const calculateBodyWater = () => {
    if (!validateInputs()) return;

    const ageNum = Number(age);
    const weightNum = Number(weight);
    const heightNum = Number(height);

    // Watson formula for Total Body Water (TBW)
    let tbwLiters: number;
    
    if (gender === 'male') {
      tbwLiters = 2.447 - (0.09156 * ageNum) + (0.1074 * heightNum) + (0.3362 * weightNum);
    } else {
      tbwLiters = -2.097 + (0.1069 * heightNum) + (0.2466 * weightNum);
    }

    // Activity level adjustments
    const activityMultipliers = {
      sedentary: 0.95,
      light: 0.98,
      moderate: 1.0,
      active: 1.02,
      very_active: 1.05
    };

    tbwLiters *= activityMultipliers[activityLevel as keyof typeof activityMultipliers];

    const tbwPercentage = (tbwLiters / weightNum) * 100;
    const tbwKg = tbwLiters; // 1 liter = 1 kg for water

    // Calculate daily water intake recommendation
    const baseWaterIntake = weightNum * 35; // 35ml per kg body weight
    const dailyWaterIntake = Math.round(baseWaterIntake);

    // Determine hydration status
    let hydrationStatus = '';
    let statusColor = '';
    let recommendations = [];

    if (gender === 'male') {
      if (tbwPercentage >= 60) {
        hydrationStatus = 'Excellent';
        statusColor = 'text-green-600';
        recommendations.push('Maintain your excellent hydration levels');
      } else if (tbwPercentage >= 55) {
        hydrationStatus = 'Good';
        statusColor = 'text-blue-600';
        recommendations.push('Good hydration, maintain current intake');
      } else if (tbwPercentage >= 50) {
        hydrationStatus = 'Fair';
        statusColor = 'text-yellow-600';
        recommendations.push('Consider increasing water intake slightly');
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
      } else if (tbwPercentage >= 50) {
        hydrationStatus = 'Good';
        statusColor = 'text-blue-600';
        recommendations.push('Good hydration, maintain current intake');
      } else if (tbwPercentage >= 45) {
        hydrationStatus = 'Fair';
        statusColor = 'text-yellow-600';
        recommendations.push('Consider increasing water intake slightly');
      } else {
        hydrationStatus = 'Low';
        statusColor = 'text-red-600';
        recommendations.push('Increase water intake significantly');
        recommendations.push('Consult healthcare provider if persistent');
      }
    }

    setResults({
      tbwPercentage: Math.round(tbwPercentage * 10) / 10,
      tbwLiters: Math.round(tbwLiters * 10) / 10,
      tbwKg: Math.round(tbwKg * 10) / 10,
      dailyWaterIntake,
      hydrationStatus,
      statusColor,
      recommendations,
      gender,
      age: ageNum,
      weight: weightNum,
      height: heightNum,
      activityLevel
    });
  };

  const reset = () => {
    setAge('');
    setWeight('');
    setHeight('');
    setGender('male');
    setActivityLevel('moderate');
    setResults(null);
    setErrors({});
  };

  return (
    <>
      <Helmet>
        <title>Body Water Percentage Calculator - Free Health Tool | DapsiWow</title>
        <meta name="description" content="Calculate your total body water percentage with our free calculator. Monitor hydration levels, get personalized recommendations, and optimize your health with accurate Watson formula calculations." />
        <meta name="keywords" content="body water calculator, hydration calculator, total body water, TBW calculator, hydration percentage, water intake calculator, health tool" />
        <meta property="og:title" content="Body Water Percentage Calculator - Free Health Tool | DapsiWow" />
        <meta property="og:description" content="Calculate your total body water percentage and get personalized hydration recommendations for optimal health." />
        <meta property="og:type" content="website" />
        <link rel="canonical" href="https://dapsiwow.com/tools/body-water-percentage-calculator" />
      </Helmet>

      <div className="min-h-screen flex flex-col" data-testid="page-body-water-calculator">
        <Header />
        
        <ToolHeroSection
          title="Body Water Percentage Calculator"
          description="Calculate your total body water percentage and get personalized hydration recommendations for optimal health and wellness"
          testId="text-body-water-title"
        />

        <main className="flex-1 bg-neutral-50 py-12">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Calculator Card */}
              <Card className="shadow-lg">
                <CardHeader className="bg-gradient-to-r from-blue-500 to-cyan-600 text-white rounded-t-lg">
                  <CardTitle className="flex items-center text-xl">
                    <Droplets className="mr-2" size={24} />
                    Body Water Calculator
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="age">Age (years)</Label>
                        <Input
                          id="age"
                          type="number"
                          value={age}
                          onChange={(e) => setAge(e.target.value)}
                          placeholder="Enter your age"
                          className={errors.age ? 'border-red-500' : ''}
                          data-testid="input-age"
                        />
                        {errors.age && <p className="text-red-500 text-sm mt-1">{errors.age}</p>}
                      </div>

                      <div>
                        <Label htmlFor="gender">Gender</Label>
                        <select
                          id="gender"
                          value={gender}
                          onChange={(e) => setGender(e.target.value)}
                          className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          data-testid="select-gender"
                        >
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="weight">Weight (kg)</Label>
                        <Input
                          id="weight"
                          type="number"
                          value={weight}
                          onChange={(e) => setWeight(e.target.value)}
                          placeholder="Enter your weight"
                          className={errors.weight ? 'border-red-500' : ''}
                          data-testid="input-weight"
                        />
                        {errors.weight && <p className="text-red-500 text-sm mt-1">{errors.weight}</p>}
                      </div>

                      <div>
                        <Label htmlFor="height">Height (cm)</Label>
                        <Input
                          id="height"
                          type="number"
                          value={height}
                          onChange={(e) => setHeight(e.target.value)}
                          placeholder="Enter your height"
                          className={errors.height ? 'border-red-500' : ''}
                          data-testid="input-height"
                        />
                        {errors.height && <p className="text-red-500 text-sm mt-1">{errors.height}</p>}
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="activity">Activity Level</Label>
                      <select
                        id="activity"
                        value={activityLevel}
                        onChange={(e) => setActivityLevel(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        data-testid="select-activity"
                      >
                        <option value="sedentary">Sedentary (little/no exercise)</option>
                        <option value="light">Light (light exercise 1-3 days/week)</option>
                        <option value="moderate">Moderate (moderate exercise 3-5 days/week)</option>
                        <option value="active">Active (hard exercise 6-7 days/week)</option>
                        <option value="very_active">Very Active (very hard exercise, physical job)</option>
                      </select>
                    </div>

                    <div className="flex gap-3">
                      <Button 
                        onClick={calculateBodyWater} 
                        className="flex-1 bg-blue-600 hover:bg-blue-700"
                        data-testid="button-calculate"
                      >
                        Calculate Body Water
                      </Button>
                      <Button 
                        onClick={reset} 
                        variant="outline"
                        data-testid="button-reset"
                      >
                        Reset
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Results Card */}
              {results && (
                <Card className="shadow-lg">
                  <CardHeader className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-t-lg">
                    <CardTitle className="flex items-center text-xl">
                      <TrendingUp className="mr-2" size={24} />
                      Your Results
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="space-y-6">
                      {/* Main Result */}
                      <div className="text-center p-6 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg">
                        <div className="text-4xl font-bold text-blue-600 mb-2">
                          {results.tbwPercentage}%
                        </div>
                        <div className="text-lg text-gray-700 mb-2">Total Body Water</div>
                        <div className={`text-lg font-semibold ${results.statusColor}`}>
                          {results.hydrationStatus} Hydration
                        </div>
                      </div>

                      {/* Detailed Results */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-gray-50 rounded-lg text-center">
                          <div className="text-2xl font-bold text-gray-800">{results.tbwLiters}L</div>
                          <div className="text-sm text-gray-600">Water Volume</div>
                        </div>
                        <div className="p-4 bg-gray-50 rounded-lg text-center">
                          <div className="text-2xl font-bold text-gray-800">{results.dailyWaterIntake}ml</div>
                          <div className="text-sm text-gray-600">Daily Intake Goal</div>
                        </div>
                      </div>

                      {/* Recommendations */}
                      <div>
                        <h3 className="text-lg font-semibold mb-3 flex items-center">
                          <Info className="mr-2" size={20} />
                          Recommendations
                        </h3>
                        <ul className="space-y-2">
                          {results.recommendations.map((rec: string, index: number) => (
                            <li key={index} className="flex items-start">
                              <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                              <span className="text-gray-700">{rec}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <ShareResultsButton
                        toolId="body-water-percentage-calculator"
                        results={results}
                        className="w-full"
                      />
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Educational Content */}
            <div className="mt-12 space-y-8">
              <Card className="shadow-lg">
                <CardContent className="p-8">
                  <h2 className="text-2xl font-bold mb-6 text-gray-800">Understanding Body Water Percentage</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <h3 className="text-xl font-semibold mb-4 text-blue-600">What is Total Body Water?</h3>
                      <p className="text-gray-700 mb-4">
                        Total Body Water (TBW) represents the total amount of water in your body, typically expressed as a percentage of your total body weight. Water is essential for virtually every bodily function, including temperature regulation, joint lubrication, nutrient transport, and waste removal.
                      </p>
                      <p className="text-gray-700">
                        The human body is approximately 50-70% water, depending on factors like age, gender, body composition, and overall health. Maintaining optimal hydration levels is crucial for peak physical and mental performance.
                      </p>
                    </div>

                    <div>
                      <h3 className="text-xl font-semibold mb-4 text-blue-600">Normal Ranges</h3>
                      <div className="space-y-3">
                        <div className="p-3 bg-blue-50 rounded-lg">
                          <strong className="text-blue-800">Men:</strong>
                          <div className="text-sm text-gray-700 mt-1">
                            • Optimal: 60-65%<br/>
                            • Good: 55-60%<br/>
                            • Fair: 50-55%<br/>
                            • Low: Below 50%
                          </div>
                        </div>
                        <div className="p-3 bg-pink-50 rounded-lg">
                          <strong className="text-pink-800">Women:</strong>
                          <div className="text-sm text-gray-700 mt-1">
                            • Optimal: 55-60%<br/>
                            • Good: 50-55%<br/>
                            • Fair: 45-50%<br/>
                            • Low: Below 45%
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-lg">
                <CardContent className="p-8">
                  <h2 className="text-2xl font-bold mb-6 text-gray-800">Factors Affecting Body Water Percentage</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="p-4 border border-gray-200 rounded-lg">
                      <h3 className="text-lg font-semibold mb-3 text-green-600">Age</h3>
                      <p className="text-gray-700 text-sm">
                        Body water percentage naturally decreases with age. Infants have the highest percentage (about 75%), while elderly adults typically have lower percentages due to decreased muscle mass.
                      </p>
                    </div>

                    <div className="p-4 border border-gray-200 rounded-lg">
                      <h3 className="text-lg font-semibold mb-3 text-purple-600">Gender</h3>
                      <p className="text-gray-700 text-sm">
                        Men typically have higher body water percentages than women due to greater muscle mass and lower body fat percentage. Muscle tissue contains more water than fat tissue.
                      </p>
                    </div>

                    <div className="p-4 border border-gray-200 rounded-lg">
                      <h3 className="text-lg font-semibold mb-3 text-orange-600">Body Composition</h3>
                      <p className="text-gray-700 text-sm">
                        Muscle tissue is about 75% water, while fat tissue is only about 20% water. Higher muscle mass correlates with higher body water percentage.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-lg">
                <CardContent className="p-8">
                  <h2 className="text-2xl font-bold mb-6 text-gray-800">Tips for Optimal Hydration</h2>
                  
                  <div className="space-y-4">
                    <Alert>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        <strong>Important:</strong> This calculator provides estimates based on the Watson formula. For medical concerns about hydration or if you have health conditions affecting fluid balance, consult with a healthcare professional.
                      </AlertDescription>
                    </Alert>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                      <div>
                        <h3 className="text-lg font-semibold mb-3 text-blue-600">Daily Hydration Tips</h3>
                        <ul className="space-y-2 text-gray-700">
                          <li>• Drink water consistently throughout the day</li>
                          <li>• Monitor urine color (pale yellow is ideal)</li>
                          <li>• Increase intake during exercise or hot weather</li>
                          <li>• Include water-rich foods in your diet</li>
                          <li>• Limit excessive caffeine and alcohol</li>
                        </ul>
                      </div>

                      <div>
                        <h3 className="text-lg font-semibold mb-3 text-green-600">Signs of Good Hydration</h3>
                        <ul className="space-y-2 text-gray-700">
                          <li>• Clear to pale yellow urine</li>
                          <li>• Minimal thirst</li>
                          <li>• Good energy levels</li>
                          <li>• Healthy skin elasticity</li>
                          <li>• Regular urination (every 3-4 hours)</li>
                        </ul>
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
    </>
  );
};

export default BodyWaterPercentageCalculator;
