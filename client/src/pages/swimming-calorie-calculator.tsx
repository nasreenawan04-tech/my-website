import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calculator, Waves, Clock, Flame } from 'lucide-react';

interface SwimmingResult {
  caloriesBurned: number;
  totalMinutes: number;
  avgCaloriesPerMinute: number;
  metValue: number;
  strokeType: string;
  intensity: string;
}

const SwimmingCalorieCalculator = () => {
  const [weight, setWeight] = useState('');
  const [weightUnit, setWeightUnit] = useState('lbs');
  const [strokeType, setStrokeType] = useState('freestyle');
  const [intensity, setIntensity] = useState('moderate');
  const [hours, setHours] = useState('');
  const [minutes, setMinutes] = useState('');
  const [result, setResult] = useState<SwimmingResult | null>(null);

  // MET values for different swimming activities
  const swimmingMET: Record<string, Record<string, number>> = {
    freestyle: {
      light: 5.8,      // leisurely, not lap swimming
      moderate: 8.3,   // freestyle, fast, vigorous effort
      vigorous: 10.0,  // freestyle, fast, vigorous effort
      competitive: 13.8 // backstroke, competitive
    },
    backstroke: {
      light: 4.8,
      moderate: 7.0,
      vigorous: 9.5,
      competitive: 13.8
    },
    breaststroke: {
      light: 5.3,
      moderate: 8.8,
      vigorous: 10.3,
      competitive: 13.8
    },
    butterfly: {
      light: 8.0,
      moderate: 11.0,
      vigorous: 13.8,
      competitive: 13.8
    },
    sidestroke: {
      light: 7.0,
      moderate: 8.3,
      vigorous: 8.3,
      competitive: 8.3
    },
    treading: {
      light: 3.5,      // treading water, moderate effort, general
      moderate: 9.8,   // treading water, fast vigorous effort
      vigorous: 9.8,
      competitive: 9.8
    }
  };

  const strokeOptions = [
    { value: 'freestyle', label: 'Freestyle / Front Crawl' },
    { value: 'backstroke', label: 'Backstroke' },
    { value: 'breaststroke', label: 'Breaststroke' },
    { value: 'butterfly', label: 'Butterfly' },
    { value: 'sidestroke', label: 'Sidestroke' },
    { value: 'treading', label: 'Treading Water' }
  ];

  const intensityOptions = [
    { value: 'light', label: 'Light - Leisurely pace' },
    { value: 'moderate', label: 'Moderate - Steady pace' },
    { value: 'vigorous', label: 'Vigorous - Fast pace' },
    { value: 'competitive', label: 'Competitive - Racing pace' }
  ];

  const calculateCalories = () => {
    const weightValue = parseFloat(weight);
    const h = parseInt(hours) || 0;
    const m = parseInt(minutes) || 0;

    if (weightValue && weightValue > 0 && (h > 0 || m > 0)) {
      const totalMinutes = h * 60 + m;
      
      // Convert weight to kg if needed
      const weightKg = weightUnit === 'lbs' ? weightValue * 0.453592 : weightValue;
      
      // Get MET value for the selected stroke and intensity
      const metValue = swimmingMET[strokeType][intensity];
      
      // Calculate calories: MET × weight (kg) × time (hours)
      const timeHours = totalMinutes / 60;
      const caloriesBurned = Math.round(metValue * weightKg * timeHours);
      
      const avgCaloriesPerMinute = Math.round((caloriesBurned / totalMinutes) * 10) / 10;

      setResult({
        caloriesBurned,
        totalMinutes,
        avgCaloriesPerMinute,
        metValue,
        strokeType: strokeOptions.find(s => s.value === strokeType)?.label || strokeType,
        intensity: intensityOptions.find(i => i.value === intensity)?.label || intensity
      });
    }
  };

  const resetCalculator = () => {
    setWeight('');
    setHours('');
    setMinutes('');
    setWeightUnit('lbs');
    setStrokeType('freestyle');
    setIntensity('moderate');
    setResult(null);
  };

  const formatTime = (totalMinutes: number): string => {
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else {
      return `${minutes}m`;
    }
  };

  return (
    <>
      <Helmet>
        <title>Swimming Calorie Calculator - Calculate Calories Burned Swimming | ToolsHub</title>
        <meta name="description" content="Free swimming calorie calculator to calculate calories burned during swimming workouts. Supports all stroke types and intensity levels." />
        <meta name="keywords" content="swimming calorie calculator, calories burned swimming, swimming workout calculator, swimming fitness tracker" />
        <meta property="og:title" content="Swimming Calorie Calculator - Calculate Calories Burned Swimming | ToolsHub" />
        <meta property="og:description" content="Calculate calories burned during your swimming workouts with our free swimming calorie calculator." />
        <meta property="og:type" content="website" />
        <link rel="canonical" href="/tools/swimming-calorie-calculator" />
      </Helmet>

      <div className="min-h-screen flex flex-col" data-testid="page-swimming-calories">
        <Header />
        
        <main className="flex-1 bg-neutral-50">
          {/* Hero Section */}
          <section className="bg-gradient-to-r from-cyan-600 via-blue-500 to-indigo-700 text-white py-16">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <div className="w-20 h-20 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Waves className="w-8 h-8" />
              </div>
              <h1 className="text-4xl sm:text-5xl font-bold mb-6" data-testid="text-page-title">
                Swimming Calorie Calculator
              </h1>
              <p className="text-xl text-blue-100 max-w-2xl mx-auto">
                Calculate calories burned during your swimming workouts. Supports all stroke types and intensity levels.
              </p>
            </div>
          </section>

          {/* Calculator Section */}
          <section className="py-16">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
              <Card className="bg-white shadow-lg border-0">
                <CardContent className="p-8">
                  <div className="text-center mb-8">
                    <Calculator className="w-12 h-12 text-cyan-600 mx-auto mb-4" />
                    <h2 className="text-2xl font-semibold text-gray-900 mb-2">Swimming Calorie Calculator</h2>
                    <p className="text-gray-600">Calculate calories burned based on your swimming workout</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Input Section */}
                    <div className="space-y-6">
                      {/* Weight Input */}
                      <div>
                        <Label htmlFor="weight" className="text-base font-medium text-gray-700 mb-2 block">
                          Your Weight
                        </Label>
                        <div className="flex gap-2">
                          <Input
                            id="weight"
                            type="number"
                            value={weight}
                            onChange={(e) => setWeight(e.target.value)}
                            placeholder="Enter your weight"
                            step="0.1"
                            min="0"
                            className="flex-1"
                            data-testid="input-weight"
                          />
                          <Select value={weightUnit} onValueChange={setWeightUnit}>
                            <SelectTrigger className="w-20" data-testid="select-weight-unit">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="lbs">lbs</SelectItem>
                              <SelectItem value="kg">kg</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      {/* Swimming Stroke */}
                      <div>
                        <Label htmlFor="stroke" className="text-base font-medium text-gray-700 mb-2 block">
                          Swimming Stroke
                        </Label>
                        <Select value={strokeType} onValueChange={setStrokeType}>
                          <SelectTrigger data-testid="select-stroke">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {strokeOptions.map((stroke) => (
                              <SelectItem key={stroke.value} value={stroke.value}>
                                {stroke.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Swimming Intensity */}
                      <div>
                        <Label htmlFor="intensity" className="text-base font-medium text-gray-700 mb-2 block">
                          Swimming Intensity
                        </Label>
                        <Select value={intensity} onValueChange={setIntensity}>
                          <SelectTrigger data-testid="select-intensity">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {intensityOptions.map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Duration Input */}
                      <div>
                        <Label className="text-base font-medium text-gray-700 mb-2 block">
                          Swimming Duration
                        </Label>
                        <div className="flex gap-2">
                          <div className="flex-1">
                            <Input
                              type="number"
                              value={hours}
                              onChange={(e) => setHours(e.target.value)}
                              placeholder="Hours"
                              min="0"
                              data-testid="input-hours"
                            />
                            <Label className="text-xs text-gray-500 mt-1 block">Hours</Label>
                          </div>
                          <div className="flex-1">
                            <Input
                              type="number"
                              value={minutes}
                              onChange={(e) => setMinutes(e.target.value)}
                              placeholder="Minutes"
                              min="0"
                              max="59"
                              data-testid="input-minutes"
                            />
                            <Label className="text-xs text-gray-500 mt-1 block">Minutes</Label>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Actions and Quick Tips */}
                    <div className="space-y-6">
                      <div className="flex flex-col space-y-4">
                        <Button
                          onClick={calculateCalories}
                          className="bg-cyan-600 hover:bg-cyan-700 text-white"
                          data-testid="button-calculate"
                        >
                          <Calculator className="w-4 h-4 mr-2" />
                          Calculate Calories
                        </Button>
                        <Button
                          onClick={resetCalculator}
                          variant="outline"
                          className="text-gray-600 border-gray-300 hover:bg-gray-50"
                          data-testid="button-reset"
                        >
                          Reset Calculator
                        </Button>
                      </div>

                      {/* Quick Tips */}
                      <Card className="bg-cyan-50 border-cyan-200">
                        <CardContent className="p-4">
                          <h3 className="font-semibold text-cyan-900 mb-2">Swimming Tips</h3>
                          <ul className="text-sm text-cyan-800 space-y-1">
                            <li>• Butterfly stroke burns the most calories</li>
                            <li>• Increase intensity for higher calorie burn</li>
                            <li>• Swimming is excellent low-impact cardio</li>
                            <li>• Proper form improves efficiency</li>
                          </ul>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Results Section */}
              {result && (
                <Card className="mt-8 bg-cyan-50 border-cyan-200" data-testid="results-section">
                  <CardContent className="p-8">
                    <div className="text-center mb-6">
                      <div className="w-16 h-16 bg-cyan-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Flame className="w-8 h-8 text-cyan-600" />
                      </div>
                      <h3 className="text-2xl font-semibold text-gray-900 mb-2">Calories Burned</h3>
                      <p className="text-gray-600">
                        {result.strokeType} at {result.intensity.toLowerCase()} for {formatTime(result.totalMinutes)}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                      <div className="text-center p-4 bg-white rounded-lg border border-cyan-200">
                        <Flame className="w-8 h-8 text-orange-500 mx-auto mb-2" />
                        <div className="text-3xl font-bold text-gray-900" data-testid="result-total-calories">
                          {result.caloriesBurned}
                        </div>
                        <div className="text-sm text-gray-600">Total Calories</div>
                      </div>

                      <div className="text-center p-4 bg-white rounded-lg border border-cyan-200">
                        <Clock className="w-8 h-8 text-cyan-600 mx-auto mb-2" />
                        <div className="text-3xl font-bold text-gray-900" data-testid="result-duration">
                          {formatTime(result.totalMinutes)}
                        </div>
                        <div className="text-sm text-gray-600">Duration</div>
                      </div>

                      <div className="text-center p-4 bg-white rounded-lg border border-cyan-200">
                        <Calculator className="w-8 h-8 text-cyan-600 mx-auto mb-2" />
                        <div className="text-3xl font-bold text-gray-900" data-testid="result-calories-per-minute">
                          {result.avgCaloriesPerMinute}
                        </div>
                        <div className="text-sm text-gray-600">Cal/Min</div>
                      </div>

                      <div className="text-center p-4 bg-white rounded-lg border border-cyan-200">
                        <Waves className="w-8 h-8 text-cyan-600 mx-auto mb-2" />
                        <div className="text-3xl font-bold text-gray-900" data-testid="result-met-value">
                          {result.metValue}
                        </div>
                        <div className="text-sm text-gray-600">MET Value</div>
                      </div>
                    </div>

                    <div className="mt-6 p-4 bg-white rounded-lg border border-cyan-200">
                      <p className="text-sm text-gray-600 text-center">
                        💡 This calculation is based on MET (Metabolic Equivalent) values and provides an estimate. 
                        Actual calories burned may vary based on individual factors like metabolism, body composition, and swimming efficiency.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Educational Content */}
              <div className="mt-12 space-y-8">
                {/* Swimming Strokes Comparison */}
                <Card className="bg-white shadow-lg">
                  <CardContent className="p-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Swimming Strokes Calorie Comparison</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      <div className="p-4 border border-gray-200 rounded-lg">
                        <h3 className="font-semibold text-gray-900 mb-2">🦋 Butterfly</h3>
                        <p className="text-sm text-gray-600 mb-2">Highest calorie burn</p>
                        <p className="text-xs text-gray-500">8.0 - 13.8 MET</p>
                      </div>
                      
                      <div className="p-4 border border-gray-200 rounded-lg">
                        <h3 className="font-semibold text-gray-900 mb-2">🏊 Freestyle</h3>
                        <p className="text-sm text-gray-600 mb-2">Most popular stroke</p>
                        <p className="text-xs text-gray-500">5.8 - 13.8 MET</p>
                      </div>
                      
                      <div className="p-4 border border-gray-200 rounded-lg">
                        <h3 className="font-semibold text-gray-900 mb-2">🐸 Breaststroke</h3>
                        <p className="text-sm text-gray-600 mb-2">Technical stroke</p>
                        <p className="text-xs text-gray-500">5.3 - 13.8 MET</p>
                      </div>
                      
                      <div className="p-4 border border-gray-200 rounded-lg">
                        <h3 className="font-semibold text-gray-900 mb-2">↩️ Backstroke</h3>
                        <p className="text-sm text-gray-600 mb-2">Good for beginners</p>
                        <p className="text-xs text-gray-500">4.8 - 13.8 MET</p>
                      </div>
                      
                      <div className="p-4 border border-gray-200 rounded-lg">
                        <h3 className="font-semibold text-gray-900 mb-2">〰️ Sidestroke</h3>
                        <p className="text-sm text-gray-600 mb-2">Relaxed stroke</p>
                        <p className="text-xs text-gray-500">7.0 - 8.3 MET</p>
                      </div>
                      
                      <div className="p-4 border border-gray-200 rounded-lg">
                        <h3 className="font-semibold text-gray-900 mb-2">🌊 Treading Water</h3>
                        <p className="text-sm text-gray-600 mb-2">Water survival skill</p>
                        <p className="text-xs text-gray-500">3.5 - 9.8 MET</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Benefits of Swimming */}
                <Card className="bg-white shadow-lg">
                  <CardContent className="p-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Benefits of Swimming</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-3">Physical Benefits</h3>
                        <ul className="space-y-2 text-sm text-gray-600">
                          <li>• Full-body cardiovascular workout</li>
                          <li>• Low-impact exercise (gentle on joints)</li>
                          <li>• Builds muscle strength and endurance</li>
                          <li>• Improves flexibility and posture</li>
                          <li>• High calorie burn potential</li>
                        </ul>
                      </div>
                      
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-3">Mental Benefits</h3>
                        <ul className="space-y-2 text-sm text-gray-600">
                          <li>• Stress relief and relaxation</li>
                          <li>• Improved sleep quality</li>
                          <li>• Enhanced mental focus</li>
                          <li>• Mood improvement</li>
                          <li>• Meditative qualities of rhythmic movement</li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* FAQ */}
                <Card className="bg-white shadow-lg">
                  <CardContent className="p-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Frequently Asked Questions</h2>
                    <div className="space-y-4">
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-2">How accurate is this calorie calculator?</h3>
                        <p className="text-gray-600 text-sm">
                          The calculator uses established MET values from scientific research. While it provides a good estimate, actual calories burned can vary based on individual factors like metabolism, body composition, and swimming efficiency.
                        </p>
                      </div>
                      
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-2">Which swimming stroke burns the most calories?</h3>
                        <p className="text-gray-600 text-sm">
                          Butterfly stroke typically burns the most calories due to its demanding technique and full-body engagement. However, maintaining proper form is crucial for effectiveness.
                        </p>
                      </div>
                      
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-2">How often should I swim for fitness?</h3>
                        <p className="text-gray-600 text-sm">
                          For general fitness, aim for 2-3 swimming sessions per week, 20-30 minutes each. This provides excellent cardiovascular benefits while allowing for recovery.
                        </p>
                      </div>
                      
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-2">Can swimming help with weight loss?</h3>
                        <p className="text-gray-600 text-sm">
                          Yes! Swimming is an excellent calorie-burning exercise. Combined with proper nutrition, regular swimming can contribute significantly to weight loss goals.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </section>
        </main>
        
        <Footer />
      </div>
    </>
  );
};

export default SwimmingCalorieCalculator;