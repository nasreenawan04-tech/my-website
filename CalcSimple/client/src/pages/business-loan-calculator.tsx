
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

interface BusinessLoanResult {
  monthlyPayment: number;
  totalAmount: number;
  totalInterest: number;
  yearlyPayment: number;
  debtServiceCoverage: number;
  loanToValue: number;
}

const BusinessLoanCalculator = () => {
  const [loanAmount, setLoanAmount] = useState('');
  const [interestRate, setInterestRate] = useState('');
  const [loanTerm, setLoanTerm] = useState('');
  const [termUnit, setTermUnit] = useState('years');
  const [loanType, setLoanType] = useState('term-loan');
  const [businessRevenue, setBusinessRevenue] = useState('');
  const [collateralValue, setCollateralValue] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [result, setResult] = useState<BusinessLoanResult | null>(null);

  const calculateBusinessLoan = () => {
    const principal = parseFloat(loanAmount);
    const rate = parseFloat(interestRate) / 100 / 12; // Monthly interest rate
    const termMonths = termUnit === 'years' ? parseFloat(loanTerm) * 12 : parseFloat(loanTerm);
    const revenue = parseFloat(businessRevenue) || 0;
    const collateral = parseFloat(collateralValue) || 0;

    if (principal && rate && termMonths) {
      // Business loan payment calculation using standard formula
      let monthlyPayment;
      
      if (loanType === 'line-of-credit') {
        // For line of credit, assume interest-only payments
        monthlyPayment = principal * rate;
      } else {
        // Standard term loan calculation
        monthlyPayment = (principal * rate * Math.pow(1 + rate, termMonths)) / (Math.pow(1 + rate, termMonths) - 1);
      }
      
      const totalAmount = loanType === 'line-of-credit' ? monthlyPayment * termMonths + principal : monthlyPayment * termMonths;
      const totalInterest = totalAmount - principal;
      const yearlyPayment = monthlyPayment * 12;
      
      // Business-specific metrics
      const debtServiceCoverage = revenue > 0 ? revenue / yearlyPayment : 0;
      const loanToValue = collateral > 0 ? (principal / collateral) * 100 : 0;

      setResult({
        monthlyPayment: Math.round(monthlyPayment * 100) / 100,
        totalAmount: Math.round(totalAmount * 100) / 100,
        totalInterest: Math.round(totalInterest * 100) / 100,
        yearlyPayment: Math.round(yearlyPayment * 100) / 100,
        debtServiceCoverage: Math.round(debtServiceCoverage * 100) / 100,
        loanToValue: Math.round(loanToValue * 100) / 100
      });
    }
  };

  const resetCalculator = () => {
    setLoanAmount('');
    setInterestRate('');
    setLoanTerm('');
    setTermUnit('years');
    setLoanType('term-loan');
    setBusinessRevenue('');
    setCollateralValue('');
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
        <title>Business Loan Calculator - Calculate Monthly Business Loan Payments | ToolsHub</title>
        <meta name="description" content="Free business loan calculator to calculate monthly payments, debt service coverage, and loan costs. Compare different business financing options." />
        <meta name="keywords" content="business loan calculator, commercial loan calculator, SBA loan calculator, business financing calculator, debt service coverage ratio" />
        <meta property="og:title" content="Business Loan Calculator - Calculate Monthly Business Loan Payments | ToolsHub" />
        <meta property="og:description" content="Free business loan calculator to calculate monthly payments, debt service coverage, and loan costs. Compare different business financing options." />
        <meta property="og:type" content="website" />
        <meta name="robots" content="index, follow" />
        <meta name="author" content="ToolsHub" />
        <link rel="canonical" href="/tools/business-loan-calculator" />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            "name": "Business Loan Calculator",
            "description": "Free online business loan calculator to calculate monthly payments and analyze business financing options.",
            "url": "/tools/business-loan-calculator",
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

      <div className="min-h-screen flex flex-col" data-testid="page-business-loan-calculator">
        <Header />
        
        <main className="flex-1 bg-neutral-50">
          {/* Hero Section */}
          <section className="gradient-hero text-white py-16">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <div className="w-20 h-20 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <i className="fas fa-building text-3xl"></i>
              </div>
              <h1 className="text-4xl sm:text-5xl font-bold mb-6" data-testid="text-page-title">
                Business Loan Calculator
              </h1>
              <p className="text-xl text-blue-100 max-w-2xl mx-auto">
                Calculate monthly business loan payments and analyze debt service coverage with support for multiple currencies
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
                      <h2 className="text-2xl font-semibold text-gray-900 mb-8">Business Loan Details</h2>
                      
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

                      {/* Loan Type */}
                      <div className="space-y-3">
                        <Label htmlFor="loan-type" className="text-sm font-medium text-gray-700">
                          Loan Type
                        </Label>
                        <Select value={loanType} onValueChange={setLoanType}>
                          <SelectTrigger className="h-12 border-gray-200 rounded-lg" data-testid="select-loan-type">
                            <SelectValue placeholder="Select loan type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="term-loan">Term Loan</SelectItem>
                            <SelectItem value="sba-loan">SBA Loan</SelectItem>
                            <SelectItem value="equipment-loan">Equipment Financing</SelectItem>
                            <SelectItem value="line-of-credit">Line of Credit</SelectItem>
                            <SelectItem value="working-capital">Working Capital Loan</SelectItem>
                            <SelectItem value="commercial-mortgage">Commercial Mortgage</SelectItem>
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

                      {/* Loan Term */}
                      <div className="space-y-3">
                        <Label className="text-sm font-medium text-gray-700">Loan Term</Label>
                        <div className="grid grid-cols-2 gap-3">
                          <Input
                            type="number"
                            value={loanTerm}
                            onChange={(e) => setLoanTerm(e.target.value)}
                            className="h-12 text-base border-gray-200 rounded-lg"
                            placeholder="Enter term"
                            min="1"
                            data-testid="input-loan-term"
                          />
                          <Select value={termUnit} onValueChange={setTermUnit}>
                            <SelectTrigger className="h-12 border-gray-200 rounded-lg" data-testid="select-term-unit">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="years">Years</SelectItem>
                              <SelectItem value="months">Months</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      {/* Business Information */}
                      <div className="border-t pt-6 space-y-4">
                        <h3 className="text-lg font-semibold mb-4">Business Information (Optional)</h3>
                        
                        <div className="space-y-3">
                          <Label htmlFor="business-revenue" className="text-sm font-medium text-gray-700">
                            Annual Business Revenue
                          </Label>
                          <Input
                            id="business-revenue"
                            type="number"
                            value={businessRevenue}
                            onChange={(e) => setBusinessRevenue(e.target.value)}
                            className="h-12 text-base border-gray-200 rounded-lg"
                            placeholder="Enter annual revenue"
                            min="0"
                            step="0.01"
                            data-testid="input-business-revenue"
                          />
                          <p className="text-xs text-gray-500">Used to calculate debt service coverage ratio</p>
                        </div>

                        <div className="space-y-3">
                          <Label htmlFor="collateral-value" className="text-sm font-medium text-gray-700">
                            Collateral Value
                          </Label>
                          <Input
                            id="collateral-value"
                            type="number"
                            value={collateralValue}
                            onChange={(e) => setCollateralValue(e.target.value)}
                            className="h-12 text-base border-gray-200 rounded-lg"
                            placeholder="Enter collateral value"
                            min="0"
                            step="0.01"
                            data-testid="input-collateral-value"
                          />
                          <p className="text-xs text-gray-500">Used to calculate loan-to-value ratio</p>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-4 pt-6">
                        <Button
                          onClick={calculateBusinessLoan}
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
                      <h2 className="text-2xl font-semibold text-gray-900 mb-8">Loan Analysis Results</h2>
                      
                      {result ? (
                        <div className="space-y-4" data-testid="business-loan-results">
                          {/* Monthly Payment */}
                          <div className="bg-white rounded-lg p-4 border-l-4 border-green-500">
                            <div className="flex justify-between items-center">
                              <span className="font-semibold text-gray-700">
                                {loanType === 'line-of-credit' ? 'Monthly Interest Payment' : 'Monthly Payment'}
                              </span>
                              <span className="text-2xl font-bold text-green-600" data-testid="text-monthly-payment">
                                {formatCurrency(result.monthlyPayment)}
                              </span>
                            </div>
                          </div>

                          {/* Payment Summary */}
                          <div className="space-y-3">
                            <div className="flex justify-between">
                              <span className="text-gray-600">Annual Payment</span>
                              <span className="font-semibold" data-testid="text-yearly-payment">
                                {formatCurrency(result.yearlyPayment)}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Total Amount Payable</span>
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

                          {/* Business Metrics */}
                          {(result.debtServiceCoverage > 0 || result.loanToValue > 0) && (
                            <div className="border-t pt-4 space-y-4">
                              <h3 className="font-semibold text-gray-900">Business Metrics</h3>
                              
                              {result.debtServiceCoverage > 0 && (
                                <div className="bg-blue-50 rounded-lg p-4">
                                  <div className="flex justify-between items-center">
                                    <span className="text-gray-700">Debt Service Coverage Ratio</span>
                                    <span className={`font-bold ${result.debtServiceCoverage >= 1.25 ? 'text-green-600' : result.debtServiceCoverage >= 1.0 ? 'text-yellow-600' : 'text-red-600'}`} data-testid="text-debt-service-coverage">
                                      {result.debtServiceCoverage.toFixed(2)}x
                                    </span>
                                  </div>
                                  <p className="text-xs text-gray-600 mt-1">
                                    {result.debtServiceCoverage >= 1.25 ? 'Excellent - Strong ability to service debt' : 
                                     result.debtServiceCoverage >= 1.0 ? 'Good - Adequate ability to service debt' : 
                                     'Poor - May struggle to service debt'}
                                  </p>
                                </div>
                              )}
                              
                              {result.loanToValue > 0 && (
                                <div className="bg-purple-50 rounded-lg p-4">
                                  <div className="flex justify-between items-center">
                                    <span className="text-gray-700">Loan-to-Value Ratio</span>
                                    <span className={`font-bold ${result.loanToValue <= 80 ? 'text-green-600' : result.loanToValue <= 90 ? 'text-yellow-600' : 'text-red-600'}`} data-testid="text-loan-to-value">
                                      {result.loanToValue.toFixed(1)}%
                                    </span>
                                  </div>
                                  <p className="text-xs text-gray-600 mt-1">
                                    {result.loanToValue <= 80 ? 'Low risk - Good collateral coverage' : 
                                     result.loanToValue <= 90 ? 'Moderate risk - Acceptable collateral' : 
                                     'High risk - Limited collateral coverage'}
                                  </p>
                                </div>
                              )}
                            </div>
                          )}

                          {/* Loan Type Information */}
                          <div className="bg-gray-100 rounded-lg p-4 mt-4">
                            <div className="flex justify-between items-center">
                              <span className="text-gray-700">Loan Type</span>
                              <span className="font-bold text-blue-600">
                                {loanType === 'term-loan' ? 'Term Loan' :
                                 loanType === 'sba-loan' ? 'SBA Loan' :
                                 loanType === 'equipment-loan' ? 'Equipment Financing' :
                                 loanType === 'line-of-credit' ? 'Line of Credit' :
                                 loanType === 'working-capital' ? 'Working Capital Loan' :
                                 'Commercial Mortgage'}
                              </span>
                            </div>
                            {loanType === 'line-of-credit' && (
                              <p className="text-xs text-gray-600 mt-1">
                                Note: Line of credit shows interest-only payments. Principal repayment terms may vary.
                              </p>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-8" data-testid="no-results">
                          <i className="fas fa-building text-4xl text-gray-400 mb-4"></i>
                          <p className="text-gray-500">Enter business loan details to see payment analysis</p>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Educational Content */}
              <div className="mt-12 space-y-8">
                {/* Understanding Business Loans */}
                <div className="bg-white rounded-2xl shadow-lg p-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-8">Complete Guide to Business Loan Calculator</h2>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-4">What is a Business Loan?</h3>
                      <p className="text-gray-600 mb-6 leading-relaxed">
                        A business loan is financing provided to a business entity to help fund operations, expansion, equipment 
                        purchases, or other business needs. Unlike personal loans, business loans are based on the company's 
                        creditworthiness, cash flow, and business plan. They come in various forms including term loans, 
                        lines of credit, SBA loans, and specialized financing options.
                      </p>
                      
                      <h3 className="text-xl font-semibold text-gray-900 mb-4">Key Business Loan Metrics</h3>
                      <ul className="text-gray-600 space-y-2">
                        <li><strong>Debt Service Coverage Ratio (DSCR):</strong> Measures ability to service debt payments</li>
                        <li><strong>Loan-to-Value (LTV):</strong> Ratio of loan amount to collateral value</li>
                        <li><strong>Debt-to-Income:</strong> Compares business debt to revenue or cash flow</li>
                        <li><strong>Working Capital:</strong> Available funds for day-to-day operations</li>
                      </ul>
                    </div>
                    
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-4">Types of Business Loans</h3>
                      <ul className="text-gray-600 space-y-3">
                        <li className="flex items-start">
                          <i className="fas fa-check-circle text-green-500 mt-1 mr-3"></i>
                          <span><strong>Term Loans:</strong> Fixed loan amount with regular monthly payments</span>
                        </li>
                        <li className="flex items-start">
                          <i className="fas fa-check-circle text-green-500 mt-1 mr-3"></i>
                          <span><strong>SBA Loans:</strong> Government-backed loans with favorable terms</span>
                        </li>
                        <li className="flex items-start">
                          <i className="fas fa-check-circle text-green-500 mt-1 mr-3"></i>
                          <span><strong>Equipment Financing:</strong> Loans specifically for equipment purchases</span>
                        </li>
                        <li className="flex items-start">
                          <i className="fas fa-check-circle text-green-500 mt-1 mr-3"></i>
                          <span><strong>Line of Credit:</strong> Flexible borrowing up to a credit limit</span>
                        </li>
                        <li className="flex items-start">
                          <i className="fas fa-check-circle text-green-500 mt-1 mr-3"></i>
                          <span><strong>Working Capital:</strong> Short-term financing for operational needs</span>
                        </li>
                      </ul>

                      <h3 className="text-xl font-semibold text-gray-900 mb-4 mt-6">Qualification Requirements</h3>
                      <ul className="text-gray-600 space-y-2">
                        <li>• Strong business credit score (680+ preferred)</li>
                        <li>• Minimum 2 years in business (varies by lender)</li>
                        <li>• Adequate cash flow to service debt</li>
                        <li>• Detailed business plan and financial statements</li>
                        <li>• Collateral may be required for larger loans</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Business Loan Types Detail */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Business Loan Types Comparison</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="bg-white rounded-lg p-6 shadow-sm">
                      <i className="fas fa-handshake text-2xl text-blue-600 mb-4"></i>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">SBA Loans</h3>
                      <p className="text-gray-600 text-sm mb-3">
                        Government-backed loans offering favorable terms for qualified small businesses.
                      </p>
                      <div className="text-xs text-gray-500">
                        <div>• Lower interest rates</div>
                        <div>• Longer repayment terms</div>
                        <div>• Strict qualification requirements</div>
                      </div>
                    </div>
                    
                    <div className="bg-white rounded-lg p-6 shadow-sm">
                      <i className="fas fa-tools text-2xl text-green-600 mb-4"></i>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Equipment Financing</h3>
                      <p className="text-gray-600 text-sm mb-3">
                        Loans specifically for purchasing business equipment, with equipment as collateral.
                      </p>
                      <div className="text-xs text-gray-500">
                        <div>• Equipment serves as collateral</div>
                        <div>• Competitive rates</div>
                        <div>• Quick approval process</div>
                      </div>
                    </div>
                    
                    <div className="bg-white rounded-lg p-6 shadow-sm">
                      <i className="fas fa-credit-card text-2xl text-purple-600 mb-4"></i>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Line of Credit</h3>
                      <p className="text-gray-600 text-sm mb-3">
                        Flexible borrowing option that provides access to funds as needed up to a credit limit.
                      </p>
                      <div className="text-xs text-gray-500">
                        <div>• Pay interest only on used funds</div>
                        <div>• Revolving credit facility</div>
                        <div>• Great for working capital</div>
                      </div>
                    </div>
                    
                    <div className="bg-white rounded-lg p-6 shadow-sm">
                      <i className="fas fa-calendar-alt text-2xl text-orange-600 mb-4"></i>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Term Loans</h3>
                      <p className="text-gray-600 text-sm mb-3">
                        Traditional loans with fixed amounts, terms, and regular monthly payments.
                      </p>
                      <div className="text-xs text-gray-500">
                        <div>• Predictable monthly payments</div>
                        <div>• Various term lengths available</div>
                        <div>• Good for major purchases</div>
                      </div>
                    </div>
                    
                    <div className="bg-white rounded-lg p-6 shadow-sm">
                      <i className="fas fa-chart-line text-2xl text-teal-600 mb-4"></i>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Working Capital</h3>
                      <p className="text-gray-600 text-sm mb-3">
                        Short-term financing to cover operational expenses and cash flow gaps.
                      </p>
                      <div className="text-xs text-gray-500">
                        <div>• Short-term financing</div>
                        <div>• Quick access to funds</div>
                        <div>• Higher interest rates</div>
                      </div>
                    </div>
                    
                    <div className="bg-white rounded-lg p-6 shadow-sm">
                      <i className="fas fa-building text-2xl text-red-600 mb-4"></i>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Commercial Mortgage</h3>
                      <p className="text-gray-600 text-sm mb-3">
                        Long-term loans for purchasing or refinancing commercial real estate properties.
                      </p>
                      <div className="text-xs text-gray-500">
                        <div>• Lower interest rates</div>
                        <div>• Longer repayment terms</div>
                        <div>• Property as collateral</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Business Loan Tips */}
                <div className="bg-white rounded-2xl shadow-lg p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Smart Business Borrowing Tips</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                        <i className="fas fa-lightbulb text-yellow-500 mr-2"></i>
                        Preparation Tips
                      </h3>
                      <ul className="space-y-3">
                        <li className="flex items-start space-x-2">
                          <i className="fas fa-arrow-right text-blue-600 mt-1 text-sm"></i>
                          <span className="text-gray-700">Maintain detailed financial records and business plans</span>
                        </li>
                        <li className="flex items-start space-x-2">
                          <i className="fas fa-arrow-right text-blue-600 mt-1 text-sm"></i>
                          <span className="text-gray-700">Build strong business credit before applying</span>
                        </li>
                        <li className="flex items-start space-x-2">
                          <i className="fas fa-arrow-right text-blue-600 mt-1 text-sm"></i>
                          <span className="text-gray-700">Compare multiple lenders and loan products</span>
                        </li>
                        <li className="flex items-start space-x-2">
                          <i className="fas fa-arrow-right text-blue-600 mt-1 text-sm"></i>
                          <span className="text-gray-700">Understand all fees and terms before signing</span>
                        </li>
                      </ul>
                    </div>
                    
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                        <i className="fas fa-exclamation-triangle text-orange-500 mr-2"></i>
                        Important Considerations
                      </h3>
                      <ul className="space-y-3">
                        <li className="flex items-start space-x-2">
                          <i className="fas fa-arrow-right text-orange-600 mt-1 text-sm"></i>
                          <span className="text-gray-700">Ensure debt service coverage ratio is adequate (1.25x+ preferred)</span>
                        </li>
                        <li className="flex items-start space-x-2">
                          <i className="fas fa-arrow-right text-orange-600 mt-1 text-sm"></i>
                          <span className="text-gray-700">Consider seasonal cash flow variations in planning</span>
                        </li>
                        <li className="flex items-start space-x-2">
                          <i className="fas fa-arrow-right text-orange-600 mt-1 text-sm"></i>
                          <span className="text-gray-700">Don't over-leverage your business</span>
                        </li>
                        <li className="flex items-start space-x-2">
                          <i className="fas fa-arrow-right text-orange-600 mt-1 text-sm"></i>
                          <span className="text-gray-700">Have a clear plan for loan proceeds utilization</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Understanding Business Metrics */}
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Understanding Key Business Loan Metrics</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="bg-white rounded-lg p-6 shadow-sm">
                      <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                        <i className="fas fa-chart-bar text-blue-600 mr-2"></i>
                        Debt Service Coverage Ratio (DSCR)
                      </h3>
                      <p className="text-gray-600 text-sm mb-4">
                        DSCR measures your business's ability to service its debt obligations. It's calculated by dividing 
                        annual cash flow by annual debt service payments.
                      </p>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Excellent:</span>
                          <span className="text-green-600 font-semibold">1.25x or higher</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Good:</span>
                          <span className="text-yellow-600 font-semibold">1.0x - 1.24x</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Poor:</span>
                          <span className="text-red-600 font-semibold">Below 1.0x</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-white rounded-lg p-6 shadow-sm">
                      <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                        <i className="fas fa-balance-scale text-purple-600 mr-2"></i>
                        Loan-to-Value Ratio (LTV)
                      </h3>
                      <p className="text-gray-600 text-sm mb-4">
                        LTV compares the loan amount to the value of collateral securing the loan. Lower ratios indicate 
                        better collateral coverage and reduced lender risk.
                      </p>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Low Risk:</span>
                          <span className="text-green-600 font-semibold">80% or lower</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Moderate Risk:</span>
                          <span className="text-yellow-600 font-semibold">80% - 90%</span>
                        </div>
                        <div className="flex justify-between">
                          <span>High Risk:</span>
                          <span className="text-red-600 font-semibold">Above 90%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* FAQ Section */}
                <div className="bg-white rounded-2xl shadow-lg p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Frequently Asked Questions</h2>
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">What credit score do I need for a business loan?</h3>
                      <p className="text-gray-600">
                        Most lenders prefer a business credit score of 680 or higher, though some alternative lenders may 
                        accept lower scores. Personal credit scores are also considered, especially for newer businesses.
                      </p>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">How long does it take to get approved for a business loan?</h3>
                      <p className="text-gray-600">
                        Approval times vary by lender and loan type. Online lenders may approve loans in 24-48 hours, 
                        while traditional banks and SBA loans can take several weeks to months.
                      </p>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">What's the difference between secured and unsecured business loans?</h3>
                      <p className="text-gray-600">
                        Secured loans require collateral (equipment, property, etc.) and typically offer lower interest rates. 
                        Unsecured loans don't require collateral but have higher rates and stricter qualification requirements.
                      </p>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Can a startup get a business loan?</h3>
                      <p className="text-gray-600">
                        Startups can get loans, but options are limited. They often need strong personal credit, significant 
                        down payments, and detailed business plans. SBA microloans and alternative lenders are often more 
                        startup-friendly.
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
                  This business loan calculator supports major global currencies including USD, EUR, GBP, INR, JPY, CAD, AUD, CNY, BRL, and MXN. 
                  The calculations remain accurate regardless of the currency selected, making it perfect for international businesses 
                  and cross-border financing scenarios.
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

export default BusinessLoanCalculator;
