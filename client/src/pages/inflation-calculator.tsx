import { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ToolSEOHead } from '@/components/seo/ToolSEOHead';
import { inflationCalculatorSEO } from '@/config/seo/tools/inflation-calculator';

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
      <ToolSEOHead config={inflationCalculatorSEO} />
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50" data-testid="page-inflation-calculator">
        <Header />

        <main>
          {/* Hero Section */}
          <section className="relative py-8 sm:py-12 md:py-16 lg:py-20 xl:py-24 2xl:py-32 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-purple-600/20"></div>
            <div className="relative max-w-5xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 text-center">
              <div className="space-y-4 sm:space-y-6 md:space-y-8">
                <div className="inline-flex items-center px-2 sm:px-3 md:px-4 py-1 sm:py-1.5 md:py-2 bg-white/80 backdrop-blur-sm rounded-full border border-purple-200">
                  <span className="text-xs sm:text-sm font-medium text-purple-700">Advanced Inflation Calculator</span>
                </div>
                <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl 2xl:text-7xl font-bold text-slate-900 leading-tight tracking-tight px-2 sm:px-0">
                  <span className="block">Smart Inflation</span>
                  <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 mt-1 sm:mt-2">
                    Calculator
                  </span>
                </h1>
                <p className="text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl 2xl:text-2xl text-slate-600 max-w-xs sm:max-w-sm md:max-w-lg lg:max-w-2xl xl:max-w-3xl 2xl:max-w-4xl mx-auto leading-relaxed px-3 sm:px-2 md:px-0">
                  Calculate purchasing power changes and money value over time with comprehensive global inflation data
                </p>
              </div>
            </div>
          </section>

          <div className="w-full max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-6 sm:py-8 md:py-12 lg:py-16">
            {/* Main Calculator Card */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-2xl border-0 rounded-xl sm:rounded-2xl md:rounded-3xl overflow-hidden">
              <CardContent className="p-0">
                <div className="flex flex-col lg:grid lg:grid-cols-3 gap-0">
                  {/* Input Section */}
                  <div className="lg:col-span-2 p-3 sm:p-4 md:p-6 lg:p-8 xl:p-10 2xl:p-12 space-y-4 sm:space-y-6 md:space-y-8">
                    <div className="text-center sm:text-left">
                      <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">Inflation Configuration</h2>
                      <p className="text-sm sm:text-base text-gray-600">Enter your amount and time period for accurate inflation impact calculations</p>
                    </div>

                    {/* Country Selection */}
                    <div className="space-y-2 sm:space-y-3">
                      <Label htmlFor="country" className="text-xs sm:text-sm font-semibold text-gray-800 uppercase tracking-wide">
                        Country (Sets Historical Inflation Data)
                      </Label>
                      <Select value={country} onValueChange={handleCountryChange}>
                        <SelectTrigger className="h-10 sm:h-12 md:h-14 border-2 border-gray-200 rounded-lg sm:rounded-xl text-sm sm:text-base md:text-lg w-full" data-testid="select-country">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="max-h-60 overflow-y-auto">
                          {countries.map((country) => (
                            <SelectItem key={country.code} value={country.code} className="text-sm sm:text-base">
                              {country.name} (Avg: {country.avgInflation}%)
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <div className="text-xs sm:text-sm text-gray-500">
                        Average inflation rate: {currentCountryData.avgInflation}% annually
                      </div>
                    </div>

                    {/* Calculation Type Tabs */}
                    <Tabs value={calculationType} onValueChange={setCalculationType} className="w-full">
                      <TabsList className="grid w-full grid-cols-1 sm:grid-cols-3 h-auto gap-1 sm:gap-0 p-1">
                        <TabsTrigger value="future-value" className="text-xs sm:text-sm md:text-base lg:text-lg py-2 sm:py-3 md:py-4 px-2 sm:px-3 md:px-4 whitespace-nowrap overflow-hidden text-ellipsis min-w-0 flex-1">
                          <span className="block sm:hidden">Future</span>
                          <span className="hidden sm:block md:hidden">Future Val.</span>
                          <span className="hidden md:block">Future Value</span>
                        </TabsTrigger>
                        <TabsTrigger value="past-value" className="text-xs sm:text-sm md:text-base lg:text-lg py-2 sm:py-3 md:py-4 px-2 sm:px-3 md:px-4 whitespace-nowrap overflow-hidden text-ellipsis min-w-0 flex-1">
                          <span className="block sm:hidden">Past</span>
                          <span className="hidden sm:block md:hidden">Past Val.</span>
                          <span className="hidden md:block">Past Value</span>
                        </TabsTrigger>
                        <TabsTrigger value="purchasing-power" className="text-xs sm:text-sm md:text-base lg:text-lg py-2 sm:py-3 md:py-4 px-2 sm:px-3 md:px-4 whitespace-nowrap overflow-hidden text-ellipsis min-w-0 flex-1">
                          <span className="block sm:hidden">Power</span>
                          <span className="hidden sm:block md:hidden">Purch. Power</span>
                          <span className="hidden md:block">Purchasing Power</span>
                        </TabsTrigger>
                      </TabsList>

                      <TabsContent value="future-value" className="space-y-3 sm:space-y-4 md:space-y-6 mt-3 sm:mt-4 md:mt-6">
                        <div className="grid grid-cols-1 gap-3 sm:gap-4 md:gap-6">
                          <div className="space-y-2 sm:space-y-3">
                            <Label htmlFor="current-amount" className="text-xs sm:text-sm font-semibold text-gray-800 uppercase tracking-wide">
                              Current Amount ({currency})
                            </Label>
                            <div className="relative">
                              <span className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm sm:text-base md:text-lg">
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
                                className="h-10 sm:h-12 md:h-14 pl-6 sm:pl-7 md:pl-8 text-sm sm:text-base md:text-lg border-2 border-gray-200 rounded-lg sm:rounded-xl focus:border-purple-500 focus:ring-purple-500 w-full"
                                placeholder="10,000"
                                min="0"
                                step="0.01"
                                data-testid="input-current-amount"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 md:gap-6">
                            <div className="space-y-2 sm:space-y-3">
                              <Label htmlFor="inflation-rate" className="text-xs sm:text-sm font-semibold text-gray-800 uppercase tracking-wide">
                                Annual Inflation Rate
                              </Label>
                              <div className="relative">
                                <Input
                                  id="inflation-rate"
                                  type="number"
                                  value={inflationRate}
                                  onChange={(e) => setInflationRate(e.target.value)}
                                  className="h-10 sm:h-12 md:h-14 pr-6 sm:pr-7 md:pr-8 text-sm sm:text-base md:text-lg border-2 border-gray-200 rounded-lg sm:rounded-xl focus:border-purple-500 focus:ring-purple-500 w-full"
                                  placeholder="3.5"
                                  min="0"
                                  max="50"
                                  step="0.1"
                                  data-testid="input-inflation-rate"
                                />
                                <span className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm sm:text-base md:text-lg">%</span>
                              </div>
                            </div>

                            <div className="space-y-2 sm:space-y-3">
                              <Label htmlFor="years" className="text-xs sm:text-sm font-semibold text-gray-800 uppercase tracking-wide">
                                Number of Years
                              </Label>
                              <Input
                                id="years"
                                type="number"
                                value={years}
                                onChange={(e) => setYears(e.target.value)}
                                className="h-10 sm:h-12 md:h-14 text-sm sm:text-base md:text-lg border-2 border-gray-200 rounded-lg sm:rounded-xl focus:border-purple-500 focus:ring-purple-500 w-full"
                                placeholder="10"
                                min="1"
                                max="100"
                                data-testid="input-years"
                              />
                            </div>
                          </div>
                          <p className="text-xs sm:text-sm text-gray-500">Calculate what your money will be worth in the future</p>
                        </div>
                      </TabsContent>

                      <TabsContent value="past-value" className="space-y-3 sm:space-y-4 md:space-y-6 mt-3 sm:mt-4 md:mt-6">
                        <div className="grid grid-cols-1 gap-3 sm:gap-4 md:gap-6">
                          <div className="space-y-2 sm:space-y-3">
                            <Label htmlFor="past-amount" className="text-xs sm:text-sm font-semibold text-gray-800 uppercase tracking-wide">
                              Past Amount ({currency})
                            </Label>
                            <div className="relative">
                              <span className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm sm:text-base md:text-lg">
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
                                className="h-10 sm:h-12 md:h-14 pl-6 sm:pl-7 md:pl-8 text-sm sm:text-base md:text-lg border-2 border-gray-200 rounded-lg sm:rounded-xl focus:border-purple-500 focus:ring-purple-500 w-full"
                                placeholder="1,000"
                                min="0"
                                step="0.01"
                                data-testid="input-past-amount"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 md:gap-6">
                            <div className="space-y-2 sm:space-y-3">
                              <Label htmlFor="past-year" className="text-xs sm:text-sm font-semibold text-gray-800 uppercase tracking-wide">
                                Past Year
                              </Label>
                              <Input
                                id="past-year"
                                type="number"
                                value={pastYear}
                                onChange={(e) => setPastYear(e.target.value)}
                                className="h-10 sm:h-12 md:h-14 text-sm sm:text-base md:text-lg border-2 border-gray-200 rounded-lg sm:rounded-xl focus:border-purple-500 focus:ring-purple-500 w-full"
                                placeholder="2000"
                                min="1900"
                                max="2024"
                                data-testid="input-past-year"
                              />
                            </div>

                            <div className="space-y-2 sm:space-y-3">
                              <Label htmlFor="current-year" className="text-xs sm:text-sm font-semibold text-gray-800 uppercase tracking-wide">
                                Current Year
                              </Label>
                              <Input
                                id="current-year"
                                type="number"
                                value={currentYear}
                                onChange={(e) => setCurrentYear(e.target.value)}
                                className="h-10 sm:h-12 md:h-14 text-sm sm:text-base md:text-lg border-2 border-gray-200 rounded-lg sm:rounded-xl focus:border-purple-500 focus:ring-purple-500 w-full"
                                placeholder="2024"
                                min="1900"
                                max="2024"
                                data-testid="input-current-year"
                              />
                            </div>
                          </div>
                          <p className="text-xs sm:text-sm text-gray-500">Calculate current value of past amounts using historical inflation</p>
                        </div>
                      </TabsContent>

                      <TabsContent value="purchasing-power" className="space-y-3 sm:space-y-4 md:space-y-6 mt-3 sm:mt-4 md:mt-6">
                        <div className="grid grid-cols-1 gap-3 sm:gap-4 md:gap-6">
                          <div className="space-y-2 sm:space-y-3">
                            <Label htmlFor="base-amount" className="text-xs sm:text-sm font-semibold text-gray-800 uppercase tracking-wide">
                              Amount ({currency})
                            </Label>
                            <div className="relative">
                              <span className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm sm:text-base md:text-lg">
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
                                className="h-10 sm:h-12 md:h-14 pl-6 sm:pl-7 md:pl-8 text-sm sm:text-base md:text-lg border-2 border-gray-200 rounded-lg sm:rounded-xl focus:border-purple-500 focus:ring-purple-500 w-full"
                                placeholder="50,000"
                                min="0"
                                step="0.01"
                                data-testid="input-base-amount"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 md:gap-6">
                            <div className="space-y-2 sm:space-y-3">
                              <Label htmlFor="base-year" className="text-xs sm:text-sm font-semibold text-gray-800 uppercase tracking-wide">
                                Base Year
                              </Label>
                              <Input
                                id="base-year"
                                type="number"
                                value={baseYear}
                                onChange={(e) => setBaseYear(e.target.value)}
                                className="h-10 sm:h-12 md:h-14 text-sm sm:text-base md:text-lg border-2 border-gray-200 rounded-lg sm:rounded-xl focus:border-purple-500 focus:ring-purple-500 w-full"
                                placeholder="2024"
                                min="1900"
                                max="2050"
                                data-testid="input-base-year"
                              />
                            </div>

                            <div className="space-y-2 sm:space-y-3">
                              <Label htmlFor="target-year" className="text-xs sm:text-sm font-semibold text-gray-800 uppercase tracking-wide">
                                Target Year
                              </Label>
                              <Input
                                id="target-year"
                                type="number"
                                value={targetYear}
                                onChange={(e) => setTargetYear(e.target.value)}
                                className="h-10 sm:h-12 md:h-14 text-sm sm:text-base md:text-lg border-2 border-gray-200 rounded-lg sm:rounded-xl focus:border-purple-500 focus:ring-purple-500 w-full"
                                placeholder="2030"
                                min="1900"
                                max="2050"
                                data-testid="input-target-year"
                              />
                            </div>
                          </div>
                          <p className="text-xs sm:text-sm text-gray-500">Compare purchasing power between different years</p>
                        </div>
                      </TabsContent>
                    </Tabs>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row justify-center items-center gap-2 sm:gap-3 md:gap-4 pt-3 sm:pt-4 md:pt-6">
                      <Button
                        onClick={calculateInflation}
                        className="w-full sm:flex-1 h-10 sm:h-12 md:h-14 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold text-sm sm:text-base md:text-lg rounded-lg sm:rounded-xl shadow-lg transition-colors duration-200"
                        data-testid="button-calculate"
                      >
                        Calculate Inflation
                      </Button>
                      <Button
                        onClick={resetCalculator}
                        variant="outline"
                        className="w-full sm:w-auto h-10 sm:h-12 md:h-14 px-4 sm:px-6 md:px-8 border-2 border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold text-sm sm:text-base md:text-lg rounded-lg sm:rounded-xl"
                        data-testid="button-reset"
                      >
                        Reset
                      </Button>
                    </div>
                  </div>

                {/* Results Section */}
                <div className="bg-gradient-to-br from-gray-50 to-blue-50 p-3 sm:p-4 md:p-6 lg:p-8 xl:p-10 2xl:p-12 border-t lg:border-t-0 lg:border-l">
                  <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 mb-4 sm:mb-6 md:mb-8 text-center sm:text-left">Inflation Analysis</h2>

                  {result ? (
                    <div className="space-y-4 sm:space-y-6 md:space-y-8" data-testid="inflation-results">
                      {/* Main Result Highlight */}
                      <div className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-6 shadow-lg border border-purple-100">
                        <div className="text-xs sm:text-sm font-semibold text-gray-600 uppercase tracking-wide mb-2">
                          {calculationType === 'future-value' ? 'Future Value' : 
                           calculationType === 'past-value' ? 'Current Value' : 'Equivalent Value'}
                        </div>
                        <div className="text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 break-all" data-testid="text-final-amount">
                          {formatCurrency(result.finalAmount)}
                        </div>
                      </div>

                      {/* Detailed Breakdown */}
                      <div className="space-y-3 sm:space-y-4">
                        <h3 className="text-sm sm:text-base md:text-lg font-bold text-gray-900">Analysis Details</h3>
                        
                        <div className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 shadow-sm">
                          <div className="flex justify-between items-center">
                            <span className="font-medium text-gray-700 text-sm sm:text-base">Original Amount</span>
                            <span className="font-bold text-gray-900 text-sm sm:text-base break-all" data-testid="text-original-amount">
                              {formatCurrency(result.originalAmount)}
                            </span>
                          </div>
                        </div>

                        <div className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 shadow-sm">
                          <div className="flex justify-between items-center">
                            <span className="font-medium text-gray-700 text-sm sm:text-base">Time Period</span>
                            <span className="font-bold text-blue-600 text-sm sm:text-base" data-testid="text-time-period">
                              {result.years} years
                            </span>
                          </div>
                        </div>

                        <div className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 shadow-sm">
                          <div className="flex justify-between items-center">
                            <span className="font-medium text-gray-700 text-sm sm:text-base">Average Annual Inflation</span>
                            <span className="font-bold text-orange-600 text-sm sm:text-base" data-testid="text-avg-inflation">
                              {formatPercentage(result.averageAnnualInflation)}
                            </span>
                          </div>
                        </div>

                        <div className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 shadow-sm">
                          <div className="flex justify-between items-center">
                            <span className="font-medium text-gray-700 text-sm sm:text-base">Total Inflation</span>
                            <span className="font-bold text-red-600 text-sm sm:text-base" data-testid="text-total-inflation">
                              {formatPercentage(Math.abs(result.totalInflation))}
                            </span>
                          </div>
                        </div>

                        <div className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 shadow-sm">
                          <div className="flex justify-between items-center">
                            <span className="font-medium text-gray-700 text-sm sm:text-base">Purchasing Power Loss</span>
                            <span className="font-bold text-red-600 text-sm sm:text-base" data-testid="text-purchasing-power-loss">
                              -{formatPercentage(result.purchasingPowerLoss)}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Key Insights */}
                      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-6 border border-blue-100">
                        <h4 className="text-sm sm:text-base md:text-lg font-bold text-blue-900 mb-2 sm:mb-3">Key Insights</h4>
                        <p className="text-blue-800 leading-relaxed text-xs sm:text-sm md:text-base">
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
                    <div className="text-center py-8 sm:py-12 md:py-16" data-testid="no-results">
                      <div className="w-16 sm:w-20 h-16 sm:h-20 bg-gray-200 rounded-full mx-auto mb-4 sm:mb-6 flex items-center justify-center">
                        <div className="text-2xl sm:text-3xl font-bold text-gray-400">$</div>
                      </div>
                      <p className="text-gray-500 text-sm sm:text-base md:text-lg px-4">Enter amount and time period to calculate inflation impact</p>
                    </div>
                  )}
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
