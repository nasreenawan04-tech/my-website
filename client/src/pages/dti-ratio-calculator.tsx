
import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ToolSEOHead } from '@/components/seo/ToolSEOHead';
import { dtiRatioCalculatorSEO } from '@/config/seo/tools/dti-ratio-calculator';

interface DebtItem {
  id: string;
  name: string;
  payment: number;
}

interface IncomeItem {
  id: string;
  name: string;
  amount: number;
}

interface DTIResult {
  totalIncome: number;
  totalDebt: number;
  dtiRatio: number;
  frontEndRatio: number;
  backEndRatio: number;
  status: string;
  recommendation: string;
  maxLoanAmount: number;
  availableIncome: number;
}

export default function DTIRatioCalculator() {
  const [currency, setCurrency] = useState('USD');
  const [incomeItems, setIncomeItems] = useState<IncomeItem[]>([
    { id: '1', name: 'Primary Job Salary', amount: 0 },
    { id: '2', name: 'Secondary Income', amount: 0 }
  ]);
  
  const [debtItems, setDebtItems] = useState<DebtItem[]>([
    { id: '1', name: 'Mortgage/Rent', payment: 0 },
    { id: '2', name: 'Car Loan', payment: 0 },
    { id: '3', name: 'Credit Cards', payment: 0 },
    { id: '4', name: 'Student Loans', payment: 0 },
    { id: '5', name: 'Personal Loans', payment: 0 }
  ]);

  const [result, setResult] = useState<DTIResult | null>(null);

  const calculateDTI = () => {
    const totalIncome = incomeItems.reduce((sum, item) => sum + (item.amount || 0), 0);
    const totalDebt = debtItems.reduce((sum, item) => sum + (item.payment || 0), 0);
    const housingDebt = debtItems.find(item => item.name.includes('Mortgage') || item.name.includes('Rent'))?.payment || 0;
    
    // Always calculate and show results, even if income is 0
    const dtiRatio = totalIncome > 0 ? (totalDebt / totalIncome) * 100 : 0;
    const frontEndRatio = totalIncome > 0 ? (housingDebt / totalIncome) * 100 : 0;
    const backEndRatio = dtiRatio;
    const availableIncome = totalIncome - totalDebt;
    
    // Calculate maximum loan amount based on 36% DTI rule
    const maxLoanAmount = (totalIncome * 0.36) - totalDebt;

    let status = '';
    let recommendation = '';
    
    if (totalIncome <= 0) {
      status = 'Enter Income';
      recommendation = 'Please enter your monthly income sources to calculate your DTI ratio and get personalized recommendations.';
    } else if (dtiRatio <= 20) {
      status = 'Excellent';
      recommendation = 'You have a very healthy DTI ratio. You should easily qualify for most loans with favorable terms.';
    } else if (dtiRatio <= 36) {
      status = 'Good';
      recommendation = 'Good DTI ratio! You should qualify for most loans. Consider paying down debt to improve your ratio further.';
    } else if (dtiRatio <= 43) {
      status = 'Fair';
      recommendation = 'Your DTI is manageable but higher than ideal. Focus on paying down debt before taking on new loans.';
    } else {
      status = 'High Risk';
      recommendation = 'High DTI ratio. Consider debt consolidation, increasing income, or paying down debts before applying for new loans.';
    }

    setResult({
      totalIncome,
      totalDebt,
      dtiRatio: Math.round(dtiRatio * 100) / 100,
      frontEndRatio: Math.round(frontEndRatio * 100) / 100,
      backEndRatio: Math.round(backEndRatio * 100) / 100,
      status,
      recommendation,
      maxLoanAmount: Math.max(0, maxLoanAmount),
      availableIncome
    });
  };

  useEffect(() => {
    calculateDTI();
  }, [incomeItems, debtItems]);

  const addIncomeItem = () => {
    const newItem: IncomeItem = {
      id: Date.now().toString(),
      name: 'Additional Income',
      amount: 0
    };
    setIncomeItems([...incomeItems, newItem]);
  };

  const addDebtItem = () => {
    const newItem: DebtItem = {
      id: Date.now().toString(),
      name: 'Other Debt',
      payment: 0
    };
    setDebtItems([...debtItems, newItem]);
  };

  const updateIncomeItem = (id: string, field: keyof IncomeItem, value: string | number) => {
    setIncomeItems(items => 
      items.map(item => 
        item.id === id ? { ...item, [field]: value } : item
      )
    );
  };

  const updateDebtItem = (id: string, field: keyof DebtItem, value: string | number) => {
    setDebtItems(items => 
      items.map(item => 
        item.id === id ? { ...item, [field]: value } : item
      )
    );
  };

  const removeIncomeItem = (id: string) => {
    if (incomeItems.length > 1) {
      setIncomeItems(items => items.filter(item => item.id !== id));
    }
  };

  const removeDebtItem = (id: string) => {
    if (debtItems.length > 1) {
      setDebtItems(items => items.filter(item => item.id !== id));
    }
  };

  const resetCalculator = () => {
    setIncomeItems([
      { id: '1', name: 'Primary Job Salary', amount: 0 },
      { id: '2', name: 'Secondary Income', amount: 0 }
    ]);
    setDebtItems([
      { id: '1', name: 'Mortgage/Rent', payment: 0 },
      { id: '2', name: 'Car Loan', payment: 0 },
      { id: '3', name: 'Credit Cards', payment: 0 },
      { id: '4', name: 'Student Loans', payment: 0 },
      { id: '5', name: 'Personal Loans', payment: 0 }
    ]);
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Excellent': return 'text-green-600';
      case 'Good': return 'text-blue-600';
      case 'Fair': return 'text-yellow-600';
      case 'Enter Income': return 'text-gray-600';
      default: return 'text-red-600';
    }
  };

  const getStatusBgColor = (status: string) => {
    switch (status) {
      case 'Excellent': return 'from-green-50 to-emerald-50 border-green-200';
      case 'Good': return 'from-blue-50 to-indigo-50 border-blue-200';
      case 'Fair': return 'from-yellow-50 to-amber-50 border-yellow-200';
      case 'Enter Income': return 'from-gray-50 to-slate-50 border-gray-200';
      default: return 'from-red-50 to-rose-50 border-red-200';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <ToolSEOHead config={dtiRatioCalculatorSEO} />
      <Helmet>
        <title>DTI Ratio Calculator - Free Debt-to-Income Ratio Calculator | DapsiWow</title>
        <meta name="description" content="Free DTI ratio calculator to calculate your debt-to-income ratio instantly. Get loan eligibility insights, financial health assessment, and personalized recommendations. Perfect for mortgage and loan applications with multiple currency support." />
        <meta name="keywords" content="DTI calculator, debt to income ratio calculator, DTI ratio calculator, mortgage qualification calculator, loan eligibility calculator, financial health calculator, debt ratio calculator, home loan DTI, car loan DTI, personal loan DTI" />
        <meta property="og:title" content="DTI Ratio Calculator - Free Debt-to-Income Ratio Calculator | DapsiWow" />
        <meta property="og:description" content="Calculate your DTI ratio instantly with our free debt-to-income calculator. Get detailed analysis for loan eligibility and financial planning." />
        <meta property="og:type" content="website" />
        <meta name="robots" content="index, follow" />
        <meta name="author" content="DapsiWow" />
        <link rel="canonical" href="https://dapsiwow.com/tools/dti-ratio-calculator" />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            "name": "DTI Ratio Calculator",
            "description": "Free online debt-to-income ratio calculator to assess financial health and loan eligibility. Calculate DTI ratio with comprehensive analysis and recommendations.",
            "url": "https://dapsiwow.com/tools/dti-ratio-calculator",
            "applicationCategory": "FinanceApplication",
            "operatingSystem": "Any",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "USD"
            },
            "featureList": [
              "Calculate DTI ratio for any income and debt amount",
              "Support for multiple currencies",
              "Loan eligibility assessment",
              "Financial health recommendations",
              "Mortgage qualification analysis",
              "Front-end and back-end ratio calculations"
            ]
          })}
        </script>
      </Helmet>
      
      <Header />
      
      <main>
        {/* Hero Section */}
        <section className="relative py-8 sm:py-12 md:py-16 lg:py-20 xl:py-24 2xl:py-32 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-indigo-600/20"></div>
          <div className="relative max-w-5xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 text-center">
            <div className="space-y-4 sm:space-y-6 md:space-y-8">
              <div className="inline-flex items-center px-2 sm:px-3 md:px-4 py-1 sm:py-1.5 md:py-2 bg-white/80 backdrop-blur-sm rounded-full border border-blue-200">
                <span className="text-xs sm:text-sm font-medium text-blue-700">Professional DTI Calculator</span>
              </div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl 2xl:text-7xl font-bold text-slate-900 leading-tight tracking-tight px-2 sm:px-0">
                <span className="block">Smart DTI Ratio</span>
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 mt-1 sm:mt-2">
                  Calculator
                </span>
              </h1>
              <p className="text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl 2xl:text-2xl text-slate-600 max-w-xs sm:max-w-sm md:max-w-lg lg:max-w-2xl xl:max-w-3xl 2xl:max-w-4xl mx-auto leading-relaxed px-3 sm:px-2 md:px-0">
                Calculate your debt-to-income ratio to assess financial health and loan eligibility with comprehensive analysis
              </p>
            </div>
          </div>
        </section>

        <div className="w-full max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-6 sm:py-8 md:py-12 lg:py-16">
          {/* Main Calculator Card */}
          <Card className="bg-white/90 backdrop-blur-sm shadow-2xl border-0 rounded-xl sm:rounded-2xl md:rounded-3xl overflow-hidden">
            <CardContent className="p-0">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-0">
                {/* Input Section */}
                <div className="lg:col-span-2 p-3 sm:p-4 md:p-6 lg:p-8 xl:p-10 2xl:p-12 space-y-4 sm:space-y-6 md:space-y-8">
                  <div className="text-center sm:text-left">
                    <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">DTI Configuration</h2>
                    <p className="text-sm sm:text-base text-gray-600">Enter your income and debt details to calculate your debt-to-income ratio</p>
                  </div>
                  
                  {/* Currency Selection */}
                  <div className="space-y-2 sm:space-y-3">
                    <Label htmlFor="currency" className="text-xs sm:text-sm font-semibold text-gray-800 uppercase tracking-wide">
                      Currency
                    </Label>
                    <Select value={currency} onValueChange={setCurrency}>
                      <SelectTrigger className="h-10 sm:h-12 md:h-14 border-2 border-gray-200 rounded-lg sm:rounded-xl text-sm sm:text-base md:text-lg w-full max-w-xs">
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

                  {/* Monthly Income Section */}
                  <div className="space-y-4 sm:space-y-6 border-t pt-4 sm:pt-6 md:pt-8">
                    <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-900">Monthly Income Sources</h3>
                    <p className="text-gray-600 text-xs sm:text-sm">Enter all sources of monthly gross income before taxes</p>
                    
                    <div className="space-y-3 sm:space-y-4">
                      {incomeItems.map((item) => (
                        <div key={item.id} className="grid grid-cols-1 md:grid-cols-5 gap-2 sm:gap-3 items-end">
                          <div className="md:col-span-2">
                            <Label htmlFor={`income-name-${item.id}`} className="text-xs sm:text-sm font-medium text-gray-700">
                              Income Source
                            </Label>
                            <Input
                              id={`income-name-${item.id}`}
                              value={item.name}
                              onChange={(e) => updateIncomeItem(item.id, 'name', e.target.value)}
                              className="h-10 sm:h-12 border-2 border-gray-200 rounded-lg text-sm sm:text-base w-full"
                              placeholder="Income source name"
                            />
                          </div>
                          <div className="md:col-span-2">
                            <Label htmlFor={`income-amount-${item.id}`} className="text-xs sm:text-sm font-medium text-gray-700">
                              Monthly Amount
                            </Label>
                            <div className="relative">
                              <span className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm sm:text-base">$</span>
                              <Input
                                id={`income-amount-${item.id}`}
                                type="number"
                                value={item.amount || ''}
                                onChange={(e) => updateIncomeItem(item.id, 'amount', parseFloat(e.target.value) || 0)}
                                className="h-10 sm:h-12 pl-6 sm:pl-8 border-2 border-gray-200 rounded-lg text-sm sm:text-base w-full"
                                placeholder="0"
                              />
                            </div>
                          </div>
                          {incomeItems.length > 1 && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => removeIncomeItem(item.id)}
                              className="h-10 sm:h-12 px-3 sm:px-4 text-xs sm:text-sm w-full md:w-auto"
                            >
                              Remove
                            </Button>
                          )}
                        </div>
                      ))}
                      <Button variant="outline" onClick={addIncomeItem} className="w-full h-10 sm:h-12 text-xs sm:text-sm">
                        + Add Income Source
                      </Button>
                    </div>
                  </div>

                  {/* Monthly Debt Payments Section */}
                  <div className="space-y-4 sm:space-y-6 border-t pt-4 sm:pt-6 md:pt-8">
                    <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-900">Monthly Debt Payments</h3>
                    <p className="text-gray-600 text-xs sm:text-sm">Enter minimum monthly payments for all debts and obligations</p>
                    
                    <div className="space-y-3 sm:space-y-4">
                      {debtItems.map((item) => (
                        <div key={item.id} className="grid grid-cols-1 md:grid-cols-5 gap-2 sm:gap-3 items-end">
                          <div className="md:col-span-2">
                            <Label htmlFor={`debt-name-${item.id}`} className="text-xs sm:text-sm font-medium text-gray-700">
                              Debt Type
                            </Label>
                            <Input
                              id={`debt-name-${item.id}`}
                              value={item.name}
                              onChange={(e) => updateDebtItem(item.id, 'name', e.target.value)}
                              className="h-10 sm:h-12 border-2 border-gray-200 rounded-lg text-sm sm:text-base w-full"
                              placeholder="Debt type"
                            />
                          </div>
                          <div className="md:col-span-2">
                            <Label htmlFor={`debt-payment-${item.id}`} className="text-xs sm:text-sm font-medium text-gray-700">
                              Monthly Payment
                            </Label>
                            <div className="relative">
                              <span className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm sm:text-base">$</span>
                              <Input
                                id={`debt-payment-${item.id}`}
                                type="number"
                                value={item.payment || ''}
                                onChange={(e) => updateDebtItem(item.id, 'payment', parseFloat(e.target.value) || 0)}
                                className="h-10 sm:h-12 pl-6 sm:pl-8 border-2 border-gray-200 rounded-lg text-sm sm:text-base w-full"
                                placeholder="0"
                              />
                            </div>
                          </div>
                          {debtItems.length > 1 && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => removeDebtItem(item.id)}
                              className="h-10 sm:h-12 px-3 sm:px-4 text-xs sm:text-sm w-full md:w-auto"
                            >
                              Remove
                            </Button>
                          )}
                        </div>
                      ))}
                      <Button variant="outline" onClick={addDebtItem} className="w-full h-10 sm:h-12 text-xs sm:text-sm">
                        + Add Debt Payment
                      </Button>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4 sm:pt-6">
                    <Button
                      onClick={calculateDTI}
                      className="flex-1 h-12 sm:h-14 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold text-sm sm:text-base md:text-lg rounded-lg sm:rounded-xl shadow-lg transition-colors duration-200"
                    >
                      Calculate DTI Ratio
                    </Button>
                    <Button
                      onClick={resetCalculator}
                      variant="outline"
                      className="h-12 sm:h-14 px-6 sm:px-8 border-2 border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold text-sm sm:text-base md:text-lg rounded-lg sm:rounded-xl"
                    >
                      Reset
                    </Button>
                  </div>
                </div>

                {/* Results Section */}
                <div className="bg-gradient-to-br from-gray-50 to-blue-50 p-3 sm:p-4 md:p-6 lg:p-8 xl:p-10 2xl:p-12">
                  <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 mb-4 sm:mb-6 md:mb-8 text-center sm:text-left">DTI Analysis</h2>
                  
                  {result ? (
                    <div className="space-y-4 sm:space-y-6">
                      {/* Main DTI Ratio Highlight */}
                      <div className={`bg-gradient-to-r ${getStatusBgColor(result.status)} rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg border`}>
                        <div className="text-xs sm:text-sm font-semibold text-gray-600 uppercase tracking-wide mb-2">Debt-to-Income Ratio</div>
                        <div className={`text-3xl sm:text-4xl font-bold ${getStatusColor(result.status)} mb-2`}>
                          {result.dtiRatio.toFixed(1)}%
                        </div>
                        <div className={`text-base sm:text-lg font-bold ${getStatusColor(result.status)}`}>
                          {result.status}
                        </div>
                      </div>

                      {/* Ratio Breakdown */}
                      <div className="space-y-3 sm:space-y-4">
                        <div className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 shadow-sm">
                          <div className="flex justify-between items-center">
                            <span className="font-medium text-gray-700 text-xs sm:text-sm md:text-base">Front-End Ratio (Housing)</span>
                            <span className="font-bold text-gray-900 text-sm sm:text-base">
                              {result.frontEndRatio.toFixed(1)}%
                            </span>
                          </div>
                          <div className="text-xs text-gray-500 mt-1">Recommended: ≤ 28%</div>
                        </div>
                        <div className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 shadow-sm">
                          <div className="flex justify-between items-center">
                            <span className="font-medium text-gray-700 text-xs sm:text-sm md:text-base">Back-End Ratio (Total)</span>
                            <span className="font-bold text-gray-900 text-sm sm:text-base">
                              {result.backEndRatio.toFixed(1)}%
                            </span>
                          </div>
                          <div className="text-xs text-gray-500 mt-1">Recommended: ≤ 36%</div>
                        </div>
                      </div>

                      {/* Financial Summary */}
                      <div className="space-y-3 sm:space-y-4">
                        <div className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 shadow-sm">
                          <div className="flex justify-between items-center">
                            <span className="font-medium text-gray-700 text-xs sm:text-sm md:text-base">Monthly Income</span>
                            <span className="font-bold text-gray-900 text-sm sm:text-base break-all">
                              {formatCurrency(result.totalIncome)}
                            </span>
                          </div>
                        </div>
                        <div className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 shadow-sm">
                          <div className="flex justify-between items-center">
                            <span className="font-medium text-gray-700 text-xs sm:text-sm md:text-base">Monthly Debts</span>
                            <span className="font-bold text-orange-600 text-sm sm:text-base break-all">
                              {formatCurrency(result.totalDebt)}
                            </span>
                          </div>
                        </div>
                        <div className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 shadow-sm">
                          <div className="flex justify-between items-center">
                            <span className="font-medium text-gray-700 text-xs sm:text-sm md:text-base">Available Income</span>
                            <span className="font-bold text-green-600 text-sm sm:text-base break-all">
                              {formatCurrency(result.availableIncome)}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Recommendation */}
                      <div className="bg-white rounded-lg sm:rounded-xl p-4 sm:p-6 shadow-sm">
                        <h4 className="font-bold text-gray-900 mb-2 sm:mb-3 text-sm sm:text-base">Recommendation</h4>
                        <p className="text-gray-600 text-xs sm:text-sm leading-relaxed">
                          {result.recommendation}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12 sm:py-16">
                      <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-200 rounded-full mx-auto mb-4 sm:mb-6 flex items-center justify-center">
                        <div className="text-2xl sm:text-3xl font-bold text-gray-400">%</div>
                      </div>
                      <p className="text-gray-500 text-sm sm:text-base md:text-lg">Enter income and debt details to see DTI analysis</p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* SEO Content Section */}
          <div className="mt-12 sm:mt-16 grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-xl sm:rounded-2xl">
              <CardContent className="p-4 sm:p-6 md:p-8">
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">What is Debt-to-Income Ratio?</h3>
                <div className="space-y-3 sm:space-y-4 text-gray-600 text-sm sm:text-base">
                  <p>
                    The debt-to-income (DTI) ratio is a crucial financial metric that compares your monthly debt payments 
                    to your gross monthly income. Lenders use this ratio as a primary indicator to assess your ability 
                    to manage monthly payments and repay borrowed money responsibly.
                  </p>
                  <p>
                    Our DTI calculator helps you understand your financial health by providing instant calculations, 
                    loan eligibility insights, and personalized recommendations. Whether you're applying for a mortgage, 
                    car loan, or personal loan, knowing your DTI ratio is essential for financial planning.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-xl sm:rounded-2xl">
              <CardContent className="p-4 sm:p-6 md:p-8">
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">How to Calculate DTI Ratio?</h3>
                <div className="space-y-3 sm:space-y-4 text-gray-600 text-sm sm:text-base">
                  <p>
                    The DTI formula is simple: DTI Ratio = (Total Monthly Debt Payments ÷ Gross Monthly Income) × 100
                  </p>
                  <div className="bg-blue-50 rounded-lg p-3 sm:p-4">
                    <h4 className="font-semibold text-blue-800 mb-2 text-sm sm:text-base">Step-by-Step Calculation:</h4>
                    <ol className="space-y-1 text-xs sm:text-sm text-blue-700 list-decimal list-inside">
                      <li>Add up all monthly debt payments</li>
                      <li>Calculate your gross monthly income</li>
                      <li>Divide debt payments by income</li>
                      <li>Multiply by 100 for percentage</li>
                    </ol>
                  </div>
                  <p>
                    Our calculator automatically applies this formula and provides additional insights to help you 
                    optimize your financial situation.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-xl sm:rounded-2xl">
              <CardContent className="p-4 sm:p-6 md:p-8">
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">DTI Ratio Categories</h3>
                <div className="space-y-3 sm:space-y-4">
                  <div className="border-l-4 border-green-500 pl-3 sm:pl-4">
                    <h4 className="font-semibold text-green-800 mb-1 text-sm sm:text-base">Excellent (0-20%)</h4>
                    <p className="text-xs sm:text-sm text-gray-600">Very low debt relative to income. Excellent loan terms available with competitive interest rates.</p>
                  </div>
                  <div className="border-l-4 border-blue-500 pl-3 sm:pl-4">
                    <h4 className="font-semibold text-blue-800 mb-1 text-sm sm:text-base">Good (21-36%)</h4>
                    <p className="text-xs sm:text-sm text-gray-600">Manageable debt levels. Good loan approval chances with favorable terms from most lenders.</p>
                  </div>
                  <div className="border-l-4 border-yellow-500 pl-3 sm:pl-4">
                    <h4 className="font-semibold text-yellow-800 mb-1 text-sm sm:text-base">Fair (37-43%)</h4>
                    <p className="text-xs sm:text-sm text-gray-600">Higher debt levels. May face higher interest rates and stricter loan conditions.</p>
                  </div>
                  <div className="border-l-4 border-red-500 pl-3 sm:pl-4">
                    <h4 className="font-semibold text-red-800 mb-1 text-sm sm:text-base">High Risk (44%+)</h4>
                    <p className="text-xs sm:text-sm text-gray-600">High debt burden. Loan approval may be difficult. Focus on debt reduction strategies.</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-xl sm:rounded-2xl">
              <CardContent className="p-4 sm:p-6 md:p-8">
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">Improving Your DTI Ratio</h3>
                <div className="space-y-2 sm:space-y-3 text-gray-600 text-sm sm:text-base">
                  <div className="flex items-start gap-2 sm:gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-xs sm:text-sm">Pay down existing debt, especially high-interest credit cards</span>
                  </div>
                  <div className="flex items-start gap-2 sm:gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-xs sm:text-sm">Increase income through raises, side jobs, or additional sources</span>
                  </div>
                  <div className="flex items-start gap-2 sm:gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-xs sm:text-sm">Avoid taking on new debt before loan applications</span>
                  </div>
                  <div className="flex items-start gap-2 sm:gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-xs sm:text-sm">Consider debt consolidation to lower monthly payments</span>
                  </div>
                  <div className="flex items-start gap-2 sm:gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-xs sm:text-sm">Make bi-weekly payments to accelerate debt payoff</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Additional SEO Content Sections */}
          <div className="mt-8 sm:mt-12 space-y-6 sm:space-y-8">
            {/* Loan Types and DTI Requirements */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-xl sm:rounded-2xl">
              <CardContent className="p-4 sm:p-6 md:p-8">
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6 sm:mb-8">DTI Requirements by Loan Type</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  <div className="space-y-3 sm:space-y-4">
                    <h4 className="text-base sm:text-lg font-semibold text-gray-800">Mortgage Loans</h4>
                    <div className="bg-blue-50 rounded-lg p-3 sm:p-4">
                      <div className="space-y-2 text-xs sm:text-sm">
                        <div className="flex justify-between">
                          <span className="font-medium">Conventional Loans:</span>
                          <span className="text-blue-700">≤ 43% DTI</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium">FHA Loans:</span>
                          <span className="text-blue-700">≤ 57% DTI*</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium">VA Loans:</span>
                          <span className="text-blue-700">≤ 41% DTI**</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium">USDA Loans:</span>
                          <span className="text-blue-700">≤ 41% DTI</span>
                        </div>
                      </div>
                      <div className="text-xs text-gray-600 mt-2">
                        *With compensating factors **Preferred, no strict limit
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3 sm:space-y-4">
                    <h4 className="text-base sm:text-lg font-semibold text-gray-800">Other Loan Types</h4>
                    <div className="bg-green-50 rounded-lg p-3 sm:p-4">
                      <div className="space-y-2 text-xs sm:text-sm">
                        <div className="flex justify-between">
                          <span className="font-medium">Auto Loans:</span>
                          <span className="text-green-700">≤ 36-40% DTI</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium">Personal Loans:</span>
                          <span className="text-green-700">≤ 36% DTI</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium">Credit Cards:</span>
                          <span className="text-green-700">≤ 28% DTI</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium">Student Loans:</span>
                          <span className="text-green-700">Variable</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Front-End vs Back-End Ratios */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
              <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-xl sm:rounded-2xl">
                <CardContent className="p-4 sm:p-6 md:p-8">
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">Front-End DTI Ratio</h3>
                  <div className="space-y-3 sm:space-y-4 text-gray-600 text-sm sm:text-base">
                    <p className="font-medium text-gray-800">
                      Housing expenses ÷ Gross monthly income
                    </p>
                    <div className="bg-purple-50 rounded-lg p-3 sm:p-4">
                      <h4 className="font-semibold text-purple-800 mb-2 text-sm sm:text-base">Includes:</h4>
                      <ul className="text-xs sm:text-sm text-purple-700 space-y-1 list-disc list-inside">
                        <li>Mortgage principal and interest</li>
                        <li>Property taxes</li>
                        <li>Homeowners insurance</li>
                        <li>HOA fees (if applicable)</li>
                        <li>Private mortgage insurance (PMI)</li>
                      </ul>
                    </div>
                    <div className="bg-purple-100 rounded-lg p-2 sm:p-3">
                      <p className="text-xs sm:text-sm text-purple-800 font-medium">
                        Recommended: ≤ 28% for optimal loan approval
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-xl sm:rounded-2xl">
                <CardContent className="p-4 sm:p-6 md:p-8">
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">Back-End DTI Ratio</h3>
                  <div className="space-y-3 sm:space-y-4 text-gray-600 text-sm sm:text-base">
                    <p className="font-medium text-gray-800">
                      Total monthly debts ÷ Gross monthly income
                    </p>
                    <div className="bg-orange-50 rounded-lg p-3 sm:p-4">
                      <h4 className="font-semibold text-orange-800 mb-2 text-sm sm:text-base">Includes:</h4>
                      <ul className="text-xs sm:text-sm text-orange-700 space-y-1 list-disc list-inside">
                        <li>All housing expenses (front-end ratio)</li>
                        <li>Credit card minimum payments</li>
                        <li>Auto loan payments</li>
                        <li>Student loan payments</li>
                        <li>Personal loan payments</li>
                        <li>Child support/alimony</li>
                      </ul>
                    </div>
                    <div className="bg-orange-100 rounded-lg p-2 sm:p-3">
                      <p className="text-xs sm:text-sm text-orange-800 font-medium">
                        Recommended: ≤ 36% for most loan types
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* DTI Calculator FAQs */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-xl sm:rounded-2xl">
              <CardContent className="p-4 sm:p-6 md:p-8">
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6 sm:mb-8">Frequently Asked Questions</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
                  <div className="space-y-4 sm:space-y-6">
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2 text-sm sm:text-base">What income should I include in DTI calculations?</h4>
                      <p className="text-gray-600 text-xs sm:text-sm">
                        Include all gross monthly income before taxes: salary, bonuses, commissions, rental income, 
                        alimony, child support, social security, and any other regular income sources that can be verified.
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2 text-sm sm:text-base">What debts are included in DTI calculations?</h4>
                      <p className="text-gray-600 text-xs sm:text-sm">
                        Include all minimum monthly payments: mortgage/rent, car loans, credit cards, student loans, 
                        personal loans, alimony, child support, and other recurring debt obligations. Do not include 
                        utilities, insurance, or discretionary expenses.
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2 text-sm sm:text-base">How does DTI affect loan approval?</h4>
                      <p className="text-gray-600 text-xs sm:text-sm">
                        DTI is a primary factor in loan approval decisions. Lower DTI ratios indicate better financial 
                        health and increase approval chances. Higher ratios may result in loan denial, higher interest 
                        rates, or requirements for additional documentation.
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2 text-sm sm:text-base">Can I get a loan with high DTI?</h4>
                      <p className="text-gray-600 text-xs sm:text-sm">
                        Yes, but options may be limited. Some lenders offer loans with higher DTI ratios if you have 
                        compensating factors like excellent credit, significant assets, or substantial down payment. 
                        Government-backed loans may also have more flexible DTI requirements.
                      </p>
                    </div>
                  </div>
                  <div className="space-y-4 sm:space-y-6">
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2 text-sm sm:text-base">Should I include my spouse's income and debt?</h4>
                      <p className="text-gray-600 text-xs sm:text-sm">
                        If applying for a joint loan, include both incomes and debts. For individual applications, 
                        generally only include your own income and debts, unless your spouse is a co-signer or you 
                        live in a community property state.
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2 text-sm sm:text-base">How often should I calculate my DTI?</h4>
                      <p className="text-gray-600 text-xs sm:text-sm">
                        Review your DTI monthly or whenever your income or debt payments change significantly. 
                        This helps you monitor your financial health and prepare for future loan applications.
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2 text-sm sm:text-base">What's the difference between DTI and credit utilization?</h4>
                      <p className="text-gray-600 text-xs sm:text-sm">
                        DTI compares total debt payments to income, while credit utilization compares credit card 
                        balances to credit limits. Both are important for loan approval, but DTI focuses on payment 
                        capacity while utilization affects credit scores.
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2 text-sm sm:text-base">Does DTI include taxes and insurance?</h4>
                      <p className="text-gray-600 text-xs sm:text-sm">
                        For homeowners, property taxes and insurance are included in the front-end DTI ratio. 
                        Income taxes, life insurance, and other voluntary deductions are not included in DTI calculations.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* DTI Improvement Strategies */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-xl sm:rounded-2xl">
              <CardContent className="p-4 sm:p-6 md:p-8">
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">Advanced DTI Improvement Strategies</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  <div className="space-y-3 sm:space-y-4">
                    <div className="bg-red-50 border-l-4 border-red-400 p-3 sm:p-4 rounded-r-lg">
                      <h4 className="font-semibold text-red-800 mb-2 text-sm sm:text-base">Debt Reduction Techniques</h4>
                      <ul className="text-red-700 text-xs sm:text-sm space-y-1 list-disc list-inside">
                        <li>Debt avalanche: Pay minimums, focus extra on highest interest</li>
                        <li>Debt snowball: Pay minimums, focus extra on smallest balance</li>
                        <li>Balance transfer to lower interest rate cards</li>
                        <li>Debt consolidation loans for better terms</li>
                        <li>Negotiate payment plans with creditors</li>
                      </ul>
                    </div>
                    <div className="bg-green-50 border-l-4 border-green-400 p-3 sm:p-4 rounded-r-lg">
                      <h4 className="font-semibold text-green-800 mb-2 text-sm sm:text-base">Income Enhancement</h4>
                      <ul className="text-green-700 text-xs sm:text-sm space-y-1 list-disc list-inside">
                        <li>Request salary raises or promotions</li>
                        <li>Start freelance or consulting work</li>
                        <li>Develop passive income streams</li>
                        <li>Rent out rooms or property</li>
                        <li>Sell unused items or assets</li>
                      </ul>
                    </div>
                  </div>
                  <div className="space-y-3 sm:space-y-4">
                    <div className="bg-blue-50 border-l-4 border-blue-400 p-3 sm:p-4 rounded-r-lg">
                      <h4 className="font-semibold text-blue-800 mb-2 text-sm sm:text-base">Strategic Planning</h4>
                      <ul className="text-blue-700 text-xs sm:text-sm space-y-1 list-disc list-inside">
                        <li>Time loan applications strategically</li>
                        <li>Avoid new debt 6 months before applying</li>
                        <li>Pay down credit cards before application</li>
                        <li>Consider waiting to improve DTI first</li>
                        <li>Work with credit counselors if needed</li>
                      </ul>
                    </div>
                    <div className="bg-purple-50 border-l-4 border-purple-400 p-3 sm:p-4 rounded-r-lg">
                      <h4 className="font-semibold text-purple-800 mb-2 text-sm sm:text-base">Alternative Solutions</h4>
                      <ul className="text-purple-700 text-xs sm:text-sm space-y-1 list-disc list-inside">
                        <li>Add a co-signer with good DTI and credit</li>
                        <li>Consider non-QM (non-qualified mortgage) loans</li>
                        <li>Look into portfolio lenders with flexible criteria</li>
                        <li>Explore government assistance programs</li>
                        <li>Consider rent-to-own arrangements</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* DTI vs Other Financial Ratios */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-xl sm:rounded-2xl">
              <CardContent className="p-4 sm:p-6 md:p-8">
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">DTI vs Other Financial Health Metrics</h3>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
                  <div className="space-y-3 sm:space-y-4">
                    <h4 className="text-base sm:text-lg font-semibold text-gray-800">Credit Utilization Ratio</h4>
                    <div className="bg-blue-50 rounded-lg p-3 sm:p-4">
                      <p className="text-xs sm:text-sm text-blue-800 mb-2">
                        <strong>Formula:</strong> Credit card balances ÷ Credit limits
                      </p>
                      <p className="text-xs sm:text-sm text-blue-700 mb-2">
                        <strong>Ideal:</strong> ≤ 30% (≤ 10% for excellent credit)
                      </p>
                      <p className="text-xs text-blue-600">
                        Affects credit score directly and influences loan approval alongside DTI.
                      </p>
                    </div>
                  </div>
                  <div className="space-y-3 sm:space-y-4">
                    <h4 className="text-base sm:text-lg font-semibold text-gray-800">Emergency Fund Ratio</h4>
                    <div className="bg-green-50 rounded-lg p-3 sm:p-4">
                      <p className="text-xs sm:text-sm text-green-800 mb-2">
                        <strong>Formula:</strong> Emergency savings ÷ Monthly expenses
                      </p>
                      <p className="text-xs sm:text-sm text-green-700 mb-2">
                        <strong>Ideal:</strong> 3-6 months of expenses
                      </p>
                      <p className="text-xs text-green-600">
                        Provides financial cushion and may be considered by lenders as a compensating factor.
                      </p>
                    </div>
                  </div>
                  <div className="space-y-3 sm:space-y-4">
                    <h4 className="text-base sm:text-lg font-semibold text-gray-800">Savings Rate</h4>
                    <div className="bg-purple-50 rounded-lg p-3 sm:p-4">
                      <p className="text-xs sm:text-sm text-purple-800 mb-2">
                        <strong>Formula:</strong> Monthly savings ÷ Monthly income
                      </p>
                      <p className="text-xs sm:text-sm text-purple-700 mb-2">
                        <strong>Ideal:</strong> ≥ 20% of income
                      </p>
                      <p className="text-xs text-purple-600">
                        Demonstrates financial discipline and ability to build wealth over time.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
                  <h4 className="font-semibold text-blue-800 mb-2 text-sm sm:text-base">Holistic Financial Health</h4>
                  <p className="text-blue-700 text-xs sm:text-sm">
                    While DTI is crucial for loan approval, consider all these metrics together for complete financial health. 
                    A balanced approach to managing debt, building savings, and maintaining good credit creates the strongest 
                    foundation for achieving your financial goals.
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
