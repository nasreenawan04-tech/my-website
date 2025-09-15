import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface BreakEvenResult {
  breakEvenUnits: number;
  breakEvenRevenue: number;
  contributionMargin: number;
  contributionMarginRatio: number;
  profitAtTargetUnits: number;
  marginOfSafety: number;
  marginOfSafetyPercentage: number;
}

const BreakEvenCalculator = () => {
  const [fixedCosts, setFixedCosts] = useState('50000');
  const [variableCostPerUnit, setVariableCostPerUnit] = useState('25');
  const [sellingPricePerUnit, setSellingPricePerUnit] = useState('50');
  const [targetUnits, setTargetUnits] = useState('2500');
  const [currency, setCurrency] = useState('USD');
  const [result, setResult] = useState<BreakEvenResult | null>(null);

  const calculateBreakEven = () => {
    const fixed = parseFloat(fixedCosts);
    const variableCost = parseFloat(variableCostPerUnit);
    const sellingPrice = parseFloat(sellingPricePerUnit);
    const target = parseFloat(targetUnits) || 0;

    if (fixed && variableCost >= 0 && sellingPrice && sellingPrice > variableCost) {
      // Calculate contribution margin per unit
      const contributionMargin = sellingPrice - variableCost;
      const contributionMarginRatio = (contributionMargin / sellingPrice) * 100;

      // Calculate break-even point in units
      const breakEvenUnits = fixed / contributionMargin;

      // Calculate break-even point in revenue
      const breakEvenRevenue = breakEvenUnits * sellingPrice;

      // Calculate profit at target units
      const profitAtTargetUnits = target > 0 ? (target * contributionMargin) - fixed : 0;

      // Calculate margin of safety
      const marginOfSafety = target > breakEvenUnits ? target - breakEvenUnits : 0;
      const marginOfSafetyPercentage = target > 0 ? (marginOfSafety / target) * 100 : 0;

      setResult({
        breakEvenUnits: Math.round(breakEvenUnits * 100) / 100,
        breakEvenRevenue: Math.round(breakEvenRevenue * 100) / 100,
        contributionMargin: Math.round(contributionMargin * 100) / 100,
        contributionMarginRatio: Math.round(contributionMarginRatio * 100) / 100,
        profitAtTargetUnits: Math.round(profitAtTargetUnits * 100) / 100,
        marginOfSafety: Math.round(marginOfSafety * 100) / 100,
        marginOfSafetyPercentage: Math.round(marginOfSafetyPercentage * 100) / 100
      });
    }
  };

  const resetCalculator = () => {
    setFixedCosts('50000');
    setVariableCostPerUnit('25');
    setSellingPricePerUnit('50');
    setTargetUnits('2500');
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

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(num);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Helmet>
        <title>Break-Even Calculator - Calculate Break-Even Point | DapsiWow</title>
        <meta name="description" content="Free break-even calculator for businesses, entrepreneurs, and students. Calculate break-even point, contribution margin, and profit analysis with multi-currency support. Essential business planning tool." />
        <meta name="keywords" content="break even calculator, break even analysis, business calculator, profit calculator, break even point, contribution margin, business planning, financial analysis, startup calculator, small business tools, revenue calculator, cost analysis, margin of safety, break even formula, business finance, entrepreneur tools" />
        <meta property="og:title" content="Break-Even Calculator - Calculate Break-Even Point | DapsiWow" />
        <meta property="og:description" content="Free break-even calculator to determine the break-even point for your business. Calculate units and revenue needed to cover costs." />
        <meta property="og:type" content="website" />
        <meta name="robots" content="index, follow" />
        <meta name="author" content="DapsiWow" />
        <link rel="canonical" href="https://dapsiwow.com/tools/break-even-calculator" />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            "name": "Break-Even Calculator",
            "description": "Free online break-even calculator to calculate the break-even point for your business. Determine when you'll start making profit and analyze contribution margins.",
            "url": "https://dapsiwow.com/tools/break-even-calculator",
            "applicationCategory": "FinanceApplication",
            "operatingSystem": "Any",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "USD"
            },
            "featureList": [
              "Calculate break-even point in units and revenue",
              "Support for multiple currencies",
              "Contribution margin analysis",
              "Margin of safety calculations",
              "Profit projections",
              "Business planning insights"
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
                <span className="text-sm font-medium text-blue-700">Professional Break-Even Calculator</span>
              </div>
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-slate-900 leading-tight">
                Break-Even
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                  Calculator
                </span>
              </h1>
              <p className="text-xl sm:text-2xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
                Calculate your business break-even point and make informed financial decisions for sustainable growth
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
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">Business Configuration</h2>
                    <p className="text-gray-600">Enter your business details to calculate break-even point</p>
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

                    {/* Fixed Costs */}
                    <div className="space-y-3">
                      <Label htmlFor="fixed-costs" className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                        Total Fixed Costs
                      </Label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-lg">$</span>
                        <Input
                          id="fixed-costs"
                          type="number"
                          value={fixedCosts}
                          onChange={(e) => setFixedCosts(e.target.value)}
                          className="h-14 pl-8 text-lg border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-blue-500"
                          placeholder="50,000"
                          data-testid="input-fixed-costs"
                        />
                      </div>
                      <p className="text-xs text-gray-500">
                        Include rent, salaries, insurance, and other fixed expenses
                      </p>
                    </div>

                    {/* Selling Price Per Unit */}
                    <div className="space-y-3">
                      <Label htmlFor="selling-price" className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                        Selling Price Per Unit
                      </Label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-lg">$</span>
                        <Input
                          id="selling-price"
                          type="number"
                          value={sellingPricePerUnit}
                          onChange={(e) => setSellingPricePerUnit(e.target.value)}
                          className="h-14 pl-8 text-lg border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-blue-500"
                          placeholder="50"
                          step="0.01"
                          data-testid="input-selling-price"
                        />
                      </div>
                    </div>

                    {/* Variable Cost Per Unit */}
                    <div className="space-y-3">
                      <Label htmlFor="variable-cost" className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                        Variable Cost Per Unit
                      </Label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-lg">$</span>
                        <Input
                          id="variable-cost"
                          type="number"
                          value={variableCostPerUnit}
                          onChange={(e) => setVariableCostPerUnit(e.target.value)}
                          className="h-14 pl-8 text-lg border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-blue-500"
                          placeholder="25"
                          step="0.01"
                          data-testid="input-variable-cost"
                        />
                      </div>
                      <p className="text-xs text-gray-500">
                        Include materials, direct labor, and other variable expenses per unit
                      </p>
                    </div>

                    {/* Target Units */}
                    <div className="space-y-3 md:col-span-2">
                      <Label htmlFor="target-units" className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                        Target Units to Sell
                      </Label>
                      <Input
                        id="target-units"
                        type="number"
                        value={targetUnits}
                        onChange={(e) => setTargetUnits(e.target.value)}
                        className="h-14 text-lg border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-blue-500"
                        placeholder="2,500"
                        min="0"
                        step="1"
                        data-testid="input-target-units"
                      />
                      <p className="text-xs text-gray-500">
                        Enter expected sales volume to calculate profit and margin of safety
                      </p>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-4 pt-6">
                    <Button
                      onClick={calculateBreakEven}
                      className="flex-1 h-14 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold text-lg rounded-xl shadow-lg transform transition-all duration-200 hover:scale-105"
                      data-testid="button-calculate"
                    >
                      Calculate Break-Even
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
                    <div className="space-y-6" data-testid="break-even-results">
                      {/* Break-Even Units Highlight */}
                      <div className="bg-white rounded-2xl p-6 shadow-lg border border-blue-100">
                        <div className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-2">Break-Even Units</div>
                        <div className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600" data-testid="text-break-even-units">
                          {formatNumber(result.breakEvenUnits)}
                        </div>
                      </div>

                      {/* Key Metrics */}
                      <div className="space-y-4">
                        <div className="bg-white rounded-xl p-4 shadow-sm">
                          <div className="flex justify-between items-center">
                            <span className="font-medium text-gray-700">Break-Even Revenue</span>
                            <span className="font-bold text-gray-900" data-testid="text-break-even-revenue">
                              {formatCurrency(result.breakEvenRevenue)}
                            </span>
                          </div>
                        </div>
                        <div className="bg-white rounded-xl p-4 shadow-sm">
                          <div className="flex justify-between items-center">
                            <span className="font-medium text-gray-700">Contribution Margin</span>
                            <span className="font-bold text-green-600" data-testid="text-contribution-margin">
                              {formatCurrency(result.contributionMargin)}
                            </span>
                          </div>
                        </div>
                        <div className="bg-white rounded-xl p-4 shadow-sm">
                          <div className="flex justify-between items-center">
                            <span className="font-medium text-gray-700">Margin Ratio</span>
                            <span className="font-bold text-blue-600" data-testid="text-contribution-margin-ratio">
                              {result.contributionMarginRatio}%
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Target Analysis */}
                      {parseFloat(targetUnits) > 0 && (
                        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
                          <h4 className="font-bold text-green-800 mb-4 text-lg">Target Analysis</h4>
                          <div className="space-y-3">
                            <div className="flex justify-between items-center">
                              <span className="text-green-700 font-medium">Profit at Target:</span>
                              <span className={`font-bold text-lg ${result.profitAtTargetUnits >= 0 ? 'text-green-800' : 'text-red-600'}`} data-testid="text-profit-target">
                                {formatCurrency(result.profitAtTargetUnits)}
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-green-700 font-medium">Margin of Safety:</span>
                              <span className="font-bold text-green-800 text-lg" data-testid="text-margin-safety">
                                {formatNumber(result.marginOfSafety)} units
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-green-700 font-medium">Safety Percentage:</span>
                              <span className="font-bold text-green-800 text-lg" data-testid="text-margin-safety-percent">
                                {result.marginOfSafetyPercentage}%
                              </span>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Visual Break-Even Chart */}
                      <div className="bg-white rounded-xl p-6 shadow-sm">
                        <h4 className="font-bold text-gray-900 mb-4">Break-Even Visualization</h4>
                        {parseFloat(targetUnits) > 0 && (
                          <div className="space-y-3">
                            <div className="flex items-center">
                              <div 
                                className="h-4 bg-red-400 rounded-l"
                                style={{ width: `${Math.min((result.breakEvenUnits / parseFloat(targetUnits)) * 100, 100)}%` }}
                              ></div>
                              <div 
                                className="h-4 bg-green-500 rounded-r"
                                style={{ width: `${Math.max(100 - (result.breakEvenUnits / parseFloat(targetUnits)) * 100, 0)}%` }}
                              ></div>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="flex items-center">
                                <div className="w-3 h-3 bg-red-400 rounded-full mr-2"></div>
                                Loss Zone
                              </span>
                              <span className="flex items-center">
                                <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                                Profit Zone
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-16" data-testid="no-results">
                      <div className="w-20 h-20 bg-gray-200 rounded-full mx-auto mb-6 flex items-center justify-center">
                        <div className="text-3xl font-bold text-gray-400">₹</div>
                      </div>
                      <p className="text-gray-500 text-lg">Enter business details to calculate break-even point</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* SEO Content Section */}
            <div className="mt-16 grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
                <CardContent className="p-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">What is Break-Even Analysis?</h3>
                  <div className="space-y-4 text-gray-600">
                    <p>
                      Break-even analysis is a fundamental financial calculation that determines the point where total revenue 
                      equals total costs, resulting in neither profit nor loss. This critical business metric helps entrepreneurs, 
                      business owners, and financial analysts understand the minimum sales volume required to cover all expenses.
                    </p>
                    <p>
                      Our comprehensive break-even calculator enables you to quickly determine your break-even point in both 
                      units and revenue, analyze contribution margins, and evaluate profit potential at different sales levels. 
                      This essential tool supports strategic decision-making for pricing, production planning, and business growth.
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
                <CardContent className="p-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">How to Calculate Break-Even Point?</h3>
                  <div className="space-y-4 text-gray-600">
                    <p>
                      The break-even formula is: Break-Even Units = Fixed Costs ÷ (Selling Price - Variable Cost per Unit)
                    </p>
                    <ul className="space-y-2 list-disc list-inside">
                      <li>Fixed Costs: Expenses that remain constant regardless of production volume</li>
                      <li>Variable Costs: Expenses that change with production quantity</li>
                      <li>Contribution Margin: Selling price minus variable cost per unit</li>
                      <li>Break-Even Revenue: Break-even units × selling price per unit</li>
                    </ul>
                    <p>
                      Our calculator automatically applies these formulas and provides detailed insights including margin of 
                      safety, profit projections, and visual analysis to support your business planning decisions.
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
                <CardContent className="p-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">Key Features of Our Calculator</h3>
                  <div className="space-y-3 text-gray-600">
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span>Support for 10+ international currencies</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span>Comprehensive contribution margin analysis</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span>Margin of safety calculations</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span>Visual profit and loss zone analysis</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span>Target sales volume profit projections</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
                <CardContent className="p-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">Business Applications</h3>
                  <div className="space-y-3 text-gray-600">
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span>Startup business planning and validation</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span>Pricing strategy development and optimization</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span>Production capacity and inventory planning</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span>Investment decision analysis and evaluation</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span>Financial forecasting and budget preparation</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Additional SEO Content Sections */}
            <div className="mt-12 space-y-8">
              {/* Industry Applications */}
              <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
                <CardContent className="p-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">Industry-Specific Break-Even Applications</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="space-y-4">
                      <h4 className="text-lg font-semibold text-gray-800">Manufacturing</h4>
                      <p className="text-gray-600 text-sm">
                        Manufacturing businesses use break-even analysis to determine optimal production volumes, 
                        evaluate new product lines, and make equipment investment decisions. Calculate minimum 
                        production runs needed to cover fixed costs like machinery, facility rent, and overhead expenses.
                      </p>
                    </div>
                    <div className="space-y-4">
                      <h4 className="text-lg font-semibold text-gray-800">Retail & E-commerce</h4>
                      <p className="text-gray-600 text-sm">
                        Retailers leverage break-even calculations for inventory planning, store profitability analysis, 
                        and pricing strategies. Determine minimum sales volumes required to cover rent, staff salaries, 
                        and other fixed operating costs while maintaining healthy profit margins.
                      </p>
                    </div>
                    <div className="space-y-4">
                      <h4 className="text-lg font-semibold text-gray-800">Service Businesses</h4>
                      <p className="text-gray-600 text-sm">
                        Service providers use break-even analysis to set hourly rates, determine client capacity 
                        requirements, and evaluate service profitability. Calculate minimum billable hours or 
                        clients needed to cover fixed costs and achieve target profit levels.
                      </p>
                    </div>
                    <div className="space-y-4">
                      <h4 className="text-lg font-semibold text-gray-800">Software & SaaS</h4>
                      <p className="text-gray-600 text-sm">
                        Software companies apply break-even analysis to subscription pricing models, customer 
                        acquisition cost evaluation, and product development decisions. Determine minimum subscriber 
                        counts needed to cover development, hosting, and operational expenses.
                      </p>
                    </div>
                    <div className="space-y-4">
                      <h4 className="text-lg font-semibold text-gray-800">Restaurants & Food</h4>
                      <p className="text-gray-600 text-sm">
                        Restaurant operators use break-even calculations for menu pricing, daily sales targets, 
                        and location viability assessment. Calculate minimum covers per day needed to cover 
                        rent, labor, food costs, and other operational expenses.
                      </p>
                    </div>
                    <div className="space-y-4">
                      <h4 className="text-lg font-semibold text-gray-800">Freelancers & Consultants</h4>
                      <p className="text-gray-600 text-sm">
                        Independent professionals utilize break-even analysis to set competitive rates, 
                        determine minimum project requirements, and plan capacity allocation. Calculate 
                        billable hours needed to cover business expenses and personal income requirements.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Understanding Costs */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
                  <CardContent className="p-8">
                    <h3 className="text-2xl font-bold text-gray-900 mb-6">Understanding Fixed vs Variable Costs</h3>
                    <div className="space-y-6">
                      <div className="border-l-4 border-blue-500 pl-4">
                        <h4 className="font-semibold text-blue-800 mb-2">Fixed Costs</h4>
                        <p className="text-gray-600 text-sm mb-3">
                          Fixed costs remain constant regardless of production volume or sales activity. 
                          These expenses must be paid whether you sell zero units or thousands.
                        </p>
                        <ul className="text-gray-600 text-sm space-y-1 list-disc list-inside">
                          <li>Rent and lease payments</li>
                          <li>Insurance premiums</li>
                          <li>Fixed salaries and benefits</li>
                          <li>Equipment depreciation</li>
                          <li>Software subscriptions</li>
                          <li>Loan payments and interest</li>
                        </ul>
                      </div>

                      <div className="border-l-4 border-green-500 pl-4">
                        <h4 className="font-semibold text-green-800 mb-2">Variable Costs</h4>
                        <p className="text-gray-600 text-sm mb-3">
                          Variable costs change proportionally with production volume. These costs 
                          increase as you produce more units and decrease with lower production.
                        </p>
                        <ul className="text-gray-600 text-sm space-y-1 list-disc list-inside">
                          <li>Raw materials and inventory</li>
                          <li>Direct labor costs</li>
                          <li>Packaging and shipping</li>
                          <li>Sales commissions</li>
                          <li>Transaction fees</li>
                          <li>Utility costs (production-related)</li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
                  <CardContent className="p-8">
                    <h3 className="text-2xl font-bold text-gray-900 mb-6">Break-Even Analysis Benefits</h3>
                    <div className="space-y-4">
                      <div className="bg-blue-50 rounded-lg p-4">
                        <h4 className="font-semibold text-blue-800 mb-2">Strategic Planning</h4>
                        <p className="text-blue-700 text-sm">
                          Break-even analysis provides crucial insights for strategic business planning, 
                          helping you set realistic sales targets and make informed pricing decisions.
                        </p>
                      </div>
                      <div className="bg-green-50 rounded-lg p-4">
                        <h4 className="font-semibold text-green-800 mb-2">Risk Assessment</h4>
                        <p className="text-green-700 text-sm">
                          Understanding your break-even point helps assess business risk and determine 
                          the margin of safety for your operations during market fluctuations.
                        </p>
                      </div>
                      <div className="bg-purple-50 rounded-lg p-4">
                        <h4 className="font-semibold text-purple-800 mb-2">Investment Decisions</h4>
                        <p className="text-purple-700 text-sm">
                          Use break-even calculations to evaluate new product launches, expansion 
                          opportunities, and equipment investments before committing resources.
                        </p>
                      </div>
                      <div className="bg-orange-50 rounded-lg p-4">
                        <h4 className="font-semibold text-orange-800 mb-2">Performance Monitoring</h4>
                        <p className="text-orange-700 text-sm">
                          Regular break-even analysis helps monitor business performance and identify 
                          areas for cost optimization and efficiency improvements.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Advanced Break-Even Concepts */}
              <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
                <CardContent className="p-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">Advanced Break-Even Analysis Concepts</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                      <h4 className="text-lg font-semibold text-gray-800">Margin of Safety</h4>
                      <p className="text-gray-600 text-sm mb-3">
                        Margin of safety represents the difference between your actual or projected sales 
                        and the break-even point. A higher margin indicates lower business risk.
                      </p>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <p className="text-gray-700 text-sm font-mono">
                          Margin of Safety = (Actual Sales - Break-Even Sales) ÷ Actual Sales × 100
                        </p>
                      </div>

                      <h4 className="text-lg font-semibold text-gray-800 mt-6">Contribution Margin</h4>
                      <p className="text-gray-600 text-sm mb-3">
                        Contribution margin is the amount remaining from sales revenue after variable 
                        costs are deducted. This amount contributes to covering fixed costs and profit.
                      </p>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <p className="text-gray-700 text-sm font-mono">
                          Contribution Margin = Selling Price - Variable Cost per Unit
                        </p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="text-lg font-semibold text-gray-800">Multi-Product Analysis</h4>
                      <p className="text-gray-600 text-sm mb-3">
                        For businesses with multiple products, weighted average contribution margins 
                        help determine overall break-even points based on sales mix.
                      </p>
                      <ul className="text-gray-600 text-sm space-y-1 list-disc list-inside">
                        <li>Calculate individual product contribution margins</li>
                        <li>Determine sales mix percentages</li>
                        <li>Compute weighted average contribution margin</li>
                        <li>Apply standard break-even formula</li>
                      </ul>

                      <h4 className="text-lg font-semibold text-gray-800 mt-6">Target Profit Analysis</h4>
                      <p className="text-gray-600 text-sm mb-3">
                        Extend break-even analysis to determine sales volume needed to achieve 
                        specific profit targets beyond the break-even point.
                      </p>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <p className="text-gray-700 text-sm font-mono">
                          Target Units = (Fixed Costs + Target Profit) ÷ Contribution Margin
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* FAQs Section */}
              <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
                <CardContent className="p-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-8">Frequently Asked Questions</h3>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="space-y-6">
                      <div>
                        <h4 className="font-semibold text-gray-800 mb-2">What is a good break-even point?</h4>
                        <p className="text-gray-600 text-sm">
                          A good break-even point is achievable within your market capacity and allows for 
                          reasonable profit margins. Generally, a lower break-even point indicates better 
                          business efficiency and reduced risk.
                        </p>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-800 mb-2">How often should I calculate break-even?</h4>
                        <p className="text-gray-600 text-sm">
                          Review break-even analysis monthly or quarterly, and whenever there are significant 
                          changes in costs, pricing, or business operations. Regular analysis helps maintain 
                          profitability awareness.
                        </p>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-800 mb-2">Can break-even analysis help with pricing?</h4>
                        <p className="text-gray-600 text-sm">
                          Yes, break-even analysis is excellent for pricing decisions. It shows the minimum 
                          price needed to cover costs and helps evaluate how pricing changes affect profitability.
                        </p>
                      </div>
                    </div>
                    <div className="space-y-6">
                      <div>
                        <h4 className="font-semibold text-gray-800 mb-2">What if my costs vary significantly?</h4>
                        <p className="text-gray-600 text-sm">
                          For businesses with highly variable costs, use average costs or create multiple 
                          scenarios to understand different break-even points under various conditions.
                        </p>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-800 mb-2">Is break-even analysis suitable for service businesses?</h4>
                        <p className="text-gray-600 text-sm">
                          Absolutely. Service businesses can use break-even analysis by treating billable hours, 
                          clients served, or projects completed as their "units" for calculation purposes.
                        </p>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-800 mb-2">How does seasonality affect break-even analysis?</h4>
                        <p className="text-gray-600 text-sm">
                          Seasonal businesses should calculate break-even points for different periods and ensure 
                          peak seasons generate sufficient profit to cover off-season fixed costs.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Best Practices */}
              <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
                <CardContent className="p-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">Break-Even Analysis Best Practices</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <h4 className="text-lg font-semibold text-gray-800 mb-4">Do's</h4>
                      <ul className="space-y-3">
                        <li className="flex items-start gap-3">
                          <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                          <span className="text-gray-600 text-sm">Use accurate, up-to-date cost data</span>
                        </li>
                        <li className="flex items-start gap-3">
                          <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                          <span className="text-gray-600 text-sm">Regularly update your analysis as costs change</span>
                        </li>
                        <li className="flex items-start gap-3">
                          <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                          <span className="text-gray-600 text-sm">Consider seasonal variations in both costs and sales</span>
                        </li>
                        <li className="flex items-start gap-3">
                          <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                          <span className="text-gray-600 text-sm">Perform sensitivity analysis on key variables</span>
                        </li>
                        <li className="flex items-start gap-3">
                          <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                          <span className="text-gray-600 text-sm">Include all relevant costs in your analysis</span>
                        </li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-gray-800 mb-4">Don'ts</h4>
                      <ul className="space-y-3">
                        <li className="flex items-start gap-3">
                          <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                          <span className="text-gray-600 text-sm">Misclassify costs as fixed when they're variable</span>
                        </li>
                        <li className="flex items-start gap-3">
                          <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                          <span className="text-gray-600 text-sm">Ignore capacity constraints in your analysis</span>
                        </li>
                        <li className="flex items-start gap-3">
                          <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                          <span className="text-gray-600 text-sm">Use outdated or inaccurate cost information</span>
                        </li>
                        <li className="flex items-start gap-3">
                          <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                          <span className="text-gray-600 text-sm">Assume costs remain linear at all production levels</span>
                        </li>
                        <li className="flex items-start gap-3">
                          <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                          <span className="text-gray-600 text-sm">Fail to consider market demand constraints</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default BreakEvenCalculator;