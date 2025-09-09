import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Calculator, Receipt, DollarSign } from 'lucide-react';

interface VATResult {
  baseAmount: number;
  vatAmount: number;
  totalAmount: number;
  effectiveRate: number;
}

const VATGSTCalculator = () => {
  const [calculationType, setCalculationType] = useState('add-vat');
  const [amount, setAmount] = useState('');
  const [vatRate, setVatRate] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [result, setResult] = useState<VATResult | null>(null);

  // Preset VAT/GST rates for different countries
  const vatRates = {
    'custom': 'Custom Rate',
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

  const handleVatRateChange = (value: string) => {
    if (value === 'custom') {
      setVatRate('');
    } else {
      setVatRate(value);
    }
  };

  return (
    <>
      <Helmet>
        <title>VAT/GST Calculator - Calculate Value Added Tax & GST Worldwide | ToolsHub</title>
        <meta name="description" content="Free VAT/GST calculator for calculating value added tax and goods & services tax. Supports 15+ countries, 16+ currencies. Perfect for businesses, accountants, students. Get instant accurate tax calculations." />
        <meta name="keywords" content="VAT calculator, GST calculator, value added tax calculator, goods services tax calculator, tax calculator, business tax calculator, VAT calculation, GST calculation, tax rate calculator, EU VAT calculator, UK VAT calculator, Australia GST calculator, India GST calculator, international tax calculator" />
        <meta property="og:title" content="VAT/GST Calculator - Calculate Value Added Tax & GST Worldwide | ToolsHub" />
        <meta property="og:description" content="Free VAT/GST calculator for calculating value added tax and goods & services tax. Supports 15+ countries, 16+ currencies. Perfect for businesses, accountants, students. Get instant accurate tax calculations." />
        <meta property="og:type" content="website" />
        <link rel="canonical" href="/tools/vat-gst-calculator" />
      </Helmet>

      <div className="min-h-screen flex flex-col" data-testid="page-vat-gst-calculator">
        <Header />

        <main className="flex-1 bg-neutral-50">
          {/* Hero Section */}
          <section className="gradient-hero text-white py-16">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <div className="w-20 h-20 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <i className="fas fa-file-invoice text-3xl"></i>
              </div>
              <h1 className="text-4xl sm:text-5xl font-bold mb-6" data-testid="text-page-title">
                VAT/GST Calculator
              </h1>
              <p className="text-xl text-blue-100 max-w-2xl mx-auto">
                Calculate Value Added Tax (VAT) and Goods & Services Tax (GST) for multiple countries with accurate rates
              </p>
            </div>
          </section>

          {/* Calculator Section */}
          <section className="py-16">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
              <Card className="bg-white shadow-sm border-0">
                <CardContent className="p-8">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    {/* Input Section */}
                    <div className="space-y-6">
                      <h2 className="text-2xl font-semibold text-gray-900 mb-8">Tax Calculation Details</h2>

                      {/* Currency Selection */}
                      <div className="space-y-3">
                        <Label htmlFor="currency" className="text-sm font-medium text-gray-700">
                          Currency
                        </Label>
                        <Select value={currency} onValueChange={setCurrency}>
                          <SelectTrigger className="h-12 border-gray-200 rounded-lg" data-testid="select-currency">
                            <SelectValue placeholder="Select currency" />
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
                        <Label className="text-sm font-medium text-gray-700">
                          Calculation Type
                        </Label>
                        <Select value={calculationType} onValueChange={setCalculationType}>
                          <SelectTrigger className="h-12 border-gray-200 rounded-lg" data-testid="select-calculation-type">
                            <SelectValue placeholder="Select calculation type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="add-vat">Add VAT/GST to Price</SelectItem>
                            <SelectItem value="remove-vat">Remove VAT/GST from Total</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Amount Input */}
                      <div className="space-y-3">
                        <Label htmlFor="amount" className="text-sm font-medium text-gray-700">
                          {calculationType === 'add-vat' ? 'Net Amount (Excluding VAT/GST)' : 'Gross Amount (Including VAT/GST)'}
                        </Label>
                        <Input
                          id="amount"
                          type="number"
                          value={amount}
                          onChange={(e) => setAmount(e.target.value)}
                          className="h-12 text-base border-gray-200 rounded-lg"
                          placeholder="Enter amount"
                          min="0"
                          step="0.01"
                          data-testid="input-amount"
                        />
                      </div>

                      {/* VAT Rate Selection */}
                      <div className="space-y-3">
                        <Label className="text-sm font-medium text-gray-700">
                          VAT/GST Rate
                        </Label>
                        <Select value={vatRate} onValueChange={handleVatRateChange}>
                          <SelectTrigger className="h-12 border-gray-200 rounded-lg" data-testid="select-vat-rate">
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

                      {/* Custom Rate Input */}
                      {vatRate === 'custom' || (!vatRate && Object.keys(vatRates).includes(vatRate) === false) ? (
                        <div className="space-y-3">
                          <Label htmlFor="custom-rate" className="text-sm font-medium text-gray-700">
                            Custom VAT/GST Rate (%)
                          </Label>
                          <Input
                            id="custom-rate"
                            type="number"
                            value={vatRate}
                            onChange={(e) => setVatRate(e.target.value)}
                            className="h-12 text-base border-gray-200 rounded-lg"
                            placeholder="Enter custom rate"
                            min="0"
                            max="100"
                            step="0.01"
                            data-testid="input-custom-rate"
                          />
                        </div>
                      ) : null}

                      {/* Action Buttons */}
                      <div className="flex gap-4 pt-6">
                        <Button
                          onClick={calculateVAT}
                          className="flex-1 h-12 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg"
                          data-testid="button-calculate"
                        >
                          <Calculator className="w-4 h-4 mr-2" />
                          Calculate
                        </Button>
                        <Button
                          onClick={resetCalculator}
                          variant="outline"
                          className="px-8 h-12 border-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-50"
                          data-testid="button-reset"
                        >
                          Reset
                        </Button>
                      </div>
                    </div>

                    {/* Results Section */}
                    <div className="space-y-6">
                      <h2 className="text-2xl font-semibold text-gray-900 mb-8">Tax Calculation Results</h2>

                      {result ? (
                        <div className="space-y-6" data-testid="results">
                          {/* Total Amount */}
                          <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
                            <CardContent className="p-6 text-center">
                              <div className="text-lg text-green-700 mb-1">Total Amount (Including VAT/GST)</div>
                              <div className="text-4xl font-bold text-green-600">
                                {formatCurrency(result.totalAmount)}
                              </div>
                            </CardContent>
                          </Card>

                          {/* Breakdown */}
                          <Card className="border-gray-200">
                            <CardHeader>
                              <CardTitle className="text-lg text-gray-900 flex items-center gap-2">
                                <Receipt className="w-5 h-5 text-blue-600" />
                                Tax Breakdown
                              </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                              <div className="flex justify-between items-center">
                                <span className="text-gray-600">Base Amount (Net):</span>
                                <span className="font-semibold text-gray-900">{formatCurrency(result.baseAmount)}</span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-gray-600">VAT/GST Amount:</span>
                                <span className="font-semibold text-blue-600">+{formatCurrency(result.vatAmount)}</span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-gray-600">Effective Tax Rate:</span>
                                <span className="font-semibold text-gray-900">{result.effectiveRate}%</span>
                              </div>
                              <Separator />
                              <div className="flex justify-between items-center text-lg">
                                <span className="font-semibold text-gray-900">Total Amount (Gross):</span>
                                <span className="font-bold text-green-600">{formatCurrency(result.totalAmount)}</span>
                              </div>
                            </CardContent>
                          </Card>

                          {/* Quick Reference */}
                          <Card className="border-gray-200">
                            <CardHeader>
                              <CardTitle className="text-lg text-gray-900">Common VAT/GST Rates</CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                  <span className="text-gray-600">UK VAT:</span>
                                  <span className="font-medium">20%</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-600">EU Standard VAT:</span>
                                  <span className="font-medium">19-27%</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Australia GST:</span>
                                  <span className="font-medium">10%</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-600">India GST:</span>
                                  <span className="font-medium">5%, 12%, 18%, 28%</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Singapore GST:</span>
                                  <span className="font-medium">7%</span>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </div>
                      ) : (
                        <div className="text-center py-12" data-testid="no-results">
                          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <DollarSign className="w-8 h-8 text-gray-400" />
                          </div>
                          <p className="text-gray-500">
                            Enter amount and tax rate to calculate VAT/GST
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Comprehensive SEO Content Section */}
          <section className="py-16 bg-white">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-6">
                  Free VAT/GST Calculator - Calculate Value Added Tax & Goods Services Tax Worldwide
                </h2>
                <p className="text-lg text-gray-600 max-w-4xl mx-auto leading-relaxed">
                  Our comprehensive VAT/GST calculator helps businesses, accountants, and individuals calculate value added tax 
                  and goods & services tax accurately for multiple countries. Whether you're adding VAT to a price or removing 
                  GST from a total, our tool provides instant, precise calculations with detailed breakdowns.
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
                <div>
                  <h3 className="text-2xl font-semibold text-gray-900 mb-6">What is VAT/GST?</h3>
                  <div className="space-y-4 text-gray-600 leading-relaxed">
                    <p>
                      <strong>Value Added Tax (VAT)</strong> is a consumption tax levied on the value added to goods and 
                      services at each stage of production and distribution. It's widely used across Europe, with rates 
                      typically ranging from 17% to 27%.
                    </p>
                    <p>
                      <strong>Goods and Services Tax (GST)</strong> is a comprehensive indirect tax system that replaced 
                      multiple taxes in countries like India, Australia, Canada, and Singapore. GST rates vary by country 
                      and product category.
                    </p>
                    <p>
                      Both VAT and GST are consumption taxes ultimately paid by the end consumer, but collected at various 
                      stages of the supply chain to ensure better compliance and reduce tax evasion.
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="text-2xl font-semibold text-gray-900 mb-6">Key Calculator Features</h3>
                  <div className="space-y-3 text-gray-600">
                    <div className="flex items-start">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      <span>Support for 16+ major currencies including USD, EUR, GBP, INR, AUD, CAD, and more</span>
                    </div>
                    <div className="flex items-start">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      <span>Preset VAT/GST rates for 15+ countries with automatic calculation</span>
                    </div>
                    <div className="flex items-start">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      <span>Custom tax rate input for specific regional or product-based rates</span>
                    </div>
                    <div className="flex items-start">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      <span>Dual calculation modes: Add VAT/GST to price or Remove VAT/GST from total</span>
                    </div>
                    <div className="flex items-start">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      <span>Detailed breakdown showing base amount, tax amount, and total with effective rate</span>
                    </div>
                    <div className="flex items-start">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      <span>Real-time calculations with precise currency formatting</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mb-16">
                <h3 className="text-2xl font-semibold text-gray-900 mb-8 text-center">Common Use Cases</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
                    <CardContent className="p-6">
                      <h4 className="text-lg font-semibold text-blue-900 mb-3">🏪 Retail & E-commerce</h4>
                      <ul className="space-y-2 text-blue-700 text-sm">
                        <li>• Calculate final prices including VAT/GST for customers</li>
                        <li>• Determine net selling prices excluding tax</li>
                        <li>• Set competitive pricing strategies across different tax jurisdictions</li>
                        <li>• Generate accurate invoices and receipts</li>
                      </ul>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
                    <CardContent className="p-6">
                      <h4 className="text-lg font-semibold text-green-900 mb-3">💼 Business & Accounting</h4>
                      <ul className="space-y-2 text-green-700 text-sm">
                        <li>• Prepare VAT/GST returns and tax filings</li>
                        <li>• Reconcile supplier invoices and purchase records</li>
                        <li>• Calculate input tax credits and refunds</li>
                        <li>• Budget planning with accurate tax calculations</li>
                      </ul>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-purple-50 to-violet-50 border-purple-200">
                    <CardContent className="p-6">
                      <h4 className="text-lg font-semibold text-purple-900 mb-3">🌍 International Trade</h4>
                      <ul className="space-y-2 text-purple-700 text-sm">
                        <li>• Calculate import duties and taxes</li>
                        <li>• Determine landed costs for international purchases</li>
                        <li>• Compare pricing across different tax jurisdictions</li>
                        <li>• Ensure compliance with local tax regulations</li>
                      </ul>
                    </CardContent>
                  </Card>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
                <div>
                  <h3 className="text-2xl font-semibold text-gray-900 mb-6">Global VAT/GST Rates</h3>
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-lg font-semibold text-gray-800 mb-3">Europe (VAT)</h4>
                      <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                        <div className="flex justify-between">
                          <span>United Kingdom:</span>
                          <span className="font-medium">20%</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Germany:</span>
                          <span className="font-medium">19%</span>
                        </div>
                        <div className="flex justify-between">
                          <span>France:</span>
                          <span className="font-medium">20%</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Netherlands:</span>
                          <span className="font-medium">21%</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Ireland:</span>
                          <span className="font-medium">23%</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Sweden:</span>
                          <span className="font-medium">25%</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-lg font-semibold text-gray-800 mb-3">Asia-Pacific (GST/VAT)</h4>
                      <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                        <div className="flex justify-between">
                          <span>Australia:</span>
                          <span className="font-medium">10%</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Singapore:</span>
                          <span className="font-medium">7%</span>
                        </div>
                        <div className="flex justify-between">
                          <span>India:</span>
                          <span className="font-medium">5-28%</span>
                        </div>
                        <div className="flex justify-between">
                          <span>New Zealand:</span>
                          <span className="font-medium">15%</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Malaysia:</span>
                          <span className="font-medium">6%</span>
                        </div>
                        <div className="flex justify-between">
                          <span>UAE:</span>
                          <span className="font-medium">5%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-2xl font-semibold text-gray-900 mb-6">How to Use the Calculator</h3>
                  <div className="space-y-4 text-gray-600">
                    <div className="flex items-start">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-sm mr-3 mt-0.5">
                        1
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">Select Currency & Calculation Type</p>
                        <p className="text-sm">Choose your preferred currency and whether you want to add VAT/GST to a price or remove it from a total.</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-sm mr-3 mt-0.5">
                        2
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">Enter Amount</p>
                        <p className="text-sm">Input the base amount (excluding tax) or total amount (including tax) depending on your calculation type.</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-sm mr-3 mt-0.5">
                        3
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">Select Tax Rate</p>
                        <p className="text-sm">Choose from preset country rates or enter a custom VAT/GST rate for your specific requirements.</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-sm mr-3 mt-0.5">
                        4
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">Get Results</p>
                        <p className="text-sm">View detailed breakdown including base amount, tax amount, total amount, and effective tax rate.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mb-16">
                <h3 className="text-2xl font-semibold text-gray-900 mb-8 text-center">VAT vs GST: Key Differences</h3>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-gray-300 rounded-lg">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-900">Aspect</th>
                        <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-900">VAT (Value Added Tax)</th>
                        <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-900">GST (Goods & Services Tax)</th>
                      </tr>
                    </thead>
                    <tbody className="text-gray-600">
                      <tr>
                        <td className="border border-gray-300 px-4 py-3 font-medium">Primary Usage</td>
                        <td className="border border-gray-300 px-4 py-3">Primarily in European Union countries</td>
                        <td className="border border-gray-300 px-4 py-3">Australia, Canada, India, Singapore, New Zealand</td>
                      </tr>
                      <tr className="bg-gray-50">
                        <td className="border border-gray-300 px-4 py-3 font-medium">Tax Structure</td>
                        <td className="border border-gray-300 px-4 py-3">Applied at each stage of production/distribution</td>
                        <td className="border border-gray-300 px-4 py-3">Comprehensive tax replacing multiple indirect taxes</td>
                      </tr>
                      <tr>
                        <td className="border border-gray-300 px-4 py-3 font-medium">Typical Rates</td>
                        <td className="border border-gray-300 px-4 py-3">15% - 27% (varies by country)</td>
                        <td className="border border-gray-300 px-4 py-3">5% - 28% (varies by country and product)</td>
                      </tr>
                      <tr className="bg-gray-50">
                        <td className="border border-gray-300 px-4 py-3 font-medium">Calculation Method</td>
                        <td className="border border-gray-300 px-4 py-3">Same calculation principles as GST</td>
                        <td className="border border-gray-300 px-4 py-3">Same calculation principles as VAT</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16">
                <div>
                  <h3 className="text-2xl font-semibold text-gray-900 mb-6">Benefits of Using Our Calculator</h3>
                  <div className="space-y-4 text-gray-600">
                    <div className="flex items-start">
                      <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                        <span className="text-green-600 text-sm">✓</span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">Accurate Calculations</p>
                        <p className="text-sm">Precise mathematical calculations with proper rounding to avoid discrepancies</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                        <span className="text-green-600 text-sm">✓</span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">Time-Saving</p>
                        <p className="text-sm">Instant results eliminate manual calculations and reduce errors</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                        <span className="text-green-600 text-sm">✓</span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">Global Support</p>
                        <p className="text-sm">Works with multiple currencies and international tax rates</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                        <span className="text-green-600 text-sm">✓</span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">Professional Breakdown</p>
                        <p className="text-sm">Detailed results suitable for accounting and business use</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                        <span className="text-green-600 text-sm">✓</span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">Free & Accessible</p>
                        <p className="text-sm">No registration required, works on all devices and browsers</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-2xl font-semibold text-gray-900 mb-6">Frequently Asked Questions</h3>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">What's the difference between adding and removing VAT/GST?</h4>
                      <p className="text-sm text-gray-600">
                        Adding VAT/GST calculates the final price including tax from a base price. Removing VAT/GST 
                        determines the base price from a total that already includes tax.
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">Can I use this for business tax calculations?</h4>
                      <p className="text-sm text-gray-600">
                        Yes, our calculator provides professional-grade accuracy suitable for business accounting, 
                        invoicing, and tax preparation. However, always consult tax professionals for complex scenarios.
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">How accurate are the preset tax rates?</h4>
                      <p className="text-sm text-gray-600">
                        Our preset rates reflect standard rates as of the latest update. Tax rates can change, so verify 
                        current rates with official tax authorities for critical calculations.
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">Does this calculator work for all product types?</h4>
                      <p className="text-sm text-gray-600">
                        The calculator works with any tax rate you specify. Some products may have reduced rates or 
                        exemptions, so use the custom rate feature for specific product categories.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mb-16">
                <h3 className="text-2xl font-semibold text-gray-900 mb-8 text-center">Who Benefits from Our VAT/GST Calculator?</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                    <CardContent className="p-6 text-center">
                      <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-white text-2xl">🎓</span>
                      </div>
                      <h4 className="text-lg font-semibold text-blue-900 mb-3">Students & Learners</h4>
                      <ul className="space-y-2 text-blue-700 text-sm text-left">
                        <li>• Understanding tax concepts and calculations</li>
                        <li>• Completing accounting assignments</li>
                        <li>• Learning international tax systems</li>
                        <li>• Preparing for certification exams</li>
                      </ul>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                    <CardContent className="p-6 text-center">
                      <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-white text-2xl">💼</span>
                      </div>
                      <h4 className="text-lg font-semibold text-green-900 mb-3">Business Owners</h4>
                      <ul className="space-y-2 text-green-700 text-sm text-left">
                        <li>• Setting product prices including tax</li>
                        <li>• Calculating profit margins accurately</li>
                        <li>• Managing international sales tax</li>
                        <li>• Preparing tax returns and filings</li>
                      </ul>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
                    <CardContent className="p-6 text-center">
                      <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-white text-2xl">📊</span>
                      </div>
                      <h4 className="text-lg font-semibold text-purple-900 mb-3">Accountants & CFOs</h4>
                      <ul className="space-y-2 text-purple-700 text-sm text-left">
                        <li>• Quick verification of tax calculations</li>
                        <li>• Client consultations and presentations</li>
                        <li>• Cross-border transaction analysis</li>
                        <li>• Financial reporting accuracy</li>
                      </ul>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
                    <CardContent className="p-6 text-center">
                      <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-white text-2xl">🛒</span>
                      </div>
                      <h4 className="text-lg font-semibold text-orange-900 mb-3">Smart Shoppers</h4>
                      <ul className="space-y-2 text-orange-700 text-sm text-left">
                        <li>• Understanding true product costs</li>
                        <li>• Comparing prices across countries</li>
                        <li>• Planning international purchases</li>
                        <li>• Budget planning with accurate totals</li>
                      </ul>
                    </CardContent>
                  </Card>
                </div>
              </div>

              <div className="mb-16">
                <h3 className="text-2xl font-semibold text-gray-900 mb-8 text-center">Advanced VAT/GST Calculation Scenarios</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div>
                    <h4 className="text-xl font-semibold text-gray-800 mb-4">Multi-Rate Calculations</h4>
                    <div className="space-y-3 text-gray-600">
                      <p>
                        Many countries apply different VAT/GST rates to different product categories. For example, 
                        in the UK, most goods are subject to 20% VAT, but some items like children's clothing, 
                        books, and food are zero-rated or subject to reduced rates.
                      </p>
                      <p className="font-medium text-gray-800">Common Rate Categories:</p>
                      <ul className="space-y-1 text-sm">
                        <li>• <strong>Standard Rate:</strong> Applied to most goods and services</li>
                        <li>• <strong>Reduced Rate:</strong> Applied to essential items (food, medicine)</li>
                        <li>• <strong>Zero Rate:</strong> Technically taxable but at 0% (exports, books)</li>
                        <li>• <strong>Exempt:</strong> Not subject to VAT/GST (insurance, postal services)</li>
                      </ul>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-xl font-semibold text-gray-800 mb-4">Cross-Border Considerations</h4>
                    <div className="space-y-3 text-gray-600">
                      <p>
                        International transactions require careful VAT/GST calculation. EU businesses must 
                        consider reverse charge mechanisms, while non-EU imports may be subject to both 
                        VAT and customs duties.
                      </p>
                      <p className="font-medium text-gray-800">Key Considerations:</p>
                      <ul className="space-y-1 text-sm">
                        <li>• <strong>Place of Supply Rules:</strong> Determines which country's VAT applies</li>
                        <li>• <strong>Reverse Charge:</strong> Buyer pays VAT instead of seller</li>
                        <li>• <strong>Import VAT:</strong> Additional tax on goods entering a country</li>
                        <li>• <strong>Digital Services:</strong> Special rules for online services</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mb-16">
                <h3 className="text-2xl font-semibold text-gray-900 mb-8 text-center">Related Financial Tools</h3>
                <p className="text-center text-gray-600 mb-8 max-w-3xl mx-auto">
                  Enhance your financial calculations with our comprehensive suite of tools designed for businesses, 
                  professionals, and individuals managing their finances.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <Card className="hover:shadow-lg transition-shadow border-gray-200">
                    <CardContent className="p-6">
                      <div className="flex items-center mb-3">
                        <Calculator className="w-6 h-6 text-blue-600 mr-3" />
                        <h4 className="text-lg font-semibold text-gray-900">
                          <a href="/tools/percentage-calculator" className="text-blue-600 hover:text-blue-800">
                            Percentage Calculator
                          </a>
                        </h4>
                      </div>
                      <p className="text-gray-600 text-sm mb-3">
                        Calculate percentages, percentage increases, decreases, and find what percentage one number is of another.
                      </p>
                      <span className="text-xs text-blue-600 font-medium">Essential for Tax Calculations →</span>
                    </CardContent>
                  </Card>

                  <Card className="hover:shadow-lg transition-shadow border-gray-200">
                    <CardContent className="p-6">
                      <div className="flex items-center mb-3">
                        <DollarSign className="w-6 h-6 text-green-600 mr-3" />
                        <h4 className="text-lg font-semibold text-gray-900">
                          <a href="/tools/discount-calculator" className="text-blue-600 hover:text-blue-800">
                            Discount Calculator
                          </a>
                        </h4>
                      </div>
                      <p className="text-gray-600 text-sm mb-3">
                        Calculate sale prices, discount amounts, and savings on products with multiple discount types.
                      </p>
                      <span className="text-xs text-green-600 font-medium">Perfect for Retail Pricing →</span>
                    </CardContent>
                  </Card>

                  <Card className="hover:shadow-lg transition-shadow border-gray-200">
                    <CardContent className="p-6">
                      <div className="flex items-center mb-3">
                        <Receipt className="w-6 h-6 text-purple-600 mr-3" />
                        <h4 className="text-lg font-semibold text-gray-900">
                          <a href="/tools/paypal-fee-calculator" className="text-blue-600 hover:text-blue-800">
                            PayPal Fee Calculator
                          </a>
                        </h4>
                      </div>
                      <p className="text-gray-600 text-sm mb-3">
                        Calculate PayPal transaction fees for international and domestic payments with accurate rates.
                      </p>
                      <span className="text-xs text-purple-600 font-medium">Essential for Online Business →</span>
                    </CardContent>
                  </Card>

                  <Card className="hover:shadow-lg transition-shadow border-gray-200">
                    <CardContent className="p-6">
                      <div className="flex items-center mb-3">
                        <Calculator className="w-6 h-6 text-orange-600 mr-3" />
                        <h4 className="text-lg font-semibold text-gray-900">
                          <a href="/tools/currency-converter" className="text-blue-600 hover:text-blue-800">
                            Currency Converter
                          </a>
                        </h4>
                      </div>
                      <p className="text-gray-600 text-sm mb-3">
                        Convert between 180+ world currencies with real-time exchange rates for accurate calculations.
                      </p>
                      <span className="text-xs text-orange-600 font-medium">For Global Transactions →</span>
                    </CardContent>
                  </Card>

                  <Card className="hover:shadow-lg transition-shadow border-gray-200">
                    <CardContent className="p-6">
                      <div className="flex items-center mb-3">
                        <DollarSign className="w-6 h-6 text-red-600 mr-3" />
                        <h4 className="text-lg font-semibold text-gray-900">
                          <a href="/tools/loan-calculator" className="text-blue-600 hover:text-blue-800">
                            Loan Calculator
                          </a>
                        </h4>
                      </div>
                      <p className="text-gray-600 text-sm mb-3">
                        Calculate monthly payments, total interest, and loan schedules for various types of loans.
                      </p>
                      <span className="text-xs text-red-600 font-medium">For Financial Planning →</span>
                    </CardContent>
                  </Card>

                  <Card className="hover:shadow-lg transition-shadow border-gray-200">
                    <CardContent className="p-6">
                      <div className="flex items-center mb-3">
                        <Calculator className="w-6 h-6 text-indigo-600 mr-3" />
                        <h4 className="text-lg font-semibold text-gray-900">
                          <a href="/tools/roi-calculator" className="text-blue-600 hover:text-blue-800">
                            ROI Calculator
                          </a>
                        </h4>
                      </div>
                      <p className="text-gray-600 text-sm mb-3">
                        Calculate return on investment for business decisions, marketing campaigns, and investments.
                      </p>
                      <span className="text-xs text-indigo-600 font-medium">For Investment Analysis →</span>
                    </CardContent>
                  </Card>
                </div>
              </div>

              <div className="mb-16">
                <h3 className="text-2xl font-semibold text-gray-900 mb-8 text-center">VAT/GST Calculator Tips & Best Practices</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div>
                    <h4 className="text-xl font-semibold text-gray-800 mb-4">💡 Pro Tips for Accurate Calculations</h4>
                    <div className="space-y-4">
                      <div className="flex items-start">
                        <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                          <span className="text-blue-600 text-sm font-bold">1</span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-800">Always Use Current Tax Rates</p>
                          <p className="text-sm text-gray-600">Tax rates change frequently. Verify current rates with official tax authorities for important calculations.</p>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                          <span className="text-blue-600 text-sm font-bold">2</span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-800">Consider Rounding Rules</p>
                          <p className="text-sm text-gray-600">Different countries have different rounding rules for tax calculations. Some round to nearest cent, others truncate.</p>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                          <span className="text-blue-600 text-sm font-bold">3</span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-800">Document Your Calculations</p>
                          <p className="text-sm text-gray-600">Keep records of tax calculations for auditing purposes and to ensure consistency in pricing.</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-xl font-semibold text-gray-800 mb-4">⚠️ Common Calculation Mistakes</h4>
                    <div className="space-y-4">
                      <div className="flex items-start">
                        <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                          <span className="text-red-600 text-sm font-bold">×</span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-800">Confusing Inclusive vs Exclusive Prices</p>
                          <p className="text-sm text-gray-600">Always clarify whether prices include or exclude tax before calculating.</p>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                          <span className="text-red-600 text-sm font-bold">×</span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-800">Using Wrong Tax Rates</p>
                          <p className="text-sm text-gray-600">Different products may have different tax rates. Always verify the correct rate for your specific item.</p>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                          <span className="text-red-600 text-sm font-bold">×</span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-800">Ignoring Local Variations</p>
                          <p className="text-sm text-gray-600">Some regions have additional local taxes on top of standard VAT/GST rates.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="text-center bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-8">
                <h3 className="text-2xl font-semibold text-gray-900 mb-4">Complete Your Financial Toolkit</h3>
                <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
                  Explore our comprehensive suite of financial calculators designed for businesses, professionals, 
                  and individuals. From tax calculations to investment planning, we have the tools you need.
                </p>
                <div className="flex flex-wrap justify-center gap-3 mb-6">
                  <a href="/tools/business-loan-calculator" className="inline-block bg-white px-4 py-2 rounded-full text-sm text-gray-700 border hover:bg-gray-50 transition-colors">
                    Business Loan Calculator
                  </a>
                  <a href="/tools/compound-interest-calculator" className="inline-block bg-white px-4 py-2 rounded-full text-sm text-gray-700 border hover:bg-gray-50 transition-colors">
                    Compound Interest Calculator
                  </a>
                  <a href="/tools/mortgage-calculator" className="inline-block bg-white px-4 py-2 rounded-full text-sm text-gray-700 border hover:bg-gray-50 transition-colors">
                    Mortgage Calculator
                  </a>
                  <a href="/tools/retirement-calculator" className="inline-block bg-white px-4 py-2 rounded-full text-sm text-gray-700 border hover:bg-gray-50 transition-colors">
                    Retirement Calculator
                  </a>
                  <a href="/tools/break-even-calculator" className="inline-block bg-white px-4 py-2 rounded-full text-sm text-gray-700 border hover:bg-gray-50 transition-colors">
                    Break-Even Calculator
                  </a>
                </div>
                <a 
                  href="/tools/finance-tools" 
                  className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  View All Financial Tools
                </a>
              </div>
            </div>
          </section>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default VATGSTCalculator;