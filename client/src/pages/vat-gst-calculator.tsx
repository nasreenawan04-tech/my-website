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
        <title>VAT/GST Calculator - Calculate Value Added Tax & GST Worldwide | DapsiWow</title>
        <meta name="description" content="Free VAT/GST calculator for calculating value added tax and goods & services tax. Supports 15+ countries, 16+ currencies. Perfect for businesses, accountants, students. Get instant accurate tax calculations." />
        <meta name="keywords" content="VAT calculator, GST calculator, value added tax calculator, goods services tax calculator, tax calculator, business tax calculator, VAT calculation, GST calculation, tax rate calculator, EU VAT calculator, UK VAT calculator, Australia GST calculator, India GST calculator, international tax calculator" />
        <meta property="og:title" content="VAT/GST Calculator - Calculate Value Added Tax & GST Worldwide | DapsiWow" />
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

          
        </main>

        <Footer />
      </div>
    </>
  );
};

export default VATGSTCalculator;