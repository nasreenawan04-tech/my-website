
import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

interface CarLoanResult {
  monthlyPayment: number;
  totalAmount: number;
  totalInterest: number;
  loanAmount: number;
  downPayment: number;
  carPrice: number;
}

export default function CarLoanCalculator() {
  const [carPrice, setCarPrice] = useState('25000');
  const [downPayment, setDownPayment] = useState('');
  const [downPaymentPercent, setDownPaymentPercent] = useState('20');
  const [loanTerm, setLoanTerm] = useState('5');
  const [interestRate, setInterestRate] = useState('4.5');
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
    setCarPrice('25000');
    setDownPayment('');
    setDownPaymentPercent('20');
    setLoanTerm('5');
    setInterestRate('4.5');
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Helmet>
        <title>Car Loan Calculator - Auto Loan Payment Calculator | DapsiWow</title>
        <meta name="description" content="Free car loan calculator to calculate monthly auto loan payments, total interest, and loan costs. Compare different loan terms and down payment scenarios for new and used vehicles with multiple currency support." />
        <meta name="keywords" content="car loan calculator, auto loan calculator, vehicle loan calculator, car payment calculator, auto financing calculator, monthly car payment, car loan EMI calculator, vehicle financing, auto loan EMI, car loan interest calculator" />
        <meta property="og:title" content="Car Loan Calculator - Auto Loan Payment Calculator | DapsiWow" />
        <meta property="og:description" content="Calculate monthly car loan payments, total interest, and loan costs for new and used vehicles. Free auto loan calculator with down payment analysis." />
        <meta property="og:type" content="website" />
        <meta name="robots" content="index, follow" />
        <meta name="author" content="DapsiWow" />
        <link rel="canonical" href="https://dapsiwow.com/tools/car-loan-calculator" />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            "name": "Car Loan Calculator",
            "description": "Free online car loan calculator to calculate monthly auto loan payments, total interest cost, and loan affordability for new and used vehicles.",
            "url": "https://dapsiwow.com/tools/car-loan-calculator",
            "applicationCategory": "FinanceApplication",
            "operatingSystem": "Any",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "USD"
            },
            "featureList": [
              "Monthly car payment calculations",
              "Total interest cost analysis",
              "Down payment optimization",
              "Multiple currency support",
              "New and used vehicle financing",
              "Loan term comparison"
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
                <span className="text-sm font-medium text-blue-700">Professional Auto Loan Calculator</span>
              </div>
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-slate-900 leading-tight">
                Smart Car Loan
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                  Calculator
                </span>
              </h1>
              <p className="text-xl sm:text-2xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
                Calculate monthly car payments, total interest, and find the perfect financing solution for your vehicle purchase
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
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">Loan Configuration</h2>
                    <p className="text-gray-600">Enter your vehicle details to get accurate payment calculations</p>
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

                    {/* Car Price */}
                    <div className="space-y-3">
                      <Label htmlFor="car-price" className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                        Vehicle Price
                      </Label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-lg">$</span>
                        <Input
                          id="car-price"
                          type="number"
                          value={carPrice}
                          onChange={(e) => setCarPrice(e.target.value)}
                          className="h-14 pl-8 text-lg border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-blue-500"
                          placeholder="25,000"
                          min="0"
                          step="100"
                          data-testid="input-car-price"
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
                          placeholder="4.5"
                          step="0.01"
                          min="0"
                          max="30"
                          data-testid="input-interest-rate"
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 text-lg">%</span>
                      </div>
                    </div>

                    {/* Loan Term */}
                    <div className="space-y-3">
                      <Label className="text-sm font-semibold text-gray-800 uppercase tracking-wide">Loan Term</Label>
                      <div className="grid grid-cols-2 gap-3">
                        <Input
                          type="number"
                          value={loanTerm}
                          onChange={(e) => setLoanTerm(e.target.value)}
                          className="h-14 text-lg border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-blue-500"
                          placeholder="5"
                          min="1"
                          max="10"
                          data-testid="input-loan-term"
                        />
                        <Select value="years" onValueChange={() => {}}>
                          <SelectTrigger className="h-14 border-2 border-gray-200 rounded-xl text-lg" data-testid="select-loan-term">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="years">Years</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  {/* Down Payment Options */}
                  <div className="space-y-6 border-t pt-8">
                    <h3 className="text-xl font-bold text-gray-900">Down Payment Options</h3>
                    
                    <div className="space-y-4 bg-gray-50 rounded-xl p-6">
                      <div className="space-y-3">
                        <Label>Down Payment Type</Label>
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
                              className="h-14 pr-8 text-lg border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-blue-500"
                              placeholder="20"
                              min="0"
                              max="100"
                              step="0.1"
                              data-testid="input-down-payment-percent"
                            />
                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 text-lg">%</span>
                          </div>
                        ) : (
                          <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-lg">$</span>
                            <Input
                              type="number"
                              value={downPayment}
                              onChange={(e) => setDownPayment(e.target.value)}
                              className="h-14 pl-8 text-lg border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-blue-500"
                              placeholder="5,000"
                              min="0"
                              data-testid="input-down-payment-amount"
                            />
                          </div>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">
                        A larger down payment reduces your monthly payment and total interest paid over the loan term.
                      </p>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-4 pt-6">
                    <Button
                      onClick={calculateCarLoan}
                      className="flex-1 h-14 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold text-lg rounded-xl shadow-lg transform transition-all duration-200 hover:scale-105"
                      data-testid="button-calculate"
                    >
                      Calculate Payment
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
                </div>

                {/* Results Section */}
                <div className="bg-gradient-to-br from-gray-50 to-blue-50 p-8 lg:p-12">
                  <h2 className="text-2xl font-bold text-gray-900 mb-8">Payment Results</h2>
                  
                  {result ? (
                    <div className="space-y-6" data-testid="car-loan-results">
                      {/* Monthly Payment Highlight */}
                      <div className="bg-white rounded-2xl p-6 shadow-lg border border-blue-100">
                        <div className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-2">Monthly Payment</div>
                        <div className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600" data-testid="text-monthly-payment">
                          {formatCurrency(result.monthlyPayment)}
                        </div>
                      </div>

                      {/* Payment Breakdown */}
                      <div className="space-y-4">
                        <div className="bg-white rounded-xl p-4 shadow-sm">
                          <div className="flex justify-between items-center">
                            <span className="font-medium text-gray-700">Vehicle Price</span>
                            <span className="font-bold text-gray-900" data-testid="text-car-price">
                              {formatCurrency(result.carPrice)}
                            </span>
                          </div>
                        </div>
                        <div className="bg-white rounded-xl p-4 shadow-sm">
                          <div className="flex justify-between items-center">
                            <span className="font-medium text-gray-700">Down Payment</span>
                            <span className="font-bold text-green-600" data-testid="text-down-payment">
                              {formatCurrency(result.downPayment)}
                            </span>
                          </div>
                        </div>
                        <div className="bg-white rounded-xl p-4 shadow-sm">
                          <div className="flex justify-between items-center">
                            <span className="font-medium text-gray-700">Loan Amount</span>
                            <span className="font-bold text-gray-900" data-testid="text-loan-amount">
                              {formatCurrency(result.loanAmount)}
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

                      {/* Visual Breakdown */}
                      <div className="bg-white rounded-xl p-6 shadow-sm">
                        <h4 className="font-bold text-gray-900 mb-4 text-lg">Payment Breakdown</h4>
                        <div className="space-y-3">
                          <div className="flex items-center h-6 bg-gray-200 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-blue-500 transition-all duration-1000 ease-out"
                              style={{ width: `${(result.loanAmount / result.totalAmount) * 100}%` }}
                            ></div>
                            <div 
                              className="h-full bg-orange-400 transition-all duration-1000 ease-out"
                              style={{ width: `${(result.totalInterest / result.totalAmount) * 100}%` }}
                            ></div>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="flex items-center">
                              <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                              Principal ({Math.round((result.loanAmount / result.totalAmount) * 100)}%)
                            </span>
                            <span className="flex items-center">
                              <div className="w-3 h-3 bg-orange-400 rounded-full mr-2"></div>
                              Interest ({Math.round((result.totalInterest / result.totalAmount) * 100)}%)
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Affordability Tips */}
                      <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
                        <h4 className="font-bold text-green-800 mb-4 text-lg">Smart Financing Tips</h4>
                        <div className="space-y-3 text-sm text-green-700">
                          <div className="flex items-start gap-3">
                            <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                            <span>Keep total vehicle costs under 20% of take-home pay</span>
                          </div>
                          <div className="flex items-start gap-3">
                            <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                            <span>Consider insurance, maintenance, and fuel costs</span>
                          </div>
                          <div className="flex items-start gap-3">
                            <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                            <span>Larger down payment reduces monthly burden</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-16" data-testid="no-results">
                      <div className="w-20 h-20 bg-gray-200 rounded-full mx-auto mb-6 flex items-center justify-center">
                        <div className="text-3xl font-bold text-gray-400">🚗</div>
                      </div>
                      <p className="text-gray-500 text-lg">Enter vehicle details and calculate to see payment breakdown</p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* SEO Content Section */}
          <div className="mt-16 grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">What is a Car Loan Calculator?</h3>
                <div className="space-y-4 text-gray-600">
                  <p>
                    A car loan calculator is an essential financial tool that helps you determine the monthly payment, 
                    total interest cost, and overall affordability of purchasing a vehicle through financing. Our advanced 
                    auto loan calculator uses precise mathematical formulas to provide accurate estimates based on your 
                    loan amount, interest rate, loan term, and down payment.
                  </p>
                  <p>
                    Whether you're buying a new car, used vehicle, or considering auto refinancing, this calculator 
                    enables you to compare different financing scenarios and make informed decisions about your car purchase. 
                    It helps you understand the true cost of borrowing and plan your budget effectively.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">How to Calculate Car Loan Payments?</h3>
                <div className="space-y-4 text-gray-600">
                  <p>
                    Car loan payments are calculated using the standard amortization formula: 
                    M = P × [r(1+r)^n] / [(1+r)^n-1]
                  </p>
                  <ul className="space-y-2 list-disc list-inside">
                    <li>M = Monthly payment amount</li>
                    <li>P = Principal loan amount (car price - down payment)</li>
                    <li>r = Monthly interest rate (annual rate ÷ 12)</li>
                    <li>n = Number of payments (loan term in months)</li>
                  </ul>
                  <p>
                    Our calculator automatically applies this formula and provides additional insights like total 
                    interest payable and payment breakdowns to help you make the best financing decision.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Features of Our Car Loan Calculator</h3>
                <div className="space-y-3 text-gray-600">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Support for 10+ international currencies</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Flexible down payment options (percentage or amount)</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Comprehensive payment breakdown visualization</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Accurate calculations for new and used vehicles</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Smart financing tips and affordability guidance</span>
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
                    <span>Make informed vehicle purchasing decisions</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Compare financing options from different lenders</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Understand the impact of down payments</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Plan your monthly budget effectively</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Free to use with instant calculations</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Additional SEO Content Sections */}
          <div className="mt-12 space-y-8">
            {/* Types of Car Loans Section */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Types of Auto Loans and Financing Options</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-gray-800">New Car Loans</h4>
                    <p className="text-gray-600">
                      New vehicle loans typically offer the lowest interest rates and longest repayment terms. 
                      Manufacturers often provide promotional financing with 0% APR for qualified buyers. 
                      These loans can extend up to 84 months, reducing monthly payments but increasing total interest cost.
                    </p>
                  </div>
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-gray-800">Used Car Loans</h4>
                    <p className="text-gray-600">
                      Used vehicle financing generally has higher interest rates than new car loans but shorter terms. 
                      The age and mileage of the vehicle affect loan terms and rates. Certified pre-owned vehicles 
                      may qualify for better financing options similar to new cars.
                    </p>
                  </div>
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-gray-800">Refinancing Loans</h4>
                    <p className="text-gray-600">
                      Auto refinancing allows you to replace your current car loan with a new one at better terms. 
                      This can lower your monthly payment, reduce interest rate, or change loan duration. 
                      Best when your credit has improved or market rates have decreased.
                    </p>
                  </div>
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-gray-800">Lease vs Buy</h4>
                    <p className="text-gray-600">
                      Leasing offers lower monthly payments but no ownership. Buying builds equity and allows 
                      unlimited mileage. Consider your driving habits, financial goals, and preference for 
                      latest technology when choosing between leasing and purchasing.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Factors Affecting Car Loans */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
                <CardContent className="p-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">Factors Affecting Car Loan Terms</h3>
                  <div className="space-y-4 text-gray-600">
                    <div className="border-l-4 border-blue-500 pl-4">
                      <h4 className="font-semibold text-gray-800 mb-2">Credit Score Impact</h4>
                      <p className="text-sm">Excellent credit (750+) qualifies for the best rates, while poor credit may require higher down payments and interest rates. Check your credit report before applying.</p>
                    </div>
                    <div className="border-l-4 border-green-500 pl-4">
                      <h4 className="font-semibold text-gray-800 mb-2">Down Payment Benefits</h4>
                      <p className="text-sm">Larger down payments reduce loan amount, monthly payments, and may qualify you for better interest rates. Aim for 20% down on new cars, 10% on used.</p>
                    </div>
                    <div className="border-l-4 border-orange-500 pl-4">
                      <h4 className="font-semibold text-gray-800 mb-2">Loan Term Selection</h4>
                      <p className="text-sm">Shorter terms mean higher monthly payments but less total interest. Longer terms reduce monthly burden but increase total cost and risk of being underwater.</p>
                    </div>
                    <div className="border-l-4 border-purple-500 pl-4">
                      <h4 className="font-semibold text-gray-800 mb-2">Vehicle Age & Value</h4>
                      <p className="text-sm">Newer vehicles qualify for better rates and longer terms. Older cars may have restrictions on loan terms and require higher interest rates due to depreciation risk.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
                <CardContent className="p-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">Car Buying Strategies</h3>
                  <div className="space-y-4 text-gray-600">
                    <div className="bg-blue-50 rounded-lg p-4">
                      <h4 className="font-semibold text-blue-800 mb-2">Research Before Shopping</h4>
                      <p className="text-sm text-blue-700">Know the vehicle's market value, typical interest rates for your credit score, and get pre-approved for financing to strengthen your negotiating position.</p>
                    </div>
                    <div className="bg-green-50 rounded-lg p-4">
                      <h4 className="font-semibold text-green-800 mb-2">Shop Around for Financing</h4>
                      <p className="text-sm text-green-700">Compare rates from banks, credit unions, and dealer financing. Credit unions often offer competitive rates, especially for members with good credit.</p>
                    </div>
                    <div className="bg-orange-50 rounded-lg p-4">
                      <h4 className="font-semibold text-orange-800 mb-2">Negotiate Total Price, Not Payment</h4>
                      <p className="text-sm text-orange-700">Focus on the vehicle's total price first, then discuss financing. Dealers may manipulate monthly payments by extending loan terms.</p>
                    </div>
                    <div className="bg-purple-50 rounded-lg p-4">
                      <h4 className="font-semibold text-purple-800 mb-2">Consider Total Cost of Ownership</h4>
                      <p className="text-sm text-purple-700">Factor in insurance, maintenance, fuel costs, and depreciation. A cheaper monthly payment might cost more overall if the vehicle is unreliable.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Car Loan FAQs Section */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-8">Frequently Asked Questions about Car Loans</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">What's the ideal loan term for a car loan?</h4>
                      <p className="text-gray-600 text-sm">For new cars, 36-60 months balances affordability with total cost. Used cars should be financed for shorter terms to avoid being underwater on the loan. Avoid terms longer than 72 months unless absolutely necessary.</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">Can I pay off my car loan early?</h4>
                      <p className="text-gray-600 text-sm">Most car loans allow early payoff without penalties. Making extra principal payments or paying off early can save significant interest, especially early in the loan term when interest makes up more of your payment.</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">What credit score do I need for a car loan?</h4>
                      <p className="text-gray-600 text-sm">While you can get approved with scores as low as 500, scores above 700 qualify for the best rates. Scores between 600-699 get decent rates, while below 600 may require higher down payments and interest rates.</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">Should I finance through the dealer or my bank?</h4>
                      <p className="text-gray-600 text-sm">Shop both options. Dealers may offer promotional rates or manufacturer incentives, but banks and credit unions often provide competitive rates with better customer service. Get pre-approved to compare offers.</p>
                    </div>
                  </div>
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">What's the difference between APR and interest rate?</h4>
                      <p className="text-gray-600 text-sm">Interest rate is the cost of borrowing money. APR includes the interest rate plus additional fees like origination fees, making it a more accurate representation of the total loan cost. Always compare APRs.</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">How much should I put down on a car?</h4>
                      <p className="text-gray-600 text-sm">Aim for 20% down on new cars and 10% on used cars. This reduces monthly payments, may qualify you for better rates, and helps avoid being underwater on the loan if the car depreciates quickly.</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">What happens if I can't make my car payment?</h4>
                      <p className="text-gray-600 text-sm">Contact your lender immediately to discuss options like payment deferral or loan modification. Missing payments damages your credit and can lead to repossession, where the lender takes back the vehicle.</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">Can I trade in a car with an outstanding loan?</h4>
                      <p className="text-gray-600 text-sm">Yes, if the trade value exceeds the loan balance, the difference goes toward your new car. If you owe more than the car's worth (underwater), you'll need to pay the difference or roll it into your new loan.</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Interest Rate Comparison */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
                <CardContent className="p-8">
                  <h3 className="text-xl font-bold text-gray-900 mb-6">New Car Financing</h3>
                  <div className="space-y-4 text-gray-600">
                    <p className="text-sm">
                      New vehicle loans offer the most favorable terms with manufacturer incentives and promotional rates.
                    </p>
                    <div className="space-y-2">
                      <h4 className="font-semibold text-green-800 text-sm">Typical Features:</h4>
                      <ul className="text-xs space-y-1 list-disc list-inside text-green-700">
                        <li>Interest rates: 2.9% - 7.5% APR</li>
                        <li>Loan terms: 24 - 84 months</li>
                        <li>Down payment: 0% - 20%</li>
                        <li>Manufacturer incentives available</li>
                        <li>Gap insurance recommended</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
                <CardContent className="p-8">
                  <h3 className="text-xl font-bold text-gray-900 mb-6">Used Car Financing</h3>
                  <div className="space-y-4 text-gray-600">
                    <p className="text-sm">
                      Used vehicle loans have slightly higher rates but can offer excellent value for reliable pre-owned cars.
                    </p>
                    <div className="space-y-2">
                      <h4 className="font-semibold text-blue-800 text-sm">Typical Features:</h4>
                      <ul className="text-xs space-y-1 list-disc list-inside text-blue-700">
                        <li>Interest rates: 4.5% - 12% APR</li>
                        <li>Loan terms: 24 - 72 months</li>
                        <li>Down payment: 10% - 25%</li>
                        <li>Vehicle age restrictions may apply</li>
                        <li>Shorter terms recommended</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
                <CardContent className="p-8">
                  <h3 className="text-xl font-bold text-gray-900 mb-6">Certified Pre-Owned</h3>
                  <div className="space-y-4 text-gray-600">
                    <p className="text-sm">
                      CPO vehicles offer warranty protection and often qualify for new car financing rates and terms.
                    </p>
                    <div className="space-y-2">
                      <h4 className="font-semibold text-purple-800 text-sm">Typical Features:</h4>
                      <ul className="text-xs space-y-1 list-disc list-inside text-purple-700">
                        <li>Interest rates: 3.5% - 8.5% APR</li>
                        <li>Loan terms: 36 - 75 months</li>
                        <li>Down payment: 5% - 20%</li>
                        <li>Extended warranty included</li>
                        <li>Lower rates than regular used cars</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Common Mistakes Section */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Common Car Loan Mistakes to Avoid</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-r-lg">
                      <h4 className="font-semibold text-red-800 mb-2">Focusing Only on Monthly Payment</h4>
                      <p className="text-red-700 text-sm">Dealers can manipulate monthly payments by extending loan terms. Always consider the total cost of the loan, not just the monthly payment amount.</p>
                    </div>
                    <div className="bg-orange-50 border-l-4 border-orange-400 p-4 rounded-r-lg">
                      <h4 className="font-semibold text-orange-800 mb-2">Not Getting Pre-Approved</h4>
                      <p className="text-orange-700 text-sm">Shopping without pre-approval weakens your negotiating position. Get financing lined up before visiting dealerships to compare offers and lock in rates.</p>
                    </div>
                    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-lg">
                      <h4 className="font-semibold text-yellow-800 mb-2">Choosing Excessively Long Terms</h4>
                      <p className="text-yellow-700 text-sm">While 84-month loans lower payments, they increase total interest and keep you underwater longer. Stick to shorter terms when possible.</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-lg">
                      <h4 className="font-semibold text-blue-800 mb-2">Ignoring Total Cost of Ownership</h4>
                      <p className="text-blue-700 text-sm">Consider insurance, maintenance, fuel, and depreciation costs. A luxury car with low payments might cost more overall than a reliable economy vehicle.</p>
                    </div>
                    <div className="bg-purple-50 border-l-4 border-purple-400 p-4 rounded-r-lg">
                      <h4 className="font-semibold text-purple-800 mb-2">Not Shopping Around for Rates</h4>
                      <p className="text-purple-700 text-sm">Different lenders offer varying rates and terms. Check banks, credit unions, and online lenders in addition to dealer financing before deciding.</p>
                    </div>
                    <div className="bg-green-50 border-l-4 border-green-400 p-4 rounded-r-lg">
                      <h4 className="font-semibold text-green-800 mb-2">Skipping the Pre-Purchase Inspection</h4>
                      <p className="text-green-700 text-sm">For used cars, always get an independent inspection. Financing a car with hidden problems can lead to expensive repairs on top of loan payments.</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Money-Saving Tips Section */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Smart Car Financing Tips to Save Money</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-gray-800">Before You Buy</h4>
                    <div className="space-y-3 text-gray-600">
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-sm">Improve your credit score for better rates - even 50 points can save thousands</span>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-sm">Save for a larger down payment to reduce loan amount and interest</span>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-sm">Research vehicle reliability and resale value before choosing</span>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-sm">Get pre-approved from multiple lenders to compare rates</span>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-gray-800">During the Loan</h4>
                    <div className="space-y-3 text-gray-600">
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-sm">Make extra principal payments when possible to reduce interest</span>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-sm">Consider refinancing if rates drop or your credit improves</span>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-sm">Set up automatic payments to avoid late fees and maintain good standing</span>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-sm">Maintain the vehicle properly to preserve its value</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
                  <h4 className="font-semibold text-blue-800 mb-2">Pro Tip</h4>
                  <p className="text-blue-700 text-sm">
                    Use our car loan calculator to test different scenarios. Compare how changes in down payment, 
                    loan term, and interest rate affect your total cost. This helps you find the optimal balance 
                    between monthly affordability and total loan cost.
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
