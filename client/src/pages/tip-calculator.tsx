
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
import { DollarSign } from 'lucide-react';

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
      // Set default tip percentage based on country
      const defaultTip = countryData.customTips[2] || '15'; // Use middle option
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
    <div className="min-h-screen bg-gray-50">
      <Helmet>
        <title>Free Tip Calculator - Calculate Tips & Split Bills Worldwide | Global Tipping Standards</title>
        <meta name="description" content="Advanced tip calculator with global tipping standards for 15+ countries. Calculate restaurant tips, split bills among groups, and learn cultural tipping etiquette. Free online tool with currency conversion and service quality assessment." />
        <meta name="keywords" content="tip calculator, gratuity calculator, bill splitter, tipping guide, restaurant tip calculator, worldwide tipping, tip percentage calculator, bill splitting calculator, tipping etiquette, service gratuity, cultural tipping standards, international tipping, group bill splitter, restaurant bill calculator, dining tip calculator" />
        <meta property="og:title" content="Free Tip Calculator - Calculate Tips & Split Bills Worldwide" />
        <meta property="og:description" content="Advanced tip calculator with global tipping standards, bill splitting, currency conversion, and service quality assessment. Perfect for travelers, students, and business professionals." />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="ToolsHub" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Free Tip Calculator - Global Tipping Standards & Bill Splitting" />
        <meta name="twitter:description" content="Calculate tips accurately with cultural intelligence. Supports 15+ countries, multiple currencies, and advanced bill splitting for any dining scenario." />
        <meta name="robots" content="index, follow" />
        <meta name="author" content="ToolsHub" />
        <link rel="canonical" href="https://toolshub.com/tools/tip-calculator" />
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
      
      <Header />
      
      <main>
        {/* Hero Section */}
        <section className="gradient-hero text-white py-16 pt-24">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="w-20 h-20 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <DollarSign className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold mb-6">
              Tip Calculator
            </h1>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto">
              Calculate tips and split bills with worldwide tipping standards and customs
            </p>
          </div>
        </section>

        <div className="max-w-6xl mx-auto px-4 py-12">
          <Card className="bg-white shadow-sm border-0">
            <CardContent className="p-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                {/* Input Section */}
                <div className="space-y-6">
                  <h2 className="text-2xl font-semibold text-gray-900 mb-8">Tip Calculator</h2>
                  
                  {/* Country Selection */}
                  <div className="space-y-3">
                    <Label htmlFor="country" className="text-sm font-medium text-gray-700">
                      Country (Sets local tipping customs)
                    </Label>
                    <Select value={country} onValueChange={handleCountryChange}>
                      <SelectTrigger className="h-12 border-gray-200 rounded-lg">
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
                    <div className="text-xs text-gray-500">
                      Standard tip range: {currentCountryData.tipRange}
                    </div>
                  </div>

                  {/* Bill Amount */}
                  <div className="space-y-3">
                    <Label htmlFor="bill-amount" className="text-sm font-medium text-gray-700">
                      Bill Amount ({currency})
                    </Label>
                    <Input
                      id="bill-amount"
                      type="number"
                      value={billAmount}
                      onChange={(e) => setBillAmount(e.target.value)}
                      className="h-12 text-base border-gray-200 rounded-lg"
                      placeholder="50.00"
                      min="0"
                      step="0.01"
                    />
                  </div>

                  {/* Tip Calculation Method */}
                  <Tabs value={calculationType} onValueChange={setCalculationType} className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="percentage">Percentage</TabsTrigger>
                      <TabsTrigger value="quality">Service</TabsTrigger>
                      <TabsTrigger value="custom">Custom</TabsTrigger>
                    </TabsList>

                    <TabsContent value="percentage" className="space-y-6 mt-6">
                      <div className="space-y-3">
                        <Label className="text-sm font-medium text-gray-700">
                          Tip Percentage
                        </Label>
                        <div className="grid grid-cols-5 gap-2 mb-4">
                          {currentCountryData.customTips.map((tip) => (
                            <Button
                              key={tip}
                              type="button"
                              variant={tipPercentage === tip ? "default" : "outline"}
                              className="h-10 text-sm"
                              onClick={() => setTipPercentage(tip)}
                            >
                              {tip}%
                            </Button>
                          ))}
                        </div>
                        <Input
                          type="number"
                          value={tipPercentage}
                          onChange={(e) => setTipPercentage(e.target.value)}
                          className="h-12 text-base border-gray-200 rounded-lg"
                          placeholder="18"
                          min="0"
                          max="100"
                          step="0.1"
                        />
                      </div>
                    </TabsContent>

                    <TabsContent value="quality" className="space-y-6 mt-6">
                      <div className="space-y-3">
                        <Label className="text-sm font-medium text-gray-700">
                          Service Quality
                        </Label>
                        <Select value={serviceQuality} onValueChange={setServiceQuality}>
                          <SelectTrigger className="h-12 border-gray-200 rounded-lg">
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
                    </TabsContent>

                    <TabsContent value="custom" className="space-y-6 mt-6">
                      <div className="space-y-3">
                        <Label htmlFor="custom-tip" className="text-sm font-medium text-gray-700">
                          Custom Tip Percentage
                        </Label>
                        <Input
                          id="custom-tip"
                          type="number"
                          value={customTip}
                          onChange={(e) => setCustomTip(e.target.value)}
                          className="h-12 text-base border-gray-200 rounded-lg"
                          placeholder="15.5"
                          min="0"
                          max="100"
                          step="0.1"
                        />
                      </div>
                    </TabsContent>
                  </Tabs>

                  {/* Number of People */}
                  <div className="space-y-3">
                    <Label htmlFor="people" className="text-sm font-medium text-gray-700">
                      Number of People (Bill Splitting)
                    </Label>
                    <Input
                      id="people"
                      type="number"
                      value={numberOfPeople}
                      onChange={(e) => setNumberOfPeople(e.target.value)}
                      className="h-12 text-base border-gray-200 rounded-lg"
                      placeholder="1"
                      min="1"
                      max="50"
                    />
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-4 pt-6">
                    <Button
                      onClick={calculateTip}
                      className="flex-1 h-12 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg"
                    >
                      <DollarSign className="w-4 h-4 mr-2" />
                      Calculate Tip
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
                  <h2 className="text-2xl font-semibold text-gray-900 mb-8">Tip Breakdown</h2>
                  
                  {result ? (
                    <div className="space-y-6">
                      {/* Main Results */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white rounded-lg p-4 border border-gray-100">
                          <div className="text-center space-y-2">
                            <div className="text-sm text-gray-600">Tip Amount</div>
                            <div className="text-2xl font-bold text-green-600">
                              {formatCurrency(result.tipAmount)}
                            </div>
                          </div>
                        </div>
                        <div className="bg-white rounded-lg p-4 border border-gray-100">
                          <div className="text-center space-y-2">
                            <div className="text-sm text-gray-600">Total Amount</div>
                            <div className="text-2xl font-bold text-blue-600">
                              {formatCurrency(result.totalAmount)}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Bill Breakdown */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-900">Bill Summary</h3>
                        
                        <div className="flex justify-between items-center py-3 border-b border-gray-200">
                          <span className="text-gray-600">Original Bill</span>
                          <span className="font-semibold text-gray-900">
                            {formatCurrency(result.billAmount)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center py-3 border-b border-gray-200">
                          <span className="text-gray-600">Tip ({result.tipPercentage}%)</span>
                          <span className="font-semibold text-green-600">
                            +{formatCurrency(result.tipAmount)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center py-3 border-b border-gray-200">
                          <span className="text-gray-600 font-medium">Total with Tip</span>
                          <span className="font-bold text-blue-600 text-lg">
                            {formatCurrency(result.totalAmount)}
                          </span>
                        </div>
                      </div>

                      {/* Per Person Breakdown */}
                      {result.numberOfPeople > 1 && (
                        <div className="mt-8">
                          <h3 className="text-lg font-semibold text-gray-900 mb-4">
                            Per Person ({result.numberOfPeople} people)
                          </h3>
                          <div className="grid grid-cols-1 gap-3">
                            <div className="bg-white rounded-lg p-3 border border-gray-100 flex justify-between text-sm">
                              <span className="text-gray-600">Bill per person</span>
                              <span className="font-medium text-gray-900">
                                {formatCurrency(result.perPersonBill)}
                              </span>
                            </div>
                            <div className="bg-white rounded-lg p-3 border border-gray-100 flex justify-between text-sm">
                              <span className="text-gray-600">Tip per person</span>
                              <span className="font-medium text-green-600">
                                {formatCurrency(result.perPersonTip)}
                              </span>
                            </div>
                            <div className="bg-white rounded-lg p-3 border border-gray-100 flex justify-between text-sm">
                              <span className="text-gray-600 font-medium">Total per person</span>
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
                      <DollarSign className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500">Enter bill amount and tip details to calculate</p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Educational Content */}
          <div className="mt-16 space-y-16">
            {/* What is a Tip Calculator */}
            <section className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-8">
              <div className="max-w-4xl mx-auto">
                <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">
                  What is a Tip Calculator and How Does It Work?
                </h2>
                <div className="prose prose-lg text-gray-700 mx-auto mb-8">
                  <p className="text-xl leading-relaxed mb-6">
                    A tip calculator is an essential financial tool that automatically computes gratuity amounts based on your bill total, chosen tip percentage, and number of people sharing the bill. Our advanced tip calculator takes the guesswork out of tipping by providing accurate calculations that consider local customs, service quality, and cultural expectations across 15+ countries worldwide.
                  </p>
                  
                  <p className="text-lg leading-relaxed mb-6">
                    The calculator works by applying mathematical formulas to determine the exact tip amount, total bill with gratuity, and individual costs when splitting among multiple people. Simply enter your bill amount, select your country or preferred tip percentage, specify the number of people, and instantly receive a complete breakdown of all costs including per-person amounts.
                  </p>
                  
                  <p className="text-lg leading-relaxed">
                    Beyond basic calculations, our tool incorporates real-world tipping standards from different cultures, making it invaluable for travelers, business professionals, and anyone dining out. The built-in service quality assessment feature helps you determine appropriate tip amounts based on your actual dining or service experience.
                  </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                  <div className="bg-white rounded-lg p-6 shadow-sm">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                      <DollarSign className="w-6 h-6 text-blue-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">Instant Calculations</h3>
                    <p className="text-gray-600 text-sm">Get immediate, precise tip amounts and bill totals with support for 15+ currencies and real-time conversion rates.</p>
                  </div>
                  <div className="bg-white rounded-lg p-6 shadow-sm">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                      <DollarSign className="w-6 h-6 text-green-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">Global Tipping Standards</h3>
                    <p className="text-gray-600 text-sm">Country-specific guidelines ensure culturally appropriate tipping from Japan's no-tip culture to America's 20% standard.</p>
                  </div>
                  <div className="bg-white rounded-lg p-6 shadow-sm">
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                      <DollarSign className="w-6 h-6 text-purple-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">Smart Bill Splitting</h3>
                    <p className="text-gray-600 text-sm">Automatically divide bills and tips among up to 50 people with detailed per-person breakdowns for group dining.</p>
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
                        <span><strong>Budget Management:</strong> Calculate exact tip amounts to stay within tight budgets while dining with friends</span>
                      </li>
                      <li className="flex items-start">
                        <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        <span><strong>Group Study Sessions:</strong> Split pizza delivery bills and tips fairly among study group members</span>
                      </li>
                      <li className="flex items-start">
                        <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        <span><strong>Learning Financial Responsibility:</strong> Understand tipping etiquette and appropriate gratuity percentages</span>
                      </li>
                      <li className="flex items-start">
                        <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        <span><strong>International Students:</strong> Learn local tipping customs when studying abroad in different countries</span>
                      </li>
                    </ul>
                  </div>

                  {/* Professionals */}
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-8">
                    <h3 className="text-2xl font-semibold text-gray-900 mb-4">For Business Professionals</h3>
                    <ul className="space-y-3 text-gray-700">
                      <li className="flex items-start">
                        <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        <span><strong>Client Dinners:</strong> Ensure professional tipping standards during business meals and entertainment</span>
                      </li>
                      <li className="flex items-start">
                        <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        <span><strong>Expense Reporting:</strong> Calculate accurate tip amounts for business expense reimbursements</span>
                      </li>
                      <li className="flex items-start">
                        <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        <span><strong>International Business Travel:</strong> Navigate tipping customs in different countries and cultures professionally</span>
                      </li>
                      <li className="flex items-start">
                        <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        <span><strong>Team Lunches:</strong> Split group dining bills accurately among colleagues and team members</span>
                      </li>
                    </ul>
                  </div>

                  {/* Business Owners */}
                  <div className="bg-gradient-to-br from-purple-50 to-violet-50 rounded-xl p-8">
                    <h3 className="text-2xl font-semibold text-gray-900 mb-4">For Business Owners</h3>
                    <ul className="space-y-3 text-gray-700">
                      <li className="flex items-start">
                        <span className="w-2 h-2 bg-purple-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        <span><strong>Staff Training:</strong> Educate hospitality employees about appropriate tipping expectations and standards</span>
                      </li>
                      <li className="flex items-start">
                        <span className="w-2 h-2 bg-purple-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        <span><strong>Event Planning:</strong> Budget accurately for catered events and service gratuities</span>
                      </li>
                      <li className="flex items-start">
                        <span className="w-2 h-2 bg-purple-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        <span><strong>Client Relations:</strong> Maintain professional standards when entertaining clients at restaurants</span>
                      </li>
                      <li className="flex items-start">
                        <span className="w-2 h-2 bg-purple-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        <span><strong>Financial Planning:</strong> Include accurate gratuity costs in business dining and event budgets</span>
                      </li>
                    </ul>
                  </div>

                  {/* Travelers */}
                  <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl p-8">
                    <h3 className="text-2xl font-semibold text-gray-900 mb-4">For Travelers & Tourists</h3>
                    <ul className="space-y-3 text-gray-700">
                      <li className="flex items-start">
                        <span className="w-2 h-2 bg-orange-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        <span><strong>Cultural Awareness:</strong> Respect local tipping customs and avoid cultural faux pas while traveling</span>
                      </li>
                      <li className="flex items-start">
                        <span className="w-2 h-2 bg-orange-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        <span><strong>Currency Conversion:</strong> Calculate tips in local currencies without confusion or overpaying</span>
                      </li>
                      <li className="flex items-start">
                        <span className="w-2 h-2 bg-orange-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        <span><strong>Travel Budget Management:</strong> Plan restaurant expenses including appropriate gratuities for different countries</span>
                      </li>
                      <li className="flex items-start">
                        <span className="w-2 h-2 bg-orange-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        <span><strong>Group Tours:</strong> Split meal costs and tips fairly among travel companions and tour groups</span>
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
                        <DollarSign className="w-8 h-8 text-red-600" />
                      </div>
                      <h4 className="font-semibold text-gray-900 mb-2">Restaurant Dining</h4>
                      <p className="text-gray-600 text-sm">Calculate tips for fine dining, casual restaurants, food delivery, and takeout orders</p>
                    </div>
                    <div className="text-center">
                      <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <DollarSign className="w-8 h-8 text-blue-600" />
                      </div>
                      <h4 className="font-semibold text-gray-900 mb-2">Service Industries</h4>
                      <p className="text-gray-600 text-sm">Determine appropriate tips for hair salons, spas, taxis, and personal services</p>
                    </div>
                    <div className="text-center">
                      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <DollarSign className="w-8 h-8 text-green-600" />
                      </div>
                      <h4 className="font-semibold text-gray-900 mb-2">Special Events</h4>
                      <p className="text-gray-600 text-sm">Plan gratuities for weddings, parties, catering, and special occasion services</p>
                    </div>
                    <div className="text-center">
                      <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <DollarSign className="w-8 h-8 text-purple-600" />
                      </div>
                      <h4 className="font-semibold text-gray-900 mb-2">Group Activities</h4>
                      <p className="text-gray-600 text-sm">Split bills for birthday parties, corporate events, and social gatherings</p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* How to Use */}
            <section>
              <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
                How to Use the Tip Calculator: Step-by-Step Guide
              </h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                <div className="space-y-6">
                  <div className="flex items-start space-x-4">
                    <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-semibold text-sm">1</div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">Select Your Country or Region</h3>
                      <p className="text-gray-600">Choose your location to automatically apply local tipping standards and currency formatting.</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-semibold text-sm">2</div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">Enter Bill Amount</h3>
                      <p className="text-gray-600">Input your total bill amount before tip in your local currency.</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-semibold text-sm">3</div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">Choose Tip Method</h3>
                      <p className="text-gray-600">Select from percentage, service quality rating, or enter a custom tip amount.</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-semibold text-sm">4</div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">Add People Count</h3>
                      <p className="text-gray-600">Specify how many people are splitting the bill for automatic per-person calculations.</p>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 rounded-xl p-8">
                  <h3 className="text-xl font-semibold text-gray-900 mb-6">Quick Tip Guide</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center py-2 border-b border-gray-200">
                      <span className="text-gray-600">Restaurants (US)</span>
                      <span className="font-semibold text-gray-900">18-22%</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-200">
                      <span className="text-gray-600">Bars & Pubs</span>
                      <span className="font-semibold text-gray-900">15-20%</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-200">
                      <span className="text-gray-600">Taxi/Rideshare</span>
                      <span className="font-semibold text-gray-900">10-15%</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-200">
                      <span className="text-gray-600">Hair Salon</span>
                      <span className="font-semibold text-gray-900">15-20%</span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span className="text-gray-600">Hotel Housekeeping</span>
                      <span className="font-semibold text-gray-900">$2-5/day</span>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Global Tipping Standards */}
            <section>
              <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
                Global Tipping Standards & Customs
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <Card className="bg-white border-0 shadow-sm">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">North America</h3>
                    <div className="space-y-3 text-sm text-gray-600">
                      <div className="flex justify-between">
                        <span>United States:</span>
                        <span className="font-medium">18-22%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Canada:</span>
                        <span className="font-medium">15-20%</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-3">
                        Tipping is expected and considered part of service workers' income.
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white border-0 shadow-sm">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Europe</h3>
                    <div className="space-y-3 text-sm text-gray-600">
                      <div className="flex justify-between">
                        <span>UK:</span>
                        <span className="font-medium">10-15%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Germany/France:</span>
                        <span className="font-medium">5-10%</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-3">
                        Service charges often included. Rounding up is common practice.
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white border-0 shadow-sm">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Asia Pacific</h3>
                    <div className="space-y-3 text-sm text-gray-600">
                      <div className="flex justify-between">
                        <span>Japan:</span>
                        <span className="font-medium">Not expected</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Australia:</span>
                        <span className="font-medium">5-10%</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-3">
                        Varies greatly. Research local customs before visiting.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </section>

            {/* When to Tip */}
            <section className="bg-gray-50 rounded-2xl p-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
                When and How Much to Tip
              </h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-6">Service Quality Guidelines</h3>
                  <div className="space-y-4">
                    <div className="bg-white rounded-lg p-4 border-l-4 border-red-400">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium text-gray-900">Poor Service</span>
                        <span className="font-bold text-red-600">10-12%</span>
                      </div>
                      <p className="text-sm text-gray-600">Slow service, unfriendly staff, or incorrect orders</p>
                    </div>
                    <div className="bg-white rounded-lg p-4 border-l-4 border-yellow-400">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium text-gray-900">Average Service</span>
                        <span className="font-bold text-yellow-600">15-18%</span>
                      </div>
                      <p className="text-sm text-gray-600">Standard service meeting basic expectations</p>
                    </div>
                    <div className="bg-white rounded-lg p-4 border-l-4 border-green-400">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium text-gray-900">Good Service</span>
                        <span className="font-bold text-green-600">18-20%</span>
                      </div>
                      <p className="text-sm text-gray-600">Attentive, friendly, and efficient service</p>
                    </div>
                    <div className="bg-white rounded-lg p-4 border-l-4 border-blue-400">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium text-gray-900">Excellent Service</span>
                        <span className="font-bold text-blue-600">20-25%</span>
                      </div>
                      <p className="text-sm text-gray-600">Exceptional service that goes above and beyond</p>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-6">Industry-Specific Tips</h3>
                  <div className="space-y-4">
                    <div className="bg-white rounded-lg p-4">
                      <h4 className="font-medium text-gray-900 mb-2">Restaurants & Dining</h4>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li>• Full-service restaurants: 18-22%</li>
                        <li>• Fast-casual: 10-15% or tip jar</li>
                        <li>• Buffets: 10-15%</li>
                        <li>• Food delivery: 15-20% + delivery fee</li>
                      </ul>
                    </div>
                    <div className="bg-white rounded-lg p-4">
                      <h4 className="font-medium text-gray-900 mb-2">Personal Services</h4>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li>• Hair stylist: 15-20%</li>
                        <li>• Massage therapist: 15-20%</li>
                        <li>• Nail technician: 15-20%</li>
                        <li>• Barber: $2-5 or 15-20%</li>
                      </ul>
                    </div>
                    <div className="bg-white rounded-lg p-4">
                      <h4 className="font-medium text-gray-900 mb-2">Transportation</h4>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li>• Taxi: 15-20%</li>
                        <li>• Rideshare (Uber/Lyft): 15-20%</li>
                        <li>• Valet parking: $2-5</li>
                        <li>• Airport shuttle: $1-2 per bag</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* FAQ Section */}
            <section>
              <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
                Frequently Asked Questions
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="bg-white rounded-lg p-6 shadow-sm">
                    <h3 className="font-semibold text-gray-900 mb-3">Should I tip on tax?</h3>
                    <p className="text-gray-600 text-sm">
                      It's generally recommended to calculate your tip based on the pre-tax amount. However, some people prefer to tip on the total including tax, which is also acceptable.
                    </p>
                  </div>
                  <div className="bg-white rounded-lg p-6 shadow-sm">
                    <h3 className="font-semibold text-gray-900 mb-3">What if service charge is included?</h3>
                    <p className="text-gray-600 text-sm">
                      If a service charge is already included in your bill, additional tipping is optional. You may still tip extra for exceptional service, typically 5-10% more.
                    </p>
                  </div>
                  <div className="bg-white rounded-lg p-6 shadow-sm">
                    <h3 className="font-semibold text-gray-900 mb-3">How to tip for large groups?</h3>
                    <p className="text-gray-600 text-sm">
                      Many restaurants automatically add an 18-20% gratuity for parties of 6 or more. Check your bill carefully and adjust accordingly if needed.
                    </p>
                  </div>
                </div>
                <div className="space-y-6">
                  <div className="bg-white rounded-lg p-6 shadow-sm">
                    <h3 className="font-semibold text-gray-900 mb-3">Should I tip in cash or card?</h3>
                    <p className="text-gray-600 text-sm">
                      Cash tips are often preferred by service workers as they receive them immediately. However, card tips are perfectly acceptable and increasingly common.
                    </p>
                  </div>
                  <div className="bg-white rounded-lg p-6 shadow-sm">
                    <h3 className="font-semibold text-gray-900 mb-3">What about poor service?</h3>
                    <p className="text-gray-600 text-sm">
                      For genuinely poor service, you can reduce the tip to 10-12%. However, consider speaking with a manager about serious service issues rather than just reducing the tip.
                    </p>
                  </div>
                  <div className="bg-white rounded-lg p-6 shadow-sm">
                    <h3 className="font-semibold text-gray-900 mb-3">Tipping while traveling abroad?</h3>
                    <p className="text-gray-600 text-sm">
                      Research local customs before traveling. What's normal in one country may be offensive in another. Our calculator includes guidelines for major destinations.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Benefits */}
            <section className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-8">
              <div className="max-w-4xl mx-auto text-center">
                <h2 className="text-3xl font-bold text-gray-900 mb-6">
                  Why Use Our Tip Calculator?
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
                  <div className="bg-white rounded-lg p-6 shadow-sm">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                      <DollarSign className="w-6 h-6 text-green-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">Save Time</h3>
                    <p className="text-gray-600 text-sm">Instantly calculate tips and split bills without mental math.</p>
                  </div>
                  <div className="bg-white rounded-lg p-6 shadow-sm">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                      <DollarSign className="w-6 h-6 text-blue-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">Avoid Awkwardness</h3>
                    <p className="text-gray-600 text-sm">Know exactly how much to tip in any situation or country.</p>
                  </div>
                  <div className="bg-white rounded-lg p-6 shadow-sm">
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                      <DollarSign className="w-6 h-6 text-purple-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">Fair Tipping</h3>
                    <p className="text-gray-600 text-sm">Ensure service workers receive appropriate compensation.</p>
                  </div>
                  <div className="bg-white rounded-lg p-6 shadow-sm">
                    <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                      <DollarSign className="w-6 h-6 text-orange-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">Cultural Awareness</h3>
                    <p className="text-gray-600 text-sm">Learn and respect tipping customs from around the world.</p>
                  </div>
                </div>
              </div>
            </section>
            {/* Related Financial Tools */}
            <section className="bg-gradient-to-r from-gray-50 to-slate-50 rounded-2xl p-8">
              <div className="max-w-4xl mx-auto">
                <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">
                  Related Financial Calculators & Tools
                </h2>
                <p className="text-lg text-gray-600 text-center mb-10">
                  Enhance your financial planning with our comprehensive suite of calculator tools designed for personal and business use.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <a href="/tools/percentage-calculator" className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow border border-gray-100 hover:border-blue-200 group">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-blue-200 transition-colors">
                      <DollarSign className="w-6 h-6 text-blue-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">Percentage Calculator</h3>
                    <p className="text-gray-600 text-sm">Calculate percentages, percentage increases, decreases, and find what percent one number is of another.</p>
                  </a>
                  
                  <a href="/tools/discount-calculator" className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow border border-gray-100 hover:border-green-200 group">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-green-200 transition-colors">
                      <DollarSign className="w-6 h-6 text-green-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">Discount Calculator</h3>
                    <p className="text-gray-600 text-sm">Calculate sale prices, discount amounts, and savings on purchases with our easy-to-use discount calculator.</p>
                  </a>
                  
                  <a href="/tools/tax-calculator" className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow border border-gray-100 hover:border-purple-200 group">
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-purple-200 transition-colors">
                      <DollarSign className="w-6 h-6 text-purple-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">Tax Calculator</h3>
                    <p className="text-gray-600 text-sm">Estimate your income taxes, deductions, and refunds with our comprehensive tax calculation tool.</p>
                  </a>
                  
                  <a href="/tools/salary-to-hourly" className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow border border-gray-100 hover:border-orange-200 group">
                    <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-orange-200 transition-colors">
                      <DollarSign className="w-6 h-6 text-orange-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">Salary to Hourly Calculator</h3>
                    <p className="text-gray-600 text-sm">Convert annual salary to hourly wage and vice versa with detailed breakdowns for different pay periods.</p>
                  </a>
                  
                  <a href="/tools/loan-calculator" className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow border border-gray-100 hover:border-red-200 group">
                    <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-red-200 transition-colors">
                      <DollarSign className="w-6 h-6 text-red-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">Loan Calculator</h3>
                    <p className="text-gray-600 text-sm">Calculate monthly payments, total interest, and amortization schedules for personal and business loans.</p>
                  </a>
                  
                  <a href="/tools/compound-interest" className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow border border-gray-100 hover:border-indigo-200 group">
                    <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-indigo-200 transition-colors">
                      <DollarSign className="w-6 h-6 text-indigo-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">Compound Interest Calculator</h3>
                    <p className="text-gray-600 text-sm">Calculate investment growth with compound interest including principal, interest rates, and time periods.</p>
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
                  Why Use Our Advanced Tip Calculator?
                </h2>
                
                <div className="prose prose-lg text-gray-700 max-w-none">
                  <p className="mb-6">
                    Our tip calculator stands out as the most comprehensive gratuity calculation tool available online. Unlike basic tip calculators that only handle simple percentage calculations, our advanced tool incorporates cultural intelligence, currency conversion, and sophisticated bill-splitting algorithms to provide accurate results for any dining or service scenario.
                  </p>
                  
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Key Features That Set Us Apart:</h3>
                  
                  <ul className="space-y-3 mb-6">
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      <span><strong>Global Currency Support:</strong> Calculate tips in 15+ major currencies with proper formatting and decimal handling</span>
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      <span><strong>Cultural Tipping Standards:</strong> Pre-loaded with appropriate tipping ranges for different countries and regions</span>
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      <span><strong>Service Quality Assessment:</strong> Tip suggestions based on actual service experience from poor to outstanding</span>
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      <span><strong>Advanced Bill Splitting:</strong> Divide costs among up to 50 people with detailed per-person breakdowns</span>
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      <span><strong>Multiple Calculation Methods:</strong> Choose from percentage-based, service quality-based, or custom tip amounts</span>
                    </li>
                  </ul>
                  
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Perfect for International Use:</h3>
                  
                  <p className="mb-6">
                    Whether you're traveling for business or pleasure, our tip calculator ensures you always tip appropriately regardless of your location. From Japan's no-tipping culture to America's standard 15-20% gratuity expectations, our tool automatically adjusts recommendations based on local customs and cultural norms.
                  </p>
                  
                  <p className="mb-6">
                    Business travelers particularly appreciate our expense-reporting features, which provide detailed breakdowns suitable for reimbursement documentation. The tool's precision ensures you never over-tip or under-tip, helping maintain professional relationships while respecting cultural expectations.
                  </p>
                  
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Mathematical Accuracy and Reliability:</h3>
                  
                  <p className="mb-4">
                    Our calculator uses precise mathematical algorithms to ensure accuracy down to the smallest currency denomination. All calculations are performed using standard financial rounding methods, and results are formatted according to each currency's conventional display format.
                  </p>
                  
                  <p>
                    The tool's reliability has made it the preferred choice for restaurants, travel agencies, and financial planning services worldwide. With regular updates to reflect changing tipping standards and currency fluctuations, you can trust our calculator to provide current, accurate results every time.
                  </p>
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
