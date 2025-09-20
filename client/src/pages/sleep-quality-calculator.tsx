import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Moon, Clock, Heart, Brain, Star, AlertCircle, CheckCircle, Info } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ToolHeroSection from '@/components/ToolHeroSection';

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
  const [showDetails, setShowDetails] = useState(false);

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
    <>
      <Helmet>
        <title>Sleep Quality Calculator - Assess Sleep Health & Get Personalized Tips | DapsiWow</title>
        <meta name="description" content="Free sleep quality calculator to assess your sleep health, efficiency, and get personalized recommendations for better rest. Track sleep duration, quality, and improve your sleep hygiene." />
        <meta name="keywords" content="sleep quality calculator, sleep assessment, sleep efficiency, sleep health, sleep duration calculator, sleep recommendations, better sleep tips" />
        <meta property="og:title" content="Sleep Quality Calculator - Assess Sleep Health & Get Tips" />
        <meta property="og:description" content="Calculate your sleep quality score and get personalized recommendations for better rest and sleep hygiene." />
        <meta property="og:type" content="website" />
        <link rel="canonical" href="https://dapsiwow.com/tools/sleep-quality-calculator" />
      </Helmet>

      <div className="min-h-screen flex flex-col" data-testid="page-sleep-quality-calculator">
        <Header />

        <ToolHeroSection
          title="Sleep Quality Calculator"
          description="Assess your sleep quality, efficiency, and get personalized recommendations for better rest and optimal sleep health"
        />

        <main className="flex-1 bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 py-12">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

            {/* Calculator Section */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-6 sm:p-8 mb-8">
              <div className="mb-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                    <Moon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Sleep Assessment</h2>
                </div>
                <p className="text-slate-600 dark:text-slate-300">
                  Enter your sleep details to calculate your sleep quality score and receive personalized recommendations.
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {/* Sleep Schedule */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                    <Clock className="w-5 h-5 text-blue-600" />
                    Sleep Schedule
                  </h3>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Bedtime
                      </label>
                      <input
                        type="time"
                        value={sleepData.bedtime}
                        onChange={(e) => handleInputChange('bedtime', e.target.value)}
                        className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Wake Time
                      </label>
                      <input
                        type="time"
                        value={sleepData.wakeTime}
                        onChange={(e) => handleInputChange('wakeTime', e.target.value)}
                        className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Time to Fall Asleep (minutes)
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="120"
                      value={sleepData.sleepLatency}
                      onChange={(e) => handleInputChange('sleepLatency', parseInt(e.target.value) || 0)}
                      className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Night Wakings
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="10"
                        value={sleepData.nightWakings}
                        onChange={(e) => handleInputChange('nightWakings', parseInt(e.target.value) || 0)}
                        className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Awake Duration (min)
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="120"
                        value={sleepData.wakingDuration}
                        onChange={(e) => handleInputChange('wakingDuration', parseInt(e.target.value) || 0)}
                        className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
                      />
                    </div>
                  </div>
                </div>

                {/* Sleep Quality & Lifestyle */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                    <Star className="w-5 h-5 text-yellow-500" />
                    Sleep Quality & Lifestyle
                  </h3>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Age
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="120"
                      value={sleepData.age}
                      onChange={(e) => handleInputChange('age', parseInt(e.target.value) || 0)}
                      className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Sleep Quality Rating (1-10)
                    </label>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={sleepData.sleepQuality}
                      onChange={(e) => handleInputChange('sleepQuality', parseInt(e.target.value))}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-slate-500 mt-1">
                      <span>Very Poor (1)</span>
                      <span className="font-medium">{sleepData.sleepQuality}</span>
                      <span>Excellent (10)</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Morning Energy Level (1-10)
                    </label>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={sleepData.morningEnergy}
                      onChange={(e) => handleInputChange('morningEnergy', parseInt(e.target.value))}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-slate-500 mt-1">
                      <span>Very Low (1)</span>
                      <span className="font-medium">{sleepData.morningEnergy}</span>
                      <span>Very High (10)</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Daytime Fatigue (1-10)
                    </label>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={sleepData.daytimeFatigue}
                      onChange={(e) => handleInputChange('daytimeFatigue', parseInt(e.target.value))}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-slate-500 mt-1">
                      <span>None (1)</span>
                      <span className="font-medium">{sleepData.daytimeFatigue}</span>
                      <span>Severe (10)</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Lifestyle Factors */}
              <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-600">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Lifestyle Factors</h3>
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Hours since last caffeine
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="24"
                      value={sleepData.caffeineHours}
                      onChange={(e) => handleInputChange('caffeineHours', parseInt(e.target.value) || 0)}
                      className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Hours since exercise
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="24"
                      value={sleepData.exerciseHours}
                      onChange={(e) => handleInputChange('exerciseHours', parseInt(e.target.value) || 0)}
                      className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Hours since screen time
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="12"
                      value={sleepData.screenTime}
                      onChange={(e) => handleInputChange('screenTime', parseInt(e.target.value) || 0)}
                      className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
                    />
                  </div>
                </div>
              </div>

              <button
                onClick={calculateSleepQuality}
                className="mt-8 w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
              >
                <Moon className="w-5 h-5" />
                Calculate Sleep Quality
              </button>
            </div>

            {/* Results Section */}
            {result && (
              <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-6 sm:p-8 mb-8">
                <div className="text-center mb-8">
                  <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full ${getScoreBackground(result.qualityScore)} mb-4`}>
                    <span className={`text-3xl font-bold ${getScoreColor(result.qualityScore)}`}>
                      {result.qualityScore}
                    </span>
                  </div>
                  <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
                    Sleep Quality: {result.qualityRating}
                  </h2>
                  <p className="text-slate-600 dark:text-slate-300">
                    Your overall sleep quality score is {result.qualityScore}/100
                  </p>
                </div>

                {/* Key Metrics */}
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                  <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                    <Clock className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-slate-900 dark:text-white">
                      {result.sleepDuration.toFixed(1)}h
                    </div>
                    <div className="text-sm text-slate-600 dark:text-slate-300">Sleep Duration</div>
                  </div>

                  <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-xl">
                    <Heart className="w-8 h-8 text-green-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-slate-900 dark:text-white">
                      {result.sleepEfficiency.toFixed(1)}%
                    </div>
                    <div className="text-sm text-slate-600 dark:text-slate-300">Sleep Efficiency</div>
                  </div>

                  <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
                    <Brain className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-slate-900 dark:text-white">
                      {result.sleepDebt.toFixed(1)}h
                    </div>
                    <div className="text-sm text-slate-600 dark:text-slate-300">Sleep Debt</div>
                  </div>

                  <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl">
                    <Star className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-slate-900 dark:text-white">
                      {result.optimalBedtime}
                    </div>
                    <div className="text-sm text-slate-600 dark:text-slate-300">Optimal Bedtime</div>
                  </div>
                </div>

                {/* Recommendations */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-6">
                  <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                    Personalized Recommendations
                  </h3>
                  <div className="grid gap-3">
                    {result.recommendations.map((recommendation, index) => (
                      <div key={index} className="flex items-start gap-3 p-3 bg-white dark:bg-slate-800 rounded-lg">
                        <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                        <span className="text-slate-700 dark:text-slate-300">{recommendation}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Additional Details Toggle */}
                <button
                  onClick={() => setShowDetails(!showDetails)}
                  className="mt-6 text-blue-600 hover:text-blue-700 font-medium flex items-center gap-2"
                >
                  {showDetails ? 'Hide' : 'Show'} Sleep Analysis Details
                </button>

                {showDetails && (
                  <div className="mt-6 space-y-4">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-4">
                        <h4 className="font-semibold text-slate-900 dark:text-white mb-2">Sleep Efficiency Analysis</h4>
                        <p className="text-sm text-slate-600 dark:text-slate-300 mb-2">
                          Percentage of time actually asleep while in bed. &gt;85% is considered good.
                        </p>
                        <div className="text-xs text-slate-500 dark:text-slate-400">
                          Normal range: 85-95% • Target: &gt;90%
                        </div>
                      </div>

                      <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-4">
                        <h4 className="font-semibold text-slate-900 dark:text-white mb-2">Sleep Duration Analysis</h4>
                        <p className="text-sm text-slate-600 dark:text-slate-300 mb-2">
                          Your sleep duration of {result.sleepDuration.toFixed(1)} hours
                          {result.sleepDebt > 0 ? ` is ${result.sleepDebt.toFixed(1)} hours below optimal.` : ' is optimal for your age.'}
                        </p>
                        <div className="text-xs text-slate-500 dark:text-slate-400">
                          Recommended for age {sleepData.age}: {getOptimalSleep(sleepData.age)} hours
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Educational Content */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-6 sm:p-8">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Understanding Sleep Quality</h2>

              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Key Sleep Metrics</h3>
                  <div className="space-y-4">
                    <div className="border-l-4 border-blue-500 pl-4">
                      <h4 className="font-semibold text-slate-900 dark:text-white">Sleep Duration</h4>
                      <p className="text-sm text-slate-600 dark:text-slate-300">
                        The total amount of sleep obtained. Varies by age but generally 7-9 hours for adults.
                      </p>
                    </div>
                    <div className="border-l-4 border-green-500 pl-4">
                      <h4 className="font-semibold text-slate-900 dark:text-white">Sleep Efficiency</h4>
                      <p className="text-sm text-slate-600 dark:text-slate-300">
                        Percentage of time actually asleep while in bed. &gt;85% is considered good.
                      </p>
                    </div>
                    <div className="border-l-4 border-purple-500 pl-4">
                      <h4 className="font-semibold text-slate-900 dark:text-white">Sleep Latency</h4>
                      <p className="text-sm text-slate-600 dark:text-slate-300">
                        Time it takes to fall asleep. Normal range is 10-20 minutes.
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Sleep Hygiene Tips</h3>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-slate-600 dark:text-slate-300">
                        Maintain a consistent sleep schedule
                      </span>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-slate-600 dark:text-slate-300">
                        Create a cool, dark, quiet sleep environment
                      </span>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-slate-600 dark:text-slate-300">
                        Avoid caffeine and large meals before bedtime
                      </span>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-slate-600 dark:text-slate-300">
                        Limit screen exposure before bed
                      </span>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-slate-600 dark:text-slate-300">
                        Get regular exercise (but not before bed)
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Warning */}
              <div className="mt-8 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-yellow-800 dark:text-yellow-200">Important Note</h4>
                    <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                      This calculator provides general guidance only. If you consistently experience sleep problems,
                      consult with a healthcare provider or sleep specialist for proper evaluation and treatment.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Related Tools */}
            <div className="bg-gradient-to-r from-slate-50 to-blue-50 dark:from-slate-800 dark:to-blue-900 rounded-2xl p-8 mt-8">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 text-center">Related Health Tools</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <a href="/tools/bmr-calculator" className="bg-white dark:bg-slate-800 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
                  <i className="fas fa-fire text-2xl text-orange-600 mb-3"></i>
                  <h3 className="font-semibold text-slate-900 dark:text-white mb-2">BMR Calculator</h3>
                  <p className="text-slate-600 dark:text-slate-300 text-xs">Calculate your basal metabolic rate and daily calorie needs</p>
                </a>
                <a href="/tools/heart-rate-calculator" className="bg-white dark:bg-slate-800 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
                  <i className="fas fa-heartbeat text-2xl text-red-600 mb-3"></i>
                  <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Heart Rate Calculator</h3>
                  <p className="text-slate-600 dark:text-slate-300 text-xs">Calculate target heart rate zones for optimal training</p>
                </a>
                <a href="/tools/bmi-calculator" className="bg-white dark:bg-slate-800 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
                  <i className="fas fa-weight text-2xl text-blue-600 mb-3"></i>
                  <h3 className="font-semibold text-slate-900 dark:text-white mb-2">BMI Calculator</h3>
                  <p className="text-slate-600 dark:text-slate-300 text-xs">Calculate Body Mass Index and health status</p>
                </a>
                <a href="/tools/calorie-calculator" className="bg-white dark:bg-slate-800 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
                  <i className="fas fa-utensils text-2xl text-green-600 mb-3"></i>
                  <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Calorie Calculator</h3>
                  <p className="text-slate-600 dark:text-slate-300 text-xs">Calculate daily calorie needs and macronutrient breakdown</p>
                </a>
              </div>
            </div>

          </div>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default SleepQualityCalculator;