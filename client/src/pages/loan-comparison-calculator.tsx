
import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface LoanOption {
  amount: number;
  rate: number;
  tenure: number;
}

interface LoanResult {
  loanAmount: number;
  interestRate: number;
  tenure: number;
  emi: number;
  totalInterest: number;
  totalAmount: number;
  savingsVsBest?: number;
}

interface ComparisonResults {
  loan1: LoanResult;
  loan2: LoanResult;
  loan3: LoanResult;
  bestLoanIndex: number;
  maxSavings: number;
}

const LoanComparisonCalculator = () => {
  const [loan1, setLoan1] = useState<LoanOption>({
    amount: 500000,
    rate: 8.5,
    tenure: 20 // years
  });

  const [loan2, setLoan2] = useState<LoanOption>({
    amount: 500000,
    rate: 9.0,
    tenure: 20 // years
  });

  const [loan3, setLoan3] = useState<LoanOption>({
    amount: 500000,
    rate: 8.0,
    tenure: 20 // years
  });

  const [comparisonResults, setComparisonResults] = useState<ComparisonResults | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [currency, setCurrency] = useState('INR');

  const calculateLoan = (loan: LoanOption): LoanResult => {
    const { amount, rate, tenure } = loan;
    const monthlyRate = rate / 100 / 12;
    const totalMonths = tenure * 12;
    const emi = (amount * monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) / 
                 (Math.pow(1 + monthlyRate, totalMonths) - 1);
    const totalAmount = emi * totalMonths;
    const totalInterest = totalAmount - amount;

    return {
      loanAmount: amount,
      interestRate: rate,
      tenure: totalMonths,
      emi,
      totalInterest,
      totalAmount
    };
  };

  const performComparison = () => {
    if (!loan1.amount || !loan2.amount || !loan3.amount) {
      return;
    }

    try {
      const result1 = calculateLoan(loan1);
      const result2 = calculateLoan(loan2);
      const result3 = calculateLoan(loan3);
      
      const results = [result1, result2, result3];
      const bestIndex = results.reduce((bestIdx, current, index) => {
        return current.totalAmount < results[bestIdx].totalAmount ? index : bestIdx;
      }, 0);

      const bestTotal = results[bestIndex].totalAmount;
      const maxTotal = Math.max(...results.map(r => r.totalAmount));
      const maxSavings = maxTotal - bestTotal;

      // Add savings comparison to each result
      results.forEach(result => {
        result.savingsVsBest = result.totalAmount - bestTotal;
      });

      setComparisonResults({
        loan1: results[0],
        loan2: results[1],
        loan3: results[2],
        bestLoanIndex: bestIndex,
        maxSavings
      });
    } catch (error) {
      console.error('Error calculating loan comparison:', error);
    }
  };

  const formatCurrency = (amount: number) => {
    const currencySymbols: { [key: string]: string } = {
      'INR': '₹',
      'USD': '$',
      'EUR': '€',
      'GBP': '£',
      'JPY': '¥'
    };

    return new Intl.NumberFormat('en-US', {
      style: 'decimal',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount).replace(/,/g, ',') + ' ' + (currencySymbols[currency] || currency);
  };

  const handleClear = () => {
    setLoan1({ amount: 500000, rate: 8.5, tenure: 20 });
    setLoan2({ amount: 500000, rate: 9.0, tenure: 20 });
    setLoan3({ amount: 500000, rate: 8.0, tenure: 20 });
    setComparisonResults(null);
  };

  const handleSampleData = () => {
    setLoan1({ amount: 1000000, rate: 7.5, tenure: 15 });
    setLoan2({ amount: 1000000, rate: 8.0, tenure: 20 });
    setLoan3({ amount: 1000000, rate: 7.8, tenure: 25 });
  };

  const resetTool = () => {
    handleClear();
    setShowAdvanced(false);
    setCurrency('INR');
  };

  const handleCopyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  // Auto-calculate when inputs change
  useEffect(() => {
    if (loan1.amount && loan2.amount && loan3.amount) {
      performComparison();
    }
  }, [loan1, loan2, loan3]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Helmet>
        <title>Loan Comparison Calculator - Compare Multiple Loan Offers Side-by-Side | DapsiWow</title>
        <meta name="description" content="Free loan comparison calculator to compare up to 3 loan offers simultaneously. Calculate EMI, total interest, and savings to find the best loan deal with detailed analysis and recommendations." />
        <meta name="keywords" content="loan comparison calculator, compare loans, EMI comparison, best loan rates, loan analysis tool, personal loan comparison, home loan comparison, car loan comparison, loan offer analyzer, loan calculator comparison" />
        <meta property="og:title" content="Loan Comparison Calculator - Compare Multiple Loan Offers Side-by-Side | DapsiWow" />
        <meta property="og:description" content="Professional loan comparison calculator for analyzing multiple loan offers with detailed EMI calculations, interest comparisons, and savings analysis to find the best deal." />
        <meta property="og:type" content="website" />
        <meta name="robots" content="index, follow" />
        <meta name="author" content="DapsiWow" />
        <link rel="canonical" href="https://dapsiwow.com/tools/loan-comparison-calculator" />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            "name": "Loan Comparison Calculator",
            "description": "Professional loan comparison calculator for analyzing multiple loan offers with detailed EMI calculations, interest comparisons, and savings analysis to help borrowers find the best loan deal.",
            "url": "https://dapsiwow.com/tools/loan-comparison-calculator",
            "applicationCategory": "FinanceApplication",
            "operatingSystem": "Any",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "USD"
            },
            "featureList": [
              "Compare up to 3 loans simultaneously",
              "Detailed EMI and interest calculations",
              "Savings analysis and recommendations",
              "Multiple currency support",
              "Real-time comparison results"
            ]
          })}
        </script>
      </Helmet>

      <Header />

      <main>
        {/* Hero Section */}
        <section className="relative py-12 sm:py-16 md:py-20 lg:py-24 xl:py-32 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-indigo-600/20"></div>
          <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="space-y-6 sm:space-y-8">
              <div className="inline-flex items-center px-3 sm:px-4 py-1.5 sm:py-2 bg-white/80 backdrop-blur-sm rounded-full border border-blue-200">
                <span className="text-xs sm:text-sm font-medium text-blue-700">Financial Analysis Tool</span>
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl 2xl:text-8xl font-bold text-slate-900 leading-tight tracking-tight" data-testid="page-title">
                <span className="block">Loan Comparison</span>
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 mt-1 sm:mt-2">
                  Calculator
                </span>
              </h1>
              <p className="text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl text-slate-600 max-w-sm sm:max-w-lg md:max-w-2xl lg:max-w-3xl xl:max-w-4xl mx-auto leading-relaxed px-2 sm:px-0">
                Compare multiple loan offers side-by-side to find the best deal with detailed analysis and savings recommendations
              </p>
            </div>
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
          {/* Main Tool Card */}
          <Card className="bg-white/90 backdrop-blur-sm shadow-2xl border-0 rounded-2xl sm:rounded-3xl overflow-hidden">
            <CardContent className="p-0">
              <div className="flex flex-col">
                {/* Input Section */}
                <div className="p-4 sm:p-6 md:p-8 lg:p-10 xl:p-12 space-y-6 sm:space-y-8">
                  <div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">Loan Comparison Tool</h2>
                    <p className="text-gray-600">Enter details for up to 3 loan offers to compare EMI, interest, and total costs</p>
                  </div>

                  {/* Currency Selection */}
                  <div className="space-y-3">
                    <Label htmlFor="currency-select" className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                      Currency
                    </Label>
                    <Select value={currency} onValueChange={setCurrency}>
                      <SelectTrigger className="h-12 sm:h-14 border-2 border-gray-200 rounded-xl text-base sm:text-lg" data-testid="select-currency">
                        <SelectValue placeholder="Select currency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="INR">Indian Rupee (₹)</SelectItem>
                        <SelectItem value="USD">US Dollar ($)</SelectItem>
                        <SelectItem value="EUR">Euro (€)</SelectItem>
                        <SelectItem value="GBP">British Pound (£)</SelectItem>
                        <SelectItem value="JPY">Japanese Yen (¥)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Loan Options Input */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
                    {/* Loan 1 */}
                    <div className="space-y-4 bg-blue-50 rounded-xl p-4 sm:p-6">
                      <h3 className="text-lg sm:text-xl font-bold text-blue-900">Loan Option 1</h3>
                      <div className="space-y-3">
                        <div>
                          <Label htmlFor="loan1-amount" className="text-sm font-semibold text-blue-800 uppercase tracking-wide">
                            Loan Amount
                          </Label>
                          <Input
                            id="loan1-amount"
                            type="number"
                            value={loan1.amount || ''}
                            onChange={(e) => setLoan1(prev => ({ ...prev, amount: Number(e.target.value) }))}
                            className="mt-1 h-12 border-2 border-blue-200 rounded-xl text-base focus:border-blue-500 focus:ring-blue-500"
                            placeholder="Enter loan amount"
                          />
                        </div>
                        <div>
                          <Label htmlFor="loan1-rate" className="text-sm font-semibold text-blue-800 uppercase tracking-wide">
                            Interest Rate (% per annum)
                          </Label>
                          <Input
                            id="loan1-rate"
                            type="number"
                            step="0.1"
                            value={loan1.rate || ''}
                            onChange={(e) => setLoan1(prev => ({ ...prev, rate: Number(e.target.value) }))}
                            className="mt-1 h-12 border-2 border-blue-200 rounded-xl text-base focus:border-blue-500 focus:ring-blue-500"
                            placeholder="Enter interest rate"
                          />
                        </div>
                        <div>
                          <Label htmlFor="loan1-tenure" className="text-sm font-semibold text-blue-800 uppercase tracking-wide">
                            Loan Tenure (Years)
                          </Label>
                          <Input
                            id="loan1-tenure"
                            type="number"
                            value={loan1.tenure || ''}
                            onChange={(e) => setLoan1(prev => ({ ...prev, tenure: Number(e.target.value) }))}
                            className="mt-1 h-12 border-2 border-blue-200 rounded-xl text-base focus:border-blue-500 focus:ring-blue-500"
                            placeholder="Enter tenure in years"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Loan 2 */}
                    <div className="space-y-4 bg-green-50 rounded-xl p-4 sm:p-6">
                      <h3 className="text-lg sm:text-xl font-bold text-green-900">Loan Option 2</h3>
                      <div className="space-y-3">
                        <div>
                          <Label htmlFor="loan2-amount" className="text-sm font-semibold text-green-800 uppercase tracking-wide">
                            Loan Amount
                          </Label>
                          <Input
                            id="loan2-amount"
                            type="number"
                            value={loan2.amount || ''}
                            onChange={(e) => setLoan2(prev => ({ ...prev, amount: Number(e.target.value) }))}
                            className="mt-1 h-12 border-2 border-green-200 rounded-xl text-base focus:border-green-500 focus:ring-green-500"
                            placeholder="Enter loan amount"
                          />
                        </div>
                        <div>
                          <Label htmlFor="loan2-rate" className="text-sm font-semibold text-green-800 uppercase tracking-wide">
                            Interest Rate (% per annum)
                          </Label>
                          <Input
                            id="loan2-rate"
                            type="number"
                            step="0.1"
                            value={loan2.rate || ''}
                            onChange={(e) => setLoan2(prev => ({ ...prev, rate: Number(e.target.value) }))}
                            className="mt-1 h-12 border-2 border-green-200 rounded-xl text-base focus:border-green-500 focus:ring-green-500"
                            placeholder="Enter interest rate"
                          />
                        </div>
                        <div>
                          <Label htmlFor="loan2-tenure" className="text-sm font-semibold text-green-800 uppercase tracking-wide">
                            Loan Tenure (Years)
                          </Label>
                          <Input
                            id="loan2-tenure"
                            type="number"
                            value={loan2.tenure || ''}
                            onChange={(e) => setLoan2(prev => ({ ...prev, tenure: Number(e.target.value) }))}
                            className="mt-1 h-12 border-2 border-green-200 rounded-xl text-base focus:border-green-500 focus:ring-green-500"
                            placeholder="Enter tenure in years"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Loan 3 */}
                    <div className="space-y-4 bg-purple-50 rounded-xl p-4 sm:p-6">
                      <h3 className="text-lg sm:text-xl font-bold text-purple-900">Loan Option 3</h3>
                      <div className="space-y-3">
                        <div>
                          <Label htmlFor="loan3-amount" className="text-sm font-semibold text-purple-800 uppercase tracking-wide">
                            Loan Amount
                          </Label>
                          <Input
                            id="loan3-amount"
                            type="number"
                            value={loan3.amount || ''}
                            onChange={(e) => setLoan3(prev => ({ ...prev, amount: Number(e.target.value) }))}
                            className="mt-1 h-12 border-2 border-purple-200 rounded-xl text-base focus:border-purple-500 focus:ring-purple-500"
                            placeholder="Enter loan amount"
                          />
                        </div>
                        <div>
                          <Label htmlFor="loan3-rate" className="text-sm font-semibold text-purple-800 uppercase tracking-wide">
                            Interest Rate (% per annum)
                          </Label>
                          <Input
                            id="loan3-rate"
                            type="number"
                            step="0.1"
                            value={loan3.rate || ''}
                            onChange={(e) => setLoan3(prev => ({ ...prev, rate: Number(e.target.value) }))}
                            className="mt-1 h-12 border-2 border-purple-200 rounded-xl text-base focus:border-purple-500 focus:ring-purple-500"
                            placeholder="Enter interest rate"
                          />
                        </div>
                        <div>
                          <Label htmlFor="loan3-tenure" className="text-sm font-semibold text-purple-800 uppercase tracking-wide">
                            Loan Tenure (Years)
                          </Label>
                          <Input
                            id="loan3-tenure"
                            type="number"
                            value={loan3.tenure || ''}
                            onChange={(e) => setLoan3(prev => ({ ...prev, tenure: Number(e.target.value) }))}
                            className="mt-1 h-12 border-2 border-purple-200 rounded-xl text-base focus:border-purple-500 focus:ring-purple-500"
                            placeholder="Enter tenure in years"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Advanced Options */}
                  <div className="space-y-4 sm:space-y-6 border-t pt-6 sm:pt-8">
                    <h3 className="text-lg sm:text-xl font-bold text-gray-900">Analysis Options</h3>
                    
                    <Collapsible open={showAdvanced} onOpenChange={setShowAdvanced}>
                      <CollapsibleTrigger asChild>
                        <Button 
                          variant="ghost" 
                          className="w-full justify-between text-sm sm:text-base py-3 sm:py-4 h-auto"
                          data-testid="button-toggle-advanced"
                        >
                          <span className="flex items-center">
                            Advanced Comparison Settings
                          </span>
                          <span className={`transform transition-transform ${showAdvanced ? 'rotate-180' : ''}`}>▼</span>
                        </Button>
                      </CollapsibleTrigger>
                      <CollapsibleContent className="space-y-4 sm:space-y-6 mt-4">
                        <Separator />
                        
                        <div className="bg-gray-50 rounded-xl p-4 sm:p-6">
                          <h4 className="text-sm sm:text-base font-semibold text-gray-900 mb-4">Comparison Features</h4>
                          <div className="space-y-3 text-sm text-gray-600">
                            <div>• Automatic calculation of monthly EMI for all loan options</div>
                            <div>• Total interest payable over the entire loan tenure</div>
                            <div>• Total amount payable including principal and interest</div>
                            <div>• Savings analysis compared to the most expensive option</div>
                            <div>• Best loan recommendation based on lowest total cost</div>
                            <div>• Real-time updates as you modify loan parameters</div>
                          </div>
                        </div>
                        
                        <Separator />
                      </CollapsibleContent>
                    </Collapsible>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4 sm:pt-6">
                    <Button
                      onClick={performComparison}
                      disabled={!loan1.amount || !loan2.amount || !loan3.amount}
                      className="flex-1 h-12 sm:h-14 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold text-base sm:text-lg rounded-xl shadow-lg transform transition-all duration-200 hover:scale-105"
                      data-testid="button-compare"
                    >
                      Compare Loans
                    </Button>
                    <Button
                      onClick={handleSampleData}
                      variant="outline"
                      className="h-12 sm:h-14 px-6 sm:px-8 border-2 border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold text-base sm:text-lg rounded-xl"
                      data-testid="button-sample-data"
                    >
                      Sample
                    </Button>
                    <Button
                      onClick={resetTool}
                      variant="outline"
                      className="h-12 sm:h-14 px-6 sm:px-8 border-2 border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold text-base sm:text-lg rounded-xl"
                      data-testid="button-reset"
                    >
                      Reset
                    </Button>
                  </div>
                </div>

                {/* Results Section */}
                {comparisonResults && (
                  <div className="bg-gradient-to-br from-gray-50 to-blue-50 p-4 sm:p-6 md:p-8 lg:p-10 xl:p-12 border-t">
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6 sm:mb-8">Comparison Results</h2>

                    <div className="space-y-6 sm:space-y-8" data-testid="comparison-results">
                      {/* Summary Cards */}
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
                        {[comparisonResults.loan1, comparisonResults.loan2, comparisonResults.loan3].map((result, index) => (
                          <div 
                            key={index}
                            className={`rounded-xl p-4 sm:p-6 border-2 ${
                              index === comparisonResults.bestLoanIndex 
                                ? 'bg-green-50 border-green-200' 
                                : 'bg-white border-gray-200'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-3">
                              <h3 className={`text-lg font-bold ${
                                index === 0 ? 'text-blue-900' :
                                index === 1 ? 'text-green-900' : 'text-purple-900'
                              }`}>
                                Loan Option {index + 1}
                              </h3>
                              {index === comparisonResults.bestLoanIndex && (
                                <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-bold">
                                  BEST DEAL
                                </span>
                              )}
                            </div>
                            
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span className="text-gray-600">Monthly EMI:</span>
                                <span className="font-semibold">{formatCurrency(result.emi)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Total Interest:</span>
                                <span className="font-semibold text-red-600">{formatCurrency(result.totalInterest)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Total Amount:</span>
                                <span className="font-bold text-lg">{formatCurrency(result.totalAmount)}</span>
                              </div>
                              {result.savingsVsBest !== undefined && result.savingsVsBest > 0 && (
                                <div className="flex justify-between text-orange-600">
                                  <span>Extra cost vs best:</span>
                                  <span className="font-semibold">+{formatCurrency(result.savingsVsBest)}</span>
                                </div>
                              )}
                            </div>
                            
                            <Button
                              onClick={() => {
                                const resultText = `Loan Option ${index + 1} - EMI: ${formatCurrency(result.emi)}, Total: ${formatCurrency(result.totalAmount)}`;
                                handleCopyToClipboard(resultText);
                              }}
                              variant="outline"
                              size="sm"
                              className="w-full mt-3 rounded-lg"
                            >
                              Copy Details
                            </Button>
                          </div>
                        ))}
                      </div>

                      {/* Detailed Comparison Table */}
                      <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-200 overflow-x-auto">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">Detailed Comparison</h3>
                        <table className="w-full text-sm">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-4 py-3 text-left font-semibold text-gray-900">Parameter</th>
                              <th className="px-4 py-3 text-center font-semibold text-blue-700">Option 1</th>
                              <th className="px-4 py-3 text-center font-semibold text-green-700">Option 2</th>
                              <th className="px-4 py-3 text-center font-semibold text-purple-700">Option 3</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200">
                            <tr>
                              <td className="px-4 py-3 font-medium">Loan Amount</td>
                              <td className="px-4 py-3 text-center">{formatCurrency(comparisonResults.loan1.loanAmount)}</td>
                              <td className="px-4 py-3 text-center">{formatCurrency(comparisonResults.loan2.loanAmount)}</td>
                              <td className="px-4 py-3 text-center">{formatCurrency(comparisonResults.loan3.loanAmount)}</td>
                            </tr>
                            <tr className="bg-gray-50">
                              <td className="px-4 py-3 font-medium">Interest Rate</td>
                              <td className="px-4 py-3 text-center">{comparisonResults.loan1.interestRate}%</td>
                              <td className="px-4 py-3 text-center">{comparisonResults.loan2.interestRate}%</td>
                              <td className="px-4 py-3 text-center">{comparisonResults.loan3.interestRate}%</td>
                            </tr>
                            <tr>
                              <td className="px-4 py-3 font-medium">Tenure</td>
                              <td className="px-4 py-3 text-center">{comparisonResults.loan1.tenure / 12} years</td>
                              <td className="px-4 py-3 text-center">{comparisonResults.loan2.tenure / 12} years</td>
                              <td className="px-4 py-3 text-center">{comparisonResults.loan3.tenure / 12} years</td>
                            </tr>
                            <tr className="bg-blue-50 font-semibold">
                              <td className="px-4 py-3 font-bold">Monthly EMI</td>
                              <td className={`px-4 py-3 text-center ${comparisonResults.bestLoanIndex === 0 ? 'text-green-600 font-bold' : ''}`}>
                                {formatCurrency(comparisonResults.loan1.emi)}
                              </td>
                              <td className={`px-4 py-3 text-center ${comparisonResults.bestLoanIndex === 1 ? 'text-green-600 font-bold' : ''}`}>
                                {formatCurrency(comparisonResults.loan2.emi)}
                              </td>
                              <td className={`px-4 py-3 text-center ${comparisonResults.bestLoanIndex === 2 ? 'text-green-600 font-bold' : ''}`}>
                                {formatCurrency(comparisonResults.loan3.emi)}
                              </td>
                            </tr>
                            <tr className="bg-gray-50">
                              <td className="px-4 py-3 font-medium">Total Interest</td>
                              <td className="px-4 py-3 text-center text-red-600">{formatCurrency(comparisonResults.loan1.totalInterest)}</td>
                              <td className="px-4 py-3 text-center text-red-600">{formatCurrency(comparisonResults.loan2.totalInterest)}</td>
                              <td className="px-4 py-3 text-center text-red-600">{formatCurrency(comparisonResults.loan3.totalInterest)}</td>
                            </tr>
                            <tr className="bg-yellow-50 font-semibold text-lg">
                              <td className="px-4 py-3 font-bold">Total Amount</td>
                              <td className={`px-4 py-3 text-center ${comparisonResults.bestLoanIndex === 0 ? 'text-green-600 font-bold' : ''}`}>
                                {formatCurrency(comparisonResults.loan1.totalAmount)}
                              </td>
                              <td className={`px-4 py-3 text-center ${comparisonResults.bestLoanIndex === 1 ? 'text-green-600 font-bold' : ''}`}>
                                {formatCurrency(comparisonResults.loan2.totalAmount)}
                              </td>
                              <td className={`px-4 py-3 text-center ${comparisonResults.bestLoanIndex === 2 ? 'text-green-600 font-bold' : ''}`}>
                                {formatCurrency(comparisonResults.loan3.totalAmount)}
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>

                      {/* Recommendation Banner */}
                      <div className="bg-green-50 border-l-4 border-green-400 p-4 sm:p-6 rounded-lg">
                        <h3 className="text-lg font-bold text-green-900 mb-2">Our Recommendation</h3>
                        <p className="text-green-800">
                          <strong>Loan Option {comparisonResults.bestLoanIndex + 1}</strong> offers the best deal with the lowest total cost of{' '}
                          <strong>{formatCurrency([comparisonResults.loan1, comparisonResults.loan2, comparisonResults.loan3][comparisonResults.bestLoanIndex].totalAmount)}</strong>.
                          {comparisonResults.maxSavings > 0 && (
                            <> You could save up to <strong>{formatCurrency(comparisonResults.maxSavings)}</strong> compared to the most expensive option.</>
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* SEO Content Sections */}
          <div className="mt-16 space-y-8">
            {/* What is a Loan Comparison Calculator */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">What is a Loan Comparison Calculator?</h2>
                <div className="space-y-4 text-gray-600">
                  <p>
                    A <strong>loan comparison calculator</strong> is an advanced financial analysis tool designed to help borrowers evaluate multiple loan offers simultaneously and identify the most cost-effective financing option. This comprehensive calculator enables users to compare key loan parameters including monthly EMI payments, total interest costs, loan tenure impacts, and overall financial burden across different lenders and loan products.
                  </p>
                  <p>
                    Our professional loan comparison tool provides detailed side-by-side analysis of up to three loan options, automatically calculating monthly installments using industry-standard EMI formulas, total interest payable over the loan term, and cumulative repayment amounts. The calculator supports multiple currencies and provides instant recommendations based on the lowest total cost of borrowing, helping users make informed financial decisions.
                  </p>
                  <p>
                    Whether you're comparing personal loans, home mortgages, car financing, business loans, or education funding options, this calculator eliminates the complexity of manual calculations and provides clear, actionable insights to help you choose the best loan offer that aligns with your financial goals and budget constraints.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* How Loan Comparison Works */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">How Loan Comparison Analysis Works</h2>
                <p className="text-gray-600 mb-8">Understanding the methodology behind loan comparison helps you make more informed borrowing decisions and optimize your financing strategy for maximum savings and affordability.</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div className="bg-blue-50 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-blue-900 mb-3">EMI Calculation Process</h3>
                      <p className="text-blue-800 text-sm mb-4">
                        The calculator uses the standard EMI formula: EMI = P × r × (1+r)^n ÷ ((1+r)^n - 1), where P is the principal amount, r is the monthly interest rate, and n is the number of monthly installments. This ensures accurate calculations for all loan comparisons.
                      </p>
                      <div className="bg-blue-100 p-3 rounded-lg">
                        <h4 className="font-medium text-blue-900 mb-2">Calculation Steps:</h4>
                        <div className="text-xs text-blue-800">
                          <div>1. Convert annual interest rate to monthly rate</div>
                          <div>2. Calculate total number of monthly payments</div>
                          <div>3. Apply EMI formula for precise monthly amount</div>
                          <div>4. Compute total interest and payable amount</div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-green-50 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-green-900 mb-3">Savings Analysis Methodology</h3>
                      <p className="text-green-800 text-sm mb-4">
                        Our tool identifies the loan option with the lowest total cost and calculates potential savings compared to other offers. This analysis includes both absolute savings amounts and percentage differences to provide complete financial perspective.
                      </p>
                      <div className="bg-green-100 p-3 rounded-lg">
                        <h4 className="font-medium text-green-900 mb-2">Analysis Features:</h4>
                        <div className="text-xs text-green-800">
                          <div>• Best loan recommendation based on total cost</div>
                          <div>• Savings calculation vs most expensive option</div>
                          <div>• Monthly EMI comparison across all loans</div>
                          <div>• Interest burden analysis and optimization</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="bg-purple-50 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-purple-900 mb-3">Multi-Parameter Comparison</h3>
                      <p className="text-purple-800 text-sm mb-4">
                        The calculator evaluates multiple loan parameters simultaneously, including loan amount flexibility, interest rate variations, tenure options, and their combined impact on affordability and total cost of borrowing.
                      </p>
                      <div className="bg-purple-100 p-3 rounded-lg">
                        <h4 className="font-medium text-purple-900 mb-2">Comparison Parameters:</h4>
                        <div className="text-xs text-purple-800">
                          <div>• Principal amount and loan-to-value ratios</div>
                          <div>• Interest rate differences and their impact</div>
                          <div>• Tenure variations and payment schedules</div>
                          <div>• Total cost analysis and affordability metrics</div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-orange-50 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-orange-900 mb-3">Decision Support Features</h3>
                      <p className="text-orange-800 text-sm mb-4">
                        Beyond basic calculations, the tool provides intelligent recommendations, highlights the most cost-effective option, and presents data in easy-to-understand formats that facilitate quick decision-making for borrowers.
                      </p>
                      <div className="bg-orange-100 p-3 rounded-lg">
                        <h4 className="font-medium text-orange-900 mb-2">Support Tools:</h4>
                        <div className="text-xs text-orange-800">
                          <div>• Automated best deal identification</div>
                          <div>• Visual comparison tables and summaries</div>
                          <div>• Instant results with real-time updates</div>
                          <div>• Multi-currency support for global users</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Professional Applications and Use Cases */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
                <CardContent className="p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Who Benefits from Loan Comparison Tools?</h2>
                  <p className="text-gray-600 mb-6">Loan comparison calculators serve diverse user groups across personal and professional contexts, providing essential financial analysis capabilities for informed borrowing decisions.</p>
                  
                  <div className="space-y-4">
                    <div className="bg-blue-50 rounded-lg p-4">
                      <h3 className="font-semibold text-blue-900 mb-2">Individual Borrowers & Families</h3>
                      <p className="text-blue-800 text-sm">Compare personal loans, home mortgages, car financing, and education loans to find the most affordable options that fit within family budgets and long-term financial planning goals.</p>
                    </div>
                    
                    <div className="bg-green-50 rounded-lg p-4">
                      <h3 className="font-semibold text-green-900 mb-2">Financial Advisors & Planners</h3>
                      <p className="text-green-800 text-sm">Provide clients with detailed loan analysis, demonstrate cost differences between lenders, and support evidence-based recommendations for optimal financing strategies and debt management.</p>
                    </div>
                    
                    <div className="bg-purple-50 rounded-lg p-4">
                      <h3 className="font-semibold text-purple-900 mb-2">Business Owners & Entrepreneurs</h3>
                      <p className="text-purple-800 text-sm">Evaluate business loan options, equipment financing, working capital loans, and commercial real estate mortgages to optimize cash flow and minimize borrowing costs for business growth.</p>
                    </div>
                    
                    <div className="bg-orange-50 rounded-lg p-4">
                      <h3 className="font-semibold text-orange-900 mb-2">Real Estate Professionals</h3>
                      <p className="text-orange-800 text-sm">Help clients compare mortgage options from multiple lenders, analyze different loan terms and down payment scenarios, and facilitate informed home buying and investment decisions.</p>
                    </div>

                    <div className="bg-teal-50 rounded-lg p-4">
                      <h3 className="font-semibold text-teal-900 mb-2">Students & Education Planners</h3>
                      <p className="text-teal-800 text-sm">Compare education loan offers for domestic and international studies, evaluate different repayment options, and choose funding solutions that minimize long-term debt burden for academic pursuits.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
                <CardContent className="p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Key Features & Analysis Capabilities</h2>
                  <p className="text-gray-600 mb-6">Our comprehensive loan comparison calculator offers professional-grade analysis tools designed for accuracy, efficiency, and user-friendly financial decision-making support.</p>
                  
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                        <span className="text-white text-xs font-bold">✓</span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-1">Simultaneous Multi-Loan Analysis</h4>
                        <p className="text-gray-600 text-sm">Compare up to three loan options side-by-side with instant calculations, real-time updates, and comprehensive parameter analysis for thorough evaluation of all financing alternatives.</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                        <span className="text-white text-xs font-bold">✓</span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-1">Accurate EMI & Interest Calculations</h4>
                        <p className="text-gray-600 text-sm">Industry-standard calculation formulas ensure precise monthly EMI amounts, total interest computations, and comprehensive cost analysis for reliable financial planning and budgeting.</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                        <span className="text-white text-xs font-bold">✓</span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-1">Intelligent Savings Analysis</h4>
                        <p className="text-gray-600 text-sm">Automatic identification of the most cost-effective loan option with detailed savings calculations, percentage differences, and clear recommendations for optimal borrowing decisions.</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                        <span className="text-white text-xs font-bold">✓</span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-1">Multi-Currency Global Support</h4>
                        <p className="text-gray-600 text-sm">Support for major international currencies including INR, USD, EUR, GBP, and JPY with accurate formatting and localized number display for worldwide accessibility.</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-teal-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                        <span className="text-white text-xs font-bold">✓</span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-1">Professional Results Presentation</h4>
                        <p className="text-gray-600 text-sm">Clean, organized comparison tables, summary cards, and detailed analysis reports with copy functionality for easy sharing and documentation of loan comparison results.</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Loan Comparison Strategies */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Strategic Loan Comparison & Selection Guidelines</h2>
                <p className="text-gray-600 mb-8">Implementing effective loan comparison strategies helps borrowers optimize their financing decisions, minimize costs, and choose loan products that align with long-term financial objectives and cash flow requirements.</p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900">Interest Rate Analysis</h3>
                    <div className="space-y-3">
                      <div className="bg-blue-50 border-l-4 border-blue-400 p-3 rounded-r-lg">
                        <h4 className="font-semibold text-blue-900 text-sm">Fixed vs Variable Rates</h4>
                        <p className="text-blue-800 text-xs mt-1">Compare the predictability of fixed rates against potential savings from variable rates, considering market trends and your risk tolerance for interest rate fluctuations.</p>
                      </div>
                      <div className="bg-indigo-50 border-l-4 border-indigo-400 p-3 rounded-r-lg">
                        <h4 className="font-semibold text-indigo-900 text-sm">Rate Comparison Methodology</h4>
                        <p className="text-indigo-800 text-xs mt-1">Focus on Annual Percentage Rate (APR) rather than just interest rates, as APR includes additional fees and provides a more accurate cost comparison between lenders.</p>
                      </div>
                      <div className="bg-cyan-50 border-l-4 border-cyan-400 p-3 rounded-r-lg">
                        <h4 className="font-semibold text-cyan-900 text-sm">Long-term Rate Impact</h4>
                        <p className="text-cyan-800 text-xs mt-1">Even small differences in interest rates can result in significant savings over time, making thorough rate comparison essential for long-term loans like mortgages.</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900">Tenure & Payment Optimization</h3>
                    <div className="space-y-3">
                      <div className="bg-green-50 border-l-4 border-green-400 p-3 rounded-r-lg">
                        <h4 className="font-semibold text-green-900 text-sm">Tenure Impact Analysis</h4>
                        <p className="text-green-800 text-xs mt-1">Shorter tenures reduce total interest costs but increase monthly EMIs, while longer tenures offer lower EMIs but higher total costs. Balance affordability with cost efficiency.</p>
                      </div>
                      <div className="bg-emerald-50 border-l-4 border-emerald-400 p-3 rounded-r-lg">
                        <h4 className="font-semibold text-emerald-900 text-sm">EMI-to-Income Ratio</h4>
                        <p className="text-emerald-800 text-xs mt-1">Maintain EMI payments below 40% of your monthly income to ensure comfortable repayment and financial stability throughout the loan term.</p>
                      </div>
                      <div className="bg-teal-50 border-l-4 border-teal-400 p-3 rounded-r-lg">
                        <h4 className="font-semibold text-teal-900 text-sm">Prepayment Flexibility</h4>
                        <p className="text-teal-800 text-xs mt-1">Choose loans that allow prepayment without penalties, enabling you to reduce interest burden when you have surplus funds available for early repayment.</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900">Comprehensive Cost Evaluation</h3>
                    <div className="space-y-3">
                      <div className="bg-orange-50 border-l-4 border-orange-400 p-3 rounded-r-lg">
                        <h4 className="font-semibold text-orange-900 text-sm">Hidden Fees Assessment</h4>
                        <p className="text-orange-800 text-xs mt-1">Include processing fees, documentation charges, insurance premiums, and other associated costs in your comparison to get the true total cost of borrowing.</p>
                      </div>
                      <div className="bg-red-50 border-l-4 border-red-400 p-3 rounded-r-lg">
                        <h4 className="font-semibold text-red-900 text-sm">Total Cost Priority</h4>
                        <p className="text-red-800 text-xs mt-1">Focus on the total amount payable over the loan term rather than just monthly EMI, as this represents the true cost of your borrowing decision.</p>
                      </div>
                      <div className="bg-pink-50 border-l-4 border-pink-400 p-3 rounded-r-lg">
                        <h4 className="font-semibold text-pink-900 text-sm">Lender Reputation Factor</h4>
                        <p className="text-pink-800 text-xs mt-1">Consider lender reputation, customer service quality, processing speed, and loan servicing capabilities alongside cost factors for a comprehensive evaluation.</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-8 bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Professional Loan Comparison Best Practices</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium text-gray-800 mb-2">Pre-Comparison Preparation</h4>
                      <p className="text-gray-600 text-sm">Gather accurate loan offers from multiple lenders with consistent terms, verify all fees and charges, and ensure you're comparing similar loan products with equivalent features and benefits.</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-800 mb-2">Decision Criteria Framework</h4>
                      <p className="text-gray-600 text-sm">Establish clear decision criteria including maximum acceptable EMI, preferred loan tenure, total cost thresholds, and lender preferences before beginning the comparison process.</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-800 mb-2">Documentation & Record Keeping</h4>
                      <p className="text-gray-600 text-sm">Document your comparison results, save loan offer details, and maintain records of your analysis process for future reference and potential re-evaluation of financing options.</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-800 mb-2">Regular Review Strategy</h4>
                      <p className="text-gray-600 text-sm">Periodically review your chosen loan against current market offers, especially for long-term loans, to identify refinancing opportunities that could reduce your borrowing costs.</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Industry Applications and Advanced Use Cases */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Industry Applications & Advanced Loan Comparison Scenarios</h2>
                <p className="text-gray-600 mb-8">Loan comparison tools serve specialized applications across various industries and professional contexts, enabling sophisticated financial analysis for complex borrowing scenarios and strategic financial planning initiatives.</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="bg-blue-50 rounded-lg p-6">
                    <h3 className="font-semibold text-blue-900 mb-4">Banking & Financial Services</h3>
                    <ul className="text-blue-800 text-sm space-y-2">
                      <li>• Client advisory services and loan consultations</li>
                      <li>• Product comparison for internal loan portfolios</li>
                      <li>• Competitive analysis against market offerings</li>
                      <li>• Risk assessment and pricing strategy development</li>
                      <li>• Customer education and financial literacy programs</li>
                      <li>• Loan restructuring and refinancing analysis</li>
                    </ul>
                  </div>

                  <div className="bg-green-50 rounded-lg p-6">
                    <h3 className="font-semibold text-green-900 mb-4">Real Estate & Property Development</h3>
                    <ul className="text-green-800 text-sm space-y-2">
                      <li>• Investment property financing comparisons</li>
                      <li>• Construction loan vs permanent financing analysis</li>
                      <li>• Multi-property portfolio financing strategies</li>
                      <li>• Commercial real estate loan evaluations</li>
                      <li>• Bridge loan vs traditional financing options</li>
                      <li>• Developer financing and project funding analysis</li>
                    </ul>
                  </div>

                  <div className="bg-purple-50 rounded-lg p-6">
                    <h3 className="font-semibold text-purple-900 mb-4">Corporate Finance & Business Planning</h3>
                    <ul className="text-purple-800 text-sm space-y-2">
                      <li>• Working capital loan optimization strategies</li>
                      <li>• Equipment financing vs leasing comparisons</li>
                      <li>• Business expansion funding evaluations</li>
                      <li>• Cash flow impact analysis for loan decisions</li>
                      <li>• Debt consolidation and restructuring planning</li>
                      <li>• Capital expenditure financing alternatives</li>
                    </ul>
                  </div>

                  <div className="bg-orange-50 rounded-lg p-6">
                    <h3 className="font-semibold text-orange-900 mb-4">Educational & Academic Institutions</h3>
                    <ul className="text-orange-800 text-sm space-y-2">
                      <li>• Student loan counseling and guidance programs</li>
                      <li>• International education financing comparisons</li>
                      <li>• Professional development loan evaluations</li>
                      <li>• Parent loan vs student loan analysis</li>
                      <li>• Graduate school funding optimization</li>
                      <li>• Career-specific loan program comparisons</li>
                    </ul>
                  </div>

                  <div className="bg-teal-50 rounded-lg p-6">
                    <h3 className="font-semibold text-teal-900 mb-4">Healthcare & Medical Practice</h3>
                    <ul className="text-teal-800 text-sm space-y-2">
                      <li>• Medical equipment financing evaluations</li>
                      <li>• Practice acquisition loan comparisons</li>
                      <li>• Healthcare facility expansion funding</li>
                      <li>• Medical education loan optimization</li>
                      <li>• Specialty practice startup financing</li>
                      <li>• Healthcare technology investment analysis</li>
                    </ul>
                  </div>

                  <div className="bg-red-50 rounded-lg p-6">
                    <h3 className="font-semibold text-red-900 mb-4">Automotive & Transportation</h3>
                    <ul className="text-red-800 text-sm space-y-2">
                      <li>• Fleet financing optimization strategies</li>
                      <li>• Commercial vehicle loan comparisons</li>
                      <li>• Lease vs purchase financing analysis</li>
                      <li>• Transportation business loan evaluations</li>
                      <li>• Equipment upgrade financing options</li>
                      <li>• Logistics expansion funding comparisons</li>
                    </ul>
                  </div>
                </div>

                <div className="mt-8 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Advanced Analysis Techniques & Professional Insights</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium text-gray-800 mb-3">Scenario-Based Analysis</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-start gap-2">
                          <div className="w-2 h-2 bg-indigo-500 rounded-full mt-2 flex-shrink-0"></div>
                          <span className="text-gray-700">Multi-scenario comparison with varying interest rate assumptions</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <div className="w-2 h-2 bg-indigo-500 rounded-full mt-2 flex-shrink-0"></div>
                          <span className="text-gray-700">Stress testing loan affordability under different income scenarios</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <div className="w-2 h-2 bg-indigo-500 rounded-full mt-2 flex-shrink-0"></div>
                          <span className="text-gray-700">Prepayment impact analysis and optimization strategies</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <div className="w-2 h-2 bg-indigo-500 rounded-full mt-2 flex-shrink-0"></div>
                          <span className="text-gray-700">Economic cycle impact on variable rate loan performance</span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-800 mb-3">Strategic Financial Planning Integration</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-start gap-2">
                          <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                          <span className="text-gray-700">Integration with overall financial planning and investment goals</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                          <span className="text-gray-700">Tax implications analysis for different loan structures</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                          <span className="text-gray-700">Cash flow optimization through strategic loan timing</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                          <span className="text-gray-700">Risk management through diversified lending relationships</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Frequently Asked Questions */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-8">Frequently Asked Questions</h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">How accurate are the loan comparison calculations?</h3>
                      <p className="text-gray-600 text-sm">
                        Our calculator uses industry-standard EMI formulas and provides highly accurate results for comparison purposes. However, final loan terms may vary based on lender-specific policies, credit assessment, and additional fees not included in basic calculations.
                      </p>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Can I compare different types of loans together?</h3>
                      <p className="text-gray-600 text-sm">
                        While technically possible, it's recommended to compare similar loan types (personal loans with personal loans, mortgages with mortgages) as different loan categories have varying risk profiles, interest rates, and terms that affect meaningful comparison.
                      </p>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">What factors should I prioritize when comparing loans?</h3>
                      <p className="text-gray-600 text-sm">
                        Focus on total cost of borrowing (total amount payable), monthly EMI affordability within your budget, loan tenure that aligns with your financial goals, and lender reputation for service quality and processing efficiency.
                      </p>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">How often should I compare loan offers in the market?</h3>
                      <p className="text-gray-600 text-sm">
                        For new loans, compare offers from 3-5 lenders before deciding. For existing loans, review market rates annually or when there are significant interest rate changes to identify refinancing opportunities that could reduce costs.
                      </p>
                    </div>
                  </div>
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Does the calculator include all loan-related fees?</h3>
                      <p className="text-gray-600 text-sm">
                        The basic calculator focuses on principal, interest, and tenure. For comprehensive comparison, manually add processing fees, insurance premiums, documentation charges, and other lender-specific costs to get the complete picture.
                      </p>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Can I use this for business loan comparisons?</h3>
                      <p className="text-gray-600 text-sm">
                        Yes, the calculator works for business loans, but consider additional factors like collateral requirements, personal guarantees, debt service coverage ratios, and business cash flow patterns when making final decisions.
                      </p>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">What's the difference between fixed and variable rate comparison?</h3>
                      <p className="text-gray-600 text-sm">
                        Fixed rates provide predictable calculations and stable EMIs throughout the loan term. Variable rates require scenario analysis with different rate assumptions, as EMIs will change based on market interest rate movements.
                      </p>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">How do I account for prepayment in loan comparison?</h3>
                      <p className="text-gray-600 text-sm">
                        Choose loans with flexible prepayment options without penalties. Consider your potential for extra payments and calculate how prepayment could reduce total interest for each loan option to make a more informed comparison.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Technical Specifications */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Technical Specifications & Calculation Methodology</h2>
                <p className="text-gray-600 mb-8">Our loan comparison calculator employs industry-standard financial formulas and modern web technologies to ensure accurate calculations, reliable performance, and seamless user experience across all devices and platforms.</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">Calculation Engine Specifications</h3>
                    <div className="space-y-4">
                      <div className="bg-blue-50 rounded-lg p-4">
                        <h4 className="font-semibold text-blue-900 mb-2">EMI Formula Implementation</h4>
                        <ul className="text-blue-800 text-sm space-y-1">
                          <li>• Standard EMI calculation: P × r × (1+r)^n ÷ ((1+r)^n - 1)</li>
                          <li>• High-precision floating-point arithmetic</li>
                          <li>• Automatic compound frequency adjustments</li>
                          <li>• Error handling for edge cases and invalid inputs</li>
                        </ul>
                      </div>
                      <div className="bg-orange-50 rounded-lg p-4">
                        <h4 className="font-semibold text-orange-900 mb-2">Comparison Algorithm Features</h4>
                        <ul className="text-orange-800 text-sm space-y-1">
                          <li>• Multi-parameter simultaneous analysis</li>
                          <li>• Best option identification algorithms</li>
                          <li>• Savings calculation and optimization</li>
                          <li>• Real-time result updates and validation</li>
                        </ul>
                      </div>
                      <div className="bg-purple-50 rounded-lg p-4">
                        <h4 className="font-semibold text-purple-900 mb-2">Currency & Localization</h4>
                        <ul className="text-purple-800 text-sm space-y-1">
                          <li>• Multi-currency support (INR, USD, EUR, GBP, JPY)</li>
                          <li>• Localized number formatting and display</li>
                          <li>• Currency symbol and decimal handling</li>
                          <li>• International accessibility compliance</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">Platform & Browser Compatibility</h3>
                    <div className="space-y-4">
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h4 className="font-semibold text-gray-900 mb-2">Supported Browsers</h4>
                        <ul className="text-gray-700 text-sm space-y-1">
                          <li>• Chrome 90+ (optimal performance and features)</li>
                          <li>• Firefox 88+ (full compatibility and calculations)</li>
                          <li>• Safari 14+ (complete feature support)</li>
                          <li>• Edge 90+ (comprehensive functionality)</li>
                        </ul>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h4 className="font-semibold text-gray-900 mb-2">Mobile & Tablet Support</h4>
                        <ul className="text-gray-700 text-sm space-y-1">
                          <li>• iOS Safari 14+ (responsive touch interface)</li>
                          <li>• Android Chrome 90+ (optimized for mobile)</li>
                          <li>• Samsung Internet 13+ (enhanced compatibility)</li>
                          <li>• Responsive design for all screen sizes</li>
                        </ul>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h4 className="font-semibold text-gray-900 mb-2">Performance & Security</h4>
                        <ul className="text-gray-700 text-sm space-y-1">
                          <li>• Client-side processing (no data transmission)</li>
                          <li>• Instant calculations with real-time updates</li>
                          <li>• Privacy-focused design (no data storage)</li>
                          <li>• WCAG 2.1 AA accessibility compliance</li>
                        </ul>
                      </div>
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
};

export default LoanComparisonCalculator;
