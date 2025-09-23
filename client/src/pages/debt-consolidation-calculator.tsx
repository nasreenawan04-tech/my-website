
import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Debt {
  id: string;
  name: string;
  balance: number;
  interestRate: number;
  minPayment: number;
}

interface ConsolidationResult {
  loanAmount: number;
  interestRate: number;
  termYears: number;
  monthlyPayment: number;
  totalInterest: number;
  totalCost: number;
  monthlySavings: number;
  totalSavings: number;
  payoffTime: number;
  currentTotalInterest: number;
  currentTotalCost: number;
  currentTotalPayment: number;
  weightedAvgRate: number;
}

export default function DebtConsolidationCalculator() {
  const [debts, setDebts] = useState<Debt[]>([]);
  const [newDebt, setNewDebt] = useState({
    name: '',
    balance: '',
    interestRate: '',
    minPayment: ''
  });
  const [consolidationRate, setConsolidationRate] = useState('12.99');
  const [consolidationTerm, setConsolidationTerm] = useState('5');
  const [currency, setCurrency] = useState('USD');
  const [showBreakdown, setShowBreakdown] = useState(false);
  const [result, setResult] = useState<ConsolidationResult | null>(null);

  // Add new debt
  const addDebt = () => {
    if (newDebt.name && newDebt.balance && newDebt.interestRate && newDebt.minPayment) {
      const balance = parseFloat(newDebt.balance);
      const interestRate = parseFloat(newDebt.interestRate);
      const minPayment = parseFloat(newDebt.minPayment);
      
      // Validate numeric inputs
      if (balance <= 0 || interestRate < 0 || minPayment <= 0) {
        return; // Don't add invalid debt
      }
      
      const debt: Debt = {
        id: Date.now().toString(),
        name: newDebt.name,
        balance,
        interestRate,
        minPayment
      };
      setDebts([...debts, debt]);
      setNewDebt({ name: '', balance: '', interestRate: '', minPayment: '' });
    }
  };

  // Remove debt
  const removeDebt = (id: string) => {
    setDebts(debts.filter(debt => debt.id !== id));
  };

  // Calculate loan payment
  const calculateMonthlyPayment = (principal: number, annualRate: number, years: number): number => {
    if (years <= 0 || principal <= 0) return 0; // Guard against invalid inputs
    
    const monthlyRate = annualRate / 100 / 12;
    const numberOfPayments = years * 12;
    
    if (monthlyRate === 0) {
      return principal / numberOfPayments;
    }
    
    return principal * (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) / 
           (Math.pow(1 + monthlyRate, numberOfPayments) - 1);
  };

  // Calculate time to pay off existing debts
  const calculatePayoffTime = (balance: number, payment: number, rate: number): number => {
    if (payment <= 0 || rate < 0 || balance <= 0) return 360; // Default to 30 years for invalid inputs
    
    const monthlyRate = rate / 100 / 12;
    if (monthlyRate === 0) {
      return Math.min(Math.ceil(balance / payment), 360);
    }
    
    if (payment <= balance * monthlyRate) {
      return 360; // Cap at 30 years for realistic calculations
    }
    
    const calculatedMonths = Math.log(1 + (balance * monthlyRate) / (payment - balance * monthlyRate)) / Math.log(1 + monthlyRate);
    return Math.min(Math.ceil(calculatedMonths), 360); // Cap at 30 years maximum, round up to full months
  };

  // Calculate consolidation results
  const calculateConsolidation = () => {
    if (debts.length === 0) return;

    const totalBalance = debts.reduce((sum, debt) => sum + debt.balance, 0);
    const totalMinPayment = debts.reduce((sum, debt) => sum + debt.minPayment, 0);
    
    if (totalBalance <= 0) return; // Can't consolidate if no debt balance
    
    const weightedAvgRate = debts.reduce((sum, debt) => sum + (debt.interestRate * debt.balance), 0) / totalBalance;
    
    const rate = parseFloat(consolidationRate);
    const term = parseFloat(consolidationTerm);
    
    // Validate consolidation inputs
    if (isNaN(rate) || isNaN(term) || rate < 0 || term <= 0) return;
    
    const monthlyPayment = calculateMonthlyPayment(totalBalance, rate, term);
    const totalCost = monthlyPayment * term * 12;
    const totalInterest = totalCost - totalBalance;
    
    // Calculate current debt totals
    let currentTotalInterest = 0;
    let currentTotalCost = 0;
    
    debts.forEach(debt => {
      const payoffMonths = calculatePayoffTime(debt.balance, debt.minPayment, debt.interestRate);
      const totalPaid = debt.minPayment * payoffMonths;
      
      // For debts that can't fully amortize, ensure cost covers at least the principal
      const effectiveTotalCost = Math.max(totalPaid, debt.balance);
      const interestPaid = Math.max(0, effectiveTotalCost - debt.balance);
      
      currentTotalInterest += interestPaid;
      currentTotalCost += effectiveTotalCost;
    });
    
    const monthlySavings = totalMinPayment - monthlyPayment;
    const totalSavings = currentTotalCost - totalCost;
    
    setResult({
      loanAmount: totalBalance,
      interestRate: rate,
      termYears: term,
      monthlyPayment,
      totalInterest,
      totalCost,
      monthlySavings,
      totalSavings,
      payoffTime: term * 12,
      currentTotalInterest,
      currentTotalCost,
      currentTotalPayment: totalMinPayment,
      weightedAvgRate
    });
  };

  const resetCalculator = () => {
    setDebts([]);
    setNewDebt({ name: '', balance: '', interestRate: '', minPayment: '' });
    setConsolidationRate('12.99');
    setConsolidationTerm('5');
    setCurrency('USD');
    setShowBreakdown(false);
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

  const getCurrencySymbol = () => {
    const currencySymbols: { [key: string]: string } = {
      USD: '$', EUR: '€', GBP: '£', INR: '₹', JPY: '¥',
      CAD: '$', AUD: '$', CNY: '¥', BRL: 'R$', MXN: '$'
    };
    return currencySymbols[currency] || '$';
  };

  const totalBalance = debts.reduce((sum, debt) => sum + debt.balance, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Helmet>
        <title>Debt Consolidation Calculator - Calculate Loan Savings | DapsiWow</title>
        <meta name="description" content="Free debt consolidation calculator to compare multiple debts vs. a single consolidated loan. Calculate potential monthly savings, total interest savings, and payoff timelines with multiple currency support." />
        <meta name="keywords" content="debt consolidation calculator, loan consolidation, debt payoff calculator, credit card consolidation, personal loan calculator, debt management, financial planning, loan comparison, debt consolidation loan, debt relief calculator" />
        <meta property="og:title" content="Debt Consolidation Calculator - Calculate Loan Savings | DapsiWow" />
        <meta property="og:description" content="Calculate potential savings from consolidating multiple debts into a single loan. Compare payments, interest rates, and payoff timelines with our free debt consolidation calculator." />
        <meta property="og:type" content="website" />
        <meta name="robots" content="index, follow" />
        <meta name="author" content="DapsiWow" />
        <link rel="canonical" href="https://dapsiwow.com/tools/debt-consolidation-calculator" />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            "name": "Debt Consolidation Calculator",
            "description": "Free online debt consolidation calculator to analyze potential savings from consolidating multiple debts into a single loan. Compare monthly payments, interest costs, and payoff timelines.",
            "url": "https://dapsiwow.com/tools/debt-consolidation-calculator",
            "applicationCategory": "FinanceApplication",
            "operatingSystem": "Any",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "USD"
            },
            "featureList": [
              "Calculate debt consolidation savings",
              "Compare multiple debt scenarios",
              "Support for multiple currencies",
              "Monthly payment analysis",
              "Interest savings calculator",
              "Payoff timeline comparison"
            ]
          })}
        </script>
      </Helmet>
      
      <Header />
      
      <main>
        {/* Hero Section */}
        <section className="relative py-12 sm:py-16 md:py-20 lg:py-24 xl:py-28 2xl:py-32 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-indigo-600/20"></div>
          <div className="relative max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 xl:px-12 text-center">
            <div className="space-y-4 sm:space-y-6 md:space-y-8 lg:space-y-10">
              <div className="inline-flex items-center px-3 py-1.5 sm:px-4 sm:py-2 md:px-5 md:py-2.5 bg-white/80 backdrop-blur-sm rounded-full border border-blue-200 text-xs sm:text-sm md:text-base">
                <span className="font-medium text-blue-700">Professional Debt Consolidation Calculator</span>
              </div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl 2xl:text-7xl font-bold text-slate-900 leading-tight tracking-tight">
                <span className="block">Smart Debt</span>
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                  Consolidation
                </span>
              </h1>
              <p className="text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl text-slate-600 max-w-xs sm:max-w-md md:max-w-2xl lg:max-w-4xl xl:max-w-5xl mx-auto leading-relaxed px-2 sm:px-4 md:px-6">
                Calculate potential savings from consolidating multiple debts into a single loan with lower interest rates and simplified payments
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
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">Debt Consolidation Analysis</h2>
                    <p className="text-gray-600">Enter your current debts and consolidation loan terms to see potential savings</p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Currency Selection */}
                    <div className="space-y-3">
                      <Label htmlFor="currency" className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                        Currency
                      </Label>
                      <Select value={currency} onValueChange={setCurrency}>
                        <SelectTrigger id="currency" className="h-14 border-2 border-gray-200 rounded-xl text-lg" data-testid="select-currency">
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

                    {/* Consolidation Interest Rate */}
                    <div className="space-y-3">
                      <Label htmlFor="consolidation-rate" className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                        Consolidation Interest Rate
                      </Label>
                      <div className="relative">
                        <Input
                          id="consolidation-rate"
                          type="number"
                          value={consolidationRate}
                          onChange={(e) => setConsolidationRate(e.target.value)}
                          className="h-14 pr-8 text-lg border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-blue-500"
                          placeholder="12.99"
                          step="0.01"
                          min="0"
                          max="50"
                          data-testid="input-consolidation-rate"
                          aria-label="Consolidation interest rate percentage"
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 text-lg">%</span>
                      </div>
                    </div>

                    {/* Consolidation Term */}
                    <div className="space-y-3 md:col-span-2">
                      <Label htmlFor="consolidation-term" className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                        Loan Term (Years)
                      </Label>
                      <Input
                        id="consolidation-term"
                        type="number"
                        value={consolidationTerm}
                        onChange={(e) => setConsolidationTerm(e.target.value)}
                        className="h-14 text-lg border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-blue-500 w-full md:w-48"
                        placeholder="5"
                        min="1"
                        max="30"
                        data-testid="input-consolidation-term"
                        aria-label="Loan term in years"
                      />
                    </div>
                  </div>

                  {/* Add Debt Section */}
                  <div className="space-y-6 border-t pt-8">
                    <h3 className="text-xl font-bold text-gray-900">Add Your Current Debts</h3>
                    
                    <div className="space-y-4 bg-gray-50 rounded-xl p-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="debt-name" className="text-sm font-medium text-gray-700">
                            Debt Name
                          </Label>
                          <Input
                            id="debt-name"
                            placeholder="e.g., Credit Card 1"
                            value={newDebt.name}
                            onChange={(e) => setNewDebt({...newDebt, name: e.target.value})}
                            className="h-12 border-2 border-gray-200 rounded-lg"
                            data-testid="input-debt-name"
                            aria-label="Debt name or description"
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="debt-balance" className="text-sm font-medium text-gray-700">
                            Balance
                          </Label>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">{getCurrencySymbol()}</span>
                            <Input
                              id="debt-balance"
                              type="number"
                              placeholder="10000"
                              value={newDebt.balance}
                              onChange={(e) => setNewDebt({...newDebt, balance: e.target.value})}
                              className="h-12 pl-8 border-2 border-gray-200 rounded-lg"
                              min="0"
                              step="0.01"
                              data-testid="input-debt-balance"
                              aria-label="Debt balance amount"
                            />
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="debt-rate" className="text-sm font-medium text-gray-700">
                            Interest Rate (%)
                          </Label>
                          <div className="relative">
                            <Input
                              id="debt-rate"
                              type="number"
                              step="0.01"
                              placeholder="18.99"
                              value={newDebt.interestRate}
                              onChange={(e) => setNewDebt({...newDebt, interestRate: e.target.value})}
                              className="h-12 pr-8 border-2 border-gray-200 rounded-lg"
                              min="0"
                              max="50"
                              data-testid="input-debt-rate"
                              aria-label="Debt interest rate percentage"
                            />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">%</span>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="debt-payment" className="text-sm font-medium text-gray-700">
                            Minimum Payment
                          </Label>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">{getCurrencySymbol()}</span>
                            <Input
                              id="debt-payment"
                              type="number"
                              placeholder="250"
                              value={newDebt.minPayment}
                              onChange={(e) => setNewDebt({...newDebt, minPayment: e.target.value})}
                              className="h-12 pl-8 border-2 border-gray-200 rounded-lg"
                              min="0"
                              step="0.01"
                              data-testid="input-debt-payment"
                              aria-label="Minimum monthly payment amount"
                            />
                          </div>
                        </div>
                      </div>
                      
                      <Button 
                        onClick={addDebt} 
                        className="w-full md:w-auto h-12 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold rounded-xl"
                        data-testid="button-add-debt"
                        disabled={!newDebt.name || !newDebt.balance || !newDebt.interestRate || !newDebt.minPayment}
                        aria-label="Add debt to list"
                      >
                        Add Debt
                      </Button>
                    </div>

                    {/* Current Debts List */}
                    {debts.length > 0 && (
                      <div className="space-y-3">
                        <h4 className="font-semibold text-gray-800">Current Debts ({debts.length})</h4>
                        {debts.map((debt) => (
                          <div key={debt.id} className="flex items-center justify-between p-4 bg-red-50 rounded-lg border">
                            <div className="flex-1">
                              <div className="font-semibold text-gray-900">{debt.name}</div>
                              <div className="text-sm text-gray-600 grid grid-cols-2 gap-2 mt-1">
                                <span>Balance: {formatCurrency(debt.balance)}</span>
                                <span>Rate: {debt.interestRate}%</span>
                                <span>Min Payment: {formatCurrency(debt.minPayment)}</span>
                              </div>
                            </div>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => removeDebt(debt.id)} 
                              className="text-red-600 hover:text-red-700"
                              data-testid={`button-remove-debt-${debt.id}`}
                              aria-label={`Remove ${debt.name} debt`}
                            >
                              Remove
                            </Button>
                          </div>
                        ))}
                        
                        <div className="bg-blue-50 p-4 rounded-lg">
                          <h4 className="font-semibold text-blue-900 mb-2">Total Summary</h4>
                          <div className="grid grid-cols-2 gap-2 text-sm text-blue-800">
                            <span>Total Balance: {formatCurrency(totalBalance)}</span>
                            <span>Total Min Payment: {formatCurrency(debts.reduce((sum, debt) => sum + debt.minPayment, 0))}</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-4 pt-6">
                    <Button
                      onClick={calculateConsolidation}
                      disabled={debts.length === 0}
                      className="flex-1 h-14 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold text-lg rounded-xl shadow-lg transform transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                      data-testid="button-calculate-savings"
                      aria-label="Calculate debt consolidation savings"
                    >
                      Calculate Savings
                    </Button>
                    <Button
                      onClick={resetCalculator}
                      variant="outline"
                      className="h-14 px-8 border-2 border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold text-lg rounded-xl"
                      data-testid="button-reset"
                      aria-label="Reset calculator"
                    >
                      Reset
                    </Button>
                  </div>

                  {/* Advanced Options */}
                  {result && (
                    <div className="flex flex-wrap gap-3 pt-4">
                      <Button
                        onClick={() => setShowBreakdown(!showBreakdown)}
                        variant="outline"
                        size="sm"
                        className="rounded-full"
                        data-testid="button-toggle-breakdown"
                        aria-label={`${showBreakdown ? 'Hide' : 'Show'} detailed breakdown`}
                      >
                        {showBreakdown ? 'Hide' : 'Show'} Detailed Breakdown
                      </Button>
                    </div>
                  )}
                </div>

                {/* Results Section */}
                <div className="bg-gradient-to-br from-gray-50 to-blue-50 p-8 lg:p-12">
                  <h2 className="text-2xl font-bold text-gray-900 mb-8">Consolidation Analysis</h2>
                  
                  {result ? (
                    <div className="space-y-6" data-testid="consolidation-results">
                      {/* Monthly Payment Highlight */}
                      <div className="bg-white rounded-2xl p-6 shadow-lg border border-blue-100">
                        <div className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-2">New Monthly Payment</div>
                        <div className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600" data-testid="text-monthly-payment">
                          {formatCurrency(result.monthlyPayment)}
                        </div>
                        <div className="text-sm text-gray-500 mt-2">
                          vs. {formatCurrency(result.currentTotalPayment)} currently
                        </div>
                      </div>

                      {/* Savings Summary */}
                      <div className="space-y-4">
                        <div className="bg-white rounded-xl p-4 shadow-sm">
                          <div className="flex justify-between items-center">
                            <span className="font-medium text-gray-700">Monthly Savings</span>
                            <span className={`font-bold text-lg ${result.monthlySavings > 0 ? 'text-green-600' : 'text-red-600'}`} data-testid="text-monthly-savings">
                              {result.monthlySavings > 0 ? '+' : ''}{formatCurrency(result.monthlySavings)}
                            </span>
                          </div>
                        </div>
                        <div className="bg-white rounded-xl p-4 shadow-sm">
                          <div className="flex justify-between items-center">
                            <span className="font-medium text-gray-700">Total Interest Savings</span>
                            <span className={`font-bold text-lg ${(result.currentTotalInterest - result.totalInterest) > 0 ? 'text-green-600' : 'text-red-600'}`} data-testid="text-interest-savings">
                              {(result.currentTotalInterest - result.totalInterest) > 0 ? '+' : ''}{formatCurrency(result.currentTotalInterest - result.totalInterest)}
                            </span>
                          </div>
                        </div>
                        <div className="bg-white rounded-xl p-4 shadow-sm">
                          <div className="flex justify-between items-center">
                            <span className="font-medium text-gray-700">Payoff Time</span>
                            <span className="font-bold text-gray-900" data-testid="text-payoff-time">
                              {result.termYears} years
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Recommendation */}
                      <div className={`rounded-xl p-6 border ${result.monthlySavings > 0 && result.totalSavings > 0 ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200' : 'bg-gradient-to-r from-red-50 to-orange-50 border-red-200'}`}>
                        <h4 className={`font-bold mb-3 ${result.monthlySavings > 0 && result.totalSavings > 0 ? 'text-green-800' : 'text-red-800'}`}>
                          {result.monthlySavings > 0 && result.totalSavings > 0 ? 'Consolidation Recommended!' : 'Consider Other Options'}
                        </h4>
                        <p className={`text-sm ${result.monthlySavings > 0 && result.totalSavings > 0 ? 'text-green-700' : 'text-red-700'}`}>
                          {result.monthlySavings > 0 && result.totalSavings > 0 
                            ? `You could save ${formatCurrency(result.monthlySavings)} per month and ${formatCurrency(result.totalSavings)} in total interest costs.`
                            : 'This consolidation loan may not provide significant savings. Look for better interest rates or consider alternative debt repayment strategies.'
                          }
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-16">
                      <div className="w-20 h-20 bg-gray-200 rounded-full mx-auto mb-6 flex items-center justify-center">
                        <div className="text-3xl font-bold text-gray-400">$</div>
                      </div>
                      <p className="text-gray-500 text-lg">Add your debts and calculate to see consolidation analysis</p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Detailed Breakdown */}
          {result && showBreakdown && (
            <Card className="mt-8 bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Detailed Financial Breakdown</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <h4 className="text-lg font-semibold text-gray-800 mb-4">Current Debt Situation</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Total Balance:</span>
                        <span className="font-semibold">{formatCurrency(result.loanAmount)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Monthly Payments:</span>
                        <span className="font-semibold">{formatCurrency(result.currentTotalPayment)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Weighted Avg Rate:</span>
                        <span className="font-semibold">{result.weightedAvgRate.toFixed(2)}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Total Interest Cost:</span>
                        <span className="font-semibold text-red-600">{formatCurrency(result.currentTotalInterest)}</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-gray-800 mb-4">Consolidated Loan</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Loan Amount:</span>
                        <span className="font-semibold">{formatCurrency(result.loanAmount)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Monthly Payment:</span>
                        <span className="font-semibold">{formatCurrency(result.monthlyPayment)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Interest Rate:</span>
                        <span className="font-semibold">{result.interestRate}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Total Interest Cost:</span>
                        <span className="font-semibold text-blue-600">{formatCurrency(result.totalInterest)}</span>
                      </div>
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
                <h3 className="text-2xl font-bold text-gray-900 mb-6">What is Debt Consolidation?</h3>
                <div className="space-y-4 text-gray-600">
                  <p>
                    Debt consolidation is a financial strategy that involves combining multiple debts into a single loan, 
                    typically with a lower interest rate and more favorable terms. This approach can simplify your finances 
                    by reducing multiple monthly payments to just one, potentially saving money on interest costs.
                  </p>
                  <p>
                    Our debt consolidation calculator helps you analyze whether consolidating your debts would be beneficial 
                    by comparing your current debt situation with a potential consolidation loan. The calculator takes into 
                    account your existing balances, interest rates, and minimum payments to provide accurate savings projections.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">How Does Our Calculator Work?</h3>
                <div className="space-y-4 text-gray-600">
                  <p>
                    Our calculator uses advanced algorithms to analyze your debt consolidation potential by comparing 
                    your current debt payments with a consolidated loan scenario. Simply enter your existing debts 
                    and the terms of your potential consolidation loan.
                  </p>
                  <ul className="space-y-2 list-disc list-inside">
                    <li>Add multiple debts with their balances, rates, and payments</li>
                    <li>Enter consolidation loan terms (rate and duration)</li>
                    <li>Get instant analysis of potential savings</li>
                    <li>Compare monthly payments and total interest costs</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Benefits of Debt Consolidation</h3>
                <div className="space-y-3 text-gray-600">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Lower monthly payments through reduced interest rates</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Simplified finances with one monthly payment</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Potential for significant interest savings over time</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Fixed payment schedule for better budgeting</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Faster debt payoff with structured repayment</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Features of Our Calculator</h3>
                <div className="space-y-3 text-gray-600">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Support for multiple debts and currencies</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Accurate monthly payment calculations</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Total interest savings analysis</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Side-by-side comparison of current vs. consolidated</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Detailed financial breakdown and recommendations</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Additional SEO Content Sections */}
          <div className="mt-12 space-y-8">
            {/* Types of Debt Consolidation */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Types of Debt Consolidation Options</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-gray-800">Personal Loans</h4>
                    <p className="text-gray-600">
                      Unsecured personal loans are the most common form of debt consolidation. They typically offer 
                      fixed interest rates and terms ranging from 2-7 years. Best for those with good credit scores 
                      who want predictable monthly payments.
                    </p>
                  </div>
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-gray-800">Balance Transfer Cards</h4>
                    <p className="text-gray-600">
                      Credit cards with promotional 0% APR periods allow you to transfer existing balances and pay 
                      no interest during the promotional period. Ideal for those who can pay off debt quickly.
                    </p>
                  </div>
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-gray-800">Home Equity Loans</h4>
                    <p className="text-gray-600">
                      Using your home's equity as collateral can provide access to larger loan amounts at lower 
                      interest rates. However, your home is at risk if you cannot make payments.
                    </p>
                  </div>
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-gray-800">Debt Management Plans</h4>
                    <p className="text-gray-600">
                      Working with credit counseling agencies to negotiate with creditors for reduced interest rates 
                      and consolidated payments. No new loan is involved, but creditors agree to modified terms.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* When to Consider Debt Consolidation */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
                <CardContent className="p-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">When Debt Consolidation Makes Sense</h3>
                  <div className="space-y-4 text-gray-600">
                    <div className="border-l-4 border-green-500 pl-4">
                      <h4 className="font-semibold text-gray-800 mb-2">High Interest Debt</h4>
                      <p className="text-sm">Multiple credit cards or loans with rates above 15% that could be consolidated at a lower rate.</p>
                    </div>
                    <div className="border-l-4 border-blue-500 pl-4">
                      <h4 className="font-semibold text-gray-800 mb-2">Good Credit Score</h4>
                      <p className="text-sm">Credit score of 650+ that qualifies you for competitive consolidation loan rates.</p>
                    </div>
                    <div className="border-l-4 border-purple-500 pl-4">
                      <h4 className="font-semibold text-gray-800 mb-2">Stable Income</h4>
                      <p className="text-sm">Consistent income that can support the new consolidated payment amount reliably.</p>
                    </div>
                    <div className="border-l-4 border-orange-500 pl-4">
                      <h4 className="font-semibold text-gray-800 mb-2">Discipline to Avoid New Debt</h4>
                      <p className="text-sm">Commitment to not accumulate new debt after consolidation to avoid worsening your situation.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
                <CardContent className="p-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">Steps to Successful Debt Consolidation</h3>
                  <div className="space-y-4 text-gray-600">
                    <div className="bg-blue-50 rounded-lg p-4">
                      <h4 className="font-semibold text-blue-800 mb-2">1. Assess Your Debt</h4>
                      <p className="text-sm text-blue-700">List all debts with balances, interest rates, and minimum payments to understand your total obligations.</p>
                    </div>
                    <div className="bg-green-50 rounded-lg p-4">
                      <h4 className="font-semibold text-green-800 mb-2">2. Shop for Better Rates</h4>
                      <p className="text-sm text-green-700">Compare offers from multiple lenders including banks, credit unions, and online lenders.</p>
                    </div>
                    <div className="bg-orange-50 rounded-lg p-4">
                      <h4 className="font-semibold text-orange-800 mb-2">3. Calculate True Savings</h4>
                      <p className="text-sm text-orange-700">Use our calculator to ensure the consolidation actually saves money over time.</p>
                    </div>
                    <div className="bg-purple-50 rounded-lg p-4">
                      <h4 className="font-semibold text-purple-800 mb-2">4. Apply and Close Old Accounts</h4>
                      <p className="text-sm text-purple-700">Apply for the consolidation loan and close old credit accounts to prevent future debt accumulation.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Common Mistakes and Tips */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-8">Common Debt Consolidation Mistakes to Avoid</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-r-lg">
                      <h4 className="font-semibold text-red-800 mb-2">Not Addressing Root Causes</h4>
                      <p className="text-red-700 text-sm">Consolidating without changing spending habits often leads to accumulating new debt on top of the consolidation loan.</p>
                    </div>
                    <div className="bg-orange-50 border-l-4 border-orange-400 p-4 rounded-r-lg">
                      <h4 className="font-semibold text-orange-800 mb-2">Focusing Only on Monthly Payment</h4>
                      <p className="text-orange-700 text-sm">Lower monthly payments might mean paying more interest over time if the loan term is significantly extended.</p>
                    </div>
                    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-lg">
                      <h4 className="font-semibold text-yellow-800 mb-2">Ignoring Fees and Costs</h4>
                      <p className="text-yellow-700 text-sm">Origination fees, balance transfer fees, and closing costs can offset potential savings from consolidation.</p>
                    </div>
                  </div>
                  <div className="space-y-6">
                    <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-lg">
                      <h4 className="font-semibold text-blue-800 mb-2">Not Shopping Around</h4>
                      <p className="text-blue-700 text-sm">Accepting the first offer without comparing rates and terms from multiple lenders can cost thousands in unnecessary interest.</p>
                    </div>
                    <div className="bg-purple-50 border-l-4 border-purple-400 p-4 rounded-r-lg">
                      <h4 className="font-semibold text-purple-800 mb-2">Consolidating Secured with Unsecured Debt</h4>
                      <p className="text-purple-700 text-sm">Using home equity to pay off credit cards puts your home at risk for unsecured debt that wouldn't otherwise threaten it.</p>
                    </div>
                    <div className="bg-green-50 border-l-4 border-green-400 p-4 rounded-r-lg">
                      <h4 className="font-semibold text-green-800 mb-2">Closing All Credit Cards</h4>
                      <p className="text-green-700 text-sm">Closing all credit accounts can hurt your credit score. Keep oldest accounts open with zero balances to maintain credit history.</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Alternatives to Debt Consolidation */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Alternatives to Debt Consolidation</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-yellow-50 p-6 rounded-lg">
                    <h4 className="font-semibold text-yellow-900 mb-3">Debt Snowball Method</h4>
                    <p className="text-yellow-800 mb-3">Pay minimum on all debts, then focus extra payments on the smallest balance first for psychological wins.</p>
                    <div className="text-sm text-yellow-700">
                      <strong>Best for:</strong> Those needing motivation through quick victories
                    </div>
                  </div>

                  <div className="bg-orange-50 p-6 rounded-lg">
                    <h4 className="font-semibold text-orange-900 mb-3">Debt Avalanche Method</h4>
                    <p className="text-orange-800 mb-3">Pay minimum on all debts, then focus extra payments on the highest interest rate debt first.</p>
                    <div className="text-sm text-orange-700">
                      <strong>Best for:</strong> Minimizing total interest paid over time
                    </div>
                  </div>

                  <div className="bg-green-50 p-6 rounded-lg">
                    <h4 className="font-semibold text-green-900 mb-3">Credit Counseling</h4>
                    <p className="text-green-800 mb-3">Work with non-profit agencies to create debt management plans and negotiate with creditors.</p>
                    <div className="text-sm text-green-700">
                      <strong>Best for:</strong> Those needing professional guidance and creditor negotiation
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* FAQ Section */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-8">Frequently Asked Questions</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">Will debt consolidation hurt my credit score?</h4>
                      <p className="text-gray-600 text-sm">Initially, applying for a new loan may cause a small, temporary dip in your credit score. However, consolidation can improve your score long-term by reducing credit utilization and establishing a positive payment history.</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">How much can I save with debt consolidation?</h4>
                      <p className="text-gray-600 text-sm">Savings depend on your current interest rates, the consolidation loan rate, and loan terms. Our calculator shows you exactly how much you could save based on your specific situation.</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">Can I consolidate federal student loans with other debts?</h4>
                      <p className="text-gray-600 text-sm">While possible, it's generally not recommended as federal student loans offer protections and benefits that would be lost when consolidated with private debt through a personal loan.</p>
                    </div>
                  </div>
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">What credit score do I need for debt consolidation?</h4>
                      <p className="text-gray-600 text-sm">While lenders may approve consolidation loans for scores as low as 580, the best rates typically require a credit score of 650 or higher. Higher scores unlock significantly better interest rates.</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">Should I close credit cards after consolidation?</h4>
                      <p className="text-gray-600 text-sm">Keep your oldest credit cards open with zero balances to maintain credit history length. You can close newer cards to remove temptation, but avoid closing accounts that would hurt your credit age.</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">How long does the debt consolidation process take?</h4>
                      <p className="text-gray-600 text-sm">The application and approval process typically takes 2-7 business days for personal loans. Funds are usually disbursed within 1-3 business days after approval, making the entire process about one week.</p>
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
