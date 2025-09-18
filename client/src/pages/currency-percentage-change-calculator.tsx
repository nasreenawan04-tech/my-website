
import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface PercentageChangeResult {
  percentageChange: number;
  absoluteChange: number;
  oldValue: number;
  newValue: number;
  changeType: 'increase' | 'decrease' | 'no_change';
  currency: string;
}

export default function CurrencyPercentageChangeCalculator() {
  const [oldValue, setOldValue] = useState('1000');
  const [newValue, setNewValue] = useState('1200');
  const [currency, setCurrency] = useState('USD');
  const [result, setResult] = useState<PercentageChangeResult | null>(null);

  const calculatePercentageChange = () => {
    const oldVal = parseFloat(oldValue);
    const newVal = parseFloat(newValue);

    if (isNaN(oldVal) || isNaN(newVal) || oldVal === 0) return;

    const absoluteChange = newVal - oldVal;
    const percentageChange = (absoluteChange / oldVal) * 100;
    
    let changeType: 'increase' | 'decrease' | 'no_change';
    if (percentageChange > 0) {
      changeType = 'increase';
    } else if (percentageChange < 0) {
      changeType = 'decrease';
    } else {
      changeType = 'no_change';
    }

    setResult({
      percentageChange,
      absoluteChange,
      oldValue: oldVal,
      newValue: newVal,
      changeType,
      currency
    });
  };

  const resetCalculator = () => {
    setOldValue('1000');
    setNewValue('1200');
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

  const formatPercentage = (percentage: number) => {
    const sign = percentage >= 0 ? '+' : '';
    return `${sign}${percentage.toFixed(2)}%`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Helmet>
        <title>Currency Percentage Change Calculator - Track Investment Returns & Price Changes | DapsiWow</title>
        <meta name="description" content="Free currency percentage change calculator to calculate value increases, decreases, and investment returns. Track price changes, portfolio performance, and financial growth with multi-currency support and detailed analysis." />
        <meta name="keywords" content="percentage change calculator, currency percentage calculator, investment return calculator, price change calculator, value change calculator, portfolio tracking, financial analysis, currency converter, percentage increase decrease calculator" />
        <meta property="og:title" content="Currency Percentage Change Calculator - Track Investment Returns & Price Changes | DapsiWow" />
        <meta property="og:description" content="Calculate percentage changes in currency values, investments, and prices. Free tool with multi-currency support for comprehensive financial analysis and tracking." />
        <meta property="og:type" content="website" />
        <meta name="robots" content="index, follow" />
        <meta name="author" content="DapsiWow" />
        <link rel="canonical" href="https://dapsiwow.com/tools/currency-percentage-change-calculator" />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            "name": "Currency Percentage Change Calculator",
            "description": "Free online currency percentage change calculator to calculate how much a value increased or decreased in percentage terms with multi-currency support.",
            "url": "https://dapsiwow.com/tools/currency-percentage-change-calculator",
            "applicationCategory": "FinanceApplication",
            "operatingSystem": "Any",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "USD"
            },
            "featureList": [
              "Calculate percentage changes",
              "Multi-currency support",
              "Investment return analysis",
              "Price change tracking",
              "Increase/decrease calculation",
              "Portfolio performance tracking"
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
                <span className="text-sm font-medium text-blue-700">Professional Percentage Calculator</span>
              </div>
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-slate-900 leading-tight">
                Currency Percentage
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                  Change Calculator
                </span>
              </h1>
              <p className="text-xl sm:text-2xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
                Calculate percentage changes in currency values, investments, and prices with detailed analysis and multi-currency support
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
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">Percentage Change Configuration</h2>
                    <p className="text-gray-600">Enter the original and new values to calculate the percentage change</p>
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

                    {/* Empty cell for grid alignment */}
                    <div></div>

                    {/* Original Value */}
                    <div className="space-y-3">
                      <Label htmlFor="old-value" className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                        Original Value
                      </Label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-lg">$</span>
                        <Input
                          id="old-value"
                          type="number"
                          value={oldValue}
                          onChange={(e) => setOldValue(e.target.value)}
                          className="h-14 pl-8 text-lg border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-blue-500"
                          placeholder="1,000"
                          step="0.01"
                          data-testid="input-old-value"
                        />
                      </div>
                    </div>

                    {/* New Value */}
                    <div className="space-y-3">
                      <Label htmlFor="new-value" className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                        New Value
                      </Label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-lg">$</span>
                        <Input
                          id="new-value"
                          type="number"
                          value={newValue}
                          onChange={(e) => setNewValue(e.target.value)}
                          className="h-14 pl-8 text-lg border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-blue-500"
                          placeholder="1,200"
                          step="0.01"
                          data-testid="input-new-value"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-4 pt-6">
                    <Button
                      onClick={calculatePercentageChange}
                      className="flex-1 h-14 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold text-lg rounded-xl shadow-lg transform transition-all duration-200 hover:scale-105"
                      data-testid="button-calculate"
                    >
                      Calculate Change
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
                  <h2 className="text-2xl font-bold text-gray-900 mb-8">Results</h2>
                  
                  {result ? (
                    <div className="space-y-6" data-testid="percentage-results">
                      {/* Percentage Change Highlight */}
                      <div className="bg-white rounded-2xl p-6 shadow-lg border border-blue-100">
                        <div className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-2">Percentage Change</div>
                        <div className={`text-4xl font-bold ${
                          result.changeType === 'increase' ? 'text-green-600' : 
                          result.changeType === 'decrease' ? 'text-red-600' : 'text-gray-600'
                        }`} data-testid="text-percentage-change">
                          {formatPercentage(result.percentageChange)}
                        </div>
                      </div>

                      {/* Change Breakdown */}
                      <div className="space-y-4">
                        <div className="bg-white rounded-xl p-4 shadow-sm">
                          <div className="flex justify-between items-center">
                            <span className="font-medium text-gray-700">Original Value</span>
                            <span className="font-bold text-gray-900" data-testid="text-original-value">
                              {formatCurrency(result.oldValue)}
                            </span>
                          </div>
                        </div>
                        <div className="bg-white rounded-xl p-4 shadow-sm">
                          <div className="flex justify-between items-center">
                            <span className="font-medium text-gray-700">New Value</span>
                            <span className="font-bold text-gray-900" data-testid="text-new-value">
                              {formatCurrency(result.newValue)}
                            </span>
                          </div>
                        </div>
                        <div className="bg-white rounded-xl p-4 shadow-sm">
                          <div className="flex justify-between items-center">
                            <span className="font-medium text-gray-700">Absolute Change</span>
                            <span className={`font-bold ${result.absoluteChange >= 0 ? 'text-green-600' : 'text-red-600'}`} data-testid="text-absolute-change">
                              {result.absoluteChange >= 0 ? '+' : ''}{formatCurrency(result.absoluteChange)}
                            </span>
                          </div>
                        </div>
                        <div className="bg-white rounded-xl p-4 shadow-sm">
                          <div className="flex justify-between items-center">
                            <span className="font-medium text-gray-700">Change Type</span>
                            <span className={`font-bold capitalize ${
                              result.changeType === 'increase' ? 'text-green-600' : 
                              result.changeType === 'decrease' ? 'text-red-600' : 'text-gray-600'
                            }`} data-testid="text-change-type">
                              {result.changeType === 'no_change' ? 'No Change' : result.changeType}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-16" data-testid="no-results">
                      <div className="w-20 h-20 bg-gray-200 rounded-full mx-auto mb-6 flex items-center justify-center">
                        <div className="text-3xl font-bold text-gray-400">%</div>
                      </div>
                      <p className="text-gray-500 text-lg">Enter values and calculate to see percentage change results</p>
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
                <h3 className="text-2xl font-bold text-gray-900 mb-6">What is Percentage Change?</h3>
                <div className="space-y-4 text-gray-600">
                  <p>
                    Percentage change is a mathematical concept that measures the degree of change in a value over time, 
                    expressed as a percentage of the original value. This metric is fundamental in finance, business analysis, 
                    and investment tracking as it provides a standardized way to compare changes regardless of the absolute values.
                  </p>
                  <p>
                    Our currency percentage change calculator helps you quickly determine how much an investment, asset, or 
                    price has increased or decreased in percentage terms. Whether you're tracking stock performance, real 
                    estate values, or currency exchange rates, this tool provides instant and accurate calculations.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">How to Calculate Percentage Change?</h3>
                <div className="space-y-4 text-gray-600">
                  <p>
                    The percentage change formula is: Percentage Change = ((New Value - Old Value) / Old Value) × 100
                  </p>
                  <ul className="space-y-2 list-disc list-inside">
                    <li>New Value = Current or final amount</li>
                    <li>Old Value = Original or starting amount</li>
                    <li>Positive result = Increase in value</li>
                    <li>Negative result = Decrease in value</li>
                  </ul>
                  <p>
                    Our calculator automatically applies this formula and provides clear visual indicators for increases 
                    (green) or decreases (red), making it easy to interpret your results at a glance.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Common Use Cases</h3>
                <div className="space-y-3 text-gray-600">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Investment portfolio performance tracking</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Stock price movement analysis</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Real estate value appreciation or depreciation</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Currency exchange rate fluctuations</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Business revenue growth measurement</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-pink-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Commodity price change tracking</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Benefits of Our Calculator</h3>
                <div className="space-y-3 text-gray-600">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Instant percentage change calculations</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Multi-currency support for global use</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Visual indicators for increases and decreases</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Detailed breakdown of absolute and relative changes</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Free to use with no registration required</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Additional SEO Content Sections */}
          <div className="mt-12 space-y-8">
            {/* Investment Analysis Section */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Investment Performance Analysis</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-gray-800">Portfolio Tracking</h4>
                    <p className="text-gray-600">
                      Use percentage change calculations to monitor your investment portfolio's performance over different 
                      time periods. Track individual stocks, mutual funds, ETFs, and other securities to make informed 
                      investment decisions based on historical performance data.
                    </p>
                  </div>
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-gray-800">Risk Assessment</h4>
                    <p className="text-gray-600">
                      Percentage changes help quantify investment volatility and risk. Large percentage swings indicate 
                      higher volatility, while smaller, consistent changes suggest more stable investments. This information 
                      is crucial for portfolio diversification and risk management.
                    </p>
                  </div>
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-gray-800">Benchmark Comparison</h4>
                    <p className="text-gray-600">
                      Compare your investment returns against market benchmarks like the S&P 500, NASDAQ, or sector-specific 
                      indices. Percentage change calculations make it easy to determine if your investments are outperforming 
                      or underperforming the broader market.
                    </p>
                  </div>
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-gray-800">Goal Tracking</h4>
                    <p className="text-gray-600">
                      Monitor progress toward financial goals by calculating percentage changes in your savings, retirement 
                      accounts, or investment portfolios. Set target percentage gains and track your progress over time to 
                      stay on course with your financial planning objectives.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Business Applications */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
                <CardContent className="p-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">Business Applications</h3>
                  <div className="space-y-4 text-gray-600">
                    <div className="border-l-4 border-blue-500 pl-4">
                      <h4 className="font-semibold text-gray-800 mb-2">Revenue Growth Analysis</h4>
                      <p className="text-sm">Calculate quarterly or annual revenue growth to assess business performance and make strategic decisions.</p>
                    </div>
                    <div className="border-l-4 border-green-500 pl-4">
                      <h4 className="font-semibold text-gray-800 mb-2">Cost Change Tracking</h4>
                      <p className="text-sm">Monitor changes in operational costs, material prices, or overhead expenses to maintain profitability.</p>
                    </div>
                    <div className="border-l-4 border-orange-500 pl-4">
                      <h4 className="font-semibold text-gray-800 mb-2">Market Share Fluctuations</h4>
                      <p className="text-sm">Track market share increases or decreases to understand competitive positioning and market dynamics.</p>
                    </div>
                    <div className="border-l-4 border-purple-500 pl-4">
                      <h4 className="font-semibold text-gray-800 mb-2">Customer Metrics</h4>
                      <p className="text-sm">Analyze customer acquisition, retention, and lifetime value changes to optimize marketing strategies.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
                <CardContent className="p-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">Currency Trading & Forex</h3>
                  <div className="space-y-4 text-gray-600">
                    <div className="bg-blue-50 rounded-lg p-4">
                      <h4 className="font-semibold text-blue-800 mb-2">Exchange Rate Analysis</h4>
                      <p className="text-sm text-blue-700">Track currency pair movements to identify trading opportunities and assess foreign exchange risks.</p>
                    </div>
                    <div className="bg-green-50 rounded-lg p-4">
                      <h4 className="font-semibold text-green-800 mb-2">International Business</h4>
                      <p className="text-sm text-green-700">Calculate the impact of currency fluctuations on international transactions and profit margins.</p>
                    </div>
                    <div className="bg-orange-50 rounded-lg p-4">
                      <h4 className="font-semibold text-orange-800 mb-2">Hedging Strategies</h4>
                      <p className="text-sm text-orange-700">Evaluate the effectiveness of currency hedging strategies by comparing protected vs. unprotected positions.</p>
                    </div>
                    <div className="bg-purple-50 rounded-lg p-4">
                      <h4 className="font-semibold text-purple-800 mb-2">Travel Planning</h4>
                      <p className="text-sm text-purple-700">Calculate how currency changes affect travel budgets and international purchasing power.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Advanced Features Section */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-8">Understanding Percentage Change Results</h3>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">Positive Percentage Change</h4>
                      <p className="text-gray-600 text-sm mb-4">Indicates growth, appreciation, or improvement. Common in successful investments, growing businesses, or appreciating assets.</p>
                      <div className="bg-green-50 p-3 rounded-lg">
                        <p className="text-green-800 text-sm font-medium">Example: +15.5% stock price increase</p>
                        <p className="text-green-700 text-xs">Your investment has gained value</p>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">Interpreting Large Changes</h4>
                      <p className="text-gray-600 text-sm">Changes above 50% indicate significant movements that require careful analysis and may suggest high volatility or major events affecting the asset.</p>
                    </div>
                  </div>
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">Negative Percentage Change</h4>
                      <p className="text-gray-600 text-sm mb-4">Represents decline, depreciation, or loss. Important for risk assessment and loss mitigation strategies.</p>
                      <div className="bg-red-50 p-3 rounded-lg">
                        <p className="text-red-800 text-sm font-medium">Example: -8.3% portfolio decline</p>
                        <p className="text-red-700 text-xs">Consider rebalancing or risk management</p>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">Time Period Considerations</h4>
                      <p className="text-gray-600 text-sm">The same percentage change can have different implications depending on the time frame - daily, monthly, or annual changes require different analytical approaches.</p>
                    </div>
                  </div>
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">Zero Percentage Change</h4>
                      <p className="text-gray-600 text-sm mb-4">No change in value. May indicate stability or stagnation depending on the context and market conditions.</p>
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-gray-800 text-sm font-medium">Example: 0% change</p>
                        <p className="text-gray-700 text-xs">Value remained constant</p>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">Compound Changes</h4>
                      <p className="text-gray-600 text-sm">Multiple percentage changes over time compound differently than simple addition - use our calculator to track cumulative effects accurately.</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* FAQ Section */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-8">Frequently Asked Questions</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">What's the difference between percentage change and percentage points?</h4>
                      <p className="text-gray-600 text-sm">Percentage change compares relative change, while percentage points measure absolute differences between percentages. For example, going from 10% to 15% is a 50% change but only 5 percentage points difference.</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">Can percentage change exceed 100%?</h4>
                      <p className="text-gray-600 text-sm">Yes, percentage changes can exceed 100%. A 200% increase means the value tripled, while a 100% increase means it doubled. There's no upper limit to percentage increases.</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">How do I handle negative starting values?</h4>
                      <p className="text-gray-600 text-sm">Percentage change calculations with negative starting values can be complex and may not provide meaningful results. Consider using absolute values or different analytical approaches for negative base values.</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">What if the original value is zero?</h4>
                      <p className="text-gray-600 text-sm">Percentage change is undefined when the original value is zero because you cannot divide by zero. In such cases, consider reporting the absolute change or using alternative metrics.</p>
                    </div>
                  </div>
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">How accurate are the currency conversions?</h4>
                      <p className="text-gray-600 text-sm">Our calculator uses standard currency formatting for display purposes. The percentage calculations are mathematically accurate regardless of currency, as percentages are relative measures.</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">Should I use percentage change for all comparisons?</h4>
                      <p className="text-gray-600 text-sm">While percentage change is useful for relative comparisons, consider absolute changes for small base values, and use other metrics like ratios or indices for specific analytical needs.</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">How do I interpret very small percentage changes?</h4>
                      <p className="text-gray-600 text-sm">Very small percentage changes (less than 1%) may not be significant depending on the context. Consider measurement precision, market volatility, and statistical significance when interpreting small changes.</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">Can I use this for cryptocurrency analysis?</h4>
                      <p className="text-gray-600 text-sm">Absolutely! Percentage change calculations are particularly useful for cryptocurrency analysis due to high volatility. Track price movements, portfolio performance, and trading gains or losses effectively.</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tips and Best Practices */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Tips for Effective Percentage Change Analysis</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-lg">
                      <h4 className="font-semibold text-blue-800 mb-2">Context Matters</h4>
                      <p className="text-blue-700 text-sm">Always consider the time period, market conditions, and external factors when interpreting percentage changes. A 10% change might be significant for stable assets but normal for volatile investments.</p>
                    </div>
                    <div className="bg-green-50 border-l-4 border-green-400 p-4 rounded-r-lg">
                      <h4 className="font-semibold text-green-800 mb-2">Track Trends, Not Individual Points</h4>
                      <p className="text-green-700 text-sm">Look for patterns over multiple periods rather than focusing on single percentage changes. Consistent positive or negative trends are more meaningful than isolated fluctuations.</p>
                    </div>
                    <div className="bg-orange-50 border-l-4 border-orange-400 p-4 rounded-r-lg">
                      <h4 className="font-semibold text-orange-800 mb-2">Consider Volatility</h4>
                      <p className="text-orange-700 text-sm">High percentage swings indicate volatility. Factor in risk tolerance and investment timeline when evaluating assets with large percentage changes.</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="bg-purple-50 border-l-4 border-purple-400 p-4 rounded-r-lg">
                      <h4 className="font-semibold text-purple-800 mb-2">Benchmark Against Standards</h4>
                      <p className="text-purple-700 text-sm">Compare your percentage changes against relevant benchmarks, industry standards, or market indices to gauge relative performance accurately.</p>
                    </div>
                    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-lg">
                      <h4 className="font-semibold text-yellow-800 mb-2">Document Your Analysis</h4>
                      <p className="text-yellow-700 text-sm">Keep records of significant percentage changes and their causes. This historical data helps identify patterns and improve future decision-making.</p>
                    </div>
                    <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-r-lg">
                      <h4 className="font-semibold text-red-800 mb-2">Don't Ignore Absolute Values</h4>
                      <p className="text-red-700 text-sm">While percentage changes are useful for comparison, also consider absolute dollar amounts, especially for large portfolios or significant financial decisions.</p>
                    </div>
                  </div>
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
