
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

interface PaceResult {
  pacePerMile: string;
  pacePerKm: string;
  speedMph: number;
  speedKmh: number;
  totalSeconds: number;
  distance: number;
  distanceUnit: string;
}

interface PaceOptions {
  calculationType: 'pace' | 'time';
  distance: string;
  distanceUnit: string;
  hours: string;
  minutes: string;
  seconds: string;
  targetPace: string;
  targetPaceUnit: string;
}

const RunningPaceCalculator = () => {
  const [options, setOptions] = useState<PaceOptions>({
    calculationType: 'pace',
    distance: '',
    distanceUnit: 'miles',
    hours: '',
    minutes: '',
    seconds: '',
    targetPace: '',
    targetPaceUnit: 'mile'
  });
  const [result, setResult] = useState<PaceResult | null>(null);

  const formatTime = (totalSeconds: number): string => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = Math.floor(totalSeconds % 60);
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    } else {
      return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }
  };

  const calculatePace = () => {
    const dist = parseFloat(options.distance);
    const h = parseInt(options.hours) || 0;
    const m = parseInt(options.minutes) || 0;
    const s = parseInt(options.seconds) || 0;

    if (dist && dist > 0 && (h > 0 || m > 0 || s > 0)) {
      const totalSeconds = h * 3600 + m * 60 + s;
      
      // Convert distance to both miles and kilometers
      let distanceMiles: number;
      let distanceKm: number;

      if (options.distanceUnit === 'miles') {
        distanceMiles = dist;
        distanceKm = dist * 1.60934;
      } else if (options.distanceUnit === 'km') {
        distanceKm = dist;
        distanceMiles = dist / 1.60934;
      } else if (options.distanceUnit === 'meters') {
        distanceKm = dist / 1000;
        distanceMiles = distanceKm / 1.60934;
      } else if (options.distanceUnit === 'yards') {
        distanceMiles = dist / 1760;
        distanceKm = distanceMiles * 1.60934;
      } else {
        // Handle common race distances
        const raceDistances: Record<string, number> = {
          '5k': 5,
          '10k': 10,
          'half-marathon': 21.0975,
          'marathon': 42.195
        };
        distanceKm = raceDistances[options.distanceUnit];
        distanceMiles = distanceKm / 1.60934;
      }

      // Calculate pace per mile and per km
      const secondsPerMile = totalSeconds / distanceMiles;
      const secondsPerKm = totalSeconds / distanceKm;

      const pacePerMile = formatTime(secondsPerMile);
      const pacePerKm = formatTime(secondsPerKm);

      // Calculate speed
      const speedMph = (distanceMiles / totalSeconds) * 3600;
      const speedKmh = (distanceKm / totalSeconds) * 3600;

      setResult({
        pacePerMile,
        pacePerKm,
        speedMph: Math.round(speedMph * 100) / 100,
        speedKmh: Math.round(speedKmh * 100) / 100,
        totalSeconds,
        distance: dist,
        distanceUnit: options.distanceUnit
      });
    }
  };

  const calculateTimeForDistance = () => {
    const dist = parseFloat(options.distance);
    const paceMinutes = parseFloat(options.targetPace);

    if (dist && dist > 0 && paceMinutes > 0) {
      let distanceForCalc: number;

      if (options.distanceUnit === 'miles') {
        distanceForCalc = options.targetPaceUnit === 'mile' ? dist : dist * 1.60934;
      } else if (options.distanceUnit === 'km') {
        distanceForCalc = options.targetPaceUnit === 'km' ? dist : dist / 1.60934;
      } else {
        // Convert to target unit first
        const raceDistances: Record<string, number> = {
          '5k': 5,
          '10k': 10,
          'half-marathon': 21.0975,
          'marathon': 42.195
        };
        
        if (raceDistances[options.distanceUnit]) {
          distanceForCalc = options.targetPaceUnit === 'km' ? raceDistances[options.distanceUnit] : raceDistances[options.distanceUnit] / 1.60934;
        } else {
          distanceForCalc = dist;
        }
      }

      const totalMinutes = distanceForCalc * paceMinutes;
      const totalSeconds = totalMinutes * 60;
      
      const h = Math.floor(totalSeconds / 3600);
      const m = Math.floor((totalSeconds % 3600) / 60);
      const s = Math.floor(totalSeconds % 60);

      setOptions(prev => ({
        ...prev,
        hours: h.toString(),
        minutes: m.toString(),
        seconds: s.toString()
      }));

      // Auto-calculate pace with the new time
      setTimeout(calculatePace, 100);
    }
  };

  const handleClear = () => {
    setResult(null);
  };

  const resetCalculator = () => {
    setOptions({
      calculationType: 'pace',
      distance: '',
      distanceUnit: 'miles',
      hours: '',
      minutes: '',
      seconds: '',
      targetPace: '',
      targetPaceUnit: 'mile'
    });
    setResult(null);
  };

  const commonDistances = [
    { value: 'miles', label: 'Miles' },
    { value: 'km', label: 'Kilometers' },
    { value: 'meters', label: 'Meters' },
    { value: 'yards', label: 'Yards' },
    { value: '5k', label: '5K Race' },
    { value: '10k', label: '10K Race' },
    { value: 'half-marathon', label: 'Half Marathon' },
    { value: 'marathon', label: 'Marathon' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Helmet>
        <title>Running Pace Calculator - Calculate Pace, Speed & Race Times | DapsiWow</title>
        <meta name="description" content="Free running pace calculator for runners and athletes. Calculate running pace per mile/km, speed, and race finish times with professional accuracy for training and race planning." />
        <meta name="keywords" content="running pace calculator, pace per mile, pace per km, running speed calculator, race time calculator, marathon pace, 5k pace, training pace, running calculator" />
        <meta property="og:title" content="Running Pace Calculator - Calculate Pace, Speed & Race Times | DapsiWow" />
        <meta property="og:description" content="Professional running pace calculator for training and race planning. Calculate pace, speed, and finish times for any distance with instant, accurate results." />
        <meta property="og:type" content="website" />
        <meta name="robots" content="index, follow" />
        <meta name="author" content="DapsiWow" />
        <link rel="canonical" href="https://dapsiwow.com/tools/running-pace-calculator" />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            "name": "Running Pace Calculator",
            "description": "Professional running pace calculator for athletes and fitness enthusiasts to calculate running pace, speed, and race finish times with detailed analysis and training insights.",
            "url": "https://dapsiwow.com/tools/running-pace-calculator",
            "applicationCategory": "HealthApplication",
            "operatingSystem": "Any",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "USD"
            },
            "featureList": [
              "Calculate running pace per mile and kilometer",
              "Determine running speed in mph and km/h",
              "Predict race finish times",
              "Support for multiple distance units",
              "Common race distance presets",
              "Training pace analysis"
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
                <span className="text-sm font-medium text-blue-700">Professional Running Calculator</span>
              </div>
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-slate-900 leading-tight">
                Running Pace
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                  Calculator
                </span>
              </h1>
              <p className="text-xl sm:text-2xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
                Calculate your running pace, speed, and race finish times with professional accuracy for training and race planning
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
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">Calculation Settings</h2>
                    <p className="text-gray-600">Configure your running calculation requirements</p>
                  </div>

                  <div className="space-y-6">
                    {/* Calculation Type Selection */}
                    <div className="space-y-3">
                      <Label className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                        Calculation Type
                      </Label>
                      <RadioGroup
                        value={options.calculationType}
                        onValueChange={(value: 'pace' | 'time') => 
                          setOptions(prev => ({ ...prev, calculationType: value }))
                        }
                        className="grid grid-cols-1 gap-4"
                      >
                        <div className="flex items-center space-x-3 p-4 border-2 border-gray-200 rounded-xl">
                          <RadioGroupItem value="pace" id="pace" data-testid="radio-pace" />
                          <Label htmlFor="pace" className="font-medium text-lg">Calculate Pace & Speed</Label>
                        </div>
                        <div className="flex items-center space-x-3 p-4 border-2 border-gray-200 rounded-xl">
                          <RadioGroupItem value="time" id="time" data-testid="radio-time" />
                          <Label htmlFor="time" className="font-medium text-lg">Calculate Finish Time</Label>
                        </div>
                      </RadioGroup>
                    </div>

                    {/* Distance Input */}
                    <div className="space-y-3">
                      <Label htmlFor="distance" className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                        Distance
                      </Label>
                      <div className="flex gap-2">
                        <Input
                          id="distance"
                          type="number"
                          value={options.distance}
                          onChange={(e) => setOptions(prev => ({ ...prev, distance: e.target.value }))}
                          placeholder="Enter distance"
                          step="0.01"
                          min="0"
                          className="h-14 text-lg border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-blue-500 flex-1"
                          data-testid="input-distance"
                        />
                        <Select
                          value={options.distanceUnit}
                          onValueChange={(value) => setOptions(prev => ({ ...prev, distanceUnit: value }))}
                        >
                          <SelectTrigger className="h-14 w-36 border-2 border-gray-200 rounded-xl text-lg" data-testid="select-distance-unit">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {commonDistances.map((unit) => (
                              <SelectItem key={unit.value} value={unit.value}>
                                {unit.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {options.calculationType === 'pace' && (
                      <div className="space-y-3">
                        <Label className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                          Time
                        </Label>
                        <div className="grid grid-cols-3 gap-2">
                          <div>
                            <Input
                              type="number"
                              value={options.hours}
                              onChange={(e) => setOptions(prev => ({ ...prev, hours: e.target.value }))}
                              placeholder="Hours"
                              min="0"
                              className="h-14 text-lg border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-blue-500"
                              data-testid="input-hours"
                            />
                            <Label className="text-xs text-gray-500 mt-1 block">Hours</Label>
                          </div>
                          <div>
                            <Input
                              type="number"
                              value={options.minutes}
                              onChange={(e) => setOptions(prev => ({ ...prev, minutes: e.target.value }))}
                              placeholder="Minutes"
                              min="0"
                              max="59"
                              className="h-14 text-lg border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-blue-500"
                              data-testid="input-minutes"
                            />
                            <Label className="text-xs text-gray-500 mt-1 block">Minutes</Label>
                          </div>
                          <div>
                            <Input
                              type="number"
                              value={options.seconds}
                              onChange={(e) => setOptions(prev => ({ ...prev, seconds: e.target.value }))}
                              placeholder="Seconds"
                              min="0"
                              max="59"
                              className="h-14 text-lg border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-blue-500"
                              data-testid="input-seconds"
                            />
                            <Label className="text-xs text-gray-500 mt-1 block">Seconds</Label>
                          </div>
                        </div>
                      </div>
                    )}

                    {options.calculationType === 'time' && (
                      <div className="space-y-3">
                        <Label htmlFor="target-pace" className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                          Target Pace (minutes per {options.targetPaceUnit})
                        </Label>
                        <div className="flex gap-2">
                          <Input
                            id="target-pace"
                            type="number"
                            value={options.targetPace}
                            onChange={(e) => setOptions(prev => ({ ...prev, targetPace: e.target.value }))}
                            placeholder="Enter pace"
                            step="0.01"
                            min="0"
                            className="h-14 text-lg border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-blue-500 flex-1"
                            data-testid="input-target-pace"
                          />
                          <Select
                            value={options.targetPaceUnit}
                            onValueChange={(value) => setOptions(prev => ({ ...prev, targetPaceUnit: value }))}
                          >
                            <SelectTrigger className="h-14 w-24 border-2 border-gray-200 rounded-xl text-lg" data-testid="select-pace-unit">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="mile">Mile</SelectItem>
                              <SelectItem value="km">KM</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4 pt-6">
                      <Button
                        onClick={options.calculationType === 'pace' ? calculatePace : calculateTimeForDistance}
                        className="flex-1 h-14 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold text-lg rounded-xl shadow-lg transform transition-all duration-200 hover:scale-105"
                        data-testid="button-calculate"
                      >
                        Calculate {options.calculationType === 'pace' ? 'Pace' : 'Time'}
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
                      {/* Results Display */}
                      <div className="bg-white rounded-2xl p-6 shadow-lg border border-blue-100">
                        <h3 className="text-xl font-bold text-gray-900 mb-4">
                          For {result.distance} {result.distanceUnit} in {formatTime(result.totalSeconds)}
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="bg-blue-50 rounded-lg p-4 text-center">
                            <div className="text-2xl font-bold text-blue-600" data-testid="result-pace-mile">
                              {result.pacePerMile}
                            </div>
                            <div className="text-sm text-blue-700 font-medium">per mile</div>
                          </div>
                          <div className="bg-green-50 rounded-lg p-4 text-center">
                            <div className="text-2xl font-bold text-green-600" data-testid="result-pace-km">
                              {result.pacePerKm}
                            </div>
                            <div className="text-sm text-green-700 font-medium">per km</div>
                          </div>
                          <div className="bg-purple-50 rounded-lg p-4 text-center">
                            <div className="text-2xl font-bold text-purple-600" data-testid="result-speed-mph">
                              {result.speedMph}
                            </div>
                            <div className="text-sm text-purple-700 font-medium">mph</div>
                          </div>
                          <div className="bg-orange-50 rounded-lg p-4 text-center">
                            <div className="text-2xl font-bold text-orange-600" data-testid="result-speed-kmh">
                              {result.speedKmh}
                            </div>
                            <div className="text-sm text-orange-700 font-medium">km/h</div>
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-col sm:flex-row gap-4">
                        <Button
                          onClick={handleClear}
                          variant="outline"
                          className="flex-1 h-12 border-2 border-gray-300 text-gray-700 hover:bg-gray-50 font-medium rounded-xl"
                        >
                          Clear Results
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-16">
                      <div className="w-20 h-20 bg-gray-200 rounded-full mx-auto mb-6 flex items-center justify-center">
                        <div className="text-3xl font-bold text-gray-400">⏱</div>
                      </div>
                      <p className="text-gray-500 text-lg">Configure settings and calculate to see running results</p>
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
                <h3 className="text-2xl font-bold text-gray-900 mb-6">What is Running Pace?</h3>
                <div className="space-y-4 text-gray-600">
                  <p>
                    Running pace is the time it takes to complete one unit of distance, typically expressed as minutes per mile 
                    or minutes per kilometer. It's a fundamental metric for runners to measure performance, plan training, and 
                    set realistic race goals.
                  </p>
                  <p>
                    Our running pace calculator provides instant, accurate calculations to help you understand your current 
                    fitness level and plan your training sessions effectively. Whether you're a beginner runner or an elite 
                    athlete, understanding your pace is crucial for improvement and injury prevention.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Why Use a Running Pace Calculator?</h3>
                <div className="space-y-4 text-gray-600">
                  <p>
                    A running pace calculator eliminates guesswork from your training and race planning. It helps you set 
                    realistic goals, track progress, and ensure you're training at the right intensity for different 
                    workout types.
                  </p>
                  <ul className="space-y-2 list-disc list-inside">
                    <li>Plan race finish times accurately</li>
                    <li>Set appropriate training paces</li>
                    <li>Track fitness improvements over time</li>
                    <li>Convert between different pace formats</li>
                    <li>Optimize training intensity zones</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Calculator Features</h3>
                <div className="space-y-3 text-gray-600">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Calculate pace per mile and kilometer simultaneously</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Determine running speed in mph and km/h</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Predict race finish times from target pace</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Support for multiple distance units and race formats</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Professional accuracy for training and racing</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Training Applications</h3>
                <div className="space-y-3 text-gray-600">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Race preparation and pacing strategy</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Interval training pace determination</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Long run and easy pace calculation</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Tempo run and threshold pace planning</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Marathon and half-marathon pacing</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Additional SEO Content Sections */}
          <div className="mt-12 space-y-8">
            {/* Running Pace Training Zones */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Understanding Running Training Zones</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-gray-800">Easy Pace (Zone 1-2)</h4>
                    <p className="text-gray-600">
                      Your easy pace should feel comfortable and conversational, typically 60-90 seconds slower than your 
                      5K race pace. This pace builds aerobic base, promotes recovery, and should comprise 70-80% of your 
                      weekly training volume for optimal adaptation and injury prevention.
                    </p>
                  </div>
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-gray-800">Tempo Pace (Zone 3)</h4>
                    <p className="text-gray-600">
                      Tempo pace is comfortably hard, sustainable for 20-60 minutes. It's approximately your one-hour race 
                      pace, helping improve lactate threshold and teaching your body to clear lactate more efficiently. 
                      Use our calculator to determine the right tempo pace for your current fitness level.
                    </p>
                  </div>
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-gray-800">Interval Pace (Zone 4-5)</h4>
                    <p className="text-gray-600">
                      Interval training pace ranges from 3K to mile race pace, improving VO2 max and running economy. 
                      These shorter, intense efforts with recovery periods help develop speed and power while maintaining 
                      good running form at faster speeds.
                    </p>
                  </div>
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-gray-800">Race Pace Training</h4>
                    <p className="text-gray-600">
                      Training at your goal race pace helps develop neuromuscular coordination and metabolic efficiency 
                      at that specific intensity. Practice race pace regularly to build confidence and ensure your goal 
                      is realistic and achievable on race day.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Common Running Distances and Paces */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
                <CardContent className="p-8">
                  <h3 className="text-xl font-bold text-gray-900 mb-6">5K Race Pacing</h3>
                  <div className="space-y-4 text-gray-600">
                    <p className="text-sm">
                      The 5K is a popular distance that requires a balance of speed and endurance. Most runners can 
                      sustain their 5K pace for 15-25 minutes, making it an excellent benchmark for fitness testing.
                    </p>
                    <div className="space-y-2">
                      <h4 className="font-semibold text-green-800 text-sm">Typical 5K Pace Ranges:</h4>
                      <ul className="text-xs space-y-1 list-disc list-inside text-green-700">
                        <li>Beginner: 10:00-12:00 per mile</li>
                        <li>Recreational: 8:00-10:00 per mile</li>
                        <li>Competitive: 6:00-8:00 per mile</li>
                        <li>Elite: Under 5:30 per mile</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
                <CardContent className="p-8">
                  <h3 className="text-xl font-bold text-gray-900 mb-6">Marathon Pacing</h3>
                  <div className="space-y-4 text-gray-600">
                    <p className="text-sm">
                      Marathon pacing requires careful planning and conservative starts. Your marathon pace should feel 
                      moderate and sustainable, typically 30-90 seconds slower than half-marathon pace.
                    </p>
                    <div className="space-y-2">
                      <h4 className="font-semibold text-blue-800 text-sm">Marathon Pace Guidelines:</h4>
                      <ul className="text-xs space-y-1 list-disc list-inside text-blue-700">
                        <li>First-timer: 10:00-13:00 per mile</li>
                        <li>Experienced: 8:00-10:00 per mile</li>
                        <li>Competitive: 6:30-8:00 per mile</li>
                        <li>Elite: Under 5:30 per mile</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
                <CardContent className="p-8">
                  <h3 className="text-xl font-bold text-gray-900 mb-6">Half Marathon Strategy</h3>
                  <div className="space-y-4 text-gray-600">
                    <p className="text-sm">
                      The half marathon is an excellent distance for developing both speed and endurance. Pace should 
                      be comfortably hard - faster than marathon pace but sustainable for 60-150 minutes.
                    </p>
                    <div className="space-y-2">
                      <h4 className="font-semibold text-purple-800 text-sm">Half Marathon Pacing:</h4>
                      <ul className="text-xs space-y-1 list-disc list-inside text-purple-700">
                        <li>Beginner: 9:30-12:00 per mile</li>
                        <li>Recreational: 8:00-9:30 per mile</li>
                        <li>Competitive: 6:30-8:00 per mile</li>
                        <li>Elite: Under 5:45 per mile</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* How to Use Running Pace Calculator */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">How to Use the Running Pace Calculator Effectively</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="space-y-4 text-gray-600">
                    <h4 className="font-semibold text-gray-800 mb-2">Calculating Current Pace</h4>
                    <p className="text-sm">
                      To determine your current running pace, select "Calculate Pace & Speed" and enter the distance you ran 
                      along with your total time. The calculator will instantly provide your pace per mile and kilometer, 
                      plus your average speed in both mph and km/h.
                    </p>
                    <h4 className="font-semibold text-gray-800 mb-2">Planning Race Times</h4>
                    <p className="text-sm">
                      Use "Calculate Finish Time" to predict how long it will take to complete a specific distance at 
                      your target pace. This is invaluable for race planning, setting realistic goals, and developing 
                      pacing strategies for different race distances.
                    </p>
                  </div>
                  <div className="space-y-4 text-gray-600">
                    <h4 className="font-semibold text-gray-800 mb-2">Training Zone Development</h4>
                    <p className="text-sm">
                      Once you know your current race paces, use them to calculate appropriate training paces. Easy runs 
                      should be 60-90 seconds slower than 5K pace, while tempo runs should be around 10K to half-marathon 
                      pace depending on the workout duration.
                    </p>
                    <h4 className="font-semibold text-gray-800 mb-2">Progress Tracking</h4>
                    <p className="text-sm">
                      Regular pace calculations help track fitness improvements over time. As your pace improves for the 
                      same effort level, you'll know your training is working effectively and can adjust your race goals 
                      accordingly.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* FAQ Section */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Frequently Asked Questions</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">How accurate is this running pace calculator?</h4>
                      <p className="text-gray-600 text-sm">
                        Our calculator uses precise mathematical formulas to provide accurate pace and speed calculations. 
                        Results are based on the exact distance and time inputs you provide, making them as accurate as 
                        your measurement data.
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">What's the difference between pace and speed?</h4>
                      <p className="text-gray-600 text-sm">
                        Pace measures time per unit distance (minutes per mile), while speed measures distance per unit 
                        time (miles per hour). Runners typically think in terms of pace, while cyclists and drivers 
                        usually consider speed.
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">How do I improve my running pace?</h4>
                      <p className="text-gray-600 text-sm">
                        Improve pace through consistent training, including easy runs for base building, tempo runs for 
                        lactate threshold, intervals for VO2 max, and strength training. Gradual progression and proper 
                        recovery are essential for sustainable improvement.
                      </p>
                    </div>
                  </div>
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">Should I run the same pace every day?</h4>
                      <p className="text-gray-600 text-sm">
                        No, varying your pace is crucial for optimal training. Follow the 80/20 rule: 80% of runs should 
                        be at easy pace, while 20% should be at moderate to high intensity. This approach maximizes 
                        fitness gains while minimizing injury risk.
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">How do weather conditions affect running pace?</h4>
                      <p className="text-gray-600 text-sm">
                        Heat, humidity, wind, and terrain significantly impact pace. Expect to run 10-30 seconds per mile 
                        slower in hot weather. Adjust your pace expectations accordingly and focus on effort level rather 
                        than strict pace targets in challenging conditions.
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">Is this calculator suitable for treadmill running?</h4>
                      <p className="text-gray-600 text-sm">
                        Yes, the calculator works perfectly for treadmill runs. Simply input your treadmill distance and 
                        time to calculate your pace. Note that treadmill running can feel slightly easier than outdoor 
                        running due to moving belt assistance and lack of wind resistance.
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

export default RunningPaceCalculator;
