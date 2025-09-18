
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
  const [showSchedule, setShowSchedule] = useState(false);

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
    setShowSchedule(false);
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Helmet>
        <title>Debt Payoff Calculator - Plan Your Debt Freedom Strategy | DapsiWow</title>
        <meta name="description" content="Free debt payoff calculator to compare snowball vs avalanche strategies. Calculate payoff time, interest savings, and create your debt elimination plan with multiple payment methods." />
        <meta name="keywords" content="debt payoff calculator, debt snowball, debt avalanche, debt elimination, credit card payoff, debt consolidation, debt freedom, debt reduction strategy, debt payoff plan, debt management calculator" />
        <meta property="og:title" content="Debt Payoff Calculator - Plan Your Debt Freedom Strategy | DapsiWow" />
        <meta property="og:description" content="Free debt payoff calculator to compare snowball vs avalanche strategies. Calculate payoff time, interest savings, and create your debt elimination plan." />
        <meta property="og:type" content="website" />
        <meta name="robots" content="index, follow" />
        <meta name="author" content="DapsiWow" />
        <link rel="canonical" href="https://dapsiwow.com/tools/debt-payoff-calculator" />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            "name": "Debt Payoff Calculator",
            "description": "Free online debt payoff calculator to compare debt elimination strategies including debt snowball and debt avalanche methods. Calculate payoff time, interest savings, and create your debt freedom plan.",
            "url": "https://dapsiwow.com/tools/debt-payoff-calculator",
            "applicationCategory": "FinanceApplication",
            "operatingSystem": "Any",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "USD"
            },
            "featureList": [
              "Debt snowball calculator",
              "Debt avalanche calculator",
              "Multiple debt payoff planning",
              "Interest savings calculator",
              "Payoff time estimation",
              "Support for multiple currencies"
            ]
          })}
        </script>
      </Helmet>

      <Header />

      <main>
        {/* Hero Section */}
        <section className="relative py-12 sm:py-16 md:py-20 lg:py-24 xl:py-28 2xl:py-32 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-indigo-600/20"></div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="space-y-4 sm:space-y-6 md:space-y-7 lg:space-y-8">
              <div className="inline-flex items-center px-3 sm:px-4 py-1.5 sm:py-2 bg-white/80 backdrop-blur-sm rounded-full border border-blue-200">
                <span className="text-xs sm:text-sm font-medium text-blue-700">Professional Debt Payoff Calculator</span>
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl 2xl:text-8xl font-bold text-slate-900 leading-tight tracking-tight">
                <span className="block">Smart Debt</span>
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 mt-1 sm:mt-2">
                  Payoff Calculator
                </span>
              </h1>
              <p className="text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl text-slate-600 max-w-sm sm:max-w-lg md:max-w-2xl lg:max-w-3xl xl:max-w-4xl mx-auto leading-relaxed px-2 sm:px-0">
                Compare debt elimination strategies and create your path to financial freedom with snowball vs avalanche methods
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
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">Debt Payoff Configuration</h2>
                    <p className="text-gray-600">Enter your debt details to create an optimized payoff strategy</p>
                  </div>

                  {/* Country Selection */}
                  <div className="space-y-3">
                    <Label htmlFor="country" className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                      Country
                    </Label>
                    <Select value={country} onValueChange={handleCountryChange}>
                      <SelectTrigger className="h-14 border-2 border-gray-200 rounded-xl text-lg">
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

                  {/* Currency Selection */}
                  <div className="space-y-3">
                    <Label htmlFor="currency" className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                      Currency
                    </Label>
                    <Select value={currency} onValueChange={setCurrency}>
                      <SelectTrigger className="h-14 border-2 border-gray-200 rounded-xl text-lg">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USD">USD - US Dollar</SelectItem>
                        <SelectItem value="EUR">EUR - Euro</SelectItem>
                        <SelectItem value="GBP">GBP - British Pound</SelectItem>
                        <SelectItem value="CAD">CAD - Canadian Dollar</SelectItem>
                        <SelectItem value="AUD">AUD - Australian Dollar</SelectItem>
                        <SelectItem value="JPY">JPY - Japanese Yen</SelectItem>
                        <SelectItem value="KRW">KRW - Korean Won</SelectItem>
                        <SelectItem value="INR">INR - Indian Rupee</SelectItem>
                        <SelectItem value="BRL">BRL - Brazilian Real</SelectItem>
                        <SelectItem value="MXN">MXN - Mexican Peso</SelectItem>
                        <SelectItem value="SGD">SGD - Singapore Dollar</SelectItem>
                        <SelectItem value="NZD">NZD - New Zealand Dollar</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Calculation Type Tabs */}
                  <Tabs value={calculationType} onValueChange={setCalculationType} className="w-full">
                    <TabsList className="grid w-full grid-cols-3 h-14 bg-gray-100 rounded-xl p-1">
                      <TabsTrigger value="single-debt" className="h-12 text-sm font-medium rounded-lg">Single Debt</TabsTrigger>
                      <TabsTrigger value="multiple-debts" className="h-12 text-sm font-medium rounded-lg">Multiple Debts</TabsTrigger>
                      <TabsTrigger value="target-payment" className="h-12 text-sm font-medium rounded-lg">Target Payment</TabsTrigger>
                    </TabsList>

                    <TabsContent value="single-debt" className="space-y-6 mt-8">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-3">
                          <Label htmlFor="current-balance" className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                            Current Balance
                          </Label>
                          <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-lg">$</span>
                            <Input
                              id="current-balance"
                              type="number"
                              value={currentBalance}
                              onChange={(e) => setCurrentBalance(e.target.value)}
                              className="h-14 pl-8 text-lg border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-blue-500"
                              placeholder="5,000"
                              min="0"
                              step="0.01"
                            />
                          </div>
                        </div>

                        <div className="space-y-3">
                          <Label htmlFor="interest-rate" className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                            Annual Interest Rate
                          </Label>
                          <div className="relative">
                            <Input
                              id="interest-rate"
                              type="number"
                              value={interestRate}
                              onChange={(e) => setInterestRate(e.target.value)}
                              className="h-14 pr-8 text-lg border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-blue-500"
                              placeholder="18.5"
                              min="0"
                              max="50"
                              step="0.1"
                            />
                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 text-lg">%</span>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <Label htmlFor="monthly-payment" className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                            Monthly Payment
                          </Label>
                          <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-lg">$</span>
                            <Input
                              id="monthly-payment"
                              type="number"
                              value={monthlyPayment}
                              onChange={(e) => setMonthlyPayment(e.target.value)}
                              className="h-14 pl-8 text-lg border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-blue-500"
                              placeholder="150"
                              min="0"
                              step="0.01"
                            />
                          </div>
                        </div>

                        <div className="space-y-3">
                          <Label htmlFor="extra-payment" className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                            Extra Payment (Optional)
                          </Label>
                          <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-lg">$</span>
                            <Input
                              id="extra-payment"
                              type="number"
                              value={extraPayment}
                              onChange={(e) => setExtraPayment(e.target.value)}
                              className="h-14 pl-8 text-lg border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-blue-500"
                              placeholder="0"
                              min="0"
                              step="0.01"
                            />
                          </div>
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="multiple-debts" className="space-y-6 mt-8">
                      <div className="space-y-6">
                        <div className="space-y-3">
                          <Label className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                            Payoff Strategy
                          </Label>
                          <Select value={payoffStrategy} onValueChange={setPayoffStrategy}>
                            <SelectTrigger className="h-14 border-2 border-gray-200 rounded-xl text-lg">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="avalanche">Debt Avalanche (Highest Interest First)</SelectItem>
                              <SelectItem value="snowball">Debt Snowball (Lowest Balance First)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-3">
                          <Label className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                            Your Debts
                          </Label>
                          <div className="space-y-4 max-h-80 overflow-y-auto bg-gray-50 rounded-xl p-4">
                            {debts.map((debt) => (
                              <div key={debt.id} className="bg-white p-4 rounded-xl border border-gray-200">
                                <div className="grid grid-cols-2 gap-3 mb-3">
                                  <Input
                                    placeholder="Debt name"
                                    value={debt.name}
                                    onChange={(e) => updateDebt(debt.id, 'name', e.target.value)}
                                    className="h-12 text-sm border-2 border-gray-200 rounded-lg"
                                  />
                                  <Button
                                    onClick={() => removeDebt(debt.id)}
                                    variant="outline"
                                    className="h-12 text-red-600 hover:text-red-700 hover:bg-red-50 border-2 border-gray-200 rounded-lg"
                                  >
                                    Remove
                                  </Button>
                                </div>
                                <div className="grid grid-cols-3 gap-3">
                                  <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">$</span>
                                    <Input
                                      type="number"
                                      placeholder="Balance"
                                      value={debt.balance}
                                      onChange={(e) => updateDebt(debt.id, 'balance', parseFloat(e.target.value) || 0)}
                                      className="h-12 pl-7 text-sm border-2 border-gray-200 rounded-lg"
                                    />
                                  </div>
                                  <div className="relative">
                                    <Input
                                      type="number"
                                      placeholder="Rate %"
                                      value={debt.interestRate}
                                      onChange={(e) => updateDebt(debt.id, 'interestRate', parseFloat(e.target.value) || 0)}
                                      className="h-12 pr-7 text-sm border-2 border-gray-200 rounded-lg"
                                    />
                                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">%</span>
                                  </div>
                                  <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">$</span>
                                    <Input
                                      type="number"
                                      placeholder="Min Payment"
                                      value={debt.minimumPayment}
                                      onChange={(e) => updateDebt(debt.id, 'minimumPayment', parseFloat(e.target.value) || 0)}
                                      className="h-12 pl-7 text-sm border-2 border-gray-200 rounded-lg"
                                    />
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                          <Button onClick={addDebt} variant="outline" className="w-full h-12 border-2 border-gray-200 rounded-xl text-gray-700 hover:bg-gray-50">
                            Add Another Debt
                          </Button>
                        </div>

                        <div className="space-y-3">
                          <Label htmlFor="total-extra" className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                            Total Extra Payment
                          </Label>
                          <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-lg">$</span>
                            <Input
                              id="total-extra"
                              type="number"
                              value={totalExtraPayment}
                              onChange={(e) => setTotalExtraPayment(e.target.value)}
                              className="h-14 pl-8 text-lg border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-blue-500"
                              placeholder="100"
                              min="0"
                              step="0.01"
                            />
                          </div>
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="target-payment" className="space-y-6 mt-8">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-3">
                          <Label htmlFor="target-balance" className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                            Current Balance
                          </Label>
                          <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-lg">$</span>
                            <Input
                              id="target-balance"
                              type="number"
                              value={targetBalance}
                              onChange={(e) => setTargetBalance(e.target.value)}
                              className="h-14 pl-8 text-lg border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-blue-500"
                              placeholder="10,000"
                              min="0"
                              step="0.01"
                            />
                          </div>
                        </div>

                        <div className="space-y-3">
                          <Label htmlFor="target-rate" className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                            Annual Interest Rate
                          </Label>
                          <div className="relative">
                            <Input
                              id="target-rate"
                              type="number"
                              value={targetRate}
                              onChange={(e) => setTargetRate(e.target.value)}
                              className="h-14 pr-8 text-lg border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-blue-500"
                              placeholder="16.0"
                              min="0"
                              max="50"
                              step="0.1"
                            />
                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 text-lg">%</span>
                          </div>
                        </div>

                        <div className="space-y-3 md:col-span-2">
                          <Label htmlFor="target-months" className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                            Target Payoff Time (Months)
                          </Label>
                          <Input
                            id="target-months"
                            type="number"
                            value={targetMonths}
                            onChange={(e) => setTargetMonths(e.target.value)}
                            className="h-14 text-lg border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-blue-500 w-full md:w-64"
                            placeholder="24"
                            min="1"
                            max="600"
                          />
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-4 pt-6">
                    <Button
                      onClick={calculateDebtPayoff}
                      className="flex-1 h-14 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold text-lg rounded-xl shadow-lg transform transition-all duration-200 hover:scale-105"
                    >
                      Calculate Payoff Plan
                    </Button>
                    <Button
                      onClick={resetCalculator}
                      variant="outline"
                      className="h-14 px-8 border-2 border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold text-lg rounded-xl"
                    >
                      Reset
                    </Button>
                  </div>

                  {/* Show Schedule Button */}
                  {(result || multipleDebtsResult) && (
                    <div className="pt-4">
                      <Button
                        onClick={() => setShowSchedule(!showSchedule)}
                        variant="outline"
                        size="sm"
                        className="rounded-full border-2 border-gray-200 hover:bg-gray-50"
                      >
                        {showSchedule ? 'Hide' : 'Show'} Detailed Analysis
                      </Button>
                    </div>
                  )}
                </div>

                {/* Results Section */}
                <div className="bg-gradient-to-br from-gray-50 to-blue-50 p-8 lg:p-12">
                  <h2 className="text-2xl font-bold text-gray-900 mb-8">Payoff Results</h2>
                  
                  {(result || multipleDebtsResult) ? (
                    <div className="space-y-6">
                      {/* Main Results */}
                      {result && (
                        <>
                          <div className="bg-white rounded-2xl p-6 shadow-lg border border-blue-100">
                            <div className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-2">
                              {calculationType === 'target-payment' ? 'Required Payment' : 'Payoff Time'}
                            </div>
                            <div className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                              {calculationType === 'target-payment' 
                                ? formatCurrency(result.monthlyPayment)
                                : formatTime(result.payoffTime)}
                            </div>
                          </div>

                          <div className="space-y-4">
                            <div className="bg-white rounded-xl p-4 shadow-sm">
                              <div className="flex justify-between items-center">
                                <span className="font-medium text-gray-700">Current Balance</span>
                                <span className="font-bold text-gray-900">
                                  {formatCurrency(result.currentBalance)}
                                </span>
                              </div>
                            </div>
                            <div className="bg-white rounded-xl p-4 shadow-sm">
                              <div className="flex justify-between items-center">
                                <span className="font-medium text-gray-700">Monthly Payment</span>
                                <span className="font-bold text-blue-600">
                                  {formatCurrency(result.monthlyPayment)}
                                </span>
                              </div>
                            </div>
                            <div className="bg-white rounded-xl p-4 shadow-sm">
                              <div className="flex justify-between items-center">
                                <span className="font-medium text-gray-700">Total Interest</span>
                                <span className="font-bold text-orange-600">
                                  {formatCurrency(result.totalInterest)}
                                </span>
                              </div>
                            </div>
                            <div className="bg-white rounded-xl p-4 shadow-sm">
                              <div className="flex justify-between items-center">
                                <span className="font-medium text-gray-700">Total Paid</span>
                                <span className="font-bold text-gray-900">
                                  {formatCurrency(result.totalPaid)}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Extra Payment Benefits */}
                          {result.extraPayment && result.savingsWithExtra && (
                            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
                              <h4 className="font-bold text-green-800 mb-4 text-lg">Extra Payment Benefits</h4>
                              <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                  <span className="text-green-700 font-medium">Interest Saved:</span>
                                  <span className="font-bold text-green-800 text-lg">
                                    {formatCurrency(result.savingsWithExtra)}
                                  </span>
                                </div>
                                <div className="flex justify-between items-center">
                                  <span className="text-green-700 font-medium">Time Saved:</span>
                                  <span className="font-bold text-green-800 text-lg">
                                    {formatTime(result.timeSavedWithExtra!)}
                                  </span>
                                </div>
                              </div>
                            </div>
                          )}
                        </>
                      )}

                      {/* Multiple Debts Results */}
                      {multipleDebtsResult && (
                        <>
                          <div className="bg-white rounded-2xl p-6 shadow-lg border border-blue-100">
                            <div className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-2">Debt-Free In</div>
                            <div className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                              {formatTime(multipleDebtsResult.payoffTime)}
                            </div>
                          </div>

                          <div className="space-y-4">
                            <div className="bg-white rounded-xl p-4 shadow-sm">
                              <div className="flex justify-between items-center">
                                <span className="font-medium text-gray-700">Strategy</span>
                                <span className="font-bold text-purple-600">
                                  {multipleDebtsResult.strategy === 'avalanche' ? 'Debt Avalanche' : 'Debt Snowball'}
                                </span>
                              </div>
                            </div>
                            <div className="bg-white rounded-xl p-4 shadow-sm">
                              <div className="flex justify-between items-center">
                                <span className="font-medium text-gray-700">Total Debt</span>
                                <span className="font-bold text-gray-900">
                                  {formatCurrency(multipleDebtsResult.totalBalance)}
                                </span>
                              </div>
                            </div>
                            <div className="bg-white rounded-xl p-4 shadow-sm">
                              <div className="flex justify-between items-center">
                                <span className="font-medium text-gray-700">Monthly Payments</span>
                                <span className="font-bold text-blue-600">
                                  {formatCurrency(multipleDebtsResult.totalMinimum + multipleDebtsResult.extraPayment)}
                                </span>
                              </div>
                            </div>
                            <div className="bg-white rounded-xl p-4 shadow-sm">
                              <div className="flex justify-between items-center">
                                <span className="font-medium text-gray-700">Total Interest</span>
                                <span className="font-bold text-orange-600">
                                  {formatCurrency(multipleDebtsResult.totalInterest)}
                                </span>
                              </div>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-16">
                      <div className="w-20 h-20 bg-gray-200 rounded-full mx-auto mb-6 flex items-center justify-center">
                        <div className="text-3xl font-bold text-gray-400">$</div>
                      </div>
                      <p className="text-gray-500 text-lg">Enter your debt details and calculate to see payoff results</p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Detailed Analysis */}
          {(result || multipleDebtsResult) && showSchedule && (
            <Card className="mt-8 bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Detailed Analysis</h3>
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">
                    {multipleDebtsResult ? 'Debt Elimination Strategy' : 'Single Debt Analysis'}
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-gray-700">
                    <div>
                      <p className="mb-2">
                        <strong>Strategy:</strong> {multipleDebtsResult ? 
                          (multipleDebtsResult.strategy === 'avalanche' ? 'Pay highest interest rates first to minimize total interest paid' : 'Pay smallest balances first for psychological motivation') : 
                          'Single debt elimination with optional extra payments'}
                      </p>
                      <p className="mb-2">
                        <strong>Total Time to Freedom:</strong> {formatTime((result?.payoffTime || multipleDebtsResult?.payoffTime))}
                      </p>
                    </div>
                    <div>
                      <p className="mb-2">
                        <strong>Total Interest Cost:</strong> {formatCurrency((result?.totalInterest || multipleDebtsResult?.totalInterest))}
                      </p>
                      <p className="mb-2">
                        <strong>Total Amount Paid:</strong> {formatCurrency((result?.totalPaid || multipleDebtsResult?.totalPaid))}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* SEO Content Section */}
          <div className="mt-16 grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">What is a Debt Payoff Calculator?</h3>
                <div className="space-y-4 text-gray-600">
                  <p>
                    A debt payoff calculator is a powerful financial tool that helps you create a strategic plan to eliminate 
                    your debts faster and save money on interest payments. Our comprehensive calculator analyzes your current 
                    debts, interest rates, and payment capabilities to show you exactly how long it will take to become debt-free 
                    and how much interest you'll pay over time.
                  </p>
                  <p>
                    Whether you have credit card debt, personal loans, student loans, or multiple debts, this calculator provides 
                    clear insights into different repayment strategies, helping you choose the most effective approach for your 
                    financial situation.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Debt Snowball vs Debt Avalanche</h3>
                <div className="space-y-4 text-gray-600">
                  <div className="border-l-4 border-blue-500 pl-4">
                    <h4 className="font-semibold text-blue-800 mb-2">Debt Avalanche Method</h4>
                    <p className="text-sm">Pay minimum payments on all debts, then put extra money toward the debt with the highest interest rate. This method saves the most money on interest over time.</p>
                  </div>
                  <div className="border-l-4 border-green-500 pl-4">
                    <h4 className="font-semibold text-green-800 mb-2">Debt Snowball Method</h4>
                    <p className="text-sm">Pay minimum payments on all debts, then put extra money toward the debt with the lowest balance. This method provides psychological wins and motivation.</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Benefits of Using Our Calculator</h3>
                <div className="space-y-3 text-gray-600">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Compare debt elimination strategies side-by-side</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Calculate exact payoff times and interest savings</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Plan extra payments to accelerate debt freedom</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Support for multiple currencies worldwide</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Free to use with no registration required</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">How to Create Your Debt Payoff Plan</h3>
                <div className="space-y-4 text-gray-600">
                  <div className="bg-blue-50 rounded-lg p-4">
                    <h4 className="font-semibold text-blue-800 mb-2">Step 1: List All Debts</h4>
                    <p className="text-sm text-blue-700">Gather information on all your debts including balances, interest rates, and minimum payments.</p>
                  </div>
                  <div className="bg-green-50 rounded-lg p-4">
                    <h4 className="font-semibold text-green-800 mb-2">Step 2: Choose Strategy</h4>
                    <p className="text-sm text-green-700">Select between debt avalanche (highest interest first) or debt snowball (lowest balance first) based on your preference.</p>
                  </div>
                  <div className="bg-orange-50 rounded-lg p-4">
                    <h4 className="font-semibold text-orange-800 mb-2">Step 3: Add Extra Payments</h4>
                    <p className="text-sm text-orange-700">Determine how much extra you can pay monthly to accelerate your debt payoff timeline.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Types of Debt Section */}
          <Card className="mt-12 bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
            <CardContent className="p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-8">Types of Debt for Payoff Planning</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-gray-800">Credit Card Debt</h4>
                  <p className="text-gray-600 text-sm">
                    High-interest revolving debt that should be prioritized in most payoff strategies. Credit cards typically 
                    carry the highest interest rates, making them prime targets for the debt avalanche method.
                  </p>
                </div>
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-gray-800">Personal Loans</h4>
                  <p className="text-gray-600 text-sm">
                    Fixed-rate installment loans with set payment schedules. These often have moderate interest rates and 
                    can be effectively managed using either debt elimination strategy.
                  </p>
                </div>
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-gray-800">Student Loans</h4>
                  <p className="text-gray-600 text-sm">
                    Educational debt with varying interest rates and repayment options. Federal student loans often have 
                    lower rates and flexible repayment terms, affecting payoff priority decisions.
                  </p>
                </div>
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-gray-800">Medical Debt</h4>
                  <p className="text-gray-600 text-sm">
                    Healthcare-related debt that often carries no interest initially but may have payment plan options. 
                    Consider negotiating payment terms before including in aggressive payoff strategies.
                  </p>
                </div>
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-gray-800">Store Credit Cards</h4>
                  <p className="text-gray-600 text-sm">
                    Retail-specific credit accounts that often carry higher interest rates than general credit cards. 
                    These should typically be prioritized for payoff due to their high cost.
                  </p>
                </div>
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-gray-800">Payday Loans</h4>
                  <p className="text-gray-600 text-sm">
                    Short-term, high-cost loans with extremely high effective interest rates. These should be the absolute 
                    first priority for elimination due to their devastating impact on finances.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Advanced Strategies Section */}
          <div className="mt-12 grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Advanced Debt Payoff Strategies</h3>
                <div className="space-y-4 text-gray-600">
                  <div className="border-l-4 border-purple-500 pl-4">
                    <h4 className="font-semibold text-purple-800 mb-2">Debt Consolidation</h4>
                    <p className="text-sm">Combine multiple high-interest debts into a single loan with a lower interest rate, simplifying payments and potentially reducing costs.</p>
                  </div>
                  <div className="border-l-4 border-blue-500 pl-4">
                    <h4 className="font-semibold text-blue-800 mb-2">Balance Transfer</h4>
                    <p className="text-sm">Transfer high-interest credit card balances to a card with a lower or promotional 0% interest rate to save on interest charges.</p>
                  </div>
                  <div className="border-l-4 border-green-500 pl-4">
                    <h4 className="font-semibold text-green-800 mb-2">Debt Settlement</h4>
                    <p className="text-sm">Negotiate with creditors to pay less than the full amount owed, though this can negatively impact credit scores.</p>
                  </div>
                  <div className="border-l-4 border-orange-500 pl-4">
                    <h4 className="font-semibold text-orange-800 mb-2">Windfall Application</h4>
                    <p className="text-sm">Use tax refunds, bonuses, or unexpected income to make large debt payments and significantly reduce payoff time.</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Tips for Successful Debt Elimination</h3>
                <div className="space-y-3 text-gray-600">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-sm">Create a detailed budget to identify extra money for debt payments</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-sm">Stop using credit cards to avoid adding new debt during payoff</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-sm">Build a small emergency fund to avoid new debt for unexpected expenses</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-sm">Consider side income opportunities to accelerate debt payoff</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-sm">Track progress regularly and celebrate milestones to stay motivated</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-sm">Review and adjust your strategy as your financial situation changes</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* FAQ Section */}
          <Card className="mt-12 bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
            <CardContent className="p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-8">Frequently Asked Questions</h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2">Which debt payoff method saves more money?</h4>
                    <p className="text-gray-600 text-sm">The debt avalanche method (paying highest interest rates first) typically saves more money overall by minimizing total interest paid. However, the debt snowball method (paying smallest balances first) can provide better psychological motivation.</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2">Should I pay off debt or save money first?</h4>
                    <p className="text-gray-600 text-sm">Generally, you should build a small emergency fund ($500-$1,000) first, then focus aggressively on high-interest debt payoff. After eliminating debt, return to building a full 3-6 month emergency fund.</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2">How do I stay motivated during debt payoff?</h4>
                    <p className="text-gray-600 text-sm">Track your progress visually, celebrate small wins, and consider the debt snowball method if you need more frequent psychological victories. Setting up automatic payments can also help maintain consistency.</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2">Can I negotiate with creditors to reduce my debt?</h4>
                    <p className="text-gray-600 text-sm">Yes, many creditors will negotiate payment plans, interest rate reductions, or even debt settlements. Contact them directly to discuss options, especially if you're experiencing financial hardship.</p>
                  </div>
                </div>
                <div className="space-y-6">
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2">What if I can only make minimum payments?</h4>
                    <p className="text-gray-600 text-sm">Making only minimum payments will result in very long payoff times and high interest costs. Look for ways to cut expenses, increase income, or consider debt consolidation to reduce your overall payment burden.</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2">Should I include my mortgage in debt payoff planning?</h4>
                    <p className="text-gray-600 text-sm">Mortgages typically have lower interest rates and tax benefits, so they're usually not prioritized in debt payoff strategies. Focus on high-interest consumer debt first before considering extra mortgage payments.</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2">How accurate is this debt payoff calculator?</h4>
                    <p className="text-gray-600 text-sm">Our calculator provides highly accurate estimates based on the information you provide. Results assume consistent payments and no additional debt. Actual results may vary based on payment timing and any changes to your debts.</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2">What happens after I pay off all my debt?</h4>
                    <p className="text-gray-600 text-sm">After debt freedom, redirect your debt payments toward building an emergency fund, increasing retirement contributions, and working toward other financial goals. Maintain good credit habits to avoid future debt problems.</p>
                  </div>
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
