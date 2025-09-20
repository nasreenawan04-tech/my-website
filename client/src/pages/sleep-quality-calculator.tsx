
import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface SleepData {
  bedtime: string;
  wakeTime: string;
  sleepLatency: number;
  nightWakings: number;
  wakingDuration: number;
  sleepQuality: number;
  morningEnergy: number;
  daytimeFatigue: number;
  age: number;
  caffeineHours: number;
  exerciseHours: number;
  screenTime: number;
}

interface SleepResult {
  sleepDuration: number;
  sleepEfficiency: number;
  qualityScore: number;
  qualityRating: string;
  recommendations: string[];
  sleepDebt: number;
  optimalBedtime: string;
  optimalWakeTime: string;
}

const SleepQualityCalculator = () => {
  const [sleepData, setSleepData] = useState<SleepData>({
    bedtime: '22:30',
    wakeTime: '07:00',
    sleepLatency: 15,
    nightWakings: 1,
    wakingDuration: 10,
    sleepQuality: 7,
    morningEnergy: 6,
    daytimeFatigue: 4,
    age: 30,
    caffeineHours: 6,
    exerciseHours: 4,
    screenTime: 2
  });

  const [result, setResult] = useState<SleepResult | null>(null);

  const calculateSleepQuality = () => {
    // Calculate sleep duration
    const bedtimeMinutes = timeToMinutes(sleepData.bedtime);
    const wakeTimeMinutes = timeToMinutes(sleepData.wakeTime);
    const sleepDurationMinutes = wakeTimeMinutes > bedtimeMinutes
      ? wakeTimeMinutes - bedtimeMinutes
      : (24 * 60) - bedtimeMinutes + wakeTimeMinutes;
    const sleepDuration = sleepDurationMinutes / 60;

    // Calculate sleep efficiency
    const timeInBed = sleepDuration * 60;
    const timeAwake = sleepData.sleepLatency + (sleepData.nightWakings * sleepData.wakingDuration);
    const actualSleep = timeInBed - timeAwake;
    const sleepEfficiency = (actualSleep / timeInBed) * 100;

    // Calculate quality score (0-100)
    let qualityScore = 0;

    // Sleep duration score (30% weight)
    const optimalSleep = getOptimalSleep(sleepData.age);
    const durationScore = Math.max(0, 100 - Math.abs(sleepDuration - optimalSleep) * 10);
    qualityScore += durationScore * 0.3;

    // Sleep efficiency score (25% weight)
    const efficiencyScore = Math.min(100, sleepEfficiency);
    qualityScore += efficiencyScore * 0.25;

    // Subjective quality measures (45% weight)
    const subjectiveScore = (
      (sleepData.sleepQuality * 10) * 0.15 +
      (sleepData.morningEnergy * 10) * 0.15 +
      ((10 - sleepData.daytimeFatigue) * 10) * 0.15
    );
    qualityScore += subjectiveScore;

    // Determine quality rating
    let qualityRating = '';
    if (qualityScore >= 80) qualityRating = 'Excellent';
    else if (qualityScore >= 70) qualityRating = 'Good';
    else if (qualityScore >= 60) qualityRating = 'Fair';
    else if (qualityScore >= 50) qualityRating = 'Poor';
    else qualityRating = 'Very Poor';

    // Calculate sleep debt
    const sleepDebt = Math.max(0, optimalSleep - sleepDuration);

    // Generate recommendations
    const recommendations = generateRecommendations(sleepData, sleepDuration, sleepEfficiency, qualityScore);

    // Calculate optimal times
    const optimalBedtime = minutesToTime(wakeTimeMinutes - (optimalSleep * 60));
    const optimalWakeTime = sleepData.wakeTime;

    setResult({
      sleepDuration,
      sleepEfficiency,
      qualityScore: Math.round(qualityScore),
      qualityRating,
      recommendations,
      sleepDebt,
      optimalBedtime,
      optimalWakeTime
    });
  };

  const timeToMinutes = (time: string): number => {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  };

  const minutesToTime = (minutes: number): string => {
    const normalizedMinutes = ((minutes % (24 * 60)) + (24 * 60)) % (24 * 60);
    const hours = Math.floor(normalizedMinutes / 60);
    const mins = normalizedMinutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  };

  const getOptimalSleep = (age: number): number => {
    if (age <= 13) return 9.5;
    if (age <= 17) return 9;
    if (age <= 25) return 8.5;
    if (age <= 64) return 8;
    return 7.5;
  };

  const generateRecommendations = (data: SleepData, duration: number, efficiency: number, score: number): string[] => {
    const recommendations: string[] = [];
    const optimalSleep = getOptimalSleep(data.age);

    if (duration < optimalSleep - 0.5) {
      recommendations.push('Try to go to bed 30-60 minutes earlier to increase your sleep duration');
    }

    if (data.sleepLatency > 30) {
      recommendations.push('Practice relaxation techniques before bed to reduce time to fall asleep');
    }

    if (efficiency < 85) {
      recommendations.push('Improve sleep efficiency by limiting time in bed when not sleeping');
    }

    if (data.nightWakings > 2) {
      recommendations.push('Consider factors causing frequent night wakings (room temperature, noise, stress)');
    }

    if (data.caffeineHours < 6) {
      recommendations.push('Avoid caffeine at least 6 hours before bedtime for better sleep quality');
    }

    if (data.screenTime < 2) {
      recommendations.push('Reduce screen time at least 2 hours before bed to improve sleep onset');
    }

    if (data.exerciseHours < 4) {
      recommendations.push('Avoid vigorous exercise 4 hours before bedtime');
    }

    if (data.morningEnergy < 6) {
      recommendations.push('Consider exposure to bright light in the morning to improve energy levels');
    }

    if (score < 70) {
      recommendations.push('Maintain a consistent sleep schedule, even on weekends');
      recommendations.push('Create a cool, dark, and quiet sleep environment');
    }

    return recommendations.slice(0, 6); // Limit to 6 recommendations
  };

  const resetCalculator = () => {
    setSleepData({
      bedtime: '22:30',
      wakeTime: '07:00',
      sleepLatency: 15,
      nightWakings: 1,
      wakingDuration: 10,
      sleepQuality: 7,
      morningEnergy: 6,
      daytimeFatigue: 4,
      age: 30,
      caffeineHours: 6,
      exerciseHours: 4,
      screenTime: 2
    });
    setResult(null);
  };

  const handleInputChange = (field: keyof SleepData, value: string | number) => {
    setSleepData(prev => ({ ...prev, [field]: value }));
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 70) return 'text-blue-600';
    if (score >= 60) return 'text-yellow-600';
    if (score >= 50) return 'text-orange-600';
    return 'text-red-600';
  };

  const getScoreBackground = (score: number) => {
    if (score >= 80) return 'bg-green-100';
    if (score >= 70) return 'bg-blue-100';
    if (score >= 60) return 'bg-yellow-100';
    if (score >= 50) return 'bg-orange-100';
    return 'bg-red-100';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Helmet>
        <title>Sleep Quality Calculator - Assess Sleep Health & Get Personalized Tips | DapsiWow</title>
        <meta name="description" content="Free sleep quality calculator to assess your sleep health, efficiency, and get personalized recommendations for better rest. Track sleep duration, quality, and improve your sleep hygiene with scientific analysis." />
        <meta name="keywords" content="sleep quality calculator, sleep assessment, sleep efficiency, sleep health, sleep duration calculator, sleep recommendations, better sleep tips, sleep hygiene analyzer, sleep score calculator, sleep tracking tool" />
        <meta property="og:title" content="Sleep Quality Calculator - Assess Sleep Health & Get Personalized Tips | DapsiWow" />
        <meta property="og:description" content="Calculate your sleep quality score and get personalized recommendations for better rest and sleep hygiene with our comprehensive sleep analysis tool." />
        <meta property="og:type" content="website" />
        <meta name="robots" content="index, follow" />
        <meta name="author" content="DapsiWow" />
        <link rel="canonical" href="https://dapsiwow.com/tools/sleep-quality-calculator" />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            "name": "Sleep Quality Calculator",
            "description": "Free online sleep quality calculator to assess sleep health, efficiency, and get personalized recommendations for better rest and optimal sleep hygiene.",
            "url": "https://dapsiwow.com/tools/sleep-quality-calculator",
            "applicationCategory": "HealthApplication",
            "operatingSystem": "Any",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "USD"
            },
            "featureList": [
              "Calculate sleep quality score",
              "Assess sleep efficiency",
              "Personalized sleep recommendations",
              "Sleep duration analysis",
              "Lifestyle factor assessment",
              "Age-specific sleep guidelines"
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
                <span className="text-xs sm:text-sm font-medium text-blue-700">Professional Sleep Assessment</span>
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl 2xl:text-8xl font-bold text-slate-900 leading-tight tracking-tight" data-testid="text-sleep-quality-title">
                <span className="block">Smart Sleep Quality</span>
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 mt-1 sm:mt-2">
                  Calculator
                </span>
              </h1>
              <p className="text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl text-slate-600 max-w-sm sm:max-w-lg md:max-w-2xl lg:max-w-3xl xl:max-w-4xl mx-auto leading-relaxed px-2 sm:px-0">
                Assess your sleep quality, efficiency, and get personalized recommendations for better rest and optimal sleep health
              </p>
            </div>
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-4 py-16" data-testid="page-sleep-quality-calculator">
          {/* Main Calculator Card */}
          <Card className="bg-white/90 backdrop-blur-sm shadow-2xl border-0 rounded-3xl overflow-hidden">
            <CardContent className="p-0">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-0">
                {/* Input Section */}
                <div className="lg:col-span-2 p-8 lg:p-12 space-y-8">
                  <div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">Sleep Assessment Configuration</h2>
                    <p className="text-gray-600">Enter your sleep details to calculate your sleep quality score and receive personalized recommendations</p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Sleep Schedule */}
                    <div className="md:col-span-2 space-y-3">
                      <Label className="text-sm font-semibold text-gray-800 uppercase tracking-wide">Sleep Schedule</Label>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="bedtime" className="text-xs text-gray-500">Bedtime</Label>
                          <Input
                            id="bedtime"
                            type="time"
                            value={sleepData.bedtime}
                            onChange={(e) => handleInputChange('bedtime', e.target.value)}
                            className="h-14 text-lg border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-blue-500"
                            data-testid="input-bedtime"
                          />
                        </div>
                        <div>
                          <Label htmlFor="wakeTime" className="text-xs text-gray-500">Wake Time</Label>
                          <Input
                            id="wakeTime"
                            type="time"
                            value={sleepData.wakeTime}
                            onChange={(e) => handleInputChange('wakeTime', e.target.value)}
                            className="h-14 text-lg border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-blue-500"
                            data-testid="input-wake-time"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Sleep Metrics */}
                    <div className="space-y-3">
                      <Label htmlFor="sleepLatency" className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                        Time to Fall Asleep (minutes)
                      </Label>
                      <Input
                        id="sleepLatency"
                        type="number"
                        min="1"
                        max="120"
                        value={sleepData.sleepLatency}
                        onChange={(e) => handleInputChange('sleepLatency', parseInt(e.target.value) || 0)}
                        className="h-14 text-lg border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-blue-500"
                        placeholder="15"
                        data-testid="input-sleep-latency"
                      />
                    </div>

                    <div className="space-y-3">
                      <Label htmlFor="age" className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                        Age (years)
                      </Label>
                      <Input
                        id="age"
                        type="number"
                        min="1"
                        max="120"
                        value={sleepData.age}
                        onChange={(e) => handleInputChange('age', parseInt(e.target.value) || 0)}
                        className="h-14 text-lg border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-blue-500"
                        placeholder="30"
                        data-testid="input-age"
                      />
                    </div>

                    <div className="space-y-3">
                      <Label htmlFor="nightWakings" className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                        Night Wakings (count)
                      </Label>
                      <Input
                        id="nightWakings"
                        type="number"
                        min="0"
                        max="10"
                        value={sleepData.nightWakings}
                        onChange={(e) => handleInputChange('nightWakings', parseInt(e.target.value) || 0)}
                        className="h-14 text-lg border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-blue-500"
                        placeholder="1"
                        data-testid="input-night-wakings"
                      />
                    </div>

                    <div className="space-y-3">
                      <Label htmlFor="wakingDuration" className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                        Awake Duration (minutes)
                      </Label>
                      <Input
                        id="wakingDuration"
                        type="number"
                        min="0"
                        max="120"
                        value={sleepData.wakingDuration}
                        onChange={(e) => handleInputChange('wakingDuration', parseInt(e.target.value) || 0)}
                        className="h-14 text-lg border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-blue-500"
                        placeholder="10"
                        data-testid="input-waking-duration"
                      />
                    </div>
                  </div>

                  {/* Quality Ratings */}
                  <div className="space-y-6">
                    <Label className="text-sm font-semibold text-gray-800 uppercase tracking-wide">Sleep Quality Ratings</Label>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label className="text-xs text-gray-500">Sleep Quality (1-10)</Label>
                        <div className="relative">
                          <input
                            type="range"
                            min="1"
                            max="10"
                            value={sleepData.sleepQuality}
                            onChange={(e) => handleInputChange('sleepQuality', parseInt(e.target.value))}
                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                            data-testid="range-sleep-quality"
                          />
                          <div className="flex justify-between text-xs text-gray-400 mt-1">
                            <span>Poor</span>
                            <span className="font-medium text-blue-600">{sleepData.sleepQuality}</span>
                            <span>Excellent</span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-xs text-gray-500">Morning Energy (1-10)</Label>
                        <div className="relative">
                          <input
                            type="range"
                            min="1"
                            max="10"
                            value={sleepData.morningEnergy}
                            onChange={(e) => handleInputChange('morningEnergy', parseInt(e.target.value))}
                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                            data-testid="range-morning-energy"
                          />
                          <div className="flex justify-between text-xs text-gray-400 mt-1">
                            <span>Low</span>
                            <span className="font-medium text-blue-600">{sleepData.morningEnergy}</span>
                            <span>High</span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-xs text-gray-500">Daytime Fatigue (1-10)</Label>
                        <div className="relative">
                          <input
                            type="range"
                            min="1"
                            max="10"
                            value={sleepData.daytimeFatigue}
                            onChange={(e) => handleInputChange('daytimeFatigue', parseInt(e.target.value))}
                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                            data-testid="range-daytime-fatigue"
                          />
                          <div className="flex justify-between text-xs text-gray-400 mt-1">
                            <span>None</span>
                            <span className="font-medium text-blue-600">{sleepData.daytimeFatigue}</span>
                            <span>Severe</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Lifestyle Factors */}
                  <div className="space-y-4">
                    <Label className="text-sm font-semibold text-gray-800 uppercase tracking-wide">Lifestyle Factors (hours before bed)</Label>
                    <div className="grid md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="caffeineHours" className="text-xs text-gray-500">Last Caffeine</Label>
                        <Input
                          id="caffeineHours"
                          type="number"
                          min="0"
                          max="24"
                          value={sleepData.caffeineHours}
                          onChange={(e) => handleInputChange('caffeineHours', parseInt(e.target.value) || 0)}
                          className="h-12 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-blue-500"
                          placeholder="6"
                          data-testid="input-caffeine-hours"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="exerciseHours" className="text-xs text-gray-500">Last Exercise</Label>
                        <Input
                          id="exerciseHours"
                          type="number"
                          min="0"
                          max="24"
                          value={sleepData.exerciseHours}
                          onChange={(e) => handleInputChange('exerciseHours', parseInt(e.target.value) || 0)}
                          className="h-12 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-blue-500"
                          placeholder="4"
                          data-testid="input-exercise-hours"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="screenTime" className="text-xs text-gray-500">Last Screen Use</Label>
                        <Input
                          id="screenTime"
                          type="number"
                          min="0"
                          max="12"
                          value={sleepData.screenTime}
                          onChange={(e) => handleInputChange('screenTime', parseInt(e.target.value) || 0)}
                          className="h-12 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-blue-500"
                          placeholder="2"
                          data-testid="input-screen-time"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-4 pt-6">
                    <Button
                      onClick={calculateSleepQuality}
                      className="flex-1 h-14 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold text-lg rounded-xl shadow-lg transform transition-all duration-200 hover:scale-105"
                      data-testid="button-calculate"
                    >
                      Calculate Sleep Quality
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
                  <h2 className="text-2xl font-bold text-gray-900 mb-8">Sleep Quality Results</h2>
                  
                  {result ? (
                    <div className="space-y-6" data-testid="sleep-quality-results">
                      {/* Sleep Quality Score Highlight */}
                      <div className="bg-white rounded-2xl p-6 shadow-lg border border-blue-100">
                        <div className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-2">Your Sleep Quality Score</div>
                        <div className={`text-4xl font-bold ${getScoreColor(result.qualityScore)}`} data-testid="text-sleep-quality-score">
                          {result.qualityScore}/100
                        </div>
                        <div className={`text-lg font-semibold ${getScoreColor(result.qualityScore)} mt-2`} data-testid="text-sleep-quality-rating">
                          {result.qualityRating}
                        </div>
                      </div>

                      {/* Key Metrics */}
                      <div className="space-y-4">
                        <div className="bg-white rounded-xl p-4 shadow-sm">
                          <div className="flex justify-between items-center">
                            <span className="font-medium text-gray-700">Sleep Duration</span>
                            <span className="font-semibold text-blue-600" data-testid="text-sleep-duration">
                              {result.sleepDuration.toFixed(1)}h
                            </span>
                          </div>
                        </div>

                        <div className="bg-white rounded-xl p-4 shadow-sm">
                          <div className="flex justify-between items-center">
                            <span className="font-medium text-gray-700">Sleep Efficiency</span>
                            <span className="font-semibold text-green-600" data-testid="text-sleep-efficiency">
                              {result.sleepEfficiency.toFixed(1)}%
                            </span>
                          </div>
                        </div>

                        <div className="bg-white rounded-xl p-4 shadow-sm">
                          <div className="flex justify-between items-center">
                            <span className="font-medium text-gray-700">Sleep Debt</span>
                            <span className="font-semibold text-orange-600" data-testid="text-sleep-debt">
                              {result.sleepDebt.toFixed(1)}h
                            </span>
                          </div>
                        </div>

                        <div className="bg-white rounded-xl p-4 shadow-sm">
                          <div className="flex justify-between items-center">
                            <span className="font-medium text-gray-700">Optimal Bedtime</span>
                            <span className="font-semibold text-purple-600" data-testid="text-optimal-bedtime">
                              {result.optimalBedtime}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Recommendations */}
                      <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                        <h3 className="font-semibold text-blue-800 mb-3">Personalized Recommendations</h3>
                        <div className="space-y-2">
                          {result.recommendations.map((recommendation, index) => (
                            <div key={index} className="text-sm text-blue-700 flex items-start gap-2">
                              <span className="text-blue-500 mt-1">•</span>
                              <span>{recommendation}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-16" data-testid="no-results">
                      <div className="w-20 h-20 bg-gray-200 rounded-full mx-auto mb-6 flex items-center justify-center">
                        <div className="text-2xl font-bold text-gray-400">ZZZ</div>
                      </div>
                      <p className="text-gray-500 text-lg">Enter your sleep details and calculate to see quality results</p>
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
                <h3 className="text-2xl font-bold text-gray-900 mb-6">What is Sleep Quality Assessment?</h3>
                <div className="space-y-4 text-gray-600">
                  <p>
                    Sleep quality assessment is a comprehensive evaluation of how well you sleep, considering multiple factors 
                    beyond just duration. Our sleep quality calculator analyzes sleep efficiency, duration, latency, and 
                    subjective quality measures to provide a holistic view of your sleep health and identify areas for improvement.
                  </p>
                  <p>
                    This scientific approach to sleep evaluation uses validated metrics including sleep efficiency 
                    (percentage of time actually asleep while in bed), sleep latency (time to fall asleep), and wake 
                    after sleep onset to calculate an overall quality score that reflects your sleep's restorative value.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">How to Use Our Sleep Quality Calculator</h3>
                <div className="space-y-4 text-gray-600">
                  <p>
                    Our comprehensive sleep assessment tool requires detailed information about your sleep patterns, 
                    lifestyle factors, and subjective sleep experience. Enter your typical bedtime and wake time, 
                    time to fall asleep, number of night wakings, and rate your sleep quality on provided scales.
                  </p>
                  <div className="bg-blue-50 rounded-lg p-4">
                    <h4 className="font-semibold text-blue-800 mb-2">Sleep Efficiency Formula</h4>
                    <p className="font-mono text-center text-lg text-blue-700">
                      Sleep Efficiency = (Time Asleep ÷ Time in Bed) × 100%
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Sleep Quality Metrics and Interpretation</h3>
                <div className="space-y-4">
                  <div className="flex items-center p-3 bg-green-50 rounded-lg">
                    <div className="w-4 h-4 bg-green-500 rounded-full mr-3"></div>
                    <div>
                      <div className="font-medium">Excellent (80-100)</div>
                      <div className="text-sm text-gray-600">Optimal sleep quality with high efficiency and satisfaction</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center p-3 bg-blue-50 rounded-lg">
                    <div className="w-4 h-4 bg-blue-500 rounded-full mr-3"></div>
                    <div>
                      <div className="font-medium">Good (70-79)</div>
                      <div className="text-sm text-gray-600">Above average sleep quality with minor improvement opportunities</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center p-3 bg-yellow-50 rounded-lg">
                    <div className="w-4 h-4 bg-yellow-500 rounded-full mr-3"></div>
                    <div>
                      <div className="font-medium">Fair (60-69)</div>
                      <div className="text-sm text-gray-600">Moderate sleep quality requiring attention to sleep hygiene</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center p-3 bg-orange-50 rounded-lg">
                    <div className="w-4 h-4 bg-orange-500 rounded-full mr-3"></div>
                    <div>
                      <div className="font-medium">Poor (50-59)</div>
                      <div className="text-sm text-gray-600">Below average sleep quality needing significant improvements</div>
                    </div>
                  </div>

                  <div className="flex items-center p-3 bg-red-50 rounded-lg">
                    <div className="w-4 h-4 bg-red-500 rounded-full mr-3"></div>
                    <div>
                      <div className="font-medium">Very Poor (&lt; 50)</div>
                      <div className="text-sm text-gray-600">Severely compromised sleep requiring professional consultation</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Benefits of Sleep Quality Monitoring</h3>
                <div className="space-y-3 text-gray-600">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Identify specific areas affecting sleep quality and efficiency</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Track progress in sleep hygiene improvements over time</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Receive personalized recommendations based on your sleep patterns</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Understand the impact of lifestyle factors on sleep quality</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Optimize sleep duration and timing for maximum restorative benefits</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Additional SEO Content Sections */}
          <div className="mt-12 space-y-8">
            {/* Sleep Quality vs Sleep Quantity */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Sleep Quality vs Sleep Quantity: Understanding the Difference</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg">
                        <th className="text-left py-4 px-6 font-bold text-gray-900 rounded-l-lg">Aspect</th>
                        <th className="text-left py-4 px-6 font-bold text-gray-900">Sleep Quality</th>
                        <th className="text-left py-4 px-6 font-bold text-gray-900">Sleep Quantity</th>
                        <th className="text-left py-4 px-6 font-bold text-gray-900 rounded-r-lg">Impact on Health</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      <tr className="hover:bg-blue-50 transition-colors">
                        <td className="py-4 px-6 font-medium">Definition</td>
                        <td className="py-4 px-6 text-gray-600">How well and deeply you sleep</td>
                        <td className="py-4 px-6 text-gray-600">Total hours of sleep obtained</td>
                        <td className="py-4 px-6 text-gray-600">Both essential for optimal health</td>
                      </tr>
                      <tr className="hover:bg-blue-50 transition-colors">
                        <td className="py-4 px-6 font-medium">Measurement</td>
                        <td className="py-4 px-6 text-gray-600">Sleep efficiency, latency, wakings</td>
                        <td className="py-4 px-6 text-gray-600">Hours from sleep onset to wake</td>
                        <td className="py-4 px-6 text-gray-600">Quality often more important</td>
                      </tr>
                      <tr className="hover:bg-blue-50 transition-colors">
                        <td className="py-4 px-6 font-medium">Indicators</td>
                        <td className="py-4 px-6 text-gray-600">Morning refreshment, few wakings</td>
                        <td className="py-4 px-6 text-gray-600">7-9 hours for most adults</td>
                        <td className="py-4 px-6 text-gray-600">Poor quality negates quantity</td>
                      </tr>
                      <tr className="hover:bg-blue-50 transition-colors">
                        <td className="py-4 px-6 font-medium">Improvement Focus</td>
                        <td className="py-4 px-6 text-gray-600">Sleep hygiene, environment</td>
                        <td className="py-4 px-6 text-gray-600">Consistent sleep schedule</td>
                        <td className="py-4 px-6 text-gray-600">Holistic approach needed</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Factors Affecting Sleep Quality */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
                <CardContent className="p-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">Factors That Impact Sleep Quality</h3>
                  <div className="space-y-4 text-gray-600">
                    <div className="border-l-4 border-blue-400 pl-4 bg-blue-50 p-3 rounded-r-lg">
                      <h4 className="font-semibold text-blue-800 mb-2">Environmental Factors</h4>
                      <p className="text-sm text-blue-700">Room temperature (60-67°F), darkness, noise levels, mattress and pillow quality, air quality and humidity.</p>
                    </div>
                    <div className="border-l-4 border-green-400 pl-4 bg-green-50 p-3 rounded-r-lg">
                      <h4 className="font-semibold text-green-800 mb-2">Lifestyle Factors</h4>
                      <p className="text-sm text-green-700">Caffeine and alcohol consumption, exercise timing, meal timing, screen exposure, stress levels, work schedules.</p>
                    </div>
                    <div className="border-l-4 border-purple-400 pl-4 bg-purple-50 p-3 rounded-r-lg">
                      <h4 className="font-semibold text-purple-800 mb-2">Physiological Factors</h4>
                      <p className="text-sm text-purple-700">Age, hormonal changes, medical conditions, medications, natural circadian rhythm preferences.</p>
                    </div>
                    <div className="border-l-4 border-orange-400 pl-4 bg-orange-50 p-3 rounded-r-lg">
                      <h4 className="font-semibold text-orange-800 mb-2">Psychological Factors</h4>
                      <p className="text-sm text-orange-700">Stress, anxiety, depression, worry, racing thoughts, sleep anxiety, emotional regulation challenges.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
                <CardContent className="p-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">Evidence-Based Sleep Optimization Strategies</h3>
                  <div className="space-y-4 text-gray-600">
                    <div className="bg-green-50 rounded-lg p-4">
                      <h4 className="font-semibold text-green-800 mb-2">Sleep Hygiene Fundamentals</h4>
                      <p className="text-sm text-green-700">Maintain consistent sleep-wake times, create a relaxing bedtime routine, optimize sleep environment temperature and lighting.</p>
                    </div>
                    <div className="bg-blue-50 rounded-lg p-4">
                      <h4 className="font-semibold text-blue-800 mb-2">Circadian Rhythm Support</h4>
                      <p className="text-sm text-blue-700">Morning light exposure, evening light limitation, strategic melatonin use, consistent meal timing alignment.</p>
                    </div>
                    <div className="bg-purple-50 rounded-lg p-4">
                      <h4 className="font-semibold text-purple-800 mb-2">Cognitive Techniques</h4>
                      <p className="text-sm text-purple-700">Progressive muscle relaxation, guided imagery, mindfulness meditation, cognitive behavioral therapy for insomnia (CBT-I).</p>
                    </div>
                    <div className="bg-orange-50 rounded-lg p-4">
                      <h4 className="font-semibold text-orange-800 mb-2">Lifestyle Modifications</h4>
                      <p className="text-sm text-orange-700">Regular exercise (not close to bedtime), strategic caffeine timing, moderate alcohol consumption, stress management.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sleep Disorders and When to Seek Help */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-8">Common Sleep Disorders and Warning Signs</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <h4 className="text-lg font-semibold text-gray-900">Primary Sleep Disorders</h4>
                    <div className="space-y-4">
                      <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                        <h5 className="font-semibold text-red-800 mb-2">Sleep Apnea</h5>
                        <p className="text-sm text-red-700">Repeated breathing interruptions during sleep causing fragmented rest and daytime fatigue. Often accompanied by loud snoring and gasping.</p>
                      </div>
                      <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                        <h5 className="font-semibold text-blue-800 mb-2">Chronic Insomnia</h5>
                        <p className="text-sm text-blue-700">Persistent difficulty falling asleep, staying asleep, or early morning awakening lasting more than 3 months with daytime impairment.</p>
                      </div>
                      <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                        <h5 className="font-semibold text-purple-800 mb-2">Restless Leg Syndrome</h5>
                        <p className="text-sm text-purple-700">Uncomfortable sensations in legs creating irresistible urge to move, typically worsening in evening and disrupting sleep onset.</p>
                      </div>
                      <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                        <h5 className="font-semibold text-yellow-800 mb-2">Narcolepsy</h5>
                        <p className="text-sm text-yellow-700">Neurological disorder causing excessive daytime sleepiness and sudden sleep attacks regardless of adequate nighttime sleep.</p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-6">
                    <h4 className="text-lg font-semibold text-gray-900">When to Consult a Sleep Specialist</h4>
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-sm text-gray-600">Consistent sleep quality scores below 60 despite lifestyle modifications</span>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-sm text-gray-600">Loud snoring with breathing interruptions witnessed by others</span>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-sm text-gray-600">Excessive daytime sleepiness affecting work, driving, or daily activities</span>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-sm text-gray-600">Persistent insomnia lasting more than 3 months</span>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-sm text-gray-600">Unusual behaviors during sleep (sleepwalking, talking, acting out dreams)</span>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-sm text-gray-600">Morning headaches, dry mouth, or choking sensations upon waking</span>
                      </div>
                    </div>
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 mt-6">
                      <h5 className="font-semibold text-blue-800 mb-2">Professional Sleep Evaluation</h5>
                      <p className="text-sm text-blue-700">
                        Sleep specialists can perform comprehensive evaluations including sleep studies, multiple sleep latency tests, 
                        and maintenance of wakefulness tests to diagnose specific disorders and recommend targeted treatments.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* FAQ Section */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-8">Frequently Asked Questions About Sleep Quality</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">How accurate is this sleep quality assessment?</h4>
                      <p className="text-gray-600 text-sm">Our calculator uses scientifically validated metrics including sleep efficiency, duration, and subjective quality measures. While highly informative for general assessment, it complements but doesn't replace professional sleep studies for medical diagnosis.</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">What is considered normal sleep efficiency?</h4>
                      <p className="text-gray-600 text-sm">Normal sleep efficiency ranges from 85-95% for healthy adults. Efficiency below 85% may indicate sleep disruption issues, while above 95% could suggest insufficient time in bed or sleep deprivation.</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">How many night wakings are normal?</h4>
                      <p className="text-gray-600 text-sm">Brief awakenings (1-2 per night) are normal and often unremembered. However, frequent wakings (3+) lasting more than 5 minutes or causing difficulty returning to sleep may indicate underlying issues.</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">Does sleep quality change with age?</h4>
                      <p className="text-gray-600 text-sm">Yes, sleep architecture naturally changes with aging. Older adults typically experience lighter sleep, more frequent wakings, and earlier bedtimes. Our calculator accounts for age-specific sleep requirements and patterns.</p>
                    </div>
                  </div>
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">How long should it take to fall asleep?</h4>
                      <p className="text-gray-600 text-sm">Normal sleep latency ranges from 10-20 minutes. Falling asleep in under 5 minutes may indicate sleep deprivation, while taking over 30 minutes consistently suggests difficulty with sleep onset.</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">Can lifestyle changes really improve sleep quality?</h4>
                      <p className="text-gray-600 text-sm">Absolutely. Research shows that consistent sleep hygiene, regular exercise, stress management, and environmental optimization can significantly improve sleep quality scores within 2-4 weeks of implementation.</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">How often should I assess my sleep quality?</h4>
                      <p className="text-gray-600 text-sm">Weekly assessments during sleep improvement programs are helpful for tracking progress. Monthly evaluations are sufficient for general monitoring, with more frequent assessment during times of stress or life changes.</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">What's the relationship between sleep quality and health?</h4>
                      <p className="text-gray-600 text-sm">Poor sleep quality is linked to increased risk of cardiovascular disease, diabetes, obesity, immune dysfunction, and mental health issues. Quality sleep supports memory consolidation, tissue repair, and hormonal balance.</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Sleep Quality Research and Science */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">The Science Behind Sleep Quality Assessment</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="space-y-4 text-gray-600">
                    <h4 className="text-lg font-semibold text-gray-900">Sleep Architecture and Quality</h4>
                    <p className="text-sm">
                      Sleep quality depends on the proper cycling through different sleep stages: light sleep (N1, N2), 
                      deep sleep (N3), and REM sleep. Each stage serves specific restorative functions, with deep sleep 
                      crucial for physical recovery and REM sleep essential for cognitive processing and memory consolidation.
                    </p>
                    <p className="text-sm">
                      Healthy sleep involves 4-6 complete sleep cycles per night, each lasting approximately 90-110 minutes. 
                      Disruptions to this natural architecture, whether from environmental factors, medical conditions, or 
                      lifestyle choices, can significantly impact overall sleep quality even when total sleep duration appears adequate.
                    </p>
                    <h4 className="text-lg font-semibold text-gray-900">Circadian Rhythm Influence</h4>
                    <p className="text-sm">
                      Our internal biological clock, regulated by the suprachiasmatic nucleus, controls not just sleep timing 
                      but also sleep quality. Misalignment between our circadian rhythm and sleep schedule can lead to poor 
                      sleep efficiency, increased sleep latency, and reduced restorative sleep stages.
                    </p>
                  </div>
                  <div className="space-y-4 text-gray-600">
                    <h4 className="text-lg font-semibold text-gray-900">Validated Assessment Methods</h4>
                    <p className="text-sm">
                      Our sleep quality calculator incorporates elements from established sleep assessment tools including 
                      the Pittsburgh Sleep Quality Index (PSQI) and Epworth Sleepiness Scale. These validated instruments 
                      consider subjective sleep quality, sleep latency, sleep duration, habitual sleep efficiency, and daytime dysfunction.
                    </p>
                    <h4 className="text-lg font-semibold text-gray-900">Polysomnography Correlation</h4>
                    <p className="text-sm">
                      While our calculator provides valuable insights, gold-standard sleep assessment involves polysomnography 
                      (sleep studies) that measure brain waves, eye movements, muscle activity, and breathing patterns. 
                      Research shows strong correlations between subjective sleep quality measures and objective sleep metrics.
                    </p>
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 mt-6">
                      <h4 className="font-semibold text-blue-800 mb-2">Research Findings</h4>
                      <p className="text-sm text-blue-700">
                        Studies indicate that subjective sleep quality often predicts daytime functioning better than 
                        objective sleep duration alone, highlighting the importance of comprehensive sleep assessment 
                        beyond simple time-based measurements.
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

export default SleepQualityCalculator;
