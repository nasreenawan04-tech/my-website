import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

interface MortgageResult {
  monthlyPayment: number;
  totalAmount: number;
  totalInterest: number;
  monthlyPrincipalAndInterest: number;
  monthlyTaxes: number;
  monthlyInsurance: number;
  monthlyPMI: number;
  monthlyHOA: number;
  closingCosts: number;
  totalCashNeeded: number;
  loanToValue: number;
  debtToIncomeRatio?: number;
  affordabilityAnalysis: {
    maxAffordablePrice: number;
    recommendedPrice: number;
    isAffordable: boolean;
  };
  pmiRemovalDate?: {
    month: number;
    year: number;
    balance: number;
  };
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
  const [loanType, setLoanType] = useState('conventional');
  const [hoaFees, setHoaFees] = useState('0');
  const [closingCostPercent, setClosingCostPercent] = useState('3');
  const [monthlyIncome, setMonthlyIncome] = useState('');
  const [showAffordability, setShowAffordability] = useState(false);
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
    const hoa = parseFloat(hoaFees) || 0;
    const income = parseFloat(monthlyIncome) || 0;

    if (principal && rate && term) {
      // Adjust interest rate based on loan type
      let adjustedRate = rate;
      if (loanType === 'fha') {
        adjustedRate = rate + 0.0025; // 0.25% higher
      } else if (loanType === 'va') {
        adjustedRate = rate - 0.00125; // 0.125% lower
      }

      // Monthly Principal & Interest calculation
      const monthlyPI = (principal * adjustedRate * Math.pow(1 + adjustedRate, term)) / (Math.pow(1 + adjustedRate, term) - 1);
      
      // Monthly property taxes
      const monthlyTaxes = taxes / 12;
      
      // Monthly insurance
      const monthlyInsurance = insurance / 12;
      
      // Monthly PMI calculation varies by loan type
      const downPaymentPercent = (down / price) * 100;
      let monthlyPMI = 0;
      
      if (loanType === 'conventional' && downPaymentPercent < 20) {
        monthlyPMI = (principal * (pmi / 100)) / 12;
      } else if (loanType === 'fha') {
        // FHA MIP is required regardless of down payment
        monthlyPMI = (principal * 0.0085) / 12; // 0.85% annual MIP
      }
      
      // Monthly HOA fees
      const monthlyHOA = hoa;
      
      // Total monthly payment
      const monthlyPayment = monthlyPI + monthlyTaxes + monthlyInsurance + monthlyPMI + monthlyHOA;
      
      // Closing costs calculation
      const closingCosts = (price * parseFloat(closingCostPercent)) / 100;
      const totalCashNeeded = down + closingCosts;
      
      // Loan to Value ratio
      const loanToValue = (principal / price) * 100;
      
      // Debt to Income ratio
      const debtToIncomeRatio = income > 0 ? (monthlyPayment / income) * 100 : 0;
      
      // Affordability analysis
      const maxPaymentBasedOnIncome = income * 0.28; // 28% rule
      const maxAffordablePrice = income > 0 ? (maxPaymentBasedOnIncome - monthlyTaxes - monthlyInsurance - monthlyHOA) / (adjustedRate * Math.pow(1 + adjustedRate, term) / (Math.pow(1 + adjustedRate, term) - 1)) + down : 0;
      const recommendedPrice = maxAffordablePrice * 0.85; // More conservative recommendation
      const isAffordable = monthlyPayment <= maxPaymentBasedOnIncome;
      
      // PMI removal calculation (for conventional loans)
      let pmiRemovalDate;
      if (loanType === 'conventional' && monthlyPMI > 0) {
        let balance = principal;
        let month = 0;
        while (balance / price > 0.78 && month < term) { // PMI removed at 78% LTV
          month++;
          const interestPayment = balance * adjustedRate;
          const principalPayment = monthlyPI - interestPayment;
          balance -= principalPayment;
        }
        if (month < term) {
          pmiRemovalDate = {
            month: month % 12 || 12,
            year: Math.floor(month / 12) + new Date().getFullYear(),
            balance: balance
          };
        }
      }
      
      const totalAmount = monthlyPI * term;
      const totalInterest = totalAmount - principal;

      setResult({
        monthlyPayment: Math.round(monthlyPayment * 100) / 100,
        totalAmount: Math.round(totalAmount * 100) / 100,
        totalInterest: Math.round(totalInterest * 100) / 100,
        monthlyPrincipalAndInterest: Math.round(monthlyPI * 100) / 100,
        monthlyTaxes: Math.round(monthlyTaxes * 100) / 100,
        monthlyInsurance: Math.round(monthlyInsurance * 100) / 100,
        monthlyPMI: Math.round(monthlyPMI * 100) / 100,
        monthlyHOA: Math.round(monthlyHOA * 100) / 100,
        closingCosts: Math.round(closingCosts * 100) / 100,
        totalCashNeeded: Math.round(totalCashNeeded * 100) / 100,
        loanToValue: Math.round(loanToValue * 100) / 100,
        debtToIncomeRatio: Math.round(debtToIncomeRatio * 100) / 100,
        affordabilityAnalysis: {
          maxAffordablePrice: Math.round(maxAffordablePrice * 100) / 100,
          recommendedPrice: Math.round(recommendedPrice * 100) / 100,
          isAffordable
        },
        pmiRemovalDate
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
    setLoanType('conventional');
    setHoaFees('0');
    setClosingCostPercent('3');
    setMonthlyIncome('');
    setShowAffordability(false);
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
        <title>Mortgage Calculator - Calculate Monthly Mortgage Payments | DapsiWow</title>
        <meta name="description" content="Free mortgage calculator to calculate monthly payments, total interest, and loan costs. Include taxes, insurance, and PMI for accurate estimates." />
        <meta name="keywords" content="mortgage calculator, home loan calculator, monthly payment calculator, mortgage interest calculator" />
        <meta property="og:title" content="Mortgage Calculator - Calculate Monthly Mortgage Payments | DapsiWow" />
        <meta property="og:description" content="Free mortgage calculator to calculate monthly payments, total interest, and loan costs. Include taxes, insurance, and PMI for accurate estimates." />
        <meta property="og:type" content="website" />
        <link rel="canonical" href="https://dapsiwow.com/mortgage-calculator" />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50" data-testid="page-mortgage-calculator">
        <Header />
        
        <main>
          {/* Hero Section */}
          <section className="relative py-12 sm:py-16 md:py-20 lg:py-28 xl:py-32 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-purple-600/20"></div>
            <div className="relative max-w-sm sm:max-w-lg md:max-w-2xl lg:max-w-4xl xl:max-w-5xl 2xl:max-w-6xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 text-center">
              <div className="space-y-4 sm:space-y-6 md:space-y-8">
                <div className="inline-flex items-center px-3 py-1.5 sm:px-4 sm:py-2 bg-white/80 backdrop-blur-sm rounded-full border border-purple-200">
                  <span className="text-xs sm:text-sm font-medium text-purple-700">Advanced Mortgage Calculator</span>
                </div>
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl 2xl:text-8xl font-bold text-slate-900 leading-tight tracking-tight">
                  <span className="block">Smart Mortgage</span>
                  <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 mt-1 sm:mt-2">
                    Calculator
                  </span>
                </h1>
                <p className="text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl text-slate-600 max-w-sm sm:max-w-lg md:max-w-2xl lg:max-w-3xl xl:max-w-4xl mx-auto leading-relaxed px-2 sm:px-0">
                  Calculate comprehensive mortgage payments including taxes, insurance, and PMI for complete home affordability analysis
                </p>
              </div>
            </div>
          </section>

          {/* Calculator Section */}
          <section className="py-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <Card className="bg-white/90 backdrop-blur-sm shadow-2xl border-0 rounded-3xl overflow-hidden">
                <CardContent className="p-0">
                  <div className="grid grid-cols-1 xl:grid-cols-5 gap-0">
                    {/* Input Section */}
                    <div className="xl:col-span-3 p-8 lg:p-12 space-y-8">
                      <div>
                        <h2 className="text-3xl font-bold text-gray-900 mb-2">Mortgage Configuration</h2>
                        <p className="text-gray-600">Enter your home and loan details for accurate payment calculations</p>
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Home Price */}
                        <div className="space-y-3">
                          <Label htmlFor="home-price" className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                            Home Price
                          </Label>
                          <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-lg">$</span>
                            <Input
                              id="home-price"
                              type="number"
                              value={homePrice}
                              onChange={(e) => setHomePrice(e.target.value)}
                              className="h-14 pl-8 text-lg border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-purple-500"
                              placeholder="500,000"
                              data-testid="input-home-price"
                            />
                          </div>
                        </div>

                        {/* Down Payment */}
                        <div className="space-y-3">
                          <Label className="text-sm font-semibold text-gray-800 uppercase tracking-wide">Down Payment Type</Label>
                          <RadioGroup 
                            value={usePercentage ? "percentage" : "amount"} 
                            onValueChange={(value) => setUsePercentage(value === "percentage")}
                            className="flex gap-6"
                          >
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="percentage" id="percentage" data-testid="radio-percentage" />
                              <Label htmlFor="percentage" className="text-sm font-medium">Percentage</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="amount" id="amount" data-testid="radio-amount" />
                              <Label htmlFor="amount" className="text-sm font-medium">Dollar Amount</Label>
                            </div>
                          </RadioGroup>
                          
                          {usePercentage ? (
                            <div className="relative">
                              <Input
                                type="number"
                                value={downPaymentPercent}
                                onChange={(e) => setDownPaymentPercent(e.target.value)}
                                className="h-14 pr-8 text-lg border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-purple-500"
                                placeholder="20"
                                min="0"
                                max="100"
                                step="0.1"
                                data-testid="input-down-payment-percent"
                              />
                              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 text-lg">%</span>
                            </div>
                          ) : (
                            <div className="relative">
                              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-lg">$</span>
                              <Input
                                type="number"
                                value={downPayment}
                                onChange={(e) => setDownPayment(e.target.value)}
                                className="h-14 pl-8 text-lg border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-purple-500"
                                placeholder="100,000"
                                data-testid="input-down-payment-amount"
                              />
                            </div>
                          )}
                        </div>

                        {/* Loan Term */}
                        <div className="space-y-3">
                          <Label className="text-sm font-semibold text-gray-800 uppercase tracking-wide">Loan Term</Label>
                          <div className="grid grid-cols-2 gap-3">
                            <Input
                              type="number"
                              value={loanTerm}
                              onChange={(e) => setLoanTerm(e.target.value)}
                              className="h-14 text-lg border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-purple-500"
                              placeholder="30"
                              min="1"
                              data-testid="input-loan-term"
                            />
                            <Select value="years">
                              <SelectTrigger className="h-14 border-2 border-gray-200 rounded-xl text-lg" data-testid="select-loan-term">
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
                          <Label htmlFor="interest-rate" className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                            Annual Interest Rate
                          </Label>
                          <div className="relative">
                            <Input
                              id="interest-rate"
                              type="number"
                              value={interestRate}
                              onChange={(e) => setInterestRate(e.target.value)}
                              className="h-14 pr-8 text-lg border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-purple-500"
                              placeholder="6.5"
                              step="0.01"
                              min="0"
                              max="100"
                              data-testid="input-interest-rate"
                            />
                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 text-lg">%</span>
                          </div>
                        </div>

                        {/* Loan Type */}
                        <div className="lg:col-span-2 space-y-3">
                          <Label className="text-sm font-semibold text-gray-800 uppercase tracking-wide">Loan Type</Label>
                          <Select value={loanType} onValueChange={setLoanType}>
                            <SelectTrigger className="h-14 border-2 border-gray-200 rounded-xl text-lg" data-testid="select-loan-type">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="conventional">Conventional Loan</SelectItem>
                              <SelectItem value="fha">FHA (Federal Housing Administration)</SelectItem>
                              <SelectItem value="va">VA (Veterans Affairs)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      {/* Additional Costs */}
                      <div className="border-t border-gray-200 pt-8 space-y-6">
                        <h3 className="text-xl font-bold text-gray-900">Additional Monthly Costs</h3>
                        
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                          {/* Property Tax */}
                          <div className="space-y-2">
                            <Label htmlFor="property-tax" className="text-sm font-medium text-gray-700">Annual Property Tax</Label>
                            <div className="relative">
                              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                              <Input
                                id="property-tax"
                                type="number"
                                value={propertyTax}
                                onChange={(e) => setPropertyTax(e.target.value)}
                                className="pl-8 h-12 rounded-lg border-gray-200"
                                placeholder="6,000"
                                data-testid="input-property-tax"
                              />
                            </div>
                          </div>

                          {/* Home Insurance */}
                          <div className="space-y-2">
                            <Label htmlFor="home-insurance" className="text-sm font-medium text-gray-700">Annual Home Insurance</Label>
                            <div className="relative">
                              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                              <Input
                                id="home-insurance"
                                type="number"
                                value={homeInsurance}
                                onChange={(e) => setHomeInsurance(e.target.value)}
                                className="pl-8 h-12 rounded-lg border-gray-200"
                                placeholder="1,200"
                                data-testid="input-home-insurance"
                              />
                            </div>
                          </div>

                          {/* PMI Rate */}
                          <div className="space-y-2">
                            <Label htmlFor="pmi-rate" className="text-sm font-medium text-gray-700">PMI Rate (Annual %)</Label>
                            <div className="relative">
                              <Input
                                id="pmi-rate"
                                type="number"
                                value={pmiRate}
                                onChange={(e) => setPmiRate(e.target.value)}
                                className="pr-8 h-12 rounded-lg border-gray-200"
                                placeholder="0.5"
                                step="0.1"
                                min="0"
                                max="10"
                                data-testid="input-pmi-rate"
                                disabled={loanType !== 'conventional'}
                              />
                              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">%</span>
                            </div>
                            <p className="text-xs text-gray-500">
                              {loanType === 'conventional' 
                                ? 'Applied if down payment is less than 20%' 
                                : loanType === 'fha' 
                                  ? 'FHA loans have mandatory mortgage insurance premium (MIP)' 
                                  : 'VA loans do not require PMI'}
                            </p>
                          </div>

                          {/* HOA Fees */}
                          <div className="space-y-2">
                            <Label htmlFor="hoa-fees" className="text-sm font-medium text-gray-700">Monthly HOA Fees</Label>
                            <div className="relative">
                              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                              <Input
                                id="hoa-fees"
                                type="number"
                                value={hoaFees}
                                onChange={(e) => setHoaFees(e.target.value)}
                                className="pl-8 h-12 rounded-lg border-gray-200"
                                placeholder="0"
                                data-testid="input-hoa-fees"
                              />
                            </div>
                          </div>

                          {/* Closing Costs */}
                          <div className="space-y-2">
                            <Label htmlFor="closing-costs" className="text-sm font-medium text-gray-700">Closing Costs (%)</Label>
                            <div className="relative">
                              <Input
                                id="closing-costs"
                                type="number"
                                value={closingCostPercent}
                                onChange={(e) => setClosingCostPercent(e.target.value)}
                                className="pr-8 h-12 rounded-lg border-gray-200"
                                placeholder="3"
                                step="0.1"
                                min="0"
                                max="10"
                                data-testid="input-closing-costs"
                              />
                              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">%</span>
                            </div>
                            <p className="text-xs text-gray-500">Typically 2-5% of home price</p>
                          </div>

                          {/* Monthly Income for Affordability */}
                          <div className="space-y-2">
                            <Label htmlFor="monthly-income" className="text-sm font-medium text-gray-700">Monthly Income (Optional)</Label>
                            <div className="relative">
                              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                              <Input
                                id="monthly-income"
                                type="number"
                                value={monthlyIncome}
                                onChange={(e) => setMonthlyIncome(e.target.value)}
                                className="pl-8 h-12 rounded-lg border-gray-200"
                                placeholder="8,000"
                                data-testid="input-monthly-income"
                              />
                            </div>
                            <p className="text-xs text-gray-500">For affordability analysis</p>
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-col sm:flex-row gap-4 pt-6">
                        <Button
                          onClick={calculateMortgage}
                          className="flex-1 h-14 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold text-lg rounded-xl shadow-lg transform transition-all duration-200 hover:scale-105"
                          data-testid="button-calculate"
                        >
                          Calculate Mortgage
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
                    </div>

                    {/* Results Section */}
                    <div className="xl:col-span-2 bg-gradient-to-br from-gray-50 to-purple-50 p-8 lg:p-12">
                      <h2 className="text-2xl font-bold text-gray-900 mb-8">Payment Breakdown</h2>

                      {result ? (
                        <div className="space-y-6" data-testid="mortgage-results">
                          {/* Total Monthly Payment Highlight */}
                          <div className="bg-white rounded-2xl p-6 shadow-lg border border-purple-100">
                            <div className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-2">Total Monthly Payment</div>
                            <div className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600" data-testid="text-monthly-payment">
                              {formatCurrency(result.monthlyPayment)}
                            </div>
                          </div>

                          {/* Payment Components */}
                          <div className="space-y-3">
                            <div className="bg-white rounded-xl p-4 shadow-sm">
                              <div className="flex justify-between items-center">
                                <span className="font-medium text-gray-700">Principal & Interest</span>
                                <span className="font-bold text-blue-600" data-testid="text-principal-interest">
                                  {formatCurrency(result.monthlyPrincipalAndInterest)}
                                </span>
                              </div>
                            </div>
                            
                            {result.monthlyTaxes > 0 && (
                              <div className="bg-white rounded-xl p-4 shadow-sm">
                                <div className="flex justify-between items-center">
                                  <span className="font-medium text-gray-700">Property Taxes</span>
                                  <span className="font-bold text-orange-600" data-testid="text-property-taxes">
                                    {formatCurrency(result.monthlyTaxes)}
                                  </span>
                                </div>
                              </div>
                            )}

                            {result.monthlyInsurance > 0 && (
                              <div className="bg-white rounded-xl p-4 shadow-sm">
                                <div className="flex justify-between items-center">
                                  <span className="font-medium text-gray-700">Home Insurance</span>
                                  <span className="font-bold text-green-600" data-testid="text-home-insurance">
                                    {formatCurrency(result.monthlyInsurance)}
                                  </span>
                                </div>
                              </div>
                            )}

                            {result.monthlyPMI > 0 && (
                              <div className="bg-white rounded-xl p-4 shadow-sm">
                                <div className="flex justify-between items-center">
                                  <span className="font-medium text-gray-700">PMI/MIP</span>
                                  <span className="font-bold text-red-600" data-testid="text-pmi">
                                    {formatCurrency(result.monthlyPMI)}
                                  </span>
                                </div>
                              </div>
                            )}

                            {result.monthlyHOA > 0 && (
                              <div className="bg-white rounded-xl p-4 shadow-sm">
                                <div className="flex justify-between items-center">
                                  <span className="font-medium text-gray-700">HOA Fees</span>
                                  <span className="font-bold text-purple-600" data-testid="text-hoa">
                                    {formatCurrency(result.monthlyHOA)}
                                  </span>
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Cash Required */}
                          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-200">
                            <h4 className="font-bold text-blue-800 mb-4 text-lg">Cash Required at Closing</h4>
                            <div className="space-y-2">
                              <div className="flex justify-between">
                                <span className="text-blue-700 font-medium">Down Payment:</span>
                                <span className="font-bold text-blue-800">
                                  {formatCurrency(usePercentage ? (parseFloat(homePrice) * parseFloat(downPaymentPercent)) / 100 : parseFloat(downPayment || '0'))}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-blue-700 font-medium">Closing Costs:</span>
                                <span className="font-bold text-blue-800">
                                  {formatCurrency(result.closingCosts)}
                                </span>
                              </div>
                              <div className="border-t border-blue-200 pt-2 mt-2">
                                <div className="flex justify-between">
                                  <span className="text-blue-700 font-bold">Total Cash Needed:</span>
                                  <span className="font-bold text-blue-800 text-lg">
                                    {formatCurrency(result.totalCashNeeded)}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Affordability Analysis */}
                          {result.debtToIncomeRatio && result.debtToIncomeRatio > 0 && (
                            <div className={`rounded-xl p-6 border ${
                              result.affordabilityAnalysis.isAffordable 
                                ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200' 
                                : 'bg-gradient-to-r from-red-50 to-pink-50 border-red-200'
                            }`}>
                              <h4 className={`font-bold mb-4 text-lg ${
                                result.affordabilityAnalysis.isAffordable ? 'text-green-800' : 'text-red-800'
                              }`}>
                                Affordability Analysis
                              </h4>
                              <div className="space-y-2">
                                <div className="flex justify-between">
                                  <span className={`font-medium ${
                                    result.affordabilityAnalysis.isAffordable ? 'text-green-700' : 'text-red-700'
                                  }`}>
                                    Debt-to-Income Ratio:
                                  </span>
                                  <span className={`font-bold ${
                                    result.affordabilityAnalysis.isAffordable ? 'text-green-800' : 'text-red-800'
                                  }`}>
                                    {result.debtToIncomeRatio.toFixed(1)}%
                                  </span>
                                </div>
                                <p className={`text-sm ${
                                  result.affordabilityAnalysis.isAffordable ? 'text-green-600' : 'text-red-600'
                                }`}>
                                  {result.affordabilityAnalysis.isAffordable 
                                    ? 'This mortgage payment is within recommended affordability guidelines (≤28%)' 
                                    : 'This mortgage payment exceeds recommended affordability guidelines (>28%)'}
                                </p>
                              </div>
                            </div>
                          )}

                          {/* PMI Removal Date */}
                          {result.pmiRemovalDate && (
                            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl p-6 border border-yellow-200">
                              <h4 className="font-bold text-yellow-800 mb-4 text-lg">PMI Removal Projection</h4>
                              <p className="text-yellow-700 font-medium">
                                PMI can be removed approximately in{' '}
                                <span className="font-bold">
                                  {result.pmiRemovalDate.month}/{result.pmiRemovalDate.year}
                                </span>{' '}
                                when you reach 78% loan-to-value ratio.
                              </p>
                            </div>
                          )}

                          {/* Loan Summary */}
                          <div className="bg-white rounded-xl p-6 shadow-sm">
                            <h4 className="font-bold text-gray-900 mb-4">Loan Summary</h4>
                            <div className="space-y-2">
                              <div className="flex justify-between">
                                <span className="text-gray-600">Loan Amount:</span>
                                <span className="font-semibold">{formatCurrency(parseFloat(homePrice || '0') - (usePercentage ? (parseFloat(homePrice || '0') * parseFloat(downPaymentPercent)) / 100 : parseFloat(downPayment || '0')))}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Total Interest:</span>
                                <span className="font-semibold text-orange-600" data-testid="text-total-interest">
                                  {formatCurrency(result.totalInterest)}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Total Amount Paid:</span>
                                <span className="font-semibold">{formatCurrency(result.totalAmount)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Loan-to-Value Ratio:</span>
                                <span className="font-semibold">{result.loanToValue.toFixed(1)}%</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-16" data-testid="no-results">
                          <div className="w-20 h-20 bg-gray-200 rounded-full mx-auto mb-6 flex items-center justify-center">
                            <div className="text-3xl font-bold text-gray-400">$</div>
                          </div>
                          <p className="text-gray-500 text-lg">Enter mortgage details to see complete payment breakdown</p>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Educational Content */}
          <div className="max-w-7xl mx-auto px-4 py-16 space-y-16">
            {/* What is a Mortgage Calculator */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-lg border-0 rounded-2xl">
              <CardContent className="p-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-6">What is a Mortgage Calculator?</h2>
                <div className="prose max-w-none text-gray-700 space-y-4 text-lg leading-relaxed">
                  <p>
                    A <strong>mortgage calculator</strong> is an essential financial tool that helps prospective homebuyers estimate their monthly mortgage payments based on various loan parameters. This comprehensive calculator considers not just the principal and interest, but also additional costs like property taxes, homeowners insurance, and PMI (Private Mortgage Insurance) to provide you with an accurate picture of your total monthly housing payment.
                  </p>
                  <p>
                    Whether you're a first-time homebuyer or looking to refinance your existing mortgage, our mortgage payment calculator helps you make informed decisions about home affordability, loan terms, and down payment amounts. Understanding these calculations is crucial for proper financial planning and ensuring you choose a mortgage that fits comfortably within your budget.
                  </p>
                  <p>
                    Our advanced mortgage calculator goes beyond basic calculations to include comprehensive affordability analysis, PMI removal projections, and detailed payment breakdowns. You can also explore related financial tools like our general loan calculator for other types of financing needs, or our home loan calculator for specialized home financing scenarios.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Benefits and Features */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card className="bg-white/90 backdrop-blur-sm shadow-lg border-0 rounded-2xl">
                <CardContent className="p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Key Benefits</h2>
                  <div className="space-y-6">
                    <div className="border-l-4 border-blue-500 pl-6">
                      <h3 className="font-bold text-gray-900 mb-2">Comprehensive Analysis</h3>
                      <p className="text-gray-600">Includes taxes, insurance, and PMI for complete cost assessment and accurate budgeting.</p>
                    </div>
                    
                    <div className="border-l-4 border-green-500 pl-6">
                      <h3 className="font-bold text-gray-900 mb-2">Multiple Loan Types</h3>
                      <p className="text-gray-600">Supports Conventional, FHA, and VA loans with specific calculations for each type.</p>
                    </div>
                    
                    <div className="border-l-4 border-purple-500 pl-6">
                      <h3 className="font-bold text-gray-900 mb-2">Affordability Insights</h3>
                      <p className="text-gray-600">Debt-to-income analysis and affordability recommendations based on the 28% rule.</p>
                    </div>
                    
                    <div className="border-l-4 border-orange-500 pl-6">
                      <h3 className="font-bold text-gray-900 mb-2">PMI Projections</h3>
                      <p className="text-gray-600">Estimates when PMI can be removed based on equity buildup over time.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/90 backdrop-blur-sm shadow-lg border-0 rounded-2xl">
                <CardContent className="p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Who Should Use This Tool</h2>
                  <div className="space-y-6">
                    <div className="bg-blue-50 rounded-xl p-4">
                      <h3 className="font-bold text-gray-900 mb-2">First-Time Homebuyers</h3>
                      <p className="text-gray-600 text-sm">Determine affordability and understand the true cost of homeownership including all monthly expenses.</p>
                    </div>
                    
                    <div className="bg-green-50 rounded-xl p-4">
                      <h3 className="font-bold text-gray-900 mb-2">Current Homeowners</h3>
                      <p className="text-gray-600 text-sm">Compare current mortgage payments with potential refinancing options to determine savings.</p>
                    </div>
                    
                    <div className="bg-purple-50 rounded-xl p-4">
                      <h3 className="font-bold text-gray-900 mb-2">Real Estate Investors</h3>
                      <p className="text-gray-600 text-sm">Calculate mortgage costs for rental properties and analyze potential cash flow scenarios.</p>
                    </div>
                    
                    <div className="bg-orange-50 rounded-xl p-4">
                      <h3 className="font-bold text-gray-900 mb-2">Financial Planners</h3>
                      <p className="text-gray-600 text-sm">Ensure housing costs align with the 28% rule and overall financial goals for clients.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Loan Type Comparison */}
            <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-0 shadow-lg rounded-2xl">
              <CardContent className="p-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-8">Loan Type Comparison</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white rounded-xl p-6 shadow-sm">
                    <h3 className="text-xl font-bold text-purple-900 mb-4">Conventional Loans</h3>
                    <div className="space-y-3 text-sm text-purple-800">
                      <p><strong>Credit Score:</strong> 620+ typically required</p>
                      <p><strong>Down Payment:</strong> 5-20% recommended</p>
                      <p><strong>PMI:</strong> Required if less than 20% down</p>
                      <p><strong>Best For:</strong> Borrowers with good credit and stable income</p>
                    </div>
                  </div>
                  
                  <div className="bg-white rounded-xl p-6 shadow-sm">
                    <h3 className="text-xl font-bold text-blue-900 mb-4">FHA Loans</h3>
                    <div className="space-y-3 text-sm text-blue-800">
                      <p><strong>Credit Score:</strong> 580+ with 3.5% down</p>
                      <p><strong>Down Payment:</strong> As low as 3.5%</p>
                      <p><strong>MIP:</strong> Required regardless of down payment</p>
                      <p><strong>Best For:</strong> First-time buyers with lower credit scores</p>
                    </div>
                  </div>
                  
                  <div className="bg-white rounded-xl p-6 shadow-sm">
                    <h3 className="text-xl font-bold text-green-900 mb-4">VA Loans</h3>
                    <div className="space-y-3 text-sm text-green-800">
                      <p><strong>Credit Score:</strong> Varies by lender</p>
                      <p><strong>Down Payment:</strong> $0 down payment option</p>
                      <p><strong>PMI:</strong> No PMI required</p>
                      <p><strong>Best For:</strong> Veterans and active service members</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tips and Best Practices */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-lg border-0 rounded-2xl">
              <CardContent className="p-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-8">Mortgage Calculator Tips & Best Practices</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-xl font-bold text-blue-900 mb-4">Smart Tips</h3>
                    <div className="space-y-4">
                      <div className="border-l-4 border-blue-500 pl-4">
                        <p className="text-gray-700">Include all costs (taxes, insurance, PMI) for accurate budgeting</p>
                      </div>
                      <div className="border-l-4 border-blue-500 pl-4">
                        <p className="text-gray-700">Consider different down payment scenarios to find the best option</p>
                      </div>
                      <div className="border-l-4 border-blue-500 pl-4">
                        <p className="text-gray-700">Factor in potential interest rate changes for ARM loans</p>
                      </div>
                      <div className="border-l-4 border-blue-500 pl-4">
                        <p className="text-gray-700">Use current market rates for the most accurate estimates</p>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-xl font-bold text-orange-900 mb-4">Important Considerations</h3>
                    <div className="space-y-4">
                      <div className="border-l-4 border-orange-500 pl-4">
                        <p className="text-gray-700">Remember additional costs like HOA fees and maintenance</p>
                      </div>
                      <div className="border-l-4 border-orange-500 pl-4">
                        <p className="text-gray-700">Property taxes and insurance rates vary by location</p>
                      </div>
                      <div className="border-l-4 border-orange-500 pl-4">
                        <p className="text-gray-700">PMI can be removed once you reach 20% equity</p>
                      </div>
                      <div className="border-l-4 border-orange-500 pl-4">
                        <p className="text-gray-700">Consider your job stability and future income prospects</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* FAQ Section */}
            <Card className="bg-gradient-to-r from-gray-50 to-blue-50 border-0 shadow-lg rounded-2xl">
              <CardContent className="p-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-8">Frequently Asked Questions</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 mb-3">How accurate are mortgage calculator results?</h3>
                      <p className="text-gray-600 leading-relaxed">
                        Mortgage calculators provide very accurate estimates when you input correct information. However, actual rates and terms may vary based on your credit score, debt-to-income ratio, and lender requirements.
                      </p>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 mb-3">What's the difference between principal and interest?</h3>
                      <p className="text-gray-600 leading-relaxed">
                        Principal is the amount you borrowed that goes toward paying down your loan balance. Interest is the cost of borrowing money, charged by the lender as a percentage of the outstanding principal.
                      </p>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 mb-3">Should I put 20% down to avoid PMI?</h3>
                      <p className="text-gray-600 leading-relaxed">
                        While 20% down eliminates PMI, it's not always the best choice. Consider your cash flow, emergency fund, and investment opportunities. Sometimes putting less down and investing the difference might yield better returns.
                      </p>
                    </div>
                  </div>
                  
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 mb-3">How do property taxes affect my payment?</h3>
                      <p className="text-gray-600 leading-relaxed">
                        Property taxes are typically collected monthly by your lender and held in escrow until the annual tax bill is due. Higher property tax rates increase your total monthly payment.
                      </p>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 mb-3">Can I remove PMI later?</h3>
                      <p className="text-gray-600 leading-relaxed">
                        Yes, PMI can typically be removed once you reach 20% equity in your home through payments or appreciation. Some loans automatically cancel PMI at 22% equity.
                      </p>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 mb-3">What's better: 15-year or 30-year mortgage?</h3>
                      <p className="text-gray-600 leading-relaxed">
                        15-year mortgages have higher monthly payments but lower total interest costs. 30-year mortgages offer lower monthly payments but cost more over time. Choose based on your budget and financial goals.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
        
        <Footer />
      </div>
    </>
  );
};

export default MortgageCalculator;