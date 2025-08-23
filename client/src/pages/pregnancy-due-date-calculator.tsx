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
                {/* Understanding Due Dates */}
                <div className="bg-white rounded-2xl shadow-lg p-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-8">Understanding Pregnancy Due Dates</h2>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-4">How Due Dates are Calculated</h3>
                      <p className="text-gray-600 mb-6 leading-relaxed">
                        Due dates are calculated based on a 40-week pregnancy from the first day of your last menstrual period (LMP). 
                        This method, known as Naegele's Rule, adds 280 days (40 weeks) to the LMP date. 
                        Only about 5% of babies are born exactly on their due date, with most births occurring within two weeks before or after.
                      </p>
                      
                      <h3 className="text-xl font-semibold text-gray-900 mb-4">Calculation Methods</h3>
                      <div className="space-y-3">
                        <div className="bg-pink-50 rounded-lg p-3">
                          <div className="font-medium">Last Menstrual Period (LMP)</div>
                          <div className="text-sm text-gray-600">Most common method, adds 280 days to LMP</div>
                        </div>
                        <div className="bg-purple-50 rounded-lg p-3">
                          <div className="font-medium">Conception Date</div>
                          <div className="text-sm text-gray-600">Adds 266 days to known conception date</div>
                        </div>
                        <div className="bg-indigo-50 rounded-lg p-3">
                          <div className="font-medium">Ultrasound Dating</div>
                          <div className="text-sm text-gray-600">Most accurate, especially in early pregnancy</div>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-4">Pregnancy Trimesters</h3>
                      <div className="space-y-3">
                        <div className="flex items-center p-3 bg-pink-50 rounded-lg">
                          <div className="w-4 h-4 bg-pink-500 rounded-full mr-3"></div>
                          <div>
                            <div className="font-medium">First Trimester (Weeks 1-13)</div>
                            <div className="text-sm text-gray-600">Major organ development, morning sickness common</div>
                          </div>
                        </div>
                        
                        <div className="flex items-center p-3 bg-purple-50 rounded-lg">
                          <div className="w-4 h-4 bg-purple-500 rounded-full mr-3"></div>
                          <div>
                            <div className="font-medium">Second Trimester (Weeks 14-27)</div>
                            <div className="text-sm text-gray-600">Often called the "golden period," energy returns</div>
                          </div>
                        </div>
                        
                        <div className="flex items-center p-3 bg-indigo-50 rounded-lg">
                          <div className="w-4 h-4 bg-indigo-500 rounded-full mr-3"></div>
                          <div>
                            <div className="font-medium">Third Trimester (Weeks 28-40)</div>
                            <div className="text-sm text-gray-600">Final growth phase, preparing for birth</div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-3">Important Milestones</h3>
                        <ul className="text-gray-600 space-y-1 text-sm">
                          <li>• 23 weeks: Viability (survival outside womb possible)</li>
                          <li>• 37 weeks: Full term begins</li>
                          <li>• 39-40 weeks: Optimal delivery time</li>
                          <li>• 42 weeks: Post-term pregnancy</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Important Notes */}
                <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-2xl p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Important Information</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Due Date Accuracy</h3>
                      <ul className="text-gray-600 space-y-2 text-sm">
                        <li>• Only 5% of babies are born on their exact due date</li>
                        <li>• Most babies are born within 2 weeks of the due date</li>
                        <li>• First pregnancies often go beyond the due date</li>
                        <li>• Ultrasound dating is most accurate in early pregnancy</li>
                        <li>• Due dates are estimates, not guarantees</li>
                      </ul>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">When to Consult Healthcare Provider</h3>
                      <ul className="text-gray-600 space-y-2 text-sm">
                        <li>• Confirm pregnancy and due date calculation</li>
                        <li>• Schedule regular prenatal appointments</li>
                        <li>• Discuss any concerns about pregnancy progress</li>
                        <li>• Plan for delivery and postpartum care</li>
                        <li>• Address any unusual symptoms or complications</li>
                      </ul>
                    </div>
                  </div>
                  <div className="mt-6 p-4 bg-white rounded-lg border-l-4 border-pink-500">
                    <p className="text-sm text-gray-600">
                      <strong>Disclaimer:</strong> This calculator provides estimates for educational purposes only. 
                      Always consult with your healthcare provider for professional medical advice and accurate due date determination.
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