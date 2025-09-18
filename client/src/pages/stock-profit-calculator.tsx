
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

interface StockResult {
  buyPrice: number;
  sellPrice: number;
  shares: number;
  totalCost: number;
  totalRevenue: number;
  grossProfit: number;
  brokerageFees: number;
  taxes: number;
  netProfit: number;
  profitPercentage: number;
  holdingPeriod: number;
  currency: string;
  calculationType: string;
  annualizedReturn?: number;
}

export default function StockProfitCalculator() {
  const [calculationType, setCalculationType] = useState('profit-loss');
  
  // Profit/Loss inputs
  const [buyPrice, setBuyPrice] = useState('100');
  const [sellPrice, setSellPrice] = useState('120');
  const [shares, setShares] = useState('100');
  const [brokerageFeePercent, setBrokerageFeePercent] = useState('0.1');
  const [taxRate, setTaxRate] = useState('15');
  const [holdingPeriod, setHoldingPeriod] = useState('365');
  
  // Target Price inputs
  const [targetBuyPrice, setTargetBuyPrice] = useState('50');
  const [targetShares, setTargetShares] = useState('200');
  const [targetProfit, setTargetProfit] = useState('2000');
  const [targetBrokerageFee, setTargetBrokerageFee] = useState('0.1');
  const [targetTaxRate, setTargetTaxRate] = useState('15');
  
  // Portfolio Value inputs
  const [portfolioBuyPrice, setPortfolioBuyPrice] = useState('25');
  const [portfolioCurrentPrice, setPortfolioCurrentPrice] = useState('35');
  const [portfolioShares, setPortfolioShares] = useState('500');
  const [portfolioDividends, setPortfolioDividends] = useState('150');
  const [portfolioHoldingPeriod, setPortfolioHoldingPeriod] = useState('730');
  
  const [currency, setCurrency] = useState('USD');
  const [country, setCountry] = useState('US');
  const [result, setResult] = useState<StockResult | null>(null);

  const countries = [
    { code: 'US', name: 'United States', currency: 'USD', capitalGainsTax: 15 },
    { code: 'CA', name: 'Canada', currency: 'CAD', capitalGainsTax: 25 },
    { code: 'UK', name: 'United Kingdom', currency: 'GBP', capitalGainsTax: 20 },
    { code: 'AU', name: 'Australia', currency: 'AUD', capitalGainsTax: 22.5 },
    { code: 'DE', name: 'Germany', currency: 'EUR', capitalGainsTax: 26.375 },
    { code: 'FR', name: 'France', currency: 'EUR', capitalGainsTax: 30 },
    { code: 'IT', name: 'Italy', currency: 'EUR', capitalGainsTax: 26 },
    { code: 'ES', name: 'Spain', currency: 'EUR', capitalGainsTax: 23 },
    { code: 'JP', name: 'Japan', currency: 'JPY', capitalGainsTax: 20.315 },
    { code: 'KR', name: 'South Korea', currency: 'KRW', capitalGainsTax: 22 },
    { code: 'IN', name: 'India', currency: 'INR', capitalGainsTax: 10 },
    { code: 'CN', name: 'China', currency: 'CNY', capitalGainsTax: 20 },
    { code: 'BR', name: 'Brazil', currency: 'BRL', capitalGainsTax: 15 },
    { code: 'MX', name: 'Mexico', currency: 'MXN', capitalGainsTax: 10 },
    { code: 'SG', name: 'Singapore', currency: 'SGD', capitalGainsTax: 0 },
    { code: 'NZ', name: 'New Zealand', currency: 'NZD', capitalGainsTax: 0 }
  ];

  const calculateStock = () => {
    if (calculationType === 'profit-loss') {
      calculateProfitLoss();
    } else if (calculationType === 'target-price') {
      calculateTargetPrice();
    } else {
      calculatePortfolioValue();
    }
  };

  const calculateProfitLoss = () => {
    const buy = parseFloat(buyPrice);
    const sell = parseFloat(sellPrice);
    const quantity = parseFloat(shares);
    const brokerageRate = parseFloat(brokerageFeePercent) / 100;
    const taxRatePercent = parseFloat(taxRate) / 100;
    const days = parseFloat(holdingPeriod);
    
    if (buy <= 0 || quantity <= 0) return;

    const totalCost = buy * quantity;
    const totalRevenue = sell * quantity;
    const grossProfit = totalRevenue - totalCost;
    
    // Calculate brokerage fees (both buy and sell)
    const brokerageFees = (totalCost + totalRevenue) * brokerageRate;
    
    // Calculate taxes (only on profit if positive)
    const taxableProfit = Math.max(0, grossProfit - brokerageFees);
    const taxes = taxableProfit * taxRatePercent;
    
    const netProfit = grossProfit - brokerageFees - taxes;
    const profitPercentage = (netProfit / totalCost) * 100;
    
    // Calculate annualized return
    const annualizedReturn = days > 0 ? ((netProfit / totalCost + 1) ** (365 / days) - 1) * 100 : 0;

    setResult({
      buyPrice: buy,
      sellPrice: sell,
      shares: quantity,
      totalCost,
      totalRevenue,
      grossProfit,
      brokerageFees,
      taxes,
      netProfit,
      profitPercentage,
      holdingPeriod: days,
      currency,
      calculationType: 'profit-loss',
      annualizedReturn
    });
  };

  const calculateTargetPrice = () => {
    const buy = parseFloat(targetBuyPrice);
    const quantity = parseFloat(targetShares);
    const desiredProfit = parseFloat(targetProfit);
    const brokerageRate = parseFloat(targetBrokerageFee) / 100;
    const taxRatePercent = parseFloat(targetTaxRate) / 100;
    
    if (buy <= 0 || quantity <= 0 || desiredProfit <= 0) return;

    const totalCost = buy * quantity;
    
    // Work backwards from desired net profit
    const sellPriceCalculation = (netProfit: number) => {
      let sellPrice = buy + 10;
      let iterations = 0;
      
      while (iterations < 100) {
        const totalRevenue = sellPrice * quantity;
        const grossProfit = totalRevenue - totalCost;
        const brokerageFees = (totalCost + totalRevenue) * brokerageRate;
        const taxableProfit = Math.max(0, grossProfit - brokerageFees);
        const taxes = taxableProfit * taxRatePercent;
        const calculatedNetProfit = grossProfit - brokerageFees - taxes;
        
        if (Math.abs(calculatedNetProfit - netProfit) < 0.01) {
          return sellPrice;
        }
        
        const difference = netProfit - calculatedNetProfit;
        sellPrice += difference / quantity * 1.1;
        iterations++;
      }
      
      return sellPrice;
    };

    const requiredSellPrice = sellPriceCalculation(desiredProfit);
    const totalRevenue = requiredSellPrice * quantity;
    const grossProfit = totalRevenue - totalCost;
    const brokerageFees = (totalCost + totalRevenue) * brokerageRate;
    const taxableProfit = Math.max(0, grossProfit - brokerageFees);
    const taxes = taxableProfit * taxRatePercent;
    const profitPercentage = (desiredProfit / totalCost) * 100;

    setResult({
      buyPrice: buy,
      sellPrice: requiredSellPrice,
      shares: quantity,
      totalCost,
      totalRevenue,
      grossProfit,
      brokerageFees,
      taxes,
      netProfit: desiredProfit,
      profitPercentage,
      holdingPeriod: 0,
      currency,
      calculationType: 'target-price'
    });
  };

  const calculatePortfolioValue = () => {
    const buy = parseFloat(portfolioBuyPrice);
    const current = parseFloat(portfolioCurrentPrice);
    const quantity = parseFloat(portfolioShares);
    const dividends = parseFloat(portfolioDividends) || 0;
    const days = parseFloat(portfolioHoldingPeriod);
    
    if (buy <= 0 || quantity <= 0 || current <= 0) return;

    const totalCost = buy * quantity;
    const currentValue = current * quantity;
    const capitalGain = currentValue - totalCost;
    const totalReturn = capitalGain + dividends;
    const returnPercentage = (totalReturn / totalCost) * 100;
    
    const annualizedReturn = days > 0 ? ((totalReturn / totalCost + 1) ** (365 / days) - 1) * 100 : 0;

    setResult({
      buyPrice: buy,
      sellPrice: current,
      shares: quantity,
      totalCost,
      totalRevenue: currentValue + dividends,
      grossProfit: totalReturn,
      brokerageFees: 0,
      taxes: 0,
      netProfit: totalReturn,
      profitPercentage: returnPercentage,
      holdingPeriod: days,
      currency,
      calculationType: 'portfolio-value',
      annualizedReturn
    });
  };

  const resetCalculator = () => {
    setBuyPrice('100');
    setSellPrice('120');
    setShares('100');
    setBrokerageFeePercent('0.1');
    setTaxRate('15');
    setHoldingPeriod('365');
    setTargetBuyPrice('50');
    setTargetShares('200');
    setTargetProfit('2000');
    setTargetBrokerageFee('0.1');
    setTargetTaxRate('15');
    setPortfolioBuyPrice('25');
    setPortfolioCurrentPrice('35');
    setPortfolioShares('500');
    setPortfolioDividends('150');
    setPortfolioHoldingPeriod('730');
    setCurrency('USD');
    setCountry('US');
    setResult(null);
  };

  const handleCountryChange = (newCountry: string) => {
    setCountry(newCountry);
    const countryData = countries.find(c => c.code === newCountry);
    if (countryData) {
      setCurrency(countryData.currency);
      setTaxRate(countryData.capitalGainsTax.toString());
      setTargetTaxRate(countryData.capitalGainsTax.toString());
    }
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
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  const currentCountryData = countries.find(c => c.code === country) || countries[0];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Helmet>
        <title>Stock Profit Calculator - Calculate Stock Investment Returns | DapsiWow</title>
        <meta name="description" content="Free stock profit calculator with tax optimization, fee analysis, and multi-currency support. Calculate investment returns, set target prices, and analyze portfolio performance for stocks worldwide." />
        <meta name="keywords" content="stock profit calculator, stock return calculator, investment profit calculator, capital gains calculator, stock trading calculator, portfolio calculator, dividend calculator, stock market calculator, investment returns, trading profit calculator" />
        <meta property="og:title" content="Stock Profit Calculator - Calculate Stock Investment Returns | DapsiWow" />
        <meta property="og:description" content="Free stock profit calculator for analyzing investment returns with tax optimization and fee calculations. Support for multiple currencies and calculation types." />
        <meta property="og:type" content="website" />
        <meta name="robots" content="index, follow" />
        <meta name="author" content="DapsiWow" />
        <link rel="canonical" href="https://dapsiwow.com/tools/stock-profit-calculator" />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            "name": "Stock Profit Calculator",
            "description": "Free online stock profit calculator to analyze investment returns, calculate target prices, and assess portfolio performance with tax and fee considerations.",
            "url": "https://dapsiwow.com/tools/stock-profit-calculator",
            "applicationCategory": "FinanceApplication",
            "operatingSystem": "Any",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "USD"
            },
            "featureList": [
              "Stock profit/loss calculations",
              "Target price determination",
              "Portfolio value assessment",
              "Tax and fee optimization",
              "Multi-currency support",
              "Annualized return analysis"
            ]
          })}
        </script>
      </Helmet>
      
      <Header />
      
      <main>
        {/* Hero Section */}
        <section className="relative py-12 sm:py-16 md:py-20 lg:py-24 xl:py-28 2xl:py-32 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-indigo-600/20"></div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="space-y-4 sm:space-y-6 md:space-y-7 lg:space-y-8">
              <div className="inline-flex items-center px-3 sm:px-4 py-1.5 sm:py-2 bg-white/80 backdrop-blur-sm rounded-full border border-blue-200">
                <span className="text-xs sm:text-sm font-medium text-blue-700">Professional Stock Calculator</span>
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl 2xl:text-8xl font-bold text-slate-900 leading-tight tracking-tight">
                <span className="block">Smart Stock</span>
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 mt-1 sm:mt-2">
                  Profit Calculator
                </span>
              </h1>
              <p className="text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl text-slate-600 max-w-sm sm:max-w-lg md:max-w-2xl lg:max-w-3xl xl:max-w-4xl mx-auto leading-relaxed px-2 sm:px-0">
                Calculate stock profits, losses, and returns with advanced tax optimization and fee analysis
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
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">Stock Investment Configuration</h2>
                    <p className="text-gray-600">Enter your stock details to get accurate profit calculations</p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Country Selection */}
                    <div className="space-y-3">
                      <Label htmlFor="country" className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                        Country (Tax Rates)
                      </Label>
                      <Select value={country} onValueChange={handleCountryChange}>
                        <SelectTrigger className="h-14 border-2 border-gray-200 rounded-xl text-lg">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {countries.map((country) => (
                            <SelectItem key={country.code} value={country.code}>
                              {country.name} ({country.capitalGainsTax}%)
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <div className="text-xs text-gray-500">
                        Capital gains tax: {currentCountryData.capitalGainsTax}%
                      </div>
                    </div>

                    {/* Currency Selection */}
                    <div className="space-y-3">
                      <Label htmlFor="currency" className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                        Currency
                      </Label>
                      <Select value={currency} onValueChange={setCurrency}>
                        <SelectTrigger className="h-14 border-2 border-gray-200 rounded-xl text-lg">
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
                  </div>

                  {/* Calculation Type Tabs */}
                  <Tabs value={calculationType} onValueChange={setCalculationType} className="w-full">
                    <TabsList className="grid w-full grid-cols-3 h-12">
                      <TabsTrigger value="profit-loss" className="text-sm">Profit/Loss</TabsTrigger>
                      <TabsTrigger value="target-price" className="text-sm">Target Price</TabsTrigger>
                      <TabsTrigger value="portfolio-value" className="text-sm">Portfolio Value</TabsTrigger>
                    </TabsList>

                    <TabsContent value="profit-loss" className="space-y-6 mt-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-3">
                          <Label htmlFor="buy-price" className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                            Buy Price
                          </Label>
                          <div className="relative">
                            <Input
                              id="buy-price"
                              type="number"
                              value={buyPrice}
                              onChange={(e) => setBuyPrice(e.target.value)}
                              className="h-14 text-lg border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-blue-500"
                              placeholder="100.00"
                              min="0"
                              step="0.01"
                            />
                          </div>
                        </div>
                        <div className="space-y-3">
                          <Label htmlFor="sell-price" className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                            Sell Price
                          </Label>
                          <div className="relative">
                            <Input
                              id="sell-price"
                              type="number"
                              value={sellPrice}
                              onChange={(e) => setSellPrice(e.target.value)}
                              className="h-14 text-lg border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-blue-500"
                              placeholder="120.00"
                              min="0"
                              step="0.01"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <Label htmlFor="shares" className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                          Number of Shares
                        </Label>
                        <Input
                          id="shares"
                          type="number"
                          value={shares}
                          onChange={(e) => setShares(e.target.value)}
                          className="h-14 text-lg border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-blue-500"
                          placeholder="100"
                          min="0"
                          step="1"
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-3">
                          <Label htmlFor="brokerage-fee" className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                            Brokerage Fee (%)
                          </Label>
                          <div className="relative">
                            <Input
                              id="brokerage-fee"
                              type="number"
                              value={brokerageFeePercent}
                              onChange={(e) => setBrokerageFeePercent(e.target.value)}
                              className="h-14 pr-8 text-lg border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-blue-500"
                              placeholder="0.1"
                              min="0"
                              max="10"
                              step="0.01"
                            />
                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 text-lg">%</span>
                          </div>
                        </div>
                        <div className="space-y-3">
                          <Label htmlFor="tax-rate" className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                            Tax Rate (%)
                          </Label>
                          <div className="relative">
                            <Input
                              id="tax-rate"
                              type="number"
                              value={taxRate}
                              onChange={(e) => setTaxRate(e.target.value)}
                              className="h-14 pr-8 text-lg border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-blue-500"
                              placeholder="15"
                              min="0"
                              max="50"
                              step="0.1"
                            />
                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 text-lg">%</span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <Label htmlFor="holding-period" className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                          Holding Period (Days)
                        </Label>
                        <Input
                          id="holding-period"
                          type="number"
                          value={holdingPeriod}
                          onChange={(e) => setHoldingPeriod(e.target.value)}
                          className="h-14 text-lg border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-blue-500"
                          placeholder="365"
                          min="1"
                          max="10000"
                        />
                      </div>
                    </TabsContent>

                    <TabsContent value="target-price" className="space-y-6 mt-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-3">
                          <Label htmlFor="target-buy-price" className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                            Buy Price
                          </Label>
                          <Input
                            id="target-buy-price"
                            type="number"
                            value={targetBuyPrice}
                            onChange={(e) => setTargetBuyPrice(e.target.value)}
                            className="h-14 text-lg border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-blue-500"
                            placeholder="50.00"
                            min="0"
                            step="0.01"
                          />
                        </div>
                        <div className="space-y-3">
                          <Label htmlFor="target-shares" className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                            Number of Shares
                          </Label>
                          <Input
                            id="target-shares"
                            type="number"
                            value={targetShares}
                            onChange={(e) => setTargetShares(e.target.value)}
                            className="h-14 text-lg border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-blue-500"
                            placeholder="200"
                            min="0"
                            step="1"
                          />
                        </div>
                      </div>

                      <div className="space-y-3">
                        <Label htmlFor="target-profit" className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                          Desired Profit
                        </Label>
                        <Input
                          id="target-profit"
                          type="number"
                          value={targetProfit}
                          onChange={(e) => setTargetProfit(e.target.value)}
                          className="h-14 text-lg border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-blue-500"
                          placeholder="2000.00"
                          min="0"
                          step="0.01"
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-3">
                          <Label htmlFor="target-brokerage" className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                            Brokerage Fee (%)
                          </Label>
                          <div className="relative">
                            <Input
                              id="target-brokerage"
                              type="number"
                              value={targetBrokerageFee}
                              onChange={(e) => setTargetBrokerageFee(e.target.value)}
                              className="h-14 pr-8 text-lg border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-blue-500"
                              placeholder="0.1"
                              min="0"
                              max="10"
                              step="0.01"
                            />
                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 text-lg">%</span>
                          </div>
                        </div>
                        <div className="space-y-3">
                          <Label htmlFor="target-tax" className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                            Tax Rate (%)
                          </Label>
                          <div className="relative">
                            <Input
                              id="target-tax"
                              type="number"
                              value={targetTaxRate}
                              onChange={(e) => setTargetTaxRate(e.target.value)}
                              className="h-14 pr-8 text-lg border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-blue-500"
                              placeholder="15"
                              min="0"
                              max="50"
                              step="0.1"
                            />
                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 text-lg">%</span>
                          </div>
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="portfolio-value" className="space-y-6 mt-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-3">
                          <Label htmlFor="portfolio-buy-price" className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                            Buy Price
                          </Label>
                          <Input
                            id="portfolio-buy-price"
                            type="number"
                            value={portfolioBuyPrice}
                            onChange={(e) => setPortfolioBuyPrice(e.target.value)}
                            className="h-14 text-lg border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-blue-500"
                            placeholder="25.00"
                            min="0"
                            step="0.01"
                          />
                        </div>
                        <div className="space-y-3">
                          <Label htmlFor="portfolio-current-price" className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                            Current Price
                          </Label>
                          <Input
                            id="portfolio-current-price"
                            type="number"
                            value={portfolioCurrentPrice}
                            onChange={(e) => setPortfolioCurrentPrice(e.target.value)}
                            className="h-14 text-lg border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-blue-500"
                            placeholder="35.00"
                            min="0"
                            step="0.01"
                          />
                        </div>
                      </div>

                      <div className="space-y-3">
                        <Label htmlFor="portfolio-shares" className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                          Number of Shares
                        </Label>
                        <Input
                          id="portfolio-shares"
                          type="number"
                          value={portfolioShares}
                          onChange={(e) => setPortfolioShares(e.target.value)}
                          className="h-14 text-lg border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-blue-500"
                          placeholder="500"
                          min="0"
                          step="1"
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-3">
                          <Label htmlFor="portfolio-dividends" className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                            Dividends Received
                          </Label>
                          <Input
                            id="portfolio-dividends"
                            type="number"
                            value={portfolioDividends}
                            onChange={(e) => setPortfolioDividends(e.target.value)}
                            className="h-14 text-lg border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-blue-500"
                            placeholder="150.00"
                            min="0"
                            step="0.01"
                          />
                        </div>
                        <div className="space-y-3">
                          <Label htmlFor="portfolio-holding-period" className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                            Holding Period (Days)
                          </Label>
                          <Input
                            id="portfolio-holding-period"
                            type="number"
                            value={portfolioHoldingPeriod}
                            onChange={(e) => setPortfolioHoldingPeriod(e.target.value)}
                            className="h-14 text-lg border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-blue-500"
                            placeholder="730"
                            min="1"
                            max="10000"
                          />
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-4 pt-6">
                    <Button
                      onClick={calculateStock}
                      className="flex-1 h-14 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold text-lg rounded-xl shadow-lg transform transition-all duration-200 hover:scale-105"
                    >
                      Calculate Stock Returns
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
                  <h2 className="text-2xl font-bold text-gray-900 mb-8">Investment Results</h2>
                  
                  {result ? (
                    <div className="space-y-6">
                      {/* Main Result Highlight */}
                      <div className="bg-white rounded-2xl p-6 shadow-lg border border-blue-100">
                        <div className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-2">
                          {result.calculationType === 'target-price' ? 'Required Sell Price' : 
                           result.calculationType === 'portfolio-value' ? 'Total Portfolio Value' : 'Net Profit/Loss'}
                        </div>
                        <div className={`text-4xl font-bold ${
                          result.calculationType === 'target-price' ? 'text-blue-600' :
                          result.calculationType === 'portfolio-value' ? 'text-purple-600' :
                          result.netProfit >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {result.calculationType === 'target-price' ? formatCurrency(result.sellPrice) :
                           result.calculationType === 'portfolio-value' ? formatCurrency(result.totalRevenue) :
                           formatCurrency(result.netProfit)}
                        </div>
                      </div>

                      {/* Return Percentage */}
                      <div className="bg-white rounded-xl p-4 shadow-sm">
                        <div className="flex justify-between items-center">
                          <span className="font-medium text-gray-700">Return Percentage</span>
                          <span className={`font-bold text-2xl ${result.profitPercentage >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {result.profitPercentage.toFixed(2)}%
                          </span>
                        </div>
                      </div>

                      {/* Detailed Breakdown */}
                      <div className="space-y-4">
                        <div className="bg-white rounded-xl p-4 shadow-sm">
                          <div className="flex justify-between items-center">
                            <span className="font-medium text-gray-700">Investment Amount</span>
                            <span className="font-bold text-gray-900">
                              {formatCurrency(result.totalCost)}
                            </span>
                          </div>
                        </div>
                        <div className="bg-white rounded-xl p-4 shadow-sm">
                          <div className="flex justify-between items-center">
                            <span className="font-medium text-gray-700">Number of Shares</span>
                            <span className="font-bold text-gray-900">
                              {result.shares.toLocaleString()}
                            </span>
                          </div>
                        </div>
                        {result.calculationType !== 'portfolio-value' && (
                          <>
                            <div className="bg-white rounded-xl p-4 shadow-sm">
                              <div className="flex justify-between items-center">
                                <span className="font-medium text-gray-700">Brokerage Fees</span>
                                <span className="font-bold text-orange-600">
                                  {formatCurrency(result.brokerageFees)}
                                </span>
                              </div>
                            </div>
                            <div className="bg-white rounded-xl p-4 shadow-sm">
                              <div className="flex justify-between items-center">
                                <span className="font-medium text-gray-700">Taxes</span>
                                <span className="font-bold text-red-600">
                                  {formatCurrency(result.taxes)}
                                </span>
                              </div>
                            </div>
                          </>
                        )}
                        {result.annualizedReturn !== undefined && result.holdingPeriod > 0 && (
                          <div className="bg-white rounded-xl p-4 shadow-sm">
                            <div className="flex justify-between items-center">
                              <span className="font-medium text-gray-700">Annualized Return</span>
                              <span className={`font-bold ${result.annualizedReturn >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {result.annualizedReturn.toFixed(2)}%
                              </span>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Summary Box */}
                      <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
                        <h4 className="text-sm font-semibold text-blue-900 mb-3">Investment Summary</h4>
                        <p className="text-sm text-blue-800">
                          {result.calculationType === 'target-price' 
                            ? `To achieve a profit of ${formatCurrency(result.netProfit)}, you need to sell at ${formatCurrency(result.sellPrice)} per share.`
                            : result.calculationType === 'portfolio-value'
                            ? `Your ${result.shares} shares have a current value of ${formatCurrency(result.totalRevenue)}, representing a ${result.profitPercentage >= 0 ? 'gain' : 'loss'} of ${Math.abs(result.profitPercentage).toFixed(2)}%.`
                            : `Your investment of ${formatCurrency(result.totalCost)} resulted in a ${result.netProfit >= 0 ? 'profit' : 'loss'} of ${formatCurrency(Math.abs(result.netProfit))} (${Math.abs(result.profitPercentage).toFixed(2)}%).`
                          }
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-16">
                      <div className="w-20 h-20 bg-gray-200 rounded-full mx-auto mb-6 flex items-center justify-center">
                        <div className="text-3xl font-bold text-gray-400">📈</div>
                      </div>
                      <p className="text-gray-500 text-lg">Enter stock details and calculate to see investment results</p>
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
                <h3 className="text-2xl font-bold text-gray-900 mb-6">What is a Stock Profit Calculator?</h3>
                <div className="space-y-4 text-gray-600">
                  <p>
                    A stock profit calculator is an essential financial tool that helps investors determine the potential 
                    profit or loss from buying and selling stocks. Our comprehensive calculator considers all critical 
                    factors including purchase price, selling price, quantity of shares, brokerage fees, taxes, and 
                    holding period to provide accurate investment return calculations.
                  </p>
                  <p>
                    Whether you're a beginner investor planning your first stock purchase or an experienced trader 
                    analyzing portfolio performance, our stock profit calculator provides three powerful calculation 
                    modes: profit/loss analysis, target price determination, and complete portfolio valuation with 
                    dividend tracking.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">How to Calculate Stock Profits</h3>
                <div className="space-y-4 text-gray-600">
                  <p>
                    Stock profit calculation involves several components: gross profit (sell price minus buy price 
                    multiplied by shares), brokerage fees (typically 0.1-2% of transaction value), taxes (capital gains 
                    tax based on your country), and holding period for annualized return calculations.
                  </p>
                  <div className="bg-blue-50 rounded-lg p-4">
                    <h4 className="font-semibold text-blue-900 mb-2">Basic Formula:</h4>
                    <p className="text-sm text-blue-800 font-mono">
                      Net Profit = (Sell Price - Buy Price) × Shares - Fees - Taxes
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Features of Our Stock Calculator</h3>
                <div className="space-y-3 text-gray-600">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Support for 16+ international currencies and tax systems</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Three calculation modes: profit/loss, target price, portfolio value</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Automatic tax calculation based on country selection</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Brokerage fee optimization and comparison</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Annualized return calculations for long-term investments</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Benefits for Investors</h3>
                <div className="space-y-3 text-gray-600">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Make informed buy/sell decisions with accurate profit projections</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Compare different investment scenarios and strategies</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Optimize tax efficiency with country-specific calculations</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Plan exit strategies and set realistic profit targets</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Track portfolio performance with dividend integration</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Additional SEO Content Sections */}
          <div className="mt-12 space-y-8">
            {/* Stock Investment Strategies Section */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Stock Investment Strategies & Profit Optimization</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-gray-800">Short-Term Trading</h4>
                    <p className="text-gray-600 text-sm">
                      Day trading and swing trading require precise profit calculations to manage risk and maximize returns. 
                      Use our calculator to determine optimal entry and exit points, factoring in transaction costs that 
                      can significantly impact short-term profits. Consider brokerage fees, which compound with frequent trading.
                    </p>
                  </div>
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-gray-800">Long-Term Investing</h4>
                    <p className="text-gray-600 text-sm">
                      Long-term stock investments benefit from compound growth and potentially lower tax rates. Our calculator 
                      helps you understand the power of holding quality stocks over extended periods, including dividend 
                      reinvestment and the impact of capital gains tax rates on different holding periods.
                    </p>
                  </div>
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-gray-800">Value Investing</h4>
                    <p className="text-gray-600 text-sm">
                      Value investors focus on undervalued stocks with strong fundamentals. Use our target price calculator 
                      to determine what price you need to achieve your desired return on investment. This helps in setting 
                      realistic expectations and patient capital allocation strategies.
                    </p>
                  </div>
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-gray-800">Growth Investing</h4>
                    <p className="text-gray-600 text-sm">
                      Growth stocks often trade at premium valuations but offer higher return potential. Calculate the 
                      annualized returns needed to justify current prices and set profit targets that account for the 
                      higher volatility and risk associated with growth investments.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tax Optimization Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
                <CardContent className="p-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">Tax-Efficient Stock Trading</h3>
                  <div className="space-y-4 text-gray-600">
                    <div className="border-l-4 border-blue-500 pl-4">
                      <h4 className="font-semibold text-gray-800 mb-2">Capital Gains Tax Planning</h4>
                      <p className="text-sm">Understand short-term vs. long-term capital gains rates in your country. Hold stocks for more than one year to qualify for lower long-term rates in many jurisdictions.</p>
                    </div>
                    <div className="border-l-4 border-green-500 pl-4">
                      <h4 className="font-semibold text-gray-800 mb-2">Tax-Loss Harvesting</h4>
                      <p className="text-sm">Offset capital gains with strategic losses. Our calculator helps you determine the tax impact of selling losing positions to reduce overall tax liability.</p>
                    </div>
                    <div className="border-l-4 border-orange-500 pl-4">
                      <h4 className="font-semibold text-gray-800 mb-2">Dividend Tax Considerations</h4>
                      <p className="text-sm">Factor in dividend taxes when calculating total returns. Some countries offer preferential tax treatment for qualified dividends from domestic companies.</p>
                    </div>
                    <div className="border-l-4 border-purple-500 pl-4">
                      <h4 className="font-semibold text-gray-800 mb-2">International Investing</h4>
                      <p className="text-sm">Cross-border investments may involve withholding taxes and currency conversion costs. Our multi-currency calculator helps you understand the true cost of international diversification.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
                <CardContent className="p-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">Risk Management & Portfolio Allocation</h3>
                  <div className="space-y-4 text-gray-600">
                    <div className="bg-blue-50 rounded-lg p-4">
                      <h4 className="font-semibold text-blue-800 mb-2">Position Sizing</h4>
                      <p className="text-sm text-blue-700">Never risk more than 1-2% of your portfolio on a single trade. Use our calculator to determine appropriate position sizes based on your risk tolerance and stop-loss levels.</p>
                    </div>
                    <div className="bg-green-50 rounded-lg p-4">
                      <h4 className="font-semibold text-green-800 mb-2">Diversification Benefits</h4>
                      <p className="text-sm text-green-700">Spread investments across different sectors, geographies, and market capitalizations. Calculate expected returns for each position to maintain balanced portfolio allocation.</p>
                    </div>
                    <div className="bg-orange-50 rounded-lg p-4">
                      <h4 className="font-semibold text-orange-800 mb-2">Stop-Loss Strategy</h4>
                      <p className="text-sm text-orange-700">Set stop-loss orders at levels that limit losses to acceptable amounts. Use our calculator to determine the impact of different stop-loss levels on overall returns.</p>
                    </div>
                    <div className="bg-purple-50 rounded-lg p-4">
                      <h4 className="font-semibold text-purple-800 mb-2">Rebalancing Schedule</h4>
                      <p className="text-sm text-purple-700">Regularly rebalance your portfolio to maintain target allocations. Calculate the tax implications and transaction costs of rebalancing activities.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Market Analysis Section */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-8">Market Analysis & Stock Profit Calculations</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <h4 className="text-xl font-semibold text-gray-800">Fundamental Analysis Integration</h4>
                    <div className="space-y-4 text-gray-600 text-sm">
                      <p>
                        Combine our profit calculator with fundamental analysis to make informed investment decisions. 
                        Calculate target prices based on price-to-earnings ratios, book value, and projected earnings growth. 
                        This helps in determining whether current market prices offer attractive risk-reward opportunities.
                      </p>
                      <div className="bg-blue-50 rounded-lg p-4">
                        <h5 className="font-semibold text-blue-800 mb-2">Key Metrics to Consider:</h5>
                        <ul className="text-blue-700 space-y-1">
                          <li>• Price-to-Earnings (P/E) ratio and industry comparisons</li>
                          <li>• Dividend yield and payout ratio sustainability</li>
                          <li>• Book value and price-to-book (P/B) ratios</li>
                          <li>• Revenue growth and profit margin trends</li>
                          <li>• Debt-to-equity ratios and financial stability</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-6">
                    <h4 className="text-xl font-semibold text-gray-800">Technical Analysis & Timing</h4>
                    <div className="space-y-4 text-gray-600 text-sm">
                      <p>
                        Technical analysis helps time your entry and exit points for maximum profit potential. Use our 
                        calculator to evaluate the profit impact of different entry prices based on technical support and 
                        resistance levels. This is especially important for short-term trading strategies.
                      </p>
                      <div className="bg-green-50 rounded-lg p-4">
                        <h5 className="font-semibold text-green-800 mb-2">Technical Indicators:</h5>
                        <ul className="text-green-700 space-y-1">
                          <li>• Moving averages for trend identification</li>
                          <li>• Support and resistance levels for entry/exit</li>
                          <li>• RSI and MACD for momentum analysis</li>
                          <li>• Volume analysis for conviction confirmation</li>
                          <li>• Chart patterns for price target estimation</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Calculator Use Cases Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
                <CardContent className="p-8">
                  <h3 className="text-xl font-bold text-gray-900 mb-6">Individual Investors</h3>
                  <div className="space-y-4 text-gray-600">
                    <p className="text-sm">
                      Perfect for retail investors managing personal portfolios. Calculate potential returns before making 
                      investment decisions, set realistic profit targets, and understand the true cost of trading.
                    </p>
                    <div className="space-y-2">
                      <h4 className="font-semibold text-gray-800 text-sm">Key Benefits:</h4>
                      <ul className="text-xs space-y-1 list-disc list-inside">
                        <li>Budget planning and investment allocation</li>
                        <li>Tax-efficient trading strategies</li>
                        <li>Portfolio performance tracking</li>
                        <li>Education and learning tool</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
                <CardContent className="p-8">
                  <h3 className="text-xl font-bold text-gray-900 mb-6">Financial Advisors</h3>
                  <div className="space-y-4 text-gray-600">
                    <p className="text-sm">
                      Professional tool for financial advisors to demonstrate investment scenarios to clients. Show the 
                      impact of fees, taxes, and holding periods on investment returns with precise calculations.
                    </p>
                    <div className="space-y-2">
                      <h4 className="font-semibold text-gray-800 text-sm">Professional Features:</h4>
                      <ul className="text-xs space-y-1 list-disc list-inside">
                        <li>Client education and presentations</li>
                        <li>Scenario planning and comparisons</li>
                        <li>Fee structure optimization</li>
                        <li>Multi-currency client support</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
                <CardContent className="p-8">
                  <h3 className="text-xl font-bold text-gray-900 mb-6">Active Traders</h3>
                  <div className="space-y-4 text-gray-600">
                    <p className="text-sm">
                      Essential tool for day traders and swing traders who need quick, accurate profit calculations. 
                      Optimize trading strategies by understanding the impact of fees and taxes on frequent transactions.
                    </p>
                    <div className="space-y-2">
                      <h4 className="font-semibold text-gray-800 text-sm">Trading Applications:</h4>
                      <ul className="text-xs space-y-1 list-disc list-inside">
                        <li>Quick profit/loss assessments</li>
                        <li>Risk-reward ratio calculations</li>
                        <li>Fee impact on trading frequency</li>
                        <li>Target price determination</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* FAQ Section */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-8">Frequently Asked Questions</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">How accurate are the profit calculations?</h4>
                      <p className="text-gray-600 text-sm">Our calculator uses precise mathematical formulas and up-to-date tax rates for accurate calculations. However, actual results may vary due to market conditions, brokerage fee structures, and individual tax circumstances.</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">Can I use this for options and derivatives?</h4>
                      <p className="text-gray-600 text-sm">This calculator is designed specifically for stock investments. Options and derivatives have different profit/loss structures and would require specialized calculators due to their complexity and time decay factors.</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">How are dividends factored into calculations?</h4>
                      <p className="text-gray-600 text-sm">In portfolio value mode, you can input total dividends received during the holding period. The calculator includes dividends in total return calculations and annualized return computations.</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">What about currency exchange rates?</h4>
                      <p className="text-gray-600 text-sm">The calculator supports multiple currencies but doesn't automatically convert between them. For international investments, convert all values to a single currency before calculation for accuracy.</p>
                    </div>
                  </div>
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">How do I optimize my tax efficiency?</h4>
                      <p className="text-gray-600 text-sm">Use the country selector to understand local tax rates. Consider holding periods (long-term vs. short-term), tax-advantaged accounts, and tax-loss harvesting strategies to minimize tax impact.</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">What brokerage fee should I input?</h4>
                      <p className="text-gray-600 text-sm">Input your broker's commission rate as a percentage of transaction value. This typically ranges from 0.1% to 2%. Some brokers charge flat fees, which you can convert to a percentage based on your typical trade size.</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">Can I save my calculations?</h4>
                      <p className="text-gray-600 text-sm">Currently, the calculator doesn't save data between sessions for privacy. We recommend taking screenshots or noting down important calculations for your records.</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">Is this suitable for retirement planning?</h4>
                      <p className="text-gray-600 text-sm">Yes, use the portfolio value mode with long holding periods to project retirement portfolio growth. Consider tax-advantaged retirement accounts which may have different tax implications.</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Related Tools Section */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Related Financial Calculators</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <a href="/tools/investment-return-calculator" className="group text-center p-4 bg-gray-50 rounded-lg hover:bg-blue-50 transition-colors border border-gray-200 hover:border-blue-300">
                    <div className="text-sm font-medium text-gray-900 group-hover:text-blue-800">Investment Return Calculator</div>
                    <div className="text-xs text-gray-500 mt-1">Portfolio returns</div>
                  </a>
                  <a href="/tools/compound-interest-calculator" className="group text-center p-4 bg-gray-50 rounded-lg hover:bg-blue-50 transition-colors border border-gray-200 hover:border-blue-300">
                    <div className="text-sm font-medium text-gray-900 group-hover:text-blue-800">Compound Interest Calculator</div>
                    <div className="text-xs text-gray-500 mt-1">Growth projections</div>
                  </a>
                  <a href="/tools/roi-calculator" className="group text-center p-4 bg-gray-50 rounded-lg hover:bg-blue-50 transition-colors border border-gray-200 hover:border-blue-300">
                    <div className="text-sm font-medium text-gray-900 group-hover:text-blue-800">ROI Calculator</div>
                    <div className="text-xs text-gray-500 mt-1">Return on investment</div>
                  </a>
                  <a href="/tools/retirement-calculator" className="group text-center p-4 bg-gray-50 rounded-lg hover:bg-blue-50 transition-colors border border-gray-200 hover:border-blue-300">
                    <div className="text-sm font-medium text-gray-900 group-hover:text-blue-800">Retirement Calculator</div>
                    <div className="text-xs text-gray-500 mt-1">Retirement planning</div>
                  </a>
                </div>
                <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <h4 className="font-semibold text-blue-900 mb-2">Complete Financial Planning</h4>
                  <p className="text-blue-800 text-sm">
                    Use our stock profit calculator alongside other financial tools for comprehensive investment planning. 
                    Combine with our compound interest calculator to project long-term growth, and use the retirement calculator 
                    to plan your investment strategy for financial independence.
                  </p>
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
