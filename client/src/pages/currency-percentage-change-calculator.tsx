import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface PercentageChangeResult {
  percentageChange: number;
  absoluteChange: number;
  oldValue: number;
  newValue: number;
  changeType: 'increase' | 'decrease' | 'no_change';
  currency: string;
}

export default function CurrencyPercentageChangeCalculator() {
  const [oldValue, setOldValue] = useState('1000');
  const [newValue, setNewValue] = useState('1200');
  const [currency, setCurrency] = useState('USD');
  const [result, setResult] = useState<PercentageChangeResult | null>(null);

  const currencies = [
    { code: 'USD', name: 'US Dollar', symbol: '$' },
    { code: 'EUR', name: 'Euro', symbol: '€' },
    { code: 'GBP', name: 'British Pound', symbol: '£' },
    { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
    { code: 'CNY', name: 'Chinese Yuan', symbol: '¥' },
    { code: 'INR', name: 'Indian Rupee', symbol: '₹' },
    { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$' },
    { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
    { code: 'CHF', name: 'Swiss Franc', symbol: 'CHF' },
    { code: 'SEK', name: 'Swedish Krona', symbol: 'kr' },
    { code: 'NOK', name: 'Norwegian Krone', symbol: 'kr' },
    { code: 'DKK', name: 'Danish Krone', symbol: 'kr' },
    { code: 'PLN', name: 'Polish Złoty', symbol: 'zł' },
    { code: 'CZK', name: 'Czech Koruna', symbol: 'Kč' },
    { code: 'HUF', name: 'Hungarian Forint', symbol: 'Ft' },
    { code: 'RUB', name: 'Russian Ruble', symbol: '₽' },
    { code: 'TRY', name: 'Turkish Lira', symbol: '₺' },
    { code: 'BRL', name: 'Brazilian Real', symbol: 'R$' },
    { code: 'MXN', name: 'Mexican Peso', symbol: '$' },
    { code: 'ARS', name: 'Argentine Peso', symbol: '$' },
    { code: 'KRW', name: 'South Korean Won', symbol: '₩' },
    { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$' },
    { code: 'HKD', name: 'Hong Kong Dollar', symbol: 'HK$' },
    { code: 'NZD', name: 'New Zealand Dollar', symbol: 'NZ$' },
    { code: 'ZAR', name: 'South African Rand', symbol: 'R' },
    { code: 'THB', name: 'Thai Baht', symbol: '฿' },
    { code: 'MYR', name: 'Malaysian Ringgit', symbol: 'RM' },
    { code: 'IDR', name: 'Indonesian Rupiah', symbol: 'Rp' },
    { code: 'PHP', name: 'Philippine Peso', symbol: '₱' },
    { code: 'VND', name: 'Vietnamese Dong', symbol: '₫' }
  ];

  const calculatePercentageChange = () => {
    const oldVal = parseFloat(oldValue);
    const newVal = parseFloat(newValue);

    if (isNaN(oldVal) || isNaN(newVal) || oldVal === 0) return;

    const absoluteChange = newVal - oldVal;
    const percentageChange = (absoluteChange / oldVal) * 100;
    
    let changeType: 'increase' | 'decrease' | 'no_change';
    if (percentageChange > 0) {
      changeType = 'increase';
    } else if (percentageChange < 0) {
      changeType = 'decrease';
    } else {
      changeType = 'no_change';
    }

    setResult({
      percentageChange,
      absoluteChange,
      oldValue: oldVal,
      newValue: newVal,
      changeType,
      currency
    });
  };

  const resetCalculator = () => {
    setOldValue('1000');
    setNewValue('1200');
    setCurrency('USD');
    setResult(null);
  };

  const formatCurrency = (amount: number) => {
    const currencyMap: { [key: string]: { locale: string; currency: string } } = {
      USD: { locale: 'en-US', currency: 'USD' },
      EUR: { locale: 'de-DE', currency: 'EUR' },
      GBP: { locale: 'en-GB', currency: 'GBP' },
      JPY: { locale: 'ja-JP', currency: 'JPY' },
      CNY: { locale: 'zh-CN', currency: 'CNY' },
      INR: { locale: 'en-IN', currency: 'INR' },
      CAD: { locale: 'en-CA', currency: 'CAD' },
      AUD: { locale: 'en-AU', currency: 'AUD' },
      CHF: { locale: 'de-CH', currency: 'CHF' },
      SEK: { locale: 'sv-SE', currency: 'SEK' },
      NOK: { locale: 'nb-NO', currency: 'NOK' },
      DKK: { locale: 'da-DK', currency: 'DKK' },
      PLN: { locale: 'pl-PL', currency: 'PLN' },
      CZK: { locale: 'cs-CZ', currency: 'CZK' },
      HUF: { locale: 'hu-HU', currency: 'HUF' },
      RUB: { locale: 'ru-RU', currency: 'RUB' },
      TRY: { locale: 'tr-TR', currency: 'TRY' },
      BRL: { locale: 'pt-BR', currency: 'BRL' },
      MXN: { locale: 'es-MX', currency: 'MXN' },
      ARS: { locale: 'es-AR', currency: 'ARS' },
      KRW: { locale: 'ko-KR', currency: 'KRW' },
      SGD: { locale: 'en-SG', currency: 'SGD' },
      HKD: { locale: 'zh-HK', currency: 'HKD' },
      NZD: { locale: 'en-NZ', currency: 'NZD' },
      ZAR: { locale: 'en-ZA', currency: 'ZAR' },
      THB: { locale: 'th-TH', currency: 'THB' },
      MYR: { locale: 'ms-MY', currency: 'MYR' },
      IDR: { locale: 'id-ID', currency: 'IDR' },
      PHP: { locale: 'en-PH', currency: 'PHP' },
      VND: { locale: 'vi-VN', currency: 'VND' }
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
    const sign = percentage >= 0 ? '+' : '';
    return `${sign}${percentage.toFixed(2)}%`;
  };

  const getChangeDescription = (result: PercentageChangeResult) => {
    const { percentageChange, changeType } = result;
    const absChange = Math.abs(percentageChange);
    
    if (changeType === 'no_change') {
      return "No change in value";
    } else if (changeType === 'increase') {
      return `The value increased by ${absChange.toFixed(2)}%`;
    } else {
      return `The value decreased by ${absChange.toFixed(2)}%`;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Helmet>
        <title>Currency Percentage Change Calculator - Calculate Value Changes | DapsiWow</title>
        <meta name="description" content="Free currency percentage change calculator to calculate how much a value increased or decreased in percentage. Perfect for tracking investment returns, price changes, and financial analysis with multi-currency support." />
        <meta name="keywords" content="percentage change calculator, currency percentage calculator, value change calculator, investment return calculator, price change calculator, financial calculator, percentage increase decrease" />
        <meta property="og:title" content="Currency Percentage Change Calculator - Calculate Value Changes | DapsiWow" />
        <meta property="og:description" content="Calculate percentage changes in currency values, investments, and prices. Free tool with multi-currency support for financial analysis." />
        <meta property="og:type" content="website" />
        <meta name="robots" content="index, follow" />
        <meta name="author" content="DapsiWow" />
        <link rel="canonical" href="https://dapsiwow.com/tools/currency-percentage-change-calculator" />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            "name": "Currency Percentage Change Calculator",
            "description": "Free online currency percentage change calculator to calculate how much a value increased or decreased in percentage terms.",
            "url": "https://dapsiwow.com/tools/currency-percentage-change-calculator",
            "applicationCategory": "FinanceApplication",
            "operatingSystem": "Any",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "USD"
            },
            "featureList": [
              "Calculate percentage changes",
              "Multi-currency support",
              "Investment return analysis",
              "Price change tracking",
              "Increase/decrease calculation"
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
                <span className="text-sm font-medium text-blue-700">Professional Percentage Calculator</span>
              </div>
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-slate-900 leading-tight">
                Currency Percentage
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                  Change Calculator
                </span>
              </h1>
              <p className="text-xl sm:text-2xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
                Calculate how much a value increased or decreased in percentage for investments, prices, and financial analysis
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
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">Percentage Change Configuration</h2>
                    <p className="text-gray-600">Enter the old and new values to calculate the percentage change</p>
                  </div>
                  
                  {/* Currency Selection */}
                  <div className="space-y-3">
                    <Label htmlFor="currency" className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                      Currency
                    </Label>
                    <Select value={currency} onValueChange={setCurrency}>
                      <SelectTrigger className="h-14 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-blue-500" data-testid="select-currency">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {currencies.map((curr) => (
                          <SelectItem key={curr.code} value={curr.code}>
                            {curr.code} - {curr.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Old Value */}
                    <div className="space-y-3">
                      <Label htmlFor="old-value" className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                        Original Value
                      </Label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-lg">
                          {currencies.find(c => c.code === currency)?.symbol || '$'}
                        </span>
                        <Input
                          id="old-value"
                          type="number"
                          value={oldValue}
                          onChange={(e) => setOldValue(e.target.value)}
                          className="h-14 pl-12 text-lg border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-blue-500"
                          placeholder="1,000"
                          step="0.01"
                          data-testid="input-old-value"
                        />
                      </div>
                    </div>

                    {/* New Value */}
                    <div className="space-y-3">
                      <Label htmlFor="new-value" className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                        New Value
                      </Label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-lg">
                          {currencies.find(c => c.code === currency)?.symbol || '$'}
                        </span>
                        <Input
                          id="new-value"
                          type="number"
                          value={newValue}
                          onChange={(e) => setNewValue(e.target.value)}
                          className="h-14 pl-12 text-lg border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-blue-500"
                          placeholder="1,200"
                          step="0.01"
                          data-testid="input-new-value"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-4 pt-6">
                    <Button
                      onClick={calculatePercentageChange}
                      className="flex-1 h-14 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-lg"
                      data-testid="button-calculate-percentage-change"
                    >
                      Calculate Change
                    </Button>
                    <Button
                      onClick={resetCalculator}
                      variant="outline"
                      className="h-14 px-8 border-gray-200 text-gray-600 hover:bg-gray-50 font-medium rounded-xl"
                      data-testid="button-reset"
                    >
                      Reset
                    </Button>
                  </div>
                </div>

                {/* Results Section */}
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-8 lg:p-12">
                  <h2 className="text-3xl font-bold text-gray-900 mb-8">Change Analysis</h2>
                  
                  {result ? (
                    <div className="space-y-6">
                      {/* Percentage Change Display */}
                      <div className="bg-white rounded-xl p-6 border border-gray-100">
                        <div className="text-center space-y-2">
                          <div className="text-sm text-gray-600">Percentage Change</div>
                          <div className={`text-4xl font-bold ${
                            result.changeType === 'increase' ? 'text-green-600' : 
                            result.changeType === 'decrease' ? 'text-red-600' : 'text-gray-600'
                          }`}>
                            {formatPercentage(result.percentageChange)}
                          </div>
                          <div className="text-sm text-gray-500">
                            {getChangeDescription(result)}
                          </div>
                        </div>
                      </div>

                      {/* Summary */}
                      <div className="space-y-4">
                        <div className="flex justify-between items-center py-3 border-b border-gray-200">
                          <span className="text-gray-600">Original Value</span>
                          <span className="font-semibold text-gray-900">
                            {formatCurrency(result.oldValue)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center py-3 border-b border-gray-200">
                          <span className="text-gray-600">New Value</span>
                          <span className="font-semibold text-gray-900">
                            {formatCurrency(result.newValue)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center py-3 border-b border-gray-200">
                          <span className="text-gray-600">Absolute Change</span>
                          <span className={`font-semibold ${result.absoluteChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {result.absoluteChange >= 0 ? '+' : ''}{formatCurrency(result.absoluteChange)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center py-3">
                          <span className="text-gray-600">Change Type</span>
                          <span className={`font-semibold capitalize ${
                            result.changeType === 'increase' ? 'text-green-600' : 
                            result.changeType === 'decrease' ? 'text-red-600' : 'text-gray-600'
                          }`}>
                            {result.changeType === 'no_change' ? 'No Change' : result.changeType}
                          </span>
                        </div>
                      </div>

                      {/* Interpretation */}
                      <div className="mt-8">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Interpretation</h3>
                        <div className="bg-white rounded-lg p-4 border border-gray-100">
                          <p className="text-gray-700 leading-relaxed">
                            {result.changeType === 'increase' && (
                              <>This represents a positive change, indicating growth or appreciation in value. 
                              This could be favorable for investments, assets, or revenue.</>
                            )}
                            {result.changeType === 'decrease' && (
                              <>This represents a negative change, indicating a decline or depreciation in value. 
                              This could indicate losses for investments or decreases in prices.</>
                            )}
                            {result.changeType === 'no_change' && (
                              <>The values are identical, indicating no change occurred during the measured period.</>
                            )}
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-16">
                      <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <i className="fas fa-percentage text-blue-600 text-xl"></i>
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">Ready to Calculate</h3>
                      <p className="text-gray-600">
                        Enter your original and new values to see the percentage change analysis
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* How to Use Section */}
          <div className="mt-16 bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">How to Use the Percentage Change Calculator</h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Step-by-Step Guide</h3>
                <ol className="space-y-3 text-gray-600">
                  <li className="flex items-start">
                    <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-semibold mr-3 mt-0.5">1</span>
                    <span>Select your preferred currency from the dropdown menu</span>
                  </li>
                  <li className="flex items-start">
                    <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-semibold mr-3 mt-0.5">2</span>
                    <span>Enter the original (old) value in the first field</span>
                  </li>
                  <li className="flex items-start">
                    <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-semibold mr-3 mt-0.5">3</span>
                    <span>Enter the new (current) value in the second field</span>
                  </li>
                  <li className="flex items-start">
                    <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-semibold mr-3 mt-0.5">4</span>
                    <span>Click "Calculate Change" to see the percentage change and analysis</span>
                  </li>
                </ol>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Common Use Cases</h3>
                <ul className="space-y-2 text-gray-600">
                  <li className="flex items-center">
                    <i className="fas fa-chart-line text-green-500 mr-2"></i>
                    Investment return analysis
                  </li>
                  <li className="flex items-center">
                    <i className="fas fa-shopping-cart text-blue-500 mr-2"></i>
                    Price change tracking
                  </li>
                  <li className="flex items-center">
                    <i className="fas fa-home text-orange-500 mr-2"></i>
                    Real estate value changes
                  </li>
                  <li className="flex items-center">
                    <i className="fas fa-coins text-yellow-500 mr-2"></i>
                    Currency exchange rate changes
                  </li>
                  <li className="flex items-center">
                    <i className="fas fa-building text-purple-500 mr-2"></i>
                    Business revenue growth
                  </li>
                  <li className="flex items-center">
                    <i className="fas fa-piggy-bank text-pink-500 mr-2"></i>
                    Savings account growth
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}