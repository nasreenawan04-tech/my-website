
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
                {/* What is a Lease Calculator Section */}
                <div className="bg-white rounded-2xl shadow-lg p-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-8">What is a Lease Calculator and How Does It Work?</h2>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-4">Understanding Vehicle Lease Calculations</h3>
                      <p className="text-gray-600 mb-6 leading-relaxed">
                        A lease calculator is a powerful financial tool that helps you determine the monthly payment for leasing a vehicle, 
                        equipment, or property. Our advanced lease payment calculator takes into account all the essential factors including 
                        vehicle price, down payment, lease term, interest rate (money factor), residual value, and additional fees to provide 
                        accurate monthly payment estimates.
                      </p>
                      
                      <h3 className="text-xl font-semibold text-gray-900 mb-4">How Our Lease Calculator Works</h3>
                      <p className="text-gray-600 mb-4">
                        The lease payment calculation involves several key components that work together:
                      </p>
                      <ul className="text-gray-600 space-y-2">
                        <li><strong>Capitalized Cost:</strong> The agreed-upon value of the vehicle (similar to purchase price)</li>
                        <li><strong>Residual Value:</strong> The vehicle's estimated value at lease end (typically 50-70% of MSRP)</li>
                        <li><strong>Money Factor:</strong> The interest rate expressed as a decimal (multiply by 2400 for APR)</li>
                        <li><strong>Depreciation Cost:</strong> The difference between capitalized cost and residual value</li>
                        <li><strong>Finance Charge:</strong> Interest calculated on both the depreciation and residual value</li>
                        <li><strong>Additional Fees:</strong> Acquisition fees, disposition fees, and other charges</li>
                      </ul>
                    </div>
                    
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-4">Benefits of Using a Lease Calculator</h3>
                      <ul className="text-gray-600 space-y-3">
                        <li className="flex items-start">
                          <i className="fas fa-calculator text-blue-500 mt-1 mr-3"></i>
                          <span><strong>Accurate Payment Estimates:</strong> Get precise monthly payment calculations before visiting dealerships</span>
                        </li>
                        <li className="flex items-start">
                          <i className="fas fa-chart-line text-green-500 mt-1 mr-3"></i>
                          <span><strong>Compare Different Scenarios:</strong> Test various down payments, terms, and interest rates</span>
                        </li>
                        <li className="flex items-start">
                          <i className="fas fa-money-bill-wave text-purple-500 mt-1 mr-3"></i>
                          <span><strong>Budget Planning:</strong> Plan your monthly budget with confidence knowing exact costs</span>
                        </li>
                        <li className="flex items-start">
                          <i className="fas fa-handshake text-orange-500 mt-1 mr-3"></i>
                          <span><strong>Negotiation Power:</strong> Understand lease terms better to negotiate effectively</span>
                        </li>
                        <li className="flex items-start">
                          <i className="fas fa-globe text-teal-500 mt-1 mr-3"></i>
                          <span><strong>Multi-Currency Support:</strong> Calculate payments in your local currency (USD, EUR, GBP, and more)</span>
                        </li>
                      </ul>

                      <h3 className="text-xl font-semibold text-gray-900 mb-4 mt-6">Lease vs Purchase Analysis</h3>
                      <p className="text-gray-600 mb-4">
                        Use our lease calculator alongside our <a href="/tools/car-loan-calculator" className="text-blue-600 hover:text-blue-800 hover:underline font-semibold">Car Loan Calculator</a> 
                        to compare leasing versus buying options. Consider factors like:
                      </p>
                      <ul className="text-gray-600 space-y-2">
                        <li>• Monthly payment differences (lease typically 20-40% lower)</li>
                        <li>• Total cost of ownership over time</li>
                        <li>• Mileage restrictions and wear-and-tear considerations</li>
                        <li>• Equity building vs. continuous payments</li>
                        <li>• Tax implications for personal and business use</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Audience-Specific Benefits Section */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-8">Who Benefits from Using Our Lease Calculator?</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Students */}
                    <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                        <i className="fas fa-graduation-cap text-blue-600 text-xl"></i>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Students & Recent Graduates</h3>
                      <ul className="text-gray-600 space-y-2 text-sm">
                        <li>• Access reliable transportation with lower monthly payments</li>
                        <li>• Build credit history with manageable payments</li>
                        <li>• No long-term commitment perfect for transitional life phases</li>
                        <li>• Latest safety features and technology</li>
                        <li>• Plan alongside <a href="/tools/education-loan-calculator" className="text-blue-600 hover:text-blue-700 underline">education loan payments</a></li>
                      </ul>
                      <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                        <p className="text-xs text-blue-700">
                          <strong>Tip:</strong> Use our <a href="/tools/budget-calculator" className="underline">Budget Calculator</a> to ensure lease payments fit your student budget.
                        </p>
                      </div>
                    </div>

                    {/* Young Professionals */}
                    <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
                      <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                        <i className="fas fa-briefcase text-green-600 text-xl"></i>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Young Professionals</h3>
                      <ul className="text-gray-600 space-y-2 text-sm">
                        <li>• Drive impressive vehicles for client meetings</li>
                        <li>• Lower monthly payments preserve cash flow</li>
                        <li>• Always under warranty - minimal repair costs</li>
                        <li>• Option to upgrade every 2-4 years</li>
                        <li>• Coordinate with <a href="/tools/salary-to-hourly-calculator" className="text-green-600 hover:text-green-700 underline">salary planning tools</a></li>
                      </ul>
                      <div className="mt-4 p-3 bg-green-50 rounded-lg">
                        <p className="text-xs text-green-700">
                          <strong>Career Growth:</strong> Plan lease payments as you advance professionally with our <a href="/tools/compound-interest-calculator" className="underline">savings calculators</a>.
                        </p>
                      </div>
                    </div>

                    {/* Families */}
                    <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
                      <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                        <i className="fas fa-home text-purple-600 text-xl"></i>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Growing Families</h3>
                      <ul className="text-gray-600 space-y-2 text-sm">
                        <li>• Access larger vehicles (SUVs, minivans) affordably</li>
                        <li>• Latest safety technology for family protection</li>
                        <li>• Predictable monthly expenses for family budgeting</li>
                        <li>• No depreciation worries when needs change</li>
                        <li>• Balance with <a href="/tools/mortgage-calculator" className="text-purple-600 hover:text-purple-700 underline">home mortgage payments</a></li>
                      </ul>
                      <div className="mt-4 p-3 bg-purple-50 rounded-lg">
                        <p className="text-xs text-purple-700">
                          <strong>Family Planning:</strong> Use our <a href="/tools/savings-goal-calculator" className="underline">savings goal tools</a> to plan for education and family expenses.
                        </p>
                      </div>
                    </div>

                    {/* Business Owners */}
                    <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
                      <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                        <i className="fas fa-building text-orange-600 text-xl"></i>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Business Owners & Entrepreneurs</h3>
                      <ul className="text-gray-600 space-y-2 text-sm">
                        <li>• Significant tax advantages and deductions</li>
                        <li>• Preserve capital for business investments</li>
                        <li>• Fleet management with predictable costs</li>
                        <li>• Professional image with latest models</li>
                        <li>• Coordinate with <a href="/tools/business-loan-calculator" className="text-orange-600 hover:text-orange-700 underline">business loan planning</a></li>
                      </ul>
                      <div className="mt-4 p-3 bg-orange-50 rounded-lg">
                        <p className="text-xs text-orange-700">
                          <strong>Business Growth:</strong> Plan vehicle expenses alongside <a href="/tools/roi-calculator" className="underline">ROI calculations</a> and <a href="/tools/break-even-calculator" className="underline">break-even analysis</a>.
                        </p>
                      </div>
                    </div>

                    {/* Retirees */}
                    <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
                      <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center mb-4">
                        <i className="fas fa-umbrella-beach text-teal-600 text-xl"></i>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Retirees & Seniors</h3>
                      <ul className="text-gray-600 space-y-2 text-sm">
                        <li>• Lower monthly payments preserve retirement savings</li>
                        <li>• Access to latest safety and accessibility features</li>
                        <li>• No long-term vehicle ownership responsibilities</li>
                        <li>• Warranty coverage reduces unexpected expenses</li>
                        <li>• Plan with <a href="/tools/retirement-calculator" className="text-teal-600 hover:text-teal-700 underline">retirement planning tools</a></li>
                      </ul>
                      <div className="mt-4 p-3 bg-teal-50 rounded-lg">
                        <p className="text-xs text-teal-700">
                          <strong>Fixed Income:</strong> Coordinate lease payments with <a href="/tools/compound-interest-calculator" className="underline">retirement savings</a> and <a href="/tools/investment-return-calculator" className="underline">investment income</a>.
                        </p>
                      </div>
                    </div>

                    {/* High-Income Professionals */}
                    <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
                      <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                        <i className="fas fa-user-tie text-red-600 text-xl"></i>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">High-Income Professionals</h3>
                      <ul className="text-gray-600 space-y-2 text-sm">
                        <li>• Drive luxury vehicles without large capital outlay</li>
                        <li>• Tax advantages for business use vehicles</li>
                        <li>• Always drive latest models with cutting-edge tech</li>
                        <li>• Flexibility to change vehicles as needs evolve</li>
                        <li>• Integrate with <a href="/tools/investment-return-calculator" className="text-red-600 hover:text-red-700 underline">investment strategies</a></li>
                      </ul>
                      <div className="mt-4 p-3 bg-red-50 rounded-lg">
                        <p className="text-xs text-red-700">
                          <strong>Wealth Building:</strong> Optimize lease payments alongside <a href="/tools/net-worth-calculator" className="underline">net worth tracking</a> and <a href="/tools/stock-profit-calculator" className="underline">investment planning</a>.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Complete Guide to Lease Calculator */}
                <div className="bg-white rounded-2xl shadow-lg p-8">

                {/* Comprehensive Lease Terms Dictionary */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Essential Lease Terms Every Car Shopper Should Know</h2>
                  <p className="text-gray-600 mb-8">Master these key lease terminology to make informed decisions and negotiate better deals:</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
                      <i className="fas fa-dollar-sign text-2xl text-blue-600 mb-4"></i>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Capitalized Cost (Cap Cost)</h3>
                      <p className="text-gray-600 text-sm mb-3">
                        The negotiated selling price of the vehicle including any additional options, warranties, or services. 
                        This is equivalent to the purchase price when buying.
                      </p>
                      <div className="text-xs text-blue-600 bg-blue-50 p-2 rounded">
                        <strong>Negotiation Tip:</strong> Always negotiate the cap cost, not just monthly payments
                      </div>
                    </div>
                    
                    <div className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
                      <i className="fas fa-chart-line text-2xl text-green-600 mb-4"></i>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Residual Value</h3>
                      <p className="text-gray-600 text-sm mb-3">
                        The vehicle's predicted worth at lease end, typically 45-65% of MSRP. Higher residual values 
                        mean lower monthly payments and better lease deals.
                      </p>
                      <div className="text-xs text-green-600 bg-green-50 p-2 rounded">
                        <strong>Smart Shopping:</strong> Compare residual values across similar vehicles
                      </div>
                    </div>
                    
                    <div className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
                      <i className="fas fa-percentage text-2xl text-purple-600 mb-4"></i>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Money Factor (MF)</h3>
                      <p className="text-gray-600 text-sm mb-3">
                        The lease interest rate expressed as a decimal (usually 0.001-0.005). Multiply by 2,400 
                        to get the equivalent APR for comparison with loan rates.
                      </p>
                      <div className="text-xs text-purple-600 bg-purple-50 p-2 rounded">
                        <strong>Rate Check:</strong> Compare with current <a href="/tools/car-loan-calculator" className="underline">auto loan rates</a>
                      </div>
                    </div>
                    
                    <div className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
                      <i className="fas fa-road text-2xl text-orange-600 mb-4"></i>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Mileage Allowance</h3>
                      <p className="text-gray-600 text-sm mb-3">
                        Annual mileage limit (typically 10,000-15,000 miles). Excess miles cost $0.15-$0.30 per mile. 
                        Choose allowance based on your actual driving patterns.
                      </p>
                      <div className="text-xs text-orange-600 bg-orange-50 p-2 rounded">
                        <strong>Calculate:</strong> Track current mileage for 3-6 months to estimate needs
                      </div>
                    </div>
                    
                    <div className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
                      <i className="fas fa-file-invoice text-2xl text-teal-600 mb-4"></i>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Acquisition Fee</h3>
                      <p className="text-gray-600 text-sm mb-3">
                        Upfront administrative fee ($300-$1,000) for processing the lease. Some dealers may 
                        waive or reduce this fee as part of negotiations.
                      </p>
                      <div className="text-xs text-teal-600 bg-teal-50 p-2 rounded">
                        <strong>Budget Tip:</strong> Factor into your <a href="/tools/loan-calculator" className="underline">total financing costs</a>
                      </div>
                    </div>
                    
                    <div className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
                      <i className="fas fa-handshake text-2xl text-red-600 mb-4"></i>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Disposition Fee</h3>
                      <p className="text-gray-600 text-sm mb-3">
                        End-of-lease fee ($300-$500) for vehicle inspection and prep for resale. Waived if you 
                        purchase the vehicle or lease another from the same brand.
                      </p>
                      <div className="text-xs text-red-600 bg-red-50 p-2 rounded">
                        <strong>Plan Ahead:</strong> Consider end-of-lease options early in the term
                      </div>
                    </div>

                    <div className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
                      <i className="fas fa-shield-alt text-2xl text-indigo-600 mb-4"></i>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Gap Insurance</h3>
                      <p className="text-gray-600 text-sm mb-3">
                        Coverage for the difference between vehicle value and lease balance if totaled. Often 
                        included in leases but verify coverage before signing.
                      </p>
                      <div className="text-xs text-indigo-600 bg-indigo-50 p-2 rounded">
                        <strong>Protection:</strong> Essential coverage for peace of mind
                      </div>
                    </div>

                    <div className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
                      <i className="fas fa-tools text-2xl text-yellow-600 mb-4"></i>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Wear and Tear</h3>
                      <p className="text-gray-600 text-sm mb-3">
                        Normal usage is expected, but excessive damage incurs charges. Review lease wear-and-tear 
                        guidelines before signing and at lease return.
                      </p>
                      <div className="text-xs text-yellow-600 bg-yellow-50 p-2 rounded">
                        <strong>Maintenance:</strong> Keep detailed maintenance records
                      </div>
                    </div>

                    <div className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
                      <i className="fas fa-calculator text-2xl text-pink-600 mb-4"></i>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Lease Factor</h3>
                      <p className="text-gray-600 text-sm mb-3">
                        Alternative term for money factor. Some dealers quote this instead of APR to make 
                        interest rates less obvious for comparison shopping.
                      </p>
                      <div className="text-xs text-pink-600 bg-pink-50 p-2 rounded">
                        <strong>Compare:</strong> Always convert to APR using our calculator
                      </div>
                    </div>
                  </div>
                </div>

                {/* Expert Smart Leasing Tips */}
                <div className="bg-white rounded-2xl shadow-lg p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Expert Smart Leasing Tips & Best Practices</h2>
                  <p className="text-gray-600 mb-8">
                    Master these proven strategies used by automotive experts and financial advisors to get the best lease deals 
                    and avoid common pitfalls that cost thousands of dollars.
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                        <i className="fas fa-lightbulb text-yellow-500 mr-2"></i>
                        Money-Saving Strategies
                      </h3>
                      <ul className="space-y-3">
                        <li className="flex items-start space-x-2">
                          <i className="fas fa-arrow-right text-blue-600 mt-1 text-sm"></i>
                          <span className="text-gray-700"><strong>Negotiate Total Price First:</strong> Focus on the capitalized cost, not monthly payment. Use our calculator to verify dealer math.</span>
                        </li>
                        <li className="flex items-start space-x-2">
                          <i className="fas fa-arrow-right text-blue-600 mt-1 text-sm"></i>
                          <span className="text-gray-700"><strong>Optimize Down Payment:</strong> Test different scenarios with our <a href="/tools/compound-interest-calculator" className="text-blue-600 hover:text-blue-700 underline">compound interest calculator</a> to see if investing the cash yields better returns.</span>
                        </li>
                        <li className="flex items-start space-x-2">
                          <i className="fas fa-arrow-right text-blue-600 mt-1 text-sm"></i>
                          <span className="text-gray-700"><strong>Time Your Lease:</strong> Best deals often appear at model year-end (September-November) and month-end when dealers meet quotas.</span>
                        </li>
                        <li className="flex items-start space-x-2">
                          <i className="fas fa-arrow-right text-blue-600 mt-1 text-sm"></i>
                          <span className="text-gray-700"><strong>Shop Manufacturer Incentives:</strong> Look for lease cash, loyalty programs, and conquest incentives that can reduce your cap cost.</span>
                        </li>
                        <li className="flex items-start space-x-2">
                          <i className="fas fa-arrow-right text-blue-600 mt-1 text-sm"></i>
                          <span className="text-gray-700"><strong>Consider Multiple Deal Structures:</strong> Compare single-pay leases, traditional leases, and purchase options using our <a href="/tools/loan-calculator" className="text-blue-600 hover:text-blue-700 underline">loan calculator</a>.</span>
                        </li>
                      </ul>
                    </div>
                    
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                        <i className="fas fa-shield-alt text-green-500 mr-2"></i>
                        Risk Management
                      </h3>
                      <ul className="space-y-3">
                        <li className="flex items-start space-x-2">
                          <i className="fas fa-arrow-right text-green-600 mt-1 text-sm"></i>
                          <span className="text-gray-700"><strong>Gap Insurance is Essential:</strong> Protects against total loss scenarios where insurance payout is less than lease balance.</span>
                        </li>
                        <li className="flex items-start space-x-2">
                          <i className="fas fa-arrow-right text-green-600 mt-1 text-sm"></i>
                          <span className="text-gray-700"><strong>Accurate Mileage Estimation:</strong> Track your driving for 2-3 months. Excess mileage fees ($0.15-$0.30/mile) add up quickly.</span>
                        </li>
                        <li className="flex items-start space-x-2">
                          <i className="fas fa-arrow-right text-green-600 mt-1 text-sm"></i>
                          <span className="text-gray-700"><strong>Understand Wear Guidelines:</strong> Review manufacturer wear-and-tear standards. Small dings and minor scratches are typically acceptable.</span>
                        </li>
                        <li className="flex items-start space-x-2">
                          <i className="fas fa-arrow-right text-green-600 mt-1 text-sm"></i>
                          <span className="text-gray-700"><strong>Document Vehicle Condition:</strong> Take photos at lease signing and periodically throughout the term for protection.</span>
                        </li>
                        <li className="flex items-start space-x-2">
                          <i className="fas fa-arrow-right text-green-600 mt-1 text-sm"></i>
                          <span className="text-gray-700"><strong>Plan Exit Strategy Early:</strong> Know your options 6 months before lease end: return, purchase, or extend.</span>
                        </li>
                      </ul>
                    </div>
                    
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                        <i className="fas fa-exclamation-triangle text-orange-500 mr-2"></i>
                        Common Pitfalls to Avoid
                      </h3>
                      <ul className="space-y-3">
                        <li className="flex items-start space-x-2">
                          <i className="fas fa-arrow-right text-orange-600 mt-1 text-sm"></i>
                          <span className="text-gray-700"><strong>Avoid "Payment Packing":</strong> Dealers may inflate payments with unnecessary add-ons. Verify each line item in your lease agreement.</span>
                        </li>
                        <li className="flex items-start space-x-2">
                          <i className="fas fa-arrow-right text-orange-600 mt-1 text-sm"></i>
                          <span className="text-gray-700"><strong>Don't Ignore Total Cost:</strong> Consider the full financial picture using our <a href="/tools/net-worth-calculator" className="text-orange-600 hover:text-orange-700 underline">net worth calculator</a> to understand impact.</span>
                        </li>
                        <li className="flex items-start space-x-2">
                          <i className="fas fa-arrow-right text-orange-600 mt-1 text-sm"></i>
                          <span className="text-gray-700"><strong>Early Termination is Expensive:</strong> Can cost thousands in fees and remaining payments. Avoid if possible.</span>
                        </li>
                        <li className="flex items-start space-x-2">
                          <i className="fas fa-arrow-right text-orange-600 mt-1 text-sm"></i>
                          <span className="text-gray-700"><strong>Beware of Lease Transfer Risks:</strong> Assuming someone else's lease can hide problems. Inspect thoroughly and understand all terms.</span>
                        </li>
                        <li className="flex items-start space-x-2">
                          <i className="fas fa-arrow-right text-orange-600 mt-1 text-sm"></i>
                          <span className="text-gray-700"><strong>Multiple Security Deposits:</strong> May lower money factor but ties up cash. Calculate opportunity cost with our investment tools.</span>
                        </li>
                      </ul>
                    </div>
                  </div>

                  {/* Advanced Leasing Strategies */}
                  <div className="mt-8 border-t pt-8">
                    <h3 className="text-xl font-semibold text-gray-900 mb-6">Advanced Leasing Strategies for Maximum Value</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-blue-50 p-6 rounded-lg">
                        <h4 className="font-semibold text-gray-900 mb-3">Business Leasing Advantages</h4>
                        <ul className="text-gray-600 space-y-2 text-sm">
                          <li>• Tax deductions for business use (Section 179)</li>
                          <li>• Potential 100% deduction for vehicles over 6,000 lbs GVWR</li>
                          <li>• Fleet management with predictable costs</li>
                          <li>• Professional image enhancement</li>
                          <li>• Use our <a href="/tools/business-loan-calculator" className="text-blue-600 hover:text-blue-700 underline">business loan calculator</a> to compare financing options</li>
                        </ul>
                      </div>
                      
                      <div className="bg-green-50 p-6 rounded-lg">
                        <h4 className="font-semibold text-gray-900 mb-3">Lease-End Options Strategy</h4>
                        <ul className="text-gray-600 space-y-2 text-sm">
                          <li>• Purchase if market value exceeds residual value</li>
                          <li>• Return if depreciation exceeded expectations</li>
                          <li>• Extend month-to-month for flexibility</li>
                          <li>• Trade for immediate lease of new vehicle</li>
                          <li>• Calculate decisions with our <a href="/tools/investment-return-calculator" className="text-green-600 hover:text-green-700 underline">return calculator</a></li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Related Financial Planning Tools */}
                <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-2xl p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Complete Your Financial Planning with Related Tools</h2>
                  <p className="text-gray-600 mb-8">
                    Make informed leasing decisions by combining our lease calculator with these powerful financial planning tools 
                    for comprehensive analysis of your automotive financing options.
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {/* Financing Comparison Tools */}
                    <div className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                        <i className="fas fa-car text-blue-600 text-xl"></i>
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-3">Car Loan Calculator</h3>
                      <p className="text-gray-600 text-sm mb-4">
                        Compare lease payments with auto loan payments to determine the most cost-effective financing option.
                      </p>
                      <a href="/tools/car-loan-calculator" className="text-blue-600 hover:text-blue-700 font-medium text-sm">
                        Calculate Auto Loans →
                      </a>
                    </div>

                    <div className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
                      <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                        <i className="fas fa-calculator text-green-600 text-xl"></i>
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-3">Loan Calculator</h3>
                      <p className="text-gray-600 text-sm mb-4">
                        Calculate various loan types to understand your overall debt obligations and payment capacity.
                      </p>
                      <a href="/tools/loan-calculator" className="text-green-600 hover:text-green-700 font-medium text-sm">
                        Calculate Loans →
                      </a>
                    </div>

                    <div className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
                      <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                        <i className="fas fa-chart-line text-purple-600 text-xl"></i>
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-3">Investment Return Calculator</h3>
                      <p className="text-gray-600 text-sm mb-4">
                        Calculate potential returns on investing your down payment instead of using it for a lease.
                      </p>
                      <a href="/tools/investment-return-calculator" className="text-purple-600 hover:text-purple-700 font-medium text-sm">
                        Calculate Returns →
                      </a>
                    </div>

                    <div className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
                      <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                        <i className="fas fa-building text-orange-600 text-xl"></i>
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-3">Business Loan Calculator</h3>
                      <p className="text-gray-600 text-sm mb-4">
                        Compare business vehicle leasing with business loans for company cars and fleet vehicles.
                      </p>
                      <a href="/tools/business-loan-calculator" className="text-orange-600 hover:text-orange-700 font-medium text-sm">
                        Calculate Business Loans →
                      </a>
                    </div>

                    <div className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
                      <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center mb-4">
                        <i className="fas fa-piggy-bank text-teal-600 text-xl"></i>
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-3">Compound Interest Calculator</h3>
                      <p className="text-gray-600 text-sm mb-4">
                        Calculate the growth potential of investing your down payment versus using it for leasing.
                      </p>
                      <a href="/tools/compound-interest-calculator" className="text-teal-600 hover:text-teal-700 font-medium text-sm">
                        Calculate Growth →
                      </a>
                    </div>

                    <div className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
                      <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                        <i className="fas fa-balance-scale text-red-600 text-xl"></i>
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-3">Net Worth Calculator</h3>
                      <p className="text-gray-600 text-sm mb-4">
                        Track how leasing vs. buying affects your overall net worth and financial health.
                      </p>
                      <a href="/tools/net-worth-calculator" className="text-red-600 hover:text-red-700 font-medium text-sm">
                        Calculate Net Worth →
                      </a>
                    </div>

                    <div className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
                      <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                        <i className="fas fa-percentage text-indigo-600 text-xl"></i>
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-3">Simple Interest Calculator</h3>
                      <p className="text-gray-600 text-sm mb-4">
                        Calculate simple interest for basic financing options and compare with lease money factors.
                      </p>
                      <a href="/tools/simple-interest-calculator" className="text-indigo-600 hover:text-indigo-700 font-medium text-sm">
                        Calculate Interest →
                      </a>
                    </div>

                    <div className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
                      <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center mb-4">
                        <i className="fas fa-chart-pie text-pink-600 text-xl"></i>
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-3">Budget Calculator</h3>
                      <p className="text-gray-600 text-sm mb-4">
                        Ensure your lease payment fits comfortably within your monthly budget and financial goals.
                      </p>
                      <a href="/tools/budget-calculator" className="text-pink-600 hover:text-pink-700 font-medium text-sm">
                        Plan Budget →
                      </a>
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
          </div>
          </section>
        </main>
        
        <Footer />
      </div>
    </>
  );
};

export default LeaseCalculator;
