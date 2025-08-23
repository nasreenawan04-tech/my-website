
import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { Calculator } from 'lucide-react';

interface LeaseResult {
  monthlyPayment: number;
  totalAmount: number;
  totalInterest: number;
  depreciation: number;
  residualValue: number;
  acquisitionFee: number;
  dispositionFee: number;
}

const LeaseCalculator = () => {
  const [vehiclePrice, setVehiclePrice] = useState('');
  const [downPayment, setDownPayment] = useState('');
  const [downPaymentPercent, setDownPaymentPercent] = useState('10');
  const [leaseTerm, setLeaseTerm] = useState('36');
  const [interestRate, setInterestRate] = useState('');
  const [residualPercent, setResidualPercent] = useState('60');
  const [acquisitionFee, setAcquisitionFee] = useState('595');
  const [dispositionFee, setDispositionFee] = useState('395');
  const [usePercentage, setUsePercentage] = useState(true);
  const [currency, setCurrency] = useState('USD');
  const [result, setResult] = useState<LeaseResult | null>(null);

  const calculateLease = () => {
    const price = parseFloat(vehiclePrice);
    const down = usePercentage 
      ? (price * parseFloat(downPaymentPercent)) / 100 
      : parseFloat(downPayment);
    const term = parseFloat(leaseTerm);
    const rate = parseFloat(interestRate) / 100 / 12; // Monthly interest rate
    const residualValue = (price * parseFloat(residualPercent)) / 100;
    const depreciation = price - residualValue;
    const acqFee = parseFloat(acquisitionFee) || 0;
    const dispFee = parseFloat(dispositionFee) || 0;

    if (price && term && rate >= 0) {
      // Lease payment calculation
      // Monthly depreciation + Monthly interest + Monthly fees
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
    setVehiclePrice('');
    setDownPayment('');
    setDownPaymentPercent('10');
    setLeaseTerm('36');
    setInterestRate('');
    setResidualPercent('60');
    setAcquisitionFee('595');
    setDispositionFee('395');
    setUsePercentage(true);
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

  return (
    <>
      <Helmet>
        <title>Lease Calculator - Calculate Monthly Car Lease Payments | ToolsHub</title>
        <meta name="description" content="Free lease calculator to calculate monthly lease payments, total cost, and lease terms. Compare leasing vs buying with accurate estimates." />
        <meta name="keywords" content="lease calculator, car lease calculator, monthly lease payment, auto lease calculator, vehicle lease, lease vs buy calculator" />
        <meta property="og:title" content="Lease Calculator - Calculate Monthly Car Lease Payments | ToolsHub" />
        <meta property="og:description" content="Free lease calculator to calculate monthly lease payments, total cost, and lease terms. Compare leasing vs buying with accurate estimates." />
        <meta property="og:type" content="website" />
        <meta name="robots" content="index, follow" />
        <meta name="author" content="ToolsHub" />
        <link rel="canonical" href="/tools/lease-calculator" />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            "name": "Lease Calculator",
            "description": "Free online lease calculator to calculate monthly lease payments and total lease costs for vehicles.",
            "url": "/tools/lease-calculator",
            "applicationCategory": "FinanceApplication",
            "operatingSystem": "Any",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "USD"
            }
          })}
        </script>
      </Helmet>

      <div className="min-h-screen flex flex-col" data-testid="page-lease-calculator">
        <Header />
        
        <main className="flex-1 bg-neutral-50">
          {/* Hero Section */}
          <section className="gradient-hero text-white py-16">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <div className="w-20 h-20 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <i className="fas fa-car text-3xl"></i>
              </div>
              <h1 className="text-4xl sm:text-5xl font-bold mb-6" data-testid="text-page-title">
                Lease Calculator
              </h1>
              <p className="text-xl text-blue-100 max-w-2xl mx-auto">
                Calculate monthly lease payments and total lease costs with support for multiple currencies worldwide
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
                      <h2 className="text-2xl font-semibold text-gray-900 mb-8">Lease Details</h2>
                      
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
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Vehicle Price */}
                      <div className="space-y-3">
                        <Label htmlFor="vehicle-price" className="text-sm font-medium text-gray-700">
                          Vehicle Price (MSRP)
                        </Label>
                        <Input
                          id="vehicle-price"
                          type="number"
                          value={vehiclePrice}
                          onChange={(e) => setVehiclePrice(e.target.value)}
                          className="h-12 text-base border-gray-200 rounded-lg"
                          placeholder="Enter vehicle price"
                          min="0"
                          step="0.01"
                          data-testid="input-vehicle-price"
                        />
                      </div>

                      {/* Down Payment */}
                      <div className="space-y-3">
                        <Label className="text-sm font-medium text-gray-700">Down Payment</Label>
                        <RadioGroup 
                          value={usePercentage ? "percentage" : "amount"} 
                          onValueChange={(value) => setUsePercentage(value === "percentage")}
                          className="flex gap-6"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="percentage" id="percentage" data-testid="radio-percentage" />
                            <Label htmlFor="percentage">Percentage</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="amount" id="amount" data-testid="radio-amount" />
                            <Label htmlFor="amount">Dollar Amount</Label>
                          </div>
                        </RadioGroup>
                        
                        {usePercentage ? (
                          <div className="relative">
                            <Input
                              type="number"
                              value={downPaymentPercent}
                              onChange={(e) => setDownPaymentPercent(e.target.value)}
                              className="h-12 text-base border-gray-200 rounded-lg pr-8"
                              placeholder="10"
                              min="0"
                              max="100"
                              step="0.1"
                              data-testid="input-down-payment-percent"
                            />
                            <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">%</span>
                          </div>
                        ) : (
                          <Input
                            type="number"
                            value={downPayment}
                            onChange={(e) => setDownPayment(e.target.value)}
                            className="h-12 text-base border-gray-200 rounded-lg"
                            placeholder="Enter down payment"
                            min="0"
                            step="0.01"
                            data-testid="input-down-payment-amount"
                          />
                        )}
                      </div>

                      {/* Lease Term */}
                      <div className="space-y-3">
                        <Label htmlFor="lease-term" className="text-sm font-medium text-gray-700">
                          Lease Term (Months)
                        </Label>
                        <Select value={leaseTerm} onValueChange={setLeaseTerm}>
                          <SelectTrigger className="h-12 border-gray-200 rounded-lg" data-testid="select-lease-term">
                            <SelectValue placeholder="Select lease term" />
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
                        <Label htmlFor="interest-rate" className="text-sm font-medium text-gray-700">
                          Annual Interest Rate (%) / Money Factor
                        </Label>
                        <Input
                          id="interest-rate"
                          type="number"
                          value={interestRate}
                          onChange={(e) => setInterestRate(e.target.value)}
                          className="h-12 text-base border-gray-200 rounded-lg"
                          placeholder="Enter interest rate"
                          min="0"
                          max="100"
                          step="0.01"
                          data-testid="input-interest-rate"
                        />
                      </div>

                      {/* Residual Value */}
                      <div className="space-y-3">
                        <Label htmlFor="residual-percent" className="text-sm font-medium text-gray-700">
                          Residual Value (% of MSRP)
                        </Label>
                        <div className="relative">
                          <Input
                            id="residual-percent"
                            type="number"
                            value={residualPercent}
                            onChange={(e) => setResidualPercent(e.target.value)}
                            className="h-12 text-base border-gray-200 rounded-lg pr-8"
                            placeholder="60"
                            min="0"
                            max="100"
                            step="1"
                            data-testid="input-residual-percent"
                          />
                          <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">%</span>
                        </div>
                      </div>

                      {/* Fees */}
                      <div className="border-t pt-6 space-y-4">
                        <h3 className="text-lg font-semibold mb-4">Additional Fees</h3>
                        
                        <div className="space-y-3">
                          <Label htmlFor="acquisition-fee" className="text-sm font-medium text-gray-700">
                            Acquisition Fee
                          </Label>
                          <Input
                            id="acquisition-fee"
                            type="number"
                            value={acquisitionFee}
                            onChange={(e) => setAcquisitionFee(e.target.value)}
                            className="h-12 text-base border-gray-200 rounded-lg"
                            placeholder="595"
                            min="0"
                            step="0.01"
                            data-testid="input-acquisition-fee"
                          />
                        </div>

                        <div className="space-y-3">
                          <Label htmlFor="disposition-fee" className="text-sm font-medium text-gray-700">
                            Disposition Fee (at lease end)
                          </Label>
                          <Input
                            id="disposition-fee"
                            type="number"
                            value={dispositionFee}
                            onChange={(e) => setDispositionFee(e.target.value)}
                            className="h-12 text-base border-gray-200 rounded-lg"
                            placeholder="395"
                            min="0"
                            step="0.01"
                            data-testid="input-disposition-fee"
                          />
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-4 pt-6">
                        <Button
                          onClick={calculateLease}
                          className="flex-1 h-12 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg"
                          data-testid="button-calculate"
                        >
                          <Calculator className="w-4 h-4 mr-2" />
                          Calculate
                        </Button>
                        <Button
                          onClick={resetCalculator}
                          variant="outline"
                          className="h-12 px-8 border-gray-200 text-gray-600 hover:bg-gray-50 font-medium rounded-lg"
                          data-testid="button-reset"
                        >
                          Reset
                        </Button>
                      </div>
                    </div>

                    {/* Results Section */}
                    <div className="bg-gray-50 rounded-xl p-8">
                      <h2 className="text-2xl font-semibold text-gray-900 mb-8">Lease Calculation Results</h2>
                      
                      {result ? (
                        <div className="space-y-4" data-testid="lease-results">
                          {/* Monthly Payment */}
                          <div className="bg-white rounded-lg p-4 border-l-4 border-green-500">
                            <div className="flex justify-between items-center">
                              <span className="font-semibold text-gray-700">Monthly Lease Payment</span>
                              <span className="text-2xl font-bold text-green-600" data-testid="text-monthly-payment">
                                {formatCurrency(result.monthlyPayment)}
                              </span>
                            </div>
                          </div>

                          {/* Lease Summary */}
                          <div className="space-y-3">
                            <div className="flex justify-between">
                              <span className="text-gray-600">Total Lease Cost</span>
                              <span className="font-semibold" data-testid="text-total-amount">
                                {formatCurrency(result.totalAmount)}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Total Interest Paid</span>
                              <span className="font-semibold text-red-600" data-testid="text-total-interest">
                                {formatCurrency(result.totalInterest)}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Depreciation Cost</span>
                              <span className="font-semibold" data-testid="text-depreciation">
                                {formatCurrency(result.depreciation)}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Residual Value</span>
                              <span className="font-semibold text-green-600" data-testid="text-residual-value">
                                {formatCurrency(result.residualValue)}
                              </span>
                            </div>
                          </div>

                          {/* Fees Breakdown */}
                          <div className="border-t pt-4 space-y-3">
                            <h3 className="font-semibold text-gray-900">Fees Breakdown</h3>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Acquisition Fee</span>
                              <span className="font-semibold" data-testid="text-acquisition-fee">
                                {formatCurrency(result.acquisitionFee)}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Disposition Fee</span>
                              <span className="font-semibold" data-testid="text-disposition-fee">
                                {formatCurrency(result.dispositionFee)}
                              </span>
                            </div>
                          </div>

                          {/* Visual Breakdown */}
                          <div className="mt-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-3">Cost Breakdown</h3>
                            <div className="space-y-2">
                              <div className="flex items-center">
                                <div 
                                  className="h-4 bg-blue-500 rounded-l"
                                  style={{ width: `${(result.depreciation / result.totalAmount) * 100}%` }}
                                ></div>
                                <div 
                                  className="h-4 bg-red-400"
                                  style={{ width: `${(result.totalInterest / result.totalAmount) * 100}%` }}
                                ></div>
                                <div 
                                  className="h-4 bg-gray-400 rounded-r"
                                  style={{ width: `${((result.acquisitionFee + result.dispositionFee) / result.totalAmount) * 100}%` }}
                                ></div>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span className="flex items-center">
                                  <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                                  Depreciation ({Math.round((result.depreciation / result.totalAmount) * 100)}%)
                                </span>
                                <span className="flex items-center">
                                  <div className="w-3 h-3 bg-red-400 rounded-full mr-2"></div>
                                  Interest ({Math.round((result.totalInterest / result.totalAmount) * 100)}%)
                                </span>
                                <span className="flex items-center">
                                  <div className="w-3 h-3 bg-gray-400 rounded-full mr-2"></div>
                                  Fees ({Math.round(((result.acquisitionFee + result.dispositionFee) / result.totalAmount) * 100)}%)
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-8" data-testid="no-results">
                          <i className="fas fa-car text-4xl text-gray-400 mb-4"></i>
                          <p className="text-gray-500">Enter lease details to calculate monthly payment</p>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Educational Content */}
              <div className="mt-12 space-y-8">
                {/* Understanding Lease Calculator */}
                <div className="bg-white rounded-2xl shadow-lg p-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-8">Complete Guide to Lease Calculator</h2>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-4">What is a Lease?</h3>
                      <p className="text-gray-600 mb-6 leading-relaxed">
                        A lease is a financing option that allows you to use a vehicle for a specific period while making monthly payments. 
                        Unlike buying, you don't own the vehicle but rather pay for its depreciation during the lease term. At the end of 
                        the lease, you can return the vehicle, purchase it for its residual value, or lease a new vehicle.
                      </p>
                      
                      <h3 className="text-xl font-semibold text-gray-900 mb-4">How Lease Payments Work</h3>
                      <p className="text-gray-600 mb-4">
                        Lease payments are calculated based on several factors:
                      </p>
                      <ul className="text-gray-600 space-y-2">
                        <li><strong>Depreciation:</strong> The difference between vehicle price and residual value</li>
                        <li><strong>Interest (Money Factor):</strong> The financing cost, similar to loan interest</li>
                        <li><strong>Fees:</strong> Acquisition fees, disposition fees, and other charges</li>
                        <li><strong>Down Payment:</strong> Upfront payment that reduces monthly payments</li>
                      </ul>
                    </div>
                    
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-4">Benefits of Leasing</h3>
                      <ul className="text-gray-600 space-y-3">
                        <li className="flex items-start">
                          <i className="fas fa-check-circle text-green-500 mt-1 mr-3"></i>
                          <span><strong>Lower Monthly Payments:</strong> Typically 20-40% lower than loan payments</span>
                        </li>
                        <li className="flex items-start">
                          <i className="fas fa-check-circle text-green-500 mt-1 mr-3"></i>
                          <span><strong>Latest Technology:</strong> Drive newer vehicles with latest features</span>
                        </li>
                        <li className="flex items-start">
                          <i className="fas fa-check-circle text-green-500 mt-1 mr-3"></i>
                          <span><strong>Warranty Coverage:</strong> Most repairs covered under manufacturer warranty</span>
                        </li>
                        <li className="flex items-start">
                          <i className="fas fa-check-circle text-green-500 mt-1 mr-3"></i>
                          <span><strong>No Resale Hassle:</strong> Simply return the vehicle at lease end</span>
                        </li>
                        <li className="flex items-start">
                          <i className="fas fa-check-circle text-green-500 mt-1 mr-3"></i>
                          <span><strong>Tax Benefits:</strong> Potential business tax deductions for commercial use</span>
                        </li>
                      </ul>

                      <h3 className="text-xl font-semibold text-gray-900 mb-4 mt-6">Lease vs Buy Considerations</h3>
                      <ul className="text-gray-600 space-y-2">
                        <li>• Mileage restrictions typically apply (10,000-15,000 miles/year)</li>
                        <li>• Wear and tear charges for excessive damage</li>
                        <li>• No equity building compared to purchasing</li>
                        <li>• Early termination fees can be substantial</li>
                        <li>• Gap insurance recommended for protection</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Lease Terms Explained */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Key Lease Terms Explained</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="bg-white rounded-lg p-6 shadow-sm">
                      <i className="fas fa-dollar-sign text-2xl text-blue-600 mb-4"></i>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Capitalized Cost</h3>
                      <p className="text-gray-600 text-sm">
                        The agreed-upon value of the vehicle, similar to the purchase price. This includes the 
                        vehicle price plus any additional items like extended warranties.
                      </p>
                    </div>
                    
                    <div className="bg-white rounded-lg p-6 shadow-sm">
                      <i className="fas fa-chart-line text-2xl text-green-600 mb-4"></i>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Residual Value</h3>
                      <p className="text-gray-600 text-sm">
                        The vehicle's estimated value at the end of the lease term. Higher residual 
                        values result in lower monthly payments.
                      </p>
                    </div>
                    
                    <div className="bg-white rounded-lg p-6 shadow-sm">
                      <i className="fas fa-percentage text-2xl text-purple-600 mb-4"></i>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Money Factor</h3>
                      <p className="text-gray-600 text-sm">
                        The interest rate for your lease, expressed as a decimal. Multiply by 2400 
                        to convert to an annual percentage rate (APR).
                      </p>
                    </div>
                    
                    <div className="bg-white rounded-lg p-6 shadow-sm">
                      <i className="fas fa-road text-2xl text-orange-600 mb-4"></i>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Mileage Allowance</h3>
                      <p className="text-gray-600 text-sm">
                        The maximum number of miles you can drive per year without penalty. 
                        Exceeding this results in excess mileage charges.
                      </p>
                    </div>
                    
                    <div className="bg-white rounded-lg p-6 shadow-sm">
                      <i className="fas fa-file-invoice text-2xl text-teal-600 mb-4"></i>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Acquisition Fee</h3>
                      <p className="text-gray-600 text-sm">
                        An upfront fee charged by the leasing company to process the lease. 
                        This is usually paid at lease signing.
                      </p>
                    </div>
                    
                    <div className="bg-white rounded-lg p-6 shadow-sm">
                      <i className="fas fa-handshake text-2xl text-red-600 mb-4"></i>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Disposition Fee</h3>
                      <p className="text-gray-600 text-sm">
                        A fee charged at the end of the lease to cover the cost of preparing 
                        the vehicle for resale (if you don't purchase it).
                      </p>
                    </div>
                  </div>
                </div>

                {/* Tips for Smart Leasing */}
                <div className="bg-white rounded-2xl shadow-lg p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Smart Leasing Tips & Best Practices</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                        <i className="fas fa-lightbulb text-yellow-500 mr-2"></i>
                        Money-Saving Tips
                      </h3>
                      <ul className="space-y-3">
                        <li className="flex items-start space-x-2">
                          <i className="fas fa-arrow-right text-blue-600 mt-1 text-sm"></i>
                          <span className="text-gray-700">Negotiate the capitalized cost, not just the monthly payment</span>
                        </li>
                        <li className="flex items-start space-x-2">
                          <i className="fas fa-arrow-right text-blue-600 mt-1 text-sm"></i>
                          <span className="text-gray-700">Consider multiple down payment scenarios to optimize cash flow</span>
                        </li>
                        <li className="flex items-start space-x-2">
                          <i className="fas fa-arrow-right text-blue-600 mt-1 text-sm"></i>
                          <span className="text-gray-700">Look for manufacturer lease specials and incentives</span>
                        </li>
                        <li className="flex items-start space-x-2">
                          <i className="fas fa-arrow-right text-blue-600 mt-1 text-sm"></i>
                          <span className="text-gray-700">Choose appropriate mileage allowance to avoid overage fees</span>
                        </li>
                      </ul>
                    </div>
                    
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                        <i className="fas fa-exclamation-triangle text-orange-500 mr-2"></i>
                        Important Considerations
                      </h3>
                      <ul className="space-y-3">
                        <li className="flex items-start space-x-2">
                          <i className="fas fa-arrow-right text-orange-600 mt-1 text-sm"></i>
                          <span className="text-gray-700">Get gap insurance to cover the difference between loan and vehicle value</span>
                        </li>
                        <li className="flex items-start space-x-2">
                          <i className="fas fa-arrow-right text-orange-600 mt-1 text-sm"></i>
                          <span className="text-gray-700">Understand wear and tear guidelines to avoid end-of-lease charges</span>
                        </li>
                        <li className="flex items-start space-x-2">
                          <i className="fas fa-arrow-right text-orange-600 mt-1 text-sm"></i>
                          <span className="text-gray-700">Consider the total cost over time if you always lease</span>
                        </li>
                        <li className="flex items-start space-x-2">
                          <i className="fas fa-arrow-right text-orange-600 mt-1 text-sm"></i>
                          <span className="text-gray-700">Plan for end-of-lease options: return, purchase, or extend</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* FAQ Section */}
                <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-2xl p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Frequently Asked Questions</h2>
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Is it better to lease or buy a car?</h3>
                      <p className="text-gray-600">
                        It depends on your situation. Leasing offers lower monthly payments and the ability to drive newer cars, 
                        while buying builds equity and has no mileage restrictions. Consider your driving habits, financial goals, 
                        and how long you typically keep vehicles.
                      </p>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">What happens if I exceed the mileage limit?</h3>
                      <p className="text-gray-600">
                        You'll pay excess mileage charges, typically 15-25 cents per mile over the limit. It's important to 
                        estimate your annual driving accurately when choosing a mileage allowance.
                      </p>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Can I end my lease early?</h3>
                      <p className="text-gray-600">
                        Yes, but early termination usually involves substantial fees. These can include remaining payments, 
                        early termination fees, and the difference between the car's current value and remaining lease balance.
                      </p>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">What is considered normal wear and tear?</h3>
                      <p className="text-gray-600">
                        Normal wear includes minor scratches, small dents, tire wear consistent with mileage, and interior wear 
                        from regular use. Excessive damage like large dents, significant scratches, or mechanical issues may 
                        result in charges.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Currency Information */}
              <div className="mt-8 bg-blue-50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  <i className="fas fa-globe mr-2"></i>
                  Worldwide Currency Support
                </h3>
                <p className="text-gray-600">
                  This lease calculator supports major global currencies including USD, EUR, GBP, INR, JPY, CAD, AUD, CNY, BRL, and MXN. 
                  The calculations remain accurate regardless of the currency selected, making it perfect for international users 
                  considering vehicle leasing options worldwide.
                </p>
              </div>
            </div>
          </section>
        </main>
        
        <Footer />
      </div>
    </>
  );
};

export default LeaseCalculator;
