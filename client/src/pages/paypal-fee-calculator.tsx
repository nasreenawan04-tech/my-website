
import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface PayPalFeeResult {
  originalAmount: number;
  paypalFee: number;
  netAmount: number;
  grossAmount: number;
  effectiveFeeRate: number;
}

const PayPalFeeCalculator = () => {
  const [calculationType, setCalculationType] = useState('receiving');
  const [amount, setAmount] = useState('');
  const [transactionType, setTransactionType] = useState('domestic');
  const [currency, setCurrency] = useState('USD');
  const [accountType, setAccountType] = useState('personal');
  const [result, setResult] = useState<PayPalFeeResult | null>(null);

  // PayPal fee structures (as of 2024 - rates may vary)
  const getFeeStructure = () => {
    const structures: { [key: string]: { [key: string]: { rate: number; fixed: number } } } = {
      'personal-domestic': {
        'USD': { rate: 2.9, fixed: 0.30 },
        'EUR': { rate: 2.9, fixed: 0.35 },
        'GBP': { rate: 2.9, fixed: 0.30 },
        'CAD': { rate: 2.9, fixed: 0.30 },
        'AUD': { rate: 2.6, fixed: 0.30 },
        'JPY': { rate: 2.9, fixed: 40 },
        'CHF': { rate: 2.9, fixed: 0.30 },
        'SEK': { rate: 2.9, fixed: 3.25 },
        'NOK': { rate: 2.9, fixed: 2.80 },
        'DKK': { rate: 2.9, fixed: 2.60 },
        'SGD': { rate: 2.9, fixed: 0.50 },
        'HKD': { rate: 2.9, fixed: 2.35 },
        'default': { rate: 2.9, fixed: 0.30 }
      },
      'personal-international': {
        'USD': { rate: 4.4, fixed: 0.30 },
        'EUR': { rate: 4.4, fixed: 0.35 },
        'GBP': { rate: 4.4, fixed: 0.30 },
        'CAD': { rate: 4.4, fixed: 0.30 },
        'AUD': { rate: 4.1, fixed: 0.30 },
        'JPY': { rate: 4.4, fixed: 40 },
        'CHF': { rate: 4.4, fixed: 0.30 },
        'SEK': { rate: 4.4, fixed: 3.25 },
        'NOK': { rate: 4.4, fixed: 2.80 },
        'DKK': { rate: 4.4, fixed: 2.60 },
        'SGD': { rate: 4.4, fixed: 0.50 },
        'HKD': { rate: 4.4, fixed: 2.35 },
        'default': { rate: 4.4, fixed: 0.30 }
      },
      'business-domestic': {
        'USD': { rate: 2.9, fixed: 0.30 },
        'EUR': { rate: 2.9, fixed: 0.35 },
        'GBP': { rate: 2.9, fixed: 0.30 },
        'CAD': { rate: 2.9, fixed: 0.30 },
        'AUD': { rate: 2.6, fixed: 0.30 },
        'JPY': { rate: 2.9, fixed: 40 },
        'CHF': { rate: 2.9, fixed: 0.30 },
        'SEK': { rate: 2.9, fixed: 3.25 },
        'NOK': { rate: 2.9, fixed: 2.80 },
        'DKK': { rate: 2.9, fixed: 2.60 },
        'SGD': { rate: 2.9, fixed: 0.50 },
        'HKD': { rate: 2.9, fixed: 2.35 },
        'default': { rate: 2.9, fixed: 0.30 }
      },
      'business-international': {
        'USD': { rate: 4.4, fixed: 0.30 },
        'EUR': { rate: 4.4, fixed: 0.35 },
        'GBP': { rate: 4.4, fixed: 0.30 },
        'CAD': { rate: 4.4, fixed: 0.30 },
        'AUD': { rate: 4.1, fixed: 0.30 },
        'JPY': { rate: 4.4, fixed: 40 },
        'CHF': { rate: 4.4, fixed: 0.30 },
        'SEK': { rate: 4.4, fixed: 3.25 },
        'NOK': { rate: 4.4, fixed: 2.80 },
        'DKK': { rate: 4.4, fixed: 2.60 },
        'SGD': { rate: 4.4, fixed: 0.50 },
        'HKD': { rate: 4.4, fixed: 2.35 },
        'default': { rate: 4.4, fixed: 0.30 }
      }
    };

    const key = `${accountType}-${transactionType}`;
    const structure = structures[key] || structures['personal-domestic'];
    return structure[currency] || structure['default'];
  };

  const calculatePayPalFee = () => {
    const inputAmount = parseFloat(amount);
    if (isNaN(inputAmount) || inputAmount <= 0) return;

    const feeStructure = getFeeStructure();
    let originalAmount: number, paypalFee: number, netAmount: number, grossAmount: number;

    if (calculationType === 'receiving') {
      // Calculate fee when receiving money
      grossAmount = inputAmount;
      paypalFee = (grossAmount * feeStructure.rate / 100) + feeStructure.fixed;
      netAmount = grossAmount - paypalFee;
      originalAmount = grossAmount;
    } else {
      // Calculate total needed to receive specific net amount
      netAmount = inputAmount;
      // Solve: netAmount = grossAmount - (grossAmount * rate/100 + fixed)
      // netAmount = grossAmount * (1 - rate/100) - fixed
      // grossAmount = (netAmount + fixed) / (1 - rate/100)
      grossAmount = (netAmount + feeStructure.fixed) / (1 - feeStructure.rate / 100);
      paypalFee = grossAmount - netAmount;
      originalAmount = netAmount;
    }

    const effectiveFeeRate = grossAmount > 0 ? (paypalFee / grossAmount) * 100 : 0;

    setResult({
      originalAmount: Math.round(originalAmount * 100) / 100,
      paypalFee: Math.round(paypalFee * 100) / 100,
      netAmount: Math.round(netAmount * 100) / 100,
      grossAmount: Math.round(grossAmount * 100) / 100,
      effectiveFeeRate: Math.round(effectiveFeeRate * 100) / 100
    });
  };

  const resetCalculator = () => {
    setAmount('');
    setCalculationType('receiving');
    setTransactionType('domestic');
    setCurrency('USD');
    setAccountType('personal');
    setResult(null);
  };

  const formatCurrency = (amount: number) => {
    const currencyMap: { [key: string]: { locale: string; currency: string } } = {
      USD: { locale: 'en-US', currency: 'USD' },
      EUR: { locale: 'de-DE', currency: 'EUR' },
      GBP: { locale: 'en-GB', currency: 'GBP' },
      CAD: { locale: 'en-CA', currency: 'CAD' },
      AUD: { locale: 'en-AU', currency: 'AUD' },
      JPY: { locale: 'ja-JP', currency: 'JPY' },
      CHF: { locale: 'de-CH', currency: 'CHF' },
      SEK: { locale: 'sv-SE', currency: 'SEK' },
      NOK: { locale: 'nb-NO', currency: 'NOK' },
      DKK: { locale: 'da-DK', currency: 'DKK' },
      SGD: { locale: 'en-SG', currency: 'SGD' },
      HKD: { locale: 'en-HK', currency: 'HKD' }
    };

    const config = currencyMap[currency] || currencyMap.USD;
    
    return new Intl.NumberFormat(config.locale, {
      style: 'currency',
      currency: config.currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  const getCurrentFeeStructure = () => {
    const feeStructure = getFeeStructure();
    return {
      rate: feeStructure.rate,
      fixed: feeStructure.fixed
    };
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Helmet>
        <title>PayPal Fee Calculator - Calculate PayPal Transaction Fees | DapsiWow</title>
        <meta name="description" content="Free PayPal fee calculator to calculate transaction fees for receiving money, sending payments, and international transfers. Supports 12+ currencies, personal & business accounts. Perfect for freelancers, online sellers, and businesses." />
        <meta name="keywords" content="paypal fee calculator, paypal transaction fees, paypal fees, online payment calculator, paypal cost calculator, paypal business fees, international paypal fees, paypal merchant fees, freelancer paypal calculator, paypal selling fees, paypal invoice fees, paypal cross border fees, paypal fee structure, paypal rates, payment processing fees" />
        <meta property="og:title" content="PayPal Fee Calculator - Calculate PayPal Transaction Fees | DapsiWow" />
        <meta property="og:description" content="Free PayPal fee calculator to calculate transaction fees for receiving money, sending payments, and international transfers. Supports 12+ currencies, personal & business accounts. Perfect for freelancers, online sellers, and businesses." />
        <meta property="og:type" content="website" />
        <meta name="robots" content="index, follow" />
        <meta name="author" content="DapsiWow" />
        <link rel="canonical" href="https://dapsiwow.com/tools/paypal-fee-calculator" />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            "name": "PayPal Fee Calculator",
            "description": "Free online PayPal fee calculator to calculate transaction fees for domestic and international payments across multiple currencies. Supports personal and business accounts with accurate fee calculations.",
            "url": "https://dapsiwow.com/tools/paypal-fee-calculator",
            "applicationCategory": "FinanceApplication",
            "operatingSystem": "Any",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "USD"
            },
            "featureList": [
              "Calculate PayPal transaction fees",
              "Support for 12+ currencies",
              "Personal and business account types",
              "Domestic and international transactions",
              "Real-time fee calculations",
              "Net amount calculations"
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
                <span className="text-sm font-medium text-blue-700">Professional PayPal Calculator</span>
              </div>
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-slate-900 leading-tight">
                PayPal Fee
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                  Calculator
                </span>
              </h1>
              <p className="text-xl sm:text-2xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
                Calculate PayPal transaction fees for domestic and international payments across multiple currencies
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
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">Fee Configuration</h2>
                    <p className="text-gray-600">Enter your transaction details to calculate PayPal fees</p>
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
                          <SelectItem value="CAD">CAD - Canadian Dollar</SelectItem>
                          <SelectItem value="AUD">AUD - Australian Dollar</SelectItem>
                          <SelectItem value="JPY">JPY - Japanese Yen</SelectItem>
                          <SelectItem value="CHF">CHF - Swiss Franc</SelectItem>
                          <SelectItem value="SEK">SEK - Swedish Krona</SelectItem>
                          <SelectItem value="NOK">NOK - Norwegian Krone</SelectItem>
                          <SelectItem value="DKK">DKK - Danish Krone</SelectItem>
                          <SelectItem value="SGD">SGD - Singapore Dollar</SelectItem>
                          <SelectItem value="HKD">HKD - Hong Kong Dollar</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Account Type */}
                    <div className="space-y-3">
                      <Label className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                        Account Type
                      </Label>
                      <Select value={accountType} onValueChange={setAccountType}>
                        <SelectTrigger className="h-14 border-2 border-gray-200 rounded-xl text-lg" data-testid="select-account-type">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="personal">Personal Account</SelectItem>
                          <SelectItem value="business">Business Account</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Transaction Type */}
                    <div className="space-y-3">
                      <Label className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                        Transaction Type
                      </Label>
                      <Select value={transactionType} onValueChange={setTransactionType}>
                        <SelectTrigger className="h-14 border-2 border-gray-200 rounded-xl text-lg" data-testid="select-transaction-type">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="domestic">Domestic Transaction</SelectItem>
                          <SelectItem value="international">International Transaction</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Calculation Type */}
                    <div className="space-y-3">
                      <Label className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                        Calculation Mode
                      </Label>
                      <Select value={calculationType} onValueChange={setCalculationType}>
                        <SelectTrigger className="h-14 border-2 border-gray-200 rounded-xl text-lg" data-testid="select-calculation-type">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="receiving">Fee when receiving money</SelectItem>
                          <SelectItem value="sending">Amount needed to send</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Amount Input */}
                    <div className="space-y-3 md:col-span-2">
                      <Label htmlFor="amount" className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                        {calculationType === 'receiving' 
                          ? 'Amount You Will Receive (Gross)' 
                          : 'Amount You Want to Receive (Net)'
                        }
                      </Label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-lg">$</span>
                        <Input
                          id="amount"
                          type="number"
                          value={amount}
                          onChange={(e) => setAmount(e.target.value)}
                          className="h-14 pl-8 text-lg border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-blue-500"
                          placeholder="Enter amount"
                          min="0"
                          step="0.01"
                          data-testid="input-amount"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Current Fee Structure Display */}
                  <div className="bg-gray-50 rounded-xl p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Current Fee Structure</h3>
                    {(() => {
                      const feeStructure = getCurrentFeeStructure();
                      return (
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600">Variable Rate:</span>
                            <span className="font-semibold text-gray-900">{feeStructure.rate}%</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600">Fixed Fee:</span>
                            <span className="font-semibold text-gray-900">{formatCurrency(feeStructure.fixed)}</span>
                          </div>
                          <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                            <span className="text-gray-600">Account Type:</span>
                            <span className="font-semibold text-gray-900 capitalize">{accountType}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600">Transaction Type:</span>
                            <span className="font-semibold text-gray-900 capitalize">{transactionType}</span>
                          </div>
                        </div>
                      );
                    })()}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-4 pt-6">
                    <Button
                      onClick={calculatePayPalFee}
                      className="flex-1 h-14 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold text-lg rounded-xl shadow-lg transform transition-all duration-200 hover:scale-105"
                      data-testid="button-calculate"
                    >
                      Calculate Fees
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
                    <div className="space-y-6" data-testid="paypal-results">
                      {/* Net Amount Highlight */}
                      <div className="bg-white rounded-2xl p-6 shadow-lg border border-blue-100">
                        <div className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-2">
                          {calculationType === 'receiving' ? 'Amount You Keep (Net)' : 'You Need to Request (Gross)'}
                        </div>
                        <div className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600" data-testid="text-main-result">
                          {calculationType === 'receiving' 
                            ? formatCurrency(result.netAmount)
                            : formatCurrency(result.grossAmount)
                          }
                        </div>
                      </div>

                      {/* Fee Breakdown */}
                      <div className="space-y-4">
                        <div className="bg-white rounded-xl p-4 shadow-sm">
                          <div className="flex justify-between items-center">
                            <span className="font-medium text-gray-700">Gross Amount</span>
                            <span className="font-bold text-gray-900" data-testid="text-gross-amount">
                              {formatCurrency(result.grossAmount)}
                            </span>
                          </div>
                        </div>
                        <div className="bg-white rounded-xl p-4 shadow-sm">
                          <div className="flex justify-between items-center">
                            <span className="font-medium text-gray-700">PayPal Fee</span>
                            <span className="font-bold text-red-600" data-testid="text-paypal-fee">
                              {formatCurrency(result.paypalFee)}
                            </span>
                          </div>
                        </div>
                        <div className="bg-white rounded-xl p-4 shadow-sm">
                          <div className="flex justify-between items-center">
                            <span className="font-medium text-gray-700">Net Amount</span>
                            <span className="font-bold text-green-600" data-testid="text-net-amount">
                              {formatCurrency(result.netAmount)}
                            </span>
                          </div>
                        </div>
                        <div className="bg-white rounded-xl p-4 shadow-sm">
                          <div className="flex justify-between items-center">
                            <span className="font-medium text-gray-700">Effective Fee Rate</span>
                            <span className="font-bold text-gray-900" data-testid="text-effective-rate">
                              {result.effectiveFeeRate}%
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Fee Impact Analysis */}
                      <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-xl p-6 border border-orange-200">
                        <h4 className="font-bold text-orange-800 mb-4 text-lg">Fee Impact</h4>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-orange-700 font-medium">Fee Amount:</span>
                            <span className="font-bold text-orange-800 text-lg">
                              {formatCurrency(result.paypalFee)}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-orange-700 font-medium">Fee Percentage:</span>
                            <span className="font-bold text-orange-800 text-lg">
                              {result.effectiveFeeRate}%
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-16" data-testid="no-results">
                      <div className="w-20 h-20 bg-gray-200 rounded-full mx-auto mb-6 flex items-center justify-center">
                        <div className="text-3xl font-bold text-gray-400">$</div>
                      </div>
                      <p className="text-gray-500 text-lg">Enter transaction details to calculate PayPal fees</p>
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
                <h3 className="text-2xl font-bold text-gray-900 mb-6">What is a PayPal Fee Calculator?</h3>
                <div className="space-y-4 text-gray-600">
                  <p>
                    A PayPal fee calculator is an essential financial tool that helps online sellers, freelancers, 
                    and businesses understand the exact cost of receiving payments through PayPal. By calculating 
                    PayPal transaction fees accurately, you can price your products and services appropriately 
                    to maintain profit margins.
                  </p>
                  <p>
                    Our calculator supports both personal and business PayPal accounts across 12+ major currencies, 
                    providing accurate fee calculations for domestic and international transactions. Whether you're 
                    selling on eBay, accepting freelance payments, or running an e-commerce business, this tool 
                    ensures you know exactly how much you'll receive after PayPal fees.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">How PayPal Fees Work</h3>
                <div className="space-y-4 text-gray-600">
                  <p>
                    PayPal charges fees based on a combination of a percentage of the transaction amount plus 
                    a fixed fee. The exact rate depends on several factors including your account type, 
                    transaction type (domestic vs. international), and the currency involved.
                  </p>
                  <ul className="space-y-2 list-disc list-inside">
                    <li>Domestic transactions: Typically 2.9% + fixed fee</li>
                    <li>International transactions: Usually 4.4% + fixed fee</li>
                    <li>Business accounts: May qualify for lower rates with volume</li>
                    <li>Currency conversions: Additional fees may apply</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Features of Our PayPal Calculator</h3>
                <div className="space-y-3 text-gray-600">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Support for 12+ international currencies</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Personal and business account calculations</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Domestic and international transaction support</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Real-time fee calculations with current rates</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Reverse calculations for net amount planning</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Benefits for Different Users</h3>
                <div className="space-y-3 text-gray-600">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Freelancers: Plan project pricing with fee consideration</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Online sellers: Optimize product pricing strategies</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Small businesses: Accurate financial planning</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>E-commerce stores: Calculate true profit margins</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Service providers: Quote accurate final prices</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Additional SEO Content Sections */}
          <div className="mt-12 space-y-8">
            {/* PayPal Account Types */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">PayPal Account Types and Their Fees</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-gray-800">Personal Accounts</h4>
                    <p className="text-gray-600">
                      Personal PayPal accounts are designed for individual users who occasionally send or receive 
                      money. They offer basic functionality with standard fee structures. Personal accounts are 
                      ideal for casual sellers, friends and family transactions, and small-scale online activities.
                    </p>
                    <div className="bg-blue-50 rounded-lg p-4">
                      <h5 className="font-semibold text-blue-800 mb-2">Typical Fees:</h5>
                      <ul className="text-sm text-blue-700 space-y-1">
                        <li>• Domestic: 2.9% + fixed fee</li>
                        <li>• International: 4.4% + fixed fee</li>
                        <li>• Friends & Family: Often free domestically</li>
                      </ul>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-gray-800">Business Accounts</h4>
                    <p className="text-gray-600">
                      Business PayPal accounts provide enhanced features for merchants and companies. They offer 
                      advanced tools for inventory management, invoicing, and customer relationship management. 
                      Business accounts may qualify for volume discounts and lower transaction fees.
                    </p>
                    <div className="bg-green-50 rounded-lg p-4">
                      <h5 className="font-semibold text-green-800 mb-2">Benefits:</h5>
                      <ul className="text-sm text-green-700 space-y-1">
                        <li>• Volume-based fee reductions</li>
                        <li>• Advanced reporting tools</li>
                        <li>• Multiple user access</li>
                        <li>• Enhanced customer support</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Transaction Types and Fees */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
                <CardContent className="p-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">Domestic vs International Transactions</h3>
                  <div className="space-y-4 text-gray-600">
                    <div className="border-l-4 border-blue-500 pl-4">
                      <h4 className="font-semibold text-gray-800 mb-2">Domestic Transactions</h4>
                      <p className="text-sm">Transactions within the same country typically have lower fees. For example, 
                      a US-to-US transaction usually costs 2.9% + $0.30, making domestic sales more profitable.</p>
                    </div>
                    <div className="border-l-4 border-orange-500 pl-4">
                      <h4 className="font-semibold text-gray-800 mb-2">International Transactions</h4>
                      <p className="text-sm">Cross-border payments incur higher fees due to currency conversion and 
                      increased processing complexity. International fees typically range from 4.4% + fixed fee.</p>
                    </div>
                    <div className="border-l-4 border-green-500 pl-4">
                      <h4 className="font-semibold text-gray-800 mb-2">Currency Considerations</h4>
                      <p className="text-sm">When receiving payments in different currencies, PayPal applies its 
                      exchange rate plus a conversion fee, which can add 2.5-4% to the total cost.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
                <CardContent className="p-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">Fee Optimization Strategies</h3>
                  <div className="space-y-4 text-gray-600">
                    <div className="bg-blue-50 rounded-lg p-4">
                      <h4 className="font-semibold text-blue-800 mb-2">Pricing Strategy</h4>
                      <p className="text-sm text-blue-700">Build PayPal fees into your product pricing to maintain 
                      desired profit margins. Use our calculator to determine the gross amount needed for your target net income.</p>
                    </div>
                    <div className="bg-green-50 rounded-lg p-4">
                      <h4 className="font-semibold text-green-800 mb-2">Volume Discounts</h4>
                      <p className="text-sm text-green-700">Business accounts with high monthly volumes may qualify 
                      for reduced rates. Consider upgrading if you process significant transaction volumes.</p>
                    </div>
                    <div className="bg-purple-50 rounded-lg p-4">
                      <h4 className="font-semibold text-purple-800 mb-2">Alternative Payment Methods</h4>
                      <p className="text-sm text-purple-700">For large transactions, consider direct bank transfers 
                      or alternative payment processors that may offer lower fees for your specific use case.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Industry-Specific Usage */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-8">PayPal Fee Calculator for Different Industries</h3>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-gray-800">E-commerce & Retail</h4>
                    <p className="text-gray-600 text-sm">
                      Online retailers need to calculate PayPal fees to price products competitively while maintaining 
                      healthy profit margins. Factor in domestic vs. international sales ratios for accurate planning.
                    </p>
                    <div className="space-y-2">
                      <h5 className="font-medium text-gray-700">Key Considerations:</h5>
                      <ul className="text-xs text-gray-600 space-y-1 list-disc list-inside">
                        <li>Average order value impact on fee percentage</li>
                        <li>International shipping and fee combinations</li>
                        <li>Volume-based pricing negotiations</li>
                        <li>Chargeback and dispute costs</li>
                      </ul>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-gray-800">Freelancing & Services</h4>
                    <p className="text-gray-600 text-sm">
                      Freelancers and service providers must account for PayPal fees when quoting project rates. 
                      International clients often result in higher fees that should be considered in pricing strategies.
                    </p>
                    <div className="space-y-2">
                      <h5 className="font-medium text-gray-700">Common Scenarios:</h5>
                      <ul className="text-xs text-gray-600 space-y-1 list-disc list-inside">
                        <li>Hourly rate calculations with fee inclusion</li>
                        <li>Project-based pricing strategies</li>
                        <li>Multi-currency client management</li>
                        <li>Invoice payment processing costs</li>
                      </ul>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-gray-800">Digital Products & SaaS</h4>
                    <p className="text-gray-600 text-sm">
                      Digital product sellers and SaaS companies benefit from understanding PayPal fees to optimize 
                      subscription pricing and one-time purchase models across global markets.
                    </p>
                    <div className="space-y-2">
                      <h5 className="font-medium text-gray-700">Strategic Planning:</h5>
                      <ul className="text-xs text-gray-600 space-y-1 list-disc list-inside">
                        <li>Subscription tier pricing optimization</li>
                        <li>Geographic pricing strategies</li>
                        <li>Annual vs. monthly payment incentives</li>
                        <li>Multi-currency subscription management</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* FAQ Section */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-8">Frequently Asked Questions about PayPal Fees</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">How often do PayPal fees change?</h4>
                      <p className="text-gray-600 text-sm">PayPal typically reviews and updates their fee structure annually or when market conditions change. Always check PayPal's official website for the most current rates, as our calculator reflects general industry standards but may not capture the latest changes immediately.</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">Can I avoid PayPal fees completely?</h4>
                      <p className="text-gray-600 text-sm">While most PayPal transactions incur fees, some exceptions exist like domestic friends and family transfers (though limits apply). Business transactions will always have fees, but you can minimize them through volume discounts, optimal account types, and strategic pricing.</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">Are fees different for mobile payments?</h4>
                      <p className="text-gray-600 text-sm">PayPal fees are generally consistent across desktop and mobile platforms. However, some mobile-specific features like PayPal Here (card readers) or in-person payments may have different rate structures designed for point-of-sale transactions.</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">What happens with currency conversion fees?</h4>
                      <p className="text-gray-600 text-sm">When receiving payments in a different currency than your account default, PayPal applies its exchange rate plus a conversion fee (typically 2.5-4%). This is in addition to the standard transaction fees, significantly impacting international sales profitability.</p>
                    </div>
                  </div>
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">Do refunds affect PayPal fees?</h4>
                      <p className="text-gray-600 text-sm">When you issue a refund, PayPal returns the transaction fee but retains the fixed fee portion. For example, if you paid $1.20 in fees and issue a full refund, you might only get back $0.90, losing the $0.30 fixed fee. Plan for this in your refund policies.</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">Are there fees for receiving donations?</h4>
                      <p className="text-gray-600 text-sm">Charitable organizations with verified 501(c)(3) status in the US can qualify for reduced rates (2.2% + $0.30). However, individuals and non-verified organizations pay standard commercial rates even for donations, making fee calculation important for fundraising efforts.</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">How do micropayments affect fees?</h4>
                      <p className="text-gray-600 text-sm">For transactions under $10, the fixed fee component becomes disproportionately expensive. PayPal offers a micropayments rate structure (5% + $0.05) that can be more economical for digital content, small donations, or low-value item sales.</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">Can I negotiate lower PayPal fees?</h4>
                      <p className="text-gray-600 text-sm">High-volume merchants and established businesses can sometimes negotiate custom rates with PayPal. Factors include monthly volume, average transaction size, industry type, and account history. Contact PayPal's merchant services for volume-based pricing discussions.</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Comparison with Other Payment Processors */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">PayPal vs Other Payment Processors</h3>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg">
                        <th className="px-6 py-4 text-left font-bold text-gray-900 rounded-l-lg">Payment Processor</th>
                        <th className="px-6 py-4 text-center font-bold text-gray-900">Domestic Fees</th>
                        <th className="px-6 py-4 text-center font-bold text-gray-900">International Fees</th>
                        <th className="px-6 py-4 text-center font-bold text-gray-900 rounded-r-lg">Best For</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      <tr className="hover:bg-blue-50 transition-colors">
                        <td className="px-6 py-4 font-medium text-gray-900">PayPal</td>
                        <td className="px-6 py-4 text-center text-gray-700">2.9% + $0.30</td>
                        <td className="px-6 py-4 text-center text-gray-700">4.4% + $0.30</td>
                        <td className="px-6 py-4 text-center text-sm text-gray-600">Global reach, buyer protection</td>
                      </tr>
                      <tr className="hover:bg-blue-50 transition-colors">
                        <td className="px-6 py-4 font-medium text-gray-900">Stripe</td>
                        <td className="px-6 py-4 text-center text-gray-700">2.9% + $0.30</td>
                        <td className="px-6 py-4 text-center text-gray-700">3.9% + $0.30</td>
                        <td className="px-6 py-4 text-center text-sm text-gray-600">Developer-friendly, customization</td>
                      </tr>
                      <tr className="hover:bg-blue-50 transition-colors">
                        <td className="px-6 py-4 font-medium text-gray-900">Square</td>
                        <td className="px-6 py-4 text-center text-gray-700">2.6% + $0.10</td>
                        <td className="px-6 py-4 text-center text-gray-700">3.5% + $0.15</td>
                        <td className="px-6 py-4 text-center text-sm text-gray-600">Point-of-sale, small business</td>
                      </tr>
                      <tr className="hover:bg-blue-50 transition-colors">
                        <td className="px-6 py-4 font-medium text-gray-900">Authorize.Net</td>
                        <td className="px-6 py-4 text-center text-gray-700">2.9% + $0.30</td>
                        <td className="px-6 py-4 text-center text-gray-700">3.5% + $0.30</td>
                        <td className="px-6 py-4 text-center text-sm text-gray-600">Enterprise, established businesses</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
                  <h4 className="font-semibold text-blue-800 mb-2">Choosing the Right Processor</h4>
                  <p className="text-blue-700 text-sm">
                    While fees are important, consider factors like global availability, integration ease, customer trust, 
                    dispute resolution, and additional features when choosing a payment processor. PayPal's widespread 
                    recognition and buyer protection often justify its fees for many businesses, especially those serving 
                    international markets or risk-averse customers.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Tax Implications */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
                <CardContent className="p-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">Tax Implications of PayPal Fees</h3>
                  <div className="space-y-4 text-gray-600">
                    <p>
                      PayPal fees are generally considered business expenses and are tax-deductible for most business 
                      entities. Understanding how to properly account for these fees can help reduce your overall tax burden.
                    </p>
                    <div className="space-y-3">
                      <div className="bg-green-50 border-l-4 border-green-400 p-4 rounded-r-lg">
                        <h4 className="font-semibold text-green-800 mb-2">Business Deductions</h4>
                        <p className="text-green-700 text-sm">PayPal transaction fees, monthly account fees, and currency 
                        conversion charges are typically deductible as ordinary business expenses under "processing fees" 
                        or "merchant fees" categories.</p>
                      </div>
                      <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-lg">
                        <h4 className="font-semibold text-blue-800 mb-2">Record Keeping</h4>
                        <p className="text-blue-700 text-sm">Maintain detailed records of all PayPal transactions, including 
                        gross amounts, fees, and net deposits. PayPal provides annual tax documents like 1099-K forms for 
                        qualifying accounts to help with tax preparation.</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
                <CardContent className="p-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">Security and Risk Management</h3>
                  <div className="space-y-4 text-gray-600">
                    <p>
                      While PayPal fees might seem like an additional cost, they come with significant security benefits 
                      and risk protection that can save money in the long run through fraud prevention and dispute resolution.
                    </p>
                    <div className="space-y-3">
                      <div className="bg-purple-50 border-l-4 border-purple-400 p-4 rounded-r-lg">
                        <h4 className="font-semibold text-purple-800 mb-2">Fraud Protection</h4>
                        <p className="text-purple-700 text-sm">PayPal's advanced fraud detection systems and buyer/seller 
                        protection programs help minimize financial losses from fraudulent transactions, often offsetting 
                        the cost of fees for high-risk businesses.</p>
                      </div>
                      <div className="bg-orange-50 border-l-4 border-orange-400 p-4 rounded-r-lg">
                        <h4 className="font-semibold text-orange-800 mb-2">Chargeback Management</h4>
                        <p className="text-orange-700 text-sm">PayPal handles most chargeback disputes on behalf of merchants, 
                        providing evidence and representation that can prevent costly chargeback fees and account penalties 
                        that other processors might impose.</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default PayPalFeeCalculator;
