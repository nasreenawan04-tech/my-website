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
}

const EMICalculator = () => {
  const [loanAmount, setLoanAmount] = useState('');
  const [interestRate, setInterestRate] = useState('');
  const [loanTenure, setLoanTenure] = useState('');
  const [tenureType, setTenureType] = useState('years');
  const [currency, setCurrency] = useState('USD');
  const [result, setResult] = useState<EMIResult | null>(null);

  const calculateEMI = () => {
    const principal = parseFloat(loanAmount);
    const rate = parseFloat(interestRate) / 100 / 12; // Monthly interest rate
    const tenure = tenureType === 'years' ? parseFloat(loanTenure) * 12 : parseFloat(loanTenure);

    if (principal && rate && tenure) {
      // EMI calculation using the standard formula
      // EMI = [P x R x (1+R)^N] / [(1+R)^N - 1]
      const emi = (principal * rate * Math.pow(1 + rate, tenure)) / (Math.pow(1 + rate, tenure) - 1);
      const totalAmount = emi * tenure;
      const totalInterest = totalAmount - principal;
      const interestPercentage = (totalInterest / totalAmount) * 100;

      setResult({
        emi: Math.round(emi * 100) / 100,
        totalAmount: Math.round(totalAmount * 100) / 100,
        totalInterest: Math.round(totalInterest * 100) / 100,
        principalAmount: principal,
        interestAmount: Math.round(totalInterest * 100) / 100,
        interestPercentage: Math.round(interestPercentage * 100) / 100
      });
    }
  };

  const resetCalculator = () => {
    setLoanAmount('');
    setInterestRate('');
    setLoanTenure('');
    setTenureType('years');
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

                      {/* Action Buttons */}
                      <div className="flex gap-4 pt-6">
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

              {/* Educational Content */}
              <div className="mt-12 space-y-8">
                {/* Understanding EMI */}
                <div className="bg-white rounded-2xl shadow-lg p-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-8">Complete Guide to EMI Calculator</h2>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-4">What is EMI?</h3>
                      <p className="text-gray-600 mb-6 leading-relaxed">
                        EMI (Equated Monthly Installment) is a fixed payment amount made by a borrower to a lender at a specified date each month. 
                        It comprises both principal and interest components, making it easier for borrowers to plan their monthly finances. 
                        EMIs are commonly used for home loans, car loans, personal loans, and other types of financing.
                      </p>
                      
                      <h3 className="text-xl font-semibold text-gray-900 mb-4">How EMI Calculation Works</h3>
                      <p className="text-gray-600 mb-4">
                        The EMI calculation uses a mathematical formula that considers three key factors:
                      </p>
                      <div className="bg-blue-50 rounded-lg p-4 mb-4">
                        <p className="font-mono text-center text-lg text-blue-800 font-semibold">
                          EMI = [P × R × (1+R)^N] / [(1+R)^N - 1]
                        </p>
                      </div>
                      <ul className="text-gray-600 space-y-2">
                        <li><strong>P</strong> = Principal loan amount (the total borrowed amount)</li>
                        <li><strong>R</strong> = Monthly interest rate (annual rate ÷ 12)</li>
                        <li><strong>N</strong> = Number of monthly installments (loan tenure in months)</li>
                      </ul>
                    </div>
                    
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-4">Benefits of Using EMI Calculator</h3>
                      <ul className="text-gray-600 space-y-3">
                        <li className="flex items-start">
                          <i className="fas fa-check-circle text-green-500 mt-1 mr-3"></i>
                          <span><strong>Budget Planning:</strong> Know exact monthly payment obligations in advance</span>
                        </li>
                        <li className="flex items-start">
                          <i className="fas fa-check-circle text-green-500 mt-1 mr-3"></i>
                          <span><strong>Loan Comparison:</strong> Compare different loan offers and terms easily</span>
                        </li>
                        <li className="flex items-start">
                          <i className="fas fa-check-circle text-green-500 mt-1 mr-3"></i>
                          <span><strong>Interest Savings:</strong> Understand total interest payable over loan tenure</span>
                        </li>
                        <li className="flex items-start">
                          <i className="fas fa-check-circle text-green-500 mt-1 mr-3"></i>
                          <span><strong>Tenure Optimization:</strong> Find the right balance between EMI amount and loan duration</span>
                        </li>
                        <li className="flex items-start">
                          <i className="fas fa-check-circle text-green-500 mt-1 mr-3"></i>
                          <span><strong>Financial Planning:</strong> Make informed decisions about loan affordability</span>
                        </li>
                      </ul>

                      <h3 className="text-xl font-semibold text-gray-900 mb-4 mt-6">Smart EMI Management Tips</h3>
                      <ul className="text-gray-600 space-y-2">
                        <li>• Choose optimal loan tenure - shorter tenure = higher EMI but lower total interest</li>
                        <li>• Make prepayments when possible to reduce principal and interest burden</li>
                        <li>• Compare interest rates from multiple lenders before deciding</li>
                        <li>• Ensure your EMI doesn't exceed 40-50% of your monthly income</li>
                        <li>• Consider fixed vs. floating interest rates based on market conditions</li>
                        <li>• Review and negotiate interest rates periodically</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Use Cases and Applications */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">EMI Calculator Use Cases</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="bg-white rounded-lg p-6 shadow-sm">
                      <i className="fas fa-home text-2xl text-blue-600 mb-4"></i>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Home Loans</h3>
                      <p className="text-gray-600 text-sm">
                        Calculate monthly payments for housing loans, mortgages, and home equity lines of credit. 
                        Plan your home purchase budget effectively.
                      </p>
                    </div>
                    
                    <div className="bg-white rounded-lg p-6 shadow-sm">
                      <i className="fas fa-car text-2xl text-green-600 mb-4"></i>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Auto Loans</h3>
                      <p className="text-gray-600 text-sm">
                        Determine car loan EMIs for new or used vehicles. Compare different loan terms 
                        and down payment scenarios to find the best deal.
                      </p>
                    </div>
                    
                    <div className="bg-white rounded-lg p-6 shadow-sm">
                      <i className="fas fa-graduation-cap text-2xl text-purple-600 mb-4"></i>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Education Loans</h3>
                      <p className="text-gray-600 text-sm">
                        Plan education financing for college, university, or professional courses. 
                        Calculate repayment schedules for student loans.
                      </p>
                    </div>
                    
                    <div className="bg-white rounded-lg p-6 shadow-sm">
                      <i className="fas fa-user text-2xl text-orange-600 mb-4"></i>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Personal Loans</h3>
                      <p className="text-gray-600 text-sm">
                        Calculate EMIs for personal loans used for weddings, medical expenses, 
                        travel, or debt consolidation purposes.
                      </p>
                    </div>
                    
                    <div className="bg-white rounded-lg p-6 shadow-sm">
                      <i className="fas fa-building text-2xl text-teal-600 mb-4"></i>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Business Loans</h3>
                      <p className="text-gray-600 text-sm">
                        Plan business financing for equipment purchase, working capital, 
                        or business expansion projects.
                      </p>
                    </div>
                    
                    <div className="bg-white rounded-lg p-6 shadow-sm">
                      <i className="fas fa-credit-card text-2xl text-red-600 mb-4"></i>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Credit Card Loans</h3>
                      <p className="text-gray-600 text-sm">
                        Convert credit card outstanding amounts into EMIs. Compare different 
                        conversion options offered by banks.
                      </p>
                    </div>
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