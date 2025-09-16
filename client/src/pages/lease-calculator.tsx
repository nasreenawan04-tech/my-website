
import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface LeaseResult {
  monthlyPayment: number;
  totalAmount: number;
  totalInterest: number;
  depreciation: number;
  residualValue: number;
  acquisitionFee: number;
  dispositionFee: number;
}

export default function LeaseCalculator() {
  const [vehiclePrice, setVehiclePrice] = useState('30000');
  const [downPayment, setDownPayment] = useState('3000');
  const [leaseTerm, setLeaseTerm] = useState('36');
  const [interestRate, setInterestRate] = useState('4.5');
  const [residualPercent, setResidualPercent] = useState('60');
  const [acquisitionFee, setAcquisitionFee] = useState('595');
  const [dispositionFee, setDispositionFee] = useState('395');
  const [currency, setCurrency] = useState('USD');
  const [showBreakdown, setShowBreakdown] = useState(false);
  const [result, setResult] = useState<LeaseResult | null>(null);

  const calculateLease = () => {
    const price = parseFloat(vehiclePrice);
    const down = parseFloat(downPayment) || 0;
    const term = parseFloat(leaseTerm);
    const rate = parseFloat(interestRate) / 100 / 12; // Monthly interest rate
    const residualValue = (price * parseFloat(residualPercent)) / 100;
    const depreciation = price - residualValue;
    const acqFee = parseFloat(acquisitionFee) || 0;
    const dispFee = parseFloat(dispositionFee) || 0;

    if (price && term && rate >= 0) {
      // Lease payment calculation
      const monthlyDepreciation = depreciation / term;
      const monthlyInterest = (price + residualValue) * rate;
      const monthlyFees = acqFee / term;

      const monthlyPayment = monthlyDepreciation + monthlyInterest + monthlyFees - (down / term);
      const totalAmount = (monthlyPayment * term) + down + dispFee;
      const totalInterest = monthlyInterest * term;

      setResult({
        monthlyPayment: Math.max(0, Math.round(monthlyPayment * 100) / 100),
        totalAmount: Math.round(totalAmount * 100) / 100,
        totalInterest: Math.round(totalInterest * 100) / 100,
        depreciation: Math.round(depreciation * 100) / 100,
        residualValue: Math.round(residualValue * 100) / 100,
        acquisitionFee: acqFee,
        dispositionFee: dispFee
      });
    }
  };

  const resetCalculator = () => {
    setVehiclePrice('30000');
    setDownPayment('3000');
    setLeaseTerm('36');
    setInterestRate('4.5');
    setResidualPercent('60');
    setAcquisitionFee('595');
    setDispositionFee('395');
    setCurrency('USD');
    setShowBreakdown(false);
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Helmet>
        <title>Lease Calculator - Calculate Vehicle Lease Payments | DapsiWow</title>
        <meta name="description" content="Free lease calculator to calculate monthly lease payments for cars, trucks, and SUVs. Compare lease vs buy options with residual value estimation and money factor calculations. Support for multiple currencies worldwide." />
        <meta name="keywords" content="lease calculator, car lease calculator, vehicle lease calculator, monthly lease payment calculator, auto lease calculator, lease vs buy calculator, residual value calculator, money factor calculator, lease payment estimator, car leasing calculator" />
        <meta property="og:title" content="Lease Calculator - Calculate Vehicle Lease Payments | DapsiWow" />
        <meta property="og:description" content="Free lease calculator for cars, trucks, and SUVs with residual value and money factor calculations. Calculate accurate monthly lease payments instantly." />
        <meta property="og:type" content="website" />
        <meta name="robots" content="index, follow" />
        <meta name="author" content="DapsiWow" />
        <link rel="canonical" href="https://dapsiwow.com/tools/lease-calculator" />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            "name": "Lease Calculator",
            "description": "Free online lease calculator to calculate monthly lease payments and total lease costs for vehicles including cars, trucks, and SUVs. Features residual value calculations and lease vs buy analysis.",
            "url": "https://dapsiwow.com/tools/lease-calculator",
            "applicationCategory": "FinanceApplication",
            "operatingSystem": "Any",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "USD"
            },
            "featureList": [
              "Calculate lease payments for any vehicle",
              "Support for multiple currencies",
              "Residual value calculations",
              "Money factor conversions",
              "Lease vs buy comparison",
              "Depreciation cost analysis"
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
                <span className="text-sm font-medium text-blue-700">Professional Lease Calculator</span>
              </div>
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-slate-900 leading-tight">
                Smart Lease
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                  Calculator
                </span>
              </h1>
              <p className="text-xl sm:text-2xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
                Calculate monthly lease payments and total lease costs with advanced residual value analysis
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
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">Lease Configuration</h2>
                    <p className="text-gray-600">Enter your vehicle and lease details to get accurate payment calculations</p>
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

                    {/* Vehicle Price */}
                    <div className="space-y-3">
                      <Label htmlFor="vehicle-price" className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                        Vehicle Price (MSRP)
                      </Label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-lg">$</span>
                        <Input
                          id="vehicle-price"
                          type="number"
                          value={vehiclePrice}
                          onChange={(e) => setVehiclePrice(e.target.value)}
                          className="h-14 pl-8 text-lg border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-blue-500"
                          placeholder="30,000"
                          data-testid="input-vehicle-price"
                        />
                      </div>
                    </div>

                    {/* Down Payment */}
                    <div className="space-y-3">
                      <Label htmlFor="down-payment" className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                        Down Payment
                      </Label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-lg">$</span>
                        <Input
                          id="down-payment"
                          type="number"
                          value={downPayment}
                          onChange={(e) => setDownPayment(e.target.value)}
                          className="h-14 pl-8 text-lg border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-blue-500"
                          placeholder="3,000"
                          min="0"
                          data-testid="input-down-payment"
                        />
                      </div>
                    </div>

                    {/* Lease Term */}
                    <div className="space-y-3">
                      <Label className="text-sm font-semibold text-gray-800 uppercase tracking-wide">Lease Term</Label>
                      <Select value={leaseTerm} onValueChange={setLeaseTerm}>
                        <SelectTrigger className="h-14 border-2 border-gray-200 rounded-xl text-lg" data-testid="select-lease-term">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="24">24 months (2 years)</SelectItem>
                          <SelectItem value="36">36 months (3 years)</SelectItem>
                          <SelectItem value="48">48 months (4 years)</SelectItem>
                          <SelectItem value="60">60 months (5 years)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Interest Rate */}
                    <div className="space-y-3">
                      <Label htmlFor="interest-rate" className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                        Annual Interest Rate
                      </Label>
                      <div className="relative">
                        <Input
                          id="interest-rate"
                          type="number"
                          value={interestRate}
                          onChange={(e) => setInterestRate(e.target.value)}
                          className="h-14 pr-8 text-lg border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-blue-500"
                          placeholder="4.5"
                          step="0.01"
                          min="0"
                          data-testid="input-interest-rate"
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 text-lg">%</span>
                      </div>
                    </div>

                    {/* Residual Value */}
                    <div className="space-y-3">
                      <Label htmlFor="residual-percent" className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                        Residual Value (% of MSRP)
                      </Label>
                      <div className="relative">
                        <Input
                          id="residual-percent"
                          type="number"
                          value={residualPercent}
                          onChange={(e) => setResidualPercent(e.target.value)}
                          className="h-14 pr-8 text-lg border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-blue-500"
                          placeholder="60"
                          min="1"
                          max="100"
                          data-testid="input-residual-percent"
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 text-lg">%</span>
                      </div>
                    </div>
                  </div>

                  {/* Additional Fees */}
                  <div className="space-y-6 border-t pt-8">
                    <h3 className="text-xl font-bold text-gray-900">Additional Fees</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <Label htmlFor="acquisition-fee" className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                          Acquisition Fee
                        </Label>
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-lg">$</span>
                          <Input
                            id="acquisition-fee"
                            type="number"
                            value={acquisitionFee}
                            onChange={(e) => setAcquisitionFee(e.target.value)}
                            className="h-14 pl-8 text-lg border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-blue-500"
                            placeholder="595"
                            min="0"
                            data-testid="input-acquisition-fee"
                          />
                        </div>
                      </div>

                      <div className="space-y-3">
                        <Label htmlFor="disposition-fee" className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                          Disposition Fee
                        </Label>
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-lg">$</span>
                          <Input
                            id="disposition-fee"
                            type="number"
                            value={dispositionFee}
                            onChange={(e) => setDispositionFee(e.target.value)}
                            className="h-14 pl-8 text-lg border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-blue-500"
                            placeholder="395"
                            min="0"
                            data-testid="input-disposition-fee"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-4 pt-6">
                    <Button
                      onClick={calculateLease}
                      className="flex-1 h-14 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold text-lg rounded-xl shadow-lg transform transition-all duration-200 hover:scale-105"
                      data-testid="button-calculate"
                    >
                      Calculate Lease
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

                  {/* Advanced Options */}
                  {result && (
                    <div className="flex flex-wrap gap-3 pt-4">
                      <Button
                        onClick={() => setShowBreakdown(!showBreakdown)}
                        variant="outline"
                        size="sm"
                        className="rounded-full"
                        data-testid="button-show-breakdown"
                      >
                        {showBreakdown ? 'Hide' : 'Show'} Cost Breakdown
                      </Button>
                    </div>
                  )}
                </div>

                {/* Results Section */}
                <div className="bg-gradient-to-br from-gray-50 to-blue-50 p-8 lg:p-12">
                  <h2 className="text-2xl font-bold text-gray-900 mb-8">Results</h2>
                  
                  {result ? (
                    <div className="space-y-6" data-testid="lease-results">
                      {/* Monthly Payment Highlight */}
                      <div className="bg-white rounded-2xl p-6 shadow-lg border border-blue-100">
                        <div className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-2">Monthly Lease Payment</div>
                        <div className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600" data-testid="text-monthly-payment">
                          {formatCurrency(result.monthlyPayment)}
                        </div>
                      </div>

                      {/* Payment Breakdown */}
                      <div className="space-y-4">
                        <div className="bg-white rounded-xl p-4 shadow-sm">
                          <div className="flex justify-between items-center">
                            <span className="font-medium text-gray-700">Total Lease Cost</span>
                            <span className="font-bold text-gray-900" data-testid="text-total-amount">
                              {formatCurrency(result.totalAmount)}
                            </span>
                          </div>
                        </div>
                        <div className="bg-white rounded-xl p-4 shadow-sm">
                          <div className="flex justify-between items-center">
                            <span className="font-medium text-gray-700">Total Interest</span>
                            <span className="font-bold text-orange-600" data-testid="text-total-interest">
                              {formatCurrency(result.totalInterest)}
                            </span>
                          </div>
                        </div>
                        <div className="bg-white rounded-xl p-4 shadow-sm">
                          <div className="flex justify-between items-center">
                            <span className="font-medium text-gray-700">Depreciation Cost</span>
                            <span className="font-bold text-red-600" data-testid="text-depreciation">
                              {formatCurrency(result.depreciation)}
                            </span>
                          </div>
                        </div>
                        <div className="bg-white rounded-xl p-4 shadow-sm">
                          <div className="flex justify-between items-center">
                            <span className="font-medium text-gray-700">Residual Value</span>
                            <span className="font-bold text-green-600" data-testid="text-residual-value">
                              {formatCurrency(result.residualValue)}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Fees Breakdown */}
                      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
                        <h4 className="font-bold text-blue-800 mb-4 text-lg">Fees Summary</h4>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-blue-700 font-medium">Acquisition Fee:</span>
                            <span className="font-bold text-blue-800">
                              {formatCurrency(result.acquisitionFee)}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-blue-700 font-medium">Disposition Fee:</span>
                            <span className="font-bold text-blue-800">
                              {formatCurrency(result.dispositionFee)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-16" data-testid="no-results">
                      <div className="w-20 h-20 bg-gray-200 rounded-full mx-auto mb-6 flex items-center justify-center">
                        <div className="text-3xl font-bold text-gray-400">🚗</div>
                      </div>
                      <p className="text-gray-500 text-lg">Enter lease details and calculate to see payment results</p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Cost Breakdown Chart */}
          {result && showBreakdown && (
            <Card className="mt-8 bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Cost Breakdown Analysis</h3>
                <div className="space-y-6">
                  {/* Visual Breakdown */}
                  <div>
                    <div className="flex items-center mb-4">
                      <div
                        className="h-6 bg-blue-500 rounded-l"
                        style={{ width: `${(result.depreciation / result.totalAmount) * 100}%` }}
                      ></div>
                      <div
                        className="h-6 bg-red-400"
                        style={{ width: `${(result.totalInterest / result.totalAmount) * 100}%` }}
                      ></div>
                      <div
                        className="h-6 bg-gray-400 rounded-r"
                        style={{ width: `${((result.acquisitionFee + result.dispositionFee) / result.totalAmount) * 100}%` }}
                      ></div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div className="flex items-center">
                        <div className="w-4 h-4 bg-blue-500 rounded-full mr-3"></div>
                        <div>
                          <span className="font-medium">Depreciation</span>
                          <div className="text-gray-600">
                            {Math.round((result.depreciation / result.totalAmount) * 100)}% - {formatCurrency(result.depreciation)}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <div className="w-4 h-4 bg-red-400 rounded-full mr-3"></div>
                        <div>
                          <span className="font-medium">Interest</span>
                          <div className="text-gray-600">
                            {Math.round((result.totalInterest / result.totalAmount) * 100)}% - {formatCurrency(result.totalInterest)}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <div className="w-4 h-4 bg-gray-400 rounded-full mr-3"></div>
                        <div>
                          <span className="font-medium">Fees</span>
                          <div className="text-gray-600">
                            {Math.round(((result.acquisitionFee + result.dispositionFee) / result.totalAmount) * 100)}% - {formatCurrency(result.acquisitionFee + result.dispositionFee)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* SEO Content Section */}
          <div className="mt-16 grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">What is a Lease Calculator?</h3>
                <div className="space-y-4 text-gray-600">
                  <p>
                    A lease calculator is a powerful financial tool that helps you determine the monthly payment for 
                    leasing a vehicle, taking into account all essential factors including vehicle price, down payment, 
                    lease term, interest rate (money factor), residual value, and additional fees to provide accurate 
                    monthly payment estimates.
                  </p>
                  <p>
                    Our advanced lease calculator supports multiple currencies and provides detailed cost breakdowns, 
                    helping you understand exactly what you're paying for and compare different lease options effectively. 
                    Whether you're considering leasing a car, truck, or SUV, this tool ensures you make informed financial decisions.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">How Lease Payments Work</h3>
                <div className="space-y-4 text-gray-600">
                  <p>
                    Lease payments are calculated based on the vehicle's depreciation during the lease term, plus interest 
                    on both the depreciation and residual value. Unlike loan payments, you're only paying for the portion 
                    of the vehicle's value you're using during the lease period.
                  </p>
                  <ul className="space-y-2 list-disc list-inside">
                    <li>Depreciation cost: Vehicle price minus residual value</li>
                    <li>Money factor: Interest rate expressed as a decimal</li>
                    <li>Residual value: Vehicle's estimated value at lease end</li>
                    <li>Additional fees: Acquisition and disposition charges</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Benefits of Vehicle Leasing</h3>
                <div className="space-y-3 text-gray-600">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Lower monthly payments compared to financing</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Drive newer vehicles with latest technology</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Warranty coverage for most repairs</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Option to purchase at lease end</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Potential tax advantages for business use</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Lease vs Buy Considerations</h3>
                <div className="space-y-3 text-gray-600">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Consider total cost over time, not just monthly payment</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Evaluate mileage restrictions and wear charges</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Factor in insurance costs and gap coverage</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Assess your driving habits and lifestyle needs</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Compare with financing options for complete picture</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Additional SEO Content Sections */}
          <div className="mt-12 space-y-8">
            {/* Lease Terms Glossary */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-8">Essential Lease Terms Glossary</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="border-l-4 border-blue-500 pl-4">
                      <h4 className="font-semibold text-gray-800 mb-2">Capitalized Cost (Cap Cost)</h4>
                      <p className="text-sm text-gray-600">The agreed-upon value of the vehicle, similar to the purchase price in a sale transaction.</p>
                    </div>
                    <div className="border-l-4 border-green-500 pl-4">
                      <h4 className="font-semibold text-gray-800 mb-2">Residual Value</h4>
                      <p className="text-sm text-gray-600">The vehicle's estimated value at lease end, typically 50-70% of MSRP depending on the vehicle type.</p>
                    </div>
                    <div className="border-l-4 border-orange-500 pl-4">
                      <h4 className="font-semibold text-gray-800 mb-2">Money Factor</h4>
                      <p className="text-sm text-gray-600">The lease interest rate expressed as a decimal. Multiply by 2400 to convert to APR.</p>
                    </div>
                    <div className="border-l-4 border-purple-500 pl-4">
                      <h4 className="font-semibold text-gray-800 mb-2">Acquisition Fee</h4>
                      <p className="text-sm text-gray-600">Administrative fee charged by the leasing company to set up the lease, typically $300-$800.</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="border-l-4 border-red-500 pl-4">
                      <h4 className="font-semibold text-gray-800 mb-2">Disposition Fee</h4>
                      <p className="text-sm text-gray-600">Fee charged at lease end for vehicle inspection and remarketing, usually $300-$500.</p>
                    </div>
                    <div className="border-l-4 border-indigo-500 pl-4">
                      <h4 className="font-semibold text-gray-800 mb-2">Closed-End Lease</h4>
                      <p className="text-sm text-gray-600">Standard lease type where you return the vehicle and walk away, assuming normal wear and mileage limits.</p>
                    </div>
                    <div className="border-l-4 border-pink-500 pl-4">
                      <h4 className="font-semibold text-gray-800 mb-2">Gap Insurance</h4>
                      <p className="text-sm text-gray-600">Coverage that pays the difference between insurance settlement and remaining lease balance if vehicle is totaled.</p>
                    </div>
                    <div className="border-l-4 border-teal-500 pl-4">
                      <h4 className="font-semibold text-gray-800 mb-2">Wear and Tear</h4>
                      <p className="text-sm text-gray-600">Normal usage damage expected during lease term. Excessive wear may result in additional charges.</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Lease Strategies */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
                <CardContent className="p-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">Smart Leasing Strategies</h3>
                  <div className="space-y-4 text-gray-600">
                    <div className="bg-blue-50 rounded-lg p-4">
                      <h4 className="font-semibold text-blue-800 mb-2">Research Residual Values</h4>
                      <p className="text-sm text-blue-700">Choose vehicles with higher residual values to reduce depreciation costs and lower monthly payments.</p>
                    </div>
                    <div className="bg-green-50 rounded-lg p-4">
                      <h4 className="font-semibold text-green-800 mb-2">Negotiate the Cap Cost</h4>
                      <p className="text-sm text-green-700">The vehicle price is negotiable in a lease just like a purchase. Research fair market value before negotiating.</p>
                    </div>
                    <div className="bg-orange-50 rounded-lg p-4">
                      <h4 className="font-semibold text-orange-800 mb-2">Consider Multiple Security Deposits</h4>
                      <p className="text-sm text-orange-700">Some lessors allow multiple security deposits to reduce the money factor and lower monthly payments.</p>
                    </div>
                    <div className="bg-purple-50 rounded-lg p-4">
                      <h4 className="font-semibold text-purple-800 mb-2">Time Your Lease Right</h4>
                      <p className="text-sm text-purple-700">End of model years and manufacturer incentive periods often offer the best lease deals.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
                <CardContent className="p-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">Common Leasing Mistakes</h3>
                  <div className="space-y-4 text-gray-600">
                    <div className="bg-red-50 rounded-lg p-4">
                      <h4 className="font-semibold text-red-800 mb-2">Focusing Only on Monthly Payment</h4>
                      <p className="text-sm text-red-700">Consider total cost including down payment, fees, and end-of-lease charges for true comparison.</p>
                    </div>
                    <div className="bg-yellow-50 rounded-lg p-4">
                      <h4 className="font-semibold text-yellow-800 mb-2">Exceeding Mileage Allowance</h4>
                      <p className="text-sm text-yellow-700">Estimate your annual mileage accurately. Excess mileage charges can be $0.15-$0.30 per mile.</p>
                    </div>
                    <div className="bg-indigo-50 rounded-lg p-4">
                      <h4 className="font-semibold text-indigo-800 mb-2">Not Understanding Wear Guidelines</h4>
                      <p className="text-sm text-indigo-700">Review wear and tear guidelines carefully. Document vehicle condition at lease start and end.</p>
                    </div>
                    <div className="bg-pink-50 rounded-lg p-4">
                      <h4 className="font-semibold text-pink-800 mb-2">Insufficient Insurance Coverage</h4>
                      <p className="text-sm text-pink-700">Leased vehicles require comprehensive coverage and gap insurance to protect against total loss scenarios.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* FAQs Section */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-8">Frequently Asked Questions about Vehicle Leasing</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">Can I end my lease early?</h4>
                      <p className="text-gray-600 text-sm">Yes, but early termination typically involves penalties and fees that can be substantial. Consider lease transfer or buyout options first.</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">What happens if I damage the leased vehicle?</h4>
                      <p className="text-gray-600 text-sm">Normal wear is expected, but excessive damage will result in charges. Get repairs done before return or accept the charges at lease end.</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">Can I modify a leased vehicle?</h4>
                      <p className="text-gray-600 text-sm">Most modifications are prohibited and must be removed before return. Check your lease agreement for specific restrictions.</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">Is gap insurance necessary for leases?</h4>
                      <p className="text-gray-600 text-sm">Absolutely. Gap insurance covers the difference between insurance payout and remaining lease balance if the vehicle is totaled or stolen.</p>
                    </div>
                  </div>
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">Should I put money down on a lease?</h4>
                      <p className="text-gray-600 text-sm">Large down payments reduce monthly payments but increase risk if the vehicle is totaled early. Consider multiple security deposits instead.</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">Can I purchase my leased vehicle?</h4>
                      <p className="text-gray-600 text-sm">Most leases include a purchase option at the predetermined residual value, plus any applicable fees and taxes.</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">What's the best lease term length?</h4>
                      <p className="text-gray-600 text-sm">36 months is most common, balancing reasonable payments with warranty coverage. Longer terms may have higher money factors.</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">How is lease mileage calculated?</h4>
                      <p className="text-gray-600 text-sm">Annual mileage is divided by 12 for monthly allowance. Unused miles don't carry over, but excess miles incur per-mile charges.</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Vehicle Types and Leasing */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
                <CardContent className="p-8">
                  <h3 className="text-xl font-bold text-gray-900 mb-6">Luxury Vehicle Leasing</h3>
                  <div className="space-y-4 text-gray-600">
                    <p className="text-sm">
                      Luxury vehicles often have strong lease programs with competitive money factors and high residual values.
                    </p>
                    <div className="space-y-2">
                      <h4 className="font-semibold text-blue-800 text-sm">Advantages:</h4>
                      <ul className="text-xs space-y-1 list-disc list-inside text-blue-700">
                        <li>Access to premium features</li>
                        <li>Strong residual values</li>
                        <li>Comprehensive warranties</li>
                        <li>Manufacturer lease incentives</li>
                      </ul>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-semibold text-red-800 text-sm">Considerations:</h4>
                      <ul className="text-xs space-y-1 list-disc list-inside text-red-700">
                        <li>Higher insurance costs</li>
                        <li>Premium maintenance requirements</li>
                        <li>Stricter wear guidelines</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
                <CardContent className="p-8">
                  <h3 className="text-xl font-bold text-gray-900 mb-6">Electric Vehicle Leasing</h3>
                  <div className="space-y-4 text-gray-600">
                    <p className="text-sm">
                      EVs often make excellent lease candidates due to rapidly evolving technology and federal tax credits.
                    </p>
                    <div className="space-y-2">
                      <h4 className="font-semibold text-green-800 text-sm">Benefits:</h4>
                      <ul className="text-xs space-y-1 list-disc list-inside text-green-700">
                        <li>Federal tax credit passes through</li>
                        <li>Lower maintenance costs</li>
                        <li>Avoid technology obsolescence</li>
                        <li>Environmental benefits</li>
                      </ul>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-semibold text-orange-800 text-sm">Challenges:</h4>
                      <ul className="text-xs space-y-1 list-disc list-inside text-orange-700">
                        <li>Charging infrastructure needs</li>
                        <li>Range limitations for some uses</li>
                        <li>Uncertain residual values</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
                <CardContent className="p-8">
                  <h3 className="text-xl font-bold text-gray-900 mb-6">Truck and SUV Leasing</h3>
                  <div className="space-y-4 text-gray-600">
                    <p className="text-sm">
                      Popular trucks and SUVs often have strong lease programs, though payments may be higher due to popularity.
                    </p>
                    <div className="space-y-2">
                      <h4 className="font-semibold text-blue-800 text-sm">Strengths:</h4>
                      <ul className="text-xs space-y-1 list-disc list-inside text-blue-700">
                        <li>Strong market demand</li>
                        <li>Good residual values</li>
                        <li>Utility and versatility</li>
                        <li>Family-friendly features</li>
                      </ul>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-semibold text-red-800 text-sm">Drawbacks:</h4>
                      <ul className="text-xs space-y-1 list-disc list-inside text-red-700">
                        <li>Higher fuel costs</li>
                        <li>Premium pricing</li>
                        <li>Limited inventory at times</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* End of Lease Options */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">End of Lease Options and Decision Making</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="bg-blue-50 rounded-lg p-6 text-center">
                    <div className="w-12 h-12 bg-blue-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                      <span className="text-white font-bold text-lg">1</span>
                    </div>
                    <h4 className="font-semibold text-blue-800 mb-3">Return Vehicle</h4>
                    <p className="text-sm text-blue-700">
                      Simply return the vehicle and walk away. Pay any excess wear, mileage, or disposition fees.
                    </p>
                  </div>
                  <div className="bg-green-50 rounded-lg p-6 text-center">
                    <div className="w-12 h-12 bg-green-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                      <span className="text-white font-bold text-lg">2</span>
                    </div>
                    <h4 className="font-semibold text-green-800 mb-3">Purchase Vehicle</h4>
                    <p className="text-sm text-green-700">
                      Buy the vehicle at the predetermined residual value. Good option if market value exceeds residual.
                    </p>
                  </div>
                  <div className="bg-orange-50 rounded-lg p-6 text-center">
                    <div className="w-12 h-12 bg-orange-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                      <span className="text-white font-bold text-lg">3</span>
                    </div>
                    <h4 className="font-semibold text-orange-800 mb-3">Lease Extension</h4>
                    <p className="text-sm text-orange-700">
                      Extend the lease month-to-month while deciding on your next vehicle or waiting for new model availability.
                    </p>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-6 text-center">
                    <div className="w-12 h-12 bg-purple-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                      <span className="text-white font-bold text-lg">4</span>
                    </div>
                    <h4 className="font-semibold text-purple-800 mb-3">Trade for New Lease</h4>
                    <p className="text-sm text-purple-700">
                      Use any positive equity toward a new lease. Popular option for staying in newer vehicles continuously.
                    </p>
                  </div>
                </div>
                <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
                  <h4 className="font-semibold text-blue-800 mb-2">Decision Factors</h4>
                  <p className="text-blue-700 text-sm">
                    Compare the vehicle's current market value to the residual value, assess your satisfaction with the vehicle, 
                    and evaluate your changing needs. Our calculator helps you understand the financial implications of each option 
                    to make the best decision for your situation.
                  </p>
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
