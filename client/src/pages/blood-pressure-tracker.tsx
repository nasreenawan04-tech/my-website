import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calculator, Activity } from 'lucide-react';

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
    <>
      <Helmet>
        <title>Blood Pressure Tracker - Monitor & Track Blood Pressure | DapsiWow</title>
        <meta name="description" content="Track and monitor your blood pressure readings. Get instant blood pressure classification, health recommendations, and track your readings over time." />
        <meta name="keywords" content="blood pressure tracker, blood pressure monitor, hypertension calculator, blood pressure classification, systolic diastolic" />
        <meta property="og:title" content="Blood Pressure Tracker - Monitor & Track Blood Pressure | DapsiWow" />
        <meta property="og:description" content="Professional blood pressure tracking tool with instant classification and health recommendations." />
        <meta property="og:type" content="website" />
        <link rel="canonical" href="/tools/blood-pressure-tracker" />
      </Helmet>

      <div className="min-h-screen flex flex-col" data-testid="page-blood-pressure-tracker">
        <Header />
        
        <main className="flex-1 bg-neutral-50">
          {/* Hero Section */}
          <section className="text-white py-16" style={{ background: 'linear-gradient(135deg, #f43f5e 0%, #e11d48 100%)' }}>
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <div className="w-20 h-20 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Activity className="w-10 h-10" />
              </div>
              <h1 className="text-4xl sm:text-5xl font-bold mb-6" data-testid="text-page-title">
                Blood Pressure Tracker
              </h1>
              <p className="text-xl text-blue-100 max-w-2xl mx-auto">
                Monitor and track your blood pressure readings with instant classification and health recommendations
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
                      <h2 className="text-2xl font-semibold text-gray-900 mb-8">Blood Pressure Reading</h2>
                      
                      {/* Blood Pressure Inputs */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-3">
                          <Label htmlFor="systolic" className="text-sm font-medium text-gray-700">
                            Systolic (mmHg) *
                          </Label>
                          <Input
                            id="systolic"
                            type="number"
                            value={systolic}
                            onChange={(e) => setSystolic(e.target.value)}
                            className="h-12 text-base border-gray-200 rounded-lg"
                            placeholder="120"
                            min="60"
                            max="250"
                            data-testid="input-systolic"
                          />
                          <p className="text-xs text-gray-500">Upper number</p>
                        </div>
                        
                        <div className="space-y-3">
                          <Label htmlFor="diastolic" className="text-sm font-medium text-gray-700">
                            Diastolic (mmHg) *
                          </Label>
                          <Input
                            id="diastolic"
                            type="number"
                            value={diastolic}
                            onChange={(e) => setDiastolic(e.target.value)}
                            className="h-12 text-base border-gray-200 rounded-lg"
                            placeholder="80"
                            min="40"
                            max="150"
                            data-testid="input-diastolic"
                          />
                          <p className="text-xs text-gray-500">Lower number</p>
                        </div>
                      </div>

                      {/* Pulse */}
                      <div className="space-y-3">
                        <Label htmlFor="pulse" className="text-sm font-medium text-gray-700">
                          Pulse Rate (bpm) <span className="text-gray-400 font-normal">- Optional</span>
                        </Label>
                        <Input
                          id="pulse"
                          type="number"
                          value={pulse}
                          onChange={(e) => setPulse(e.target.value)}
                          className="h-12 text-base border-gray-200 rounded-lg"
                          placeholder="70"
                          min="40"
                          max="200"
                          data-testid="input-pulse"
                        />
                        <p className="text-xs text-gray-500">
                          Heart rate during blood pressure measurement
                        </p>
                      </div>

                      {/* Age */}
                      <div className="space-y-3">
                        <Label htmlFor="age" className="text-sm font-medium text-gray-700">
                          Age (years) <span className="text-gray-400 font-normal">- Optional</span>
                        </Label>
                        <Input
                          id="age"
                          type="number"
                          value={age}
                          onChange={(e) => setAge(e.target.value)}
                          className="h-12 text-base border-gray-200 rounded-lg"
                          placeholder="40"
                          min="18"
                          max="120"
                          data-testid="input-age"
                        />
                        <p className="text-xs text-gray-500">
                          Age helps determine target blood pressure ranges
                        </p>
                      </div>

                      {/* Gender */}
                      <div className="space-y-3">
                        <Label className="text-sm font-medium text-gray-700">
                          Gender <span className="text-gray-400 font-normal">- Optional</span>
                        </Label>
                        <Select value={gender} onValueChange={setGender}>
                          <SelectTrigger className="h-12 border-gray-200 rounded-lg" data-testid="select-gender">
                            <SelectValue placeholder="Select gender" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="male">Male</SelectItem>
                            <SelectItem value="female">Female</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Information Box */}
                      <div className="bg-blue-50 rounded-lg p-4 mt-6">
                        <h3 className="font-semibold text-blue-900 mb-2">Measurement Tips</h3>
                        <ul className="text-sm text-blue-700 space-y-1">
                          <li>• Sit quietly for 5 minutes before measuring</li>
                          <li>• Keep feet flat on floor, back supported</li>
                          <li>• Use proper cuff size on bare arm</li>
                          <li>• Take 2-3 readings, 1 minute apart</li>
                        </ul>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-4 pt-6">
                        <Button
                          onClick={calculateBloodPressure}
                          className="flex-1 h-12 text-white font-medium rounded-lg"
                          style={{ backgroundColor: '#f43f5e' }}
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#e11d48'}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#f43f5e'}
                          data-testid="button-calculate"
                        >
                          <Calculator className="w-4 h-4 mr-2" />
                          Track Blood Pressure
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
                      <h2 className="text-2xl font-semibold text-gray-900 mb-8">Blood Pressure Results</h2>
                      
                      {result ? (
                        <div className="space-y-4" data-testid="blood-pressure-results">
                          {/* Main Reading */}
                          <div className={`bg-white rounded-lg p-4 border-l-4 ${getCategoryBgColor(result.category)}`}>
                            <div className="flex justify-between items-center mb-2">
                              <span className="font-semibold text-gray-700">Blood Pressure</span>
                              <span className="text-2xl font-bold text-gray-900" data-testid="text-bp-reading">
                                {result.systolic}/{result.diastolic} mmHg
                              </span>
                            </div>
                            {result.pulse && (
                              <p className="text-sm text-gray-500">Pulse: {result.pulse} bpm</p>
                            )}
                          </div>

                          {/* Category */}
                          <div className="bg-white rounded-lg p-4">
                            <div className="flex justify-between items-center">
                              <span className="text-gray-600">Category</span>
                              <span className={`font-semibold ${result.color}`} data-testid="text-bp-category">
                                {result.category}
                              </span>
                            </div>
                            <div className="flex justify-between items-center mt-1">
                              <span className="text-gray-600">Risk Level</span>
                              <span className={`font-semibold ${result.color}`} data-testid="text-bp-risk">
                                {result.risk}
                              </span>
                            </div>
                          </div>

                          {/* Target Ranges */}
                          <div className="bg-green-50 rounded-lg p-4">
                            <h3 className="font-semibold text-gray-900 mb-2">Target Ranges</h3>
                            <div className="space-y-1 text-sm">
                              <div className="flex justify-between">
                                <span className="text-gray-600">Systolic</span>
                                <span className="font-medium" data-testid="text-target-systolic">
                                  {result.targetRanges.systolic} mmHg
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Diastolic</span>
                                <span className="font-medium" data-testid="text-target-diastolic">
                                  {result.targetRanges.diastolic} mmHg
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Recommendations */}
                          <div className="bg-blue-50 rounded-lg p-4">
                            <h3 className="font-semibold text-gray-900 mb-2">Recommendations</h3>
                            <ul className="text-sm text-gray-700 space-y-1">
                              {result.recommendations.map((rec, index) => (
                                <li key={index} className="flex items-start">
                                  <span className="mr-2">•</span>
                                  <span>{rec}</span>
                                </li>
                              ))}
                            </ul>
                          </div>

                          {/* Disclaimer */}
                          <div className="bg-orange-50 rounded-lg p-4">
                            <p className="text-sm text-orange-700">
                              <strong>Disclaimer:</strong> This tool is for informational purposes only. 
                              Consult your healthcare provider for medical advice and proper diagnosis.
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-8" data-testid="no-results">
                          <Activity className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                          <p className="text-gray-500">Enter your blood pressure reading to get started</p>
                        </div>
                      )}

                      {/* Reading History */}
                      {readings.length > 0 && (
                        <div className="mt-8">
                          <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold text-gray-900">Recent Readings</h3>
                            <Button
                              onClick={clearHistory}
                              variant="outline"
                              size="sm"
                              className="text-gray-500 hover:text-gray-700"
                              data-testid="button-clear-history"
                            >
                              Clear History
                            </Button>
                          </div>
                          <div className="space-y-2">
                            {readings.map((reading, index) => (
                              <div key={index} className="bg-white rounded-lg p-3 text-sm">
                                <div className="flex justify-between items-center">
                                  <span className="font-medium">
                                    {reading.systolic}/{reading.diastolic} mmHg
                                    {reading.pulse && ` • ${reading.pulse} bpm`}
                                  </span>
                                  <span className={getCategoryColor(reading.category)}>
                                    {reading.category}
                                  </span>
                                </div>
                                <p className="text-gray-500 mt-1">{reading.timestamp}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Educational Content */}
              <div className="mt-12 space-y-8">
                {/* Understanding Blood Pressure */}
                <div className="bg-white rounded-2xl shadow-lg p-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-8">Understanding Blood Pressure</h2>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-4">What is Blood Pressure?</h3>
                      <p className="text-gray-600 mb-6 leading-relaxed">
                        Blood pressure is the force of blood pushing against artery walls as your heart pumps blood. 
                        It's measured with two numbers: systolic (pressure when heart beats) and diastolic (pressure when heart rests between beats).
                      </p>
                      
                      <h3 className="text-xl font-semibold text-gray-900 mb-4">Blood Pressure Categories</h3>
                      <p className="text-gray-600 mb-4 leading-relaxed">
                        The American Heart Association defines these categories based on the higher of your two numbers.
                      </p>
                    </div>
                    
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-4">BP Categories (AHA Guidelines)</h3>
                      <div className="space-y-3">
                        <div className="flex items-center p-3 bg-green-50 rounded-lg">
                          <div className="w-4 h-4 bg-green-500 rounded-full mr-3"></div>
                          <div>
                            <div className="font-medium">Normal</div>
                            <div className="text-sm text-gray-600">Less than 120/80 mmHg</div>
                          </div>
                        </div>
                        
                        <div className="flex items-center p-3 bg-yellow-50 rounded-lg">
                          <div className="w-4 h-4 bg-yellow-500 rounded-full mr-3"></div>
                          <div>
                            <div className="font-medium">Elevated</div>
                            <div className="text-sm text-gray-600">120-129/less than 80 mmHg</div>
                          </div>
                        </div>
                        
                        <div className="flex items-center p-3 bg-orange-50 rounded-lg">
                          <div className="w-4 h-4 bg-orange-500 rounded-full mr-3"></div>
                          <div>
                            <div className="font-medium">High BP Stage 1</div>
                            <div className="text-sm text-gray-600">130-139/80-89 mmHg</div>
                          </div>
                        </div>
                        
                        <div className="flex items-center p-3 bg-red-50 rounded-lg">
                          <div className="w-4 h-4 bg-red-500 rounded-full mr-3"></div>
                          <div>
                            <div className="font-medium">High BP Stage 2</div>
                            <div className="text-sm text-gray-600">140/90 mmHg or higher</div>
                          </div>
                        </div>
                        
                        <div className="flex items-center p-3 bg-red-100 rounded-lg">
                          <div className="w-4 h-4 bg-red-800 rounded-full mr-3"></div>
                          <div>
                            <div className="font-medium">Hypertensive Crisis</div>
                            <div className="text-sm text-gray-600">Higher than 180/120 mmHg</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Blood Pressure Management */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Blood Pressure Management Tips</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Lifestyle Changes</h3>
                      <ul className="text-gray-600 space-y-2 text-sm">
                        <li>• Follow the DASH diet (low sodium, high potassium)</li>
                        <li>• Maintain a healthy weight (BMI 18.5-24.9)</li>
                        <li>• Exercise regularly (150 minutes/week moderate activity)</li>
                        <li>• Limit sodium to less than 2,300mg daily</li>
                        <li>• Limit alcohol consumption</li>
                        <li>• Don't smoke or quit if you do</li>
                        <li>• Manage stress through relaxation techniques</li>
                      </ul>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Monitoring Guidelines</h3>
                      <ul className="text-gray-600 space-y-2 text-sm">
                        <li>• Check BP at same time each day</li>
                        <li>• Use a validated, properly calibrated monitor</li>
                        <li>• Sit quietly for 5 minutes before measuring</li>
                        <li>• Take multiple readings and record average</li>
                        <li>• Track readings to share with healthcare provider</li>
                        <li>• Follow medication schedule if prescribed</li>
                        <li>• Regular medical check-ups as recommended</li>
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

export default BloodPressureTracker;