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
import { Calculator, Baby, Calendar } from 'lucide-react';

interface PregnancyResult {
  dueDate: Date;
  currentWeek: number;
  currentDay: number;
  trimester: number;
  daysRemaining: number;
  conceptionDate: Date;
  implantationDate: Date;
  milestones: {
    firstTrimesterEnd: Date;
    secondTrimesterEnd: Date;
    fullTerm: Date;
  };
}

const PregnancyDueDateCalculator = () => {
  const [calculationMethod, setCalculationMethod] = useState('lmp');
  const [lmpDate, setLmpDate] = useState('');
  const [conceptionDate, setConceptionDate] = useState('');
  const [cycleLength, setCycleLength] = useState('28');
  const [result, setResult] = useState<PregnancyResult | null>(null);

  const calculateDueDate = () => {
    let startDate: Date;
    
    if (calculationMethod === 'lmp' && lmpDate) {
      startDate = new Date(lmpDate);
      // Add 280 days (40 weeks) to LMP
      const dueDate = new Date(startDate);
      dueDate.setDate(dueDate.getDate() + 280);
      
      // Calculate conception date (typically 14 days after LMP for 28-day cycle)
      const cycleLengthNum = parseInt(cycleLength) || 28;
      const ovulationDay = Math.round(cycleLengthNum / 2);
      const conceptionDateCalc = new Date(startDate);
      conceptionDateCalc.setDate(conceptionDateCalc.getDate() + ovulationDay);
      
      calculateResults(dueDate, conceptionDateCalc, startDate);
    } else if (calculationMethod === 'conception' && conceptionDate) {
      startDate = new Date(conceptionDate);
      // Add 266 days (38 weeks) to conception date
      const dueDate = new Date(startDate);
      dueDate.setDate(dueDate.getDate() + 266);
      
      // Calculate LMP (14 days before conception for average cycle)
      const lmpDateCalc = new Date(startDate);
      lmpDateCalc.setDate(lmpDateCalc.getDate() - 14);
      
      calculateResults(dueDate, startDate, lmpDateCalc);
    }
  };

  const calculateResults = (dueDate: Date, conception: Date, lmp: Date) => {
    const today = new Date();
    const timeDiff = today.getTime() - lmp.getTime();
    const daysSinceLMP = Math.floor(timeDiff / (1000 * 3600 * 24));
    
    // Calculate current week and day
    const currentWeek = Math.floor(daysSinceLMP / 7);
    const currentDay = daysSinceLMP % 7;
    
    // Determine trimester
    let trimester = 1;
    if (currentWeek >= 13) trimester = 2;
    if (currentWeek >= 27) trimester = 3;
    
    // Days remaining until due date
    const daysRemaining = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 3600 * 24));
    
    // Calculate implantation date (6-12 days after conception, we'll use 9)
    const implantationDate = new Date(conception);
    implantationDate.setDate(implantationDate.getDate() + 9);
    
    // Calculate milestones
    const firstTrimesterEnd = new Date(lmp);
    firstTrimesterEnd.setDate(firstTrimesterEnd.getDate() + (13 * 7));
    
    const secondTrimesterEnd = new Date(lmp);
    secondTrimesterEnd.setDate(secondTrimesterEnd.getDate() + (27 * 7));
    
    const fullTerm = new Date(lmp);
    fullTerm.setDate(fullTerm.getDate() + (37 * 7));

    setResult({
      dueDate,
      currentWeek: Math.max(0, currentWeek),
      currentDay: Math.max(0, currentDay),
      trimester: Math.max(1, Math.min(3, trimester)),
      daysRemaining: Math.max(0, daysRemaining),
      conceptionDate: conception,
      implantationDate,
      milestones: {
        firstTrimesterEnd,
        secondTrimesterEnd,
        fullTerm
      }
    });
  };

  const resetCalculator = () => {
    setCalculationMethod('lmp');
    setLmpDate('');
    setConceptionDate('');
    setCycleLength('28');
    setResult(null);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getTrimesterInfo = (trimester: number) => {
    const info = {
      1: {
        name: "First Trimester",
        weeks: "1-12 weeks",
        description: "Organ development and early growth",
        color: "text-blue-600"
      },
      2: {
        name: "Second Trimester",
        weeks: "13-26 weeks",
        description: "Rapid growth and movement begins",
        color: "text-green-600"
      },
      3: {
        name: "Third Trimester", 
        weeks: "27-40 weeks",
        description: "Final development and preparation for birth",
        color: "text-purple-600"
      }
    };
    return info[trimester as keyof typeof info] || info[1];
  };

  return (
    <>
      <Helmet>
        <title>Pregnancy Due Date Calculator - Calculate Baby Due Date | DapsiWow</title>
        <meta name="description" content="Calculate your baby's due date based on last menstrual period or conception date. Get pregnancy milestones and trimester information." />
        <meta name="keywords" content="pregnancy due date calculator, baby due date, pregnancy calculator, gestational age, pregnancy milestones, trimester calculator" />
        <meta property="og:title" content="Pregnancy Due Date Calculator - Calculate Baby Due Date | DapsiWow" />
        <meta property="og:description" content="Calculate your baby's due date and track pregnancy milestones with our accurate pregnancy calculator." />
        <meta property="og:type" content="website" />
        <link rel="canonical" href="/tools/pregnancy-due-date-calculator" />
      </Helmet>

      <div className="min-h-screen flex flex-col" data-testid="page-pregnancy-calculator">
        <Header />
        
        <main className="flex-1 bg-neutral-50">
          {/* Hero Section */}
          <section className="text-white py-16" style={{ background: 'linear-gradient(135deg, #f43f5e 0%, #e11d48 100%)' }}>
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <div className="w-20 h-20 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <i className="fas fa-baby text-3xl"></i>
              </div>
              <h1 className="text-4xl sm:text-5xl font-bold mb-6" data-testid="text-page-title">
                Pregnancy Due Date Calculator
              </h1>
              <p className="text-xl text-red-100 max-w-2xl mx-auto">
                Calculate your baby's due date and track important pregnancy milestones throughout your journey
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
                      <h2 className="text-2xl font-semibold text-gray-900 mb-8">Calculation Method</h2>
                      
                      {/* Calculation Method */}
                      <div className="space-y-3">
                        <Label>Choose Calculation Method</Label>
                        <RadioGroup 
                          value={calculationMethod} 
                          onValueChange={setCalculationMethod}
                          className="space-y-3"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="lmp" id="lmp" data-testid="radio-lmp" />
                            <Label htmlFor="lmp" className="font-medium">Last Menstrual Period (LMP)</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="conception" id="conception" data-testid="radio-conception" />
                            <Label htmlFor="conception" className="font-medium">Conception/Ovulation Date</Label>
                          </div>
                        </RadioGroup>
                      </div>

                      {calculationMethod === 'lmp' ? (
                        <>
                          {/* LMP Date */}
                          <div className="space-y-3">
                            <Label htmlFor="lmp-date" className="text-sm font-medium text-gray-700">
                              First Day of Last Menstrual Period *
                            </Label>
                            <Input
                              id="lmp-date"
                              type="date"
                              value={lmpDate}
                              onChange={(e) => setLmpDate(e.target.value)}
                              className="h-12 text-base border-gray-200 rounded-lg"
                              data-testid="input-lmp-date"
                            />
                            <p className="text-xs text-gray-500">
                              Enter the first day of your last menstrual period
                            </p>
                          </div>

                          {/* Cycle Length */}
                          <div className="space-y-3">
                            <Label htmlFor="cycle-length" className="text-sm font-medium text-gray-700">
                              Average Cycle Length (days)
                            </Label>
                            <Select value={cycleLength} onValueChange={setCycleLength}>
                              <SelectTrigger className="h-12 border-gray-200 rounded-lg" data-testid="select-cycle">
                                <SelectValue placeholder="Select cycle length" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="21">21 days</SelectItem>
                                <SelectItem value="22">22 days</SelectItem>
                                <SelectItem value="23">23 days</SelectItem>
                                <SelectItem value="24">24 days</SelectItem>
                                <SelectItem value="25">25 days</SelectItem>
                                <SelectItem value="26">26 days</SelectItem>
                                <SelectItem value="27">27 days</SelectItem>
                                <SelectItem value="28">28 days (average)</SelectItem>
                                <SelectItem value="29">29 days</SelectItem>
                                <SelectItem value="30">30 days</SelectItem>
                                <SelectItem value="31">31 days</SelectItem>
                                <SelectItem value="32">32 days</SelectItem>
                                <SelectItem value="33">33 days</SelectItem>
                                <SelectItem value="34">34 days</SelectItem>
                                <SelectItem value="35">35 days</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </>
                      ) : (
                        <>
                          {/* Conception Date */}
                          <div className="space-y-3">
                            <Label htmlFor="conception-date" className="text-sm font-medium text-gray-700">
                              Conception/Ovulation Date *
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
                              Enter the date of conception or ovulation if known
                            </p>
                          </div>
                        </>
                      )}

                      {/* Action Buttons */}
                      <div className="flex gap-4 pt-6">
                        <Button
                          onClick={calculateDueDate}
                          className="flex-1 h-12 text-white font-medium rounded-lg"
                          style={{ backgroundColor: '#f43f5e' }}
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#e11d48'}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#f43f5e'}
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
                      <h2 className="text-2xl font-semibold text-gray-900 mb-8">Pregnancy Information</h2>
                      
                      {result ? (
                        <div className="space-y-4" data-testid="pregnancy-results">
                          {/* Due Date */}
                          <div className="bg-white rounded-lg p-4 border-l-4 border-rose-500">
                            <div className="flex justify-between items-start">
                              <span className="font-semibold text-gray-700">Estimated Due Date</span>
                              <div className="text-right">
                                <div className="text-2xl font-bold text-rose-600" data-testid="text-due-date">
                                  {formatDate(result.dueDate)}
                                </div>
                                <div className="text-xs text-gray-500 mt-1">
                                  {result.daysRemaining} days remaining
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Current Progress */}
                          <div className="bg-white rounded-lg p-4">
                            <h3 className="font-semibold text-gray-900 mb-3">Current Progress</h3>
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span className="text-gray-600">Gestational Age</span>
                                <span className="font-medium" data-testid="text-gestational-age">
                                  {result.currentWeek} weeks, {result.currentDay} days
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Current Trimester</span>
                                <span className={`font-medium ${getTrimesterInfo(result.trimester).color}`} data-testid="text-trimester">
                                  {getTrimesterInfo(result.trimester).name}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Important Dates */}
                          <div className="bg-white rounded-lg p-4">
                            <h3 className="font-semibold text-gray-900 mb-3">Important Dates</h3>
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span className="text-gray-600">Conception Date</span>
                                <span className="font-medium" data-testid="text-conception">
                                  {result.conceptionDate.toLocaleDateString()}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Implantation Date</span>
                                <span className="font-medium" data-testid="text-implantation">
                                  {result.implantationDate.toLocaleDateString()}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Full Term (37 weeks)</span>
                                <span className="font-medium" data-testid="text-full-term">
                                  {result.milestones.fullTerm.toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Trimester Milestones */}
                          <div className="bg-gradient-to-r from-pink-50 to-rose-50 rounded-lg p-4">
                            <h3 className="font-semibold text-gray-900 mb-3">Trimester Milestones</h3>
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span className="text-blue-600">1st Trimester Ends</span>
                                <span className="font-medium">
                                  {result.milestones.firstTrimesterEnd.toLocaleDateString()}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-green-600">2nd Trimester Ends</span>
                                <span className="font-medium">
                                  {result.milestones.secondTrimesterEnd.toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Disclaimer */}
                          <div className="bg-yellow-50 rounded-lg p-4">
                            <p className="text-sm text-yellow-800">
                              <strong>Note:</strong> This is an estimate. Only about 5% of babies are born on their due date. 
                              Most babies are born within 2 weeks of the due date. Always consult with your healthcare provider.
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-8" data-testid="no-results">
                          <i className="fas fa-baby text-4xl text-gray-400 mb-4"></i>
                          <p className="text-gray-500">Enter your information to calculate due date and pregnancy milestones</p>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Educational Content */}
              <div className="mt-12 space-y-8">
                {/* Understanding Pregnancy Timing */}
                <div className="bg-white rounded-2xl shadow-lg p-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-8">Understanding Pregnancy Timing</h2>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-4">How Due Dates are Calculated</h3>
                      <p className="text-gray-600 mb-6 leading-relaxed">
                        Pregnancy due dates are typically calculated from the first day of your last menstrual period (LMP), 
                        not from conception. This is because ovulation and conception dates can be difficult to pinpoint exactly, 
                        while most women remember their last period.
                      </p>
                      
                      <h3 className="text-xl font-semibold text-gray-900 mb-4">Naegele's Rule</h3>
                      <div className="bg-rose-50 rounded-lg p-4 mb-4">
                        <p className="text-rose-800 text-sm font-medium">
                          Due Date = LMP + 280 days (40 weeks)
                        </p>
                      </div>
                      <p className="text-gray-600 text-sm">
                        This assumes a 28-day menstrual cycle with ovulation occurring on day 14.
                      </p>
                    </div>
                    
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-4">Pregnancy Trimesters</h3>
                      <div className="space-y-3">
                        <div className="flex items-center p-3 bg-blue-50 rounded-lg">
                          <div className="w-4 h-4 bg-blue-500 rounded-full mr-3"></div>
                          <div>
                            <div className="font-medium">First Trimester (1-12 weeks)</div>
                            <div className="text-sm text-gray-600">Organ formation and early development</div>
                          </div>
                        </div>
                        
                        <div className="flex items-center p-3 bg-green-50 rounded-lg">
                          <div className="w-4 h-4 bg-green-500 rounded-full mr-3"></div>
                          <div>
                            <div className="font-medium">Second Trimester (13-26 weeks)</div>
                            <div className="text-sm text-gray-600">Rapid growth and development</div>
                          </div>
                        </div>
                        
                        <div className="flex items-center p-3 bg-purple-50 rounded-lg">
                          <div className="w-4 h-4 bg-purple-500 rounded-full mr-3"></div>
                          <div>
                            <div className="font-medium">Third Trimester (27-40 weeks)</div>
                            <div className="text-sm text-gray-600">Final maturation and birth preparation</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Pregnancy Timeline */}
                <div className="bg-gradient-to-r from-rose-50 to-pink-50 rounded-2xl p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Pregnancy Timeline & Milestones</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="bg-white rounded-lg p-6 shadow-sm">
                      <i className="fas fa-calendar-day text-2xl text-blue-600 mb-4"></i>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Weeks 1-4</h3>
                      <p className="text-gray-600 text-sm">
                        Fertilization, implantation, and early cell division. 
                        First missed period typically occurs around week 4.
                      </p>
                    </div>
                    
                    <div className="bg-white rounded-lg p-6 shadow-sm">
                      <i className="fas fa-heartbeat text-2xl text-red-600 mb-4"></i>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Weeks 5-8</h3>
                      <p className="text-gray-600 text-sm">
                        Heart begins beating, neural tube forms, and major organs 
                        start developing. Morning sickness may begin.
                      </p>
                    </div>
                    
                    <div className="bg-white rounded-lg p-6 shadow-sm">
                      <i className="fas fa-user-plus text-2xl text-green-600 mb-4"></i>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Weeks 9-12</h3>
                      <p className="text-gray-600 text-sm">
                        All major organs formed, baby moves (though not felt yet), 
                        and risk of miscarriage significantly decreases.
                      </p>
                    </div>
                    
                    <div className="bg-white rounded-lg p-6 shadow-sm">
                      <i className="fas fa-baby text-2xl text-purple-600 mb-4"></i>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Weeks 13-20</h3>
                      <p className="text-gray-600 text-sm">
                        Gender can be determined, baby's movements become more 
                        coordinated, and anatomy scan typically performed.
                      </p>
                    </div>
                    
                    <div className="bg-white rounded-lg p-6 shadow-sm">
                      <i className="fas fa-child text-2xl text-orange-600 mb-4"></i>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Weeks 21-28</h3>
                      <p className="text-gray-600 text-sm">
                        Rapid brain development, baby can hear sounds, and 
                        survival outside the womb becomes possible with medical care.
                      </p>
                    </div>
                    
                    <div className="bg-white rounded-lg p-6 shadow-sm">
                      <i className="fas fa-home text-2xl text-indigo-600 mb-4"></i>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Weeks 29-40</h3>
                      <p className="text-gray-600 text-sm">
                        Final lung maturation, baby gains weight rapidly, and 
                        positioning for birth. Full term is 37-42 weeks.
                      </p>
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

export default PregnancyDueDateCalculator;