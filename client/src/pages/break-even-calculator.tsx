
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
  const [fixedCosts, setFixedCosts] = useState('');
  const [variableCostPerUnit, setVariableCostPerUnit] = useState('');
  const [sellingPricePerUnit, setSellingPricePerUnit] = useState('');
  const [targetUnits, setTargetUnits] = useState('');
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
    setFixedCosts('');
    setVariableCostPerUnit('');
    setSellingPricePerUnit('');
    setTargetUnits('');
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
        <title>Break-Even Calculator - Calculate Break-Even Point for Business | DapsiWow</title>
        <meta name="description" content="Free break-even calculator to calculate break-even point for your business. Determine units and revenue needed to cover costs with contribution margin analysis. Support for multiple currencies worldwide." />
        <meta name="keywords" content="break-even calculator, break even point calculator, business break even analysis, contribution margin calculator, fixed costs calculator, variable costs calculator, break even units, break even revenue, margin of safety calculator" />
        <meta property="og:title" content="Break-Even Calculator - Calculate Break-Even Point for Business | DapsiWow" />
        <meta property="og:description" content="Free break-even calculator for business analysis. Calculate break-even point in units and revenue with comprehensive contribution margin analysis." />
        <meta property="og:type" content="website" />
        <meta name="robots" content="index, follow" />
        <meta name="author" content="DapsiWow" />
        <link rel="canonical" href="https://dapsiwow.com/tools/break-even-calculator" />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            "name": "Break-Even Calculator",
            "description": "Free online break-even calculator to determine the break-even point for business operations. Calculate units and revenue needed to cover fixed and variable costs with detailed contribution margin analysis.",
            "url": "https://dapsiwow.com/tools/break-even-calculator",
            "applicationCategory": "BusinessApplication",
            "operatingSystem": "Any",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "USD"
            },
            "featureList": [
              "Calculate break-even point in units",
              "Calculate break-even point in revenue",
              "Contribution margin analysis",
              "Margin of safety calculation",
              "Support for multiple currencies",
              "Fixed and variable cost analysis"
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
                <span className="text-sm font-medium text-blue-700">Professional Business Calculator</span>
              </div>
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-slate-900 leading-tight">
                Break-Even
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                  Calculator
                </span>
              </h1>
              <p className="text-xl sm:text-2xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
                Calculate your business break-even point with comprehensive contribution margin analysis and margin of safety calculations
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
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">Break-Even Configuration</h2>
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
                          placeholder="10,000"
                          min="0"
                          step="0.01"
                          data-testid="input-fixed-costs"
                        />
                      </div>
                      <p className="text-sm text-gray-500">
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
                          placeholder="50.00"
                          min="0"
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
                          placeholder="30.00"
                          min="0"
                          step="0.01"
                          data-testid="input-variable-cost"
                        />
                      </div>
                      <p className="text-sm text-gray-500">
                        Include materials, direct labor, and other variable expenses per unit
                      </p>
                    </div>

                    {/* Target Units */}
                    <div className="space-y-3 md:col-span-2">
                      <Label htmlFor="target-units" className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                        Target Units to Sell (Optional)
                      </Label>
                      <Input
                        id="target-units"
                        type="number"
                        value={targetUnits}
                        onChange={(e) => setTargetUnits(e.target.value)}
                        className="h-14 text-lg border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-blue-500"
                        placeholder="1000"
                        min="0"
                        step="1"
                        data-testid="input-target-units"
                      />
                      <p className="text-sm text-gray-500">
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
                  <h2 className="text-2xl font-bold text-gray-900 mb-8">Break-Even Analysis</h2>
                  
                  {result ? (
                    <div className="space-y-6" data-testid="break-even-results">
                      {/* Break-Even Units Highlight */}
                      <div className="bg-white rounded-2xl p-6 shadow-lg border border-blue-100">
                        <div className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-2">Break-Even Units</div>
                        <div className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600" data-testid="text-break-even-units">
                          {formatNumber(result.breakEvenUnits)}
                        </div>
                      </div>

                      {/* Analysis Breakdown */}
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
                            <span className="font-bold text-purple-600" data-testid="text-contribution-margin-ratio">
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
                              <span className="text-green-700 font-medium">Profit at Target Units:</span>
                              <span className={`font-bold text-lg ${result.profitAtTargetUnits >= 0 ? 'text-green-800' : 'text-red-600'}`} data-testid="text-profit-target">
                                {formatCurrency(result.profitAtTargetUnits)}
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-green-700 font-medium">Margin of Safety (Units):</span>
                              <span className="font-bold text-green-800 text-lg" data-testid="text-margin-safety">
                                {formatNumber(result.marginOfSafety)}
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-green-700 font-medium">Margin of Safety (%):</span>
                              <span className="font-bold text-green-800 text-lg" data-testid="text-margin-safety-percent">
                                {result.marginOfSafetyPercentage}%
                              </span>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Visual Break-Even Chart */}
                      {parseFloat(targetUnits) > 0 && (
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                          <h4 className="text-lg font-bold text-gray-900 mb-4">Break-Even Visualization</h4>
                          <div className="space-y-3">
                            <div className="w-full bg-gray-200 rounded-full h-6 overflow-hidden">
                              <div className="flex h-full">
                                <div 
                                  className="bg-gradient-to-r from-red-400 to-red-500"
                                  style={{ width: `${Math.min((result.breakEvenUnits / parseFloat(targetUnits)) * 100, 100)}%` }}
                                ></div>
                                <div 
                                  className="bg-gradient-to-r from-green-400 to-green-500"
                                  style={{ width: `${Math.max(100 - (result.breakEvenUnits / parseFloat(targetUnits)) * 100, 0)}%` }}
                                ></div>
                              </div>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="flex items-center font-medium text-gray-600">
                                <div className="w-3 h-3 bg-red-400 rounded-full mr-2"></div>
                                Loss Zone
                              </span>
                              <span className="flex items-center font-medium text-gray-600">
                                <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                                Profit Zone
                              </span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-16" data-testid="no-results">
                      <div className="w-20 h-20 bg-gray-200 rounded-full mx-auto mb-6 flex items-center justify-center">
                        <div className="text-3xl font-bold text-gray-400">$</div>
                      </div>
                      <p className="text-gray-500 text-lg">Enter business details to calculate break-even point</p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* SEO Content Section */}
        <div className="max-w-7xl mx-auto px-4 py-16">
          {/* Educational Content Sections */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">What is Break-Even Analysis?</h3>
                <div className="space-y-4 text-gray-600">
                  <p>
                    Break-even analysis is a fundamental financial planning tool that helps businesses determine the exact point where total revenues equal total costs. At this critical point, known as the break-even point, a business neither makes a profit nor incurs a loss.
                  </p>
                  <p>
                    Our break-even calculator simplifies these complex calculations by automatically computing your break-even point, contribution margin, and margin of safety. This powerful tool supports multiple currencies and provides detailed analysis including profit projections at different sales volumes.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">How to Calculate Break-Even Point?</h3>
                <div className="space-y-4 text-gray-600">
                  <p>
                    The break-even formula is: Break-Even Units = Fixed Costs ÷ (Selling Price - Variable Cost Per Unit)
                  </p>
                  <ul className="space-y-2 list-disc list-inside">
                    <li>Fixed Costs = Total expenses that don't change with production</li>
                    <li>Variable Cost = Per-unit costs that vary with production</li>
                    <li>Selling Price = Revenue per unit sold</li>
                    <li>Contribution Margin = Selling Price - Variable Cost</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Comprehensive Break-Even Analysis Guide */}
          <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl mb-12">
            <CardContent className="p-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-8">Complete Guide to Break-Even Analysis</h2>
              
              <div className="space-y-8">
                {/* Understanding Break-Even Components */}
                <div>
                  <h3 className="text-2xl font-semibold text-gray-900 mb-4">Understanding Break-Even Components</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-blue-50 rounded-lg p-6">
                      <h4 className="text-lg font-semibold text-blue-900 mb-3">Fixed Costs</h4>
                      <p className="text-sm text-blue-800 mb-3">
                        Expenses that remain constant regardless of production volume. These costs must be paid whether you sell zero units or thousands.
                      </p>
                      <ul className="text-xs text-blue-700 space-y-1 list-disc list-inside">
                        <li>Rent and utilities</li>
                        <li>Insurance premiums</li>
                        <li>Fixed salaries</li>
                        <li>Equipment leases</li>
                        <li>Software subscriptions</li>
                      </ul>
                    </div>
                    <div className="bg-green-50 rounded-lg p-6">
                      <h4 className="text-lg font-semibold text-green-900 mb-3">Variable Costs</h4>
                      <p className="text-sm text-green-800 mb-3">
                        Costs that change directly with production levels. These increase as you produce more units and decrease when production slows.
                      </p>
                      <ul className="text-xs text-green-700 space-y-1 list-disc list-inside">
                        <li>Raw materials</li>
                        <li>Direct labor</li>
                        <li>Sales commissions</li>
                        <li>Shipping costs</li>
                        <li>Transaction fees</li>
                      </ul>
                    </div>
                    <div className="bg-purple-50 rounded-lg p-6">
                      <h4 className="text-lg font-semibold text-purple-900 mb-3">Contribution Margin</h4>
                      <p className="text-sm text-purple-800 mb-3">
                        The amount each unit contributes toward covering fixed costs and generating profit after variable costs are deducted.
                      </p>
                      <ul className="text-xs text-purple-700 space-y-1 list-disc list-inside">
                        <li>Higher margin = Better profitability</li>
                        <li>Helps optimize pricing</li>
                        <li>Guides product decisions</li>
                        <li>Shows cost efficiency</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Break-Even Applications */}
                <div>
                  <h3 className="text-2xl font-semibold text-gray-900 mb-6">Business Applications of Break-Even Analysis</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-6">
                      <div className="border-l-4 border-blue-500 pl-6">
                        <h4 className="text-lg font-semibold text-gray-900 mb-2">Startup Planning</h4>
                        <p className="text-gray-600 text-sm">
                          New businesses use break-even analysis to determine minimum viable sales levels, set initial pricing strategies, and calculate funding requirements. This analysis helps entrepreneurs understand how long it will take to achieve profitability and plan their cash flow accordingly.
                        </p>
                      </div>
                      <div className="border-l-4 border-green-500 pl-6">
                        <h4 className="text-lg font-semibold text-gray-900 mb-2">Product Launch Strategy</h4>
                        <p className="text-gray-600 text-sm">
                          Before launching new products, companies perform break-even analysis to ensure the product can generate sufficient profit. This includes evaluating production costs, marketing expenses, and expected sales volumes to determine product viability and optimal launch strategies.
                        </p>
                      </div>
                      <div className="border-l-4 border-orange-500 pl-6">
                        <h4 className="text-lg font-semibold text-gray-900 mb-2">Pricing Optimization</h4>
                        <p className="text-gray-600 text-sm">
                          Businesses regularly use break-even analysis to optimize pricing strategies. By understanding how price changes affect break-even points and profit margins, companies can find the optimal balance between competitive pricing and profitability.
                        </p>
                      </div>
                    </div>
                    <div className="space-y-6">
                      <div className="border-l-4 border-purple-500 pl-6">
                        <h4 className="text-lg font-semibold text-gray-900 mb-2">Investment Decisions</h4>
                        <p className="text-gray-600 text-sm">
                          Break-even analysis is invaluable for evaluating investment opportunities and business expansions. It helps determine whether potential investments will generate sufficient returns and how long it will take to recover initial costs.
                        </p>
                      </div>
                      <div className="border-l-4 border-red-500 pl-6">
                        <h4 className="text-lg font-semibold text-gray-900 mb-2">Risk Assessment</h4>
                        <p className="text-gray-600 text-sm">
                          Understanding your break-even point enables better risk assessment and management. The margin of safety calculation shows how much sales can decline before reaching the break-even point, helping businesses prepare for market fluctuations.
                        </p>
                      </div>
                      <div className="border-l-4 border-indigo-500 pl-6">
                        <h4 className="text-lg font-semibold text-gray-900 mb-2">Capacity Planning</h4>
                        <p className="text-gray-600 text-sm">
                          Manufacturing and service businesses use break-even analysis for capacity planning decisions. This helps determine optimal production levels, staffing requirements, and facility utilization to maximize efficiency and profitability.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Advanced Break-Even Concepts */}
                <div>
                  <h3 className="text-2xl font-semibold text-gray-900 mb-6">Advanced Break-Even Concepts</h3>
                  <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl p-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      <div>
                        <h4 className="text-xl font-semibold text-gray-900 mb-4">Multi-Product Break-Even Analysis</h4>
                        <p className="text-gray-600 mb-4">
                          For businesses selling multiple products with different contribution margins, calculating a weighted average contribution margin based on the sales mix is essential. This approach provides a comprehensive view of overall break-even requirements across your entire product portfolio.
                        </p>
                        <div className="bg-white rounded-lg p-4 border-l-4 border-blue-500">
                          <p className="text-sm text-gray-700">
                            <strong>Example:</strong> If Product A has a 60% contribution margin with 70% of sales, and Product B has a 40% contribution margin with 30% of sales, the weighted average contribution margin would be (0.6 × 0.7) + (0.4 × 0.3) = 54%.
                          </p>
                        </div>
                      </div>
                      <div>
                        <h4 className="text-xl font-semibold text-gray-900 mb-4">Scenario Planning with Break-Even</h4>
                        <p className="text-gray-600 mb-4">
                          Break-even analysis supports scenario planning and sensitivity analysis. By adjusting variables such as selling prices, costs, or sales volumes, businesses can model different scenarios and understand how changes in market conditions might affect their profitability.
                        </p>
                        <div className="bg-white rounded-lg p-4 border-l-4 border-green-500">
                          <p className="text-sm text-gray-700">
                            <strong>Best Practice:</strong> Create three scenarios (pessimistic, realistic, optimistic) with different price and volume assumptions to stress-test your business model and develop contingency plans.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Industry-Specific Applications */}
          <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl mb-12">
            <CardContent className="p-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-8">Break-Even Analysis by Industry</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-blue-50 rounded-lg p-6">
                  <h4 className="text-lg font-semibold text-blue-900 mb-3">Manufacturing</h4>
                  <p className="text-sm text-blue-800 mb-3">
                    Manufacturing companies use break-even analysis to optimize production schedules, determine minimum order quantities, and evaluate new product lines.
                  </p>
                  <ul className="text-xs text-blue-700 space-y-1 list-disc list-inside">
                    <li>Production capacity planning</li>
                    <li>Equipment investment decisions</li>
                    <li>Seasonal demand management</li>
                    <li>Supply chain optimization</li>
                  </ul>
                </div>
                <div className="bg-green-50 rounded-lg p-6">
                  <h4 className="text-lg font-semibold text-green-900 mb-3">Retail & E-commerce</h4>
                  <p className="text-sm text-green-800 mb-3">
                    Retailers apply break-even analysis for inventory management, pricing strategies, and store expansion decisions.
                  </p>
                  <ul className="text-xs text-green-700 space-y-1 list-disc list-inside">
                    <li>Store location analysis</li>
                    <li>Seasonal inventory planning</li>
                    <li>Marketing campaign ROI</li>
                    <li>Product mix optimization</li>
                  </ul>
                </div>
                <div className="bg-purple-50 rounded-lg p-6">
                  <h4 className="text-lg font-semibold text-purple-900 mb-3">Service Businesses</h4>
                  <p className="text-sm text-purple-800 mb-3">
                    Service companies adapt break-even analysis by treating billable hours or service units as their "products" to determine minimum billing requirements.
                  </p>
                  <ul className="text-xs text-purple-700 space-y-1 list-disc list-inside">
                    <li>Hourly rate optimization</li>
                    <li>Staff capacity planning</li>
                    <li>Service package pricing</li>
                    <li>Client acquisition costs</li>
                  </ul>
                </div>
                <div className="bg-orange-50 rounded-lg p-6">
                  <h4 className="text-lg font-semibold text-orange-900 mb-3">SaaS & Technology</h4>
                  <p className="text-sm text-orange-800 mb-3">
                    Software companies use break-even analysis for subscription pricing, customer acquisition cost (CAC) payback, and feature development ROI.
                  </p>
                  <ul className="text-xs text-orange-700 space-y-1 list-disc list-inside">
                    <li>Subscription tier pricing</li>
                    <li>Customer lifetime value</li>
                    <li>Development cost recovery</li>
                    <li>Market penetration strategy</li>
                  </ul>
                </div>
                <div className="bg-red-50 rounded-lg p-6">
                  <h4 className="text-lg font-semibold text-red-900 mb-3">Restaurants & Food Service</h4>
                  <p className="text-sm text-red-800 mb-3">
                    Food service businesses use break-even analysis for menu pricing, portion control, and location viability assessments.
                  </p>
                  <ul className="text-xs text-red-700 space-y-1 list-disc list-inside">
                    <li>Menu engineering</li>
                    <li>Food cost management</li>
                    <li>Staff scheduling optimization</li>
                    <li>Location feasibility studies</li>
                  </ul>
                </div>
                <div className="bg-indigo-50 rounded-lg p-6">
                  <h4 className="text-lg font-semibold text-indigo-900 mb-3">Consulting & Professional Services</h4>
                  <p className="text-sm text-indigo-800 mb-3">
                    Professional service firms use break-even analysis to determine minimum project sizes, optimal team structures, and sustainable growth rates.
                  </p>
                  <ul className="text-xs text-indigo-700 space-y-1 list-disc list-inside">
                    <li>Project profitability analysis</li>
                    <li>Resource allocation planning</li>
                    <li>Partnership evaluation</li>
                    <li>Practice area expansion</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Common Mistakes and Best Practices */}
          <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl mb-12">
            <CardContent className="p-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-8">Common Mistakes in Break-Even Analysis</h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <h3 className="text-xl font-semibold text-gray-900">Mistakes to Avoid</h3>
                  <div className="space-y-4">
                    <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-r-lg">
                      <h4 className="font-semibold text-red-800 mb-2">Misclassifying Costs</h4>
                      <p className="text-red-700 text-sm">
                        Incorrectly categorizing semi-variable costs as purely fixed or variable can significantly skew break-even calculations. Carefully analyze each cost component to ensure accurate classification.
                      </p>
                    </div>
                    <div className="bg-orange-50 border-l-4 border-orange-400 p-4 rounded-r-lg">
                      <h4 className="font-semibold text-orange-800 mb-2">Ignoring Market Reality</h4>
                      <p className="text-orange-700 text-sm">
                        Calculating break-even without considering market size, competition, or demand constraints can lead to unrealistic expectations. Validate your break-even requirements against market capacity.
                      </p>
                    </div>
                    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-lg">
                      <h4 className="font-semibold text-yellow-800 mb-2">Using Outdated Data</h4>
                      <p className="text-yellow-700 text-sm">
                        Break-even analysis based on old cost or pricing data can be misleading. Regularly update your inputs to reflect current market conditions and operational changes.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="space-y-6">
                  <h3 className="text-xl font-semibold text-gray-900">Best Practices</h3>
                  <div className="space-y-4">
                    <div className="bg-green-50 border-l-4 border-green-400 p-4 rounded-r-lg">
                      <h4 className="font-semibold text-green-800 mb-2">Regular Review and Updates</h4>
                      <p className="text-green-700 text-sm">
                        Conduct break-even analysis quarterly or whenever significant changes occur in your business model, costs, or market conditions to maintain accuracy and relevance.
                      </p>
                    </div>
                    <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-lg">
                      <h4 className="font-semibold text-blue-800 mb-2">Scenario Planning</h4>
                      <p className="text-blue-700 text-sm">
                        Develop multiple scenarios (optimistic, realistic, pessimistic) to understand your break-even requirements under different market conditions and prepare contingency plans.
                      </p>
                    </div>
                    <div className="bg-purple-50 border-l-4 border-purple-400 p-4 rounded-r-lg">
                      <h4 className="font-semibold text-purple-800 mb-2">Integrate with Financial Planning</h4>
                      <p className="text-purple-700 text-sm">
                        Use break-even analysis as part of your comprehensive financial planning process, integrating it with cash flow projections, budgeting, and strategic planning activities.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* FAQ Section */}
          <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
            <CardContent className="p-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-8">Frequently Asked Questions</h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-3">What's the difference between break-even point and breakeven analysis?</h4>
                    <p className="text-gray-600 text-sm">
                      The break-even point is the specific sales volume or revenue level where total costs equal total revenues. Break-even analysis is the comprehensive process of calculating and interpreting this point, including related metrics like contribution margin and margin of safety.
                    </p>
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-3">How often should I perform break-even analysis?</h4>
                    <p className="text-gray-600 text-sm">
                      Perform break-even analysis quarterly or whenever significant changes occur in your cost structure, pricing, or market conditions. Many businesses also conduct this analysis before major decisions like product launches, expansion, or pricing changes.
                    </p>
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-3">Can break-even analysis be used for service businesses?</h4>
                    <p className="text-gray-600 text-sm">
                      Yes, service businesses can adapt break-even analysis by treating billable hours, client projects, or service units as their "products." Calculate the contribution margin per hour or per service and apply the same principles to determine break-even points.
                    </p>
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-3">What is margin of safety and why is it important?</h4>
                    <p className="text-gray-600 text-sm">
                      Margin of safety represents the difference between actual sales and break-even sales, expressed in units or as a percentage. It indicates how much sales can decline before the business reaches its break-even point, providing a measure of risk tolerance and financial cushion.
                    </p>
                  </div>
                </div>
                <div className="space-y-6">
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-3">How do I handle semi-variable costs in break-even analysis?</h4>
                    <p className="text-gray-600 text-sm">
                      Semi-variable costs contain both fixed and variable components. Separate these costs by identifying the fixed portion (base cost) and the variable portion (cost per unit). Include the fixed portion in your total fixed costs and the variable portion in your variable cost per unit calculations.
                    </p>
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-3">What's a good break-even point for a new business?</h4>
                    <p className="text-gray-600 text-sm">
                      A good break-even point is one that's achievable within your target market capacity and timeline. Generally, a lower break-even point indicates better business efficiency and reduced risk. Aim for a break-even point that allows you to reach profitability within 12-18 months of launch.
                    </p>
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-3">How does seasonality affect break-even analysis?</h4>
                    <p className="text-gray-600 text-sm">
                      Seasonal businesses should calculate monthly break-even points rather than annual averages. Consider peak and off-peak seasons separately, and ensure that profitable months generate enough revenue to cover losses during slower periods.
                    </p>
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-3">Can I use break-even analysis for investment decisions?</h4>
                    <p className="text-gray-600 text-sm">
                      Absolutely. Break-even analysis helps evaluate the viability of new investments, product launches, or business expansions. It shows how much additional sales volume is needed to justify the investment and helps assess the risk-return profile of business opportunities.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default BreakEvenCalculator;
