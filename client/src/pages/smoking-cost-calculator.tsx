
import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-red-50 to-orange-50">
      <Helmet>
        <title>Smoking Cost Calculator - Calculate True Financial Cost of Smoking | DapsiWow</title>
        <meta name="description" content="Free smoking cost calculator to calculate how much money you spend on cigarettes daily, monthly, and yearly. Discover potential savings from quitting smoking with our comprehensive financial analysis tool." />
        <meta name="keywords" content="smoking cost calculator, cigarette cost calculator, smoking expenses, quit smoking savings, tobacco cost, smoking financial impact, cigarette price calculator, smoking budget calculator" />
        <meta property="og:title" content="Smoking Cost Calculator - Calculate True Financial Cost of Smoking | DapsiWow" />
        <meta property="og:description" content="Calculate the true financial cost of smoking with our comprehensive smoking cost calculator. See daily, monthly, and yearly expenses plus potential savings from quitting." />
        <meta property="og:type" content="website" />
        <meta name="robots" content="index, follow" />
        <meta name="author" content="DapsiWow" />
        <link rel="canonical" href="https://dapsiwow.com/tools/smoking-cost-calculator" />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            "name": "Smoking Cost Calculator",
            "description": "Professional smoking cost calculator for calculating the true financial impact of smoking habits including daily, monthly, and yearly expenses with potential savings analysis.",
            "url": "https://dapsiwow.com/tools/smoking-cost-calculator",
            "applicationCategory": "FinanceApplication",
            "operatingSystem": "Any",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "USD"
            },
            "featureList": [
              "Calculate daily, monthly, and yearly smoking costs",
              "Multiple currency support",
              "Include additional smoking-related expenses",
              "Potential savings analysis",
              "Long-term financial projections"
            ]
          })}
        </script>
      </Helmet>

      <Header />

      <main>
        {/* Hero Section */}
        <section className="relative py-20 sm:py-28 lg:py-32 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-red-600/10 to-orange-600/20"></div>
          <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="space-y-8">
              <div className="inline-flex items-center px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full border border-red-200">
                <span className="text-sm font-medium text-red-700">Financial Impact Calculator</span>
              </div>
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-slate-900 leading-tight">
                Smoking Cost
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-orange-600">
                  Calculator
                </span>
              </h1>
              <p className="text-xl sm:text-2xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
                Calculate the true financial cost of smoking and discover your potential savings from quitting
              </p>
            </div>
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-4 py-16">
          {/* Main Calculator Card */}
          <Card className="bg-white/90 backdrop-blur-sm shadow-2xl border-0 rounded-3xl overflow-hidden">
            <CardContent className="p-0">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
                {/* Input Section */}
                <div className="p-8 lg:p-12 space-y-8">
                  <div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">Calculation Settings</h2>
                    <p className="text-gray-600">Enter your smoking habits and costs</p>
                  </div>

                  <div className="space-y-6">
                    {/* Cigarettes per Day */}
                    <div className="space-y-3">
                      <Label htmlFor="cigarettes-per-day" className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
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
                        className="h-14 text-lg border-2 border-gray-200 rounded-xl focus:border-red-500 focus:ring-red-500"
                        data-testid="input-cigarettes-per-day"
                      />
                    </div>

                    {/* Price per Pack */}
                    <div className="space-y-3">
                      <Label htmlFor="price-per-pack" className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
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
                          className="flex-1 h-14 text-lg border-2 border-gray-200 rounded-xl focus:border-red-500 focus:ring-red-500"
                          data-testid="input-price-per-pack"
                        />
                        <Select value={currency} onValueChange={setCurrency}>
                          <SelectTrigger className="w-32 h-14 border-2 border-gray-200 rounded-xl" data-testid="select-currency">
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
                    <div className="space-y-3">
                      <Label htmlFor="cigarettes-per-pack" className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                        Cigarettes per Pack
                      </Label>
                      <Select value={cigarettesPerPack} onValueChange={setCigarettesPerPack}>
                        <SelectTrigger className="h-14 border-2 border-gray-200 rounded-xl text-lg" data-testid="select-cigarettes-per-pack">
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
                    <div className="space-y-4 bg-gray-50 rounded-xl p-6">
                      <div className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          id="include-extras"
                          checked={includeExtras}
                          onChange={(e) => setIncludeExtras(e.target.checked)}
                          className="h-5 w-5 text-red-600 border-2 border-gray-300 rounded focus:ring-red-500"
                          data-testid="checkbox-include-extras"
                        />
                        <label htmlFor="include-extras" className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                          Include Extra Costs
                        </label>
                      </div>
                      <p className="text-sm text-gray-600">
                        Include additional costs like lighters, accessories, and smoking-related expenses
                      </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4 pt-6">
                      <Button
                        onClick={calculateCosts}
                        className="flex-1 h-14 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white font-semibold text-lg rounded-xl shadow-lg transform transition-all duration-200 hover:scale-105"
                        data-testid="button-calculate"
                      >
                        Calculate Costs
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
                </div>

                {/* Results Section */}
                <div className="bg-gradient-to-br from-gray-50 to-red-50 p-8 lg:p-12">
                  <h2 className="text-2xl font-bold text-gray-900 mb-8">Smoking Cost Analysis</h2>

                  {result ? (
                    <div className="space-y-6" data-testid="results-section">
                      {/* Cost Summary */}
                      <div className="bg-white rounded-2xl p-6 shadow-lg border border-red-100">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">Your Smoking Costs</h3>
                        <p className="text-gray-600 mb-4">
                          {parseFloat(cigarettesPerDay)} cigarettes per day at {formatCurrency(parseFloat(pricePerPack))} per pack
                        </p>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div className="text-center p-3 bg-red-50 rounded-lg">
                            <div className="text-lg font-bold text-red-600" data-testid="result-daily-cost">
                              {formatCurrency(result.dailyCost)}
                            </div>
                            <div className="text-xs text-gray-600">Daily</div>
                          </div>
                          <div className="text-center p-3 bg-red-50 rounded-lg">
                            <div className="text-lg font-bold text-red-600" data-testid="result-weekly-cost">
                              {formatCurrency(result.weeklyCost)}
                            </div>
                            <div className="text-xs text-gray-600">Weekly</div>
                          </div>
                          <div className="text-center p-3 bg-red-50 rounded-lg">
                            <div className="text-lg font-bold text-red-600" data-testid="result-monthly-cost">
                              {formatCurrency(result.monthlyCost)}
                            </div>
                            <div className="text-xs text-gray-600">Monthly</div>
                          </div>
                          <div className="text-center p-3 bg-red-50 rounded-lg">
                            <div className="text-lg font-bold text-red-600" data-testid="result-yearly-cost">
                              {formatCurrency(result.yearlyCost)}
                            </div>
                            <div className="text-xs text-gray-600">Yearly</div>
                          </div>
                        </div>
                      </div>

                      {/* Long-term Projections */}
                      <div className="bg-white rounded-2xl p-6 shadow-lg border border-orange-100">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">Long-term Cost Projections</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          <div className="text-center p-3 bg-orange-50 rounded-lg">
                            <div className="text-lg font-bold text-orange-600" data-testid="result-five-year-cost">
                              {formatCurrency(result.fiveYearCost)}
                            </div>
                            <div className="text-xs text-gray-600">5 Years</div>
                          </div>
                          <div className="text-center p-3 bg-orange-50 rounded-lg">
                            <div className="text-lg font-bold text-orange-600" data-testid="result-ten-year-cost">
                              {formatCurrency(result.tenYearCost)}
                            </div>
                            <div className="text-xs text-gray-600">10 Years</div>
                          </div>
                          <div className="text-center p-3 bg-orange-50 rounded-lg">
                            <div className="text-lg font-bold text-orange-600" data-testid="result-twenty-year-cost">
                              {formatCurrency(result.twentyYearCost)}
                            </div>
                            <div className="text-xs text-gray-600">20 Years</div>
                          </div>
                        </div>
                      </div>

                      {/* Consumption Statistics */}
                      <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">Annual Consumption</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="text-center p-3 bg-gray-50 rounded-lg">
                            <div className="text-lg font-bold text-gray-700" data-testid="result-cigarettes-per-year">
                              {result.cigarettesPerYear.toLocaleString()}
                            </div>
                            <div className="text-xs text-gray-600">Cigarettes per Year</div>
                          </div>
                          <div className="text-center p-3 bg-gray-50 rounded-lg">
                            <div className="text-lg font-bold text-gray-700" data-testid="result-packs-per-year">
                              {result.packsPerYear.toLocaleString()}
                            </div>
                            <div className="text-xs text-gray-600">Packs per Year</div>
                          </div>
                        </div>
                      </div>

                      {/* Potential Savings */}
                      <div className="bg-green-50 rounded-2xl p-6 shadow-lg border border-green-200">
                        <h3 className="text-lg font-bold text-green-900 mb-4">What You Could Buy Instead</h3>
                        <div className="space-y-2">
                          {result.potentialSavings.map((saving, index) => (
                            <div key={index} className="flex items-center text-green-800">
                              <span className="text-green-600 mr-2">✓</span>
                              {saving}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-16" data-testid="no-results">
                      <div className="w-20 h-20 bg-gray-200 rounded-full mx-auto mb-6 flex items-center justify-center">
                        <div className="text-3xl font-bold text-gray-400">$</div>
                      </div>
                      <p className="text-gray-500 text-lg">Enter your smoking details to see cost analysis</p>
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
                <h3 className="text-2xl font-bold text-gray-900 mb-6">What is a Smoking Cost Calculator?</h3>
                <div className="space-y-4 text-gray-600">
                  <p>
                    A smoking cost calculator is a financial analysis tool that helps smokers understand the true economic 
                    impact of their tobacco consumption. This calculator goes beyond simple pack prices to show daily, 
                    monthly, and yearly expenses, providing a comprehensive view of smoking-related costs over time.
                  </p>
                  <p>
                    Our advanced smoking cost calculator factors in additional expenses like lighters, accessories, and 
                    smoking-related items, giving you a realistic picture of your total smoking expenditure. The tool 
                    also projects long-term costs and shows potential savings to motivate quitting decisions.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Why Use Our Smoking Cost Calculator?</h3>
                <div className="space-y-4 text-gray-600">
                  <p>
                    Understanding the financial impact of smoking can be a powerful motivator for quitting. Our calculator 
                    provides detailed cost breakdowns that many smokers find shocking, helping them visualize how much 
                    money could be saved by quitting tobacco use.
                  </p>
                  <ul className="space-y-2 list-disc list-inside">
                    <li>Accurate financial projections up to 20 years</li>
                    <li>Multiple currency support for global users</li>
                    <li>Includes hidden costs often overlooked</li>
                    <li>Shows alternative uses for saved money</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Calculator Features</h3>
                <div className="space-y-3 text-gray-600">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Calculate daily, weekly, monthly, and yearly costs</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Long-term financial projections (5, 10, 20 years)</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Support for multiple currencies and pack sizes</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Include additional smoking-related expenses</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Potential savings visualization</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Understanding Smoking Costs</h3>
                <div className="space-y-3 text-gray-600">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Direct costs: cigarettes, tobacco products</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Indirect costs: lighters, ashtrays, accessories</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Hidden costs: increased insurance premiums</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Health costs: additional medical expenses</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Property costs: cleaning, repairs, depreciation</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Additional SEO Content Sections */}
          <div className="mt-12 space-y-8">
            {/* Hidden Costs of Smoking */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Hidden Financial Costs of Smoking</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-gray-800">Healthcare Expenses</h4>
                    <p className="text-gray-600 text-sm">
                      Smokers typically spend $3,000-5,000 more annually on healthcare costs including doctor visits, 
                      medications, dental care, and treatments for smoking-related conditions. These costs compound 
                      over time and are often not included in basic smoking cost calculations.
                    </p>
                  </div>
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-gray-800">Insurance Premiums</h4>
                    <p className="text-gray-600 text-sm">
                      Life insurance premiums for smokers can be 2-3 times higher than non-smokers. Health insurance 
                      surcharges, auto insurance increases due to smoking-related accidents, and homeowner's insurance 
                      adjustments all add to the hidden costs of smoking.
                    </p>
                  </div>
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-gray-800">Property Damage</h4>
                    <p className="text-gray-600 text-sm">
                      Smoking causes property damage through burns, stains, and odors that reduce home and vehicle 
                      resale values. Professional cleaning services, paint jobs, carpet replacement, and other 
                      maintenance costs can add thousands to annual expenses.
                    </p>
                  </div>
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-gray-800">Lost Productivity</h4>
                    <p className="text-gray-600 text-sm">
                      Smoking breaks, sick days, and reduced work performance due to health issues can impact earning 
                      potential. Studies show smokers miss more work days and may face career limitations in 
                      smoke-free workplaces, affecting long-term financial growth.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Cost by Demographics */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
                <CardContent className="p-8">
                  <h3 className="text-xl font-bold text-gray-900 mb-6">Average Smoking Costs by Region</h3>
                  <div className="space-y-4 text-gray-600">
                    <div className="text-sm">
                      <h4 className="font-semibold text-gray-800 mb-2">United States</h4>
                      <p>Average pack price: $6.50-$15.00</p>
                      <p>Annual cost (1 pack/day): $2,400-$5,500</p>
                    </div>
                    <div className="text-sm">
                      <h4 className="font-semibold text-gray-800 mb-2">Canada</h4>
                      <p>Average pack price: $12.00-$17.00</p>
                      <p>Annual cost (1 pack/day): $4,400-$6,200</p>
                    </div>
                    <div className="text-sm">
                      <h4 className="font-semibold text-gray-800 mb-2">Australia</h4>
                      <p>Average pack price: $25.00-$35.00</p>
                      <p>Annual cost (1 pack/day): $9,100-$12,800</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
                <CardContent className="p-8">
                  <h3 className="text-xl font-bold text-gray-900 mb-6">Smoking Costs by Age Group</h3>
                  <div className="space-y-4 text-gray-600">
                    <div className="text-sm">
                      <h4 className="font-semibold text-gray-800 mb-2">Ages 18-25</h4>
                      <p>Lifetime smoking cost: $200,000-$400,000</p>
                      <p>Opportunity cost with investment: $1.5M+</p>
                    </div>
                    <div className="text-sm">
                      <h4 className="font-semibold text-gray-800 mb-2">Ages 26-40</h4>
                      <p>Lifetime smoking cost: $150,000-$300,000</p>
                      <p>Opportunity cost with investment: $800K+</p>
                    </div>
                    <div className="text-sm">
                      <h4 className="font-semibold text-gray-800 mb-2">Ages 40+</h4>
                      <p>Remaining lifetime cost: $100,000-$200,000</p>
                      <p>Health cost escalation: $5,000+/year</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
                <CardContent className="p-8">
                  <h3 className="text-xl font-bold text-gray-900 mb-6">Investment Opportunity Cost</h3>
                  <div className="space-y-4 text-gray-600">
                    <p className="text-sm">
                      The opportunity cost of smoking extends beyond direct expenses. Money spent on cigarettes 
                      could be invested for long-term growth.
                    </p>
                    <div className="text-sm">
                      <h4 className="font-semibold text-gray-800 mb-2">$3,000/year invested:</h4>
                      <p>10 years @ 7%: $41,500</p>
                      <p>20 years @ 7%: $123,000</p>
                      <p>30 years @ 7%: $283,000</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quitting Benefits Timeline */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Financial Benefits Timeline of Quitting Smoking</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <h4 className="font-semibold text-gray-800 mb-3">Immediate Financial Benefits</h4>
                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <div className="w-3 h-3 bg-green-500 rounded-full mt-1 flex-shrink-0"></div>
                        <div>
                          <h5 className="font-medium text-gray-800">Day 1</h5>
                          <p className="text-gray-600 text-sm">Immediate savings on daily cigarette purchases begin</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-3 h-3 bg-green-500 rounded-full mt-1 flex-shrink-0"></div>
                        <div>
                          <h5 className="font-medium text-gray-800">Week 1</h5>
                          <p className="text-gray-600 text-sm">Average savings of $50-100 depending on smoking habits</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-3 h-3 bg-green-500 rounded-full mt-1 flex-shrink-0"></div>
                        <div>
                          <h5 className="font-medium text-gray-800">Month 1</h5>
                          <p className="text-gray-600 text-sm">$200-500 saved, enough for significant purchases</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-3 h-3 bg-green-500 rounded-full mt-1 flex-shrink-0"></div>
                        <div>
                          <h5 className="font-medium text-gray-800">Year 1</h5>
                          <p className="text-gray-600 text-sm">$2,000-6,000 saved, major financial milestone reached</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-6">
                    <h4 className="font-semibold text-gray-800 mb-3">Long-term Financial Recovery</h4>
                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <div className="w-3 h-3 bg-blue-500 rounded-full mt-1 flex-shrink-0"></div>
                        <div>
                          <h5 className="font-medium text-gray-800">1-2 Years</h5>
                          <p className="text-gray-600 text-sm">Insurance premiums begin to decrease, health costs reduce</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-3 h-3 bg-blue-500 rounded-full mt-1 flex-shrink-0"></div>
                        <div>
                          <h5 className="font-medium text-gray-800">5 Years</h5>
                          <p className="text-gray-600 text-sm">Significant health cost savings, improved earning potential</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-3 h-3 bg-blue-500 rounded-full mt-1 flex-shrink-0"></div>
                        <div>
                          <h5 className="font-medium text-gray-800">10+ Years</h5>
                          <p className="text-gray-600 text-sm">Full insurance benefits, maximized investment growth</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* FAQ Section */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Frequently Asked Questions</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">How accurate is this smoking cost calculator?</h4>
                      <p className="text-gray-600 text-sm">
                        Our calculator provides highly accurate estimates based on your specific inputs including cigarettes 
                        per day, pack price, and additional costs. Results may vary based on local taxes, brand preferences, 
                        and individual smoking patterns, but the calculations provide reliable baseline projections.
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">What costs are included in the "extra expenses" option?</h4>
                      <p className="text-gray-600 text-sm">
                        Extra expenses include lighters, matches, ashtrays, smoking accessories, air fresheners, and other 
                        smoking-related purchases. This typically adds 10-15% to your total smoking costs and provides a 
                        more comprehensive view of smoking expenses.
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">Can I use this calculator for other tobacco products?</h4>
                      <p className="text-gray-600 text-sm">
                        While designed for cigarettes, you can adapt the calculator for cigars, pipe tobacco, or other products 
                        by adjusting the "cigarettes per pack" field and entering appropriate prices. For vaping products, 
                        consider liquid consumption and device replacement costs.
                      </p>
                    </div>
                  </div>
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">How does smoking affect my overall financial health?</h4>
                      <p className="text-gray-600 text-sm">
                        Smoking significantly impacts financial health through direct costs, healthcare expenses, reduced 
                        income potential, and lost investment opportunities. The money spent on smoking could instead build 
                        emergency funds, contribute to retirement, or fund major life goals.
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">What should I do with money saved from quitting smoking?</h4>
                      <p className="text-gray-600 text-sm">
                        Consider investing saved money in emergency funds, retirement accounts, or other financial goals. 
                        Many successful quitters set up automatic transfers to savings accounts to help visualize and 
                        maximize their financial benefits from quitting.
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">Are there resources to help quit smoking?</h4>
                      <p className="text-gray-600 text-sm">
                        Yes, many free resources are available including quitlines (1-800-QUIT-NOW), mobile apps, online 
                        support groups, and healthcare provider programs. Many insurance plans also cover smoking cessation 
                        programs and medications.
                      </p>
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

export default SmokingCostCalculator;
