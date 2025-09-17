
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
import { format, addDays, differenceInWeeks, differenceInDays, isValid, parseISO } from 'date-fns';

interface PregnancyResult {
  dueDate: Date;
  currentWeek: number;
  currentDay: number;
  trimester: number;
  daysRemaining: number;
  weeksRemaining: number;
  conceptionDate: Date;
  milestones: {
    firstTrimesterEnd: Date;
    secondTrimesterEnd: Date;
    viabilityDate: Date;
    fullTermStart: Date;
  };
}

export default function PregnancyDueDateCalculator() {
  const [lastPeriodDate, setLastPeriodDate] = useState('');
  const [cycleLength, setCycleLength] = useState('28');
  const [calculationMethod, setCalculationMethod] = useState('lmp');
  const [conceptionDate, setConceptionDate] = useState('');
  const [ultrasoundDate, setUltrasoundDate] = useState('');
  const [ultrasoundWeeks, setUltrasoundWeeks] = useState('');
  const [ultrasoundDays, setUltrasoundDays] = useState('');
  const [result, setResult] = useState<PregnancyResult | null>(null);

  const calculateDueDate = () => {
    let calculatedDueDate: Date | null = null;
    let calculatedConceptionDate: Date | null = null;

    if (calculationMethod === 'lmp' && lastPeriodDate) {
      // Naegele's Rule: Add 280 days (40 weeks) to LMP
      const lmpDate = parseISO(lastPeriodDate);
      if (isValid(lmpDate)) {
        calculatedDueDate = addDays(lmpDate, 280);
        // Estimate conception date (usually 14 days after LMP, but adjust for cycle length)
        const ovulationDay = parseInt(cycleLength) - 14;
        calculatedConceptionDate = addDays(lmpDate, ovulationDay);
      }
    } else if (calculationMethod === 'conception' && conceptionDate) {
      // Add 266 days (38 weeks) to conception date
      const concDate = parseISO(conceptionDate);
      if (isValid(concDate)) {
        calculatedDueDate = addDays(concDate, 266);
        calculatedConceptionDate = concDate;
      }
    } else if (calculationMethod === 'ultrasound' && ultrasoundDate && ultrasoundWeeks) {
      // Calculate based on ultrasound dating
      const usDate = parseISO(ultrasoundDate);
      const totalDaysAtUS = (parseInt(ultrasoundWeeks) * 7) + (parseInt(ultrasoundDays) || 0);
      const daysSinceConception = totalDaysAtUS - 14; // Subtract 2 weeks for gestational vs embryonic age
      
      if (isValid(usDate)) {
        // Calculate conception date from ultrasound
        calculatedConceptionDate = addDays(usDate, -daysSinceConception);
        calculatedDueDate = addDays(calculatedConceptionDate, 266);
      }
    }

    if (calculatedDueDate && calculatedConceptionDate) {
      const today = new Date();
      const gestationalAge = differenceInDays(today, addDays(calculatedConceptionDate, -14));
      const currentWeek = Math.floor(gestationalAge / 7);
      const currentDay = gestationalAge % 7;
      
      // Determine trimester (using gestational weeks)
      let trimester = 1;
      if (currentWeek >= 27) trimester = 3;
      else if (currentWeek >= 13) trimester = 2;

      const daysRemaining = differenceInDays(calculatedDueDate, today);
      const weeksRemaining = Math.floor(daysRemaining / 7);

      // Calculate important milestones
      const lmpForMilestones = addDays(calculatedConceptionDate, -14);
      const milestones = {
        firstTrimesterEnd: addDays(lmpForMilestones, 91), // 13 weeks
        secondTrimesterEnd: addDays(lmpForMilestones, 189), // 27 weeks
        viabilityDate: addDays(lmpForMilestones, 161), // 23 weeks (viability threshold)
        fullTermStart: addDays(lmpForMilestones, 259), // 37 weeks (full term)
      };

      setResult({
        dueDate: calculatedDueDate,
        currentWeek: Math.max(0, currentWeek),
        currentDay: Math.max(0, currentDay),
        trimester,
        daysRemaining: Math.max(0, daysRemaining),
        weeksRemaining: Math.max(0, weeksRemaining),
        conceptionDate: calculatedConceptionDate,
        milestones
      });
    }
  };

  const resetCalculator = () => {
    setLastPeriodDate('');
    setCycleLength('28');
    setCalculationMethod('lmp');
    setConceptionDate('');
    setUltrasoundDate('');
    setUltrasoundWeeks('');
    setUltrasoundDays('');
    setResult(null);
  };

  const getTrimesterColor = (trimester: number) => {
    switch (trimester) {
      case 1: return 'text-pink-600';
      case 2: return 'text-purple-600';
      case 3: return 'text-indigo-600';
      default: return 'text-gray-600';
    }
  };

  const getTrimesterName = (trimester: number) => {
    switch (trimester) {
      case 1: return 'First Trimester';
      case 2: return 'Second Trimester';
      case 3: return 'Third Trimester';
      default: return 'Pre-pregnancy';
    }
  };

  const formatDate = (date: Date) => {
    return format(date, 'MMMM d, yyyy');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Helmet>
        <title>Pregnancy Due Date Calculator - Calculate Your Baby's Due Date | DapsiWow</title>
        <meta name="description" content="Free pregnancy due date calculator to calculate your baby's due date using last menstrual period, conception date, or ultrasound results. Get pregnancy milestones, trimester information, and week-by-week progress tracking." />
        <meta name="keywords" content="pregnancy due date calculator, baby due date calculator, pregnancy calculator, gestational age calculator, pregnancy weeks calculator, trimester calculator, conception date calculator, pregnancy milestone tracker, due date estimator" />
        <meta property="og:title" content="Pregnancy Due Date Calculator - Calculate Your Baby's Due Date | DapsiWow" />
        <meta property="og:description" content="Calculate your baby's due date and track pregnancy progress with our comprehensive pregnancy calculator. Multiple calculation methods available including LMP and ultrasound dating." />
        <meta property="og:type" content="website" />
        <meta name="robots" content="index, follow" />
        <meta name="author" content="DapsiWow" />
        <link rel="canonical" href="https://dapsiwow.com/tools/pregnancy-due-date-calculator" />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            "name": "Pregnancy Due Date Calculator",
            "description": "Free online pregnancy due date calculator to estimate your baby's due date using last menstrual period, conception date, or ultrasound measurements. Track pregnancy milestones and trimester progression.",
            "url": "https://dapsiwow.com/tools/pregnancy-due-date-calculator",
            "applicationCategory": "HealthApplication",
            "operatingSystem": "Any",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "USD"
            },
            "featureList": [
              "Calculate due date from last menstrual period",
              "Conception date calculator",
              "Ultrasound-based dating",
              "Pregnancy milestone tracking",
              "Trimester progression",
              "Gestational age calculator"
            ]
          })}
        </script>
      </Helmet>
      
      <Header />
      
      <main>
        {/* Hero Section */}
        <section className="relative py-20 sm:py-28 lg:py-32 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-pink-600/10 to-purple-600/20"></div>
          <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="space-y-8">
              <div className="inline-flex items-center px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full border border-pink-200">
                <span className="text-sm font-medium text-pink-700">Professional Pregnancy Calculator</span>
              </div>
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-slate-900 leading-tight">
                Pregnancy
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-purple-600">
                  Due Date Calculator
                </span>
              </h1>
              <p className="text-xl sm:text-2xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
                Calculate your baby's due date with advanced pregnancy tracking and milestone monitoring
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
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">Pregnancy Information</h2>
                    <p className="text-gray-600">Enter your pregnancy details to calculate your due date</p>
                  </div>
                  
                  <div className="space-y-6">
                    {/* Calculation Method */}
                    <div className="space-y-4">
                      <Label className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                        Calculation Method
                      </Label>
                      <RadioGroup 
                        value={calculationMethod} 
                        onValueChange={setCalculationMethod}
                        className="grid grid-cols-1 gap-4"
                      >
                        <div className="flex items-center space-x-3 p-4 border-2 border-gray-200 rounded-xl hover:border-pink-300 transition-colors">
                          <RadioGroupItem value="lmp" id="lmp" data-testid="radio-lmp" className="border-2" />
                          <div className="flex-1">
                            <Label htmlFor="lmp" className="font-medium text-gray-900 cursor-pointer">
                              Last Menstrual Period (LMP)
                            </Label>
                            <p className="text-sm text-gray-500 mt-1">Most common method using your last period date</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3 p-4 border-2 border-gray-200 rounded-xl hover:border-pink-300 transition-colors">
                          <RadioGroupItem value="conception" id="conception" data-testid="radio-conception" className="border-2" />
                          <div className="flex-1">
                            <Label htmlFor="conception" className="font-medium text-gray-900 cursor-pointer">
                              Conception Date
                            </Label>
                            <p className="text-sm text-gray-500 mt-1">If you know the exact date of conception</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3 p-4 border-2 border-gray-200 rounded-xl hover:border-pink-300 transition-colors">
                          <RadioGroupItem value="ultrasound" id="ultrasound" data-testid="radio-ultrasound" className="border-2" />
                          <div className="flex-1">
                            <Label htmlFor="ultrasound" className="font-medium text-gray-900 cursor-pointer">
                              Ultrasound Dating
                            </Label>
                            <p className="text-sm text-gray-500 mt-1">Most accurate method using ultrasound measurements</p>
                          </div>
                        </div>
                      </RadioGroup>
                    </div>

                    {/* Last Menstrual Period Method */}
                    {calculationMethod === 'lmp' && (
                      <div className="space-y-6 bg-gray-50 rounded-xl p-6">
                        <div className="space-y-3">
                          <Label htmlFor="lmp-date" className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                            First Day of Last Menstrual Period
                          </Label>
                          <Input
                            id="lmp-date"
                            type="date"
                            value={lastPeriodDate}
                            onChange={(e) => setLastPeriodDate(e.target.value)}
                            className="h-14 text-lg border-2 border-gray-200 rounded-xl focus:border-pink-500 focus:ring-pink-500"
                            data-testid="input-lmp-date"
                          />
                        </div>

                        <div className="space-y-3">
                          <Label htmlFor="cycle-length" className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                            Average Cycle Length
                          </Label>
                          <Select value={cycleLength} onValueChange={setCycleLength}>
                            <SelectTrigger className="h-14 border-2 border-gray-200 rounded-xl text-lg" data-testid="select-cycle-length">
                              <SelectValue placeholder="Select cycle length" />
                            </SelectTrigger>
                            <SelectContent>
                              {Array.from({ length: 21 }, (_, i) => i + 20).map(day => (
                                <SelectItem key={day} value={day.toString()}>{day} days</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <p className="text-sm text-gray-500">
                            Average cycle length is 28 days. Adjust if your cycle is typically longer or shorter.
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Conception Date Method */}
                    {calculationMethod === 'conception' && (
                      <div className="space-y-6 bg-gray-50 rounded-xl p-6">
                        <div className="space-y-3">
                          <Label htmlFor="conception-date" className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                            Conception Date
                          </Label>
                          <Input
                            id="conception-date"
                            type="date"
                            value={conceptionDate}
                            onChange={(e) => setConceptionDate(e.target.value)}
                            className="h-14 text-lg border-2 border-gray-200 rounded-xl focus:border-pink-500 focus:ring-pink-500"
                            data-testid="input-conception-date"
                          />
                          <p className="text-sm text-gray-500">
                            Enter the estimated or known date of conception.
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Ultrasound Method */}
                    {calculationMethod === 'ultrasound' && (
                      <div className="space-y-6 bg-gray-50 rounded-xl p-6">
                        <div className="space-y-3">
                          <Label htmlFor="ultrasound-date" className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                            Ultrasound Date
                          </Label>
                          <Input
                            id="ultrasound-date"
                            type="date"
                            value={ultrasoundDate}
                            onChange={(e) => setUltrasoundDate(e.target.value)}
                            className="h-14 text-lg border-2 border-gray-200 rounded-xl focus:border-pink-500 focus:ring-pink-500"
                            data-testid="input-ultrasound-date"
                          />
                        </div>

                        <div className="space-y-3">
                          <Label className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                            Gestational Age at Ultrasound
                          </Label>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="us-weeks" className="text-sm font-medium text-gray-700">Weeks</Label>
                              <Input
                                id="us-weeks"
                                type="number"
                                value={ultrasoundWeeks}
                                onChange={(e) => setUltrasoundWeeks(e.target.value)}
                                className="h-14 text-lg border-2 border-gray-200 rounded-xl focus:border-pink-500 focus:ring-pink-500"
                                placeholder="12"
                                min="4"
                                max="42"
                                data-testid="input-ultrasound-weeks"
                              />
                            </div>
                            <div>
                              <Label htmlFor="us-days" className="text-sm font-medium text-gray-700">Days</Label>
                              <Input
                                id="us-days"
                                type="number"
                                value={ultrasoundDays}
                                onChange={(e) => setUltrasoundDays(e.target.value)}
                                className="h-14 text-lg border-2 border-gray-200 rounded-xl focus:border-pink-500 focus:ring-pink-500"
                                placeholder="3"
                                min="0"
                                max="6"
                                data-testid="input-ultrasound-days"
                              />
                            </div>
                          </div>
                          <p className="text-sm text-gray-500">
                            Enter the gestational age as determined by your ultrasound.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-4 pt-6">
                    <Button
                      onClick={calculateDueDate}
                      className="flex-1 h-14 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white font-semibold text-lg rounded-xl shadow-lg transform transition-all duration-200 hover:scale-105"
                      data-testid="button-calculate"
                    >
                      Calculate Due Date
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
                <div className="bg-gradient-to-br from-gray-50 to-pink-50 p-8 lg:p-12">
                  <h2 className="text-2xl font-bold text-gray-900 mb-8">Pregnancy Results</h2>
                  
                  {result ? (
                    <div className="space-y-6" data-testid="pregnancy-results">
                      {/* Due Date Highlight */}
                      <div className="bg-white rounded-2xl p-6 shadow-lg border border-pink-100">
                        <div className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-2">Estimated Due Date</div>
                        <div className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-purple-600" data-testid="text-due-date">
                          {formatDate(result.dueDate)}
                        </div>
                      </div>

                      {/* Current Progress */}
                      <div className="space-y-4">
                        <div className="bg-white rounded-xl p-4 shadow-sm">
                          <div className="flex justify-between items-center">
                            <span className="font-medium text-gray-700">Gestational Age</span>
                            <span className="font-bold text-gray-900" data-testid="text-gestational-age">
                              {result.currentWeek}w {result.currentDay}d
                            </span>
                          </div>
                        </div>
                        <div className="bg-white rounded-xl p-4 shadow-sm">
                          <div className="flex justify-between items-center">
                            <span className="font-medium text-gray-700">Current Trimester</span>
                            <span className={`font-bold ${getTrimesterColor(result.trimester)}`} data-testid="text-trimester">
                              {getTrimesterName(result.trimester)}
                            </span>
                          </div>
                        </div>
                        <div className="bg-white rounded-xl p-4 shadow-sm">
                          <div className="flex justify-between items-center">
                            <span className="font-medium text-gray-700">Time Remaining</span>
                            <span className="font-bold text-gray-900" data-testid="text-time-remaining">
                              {result.weeksRemaining} weeks
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Important Milestones */}
                      <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-xl p-6 border border-pink-200">
                        <h4 className="font-bold text-pink-800 mb-4 text-lg">Important Milestones</h4>
                        <div className="space-y-3 text-sm">
                          <div className="flex justify-between items-center">
                            <span className="text-pink-700 font-medium">Conception Date:</span>
                            <span className="font-bold text-pink-800" data-testid="text-conception-date">
                              {formatDate(result.conceptionDate)}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-pink-700 font-medium">End of 1st Trimester:</span>
                            <span className="font-bold text-pink-800">
                              {formatDate(result.milestones.firstTrimesterEnd)}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-pink-700 font-medium">Viability (23 weeks):</span>
                            <span className="font-bold text-pink-800">
                              {formatDate(result.milestones.viabilityDate)}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-pink-700 font-medium">Full Term (37 weeks):</span>
                            <span className="font-bold text-pink-800">
                              {formatDate(result.milestones.fullTermStart)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-16" data-testid="no-results">
                      <div className="w-20 h-20 bg-gray-200 rounded-full mx-auto mb-6 flex items-center justify-center">
                        <div className="text-3xl font-bold text-gray-400">👶</div>
                      </div>
                      <p className="text-gray-500 text-lg">Enter pregnancy information to calculate due date</p>
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
                <h3 className="text-2xl font-bold text-gray-900 mb-6">What is a Pregnancy Due Date Calculator?</h3>
                <div className="space-y-4 text-gray-600">
                  <p>
                    A pregnancy due date calculator is an essential tool that helps expectant parents estimate when their baby will be born. 
                    This free online pregnancy calculator uses various methods to determine the estimated date of delivery (EDD) based on your 
                    pregnancy information, including last menstrual period, conception date, or ultrasound measurements.
                  </p>
                  <p>
                    Our advanced pregnancy due date calculator provides accurate calculations using proven medical formulas like Naegele's Rule, 
                    helping you plan for your baby's arrival. Whether you're in your first trimester or tracking your pregnancy progression, 
                    this tool offers comprehensive due date estimation with detailed milestone tracking.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">How to Calculate Your Due Date</h3>
                <div className="space-y-4 text-gray-600">
                  <p>
                    The most common method uses Naegele's Rule: add 280 days (40 weeks) to the first day of your last menstrual period. 
                    This calculation assumes a 28-day cycle with ovulation occurring on day 14.
                  </p>
                  <ul className="space-y-2 list-disc list-inside">
                    <li>LMP Method: Most widely used by healthcare providers</li>
                    <li>Conception Date: Adds 266 days from fertilization</li>
                    <li>Ultrasound Dating: Most accurate, especially in first trimester</li>
                  </ul>
                  <p>
                    Our calculator automatically applies the appropriate formula based on your chosen method and provides additional 
                    insights like gestational age, current trimester, and important pregnancy milestones.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Pregnancy Calculation Methods</h3>
                <div className="space-y-4">
                  <div className="bg-pink-50 rounded-lg p-4">
                    <h4 className="font-semibold text-pink-800 mb-2">Last Menstrual Period (LMP)</h4>
                    <p className="text-pink-700 text-sm">
                      The standard method used by most healthcare providers. Calculates due date by adding 280 days to your last period.
                    </p>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-4">
                    <h4 className="font-semibold text-purple-800 mb-2">Conception Date Method</h4>
                    <p className="text-purple-700 text-sm">
                      More precise if you know the exact conception date. Adds 266 days from fertilization to estimate delivery.
                    </p>
                  </div>
                  <div className="bg-indigo-50 rounded-lg p-4">
                    <h4 className="font-semibold text-indigo-800 mb-2">Ultrasound Dating</h4>
                    <p className="text-indigo-700 text-sm">
                      Most accurate method using fetal measurements. Especially reliable when performed in the first trimester.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Pregnancy Milestones & Trimesters</h3>
                <div className="space-y-4">
                  <div className="border-l-4 border-pink-500 pl-4">
                    <h4 className="font-semibold text-gray-800 mb-2">First Trimester (Weeks 1-13)</h4>
                    <p className="text-gray-600 text-sm">
                      Critical organ development, neural tube formation. Morning sickness and fatigue are common.
                    </p>
                  </div>
                  <div className="border-l-4 border-purple-500 pl-4">
                    <h4 className="font-semibold text-gray-800 mb-2">Second Trimester (Weeks 14-27)</h4>
                    <p className="text-gray-600 text-sm">
                      Often called the "golden period." Energy returns, baby movement felt, anatomy scan performed.
                    </p>
                  </div>
                  <div className="border-l-4 border-indigo-500 pl-4">
                    <h4 className="font-semibold text-gray-800 mb-2">Third Trimester (Weeks 28-40)</h4>
                    <p className="text-gray-600 text-sm">
                      Rapid growth phase, lung maturation, preparing for birth. More frequent monitoring required.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Additional SEO Content Sections */}
          <div className="mt-12 space-y-8">
            {/* Due Date Accuracy Section */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Due Date Accuracy and Important Considerations</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div>
                    <h4 className="text-xl font-semibold text-gray-800 mb-4">How Accurate Are Due Date Calculations?</h4>
                    <div className="space-y-4">
                      <div className="bg-red-50 rounded-lg p-4 border-l-4 border-red-400">
                        <h5 className="font-medium text-red-900 mb-2">Reality Check</h5>
                        <p className="text-red-800 text-sm">
                          Only about 5% of babies are born exactly on their due date. Most births occur within 2 weeks 
                          before or after the estimated due date.
                        </p>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                          <span className="font-medium text-sm">LMP Method Accuracy</span>
                          <span className="text-orange-600 font-semibold text-sm">±1-2 weeks</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                          <span className="font-medium text-sm">Early Ultrasound (6-11 weeks)</span>
                          <span className="text-green-600 font-semibold text-sm">±3-5 days</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                          <span className="font-medium text-sm">Later Ultrasound (12-22 weeks)</span>
                          <span className="text-yellow-600 font-semibold text-sm">±1-2 weeks</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-xl font-semibold text-gray-800 mb-4">Factors Affecting Accuracy</h4>
                    <div className="space-y-3">
                      <div className="bg-blue-50 rounded-lg p-3">
                        <h5 className="font-semibold text-blue-800 mb-1">Irregular Cycles</h5>
                        <p className="text-blue-700 text-sm">Irregular menstrual cycles can affect LMP-based calculations</p>
                      </div>
                      <div className="bg-green-50 rounded-lg p-3">
                        <h5 className="font-semibold text-green-800 mb-1">Multiple Pregnancies</h5>
                        <p className="text-green-700 text-sm">Twins or triplets often arrive earlier than calculated due date</p>
                      </div>
                      <div className="bg-purple-50 rounded-lg p-3">
                        <h5 className="font-semibold text-purple-800 mb-1">First vs. Subsequent Pregnancies</h5>
                        <p className="text-purple-700 text-sm">First pregnancies tend to last slightly longer than subsequent ones</p>
                      </div>
                      <div className="bg-orange-50 rounded-lg p-3">
                        <h5 className="font-semibold text-orange-800 mb-1">Medical Conditions</h5>
                        <p className="text-orange-700 text-sm">Conditions like PCOS or diabetes may affect pregnancy duration</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Benefits and Planning Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
                <CardContent className="p-8">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Planning Benefits</h4>
                  <ul className="space-y-2 text-gray-600 text-sm">
                    <li>• Schedule prenatal appointments and tests</li>
                    <li>• Plan maternity leave and childcare arrangements</li>
                    <li>• Organize baby shower and nursery preparation</li>
                    <li>• Budget for medical expenses and baby supplies</li>
                    <li>• Coordinate with healthcare providers</li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
                <CardContent className="p-8">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Health Monitoring</h4>
                  <ul className="space-y-2 text-gray-600 text-sm">
                    <li>• Track fetal development milestones</li>
                    <li>• Monitor pregnancy progression accurately</li>
                    <li>• Schedule important screening tests</li>
                    <li>• Identify potential complications early</li>
                    <li>• Plan for delivery preferences</li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
                <CardContent className="p-8">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Calculator Features</h4>
                  <ul className="space-y-2 text-gray-600 text-sm">
                    <li>• Multiple calculation methods available</li>
                    <li>• Accurate gestational age tracking</li>
                    <li>• Trimester classification and milestones</li>
                    <li>• Important pregnancy date calculations</li>
                    <li>• Free and easy to use interface</li>
                  </ul>
                </CardContent>
              </Card>
            </div>

            {/* FAQ Section */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-8">Frequently Asked Questions About Due Date Calculation</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">When is the best time to calculate my due date?</h4>
                      <p className="text-gray-600 text-sm">
                        The earlier in pregnancy, the more accurate the calculation. First-trimester ultrasounds provide 
                        the most precise dating, while LMP calculations work best with regular cycles.
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">Can my due date change during pregnancy?</h4>
                      <p className="text-gray-600 text-sm">
                        Yes, due dates may be adjusted based on ultrasound measurements, especially if there's a significant 
                        discrepancy with initial LMP calculations. Early ultrasounds are considered most reliable.
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">What if I don't remember my last period?</h4>
                      <p className="text-gray-600 text-sm">
                        If you don't remember your LMP, use the conception date method if known, or rely on early ultrasound 
                        dating for the most accurate estimate. Consult your healthcare provider for guidance.
                      </p>
                    </div>
                  </div>
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">How does cycle length affect due date calculation?</h4>
                      <p className="text-gray-600 text-sm">
                        Longer or shorter cycles can shift ovulation timing, affecting conception date estimates. Our calculator 
                        adjusts for cycle length variations to provide more accurate results.
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">Are there different calculations for IVF pregnancies?</h4>
                      <p className="text-gray-600 text-sm">
                        IVF pregnancies use the embryo transfer date for more precise calculations, as the conception date 
                        is exactly known. This method is typically more accurate than LMP-based calculations.
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">Should I be concerned if my baby hasn't arrived by the due date?</h4>
                      <p className="text-gray-600 text-sm">
                        Pregnancies are considered full-term from 37-42 weeks. Most babies arrive within this range. 
                        Your healthcare provider will monitor you closely as you approach and pass your due date.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Medical Disclaimer */}
            <Card className="bg-gradient-to-r from-pink-50 to-purple-50 shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Important Medical Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">When to Consult Your Healthcare Provider</h4>
                    <ul className="text-gray-600 space-y-2 text-sm">
                      <li>• Confirm pregnancy and validate due date calculations</li>
                      <li>• Schedule comprehensive prenatal care plan</li>
                      <li>• Discuss any concerns about pregnancy progression</li>
                      <li>• Plan delivery options and birthing preferences</li>
                      <li>• Address complications or high-risk factors</li>
                      <li>• Monitor fetal growth and development</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">Signs Requiring Immediate Attention</h4>
                    <ul className="text-red-600 space-y-2 text-sm">
                      <li>• Severe abdominal pain or persistent cramping</li>
                      <li>• Heavy bleeding or unusual discharge</li>
                      <li>• Severe morning sickness preventing hydration</li>
                      <li>• High fever or persistent severe headaches</li>
                      <li>• Decreased fetal movement after 28 weeks</li>
                      <li>• Signs of preterm labor before 37 weeks</li>
                    </ul>
                  </div>
                </div>
                
                <div className="mt-8 p-6 bg-white rounded-lg border-l-4 border-pink-500">
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">Medical Disclaimer</h4>
                  <p className="text-sm text-gray-600 mb-3">
                    <strong>Important:</strong> This pregnancy due date calculator is designed for educational and informational 
                    purposes only. The results provide estimates based on standard pregnancy calculations and should not replace 
                    professional medical advice, diagnosis, or treatment.
                  </p>
                  <p className="text-sm text-gray-600">
                    Every pregnancy is unique, and individual circumstances may affect the accuracy of these calculations. 
                    Always consult with qualified healthcare providers for personalized medical guidance, accurate due date 
                    determination, and comprehensive prenatal care throughout your pregnancy journey.
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
