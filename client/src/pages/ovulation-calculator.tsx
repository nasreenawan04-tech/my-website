
import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface OvulationResult {
  ovulationDate: string;
  fertileWindow: {
    start: string;
    end: string;
  };
  nextPeriod: string;
  cyclePhases: {
    menstrual: { start: string; end: string; };
    follicular: { start: string; end: string; };
    ovulation: { start: string; end: string; };
    luteal: { start: string; end: string; };
  };
  conception: {
    highChance: string[];
    moderateChance: string[];
  };
  cycleLength: number;
  lutealPhase: number;
  tips: string[];
}

export default function OvulationCalculator() {
  const [lastPeriodDate, setLastPeriodDate] = useState('');
  const [cycleLength, setCycleLength] = useState('28');
  const [periodLength, setPeriodLength] = useState('5');
  const [lutealLength, setLutealLength] = useState('14');
  const [calculationMethod, setCalculationMethod] = useState('calendar');
  const [age, setAge] = useState('');
  const [showPhases, setShowPhases] = useState(false);
  const [result, setResult] = useState<OvulationResult | null>(null);

  const addDays = (date: Date, days: number): Date => {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  };

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatShortDate = (date: Date): string => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  const calculateOvulation = () => {
    if (!lastPeriodDate) return;

    const lastPeriod = new Date(lastPeriodDate);
    const cycleLengthNum = parseInt(cycleLength);
    const periodLengthNum = parseInt(periodLength);
    const lutealLengthNum = parseInt(lutealLength);

    // Calculate ovulation date (typically 14 days before next period)
    const ovulationDay = cycleLengthNum - lutealLengthNum;
    const ovulationDate = addDays(lastPeriod, ovulationDay);

    // Calculate fertile window (5 days before ovulation + ovulation day)
    const fertileStart = addDays(ovulationDate, -5);
    const fertileEnd = addDays(ovulationDate, 1);

    // Calculate next period
    const nextPeriod = addDays(lastPeriod, cycleLengthNum);

    // Calculate cycle phases
    const menstrualStart = lastPeriod;
    const menstrualEnd = addDays(lastPeriod, periodLengthNum - 1);
    
    const follicularStart = addDays(lastPeriod, periodLengthNum);
    const follicularEnd = addDays(ovulationDate, -1);
    
    const ovulationStart = ovulationDate;
    const ovulationEnd = addDays(ovulationDate, 1);
    
    const lutealStart = addDays(ovulationDate, 2);
    const lutealEnd = addDays(nextPeriod, -1);

    // Calculate conception chances
    const highChanceDays = [
      addDays(ovulationDate, -2),
      addDays(ovulationDate, -1),
      ovulationDate
    ];

    const moderateChanceDays = [
      addDays(ovulationDate, -4),
      addDays(ovulationDate, -3),
      addDays(ovulationDate, 1)
    ];

    // Generate fertility tips
    const tips = [
      "Track your cycles for 3-6 months for better accuracy",
      "Monitor cervical mucus changes throughout your cycle",
      "Consider using ovulation test strips for confirmation",
      "Maintain a healthy lifestyle with balanced nutrition",
      "Track basal body temperature for additional insights"
    ];

    const newResult: OvulationResult = {
      ovulationDate: formatDate(ovulationDate),
      fertileWindow: {
        start: formatDate(fertileStart),
        end: formatDate(fertileEnd)
      },
      nextPeriod: formatDate(nextPeriod),
      cyclePhases: {
        menstrual: {
          start: formatDate(menstrualStart),
          end: formatDate(menstrualEnd)
        },
        follicular: {
          start: formatDate(follicularStart),
          end: formatDate(follicularEnd)
        },
        ovulation: {
          start: formatDate(ovulationStart),
          end: formatDate(ovulationEnd)
        },
        luteal: {
          start: formatDate(lutealStart),
          end: formatDate(lutealEnd)
        }
      },
      conception: {
        highChance: highChanceDays.map(date => formatShortDate(date)),
        moderateChance: moderateChanceDays.map(date => formatShortDate(date))
      },
      cycleLength: cycleLengthNum,
      lutealPhase: lutealLengthNum,
      tips
    };

    setResult(newResult);
  };

  const resetCalculator = () => {
    setLastPeriodDate('');
    setCycleLength('28');
    setPeriodLength('5');
    setLutealLength('14');
    setCalculationMethod('calendar');
    setAge('');
    setShowPhases(false);
    setResult(null);
  };

  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Helmet>
        <title>Ovulation Calculator - Track Fertile Days & Predict Ovulation Date | DapsiWow</title>
        <meta name="description" content="Free ovulation calculator to predict fertile days, ovulation date, and menstrual cycle phases. Calculate your best conception timing with accurate fertility tracking tools." />
        <meta name="keywords" content="ovulation calculator, fertile days calculator, menstrual cycle tracker, fertility calculator, conception calculator, ovulation predictor, fertile window calculator, pregnancy planning tool" />
        <meta property="og:title" content="Ovulation Calculator - Track Fertile Days & Predict Ovulation Date | DapsiWow" />
        <meta property="og:description" content="Free ovulation calculator for tracking fertile days and optimizing conception timing. Get accurate fertility predictions based on your menstrual cycle." />
        <meta property="og:type" content="website" />
        <meta name="robots" content="index, follow" />
        <meta name="author" content="DapsiWow" />
        <link rel="canonical" href="https://dapsiwow.com/tools/ovulation-calculator" />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            "name": "Ovulation Calculator",
            "description": "Free online ovulation calculator to predict fertile days, track menstrual cycles, and optimize conception timing for family planning.",
            "url": "https://dapsiwow.com/tools/ovulation-calculator",
            "applicationCategory": "HealthApplication",
            "operatingSystem": "Any",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "USD"
            },
            "featureList": [
              "Calculate ovulation date",
              "Predict fertile window",
              "Track menstrual cycle phases",
              "Conception probability analysis",
              "Personalized fertility tips"
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
                <span className="text-sm font-medium text-blue-700">Professional Ovulation Calculator</span>
              </div>
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-slate-900 leading-tight">
                Smart Ovulation
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                  Calculator
                </span>
              </h1>
              <p className="text-xl sm:text-2xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
                Predict your fertile days and ovulation date with precision for optimal family planning
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
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">Cycle Configuration</h2>
                    <p className="text-gray-600">Enter your menstrual cycle details for accurate predictions</p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Last Period Date */}
                    <div className="space-y-3">
                      <Label htmlFor="last-period" className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                        First Day of Last Period
                      </Label>
                      <Input
                        id="last-period"
                        type="date"
                        value={lastPeriodDate}
                        onChange={(e) => setLastPeriodDate(e.target.value)}
                        className="h-14 text-lg border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-blue-500"
                        max={getTodayDate()}
                        data-testid="input-last-period"
                      />
                    </div>

                    {/* Cycle Length */}
                    <div className="space-y-3">
                      <Label htmlFor="cycle-length" className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                        Average Cycle Length (days)
                      </Label>
                      <Select value={cycleLength} onValueChange={setCycleLength}>
                        <SelectTrigger className="h-14 border-2 border-gray-200 rounded-xl text-lg" data-testid="select-cycle-length">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from({ length: 20 }, (_, i) => i + 21).map(days => (
                            <SelectItem key={days} value={days.toString()}>
                              {days} days {days === 28 ? '(Average)' : ''}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Period Length */}
                    <div className="space-y-3">
                      <Label htmlFor="period-length" className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                        Period Length (days)
                      </Label>
                      <Select value={periodLength} onValueChange={setPeriodLength}>
                        <SelectTrigger className="h-14 border-2 border-gray-200 rounded-xl text-lg" data-testid="select-period-length">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from({ length: 8 }, (_, i) => i + 3).map(days => (
                            <SelectItem key={days} value={days.toString()}>
                              {days} days {days === 5 ? '(Average)' : ''}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Luteal Phase Length */}
                    <div className="space-y-3">
                      <Label htmlFor="luteal-length" className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                        Luteal Phase Length (days)
                      </Label>
                      <Select value={lutealLength} onValueChange={setLutealLength}>
                        <SelectTrigger className="h-14 border-2 border-gray-200 rounded-xl text-lg" data-testid="select-luteal-length">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from({ length: 8 }, (_, i) => i + 10).map(days => (
                            <SelectItem key={days} value={days.toString()}>
                              {days} days {days === 14 ? '(Average)' : ''}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Advanced Options */}
                  <div className="space-y-6 border-t pt-8">
                    <h3 className="text-xl font-bold text-gray-900">Advanced Options</h3>
                    
                    {/* Calculation Method */}
                    <div className="space-y-4 bg-gray-50 rounded-xl p-6">
                      <div className="space-y-3">
                        <Label className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                          Calculation Method
                        </Label>
                        <Select value={calculationMethod} onValueChange={setCalculationMethod}>
                          <SelectTrigger className="h-12 border-2 border-gray-200 rounded-lg" data-testid="select-method">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="calendar">Calendar Method (Standard)</SelectItem>
                            <SelectItem value="temperature">BBT Method (Advanced)</SelectItem>
                            <SelectItem value="symptoms">Symptom Tracking</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Age Input */}
                    <div className="space-y-4 bg-gray-50 rounded-xl p-6">
                      <div className="space-y-3">
                        <Label htmlFor="age" className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                          Age (years) - Optional
                        </Label>
                        <Input
                          id="age"
                          type="number"
                          value={age}
                          onChange={(e) => setAge(e.target.value)}
                          className="h-12 text-base border-2 border-gray-200 rounded-lg w-full md:w-48"
                          placeholder="28"
                          min="15"
                          max="50"
                          data-testid="input-age"
                        />
                        <p className="text-sm text-gray-500">
                          Age affects fertility and ovulation patterns
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-4 pt-6">
                    <Button
                      onClick={calculateOvulation}
                      className="flex-1 h-14 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold text-lg rounded-xl shadow-lg transform transition-all duration-200 hover:scale-105"
                      data-testid="button-calculate"
                    >
                      Calculate Ovulation
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

                  {/* Advanced Options */}
                  {result && (
                    <div className="flex flex-wrap gap-3 pt-4">
                      <Button
                        onClick={() => setShowPhases(!showPhases)}
                        variant="outline"
                        size="sm"
                        className="rounded-full"
                        data-testid="button-show-phases"
                      >
                        {showPhases ? 'Hide' : 'Show'} Cycle Phases
                      </Button>
                    </div>
                  )}
                </div>

                {/* Results Section */}
                <div className="bg-gradient-to-br from-gray-50 to-blue-50 p-8 lg:p-12">
                  <h2 className="text-2xl font-bold text-gray-900 mb-8">Prediction Results</h2>
                  
                  {result ? (
                    <div className="space-y-6" data-testid="ovulation-results">
                      {/* Ovulation Date Highlight */}
                      <div className="bg-white rounded-2xl p-6 shadow-lg border border-blue-100">
                        <div className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-2">Predicted Ovulation</div>
                        <div className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600" data-testid="text-ovulation-date">
                          {result.ovulationDate}
                        </div>
                      </div>

                      {/* Fertility Breakdown */}
                      <div className="space-y-4">
                        <div className="bg-white rounded-xl p-4 shadow-sm">
                          <div className="flex justify-between items-center">
                            <span className="font-medium text-gray-700">Fertile Window Start</span>
                            <span className="font-bold text-gray-900" data-testid="text-fertile-start">
                              {result.fertileWindow.start}
                            </span>
                          </div>
                        </div>
                        <div className="bg-white rounded-xl p-4 shadow-sm">
                          <div className="flex justify-between items-center">
                            <span className="font-medium text-gray-700">Fertile Window End</span>
                            <span className="font-bold text-orange-600" data-testid="text-fertile-end">
                              {result.fertileWindow.end}
                            </span>
                          </div>
                        </div>
                        <div className="bg-white rounded-xl p-4 shadow-sm">
                          <div className="flex justify-between items-center">
                            <span className="font-medium text-gray-700">Next Period Expected</span>
                            <span className="font-bold text-gray-900" data-testid="text-next-period">
                              {result.nextPeriod}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Conception Probability */}
                      <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
                        <h4 className="font-bold text-green-800 mb-4 text-lg">Conception Probability</h4>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-green-700 font-medium">High Chance Days:</span>
                            <span className="font-bold text-green-800 text-lg">
                              {result.conception.highChance.join(', ')}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-green-700 font-medium">Moderate Chance Days:</span>
                            <span className="font-bold text-green-800 text-lg">
                              {result.conception.moderateChance.join(', ')}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Fertility Tips */}
                      <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-6 border border-purple-200">
                        <h4 className="font-bold text-purple-800 mb-4 text-lg">Fertility Tips</h4>
                        <div className="space-y-2">
                          {result.tips.map((tip, index) => (
                            <div key={index} className="flex items-start gap-2">
                              <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                              <span className="text-purple-700 text-sm">{tip}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-16" data-testid="no-results">
                      <div className="w-20 h-20 bg-gray-200 rounded-full mx-auto mb-6 flex items-center justify-center">
                        <div className="text-3xl font-bold text-gray-400">♀</div>
                      </div>
                      <p className="text-gray-500 text-lg">Enter cycle details to predict ovulation and fertile days</p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Cycle Phases */}
          {result && showPhases && (
            <Card className="mt-8 bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Menstrual Cycle Phases</h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg">
                        <th className="px-6 py-4 text-left font-bold text-gray-900 rounded-l-lg">Phase</th>
                        <th className="px-6 py-4 text-right font-bold text-gray-900">Start Date</th>
                        <th className="px-6 py-4 text-right font-bold text-gray-900 rounded-r-lg">End Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      <tr className="hover:bg-blue-50 transition-colors">
                        <td className="px-6 py-4 font-medium text-gray-900">Menstrual Phase</td>
                        <td className="px-6 py-4 text-right text-gray-900 font-medium">
                          {result.cyclePhases.menstrual.start}
                        </td>
                        <td className="px-6 py-4 text-right text-gray-900 font-medium">
                          {result.cyclePhases.menstrual.end}
                        </td>
                      </tr>
                      <tr className="hover:bg-blue-50 transition-colors">
                        <td className="px-6 py-4 font-medium text-gray-900">Follicular Phase</td>
                        <td className="px-6 py-4 text-right text-gray-900 font-medium">
                          {result.cyclePhases.follicular.start}
                        </td>
                        <td className="px-6 py-4 text-right text-gray-900 font-medium">
                          {result.cyclePhases.follicular.end}
                        </td>
                      </tr>
                      <tr className="hover:bg-blue-50 transition-colors">
                        <td className="px-6 py-4 font-medium text-gray-900">Ovulation Phase</td>
                        <td className="px-6 py-4 text-right text-gray-900 font-medium">
                          {result.cyclePhases.ovulation.start}
                        </td>
                        <td className="px-6 py-4 text-right text-gray-900 font-medium">
                          {result.cyclePhases.ovulation.end}
                        </td>
                      </tr>
                      <tr className="hover:bg-blue-50 transition-colors">
                        <td className="px-6 py-4 font-medium text-gray-900">Luteal Phase</td>
                        <td className="px-6 py-4 text-right text-gray-900 font-medium">
                          {result.cyclePhases.luteal.start}
                        </td>
                        <td className="px-6 py-4 text-right text-gray-900 font-medium">
                          {result.cyclePhases.luteal.end}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}

          {/* SEO Content Section */}
          <div className="mt-16 grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">What is Ovulation?</h3>
                <div className="space-y-4 text-gray-600">
                  <p>
                    Ovulation is the process where a mature egg is released from the ovary, typically occurring 
                    around day 14 of a 28-day menstrual cycle. The egg travels down the fallopian tube where 
                    it can be fertilized by sperm for 12-24 hours after release.
                  </p>
                  <p>
                    Our ovulation calculator helps you predict this crucial timing by analyzing your menstrual 
                    cycle patterns. Understanding when ovulation occurs is essential for both conception planning 
                    and natural family planning methods.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">How to Use This Calculator?</h3>
                <div className="space-y-4 text-gray-600">
                  <p>
                    Enter the first day of your last menstrual period and your average cycle length. 
                    The calculator uses this information to predict your next ovulation date and fertile window.
                  </p>
                  <ul className="space-y-2 list-disc list-inside">
                    <li>Track cycles for 3-6 months for accuracy</li>
                    <li>Monitor physical signs of ovulation</li>
                    <li>Consider using ovulation test strips</li>
                    <li>Note any cycle irregularities</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Signs of Ovulation</h3>
                <div className="space-y-3 text-gray-600">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Changes in cervical mucus (clear, stretchy texture)</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Slight increase in basal body temperature</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Mild pelvic or abdominal pain (mittelschmerz)</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Breast tenderness and increased libido</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Light spotting or ovulation bleeding</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Understanding Fertile Window</h3>
                <div className="space-y-3 text-gray-600">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Fertile window spans 6 days: 5 days before ovulation plus ovulation day</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Sperm can survive in the female reproductive tract for up to 5 days</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Highest conception probability occurs 1-2 days before ovulation</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Regular intercourse every 2-3 days optimizes chances</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Egg viability lasts 12-24 hours after ovulation</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Additional SEO Content Sections */}
          <div className="mt-12 space-y-8">
            {/* Fertility and Conception Planning */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Fertility and Conception Planning</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-gray-800">Optimizing Conception</h4>
                    <p className="text-gray-600 text-sm">
                      Planning conception requires understanding your body's natural rhythms. Our ovulation calculator 
                      provides the foundation for timing intercourse during your most fertile days, significantly 
                      increasing the likelihood of pregnancy.
                    </p>
                    <ul className="text-gray-600 space-y-2 text-sm list-disc list-inside">
                      <li>Time intercourse within the fertile window</li>
                      <li>Maintain consistent cycle tracking</li>
                      <li>Consider lifestyle factors affecting fertility</li>
                      <li>Monitor ovulation signs and symptoms</li>
                    </ul>
                  </div>
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-gray-800">Menstrual Cycle Factors</h4>
                    <p className="text-gray-600 text-sm">
                      Cycle length varies between individuals and can be influenced by stress, diet, exercise, 
                      and health conditions. Regular tracking helps identify patterns and irregularities that 
                      may affect ovulation timing.
                    </p>
                    <ul className="text-gray-600 space-y-2 text-sm list-disc list-inside">
                      <li>Normal cycles range from 21-35 days</li>
                      <li>Ovulation typically occurs 12-16 days before next period</li>
                      <li>Cycle irregularities may indicate hormonal issues</li>
                      <li>Age affects cycle regularity and fertility</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Ovulation Tracking Methods */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
                <CardContent className="p-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">Ovulation Tracking Methods</h3>
                  <div className="space-y-4 text-gray-600">
                    <div className="border-l-4 border-blue-500 pl-4">
                      <h4 className="font-semibold text-gray-800 mb-2">Calendar Method</h4>
                      <p className="text-sm">Track menstrual cycles over several months to predict ovulation based on cycle patterns and length.</p>
                    </div>
                    <div className="border-l-4 border-green-500 pl-4">
                      <h4 className="font-semibold text-gray-800 mb-2">Basal Body Temperature</h4>
                      <p className="text-sm">Monitor daily temperature changes that occur after ovulation due to hormonal fluctuations.</p>
                    </div>
                    <div className="border-l-4 border-orange-500 pl-4">
                      <h4 className="font-semibold text-gray-800 mb-2">Cervical Mucus</h4>
                      <p className="text-sm">Observe changes in cervical discharge throughout the cycle to identify fertile periods.</p>
                    </div>
                    <div className="border-l-4 border-purple-500 pl-4">
                      <h4 className="font-semibold text-gray-800 mb-2">Ovulation Tests</h4>
                      <p className="text-sm">Use LH strips to detect the luteinizing hormone surge that precedes ovulation by 24-48 hours.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
                <CardContent className="p-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">Lifestyle Factors Affecting Fertility</h3>
                  <div className="space-y-4 text-gray-600">
                    <div className="bg-blue-50 rounded-lg p-4">
                      <h4 className="font-semibold text-blue-800 mb-2">Nutrition and Diet</h4>
                      <p className="text-sm text-blue-700">Maintain balanced nutrition with adequate folic acid, iron, and vitamins to support reproductive health.</p>
                    </div>
                    <div className="bg-green-50 rounded-lg p-4">
                      <h4 className="font-semibold text-green-800 mb-2">Exercise and Weight</h4>
                      <p className="text-sm text-green-700">Regular moderate exercise and healthy BMI support regular ovulation and hormonal balance.</p>
                    </div>
                    <div className="bg-orange-50 rounded-lg p-4">
                      <h4 className="font-semibold text-orange-800 mb-2">Stress Management</h4>
                      <p className="text-sm text-orange-700">Chronic stress can disrupt hormonal balance and affect ovulation timing and cycle regularity.</p>
                    </div>
                    <div className="bg-purple-50 rounded-lg p-4">
                      <h4 className="font-semibold text-purple-800 mb-2">Sleep and Environment</h4>
                      <p className="text-sm text-purple-700">Quality sleep and reduced exposure to toxins support optimal reproductive function.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Ovulation FAQs Section */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-8">Frequently Asked Questions about Ovulation</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">How accurate are ovulation calculators?</h4>
                      <p className="text-gray-600 text-sm">Ovulation calculators provide estimates based on average cycles. Accuracy improves with consistent cycle tracking and combining with other fertility signs for personalized predictions.</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">Can I ovulate without having a period?</h4>
                      <p className="text-gray-600 text-sm">Yes, ovulation can occur without menstruation, especially during breastfeeding or when coming off birth control. This makes cycle tracking more challenging.</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">What if my cycles are irregular?</h4>
                      <p className="text-gray-600 text-sm">Irregular cycles make prediction difficult. Focus on tracking ovulation signs like cervical mucus and consider consulting a healthcare provider for underlying causes.</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">How long should I track before seeking help?</h4>
                      <p className="text-gray-600 text-sm">Try for 12 months if under 35, or 6 months if over 35. Seek medical advice sooner if you have irregular cycles or known fertility issues.</p>
                    </div>
                  </div>
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">Can stress affect ovulation timing?</h4>
                      <p className="text-gray-600 text-sm">Yes, significant stress can delay or prevent ovulation by disrupting hormonal balance. Managing stress through relaxation techniques may help regulate cycles.</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">Is it possible to ovulate twice in one cycle?</h4>
                      <p className="text-gray-600 text-sm">While rare, hyperovulation can occur when multiple eggs are released within 24 hours. This is different from ovulating twice in separate events during one cycle.</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">Do ovulation symptoms vary between women?</h4>
                      <p className="text-gray-600 text-sm">Yes, ovulation symptoms vary significantly. Some women experience clear signs while others have subtle or no noticeable symptoms, making tracking tools valuable.</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">Can medications affect ovulation?</h4>
                      <p className="text-gray-600 text-sm">Certain medications, including some antidepressants, antihistamines, and hormonal treatments, can affect ovulation timing and cycle regularity.</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Conception Tips and Natural Family Planning */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
                <CardContent className="p-8">
                  <h3 className="text-xl font-bold text-gray-900 mb-6">Conception Tips</h3>
                  <div className="space-y-4 text-gray-600">
                    <p className="text-sm">
                      Maximize conception chances by timing intercourse during the fertile window and maintaining reproductive health.
                    </p>
                    <div className="space-y-2">
                      <h4 className="font-semibold text-green-800 text-sm">Best Practices:</h4>
                      <ul className="text-xs space-y-1 list-disc list-inside text-green-700">
                        <li>Have intercourse every 2-3 days during fertile window</li>
                        <li>Take prenatal vitamins with folic acid</li>
                        <li>Maintain healthy weight and lifestyle</li>
                        <li>Limit alcohol and avoid smoking</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
                <CardContent className="p-8">
                  <h3 className="text-xl font-bold text-gray-900 mb-6">Natural Family Planning</h3>
                  <div className="space-y-4 text-gray-600">
                    <p className="text-sm">
                      Use fertility awareness methods for natural contraception by avoiding intercourse during fertile periods.
                    </p>
                    <div className="space-y-2">
                      <h4 className="font-semibold text-blue-800 text-sm">Key Methods:</h4>
                      <ul className="text-xs space-y-1 list-disc list-inside text-blue-700">
                        <li>Calendar rhythm method tracking</li>
                        <li>Cervical mucus observation</li>
                        <li>Basal body temperature monitoring</li>
                        <li>Symptothermal method combination</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
                <CardContent className="p-8">
                  <h3 className="text-xl font-bold text-gray-900 mb-6">When to Seek Help</h3>
                  <div className="space-y-4 text-gray-600">
                    <p className="text-sm">
                      Consult healthcare providers if experiencing fertility challenges or irregular cycles affecting family planning goals.
                    </p>
                    <div className="space-y-2">
                      <h4 className="font-semibold text-red-800 text-sm">Warning Signs:</h4>
                      <ul className="text-xs space-y-1 list-disc list-inside text-red-700">
                        <li>Cycles shorter than 21 or longer than 35 days</li>
                        <li>No ovulation signs after tracking</li>
                        <li>Severe menstrual pain or heavy bleeding</li>
                        <li>No conception after 12 months of trying</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Advanced Fertility Topics */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Advanced Fertility Insights</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-r-lg">
                      <h4 className="font-semibold text-red-800 mb-2">Age and Fertility</h4>
                      <p className="text-red-700 text-sm">Female fertility declines with age, particularly after 35. Egg quality and quantity decrease, affecting conception rates and ovulation regularity.</p>
                    </div>
                    <div className="bg-orange-50 border-l-4 border-orange-400 p-4 rounded-r-lg">
                      <h4 className="font-semibold text-orange-800 mb-2">Hormonal Influences</h4>
                      <p className="text-orange-700 text-sm">FSH, LH, estrogen, and progesterone orchestrate ovulation. Imbalances can disrupt timing and affect cycle predictability.</p>
                    </div>
                    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-lg">
                      <h4 className="font-semibold text-yellow-800 mb-2">PCOS and Ovulation</h4>
                      <p className="text-yellow-700 text-sm">Polycystic Ovary Syndrome affects ovulation regularity, making cycle prediction challenging and requiring specialized tracking methods.</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-lg">
                      <h4 className="font-semibold text-blue-800 mb-2">Male Fertility Factors</h4>
                      <p className="text-blue-700 text-sm">Male fertility affects conception timing. Sperm quality, count, and motility influence the optimal timing within the fertile window.</p>
                    </div>
                    <div className="bg-purple-50 border-l-4 border-purple-400 p-4 rounded-r-lg">
                      <h4 className="font-semibold text-purple-800 mb-2">Environmental Factors</h4>
                      <p className="text-purple-700 text-sm">Environmental toxins, chemicals, and lifestyle factors can impact ovulation timing and overall reproductive health.</p>
                    </div>
                    <div className="bg-green-50 border-l-4 border-green-400 p-4 rounded-r-lg">
                      <h4 className="font-semibold text-green-800 mb-2">Fertility Supplements</h4>
                      <p className="text-green-700 text-sm">Certain supplements like CoQ10, vitamin D, and omega-3s may support reproductive health and regular ovulation patterns.</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Disclaimer and Medical Advice */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Important Medical Disclaimer</h3>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                  <p className="text-gray-700 text-sm leading-relaxed">
                    <strong>Medical Disclaimer:</strong> This ovulation calculator provides estimates based on general menstrual cycle patterns and should not replace professional medical advice. Individual cycles vary significantly, and many factors can affect ovulation timing. While this tool can help with family planning, it should not be used as the sole method for contraception or fertility treatment. 
                  </p>
                  <p className="text-gray-700 text-sm leading-relaxed mt-4">
                    Consult with healthcare providers for personalized fertility advice, especially if you have irregular cycles, underlying health conditions, or have been trying to conceive for an extended period. This calculator is for educational purposes and general guidance only.
                  </p>
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
