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
import { Calculator, Calendar, Baby } from 'lucide-react';
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

const PregnancyDueDateCalculator = () => {
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
    <>
      <Helmet>
        <title>Pregnancy Due Date Calculator - Calculate Your Baby's Due Date | DapsiWow</title>
        <meta name="description" content="Calculate your baby's due date using last menstrual period, conception date, or ultrasound results. Get pregnancy milestones, trimester information, and week-by-week progress." />
        <meta name="keywords" content="pregnancy due date calculator, baby due date, pregnancy calculator, gestational age calculator, pregnancy weeks, trimester calculator" />
        <meta property="og:title" content="Pregnancy Due Date Calculator - Calculate Your Baby's Due Date | DapsiWow" />
        <meta property="og:description" content="Calculate your baby's due date and track pregnancy progress with our comprehensive pregnancy calculator. Multiple calculation methods available." />
        <meta property="og:type" content="website" />
        <link rel="canonical" href="/tools/pregnancy-due-date-calculator" />
      </Helmet>

      <div className="min-h-screen flex flex-col" data-testid="page-pregnancy-calculator">
        <Header />
        
        <main className="flex-1 bg-neutral-50">
          {/* Hero Section */}
          <section className="text-white py-16" style={{ background: 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)' }}>
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <div className="w-20 h-20 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Baby className="text-3xl w-8 h-8" />
              </div>
              <h1 className="text-4xl sm:text-5xl font-bold mb-6" data-testid="text-page-title">
                Pregnancy Due Date Calculator
              </h1>
              <p className="text-xl text-pink-100 max-w-2xl mx-auto">
                Calculate your baby's due date and track your pregnancy journey with accurate gestational age and milestone tracking
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
                      <h2 className="text-2xl font-semibold text-gray-900 mb-8">Pregnancy Information</h2>
                      
                      {/* Calculation Method */}
                      <div className="space-y-3">
                        <Label>Calculation Method</Label>
                        <RadioGroup 
                          value={calculationMethod} 
                          onValueChange={setCalculationMethod}
                          className="space-y-3"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="lmp" id="lmp" data-testid="radio-lmp" />
                            <Label htmlFor="lmp">Last Menstrual Period (LMP)</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="conception" id="conception" data-testid="radio-conception" />
                            <Label htmlFor="conception">Conception Date</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="ultrasound" id="ultrasound" data-testid="radio-ultrasound" />
                            <Label htmlFor="ultrasound">Ultrasound Dating</Label>
                          </div>
                        </RadioGroup>
                      </div>

                      {/* Last Menstrual Period Method */}
                      {calculationMethod === 'lmp' && (
                        <>
                          <div className="space-y-3">
                            <Label htmlFor="lmp-date" className="text-sm font-medium text-gray-700">
                              First Day of Last Menstrual Period <span className="text-red-500">*</span>
                            </Label>
                            <Input
                              id="lmp-date"
                              type="date"
                              value={lastPeriodDate}
                              onChange={(e) => setLastPeriodDate(e.target.value)}
                              className="h-12 text-base border-gray-200 rounded-lg"
                              data-testid="input-lmp-date"
                            />
                          </div>

                          <div className="space-y-3">
                            <Label htmlFor="cycle-length" className="text-sm font-medium text-gray-700">
                              Average Cycle Length (days)
                            </Label>
                            <Select value={cycleLength} onValueChange={setCycleLength}>
                              <SelectTrigger className="h-12 border-gray-200 rounded-lg" data-testid="select-cycle-length">
                                <SelectValue placeholder="Select cycle length" />
                              </SelectTrigger>
                              <SelectContent>
                                {Array.from({ length: 21 }, (_, i) => i + 20).map(day => (
                                  <SelectItem key={day} value={day.toString()}>{day} days</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <p className="text-xs text-gray-500">
                              Average cycle length is 28 days. Adjust if your cycle is typically longer or shorter.
                            </p>
                          </div>
                        </>
                      )}

                      {/* Conception Date Method */}
                      {calculationMethod === 'conception' && (
                        <div className="space-y-3">
                          <Label htmlFor="conception-date" className="text-sm font-medium text-gray-700">
                            Conception Date <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            id="conception-date"
                            type="date"
                            value={conceptionDate}
                            onChange={(e) => setConceptionDate(e.target.value)}
                            className="h-12 text-base border-gray-200 rounded-lg"
                            data-testid="input-conception-date"
                          />
                          <p className="text-xs text-gray-500">
                            Enter the estimated or known date of conception.
                          </p>
                        </div>
                      )}

                      {/* Ultrasound Method */}
                      {calculationMethod === 'ultrasound' && (
                        <>
                          <div className="space-y-3">
                            <Label htmlFor="ultrasound-date" className="text-sm font-medium text-gray-700">
                              Ultrasound Date <span className="text-red-500">*</span>
                            </Label>
                            <Input
                              id="ultrasound-date"
                              type="date"
                              value={ultrasoundDate}
                              onChange={(e) => setUltrasoundDate(e.target.value)}
                              className="h-12 text-base border-gray-200 rounded-lg"
                              data-testid="input-ultrasound-date"
                            />
                          </div>

                          <div className="space-y-3">
                            <Label className="text-sm font-medium text-gray-700">
                              Gestational Age at Ultrasound <span className="text-red-500">*</span>
                            </Label>
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <Label htmlFor="us-weeks" className="text-xs text-gray-500">Weeks</Label>
                                <Input
                                  id="us-weeks"
                                  type="number"
                                  value={ultrasoundWeeks}
                                  onChange={(e) => setUltrasoundWeeks(e.target.value)}
                                  className="h-12 text-base border-gray-200 rounded-lg"
                                  placeholder="12"
                                  min="4"
                                  max="42"
                                  data-testid="input-ultrasound-weeks"
                                />
                              </div>
                              <div>
                                <Label htmlFor="us-days" className="text-xs text-gray-500">Days</Label>
                                <Input
                                  id="us-days"
                                  type="number"
                                  value={ultrasoundDays}
                                  onChange={(e) => setUltrasoundDays(e.target.value)}
                                  className="h-12 text-base border-gray-200 rounded-lg"
                                  placeholder="3"
                                  min="0"
                                  max="6"
                                  data-testid="input-ultrasound-days"
                                />
                              </div>
                            </div>
                            <p className="text-xs text-gray-500">
                              Enter the gestational age as determined by your ultrasound.
                            </p>
                          </div>
                        </>
                      )}

                      {/* Action Buttons */}
                      <div className="flex gap-4 pt-6">
                        <Button
                          onClick={calculateDueDate}
                          className="flex-1 h-12 text-white font-medium rounded-lg"
                          style={{ backgroundColor: '#ec4899' }}
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#db2777'}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#ec4899'}
                          data-testid="button-calculate"
                        >
                          <Calculator className="w-4 h-4 mr-2" />
                          Calculate Due Date
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
                      <h2 className="text-2xl font-semibold text-gray-900 mb-8">Pregnancy Results</h2>
                      
                      {result ? (
                        <div className="space-y-4" data-testid="pregnancy-results">
                          {/* Due Date */}
                          <div className="bg-white rounded-lg p-4 border-l-4 border-pink-500">
                            <div className="flex justify-between items-center">
                              <span className="font-semibold text-gray-700">Estimated Due Date</span>
                              <span className="text-xl font-bold text-pink-600" data-testid="text-due-date">
                                {formatDate(result.dueDate)}
                              </span>
                            </div>
                          </div>

                          {/* Current Progress */}
                          <div className="bg-white rounded-lg p-4">
                            <h3 className="font-semibold text-gray-900 mb-3">Current Progress</h3>
                            <div className="space-y-2">
                              <div className="flex justify-between items-center">
                                <span className="text-gray-600">Gestational Age</span>
                                <span className="font-semibold" data-testid="text-gestational-age">
                                  {result.currentWeek} weeks, {result.currentDay} days
                                </span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-gray-600">Trimester</span>
                                <span className={`font-semibold ${getTrimesterColor(result.trimester)}`} data-testid="text-trimester">
                                  {getTrimesterName(result.trimester)}
                                </span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-gray-600">Time Remaining</span>
                                <span className="font-semibold" data-testid="text-time-remaining">
                                  {result.weeksRemaining} weeks, {result.daysRemaining % 7} days
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Important Dates */}
                          <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-lg p-4">
                            <h3 className="font-semibold text-gray-900 mb-3">Important Milestones</h3>
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span>Conception Date</span>
                                <span className="font-medium" data-testid="text-conception-date">
                                  {formatDate(result.conceptionDate)}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span>End of 1st Trimester</span>
                                <span className="font-medium">{formatDate(result.milestones.firstTrimesterEnd)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>End of 2nd Trimester</span>
                                <span className="font-medium">{formatDate(result.milestones.secondTrimesterEnd)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Viability (23 weeks)</span>
                                <span className="font-medium">{formatDate(result.milestones.viabilityDate)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Full Term (37 weeks)</span>
                                <span className="font-medium">{formatDate(result.milestones.fullTermStart)}</span>
                              </div>
                            </div>
                          </div>

                          {/* Pregnancy Progress */}
                          <div className="mt-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-3">Pregnancy Timeline</h3>
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span>First Trimester</span>
                                <span className="text-pink-600 font-medium">Weeks 1-13</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Second Trimester</span>
                                <span className="text-purple-600 font-medium">Weeks 14-27</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Third Trimester</span>
                                <span className="text-indigo-600 font-medium">Weeks 28-40</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-8" data-testid="no-results">
                          <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                          <p className="text-gray-500">Enter your pregnancy information to calculate due date</p>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Educational Content */}
              <div className="mt-12 space-y-8">
                {/* What is a Pregnancy Due Date Calculator */}
                <div className="bg-white rounded-2xl shadow-lg p-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-8">What is a Pregnancy Due Date Calculator?</h2>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div>
                      <p className="text-gray-600 mb-6 leading-relaxed">
                        A pregnancy due date calculator is an essential tool that helps expectant parents estimate when their baby will be born. 
                        This free online pregnancy calculator uses various methods to determine the estimated date of delivery (EDD) based on your 
                        pregnancy information, including last menstrual period, conception date, or ultrasound measurements.
                      </p>
                      
                      <h3 className="text-xl font-semibold text-gray-900 mb-4">Why Use a Due Date Calculator?</h3>
                      <ul className="text-gray-600 space-y-2 text-sm mb-6">
                        <li>• Plan for pregnancy milestones and appointments</li>
                        <li>• Track gestational age and fetal development</li>
                        <li>• Prepare for maternity leave and baby preparations</li>
                        <li>• Monitor pregnancy progress week by week</li>
                        <li>• Schedule important prenatal tests and screenings</li>
                        <li>• Calculate trimester transitions accurately</li>
                      </ul>
                    </div>
                    
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-4">Key Features</h3>
                      <div className="space-y-3">
                        <div className="bg-pink-50 rounded-lg p-3">
                          <div className="font-medium">Multiple Calculation Methods</div>
                          <div className="text-sm text-gray-600">LMP, conception date, and ultrasound dating options</div>
                        </div>
                        <div className="bg-purple-50 rounded-lg p-3">
                          <div className="font-medium">Gestational Age Tracking</div>
                          <div className="text-sm text-gray-600">Current week and day of pregnancy</div>
                        </div>
                        <div className="bg-indigo-50 rounded-lg p-3">
                          <div className="font-medium">Trimester Information</div>
                          <div className="text-sm text-gray-600">Automatic trimester classification</div>
                        </div>
                        <div className="bg-green-50 rounded-lg p-3">
                          <div className="font-medium">Important Milestones</div>
                          <div className="text-sm text-gray-600">Key pregnancy dates and developments</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* How to Use the Pregnancy Calculator */}
                <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-2xl p-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-8">How to Use the Pregnancy Due Date Calculator</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white rounded-lg p-6 shadow-sm">
                      <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center mb-4">
                        <span className="text-2xl font-bold text-pink-600">1</span>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Choose Calculation Method</h3>
                      <p className="text-gray-600 text-sm">
                        Select your preferred method: Last Menstrual Period (most common), 
                        Conception Date (if known), or Ultrasound Dating (most accurate).
                      </p>
                    </div>
                    
                    <div className="bg-white rounded-lg p-6 shadow-sm">
                      <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                        <span className="text-2xl font-bold text-purple-600">2</span>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Enter Your Information</h3>
                      <p className="text-gray-600 text-sm">
                        Input the required dates and information based on your chosen method. 
                        For LMP, also specify your average cycle length for better accuracy.
                      </p>
                    </div>
                    
                    <div className="bg-white rounded-lg p-6 shadow-sm">
                      <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
                        <span className="text-2xl font-bold text-indigo-600">3</span>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Get Your Results</h3>
                      <p className="text-gray-600 text-sm">
                        View your estimated due date, current pregnancy week, trimester, 
                        and important milestones to track your pregnancy journey.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Understanding Due Dates */}
                <div className="bg-white rounded-2xl shadow-lg p-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-8">Understanding Pregnancy Due Date Calculations</h2>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-4">How Due Dates are Calculated</h3>
                      <p className="text-gray-600 mb-6 leading-relaxed">
                        Pregnancy due dates are calculated based on a standard 40-week (280-day) pregnancy duration from the first day of your 
                        last menstrual period (LMP). This method, known as Naegele's Rule, is the most widely used approach in obstetrics. 
                        The calculation assumes a 28-day menstrual cycle with ovulation occurring on day 14.
                      </p>
                      
                      <h3 className="text-xl font-semibold text-gray-900 mb-4">Calculation Methods Explained</h3>
                      <div className="space-y-3">
                        <div className="bg-pink-50 rounded-lg p-4">
                          <div className="font-medium mb-2">Last Menstrual Period (LMP) Method</div>
                          <div className="text-sm text-gray-600">
                            Adds 280 days (40 weeks) to the first day of your last period. 
                            Most common method used by healthcare providers worldwide.
                          </div>
                        </div>
                        <div className="bg-purple-50 rounded-lg p-4">
                          <div className="font-medium mb-2">Conception Date Method</div>
                          <div className="text-sm text-gray-600">
                            Adds 266 days (38 weeks) to the known or estimated conception date. 
                            More accurate if you know the exact fertilization date.
                          </div>
                        </div>
                        <div className="bg-indigo-50 rounded-lg p-4">
                          <div className="font-medium mb-2">Ultrasound Dating Method</div>
                          <div className="text-sm text-gray-600">
                            Uses fetal measurements from ultrasound scans. Most accurate, 
                            especially when performed in the first trimester.
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-4">Pregnancy Trimesters Breakdown</h3>
                      <div className="space-y-3 mb-6">
                        <div className="flex items-center p-4 bg-pink-50 rounded-lg">
                          <div className="w-4 h-4 bg-pink-500 rounded-full mr-3"></div>
                          <div>
                            <div className="font-medium">First Trimester (Weeks 1-13)</div>
                            <div className="text-sm text-gray-600">
                              Critical organ development, neural tube formation, morning sickness, fatigue
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center p-4 bg-purple-50 rounded-lg">
                          <div className="w-4 h-4 bg-purple-500 rounded-full mr-3"></div>
                          <div>
                            <div className="font-medium">Second Trimester (Weeks 14-27)</div>
                            <div className="text-sm text-gray-600">
                              "Golden period" - energy returns, baby movement felt, anatomy scan
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center p-4 bg-indigo-50 rounded-lg">
                          <div className="w-4 h-4 bg-indigo-500 rounded-full mr-3"></div>
                          <div>
                            <div className="font-medium">Third Trimester (Weeks 28-40)</div>
                            <div className="text-sm text-gray-600">
                              Rapid growth, lung maturation, preparing for birth, frequent monitoring
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Critical Pregnancy Milestones</h3>
                      <ul className="text-gray-600 space-y-2 text-sm">
                        <li>• <strong>12 weeks:</strong> End of first trimester, reduced miscarriage risk</li>
                        <li>• <strong>18-22 weeks:</strong> Anatomy scan, gender determination</li>
                        <li>• <strong>23-24 weeks:</strong> Viability threshold (survival outside womb)</li>
                        <li>• <strong>28 weeks:</strong> Third trimester begins, rapid brain development</li>
                        <li>• <strong>37 weeks:</strong> Full-term pregnancy begins</li>
                        <li>• <strong>39-40 weeks:</strong> Optimal delivery window</li>
                        <li>• <strong>42+ weeks:</strong> Post-term pregnancy, may require induction</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Benefits and Use Cases */}
                <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-2xl p-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-8">Benefits of Using a Pregnancy Due Date Calculator</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="bg-white rounded-lg p-6 shadow-sm">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                        <Calendar className="w-6 h-6 text-blue-600" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Planning & Preparation</h3>
                      <ul className="text-gray-600 text-sm space-y-1">
                        <li>• Schedule prenatal appointments</li>
                        <li>• Plan maternity leave timing</li>
                        <li>• Organize baby shower dates</li>
                        <li>• Prepare nursery and baby items</li>
                      </ul>
                    </div>
                    
                    <div className="bg-white rounded-lg p-6 shadow-sm">
                      <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                        <Baby className="w-6 h-6 text-green-600" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Health Monitoring</h3>
                      <ul className="text-gray-600 text-sm space-y-1">
                        <li>• Track fetal development stages</li>
                        <li>• Monitor pregnancy progression</li>
                        <li>• Schedule important tests</li>
                        <li>• Identify potential complications</li>
                      </ul>
                    </div>
                    
                    <div className="bg-white rounded-lg p-6 shadow-sm">
                      <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                        <Calculator className="w-6 h-6 text-purple-600" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Accurate Tracking</h3>
                      <ul className="text-gray-600 text-sm space-y-1">
                        <li>• Determine gestational age</li>
                        <li>• Calculate trimester periods</li>
                        <li>• Estimate conception date</li>
                        <li>• Track pregnancy timeline</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Common Questions and Accuracy */}
                <div className="bg-white rounded-2xl shadow-lg p-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-8">Due Date Accuracy and Common Questions</h2>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-4">How Accurate are Due Date Calculations?</h3>
                      <div className="space-y-4">
                        <div className="bg-red-50 rounded-lg p-4 border-l-4 border-red-400">
                          <h4 className="font-medium text-red-900 mb-2">Reality Check</h4>
                          <p className="text-red-800 text-sm">
                            Only about 5% of babies are born exactly on their due date. Most births occur within 
                            2 weeks before or after the estimated due date.
                          </p>
                        </div>
                        
                        <div className="space-y-3">
                          <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                            <span className="font-medium">LMP Method Accuracy</span>
                            <span className="text-green-600 font-semibold">±1-2 weeks</span>
                          </div>
                          <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                            <span className="font-medium">Ultrasound Dating (6-11 weeks)</span>
                            <span className="text-green-600 font-semibold">±3-5 days</span>
                          </div>
                          <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                            <span className="font-medium">Ultrasound Dating (12-22 weeks)</span>
                            <span className="text-yellow-600 font-semibold">±1-2 weeks</span>
                          </div>
                        </div>
                      </div>
                      
                      <h3 className="text-xl font-semibold text-gray-900 mb-4 mt-6">Factors Affecting Due Date Accuracy</h3>
                      <ul className="text-gray-600 space-y-2 text-sm">
                        <li>• Irregular menstrual cycles</li>
                        <li>• Uncertainty about last menstrual period date</li>
                        <li>• Conception while breastfeeding</li>
                        <li>• Polycystic ovary syndrome (PCOS)</li>
                        <li>• Recent use of birth control pills</li>
                        <li>• Multiple pregnancies (twins, triplets)</li>
                      </ul>
                    </div>
                    
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-4">Frequently Asked Questions</h3>
                      <div className="space-y-4">
                        <div className="bg-blue-50 rounded-lg p-4">
                          <h4 className="font-medium text-blue-900 mb-2">When is the best time to calculate due date?</h4>
                          <p className="text-blue-800 text-sm">
                            The earlier in pregnancy, the more accurate the calculation. First-trimester ultrasounds 
                            provide the most precise dating.
                          </p>
                        </div>
                        
                        <div className="bg-green-50 rounded-lg p-4">
                          <h4 className="font-medium text-green-900 mb-2">Can due dates change during pregnancy?</h4>
                          <p className="text-green-800 text-sm">
                            Yes, due dates may be adjusted based on ultrasound measurements, especially if there's 
                            a significant discrepancy with initial calculations.
                          </p>
                        </div>
                        
                        <div className="bg-purple-50 rounded-lg p-4">
                          <h4 className="font-medium text-purple-900 mb-2">What if I don't remember my last period?</h4>
                          <p className="text-purple-800 text-sm">
                            Use the conception date method if you know when you conceived, or rely on early 
                            ultrasound dating for the most accurate estimate.
                          </p>
                        </div>
                        
                        <div className="bg-orange-50 rounded-lg p-4">
                          <h4 className="font-medium text-orange-900 mb-2">Are there different calculations for IVF pregnancies?</h4>
                          <p className="text-orange-800 text-sm">
                            IVF pregnancies use the embryo transfer date for more precise calculations, as the 
                            conception date is exactly known.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Important Notes and Medical Disclaimer */}
                <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-2xl p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Important Medical Information</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">When to Consult Your Healthcare Provider</h3>
                      <ul className="text-gray-600 space-y-2 text-sm">
                        <li>• Confirm pregnancy and validate due date calculations</li>
                        <li>• Schedule comprehensive prenatal care plan</li>
                        <li>• Discuss any concerns about pregnancy progression</li>
                        <li>• Plan delivery options and birthing preferences</li>
                        <li>• Address complications or risk factors</li>
                        <li>• Monitor fetal growth and development</li>
                        <li>• Prepare for postpartum care and recovery</li>
                      </ul>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Signs Requiring Immediate Medical Attention</h3>
                      <ul className="text-red-600 space-y-2 text-sm">
                        <li>• Severe abdominal pain or cramping</li>
                        <li>• Heavy bleeding or unusual discharge</li>
                        <li>• Severe morning sickness preventing eating/drinking</li>
                        <li>• High fever or persistent headaches</li>
                        <li>• Decreased fetal movement after 28 weeks</li>
                        <li>• Signs of preterm labor before 37 weeks</li>
                        <li>• Sudden swelling of face, hands, or feet</li>
                      </ul>
                    </div>
                  </div>
                  
                  <div className="mt-8 p-6 bg-white rounded-lg border-l-4 border-pink-500">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Medical Disclaimer</h3>
                    <p className="text-sm text-gray-600 mb-3">
                      <strong>Important:</strong> This pregnancy due date calculator is designed for educational and informational purposes only. 
                      The results provide estimates based on standard pregnancy calculations and should not replace professional medical advice, 
                      diagnosis, or treatment.
                    </p>
                    <p className="text-sm text-gray-600">
                      Every pregnancy is unique, and individual circumstances may affect the accuracy of these calculations. 
                      Always consult with qualified healthcare providers for personalized medical guidance, accurate due date determination, 
                      and comprehensive prenatal care throughout your pregnancy journey.
                    </p>
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

export default PregnancyDueDateCalculator;