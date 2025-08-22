
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
            {/* What is Salary to Hourly Calculator */}
            <Card className="bg-white border-0 shadow-sm">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">What is a Salary to Hourly Calculator?</h2>
                <div className="prose max-w-none text-gray-600">
                  <p className="mb-4">
                    A <strong>salary to hourly calculator</strong> is a financial tool that converts your annual salary into an equivalent hourly wage, or vice versa. This calculator helps employees, freelancers, and employers understand the true value of compensation packages by breaking down annual salaries into hourly rates.
                  </p>
                  <p className="mb-4">
                    Our advanced calculator supports multiple currencies, accounts for vacation time, holidays, and uses country-specific working hour standards to provide the most accurate conversions possible.
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

            {/* Use Cases */}
            <Card className="bg-white border-0 shadow-sm">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">When to Use a Salary to Hourly Calculator</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="space-y-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <span className="text-blue-600 font-semibold">💼</span>
                    </div>
                    <h3 className="font-semibold text-gray-900">Job Negotiations</h3>
                    <p className="text-sm text-gray-600">
                      Compare salary offers with hourly positions to make informed career decisions and negotiate better compensation packages.
                    </p>
                  </div>
                  <div className="space-y-3">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <span className="text-green-600 font-semibold">🏢</span>
                    </div>
                    <h3 className="font-semibold text-gray-900">Career Transitions</h3>
                    <p className="text-sm text-gray-600">
                      Switching between salaried and hourly positions? Calculate equivalent pay rates to ensure you're making the right financial move.
                    </p>
                  </div>
                  <div className="space-y-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                      <span className="text-purple-600 font-semibold">📊</span>
                    </div>
                    <h3 className="font-semibold text-gray-900">Freelance Pricing</h3>
                    <p className="text-sm text-gray-600">
                      Freelancers and consultants can use this to set competitive hourly rates based on desired annual income goals.
                    </p>
                  </div>
                  <div className="space-y-3">
                    <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                      <span className="text-orange-600 font-semibold">💰</span>
                    </div>
                    <h3 className="font-semibold text-gray-900">Budget Planning</h3>
                    <p className="text-sm text-gray-600">
                      Understand your true earning capacity for personal budgeting, loan applications, or financial planning purposes.
                    </p>
                  </div>
                  <div className="space-y-3">
                    <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                      <span className="text-red-600 font-semibold">🏛️</span>
                    </div>
                    <h3 className="font-semibold text-gray-900">HR & Payroll</h3>
                    <p className="text-sm text-gray-600">
                      Human resources professionals can use this for compensation analysis, payroll planning, and employee pay scale development.
                    </p>
                  </div>
                  <div className="space-y-3">
                    <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                      <span className="text-indigo-600 font-semibold">⚖️</span>
                    </div>
                    <h3 className="font-semibold text-gray-900">Legal & Compliance</h3>
                    <p className="text-sm text-gray-600">
                      Ensure compliance with minimum wage laws and fair labor standards when converting between salary and hourly rates.
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

            {/* FAQ Section */}
            <Card className="bg-white border-0 shadow-sm">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Frequently Asked Questions</h2>
                <div className="space-y-6">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">How do I convert salary to hourly rate?</h3>
                    <p className="text-gray-600">
                      Divide your annual salary by the total number of working hours in a year. For example: $50,000 ÷ (40 hours/week × 50 weeks) = $25/hour. Our calculator does this automatically and accounts for vacation time.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Should I include vacation time in my calculation?</h3>
                    <p className="text-gray-600">
                      Yes, you should subtract vacation weeks from your total working weeks. If you get 2 weeks of vacation, work 50 weeks instead of 52. This gives you a more accurate hourly rate.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Is the result before or after taxes?</h3>
                    <p className="text-gray-600">
                      The calculator shows gross pay (before taxes). Your actual take-home pay will be lower after federal taxes, state taxes, Social Security, Medicare, and other deductions.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">How accurate is the salary to hourly conversion?</h3>
                    <p className="text-gray-600">
                      Our calculator provides accurate conversions based on the information you provide. Results may vary slightly depending on actual hours worked, overtime, and company-specific policies.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Can I use this calculator for different countries?</h3>
                    <p className="text-gray-600">
                      Yes! Our calculator supports 12+ countries with their specific working hour standards and currencies, including the US, UK, Canada, Australia, Germany, France, and more.
                    </p>
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
}
