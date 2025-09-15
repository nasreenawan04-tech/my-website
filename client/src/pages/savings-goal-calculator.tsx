
import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

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
  const [result, setResult] = useState<SavingsResult | null>(null);

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
      months = Math.log(1 + (remainingAmount * rate) / monthly) / Math.log(1 + rate);
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
    setResult(null);
  };

  const formatCurrency = (amount: number) => {
    const currencyMap: { [key: string]: { locale: string; currency: string } } = {
      USD: { locale: 'en-US', currency: 'USD' },
      EUR: { locale: 'de-DE', currency: 'EUR' },
      GBP: { locale: 'en-GB', currency: 'GBP' },
      INR: { locale: 'en-IN', currency: 'INR' },
      JPY: { locale: 'ja-JP', currency: 'JPY' },
      CAD: { locale: 'en-CA', currency: 'CAD' },
      AUD: { locale: 'en-AU', currency: 'AUD' },
      CNY: { locale: 'zh-CN', currency: 'CNY' },
      BRL: { locale: 'pt-BR', currency: 'BRL' },
      MXN: { locale: 'es-MX', currency: 'MXN' }
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Helmet>
        <title>Savings Goal Calculator - Calculate Time to Reach Financial Goals | DapsiWow</title>
        <meta name="description" content="Free savings goal calculator to plan your financial future. Calculate time to save, monthly payments required, and target amounts with compound interest projections. Support for multiple currencies and savings strategies." />
        <meta name="keywords" content="savings goal calculator, financial planning calculator, savings planner, compound interest calculator, emergency fund calculator, retirement savings calculator, vacation fund planner, down payment calculator, savings strategy tool, financial goal planner" />
        <meta property="og:title" content="Savings Goal Calculator - Calculate Time to Reach Financial Goals | DapsiWow" />
        <meta property="og:description" content="Plan and achieve your savings goals with our free calculator. Get compound interest projections and flexible savings strategies for any financial target." />
        <meta property="og:type" content="website" />
        <meta name="robots" content="index, follow" />
        <meta name="author" content="DapsiWow" />
        <link rel="canonical" href="https://dapsiwow.com/tools/savings-goal-calculator" />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            "name": "Savings Goal Calculator",
            "description": "Free online savings goal calculator to plan and track financial goals with compound interest calculations and flexible timeframes.",
            "url": "https://dapsiwow.com/tools/savings-goal-calculator",
            "applicationCategory": "FinanceApplication",
            "operatingSystem": "Any",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "USD"
            },
            "featureList": [
              "Calculate time to reach savings goals",
              "Determine monthly payment requirements",
              "Project target amounts with compound interest",
              "Multiple currency support",
              "Emergency fund planning",
              "Retirement savings calculations"
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
                <span className="text-sm font-medium text-blue-700">Advanced Savings Goal Calculator</span>
              </div>
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-slate-900 leading-tight">
                Smart Savings
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                  Goal Calculator
                </span>
              </h1>
              <p className="text-xl sm:text-2xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
                Plan and achieve your financial goals with compound interest calculations and strategic savings planning
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
                    <p className="text-gray-600">Enter your financial details to create your personalized savings plan</p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Currency Selection */}
                    <div className="space-y-3">
                      <Label htmlFor="currency" className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                        Currency
                      </Label>
                      <Select value={currency} onValueChange={setCurrency}>
                        <SelectTrigger className="h-14 border-2 border-gray-200 rounded-xl text-lg" data-testid="select-currency">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="USD">USD - US Dollar</SelectItem>
                          <SelectItem value="EUR">EUR - Euro</SelectItem>
                          <SelectItem value="GBP">GBP - British Pound</SelectItem>
                          <SelectItem value="INR">INR - Indian Rupee</SelectItem>
                          <SelectItem value="JPY">JPY - Japanese Yen</SelectItem>
                          <SelectItem value="CAD">CAD - Canadian Dollar</SelectItem>
                          <SelectItem value="AUD">AUD - Australian Dollar</SelectItem>
                          <SelectItem value="CNY">CNY - Chinese Yuan</SelectItem>
                          <SelectItem value="BRL">BRL - Brazilian Real</SelectItem>
                          <SelectItem value="MXN">MXN - Mexican Peso</SelectItem>
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
                              className="h-14 pl-8 text-lg border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-blue-500"
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
                              className="h-14 pl-8 text-lg border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-blue-500"
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
                              className="h-14 pl-8 text-lg border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-blue-500"
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
                              className="h-14 pr-8 text-lg border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-blue-500"
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
                              className="h-14 pl-8 text-lg border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-blue-500"
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
                              className="h-14 pl-8 text-lg border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-blue-500"
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
                            className="h-14 text-lg border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-blue-500"
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
                              className="h-14 pr-8 text-lg border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-blue-500"
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
                              className="h-14 pl-8 text-lg border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-blue-500"
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
                              className="h-14 pl-8 text-lg border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-blue-500"
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
                            className="h-14 text-lg border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-blue-500"
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
                              className="h-14 pr-8 text-lg border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-blue-500"
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
                      className="flex-1 h-14 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold text-lg rounded-xl shadow-lg transform transition-all duration-200 hover:scale-105"
                      data-testid="button-calculate"
                    >
                      Calculate Savings Goal
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
                <div className="bg-gradient-to-br from-gray-50 to-blue-50 p-8 lg:p-12">
                  <h2 className="text-2xl font-bold text-gray-900 mb-8">Savings Analysis</h2>
                  
                  {result ? (
                    <div className="space-y-6" data-testid="savings-results">
                      {/* Primary Result Highlight */}
                      <div className="bg-white rounded-2xl p-6 shadow-lg border border-blue-100">
                        <div className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-2">
                          {result.calculationType === 'time-to-save' ? 'Time to Reach Goal' : 
                           result.calculationType === 'monthly-payment' ? 'Monthly Payment Required' : 'Target Amount'}
                        </div>
                        <div className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600" data-testid="text-primary-result">
                          {result.calculationType === 'time-to-save' ? formatTime(result.timeToReach) :
                           result.calculationType === 'monthly-payment' ? formatCurrency(result.monthlyContribution) :
                           formatCurrency(result.goalAmount)}
                        </div>
                      </div>

                      {/* Financial Breakdown */}
                      <div className="space-y-4">
                        <div className="bg-white rounded-xl p-4 shadow-sm">
                          <div className="flex justify-between items-center">
                            <span className="font-medium text-gray-700">Goal Amount</span>
                            <span className="font-bold text-gray-900" data-testid="text-goal-amount">
                              {formatCurrency(result.goalAmount)}
                            </span>
                          </div>
                        </div>
                        <div className="bg-white rounded-xl p-4 shadow-sm">
                          <div className="flex justify-between items-center">
                            <span className="font-medium text-gray-700">Total Contributions</span>
                            <span className="font-bold text-blue-600" data-testid="text-total-contributions">
                              {formatCurrency(result.totalContributions)}
                            </span>
                          </div>
                        </div>
                        <div className="bg-white rounded-xl p-4 shadow-sm">
                          <div className="flex justify-between items-center">
                            <span className="font-medium text-gray-700">Interest Earned</span>
                            <span className="font-bold text-green-600" data-testid="text-interest-earned">
                              {formatCurrency(result.interestEarned)}
                            </span>
                          </div>
                        </div>
                        <div className="bg-white rounded-xl p-4 shadow-sm">
                          <div className="flex justify-between items-center">
                            <span className="font-medium text-gray-700">Annual Interest Rate</span>
                            <span className="font-bold text-gray-900" data-testid="text-annual-rate">
                              {result.annualInterestRate.toFixed(2)}%
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Savings Summary */}
                      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
                        <h4 className="font-bold text-blue-800 mb-4 text-lg">Savings Summary</h4>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-blue-700 font-medium">Monthly Contribution:</span>
                            <span className="font-bold text-blue-800 text-lg">
                              {formatCurrency(result.monthlyContribution)}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-blue-700 font-medium">Time Period:</span>
                            <span className="font-bold text-blue-800 text-lg">
                              {formatTime(result.timeToReach)}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-blue-700 font-medium">Interest Growth:</span>
                            <span className="font-bold text-blue-800 text-lg">
                              {((result.interestEarned / result.totalContributions) * 100).toFixed(1)}%
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-16" data-testid="no-results">
                      <div className="w-20 h-20 bg-gray-200 rounded-full mx-auto mb-6 flex items-center justify-center">
                        <div className="text-3xl font-bold text-gray-400">$</div>
                      </div>
                      <p className="text-gray-500 text-lg">Enter savings details and calculate to see your financial plan</p>
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
                <h3 className="text-2xl font-bold text-gray-900 mb-6">What is a Savings Goal Calculator?</h3>
                <div className="space-y-4 text-gray-600">
                  <p>
                    A savings goal calculator is a powerful financial planning tool that helps you determine exactly how to achieve 
                    your savings objectives. Whether you're planning for an emergency fund, vacation, home down payment, or retirement, 
                    this calculator provides precise projections based on your current financial situation and savings capacity.
                  </p>
                  <p>
                    Our advanced calculator factors in compound interest growth, showing how your money grows over time through both 
                    monthly contributions and earned interest. This mathematical approach gives you realistic timelines and payment 
                    requirements to reach any financial goal.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Three Calculation Modes</h3>
                <div className="space-y-4 text-gray-600">
                  <div className="border-l-4 border-blue-500 pl-4">
                    <h4 className="font-semibold text-gray-800 mb-2">Time to Save</h4>
                    <p className="text-sm">Calculate how long it takes to reach your goal with a specific monthly contribution amount.</p>
                  </div>
                  <div className="border-l-4 border-green-500 pl-4">
                    <h4 className="font-semibold text-gray-800 mb-2">Monthly Payment</h4>
                    <p className="text-sm">Determine the monthly amount needed to reach your goal within a specific timeframe.</p>
                  </div>
                  <div className="border-l-4 border-purple-500 pl-4">
                    <h4 className="font-semibold text-gray-800 mb-2">Target Amount</h4>
                    <p className="text-sm">Project how much you'll accumulate with specific monthly contributions over time.</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Popular Savings Goals</h3>
                <div className="space-y-3 text-gray-600">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Emergency fund (3-6 months of expenses)</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Home down payment (10-20% of home price)</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Vacation and travel funds</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Car purchase or replacement</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Education and training expenses</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Benefits of Our Calculator</h3>
                <div className="space-y-3 text-gray-600">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Compound interest calculations for accurate projections</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Multiple currency support for global users</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Flexible calculation modes for different scenarios</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Detailed breakdown of contributions vs interest</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Free to use with no registration required</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Comprehensive SEO Content Sections */}
          <div className="mt-12 space-y-8">
            {/* Understanding Compound Interest */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Understanding the Power of Compound Interest</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-gray-800">How Compound Interest Works</h4>
                    <p className="text-gray-600">
                      Compound interest is the foundation of wealth building, where you earn returns not just on your initial 
                      principal, but also on the accumulated interest from previous periods. This exponential growth effect 
                      can dramatically accelerate your savings progress over time.
                    </p>
                    <div className="bg-blue-50 rounded-lg p-4">
                      <h5 className="font-semibold text-blue-800 mb-2">Example Scenario</h5>
                      <p className="text-blue-700 text-sm">
                        Saving $500 monthly at 5% annual interest will accumulate $63,000 in 10 years, with $3,000 coming 
                        from compound interest growth - money earned on your money!
                      </p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-gray-800">Maximizing Interest Growth</h4>
                    <div className="space-y-3">
                      <div className="border-l-4 border-green-500 pl-4">
                        <h5 className="font-semibold text-gray-800 text-sm">Start Early</h5>
                        <p className="text-gray-600 text-sm">Time is your greatest asset - even small amounts saved early can outperform larger amounts saved later.</p>
                      </div>
                      <div className="border-l-4 border-blue-500 pl-4">
                        <h5 className="font-semibold text-gray-800 text-sm">Consistent Contributions</h5>
                        <p className="text-gray-600 text-sm">Regular monthly savings create momentum and take advantage of dollar-cost averaging.</p>
                      </div>
                      <div className="border-l-4 border-purple-500 pl-4">
                        <h5 className="font-semibold text-gray-800 text-sm">Higher Interest Rates</h5>
                        <p className="text-gray-600 text-sm">Shop for high-yield savings accounts, CDs, or investment options to maximize your growth potential.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Strategic Savings Planning */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Strategic Savings Planning for Different Goals</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="bg-green-50 rounded-xl p-6">
                    <h4 className="text-lg font-bold text-green-800 mb-4">Emergency Fund</h4>
                    <div className="space-y-3 text-green-700">
                      <p className="text-sm"><strong>Target:</strong> 3-6 months of living expenses</p>
                      <p className="text-sm"><strong>Priority:</strong> High liquidity, low risk</p>
                      <p className="text-sm"><strong>Account:</strong> High-yield savings account</p>
                      <p className="text-sm"><strong>Timeline:</strong> 1-2 years for most people</p>
                    </div>
                  </div>
                  
                  <div className="bg-blue-50 rounded-xl p-6">
                    <h4 className="text-lg font-bold text-blue-800 mb-4">Home Down Payment</h4>
                    <div className="space-y-3 text-blue-700">
                      <p className="text-sm"><strong>Target:</strong> 10-20% of home purchase price</p>
                      <p className="text-sm"><strong>Priority:</strong> Capital preservation</p>
                      <p className="text-sm"><strong>Account:</strong> CDs or money market accounts</p>
                      <p className="text-sm"><strong>Timeline:</strong> 2-5 years typically</p>
                    </div>
                  </div>
                  
                  <div className="bg-purple-50 rounded-xl p-6">
                    <h4 className="text-lg font-bold text-purple-800 mb-4">Retirement Savings</h4>
                    <div className="space-y-3 text-purple-700">
                      <p className="text-sm"><strong>Target:</strong> 10-15x annual income</p>
                      <p className="text-sm"><strong>Priority:</strong> Long-term growth</p>
                      <p className="text-sm"><strong>Account:</strong> 401(k), IRA, investment accounts</p>
                      <p className="text-sm"><strong>Timeline:</strong> 20-40 years</p>
                    </div>
                  </div>
                  
                  <div className="bg-orange-50 rounded-xl p-6">
                    <h4 className="text-lg font-bold text-orange-800 mb-4">Vacation Fund</h4>
                    <div className="space-y-3 text-orange-700">
                      <p className="text-sm"><strong>Target:</strong> Trip cost plus 20% buffer</p>
                      <p className="text-sm"><strong>Priority:</strong> Moderate growth, accessibility</p>
                      <p className="text-sm"><strong>Account:</strong> High-yield savings</p>
                      <p className="text-sm"><strong>Timeline:</strong> 6 months to 2 years</p>
                    </div>
                  </div>
                  
                  <div className="bg-red-50 rounded-xl p-6">
                    <h4 className="text-lg font-bold text-red-800 mb-4">Education Fund</h4>
                    <div className="space-y-3 text-red-700">
                      <p className="text-sm"><strong>Target:</strong> Estimated tuition costs</p>
                      <p className="text-sm"><strong>Priority:</strong> Tax-advantaged growth</p>
                      <p className="text-sm"><strong>Account:</strong> 529 plans, Coverdell ESA</p>
                      <p className="text-sm"><strong>Timeline:</strong> 5-18 years</p>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 rounded-xl p-6">
                    <h4 className="text-lg font-bold text-gray-800 mb-4">Car Purchase</h4>
                    <div className="space-y-3 text-gray-700">
                      <p className="text-sm"><strong>Target:</strong> Vehicle price plus taxes/fees</p>
                      <p className="text-sm"><strong>Priority:</strong> Principal protection</p>
                      <p className="text-sm"><strong>Account:</strong> Savings account or short-term CD</p>
                      <p className="text-sm"><strong>Timeline:</strong> 1-3 years</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Savings Account Types */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
                <CardContent className="p-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">Choosing the Right Savings Account</h3>
                  <div className="space-y-4">
                    <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-lg">
                      <h4 className="font-semibold text-blue-800 mb-2">High-Yield Savings Account</h4>
                      <p className="text-blue-700 text-sm">
                        Best for emergency funds and short-term goals. Offers 10-20x higher interest than traditional savings 
                        with full liquidity and FDIC protection up to $250,000.
                      </p>
                    </div>
                    <div className="bg-green-50 border-l-4 border-green-400 p-4 rounded-r-lg">
                      <h4 className="font-semibold text-green-800 mb-2">Certificates of Deposit (CDs)</h4>
                      <p className="text-green-700 text-sm">
                        Ideal for medium-term goals with fixed timelines. Offers guaranteed returns higher than savings 
                        accounts but requires locking up funds for specific periods.
                      </p>
                    </div>
                    <div className="bg-purple-50 border-l-4 border-purple-400 p-4 rounded-r-lg">
                      <h4 className="font-semibold text-purple-800 mb-2">Money Market Accounts</h4>
                      <p className="text-purple-700 text-sm">
                        Combines higher interest rates with limited check-writing privileges. Good for larger balances 
                        and goals requiring occasional access to funds.
                      </p>
                    </div>
                    <div className="bg-orange-50 border-l-4 border-orange-400 p-4 rounded-r-lg">
                      <h4 className="font-semibold text-orange-800 mb-2">Investment Accounts</h4>
                      <p className="text-orange-700 text-sm">
                        Best for long-term goals like retirement. Offers highest growth potential through stocks, bonds, 
                        and mutual funds but comes with market risk and volatility.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
                <CardContent className="p-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">Savings Strategies That Work</h3>
                  <div className="space-y-4">
                    <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-4">
                      <h4 className="font-semibold text-blue-800 mb-2">Pay Yourself First</h4>
                      <p className="text-blue-700 text-sm">
                        Automatically transfer a fixed amount to savings immediately after receiving income. This ensures 
                        savings happen before discretionary spending can interfere with your goals.
                      </p>
                    </div>
                    <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-lg p-4">
                      <h4 className="font-semibold text-green-800 mb-2">The 50/30/20 Rule</h4>
                      <p className="text-green-700 text-sm">
                        Allocate 50% of income to needs, 30% to wants, and 20% to savings and debt repayment. This balanced 
                        approach ensures consistent savings while maintaining lifestyle flexibility.
                      </p>
                    </div>
                    <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg p-4">
                      <h4 className="font-semibold text-purple-800 mb-2">Increase Savings with Income</h4>
                      <p className="text-purple-700 text-sm">
                        Commit to saving 50% of any salary increases, bonuses, or windfalls. This allows lifestyle 
                        improvements while accelerating savings growth without feeling constrained.
                      </p>
                    </div>
                    <div className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-lg p-4">
                      <h4 className="font-semibold text-orange-800 mb-2">Separate Accounts for Goals</h4>
                      <p className="text-orange-700 text-sm">
                        Create dedicated savings accounts for each major goal. This mental accounting prevents 
                        goal confusion and reduces temptation to borrow from one goal to fund another.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Advanced Savings Tips */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Advanced Savings Optimization Techniques</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-gray-800">Tax-Advantaged Savings</h4>
                    <div className="space-y-3">
                      <div className="bg-green-50 rounded-lg p-4">
                        <h5 className="font-semibold text-green-800 mb-2">401(k) and IRA Contributions</h5>
                        <p className="text-green-700 text-sm">
                          Maximize tax-deferred retirement savings. For 2024, contribute up to $23,000 to 401(k) 
                          and $7,000 to IRA (additional catch-up contributions if over 50).
                        </p>
                      </div>
                      <div className="bg-blue-50 rounded-lg p-4">
                        <h5 className="font-semibold text-blue-800 mb-2">HSA Triple Tax Advantage</h5>
                        <p className="text-blue-700 text-sm">
                          Health Savings Accounts offer tax deductions, tax-free growth, and tax-free withdrawals 
                          for qualified medical expenses. After age 65, functions like traditional IRA.
                        </p>
                      </div>
                      <div className="bg-purple-50 rounded-lg p-4">
                        <h5 className="font-semibold text-purple-800 mb-2">529 Education Plans</h5>
                        <p className="text-purple-700 text-sm">
                          State-sponsored education savings with tax-free growth and withdrawals for qualified 
                          education expenses. Many states offer tax deductions for contributions.
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-gray-800">Behavioral Psychology Tips</h4>
                    <div className="space-y-3">
                      <div className="bg-orange-50 rounded-lg p-4">
                        <h5 className="font-semibold text-orange-800 mb-2">Visual Progress Tracking</h5>
                        <p className="text-orange-700 text-sm">
                          Use savings thermometers, progress bars, or apps to visualize goal progress. Visual 
                          feedback reinforces positive behavior and maintains motivation over long periods.
                        </p>
                      </div>
                      <div className="bg-red-50 rounded-lg p-4">
                        <h5 className="font-semibold text-red-800 mb-2">Celebrate Milestones</h5>
                        <p className="text-red-700 text-sm">
                          Set intermediate milestones (25%, 50%, 75% of goal) and celebrate achievements with 
                          small, planned rewards that don't derail your progress.
                        </p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h5 className="font-semibold text-gray-800 mb-2">Opportunity Cost Awareness</h5>
                        <p className="text-gray-700 text-sm">
                          Before discretionary purchases, calculate how that money would grow in your savings 
                          plan. This mental exercise often leads to better spending decisions.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Common Mistakes and Solutions */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Common Savings Mistakes and How to Avoid Them</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-r-lg">
                      <h4 className="font-semibold text-red-800 mb-2">Setting Unrealistic Goals</h4>
                      <p className="text-red-700 text-sm mb-2">
                        <strong>Problem:</strong> Overly ambitious savings targets that strain budgets and lead to abandonment.
                      </p>
                      <p className="text-red-700 text-sm">
                        <strong>Solution:</strong> Start with modest, achievable goals and gradually increase contributions 
                        as you build the savings habit and your income grows.
                      </p>
                    </div>
                    <div className="bg-orange-50 border-l-4 border-orange-400 p-4 rounded-r-lg">
                      <h4 className="font-semibold text-orange-800 mb-2">Not Starting Early Enough</h4>
                      <p className="text-orange-700 text-sm mb-2">
                        <strong>Problem:</strong> Waiting for the "perfect time" or higher income to begin saving.
                      </p>
                      <p className="text-orange-700 text-sm">
                        <strong>Solution:</strong> Start with any amount, even $25-50 monthly. Time and compound 
                        interest are more powerful than large contributions started late.
                      </p>
                    </div>
                    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-lg">
                      <h4 className="font-semibold text-yellow-800 mb-2">Keeping All Savings in Low-Yield Accounts</h4>
                      <p className="text-yellow-700 text-sm mb-2">
                        <strong>Problem:</strong> Traditional savings accounts with 0.01% interest that don't keep pace with inflation.
                      </p>
                      <p className="text-yellow-700 text-sm">
                        <strong>Solution:</strong> Research high-yield savings accounts, CDs, and for longer-term goals, 
                        consider investment accounts with higher growth potential.
                      </p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-lg">
                      <h4 className="font-semibold text-blue-800 mb-2">No Emergency Fund Priority</h4>
                      <p className="text-blue-700 text-sm mb-2">
                        <strong>Problem:</strong> Saving for wants before securing against financial emergencies.
                      </p>
                      <p className="text-blue-700 text-sm">
                        <strong>Solution:</strong> Build at least $1,000 emergency fund before pursuing other goals. 
                        This prevents debt accumulation when unexpected expenses arise.
                      </p>
                    </div>
                    <div className="bg-purple-50 border-l-4 border-purple-400 p-4 rounded-r-lg">
                      <h4 className="font-semibold text-purple-800 mb-2">Inconsistent Contributions</h4>
                      <p className="text-purple-700 text-sm mb-2">
                        <strong>Problem:</strong> Irregular saving patterns that reduce compound growth and create bad habits.
                      </p>
                      <p className="text-purple-700 text-sm">
                        <strong>Solution:</strong> Automate savings transfers to occur immediately after payday. 
                        Consistency matters more than amount for long-term success.
                      </p>
                    </div>
                    <div className="bg-green-50 border-l-4 border-green-400 p-4 rounded-r-lg">
                      <h4 className="font-semibold text-green-800 mb-2">Raiding Savings for Non-Emergencies</h4>
                      <p className="text-green-700 text-sm mb-2">
                        <strong>Problem:</strong> Using long-term savings for vacations, purchases, or lifestyle inflation.
                      </p>
                      <p className="text-green-700 text-sm">
                        <strong>Solution:</strong> Create separate "fun fund" for discretionary spending and strictly 
                        define what constitutes an emergency worthy of tapping savings.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Interest Rate and Economic Factors */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Understanding Interest Rates and Economic Impact</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-gray-800">How Interest Rates Affect Your Savings</h4>
                    <p className="text-gray-600">
                      Interest rates significantly impact how quickly your savings grow. Understanding rate environments 
                      helps you make informed decisions about where to save and when to lock in rates.
                    </p>
                    <div className="space-y-3">
                      <div className="bg-blue-50 rounded-lg p-4">
                        <h5 className="font-semibold text-blue-800 mb-2">Rising Rate Environment</h5>
                        <p className="text-blue-700 text-sm">
                          When interest rates increase, new savings earn more. Consider shorter-term CDs or variable-rate 
                          accounts to benefit from rising rates. High-yield savings accounts typically adjust quickly.
                        </p>
                      </div>
                      <div className="bg-orange-50 rounded-lg p-4">
                        <h5 className="font-semibold text-orange-800 mb-2">Falling Rate Environment</h5>
                        <p className="text-orange-700 text-sm">
                          When rates decline, lock in current rates with longer-term CDs. Existing fixed-rate investments 
                          become more valuable, while new savings earn less.
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-gray-800">Inflation's Impact on Savings Goals</h4>
                    <p className="text-gray-600">
                      Inflation erodes purchasing power over time, making future dollars worth less than today's dollars. 
                      Factor inflation into long-term savings calculations.
                    </p>
                    <div className="space-y-3">
                      <div className="bg-red-50 rounded-lg p-4">
                        <h5 className="font-semibold text-red-800 mb-2">Historical Inflation Rate</h5>
                        <p className="text-red-700 text-sm">
                          U.S. inflation averages about 3% annually over long periods. This means costs double approximately 
                          every 23 years, requiring higher savings for future purchasing power.
                        </p>
                      </div>
                      <div className="bg-green-50 rounded-lg p-4">
                        <h5 className="font-semibold text-green-800 mb-2">Real vs Nominal Returns</h5>
                        <p className="text-green-700 text-sm">
                          Real return = Nominal return - Inflation rate. A 5% savings account with 3% inflation provides 
                          only 2% real growth in purchasing power.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* FAQ Section */}
            <Card className="bg-gradient-to-r from-gray-50 to-blue-50 border-0 shadow-xl rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-8">Frequently Asked Questions About Savings Goals</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-lg font-bold text-gray-900 mb-3">How much should I save each month?</h4>
                      <p className="text-gray-600 leading-relaxed">
                        Financial experts recommend saving at least 20% of your income, but start with what you can afford. 
                        Even saving $50-100 monthly builds the habit and creates momentum. Increase contributions as your 
                        income grows or expenses decrease.
                      </p>
                    </div>
                    
                    <div>
                      <h4 className="text-lg font-bold text-gray-900 mb-3">What's the best savings account for my goals?</h4>
                      <p className="text-gray-600 leading-relaxed">
                        For short-term goals (under 2 years), use high-yield savings accounts for liquidity and safety. 
                        Medium-term goals (2-5 years) benefit from CDs or money market accounts. Long-term goals (5+ years) 
                        may warrant investment accounts for higher growth potential.
                      </p>
                    </div>
                    
                    <div>
                      <h4 className="text-lg font-bold text-gray-900 mb-3">Should I pay off debt or save first?</h4>
                      <p className="text-gray-600 leading-relaxed">
                        Build a small emergency fund ($500-1,000) first, then focus on high-interest debt (credit cards, 
                        personal loans). Once debt is manageable, simultaneously save and pay debt. Mortgage and low-interest 
                        loans can often coexist with savings goals.
                      </p>
                    </div>
                  </div>
                  
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-lg font-bold text-gray-900 mb-3">How accurate are savings calculators?</h4>
                      <p className="text-gray-600 leading-relaxed">
                        Savings calculators provide very accurate mathematical projections based on your inputs. However, 
                        actual results may vary due to interest rate changes, contribution inconsistencies, or goal modifications. 
                        Use results as planning guidelines and review regularly.
                      </p>
                    </div>
                    
                    <div>
                      <h4 className="text-lg font-bold text-gray-900 mb-3">What if I can't meet my monthly savings target?</h4>
                      <p className="text-gray-600 leading-relaxed">
                        Adjust your timeline rather than abandoning the goal. Save what you can consistently, even if it's 
                        less than initially planned. Review your budget for expense reductions or consider additional income 
                        sources. Progress matters more than perfection.
                      </p>
                    </div>
                    
                    <div>
                      <h4 className="text-lg font-bold text-gray-900 mb-3">How often should I review my savings goals?</h4>
                      <p className="text-gray-600 leading-relaxed">
                        Review goals quarterly to track progress and make adjustments. Annual reviews should reassess priorities, 
                        timelines, and contribution amounts based on income changes, life events, or shifting priorities. 
                        Stay flexible while maintaining consistent saving habits.
                      </p>
                    </div>
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
