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
        <title>Discount Calculator - Calculate Sale Prices & Savings | ToolsHub</title>
        <meta name="description" content="Free discount calculator to calculate sale prices, discount amounts, and savings. Support for multiple currencies worldwide. Perfect for shopping, sales, and business pricing." />
        <meta name="keywords" content="discount calculator, sale price calculator, percentage discount, savings calculator, price reduction calculator, best deals, shopping discounts" />
        <meta property="og:title" content="Discount Calculator - Calculate Sale Prices & Savings | ToolsHub" />
        <meta property="og:description" content="Free discount calculator to calculate sale prices, discount amounts, and savings. Support for multiple currencies worldwide." />
        <meta property="og:type" content="website" />
        <link rel="canonical" href="/tools/discount-calculator" />
      </Helmet>

      <div className="min-h-screen flex flex-col" data-testid="page-discount-calculator">
        <Header />

        <main className="flex-1 bg-neutral-50">
          {/* Hero Section */}
          <section className="gradient-hero text-white py-16">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <div className="w-20 h-20 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <i className="fas fa-tags text-3xl"></i>
              </div>
              <h1 className="text-4xl sm:text-5xl font-bold mb-6" data-testid="text-page-title">
                Discount Calculator
              </h1>
              <p className="text-xl text-blue-100 max-w-2xl mx-auto">
                Calculate sale prices, discount amounts, and savings with support for multiple currencies worldwide
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

          {/* SEO Content Section */}
          <section className="py-16">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Free Discount Calculator - Calculate Sale Prices, Savings & Percentage Discounts
              </h2>
              <p className="text-lg text-gray-600 max-w-4xl mx-auto leading-relaxed">
                Make smart shopping decisions with our comprehensive discount calculator. Calculate final sale prices, 
                total savings, and percentage discounts instantly. Perfect for shoppers, retailers, business owners, 
                and anyone looking to maximize their savings or set competitive pricing strategies.
              </p>
            </div>

            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
              {/* What is a Discount Calculator */}
              <div className="bg-white rounded-2xl p-8 shadow-sm border">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">What is a Discount Calculator?</h3>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  A discount calculator is a powerful financial tool that helps you determine the final price of an item after applying 
                  a discount, calculate the total amount saved, and understand the percentage savings. Whether you're shopping for deals, 
                  running a business sale, or comparing prices across different retailers, our calculator provides instant, accurate results 
                  with support for multiple currencies worldwide.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-blue-50 p-6 rounded-lg">
                    <h4 className="font-semibold text-blue-900 mb-3">For Shoppers</h4>
                    <p className="text-blue-800 text-sm">
                      Calculate how much you'll actually pay and save during sales, Black Friday deals, or clearance events.
                    </p>
                  </div>
                  <div className="bg-green-50 p-6 rounded-lg">
                    <h4 className="font-semibold text-green-900 mb-3">For Businesses</h4>
                    <p className="text-green-800 text-sm">
                      Set competitive discount rates, calculate profit margins, and plan promotional pricing strategies.
                    </p>
                  </div>
                </div>
              </div>

              {/* Audience-Specific Benefits */}
              <div className="bg-white rounded-2xl p-8 shadow-sm border">
                <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">Who Benefits from Our Discount Calculator?</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <i className="fas fa-graduation-cap text-blue-600 text-xl"></i>
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-3">Students</h4>
                    <p className="text-gray-600 text-sm">
                      Calculate textbook discounts, student deals, and budget-friendly purchases. Perfect for managing limited budgets and finding the best educational deals.
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <i className="fas fa-briefcase text-green-600 text-xl"></i>
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-3">Professionals</h4>
                    <p className="text-gray-600 text-sm">
                      Evaluate corporate discounts, business purchases, and professional tool deals. Essential for expense reporting and budget management.
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <i className="fas fa-store text-purple-600 text-xl"></i>
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-3">Business Owners</h4>
                    <p className="text-gray-600 text-sm">
                      Set competitive pricing, calculate wholesale discounts, and manage inventory clearance sales. Optimize profit margins and pricing strategies.
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <i className="fas fa-home text-orange-600 text-xl"></i>
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-3">Families</h4>
                    <p className="text-gray-600 text-sm">
                      Plan household purchases, calculate seasonal sales savings, and compare deals across stores. Maximize family budget efficiency.
                    </p>
                  </div>
                </div>
              </div>

              {/* Common Use Cases */}
              <div className="bg-gray-50 rounded-2xl p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">Common Use Cases for Discount Calculations</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white p-6 rounded-lg shadow-sm">
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                      <i className="fas fa-shopping-cart text-purple-600"></i>
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-3">Online Shopping</h4>
                    <p className="text-gray-600 text-sm">
                      Compare deals across different websites, calculate coupon savings, and determine the best value for money during sales events.
                    </p>
                  </div>
                  <div className="bg-white p-6 rounded-lg shadow-sm">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                      <i className="fas fa-store text-blue-600"></i>
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-3">Retail Business</h4>
                    <p className="text-gray-600 text-sm">
                      Price merchandise competitively, calculate clearance prices, and determine optimal discount rates for inventory management.
                    </p>
                  </div>
                  <div className="bg-white p-6 rounded-lg shadow-sm">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                      <i className="fas fa-chart-line text-green-600"></i>
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-3">Budget Planning</h4>
                    <p className="text-gray-600 text-sm">
                      Plan purchases around sales periods, calculate potential savings, and make informed spending decisions within your budget.
                    </p>
                  </div>
                </div>
              </div>

              {/* How to Calculate Discounts */}
              <div className="bg-white rounded-2xl p-8 shadow-sm border">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">How to Calculate Discounts: Step-by-Step Guide</h3>
                <div className="space-y-6">
                  <div className="border-l-4 border-blue-500 pl-6">
                    <h4 className="font-semibold text-gray-900 mb-2">Method 1: Percentage Discount</h4>
                    <p className="text-gray-600 mb-3">
                      To calculate a percentage discount, multiply the original price by the discount percentage and divide by 100.
                    </p>
                    <div className="bg-gray-50 p-4 rounded-lg font-mono text-sm">
                      <p><strong>Formula:</strong> Discount Amount = (Original Price × Discount %) ÷ 100</p>
                      <p><strong>Final Price:</strong> Original Price - Discount Amount</p>
                      <p><strong>Example:</strong> $100 with 20% discount = $100 - ($100 × 20 ÷ 100) = $80</p>
                    </div>
                  </div>
                  <div className="border-l-4 border-green-500 pl-6">
                    <h4 className="font-semibold text-gray-900 mb-2">Method 2: Fixed Amount Discount</h4>
                    <p className="text-gray-600 mb-3">
                      For fixed amount discounts, simply subtract the discount amount from the original price.
                    </p>
                    <div className="bg-gray-50 p-4 rounded-lg font-mono text-sm">
                      <p><strong>Formula:</strong> Final Price = Original Price - Discount Amount</p>
                      <p><strong>Percentage Saved:</strong> (Discount Amount ÷ Original Price) × 100</p>
                      <p><strong>Example:</strong> $100 with $25 off = $100 - $25 = $75 (25% savings)</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Benefits and Features */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-blue-50 rounded-2xl p-8">
                  <h3 className="text-2xl font-bold text-blue-900 mb-6">Why Use Our Discount Calculator?</h3>
                  <ul className="space-y-3 text-blue-800">
                    <li className="flex items-start gap-3">
                      <i className="fas fa-check-circle text-blue-600 mt-1"></i>
                      <span><strong>Instant Results:</strong> Get immediate calculations without manual math</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <i className="fas fa-globe text-blue-600 mt-1"></i>
                      <span><strong>Global Currency Support:</strong> Calculate discounts in 15+ currencies</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <i className="fas fa-calculator text-blue-600 mt-1"></i>
                      <span><strong>Dual Input Methods:</strong> Use percentage or fixed amount discounts</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <i className="fas fa-chart-bar text-blue-600 mt-1"></i>
                      <span><strong>Comparison Tool:</strong> See common discount percentages at a glance</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <i className="fas fa-mobile-alt text-blue-600 mt-1"></i>
                      <span><strong>Mobile Friendly:</strong> Calculate discounts on any device, anywhere</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-green-50 rounded-2xl p-8">
                  <h3 className="text-2xl font-bold text-green-900 mb-6">Smart Shopping Tips</h3>
                  <ul className="space-y-3 text-green-800">
                    <li className="flex items-start gap-3">
                      <i className="fas fa-lightbulb text-green-600 mt-1"></i>
                      <span>Compare percentage vs. dollar amount discounts to find the better deal</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <i className="fas fa-calendar text-green-600 mt-1"></i>
                      <span>Time major purchases around seasonal sales for maximum savings</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <i className="fas fa-tags text-green-600 mt-1"></i>
                      <span>Stack coupons with store discounts for additional savings</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <i className="fas fa-search text-green-600 mt-1"></i>
                      <span>Use our calculator to verify advertised sale prices</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <i className="fas fa-piggy-bank text-green-600 mt-1"></i>
                      <span>Calculate total annual savings from regular discount shopping</span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Integration with Financial Planning */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Complete Your Financial Planning Toolkit</h3>
                <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                  The discount calculator works seamlessly with our other financial tools to provide comprehensive money management solutions. 
                  Whether you're planning purchases, managing budgets, or analyzing investments, our integrated calculator suite helps you 
                  make informed financial decisions across all areas of your financial life.
                </p>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div>
                    <h4 className="text-xl font-semibold text-gray-900 mb-4">Budget and Savings Tools</h4>
                    <ul className="space-y-3">
                      <li>
                        <a href="/tools/percentage-calculator" className="text-blue-600 hover:text-blue-700 font-medium">Percentage Calculator</a>
                        <span className="text-gray-600"> - Calculate percentage savings and budget allocations</span>
                      </li>
                      <li>
                        <a href="/tools/savings-goal-calculator" className="text-blue-600 hover:text-blue-700 font-medium">Savings Goal Calculator</a>
                        <span className="text-gray-600"> - Plan for major purchases with discount considerations</span>
                      </li>
                      <li>
                        <a href="/tools/compound-interest-calculator" className="text-blue-600 hover:text-blue-700 font-medium">Compound Interest Calculator</a>
                        <span className="text-gray-600"> - Grow savings from money saved through discounts</span>
                      </li>
                      <li>
                        <a href="/tools/currency-converter" className="text-blue-600 hover:text-blue-700 font-medium">Currency Converter</a>
                        <span className="text-gray-600"> - Compare international deals and discounts</span>
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-xl font-semibold text-gray-900 mb-4">Business and Investment Tools</h4>
                    <ul className="space-y-3">
                      <li>
                        <a href="/tools/roi-calculator" className="text-blue-600 hover:text-blue-700 font-medium">ROI Calculator</a>
                        <span className="text-gray-600"> - Analyze discount strategies and profit margins</span>
                      </li>
                      <li>
                        <a href="/tools/break-even-calculator" className="text-blue-600 hover:text-blue-700 font-medium">Break-Even Calculator</a>
                        <span className="text-gray-600"> - Determine optimal discount rates for business</span>
                      </li>
                      <li>
                        <a href="/tools/loan-calculator" className="text-blue-600 hover:text-blue-700 font-medium">Loan Calculator</a>
                        <span className="text-gray-600"> - Finance purchases after applying discounts</span>
                      </li>
                      <li>
                        <a href="/tools/tip-calculator" className="text-blue-600 hover:text-blue-700 font-medium">Tip Calculator</a>
                        <span className="text-gray-600"> - Calculate service charges on discounted bills</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Advanced Discount Strategies */}
              <div className="bg-white rounded-2xl p-8 shadow-sm border">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Advanced Discount Calculation Strategies</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div>
                    <h4 className="text-xl font-semibold text-gray-900 mb-4">Multiple Discount Scenarios</h4>
                    <div className="space-y-4">
                      <div className="border-l-4 border-blue-500 pl-4">
                        <h5 className="font-semibold text-gray-800">Sequential Discounts</h5>
                        <p className="text-gray-600 text-sm mb-2">
                          When dealing with multiple discounts (like store discount + coupon), apply them sequentially rather than adding percentages.
                        </p>
                        <div className="bg-gray-50 p-3 rounded text-sm font-mono">
                          Example: 20% store discount + 10% coupon<br/>
                          $100 → $80 (20% off) → $72 (10% off $80) = 28% total savings
                        </div>
                      </div>
                      <div className="border-l-4 border-green-500 pl-4">
                        <h5 className="font-semibold text-gray-800">Cashback Combinations</h5>
                        <p className="text-gray-600 text-sm mb-2">
                          Factor in credit card cashback or loyalty points when calculating true discount value.
                        </p>
                        <div className="bg-gray-50 p-3 rounded text-sm">
                          Use our <a href="/tools/percentage-calculator" className="text-blue-600 hover:underline">Percentage Calculator</a> to compute total savings including cashback rewards.
                        </div>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-xl font-semibold text-gray-900 mb-4">Business Pricing Strategies</h4>
                    <div className="space-y-4">
                      <div className="border-l-4 border-purple-500 pl-4">
                        <h5 className="font-semibold text-gray-800">Psychological Pricing</h5>
                        <p className="text-gray-600 text-sm mb-2">
                          Calculate discount amounts that result in psychologically appealing prices (ending in 9, 99, etc.).
                        </p>
                      </div>
                      <div className="border-l-4 border-orange-500 pl-4">
                        <h5 className="font-semibold text-gray-800">Volume Discount Tiers</h5>
                        <p className="text-gray-600 text-sm mb-2">
                          Structure bulk purchase discounts to maximize revenue while incentivizing larger orders.
                        </p>
                        <div className="bg-gray-50 p-3 rounded text-sm">
                          Combine with our <a href="/tools/break-even-calculator" className="text-blue-600 hover:underline">Break-Even Calculator</a> to ensure profitability.
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Industry-Specific Applications */}
              <div className="bg-gray-50 rounded-2xl p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">Industry-Specific Discount Applications</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white p-6 rounded-lg">
                    <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center mb-4">
                      <i className="fas fa-tshirt text-pink-600"></i>
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-3">Retail & Fashion</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Seasonal clearance pricing</li>
                      <li>• Flash sale calculations</li>
                      <li>• Customer loyalty discounts</li>
                      <li>• Inventory turnover optimization</li>
                    </ul>
                  </div>
                  <div className="bg-white p-6 rounded-lg">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                      <i className="fas fa-laptop text-blue-600"></i>
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-3">Technology & Software</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Enterprise license discounts</li>
                      <li>• Educational pricing tiers</li>
                      <li>• Subscription upgrade incentives</li>
                      <li>• Volume licensing calculations</li>
                    </ul>
                  </div>
                  <div className="bg-white p-6 rounded-lg">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                      <i className="fas fa-utensils text-green-600"></i>
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-3">Food & Hospitality</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Happy hour pricing</li>
                      <li>• Group booking discounts</li>
                      <li>• Loyalty program benefits</li>
                      <li>• Catering package deals</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* FAQ Section */}
              <div className="bg-white rounded-2xl p-8 shadow-sm border">
                <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">Frequently Asked Questions</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">How accurate are the calculations?</h4>
                      <p className="text-gray-600 text-sm">
                        Our calculator provides precise results accurate to 2 decimal places, ensuring you get exact final prices and savings amounts.
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Can I calculate multiple discounts?</h4>
                      <p className="text-gray-600 text-sm">
                        Currently, the calculator handles single discounts. For multiple discounts, apply them sequentially using the final price as the new original price.
                      </p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Which currencies are supported?</h4>
                      <p className="text-gray-600 text-sm">
                        We support 15+ major currencies including USD, EUR, GBP, INR, JPY, CAD, AUD, and many more for global accessibility.
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Is the calculator free to use?</h4>
                      <p className="text-gray-600 text-sm">
                        Yes, our discount calculator is completely free with no registration required. Use it as many times as you need for all your calculations.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Related Tools Section */}
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">Complete Financial Calculator Suite</h3>
                <p className="text-center text-gray-600 mb-8">
                  Enhance your financial planning with our comprehensive suite of calculator tools designed for personal and business use.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <a href="/tools/percentage-calculator" className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow border border-gray-100 hover:border-blue-200 group">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-blue-200 transition-colors">
                      <Calculator className="w-6 h-6 text-blue-600" />
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-2">Percentage Calculator</h4>
                    <p className="text-gray-600 text-sm">Calculate percentages, increases, decreases, and percentage relationships for any scenario.</p>
                  </a>

                  <a href="/tools/tip-calculator" className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow border border-gray-100 hover:border-green-200 group">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-green-200 transition-colors">
                      <DollarSign className="w-6 h-6 text-green-600" />
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-2">Tip Calculator</h4>
                    <p className="text-gray-600 text-sm">Calculate tip amounts and split bills with support for multiple currencies and group dining.</p>
                  </a>

                  <a href="/tools/currency-converter" className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow border border-gray-100 hover:border-purple-200 group">
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-purple-200 transition-colors">
                      <i className="fas fa-exchange-alt text-purple-600"></i>
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-2">Currency Converter</h4>
                    <p className="text-gray-600 text-sm">Convert between global currencies with real-time rates for international shopping and business.</p>
                  </a>

                  <a href="/tools/loan-calculator" className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow border border-gray-100 hover:border-orange-200 group">
                    <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-orange-200 transition-colors">
                      <Calculator className="w-6 h-6 text-orange-600" />
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-2">Loan Calculator</h4>
                    <p className="text-gray-600 text-sm">Calculate loan payments, interest costs, and amortization schedules for any financing needs.</p>
                  </a>

                  <a href="/tools/compound-interest-calculator" className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow border border-gray-100 hover:border-red-200 group">
                    <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-red-200 transition-colors">
                      <i className="fas fa-chart-line text-red-600"></i>
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-2">Compound Interest Calculator</h4>
                    <p className="text-gray-600 text-sm">Calculate investment growth with compound interest for long-term financial planning.</p>
                  </a>

                  <a href="/tools/roi-calculator" className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow border border-gray-100 hover:border-indigo-200 group">
                    <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-indigo-200 transition-colors">
                      <i className="fas fa-chart-pie text-indigo-600"></i>
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-2">ROI Calculator</h4>
                    <p className="text-gray-600 text-sm">Evaluate return on investment for business decisions and investment opportunities.</p>
                  </a>
                </div>
              </div>
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