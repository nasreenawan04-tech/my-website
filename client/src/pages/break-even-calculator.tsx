
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
  const [fixedCosts, setFixedCosts] = useState('10000');
  const [variableCostPerUnit, setVariableCostPerUnit] = useState('25');
  const [sellingPricePerUnit, setSellingPricePerUnit] = useState('50');
  const [targetUnits, setTargetUnits] = useState('500');
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
    setFixedCosts('10000');
    setVariableCostPerUnit('25');
    setSellingPricePerUnit('50');
    setTargetUnits('500');
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
        <meta name="description" content="Free break-even calculator to determine the exact point where your business revenue equals costs. Calculate break-even units, revenue targets, contribution margins, and profit analysis with multiple currency support." />
        <meta name="keywords" content="break-even calculator, break even analysis, business calculator, break even point calculator, contribution margin calculator, fixed cost calculator, variable cost analysis, business planning calculator, profit calculator, margin of safety calculator" />
        <meta property="og:title" content="Break-Even Calculator - Calculate Break-Even Point for Business | DapsiWow" />
        <meta property="og:description" content="Free break-even calculator for business planning. Calculate break-even units, revenue targets, and profit analysis with detailed contribution margin insights." />
        <meta property="og:type" content="website" />
        <meta name="robots" content="index, follow" />
        <meta name="author" content="DapsiWow" />
        <link rel="canonical" href="https://dapsiwow.com/tools/break-even-calculator" />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            "name": "Break-Even Calculator",
            "description": "Free online break-even calculator for businesses to determine the point where total revenue equals total costs. Calculate break-even units, revenue targets, contribution margins, and profit analysis.",
            "url": "https://dapsiwow.com/tools/break-even-calculator",
            "applicationCategory": "BusinessApplication",
            "operatingSystem": "Any",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "USD"
            },
            "featureList": [
              "Calculate break-even units and revenue",
              "Contribution margin analysis",
              "Margin of safety calculations",
              "Multiple currency support",
              "Profit at target volume analysis",
              "Visual break-even visualization"
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
                <span className="text-sm font-medium text-blue-700">Professional Break-Even Analysis</span>
              </div>
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-slate-900 leading-tight" data-testid="text-page-title">
                Smart Break-Even
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                  Calculator
                </span>
              </h1>
              <p className="text-xl sm:text-2xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
                Calculate the exact point where your business revenue equals costs and start making profit
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
                    <p className="text-gray-600">Enter your business cost structure to calculate break-even analysis</p>
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
                  </div>

                  {/* Target Analysis Section */}
                  <div className="space-y-6 border-t pt-8">
                    <h3 className="text-xl font-bold text-gray-900">Target Volume Analysis</h3>
                    
                    <div className="space-y-4 bg-gray-50 rounded-xl p-6">
                      <div className="space-y-3">
                        <Label htmlFor="target-units" className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                          Target Units to Sell
                        </Label>
                        <Input
                          id="target-units"
                          type="number"
                          value={targetUnits}
                          onChange={(e) => setTargetUnits(e.target.value)}
                          className="h-12 text-lg border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-blue-500"
                          placeholder="500"
                          min="0"
                          step="1"
                          data-testid="input-target-units"
                        />
                        <p className="text-sm text-gray-500">
                          Enter expected sales volume to calculate profit and margin of safety
                        </p>
                      </div>
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
                            <span className="font-bold text-green-600" data-testid="text-contribution-margin-ratio">
                              {result.contributionMarginRatio}%
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Target Analysis */}
                      {parseFloat(targetUnits) > 0 && (
                        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
                          <h4 className="font-bold text-green-800 mb-4 text-lg">Target Volume Analysis</h4>
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
                      {parseFloat(targetUnits) > 0 && (
                        <div className="bg-white rounded-xl p-6 shadow-sm">
                          <h4 className="font-bold text-gray-900 mb-4">Break-Even Visualization</h4>
                          <div className="space-y-3">
                            <div className="flex items-center overflow-hidden rounded-lg">
                              <div 
                                className="h-6 bg-red-400 flex items-center justify-center text-xs text-white font-medium"
                                style={{ width: `${Math.min((result.breakEvenUnits / parseFloat(targetUnits)) * 100, 100)}%` }}
                              >
                                {result.breakEvenUnits < parseFloat(targetUnits) * 0.1 ? '' : 'Loss Zone'}
                              </div>
                              <div 
                                className="h-6 bg-green-500 flex items-center justify-center text-xs text-white font-medium"
                                style={{ width: `${Math.max(100 - (result.breakEvenUnits / parseFloat(targetUnits)) * 100, 0)}%` }}
                              >
                                {result.breakEvenUnits > parseFloat(targetUnits) * 0.9 ? '' : 'Profit Zone'}
                              </div>
                            </div>
                            <div className="flex justify-between text-sm text-gray-600">
                              <span>0 units</span>
                              <span className="font-medium text-blue-600">{formatNumber(result.breakEvenUnits)} units (Break-even)</span>
                              <span>{targetUnits} units (Target)</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-16" data-testid="no-results">
                      <div className="w-20 h-20 bg-gray-200 rounded-full mx-auto mb-6 flex items-center justify-center">
                        <div className="text-3xl font-bold text-gray-400">BE</div>
                      </div>
                      <p className="text-gray-500 text-lg">Enter business details and calculate to see break-even analysis</p>
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
                <h3 className="text-2xl font-bold text-gray-900 mb-6">What is Break-Even Analysis?</h3>
                <div className="space-y-4 text-gray-600">
                  <p>
                    Break-even analysis is a critical financial calculation that determines the point at which your business 
                    revenues exactly equal your total costs, resulting in neither profit nor loss. This fundamental business 
                    metric helps entrepreneurs and business owners understand the minimum sales volume required to cover all expenses.
                  </p>
                  <p>
                    Our comprehensive break-even calculator goes beyond basic calculations by providing contribution margin analysis, 
                    margin of safety calculations, and profit projections at target volumes. With support for multiple currencies 
                    and detailed financial insights, you can make informed decisions about pricing, costs, and business viability.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">How to Calculate Break-Even Point?</h3>
                <div className="space-y-4 text-gray-600">
                  <p>
                    The break-even point formula is: Break-Even Units = Fixed Costs ÷ (Selling Price per Unit - Variable Cost per Unit)
                  </p>
                  <ul className="space-y-2 list-disc list-inside">
                    <li>Fixed Costs = Expenses that don't change with production volume</li>
                    <li>Variable Costs = Expenses that increase with each unit produced</li>
                    <li>Contribution Margin = Selling Price - Variable Cost per Unit</li>
                    <li>Break-Even Revenue = Break-Even Units × Selling Price per Unit</li>
                  </ul>
                  <p>
                    Our calculator automatically applies these formulas and provides additional insights like margin of safety 
                    and profit analysis to help you optimize your business strategy.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Key Features of Our Break-Even Calculator</h3>
                <div className="space-y-3 text-gray-600">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Support for 10+ international currencies worldwide</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Comprehensive contribution margin analysis</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Margin of safety calculations for risk assessment</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Profit analysis at target sales volumes</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Visual break-even point representation</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Benefits of Break-Even Analysis</h3>
                <div className="space-y-3 text-gray-600">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Determine minimum sales targets for profitability</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Evaluate pricing strategies and cost structures</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Assess financial risk and business viability</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Make informed decisions about business expansion</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Plan budgets and financial forecasts effectively</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Business Types and Applications */}
          <div className="mt-12 space-y-8">
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Business Types That Benefit from Break-Even Analysis</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-gray-800">Manufacturing Businesses</h4>
                    <p className="text-gray-600">
                      Manufacturing companies use break-even analysis to determine optimal production volumes, evaluate 
                      new product lines, and assess the impact of automation on cost structures. Understanding fixed costs 
                      like equipment and facility expenses versus variable costs like materials and labor is crucial.
                    </p>
                  </div>
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-gray-800">Service Businesses</h4>
                    <p className="text-gray-600">
                      Service providers leverage break-even calculations to set hourly rates, determine minimum client 
                      capacity requirements, and evaluate profitability of different service offerings. Fixed costs 
                      typically include office rent and salaries, while variable costs might include materials and subcontractors.
                    </p>
                  </div>
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-gray-800">Retail Businesses</h4>
                    <p className="text-gray-600">
                      Retail operations use break-even analysis to determine minimum inventory turnover rates, evaluate 
                      store locations, and assess the viability of new product categories. Understanding the relationship 
                      between fixed costs like rent and variable costs like inventory is essential.
                    </p>
                  </div>
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-gray-800">Startups and New Ventures</h4>
                    <p className="text-gray-600">
                      Entrepreneurs and startups rely on break-even analysis for business planning, investor presentations, 
                      and determining funding requirements. It helps validate business models and establish realistic 
                      sales targets for achieving profitability.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Factors Affecting Break-Even Point */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
                <CardContent className="p-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">Factors That Impact Break-Even Point</h3>
                  <div className="space-y-4 text-gray-600">
                    <div className="border-l-4 border-blue-500 pl-4">
                      <h4 className="font-semibold text-gray-800 mb-2">Fixed Costs</h4>
                      <p className="text-sm">Higher fixed costs increase break-even point. Focus on optimizing rent, salaries, insurance, and equipment costs.</p>
                    </div>
                    <div className="border-l-4 border-green-500 pl-4">
                      <h4 className="font-semibold text-gray-800 mb-2">Variable Costs</h4>
                      <p className="text-sm">Lower variable costs per unit improve contribution margins. Negotiate better supplier terms and optimize production efficiency.</p>
                    </div>
                    <div className="border-l-4 border-orange-500 pl-4">
                      <h4 className="font-semibold text-gray-800 mb-2">Selling Price</h4>
                      <p className="text-sm">Higher selling prices reduce break-even units but may affect demand. Balance pricing strategy with market competitiveness.</p>
                    </div>
                    <div className="border-l-4 border-purple-500 pl-4">
                      <h4 className="font-semibold text-gray-800 mb-2">Product Mix</h4>
                      <p className="text-sm">Different products have varying contribution margins. Focus on high-margin products to improve overall profitability.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
                <CardContent className="p-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">Break-Even Analysis Strategies</h3>
                  <div className="space-y-4 text-gray-600">
                    <div className="bg-blue-50 rounded-lg p-4">
                      <h4 className="font-semibold text-blue-800 mb-2">Cost Optimization</h4>
                      <p className="text-sm text-blue-700">Regularly review and optimize both fixed and variable costs to lower your break-even point and improve profitability.</p>
                    </div>
                    <div className="bg-green-50 rounded-lg p-4">
                      <h4 className="font-semibold text-green-800 mb-2">Value-Based Pricing</h4>
                      <p className="text-sm text-green-700">Focus on delivering value to justify higher prices rather than competing solely on cost, improving contribution margins.</p>
                    </div>
                    <div className="bg-orange-50 rounded-lg p-4">
                      <h4 className="font-semibold text-orange-800 mb-2">Operational Efficiency</h4>
                      <p className="text-sm text-orange-700">Improve processes and productivity to reduce variable costs per unit while maintaining quality standards.</p>
                    </div>
                    <div className="bg-purple-50 rounded-lg p-4">
                      <h4 className="font-semibold text-purple-800 mb-2">Market Analysis</h4>
                      <p className="text-sm text-purple-700">Regularly analyze market conditions and competitor pricing to optimize your pricing strategy and market position.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Break-Even Analysis FAQs */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-8">Frequently Asked Questions About Break-Even Analysis</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">What is a good break-even point for a business?</h4>
                      <p className="text-gray-600 text-sm">A good break-even point is achievable within your market capacity and allows for reasonable profit margins above the break-even level. Generally, a lower break-even point indicates better business efficiency and reduced financial risk.</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">How often should I calculate my break-even point?</h4>
                      <p className="text-gray-600 text-sm">Recalculate your break-even point whenever there are significant changes in costs, pricing, or business operations. Many businesses review it monthly or quarterly as part of their financial planning process.</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">What is margin of safety and why is it important?</h4>
                      <p className="text-gray-600 text-sm">Margin of safety is the difference between your actual or projected sales and your break-even point. It represents a buffer against business risks and indicates how much sales can decline before you start losing money.</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">Can break-even analysis help with pricing decisions?</h4>
                      <p className="text-gray-600 text-sm">Yes, break-even analysis is crucial for pricing decisions. It helps you understand the minimum price needed to cover costs and the impact of different pricing strategies on profitability and sales volume requirements.</p>
                    </div>
                  </div>
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">What's the difference between fixed and variable costs?</h4>
                      <p className="text-gray-600 text-sm">Fixed costs remain constant regardless of production volume (rent, salaries, insurance), while variable costs change with production levels (materials, direct labor, shipping). Understanding this distinction is crucial for accurate break-even calculations.</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">How does contribution margin affect break-even point?</h4>
                      <p className="text-gray-600 text-sm">Contribution margin is the amount each unit contributes to covering fixed costs after variable costs are deducted. A higher contribution margin means fewer units needed to break even, making your business more profitable and less risky.</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">Should I include depreciation in break-even analysis?</h4>
                      <p className="text-gray-600 text-sm">Yes, depreciation should be included in fixed costs for accurate break-even analysis. While it's a non-cash expense, it represents the real cost of using equipment and facilities in your business operations.</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">How can I reduce my break-even point?</h4>
                      <p className="text-gray-600 text-sm">Reduce your break-even point by lowering fixed costs (renegotiate rent, optimize staffing), reducing variable costs (better supplier terms, efficiency improvements), or increasing selling prices (value-based pricing, premium positioning).</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Break-Even Analysis Applications */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
                <CardContent className="p-8">
                  <h3 className="text-xl font-bold text-gray-900 mb-6">Product Launch Planning</h3>
                  <div className="space-y-4 text-gray-600">
                    <p className="text-sm">
                      Use break-even analysis to evaluate new product viability before launch, determining minimum sales targets and pricing strategies.
                    </p>
                    <div className="space-y-2">
                      <h4 className="font-semibold text-green-800 text-sm">Key Benefits:</h4>
                      <ul className="text-xs space-y-1 list-disc list-inside text-green-700">
                        <li>Validate product concept financially</li>
                        <li>Set realistic sales targets</li>
                        <li>Optimize pricing strategy</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
                <CardContent className="p-8">
                  <h3 className="text-xl font-bold text-gray-900 mb-6">Investment Decisions</h3>
                  <div className="space-y-4 text-gray-600">
                    <p className="text-sm">
                      Evaluate equipment purchases, facility expansions, or technology investments by analyzing their impact on break-even points.
                    </p>
                    <div className="space-y-2">
                      <h4 className="font-semibold text-blue-800 text-sm">Applications:</h4>
                      <ul className="text-xs space-y-1 list-disc list-inside text-blue-700">
                        <li>Equipment ROI analysis</li>
                        <li>Facility expansion planning</li>
                        <li>Technology investment evaluation</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
                <CardContent className="p-8">
                  <h3 className="text-xl font-bold text-gray-900 mb-6">Financial Planning</h3>
                  <div className="space-y-4 text-gray-600">
                    <p className="text-sm">
                      Integrate break-even analysis into budgeting, forecasting, and strategic planning processes for better financial management.
                    </p>
                    <div className="space-y-2">
                      <h4 className="font-semibold text-purple-800 text-sm">Planning Uses:</h4>
                      <ul className="text-xs space-y-1 list-disc list-inside text-purple-700">
                        <li>Budget preparation</li>
                        <li>Cash flow planning</li>
                        <li>Risk assessment</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Industry-Specific Considerations */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Industry-Specific Break-Even Considerations</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-r-lg">
                      <h4 className="font-semibold text-red-800 mb-2">E-commerce Businesses</h4>
                      <p className="text-red-700 text-sm">Consider shipping costs, payment processing fees, returns, and digital marketing expenses as variable costs. Fixed costs include platform fees, warehouse rent, and technology infrastructure.</p>
                    </div>
                    <div className="bg-orange-50 border-l-4 border-orange-400 p-4 rounded-r-lg">
                      <h4 className="font-semibold text-orange-800 mb-2">Restaurant Industry</h4>
                      <p className="text-orange-700 text-sm">Food costs are primary variable expenses, while rent, staff salaries, and equipment are fixed costs. Consider food waste, seasonal demand variations, and menu mix in calculations.</p>
                    </div>
                    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-lg">
                      <h4 className="font-semibold text-yellow-800 mb-2">Software Companies</h4>
                      <p className="text-yellow-700 text-sm">High fixed costs in development and low variable costs per user. Consider customer acquisition costs, hosting expenses, and support costs as key variables in break-even analysis.</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-lg">
                      <h4 className="font-semibold text-blue-800 mb-2">Professional Services</h4>
                      <p className="text-blue-700 text-sm">Labor costs are often the largest expense. Consider billable hours capacity, overhead allocation, and project-based versus retainer pricing models in break-even calculations.</p>
                    </div>
                    <div className="bg-purple-50 border-l-4 border-purple-400 p-4 rounded-r-lg">
                      <h4 className="font-semibold text-purple-800 mb-2">Healthcare Practices</h4>
                      <p className="text-purple-700 text-sm">High fixed costs for equipment and facilities, variable costs for supplies and staff. Consider insurance reimbursement rates, patient volume capacity, and regulatory compliance costs.</p>
                    </div>
                    <div className="bg-green-50 border-l-4 border-green-400 p-4 rounded-r-lg">
                      <h4 className="font-semibold text-green-800 mb-2">Subscription Businesses</h4>
                      <p className="text-green-700 text-sm">Focus on monthly recurring revenue (MRR) and customer lifetime value (LTV). Consider churn rates, customer acquisition costs, and support expenses in break-even analysis.</p>
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
};

export default BreakEvenCalculator;
