import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { Calculator } from 'lucide-react';

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

const EMICalculator = () => {
  const [loanAmount, setLoanAmount] = useState('');
  const [interestRate, setInterestRate] = useState('');
  const [loanTenure, setLoanTenure] = useState('');
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

    if (principal && rate && tenure) {
      // Standard EMI calculation
      const baseEMI = (principal * rate * Math.pow(1 + rate, tenure)) / (Math.pow(1 + rate, tenure) - 1);
      
      // Generate amortization schedule
      const amortizationSchedule = [];
      let currentBalance = principal;
      let totalInterestPaid = 0;
      let currentEMI = baseEMI;
      
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
        const timeReduction = Math.max(0, tenure - amortizationSchedule.length);
        
        prepaymentAnalysis = {
          timeReduction: Math.round(timeReduction),
          interestSaved: Math.round(interestSaved * 100) / 100,
          newTenure: amortizationSchedule.length,
          newTotalAmount: Math.round(finalTotalAmount * 100) / 100
        };
      }

      // Step-up analysis
      let stepUpAnalysis;
      if (enableStepUp) {
        const regularTotalInterest = (baseEMI * tenure) - principal;
        const totalInterestSaved = Math.max(0, regularTotalInterest - finalTotalInterest);
        const averageEMI = finalTotalAmount / (amortizationSchedule.length || tenure);
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
    }
  };

  const resetCalculator = () => {
    setLoanAmount('');
    setInterestRate('');
    setLoanTenure('');
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
    <>
      <Helmet>
        <title>EMI Calculator - Free Loan EMI Calculator for Home, Car & Personal Loans | ToolsHub</title>
        <meta name="description" content="Calculate EMI for home loans, car loans, personal loans & more with our free EMI calculator. Get instant results with multiple currency support. Compare loan options easily." />
        <meta name="keywords" content="EMI calculator, loan EMI calculator, home loan EMI, car loan EMI, personal loan EMI, monthly installment calculator, loan payment calculator, equated monthly installment, loan calculator online, EMI formula, loan comparison tool" />
        <meta property="og:title" content="EMI Calculator - Free Loan EMI Calculator for All Types of Loans | ToolsHub" />
        <meta property="og:description" content="Calculate EMI for home loans, car loans, personal loans & more with our free EMI calculator. Get instant results with multiple currency support. Compare loan options easily." />
        <meta property="og:type" content="website" />
        <meta name="robots" content="index, follow" />
        <meta name="author" content="ToolsHub" />
        <link rel="canonical" href="/tools/emi-calculator" />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            "name": "EMI Calculator",
            "description": "Free online EMI calculator to calculate Equated Monthly Installments for various types of loans including home loans, car loans, and personal loans.",
            "url": "/tools/emi-calculator",
            "applicationCategory": "FinanceApplication",
            "operatingSystem": "Any",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "USD"
            }
          })}
        </script>
      </Helmet>

      <div className="min-h-screen flex flex-col" data-testid="page-emi-calculator">
        <Header />
        
        <main className="flex-1 bg-neutral-50">
          {/* Hero Section */}
          <section className="gradient-hero text-white py-16">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <div className="w-20 h-20 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <i className="fas fa-chart-line text-3xl"></i>
              </div>
              <h1 className="text-4xl sm:text-5xl font-bold mb-6" data-testid="text-page-title">
                EMI Calculator
              </h1>
              <p className="text-xl text-blue-100 max-w-2xl mx-auto">
                Calculate Equated Monthly Installments (EMI) for loans with support for multiple currencies worldwide
              </p>
            </div>
          </section>

          {/* Calculator Section */}
          <section className="py-16">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
              <Card className="bg-white shadow-sm border-0">
                <CardContent className="p-8">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    {/* Input Section */}
                    <div className="space-y-6">
                      <h2 className="text-2xl font-semibold text-gray-900 mb-8">Loan Details</h2>
                      
                      {/* Currency Selection */}
                      <div className="space-y-3">
                        <Label htmlFor="currency" className="text-sm font-medium text-gray-700">
                          Currency
                        </Label>
                        <Select value={currency} onValueChange={setCurrency}>
                          <SelectTrigger className="h-12 border-gray-200 rounded-lg" data-testid="select-currency">
                            <SelectValue placeholder="Select currency" />
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
                        <Label htmlFor="loan-amount" className="text-sm font-medium text-gray-700">
                          Loan Amount
                        </Label>
                        <Input
                          id="loan-amount"
                          type="number"
                          value={loanAmount}
                          onChange={(e) => setLoanAmount(e.target.value)}
                          className="h-12 text-base border-gray-200 rounded-lg"
                          placeholder="Enter loan amount"
                          min="0"
                          step="0.01"
                          data-testid="input-loan-amount"
                        />
                      </div>

                      {/* Interest Rate */}
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
                          placeholder="Enter interest rate"
                          min="0"
                          max="100"
                          step="0.01"
                          data-testid="input-interest-rate"
                        />
                      </div>

                      {/* Loan Tenure */}
                      <div className="space-y-3">
                        <Label className="text-sm font-medium text-gray-700">Loan Term</Label>
                        <div className="grid grid-cols-2 gap-3">
                          <Input
                            type="number"
                            value={loanTenure}
                            onChange={(e) => setLoanTenure(e.target.value)}
                            className="h-12 text-base border-gray-200 rounded-lg"
                            placeholder="Enter tenure"
                            min="1"
                            data-testid="input-loan-tenure"
                          />
                          <Select value={tenureType} onValueChange={setTenureType}>
                            <SelectTrigger className="h-12 border-gray-200 rounded-lg" data-testid="select-tenure-type">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="years">Years</SelectItem>
                              <SelectItem value="months">Months</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      {/* Advanced Options */}
                      <div className="border-t pt-6 space-y-6">
                        <h3 className="text-lg font-semibold text-gray-900">Advanced Options</h3>
                        
                        {/* Prepayment Option */}
                        <div className="space-y-4">
                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id="enable-prepayment"
                              checked={enablePrepayment}
                              onChange={(e) => setEnablePrepayment(e.target.checked)}
                              className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                            />
                            <label htmlFor="enable-prepayment" className="text-sm font-medium text-gray-700">
                              Enable Prepayment Analysis
                            </label>
                          </div>
                          
                          {enablePrepayment && (
                            <div className="grid grid-cols-2 gap-3 ml-6">
                              <div>
                                <Label htmlFor="prepayment-amount" className="text-sm text-gray-600">
                                  Prepayment Amount
                                </Label>
                                <Input
                                  id="prepayment-amount"
                                  type="number"
                                  value={prepaymentAmount}
                                  onChange={(e) => setPrepaymentAmount(e.target.value)}
                                  className="h-10 text-sm"
                                  placeholder="50000"
                                  min="0"
                                  data-testid="input-prepayment-amount"
                                />
                              </div>
                              <div>
                                <Label htmlFor="prepayment-after" className="text-sm text-gray-600">
                                  After (Months)
                                </Label>
                                <Input
                                  id="prepayment-after"
                                  type="number"
                                  value={prepaymentAfterMonths}
                                  onChange={(e) => setPrepaymentAfterMonths(e.target.value)}
                                  className="h-10 text-sm"
                                  placeholder="12"
                                  min="1"
                                  data-testid="input-prepayment-after"
                                />
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Step-Up EMI Option */}
                        <div className="space-y-4">
                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id="enable-stepup"
                              checked={enableStepUp}
                              onChange={(e) => setEnableStepUp(e.target.checked)}
                              className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                            />
                            <label htmlFor="enable-stepup" className="text-sm font-medium text-gray-700">
                              Enable Step-Up EMI
                            </label>
                          </div>
                          
                          {enableStepUp && (
                            <div className="ml-6">
                              <Label htmlFor="stepup-percentage" className="text-sm text-gray-600">
                                Annual Increase (%)
                              </Label>
                              <Input
                                id="stepup-percentage"
                                type="number"
                                value={stepUpPercentage}
                                onChange={(e) => setStepUpPercentage(e.target.value)}
                                className="h-10 text-sm w-32"
                                placeholder="5"
                                min="1"
                                max="50"
                                data-testid="input-stepup-percentage"
                              />
                              <p className="text-xs text-gray-500 mt-1">
                                EMI increases each year by this percentage
                              </p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="space-y-4 pt-6">
                        <div className="flex gap-4">
                          <Button
                            onClick={calculateEMI}
                            className="flex-1 h-12 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg"
                            data-testid="button-calculate"
                          >
                            <Calculator className="w-4 h-4 mr-2" />
                            Calculate
                          </Button>
                          <Button
                            onClick={resetCalculator}
                            variant="outline"
                            className="h-12 px-8 border-gray-200 text-gray-600 hover:bg-gray-50 font-medium rounded-lg"
                            data-testid="button-reset"
                          >
                            Reset
                          </Button>
                        </div>
                        
                        {/* Advanced Options */}
                        {result && (
                          <div className="flex gap-2">
                            <Button
                              onClick={() => setShowSchedule(!showSchedule)}
                              variant="outline"
                              size="sm"
                              className="text-xs"
                              data-testid="button-show-schedule"
                            >
                              {showSchedule ? 'Hide' : 'Show'} Schedule
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Results Section */}
                    <div className="bg-gray-50 rounded-xl p-8">
                      <h2 className="text-2xl font-semibold text-gray-900 mb-8">Calculation Results</h2>
                      
                      {result ? (
                        <div className="space-y-4" data-testid="emi-results">
                          {/* Monthly EMI */}
                          <div className="bg-white rounded-lg p-4 border-l-4 border-green-500">
                            <div className="flex justify-between items-center">
                              <span className="font-semibold text-gray-700">Monthly EMI</span>
                              <span className="text-2xl font-bold text-green-600" data-testid="text-monthly-emi">
                                {formatCurrency(result.emi)}
                              </span>
                            </div>
                          </div>

                          {/* Payment Summary */}
                          <div className="space-y-3">
                            <div className="flex justify-between">
                              <span className="text-gray-600">Principal Amount</span>
                              <span className="font-semibold" data-testid="text-principal-amount">
                                {formatCurrency(result.principalAmount)}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Total Interest</span>
                              <span className="font-semibold text-red-600" data-testid="text-total-interest">
                                {formatCurrency(result.totalInterest)}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Total Amount Payable</span>
                              <span className="font-semibold" data-testid="text-total-amount">
                                {formatCurrency(result.totalAmount)}
                              </span>
                            </div>
                          </div>

                          {/* Interest Percentage */}
                          <div className="bg-blue-50 rounded-lg p-4 mt-4">
                            <div className="flex justify-between items-center">
                              <span className="text-gray-700">Interest as % of Total Payment</span>
                              <span className="font-bold text-blue-600" data-testid="text-interest-percentage">
                                {result.interestPercentage}%
                              </span>
                            </div>
                          </div>

                          {/* Prepayment Benefits */}
                          {result.prepaymentAnalysis && (
                            <div className="bg-green-50 rounded-lg p-4 border border-green-200 mt-4">
                              <h3 className="font-semibold text-green-800 mb-3">💰 Prepayment Benefits</h3>
                              <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                  <span className="text-green-700">Interest Saved:</span>
                                  <span className="font-semibold text-green-800">
                                    {formatCurrency(result.prepaymentAnalysis.interestSaved)}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-green-700">Time Reduction:</span>
                                  <span className="font-semibold text-green-800">
                                    {result.prepaymentAnalysis.timeReduction} months
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-green-700">New Loan Tenure:</span>
                                  <span className="font-semibold text-green-800">
                                    {result.prepaymentAnalysis.newTenure} months
                                  </span>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Step-Up EMI Benefits */}
                          {result.stepUpAnalysis && (
                            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200 mt-4">
                              <h3 className="font-semibold text-blue-800 mb-3">📈 Step-Up EMI Benefits</h3>
                              <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                  <span className="text-blue-700">Total Interest Saved:</span>
                                  <span className="font-semibold text-blue-800">
                                    {formatCurrency(result.stepUpAnalysis.totalInterestSaved)}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-blue-700">Starting EMI:</span>
                                  <span className="font-semibold text-blue-800">
                                    {formatCurrency(result.emi)}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-blue-700">Final EMI:</span>
                                  <span className="font-semibold text-blue-800">
                                    {formatCurrency(result.stepUpAnalysis.finalEMI)}
                                  </span>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Visual Breakdown */}
                          <div className="mt-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-3">Payment Breakdown</h3>
                            <div className="space-y-2">
                              <div className="flex items-center">
                                <div 
                                  className="h-4 bg-green-500 rounded-l"
                                  style={{ width: `${(result.principalAmount / result.totalAmount) * 100}%` }}
                                ></div>
                                <div 
                                  className="h-4 bg-red-400 rounded-r"
                                  style={{ width: `${(result.totalInterest / result.totalAmount) * 100}%` }}
                                ></div>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span className="flex items-center">
                                  <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                                  Principal ({Math.round((result.principalAmount / result.totalAmount) * 100)}%)
                                </span>
                                <span className="flex items-center">
                                  <div className="w-3 h-3 bg-red-400 rounded-full mr-2"></div>
                                  Interest ({Math.round((result.totalInterest / result.totalAmount) * 100)}%)
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-8" data-testid="no-results">
                          <i className="fas fa-chart-line text-4xl text-gray-400 mb-4"></i>
                          <p className="text-gray-500">Enter loan details to calculate EMI</p>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Amortization Schedule */}
              {result && showSchedule && (
                <Card className="mt-8 bg-white shadow-sm border-0">
                  <CardContent className="p-8">
                    <h3 className="text-2xl font-semibold text-gray-900 mb-6">EMI Schedule (First 5 Years)</h3>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="bg-gray-50">
                            <th className="px-4 py-3 text-left font-medium text-gray-900">Month</th>
                            <th className="px-4 py-3 text-right font-medium text-gray-900">EMI</th>
                            <th className="px-4 py-3 text-right font-medium text-gray-900">Principal</th>
                            <th className="px-4 py-3 text-right font-medium text-gray-900">Interest</th>
                            <th className="px-4 py-3 text-right font-medium text-gray-900">Balance</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {result.amortizationSchedule.map((payment, index) => (
                            <tr key={index} className="hover:bg-gray-50">
                              <td className="px-4 py-3 text-gray-900">{payment.month}</td>
                              <td className="px-4 py-3 text-right text-gray-900">
                                {formatCurrency(payment.emi)}
                              </td>
                              <td className="px-4 py-3 text-right text-green-600 font-medium">
                                {formatCurrency(payment.principal)}
                              </td>
                              <td className="px-4 py-3 text-right text-red-600">
                                {formatCurrency(payment.interest)}
                              </td>
                              <td className="px-4 py-3 text-right text-gray-900 font-medium">
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

              {/* Step-Up EMI Schedule */}
              {result?.stepUpAnalysis?.yearlyEMISchedule && (
                <Card className="mt-8 bg-white shadow-sm border-0">
                  <CardContent className="p-8">
                    <h3 className="text-2xl font-semibold text-gray-900 mb-6">Step-Up EMI Schedule</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {result.stepUpAnalysis.yearlyEMISchedule.map((yearData, index) => (
                        <div key={index} className="bg-blue-50 rounded-lg p-4 text-center">
                          <div className="text-sm text-blue-600 mb-1">Year {yearData.year}</div>
                          <div className="text-lg font-semibold text-blue-800">
                            {formatCurrency(yearData.emi)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Educational Content */}
              <div className="mt-12 space-y-8">
                {/* What is EMI Calculator */}
                <div className="bg-white rounded-2xl shadow-lg p-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-8">What is an EMI Calculator?</h2>
                  <div className="prose max-w-none text-gray-600">
                    <p className="text-lg mb-6 leading-relaxed">
                      An EMI Calculator is a powerful financial tool that helps you calculate your Equated Monthly Installment (EMI) for any type of loan instantly. 
                      Whether you're planning to take a <a href="/tools/home-loan-calculator" className="text-blue-600 hover:text-blue-800 font-medium">home loan</a>, 
                      <a href="/tools/car-loan-calculator" className="text-blue-600 hover:text-blue-800 font-medium"> car loan</a>, 
                      <a href="/tools/education-loan-calculator" className="text-blue-600 hover:text-blue-800 font-medium"> education loan</a>, or 
                      <a href="/tools/business-loan-calculator" className="text-blue-600 hover:text-blue-800 font-medium"> business loan</a>, 
                      our EMI calculator provides accurate monthly payment estimates to help you make informed financial decisions.
                    </p>
                    <p className="mb-6">
                      The EMI calculator uses the mathematical formula to determine your monthly payment amount based on three key factors: 
                      the principal loan amount, annual interest rate, and loan tenure. This online tool eliminates the need for complex manual calculations 
                      and provides instant results with detailed payment breakdowns, helping you understand exactly how much you'll pay each month 
                      and over the entire loan duration.
                    </p>
                  </div>
                </div>

                {/* How EMI Calculator Works */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-8">How Does Our EMI Calculator Work?</h2>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-4">The EMI Formula Explained</h3>
                      <p className="text-gray-600 mb-4">
                        Our EMI calculator uses the standard mathematical formula recognized by financial institutions worldwide:
                      </p>
                      <div className="bg-white rounded-lg p-6 mb-6 border border-blue-200">
                        <p className="font-mono text-center text-xl text-blue-800 font-bold mb-2">
                          EMI = [P × R × (1+R)^N] / [(1+R)^N - 1]
                        </p>
                        <div className="text-sm text-gray-600 space-y-1">
                          <p><strong>P</strong> = Principal loan amount (total amount borrowed)</p>
                          <p><strong>R</strong> = Monthly interest rate (annual rate ÷ 12 ÷ 100)</p>
                          <p><strong>N</strong> = Total number of monthly installments (loan tenure in months)</p>
                        </div>
                      </div>
                      
                      <h3 className="text-xl font-semibold text-gray-900 mb-4">Step-by-Step Calculation Process</h3>
                      <ol className="text-gray-600 space-y-2 list-decimal list-inside">
                        <li>Enter your desired loan amount (principal)</li>
                        <li>Input the annual interest rate offered by your lender</li>
                        <li>Select your preferred loan tenure (in years or months)</li>
                        <li>Click calculate to get instant EMI results</li>
                        <li>Review the detailed breakdown of principal vs interest</li>
                        <li>Analyze the total amount payable over the loan duration</li>
                      </ol>
                    </div>
                    
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-4">Advanced Features</h3>
                      <div className="space-y-4">
                        <div className="bg-white rounded-lg p-4 border border-blue-200">
                          <h4 className="font-semibold text-gray-900 mb-2">
                            <i className="fas fa-chart-line text-blue-600 mr-2"></i>
                            Prepayment Analysis
                          </h4>
                          <p className="text-gray-600 text-sm">
                            Calculate how prepayments can reduce your interest burden and loan tenure. 
                            See exactly how much you can save by making additional payments.
                          </p>
                        </div>
                        <div className="bg-white rounded-lg p-4 border border-blue-200">
                          <h4 className="font-semibold text-gray-900 mb-2">
                            <i className="fas fa-arrow-up text-green-600 mr-2"></i>
                            Step-Up EMI Option
                          </h4>
                          <p className="text-gray-600 text-sm">
                            Perfect for professionals expecting salary increments. Start with lower EMIs 
                            and gradually increase payments to save on total interest.
                          </p>
                        </div>
                        <div className="bg-white rounded-lg p-4 border border-blue-200">
                          <h4 className="font-semibold text-gray-900 mb-2">
                            <i className="fas fa-table text-purple-600 mr-2"></i>
                            Amortization Schedule
                          </h4>
                          <p className="text-gray-600 text-sm">
                            View detailed month-by-month payment breakdown showing how much goes 
                            toward principal and interest for each payment.
                          </p>
                        </div>
                        <div className="bg-white rounded-lg p-4 border border-blue-200">
                          <h4 className="font-semibold text-gray-900 mb-2">
                            <i className="fas fa-globe text-orange-600 mr-2"></i>
                            Multi-Currency Support
                          </h4>
                          <p className="text-gray-600 text-sm">
                            Calculate EMIs in 10+ global currencies including USD, EUR, GBP, INR, 
                            JPY, and more for international loan planning.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Benefits for Different Users */}
                <div className="bg-white rounded-2xl shadow-lg p-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-8">Benefits for Different User Groups</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
                      <div className="flex items-center mb-4">
                        <i className="fas fa-graduation-cap text-2xl text-blue-600 mr-3"></i>
                        <h3 className="text-lg font-semibold text-gray-900">Students & Young Professionals</h3>
                      </div>
                      <ul className="text-gray-600 space-y-2 text-sm">
                        <li>• Plan <a href="/tools/education-loan-calculator" className="text-blue-600 hover:underline">education loan EMIs</a> for college expenses</li>
                        <li>• Calculate first <a href="/tools/car-loan-calculator" className="text-blue-600 hover:underline">car loan payments</a> within budget</li>
                        <li>• Use step-up EMI for growing income expectations</li>
                        <li>• Compare loan offers from different banks</li>
                        <li>• Plan monthly budget with fixed EMI amounts</li>
                        <li>• Understand long-term financial commitments</li>
                      </ul>
                    </div>

                    <div className="bg-green-50 rounded-xl p-6 border border-green-200">
                      <div className="flex items-center mb-4">
                        <i className="fas fa-briefcase text-2xl text-green-600 mr-3"></i>
                        <h3 className="text-lg font-semibold text-gray-900">Working Professionals</h3>
                      </div>
                      <ul className="text-gray-600 space-y-2 text-sm">
                        <li>• Calculate <a href="/tools/home-loan-calculator" className="text-blue-600 hover:underline">home loan EMIs</a> for property purchase</li>
                        <li>• Plan personal loan EMIs for major expenses</li>
                        <li>• Analyze prepayment benefits for existing loans</li>
                        <li>• Compare fixed vs floating rate options</li>
                        <li>• Optimize loan tenure based on income</li>
                        <li>• Plan multiple loan EMIs simultaneously</li>
                      </ul>
                    </div>

                    <div className="bg-purple-50 rounded-xl p-6 border border-purple-200">
                      <div className="flex items-center mb-4">
                        <i className="fas fa-building text-2xl text-purple-600 mr-3"></i>
                        <h3 className="text-lg font-semibold text-gray-900">Business Owners</h3>
                      </div>
                      <ul className="text-gray-600 space-y-2 text-sm">
                        <li>• Calculate <a href="/tools/business-loan-calculator" className="text-blue-600 hover:underline">business loan EMIs</a> for expansion</li>
                        <li>• Plan equipment financing with EMI schedules</li>
                        <li>• Compare working capital loan options</li>
                        <li>• Use <a href="/tools/roi-calculator" className="text-blue-600 hover:underline">ROI calculator</a> alongside EMI planning</li>
                        <li>• Analyze cash flow impact of loan EMIs</li>
                        <li>• Plan multiple business financing options</li>
                      </ul>
                    </div>

                    <div className="bg-orange-50 rounded-xl p-6 border border-orange-200">
                      <div className="flex items-center mb-4">
                        <i className="fas fa-heart text-2xl text-orange-600 mr-3"></i>
                        <h3 className="text-lg font-semibold text-gray-900">Families & Homemakers</h3>
                      </div>
                      <ul className="text-gray-600 space-y-2 text-sm">
                        <li>• Plan family financial goals with EMI budgeting</li>
                        <li>• Calculate joint loan EMIs for home purchase</li>
                        <li>• Compare different loan tenures for affordability</li>
                        <li>• Use <a href="/tools/savings-goal-calculator" className="text-blue-600 hover:underline">savings calculator</a> for down payments</li>
                        <li>• Plan children's education loan requirements</li>
                        <li>• Analyze household budget impact of EMIs</li>
                      </ul>
                    </div>

                    <div className="bg-teal-50 rounded-xl p-6 border border-teal-200">
                      <div className="flex items-center mb-4">
                        <i className="fas fa-chart-pie text-2xl text-teal-600 mr-3"></i>
                        <h3 className="text-lg font-semibold text-gray-900">Investors & Traders</h3>
                      </div>
                      <ul className="text-gray-600 space-y-2 text-sm">
                        <li>• Calculate leverage loan EMIs for investments</li>
                        <li>• Plan real estate investment financing</li>
                        <li>• Compare loan costs vs investment returns</li>
                        <li>• Use <a href="/tools/compound-interest-calculator" className="text-blue-600 hover:underline">compound interest calculator</a> for comparisons</li>
                        <li>• Analyze portfolio leverage strategies</li>
                        <li>• Plan multiple property financing</li>
                      </ul>
                    </div>

                    <div className="bg-red-50 rounded-xl p-6 border border-red-200">
                      <div className="flex items-center mb-4">
                        <i className="fas fa-user-clock text-2xl text-red-600 mr-3"></i>
                        <h3 className="text-lg font-semibold text-gray-900">Senior Citizens</h3>
                      </div>
                      <ul className="text-gray-600 space-y-2 text-sm">
                        <li>• Plan reverse mortgage calculations</li>
                        <li>• Calculate loan against property EMIs</li>
                        <li>• Compare shorter tenure loans for quick payoff</li>
                        <li>• Use <a href="/tools/retirement-calculator" className="text-blue-600 hover:underline">retirement calculator</a> for planning</li>
                        <li>• Analyze pension vs EMI obligations</li>
                        <li>• Plan medical emergency loan EMIs</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Complete Guide to EMI Calculator */}
                <div className="bg-white rounded-2xl shadow-lg p-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-8">Complete Guide to EMI Calculator Benefits</h2>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-4">Why Use an EMI Calculator?</h3>
                      <p className="text-gray-600 mb-6 leading-relaxed">
                        EMI (Equated Monthly Installment) calculation is crucial for financial planning as it determines your monthly loan obligation. 
                        Our advanced EMI calculator helps you understand the exact amount you'll pay each month, making it easier to budget 
                        and compare different loan options from various lenders. This tool is essential for anyone considering any form of financing.
                      </p>
                      
                      <h3 className="text-xl font-semibold text-gray-900 mb-4">Key Benefits of EMI Planning</h3>
                      <ul className="text-gray-600 space-y-3">
                        <li className="flex items-start">
                          <i className="fas fa-check-circle text-green-500 mt-1 mr-3 flex-shrink-0"></i>
                          <span><strong>Accurate Budget Planning:</strong> Know exact monthly payment obligations before taking any loan</span>
                        </li>
                        <li className="flex items-start">
                          <i className="fas fa-check-circle text-green-500 mt-1 mr-3 flex-shrink-0"></i>
                          <span><strong>Loan Comparison:</strong> Compare different loan offers, tenures, and interest rates easily</span>
                        </li>
                        <li className="flex items-start">
                          <i className="fas fa-check-circle text-green-500 mt-1 mr-3 flex-shrink-0"></i>
                          <span><strong>Interest Optimization:</strong> Understand total interest payable and find ways to minimize it</span>
                        </li>
                        <li className="flex items-start">
                          <i className="fas fa-check-circle text-green-500 mt-1 mr-3 flex-shrink-0"></i>
                          <span><strong>Tenure Planning:</strong> Find the optimal balance between EMI amount and loan duration</span>
                        </li>
                        <li className="flex items-start">
                          <i className="fas fa-check-circle text-green-500 mt-1 mr-3 flex-shrink-0"></i>
                          <span><strong>Financial Discipline:</strong> Make informed decisions about loan affordability and repayment capacity</span>
                        </li>
                      </ul>
                    </div>
                    
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-4">Smart EMI Management Strategies</h3>
                      <div className="space-y-4">
                        <div className="bg-blue-50 rounded-lg p-4">
                          <h4 className="font-semibold text-blue-900 mb-2">Optimize Loan Tenure</h4>
                          <p className="text-blue-800 text-sm">
                            Shorter tenure means higher EMI but significantly lower total interest. Use our calculator to find the 
                            sweet spot between affordable monthly payments and total cost minimization.
                          </p>
                        </div>
                        <div className="bg-green-50 rounded-lg p-4">
                          <h4 className="font-semibold text-green-900 mb-2">Prepayment Strategy</h4>
                          <p className="text-green-800 text-sm">
                            Make prepayments when possible to reduce principal and interest burden. Our prepayment analysis 
                            shows exactly how much you can save and how much time you can reduce from your loan tenure.
                          </p>
                        </div>
                        <div className="bg-purple-50 rounded-lg p-4">
                          <h4 className="font-semibold text-purple-900 mb-2">Rate Comparison</h4>
                          <p className="text-purple-800 text-sm">
                            Even a 0.5% difference in interest rate can save thousands over the loan tenure. Use our calculator 
                            to compare offers from multiple lenders and negotiate better rates.
                          </p>
                        </div>
                        <div className="bg-orange-50 rounded-lg p-4">
                          <h4 className="font-semibold text-orange-900 mb-2">Income Ratio Planning</h4>
                          <p className="text-orange-800 text-sm">
                            Financial experts recommend keeping total EMIs below 40-50% of monthly income. This ensures you 
                            have enough funds for other expenses and emergencies.
                          </p>
                        </div>
                      </div>

                      <h3 className="text-xl font-semibold text-gray-900 mb-4 mt-6">Pro Tips for EMI Optimization</h3>
                      <ul className="text-gray-600 space-y-2 text-sm">
                        <li>• Increase EMI by 5-10% annually to reduce tenure significantly</li>
                        <li>• Choose floating rates during high-rate periods if rates are expected to fall</li>
                        <li>• Make prepayments early in the loan tenure for maximum benefit</li>
                        <li>• Consider step-up EMI if you're expecting regular salary increments</li>
                        <li>• Review and negotiate interest rates annually with your lender</li>
                        <li>• Use tax benefits effectively to reduce your overall loan cost</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Use Cases and Applications */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">EMI Calculator Use Cases & Applications</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
                      <i className="fas fa-home text-2xl text-blue-600 mb-4"></i>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">
                        <a href="/tools/home-loan-calculator" className="hover:text-blue-600 transition-colors">Home Loans & Mortgages</a>
                      </h3>
                      <p className="text-gray-600 text-sm mb-3">
                        Calculate monthly payments for housing loans, mortgages, and home equity lines of credit. 
                        Plan your home purchase budget effectively with our specialized <a href="/tools/mortgage-calculator" className="text-blue-600 hover:underline">mortgage calculator</a>.
                      </p>
                      <ul className="text-xs text-gray-500 space-y-1">
                        <li>• Primary residence financing</li>
                        <li>• Investment property loans</li>
                        <li>• Home equity lines of credit</li>
                        <li>• Refinancing calculations</li>
                      </ul>
                    </div>
                    
                    <div className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
                      <i className="fas fa-car text-2xl text-green-600 mb-4"></i>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">
                        <a href="/tools/car-loan-calculator" className="hover:text-green-600 transition-colors">Auto & Vehicle Loans</a>
                      </h3>
                      <p className="text-gray-600 text-sm mb-3">
                        Determine car loan EMIs for new or used vehicles. Compare different loan terms 
                        and down payment scenarios to find the best deal for your vehicle financing needs.
                      </p>
                      <ul className="text-xs text-gray-500 space-y-1">
                        <li>• New car financing</li>
                        <li>• Used vehicle loans</li>
                        <li>• Two-wheeler financing</li>
                        <li>• Commercial vehicle loans</li>
                      </ul>
                    </div>
                    
                    <div className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
                      <i className="fas fa-graduation-cap text-2xl text-purple-600 mb-4"></i>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">
                        <a href="/tools/education-loan-calculator" className="hover:text-purple-600 transition-colors">Education & Student Loans</a>
                      </h3>
                      <p className="text-gray-600 text-sm mb-3">
                        Plan education financing for college, university, or professional courses. 
                        Calculate repayment schedules for student loans with moratorium periods.
                      </p>
                      <ul className="text-xs text-gray-500 space-y-1">
                        <li>• Undergraduate programs</li>
                        <li>• Postgraduate studies</li>
                        <li>• Professional courses</li>
                        <li>• Study abroad financing</li>
                      </ul>
                    </div>
                    
                    <div className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
                      <i className="fas fa-user text-2xl text-orange-600 mb-4"></i>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Personal & Lifestyle Loans</h3>
                      <p className="text-gray-600 text-sm mb-3">
                        Calculate EMIs for personal loans used for weddings, medical expenses, 
                        travel, or debt consolidation purposes. Use our <a href="/tools/debt-payoff-calculator" className="text-blue-600 hover:underline">debt payoff calculator</a> for strategic planning.
                      </p>
                      <ul className="text-xs text-gray-500 space-y-1">
                        <li>• Wedding financing</li>
                        <li>• Medical emergencies</li>
                        <li>• Travel & vacation loans</li>
                        <li>• Debt consolidation</li>
                      </ul>
                    </div>
                    
                    <div className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
                      <i className="fas fa-building text-2xl text-teal-600 mb-4"></i>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">
                        <a href="/tools/business-loan-calculator" className="hover:text-teal-600 transition-colors">Business & Commercial Loans</a>
                      </h3>
                      <p className="text-gray-600 text-sm mb-3">
                        Plan business financing for equipment purchase, working capital, 
                        or business expansion projects. Combine with our <a href="/tools/roi-calculator" className="text-blue-600 hover:underline">ROI calculator</a> for investment analysis.
                      </p>
                      <ul className="text-xs text-gray-500 space-y-1">
                        <li>• Equipment financing</li>
                        <li>• Working capital loans</li>
                        <li>• Business expansion</li>
                        <li>• MSME loans</li>
                      </ul>
                    </div>
                    
                    <div className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
                      <i className="fas fa-credit-card text-2xl text-red-600 mb-4"></i>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">
                        <a href="/tools/credit-card-interest-calculator" className="hover:text-red-600 transition-colors">Credit Card & Consumer Loans</a>
                      </h3>
                      <p className="text-gray-600 text-sm mb-3">
                        Convert credit card outstanding amounts into EMIs. Compare different 
                        conversion options offered by banks and financial institutions.
                      </p>
                      <ul className="text-xs text-gray-500 space-y-1">
                        <li>• Credit card EMI conversion</li>
                        <li>• Consumer durable loans</li>
                        <li>• Electronics financing</li>
                        <li>• Appliance loans</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Related Financial Tools */}
                <div className="bg-white rounded-2xl shadow-lg p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">
                    <i className="fas fa-tools text-blue-600 mr-3"></i>
                    Related Financial Planning Tools
                  </h2>
                  <p className="text-gray-600 mb-6">
                    Maximize your financial planning with our comprehensive suite of calculators designed to work together. 
                    Use these tools alongside the EMI calculator for complete financial analysis and planning.
                  </p>
                  
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    <a href="/tools/loan-calculator" className="group text-center p-4 bg-gray-50 rounded-lg hover:bg-blue-50 transition-colors border border-gray-200 hover:border-blue-300">
                      <i className="fas fa-calculator text-blue-600 text-xl mb-2 group-hover:scale-110 transition-transform"></i>
                      <div className="text-sm font-medium text-gray-900 group-hover:text-blue-800">Loan Calculator</div>
                      <div className="text-xs text-gray-500 mt-1">Basic loan calculations</div>
                    </a>
                    
                    <a href="/tools/home-loan-calculator" className="group text-center p-4 bg-gray-50 rounded-lg hover:bg-blue-50 transition-colors border border-gray-200 hover:border-blue-300">
                      <i className="fas fa-home text-green-600 text-xl mb-2 group-hover:scale-110 transition-transform"></i>
                      <div className="text-sm font-medium text-gray-900 group-hover:text-blue-800">Home Loan</div>
                      <div className="text-xs text-gray-500 mt-1">Specialized home loans</div>
                    </a>
                    
                    <a href="/tools/mortgage-calculator" className="group text-center p-4 bg-gray-50 rounded-lg hover:bg-blue-50 transition-colors border border-gray-200 hover:border-blue-300">
                      <i className="fas fa-house-user text-purple-600 text-xl mb-2 group-hover:scale-110 transition-transform"></i>
                      <div className="text-sm font-medium text-gray-900 group-hover:text-blue-800">Mortgage Calculator</div>
                      <div className="text-xs text-gray-500 mt-1">Mortgage planning</div>
                    </a>
                    
                    <a href="/tools/car-loan-calculator" className="group text-center p-4 bg-gray-50 rounded-lg hover:bg-blue-50 transition-colors border border-gray-200 hover:border-blue-300">
                      <i className="fas fa-car text-red-600 text-xl mb-2 group-hover:scale-110 transition-transform"></i>
                      <div className="text-sm font-medium text-gray-900 group-hover:text-blue-800">Car Loan</div>
                      <div className="text-xs text-gray-500 mt-1">Vehicle financing</div>
                    </a>
                    
                    <a href="/tools/compound-interest-calculator" className="group text-center p-4 bg-gray-50 rounded-lg hover:bg-blue-50 transition-colors border border-gray-200 hover:border-blue-300">
                      <i className="fas fa-chart-line text-green-600 text-xl mb-2 group-hover:scale-110 transition-transform"></i>
                      <div className="text-sm font-medium text-gray-900 group-hover:text-blue-800">Compound Interest</div>
                      <div className="text-xs text-gray-500 mt-1">Investment growth</div>
                    </a>
                    
                    <a href="/tools/simple-interest-calculator" className="group text-center p-4 bg-gray-50 rounded-lg hover:bg-blue-50 transition-colors border border-gray-200 hover:border-blue-300">
                      <i className="fas fa-percentage text-orange-600 text-xl mb-2 group-hover:scale-110 transition-transform"></i>
                      <div className="text-sm font-medium text-gray-900 group-hover:text-blue-800">Simple Interest</div>
                      <div className="text-xs text-gray-500 mt-1">Basic interest calculation</div>
                    </a>
                    
                    <a href="/tools/debt-payoff-calculator" className="group text-center p-4 bg-gray-50 rounded-lg hover:bg-blue-50 transition-colors border border-gray-200 hover:border-blue-300">
                      <i className="fas fa-credit-card text-red-600 text-xl mb-2 group-hover:scale-110 transition-transform"></i>
                      <div className="text-sm font-medium text-gray-900 group-hover:text-blue-800">Debt Payoff</div>
                      <div className="text-xs text-gray-500 mt-1">Debt elimination</div>
                    </a>
                    
                    <a href="/tools/savings-goal-calculator" className="group text-center p-4 bg-gray-50 rounded-lg hover:bg-blue-50 transition-colors border border-gray-200 hover:border-blue-300">
                      <i className="fas fa-piggy-bank text-pink-600 text-xl mb-2 group-hover:scale-110 transition-transform"></i>
                      <div className="text-sm font-medium text-gray-900 group-hover:text-blue-800">Savings Goal</div>
                      <div className="text-xs text-gray-500 mt-1">Goal planning</div>
                    </a>
                    
                    <a href="/tools/roi-calculator" className="group text-center p-4 bg-gray-50 rounded-lg hover:bg-blue-50 transition-colors border border-gray-200 hover:border-blue-300">
                      <i className="fas fa-trending-up text-blue-600 text-xl mb-2 group-hover:scale-110 transition-transform"></i>
                      <div className="text-sm font-medium text-gray-900 group-hover:text-blue-800">ROI Calculator</div>
                      <div className="text-xs text-gray-500 mt-1">Return analysis</div>
                    </a>
                    
                    <a href="/tools/retirement-calculator" className="group text-center p-4 bg-gray-50 rounded-lg hover:bg-blue-50 transition-colors border border-gray-200 hover:border-blue-300">
                      <i className="fas fa-user-clock text-purple-600 text-xl mb-2 group-hover:scale-110 transition-transform"></i>
                      <div className="text-sm font-medium text-gray-900 group-hover:text-blue-800">Retirement</div>
                      <div className="text-xs text-gray-500 mt-1">Retirement planning</div>
                    </a>
                    
                    <a href="/tools/sip-calculator" className="group text-center p-4 bg-gray-50 rounded-lg hover:bg-blue-50 transition-colors border border-gray-200 hover:border-blue-300">
                      <i className="fas fa-coins text-yellow-600 text-xl mb-2 group-hover:scale-110 transition-transform"></i>
                      <div className="text-sm font-medium text-gray-900 group-hover:text-blue-800">SIP Calculator</div>
                      <div className="text-xs text-gray-500 mt-1">Investment planning</div>
                    </a>
                    
                    <a href="/tools/tax-calculator" className="group text-center p-4 bg-gray-50 rounded-lg hover:bg-blue-50 transition-colors border border-gray-200 hover:border-blue-300">
                      <i className="fas fa-receipt text-green-600 text-xl mb-2 group-hover:scale-110 transition-transform"></i>
                      <div className="text-sm font-medium text-gray-900 group-hover:text-blue-800">Tax Calculator</div>
                      <div className="text-xs text-gray-500 mt-1">Tax planning</div>
                    </a>
                  </div>
                  
                  <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <h3 className="font-semibold text-blue-900 mb-2">💡 Pro Tip: Comprehensive Financial Planning</h3>
                    <p className="text-blue-800 text-sm">
                      Use the EMI calculator alongside our <a href="/tools/compound-interest-calculator" className="underline">compound interest calculator</a> 
                      to compare loan costs against investment returns. Combine with the <a href="/tools/savings-goal-calculator" className="underline">savings goal calculator</a> 
                      to plan your down payment, and use the <a href="/tools/debt-payoff-calculator" className="underline">debt payoff calculator</a> 
                      to strategize multiple loan repayments effectively.
                    </p>
                  </div>
                </div>

                {/* Factors Affecting EMI */}
                <div className="bg-white rounded-2xl shadow-lg p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Factors That Affect Your EMI</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Primary Factors</h3>
                      <div className="space-y-4">
                        <div className="border-l-4 border-blue-500 pl-4">
                          <h4 className="font-semibold text-gray-900">Principal Amount</h4>
                          <p className="text-gray-600 text-sm">Higher loan amount = Higher EMI. Consider down payment to reduce principal.</p>
                        </div>
                        <div className="border-l-4 border-green-500 pl-4">
                          <h4 className="font-semibold text-gray-900">Interest Rate</h4>
                          <p className="text-gray-600 text-sm">Lower interest rate = Lower EMI. Shop around for the best rates.</p>
                        </div>
                        <div className="border-l-4 border-purple-500 pl-4">
                          <h4 className="font-semibold text-gray-900">Loan Tenure</h4>
                          <p className="text-gray-600 text-sm">Longer tenure = Lower EMI but higher total interest paid.</p>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Secondary Factors</h3>
                      <div className="space-y-4">
                        <div className="border-l-4 border-orange-500 pl-4">
                          <h4 className="font-semibold text-gray-900">Credit Score</h4>
                          <p className="text-gray-600 text-sm">Higher credit score often qualifies for better interest rates.</p>
                        </div>
                        <div className="border-l-4 border-teal-500 pl-4">
                          <h4 className="font-semibold text-gray-900">Income Level</h4>
                          <p className="text-gray-600 text-sm">Higher income may qualify for larger loan amounts and better terms.</p>
                        </div>
                        <div className="border-l-4 border-red-500 pl-4">
                          <h4 className="font-semibold text-gray-900">Down Payment</h4>
                          <p className="text-gray-600 text-sm">Higher down payment reduces principal amount and monthly EMI.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* EMI vs Other Payment Methods */}
                <div className="bg-gray-50 rounded-2xl p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">EMI vs Other Payment Methods</h2>
                  <div className="overflow-x-auto">
                    <table className="w-full bg-white rounded-lg shadow-sm">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="px-6 py-4 text-left font-semibold text-gray-900">Payment Method</th>
                          <th className="px-6 py-4 text-left font-semibold text-gray-900">Benefits</th>
                          <th className="px-6 py-4 text-left font-semibold text-gray-900">Drawbacks</th>
                          <th className="px-6 py-4 text-left font-semibold text-gray-900">Best For</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        <tr>
                          <td className="px-6 py-4 font-semibold text-blue-600">Fixed EMI</td>
                          <td className="px-6 py-4 text-gray-600">Predictable payments, easy budgeting</td>
                          <td className="px-6 py-4 text-gray-600">No benefit from falling interest rates</td>
                          <td className="px-6 py-4 text-gray-600">Conservative borrowers</td>
                        </tr>
                        <tr>
                          <td className="px-6 py-4 font-semibold text-green-600">Floating EMI</td>
                          <td className="px-6 py-4 text-gray-600">Benefit from rate cuts</td>
                          <td className="px-6 py-4 text-gray-600">EMI can increase with rising rates</td>
                          <td className="px-6 py-4 text-gray-600">Risk-tolerant borrowers</td>
                        </tr>
                        <tr>
                          <td className="px-6 py-4 font-semibold text-purple-600">Step-up EMI</td>
                          <td className="px-6 py-4 text-gray-600">Lower initial payments</td>
                          <td className="px-6 py-4 text-gray-600">Higher payments later</td>
                          <td className="px-6 py-4 text-gray-600">Young professionals</td>
                        </tr>
                        <tr>
                          <td className="px-6 py-4 font-semibold text-orange-600">Balloon Payment</td>
                          <td className="px-6 py-4 text-gray-600">Lower monthly payments</td>
                          <td className="px-6 py-4 text-gray-600">Large final payment</td>
                          <td className="px-6 py-4 text-gray-600">Business loans</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* FAQ Section */}
                <div className="bg-white rounded-2xl shadow-lg p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Frequently Asked Questions</h2>
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">What is the ideal EMI to income ratio?</h3>
                      <p className="text-gray-600">
                        Financial experts recommend that your total EMIs should not exceed 40-50% of your monthly income. 
                        This ensures you have enough money for other expenses and emergencies.
                      </p>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Can I prepay my loan to reduce EMI burden?</h3>
                      <p className="text-gray-600">
                        Yes, most lenders allow prepayments. You can either reduce your EMI amount or loan tenure. 
                        Prepaying early in the loan tenure saves more interest as most of the initial EMIs go towards interest.
                      </p>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">How does credit score affect EMI?</h3>
                      <p className="text-gray-600">
                        While credit score doesn't directly affect EMI calculation, it influences the interest rate you qualify for. 
                        Higher credit scores (750+) typically get lower interest rates, resulting in lower EMIs.
                      </p>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">What happens if I miss an EMI payment?</h3>
                      <p className="text-gray-600">
                        Missing EMI payments can result in late fees, penalty charges, and negative impact on your credit score. 
                        It's important to maintain a buffer for EMI payments and communicate with your lender if facing difficulties.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Currency Information */}
              <div className="mt-8 bg-blue-50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  <i className="fas fa-globe mr-2"></i>
                  Worldwide Currency Support
                </h3>
                <p className="text-gray-600">
                  This EMI calculator supports major global currencies including USD, EUR, GBP, INR, JPY, CAD, AUD, CNY, BRL, and MXN. 
                  The calculations remain accurate regardless of the currency selected, making it perfect for international users and cross-border loans.
                </p>
              </div>
            </div>
          </section>
        </main>
        
        <Footer />
      </div>
    </>
  );
};

export default EMICalculator;