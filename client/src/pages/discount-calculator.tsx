import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ToolHeroSection from '@/components/ToolHeroSection';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Calculator, Tag, DollarSign } from 'lucide-react';

interface DiscountResult {
  originalPrice: number;
  discountAmount: number;
  finalPrice: number;
  savingsAmount: number;
  savingsPercentage: number;
}

const DiscountCalculator = () => {
  const [originalPrice, setOriginalPrice] = useState('');
  const [discountPercent, setDiscountPercent] = useState('');
  const [discountAmount, setDiscountAmount] = useState('');
  const [calculationType, setCalculationType] = useState('percentage');
  const [currency, setCurrency] = useState('USD');
  const [result, setResult] = useState<DiscountResult | null>(null);

  const calculateDiscount = () => {
    const price = parseFloat(originalPrice);

    if (isNaN(price) || price <= 0) return;

    let discount = 0;

    if (calculationType === 'percentage') {
      const percent = parseFloat(discountPercent);
      if (isNaN(percent) || percent < 0 || percent > 100) return;
      discount = (price * percent) / 100;
    } else {
      discount = parseFloat(discountAmount);
      if (isNaN(discount) || discount < 0 || discount > price) return;
    }

    const finalPrice = price - discount;
    const savingsPercentage = (discount / price) * 100;

    setResult({
      originalPrice: Math.round(price * 100) / 100,
      discountAmount: Math.round(discount * 100) / 100,
      finalPrice: Math.round(finalPrice * 100) / 100,
      savingsAmount: Math.round(discount * 100) / 100,
      savingsPercentage: Math.round(savingsPercentage * 100) / 100
    });
  };

  const resetCalculator = () => {
    setOriginalPrice('');
    setDiscountPercent('');
    setDiscountAmount('');
    setCalculationType('percentage');
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
      KRW: { locale: 'ko-KR', currency: 'KRW' }
    };

    const config = currencyMap[currency] || currencyMap.USD;

    return new Intl.NumberFormat(config.locale, {
      style: 'currency',
      currency: config.currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  // Calculate multiple discount scenarios
  const getCommonDiscounts = () => {
    const price = parseFloat(originalPrice);
    if (isNaN(price) || price <= 0) return [];

    const discounts = [10, 15, 20, 25, 30, 40, 50];
    return discounts.map(percent => ({
      percent,
      discount: (price * percent) / 100,
      final: price - (price * percent) / 100
    }));
  };

  return (
    <>
      <Helmet>
        <title>Discount Calculator - Calculate Sale Prices & Savings | DapsiWow</title>
        <meta name="description" content="Free discount calculator to calculate sale prices, discount amounts, and savings. Support for multiple currencies worldwide. Perfect for shopping, sales, and business pricing." />
        <meta name="keywords" content="discount calculator, sale price calculator, percentage discount, savings calculator, price reduction calculator, best deals, shopping discounts" />
        <meta property="og:title" content="Discount Calculator - Calculate Sale Prices & Savings | DapsiWow" />
        <meta property="og:description" content="Free discount calculator to calculate sale prices, discount amounts, and savings. Support for multiple currencies worldwide." />
        <meta property="og:type" content="website" />
        <link rel="canonical" href="/tools/discount-calculator" />
      </Helmet>

      <div className="min-h-screen flex flex-col" data-testid="page-discount-calculator">
        <Header />

        <main className="flex-1 bg-neutral-50">
          {/* Hero Section */}
          <ToolHeroSection
            title="Discount Calculator"
            description="Calculate sale prices, discount amounts, and savings with support for multiple currencies worldwide"
            testId="text-discount-title"
          />

          {/* Calculator Section */}
          <section className="py-16">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
              <Card className="bg-white shadow-sm border-0">
                <CardContent className="p-8">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    {/* Input Section */}
                    <div className="space-y-6">
                      <h2 className="text-2xl font-semibold text-gray-900 mb-8">Discount Details</h2>

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
                            <SelectItem value="KRW">KRW - South Korean Won</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Original Price */}
                      <div className="space-y-3">
                        <Label htmlFor="original-price" className="text-sm font-medium text-gray-700">
                          Original Price
                        </Label>
                        <Input
                          id="original-price"
                          type="number"
                          value={originalPrice}
                          onChange={(e) => setOriginalPrice(e.target.value)}
                          className="h-12 text-base border-gray-200 rounded-lg"
                          placeholder="Enter original price"
                          min="0"
                          step="0.01"
                          data-testid="input-original-price"
                        />
                      </div>

                      {/* Discount Type Selection */}
                      <div className="space-y-3">
                        <Label className="text-sm font-medium text-gray-700">
                          Discount Type
                        </Label>
                        <Select value={calculationType} onValueChange={setCalculationType}>
                          <SelectTrigger className="h-12 border-gray-200 rounded-lg" data-testid="select-discount-type">
                            <SelectValue placeholder="Select discount type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="percentage">Percentage Discount (%)</SelectItem>
                            <SelectItem value="amount">Fixed Amount Discount</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Discount Value */}
                      {calculationType === 'percentage' ? (
                        <div className="space-y-3">
                          <Label htmlFor="discount-percent" className="text-sm font-medium text-gray-700">
                            Discount Percentage (%)
                          </Label>
                          <Input
                            id="discount-percent"
                            type="number"
                            value={discountPercent}
                            onChange={(e) => setDiscountPercent(e.target.value)}
                            className="h-12 text-base border-gray-200 rounded-lg"
                            placeholder="Enter discount percentage"
                            min="0"
                            max="100"
                            step="0.01"
                            data-testid="input-discount-percent"
                          />
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <Label htmlFor="discount-amount" className="text-sm font-medium text-gray-700">
                            Discount Amount
                          </Label>
                          <Input
                            id="discount-amount"
                            type="number"
                            value={discountAmount}
                            onChange={(e) => setDiscountAmount(e.target.value)}
                            className="h-12 text-base border-gray-200 rounded-lg"
                            placeholder="Enter discount amount"
                            min="0"
                            step="0.01"
                            data-testid="input-discount-amount"
                          />
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="flex gap-4 pt-6">
                        <Button
                          onClick={calculateDiscount}
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
                      <h2 className="text-2xl font-semibold text-gray-900 mb-8">Results</h2>

                      {result ? (
                        <div className="space-y-6" data-testid="results">
                          {/* Final Price */}
                          <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
                            <CardContent className="p-6 text-center">
                              <div className="text-lg text-green-700 mb-1">Final Price</div>
                              <div className="text-4xl font-bold text-green-600">
                                {formatCurrency(result.finalPrice)}
                              </div>
                            </CardContent>
                          </Card>

                          {/* Savings Details */}
                          <Card className="border-gray-200">
                            <CardHeader>
                              <CardTitle className="text-lg text-gray-900 flex items-center gap-2">
                                <Tag className="w-5 h-5 text-blue-600" />
                                Savings Breakdown
                              </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                              <div className="flex justify-between items-center">
                                <span className="text-gray-600">Original Price:</span>
                                <span className="font-semibold text-gray-900">{formatCurrency(result.originalPrice)}</span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-gray-600">Discount Amount:</span>
                                <span className="font-semibold text-red-600">-{formatCurrency(result.discountAmount)}</span>
                              </div>
                              <Separator />
                              <div className="flex justify-between items-center text-lg">
                                <span className="font-semibold text-gray-900">Final Price:</span>
                                <span className="font-bold text-green-600">{formatCurrency(result.finalPrice)}</span>
                              </div>
                              <div className="text-center p-3 bg-blue-50 rounded-lg">
                                <div className="text-sm text-blue-700">You save</div>
                                <div className="text-xl font-bold text-blue-600">
                                  {formatCurrency(result.savingsAmount)} ({result.savingsPercentage}%)
                                </div>
                              </div>
                            </CardContent>
                          </Card>

                          {/* Quick Discount Reference */}
                          {originalPrice && !isNaN(parseFloat(originalPrice)) && (
                            <Card className="border-gray-200">
                              <CardHeader>
                                <CardTitle className="text-lg text-gray-900">Common Discounts</CardTitle>
                              </CardHeader>
                              <CardContent>
                                <div className="space-y-2">
                                  {getCommonDiscounts().map(({ percent, discount, final }) => (
                                    <div key={percent} className="flex justify-between items-center text-sm">
                                      <span className="text-gray-600">{percent}% off:</span>
                                      <span className="font-medium">
                                        {formatCurrency(final)} 
                                        <span className="text-red-500 ml-2">(-{formatCurrency(discount)})</span>
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </CardContent>
                            </Card>
                          )}
                        </div>
                      ) : (
                        <div className="text-center py-12" data-testid="no-results">
                          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <DollarSign className="w-8 h-8 text-gray-400" />
                          </div>
                          <p className="text-gray-500">
                            Enter price and discount details to see your savings
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </section>

          

          {/* How to Use Section */}
          <section className="py-16 bg-white">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">How to Use</h3>
                  <ul className="space-y-2 text-gray-600">
                    <li>• Select your preferred currency</li>
                    <li>• Enter the original price of the item</li>
                    <li>• Choose percentage or fixed amount discount</li>
                    <li>• Enter the discount value</li>
                    <li>• Click Calculate to see final price and savings</li>
                    <li>• View common discount percentages for comparison</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Key Features</h3>
                  <ul className="space-y-2 text-gray-600">
                    <li>• <strong>Multiple Currencies:</strong> Support for 15+ currencies</li>
                    <li>• <strong>Flexible Input:</strong> Percentage or fixed amount discounts</li>
                    <li>• <strong>Instant Results:</strong> See final price and savings immediately</li>
                    <li>• <strong>Comparison Tool:</strong> Common discount percentages</li>
                    <li>• <strong>Precise Calculations:</strong> Accurate to 2 decimal places</li>
                  </ul>
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

export default DiscountCalculator;