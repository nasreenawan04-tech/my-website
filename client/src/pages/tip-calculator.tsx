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

interface TipResult {
  billAmount: number;
  tipPercentage: number;
  tipAmount: number;
  totalAmount: number;
  perPersonTotal: number;
  perPersonTip: number;
  perPersonBill: number;
  numberOfPeople: number;
}

export default function TipCalculator() {
  const [billAmount, setBillAmount] = useState('50.00');
  const [tipPercentage, setTipPercentage] = useState('18');
  const [customTip, setCustomTip] = useState('');
  const [numberOfPeople, setNumberOfPeople] = useState('1');
  const [currency, setCurrency] = useState('USD');
  const [country, setCountry] = useState('US');
  const [calculationType, setCalculationType] = useState('percentage');
  const [serviceQuality, setServiceQuality] = useState('good');
  const [result, setResult] = useState<TipResult | null>(null);

  const countries = [
    { code: 'US', name: 'United States', currency: 'USD', tipRange: '15-20%', customTips: ['15', '18', '20', '22', '25'] },
    { code: 'CA', name: 'Canada', currency: 'CAD', tipRange: '15-20%', customTips: ['15', '18', '20', '22', '25'] },
    { code: 'UK', name: 'United Kingdom', currency: 'GBP', tipRange: '10-15%', customTips: ['10', '12', '15', '18', '20'] },
    { code: 'AU', name: 'Australia', currency: 'AUD', tipRange: '5-10%', customTips: ['5', '8', '10', '12', '15'] },
    { code: 'DE', name: 'Germany', currency: 'EUR', tipRange: '5-10%', customTips: ['5', '8', '10', '12', '15'] },
    { code: 'FR', name: 'France', currency: 'EUR', tipRange: '5-10%', customTips: ['5', '8', '10', '12', '15'] },
    { code: 'IT', name: 'Italy', currency: 'EUR', tipRange: '5-10%', customTips: ['5', '8', '10', '12', '15'] },
    { code: 'ES', name: 'Spain', currency: 'EUR', tipRange: '5-10%', customTips: ['5', '8', '10', '12', '15'] },
    { code: 'JP', name: 'Japan', currency: 'JPY', tipRange: '0%', customTips: ['0', '3', '5', '8', '10'] },
    { code: 'KR', name: 'South Korea', currency: 'KRW', tipRange: '0%', customTips: ['0', '3', '5', '8', '10'] },
    { code: 'IN', name: 'India', currency: 'INR', tipRange: '5-10%', customTips: ['5', '8', '10', '12', '15'] },
    { code: 'BR', name: 'Brazil', currency: 'BRL', tipRange: '10%', customTips: ['5', '8', '10', '12', '15'] },
    { code: 'MX', name: 'Mexico', currency: 'MXN', tipRange: '10-15%', customTips: ['10', '12', '15', '18', '20'] },
    { code: 'SG', name: 'Singapore', currency: 'SGD', tipRange: '10%', customTips: ['0', '5', '10', '12', '15'] },
    { code: 'NZ', name: 'New Zealand', currency: 'NZD', tipRange: '5-10%', customTips: ['5', '8', '10', '12', '15'] }
  ];

  const serviceQualities = {
    poor: { percentage: 10, label: 'Poor Service (10%)' },
    fair: { percentage: 12, label: 'Fair Service (12%)' },
    good: { percentage: 18, label: 'Good Service (18%)' },
    excellent: { percentage: 20, label: 'Excellent Service (20%)' },
    outstanding: { percentage: 25, label: 'Outstanding Service (25%)' }
  };

  const calculateTip = () => {
    const bill = parseFloat(billAmount);
    const people = parseInt(numberOfPeople);

    if (bill <= 0 || people <= 0) return;

    let tipPercent: number;

    if (calculationType === 'percentage') {
      tipPercent = parseFloat(tipPercentage);
    } else if (calculationType === 'custom') {
      tipPercent = parseFloat(customTip);
    } else {
      tipPercent = serviceQualities[serviceQuality as keyof typeof serviceQualities].percentage;
    }

    if (isNaN(tipPercent) || tipPercent < 0) return;

    const tipAmount = (bill * tipPercent) / 100;
    const totalAmount = bill + tipAmount;
    const perPersonTotal = totalAmount / people;
    const perPersonTip = tipAmount / people;
    const perPersonBill = bill / people;

    setResult({
      billAmount: bill,
      tipPercentage: tipPercent,
      tipAmount,
      totalAmount,
      perPersonTotal,
      perPersonTip,
      perPersonBill,
      numberOfPeople: people
    });
  };

  const resetCalculator = () => {
    setBillAmount('50.00');
    setTipPercentage('18');
    setCustomTip('');
    setNumberOfPeople('1');
    setServiceQuality('good');
    setCalculationType('percentage');
    setCurrency('USD');
    setCountry('US');
    setResult(null);
  };

  const handleCountryChange = (newCountry: string) => {
    setCountry(newCountry);
    const countryData = countries.find(c => c.code === newCountry);
    if (countryData) {
      setCurrency(countryData.currency);
      const defaultTip = countryData.customTips[2] || '15';
      setTipPercentage(defaultTip);
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
    <>
      <Helmet>
        <title>Free Tip Calculator - Calculate Tips & Split Bills Worldwide | Global Tipping Standards</title>
        <meta name="description" content="Advanced tip calculator with global tipping standards for 15+ countries. Calculate restaurant tips, split bills among groups, and learn cultural tipping etiquette. Free online tool with currency conversion and service quality assessment." />
        <meta name="keywords" content="tip calculator, gratuity calculator, bill splitter, tipping guide, restaurant tip calculator, worldwide tipping, tip percentage calculator, bill splitting calculator, tipping etiquette, service gratuity, cultural tipping standards, international tipping, group bill splitter, restaurant bill calculator, dining tip calculator" />
        <meta property="og:title" content="Free Tip Calculator - Calculate Tips & Split Bills Worldwide" />
        <meta property="og:description" content="Advanced tip calculator with global tipping standards, bill splitting, currency conversion, and service quality assessment. Perfect for travelers, students, and business professionals." />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="DapsiWow" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Free Tip Calculator - Global Tipping Standards & Bill Splitting" />
        <meta name="twitter:description" content="Calculate tips accurately with cultural intelligence. Supports 15+ countries, multiple currencies, and advanced bill splitting for any dining scenario." />
        <meta name="robots" content="index, follow" />
        <meta name="author" content="DapsiWow" />
        <link rel="canonical" href="https://dapsiwow.com/tip-calculator" />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            "name": "Tip Calculator",
            "description": "Advanced online tip calculator with global tipping standards, bill splitting, and currency conversion for restaurants and services worldwide.",
            "url": "https://toolshub.com/tools/tip-calculator",
            "applicationCategory": "FinanceApplication",
            "operatingSystem": "Web Browser",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "USD"
            },
            "featureList": [
              "Global tipping standards for 15+ countries",
              "Multi-currency support",
              "Advanced bill splitting for groups",
              "Service quality assessment",
              "Cultural tipping guidelines",
              "Expense reporting features"
            ]
          })}
        </script>
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50" data-testid="page-tip-calculator">
        <Header />

        <main>
          {/* Hero Section */}
          <section className="relative py-20 sm:py-28 lg:py-32 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-purple-600/20"></div>
            <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <div className="space-y-8">
                <div className="inline-flex items-center px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full border border-purple-200">
                  <span className="text-sm font-medium text-purple-700">Smart Tip Calculator</span>
                </div>
                <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-slate-900 leading-tight">
                  Global Tip
                  <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                    Calculator
                  </span>
                </h1>
                <p className="text-xl sm:text-2xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
                  Calculate tips and split bills with worldwide tipping standards, cultural customs, and service quality assessment
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
                        <h2 className="text-3xl font-bold text-gray-900 mb-2">Tip Configuration</h2>
                        <p className="text-gray-600">Enter your bill details and preferences for accurate tip calculations</p>
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Country Selection */}
                        <div className="space-y-3">
                          <Label className="text-sm font-semibold text-gray-800 uppercase tracking-wide">Country</Label>
                          <Select value={country} onValueChange={handleCountryChange}>
                            <SelectTrigger className="h-14 border-2 border-gray-200 rounded-xl text-lg focus:border-purple-500 focus:ring-purple-500" data-testid="select-country">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {countries.map((country) => (
                                <SelectItem key={country.code} value={country.code}>
                                  {country.name} ({country.tipRange})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <p className="text-xs text-gray-500">
                            Standard tip range: {currentCountryData.tipRange}
                          </p>
                        </div>

                        {/* Bill Amount */}
                        <div className="space-y-3">
                          <Label htmlFor="bill-amount" className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                            Bill Amount
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
                              id="bill-amount"
                              type="number"
                              value={billAmount}
                              onChange={(e) => setBillAmount(e.target.value)}
                              className="h-14 pl-8 text-lg border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-purple-500"
                              placeholder="50.00"
                              min="0"
                              step="0.01"
                              data-testid="input-bill-amount"
                            />
                          </div>
                        </div>

                        {/* Number of People */}
                        <div className="space-y-3">
                          <Label htmlFor="people" className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                            Number of People
                          </Label>
                          <Input
                            id="people"
                            type="number"
                            value={numberOfPeople}
                            onChange={(e) => setNumberOfPeople(e.target.value)}
                            className="h-14 text-lg border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-purple-500"
                            placeholder="1"
                            min="1"
                            max="50"
                            data-testid="input-people"
                          />
                        </div>

                        {/* Calculation Method */}
                        <div className="space-y-3">
                          <Label className="text-sm font-semibold text-gray-800 uppercase tracking-wide">Calculation Method</Label>
                          <Select value={calculationType} onValueChange={setCalculationType}>
                            <SelectTrigger className="h-14 border-2 border-gray-200 rounded-xl text-lg focus:border-purple-500 focus:ring-purple-500" data-testid="select-calculation-type">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="percentage">Percentage</SelectItem>
                              <SelectItem value="quality">Service Quality</SelectItem>
                              <SelectItem value="custom">Custom Amount</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      {/* Dynamic Input Based on Calculation Type */}
                      <div className="border-t border-gray-200 pt-8 space-y-6">
                        <h3 className="text-xl font-bold text-gray-900">Tip Details</h3>

                        {calculationType === 'percentage' && (
                          <div className="space-y-4">
                            <Label className="text-sm font-medium text-gray-700">Quick Tip Percentages</Label>
                            <div className="grid grid-cols-5 gap-2">
                              {currentCountryData.customTips.map((tip) => (
                                <Button
                                  key={tip}
                                  type="button"
                                  variant={tipPercentage === tip ? "default" : "outline"}
                                  className="h-12 text-sm font-medium"
                                  onClick={() => setTipPercentage(tip)}
                                  data-testid={`button-tip-${tip}`}
                                >
                                  {tip}%
                                </Button>
                              ))}
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="tip-percentage" className="text-sm font-medium text-gray-700">Custom Percentage</Label>
                              <div className="relative">
                                <Input
                                  id="tip-percentage"
                                  type="number"
                                  value={tipPercentage}
                                  onChange={(e) => setTipPercentage(e.target.value)}
                                  className="h-12 pr-8 text-lg border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-purple-500"
                                  placeholder="18"
                                  min="0"
                                  max="100"
                                  step="0.1"
                                  data-testid="input-tip-percentage"
                                />
                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 text-lg">%</span>
                              </div>
                            </div>
                          </div>
                        )}

                        {calculationType === 'quality' && (
                          <div className="space-y-2">
                            <Label className="text-sm font-medium text-gray-700">Service Quality</Label>
                            <Select value={serviceQuality} onValueChange={setServiceQuality}>
                              <SelectTrigger className="h-12 border-2 border-gray-200 rounded-xl text-lg focus:border-purple-500 focus:ring-purple-500" data-testid="select-service-quality">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {Object.entries(serviceQualities).map(([key, value]) => (
                                  <SelectItem key={key} value={key}>
                                    {value.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        )}

                        {calculationType === 'custom' && (
                          <div className="space-y-2">
                            <Label htmlFor="custom-tip" className="text-sm font-medium text-gray-700">Custom Tip Percentage</Label>
                            <div className="relative">
                              <Input
                                id="custom-tip"
                                type="number"
                                value={customTip}
                                onChange={(e) => setCustomTip(e.target.value)}
                                className="h-12 pr-8 text-lg border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-purple-500"
                                placeholder="15.5"
                                min="0"
                                max="100"
                                step="0.1"
                                data-testid="input-custom-tip"
                              />
                              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 text-lg">%</span>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-4 pt-6">
                        <Button
                          onClick={calculateTip}
                          className="flex-1 h-14 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold text-lg rounded-xl shadow-lg"
                          data-testid="button-calculate"
                        >
                          Calculate Tip
                        </Button>
                        <Button
                          onClick={resetCalculator}
                          variant="outline"
                          className="h-14 px-8 border-2 border-gray-200 text-gray-600 hover:bg-gray-50 font-semibold text-lg rounded-xl"
                          data-testid="button-reset"
                        >
                          Reset
                        </Button>
                      </div>
                    </div>

                    {/* Results Section */}
                    <div className="xl:col-span-2 bg-gradient-to-br from-blue-50 to-purple-50 p-8 lg:p-12">
                      <div className="sticky top-8">
                        <h2 className="text-3xl font-bold text-gray-900 mb-8">Tip Breakdown</h2>

                        {result ? (
                          <div className="space-y-6">
                            {/* Main Results */}
                            <div className="grid grid-cols-1 gap-4">
                              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                                <div className="text-center space-y-2">
                                  <div className="text-sm text-gray-600 uppercase tracking-wide font-medium">Tip Amount</div>
                                  <div className="text-3xl font-bold text-green-600">
                                    {formatCurrency(result.tipAmount)}
                                  </div>
                                </div>
                              </div>
                              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                                <div className="text-center space-y-2">
                                  <div className="text-sm text-gray-600 uppercase tracking-wide font-medium">Total Amount</div>
                                  <div className="text-3xl font-bold text-blue-600">
                                    {formatCurrency(result.totalAmount)}
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Bill Summary */}
                            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 space-y-4">
                              <h3 className="text-lg font-bold text-gray-900">Summary</h3>

                              <div className="space-y-3">
                                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                                  <span className="text-gray-600">Original Bill</span>
                                  <span className="font-semibold text-gray-900">
                                    {formatCurrency(result.billAmount)}
                                  </span>
                                </div>
                                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                                  <span className="text-gray-600">Tip ({result.tipPercentage}%)</span>
                                  <span className="font-semibold text-green-600">
                                    +{formatCurrency(result.tipAmount)}
                                  </span>
                                </div>
                                <div className="flex justify-between items-center py-2">
                                  <span className="text-gray-900 font-bold">Total</span>
                                  <span className="font-bold text-blue-600 text-lg">
                                    {formatCurrency(result.totalAmount)}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Per Person Breakdown */}
                            {result.numberOfPeople > 1 && (
                              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 space-y-4">
                                <h3 className="text-lg font-bold text-gray-900">
                                  Per Person ({result.numberOfPeople} people)
                                </h3>
                                <div className="space-y-3">
                                  <div className="flex justify-between items-center text-sm">
                                    <span className="text-gray-600">Bill per person</span>
                                    <span className="font-medium text-gray-900">
                                      {formatCurrency(result.perPersonBill)}
                                    </span>
                                  </div>
                                  <div className="flex justify-between items-center text-sm">
                                    <span className="text-gray-600">Tip per person</span>
                                    <span className="font-medium text-green-600">
                                      {formatCurrency(result.perPersonTip)}
                                    </span>
                                  </div>
                                  <div className="flex justify-between items-center py-2 border-t border-gray-100">
                                    <span className="text-gray-900 font-bold">Total per person</span>
                                    <span className="font-bold text-blue-600">
                                      {formatCurrency(result.perPersonTotal)}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="text-center py-12">
                            <div className="w-24 h-24 bg-gray-200 rounded-full mx-auto mb-6 flex items-center justify-center">
                              <span className="text-3xl text-gray-400">$</span>
                            </div>
                            <p className="text-gray-500 text-lg">Enter bill details to calculate your tip</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* SEO Content Section */}
          <section className="py-20 bg-white">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="space-y-16">

                {/* Main Content */}
                <div className="prose prose-lg max-w-none">
                  <h2 className="text-4xl font-bold text-gray-900 mb-8 text-center">
                    Complete Guide to Tipping: Cultural Standards and Best Practices
                  </h2>

                  <div className="text-xl text-gray-700 leading-relaxed space-y-6">
                    <p>
                      Understanding proper tipping etiquette is essential in today's global dining and service culture. Our comprehensive tip calculator goes beyond simple percentage calculations to provide culturally-aware guidance that respects local customs while ensuring fair compensation for service providers. Whether you're a frequent traveler, business professional, or simply someone who dines out regularly, knowing how to tip appropriately demonstrates cultural awareness and social responsibility.
                    </p>

                    <p>
                      Tipping practices vary dramatically across different countries and cultures, making it challenging to navigate without proper guidance. In the United States and Canada, tipping 18-22% at restaurants is considered standard for good service, while in many European countries like Germany and France, tipping 5-10% is more common due to higher base wages for service workers. Some countries like Japan traditionally discourage tipping altogether, viewing exceptional service as an inherent part of professional duty rather than something requiring additional compensation.
                    </p>

                    <p>
                      Our advanced tip calculator incorporates these cultural nuances, automatically adjusting suggested tip ranges based on your selected country. This feature is particularly valuable for international travelers who want to avoid the embarrassment of over-tipping or under-tipping due to unfamiliarity with local customs. The calculator also accounts for different service scenarios, from casual dining to fine dining establishments, each with their own tipping expectations and standards.
                    </p>
                  </div>
                </div>

                {/* Features Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Global Standards</h3>
                    <p className="text-gray-700">
                      Pre-configured tipping standards for 15+ countries, ensuring you always tip appropriately regardless of your location. Includes currency conversion and local customs guidance for seamless international dining experiences.
                    </p>
                  </div>

                  <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Smart Bill Splitting</h3>
                    <p className="text-gray-700">
                      Advanced bill splitting functionality that calculates individual contributions including tip portions. Perfect for group dining, business meals, and social gatherings where accurate cost division is essential.
                    </p>
                  </div>

                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Service Quality Assessment</h3>
                    <p className="text-gray-700">
                      Built-in service quality evaluation system that suggests appropriate tip percentages based on your dining experience, from basic service to exceptional hospitality that exceeds expectations.
                    </p>
                  </div>
                </div>

                {/* Detailed Content */}
                <div className="prose prose-lg max-w-none">
                  <h3 className="text-3xl font-bold text-gray-900 mb-6">Understanding Tipping Psychology and Economics</h3>

                  <div className="text-lg text-gray-700 leading-relaxed space-y-6">
                    <p>
                      The practice of tipping serves multiple economic and social functions beyond simple gratuity. Research in behavioral economics shows that tipping can significantly impact service quality, as servers and service providers often adjust their attention and care based on expected gratuity. This creates a feedback loop where excellent service leads to better tips, which in turn motivates continued high-quality service delivery.
                    </p>

                    <p>
                      From an economic perspective, tipping allows restaurants and service businesses to maintain lower base wages while enabling servers to earn income proportional to their performance and customer satisfaction levels. This model incentivizes exceptional customer service and creates opportunities for skilled service professionals to earn substantially more than fixed-wage positions. However, it also creates income variability that some workers find challenging to manage.
                    </p>

                    <p>
                      Cultural attitudes toward tipping also reflect broader social values about work, compensation, and customer-service provider relationships. In tip-encouraged cultures, gratuity represents appreciation for personalized service and recognition of individual effort. In contrast, cultures that discourage tipping often emphasize professional service as a standard expectation rather than an exceptional effort deserving additional compensation.
                    </p>
                  </div>
                </div>

                {/* Industry-Specific Guidelines */}
                <div className="bg-gray-50 rounded-2xl p-8">
                  <h3 className="text-3xl font-bold text-gray-900 mb-8 text-center">Industry-Specific Tipping Guidelines</h3>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div>
                      <h4 className="text-xl font-bold text-gray-900 mb-4">Restaurant and Food Service</h4>
                      <div className="space-y-3 text-gray-700">
                        <p><strong>Fine Dining:</strong> 20-25% for exceptional service, complex meal preparation, and attentive table service throughout extended dining experiences.</p>
                        <p><strong>Casual Dining:</strong> 15-20% for standard table service, order taking, food delivery, and basic customer interaction in family-style restaurants.</p>
                        <p><strong>Fast Casual:</strong> 10-15% or tip jar contributions for counter service, food preparation, and minimal table interaction in quick-service establishments.</p>
                        <p><strong>Delivery Services:</strong> 15-20% plus consideration for distance, weather conditions, and delivery complexity, with minimum amounts for small orders.</p>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-xl font-bold text-gray-900 mb-4">Personal and Professional Services</h4>
                      <div className="space-y-3 text-gray-700">
                        <p><strong>Hair and Beauty Services:</strong> 15-25% for stylists, colorists, and beauty professionals, with higher percentages for specialized services and long-term client relationships.</p>
                        <p><strong>Transportation:</strong> 15-20% for taxi and rideshare services, with adjustments for traffic conditions, route efficiency, and vehicle cleanliness.</p>
                        <p><strong>Hotel Services:</strong> Variable rates for housekeeping, concierge, room service, and bellhop services, typically ranging from fixed amounts to percentage-based gratuities.</p>
                        <p><strong>Spa and Wellness:</strong> 18-22% for massage therapists, estheticians, and wellness professionals providing personal care and therapeutic services.</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Best Practices */}
                <div className="prose prose-lg max-w-none">
                  <h3 className="text-3xl font-bold text-gray-900 mb-6">Tipping Best Practices and Digital Age Considerations</h3>

                  <div className="text-lg text-gray-700 leading-relaxed space-y-6">
                    <p>
                      Modern payment technology has transformed tipping practices, with digital payment systems, mobile apps, and contactless transactions becoming increasingly common. Many point-of-sale systems now prompt for tip amounts, sometimes suggesting percentages that may exceed traditional norms. It's important to evaluate these suggestions against actual service quality rather than feeling pressured by default options that may not reflect appropriate gratuity levels.
                    </p>

                    <p>
                      When using our tip calculator, consider factors beyond the base bill amount, including service complexity, time spent, special accommodations, and overall satisfaction with your experience. For group dining situations, ensure that tip calculations account for shared appetizers, beverages, and any special dietary accommodations that required additional server attention. Our calculator's bill-splitting feature helps ensure equitable contribution from all participants while maintaining appropriate overall gratuity levels.
                    </p>

                    <p>
                      Cash versus digital tipping can also impact how much of your gratuity actually reaches service providers. Cash tips typically go directly to servers, while digital tips may be subject to processing fees, delayed distribution, or pooling arrangements. When possible, consider asking about establishment policies regarding tip distribution to ensure your gratuity reaches intended recipients in the most beneficial manner.
                    </p>

                    <p>
                      Finally, remember that tipping is ultimately about recognizing good service and supporting service industry workers who often depend on gratuities as a significant portion of their income. Our calculator provides guidance based on established norms and cultural standards, but your personal experience and satisfaction should always inform final tipping decisions. Exceptional service deserves recognition, while consistently poor service may warrant reduced gratuities along with constructive feedback to management.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </main>

        <Footer />
      </div>
    </>
  );
}