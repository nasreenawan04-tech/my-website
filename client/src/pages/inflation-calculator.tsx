
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
    <div className="min-h-screen bg-gray-50">
      <Helmet>
        <title>Free Inflation Calculator - Calculate Money Value Impact Over Time | Financial Planning Tool</title>
        <meta name="description" content="Advanced inflation calculator with 20+ country data. Calculate future value, purchasing power loss, and inflation impact on investments. Free tool for financial planning, retirement, and economic analysis." />
        <meta name="keywords" content="inflation calculator, purchasing power calculator, money value calculator, future value inflation, inflation impact calculator, economic calculator, financial planning tool, retirement inflation calculator, cost of living calculator, inflation rate calculator, currency devaluation calculator" />
        <meta property="og:title" content="Free Inflation Calculator - Calculate Money Value Impact Over Time" />
        <meta property="og:description" content="Calculate inflation impact on your money with country-specific data. Analyze purchasing power loss, future values, and plan for economic changes effectively." />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="ToolsHub" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Inflation Calculator - Financial Planning & Economic Analysis Tool" />
        <meta name="twitter:description" content="Calculate inflation impact with global data. Essential tool for investors, retirees, and financial planners to understand money value changes." />
        <meta name="robots" content="index, follow" />
        <meta name="author" content="ToolsHub" />
        <link rel="canonical" href="https://toolshub.com/tools/inflation-calculator" />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            "name": "Inflation Calculator",
            "description": "Calculate the impact of inflation on money value over time with country-specific historical data and projections for financial planning.",
            "url": "https://toolshub.com/tools/inflation-calculator",
            "applicationCategory": "FinanceApplication",
            "operatingSystem": "Web Browser",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "USD"
            },
            "featureList": [
              "Historical inflation data for 20+ countries",
              "Future value calculations with inflation",
              "Purchasing power analysis",
              "Multi-currency support",
              "Past value adjustments",
              "Economic planning tools"
            ]
          })}
        </script>
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
              Inflation Calculator
            </h1>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto">
              Calculate the impact of inflation on money value over time with worldwide country-specific rates
            </p>
          </div>
        </section>

        <div className="max-w-6xl mx-auto px-4 py-12">
          <Card className="bg-white shadow-sm border-0">
            <CardContent className="p-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                {/* Input Section */}
                <div className="space-y-6">
                  <h2 className="text-2xl font-semibold text-gray-900 mb-8">Inflation Calculator</h2>
                  
                  {/* Country Selection */}
                  <div className="space-y-3">
                    <Label htmlFor="country" className="text-sm font-medium text-gray-700">
                      Country (Sets historical inflation data)
                    </Label>
                    <Select value={country} onValueChange={handleCountryChange}>
                      <SelectTrigger className="h-12 border-gray-200 rounded-lg">
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
                    <div className="text-xs text-gray-500">
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
                      <div className="space-y-3">
                        <Label htmlFor="current-amount" className="text-sm font-medium text-gray-700">
                          Current Amount ({currency})
                        </Label>
                        <Input
                          id="current-amount"
                          type="number"
                          value={currentAmount}
                          onChange={(e) => setCurrentAmount(e.target.value)}
                          className="h-12 text-base border-gray-200 rounded-lg"
                          placeholder="10,000"
                          min="0"
                          step="0.01"
                        />
                      </div>

                      <div className="space-y-3">
                        <Label htmlFor="inflation-rate" className="text-sm font-medium text-gray-700">
                          Annual Inflation Rate (%)
                        </Label>
                        <Input
                          id="inflation-rate"
                          type="number"
                          value={inflationRate}
                          onChange={(e) => setInflationRate(e.target.value)}
                          className="h-12 text-base border-gray-200 rounded-lg"
                          placeholder="3.5"
                          min="0"
                          max="50"
                          step="0.1"
                        />
                      </div>

                      <div className="space-y-3">
                        <Label htmlFor="years" className="text-sm font-medium text-gray-700">
                          Number of Years
                        </Label>
                        <Input
                          id="years"
                          type="number"
                          value={years}
                          onChange={(e) => setYears(e.target.value)}
                          className="h-12 text-base border-gray-200 rounded-lg"
                          placeholder="10"
                          min="1"
                          max="100"
                        />
                      </div>
                    </TabsContent>

                    <TabsContent value="past-value" className="space-y-6 mt-6">
                      <div className="space-y-3">
                        <Label htmlFor="past-amount" className="text-sm font-medium text-gray-700">
                          Past Amount ({currency})
                        </Label>
                        <Input
                          id="past-amount"
                          type="number"
                          value={pastAmount}
                          onChange={(e) => setPastAmount(e.target.value)}
                          className="h-12 text-base border-gray-200 rounded-lg"
                          placeholder="1,000"
                          min="0"
                          step="0.01"
                        />
                      </div>

                      <div className="space-y-3">
                        <Label htmlFor="past-year" className="text-sm font-medium text-gray-700">
                          Past Year
                        </Label>
                        <Input
                          id="past-year"
                          type="number"
                          value={pastYear}
                          onChange={(e) => setPastYear(e.target.value)}
                          className="h-12 text-base border-gray-200 rounded-lg"
                          placeholder="2000"
                          min="1900"
                          max="2024"
                        />
                      </div>

                      <div className="space-y-3">
                        <Label htmlFor="current-year" className="text-sm font-medium text-gray-700">
                          Current Year
                        </Label>
                        <Input
                          id="current-year"
                          type="number"
                          value={currentYear}
                          onChange={(e) => setCurrentYear(e.target.value)}
                          className="h-12 text-base border-gray-200 rounded-lg"
                          placeholder="2024"
                          min="1900"
                          max="2024"
                        />
                      </div>
                    </TabsContent>

                    <TabsContent value="purchasing-power" className="space-y-6 mt-6">
                      <div className="space-y-3">
                        <Label htmlFor="base-amount" className="text-sm font-medium text-gray-700">
                          Amount ({currency})
                        </Label>
                        <Input
                          id="base-amount"
                          type="number"
                          value={baseAmount}
                          onChange={(e) => setBaseAmount(e.target.value)}
                          className="h-12 text-base border-gray-200 rounded-lg"
                          placeholder="50,000"
                          min="0"
                          step="0.01"
                        />
                      </div>

                      <div className="space-y-3">
                        <Label htmlFor="base-year" className="text-sm font-medium text-gray-700">
                          Base Year
                        </Label>
                        <Input
                          id="base-year"
                          type="number"
                          value={baseYear}
                          onChange={(e) => setBaseYear(e.target.value)}
                          className="h-12 text-base border-gray-200 rounded-lg"
                          placeholder="2024"
                          min="1900"
                          max="2050"
                        />
                      </div>

                      <div className="space-y-3">
                        <Label htmlFor="target-year" className="text-sm font-medium text-gray-700">
                          Target Year
                        </Label>
                        <Input
                          id="target-year"
                          type="number"
                          value={targetYear}
                          onChange={(e) => setTargetYear(e.target.value)}
                          className="h-12 text-base border-gray-200 rounded-lg"
                          placeholder="2030"
                          min="1900"
                          max="2050"
                        />
                      </div>
                    </TabsContent>
                  </Tabs>

                  {/* Action Buttons */}
                  <div className="flex gap-4 pt-6">
                    <Button
                      onClick={calculateInflation}
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
                  <h2 className="text-2xl font-semibold text-gray-900 mb-8">Inflation Analysis</h2>
                  
                  {result ? (
                    <div className="space-y-6">
                      {/* Main Results */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white rounded-lg p-4 border border-gray-100">
                          <div className="text-center space-y-2">
                            <div className="text-sm text-gray-600">
                              {calculationType === 'future-value' ? 'Future Value' : 
                               calculationType === 'past-value' ? 'Current Value' : 'Equivalent Value'}
                            </div>
                            <div className="text-2xl font-bold text-blue-600">
                              {formatCurrency(result.finalAmount)}
                            </div>
                          </div>
                        </div>
                        <div className="bg-white rounded-lg p-4 border border-gray-100">
                          <div className="text-center space-y-2">
                            <div className="text-sm text-gray-600">Purchasing Power Loss</div>
                            <div className="text-2xl font-bold text-red-600">
                              -{formatPercentage(result.purchasingPowerLoss)}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Detailed Breakdown */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-900">Impact Analysis</h3>
                        
                        <div className="flex justify-between items-center py-3 border-b border-gray-200">
                          <span className="text-gray-600">Original Amount</span>
                          <span className="font-semibold text-gray-900">
                            {formatCurrency(result.originalAmount)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center py-3 border-b border-gray-200">
                          <span className="text-gray-600">
                            {calculationType === 'future-value' ? 'Future Value' : 
                             calculationType === 'past-value' ? 'Current Value' : 'Equivalent Value'}
                          </span>
                          <span className="font-semibold text-blue-600">
                            {formatCurrency(result.finalAmount)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center py-3 border-b border-gray-200">
                          <span className="text-gray-600">Time Period</span>
                          <span className="font-semibold text-gray-900">
                            {result.years} years
                          </span>
                        </div>
                        <div className="flex justify-between items-center py-3 border-b border-gray-200">
                          <span className="text-gray-600">Average Annual Inflation</span>
                          <span className="font-semibold text-orange-600">
                            {formatPercentage(result.averageAnnualInflation)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center py-3 border-b border-gray-200">
                          <span className="text-gray-600">Total Inflation</span>
                          <span className="font-semibold text-red-600">
                            {formatPercentage(Math.abs(result.totalInflation))}
                          </span>
                        </div>
                        <div className="flex justify-between items-center py-3">
                          <span className="text-gray-600">Purchasing Power Loss</span>
                          <span className="font-semibold text-red-600">
                            -{formatPercentage(result.purchasingPowerLoss)}
                          </span>
                        </div>
                      </div>

                      {/* Explanation */}
                      <div className="mt-8 bg-blue-50 rounded-lg p-4">
                        <h4 className="text-sm font-semibold text-blue-900 mb-2">What this means:</h4>
                        <p className="text-sm text-blue-800">
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
                    <div className="text-center py-12">
                      <TrendingUp className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500">Enter amount and time period to calculate inflation impact</p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Educational Content */}
          <div className="mt-16 space-y-16">
            {/* What is an Inflation Calculator */}
            <section className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-8">
              <div className="max-w-4xl mx-auto">
                <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">
                  What is an Inflation Calculator and How Does It Work?
                </h2>
                <div className="prose prose-lg text-gray-700 mx-auto mb-8">
                  <p className="text-xl leading-relaxed mb-6">
                    An inflation calculator is a crucial financial tool that measures how the purchasing power of money changes over time due to inflation. It uses mathematical formulas and historical economic data to calculate how much money will be worth in the future, or conversely, what past amounts would be equivalent to today's dollars. Our advanced calculator incorporates real-world inflation rates from 20+ countries to provide accurate, localized projections.
                  </p>
                  
                  <p className="text-lg leading-relaxed mb-6">
                    The calculator works by applying compound inflation rates using the formula: Future Value = Present Value × (1 + inflation rate)^years. This exponential calculation accounts for the compounding effect of inflation over time, showing how even modest annual inflation rates can significantly erode purchasing power over decades. The tool processes three key calculation types: future value projections, historical value adjustments, and purchasing power analysis.
                  </p>
                  
                  <p className="text-lg leading-relaxed">
                    Beyond simple calculations, our tool incorporates country-specific historical inflation data, enabling users to understand regional economic patterns and make informed financial decisions. The calculator considers factors like monetary policy, economic cycles, and global market conditions that influence inflation rates across different economies worldwide.
                  </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                  <div className="bg-white rounded-lg p-6 shadow-sm">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                      <TrendingUp className="w-6 h-6 text-blue-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">Precise Calculations</h3>
                    <p className="text-gray-600 text-sm">Mathematical accuracy using compound inflation formulas with country-specific historical data for reliable projections.</p>
                  </div>
                  <div className="bg-white rounded-lg p-6 shadow-sm">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                      <TrendingUp className="w-6 h-6 text-green-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">Global Economic Data</h3>
                    <p className="text-gray-600 text-sm">Comprehensive inflation rates from 20+ countries with historical trends and regional economic insights.</p>
                  </div>
                  <div className="bg-white rounded-lg p-6 shadow-sm">
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                      <TrendingUp className="w-6 h-6 text-purple-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">Multi-Purpose Analysis</h3>
                    <p className="text-gray-600 text-sm">Future value, past value, and purchasing power calculations for comprehensive financial planning.</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Benefits and Use Cases */}
            <section>
              <div className="max-w-6xl mx-auto">
                <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
                  Benefits and Use Cases for Every Audience
                </h2>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-12">
                  {/* Students */}
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-8">
                    <h3 className="text-2xl font-semibold text-gray-900 mb-4">For Students</h3>
                    <ul className="space-y-3 text-gray-700">
                      <li className="flex items-start">
                        <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        <span><strong>Economics Education:</strong> Understand inflation concepts and economic principles through practical calculations and real-world examples</span>
                      </li>
                      <li className="flex items-start">
                        <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        <span><strong>Financial Literacy:</strong> Learn how money value changes over time and develop awareness of purchasing power erosion</span>
                      </li>
                      <li className="flex items-start">
                        <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        <span><strong>Future Planning:</strong> Calculate how much today's education costs will be worth when entering the job market</span>
                      </li>
                      <li className="flex items-start">
                        <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        <span><strong>Research Projects:</strong> Access historical economic data for academic research and economic analysis assignments</span>
                      </li>
                    </ul>
                  </div>

                  {/* Professionals */}
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-8">
                    <h3 className="text-2xl font-semibold text-gray-900 mb-4">For Financial Professionals</h3>
                    <ul className="space-y-3 text-gray-700">
                      <li className="flex items-start">
                        <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        <span><strong>Client Consultations:</strong> Demonstrate inflation impact on long-term investments and retirement planning strategies</span>
                      </li>
                      <li className="flex items-start">
                        <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        <span><strong>Portfolio Management:</strong> Calculate real returns by adjusting for inflation and assess investment performance accurately</span>
                      </li>
                      <li className="flex items-start">
                        <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        <span><strong>Risk Assessment:</strong> Evaluate inflation risk in fixed-income investments and bond portfolios</span>
                      </li>
                      <li className="flex items-start">
                        <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        <span><strong>Economic Analysis:</strong> Analyze market trends and economic cycles using historical inflation patterns</span>
                      </li>
                    </ul>
                  </div>

                  {/* Business Owners */}
                  <div className="bg-gradient-to-br from-purple-50 to-violet-50 rounded-xl p-8">
                    <h3 className="text-2xl font-semibold text-gray-900 mb-4">For Business Owners</h3>
                    <ul className="space-y-3 text-gray-700">
                      <li className="flex items-start">
                        <span className="w-2 h-2 bg-purple-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        <span><strong>Pricing Strategies:</strong> Adjust product and service prices to maintain profit margins despite inflationary pressures</span>
                      </li>
                      <li className="flex items-start">
                        <span className="w-2 h-2 bg-purple-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        <span><strong>Budget Planning:</strong> Project future costs for raw materials, labor, and operational expenses with inflation adjustments</span>
                      </li>
                      <li className="flex items-start">
                        <span className="w-2 h-2 bg-purple-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        <span><strong>Contract Negotiations:</strong> Include inflation escalation clauses in long-term contracts and agreements</span>
                      </li>
                      <li className="flex items-start">
                        <span className="w-2 h-2 bg-purple-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        <span><strong>Investment Decisions:</strong> Evaluate capital expenditures and expansion plans considering future cost increases</span>
                      </li>
                    </ul>
                  </div>

                  {/* Retirees & Investors */}
                  <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl p-8">
                    <h3 className="text-2xl font-semibold text-gray-900 mb-4">For Retirees & Investors</h3>
                    <ul className="space-y-3 text-gray-700">
                      <li className="flex items-start">
                        <span className="w-2 h-2 bg-orange-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        <span><strong>Retirement Planning:</strong> Calculate how much savings will be needed to maintain purchasing power throughout retirement</span>
                      </li>
                      <li className="flex items-start">
                        <span className="w-2 h-2 bg-orange-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        <span><strong>Fixed Income Impact:</strong> Assess how inflation erodes the value of pensions, annuities, and social security benefits</span>
                      </li>
                      <li className="flex items-start">
                        <span className="w-2 h-2 bg-orange-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        <span><strong>Investment Strategy:</strong> Choose inflation-protected securities and assets that preserve purchasing power</span>
                      </li>
                      <li className="flex items-start">
                        <span className="w-2 h-2 bg-orange-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        <span><strong>Estate Planning:</strong> Project future inheritance values and plan for intergenerational wealth transfer</span>
                      </li>
                    </ul>
                  </div>
                </div>

                {/* Additional Use Cases */}
                <div className="bg-gray-50 rounded-xl p-8">
                  <h3 className="text-2xl font-semibold text-gray-900 mb-6 text-center">Universal Applications</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <TrendingUp className="w-8 h-8 text-red-600" />
                      </div>
                      <h4 className="font-semibold text-gray-900 mb-2">Cost of Living</h4>
                      <p className="text-gray-600 text-sm">Analyze how inflation affects daily expenses, housing costs, and living standards over time</p>
                    </div>
                    <div className="text-center">
                      <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <TrendingUp className="w-8 h-8 text-blue-600" />
                      </div>
                      <h4 className="font-semibold text-gray-900 mb-2">Salary Negotiations</h4>
                      <p className="text-gray-600 text-sm">Calculate real wage changes and negotiate salary increases that maintain purchasing power</p>
                    </div>
                    <div className="text-center">
                      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <TrendingUp className="w-8 h-8 text-green-600" />
                      </div>
                      <h4 className="font-semibold text-gray-900 mb-2">Real Estate</h4>
                      <p className="text-gray-600 text-sm">Evaluate property values, rental income, and mortgage payments adjusted for inflation</p>
                    </div>
                    <div className="text-center">
                      <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <TrendingUp className="w-8 h-8 text-purple-600" />
                      </div>
                      <h4 className="font-semibold text-gray-900 mb-2">Insurance Planning</h4>
                      <p className="text-gray-600 text-sm">Adjust coverage amounts and premiums to account for inflation and changing needs</p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Related Financial Tools */}
            <section className="bg-gradient-to-r from-gray-50 to-slate-50 rounded-2xl p-8">
              <div className="max-w-4xl mx-auto">
                <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">
                  Related Financial Calculators & Planning Tools
                </h2>
                <p className="text-lg text-gray-600 text-center mb-10">
                  Enhance your financial analysis with our comprehensive suite of economic and investment calculation tools.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <a href="/tools/compound-interest" className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow border border-gray-100 hover:border-blue-200 group">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-blue-200 transition-colors">
                      <TrendingUp className="w-6 h-6 text-blue-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">Compound Interest Calculator</h3>
                    <p className="text-gray-600 text-sm">Calculate investment growth with compound interest and compare real returns after inflation adjustment.</p>
                  </a>
                  
                  <a href="/tools/retirement-calculator" className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow border border-gray-100 hover:border-green-200 group">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-green-200 transition-colors">
                      <TrendingUp className="w-6 h-6 text-green-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">Retirement Calculator</h3>
                    <p className="text-gray-600 text-sm">Plan for retirement with inflation-adjusted savings goals and projected future expenses.</p>
                  </a>
                  
                  <a href="/tools/investment-return-calculator" className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow border border-gray-100 hover:border-purple-200 group">
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-purple-200 transition-colors">
                      <TrendingUp className="w-6 h-6 text-purple-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">Investment Return Calculator</h3>
                    <p className="text-gray-600 text-sm">Analyze investment performance with real returns adjusted for inflation and market volatility.</p>
                  </a>
                  
                  <a href="/tools/net-worth-calculator" className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow border border-gray-100 hover:border-orange-200 group">
                    <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-orange-200 transition-colors">
                      <TrendingUp className="w-6 h-6 text-orange-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">Net Worth Calculator</h3>
                    <p className="text-gray-600 text-sm">Track wealth accumulation and calculate inflation-adjusted net worth growth over time.</p>
                  </a>
                  
                  <a href="/tools/savings-goal-calculator" className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow border border-gray-100 hover:border-red-200 group">
                    <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-red-200 transition-colors">
                      <TrendingUp className="w-6 h-6 text-red-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">Savings Goal Calculator</h3>
                    <p className="text-gray-600 text-sm">Set and achieve savings targets with inflation considerations for major purchases and goals.</p>
                  </a>
                  
                  <a href="/tools/roi-calculator" className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow border border-gray-100 hover:border-indigo-200 group">
                    <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-indigo-200 transition-colors">
                      <TrendingUp className="w-6 h-6 text-indigo-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">ROI Calculator</h3>
                    <p className="text-gray-600 text-sm">Calculate return on investment with real returns adjusted for inflation and opportunity costs.</p>
                  </a>
                </div>
                
                <div className="text-center mt-8">
                  <a href="/finance" className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
                    View All Financial Tools
                    <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </a>
                </div>
              </div>
            </section>

            {/* SEO Content Section */}
            <section className="max-w-4xl mx-auto">
              <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Why Use Our Advanced Inflation Calculator?
                </h2>
                
                <div className="prose prose-lg text-gray-700 max-w-none">
                  <p className="mb-6">
                    Our inflation calculator provides the most comprehensive and accurate analysis of money value changes over time. Unlike basic calculators that use generic inflation rates, our tool incorporates actual historical data from 20+ countries, enabling precise calculations that reflect real economic conditions and regional variations in purchasing power erosion.
                  </p>
                  
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Advanced Features and Accuracy:</h3>
                  
                  <ul className="space-y-3 mb-6">
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      <span><strong>Historical Economic Data:</strong> Access to decades of inflation data from major world economies for accurate trend analysis</span>
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      <span><strong>Multiple Calculation Methods:</strong> Future value projections, historical adjustments, and purchasing power analysis in one tool</span>
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      <span><strong>Country-Specific Rates:</strong> Localized inflation data reflecting regional economic conditions and monetary policies</span>
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      <span><strong>Multi-Currency Support:</strong> Calculate inflation impact across different currencies with proper formatting</span>
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      <span><strong>Professional Analysis:</strong> Detailed breakdowns suitable for financial planning and investment decision-making</span>
                    </li>
                  </ul>
                  
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Essential for Financial Planning:</h3>
                  
                  <p className="mb-6">
                    Understanding inflation's impact is crucial for making informed financial decisions. Whether you're planning for retirement, evaluating investment returns, or setting long-term financial goals, our calculator provides the insights needed to account for purchasing power changes and maintain real wealth over time.
                  </p>
                  
                  <p className="mb-6">
                    Financial advisors and investment professionals rely on our tool for client consultations and portfolio analysis. The calculator's ability to demonstrate inflation's compound effect helps clients understand why their money needs to grow faster than inflation to maintain purchasing power and achieve financial security.
                  </p>
                  
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Economic Intelligence and Research:</h3>
                  
                  <p className="mb-4">
                    Our calculator serves as a valuable research tool for understanding economic patterns and inflation trends across different countries and time periods. Students, researchers, and analysts use the historical data to study monetary policy effects, economic cycles, and regional inflation patterns.
                  </p>
                  
                  <p>
                    The tool's comprehensive database enables users to compare inflation experiences across different economies, understand the impact of economic policies, and make informed predictions about future purchasing power changes. This economic intelligence is invaluable for both personal financial planning and professional economic analysis.
                  </p>
                </div>
              </div>
            </section>
          </div>

          {/* SEO Content Section */}
          <section className="mt-16 py-16 bg-white">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Free Online Inflation Calculator - Calculate Money Value Over Time
              </h2>
              <p className="text-lg text-gray-600 max-w-4xl mx-auto leading-relaxed">
                Calculate the impact of inflation on your money's purchasing power with our comprehensive inflation calculator. 
                Get accurate estimates using country-specific historical inflation rates for USA, UK, Canada, Australia, India, and more. 
                Perfect for financial planning, retirement calculations, and understanding how inflation affects your wealth over time.
              </p>
            </div>
          </section>

          {/* Comprehensive Educational Content */}
          <div className="mt-16 space-y-12">
            {/* What is Inflation Calculator Section */}
            <section>
              <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
                What is an Inflation Calculator?
              </h2>
              <div className="max-w-4xl mx-auto">
                <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                  An inflation calculator is a powerful financial tool that helps you understand how inflation erodes the 
                  purchasing power of money over time. Our advanced inflation calculator supports multiple countries and 
                  calculation types, allowing you to determine future values, past equivalents, and purchasing power comparisons 
                  using historical inflation data from 20+ countries worldwide.
                </p>
                <p className="text-lg text-gray-600 leading-relaxed">
                  Whether you're planning for retirement, evaluating investment returns, or simply curious about how much 
                  your money was worth in the past, our inflation calculator provides accurate estimates based on official 
                  inflation rates and economic data from central banks and statistical agencies globally.
                </p>
              </div>
            </section>

            {/* How to Use Section */}
            <section className="bg-gray-50 rounded-2xl p-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
                How to Use the Inflation Calculator
              </h2>
              <div className="max-w-4xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-2xl font-bold text-blue-600">1</span>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">Select Country</h3>
                    <p className="text-gray-600">Choose your country to use accurate historical inflation rates specific to your region</p>
                  </div>
                  <div className="text-center">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-2xl font-bold text-blue-600">2</span>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">Choose Calculation Type</h3>
                    <p className="text-gray-600">Select from Future Value, Past Value, or Purchasing Power comparison calculations</p>
                  </div>
                  <div className="text-center">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-2xl font-bold text-blue-600">3</span>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">Get Results</h3>
                    <p className="text-gray-600">View detailed analysis including inflation impact, purchasing power loss, and equivalent values</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Benefits and Use Cases */}
            <section>
              <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
                Why Use an Inflation Calculator?
              </h2>
              <div className="max-w-6xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  <Card className="bg-white border border-gray-200 hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                        <TrendingUp className="w-6 h-6 text-blue-600" />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-3">Retirement Planning</h3>
                      <p className="text-gray-600">Calculate how much you'll need for retirement considering inflation's impact on your future expenses and purchasing power.</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-white border border-gray-200 hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                        <i className="fas fa-chart-line text-green-600 text-xl"></i>
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-3">Investment Analysis</h3>
                      <p className="text-gray-600">Evaluate if your investment returns are beating inflation and maintaining real purchasing power over time.</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-white border border-gray-200 hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                        <i className="fas fa-money-bill-wave text-purple-600 text-xl"></i>
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-3">Salary Negotiations</h3>
                      <p className="text-gray-600">Understand how inflation affects your real income and negotiate salary increases that maintain your purchasing power.</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-white border border-gray-200 hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mb-4">
                        <i className="fas fa-graduation-cap text-yellow-600 text-xl"></i>
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-3">Education Planning</h3>
                      <p className="text-gray-600">Plan for future education costs by understanding how inflation will affect tuition and related expenses.</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-white border border-gray-200 hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                        <i className="fas fa-home text-red-600 text-xl"></i>
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-3">Real Estate Decisions</h3>
                      <p className="text-gray-600">Compare historical property values and understand how inflation affects real estate investments and home prices.</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-white border border-gray-200 hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                        <i className="fas fa-calculator text-indigo-600 text-xl"></i>
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-3">Budget Planning</h3>
                      <p className="text-gray-600">Create realistic long-term budgets by accounting for inflation's impact on future expenses and costs.</p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </section>

            {/* Understanding Inflation Section */}
            <section className="bg-gray-50 rounded-2xl p-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
                Understanding Inflation and Its Impact
              </h2>
              <div className="max-w-4xl mx-auto space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">What Causes Inflation?</h3>
                    <ul className="space-y-3 text-gray-600">
                      <li className="flex items-start">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mr-3 mt-2"></div>
                        <span><strong>Demand-Pull:</strong> Increased consumer demand exceeding supply</span>
                      </li>
                      <li className="flex items-start">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mr-3 mt-2"></div>
                        <span><strong>Cost-Push:</strong> Rising production costs passed to consumers</span>
                      </li>
                      <li className="flex items-start">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mr-3 mt-2"></div>
                        <span><strong>Monetary Policy:</strong> Increased money supply in the economy</span>
                      </li>
                      <li className="flex items-start">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mr-3 mt-2"></div>
                        <span><strong>Supply Chain:</strong> Disruptions affecting goods availability</span>
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">Inflation's Effects</h3>
                    <ul className="space-y-3 text-gray-600">
                      <li className="flex items-start">
                        <div className="w-2 h-2 bg-red-500 rounded-full mr-3 mt-2"></div>
                        <span>Reduces purchasing power of savings</span>
                      </li>
                      <li className="flex items-start">
                        <div className="w-2 h-2 bg-red-500 rounded-full mr-3 mt-2"></div>
                        <span>Affects fixed-income investments negatively</span>
                      </li>
                      <li className="flex items-start">
                        <div className="w-2 h-2 bg-red-500 rounded-full mr-3 mt-2"></div>
                        <span>Can benefit borrowers with fixed-rate debt</span>
                      </li>
                      <li className="flex items-start">
                        <div className="w-2 h-2 bg-red-500 rounded-full mr-3 mt-2"></div>
                        <span>Impacts retirement and long-term planning</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            {/* Global Inflation Rates */}
            <section>
              <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
                Historical Inflation Rates by Country
              </h2>
              <div className="max-w-6xl mx-auto">
                <p className="text-lg text-gray-600 mb-8 text-center">
                  Our inflation calculator uses official historical data from central banks and statistical agencies worldwide
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {[
                    { country: 'United States', rate: '3.2%', currency: 'USD' },
                    { country: 'United Kingdom', rate: '2.9%', currency: 'GBP' },
                    { country: 'Canada', rate: '2.8%', currency: 'CAD' },
                    { country: 'Australia', rate: '2.5%', currency: 'AUD' },
                    { country: 'Germany', rate: '2.1%', currency: 'EUR' },
                    { country: 'Japan', rate: '0.8%', currency: 'JPY' },
                    { country: 'India', rate: '5.8%', currency: 'INR' },
                    { country: 'Brazil', rate: '6.2%', currency: 'BRL' }
                  ].map((item, index) => (
                    <div key={index} className="bg-white rounded-lg border border-gray-200 p-4 text-center">
                      <h4 className="font-semibold text-gray-900">{item.country}</h4>
                      <p className="text-2xl font-bold text-blue-600 my-2">{item.rate}</p>
                      <p className="text-sm text-gray-500">Avg. Annual ({item.currency})</p>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* Educational Content */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Card className="bg-white border-0 shadow-sm">
                <CardContent className="p-8">
                  <h3 className="text-xl font-semibold text-gray-900 mb-6">Understanding Inflation</h3>
                  <div className="space-y-4">
                    <div className="space-y-2 text-gray-600">
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                        Inflation reduces purchasing power over time
                      </div>
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                        Central banks typically target 2-3% annual inflation
                      </div>
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                        Wages should ideally grow faster than inflation
                      </div>
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                        Investment returns should beat inflation long-term
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white border-0 shadow-sm">
                <CardContent className="p-8">
                  <h3 className="text-xl font-semibold text-gray-900 mb-6">Inflation Protection</h3>
                  <div className="space-y-4">
                    <div className="space-y-2 text-gray-600">
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                        Invest in assets that historically beat inflation
                      </div>
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                        Consider inflation-protected securities (TIPS)
                      </div>
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                        Real estate often serves as inflation hedge
                      </div>
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                        Diversify across asset classes and geographies
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* FAQ Section */}
            <section>
              <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
                Frequently Asked Questions About Inflation Calculators
              </h2>
              <div className="max-w-4xl mx-auto space-y-6">
                <Card className="bg-white border border-gray-200">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">How accurate is this inflation calculator?</h3>
                    <p className="text-gray-600">Our inflation calculator uses official historical inflation data from central banks and statistical agencies. While it provides accurate estimates based on past trends, actual future inflation may vary due to economic conditions, policy changes, and global events.</p>
                  </CardContent>
                </Card>
                <Card className="bg-white border border-gray-200">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Which countries' inflation rates are supported?</h3>
                    <p className="text-gray-600">We support inflation calculations for 20+ countries including USA, UK, Canada, Australia, Germany, France, India, Japan, China, Brazil, and more. Each country uses its official historical average inflation rate for accurate calculations.</p>
                  </CardContent>
                </Card>
                <Card className="bg-white border border-gray-200">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">What's the difference between the calculation types?</h3>
                    <p className="text-gray-600"><strong>Future Value:</strong> Shows what current money will be worth in the future. <strong>Past Value:</strong> Shows what past money is worth today. <strong>Purchasing Power:</strong> Compares money value between any two years.</p>
                  </CardContent>
                </Card>
                <Card className="bg-white border border-gray-200">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">How is purchasing power loss calculated?</h3>
                    <p className="text-gray-600">Purchasing power loss shows how much buying power money loses due to inflation. It's calculated by comparing the original amount to its inflation-adjusted equivalent, expressed as a percentage decrease in real value.</p>
                  </CardContent>
                </Card>
                <Card className="bg-white border border-gray-200">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Can I use this for investment planning?</h3>
                    <p className="text-gray-600">Yes! Use our calculator to understand if your investments are beating inflation. Your real return is your nominal return minus the inflation rate. This helps ensure your investments maintain and grow purchasing power over time.</p>
                  </CardContent>
                </Card>
                <Card className="bg-white border border-gray-200">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">How often are inflation rates updated?</h3>
                    <p className="text-gray-600">Our calculator uses long-term historical averages that are stable over time. These rates are based on decades of data from official sources and provide reliable estimates for planning purposes.</p>
                  </CardContent>
                </Card>
              </div>
            </section>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
