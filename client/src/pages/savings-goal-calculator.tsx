
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

interface SavingsResult {
  goalAmount: number;
  monthlyContribution: number;
  timeToReach: number;
  totalContributions: number;
  interestEarned: number;
  annualInterestRate: number;
  currency: string;
  calculationType: string;
}

export default function SavingsGoalCalculator() {
  const [calculationType, setCalculationType] = useState('time-to-save');
  
  // Time to Save inputs
  const [goalAmount, setGoalAmount] = useState('50000');
  const [monthlyContribution, setMonthlyContribution] = useState('500');
  const [annualInterestRate, setAnnualInterestRate] = useState('4.5');
  const [currentSavings, setCurrentSavings] = useState('5000');
  
  // Monthly Payment inputs
  const [paymentGoalAmount, setPaymentGoalAmount] = useState('25000');
  const [timeframe, setTimeframe] = useState('60');
  const [paymentInterestRate, setPaymentInterestRate] = useState('3.5');
  const [paymentCurrentSavings, setPaymentCurrentSavings] = useState('2000');
  
  // Target Amount inputs
  const [targetTimeframe, setTargetTimeframe] = useState('36');
  const [targetMonthlyContribution, setTargetMonthlyContribution] = useState('800');
  const [targetInterestRate, setTargetInterestRate] = useState('5.0');
  const [targetCurrentSavings, setTargetCurrentSavings] = useState('10000');
  
  const [currency, setCurrency] = useState('USD');
  const [country, setCountry] = useState('US');
  const [result, setResult] = useState<SavingsResult | null>(null);

  const countries = [
    { code: 'US', name: 'United States', currency: 'USD', avgSavingsRate: 4.5 },
    { code: 'CA', name: 'Canada', currency: 'CAD', avgSavingsRate: 3.8 },
    { code: 'UK', name: 'United Kingdom', currency: 'GBP', avgSavingsRate: 3.2 },
    { code: 'AU', name: 'Australia', currency: 'AUD', avgSavingsRate: 4.0 },
    { code: 'DE', name: 'Germany', currency: 'EUR', avgSavingsRate: 2.5 },
    { code: 'FR', name: 'France', currency: 'EUR', avgSavingsRate: 2.3 },
    { code: 'IT', name: 'Italy', currency: 'EUR', avgSavingsRate: 2.1 },
    { code: 'ES', name: 'Spain', currency: 'EUR', avgSavingsRate: 2.0 },
    { code: 'JP', name: 'Japan', currency: 'JPY', avgSavingsRate: 0.8 },
    { code: 'KR', name: 'South Korea', currency: 'KRW', avgSavingsRate: 2.5 },
    { code: 'IN', name: 'India', currency: 'INR', avgSavingsRate: 6.5 },
    { code: 'CN', name: 'China', currency: 'CNY', avgSavingsRate: 3.2 },
    { code: 'BR', name: 'Brazil', currency: 'BRL', avgSavingsRate: 8.5 },
    { code: 'MX', name: 'Mexico', currency: 'MXN', avgSavingsRate: 5.5 },
    { code: 'SG', name: 'Singapore', currency: 'SGD', avgSavingsRate: 3.5 },
    { code: 'NZ', name: 'New Zealand', currency: 'NZD', avgSavingsRate: 4.2 }
  ];

  const calculateSavings = () => {
    if (calculationType === 'time-to-save') {
      calculateTimeToSave();
    } else if (calculationType === 'monthly-payment') {
      calculateMonthlyPayment();
    } else {
      calculateTargetAmount();
    }
  };

  const calculateTimeToSave = () => {
    const goal = parseFloat(goalAmount);
    const monthly = parseFloat(monthlyContribution);
    const rate = parseFloat(annualInterestRate) / 100 / 12;
    const current = parseFloat(currentSavings);
    
    if (goal <= 0 || monthly <= 0) return;

    const remainingAmount = goal - current;
    
    if (remainingAmount <= 0) {
      setResult({
        goalAmount: goal,
        monthlyContribution: monthly,
        timeToReach: 0,
        totalContributions: 0,
        interestEarned: 0,
        annualInterestRate: parseFloat(annualInterestRate),
        currency,
        calculationType: 'time-to-save'
      });
      return;
    }

    let months: number;
    let totalContributions: number;
    let interestEarned: number;

    if (rate === 0) {
      months = remainingAmount / monthly;
      totalContributions = months * monthly;
      interestEarned = 0;
    } else {
      // Formula for compound interest with monthly contributions
      months = Math.log((goal * rate / monthly) + 1) / Math.log(1 + rate) - Math.log((current * rate / monthly) + 1) / Math.log(1 + rate);
      
      if (isNaN(months) || months < 0) {
        // Fallback calculation
        months = Math.log(1 + (remainingAmount * rate) / monthly) / Math.log(1 + rate);
      }
      
      totalContributions = months * monthly;
      interestEarned = goal - current - totalContributions;
    }

    setResult({
      goalAmount: goal,
      monthlyContribution: monthly,
      timeToReach: months,
      totalContributions,
      interestEarned: Math.max(0, interestEarned),
      annualInterestRate: parseFloat(annualInterestRate),
      currency,
      calculationType: 'time-to-save'
    });
  };

  const calculateMonthlyPayment = () => {
    const goal = parseFloat(paymentGoalAmount);
    const months = parseFloat(timeframe);
    const rate = parseFloat(paymentInterestRate) / 100 / 12;
    const current = parseFloat(paymentCurrentSavings);
    
    if (goal <= 0 || months <= 0) return;

    const remainingAmount = goal - current;
    let monthlyPayment: number;
    let interestEarned: number;

    if (rate === 0) {
      monthlyPayment = remainingAmount / months;
      interestEarned = 0;
    } else {
      // Calculate required monthly payment with compound interest
      monthlyPayment = (remainingAmount * rate) / (Math.pow(1 + rate, months) - 1);
      interestEarned = (monthlyPayment * months) - remainingAmount;
    }

    setResult({
      goalAmount: goal,
      monthlyContribution: monthlyPayment,
      timeToReach: months,
      totalContributions: monthlyPayment * months,
      interestEarned: Math.max(0, interestEarned),
      annualInterestRate: parseFloat(paymentInterestRate),
      currency,
      calculationType: 'monthly-payment'
    });
  };

  const calculateTargetAmount = () => {
    const months = parseFloat(targetTimeframe);
    const monthly = parseFloat(targetMonthlyContribution);
    const rate = parseFloat(targetInterestRate) / 100 / 12;
    const current = parseFloat(targetCurrentSavings);
    
    if (months <= 0 || monthly <= 0) return;

    let finalAmount: number;
    let totalContributions = monthly * months;
    let interestEarned: number;

    if (rate === 0) {
      finalAmount = current + totalContributions;
      interestEarned = 0;
    } else {
      // Future value with compound interest and monthly contributions
      const futureValueCurrent = current * Math.pow(1 + rate, months);
      const futureValueContributions = monthly * ((Math.pow(1 + rate, months) - 1) / rate);
      finalAmount = futureValueCurrent + futureValueContributions;
      interestEarned = finalAmount - current - totalContributions;
    }

    setResult({
      goalAmount: finalAmount,
      monthlyContribution: monthly,
      timeToReach: months,
      totalContributions,
      interestEarned: Math.max(0, interestEarned),
      annualInterestRate: parseFloat(targetInterestRate),
      currency,
      calculationType: 'target-amount'
    });
  };

  const resetCalculator = () => {
    setGoalAmount('50000');
    setMonthlyContribution('500');
    setAnnualInterestRate('4.5');
    setCurrentSavings('5000');
    setPaymentGoalAmount('25000');
    setTimeframe('60');
    setPaymentInterestRate('3.5');
    setPaymentCurrentSavings('2000');
    setTargetTimeframe('36');
    setTargetMonthlyContribution('800');
    setTargetInterestRate('5.0');
    setTargetCurrentSavings('10000');
    setCurrency('USD');
    setCountry('US');
    setResult(null);
  };

  const handleCountryChange = (newCountry: string) => {
    setCountry(newCountry);
    const countryData = countries.find(c => c.code === newCountry);
    if (countryData) {
      setCurrency(countryData.currency);
      setAnnualInterestRate(countryData.avgSavingsRate.toString());
      setPaymentInterestRate(countryData.avgSavingsRate.toString());
      setTargetInterestRate(countryData.avgSavingsRate.toString());
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
      KRW: { locale: 'ko-KR', currency: 'KRW' },
      INR: { locale: 'en-IN', currency: 'INR' },
      CNY: { locale: 'zh-CN', currency: 'CNY' },
      BRL: { locale: 'pt-BR', currency: 'BRL' },
      MXN: { locale: 'es-MX', currency: 'MXN' },
      SGD: { locale: 'en-SG', currency: 'SGD' },
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

  const formatTime = (months: number) => {
    const years = Math.floor(months / 12);
    const remainingMonths = Math.round(months % 12);
    
    if (years === 0) {
      return `${remainingMonths} month${remainingMonths !== 1 ? 's' : ''}`;
    } else if (remainingMonths === 0) {
      return `${years} year${years !== 1 ? 's' : ''}`;
    } else {
      return `${years} year${years !== 1 ? 's' : ''} and ${remainingMonths} month${remainingMonths !== 1 ? 's' : ''}`;
    }
  };

  const currentCountryData = countries.find(c => c.code === country) || countries[0];

  return (
    <>
      <Helmet>
        <title>Savings Goal Calculator - Plan & Achieve Financial Goals | DapsiWow</title>
        <meta name="description" content="Free savings goal calculator with compound interest projections. Calculate time to save, monthly payments required, and target amounts for emergency funds, retirement, vacations, and major purchases. Support for 16+ countries with accurate interest rates." />
        <meta name="keywords" content="savings goal calculator, financial planning tool, emergency fund calculator, retirement savings calculator, vacation fund planner, monthly savings calculator, compound interest calculator, savings tracker, financial goal planner, money saving calculator, savings projection calculator, budgeting tool, personal finance calculator, savings strategy planner, financial independence calculator" />
        <meta property="og:title" content="Savings Goal Calculator - Plan & Achieve Financial Goals | DapsiWow" />
        <meta property="og:description" content="Calculate exactly how to reach any savings goal with compound interest projections, flexible timeframes, and multi-currency support for global users." />
        <meta property="og:type" content="website" />
        <meta name="robots" content="index, follow" />
        <meta name="author" content="DapsiWow" />
        <link rel="canonical" href="https://dapsiwow.com/savings-goal-calculator" />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            "name": "Savings Goal Calculator",
            "description": "Calculate savings goals with compound interest projections, monthly contributions, and flexible timeframes for emergency funds, retirement, and major purchases.",
            "url": "https://dapsiwow.com/savings-goal-calculator",
            "applicationCategory": "FinanceApplication",
            "operatingSystem": "Any",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "USD"
            },
            "featureList": [
              "Multiple calculation modes (time to save, monthly payment, target amount)",
              "Compound interest projections",
              "Multi-currency support for 16+ countries",
              "Emergency fund planning",
              "Retirement savings calculations",
              "Vacation and major purchase planning",
              "Flexible timeframe options"
            ]
          })}
        </script>
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-green-50" data-testid="page-savings-goal-calculator">
        <Header />
        
        <main>
          {/* Hero Section */}
          <section className="relative py-20 sm:py-28 lg:py-32 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-green-600/20"></div>
            <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <div className="space-y-8">
                <div className="inline-flex items-center px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full border border-green-200">
                  <span className="text-sm font-medium text-green-700">Smart Savings Goal Calculator</span>
                </div>
                <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-slate-900 leading-tight">
                  Savings Goal
                  <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-green-600">
                    Calculator
                  </span>
                </h1>
                <p className="text-xl sm:text-2xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
                  Plan and achieve your financial goals with compound interest calculations and flexible savings strategies
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
                      <h2 className="text-3xl font-bold text-gray-900 mb-2">Savings Configuration</h2>
                      <p className="text-gray-600">Enter your savings details to calculate your personalized financial plan</p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Country Selection */}
                      <div className="space-y-3">
                        <Label htmlFor="country" className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                          Country
                        </Label>
                        <Select value={country} onValueChange={handleCountryChange}>
                          <SelectTrigger className="h-14 border-2 border-gray-200 rounded-xl text-lg" data-testid="select-country">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {countries.map((country) => (
                              <SelectItem key={country.code} value={country.code}>
                                {country.name} (Avg: {country.avgSavingsRate}%)
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Calculation Type */}
                      <div className="space-y-3">
                        <Label className="text-sm font-semibold text-gray-800 uppercase tracking-wide">Calculation Type</Label>
                        <Select value={calculationType} onValueChange={setCalculationType}>
                          <SelectTrigger className="h-14 border-2 border-gray-200 rounded-xl text-lg" data-testid="select-calculation-type">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="time-to-save">Time to Save</SelectItem>
                            <SelectItem value="monthly-payment">Monthly Payment</SelectItem>
                            <SelectItem value="target-amount">Target Amount</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Dynamic inputs based on calculation type */}
                      {calculationType === 'time-to-save' && (
                        <>
                          {/* Savings Goal */}
                          <div className="space-y-3">
                            <Label htmlFor="goal-amount" className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                              Savings Goal
                            </Label>
                            <div className="relative">
                              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-lg">$</span>
                              <Input
                                id="goal-amount"
                                type="number"
                                value={goalAmount}
                                onChange={(e) => setGoalAmount(e.target.value)}
                                className="h-14 pl-8 text-lg border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-green-500"
                                placeholder="50,000"
                                data-testid="input-goal-amount"
                              />
                            </div>
                          </div>

                          {/* Current Savings */}
                          <div className="space-y-3">
                            <Label htmlFor="current-savings" className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                              Current Savings
                            </Label>
                            <div className="relative">
                              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-lg">$</span>
                              <Input
                                id="current-savings"
                                type="number"
                                value={currentSavings}
                                onChange={(e) => setCurrentSavings(e.target.value)}
                                className="h-14 pl-8 text-lg border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-green-500"
                                placeholder="5,000"
                                data-testid="input-current-savings"
                              />
                            </div>
                          </div>

                          {/* Monthly Contribution */}
                          <div className="space-y-3">
                            <Label htmlFor="monthly-contribution" className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                              Monthly Contribution
                            </Label>
                            <div className="relative">
                              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-lg">$</span>
                              <Input
                                id="monthly-contribution"
                                type="number"
                                value={monthlyContribution}
                                onChange={(e) => setMonthlyContribution(e.target.value)}
                                className="h-14 pl-8 text-lg border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-green-500"
                                placeholder="500"
                                data-testid="input-monthly-contribution"
                              />
                            </div>
                          </div>

                          {/* Annual Interest Rate */}
                          <div className="space-y-3">
                            <Label htmlFor="interest-rate" className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                              Annual Interest Rate
                            </Label>
                            <div className="relative">
                              <Input
                                id="interest-rate"
                                type="number"
                                value={annualInterestRate}
                                onChange={(e) => setAnnualInterestRate(e.target.value)}
                                className="h-14 pr-8 text-lg border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-green-500"
                                placeholder="4.5"
                                step="0.01"
                                data-testid="input-interest-rate"
                              />
                              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 text-lg">%</span>
                            </div>
                          </div>
                        </>
                      )}

                      {calculationType === 'monthly-payment' && (
                        <>
                          {/* Savings Goal */}
                          <div className="space-y-3">
                            <Label htmlFor="payment-goal" className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                              Savings Goal
                            </Label>
                            <div className="relative">
                              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-lg">$</span>
                              <Input
                                id="payment-goal"
                                type="number"
                                value={paymentGoalAmount}
                                onChange={(e) => setPaymentGoalAmount(e.target.value)}
                                className="h-14 pl-8 text-lg border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-green-500"
                                placeholder="25,000"
                                data-testid="input-payment-goal"
                              />
                            </div>
                          </div>

                          {/* Current Savings */}
                          <div className="space-y-3">
                            <Label htmlFor="payment-current" className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                              Current Savings
                            </Label>
                            <div className="relative">
                              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-lg">$</span>
                              <Input
                                id="payment-current"
                                type="number"
                                value={paymentCurrentSavings}
                                onChange={(e) => setPaymentCurrentSavings(e.target.value)}
                                className="h-14 pl-8 text-lg border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-green-500"
                                placeholder="2,000"
                                data-testid="input-payment-current"
                              />
                            </div>
                          </div>

                          {/* Timeframe */}
                          <div className="space-y-3">
                            <Label htmlFor="timeframe" className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                              Timeframe (Months)
                            </Label>
                            <Input
                              id="timeframe"
                              type="number"
                              value={timeframe}
                              onChange={(e) => setTimeframe(e.target.value)}
                              className="h-14 text-lg border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-green-500"
                              placeholder="60"
                              min="1"
                              data-testid="input-timeframe"
                            />
                          </div>

                          {/* Annual Interest Rate */}
                          <div className="space-y-3">
                            <Label htmlFor="payment-rate" className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                              Annual Interest Rate
                            </Label>
                            <div className="relative">
                              <Input
                                id="payment-rate"
                                type="number"
                                value={paymentInterestRate}
                                onChange={(e) => setPaymentInterestRate(e.target.value)}
                                className="h-14 pr-8 text-lg border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-green-500"
                                placeholder="3.5"
                                step="0.01"
                                data-testid="input-payment-rate"
                              />
                              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 text-lg">%</span>
                            </div>
                          </div>
                        </>
                      )}

                      {calculationType === 'target-amount' && (
                        <>
                          {/* Current Savings */}
                          <div className="space-y-3">
                            <Label htmlFor="target-current" className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                              Current Savings
                            </Label>
                            <div className="relative">
                              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-lg">$</span>
                              <Input
                                id="target-current"
                                type="number"
                                value={targetCurrentSavings}
                                onChange={(e) => setTargetCurrentSavings(e.target.value)}
                                className="h-14 pl-8 text-lg border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-green-500"
                                placeholder="10,000"
                                data-testid="input-target-current"
                              />
                            </div>
                          </div>

                          {/* Monthly Contribution */}
                          <div className="space-y-3">
                            <Label htmlFor="target-monthly" className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                              Monthly Contribution
                            </Label>
                            <div className="relative">
                              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-lg">$</span>
                              <Input
                                id="target-monthly"
                                type="number"
                                value={targetMonthlyContribution}
                                onChange={(e) => setTargetMonthlyContribution(e.target.value)}
                                className="h-14 pl-8 text-lg border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-green-500"
                                placeholder="800"
                                data-testid="input-target-monthly"
                              />
                            </div>
                          </div>

                          {/* Timeframe */}
                          <div className="space-y-3">
                            <Label htmlFor="target-timeframe" className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                              Timeframe (Months)
                            </Label>
                            <Input
                              id="target-timeframe"
                              type="number"
                              value={targetTimeframe}
                              onChange={(e) => setTargetTimeframe(e.target.value)}
                              className="h-14 text-lg border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-green-500"
                              placeholder="36"
                              min="1"
                              data-testid="input-target-timeframe"
                            />
                          </div>

                          {/* Annual Interest Rate */}
                          <div className="space-y-3">
                            <Label htmlFor="target-rate" className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                              Annual Interest Rate
                            </Label>
                            <div className="relative">
                              <Input
                                id="target-rate"
                                type="number"
                                value={targetInterestRate}
                                onChange={(e) => setTargetInterestRate(e.target.value)}
                                className="h-14 pr-8 text-lg border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-green-500"
                                placeholder="5.0"
                                step="0.01"
                                data-testid="input-target-rate"
                              />
                              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 text-lg">%</span>
                            </div>
                          </div>
                        </>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4 pt-6">
                      <Button
                        onClick={calculateSavings}
                        className="flex-1 h-14 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white font-semibold text-lg rounded-xl shadow-lg transform transition-all duration-200 hover:scale-105"
                        data-testid="button-calculate"
                      >
                        Calculate Savings Plan
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
                  <div className="bg-gradient-to-br from-green-50 to-blue-50 p-8 lg:p-12">
                    <div className="sticky top-8">
                      <h3 className="text-2xl font-bold text-gray-900 mb-6">Savings Analysis</h3>
                      
                      {!result ? (
                        <div className="text-center py-12">
                          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <div className="w-12 h-12 bg-green-200 rounded-full"></div>
                          </div>
                          <p className="text-gray-600 text-lg">
                            Enter your savings details and click "Calculate Savings Plan" to see your personalized strategy
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-6">
                          {/* Key Results */}
                          <div className="bg-white rounded-2xl p-6 shadow-sm">
                            <div className="grid grid-cols-1 gap-4">
                              <div className="text-center">
                                <div className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-2">
                                  {result.calculationType === 'time-to-save' ? 'Time to Reach Goal' : 
                                   result.calculationType === 'monthly-payment' ? 'Monthly Payment Required' : 'Target Amount'}
                                </div>
                                <div className="text-3xl font-bold text-green-600" data-testid="result-primary">
                                  {result.calculationType === 'time-to-save' ? formatTime(result.timeToReach) :
                                   result.calculationType === 'monthly-payment' ? formatCurrency(result.monthlyContribution) :
                                   formatCurrency(result.goalAmount)}
                                </div>
                              </div>
                              <div className="text-center">
                                <div className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-2">Interest Earned</div>
                                <div className="text-2xl font-bold text-blue-600" data-testid="result-interest">
                                  {formatCurrency(result.interestEarned)}
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Detailed Breakdown */}
                          <div className="bg-white rounded-2xl p-6 shadow-sm space-y-4">
                            <h4 className="font-bold text-gray-900 text-lg">Plan Details</h4>
                            
                            <div className="space-y-3">
                              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                                <span className="text-gray-600">Goal Amount</span>
                                <span className="font-semibold" data-testid="result-goal-amount">
                                  {formatCurrency(result.goalAmount)}
                                </span>
                              </div>
                              
                              {result.calculationType !== 'monthly-payment' && (
                                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                                  <span className="text-gray-600">Monthly Contribution</span>
                                  <span className="font-semibold" data-testid="result-monthly-contribution">
                                    {formatCurrency(result.monthlyContribution)}
                                  </span>
                                </div>
                              )}
                              
                              {result.calculationType !== 'time-to-save' && (
                                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                                  <span className="text-gray-600">Time Period</span>
                                  <span className="font-semibold" data-testid="result-time-period">
                                    {formatTime(result.timeToReach)}
                                  </span>
                                </div>
                              )}
                              
                              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                                <span className="text-gray-600">Total Contributions</span>
                                <span className="font-semibold" data-testid="result-total-contributions">
                                  {formatCurrency(result.totalContributions)}
                                </span>
                              </div>
                              
                              <div className="flex justify-between items-center py-2">
                                <span className="text-gray-600">Annual Interest Rate</span>
                                <span className="font-semibold" data-testid="result-annual-rate">
                                  {result.annualInterestRate.toFixed(2)}%
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Savings Summary */}
                          <div className="bg-gradient-to-r from-green-500 to-blue-500 rounded-2xl p-6 text-white">
                            <h4 className="font-bold text-lg mb-3">Savings Summary</h4>
                            <p className="text-green-100 leading-relaxed text-sm">
                              {result.calculationType === 'time-to-save' && 
                                `By saving ${formatCurrency(result.monthlyContribution)} monthly at ${result.annualInterestRate.toFixed(2)}% annual interest, you'll reach your goal of ${formatCurrency(result.goalAmount)} in ${formatTime(result.timeToReach)}. Your total contributions will be ${formatCurrency(result.totalContributions)} and you'll earn ${formatCurrency(result.interestEarned)} in interest.`
                              }
                              {result.calculationType === 'monthly-payment' && 
                                `To reach your goal of ${formatCurrency(result.goalAmount)} in ${formatTime(result.timeToReach)}, you need to save ${formatCurrency(result.monthlyContribution)} monthly. Your total contributions will be ${formatCurrency(result.totalContributions)} and you'll earn ${formatCurrency(result.interestEarned)} in interest.`
                              }
                              {result.calculationType === 'target-amount' && 
                                `By saving ${formatCurrency(result.monthlyContribution)} monthly for ${formatTime(result.timeToReach)} at ${result.annualInterestRate.toFixed(2)}% annual interest, you'll accumulate ${formatCurrency(result.goalAmount)}. Your total contributions will be ${formatCurrency(result.totalContributions)} and you'll earn ${formatCurrency(result.interestEarned)} in interest.`
                              }
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* SEO Content Section */}
          <section className="py-16 bg-white">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="prose prose-lg max-w-none">
                <h2 className="text-3xl font-bold text-gray-900 mb-8">Master Your Financial Future with Smart Savings Planning</h2>
                
                <p className="text-lg text-gray-700 mb-6">
                  Building wealth and achieving financial goals requires more than just good intentions—it demands strategic planning, disciplined execution, and the right tools to calculate your path to success. Our comprehensive savings goal calculator empowers you to create precise financial plans that turn your dreams into achievable milestones.
                </p>

                <h3 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Understanding the Power of Compound Interest</h3>
                <p className="text-gray-700 mb-4">
                  The foundation of successful saving lies in understanding compound interest—often called the eighth wonder of the world. When you save money in interest-bearing accounts, you earn returns not just on your initial deposits, but also on the accumulated interest from previous periods. This compounding effect accelerates your wealth building significantly over time.
                </p>
                <p className="text-gray-700 mb-6">
                  Our calculator factors in compound interest calculations to show you the true potential of consistent saving habits. Even modest monthly contributions can grow into substantial sums when given enough time and favorable interest rates. This mathematical principle is why starting early with your savings goals is so crucial for long-term financial success.
                </p>

                <h3 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Three Powerful Calculation Methods for Every Financial Goal</h3>
                
                <h4 className="text-xl font-semibold text-gray-900 mt-6 mb-3">Time to Save Calculator</h4>
                <p className="text-gray-700 mb-4">
                  Perfect for when you know your target amount and monthly contribution capacity. This mode answers the crucial question: "How long will it take to reach my goal?" Whether you're saving for a vacation, emergency fund, or major purchase, this calculation helps you set realistic timelines and maintain motivation throughout your savings journey.
                </p>

                <h4 className="text-xl font-semibold text-gray-900 mt-6 mb-3">Monthly Payment Calculator</h4>
                <p className="text-gray-700 mb-4">
                  Ideal for deadline-driven goals where you have a specific timeframe. This calculation determines exactly how much you need to save monthly to reach your target by a certain date. Essential for planning weddings, down payments, or any goal with a fixed timeline.
                </p>

                <h4 className="text-xl font-semibold text-gray-900 mt-6 mb-3">Target Amount Calculator</h4>
                <p className="text-gray-700 mb-6">
                  Best for exploring your savings potential with current resources. Input your available monthly contribution and timeframe to discover how much wealth you can accumulate. This mode is excellent for retirement planning and long-term wealth building strategies.
                </p>

                <h3 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Strategic Applications for Life's Major Financial Goals</h3>
                
                <h4 className="text-xl font-semibold text-gray-900 mt-6 mb-3">Emergency Fund Planning</h4>
                <p className="text-gray-700 mb-4">
                  Financial experts recommend maintaining 3-6 months of living expenses in an emergency fund. Use our calculator to determine how long it will take to build this crucial financial safety net based on your monthly savings capacity. Factor in current high-yield savings account rates to see how interest can help accelerate your emergency fund growth.
                </p>

                <h4 className="text-xl font-semibold text-gray-900 mt-6 mb-3">Retirement Savings Optimization</h4>
                <p className="text-gray-700 mb-4">
                  Retirement planning requires decades of consistent saving and the power of compound growth. Our calculator helps you understand how different contribution levels and interest rates impact your retirement nest egg. Experiment with various scenarios to find the optimal balance between current lifestyle and future security.
                </p>

                <h4 className="text-xl font-semibold text-gray-900 mt-6 mb-3">Home Down Payment Strategy</h4>
                <p className="text-gray-700 mb-4">
                  Purchasing a home typically requires a substantial down payment, often 10-20% of the purchase price. Calculate how long it will take to save for your dream home, or determine the monthly savings needed to reach your down payment goal by your target purchase date.
                </p>

                <h4 className="text-xl font-semibold text-gray-900 mt-6 mb-3">Education and Career Investment</h4>
                <p className="text-gray-700 mb-6">
                  Whether saving for your children's education or your own professional development, education expenses require substantial planning. Use our calculator to create funding strategies for tuition, training programs, or certification courses that advance your career prospects.
                </p>

                <h3 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Global Financial Planning with Multi-Currency Support</h3>
                <p className="text-gray-700 mb-4">
                  Our calculator supports savings planning for users worldwide, with localized currency formatting and country-specific average interest rates. Understanding how interest rates vary by country helps you make informed decisions about where to save and how economic conditions impact your financial planning.
                </p>
                <p className="text-gray-700 mb-6">
                  From the low interest rate environments in Japan and Europe to higher-yield opportunities in emerging markets, global economic factors significantly influence savings growth. Our tool incorporates these real-world variations to provide accurate projections for international users.
                </p>

                <h3 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Advanced Savings Strategies and Tips</h3>
                
                <h4 className="text-xl font-semibold text-gray-900 mt-6 mb-3">The Power of Automation</h4>
                <p className="text-gray-700 mb-4">
                  Successful savers automate their contributions to remove the temptation to spend money intended for savings. Set up automatic transfers from your checking account to dedicated savings accounts immediately after payday. This "pay yourself first" approach ensures consistent progress toward your goals.
                </p>

                <h4 className="text-xl font-semibold text-gray-900 mt-6 mb-3">Optimizing Interest Rates</h4>
                <p className="text-gray-700 mb-4">
                  Small differences in interest rates compound dramatically over time. Research high-yield savings accounts, money market accounts, and certificates of deposit to maximize your earnings. Even a 1% difference in annual interest rate can result in thousands of additional dollars over a multi-year savings period.
                </p>

                <h4 className="text-xl font-semibold text-gray-900 mt-6 mb-3">Progressive Savings Increases</h4>
                <p className="text-gray-700 mb-6">
                  As your income grows through raises and career advancement, increase your savings contributions proportionally. This strategy accelerates goal achievement without impacting your lifestyle significantly. Many successful savers commit to saving 50% of any income increase.
                </p>

                <h3 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Behavioral Psychology of Successful Saving</h3>
                <p className="text-gray-700 mb-4">
                  Understanding the psychological aspects of money management is crucial for long-term success. Break large goals into smaller milestones to maintain motivation and celebrate progress. Visual progress tracking, whether through apps or simple charts, reinforces positive saving behaviors.
                </p>
                <p className="text-gray-700 mb-4">
                  Create separate savings accounts for different goals to avoid the temptation of borrowing from one goal to fund another. This mental accounting strategy helps maintain focus and prevents savings goal confusion.
                </p>
                <p className="text-gray-700 mb-6">
                  Consider the opportunity cost of purchases against your savings goals. Before making discretionary purchases, calculate how that money could grow if invested in your savings plan instead. This mental exercise often leads to better spending decisions and faster goal achievement.
                </p>

                <h3 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Take Control of Your Financial Destiny</h3>
                <p className="text-gray-700 mb-4">
                  Financial freedom isn't achieved overnight—it's the result of consistent actions taken over time with clear goals and strategic planning. Our savings goal calculator provides the mathematical foundation for your financial decisions, but success ultimately depends on your commitment to the plan.
                </p>
                <p className="text-gray-700">
                  Start today by setting specific, measurable savings goals and using our calculator to create your roadmap to financial success. Remember that every dollar saved and every day started early significantly impacts your long-term wealth building potential. Your future self will thank you for the disciplined actions you take today.
                </p>
              </div>
            </div>
          </section>
        </main>
        
        <Footer />
      </div>
    </>
  );
}
