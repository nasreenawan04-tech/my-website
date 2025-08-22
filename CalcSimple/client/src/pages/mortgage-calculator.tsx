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

interface MortgageResult {
  monthlyPayment: number;
  totalAmount: number;
  totalInterest: number;
  monthlyPrincipalAndInterest: number;
  monthlyTaxes: number;
  monthlyInsurance: number;
  monthlyPMI: number;
}

const MortgageCalculator = () => {
  const [homePrice, setHomePrice] = useState('');
  const [downPayment, setDownPayment] = useState('');
  const [downPaymentPercent, setDownPaymentPercent] = useState('20');
  const [loanTerm, setLoanTerm] = useState('30');
  const [interestRate, setInterestRate] = useState('');
  const [propertyTax, setPropertyTax] = useState('');
  const [homeInsurance, setHomeInsurance] = useState('');
  const [pmiRate, setPmiRate] = useState('0.5');
  const [usePercentage, setUsePercentage] = useState(true);
  const [result, setResult] = useState<MortgageResult | null>(null);

  const calculateMortgage = () => {
    const price = parseFloat(homePrice);
    const down = usePercentage 
      ? (price * parseFloat(downPaymentPercent)) / 100 
      : parseFloat(downPayment);
    const principal = price - down;
    const rate = parseFloat(interestRate) / 100 / 12;
    const term = parseFloat(loanTerm) * 12;
    const taxes = parseFloat(propertyTax) || 0;
    const insurance = parseFloat(homeInsurance) || 0;
    const pmi = parseFloat(pmiRate) || 0;

    if (principal && rate && term) {
      // Monthly Principal & Interest calculation
      const monthlyPI = (principal * rate * Math.pow(1 + rate, term)) / (Math.pow(1 + rate, term) - 1);
      
      // Monthly property taxes
      const monthlyTaxes = taxes / 12;
      
      // Monthly insurance
      const monthlyInsurance = insurance / 12;
      
      // Monthly PMI (if down payment is less than 20%)
      const downPaymentPercent = (down / price) * 100;
      const monthlyPMI = downPaymentPercent < 20 ? (principal * (pmi / 100)) / 12 : 0;
      
      // Total monthly payment
      const monthlyPayment = monthlyPI + monthlyTaxes + monthlyInsurance + monthlyPMI;
      
      const totalAmount = monthlyPI * term;
      const totalInterest = totalAmount - principal;

      setResult({
        monthlyPayment: Math.round(monthlyPayment * 100) / 100,
        totalAmount: Math.round(totalAmount * 100) / 100,
        totalInterest: Math.round(totalInterest * 100) / 100,
        monthlyPrincipalAndInterest: Math.round(monthlyPI * 100) / 100,
        monthlyTaxes: Math.round(monthlyTaxes * 100) / 100,
        monthlyInsurance: Math.round(monthlyInsurance * 100) / 100,
        monthlyPMI: Math.round(monthlyPMI * 100) / 100
      });
    }
  };

  const resetCalculator = () => {
    setHomePrice('');
    setDownPayment('');
    setDownPaymentPercent('20');
    setLoanTerm('30');
    setInterestRate('');
    setPropertyTax('');
    setHomeInsurance('');
    setPmiRate('0.5');
    setUsePercentage(true);
    setResult(null);
  };

  const formatCurrency = (amount: number, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  return (
    <>
      <Helmet>
        <title>Mortgage Calculator - Calculate Monthly Mortgage Payments | ToolsHub</title>
        <meta name="description" content="Free mortgage calculator to calculate monthly payments, total interest, and loan costs. Include taxes, insurance, and PMI for accurate estimates." />
        <meta name="keywords" content="mortgage calculator, home loan calculator, monthly payment calculator, mortgage interest calculator" />
        <meta property="og:title" content="Mortgage Calculator - Calculate Monthly Mortgage Payments | ToolsHub" />
        <meta property="og:description" content="Free mortgage calculator to calculate monthly payments, total interest, and loan costs. Include taxes, insurance, and PMI for accurate estimates." />
        <meta property="og:type" content="website" />
        <link rel="canonical" href="/tools/mortgage-calculator" />
      </Helmet>

      <div className="min-h-screen flex flex-col" data-testid="page-mortgage-calculator">
        <Header />
        
        <main className="flex-1 bg-neutral-50">
          {/* Hero Section */}
          <section className="gradient-hero text-white py-16">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <div className="w-20 h-20 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <i className="fas fa-home text-3xl"></i>
              </div>
              <h1 className="text-4xl sm:text-5xl font-bold mb-6" data-testid="text-page-title">
                Mortgage Calculator
              </h1>
              <p className="text-xl text-blue-100 max-w-2xl mx-auto">
                Calculate monthly mortgage payments including taxes, insurance, and PMI for accurate home affordability
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
                      <h2 className="text-2xl font-semibold text-gray-900 mb-8">Mortgage Details</h2>
                      
                      {/* Home Price */}
                      <div className="space-y-3">
                        <Label htmlFor="home-price" className="text-sm font-medium text-gray-700">
                          Home Price ($)
                        </Label>
                        <Input
                          id="home-price"
                          type="number"
                          value={homePrice}
                          onChange={(e) => setHomePrice(e.target.value)}
                          className="h-12 text-base border-gray-200 rounded-lg"
                          placeholder="500,000"
                          data-testid="input-home-price"
                        />
                      </div>

                      {/* Down Payment */}
                      <div className="space-y-3">
                        <Label>Down Payment</Label>
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
                              className="pr-8"
                              placeholder="20"
                              min="0"
                              max="100"
                              step="0.1"
                              data-testid="input-down-payment-percent"
                            />
                            <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">%</span>
                          </div>
                        ) : (
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">$</span>
                            <Input
                              type="number"
                              value={downPayment}
                              onChange={(e) => setDownPayment(e.target.value)}
                              className="pl-8"
                              placeholder="100,000"
                              data-testid="input-down-payment-amount"
                            />
                          </div>
                        )}
                      </div>

                      {/* Loan Term */}
                      <div className="space-y-3">
                        <Label className="text-sm font-medium text-gray-700">Loan Term</Label>
                        <div className="grid grid-cols-2 gap-3">
                          <Input
                            type="number"
                            value={loanTerm}
                            onChange={(e) => setLoanTerm(e.target.value)}
                            className="h-12 text-base border-gray-200 rounded-lg"
                            placeholder="30"
                            min="1"
                            data-testid="input-loan-term"
                          />
                          <Select value="years" onValueChange={() => {}}>
                            <SelectTrigger className="h-12 border-gray-200 rounded-lg" data-testid="select-loan-term">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="years">Years</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      {/* Interest Rate */}
                      <div className="space-y-3">
                        <Label htmlFor="interest-rate" className="text-sm font-medium text-gray-700">
                          Annual Interest Rate (%)
                        </Label>
                        <Input
                          id="interest-rate"
                          type="number"
                          value={interestRate}
                          onChange={(e) => setInterestRate(e.target.value)}
                          className="h-12 text-base border-gray-200 rounded-lg"
                          placeholder="6.5"
                          step="0.01"
                          min="0"
                          max="100"
                          data-testid="input-interest-rate"
                        />
                      </div>

                      {/* Additional Costs */}
                      <div className="border-t pt-6 space-y-4">
                        <h3 className="text-lg font-semibold mb-4">Additional Monthly Costs</h3>
                        
                        {/* Property Tax */}
                        <div className="space-y-2">
                          <Label htmlFor="property-tax">Annual Property Tax</Label>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">$</span>
                            <Input
                              id="property-tax"
                              type="number"
                              value={propertyTax}
                              onChange={(e) => setPropertyTax(e.target.value)}
                              className="pl-8"
                              placeholder="6,000"
                              data-testid="input-property-tax"
                            />
                          </div>
                        </div>

                        {/* Home Insurance */}
                        <div className="space-y-2">
                          <Label htmlFor="home-insurance">Annual Home Insurance</Label>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">$</span>
                            <Input
                              id="home-insurance"
                              type="number"
                              value={homeInsurance}
                              onChange={(e) => setHomeInsurance(e.target.value)}
                              className="pl-8"
                              placeholder="1,200"
                              data-testid="input-home-insurance"
                            />
                          </div>
                        </div>

                        {/* PMI Rate */}
                        <div className="space-y-2">
                          <Label htmlFor="pmi-rate">PMI Rate (Annual %)</Label>
                          <div className="relative">
                            <Input
                              id="pmi-rate"
                              type="number"
                              value={pmiRate}
                              onChange={(e) => setPmiRate(e.target.value)}
                              className="pr-8"
                              placeholder="0.5"
                              step="0.1"
                              min="0"
                              max="10"
                              data-testid="input-pmi-rate"
                            />
                            <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">%</span>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Applied if down payment is less than 20%
                          </p>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-4 pt-6">
                        <Button
                          onClick={calculateMortgage}
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
                      <h2 className="text-2xl font-semibold text-gray-900 mb-8">Calculation Results</h2>
                      
                      {result ? (
                        <div className="space-y-4" data-testid="mortgage-results">
                          {/* Total Monthly Payment */}
                          <div className="bg-white rounded-lg p-4 border-l-4 border-blue-500">
                            <div className="flex justify-between items-center">
                              <span className="font-semibold text-gray-700">Total Monthly Payment</span>
                              <span className="text-2xl font-bold text-blue-600" data-testid="text-monthly-payment">
                                {formatCurrency(result.monthlyPayment)}
                              </span>
                            </div>
                          </div>

                          {/* Payment Breakdown */}
                          <div className="space-y-3">
                            <div className="flex justify-between">
                              <span className="text-gray-600">Principal & Interest</span>
                              <span className="font-semibold" data-testid="text-principal-interest">
                                {formatCurrency(result.monthlyPrincipalAndInterest)}
                              </span>
                            </div>
                            
                            {result.monthlyTaxes > 0 && (
                              <div className="flex justify-between">
                                <span className="text-gray-600">Property Taxes</span>
                                <span className="font-semibold" data-testid="text-property-taxes">
                                  {formatCurrency(result.monthlyTaxes)}
                                </span>
                              </div>
                            )}
                            
                            {result.monthlyInsurance > 0 && (
                              <div className="flex justify-between">
                                <span className="text-gray-600">Home Insurance</span>
                                <span className="font-semibold" data-testid="text-home-insurance">
                                  {formatCurrency(result.monthlyInsurance)}
                                </span>
                              </div>
                            )}
                            
                            {result.monthlyPMI > 0 && (
                              <div className="flex justify-between">
                                <span className="text-gray-600">PMI</span>
                                <span className="font-semibold" data-testid="text-pmi">
                                  {formatCurrency(result.monthlyPMI)}
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Loan Summary */}
                          <div className="border-t pt-4 space-y-3">
                            <div className="flex justify-between">
                              <span className="text-gray-600">Total Amount Paid</span>
                              <span className="font-semibold" data-testid="text-total-amount">
                                {formatCurrency(result.totalAmount)}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Total Interest</span>
                              <span className="font-semibold text-red-600" data-testid="text-total-interest">
                                {formatCurrency(result.totalInterest)}
                              </span>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-8" data-testid="no-results">
                          <i className="fas fa-calculator text-4xl text-gray-400 mb-4"></i>
                          <p className="text-gray-500">Enter mortgage details to see payment breakdown</p>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* What is a Mortgage Calculator */}
              <div className="mt-12 bg-white rounded-2xl shadow-lg p-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-6">What is a Mortgage Calculator?</h2>
                <div className="prose max-w-none">
                  <p className="text-lg text-gray-700 mb-6">
                    A <strong>mortgage calculator</strong> is an essential financial tool that helps prospective homebuyers estimate their monthly mortgage payments based on various loan parameters. This comprehensive calculator considers not just the principal and interest, but also additional costs like property taxes, homeowners insurance, and PMI (Private Mortgage Insurance) to provide you with an accurate picture of your total monthly housing payment.
                  </p>
                  
                  <p className="text-gray-700 mb-6">
                    Whether you're a first-time homebuyer or looking to refinance your existing mortgage, our mortgage payment calculator helps you make informed decisions about home affordability, loan terms, and down payment amounts. Understanding these calculations is crucial for proper financial planning and ensuring you choose a mortgage that fits comfortably within your budget.
                  </p>
                </div>
              </div>

              {/* How to Use */}
              <div className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-6">How to Use the Mortgage Calculator</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-semibold">1</div>
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-2">Enter Home Price</h3>
                        <p className="text-gray-600">Input the total purchase price of the home you're considering.</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-semibold">2</div>
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-2">Set Down Payment</h3>
                        <p className="text-gray-600">Choose between percentage or dollar amount for your down payment.</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-semibold">3</div>
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-2">Configure Loan Terms</h3>
                        <p className="text-gray-600">Enter the loan term (years) and annual interest rate.</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-semibold">4</div>
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-2">Add Additional Costs</h3>
                        <p className="text-gray-600">Include property taxes, home insurance, and PMI for accurate estimates.</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-semibold">5</div>
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-2">Calculate & Analyze</h3>
                        <p className="text-gray-600">Click calculate to see your monthly payment breakdown and loan summary.</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-semibold">6</div>
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-2">Compare Scenarios</h3>
                        <p className="text-gray-600">Adjust parameters to compare different loan scenarios and find the best option.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Understanding Your Mortgage Payment */}
              <div className="mt-8 bg-white rounded-2xl shadow-lg p-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Understanding Your Mortgage Payment Components</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                      <i className="fas fa-home text-blue-600 mr-2"></i>
                      Principal & Interest
                    </h3>
                    <p className="text-gray-600 mb-4">
                      This is the main loan payment that goes toward paying down your loan balance and the interest charged by the lender. Early in your loan term, more goes toward interest; later, more goes toward principal.
                    </p>
                    
                    <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                      <i className="fas fa-file-invoice-dollar text-blue-600 mr-2"></i>
                      Property Taxes
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Annual taxes paid to your local government based on your home's assessed value. Usually collected monthly by your lender and held in an escrow account until the tax bill is due.
                    </p>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                      <i className="fas fa-shield-alt text-blue-600 mr-2"></i>
                      Home Insurance
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Protects your home and belongings from damage due to fire, theft, natural disasters, and other covered perils. Required by lenders and typically paid monthly through escrow.
                    </p>
                    
                    <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                      <i className="fas fa-umbrella text-blue-600 mr-2"></i>
                      PMI (Private Mortgage Insurance)
                    </h3>
                    <p className="text-gray-600">
                      Required if your down payment is less than 20% of the home's value. PMI protects the lender if you default on the loan. Can be removed once you reach 20% equity in your home.
                    </p>
                  </div>
                </div>
              </div>

              {/* Key Features */}
              <div className="mt-8 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Key Features of Our Mortgage Calculator</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-green-600 text-white rounded-full flex items-center justify-center mx-auto mb-4">
                      <i className="fas fa-calculator text-2xl"></i>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Comprehensive Calculations</h3>
                    <p className="text-gray-600">Includes principal, interest, taxes, insurance, and PMI for complete payment estimates.</p>
                  </div>
                  
                  <div className="text-center">
                    <div className="w-16 h-16 bg-green-600 text-white rounded-full flex items-center justify-center mx-auto mb-4">
                      <i className="fas fa-chart-pie text-2xl"></i>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Payment Breakdown</h3>
                    <p className="text-gray-600">Detailed breakdown showing exactly where your monthly payment goes.</p>
                  </div>
                  
                  <div className="text-center">
                    <div className="w-16 h-16 bg-green-600 text-white rounded-full flex items-center justify-center mx-auto mb-4">
                      <i className="fas fa-mobile-alt text-2xl"></i>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Mobile Friendly</h3>
                    <p className="text-gray-600">Calculate mortgage payments on any device with our responsive design.</p>
                  </div>
                </div>
              </div>

              {/* Benefits */}
              <div className="mt-8 bg-white rounded-2xl shadow-lg p-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Benefits of Using a Mortgage Calculator</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <i className="fas fa-check-circle text-green-600 mt-1"></i>
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-1">Budget Planning</h3>
                        <p className="text-gray-600">Determine how much house you can afford before you start shopping.</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-3">
                      <i className="fas fa-check-circle text-green-600 mt-1"></i>
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-1">Compare Loan Options</h3>
                        <p className="text-gray-600">Evaluate different loan terms, interest rates, and down payment scenarios.</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-3">
                      <i className="fas fa-check-circle text-green-600 mt-1"></i>
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-1">Pre-approval Preparation</h3>
                        <p className="text-gray-600">Get realistic payment estimates before meeting with lenders.</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <i className="fas fa-check-circle text-green-600 mt-1"></i>
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-1">Avoid Overextending</h3>
                        <p className="text-gray-600">Ensure monthly payments fit comfortably within your budget.</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-3">
                      <i className="fas fa-check-circle text-green-600 mt-1"></i>
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-1">Refinancing Analysis</h3>
                        <p className="text-gray-600">Compare your current mortgage with potential refinancing options.</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-3">
                      <i className="fas fa-check-circle text-green-600 mt-1"></i>
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-1">Financial Planning</h3>
                        <p className="text-gray-600">Make informed decisions about your largest financial investment.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Use Cases */}
              <div className="mt-8 bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Common Use Cases for Mortgage Calculators</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="bg-white rounded-lg p-6 shadow-sm">
                    <div className="w-12 h-12 bg-purple-600 text-white rounded-lg flex items-center justify-center mb-4">
                      <i className="fas fa-home"></i>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">First-Time Homebuyers</h3>
                    <p className="text-gray-600">Determine affordability and understand the true cost of homeownership including all monthly expenses.</p>
                  </div>
                  
                  <div className="bg-white rounded-lg p-6 shadow-sm">
                    <div className="w-12 h-12 bg-purple-600 text-white rounded-lg flex items-center justify-center mb-4">
                      <i className="fas fa-exchange-alt"></i>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Refinancing Decisions</h3>
                    <p className="text-gray-600">Compare current mortgage payments with potential refinancing options to determine savings.</p>
                  </div>
                  
                  <div className="bg-white rounded-lg p-6 shadow-sm">
                    <div className="w-12 h-12 bg-purple-600 text-white rounded-lg flex items-center justify-center mb-4">
                      <i className="fas fa-chart-line"></i>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Investment Properties</h3>
                    <p className="text-gray-600">Calculate mortgage costs for rental properties and analyze potential cash flow scenarios.</p>
                  </div>
                  
                  <div className="bg-white rounded-lg p-6 shadow-sm">
                    <div className="w-12 h-12 bg-purple-600 text-white rounded-lg flex items-center justify-center mb-4">
                      <i className="fas fa-piggy-bank"></i>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Down Payment Planning</h3>
                    <p className="text-gray-600">See how different down payment amounts affect monthly payments and PMI requirements.</p>
                  </div>
                  
                  <div className="bg-white rounded-lg p-6 shadow-sm">
                    <div className="w-12 h-12 bg-purple-600 text-white rounded-lg flex items-center justify-center mb-4">
                      <i className="fas fa-balance-scale"></i>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Loan Comparison</h3>
                    <p className="text-gray-600">Compare 15-year vs 30-year mortgages, or fixed vs adjustable rate loans.</p>
                  </div>
                  
                  <div className="bg-white rounded-lg p-6 shadow-sm">
                    <div className="w-12 h-12 bg-purple-600 text-white rounded-lg flex items-center justify-center mb-4">
                      <i className="fas fa-calculator"></i>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Budget Analysis</h3>
                    <p className="text-gray-600">Ensure housing costs align with the 28% rule and overall financial goals.</p>
                  </div>
                </div>
              </div>

              {/* Tips */}
              <div className="mt-8 bg-white rounded-2xl shadow-lg p-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Mortgage Calculator Tips & Best Practices</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                      <i className="fas fa-lightbulb text-yellow-500 mr-2"></i>
                      Smart Tips
                    </h3>
                    <ul className="space-y-3">
                      <li className="flex items-start space-x-2">
                        <i className="fas fa-arrow-right text-blue-600 mt-1 text-sm"></i>
                        <span className="text-gray-700">Include all costs (taxes, insurance, PMI) for accurate budgeting</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <i className="fas fa-arrow-right text-blue-600 mt-1 text-sm"></i>
                        <span className="text-gray-700">Consider different down payment scenarios to find the best option</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <i className="fas fa-arrow-right text-blue-600 mt-1 text-sm"></i>
                        <span className="text-gray-700">Factor in potential interest rate changes for ARM loans</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <i className="fas fa-arrow-right text-blue-600 mt-1 text-sm"></i>
                        <span className="text-gray-700">Use current market rates for the most accurate estimates</span>
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
                        <span className="text-gray-700">Remember additional costs like HOA fees and maintenance</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <i className="fas fa-arrow-right text-orange-600 mt-1 text-sm"></i>
                        <span className="text-gray-700">Property taxes and insurance rates vary by location</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <i className="fas fa-arrow-right text-orange-600 mt-1 text-sm"></i>
                        <span className="text-gray-700">PMI can be removed once you reach 20% equity</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <i className="fas fa-arrow-right text-orange-600 mt-1 text-sm"></i>
                        <span className="text-gray-700">Consider your job stability and future income prospects</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* FAQ */}
              <div className="mt-8 bg-gradient-to-r from-gray-50 to-blue-50 rounded-2xl p-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Frequently Asked Questions</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">How accurate are mortgage calculator results?</h3>
                      <p className="text-gray-600">Mortgage calculators provide very accurate estimates when you input correct information. However, actual rates and terms may vary based on your credit score, debt-to-income ratio, and lender requirements.</p>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">What's the difference between principal and interest?</h3>
                      <p className="text-gray-600">Principal is the amount you borrowed that goes toward paying down your loan balance. Interest is the cost of borrowing money, charged by the lender as a percentage of the outstanding principal.</p>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Should I put 20% down to avoid PMI?</h3>
                      <p className="text-gray-600">While 20% down eliminates PMI, it's not always the best choice. Consider your cash flow, emergency fund, and investment opportunities when deciding on down payment amount.</p>
                    </div>
                  </div>
                  
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">How do property taxes affect my payment?</h3>
                      <p className="text-gray-600">Property taxes are typically collected monthly by your lender and held in escrow until the annual tax bill is due. Higher property tax rates increase your total monthly payment.</p>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Can I remove PMI later?</h3>
                      <p className="text-gray-600">Yes, PMI can typically be removed once you reach 20% equity in your home through payments or appreciation. Some loans automatically cancel PMI at 22% equity.</p>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">What's better: 15-year or 30-year mortgage?</h3>
                      <p className="text-gray-600">15-year mortgages have higher monthly payments but lower total interest costs. 30-year mortgages offer lower monthly payments but cost more over the life of the loan. Choose based on your budget and financial goals.</p>
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

export default MortgageCalculator;