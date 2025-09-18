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

interface InflationResult {
  originalAmount: number;
  finalAmount: number;
  inflationRate: number;
  years: number;
  totalInflation: number;
  purchasingPowerLoss: number;
  averageAnnualInflation: number;
  equivalentValue: number;
  currency: string;
}

export default function InflationCalculator() {
  const [calculationType, setCalculationType] = useState('future-value');

  // Future Value inputs
  const [currentAmount, setCurrentAmount] = useState('10000');
  const [inflationRate, setInflationRate] = useState('3.5');
  const [years, setYears] = useState('10');

  // Past Value inputs
  const [pastAmount, setPastAmount] = useState('1000');
  const [pastYear, setPastYear] = useState('2000');
  const [currentYear, setCurrentYear] = useState('2024');

  // Purchasing Power inputs
  const [baseAmount, setBaseAmount] = useState('50000');
  const [targetYear, setTargetYear] = useState('2030');
  const [baseYear, setBaseYear] = useState('2024');

  const [currency, setCurrency] = useState('USD');
  const [country, setCountry] = useState('US');
  const [result, setResult] = useState<InflationResult | null>(null);

  const countries = [
    { code: 'US', name: 'United States', currency: 'USD', avgInflation: 3.2 },
    { code: 'CA', name: 'Canada', currency: 'CAD', avgInflation: 2.8 },
    { code: 'UK', name: 'United Kingdom', currency: 'GBP', avgInflation: 2.9 },
    { code: 'AU', name: 'Australia', currency: 'AUD', avgInflation: 2.5 },
    { code: 'DE', name: 'Germany', currency: 'EUR', avgInflation: 2.1 },
    { code: 'FR', name: 'France', currency: 'EUR', avgInflation: 2.2 },
    { code: 'IT', name: 'Italy', currency: 'EUR', avgInflation: 2.4 },
    { code: 'ES', name: 'Spain', currency: 'EUR', avgInflation: 2.3 },
    { code: 'JP', name: 'Japan', currency: 'JPY', avgInflation: 0.8 },
    { code: 'KR', name: 'South Korea', currency: 'KRW', avgInflation: 2.3 },
    { code: 'IN', name: 'India', currency: 'INR', avgInflation: 5.8 },
    { code: 'CN', name: 'China', currency: 'CNY', avgInflation: 2.4 },
    { code: 'BR', name: 'Brazil', currency: 'BRL', avgInflation: 6.2 },
    { code: 'MX', name: 'Mexico', currency: 'MXN', avgInflation: 4.8 },
    { code: 'RU', name: 'Russia', currency: 'RUB', avgInflation: 7.5 },
    { code: 'ZA', name: 'South Africa', currency: 'ZAR', avgInflation: 5.5 },
    { code: 'SG', name: 'Singapore', currency: 'SGD', avgInflation: 2.1 },
    { code: 'NZ', name: 'New Zealand', currency: 'NZD', avgInflation: 2.6 },
    { code: 'CH', name: 'Switzerland', currency: 'CHF', avgInflation: 0.9 },
    { code: 'SE', name: 'Sweden', currency: 'SEK', avgInflation: 2.0 }
  ];

  const calculateInflation = () => {
    if (calculationType === 'future-value') {
      calculateFutureValue();
    } else if (calculationType === 'past-value') {
      calculatePastValue();
    } else {
      calculatePurchasingPower();
    }
  };

  const calculateFutureValue = () => {
    const amount = parseFloat(currentAmount);
    const rate = parseFloat(inflationRate) / 100;
    const time = parseFloat(years);

    if (amount <= 0 || rate < 0 || time <= 0) return;

    const futureValue = amount * Math.pow(1 + rate, time);
    const totalInflation = ((futureValue - amount) / amount) * 100;
    const purchasingPowerLoss = ((amount / futureValue) * 100) - 100;

    setResult({
      originalAmount: amount,
      finalAmount: futureValue,
      inflationRate: parseFloat(inflationRate),
      years: time,
      totalInflation,
      purchasingPowerLoss: Math.abs(purchasingPowerLoss),
      averageAnnualInflation: parseFloat(inflationRate),
      equivalentValue: amount / futureValue * amount,
      currency
    });
  };

  const calculatePastValue = () => {
    const amount = parseFloat(pastAmount);
    const startYear = parseFloat(pastYear);
    const endYear = parseFloat(currentYear);
    const yearsDiff = endYear - startYear;

    if (amount <= 0 || yearsDiff <= 0) return;

    // Use country-specific average inflation rate
    const countryData = countries.find(c => c.code === country);
    const avgRate = (countryData?.avgInflation || 3.0) / 100;

    const currentValue = amount * Math.pow(1 + avgRate, yearsDiff);
    const totalInflation = ((currentValue - amount) / amount) * 100;
    const purchasingPowerLoss = ((amount / currentValue) * 100) - 100;

    setResult({
      originalAmount: amount,
      finalAmount: currentValue,
      inflationRate: (countryData?.avgInflation || 3.0),
      years: yearsDiff,
      totalInflation,
      purchasingPowerLoss: Math.abs(purchasingPowerLoss),
      averageAnnualInflation: (countryData?.avgInflation || 3.0),
      equivalentValue: amount,
      currency
    });
  };

  const calculatePurchasingPower = () => {
    const amount = parseFloat(baseAmount);
    const startYear = parseFloat(baseYear);
    const endYear = parseFloat(targetYear);
    const yearsDiff = endYear - startYear;

    if (amount <= 0 || yearsDiff === 0) return;

    // Use country-specific average inflation rate
    const countryData = countries.find(c => c.code === country);
    const avgRate = (countryData?.avgInflation || 3.0) / 100;

    let futureValue: number;
    let purchasingPowerLoss: number;

    if (yearsDiff > 0) {
      // Future purchasing power
      futureValue = amount * Math.pow(1 + avgRate, yearsDiff);
      purchasingPowerLoss = ((amount / futureValue) * 100) - 100;
    } else {
      // Past purchasing power
      futureValue = amount / Math.pow(1 + avgRate, Math.abs(yearsDiff));
      purchasingPowerLoss = ((futureValue / amount) * 100) - 100;
    }

    const totalInflation = ((futureValue - amount) / amount) * 100;

    setResult({
      originalAmount: amount,
      finalAmount: futureValue,
      inflationRate: (countryData?.avgInflation || 3.0),
      years: Math.abs(yearsDiff),
      totalInflation,
      purchasingPowerLoss: Math.abs(purchasingPowerLoss),
      averageAnnualInflation: (countryData?.avgInflation || 3.0),
      equivalentValue: yearsDiff > 0 ? amount : futureValue,
      currency
    });
  };

  const resetCalculator = () => {
    setCurrentAmount('10000');
    setInflationRate('3.5');
    setYears('10');
    setPastAmount('1000');
    setPastYear('2000');
    setCurrentYear('2024');
    setBaseAmount('50000');
    setTargetYear('2030');
    setBaseYear('2024');
    setCurrency('USD');
    setCountry('US');
    setResult(null);
  };

  const handleCountryChange = (newCountry: string) => {
    setCountry(newCountry);
    const countryData = countries.find(c => c.code === newCountry);
    if (countryData) {
      setCurrency(countryData.currency);
      setInflationRate(countryData.avgInflation.toString());
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
      RUB: { locale: 'ru-RU', currency: 'RUB' },
      ZAR: { locale: 'en-ZA', currency: 'ZAR' },
      SGD: { locale: 'en-SG', currency: 'SGD' },
      NZD: { locale: 'en-NZ', currency: 'NZD' },
      CHF: { locale: 'de-CH', currency: 'CHF' },
      SEK: { locale: 'sv-SE', currency: 'SEK' }
    };

    const config = currencyMap[currency] || currencyMap.USD;

    return new Intl.NumberFormat(config.locale, {
      style: 'currency',
      currency: config.currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  const formatPercentage = (percentage: number) => {
    return `${percentage.toFixed(2)}%`;
  };

  const currentCountryData = countries.find(c => c.code === country) || countries[0];

  return (
    <>
      <Helmet>
        <title>Inflation Calculator - Calculate Money Value Over Time | DapsiWow</title>
        <meta name="description" content="Free inflation calculator to analyze purchasing power changes over time. Calculate future value, past value equivalents, and inflation impact with global economic data for 20+ countries." />
        <meta name="keywords" content="inflation calculator, purchasing power calculator, money value calculator, future value inflation, cost of living calculator, historical inflation calculator, inflation rate calculator, purchasing power analysis" />
        <meta property="og:title" content="Inflation Calculator - Calculate Money Value Over Time | DapsiWow" />
        <meta property="og:description" content="Free inflation calculator with global data to analyze money value changes, purchasing power erosion, and inflation impact across 20+ countries." />
        <meta property="og:type" content="website" />
        <meta name="robots" content="index, follow" />
        <meta name="author" content="DapsiWow" />
        <link rel="canonical" href="https://dapsiwow.com/inflation-calculator" />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            "name": "Inflation Calculator",
            "description": "Free online inflation calculator to analyze purchasing power changes and money value over time with historical data from 20+ countries.",
            "url": "https://dapsiwow.com/inflation-calculator",
            "applicationCategory": "FinanceApplication",
            "operatingSystem": "Any",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "USD"
            },
            "featureList": [
              "Calculate future value with inflation",
              "Analyze past value equivalents",
              "Purchasing power comparison",
              "Multi-country inflation data",
              "Historical inflation analysis",
              "Global currency support"
            ]
          })}
        </script>
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50" data-testid="page-inflation-calculator">
        <Header />

        <main>
          {/* Hero Section */}
          <section className="relative py-12 sm:py-16 md:py-20 lg:py-24 xl:py-28 2xl:py-32 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-purple-600/20"></div>
            <div className="relative max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 xl:px-12 text-center">
              <div className="space-y-4 sm:space-y-6 md:space-y-8 lg:space-y-10">
                <div className="inline-flex items-center px-3 py-1.5 sm:px-4 sm:py-2 md:px-5 md:py-2.5 bg-white/80 backdrop-blur-sm rounded-full border border-purple-200 text-xs sm:text-sm md:text-base">
                  <span className="font-medium text-purple-700">Advanced Inflation Calculator</span>
                </div>
                <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl 2xl:text-7xl font-bold text-slate-900 leading-tight tracking-tight">
                  <span className="block">Smart Inflation</span>
                  <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                    Calculator
                  </span>
                </h1>
                <p className="text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl text-slate-600 max-w-xs sm:max-w-md md:max-w-2xl lg:max-w-4xl xl:max-w-5xl mx-auto leading-relaxed px-2 sm:px-4 md:px-6">
                  Calculate purchasing power changes and money value over time with comprehensive global inflation data
                </p>
              </div>
            </div>
          </section>

          {/* Calculator Section */}
          <section className="py-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <Card className="bg-white/90 backdrop-blur-sm shadow-2xl border-0 rounded-3xl overflow-hidden">
                <CardContent className="p-0">
                  <div className="grid grid-cols-1 xl:grid-cols-5 gap-0">
                    {/* Input Section */}
                    <div className="xl:col-span-3 p-8 lg:p-12 space-y-8">
                      <div>
                        <h2 className="text-3xl font-bold text-gray-900 mb-2">Inflation Configuration</h2>
                        <p className="text-gray-600">Enter your amount and time period for accurate inflation impact calculations</p>
                      </div>

                      {/* Country Selection */}
                      <div className="space-y-3">
                        <Label htmlFor="country" className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                          Country (Sets Historical Inflation Data)
                        </Label>
                        <Select value={country} onValueChange={handleCountryChange}>
                          <SelectTrigger className="h-14 border-2 border-gray-200 rounded-xl text-lg" data-testid="select-country">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {countries.map((country) => (
                              <SelectItem key={country.code} value={country.code}>
                                {country.name} (Avg: {country.avgInflation}%)
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <div className="text-sm text-gray-500">
                          Average inflation rate: {currentCountryData.avgInflation}% annually
                        </div>
                      </div>

                      {/* Calculation Type Tabs */}
                      <Tabs value={calculationType} onValueChange={setCalculationType} className="w-full">
                        <TabsList className="grid w-full grid-cols-3">
                          <TabsTrigger value="future-value">Future Value</TabsTrigger>
                          <TabsTrigger value="past-value">Past Value</TabsTrigger>
                          <TabsTrigger value="purchasing-power">Purchasing Power</TabsTrigger>
                        </TabsList>

                        <TabsContent value="future-value" className="space-y-6 mt-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-3">
                              <Label htmlFor="current-amount" className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                                Current Amount
                              </Label>
                              <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-lg">
                                  {currency === 'USD' ? '$' : 
                                   currency === 'CAD' ? 'C$' :
                                   currency === 'EUR' ? '€' : 
                                   currency === 'GBP' ? '£' : 
                                   currency === 'AUD' ? 'A$' :
                                   currency === 'JPY' ? '¥' : 
                                   currency === 'KRW' ? '₩' :
                                   currency === 'INR' ? '₹' :
                                   currency === 'BRL' ? 'R$' :
                                   currency === 'MXN' ? 'MX$' :
                                   currency === 'SGD' ? 'S$' :
                                   currency === 'NZD' ? 'NZ$' : '$'}
                                </span>
                                <Input
                                  id="current-amount"
                                  type="number"
                                  value={currentAmount}
                                  onChange={(e) => setCurrentAmount(e.target.value)}
                                  className="h-14 pl-8 text-lg border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-purple-500"
                                  placeholder="10,000"
                                  min="0"
                                  step="0.01"
                                  data-testid="input-current-amount"
                                />
                              </div>
                            </div>

                            <div className="space-y-3">
                              <Label htmlFor="inflation-rate" className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                                Annual Inflation Rate
                              </Label>
                              <div className="relative">
                                <Input
                                  id="inflation-rate"
                                  type="number"
                                  value={inflationRate}
                                  onChange={(e) => setInflationRate(e.target.value)}
                                  className="h-14 pr-8 text-lg border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-purple-500"
                                  placeholder="3.5"
                                  min="0"
                                  max="50"
                                  step="0.1"
                                  data-testid="input-inflation-rate"
                                />
                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 text-lg">%</span>
                              </div>
                            </div>

                            <div className="space-y-3">
                              <Label htmlFor="years" className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                                Number of Years
                              </Label>
                              <Input
                                id="years"
                                type="number"
                                value={years}
                                onChange={(e) => setYears(e.target.value)}
                                className="h-14 text-lg border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-purple-500"
                                placeholder="10"
                                min="1"
                                max="100"
                                data-testid="input-years"
                              />
                            </div>
                          </div>
                        </TabsContent>

                        <TabsContent value="past-value" className="space-y-6 mt-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-3">
                              <Label htmlFor="past-amount" className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                                Past Amount
                              </Label>
                              <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-lg">
                                  {currency === 'USD' ? '$' : 
                                   currency === 'CAD' ? 'C$' :
                                   currency === 'EUR' ? '€' : 
                                   currency === 'GBP' ? '£' : 
                                   currency === 'AUD' ? 'A$' :
                                   currency === 'JPY' ? '¥' : 
                                   currency === 'KRW' ? '₩' :
                                   currency === 'INR' ? '₹' :
                                   currency === 'BRL' ? 'R$' :
                                   currency === 'MXN' ? 'MX$' :
                                   currency === 'SGD' ? 'S$' :
                                   currency === 'NZD' ? 'NZ$' : '$'}
                                </span>
                                <Input
                                  id="past-amount"
                                  type="number"
                                  value={pastAmount}
                                  onChange={(e) => setPastAmount(e.target.value)}
                                  className="h-14 pl-8 text-lg border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-purple-500"
                                  placeholder="1,000"
                                  min="0"
                                  step="0.01"
                                  data-testid="input-past-amount"
                                />
                              </div>
                            </div>

                            <div className="space-y-3">
                              <Label htmlFor="past-year" className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                                Past Year
                              </Label>
                              <Input
                                id="past-year"
                                type="number"
                                value={pastYear}
                                onChange={(e) => setPastYear(e.target.value)}
                                className="h-14 text-lg border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-purple-500"
                                placeholder="2000"
                                min="1900"
                                max="2024"
                                data-testid="input-past-year"
                              />
                            </div>

                            <div className="space-y-3">
                              <Label htmlFor="current-year" className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                                Current Year
                              </Label>
                              <Input
                                id="current-year"
                                type="number"
                                value={currentYear}
                                onChange={(e) => setCurrentYear(e.target.value)}
                                className="h-14 text-lg border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-purple-500"
                                placeholder="2024"
                                min="1900"
                                max="2024"
                                data-testid="input-current-year"
                              />
                            </div>
                          </div>
                        </TabsContent>

                        <TabsContent value="purchasing-power" className="space-y-6 mt-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-3">
                              <Label htmlFor="base-amount" className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                                Amount
                              </Label>
                              <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-lg">
                                  {currency === 'USD' ? '$' : 
                                   currency === 'CAD' ? 'C$' :
                                   currency === 'EUR' ? '€' : 
                                   currency === 'GBP' ? '£' : 
                                   currency === 'AUD' ? 'A$' :
                                   currency === 'JPY' ? '¥' : 
                                   currency === 'KRW' ? '₩' :
                                   currency === 'INR' ? '₹' :
                                   currency === 'BRL' ? 'R$' :
                                   currency === 'MXN' ? 'MX$' :
                                   currency === 'SGD' ? 'S$' :
                                   currency === 'NZD' ? 'NZ$' : '$'}
                                </span>
                                <Input
                                  id="base-amount"
                                  type="number"
                                  value={baseAmount}
                                  onChange={(e) => setBaseAmount(e.target.value)}
                                  className="h-14 pl-8 text-lg border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-purple-500"
                                  placeholder="50,000"
                                  min="0"
                                  step="0.01"
                                  data-testid="input-base-amount"
                                />
                              </div>
                            </div>

                            <div className="space-y-3">
                              <Label htmlFor="base-year" className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                                Base Year
                              </Label>
                              <Input
                                id="base-year"
                                type="number"
                                value={baseYear}
                                onChange={(e) => setBaseYear(e.target.value)}
                                className="h-14 text-lg border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-purple-500"
                                placeholder="2024"
                                min="1900"
                                max="2050"
                                data-testid="input-base-year"
                              />
                            </div>

                            <div className="space-y-3">
                              <Label htmlFor="target-year" className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                                Target Year
                              </Label>
                              <Input
                                id="target-year"
                                type="number"
                                value={targetYear}
                                onChange={(e) => setTargetYear(e.target.value)}
                                className="h-14 text-lg border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-purple-500"
                                placeholder="2030"
                                min="1900"
                                max="2050"
                                data-testid="input-target-year"
                              />
                            </div>
                          </div>
                        </TabsContent>
                      </Tabs>

                      {/* Action Buttons */}
                      <div className="flex flex-col sm:flex-row gap-4 pt-6">
                        <Button
                          onClick={calculateInflation}
                          className="flex-1 h-14 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold text-lg rounded-xl shadow-lg transform transition-all duration-200 hover:scale-105"
                          data-testid="button-calculate"
                        >
                          Calculate Inflation
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
                    <div className="xl:col-span-2 bg-gradient-to-br from-gray-50 to-purple-50 p-8 lg:p-12">
                      <h2 className="text-2xl font-bold text-gray-900 mb-8">Inflation Analysis</h2>

                      {result ? (
                        <div className="space-y-6" data-testid="inflation-results">
                          {/* Final Amount Highlight */}
                          <div className="bg-white rounded-2xl p-6 shadow-lg border border-purple-100">
                            <div className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-2">
                              {calculationType === 'future-value' ? 'Future Value' : 
                               calculationType === 'past-value' ? 'Current Value' : 'Equivalent Value'}
                            </div>
                            <div className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600" data-testid="text-final-amount">
                              {formatCurrency(result.finalAmount)}
                            </div>
                          </div>

                          {/* Key Metrics */}
                          <div className="space-y-3">
                            <div className="bg-white rounded-xl p-4 shadow-sm">
                              <div className="flex justify-between items-center">
                                <span className="font-medium text-gray-700">Original Amount</span>
                                <span className="font-bold text-gray-900" data-testid="text-original-amount">
                                  {formatCurrency(result.originalAmount)}
                                </span>
                              </div>
                            </div>

                            <div className="bg-white rounded-xl p-4 shadow-sm">
                              <div className="flex justify-between items-center">
                                <span className="font-medium text-gray-700">Time Period</span>
                                <span className="font-bold text-blue-600" data-testid="text-time-period">
                                  {result.years} years
                                </span>
                              </div>
                            </div>

                            <div className="bg-white rounded-xl p-4 shadow-sm">
                              <div className="flex justify-between items-center">
                                <span className="font-medium text-gray-700">Average Annual Inflation</span>
                                <span className="font-bold text-orange-600" data-testid="text-avg-inflation">
                                  {formatPercentage(result.averageAnnualInflation)}
                                </span>
                              </div>
                            </div>

                            <div className="bg-white rounded-xl p-4 shadow-sm">
                              <div className="flex justify-between items-center">
                                <span className="font-medium text-gray-700">Total Inflation</span>
                                <span className="font-bold text-red-600" data-testid="text-total-inflation">
                                  {formatPercentage(Math.abs(result.totalInflation))}
                                </span>
                              </div>
                            </div>

                            <div className="bg-white rounded-xl p-4 shadow-sm">
                              <div className="flex justify-between items-center">
                                <span className="font-medium text-gray-700">Purchasing Power Loss</span>
                                <span className="font-bold text-red-600" data-testid="text-purchasing-power-loss">
                                  -{formatPercentage(result.purchasingPowerLoss)}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Explanation */}
                          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-100">
                            <h4 className="text-lg font-bold text-blue-900 mb-3">Key Insights</h4>
                            <p className="text-blue-800 leading-relaxed">
                              {calculationType === 'future-value' 
                                ? `In ${result.years} years, you would need ${formatCurrency(result.finalAmount)} to have the same purchasing power as ${formatCurrency(result.originalAmount)} today.`
                                : calculationType === 'past-value'
                                ? `${formatCurrency(result.originalAmount)} in ${pastYear} has the same purchasing power as ${formatCurrency(result.finalAmount)} today.`
                                : `${formatCurrency(result.originalAmount)} in ${baseYear} is equivalent to ${formatCurrency(result.finalAmount)} in ${targetYear}.`
                              }
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-16" data-testid="no-results">
                          <div className="w-20 h-20 bg-gray-200 rounded-full mx-auto mb-6 flex items-center justify-center">
                            <div className="text-3xl font-bold text-gray-400">$</div>
                          </div>
                          <p className="text-gray-500 text-lg">Enter amount and time period to calculate inflation impact</p>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Educational Content */}
          <div className="max-w-7xl mx-auto px-4 py-16 space-y-16">
            {/* What is Inflation Calculator */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-lg border-0 rounded-2xl">
              <CardContent className="p-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-6">What is an Inflation Calculator?</h2>
                <div className="prose max-w-none text-gray-700 space-y-4 text-lg leading-relaxed">
                  <p>
                    An <strong>inflation calculator</strong> is a powerful financial tool that helps individuals and businesses understand how inflation impacts the purchasing power of money over time. This comprehensive calculator analyzes the erosion of money's value due to rising prices, enabling users to make informed financial decisions about savings, investments, and long-term financial planning.
                  </p>
                  <p>
                    Our advanced inflation calculator incorporates real-world economic data from over 20 countries, providing accurate projections based on historical inflation rates and economic patterns. Whether you're planning for retirement, evaluating investment returns, or understanding historical purchasing power, this tool delivers precise calculations that reflect actual economic conditions across different regions and time periods.
                  </p>
                  <p>
                    The calculator serves multiple purposes: calculating future value projections to understand what money will be worth in the future, analyzing past value equivalents to see how much historical amounts would be worth today, and comparing purchasing power across different time periods. This makes it an essential resource for financial advisors, economists, and anyone making long-term financial decisions.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Benefits and Features */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card className="bg-white/90 backdrop-blur-sm shadow-lg border-0 rounded-2xl">
                <CardContent className="p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Key Benefits</h2>
                  <div className="space-y-6">
                    <div className="border-l-4 border-blue-500 pl-6">
                      <h3 className="font-bold text-gray-900 mb-2">Global Economic Data</h3>
                      <p className="text-gray-600">Access historical inflation rates from 20+ countries for accurate regional analysis and localized projections.</p>
                    </div>

                    <div className="border-l-4 border-green-500 pl-6">
                      <h3 className="font-bold text-gray-900 mb-2">Multiple Calculation Types</h3>
                      <p className="text-gray-600">Calculate future value, analyze past equivalents, and compare purchasing power across different time periods.</p>
                    </div>

                    <div className="border-l-4 border-purple-500 pl-6">
                      <h3 className="font-bold text-gray-900 mb-2">Currency Support</h3>
                      <p className="text-gray-600">Support for major global currencies with accurate formatting and regional inflation data integration.</p>
                    </div>

                    <div className="border-l-4 border-orange-500 pl-6">
                      <h3 className="font-bold text-gray-900 mb-2">Financial Planning Insights</h3>
                      <p className="text-gray-600">Detailed analysis of purchasing power erosion and inflation impact for informed financial decision-making.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/90 backdrop-blur-sm shadow-lg border-0 rounded-2xl">
                <CardContent className="p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Who Should Use This Tool</h2>
                  <div className="space-y-6">
                    <div className="bg-blue-50 rounded-xl p-4">
                      <h3 className="font-bold text-gray-900 mb-2">Financial Planners</h3>
                      <p className="text-gray-600 text-sm">Provide clients with accurate inflation projections for retirement planning and long-term investment strategies.</p>
                    </div>

                    <div className="bg-green-50 rounded-xl p-4">
                      <h3 className="font-bold text-gray-900 mb-2">Investors</h3>
                      <p className="text-gray-600 text-sm">Evaluate real returns on investments by factoring in inflation impact and purchasing power changes.</p>
                    </div>

                    <div className="bg-purple-50 rounded-xl p-4">
                      <h3 className="font-bold text-gray-900 mb-2">Economists & Researchers</h3>
                      <p className="text-gray-600 text-sm">Analyze historical economic trends and compare purchasing power across different countries and time periods.</p>
                    </div>

                    <div className="bg-orange-50 rounded-xl p-4">
                      <h3 className="font-bold text-gray-900 mb-2">Retirees</h3>
                      <p className="text-gray-600 text-sm">Understand how inflation affects retirement savings and plan for maintaining purchasing power in retirement.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Understanding Inflation Impact */}
            <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-0 shadow-lg rounded-2xl">
              <CardContent className="p-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-8">Understanding Inflation Impact on Different Sectors</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white rounded-xl p-6 shadow-sm">
                    <h3 className="text-xl font-bold text-purple-900 mb-4">Housing & Real Estate</h3>
                    <div className="space-y-3 text-sm text-purple-800">
                      <p><strong>Historical Impact:</strong> Housing typically outpaces general inflation</p>
                      <p><strong>Regional Variation:</strong> Urban areas see higher inflation rates</p>
                      <p><strong>Investment Consideration:</strong> Real estate as inflation hedge</p>
                      <p><strong>Planning Tip:</strong> Factor location-specific housing inflation for accurate projections</p>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl p-6 shadow-sm">
                    <h3 className="text-xl font-bold text-blue-900 mb-4">Healthcare & Education</h3>
                    <div className="space-y-3 text-sm text-blue-800">
                      <p><strong>Inflation Rate:</strong> Often exceeds general inflation by 2-3%</p>
                      <p><strong>Long-term Impact:</strong> Significant cost increases over decades</p>
                      <p><strong>Planning Necessity:</strong> Higher inflation assumptions needed</p>
                      <p><strong>Strategy:</strong> Dedicated savings accounts for healthcare and education costs</p>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl p-6 shadow-sm">
                    <h3 className="text-xl font-bold text-green-900 mb-4">Food & Energy</h3>
                    <div className="space-y-3 text-sm text-green-800">
                      <p><strong>Volatility:</strong> High short-term price fluctuations</p>
                      <p><strong>Global Factors:</strong> Supply chain and geopolitical influences</p>
                      <p><strong>Budget Impact:</strong> Immediate effect on household expenses</p>
                      <p><strong>Mitigation:</strong> Energy-efficient investments reduce inflation exposure</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Inflation and Investment Strategies */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-lg border-0 rounded-2xl">
              <CardContent className="p-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-8">Inflation-Protected Investment Strategies</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-xl font-bold text-blue-900 mb-4">Traditional Inflation Hedges</h3>
                    <div className="space-y-4">
                      <div className="border-l-4 border-blue-500 pl-4">
                        <h4 className="font-semibold text-gray-800 mb-2">Treasury Inflation-Protected Securities (TIPS)</h4>
                        <p className="text-gray-700 text-sm">Government bonds that adjust principal value based on inflation rates, providing guaranteed real returns.</p>
                      </div>
                      <div className="border-l-4 border-blue-500 pl-4">
                        <h4 className="font-semibold text-gray-800 mb-2">Real Estate Investment</h4>
                        <p className="text-gray-700 text-sm">Property values and rental income typically increase with inflation, making real estate a natural hedge.</p>
                      </div>
                      <div className="border-l-4 border-blue-500 pl-4">
                        <h4 className="font-semibold text-gray-800 mb-2">Commodities</h4>
                        <p className="text-gray-700 text-sm">Gold, oil, and agricultural products often maintain value during inflationary periods.</p>
                      </div>
                      <div className="border-l-4 border-blue-500 pl-4">
                        <h4 className="font-semibold text-gray-800 mb-2">Dividend-Growing Stocks</h4>
                        <p className="text-gray-700 text-sm">Companies that consistently increase dividends can provide income growth that outpaces inflation.</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xl font-bold text-orange-900 mb-4">Modern Inflation Protection</h3>
                    <div className="space-y-4">
                      <div className="bg-orange-50 rounded-lg p-4">
                        <h4 className="font-semibold text-orange-800 mb-2">Inflation-Linked Bonds</h4>
                        <p className="text-orange-700 text-sm">International inflation-linked securities provide exposure to different currencies and inflation environments.</p>
                      </div>
                      <div className="bg-green-50 rounded-lg p-4">
                        <h4 className="font-semibold text-green-800 mb-2">Infrastructure Investments</h4>
                        <p className="text-green-700 text-sm">Toll roads, utilities, and infrastructure funds often have inflation-adjusted revenue streams.</p>
                      </div>
                      <div className="bg-purple-50 rounded-lg p-4">
                        <h4 className="font-semibold text-purple-800 mb-2">Floating Rate Instruments</h4>
                        <p className="text-purple-700 text-sm">Bank loans and floating rate bonds adjust interest payments as rates rise with inflation.</p>
                      </div>
                      <div className="bg-blue-50 rounded-lg p-4">
                        <h4 className="font-semibold text-blue-800 mb-2">International Diversification</h4>
                        <p className="text-blue-700 text-sm">Global investments provide exposure to different inflation environments and currency movements.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Global Inflation Trends */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card className="bg-white/90 backdrop-blur-sm shadow-lg border-0 rounded-2xl">
                <CardContent className="p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Regional Inflation Patterns</h2>
                  <div className="space-y-4 text-gray-600">
                    <div className="border-l-4 border-blue-500 pl-4">
                      <h4 className="font-semibold text-gray-800 mb-2">Developed Economies</h4>
                      <p className="text-sm">US, Europe, Japan typically maintain 2-3% inflation targets through monetary policy and central bank interventions.</p>
                    </div>
                    <div className="border-l-4 border-green-500 pl-4">
                      <h4 className="font-semibold text-gray-800 mb-2">Emerging Markets</h4>
                      <p className="text-sm">Higher inflation rates (4-8%) due to economic development, currency volatility, and structural changes.</p>
                    </div>
                    <div className="border-l-4 border-orange-500 pl-4">
                      <h4 className="font-semibold text-gray-800 mb-2">Resource-Rich Countries</h4>
                      <p className="text-sm">Inflation tied to commodity cycles, with periods of high inflation during resource booms.</p>
                    </div>
                    <div className="border-l-4 border-purple-500 pl-4">
                      <h4 className="font-semibold text-gray-800 mb-2">Currency Union Areas</h4>
                      <p className="text-sm">Eurozone countries share monetary policy but experience varying local inflation due to economic differences.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/90 backdrop-blur-sm shadow-lg border-0 rounded-2xl">
                <CardContent className="p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Factors Influencing Inflation</h2>
                  <div className="space-y-4 text-gray-600">
                    <div className="bg-blue-50 rounded-lg p-4">
                      <h4 className="font-semibold text-blue-800 mb-2">Monetary Policy</h4>
                      <p className="text-blue-700 text-sm">Central bank interest rates and money supply management directly impact inflation levels and expectations.</p>
                    </div>
                    <div className="bg-green-50 rounded-lg p-4">
                      <h4 className="font-semibold text-green-800 mb-2">Supply Chain Dynamics</h4>
                      <p className="text-green-700 text-sm">Global supply disruptions, shipping costs, and production bottlenecks create inflationary pressures.</p>
                    </div>
                    <div className="bg-orange-50 rounded-lg p-4">
                      <h4 className="font-semibold text-orange-800 mb-2">Energy Prices</h4>
                      <p className="text-orange-700 text-sm">Oil and gas price fluctuations have cascading effects on transportation, manufacturing, and consumer goods.</p>
                    </div>
                    <div className="bg-purple-50 rounded-lg p-4">
                      <h4 className="font-semibold text-purple-800 mb-2">Labor Market Conditions</h4>
                      <p className="text-purple-700 text-sm">Wage growth, employment levels, and labor shortages influence cost-push inflation dynamics.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* FAQ Section */}
            <Card className="bg-gradient-to-r from-gray-50 to-blue-50 border-0 shadow-lg rounded-2xl">
              <CardContent className="p-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-8">Frequently Asked Questions about Inflation</h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 mb-3">How accurate are inflation calculator projections?</h3>
                      <p className="text-gray-600 leading-relaxed">
                        Our calculator uses historical data and established economic patterns to provide highly accurate projections. However, actual inflation can vary due to unexpected economic events, policy changes, and global factors. The tool is most accurate for long-term trends rather than short-term fluctuations.
                      </p>
                    </div>

                    <div>
                      <h3 className="text-lg font-bold text-gray-900 mb-3">What's the difference between inflation and deflation?</h3>
                      <p className="text-gray-600 leading-relaxed">
                        Inflation represents rising prices and decreasing purchasing power over time, while deflation is the opposite - falling prices and increasing purchasing power. Both can impact economic planning, but deflation is generally rarer and can indicate economic problems.
                      </p>
                    </div>

                    <div>
                      <h3 className="text-lg font-bold text-gray-900 mb-3">How does inflation affect different age groups?</h3>
                      <p className="text-gray-600 leading-relaxed">
                        Young people benefit from inflation if wages rise faster than prices, while retirees on fixed incomes suffer most. Middle-aged individuals with mortgages may benefit as loan payments become easier with inflated wages, but face higher costs for goods and services.
                      </p>
                    </div>

                    <div>
                      <h3 className="text-lg font-bold text-gray-900 mb-3">Should I adjust my savings strategy for inflation?</h3>
                      <p className="text-gray-600 leading-relaxed">
                        Yes, maintaining purchasing power requires returns that exceed inflation rates. This typically means including stocks, real estate, or inflation-protected securities in your portfolio rather than relying solely on cash savings or low-yield bonds.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 mb-3">Why do inflation rates vary between countries?</h3>
                      <p className="text-gray-600 leading-relaxed">
                        Different monetary policies, economic structures, currency stability, and development levels create varying inflation environments. Emerging economies often experience higher inflation due to rapid growth and currency volatility, while developed nations target lower, stable rates.
                      </p>
                    </div>

                    <div>
                      <h3 className="text-lg font-bold text-gray-900 mb-3">How do central banks control inflation?</h3>
                      <p className="text-gray-600 leading-relaxed">
                        Central banks use interest rate adjustments, money supply management, and forward guidance to influence inflation. Higher rates typically reduce inflation by making borrowing more expensive and encouraging saving, while lower rates stimulate economic activity and can increase inflation.
                      </p>
                    </div>

                    <div>
                      <h3 className="text-lg font-bold text-gray-900 mb-3">What's considered a healthy inflation rate?</h3>
                      <p className="text-gray-600 leading-relaxed">
                        Most developed economies target 2-3% annual inflation as healthy for economic growth. This rate encourages spending and investment while maintaining price stability. Rates below 1% may indicate economic weakness, while rates above 4% can signal overheating.
                      </p>
                    </div>

                    <div>
                      <h3 className="text-lg font-bold text-gray-900 mb-3">How often should I recalculate inflation impact?</h3>
                      <p className="text-gray-600 leading-relaxed">
                        Review inflation projections annually or when significant economic changes occur. For long-term financial planning, update calculations when inflation trends deviate significantly from historical averages or when your financial circumstances change substantially.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Inflation Planning Strategies */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-lg border-0 rounded-2xl">
              <CardContent className="p-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Comprehensive Inflation Planning Strategies</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-r-lg">
                      <h4 className="font-semibold text-red-800 mb-2">Emergency Fund Adjustments</h4>
                      <p className="text-red-700 text-sm">Increase emergency fund targets to account for inflation. What covers six months of expenses today may only cover four months in a decade due to rising costs.</p>
                    </div>
                    <div className="bg-orange-50 border-l-4 border-orange-400 p-4 rounded-r-lg">
                      <h4 className="font-semibold text-orange-800 mb-2">Retirement Planning Impact</h4>
                      <p className="text-orange-700 text-sm">Use higher inflation assumptions for retirement planning. Healthcare and long-term care costs often exceed general inflation rates significantly.</p>
                    </div>
                    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-lg">
                      <h4 className="font-semibold text-yellow-800 mb-2">Fixed vs Variable Debt</h4>
                      <p className="text-yellow-700 text-sm">Fixed-rate debt becomes advantageous during inflation as you repay with cheaper dollars, while variable rates may increase with inflation.</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-lg">
                      <h4 className="font-semibold text-blue-800 mb-2">Income Growth Planning</h4>
                      <p className="text-blue-700 text-sm">Negotiate salary increases that exceed inflation rates, consider careers with inflation-protected income, or develop multiple income streams.</p>
                    </div>
                    <div className="bg-purple-50 border-l-4 border-purple-400 p-4 rounded-r-lg">
                      <h4 className="font-semibold text-purple-800 mb-2">International Diversification</h4>
                      <p className="text-purple-700 text-sm">Spread investments across different currencies and economies to protect against domestic inflation and currency devaluation.</p>
                    </div>
                    <div className="bg-green-50 border-l-4 border-green-400 p-4 rounded-r-lg">
                      <h4 className="font-semibold text-green-800 mb-2">Tax-Advantaged Accounts</h4>
                      <p className="text-green-700 text-sm">Maximize contributions to tax-advantaged retirement accounts, as tax brackets may not keep pace with inflation, creating additional value.</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Historical Inflation Events */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-lg border-0 rounded-2xl">
              <CardContent className="p-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Major Historical Inflation Events and Lessons</h2>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-gray-800">1970s Energy Crisis</h4>
                    <div className="space-y-3 text-gray-600">
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-sm">US inflation peaked at 14.8% in 1980 due to oil price shocks</span>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-sm">Fixed-income investments lost significant purchasing power</span>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-sm">Real estate and commodities provided inflation protection</span>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-sm">Lesson: Diversification and real assets are crucial during high inflation</span>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-gray-800">German Hyperinflation (1920s)</h4>
                    <div className="space-y-3 text-gray-600">
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-sm">Inflation reached astronomical levels destroying currency value</span>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-sm">Cash savings became worthless within months</span>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-sm">Foreign currencies and hard assets maintained value</span>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-sm">Lesson: Currency diversification protects against extreme inflation</span>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-gray-800">2008-2020 Low Inflation Era</h4>
                    <div className="space-y-3 text-gray-600">
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-sm">Developed economies struggled with deflation concerns</span>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-sm">Central banks used quantitative easing to stimulate inflation</span>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-sm">Asset prices inflated faster than consumer goods</span>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-sm">Lesson: Different assets experience varying inflation rates</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
}