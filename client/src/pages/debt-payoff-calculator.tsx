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
        <title>Debt Payoff Calculator - Plan Your Debt Freedom Strategy | DapsiWow</title>
        <meta name="description" content="Free debt payoff calculator to compare snowball vs avalanche strategies. Calculate payoff time, interest savings, and create your debt elimination plan with multiple payment methods." />
        <meta name="keywords" content="debt payoff calculator, debt snowball, debt avalanche, debt elimination, credit card payoff, debt consolidation, debt freedom, debt reduction strategy" />
        <meta property="og:title" content="Debt Payoff Calculator - Plan Your Debt Freedom Strategy | DapsiWow" />
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

          
        </div>
      </main>

      <Footer />
    </div>
  );
}