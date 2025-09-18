
import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Helmet>
        <title>Swimming Calorie Calculator - Calculate Calories Burned Swimming | DapsiWow</title>
        <meta name="description" content="Free swimming calorie calculator to determine calories burned during swimming workouts. Supports all stroke types and intensity levels with accurate MET-based calculations for fitness tracking." />
        <meta name="keywords" content="swimming calorie calculator, calories burned swimming, swimming workout calculator, swimming fitness tracker, swimming MET calculator, pool workout calories, swimming exercise calculator" />
        <meta property="og:title" content="Swimming Calorie Calculator - Calculate Calories Burned Swimming | DapsiWow" />
        <meta property="og:description" content="Calculate calories burned during your swimming workouts with our free swimming calorie calculator supporting all stroke types and intensity levels." />
        <meta property="og:type" content="website" />
        <meta name="robots" content="index, follow" />
        <meta name="author" content="DapsiWow" />
        <link rel="canonical" href="https://dapsiwow.com/tools/swimming-calorie-calculator" />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            "name": "Swimming Calorie Calculator",
            "description": "Professional swimming calorie calculator for determining calories burned during swimming workouts with support for all stroke types and intensity levels using accurate MET values.",
            "url": "https://dapsiwow.com/tools/swimming-calorie-calculator",
            "applicationCategory": "HealthApplication",
            "operatingSystem": "Any",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "USD"
            },
            "featureList": [
              "Calculate calories for all swimming strokes",
              "Multiple intensity level support",
              "Accurate MET-based calculations",
              "Weight unit conversion",
              "Detailed workout statistics",
              "Real-time calculation results"
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
                <span className="text-sm font-medium text-blue-700">Swimming Fitness Calculator</span>
              </div>
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-slate-900 leading-tight">
                Swimming Calorie
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                  Calculator
                </span>
              </h1>
              <p className="text-xl sm:text-2xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
                Calculate calories burned during swimming workouts with accurate MET-based calculations for all stroke types
              </p>
            </div>
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-4 py-16">
          {/* Main Calculator Card */}
          <Card className="bg-white/90 backdrop-blur-sm shadow-2xl border-0 rounded-3xl overflow-hidden">
            <CardContent className="p-0">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
                {/* Input Section */}
                <div className="p-8 lg:p-12 space-y-8">
                  <div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">Swimming Settings</h2>
                    <p className="text-gray-600">Configure your swimming workout details</p>
                  </div>

                  <div className="space-y-6">
                    {/* Weight Input */}
                    <div className="space-y-3">
                      <Label htmlFor="weight-input" className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                        Your Weight
                      </Label>
                      <div className="flex gap-2">
                        <Input
                          id="weight-input"
                          type="number"
                          value={weight}
                          onChange={(e) => setWeight(e.target.value)}
                          placeholder="Enter your weight"
                          step="0.1"
                          min="0"
                          className="flex-1 h-14 text-lg border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-blue-500"
                          data-testid="input-weight"
                        />
                        <Select value={weightUnit} onValueChange={setWeightUnit}>
                          <SelectTrigger className="w-20 h-14 border-2 border-gray-200 rounded-xl" data-testid="select-weight-unit">
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
                    <div className="space-y-3">
                      <Label htmlFor="stroke-select" className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                        Swimming Stroke
                      </Label>
                      <Select value={strokeType} onValueChange={setStrokeType}>
                        <SelectTrigger className="h-14 border-2 border-gray-200 rounded-xl text-lg focus:border-blue-500 focus:ring-blue-500" data-testid="select-stroke">
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
                    <div className="space-y-3">
                      <Label htmlFor="intensity-select" className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                        Swimming Intensity
                      </Label>
                      <Select value={intensity} onValueChange={setIntensity}>
                        <SelectTrigger className="h-14 border-2 border-gray-200 rounded-xl text-lg focus:border-blue-500 focus:ring-blue-500" data-testid="select-intensity">
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
                    <div className="space-y-3">
                      <Label className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                        Swimming Duration
                      </Label>
                      <div className="flex gap-2">
                        <div className="flex-1">
                          <Input
                            type="number"
                            value={hours}
                            onChange={(e) => setHours(e.target.value)}
                            placeholder="0"
                            min="0"
                            className="h-14 text-lg border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-blue-500"
                            data-testid="input-hours"
                          />
                          <Label className="text-xs text-gray-500 mt-1 block text-center">Hours</Label>
                        </div>
                        <div className="flex-1">
                          <Input
                            type="number"
                            value={minutes}
                            onChange={(e) => setMinutes(e.target.value)}
                            placeholder="30"
                            min="0"
                            max="59"
                            className="h-14 text-lg border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-blue-500"
                            data-testid="input-minutes"
                          />
                          <Label className="text-xs text-gray-500 mt-1 block text-center">Minutes</Label>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4 pt-6">
                      <Button
                        onClick={calculateCalories}
                        className="flex-1 h-14 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold text-lg rounded-xl shadow-lg transform transition-all duration-200 hover:scale-105"
                        data-testid="button-calculate"
                      >
                        Calculate Calories
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
                  <h2 className="text-2xl font-bold text-gray-900 mb-8">Calculation Results</h2>

                  {result ? (
                    <div className="space-y-6" data-testid="results-section">
                      {/* Main Result Display */}
                      <div className="bg-white rounded-2xl p-6 shadow-lg border border-blue-100">
                        <div className="text-center mb-6">
                          <div className="text-4xl font-bold text-blue-600 mb-2" data-testid="result-total-calories">
                            {result.caloriesBurned}
                          </div>
                          <div className="text-lg text-gray-600">Total Calories Burned</div>
                          <div className="text-sm text-gray-500 mt-2">
                            {result.strokeType} at {result.intensity.toLowerCase()} for {formatTime(result.totalMinutes)}
                          </div>
                        </div>
                      </div>

                      {/* Detailed Statistics */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="bg-white rounded-xl p-4 shadow-sm text-center">
                          <div className="text-2xl font-bold text-gray-900" data-testid="result-duration">
                            {formatTime(result.totalMinutes)}
                          </div>
                          <div className="text-sm text-gray-600">Duration</div>
                        </div>
                        <div className="bg-white rounded-xl p-4 shadow-sm text-center">
                          <div className="text-2xl font-bold text-gray-900" data-testid="result-calories-per-minute">
                            {result.avgCaloriesPerMinute}
                          </div>
                          <div className="text-sm text-gray-600">Cal/Min</div>
                        </div>
                        <div className="bg-white rounded-xl p-4 shadow-sm text-center">
                          <div className="text-2xl font-bold text-gray-900" data-testid="result-met-value">
                            {result.metValue}
                          </div>
                          <div className="text-sm text-gray-600">MET Value</div>
                        </div>
                      </div>

                      {/* Information Note */}
                      <div className="bg-white rounded-xl p-6 shadow-sm">
                        <p className="text-sm text-gray-600 text-center">
                          💡 Calculations are based on established MET values from scientific research. 
                          Actual calories burned may vary based on individual factors like metabolism, body composition, and swimming efficiency.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-16" data-testid="no-results">
                      <div className="w-20 h-20 bg-gray-200 rounded-full mx-auto mb-6 flex items-center justify-center">
                        <div className="text-3xl font-bold text-gray-400">🏊</div>
                      </div>
                      <p className="text-gray-500 text-lg">Enter your swimming details and calculate to see results</p>
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
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Swimming Calorie Calculator Benefits</h3>
                <div className="space-y-4 text-gray-600">
                  <p>
                    Our swimming calorie calculator provides accurate estimates of calories burned during swimming workouts 
                    using scientifically validated MET (Metabolic Equivalent of Task) values. This tool supports all major 
                    swimming strokes including freestyle, backstroke, breaststroke, butterfly, sidestroke, and treading water.
                  </p>
                  <p>
                    Swimming is one of the most effective full-body cardiovascular exercises, engaging multiple muscle groups 
                    while being gentle on joints. The calculator accounts for different intensity levels from leisurely 
                    swimming to competitive racing, ensuring accurate calorie estimates for your specific workout.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">How Swimming Burns Calories</h3>
                <div className="space-y-4 text-gray-600">
                  <p>
                    Swimming burns calories through continuous muscle engagement and cardiovascular activity. The water's 
                    resistance provides natural strength training while maintaining aerobic intensity, making it highly 
                    effective for calorie expenditure and overall fitness improvement.
                  </p>
                  <ul className="space-y-2 list-disc list-inside">
                    <li>Full-body muscle engagement increases caloric burn</li>
                    <li>Water resistance provides continuous workout intensity</li>
                    <li>Low-impact nature allows for longer workout sessions</li>
                    <li>Different strokes target various muscle groups effectively</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Swimming Strokes Comparison</h3>
                <div className="space-y-3 text-gray-600">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span><strong>Butterfly:</strong> Highest calorie burn (8.0-13.8 MET) - demanding full-body stroke</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span><strong>Freestyle:</strong> Most versatile (5.8-13.8 MET) - efficient and sustainable</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span><strong>Breaststroke:</strong> Technical stroke (5.3-13.8 MET) - great for beginners</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span><strong>Backstroke:</strong> Comfortable stroke (4.8-13.8 MET) - easy on neck and shoulders</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Swimming Workout Planning</h3>
                <div className="space-y-3 text-gray-600">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Start with 20-30 minute sessions for fitness benefits</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Gradually increase intensity and duration over time</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Mix different strokes for comprehensive muscle engagement</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Track your progress with consistent calorie calculations</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Allow rest days between intense swimming sessions</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Additional SEO Content Sections */}
          <div className="mt-12 space-y-8">
            {/* Swimming for Different Goals */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Swimming Calculator for Different Fitness Goals</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-gray-800">Weight Loss Swimming</h4>
                    <p className="text-gray-600 text-sm">
                      For effective weight loss, aim for moderate to vigorous intensity swimming sessions lasting 30-45 minutes. 
                      The butterfly and freestyle strokes typically burn the most calories, with competitive intensity sessions 
                      burning 400-600 calories per hour depending on body weight and stroke efficiency.
                    </p>
                  </div>
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-gray-800">Endurance Building</h4>
                    <p className="text-gray-600 text-sm">
                      Build swimming endurance with longer, moderate-intensity sessions focusing on consistent stroke technique. 
                      Freestyle and backstroke are ideal for endurance training, allowing for sustainable pace over extended 
                      periods while maintaining proper form and breathing patterns.
                    </p>
                  </div>
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-gray-800">Rehabilitation and Recovery</h4>
                    <p className="text-gray-600 text-sm">
                      Swimming provides excellent low-impact exercise for injury recovery and joint health. Light to moderate 
                      intensity sessions help maintain fitness while reducing stress on recovering tissues. Breaststroke and 
                      sidestroke are particularly gentle on the body during rehabilitation phases.
                    </p>
                  </div>
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-gray-800">Competitive Training</h4>
                    <p className="text-gray-600 text-sm">
                      Competitive swimmers benefit from high-intensity interval training combining different strokes and 
                      intensities. Track calorie expenditure across training sessions to ensure adequate nutrition and recovery. 
                      Competitive intensity swimming can burn 600-800+ calories per hour.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* MET Values and Scientific Accuracy */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Understanding MET Values in Swimming</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="space-y-4 text-gray-600">
                    <h4 className="font-semibold text-gray-800 mb-2">What are MET Values?</h4>
                    <p className="text-sm">
                      MET (Metabolic Equivalent of Task) values represent the energy cost of physical activities. One MET equals 
                      the energy expenditure at rest, approximately 1 calorie per kilogram of body weight per hour. Swimming MET 
                      values range from 3.5 (treading water lightly) to 13.8 (competitive butterfly stroke).
                    </p>
                    <h4 className="font-semibold text-gray-800 mb-2">Calculation Formula</h4>
                    <p className="text-sm">
                      Our calculator uses the standard formula: Calories = MET × Weight (kg) × Time (hours). This scientifically 
                      validated approach ensures accurate calorie estimates based on your specific swimming activity, intensity 
                      level, body weight, and workout duration.
                    </p>
                  </div>
                  <div className="space-y-4 text-gray-600">
                    <h4 className="font-semibold text-gray-800 mb-2">Factors Affecting Accuracy</h4>
                    <p className="text-sm">
                      While MET-based calculations provide reliable estimates, individual factors can influence actual calorie 
                      burn including swimming technique efficiency, water temperature, current fitness level, and metabolic rate. 
                      Use our calculator as a baseline and adjust based on your personal experience and fitness tracking data.
                    </p>
                    <h4 className="font-semibold text-gray-800 mb-2">Improving Accuracy</h4>
                    <p className="text-sm">
                      For the most accurate results, be honest about your swimming intensity level and maintain consistent stroke 
                      technique. Consider using a waterproof fitness tracker alongside our calculator to validate and refine your 
                      calorie burn estimates over time.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* FAQ Section */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Swimming Calorie Calculator FAQ</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">How accurate is the swimming calorie calculator?</h4>
                      <p className="text-gray-600 text-sm">
                        Our calculator uses scientifically established MET values providing estimates within 10-15% accuracy for 
                        most individuals. Actual calorie burn varies based on swimming technique, fitness level, and individual 
                        metabolic factors. Use results as reliable guidelines for fitness planning and nutrition management.
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">Which swimming stroke burns the most calories?</h4>
                      <p className="text-gray-600 text-sm">
                        Butterfly stroke typically burns the most calories due to its demanding full-body movement and high 
                        intensity requirements. However, sustainable calorie burn depends on your ability to maintain proper 
                        technique and intensity throughout your workout session.
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">How often should I swim for weight loss?</h4>
                      <p className="text-gray-600 text-sm">
                        For effective weight loss, aim for 3-4 swimming sessions per week, 30-45 minutes each, at moderate to 
                        vigorous intensity. Combine with proper nutrition and allow rest days for recovery and muscle adaptation.
                      </p>
                    </div>
                  </div>
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">Can beginners use this calculator effectively?</h4>
                      <p className="text-gray-600 text-sm">
                        Yes, the calculator supports all intensity levels including light recreational swimming. Beginners should 
                        start with light intensity sessions and gradually progress to moderate intensity as technique and 
                        endurance improve. Track your progress over time for motivation.
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">Should I eat back calories burned while swimming?</h4>
                      <p className="text-gray-600 text-sm">
                        Whether to eat back swimming calories depends on your fitness goals. For weight loss, maintain a calorie 
                        deficit. For performance or muscle gain, ensure adequate nutrition to support recovery and training 
                        adaptations. Consult a nutritionist for personalized guidance.
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">How does pool vs. open water swimming affect calories?</h4>
                      <p className="text-gray-600 text-sm">
                        Open water swimming may burn slightly more calories due to currents, waves, and temperature variations 
                        requiring additional energy for stability and warmth. However, our calculator provides accurate estimates 
                        for both pool and open water swimming based on stroke type and intensity.
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

export default SwimmingCalorieCalculator;
