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

interface HomeLoanResult {
  emi: number;
  totalAmount: number;
  totalInterest: number;
  principalAmount: number;
  interestPercentage: number;
}

const HomeLoanCalculator = () => {
  const [loanAmount, setLoanAmount] = useState('');
  const [interestRate, setInterestRate] = useState('');
  const [loanTenure, setLoanTenure] = useState('');
  const [tenureType, setTenureType] = useState('years');
  const [processingFee, setProcessingFee] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [result, setResult] = useState<HomeLoanResult | null>(null);

  const calculateHomeLoan = () => {
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
        interestPercentage: Math.round(interestPercentage * 100) / 100
      });
    } else if (principal && rate === 0 && tenure) {
      // Handle 0% interest rate
      const emi = principal / tenure;
      const totalAmount = principal;

      setResult({
        emi: Math.round(emi * 100) / 100,
        totalAmount: Math.round(totalAmount * 100) / 100,
        totalInterest: 0,
        principalAmount: principal,
        interestPercentage: 0
      });
    }
  };

  const resetCalculator = () => {
    setLoanAmount('');
    setInterestRate('');
    setLoanTenure('');
    setTenureType('years');
    setProcessingFee('');
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

  const calculateProcessingFee = () => {
    const fee = parseFloat(processingFee) || 0;
    return fee;
  };

  return (
    <>
      <Helmet>
        <title>Home Loan Calculator - Calculate Home Loan EMI | DapsiWow</title>
        <meta name="description" content="Free home loan EMI calculator to calculate monthly home loan payments, total interest, and loan costs. Plan your home purchase with accurate estimates." />
        <meta name="keywords" content="home loan calculator, home loan EMI, mortgage EMI calculator, housing loan calculator, property loan calculator, home finance, mortgage payments, real estate investment, loan EMI, loan payment calculator" />
        <meta property="og:title" content="Home Loan Calculator - Calculate Home Loan EMI | DapsiWow" />
        <meta property="og:description" content="Free home loan EMI calculator to calculate monthly home loan payments, total interest, and loan costs. Plan your home purchase with accurate estimates." />
        <meta property="og:type" content="website" />
        <link rel="canonical" href="/tools/home-loan-calculator" />
      </Helmet>

      <div className="min-h-screen flex flex-col" data-testid="page-home-loan-calculator">
        <Header />

        <main className="flex-1 bg-neutral-50">
          {/* Hero Section */}
          <section className="gradient-hero text-white py-16">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <div className="w-20 h-20 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <i className="fas fa-house-user text-3xl"></i>
              </div>
              <h1 className="text-4xl sm:text-5xl font-bold mb-6" data-testid="text-page-title">
                Home Loan Calculator
              </h1>
              <p className="text-xl text-blue-100 max-w-2xl mx-auto">
                Calculate your home loan EMI, total interest, and monthly payments for informed home buying decisions
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
                      <h2 className="text-2xl font-semibold text-gray-900 mb-8">Home Loan Details</h2>

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
                          Home Loan Amount
                        </Label>
                        <Input
                          id="loan-amount"
                          type="number"
                          value={loanAmount}
                          onChange={(e) => setLoanAmount(e.target.value)}
                          className="h-12 text-base border-gray-200 rounded-lg"
                          placeholder="Enter loan amount"
                          min="0"
                          step="1000"
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

                      {/* Loan Tenure */}
                      <div className="space-y-3">
                        <Label className="text-sm font-medium text-gray-700">Loan Tenure</Label>
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

                      {/* Processing Fee */}
                      <div className="space-y-3">
                        <Label htmlFor="processing-fee" className="text-sm font-medium text-gray-700">
                          Processing Fee (Optional)
                        </Label>
                        <Input
                          id="processing-fee"
                          type="number"
                          value={processingFee}
                          onChange={(e) => setProcessingFee(e.target.value)}
                          className="h-12 text-base border-gray-200 rounded-lg"
                          placeholder="Enter processing fee"
                          min="0"
                          step="100"
                          data-testid="input-processing-fee"
                        />
                        <p className="text-xs text-muted-foreground">
                          One-time fee charged by the lender for processing your loan
                        </p>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-4 pt-6">
                        <Button
                          onClick={calculateHomeLoan}
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
                      <h2 className="text-2xl font-semibold text-gray-900 mb-8">EMI Calculation Results</h2>

                      {result ? (
                        <div className="space-y-4" data-testid="home-loan-results">
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
                            {calculateProcessingFee() > 0 && (
                              <div className="flex justify-between">
                                <span className="text-gray-600">Processing Fee</span>
                                <span className="font-semibold text-orange-600" data-testid="text-processing-fee">
                                  {formatCurrency(calculateProcessingFee())}
                                </span>
                              </div>
                            )}
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

                          {/* Affordability Info */}
                          <div className="bg-yellow-50 rounded-lg p-4 mt-4">
                            <h4 className="font-semibold text-gray-700 mb-2">🏠 Home Loan Guidelines</h4>
                            <div className="text-sm text-gray-600 space-y-1">
                              <p>• EMI should not exceed 40% of monthly income</p>
                              <p>• Consider property taxes and maintenance costs</p>
                              <p>• Factor in home insurance premiums</p>
                              <p>• Keep emergency fund for 6-12 months of EMI</p>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-8" data-testid="no-results">
                          <i className="fas fa-house-user text-4xl text-gray-400 mb-4"></i>
                          <p className="text-gray-500">Enter home loan details to calculate EMI</p>
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

export default HomeLoanCalculator;