
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
import { PiggyBank } from 'lucide-react';

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
    <div className="min-h-screen bg-gray-50">
      <Helmet>
        <title>Free Savings Goal Calculator - Achieve Financial Goals with Smart Planning | ToolsHub</title>
        <meta name="description" content="Advanced savings goal calculator with compound interest projections, multiple calculation modes, and 16+ countries. Plan emergency funds, retirement savings, vacation funds, and major purchases with precision." />
        <meta name="keywords" content="savings goal calculator, financial planning tool, emergency fund calculator, retirement savings calculator, vacation fund planner, monthly savings calculator, compound interest calculator, savings tracker, financial goal planner, money saving calculator, savings projection calculator, budgeting tool, personal finance calculator, savings strategy planner, financial independence calculator" />
        <meta property="og:title" content="Free Savings Goal Calculator - Achieve Financial Goals with Smart Planning" />
        <meta property="og:description" content="Calculate exactly how to reach any savings goal with compound interest projections, flexible timeframes, and multi-currency support for global users." />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="ToolsHub" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Savings Goal Calculator - Smart Financial Planning Tool" />
        <meta name="twitter:description" content="Plan and achieve any financial goal with precise calculations, compound interest projections, and personalized savings strategies." />
        <meta name="robots" content="index, follow" />
        <meta name="author" content="ToolsHub" />
        <link rel="canonical" href="https://toolshub.com/tools/savings-goal-calculator" />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            "name": "Savings Goal Calculator",
            "description": "Calculate savings goals with compound interest projections, monthly contributions, and flexible timeframes for emergency funds, retirement, and major purchases.",
            "url": "https://toolshub.com/tools/savings-goal-calculator",
            "applicationCategory": "FinanceApplication",
            "operatingSystem": "Web Browser",
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
      
      <Header />
      
      <main>
        {/* Hero Section */}
        <section className="gradient-hero text-white py-16 pt-24">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="w-20 h-20 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <PiggyBank className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold mb-6">
              Savings Goal Calculator
            </h1>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto">
              Plan and track your savings goals with compound interest calculations for worldwide users
            </p>
          </div>
        </section>

        <div className="max-w-6xl mx-auto px-4 py-12">
          <Card className="bg-white shadow-sm border-0">
            <CardContent className="p-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                {/* Input Section */}
                <div className="space-y-6">
                  <h2 className="text-2xl font-semibold text-gray-900 mb-8">Savings Goal Calculator</h2>
                  
                  {/* Country Selection */}
                  <div className="space-y-3">
                    <Label htmlFor="country" className="text-sm font-medium text-gray-700">
                      Country (Sets typical savings rates)
                    </Label>
                    <Select value={country} onValueChange={handleCountryChange}>
                      <SelectTrigger className="h-12 border-gray-200 rounded-lg">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {countries.map((country) => (
                          <SelectItem key={country.code} value={country.code}>
                            {country.name} ({country.avgSavingsRate}%)
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <div className="text-xs text-gray-500">
                      Average savings rate: {currentCountryData.avgSavingsRate}% annually
                    </div>
                  </div>

                  {/* Calculation Type Tabs */}
                  <Tabs value={calculationType} onValueChange={setCalculationType} className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="time-to-save">Time to Save</TabsTrigger>
                      <TabsTrigger value="monthly-payment">Monthly Payment</TabsTrigger>
                      <TabsTrigger value="target-amount">Target Amount</TabsTrigger>
                    </TabsList>

                    <TabsContent value="time-to-save" className="space-y-6 mt-6">
                      <div className="space-y-3">
                        <Label htmlFor="goal-amount" className="text-sm font-medium text-gray-700">
                          Savings Goal ({currency})
                        </Label>
                        <Input
                          id="goal-amount"
                          type="number"
                          value={goalAmount}
                          onChange={(e) => setGoalAmount(e.target.value)}
                          className="h-12 text-base border-gray-200 rounded-lg"
                          placeholder="50,000"
                          min="0"
                          step="0.01"
                        />
                      </div>

                      <div className="space-y-3">
                        <Label htmlFor="current-savings" className="text-sm font-medium text-gray-700">
                          Current Savings ({currency})
                        </Label>
                        <Input
                          id="current-savings"
                          type="number"
                          value={currentSavings}
                          onChange={(e) => setCurrentSavings(e.target.value)}
                          className="h-12 text-base border-gray-200 rounded-lg"
                          placeholder="5,000"
                          min="0"
                          step="0.01"
                        />
                      </div>

                      <div className="space-y-3">
                        <Label htmlFor="monthly-contribution" className="text-sm font-medium text-gray-700">
                          Monthly Contribution ({currency})
                        </Label>
                        <Input
                          id="monthly-contribution"
                          type="number"
                          value={monthlyContribution}
                          onChange={(e) => setMonthlyContribution(e.target.value)}
                          className="h-12 text-base border-gray-200 rounded-lg"
                          placeholder="500"
                          min="0"
                          step="0.01"
                        />
                      </div>

                      <div className="space-y-3">
                        <Label htmlFor="interest-rate" className="text-sm font-medium text-gray-700">
                          Annual Interest Rate (%)
                        </Label>
                        <Input
                          id="interest-rate"
                          type="number"
                          value={annualInterestRate}
                          onChange={(e) => setAnnualInterestRate(e.target.value)}
                          className="h-12 text-base border-gray-200 rounded-lg"
                          placeholder="4.5"
                          min="0"
                          max="50"
                          step="0.1"
                        />
                      </div>
                    </TabsContent>

                    <TabsContent value="monthly-payment" className="space-y-6 mt-6">
                      <div className="space-y-3">
                        <Label htmlFor="payment-goal" className="text-sm font-medium text-gray-700">
                          Savings Goal ({currency})
                        </Label>
                        <Input
                          id="payment-goal"
                          type="number"
                          value={paymentGoalAmount}
                          onChange={(e) => setPaymentGoalAmount(e.target.value)}
                          className="h-12 text-base border-gray-200 rounded-lg"
                          placeholder="25,000"
                          min="0"
                          step="0.01"
                        />
                      </div>

                      <div className="space-y-3">
                        <Label htmlFor="payment-current" className="text-sm font-medium text-gray-700">
                          Current Savings ({currency})
                        </Label>
                        <Input
                          id="payment-current"
                          type="number"
                          value={paymentCurrentSavings}
                          onChange={(e) => setPaymentCurrentSavings(e.target.value)}
                          className="h-12 text-base border-gray-200 rounded-lg"
                          placeholder="2,000"
                          min="0"
                          step="0.01"
                        />
                      </div>

                      <div className="space-y-3">
                        <Label htmlFor="timeframe" className="text-sm font-medium text-gray-700">
                          Timeframe (Months)
                        </Label>
                        <Input
                          id="timeframe"
                          type="number"
                          value={timeframe}
                          onChange={(e) => setTimeframe(e.target.value)}
                          className="h-12 text-base border-gray-200 rounded-lg"
                          placeholder="60"
                          min="1"
                          max="600"
                        />
                      </div>

                      <div className="space-y-3">
                        <Label htmlFor="payment-rate" className="text-sm font-medium text-gray-700">
                          Annual Interest Rate (%)
                        </Label>
                        <Input
                          id="payment-rate"
                          type="number"
                          value={paymentInterestRate}
                          onChange={(e) => setPaymentInterestRate(e.target.value)}
                          className="h-12 text-base border-gray-200 rounded-lg"
                          placeholder="3.5"
                          min="0"
                          max="50"
                          step="0.1"
                        />
                      </div>
                    </TabsContent>

                    <TabsContent value="target-amount" className="space-y-6 mt-6">
                      <div className="space-y-3">
                        <Label htmlFor="target-current" className="text-sm font-medium text-gray-700">
                          Current Savings ({currency})
                        </Label>
                        <Input
                          id="target-current"
                          type="number"
                          value={targetCurrentSavings}
                          onChange={(e) => setTargetCurrentSavings(e.target.value)}
                          className="h-12 text-base border-gray-200 rounded-lg"
                          placeholder="10,000"
                          min="0"
                          step="0.01"
                        />
                      </div>

                      <div className="space-y-3">
                        <Label htmlFor="target-monthly" className="text-sm font-medium text-gray-700">
                          Monthly Contribution ({currency})
                        </Label>
                        <Input
                          id="target-monthly"
                          type="number"
                          value={targetMonthlyContribution}
                          onChange={(e) => setTargetMonthlyContribution(e.target.value)}
                          className="h-12 text-base border-gray-200 rounded-lg"
                          placeholder="800"
                          min="0"
                          step="0.01"
                        />
                      </div>

                      <div className="space-y-3">
                        <Label htmlFor="target-timeframe" className="text-sm font-medium text-gray-700">
                          Timeframe (Months)
                        </Label>
                        <Input
                          id="target-timeframe"
                          type="number"
                          value={targetTimeframe}
                          onChange={(e) => setTargetTimeframe(e.target.value)}
                          className="h-12 text-base border-gray-200 rounded-lg"
                          placeholder="36"
                          min="1"
                          max="600"
                        />
                      </div>

                      <div className="space-y-3">
                        <Label htmlFor="target-rate" className="text-sm font-medium text-gray-700">
                          Annual Interest Rate (%)
                        </Label>
                        <Input
                          id="target-rate"
                          type="number"
                          value={targetInterestRate}
                          onChange={(e) => setTargetInterestRate(e.target.value)}
                          className="h-12 text-base border-gray-200 rounded-lg"
                          placeholder="5.0"
                          min="0"
                          max="50"
                          step="0.1"
                        />
                      </div>
                    </TabsContent>
                  </Tabs>

                  {/* Action Buttons */}
                  <div className="flex gap-4 pt-6">
                    <Button
                      onClick={calculateSavings}
                      className="flex-1 h-12 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg"
                    >
                      <PiggyBank className="w-4 h-4 mr-2" />
                      Calculate
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
                  <h2 className="text-2xl font-semibold text-gray-900 mb-8">Savings Plan</h2>
                  
                  {result ? (
                    <div className="space-y-6">
                      {/* Main Results */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white rounded-lg p-4 border border-gray-100">
                          <div className="text-center space-y-2">
                            <div className="text-sm text-gray-600">
                              {result.calculationType === 'time-to-save' ? 'Time to Reach Goal' : 
                               result.calculationType === 'monthly-payment' ? 'Required Monthly' : 'Target Amount'}
                            </div>
                            <div className="text-2xl font-bold text-blue-600">
                              {result.calculationType === 'time-to-save' ? formatTime(result.timeToReach) :
                               result.calculationType === 'monthly-payment' ? formatCurrency(result.monthlyContribution) :
                               formatCurrency(result.goalAmount)}
                            </div>
                          </div>
                        </div>
                        <div className="bg-white rounded-lg p-4 border border-gray-100">
                          <div className="text-center space-y-2">
                            <div className="text-sm text-gray-600">Interest Earned</div>
                            <div className="text-2xl font-bold text-green-600">
                              {formatCurrency(result.interestEarned)}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Detailed Breakdown */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-900">Savings Breakdown</h3>
                        
                        <div className="flex justify-between items-center py-3 border-b border-gray-200">
                          <span className="text-gray-600">
                            {result.calculationType === 'target-amount' ? 'Total Amount' : 'Goal Amount'}
                          </span>
                          <span className="font-semibold text-gray-900">
                            {formatCurrency(result.goalAmount)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center py-3 border-b border-gray-200">
                          <span className="text-gray-600">Monthly Contribution</span>
                          <span className="font-semibold text-blue-600">
                            {formatCurrency(result.monthlyContribution)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center py-3 border-b border-gray-200">
                          <span className="text-gray-600">Time Period</span>
                          <span className="font-semibold text-gray-900">
                            {formatTime(result.timeToReach)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center py-3 border-b border-gray-200">
                          <span className="text-gray-600">Total Contributions</span>
                          <span className="font-semibold text-orange-600">
                            {formatCurrency(result.totalContributions)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center py-3 border-b border-gray-200">
                          <span className="text-gray-600">Interest Earned</span>
                          <span className="font-semibold text-green-600">
                            {formatCurrency(result.interestEarned)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center py-3">
                          <span className="text-gray-600">Annual Interest Rate</span>
                          <span className="font-semibold text-purple-600">
                            {result.annualInterestRate.toFixed(2)}%
                          </span>
                        </div>
                      </div>

                      {/* Summary */}
                      <div className="mt-8 bg-blue-50 rounded-lg p-4">
                        <h4 className="text-sm font-semibold text-blue-900 mb-2">Summary:</h4>
                        <p className="text-sm text-blue-800">
                          {result.calculationType === 'time-to-save' 
                            ? `You'll reach your goal of ${formatCurrency(result.goalAmount)} in ${formatTime(result.timeToReach)} by saving ${formatCurrency(result.monthlyContribution)} monthly.`
                            : result.calculationType === 'monthly-payment'
                            ? `To reach ${formatCurrency(result.goalAmount)} in ${formatTime(result.timeToReach)}, you need to save ${formatCurrency(result.monthlyContribution)} monthly.`
                            : `Saving ${formatCurrency(result.monthlyContribution)} monthly for ${formatTime(result.timeToReach)} will give you ${formatCurrency(result.goalAmount)}.`
                          }
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <PiggyBank className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500">Enter your savings details to calculate your goal plan</p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Educational Content */}
          <div className="mt-16 space-y-16">
            {/* What is a Savings Goal Calculator */}
            <section className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-8">
              <div className="max-w-4xl mx-auto">
                <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">
                  What is a Savings Goal Calculator and How Does It Work?
                </h2>
                <div className="prose prose-lg text-gray-700 mx-auto mb-8">
                  <p className="text-xl leading-relaxed mb-6">
                    A savings goal calculator is a powerful financial planning tool that helps you determine exactly how to achieve any savings target through strategic monthly contributions and compound interest growth. Our advanced calculator uses sophisticated algorithms to compute three essential scenarios: how long it takes to reach a goal, what monthly payment is required, or what target amount you can achieve with specific contributions and timeframes.
                  </p>
                  
                  <p className="text-lg leading-relaxed mb-6">
                    The calculator employs compound interest formulas that account for monthly contributions and interest compounding, providing realistic projections for emergency funds, vacation savings, down payments, retirement planning, and major purchases. Unlike simple calculators that ignore interest growth, our tool factors in the exponential power of compound returns, showing how your money grows over time through both contributions and earned interest.
                  </p>
                  
                  <p className="text-lg leading-relaxed">
                    Our savings goal calculator supports multiple currencies and incorporates country-specific average interest rates, making it valuable for users worldwide. The tool considers different savings vehicles like high-yield savings accounts, CDs, money market accounts, and investment accounts, each with varying interest rates and risk profiles suitable for different savings timelines and goals.
                  </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                  <div className="bg-white rounded-lg p-6 shadow-sm">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                      <PiggyBank className="w-6 h-6 text-green-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">Smart Goal Planning</h3>
                    <p className="text-gray-600 text-sm">Strategic financial planning with compound interest calculations for realistic, achievable savings targets and timelines.</p>
                  </div>
                  <div className="bg-white rounded-lg p-6 shadow-sm">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                      <PiggyBank className="w-6 h-6 text-blue-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">Multiple Calculation Modes</h3>
                    <p className="text-gray-600 text-sm">Three calculation types: time to save, monthly payment requirements, and target amount projections for flexible planning.</p>
                  </div>
                  <div className="bg-white rounded-lg p-6 shadow-sm">
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                      <PiggyBank className="w-6 h-6 text-purple-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">Global Currency Support</h3>
                    <p className="text-gray-600 text-sm">Multi-currency calculations with country-specific interest rates for accurate international financial planning.</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Benefits and Use Cases */}
            <section>
              <div className="max-w-6xl mx-auto">
                <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
                  Benefits and Use Cases for Every Audience
                </h2>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-12">
                  {/* Students */}
                  <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-8">
                    <h3 className="text-2xl font-semibold text-gray-900 mb-4">For Students</h3>
                    <ul className="space-y-3 text-gray-700">
                      <li className="flex items-start">
                        <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        <span><strong>Education Funding:</strong> Calculate savings needed for tuition, textbooks, and living expenses for future academic years</span>
                      </li>
                      <li className="flex items-start">
                        <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        <span><strong>Emergency Fund Building:</strong> Plan monthly contributions to build a safety net for unexpected expenses and financial independence</span>
                      </li>
                      <li className="flex items-start">
                        <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        <span><strong>Post-Graduation Goals:</strong> Save for first apartment deposits, professional wardrobe, and job search expenses</span>
                      </li>
                      <li className="flex items-start">
                        <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        <span><strong>Study Abroad Planning:</strong> Calculate savings for international programs, travel costs, and foreign exchange considerations</span>
                      </li>
                    </ul>
                  </div>

                  {/* Professionals */}
                  <div className="bg-gradient-to-br from-purple-50 to-violet-50 rounded-xl p-8">
                    <h3 className="text-2xl font-semibold text-gray-900 mb-4">For Working Professionals</h3>
                    <ul className="space-y-3 text-gray-700">
                      <li className="flex items-start">
                        <span className="w-2 h-2 bg-purple-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        <span><strong>Career Development:</strong> Save for professional certifications, advanced degrees, and skill-building courses that boost earning potential</span>
                      </li>
                      <li className="flex items-start">
                        <span className="w-2 h-2 bg-purple-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        <span><strong>Home Ownership:</strong> Plan down payment savings for real estate purchases with precise monthly contribution targets</span>
                      </li>
                      <li className="flex items-start">
                        <span className="w-2 h-2 bg-purple-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        <span><strong>Retirement Acceleration:</strong> Calculate additional savings beyond employer 401(k) to achieve early retirement goals</span>
                      </li>
                      <li className="flex items-start">
                        <span className="w-2 h-2 bg-purple-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        <span><strong>Lifestyle Upgrades:</strong> Save for major purchases like vehicles, home improvements, and premium experiences</span>
                      </li>
                    </ul>
                  </div>

                  {/* Business Owners */}
                  <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl p-8">
                    <h3 className="text-2xl font-semibold text-gray-900 mb-4">For Business Owners</h3>
                    <ul className="space-y-3 text-gray-700">
                      <li className="flex items-start">
                        <span className="w-2 h-2 bg-orange-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        <span><strong>Business Expansion:</strong> Calculate savings needed for equipment purchases, inventory, and operational scaling</span>
                      </li>
                      <li className="flex items-start">
                        <span className="w-2 h-2 bg-orange-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        <span><strong>Emergency Reserves:</strong> Build business contingency funds to weather economic downturns and unexpected challenges</span>
                      </li>
                      <li className="flex items-start">
                        <span className="w-2 h-2 bg-orange-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        <span><strong>Tax Planning:</strong> Save systematically for quarterly tax payments and year-end obligations</span>
                      </li>
                      <li className="flex items-start">
                        <span className="w-2 h-2 bg-orange-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        <span><strong>Investment Opportunities:</strong> Plan savings for real estate investments, new ventures, and market opportunities</span>
                      </li>
                    </ul>
                  </div>

                  {/* Families */}
                  <div className="bg-gradient-to-br from-rose-50 to-pink-50 rounded-xl p-8">
                    <h3 className="text-2xl font-semibold text-gray-900 mb-4">For Families</h3>
                    <ul className="space-y-3 text-gray-700">
                      <li className="flex items-start">
                        <span className="w-2 h-2 bg-rose-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        <span><strong>Children's Education:</strong> Plan college savings with 529 plans and education savings accounts for multiple children</span>
                      </li>
                      <li className="flex items-start">
                        <span className="w-2 h-2 bg-rose-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        <span><strong>Family Vacations:</strong> Save for memorable family trips, holidays, and special experiences with compound interest growth</span>
                      </li>
                      <li className="flex items-start">
                        <span className="w-2 h-2 bg-rose-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        <span><strong>Home Improvements:</strong> Calculate savings for renovations, landscaping, and property value enhancements</span>
                      </li>
                      <li className="flex items-start">
                        <span className="w-2 h-2 bg-rose-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        <span><strong>Emergency Preparedness:</strong> Build family emergency funds covering 6-12 months of expenses for financial security</span>
                      </li>
                    </ul>
                  </div>
                </div>

                {/* Universal Savings Goals */}
                <div className="bg-gray-50 rounded-xl p-8">
                  <h3 className="text-2xl font-semibold text-gray-900 mb-6 text-center">Universal Savings Goals</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <PiggyBank className="w-8 h-8 text-green-600" />
                      </div>
                      <h4 className="font-semibold text-gray-900 mb-2">Emergency Fund</h4>
                      <p className="text-gray-600 text-sm">Build 3-6 months of living expenses for financial security and peace of mind</p>
                    </div>
                    <div className="text-center">
                      <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <PiggyBank className="w-8 h-8 text-blue-600" />
                      </div>
                      <h4 className="font-semibold text-gray-900 mb-2">Dream Vacation</h4>
                      <p className="text-gray-600 text-sm">Plan and save for travel experiences, international trips, and adventure goals</p>
                    </div>
                    <div className="text-center">
                      <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <PiggyBank className="w-8 h-8 text-purple-600" />
                      </div>
                      <h4 className="font-semibold text-gray-900 mb-2">Major Purchase</h4>
                      <p className="text-gray-600 text-sm">Save for cars, electronics, furniture, and significant one-time expenses</p>
                    </div>
                    <div className="text-center">
                      <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <PiggyBank className="w-8 h-8 text-orange-600" />
                      </div>
                      <h4 className="font-semibold text-gray-900 mb-2">Retirement Fund</h4>
                      <p className="text-gray-600 text-sm">Long-term retirement planning with compound interest maximization strategies</p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Related Financial Tools */}
            <section className="bg-gradient-to-r from-gray-50 to-slate-50 rounded-2xl p-8">
              <div className="max-w-4xl mx-auto">
                <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">
                  Related Financial Planning & Savings Tools
                </h2>
                <p className="text-lg text-gray-600 text-center mb-10">
                  Complete your financial planning with our comprehensive suite of calculators and tools designed for smart money management.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <a href="/tools/compound-interest" className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow border border-gray-100 hover:border-green-200 group">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-green-200 transition-colors">
                      <PiggyBank className="w-6 h-6 text-green-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">Compound Interest Calculator</h3>
                    <p className="text-gray-600 text-sm">Calculate investment growth with compound interest to optimize your savings strategy and retirement planning.</p>
                  </a>
                  
                  <a href="/tools/inflation-calculator" className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow border border-gray-100 hover:border-blue-200 group">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-blue-200 transition-colors">
                      <PiggyBank className="w-6 h-6 text-blue-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">Inflation Calculator</h3>
                    <p className="text-gray-600 text-sm">Adjust your savings goals for inflation to maintain purchasing power and real value over time.</p>
                  </a>
                  
                  <a href="/tools/retirement-calculator" className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow border border-gray-100 hover:border-purple-200 group">
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-purple-200 transition-colors">
                      <PiggyBank className="w-6 h-6 text-purple-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">Retirement Calculator</h3>
                    <p className="text-gray-600 text-sm">Plan retirement savings with age-specific strategies and withdrawal rate calculations.</p>
                  </a>
                  
                  <a href="/tools/net-worth-calculator" className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow border border-gray-100 hover:border-orange-200 group">
                    <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-orange-200 transition-colors">
                      <PiggyBank className="w-6 h-6 text-orange-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">Net Worth Calculator</h3>
                    <p className="text-gray-600 text-sm">Track total wealth and monitor progress toward financial independence and long-term goals.</p>
                  </a>
                  
                  <a href="/tools/tip-calculator" className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow border border-gray-100 hover:border-red-200 group">
                    <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-red-200 transition-colors">
                      <PiggyBank className="w-6 h-6 text-red-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">Tip Calculator</h3>
                    <p className="text-gray-600 text-sm">Calculate tips and split bills accurately for dining, services, and hospitality expenses.</p>
                  </a>
                  
                  <a href="/tools/investment-return-calculator" className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow border border-gray-100 hover:border-indigo-200 group">
                    <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-indigo-200 transition-colors">
                      <PiggyBank className="w-6 h-6 text-indigo-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">Investment Return Calculator</h3>
                    <p className="text-gray-600 text-sm">Analyze investment performance and potential returns for portfolio optimization strategies.</p>
                  </a>
                </div>
                
                <div className="text-center mt-8">
                  <a href="/finance" className="inline-flex items-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium">
                    View All Financial Tools
                    <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </a>
                </div>
              </div>
            </section>

            {/* Advanced SEO Content */}
            <section className="max-w-4xl mx-auto">
              <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Why Use Our Advanced Savings Goal Calculator?
                </h2>
                
                <div className="prose prose-lg text-gray-700 max-w-none">
                  <p className="mb-6">
                    Our savings goal calculator stands out as the most comprehensive and user-friendly financial planning tool available. Unlike basic calculators that provide simple division results, our advanced algorithm incorporates compound interest calculations, multiple currency support, and country-specific interest rates to deliver precise, actionable savings strategies that align with your financial goals and timeline.
                  </p>
                  
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Advanced Features and Accuracy:</h3>
                  
                  <ul className="space-y-3 mb-6">
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      <span><strong>Three Calculation Modes:</strong> Time to save, required monthly payment, and target amount calculations for complete flexibility</span>
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      <span><strong>Compound Interest Integration:</strong> Monthly compounding calculations that show the power of consistent saving and interest growth</span>
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      <span><strong>Global Currency Support:</strong> Calculate savings in 16+ currencies with country-specific average interest rates</span>
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      <span><strong>Real-Time Results:</strong> Instant calculations as you adjust parameters for immediate feedback and optimization</span>
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      <span><strong>Detailed Breakdowns:</strong> Clear visualization of contributions vs. interest earned for informed decision-making</span>
                    </li>
                  </ul>
                  
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Essential for Smart Financial Planning:</h3>
                  
                  <p className="mb-6">
                    Whether you're building an emergency fund, saving for a down payment, planning a vacation, or preparing for retirement, our calculator provides the precision and flexibility needed to create realistic, achievable savings plans. The tool accounts for the time value of money, helping you understand how consistent contributions combined with compound interest can accelerate your progress toward financial goals.
                  </p>
                  
                  <p className="mb-6">
                    Financial advisors recommend using savings goal calculators as part of comprehensive financial planning because they demonstrate the mathematical relationship between time, contributions, and interest rates. Our calculator helps you optimize these variables to find the most efficient path to your financial objectives while maintaining realistic expectations about timelines and required commitments.
                  </p>
                  
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Versatile Applications and Goal Types:</h3>
                  
                  <p className="mb-4">
                    Our savings goal calculator adapts to virtually any financial objective, from short-term goals like vacation funding and emergency reserves to long-term aspirations such as retirement planning and major purchases. The tool's flexibility makes it invaluable for individuals at any life stage, whether you're a student building your first emergency fund or a professional planning for early retirement.
                  </p>
                  
                  <p>
                    The calculator's country-specific features and multi-currency support make it particularly valuable for international users, expats, and anyone dealing with foreign currencies. By incorporating regional interest rate averages and supporting global currencies, the tool provides accurate projections regardless of your geographic location or preferred savings vehicle.
                  </p>
                </div>
              </div>
            </section>
          </div>

          {/* SEO Content Section */}
          <section className="py-16">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Free Savings Goal Calculator - Plan Your Financial Future
              </h2>
              <p className="text-lg text-gray-600 max-w-4xl mx-auto leading-relaxed">
                Achieve your financial dreams with our comprehensive savings goal calculator. Plan your monthly contributions, 
                calculate compound interest growth, and create a personalized savings strategy that works for your lifestyle and goals. 
                Whether you're saving for a home, vacation, emergency fund, or retirement, our calculator helps you stay on track.
              </p>
            </div>

            {/* Key Features */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
              <div className="text-center p-6 bg-blue-50 rounded-lg">
                <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <PiggyBank className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Smart Financial Planning</h3>
                <p className="text-gray-600">Calculate optimal monthly contributions, timeframes, and target amounts with compound interest projections for realistic financial planning.</p>
              </div>
              <div className="text-center p-6 bg-green-50 rounded-lg">
                <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <PiggyBank className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Multi-Currency Support</h3>
                <p className="text-gray-600">Calculate savings goals in 13+ currencies including USD, EUR, GBP, CAD, AUD, and more with country-specific average interest rates.</p>
              </div>
              <div className="text-center p-6 bg-purple-50 rounded-lg">
                <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <PiggyBank className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Flexible Calculations</h3>
                <p className="text-gray-600">Three calculation modes: determine time to reach goals, calculate required monthly payments, or project future savings amounts.</p>
              </div>
            </div>
          </section>

          {/* What is a Savings Goal Calculator */}
          <section className="py-12 bg-white rounded-xl mb-12">
            <div className="px-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
                What is a Savings Goal Calculator?
              </h2>
              <div className="max-w-4xl mx-auto">
                <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                  A savings goal calculator is a powerful financial planning tool that helps you determine how to reach your specific savings targets. 
                  By inputting your current savings, desired goal amount, monthly contribution capacity, and expected interest rate, the calculator 
                  provides detailed projections showing exactly when you'll reach your goal and how compound interest will accelerate your savings growth.
                </p>
                <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                  Our advanced calculator goes beyond basic savings calculations by offering three distinct calculation modes: determining the time 
                  needed to reach a specific goal, calculating the monthly payment required to meet a goal within a set timeframe, and projecting 
                  the final amount you'll accumulate with regular contributions over time.
                </p>
                <p className="text-lg text-gray-600 leading-relaxed">
                  Whether you're planning for short-term goals like a vacation or car purchase, medium-term objectives like a home down payment, 
                  or long-term goals such as retirement or children's education, this calculator adapts to your specific financial situation and 
                  provides actionable insights for successful wealth building.
                </p>
              </div>
            </div>
          </section>

          {/* Benefits and Use Cases */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 py-12">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Key Benefits of Using Our Savings Calculator
              </h2>
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center mr-3 mt-1">
                    <span className="text-white text-sm">✓</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Accurate Compound Interest Calculations</h3>
                    <p className="text-gray-600">See how your money grows over time with precise compound interest projections based on your savings frequency and interest rate.</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center mr-3 mt-1">
                    <span className="text-white text-sm">✓</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Realistic Goal Setting</h3>
                    <p className="text-gray-600">Set achievable financial goals based on your current income, expenses, and savings capacity for sustainable wealth building.</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center mr-3 mt-1">
                    <span className="text-white text-sm">✓</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Multiple Scenario Planning</h3>
                    <p className="text-gray-600">Compare different savings strategies by adjusting contribution amounts, timeframes, and interest rates to find your optimal approach.</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center mr-3 mt-1">
                    <span className="text-white text-sm">✓</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Progress Tracking</h3>
                    <p className="text-gray-600">Monitor your savings journey with clear timelines and milestones to stay motivated and on track toward your financial goals.</p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Popular Savings Goals & Use Cases
              </h2>
              <div className="space-y-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-blue-900 mb-2">Emergency Fund</h3>
                  <p className="text-blue-700">Build 3-6 months of expenses for financial security and peace of mind during unexpected situations.</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-green-900 mb-2">Home Down Payment</h3>
                  <p className="text-green-700">Save for a 10-20% down payment on your dream home to reduce mortgage costs and avoid PMI.</p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-purple-900 mb-2">Vacation & Travel</h3>
                  <p className="text-purple-700">Plan and save for memorable vacations, international trips, or special experiences without debt.</p>
                </div>
                <div className="bg-orange-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-orange-900 mb-2">Retirement Planning</h3>
                  <p className="text-orange-700">Calculate long-term retirement savings needs and optimize your monthly contributions for financial independence.</p>
                </div>
                <div className="bg-pink-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-pink-900 mb-2">Education Fund</h3>
                  <p className="text-pink-700">Save for children's college tuition, professional development courses, or skill-building programs.</p>
                </div>
              </div>
            </div>
          </div>

          {/* How to Use Section */}
          <section className="py-12 bg-gray-50 rounded-xl mb-12">
            <div className="px-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
                How to Use the Savings Goal Calculator
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-white font-bold text-xl">1</span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Choose Calculation Type</h3>
                  <p className="text-gray-600">Select whether you want to calculate time to reach a goal, required monthly payment, or potential final amount.</p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-white font-bold text-xl">2</span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Enter Your Information</h3>
                  <p className="text-gray-600">Input your current savings, goal amount, monthly contribution capacity, and expected interest rate.</p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-white font-bold text-xl">3</span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Get Your Results</h3>
                  <p className="text-gray-600">Review detailed projections showing your savings timeline, required contributions, and interest earnings.</p>
                </div>
              </div>
            </div>
          </section>

          {/* Tips for Successful Saving */}
          <section className="py-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
              Expert Tips for Successful Saving
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="border-l-4 border-blue-500 pl-4">
                  <h3 className="font-semibold text-gray-900 mb-2">Start Early and Be Consistent</h3>
                  <p className="text-gray-600">Even small amounts saved consistently can grow significantly over time thanks to compound interest. Start saving as early as possible, even if it's just $25-50 per month.</p>
                </div>
                <div className="border-l-4 border-green-500 pl-4">
                  <h3 className="font-semibold text-gray-900 mb-2">Automate Your Savings</h3>
                  <p className="text-gray-600">Set up automatic transfers to your savings account on payday. This "pay yourself first" approach ensures consistent progress toward your goals.</p>
                </div>
                <div className="border-l-4 border-purple-500 pl-4">
                  <h3 className="font-semibold text-gray-900 mb-2">Use High-Yield Savings Accounts</h3>
                  <p className="text-gray-600">Maximize your earnings by choosing savings accounts with competitive interest rates. Even a 1-2% difference can significantly impact your long-term results.</p>
                </div>
              </div>
              <div className="space-y-6">
                <div className="border-l-4 border-orange-500 pl-4">
                  <h3 className="font-semibold text-gray-900 mb-2">Review and Adjust Regularly</h3>
                  <p className="text-gray-600">Reassess your savings goals quarterly. Increase contributions when you get raises, bonuses, or reduce expenses to accelerate your progress.</p>
                </div>
                <div className="border-l-4 border-red-500 pl-4">
                  <h3 className="font-semibold text-gray-900 mb-2">Separate Goals, Separate Accounts</h3>
                  <p className="text-gray-600">Keep different savings goals in separate accounts to avoid confusion and resist the temptation to borrow from one goal to fund another.</p>
                </div>
                <div className="border-l-4 border-teal-500 pl-4">
                  <h3 className="font-semibold text-gray-900 mb-2">Consider Inflation Impact</h3>
                  <p className="text-gray-600">Factor in inflation when setting long-term goals. What costs $10,000 today might cost $12,000-15,000 in 10 years, so plan accordingly.</p>
                </div>
              </div>
            </div>
          </section>

          {/* FAQ Section */}
          <section className="py-12 bg-white rounded-xl">
            <div className="px-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
                Frequently Asked Questions
              </h2>
              <div className="max-w-4xl mx-auto space-y-6">
                <div className="border-b border-gray-200 pb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">How accurate are the calculator results?</h3>
                  <p className="text-gray-600">Our calculator provides highly accurate projections based on the information you provide. However, actual results may vary due to interest rate changes, irregular contributions, or market fluctuations. Use the results as a planning guide rather than a guarantee.</p>
                </div>
                <div className="border-b border-gray-200 pb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">What interest rate should I use for my calculations?</h3>
                  <p className="text-gray-600">Use the interest rate of your actual savings account or investment. For regular savings accounts, this might be 0.5-2%. For high-yield savings accounts, 3-5%. For conservative investments, 4-7%. Always use realistic, achievable rates rather than optimistic projections.</p>
                </div>
                <div className="border-b border-gray-200 pb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Should I include existing savings in my calculations?</h3>
                  <p className="text-gray-600">Yes, absolutely. Including your current savings provides a more accurate timeline and shows how your existing money will grow through compound interest. This can significantly reduce the time needed to reach your goals.</p>
                </div>
                <div className="border-b border-gray-200 pb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Can I change my monthly contributions over time?</h3>
                  <p className="text-gray-600">While the calculator assumes consistent monthly contributions, you can adjust your savings rate as your income changes. Recalculate periodically with your new contribution amount to stay on track with your goals.</p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">What if I miss some monthly contributions?</h3>
                  <p className="text-gray-600">Missing occasional contributions is normal. The key is to get back on track as soon as possible. Consider making up missed contributions when you have extra income, or adjust your timeline to accommodate the missed payments.</p>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
