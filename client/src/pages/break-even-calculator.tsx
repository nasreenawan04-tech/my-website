
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
import { Calculator, Target } from 'lucide-react';

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
    <>
      <Helmet>
        <title>Break-Even Calculator - Calculate Break-Even Point | ToolsHub</title>
        <meta name="description" content="Free break-even calculator for businesses, entrepreneurs, and students. Calculate break-even point, contribution margin, and profit analysis with multi-currency support. Essential business planning tool." />
        <meta name="keywords" content="break even calculator, break even analysis, business calculator, profit calculator, break even point, contribution margin, business planning, financial analysis, startup calculator, small business tools, revenue calculator, cost analysis, margin of safety, break even formula, business finance, entrepreneur tools" />
        <meta property="og:title" content="Break-Even Calculator - Calculate Break-Even Point | ToolsHub" />
        <meta property="og:description" content="Free break-even calculator to determine the break-even point for your business. Calculate units and revenue needed to cover costs." />
        <meta property="og:type" content="website" />
        <link rel="canonical" href="/tools/break-even-calculator" />
      </Helmet>

      <div className="min-h-screen flex flex-col" data-testid="page-break-even-calculator">
        <Header />
        
        <main className="flex-1 bg-neutral-50">
          {/* Hero Section */}
          <section className="gradient-hero text-white py-16">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <div className="w-20 h-20 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Target className="text-3xl w-10 h-10" />
              </div>
              <h1 className="text-4xl sm:text-5xl font-bold mb-6" data-testid="text-page-title">
                Break-Even Calculator
              </h1>
              <p className="text-xl text-blue-100 max-w-2xl mx-auto">
                Calculate the break-even point for your business to determine when you'll start making profit worldwide
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
                      <h2 className="text-2xl font-semibold text-gray-900 mb-8">Business Details</h2>
                      
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

                      {/* Fixed Costs */}
                      <div className="space-y-3">
                        <Label htmlFor="fixed-costs" className="text-sm font-medium text-gray-700">
                          Total Fixed Costs (Monthly/Annual)
                        </Label>
                        <Input
                          id="fixed-costs"
                          type="number"
                          value={fixedCosts}
                          onChange={(e) => setFixedCosts(e.target.value)}
                          className="h-12 text-base border-gray-200 rounded-lg"
                          placeholder="Enter total fixed costs"
                          min="0"
                          step="0.01"
                          data-testid="input-fixed-costs"
                        />
                        <p className="text-xs text-gray-500">
                          Include rent, salaries, insurance, and other fixed expenses
                        </p>
                      </div>

                      {/* Selling Price Per Unit */}
                      <div className="space-y-3">
                        <Label htmlFor="selling-price" className="text-sm font-medium text-gray-700">
                          Selling Price Per Unit
                        </Label>
                        <Input
                          id="selling-price"
                          type="number"
                          value={sellingPricePerUnit}
                          onChange={(e) => setSellingPricePerUnit(e.target.value)}
                          className="h-12 text-base border-gray-200 rounded-lg"
                          placeholder="Enter selling price per unit"
                          min="0"
                          step="0.01"
                          data-testid="input-selling-price"
                        />
                      </div>

                      {/* Variable Cost Per Unit */}
                      <div className="space-y-3">
                        <Label htmlFor="variable-cost" className="text-sm font-medium text-gray-700">
                          Variable Cost Per Unit
                        </Label>
                        <Input
                          id="variable-cost"
                          type="number"
                          value={variableCostPerUnit}
                          onChange={(e) => setVariableCostPerUnit(e.target.value)}
                          className="h-12 text-base border-gray-200 rounded-lg"
                          placeholder="Enter variable cost per unit"
                          min="0"
                          step="0.01"
                          data-testid="input-variable-cost"
                        />
                        <p className="text-xs text-gray-500">
                          Include materials, direct labor, and other variable expenses per unit
                        </p>
                      </div>

                      {/* Target Units */}
                      <div className="space-y-3">
                        <Label htmlFor="target-units" className="text-sm font-medium text-gray-700">
                          Target Units to Sell (Optional)
                        </Label>
                        <Input
                          id="target-units"
                          type="number"
                          value={targetUnits}
                          onChange={(e) => setTargetUnits(e.target.value)}
                          className="h-12 text-base border-gray-200 rounded-lg"
                          placeholder="Enter target units for analysis"
                          min="0"
                          step="1"
                          data-testid="input-target-units"
                        />
                        <p className="text-xs text-gray-500">
                          Enter expected sales volume to calculate profit and margin of safety
                        </p>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-4 pt-6">
                        <Button
                          onClick={calculateBreakEven}
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
                      <h2 className="text-2xl font-semibold text-gray-900 mb-8">Break-Even Analysis</h2>
                      
                      {result ? (
                        <div className="space-y-4" data-testid="break-even-results">
                          {/* Break-Even Units */}
                          <div className="bg-white rounded-lg p-4 border-l-4 border-orange-500">
                            <div className="flex justify-between items-center">
                              <span className="font-semibold text-gray-700">Break-Even Units</span>
                              <span className="text-2xl font-bold text-orange-600" data-testid="text-break-even-units">
                                {formatNumber(result.breakEvenUnits)}
                              </span>
                            </div>
                          </div>

                          {/* Break-Even Revenue */}
                          <div className="bg-white rounded-lg p-4 border-l-4 border-purple-500">
                            <div className="flex justify-between items-center">
                              <span className="font-semibold text-gray-700">Break-Even Revenue</span>
                              <span className="text-xl font-bold text-purple-600" data-testid="text-break-even-revenue">
                                {formatCurrency(result.breakEvenRevenue)}
                              </span>
                            </div>
                          </div>

                          {/* Contribution Margin */}
                          <div className="space-y-3">
                            <div className="flex justify-between">
                              <span className="text-gray-600">Contribution Margin per Unit</span>
                              <span className="font-semibold" data-testid="text-contribution-margin">
                                {formatCurrency(result.contributionMargin)}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Contribution Margin Ratio</span>
                              <span className="font-semibold" data-testid="text-contribution-margin-ratio">
                                {result.contributionMarginRatio}%
                              </span>
                            </div>
                          </div>

                          {/* Target Analysis */}
                          {parseFloat(targetUnits) > 0 && (
                            <div className="border-t pt-4 space-y-3">
                              <h3 className="text-lg font-semibold text-gray-900">Target Analysis</h3>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Profit at Target Units</span>
                                <span className={`font-semibold ${result.profitAtTargetUnits >= 0 ? 'text-green-600' : 'text-red-600'}`} data-testid="text-profit-target">
                                  {formatCurrency(result.profitAtTargetUnits)}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Margin of Safety (Units)</span>
                                <span className="font-semibold" data-testid="text-margin-safety">
                                  {formatNumber(result.marginOfSafety)}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Margin of Safety (%)</span>
                                <span className="font-semibold" data-testid="text-margin-safety-percent">
                                  {result.marginOfSafetyPercentage}%
                                </span>
                              </div>
                            </div>
                          )}

                          {/* Visual Break-Even Chart */}
                          <div className="mt-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-3">Break-Even Visualization</h3>
                            <div className="space-y-2">
                              {parseFloat(targetUnits) > 0 && (
                                <>
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
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-8" data-testid="no-results">
                          <Target className="w-16 h-16 text-gray-400 mb-4 mx-auto" />
                          <p className="text-gray-500">Enter business details to calculate break-even point</p>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* What is Break-Even Calculator Section */}
              <div className="mt-12 bg-white rounded-2xl shadow-lg p-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">What is a Break-Even Calculator?</h2>
                <div className="max-w-4xl mx-auto">
                  <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                    A break-even calculator is an essential financial analysis tool that helps businesses and entrepreneurs determine 
                    the exact point where total revenue equals total costs, resulting in zero profit or loss. Our comprehensive 
                    break-even analysis calculator enables you to calculate the minimum number of units you need to sell or the 
                    minimum revenue required to cover all your business expenses, making it invaluable for strategic business 
                    planning and financial forecasting.
                  </p>
                  <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                    This powerful business calculator supports multiple currencies worldwide and provides detailed insights into 
                    your cost structure, contribution margins, profit projections, and margin of safety calculations. Whether 
                    you're launching a new product, evaluating pricing strategies, or making critical business decisions, our 
                    break-even point calculator delivers accurate financial analysis to guide your decision-making process.
                  </p>
                </div>
              </div>

              {/* Benefits for Different Audiences */}
              <div className="mt-8 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-2xl p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">Who Benefits from Break-Even Analysis?</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  
                  {/* Students & Entrepreneurs */}
                  <div className="bg-white rounded-xl p-6 shadow-sm">
                    <div className="w-12 h-12 bg-blue-500 text-white rounded-lg flex items-center justify-center mb-4">
                      <i className="fas fa-graduation-cap text-xl"></i>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">Students & Entrepreneurs</h3>
                    <ul className="text-gray-600 space-y-2 text-sm">
                      <li>• Learn fundamental business financial concepts</li>
                      <li>• Validate startup business ideas and models</li>
                      <li>• Calculate minimum viable product pricing</li>
                      <li>• Understand cost structures for business plans</li>
                      <li>• Prepare for investor presentations with solid data</li>
                    </ul>
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <p className="text-xs text-gray-500">
                        Complement your analysis with our <a href="/tools/roi-calculator" className="text-blue-600 hover:text-blue-700 font-medium">ROI Calculator</a> and 
                        <a href="/tools/business-loan-calculator" className="text-blue-600 hover:text-blue-700 font-medium"> Business Loan Calculator</a>
                      </p>
                    </div>
                  </div>

                  {/* Small Business Owners */}
                  <div className="bg-white rounded-xl p-6 shadow-sm">
                    <div className="w-12 h-12 bg-green-500 text-white rounded-lg flex items-center justify-center mb-4">
                      <i className="fas fa-store text-xl"></i>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">Small Business Owners</h3>
                    <ul className="text-gray-600 space-y-2 text-sm">
                      <li>• Set realistic sales targets and goals</li>
                      <li>• Optimize pricing strategies for profitability</li>
                      <li>• Make informed inventory and production decisions</li>
                      <li>• Plan seasonal business operations</li>
                      <li>• Evaluate expansion opportunities</li>
                    </ul>
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <p className="text-xs text-gray-500">
                        Enhance your financial planning with our <a href="/tools/compound-interest-calculator" className="text-blue-600 hover:text-blue-700 font-medium">Compound Interest Calculator</a> and 
                        <a href="/tools/loan-calculator" className="text-blue-600 hover:text-blue-700 font-medium"> Loan Calculator</a>
                      </p>
                    </div>
                  </div>

                  {/* Corporate Professionals */}
                  <div className="bg-white rounded-xl p-6 shadow-sm">
                    <div className="w-12 h-12 bg-purple-500 text-white rounded-lg flex items-center justify-center mb-4">
                      <i className="fas fa-briefcase text-xl"></i>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">Corporate Professionals</h3>
                    <ul className="text-gray-600 space-y-2 text-sm">
                      <li>• Analyze new product line viability</li>
                      <li>• Support budget planning and forecasting</li>
                      <li>• Evaluate operational efficiency improvements</li>
                      <li>• Present financial projections to stakeholders</li>
                      <li>• Optimize resource allocation decisions</li>
                    </ul>
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <p className="text-xs text-gray-500">
                        Support your analysis with our <a href="/tools/investment-return-calculator" className="text-blue-600 hover:text-blue-700 font-medium">Investment Return Calculator</a> and 
                        <a href="/tools/retirement-calculator" className="text-blue-600 hover:text-blue-700 font-medium"> Retirement Calculator</a>
                      </p>
                    </div>
                  </div>

                  {/* Financial Advisors */}
                  <div className="bg-white rounded-xl p-6 shadow-sm">
                    <div className="w-12 h-12 bg-orange-500 text-white rounded-lg flex items-center justify-center mb-4">
                      <i className="fas fa-chart-line text-xl"></i>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">Financial Advisors</h3>
                    <ul className="text-gray-600 space-y-2 text-sm">
                      <li>• Provide comprehensive client business analysis</li>
                      <li>• Support small business financial consulting</li>
                      <li>• Validate client investment opportunities</li>
                      <li>• Create detailed financial projections</li>
                      <li>• Assess business loan requirements</li>
                    </ul>
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <p className="text-xs text-gray-500">
                        Expand your toolkit with our <a href="/tools/net-worth-calculator" className="text-blue-600 hover:text-blue-700 font-medium">Net Worth Calculator</a> and 
                        <a href="/tools/sip-calculator" className="text-blue-600 hover:text-blue-700 font-medium"> SIP Calculator</a>
                      </p>
                    </div>
                  </div>

                  {/* E-commerce Businesses */}
                  <div className="bg-white rounded-xl p-6 shadow-sm">
                    <div className="w-12 h-12 bg-pink-500 text-white rounded-lg flex items-center justify-center mb-4">
                      <i className="fas fa-shopping-cart text-xl"></i>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">E-commerce Businesses</h3>
                    <ul className="text-gray-600 space-y-2 text-sm">
                      <li>• Calculate product profitability thresholds</li>
                      <li>• Optimize advertising spend and customer acquisition</li>
                      <li>• Plan inventory levels and seasonal stocking</li>
                      <li>• Evaluate marketplace fees and commission impact</li>
                      <li>• Assess shipping strategy profitability</li>
                    </ul>
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <p className="text-xs text-gray-500">
                        Optimize your finances with our <a href="/tools/percentage-calculator" className="text-blue-600 hover:text-blue-700 font-medium">Percentage Calculator</a> and 
                        <a href="/tools/discount-calculator" className="text-blue-600 hover:text-blue-700 font-medium"> Discount Calculator</a>
                      </p>
                    </div>
                  </div>

                  {/* Freelancers & Consultants */}
                  <div className="bg-white rounded-xl p-6 shadow-sm">
                    <div className="w-12 h-12 bg-teal-500 text-white rounded-lg flex items-center justify-center mb-4">
                      <i className="fas fa-user-tie text-xl"></i>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">Freelancers & Consultants</h3>
                    <ul className="text-gray-600 space-y-2 text-sm">
                      <li>• Determine minimum hourly rates for profitability</li>
                      <li>• Calculate monthly income requirements</li>
                      <li>• Plan for seasonal business fluctuations</li>
                      <li>• Evaluate project minimum requirements</li>
                      <li>• Set realistic client capacity targets</li>
                    </ul>
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <p className="text-xs text-gray-500">
                        Calculate your earnings with our <a href="/tools/salary-to-hourly-calculator" className="text-blue-600 hover:text-blue-700 font-medium">Salary to Hourly Calculator</a> and 
                        <a href="/tools/simple-interest-calculator" className="text-blue-600 hover:text-blue-700 font-medium"> Simple Interest Calculator</a>
                      </p>
                    </div>
                  </div>

                </div>
              </div>

              {/* Why Use Our Break-Even Calculator */}
              <div className="mt-8 bg-white rounded-2xl shadow-lg p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Why Choose Our Break-Even Calculator?</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Advanced Features</h3>
                    <ul className="space-y-3 text-gray-600">
                      <li className="flex items-start">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                        <span><strong>Multi-Currency Support:</strong> Calculate in USD, EUR, GBP, INR, JPY, and 7 other major currencies</span>
                      </li>
                      <li className="flex items-start">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                        <span><strong>Visual Analysis:</strong> Interactive charts showing profit zones, loss areas, and safety margins</span>
                      </li>
                      <li className="flex items-start">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                        <span><strong>Comprehensive Metrics:</strong> Detailed contribution margins, profit projections, and safety analysis</span>
                      </li>
                      <li className="flex items-start">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                        <span><strong>Real-Time Calculations:</strong> Instant results as you input your business data</span>
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">User Benefits</h3>
                    <ul className="space-y-3 text-gray-600">
                      <li className="flex items-start">
                        <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                        <span><strong>100% Free:</strong> No registration required, unlimited calculations</span>
                      </li>
                      <li className="flex items-start">
                        <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                        <span><strong>Mobile Optimized:</strong> Fully responsive design works on all devices</span>
                      </li>
                      <li className="flex items-start">
                        <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                        <span><strong>Privacy Focused:</strong> All calculations performed locally, no data stored</span>
                      </li>
                      <li className="flex items-start">
                        <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                        <span><strong>Educational Value:</strong> Learn financial concepts while calculating</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* How to Use Break-Even Calculator Section */}
              <div className="mt-8 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">How to Use the Break-Even Calculator</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">1</div>
                    <h3 className="font-semibold text-gray-900 mb-2">Enter Fixed Costs</h3>
                    <p className="text-gray-600 text-sm">Input your total fixed costs including rent, salaries, insurance, and other expenses that don't change with production volume.</p>
                  </div>
                  <div className="text-center">
                    <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">2</div>
                    <h3 className="font-semibold text-gray-900 mb-2">Set Pricing Details</h3>
                    <p className="text-gray-600 text-sm">Enter your selling price per unit and variable cost per unit to calculate the contribution margin.</p>
                  </div>
                  <div className="text-center">
                    <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">3</div>
                    <h3 className="font-semibold text-gray-900 mb-2">Add Target Units</h3>
                    <p className="text-gray-600 text-sm">Optionally enter your target sales volume to analyze profit potential and margin of safety.</p>
                  </div>
                  <div className="text-center">
                    <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">4</div>
                    <h3 className="font-semibold text-gray-900 mb-2">Get Results</h3>
                    <p className="text-gray-600 text-sm">View detailed break-even analysis including units needed, revenue targets, and profitability projections.</p>
                  </div>
                </div>
              </div>

              {/* Key Features Section */}
              <div className="mt-8 bg-white rounded-2xl shadow-lg p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Key Features of Our Break-Even Calculator</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center p-6 bg-gray-50 rounded-xl">
                    <div className="w-12 h-12 bg-green-500 text-white rounded-lg flex items-center justify-center mx-auto mb-4">
                      <Calculator className="w-6 h-6" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">Multi-Currency Support</h3>
                    <p className="text-gray-600 text-sm">Calculate break-even points in USD, EUR, GBP, INR, JPY, and other major currencies worldwide.</p>
                  </div>
                  <div className="text-center p-6 bg-gray-50 rounded-xl">
                    <div className="w-12 h-12 bg-blue-500 text-white rounded-lg flex items-center justify-center mx-auto mb-4">
                      <Target className="w-6 h-6" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">Visual Analysis</h3>
                    <p className="text-gray-600 text-sm">Interactive charts and visual breakdowns showing profit zones, loss zones, and margin of safety.</p>
                  </div>
                  <div className="text-center p-6 bg-gray-50 rounded-xl">
                    <div className="w-12 h-12 bg-purple-500 text-white rounded-lg flex items-center justify-center mx-auto mb-4">
                      <i className="fas fa-chart-bar"></i>
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">Detailed Metrics</h3>
                    <p className="text-gray-600 text-sm">Comprehensive analysis including contribution margins, profit projections, and safety margins.</p>
                  </div>
                </div>
              </div>

              {/* Business Applications Section */}
              <div className="mt-8 bg-white rounded-2xl shadow-lg p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Break-Even Analysis Applications</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Startup & New Business Planning</h3>
                    <ul className="text-gray-600 space-y-2">
                      <li>• Determine minimum viable product pricing</li>
                      <li>• Set realistic sales targets for new ventures</li>
                      <li>• Evaluate business model feasibility</li>
                      <li>• Calculate funding requirements</li>
                      <li>• Plan operational capacity needs</li>
                    </ul>
                    
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 mt-6">Product Launch Strategy</h3>
                    <ul className="text-gray-600 space-y-2">
                      <li>• Optimize product pricing strategies</li>
                      <li>• Calculate marketing budget requirements</li>
                      <li>• Set production volume targets</li>
                      <li>• Evaluate distribution channel costs</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Financial Planning & Analysis</h3>
                    <ul className="text-gray-600 space-y-2">
                      <li>• Monthly and annual budget planning</li>
                      <li>• Investment decision making</li>
                      <li>• Cost structure optimization</li>
                      <li>• Profit margin analysis</li>
                      <li>• Risk assessment and management</li>
                    </ul>
                    
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 mt-6">Operational Decisions</h3>
                    <ul className="text-gray-600 space-y-2">
                      <li>• Production planning and scheduling</li>
                      <li>• Capacity utilization optimization</li>
                      <li>• Make-or-buy decisions</li>
                      <li>• Outsourcing cost analysis</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Industry Use Cases Section */}
              <div className="mt-8 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Industry-Specific Use Cases</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="bg-white rounded-xl p-6">
                    <h3 className="font-semibold text-gray-900 mb-3">Manufacturing</h3>
                    <p className="text-gray-600 text-sm mb-3">Calculate break-even points for production runs, new product lines, and equipment investments.</p>
                    <ul className="text-gray-500 text-xs space-y-1">
                      <li>• Production capacity planning</li>
                      <li>• Equipment ROI analysis</li>
                      <li>• Raw material cost optimization</li>
                    </ul>
                  </div>
                  <div className="bg-white rounded-xl p-6">
                    <h3 className="font-semibold text-gray-900 mb-3">Retail & E-commerce</h3>
                    <p className="text-gray-600 text-sm mb-3">Determine minimum sales volumes, pricing strategies, and inventory requirements.</p>
                    <ul className="text-gray-500 text-xs space-y-1">
                      <li>• Store profitability analysis</li>
                      <li>• Product mix optimization</li>
                      <li>• Seasonal planning</li>
                    </ul>
                  </div>
                  <div className="bg-white rounded-xl p-6">
                    <h3 className="font-semibold text-gray-900 mb-3">Service Businesses</h3>
                    <p className="text-gray-600 text-sm mb-3">Calculate client volume requirements, service pricing, and staff utilization rates.</p>
                    <ul className="text-gray-500 text-xs space-y-1">
                      <li>• Service pricing models</li>
                      <li>• Staff productivity targets</li>
                      <li>• Contract profitability</li>
                    </ul>
                  </div>
                  <div className="bg-white rounded-xl p-6">
                    <h3 className="font-semibold text-gray-900 mb-3">Software & SaaS</h3>
                    <p className="text-gray-600 text-sm mb-3">Analyze subscription models, customer acquisition costs, and pricing tiers.</p>
                    <ul className="text-gray-500 text-xs space-y-1">
                      <li>• Subscription pricing optimization</li>
                      <li>• Customer lifetime value</li>
                      <li>• Feature tier analysis</li>
                    </ul>
                  </div>
                  <div className="bg-white rounded-xl p-6">
                    <h3 className="font-semibold text-gray-900 mb-3">Restaurants & Food</h3>
                    <p className="text-gray-600 text-sm mb-3">Calculate covers needed, menu pricing, and operational break-even points.</p>
                    <ul className="text-gray-500 text-xs space-y-1">
                      <li>• Menu pricing strategies</li>
                      <li>• Daily sales targets</li>
                      <li>• Labor cost optimization</li>
                    </ul>
                  </div>
                  <div className="bg-white rounded-xl p-6">
                    <h3 className="font-semibold text-gray-900 mb-3">Consulting & Freelancing</h3>
                    <p className="text-gray-600 text-sm mb-3">Determine hourly rates, project minimums, and capacity requirements.</p>
                    <ul className="text-gray-500 text-xs space-y-1">
                      <li>• Hourly rate calculations</li>
                      <li>• Project profitability</li>
                      <li>• Capacity planning</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Understanding Break-Even Components */}
              <div className="mt-8 bg-white rounded-2xl shadow-lg p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Understanding Break-Even Analysis Components</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Fixed Costs Explained</h3>
                    <p className="text-gray-600 mb-3">
                      Fixed costs remain constant regardless of production volume or sales activity. These expenses must be 
                      paid whether you sell zero units or thousands of units.
                    </p>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-semibold text-gray-800 mb-2">Common Fixed Costs Include:</h4>
                      <ul className="text-gray-600 text-sm space-y-1">
                        <li>• Rent and lease payments</li>
                        <li>• Insurance premiums</li>
                        <li>• Fixed salaries and benefits</li>
                        <li>• Loan payments and interest</li>
                        <li>• Software subscriptions</li>
                        <li>• Depreciation expenses</li>
                        <li>• Property taxes</li>
                      </ul>
                    </div>
                    
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 mt-6">Variable Costs Explained</h3>
                    <p className="text-gray-600 mb-3">
                      Variable costs change proportionally with production volume. These costs increase as you produce 
                      more units and decrease when production slows down.
                    </p>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-semibold text-gray-800 mb-2">Common Variable Costs Include:</h4>
                      <ul className="text-gray-600 text-sm space-y-1">
                        <li>• Raw materials and inventory</li>
                        <li>• Direct labor costs</li>
                        <li>• Packaging and shipping</li>
                        <li>• Sales commissions</li>
                        <li>• Transaction fees</li>
                        <li>• Utility costs (production-related)</li>
                        <li>• Quality control costs</li>
                      </ul>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Key Formulas & Calculations</h3>
                    <div className="space-y-4">
                      <div className="bg-blue-50 rounded-lg p-4 border-l-4 border-blue-500">
                        <h4 className="font-semibold text-blue-900 mb-2">Break-Even Point (Units)</h4>
                        <p className="text-blue-800 font-mono text-sm">
                          BEP = Fixed Costs ÷ (Selling Price - Variable Cost per Unit)
                        </p>
                      </div>
                      
                      <div className="bg-green-50 rounded-lg p-4 border-l-4 border-green-500">
                        <h4 className="font-semibold text-green-900 mb-2">Break-Even Point (Revenue)</h4>
                        <p className="text-green-800 font-mono text-sm">
                          BEP Revenue = Break-Even Units × Selling Price per Unit
                        </p>
                      </div>
                      
                      <div className="bg-purple-50 rounded-lg p-4 border-l-4 border-purple-500">
                        <h4 className="font-semibold text-purple-900 mb-2">Contribution Margin</h4>
                        <p className="text-purple-800 font-mono text-sm">
                          CM = Selling Price - Variable Cost per Unit
                        </p>
                      </div>
                      
                      <div className="bg-orange-50 rounded-lg p-4 border-l-4 border-orange-500">
                        <h4 className="font-semibold text-orange-900 mb-2">Margin of Safety</h4>
                        <p className="text-orange-800 font-mono text-sm">
                          MOS = (Actual Sales - Break-Even Sales) ÷ Actual Sales × 100
                        </p>
                      </div>
                    </div>
                    
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 mt-6">Important Considerations</h3>
                    <div className="bg-yellow-50 rounded-lg p-4 border-l-4 border-yellow-500">
                      <ul className="text-yellow-800 text-sm space-y-2">
                        <li>• Break-even analysis assumes linear cost behavior</li>
                        <li>• All units produced are sold (no inventory changes)</li>
                        <li>• Product mix remains constant</li>
                        <li>• Fixed costs remain truly fixed within relevant range</li>
                        <li>• Variable costs per unit remain constant</li>
                        <li>• Selling price remains constant per unit</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tips for Effective Break-Even Analysis */}
              <div className="mt-8 bg-gradient-to-br from-green-50 to-teal-50 rounded-2xl p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Tips for Effective Break-Even Analysis</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Best Practices</h3>
                    <ul className="space-y-3">
                      <li className="flex items-start">
                        <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                        <span className="text-gray-600 text-sm">Use accurate, up-to-date cost data for reliable calculations</span>
                      </li>
                      <li className="flex items-start">
                        <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                        <span className="text-gray-600 text-sm">Regularly update your break-even analysis as costs change</span>
                      </li>
                      <li className="flex items-start">
                        <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                        <span className="text-gray-600 text-sm">Consider seasonal variations in both costs and sales</span>
                      </li>
                      <li className="flex items-start">
                        <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                        <span className="text-gray-600 text-sm">Perform sensitivity analysis on key variables</span>
                      </li>
                      <li className="flex items-start">
                        <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                        <span className="text-gray-600 text-sm">Include all relevant costs in your analysis</span>
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Common Mistakes to Avoid</h3>
                    <ul className="space-y-3">
                      <li className="flex items-start">
                        <div className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                        <span className="text-gray-600 text-sm">Misclassifying costs as fixed when they're actually variable</span>
                      </li>
                      <li className="flex items-start">
                        <div className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                        <span className="text-gray-600 text-sm">Ignoring capacity constraints in the analysis</span>
                      </li>
                      <li className="flex items-start">
                        <div className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                        <span className="text-gray-600 text-sm">Using outdated or inaccurate cost information</span>
                      </li>
                      <li className="flex items-start">
                        <div className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                        <span className="text-gray-600 text-sm">Assuming costs remain linear at all production levels</span>
                      </li>
                      <li className="flex items-start">
                        <div className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                        <span className="text-gray-600 text-sm">Failing to consider market demand constraints</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Related Financial Tools */}
              <div className="mt-8 bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Complete Your Financial Analysis</h2>
                <p className="text-gray-600 text-center mb-8 max-w-3xl mx-auto">
                  Enhance your break-even analysis with these complementary financial calculators. Build a comprehensive 
                  understanding of your business finances and make data-driven decisions.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  
                  {/* Business Finance Tools */}
                  <div className="bg-white rounded-lg p-4 text-center hover:shadow-md transition-shadow">
                    <div className="w-12 h-12 bg-blue-500 text-white rounded-lg flex items-center justify-center mx-auto mb-3">
                      <i className="fas fa-calculator text-xl"></i>
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-2">ROI Calculator</h4>
                    <p className="text-xs text-gray-600 mb-3">Calculate return on investment for business decisions and compare opportunities</p>
                    <a href="/tools/roi-calculator" className="text-blue-600 hover:text-blue-700 font-medium text-sm">Calculate ROI →</a>
                  </div>

                  <div className="bg-white rounded-lg p-4 text-center hover:shadow-md transition-shadow">
                    <div className="w-12 h-12 bg-green-500 text-white rounded-lg flex items-center justify-center mx-auto mb-3">
                      <i className="fas fa-hand-holding-usd text-xl"></i>
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-2">Business Loan Calculator</h4>
                    <p className="text-xs text-gray-600 mb-3">Calculate loan payments and understand financing costs for business expansion</p>
                    <a href="/tools/business-loan-calculator" className="text-green-600 hover:text-green-700 font-medium text-sm">Calculate Loans →</a>
                  </div>

                  <div className="bg-white rounded-lg p-4 text-center hover:shadow-md transition-shadow">
                    <div className="w-12 h-12 bg-purple-500 text-white rounded-lg flex items-center justify-center mx-auto mb-3">
                      <i className="fas fa-chart-area text-xl"></i>
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-2">Investment Return Calculator</h4>
                    <p className="text-xs text-gray-600 mb-3">Analyze investment performance and compare different investment strategies</p>
                    <a href="/tools/investment-return-calculator" className="text-purple-600 hover:text-purple-700 font-medium text-sm">Calculate Returns →</a>
                  </div>

                  <div className="bg-white rounded-lg p-4 text-center hover:shadow-md transition-shadow">
                    <div className="w-12 h-12 bg-orange-500 text-white rounded-lg flex items-center justify-center mx-auto mb-3">
                      <i className="fas fa-piggy-bank text-xl"></i>
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-2">Compound Interest Calculator</h4>
                    <p className="text-xs text-gray-600 mb-3">Calculate growth of business savings and long-term investment planning</p>
                    <a href="/tools/compound-interest-calculator" className="text-orange-600 hover:text-orange-700 font-medium text-sm">Calculate Growth →</a>
                  </div>

                  <div className="bg-white rounded-lg p-4 text-center hover:shadow-md transition-shadow">
                    <div className="w-12 h-12 bg-teal-500 text-white rounded-lg flex items-center justify-center mx-auto mb-3">
                      <i className="fas fa-balance-scale text-xl"></i>
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-2">Net Worth Calculator</h4>
                    <p className="text-xs text-gray-600 mb-3">Track business and personal financial health with comprehensive analysis</p>
                    <a href="/tools/net-worth-calculator" className="text-teal-600 hover:text-teal-700 font-medium text-sm">Calculate Net Worth →</a>
                  </div>

                  <div className="bg-white rounded-lg p-4 text-center hover:shadow-md transition-shadow">
                    <div className="w-12 h-12 bg-pink-500 text-white rounded-lg flex items-center justify-center mx-auto mb-3">
                      <i className="fas fa-percentage text-xl"></i>
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-2">Discount Calculator</h4>
                    <p className="text-xs text-gray-600 mb-3">Calculate pricing strategies and promotional discounts for sales planning</p>
                    <a href="/tools/discount-calculator" className="text-pink-600 hover:text-pink-700 font-medium text-sm">Calculate Discounts →</a>
                  </div>

                  <div className="bg-white rounded-lg p-4 text-center hover:shadow-md transition-shadow">
                    <div className="w-12 h-12 bg-indigo-500 text-white rounded-lg flex items-center justify-center mx-auto mb-3">
                      <i className="fas fa-coins text-xl"></i>
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-2">SIP Calculator</h4>
                    <p className="text-xs text-gray-600 mb-3">Plan systematic investment strategies for business growth funding</p>
                    <a href="/tools/sip-calculator" className="text-indigo-600 hover:text-indigo-700 font-medium text-sm">Calculate SIP →</a>
                  </div>

                  <div className="bg-white rounded-lg p-4 text-center hover:shadow-md transition-shadow">
                    <div className="w-12 h-12 bg-yellow-500 text-white rounded-lg flex items-center justify-center mx-auto mb-3">
                      <i className="fas fa-clock text-xl"></i>
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-2">Retirement Calculator</h4>
                    <p className="text-xs text-gray-600 mb-3">Plan long-term financial security and business exit strategies</p>
                    <a href="/tools/retirement-calculator" className="text-yellow-600 hover:text-yellow-700 font-medium text-sm">Plan Retirement →</a>
                  </div>

                </div>
              </div>

              {/* FAQ Section */}
              <div className="mt-8 bg-white rounded-2xl shadow-lg p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Frequently Asked Questions About Break-Even Analysis</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">What is a good break-even point?</h3>
                      <p className="text-gray-600 text-sm">A good break-even point is one that's achievable within your market capacity and allows for reasonable profit margins above the break-even level. Generally, a lower break-even point indicates better business efficiency and reduced risk.</p>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">How often should I calculate break-even?</h3>
                      <p className="text-gray-600 text-sm">Review your break-even analysis monthly or quarterly, and whenever there are significant changes in costs, pricing, or business operations. Regular analysis helps you stay on top of profitability trends.</p>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">Can break-even analysis help with pricing?</h3>
                      <p className="text-gray-600 text-sm">Yes, break-even analysis is excellent for pricing decisions. It shows the minimum price needed to cover costs and helps evaluate pricing strategies' profitability impact. Use our <a href="/tools/discount-calculator" className="text-blue-600 hover:text-blue-700 underline">Discount Calculator</a> for pricing strategy optimization.</p>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">What's the difference between break-even analysis and ROI?</h3>
                      <p className="text-gray-600 text-sm">Break-even analysis determines when you'll recover costs, while ROI measures investment profitability. Both are crucial for business decisions. Calculate ROI with our <a href="/tools/roi-calculator" className="text-blue-600 hover:text-blue-700 underline">ROI Calculator</a>.</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">What if my costs vary significantly?</h3>
                      <p className="text-gray-600 text-sm">For businesses with highly variable costs, consider using average costs or creating multiple scenarios to understand different break-even points under various conditions. This provides a more comprehensive risk assessment.</p>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">Is break-even analysis suitable for service businesses?</h3>
                      <p className="text-gray-600 text-sm">Absolutely. Service businesses can use break-even analysis by treating billable hours, clients served, or projects completed as their "units." It's particularly useful for freelancers and consultants.</p>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">How does seasonality affect break-even analysis?</h3>
                      <p className="text-gray-600 text-sm">Seasonal businesses should calculate break-even points for different periods and ensure they generate sufficient profit during peak seasons to cover off-season fixed costs. Consider creating monthly break-even targets.</p>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">Can I use this for loan planning?</h3>
                      <p className="text-gray-600 text-sm">Yes, break-even analysis helps determine loan affordability by showing minimum revenue requirements. Combine with our <a href="/tools/business-loan-calculator" className="text-blue-600 hover:text-blue-700 underline">Business Loan Calculator</a> for comprehensive planning.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </main>
        
        <Footer />
      </div>
    </>
  );
};

export default BreakEvenCalculator;
