
import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface SIPResult {
  maturityAmount: number;
  totalInvested: number;
  totalGains: number;
  monthlyInvestment: number;
  investmentPeriod: number;
  gainPercentage: number;
  annualizedReturn: number;
}

export default function SIPCalculator() {
  const [monthlyInvestment, setMonthlyInvestment] = useState('1000');
  const [investmentPeriod, setInvestmentPeriod] = useState('10');
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
      const maturityAmount = monthlyAmount * 
        (Math.pow(1 + monthlyReturn, totalMonths) - 1) / monthlyReturn * (1 + monthlyReturn);
      
      const totalInvested = monthlyAmount * totalMonths;
      const totalGains = maturityAmount - totalInvested;
      const gainPercentage = (totalGains / totalInvested) * 100;
      const investmentYears = periodType === 'years' ? parseFloat(investmentPeriod) : parseFloat(investmentPeriod) / 12;
      const annualizedReturn = (Math.pow(maturityAmount / totalInvested, 1 / investmentYears) - 1) * 100;

      setResult({
        maturityAmount: Math.round(maturityAmount * 100) / 100,
        totalInvested: Math.round(totalInvested * 100) / 100,
        totalGains: Math.round(totalGains * 100) / 100,
        monthlyInvestment: monthlyAmount,
        investmentPeriod: investmentYears,
        gainPercentage: Math.round(gainPercentage * 100) / 100,
        annualizedReturn: Math.round(annualizedReturn * 100) / 100
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
        gainPercentage: 0,
        annualizedReturn: 0
      });
    }
  };

  const resetCalculator = () => {
    setMonthlyInvestment('1000');
    setInvestmentPeriod('10');
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Helmet>
        <title>SIP Calculator - Systematic Investment Plan Calculator | DapsiWow</title>
        <meta name="description" content="Free SIP calculator to calculate returns on Systematic Investment Plan. Plan your mutual fund investments with step-up SIP options and see how your regular investments can grow into substantial wealth. Support for multiple currencies worldwide." />
        <meta name="keywords" content="SIP calculator, systematic investment plan calculator, SIP returns calculator, mutual fund SIP calculator, investment SIP calculator, SIP maturity calculator, monthly investment calculator, SIP planning tool, systematic investment calculator, SIP growth calculator" />
        <meta property="og:title" content="SIP Calculator - Systematic Investment Plan Calculator | DapsiWow" />
        <meta property="og:description" content="Free SIP calculator for systematic investment planning with multi-currency support. Calculate SIP returns and plan your mutual fund investments effectively." />
        <meta property="og:type" content="website" />
        <meta name="robots" content="index, follow" />
        <meta name="author" content="DapsiWow" />
        <link rel="canonical" href="https://dapsiwow.com/tools/sip-calculator" />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            "name": "SIP Calculator",
            "description": "Free online SIP calculator to calculate returns on Systematic Investment Plan for mutual funds, ETFs, and other investment vehicles. Features multi-currency support and comprehensive investment analysis.",
            "url": "https://dapsiwow.com/tools/sip-calculator",
            "applicationCategory": "FinanceApplication",
            "operatingSystem": "Any",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "USD"
            },
            "featureList": [
              "Calculate SIP returns for any investment amount",
              "Support for multiple currencies",
              "Flexible investment period calculations",
              "Comprehensive investment analysis",
              "Expected return calculations",
              "Investment growth projections"
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
                <span className="text-sm font-medium text-blue-700">Professional SIP Calculator</span>
              </div>
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-slate-900 leading-tight">
                Smart SIP
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                  Calculator
                </span>
              </h1>
              <p className="text-xl sm:text-2xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
                Calculate returns on your Systematic Investment Plan and see how regular investments can build wealth
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
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">SIP Configuration</h2>
                    <p className="text-gray-600">Enter your investment details to calculate SIP returns</p>
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

                    {/* Monthly Investment */}
                    <div className="space-y-3">
                      <Label htmlFor="monthly-investment" className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                        Monthly Investment
                      </Label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-lg">$</span>
                        <Input
                          id="monthly-investment"
                          type="number"
                          value={monthlyInvestment}
                          onChange={(e) => setMonthlyInvestment(e.target.value)}
                          className="h-14 pl-8 text-lg border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-blue-500"
                          placeholder="1,000"
                          min="1"
                          step="1"
                          data-testid="input-monthly-investment"
                        />
                      </div>
                    </div>

                    {/* Investment Period */}
                    <div className="space-y-3">
                      <Label className="text-sm font-semibold text-gray-800 uppercase tracking-wide">Investment Period</Label>
                      <div className="grid grid-cols-2 gap-3">
                        <Input
                          type="number"
                          value={investmentPeriod}
                          onChange={(e) => setInvestmentPeriod(e.target.value)}
                          className="h-14 text-lg border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-blue-500"
                          placeholder="10"
                          min="1"
                          data-testid="input-investment-period"
                        />
                        <Select value={periodType} onValueChange={setPeriodType}>
                          <SelectTrigger className="h-14 border-2 border-gray-200 rounded-xl text-lg" data-testid="select-period-type">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="years">Years</SelectItem>
                            <SelectItem value="months">Months</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Expected Return */}
                    <div className="space-y-3">
                      <Label htmlFor="expected-return" className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                        Expected Annual Return
                      </Label>
                      <div className="relative">
                        <Input
                          id="expected-return"
                          type="number"
                          value={expectedReturn}
                          onChange={(e) => setExpectedReturn(e.target.value)}
                          className="h-14 pr-8 text-lg border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-blue-500"
                          placeholder="12.0"
                          min="0"
                          max="50"
                          step="0.1"
                          data-testid="input-expected-return"
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 text-lg">%</span>
                      </div>
                      <p className="text-sm text-gray-500">
                        Typical equity mutual funds average 12-15% annually over long term
                      </p>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-4 pt-6">
                    <Button
                      onClick={calculateSIP}
                      className="flex-1 h-14 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold text-lg rounded-xl shadow-lg transform transition-all duration-200 hover:scale-105"
                      data-testid="button-calculate"
                    >
                      Calculate SIP
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
                  <h2 className="text-2xl font-bold text-gray-900 mb-8">Investment Projection</h2>
                  
                  {result ? (
                    <div className="space-y-6" data-testid="sip-results">
                      {/* Maturity Amount Highlight */}
                      <div className="bg-white rounded-2xl p-6 shadow-lg border border-green-100">
                        <div className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-2">Maturity Amount</div>
                        <div className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-600" data-testid="text-maturity-amount">
                          {formatCurrency(result.maturityAmount)}
                        </div>
                      </div>

                      {/* Investment Breakdown */}
                      <div className="space-y-4">
                        <div className="bg-white rounded-xl p-4 shadow-sm">
                          <div className="flex justify-between items-center">
                            <span className="font-medium text-gray-700">Total Investment</span>
                            <span className="font-bold text-gray-900" data-testid="text-total-invested">
                              {formatCurrency(result.totalInvested)}
                            </span>
                          </div>
                        </div>
                        <div className="bg-white rounded-xl p-4 shadow-sm">
                          <div className="flex justify-between items-center">
                            <span className="font-medium text-gray-700">Total Gains</span>
                            <span className="font-bold text-green-600" data-testid="text-total-gains">
                              {formatCurrency(result.totalGains)}
                            </span>
                          </div>
                        </div>
                        <div className="bg-white rounded-xl p-4 shadow-sm">
                          <div className="flex justify-between items-center">
                            <span className="font-medium text-gray-700">Investment Period</span>
                            <span className="font-bold text-gray-900" data-testid="text-investment-years">
                              {result.investmentPeriod} years
                            </span>
                          </div>
                        </div>
                        <div className="bg-white rounded-xl p-4 shadow-sm">
                          <div className="flex justify-between items-center">
                            <span className="font-medium text-gray-700">Annualized Return</span>
                            <span className="font-bold text-blue-600" data-testid="text-annualized-return">
                              {result.annualizedReturn}%
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Visual Breakdown */}
                      <div className="bg-white rounded-xl p-6 shadow-sm">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Investment Breakdown</h3>
                        <div className="space-y-3">
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
                    </div>
                  ) : (
                    <div className="text-center py-16" data-testid="no-results">
                      <div className="w-20 h-20 bg-gray-200 rounded-full mx-auto mb-6 flex items-center justify-center">
                        <div className="text-3xl font-bold text-gray-400">$</div>
                      </div>
                      <p className="text-gray-500 text-lg">Enter SIP details and calculate to see investment projections</p>
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
                <h3 className="text-2xl font-bold text-gray-900 mb-6">What is SIP?</h3>
                <div className="space-y-4 text-gray-600">
                  <p>
                    SIP stands for Systematic Investment Plan - a disciplined investment approach that allows you to 
                    invest a fixed amount regularly in mutual funds, ETFs, or other investment vehicles. This method 
                    harnesses the power of compound growth and rupee cost averaging to build substantial wealth over time.
                  </p>
                  <p>
                    Our SIP calculator helps you project the future value of your systematic investments with precision. 
                    Whether you're planning for retirement, children's education, or wealth creation, this tool provides 
                    accurate calculations with multi-currency support and comprehensive analysis.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">How to Calculate SIP Returns?</h3>
                <div className="space-y-4 text-gray-600">
                  <p>
                    The SIP formula is: M = P × [{(1+R)^N-1}/R] × (1+R)
                  </p>
                  <ul className="space-y-2 list-disc list-inside">
                    <li>M = Maturity amount</li>
                    <li>P = Monthly investment amount</li>
                    <li>R = Expected monthly rate of return</li>
                    <li>N = Number of monthly payments</li>
                  </ul>
                  <p>
                    Our calculator automatically applies this formula and provides detailed insights including total 
                    gains, investment breakdown, and annualized returns to help you make informed investment decisions.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Features of Our SIP Calculator</h3>
                <div className="space-y-3 text-gray-600">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Multi-currency support for global investors</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Flexible time periods (years or months)</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Comprehensive investment analysis</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Visual breakdown of investments and gains</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Real-time calculations with instant results</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Benefits of SIP Investment</h3>
                <div className="space-y-3 text-gray-600">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Rupee cost averaging reduces market volatility impact</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Power of compounding grows wealth exponentially</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Disciplined investing without emotional decisions</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Start with small amounts and increase gradually</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Tax benefits on certain investment types</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Additional SEO Content Sections */}
          <div className="mt-12 space-y-8">
            {/* Types of SIP Investments */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Types of SIP Investments</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-gray-800">Equity Mutual Funds</h4>
                    <p className="text-gray-600">
                      Invest in stocks for long-term wealth creation. Equity funds typically offer higher returns 
                      but come with market risk. Ideal for goals beyond 5 years with potential for 12-15% annual returns.
                    </p>
                  </div>
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-gray-800">Debt Mutual Funds</h4>
                    <p className="text-gray-600">
                      Conservative investment in bonds and fixed-income securities. Debt funds provide steady returns 
                      with lower risk, typically offering 6-8% annual returns suitable for short to medium-term goals.
                    </p>
                  </div>
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-gray-800">Hybrid Funds</h4>
                    <p className="text-gray-600">
                      Balanced approach combining equity and debt investments. Hybrid funds offer moderate risk with 
                      potential for 8-12% returns, suitable for investors seeking balanced growth and stability.
                    </p>
                  </div>
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-gray-800">Index Funds & ETFs</h4>
                    <p className="text-gray-600">
                      Passive investment tracking market indices with low fees. Index funds offer market returns 
                      with minimal management costs, ideal for long-term investors seeking broad market exposure.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* SIP Planning Strategies */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
                <CardContent className="p-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">SIP Planning Strategies</h3>
                  <div className="space-y-4 text-gray-600">
                    <div className="bg-blue-50 rounded-lg p-4">
                      <h4 className="font-semibold text-blue-800 mb-2">Goal-Based Investing</h4>
                      <p className="text-sm text-blue-700">Align SIP investments with specific financial goals like retirement, education, or home buying. Different goals require different fund types and time horizons.</p>
                    </div>
                    <div className="bg-green-50 rounded-lg p-4">
                      <h4 className="font-semibold text-green-800 mb-2">Step-Up SIP</h4>
                      <p className="text-sm text-green-700">Increase SIP amount annually by 10-15% to match salary growth and inflation. This strategy significantly enhances wealth creation over time.</p>
                    </div>
                    <div className="bg-orange-50 rounded-lg p-4">
                      <h4 className="font-semibold text-orange-800 mb-2">Asset Allocation</h4>
                      <p className="text-sm text-orange-700">Diversify SIP investments across equity, debt, and international funds based on age, risk tolerance, and financial goals.</p>
                    </div>
                    <div className="bg-purple-50 rounded-lg p-4">
                      <h4 className="font-semibold text-purple-800 mb-2">Regular Review</h4>
                      <p className="text-sm text-purple-700">Review SIP performance annually and rebalance portfolio as needed. Stay committed to long-term goals despite short-term market fluctuations.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
                <CardContent className="p-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">SIP vs Other Investments</h3>
                  <div className="space-y-4 text-gray-600">
                    <div className="border-l-4 border-blue-500 pl-4">
                      <h4 className="font-semibold text-gray-800 mb-2">SIP vs Fixed Deposits</h4>
                      <p className="text-sm">SIP in equity funds historically provides better inflation-adjusted returns than FDs, though with market risk. Long-term SIP investing typically outperforms FD returns.</p>
                    </div>
                    <div className="border-l-4 border-green-500 pl-4">
                      <h4 className="font-semibold text-gray-800 mb-2">SIP vs Lump Sum</h4>
                      <p className="text-sm">SIP reduces timing risk through rupee cost averaging and makes investing more affordable. Lump sum can work better in rising markets but SIP is more practical for most investors.</p>
                    </div>
                    <div className="border-l-4 border-orange-500 pl-4">
                      <h4 className="font-semibold text-gray-800 mb-2">SIP vs Real Estate</h4>
                      <p className="text-sm">SIP offers better liquidity, lower transaction costs, and professional management compared to real estate. Both can be part of a diversified investment strategy.</p>
                    </div>
                    <div className="border-l-4 border-purple-500 pl-4">
                      <h4 className="font-semibold text-gray-800 mb-2">SIP vs Gold</h4>
                      <p className="text-sm">SIP in equity funds typically provides better long-term returns than gold while gold acts as a hedge against inflation. A balanced portfolio can include both.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* SIP FAQs Section */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-8">Frequently Asked Questions about SIP</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">What is the minimum SIP amount?</h4>
                      <p className="text-gray-600 text-sm">Most mutual funds allow SIP investments starting from $25-$100 per month, making it accessible for investors with limited capital.</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">Can I change or stop my SIP?</h4>
                      <p className="text-gray-600 text-sm">Yes, SIP offers flexibility to increase, decrease, pause, or stop investments based on your financial situation. No penalty for stopping SIP investments.</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">How accurate is this SIP calculator?</h4>
                      <p className="text-gray-600 text-sm">Our calculator uses the standard SIP formula and provides accurate projections based on your inputs. However, actual returns may vary due to market conditions.</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">What happens if I miss a SIP installment?</h4>
                      <p className="text-gray-600 text-sm">Missing occasional SIP payments won't terminate your plan, but frequent misses may lead to auto-cancellation. Maintain adequate bank balance for smooth SIP execution.</p>
                    </div>
                  </div>
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">What's a good expected return rate for SIP?</h4>
                      <p className="text-gray-600 text-sm">Historically, equity funds average 12-15% annually over 10+ years, while debt funds provide 6-8%. Use conservative estimates for financial planning.</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">Should I continue SIP during market downturns?</h4>
                      <p className="text-gray-600 text-sm">Yes, continuing SIP during downturns helps you buy more units at lower prices, maximizing long-term wealth creation through rupee cost averaging.</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">How long should I continue SIP?</h4>
                      <p className="text-gray-600 text-sm">SIP works best for long-term goals (5+ years). The longer you stay invested, the better your chances of beating inflation and achieving financial goals.</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">Are SIP returns guaranteed?</h4>
                      <p className="text-gray-600 text-sm">No, SIP returns are not guaranteed as they depend on market performance. However, disciplined long-term SIP investing historically provides positive returns.</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tax Benefits and Implications */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
                <CardContent className="p-8">
                  <h3 className="text-xl font-bold text-gray-900 mb-6">Tax-Saving SIP</h3>
                  <div className="space-y-4 text-gray-600">
                    <p className="text-sm">
                      ELSS (Equity Linked Savings Scheme) funds offer tax deductions up to $1,500 annually under Section 80C.
                    </p>
                    <div className="space-y-2">
                      <h4 className="font-semibold text-green-800 text-sm">Benefits:</h4>
                      <ul className="text-xs space-y-1 list-disc list-inside text-green-700">
                        <li>Tax deduction on investment</li>
                        <li>Potential for higher returns</li>
                        <li>Only 3-year lock-in period</li>
                      </ul>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-semibold text-red-800 text-sm">Considerations:</h4>
                      <ul className="text-xs space-y-1 list-disc list-inside text-red-700">
                        <li>Market risk involved</li>
                        <li>Lock-in period restrictions</li>
                        <li>Limited withdrawal options</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
                <CardContent className="p-8">
                  <h3 className="text-xl font-bold text-gray-900 mb-6">Long-Term Capital Gains</h3>
                  <div className="space-y-4 text-gray-600">
                    <p className="text-sm">
                      Equity mutual fund gains held for more than 1 year are considered long-term and taxed at 10% above $1,000 annually.
                    </p>
                    <div className="space-y-2">
                      <h4 className="font-semibold text-blue-800 text-sm">Tax Efficiency:</h4>
                      <ul className="text-xs space-y-1 list-disc list-inside text-blue-700">
                        <li>No tax on gains up to $1,000</li>
                        <li>10% tax on gains above $1,000</li>
                        <li>No dividend distribution tax</li>
                      </ul>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-semibold text-orange-800 text-sm">Planning Tips:</h4>
                      <ul className="text-xs space-y-1 list-disc list-inside text-orange-700">
                        <li>Hold investments for long term</li>
                        <li>Plan withdrawals strategically</li>
                        <li>Use systematic withdrawal plans</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
                <CardContent className="p-8">
                  <h3 className="text-xl font-bold text-gray-900 mb-6">Tax Harvesting</h3>
                  <div className="space-y-4 text-gray-600">
                    <p className="text-sm">
                      Strategic booking of gains and losses to optimize tax liability while maintaining investment positions.
                    </p>
                    <div className="space-y-2">
                      <h4 className="font-semibold text-purple-800 text-sm">Strategies:</h4>
                      <ul className="text-xs space-y-1 list-disc list-inside text-purple-700">
                        <li>Book gains up to exempt limit</li>
                        <li>Offset gains with losses</li>
                        <li>Switch between similar funds</li>
                      </ul>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-semibold text-gray-800 text-sm">Timing:</h4>
                      <ul className="text-xs space-y-1 list-disc list-inside text-gray-700">
                        <li>Review portfolio annually</li>
                        <li>Plan before financial year end</li>
                        <li>Consider market conditions</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Common Mistakes Section */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Common SIP Investment Mistakes to Avoid</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-r-lg">
                      <h4 className="font-semibold text-red-800 mb-2">Stopping SIP During Market Falls</h4>
                      <p className="text-red-700 text-sm">Market downturns are opportunities to accumulate more units. Stopping SIP during falls defeats the purpose of rupee cost averaging.</p>
                    </div>
                    <div className="bg-orange-50 border-l-4 border-orange-400 p-4 rounded-r-lg">
                      <h4 className="font-semibold text-orange-800 mb-2">Investing Without Clear Goals</h4>
                      <p className="text-orange-700 text-sm">Define specific financial goals before starting SIP. Different goals require different investment strategies and fund selections.</p>
                    </div>
                    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-lg">
                      <h4 className="font-semibold text-yellow-800 mb-2">Expecting Quick Returns</h4>
                      <p className="text-yellow-700 text-sm">SIP is a long-term strategy. Expecting quick returns leads to disappointment and premature exits from potentially profitable investments.</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-lg">
                      <h4 className="font-semibold text-blue-800 mb-2">Over-Diversification</h4>
                      <p className="text-blue-700 text-sm">Investing in too many similar funds dilutes returns and makes portfolio management complex. 3-5 different types of funds are usually sufficient.</p>
                    </div>
                    <div className="bg-purple-50 border-l-4 border-purple-400 p-4 rounded-r-lg">
                      <h4 className="font-semibold text-purple-800 mb-2">Ignoring Fund Performance</h4>
                      <p className="text-purple-700 text-sm">While SIP requires patience, completely ignoring poor-performing funds for years can hurt returns. Review and rebalance annually.</p>
                    </div>
                    <div className="bg-green-50 border-l-4 border-green-400 p-4 rounded-r-lg">
                      <h4 className="font-semibold text-green-800 mb-2">Not Increasing SIP Amount</h4>
                      <p className="text-green-700 text-sm">Inflation reduces money's purchasing power over time. Increase SIP amount annually by 10-15% to maintain real investment value.</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Investment Goals Section */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">SIP for Different Life Goals</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-gray-800">Retirement Planning</h4>
                    <div className="space-y-3 text-gray-600">
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-sm">Start early to leverage maximum compounding benefits</span>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-sm">Focus on equity funds for long-term wealth creation</span>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-sm">Gradually shift to debt funds as retirement approaches</span>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-sm">Target 70-80% of pre-retirement income replacement</span>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-gray-800">Children's Education</h4>
                    <div className="space-y-3 text-gray-600">
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-sm">Account for inflation in education costs (8-10% annually)</span>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-sm">Use hybrid funds for balanced growth and stability</span>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-sm">Switch to debt funds 2-3 years before need</span>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-sm">Consider international education funding requirements</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
                  <h4 className="font-semibold text-blue-800 mb-2">Smart Planning Tip</h4>
                  <p className="text-blue-700 text-sm">
                    Use our SIP calculator to plan for multiple goals simultaneously. Start separate SIPs for different 
                    objectives with appropriate fund selections based on time horizon and risk tolerance. Review and adjust 
                    annually to stay on track with your financial goals.
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
