
import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface BloodPressureReading {
  systolic: number;
  diastolic: number;
  pulse?: number;
  timestamp: string;
  category: string;
  risk: string;
}

interface BloodPressureResult {
  systolic: number;
  diastolic: number;
  pulse?: number;
  category: string;
  risk: string;
  color: string;
  recommendations: string[];
  targetRanges: {
    systolic: string;
    diastolic: string;
  };
}

const BloodPressureTracker = () => {
  const [systolic, setSystolic] = useState('');
  const [diastolic, setDiastolic] = useState('');
  const [pulse, setPulse] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [result, setResult] = useState<BloodPressureResult | null>(null);
  const [readings, setReadings] = useState<BloodPressureReading[]>([]);

  const calculateBloodPressure = () => {
    const systolicNum = parseFloat(systolic);
    const diastolicNum = parseFloat(diastolic);
    const pulseNum = pulse ? parseFloat(pulse) : undefined;

    if (systolicNum && diastolicNum && systolicNum > 0 && diastolicNum > 0) {
      let category: string;
      let risk: string;
      let color: string;
      let recommendations: string[] = [];

      // Blood pressure classification according to AHA guidelines
      if (systolicNum < 120 && diastolicNum < 80) {
        category = 'Normal';
        risk = 'Low Risk';
        color = 'text-green-600';
        recommendations = [
          'Maintain healthy lifestyle habits',
          'Regular physical activity (150 min/week)',
          'Maintain healthy weight',
          'Limit sodium intake',
          'Monitor annually'
        ];
      } else if (systolicNum >= 120 && systolicNum <= 129 && diastolicNum < 80) {
        category = 'Elevated';
        risk = 'Increased Risk';
        color = 'text-yellow-600';
        recommendations = [
          'Lifestyle modifications recommended',
          'Increase physical activity',
          'DASH diet (low sodium, high potassium)',
          'Weight management if overweight',
          'Monitor every 3-6 months'
        ];
      } else if ((systolicNum >= 130 && systolicNum <= 139) || (diastolicNum >= 80 && diastolicNum <= 89)) {
        category = 'High Blood Pressure Stage 1';
        risk = 'Moderate Risk';
        color = 'text-orange-600';
        recommendations = [
          'Lifestyle changes and possibly medication',
          'Consult healthcare provider',
          'DASH diet and sodium restriction',
          'Regular aerobic exercise',
          'Monitor every 1-3 months'
        ];
      } else if ((systolicNum >= 140 && systolicNum <= 180) || (diastolicNum >= 90 && diastolicNum <= 120)) {
        category = 'High Blood Pressure Stage 2';
        risk = 'High Risk';
        color = 'text-red-600';
        recommendations = [
          'Medication typically required',
          'Immediate medical consultation advised',
          'Aggressive lifestyle modifications',
          'Regular monitoring and follow-up',
          'Monthly check-ups initially'
        ];
      } else if (systolicNum > 180 || diastolicNum > 120) {
        category = 'Hypertensive Crisis';
        risk = 'Emergency';
        color = 'text-red-800';
        recommendations = [
          '⚠️ SEEK IMMEDIATE MEDICAL ATTENTION',
          'Call emergency services if symptoms present',
          'Do not wait - this is a medical emergency',
          'Symptoms may include severe headache, chest pain, difficulty breathing'
        ];
      } else {
        category = 'Invalid Reading';
        risk = 'Unknown';
        color = 'text-gray-600';
        recommendations = ['Please check your measurements and try again'];
      }

      // Determine target ranges based on age
      const ageNum = age ? parseFloat(age) : 40;
      let targetSystolic = 'Less than 120';
      let targetDiastolic = 'Less than 80';

      if (ageNum >= 65) {
        targetSystolic = 'Less than 130';
        targetDiastolic = 'Less than 80';
      }

      const newResult: BloodPressureResult = {
        systolic: systolicNum,
        diastolic: diastolicNum,
        pulse: pulseNum,
        category,
        risk,
        color,
        recommendations,
        targetRanges: {
          systolic: targetSystolic,
          diastolic: targetDiastolic
        }
      };

      setResult(newResult);

      // Add to readings history
      const newReading: BloodPressureReading = {
        systolic: systolicNum,
        diastolic: diastolicNum,
        pulse: pulseNum,
        timestamp: new Date().toLocaleString(),
        category,
        risk
      };

      setReadings(prev => [newReading, ...prev.slice(0, 4)]); // Keep last 5 readings
    }
  };

  const resetCalculator = () => {
    setSystolic('');
    setDiastolic('');
    setPulse('');
    setAge('');
    setGender('');
    setResult(null);
  };

  const clearHistory = () => {
    setReadings([]);
  };

  const getCategoryColor = (category: string) => {
    if (category === 'Normal') return 'text-green-600';
    if (category === 'Elevated') return 'text-yellow-600';
    if (category.includes('Stage 1')) return 'text-orange-600';
    if (category.includes('Stage 2')) return 'text-red-600';
    if (category.includes('Crisis')) return 'text-red-800';
    return 'text-gray-600';
  };

  const getCategoryBgColor = (category: string) => {
    if (category === 'Normal') return 'bg-green-50 border-l-green-500';
    if (category === 'Elevated') return 'bg-yellow-50 border-l-yellow-500';
    if (category.includes('Stage 1')) return 'bg-orange-50 border-l-orange-500';
    if (category.includes('Stage 2')) return 'bg-red-50 border-l-red-500';
    if (category.includes('Crisis')) return 'bg-red-100 border-l-red-800';
    return 'bg-gray-50 border-l-gray-500';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Helmet>
        <title>Blood Pressure Tracker - Monitor & Track Blood Pressure | DapsiWow</title>
        <meta name="description" content="Free blood pressure tracker to monitor and track your blood pressure readings. Get instant blood pressure classification, health recommendations, and track your readings over time. Professional blood pressure monitoring tool with AHA guidelines." />
        <meta name="keywords" content="blood pressure tracker, blood pressure monitor, hypertension calculator, blood pressure classification, systolic diastolic, blood pressure chart, BP monitor, heart health tracker, AHA guidelines" />
        <meta property="og:title" content="Blood Pressure Tracker - Monitor & Track Blood Pressure | DapsiWow" />
        <meta property="og:description" content="Professional blood pressure tracking tool with instant classification and health recommendations based on AHA guidelines." />
        <meta property="og:type" content="website" />
        <meta name="robots" content="index, follow" />
        <meta name="author" content="DapsiWow" />
        <link rel="canonical" href="https://dapsiwow.com/tools/blood-pressure-tracker" />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            "name": "Blood Pressure Tracker",
            "description": "Free online blood pressure tracker to monitor and track blood pressure readings with instant classification based on AHA guidelines. Get health recommendations and track your readings over time.",
            "url": "https://dapsiwow.com/tools/blood-pressure-tracker",
            "applicationCategory": "HealthApplication",
            "operatingSystem": "Any",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "USD"
            },
            "featureList": [
              "Blood pressure classification",
              "AHA guideline compliance",
              "Reading history tracking",
              "Health recommendations",
              "Risk assessment",
              "Target range calculations"
            ]
          })}
        </script>
      </Helmet>
      
      <Header />
      
      <main>
        {/* Hero Section */}
        <section className="relative py-20 sm:py-28 lg:py-32 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-rose-600/10 to-red-600/20"></div>
          <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="space-y-8">
              <div className="inline-flex items-center px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full border border-rose-200">
                <span className="text-sm font-medium text-rose-700">Professional Blood Pressure Tracker</span>
              </div>
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-slate-900 leading-tight">
                Smart Blood Pressure
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-rose-600 to-red-600">
                  Tracker
                </span>
              </h1>
              <p className="text-xl sm:text-2xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
                Monitor and track your blood pressure readings with instant classification and personalized health recommendations
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
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">Blood Pressure Configuration</h2>
                    <p className="text-gray-600">Enter your blood pressure readings to get accurate health assessments</p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Systolic Pressure */}
                    <div className="space-y-3">
                      <Label htmlFor="systolic" className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                        Systolic Pressure
                      </Label>
                      <div className="relative">
                        <Input
                          id="systolic"
                          type="number"
                          value={systolic}
                          onChange={(e) => setSystolic(e.target.value)}
                          className="h-14 pr-16 text-lg border-2 border-gray-200 rounded-xl focus:border-rose-500 focus:ring-rose-500"
                          placeholder="120"
                          min="60"
                          max="250"
                          data-testid="input-systolic"
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 text-lg">mmHg</span>
                      </div>
                      <p className="text-xs text-gray-500">Upper number when heart beats</p>
                    </div>

                    {/* Diastolic Pressure */}
                    <div className="space-y-3">
                      <Label htmlFor="diastolic" className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                        Diastolic Pressure
                      </Label>
                      <div className="relative">
                        <Input
                          id="diastolic"
                          type="number"
                          value={diastolic}
                          onChange={(e) => setDiastolic(e.target.value)}
                          className="h-14 pr-16 text-lg border-2 border-gray-200 rounded-xl focus:border-rose-500 focus:ring-rose-500"
                          placeholder="80"
                          min="40"
                          max="150"
                          data-testid="input-diastolic"
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 text-lg">mmHg</span>
                      </div>
                      <p className="text-xs text-gray-500">Lower number when heart rests</p>
                    </div>

                    {/* Pulse Rate */}
                    <div className="space-y-3">
                      <Label htmlFor="pulse" className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                        Pulse Rate <span className="text-gray-400 font-normal">- Optional</span>
                      </Label>
                      <div className="relative">
                        <Input
                          id="pulse"
                          type="number"
                          value={pulse}
                          onChange={(e) => setPulse(e.target.value)}
                          className="h-14 pr-12 text-lg border-2 border-gray-200 rounded-xl focus:border-rose-500 focus:ring-rose-500"
                          placeholder="70"
                          min="40"
                          max="200"
                          data-testid="input-pulse"
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 text-lg">bpm</span>
                      </div>
                      <p className="text-xs text-gray-500">Heart rate during measurement</p>
                    </div>

                    {/* Age */}
                    <div className="space-y-3">
                      <Label htmlFor="age" className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                        Age <span className="text-gray-400 font-normal">- Optional</span>
                      </Label>
                      <Input
                        id="age"
                        type="number"
                        value={age}
                        onChange={(e) => setAge(e.target.value)}
                        className="h-14 text-lg border-2 border-gray-200 rounded-xl focus:border-rose-500 focus:ring-rose-500"
                        placeholder="40"
                        min="18"
                        max="120"
                        data-testid="input-age"
                      />
                      <p className="text-xs text-gray-500">Helps determine target ranges</p>
                    </div>
                  </div>

                  {/* Gender Selection */}
                  <div className="space-y-3">
                    <Label className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                      Gender <span className="text-gray-400 font-normal">- Optional</span>
                    </Label>
                    <Select value={gender} onValueChange={setGender}>
                      <SelectTrigger className="h-14 border-2 border-gray-200 rounded-xl text-lg" data-testid="select-gender">
                        <SelectValue placeholder="Select gender for personalized recommendations" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Measurement Tips */}
                  <div className="space-y-6 border-t pt-8">
                    <h3 className="text-xl font-bold text-gray-900">Measurement Guidelines</h3>
                    <div className="bg-gray-50 rounded-xl p-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <h4 className="font-semibold text-gray-800">Before Measuring:</h4>
                          <ul className="text-sm text-gray-600 space-y-1">
                            <li>• Sit quietly for 5 minutes</li>
                            <li>• Avoid caffeine and exercise</li>
                            <li>• Use bathroom if needed</li>
                            <li>• Remove tight clothing</li>
                          </ul>
                        </div>
                        <div className="space-y-2">
                          <h4 className="font-semibold text-gray-800">During Measurement:</h4>
                          <ul className="text-sm text-gray-600 space-y-1">
                            <li>• Sit with back supported</li>
                            <li>• Keep feet flat on floor</li>
                            <li>• Use proper cuff size</li>
                            <li>• Take 2-3 readings</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-4 pt-6">
                    <Button
                      onClick={calculateBloodPressure}
                      className="flex-1 h-14 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-700 hover:to-red-700 text-white font-semibold text-lg rounded-xl shadow-lg transform transition-all duration-200 hover:scale-105"
                      data-testid="button-calculate"
                    >
                      Track Blood Pressure
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

                  {/* Clear History */}
                  {readings.length > 0 && (
                    <div className="flex justify-end pt-4">
                      <Button
                        onClick={clearHistory}
                        variant="outline"
                        size="sm"
                        className="rounded-full"
                        data-testid="button-clear-history"
                      >
                        Clear Reading History
                      </Button>
                    </div>
                  )}
                </div>

                {/* Results Section */}
                <div className="bg-gradient-to-br from-gray-50 to-rose-50 p-8 lg:p-12">
                  <h2 className="text-2xl font-bold text-gray-900 mb-8">Blood Pressure Results</h2>
                  
                  {result ? (
                    <div className="space-y-6" data-testid="blood-pressure-results">
                      {/* Main Reading Highlight */}
                      <div className="bg-white rounded-2xl p-6 shadow-lg border border-rose-100">
                        <div className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-2">Blood Pressure Reading</div>
                        <div className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-rose-600 to-red-600 mb-2" data-testid="text-bp-reading">
                          {result.systolic}/{result.diastolic} mmHg
                        </div>
                        {result.pulse && (
                          <div className="text-lg text-gray-600">Pulse: {result.pulse} bpm</div>
                        )}
                      </div>

                      {/* Category and Risk */}
                      <div className="space-y-4">
                        <div className="bg-white rounded-xl p-4 shadow-sm">
                          <div className="flex justify-between items-center">
                            <span className="font-medium text-gray-700">Category</span>
                            <span className={`font-bold ${result.color}`} data-testid="text-bp-category">
                              {result.category}
                            </span>
                          </div>
                        </div>
                        <div className="bg-white rounded-xl p-4 shadow-sm">
                          <div className="flex justify-between items-center">
                            <span className="font-medium text-gray-700">Risk Level</span>
                            <span className={`font-bold ${result.color}`} data-testid="text-bp-risk">
                              {result.risk}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Target Ranges */}
                      <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
                        <h4 className="font-bold text-green-800 mb-4 text-lg">Target Ranges</h4>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-green-700 font-medium">Systolic:</span>
                            <span className="font-bold text-green-800" data-testid="text-target-systolic">
                              {result.targetRanges.systolic} mmHg
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-green-700 font-medium">Diastolic:</span>
                            <span className="font-bold text-green-800" data-testid="text-target-diastolic">
                              {result.targetRanges.diastolic} mmHg
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Recommendations */}
                      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
                        <h4 className="font-bold text-blue-800 mb-4 text-lg">Health Recommendations</h4>
                        <div className="space-y-2">
                          {result.recommendations.map((rec, index) => (
                            <div key={index} className="flex items-start text-blue-700">
                              <span className="mr-2 text-blue-500">•</span>
                              <span className="text-sm">{rec}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-16" data-testid="no-results">
                      <div className="w-20 h-20 bg-gray-200 rounded-full mx-auto mb-6 flex items-center justify-center">
                        <div className="text-3xl font-bold text-gray-400">BP</div>
                      </div>
                      <p className="text-gray-500 text-lg">Enter blood pressure readings to get started</p>
                    </div>
                  )}

                  {/* Reading History */}
                  {readings.length > 0 && (
                    <div className="mt-8">
                      <h3 className="text-lg font-bold text-gray-900 mb-4">Recent Readings</h3>
                      <div className="space-y-3">
                        {readings.map((reading, index) => (
                          <div key={index} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                            <div className="flex justify-between items-center mb-2">
                              <span className="font-bold text-gray-900">
                                {reading.systolic}/{reading.diastolic} mmHg
                                {reading.pulse && ` • ${reading.pulse} bpm`}
                              </span>
                              <span className={getCategoryColor(reading.category)}>
                                {reading.category}
                              </span>
                            </div>
                            <p className="text-sm text-gray-500">{reading.timestamp}</p>
                          </div>
                        ))}
                      </div>
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
                <h3 className="text-2xl font-bold text-gray-900 mb-6">What is Blood Pressure?</h3>
                <div className="space-y-4 text-gray-600">
                  <p>
                    Blood pressure is the force of blood pushing against the walls of your arteries as your heart pumps blood throughout your body. It's measured with two numbers: systolic pressure (when your heart beats) and diastolic pressure (when your heart rests between beats).
                  </p>
                  <p>
                    Our blood pressure tracker helps you monitor and track your readings over time, providing instant classification based on American Heart Association guidelines and personalized health recommendations to help you maintain optimal cardiovascular health.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Understanding Blood Pressure Readings</h3>
                <div className="space-y-4 text-gray-600">
                  <p>
                    Blood pressure is recorded as two numbers, like 120/80 mmHg. The systolic pressure (top number) measures the force when your heart contracts, while the diastolic pressure (bottom number) measures the force when your heart relaxes.
                  </p>
                  <p>
                    Regular monitoring helps detect changes early and allows for timely intervention. Our tracker uses the latest AHA guidelines to classify your readings and provide appropriate health recommendations for your specific situation.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Features of Our Blood Pressure Tracker</h3>
                <div className="space-y-3 text-gray-600">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-rose-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Instant blood pressure classification based on AHA guidelines</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-rose-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Personalized health recommendations for each category</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-rose-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Reading history tracking to monitor trends</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-rose-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Age-based target range calculations</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-rose-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Risk assessment for cardiovascular health</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Benefits of Blood Pressure Monitoring</h3>
                <div className="space-y-3 text-gray-600">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Early detection of hypertension and cardiovascular risks</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Track progress of lifestyle changes and medications</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Better communication with healthcare providers</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Motivation to maintain healthy lifestyle habits</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Free tool with no registration required</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Blood Pressure Categories Section */}
          <div className="mt-12 space-y-8">
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Blood Pressure Categories (American Heart Association)</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-r-lg">
                      <h4 className="font-semibold text-green-800 mb-2">Normal Blood Pressure</h4>
                      <p className="text-green-700 text-sm mb-2">Less than 120/80 mmHg</p>
                      <p className="text-green-600 text-xs">Maintain healthy lifestyle habits with regular exercise, balanced diet, and stress management.</p>
                    </div>
                    <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded-r-lg">
                      <h4 className="font-semibold text-yellow-800 mb-2">Elevated Blood Pressure</h4>
                      <p className="text-yellow-700 text-sm mb-2">120-129 systolic, less than 80 diastolic</p>
                      <p className="text-yellow-600 text-xs">Focus on lifestyle modifications including diet changes, increased physical activity, and weight management.</p>
                    </div>
                    <div className="bg-orange-50 border-l-4 border-orange-500 p-4 rounded-r-lg">
                      <h4 className="font-semibold text-orange-800 mb-2">High Blood Pressure Stage 1</h4>
                      <p className="text-orange-700 text-sm mb-2">130-139 systolic or 80-89 diastolic</p>
                      <p className="text-orange-600 text-xs">Lifestyle changes recommended, medication may be considered based on cardiovascular risk factors.</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg">
                      <h4 className="font-semibold text-red-800 mb-2">High Blood Pressure Stage 2</h4>
                      <p className="text-red-700 text-sm mb-2">140/90 mmHg or higher</p>
                      <p className="text-red-600 text-xs">Medication typically required along with aggressive lifestyle modifications and regular monitoring.</p>
                    </div>
                    <div className="bg-red-100 border-l-4 border-red-800 p-4 rounded-r-lg">
                      <h4 className="font-semibold text-red-900 mb-2">Hypertensive Crisis</h4>
                      <p className="text-red-800 text-sm mb-2">Higher than 180/120 mmHg</p>
                      <p className="text-red-700 text-xs">Seek immediate medical attention. This is a medical emergency requiring prompt treatment.</p>
                    </div>
                    <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg">
                      <h4 className="font-semibold text-blue-800 mb-2">Important Note</h4>
                      <p className="text-blue-600 text-xs">Blood pressure can vary throughout the day. Take multiple readings and consult healthcare providers for proper diagnosis and treatment planning.</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Lifestyle and Management Tips */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
                <CardContent className="p-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">Lifestyle Changes for Blood Pressure Management</h3>
                  <div className="space-y-4 text-gray-600">
                    <div className="bg-blue-50 rounded-lg p-4">
                      <h4 className="font-semibold text-blue-800 mb-2">DASH Diet</h4>
                      <p className="text-sm text-blue-700">Focus on fruits, vegetables, whole grains, lean proteins, and low-fat dairy. Limit sodium, saturated fats, and added sugars.</p>
                    </div>
                    <div className="bg-green-50 rounded-lg p-4">
                      <h4 className="font-semibold text-green-800 mb-2">Regular Exercise</h4>
                      <p className="text-sm text-green-700">Aim for 150 minutes of moderate aerobic activity or 75 minutes of vigorous activity weekly, plus muscle-strengthening exercises.</p>
                    </div>
                    <div className="bg-orange-50 rounded-lg p-4">
                      <h4 className="font-semibold text-orange-800 mb-2">Weight Management</h4>
                      <p className="text-sm text-orange-700">Maintain a healthy weight (BMI 18.5-24.9). Even small weight loss can significantly impact blood pressure.</p>
                    </div>
                    <div className="bg-purple-50 rounded-lg p-4">
                      <h4 className="font-semibold text-purple-800 mb-2">Stress Management</h4>
                      <p className="text-sm text-purple-700">Practice relaxation techniques, meditation, deep breathing, or yoga to help manage stress levels effectively.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
                <CardContent className="p-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">Blood Pressure Monitoring Best Practices</h3>
                  <div className="space-y-4 text-gray-600">
                    <div className="border-l-4 border-blue-500 pl-4">
                      <h4 className="font-semibold text-gray-800 mb-2">Timing and Frequency</h4>
                      <p className="text-sm">Measure at the same time daily, preferably morning and evening. Take readings before medications and meals.</p>
                    </div>
                    <div className="border-l-4 border-green-500 pl-4">
                      <h4 className="font-semibold text-gray-800 mb-2">Proper Technique</h4>
                      <p className="text-sm">Use validated monitors, proper cuff size, and follow manufacturer instructions. Sit quietly for 5 minutes before measuring.</p>
                    </div>
                    <div className="border-l-4 border-orange-500 pl-4">
                      <h4 className="font-semibold text-gray-800 mb-2">Record Keeping</h4>
                      <p className="text-sm">Track readings over time to identify patterns. Share logs with healthcare providers for better treatment decisions.</p>
                    </div>
                    <div className="border-l-4 border-purple-500 pl-4">
                      <h4 className="font-semibold text-gray-800 mb-2">Medical Consultation</h4>
                      <p className="text-sm">Regular check-ups with healthcare providers are essential, especially if readings are consistently elevated or showing concerning trends.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Risk Factors and Prevention */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-8">Blood Pressure Risk Factors and Prevention Strategies</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-lg font-semibold text-gray-800 mb-4">Modifiable Risk Factors</h4>
                      <ul className="text-gray-600 space-y-2 text-sm">
                        <li>• Unhealthy diet high in sodium and saturated fats</li>
                        <li>• Physical inactivity and sedentary lifestyle</li>
                        <li>• Excess weight and obesity</li>
                        <li>• Excessive alcohol consumption</li>
                        <li>• Smoking and tobacco use</li>
                        <li>• Chronic stress and poor stress management</li>
                        <li>• Inadequate sleep quality and duration</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-gray-800 mb-4">Prevention Strategies</h4>
                      <ul className="text-gray-600 space-y-2 text-sm">
                        <li>• Follow DASH diet principles consistently</li>
                        <li>• Limit sodium intake to less than 2,300mg daily</li>
                        <li>• Engage in regular physical activity</li>
                        <li>• Maintain healthy body weight</li>
                        <li>• Limit alcohol to moderate amounts</li>
                        <li>• Avoid tobacco products completely</li>
                        <li>• Practice stress reduction techniques</li>
                      </ul>
                    </div>
                  </div>
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-lg font-semibold text-gray-800 mb-4">Non-Modifiable Risk Factors</h4>
                      <ul className="text-gray-600 space-y-2 text-sm">
                        <li>• Age (risk increases with age)</li>
                        <li>• Family history of hypertension</li>
                        <li>• Gender (varies by age group)</li>
                        <li>• Race and ethnicity factors</li>
                        <li>• Chronic kidney disease</li>
                        <li>• Diabetes and metabolic disorders</li>
                        <li>• Sleep apnea and breathing disorders</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-gray-800 mb-4">When to Seek Medical Help</h4>
                      <ul className="text-gray-600 space-y-2 text-sm">
                        <li>• Consistently elevated readings (130/80 or higher)</li>
                        <li>• Sudden spike in blood pressure</li>
                        <li>• Symptoms like severe headache or chest pain</li>
                        <li>• Difficulty breathing or vision changes</li>
                        <li>• Family history of cardiovascular disease</li>
                        <li>• Existing health conditions affecting blood pressure</li>
                        <li>• Need for medication adjustment or monitoring</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* FAQs Section */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-8">Frequently Asked Questions about Blood Pressure</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">What causes high blood pressure?</h4>
                      <p className="text-gray-600 text-sm">High blood pressure can result from multiple factors including genetics, diet, lifestyle, age, and underlying health conditions. Most cases are primary hypertension with no identifiable cause.</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">How often should I check my blood pressure?</h4>
                      <p className="text-gray-600 text-sm">For normal blood pressure, annual checks are sufficient. For elevated or high blood pressure, daily monitoring may be recommended by your healthcare provider.</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">Can blood pressure vary throughout the day?</h4>
                      <p className="text-gray-600 text-sm">Yes, blood pressure naturally fluctuates throughout the day, typically lower during sleep and higher in the morning. Stress, activity, and meals can also affect readings.</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">What's considered normal blood pressure?</h4>
                      <p className="text-gray-600 text-sm">Normal blood pressure is less than 120/80 mmHg. Readings between 120-129 systolic with diastolic less than 80 are considered elevated.</p>
                    </div>
                  </div>
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">Can lifestyle changes replace blood pressure medication?</h4>
                      <p className="text-gray-600 text-sm">Lifestyle changes can significantly impact blood pressure, but medication decisions should always be made with healthcare providers. Never stop medications without medical supervision.</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">What's the difference between systolic and diastolic pressure?</h4>
                      <p className="text-gray-600 text-sm">Systolic (top number) measures pressure when your heart beats, while diastolic (bottom number) measures pressure when your heart rests between beats.</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">Are home blood pressure monitors accurate?</h4>
                      <p className="text-gray-600 text-sm">Validated home monitors can be very accurate when used properly. Look for devices validated by medical organizations and ensure proper cuff size and technique.</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">What should I do if my blood pressure is high?</h4>
                      <p className="text-gray-600 text-sm">Consult your healthcare provider for proper evaluation and treatment plan. In the meantime, focus on healthy lifestyle habits and monitor readings regularly.</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Disclaimer */}
            <Card className="bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 rounded-2xl">
              <CardContent className="p-8 text-center">
                <h3 className="text-xl font-bold text-orange-800 mb-4">Important Medical Disclaimer</h3>
                <p className="text-orange-700 text-sm leading-relaxed">
                  This blood pressure tracker is for informational and educational purposes only. It should not be used as a substitute for professional medical advice, diagnosis, or treatment. Always consult with qualified healthcare providers regarding blood pressure concerns, medication adjustments, or treatment decisions. In case of emergency symptoms or blood pressure crisis (readings above 180/120 mmHg with symptoms), seek immediate medical attention.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default BloodPressureTracker;
