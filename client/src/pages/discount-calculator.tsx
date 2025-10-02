
import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface DiscountResult {
  originalPrice: number;
  discountAmount: number;
  finalPrice: number;
  savingsAmount: number;
  savingsPercentage: number;
  discountType: string;
}

export default function DiscountCalculator() {
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
    let discountType = '';

    if (calculationType === 'percentage') {
      const percent = parseFloat(discountPercent);
      if (isNaN(percent) || percent < 0 || percent > 100) return;
      discount = (price * percent) / 100;
      discountType = `${percent}% discount`;
    } else {
      discount = parseFloat(discountAmount);
      if (isNaN(discount) || discount < 0 || discount > price) return;
      discountType = `${formatCurrency(discount)} discount`;
    }

    const finalPrice = price - discount;
    const savingsPercentage = (discount / price) * 100;

    setResult({
      originalPrice: Math.round(price * 100) / 100,
      discountAmount: Math.round(discount * 100) / 100,
      finalPrice: Math.round(finalPrice * 100) / 100,
      savingsAmount: Math.round(discount * 100) / 100,
      savingsPercentage: Math.round(savingsPercentage * 100) / 100,
      discountType
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
      MXN: { locale: 'es-MX', currency: 'MXN' }
    };

    const config = currencyMap[currency] || currencyMap.USD;
    
    return new Intl.NumberFormat(config.locale, {
      style: 'currency',
      currency: config.currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  // Calculate multiple discount scenarios for comparison
  const getCommonDiscounts = () => {
    const price = parseFloat(originalPrice);
    if (isNaN(price) || price <= 0) return [];

    const discounts = [10, 15, 20, 25, 30, 40, 50];
    return discounts.map(percent => ({
      percent,
      discount: (price * percent) / 100,
      final: price - (price * percent) / 100,
      savings: (price * percent) / 100
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Helmet>
        <title>Discount Calculator - Calculate Sale Prices & Savings Instantly | DapsiWow</title>
        <meta name="description" content="Free discount calculator to calculate sale prices, discount amounts, and savings. Support for percentage and fixed amount discounts with multiple currencies. Perfect for shopping, business sales, and price comparisons." />
        <meta name="keywords" content="discount calculator, sale price calculator, percentage discount calculator, savings calculator, price reduction calculator, shopping calculator, retail discount calculator, business discount tool, markdown calculator" />
        <meta property="og:title" content="Discount Calculator - Calculate Sale Prices & Savings Instantly | DapsiWow" />
        <meta property="og:description" content="Free discount calculator for calculating sale prices, discount amounts, and savings. Support for percentage and fixed amount discounts with multiple currencies worldwide." />
        <meta property="og:type" content="website" />
        <meta name="robots" content="index, follow" />
        <meta name="author" content="DapsiWow" />
        <link rel="canonical" href="https://dapsiwow.com/tools/discount-calculator" />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            "name": "Discount Calculator",
            "description": "Free online discount calculator to calculate sale prices, discount amounts, and savings for shopping, business sales, and price comparisons. Features percentage and fixed amount discounts with multiple currency support.",
            "url": "https://dapsiwow.com/tools/discount-calculator",
            "applicationCategory": "CalculatorApplication",
            "operatingSystem": "Any",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "USD"
            },
            "featureList": [
              "Percentage discount calculations",
              "Fixed amount discount calculations",
              "Multiple currency support",
              "Instant savings calculations",
              "Price comparison tools",
              "Business discount planning"
            ]
          })}
        </script>
      </Helmet>
      
      <Header />
      
      <main>
        {/* Hero Section */}
        <section className="relative py-12 sm:py-16 md:py-20 lg:py-24 xl:py-28 2xl:py-32 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-indigo-600/20"></div>
          <div className="relative max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 xl:px-12 text-center">
            <div className="space-y-4 sm:space-y-6 md:space-y-8 lg:space-y-10">
              <div className="inline-flex items-center px-3 py-1.5 sm:px-4 sm:py-2 md:px-5 md:py-2.5 bg-white/80 backdrop-blur-sm rounded-full border border-blue-200 text-xs sm:text-sm md:text-base">
                <span className="font-medium text-blue-700">Professional Discount Calculator</span>
              </div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl 2xl:text-7xl font-bold text-slate-900 leading-tight tracking-tight">
                <span className="block">Smart Discount</span>
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                  Calculator
                </span>
              </h1>
              <p className="text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl text-slate-600 max-w-xs sm:max-w-md md:max-w-2xl lg:max-w-4xl xl:max-w-5xl mx-auto leading-relaxed px-2 sm:px-4 md:px-6">
                Calculate sale prices, discount amounts, and savings with advanced features for shopping and business
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
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">Discount Configuration</h2>
                    <p className="text-gray-600">Enter price and discount details to calculate savings and final price</p>
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
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Original Price */}
                    <div className="space-y-3">
                      <Label htmlFor="original-price" className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                        Original Price
                      </Label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-lg">$</span>
                        <Input
                          id="original-price"
                          type="number"
                          value={originalPrice}
                          onChange={(e) => setOriginalPrice(e.target.value)}
                          className="h-14 pl-8 text-lg border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-blue-500"
                          placeholder="100.00"
                          min="0"
                          step="0.01"
                          data-testid="input-original-price"
                        />
                      </div>
                    </div>

                    {/* Discount Type */}
                    <div className="space-y-3">
                      <Label className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                        Discount Type
                      </Label>
                      <Select value={calculationType} onValueChange={setCalculationType}>
                        <SelectTrigger className="h-14 border-2 border-gray-200 rounded-xl text-lg" data-testid="select-discount-type">
                          <SelectValue />
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
                        <Label htmlFor="discount-percent" className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                          Discount Percentage
                        </Label>
                        <div className="relative">
                          <Input
                            id="discount-percent"
                            type="number"
                            value={discountPercent}
                            onChange={(e) => setDiscountPercent(e.target.value)}
                            className="h-14 pr-8 text-lg border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-blue-500"
                            placeholder="20"
                            min="0"
                            max="100"
                            step="0.01"
                            data-testid="input-discount-percent"
                          />
                          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 text-lg">%</span>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <Label htmlFor="discount-amount" className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                          Discount Amount
                        </Label>
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-lg">$</span>
                          <Input
                            id="discount-amount"
                            type="number"
                            value={discountAmount}
                            onChange={(e) => setDiscountAmount(e.target.value)}
                            className="h-14 pl-8 text-lg border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-blue-500"
                            placeholder="20.00"
                            min="0"
                            step="0.01"
                            data-testid="input-discount-amount"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-4 pt-6">
                    <Button
                      onClick={calculateDiscount}
                      className="flex-1 h-14 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold text-lg rounded-xl shadow-lg transform transition-all duration-200 hover:scale-105"
                      data-testid="button-calculate"
                    >
                      Calculate Discount
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

                  {/* Common Discounts Reference */}
                  {originalPrice && !isNaN(parseFloat(originalPrice)) && (
                    <div className="pt-8 border-t">
                      <h3 className="text-xl font-bold text-gray-900 mb-4">Quick Discount Reference</h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {getCommonDiscounts().slice(0, 8).map(({ percent, final, savings }) => (
                          <div key={percent} className="bg-gray-50 rounded-lg p-3 text-center">
                            <div className="text-sm font-semibold text-gray-800">{percent}% off</div>
                            <div className="text-lg font-bold text-green-600">{formatCurrency(final)}</div>
                            <div className="text-xs text-gray-500">Save {formatCurrency(savings)}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Results Section */}
                <div className="bg-gradient-to-br from-gray-50 to-blue-50 p-8 lg:p-12">
                  <h2 className="text-2xl font-bold text-gray-900 mb-8">Results</h2>
                  
                  {result ? (
                    <div className="space-y-6" data-testid="discount-results">
                      {/* Final Price Highlight */}
                      <div className="bg-white rounded-2xl p-6 shadow-lg border border-blue-100">
                        <div className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-2">Final Price</div>
                        <div className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600" data-testid="text-final-price">
                          {formatCurrency(result.finalPrice)}
                        </div>
                        <div className="text-sm text-green-700 mt-2">
                          {result.discountType} applied
                        </div>
                      </div>

                      {/* Savings Breakdown */}
                      <div className="space-y-4">
                        <div className="bg-white rounded-xl p-4 shadow-sm">
                          <div className="flex justify-between items-center">
                            <span className="font-medium text-gray-700">Original Price</span>
                            <span className="font-bold text-gray-900" data-testid="text-original-price">
                              {formatCurrency(result.originalPrice)}
                            </span>
                          </div>
                        </div>
                        <div className="bg-white rounded-xl p-4 shadow-sm">
                          <div className="flex justify-between items-center">
                            <span className="font-medium text-gray-700">Discount Amount</span>
                            <span className="font-bold text-red-600" data-testid="text-discount-amount">
                              -{formatCurrency(result.discountAmount)}
                            </span>
                          </div>
                        </div>
                        <div className="bg-white rounded-xl p-4 shadow-sm">
                          <div className="flex justify-between items-center">
                            <span className="font-medium text-gray-700">You Save</span>
                            <span className="font-bold text-green-600" data-testid="text-savings-percentage">
                              {result.savingsPercentage}%
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Savings Summary */}
                      <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
                        <h4 className="font-bold text-green-800 mb-4 text-lg">Your Savings Summary</h4>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-green-700 font-medium">Amount Saved:</span>
                            <span className="font-bold text-green-800 text-lg">
                              {formatCurrency(result.savingsAmount)}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-green-700 font-medium">Percentage Saved:</span>
                            <span className="font-bold text-green-800 text-lg">
                              {result.savingsPercentage}%
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-16" data-testid="no-results">
                      <div className="w-20 h-20 bg-gray-200 rounded-full mx-auto mb-6 flex items-center justify-center">
                        <div className="text-3xl font-bold text-gray-400">%</div>
                      </div>
                      <p className="text-gray-500 text-lg">Enter price and discount details to see savings results</p>
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
                <h3 className="text-2xl font-bold text-gray-900 mb-6">What is a Discount Calculator?</h3>
                <div className="space-y-4 text-gray-600">
                  <p>
                    A discount calculator is an essential financial tool that helps consumers, retailers, and business owners 
                    calculate sale prices, discount amounts, and total savings quickly and accurately. Whether you're shopping 
                    during Black Friday sales, planning retail markdowns, or comparing prices across different stores, this 
                    calculator provides instant results to help you make informed purchasing decisions.
                  </p>
                  <p>
                    Our advanced discount calculator supports both percentage-based discounts (like 20% off) and fixed amount 
                    discounts (like $10 off), with multiple currency support for international shopping and business applications. 
                    The tool calculates not only the final price but also shows your total savings and the percentage saved.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">How to Use the Discount Calculator</h3>
                <div className="space-y-4 text-gray-600">
                  <p>
                    Using our discount calculator is simple and intuitive. Start by selecting your preferred currency, then 
                    enter the original price of the item you're interested in purchasing or selling.
                  </p>
                  <ul className="space-y-2 list-disc list-inside">
                    <li>Choose your currency from our supported options</li>
                    <li>Enter the original price before any discounts</li>
                    <li>Select either percentage or fixed amount discount type</li>
                    <li>Input your discount value (percentage or amount)</li>
                    <li>Click "Calculate Discount" for instant results</li>
                    <li>Review the final price, savings amount, and percentage saved</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Features of Our Discount Calculator</h3>
                <div className="space-y-3 text-gray-600">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Support for 10+ international currencies</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Percentage and fixed amount discount calculations</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Instant final price and savings calculations</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Quick discount reference for common percentages</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Mobile-responsive design for on-the-go calculations</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Benefits of Using Our Calculator</h3>
                <div className="space-y-3 text-gray-600">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Save money by comparing discount offers instantly</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Make informed purchasing decisions with accurate calculations</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Plan business sales and pricing strategies effectively</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Understand the real value of promotional offers</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Free to use with no registration or hidden fees</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Additional SEO Content Sections */}
          <div className="mt-12 space-y-8">
            {/* Discount Types Section */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-8">Types of Discounts and Calculations</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-lg font-semibold text-gray-800 mb-3">Percentage Discounts</h4>
                      <p className="text-gray-600 text-sm mb-3">
                        Percentage discounts are the most common type of sale pricing, where you save a certain percentage 
                        of the original price. For example, a 25% discount on a $100 item saves you $25, making the final price $75.
                      </p>
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <h5 className="font-semibold text-blue-800 mb-2">Formula:</h5>
                        <code className="text-sm">Final Price = Original Price - (Original Price × Discount %)</code>
                      </div>
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-gray-800 mb-3">Fixed Amount Discounts</h4>
                      <p className="text-gray-600 text-sm mb-3">
                        Fixed amount discounts subtract a specific dollar amount from the original price, regardless of the 
                        item's cost. A $20 discount applies the same savings whether the item costs $50 or $200.
                      </p>
                      <div className="bg-green-50 p-4 rounded-lg">
                        <h5 className="font-semibold text-green-800 mb-2">Formula:</h5>
                        <code className="text-sm">Final Price = Original Price - Discount Amount</code>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-lg font-semibold text-gray-800 mb-3">Multi-tier Discounts</h4>
                      <p className="text-gray-600 text-sm mb-3">
                        Some sales offer increasing discounts based on purchase amount, such as 10% off $50+, 
                        15% off $100+, and 20% off $200+. Our calculator helps you determine the best value.
                      </p>
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-gray-800 mb-3">Seasonal Sale Strategies</h4>
                      <p className="text-gray-600 text-sm mb-3">
                        Understanding seasonal discount patterns helps you time purchases for maximum savings. 
                        Black Friday, end-of-season clearances, and holiday sales often offer the deepest discounts.
                      </p>
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-gray-800 mb-3">Bulk Purchase Discounts</h4>
                      <p className="text-gray-600 text-sm mb-3">
                        Quantity-based discounts reward larger purchases with greater savings. Calculate per-unit 
                        costs to determine if bulk pricing truly offers better value.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Shopping and Business Applications */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
                <CardContent className="p-8">
                  <h3 className="text-xl font-bold text-gray-900 mb-6">Smart Shopping Applications</h3>
                  <div className="space-y-4 text-gray-600">
                    <p className="text-sm">
                      Use our discount calculator to maximize your shopping savings and make informed purchasing decisions 
                      during sales events and promotional periods.
                    </p>
                    <div className="space-y-2">
                      <h4 className="font-semibold text-gray-800 text-sm">Shopping Strategies:</h4>
                      <ul className="text-xs space-y-1 list-disc list-inside">
                        <li>Compare multiple store discount offers</li>
                        <li>Calculate Black Friday and Cyber Monday savings</li>
                        <li>Determine best value during clearance sales</li>
                        <li>Evaluate coupon vs. percentage discount benefits</li>
                        <li>Plan budget allocation for seasonal purchases</li>
                        <li>Calculate cost per unit for bulk items</li>
                        <li>Assess loyalty program discount values</li>
                        <li>Compare online vs. in-store pricing</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
                <CardContent className="p-8">
                  <h3 className="text-xl font-bold text-gray-900 mb-6">Retail Business Uses</h3>
                  <div className="space-y-4 text-gray-600">
                    <p className="text-sm">
                      Retailers and business owners can use this calculator for pricing strategies, promotional planning, 
                      and profit margin analysis.
                    </p>
                    <div className="space-y-2">
                      <h4 className="font-semibold text-gray-800 text-sm">Business Applications:</h4>
                      <ul className="text-xs space-y-1 list-disc list-inside">
                        <li>Set competitive discount pricing</li>
                        <li>Plan seasonal sale strategies</li>
                        <li>Calculate markdown impacts on profit</li>
                        <li>Design tiered discount programs</li>
                        <li>Analyze promotional effectiveness</li>
                        <li>Determine clearance pricing levels</li>
                        <li>Create volume discount structures</li>
                        <li>Optimize inventory turnover rates</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
                <CardContent className="p-8">
                  <h3 className="text-xl font-bold text-gray-900 mb-6">Financial Planning</h3>
                  <div className="space-y-4 text-gray-600">
                    <p className="text-sm">
                      Incorporate discount calculations into your personal financial planning and budgeting strategies 
                      for better money management.
                    </p>
                    <div className="space-y-2">
                      <h4 className="font-semibold text-gray-800 text-sm">Planning Benefits:</h4>
                      <ul className="text-xs space-y-1 list-disc list-inside">
                        <li>Budget allocation for sales events</li>
                        <li>Calculate annual shopping savings</li>
                        <li>Plan major purchase timing</li>
                        <li>Track discount ROI on investments</li>
                        <li>Optimize spending during promotions</li>
                        <li>Compare financing vs. cash discounts</li>
                        <li>Evaluate membership program values</li>
                        <li>Assess bulk purchase economics</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Advanced Tips and Strategies */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Advanced Discount Calculation Tips</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="bg-green-50 border-l-4 border-green-400 p-4 rounded-r-lg">
                      <h4 className="font-semibold text-green-800 mb-2">Stacking Discounts</h4>
                      <p className="text-green-700 text-sm">When possible, combine multiple discounts (coupon + sale price + cashback) for maximum savings. Calculate each discount sequentially for accurate totals.</p>
                    </div>
                    <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-lg">
                      <h4 className="font-semibold text-blue-800 mb-2">Price Comparison Strategy</h4>
                      <p className="text-blue-700 text-sm">Don't just compare discount percentages. A 20% discount on a higher-priced item might cost more than a 15% discount on a lower-priced alternative.</p>
                    </div>
                    <div className="bg-purple-50 border-l-4 border-purple-400 p-4 rounded-r-lg">
                      <h4 className="font-semibold text-purple-800 mb-2">Timing Your Purchases</h4>
                      <p className="text-purple-700 text-sm">Use discount calculators to track price histories and identify the best times to buy. Some items have predictable discount cycles.</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="bg-orange-50 border-l-4 border-orange-400 p-4 rounded-r-lg">
                      <h4 className="font-semibold text-orange-800 mb-2">Hidden Costs Consideration</h4>
                      <p className="text-orange-700 text-sm">Factor in shipping, taxes, and fees when calculating true savings. A larger discount with high shipping might be less valuable than a smaller discount with free shipping.</p>
                    </div>
                    <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-r-lg">
                      <h4 className="font-semibold text-red-800 mb-2">Quality vs. Discount Balance</h4>
                      <p className="text-red-700 text-sm">Consider the value proposition beyond just price. Sometimes paying slightly more for better quality or service provides better long-term value.</p>
                    </div>
                    <div className="bg-indigo-50 border-l-4 border-indigo-400 p-4 rounded-r-lg">
                      <h4 className="font-semibold text-indigo-800 mb-2">Bulk vs. Individual Pricing</h4>
                      <p className="text-indigo-700 text-sm">Calculate per-unit costs for bulk purchases. Sometimes individual items on sale cost less per unit than bulk pricing without discounts.</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Discount FAQs */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-8">Frequently Asked Questions about Discount Calculations</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">How do I calculate percentage discounts manually?</h4>
                      <p className="text-gray-600 text-sm">To calculate a percentage discount manually, multiply the original price by the discount percentage (as a decimal), then subtract that amount from the original price. For example: $100 × 0.20 = $20 discount, so final price = $100 - $20 = $80.</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">What's the difference between discount percentage and savings percentage?</h4>
                      <p className="text-gray-600 text-sm">Discount percentage is the amount off the original price, while savings percentage shows what portion of the original price you're saving. They're the same in simple discounts but can differ in complex promotional scenarios.</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">Can I combine multiple discounts?</h4>
                      <p className="text-gray-600 text-sm">Discount stacking depends on the retailer's policy. When allowed, apply percentage discounts first, then fixed amount discounts. Some stores limit combinations, so check terms and conditions.</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">How do I compare discounts on different-priced items?</h4>
                      <p className="text-gray-600 text-sm">Calculate the final price for each item after applying their respective discounts. The item with the lowest final price offers the best value, regardless of the discount percentage.</p>
                    </div>
                  </div>
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">Are percentage or fixed amount discounts better?</h4>
                      <p className="text-gray-600 text-sm">It depends on the original price. Percentage discounts save more on expensive items, while fixed amount discounts can be better value on lower-priced items. Use our calculator to compare both scenarios.</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">How do I factor in taxes when calculating discounts?</h4>
                      <p className="text-gray-600 text-sm">Discounts are typically applied before taxes. Calculate the discounted price first, then add applicable taxes to get the final amount you'll pay.</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">What should I consider besides the discount amount?</h4>
                      <p className="text-gray-600 text-sm">Consider total cost including shipping, return policies, warranty terms, product quality, and the retailer's reputation. The cheapest price isn't always the best value.</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">How can businesses determine optimal discount percentages?</h4>
                      <p className="text-gray-600 text-sm">Businesses should consider profit margins, inventory levels, seasonal demand, competition, and customer price sensitivity. Test different discount levels and measure sales volume and profit impact.</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Seasonal Shopping Strategies */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Seasonal Discount Strategies and Timing</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-gray-800">Major Sales Events</h4>
                    <div className="space-y-3 text-gray-600">
                      <div className="bg-red-50 p-4 rounded-lg">
                        <h5 className="font-semibold text-red-800 mb-1">Black Friday & Cyber Monday</h5>
                        <p className="text-sm text-red-700">Typically offers 20-70% discounts on electronics, appliances, and fashion. Plan ahead and compare prices from multiple retailers.</p>
                      </div>
                      <div className="bg-green-50 p-4 rounded-lg">
                        <h5 className="font-semibold text-green-800 mb-1">End-of-Season Clearance</h5>
                        <p className="text-sm text-green-700">Clothing and seasonal items often see 50-80% discounts. Great for buying next year's seasonal items in advance.</p>
                      </div>
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <h5 className="font-semibold text-blue-800 mb-1">Back-to-School Sales</h5>
                        <p className="text-sm text-blue-700">Electronics, office supplies, and clothing typically discounted 15-40%. Timing varies by region and retailer.</p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-gray-800">Strategic Shopping Calendar</h4>
                    <div className="space-y-3 text-gray-600">
                      <div className="bg-purple-50 p-4 rounded-lg">
                        <h5 className="font-semibold text-purple-800 mb-1">January - February</h5>
                        <p className="text-sm text-purple-700">Best for fitness equipment, bedding, and winter clothing clearance. Post-holiday markdowns offer significant savings.</p>
                      </div>
                      <div className="bg-orange-50 p-4 rounded-lg">
                        <h5 className="font-semibold text-orange-800 mb-1">March - May</h5>
                        <p className="text-sm text-orange-700">Spring cleaning drives appliance sales, while tax refund season brings electronics and furniture discounts.</p>
                      </div>
                      <div className="bg-indigo-50 p-4 rounded-lg">
                        <h5 className="font-semibold text-indigo-800 mb-1">September - November</h5>
                        <p className="text-sm text-indigo-700">New model releases drive discounts on previous year's inventory, especially cars, electronics, and appliances.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* International Shopping Considerations */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">International Shopping and Currency Considerations</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-gray-800">Multi-Currency Shopping</h4>
                    <p className="text-gray-600 text-sm mb-4">
                      When shopping internationally, currency exchange rates significantly impact final prices. 
                      Our calculator supports multiple currencies to help you make accurate comparisons.
                    </p>
                    <div className="space-y-3">
                      <div className="bg-blue-50 p-3 rounded-lg">
                        <h5 className="font-semibold text-blue-800 text-sm mb-1">Exchange Rate Impact</h5>
                        <p className="text-blue-700 text-xs">A 20% discount in EUR might be less valuable than a 15% discount in USD depending on current exchange rates.</p>
                      </div>
                      <div className="bg-green-50 p-3 rounded-lg">
                        <h5 className="font-semibold text-green-800 text-sm mb-1">Regional Pricing Differences</h5>
                        <p className="text-green-700 text-xs">Same products often have different base prices across countries, making discount comparisons complex.</p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-gray-800">Hidden International Costs</h4>
                    <p className="text-gray-600 text-sm mb-4">
                      International purchases involve additional costs that can offset discount savings. 
                      Always factor these into your total cost calculations.
                    </p>
                    <div className="space-y-3">
                      <div className="bg-orange-50 p-3 rounded-lg">
                        <h5 className="font-semibold text-orange-800 text-sm mb-1">Additional Fees</h5>
                        <p className="text-orange-700 text-xs">Shipping, customs duties, import taxes, and currency conversion fees can add 10-30% to your total cost.</p>
                      </div>
                      <div className="bg-red-50 p-3 rounded-lg">
                        <h5 className="font-semibold text-red-800 text-sm mb-1">Return Considerations</h5>
                        <p className="text-red-700 text-xs">International returns are often expensive or impossible, making the discount less valuable if the item doesn't meet expectations.</p>
                      </div>
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
