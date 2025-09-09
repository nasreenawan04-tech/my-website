
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
import { Scale, Plus, Minus } from 'lucide-react';

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
    <div className="min-h-screen bg-gray-50">
      <Helmet>
        <title>Net Worth Calculator - Calculate Your Total Net Worth | ToolsHub</title>
        <meta name="description" content="Calculate your net worth by tracking assets and liabilities. Free net worth calculator with worldwide currency support for financial planning." />
      </Helmet>
      
      <Header />
      
      <main>
        {/* Hero Section */}
        <section className="gradient-hero text-white py-16 pt-24">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="w-20 h-20 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Scale className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold mb-6">
              Net Worth Calculator
            </h1>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto">
              Calculate your total net worth by tracking all assets and liabilities with worldwide currency support
            </p>
          </div>
        </section>

        <div className="max-w-6xl mx-auto px-4 py-12">
          <Card className="bg-white shadow-sm border-0">
            <CardContent className="p-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                {/* Input Section */}
                <div className="space-y-6">
                  <h2 className="text-2xl font-semibold text-gray-900 mb-8">Net Worth Calculator</h2>
                  
                  {/* Country Selection */}
                  <div className="space-y-3">
                    <Label htmlFor="country" className="text-sm font-medium text-gray-700">
                      Country
                    </Label>
                    <Select value={country} onValueChange={handleCountryChange}>
                      <SelectTrigger className="h-12 border-gray-200 rounded-lg">
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
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="assets" className="flex items-center gap-2">
                        <Plus className="w-4 h-4" />
                        Assets
                      </TabsTrigger>
                      <TabsTrigger value="liabilities" className="flex items-center gap-2">
                        <Minus className="w-4 h-4" />
                        Liabilities
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="assets" className="space-y-6 mt-6">
                      <div className="space-y-3">
                        <Label className="text-sm font-medium text-gray-700">Your Assets</Label>
                        <div className="space-y-3 max-h-80 overflow-y-auto">
                          {assets.map((asset) => (
                            <div key={asset.id} className="bg-green-50 p-4 rounded-lg border border-green-100">
                              <div className="grid grid-cols-2 gap-3 mb-3">
                                <Input
                                  placeholder="Asset name"
                                  value={asset.name}
                                  onChange={(e) => updateAsset(asset.id, 'name', e.target.value)}
                                  className="text-sm bg-white"
                                />
                                <Button
                                  onClick={() => removeAsset(asset.id)}
                                  variant="outline"
                                  size="sm"
                                  className="text-red-600 bg-white"
                                >
                                  Remove
                                </Button>
                              </div>
                              <div className="grid grid-cols-2 gap-3">
                                <Select value={asset.category} onValueChange={(value) => updateAsset(asset.id, 'category', value)}>
                                  <SelectTrigger className="bg-white">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {assetCategories.map(category => (
                                      <SelectItem key={category} value={category}>{category}</SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <Input
                                  type="number"
                                  placeholder={`Value (${currency})`}
                                  value={asset.value}
                                  onChange={(e) => updateAsset(asset.id, 'value', parseFloat(e.target.value) || 0)}
                                  className="text-sm bg-white"
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                        <Button onClick={addAsset} variant="outline" className="w-full bg-green-50 border-green-200 text-green-700 hover:bg-green-100">
                          <Plus className="w-4 h-4 mr-2" />
                          Add Asset
                        </Button>
                      </div>
                    </TabsContent>

                    <TabsContent value="liabilities" className="space-y-6 mt-6">
                      <div className="space-y-3">
                        <Label className="text-sm font-medium text-gray-700">Your Liabilities</Label>
                        <div className="space-y-3 max-h-80 overflow-y-auto">
                          {liabilities.map((liability) => (
                            <div key={liability.id} className="bg-red-50 p-4 rounded-lg border border-red-100">
                              <div className="grid grid-cols-2 gap-3 mb-3">
                                <Input
                                  placeholder="Liability name"
                                  value={liability.name}
                                  onChange={(e) => updateLiability(liability.id, 'name', e.target.value)}
                                  className="text-sm bg-white"
                                />
                                <Button
                                  onClick={() => removeLiability(liability.id)}
                                  variant="outline"
                                  size="sm"
                                  className="text-red-600 bg-white"
                                >
                                  Remove
                                </Button>
                              </div>
                              <div className="grid grid-cols-2 gap-3">
                                <Select value={liability.category} onValueChange={(value) => updateLiability(liability.id, 'category', value)}>
                                  <SelectTrigger className="bg-white">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {liabilityCategories.map(category => (
                                      <SelectItem key={category} value={category}>{category}</SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <Input
                                  type="number"
                                  placeholder={`Value (${currency})`}
                                  value={liability.value}
                                  onChange={(e) => updateLiability(liability.id, 'value', parseFloat(e.target.value) || 0)}
                                  className="text-sm bg-white"
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                        <Button onClick={addLiability} variant="outline" className="w-full bg-red-50 border-red-200 text-red-700 hover:bg-red-100">
                          <Minus className="w-4 h-4 mr-2" />
                          Add Liability
                        </Button>
                      </div>
                    </TabsContent>
                  </Tabs>

                  {/* Action Buttons */}
                  <div className="flex gap-4 pt-6">
                    <Button
                      onClick={calculateNetWorth}
                      className="flex-1 h-12 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg"
                    >
                      <Scale className="w-4 h-4 mr-2" />
                      Calculate
                    </Button>
                    <Button
                      onClick={resetCalculator}
                      variant="outline"
                      className="h-12 px-8 border-gray-200 text-gray-600 hover:bg-gray-50 font-medium rounded-lg"
                    >
                      Reset
                    </Button>
                  </div>
                </div>

                {/* Results Section */}
                <div className="bg-gray-50 rounded-xl p-8">
                  <h2 className="text-2xl font-semibold text-gray-900 mb-8">Net Worth Summary</h2>
                  
                  {result ? (
                    <div className="space-y-6">
                      {/* Main Net Worth */}
                      <div className="bg-white rounded-lg p-6 border border-gray-100 text-center">
                        <div className="text-sm text-gray-600 mb-2">Your Net Worth</div>
                        <div className={`text-4xl font-bold ${result.netWorth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {formatCurrency(result.netWorth)}
                        </div>
                      </div>

                      {/* Assets vs Liabilities */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-green-50 rounded-lg p-4 border border-green-100">
                          <div className="text-center space-y-2">
                            <div className="text-sm text-green-700">Total Assets</div>
                            <div className="text-2xl font-bold text-green-600">
                              {formatCurrency(result.totalAssets)}
                            </div>
                          </div>
                        </div>
                        <div className="bg-red-50 rounded-lg p-4 border border-red-100">
                          <div className="text-center space-y-2">
                            <div className="text-sm text-red-700">Total Liabilities</div>
                            <div className="text-2xl font-bold text-red-600">
                              {formatCurrency(result.totalLiabilities)}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Asset Breakdown */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-900">Asset Breakdown</h3>
                        {Object.entries(result.assetBreakdown).map(([category, value]) => (
                          <div key={category} className="flex justify-between items-center py-2 border-b border-gray-200">
                            <span className="text-gray-600">{category}</span>
                            <span className="font-semibold text-green-600">{formatCurrency(value)}</span>
                          </div>
                        ))}
                      </div>

                      {/* Liability Breakdown */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-900">Liability Breakdown</h3>
                        {Object.entries(result.liabilityBreakdown).map(([category, value]) => (
                          <div key={category} className="flex justify-between items-center py-2 border-b border-gray-200">
                            <span className="text-gray-600">{category}</span>
                            <span className="font-semibold text-red-600">{formatCurrency(value)}</span>
                          </div>
                        ))}
                      </div>

                      {/* Summary */}
                      <div className="mt-8 bg-blue-50 rounded-lg p-4">
                        <h4 className="text-sm font-semibold text-blue-900 mb-2">Financial Health:</h4>
                        <p className="text-sm text-blue-800">
                          {result.netWorth >= 0 
                            ? `You have a positive net worth of ${formatCurrency(result.netWorth)}. Your assets exceed your liabilities, which is a good financial position.`
                            : `You have a negative net worth of ${formatCurrency(Math.abs(result.netWorth))}. Consider reducing liabilities or increasing assets to improve your financial position.`
                          }
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Scale className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500">Add your assets and liabilities to calculate your net worth</p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* What is a Net Worth Calculator */}
          <div className="mt-12 bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">What is a Net Worth Calculator?</h2>
            <div className="prose max-w-none">
              <p className="text-lg text-gray-700 mb-6">
                A <strong>net worth calculator</strong> is a comprehensive financial tool that helps individuals and families determine their total financial position by calculating the difference between their assets and liabilities. This essential personal finance calculator provides a clear snapshot of your overall financial health, enabling you to make informed decisions about wealth building, debt management, and long-term financial planning.
              </p>
              
              <p className="text-gray-700 mb-6">
                Our free online net worth calculator supports multiple currencies worldwide and allows you to track various asset categories including real estate, investments, retirement accounts, vehicles, and personal property, while also accounting for all types of debt such as mortgages, credit cards, student loans, and other liabilities. Whether you're building wealth, planning for retirement, or simply want to understand your financial standing, this calculator is an indispensable tool for personal financial management.
              </p>
            </div>
          </div>

          {/* How Net Worth Calculator Works */}
          <div className="mt-8 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">How Does the Net Worth Calculator Work?</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">📊 Calculation Method</h3>
                <div className="space-y-3 text-gray-700">
                  <div className="bg-white p-4 rounded-lg shadow-sm">
                    <div className="font-semibold text-blue-600 mb-2">Net Worth Formula:</div>
                    <div className="text-lg font-mono bg-gray-100 p-2 rounded">Assets - Liabilities = Net Worth</div>
                  </div>
                  <p>Our calculator automatically computes your net worth by subtracting your total liabilities from your total assets, providing both category breakdowns and an overall financial snapshot.</p>
                </div>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">🔍 Asset & Liability Tracking</h3>
                <div className="space-y-3 text-gray-700">
                  <p><strong>Assets Include:</strong> Cash, savings, investments, retirement accounts, real estate, vehicles, business assets, and personal property.</p>
                  <p><strong>Liabilities Include:</strong> Mortgages, credit card debt, student loans, auto loans, personal loans, and other debts.</p>
                  <p>The calculator categorizes each item for detailed financial analysis and provides percentage breakdowns of your wealth distribution.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Key Features and Benefits */}
          <div className="mt-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
              Net Worth Calculator Features & Benefits
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Card className="bg-white border-0 shadow-sm">
                <CardContent className="p-8">
                  <h3 className="text-xl font-semibold text-gray-900 mb-6">🌟 Key Features</h3>
                  <div className="space-y-4">
                    <div className="space-y-2 text-gray-600">
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                        Multi-currency support for worldwide users (USD, EUR, GBP, CAD, AUD, JPY, and more)
                      </div>
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                        Comprehensive asset categorization (Real Estate, Investments, Retirement, Vehicles, etc.)
                      </div>
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                        Detailed liability tracking (Mortgages, Credit Cards, Student Loans, Personal Debt)
                      </div>
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                        Real-time calculations with instant financial health assessment
                      </div>
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                        Category breakdown analysis for wealth distribution insights
                      </div>
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                        Mobile-responsive design for on-the-go financial tracking
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white border-0 shadow-sm">
                <CardContent className="p-8">
                  <h3 className="text-xl font-semibold text-gray-900 mb-6">💡 Benefits & Use Cases</h3>
                  <div className="space-y-4">
                    <div className="space-y-2 text-gray-600">
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                        Track financial progress and wealth building over time
                      </div>
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                        Make informed decisions about debt payoff strategies
                      </div>
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                        Plan for major financial goals like retirement or home buying
                      </div>
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                        Evaluate loan applications and creditworthiness
                      </div>
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                        Assess insurance coverage needs based on total assets
                      </div>
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                        Create comprehensive financial statements for business or personal use
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Educational Content */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="bg-white border-0 shadow-sm">
              <CardContent className="p-8">
                <h3 className="text-xl font-semibold text-gray-900 mb-6">Understanding Net Worth Components</h3>
                <div className="space-y-4">
                  <div className="space-y-3 text-gray-600">
                    <div className="bg-green-50 p-3 rounded-lg">
                      <div className="font-semibold text-green-800 mb-1">Assets (What You Own):</div>
                      <div className="text-sm">Cash, savings accounts, investment portfolios, retirement funds (401k, IRA), real estate properties, vehicles, business equity, valuable personal items, and collectibles.</div>
                    </div>
                    <div className="bg-red-50 p-3 rounded-lg">
                      <div className="font-semibold text-red-800 mb-1">Liabilities (What You Owe):</div>
                      <div className="text-sm">Mortgage balances, credit card debt, student loans, auto loans, personal loans, business debt, and other outstanding obligations.</div>
                    </div>
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <div className="font-semibold text-blue-800 mb-1">Net Worth Result:</div>
                      <div className="text-sm">Positive net worth indicates financial stability, while negative net worth suggests need for debt reduction and asset building.</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border-0 shadow-sm">
              <CardContent className="p-8">
                <h3 className="text-xl font-semibold text-gray-900 mb-6">Strategies to Improve Net Worth</h3>
                <div className="space-y-4">
                  <div className="space-y-2 text-gray-600">
                    <div className="flex items-start">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-3 mt-2"></div>
                      <div>
                        <div className="font-semibold">Increase Assets:</div>
                        <div className="text-sm">Build emergency funds, invest in diversified portfolios, contribute to retirement accounts, and acquire appreciating assets</div>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-3 mt-2"></div>
                      <div>
                        <div className="font-semibold">Reduce Liabilities:</div>
                        <div className="text-sm">Pay off high-interest debt first, avoid unnecessary borrowing, and consider debt consolidation strategies</div>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-3 mt-2"></div>
                      <div>
                        <div className="font-semibold">Optimize Cash Flow:</div>
                        <div className="text-sm">Increase income through career advancement, reduce expenses, and automate savings to build wealth consistently</div>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-3 mt-2"></div>
                      <div>
                        <div className="font-semibold">Monitor Regularly:</div>
                        <div className="text-sm">Track net worth monthly or quarterly to measure progress and adjust financial strategies accordingly</div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Common Use Cases */}
          <div className="mt-8 bg-gray-50 rounded-2xl p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">When to Use a Net Worth Calculator</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">📈 Wealth Building</h3>
                <p className="text-gray-600 text-sm">Track your financial progress toward long-term goals like retirement, financial independence, or major purchases. Monitor asset growth and debt reduction over time.</p>
              </div>
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">🏠 Major Purchases</h3>
                <p className="text-gray-600 text-sm">Assess your financial readiness for significant investments like buying a home, starting a business, or making large purchases that require financing.</p>
              </div>
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">💼 Financial Planning</h3>
                <p className="text-gray-600 text-sm">Create comprehensive financial statements for loan applications, insurance coverage decisions, estate planning, or investment portfolio allocation strategies.</p>
              </div>
            </div>
          </div>

          {/* Currency Information */}
          <div className="mt-8 bg-blue-50 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              <i className="fas fa-globe mr-2"></i>
              Worldwide Net Worth Calculator
            </h3>
            <p className="text-gray-600">
              This net worth calculator supports major global currencies including USD, EUR, GBP, CAD, AUD, JPY, KRW, INR, CNY, BRL, MXN, SGD, and NZD. 
              Whether you're tracking wealth in the United States, managing assets in Europe, or building net worth in Asia-Pacific, 
              our calculator provides accurate calculations with proper currency formatting for worldwide users.
            </p>
          </div>

          {/* Net Worth Calculator for Different Audiences */}
          <div className="mt-12 bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Net Worth Calculator for Every Stage of Life</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-0">
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold text-blue-900 mb-4">👩‍🎓 Students & Young Adults</h3>
                  <div className="space-y-3 text-blue-800">
                    <p className="font-medium">Starting Your Financial Journey</p>
                    <ul className="text-sm space-y-2">
                      <li>• Track student loan debt and educational expenses</li>
                      <li>• Monitor savings account growth and emergency funds</li>
                      <li>• Calculate the impact of part-time income on wealth</li>
                      <li>• Plan for post-graduation financial goals</li>
                      <li>• Understand the relationship between assets and liabilities</li>
                    </ul>
                    <div className="mt-4 p-3 bg-white rounded-lg">
                      <p className="text-xs text-blue-700">
                        <strong>Pro Tip:</strong> Even a small positive net worth in your 20s can compound significantly over time. 
                        Use our <a href="/compound-interest-calculator" className="text-blue-600 hover:text-blue-800 underline">Compound Interest Calculator</a> to see your wealth potential.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-green-50 to-green-100 border-0">
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold text-green-900 mb-4">💼 Working Professionals</h3>
                  <div className="space-y-3 text-green-800">
                    <p className="font-medium">Building Wealth & Career Growth</p>
                    <ul className="text-sm space-y-2">
                      <li>• Calculate mortgage equity and home appreciation</li>
                      <li>• Track 401(k), IRA, and investment portfolio growth</li>
                      <li>• Monitor credit card debt and loan payoff progress</li>
                      <li>• Assess readiness for major purchases or investments</li>
                      <li>• Plan for career transitions and salary negotiations</li>
                    </ul>
                    <div className="mt-4 p-3 bg-white rounded-lg">
                      <p className="text-xs text-green-700">
                        <strong>Career Insight:</strong> Track how salary increases affect your net worth with our 
                        <a href="/salary-to-hourly-calculator" className="text-green-600 hover:text-green-800 underline"> Salary Calculator</a> and 
                        <a href="/retirement-calculator" className="text-green-600 hover:text-green-800 underline"> Retirement Planning Tool</a>.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-0">
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold text-purple-900 mb-4">🏢 Business Owners</h3>
                  <div className="space-y-3 text-purple-800">
                    <p className="font-medium">Entrepreneurial Wealth Management</p>
                    <ul className="text-sm space-y-2">
                      <li>• Value business equity and intellectual property</li>
                      <li>• Separate personal and business assets effectively</li>
                      <li>• Track multiple income streams and investments</li>
                      <li>• Plan for business expansion or exit strategies</li>
                      <li>• Assess personal guarantees on business loans</li>
                    </ul>
                    <div className="mt-4 p-3 bg-white rounded-lg">
                      <p className="text-xs text-purple-700">
                        <strong>Business Tip:</strong> Use our <a href="/business-loan-calculator" className="text-purple-600 hover:text-purple-800 underline">Business Loan Calculator</a> and 
                        <a href="/roi-calculator" className="text-purple-600 hover:text-purple-800 underline"> ROI Calculator</a> to evaluate business investments.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Advanced Net Worth Strategies */}
          <div className="mt-12 bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Advanced Net Worth Optimization Strategies</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-6">
                <Card className="bg-white border-0 shadow-sm">
                  <CardContent className="p-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">📈 Asset Optimization Techniques</h3>
                    <div className="space-y-3 text-gray-700">
                      <div className="bg-green-50 p-3 rounded-lg">
                        <h4 className="font-semibold text-green-800 mb-2">Diversification Strategy</h4>
                        <p className="text-sm">Spread assets across multiple categories: real estate (25-30%), stocks/bonds (40-50%), cash reserves (10-15%), and alternative investments (5-10%).</p>
                      </div>
                      <div className="bg-blue-50 p-3 rounded-lg">
                        <h4 className="font-semibold text-blue-800 mb-2">Tax-Advantaged Accounts</h4>
                        <p className="text-sm">Maximize contributions to 401(k), IRA, HSA, and 529 plans to reduce taxable income while building wealth.</p>
                      </div>
                      <div className="bg-purple-50 p-3 rounded-lg">
                        <h4 className="font-semibold text-purple-800 mb-2">Real Estate Investment</h4>
                        <p className="text-sm">Consider primary residence, rental properties, and REITs for inflation protection and passive income generation.</p>
                      </div>
                    </div>
                    <div className="mt-4 text-center">
                      <p className="text-sm text-gray-600">
                        Calculate potential returns with our <a href="/investment-return-calculator" className="text-blue-600 hover:text-blue-800 underline">Investment Return Calculator</a>
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white border-0 shadow-sm">
                  <CardContent className="p-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">📊 Net Worth Tracking Best Practices</h3>
                    <div className="space-y-3 text-gray-700">
                      <div className="flex items-start space-x-3">
                        <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">1</div>
                        <div>
                          <p className="font-medium">Monthly Reviews</p>
                          <p className="text-sm text-gray-600">Track net worth monthly to identify trends and make timely adjustments to your financial strategy.</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3">
                        <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">2</div>
                        <div>
                          <p className="font-medium">Accurate Valuations</p>
                          <p className="text-sm text-gray-600">Use recent market values for real estate and investments, not purchase prices or outdated appraisals.</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3">
                        <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">3</div>
                        <div>
                          <p className="font-medium">Include All Assets</p>
                          <p className="text-sm text-gray-600">Don't forget smaller assets like household items, jewelry, collectibles, and business interests.</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-6">
                <Card className="bg-white border-0 shadow-sm">
                  <CardContent className="p-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">💳 Strategic Debt Management</h3>
                    <div className="space-y-3 text-gray-700">
                      <div className="bg-red-50 p-3 rounded-lg">
                        <h4 className="font-semibold text-red-800 mb-2">High-Interest Debt Priority</h4>
                        <p className="text-sm">Target credit cards (15-25% APR) and personal loans before low-interest mortgages (3-6% APR) for maximum net worth impact.</p>
                      </div>
                      <div className="bg-orange-50 p-3 rounded-lg">
                        <h4 className="font-semibold text-orange-800 mb-2">Debt Consolidation Benefits</h4>
                        <p className="text-sm">Consider consolidating multiple high-interest debts into a single lower-rate loan to reduce total interest payments.</p>
                      </div>
                      <div className="bg-yellow-50 p-3 rounded-lg">
                        <h4 className="font-semibold text-yellow-800 mb-2">Good Debt vs Bad Debt</h4>
                        <p className="text-sm">Mortgages and business loans can build wealth, while credit card debt erodes net worth through high interest rates.</p>
                      </div>
                    </div>
                    <div className="mt-4 text-center">
                      <p className="text-sm text-gray-600">
                        Plan your debt payoff with our <a href="/debt-payoff-calculator" className="text-blue-600 hover:text-blue-800 underline">Debt Payoff Calculator</a>
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white border-0 shadow-sm">
                  <CardContent className="p-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">🎯 Net Worth Milestones by Age</h3>
                    <div className="space-y-3 text-gray-700">
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div className="bg-blue-50 p-2 rounded text-center">
                          <div className="font-semibold text-blue-800">Age 30</div>
                          <div className="text-blue-700">1x Annual Salary</div>
                        </div>
                        <div className="bg-green-50 p-2 rounded text-center">
                          <div className="font-semibold text-green-800">Age 40</div>
                          <div className="text-green-700">3x Annual Salary</div>
                        </div>
                        <div className="bg-purple-50 p-2 rounded text-center">
                          <div className="font-semibold text-purple-800">Age 50</div>
                          <div className="text-purple-700">6x Annual Salary</div>
                        </div>
                        <div className="bg-orange-50 p-2 rounded text-center">
                          <div className="font-semibold text-orange-800">Age 60</div>
                          <div className="text-orange-700">10x Annual Salary</div>
                        </div>
                      </div>
                      <p className="text-xs text-gray-600 mt-3">
                        These are general guidelines. Your target may vary based on lifestyle, goals, and retirement plans.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>

          {/* Related Financial Tools */}
          <div className="mt-12 bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Complete Your Financial Picture</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="bg-gray-50 border-0 hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    💰 <a href="/debt-payoff-calculator" className="text-blue-600 hover:text-blue-800">Debt Payoff Calculator</a>
                  </h3>
                  <p className="text-sm text-gray-600 mb-3">
                    Create a strategic debt elimination plan to improve your net worth faster. Compare snowball vs avalanche methods.
                  </p>
                  <div className="text-xs text-blue-600">
                    Optimize debt reduction → Increase net worth
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-50 border-0 hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    🏠 <a href="/mortgage-calculator" className="text-blue-600 hover:text-blue-800">Mortgage Calculator</a>
                  </h3>
                  <p className="text-sm text-gray-600 mb-3">
                    Calculate monthly payments and total interest for home loans. Understand how homeownership affects your assets.
                  </p>
                  <div className="text-xs text-blue-600">
                    Home equity = Major asset growth
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-50 border-0 hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    📈 <a href="/investment-return-calculator" className="text-blue-600 hover:text-blue-800">Investment Return Calculator</a>
                  </h3>
                  <p className="text-sm text-gray-600 mb-3">
                    Project investment growth over time with compound interest. Plan asset allocation for optimal returns.
                  </p>
                  <div className="text-xs text-blue-600">
                    Smart investing = Wealth multiplication
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-50 border-0 hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    🎯 <a href="/retirement-calculator" className="text-blue-600 hover:text-blue-800">Retirement Calculator</a>
                  </h3>
                  <p className="text-sm text-gray-600 mb-3">
                    Determine if your net worth will support your retirement lifestyle. Plan for financial independence.
                  </p>
                  <div className="text-xs text-blue-600">
                    Retirement readiness assessment
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-50 border-0 hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    💵 <a href="/compound-interest-calculator" className="text-blue-600 hover:text-blue-800">Compound Interest Calculator</a>
                  </h3>
                  <p className="text-sm text-gray-600 mb-3">
                    See how your assets can grow exponentially over time. Understand the power of compound returns.
                  </p>
                  <div className="text-xs text-blue-600">
                    Time + Compounding = Wealth
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-50 border-0 hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    🎖️ <a href="/savings-goal-calculator" className="text-blue-600 hover:text-blue-800">Savings Goal Calculator</a>
                  </h3>
                  <p className="text-sm text-gray-600 mb-3">
                    Plan systematic savings to reach net worth targets. Set and achieve specific financial milestones.
                  </p>
                  <div className="text-xs text-blue-600">
                    Goal-based wealth building
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* FAQ Section */}
          <div className="mt-12 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Frequently Asked Questions</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="bg-white rounded-lg p-6 shadow-sm">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">What is considered a good net worth?</h3>
                  <p className="text-gray-700 text-sm">
                    A good net worth varies by age and income. Generally, aim for 1x your annual salary by age 30, 3x by 40, 6x by 50, and 10x by 60. 
                    The median net worth in the US is around $121,000, but focus on your personal financial goals rather than comparisons.
                  </p>
                </div>
                
                <div className="bg-white rounded-lg p-6 shadow-sm">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">How often should I calculate my net worth?</h3>
                  <p className="text-gray-700 text-sm">
                    Calculate your net worth monthly or quarterly to track progress effectively. Monthly tracking helps identify trends quickly, 
                    while quarterly reviews provide a broader perspective on your financial trajectory without daily market fluctuations.
                  </p>
                </div>

                <div className="bg-white rounded-lg p-6 shadow-sm">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Should I include my primary residence?</h3>
                  <p className="text-gray-700 text-sm">
                    Yes, include your primary residence at current market value as an asset, and the remaining mortgage balance as a liability. 
                    Your home equity (market value minus mortgage debt) contributes significantly to most people's net worth.
                  </p>
                </div>
              </div>

              <div className="space-y-6">
                <div className="bg-white rounded-lg p-6 shadow-sm">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">What if my net worth is negative?</h3>
                  <p className="text-gray-700 text-sm">
                    Negative net worth is common for young adults and students due to education loans. Focus on paying off high-interest debt first, 
                    building emergency savings, and investing in appreciating assets. Many people start with negative net worth and build wealth over time.
                  </p>
                </div>

                <div className="bg-white rounded-lg p-6 shadow-sm">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">How do I value non-liquid assets?</h3>
                  <p className="text-gray-700 text-sm">
                    Use current market values for real estate (recent comparable sales), vehicles (KBB or Edmunds), and investments (current market price). 
                    For collectibles and personal property, use conservative estimates of what you could realistically sell them for today.
                  </p>
                </div>

                <div className="bg-white rounded-lg p-6 shadow-sm">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Does net worth include retirement accounts?</h3>
                  <p className="text-gray-700 text-sm">
                    Yes, include 401(k), IRA, and other retirement accounts at their current balance. While these funds have withdrawal restrictions, 
                    they represent real wealth that contributes to your financial security and should be counted in your total net worth calculation.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Call to Action */}
          <div className="mt-12 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 text-center text-white">
            <h2 className="text-3xl font-bold mb-4">Start Building Wealth Today</h2>
            <p className="text-xl text-blue-100 mb-6 max-w-2xl mx-auto">
              Knowledge is power, but action builds wealth. Use our free net worth calculator to establish your baseline, 
              then explore our comprehensive financial tools to create your personalized wealth-building strategy.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="bg-white text-blue-600 hover:bg-blue-50 font-semibold px-8 py-3 rounded-lg"
              >
                Calculate Your Net Worth Now
              </Button>
              <Button 
                onClick={() => window.location.href = '/finance-tools'}
                variant="outline"
                className="border-white text-white hover:bg-white hover:text-blue-600 font-semibold px-8 py-3 rounded-lg"
              >
                Explore All Financial Tools
              </Button>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
