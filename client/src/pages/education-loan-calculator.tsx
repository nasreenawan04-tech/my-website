
import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calculator } from 'lucide-react';

interface EducationLoanResult {
  emi: number;
  totalAmount: number;
  totalInterest: number;
  principalAmount: number;
  interestPercentage: number;
  graceMonths: number;
  totalPaymentPeriod: number;
}

const EducationLoanCalculator = () => {
  const [loanAmount, setLoanAmount] = useState('');
  const [interestRate, setInterestRate] = useState('');
  const [courseDuration, setCourseDuration] = useState('');
  const [gracePeriod, setGracePeriod] = useState('6');
  const [repaymentTenure, setRepaymentTenure] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [result, setResult] = useState<EducationLoanResult | null>(null);

  const calculateEducationLoan = () => {
    const principal = parseFloat(loanAmount);
    const rate = parseFloat(interestRate) / 100 / 12; // Monthly interest rate
    const courseMonths = parseFloat(courseDuration) * 12;
    const graceMonths = parseFloat(gracePeriod);
    const repaymentMonths = parseFloat(repaymentTenure) * 12;

    if (principal && rate && courseMonths && repaymentMonths) {
      // Calculate interest during course period
      const interestDuringCourse = principal * (parseFloat(interestRate) / 100) * (courseMonths / 12);
      
      // Total amount after course completion (including grace period interest)
      const totalAfterCourse = principal + interestDuringCourse;
      const graceInterest = totalAfterCourse * (parseFloat(interestRate) / 100) * (graceMonths / 12);
      const finalPrincipal = totalAfterCourse + graceInterest;
      
      // EMI calculation for repayment period
      const emi = (finalPrincipal * rate * Math.pow(1 + rate, repaymentMonths)) / (Math.pow(1 + rate, repaymentMonths) - 1);
      const totalAmount = emi * repaymentMonths;
      const totalInterest = totalAmount - principal;
      const interestPercentage = (totalInterest / totalAmount) * 100;
      const totalPaymentPeriod = courseMonths + graceMonths + repaymentMonths;

      setResult({
        emi: Math.round(emi * 100) / 100,
        totalAmount: Math.round(totalAmount * 100) / 100,
        totalInterest: Math.round(totalInterest * 100) / 100,
        principalAmount: principal,
        interestPercentage: Math.round(interestPercentage * 100) / 100,
        graceMonths: graceMonths,
        totalPaymentPeriod: Math.round(totalPaymentPeriod)
      });
    }
  };

  const resetCalculator = () => {
    setLoanAmount('');
    setInterestRate('');
    setCourseDuration('');
    setGracePeriod('6');
    setRepaymentTenure('');
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
        <title>Education Loan Calculator - Student Loan EMI Calculator | ToolsHub</title>
        <meta name="description" content="Calculate education loan EMI, total interest, and repayment schedule for student loans. Free online education loan calculator with grace period support." />
        <meta name="keywords" content="education loan calculator, student loan calculator, education loan EMI, student loan EMI, college loan calculator, university loan calculator" />
        <meta property="og:title" content="Education Loan Calculator - Student Loan EMI Calculator | ToolsHub" />
        <meta property="og:description" content="Calculate education loan EMI, total interest, and repayment schedule for student loans. Free online education loan calculator with grace period support." />
        <meta property="og:type" content="website" />
        <link rel="canonical" href="/tools/education-loan-calculator" />
      </Helmet>

      <div className="min-h-screen flex flex-col" data-testid="page-education-loan-calculator">
        <Header />
        
        <main className="flex-1 bg-neutral-50">
          {/* Hero Section */}
          <section className="gradient-hero text-white py-16">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <div className="w-20 h-20 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <i className="fas fa-graduation-cap text-3xl"></i>
              </div>
              <h1 className="text-4xl sm:text-5xl font-bold mb-6" data-testid="text-page-title">
                Education Loan Calculator
              </h1>
              <p className="text-xl text-blue-100 max-w-2xl mx-auto">
                Calculate student loan EMI with grace period, course duration, and repayment schedule for education financing
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
                      <h2 className="text-2xl font-semibold text-gray-900 mb-8">Education Loan Details</h2>
                      
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
                          Total Loan Amount
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
                          max="30"
                          step="0.01"
                          data-testid="input-interest-rate"
                        />
                      </div>

                      {/* Course Duration */}
                      <div className="space-y-3">
                        <Label htmlFor="course-duration" className="text-sm font-medium text-gray-700">
                          Course Duration (Years)
                        </Label>
                        <Input
                          id="course-duration"
                          type="number"
                          value={courseDuration}
                          onChange={(e) => setCourseDuration(e.target.value)}
                          className="h-12 text-base border-gray-200 rounded-lg"
                          placeholder="Enter course duration"
                          min="0.5"
                          max="10"
                          step="0.5"
                          data-testid="input-course-duration"
                        />
                      </div>

                      {/* Grace Period */}
                      <div className="space-y-3">
                        <Label htmlFor="grace-period" className="text-sm font-medium text-gray-700">
                          Grace Period (Months)
                        </Label>
                        <Select value={gracePeriod} onValueChange={setGracePeriod}>
                          <SelectTrigger className="h-12 border-gray-200 rounded-lg" data-testid="select-grace-period">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="0">0 months</SelectItem>
                            <SelectItem value="3">3 months</SelectItem>
                            <SelectItem value="6">6 months</SelectItem>
                            <SelectItem value="9">9 months</SelectItem>
                            <SelectItem value="12">12 months</SelectItem>
                          </SelectContent>
                        </Select>
                        <p className="text-xs text-gray-500">Period after course completion before EMI starts</p>
                      </div>

                      {/* Repayment Tenure */}
                      <div className="space-y-3">
                        <Label htmlFor="repayment-tenure" className="text-sm font-medium text-gray-700">
                          Repayment Tenure (Years)
                        </Label>
                        <Input
                          id="repayment-tenure"
                          type="number"
                          value={repaymentTenure}
                          onChange={(e) => setRepaymentTenure(e.target.value)}
                          className="h-12 text-base border-gray-200 rounded-lg"
                          placeholder="Enter repayment tenure"
                          min="1"
                          max="30"
                          step="1"
                          data-testid="input-repayment-tenure"
                        />
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-4 pt-6">
                        <Button
                          onClick={calculateEducationLoan}
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
                        <div className="space-y-4" data-testid="education-loan-results">
                          {/* Monthly EMI */}
                          <div className="bg-white rounded-lg p-4 border-l-4 border-green-500">
                            <div className="flex justify-between items-center">
                              <span className="font-semibold text-gray-700">Monthly EMI</span>
                              <span className="text-2xl font-bold text-green-600" data-testid="text-monthly-emi">
                                {formatCurrency(result.emi)}
                              </span>
                            </div>
                          </div>

                          {/* Loan Summary */}
                          <div className="space-y-3">
                            <div className="flex justify-between">
                              <span className="text-gray-600">Principal Loan Amount</span>
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

                          {/* Timeline Information */}
                          <div className="bg-blue-50 rounded-lg p-4 space-y-2">
                            <div className="flex justify-between">
                              <span className="text-gray-600">Grace Period</span>
                              <span className="font-semibold text-blue-600">{result.graceMonths} months</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Total Payment Period</span>
                              <span className="font-semibold text-blue-600">{Math.round(result.totalPaymentPeriod / 12)} years</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Interest as % of Total</span>
                              <span className="font-semibold text-blue-600">{result.interestPercentage}%</span>
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
                          <i className="fas fa-graduation-cap text-4xl text-gray-400 mb-4"></i>
                          <p className="text-gray-500">Enter education loan details to calculate EMI</p>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Educational Content */}
              <div className="mt-12 space-y-8">
                {/* What is Education Loan Calculator - Main SEO Section */}
                <div className="bg-white rounded-2xl shadow-lg p-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-8">What is an Education Loan Calculator?</h2>
                  <div className="prose max-w-none text-gray-700 space-y-6">
                    <p className="text-lg leading-relaxed">
                      An education loan calculator is a sophisticated financial tool that helps students, parents, and education financing professionals calculate the exact monthly EMI (Equated Monthly Installment), total interest cost, and repayment schedule for student loans. Our advanced education loan calculator considers unique aspects of student financing including course duration, grace periods, and moratorium benefits that make education loans different from standard <a href="/tools/loan-calculator" className="text-blue-600 hover:text-blue-700 font-medium">personal loans</a>.
                    </p>
                    <p className="leading-relaxed">
                      Unlike a basic <a href="/tools/emi-calculator" className="text-blue-600 hover:text-blue-700 font-medium">EMI calculator</a>, our education loan calculator specifically accounts for the interest that accumulates during your study period and any grace period after course completion. This comprehensive approach gives you accurate projections for planning your education financing, whether you're pursuing undergraduate studies, postgraduate programs, or professional courses domestically or abroad.
                    </p>
                    <p className="leading-relaxed">
                      The calculator supports multiple currencies and provides detailed breakdowns including principal amount, total interest payable, monthly EMI amount, and visual payment distribution charts. This makes it an essential tool for comparing different education loan offers and planning your academic investment alongside other financial tools like our <a href="/tools/retirement-calculator" className="text-blue-600 hover:text-blue-700 font-medium">retirement planning calculator</a> for long-term financial health.
                    </p>
                  </div>
                </div>

                {/* How Education Loan Calculator Works */}
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl shadow-lg p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-8">How Our Education Loan Calculator Works</h2>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-4">Step-by-Step Calculation Process</h3>
                      <div className="space-y-4">
                        <div className="bg-white rounded-lg p-4 shadow-sm">
                          <div className="flex items-start space-x-3">
                            <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">1</div>
                            <div>
                              <h4 className="font-semibold text-gray-900">Interest During Study Period</h4>
                              <p className="text-gray-600 text-sm">Calculates simple interest accumulation during course duration</p>
                            </div>
                          </div>
                        </div>
                        <div className="bg-white rounded-lg p-4 shadow-sm">
                          <div className="flex items-start space-x-3">
                            <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">2</div>
                            <div>
                              <h4 className="font-semibold text-gray-900">Grace Period Interest</h4>
                              <p className="text-gray-600 text-sm">Adds interest for moratorium period after course completion</p>
                            </div>
                          </div>
                        </div>
                        <div className="bg-white rounded-lg p-4 shadow-sm">
                          <div className="flex items-start space-x-3">
                            <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">3</div>
                            <div>
                              <h4 className="font-semibold text-gray-900">EMI Calculation</h4>
                              <p className="text-gray-600 text-sm">Computes monthly installments using compound interest formula</p>
                            </div>
                          </div>
                        </div>
                        <div className="bg-white rounded-lg p-4 shadow-sm">
                          <div className="flex items-start space-x-3">
                            <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">4</div>
                            <div>
                              <h4 className="font-semibold text-gray-900">Total Cost Analysis</h4>
                              <p className="text-gray-600 text-sm">Provides comprehensive breakdown of total education financing cost</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-4">Education Loan Formula</h3>
                      <div className="bg-white rounded-lg p-6 shadow-sm mb-4">
                        <div className="text-center mb-4">
                          <div className="bg-gray-50 p-4 rounded-lg font-mono text-sm mb-4">
                            EMI = P × [r(1+r)^n] / [(1+r)^n - 1]
                          </div>
                          <div className="text-xs text-gray-600 space-y-1">
                            <div><strong>EMI</strong> = Monthly Payment Amount</div>
                            <div><strong>P</strong> = Principal + Accumulated Interest</div>
                            <div><strong>r</strong> = Monthly Interest Rate</div>
                            <div><strong>n</strong> = Repayment Tenure in Months</div>
                          </div>
                        </div>
                      </div>
                      
                      <h3 className="text-xl font-semibold text-gray-900 mb-4">Key Differences from Regular Loans</h3>
                      <ul className="text-gray-600 space-y-2">
                        <li>• <strong>Moratorium Period:</strong> No repayment during studies</li>
                        <li>• <strong>Grace Period:</strong> Additional 6-12 months after course</li>
                        <li>• <strong>Interest Accumulation:</strong> Simple interest during course, compound during repayment</li>
                        <li>• <strong>Tax Benefits:</strong> Interest deduction under Section 80E (India) or similar provisions</li>
                        <li>• <strong>Flexible Terms:</strong> Customized for educational purposes</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Benefits for Different Audiences */}
                <div className="bg-white rounded-2xl shadow-lg p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-8">Education Loan Calculator Benefits for Every User</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Students */}
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6">
                      <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mb-4">
                        <i className="fas fa-user-graduate text-white text-xl"></i>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">For Students</h3>
                      <ul className="text-gray-700 text-sm space-y-2">
                        <li>• Plan education financing before course admission</li>
                        <li>• Compare loan offers from different banks and NBFCs</li>
                        <li>• Understand total cost of education including interest</li>
                        <li>• Make informed decisions about course selection based on ROI</li>
                        <li>• Plan part-time work to reduce loan burden</li>
                        <li>• Estimate post-graduation salary requirements</li>
                      </ul>
                      <div className="mt-4 text-xs text-blue-700">
                        <strong>Pro Tip:</strong> Use with our <a href="/tools/salary-to-hourly-calculator" className="underline hover:text-blue-800">salary calculator</a> to plan future earnings
                      </div>
                    </div>

                    {/* Parents & Guardians */}
                    <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6">
                      <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center mb-4">
                        <i className="fas fa-users text-white text-xl"></i>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">For Parents & Guardians</h3>
                      <ul className="text-gray-700 text-sm space-y-2">
                        <li>• Budget family finances for child's education</li>
                        <li>• Plan education savings alongside loan requirements</li>
                        <li>• Compare domestic vs international education costs</li>
                        <li>• Understand co-signer obligations and EMI impacts</li>
                        <li>• Plan retirement savings considering education expenses</li>
                        <li>• Optimize tax benefits from education loan interest</li>
                      </ul>
                      <div className="mt-4 text-xs text-green-700">
                        <strong>Pro Tip:</strong> Combine with our <a href="/tools/investment-return-calculator" className="underline hover:text-green-800">investment calculator</a> for education planning
                      </div>
                    </div>

                    {/* Financial Advisors */}
                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6">
                      <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center mb-4">
                        <i className="fas fa-chart-line text-white text-xl"></i>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">For Financial Advisors</h3>
                      <ul className="text-gray-700 text-sm space-y-2">
                        <li>• Provide accurate loan projections to clients</li>
                        <li>• Compare multiple education loan scenarios</li>
                        <li>• Integrate education planning with comprehensive financial plans</li>
                        <li>• Demonstrate loan optimization strategies</li>
                        <li>• Support clients in loan restructuring decisions</li>
                        <li>• Create education funding roadmaps</li>
                      </ul>
                      <div className="mt-4 text-xs text-purple-700">
                        <strong>Pro Tip:</strong> Use with our <a href="/tools/net-worth-calculator" className="underline hover:text-purple-800">net worth calculator</a> for holistic planning
                      </div>
                    </div>

                    {/* Working Professionals */}
                    <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-6">
                      <div className="w-12 h-12 bg-orange-600 rounded-lg flex items-center justify-center mb-4">
                        <i className="fas fa-briefcase text-white text-xl"></i>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">For Working Professionals</h3>
                      <ul className="text-gray-700 text-sm space-y-2">
                        <li>• Plan MBA or professional course financing</li>
                        <li>• Evaluate career switch education investments</li>
                        <li>• Balance current EMIs with education loan EMIs</li>
                        <li>• Optimize loan tenure based on career growth projections</li>
                        <li>• Plan skill development course financing</li>
                        <li>• Calculate opportunity cost of education breaks</li>
                      </ul>
                      <div className="mt-4 text-xs text-orange-700">
                        <strong>Pro Tip:</strong> Compare with our <a href="/tools/business-loan-calculator" className="underline hover:text-orange-800">business loan calculator</a> for entrepreneurship
                      </div>
                    </div>

                    {/* Education Institutions */}
                    <div className="bg-gradient-to-br from-teal-50 to-teal-100 rounded-xl p-6">
                      <div className="w-12 h-12 bg-teal-600 rounded-lg flex items-center justify-center mb-4">
                        <i className="fas fa-university text-white text-xl"></i>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">For Education Institutions</h3>
                      <ul className="text-gray-700 text-sm space-y-2">
                        <li>• Help students understand financing options</li>
                        <li>• Provide fee payment planning assistance</li>
                        <li>• Support financial aid counseling services</li>
                        <li>• Assist in scholarship and loan combination planning</li>
                        <li>• Enable informed course selection decisions</li>
                        <li>• Support international student financing guidance</li>
                      </ul>
                      <div className="mt-4 text-xs text-teal-700">
                        <strong>Integration:</strong> Ideal for student counseling with our <a href="/tools/compound-interest-calculator" className="underline hover:text-teal-800">compound interest tool</a>
                      </div>
                    </div>

                    {/* Bank & NBFC Officials */}
                    <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-6">
                      <div className="w-12 h-12 bg-red-600 rounded-lg flex items-center justify-center mb-4">
                        <i className="fas fa-landmark text-white text-xl"></i>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">For Lenders & Banks</h3>
                      <ul className="text-gray-700 text-sm space-y-2">
                        <li>• Provide instant loan calculations to customers</li>
                        <li>• Support loan origination and pre-approval processes</li>
                        <li>• Demonstrate competitive loan terms and benefits</li>
                        <li>• Assist in loan restructuring and modification</li>
                        <li>• Support customer education and financial literacy</li>
                        <li>• Enable quick loan comparison and scenario analysis</li>
                      </ul>
                      <div className="mt-4 text-xs text-red-700">
                        <strong>Integration:</strong> Works alongside our <a href="/tools/home-loan-calculator" className="underline hover:text-red-800">home loan calculator</a> for comprehensive services
                      </div>
                    </div>
                  </div>
                </div>

                {/* Understanding Education Loans */}
                <div className="bg-white rounded-2xl shadow-lg p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-8">Complete Guide to Education Loan Planning</h2>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-4">What is an Education Loan?</h3>
                      <p className="text-gray-600 mb-6 leading-relaxed">
                        An education loan, also known as a student loan, is a specialized financial product designed to help students fund their higher education expenses including tuition fees, accommodation, books, and other academic costs. Unlike regular <a href="/tools/loan-calculator" className="text-blue-600 hover:text-blue-700 font-medium">personal loans</a>, education loans typically have lower interest rates, flexible repayment options, and tax benefits.
                      </p>
                      
                      <h3 className="text-xl font-semibold text-gray-900 mb-4">Key Features of Education Loans</h3>
                      <ul className="text-gray-600 space-y-2">
                        <li>• <strong>Grace Period:</strong> No EMI during course duration and usually 6-12 months after completion</li>
                        <li>• <strong>Lower Interest Rates:</strong> Competitive rates compared to <a href="/tools/emi-calculator" className="text-blue-600 hover:text-blue-700">regular EMI-based loans</a></li>
                        <li>• <strong>Tax Benefits:</strong> Interest paid is tax-deductible in many countries</li>
                        <li>• <strong>Flexible Repayment:</strong> Options to start repayment after getting a job</li>
                        <li>• <strong>Higher Loan Amounts:</strong> Can cover entire education costs</li>
                        <li>• <strong>Collateral Options:</strong> Both secured and unsecured loan variants available</li>
                      </ul>
                    </div>
                    
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-4">Education Loan vs Other Financing Options</h3>
                      <div className="space-y-4">
                        <div className="bg-blue-50 rounded-lg p-4">
                          <h4 className="font-semibold text-gray-900 mb-2">Education Loan vs Personal Loan</h4>
                          <ul className="text-sm text-gray-600 space-y-1">
                            <li>• Lower interest rates (typically 2-4% less)</li>
                            <li>• Longer repayment tenure (up to 15 years)</li>
                            <li>• Moratorium period during studies</li>
                            <li>• Tax benefits on interest payments</li>
                          </ul>
                          <p className="text-xs text-blue-700 mt-2">
                            Compare with our <a href="/tools/loan-calculator" className="underline">general loan calculator</a>
                          </p>
                        </div>
                        
                        <div className="bg-green-50 rounded-lg p-4">
                          <h4 className="font-semibold text-gray-900 mb-2">Education Loan vs Savings/Investments</h4>
                          <ul className="text-sm text-gray-600 space-y-1">
                            <li>• Immediate access to education without depleting savings</li>
                            <li>• Preserve emergency funds and investments</li>
                            <li>• Tax benefits may offset some interest costs</li>
                            <li>• Build credit history through regular repayments</li>
                          </ul>
                          <p className="text-xs text-green-700 mt-2">
                            Plan with our <a href="/tools/investment-return-calculator" className="underline">investment calculator</a>
                          </p>
                        </div>
                      </div>

                      <h3 className="text-xl font-semibold text-gray-900 mb-4 mt-6">Smart Education Loan Tips</h3>
                      <ul className="text-gray-600 space-y-2">
                        <li>• Apply early to secure better interest rates</li>
                        <li>• Compare offers from multiple lenders</li>
                        <li>• Consider scholarships and grants to minimize borrowing</li>
                        <li>• Choose courses with strong employment prospects</li>
                        <li>• Start repaying during grace period if possible</li>
                        <li>• Maintain good academic performance for potential rate reductions</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Types of Education Loans */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Types of Education Loans - Calculate EMI for Every Category</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="bg-white rounded-lg p-6 shadow-sm border-l-4 border-blue-600">
                      <i className="fas fa-university text-2xl text-blue-600 mb-4"></i>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Domestic Education Loans</h3>
                      <p className="text-gray-600 text-sm mb-3">
                        For studies within your home country. Usually have lower interest rates (7-12% typically) and easier approval process with minimal documentation.
                      </p>
                      <div className="text-xs text-blue-700 space-y-1">
                        <div>• Undergraduate programs</div>
                        <div>• Professional courses (Engineering, Medical)</div>
                        <div>• Diploma and certificate programs</div>
                      </div>
                    </div>
                    
                    <div className="bg-white rounded-lg p-6 shadow-sm border-l-4 border-green-600">
                      <i className="fas fa-globe text-2xl text-green-600 mb-4"></i>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">International Study Loans</h3>
                      <p className="text-gray-600 text-sm mb-3">
                        For overseas education including USA, UK, Canada, Australia. Higher loan amounts (up to ₹1.5 Cr) but may require collateral or co-signer.
                      </p>
                      <div className="text-xs text-green-700 space-y-1">
                        <div>• Master's programs abroad</div>
                        <div>• PhD and research programs</div>
                        <div>• Professional certifications</div>
                      </div>
                    </div>
                    
                    <div className="bg-white rounded-lg p-6 shadow-sm border-l-4 border-purple-600">
                      <i className="fas fa-tools text-2xl text-purple-600 mb-4"></i>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Skill Development Loans</h3>
                      <p className="text-gray-600 text-sm mb-3">
                        For professional courses, certifications, and vocational training programs. Often integrated with government skill development schemes.
                      </p>
                      <div className="text-xs text-purple-700 space-y-1">
                        <div>• IT and software training</div>
                        <div>• Digital marketing courses</div>
                        <div>• Trade and technical skills</div>
                      </div>
                    </div>
                    
                    <div className="bg-white rounded-lg p-6 shadow-sm border-l-4 border-orange-600">
                      <i className="fas fa-user-graduate text-2xl text-orange-600 mb-4"></i>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Postgraduate Loans</h3>
                      <p className="text-gray-600 text-sm mb-3">
                        For master's degree, PhD, and other postgraduate programs with specialized terms including research allowances and extended grace periods.
                      </p>
                      <div className="text-xs text-orange-700 space-y-1">
                        <div>• MBA and management programs</div>
                        <div>• Medical specialization</div>
                        <div>• Law and legal studies</div>
                      </div>
                    </div>
                    
                    <div className="bg-white rounded-lg p-6 shadow-sm border-l-4 border-teal-600">
                      <i className="fas fa-laptop text-2xl text-teal-600 mb-4"></i>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Online Course Loans</h3>
                      <p className="text-gray-600 text-sm mb-3">
                        For online degrees, MOOCs, and digital learning platforms with flexible terms. Growing category with micro-learning options.
                      </p>
                      <div className="text-xs text-teal-700 space-y-1">
                        <div>• Online MBA programs</div>
                        <div>• Professional certifications</div>
                        <div>• Skill-based micro-courses</div>
                      </div>
                    </div>
                    
                    <div className="bg-white rounded-lg p-6 shadow-sm border-l-4 border-red-600">
                      <i className="fas fa-briefcase text-2xl text-red-600 mb-4"></i>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Career Enhancement Loans</h3>
                      <p className="text-gray-600 text-sm mb-3">
                        For working professionals pursuing additional qualifications, MBA programs, or career transition courses while employed.
                      </p>
                      <div className="text-xs text-red-700 space-y-1">
                        <div>• Executive MBA programs</div>
                        <div>• Leadership development</div>
                        <div>• Industry-specific certifications</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-8 bg-white rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Loan Amount Guidelines by Category</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Domestic Education Loans</h4>
                        <ul className="text-sm text-gray-600 space-y-1">
                          <li>• Up to ₹10 lakhs: No collateral required</li>
                          <li>• ₹10-20 lakhs: Third-party guarantee</li>
                          <li>• Above ₹20 lakhs: Collateral security required</li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">International Education Loans</h4>
                        <ul className="text-sm text-gray-600 space-y-1">
                          <li>• Up to ₹7.5 lakhs: No collateral</li>
                          <li>• ₹7.5-20 lakhs: Third-party guarantee</li>
                          <li>• Above ₹20 lakhs: Immovable property as collateral</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Related Financial Tools */}
                <div className="bg-white rounded-2xl shadow-lg p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-8">Related Financial Calculators for Education Planning</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6 hover:shadow-md transition-shadow">
                      <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mb-4">
                        <i className="fas fa-calculator text-white text-xl"></i>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">
                        <a href="/tools/emi-calculator" className="hover:text-blue-600 transition-colors">EMI Calculator</a>
                      </h3>
                      <p className="text-gray-600 text-sm mb-3">
                        Calculate EMI for any type of loan including personal loans, home loans, and business loans alongside your education loan.
                      </p>
                      <div className="text-xs text-blue-700">
                        Perfect for comparing education loans with other EMI obligations
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-6 hover:shadow-md transition-shadow">
                      <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center mb-4">
                        <i className="fas fa-chart-line text-white text-xl"></i>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">
                        <a href="/tools/investment-return-calculator" className="hover:text-green-600 transition-colors">Investment Return Calculator</a>
                      </h3>
                      <p className="text-gray-600 text-sm mb-3">
                        Plan education savings and calculate returns on investments earmarked for education expenses.
                      </p>
                      <div className="text-xs text-green-700">
                        Ideal for parents planning education fund accumulation
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-6 hover:shadow-md transition-shadow">
                      <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center mb-4">
                        <i className="fas fa-piggy-bank text-white text-xl"></i>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">
                        <a href="/tools/savings-goal-calculator" className="hover:text-purple-600 transition-colors">Savings Goal Calculator</a>
                      </h3>
                      <p className="text-gray-600 text-sm mb-3">
                        Set and track education savings goals, calculate monthly contributions needed for future education costs.
                      </p>
                      <div className="text-xs text-purple-700">
                        Plan systematic education savings to reduce loan dependency
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-6 hover:shadow-md transition-shadow">
                      <div className="w-12 h-12 bg-orange-600 rounded-lg flex items-center justify-center mb-4">
                        <i className="fas fa-building text-white text-xl"></i>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">
                        <a href="/tools/business-loan-calculator" className="hover:text-orange-600 transition-colors">Business Loan Calculator</a>
                      </h3>
                      <p className="text-gray-600 text-sm mb-3">
                        For MBA graduates planning to start their own business, calculate business loan requirements and EMIs.
                      </p>
                      <div className="text-xs text-orange-700">
                        Bridge education investment to entrepreneurial ventures
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-teal-50 to-teal-100 rounded-lg p-6 hover:shadow-md transition-shadow">
                      <div className="w-12 h-12 bg-teal-600 rounded-lg flex items-center justify-center mb-4">
                        <i className="fas fa-home text-white text-xl"></i>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">
                        <a href="/tools/home-loan-calculator" className="hover:text-teal-600 transition-colors">Home Loan Calculator</a>
                      </h3>
                      <p className="text-gray-600 text-sm mb-3">
                        Plan home purchase after education completion, considering education loan EMIs in debt-to-income ratio.
                      </p>
                      <div className="text-xs text-teal-700">
                        Balance education and housing loan obligations
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg p-6 hover:shadow-md transition-shadow">
                      <div className="w-12 h-12 bg-red-600 rounded-lg flex items-center justify-center mb-4">
                        <i className="fas fa-credit-card text-white text-xl"></i>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">
                        <a href="/tools/debt-payoff-calculator" className="hover:text-red-600 transition-colors">Debt Payoff Calculator</a>
                      </h3>
                      <p className="text-gray-600 text-sm mb-3">
                        Create comprehensive debt payoff strategies including education loans, credit cards, and other debts.
                      </p>
                      <div className="text-xs text-red-700">
                        Optimize multiple debt repayment including education loans
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-8 bg-gray-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Complete Education Finance Planning Toolkit</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-medium text-gray-900 mb-3">Pre-Education Planning</h4>
                        <ul className="text-sm text-gray-600 space-y-2">
                          <li>• <a href="/tools/savings-goal-calculator" className="text-blue-600 hover:text-blue-700 font-medium">Savings Goal Calculator</a> - Plan education fund accumulation</li>
                          <li>• <a href="/tools/investment-return-calculator" className="text-blue-600 hover:text-blue-700 font-medium">Investment Calculator</a> - Grow education savings through investments</li>
                          <li>• <a href="/tools/compound-interest-calculator" className="text-blue-600 hover:text-blue-700 font-medium">Compound Interest Calculator</a> - Calculate long-term education savings growth</li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 mb-3">Post-Education Financial Planning</h4>
                        <ul className="text-sm text-gray-600 space-y-2">
                          <li>• <a href="/tools/salary-to-hourly-calculator" className="text-blue-600 hover:text-blue-700 font-medium">Salary Calculator</a> - Plan career earnings vs loan obligations</li>
                          <li>• <a href="/tools/retirement-calculator" className="text-blue-600 hover:text-blue-700 font-medium">Retirement Calculator</a> - Balance early career loan payments with retirement planning</li>
                          <li>• <a href="/tools/net-worth-calculator" className="text-blue-600 hover:text-blue-700 font-medium">Net Worth Calculator</a> - Track overall financial progress including education ROI</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Eligibility and Requirements */}
                <div className="bg-white rounded-2xl shadow-lg p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Education Loan Eligibility & Requirements</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Eligibility Criteria</h3>
                      <div className="space-y-4">
                        <div className="border-l-4 border-blue-500 pl-4">
                          <h4 className="font-semibold text-gray-900">Age Requirements</h4>
                          <p className="text-gray-600 text-sm">Usually 16-35 years, depending on the course and lender.</p>
                        </div>
                        <div className="border-l-4 border-green-500 pl-4">
                          <h4 className="font-semibold text-gray-900">Academic Records</h4>
                          <p className="text-gray-600 text-sm">Good academic performance in previous qualifications.</p>
                        </div>
                        <div className="border-l-4 border-purple-500 pl-4">
                          <h4 className="font-semibold text-gray-900">Course Recognition</h4>
                          <p className="text-gray-600 text-sm">Course must be from recognized institution or university.</p>
                        </div>
                        <div className="border-l-4 border-orange-500 pl-4">
                          <h4 className="font-semibold text-gray-900">Financial Background</h4>
                          <p className="text-gray-600 text-sm">Family income and financial stability assessment.</p>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Required Documents</h3>
                      <div className="space-y-3">
                        <div className="flex items-start space-x-2">
                          <i className="fas fa-check text-green-500 mt-1"></i>
                          <span className="text-gray-600">Admission letter from educational institution</span>
                        </div>
                        <div className="flex items-start space-x-2">
                          <i className="fas fa-check text-green-500 mt-1"></i>
                          <span className="text-gray-600">Academic transcripts and certificates</span>
                        </div>
                        <div className="flex items-start space-x-2">
                          <i className="fas fa-check text-green-500 mt-1"></i>
                          <span className="text-gray-600">Income proof of parents/guardians</span>
                        </div>
                        <div className="flex items-start space-x-2">
                          <i className="fas fa-check text-green-500 mt-1"></i>
                          <span className="text-gray-600">Identity and address proof documents</span>
                        </div>
                        <div className="flex items-start space-x-2">
                          <i className="fas fa-check text-green-500 mt-1"></i>
                          <span className="text-gray-600">Bank statements and financial documents</span>
                        </div>
                        <div className="flex items-start space-x-2">
                          <i className="fas fa-check text-green-500 mt-1"></i>
                          <span className="text-gray-600">Collateral documents (if applicable)</span>
                        </div>
                        <div className="flex items-start space-x-2">
                          <i className="fas fa-check text-green-500 mt-1"></i>
                          <span className="text-gray-600">Co-signer agreement (if required)</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* FAQ Section */}
                <div className="bg-gray-50 rounded-2xl p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Frequently Asked Questions</h2>
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">When should I start repaying my education loan?</h3>
                      <p className="text-gray-600">
                        Most education loans have a grace period of 6-12 months after course completion. However, you can start repaying during the course or grace period to reduce the total interest burden.
                      </p>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Can I get tax benefits on education loan interest?</h3>
                      <p className="text-gray-600">
                        Yes, in many countries including India and the US, the interest paid on education loans is eligible for tax deductions. Check your local tax laws for specific benefits and limits.
                      </p>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">What happens if I can't find a job after graduation?</h3>
                      <p className="text-gray-600">
                        Most lenders offer additional grace periods or restructuring options for unemployed graduates. Contact your lender immediately to discuss moratorium or restructuring options.
                      </p>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Can I prepay my education loan without penalty?</h3>
                      <p className="text-gray-600">
                        Most education loans allow prepayment without penalties, especially those offered by government institutions. Private lenders may have prepayment charges, so check your loan agreement.
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
                  This education loan calculator supports major global currencies, making it perfect for students planning to study abroad or domestic education financing. The calculations remain accurate regardless of the currency selected.
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

export default EducationLoanCalculator;
