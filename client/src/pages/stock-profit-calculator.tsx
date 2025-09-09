
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
import { TrendingUp } from 'lucide-react';

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
    // netProfit = grossProfit - brokerageFees - taxes
    // taxes = (grossProfit - brokerageFees) * taxRate
    // brokerageFees = (totalCost + totalRevenue) * brokerageRate
    // grossProfit = totalRevenue - totalCost
    
    // Solving for sell price
    const sellPriceCalculation = (netProfit: number) => {
      // This is an iterative approach to solve for sell price
      let sellPrice = buy + 10; // Start with a reasonable guess
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
        
        // Adjust sell price based on difference
        const difference = netProfit - calculatedNetProfit;
        sellPrice += difference / quantity * 1.1; // 1.1 factor for faster convergence
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
    
    // Calculate annualized return including dividends
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
    <div className="min-h-screen bg-gray-50">
      <Helmet>
        <title>Stock Profit Calculator - Calculate Stock Investment Returns | ToolsHub</title>
        <meta name="description" content="Free stock profit calculator with tax optimization, fee analysis, and multi-currency support. Calculate investment returns, set target prices, and analyze portfolio performance for stocks worldwide." />
      </Helmet>
      
      <Header />
      
      <main>
        {/* Hero Section */}
        <section className="gradient-hero text-white py-16 pt-24">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="w-20 h-20 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <TrendingUp className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold mb-6">
              Stock Profit Calculator
            </h1>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto">
              Calculate stock profits, losses, and returns with taxes and fees included for worldwide markets
            </p>
          </div>
        </section>

        <div className="max-w-6xl mx-auto px-4 py-12">
          <Card className="bg-white shadow-sm border-0">
            <CardContent className="p-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                {/* Input Section */}
                <div className="space-y-6">
                  <h2 className="text-2xl font-semibold text-gray-900 mb-8">Stock Investment Calculator</h2>
                  
                  {/* Country Selection */}
                  <div className="space-y-3">
                    <Label htmlFor="country" className="text-sm font-medium text-gray-700">
                      Country (Sets typical capital gains tax rates)
                    </Label>
                    <Select value={country} onValueChange={handleCountryChange}>
                      <SelectTrigger className="h-12 border-gray-200 rounded-lg">
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
                      Capital gains tax rate: {currentCountryData.capitalGainsTax}%
                    </div>
                  </div>

                  {/* Calculation Type Tabs */}
                  <Tabs value={calculationType} onValueChange={setCalculationType} className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="profit-loss">Profit/Loss</TabsTrigger>
                      <TabsTrigger value="target-price">Target Price</TabsTrigger>
                      <TabsTrigger value="portfolio-value">Portfolio Value</TabsTrigger>
                    </TabsList>

                    <TabsContent value="profit-loss" className="space-y-6 mt-6">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-3">
                          <Label htmlFor="buy-price" className="text-sm font-medium text-gray-700">
                            Buy Price ({currency})
                          </Label>
                          <Input
                            id="buy-price"
                            type="number"
                            value={buyPrice}
                            onChange={(e) => setBuyPrice(e.target.value)}
                            className="h-12 text-base border-gray-200 rounded-lg"
                            placeholder="100"
                            min="0"
                            step="0.01"
                          />
                        </div>
                        <div className="space-y-3">
                          <Label htmlFor="sell-price" className="text-sm font-medium text-gray-700">
                            Sell Price ({currency})
                          </Label>
                          <Input
                            id="sell-price"
                            type="number"
                            value={sellPrice}
                            onChange={(e) => setSellPrice(e.target.value)}
                            className="h-12 text-base border-gray-200 rounded-lg"
                            placeholder="120"
                            min="0"
                            step="0.01"
                          />
                        </div>
                      </div>

                      <div className="space-y-3">
                        <Label htmlFor="shares" className="text-sm font-medium text-gray-700">
                          Number of Shares
                        </Label>
                        <Input
                          id="shares"
                          type="number"
                          value={shares}
                          onChange={(e) => setShares(e.target.value)}
                          className="h-12 text-base border-gray-200 rounded-lg"
                          placeholder="100"
                          min="0"
                          step="1"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-3">
                          <Label htmlFor="brokerage-fee" className="text-sm font-medium text-gray-700">
                            Brokerage Fee (%)
                          </Label>
                          <Input
                            id="brokerage-fee"
                            type="number"
                            value={brokerageFeePercent}
                            onChange={(e) => setBrokerageFeePercent(e.target.value)}
                            className="h-12 text-base border-gray-200 rounded-lg"
                            placeholder="0.1"
                            min="0"
                            max="10"
                            step="0.01"
                          />
                        </div>
                        <div className="space-y-3">
                          <Label htmlFor="tax-rate" className="text-sm font-medium text-gray-700">
                            Tax Rate (%)
                          </Label>
                          <Input
                            id="tax-rate"
                            type="number"
                            value={taxRate}
                            onChange={(e) => setTaxRate(e.target.value)}
                            className="h-12 text-base border-gray-200 rounded-lg"
                            placeholder="15"
                            min="0"
                            max="50"
                            step="0.1"
                          />
                        </div>
                      </div>

                      <div className="space-y-3">
                        <Label htmlFor="holding-period" className="text-sm font-medium text-gray-700">
                          Holding Period (Days)
                        </Label>
                        <Input
                          id="holding-period"
                          type="number"
                          value={holdingPeriod}
                          onChange={(e) => setHoldingPeriod(e.target.value)}
                          className="h-12 text-base border-gray-200 rounded-lg"
                          placeholder="365"
                          min="1"
                          max="10000"
                        />
                      </div>
                    </TabsContent>

                    <TabsContent value="target-price" className="space-y-6 mt-6">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-3">
                          <Label htmlFor="target-buy-price" className="text-sm font-medium text-gray-700">
                            Buy Price ({currency})
                          </Label>
                          <Input
                            id="target-buy-price"
                            type="number"
                            value={targetBuyPrice}
                            onChange={(e) => setTargetBuyPrice(e.target.value)}
                            className="h-12 text-base border-gray-200 rounded-lg"
                            placeholder="50"
                            min="0"
                            step="0.01"
                          />
                        </div>
                        <div className="space-y-3">
                          <Label htmlFor="target-shares" className="text-sm font-medium text-gray-700">
                            Number of Shares
                          </Label>
                          <Input
                            id="target-shares"
                            type="number"
                            value={targetShares}
                            onChange={(e) => setTargetShares(e.target.value)}
                            className="h-12 text-base border-gray-200 rounded-lg"
                            placeholder="200"
                            min="0"
                            step="1"
                          />
                        </div>
                      </div>

                      <div className="space-y-3">
                        <Label htmlFor="target-profit" className="text-sm font-medium text-gray-700">
                          Desired Profit ({currency})
                        </Label>
                        <Input
                          id="target-profit"
                          type="number"
                          value={targetProfit}
                          onChange={(e) => setTargetProfit(e.target.value)}
                          className="h-12 text-base border-gray-200 rounded-lg"
                          placeholder="2000"
                          min="0"
                          step="0.01"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-3">
                          <Label htmlFor="target-brokerage" className="text-sm font-medium text-gray-700">
                            Brokerage Fee (%)
                          </Label>
                          <Input
                            id="target-brokerage"
                            type="number"
                            value={targetBrokerageFee}
                            onChange={(e) => setTargetBrokerageFee(e.target.value)}
                            className="h-12 text-base border-gray-200 rounded-lg"
                            placeholder="0.1"
                            min="0"
                            max="10"
                            step="0.01"
                          />
                        </div>
                        <div className="space-y-3">
                          <Label htmlFor="target-tax" className="text-sm font-medium text-gray-700">
                            Tax Rate (%)
                          </Label>
                          <Input
                            id="target-tax"
                            type="number"
                            value={targetTaxRate}
                            onChange={(e) => setTargetTaxRate(e.target.value)}
                            className="h-12 text-base border-gray-200 rounded-lg"
                            placeholder="15"
                            min="0"
                            max="50"
                            step="0.1"
                          />
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="portfolio-value" className="space-y-6 mt-6">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-3">
                          <Label htmlFor="portfolio-buy-price" className="text-sm font-medium text-gray-700">
                            Buy Price ({currency})
                          </Label>
                          <Input
                            id="portfolio-buy-price"
                            type="number"
                            value={portfolioBuyPrice}
                            onChange={(e) => setPortfolioBuyPrice(e.target.value)}
                            className="h-12 text-base border-gray-200 rounded-lg"
                            placeholder="25"
                            min="0"
                            step="0.01"
                          />
                        </div>
                        <div className="space-y-3">
                          <Label htmlFor="portfolio-current-price" className="text-sm font-medium text-gray-700">
                            Current Price ({currency})
                          </Label>
                          <Input
                            id="portfolio-current-price"
                            type="number"
                            value={portfolioCurrentPrice}
                            onChange={(e) => setPortfolioCurrentPrice(e.target.value)}
                            className="h-12 text-base border-gray-200 rounded-lg"
                            placeholder="35"
                            min="0"
                            step="0.01"
                          />
                        </div>
                      </div>

                      <div className="space-y-3">
                        <Label htmlFor="portfolio-shares" className="text-sm font-medium text-gray-700">
                          Number of Shares
                        </Label>
                        <Input
                          id="portfolio-shares"
                          type="number"
                          value={portfolioShares}
                          onChange={(e) => setPortfolioShares(e.target.value)}
                          className="h-12 text-base border-gray-200 rounded-lg"
                          placeholder="500"
                          min="0"
                          step="1"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-3">
                          <Label htmlFor="portfolio-dividends" className="text-sm font-medium text-gray-700">
                            Dividends Received ({currency})
                          </Label>
                          <Input
                            id="portfolio-dividends"
                            type="number"
                            value={portfolioDividends}
                            onChange={(e) => setPortfolioDividends(e.target.value)}
                            className="h-12 text-base border-gray-200 rounded-lg"
                            placeholder="150"
                            min="0"
                            step="0.01"
                          />
                        </div>
                        <div className="space-y-3">
                          <Label htmlFor="portfolio-holding-period" className="text-sm font-medium text-gray-700">
                            Holding Period (Days)
                          </Label>
                          <Input
                            id="portfolio-holding-period"
                            type="number"
                            value={portfolioHoldingPeriod}
                            onChange={(e) => setPortfolioHoldingPeriod(e.target.value)}
                            className="h-12 text-base border-gray-200 rounded-lg"
                            placeholder="730"
                            min="1"
                            max="10000"
                          />
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>

                  {/* Action Buttons */}
                  <div className="flex gap-4 pt-6">
                    <Button
                      onClick={calculateStock}
                      className="flex-1 h-12 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg"
                    >
                      <TrendingUp className="w-4 h-4 mr-2" />
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
                  <h2 className="text-2xl font-semibold text-gray-900 mb-8">Investment Results</h2>
                  
                  {result ? (
                    <div className="space-y-6">
                      {/* Main Results */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white rounded-lg p-4 border border-gray-100">
                          <div className="text-center space-y-2">
                            <div className="text-sm text-gray-600">
                              {result.calculationType === 'target-price' ? 'Required Sell Price' : 
                               result.calculationType === 'portfolio-value' ? 'Current Value' : 'Net Profit'}
                            </div>
                            <div className={`text-2xl font-bold ${
                              result.calculationType === 'target-price' ? 'text-blue-600' :
                              result.calculationType === 'portfolio-value' ? 'text-purple-600' :
                              result.netProfit >= 0 ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {result.calculationType === 'target-price' ? formatCurrency(result.sellPrice) :
                               result.calculationType === 'portfolio-value' ? formatCurrency(result.totalRevenue) :
                               formatCurrency(result.netProfit)}
                            </div>
                          </div>
                        </div>
                        <div className="bg-white rounded-lg p-4 border border-gray-100">
                          <div className="text-center space-y-2">
                            <div className="text-sm text-gray-600">Return Percentage</div>
                            <div className={`text-2xl font-bold ${result.profitPercentage >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {result.profitPercentage.toFixed(2)}%
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Detailed Breakdown */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-900">Investment Breakdown</h3>
                        
                        <div className="flex justify-between items-center py-3 border-b border-gray-200">
                          <span className="text-gray-600">
                            {result.calculationType === 'portfolio-value' ? 'Average Buy Price' : 'Buy Price'}
                          </span>
                          <span className="font-semibold text-gray-900">
                            {formatCurrency(result.buyPrice)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center py-3 border-b border-gray-200">
                          <span className="text-gray-600">
                            {result.calculationType === 'target-price' ? 'Required Sell Price' :
                             result.calculationType === 'portfolio-value' ? 'Current Price' : 'Sell Price'}
                          </span>
                          <span className="font-semibold text-blue-600">
                            {formatCurrency(result.sellPrice)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center py-3 border-b border-gray-200">
                          <span className="text-gray-600">Number of Shares</span>
                          <span className="font-semibold text-gray-900">
                            {result.shares.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between items-center py-3 border-b border-gray-200">
                          <span className="text-gray-600">Total Investment</span>
                          <span className="font-semibold text-orange-600">
                            {formatCurrency(result.totalCost)}
                          </span>
                        </div>
                        
                        {result.calculationType !== 'portfolio-value' && (
                          <>
                            <div className="flex justify-between items-center py-3 border-b border-gray-200">
                              <span className="text-gray-600">Gross Profit</span>
                              <span className={`font-semibold ${result.grossProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {formatCurrency(result.grossProfit)}
                              </span>
                            </div>
                            <div className="flex justify-between items-center py-3 border-b border-gray-200">
                              <span className="text-gray-600">Brokerage Fees</span>
                              <span className="font-semibold text-red-600">
                                {formatCurrency(result.brokerageFees)}
                              </span>
                            </div>
                            <div className="flex justify-between items-center py-3 border-b border-gray-200">
                              <span className="text-gray-600">Taxes</span>
                              <span className="font-semibold text-red-600">
                                {formatCurrency(result.taxes)}
                              </span>
                            </div>
                          </>
                        )}
                        
                        <div className="flex justify-between items-center py-3">
                          <span className="text-gray-600">
                            {result.calculationType === 'portfolio-value' ? 'Total Return' : 'Net Profit'}
                          </span>
                          <span className={`font-semibold ${result.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {formatCurrency(result.netProfit)}
                          </span>
                        </div>

                        {result.annualizedReturn !== undefined && result.holdingPeriod > 0 && (
                          <div className="flex justify-between items-center py-3 border-t border-gray-200">
                            <span className="text-gray-600">Annualized Return</span>
                            <span className={`font-semibold ${result.annualizedReturn >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {result.annualizedReturn.toFixed(2)}%
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Summary */}
                      <div className="mt-8 bg-blue-50 rounded-lg p-4">
                        <h4 className="text-sm font-semibold text-blue-900 mb-2">Summary:</h4>
                        <p className="text-sm text-blue-800">
                          {result.calculationType === 'target-price' 
                            ? `To achieve a profit of ${formatCurrency(result.netProfit)}, you need to sell at ${formatCurrency(result.sellPrice)} per share.`
                            : result.calculationType === 'portfolio-value'
                            ? `Your ${result.shares} shares have a current value of ${formatCurrency(result.totalRevenue)}, giving you a ${result.profitPercentage >= 0 ? 'gain' : 'loss'} of ${Math.abs(result.profitPercentage).toFixed(2)}%.`
                            : `Your investment of ${formatCurrency(result.totalCost)} resulted in a ${result.netProfit >= 0 ? 'profit' : 'loss'} of ${formatCurrency(Math.abs(result.netProfit))} (${Math.abs(result.profitPercentage).toFixed(2)}%).`
                          }
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <TrendingUp className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500">Enter your stock details to calculate profit and returns</p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Comprehensive Educational Content */}
          <div className="mt-12 space-y-12">
            {/* What is Stock Profit Calculator */}
            <section className="bg-white rounded-2xl shadow-lg p-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">What is a Stock Profit Calculator?</h2>
              <div className="prose max-w-none text-gray-600">
                <p className="text-lg mb-4">
                  A <strong>stock profit calculator</strong> is an essential financial tool that helps investors determine the potential profit or loss from buying and selling stocks. Our comprehensive calculator considers all critical factors including purchase price, selling price, quantity of shares, brokerage fees, taxes, and holding period to provide accurate investment return calculations.
                </p>
                <p className="mb-4">
                  Whether you're a beginner investor planning your first stock purchase or an experienced trader analyzing portfolio performance, our stock profit calculator provides three powerful calculation modes: profit/loss analysis, target price determination, and complete portfolio valuation with dividend tracking.
                </p>
                <p className="mb-4">
                  This advanced stock calculator integrates seamlessly with other financial planning tools. Use it alongside our <a href="/tools/investment-return-calculator" className="text-blue-600 hover:text-blue-700 underline">Investment Return Calculator</a> to analyze different investment scenarios, or combine it with our <a href="/tools/roi-calculator" className="text-blue-600 hover:text-blue-700 underline">ROI Calculator</a> to evaluate overall portfolio performance and make informed investment decisions.
                </p>
              </div>
            </section>

            {/* How to Use */}
            <section className="bg-gray-50 rounded-2xl p-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-8">How to Use the Stock Profit Calculator</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-white font-bold text-xl">1</span>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">Choose Calculation Type</h3>
                  <p className="text-gray-600">Select from Profit/Loss analysis, Target Price calculation, or Portfolio Value assessment based on your needs.</p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-white font-bold text-xl">2</span>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">Enter Stock Details</h3>
                  <p className="text-gray-600">Input buy/sell prices, number of shares, fees, taxes, and holding period for accurate calculations.</p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-white font-bold text-xl">3</span>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">Analyze Results</h3>
                  <p className="text-gray-600">View detailed profit calculations, tax implications, and annualized returns to make informed investment decisions.</p>
                </div>
              </div>
            </section>

            {/* Key Features */}
            <section className="bg-white rounded-2xl shadow-lg p-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-8">Stock Calculator Features & Benefits</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-6">🌟 Advanced Features</h3>
                  <div className="space-y-4">
                    <div className="flex items-start">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mr-3 mt-2"></div>
                      <div>
                        <h4 className="font-semibold text-gray-900">Multi-Currency Support</h4>
                        <p className="text-gray-600">Calculate stock profits in 16+ major currencies including USD, EUR, GBP, JPY, and more</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mr-3 mt-2"></div>
                      <div>
                        <h4 className="font-semibold text-gray-900">Comprehensive Tax Calculations</h4>
                        <p className="text-gray-600">Pre-configured capital gains tax rates for 16 countries with customizable tax settings</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mr-3 mt-2"></div>
                      <div>
                        <h4 className="font-semibold text-gray-900">Brokerage Fee Integration</h4>
                        <p className="text-gray-600">Account for buying and selling commissions to get true net profit calculations</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mr-3 mt-2"></div>
                      <div>
                        <h4 className="font-semibold text-gray-900">Annualized Return Analysis</h4>
                        <p className="text-gray-600">Calculate time-adjusted returns to compare investments across different holding periods</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-6">💰 Investment Benefits</h3>
                  <div className="space-y-4">
                    <div className="flex items-start">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-3 mt-2"></div>
                      <div>
                        <h4 className="font-semibold text-gray-900">Informed Decision Making</h4>
                        <p className="text-gray-600">Make data-driven investment decisions with accurate profit projections</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-3 mt-2"></div>
                      <div>
                        <h4 className="font-semibold text-gray-900">Portfolio Optimization</h4>
                        <p className="text-gray-600">Analyze performance across multiple investments to optimize your portfolio</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-3 mt-2"></div>
                      <div>
                        <h4 className="font-semibold text-gray-900">Risk Assessment</h4>
                        <p className="text-gray-600">Understand potential losses and set appropriate stop-loss levels</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-3 mt-2"></div>
                      <div>
                        <h4 className="font-semibold text-gray-900">Tax Planning</h4>
                        <p className="text-gray-600">Plan investment timing to optimize tax efficiency and maximize after-tax returns</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Benefits for Different Audiences */}
            <section className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-8">Who Benefits from Our Stock Profit Calculator?</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <div className="bg-white rounded-lg p-6 shadow-sm">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                    <span className="text-2xl">🎓</span>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">Students & New Investors</h3>
                  <p className="text-gray-600 mb-4">Perfect for learning investment fundamentals and understanding how fees, taxes, and holding periods affect returns.</p>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Learn investment basics with real calculations</li>
                    <li>• Understand the impact of fees and taxes</li>
                    <li>• Practice with different scenarios risk-free</li>
                    <li>• Build confidence before real trading</li>
                  </ul>
                </div>
                
                <div className="bg-white rounded-lg p-6 shadow-sm">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                    <span className="text-2xl">💼</span>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">Working Professionals</h3>
                  <p className="text-gray-600 mb-4">Optimize your investment strategy while managing busy schedules and maximizing after-tax returns.</p>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Quick profit/loss analysis for busy schedules</li>
                    <li>• Tax optimization for higher income brackets</li>
                    <li>• Portfolio performance tracking</li>
                    <li>• Long-term wealth building strategies</li>
                  </ul>
                </div>
                
                <div className="bg-white rounded-lg p-6 shadow-sm">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                    <span className="text-2xl">🏢</span>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">Business Owners & Entrepreneurs</h3>
                  <p className="text-gray-600 mb-4">Manage business investments and personal portfolios with comprehensive financial analysis tools.</p>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Corporate investment analysis</li>
                    <li>• Business cash flow optimization</li>
                    <li>• Tax-efficient investment strategies</li>
                    <li>• Multi-currency investment tracking</li>
                  </ul>
                </div>
                
                <div className="bg-white rounded-lg p-6 shadow-sm">
                  <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mb-4">
                    <span className="text-2xl">🏖️</span>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">Retirement Planners</h3>
                  <p className="text-gray-600 mb-4">Plan for retirement by analyzing long-term investment returns and dividend income strategies.</p>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Long-term investment projections</li>
                    <li>• Dividend income analysis</li>
                    <li>• Retirement portfolio optimization</li>
                    <li>• Social Security planning integration</li>
                  </ul>
                  <p className="text-sm text-blue-600 mt-3">
                    <a href="/tools/retirement-calculator" className="hover:text-blue-700 underline">Use our Retirement Calculator →</a>
                  </p>
                </div>
                
                <div className="bg-white rounded-lg p-6 shadow-sm">
                  <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                    <span className="text-2xl">📊</span>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">Day Traders & Active Investors</h3>
                  <p className="text-gray-600 mb-4">Analyze short-term trading opportunities and manage multiple positions with precise calculations.</p>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Real-time profit/loss calculations</li>
                    <li>• Commission and fee optimization</li>
                    <li>• Risk-reward ratio analysis</li>
                    <li>• Multiple position tracking</li>
                  </ul>
                </div>
                
                <div className="bg-white rounded-lg p-6 shadow-sm">
                  <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                    <span className="text-2xl">💰</span>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">Financial Advisors</h3>
                  <p className="text-gray-600 mb-4">Provide clients with detailed investment analysis and demonstrate the impact of different strategies.</p>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Client education and demonstrations</li>
                    <li>• Scenario planning and analysis</li>
                    <li>• Fee structure comparisons</li>
                    <li>• Professional presentation tools</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Use Cases */}
            <section className="bg-gray-50 rounded-2xl p-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-8">Stock Profit Calculator Use Cases</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card className="bg-white border border-gray-200 hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                      <span className="text-2xl">📈</span>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">Investment Planning</h3>
                    <p className="text-gray-600">Plan your stock investments by calculating expected returns and setting realistic profit targets before making trades.</p>
                  </CardContent>
                </Card>
                <Card className="bg-white border border-gray-200 hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                      <span className="text-2xl">🎯</span>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">Target Price Setting</h3>
                    <p className="text-gray-600">Determine the optimal selling price needed to achieve your desired profit margin after accounting for all fees and taxes.</p>
                  </CardContent>
                </Card>
                <Card className="bg-white border border-gray-200 hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                      <span className="text-2xl">📊</span>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">Portfolio Analysis</h3>
                    <p className="text-gray-600">Evaluate your current stock holdings including dividend income to assess overall portfolio performance and returns.</p>
                  </CardContent>
                </Card>
                <Card className="bg-white border border-gray-200 hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mb-4">
                      <span className="text-2xl">🧮</span>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">Tax Optimization</h3>
                    <p className="text-gray-600">Calculate the tax impact of stock trades and plan your selling strategy to minimize capital gains taxes.</p>
                  </CardContent>
                </Card>
                <Card className="bg-white border border-gray-200 hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                      <span className="text-2xl">⚖️</span>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">Risk Management</h3>
                    <p className="text-gray-600">Assess potential losses and set stop-loss orders based on calculated risk-reward ratios for your investments.</p>
                  </CardContent>
                </Card>
                <Card className="bg-white border border-gray-200 hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                      <span className="text-2xl">📚</span>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">Educational Learning</h3>
                    <p className="text-gray-600">Learn about stock market mechanics, fees, taxes, and return calculations through hands-on practice with real scenarios.</p>
                  </CardContent>
                </Card>
              </div>
            </section>

            {/* Stock Investment Formulas */}
            <section className="bg-white rounded-2xl shadow-lg p-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-8">Stock Profit Calculation Formulas</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-blue-50 rounded-lg p-6">
                  <h3 className="text-xl font-semibold text-blue-900 mb-4">Basic Profit Formula</h3>
                  <div className="bg-white rounded-lg p-4 font-mono text-sm mb-4">
                    Gross Profit = (Sell Price - Buy Price) × Shares
                  </div>
                  <div className="bg-white rounded-lg p-4 font-mono text-sm mb-4">
                    Net Profit = Gross Profit - Fees - Taxes
                  </div>
                  <p className="text-blue-800 text-sm">The fundamental calculation for determining stock investment returns</p>
                </div>
                <div className="bg-green-50 rounded-lg p-6">
                  <h3 className="text-xl font-semibold text-green-900 mb-4">Return Percentage</h3>
                  <div className="bg-white rounded-lg p-4 font-mono text-sm mb-4">
                    Return % = (Net Profit ÷ Total Investment) × 100
                  </div>
                  <div className="bg-white rounded-lg p-4 font-mono text-sm mb-4">
                    Annualized Return = ((1 + Return%) ^ (365/Days)) - 1
                  </div>
                  <p className="text-green-800 text-sm">Calculate percentage returns and time-adjusted performance metrics</p>
                </div>
              </div>
            </section>

            {/* Investment Tips and Tax Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Card className="bg-white border-0 shadow-sm">
                <CardContent className="p-8">
                  <h3 className="text-xl font-semibold text-gray-900 mb-6">📋 Stock Investment Best Practices</h3>
                  <div className="space-y-4">
                    <div className="space-y-2 text-gray-600">
                      <div className="flex items-start">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mr-3 mt-2"></div>
                        <div>
                          <strong>Research Before Investing:</strong> Analyze company fundamentals, financial statements, and market trends before purchasing stocks
                        </div>
                      </div>
                      <div className="flex items-start">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mr-3 mt-2"></div>
                        <div>
                          <strong>Consider All Costs:</strong> Factor in brokerage fees, taxes, and other transaction costs in your profit calculations
                        </div>
                      </div>
                      <div className="flex items-start">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mr-3 mt-2"></div>
                        <div>
                          <strong>Diversify Your Portfolio:</strong> Spread investments across different sectors and companies to reduce overall risk
                        </div>
                      </div>
                      <div className="flex items-start">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mr-3 mt-2"></div>
                        <div>
                          <strong>Long-term Perspective:</strong> Focus on long-term growth rather than short-term price fluctuations for better returns
                        </div>
                      </div>
                      <div className="flex items-start">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mr-3 mt-2"></div>
                        <div>
                          <strong>Regular Monitoring:</strong> Review your portfolio performance regularly and rebalance as needed
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white border-0 shadow-sm">
                <CardContent className="p-8">
                  <h3 className="text-xl font-semibold text-gray-900 mb-6">💰 Capital Gains Tax Guide</h3>
                  <div className="space-y-4">
                    <div className="space-y-2 text-gray-600">
                      <div className="flex items-start">
                        <div className="w-2 h-2 bg-green-500 rounded-full mr-3 mt-2"></div>
                        <div>
                          <strong>Short-term Gains:</strong> Stocks held for less than 1 year are typically taxed as ordinary income at higher rates
                        </div>
                      </div>
                      <div className="flex items-start">
                        <div className="w-2 h-2 bg-green-500 rounded-full mr-3 mt-2"></div>
                        <div>
                          <strong>Long-term Gains:</strong> Stocks held for more than 1 year often qualify for preferential capital gains tax rates
                        </div>
                      </div>
                      <div className="flex items-start">
                        <div className="w-2 h-2 bg-green-500 rounded-full mr-3 mt-2"></div>
                        <div>
                          <strong>Country Variations:</strong> Tax rates vary significantly by country and income level - from 0% to 30%+
                        </div>
                      </div>
                      <div className="flex items-start">
                        <div className="w-2 h-2 bg-green-500 rounded-full mr-3 mt-2"></div>
                        <div>
                          <strong>Tax-Loss Harvesting:</strong> Offset gains with losses to reduce overall tax liability
                        </div>
                      </div>
                      <div className="flex items-start">
                        <div className="w-2 h-2 bg-green-500 rounded-full mr-3 mt-2"></div>
                        <div>
                          <strong>Professional Advice:</strong> Consult with a tax professional for personalized tax planning strategies
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Related Financial Tools */}
            <section className="bg-white rounded-2xl shadow-lg p-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-8">Complete Your Financial Analysis with Related Tools</h2>
              <p className="text-gray-600 mb-8 text-lg">Maximize your investment strategy with our comprehensive suite of financial calculators designed to work together for complete portfolio management.</p>
              
              {/* Investment & Trading Tools */}
              <div className="mb-10">
                <h3 className="text-xl font-semibold text-gray-900 mb-6">📈 Investment & Trading Calculators</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <a href="/tools/investment-return-calculator" className="block p-6 bg-blue-50 rounded-lg border border-blue-100 hover:border-blue-200 transition-all hover:shadow-md">
                    <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center mb-3">
                      <span className="text-white text-sm font-bold">📊</span>
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-2">Investment Return Calculator</h4>
                    <p className="text-gray-600 text-sm mb-3">Calculate comprehensive investment returns including compound growth and multiple contribution scenarios.</p>
                    <span className="text-blue-600 text-sm font-medium">Calculate Returns →</span>
                  </a>
                  
                  <a href="/tools/roi-calculator" className="block p-6 bg-green-50 rounded-lg border border-green-100 hover:border-green-200 transition-all hover:shadow-md">
                    <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center mb-3">
                      <span className="text-white text-sm font-bold">%</span>
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-2">ROI Calculator</h4>
                    <p className="text-gray-600 text-sm mb-3">Measure return on investment for any asset or business investment to compare profitability.</p>
                    <span className="text-green-600 text-sm font-medium">Calculate ROI →</span>
                  </a>
                  
                  <a href="/tools/compound-interest-calculator" className="block p-6 bg-purple-50 rounded-lg border border-purple-100 hover:border-purple-200 transition-all hover:shadow-md">
                    <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center mb-3">
                      <span className="text-white text-sm font-bold">⚡</span>
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-2">Compound Interest Calculator</h4>
                    <p className="text-gray-600 text-sm mb-3">Harness the power of compound growth for long-term investment planning and wealth building.</p>
                    <span className="text-purple-600 text-sm font-medium">Calculate Compound Growth →</span>
                  </a>
                </div>
              </div>

              {/* Financial Planning Tools */}
              <div className="mb-10">
                <h3 className="text-xl font-semibold text-gray-900 mb-6">💰 Financial Planning & Analysis</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <a href="/tools/retirement-calculator" className="block p-6 bg-orange-50 rounded-lg border border-orange-100 hover:border-orange-200 transition-all hover:shadow-md">
                    <div className="w-8 h-8 bg-orange-600 rounded-lg flex items-center justify-center mb-3">
                      <span className="text-white text-sm font-bold">🏖️</span>
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-2">Retirement Calculator</h4>
                    <p className="text-gray-600 text-sm mb-3">Plan your retirement savings and calculate how much you need to maintain your lifestyle.</p>
                    <span className="text-orange-600 text-sm font-medium">Plan Retirement →</span>
                  </a>
                  
                  <a href="/tools/savings-goal-calculator" className="block p-6 bg-teal-50 rounded-lg border border-teal-100 hover:border-teal-200 transition-all hover:shadow-md">
                    <div className="w-8 h-8 bg-teal-600 rounded-lg flex items-center justify-center mb-3">
                      <span className="text-white text-sm font-bold">🎯</span>
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-2">Savings Goal Calculator</h4>
                    <p className="text-gray-600 text-sm mb-3">Set and track savings goals for major purchases, emergencies, or investment funds.</p>
                    <span className="text-teal-600 text-sm font-medium">Set Goals →</span>
                  </a>
                  
                  <a href="/tools/net-worth-calculator" className="block p-6 bg-indigo-50 rounded-lg border border-indigo-100 hover:border-indigo-200 transition-all hover:shadow-md">
                    <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center mb-3">
                      <span className="text-white text-sm font-bold">📋</span>
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-2">Net Worth Calculator</h4>
                    <p className="text-gray-600 text-sm mb-3">Calculate your total net worth by tracking all assets and liabilities in one place.</p>
                    <span className="text-indigo-600 text-sm font-medium">Calculate Net Worth →</span>
                  </a>
                </div>
              </div>

              {/* Debt & Loan Management */}
              <div className="mb-10">
                <h3 className="text-xl font-semibold text-gray-900 mb-6">🏦 Debt & Loan Management</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <a href="/tools/debt-payoff-calculator" className="block p-6 bg-red-50 rounded-lg border border-red-100 hover:border-red-200 transition-all hover:shadow-md">
                    <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center mb-3">
                      <span className="text-white text-sm font-bold">💳</span>
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-2">Debt Payoff Calculator</h4>
                    <p className="text-gray-600 text-sm mb-3">Compare investment returns vs. debt payoff strategies to optimize your financial decisions.</p>
                    <span className="text-red-600 text-sm font-medium">Plan Debt Payoff →</span>
                  </a>
                  
                  <a href="/tools/loan-calculator" className="block p-6 bg-gray-50 rounded-lg border border-gray-200 hover:border-gray-300 transition-all hover:shadow-md">
                    <div className="w-8 h-8 bg-gray-600 rounded-lg flex items-center justify-center mb-3">
                      <span className="text-white text-sm font-bold">🏠</span>
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-2">Loan Calculator</h4>
                    <p className="text-gray-600 text-sm mb-3">Calculate loan payments and compare borrowing costs with investment opportunities.</p>
                    <span className="text-gray-600 text-sm font-medium">Calculate Loans →</span>
                  </a>
                  
                  <a href="/tools/credit-card-interest-calculator" className="block p-6 bg-yellow-50 rounded-lg border border-yellow-100 hover:border-yellow-200 transition-all hover:shadow-md">
                    <div className="w-8 h-8 bg-yellow-600 rounded-lg flex items-center justify-center mb-3">
                      <span className="text-white text-sm font-bold">💳</span>
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-2">Credit Card Interest Calculator</h4>
                    <p className="text-gray-600 text-sm mb-3">Calculate credit card interest and compare with potential investment returns.</p>
                    <span className="text-yellow-600 text-sm font-medium">Calculate Interest →</span>
                  </a>
                </div>
              </div>

              {/* Currency & International Tools */}
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-6">🌍 Currency & International Finance</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <a href="/tools/currency-converter" className="block p-6 bg-blue-50 rounded-lg border border-blue-100 hover:border-blue-200 transition-all hover:shadow-md">
                    <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center mb-3">
                      <span className="text-white text-sm font-bold">💱</span>
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-2">Currency Converter</h4>
                    <p className="text-gray-600 text-sm mb-3">Convert between currencies for international stock investments and global portfolio management.</p>
                    <span className="text-blue-600 text-sm font-medium">Convert Currency →</span>
                  </a>
                  
                  <a href="/tools/inflation-calculator" className="block p-6 bg-emerald-50 rounded-lg border border-emerald-100 hover:border-emerald-200 transition-all hover:shadow-md">
                    <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center mb-3">
                      <span className="text-white text-sm font-bold">📈</span>
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-2">Inflation Calculator</h4>
                    <p className="text-gray-600 text-sm mb-3">Understand how inflation affects your investment returns and purchasing power over time.</p>
                    <span className="text-emerald-600 text-sm font-medium">Calculate Inflation Impact →</span>
                  </a>
                </div>
              </div>
            </section>

            {/* FAQ Section */}
            <section className="bg-gray-50 rounded-2xl p-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-8">Frequently Asked Questions</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">How accurate is the stock profit calculator?</h3>
                    <p className="text-gray-600">Our calculator provides highly accurate results based on the input data. It includes all major cost factors like brokerage fees and taxes, making it reliable for investment planning.</p>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Can I calculate profits for international stocks?</h3>
                    <p className="text-gray-600">Yes! Our calculator supports 16+ major currencies and includes capital gains tax rates for countries worldwide, making it perfect for international stock investments.</p>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">What fees should I include in my calculations?</h3>
                    <p className="text-gray-600">Include brokerage commissions for both buying and selling, SEC fees, exchange fees, and any other transaction costs charged by your broker.</p>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">How do I optimize my investment taxes?</h3>
                    <p className="text-gray-600">Consider holding stocks for over a year to qualify for long-term capital gains rates, and use our calculator to compare different tax scenarios. For comprehensive debt vs. investment analysis, try our <a href="/tools/debt-payoff-calculator" className="text-blue-600 hover:text-blue-700 underline">Debt Payoff Calculator</a>.</p>
                  </div>
                </div>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">How does dividend income affect calculations?</h3>
                    <p className="text-gray-600">In portfolio mode, you can include dividend income to calculate total returns. Dividends increase your overall investment return beyond just capital appreciation.</p>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">What's the difference between gross and net profit?</h3>
                    <p className="text-gray-600">Gross profit is the difference between buy and sell prices. Net profit subtracts all fees and taxes, giving you the actual money you'll receive.</p>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Can I use this for day trading calculations?</h3>
                    <p className="text-gray-600">Absolutely! The calculator works for any holding period, from day trading to long-term investing, and adjusts tax calculations accordingly.</p>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">How can I build a complete investment strategy?</h3>
                    <p className="text-gray-600">Start with our stock calculator, then use our <a href="/tools/investment-return-calculator" className="text-blue-600 hover:text-blue-700 underline">Investment Return Calculator</a> for long-term planning and <a href="/tools/net-worth-calculator" className="text-blue-600 hover:text-blue-700 underline">Net Worth Calculator</a> to track overall financial health.</p>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
