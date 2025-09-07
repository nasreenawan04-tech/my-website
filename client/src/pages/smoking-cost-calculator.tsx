import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calculator, DollarSign, TrendingDown, AlertTriangle, Calendar, PiggyBank } from 'lucide-react';

interface SmokingResult {
  dailyCost: number;
  weeklyCost: number;
  monthlyCost: number;
  yearlyCost: number;
  fiveYearCost: number;
  tenYearCost: number;
  twentyYearCost: number;
  cigarettesPerYear: number;
  packsPerYear: number;
  potentialSavings: string[];
}

const SmokingCostCalculator = () => {
  const [cigarettesPerDay, setCigarettesPerDay] = useState('');
  const [pricePerPack, setPricePerPack] = useState('');
  const [cigarettesPerPack, setCigarettesPerPack] = useState('20');
  const [currency, setCurrency] = useState('USD');
  const [includeExtras, setIncludeExtras] = useState(true);
  const [result, setResult] = useState<SmokingResult | null>(null);

  const currencySymbols: Record<string, string> = {
    USD: '$',
    EUR: '€',
    GBP: '£',
    CAD: 'C$',
    AUD: 'A$',
    JPY: '¥'
  };

  const calculateCosts = () => {
    const cigsPerDay = parseFloat(cigarettesPerDay);
    const packPrice = parseFloat(pricePerPack);
    const cigsPerPack = parseInt(cigarettesPerPack);

    if (cigsPerDay && cigsPerDay > 0 && packPrice && packPrice > 0 && cigsPerPack && cigsPerPack > 0) {
      // Calculate base costs
      const costPerCigarette = packPrice / cigsPerPack;
      const baseDailyCost = cigsPerDay * costPerCigarette;
      
      // Add extra costs (lighters, accessories, etc.) - roughly 10% additional
      const extraCostMultiplier = includeExtras ? 1.1 : 1.0;
      
      const dailyCost = baseDailyCost * extraCostMultiplier;
      const weeklyCost = dailyCost * 7;
      const monthlyCost = dailyCost * 30.44; // Average days per month
      const yearlyCost = dailyCost * 365;
      const fiveYearCost = yearlyCost * 5;
      const tenYearCost = yearlyCost * 10;
      const twentyYearCost = yearlyCost * 20;
      
      const cigarettesPerYear = cigsPerDay * 365;
      const packsPerYear = cigarettesPerYear / cigsPerPack;

      // Generate potential savings comparisons
      const potentialSavings = generateSavingsComparisons(yearlyCost);

      setResult({
        dailyCost: Math.round(dailyCost * 100) / 100,
        weeklyCost: Math.round(weeklyCost * 100) / 100,
        monthlyCost: Math.round(monthlyCost * 100) / 100,
        yearlyCost: Math.round(yearlyCost * 100) / 100,
        fiveYearCost: Math.round(fiveYearCost * 100) / 100,
        tenYearCost: Math.round(tenYearCost * 100) / 100,
        twentyYearCost: Math.round(twentyYearCost * 100) / 100,
        cigarettesPerYear: Math.round(cigarettesPerYear),
        packsPerYear: Math.round(packsPerYear * 10) / 10,
        potentialSavings
      });
    }
  };

  const generateSavingsComparisons = (yearlyCost: number): string[] => {
    const comparisons = [];
    
    if (yearlyCost >= 500) {
      comparisons.push('A weekend vacation');
    }
    if (yearlyCost >= 1000) {
      comparisons.push('A new laptop or smartphone');
    }
    if (yearlyCost >= 2000) {
      comparisons.push('A major home improvement project');
    }
    if (yearlyCost >= 3000) {
      comparisons.push('A nice used car');
    }
    if (yearlyCost >= 5000) {
      comparisons.push('A year of college tuition');
    }
    
    // Always include these
    comparisons.push('Gym membership for the entire year');
    comparisons.push('Several months of groceries');
    comparisons.push('Emergency fund contribution');
    
    return comparisons.slice(0, 4); // Return top 4 most relevant
  };

  const resetCalculator = () => {
    setCigarettesPerDay('');
    setPricePerPack('');
    setCigarettesPerPack('20');
    setCurrency('USD');
    setIncludeExtras(true);
    setResult(null);
  };

  const formatCurrency = (amount: number): string => {
    const symbol = currencySymbols[currency] || '$';
    return `${symbol}${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const currencyOptions = [
    { value: 'USD', label: 'US Dollar ($)' },
    { value: 'EUR', label: 'Euro (€)' },
    { value: 'GBP', label: 'British Pound (£)' },
    { value: 'CAD', label: 'Canadian Dollar (C$)' },
    { value: 'AUD', label: 'Australian Dollar (A$)' },
    { value: 'JPY', label: 'Japanese Yen (¥)' }
  ];

  return (
    <>
      <Helmet>
        <title>Smoking Cost Calculator - Calculate Financial Cost of Smoking | ToolsHub</title>
        <meta name="description" content="Free smoking cost calculator to calculate how much money you spend on cigarettes daily, monthly, and yearly. See potential savings from quitting smoking." />
        <meta name="keywords" content="smoking cost calculator, cigarette cost calculator, smoking expenses, quit smoking savings, tobacco cost" />
        <meta property="og:title" content="Smoking Cost Calculator - Calculate Financial Cost of Smoking | ToolsHub" />
        <meta property="og:description" content="Calculate how much money you spend on smoking and see potential savings from quitting." />
        <meta property="og:type" content="website" />
        <link rel="canonical" href="/tools/smoking-cost-calculator" />
      </Helmet>

      <div className="min-h-screen flex flex-col" data-testid="page-smoking-cost">
        <Header />
        
        <main className="flex-1 bg-neutral-50">
          {/* Hero Section */}
          <section className="bg-gradient-to-r from-red-600 via-orange-500 to-yellow-600 text-white py-16">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <div className="w-20 h-20 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <TrendingDown className="w-8 h-8" />
              </div>
              <h1 className="text-4xl sm:text-5xl font-bold mb-6" data-testid="text-page-title">
                Smoking Cost Calculator
              </h1>
              <p className="text-xl text-orange-100 max-w-2xl mx-auto">
                Calculate how much money you spend on smoking and discover potential savings from quitting. See the true financial impact of smoking habits.
              </p>
            </div>
          </section>

          {/* Calculator Section */}
          <section className="py-16">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
              <Card className="bg-white shadow-lg border-0">
                <CardContent className="p-8">
                  <div className="text-center mb-8">
                    <Calculator className="w-12 h-12 text-red-600 mx-auto mb-4" />
                    <h2 className="text-2xl font-semibold text-gray-900 mb-2">Smoking Cost Calculator</h2>
                    <p className="text-gray-600">Calculate the financial impact of your smoking habits</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Input Section */}
                    <div className="space-y-6">
                      {/* Cigarettes per Day */}
                      <div>
                        <Label htmlFor="cigarettes-per-day" className="text-base font-medium text-gray-700 mb-2 block">
                          Cigarettes per Day
                        </Label>
                        <Input
                          id="cigarettes-per-day"
                          type="number"
                          value={cigarettesPerDay}
                          onChange={(e) => setCigarettesPerDay(e.target.value)}
                          placeholder="Enter cigarettes per day"
                          step="0.5"
                          min="0"
                          data-testid="input-cigarettes-per-day"
                        />
                      </div>

                      {/* Price per Pack */}
                      <div>
                        <Label htmlFor="price-per-pack" className="text-base font-medium text-gray-700 mb-2 block">
                          Price per Pack
                        </Label>
                        <div className="flex gap-2">
                          <Input
                            id="price-per-pack"
                            type="number"
                            value={pricePerPack}
                            onChange={(e) => setPricePerPack(e.target.value)}
                            placeholder="Enter price per pack"
                            step="0.01"
                            min="0"
                            className="flex-1"
                            data-testid="input-price-per-pack"
                          />
                          <Select value={currency} onValueChange={setCurrency}>
                            <SelectTrigger className="w-32" data-testid="select-currency">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {currencyOptions.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      {/* Cigarettes per Pack */}
                      <div>
                        <Label htmlFor="cigarettes-per-pack" className="text-base font-medium text-gray-700 mb-2 block">
                          Cigarettes per Pack
                        </Label>
                        <Select value={cigarettesPerPack} onValueChange={setCigarettesPerPack}>
                          <SelectTrigger data-testid="select-cigarettes-per-pack">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="10">10 cigarettes</SelectItem>
                            <SelectItem value="20">20 cigarettes (standard)</SelectItem>
                            <SelectItem value="25">25 cigarettes</SelectItem>
                            <SelectItem value="30">30 cigarettes</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Include Extra Costs */}
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="include-extras"
                          checked={includeExtras}
                          onChange={(e) => setIncludeExtras(e.target.checked)}
                          className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                          data-testid="checkbox-include-extras"
                        />
                        <Label htmlFor="include-extras" className="text-sm text-gray-700">
                          Include extra costs (lighters, accessories, etc.)
                        </Label>
                      </div>
                    </div>

                    {/* Actions and Warning */}
                    <div className="space-y-6">
                      <div className="flex flex-col space-y-4">
                        <Button
                          onClick={calculateCosts}
                          className="bg-red-600 hover:bg-red-700 text-white"
                          data-testid="button-calculate"
                        >
                          <Calculator className="w-4 h-4 mr-2" />
                          Calculate Smoking Costs
                        </Button>
                        <Button
                          onClick={resetCalculator}
                          variant="outline"
                          className="text-gray-600 border-gray-300 hover:bg-gray-50"
                          data-testid="button-reset"
                        >
                          Reset Calculator
                        </Button>
                      </div>

                      {/* Health Warning */}
                      <Card className="bg-red-50 border-red-200">
                        <CardContent className="p-4">
                          <h3 className="font-semibold text-red-900 mb-2 flex items-center">
                            <AlertTriangle className="w-4 h-4 mr-2" />
                            Health Impact
                          </h3>
                          <ul className="text-sm text-red-800 space-y-1">
                            <li>• Smoking increases risk of heart disease, cancer, and stroke</li>
                            <li>• Each cigarette reduces life expectancy by ~11 minutes</li>
                            <li>• Quitting at any age provides immediate health benefits</li>
                            <li>• Financial savings are just one benefit of quitting</li>
                          </ul>
                        </CardContent>
                      </Card>

                      {/* Quick Stats */}
                      <Card className="bg-gray-50 border-gray-200">
                        <CardContent className="p-4">
                          <h3 className="font-semibold text-gray-900 mb-2">Average Costs (USA)</h3>
                          <div className="text-sm text-gray-700 space-y-1">
                            <p>📦 Pack price: $6-15</p>
                            <p>🚬 1 pack/day: $2,500-5,500/year</p>
                            <p>💰 Lifetime cost: $50,000-150,000</p>
                            <p>🏥 Health costs: Additional $3,000+/year</p>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Results Section */}
              {result && (
                <Card className="mt-8 bg-red-50 border-red-200" data-testid="results-section">
                  <CardContent className="p-8">
                    <div className="text-center mb-6">
                      <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <DollarSign className="w-8 h-8 text-red-600" />
                      </div>
                      <h3 className="text-2xl font-semibold text-gray-900 mb-2">Your Smoking Costs</h3>
                      <p className="text-gray-600">
                        {parseFloat(cigarettesPerDay)} cigarettes per day at {formatCurrency(parseFloat(pricePerPack))} per pack
                      </p>
                    </div>

                    {/* Cost Breakdown */}
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-8">
                      <div className="text-center p-4 bg-white rounded-lg border border-red-200">
                        <Calendar className="w-6 h-6 text-red-600 mx-auto mb-2" />
                        <div className="text-lg font-bold text-gray-900" data-testid="result-daily-cost">
                          {formatCurrency(result.dailyCost)}
                        </div>
                        <div className="text-xs text-gray-600">Daily</div>
                      </div>

                      <div className="text-center p-4 bg-white rounded-lg border border-red-200">
                        <Calendar className="w-6 h-6 text-red-600 mx-auto mb-2" />
                        <div className="text-lg font-bold text-gray-900" data-testid="result-weekly-cost">
                          {formatCurrency(result.weeklyCost)}
                        </div>
                        <div className="text-xs text-gray-600">Weekly</div>
                      </div>

                      <div className="text-center p-4 bg-white rounded-lg border border-red-200">
                        <Calendar className="w-6 h-6 text-red-600 mx-auto mb-2" />
                        <div className="text-lg font-bold text-gray-900" data-testid="result-monthly-cost">
                          {formatCurrency(result.monthlyCost)}
                        </div>
                        <div className="text-xs text-gray-600">Monthly</div>
                      </div>

                      <div className="text-center p-4 bg-white rounded-lg border border-red-200">
                        <Calendar className="w-6 h-6 text-red-600 mx-auto mb-2" />
                        <div className="text-lg font-bold text-gray-900" data-testid="result-yearly-cost">
                          {formatCurrency(result.yearlyCost)}
                        </div>
                        <div className="text-xs text-gray-600">Yearly</div>
                      </div>

                      <div className="text-center p-4 bg-white rounded-lg border border-orange-200">
                        <Calendar className="w-6 h-6 text-orange-600 mx-auto mb-2" />
                        <div className="text-lg font-bold text-gray-900" data-testid="result-five-year-cost">
                          {formatCurrency(result.fiveYearCost)}
                        </div>
                        <div className="text-xs text-gray-600">5 Years</div>
                      </div>

                      <div className="text-center p-4 bg-white rounded-lg border border-orange-200">
                        <Calendar className="w-6 h-6 text-orange-600 mx-auto mb-2" />
                        <div className="text-lg font-bold text-gray-900" data-testid="result-ten-year-cost">
                          {formatCurrency(result.tenYearCost)}
                        </div>
                        <div className="text-xs text-gray-600">10 Years</div>
                      </div>

                      <div className="text-center p-4 bg-white rounded-lg border border-yellow-200">
                        <Calendar className="w-6 h-6 text-yellow-600 mx-auto mb-2" />
                        <div className="text-lg font-bold text-gray-900" data-testid="result-twenty-year-cost">
                          {formatCurrency(result.twentyYearCost)}
                        </div>
                        <div className="text-xs text-gray-600">20 Years</div>
                      </div>
                    </div>

                    {/* Consumption Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      <div className="text-center p-4 bg-white rounded-lg border border-red-200">
                        <div className="text-2xl font-bold text-gray-900" data-testid="result-cigarettes-per-year">
                          {result.cigarettesPerYear.toLocaleString()}
                        </div>
                        <div className="text-sm text-gray-600">Cigarettes per Year</div>
                      </div>

                      <div className="text-center p-4 bg-white rounded-lg border border-red-200">
                        <div className="text-2xl font-bold text-gray-900" data-testid="result-packs-per-year">
                          {result.packsPerYear.toLocaleString()}
                        </div>
                        <div className="text-sm text-gray-600">Packs per Year</div>
                      </div>
                    </div>

                    {/* Potential Savings */}
                    <Card className="bg-green-50 border-green-200">
                      <CardContent className="p-6">
                        <h4 className="text-lg font-semibold text-green-900 mb-4 flex items-center">
                          <PiggyBank className="w-5 h-5 mr-2" />
                          What You Could Buy Instead (Per Year)
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {result.potentialSavings.map((saving, index) => (
                            <div key={index} className="flex items-center text-green-800">
                              <span className="text-green-600 mr-2">✓</span>
                              {saving}
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </CardContent>
                </Card>
              )}

              {/* Educational Content */}
              <div className="mt-12 space-y-8">
                {/* Hidden Costs */}
                <Card className="bg-white shadow-lg">
                  <CardContent className="p-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Hidden Costs of Smoking</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      <div className="p-4 border border-gray-200 rounded-lg">
                        <h3 className="font-semibold text-gray-900 mb-2">💊 Healthcare Costs</h3>
                        <p className="text-sm text-gray-600">$3,000+ additional per year in medical expenses</p>
                      </div>
                      
                      <div className="p-4 border border-gray-200 rounded-lg">
                        <h3 className="font-semibold text-gray-900 mb-2">🏠 Property Damage</h3>
                        <p className="text-sm text-gray-600">Burns, odors, reduced home value</p>
                      </div>
                      
                      <div className="p-4 border border-gray-200 rounded-lg">
                        <h3 className="font-semibold text-gray-900 mb-2">🚗 Vehicle Depreciation</h3>
                        <p className="text-sm text-gray-600">Smoking reduces car resale value by 7-10%</p>
                      </div>
                      
                      <div className="p-4 border border-gray-200 rounded-lg">
                        <h3 className="font-semibold text-gray-900 mb-2">🦷 Dental Care</h3>
                        <p className="text-sm text-gray-600">Extra cleanings, treatments, teeth whitening</p>
                      </div>
                      
                      <div className="p-4 border border-gray-200 rounded-lg">
                        <h3 className="font-semibold text-gray-900 mb-2">💼 Lost Productivity</h3>
                        <p className="text-sm text-gray-600">Sick days, smoke breaks, reduced income potential</p>
                      </div>
                      
                      <div className="p-4 border border-gray-200 rounded-lg">
                        <h3 className="font-semibold text-gray-900 mb-2">💸 Insurance Premiums</h3>
                        <p className="text-sm text-gray-600">Higher life and health insurance costs</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Quitting Benefits */}
                <Card className="bg-white shadow-lg">
                  <CardContent className="p-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Benefits of Quitting Smoking</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-3">Financial Benefits</h3>
                        <ul className="space-y-2 text-sm text-gray-600">
                          <li>• Immediate savings on cigarette purchases</li>
                          <li>• Lower health insurance premiums</li>
                          <li>• Reduced medical expenses</li>
                          <li>• Money available for other goals</li>
                          <li>• Potential for investment returns</li>
                        </ul>
                      </div>
                      
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-3">Health Timeline</h3>
                        <ul className="space-y-2 text-sm text-gray-600">
                          <li>• 20 minutes: Heart rate and blood pressure drop</li>
                          <li>• 12 hours: Carbon monoxide levels normalize</li>
                          <li>• 2-12 weeks: Circulation improves</li>
                          <li>• 1-9 months: Coughing and shortness of breath decrease</li>
                          <li>• 1 year: Risk of heart disease cut in half</li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* FAQ */}
                <Card className="bg-white shadow-lg">
                  <CardContent className="p-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Frequently Asked Questions</h2>
                    <div className="space-y-4">
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-2">How accurate is this cost calculation?</h3>
                        <p className="text-gray-600 text-sm">
                          The calculator provides estimates based on your inputs. Actual costs may vary due to taxes, brand preferences, and smoking patterns. This doesn't include additional health-related costs.
                        </p>
                      </div>
                      
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-2">What about e-cigarettes and vaping costs?</h3>
                        <p className="text-gray-600 text-sm">
                          This calculator focuses on traditional cigarettes. Vaping costs vary widely based on device, liquid consumption, and replacement parts, but are generally 50-80% less than smoking.
                        </p>
                      </div>
                      
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-2">How can I use these savings calculations for motivation?</h3>
                        <p className="text-gray-600 text-sm">
                          Set specific savings goals and track your progress. Put the money you would have spent on cigarettes into a separate savings account and watch it grow.
                        </p>
                      </div>
                      
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-2">Are there resources to help quit smoking?</h3>
                        <p className="text-gray-600 text-sm">
                          Yes! Contact your doctor, call 1-800-QUIT-NOW, or visit smokefree.gov for free resources including counseling, apps, and support programs.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </section>
        </main>
        
        <Footer />
      </div>
    </>
  );
};

export default SmokingCostCalculator;