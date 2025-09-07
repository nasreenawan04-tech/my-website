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
import { Bike, Calculator, Clock, Gauge } from 'lucide-react';

interface CyclingResult {
  speed: number;
  speedUnit: string;
  speedMph: number;
  speedKmh: number;
  distance: number;
  distanceUnit: string;
  totalSeconds: number;
  averagePower?: number;
  caloriesBurned?: number;
}

const CyclingSpeedCalculator = () => {
  const [distance, setDistance] = useState('');
  const [distanceUnit, setDistanceUnit] = useState('miles');
  const [hours, setHours] = useState('');
  const [minutes, setMinutes] = useState('');
  const [seconds, setSeconds] = useState('');
  const [speed, setSpeed] = useState('');
  const [speedUnit, setSpeedUnit] = useState('mph');
  const [calculationType, setCalculationType] = useState('speed');
  const [weight, setWeight] = useState('');
  const [result, setResult] = useState<CyclingResult | null>(null);

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

  const calculateSpeed = () => {
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
      } else {
        distanceMiles = dist / 1760; // yards to miles
        distanceKm = distanceMiles * 1.60934;
      }

      const speedMph = (distanceMiles / totalSeconds) * 3600;
      const speedKmh = (distanceKm / totalSeconds) * 3600;

      // Estimate calories burned (rough calculation)
      const weightKg = weight ? parseFloat(weight) * (distanceUnit === 'miles' ? 0.453592 : 1) : 70;
      const hoursRidden = totalSeconds / 3600;
      const avgSpeedKmh = speedKmh;
      
      // Cycling calories: varies by intensity based on speed
      let caloriesPerHour = 400; // moderate cycling
      if (avgSpeedKmh < 16) caloriesPerHour = 300; // leisurely
      else if (avgSpeedKmh < 20) caloriesPerHour = 480; // moderate
      else if (avgSpeedKmh < 25) caloriesPerHour = 720; // vigorous
      else caloriesPerHour = 900; // racing
      
      const caloriesBurned = Math.round(caloriesPerHour * hoursRidden * (weightKg / 70));

      setResult({
        speed: Math.round(speedMph * 100) / 100,
        speedUnit: 'mph',
        speedMph: Math.round(speedMph * 100) / 100,
        speedKmh: Math.round(speedKmh * 100) / 100,
        distance: dist,
        distanceUnit,
        totalSeconds,
        caloriesBurned
      });
    }
  };

  const calculateDistance = () => {
    const speedValue = parseFloat(speed);
    const h = parseInt(hours) || 0;
    const m = parseInt(minutes) || 0;
    const s = parseInt(seconds) || 0;

    if (speedValue && speedValue > 0 && (h > 0 || m > 0 || s > 0)) {
      const totalSeconds = h * 3600 + m * 60 + s;
      const timeInHours = totalSeconds / 3600;

      let calculatedDistance: number;
      let finalDistanceUnit = distanceUnit;

      if (speedUnit === 'mph') {
        calculatedDistance = speedValue * timeInHours;
        if (distanceUnit === 'km') {
          calculatedDistance = calculatedDistance * 1.60934;
        } else if (distanceUnit === 'meters') {
          calculatedDistance = calculatedDistance * 1609.34;
        }
      } else { // km/h
        calculatedDistance = speedValue * timeInHours;
        if (distanceUnit === 'miles') {
          calculatedDistance = calculatedDistance / 1.60934;
        } else if (distanceUnit === 'meters') {
          calculatedDistance = calculatedDistance * 1000;
        }
      }

      setDistance(calculatedDistance.toFixed(2));
      
      // Auto-calculate speed with new distance
      setTimeout(calculateSpeed, 100);
    }
  };

  const calculateTime = () => {
    const speedValue = parseFloat(speed);
    const dist = parseFloat(distance);

    if (speedValue && speedValue > 0 && dist && dist > 0) {
      let distanceForCalc = dist;
      
      // Convert distance to match speed unit
      if (speedUnit === 'mph') {
        if (distanceUnit === 'km') {
          distanceForCalc = dist / 1.60934;
        } else if (distanceUnit === 'meters') {
          distanceForCalc = dist / 1609.34;
        }
      } else { // km/h
        if (distanceUnit === 'miles') {
          distanceForCalc = dist * 1.60934;
        } else if (distanceUnit === 'meters') {
          distanceForCalc = dist / 1000;
        }
      }

      const timeInHours = distanceForCalc / speedValue;
      const totalSeconds = timeInHours * 3600;
      
      const h = Math.floor(totalSeconds / 3600);
      const m = Math.floor((totalSeconds % 3600) / 60);
      const s = Math.floor(totalSeconds % 60);

      setHours(h.toString());
      setMinutes(m.toString());
      setSeconds(s.toString());

      // Auto-calculate speed with the new time
      setTimeout(calculateSpeed, 100);
    }
  };

  const resetCalculator = () => {
    setDistance('');
    setHours('');
    setMinutes('');
    setSeconds('');
    setSpeed('');
    setWeight('');
    setDistanceUnit('miles');
    setSpeedUnit('mph');
    setCalculationType('speed');
    setResult(null);
  };

  const distanceUnits = [
    { value: 'miles', label: 'Miles' },
    { value: 'km', label: 'Kilometers' },
    { value: 'meters', label: 'Meters' },
    { value: 'yards', label: 'Yards' }
  ];

  const speedUnits = [
    { value: 'mph', label: 'MPH' },
    { value: 'kmh', label: 'KM/H' }
  ];

  return (
    <>
      <Helmet>
        <title>Cycling Speed Calculator - Calculate Cycling Speed, Distance & Time | ToolsHub</title>
        <meta name="description" content="Free cycling speed calculator to calculate your cycling speed, distance, and ride time. Perfect for training, commuting, and fitness tracking." />
        <meta name="keywords" content="cycling speed calculator, bike speed calculator, cycling distance calculator, cycling time calculator, cycling pace, bike pace" />
        <meta property="og:title" content="Cycling Speed Calculator - Calculate Cycling Speed, Distance & Time | ToolsHub" />
        <meta property="og:description" content="Calculate your cycling speed, distance, and ride time with our free cycling calculator." />
        <meta property="og:type" content="website" />
        <link rel="canonical" href="/tools/cycling-speed-calculator" />
      </Helmet>

      <div className="min-h-screen flex flex-col" data-testid="page-cycling-speed">
        <Header />
        
        <main className="flex-1 bg-neutral-50">
          {/* Hero Section */}
          <section className="bg-gradient-to-r from-blue-600 via-cyan-500 to-teal-700 text-white py-16">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <div className="w-20 h-20 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Bike className="w-8 h-8" />
              </div>
              <h1 className="text-4xl sm:text-5xl font-bold mb-6" data-testid="text-page-title">
                Cycling Speed Calculator
              </h1>
              <p className="text-xl text-blue-100 max-w-2xl mx-auto">
                Calculate your cycling speed, distance, and ride time. Perfect for training, commuting, and fitness tracking.
              </p>
            </div>
          </section>

          {/* Calculator Section */}
          <section className="py-16">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
              <Card className="bg-white shadow-lg border-0">
                <CardContent className="p-8">
                  <div className="text-center mb-8">
                    <Calculator className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                    <h2 className="text-2xl font-semibold text-gray-900 mb-2">Cycling Speed Calculator</h2>
                    <p className="text-gray-600">Calculate speed, distance, or time for your cycling activities</p>
                  </div>

                  {/* Calculation Type Selection */}
                  <div className="mb-8">
                    <Label htmlFor="calculation-type" className="text-base font-medium text-gray-700 mb-3 block">
                      What would you like to calculate?
                    </Label>
                    <RadioGroup
                      value={calculationType}
                      onValueChange={setCalculationType}
                      className="grid grid-cols-1 md:grid-cols-3 gap-4"
                    >
                      <div className="flex items-center space-x-2 p-4 border rounded-lg">
                        <RadioGroupItem value="speed" id="speed" data-testid="radio-speed" />
                        <Label htmlFor="speed" className="font-medium">Calculate Speed</Label>
                      </div>
                      <div className="flex items-center space-x-2 p-4 border rounded-lg">
                        <RadioGroupItem value="distance" id="distance" data-testid="radio-distance" />
                        <Label htmlFor="distance" className="font-medium">Calculate Distance</Label>
                      </div>
                      <div className="flex items-center space-x-2 p-4 border rounded-lg">
                        <RadioGroupItem value="time" id="time" data-testid="radio-time" />
                        <Label htmlFor="time" className="font-medium">Calculate Time</Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Input Section */}
                    <div className="space-y-4">
                      {/* Distance Input */}
                      {calculationType !== 'distance' && (
                        <div>
                          <Label htmlFor="distance-input" className="text-base font-medium text-gray-700 mb-2 block">
                            Distance
                          </Label>
                          <div className="flex gap-2">
                            <Input
                              id="distance-input"
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
                              <SelectTrigger className="w-32" data-testid="select-distance-unit">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {distanceUnits.map((unit) => (
                                  <SelectItem key={unit.value} value={unit.value}>
                                    {unit.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      )}

                      {/* Speed Input */}
                      {calculationType !== 'speed' && (
                        <div>
                          <Label htmlFor="speed-input" className="text-base font-medium text-gray-700 mb-2 block">
                            Speed
                          </Label>
                          <div className="flex gap-2">
                            <Input
                              id="speed-input"
                              type="number"
                              value={speed}
                              onChange={(e) => setSpeed(e.target.value)}
                              placeholder="Enter speed"
                              step="0.1"
                              min="0"
                              className="flex-1"
                              data-testid="input-speed"
                            />
                            <Select value={speedUnit} onValueChange={setSpeedUnit}>
                              <SelectTrigger className="w-24" data-testid="select-speed-unit">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {speedUnits.map((unit) => (
                                  <SelectItem key={unit.value} value={unit.value}>
                                    {unit.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      )}

                      {/* Time Input */}
                      {calculationType !== 'time' && (
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

                      {/* Weight Input (optional) */}
                      <div>
                        <Label htmlFor="weight" className="text-base font-medium text-gray-700 mb-2 block">
                          Weight (optional, for calorie calculation)
                        </Label>
                        <div className="flex gap-2">
                          <Input
                            id="weight"
                            type="number"
                            value={weight}
                            onChange={(e) => setWeight(e.target.value)}
                            placeholder="Enter weight"
                            step="0.1"
                            min="0"
                            className="flex-1"
                            data-testid="input-weight"
                          />
                          <div className="w-20 flex items-center justify-center text-sm text-gray-500 border rounded-md">
                            {distanceUnit === 'miles' ? 'lbs' : 'kg'}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col justify-end space-y-4">
                      <Button
                        onClick={calculationType === 'speed' ? calculateSpeed : calculationType === 'distance' ? calculateDistance : calculateTime}
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                        data-testid="button-calculate"
                      >
                        <Calculator className="w-4 h-4 mr-2" />
                        Calculate {calculationType === 'speed' ? 'Speed' : calculationType === 'distance' ? 'Distance' : 'Time'}
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
                <Card className="mt-8 bg-blue-50 border-blue-200" data-testid="results-section">
                  <CardContent className="p-8">
                    <div className="text-center mb-6">
                      <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Bike className="w-8 h-8 text-blue-600" />
                      </div>
                      <h3 className="text-2xl font-semibold text-gray-900 mb-2">Your Cycling Results</h3>
                      <p className="text-gray-600">
                        For {result.distance} {result.distanceUnit} in {formatTime(result.totalSeconds)}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                      <div className="text-center p-4 bg-white rounded-lg border border-blue-200">
                        <Gauge className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                        <div className="text-2xl font-bold text-gray-900" data-testid="result-speed-mph">
                          {result.speedMph}
                        </div>
                        <div className="text-sm text-gray-600">mph</div>
                      </div>

                      <div className="text-center p-4 bg-white rounded-lg border border-blue-200">
                        <Gauge className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                        <div className="text-2xl font-bold text-gray-900" data-testid="result-speed-kmh">
                          {result.speedKmh}
                        </div>
                        <div className="text-sm text-gray-600">km/h</div>
                      </div>

                      <div className="text-center p-4 bg-white rounded-lg border border-blue-200">
                        <Clock className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                        <div className="text-2xl font-bold text-gray-900" data-testid="result-time">
                          {formatTime(result.totalSeconds)}
                        </div>
                        <div className="text-sm text-gray-600">total time</div>
                      </div>

                      {result.caloriesBurned && (
                        <div className="text-center p-4 bg-white rounded-lg border border-blue-200">
                          <Calculator className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                          <div className="text-2xl font-bold text-gray-900" data-testid="result-calories">
                            {result.caloriesBurned}
                          </div>
                          <div className="text-sm text-gray-600">calories burned</div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Educational Content */}
              <div className="mt-12 space-y-8">
                {/* How to Use */}
                <Card className="bg-white shadow-lg">
                  <CardContent className="p-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">How to Use the Cycling Speed Calculator</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="text-center">
                        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Gauge className="w-8 h-8 text-blue-600" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Calculate Speed</h3>
                        <p className="text-gray-600">
                          Enter your distance and time to calculate your average cycling speed.
                        </p>
                      </div>
                      
                      <div className="text-center">
                        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Calculator className="w-8 h-8 text-blue-600" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Calculate Distance</h3>
                        <p className="text-gray-600">
                          Enter your speed and time to calculate the distance you'll travel.
                        </p>
                      </div>
                      
                      <div className="text-center">
                        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Clock className="w-8 h-8 text-blue-600" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Calculate Time</h3>
                        <p className="text-gray-600">
                          Enter your speed and distance to calculate how long your ride will take.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Average Speeds */}
                <Card className="bg-white shadow-lg">
                  <CardContent className="p-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Average Cycling Speeds</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      <div className="p-4 border border-gray-200 rounded-lg">
                        <h3 className="font-semibold text-gray-900 mb-2">Recreational Cycling</h3>
                        <p className="text-sm text-gray-600 mb-2">8-12 mph (13-19 km/h)</p>
                        <p className="text-xs text-gray-500">Leisurely rides, bike paths</p>
                      </div>
                      
                      <div className="p-4 border border-gray-200 rounded-lg">
                        <h3 className="font-semibold text-gray-900 mb-2">Commuting</h3>
                        <p className="text-sm text-gray-600 mb-2">12-16 mph (19-26 km/h)</p>
                        <p className="text-xs text-gray-500">Urban cycling, mixed terrain</p>
                      </div>
                      
                      <div className="p-4 border border-gray-200 rounded-lg">
                        <h3 className="font-semibold text-gray-900 mb-2">Fitness Cycling</h3>
                        <p className="text-sm text-gray-600 mb-2">16-20 mph (26-32 km/h)</p>
                        <p className="text-xs text-gray-500">Training rides, road cycling</p>
                      </div>
                      
                      <div className="p-4 border border-gray-200 rounded-lg">
                        <h3 className="font-semibold text-gray-900 mb-2">Competitive Cycling</h3>
                        <p className="text-sm text-gray-600 mb-2">20-25 mph (32-40 km/h)</p>
                        <p className="text-xs text-gray-500">Racing, group rides</p>
                      </div>
                      
                      <div className="p-4 border border-gray-200 rounded-lg">
                        <h3 className="font-semibold text-gray-900 mb-2">Professional Racing</h3>
                        <p className="text-sm text-gray-600 mb-2">25+ mph (40+ km/h)</p>
                        <p className="text-xs text-gray-500">Tour de France average</p>
                      </div>
                      
                      <div className="p-4 border border-gray-200 rounded-lg">
                        <h3 className="font-semibold text-gray-900 mb-2">Mountain Biking</h3>
                        <p className="text-sm text-gray-600 mb-2">6-12 mph (10-19 km/h)</p>
                        <p className="text-xs text-gray-500">Off-road, technical terrain</p>
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
                        <h3 className="font-semibold text-gray-900 mb-2">What factors affect cycling speed?</h3>
                        <p className="text-gray-600 text-sm">
                          Wind conditions, terrain (hills vs flat), bike type, rider fitness, tire pressure, and weather conditions all significantly impact cycling speed.
                        </p>
                      </div>
                      
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-2">How can I improve my cycling speed?</h3>
                        <p className="text-gray-600 text-sm">
                          Improve through interval training, maintaining proper bike fit, reducing weight, improving aerodynamics, and consistent training.
                        </p>
                      </div>
                      
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-2">What's a good average speed for beginners?</h3>
                        <p className="text-gray-600 text-sm">
                          For beginners, 8-12 mph (13-19 km/h) is a good starting point. Focus on building endurance before worrying about speed.
                        </p>
                      </div>
                      
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-2">How accurate is the calorie calculation?</h3>
                        <p className="text-gray-600 text-sm">
                          The calorie calculation is an estimate based on average values. Actual calories burned vary based on individual factors like metabolism, effort level, and terrain.
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

export default CyclingSpeedCalculator;