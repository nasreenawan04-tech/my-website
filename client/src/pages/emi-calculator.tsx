import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface EMIResult {
  emi: number;
  totalAmount: number;
  totalInterest: number;
  principalAmount: number;
  interestAmount: number;
  interestPercentage: number;
  prepaymentAnalysis?: {
    timeReduction: number;
    interestSaved: number;
    newTenure: number;
    newTotalAmount: number;
  };
  stepUpAnalysis?: {
    totalInterestSaved: number;
    averageEMI: number;
    finalEMI: number;
    yearlyEMISchedule: Array<{ year: number; emi: number }>;
  };
  amortizationSchedule: Array<{
    month: number;
    emi: number;
    principal: number;
    interest: number;
    balance: number;
  }>;
}

export default function EMICalculator() {
  const [loanAmount, setLoanAmount] = useState('100000');
  const [interestRate, setInterestRate] = useState('8.50');
  const [loanTenure, setLoanTenure] = useState('20');
  const [tenureType, setTenureType] = useState('years');
  const [currency, setCurrency] = useState('USD');
  const [prepaymentAmount, setPrepaymentAmount] = useState('0');
  const [prepaymentAfterMonths, setPrepaymentAfterMonths] = useState('12');
  const [stepUpPercentage, setStepUpPercentage] = useState('5');
  const [enableStepUp, setEnableStepUp] = useState(false);
  const [enablePrepayment, setEnablePrepayment] = useState(false);
  const [showSchedule, setShowSchedule] = useState(false);
  const [result, setResult] = useState<EMIResult | null>(null);

  const calculateEMI = () => {
    const principal = parseFloat(loanAmount);
    const annualRate = parseFloat(interestRate) / 100;
    const rate = annualRate / 12; // Monthly interest rate
    const tenure = tenureType === 'years' ? parseFloat(loanTenure) * 12 : parseFloat(loanTenure);
    const prepayment = parseFloat(prepaymentAmount) || 0;
    const prepaymentAfter = parseInt(prepaymentAfterMonths) || 12;
    const stepUpRate = parseFloat(stepUpPercentage) / 100;

    if (principal <= 0 || annualRate <= 0 || tenure <= 0) return;

    // Standard EMI calculation
    const baseEMI = (principal * rate * Math.pow(1 + rate, tenure)) / (Math.pow(1 + rate, tenure) - 1);
    
    // Generate amortization schedule
    const amortizationSchedule = [];
    let currentBalance = principal;
    let totalInterestPaid = 0;
    let currentEMI = baseEMI;
    let actualTenure = tenure;
    
    for (let month = 1; month <= tenure && currentBalance > 1; month++) {
      // Handle step-up EMI
      if (enableStepUp && month > 12 && (month - 1) % 12 === 0) {
        currentEMI = currentEMI * (1 + stepUpRate);
      }
      
      const interestPayment = currentBalance * rate;
      let principalPayment = Math.min(currentEMI - interestPayment, currentBalance);
      
      // Handle prepayment
      if (enablePrepayment && month === prepaymentAfter) {
        principalPayment += Math.min(prepayment, currentBalance - principalPayment);
      }
      
      currentBalance -= principalPayment;
      totalInterestPaid += interestPayment;
      actualTenure = month;
      
      if (month <= 60) { // Store first 5 years for display
        amortizationSchedule.push({
          month,
          emi: currentEMI,
          principal: principalPayment,
          interest: interestPayment,
          balance: Math.max(0, currentBalance)
        });
      }
      
      if (currentBalance <= 1) break;
    }

    // Calculate regular scenario for comparison
    const regularTotalAmount = baseEMI * tenure;
    const regularTotalInterest = regularTotalAmount - principal;
    
    // Final results
    const finalTotalAmount = totalInterestPaid + principal;
    const finalTotalInterest = totalInterestPaid;
    const interestPercentage = (finalTotalInterest / finalTotalAmount) * 100;

    // Prepayment analysis
    let prepaymentAnalysis;
    if (enablePrepayment && prepayment > 0) {
      const interestSaved = regularTotalInterest - finalTotalInterest;
      const timeReduction = Math.max(0, tenure - actualTenure);
      
      prepaymentAnalysis = {
        timeReduction: Math.round(timeReduction),
        interestSaved: Math.round(interestSaved * 100) / 100,
        newTenure: actualTenure,
        newTotalAmount: Math.round(finalTotalAmount * 100) / 100
      };
    }

    // Step-up analysis
    let stepUpAnalysis;
    if (enableStepUp) {
      const regularTotalInterest = (baseEMI * tenure) - principal;
      const totalInterestSaved = Math.max(0, regularTotalInterest - finalTotalInterest);
      const averageEMI = finalTotalAmount / actualTenure;
      const finalEMI = currentEMI;
      
      // Create yearly EMI schedule
      const yearlyEMISchedule = [];
      let yearlyEMI = baseEMI;
      for (let year = 1; year <= Math.ceil(tenure / 12); year++) {
        yearlyEMISchedule.push({ 
          year, 
          emi: Math.round(yearlyEMI * 100) / 100 
        });
        if (year > 1) {
          yearlyEMI = yearlyEMI * (1 + stepUpRate);
        }
      }
      
      stepUpAnalysis = {
        totalInterestSaved: Math.round(totalInterestSaved * 100) / 100,
        averageEMI: Math.round(averageEMI * 100) / 100,
        finalEMI: Math.round(finalEMI * 100) / 100,
        yearlyEMISchedule
      };
    }

    setResult({
      emi: Math.round(baseEMI * 100) / 100,
      totalAmount: Math.round(finalTotalAmount * 100) / 100,
      totalInterest: Math.round(finalTotalInterest * 100) / 100,
      principalAmount: principal,
      interestAmount: Math.round(finalTotalInterest * 100) / 100,
      interestPercentage: Math.round(interestPercentage * 100) / 100,
      prepaymentAnalysis,
      stepUpAnalysis,
      amortizationSchedule
    });
  };

  const resetCalculator = () => {
    setLoanAmount('100000');
    setInterestRate('8.50');
    setLoanTenure('20');
    setTenureType('years');
    setCurrency('USD');
    setPrepaymentAmount('0');
    setPrepaymentAfterMonths('12');
    setStepUpPercentage('5');
    setEnableStepUp(false);
    setEnablePrepayment(false);
    setShowSchedule(false);
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Helmet>
        <title>EMI Calculator - Calculate Equated Monthly Installments | DapsiWow</title>
        <meta name="description" content="Free EMI calculator to calculate Equated Monthly Installments for home loans, car loans, personal loans, and business loans. Get instant EMI calculations with step-up and prepayment options. Support for multiple currencies worldwide." />
        <meta name="keywords" content="EMI calculator, equated monthly installment calculator, home loan EMI, car loan EMI, personal loan EMI, loan EMI calculator, monthly payment calculator, loan installment calculator, EMI formula, prepayment calculator, step up EMI calculator" />
        <meta property="og:title" content="EMI Calculator - Calculate Equated Monthly Installments | DapsiWow" />
        <meta property="og:description" content="Free EMI calculator for home loans, car loans, personal loans with step-up and prepayment analysis. Calculate accurate monthly installments instantly." />
        <meta property="og:type" content="website" />
        <meta name="robots" content="index, follow" />
        <meta name="author" content="DapsiWow" />
        <link rel="canonical" href="https://dapsiwow.com/tools/emi-calculator" />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            "name": "EMI Calculator",
            "description": "Free online EMI calculator to calculate Equated Monthly Installments for various types of loans including home loans, car loans, personal loans, and business loans. Features step-up EMI and prepayment analysis.",
            "url": "https://dapsiwow.com/tools/emi-calculator",
            "applicationCategory": "FinanceApplication",
            "operatingSystem": "Any",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "USD"
            },
            "featureList": [
              "Calculate EMI for any loan amount",
              "Support for multiple currencies",
              "Step-up EMI calculations",
              "Prepayment analysis",
              "Amortization schedule",
              "Interest savings calculator"
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
                <span className="text-sm font-medium text-blue-700">Professional EMI Calculator</span>
              </div>
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-slate-900 leading-tight">
                Smart EMI
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                  Calculator
                </span>
              </h1>
              <p className="text-xl sm:text-2xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
                Calculate Equated Monthly Installments with advanced features like step-up EMI and prepayment analysis
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
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">EMI Configuration</h2>
                    <p className="text-gray-600">Enter your loan details to get accurate EMI calculations</p>
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

                    {/* Loan Amount */}
                    <div className="space-y-3">
                      <Label htmlFor="loan-amount" className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                        Loan Amount
                      </Label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-lg">$</span>
                        <Input
                          id="loan-amount"
                          type="number"
                          value={loanAmount}
                          onChange={(e) => setLoanAmount(e.target.value)}
                          className="h-14 pl-8 text-lg border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-blue-500"
                          placeholder="100,000"
                          data-testid="input-loan-amount"
                        />
                      </div>
                    </div>

                    {/* Interest Rate */}
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
                          placeholder="8.50"
                          step="0.01"
                          data-testid="input-interest-rate"
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 text-lg">%</span>
                      </div>
                    </div>

                    {/* Loan Tenure */}
                    <div className="space-y-3">
                      <Label className="text-sm font-semibold text-gray-800 uppercase tracking-wide">Loan Term</Label>
                      <div className="grid grid-cols-2 gap-3">
                        <Input
                          type="number"
                          value={loanTenure}
                          onChange={(e) => setLoanTenure(e.target.value)}
                          className="h-14 text-lg border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-blue-500"
                          placeholder="20"
                          min="1"
                          data-testid="input-loan-tenure"
                        />
                        <Select value={tenureType} onValueChange={setTenureType}>
                          <SelectTrigger className="h-14 border-2 border-gray-200 rounded-xl text-lg" data-testid="select-tenure-type">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="years">Years</SelectItem>
                            <SelectItem value="months">Months</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  {/* Advanced Options */}
                  <div className="space-y-6 border-t pt-8">
                    <h3 className="text-xl font-bold text-gray-900">Advanced Options</h3>
                    
                    {/* Prepayment Option */}
                    <div className="space-y-4 bg-gray-50 rounded-xl p-6">
                      <div className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          id="enable-prepayment"
                          checked={enablePrepayment}
                          onChange={(e) => setEnablePrepayment(e.target.checked)}
                          className="h-5 w-5 text-blue-600 border-2 border-gray-300 rounded focus:ring-blue-500"
                          data-testid="checkbox-prepayment"
                        />
                        <label htmlFor="enable-prepayment" className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                          Enable Prepayment Analysis
                        </label>
                      </div>
                      
                      {enablePrepayment && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                          <div className="space-y-2">
                            <Label htmlFor="prepayment-amount" className="text-sm font-medium text-gray-700">
                              Prepayment Amount
                            </Label>
                            <div className="relative">
                              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                              <Input
                                id="prepayment-amount"
                                type="number"
                                value={prepaymentAmount}
                                onChange={(e) => setPrepaymentAmount(e.target.value)}
                                className="h-12 pl-8 border-2 border-gray-200 rounded-lg"
                                placeholder="50,000"
                                min="0"
                                data-testid="input-prepayment-amount"
                              />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="prepayment-after" className="text-sm font-medium text-gray-700">
                              After (Months)
                            </Label>
                            <Input
                              id="prepayment-after"
                              type="number"
                              value={prepaymentAfterMonths}
                              onChange={(e) => setPrepaymentAfterMonths(e.target.value)}
                              className="h-12 border-2 border-gray-200 rounded-lg"
                              placeholder="12"
                              min="1"
                              data-testid="input-prepayment-after"
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Step-Up EMI Option */}
                    <div className="space-y-4 bg-gray-50 rounded-xl p-6">
                      <div className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          id="enable-stepup"
                          checked={enableStepUp}
                          onChange={(e) => setEnableStepUp(e.target.checked)}
                          className="h-5 w-5 text-blue-600 border-2 border-gray-300 rounded focus:ring-blue-500"
                          data-testid="checkbox-stepup"
                        />
                        <label htmlFor="enable-stepup" className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                          Enable Step-Up EMI
                        </label>
                      </div>
                      
                      {enableStepUp && (
                        <div className="mt-4">
                          <Label htmlFor="stepup-percentage" className="text-sm font-medium text-gray-700">
                            Annual Increase (%)
                          </Label>
                          <div className="relative mt-2">
                            <Input
                              id="stepup-percentage"
                              type="number"
                              value={stepUpPercentage}
                              onChange={(e) => setStepUpPercentage(e.target.value)}
                              className="h-12 pr-8 border-2 border-gray-200 rounded-lg w-full md:w-48"
                              placeholder="5"
                              min="1"
                              max="50"
                              data-testid="input-stepup-percentage"
                            />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">%</span>
                          </div>
                          <p className="text-sm text-gray-500 mt-2">
                            EMI increases each year by this percentage
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-4 pt-6">
                    <Button
                      onClick={calculateEMI}
                      className="flex-1 h-14 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold text-lg rounded-xl shadow-lg transform transition-all duration-200 hover:scale-105"
                      data-testid="button-calculate"
                    >
                      Calculate EMI
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

                  {/* Advanced Options */}
                  {result && (
                    <div className="flex flex-wrap gap-3 pt-4">
                      <Button
                        onClick={() => setShowSchedule(!showSchedule)}
                        variant="outline"
                        size="sm"
                        className="rounded-full"
                        data-testid="button-show-schedule"
                      >
                        {showSchedule ? 'Hide' : 'Show'} Payment Schedule
                      </Button>
                    </div>
                  )}
                </div>

                {/* Results Section */}
                <div className="bg-gradient-to-br from-gray-50 to-blue-50 p-8 lg:p-12">
                  <h2 className="text-2xl font-bold text-gray-900 mb-8">Results</h2>
                  
                  {result ? (
                    <div className="space-y-6" data-testid="emi-results">
                      {/* Monthly EMI Highlight */}
                      <div className="bg-white rounded-2xl p-6 shadow-lg border border-blue-100">
                        <div className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-2">Monthly EMI</div>
                        <div className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600" data-testid="text-monthly-emi">
                          {formatCurrency(result.emi)}
                        </div>
                      </div>

                      {/* Payment Breakdown */}
                      <div className="space-y-4">
                        <div className="bg-white rounded-xl p-4 shadow-sm">
                          <div className="flex justify-between items-center">
                            <span className="font-medium text-gray-700">Principal Amount</span>
                            <span className="font-bold text-gray-900" data-testid="text-principal-amount">
                              {formatCurrency(result.principalAmount)}
                            </span>
                          </div>
                        </div>
                        <div className="bg-white rounded-xl p-4 shadow-sm">
                          <div className="flex justify-between items-center">
                            <span className="font-medium text-gray-700">Total Interest</span>
                            <span className="font-bold text-orange-600" data-testid="text-total-interest">
                              {formatCurrency(result.totalInterest)}
                            </span>
                          </div>
                        </div>
                        <div className="bg-white rounded-xl p-4 shadow-sm">
                          <div className="flex justify-between items-center">
                            <span className="font-medium text-gray-700">Total Amount</span>
                            <span className="font-bold text-gray-900" data-testid="text-total-amount">
                              {formatCurrency(result.totalAmount)}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Prepayment Benefits */}
                      {result.prepaymentAnalysis && (
                        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
                          <h4 className="font-bold text-green-800 mb-4 text-lg">Prepayment Benefits</h4>
                          <div className="space-y-3">
                            <div className="flex justify-between items-center">
                              <span className="text-green-700 font-medium">Interest Saved:</span>
                              <span className="font-bold text-green-800 text-lg">
                                {formatCurrency(result.prepaymentAnalysis.interestSaved)}
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-green-700 font-medium">Time Saved:</span>
                              <span className="font-bold text-green-800 text-lg">
                                {Math.round(result.prepaymentAnalysis.timeReduction / 12)} years
                              </span>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Step-Up Benefits */}
                      {result.stepUpAnalysis && (
                        <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-6 border border-purple-200">
                          <h4 className="font-bold text-purple-800 mb-4 text-lg">Step-Up EMI Benefits</h4>
                          <div className="space-y-3">
                            <div className="flex justify-between items-center">
                              <span className="text-purple-700 font-medium">Interest Saved:</span>
                              <span className="font-bold text-purple-800 text-lg">
                                {formatCurrency(result.stepUpAnalysis.totalInterestSaved)}
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-purple-700 font-medium">Final EMI:</span>
                              <span className="font-bold text-purple-800 text-lg">
                                {formatCurrency(result.stepUpAnalysis.finalEMI)}
                              </span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-16" data-testid="no-results">
                      <div className="w-20 h-20 bg-gray-200 rounded-full mx-auto mb-6 flex items-center justify-center">
                        <div className="text-3xl font-bold text-gray-400">₹</div>
                      </div>
                      <p className="text-gray-500 text-lg">Enter loan details and calculate to see EMI results</p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Schedule */}
          {result && showSchedule && (
            <Card className="mt-8 bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Payment Schedule (First 5 Years)</h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg">
                        <th className="px-6 py-4 text-left font-bold text-gray-900 rounded-l-lg">Payment #</th>
                        <th className="px-6 py-4 text-right font-bold text-gray-900">EMI</th>
                        <th className="px-6 py-4 text-right font-bold text-gray-900">Principal</th>
                        <th className="px-6 py-4 text-right font-bold text-gray-900">Interest</th>
                        <th className="px-6 py-4 text-right font-bold text-gray-900 rounded-r-lg">Balance</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {result.amortizationSchedule.map((payment, index) => (
                        <tr key={index} className="hover:bg-blue-50 transition-colors">
                          <td className="px-6 py-4 font-medium text-gray-900">{payment.month}</td>
                          <td className="px-6 py-4 text-right text-gray-900 font-medium">
                            {formatCurrency(payment.emi)}
                          </td>
                          <td className="px-6 py-4 text-right text-green-600 font-bold">
                            {formatCurrency(payment.principal)}
                          </td>
                          <td className="px-6 py-4 text-right text-orange-600 font-medium">
                            {formatCurrency(payment.interest)}
                          </td>
                          <td className="px-6 py-4 text-right text-gray-900 font-bold">
                            {formatCurrency(payment.balance)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}

          {/* SEO Content Section */}
          <div className="mt-16 grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">What is EMI?</h3>
                <div className="space-y-4 text-gray-600">
                  <p>
                    EMI stands for Equated Monthly Installment - a fixed payment amount made by a borrower to a lender 
                    at a specified date each month. EMIs are used to pay off both interest and principal each month, 
                    ensuring that the loan is paid off in full over a specified number of years.
                  </p>
                  <p>
                    Our EMI calculator helps you determine the exact monthly payment for any loan, whether it's a 
                    home loan, car loan, personal loan, or business loan. With support for multiple currencies and 
                    advanced features like step-up EMI and prepayment analysis, you can make informed financial decisions.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">How to Calculate EMI?</h3>
                <div className="space-y-4 text-gray-600">
                  <p>
                    The EMI formula is: EMI = [P x R x (1+R)^N] / [(1+R)^N-1]
                  </p>
                  <ul className="space-y-2 list-disc list-inside">
                    <li>P = Principal loan amount</li>
                    <li>R = Monthly interest rate (Annual rate ÷ 12)</li>
                    <li>N = Number of monthly installments</li>
                  </ul>
                  <p>
                    Our calculator automatically applies this formula and provides additional insights like total 
                    interest payable, prepayment benefits, and step-up EMI advantages to help you optimize your loan.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Features of Our EMI Calculator</h3>
                <div className="space-y-3 text-gray-600">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Support for 10+ international currencies</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Step-up EMI calculations for increasing income</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Prepayment analysis to save on interest</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Detailed amortization schedule</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Accurate calculations for all loan types</span>
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
                    <span>Plan your budget with accurate EMI calculations</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Compare different loan scenarios instantly</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Understand the impact of prepayments</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Make informed decisions about loan tenure</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Free to use with no registration required</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Additional SEO Content Sections */}
          <div className="mt-12 space-y-8">
            {/* Types of Loans Section */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Types of Loans for EMI Calculation</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-gray-800">Home Loans</h4>
                    <p className="text-gray-600">
                      Home loans typically have the longest tenure (15-30 years) and competitive interest rates. 
                      EMI calculations help you determine affordability based on your monthly income and plan for 
                      property purchases effectively.
                    </p>
                  </div>
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-gray-800">Car Loans</h4>
                    <p className="text-gray-600">
                      Auto loans usually range from 1-7 years with moderate interest rates. Use our EMI calculator 
                      to compare different car financing options and choose the best loan tenure for your budget.
                    </p>
                  </div>
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-gray-800">Personal Loans</h4>
                    <p className="text-gray-600">
                      Personal loans offer flexibility but come with higher interest rates. Calculate EMI to ensure 
                      the monthly payment fits comfortably within your budget without affecting other financial goals.
                    </p>
                  </div>
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-gray-800">Business Loans</h4>
                    <p className="text-gray-600">
                      Business loans help entrepreneurs grow their ventures. EMI calculations are crucial for 
                      cash flow planning and ensuring loan payments don't strain business operations.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Factors Affecting EMI */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
                <CardContent className="p-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">Factors Affecting EMI Amount</h3>
                  <div className="space-y-4 text-gray-600">
                    <div className="border-l-4 border-blue-500 pl-4">
                      <h4 className="font-semibold text-gray-800 mb-2">Principal Amount</h4>
                      <p className="text-sm">Higher loan amounts result in higher EMIs. Borrow only what you need and can afford to repay comfortably.</p>
                    </div>
                    <div className="border-l-4 border-green-500 pl-4">
                      <h4 className="font-semibold text-gray-800 mb-2">Interest Rate</h4>
                      <p className="text-sm">Lower interest rates reduce EMI burden. Compare rates from different lenders and negotiate for better terms.</p>
                    </div>
                    <div className="border-l-4 border-orange-500 pl-4">
                      <h4 className="font-semibold text-gray-800 mb-2">Loan Tenure</h4>
                      <p className="text-sm">Longer tenure reduces EMI but increases total interest. Find the right balance for your financial situation.</p>
                    </div>
                    <div className="border-l-4 border-purple-500 pl-4">
                      <h4 className="font-semibold text-gray-800 mb-2">Credit Score</h4>
                      <p className="text-sm">Better credit scores qualify for lower interest rates, reducing your EMI amount significantly.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
                <CardContent className="p-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">EMI Planning Strategies</h3>
                  <div className="space-y-4 text-gray-600">
                    <div className="bg-blue-50 rounded-lg p-4">
                      <h4 className="font-semibold text-blue-800 mb-2">50-30-20 Rule</h4>
                      <p className="text-sm text-blue-700">Limit total EMIs to 50% of your monthly income, keeping 30% for expenses and 20% for savings.</p>
                    </div>
                    <div className="bg-green-50 rounded-lg p-4">
                      <h4 className="font-semibold text-green-800 mb-2">Step-Up EMI</h4>
                      <p className="text-sm text-green-700">Start with lower EMIs that increase annually with your expected salary growth, saving on total interest.</p>
                    </div>
                    <div className="bg-orange-50 rounded-lg p-4">
                      <h4 className="font-semibold text-orange-800 mb-2">Prepayment Strategy</h4>
                      <p className="text-sm text-orange-700">Use bonuses, tax refunds, or windfalls to make prepayments and reduce loan tenure significantly.</p>
                    </div>
                    <div className="bg-purple-50 rounded-lg p-4">
                      <h4 className="font-semibold text-purple-800 mb-2">Balance Transfer</h4>
                      <p className="text-sm text-purple-700">Transfer high-interest loans to lenders offering lower rates to reduce EMI burden.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* EMI FAQs Section */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-8">Frequently Asked Questions about EMI</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">What happens if I miss an EMI payment?</h4>
                      <p className="text-gray-600 text-sm">Missing EMI payments can result in late fees, negative impact on credit score, and potential legal action. Contact your lender immediately if you anticipate payment difficulties.</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">Can I change my EMI amount during the loan tenure?</h4>
                      <p className="text-gray-600 text-sm">Yes, through loan restructuring, prepayments, or step-up/step-down EMI options. Consult your lender for available options based on your financial situation.</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">Is EMI tax deductible?</h4>
                      <p className="text-gray-600 text-sm">Home loan EMIs qualify for tax deductions - principal under Section 80C and interest under Section 24. Personal and car loan EMIs generally don't qualify for tax benefits.</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">What's the maximum loan tenure available?</h4>
                      <p className="text-gray-600 text-sm">Home loans can extend up to 30 years, car loans up to 7 years, and personal loans typically up to 5 years. Longer tenure reduces EMI but increases total interest cost.</p>
                    </div>
                  </div>
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">Should I choose fixed or floating interest rates?</h4>
                      <p className="text-gray-600 text-sm">Fixed rates provide EMI certainty but are typically higher. Floating rates can save money when rates decline but carry uncertainty. Choose based on your risk tolerance and market outlook.</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">How does prepayment reduce my loan burden?</h4>
                      <p className="text-gray-600 text-sm">Prepayments directly reduce the principal amount, which decreases the total interest payable and can significantly shorten your loan tenure, saving substantial money.</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">What's the ideal EMI-to-income ratio?</h4>
                      <p className="text-gray-600 text-sm">Financial experts recommend keeping total EMIs below 40-50% of your monthly income to maintain financial stability and accommodate unexpected expenses.</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">Can I get a loan with bad credit?</h4>
                      <p className="text-gray-600 text-sm">Yes, but expect higher interest rates and stricter terms. Consider improving your credit score, providing collateral, or getting a co-signer to improve loan terms.</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Interest Rate Types */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
                <CardContent className="p-8">
                  <h3 className="text-xl font-bold text-gray-900 mb-6">Fixed Interest Rate</h3>
                  <div className="space-y-4 text-gray-600">
                    <p className="text-sm">
                      Fixed rates remain constant throughout the loan tenure, providing EMI predictability and budget certainty.
                    </p>
                    <div className="space-y-2">
                      <h4 className="font-semibold text-green-800 text-sm">Advantages:</h4>
                      <ul className="text-xs space-y-1 list-disc list-inside text-green-700">
                        <li>Predictable monthly payments</li>
                        <li>Protection from rate increases</li>
                        <li>Easy budget planning</li>
                      </ul>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-semibold text-red-800 text-sm">Disadvantages:</h4>
                      <ul className="text-xs space-y-1 list-disc list-inside text-red-700">
                        <li>Higher initial rates</li>
                        <li>No benefit from rate decreases</li>
                        <li>Limited flexibility</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
                <CardContent className="p-8">
                  <h3 className="text-xl font-bold text-gray-900 mb-6">Floating Interest Rate</h3>
                  <div className="space-y-4 text-gray-600">
                    <p className="text-sm">
                      Floating rates fluctuate with market conditions, typically linked to benchmark rates like repo rate or MCLR.
                    </p>
                    <div className="space-y-2">
                      <h4 className="font-semibold text-green-800 text-sm">Advantages:</h4>
                      <ul className="text-xs space-y-1 list-disc list-inside text-green-700">
                        <li>Lower initial rates</li>
                        <li>Benefit from rate decreases</li>
                        <li>Potential interest savings</li>
                      </ul>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-semibold text-red-800 text-sm">Disadvantages:</h4>
                      <ul className="text-xs space-y-1 list-disc list-inside text-red-700">
                        <li>EMI uncertainty</li>
                        <li>Risk of rate increases</li>
                        <li>Difficult to budget</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
                <CardContent className="p-8">
                  <h3 className="text-xl font-bold text-gray-900 mb-6">Hybrid Interest Rate</h3>
                  <div className="space-y-4 text-gray-600">
                    <p className="text-sm">
                      Hybrid loans start with fixed rates for an initial period, then switch to floating rates.
                    </p>
                    <div className="space-y-2">
                      <h4 className="font-semibold text-green-800 text-sm">Advantages:</h4>
                      <ul className="text-xs space-y-1 list-disc list-inside text-green-700">
                        <li>Initial rate certainty</li>
                        <li>Future flexibility</li>
                        <li>Balanced approach</li>
                      </ul>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-semibold text-red-800 text-sm">Disadvantages:</h4>
                      <ul className="text-xs space-y-1 list-disc list-inside text-red-700">
                        <li>Complex structure</li>
                        <li>Future rate uncertainty</li>
                        <li>Transition complexity</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Common Mistakes Section */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Common EMI Calculation Mistakes to Avoid</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-r-lg">
                      <h4 className="font-semibold text-red-800 mb-2">Ignoring Hidden Costs</h4>
                      <p className="text-red-700 text-sm">Many borrowers forget processing fees, insurance, and other charges when calculating total loan cost. Always factor in all associated expenses.</p>
                    </div>
                    <div className="bg-orange-50 border-l-4 border-orange-400 p-4 rounded-r-lg">
                      <h4 className="font-semibold text-orange-800 mb-2">Not Considering Income Growth</h4>
                      <p className="text-orange-700 text-sm">Step-up EMI options can save significant interest if your income is expected to grow. Don't stick to fixed EMI if you can handle increases.</p>
                    </div>
                    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-lg">
                      <h4 className="font-semibold text-yellow-800 mb-2">Choosing Maximum Tenure Always</h4>
                      <p className="text-yellow-700 text-sm">While longer tenure reduces EMI, it significantly increases total interest cost. Balance EMI affordability with total cost.</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-lg">
                      <h4 className="font-semibold text-blue-800 mb-2">Not Shopping for Better Rates</h4>
                      <p className="text-blue-700 text-sm">Even a 0.5% difference in interest rate can save thousands over the loan tenure. Compare offers from multiple lenders before deciding.</p>
                    </div>
                    <div className="bg-purple-50 border-l-4 border-purple-400 p-4 rounded-r-lg">
                      <h4 className="font-semibold text-purple-800 mb-2">Overlooking Prepayment Options</h4>
                      <p className="text-purple-700 text-sm">Many loans allow partial or full prepayment without penalties. Use windfalls like bonuses to reduce principal and save on interest.</p>
                    </div>
                    <div className="bg-green-50 border-l-4 border-green-400 p-4 rounded-r-lg">
                      <h4 className="font-semibold text-green-800 mb-2">Ignoring Credit Score Impact</h4>
                      <p className="text-green-700 text-sm">A good credit score can significantly reduce interest rates. Work on improving your score before applying for loans.</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Loan vs Investment Section */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">EMI vs Investment: Making Smart Financial Decisions</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-gray-800">When to Take a Loan</h4>
                    <div className="space-y-3 text-gray-600">
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-sm">Essential purchases like home or vehicle where immediate need exists</span>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-sm">Business expansion opportunities with higher expected returns</span>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-sm">Tax benefits available (home loans, education loans)</span>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-sm">Loan interest rate is lower than potential investment returns</span>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-gray-800">When to Avoid Loans</h4>
                    <div className="space-y-3 text-gray-600">
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-sm">Lifestyle purchases or discretionary spending</span>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-sm">EMI would strain your monthly budget significantly</span>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-sm">High interest rates with no tax benefits</span>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-sm">Uncertain income or job security</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
                  <h4 className="font-semibold text-blue-800 mb-2">Smart Strategy</h4>
                  <p className="text-blue-700 text-sm">
                    Use our EMI calculator to determine monthly payments, then compare the cost of borrowing with potential 
                    investment returns. Consider your risk tolerance, financial goals, and market conditions before deciding 
                    between borrowing and self-funding.
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