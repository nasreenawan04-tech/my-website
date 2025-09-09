
import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Clock } from 'lucide-react';

interface SalaryResult {
  annualSalary: number;
  hourlyWage: number;
  dailyWage: number;
  weeklyWage: number;
  monthlyWage: number;
  workingHoursPerYear: number;
  workingDaysPerYear: number;
  workingWeeksPerYear: number;
}

export default function SalaryToHourlyCalculator() {
  const [calculationType, setCalculationType] = useState('salary-to-hourly');
  
  // Salary to Hourly inputs
  const [annualSalary, setAnnualSalary] = useState('50000');
  const [hoursPerWeek, setHoursPerWeek] = useState('40');
  const [weeksPerYear, setWeeksPerYear] = useState('52');
  
  // Hourly to Salary inputs
  const [hourlyWage, setHourlyWage] = useState('25');
  const [workHoursPerWeek, setWorkHoursPerWeek] = useState('40');
  const [workWeeksPerYear, setWorkWeeksPerYear] = useState('52');
  
  const [currency, setCurrency] = useState('USD');
  const [country, setCountry] = useState('US');
  const [vacationWeeks, setVacationWeeks] = useState('2');
  const [result, setResult] = useState<SalaryResult | null>(null);

  const countries = [
    { code: 'US', name: 'United States', currency: 'USD', standardHours: 40, standardWeeks: 52, standardVacation: 2 },
    { code: 'CA', name: 'Canada', currency: 'CAD', standardHours: 40, standardWeeks: 52, standardVacation: 2 },
    { code: 'UK', name: 'United Kingdom', currency: 'GBP', standardHours: 37.5, standardWeeks: 52, standardVacation: 5.6 },
    { code: 'AU', name: 'Australia', currency: 'AUD', standardHours: 38, standardWeeks: 52, standardVacation: 4 },
    { code: 'DE', name: 'Germany', currency: 'EUR', standardHours: 40, standardWeeks: 52, standardVacation: 6 },
    { code: 'FR', name: 'France', currency: 'EUR', standardHours: 35, standardWeeks: 52, standardVacation: 5 },
    { code: 'JP', name: 'Japan', currency: 'JPY', standardHours: 40, standardWeeks: 52, standardVacation: 2 },
    { code: 'SG', name: 'Singapore', currency: 'SGD', standardHours: 44, standardWeeks: 52, standardVacation: 1 },
    { code: 'IN', name: 'India', currency: 'INR', standardHours: 48, standardWeeks: 52, standardVacation: 1.5 },
    { code: 'BR', name: 'Brazil', currency: 'BRL', standardHours: 44, standardWeeks: 52, standardVacation: 4 },
    { code: 'MX', name: 'Mexico', currency: 'MXN', standardHours: 48, standardWeeks: 52, standardVacation: 1.5 },
    { code: 'NZ', name: 'New Zealand', currency: 'NZD', standardHours: 40, standardWeeks: 52, standardVacation: 4 }
  ];

  const currencies = [
    { code: 'USD', name: 'US Dollar' },
    { code: 'EUR', name: 'Euro' },
    { code: 'GBP', name: 'British Pound' },
    { code: 'CAD', name: 'Canadian Dollar' },
    { code: 'AUD', name: 'Australian Dollar' },
    { code: 'JPY', name: 'Japanese Yen' },
    { code: 'SGD', name: 'Singapore Dollar' },
    { code: 'INR', name: 'Indian Rupee' },
    { code: 'BRL', name: 'Brazilian Real' },
    { code: 'MXN', name: 'Mexican Peso' },
    { code: 'NZD', name: 'New Zealand Dollar' }
  ];

  const calculateSalaryToHourly = () => {
    const salary = parseFloat(annualSalary);
    const weeklyHours = parseFloat(hoursPerWeek);
    const yearlyWeeks = parseFloat(weeksPerYear);
    
    if (salary <= 0 || weeklyHours <= 0 || yearlyWeeks <= 0) return;

    const workingHoursPerYear = weeklyHours * yearlyWeeks;
    const workingDaysPerYear = (yearlyWeeks * 5); // Assuming 5 working days per week
    const workingWeeksPerYear = yearlyWeeks;
    
    const hourlyRate = salary / workingHoursPerYear;
    const dailyRate = (salary / workingDaysPerYear);
    const weeklyRate = salary / yearlyWeeks;
    const monthlyRate = salary / 12;

    setResult({
      annualSalary: salary,
      hourlyWage: hourlyRate,
      dailyWage: dailyRate,
      weeklyWage: weeklyRate,
      monthlyWage: monthlyRate,
      workingHoursPerYear,
      workingDaysPerYear,
      workingWeeksPerYear
    });
  };

  const calculateHourlyToSalary = () => {
    const hourly = parseFloat(hourlyWage);
    const weeklyHours = parseFloat(workHoursPerWeek);
    const yearlyWeeks = parseFloat(workWeeksPerYear);
    
    if (hourly <= 0 || weeklyHours <= 0 || yearlyWeeks <= 0) return;

    const workingHoursPerYear = weeklyHours * yearlyWeeks;
    const workingDaysPerYear = (yearlyWeeks * 5); // Assuming 5 working days per week
    const workingWeeksPerYear = yearlyWeeks;
    
    const annualIncome = hourly * workingHoursPerYear;
    const dailyRate = hourly * (weeklyHours / 5); // Daily rate assuming 5 days per week
    const weeklyRate = hourly * weeklyHours;
    const monthlyRate = annualIncome / 12;

    setResult({
      annualSalary: annualIncome,
      hourlyWage: hourly,
      dailyWage: dailyRate,
      weeklyWage: weeklyRate,
      monthlyWage: monthlyRate,
      workingHoursPerYear,
      workingDaysPerYear,
      workingWeeksPerYear
    });
  };

  const resetCalculator = () => {
    setAnnualSalary('50000');
    setHoursPerWeek('40');
    setWeeksPerYear('52');
    setHourlyWage('25');
    setWorkHoursPerWeek('40');
    setWorkWeeksPerYear('52');
    setVacationWeeks('2');
    setCurrency('USD');
    setCountry('US');
    setResult(null);
  };

  const handleCountryChange = (newCountry: string) => {
    setCountry(newCountry);
    const countryData = countries.find(c => c.code === newCountry);
    if (countryData) {
      setCurrency(countryData.currency);
      setHoursPerWeek(countryData.standardHours.toString());
      setWorkHoursPerWeek(countryData.standardHours.toString());
      setWeeksPerYear(countryData.standardWeeks.toString());
      setWorkWeeksPerYear(countryData.standardWeeks.toString());
      setVacationWeeks(countryData.standardVacation.toString());
    }
  };

  const formatCurrency = (amount: number) => {
    const currencyMap: { [key: string]: { locale: string; currency: string } } = {
      USD: { locale: 'en-US', currency: 'USD' },
      EUR: { locale: 'de-DE', currency: 'EUR' },
      GBP: { locale: 'en-GB', currency: 'GBP' },
      CAD: { locale: 'en-CA', currency: 'CAD' },
      AUD: { locale: 'en-AU', currency: 'AUD' },
      JPY: { locale: 'ja-JP', currency: 'JPY' },
      SGD: { locale: 'en-SG', currency: 'SGD' },
      INR: { locale: 'en-IN', currency: 'INR' },
      BRL: { locale: 'pt-BR', currency: 'BRL' },
      MXN: { locale: 'es-MX', currency: 'MXN' },
      NZD: { locale: 'en-NZ', currency: 'NZD' }
    };

    const config = currencyMap[currency] || currencyMap.USD;
    
    return new Intl.NumberFormat(config.locale, {
      style: 'currency',
      currency: config.currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Helmet>
        <title>Salary to Hourly Calculator - Convert Salary and Hourly Wages | ToolsHub</title>
        <meta name="description" content="Free salary to hourly calculator. Convert annual salary to hourly wage or hourly rate to yearly salary. Supports 12+ countries, multiple currencies, and includes vacation time calculations. Get instant results with detailed pay period breakdowns." />
        <meta name="keywords" content="salary to hourly calculator, hourly to salary converter, annual salary calculator, hourly wage calculator, salary converter, wage calculator, pay calculator, income converter, salary breakdown, hourly rate calculator" />
        <link rel="canonical" href="https://toolshub.com/salary-to-hourly-calculator" />
      </Helmet>
      
      <Header />
      
      <main>
        {/* Hero Section */}
        <section className="gradient-hero text-white py-16 pt-24">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="w-20 h-20 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Clock className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold mb-6">
              Salary to Hourly Calculator - Convert Annual Salary to Hourly Wage
            </h1>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto mb-8">
              Free online salary to hourly calculator. Instantly convert annual salary to hourly rate or hourly wage to yearly salary. Supports multiple currencies and country-specific working hours standards.
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-sm">
              <span className="bg-white bg-opacity-20 px-3 py-1 rounded-full">✓ Multiple Currencies</span>
              <span className="bg-white bg-opacity-20 px-3 py-1 rounded-full">✓ Country Standards</span>
              <span className="bg-white bg-opacity-20 px-3 py-1 rounded-full">✓ Vacation Time Included</span>
              <span className="bg-white bg-opacity-20 px-3 py-1 rounded-full">✓ Detailed Breakdown</span>
            </div>
          </div>
        </section>

        <div className="max-w-6xl mx-auto px-4 py-12">
          <Card className="bg-white shadow-sm border-0">
            <CardContent className="p-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                {/* Input Section */}
                <div className="space-y-6">
                  <h2 className="text-2xl font-semibold text-gray-900 mb-8">Salary Converter</h2>
                  
                  {/* Country Selection */}
                  <div className="space-y-3">
                    <Label htmlFor="country" className="text-sm font-medium text-gray-700">
                      Country (Auto-fills standard working hours)
                    </Label>
                    <Select value={country} onValueChange={handleCountryChange}>
                      <SelectTrigger className="h-12 border-gray-200 rounded-lg">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {countries.map((country) => (
                          <SelectItem key={country.code} value={country.code}>
                            {country.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Calculation Type Tabs */}
                  <Tabs value={calculationType} onValueChange={setCalculationType} className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="salary-to-hourly">Salary → Hourly</TabsTrigger>
                      <TabsTrigger value="hourly-to-salary">Hourly → Salary</TabsTrigger>
                    </TabsList>

                    <TabsContent value="salary-to-hourly" className="space-y-6 mt-6">
                      <div className="space-y-3">
                        <Label htmlFor="annual-salary" className="text-sm font-medium text-gray-700">
                          Annual Salary ({currency})
                        </Label>
                        <Input
                          id="annual-salary"
                          type="number"
                          value={annualSalary}
                          onChange={(e) => setAnnualSalary(e.target.value)}
                          className="h-12 text-base border-gray-200 rounded-lg"
                          placeholder="50,000"
                          min="0"
                        />
                      </div>

                      <div className="space-y-3">
                        <Label htmlFor="hours-per-week" className="text-sm font-medium text-gray-700">
                          Hours per Week
                        </Label>
                        <Input
                          id="hours-per-week"
                          type="number"
                          value={hoursPerWeek}
                          onChange={(e) => setHoursPerWeek(e.target.value)}
                          className="h-12 text-base border-gray-200 rounded-lg"
                          placeholder="40"
                          min="1"
                          max="168"
                        />
                      </div>

                      <div className="space-y-3">
                        <Label htmlFor="weeks-per-year" className="text-sm font-medium text-gray-700">
                          Working Weeks per Year
                        </Label>
                        <Input
                          id="weeks-per-year"
                          type="number"
                          value={weeksPerYear}
                          onChange={(e) => setWeeksPerYear(e.target.value)}
                          className="h-12 text-base border-gray-200 rounded-lg"
                          placeholder="52"
                          min="1"
                          max="52"
                        />
                        <div className="text-xs text-gray-500">
                          Accounts for vacation, holidays, and unpaid leave
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="hourly-to-salary" className="space-y-6 mt-6">
                      <div className="space-y-3">
                        <Label htmlFor="hourly-wage" className="text-sm font-medium text-gray-700">
                          Hourly Wage ({currency})
                        </Label>
                        <Input
                          id="hourly-wage"
                          type="number"
                          value={hourlyWage}
                          onChange={(e) => setHourlyWage(e.target.value)}
                          className="h-12 text-base border-gray-200 rounded-lg"
                          placeholder="25.00"
                          min="0"
                          step="0.01"
                        />
                      </div>

                      <div className="space-y-3">
                        <Label htmlFor="work-hours-per-week" className="text-sm font-medium text-gray-700">
                          Hours per Week
                        </Label>
                        <Input
                          id="work-hours-per-week"
                          type="number"
                          value={workHoursPerWeek}
                          onChange={(e) => setWorkHoursPerWeek(e.target.value)}
                          className="h-12 text-base border-gray-200 rounded-lg"
                          placeholder="40"
                          min="1"
                          max="168"
                        />
                      </div>

                      <div className="space-y-3">
                        <Label htmlFor="work-weeks-per-year" className="text-sm font-medium text-gray-700">
                          Working Weeks per Year
                        </Label>
                        <Input
                          id="work-weeks-per-year"
                          type="number"
                          value={workWeeksPerYear}
                          onChange={(e) => setWorkWeeksPerYear(e.target.value)}
                          className="h-12 text-base border-gray-200 rounded-lg"
                          placeholder="52"
                          min="1"
                          max="52"
                        />
                        <div className="text-xs text-gray-500">
                          Accounts for vacation, holidays, and unpaid leave
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>

                  {/* Action Buttons */}
                  <div className="flex gap-4 pt-6">
                    <Button
                      onClick={calculationType === 'salary-to-hourly' ? calculateSalaryToHourly : calculateHourlyToSalary}
                      className="flex-1 h-12 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg"
                    >
                      <Clock className="w-4 h-4 mr-2" />
                      Convert
                    </Button>
                    <Button
                      onClick={resetCalculator}
                      variant="outline"
                      className="h-12 px-8 border-gray-200 text-gray-600 hover:bg-gray-50 font-medium rounded-lg"
                    >
                      Reset
                    </Button>
                  </div>
                </div>

                {/* Results Section */}
                <div className="bg-gray-50 rounded-xl p-8">
                  <h2 className="text-2xl font-semibold text-gray-900 mb-8">Conversion Results</h2>
                  
                  {result ? (
                    <div className="space-y-6">
                      {/* Main Results */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white rounded-lg p-4 border border-gray-100">
                          <div className="text-center space-y-2">
                            <div className="text-sm text-gray-600">Hourly Rate</div>
                            <div className="text-2xl font-bold text-blue-600">
                              {formatCurrency(result.hourlyWage)}
                            </div>
                          </div>
                        </div>
                        <div className="bg-white rounded-lg p-4 border border-gray-100">
                          <div className="text-center space-y-2">
                            <div className="text-sm text-gray-600">Annual Salary</div>
                            <div className="text-2xl font-bold text-green-600">
                              {formatCurrency(result.annualSalary)}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Detailed Breakdown */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-900">Pay Period Breakdown</h3>
                        
                        <div className="flex justify-between items-center py-3 border-b border-gray-200">
                          <span className="text-gray-600">Daily Rate</span>
                          <span className="font-semibold text-gray-900">
                            {formatCurrency(result.dailyWage)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center py-3 border-b border-gray-200">
                          <span className="text-gray-600">Weekly Rate</span>
                          <span className="font-semibold text-gray-900">
                            {formatCurrency(result.weeklyWage)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center py-3 border-b border-gray-200">
                          <span className="text-gray-600">Monthly Rate</span>
                          <span className="font-semibold text-gray-900">
                            {formatCurrency(result.monthlyWage)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center py-3 border-b border-gray-200">
                          <span className="text-gray-600">Annual Rate</span>
                          <span className="font-semibold text-green-600">
                            {formatCurrency(result.annualSalary)}
                          </span>
                        </div>
                      </div>

                      {/* Work Schedule Info */}
                      <div className="mt-8">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Work Schedule</h3>
                        <div className="grid grid-cols-1 gap-3">
                          <div className="bg-white rounded-lg p-3 border border-gray-100 flex justify-between text-sm">
                            <span className="text-gray-600">Working Hours per Year</span>
                            <span className="font-medium text-gray-900">
                              {result.workingHoursPerYear.toLocaleString()} hours
                            </span>
                          </div>
                          <div className="bg-white rounded-lg p-3 border border-gray-100 flex justify-between text-sm">
                            <span className="text-gray-600">Working Days per Year</span>
                            <span className="font-medium text-gray-900">
                              {result.workingDaysPerYear} days
                            </span>
                          </div>
                          <div className="bg-white rounded-lg p-3 border border-gray-100 flex justify-between text-sm">
                            <span className="text-gray-600">Working Weeks per Year</span>
                            <span className="font-medium text-gray-900">
                              {result.workingWeeksPerYear} weeks
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Clock className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500">Enter salary or hourly wage details and click convert to see results</p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Comprehensive Educational Content */}
          <div className="mt-16 space-y-12">
            {/* Introduction Section with SEO Content */}
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Free Salary to Hourly Calculator - Convert Annual Salary to Hourly Wage
              </h2>
              <p className="text-lg text-gray-600 max-w-4xl mx-auto leading-relaxed">
                Calculate your hourly wage from annual salary or convert hourly rate to yearly income with our comprehensive 
                salary converter. Perfect for job negotiations, career planning, freelance pricing, and financial planning. 
                Supports 12+ countries and multiple currencies with accurate working hour standards and vacation time calculations.
              </p>
            </div>

            {/* What is Salary to Hourly Calculator */}
            <Card className="bg-white border-0 shadow-sm">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">What is a Salary to Hourly Calculator?</h2>
                <div className="prose max-w-none text-gray-600">
                  <p className="mb-4">
                    A <strong>salary to hourly calculator</strong> is an essential financial tool that converts your annual salary 
                    into an equivalent hourly wage, or vice versa. This powerful calculator helps employees, freelancers, contractors, 
                    and employers understand the true value of compensation packages by breaking down annual salaries into hourly rates 
                    and providing detailed pay period breakdowns.
                  </p>
                  <p className="mb-4">
                    Our advanced salary converter supports multiple currencies, accounts for vacation time, holidays, sick leave, 
                    and uses country-specific working hour standards to provide the most accurate conversions possible. Whether you're 
                    comparing job offers, setting freelance rates, or planning your financial future, this tool gives you the insights 
                    needed to make informed decisions.
                  </p>
                  <p className="mb-4">
                    Unlike basic calculators, our tool provides comprehensive breakdowns including daily, weekly, monthly, and annual 
                    rates, helping you understand your earning potential across different time periods. This is particularly valuable 
                    for professionals considering career transitions between salaried and hourly positions.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* How It Works */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Card className="bg-white border-0 shadow-sm">
                <CardContent className="p-8">
                  <h3 className="text-xl font-semibold text-gray-900 mb-6">How Salary to Hourly Conversion Works</h3>
                  <div className="space-y-4">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-blue-900 mb-2">Basic Formula:</h4>
                      <div className="text-sm text-blue-800">
                        <strong>Hourly Rate = Annual Salary ÷ (Hours per Week × Working Weeks per Year)</strong>
                      </div>
                    </div>
                    <div className="space-y-3 text-gray-600">
                      <div className="flex items-start">
                        <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                          <span className="text-xs font-semibold text-blue-600">1</span>
                        </div>
                        <div>
                          <strong>Annual Salary:</strong> Your total yearly gross income before taxes
                        </div>
                      </div>
                      <div className="flex items-start">
                        <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                          <span className="text-xs font-semibold text-blue-600">2</span>
                        </div>
                        <div>
                          <strong>Working Hours:</strong> Standard hours per week (typically 40 hours)
                        </div>
                      </div>
                      <div className="flex items-start">
                        <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                          <span className="text-xs font-semibold text-blue-600">3</span>
                        </div>
                        <div>
                          <strong>Working Weeks:</strong> Total weeks worked per year (52 minus vacation weeks)
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white border-0 shadow-sm">
                <CardContent className="p-8">
                  <h3 className="text-xl font-semibold text-gray-900 mb-6">Calculation Example</h3>
                  <div className="space-y-4">
                    <div className="bg-green-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-green-900 mb-3">Example: $60,000 Annual Salary</h4>
                      <div className="space-y-2 text-sm text-green-800">
                        <div>• Annual Salary: $60,000</div>
                        <div>• Hours per Week: 40 hours</div>
                        <div>• Working Weeks: 50 weeks (2 weeks vacation)</div>
                        <div className="border-t border-green-200 pt-2 mt-2">
                          <strong>Hourly Rate: $60,000 ÷ (40 × 50) = $30/hour</strong>
                        </div>
                      </div>
                    </div>
                    <div className="text-sm text-gray-600">
                      <strong>This means:</strong> A $60,000 annual salary equals approximately $30 per hour when working 40 hours per week for 50 weeks per year.
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Benefits for Different Audiences */}
            <Card className="bg-white border-0 shadow-sm">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Who Benefits from a Salary to Hourly Calculator?</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                  <div className="space-y-6">
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <span className="text-blue-600 font-semibold">🎓</span>
                        </div>
                        <h3 className="font-semibold text-gray-900">Students & Recent Graduates</h3>
                      </div>
                      <p className="text-sm text-gray-600 ml-13">
                        Compare entry-level job offers, understand compensation packages, and make informed decisions about 
                        internships vs. part-time work. Calculate if graduate school investment pays off compared to immediate employment.
                      </p>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                          <span className="text-green-600 font-semibold">💼</span>
                        </div>
                        <h3 className="font-semibold text-gray-900">Working Professionals</h3>
                      </div>
                      <p className="text-sm text-gray-600 ml-13">
                        Negotiate salaries effectively, compare job offers from different companies, and understand the true value 
                        of benefits packages. Evaluate consulting opportunities and side hustles against full-time employment.
                      </p>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                          <span className="text-purple-600 font-semibold">🏢</span>
                        </div>
                        <h3 className="font-semibold text-gray-900">Business Owners & Entrepreneurs</h3>
                      </div>
                      <p className="text-sm text-gray-600 ml-13">
                        Determine fair compensation for employees, budget for payroll expenses, and compare contractor rates 
                        vs. full-time employee costs. Essential for startup founders planning compensation structures.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                          <span className="text-orange-600 font-semibold">🎨</span>
                        </div>
                        <h3 className="font-semibold text-gray-900">Freelancers & Contractors</h3>
                      </div>
                      <p className="text-sm text-gray-600 ml-13">
                        Set competitive hourly rates, bid on projects accurately, and determine annual income goals. 
                        Compare freelance earnings potential with traditional employment benefits and security.
                      </p>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                          <span className="text-red-600 font-semibold">🏛️</span>
                        </div>
                        <h3 className="font-semibold text-gray-900">HR Professionals</h3>
                      </div>
                      <p className="text-sm text-gray-600 ml-13">
                        Develop competitive compensation packages, analyze market rates, ensure legal compliance with 
                        minimum wage laws, and create transparent pay scales for different positions and experience levels.
                      </p>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                          <span className="text-indigo-600 font-semibold">📊</span>
                        </div>
                        <h3 className="font-semibold text-gray-900">Financial Planners</h3>
                      </div>
                      <p className="text-sm text-gray-600 ml-13">
                        Help clients understand their earning capacity, plan for retirement, evaluate career changes, 
                        and make informed decisions about education investments and career development opportunities.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Use Cases */}
            <Card className="bg-white border-0 shadow-sm">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Common Use Cases for Salary to Hourly Conversion</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="space-y-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <span className="text-blue-600 font-semibold">💼</span>
                    </div>
                    <h3 className="font-semibold text-gray-900">Job Negotiations</h3>
                    <p className="text-sm text-gray-600">
                      Compare salary offers with hourly positions, understand overtime potential, and negotiate better 
                      compensation packages with confidence using accurate hourly rate calculations.
                    </p>
                  </div>
                  <div className="space-y-3">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <span className="text-green-600 font-semibold">🔄</span>
                    </div>
                    <h3 className="font-semibold text-gray-900">Career Transitions</h3>
                    <p className="text-sm text-gray-600">
                      Switching between salaried and hourly positions? Calculate equivalent pay rates to ensure you're 
                      making financially smart career moves and not leaving money on the table.
                    </p>
                  </div>
                  <div className="space-y-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                      <span className="text-purple-600 font-semibold">📊</span>
                    </div>
                    <h3 className="font-semibold text-gray-900">Freelance Pricing Strategy</h3>
                    <p className="text-sm text-gray-600">
                      Set competitive hourly rates based on desired annual income, factor in vacation time and business 
                      expenses, and price services competitively in the marketplace.
                    </p>
                  </div>
                  <div className="space-y-3">
                    <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                      <span className="text-orange-600 font-semibold">💰</span>
                    </div>
                    <h3 className="font-semibold text-gray-900">Financial Planning</h3>
                    <p className="text-sm text-gray-600">
                      Understand your true earning capacity for budgeting, loan applications, retirement planning, and 
                      making informed decisions about major purchases and investments.
                    </p>
                  </div>
                  <div className="space-y-3">
                    <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                      <span className="text-red-600 font-semibold">📋</span>
                    </div>
                    <h3 className="font-semibold text-gray-900">HR & Payroll Management</h3>
                    <p className="text-sm text-gray-600">
                      Develop competitive compensation packages, analyze market rates, ensure compliance with labor laws, 
                      and create transparent pay scales for different positions.
                    </p>
                  </div>
                  <div className="space-y-3">
                    <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                      <span className="text-indigo-600 font-semibold">⚖️</span>
                    </div>
                    <h3 className="font-semibold text-gray-900">Legal & Compliance</h3>
                    <p className="text-sm text-gray-600">
                      Ensure compliance with minimum wage laws, overtime regulations, and fair labor standards when 
                      converting between salary and hourly rates for legal documentation.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Country-Specific Information */}
            <Card className="bg-white border-0 shadow-sm">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Country-Specific Working Hour Standards</h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 font-semibold text-gray-900">Country</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-900">Standard Hours/Week</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-900">Typical Vacation</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-900">Currency</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-gray-100">
                        <td className="py-3 px-4">United States</td>
                        <td className="py-3 px-4">40 hours</td>
                        <td className="py-3 px-4">2 weeks</td>
                        <td className="py-3 px-4">USD</td>
                      </tr>
                      <tr className="border-b border-gray-100">
                        <td className="py-3 px-4">United Kingdom</td>
                        <td className="py-3 px-4">37.5 hours</td>
                        <td className="py-3 px-4">5.6 weeks</td>
                        <td className="py-3 px-4">GBP</td>
                      </tr>
                      <tr className="border-b border-gray-100">
                        <td className="py-3 px-4">Germany</td>
                        <td className="py-3 px-4">40 hours</td>
                        <td className="py-3 px-4">6 weeks</td>
                        <td className="py-3 px-4">EUR</td>
                      </tr>
                      <tr className="border-b border-gray-100">
                        <td className="py-3 px-4">France</td>
                        <td className="py-3 px-4">35 hours</td>
                        <td className="py-3 px-4">5 weeks</td>
                        <td className="py-3 px-4">EUR</td>
                      </tr>
                      <tr className="border-b border-gray-100">
                        <td className="py-3 px-4">Australia</td>
                        <td className="py-3 px-4">38 hours</td>
                        <td className="py-3 px-4">4 weeks</td>
                        <td className="py-3 px-4">AUD</td>
                      </tr>
                      <tr className="border-b border-gray-100">
                        <td className="py-3 px-4">Canada</td>
                        <td className="py-3 px-4">40 hours</td>
                        <td className="py-3 px-4">2 weeks</td>
                        <td className="py-3 px-4">CAD</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <p className="text-sm text-gray-600 mt-4">
                  *Our calculator automatically applies these country-specific standards when you select your location, ensuring accurate conversions based on local working hour norms.
                </p>
              </CardContent>
            </Card>

            {/* Important Considerations */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Card className="bg-white border-0 shadow-sm">
                <CardContent className="p-8">
                  <h3 className="text-xl font-semibold text-gray-900 mb-6">Important Considerations</h3>
                  <div className="space-y-4">
                    <div className="space-y-3 text-gray-600">
                      <div className="flex items-start">
                        <div className="w-5 h-5 bg-orange-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                          <span className="text-orange-600">⚠️</span>
                        </div>
                        <div>
                          <strong>Gross vs. Net Pay:</strong> Calculations show gross pay before taxes, health insurance, retirement contributions, and other deductions
                        </div>
                      </div>
                      <div className="flex items-start">
                        <div className="w-5 h-5 bg-orange-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                          <span className="text-orange-600">⚠️</span>
                        </div>
                        <div>
                          <strong>Benefits Value:</strong> Salaried positions often include health insurance, paid time off, and retirement matching that aren't reflected in hourly calculations
                        </div>
                      </div>
                      <div className="flex items-start">
                        <div className="w-5 h-5 bg-orange-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                          <span className="text-orange-600">⚠️</span>
                        </div>
                        <div>
                          <strong>Overtime Considerations:</strong> Hourly workers may earn overtime rates (1.5x) for hours over 40 per week, while salaried employees typically don't
                        </div>
                      </div>
                      <div className="flex items-start">
                        <div className="w-5 h-5 bg-orange-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                          <span className="text-orange-600">⚠️</span>
                        </div>
                        <div>
                          <strong>Job Security:</strong> Salaried positions often provide more job security and predictable income compared to hourly positions
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white border-0 shadow-sm">
                <CardContent className="p-8">
                  <h3 className="text-xl font-semibold text-gray-900 mb-6">Tips for Accurate Calculations</h3>
                  <div className="space-y-4">
                    <div className="space-y-3 text-gray-600">
                      <div className="flex items-start">
                        <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                          <span className="text-green-600">✓</span>
                        </div>
                        <div>
                          <strong>Include All Time Off:</strong> Account for vacation days, sick leave, holidays, and personal days when calculating working weeks
                        </div>
                      </div>
                      <div className="flex items-start">
                        <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                          <span className="text-green-600">✓</span>
                        </div>
                        <div>
                          <strong>Consider Your Country:</strong> Use country-specific working hour standards for more accurate comparisons
                        </div>
                      </div>
                      <div className="flex items-start">
                        <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                          <span className="text-green-600">✓</span>
                        </div>
                        <div>
                          <strong>Factor in Bonuses:</strong> If you receive regular bonuses or commissions, add them to your annual salary for a complete picture
                        </div>
                      </div>
                      <div className="flex items-start">
                        <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                          <span className="text-green-600">✓</span>
                        </div>
                        <div>
                          <strong>Compare Total Compensation:</strong> Include the value of benefits when comparing job offers or career options
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Related Financial Tools */}
            <Card className="bg-white border-0 shadow-sm">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Related Financial Calculators</h2>
                <p className="text-gray-600 mb-8">
                  Enhance your financial planning with our comprehensive suite of calculators designed to help you make 
                  informed decisions about your money, career, and future financial goals.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="bg-gray-50 rounded-lg p-6 hover:bg-gray-100 transition-colors">
                    <h3 className="font-semibold text-gray-900 mb-2">
                      <a href="/tax-calculator" className="text-blue-600 hover:text-blue-800">
                        Tax Calculator
                      </a>
                    </h3>
                    <p className="text-sm text-gray-600">
                      Calculate your income tax and take-home pay after deductions. Essential for understanding your 
                      net hourly rate and actual earnings.
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-6 hover:bg-gray-100 transition-colors">
                    <h3 className="font-semibold text-gray-900 mb-2">
                      <a href="/loan-calculator" className="text-blue-600 hover:text-blue-800">
                        Loan Calculator
                      </a>
                    </h3>
                    <p className="text-sm text-gray-600">
                      Plan your borrowing capacity based on your hourly or annual income. Calculate monthly payments 
                      for personal loans, auto loans, and more.
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-6 hover:bg-gray-100 transition-colors">
                    <h3 className="font-semibold text-gray-900 mb-2">
                      <a href="/mortgage-calculator" className="text-blue-600 hover:text-blue-800">
                        Mortgage Calculator
                      </a>
                    </h3>
                    <p className="text-sm text-gray-600">
                      Determine how much house you can afford based on your salary. Calculate monthly mortgage payments 
                      and total interest costs over the loan term.
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-6 hover:bg-gray-100 transition-colors">
                    <h3 className="font-semibold text-gray-900 mb-2">
                      <a href="/retirement-calculator" className="text-blue-600 hover:text-blue-800">
                        Retirement Calculator
                      </a>
                    </h3>
                    <p className="text-sm text-gray-600">
                      Plan for your future with retirement savings calculations. Determine how much to save monthly 
                      based on your current income and retirement goals.
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-6 hover:bg-gray-100 transition-colors">
                    <h3 className="font-semibold text-gray-900 mb-2">
                      <a href="/compound-interest-calculator" className="text-blue-600 hover:text-blue-800">
                        Compound Interest Calculator
                      </a>
                    </h3>
                    <p className="text-sm text-gray-600">
                      See how your money grows over time with compound interest. Perfect for planning investments 
                      and savings goals based on your earning capacity.
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-6 hover:bg-gray-100 transition-colors">
                    <h3 className="font-semibold text-gray-900 mb-2">
                      <a href="/savings-goal-calculator" className="text-blue-600 hover:text-blue-800">
                        Savings Goal Calculator
                      </a>
                    </h3>
                    <p className="text-sm text-gray-600">
                      Calculate how much to save monthly to reach your financial goals. Use your hourly or annual 
                      income to plan realistic savings targets.
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-6 hover:bg-gray-100 transition-colors">
                    <h3 className="font-semibold text-gray-900 mb-2">
                      <a href="/roi-calculator" className="text-blue-600 hover:text-blue-800">
                        ROI Calculator
                      </a>
                    </h3>
                    <p className="text-sm text-gray-600">
                      Calculate return on investment for education, training, or career development. Determine if 
                      investing in skills will increase your earning potential.
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-6 hover:bg-gray-100 transition-colors">
                    <h3 className="font-semibold text-gray-900 mb-2">
                      <a href="/business-loan-calculator" className="text-blue-600 hover:text-blue-800">
                        Business Loan Calculator
                      </a>
                    </h3>
                    <p className="text-sm text-gray-600">
                      For entrepreneurs planning to start a business. Calculate loan payments and determine the 
                      income needed to support business financing.
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-6 hover:bg-gray-100 transition-colors">
                    <h3 className="font-semibold text-gray-900 mb-2">
                      <a href="/net-worth-calculator" className="text-blue-600 hover:text-blue-800">
                        Net Worth Calculator
                      </a>
                    </h3>
                    <p className="text-sm text-gray-600">
                      Track your overall financial health. Calculate your net worth and see how your income 
                      contributes to building long-term wealth.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* FAQ Section */}
            <Card className="bg-white border-0 shadow-sm">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Frequently Asked Questions</h2>
                <div className="space-y-6">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">How do I convert salary to hourly rate accurately?</h3>
                    <p className="text-gray-600">
                      Divide your annual salary by the total number of working hours in a year. For example: $50,000 ÷ (40 hours/week × 50 weeks) = $25/hour. 
                      Our calculator does this automatically and accounts for vacation time, holidays, and country-specific working standards for maximum accuracy.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Should I include vacation time and holidays in my calculation?</h3>
                    <p className="text-gray-600">
                      Yes, absolutely. You should subtract vacation weeks and holidays from your total working weeks. If you get 2 weeks of vacation plus 1 week of holidays, 
                      work 49 weeks instead of 52. This gives you a more accurate hourly rate that reflects your actual working time.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Is the result before or after taxes?</h3>
                    <p className="text-gray-600">
                      The calculator shows gross pay (before taxes). Your actual take-home pay will be lower after federal taxes, state taxes, Social Security, Medicare, 
                      and other deductions. Use our <a href="/tax-calculator" className="text-blue-600 hover:text-blue-800">Tax Calculator</a> to estimate your net pay.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">How accurate is the salary to hourly conversion?</h3>
                    <p className="text-gray-600">
                      Our calculator provides highly accurate conversions based on the information you provide. Results may vary slightly depending on actual hours worked, 
                      overtime opportunities, and company-specific policies. For the most accurate results, input your actual working hours and vacation time.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Can I use this calculator for different countries?</h3>
                    <p className="text-gray-600">
                      Yes! Our calculator supports 12+ countries with their specific working hour standards and currencies, including the US, UK, Canada, Australia, 
                      Germany, France, Japan, Singapore, India, Brazil, Mexico, and New Zealand. Simply select your country for automatic configuration.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">What's the difference between salary and hourly employment?</h3>
                    <p className="text-gray-600">
                      Salaried employees receive fixed annual compensation regardless of hours worked, often with benefits like health insurance and paid time off. 
                      Hourly employees are paid for actual hours worked and may earn overtime (typically 1.5x) for hours over 40 per week, but may have fewer benefits.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">How do I factor in benefits when comparing salaries?</h3>
                    <p className="text-gray-600">
                      Add the monetary value of benefits (health insurance, retirement matching, paid vacation) to your base salary before converting to hourly. 
                      Benefits can add 20-30% to your total compensation value, making a lower salary potentially more valuable than a higher hourly wage without benefits.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Can freelancers use this calculator?</h3>
                    <p className="text-gray-600">
                      Absolutely! Freelancers can use this calculator to set hourly rates based on desired annual income goals. Remember to factor in business expenses, 
                      self-employment taxes, and unpaid time for administration, marketing, and business development when setting your rates.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* SEO Content Section */}
            <Card className="bg-white border-0 shadow-sm">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Salary vs. Hourly: Making the Right Career Choice</h2>
                <div className="prose max-w-none text-gray-600 space-y-4">
                  <p>
                    Understanding the difference between salary and hourly compensation is crucial for making informed career decisions. 
                    Our salary to hourly calculator helps you compare opportunities fairly by converting between compensation types and 
                    revealing the true value of different employment arrangements.
                  </p>
                  <p>
                    <strong>Salaried positions</strong> typically offer greater job security, predictable income, and comprehensive benefits 
                    packages including health insurance, retirement plans, and paid time off. However, salaried employees may work longer 
                    hours without additional compensation and have less flexibility in their schedules.
                  </p>
                  <p>
                    <strong>Hourly positions</strong> provide more flexibility and the opportunity to earn overtime pay for additional hours worked. 
                    This can be particularly advantageous for workers who can consistently work more than 40 hours per week. However, hourly 
                    workers may face income volatility and fewer benefits.
                  </p>
                  <p>
                    When evaluating job offers, consider using our calculator alongside other financial tools like the 
                    <a href="/tax-calculator" className="text-blue-600 hover:text-blue-800 mx-1">Tax Calculator</a> to understand your take-home pay, 
                    and the <a href="/savings-goal-calculator" className="text-blue-600 hover:text-blue-800 mx-1">Savings Goal Calculator</a> to 
                    determine how different compensation structures affect your ability to reach financial goals.
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
