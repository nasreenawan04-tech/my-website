
import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface NetWorthResult {
  totalAssets: number;
  totalLiabilities: number;
  netWorth: number;
  currency: string;
  assetBreakdown: { [key: string]: number };
  liabilityBreakdown: { [key: string]: number };
}

interface AssetItem {
  id: string;
  name: string;
  value: number;
  category: string;
}

interface LiabilityItem {
  id: string;
  name: string;
  value: number;
  category: string;
}

export default function NetWorthCalculator() {
  const [assets, setAssets] = useState<AssetItem[]>([
    { id: '1', name: 'Primary Home', value: 300000, category: 'Real Estate' },
    { id: '2', name: 'Savings Account', value: 15000, category: 'Cash & Savings' },
    { id: '3', name: '401(k)', value: 75000, category: 'Retirement Accounts' },
    { id: '4', name: 'Car', value: 20000, category: 'Vehicles' }
  ]);
  
  const [liabilities, setLiabilities] = useState<LiabilityItem[]>([
    { id: '1', name: 'Mortgage', value: 250000, category: 'Real Estate Debt' },
    { id: '2', name: 'Credit Cards', value: 5000, category: 'Credit Card Debt' },
    { id: '3', name: 'Car Loan', value: 15000, category: 'Vehicle Loans' }
  ]);
  
  const [currency, setCurrency] = useState('USD');
  const [country, setCountry] = useState('US');
  const [result, setResult] = useState<NetWorthResult | null>(null);

  const countries = [
    { code: 'US', name: 'United States', currency: 'USD' },
    { code: 'CA', name: 'Canada', currency: 'CAD' },
    { code: 'UK', name: 'United Kingdom', currency: 'GBP' },
    { code: 'AU', name: 'Australia', currency: 'AUD' },
    { code: 'DE', name: 'Germany', currency: 'EUR' },
    { code: 'FR', name: 'France', currency: 'EUR' },
    { code: 'IT', name: 'Italy', currency: 'EUR' },
    { code: 'ES', name: 'Spain', currency: 'EUR' },
    { code: 'JP', name: 'Japan', currency: 'JPY' },
    { code: 'KR', name: 'South Korea', currency: 'KRW' },
    { code: 'IN', name: 'India', currency: 'INR' },
    { code: 'CN', name: 'China', currency: 'CNY' },
    { code: 'BR', name: 'Brazil', currency: 'BRL' },
    { code: 'MX', name: 'Mexico', currency: 'MXN' },
    { code: 'SG', name: 'Singapore', currency: 'SGD' },
    { code: 'NZ', name: 'New Zealand', currency: 'NZD' }
  ];

  const assetCategories = [
    'Cash & Savings',
    'Checking Accounts',
    'Investment Accounts',
    'Retirement Accounts',
    'Real Estate',
    'Vehicles',
    'Personal Property',
    'Business Assets',
    'Collectibles',
    'Other Assets'
  ];

  const liabilityCategories = [
    'Credit Card Debt',
    'Student Loans',
    'Auto Loans',
    'Real Estate Debt',
    'Personal Loans',
    'Business Debt',
    'Other Liabilities'
  ];

  const calculateNetWorth = () => {
    const totalAssets = assets.reduce((sum, asset) => sum + asset.value, 0);
    const totalLiabilities = liabilities.reduce((sum, liability) => sum + liability.value, 0);
    const netWorth = totalAssets - totalLiabilities;

    // Calculate asset breakdown by category
    const assetBreakdown: { [key: string]: number } = {};
    assets.forEach(asset => {
      assetBreakdown[asset.category] = (assetBreakdown[asset.category] || 0) + asset.value;
    });

    // Calculate liability breakdown by category
    const liabilityBreakdown: { [key: string]: number } = {};
    liabilities.forEach(liability => {
      liabilityBreakdown[liability.category] = (liabilityBreakdown[liability.category] || 0) + liability.value;
    });

    setResult({
      totalAssets,
      totalLiabilities,
      netWorth,
      currency,
      assetBreakdown,
      liabilityBreakdown
    });
  };

  const resetCalculator = () => {
    setAssets([
      { id: '1', name: 'Primary Home', value: 300000, category: 'Real Estate' },
      { id: '2', name: 'Savings Account', value: 15000, category: 'Cash & Savings' },
      { id: '3', name: '401(k)', value: 75000, category: 'Retirement Accounts' },
      { id: '4', name: 'Car', value: 20000, category: 'Vehicles' }
    ]);
    setLiabilities([
      { id: '1', name: 'Mortgage', value: 250000, category: 'Real Estate Debt' },
      { id: '2', name: 'Credit Cards', value: 5000, category: 'Credit Card Debt' },
      { id: '3', name: 'Car Loan', value: 15000, category: 'Vehicle Loans' }
    ]);
    setCurrency('USD');
    setCountry('US');
    setResult(null);
  };

  const handleCountryChange = (newCountry: string) => {
    setCountry(newCountry);
    const countryData = countries.find(c => c.code === newCountry);
    if (countryData) {
      setCurrency(countryData.currency);
    }
  };

  const addAsset = () => {
    const newAsset: AssetItem = {
      id: Date.now().toString(),
      name: 'New Asset',
      value: 0,
      category: 'Other Assets'
    };
    setAssets([...assets, newAsset]);
  };

  const removeAsset = (id: string) => {
    setAssets(assets.filter(asset => asset.id !== id));
  };

  const updateAsset = (id: string, field: keyof AssetItem, value: any) => {
    setAssets(assets.map(asset => 
      asset.id === id ? { ...asset, [field]: value } : asset
    ));
  };

  const addLiability = () => {
    const newLiability: LiabilityItem = {
      id: Date.now().toString(),
      name: 'New Liability',
      value: 0,
      category: 'Other Liabilities'
    };
    setLiabilities([...liabilities, newLiability]);
  };

  const removeLiability = (id: string) => {
    setLiabilities(liabilities.filter(liability => liability.id !== id));
  };

  const updateLiability = (id: string, field: keyof LiabilityItem, value: any) => {
    setLiabilities(liabilities.map(liability => 
      liability.id === id ? { ...liability, [field]: value } : liability
    ));
  };

  const formatCurrency = (amount: number) => {
    const currencyMap: { [key: string]: { locale: string; currency: string } } = {
      USD: { locale: 'en-US', currency: 'USD' },
      EUR: { locale: 'de-DE', currency: 'EUR' },
      GBP: { locale: 'en-GB', currency: 'GBP' },
      CAD: { locale: 'en-CA', currency: 'CAD' },
      AUD: { locale: 'en-AU', currency: 'AUD' },
      JPY: { locale: 'ja-JP', currency: 'JPY' },
      KRW: { locale: 'ko-KR', currency: 'KRW' },
      INR: { locale: 'en-IN', currency: 'INR' },
      CNY: { locale: 'zh-CN', currency: 'CNY' },
      BRL: { locale: 'pt-BR', currency: 'BRL' },
      MXN: { locale: 'es-MX', currency: 'MXN' },
      SGD: { locale: 'en-SG', currency: 'SGD' },
      NZD: { locale: 'en-NZ', currency: 'NZD' }
    };

    const config = currencyMap[currency] || currencyMap.USD;
    
    return new Intl.NumberFormat(config.locale, {
      style: 'currency',
      currency: config.currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Helmet>
        <title>Net Worth Calculator - Calculate Your Financial Net Worth | DapsiWow</title>
        <meta name="description" content="Free net worth calculator to track your assets and liabilities. Calculate your total financial worth with worldwide currency support. Perfect for financial planning and wealth tracking." />
        <meta name="keywords" content="net worth calculator, personal finance calculator, asset calculator, liability calculator, wealth tracker, financial planning calculator, net worth tracker, personal net worth, financial health calculator" />
        <meta property="og:title" content="Net Worth Calculator - Calculate Your Financial Net Worth | DapsiWow" />
        <meta property="og:description" content="Free net worth calculator for tracking assets and liabilities. Calculate your financial position with support for multiple currencies worldwide." />
        <meta property="og:type" content="website" />
        <meta name="robots" content="index, follow" />
        <meta name="author" content="DapsiWow" />
        <link rel="canonical" href="https://dapsiwow.com/tools/net-worth-calculator" />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            "name": "Net Worth Calculator",
            "description": "Free online net worth calculator to track assets and liabilities, calculate total financial worth with worldwide currency support for comprehensive financial planning.",
            "url": "https://dapsiwow.com/tools/net-worth-calculator",
            "applicationCategory": "FinanceApplication",
            "operatingSystem": "Any",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "USD"
            },
            "featureList": [
              "Calculate total net worth",
              "Track multiple asset categories",
              "Monitor all liability types",
              "Support for 16+ currencies",
              "Detailed financial breakdown",
              "Asset and liability categorization"
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
                <span className="text-sm font-medium text-blue-700">Professional Net Worth Calculator</span>
              </div>
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-slate-900 leading-tight">
                Smart Net Worth
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                  Calculator
                </span>
              </h1>
              <p className="text-xl sm:text-2xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
                Calculate your total financial worth by tracking all assets and liabilities with comprehensive analysis
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
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">Net Worth Configuration</h2>
                    <p className="text-gray-600">Enter your assets and liabilities to calculate your financial net worth</p>
                  </div>
                  
                  {/* Currency Selection */}
                  <div className="space-y-3">
                    <Label htmlFor="currency" className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                      Currency & Country
                    </Label>
                    <Select value={country} onValueChange={handleCountryChange}>
                      <SelectTrigger className="h-14 border-2 border-gray-200 rounded-xl text-lg">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {countries.map((country) => (
                          <SelectItem key={country.code} value={country.code}>
                            {country.name} ({country.currency})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Assets and Liabilities Tabs */}
                  <Tabs defaultValue="assets" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 h-14 bg-gray-100 rounded-xl p-1">
                      <TabsTrigger value="assets" className="h-12 text-lg font-semibold rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
                        Assets
                      </TabsTrigger>
                      <TabsTrigger value="liabilities" className="h-12 text-lg font-semibold rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
                        Liabilities
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="assets" className="space-y-6 mt-8">
                      <div className="space-y-4">
                        <Label className="text-sm font-semibold text-gray-800 uppercase tracking-wide">Your Assets</Label>
                        <div className="space-y-4 max-h-80 overflow-y-auto">
                          {assets.map((asset) => (
                            <div key={asset.id} className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-xl border border-green-200">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                <Input
                                  placeholder="Asset name"
                                  value={asset.name}
                                  onChange={(e) => updateAsset(asset.id, 'name', e.target.value)}
                                  className="h-12 text-base bg-white border-2 border-gray-200 rounded-lg"
                                />
                                <Button
                                  onClick={() => removeAsset(asset.id)}
                                  variant="outline"
                                  className="h-12 border-2 border-red-200 text-red-600 bg-white hover:bg-red-50"
                                >
                                  Remove Asset
                                </Button>
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Select value={asset.category} onValueChange={(value) => updateAsset(asset.id, 'category', value)}>
                                  <SelectTrigger className="h-12 bg-white border-2 border-gray-200 rounded-lg">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {assetCategories.map(category => (
                                      <SelectItem key={category} value={category}>{category}</SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <div className="relative">
                                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-lg">$</span>
                                  <Input
                                    type="number"
                                    placeholder={`Value (${currency})`}
                                    value={asset.value}
                                    onChange={(e) => updateAsset(asset.id, 'value', parseFloat(e.target.value) || 0)}
                                    className="h-12 pl-8 text-base bg-white border-2 border-gray-200 rounded-lg"
                                  />
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                        <Button 
                          onClick={addAsset} 
                          variant="outline" 
                          className="w-full h-14 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 text-green-700 hover:bg-green-100 font-semibold text-lg rounded-xl"
                        >
                          Add New Asset
                        </Button>
                      </div>
                    </TabsContent>

                    <TabsContent value="liabilities" className="space-y-6 mt-8">
                      <div className="space-y-4">
                        <Label className="text-sm font-semibold text-gray-800 uppercase tracking-wide">Your Liabilities</Label>
                        <div className="space-y-4 max-h-80 overflow-y-auto">
                          {liabilities.map((liability) => (
                            <div key={liability.id} className="bg-gradient-to-r from-red-50 to-rose-50 p-6 rounded-xl border border-red-200">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                <Input
                                  placeholder="Liability name"
                                  value={liability.name}
                                  onChange={(e) => updateLiability(liability.id, 'name', e.target.value)}
                                  className="h-12 text-base bg-white border-2 border-gray-200 rounded-lg"
                                />
                                <Button
                                  onClick={() => removeLiability(liability.id)}
                                  variant="outline"
                                  className="h-12 border-2 border-red-200 text-red-600 bg-white hover:bg-red-50"
                                >
                                  Remove Liability
                                </Button>
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Select value={liability.category} onValueChange={(value) => updateLiability(liability.id, 'category', value)}>
                                  <SelectTrigger className="h-12 bg-white border-2 border-gray-200 rounded-lg">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {liabilityCategories.map(category => (
                                      <SelectItem key={category} value={category}>{category}</SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <div className="relative">
                                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-lg">$</span>
                                  <Input
                                    type="number"
                                    placeholder={`Value (${currency})`}
                                    value={liability.value}
                                    onChange={(e) => updateLiability(liability.id, 'value', parseFloat(e.target.value) || 0)}
                                    className="h-12 pl-8 text-base bg-white border-2 border-gray-200 rounded-lg"
                                  />
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                        <Button 
                          onClick={addLiability} 
                          variant="outline" 
                          className="w-full h-14 bg-gradient-to-r from-red-50 to-rose-50 border-2 border-red-200 text-red-700 hover:bg-red-100 font-semibold text-lg rounded-xl"
                        >
                          Add New Liability
                        </Button>
                      </div>
                    </TabsContent>
                  </Tabs>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-4 pt-6">
                    <Button
                      onClick={calculateNetWorth}
                      className="flex-1 h-14 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold text-lg rounded-xl shadow-lg transform transition-all duration-200 hover:scale-105"
                    >
                      Calculate Net Worth
                    </Button>
                    <Button
                      onClick={resetCalculator}
                      variant="outline"
                      className="h-14 px-8 border-2 border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold text-lg rounded-xl"
                    >
                      Reset
                    </Button>
                  </div>
                </div>

                {/* Results Section */}
                <div className="bg-gradient-to-br from-gray-50 to-blue-50 p-8 lg:p-12">
                  <h2 className="text-2xl font-bold text-gray-900 mb-8">Net Worth Summary</h2>
                  
                  {result ? (
                    <div className="space-y-6">
                      {/* Net Worth Highlight */}
                      <div className="bg-white rounded-2xl p-6 shadow-lg border border-blue-100">
                        <div className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-2">Your Net Worth</div>
                        <div className={`text-4xl font-bold ${result.netWorth >= 0 ? 'text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-600' : 'text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-rose-600'}`}>
                          {formatCurrency(result.netWorth)}
                        </div>
                      </div>

                      {/* Assets vs Liabilities */}
                      <div className="grid grid-cols-1 gap-4">
                        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
                          <div className="text-center space-y-2">
                            <div className="text-sm font-semibold text-green-700 uppercase tracking-wide">Total Assets</div>
                            <div className="text-3xl font-bold text-green-600">
                              {formatCurrency(result.totalAssets)}
                            </div>
                          </div>
                        </div>
                        <div className="bg-gradient-to-r from-red-50 to-rose-50 rounded-xl p-6 border border-red-200">
                          <div className="text-center space-y-2">
                            <div className="text-sm font-semibold text-red-700 uppercase tracking-wide">Total Liabilities</div>
                            <div className="text-3xl font-bold text-red-600">
                              {formatCurrency(result.totalLiabilities)}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Asset Breakdown */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-bold text-gray-900">Asset Categories</h3>
                        <div className="space-y-3">
                          {Object.entries(result.assetBreakdown).map(([category, value]) => (
                            <div key={category} className="flex justify-between items-center py-3 px-4 bg-white rounded-lg border border-gray-100">
                              <span className="font-medium text-gray-700">{category}</span>
                              <span className="font-bold text-green-600">{formatCurrency(value)}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Liability Breakdown */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-bold text-gray-900">Liability Categories</h3>
                        <div className="space-y-3">
                          {Object.entries(result.liabilityBreakdown).map(([category, value]) => (
                            <div key={category} className="flex justify-between items-center py-3 px-4 bg-white rounded-lg border border-gray-100">
                              <span className="font-medium text-gray-700">{category}</span>
                              <span className="font-bold text-red-600">{formatCurrency(value)}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Financial Health Summary */}
                      <div className="mt-8 bg-blue-50 rounded-xl p-6 border border-blue-200">
                        <h4 className="text-sm font-bold text-blue-900 uppercase tracking-wide mb-3">Financial Health Analysis</h4>
                        <p className="text-sm text-blue-800 leading-relaxed">
                          {result.netWorth >= 0 
                            ? `Excellent! You have a positive net worth of ${formatCurrency(result.netWorth)}. Your assets exceed your liabilities by this amount, indicating a strong financial position. Continue building wealth through strategic investments and debt reduction.`
                            : `Your net worth is ${formatCurrency(Math.abs(result.netWorth))} in the negative. Focus on reducing high-interest debt and increasing assets to improve your financial position. Consider creating a debt payoff plan and emergency fund.`
                          }
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-16">
                      <div className="w-20 h-20 bg-gray-200 rounded-full mx-auto mb-6 flex items-center justify-center">
                        <div className="text-3xl font-bold text-gray-400">$</div>
                      </div>
                      <p className="text-gray-500 text-lg">Enter your assets and liabilities to calculate your net worth</p>
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
                <h3 className="text-2xl font-bold text-gray-900 mb-6">What is Net Worth?</h3>
                <div className="space-y-4 text-gray-600">
                  <p>
                    Net worth is the total value of your assets minus your liabilities. It represents your overall 
                    financial position and is a key indicator of your financial health. A positive net worth means 
                    you own more than you owe, while a negative net worth indicates your debts exceed your assets.
                  </p>
                  <p>
                    Our net worth calculator helps you track all your assets including real estate, investments, 
                    savings, vehicles, and personal property, while accounting for debts like mortgages, loans, 
                    and credit cards. Regular calculation helps monitor financial progress and make informed decisions.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">How to Calculate Net Worth?</h3>
                <div className="space-y-4 text-gray-600">
                  <p>
                    The net worth formula is simple: Assets - Liabilities = Net Worth
                  </p>
                  <div className="bg-blue-50 rounded-lg p-4">
                    <p className="text-sm font-semibold text-blue-900 mb-2">Step-by-Step Process:</p>
                    <ul className="space-y-2 text-sm text-blue-800">
                      <li>• List all assets with current market values</li>
                      <li>• Add up total liabilities and debts</li>
                      <li>• Subtract liabilities from assets</li>
                      <li>• Review and update regularly</li>
                    </ul>
                  </div>
                  <p>
                    Our calculator automates this process and provides detailed category breakdowns for 
                    comprehensive financial analysis.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Types of Assets to Include</h3>
                <div className="space-y-3 text-gray-600">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Cash, savings, and checking accounts</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Investment portfolios and retirement accounts</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Real estate properties and home equity</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Vehicles, jewelry, and valuable collectibles</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Business ownership and intellectual property</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Common Liabilities to Track</h3>
                <div className="space-y-3 text-gray-600">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Mortgage balances and home equity loans</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Credit card balances and personal loans</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Student loans and education debt</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Auto loans and vehicle financing</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Business loans and tax obligations</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Additional SEO Content Sections */}
          <div className="mt-12 space-y-8">
            {/* Net Worth by Age Groups */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Average Net Worth by Age Group</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                    <h4 className="font-semibold text-blue-900 mb-2">20s-30s</h4>
                    <p className="text-blue-800 text-sm">
                      Focus on building emergency funds, paying off student loans, and starting retirement savings. 
                      Average net worth ranges from negative to $50,000.
                    </p>
                  </div>
                  <div className="bg-green-50 rounded-lg p-4 border border-green-100">
                    <h4 className="font-semibold text-green-900 mb-2">30s-40s</h4>
                    <p className="text-green-800 text-sm">
                      Prime earning years for building wealth through home ownership, investments, and career advancement. 
                      Target net worth of $100,000-$500,000.
                    </p>
                  </div>
                  <div className="bg-orange-50 rounded-lg p-4 border border-orange-100">
                    <h4 className="font-semibold text-orange-900 mb-2">40s-50s</h4>
                    <p className="text-orange-800 text-sm">
                      Peak wealth-building period with higher incomes and investment growth. 
                      Typical net worth ranges from $500,000-$1.5 million.
                    </p>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-4 border border-purple-100">
                    <h4 className="font-semibold text-purple-900 mb-2">50s+</h4>
                    <p className="text-purple-800 text-sm">
                      Retirement preparation phase focusing on preserving wealth and generating income. 
                      Net worth often exceeds $1 million.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Strategies to Improve Net Worth */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
                <CardContent className="p-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">Strategies to Increase Assets</h3>
                  <div className="space-y-4 text-gray-600">
                    <div className="border-l-4 border-green-500 pl-4">
                      <h4 className="font-semibold text-gray-800 mb-2">Investment Growth</h4>
                      <p className="text-sm">Diversify investments across stocks, bonds, real estate, and retirement accounts for long-term wealth building.</p>
                    </div>
                    <div className="border-l-4 border-blue-500 pl-4">
                      <h4 className="font-semibold text-gray-800 mb-2">Income Optimization</h4>
                      <p className="text-sm">Increase earning potential through skill development, career advancement, or additional income streams.</p>
                    </div>
                    <div className="border-l-4 border-purple-500 pl-4">
                      <h4 className="font-semibold text-gray-800 mb-2">Real Estate Investment</h4>
                      <p className="text-sm">Build equity through home ownership or rental properties for appreciation and passive income.</p>
                    </div>
                    <div className="border-l-4 border-orange-500 pl-4">
                      <h4 className="font-semibold text-gray-800 mb-2">Emergency Fund</h4>
                      <p className="text-sm">Maintain 6-12 months of expenses in high-yield savings accounts for financial security.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
                <CardContent className="p-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">Strategies to Reduce Liabilities</h3>
                  <div className="space-y-4 text-gray-600">
                    <div className="border-l-4 border-red-500 pl-4">
                      <h4 className="font-semibold text-gray-800 mb-2">Debt Consolidation</h4>
                      <p className="text-sm">Combine high-interest debts into lower-rate loans to reduce monthly payments and total interest.</p>
                    </div>
                    <div className="border-l-4 border-yellow-500 pl-4">
                      <h4 className="font-semibold text-gray-800 mb-2">Accelerated Payments</h4>
                      <p className="text-sm">Make extra principal payments on mortgages and loans to reduce balances faster and save interest.</p>
                    </div>
                    <div className="border-l-4 border-indigo-500 pl-4">
                      <h4 className="font-semibold text-gray-800 mb-2">Credit Card Management</h4>
                      <p className="text-sm">Pay off high-interest credit cards first and avoid carrying balances to minimize interest charges.</p>
                    </div>
                    <div className="border-l-4 border-teal-500 pl-4">
                      <h4 className="font-semibold text-gray-800 mb-2">Refinancing Options</h4>
                      <p className="text-sm">Refinance mortgages and loans when rates drop to reduce monthly payments and total interest costs.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Net Worth Tracking Tips */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-8">Best Practices for Net Worth Tracking</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div className="bg-blue-50 rounded-lg p-4">
                      <h4 className="font-semibold text-blue-800 mb-2">Regular Updates</h4>
                      <p className="text-blue-700 text-sm">Calculate net worth monthly or quarterly to track progress and identify trends in your financial health.</p>
                    </div>
                    <div className="bg-green-50 rounded-lg p-4">
                      <h4 className="font-semibold text-green-800 mb-2">Accurate Valuations</h4>
                      <p className="text-green-700 text-sm">Use current market values for assets and actual balances for liabilities to ensure precision.</p>
                    </div>
                    <div className="bg-purple-50 rounded-lg p-4">
                      <h4 className="font-semibold text-purple-800 mb-2">Document Everything</h4>
                      <p className="text-purple-700 text-sm">Keep detailed records of all assets and debts for accurate tracking and financial planning.</p>
                    </div>
                  </div>
                  <div className="space-y-6">
                    <div className="bg-orange-50 rounded-lg p-4">
                      <h4 className="font-semibold text-orange-800 mb-2">Set Goals</h4>
                      <p className="text-orange-700 text-sm">Establish specific net worth targets and timelines to maintain motivation and focus.</p>
                    </div>
                    <div className="bg-teal-50 rounded-lg p-4">
                      <h4 className="font-semibold text-teal-800 mb-2">Review Trends</h4>
                      <p className="text-teal-700 text-sm">Analyze net worth changes over time to understand what factors drive your financial growth.</p>
                    </div>
                    <div className="bg-rose-50 rounded-lg p-4">
                      <h4 className="font-semibold text-rose-800 mb-2">Professional Advice</h4>
                      <p className="text-rose-700 text-sm">Consult financial advisors for strategies to optimize your net worth and achieve financial goals.</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* FAQ Section */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-8">Frequently Asked Questions about Net Worth</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">What is considered a good net worth?</h4>
                      <p className="text-gray-600 text-sm">A good net worth varies by age, income, and location. Generally, positive net worth is good, with targets like 1x annual income by 30, 3x by 40, and 10x by retirement.</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">How often should I calculate my net worth?</h4>
                      <p className="text-gray-600 text-sm">Calculate net worth quarterly or semi-annually to track progress without obsessing over short-term market fluctuations that affect asset values.</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">Should I include my home in net worth calculations?</h4>
                      <p className="text-gray-600 text-sm">Yes, include your primary residence at current market value as an asset, and the remaining mortgage balance as a liability for accurate net worth calculation.</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">What if my net worth is negative?</h4>
                      <p className="text-gray-600 text-sm">Negative net worth is common among young adults with student loans. Focus on increasing income, reducing high-interest debt, and building emergency savings.</p>
                    </div>
                  </div>
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">Do I include retirement accounts in net worth?</h4>
                      <p className="text-gray-600 text-sm">Yes, include 401(k), IRA, and other retirement accounts at current value, but remember these funds may have withdrawal restrictions and tax implications.</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">How do I value illiquid assets?</h4>
                      <p className="text-gray-600 text-sm">Use conservative estimates for illiquid assets like collectibles, private business interests, or real estate based on recent appraisals or comparable sales.</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">Should I count personal belongings?</h4>
                      <p className="text-gray-600 text-sm">Include valuable personal property like jewelry, art, or vehicles, but exclude everyday items with minimal resale value for more accurate calculations.</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">How does net worth relate to financial health?</h4>
                      <p className="text-gray-600 text-sm">Net worth is one indicator of financial health, but also consider cash flow, emergency funds, debt-to-income ratios, and progress toward financial goals.</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Currency Support Information */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Worldwide Currency Support</h3>
                <p className="text-gray-600 mb-6">
                  Our net worth calculator supports major global currencies including USD, EUR, GBP, CAD, AUD, JPY, KRW, INR, CNY, BRL, MXN, SGD, and NZD. 
                  Whether you're tracking wealth in North America, managing assets in Europe, or building net worth in Asia-Pacific, our calculator provides 
                  accurate calculations with proper currency formatting for users worldwide.
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                  <div className="bg-blue-50 rounded-lg p-3">
                    <div className="font-semibold text-blue-900">USD</div>
                    <div className="text-blue-700 text-sm">US Dollar</div>
                  </div>
                  <div className="bg-green-50 rounded-lg p-3">
                    <div className="font-semibold text-green-900">EUR</div>
                    <div className="text-green-700 text-sm">Euro</div>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-3">
                    <div className="font-semibold text-purple-900">GBP</div>
                    <div className="text-purple-700 text-sm">British Pound</div>
                  </div>
                  <div className="bg-orange-50 rounded-lg p-3">
                    <div className="font-semibold text-orange-900">JPY</div>
                    <div className="text-orange-700 text-sm">Japanese Yen</div>
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
