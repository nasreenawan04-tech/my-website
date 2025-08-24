import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calculator, Calendar } from 'lucide-react';

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
}

const OvulationCalculator = () => {
  const [lastPeriodDate, setLastPeriodDate] = useState('');
  const [cycleLength, setCycleLength] = useState('28');
  const [periodLength, setPeriodLength] = useState('5');
  const [lutealLength, setLutealLength] = useState('14');
  const [calculationMethod, setCalculationMethod] = useState('calendar');
  const [age, setAge] = useState('');
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
      lutealPhase: lutealLengthNum
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
    setResult(null);
  };

  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  return (
    <>
      <Helmet>
        <title>Ovulation Calculator - Track Fertile Days & Ovulation Date | DapsiWow</title>
        <meta name="description" content="Calculate your ovulation date, fertile window, and menstrual cycle phases. Track your fertility and plan conception with our accurate ovulation calculator." />
        <meta name="keywords" content="ovulation calculator, fertile days, menstrual cycle, fertility tracker, conception calculator, ovulation predictor" />
        <meta property="og:title" content="Ovulation Calculator - Track Fertile Days & Ovulation Date | DapsiWow" />
        <meta property="og:description" content="Professional ovulation calculator to track fertile days and optimize conception timing based on menstrual cycle data." />
        <meta property="og:type" content="website" />
        <link rel="canonical" href="/tools/ovulation-calculator" />
      </Helmet>

      <div className="min-h-screen flex flex-col" data-testid="page-ovulation-calculator">
        <Header />
        
        <main className="flex-1 bg-neutral-50">
          {/* Hero Section */}
          <section className="text-white py-16" style={{ background: 'linear-gradient(135deg, #f43f5e 0%, #e11d48 100%)' }}>
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <div className="w-20 h-20 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Calendar className="w-10 h-10" />
              </div>
              <h1 className="text-4xl sm:text-5xl font-bold mb-6" data-testid="text-page-title">
                Ovulation Calculator
              </h1>
              <p className="text-xl text-blue-100 max-w-2xl mx-auto">
                Calculate your ovulation date, fertile window, and track your menstrual cycle for optimal conception timing
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
                      <h2 className="text-2xl font-semibold text-gray-900 mb-8">Cycle Information</h2>
                      
                      {/* Last Period Date */}
                      <div className="space-y-3">
                        <Label htmlFor="last-period" className="text-sm font-medium text-gray-700">
                          First Day of Last Period *
                        </Label>
                        <Input
                          id="last-period"
                          type="date"
                          value={lastPeriodDate}
                          onChange={(e) => setLastPeriodDate(e.target.value)}
                          className="h-12 text-base border-gray-200 rounded-lg"
                          max={getTodayDate()}
                          data-testid="input-last-period"
                        />
                        <p className="text-xs text-gray-500">
                          The date your last menstrual period started
                        </p>
                      </div>

                      {/* Cycle Length */}
                      <div className="space-y-3">
                        <Label htmlFor="cycle-length" className="text-sm font-medium text-gray-700">
                          Average Cycle Length (days) *
                        </Label>
                        <Select value={cycleLength} onValueChange={setCycleLength}>
                          <SelectTrigger className="h-12 border-gray-200 rounded-lg" data-testid="select-cycle-length">
                            <SelectValue placeholder="Select cycle length" />
                          </SelectTrigger>
                          <SelectContent>
                            {Array.from({ length: 20 }, (_, i) => i + 21).map(days => (
                              <SelectItem key={days} value={days.toString()}>
                                {days} days {days === 28 ? '(Average)' : ''}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <p className="text-xs text-gray-500">
                          Time from first day of period to first day of next period
                        </p>
                      </div>

                      {/* Period Length */}
                      <div className="space-y-3">
                        <Label htmlFor="period-length" className="text-sm font-medium text-gray-700">
                          Period Length (days) *
                        </Label>
                        <Select value={periodLength} onValueChange={setPeriodLength}>
                          <SelectTrigger className="h-12 border-gray-200 rounded-lg" data-testid="select-period-length">
                            <SelectValue placeholder="Select period length" />
                          </SelectTrigger>
                          <SelectContent>
                            {Array.from({ length: 8 }, (_, i) => i + 3).map(days => (
                              <SelectItem key={days} value={days.toString()}>
                                {days} days {days === 5 ? '(Average)' : ''}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <p className="text-xs text-gray-500">
                          Number of days your period typically lasts
                        </p>
                      </div>

                      {/* Luteal Phase Length */}
                      <div className="space-y-3">
                        <Label htmlFor="luteal-length" className="text-sm font-medium text-gray-700">
                          Luteal Phase Length (days) <span className="text-gray-400 font-normal">- Optional</span>
                        </Label>
                        <Select value={lutealLength} onValueChange={setLutealLength}>
                          <SelectTrigger className="h-12 border-gray-200 rounded-lg" data-testid="select-luteal-length">
                            <SelectValue placeholder="Select luteal phase length" />
                          </SelectTrigger>
                          <SelectContent>
                            {Array.from({ length: 8 }, (_, i) => i + 10).map(days => (
                              <SelectItem key={days} value={days.toString()}>
                                {days} days {days === 14 ? '(Average)' : ''}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <p className="text-xs text-gray-500">
                          Time from ovulation to next period (typically 12-16 days)
                        </p>
                      </div>

                      {/* Calculation Method */}
                      <div className="space-y-3">
                        <Label className="text-sm font-medium text-gray-700">
                          Calculation Method <span className="text-gray-400 font-normal">- Optional</span>
                        </Label>
                        <Select value={calculationMethod} onValueChange={setCalculationMethod}>
                          <SelectTrigger className="h-12 border-gray-200 rounded-lg" data-testid="select-method">
                            <SelectValue placeholder="Select calculation method" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="calendar">Calendar Method (Standard)</SelectItem>
                            <SelectItem value="temperature">BBT Method (Advanced)</SelectItem>
                            <SelectItem value="symptoms">Symptom Tracking</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Age */}
                      <div className="space-y-3">
                        <Label htmlFor="age" className="text-sm font-medium text-gray-700">
                          Age (years) <span className="text-gray-400 font-normal">- Optional</span>
                        </Label>
                        <Input
                          id="age"
                          type="number"
                          value={age}
                          onChange={(e) => setAge(e.target.value)}
                          className="h-12 text-base border-gray-200 rounded-lg"
                          placeholder="28"
                          min="15"
                          max="50"
                          data-testid="input-age"
                        />
                        <p className="text-xs text-gray-500">
                          Age affects fertility and ovulation patterns
                        </p>
                      </div>

                      {/* Information Box */}
                      <div className="bg-pink-50 rounded-lg p-4 mt-6">
                        <h3 className="font-semibold text-pink-900 mb-2">Tracking Tips</h3>
                        <ul className="text-sm text-pink-700 space-y-1">
                          <li>• Track your cycles for 3-6 months for accuracy</li>
                          <li>• Note any cycle irregularities</li>
                          <li>• Consider using ovulation test strips</li>
                          <li>• Monitor cervical mucus changes</li>
                        </ul>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-4 pt-6">
                        <Button
                          onClick={calculateOvulation}
                          className="flex-1 h-12 text-white font-medium rounded-lg"
                          style={{ backgroundColor: '#f43f5e' }}
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#e11d48'}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#f43f5e'}
                          data-testid="button-calculate"
                        >
                          <Calculator className="w-4 h-4 mr-2" />
                          Calculate Ovulation
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
                      <h2 className="text-2xl font-semibold text-gray-900 mb-8">Ovulation Prediction</h2>
                      
                      {result ? (
                        <div className="space-y-4" data-testid="ovulation-results">
                          {/* Ovulation Date */}
                          <div className="bg-pink-50 rounded-lg p-4 border-l-4 border-pink-500">
                            <div className="flex justify-between items-center mb-2">
                              <span className="font-semibold text-gray-700">Predicted Ovulation</span>
                            </div>
                            <p className="text-lg font-bold text-pink-600" data-testid="text-ovulation-date">
                              {result.ovulationDate}
                            </p>
                          </div>

                          {/* Fertile Window */}
                          <div className="bg-green-50 rounded-lg p-4 border-l-4 border-green-500">
                            <h3 className="font-semibold text-gray-900 mb-2">Fertile Window</h3>
                            <div className="space-y-1 text-sm">
                              <div className="flex justify-between">
                                <span className="text-gray-600">Start</span>
                                <span className="font-medium" data-testid="text-fertile-start">
                                  {result.fertileWindow.start}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">End</span>
                                <span className="font-medium" data-testid="text-fertile-end">
                                  {result.fertileWindow.end}
                                </span>
                              </div>
                            </div>
                            <p className="text-xs text-gray-500 mt-2">
                              Best time for conception attempts
                            </p>
                          </div>

                          {/* Next Period */}
                          <div className="bg-blue-50 rounded-lg p-4">
                            <div className="flex justify-between items-center">
                              <span className="text-gray-600">Next Period Expected</span>
                              <span className="font-medium text-blue-600" data-testid="text-next-period">
                                {result.nextPeriod}
                              </span>
                            </div>
                          </div>

                          {/* Conception Chances */}
                          <div className="bg-purple-50 rounded-lg p-4">
                            <h3 className="font-semibold text-gray-900 mb-2">Conception Probability</h3>
                            <div className="space-y-2 text-sm">
                              <div>
                                <span className="text-gray-600">High Chance Days:</span>
                                <p className="font-medium text-purple-600">
                                  {result.conception.highChance.join(', ')}
                                </p>
                              </div>
                              <div>
                                <span className="text-gray-600">Moderate Chance Days:</span>
                                <p className="font-medium text-purple-500">
                                  {result.conception.moderateChance.join(', ')}
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Cycle Phases */}
                          <div className="bg-orange-50 rounded-lg p-4">
                            <h3 className="font-semibold text-gray-900 mb-2">Cycle Phases</h3>
                            <div className="space-y-2 text-xs">
                              <div className="flex justify-between">
                                <span className="text-gray-600">Menstrual</span>
                                <span className="font-medium">
                                  {result.cyclePhases.menstrual.start} - {result.cyclePhases.menstrual.end}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Follicular</span>
                                <span className="font-medium">
                                  {result.cyclePhases.follicular.start} - {result.cyclePhases.follicular.end}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Ovulation</span>
                                <span className="font-medium">
                                  {result.cyclePhases.ovulation.start} - {result.cyclePhases.ovulation.end}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Luteal</span>
                                <span className="font-medium">
                                  {result.cyclePhases.luteal.start} - {result.cyclePhases.luteal.end}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Fertility Tips */}
                          <div className="bg-green-50 rounded-lg p-4">
                            <h3 className="font-semibold text-gray-900 mb-2">Fertility Tips</h3>
                            <ul className="text-sm text-gray-700 space-y-1">
                              <li>• Have intercourse every other day during fertile window</li>
                              <li>• Track ovulation symptoms (cervical mucus, mild pain)</li>
                              <li>• Maintain healthy lifestyle (diet, exercise, stress management)</li>
                              <li>• Consider prenatal vitamins with folic acid</li>
                            </ul>
                          </div>

                          {/* Disclaimer */}
                          <div className="bg-yellow-50 rounded-lg p-4">
                            <p className="text-sm text-yellow-700">
                              <strong>Disclaimer:</strong> This calculator provides estimates based on average cycles. 
                              Individual cycles may vary. Consult healthcare providers for personalized fertility advice.
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-8" data-testid="no-results">
                          <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                          <p className="text-gray-500">Enter your cycle information to predict ovulation</p>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Educational Content */}
              <div className="mt-12 space-y-8">
                {/* Understanding Ovulation */}
                <div className="bg-white rounded-2xl shadow-lg p-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-8">Understanding Ovulation</h2>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-4">What is Ovulation?</h3>
                      <p className="text-gray-600 mb-6 leading-relaxed">
                        Ovulation is the release of a mature egg from the ovary. It typically occurs around 
                        day 14 of a 28-day cycle, but can vary between individuals and cycles. The egg 
                        survives for 12-24 hours after release.
                      </p>
                      
                      <h3 className="text-xl font-semibold text-gray-900 mb-4">Signs of Ovulation</h3>
                      <ul className="text-gray-600 space-y-2 text-sm">
                        <li>• Changes in cervical mucus (clear, stretchy)</li>
                        <li>• Slight increase in basal body temperature</li>
                        <li>• Mild pelvic or abdominal pain (mittelschmerz)</li>
                        <li>• Breast tenderness</li>
                        <li>• Increased sex drive</li>
                        <li>• Light spotting</li>
                      </ul>
                    </div>
                    
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-4">Fertile Window</h3>
                      <p className="text-gray-600 mb-4 leading-relaxed">
                        The fertile window includes the 5 days before ovulation and the day of ovulation. 
                        Sperm can survive in the female reproductive tract for up to 5 days.
                      </p>
                      
                      <div className="space-y-3">
                        <div className="flex items-center p-3 bg-red-50 rounded-lg">
                          <div className="w-4 h-4 bg-red-500 rounded-full mr-3"></div>
                          <div>
                            <div className="font-medium">Highest Fertility</div>
                            <div className="text-sm text-gray-600">1-2 days before ovulation</div>
                          </div>
                        </div>
                        
                        <div className="flex items-center p-3 bg-orange-50 rounded-lg">
                          <div className="w-4 h-4 bg-orange-500 rounded-full mr-3"></div>
                          <div>
                            <div className="font-medium">High Fertility</div>
                            <div className="text-sm text-gray-600">3-5 days before ovulation</div>
                          </div>
                        </div>
                        
                        <div className="flex items-center p-3 bg-yellow-50 rounded-lg">
                          <div className="w-4 h-4 bg-yellow-500 rounded-full mr-3"></div>
                          <div>
                            <div className="font-medium">Moderate Fertility</div>
                            <div className="text-sm text-gray-600">Day of ovulation</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Fertility and Conception Tips */}
                <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-2xl p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Fertility and Conception Tips</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Optimizing Fertility</h3>
                      <ul className="text-gray-600 space-y-2 text-sm">
                        <li>• Maintain healthy weight (BMI 18.5-24.9)</li>
                        <li>• Take prenatal vitamins with folic acid</li>
                        <li>• Eat a balanced diet rich in nutrients</li>
                        <li>• Exercise regularly but avoid excessive training</li>
                        <li>• Limit caffeine and alcohol consumption</li>
                        <li>• Don't smoke and avoid secondhand smoke</li>
                        <li>• Manage stress through relaxation techniques</li>
                        <li>• Get adequate sleep (7-9 hours nightly)</li>
                      </ul>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">When to See a Doctor</h3>
                      <ul className="text-gray-600 space-y-2 text-sm">
                        <li>• Trying to conceive for over 12 months (under 35)</li>
                        <li>• Trying to conceive for over 6 months (over 35)</li>
                        <li>• Irregular menstrual cycles</li>
                        <li>• Very painful periods</li>
                        <li>• History of pelvic inflammatory disease</li>
                        <li>• Known fertility issues in partner</li>
                        <li>• Chronic health conditions</li>
                        <li>• Previous miscarriages</li>
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

export default OvulationCalculator;