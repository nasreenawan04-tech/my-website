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
        <title>Home Loan Calculator - Calculate Home Loan EMI | ToolForge</title>
        <meta name="description" content="Free home loan EMI calculator to calculate monthly home loan payments, total interest, and loan costs. Plan your home purchase with accurate estimates." />
        <meta name="keywords" content="home loan calculator, home loan EMI, mortgage EMI calculator, housing loan calculator, property loan calculator, home finance, mortgage payments, real estate investment, loan EMI, loan payment calculator" />
        <meta property="og:title" content="Home Loan Calculator - Calculate Home Loan EMI | ToolForge" />
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

              {/* What is a Home Loan Calculator Section */}
              <Card className="mt-12 bg-white border-0 shadow-sm">
                <CardContent className="p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">What is a Home Loan Calculator?</h2>
                  <div className="prose max-w-none text-gray-600">
                    <p className="mb-4">
                      A home loan calculator is an essential financial planning tool that helps you estimate your monthly mortgage payments, 
                      total interest costs, and overall loan expenses before purchasing a property. Our free online home loan EMI calculator 
                      uses advanced algorithms to compute accurate payment schedules based on your loan amount, interest rate, and repayment tenure.
                    </p>
                    <p className="mb-4">
                      Whether you're a first-time homebuyer, looking to refinance your existing mortgage, or planning to invest in real estate, 
                      this housing loan calculator provides instant, reliable estimates to help you make informed property investment decisions. 
                      The calculator uses the standard EMI formula: EMI = [P x R x (1+R)^N] / [(1+R)^N - 1], where P is principal, R is monthly interest rate, and N is tenure.
                      For more detailed mortgage calculations, explore our <a href="/tools/mortgage-calculator" className="text-blue-600 hover:underline">Mortgage Calculator</a>.
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* How to Use Home Loan Calculator Section */}
              <Card className="mt-8 bg-white border-0 shadow-sm">
                <CardContent className="p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">How to Use Our Home Loan Calculator</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Step-by-Step Process</h3>
                      <ol className="text-gray-600 space-y-2 list-decimal list-inside">
                        <li>Select your preferred currency from 10+ global options</li>
                        <li>Enter the total home loan amount you need</li>
                        <li>Input the annual interest rate offered by your lender</li>
                        <li>Choose loan tenure in years or months</li>
                        <li>Add processing fees if applicable (optional)</li>
                        <li>Click "Calculate" to get instant EMI results</li>
                      </ol>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">What You'll Get</h3>
                      <ul className="text-gray-600 space-y-2">
                        <li>• Monthly EMI payment amount</li>
                        <li>• Total interest payable over loan tenure</li>
                        <li>• Complete payment breakdown</li>
                        <li>• Principal vs interest ratio visualization</li>
                        <li>• Interest percentage of total payment</li>
                        <li>• Processing fee calculations</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Benefits and Use Cases Section */}
              <Card className="mt-8 bg-white border-0 shadow-sm">
                <CardContent className="p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Benefits and Use Cases of Home Loan Calculator</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="bg-blue-50 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">🏠 First-Time Homebuyers</h3>
                      <p className="text-gray-600 text-sm">
                        Plan your budget, understand affordability, and compare different loan options before making your first property purchase. 
                        Determine how much house you can afford with different down payment scenarios.
                      </p>
                    </div>
                    <div className="bg-green-50 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">🔄 Loan Refinancing</h3>
                      <p className="text-gray-600 text-sm">
                        Compare your current mortgage payments with potential refinancing options. Calculate savings from lower interest rates 
                        and decide if refinancing makes financial sense for your situation. For detailed comparison, use our <a href="/tools/mortgage-calculator" className="text-blue-600 hover:underline">Mortgage Calculator</a>.
                      </p>
                    </div>
                    <div className="bg-purple-50 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">📊 Investment Planning</h3>
                      <p className="text-gray-600 text-sm">
                        Analyze rental property investments by calculating mortgage costs versus potential rental income. 
                        Make informed decisions about real estate investment opportunities. Use our <a href="/tools/roi-calculator" className="text-blue-600 hover:underline">ROI calculator</a> to assess profitability.
                      </p>
                    </div>
                    <div className="bg-orange-50 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">💰 Budget Planning</h3>
                      <p className="text-gray-600 text-sm">
                        Understand your monthly financial commitments and plan your household budget effectively. 
                        Ensure your EMI fits comfortably within your income and expense structure. Our <a href="/tools/personal-budget-calculator" className="text-blue-600 hover:underline">personal budget calculator</a> can help.
                      </p>
                    </div>
                    <div className="bg-teal-50 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">⚖️ Loan Comparison</h3>
                      <p className="text-gray-600 text-sm">
                        Compare offers from multiple lenders by analyzing EMIs, total interest costs, and processing fees. 
                        Choose the most cost-effective home loan option for your needs. Our <a href="/tools/loan-calculator" className="text-blue-600 hover:underline">Loan Calculator</a> is ideal for this.
                      </p>
                    </div>
                    <div className="bg-yellow-50 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">📈 Financial Planning</h3>
                      <p className="text-gray-600 text-sm">
                        Integrate home loan payments into your long-term financial planning. 
                        Understand the impact of property purchase on your overall financial goals and retirement planning. Use our <a href="/tools/retirement-calculator" className="text-blue-600 hover:underline">Retirement Calculator</a>.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Key Features Section */}
              <Card className="mt-8 bg-white border-0 shadow-sm">
                <CardContent className="p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Key Features of Our Home Loan EMI Calculator</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">🌍 Multi-Currency Support</h3>
                      <p className="text-gray-600 mb-4">
                        Calculate home loan EMIs in 10+ major global currencies including USD, EUR, GBP, INR, JPY, CAD, AUD, CNY, BRL, and MXN. 
                        Perfect for international property investments or expatriate home purchases.
                      </p>

                      <h3 className="text-lg font-semibold text-gray-900 mb-4">📱 Mobile-Friendly Design</h3>
                      <p className="text-gray-600 mb-4">
                        Access our home loan calculator from any device - desktop, tablet, or smartphone. 
                        The responsive design ensures accurate calculations and easy navigation on all screen sizes.
                      </p>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">🔢 Accurate Calculations</h3>
                      <p className="text-gray-600 mb-4">
                        Uses industry-standard EMI formulas for precise calculations. Includes processing fees, 
                        displays principal vs interest breakdown, and provides comprehensive payment analysis.
                      </p>

                      <h3 className="text-lg font-semibold text-gray-900 mb-4">⚡ Instant Results</h3>
                      <p className="text-gray-600 mb-4">
                        Get immediate EMI calculations without waiting. Real-time updates as you modify loan parameters, 
                        allowing you to experiment with different scenarios and find the best loan structure.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Educational Content */}
              <Card className="mt-8 bg-white border-0 shadow-sm">
                <CardContent className="p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Complete Home Loan Guide</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Before Applying for Home Loan</h3>
                      <ul className="text-gray-600 space-y-2 mb-6">
                        <li>• Check and improve your credit score (750+ recommended)</li>
                        <li>• Gather income documents, tax returns, and bank statements</li>
                        <li>• Research property values and market trends</li>
                        <li>• Save for down payment (typically 10-20% of property value)</li>
                        <li>• Get pre-approval to understand your borrowing capacity</li>
                        <li>• Compare interest rates from multiple lenders</li>
                      </ul>

                      <h3 className="text-lg font-semibold text-gray-900 mb-3">EMI Planning Guidelines</h3>
                      <ul className="text-gray-600 space-y-2">
                        <li>• Follow the 40% rule - EMI ≤ 40% of monthly income</li>
                        <li>• Consider all housing costs (maintenance, taxes, insurance)</li>
                        <li>• Maintain emergency fund for 6-12 months of EMI payments</li>
                        <li>• Account for property taxes and homeowner's insurance</li>
                        <li>• Plan for future income changes and job stability</li>
                      </ul>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Important Loan Features</h3>
                      <ul className="text-gray-600 space-y-2 mb-6">
                        <li>• <strong>Fixed Rate:</strong> Stable payments, higher initial rate</li>
                        <li>• <strong>Floating Rate:</strong> Variable payments, market-linked rates</li>
                        <li>• <strong>Prepayment:</strong> Check charges for early payments</li>
                        <li>• <strong>Processing Fees:</strong> One-time charges (0.5-1% of loan amount)</li>
                        <li>• <strong>Insurance:</strong> Consider mortgage protection insurance</li>
                        <li>• <strong>Tax Benefits:</strong> Deductions on principal and interest payments</li>
                      </ul>

                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Loan Tenure Considerations</h3>
                      <ul className="text-gray-600 space-y-2">
                        <li>• Longer tenure = Lower EMI but higher total interest</li>
                        <li>• Shorter tenure = Higher EMI but significant interest savings</li>
                        <li>• Most common tenures: 15-30 years</li>
                        <li>• Consider your age and retirement plans</li>
                        <li>• Balance monthly affordability with total cost</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* FAQ Section */}
              <Card className="mt-8 bg-white border-0 shadow-sm">
                <CardContent className="p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Frequently Asked Questions</h2>
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">What factors affect home loan EMI calculations?</h3>
                      <p className="text-gray-600">
                        Home loan EMI depends on three main factors: loan amount (principal), interest rate, and loan tenure. 
                        Higher loan amounts and interest rates increase EMI, while longer tenure reduces monthly payments but increases total interest.
                      </p>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">How accurate is this home loan calculator?</h3>
                      <p className="text-gray-600">
                        Our calculator uses the standard EMI formula and provides highly accurate estimates. However, final loan terms may vary 
                        based on lender policies, credit score, and additional fees. Always verify calculations with your chosen lender.
                      </p>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Should I choose fixed or floating interest rates?</h3>
                      <p className="text-gray-600">
                        Fixed rates offer payment stability but are typically higher initially. Floating rates can save money if market rates decline 
                        but involve payment uncertainty. Consider your risk tolerance, market conditions, and financial planning preferences.
                      </p>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">What is the ideal down payment for a home loan?</h3>
                      <p className="text-gray-600">
                        Most lenders require 10-20% down payment. Higher down payments reduce loan amount, lower EMIs, and may qualify you for better interest rates. 
                        However, maintain sufficient liquidity for other expenses and emergency funds.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Currency Information */}
              <div className="mt-8 bg-blue-50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  <i className="fas fa-globe mr-2"></i>
                  Global Home Financing
                </h3>
                <p className="text-gray-600">
                  This home loan calculator supports major global currencies including USD, EUR, GBP, INR, JPY, CAD, AUD, CNY, BRL, and MXN. 
                  Calculate your home loan EMI regardless of your location for informed property investment decisions worldwide.
                </p>
              </div>

              {/* Advanced Home Loan Planning Section */}
              <Card className="mt-8 bg-white border-0 shadow-sm">
                <CardContent className="p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Advanced Home Loan Planning Strategies</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">🏠 For Different Buyer Types</h3>
                      <div className="space-y-4">
                        <div className="border-l-4 border-blue-500 pl-4">
                          <h4 className="font-semibold text-gray-900">First-Time Homebuyers</h4>
                          <p className="text-sm text-gray-600">
                            Use our home loan calculator to determine affordability before house hunting. 
                            Consider government schemes, lower down payment options, and factor in closing costs. 
                            Plan with our <a href="/tools/savings-goal-calculator" className="text-blue-600 hover:underline">savings goal calculator</a> for down payment accumulation.
                          </p>
                        </div>
                        <div className="border-l-4 border-green-500 pl-4">
                          <h4 className="font-semibold text-gray-900">Professionals & Salaried Individuals</h4>
                          <p className="text-sm text-gray-600">
                            Optimize loan tenure based on career progression and salary growth. 
                            Use the EMI to income ratio guidelines and plan prepayments strategically. 
                            Calculate potential savings with our <a href="/tools/compound-interest-calculator" className="text-blue-600 hover:underline">compound interest calculator</a>.
                          </p>
                        </div>
                        <div className="border-l-4 border-purple-500 pl-4">
                          <h4 className="font-semibold text-gray-900">Business Owners & Entrepreneurs</h4>
                          <p className="text-sm text-gray-600">
                            Consider variable income patterns and maintain higher emergency funds. 
                            Explore business loan options alongside home loans using our <a href="/tools/business-loan-calculator" className="text-blue-600 hover:underline">business loan calculator</a> 
                            for comprehensive financial planning.
                          </p>
                        </div>
                        <div className="border-l-4 border-orange-500 pl-4">
                          <h4 className="font-semibold text-gray-900">Real Estate Investors</h4>
                          <p className="text-sm text-gray-600">
                            Calculate investment property financing with rental income considerations. 
                            Use our <a href="/tools/roi-calculator" className="text-blue-600 hover:underline">ROI calculator</a> to analyze property investments 
                            and determine optimal leverage ratios for maximum returns.
                          </p>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">💡 Smart EMI Management</h3>
                      <div className="space-y-4">
                        <div className="bg-blue-50 rounded-lg p-4">
                          <h4 className="font-semibold text-gray-900 mb-2">EMI Optimization Strategies</h4>
                          <ul className="text-sm text-gray-600 space-y-1">
                            <li>• Make partial prepayments during bonus periods</li>
                            <li>• Consider step-up EMI options for growing incomes</li>
                            <li>• Balance between EMI amount and investment opportunities</li>
                            <li>• Use tax benefits under Section 80C and 24(b)</li>
                          </ul>
                        </div>
                        <div className="bg-green-50 rounded-lg p-4">
                          <h4 className="font-semibold text-gray-900 mb-2">Interest Rate Management</h4>
                          <ul className="text-sm text-gray-600 space-y-1">
                            <li>• Monitor rate changes for floating rate loans</li>
                            <li>• Consider refinancing when rates drop significantly</li>
                            <li>• Negotiate with lenders for better rates</li>
                            <li>• Compare fixed vs floating options regularly</li>
                          </ul>
                        </div>
                        <div className="bg-yellow-50 rounded-lg p-4">
                          <h4 className="font-semibold text-gray-900 mb-2">Financial Integration</h4>
                          <p className="text-sm text-gray-600">
                            Integrate home loan planning with overall financial goals. Use our 
                            <a href="/tools/retirement-calculator" className="text-blue-600 hover:underline mx-1">retirement calculator</a> 
                            and <a href="/tools/investment-return-calculator" className="text-blue-600 hover:underline">investment return calculator</a> 
                            to ensure your home purchase doesn't compromise long-term wealth building.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Home Loan Types and Features */}
              <Card className="mt-8 bg-white border-0 shadow-sm">
                <CardContent className="p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Understanding Home Loan Types and Features</h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-blue-50 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">🏠 Purchase Loans</h3>
                      <p className="text-gray-600 text-sm mb-4">
                        Standard home loans for buying residential property. Typically require 10-20% down payment 
                        with competitive interest rates for primary residences.
                      </p>
                      <ul className="text-xs text-gray-600 space-y-1">
                        <li>• Lower interest rates for primary residence</li>
                        <li>• Loan amount up to 80-90% of property value</li>
                        <li>• Longer repayment tenure (up to 30 years)</li>
                        <li>• Tax benefits on principal and interest</li>
                      </ul>
                    </div>
                    <div className="bg-green-50 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">🔄 Refinancing Loans</h3>
                      <p className="text-gray-600 text-sm mb-4">
                        Replace existing mortgage with new loan at better terms. Compare potential savings 
                        using our calculator before switching lenders.
                      </p>
                      <ul className="text-xs text-gray-600 space-y-1">
                        <li>• Lower interest rates can reduce EMI</li>
                        <li>• Change from fixed to floating or vice versa</li>
                        <li>• Access home equity for other investments</li>
                        <li>• Processing fees and charges apply</li>
                      </ul>
                    </div>
                    <div className="bg-purple-50 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">🏗️ Construction Loans</h3>
                      <p className="text-gray-600 text-sm mb-4">
                        Financing for building new homes with staged disbursements. Interest charged 
                        only on disbursed amounts during construction phase.
                      </p>
                      <ul className="text-xs text-gray-600 space-y-1">
                        <li>• Staged payments as construction progresses</li>
                        <li>• Pre-EMI interest during construction</li>
                        <li>• Converts to regular home loan post-completion</li>
                        <li>• Higher documentation and monitoring</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Home Loan Process and Documentation */}
              <Card className="mt-8 bg-white border-0 shadow-sm">
                <CardContent className="p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Home Loan Application Process Guide</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">📋 Required Documents</h3>
                      <div className="space-y-3">
                        <div>
                          <h4 className="font-semibold text-gray-900 text-sm">Identity & Address Proof</h4>
                          <p className="text-xs text-gray-600">Passport, Driving License, Voter ID, Aadhaar Card, Utility Bills</p>
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900 text-sm">Income Documentation</h4>
                          <p className="text-xs text-gray-600">Salary certificates, bank statements, ITR, Form 16, business financials</p>
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900 text-sm">Property Documents</h4>
                          <p className="text-xs text-gray-600">Sale deed, NOC, property tax receipts, building approvals</p>
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900 text-sm">Financial Records</h4>
                          <p className="text-xs text-gray-600">Bank statements, investment proofs, existing loan details, CIBIL report</p>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">⚡ Application Timeline</h3>
                      <div className="space-y-3">
                        <div className="flex items-start space-x-3">
                          <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">1</div>
                          <div>
                            <h4 className="font-semibold text-gray-900 text-sm">Pre-Approval (3-7 days)</h4>
                            <p className="text-xs text-gray-600">Document verification, credit check, income assessment</p>
                          </div>
                        </div>
                        <div className="flex items-start space-x-3">
                          <div className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-xs font-bold">2</div>
                          <div>
                            <h4 className="font-semibold text-gray-900 text-sm">Property Evaluation (5-10 days)</h4>
                            <p className="text-xs text-gray-600">Technical and legal verification, property valuation</p>
                          </div>
                        </div>
                        <div className="flex items-start space-x-3">
                          <div className="w-6 h-6 bg-purple-500 text-white rounded-full flex items-center justify-center text-xs font-bold">3</div>
                          <div>
                            <h4 className="font-semibold text-gray-900 text-sm">Final Approval (7-15 days)</h4>
                            <p className="text-xs text-gray-600">Loan sanction, agreement signing, disbursement processing</p>
                          </div>
                        </div>
                        <div className="flex items-start space-x-3">
                          <div className="w-6 h-6 bg-orange-500 text-white rounded-full flex items-center justify-center text-xs font-bold">4</div>
                          <div>
                            <h4 className="font-semibold text-gray-900 text-sm">Disbursement (1-3 days)</h4>
                            <p className="text-xs text-gray-600">Registration, insurance, fund transfer to seller</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Interest Rate Trends and Market Analysis */}
              <Card className="mt-8 bg-white border-0 shadow-sm">
                <CardContent className="p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Home Loan Interest Rate Analysis</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">📊 Rate Comparison Strategy</h3>
                      <p className="text-gray-600 mb-4">
                        Home loan interest rates vary significantly across lenders and loan products. Use our calculator 
                        to compare the total cost impact of different interest rates on your specific loan amount and tenure.
                      </p>
                      <div className="bg-yellow-50 rounded-lg p-4 mb-4">
                        <h4 className="font-semibold text-gray-900 mb-2">💡 Rate Shopping Tips</h4>
                        <ul className="text-sm text-gray-600 space-y-1">
                          <li>• Compare rates from at least 3-4 different lenders</li>
                          <li>• Consider both fixed and floating rate options</li>
                          <li>• Factor in processing fees and hidden charges</li>
                          <li>• Negotiate based on your credit profile and relationship</li>
                          <li>• Use our <a href="/tools/loan-calculator" className="text-blue-600 hover:underline">general loan calculator</a> for quick comparisons</li>
                        </ul>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">🎯 Factors Affecting Your Rate</h3>
                      <div className="space-y-3">
                        <div className="border-l-4 border-green-500 pl-3">
                          <h4 className="font-semibold text-sm text-gray-900">Credit Score Impact</h4>
                          <p className="text-xs text-gray-600">Score above 750 can get you 0.5-1% lower rates</p>
                        </div>
                        <div className="border-l-4 border-blue-500 pl-3">
                          <h4 className="font-semibold text-sm text-gray-900">Down Payment Size</h4>
                          <p className="text-xs text-gray-600">Higher down payment reduces lender risk and rates</p>
                        </div>
                        <div className="border-l-4 border-purple-500 pl-3">
                          <h4 className="font-semibold text-sm text-gray-900">Income Stability</h4>
                          <p className="text-xs text-gray-600">Salaried employees often get better rates than self-employed</p>
                        </div>
                        <div className="border-l-4 border-orange-500 pl-3">
                          <h4 className="font-semibold text-sm text-gray-900">Property Location</h4>
                          <p className="text-xs text-gray-600">Prime locations may qualify for preferential rates</p>
                        </div>
                      </div>
                      <div className="mt-4 bg-blue-50 rounded-lg p-4">
                        <p className="text-sm text-gray-600">
                          Use our <a href="/tools/credit-card-interest-calculator" className="text-blue-600 hover:underline">interest calculator</a> 
                          to understand the long-term impact of rate differences on your total payment amount.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Related Financial Planning Tools */}
              <Card className="mt-8 bg-gradient-to-r from-blue-50 to-purple-50 border-0 shadow-sm">
                <CardContent className="p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">
                    <i className="fas fa-calculator mr-3"></i>
                    Complete Home Finance Planning Toolkit
                  </h2>
                  <p className="text-gray-600 mb-6">
                    Complement your home loan planning with our comprehensive suite of financial calculators. 
                    Make informed decisions about your property purchase, financing options, and long-term wealth building strategy.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="bg-white rounded-lg p-4 hover:shadow-md transition-shadow border-l-4 border-blue-500">
                      <h4 className="font-semibold text-gray-900 mb-2">
                        <a href="/tools/mortgage-calculator" className="text-blue-600 hover:text-blue-700">
                          Mortgage Calculator
                        </a>
                      </h4>
                      <p className="text-sm text-gray-600">
                        Advanced mortgage calculations including taxes, insurance, and PMI for complete cost analysis.
                      </p>
                    </div>
                    <div className="bg-white rounded-lg p-4 hover:shadow-md transition-shadow border-l-4 border-green-500">
                      <h4 className="font-semibold text-gray-900 mb-2">
                        <a href="/tools/loan-calculator" className="text-green-600 hover:text-green-700">
                          General Loan Calculator
                        </a>
                      </h4>
                      <p className="text-sm text-gray-600">
                        Calculate EMI for personal loans, car loans, and other financing to plan your total debt obligations.
                      </p>
                    </div>
                    <div className="bg-white rounded-lg p-4 hover:shadow-md transition-shadow border-l-4 border-purple-500">
                      <h4 className="font-semibold text-gray-900 mb-2">
                        <a href="/tools/emi-calculator" className="text-purple-600 hover:text-purple-700">
                          EMI Calculator
                        </a>
                      </h4>
                      <p className="text-sm text-gray-600">
                        Quick EMI calculations for various loan scenarios and payment planning across different tenures.
                      </p>
                    </div>
                    <div className="bg-white rounded-lg p-4 hover:shadow-md transition-shadow border-l-4 border-orange-500">
                      <h4 className="font-semibold text-gray-900 mb-2">
                        <a href="/tools/savings-goal-calculator" className="text-orange-600 hover:text-orange-700">
                          Savings Goal Calculator
                        </a>
                      </h4>
                      <p className="text-sm text-gray-600">
                        Plan and track your down payment savings goal with systematic investment strategies.
                      </p>
                    </div>
                    <div className="bg-white rounded-lg p-4 hover:shadow-md transition-shadow border-l-4 border-teal-500">
                      <h4 className="font-semibold text-gray-900 mb-2">
                        <a href="/tools/compound-interest-calculator" className="text-teal-600 hover:text-teal-700">
                          Compound Interest Calculator
                        </a>
                      </h4>
                      <p className="text-sm text-gray-600">
                        Calculate long-term investment returns to balance home loan payments with wealth building.
                      </p>
                    </div>
                    <div className="bg-white rounded-lg p-4 hover:shadow-md transition-shadow border-l-4 border-red-500">
                      <h4 className="font-semibold text-gray-900 mb-2">
                        <a href="/tools/retirement-calculator" className="text-red-600 hover:text-red-700">
                          Retirement Calculator
                        </a>
                      </h4>
                      <p className="text-sm text-gray-600">
                        Ensure your home loan payments don't compromise your retirement planning and long-term security.
                      </p>
                    </div>
                    <div className="bg-white rounded-lg p-4 hover:shadow-md transition-shadow border-l-4 border-indigo-500">
                      <h4 className="font-semibold text-gray-900 mb-2">
                        <a href="/tools/roi-calculator" className="text-indigo-600 hover:text-indigo-700">
                          ROI Calculator
                        </a>
                      </h4>
                      <p className="text-sm text-gray-600">
                        Analyze real estate investment returns and compare with other investment opportunities.
                      </p>
                    </div>
                    <div className="bg-white rounded-lg p-4 hover:shadow-md transition-shadow border-l-4 border-pink-500">
                      <h4 className="font-semibold text-gray-900 mb-2">
                        <a href="/tools/simple-interest-calculator" className="text-pink-600 hover:text-pink-700">
                          Simple Interest Calculator
                        </a>
                      </h4>
                      <p className="text-sm text-gray-600">
                        Calculate simple interest for short-term financing and bridge loan planning.
                      </p>
                    </div>
                    <div className="bg-white rounded-lg p-4 hover:shadow-md transition-shadow border-l-4 border-yellow-500">
                      <h4 className="font-semibold text-gray-900 mb-2">
                        <a href="/tools/business-loan-calculator" className="text-yellow-600 hover:text-yellow-700">
                          Business Loan Calculator
                        </a>
                      </h4>
                      <p className="text-sm text-gray-600">
                        Plan business financing alongside personal home loans for entrepreneurs and business owners.
                      </p>
                    </div>
                  </div>
                  <div className="mt-6 text-center">
                    <a href="/tools" className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                      <i className="fas fa-tools mr-2"></i>
                      Explore All Financial Tools
                    </a>
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