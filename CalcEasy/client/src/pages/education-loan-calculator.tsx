
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
                {/* Understanding Education Loans */}
                <div className="bg-white rounded-2xl shadow-lg p-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-8">Complete Guide to Education Loan Calculator</h2>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-4">What is an Education Loan?</h3>
                      <p className="text-gray-600 mb-6 leading-relaxed">
                        An education loan, also known as a student loan, is a financial product designed to help students fund their higher education expenses including tuition fees, accommodation, books, and other academic costs. Unlike regular loans, education loans typically have lower interest rates and flexible repayment options.
                      </p>
                      
                      <h3 className="text-xl font-semibold text-gray-900 mb-4">Key Features of Education Loans</h3>
                      <ul className="text-gray-600 space-y-2">
                        <li>• <strong>Grace Period:</strong> No EMI during course duration and usually 6-12 months after completion</li>
                        <li>• <strong>Lower Interest Rates:</strong> Competitive rates compared to personal loans</li>
                        <li>• <strong>Tax Benefits:</strong> Interest paid is tax-deductible in many countries</li>
                        <li>• <strong>Flexible Repayment:</strong> Options to start repayment after getting a job</li>
                        <li>• <strong>Higher Loan Amounts:</strong> Can cover entire education costs</li>
                      </ul>
                    </div>
                    
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-4">How Education Loan Calculation Works</h3>
                      <p className="text-gray-600 mb-4">
                        Education loan calculation is unique because it considers:
                      </p>
                      <div className="bg-blue-50 rounded-lg p-4 mb-4">
                        <ul className="text-blue-800 space-y-2">
                          <li><strong>1. Course Duration:</strong> Interest accrues during study period</li>
                          <li><strong>2. Grace Period:</strong> Additional interest accumulation</li>
                          <li><strong>3. Repayment Period:</strong> EMI calculation starts after grace period</li>
                        </ul>
                      </div>

                      <h3 className="text-xl font-semibold text-gray-900 mb-4">Smart Education Loan Tips</h3>
                      <ul className="text-gray-600 space-y-2">
                        <li>• Apply early to get better interest rates</li>
                        <li>• Compare different lenders and their terms</li>
                        <li>• Consider part-time work to reduce loan burden</li>
                        <li>• Look for scholarships and grants to minimize borrowing</li>
                        <li>• Choose courses with good employment prospects</li>
                        <li>• Start repaying during grace period if possible to reduce interest</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Types of Education Loans */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Types of Education Loans</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="bg-white rounded-lg p-6 shadow-sm">
                      <i className="fas fa-university text-2xl text-blue-600 mb-4"></i>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Domestic Education Loans</h3>
                      <p className="text-gray-600 text-sm">
                        For studies within your home country. Usually have lower interest rates and easier approval process.
                      </p>
                    </div>
                    
                    <div className="bg-white rounded-lg p-6 shadow-sm">
                      <i className="fas fa-globe text-2xl text-green-600 mb-4"></i>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">International Study Loans</h3>
                      <p className="text-gray-600 text-sm">
                        For overseas education. Higher loan amounts but may require collateral or co-signer.
                      </p>
                    </div>
                    
                    <div className="bg-white rounded-lg p-6 shadow-sm">
                      <i className="fas fa-tools text-2xl text-purple-600 mb-4"></i>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Skill Development Loans</h3>
                      <p className="text-gray-600 text-sm">
                        For professional courses, certifications, and vocational training programs.
                      </p>
                    </div>
                    
                    <div className="bg-white rounded-lg p-6 shadow-sm">
                      <i className="fas fa-user-graduate text-2xl text-orange-600 mb-4"></i>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Postgraduate Loans</h3>
                      <p className="text-gray-600 text-sm">
                        For master's degree, PhD, and other postgraduate programs with specialized terms.
                      </p>
                    </div>
                    
                    <div className="bg-white rounded-lg p-6 shadow-sm">
                      <i className="fas fa-laptop text-2xl text-teal-600 mb-4"></i>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Online Course Loans</h3>
                      <p className="text-gray-600 text-sm">
                        For online degrees, MOOCs, and digital learning platforms with flexible terms.
                      </p>
                    </div>
                    
                    <div className="bg-white rounded-lg p-6 shadow-sm">
                      <i className="fas fa-briefcase text-2xl text-red-600 mb-4"></i>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Career Enhancement Loans</h3>
                      <p className="text-gray-600 text-sm">
                        For working professionals pursuing additional qualifications or MBA programs.
                      </p>
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
