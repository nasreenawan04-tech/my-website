
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
        <title>Break-Even Calculator - Calculate Break-Even Point | DapsiWow</title>
        <meta name="description" content="Calculate break-even point for your business. Determine units and revenue needed to cover costs." />
        <meta property="og:title" content="Break-Even Calculator - Calculate Break-Even Point | DapsiWow" />
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
                Calculate the break-even point for your business
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

              
            </div>
          </section>
        </main>
        
        <Footer />
      </div>
    </>
  );
};

export default BreakEvenCalculator;
