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
        <title>Lease Calculator</title>
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


            </div>
          </section>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default LeaseCalculator;