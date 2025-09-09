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
        <title>PayPal Fee Calculator - Calculate PayPal Transaction Fees | ToolsHub</title>
        <meta name="description" content="Free PayPal fee calculator to calculate transaction fees for receiving money, sending payments, and international transfers. Supports 12+ currencies, personal & business accounts. Perfect for freelancers, online sellers, and businesses." />
        <meta name="keywords" content="paypal fee calculator, paypal transaction fees, paypal fees, online payment calculator, paypal cost calculator, paypal business fees, international paypal fees, paypal merchant fees, freelancer paypal calculator, paypal selling fees, paypal invoice fees, paypal cross border fees" />
        <meta property="og:title" content="PayPal Fee Calculator - Calculate PayPal Transaction Fees | ToolsHub" />
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

          {/* What is PayPal Fee Calculator */}
          <section className="py-12 bg-white rounded-xl mb-12">
            <div className="px-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
                What is a PayPal Fee Calculator?
              </h2>
              <div className="max-w-4xl mx-auto">
                <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                  A PayPal fee calculator is an essential financial tool that helps online sellers, freelancers, and businesses understand 
                  the exact cost of receiving payments through PayPal. By calculating PayPal transaction fees, processing costs, and 
                  net amounts, this tool enables you to make informed pricing decisions and accurately budget for online transactions. 
                  Whether you're selling products, offering services, or receiving international payments, understanding PayPal fees 
                  is crucial for maintaining profitable margins.
                </p>
                <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                  Our comprehensive PayPal fee calculator supports multiple currencies, account types, and transaction scenarios. 
                  You can calculate fees for domestic and international transactions, compare personal versus business account costs, 
                  and determine the exact amount you need to request to receive your desired net payment. This transparency helps 
                  you avoid surprise deductions and plan your cash flow more effectively.
                </p>
              </div>
            </div>
          </section>

          {/* How PayPal Fees Work */}
          <section className="py-12 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl mb-12">
            <div className="px-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
                How PayPal Transaction Fees Work
              </h2>
              <div className="max-w-4xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                  <div className="bg-white p-6 rounded-lg shadow-sm">
                    <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <CreditCard className="w-5 h-5 text-blue-600" />
                      Domestic Transactions
                    </h3>
                    <p className="text-gray-600 mb-4">
                      For domestic PayPal transactions (within the same country), the standard fee structure includes:
                    </p>
                    <ul className="space-y-2 text-gray-600">
                      <li>• <strong>Personal accounts:</strong> 2.9% + fixed fee per transaction</li>
                      <li>• <strong>Business accounts:</strong> Same rates with potential volume discounts</li>
                      <li>• <strong>Fixed fees vary</strong> by currency (e.g., $0.30 for USD, €0.35 for EUR)</li>
                      <li>• <strong>No additional charges</strong> for domestic currency conversion</li>
                    </ul>
                  </div>
                  <div className="bg-white p-6 rounded-lg shadow-sm">
                    <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <i className="fas fa-globe w-5 h-5 text-green-600"></i>
                      International Transactions
                    </h3>
                    <p className="text-gray-600 mb-4">
                      International PayPal transactions (cross-border payments) incur higher fees:
                    </p>
                    <ul className="space-y-2 text-gray-600">
                      <li>• <strong>Higher percentage:</strong> 4.4% + fixed fee for most currencies</li>
                      <li>• <strong>Currency conversion:</strong> Additional 2.5-4% exchange rate margin</li>
                      <li>• <strong>Regional variations:</strong> Rates may differ by country</li>
                      <li>• <strong>Business benefits:</strong> Volume discounts available for high-volume merchants</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Why Use PayPal Fee Calculator */}
          <section className="py-12 bg-white rounded-xl mb-12">
            <div className="px-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
                Why Use Our PayPal Fee Calculator?
              </h2>
              <div className="max-w-4xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Calculator className="w-8 h-8 text-blue-600" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">Accurate Calculations</h3>
                    <p className="text-gray-600">
                      Get precise PayPal fee calculations based on current rates for all major currencies and account types.
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <DollarSign className="w-8 h-8 text-green-600" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">Pricing Strategy</h3>
                    <p className="text-gray-600">
                      Determine optimal pricing by understanding exactly how much you'll receive after PayPal fees are deducted.
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <i className="fas fa-chart-line w-8 h-8 text-purple-600"></i>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">Financial Planning</h3>
                    <p className="text-gray-600">
                      Plan your cash flow and budget more effectively by knowing your exact net income from PayPal transactions.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Use Cases and Applications */}
          <section className="py-12 bg-gradient-to-br from-green-50 to-emerald-100 rounded-xl mb-12">
            <div className="px-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
                PayPal Fee Calculator Use Cases
              </h2>
              <div className="max-w-4xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">E-commerce and Online Selling</h3>
                    <ul className="space-y-3 text-gray-600">
                      <li className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                        <div>
                          <strong>Product pricing:</strong> Calculate optimal selling prices that account for PayPal transaction fees
                        </div>
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                        <div>
                          <strong>International sales:</strong> Understand cross-border payment costs for global marketplace selling
                        </div>
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                        <div>
                          <strong>Marketplace fees:</strong> Factor in PayPal costs when selling on eBay, Etsy, or other platforms
                        </div>
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">Freelancing and Services</h3>
                    <ul className="space-y-3 text-gray-600">
                      <li className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                        <div>
                          <strong>Invoice pricing:</strong> Set freelance rates that ensure you receive your desired net payment
                        </div>
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                        <div>
                          <strong>International clients:</strong> Calculate fees for cross-border freelance payments and consulting
                        </div>
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                        <div>
                          <strong>Service pricing:</strong> Determine hourly rates that account for payment processing costs
                        </div>
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">Business and B2B</h3>
                    <ul className="space-y-3 text-gray-600">
                      <li className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                        <div>
                          <strong>B2B transactions:</strong> Calculate PayPal fees for business-to-business payments and invoicing
                        </div>
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                        <div>
                          <strong>Volume discounts:</strong> Evaluate potential savings with PayPal business account benefits
                        </div>
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                        <div>
                          <strong>Cash flow planning:</strong> Budget accurately for payment processing costs in financial projections
                        </div>
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">Personal Finance</h3>
                    <ul className="space-y-3 text-gray-600">
                      <li className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                        <div>
                          <strong>P2P payments:</strong> Understand costs when receiving money from friends, family, or roommates
                        </div>
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                        <div>
                          <strong>Side hustles:</strong> Calculate net income from casual selling or gig economy work
                        </div>
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                        <div>
                          <strong>International transfers:</strong> Compare costs for cross-border personal money transfers
                        </div>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Tips for Reducing PayPal Fees */}
          <section className="py-12 bg-white rounded-xl mb-12">
            <div className="px-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
                Tips for Reducing PayPal Transaction Fees
              </h2>
              <div className="max-w-4xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-lg">
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">Account Optimization</h3>
                    <ul className="space-y-3 text-gray-600">
                      <li>• <strong>Business account:</strong> Upgrade for volume discounts and better rates</li>
                      <li>• <strong>Merchant rates:</strong> Apply for reduced rates with high transaction volumes</li>
                      <li>• <strong>PayPal Pro:</strong> Consider advanced payment solutions for lower fees</li>
                      <li>• <strong>Direct bank transfers:</strong> Use bank transfers for large amounts when possible</li>
                    </ul>
                  </div>
                  <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-lg">
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">Transaction Strategies</h3>
                    <ul className="space-y-3 text-gray-600">
                      <li>• <strong>Bundle payments:</strong> Combine small transactions to reduce fixed fees</li>
                      <li>• <strong>Friends & Family:</strong> Use F&F for personal transactions (no buyer protection)</li>
                      <li>• <strong>Local payments:</strong> Encourage domestic transactions when possible</li>
                      <li>• <strong>Alternative methods:</strong> Consider other payment processors for comparison</li>
                    </ul>
                  </div>
                </div>
                
                <div className="mt-8 p-6 bg-yellow-50 border-l-4 border-yellow-400 rounded-r-lg">
                  <h4 className="text-lg font-semibold text-yellow-800 mb-2">
                    <i className="fas fa-exclamation-triangle mr-2"></i>
                    Important Considerations
                  </h4>
                  <p className="text-yellow-700 mb-3">
                    While reducing PayPal fees is important, consider these factors:
                  </p>
                  <ul className="space-y-2 text-yellow-700">
                    <li>• <strong>Buyer protection:</strong> PayPal fees include dispute resolution and fraud protection</li>
                    <li>• <strong>International reach:</strong> PayPal's global acceptance may justify higher fees</li>
                    <li>• <strong>Integration ease:</strong> Consider development costs for alternative payment systems</li>
                    <li>• <strong>Customer trust:</strong> PayPal's reputation can increase conversion rates</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* Frequently Asked Questions */}
          <section className="py-12 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl mb-12">
            <div className="px-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
                PayPal Fee Calculator FAQ
              </h2>
              <div className="max-w-4xl mx-auto">
                <div className="space-y-6">
                  <div className="bg-white p-6 rounded-lg shadow-sm">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">
                      How are PayPal fees calculated?
                    </h3>
                    <p className="text-gray-600">
                      PayPal fees consist of a percentage rate plus a fixed fee per transaction. For domestic transactions, 
                      the typical rate is 2.9% + $0.30 (USD). International transactions are higher at 4.4% + $0.30. 
                      The exact rates vary by currency, account type, and transaction volume.
                    </p>
                  </div>

                  <div className="bg-white p-6 rounded-lg shadow-sm">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">
                      What's the difference between personal and business account fees?
                    </h3>
                    <p className="text-gray-600">
                      Personal and business accounts have similar base rates, but business accounts offer volume discounts 
                      for high-transaction merchants. Business accounts also provide additional features like invoicing, 
                      reporting tools, and the ability to accept credit card payments directly.
                    </p>
                  </div>

                  <div className="bg-white p-6 rounded-lg shadow-sm">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">
                      Are there additional fees for currency conversion?
                    </h3>
                    <p className="text-gray-600">
                      Yes, PayPal charges an additional 2.5-4% above the base exchange rate for currency conversion. 
                      This applies when receiving payments in a different currency than your account's primary currency, 
                      or when the buyer's funding source is in a different currency.
                    </p>
                  </div>

                  <div className="bg-white p-6 rounded-lg shadow-sm">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">
                      How can I reduce PayPal transaction fees?
                    </h3>
                    <p className="text-gray-600">
                      You can reduce fees by upgrading to a business account for volume discounts, bundling small payments, 
                      encouraging domestic transactions, and considering PayPal Pro for high-volume businesses. However, 
                      remember that PayPal fees include valuable services like buyer protection and dispute resolution.
                    </p>
                  </div>

                  <div className="bg-white p-6 rounded-lg shadow-sm">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">
                      Do PayPal fee rates change frequently?
                    </h3>
                    <p className="text-gray-600">
                      PayPal fee rates are relatively stable but can change. The company typically announces rate changes 
                      in advance. Our calculator is updated to reflect current rates, but always check PayPal's official 
                      website for the most current fee structure, especially for business accounts or special programs.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* How to Use Guide */}
          <section className="py-12 bg-white rounded-xl mb-12">
            <div className="px-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
                How to Use the PayPal Fee Calculator
              </h2>
              <div className="max-w-4xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">Step-by-Step Guide</h3>
                    <div className="space-y-4">
                      <div className="flex items-start gap-4">
                        <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-semibold text-sm">1</div>
                        <div>
                          <p className="font-medium text-gray-900">Select Currency</p>
                          <p className="text-gray-600 text-sm">Choose the currency for your transaction from our supported list</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-4">
                        <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-semibold text-sm">2</div>
                        <div>
                          <p className="font-medium text-gray-900">Account Type</p>
                          <p className="text-gray-600 text-sm">Select whether you have a personal or business PayPal account</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-4">
                        <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-semibold text-sm">3</div>
                        <div>
                          <p className="font-medium text-gray-900">Transaction Type</p>
                          <p className="text-gray-600 text-sm">Choose domestic (same country) or international transaction</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-4">
                        <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-semibold text-sm">4</div>
                        <div>
                          <p className="font-medium text-gray-900">Calculation Type</p>
                          <p className="text-gray-600 text-sm">Select whether you're calculating fees on received amount or determining send amount</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-4">
                        <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-semibold text-sm">5</div>
                        <div>
                          <p className="font-medium text-gray-900">Enter Amount</p>
                          <p className="text-gray-600 text-sm">Input the transaction amount and click Calculate to see detailed results</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">Important Notes</h3>
                    <div className="bg-gradient-to-br from-yellow-50 to-orange-50 p-6 rounded-lg">
                      <ul className="space-y-3 text-gray-700">
                        <li className="flex items-start gap-2">
                          <i className="fas fa-info-circle text-blue-500 mt-1"></i>
                          <span><strong>Fees vary by currency</strong> - Fixed fees differ for each supported currency</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <i className="fas fa-globe text-green-500 mt-1"></i>
                          <span><strong>International rates higher</strong> - Cross-border transactions incur additional costs</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <i className="fas fa-building text-purple-500 mt-1"></i>
                          <span><strong>Business account benefits</strong> - Volume discounts available for high-volume merchants</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <i className="fas fa-exchange-alt text-orange-500 mt-1"></i>
                          <span><strong>Currency conversion</strong> - Additional fees apply for currency exchange</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <i className="fas fa-clock text-red-500 mt-1"></i>
                          <span><strong>Rates subject to change</strong> - PayPal may update fee structures periodically</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Audience-Specific Use Cases */}
          <section className="py-12 bg-gradient-to-br from-indigo-50 to-purple-100 rounded-xl mb-12">
            <div className="px-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
                Who Benefits from Our PayPal Fee Calculator?
              </h2>
              <div className="max-w-6xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                  <div className="bg-white p-6 rounded-lg shadow-sm">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                      <i className="fas fa-laptop-code text-2xl text-blue-600"></i>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">Freelancers & Remote Workers</h3>
                    <p className="text-gray-600 mb-4">
                      Calculate exact net income from client payments across different countries and currencies.
                    </p>
                    <ul className="text-sm text-gray-600 space-y-2">
                      <li>• Set optimal hourly rates that account for PayPal fees</li>
                      <li>• Budget for international client payments</li>
                      <li>• Compare costs across different payment methods</li>
                      <li>• Plan cash flow with accurate net calculations</li>
                    </ul>
                  </div>
                  <div className="bg-white p-6 rounded-lg shadow-sm">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                      <i className="fas fa-store text-2xl text-green-600"></i>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">Online Sellers & E-commerce</h3>
                    <p className="text-gray-600 mb-4">
                      Optimize product pricing by understanding exact PayPal transaction costs for your business.
                    </p>
                    <ul className="text-sm text-gray-600 space-y-2">
                      <li>• Price products to maintain profit margins</li>
                      <li>• Calculate fees for eBay, Etsy, and marketplace sales</li>
                      <li>• Understand international selling costs</li>
                      <li>• Compare personal vs business account benefits</li>
                    </ul>
                  </div>
                  <div className="bg-white p-6 rounded-lg shadow-sm">
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                      <i className="fas fa-building text-2xl text-purple-600"></i>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">Small Business Owners</h3>
                    <p className="text-gray-600 mb-4">
                      Make informed decisions about payment processing costs and budget accurately for business operations.
                    </p>
                    <ul className="text-sm text-gray-600 space-y-2">
                      <li>• Budget for payment processing expenses</li>
                      <li>• Evaluate PayPal vs other payment processors</li>
                      <li>• Calculate volume discount benefits</li>
                      <li>• Plan pricing strategies for B2B transactions</li>
                    </ul>
                  </div>
                  <div className="bg-white p-6 rounded-lg shadow-sm">
                    <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                      <i className="fas fa-graduation-cap text-2xl text-orange-600"></i>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">Students & Side Hustlers</h3>
                    <p className="text-gray-600 mb-4">
                      Understand the real cost of receiving payments for tutoring, selling items, or gig work.
                    </p>
                    <ul className="text-sm text-gray-600 space-y-2">
                      <li>• Calculate net income from tutoring payments</li>
                      <li>• Understand costs for selling textbooks online</li>
                      <li>• Budget for international transactions</li>
                      <li>• Plan side business pricing strategies</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* PayPal Fee Examples */}
          <section className="py-12 bg-white rounded-xl mb-12">
            <div className="px-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
                Real PayPal Fee Examples
              </h2>
              <div className="max-w-4xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-lg">
                    <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <i className="fas fa-flag-usa text-blue-600"></i>
                      Domestic US Transaction Example
                    </h3>
                    <div className="space-y-3">
                      <div className="bg-white p-4 rounded border-l-4 border-blue-500">
                        <p className="text-sm text-gray-600 mb-2"><strong>Scenario:</strong> Freelancer receiving $500 for web design work</p>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600">Gross Amount:</span>
                            <span className="font-semibold block">$500.00</span>
                          </div>
                          <div>
                            <span className="text-gray-600">PayPal Fee:</span>
                            <span className="font-semibold block text-red-600">-$14.80</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Rate Applied:</span>
                            <span className="font-semibold block">2.9% + $0.30</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Net Received:</span>
                            <span className="font-semibold block text-green-600">$485.20</span>
                          </div>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600">
                        <strong>Use our <a href="/tools/percentage-calculator" className="text-blue-600 hover:underline">Percentage Calculator</a></strong> to understand how the 2.9% fee affects your total income.
                      </p>
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-lg">
                    <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <i className="fas fa-globe text-green-600"></i>
                      International Transaction Example
                    </h3>
                    <div className="space-y-3">
                      <div className="bg-white p-4 rounded border-l-4 border-green-500">
                        <p className="text-sm text-gray-600 mb-2"><strong>Scenario:</strong> UK seller receiving $300 from US customer</p>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600">Gross Amount:</span>
                            <span className="font-semibold block">$300.00</span>
                          </div>
                          <div>
                            <span className="text-gray-600">PayPal Fee:</span>
                            <span className="font-semibold block text-red-600">-$13.50</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Rate Applied:</span>
                            <span className="font-semibold block">4.4% + $0.30</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Net Received:</span>
                            <span className="font-semibold block text-green-600">$286.50</span>
                          </div>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600">
                        <strong>Use our <a href="/tools/currency-converter" className="text-green-600 hover:underline">Currency Converter</a></strong> to calculate the exact amount in your local currency.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="mt-8 p-6 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border-l-4 border-yellow-400">
                  <h4 className="text-lg font-semibold text-yellow-800 mb-3">
                    <i className="fas fa-lightbulb mr-2"></i>
                    Pro Tip for Business Owners
                  </h4>
                  <p className="text-yellow-700 mb-3">
                    To maintain consistent profit margins, consider adding PayPal fees to your pricing. For example, if you want to receive $100 net, you should charge approximately $103.41 for domestic transactions.
                  </p>
                  <p className="text-sm text-yellow-600">
                    <strong>Related tools:</strong> Use our <a href="/tools/discount-calculator" className="text-yellow-700 hover:underline font-medium">Discount Calculator</a> to adjust pricing strategies and our <a href="/tools/roi-calculator" className="text-yellow-700 hover:underline font-medium">ROI Calculator</a> to evaluate the impact of payment processing costs on your business profitability.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Business Finance Integration */}
          <section className="py-12 bg-gradient-to-br from-purple-50 to-indigo-100 rounded-xl mb-12">
            <div className="px-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
                PayPal Fees in Your Business Finance Strategy
              </h2>
              <div className="max-w-4xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="bg-white p-6 rounded-lg shadow-sm">
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                      <i className="fas fa-calculator text-2xl text-purple-600"></i>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Cash Flow Planning</h3>
                    <p className="text-gray-600 mb-4">
                      Accurately predict your net income by factoring PayPal fees into your financial projections and cash flow forecasts.
                    </p>
                    <div className="space-y-2">
                      <a href="/tools/business-loan-calculator" className="block text-sm text-purple-600 hover:underline">• Business Loan Calculator</a>
                      <a href="/tools/savings-goal-calculator" className="block text-sm text-purple-600 hover:underline">• Savings Goal Calculator</a>
                      <a href="/tools/compound-interest-calculator" className="block text-sm text-purple-600 hover:underline">• Compound Interest Calculator</a>
                    </div>
                  </div>
                  <div className="bg-white p-6 rounded-lg shadow-sm">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                      <i className="fas fa-chart-line text-2xl text-blue-600"></i>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Pricing Optimization</h3>
                    <p className="text-gray-600 mb-4">
                      Set competitive prices that account for payment processing costs while maintaining healthy profit margins.
                    </p>
                    <div className="space-y-2">
                      <a href="/tools/break-even-calculator" className="block text-sm text-blue-600 hover:underline">• Break-Even Calculator</a>
                      <a href="/tools/investment-return-calculator" className="block text-sm text-blue-600 hover:underline">• Investment Return Calculator</a>
                      <a href="/tools/inflation-calculator" className="block text-sm text-blue-600 hover:underline">• Inflation Calculator</a>
                    </div>
                  </div>
                  <div className="bg-white p-6 rounded-lg shadow-sm">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                      <i className="fas fa-balance-scale text-2xl text-green-600"></i>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Cost Comparison</h3>
                    <p className="text-gray-600 mb-4">
                      Compare PayPal fees with other payment processors and financing options to optimize your payment strategy.
                    </p>
                    <div className="space-y-2">
                      <a href="/tools/loan-calculator" className="block text-sm text-green-600 hover:underline">• Loan Calculator</a>
                      <a href="/tools/debt-payoff-calculator" className="block text-sm text-green-600 hover:underline">• Debt Payoff Calculator</a>
                      <a href="/tools/net-worth-calculator" className="block text-sm text-green-600 hover:underline">• Net Worth Calculator</a>
                    </div>
                  </div>
                </div>
                <div className="mt-8 text-center">
                  <p className="text-gray-600 mb-4">
                    Understanding PayPal fees is just one part of comprehensive business financial planning. Explore our complete suite of financial calculators to optimize every aspect of your business finances.
                  </p>
                  <a href="/tools/finance-tools" className="inline-flex items-center gap-2 bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors">
                    <i className="fas fa-calculator"></i>
                    Explore All Finance Tools
                  </a>
                </div>
              </div>
            </div>
          </section>

          {/* Advanced PayPal Features */}
          <section className="py-12 bg-white rounded-xl mb-12">
            <div className="px-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
                Advanced PayPal Fee Considerations
              </h2>
              <div className="max-w-4xl mx-auto">
                <div className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-lg">
                      <h3 className="text-xl font-semibold text-gray-900 mb-4">Volume Discounts & Business Benefits</h3>
                      <p className="text-gray-600 mb-4">
                        PayPal offers reduced rates for high-volume merchants and business accounts. Understanding these tiers can significantly impact your long-term costs.
                      </p>
                      <ul className="space-y-2 text-gray-600">
                        <li>• <strong>Merchant Rate:</strong> Reduced fees for $3,000+ monthly volume</li>
                        <li>• <strong>PayPal Pro:</strong> Advanced features with competitive rates</li>
                        <li>• <strong>Enterprise Solutions:</strong> Custom pricing for large businesses</li>
                        <li>• <strong>Non-profit Rates:</strong> Special discounted rates for registered charities</li>
                      </ul>
                    </div>
                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-lg">
                      <h3 className="text-xl font-semibold text-gray-900 mb-4">Currency Conversion & International Fees</h3>
                      <p className="text-gray-600 mb-4">
                        International transactions involve additional complexities beyond the base transaction fees.
                      </p>
                      <ul className="space-y-2 text-gray-600">
                        <li>• <strong>Exchange Rate Margin:</strong> 2.5-4% above mid-market rates</li>
                        <li>• <strong>Cross-Border Fees:</strong> Additional charges for international payments</li>
                        <li>• <strong>Withdrawal Fees:</strong> Costs to transfer funds to local bank accounts</li>
                        <li>• <strong>Currency Risk:</strong> Fluctuations can affect final received amounts</li>
                      </ul>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-6 rounded-lg border-l-4 border-yellow-400">
                    <h4 className="text-lg font-semibold text-yellow-800 mb-3">
                      <i className="fas fa-shield-alt mr-2"></i>
                      PayPal Fee vs. Value Proposition
                    </h4>
                    <p className="text-yellow-700 mb-3">
                      While PayPal fees may seem high, consider the value-added services included:
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-yellow-700">
                      <div>
                        <strong>Security & Fraud Protection</strong>
                        <ul className="text-sm mt-2 space-y-1">
                          <li>• Advanced fraud detection</li>
                          <li>• Seller and buyer protection</li>
                          <li>• Secure payment processing</li>
                        </ul>
                      </div>
                      <div>
                        <strong>Global Reach</strong>
                        <ul className="text-sm mt-2 space-y-1">
                          <li>• 200+ countries supported</li>
                          <li>• 25+ currencies accepted</li>
                          <li>• Trusted worldwide brand</li>
                        </ul>
                      </div>
                      <div>
                        <strong>Integration & Support</strong>
                        <ul className="text-sm mt-2 space-y-1">
                          <li>• Easy website integration</li>
                          <li>• Mobile payment solutions</li>
                          <li>• 24/7 customer support</li>
                        </ul>
                      </div>
                    </div>
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
};

export default PayPalFeeCalculator;