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
        // FHA loans typically have slightly higher rates but lower down payment requirements
        adjustedRate = rate + 0.0025; // 0.25% higher
      } else if (loanType === 'va') {
        // VA loans typically have lower rates
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

                      {/* Loan Type */}
                      <div className="space-y-3">
                        <Label className="text-sm font-medium text-gray-700">Loan Type</Label>
                        <Select value={loanType} onValueChange={setLoanType}>
                          <SelectTrigger className="h-12 border-gray-200 rounded-lg" data-testid="select-loan-type">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="conventional">Conventional</SelectItem>
                            <SelectItem value="fha">FHA (Federal Housing Administration)</SelectItem>
                            <SelectItem value="va">VA (Veterans Affairs)</SelectItem>
                          </SelectContent>
                        </Select>
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
                              disabled={loanType !== 'conventional'}
                            />
                            <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">%</span>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {loanType === 'conventional' 
                              ? 'Applied if down payment is less than 20%' 
                              : loanType === 'fha' 
                                ? 'FHA loans have mandatory mortgage insurance premium (MIP)' 
                                : 'VA loans do not require PMI'}
                          </p>
                        </div>

                        {/* HOA Fees */}
                        <div className="space-y-2">
                          <Label htmlFor="hoa-fees">Monthly HOA Fees</Label>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">$</span>
                            <Input
                              id="hoa-fees"
                              type="number"
                              value={hoaFees}
                              onChange={(e) => setHoaFees(e.target.value)}
                              className="pl-8"
                              placeholder="0"
                              data-testid="input-hoa-fees"
                            />
                          </div>
                        </div>

                        {/* Closing Costs */}
                        <div className="space-y-2">
                          <Label htmlFor="closing-costs">Closing Costs (%)</Label>
                          <div className="relative">
                            <Input
                              id="closing-costs"
                              type="number"
                              value={closingCostPercent}
                              onChange={(e) => setClosingCostPercent(e.target.value)}
                              className="pr-8"
                              placeholder="3"
                              step="0.1"
                              min="0"
                              max="10"
                              data-testid="input-closing-costs"
                            />
                            <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">%</span>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Typically 2-5% of home price
                          </p>
                        </div>
                      </div>

                      {/* Affordability Analysis */}
                      <div className="border-t pt-6 space-y-4">
                        <div className="flex items-center justify-between">
                          <h3 className="text-lg font-semibold">Affordability Analysis</h3>
                          <Button
                            onClick={() => setShowAffordability(!showAffordability)}
                            variant="outline"
                            size="sm"
                            className="text-xs"
                          >
                            {showAffordability ? 'Hide' : 'Show'}
                          </Button>
                        </div>
                        
                        {showAffordability && (
                          <div className="space-y-3">
                            <div className="space-y-2">
                              <Label htmlFor="monthly-income">Monthly Income</Label>
                              <div className="relative">
                                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">$</span>
                                <Input
                                  id="monthly-income"
                                  type="number"
                                  value={monthlyIncome}
                                  onChange={(e) => setMonthlyIncome(e.target.value)}
                                  className="pl-8"
                                  placeholder="8,000"
                                  data-testid="input-monthly-income"
                                />
                              </div>
                              <p className="text-xs text-muted-foreground">
                                Gross monthly income for affordability calculation
                              </p>
                            </div>
                          </div>
                        )}
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
                                <span className="text-gray-600">
                                  {loanType === 'fha' ? 'MIP (Mortgage Insurance)' : 'PMI'}
                                </span>
                                <span className="font-semibold" data-testid="text-pmi">
                                  {formatCurrency(result.monthlyPMI)}
                                </span>
                              </div>
                            )}
                            
                            {result.monthlyHOA > 0 && (
                              <div className="flex justify-between">
                                <span className="text-gray-600">HOA Fees</span>
                                <span className="font-semibold" data-testid="text-hoa">
                                  {formatCurrency(result.monthlyHOA)}
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Cash Requirements */}
                          <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200 mt-4">
                            <h3 className="font-semibold text-yellow-800 mb-3">💰 Cash Needed at Closing</h3>
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span className="text-yellow-700">Down Payment:</span>
                                <span className="font-semibold text-yellow-800">
                                  {formatCurrency(parseFloat(homePrice) * parseFloat(downPaymentPercent) / 100)}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-yellow-700">Closing Costs:</span>
                                <span className="font-semibold text-yellow-800">
                                  {formatCurrency(result.closingCosts)}
                                </span>
                              </div>
                              <div className="border-t border-yellow-300 pt-2 flex justify-between">
                                <span className="text-yellow-700 font-semibold">Total Cash Needed:</span>
                                <span className="font-bold text-yellow-800">
                                  {formatCurrency(result.totalCashNeeded)}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Affordability Analysis */}
                          {result.debtToIncomeRatio && result.debtToIncomeRatio > 0 && (
                            <div className={`rounded-lg p-4 border mt-4 ${
                              result.affordabilityAnalysis.isAffordable 
                                ? 'bg-green-50 border-green-200' 
                                : 'bg-red-50 border-red-200'
                            }`}>
                              <h3 className={`font-semibold mb-3 ${
                                result.affordabilityAnalysis.isAffordable 
                                  ? 'text-green-800' 
                                  : 'text-red-800'
                              }`}>
                                📊 Affordability Analysis
                              </h3>
                              <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                  <span className={result.affordabilityAnalysis.isAffordable ? 'text-green-700' : 'text-red-700'}>
                                    Debt-to-Income Ratio:
                                  </span>
                                  <span className={`font-semibold ${
                                    result.affordabilityAnalysis.isAffordable ? 'text-green-800' : 'text-red-800'
                                  }`}>
                                    {result.debtToIncomeRatio}%
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className={result.affordabilityAnalysis.isAffordable ? 'text-green-700' : 'text-red-700'}>
                                    Max Affordable Price:
                                  </span>
                                  <span className={`font-semibold ${
                                    result.affordabilityAnalysis.isAffordable ? 'text-green-800' : 'text-red-800'
                                  }`}>
                                    {formatCurrency(result.affordabilityAnalysis.maxAffordablePrice)}
                                  </span>
                                </div>
                                <p className={`text-xs mt-2 ${
                                  result.affordabilityAnalysis.isAffordable ? 'text-green-600' : 'text-red-600'
                                }`}>
                                  {result.affordabilityAnalysis.isAffordable 
                                    ? '✅ This home fits within recommended affordability guidelines (28% rule)'
                                    : '⚠️ This home may stretch your budget. Consider a lower price or higher income.'}
                                </p>
                              </div>
                            </div>
                          )}

                          {/* PMI Removal Information */}
                          {result.pmiRemovalDate && (
                            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200 mt-4">
                              <h3 className="font-semibold text-blue-800 mb-3">🏠 PMI Removal Projection</h3>
                              <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                  <span className="text-blue-700">PMI will be removed in:</span>
                                  <span className="font-semibold text-blue-800">
                                    {result.pmiRemovalDate.month}/{result.pmiRemovalDate.year}
                                  </span>
                                </div>
                                <p className="text-xs text-blue-600 mt-2">
                                  PMI is automatically removed when you reach 78% loan-to-value ratio
                                </p>
                              </div>
                            </div>
                          )}

                          {/* Loan Summary */}
                          <div className="border-t pt-4 space-y-3">
                            <div className="flex justify-between">
                              <span className="text-gray-600">Loan Amount</span>
                              <span className="font-semibold" data-testid="text-loan-amount">
                                {formatCurrency(parseFloat(homePrice) - (usePercentage ? parseFloat(homePrice) * parseFloat(downPaymentPercent) / 100 : parseFloat(downPayment)))}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Loan-to-Value Ratio</span>
                              <span className="font-semibold" data-testid="text-ltv">
                                {result.loanToValue}%
                              </span>
                            </div>
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

                  <p className="text-gray-700 mb-6">
                    Our advanced mortgage calculator goes beyond basic calculations to include comprehensive affordability analysis, PMI removal projections, and detailed payment breakdowns. You can also explore related financial tools like our <a href="/tools/loan-calculator" className="text-blue-600 hover:text-blue-700 font-medium">general loan calculator</a> for other types of financing needs, or our <a href="/tools/home-loan-calculator" className="text-blue-600 hover:text-blue-700 font-medium">home loan calculator</a> for specialized home financing scenarios.
                  </p>

                  <div className="bg-blue-50 p-6 rounded-lg mt-6">
                    <h3 className="text-lg font-semibold text-blue-900 mb-3">🏠 Why Use Our Mortgage Calculator?</h3>
                    <ul className="text-blue-800 space-y-2">
                      <li>• <strong>Comprehensive Analysis:</strong> Includes taxes, insurance, and PMI for complete cost assessment</li>
                      <li>• <strong>Multiple Loan Types:</strong> Supports Conventional, FHA, and VA loans with specific calculations</li>
                      <li>• <strong>Affordability Insights:</strong> Debt-to-income analysis and affordability recommendations</li>
                      <li>• <strong>PMI Projections:</strong> Estimates when PMI can be removed based on equity buildup</li>
                      <li>• <strong>Cash Requirements:</strong> Calculates total cash needed at closing including down payment and closing costs</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Who Should Use This Calculator */}
              <div className="mt-8 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl p-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Who Should Use This Mortgage Calculator?</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  <div className="bg-white rounded-lg p-6 shadow-sm">
                    <div className="w-12 h-12 bg-emerald-600 text-white rounded-lg flex items-center justify-center mb-4">
                      <i className="fas fa-graduation-cap"></i>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Recent Graduates & Young Professionals</h3>
                    <p className="text-gray-600 mb-4">
                      Starting your career and considering homeownership? Our mortgage calculator helps you understand what you can afford on your current salary and plan for future home purchases.
                    </p>
                    <div className="text-sm text-emerald-700 bg-emerald-50 p-3 rounded">
                      <strong>Perfect for:</strong> First-time buyers, student loan debt considerations, entry-level salary planning
                    </div>
                  </div>
                  
                  <div className="bg-white rounded-lg p-6 shadow-sm">
                    <div className="w-12 h-12 bg-emerald-600 text-white rounded-lg flex items-center justify-center mb-4">
                      <i className="fas fa-briefcase"></i>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Working Professionals & Families</h3>
                    <p className="text-gray-600 mb-4">
                      Established in your career and ready to upgrade or buy your first family home? Calculate payments for various price ranges and loan terms to find your ideal match.
                    </p>
                    <div className="text-sm text-emerald-700 bg-emerald-50 p-3 rounded">
                      <strong>Perfect for:</strong> Home upgrades, family planning, refinancing existing mortgages
                    </div>
                  </div>
                  
                  <div className="bg-white rounded-lg p-6 shadow-sm">
                    <div className="w-12 h-12 bg-emerald-600 text-white rounded-lg flex items-center justify-center mb-4">
                      <i className="fas fa-building"></i>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Business Owners & Investors</h3>
                    <p className="text-gray-600 mb-4">
                      Evaluating investment properties or need financing for business real estate? Our calculator handles complex scenarios including rental income analysis and investment property calculations.
                    </p>
                    <div className="text-sm text-emerald-700 bg-emerald-50 p-3 rounded">
                      <strong>Perfect for:</strong> Investment properties, commercial real estate, cash flow analysis
                    </div>
                  </div>
                </div>

                <div className="mt-8 bg-white rounded-lg p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Related Financial Planning Tools</h3>
                  <p className="text-gray-600 mb-4">
                    Maximize your financial planning with our comprehensive suite of calculators designed to work together:
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <a href="/tools/loan-calculator" className="text-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <i className="fas fa-calculator text-blue-600 text-xl mb-2"></i>
                      <div className="text-sm font-medium text-gray-900">Loan Calculator</div>
                    </a>
                    <a href="/tools/compound-interest-calculator" className="text-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <i className="fas fa-chart-line text-green-600 text-xl mb-2"></i>
                      <div className="text-sm font-medium text-gray-900">Compound Interest</div>
                    </a>
                    <a href="/tools/debt-payoff-calculator" className="text-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <i className="fas fa-credit-card text-red-600 text-xl mb-2"></i>
                      <div className="text-sm font-medium text-gray-900">Debt Payoff</div>
                    </a>
                    <a href="/tools/savings-goal-calculator" className="text-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <i className="fas fa-piggy-bank text-purple-600 text-xl mb-2"></i>
                      <div className="text-sm font-medium text-gray-900">Savings Goals</div>
                    </a>
                  </div>
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
                        <h3 className="font-semibold text-gray-900 mb-1">Smart Budget Planning</h3>
                        <p className="text-gray-600">Determine how much house you can afford before you start shopping. Use alongside our <a href="/tools/savings-goal-calculator" className="text-green-600 hover:text-green-700 font-medium">savings goal calculator</a> to plan your down payment strategy.</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-3">
                      <i className="fas fa-check-circle text-green-600 mt-1"></i>
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-1">Compare Loan Options</h3>
                        <p className="text-gray-600">Evaluate different loan terms, interest rates, and down payment scenarios. Compare with our <a href="/tools/loan-calculator" className="text-green-600 hover:text-green-700 font-medium">general loan calculator</a> for other financing needs.</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-3">
                      <i className="fas fa-check-circle text-green-600 mt-1"></i>
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-1">Pre-approval Preparation</h3>
                        <p className="text-gray-600">Get realistic payment estimates before meeting with lenders. Strengthen your financial position with our <a href="/tools/debt-payoff-calculator" className="text-green-600 hover:text-green-700 font-medium">debt payoff calculator</a>.</p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3">
                      <i className="fas fa-check-circle text-green-600 mt-1"></i>
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-1">Investment Analysis</h3>
                        <p className="text-gray-600">Evaluate rental property investments and calculate potential returns. Complement with our <a href="/tools/roi-calculator" className="text-green-600 hover:text-green-700 font-medium">ROI calculator</a> for comprehensive investment planning.</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <i className="fas fa-check-circle text-green-600 mt-1"></i>
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-1">Avoid Overextending</h3>
                        <p className="text-gray-600">Ensure monthly payments fit comfortably within your budget using the 28% rule and debt-to-income analysis built into our calculator.</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-3">
                      <i className="fas fa-check-circle text-green-600 mt-1"></i>
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-1">Refinancing Analysis</h3>
                        <p className="text-gray-600">Compare your current mortgage with potential refinancing options to save thousands in interest payments over the loan term.</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-3">
                      <i className="fas fa-check-circle text-green-600 mt-1"></i>
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-1">Long-term Financial Planning</h3>
                        <p className="text-gray-600">Make informed decisions about your largest financial investment. Plan for retirement with our <a href="/tools/retirement-calculator" className="text-green-600 hover:text-green-700 font-medium">retirement calculator</a> while managing mortgage payments.</p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3">
                      <i className="fas fa-check-circle text-green-600 mt-1"></i>
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-1">Tax Planning Benefits</h3>
                        <p className="text-gray-600">Understand the tax implications of mortgage interest deductions and property tax benefits in your financial planning strategy.</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-8 bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-lg">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">💡 Pro Tip: Complete Financial Picture</h3>
                  <p className="text-gray-700 mb-4">
                    For a comprehensive financial analysis, use our mortgage calculator alongside these related tools:
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div className="bg-white p-4 rounded-lg">
                      <strong className="text-gray-900">Monthly Budget:</strong> Factor mortgage payments into your overall budget using our <a href="/tools/percentage-calculator" className="text-green-600 hover:text-green-700">percentage calculator</a> to ensure the 28% housing rule.
                    </div>
                    <div className="bg-white p-4 rounded-lg">
                      <strong className="text-gray-900">Down Payment Savings:</strong> Calculate how long it will take to save for your down payment with our <a href="/tools/compound-interest-calculator" className="text-green-600 hover:text-green-700">compound interest calculator</a>.
                    </div>
                    <div className="bg-white p-4 rounded-lg">
                      <strong className="text-gray-900">Total Cost Analysis:</strong> Consider all homeownership costs including maintenance, utilities, and unexpected expenses for complete budgeting.
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

              {/* Mortgage Education Center */}
              <div className="mt-8 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl p-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Mortgage Education Center</h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                  <div className="bg-white rounded-lg p-6 shadow-sm">
                    <h3 className="text-xl font-semibold text-indigo-900 mb-4">📚 Essential Mortgage Knowledge</h3>
                    <div className="space-y-4">
                      <div className="border-l-4 border-indigo-500 pl-4">
                        <h4 className="font-semibold text-gray-900 mb-1">Loan-to-Value Ratio (LTV)</h4>
                        <p className="text-gray-600 text-sm">Understanding LTV helps you determine PMI requirements and loan approval odds. Lower LTV typically means better rates.</p>
                      </div>
                      <div className="border-l-4 border-indigo-500 pl-4">
                        <h4 className="font-semibold text-gray-900 mb-1">Debt-to-Income Ratio (DTI)</h4>
                        <p className="text-gray-600 text-sm">Lenders use DTI to assess your ability to repay. Use our <a href="/tools/debt-payoff-calculator" className="text-indigo-600 hover:text-indigo-700 font-medium">debt payoff calculator</a> to improve your DTI.</p>
                      </div>
                      <div className="border-l-4 border-indigo-500 pl-4">
                        <h4 className="font-semibold text-gray-900 mb-1">Amortization Schedule</h4>
                        <p className="text-gray-600 text-sm">Early payments go mostly to interest, later payments to principal. Extra payments can significantly reduce total interest paid.</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg p-6 shadow-sm">
                    <h3 className="text-xl font-semibold text-purple-900 mb-4">🏦 Loan Type Comparison</h3>
                    <div className="space-y-4">
                      <div className="bg-purple-50 p-4 rounded-lg">
                        <h4 className="font-semibold text-purple-900 mb-2">Conventional Loans</h4>
                        <p className="text-purple-800 text-sm">Best for borrowers with good credit (620+) and ability to put down 5-20%. No upfront mortgage insurance premium.</p>
                      </div>
                      <div className="bg-purple-50 p-4 rounded-lg">
                        <h4 className="font-semibold text-purple-900 mb-2">FHA Loans</h4>
                        <p className="text-purple-800 text-sm">Great for first-time buyers with lower credit scores (580+). Only 3.5% down required, but includes mortgage insurance.</p>
                      </div>
                      <div className="bg-purple-50 p-4 rounded-lg">
                        <h4 className="font-semibold text-purple-900 mb-2">VA Loans</h4>
                        <p className="text-purple-800 text-sm">Exclusive to veterans and service members. No down payment or PMI required, competitive interest rates.</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">🔗 Complete Your Financial Planning</h3>
                  <p className="text-gray-600 mb-6">
                    Mortgage planning is just one part of your financial journey. Explore these related calculators to build a comprehensive financial strategy:
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    <a href="/tools/home-loan-calculator" className="text-center p-3 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors">
                      <i className="fas fa-home text-indigo-600 text-lg mb-2"></i>
                      <div className="text-xs font-medium text-gray-900">Home Loans</div>
                    </a>
                    <a href="/tools/car-loan-calculator" className="text-center p-3 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors">
                      <i className="fas fa-car text-indigo-600 text-lg mb-2"></i>
                      <div className="text-xs font-medium text-gray-900">Auto Loans</div>
                    </a>
                    <a href="/tools/business-loan-calculator" className="text-center p-3 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors">
                      <i className="fas fa-briefcase text-indigo-600 text-lg mb-2"></i>
                      <div className="text-xs font-medium text-gray-900">Business</div>
                    </a>
                    <a href="/tools/investment-return-calculator" className="text-center p-3 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors">
                      <i className="fas fa-chart-line text-indigo-600 text-lg mb-2"></i>
                      <div className="text-xs font-medium text-gray-900">Investments</div>
                    </a>
                    <a href="/tools/retirement-calculator" className="text-center p-3 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors">
                      <i className="fas fa-umbrella-beach text-indigo-600 text-lg mb-2"></i>
                      <div className="text-xs font-medium text-gray-900">Retirement</div>
                    </a>
                    <a href="/tools/net-worth-calculator" className="text-center p-3 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors">
                      <i className="fas fa-coins text-indigo-600 text-lg mb-2"></i>
                      <div className="text-xs font-medium text-gray-900">Net Worth</div>
                    </a>
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
                      <p className="text-gray-600">Mortgage calculators provide very accurate estimates when you input correct information. However, actual rates and terms may vary based on your credit score, debt-to-income ratio, and lender requirements. Use our <a href="/tools/credit-card-interest-calculator" className="text-blue-600 hover:text-blue-700 font-medium">credit card interest calculator</a> to optimize your credit utilization before applying.</p>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">What's the difference between principal and interest?</h3>
                      <p className="text-gray-600">Principal is the amount you borrowed that goes toward paying down your loan balance. Interest is the cost of borrowing money, charged by the lender as a percentage of the outstanding principal. Understanding this helps you see how extra payments can save thousands in interest.</p>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Should I put 20% down to avoid PMI?</h3>
                      <p className="text-gray-600">While 20% down eliminates PMI, it's not always the best choice. Consider your cash flow, emergency fund, and investment opportunities. Use our <a href="/tools/compound-interest-calculator" className="text-blue-600 hover:text-blue-700 font-medium">compound interest calculator</a> to see if investing the extra money might yield better returns.</p>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">How do I calculate total homeownership costs?</h3>
                      <p className="text-gray-600">Beyond mortgage payments, factor in maintenance (1-3% of home value annually), utilities, HOA fees, and potential repairs. Our mortgage calculator includes taxes and insurance, but budget additional funds for complete cost coverage.</p>
                    </div>
                  </div>
                  
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">How do property taxes affect my payment?</h3>
                      <p className="text-gray-600">Property taxes are typically collected monthly by your lender and held in escrow until the annual tax bill is due. Higher property tax rates increase your total monthly payment. Research local tax rates as they vary significantly by location.</p>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Can I remove PMI later?</h3>
                      <p className="text-gray-600">Yes, PMI can typically be removed once you reach 20% equity in your home through payments or appreciation. Some loans automatically cancel PMI at 22% equity. Our calculator shows projected PMI removal dates for planning purposes.</p>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">What's better: 15-year or 30-year mortgage?</h3>
                      <p className="text-gray-600">15-year mortgages have higher monthly payments but lower total interest costs and faster equity building. 30-year mortgages offer lower monthly payments but cost more over time. Choose based on your budget and long-term financial goals.</p>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">When should I consider refinancing?</h3>
                      <p className="text-gray-600">Consider refinancing when rates drop 0.5-0.75% below your current rate, your credit has improved significantly, or you want to change loan terms. Calculate potential savings including closing costs to determine if refinancing makes sense.</p>
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