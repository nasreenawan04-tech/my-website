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
import { Calculator } from 'lucide-react';

interface CreditCardResult {
  monthlyPayment: number;
  totalPayment: number;
  totalInterest: number;
  timeToPayOff: number;
  interestSavings?: number;
  timeSavings?: number;
}

const CreditCardInterestCalculator = () => {
  const [currentBalance, setCurrentBalance] = useState('');
  const [annualAPR, setAnnualAPR] = useState('');
  const [paymentStrategy, setPaymentStrategy] = useState('minimum');
  const [minimumPayment, setMinimumPayment] = useState('');
  const [fixedPayment, setFixedPayment] = useState('');
  const [targetMonths, setTargetMonths] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [result, setResult] = useState<CreditCardResult | null>(null);

  const calculateCreditCard = () => {
    const balance = parseFloat(currentBalance);
    const apr = parseFloat(annualAPR) / 100;
    const monthlyRate = apr / 12;

    if (balance && apr) {
      let monthlyPayment = 0;
      let totalPayment = 0;
      let totalInterest = 0;
      let months = 0;

      if (paymentStrategy === 'minimum') {
        monthlyPayment = parseFloat(minimumPayment);
      } else if (paymentStrategy === 'fixed') {
        monthlyPayment = parseFloat(fixedPayment);
      } else if (paymentStrategy === 'target') {
        months = parseFloat(targetMonths);
        // Calculate required payment for target months
        if (monthlyRate > 0) {
          monthlyPayment = (balance * monthlyRate * Math.pow(1 + monthlyRate, months)) / (Math.pow(1 + monthlyRate, months) - 1);
        } else {
          monthlyPayment = balance / months;
        }
      }

      if (monthlyPayment > 0) {
        // Calculate payoff time and total payment
        let remainingBalance = balance;
        let totalPaid = 0;
        let monthCount = 0;
        const maxMonths = 600; // 50 years max to prevent infinite loops

        while (remainingBalance > 0.01 && monthCount < maxMonths) {
          const interestPayment = remainingBalance * monthlyRate;
          const principalPayment = Math.min(monthlyPayment - interestPayment, remainingBalance);

          if (principalPayment <= 0) {
            // Payment too low to cover interest
            break;
          }

          remainingBalance -= principalPayment;
          totalPaid += monthlyPayment;
          monthCount++;
        }

        totalPayment = totalPaid;
        totalInterest = totalPayment - balance;
        months = monthCount;

        // Calculate comparison with minimum payment if doing fixed or target
        let interestSavings, timeSavings;
        if (paymentStrategy !== 'minimum' && minimumPayment) {
          const minPayment = parseFloat(minimumPayment);
          let minBalance = balance;
          let minTotalPaid = 0;
          let minMonthCount = 0;

          while (minBalance > 0.01 && minMonthCount < maxMonths) {
            const interestPayment = minBalance * monthlyRate;
            const principalPayment = Math.min(minPayment - interestPayment, minBalance);

            if (principalPayment <= 0) break;

            minBalance -= principalPayment;
            minTotalPaid += minPayment;
            minMonthCount++;
          }

          const minTotalInterest = minTotalPaid - balance;
          interestSavings = minTotalInterest - totalInterest;
          timeSavings = minMonthCount - months;
        }

        setResult({
          monthlyPayment: Math.round(monthlyPayment * 100) / 100,
          totalPayment: Math.round(totalPayment * 100) / 100,
          totalInterest: Math.round(totalInterest * 100) / 100,
          timeToPayOff: months,
          interestSavings: interestSavings ? Math.round(interestSavings * 100) / 100 : undefined,
          timeSavings: timeSavings
        });
      }
    }
  };

  const resetCalculator = () => {
    setCurrentBalance('');
    setAnnualAPR('');
    setPaymentStrategy('minimum');
    setMinimumPayment('');
    setFixedPayment('');
    setTargetMonths('');
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

  const formatTime = (months: number) => {
    const years = Math.floor(months / 12);
    const remainingMonths = months % 12;

    if (years === 0) {
      return `${remainingMonths} month${remainingMonths !== 1 ? 's' : ''}`;
    } else if (remainingMonths === 0) {
      return `${years} year${years !== 1 ? 's' : ''}`;
    } else {
      return `${years} year${years !== 1 ? 's' : ''} ${remainingMonths} month${remainingMonths !== 1 ? 's' : ''}`;
    }
  };

  return (
    <>
      <Helmet>
        <title>Credit Card Interest Calculator - Calculate Credit Card Payoff Time | ToolsHub</title>
        <meta name="description" content="Calculate credit card payoff time, total interest, and monthly payments. Free credit card debt calculator with multiple payment strategies and worldwide currency support." />
        <meta name="keywords" content="credit card calculator, credit card interest calculator, credit card payoff calculator, debt payoff calculator, credit card debt calculator" />
        <meta property="og:title" content="Credit Card Interest Calculator - Calculate Credit Card Payoff Time | ToolsHub" />
        <meta property="og:description" content="Calculate credit card payoff time, total interest, and monthly payments. Free credit card debt calculator with multiple payment strategies and worldwide currency support." />
        <meta property="og:type" content="website" />
        <link rel="canonical" href="/tools/credit-card-interest-calculator" />
      </Helmet>

      <div className="min-h-screen flex flex-col" data-testid="page-credit-card-calculator">
        <Header />

        <main className="flex-1 bg-neutral-50">
          {/* Hero Section */}
          <section className="gradient-hero text-white py-16">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <div className="w-20 h-20 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <i className="fas fa-credit-card text-3xl"></i>
              </div>
              <h1 className="text-4xl sm:text-5xl font-bold mb-6" data-testid="text-page-title">
                Credit Card Interest Calculator
              </h1>
              <p className="text-xl text-blue-100 max-w-2xl mx-auto">
                Calculate credit card payoff time, total interest costs, and find the best payment strategy to become debt-free
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
                      <h2 className="text-2xl font-semibold text-gray-900 mb-8">Credit Card Details</h2>

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

                      {/* Current Balance */}
                      <div className="space-y-3">
                        <Label htmlFor="current-balance" className="text-sm font-medium text-gray-700">
                          Current Credit Card Balance
                        </Label>
                        <Input
                          id="current-balance"
                          type="number"
                          value={currentBalance}
                          onChange={(e) => setCurrentBalance(e.target.value)}
                          className="h-12 text-base border-gray-200 rounded-lg"
                          placeholder="Enter current balance"
                          min="0"
                          step="0.01"
                          data-testid="input-current-balance"
                        />
                      </div>

                      {/* Annual APR */}
                      <div className="space-y-3">
                        <Label htmlFor="annual-apr" className="text-sm font-medium text-gray-700">
                          Annual APR (%)
                        </Label>
                        <Input
                          id="annual-apr"
                          type="number"
                          value={annualAPR}
                          onChange={(e) => setAnnualAPR(e.target.value)}
                          className="h-12 text-base border-gray-200 rounded-lg"
                          placeholder="Enter annual APR"
                          min="0"
                          max="50"
                          step="0.01"
                          data-testid="input-annual-apr"
                        />
                      </div>

                      {/* Payment Strategy */}
                      <div className="space-y-4">
                        <Label className="text-sm font-medium text-gray-700">Payment Strategy</Label>
                        <RadioGroup
                          value={paymentStrategy}
                          onValueChange={setPaymentStrategy}
                          className="space-y-3"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="minimum" id="minimum" data-testid="radio-minimum" />
                            <Label htmlFor="minimum">Minimum Payment Only</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="fixed" id="fixed" data-testid="radio-fixed" />
                            <Label htmlFor="fixed">Fixed Monthly Payment</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="target" id="target" data-testid="radio-target" />
                            <Label htmlFor="target">Pay Off in Target Time</Label>
                          </div>
                        </RadioGroup>
                      </div>

                      {/* Minimum Payment */}
                      {(paymentStrategy === 'minimum' || paymentStrategy === 'fixed' || paymentStrategy === 'target') && (
                        <div className="space-y-3">
                          <Label htmlFor="minimum-payment" className="text-sm font-medium text-gray-700">
                            Minimum Monthly Payment
                          </Label>
                          <Input
                            id="minimum-payment"
                            type="number"
                            value={minimumPayment}
                            onChange={(e) => setMinimumPayment(e.target.value)}
                            className="h-12 text-base border-gray-200 rounded-lg"
                            placeholder="Enter minimum payment"
                            min="0"
                            step="0.01"
                            data-testid="input-minimum-payment"
                          />
                          <p className="text-xs text-gray-500">Usually 2-3% of current balance</p>
                        </div>
                      )}

                      {/* Fixed Payment */}
                      {paymentStrategy === 'fixed' && (
                        <div className="space-y-3">
                          <Label htmlFor="fixed-payment" className="text-sm font-medium text-gray-700">
                            Fixed Monthly Payment
                          </Label>
                          <Input
                            id="fixed-payment"
                            type="number"
                            value={fixedPayment}
                            onChange={(e) => setFixedPayment(e.target.value)}
                            className="h-12 text-base border-gray-200 rounded-lg"
                            placeholder="Enter fixed payment amount"
                            min="0"
                            step="0.01"
                            data-testid="input-fixed-payment"
                          />
                        </div>
                      )}

                      {/* Target Months */}
                      {paymentStrategy === 'target' && (
                        <div className="space-y-3">
                          <Label htmlFor="target-months" className="text-sm font-medium text-gray-700">
                            Target Payoff Time (Months)
                          </Label>
                          <Input
                            id="target-months"
                            type="number"
                            value={targetMonths}
                            onChange={(e) => setTargetMonths(e.target.value)}
                            className="h-12 text-base border-gray-200 rounded-lg"
                            placeholder="Enter target months"
                            min="1"
                            max="600"
                            step="1"
                            data-testid="input-target-months"
                          />
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="flex gap-4 pt-6">
                        <Button
                          onClick={calculateCreditCard}
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
                        <div className="space-y-4" data-testid="credit-card-results">
                          {/* Monthly Payment */}
                          <div className="bg-white rounded-lg p-4 border-l-4 border-blue-500">
                            <div className="flex justify-between items-center">
                              <span className="font-semibold text-gray-700">Monthly Payment</span>
                              <span className="text-2xl font-bold text-blue-600" data-testid="text-monthly-payment">
                                {formatCurrency(result.monthlyPayment)}
                              </span>
                            </div>
                          </div>

                          {/* Payoff Summary */}
                          <div className="space-y-3">
                            <div className="flex justify-between">
                              <span className="text-gray-600">Time to Pay Off</span>
                              <span className="font-semibold" data-testid="text-payoff-time">
                                {formatTime(result.timeToPayOff)}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Total Payment</span>
                              <span className="font-semibold" data-testid="text-total-payment">
                                {formatCurrency(result.totalPayment)}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Total Interest</span>
                              <span className="font-semibold text-red-600" data-testid="text-total-interest">
                                {formatCurrency(result.totalInterest)}
                              </span>
                            </div>
                          </div>

                          {/* Savings Comparison */}
                          {(result.interestSavings !== undefined && result.timeSavings !== undefined) && (
                            <div className="bg-green-50 rounded-lg p-4 space-y-2">
                              <h3 className="font-semibold text-green-800 mb-2">Savings vs Minimum Payment</h3>
                              <div className="flex justify-between">
                                <span className="text-green-600">Interest Savings</span>
                                <span className="font-semibold text-green-600" data-testid="text-interest-savings">
                                  {formatCurrency(result.interestSavings)}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-green-600">Time Savings</span>
                                <span className="font-semibold text-green-600" data-testid="text-time-savings">
                                  {formatTime(result.timeSavings)}
                                </span>
                              </div>
                            </div>
                          )}

                          {/* Interest Rate Warning */}
                          {parseFloat(annualAPR) > 25 && (
                            <div className="bg-orange-50 rounded-lg p-4 border-l-4 border-orange-400">
                              <div className="flex">
                                <i className="fas fa-exclamation-triangle text-orange-400 mr-2 mt-1"></i>
                                <div>
                                  <p className="text-orange-800 font-medium">High Interest Rate</p>
                                  <p className="text-orange-700 text-sm">Consider balance transfer or debt consolidation options to reduce interest costs.</p>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Visual Progress Bar */}
                          <div className="mt-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-3">Interest vs Principal</h3>
                            <div className="space-y-2">
                              <div className="flex items-center">
                                <div
                                  className="h-4 bg-green-500 rounded-l"
                                  style={{ width: `${(parseFloat(currentBalance) / result.totalPayment) * 100}%` }}
                                ></div>
                                <div
                                  className="h-4 bg-red-400 rounded-r"
                                  style={{ width: `${(result.totalInterest / result.totalPayment) * 100}%` }}
                                ></div>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span className="flex items-center">
                                  <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                                  Principal ({Math.round((parseFloat(currentBalance) / result.totalPayment) * 100)}%)
                                </span>
                                <span className="flex items-center">
                                  <div className="w-3 h-3 bg-red-400 rounded-full mr-2"></div>
                                  Interest ({Math.round((result.totalInterest / result.totalPayment) * 100)}%)
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-8" data-testid="no-results">
                          <i className="fas fa-credit-card text-4xl text-gray-400 mb-4"></i>
                          <p className="text-gray-500">Enter credit card details to calculate payoff</p>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Educational Content */}
              <div className="mt-12 space-y-8">
                {/* Understanding Credit Card Interest */}
                <div className="bg-white rounded-2xl shadow-lg p-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-8">Complete Guide to Credit Card Interest Calculator</h2>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-4">How Credit Card Interest Works</h3>
                      <p className="text-gray-600 mb-6 leading-relaxed">
                        Credit card interest is calculated using the Annual Percentage Rate (APR) and is typically compounded daily. When you carry a balance from month to month, you're charged interest on the outstanding amount. Understanding how this interest accumulates is crucial for effective debt management.
                      </p>

                      <h3 className="text-xl font-semibold text-gray-900 mb-4">Key Credit Card Terms</h3>
                      <ul className="text-gray-600 space-y-2">
                        <li>• <strong>APR:</strong> Annual Percentage Rate - the yearly cost of borrowing</li>
                        <li>• <strong>Minimum Payment:</strong> Smallest amount you must pay each month</li>
                        <li>• <strong>Balance Transfer:</strong> Moving debt from one card to another</li>
                        <li>• <strong>Grace Period:</strong> Time before interest is charged on new purchases</li>
                        <li>• <strong>Credit Utilization:</strong> Percentage of available credit being used</li>
                      </ul>
                    </div>

                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-4">Effective Debt Payoff Strategies</h3>
                      <div className="space-y-4">
                        <div className="bg-blue-50 rounded-lg p-4">
                          <h4 className="font-semibold text-blue-800 mb-2">Debt Snowball Method</h4>
                          <p className="text-blue-700 text-sm">Pay minimums on all cards, then put extra money toward the smallest balance first.</p>
                        </div>
                        <div className="bg-green-50 rounded-lg p-4">
                          <h4 className="font-semibold text-green-800 mb-2">Debt Avalanche Method</h4>
                          <p className="text-green-700 text-sm">Pay minimums on all cards, then put extra money toward the highest interest rate first.</p>
                        </div>
                        <div className="bg-purple-50 rounded-lg p-4">
                          <h4 className="font-semibold text-purple-800 mb-2">Balance Transfer</h4>
                          <p className="text-purple-700 text-sm">Move high-interest debt to a card with lower or 0% promotional rate.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Payment Strategies Comparison */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Credit Card Payment Strategies</h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white rounded-lg p-6 shadow-sm">
                      <i className="fas fa-turtle text-2xl text-red-600 mb-4"></i>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Minimum Payment Only</h3>
                      <p className="text-gray-600 text-sm mb-3">
                        Paying only the minimum extends payoff time significantly and maximizes interest costs.
                      </p>
                      <div className="text-sm text-red-600">
                        <div>⚠️ Longest payoff time</div>
                        <div>⚠️ Highest total interest</div>
                        <div>⚠️ Keeps you in debt longer</div>
                      </div>
                    </div>

                    <div className="bg-white rounded-lg p-6 shadow-sm">
                      <i className="fas fa-rocket text-2xl text-blue-600 mb-4"></i>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Fixed Higher Payment</h3>
                      <p className="text-gray-600 text-sm mb-3">
                        Paying a fixed amount above the minimum accelerates payoff and reduces total interest.
                      </p>
                      <div className="text-sm text-blue-600">
                        <div>✓ Predictable timeline</div>
                        <div>✓ Significant interest savings</div>
                        <div>✓ Faster debt freedom</div>
                      </div>
                    </div>

                    <div className="bg-white rounded-lg p-6 shadow-sm">
                      <i className="fas fa-target text-2xl text-green-600 mb-4"></i>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Target Payoff Date</h3>
                      <p className="text-gray-600 text-sm mb-3">
                        Setting a specific payoff date helps you calculate the exact payment needed to achieve your goal.
                      </p>
                      <div className="text-sm text-green-600">
                        <div>✓ Goal-oriented approach</div>
                        <div>✓ Clear timeline</div>
                        <div>✓ Motivational milestone</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Credit Card Types and Interest Rates */}
                <div className="bg-white rounded-2xl shadow-lg p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Understanding Credit Card Types & Interest Rates</h2>
                  <div className="overflow-x-auto">
                    <table className="w-full bg-white rounded-lg shadow-sm">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="px-6 py-4 text-left font-semibold text-gray-900">Card Type</th>
                          <th className="px-6 py-4 text-left font-semibold text-gray-900">Typical APR Range</th>
                          <th className="px-6 py-4 text-left font-semibold text-gray-900">Best For</th>
                          <th className="px-6 py-4 text-left font-semibold text-gray-900">Interest Features</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        <tr>
                          <td className="px-6 py-4 font-semibold text-blue-600">Rewards Cards</td>
                          <td className="px-6 py-4 text-gray-600">16% - 24%</td>
                          <td className="px-6 py-4 text-gray-600">People who pay in full monthly</td>
                          <td className="px-6 py-4 text-gray-600">Higher APR but rewards benefits</td>
                        </tr>
                        <tr>
                          <td className="px-6 py-4 font-semibold text-green-600">Low Interest Cards</td>
                          <td className="px-6 py-4 text-gray-600">12% - 18%</td>
                          <td className="px-6 py-4 text-gray-600">Carrying balances occasionally</td>
                          <td className="px-6 py-4 text-gray-600">Lower APR, fewer rewards</td>
                        </tr>
                        <tr>
                          <td className="px-6 py-4 font-semibold text-purple-600">Balance Transfer Cards</td>
                          <td className="px-6 py-4 text-gray-600">0% - 21% (promotional)</td>
                          <td className="px-6 py-4 text-gray-600">Consolidating existing debt</td>
                          <td className="px-6 py-4 text-gray-600">0% intro APR, then higher rate</td>
                        </tr>
                        <tr>
                          <td className="px-6 py-4 font-semibold text-orange-600">Student Cards</td>
                          <td className="px-6 py-4 text-gray-600">15% - 22%</td>
                          <td className="px-6 py-4 text-gray-600">Building credit history</td>
                          <td className="px-6 py-4 text-gray-600">Moderate APR, educational resources</td>
                        </tr>
                        <tr>
                          <td className="px-6 py-4 font-semibold text-red-600">Secured Cards</td>
                          <td className="px-6 py-4 text-gray-600">18% - 25%</td>
                          <td className="px-6 py-4 text-gray-600">Rebuilding credit</td>
                          <td className="px-6 py-4 text-gray-600">Higher APR, requires deposit</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Credit Card Debt Management Tips */}
                <div className="bg-gray-50 rounded-2xl p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Credit Card Debt Management Tips</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <i className="fas fa-shield-alt text-green-500 mr-2"></i>
                        Prevention Strategies
                      </h3>
                      <ul className="space-y-3">
                        <li className="flex items-start space-x-2">
                          <i className="fas fa-check text-green-500 mt-1"></i>
                          <span className="text-gray-700">Pay off full balance monthly to avoid interest</span>
                        </li>
                        <li className="flex items-start space-x-2">
                          <i className="fas fa-check text-green-500 mt-1"></i>
                          <span className="text-gray-700">Keep credit utilization below 30% of limit</span>
                        </li>
                        <li className="flex items-start space-x-2">
                          <i className="fas fa-check text-green-500 mt-1"></i>
                          <span className="text-gray-700">Set up automatic payments for at least minimum</span>
                        </li>
                        <li className="flex items-start space-x-2">
                          <i className="fas fa-check text-green-500 mt-1"></i>
                          <span className="text-gray-700">Track spending and stay within budget</span>
                        </li>
                        <li className="flex items-start space-x-2">
                          <i className="fas fa-check text-green-500 mt-1"></i>
                          <span className="text-gray-700">Use cash or debit for discretionary purchases</span>
                        </li>
                      </ul>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <i className="fas fa-tools text-blue-500 mr-2"></i>
                        Debt Reduction Tactics
                      </h3>
                      <ul className="space-y-3">
                        <li className="flex items-start space-x-2">
                          <i className="fas fa-arrow-right text-blue-500 mt-1"></i>
                          <span className="text-gray-700">Pay more than minimum whenever possible</span>
                        </li>
                        <li className="flex items-start space-x-2">
                          <i className="fas fa-arrow-right text-blue-500 mt-1"></i>
                          <span className="text-gray-700">Consider balance transfer to lower APR card</span>
                        </li>
                        <li className="flex items-start space-x-2">
                          <i className="fas fa-arrow-right text-blue-500 mt-1"></i>
                          <span className="text-gray-700">Negotiate with credit card company for lower rate</span>
                        </li>
                        <li className="flex items-start space-x-2">
                          <i className="fas fa-arrow-right text-blue-500 mt-1"></i>
                          <span className="text-gray-700">Use windfalls (tax refund, bonus) for payments</span>
                        </li>
                        <li className="flex items-start space-x-2">
                          <i className="fas fa-arrow-right text-blue-500 mt-1"></i>
                          <span className="text-gray-700">Consider debt consolidation loan if rates are lower</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* FAQ Section */}
                <div className="bg-white rounded-2xl shadow-lg p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Frequently Asked Questions</h2>
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">How is credit card interest calculated?</h3>
                      <p className="text-gray-600">
                        Credit card interest is calculated daily using your average daily balance and daily periodic rate (APR ÷ 365). The interest is then added to your balance each month if you carry a balance forward.
                      </p>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">What happens if I only pay the minimum?</h3>
                      <p className="text-gray-600">
                        Paying only the minimum extends your payoff time significantly and maximizes interest costs. For example, a $5,000 balance at 18% APR with $100 minimum payments would take about 7 years to pay off and cost over $3,000 in interest.
                      </p>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Should I pay off credit cards or invest extra money?</h3>
                      <p className="text-gray-600">
                        Generally, it's better to pay off high-interest credit card debt before investing, since credit card interest rates (15-25%) typically exceed average investment returns. Pay off debt first, then focus on investing.
                      </p>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Can I negotiate a lower interest rate?</h3>
                      <p className="text-gray-600">
                        Yes, you can call your credit card company and request a lower APR, especially if you have good payment history, improved credit score, or received better offers from competitors. Success rates vary, but it's worth trying.
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
                  This credit card interest calculator supports major global currencies, making it perfect for international users managing credit card debt in different countries. Interest calculation principles remain the same regardless of currency.
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

export default CreditCardInterestCalculator;