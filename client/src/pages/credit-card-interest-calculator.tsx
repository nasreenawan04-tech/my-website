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
        <title>Credit Card Interest Calculator</title>
      </Helmet>

      <div className="min-h-screen flex flex-col" data-testid="page-credit-card-calculator">
        <Header />

        <main className="flex-1 bg-neutral-50">
          {/* Hero Section */}
          <section className="gradient-hero text-white py-16">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
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

              
            </div>
          </section>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default CreditCardInterestCalculator;