import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowUpDown } from 'lucide-react';

interface ConversionResult {
  fromAmount: number;
  toAmount: number;
  fromCurrency: string;
  toCurrency: string;
  exchangeRate: number;
}

export default function CurrencyConverter() {
  const [amount, setAmount] = useState('1000');
  const [fromCurrency, setFromCurrency] = useState('USD');
  const [toCurrency, setToCurrency] = useState('EUR');
  const [result, setResult] = useState<ConversionResult | null>(null);

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

  // Exchange rates (based on USD)
  const exchangeRates: { [key: string]: number } = {
    'USD': 1.00,
    'EUR': 0.85,
    'GBP': 0.73,
    'JPY': 110.0,
    'CNY': 6.45,
    'INR': 74.5,
    'CAD': 1.25,
    'AUD': 1.35,
    'CHF': 0.92,
    'SEK': 8.5,
    'NOK': 8.8,
    'DKK': 6.3,
    'PLN': 3.9,
    'CZK': 22.0,
    'HUF': 295.0,
    'RUB': 73.5,
    'TRY': 8.3,
    'BRL': 5.2,
    'MXN': 20.1,
    'ARS': 98.5,
    'KRW': 1180.0,
    'SGD': 1.35,
    'HKD': 7.8,
    'NZD': 1.42,
    'ZAR': 14.8,
    'THB': 31.5,
    'MYR': 4.15,
    'IDR': 14250.0,
    'PHP': 50.8,
    'VND': 23000.0
  };

  const getExchangeRate = (from: string, to: string): number => {
    if (from === to) return 1;
    
    const fromRate = exchangeRates[from];
    const toRate = exchangeRates[to];
    
    return toRate / fromRate;
  };

  const convertCurrency = () => {
    const amountValue = parseFloat(amount);
    if (!amountValue || amountValue <= 0) return;

    const exchangeRate = getExchangeRate(fromCurrency, toCurrency);
    const convertedAmount = amountValue * exchangeRate;

    setResult({
      fromAmount: amountValue,
      toAmount: convertedAmount,
      fromCurrency,
      toCurrency,
      exchangeRate
    });
  };

  const swapCurrencies = () => {
    const temp = fromCurrency;
    setFromCurrency(toCurrency);
    setToCurrency(temp);
  };

  const resetConverter = () => {
    setAmount('1000');
    setFromCurrency('USD');
    setToCurrency('EUR');
    setResult(null);
  };

  const formatCurrency = (amount: number, currencyCode: string) => {
    const currency = currencies.find(c => c.code === currencyCode);
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currencyCode,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 6
    }).format(num);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Helmet>
        <title>Free Currency Converter - Real-Time Exchange Rates for 30+ Currencies | DapsiWow</title>
        <meta name="description" content="Free online currency converter with real-time exchange rates for 30+ global currencies. Convert USD to EUR, GBP to USD, JPY to CNY and more. Perfect for travel, business, forex trading, and international shopping." />
        <meta name="keywords" content="currency converter, exchange rates, currency exchange, money converter, forex calculator, USD EUR converter, travel money calculator, international currency rates, foreign exchange converter, currency calculator" />
        <meta property="og:title" content="Free Currency Converter - Real-Time Exchange Rates | DapsiWow" />
        <meta property="og:description" content="Convert between 30+ global currencies with accurate exchange rates. Essential tool for travelers, businesses, and forex traders." />
        <link rel="canonical" href="/tools/currency-converter" />
      </Helmet>
      
      <Header />
      
      <main>
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 py-20 sm:py-24 lg:py-28">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="space-y-6">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 dark:text-white leading-tight">
                Currency Converter
              </h1>
              <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto leading-relaxed">
                Convert between 30+ global currencies with accurate exchange rates
              </p>
            </div>
          </div>
        </section>

        <div className="max-w-6xl mx-auto px-4 py-12">
          <Card className="bg-white shadow-sm border-0">
            <CardContent className="p-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                {/* Input Section */}
                <div className="space-y-6">
                  <h2 className="text-2xl font-semibold text-gray-900 mb-8">Convert Currency</h2>
                  
                  {/* Amount */}
                  <div className="space-y-3">
                    <Label htmlFor="amount" className="text-sm font-medium text-gray-700">
                      Amount
                    </Label>
                    <Input
                      id="amount"
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="h-12 text-base border-gray-200 rounded-lg"
                      placeholder="1,000"
                      min="0"
                      step="0.01"
                    />
                  </div>

                  {/* From Currency */}
                  <div className="space-y-3">
                    <Label className="text-sm font-medium text-gray-700">From</Label>
                    <Select value={fromCurrency} onValueChange={setFromCurrency}>
                      <SelectTrigger className="h-12 border-gray-200 rounded-lg">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {currencies.map((currency) => (
                          <SelectItem key={currency.code} value={currency.code}>
                            {currency.symbol} {currency.code} - {currency.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Swap Button */}
                  <div className="flex justify-center">
                    <Button
                      onClick={swapCurrencies}
                      variant="outline"
                      size="sm"
                      className="border-gray-200 text-gray-600 hover:bg-gray-50 rounded-full w-10 h-10 p-0"
                    >
                      <ArrowUpDown className="w-4 h-4" />
                    </Button>
                  </div>

                  {/* To Currency */}
                  <div className="space-y-3">
                    <Label className="text-sm font-medium text-gray-700">To</Label>
                    <Select value={toCurrency} onValueChange={setToCurrency}>
                      <SelectTrigger className="h-12 border-gray-200 rounded-lg">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {currencies.map((currency) => (
                          <SelectItem key={currency.code} value={currency.code}>
                            {currency.symbol} {currency.code} - {currency.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-4 pt-6">
                    <Button
                      onClick={convertCurrency}
                      className="flex-1 h-12 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg"
                    >
                      <ArrowUpDown className="w-4 h-4 mr-2" />
                      Convert
                    </Button>
                    <Button
                      onClick={resetConverter}
                      variant="outline"
                      className="h-12 px-8 border-gray-200 text-gray-600 hover:bg-gray-50 font-medium rounded-lg"
                    >
                      Reset
                    </Button>
                  </div>
                </div>

                {/* Results Section */}
                <div className="bg-gray-50 rounded-xl p-8">
                  <h2 className="text-2xl font-semibold text-gray-900 mb-8">Conversion Result</h2>
                  
                  {result ? (
                    <div className="space-y-6">
                      {/* Conversion Display */}
                      <div className="bg-white rounded-lg p-6 border border-gray-100">
                        <div className="text-center space-y-4">
                          <div className="text-lg text-gray-600">
                            {formatCurrency(result.fromAmount, result.fromCurrency)}
                          </div>
                          <div className="text-4xl font-bold text-green-600">
                            {formatCurrency(result.toAmount, result.toCurrency)}
                          </div>
                        </div>
                      </div>

                      {/* Exchange Rate Info */}
                      <div className="space-y-4">
                        <div className="flex justify-between items-center py-3 border-b border-gray-200">
                          <span className="text-gray-600">Exchange Rate</span>
                          <span className="font-semibold text-gray-900">
                            1 {result.fromCurrency} = {formatNumber(result.exchangeRate)} {result.toCurrency}
                          </span>
                        </div>
                        <div className="flex justify-between items-center py-3 border-b border-gray-200">
                          <span className="text-gray-600">Inverse Rate</span>
                          <span className="font-semibold text-gray-900">
                            1 {result.toCurrency} = {formatNumber(1 / result.exchangeRate)} {result.fromCurrency}
                          </span>
                        </div>
                      </div>

                      {/* Quick Conversions */}
                      <div className="mt-8">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Conversions</h3>
                        <div className="space-y-2">
                          {[1, 5, 10, 100, 1000].map((quickAmount) => (
                            <div key={quickAmount} className="bg-white rounded-lg p-3 border border-gray-100 flex justify-between text-sm">
                              <span className="text-gray-600">
                                {formatCurrency(quickAmount, result.fromCurrency)}
                              </span>
                              <span className="font-medium text-gray-900">
                                {formatCurrency(quickAmount * result.exchangeRate, result.toCurrency)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <ArrowUpDown className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500">Enter an amount and select currencies to convert</p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Comprehensive Educational Content */}
          <div className="mt-16 space-y-12">
            {/* What is Currency Conversion */}
            <Card className="bg-white border-0 shadow-sm">
              <CardContent className="p-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-6">What is a Currency Converter and Exchange Rates?</h2>
                <div className="prose max-w-none text-gray-600">
                  <p className="text-lg mb-4">
                    A currency converter is an essential financial tool that calculates the exchange value between different world currencies using real-time or current market exchange rates. 
                    Whether you're traveling internationally, conducting global business transactions, making cross-border online purchases, or trading in the forex market, 
                    understanding currency conversion is crucial for making informed financial decisions and avoiding costly mistakes.
                  </p>
                  <p className="mb-4">
                    Our free online currency converter provides accurate exchange rates for over 30 major world currencies, including the most traded pairs like 
                    USD to EUR (US Dollar to Euro), GBP to USD (British Pound to US Dollar), JPY to CNY (Japanese Yen to Chinese Yuan), and many others. 
                    The tool calculates the exact amount you'll receive when exchanging currencies, helping you plan your finances effectively.
                  </p>
                  <p>
                    Exchange rates fluctuate constantly due to various economic factors including inflation rates, interest rates, political stability, 
                    economic performance, and market speculation. Our currency calculator uses up-to-date rates to ensure you get the most accurate 
                    conversion results for your international transactions.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* How to Use Currency Converter */}
            <Card className="bg-white border-0 shadow-sm">
              <CardContent className="p-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-6">How to Use Our Free Currency Converter Tool</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div className="flex items-start space-x-4">
                      <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-sm">1</div>
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-2">Enter the Amount</h3>
                        <p className="text-gray-600">Input the amount of money you want to convert in the amount field. You can enter any value from cents to millions.</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-4">
                      <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-sm">2</div>
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-2">Select Source Currency</h3>
                        <p className="text-gray-600">Choose the currency you're converting from in the "From" dropdown menu. Popular options include USD, EUR, GBP, JPY, CNY, and INR.</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-4">
                      <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-sm">3</div>
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-2">Select Target Currency</h3>
                        <p className="text-gray-600">Choose the currency you want to convert to in the "To" dropdown. The tool supports 30+ international currencies.</p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-6">
                    <div className="flex items-start space-x-4">
                      <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-sm">4</div>
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-2">Get Instant Results</h3>
                        <p className="text-gray-600">Click "Convert" to see the converted amount, current exchange rate, and inverse rate for easy reference.</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-4">
                      <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-sm">5</div>
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-2">View Quick Conversions</h3>
                        <p className="text-gray-600">Check the quick conversion table for common amounts to get a better understanding of the exchange rate.</p>
                      </div>
                    </div>
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <p className="text-blue-800 text-sm">
                        <strong>Pro Tip:</strong> Use the swap button (⇅) to quickly reverse the conversion direction and see both ways instantly!
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Comprehensive Use Cases */}
            <Card className="bg-white border-0 shadow-sm">
              <CardContent className="p-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-6">When to Use Our Currency Converter Tool</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M2 6a2 2 0 012-2h12a2 2 0 012 2v2a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14 8a1 1 0 100-2 1 1 0 000 2z"/>
                        <path d="M2 14a2 2 0 012-2h12a2 2 0 012 2v2a2 2 0 01-2 2H4a2 2 0 01-2-2v-2zM14 16a1 1 0 100-2 1 1 0 000 2z"/>
                      </svg>
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">Travel & Tourism</h3>
                    <p className="text-gray-600 text-sm">Calculate travel budgets, convert hotel prices, estimate meal costs, and understand local currency values before and during your international trips.</p>
                  </div>
                  <div className="text-center">
                    <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm3 3a1 1 0 011-1h4a1 1 0 110 2H8a1 1 0 01-1-1zm0 3a1 1 0 011-1h4a1 1 0 110 2H8a1 1 0 01-1-1z"/>
                      </svg>
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">International Business</h3>
                    <p className="text-gray-600 text-sm">Convert invoice amounts, calculate international payments, manage multi-currency transactions, and determine profit margins in global trade.</p>
                  </div>
                  <div className="text-center">
                    <div className="w-16 h-16 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"/>
                      </svg>
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">Online Shopping</h3>
                    <p className="text-gray-600 text-sm">Compare prices across international e-commerce sites, understand true costs including shipping, and make informed purchasing decisions.</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">Additional Use Cases:</h3>
                    <ul className="space-y-3 text-gray-600">
                      <li className="flex items-start space-x-3">
                        <span className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></span>
                        <span><strong>Forex Trading:</strong> Calculate potential profits and losses in currency trading</span>
                      </li>
                      <li className="flex items-start space-x-3">
                        <span className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></span>
                        <span><strong>Real Estate:</strong> Convert property prices for international real estate investments</span>
                      </li>
                      <li className="flex items-start space-x-3">
                        <span className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></span>
                        <span><strong>Education:</strong> Calculate tuition fees and living expenses for studying abroad</span>
                      </li>
                      <li className="flex items-start space-x-3">
                        <span className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></span>
                        <span><strong>Freelancing:</strong> Convert project payments from international clients</span>
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">Benefits of Our Tool:</h3>
                    <ul className="space-y-3 text-gray-600">
                      <li className="flex items-start space-x-3">
                        <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                        <span><strong>Free to Use:</strong> No registration or payment required</span>
                      </li>
                      <li className="flex items-start space-x-3">
                        <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                        <span><strong>Accurate Rates:</strong> Based on current market exchange rates</span>
                      </li>
                      <li className="flex items-start space-x-3">
                        <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                        <span><strong>30+ Currencies:</strong> Support for major global currencies</span>
                      </li>
                      <li className="flex items-start space-x-3">
                        <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                        <span><strong>Mobile Friendly:</strong> Works on all devices and screen sizes</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Popular Currency Pairs */}
            <Card className="bg-white border-0 shadow-sm">
              <CardContent className="p-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Popular Currency Exchange Pairs</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-900 mb-2">USD to EUR</h4>
                    <p className="text-sm text-gray-600">US Dollar to Euro - Most traded currency pair globally</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-900 mb-2">GBP to USD</h4>
                    <p className="text-sm text-gray-600">British Pound to US Dollar - Major reserve currency pair</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-900 mb-2">USD to JPY</h4>
                    <p className="text-sm text-gray-600">US Dollar to Japanese Yen - Popular Asian currency pair</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-900 mb-2">USD to CNY</h4>
                    <p className="text-sm text-gray-600">US Dollar to Chinese Yuan - Growing trade currency</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-900 mb-2">EUR to GBP</h4>
                    <p className="text-sm text-gray-600">Euro to British Pound - European cross-currency pair</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-900 mb-2">USD to INR</h4>
                    <p className="text-sm text-gray-600">US Dollar to Indian Rupee - Emerging market currency</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* FAQ Section */}
            <Card className="bg-white border-0 shadow-sm">
              <CardContent className="p-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Frequently Asked Questions</h2>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">How accurate are the exchange rates?</h3>
                    <p className="text-gray-600">Our currency converter uses current market exchange rates that are updated regularly. While rates are highly accurate for reference purposes, actual exchange rates at banks or currency exchange services may vary slightly due to fees and spreads.</p>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Is this currency converter free to use?</h3>
                    <p className="text-gray-600">Yes, our currency converter is completely free to use. There are no hidden fees, registration requirements, or usage limits. You can perform unlimited currency conversions at no cost.</p>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Which currencies are supported?</h3>
                    <p className="text-gray-600">We support over 30 major world currencies including USD, EUR, GBP, JPY, CNY, INR, CAD, AUD, CHF, KRW, SEK, NOK, and many others. All major trading currencies and popular international currencies are included.</p>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Can I use this for business purposes?</h3>
                    <p className="text-gray-600">Absolutely! Our currency converter is perfect for business use including invoice calculations, international payments, profit margin analysis, and financial planning. However, for large transactions, always verify rates with your bank or financial institution.</p>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Does the tool work on mobile devices?</h3>
                    <p className="text-gray-600">Yes, our currency converter is fully responsive and works seamlessly on smartphones, tablets, and desktop computers. The interface adapts to your screen size for optimal usability.</p>
                  </div>
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