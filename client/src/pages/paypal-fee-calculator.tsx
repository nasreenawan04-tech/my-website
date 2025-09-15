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
import { Calculator, CreditCard, DollarSign } from 'lucide-react';

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
        'default': { rate: 2.9, fixed: 0.30 }
      },
      'personal-international': {
        'USD': { rate: 4.4, fixed: 0.30 },
        'EUR': { rate: 4.4, fixed: 0.35 },
        'GBP': { rate: 4.4, fixed: 0.30 },
        'CAD': { rate: 4.4, fixed: 0.30 },
        'AUD': { rate: 4.1, fixed: 0.30 },
        'JPY': { rate: 4.4, fixed: 40 },
        'default': { rate: 4.4, fixed: 0.30 }
      },
      'business-domestic': {
        'USD': { rate: 2.9, fixed: 0.30 },
        'EUR': { rate: 2.9, fixed: 0.35 },
        'GBP': { rate: 2.9, fixed: 0.30 },
        'CAD': { rate: 2.9, fixed: 0.30 },
        'AUD': { rate: 2.6, fixed: 0.30 },
        'JPY': { rate: 2.9, fixed: 40 },
        'default': { rate: 2.9, fixed: 0.30 }
      },
      'business-international': {
        'USD': { rate: 4.4, fixed: 0.30 },
        'EUR': { rate: 4.4, fixed: 0.35 },
        'GBP': { rate: 4.4, fixed: 0.30 },
        'CAD': { rate: 4.4, fixed: 0.30 },
        'AUD': { rate: 4.1, fixed: 0.30 },
        'JPY': { rate: 4.4, fixed: 40 },
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
    <>
      <Helmet>
        <title>PayPal Fee Calculator - Calculate PayPal Transaction Fees | DapsiWow</title>
        <meta name="description" content="Free PayPal fee calculator to calculate transaction fees for receiving money, sending payments, and international transfers. Supports 12+ currencies, personal & business accounts. Perfect for freelancers, online sellers, and businesses." />
        <meta name="keywords" content="paypal fee calculator, paypal transaction fees, paypal fees, online payment calculator, paypal cost calculator, paypal business fees, international paypal fees, paypal merchant fees, freelancer paypal calculator, paypal selling fees, paypal invoice fees, paypal cross border fees" />
        <meta property="og:title" content="PayPal Fee Calculator - Calculate PayPal Transaction Fees | DapsiWow" />
        <meta property="og:description" content="Free PayPal fee calculator to calculate transaction fees for receiving money, sending payments, and international transfers. Supports 12+ currencies, personal & business accounts. Perfect for freelancers, online sellers, and businesses." />
        <meta property="og:type" content="website" />
        <link rel="canonical" href="/tools/paypal-fee-calculator" />
      </Helmet>

      <div className="min-h-screen flex flex-col" data-testid="page-paypal-fee-calculator">
        <Header />
        
        <main className="flex-1 bg-neutral-50">
          {/* Hero Section */}
          <section className="gradient-hero text-white py-16">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <div className="w-20 h-20 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <i className="fab fa-paypal text-3xl"></i>
              </div>
              <h1 className="text-4xl sm:text-5xl font-bold mb-6" data-testid="text-page-title">
                PayPal Fee Calculator
              </h1>
              <p className="text-xl text-blue-100 max-w-2xl mx-auto">
                Calculate PayPal transaction fees for domestic and international payments across multiple currencies
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
                      <h2 className="text-2xl font-semibold text-gray-900 mb-8">Transaction Details</h2>
                      
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
                        <Label className="text-sm font-medium text-gray-700">
                          Account Type
                        </Label>
                        <Select value={accountType} onValueChange={setAccountType}>
                          <SelectTrigger className="h-12 border-gray-200 rounded-lg" data-testid="select-account-type">
                            <SelectValue placeholder="Select account type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="personal">Personal Account</SelectItem>
                            <SelectItem value="business">Business Account</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Transaction Type */}
                      <div className="space-y-3">
                        <Label className="text-sm font-medium text-gray-700">
                          Transaction Type
                        </Label>
                        <Select value={transactionType} onValueChange={setTransactionType}>
                          <SelectTrigger className="h-12 border-gray-200 rounded-lg" data-testid="select-transaction-type">
                            <SelectValue placeholder="Select transaction type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="domestic">Domestic Transaction</SelectItem>
                            <SelectItem value="international">International Transaction</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Calculation Type */}
                      <div className="space-y-3">
                        <Label className="text-sm font-medium text-gray-700">
                          What are you calculating?
                        </Label>
                        <Select value={calculationType} onValueChange={setCalculationType}>
                          <SelectTrigger className="h-12 border-gray-200 rounded-lg" data-testid="select-calculation-type">
                            <SelectValue placeholder="Select calculation type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="receiving">Fee when receiving money</SelectItem>
                            <SelectItem value="sending">Amount needed to send specific amount</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Amount Input */}
                      <div className="space-y-3">
                        <Label htmlFor="amount" className="text-sm font-medium text-gray-700">
                          {calculationType === 'receiving' 
                            ? 'Amount You Will Receive (Gross)' 
                            : 'Amount You Want to Receive (Net)'
                          }
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

                      {/* Current Fee Structure Display */}
                      {(() => {
                        const feeStructure = getCurrentFeeStructure();
                        return (
                          <div className="p-4 bg-blue-50 rounded-lg">
                            <div className="text-sm text-blue-700 font-medium mb-1">Current Fee Structure:</div>
                            <div className="text-sm text-blue-600">
                              {feeStructure.rate}% + {formatCurrency(feeStructure.fixed)} fixed fee
                            </div>
                            <div className="text-xs text-blue-500 mt-1">
                              {accountType === 'personal' ? 'Personal' : 'Business'} • {transactionType === 'domestic' ? 'Domestic' : 'International'}
                            </div>
                          </div>
                        );
                      })()}

                      {/* Action Buttons */}
                      <div className="flex gap-4 pt-6">
                        <Button
                          onClick={calculatePayPalFee}
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
                      <h2 className="text-2xl font-semibold text-gray-900 mb-8">Fee Calculation Results</h2>
                      
                      {result ? (
                        <div className="space-y-6" data-testid="results">
                          {/* Net Amount */}
                          <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
                            <CardContent className="p-6 text-center">
                              <div className="text-lg text-green-700 mb-1">
                                {calculationType === 'receiving' ? 'Amount You Keep (Net)' : 'You Need to Request (Gross)'}
                              </div>
                              <div className="text-4xl font-bold text-green-600">
                                {calculationType === 'receiving' 
                                  ? formatCurrency(result.netAmount)
                                  : formatCurrency(result.grossAmount)
                                }
                              </div>
                            </CardContent>
                          </Card>

                          {/* Fee Breakdown */}
                          <Card className="border-gray-200">
                            <CardHeader>
                              <CardTitle className="text-lg text-gray-900 flex items-center gap-2">
                                <CreditCard className="w-5 h-5 text-blue-600" />
                                Fee Breakdown
                              </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                              <div className="flex justify-between items-center">
                                <span className="text-gray-600">Gross Amount:</span>
                                <span className="font-semibold text-gray-900">{formatCurrency(result.grossAmount)}</span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-gray-600">PayPal Fee:</span>
                                <span className="font-semibold text-red-600">-{formatCurrency(result.paypalFee)}</span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-gray-600">Effective Fee Rate:</span>
                                <span className="font-semibold text-gray-900">{result.effectiveFeeRate}%</span>
                              </div>
                              <Separator />
                              <div className="flex justify-between items-center text-lg">
                                <span className="font-semibold text-gray-900">Net Amount:</span>
                                <span className="font-bold text-green-600">{formatCurrency(result.netAmount)}</span>
                              </div>
                            </CardContent>
                          </Card>

                          {/* Fee Comparison */}
                          <Card className="border-gray-200">
                            <CardHeader>
                              <CardTitle className="text-lg text-gray-900">Fee Comparison by Type</CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="space-y-3 text-sm">
                                <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                                  <span>Domestic Personal:</span>
                                  <span className="font-medium">2.9% + fixed</span>
                                </div>
                                <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                                  <span>International Personal:</span>
                                  <span className="font-medium">4.4% + fixed</span>
                                </div>
                                <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                                  <span>Business (same rates):</span>
                                  <span className="font-medium">Varies by volume</span>
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
                            Enter transaction details to calculate PayPal fees
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

export default PayPalFeeCalculator;