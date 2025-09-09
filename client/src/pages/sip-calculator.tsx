import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calculator, Coins, GraduationCap, Home, Umbrella, Shield, Car, TrendingUp, Globe } from 'lucide-react';

interface SIPResult {
  maturityAmount: number;
  totalInvested: number;
  totalGains: number;
  monthlyInvestment: number;
  investmentPeriod: number;
  gainPercentage: number;
}

const SIPCalculator = () => {
  const [monthlyInvestment, setMonthlyInvestment] = useState('');
  const [investmentPeriod, setInvestmentPeriod] = useState('');
  const [periodType, setPeriodType] = useState('years');
  const [expectedReturn, setExpectedReturn] = useState('12');
  const [currency, setCurrency] = useState('USD');
  const [result, setResult] = useState<SIPResult | null>(null);

  const calculateSIP = () => {
    const monthlyAmount = parseFloat(monthlyInvestment);
    const annualReturn = parseFloat(expectedReturn) / 100;
    const monthlyReturn = annualReturn / 12;
    const totalMonths = periodType === 'years' ? parseFloat(investmentPeriod) * 12 : parseFloat(investmentPeriod);

    if (monthlyAmount && totalMonths && monthlyReturn) {
      // SIP formula: M = P × [{(1 + i)^n - 1} / i] × (1 + i)
      // Where M = Maturity amount, P = Monthly investment, i = Monthly interest rate, n = Number of months
      const maturityAmount = monthlyAmount * 
        (Math.pow(1 + monthlyReturn, totalMonths) - 1) / monthlyReturn * (1 + monthlyReturn);
      
      const totalInvested = monthlyAmount * totalMonths;
      const totalGains = maturityAmount - totalInvested;
      const gainPercentage = (totalGains / totalInvested) * 100;
      const investmentYears = periodType === 'years' ? parseFloat(investmentPeriod) : parseFloat(investmentPeriod) / 12;

      setResult({
        maturityAmount: Math.round(maturityAmount * 100) / 100,
        totalInvested: Math.round(totalInvested * 100) / 100,
        totalGains: Math.round(totalGains * 100) / 100,
        monthlyInvestment: monthlyAmount,
        investmentPeriod: investmentYears,
        gainPercentage: Math.round(gainPercentage * 100) / 100
      });
    } else if (monthlyAmount && totalMonths && monthlyReturn === 0) {
      // Handle 0% return case
      const totalInvested = monthlyAmount * totalMonths;
      const investmentYears = periodType === 'years' ? parseFloat(investmentPeriod) : parseFloat(investmentPeriod) / 12;

      setResult({
        maturityAmount: totalInvested,
        totalInvested: totalInvested,
        totalGains: 0,
        monthlyInvestment: monthlyAmount,
        investmentPeriod: investmentYears,
        gainPercentage: 0
      });
    }
  };

  const resetCalculator = () => {
    setMonthlyInvestment('');
    setInvestmentPeriod('');
    setPeriodType('years');
    setExpectedReturn('12');
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
        <title>SIP Calculator - Calculate Systematic Investment Plan Returns | ToolForge</title>
        <meta name="description" content="Free SIP calculator to calculate returns on Systematic Investment Plan. Plan your mutual fund investments and see how much wealth you can create." />
        <meta name="keywords" content="SIP calculator, systematic investment plan, mutual fund calculator, investment calculator, SIP returns" />
        <meta property="og:title" content="SIP Calculator - Calculate Systematic Investment Plan Returns | ToolForge" />
        <meta property="og:description" content="Free SIP calculator to calculate returns on Systematic Investment Plan. Plan your mutual fund investments and see how much wealth you can create." />
        <meta property="og:type" content="website" />
        <link rel="canonical" href="/tools/sip-calculator" />
      </Helmet>

      <div className="min-h-screen flex flex-col" data-testid="page-sip-calculator">
        <Header />
        
        <main className="flex-1 bg-neutral-50">
          {/* Hero Section */}
          <section className="gradient-hero text-white py-16">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <div className="w-20 h-20 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Coins className="w-8 h-8" />
              </div>
              <h1 className="text-4xl sm:text-5xl font-bold mb-6" data-testid="text-page-title">
                SIP Calculator
              </h1>
              <p className="text-xl text-blue-100 max-w-2xl mx-auto">
                Calculate returns on your Systematic Investment Plan (SIP) and see how small investments can grow into wealth
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
                      <h2 className="text-2xl font-semibold text-gray-900 mb-8">Investment Details</h2>
                      
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

                      {/* Monthly Investment */}
                      <div className="space-y-3">
                        <Label htmlFor="monthly-investment" className="text-sm font-medium text-gray-700">
                          Monthly Investment Amount
                        </Label>
                        <Input
                          id="monthly-investment"
                          type="number"
                          value={monthlyInvestment}
                          onChange={(e) => setMonthlyInvestment(e.target.value)}
                          className="h-12 text-base border-gray-200 rounded-lg"
                          placeholder="Enter monthly investment"
                          min="1"
                          step="1"
                          data-testid="input-monthly-investment"
                        />
                      </div>

                      {/* Investment Period */}
                      <div className="space-y-3">
                        <Label className="text-sm font-medium text-gray-700">Investment Period</Label>
                        <div className="grid grid-cols-2 gap-3">
                          <Input
                            type="number"
                            value={investmentPeriod}
                            onChange={(e) => setInvestmentPeriod(e.target.value)}
                            className="h-12 text-base border-gray-200 rounded-lg"
                            placeholder="Enter period"
                            min="1"
                            data-testid="input-investment-period"
                          />
                          <Select value={periodType} onValueChange={setPeriodType}>
                            <SelectTrigger className="h-12 border-gray-200 rounded-lg" data-testid="select-period-type">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="years">Years</SelectItem>
                              <SelectItem value="months">Months</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      {/* Expected Annual Return */}
                      <div className="space-y-3">
                        <Label htmlFor="expected-return" className="text-sm font-medium text-gray-700">
                          Expected Annual Return (%)
                        </Label>
                        <Input
                          id="expected-return"
                          type="number"
                          value={expectedReturn}
                          onChange={(e) => setExpectedReturn(e.target.value)}
                          className="h-12 text-base border-gray-200 rounded-lg"
                          placeholder="Enter expected return"
                          min="0"
                          max="50"
                          step="0.1"
                          data-testid="input-expected-return"
                        />
                        <p className="text-xs text-muted-foreground">
                          Typical equity mutual funds average 12-15% annually over long term
                        </p>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-4 pt-6">
                        <Button
                          onClick={calculateSIP}
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
                      <h2 className="text-2xl font-semibold text-gray-900 mb-8">Investment Projection</h2>
                      
                      {result ? (
                        <div className="space-y-4" data-testid="sip-results">
                          {/* Maturity Amount */}
                          <div className="bg-white rounded-lg p-4 border-l-4 border-green-500">
                            <div className="flex justify-between items-center">
                              <span className="font-semibold text-gray-700">Maturity Amount</span>
                              <span className="text-2xl font-bold text-green-600" data-testid="text-maturity-amount">
                                {formatCurrency(result.maturityAmount)}
                              </span>
                            </div>
                          </div>

                          {/* Investment Summary */}
                          <div className="space-y-3">
                            <div className="flex justify-between">
                              <span className="text-gray-600">Total Investment</span>
                              <span className="font-semibold" data-testid="text-total-invested">
                                {formatCurrency(result.totalInvested)}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Total Gains</span>
                              <span className="font-semibold text-green-600" data-testid="text-total-gains">
                                {formatCurrency(result.totalGains)}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Investment Period</span>
                              <span className="font-semibold" data-testid="text-investment-years">
                                {result.investmentPeriod} years
                              </span>
                            </div>
                          </div>

                          {/* Gain Percentage */}
                          <div className="bg-blue-50 rounded-lg p-4 mt-4">
                            <div className="flex justify-between items-center">
                              <span className="text-gray-700">Total Return</span>
                              <span className="font-bold text-blue-600" data-testid="text-gain-percentage">
                                {result.gainPercentage}%
                              </span>
                            </div>
                          </div>

                          {/* Visual Breakdown */}
                          <div className="mt-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-3">Investment Breakdown</h3>
                            <div className="space-y-2">
                              <div className="flex items-center">
                                <div 
                                  className="h-4 bg-blue-500 rounded-l"
                                  style={{ width: `${(result.totalInvested / result.maturityAmount) * 100}%` }}
                                ></div>
                                <div 
                                  className="h-4 bg-green-500 rounded-r"
                                  style={{ width: `${(result.totalGains / result.maturityAmount) * 100}%` }}
                                ></div>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span className="flex items-center">
                                  <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                                  Invested ({Math.round((result.totalInvested / result.maturityAmount) * 100)}%)
                                </span>
                                <span className="flex items-center">
                                  <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                                  Gains ({Math.round((result.totalGains / result.maturityAmount) * 100)}%)
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Monthly Summary */}
                          <div className="bg-yellow-50 rounded-lg p-4 mt-4">
                            <h4 className="font-semibold text-gray-700 mb-2">Investment Summary</h4>
                            <div className="text-sm text-gray-600 space-y-1">
                              <p>Monthly Investment: <span className="font-semibold">{formatCurrency(result.monthlyInvestment)}</span></p>
                              <p>Investment Duration: <span className="font-semibold">{result.investmentPeriod} years</span></p>
                              <p>Your {formatCurrency(result.monthlyInvestment)} monthly investment will grow to {formatCurrency(result.maturityAmount)}</p>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-8" data-testid="no-results">
                          <Coins className="w-10 h-10 text-gray-400 mb-4" />
                          <p className="text-gray-500">Enter SIP details to see investment projections</p>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* What is SIP Calculator Section */}
              <section className="mt-12 py-12 bg-white rounded-2xl shadow-lg">
                <div className="px-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
                    What is a SIP Calculator? Your Complete Investment Planning Guide
                  </h2>
                  <div className="max-w-4xl mx-auto">
                    <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                      A <strong>SIP (Systematic Investment Plan) calculator</strong> is an essential financial planning tool that empowers investors 
                      to forecast the future value of their systematic investments in mutual funds, ETFs, index funds, and other investment vehicles. 
                      This advanced calculator transforms complex compound interest calculations into easy-to-understand projections, helping you 
                      visualize how small, regular investments can grow into substantial wealth over time through the magic of compounding and 
                      disciplined investing strategies.
                    </p>
                    <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                      Our state-of-the-art SIP calculator stands out with multi-currency support, real-time calculations, and comprehensive 
                      investment analysis including total invested capital, absolute returns, capital gains, annualized returns, and detailed 
                      visual breakdowns. Whether you're a beginner investor planning for retirement, a parent saving for your child's education, 
                      or an experienced investor optimizing your portfolio allocation, this tool simplifies complex financial mathematics and 
                      provides actionable insights for strategic investment decisions.
                    </p>
                    <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                      <strong>How accurate is our SIP calculator?</strong> The calculator employs the internationally recognized SIP formula: 
                      M = P × [(1 + i)^n - 1] / i × (1 + i), where M represents the maturity amount, P is your monthly investment, 
                      i is the monthly interest rate, and n is the total number of months. This mathematical precision ensures reliable 
                      projections for your investment planning, portfolio optimization, and financial goal setting.
                    </p>
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6">
                      <h3 className="text-xl font-semibold text-gray-900 mb-4">🎯 Why Choose Our SIP Calculator?</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-start">
                          <div className="w-2 h-2 bg-blue-500 rounded-full mr-3 mt-2"></div>
                          <span className="text-gray-700"><strong>Multi-currency support</strong> for global investors (USD, EUR, GBP, INR, JPY, and more)</span>
                        </div>
                        <div className="flex items-start">
                          <div className="w-2 h-2 bg-blue-500 rounded-full mr-3 mt-2"></div>
                          <span className="text-gray-700"><strong>Real-time calculations</strong> with instant results and visual charts</span>
                        </div>
                        <div className="flex items-start">
                          <div className="w-2 h-2 bg-blue-500 rounded-full mr-3 mt-2"></div>
                          <span className="text-gray-700"><strong>Flexible time periods</strong> - calculate in years or months</span>
                        </div>
                        <div className="flex items-start">
                          <div className="w-2 h-2 bg-blue-500 rounded-full mr-3 mt-2"></div>
                          <span className="text-gray-700"><strong>Comprehensive analysis</strong> including gains breakdown and return percentages</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Key Features and Benefits */}
              <section className="mt-12 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl shadow-lg p-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
                  SIP Calculator Features & Benefits
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <Card className="bg-white border-0 shadow-sm">
                    <CardContent className="p-8">
                      <h3 className="text-xl font-semibold text-gray-900 mb-6">🌟 Advanced Features</h3>
                      <div className="space-y-4">
                        <div className="flex items-start">
                          <div className="w-2 h-2 bg-blue-500 rounded-full mr-3 mt-2"></div>
                          <div>
                            <h4 className="font-semibold text-gray-900">Multi-Currency Support</h4>
                            <p className="text-gray-600">Calculate SIP returns in 10+ major currencies including USD, EUR, GBP, INR, JPY, and more</p>
                          </div>
                        </div>
                        <div className="flex items-start">
                          <div className="w-2 h-2 bg-blue-500 rounded-full mr-3 mt-2"></div>
                          <div>
                            <h4 className="font-semibold text-gray-900">Flexible Time Periods</h4>
                            <p className="text-gray-600">Input investment duration in years or months for precise planning</p>
                          </div>
                        </div>
                        <div className="flex items-start">
                          <div className="w-2 h-2 bg-blue-500 rounded-full mr-3 mt-2"></div>
                          <div>
                            <h4 className="font-semibold text-gray-900">Detailed Visual Analysis</h4>
                            <p className="text-gray-600">Interactive charts showing investment vs. gains breakdown</p>
                          </div>
                        </div>
                        <div className="flex items-start">
                          <div className="w-2 h-2 bg-blue-500 rounded-full mr-3 mt-2"></div>
                          <div>
                            <h4 className="font-semibold text-gray-900">Real-time Calculations</h4>
                            <p className="text-gray-600">Instant results with comprehensive breakdown of returns</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-white border-0 shadow-sm">
                    <CardContent className="p-8">
                      <h3 className="text-xl font-semibold text-gray-900 mb-6">💰 Investment Benefits</h3>
                      <div className="space-y-4">
                        <div className="flex items-start">
                          <div className="w-2 h-2 bg-green-500 rounded-full mr-3 mt-2"></div>
                          <div>
                            <h4 className="font-semibold text-gray-900">Rupee Cost Averaging</h4>
                            <p className="text-gray-600">Reduces impact of market volatility through systematic investing</p>
                          </div>
                        </div>
                        <div className="flex items-start">
                          <div className="w-2 h-2 bg-green-500 rounded-full mr-3 mt-2"></div>
                          <div>
                            <h4 className="font-semibold text-gray-900">Power of Compounding</h4>
                            <p className="text-gray-600">Exponential growth through reinvestment of returns over time</p>
                          </div>
                        </div>
                        <div className="flex items-start">
                          <div className="w-2 h-2 bg-green-500 rounded-full mr-3 mt-2"></div>
                          <div>
                            <h4 className="font-semibold text-gray-900">Disciplined Investing</h4>
                            <p className="text-gray-600">Automated approach removes emotional decision-making</p>
                          </div>
                        </div>
                        <div className="flex items-start">
                          <div className="w-2 h-2 bg-green-500 rounded-full mr-3 mt-2"></div>
                          <div>
                            <h4 className="font-semibold text-gray-900">Flexible Investment Amounts</h4>
                            <p className="text-gray-600">Start with small amounts and increase over time</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </section>

              {/* How SIP Calculator Works */}
              <section className="mt-12 bg-white rounded-2xl shadow-lg p-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
                  How Does the SIP Calculator Work?
                </h2>
                <div className="max-w-4xl mx-auto">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-2xl font-bold text-blue-600">1</span>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Input Investment Details</h3>
                      <p className="text-gray-600">Enter your monthly investment amount, time period, and expected return rate</p>
                    </div>
                    <div className="text-center">
                      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-2xl font-bold text-green-600">2</span>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Calculate Returns</h3>
                      <p className="text-gray-600">Our advanced algorithm computes compound growth using the SIP formula</p>
                    </div>
                    <div className="text-center">
                      <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-2xl font-bold text-purple-600">3</span>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Analyze Results</h3>
                      <p className="text-gray-600">View detailed breakdown with visual charts and investment projections</p>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-xl p-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">SIP Formula Explained</h3>
                    <div className="bg-white rounded-lg p-4 border-l-4 border-blue-500 mb-4">
                      <code className="text-sm font-mono text-gray-700">
                        M = P × [(1 + i)^n - 1] / i × (1 + i)
                      </code>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <strong className="text-gray-900">M:</strong> <span className="text-gray-600">Maturity Amount</span>
                      </div>
                      <div>
                        <strong className="text-gray-900">P:</strong> <span className="text-gray-600">Monthly Investment</span>
                      </div>
                      <div>
                        <strong className="text-gray-900">i:</strong> <span className="text-gray-600">Monthly Interest Rate</span>
                      </div>
                      <div>
                        <strong className="text-gray-900">n:</strong> <span className="text-gray-600">Number of Months</span>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* SIP Investment Strategies */}
              <section className="mt-12 bg-white rounded-2xl shadow-lg p-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
                  SIP Investment Strategies & Best Practices
                </h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-6">📈 Investment Strategies</h3>
                    <div className="space-y-4">
                      <div className="border-l-4 border-blue-500 pl-4">
                        <h4 className="font-semibold text-gray-900 mb-1">Step-Up SIP</h4>
                        <p className="text-gray-600 text-sm">Increase your SIP amount annually by 10-15% to accelerate wealth creation</p>
                      </div>
                      <div className="border-l-4 border-green-500 pl-4">
                        <h4 className="font-semibold text-gray-900 mb-1">Goal-Based SIP</h4>
                        <p className="text-gray-600 text-sm">Align SIP investments with specific financial goals like retirement or education</p>
                      </div>
                      <div className="border-l-4 border-purple-500 pl-4">
                        <h4 className="font-semibold text-gray-900 mb-1">Diversified SIP Portfolio</h4>
                        <p className="text-gray-600 text-sm">Spread investments across different fund categories for risk mitigation</p>
                      </div>
                      <div className="border-l-4 border-orange-500 pl-4">
                        <h4 className="font-semibold text-gray-900 mb-1">Long-Term SIP</h4>
                        <p className="text-gray-600 text-sm">Invest for 10+ years to maximize the benefits of compounding</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-6">💡 Best Practices</h3>
                    <div className="space-y-4">
                      <div className="bg-yellow-50 rounded-lg p-4">
                        <h4 className="font-semibold text-gray-900 mb-2">Start Early</h4>
                        <p className="text-gray-600 text-sm">The earlier you start, the more time your money has to compound and grow</p>
                      </div>
                      <div className="bg-blue-50 rounded-lg p-4">
                        <h4 className="font-semibold text-gray-900 mb-2">Stay Consistent</h4>
                        <p className="text-gray-600 text-sm">Don't pause SIPs during market downturns - volatility actually benefits SIP investors</p>
                      </div>
                      <div className="bg-green-50 rounded-lg p-4">
                        <h4 className="font-semibold text-gray-900 mb-2">Review Regularly</h4>
                        <p className="text-gray-600 text-sm">Monitor performance annually and rebalance portfolio if needed</p>
                      </div>
                      <div className="bg-purple-50 rounded-lg p-4">
                        <h4 className="font-semibold text-gray-900 mb-2">Choose Right Funds</h4>
                        <p className="text-gray-600 text-sm">Select funds based on your risk tolerance, investment horizon, and financial goals</p>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Audience-Specific Benefits */}
              <section className="mt-12 bg-white rounded-2xl shadow-lg p-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
                  SIP Calculator Benefits for Different Audiences
                </h2>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
                  <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-0 shadow-sm">
                    <CardContent className="p-8">
                      <div className="text-center mb-6">
                        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <GraduationCap className="w-8 h-8 text-blue-600" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900">Students & Young Professionals</h3>
                      </div>
                      <ul className="space-y-3 text-sm text-gray-600">
                        <li className="flex items-start">
                          <div className="w-2 h-2 bg-blue-500 rounded-full mr-3 mt-2"></div>
                          <span>Start investing with as little as $25-50 per month during college</span>
                        </li>
                        <li className="flex items-start">
                          <div className="w-2 h-2 bg-blue-500 rounded-full mr-3 mt-2"></div>
                          <span>Build financial discipline early in your career</span>
                        </li>
                        <li className="flex items-start">
                          <div className="w-2 h-2 bg-blue-500 rounded-full mr-3 mt-2"></div>
                          <span>Take advantage of 30+ years of compounding for retirement</span>
                        </li>
                        <li className="flex items-start">
                          <div className="w-2 h-2 bg-blue-500 rounded-full mr-3 mt-2"></div>
                          <span>Calculate education loan repayment vs investment returns</span>
                        </li>
                      </ul>
                      <div className="mt-4 p-3 bg-blue-100 rounded-lg">
                        <p className="text-xs text-blue-800">
                          <strong>Pro Tip:</strong> Use our <a href="/tools/education-loan-calculator" className="underline hover:text-blue-900">Education Loan Calculator</a> to compare loan payments with SIP investments.
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-0 shadow-sm">
                    <CardContent className="p-8">
                      <div className="text-center mb-6">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <TrendingUp className="w-8 h-8 text-green-600" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900">Working Professionals</h3>
                      </div>
                      <ul className="space-y-3 text-sm text-gray-600">
                        <li className="flex items-start">
                          <div className="w-2 h-2 bg-green-500 rounded-full mr-3 mt-2"></div>
                          <span>Automate investments to reduce emotional spending decisions</span>
                        </li>
                        <li className="flex items-start">
                          <div className="w-2 h-2 bg-green-500 rounded-full mr-3 mt-2"></div>
                          <span>Plan for major life goals like home purchase or marriage</span>
                        </li>
                        <li className="flex items-start">
                          <div className="w-2 h-2 bg-green-500 rounded-full mr-3 mt-2"></div>
                          <span>Build retirement corpus while managing current expenses</span>
                        </li>
                        <li className="flex items-start">
                          <div className="w-2 h-2 bg-green-500 rounded-full mr-3 mt-2"></div>
                          <span>Compare SIP returns with salary increments and bonuses</span>
                        </li>
                      </ul>
                      <div className="mt-4 p-3 bg-green-100 rounded-lg">
                        <p className="text-xs text-green-800">
                          <strong>Related Tools:</strong> <a href="/tools/retirement-calculator" className="underline hover:text-green-900">Retirement Calculator</a> | <a href="/tools/home-loan-calculator" className="underline hover:text-green-900">Home Loan Calculator</a>
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-purple-50 to-violet-50 border-0 shadow-sm">
                    <CardContent className="p-8">
                      <div className="text-center mb-6">
                        <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Shield className="w-8 h-8 text-purple-600" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900">Business Owners & Entrepreneurs</h3>
                      </div>
                      <ul className="space-y-3 text-sm text-gray-600">
                        <li className="flex items-start">
                          <div className="w-2 h-2 bg-purple-500 rounded-full mr-3 mt-2"></div>
                          <span>Create multiple income streams beyond business profits</span>
                        </li>
                        <li className="flex items-start">
                          <div className="w-2 h-2 bg-purple-500 rounded-full mr-3 mt-2"></div>
                          <span>Plan for business expansion or exit strategy funding</span>
                        </li>
                        <li className="flex items-start">
                          <div className="w-2 h-2 bg-purple-500 rounded-full mr-3 mt-2"></div>
                          <span>Build personal wealth separate from business assets</span>
                        </li>
                        <li className="flex items-start">
                          <div className="w-2 h-2 bg-purple-500 rounded-full mr-3 mt-2"></div>
                          <span>Compare SIP returns with business reinvestment ROI</span>
                        </li>
                      </ul>
                      <div className="mt-4 p-3 bg-purple-100 rounded-lg">
                        <p className="text-xs text-purple-800">
                          <strong>Business Tools:</strong> <a href="/tools/business-loan-calculator" className="underline hover:text-purple-900">Business Loan Calculator</a> | <a href="/tools/roi-calculator" className="underline hover:text-purple-900">ROI Calculator</a>
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </section>

              {/* SIP Use Cases */}
              <section className="mt-12 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-2xl shadow-lg p-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
                  Common SIP Investment Use Cases
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <Card className="bg-white border-0 shadow-sm">
                    <CardContent className="p-6">
                      <div className="text-center mb-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                          <GraduationCap className="w-5 h-5 text-blue-600" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900">Education Planning</h3>
                      </div>
                      <p className="text-gray-600 text-sm text-center">
                        Build a corpus for your child's higher education expenses through systematic investing over 10-15 years
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="bg-white border-0 shadow-sm">
                    <CardContent className="p-6">
                      <div className="text-center mb-4">
                        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                          <Home className="w-5 h-5 text-green-600" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900">Home Purchase</h3>
                      </div>
                      <p className="text-gray-600 text-sm text-center">
                        Accumulate funds for down payment on your dream home through disciplined SIP investing
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="bg-white border-0 shadow-sm">
                    <CardContent className="p-6">
                      <div className="text-center mb-4">
                        <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                          <Umbrella className="w-5 h-5 text-purple-600" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900">Retirement Planning</h3>
                      </div>
                      <p className="text-gray-600 text-sm text-center">
                        Create a substantial retirement corpus by investing consistently for 20-30 years
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="bg-white border-0 shadow-sm">
                    <CardContent className="p-6">
                      <div className="text-center mb-4">
                        <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                          <Shield className="w-5 h-5 text-red-600" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900">Emergency Fund</h3>
                      </div>
                      <p className="text-gray-600 text-sm text-center">
                        Build a safety net equivalent to 6-12 months of expenses through regular SIP investments
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="bg-white border-0 shadow-sm">
                    <CardContent className="p-6">
                      <div className="text-center mb-4">
                        <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-3">
                          <Car className="w-5 h-5 text-yellow-600" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900">Vehicle Purchase</h3>
                      </div>
                      <p className="text-gray-600 text-sm text-center">
                        Save for your next vehicle upgrade by systematically investing in growth-oriented funds
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="bg-white border-0 shadow-sm">
                    <CardContent className="p-6">
                      <div className="text-center mb-4">
                        <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-3">
                          <TrendingUp className="w-5 h-5 text-indigo-600" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900">Wealth Creation</h3>
                      </div>
                      <p className="text-gray-600 text-sm text-center">
                        Build long-term wealth through the power of compounding and systematic investment discipline
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </section>

              {/* SIP vs Lump Sum */}
              <section className="mt-12 bg-white rounded-2xl shadow-lg p-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
                  SIP vs Lump Sum Investment: Which is Better?
                </h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="p-4 font-semibold text-gray-900 border border-gray-200">Aspect</th>
                        <th className="p-4 font-semibold text-gray-900 border border-gray-200">SIP Investment</th>
                        <th className="p-4 font-semibold text-gray-900 border border-gray-200">Lump Sum Investment</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="p-4 font-medium text-gray-900 border border-gray-200">Market Timing</td>
                        <td className="p-4 text-gray-600 border border-gray-200">No timing required</td>
                        <td className="p-4 text-gray-600 border border-gray-200">Requires perfect timing</td>
                      </tr>
                      <tr className="bg-gray-25">
                        <td className="p-4 font-medium text-gray-900 border border-gray-200">Investment Amount</td>
                        <td className="p-4 text-gray-600 border border-gray-200">Small regular amounts</td>
                        <td className="p-4 text-gray-600 border border-gray-200">Large one-time amount</td>
                      </tr>
                      <tr>
                        <td className="p-4 font-medium text-gray-900 border border-gray-200">Risk Level</td>
                        <td className="p-4 text-gray-600 border border-gray-200">Lower (averaged out)</td>
                        <td className="p-4 text-gray-600 border border-gray-200">Higher (market dependent)</td>
                      </tr>
                      <tr className="bg-gray-25">
                        <td className="p-4 font-medium text-gray-900 border border-gray-200">Discipline Required</td>
                        <td className="p-4 text-gray-600 border border-gray-200">Builds investment habit</td>
                        <td className="p-4 text-gray-600 border border-gray-200">One-time decision</td>
                      </tr>
                      <tr>
                        <td className="p-4 font-medium text-gray-900 border border-gray-200">Best For</td>
                        <td className="p-4 text-gray-600 border border-gray-200">Regular income earners</td>
                        <td className="p-4 text-gray-600 border border-gray-200">Windfall recipients</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                
                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <h3 className="font-semibold text-blue-900 mb-2">💡 Expert Recommendation</h3>
                  <p className="text-blue-800 text-sm">
                    For most investors, SIP is the preferred approach as it removes the guesswork of market timing and 
                    builds disciplined investment habits. However, if you have a lump sum and the market is significantly 
                    undervalued, a lump sum investment might yield better returns.
                  </p>
                </div>
              </section>

              {/* FAQ Section */}
              <section className="mt-12 bg-gray-50 rounded-2xl shadow-lg p-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
                  Frequently Asked Questions
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">What is the minimum amount for SIP?</h3>
                      <p className="text-gray-600">Most mutual funds allow SIP investments starting from $25-$100 per month, making it accessible for all income levels.</p>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Can I change my SIP amount?</h3>
                      <p className="text-gray-600">Yes, most fund houses allow you to increase, decrease, or pause your SIP amount based on your financial situation.</p>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Is SIP better than FD (Fixed Deposit)?</h3>
                      <p className="text-gray-600">SIPs in equity funds historically provide better inflation-adjusted returns than FDs, though they carry market risk.</p>
                    </div>
                  </div>
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">How accurate is this SIP calculator?</h3>
                      <p className="text-gray-600">Our calculator uses the standard SIP formula and provides accurate projections based on your inputs. However, actual returns may vary.</p>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">What's a good expected return rate?</h3>
                      <p className="text-gray-600">Historically, diversified equity funds average 12-15% annually, while debt funds provide 6-8% returns over long periods.</p>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Should I stop SIP during market downturns?</h3>
                      <p className="text-gray-600">No, continuing SIP during downturns helps you buy more units at lower prices, benefiting from rupee cost averaging.</p>
                    </div>
                  </div>
                </div>
              </section>

              {/* Related Investment Tools */}
              <section className="mt-12 bg-white rounded-2xl shadow-lg p-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
                  Complete Your Investment Planning
                </h2>
                <p className="text-lg text-gray-600 mb-8 text-center max-w-3xl mx-auto">
                  Maximize your investment strategy by using our comprehensive suite of financial calculators. Each tool is designed to help you make informed investment decisions and achieve your financial goals.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <a href="/tools/compound-interest-calculator" className="group p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-100 hover:border-blue-200 hover:shadow-lg transition-all">
                    <div className="flex items-center mb-4">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3 group-hover:scale-110 transition-transform">
                        <Calculator className="w-5 h-5 text-blue-600" />
                      </div>
                      <h3 className="font-semibold text-gray-900">Compound Interest Calculator</h3>
                    </div>
                    <p className="text-gray-600 text-sm">Calculate compound growth for lump sum investments and compare with SIP returns.</p>
                  </a>

                  <a href="/tools/retirement-calculator" className="group p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-100 hover:border-green-200 hover:shadow-lg transition-all">
                    <div className="flex items-center mb-4">
                      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-3 group-hover:scale-110 transition-transform">
                        <Umbrella className="w-5 h-5 text-green-600" />
                      </div>
                      <h3 className="font-semibold text-gray-900">Retirement Calculator</h3>
                    </div>
                    <p className="text-gray-600 text-sm">Plan your retirement corpus and determine optimal SIP amounts for your golden years.</p>
                  </a>

                  <a href="/tools/investment-return-calculator" className="group p-6 bg-gradient-to-br from-purple-50 to-violet-50 rounded-xl border border-purple-100 hover:border-purple-200 hover:shadow-lg transition-all">
                    <div className="flex items-center mb-4">
                      <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mr-3 group-hover:scale-110 transition-transform">
                        <TrendingUp className="w-5 h-5 text-purple-600" />
                      </div>
                      <h3 className="font-semibold text-gray-900">Investment Return Calculator</h3>
                    </div>
                    <p className="text-gray-600 text-sm">Analyze returns from various investment options and compare with SIP performance.</p>
                  </a>

                  <a href="/tools/savings-goal-calculator" className="group p-6 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl border border-yellow-100 hover:border-yellow-200 hover:shadow-lg transition-all">
                    <div className="flex items-center mb-4">
                      <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center mr-3 group-hover:scale-110 transition-transform">
                        <Coins className="w-5 h-5 text-yellow-600" />
                      </div>
                      <h3 className="font-semibold text-gray-900">Savings Goal Calculator</h3>
                    </div>
                    <p className="text-gray-600 text-sm">Set specific financial goals and determine the required SIP amount to achieve them.</p>
                  </a>

                  <a href="/tools/inflation-calculator" className="group p-6 bg-gradient-to-br from-red-50 to-pink-50 rounded-xl border border-red-100 hover:border-red-200 hover:shadow-lg transition-all">
                    <div className="flex items-center mb-4">
                      <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center mr-3 group-hover:scale-110 transition-transform">
                        <TrendingUp className="w-5 h-5 text-red-600" />
                      </div>
                      <h3 className="font-semibold text-gray-900">Inflation Calculator</h3>
                    </div>
                    <p className="text-gray-600 text-sm">Understand inflation impact on your investments and adjust SIP amounts accordingly.</p>
                  </a>

                  <a href="/tools/roi-calculator" className="group p-6 bg-gradient-to-br from-teal-50 to-cyan-50 rounded-xl border border-teal-100 hover:border-teal-200 hover:shadow-lg transition-all">
                    <div className="flex items-center mb-4">
                      <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center mr-3 group-hover:scale-110 transition-transform">
                        <Calculator className="w-5 h-5 text-teal-600" />
                      </div>
                      <h3 className="font-semibold text-gray-900">ROI Calculator</h3>
                    </div>
                    <p className="text-gray-600 text-sm">Calculate return on investment for different assets and compare with SIP returns.</p>
                  </a>
                </div>

                <div className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 text-center">💡 Investment Planning Pro Tip</h3>
                  <p className="text-gray-700 text-center">
                    Combine multiple calculators for comprehensive financial planning. Start with our SIP calculator to plan regular investments, 
                    use the <a href="/tools/retirement-calculator" className="text-blue-600 hover:text-blue-700 underline">Retirement Calculator</a> for long-term goals, 
                    and the <a href="/tools/inflation-calculator" className="text-blue-600 hover:text-blue-700 underline">Inflation Calculator</a> to ensure your investments beat inflation.
                  </p>
                </div>
              </section>

              {/* Currency Information */}
              <div className="mt-8 bg-blue-50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                  <Globe className="w-5 h-5 mr-2" />
                  Global Investment Planning
                </h3>
                <p className="text-gray-600">
                  This SIP calculator supports major global currencies including USD, EUR, GBP, INR, JPY, CAD, AUD, CNY, BRL, and MXN. 
                  Plan your systematic investments regardless of your location. The principles of SIP investing apply worldwide through 
                  mutual funds, ETFs, and other investment vehicles.
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

export default SIPCalculator;