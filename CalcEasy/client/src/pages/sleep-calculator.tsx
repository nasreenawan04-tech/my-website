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
import { Calculator, Moon } from 'lucide-react';

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
}

const SleepCalculator = () => {
  const [calculationType, setCalculationType] = useState('optimal-sleep');
  const [age, setAge] = useState('');
  const [wakeupTime, setWakeupTime] = useState('');
  const [bedtime, setBedtime] = useState('');
  const [currentSleep, setCurrentSleep] = useState('');
  const [sleepQuality, setSleepQuality] = useState('');
  const [lifestyle, setLifestyle] = useState('');
  const [result, setResult] = useState<SleepResult | null>(null);

  const getSleepRecommendation = (age: number) => {
    if (age >= 0 && age <= 3) return { min: 11, max: 17, optimal: 14, category: 'Newborn/Infant' };
    if (age >= 4 && age <= 11) return { min: 10, max: 14, optimal: 12, category: 'Toddler' };
    if (age >= 12 && age <= 17) return { min: 9, max: 11, optimal: 10, category: 'Preschooler' };
    if (age >= 18 && age <= 25) return { min: 7, max: 9, optimal: 8, category: 'School Age' };
    if (age >= 26 && age <= 64) return { min: 7, max: 9, optimal: 8, category: 'Young Adult' };
    if (age >= 65) return { min: 7, max: 8, optimal: 7.5, category: 'Older Adult' };
    return { min: 7, max: 9, optimal: 8, category: 'Adult' };
  };

  const calculateSleepCycles = (hours: number) => {
    // Each sleep cycle is approximately 90 minutes (1.5 hours)
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
    
    // Handle overnight sleep
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
    let bedtimes: string[] = [];
    let wakeupTimes: string[] = [];
    let optimalBedtime = '';
    let optimalWakeup = '';
    let actualSleepHours = 0;

    if (calculationType === 'optimal-sleep' && wakeupTime) {
      // Calculate bedtimes for optimal sleep
      const optimalSleepMinutes = sleepRec.optimal * 60 + 15; // Add 15 min to fall asleep
      optimalBedtime = subtractMinutesFromTime(wakeupTime, optimalSleepMinutes);
      optimalWakeup = wakeupTime;

      // Generate multiple bedtime options based on sleep cycles
      const cycles = [4, 5, 6]; // 4-6 sleep cycles
      bedtimes = cycles.map(cycle => {
        const sleepMinutes = cycle * 90 + 15; // 90 min cycles + 15 min to fall asleep
        return subtractMinutesFromTime(wakeupTime, sleepMinutes);
      });
    } else if (calculationType === 'wakeup-time' && bedtime) {
      // Calculate wake-up times for optimal sleep
      optimalBedtime = bedtime;
      const optimalSleepMinutes = sleepRec.optimal * 60;
      optimalWakeup = addMinutesToTime(bedtime, optimalSleepMinutes);

      // Generate multiple wakeup options based on sleep cycles
      const cycles = [4, 5, 6]; // 4-6 sleep cycles
      wakeupTimes = cycles.map(cycle => {
        const sleepMinutes = cycle * 90; // 90 min cycles
        return addMinutesToTime(bedtime, sleepMinutes);
      });
    } else if (calculationType === 'sleep-analysis' && bedtime && wakeupTime) {
      // Analyze current sleep schedule
      actualSleepHours = calculateTimeDifference(bedtime, wakeupTime);
      optimalBedtime = bedtime;
      optimalWakeup = wakeupTime;
    }

    // Sleep quality assessment
    let qualityCategory = 'Good';
    let recommendations: string[] = [];

    if (actualSleepHours > 0) {
      if (actualSleepHours < sleepRec.min) {
        qualityCategory = 'Insufficient';
        recommendations.push(`You're getting ${actualSleepHours.toFixed(1)} hours, but need ${sleepRec.min}-${sleepRec.max} hours`);
        recommendations.push('Consider going to bed earlier or waking up later');
      } else if (actualSleepHours > sleepRec.max) {
        qualityCategory = 'Excessive';
        recommendations.push(`You're getting ${actualSleepHours.toFixed(1)} hours, which may be too much`);
        recommendations.push('Consider adjusting your sleep schedule');
      } else {
        qualityCategory = 'Optimal';
        recommendations.push('Your sleep duration is within the recommended range');
      }
    }

    // Add lifestyle-based recommendations
    if (lifestyle === 'shift-worker') {
      recommendations.push('As a shift worker, maintain consistent sleep schedule when possible');
      recommendations.push('Use blackout curtains and avoid caffeine before sleep');
    } else if (lifestyle === 'student') {
      recommendations.push('Maintain regular sleep schedule even during exams');
      recommendations.push('Avoid all-nighters which disrupt sleep cycles');
    } else if (lifestyle === 'parent') {
      recommendations.push('Take short naps when possible to compensate for disrupted sleep');
      recommendations.push('Share nighttime duties with partner when possible');
    }

    // General recommendations
    recommendations.push('Keep bedroom cool (60-67°F), dark, and quiet');
    recommendations.push('Avoid screens 1 hour before bedtime');
    recommendations.push('Create a consistent bedtime routine');

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
      }
    };

    setResult(newResult);
  };

  const resetCalculator = () => {
    setAge('');
    setWakeupTime('');
    setBedtime('');
    setCurrentSleep('');
    setSleepQuality('');
    setLifestyle('');
    setCalculationType('optimal-sleep');
    setResult(null);
  };

  const getQualityColor = (category: string) => {
    if (category === 'Optimal' || category === 'Good') return 'text-green-600';
    if (category === 'Insufficient') return 'text-red-600';
    if (category === 'Excessive') return 'text-orange-600';
    return 'text-gray-600';
  };

  const getQualityBgColor = (category: string) => {
    if (category === 'Optimal' || category === 'Good') return 'bg-green-50 border-l-green-500';
    if (category === 'Insufficient') return 'bg-red-50 border-l-red-500';
    if (category === 'Excessive') return 'bg-orange-50 border-l-orange-500';
    return 'bg-gray-50 border-l-gray-500';
  };

  return (
    <>
      <Helmet>
        <title>Sleep Calculator - Optimize Sleep Schedule & Track Sleep Quality | DapsiWow</title>
        <meta name="description" content="Calculate optimal sleep and wake times based on sleep cycles. Get personalized sleep recommendations and improve sleep quality with our sleep calculator." />
        <meta name="keywords" content="sleep calculator, sleep cycles, optimal sleep time, bedtime calculator, wake up calculator, sleep quality, sleep schedule" />
        <meta property="og:title" content="Sleep Calculator - Optimize Sleep Schedule & Track Sleep Quality | DapsiWow" />
        <meta property="og:description" content="Professional sleep calculator to optimize your sleep schedule based on natural sleep cycles and age-specific recommendations." />
        <meta property="og:type" content="website" />
        <link rel="canonical" href="/tools/sleep-calculator" />
      </Helmet>

      <div className="min-h-screen flex flex-col" data-testid="page-sleep-calculator">
        <Header />
        
        <main className="flex-1 bg-neutral-50">
          {/* Hero Section */}
          <section className="text-white py-16" style={{ background: 'linear-gradient(135deg, #f43f5e 0%, #e11d48 100%)' }}>
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <div className="w-20 h-20 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Moon className="w-10 h-10" />
              </div>
              <h1 className="text-4xl sm:text-5xl font-bold mb-6" data-testid="text-page-title">
                Sleep Calculator
              </h1>
              <p className="text-xl text-blue-100 max-w-2xl mx-auto">
                Calculate optimal sleep and wake times based on natural sleep cycles and get personalized recommendations
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
                      <h2 className="text-2xl font-semibold text-gray-900 mb-8">Sleep Schedule Calculator</h2>
                      
                      {/* Calculation Type */}
                      <div className="space-y-3">
                        <Label className="text-sm font-medium text-gray-700">
                          What would you like to calculate?
                        </Label>
                        <RadioGroup 
                          value={calculationType} 
                          onValueChange={setCalculationType}
                          className="space-y-2"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="optimal-sleep" id="optimal-sleep" data-testid="radio-optimal-sleep" />
                            <Label htmlFor="optimal-sleep" className="text-sm">Optimal bedtime (I know my wake-up time)</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="wakeup-time" id="wakeup-time" data-testid="radio-wakeup-time" />
                            <Label htmlFor="wakeup-time" className="text-sm">Optimal wake-up time (I know my bedtime)</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="sleep-analysis" id="sleep-analysis" data-testid="radio-sleep-analysis" />
                            <Label htmlFor="sleep-analysis" className="text-sm">Analyze my current sleep schedule</Label>
                          </div>
                        </RadioGroup>
                      </div>

                      {/* Age */}
                      <div className="space-y-3">
                        <Label htmlFor="age" className="text-sm font-medium text-gray-700">
                          Age (years) *
                        </Label>
                        <Input
                          id="age"
                          type="number"
                          value={age}
                          onChange={(e) => setAge(e.target.value)}
                          className="h-12 text-base border-gray-200 rounded-lg"
                          placeholder="30"
                          min="0"
                          max="120"
                          data-testid="input-age"
                        />
                        <p className="text-xs text-gray-500">
                          Sleep needs vary by age group
                        </p>
                      </div>

                      {/* Wake-up Time */}
                      {(calculationType === 'optimal-sleep' || calculationType === 'sleep-analysis') && (
                        <div className="space-y-3">
                          <Label htmlFor="wakeup-time" className="text-sm font-medium text-gray-700">
                            Wake-up Time *
                          </Label>
                          <Input
                            id="wakeup-time"
                            type="time"
                            value={wakeupTime}
                            onChange={(e) => setWakeupTime(e.target.value)}
                            className="h-12 text-base border-gray-200 rounded-lg"
                            data-testid="input-wakeup-time"
                          />
                          <p className="text-xs text-gray-500">
                            What time do you need to wake up?
                          </p>
                        </div>
                      )}

                      {/* Bedtime */}
                      {(calculationType === 'wakeup-time' || calculationType === 'sleep-analysis') && (
                        <div className="space-y-3">
                          <Label htmlFor="bedtime" className="text-sm font-medium text-gray-700">
                            Bedtime *
                          </Label>
                          <Input
                            id="bedtime"
                            type="time"
                            value={bedtime}
                            onChange={(e) => setBedtime(e.target.value)}
                            className="h-12 text-base border-gray-200 rounded-lg"
                            data-testid="input-bedtime"
                          />
                          <p className="text-xs text-gray-500">
                            What time do you usually go to bed?
                          </p>
                        </div>
                      )}

                      {/* Current Sleep Quality */}
                      <div className="space-y-3">
                        <Label className="text-sm font-medium text-gray-700">
                          How is your current sleep quality? <span className="text-gray-400 font-normal">- Optional</span>
                        </Label>
                        <Select value={sleepQuality} onValueChange={setSleepQuality}>
                          <SelectTrigger className="h-12 border-gray-200 rounded-lg" data-testid="select-sleep-quality">
                            <SelectValue placeholder="Select sleep quality" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="excellent">Excellent - I feel refreshed</SelectItem>
                            <SelectItem value="good">Good - Generally well-rested</SelectItem>
                            <SelectItem value="fair">Fair - Sometimes tired</SelectItem>
                            <SelectItem value="poor">Poor - Often tired</SelectItem>
                            <SelectItem value="very-poor">Very Poor - Always exhausted</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Lifestyle */}
                      <div className="space-y-3">
                        <Label className="text-sm font-medium text-gray-700">
                          Lifestyle <span className="text-gray-400 font-normal">- Optional</span>
                        </Label>
                        <Select value={lifestyle} onValueChange={setLifestyle}>
                          <SelectTrigger className="h-12 border-gray-200 rounded-lg" data-testid="select-lifestyle">
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

                      {/* Information Box */}
                      <div className="bg-blue-50 rounded-lg p-4 mt-6">
                        <h3 className="font-semibold text-blue-900 mb-2">Sleep Cycle Facts</h3>
                        <ul className="text-sm text-blue-700 space-y-1">
                          <li>• Complete sleep cycles last about 90 minutes</li>
                          <li>• We go through 4-6 cycles per night</li>
                          <li>• Waking up mid-cycle causes grogginess</li>
                          <li>• It typically takes 15 minutes to fall asleep</li>
                        </ul>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-4 pt-6">
                        <Button
                          onClick={calculateSleep}
                          className="flex-1 h-12 text-white font-medium rounded-lg"
                          style={{ backgroundColor: '#f43f5e' }}
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#e11d48'}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#f43f5e'}
                          data-testid="button-calculate"
                        >
                          <Calculator className="w-4 h-4 mr-2" />
                          Calculate Sleep Schedule
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
                      <h2 className="text-2xl font-semibold text-gray-900 mb-8">Sleep Recommendations</h2>
                      
                      {result ? (
                        <div className="space-y-4" data-testid="sleep-results">
                          {/* Target Sleep Duration */}
                          <div className="bg-white rounded-lg p-4 border-l-4 border-blue-500">
                            <div className="flex justify-between items-center mb-2">
                              <span className="font-semibold text-gray-700">Recommended Sleep</span>
                              <span className="text-2xl font-bold text-blue-600" data-testid="text-target-sleep">
                                {result.targetSleepHours}h
                              </span>
                            </div>
                            <p className="text-xs text-gray-500">For {result.ageGroup} age group</p>
                            <p className="text-xs text-gray-500 mt-1">
                              {result.sleepCycles} complete sleep cycles
                            </p>
                          </div>

                          {/* Optimal Schedule */}
                          <div className="bg-white rounded-lg p-4">
                            <h3 className="font-semibold text-gray-900 mb-2">Optimal Sleep Schedule</h3>
                            <div className="space-y-1 text-sm">
                              {result.optimalSchedule.bedtime && (
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Bedtime</span>
                                  <span className="font-medium" data-testid="text-optimal-bedtime">
                                    {result.optimalSchedule.bedtime}
                                  </span>
                                </div>
                              )}
                              {result.optimalSchedule.wakeup && (
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Wake-up</span>
                                  <span className="font-medium" data-testid="text-optimal-wakeup">
                                    {result.optimalSchedule.wakeup}
                                  </span>
                                </div>
                              )}
                              <div className="flex justify-between">
                                <span className="text-gray-600">Duration</span>
                                <span className="font-medium" data-testid="text-sleep-duration">
                                  {result.optimalSchedule.sleepDuration}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Alternative Times */}
                          {result.bedtimes.length > 0 && (
                            <div className="bg-green-50 rounded-lg p-4">
                              <h3 className="font-semibold text-gray-900 mb-2">Alternative Bedtimes</h3>
                              <div className="space-y-1 text-sm">
                                {result.bedtimes.map((time, index) => (
                                  <div key={index} className="flex justify-between">
                                    <span className="text-gray-600">{4 + index} sleep cycles</span>
                                    <span className="font-medium">{time}</span>
                                  </div>
                                ))}
                              </div>
                              <p className="text-xs text-gray-500 mt-2">
                                Times include 15 minutes to fall asleep
                              </p>
                            </div>
                          )}

                          {result.wakeupTimes.length > 0 && (
                            <div className="bg-green-50 rounded-lg p-4">
                              <h3 className="font-semibold text-gray-900 mb-2">Alternative Wake-up Times</h3>
                              <div className="space-y-1 text-sm">
                                {result.wakeupTimes.map((time, index) => (
                                  <div key={index} className="flex justify-between">
                                    <span className="text-gray-600">{4 + index} sleep cycles</span>
                                    <span className="font-medium">{time}</span>
                                  </div>
                                ))}
                              </div>
                              <p className="text-xs text-gray-500 mt-2">
                                Based on natural 90-minute sleep cycles
                              </p>
                            </div>
                          )}

                          {/* Sleep Quality Assessment */}
                          <div className={`rounded-lg p-4 border-l-4 ${getQualityBgColor(result.sleepQuality.category)}`}>
                            <div className="flex justify-between items-center mb-2">
                              <span className="font-semibold text-gray-700">Sleep Quality</span>
                              <span className={`font-bold ${getQualityColor(result.sleepQuality.category)}`} data-testid="text-sleep-quality">
                                {result.sleepQuality.category}
                              </span>
                            </div>
                          </div>

                          {/* Recommendations */}
                          <div className="bg-blue-50 rounded-lg p-4">
                            <h3 className="font-semibold text-gray-900 mb-2">Personalized Recommendations</h3>
                            <ul className="text-sm text-gray-700 space-y-1">
                              {result.sleepQuality.recommendations.map((rec, index) => (
                                <li key={index} className="flex items-start">
                                  <span className="mr-2">•</span>
                                  <span>{rec}</span>
                                </li>
                              ))}
                            </ul>
                          </div>

                          {/* Sleep Hygiene Tips */}
                          <div className="bg-purple-50 rounded-lg p-4">
                            <h3 className="font-semibold text-gray-900 mb-2">Sleep Hygiene Tips</h3>
                            <ul className="text-sm text-gray-700 space-y-1">
                              <li>• Keep bedroom temperature between 60-67°F (15-19°C)</li>
                              <li>• Use blackout curtains or eye mask for darkness</li>
                              <li>• Avoid caffeine 6 hours before bedtime</li>
                              <li>• Create a relaxing bedtime routine</li>
                              <li>• Keep consistent sleep schedule even on weekends</li>
                            </ul>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-8" data-testid="no-results">
                          <Moon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                          <p className="text-gray-500">Enter your information to calculate optimal sleep schedule</p>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Educational Content */}
              <div className="mt-12 space-y-8">
                {/* Understanding Sleep Cycles */}
                <div className="bg-white rounded-2xl shadow-lg p-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-8">Understanding Sleep Cycles</h2>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-4">Sleep Stages</h3>
                      <p className="text-gray-600 mb-6 leading-relaxed">
                        Sleep occurs in cycles of approximately 90 minutes, each containing different stages: 
                        Light Sleep (N1, N2), Deep Sleep (N3), and REM Sleep. Each stage serves important functions 
                        for physical recovery, memory consolidation, and mental health.
                      </p>
                      
                      <h3 className="text-xl font-semibold text-gray-900 mb-4">Why 90-Minute Cycles Matter</h3>
                      <p className="text-gray-600 mb-4 leading-relaxed">
                        Waking up at the end of a complete cycle leaves you feeling refreshed, while waking 
                        mid-cycle can cause grogginess. This calculator uses this principle to suggest optimal times.
                      </p>
                    </div>
                    
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-4">Age-Based Sleep Needs</h3>
                      <div className="space-y-3">
                        <div className="flex items-center p-3 bg-blue-50 rounded-lg">
                          <div className="w-4 h-4 bg-blue-500 rounded-full mr-3"></div>
                          <div>
                            <div className="font-medium">Newborn (0-3 months)</div>
                            <div className="text-sm text-gray-600">11-17 hours</div>
                          </div>
                        </div>
                        
                        <div className="flex items-center p-3 bg-green-50 rounded-lg">
                          <div className="w-4 h-4 bg-green-500 rounded-full mr-3"></div>
                          <div>
                            <div className="font-medium">School Age (6-13 years)</div>
                            <div className="text-sm text-gray-600">9-11 hours</div>
                          </div>
                        </div>
                        
                        <div className="flex items-center p-3 bg-purple-50 rounded-lg">
                          <div className="w-4 h-4 bg-purple-500 rounded-full mr-3"></div>
                          <div>
                            <div className="font-medium">Teenagers (14-17 years)</div>
                            <div className="text-sm text-gray-600">8-10 hours</div>
                          </div>
                        </div>
                        
                        <div className="flex items-center p-3 bg-orange-50 rounded-lg">
                          <div className="w-4 h-4 bg-orange-500 rounded-full mr-3"></div>
                          <div>
                            <div className="font-medium">Adults (18-64 years)</div>
                            <div className="text-sm text-gray-600">7-9 hours</div>
                          </div>
                        </div>
                        
                        <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                          <div className="w-4 h-4 bg-gray-500 rounded-full mr-3"></div>
                          <div>
                            <div className="font-medium">Older Adults (65+ years)</div>
                            <div className="text-sm text-gray-600">7-8 hours</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Sleep Optimization Tips */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Sleep Optimization Tips</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Sleep Environment</h3>
                      <ul className="text-gray-600 space-y-2 text-sm">
                        <li>• Keep bedroom cool, dark, and quiet</li>
                        <li>• Invest in comfortable mattress and pillows</li>
                        <li>• Use white noise or earplugs if needed</li>
                        <li>• Remove electronic devices from bedroom</li>
                        <li>• Consider blackout curtains or eye mask</li>
                        <li>• Keep bedroom for sleep and intimacy only</li>
                      </ul>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Sleep Habits</h3>
                      <ul className="text-gray-600 space-y-2 text-sm">
                        <li>• Maintain consistent sleep schedule daily</li>
                        <li>• Create relaxing bedtime routine</li>
                        <li>• Avoid large meals close to bedtime</li>
                        <li>• Limit daytime naps to 20-30 minutes</li>
                        <li>• Get morning sunlight exposure</li>
                        <li>• Exercise regularly, but not before bed</li>
                        <li>• Manage stress through relaxation techniques</li>
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

export default SleepCalculator;