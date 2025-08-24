
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
        <title>Free Tip Calculator - Calculate Tips & Split Bills Worldwide | ToolsHub</title>
        <meta name="description" content="Free online tip calculator with global tipping standards. Calculate restaurant tips, split bills, and learn tipping etiquette for 15+ countries. Supports all currencies and bill splitting." />
        <meta name="keywords" content="tip calculator, gratuity calculator, bill splitter, tipping guide, restaurant tip calculator, worldwide tipping, tip percentage calculator, bill splitting calculator" />
        <meta property="og:title" content="Free Tip Calculator - Calculate Tips & Split Bills Worldwide" />
        <meta property="og:description" content="Calculate tips accurately with our free online tip calculator. Includes global tipping standards, bill splitting, and currency support for 15+ countries." />
        <meta property="og:type" content="website" />
        <link rel="canonical" href="https://toolshub.com/tip-calculator" />
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
            {/* About Tip Calculator */}
            <section className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-8">
              <div className="max-w-4xl mx-auto">
                <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">
                  About Our Tip Calculator
                </h2>
                <div className="prose prose-lg text-gray-700 mx-auto text-center mb-8">
                  <p className="text-xl leading-relaxed">
                    Our comprehensive tip calculator helps you calculate gratuities accurately across different countries and service industries. 
                    Whether you're dining at a restaurant, using ride-sharing services, or receiving personal services, our tool ensures you tip 
                    appropriately based on local customs and service quality.
                  </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                  <div className="bg-white rounded-lg p-6 shadow-sm">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                      <DollarSign className="w-6 h-6 text-blue-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">Accurate Calculations</h3>
                    <p className="text-gray-600 text-sm">Precise tip and total calculations with support for multiple currencies and bill splitting.</p>
                  </div>
                  <div className="bg-white rounded-lg p-6 shadow-sm">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                      <DollarSign className="w-6 h-6 text-green-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">Global Standards</h3>
                    <p className="text-gray-600 text-sm">Country-specific tipping guidelines and cultural customs for worldwide use.</p>
                  </div>
                  <div className="bg-white rounded-lg p-6 shadow-sm">
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                      <DollarSign className="w-6 h-6 text-purple-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">Bill Splitting</h3>
                    <p className="text-gray-600 text-sm">Easily split bills and tips among multiple people for group dining and activities.</p>
                  </div>
                </div>
              </div>
            </section>

            {/* How to Use */}
            <section>
              <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
                How to Use the Tip Calculator
              </h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                <div className="space-y-6">
                  <div className="flex items-start space-x-4">
                    <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-semibold text-sm">1</div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">Select Your Country</h3>
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
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
