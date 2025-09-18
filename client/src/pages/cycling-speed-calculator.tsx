
import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

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

export default function CyclingSpeedCalculator() {
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

  const handleCopy = () => {
    if (result) {
      const resultText = `Cycling Results:\nDistance: ${result.distance} ${result.distanceUnit}\nTime: ${formatTime(result.totalSeconds)}\nSpeed: ${result.speedMph} mph (${result.speedKmh} km/h)\n${result.caloriesBurned ? `Calories Burned: ${result.caloriesBurned}` : ''}`;
      navigator.clipboard.writeText(resultText);
    }
  };

  const handleClear = () => {
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Helmet>
        <title>Cycling Speed Calculator - Calculate Speed, Distance & Time | DapsiWow</title>
        <meta name="description" content="Professional cycling speed calculator for calculating cycling speed, distance, and ride time. Perfect for training, commuting, fitness tracking, and performance analysis with detailed results." />
        <meta name="keywords" content="cycling speed calculator, bike speed calculator, cycling distance calculator, cycling time calculator, cycling pace calculator, bike pace calculator, cycling performance tracker, cycling training calculator" />
        <meta property="og:title" content="Cycling Speed Calculator - Calculate Speed, Distance & Time | DapsiWow" />
        <meta property="og:description" content="Free cycling speed calculator to calculate your cycling speed, distance, and ride time. Professional tool for cyclists with comprehensive performance analytics." />
        <meta property="og:type" content="website" />
        <meta name="robots" content="index, follow" />
        <meta name="author" content="DapsiWow" />
        <link rel="canonical" href="https://dapsiwow.com/tools/cycling-speed-calculator" />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            "name": "Cycling Speed Calculator",
            "description": "Professional cycling speed calculator for calculating cycling speed, distance, and ride time with comprehensive performance analytics and calorie burn estimation.",
            "url": "https://dapsiwow.com/tools/cycling-speed-calculator",
            "applicationCategory": "SportsApplication",
            "operatingSystem": "Any",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "USD"
            },
            "featureList": [
              "Calculate cycling speed from distance and time",
              "Calculate distance from speed and time",
              "Calculate time from speed and distance",
              "Multiple unit conversions",
              "Calorie burn estimation",
              "Performance analytics"
            ]
          })}
        </script>
      </Helmet>

      <Header />

      <main>
        {/* Hero Section */}
        <section className="relative py-12 sm:py-16 md:py-20 lg:py-28 xl:py-32 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-indigo-600/20"></div>
          <div className="relative max-w-sm sm:max-w-lg md:max-w-2xl lg:max-w-4xl xl:max-w-5xl 2xl:max-w-6xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 text-center">
            <div className="space-y-4 sm:space-y-6 md:space-y-8">
              <div className="inline-flex items-center px-3 py-1.5 sm:px-4 sm:py-2 bg-white/80 backdrop-blur-sm rounded-full border border-blue-200">
                <span className="text-xs sm:text-sm font-medium text-blue-700">Professional Speed Calculator</span>
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl 2xl:text-8xl font-bold text-slate-900 leading-tight tracking-tight">
                <span className="block">Cycling Speed</span>
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 mt-1 sm:mt-2">
                  Calculator
                </span>
              </h1>
              <p className="text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl text-slate-600 max-w-sm sm:max-w-lg md:max-w-2xl lg:max-w-3xl xl:max-w-4xl mx-auto leading-relaxed px-2 sm:px-0">
                Calculate cycling speed, distance, and ride time with precision for training and performance analysis
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
                    <p className="text-gray-600">Configure your cycling calculation parameters</p>
                  </div>

                  <div className="space-y-6">
                    {/* Calculation Type Selection */}
                    <div className="space-y-3">
                      <Label className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                        What would you like to calculate?
                      </Label>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div 
                          className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${calculationType === 'speed' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}
                          onClick={() => setCalculationType('speed')}
                        >
                          <div className="text-center">
                            <div className="font-medium text-gray-900">Calculate Speed</div>
                            <div className="text-sm text-gray-600 mt-1">From distance & time</div>
                          </div>
                        </div>
                        <div 
                          className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${calculationType === 'distance' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}
                          onClick={() => setCalculationType('distance')}
                        >
                          <div className="text-center">
                            <div className="font-medium text-gray-900">Calculate Distance</div>
                            <div className="text-sm text-gray-600 mt-1">From speed & time</div>
                          </div>
                        </div>
                        <div 
                          className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${calculationType === 'time' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}
                          onClick={() => setCalculationType('time')}
                        >
                          <div className="text-center">
                            <div className="font-medium text-gray-900">Calculate Time</div>
                            <div className="text-sm text-gray-600 mt-1">From speed & distance</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Distance Input */}
                    {calculationType !== 'distance' && (
                      <div className="space-y-3">
                        <Label htmlFor="distance-input" className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                          Distance
                        </Label>
                        <div className="flex gap-3">
                          <Input
                            id="distance-input"
                            type="number"
                            value={distance}
                            onChange={(e) => setDistance(e.target.value)}
                            className="h-14 text-lg border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-blue-500"
                            placeholder="Enter distance"
                            step="0.01"
                            min="0"
                            data-testid="input-distance"
                          />
                          <Select value={distanceUnit} onValueChange={setDistanceUnit}>
                            <SelectTrigger className="h-14 w-32 border-2 border-gray-200 rounded-xl text-lg" data-testid="select-distance-unit">
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
                      <div className="space-y-3">
                        <Label htmlFor="speed-input" className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                          Speed
                        </Label>
                        <div className="flex gap-3">
                          <Input
                            id="speed-input"
                            type="number"
                            value={speed}
                            onChange={(e) => setSpeed(e.target.value)}
                            className="h-14 text-lg border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-blue-500"
                            placeholder="Enter speed"
                            step="0.1"
                            min="0"
                            data-testid="input-speed"
                          />
                          <Select value={speedUnit} onValueChange={setSpeedUnit}>
                            <SelectTrigger className="h-14 w-24 border-2 border-gray-200 rounded-xl text-lg" data-testid="select-speed-unit">
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
                      <div className="space-y-3">
                        <Label className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                          Time
                        </Label>
                        <div className="grid grid-cols-3 gap-3">
                          <div>
                            <Input
                              type="number"
                              value={hours}
                              onChange={(e) => setHours(e.target.value)}
                              className="h-14 text-lg border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-blue-500"
                              placeholder="0"
                              min="0"
                              data-testid="input-hours"
                            />
                            <Label className="text-xs text-gray-500 mt-1 block text-center">Hours</Label>
                          </div>
                          <div>
                            <Input
                              type="number"
                              value={minutes}
                              onChange={(e) => setMinutes(e.target.value)}
                              className="h-14 text-lg border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-blue-500"
                              placeholder="0"
                              min="0"
                              max="59"
                              data-testid="input-minutes"
                            />
                            <Label className="text-xs text-gray-500 mt-1 block text-center">Minutes</Label>
                          </div>
                          <div>
                            <Input
                              type="number"
                              value={seconds}
                              onChange={(e) => setSeconds(e.target.value)}
                              className="h-14 text-lg border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-blue-500"
                              placeholder="0"
                              min="0"
                              max="59"
                              data-testid="input-seconds"
                            />
                            <Label className="text-xs text-gray-500 mt-1 block text-center">Seconds</Label>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Weight Input (optional) */}
                    <div className="space-y-4 bg-gray-50 rounded-xl p-6">
                      <Label htmlFor="weight" className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                        Weight (optional, for calorie calculation)
                      </Label>
                      <div className="flex gap-3">
                        <Input
                          id="weight"
                          type="number"
                          value={weight}
                          onChange={(e) => setWeight(e.target.value)}
                          className="h-14 text-lg border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-blue-500"
                          placeholder="Enter weight"
                          step="0.1"
                          min="0"
                          data-testid="input-weight"
                        />
                        <div className="h-14 w-20 flex items-center justify-center text-sm text-gray-500 border-2 border-gray-200 rounded-xl">
                          {distanceUnit === 'miles' ? 'lbs' : 'kg'}
                        </div>
                      </div>
                      <p className="text-sm text-gray-600">
                        Enter your weight to calculate estimated calories burned during your ride
                      </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4 pt-6">
                      <Button
                        onClick={calculationType === 'speed' ? calculateSpeed : calculationType === 'distance' ? calculateDistance : calculateTime}
                        className="flex-1 h-14 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold text-lg rounded-xl shadow-lg transform transition-all duration-200 hover:scale-105"
                        data-testid="button-calculate"
                      >
                        Calculate {calculationType === 'speed' ? 'Speed' : calculationType === 'distance' ? 'Distance' : 'Time'}
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
                      {/* Generated Results Display */}
                      <div className="bg-white rounded-2xl p-6 shadow-lg border border-blue-100">
                        <div className="text-center mb-6">
                          <h3 className="text-xl font-semibold text-gray-900 mb-2">Your Cycling Results</h3>
                          <p className="text-gray-600">
                            For {result.distance} {result.distanceUnit} in {formatTime(result.totalSeconds)}
                          </p>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-6">
                          <div className="text-center p-4 bg-blue-50 rounded-lg">
                            <div className="text-2xl font-bold text-blue-600" data-testid="result-speed-mph">
                              {result.speedMph}
                            </div>
                            <div className="text-sm text-blue-700 font-medium">mph</div>
                          </div>

                          <div className="text-center p-4 bg-green-50 rounded-lg">
                            <div className="text-2xl font-bold text-green-600" data-testid="result-speed-kmh">
                              {result.speedKmh}
                            </div>
                            <div className="text-sm text-green-700 font-medium">km/h</div>
                          </div>
                        </div>

                        {result.caloriesBurned && (
                          <div className="text-center p-4 bg-purple-50 rounded-lg">
                            <div className="text-2xl font-bold text-purple-600" data-testid="result-calories">
                              {result.caloriesBurned}
                            </div>
                            <div className="text-sm text-purple-700 font-medium">calories burned</div>
                          </div>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-col sm:flex-row gap-4">
                        <Button
                          onClick={handleCopy}
                          className="flex-1 h-12 bg-green-600 hover:bg-green-700 text-white font-medium rounded-xl"
                          data-testid="button-copy-results"
                        >
                          Copy Results
                        </Button>
                        <Button
                          onClick={handleClear}
                          variant="outline"
                          className="flex-1 h-12 border-2 border-gray-300 text-gray-700 hover:bg-gray-50 font-medium rounded-xl"
                          data-testid="button-clear-results"
                        >
                          Clear
                        </Button>
                      </div>

                      {/* Performance Insights */}
                      <div className="bg-white rounded-xl p-6 shadow-sm" data-testid="performance-insights">
                        <h3 className="font-bold text-gray-900 mb-4 text-lg">Performance Insights</h3>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600">Distance:</span>
                            <span className="font-medium">{result.distance} {result.distanceUnit}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600">Total Time:</span>
                            <span className="font-medium">{formatTime(result.totalSeconds)}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600">Average Speed:</span>
                            <span className="font-medium">{result.speedMph} mph ({result.speedKmh} km/h)</span>
                          </div>
                          {result.caloriesBurned && (
                            <div className="flex justify-between items-center">
                              <span className="text-gray-600">Calories Burned:</span>
                              <span className="font-medium">{result.caloriesBurned} cal</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-16" data-testid="no-results">
                      <div className="w-20 h-20 bg-gray-200 rounded-full mx-auto mb-6 flex items-center justify-center">
                        <div className="text-3xl font-bold text-gray-400">🚴</div>
                      </div>
                      <p className="text-gray-500 text-lg">Configure settings and calculate to see your cycling results</p>
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
                <h3 className="text-2xl font-bold text-gray-900 mb-6">What is a Cycling Speed Calculator?</h3>
                <div className="space-y-4 text-gray-600">
                  <p>
                    A cycling speed calculator is a specialized tool that helps cyclists calculate their average speed, 
                    distance traveled, or ride time based on two known variables. Our professional cycling calculator 
                    provides accurate calculations for training, performance analysis, and ride planning.
                  </p>
                  <p>
                    Whether you're a recreational cyclist, competitive athlete, or fitness enthusiast, this calculator 
                    helps you track performance metrics, plan training sessions, and analyze ride data with precision. 
                    The tool supports multiple units and provides additional insights like calorie burn estimation.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Why Use a Cycling Speed Calculator?</h3>
                <div className="space-y-4 text-gray-600">
                  <p>
                    Cycling speed calculations are essential for training optimization, performance tracking, and goal 
                    setting. Understanding your cycling metrics helps improve training efficiency and provides valuable 
                    data for progress monitoring.
                  </p>
                  <ul className="space-y-2 list-disc list-inside">
                    <li>Track and analyze cycling performance over time</li>
                    <li>Plan training sessions with specific speed targets</li>
                    <li>Calculate calories burned during cycling activities</li>
                    <li>Compare performance across different routes and conditions</li>
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
                    <span>Calculate speed from distance and time inputs</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Calculate distance from speed and time values</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Calculate ride time from speed and distance</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Multiple unit support (miles, kilometers, meters)</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Calorie burn estimation based on weight and intensity</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Professional Applications</h3>
                <div className="space-y-3 text-gray-600">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Training session planning and optimization</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Performance analysis and progress tracking</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Event preparation and pacing strategies</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Fitness goal setting and achievement tracking</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Commuting time and route planning</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Additional SEO Content Sections */}
          <div className="mt-12 space-y-8">
            {/* Cycling Speed Ranges */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Average Cycling Speeds by Category</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-gray-800">Recreational Cycling</h4>
                    <p className="text-gray-600">
                      <span className="font-medium">8-12 mph (13-19 km/h)</span><br />
                      Leisurely rides on bike paths, park cycling, and casual neighborhood tours. 
                      Perfect for beginners and relaxed family outings.
                    </p>
                  </div>
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-gray-800">Commuting Cycling</h4>
                    <p className="text-gray-600">
                      <span className="font-medium">12-16 mph (19-26 km/h)</span><br />
                      Urban cycling with traffic considerations, mixed terrain, and stop-and-go 
                      conditions. Typical for daily commuters.
                    </p>
                  </div>
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-gray-800">Fitness Cycling</h4>
                    <p className="text-gray-600">
                      <span className="font-medium">16-20 mph (26-32 km/h)</span><br />
                      Training rides focused on fitness improvement, road cycling for exercise, 
                      and structured workout sessions.
                    </p>
                  </div>
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-gray-800">Competitive Cycling</h4>
                    <p className="text-gray-600">
                      <span className="font-medium">20-25 mph (32-40 km/h)</span><br />
                      Racing pace, group rides, and competitive training. Requires significant 
                      fitness and cycling experience.
                    </p>
                  </div>
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-gray-800">Professional Racing</h4>
                    <p className="text-gray-600">
                      <span className="font-medium">25+ mph (40+ km/h)</span><br />
                      Elite-level racing speeds achieved by professional cyclists in optimal 
                      conditions with aerodynamic equipment.
                    </p>
                  </div>
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-gray-800">Mountain Biking</h4>
                    <p className="text-gray-600">
                      <span className="font-medium">6-12 mph (10-19 km/h)</span><br />
                      Off-road cycling on technical terrain, trails, and varying elevation. 
                      Speed varies significantly with trail difficulty.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* How to Use Guide */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
                <CardContent className="p-8">
                  <h3 className="text-xl font-bold text-gray-900 mb-6">Calculate Speed</h3>
                  <div className="space-y-4 text-gray-600">
                    <p className="text-sm">
                      Enter your distance traveled and time taken to calculate your average cycling speed. 
                      This is most useful for analyzing completed rides.
                    </p>
                    <div className="space-y-2">
                      <h4 className="font-semibold text-green-800 text-sm">Steps:</h4>
                      <ol className="text-xs space-y-1 list-decimal list-inside text-green-700">
                        <li>Select "Calculate Speed"</li>
                        <li>Enter distance and unit</li>
                        <li>Enter time (hours, minutes, seconds)</li>
                        <li>Add weight for calorie calculation</li>
                        <li>Click calculate for results</li>
                      </ol>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
                <CardContent className="p-8">
                  <h3 className="text-xl font-bold text-gray-900 mb-6">Calculate Distance</h3>
                  <div className="space-y-4 text-gray-600">
                    <p className="text-sm">
                      Enter your target speed and available time to calculate how far you can travel. 
                      Perfect for planning rides and setting distance goals.
                    </p>
                    <div className="space-y-2">
                      <h4 className="font-semibold text-blue-800 text-sm">Steps:</h4>
                      <ol className="text-xs space-y-1 list-decimal list-inside text-blue-700">
                        <li>Select "Calculate Distance"</li>
                        <li>Enter target speed and unit</li>
                        <li>Enter available time</li>
                        <li>Choose distance unit</li>
                        <li>Calculate to see distance</li>
                      </ol>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
                <CardContent className="p-8">
                  <h3 className="text-xl font-bold text-gray-900 mb-6">Calculate Time</h3>
                  <div className="space-y-4 text-gray-600">
                    <p className="text-sm">
                      Enter your target distance and planned speed to calculate required ride time. 
                      Essential for schedule planning and event preparation.
                    </p>
                    <div className="space-y-2">
                      <h4 className="font-semibold text-purple-800 text-sm">Steps:</h4>
                      <ol className="text-xs space-y-1 list-decimal list-inside text-purple-700">
                        <li>Select "Calculate Time"</li>
                        <li>Enter distance and unit</li>
                        <li>Enter planned speed</li>
                        <li>Calculate for time estimate</li>
                        <li>Use for ride planning</li>
                      </ol>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Performance Factors */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Factors Affecting Cycling Speed</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="space-y-4 text-gray-600">
                    <h4 className="font-semibold text-gray-800 mb-2">Environmental Factors</h4>
                    <ul className="space-y-2 text-sm">
                      <li><span className="font-medium">Wind Conditions:</span> Headwinds can reduce speed by 20-30%, while tailwinds can increase it significantly</li>
                      <li><span className="font-medium">Terrain:</span> Hills, mountains, and elevation changes dramatically impact average speed</li>
                      <li><span className="font-medium">Road Surface:</span> Smooth pavement vs. rough roads, gravel, or off-road conditions</li>
                      <li><span className="font-medium">Weather:</span> Temperature, humidity, and precipitation affect performance and comfort</li>
                    </ul>
                    <h4 className="font-semibold text-gray-800 mb-2 mt-4">Equipment Factors</h4>
                    <ul className="space-y-2 text-sm">
                      <li><span className="font-medium">Bike Type:</span> Road bikes are fastest, followed by hybrid, mountain, and electric bikes</li>
                      <li><span className="font-medium">Tire Pressure:</span> Properly inflated tires reduce rolling resistance and improve speed</li>
                      <li><span className="font-medium">Aerodynamics:</span> Riding position, clothing, and bike design affect wind resistance</li>
                    </ul>
                  </div>
                  <div className="space-y-4 text-gray-600">
                    <h4 className="font-semibold text-gray-800 mb-2">Rider Factors</h4>
                    <ul className="space-y-2 text-sm">
                      <li><span className="font-medium">Fitness Level:</span> Cardiovascular fitness and muscle strength directly impact sustainable speed</li>
                      <li><span className="font-medium">Experience:</span> Cycling technique, pacing, and efficiency improve with practice</li>
                      <li><span className="font-medium">Body Weight:</span> Lighter riders typically climb faster, while heavier riders may have more power on flats</li>
                      <li><span className="font-medium">Nutrition:</span> Proper fueling before and during long rides maintains performance</li>
                    </ul>
                    <h4 className="font-semibold text-gray-800 mb-2 mt-4">Training Factors</h4>
                    <ul className="space-y-2 text-sm">
                      <li><span className="font-medium">Endurance Training:</span> Long rides at moderate intensity build aerobic capacity</li>
                      <li><span className="font-medium">Interval Training:</span> High-intensity intervals improve power and speed</li>
                      <li><span className="font-medium">Recovery:</span> Adequate rest allows for adaptation and performance improvement</li>
                    </ul>
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
                      <h4 className="font-semibold text-gray-800 mb-2">What's a good average cycling speed for beginners?</h4>
                      <p className="text-gray-600 text-sm">
                        For beginners, 8-12 mph (13-19 km/h) is a reasonable starting point. Focus on building 
                        endurance and comfort on the bike before worrying about speed. Gradually increase pace 
                        as fitness and confidence improve.
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">How do I improve my cycling speed?</h4>
                      <p className="text-gray-600 text-sm">
                        Improve speed through consistent training, interval workouts, proper bike fit, 
                        maintaining optimal tire pressure, improving aerodynamics, and building both 
                        cardiovascular fitness and leg strength.
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">Does bike type affect speed calculations?</h4>
                      <p className="text-gray-600 text-sm">
                        While our calculator provides accurate speed calculations regardless of bike type, 
                        different bikes (road, mountain, hybrid) will naturally achieve different speeds 
                        under similar conditions due to design differences.
                      </p>
                    </div>
                  </div>
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">How accurate is the calorie calculation?</h4>
                      <p className="text-gray-600 text-sm">
                        Our calorie calculation provides a reasonable estimate based on weight, speed, and 
                        duration. Actual calories burned vary based on individual metabolism, effort level, 
                        terrain, and environmental conditions.
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">Should I use average or maximum speed for training?</h4>
                      <p className="text-gray-600 text-sm">
                        Average speed is more useful for training analysis and goal setting. It provides 
                        a realistic measure of sustained performance over the entire ride, accounting for 
                        stops, hills, and varying conditions.
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">Can I use this calculator for indoor cycling?</h4>
                      <p className="text-gray-600 text-sm">
                        Yes, the calculator works for indoor cycling when you have distance and time data. 
                        However, indoor speeds may differ from outdoor riding due to lack of wind resistance 
                        and terrain variations.
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
}
