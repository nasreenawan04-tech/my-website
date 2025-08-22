
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
import { CreditCard } from 'lucide-react';

interface DebtPayoffResult {
  currentBalance: number;
  monthlyPayment: number;
  payoffTime: number;
  totalInterest: number;
  totalPaid: number;
  interestRate: number;
  currency: string;
  calculationType: string;
  extraPayment?: number;
  savingsWithExtra?: number;
  timeSavedWithExtra?: number;
}

interface DebtEntry {
  id: string;
  name: string;
  balance: number;
  interestRate: number;
  minimumPayment: number;
}

export default function DebtPayoffCalculator() {
  const [calculationType, setCalculationType] = useState('single-debt');
  
  // Single Debt inputs
  const [currentBalance, setCurrentBalance] = useState('5000');
  const [interestRate, setInterestRate] = useState('18.5');
  const [monthlyPayment, setMonthlyPayment] = useState('150');
  const [extraPayment, setExtraPayment] = useState('0');
  
  // Multiple Debts
  const [debts, setDebts] = useState<DebtEntry[]>([
    { id: '1', name: 'Credit Card 1', balance: 3000, interestRate: 19.5, minimumPayment: 75 },
    { id: '2', name: 'Credit Card 2', balance: 2000, interestRate: 15.0, minimumPayment: 50 },
    { id: '3', name: 'Personal Loan', balance: 8000, interestRate: 12.0, minimumPayment: 200 }
  ]);
  const [totalExtraPayment, setTotalExtraPayment] = useState('100');
  const [payoffStrategy, setPayoffStrategy] = useState('avalanche'); // avalanche or snowball
  
  // Target Date inputs
  const [targetBalance, setTargetBalance] = useState('10000');
  const [targetRate, setTargetRate] = useState('16.0');
  const [targetMonths, setTargetMonths] = useState('24');
  
  const [currency, setCurrency] = useState('USD');
  const [country, setCountry] = useState('US');
  const [result, setResult] = useState<DebtPayoffResult | null>(null);
  const [multipleDebtsResult, setMultipleDebtsResult] = useState<any>(null);

  const countries = [
    { code: 'US', name: 'United States', currency: 'USD', avgCreditRate: 18.5 },
    { code: 'CA', name: 'Canada', currency: 'CAD', avgCreditRate: 19.9 },
    { code: 'UK', name: 'United Kingdom', currency: 'GBP', avgCreditRate: 22.8 },
    { code: 'AU', name: 'Australia', currency: 'AUD', avgCreditRate: 20.1 },
    { code: 'DE', name: 'Germany', currency: 'EUR', avgCreditRate: 9.8 },
    { code: 'FR', name: 'France', currency: 'EUR', avgCreditRate: 13.2 },
    { code: 'IT', name: 'Italy', currency: 'EUR', avgCreditRate: 11.7 },
    { code: 'ES', name: 'Spain', currency: 'EUR', avgCreditRate: 12.5 },
    { code: 'JP', name: 'Japan', currency: 'JPY', avgCreditRate: 15.0 },
    { code: 'KR', name: 'South Korea', currency: 'KRW', avgCreditRate: 8.5 },
    { code: 'IN', name: 'India', currency: 'INR', avgCreditRate: 36.0 },
    { code: 'BR', name: 'Brazil', currency: 'BRL', avgCreditRate: 350.0 },
    { code: 'MX', name: 'Mexico', currency: 'MXN', avgCreditRate: 28.5 },
    { code: 'SG', name: 'Singapore', currency: 'SGD', avgCreditRate: 24.0 },
    { code: 'NZ', name: 'New Zealand', currency: 'NZD', avgCreditRate: 21.5 }
  ];

  const calculateDebtPayoff = () => {
    if (calculationType === 'single-debt') {
      calculateSingleDebt();
    } else if (calculationType === 'multiple-debts') {
      calculateMultipleDebts();
    } else {
      calculateTargetPayment();
    }
  };

  const calculateSingleDebt = () => {
    const balance = parseFloat(currentBalance);
    const rate = parseFloat(interestRate) / 100 / 12;
    const payment = parseFloat(monthlyPayment);
    const extra = parseFloat(extraPayment) || 0;
    
    if (balance <= 0 || payment <= 0 || rate < 0) return;

    // Calculate without extra payment
    const monthlyInterest = balance * rate;
    if (payment <= monthlyInterest) {
      // Payment doesn't cover interest
      return;
    }

    const months = -Math.log(1 - (balance * rate) / payment) / Math.log(1 + rate);
    const totalPaid = payment * months;
    const totalInterest = totalPaid - balance;

    // Calculate with extra payment
    let monthsWithExtra = 0;
    let totalPaidWithExtra = 0;
    let totalInterestWithExtra = 0;
    let savingsWithExtra = 0;
    let timeSavedWithExtra = 0;

    if (extra > 0) {
      const totalPayment = payment + extra;
      monthsWithExtra = -Math.log(1 - (balance * rate) / totalPayment) / Math.log(1 + rate);
      totalPaidWithExtra = totalPayment * monthsWithExtra;
      totalInterestWithExtra = totalPaidWithExtra - balance;
      savingsWithExtra = totalInterest - totalInterestWithExtra;
      timeSavedWithExtra = months - monthsWithExtra;
    }

    setResult({
      currentBalance: balance,
      monthlyPayment: payment,
      payoffTime: months,
      totalInterest,
      totalPaid,
      interestRate: parseFloat(interestRate),
      currency,
      calculationType: 'single-debt',
      extraPayment: extra > 0 ? extra : undefined,
      savingsWithExtra: extra > 0 ? savingsWithExtra : undefined,
      timeSavedWithExtra: extra > 0 ? timeSavedWithExtra : undefined
    });
  };

  const calculateMultipleDebts = () => {
    const extra = parseFloat(totalExtraPayment) || 0;
    
    // Sort debts based on strategy
    const sortedDebts = [...debts].sort((a, b) => {
      if (payoffStrategy === 'avalanche') {
        return b.interestRate - a.interestRate; // Highest interest first
      } else {
        return a.balance - b.balance; // Lowest balance first (snowball)
      }
    });

    // Calculate payoff plan
    let totalMonths = 0;
    let totalInterestPaid = 0;
    let totalAmountPaid = 0;
    const payoffPlan: any[] = [];

    let remainingDebts = sortedDebts.map(debt => ({ ...debt }));
    let availableExtra = extra;

    while (remainingDebts.length > 0) {
      totalMonths++;
      
      // Pay minimum on all debts
      remainingDebts.forEach(debt => {
        const monthlyInterest = (debt.balance * debt.interestRate / 100) / 12;
        const principalPayment = Math.min(debt.minimumPayment - monthlyInterest, debt.balance);
        debt.balance = Math.max(0, debt.balance - principalPayment);
        totalInterestPaid += monthlyInterest;
        totalAmountPaid += debt.minimumPayment;
      });

      // Apply extra payment to first debt
      if (availableExtra > 0 && remainingDebts.length > 0) {
        const targetDebt = remainingDebts[0];
        const extraApplied = Math.min(availableExtra, targetDebt.balance);
        targetDebt.balance = Math.max(0, targetDebt.balance - extraApplied);
        totalAmountPaid += extraApplied;
      }

      // Remove paid-off debts
      remainingDebts = remainingDebts.filter(debt => debt.balance > 0);
    }

    const totalBalance = debts.reduce((sum, debt) => sum + debt.balance, 0);
    const totalMinimum = debts.reduce((sum, debt) => sum + debt.minimumPayment, 0);

    setMultipleDebtsResult({
      totalBalance,
      totalMinimum,
      payoffTime: totalMonths,
      totalInterest: totalInterestPaid,
      totalPaid: totalAmountPaid,
      strategy: payoffStrategy,
      extraPayment: extra,
      debts: sortedDebts
    });
  };

  const calculateTargetPayment = () => {
    const balance = parseFloat(targetBalance);
    const rate = parseFloat(targetRate) / 100 / 12;
    const months = parseFloat(targetMonths);
    
    if (balance <= 0 || months <= 0 || rate < 0) return;

    // Calculate required monthly payment
    const requiredPayment = (balance * rate * Math.pow(1 + rate, months)) / (Math.pow(1 + rate, months) - 1);
    const totalPaid = requiredPayment * months;
    const totalInterest = totalPaid - balance;

    setResult({
      currentBalance: balance,
      monthlyPayment: requiredPayment,
      payoffTime: months,
      totalInterest,
      totalPaid,
      interestRate: parseFloat(targetRate),
      currency,
      calculationType: 'target-payment'
    });
  };

  const resetCalculator = () => {
    setCurrentBalance('5000');
    setInterestRate('18.5');
    setMonthlyPayment('150');
    setExtraPayment('0');
    setTargetBalance('10000');
    setTargetRate('16.0');
    setTargetMonths('24');
    setTotalExtraPayment('100');
    setCurrency('USD');
    setCountry('US');
    setResult(null);
    setMultipleDebtsResult(null);
  };

  const handleCountryChange = (newCountry: string) => {
    setCountry(newCountry);
    const countryData = countries.find(c => c.code === newCountry);
    if (countryData) {
      setCurrency(countryData.currency);
      setInterestRate(countryData.avgCreditRate.toString());
      setTargetRate(countryData.avgCreditRate.toString());
    }
  };

  const addDebt = () => {
    const newDebt: DebtEntry = {
      id: Date.now().toString(),
      name: `Debt ${debts.length + 1}`,
      balance: 1000,
      interestRate: 15.0,
      minimumPayment: 25
    };
    setDebts([...debts, newDebt]);
  };

  const removeDebt = (id: string) => {
    setDebts(debts.filter(debt => debt.id !== id));
  };

  const updateDebt = (id: string, field: keyof DebtEntry, value: any) => {
    setDebts(debts.map(debt => 
      debt.id === id ? { ...debt, [field]: value } : debt
    ));
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
        <title>Debt Payoff Calculator - Plan Your Debt Freedom Strategy | ToolsHub</title>
        <meta name="description" content="Free debt payoff calculator to compare snowball vs avalanche strategies. Calculate payoff time, interest savings, and create your debt elimination plan with multiple payment methods." />
        <meta name="keywords" content="debt payoff calculator, debt snowball, debt avalanche, debt elimination, credit card payoff, debt consolidation, debt freedom, debt reduction strategy" />
        <meta property="og:title" content="Debt Payoff Calculator - Plan Your Debt Freedom Strategy | ToolsHub" />
        <meta property="og:description" content="Free debt payoff calculator to compare snowball vs avalanche strategies. Calculate payoff time, interest savings, and create your debt elimination plan." />
        <meta property="og:type" content="website" />
        <link rel="canonical" href="/tools/debt-payoff-calculator" />
      </Helmet>
      
      <Header />
      
      <main>
        {/* Hero Section */}
        <section className="gradient-hero text-white py-16 pt-24">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="w-20 h-20 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <CreditCard className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold mb-6">
              Debt Payoff Calculator
            </h1>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto">
              Calculate time to pay off debts and compare strategies to become debt-free faster
            </p>
          </div>
        </section>

        <div className="max-w-6xl mx-auto px-4 py-12">
          <Card className="bg-white shadow-sm border-0">
            <CardContent className="p-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                {/* Input Section */}
                <div className="space-y-6">
                  <h2 className="text-2xl font-semibold text-gray-900 mb-8">Debt Payoff Calculator</h2>
                  
                  {/* Country Selection */}
                  <div className="space-y-3">
                    <Label htmlFor="country" className="text-sm font-medium text-gray-700">
                      Country (Sets typical credit card rates)
                    </Label>
                    <Select value={country} onValueChange={handleCountryChange}>
                      <SelectTrigger className="h-12 border-gray-200 rounded-lg">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {countries.map((country) => (
                          <SelectItem key={country.code} value={country.code}>
                            {country.name} ({country.avgCreditRate}%)
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <div className="text-xs text-gray-500">
                      Average credit card rate: {currentCountryData.avgCreditRate}% annually
                    </div>
                  </div>

                  {/* Calculation Type Tabs */}
                  <Tabs value={calculationType} onValueChange={setCalculationType} className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="single-debt">Single Debt</TabsTrigger>
                      <TabsTrigger value="multiple-debts">Multiple Debts</TabsTrigger>
                      <TabsTrigger value="target-payment">Target Payment</TabsTrigger>
                    </TabsList>

                    <TabsContent value="single-debt" className="space-y-6 mt-6">
                      <div className="space-y-3">
                        <Label htmlFor="current-balance" className="text-sm font-medium text-gray-700">
                          Current Balance ({currency})
                        </Label>
                        <Input
                          id="current-balance"
                          type="number"
                          value={currentBalance}
                          onChange={(e) => setCurrentBalance(e.target.value)}
                          className="h-12 text-base border-gray-200 rounded-lg"
                          placeholder="5,000"
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
                          value={interestRate}
                          onChange={(e) => setInterestRate(e.target.value)}
                          className="h-12 text-base border-gray-200 rounded-lg"
                          placeholder="18.5"
                          min="0"
                          max="50"
                          step="0.1"
                        />
                      </div>

                      <div className="space-y-3">
                        <Label htmlFor="monthly-payment" className="text-sm font-medium text-gray-700">
                          Monthly Payment ({currency})
                        </Label>
                        <Input
                          id="monthly-payment"
                          type="number"
                          value={monthlyPayment}
                          onChange={(e) => setMonthlyPayment(e.target.value)}
                          className="h-12 text-base border-gray-200 rounded-lg"
                          placeholder="150"
                          min="0"
                          step="0.01"
                        />
                      </div>

                      <div className="space-y-3">
                        <Label htmlFor="extra-payment" className="text-sm font-medium text-gray-700">
                          Extra Payment ({currency}) - Optional
                        </Label>
                        <Input
                          id="extra-payment"
                          type="number"
                          value={extraPayment}
                          onChange={(e) => setExtraPayment(e.target.value)}
                          className="h-12 text-base border-gray-200 rounded-lg"
                          placeholder="0"
                          min="0"
                          step="0.01"
                        />
                      </div>
                    </TabsContent>

                    <TabsContent value="multiple-debts" className="space-y-6 mt-6">
                      <div className="space-y-3">
                        <Label className="text-sm font-medium text-gray-700">
                          Payoff Strategy
                        </Label>
                        <Select value={payoffStrategy} onValueChange={setPayoffStrategy}>
                          <SelectTrigger className="h-12 border-gray-200 rounded-lg">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="avalanche">Debt Avalanche (Highest Interest First)</SelectItem>
                            <SelectItem value="snowball">Debt Snowball (Lowest Balance First)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-3">
                        <Label className="text-sm font-medium text-gray-700">
                          Your Debts
                        </Label>
                        <div className="space-y-3 max-h-60 overflow-y-auto">
                          {debts.map((debt) => (
                            <div key={debt.id} className="bg-gray-50 p-4 rounded-lg">
                              <div className="grid grid-cols-2 gap-3 mb-3">
                                <Input
                                  placeholder="Debt name"
                                  value={debt.name}
                                  onChange={(e) => updateDebt(debt.id, 'name', e.target.value)}
                                  className="text-sm"
                                />
                                <Button
                                  onClick={() => removeDebt(debt.id)}
                                  variant="outline"
                                  size="sm"
                                  className="text-red-600"
                                >
                                  Remove
                                </Button>
                              </div>
                              <div className="grid grid-cols-3 gap-3">
                                <Input
                                  type="number"
                                  placeholder="Balance"
                                  value={debt.balance}
                                  onChange={(e) => updateDebt(debt.id, 'balance', parseFloat(e.target.value) || 0)}
                                  className="text-sm"
                                />
                                <Input
                                  type="number"
                                  placeholder="Rate %"
                                  value={debt.interestRate}
                                  onChange={(e) => updateDebt(debt.id, 'interestRate', parseFloat(e.target.value) || 0)}
                                  className="text-sm"
                                />
                                <Input
                                  type="number"
                                  placeholder="Min Payment"
                                  value={debt.minimumPayment}
                                  onChange={(e) => updateDebt(debt.id, 'minimumPayment', parseFloat(e.target.value) || 0)}
                                  className="text-sm"
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                        <Button onClick={addDebt} variant="outline" className="w-full">
                          Add Another Debt
                        </Button>
                      </div>

                      <div className="space-y-3">
                        <Label htmlFor="total-extra" className="text-sm font-medium text-gray-700">
                          Total Extra Payment ({currency})
                        </Label>
                        <Input
                          id="total-extra"
                          type="number"
                          value={totalExtraPayment}
                          onChange={(e) => setTotalExtraPayment(e.target.value)}
                          className="h-12 text-base border-gray-200 rounded-lg"
                          placeholder="100"
                          min="0"
                          step="0.01"
                        />
                      </div>
                    </TabsContent>

                    <TabsContent value="target-payment" className="space-y-6 mt-6">
                      <div className="space-y-3">
                        <Label htmlFor="target-balance" className="text-sm font-medium text-gray-700">
                          Current Balance ({currency})
                        </Label>
                        <Input
                          id="target-balance"
                          type="number"
                          value={targetBalance}
                          onChange={(e) => setTargetBalance(e.target.value)}
                          className="h-12 text-base border-gray-200 rounded-lg"
                          placeholder="10,000"
                          min="0"
                          step="0.01"
                        />
                      </div>

                      <div className="space-y-3">
                        <Label htmlFor="target-rate" className="text-sm font-medium text-gray-700">
                          Annual Interest Rate (%)
                        </Label>
                        <Input
                          id="target-rate"
                          type="number"
                          value={targetRate}
                          onChange={(e) => setTargetRate(e.target.value)}
                          className="h-12 text-base border-gray-200 rounded-lg"
                          placeholder="16.0"
                          min="0"
                          max="50"
                          step="0.1"
                        />
                      </div>

                      <div className="space-y-3">
                        <Label htmlFor="target-months" className="text-sm font-medium text-gray-700">
                          Target Payoff Time (Months)
                        </Label>
                        <Input
                          id="target-months"
                          type="number"
                          value={targetMonths}
                          onChange={(e) => setTargetMonths(e.target.value)}
                          className="h-12 text-base border-gray-200 rounded-lg"
                          placeholder="24"
                          min="1"
                          max="600"
                        />
                      </div>
                    </TabsContent>
                  </Tabs>

                  {/* Action Buttons */}
                  <div className="flex gap-4 pt-6">
                    <Button
                      onClick={calculateDebtPayoff}
                      className="flex-1 h-12 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg"
                    >
                      <CreditCard className="w-4 h-4 mr-2" />
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
                  <h2 className="text-2xl font-semibold text-gray-900 mb-8">Payoff Plan</h2>
                  
                  {(result || multipleDebtsResult) ? (
                    <div className="space-y-6">
                      {/* Main Results */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white rounded-lg p-4 border border-gray-100">
                          <div className="text-center space-y-2">
                            <div className="text-sm text-gray-600">
                              {calculationType === 'target-payment' ? 'Required Payment' : 'Payoff Time'}
                            </div>
                            <div className="text-2xl font-bold text-blue-600">
                              {calculationType === 'target-payment' 
                                ? formatCurrency(result!.monthlyPayment)
                                : formatTime(result?.payoffTime || multipleDebtsResult?.payoffTime)}
                            </div>
                          </div>
                        </div>
                        <div className="bg-white rounded-lg p-4 border border-gray-100">
                          <div className="text-center space-y-2">
                            <div className="text-sm text-gray-600">Total Interest</div>
                            <div className="text-2xl font-bold text-red-600">
                              {formatCurrency(result?.totalInterest || multipleDebtsResult?.totalInterest)}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Detailed Breakdown */}
                      {result && (
                        <div className="space-y-4">
                          <h3 className="text-lg font-semibold text-gray-900">Debt Details</h3>
                          
                          <div className="flex justify-between items-center py-3 border-b border-gray-200">
                            <span className="text-gray-600">Current Balance</span>
                            <span className="font-semibold text-gray-900">
                              {formatCurrency(result.currentBalance)}
                            </span>
                          </div>
                          <div className="flex justify-between items-center py-3 border-b border-gray-200">
                            <span className="text-gray-600">Monthly Payment</span>
                            <span className="font-semibold text-blue-600">
                              {formatCurrency(result.monthlyPayment)}
                            </span>
                          </div>
                          <div className="flex justify-between items-center py-3 border-b border-gray-200">
                            <span className="text-gray-600">Payoff Time</span>
                            <span className="font-semibold text-gray-900">
                              {formatTime(result.payoffTime)}
                            </span>
                          </div>
                          <div className="flex justify-between items-center py-3 border-b border-gray-200">
                            <span className="text-gray-600">Total Interest</span>
                            <span className="font-semibold text-red-600">
                              {formatCurrency(result.totalInterest)}
                            </span>
                          </div>
                          <div className="flex justify-between items-center py-3">
                            <span className="text-gray-600">Total Paid</span>
                            <span className="font-semibold text-purple-600">
                              {formatCurrency(result.totalPaid)}
                            </span>
                          </div>

                          {/* Extra Payment Benefits */}
                          {result.extraPayment && result.savingsWithExtra && (
                            <div className="mt-8 bg-green-50 rounded-lg p-4">
                              <h4 className="text-sm font-semibold text-green-900 mb-2">Extra Payment Benefits:</h4>
                              <div className="space-y-1 text-sm text-green-800">
                                <div>Interest Saved: {formatCurrency(result.savingsWithExtra)}</div>
                                <div>Time Saved: {formatTime(result.timeSavedWithExtra!)}</div>
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Multiple Debts Results */}
                      {multipleDebtsResult && (
                        <div className="space-y-4">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {multipleDebtsResult.strategy === 'avalanche' ? 'Debt Avalanche' : 'Debt Snowball'} Strategy
                          </h3>
                          
                          <div className="flex justify-between items-center py-3 border-b border-gray-200">
                            <span className="text-gray-600">Total Debt</span>
                            <span className="font-semibold text-gray-900">
                              {formatCurrency(multipleDebtsResult.totalBalance)}
                            </span>
                          </div>
                          <div className="flex justify-between items-center py-3 border-b border-gray-200">
                            <span className="text-gray-600">Total Monthly Minimum</span>
                            <span className="font-semibold text-blue-600">
                              {formatCurrency(multipleDebtsResult.totalMinimum)}
                            </span>
                          </div>
                          <div className="flex justify-between items-center py-3 border-b border-gray-200">
                            <span className="text-gray-600">Extra Payment</span>
                            <span className="font-semibold text-green-600">
                              {formatCurrency(multipleDebtsResult.extraPayment)}
                            </span>
                          </div>
                          <div className="flex justify-between items-center py-3">
                            <span className="text-gray-600">Debt-Free Date</span>
                            <span className="font-semibold text-purple-600">
                              {formatTime(multipleDebtsResult.payoffTime)}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <CreditCard className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500">Enter your debt details to calculate payoff plan</p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* What is a Debt Payoff Calculator */}
          <section className="mt-12 bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">What is a Debt Payoff Calculator?</h2>
            <div className="prose max-w-none text-gray-600 space-y-4">
              <p className="text-lg leading-relaxed">
                A debt payoff calculator is a powerful financial tool that helps you create a strategic plan to eliminate your debts faster and save money on interest payments. 
                Our comprehensive calculator analyzes your current debts, interest rates, and payment capabilities to show you exactly how long it will take to become debt-free 
                and how much interest you'll pay over time.
              </p>
              <p className="leading-relaxed">
                Whether you have credit card debt, personal loans, student loans, or multiple debts, this calculator provides clear insights into different repayment strategies, 
                helping you choose the most effective approach for your financial situation. By comparing the debt snowball method against the debt avalanche strategy, 
                you can make informed decisions that align with both your financial goals and psychological preferences.
              </p>
            </div>
          </section>

          {/* How to Use the Debt Payoff Calculator */}
          <section className="mt-12 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">How to Use the Debt Payoff Calculator</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <span className="text-2xl font-bold text-blue-600">1</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Enter Your Debt Information</h3>
                <p className="text-gray-600">
                  Input your current balance, annual interest rate, and minimum monthly payment for each debt. 
                  For multiple debts, add all your credit cards, loans, and other obligations.
                </p>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                  <span className="text-2xl font-bold text-green-600">2</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Choose Your Strategy</h3>
                <p className="text-gray-600">
                  Select between debt avalanche (highest interest first) or debt snowball (smallest balance first). 
                  Add any extra payment amount you can afford each month.
                </p>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                  <span className="text-2xl font-bold text-purple-600">3</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Analyze Your Results</h3>
                <p className="text-gray-600">
                  Review your debt-free date, total interest savings, and monthly payment breakdowns. 
                  Compare different strategies to find the best approach for your situation.
                </p>
              </div>
            </div>
          </section>

          {/* Debt Payoff Strategies Comparison */}
          <section className="mt-12 bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">Debt Payoff Strategies: Snowball vs Avalanche</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="border-l-4 border-red-500 pl-6">
                <h3 className="text-2xl font-semibold text-gray-900 mb-4">🏔️ Debt Avalanche Method</h3>
                <p className="text-gray-600 mb-4">
                  The debt avalanche method focuses on paying off debts with the highest interest rates first while making minimum payments on other debts. 
                  This mathematically optimal approach saves the most money in interest payments over time.
                </p>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-red-500 rounded-full mr-3"></div>
                    <span className="text-gray-700">Minimizes total interest paid</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-red-500 rounded-full mr-3"></div>
                    <span className="text-gray-700">Mathematically most efficient</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-red-500 rounded-full mr-3"></div>
                    <span className="text-gray-700">Best for disciplined individuals</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-red-500 rounded-full mr-3"></div>
                    <span className="text-gray-700">May take longer to see progress</span>
                  </div>
                </div>
              </div>
              
              <div className="border-l-4 border-blue-500 pl-6">
                <h3 className="text-2xl font-semibold text-gray-900 mb-4">⚡ Debt Snowball Method</h3>
                <p className="text-gray-600 mb-4">
                  The debt snowball method prioritizes paying off the smallest balances first, regardless of interest rates. 
                  This approach provides psychological wins and momentum that can help you stay motivated throughout your debt payoff journey.
                </p>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                    <span className="text-gray-700">Quick psychological victories</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                    <span className="text-gray-700">Builds momentum and motivation</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                    <span className="text-gray-700">Simplifies debt management</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                    <span className="text-gray-700">May cost more in total interest</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Benefits and Use Cases */}
          <section className="mt-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Benefits & Use Cases</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <Card className="bg-white border-0 shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-8">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                    <CreditCard className="w-6 h-6 text-green-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Credit Card Debt Elimination</h3>
                  <p className="text-gray-600">
                    Calculate the most efficient way to pay off multiple credit cards with different interest rates and balances. 
                    See how extra payments can dramatically reduce your payoff time and save thousands in interest.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-white border-0 shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-8">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                    <span className="text-2xl">📊</span>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Financial Planning</h3>
                  <p className="text-gray-600">
                    Create a realistic debt elimination timeline that fits your budget. Plan major financial decisions around your debt-free date 
                    and understand how different payment amounts affect your timeline.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-white border-0 shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-8">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                    <span className="text-2xl">💰</span>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Interest Savings Analysis</h3>
                  <p className="text-gray-600">
                    Discover exactly how much money you can save by making extra payments or choosing the optimal payoff strategy. 
                    Visualize the long-term financial impact of your debt elimination decisions.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-white border-0 shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-8">
                  <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                    <span className="text-2xl">🎯</span>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Debt Consolidation Planning</h3>
                  <p className="text-gray-600">
                    Compare your current payment plan with potential consolidation loans. Determine if consolidating multiple debts 
                    into a single lower-interest loan would save you money and simplify your finances.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-white border-0 shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-8">
                  <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mb-4">
                    <span className="text-2xl">⏰</span>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Budget Optimization</h3>
                  <p className="text-gray-600">
                    Find the right balance between debt payments and other financial goals. See how different payment amounts 
                    affect your debt-free timeline and total interest costs to optimize your monthly budget allocation.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-white border-0 shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-8">
                  <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                    <span className="text-2xl">📈</span>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Motivation & Progress Tracking</h3>
                  <p className="text-gray-600">
                    Stay motivated by seeing your debt elimination progress in concrete numbers. Track how extra payments 
                    and windfalls accelerate your journey to financial freedom and debt independence.
                  </p>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Advanced Tips and Strategies */}
          <section className="mt-12 bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">Advanced Debt Payoff Strategies</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="bg-white rounded-lg p-6 shadow-sm">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">💡 Extra Payment Optimization</h3>
                  <ul className="space-y-2 text-gray-600">
                    <li>• Use tax refunds and bonuses for lump-sum payments</li>
                    <li>• Apply salary increases directly to debt payments</li>
                    <li>• Round up monthly payments to the nearest $50 or $100</li>
                    <li>• Make bi-weekly payments instead of monthly</li>
                  </ul>
                </div>
                
                <div className="bg-white rounded-lg p-6 shadow-sm">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">🔄 Balance Transfer Considerations</h3>
                  <ul className="space-y-2 text-gray-600">
                    <li>• Look for 0% APR promotional offers</li>
                    <li>• Factor in balance transfer fees (typically 3-5%)</li>
                    <li>• Have a payoff plan before the promotional rate expires</li>
                    <li>• Avoid accumulating new debt on cleared cards</li>
                  </ul>
                </div>
              </div>
              
              <div className="space-y-6">
                <div className="bg-white rounded-lg p-6 shadow-sm">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">📱 Technology & Automation</h3>
                  <ul className="space-y-2 text-gray-600">
                    <li>• Set up automatic extra payments</li>
                    <li>• Use budgeting apps to track progress</li>
                    <li>• Enable balance alerts and payment reminders</li>
                    <li>• Automate savings to prevent new debt accumulation</li>
                  </ul>
                </div>
                
                <div className="bg-white rounded-lg p-6 shadow-sm">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">🛡️ Preventing Future Debt</h3>
                  <ul className="space-y-2 text-gray-600">
                    <li>• Build an emergency fund while paying off debt</li>
                    <li>• Create a sustainable budget you can maintain</li>
                    <li>• Address underlying spending habits and triggers</li>
                    <li>• Consider closing paid-off credit cards if necessary</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* FAQ Section */}
          <section className="mt-12 bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">Frequently Asked Questions</h2>
            <div className="space-y-6">
              <div className="border-b border-gray-200 pb-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Should I pay off debt or save money first?</h3>
                <p className="text-gray-600">
                  Generally, focus on paying off high-interest debt (above 6-8%) while building a small emergency fund ($500-$1,000). 
                  Once you have basic emergency coverage, prioritize debt elimination since the guaranteed "return" on debt payments 
                  often exceeds potential investment returns after taxes and risk.
                </p>
              </div>
              
              <div className="border-b border-gray-200 pb-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">How much extra should I pay toward debt each month?</h3>
                <p className="text-gray-600">
                  Pay as much extra as you can afford without compromising essential expenses or a basic emergency fund. 
                  Even an extra $25-50 per month can significantly reduce your payoff time. Use our calculator to see how different 
                  extra payment amounts affect your timeline and total interest costs.
                </p>
              </div>
              
              <div className="border-b border-gray-200 pb-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Is debt consolidation always a good idea?</h3>
                <p className="text-gray-600">
                  Debt consolidation can be beneficial if you qualify for a lower interest rate and it simplifies your payments. 
                  However, it's not helpful if you don't address the underlying spending habits or if you accumulate new debt on cleared cards. 
                  Use our calculator to compare your current plan with potential consolidation scenarios.
                </p>
              </div>
              
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Which is better: debt snowball or avalanche?</h3>
                <p className="text-gray-600">
                  The avalanche method saves more money mathematically, while the snowball method provides psychological benefits and motivation. 
                  Choose avalanche if you're disciplined and motivated by saving money, or snowball if you need quick wins to stay motivated. 
                  The best method is the one you'll actually stick with consistently.
                </p>
              </div>
            </div>
          </section>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
