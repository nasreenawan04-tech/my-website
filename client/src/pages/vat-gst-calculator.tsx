
import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface VATResult {
  baseAmount: number;
  vatAmount: number;
  totalAmount: number;
  effectiveRate: number;
}

export default function VATGSTCalculator() {
  const [calculationType, setCalculationType] = useState('add-vat');
  const [amount, setAmount] = useState('');
  const [vatRate, setVatRate] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [result, setResult] = useState<VATResult | null>(null);

  // Preset VAT/GST rates for different countries
  const vatRates = {
    '0': '0% (No VAT)',
    '5': '5% (UAE, Singapore)',
    '7': '7% (Singapore GST)',
    '10': '10% (Australia GST)',
    '12': '12% (India GST)',
    '15': '15% (Canada HST)',
    '18': '18% (India GST)',
    '19': '19% (Germany)',
    '20': '20% (UK VAT)',
    '21': '21% (Netherlands)',
    '23': '23% (Ireland)',
    '25': '25% (Sweden)',
    '27': '27% (Hungary)'
  };

  const calculateVAT = () => {
    const inputAmount = parseFloat(amount);
    const rate = parseFloat(vatRate);

    if (isNaN(inputAmount) || inputAmount <= 0 || isNaN(rate) || rate < 0) return;

    let baseAmount: number, vatAmount: number, totalAmount: number;

    if (calculationType === 'add-vat') {
      // Add VAT to base amount
      baseAmount = inputAmount;
      vatAmount = (inputAmount * rate) / 100;
      totalAmount = inputAmount + vatAmount;
    } else {
      // Remove VAT from total amount
      totalAmount = inputAmount;
      baseAmount = inputAmount / (1 + rate / 100);
      vatAmount = totalAmount - baseAmount;
    }

    const effectiveRate = baseAmount > 0 ? (vatAmount / baseAmount) * 100 : 0;

    setResult({
      baseAmount: Math.round(baseAmount * 100) / 100,
      vatAmount: Math.round(vatAmount * 100) / 100,
      totalAmount: Math.round(totalAmount * 100) / 100,
      effectiveRate: Math.round(effectiveRate * 100) / 100
    });
  };

  const resetCalculator = () => {
    setAmount('');
    setVatRate('');
    setCalculationType('add-vat');
    setCurrency('USD');
    setResult(null);
  };

  const formatCurrency = (amount: number) => {
    const currencyMap: { [key: string]: { locale: string; currency: string } } = {
      USD: { locale: 'en-US', currency: 'USD' },
      EUR: { locale: 'de-DE', currency: 'EUR' },
      GBP: { locale: 'en-GB', currency: 'GBP' },
      INR: { locale: 'en-IN', currency: 'INR' },
      JPY: { locale: 'ja-JP', currency: 'JPY' },
      CAD: { locale: 'en-CA', currency: 'CAD' },
      AUD: { locale: 'en-AU', currency: 'AUD' },
      CNY: { locale: 'zh-CN', currency: 'CNY' },
      BRL: { locale: 'pt-BR', currency: 'BRL' },
      MXN: { locale: 'es-MX', currency: 'MXN' },
      CHF: { locale: 'de-CH', currency: 'CHF' },
      SEK: { locale: 'sv-SE', currency: 'SEK' },
      NOK: { locale: 'nb-NO', currency: 'NOK' },
      DKK: { locale: 'da-DK', currency: 'DKK' },
      SGD: { locale: 'en-SG', currency: 'SGD' },
      AED: { locale: 'ar-AE', currency: 'AED' }
    };

    const config = currencyMap[currency] || currencyMap.USD;
    
    return new Intl.NumberFormat(config.locale, {
      style: 'currency',
      currency: config.currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Helmet>
        <title>VAT/GST Calculator - Calculate Value Added Tax & GST Worldwide | DapsiWow</title>
        <meta name="description" content="Free VAT/GST calculator for calculating value added tax and goods & services tax. Supports 15+ countries, 16+ currencies. Perfect for businesses, accountants, students. Get instant accurate tax calculations." />
        <meta name="keywords" content="VAT calculator, GST calculator, value added tax calculator, goods services tax calculator, tax calculator, business tax calculator, VAT calculation, GST calculation, tax rate calculator, EU VAT calculator, UK VAT calculator, Australia GST calculator, India GST calculator, international tax calculator, sales tax calculator, consumption tax calculator" />
        <meta property="og:title" content="VAT/GST Calculator - Calculate Value Added Tax & GST Worldwide | DapsiWow" />
        <meta property="og:description" content="Free VAT/GST calculator for calculating value added tax and goods & services tax. Supports 15+ countries, 16+ currencies. Perfect for businesses, accountants, students. Get instant accurate tax calculations." />
        <meta property="og:type" content="website" />
        <meta name="robots" content="index, follow" />
        <meta name="author" content="DapsiWow" />
        <link rel="canonical" href="https://dapsiwow.com/tools/vat-gst-calculator" />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            "name": "VAT/GST Calculator",
            "description": "Free online VAT/GST calculator for calculating value added tax and goods & services tax across multiple countries. Supports adding or removing VAT/GST from prices with instant calculations.",
            "url": "https://dapsiwow.com/tools/vat-gst-calculator",
            "applicationCategory": "FinanceApplication",
            "operatingSystem": "Any",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "USD"
            },
            "featureList": [
              "Calculate VAT/GST for 15+ countries",
              "Add or remove VAT from prices",
              "Support for 16+ currencies",
              "Instant tax calculations",
              "Business-friendly interface",
              "Accurate tax breakdown"
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
                <span className="text-xs sm:text-sm font-medium text-blue-700">Professional VAT/GST Calculator</span>
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl 2xl:text-8xl font-bold text-slate-900 leading-tight tracking-tight">
                <span className="block">Smart VAT/GST</span>
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 mt-1 sm:mt-2">
                  Calculator
                </span>
              </h1>
              <p className="text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl text-slate-600 max-w-sm sm:max-w-lg md:max-w-2xl lg:max-w-3xl xl:max-w-4xl mx-auto leading-relaxed px-2 sm:px-0">
                Calculate Value Added Tax and Goods & Services Tax for multiple countries with precision and ease
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
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">VAT/GST Configuration</h2>
                    <p className="text-gray-600">Enter your tax calculation details to get accurate VAT/GST results</p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Currency Selection */}
                    <div className="space-y-3">
                      <Label htmlFor="currency" className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                        Currency
                      </Label>
                      <Select value={currency} onValueChange={setCurrency}>
                        <SelectTrigger className="h-14 border-2 border-gray-200 rounded-xl text-lg" data-testid="select-currency">
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
                          <SelectItem value="CHF">CHF - Swiss Franc</SelectItem>
                          <SelectItem value="SEK">SEK - Swedish Krona</SelectItem>
                          <SelectItem value="NOK">NOK - Norwegian Krone</SelectItem>
                          <SelectItem value="DKK">DKK - Danish Krone</SelectItem>
                          <SelectItem value="SGD">SGD - Singapore Dollar</SelectItem>
                          <SelectItem value="AED">AED - UAE Dirham</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Calculation Type */}
                    <div className="space-y-3">
                      <Label className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                        Calculation Type
                      </Label>
                      <Select value={calculationType} onValueChange={setCalculationType}>
                        <SelectTrigger className="h-14 border-2 border-gray-200 rounded-xl text-lg" data-testid="select-calculation-type">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="add-vat">Add VAT/GST to Price</SelectItem>
                          <SelectItem value="remove-vat">Remove VAT/GST from Total</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Amount Input */}
                    <div className="space-y-3">
                      <Label htmlFor="amount" className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                        {calculationType === 'add-vat' ? 'Net Amount (Excluding VAT/GST)' : 'Gross Amount (Including VAT/GST)'}
                      </Label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-lg">$</span>
                        <Input
                          id="amount"
                          type="number"
                          value={amount}
                          onChange={(e) => setAmount(e.target.value)}
                          className="h-14 pl-8 text-lg border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-blue-500"
                          placeholder="10,000"
                          min="0"
                          step="0.01"
                          data-testid="input-amount"
                        />
                      </div>
                    </div>

                    {/* VAT Rate Selection */}
                    <div className="space-y-3">
                      <Label className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                        VAT/GST Rate
                      </Label>
                      <Select value={vatRate} onValueChange={setVatRate}>
                        <SelectTrigger className="h-14 border-2 border-gray-200 rounded-xl text-lg" data-testid="select-vat-rate">
                          <SelectValue placeholder="Select VAT/GST rate" />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(vatRates).map(([rate, label]) => (
                            <SelectItem key={rate} value={rate}>
                              {label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Custom Rate Input */}
                  {!Object.keys(vatRates).includes(vatRate) && vatRate !== '' && (
                    <div className="space-y-3">
                      <Label htmlFor="custom-rate" className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                        Custom VAT/GST Rate
                      </Label>
                      <div className="relative">
                        <Input
                          id="custom-rate"
                          type="number"
                          value={vatRate}
                          onChange={(e) => setVatRate(e.target.value)}
                          className="h-14 pr-8 text-lg border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-blue-500"
                          placeholder="Enter custom rate"
                          min="0"
                          max="100"
                          step="0.01"
                          data-testid="input-custom-rate"
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 text-lg">%</span>
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-4 pt-6">
                    <Button
                      onClick={calculateVAT}
                      className="flex-1 h-14 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold text-lg rounded-xl shadow-lg transform transition-all duration-200 hover:scale-105"
                      data-testid="button-calculate"
                    >
                      Calculate VAT/GST
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
                <div className="bg-gradient-to-br from-gray-50 to-blue-50 p-8 lg:p-12">
                  <h2 className="text-2xl font-bold text-gray-900 mb-8">Results</h2>
                  
                  {result ? (
                    <div className="space-y-6" data-testid="vat-results">
                      {/* Total Amount Highlight */}
                      <div className="bg-white rounded-2xl p-6 shadow-lg border border-blue-100">
                        <div className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-2">
                          Total Amount (Gross)
                        </div>
                        <div className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600" data-testid="text-total-amount">
                          {formatCurrency(result.totalAmount)}
                        </div>
                      </div>

                      {/* Tax Breakdown */}
                      <div className="space-y-4">
                        <div className="bg-white rounded-xl p-4 shadow-sm">
                          <div className="flex justify-between items-center">
                            <span className="font-medium text-gray-700">Base Amount (Net)</span>
                            <span className="font-bold text-gray-900" data-testid="text-base-amount">
                              {formatCurrency(result.baseAmount)}
                            </span>
                          </div>
                        </div>
                        <div className="bg-white rounded-xl p-4 shadow-sm">
                          <div className="flex justify-between items-center">
                            <span className="font-medium text-gray-700">VAT/GST Amount</span>
                            <span className="font-bold text-orange-600" data-testid="text-vat-amount">
                              {formatCurrency(result.vatAmount)}
                            </span>
                          </div>
                        </div>
                        <div className="bg-white rounded-xl p-4 shadow-sm">
                          <div className="flex justify-between items-center">
                            <span className="font-medium text-gray-700">Effective Rate</span>
                            <span className="font-bold text-blue-600" data-testid="text-effective-rate">
                              {result.effectiveRate}%
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Tax Breakdown Chart */}
                      <div className="bg-white rounded-xl p-6 shadow-sm">
                        <h4 className="font-bold text-gray-900 mb-4 text-lg">Tax Composition</h4>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <div className="w-4 h-4 bg-blue-500 rounded mr-3"></div>
                              <span className="text-gray-700">Base Amount</span>
                            </div>
                            <span className="font-semibold">
                              {((result.baseAmount / result.totalAmount) * 100).toFixed(1)}%
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <div className="w-4 h-4 bg-orange-500 rounded mr-3"></div>
                              <span className="text-gray-700">VAT/GST</span>
                            </div>
                            <span className="font-semibold">
                              {((result.vatAmount / result.totalAmount) * 100).toFixed(1)}%
                            </span>
                          </div>
                        </div>
                        <div className="mt-4 h-3 bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-blue-500 to-orange-500 rounded-full"
                            style={{
                              background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${(result.baseAmount / result.totalAmount) * 100}%, #f97316 ${(result.baseAmount / result.totalAmount) * 100}%, #f97316 100%)`
                            }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-16" data-testid="no-results">
                      <div className="w-20 h-20 bg-gray-200 rounded-full mx-auto mb-6 flex items-center justify-center">
                        <div className="text-3xl font-bold text-gray-400">%</div>
                      </div>
                      <p className="text-gray-500 text-lg">Enter amount and tax rate to see VAT/GST calculations</p>
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
                <h3 className="text-2xl font-bold text-gray-900 mb-6">What is VAT/GST?</h3>
                <div className="space-y-4 text-gray-600">
                  <p>
                    VAT (Value Added Tax) and GST (Goods and Services Tax) are consumption taxes levied on goods 
                    and services. VAT is applied at each stage of production and distribution, while GST is a 
                    comprehensive tax system that consolidates multiple indirect taxes.
                  </p>
                  <p>
                    Our VAT/GST calculator helps businesses, accountants, and individuals calculate accurate tax 
                    amounts for transactions across different countries. Whether you need to add VAT to a net price 
                    or extract VAT from a gross amount, this tool provides instant, precise calculations.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">How to Calculate VAT/GST?</h3>
                <div className="space-y-4 text-gray-600">
                  <p>
                    <strong>Adding VAT/GST:</strong> VAT Amount = Net Price × (VAT Rate ÷ 100)
                  </p>
                  <p>
                    <strong>Removing VAT/GST:</strong> Net Price = Gross Price ÷ (1 + VAT Rate ÷ 100)
                  </p>
                  <ul className="space-y-2 list-disc list-inside">
                    <li>Identify whether you're adding or removing VAT</li>
                    <li>Select the appropriate VAT/GST rate for your country</li>
                    <li>Apply the formula to get accurate results</li>
                  </ul>
                  <p>
                    Our calculator automates these calculations and provides detailed breakdowns to help you 
                    understand the tax composition of any transaction.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Global VAT/GST Rates</h3>
                <div className="space-y-3 text-gray-600">
                  <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>United Kingdom:</span>
                      <span className="font-semibold">20%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Germany:</span>
                      <span className="font-semibold">19%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Australia:</span>
                      <span className="font-semibold">10%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>India:</span>
                      <span className="font-semibold">5-28%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Singapore:</span>
                      <span className="font-semibold">7%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>UAE:</span>
                      <span className="font-semibold">5%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Canada:</span>
                      <span className="font-semibold">5-15%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Netherlands:</span>
                      <span className="font-semibold">21%</span>
                    </div>
                  </div>
                  <p className="text-sm mt-4">
                    Tax rates vary by country and may change. Always verify current rates with local tax authorities.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Calculator Features</h3>
                <div className="space-y-3 text-gray-600">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Support for 16+ international currencies</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Pre-configured rates for 15+ countries</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Add or remove VAT/GST functionality</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Custom tax rate input option</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Detailed tax breakdown and visualization</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Instant calculations with accurate formatting</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Additional SEO Content Sections */}
          <div className="mt-12 space-y-8">
            {/* VAT vs GST Comparison */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-8">VAT vs GST: Understanding the Difference</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-blue-800">Value Added Tax (VAT)</h4>
                    <div className="space-y-3 text-gray-600">
                      <p>
                        VAT is a multi-stage tax system used primarily in European countries. It's applied at each 
                        stage of the supply chain where value is added to goods or services.
                      </p>
                      <div className="bg-blue-50 rounded-lg p-4">
                        <h5 className="font-semibold text-blue-800 mb-2">Key Characteristics:</h5>
                        <ul className="text-sm space-y-1 list-disc list-inside text-blue-700">
                          <li>Applied at multiple stages of production</li>
                          <li>Input tax credit system reduces cascading effect</li>
                          <li>Common in EU countries</li>
                          <li>Typically ranges from 17% to 27%</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-green-800">Goods and Services Tax (GST)</h4>
                    <div className="space-y-3 text-gray-600">
                      <p>
                        GST is a comprehensive tax system that consolidates multiple indirect taxes into a single 
                        tax. It's designed to eliminate tax cascading and create a unified tax structure.
                      </p>
                      <div className="bg-green-50 rounded-lg p-4">
                        <h5 className="font-semibold text-green-800 mb-2">Key Characteristics:</h5>
                        <ul className="text-sm space-y-1 list-disc list-inside text-green-700">
                          <li>Replaces multiple indirect taxes</li>
                          <li>Single tax system across jurisdictions</li>
                          <li>Used in Australia, Canada, India, Singapore</li>
                          <li>Rates vary by country and product category</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Business Applications */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
                <CardContent className="p-8">
                  <h3 className="text-xl font-bold text-gray-900 mb-6">For Businesses</h3>
                  <div className="space-y-4 text-gray-600">
                    <p className="text-sm">
                      Use our calculator to ensure accurate pricing, invoice generation, and tax compliance across different markets.
                    </p>
                    <div className="space-y-2">
                      <h4 className="font-semibold text-gray-800 text-sm">Key Benefits:</h4>
                      <ul className="text-xs space-y-1 list-disc list-inside">
                        <li>Accurate invoice calculations</li>
                        <li>Multi-currency support</li>
                        <li>International tax compliance</li>
                        <li>Pricing strategy optimization</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
                <CardContent className="p-8">
                  <h3 className="text-xl font-bold text-gray-900 mb-6">For Accountants</h3>
                  <div className="space-y-4 text-gray-600">
                    <p className="text-sm">
                      Streamline tax calculations for multiple clients across different jurisdictions with instant, accurate results.
                    </p>
                    <div className="space-y-2">
                      <h4 className="font-semibold text-gray-800 text-sm">Professional Features:</h4>
                      <ul className="text-xs space-y-1 list-disc list-inside">
                        <li>Multiple country support</li>
                        <li>Detailed breakdowns</li>
                        <li>Audit-ready calculations</li>
                        <li>Time-saving automation</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
                <CardContent className="p-8">
                  <h3 className="text-xl font-bold text-gray-900 mb-6">For Students</h3>
                  <div className="space-y-4 text-gray-600">
                    <p className="text-sm">
                      Learn tax calculations with real-world examples and understand how VAT/GST systems work globally.
                    </p>
                    <div className="space-y-2">
                      <h4 className="font-semibold text-gray-800 text-sm">Educational Value:</h4>
                      <ul className="text-xs space-y-1 list-disc list-inside">
                        <li>Interactive learning tool</li>
                        <li>Global tax system comparison</li>
                        <li>Practical application examples</li>
                        <li>Free educational resource</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Country-Specific Information */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-8">Country-Specific VAT/GST Information</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div className="border-l-4 border-blue-500 pl-4">
                      <h4 className="font-semibold text-gray-800 mb-2">European Union</h4>
                      <p className="text-sm text-gray-600 mb-2">
                        Standard VAT rates range from 17% to 27%. Reduced rates apply to essential goods and services.
                      </p>
                      <div className="text-xs text-gray-500">
                        <strong>Examples:</strong> Germany (19%), France (20%), Italy (22%), Spain (21%)
                      </div>
                    </div>
                    <div className="border-l-4 border-green-500 pl-4">
                      <h4 className="font-semibold text-gray-800 mb-2">United Kingdom</h4>
                      <p className="text-sm text-gray-600 mb-2">
                        Standard VAT rate of 20% with reduced rates of 5% for certain goods and 0% for essential items.
                      </p>
                      <div className="text-xs text-gray-500">
                        <strong>Registration threshold:</strong> £85,000 annual turnover
                      </div>
                    </div>
                    <div className="border-l-4 border-orange-500 pl-4">
                      <h4 className="font-semibold text-gray-800 mb-2">Australia</h4>
                      <p className="text-sm text-gray-600 mb-2">
                        GST rate of 10% applies to most goods and services. Some items are GST-free or input-taxed.
                      </p>
                      <div className="text-xs text-gray-500">
                        <strong>Registration threshold:</strong> AUD $75,000 annual turnover
                      </div>
                    </div>
                  </div>
                  <div className="space-y-6">
                    <div className="border-l-4 border-purple-500 pl-4">
                      <h4 className="font-semibold text-gray-800 mb-2">India</h4>
                      <p className="text-sm text-gray-600 mb-2">
                        GST structure with rates of 5%, 12%, 18%, and 28%. Essential items may have 0% or reduced rates.
                      </p>
                      <div className="text-xs text-gray-500">
                        <strong>Registration threshold:</strong> ₹20 lakhs (₹10 lakhs for special states)
                      </div>
                    </div>
                    <div className="border-l-4 border-red-500 pl-4">
                      <h4 className="font-semibold text-gray-800 mb-2">Canada</h4>
                      <p className="text-sm text-gray-600 mb-2">
                        Federal GST of 5% plus provincial sales tax varying by province. Some provinces use HST (harmonized).
                      </p>
                      <div className="text-xs text-gray-500">
                        <strong>Registration threshold:</strong> CAD $30,000 in four quarters
                      </div>
                    </div>
                    <div className="border-l-4 border-teal-500 pl-4">
                      <h4 className="font-semibold text-gray-800 mb-2">Singapore</h4>
                      <p className="text-sm text-gray-600 mb-2">
                        GST rate of 7% (increasing to 9% by 2024). Zero-rated and exempt supplies available.
                      </p>
                      <div className="text-xs text-gray-500">
                        <strong>Registration threshold:</strong> SGD $1 million annual turnover
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* FAQs Section */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-8">Frequently Asked Questions</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">What's the difference between net and gross prices?</h4>
                      <p className="text-gray-600 text-sm">
                        Net price excludes VAT/GST (the base price), while gross price includes VAT/GST (the final price customers pay). 
                        Our calculator can convert between both formats.
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">How do I know which VAT rate to use?</h4>
                      <p className="text-gray-600 text-sm">
                        VAT rates depend on your country, product category, and business circumstances. Check with local tax authorities 
                        or use our pre-configured rates as a starting point.
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">Can I use this for business invoicing?</h4>
                      <p className="text-gray-600 text-sm">
                        Yes, our calculator provides accurate results suitable for business use. However, always verify with current 
                        tax regulations and consider consulting a tax professional for complex situations.
                      </p>
                    </div>
                  </div>
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">Is VAT the same as sales tax?</h4>
                      <p className="text-gray-600 text-sm">
                        No, VAT is applied at multiple stages of production while sales tax is typically applied only at the final point 
                        of sale. VAT systems include input tax credits to avoid tax cascading.
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">Why do VAT rates vary between countries?</h4>
                      <p className="text-gray-600 text-sm">
                        Countries set their own VAT/GST rates based on economic policy, revenue requirements, and social objectives. 
                        Some items may have reduced or zero rates for social reasons.
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">How accurate are the calculations?</h4>
                      <p className="text-gray-600 text-sm">
                        Our calculator uses standard mathematical formulas and provides results accurate to two decimal places. 
                        Results are suitable for most business and academic purposes.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tips and Best Practices */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">VAT/GST Calculation Tips</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="bg-green-50 border-l-4 border-green-400 p-4 rounded-r-lg">
                      <h4 className="font-semibold text-green-800 mb-2">Always Use Current Rates</h4>
                      <p className="text-green-700 text-sm">
                        Tax rates change periodically. Always verify you're using the current rate for your jurisdiction 
                        and transaction date.
                      </p>
                    </div>
                    <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-lg">
                      <h4 className="font-semibold text-blue-800 mb-2">Consider Product Categories</h4>
                      <p className="text-blue-700 text-sm">
                        Different products may have different VAT rates. Essential items often have reduced rates, 
                        while luxury goods may have higher rates.
                      </p>
                    </div>
                    <div className="bg-purple-50 border-l-4 border-purple-400 p-4 rounded-r-lg">
                      <h4 className="font-semibold text-purple-800 mb-2">Round Appropriately</h4>
                      <p className="text-purple-700 text-sm">
                        Follow local rounding rules for tax calculations. Some jurisdictions have specific requirements 
                        for rounding VAT amounts.
                      </p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="bg-orange-50 border-l-4 border-orange-400 p-4 rounded-r-lg">
                      <h4 className="font-semibold text-orange-800 mb-2">Document Your Calculations</h4>
                      <p className="text-orange-700 text-sm">
                        Keep records of your tax calculations for audit purposes. Include the rate used, calculation method, 
                        and date of calculation.
                      </p>
                    </div>
                    <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-r-lg">
                      <h4 className="font-semibold text-red-800 mb-2">Understand Registration Thresholds</h4>
                      <p className="text-red-700 text-sm">
                        Many countries have turnover thresholds for VAT registration. Know when you need to register 
                        and start charging VAT.
                      </p>
                    </div>
                    <div className="bg-teal-50 border-l-4 border-teal-400 p-4 rounded-r-lg">
                      <h4 className="font-semibold text-teal-800 mb-2">Use Professional Advice</h4>
                      <p className="text-teal-700 text-sm">
                        For complex business situations or international transactions, consult with tax professionals 
                        to ensure compliance.
                      </p>
                    </div>
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
