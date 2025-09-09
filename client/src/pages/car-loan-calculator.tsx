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
import { Calculator } from 'lucide-react';

interface CarLoanResult {
  monthlyPayment: number;
  totalAmount: number;
  totalInterest: number;
  loanAmount: number;
  downPayment: number;
  carPrice: number;
}

const CarLoanCalculator = () => {
  const [carPrice, setCarPrice] = useState('');
  const [downPayment, setDownPayment] = useState('');
  const [downPaymentPercent, setDownPaymentPercent] = useState('20');
  const [loanTerm, setLoanTerm] = useState('5');
  const [interestRate, setInterestRate] = useState('');
  const [usePercentage, setUsePercentage] = useState(true);
  const [currency, setCurrency] = useState('USD');
  const [result, setResult] = useState<CarLoanResult | null>(null);

  const calculateCarLoan = () => {
    const price = parseFloat(carPrice);
    const down = usePercentage 
      ? (price * parseFloat(downPaymentPercent)) / 100 
      : parseFloat(downPayment);
    const principal = price - down;
    const rate = parseFloat(interestRate) / 100 / 12;
    const term = parseFloat(loanTerm) * 12;

    if (principal && rate && term) {
      // Monthly payment calculation using standard loan formula
      const monthlyPayment = (principal * rate * Math.pow(1 + rate, term)) / (Math.pow(1 + rate, term) - 1);
      const totalAmount = monthlyPayment * term;
      const totalInterest = totalAmount - principal;

      setResult({
        monthlyPayment: Math.round(monthlyPayment * 100) / 100,
        totalAmount: Math.round(totalAmount * 100) / 100,
        totalInterest: Math.round(totalInterest * 100) / 100,
        loanAmount: principal,
        downPayment: down,
        carPrice: price
      });
    } else if (principal && rate === 0 && term) {
      // Handle 0% interest rate
      const monthlyPayment = principal / term;
      const totalAmount = principal;
      
      setResult({
        monthlyPayment: Math.round(monthlyPayment * 100) / 100,
        totalAmount: Math.round(totalAmount * 100) / 100,
        totalInterest: 0,
        loanAmount: principal,
        downPayment: down,
        carPrice: price
      });
    }
  };

  const resetCalculator = () => {
    setCarPrice('');
    setDownPayment('');
    setDownPaymentPercent('20');
    setLoanTerm('5');
    setInterestRate('');
    setUsePercentage(true);
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
        <title>Car Loan Calculator - Calculate Auto Loan Payments | ToolForge</title>
        <meta name="description" content="Free car loan calculator to calculate monthly auto loan payments, total interest, and loan costs. Plan your car purchase with accurate estimates." />
        <meta name="keywords" content="car loan calculator, auto loan calculator, vehicle loan calculator, car payment calculator, auto financing" />
        <meta property="og:title" content="Car Loan Calculator - Calculate Auto Loan Payments | ToolForge" />
        <meta property="og:description" content="Free car loan calculator to calculate monthly auto loan payments, total interest, and loan costs. Plan your car purchase with accurate estimates." />
        <meta property="og:type" content="website" />
        <link rel="canonical" href="/tools/car-loan-calculator" />
      </Helmet>

      <div className="min-h-screen flex flex-col" data-testid="page-car-loan-calculator">
        <Header />
        
        <main className="flex-1 bg-neutral-50">
          {/* Hero Section */}
          <section className="gradient-hero text-white py-16">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <div className="w-20 h-20 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <i className="fas fa-car text-3xl"></i>
              </div>
              <h1 className="text-4xl sm:text-5xl font-bold mb-6" data-testid="text-page-title">
                Car Loan Calculator
              </h1>
              <p className="text-xl text-blue-100 max-w-2xl mx-auto">
                Calculate monthly car loan payments, total interest, and total cost for your vehicle purchase
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
                      <h2 className="text-2xl font-semibold text-gray-900 mb-8">Car Loan Details</h2>
                      
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

                      {/* Car Price */}
                      <div className="space-y-3">
                        <Label htmlFor="car-price" className="text-sm font-medium text-gray-700">
                          Car Price
                        </Label>
                        <Input
                          id="car-price"
                          type="number"
                          value={carPrice}
                          onChange={(e) => setCarPrice(e.target.value)}
                          className="h-12 text-base border-gray-200 rounded-lg"
                          placeholder="25000"
                          min="0"
                          step="100"
                          data-testid="input-car-price"
                        />
                      </div>

                      {/* Down Payment */}
                      <div className="space-y-3">
                        <Label>Down Payment</Label>
                        <RadioGroup 
                          value={usePercentage ? "percentage" : "amount"} 
                          onValueChange={(value) => setUsePercentage(value === "percentage")}
                          className="flex gap-6"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="percentage" id="percentage" data-testid="radio-percentage" />
                            <Label htmlFor="percentage">Percentage</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="amount" id="amount" data-testid="radio-amount" />
                            <Label htmlFor="amount">Dollar Amount</Label>
                          </div>
                        </RadioGroup>
                        
                        {usePercentage ? (
                          <div className="relative">
                            <Input
                              type="number"
                              value={downPaymentPercent}
                              onChange={(e) => setDownPaymentPercent(e.target.value)}
                              className="pr-8"
                              placeholder="20"
                              min="0"
                              max="100"
                              step="0.1"
                              data-testid="input-down-payment-percent"
                            />
                            <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">%</span>
                          </div>
                        ) : (
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">$</span>
                            <Input
                              type="number"
                              value={downPayment}
                              onChange={(e) => setDownPayment(e.target.value)}
                              className="pl-8"
                              placeholder="5000"
                              min="0"
                              data-testid="input-down-payment-amount"
                            />
                          </div>
                        )}
                      </div>

                      {/* Loan Term */}
                      <div className="space-y-3">
                        <Label className="text-sm font-medium text-gray-700">Loan Term</Label>
                        <div className="grid grid-cols-2 gap-3">
                          <Input
                            type="number"
                            value={loanTerm}
                            onChange={(e) => setLoanTerm(e.target.value)}
                            className="h-12 text-base border-gray-200 rounded-lg"
                            placeholder="5"
                            min="1"
                            max="10"
                            data-testid="input-loan-term"
                          />
                          <Select value="years" onValueChange={() => {}}>
                            <SelectTrigger className="h-12 border-gray-200 rounded-lg" data-testid="select-loan-term">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="years">Years</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
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
                          placeholder="4.5"
                          step="0.01"
                          min="0"
                          max="30"
                          data-testid="input-interest-rate"
                        />
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-4 pt-6">
                        <Button
                          onClick={calculateCarLoan}
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
                      <h2 className="text-2xl font-semibold text-gray-900 mb-8">Loan Calculation Results</h2>
                      
                      {result ? (
                        <div className="space-y-4" data-testid="car-loan-results">
                          {/* Monthly Payment */}
                          <div className="bg-white rounded-lg p-4 border-l-4 border-blue-500">
                            <div className="flex justify-between items-center">
                              <span className="font-semibold text-gray-700">Monthly Payment</span>
                              <span className="text-2xl font-bold text-blue-600" data-testid="text-monthly-payment">
                                {formatCurrency(result.monthlyPayment)}
                              </span>
                            </div>
                          </div>

                          {/* Loan Summary */}
                          <div className="space-y-3">
                            <div className="flex justify-between">
                              <span className="text-gray-600">Car Price</span>
                              <span className="font-semibold" data-testid="text-car-price">
                                {formatCurrency(result.carPrice)}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Down Payment</span>
                              <span className="font-semibold" data-testid="text-down-payment">
                                {formatCurrency(result.downPayment)}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Loan Amount</span>
                              <span className="font-semibold" data-testid="text-loan-amount">
                                {formatCurrency(result.loanAmount)}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Total Amount Paid</span>
                              <span className="font-semibold" data-testid="text-total-amount">
                                {formatCurrency(result.totalAmount)}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Total Interest</span>
                              <span className="font-semibold text-red-600" data-testid="text-total-interest">
                                {formatCurrency(result.totalInterest)}
                              </span>
                            </div>
                          </div>

                          {/* Visual Breakdown */}
                          <div className="mt-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-3">Payment Breakdown</h3>
                            <div className="space-y-2">
                              <div className="flex items-center">
                                <div 
                                  className="h-4 bg-blue-500 rounded-l"
                                  style={{ width: `${(result.loanAmount / result.totalAmount) * 100}%` }}
                                ></div>
                                <div 
                                  className="h-4 bg-red-400 rounded-r"
                                  style={{ width: `${(result.totalInterest / result.totalAmount) * 100}%` }}
                                ></div>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span className="flex items-center">
                                  <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                                  Principal ({Math.round((result.loanAmount / result.totalAmount) * 100)}%)
                                </span>
                                <span className="flex items-center">
                                  <div className="w-3 h-3 bg-red-400 rounded-full mr-2"></div>
                                  Interest ({Math.round((result.totalInterest / result.totalAmount) * 100)}%)
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Affordability Info */}
                          <div className="bg-yellow-50 rounded-lg p-4 mt-4">
                            <h4 className="font-semibold text-gray-700 mb-2">💡 Car Affordability Tips</h4>
                            <div className="text-sm text-gray-600 space-y-1">
                              <p>• Keep total vehicle costs under 20% of take-home pay</p>
                              <p>• Consider insurance, maintenance, and fuel costs</p>
                              <p>• Larger down payment = lower monthly payments</p>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-8" data-testid="no-results">
                          <i className="fas fa-car text-4xl text-gray-400 mb-4"></i>
                          <p className="text-gray-500">Enter car loan details to see payment breakdown</p>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* What is a Car Loan Calculator Section */}
              <Card className="mt-12 bg-white border-0 shadow-sm">
                <CardContent className="p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">What is a Car Loan Calculator?</h2>
                  <div className="prose max-w-none text-gray-600">
                    <p className="mb-4">
                      A car loan calculator is an essential financial tool that helps you determine the monthly payment, 
                      total interest cost, and overall affordability of purchasing a vehicle through financing. Our free 
                      auto loan calculator uses advanced mathematical formulas to provide accurate estimates based on 
                      your loan amount, interest rate, loan term, and down payment.
                    </p>
                    <p className="mb-4">
                      Whether you're buying a new car, used vehicle, or considering auto refinancing, this calculator 
                      enables you to compare different financing scenarios and make informed decisions about your car 
                      purchase. It helps you understand the true cost of borrowing and plan your budget effectively.
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* How to Use Car Loan Calculator */}
              <Card className="mt-8 bg-white border-0 shadow-sm">
                <CardContent className="p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">How to Use the Car Loan Calculator</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Step-by-Step Guide</h3>
                      <ol className="text-gray-600 space-y-2 list-decimal list-inside">
                        <li>Select your preferred currency from the dropdown menu</li>
                        <li>Enter the total car price including taxes and fees</li>
                        <li>Choose between percentage or dollar amount for down payment</li>
                        <li>Input your down payment amount or percentage</li>
                        <li>Set the loan term (number of years to repay)</li>
                        <li>Enter the annual interest rate offered by your lender</li>
                        <li>Click "Calculate" to see your monthly payment breakdown</li>
                      </ol>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Understanding Results</h3>
                      <p className="text-gray-600 mb-4">
                        The calculator provides comprehensive results including:
                      </p>
                      <ul className="text-gray-600 space-y-2">
                        <li>• <strong>Monthly Payment:</strong> Your fixed monthly car payment</li>
                        <li>• <strong>Total Amount Paid:</strong> Sum of all payments over loan term</li>
                        <li>• <strong>Total Interest:</strong> Interest paid over the life of the loan</li>
                        <li>• <strong>Payment Breakdown:</strong> Visual representation of principal vs. interest</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Benefits and Features */}
              <Card className="mt-8 bg-white border-0 shadow-sm">
                <CardContent className="p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Benefits of Using Our Car Loan Calculator</h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <i className="fas fa-calculator text-blue-600 text-2xl"></i>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Accurate Calculations</h3>
                      <p className="text-gray-600 text-sm">
                        Uses standard amortization formulas for precise monthly payment calculations and interest projections.
                      </p>
                    </div>
                    <div className="text-center">
                      <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <i className="fas fa-globe text-green-600 text-2xl"></i>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Multi-Currency Support</h3>
                      <p className="text-gray-600 text-sm">
                        Calculate car loans in 10 major currencies including USD, EUR, GBP, INR, JPY, and more.
                      </p>
                    </div>
                    <div className="text-center">
                      <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <i className="fas fa-chart-pie text-purple-600 text-2xl"></i>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Visual Breakdown</h3>
                      <p className="text-gray-600 text-sm">
                        Interactive charts showing the split between principal and interest payments over time.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Car Loan Types and Use Cases */}
              <Card className="mt-8 bg-white border-0 shadow-sm">
                <CardContent className="p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Car Loan Types and Use Cases</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Types of Auto Loans</h3>
                      <div className="space-y-4">
                        <div className="border-l-4 border-blue-500 pl-4">
                          <h4 className="font-semibold text-gray-900">New Car Loans</h4>
                          <p className="text-gray-600 text-sm">Lower interest rates, longer terms available, full warranty coverage.</p>
                        </div>
                        <div className="border-l-4 border-green-500 pl-4">
                          <h4 className="font-semibold text-gray-900">Used Car Loans</h4>
                          <p className="text-gray-600 text-sm">Higher rates than new cars, shorter terms, requires vehicle inspection.</p>
                        </div>
                        <div className="border-l-4 border-purple-500 pl-4">
                          <h4 className="font-semibold text-gray-900">Certified Pre-Owned</h4>
                          <p className="text-gray-600 text-sm">Balance between new and used, manufacturer warranty, competitive rates.</p>
                        </div>
                        <div className="border-l-4 border-orange-500 pl-4">
                          <h4 className="font-semibold text-gray-900">Refinancing</h4>
                          <p className="text-gray-600 text-sm">Replace existing loan with better terms, lower rates, or different payment schedule.</p>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Common Use Cases</h3>
                      <ul className="text-gray-600 space-y-3">
                        <li className="flex items-start">
                          <i className="fas fa-check-circle text-green-500 mt-1 mr-3"></i>
                          <span><strong>Budget Planning:</strong> Determine affordable monthly payments before car shopping</span>
                        </li>
                        <li className="flex items-start">
                          <i className="fas fa-check-circle text-green-500 mt-1 mr-3"></i>
                          <span><strong>Loan Comparison:</strong> Compare offers from banks, credit unions, and dealers</span>
                        </li>
                        <li className="flex items-start">
                          <i className="fas fa-check-circle text-green-500 mt-1 mr-3"></i>
                          <span><strong>Down Payment Planning:</strong> See how different down payments affect monthly costs</span>
                        </li>
                        <li className="flex items-start">
                          <i className="fas fa-check-circle text-green-500 mt-1 mr-3"></i>
                          <span><strong>Term Analysis:</strong> Understand the trade-off between payment amount and loan duration</span>
                        </li>
                        <li className="flex items-start">
                          <i className="fas fa-check-circle text-green-500 mt-1 mr-3"></i>
                          <span><strong>Refinancing Evaluation:</strong> Calculate potential savings from refinancing existing loans</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Audience-Specific Car Loan Benefits */}
              <Card className="mt-8 bg-gradient-to-br from-blue-50 to-indigo-50 border-0">
                <CardContent className="p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Car Loan Calculator Benefits by Audience</h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Students */}
                    <div className="bg-white rounded-xl p-6 shadow-sm">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                        <i className="fas fa-graduation-cap text-blue-600 text-xl"></i>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Students & First-Time Buyers</h3>
                      <ul className="text-gray-600 space-y-2 text-sm">
                        <li>• Budget tight finances while building credit</li>
                        <li>• Compare student-friendly loan options</li>
                        <li>• Plan for insurance and maintenance costs</li>
                        <li>• Understand co-signer requirements</li>
                        <li>• Calculate total cost of ownership</li>
                      </ul>
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <a href="/tools/loan-calculator" className="text-blue-600 hover:text-blue-700 font-medium text-sm">
                          General Loan Calculator →
                        </a>
                      </div>
                    </div>

                    {/* Professionals */}
                    <div className="bg-white rounded-xl p-6 shadow-sm">
                      <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                        <i className="fas fa-briefcase text-green-600 text-xl"></i>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Working Professionals</h3>
                      <ul className="text-gray-600 space-y-2 text-sm">
                        <li>• Balance car payments with savings goals</li>
                        <li>• Optimize monthly budget allocation</li>
                        <li>• Consider lease vs. buy scenarios</li>
                        <li>• Plan for career mobility needs</li>
                        <li>• Integrate with retirement planning</li>
                      </ul>
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <a href="/tools/retirement-calculator" className="text-green-600 hover:text-green-700 font-medium text-sm">
                          Retirement Calculator →
                        </a>
                      </div>
                    </div>

                    {/* Business Owners */}
                    <div className="bg-white rounded-xl p-6 shadow-sm">
                      <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                        <i className="fas fa-building text-purple-600 text-xl"></i>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Business Owners</h3>
                      <ul className="text-gray-600 space-y-2 text-sm">
                        <li>• Evaluate business vs. personal financing</li>
                        <li>• Consider tax implications and deductions</li>
                        <li>• Plan for multiple vehicle financing</li>
                        <li>• Manage cash flow and working capital</li>
                        <li>• Compare commercial loan options</li>
                      </ul>
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <a href="/tools/business-loan-calculator" className="text-purple-600 hover:text-purple-700 font-medium text-sm">
                          Business Loan Calculator →
                        </a>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Educational Content */}
              <div className="mt-8 bg-white rounded-2xl shadow-lg p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Complete Car Loan Planning Guide</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Before You Buy</h3>
                    <p className="text-gray-600 mb-4">
                      Research the car's value using resources like KBB or Edmunds, get pre-approved for financing, 
                      and compare loan offers from multiple lenders including banks, credit unions, and dealer financing. 
                      Check your credit score and get your financial documents ready.
                    </p>
                    
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Down Payment Strategy</h3>
                    <p className="text-gray-600 mb-4">
                      A larger down payment reduces your loan amount, monthly payments, and total interest paid. 
                      Aim for at least 20% down on a new car, 10% on used cars. This also helps avoid being 
                      "underwater" on your loan where you owe more than the car's worth.
                    </p>

                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Interest Rate Factors</h3>
                    <ul className="text-gray-600 space-y-2">
                      <li>• Credit score (most important factor)</li>
                      <li>• Loan term length</li>
                      <li>• New vs. used vehicle</li>
                      <li>• Down payment amount</li>
                      <li>• Debt-to-income ratio</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Loan Term Considerations</h3>
                    <ul className="text-gray-600 space-y-2 mb-4">
                      <li>• <strong>Short terms (2-4 years):</strong> Higher payments, less total interest</li>
                      <li>• <strong>Medium terms (5-6 years):</strong> Balanced payments and interest</li>
                      <li>• <strong>Long terms (7+ years):</strong> Lower payments, much more interest</li>
                      <li>• Consider the car's depreciation vs. loan balance</li>
                      <li>• Factor in warranty coverage with loan term</li>
                    </ul>

                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Additional Costs to Consider</h3>
                    <ul className="text-gray-600 space-y-2">
                      <li>• Auto insurance (full coverage required)</li>
                      <li>• Sales tax and registration fees</li>
                      <li>• Extended warranties and service contracts</li>
                      <li>• Gap insurance for new cars</li>
                      <li>• Regular maintenance and repairs</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Car Loan Formula and Tips */}
              <Card className="mt-8 bg-gray-50 border-0">
                <CardContent className="p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Car Loan Formula and Expert Tips</h2>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Monthly Payment Formula</h3>
                      <div className="bg-white rounded-lg p-4 border">
                        <code className="text-sm text-gray-700">
                          M = P × [r(1+r)^n] / [(1+r)^n - 1]
                        </code>
                        <div className="mt-3 text-sm text-gray-600">
                          <p><strong>M</strong> = Monthly payment</p>
                          <p><strong>P</strong> = Principal loan amount</p>
                          <p><strong>r</strong> = Monthly interest rate</p>
                          <p><strong>n</strong> = Number of payments</p>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Expert Car Buying Tips</h3>
                      <ul className="text-gray-600 space-y-2">
                        <li>• 🎯 Keep total vehicle expenses under 20% of income</li>
                        <li>• 💰 Shop for financing before visiting dealerships</li>
                        <li>• 📊 Compare APR, not just monthly payments</li>
                        <li>• 🔍 Read all loan terms and conditions carefully</li>
                        <li>• ⚖️ Consider certified pre-owned for best value</li>
                        <li>• 📱 Use our calculator to negotiate better deals</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Frequently Asked Questions */}
              <Card className="mt-8 bg-white border-0 shadow-sm">
                <CardContent className="p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Frequently Asked Questions</h2>
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">What credit score do I need for a car loan?</h3>
                      <p className="text-gray-600">
                        While you can get approved with scores as low as 500, the best rates typically require scores of 700+. 
                        Scores of 600-699 get decent rates, while below 600 may result in higher interest rates or require a co-signer.
                      </p>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Should I finance through the dealer or my bank?</h3>
                      <p className="text-gray-600">
                        Compare both options. Banks and credit unions often offer competitive rates, especially for members with good credit. 
                        Dealers may have promotional rates but could mark up the interest. Get pre-approved elsewhere first for negotiating power.
                      </p>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">How much should I put down on a car?</h3>
                      <p className="text-gray-600">
                        For new cars, aim for 20% down; for used cars, 10% minimum. A larger down payment reduces monthly payments, 
                        total interest, and helps avoid negative equity. However, don't drain your emergency fund for a down payment.
                      </p>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">What's the ideal car loan term?</h3>
                      <p className="text-gray-600">
                        Most financial experts recommend 4-5 years maximum. While longer terms reduce monthly payments, they result in 
                        significantly more interest paid and higher risk of negative equity. Shorter terms save money but increase monthly payments.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Related Financial Planning Tools */}
              <Card className="mt-8 bg-white border-0 shadow-sm">
                <CardContent className="p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Complete Your Financial Planning</h2>
                  <p className="text-gray-600 mb-8">
                    Maximize your car purchase decision with our comprehensive suite of financial calculators designed to work together for complete budget analysis and financial planning.
                  </p>
                  
                  {/* Loan & Debt Calculators */}
                  <div className="mb-8">
                    <h3 className="text-xl font-semibold text-gray-900 mb-6">🚗 Related Loan & Debt Calculators</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      <a href="/tools/loan-calculator" className="block p-6 bg-blue-50 rounded-lg border border-blue-100 hover:border-blue-200 transition-all hover:shadow-md">
                        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center mb-3">
                          <i className="fas fa-calculator text-white text-sm"></i>
                        </div>
                        <h4 className="font-semibold text-gray-900 mb-2">General Loan Calculator</h4>
                        <p className="text-gray-600 text-sm mb-3">Calculate monthly payments for personal loans, student loans, and other installment debt.</p>
                        <span className="text-blue-600 text-sm font-medium">Calculate Loan Payments →</span>
                      </a>

                      <a href="/tools/debt-payoff-calculator" className="block p-6 bg-red-50 rounded-lg border border-red-100 hover:border-red-200 transition-all hover:shadow-md">
                        <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center mb-3">
                          <i className="fas fa-credit-card text-white text-sm"></i>
                        </div>
                        <h4 className="font-semibold text-gray-900 mb-2">Debt Payoff Calculator</h4>
                        <p className="text-gray-600 text-sm mb-3">Plan debt elimination strategies including credit cards and other loans alongside your car payment.</p>
                        <span className="text-red-600 text-sm font-medium">Plan Debt Payoff →</span>
                      </a>

                      <a href="/tools/credit-card-interest-calculator" className="block p-6 bg-orange-50 rounded-lg border border-orange-100 hover:border-orange-200 transition-all hover:shadow-md">
                        <div className="w-8 h-8 bg-orange-600 rounded-lg flex items-center justify-center mb-3">
                          <i className="fas fa-percentage text-white text-sm"></i>
                        </div>
                        <h4 className="font-semibold text-gray-900 mb-2">Credit Card Calculator</h4>
                        <p className="text-gray-600 text-sm mb-3">Manage credit card debt while planning your car loan budget and payment capacity.</p>
                        <span className="text-orange-600 text-sm font-medium">Calculate CC Interest →</span>
                      </a>
                    </div>
                  </div>

                  {/* Housing & Investment Tools */}
                  <div className="mb-8">
                    <h3 className="text-xl font-semibold text-gray-900 mb-6">🏠 Housing & Investment Calculators</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      <a href="/tools/mortgage-calculator" className="block p-6 bg-green-50 rounded-lg border border-green-100 hover:border-green-200 transition-all hover:shadow-md">
                        <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center mb-3">
                          <i className="fas fa-home text-white text-sm"></i>
                        </div>
                        <h4 className="font-semibold text-gray-900 mb-2">Mortgage Calculator</h4>
                        <p className="text-gray-600 text-sm mb-3">Balance housing costs with car payments to optimize your total monthly budget allocation.</p>
                        <span className="text-green-600 text-sm font-medium">Calculate Mortgage →</span>
                      </a>

                      <a href="/tools/compound-interest-calculator" className="block p-6 bg-purple-50 rounded-lg border border-purple-100 hover:border-purple-200 transition-all hover:shadow-md">
                        <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center mb-3">
                          <i className="fas fa-chart-line text-white text-sm"></i>
                        </div>
                        <h4 className="font-semibold text-gray-900 mb-2">Compound Interest Calculator</h4>
                        <p className="text-gray-600 text-sm mb-3">Compare car loan interest with investment growth potential for informed financing decisions.</p>
                        <span className="text-purple-600 text-sm font-medium">Calculate Growth →</span>
                      </a>

                      <a href="/tools/investment-return-calculator" className="block p-6 bg-indigo-50 rounded-lg border border-indigo-100 hover:border-indigo-200 transition-all hover:shadow-md">
                        <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center mb-3">
                          <i className="fas fa-trending-up text-white text-sm"></i>
                        </div>
                        <h4 className="font-semibold text-gray-900 mb-2">Investment Return Calculator</h4>
                        <p className="text-gray-600 text-sm mb-3">Evaluate opportunity cost of car payments versus investment potential over time.</p>
                        <span className="text-indigo-600 text-sm font-medium">Calculate Returns →</span>
                      </a>
                    </div>
                  </div>

                  {/* Financial Planning Tools */}
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-6">📊 Budget & Planning Calculators</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      <a href="/tools/net-worth-calculator" className="block p-6 bg-teal-50 rounded-lg border border-teal-100 hover:border-teal-200 transition-all hover:shadow-md">
                        <div className="w-8 h-8 bg-teal-600 rounded-lg flex items-center justify-center mb-3">
                          <i className="fas fa-chart-bar text-white text-sm"></i>
                        </div>
                        <h4 className="font-semibold text-gray-900 mb-2">Net Worth Calculator</h4>
                        <p className="text-gray-600 text-sm mb-3">Track how car purchases and loans impact your overall financial health and net worth.</p>
                        <span className="text-teal-600 text-sm font-medium">Calculate Net Worth →</span>
                      </a>

                      <a href="/tools/retirement-calculator" className="block p-6 bg-yellow-50 rounded-lg border border-yellow-100 hover:border-yellow-200 transition-all hover:shadow-md">
                        <div className="w-8 h-8 bg-yellow-600 rounded-lg flex items-center justify-center mb-3">
                          <i className="fas fa-piggy-bank text-white text-sm"></i>
                        </div>
                        <h4 className="font-semibold text-gray-900 mb-2">Retirement Calculator</h4>
                        <p className="text-gray-600 text-sm mb-3">Ensure car loan payments don't compromise long-term retirement savings goals.</p>
                        <span className="text-yellow-600 text-sm font-medium">Plan Retirement →</span>
                      </a>

                      <a href="/tools/salary-to-hourly-calculator" className="block p-6 bg-pink-50 rounded-lg border border-pink-100 hover:border-pink-200 transition-all hover:shadow-md">
                        <div className="w-8 h-8 bg-pink-600 rounded-lg flex items-center justify-center mb-3">
                          <i className="fas fa-dollar-sign text-white text-sm"></i>
                        </div>
                        <h4 className="font-semibold text-gray-900 mb-2">Salary Calculator</h4>
                        <p className="text-gray-600 text-sm mb-3">Convert salary to hourly rates to better understand car payment affordability relative to income.</p>
                        <span className="text-pink-600 text-sm font-medium">Convert Salary →</span>
                      </a>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Currency Information */}
              <div className="mt-8 bg-blue-50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  <i className="fas fa-globe mr-2"></i>
                  Global Auto Financing
                </h3>
                <p className="text-gray-600">
                  This car loan calculator supports major global currencies including USD, EUR, GBP, INR, JPY, CAD, AUD, CNY, BRL, and MXN. 
                  Calculate your auto loan payments regardless of your location for informed car buying decisions worldwide.
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

export default CarLoanCalculator;