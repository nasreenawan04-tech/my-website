
import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface SleepResult {
  targetSleepHours: number;
  bedtimes: string[];
  wakeupTimes: string[];
  sleepCycles: number;
  sleepQuality: {
    category: string;
    recommendations: string[];
  };
  ageGroup: string;
  optimalSchedule: {
    bedtime: string;
    wakeup: string;
    sleepDuration: string;
  };
  sleepEfficiency: number;
  deepSleepPercentage: number;
  remSleepPercentage: number;
}

export default function SleepCalculator() {
  const [calculationType, setCalculationType] = useState('optimal-bedtime');
  const [age, setAge] = useState('');
  const [wakeupTime, setWakeupTime] = useState('');
  const [bedtime, setBedtime] = useState('');
  const [sleepQuality, setSleepQuality] = useState('');
  const [lifestyle, setLifestyle] = useState('');
  const [fallAsleepTime, setFallAsleepTime] = useState('15');
  const [result, setResult] = useState<SleepResult | null>(null);

  const getSleepRecommendation = (age: number) => {
    if (age >= 0 && age <= 3) return { min: 11, max: 17, optimal: 14, category: 'Newborn/Infant' };
    if (age >= 4 && age <= 11) return { min: 10, max: 14, optimal: 12, category: 'Toddler/Preschooler' };
    if (age >= 12 && age <= 17) return { min: 9, max: 11, optimal: 10, category: 'School Age/Teen' };
    if (age >= 18 && age <= 25) return { min: 7, max: 9, optimal: 8, category: 'Young Adult' };
    if (age >= 26 && age <= 64) return { min: 7, max: 9, optimal: 8, category: 'Adult' };
    if (age >= 65) return { min: 7, max: 8, optimal: 7.5, category: 'Older Adult' };
    return { min: 7, max: 9, optimal: 8, category: 'Adult' };
  };

  const calculateSleepCycles = (hours: number) => {
    return Math.round(hours / 1.5);
  };

  const addMinutesToTime = (time: string, minutes: number): string => {
    const [hours, mins] = time.split(':').map(Number);
    const totalMinutes = hours * 60 + mins + minutes;
    const newHours = Math.floor(totalMinutes / 60) % 24;
    const newMins = totalMinutes % 60;
    return `${newHours.toString().padStart(2, '0')}:${newMins.toString().padStart(2, '0')}`;
  };

  const subtractMinutesFromTime = (time: string, minutes: number): string => {
    const [hours, mins] = time.split(':').map(Number);
    let totalMinutes = hours * 60 + mins - minutes;
    if (totalMinutes < 0) totalMinutes += 24 * 60;
    const newHours = Math.floor(totalMinutes / 60) % 24;
    const newMins = totalMinutes % 60;
    return `${newHours.toString().padStart(2, '0')}:${newMins.toString().padStart(2, '0')}`;
  };

  const calculateTimeDifference = (startTime: string, endTime: string): number => {
    const [startHours, startMins] = startTime.split(':').map(Number);
    const [endHours, endMins] = endTime.split(':').map(Number);
    
    let startMinutes = startHours * 60 + startMins;
    let endMinutes = endHours * 60 + endMins;
    
    if (endMinutes <= startMinutes) {
      endMinutes += 24 * 60;
    }
    
    return (endMinutes - startMinutes) / 60;
  };

  const formatDuration = (hours: number): string => {
    const wholeHours = Math.floor(hours);
    const minutes = Math.round((hours - wholeHours) * 60);
    if (minutes === 0) return `${wholeHours}h`;
    return `${wholeHours}h ${minutes}m`;
  };

  const calculateSleep = () => {
    const ageNum = parseFloat(age);
    if (!ageNum || ageNum < 0 || ageNum > 120) return;

    const sleepRec = getSleepRecommendation(ageNum);
    const fallAsleepMinutes = parseInt(fallAsleepTime);
    let bedtimes: string[] = [];
    let wakeupTimes: string[] = [];
    let optimalBedtime = '';
    let optimalWakeup = '';
    let actualSleepHours = 0;

    if (calculationType === 'optimal-bedtime' && wakeupTime) {
      const optimalSleepMinutes = sleepRec.optimal * 60 + fallAsleepMinutes;
      optimalBedtime = subtractMinutesFromTime(wakeupTime, optimalSleepMinutes);
      optimalWakeup = wakeupTime;

      const cycles = [4, 5, 6];
      bedtimes = cycles.map(cycle => {
        const sleepMinutes = cycle * 90 + fallAsleepMinutes;
        return subtractMinutesFromTime(wakeupTime, sleepMinutes);
      });
    } else if (calculationType === 'optimal-wakeup' && bedtime) {
      optimalBedtime = bedtime;
      const optimalSleepMinutes = sleepRec.optimal * 60;
      optimalWakeup = addMinutesToTime(bedtime, optimalSleepMinutes);

      const cycles = [4, 5, 6];
      wakeupTimes = cycles.map(cycle => {
        const sleepMinutes = cycle * 90;
        return addMinutesToTime(bedtime, sleepMinutes);
      });
    } else if (calculationType === 'sleep-analysis' && bedtime && wakeupTime) {
      actualSleepHours = calculateTimeDifference(bedtime, wakeupTime) - (fallAsleepMinutes / 60);
      optimalBedtime = bedtime;
      optimalWakeup = wakeupTime;
    }

    let qualityCategory = 'Good';
    let recommendations: string[] = [];

    if (actualSleepHours > 0) {
      if (actualSleepHours < sleepRec.min) {
        qualityCategory = 'Insufficient';
        recommendations.push(`You're getting ${actualSleepHours.toFixed(1)} hours, but need ${sleepRec.min}-${sleepRec.max} hours`);
        recommendations.push('Consider going to bed earlier or adjusting your wake-up time');
      } else if (actualSleepHours > sleepRec.max) {
        qualityCategory = 'Excessive';
        recommendations.push(`You're getting ${actualSleepHours.toFixed(1)} hours, which may be too much`);
        recommendations.push('Try adjusting your sleep schedule gradually');
      } else {
        qualityCategory = 'Optimal';
        recommendations.push('Your sleep duration is within the recommended range for your age');
      }
    }

    if (lifestyle === 'shift-worker') {
      recommendations.push('Maintain consistent sleep schedule when possible, even on days off');
      recommendations.push('Use blackout curtains and avoid caffeine 6 hours before sleep');
    } else if (lifestyle === 'student') {
      recommendations.push('Prioritize consistent sleep schedule during exam periods');
      recommendations.push('Avoid all-nighters which significantly disrupt sleep cycles');
    } else if (lifestyle === 'parent') {
      recommendations.push('Take short 20-30 minute naps when possible to compensate');
      recommendations.push('Share nighttime duties with partner to ensure adequate rest');
    } else if (lifestyle === 'athlete') {
      recommendations.push('Consider extending sleep during intensive training periods');
      recommendations.push('Focus on sleep quality for optimal recovery and performance');
    }

    recommendations.push('Keep bedroom temperature between 60-67°F (15-19°C)');
    recommendations.push('Avoid electronic devices 1-2 hours before bedtime');
    recommendations.push('Create a consistent, relaxing bedtime routine');
    recommendations.push('Get morning sunlight exposure to regulate circadian rhythm');

    const sleepEfficiency = actualSleepHours > 0 ? Math.min(100, (actualSleepHours / (actualSleepHours + fallAsleepMinutes / 60)) * 100) : 85;
    const deepSleepPercentage = actualSleepHours > 0 ? Math.min(25, Math.max(15, 20 - (Math.abs(actualSleepHours - sleepRec.optimal) * 2))) : 20;
    const remSleepPercentage = actualSleepHours > 0 ? Math.min(25, Math.max(15, 22 - (Math.abs(actualSleepHours - sleepRec.optimal) * 1.5))) : 22;

    const newResult: SleepResult = {
      targetSleepHours: sleepRec.optimal,
      bedtimes,
      wakeupTimes,
      sleepCycles: calculateSleepCycles(sleepRec.optimal),
      sleepQuality: {
        category: qualityCategory,
        recommendations
      },
      ageGroup: sleepRec.category,
      optimalSchedule: {
        bedtime: optimalBedtime,
        wakeup: optimalWakeup,
        sleepDuration: formatDuration(actualSleepHours || sleepRec.optimal)
      },
      sleepEfficiency: Math.round(sleepEfficiency),
      deepSleepPercentage: Math.round(deepSleepPercentage),
      remSleepPercentage: Math.round(remSleepPercentage)
    };

    setResult(newResult);
  };

  const resetCalculator = () => {
    setAge('');
    setWakeupTime('');
    setBedtime('');
    setSleepQuality('');
    setLifestyle('');
    setFallAsleepTime('15');
    setCalculationType('optimal-bedtime');
    setResult(null);
  };

  const getQualityColor = (category: string) => {
    if (category === 'Optimal' || category === 'Good') return 'text-green-600';
    if (category === 'Insufficient') return 'text-red-600';
    if (category === 'Excessive') return 'text-orange-600';
    return 'text-gray-600';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Helmet>
        <title>Sleep Calculator - Optimize Sleep Schedule & Calculate Sleep Cycles | DapsiWow</title>
        <meta name="description" content="Free sleep calculator to optimize your sleep schedule based on natural sleep cycles. Calculate ideal bedtime and wake-up times, analyze sleep quality, and get personalized recommendations for better rest." />
        <meta name="keywords" content="sleep calculator, sleep cycles calculator, bedtime calculator, wake up time calculator, sleep schedule optimizer, sleep quality analyzer, circadian rhythm calculator, REM sleep calculator, deep sleep tracker" />
        <meta property="og:title" content="Sleep Calculator - Optimize Sleep Schedule & Calculate Sleep Cycles | DapsiWow" />
        <meta property="og:description" content="Professional sleep calculator to optimize your sleep schedule based on natural 90-minute sleep cycles and age-specific recommendations. Improve sleep quality instantly." />
        <meta property="og:type" content="website" />
        <meta name="robots" content="index, follow" />
        <meta name="author" content="DapsiWow" />
        <link rel="canonical" href="https://dapsiwow.com/tools/sleep-calculator" />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            "name": "Sleep Calculator",
            "description": "Free online sleep calculator to optimize sleep schedules based on natural sleep cycles. Calculate ideal bedtime and wake-up times with personalized recommendations.",
            "url": "https://dapsiwow.com/tools/sleep-calculator",
            "applicationCategory": "HealthApplication",
            "operatingSystem": "Any",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "USD"
            },
            "featureList": [
              "Calculate optimal bedtime and wake-up times",
              "Analyze sleep cycles and quality",
              "Age-specific sleep recommendations",
              "Lifestyle-based sleep advice",
              "Sleep efficiency tracking"
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
                <span className="text-xs sm:text-sm font-medium text-blue-700">Professional Sleep Calculator</span>
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl 2xl:text-8xl font-bold text-slate-900 leading-tight tracking-tight">
                <span className="block">Smart Sleep</span>
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 mt-1 sm:mt-2">
                  Calculator
                </span>
              </h1>
              <p className="text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl text-slate-600 max-w-sm sm:max-w-lg md:max-w-2xl lg:max-w-3xl xl:max-w-4xl mx-auto leading-relaxed px-2 sm:px-0">
                Optimize your sleep schedule based on natural 90-minute sleep cycles and get personalized recommendations
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
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">Sleep Schedule Configuration</h2>
                    <p className="text-gray-600">Enter your details to calculate optimal sleep and wake times</p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Calculation Type */}
                    <div className="md:col-span-2 space-y-3">
                      <Label className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                        What would you like to calculate?
                      </Label>
                      <Select value={calculationType} onValueChange={setCalculationType}>
                        <SelectTrigger className="h-14 border-2 border-gray-200 rounded-xl text-lg" data-testid="select-calculation-type">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="optimal-bedtime">Optimal bedtime (I know my wake-up time)</SelectItem>
                          <SelectItem value="optimal-wakeup">Optimal wake-up time (I know my bedtime)</SelectItem>
                          <SelectItem value="sleep-analysis">Analyze my current sleep schedule</SelectItem>
                        </SelectContent>
                      </Select>
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
                        min="0"
                        max="120"
                        data-testid="input-age"
                      />
                    </div>

                    {/* Time to Fall Asleep */}
                    <div className="space-y-3">
                      <Label htmlFor="fall-asleep-time" className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                        Time to Fall Asleep (minutes)
                      </Label>
                      <Input
                        id="fall-asleep-time"
                        type="number"
                        value={fallAsleepTime}
                        onChange={(e) => setFallAsleepTime(e.target.value)}
                        className="h-14 text-lg border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-blue-500"
                        placeholder="15"
                        min="5"
                        max="60"
                        data-testid="input-fall-asleep-time"
                      />
                    </div>

                    {/* Wake-up Time */}
                    {(calculationType === 'optimal-bedtime' || calculationType === 'sleep-analysis') && (
                      <div className="space-y-3">
                        <Label htmlFor="wakeup-time" className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                          Wake-up Time
                        </Label>
                        <Input
                          id="wakeup-time"
                          type="time"
                          value={wakeupTime}
                          onChange={(e) => setWakeupTime(e.target.value)}
                          className="h-14 text-lg border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-blue-500"
                          data-testid="input-wakeup-time"
                        />
                      </div>
                    )}

                    {/* Bedtime */}
                    {(calculationType === 'optimal-wakeup' || calculationType === 'sleep-analysis') && (
                      <div className="space-y-3">
                        <Label htmlFor="bedtime" className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                          Bedtime
                        </Label>
                        <Input
                          id="bedtime"
                          type="time"
                          value={bedtime}
                          onChange={(e) => setBedtime(e.target.value)}
                          className="h-14 text-lg border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-blue-500"
                          data-testid="input-bedtime"
                        />
                      </div>
                    )}

                    {/* Sleep Quality */}
                    <div className="space-y-3">
                      <Label className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                        Current Sleep Quality
                      </Label>
                      <Select value={sleepQuality} onValueChange={setSleepQuality}>
                        <SelectTrigger className="h-14 border-2 border-gray-200 rounded-xl text-lg" data-testid="select-sleep-quality">
                          <SelectValue placeholder="Select sleep quality" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="excellent">Excellent - Always refreshed</SelectItem>
                          <SelectItem value="good">Good - Generally well-rested</SelectItem>
                          <SelectItem value="fair">Fair - Sometimes tired</SelectItem>
                          <SelectItem value="poor">Poor - Often tired</SelectItem>
                          <SelectItem value="very-poor">Very Poor - Always exhausted</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Lifestyle */}
                    <div className="space-y-3">
                      <Label className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                        Lifestyle Type
                      </Label>
                      <Select value={lifestyle} onValueChange={setLifestyle}>
                        <SelectTrigger className="h-14 border-2 border-gray-200 rounded-xl text-lg" data-testid="select-lifestyle">
                          <SelectValue placeholder="Select lifestyle type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="regular">Regular 9-5 schedule</SelectItem>
                          <SelectItem value="shift-worker">Shift worker</SelectItem>
                          <SelectItem value="student">Student</SelectItem>
                          <SelectItem value="parent">Parent with young children</SelectItem>
                          <SelectItem value="freelancer">Freelancer/flexible schedule</SelectItem>
                          <SelectItem value="athlete">Athlete/very active</SelectItem>
                          <SelectItem value="retiree">Retired/senior</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Information Box */}
                  <div className="space-y-6 border-t pt-8">
                    <div className="bg-gray-50 rounded-xl p-6">
                      <h3 className="text-xl font-bold text-gray-900 mb-4">Sleep Cycle Science</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                        <ul className="space-y-2">
                          <li>• Complete sleep cycles last 90 minutes</li>
                          <li>• Adults need 4-6 cycles per night</li>
                          <li>• Waking mid-cycle causes grogginess</li>
                        </ul>
                        <ul className="space-y-2">
                          <li>• Deep sleep occurs in first cycles</li>
                          <li>• REM sleep increases toward morning</li>
                          <li>• Consistent timing improves quality</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-4 pt-6">
                    <Button
                      onClick={calculateSleep}
                      className="flex-1 h-14 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold text-lg rounded-xl shadow-lg transform transition-all duration-200 hover:scale-105"
                      data-testid="button-calculate"
                    >
                      Calculate Sleep Schedule
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
                  <h2 className="text-2xl font-bold text-gray-900 mb-8">Sleep Analysis</h2>
                  
                  {result ? (
                    <div className="space-y-6" data-testid="sleep-results">
                      {/* Recommended Sleep Duration */}
                      <div className="bg-white rounded-2xl p-6 shadow-lg border border-blue-100">
                        <div className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-2">Recommended Sleep</div>
                        <div className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600" data-testid="text-target-sleep">
                          {result.targetSleepHours}h
                        </div>
                        <div className="text-sm text-gray-500 mt-2">
                          {result.ageGroup} • {result.sleepCycles} sleep cycles
                        </div>
                      </div>

                      {/* Optimal Schedule */}
                      <div className="space-y-4">
                        {result.optimalSchedule.bedtime && (
                          <div className="bg-white rounded-xl p-4 shadow-sm">
                            <div className="flex justify-between items-center">
                              <span className="font-medium text-gray-700">Optimal Bedtime</span>
                              <span className="font-bold text-gray-900" data-testid="text-optimal-bedtime">
                                {result.optimalSchedule.bedtime}
                              </span>
                            </div>
                          </div>
                        )}
                        {result.optimalSchedule.wakeup && (
                          <div className="bg-white rounded-xl p-4 shadow-sm">
                            <div className="flex justify-between items-center">
                              <span className="font-medium text-gray-700">Optimal Wake-up</span>
                              <span className="font-bold text-gray-900" data-testid="text-optimal-wakeup">
                                {result.optimalSchedule.wakeup}
                              </span>
                            </div>
                          </div>
                        )}
                        <div className="bg-white rounded-xl p-4 shadow-sm">
                          <div className="flex justify-between items-center">
                            <span className="font-medium text-gray-700">Sleep Duration</span>
                            <span className="font-bold text-gray-900" data-testid="text-sleep-duration">
                              {result.optimalSchedule.sleepDuration}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Alternative Times */}
                      {result.bedtimes.length > 0 && (
                        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
                          <h4 className="font-bold text-green-800 mb-4 text-lg">Alternative Bedtimes</h4>
                          <div className="space-y-3">
                            {result.bedtimes.map((time, index) => (
                              <div key={index} className="flex justify-between items-center">
                                <span className="text-green-700 font-medium">{4 + index} sleep cycles</span>
                                <span className="font-bold text-green-800 text-lg">{time}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {result.wakeupTimes.length > 0 && (
                        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
                          <h4 className="font-bold text-green-800 mb-4 text-lg">Alternative Wake-up Times</h4>
                          <div className="space-y-3">
                            {result.wakeupTimes.map((time, index) => (
                              <div key={index} className="flex justify-between items-center">
                                <span className="text-green-700 font-medium">{4 + index} sleep cycles</span>
                                <span className="font-bold text-green-800 text-lg">{time}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Sleep Quality Assessment */}
                      <div className="bg-white rounded-xl p-4 shadow-sm">
                        <div className="flex justify-between items-center">
                          <span className="font-medium text-gray-700">Sleep Quality</span>
                          <span className={`font-bold ${getQualityColor(result.sleepQuality.category)}`} data-testid="text-sleep-quality">
                            {result.sleepQuality.category}
                          </span>
                        </div>
                      </div>

                      {/* Sleep Metrics */}
                      <div className="space-y-4">
                        <div className="bg-white rounded-xl p-4 shadow-sm">
                          <div className="flex justify-between items-center">
                            <span className="font-medium text-gray-700">Sleep Efficiency</span>
                            <span className="font-bold text-blue-600">{result.sleepEfficiency}%</span>
                          </div>
                        </div>
                        <div className="bg-white rounded-xl p-4 shadow-sm">
                          <div className="flex justify-between items-center">
                            <span className="font-medium text-gray-700">Deep Sleep</span>
                            <span className="font-bold text-purple-600">{result.deepSleepPercentage}%</span>
                          </div>
                        </div>
                        <div className="bg-white rounded-xl p-4 shadow-sm">
                          <div className="flex justify-between items-center">
                            <span className="font-medium text-gray-700">REM Sleep</span>
                            <span className="font-bold text-orange-600">{result.remSleepPercentage}%</span>
                          </div>
                        </div>
                      </div>

                      {/* Recommendations */}
                      <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-6 border border-purple-200">
                        <h4 className="font-bold text-purple-800 mb-4 text-lg">Personalized Recommendations</h4>
                        <ul className="space-y-2">
                          {result.sleepQuality.recommendations.map((rec, index) => (
                            <li key={index} className="flex items-start text-purple-700">
                              <span className="mr-2 text-purple-500">•</span>
                              <span className="text-sm">{rec}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-16" data-testid="no-results">
                      <div className="w-20 h-20 bg-gray-200 rounded-full mx-auto mb-6 flex items-center justify-center">
                        <div className="text-3xl font-bold text-gray-400">😴</div>
                      </div>
                      <p className="text-gray-500 text-lg">Enter your details and calculate to see sleep recommendations</p>
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
                <h3 className="text-2xl font-bold text-gray-900 mb-6">What is a Sleep Calculator?</h3>
                <div className="space-y-4 text-gray-600">
                  <p>
                    A sleep calculator is a scientific tool that helps optimize your sleep schedule based on natural 
                    90-minute sleep cycles and circadian rhythm principles. It calculates optimal bedtime and wake-up 
                    times to ensure you wake up feeling refreshed rather than groggy, maximizing sleep quality and 
                    overall well-being.
                  </p>
                  <p>
                    Our advanced sleep calculator considers multiple factors including age-specific sleep requirements, 
                    time needed to fall asleep, and lifestyle factors to provide personalized recommendations. By 
                    aligning your sleep schedule with natural sleep cycles, you can improve sleep efficiency and 
                    wake up at the optimal time in your sleep cycle.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">How Do Sleep Cycles Work?</h3>
                <div className="space-y-4 text-gray-600">
                  <p>
                    Sleep cycles consist of four stages: Light Sleep (N1, N2), Deep Sleep (N3), and REM Sleep. 
                    Each complete cycle lasts approximately 90 minutes, and adults typically experience 4-6 cycles 
                    per night. Waking up at the end of a cycle leaves you feeling refreshed, while waking mid-cycle 
                    can cause sleep inertia or grogginess.
                  </p>
                  <ul className="space-y-2 list-disc list-inside">
                    <li>Stage 1-2: Light sleep transition and maintenance</li>
                    <li>Stage 3: Deep sleep for physical recovery</li>
                    <li>REM: Dream sleep for mental processing and memory</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Features of Our Sleep Calculator</h3>
                <div className="space-y-3 text-gray-600">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Age-specific sleep duration recommendations</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>90-minute sleep cycle optimization</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Lifestyle-based personalized recommendations</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Sleep quality analysis and tracking</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Alternative bedtime and wake-up options</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Benefits of Optimized Sleep</h3>
                <div className="space-y-3 text-gray-600">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Enhanced cognitive function and memory</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Improved physical recovery and immune system</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Better mood regulation and emotional stability</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Increased energy and daytime alertness</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Reduced risk of chronic health conditions</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Additional SEO Content Sections */}
          <div className="mt-12 space-y-8">
            {/* Age-Based Sleep Requirements */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-8">Age-Based Sleep Requirements</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-gray-800">Newborns & Infants (0-11 months)</h4>
                    <div className="bg-blue-50 rounded-lg p-4">
                      <div className="font-bold text-blue-800 text-xl">11-17 hours</div>
                      <p className="text-blue-700 text-sm mt-2">
                        Newborns sleep in 2-4 hour periods throughout the day. Sleep patterns gradually consolidate 
                        into longer nighttime periods by 3-6 months.
                      </p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-gray-800">Toddlers & Preschoolers (1-5 years)</h4>
                    <div className="bg-green-50 rounded-lg p-4">
                      <div className="font-bold text-green-800 text-xl">10-14 hours</div>
                      <p className="text-green-700 text-sm mt-2">
                        Includes nighttime sleep plus one afternoon nap. Most children stop napping between 
                        ages 3-5, requiring slightly more nighttime sleep.
                      </p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-gray-800">School Age & Teens (6-17 years)</h4>
                    <div className="bg-purple-50 rounded-lg p-4">
                      <div className="font-bold text-purple-800 text-xl">8-11 hours</div>
                      <p className="text-purple-700 text-sm mt-2">
                        School-age children need consistent bedtimes. Teenagers have delayed circadian rhythms, 
                        naturally wanting to sleep and wake later.
                      </p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-gray-800">Young Adults (18-25 years)</h4>
                    <div className="bg-orange-50 rounded-lg p-4">
                      <div className="font-bold text-orange-800 text-xl">7-9 hours</div>
                      <p className="text-orange-700 text-sm mt-2">
                        College students and young professionals often have irregular schedules. Consistent 
                        sleep timing is crucial for academic and work performance.
                      </p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-gray-800">Adults (26-64 years)</h4>
                    <div className="bg-red-50 rounded-lg p-4">
                      <div className="font-bold text-red-800 text-xl">7-9 hours</div>
                      <p className="text-red-700 text-sm mt-2">
                        Peak working years require optimal sleep for productivity. Sleep quality becomes 
                        as important as quantity for recovery and health.
                      </p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-gray-800">Older Adults (65+ years)</h4>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="font-bold text-gray-800 text-xl">7-8 hours</div>
                      <p className="text-gray-700 text-sm mt-2">
                        Natural aging changes sleep architecture. Earlier bedtimes and wake times are 
                        common, with more fragmented sleep patterns.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Sleep Optimization Strategies */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
                <CardContent className="p-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">Sleep Hygiene Best Practices</h3>
                  <div className="space-y-4 text-gray-600">
                    <div className="border-l-4 border-blue-500 pl-4">
                      <h4 className="font-semibold text-gray-800 mb-2">Sleep Environment</h4>
                      <p className="text-sm">Keep bedroom cool (60-67°F), dark, and quiet. Invest in quality bedding and eliminate light pollution with blackout curtains.</p>
                    </div>
                    <div className="border-l-4 border-green-500 pl-4">
                      <h4 className="font-semibold text-gray-800 mb-2">Consistent Schedule</h4>
                      <p className="text-sm">Go to bed and wake up at the same time every day, including weekends, to reinforce your natural circadian rhythm.</p>
                    </div>
                    <div className="border-l-4 border-orange-500 pl-4">
                      <h4 className="font-semibold text-gray-800 mb-2">Pre-Sleep Routine</h4>
                      <p className="text-sm">Develop a relaxing bedtime routine 1-2 hours before sleep. Avoid screens, bright lights, and stimulating activities.</p>
                    </div>
                    <div className="border-l-4 border-purple-500 pl-4">
                      <h4 className="font-semibold text-gray-800 mb-2">Daytime Habits</h4>
                      <p className="text-sm">Get morning sunlight exposure, exercise regularly (but not close to bedtime), and avoid caffeine 6+ hours before sleep.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
                <CardContent className="p-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">Common Sleep Challenges</h3>
                  <div className="space-y-4 text-gray-600">
                    <div className="bg-red-50 rounded-lg p-4">
                      <h4 className="font-semibold text-red-800 mb-2">Sleep Inertia</h4>
                      <p className="text-sm text-red-700">Grogginess upon waking, often caused by waking mid-sleep cycle. Our calculator helps you wake at optimal cycle endpoints.</p>
                    </div>
                    <div className="bg-orange-50 rounded-lg p-4">
                      <h4 className="font-semibold text-orange-800 mb-2">Shift Work Disorder</h4>
                      <p className="text-sm text-orange-700">Difficulty sleeping due to work schedules. Maintain consistent sleep times when possible and use light therapy.</p>
                    </div>
                    <div className="bg-yellow-50 rounded-lg p-4">
                      <h4 className="font-semibold text-yellow-800 mb-2">Social Jet Lag</h4>
                      <p className="text-sm text-yellow-700">Misalignment between weekday and weekend sleep schedules. Minimize differences to maintain circadian health.</p>
                    </div>
                    <div className="bg-blue-50 rounded-lg p-4">
                      <h4 className="font-semibold text-blue-800 mb-2">Technology Interference</h4>
                      <p className="text-sm text-blue-700">Blue light from screens suppresses melatonin. Use blue light filters or avoid devices 1-2 hours before bed.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sleep Science Deep Dive */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-8">Understanding Sleep Architecture</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div>
                    <h4 className="text-xl font-semibold text-gray-900 mb-4">Sleep Stages Explained</h4>
                    <div className="space-y-4">
                      <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-4">
                        <h5 className="font-semibold text-blue-800 mb-2">Stage 1 (N1) - Light Sleep</h5>
                        <p className="text-blue-700 text-sm">
                          Transition from wakefulness to sleep. Lasts 5-10 minutes. Easy to wake up, may experience 
                          hypnic jerks or feeling of falling.
                        </p>
                      </div>
                      
                      <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-lg p-4">
                        <h5 className="font-semibold text-green-800 mb-2">Stage 2 (N2) - Light Sleep</h5>
                        <p className="text-green-700 text-sm">
                          Comprises 45-55% of total sleep. Heart rate and breathing slow down. Sleep spindles and 
                          K-complexes help maintain sleep.
                        </p>
                      </div>
                      
                      <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg p-4">
                        <h5 className="font-semibold text-purple-800 mb-2">Stage 3 (N3) - Deep Sleep</h5>
                        <p className="text-purple-700 text-sm">
                          Most restorative stage. Physical recovery, immune function, and growth hormone release. 
                          Difficult to wake from this stage.
                        </p>
                      </div>
                      
                      <div className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-lg p-4">
                        <h5 className="font-semibold text-orange-800 mb-2">REM Sleep - Dream Stage</h5>
                        <p className="text-orange-700 text-sm">
                          Rapid Eye Movement sleep. Vivid dreams, memory consolidation, and emotional processing. 
                          Brain activity similar to wakefulness.
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-xl font-semibold text-gray-900 mb-4">Circadian Rhythm Factors</h4>
                    <div className="space-y-4">
                      <div className="bg-yellow-50 border-l-4 border-yellow-400 pl-4 py-3">
                        <h5 className="font-semibold text-yellow-800">Light Exposure</h5>
                        <p className="text-yellow-700 text-sm mt-1">
                          Natural light regulates melatonin production. Morning sunlight advances circadian phase, 
                          while evening light delays it.
                        </p>
                      </div>
                      
                      <div className="bg-indigo-50 border-l-4 border-indigo-400 pl-4 py-3">
                        <h5 className="font-semibold text-indigo-800">Core Body Temperature</h5>
                        <p className="text-indigo-700 text-sm mt-1">
                          Body temperature naturally drops before sleep. Keeping bedroom cool facilitates this 
                          natural temperature decline.
                        </p>
                      </div>
                      
                      <div className="bg-pink-50 border-l-4 border-pink-400 pl-4 py-3">
                        <h5 className="font-semibold text-pink-800">Hormone Cycles</h5>
                        <p className="text-pink-700 text-sm mt-1">
                          Melatonin increases in darkness, cortisol rises before waking. Disrupted cycles affect 
                          sleep quality and timing.
                        </p>
                      </div>
                      
                      <div className="bg-teal-50 border-l-4 border-teal-400 pl-4 py-3">
                        <h5 className="font-semibold text-teal-800">Social Cues</h5>
                        <p className="text-teal-700 text-sm mt-1">
                          Work schedules, meal times, and social activities influence circadian timing. Consistency 
                          in these cues supports better sleep.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Frequently Asked Questions */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-8">Frequently Asked Questions</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">Why do I wake up tired even after 8 hours of sleep?</h4>
                      <p className="text-gray-600 text-sm">You might be waking up mid-sleep cycle. Our calculator helps you time your sleep to wake at the end of a 90-minute cycle, reducing grogginess and sleep inertia.</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">Is it better to go to bed early or wake up late?</h4>
                      <p className="text-gray-600 text-sm">Consistency is key. Choose a schedule that fits your lifestyle and stick to it daily, including weekends. Earlier bedtimes often align better with natural circadian rhythms.</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">How long does it take to adjust to a new sleep schedule?</h4>
                      <p className="text-gray-600 text-sm">Most people need 1-2 weeks to fully adjust to a new schedule. Gradual shifts of 15-30 minutes per night are easier than dramatic changes.</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">Should I nap during the day?</h4>
                      <p className="text-gray-600 text-sm">Short naps (20-30 minutes) between 1-3 PM can be refreshing without interfering with nighttime sleep. Avoid naps after 4 PM or longer than 30 minutes.</p>
                    </div>
                  </div>
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">What if I can't fall asleep within 15 minutes?</h4>
                      <p className="text-gray-600 text-sm">If you're still awake after 20 minutes, get up and do a quiet, non-stimulating activity until sleepy. This prevents your brain from associating bed with wakefulness.</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">How does age affect sleep needs?</h4>
                      <p className="text-gray-600 text-sm">Sleep needs decrease with age, but quality remains important. Older adults often experience earlier bedtimes, more frequent awakenings, and changes in sleep architecture.</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">Can I catch up on lost sleep on weekends?</h4>
                      <p className="text-gray-600 text-sm">While some recovery is possible, consistent daily adequate sleep is better than attempting to "catch up." Large weekend sleep-ins can disrupt your circadian rhythm.</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">When should I seek professional help for sleep issues?</h4>
                      <p className="text-gray-600 text-sm">Consult a healthcare provider if you experience persistent insomnia, excessive daytime sleepiness, loud snoring, or breathing interruptions during sleep.</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Lifestyle-Specific Sleep Tips */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
                <CardContent className="p-8">
                  <h3 className="text-xl font-bold text-gray-900 mb-6">Shift Workers</h3>
                  <div className="space-y-4 text-gray-600">
                    <p className="text-sm">Working irregular hours requires special sleep strategies to maintain health and performance.</p>
                    <div className="space-y-2">
                      <h4 className="font-semibold text-green-800 text-sm">Strategies:</h4>
                      <ul className="text-xs space-y-1 list-disc list-inside text-green-700">
                        <li>Use blackout curtains for daytime sleep</li>
                        <li>Maintain consistent sleep duration</li>
                        <li>Strategic caffeine use during work</li>
                        <li>Light therapy to adjust circadian rhythm</li>
                        <li>Avoid alcohol and large meals before sleep</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
                <CardContent className="p-8">
                  <h3 className="text-xl font-bold text-gray-900 mb-6">Students</h3>
                  <div className="space-y-4 text-gray-600">
                    <p className="text-sm">Academic performance is directly linked to sleep quality and duration, especially during exam periods.</p>
                    <div className="space-y-2">
                      <h4 className="font-semibold text-blue-800 text-sm">Study Tips:</h4>
                      <ul className="text-xs space-y-1 list-disc list-inside text-blue-700">
                        <li>Avoid all-nighters before exams</li>
                        <li>Schedule study sessions earlier in day</li>
                        <li>Take power naps between classes</li>
                        <li>Limit late-night screen time</li>
                        <li>Use consistent wake times even on weekends</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
                <CardContent className="p-8">
                  <h3 className="text-xl font-bold text-gray-900 mb-6">New Parents</h3>
                  <div className="space-y-4 text-gray-600">
                    <p className="text-sm">Fragmented sleep is inevitable with newborns, but strategic approaches can help maximize rest.</p>
                    <div className="space-y-2">
                      <h4 className="font-semibold text-purple-800 text-sm">Survival Tips:</h4>
                      <ul className="text-xs space-y-1 list-disc list-inside text-purple-700">
                        <li>Sleep when baby sleeps</li>
                        <li>Share night duties with partner</li>
                        <li>Accept help from family and friends</li>
                        <li>Prioritize sleep over household tasks</li>
                        <li>Consider co-sleeping safety guidelines</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
