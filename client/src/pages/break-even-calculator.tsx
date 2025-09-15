
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
  const [targetRevenue, setTargetRevenue] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [calculationType, setCalculationType] = useState('units');
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
    setTargetRevenue('');
    setCurrency('USD');
    setCalculationType('units');
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
                  <div className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-2">Break-Even Analysis</div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-8">Your Results</h3>
                  
                  {result ? (
                    <div className="space-y-6" data-testid="break-even-results">
                      {/* Main Results */}
                      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                        <div className="grid grid-cols-1 gap-6">
                          {/* Break-Even Units */}
                          <div className="flex justify-between items-center py-3 border-b border-gray-100 last:border-0">
                            <div className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Break-Even Units</div>
                            <div className="text-2xl font-bold text-blue-600" data-testid="text-break-even-units">
                              {formatNumber(result.breakEvenUnits)}
                            </div>
                          </div>

                          {/* Break-Even Revenue */}
                          <div className="flex justify-between items-center py-3 border-b border-gray-100 last:border-0">
                            <div className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Break-Even Revenue</div>
                            <div className="text-2xl font-bold text-indigo-600" data-testid="text-break-even-revenue">
                              {formatCurrency(result.breakEvenRevenue)}
                            </div>
                          </div>

                          {/* Contribution Margin */}
                          <div className="flex justify-between items-center py-3 border-b border-gray-100 last:border-0">
                            <div className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Contribution Margin</div>
                            <div className="text-xl font-bold text-green-600" data-testid="text-contribution-margin">
                              {formatCurrency(result.contributionMargin)}
                            </div>
                          </div>

                          {/* Contribution Margin Ratio */}
                          <div className="flex justify-between items-center py-3 border-b border-gray-100 last:border-0">
                            <div className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Margin Ratio</div>
                            <div className="text-xl font-bold text-purple-600" data-testid="text-contribution-margin-ratio">
                              {result.contributionMarginRatio}%
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Target Analysis */}
                      {parseFloat(targetUnits) > 0 && (
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                          <h4 className="text-lg font-bold text-gray-900 mb-4">Target Analysis</h4>
                          <div className="grid grid-cols-1 gap-4">
                            <div className="flex justify-between items-center">
                              <span className="text-sm font-medium text-gray-600">Profit at Target Units</span>
                              <span className={`text-lg font-bold ${result.profitAtTargetUnits >= 0 ? 'text-green-600' : 'text-red-600'}`} data-testid="text-profit-target">
                                {formatCurrency(result.profitAtTargetUnits)}
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm font-medium text-gray-600">Margin of Safety (Units)</span>
                              <span className="text-lg font-bold text-blue-600" data-testid="text-margin-safety">
                                {formatNumber(result.marginOfSafety)}
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm font-medium text-gray-600">Margin of Safety (%)</span>
                              <span className="text-lg font-bold text-indigo-600" data-testid="text-margin-safety-percent">
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
                    <div className="text-center py-12" data-testid="no-results">
                      <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <div className="w-10 h-10 bg-blue-500 rounded-lg"></div>
                      </div>
                      <p className="text-gray-500 text-lg">Enter business details to calculate break-even point</p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Educational Content Section */}
        <section className="py-16 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="space-y-12">
              {/* What is Break-Even Analysis */}
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">What is Break-Even Analysis?</h2>
                <div className="prose prose-lg text-gray-700 space-y-4">
                  <p>
                    Break-even analysis is a fundamental financial planning tool that helps businesses determine the exact point where total revenues equal total costs. At this critical point, known as the break-even point, a business neither makes a profit nor incurs a loss. This analysis is essential for entrepreneurs, business owners, and financial managers who need to understand the minimum performance requirements to avoid losses.
                  </p>
                  <p>
                    The break-even point can be calculated in two primary ways: the number of units that must be sold (break-even units) or the dollar amount of revenue required (break-even revenue). Understanding both metrics provides comprehensive insight into your business's financial requirements and helps establish realistic sales targets and pricing strategies.
                  </p>
                  <p>
                    Our break-even calculator simplifies these complex calculations by automatically computing your break-even point, contribution margin, and margin of safety. This powerful tool supports multiple currencies and provides detailed analysis including profit projections at different sales volumes, making it invaluable for business planning and decision-making.
                  </p>
                </div>
              </div>

              {/* How Break-Even Analysis Works */}
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">How Break-Even Analysis Works</h2>
                <div className="prose prose-lg text-gray-700 space-y-4">
                  <p>
                    Break-even analysis relies on the fundamental relationship between three key components: fixed costs, variable costs, and selling price. Fixed costs remain constant regardless of production volume and include expenses like rent, salaries, insurance, and equipment leases. Variable costs change directly with production levels and typically include materials, direct labor, and per-unit manufacturing expenses.
                  </p>
                  <p>
                    The contribution margin, calculated as selling price minus variable cost per unit, represents the amount each unit contributes toward covering fixed costs and generating profit. Once you understand your contribution margin, determining the break-even point becomes straightforward: divide total fixed costs by the contribution margin per unit to find the break-even units.
                  </p>
                  <p>
                    For example, if your business has $10,000 in monthly fixed costs, sells products for $50 each, and incurs $30 in variable costs per unit, your contribution margin is $20 per unit. Your break-even point would be 500 units ($10,000 ÷ $20), meaning you need to sell 500 units to cover all costs and reach profitability.
                  </p>
                </div>
              </div>

              {/* Key Benefits */}
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Key Benefits of Break-Even Analysis</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold text-gray-900">Strategic Planning</h3>
                    <p className="text-gray-700">
                      Break-even analysis provides crucial insights for strategic business planning by establishing minimum performance thresholds. It helps entrepreneurs set realistic sales targets, determine appropriate pricing strategies, and make informed decisions about product launches, market expansion, and resource allocation.
                    </p>
                  </div>
                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold text-gray-900">Risk Assessment</h3>
                    <p className="text-gray-700">
                      Understanding your break-even point enables better risk assessment and management. The margin of safety calculation shows how much sales can decline before reaching the break-even point, helping businesses prepare for market fluctuations and economic downturns.
                    </p>
                  </div>
                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold text-gray-900">Cost Control</h3>
                    <p className="text-gray-700">
                      Regular break-even analysis encourages ongoing cost monitoring and control. By understanding the impact of fixed and variable costs on profitability, businesses can identify opportunities to reduce expenses and improve their break-even position.
                    </p>
                  </div>
                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold text-gray-900">Investment Decisions</h3>
                    <p className="text-gray-700">
                      Break-even analysis is invaluable for evaluating investment opportunities and business expansions. It helps determine whether potential investments will generate sufficient returns and how long it will take to recover initial costs.
                    </p>
                  </div>
                </div>
              </div>

              {/* Advanced Applications */}
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Advanced Break-Even Applications</h2>
                <div className="prose prose-lg text-gray-700 space-y-4">
                  <p>
                    Beyond basic break-even calculations, advanced applications include multi-product break-even analysis for businesses selling multiple products with different contribution margins. This involves calculating a weighted average contribution margin based on the sales mix to determine overall break-even points.
                  </p>
                  <p>
                    Break-even analysis also supports scenario planning and sensitivity analysis. By adjusting variables such as selling prices, costs, or sales volumes, businesses can model different scenarios and understand how changes in market conditions might affect their profitability. This helps in developing contingency plans and stress-testing business models.
                  </p>
                  <p>
                    Service businesses can adapt break-even analysis by treating billable hours as units and calculating hourly contribution margins. This approach helps service providers determine minimum billing requirements and optimal pricing structures for sustained profitability.
                  </p>
                </div>
              </div>

              {/* Common Use Cases */}
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Common Business Use Cases</h2>
                <div className="space-y-6">
                  <div className="bg-blue-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-blue-900 mb-3">Startup Planning</h3>
                    <p className="text-blue-800">
                      New businesses use break-even analysis to determine minimum viable sales levels, set initial pricing strategies, and calculate funding requirements. This analysis helps entrepreneurs understand how long it will take to achieve profitability and plan their cash flow accordingly.
                    </p>
                  </div>
                  <div className="bg-green-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-green-900 mb-3">Product Launch</h3>
                    <p className="text-green-800">
                      Before launching new products, companies perform break-even analysis to ensure the product can generate sufficient profit. This includes evaluating production costs, marketing expenses, and expected sales volumes to determine product viability.
                    </p>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-purple-900 mb-3">Pricing Optimization</h3>
                    <p className="text-purple-800">
                      Businesses regularly use break-even analysis to optimize pricing strategies. By understanding how price changes affect break-even points and profit margins, companies can find the optimal balance between competitive pricing and profitability.
                    </p>
                  </div>
                  <div className="bg-orange-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-orange-900 mb-3">Capacity Planning</h3>
                    <p className="text-orange-800">
                      Manufacturing and service businesses use break-even analysis for capacity planning decisions. This helps determine optimal production levels, staffing requirements, and facility utilization to maximize efficiency and profitability.
                    </p>
                  </div>
                </div>
              </div>

              {/* Tips for Accurate Analysis */}
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Tips for Accurate Break-Even Analysis</h2>
                <div className="prose prose-lg text-gray-700 space-y-4">
                  <p>
                    <strong>Accurate Cost Classification:</strong> Properly distinguish between fixed and variable costs. Semi-variable costs that contain both fixed and variable components should be carefully analyzed and allocated appropriately. Review your cost structure regularly as business operations evolve.
                  </p>
                  <p>
                    <strong>Realistic Assumptions:</strong> Base your analysis on realistic market conditions and historical data when available. Consider factors such as seasonality, market trends, and competitive dynamics that might affect your sales volumes and pricing power.
                  </p>
                  <p>
                    <strong>Regular Updates:</strong> Break-even analysis should be updated regularly to reflect changes in costs, prices, and market conditions. Quarterly reviews help ensure your analysis remains relevant and accurate for decision-making purposes.
                  </p>
                  <p>
                    <strong>Scenario Planning:</strong> Conduct break-even analysis under different scenarios including best-case, worst-case, and most-likely outcomes. This provides a more comprehensive understanding of potential risks and opportunities.
                  </p>
                </div>
              </div>

              {/* FAQ Section */}
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Frequently Asked Questions</h2>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">What's the difference between break-even point and breakeven analysis?</h3>
                    <p className="text-gray-700">
                      The break-even point is the specific sales volume or revenue level where total costs equal total revenues. Break-even analysis is the comprehensive process of calculating and interpreting this point, including related metrics like contribution margin and margin of safety.
                    </p>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">How often should I perform break-even analysis?</h3>
                    <p className="text-gray-700">
                      Perform break-even analysis quarterly or whenever significant changes occur in your cost structure, pricing, or market conditions. Many businesses also conduct this analysis before major decisions like product launches, expansion, or pricing changes.
                    </p>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Can break-even analysis be used for service businesses?</h3>
                    <p className="text-gray-700">
                      Yes, service businesses can adapt break-even analysis by treating billable hours, client projects, or service units as their "products." Calculate the contribution margin per hour or per service and apply the same principles to determine break-even points.
                    </p>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">What is margin of safety and why is it important?</h3>
                    <p className="text-gray-700">
                      Margin of safety represents the difference between actual sales and break-even sales, expressed in units or as a percentage. It indicates how much sales can decline before the business reaches its break-even point, providing a measure of risk tolerance.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default BreakEvenCalculator;
