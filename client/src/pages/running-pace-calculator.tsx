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
import { Timer, Calculator, Clock, Gauge } from 'lucide-react';

interface PaceResult {
  pacePerMile: string;
  pacePerKm: string;
  speedMph: number;
  speedKmh: number;
  totalSeconds: number;
  distance: number;
  distanceUnit: string;
}

const RunningPaceCalculator = () => {
  const [distance, setDistance] = useState('');
  const [distanceUnit, setDistanceUnit] = useState('miles');
  const [hours, setHours] = useState('');
  const [minutes, setMinutes] = useState('');
  const [seconds, setSeconds] = useState('');
  const [calculationType, setCalculationType] = useState('pace');
  const [targetPace, setTargetPace] = useState('');
  const [targetPaceUnit, setTargetPaceUnit] = useState('mile');
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
    const dist = parseFloat(distance);
    const h = parseInt(hours) || 0;
    const m = parseInt(minutes) || 0;
    const s = parseInt(seconds) || 0;

    if (dist && dist > 0 && (h > 0 || m > 0 || s > 0)) {
      const totalSeconds = h * 3600 + m * 60 + s;
      
      // Convert distance to both miles and kilometers
      let distanceMiles: number;
      let distanceKm: number;

      if (distanceUnit === 'miles') {
        distanceMiles = dist;
        distanceKm = dist * 1.60934;
      } else if (distanceUnit === 'km') {
        distanceKm = dist;
        distanceMiles = dist / 1.60934;
      } else if (distanceUnit === 'meters') {
        distanceKm = dist / 1000;
        distanceMiles = distanceKm / 1.60934;
      } else if (distanceUnit === 'yards') {
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
        distanceKm = raceDistances[distanceUnit];
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
        distanceUnit
      });
    }
  };

  const calculateTimeForDistance = () => {
    const dist = parseFloat(distance);
    const paceMinutes = parseFloat(targetPace);

    if (dist && dist > 0 && paceMinutes > 0) {
      let distanceForCalc: number;

      if (distanceUnit === 'miles') {
        distanceForCalc = targetPaceUnit === 'mile' ? dist : dist * 1.60934;
      } else if (distanceUnit === 'km') {
        distanceForCalc = targetPaceUnit === 'km' ? dist : dist / 1.60934;
      } else {
        // Convert to target unit first
        const raceDistances: Record<string, number> = {
          '5k': 5,
          '10k': 10,
          'half-marathon': 21.0975,
          'marathon': 42.195
        };
        
        if (raceDistances[distanceUnit]) {
          distanceForCalc = targetPaceUnit === 'km' ? raceDistances[distanceUnit] : raceDistances[distanceUnit] / 1.60934;
        } else {
          distanceForCalc = dist;
        }
      }

      const totalMinutes = distanceForCalc * paceMinutes;
      const totalSeconds = totalMinutes * 60;
      
      const h = Math.floor(totalSeconds / 3600);
      const m = Math.floor((totalSeconds % 3600) / 60);
      const s = Math.floor(totalSeconds % 60);

      setHours(h.toString());
      setMinutes(m.toString());
      setSeconds(s.toString());

      // Auto-calculate pace with the new time
      setTimeout(calculatePace, 100);
    }
  };

  const resetCalculator = () => {
    setDistance('');
    setHours('');
    setMinutes('');
    setSeconds('');
    setTargetPace('');
    setDistanceUnit('miles');
    setTargetPaceUnit('mile');
    setCalculationType('pace');
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
    <>
      <Helmet>
        <title>Running Pace Calculator - Calculate Running Pace, Speed & Time | ToolsHub</title>
        <meta name="description" content="Free running pace calculator to calculate your pace per mile/km, running speed, and race finish times. Perfect for training and race planning." />
        <meta name="keywords" content="running pace calculator, pace per mile, pace per km, running speed calculator, race time calculator, marathon pace, 5k pace" />
        <meta property="og:title" content="Running Pace Calculator - Calculate Running Pace, Speed & Time | ToolsHub" />
        <meta property="og:description" content="Calculate your running pace, speed, and race finish times with our free running pace calculator." />
        <meta property="og:type" content="website" />
        <link rel="canonical" href="/tools/running-pace-calculator" />
      </Helmet>

      <div className="min-h-screen flex flex-col" data-testid="page-running-pace">
        <Header />
        
        <main className="flex-1 bg-neutral-50">
          {/* Hero Section */}
          <section className="bg-gradient-to-r from-green-600 via-emerald-500 to-teal-700 text-white py-16">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <div className="w-20 h-20 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Timer className="w-8 h-8" />
              </div>
              <h1 className="text-4xl sm:text-5xl font-bold mb-6" data-testid="text-page-title">
                Running Pace Calculator
              </h1>
              <p className="text-xl text-green-100 max-w-2xl mx-auto">
                Calculate your running pace, speed, and finish time for any distance. Perfect for training and race planning.
              </p>
            </div>
          </section>

          {/* Calculator Section */}
          <section className="py-16">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
              <Card className="bg-white shadow-lg border-0">
                <CardContent className="p-8">
                  <div className="text-center mb-8">
                    <Calculator className="w-12 h-12 text-green-600 mx-auto mb-4" />
                    <h2 className="text-2xl font-semibold text-gray-900 mb-2">Running Pace Calculator</h2>
                    <p className="text-gray-600">Calculate pace, speed, or finish time for your runs</p>
                  </div>

                  {/* Calculation Type Selection */}
                  <div className="mb-8">
                    <Label htmlFor="calculation-type" className="text-base font-medium text-gray-700 mb-3 block">
                      What would you like to calculate?
                    </Label>
                    <RadioGroup
                      value={calculationType}
                      onValueChange={setCalculationType}
                      className="grid grid-cols-1 md:grid-cols-2 gap-4"
                    >
                      <div className="flex items-center space-x-2 p-4 border rounded-lg">
                        <RadioGroupItem value="pace" id="pace" data-testid="radio-pace" />
                        <Label htmlFor="pace" className="font-medium">Calculate Pace & Speed</Label>
                      </div>
                      <div className="flex items-center space-x-2 p-4 border rounded-lg">
                        <RadioGroupItem value="time" id="time" data-testid="radio-time" />
                        <Label htmlFor="time" className="font-medium">Calculate Finish Time</Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Distance Input */}
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="distance" className="text-base font-medium text-gray-700 mb-2 block">
                          Distance
                        </Label>
                        <div className="flex gap-2">
                          <Input
                            id="distance"
                            type="number"
                            value={distance}
                            onChange={(e) => setDistance(e.target.value)}
                            placeholder="Enter distance"
                            step="0.01"
                            min="0"
                            className="flex-1"
                            data-testid="input-distance"
                          />
                          <Select value={distanceUnit} onValueChange={setDistanceUnit}>
                            <SelectTrigger className="w-36" data-testid="select-distance-unit">
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

                      {calculationType === 'pace' && (
                        <div>
                          <Label className="text-base font-medium text-gray-700 mb-2 block">
                            Time
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
                            <div className="flex-1">
                              <Input
                                type="number"
                                value={seconds}
                                onChange={(e) => setSeconds(e.target.value)}
                                placeholder="Seconds"
                                min="0"
                                max="59"
                                data-testid="input-seconds"
                              />
                              <Label className="text-xs text-gray-500 mt-1 block">Seconds</Label>
                            </div>
                          </div>
                        </div>
                      )}

                      {calculationType === 'time' && (
                        <div>
                          <Label htmlFor="target-pace" className="text-base font-medium text-gray-700 mb-2 block">
                            Target Pace (minutes per {targetPaceUnit})
                          </Label>
                          <div className="flex gap-2">
                            <Input
                              id="target-pace"
                              type="number"
                              value={targetPace}
                              onChange={(e) => setTargetPace(e.target.value)}
                              placeholder="Enter pace"
                              step="0.01"
                              min="0"
                              className="flex-1"
                              data-testid="input-target-pace"
                            />
                            <Select value={targetPaceUnit} onValueChange={setTargetPaceUnit}>
                              <SelectTrigger className="w-24" data-testid="select-pace-unit">
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
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col justify-end space-y-4">
                      <Button
                        onClick={calculationType === 'pace' ? calculatePace : calculateTimeForDistance}
                        className="bg-green-600 hover:bg-green-700 text-white"
                        data-testid="button-calculate"
                      >
                        <Calculator className="w-4 h-4 mr-2" />
                        Calculate {calculationType === 'pace' ? 'Pace' : 'Time'}
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
                  </div>
                </CardContent>
              </Card>

              {/* Results Section */}
              {result && (
                <Card className="mt-8 bg-green-50 border-green-200" data-testid="results-section">
                  <CardContent className="p-8">
                    <div className="text-center mb-6">
                      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Timer className="w-8 h-8 text-green-600" />
                      </div>
                      <h3 className="text-2xl font-semibold text-gray-900 mb-2">Your Running Results</h3>
                      <p className="text-gray-600">
                        For {result.distance} {result.distanceUnit} in {formatTime(result.totalSeconds)}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                      <div className="text-center p-4 bg-white rounded-lg border border-green-200">
                        <Clock className="w-8 h-8 text-green-600 mx-auto mb-2" />
                        <div className="text-2xl font-bold text-gray-900" data-testid="result-pace-mile">
                          {result.pacePerMile}
                        </div>
                        <div className="text-sm text-gray-600">per mile</div>
                      </div>

                      <div className="text-center p-4 bg-white rounded-lg border border-green-200">
                        <Clock className="w-8 h-8 text-green-600 mx-auto mb-2" />
                        <div className="text-2xl font-bold text-gray-900" data-testid="result-pace-km">
                          {result.pacePerKm}
                        </div>
                        <div className="text-sm text-gray-600">per km</div>
                      </div>

                      <div className="text-center p-4 bg-white rounded-lg border border-green-200">
                        <Gauge className="w-8 h-8 text-green-600 mx-auto mb-2" />
                        <div className="text-2xl font-bold text-gray-900" data-testid="result-speed-mph">
                          {result.speedMph}
                        </div>
                        <div className="text-sm text-gray-600">mph</div>
                      </div>

                      <div className="text-center p-4 bg-white rounded-lg border border-green-200">
                        <Gauge className="w-8 h-8 text-green-600 mx-auto mb-2" />
                        <div className="text-2xl font-bold text-gray-900" data-testid="result-speed-kmh">
                          {result.speedKmh}
                        </div>
                        <div className="text-sm text-gray-600">km/h</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Educational Content */}
              <div className="mt-12 space-y-8">
                {/* How to Use */}
                <Card className="bg-white shadow-lg">
                  <CardContent className="p-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">How to Use the Running Pace Calculator</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="text-center">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Calculator className="w-8 h-8 text-green-600" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Calculate Pace</h3>
                        <p className="text-gray-600">
                          Enter your distance and time to calculate your pace per mile/km and running speed.
                        </p>
                      </div>
                      
                      <div className="text-center">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Timer className="w-8 h-8 text-green-600" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Calculate Time</h3>
                        <p className="text-gray-600">
                          Enter your distance and target pace to calculate your expected finish time.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Common Pace Targets */}
                <Card className="bg-white shadow-lg">
                  <CardContent className="p-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Common Pace Targets</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      <div className="p-4 border border-gray-200 rounded-lg">
                        <h3 className="font-semibold text-gray-900 mb-2">Beginner Runner</h3>
                        <p className="text-sm text-gray-600 mb-2">9:00-12:00 per mile</p>
                        <p className="text-xs text-gray-500">5:35-7:30 per km</p>
                      </div>
                      
                      <div className="p-4 border border-gray-200 rounded-lg">
                        <h3 className="font-semibold text-gray-900 mb-2">Recreational Runner</h3>
                        <p className="text-sm text-gray-600 mb-2">7:00-9:00 per mile</p>
                        <p className="text-xs text-gray-500">4:20-5:35 per km</p>
                      </div>
                      
                      <div className="p-4 border border-gray-200 rounded-lg">
                        <h3 className="font-semibold text-gray-900 mb-2">Competitive Runner</h3>
                        <p className="text-sm text-gray-600 mb-2">5:00-7:00 per mile</p>
                        <p className="text-xs text-gray-500">3:06-4:20 per km</p>
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
                        <h3 className="font-semibold text-gray-900 mb-2">What is running pace?</h3>
                        <p className="text-gray-600 text-sm">
                          Running pace is the time it takes to run a specific distance, typically expressed as minutes per mile or minutes per kilometer.
                        </p>
                      </div>
                      
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-2">How do I improve my running pace?</h3>
                        <p className="text-gray-600 text-sm">
                          Improve your pace through consistent training, interval workouts, tempo runs, strength training, and proper recovery.
                        </p>
                      </div>
                      
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-2">What's a good pace for a beginner?</h3>
                        <p className="text-gray-600 text-sm">
                          For beginners, a comfortable conversational pace is ideal - typically 9:00-12:00 per mile (5:35-7:30 per km).
                        </p>
                      </div>
                      
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-2">Should I focus on pace or time?</h3>
                        <p className="text-gray-600 text-sm">
                          Focus on time/effort first as a beginner, then gradually work on pace as your fitness improves and you set specific race goals.
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

export default RunningPaceCalculator;