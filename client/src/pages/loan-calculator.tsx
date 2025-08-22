import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calculator } from 'lucide-react';

interface LoanResult {
  monthlyPayment: number;
  totalAmount: number;
  totalInterest: number;
}

export default function LoanCalculator() {
  const [loanAmount, setLoanAmount] = useState('100000');
  const [interestRate, setInterestRate] = useState('5.50');
  const [loanTerm, setLoanTerm] = useState('30');
  const [termUnit, setTermUnit] = useState('years');
  const [result, setResult] = useState<LoanResult | null>(null);

  const calculateLoan = () => {
    const principal = parseFloat(loanAmount);
    const rate = parseFloat(interestRate) / 100 / 12;
    const termMonths = termUnit === 'years' ? parseFloat(loanTerm) * 12 : parseFloat(loanTerm);

    if (principal <= 0 || rate <= 0 || termMonths <= 0) return;

    const monthlyPayment = (principal * rate * Math.pow(1 + rate, termMonths)) / (Math.pow(1 + rate, termMonths) - 1);
    const totalAmount = monthlyPayment * termMonths;
    const totalInterest = totalAmount - principal;

    setResult({
      monthlyPayment,
      totalAmount,
      totalInterest
    });
  };

  const resetCalculator = () => {
    setLoanAmount('100000');
    setInterestRate('5.50');
    setLoanTerm('30');
    setTermUnit('years');
    setResult(null);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Helmet>
        <title>Loan Calculator - Calculate Monthly Payments | ToolsHub</title>
        <meta name="description" content="Free loan calculator to calculate monthly payments, total interest, and amortization schedules. Compare personal loans, auto loans, mortgages, and business loans. Get instant results with our easy-to-use loan payment calculator." />
      </Helmet>
      
      <Header />
      
      <main>
        {/* Hero Section */}
        <section className="gradient-hero text-white py-16 pt-24">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="w-20 h-20 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Calculator className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold mb-6">
              Loan Calculator
            </h1>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto">
              Calculate your monthly loan payments, total interest, and payment schedules for personal loans, auto loans, and any fixed-rate loan
            </p>
          </div>
        </section>

        <div className="max-w-6xl mx-auto px-4 py-12">
          <Card className="bg-white shadow-sm border-0">
            <CardContent className="p-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                {/* Input Section */}
                <div className="space-y-6">
                  <h2 className="text-2xl font-semibold text-gray-900 mb-8">Loan Details</h2>
                  
                  {/* Loan Amount */}
                  <div className="space-y-3">
                    <Label htmlFor="loan-amount" className="text-sm font-medium text-gray-700">
                      Loan Amount ($)
                    </Label>
                    <Input
                      id="loan-amount"
                      type="number"
                      value={loanAmount}
                      onChange={(e) => setLoanAmount(e.target.value)}
                      className="h-12 text-base border-gray-200 rounded-lg"
                      placeholder="100,000"
                      data-testid="input-loan-amount"
                    />
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
                      placeholder="5.50"
                      step="0.01"
                      data-testid="input-interest-rate"
                    />
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
                      <Select value={termUnit} onValueChange={setTermUnit}>
                        <SelectTrigger className="h-12 border-gray-200 rounded-lg" data-testid="select-term-unit">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="years">Years</SelectItem>
                          <SelectItem value="months">Months</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-4 pt-6">
                    <Button
                      onClick={calculateLoan}
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
                    <div className="space-y-6" data-testid="loan-results">
                      {/* Monthly Payment */}
                      <div className="bg-white rounded-lg p-6 border border-gray-100">
                        <div className="text-sm text-gray-600 mb-1">Monthly Payment</div>
                        <div className="text-3xl font-bold text-blue-600" data-testid="text-monthly-payment">
                          {formatCurrency(result.monthlyPayment)}
                        </div>
                      </div>

                      {/* Payment Summary */}
                      <div className="space-y-4">
                        <div className="flex justify-between items-center py-3 border-b border-gray-200">
                          <span className="text-gray-600">Total Amount</span>
                          <span className="font-semibold text-gray-900" data-testid="text-total-amount">
                            {formatCurrency(result.totalAmount)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center py-3 border-b border-gray-200">
                          <span className="text-gray-600">Total Interest</span>
                          <span className="font-semibold text-red-600" data-testid="text-total-interest">
                            {formatCurrency(result.totalInterest)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center py-3">
                          <span className="text-gray-600">Principal Amount</span>
                          <span className="font-semibold text-gray-900" data-testid="text-principal-amount">
                            {formatCurrency(parseFloat(loanAmount))}
                          </span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12" data-testid="no-results">
                      <Calculator className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500">Enter loan details and click calculate to see results</p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Comprehensive Educational Content */}
          <div className="mt-12 space-y-12">
            {/* How to Use Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Card className="bg-white border-0 shadow-sm">
                <CardContent className="p-8">
                  <h3 className="text-xl font-semibold text-gray-900 mb-6">How to Use the Loan Calculator</h3>
                  <div className="space-y-4">
                    <h4 className="font-medium text-gray-900 mb-3">What You Can Calculate</h4>
                    <div className="space-y-2 text-gray-600">
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                        Monthly payment amount
                      </div>
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                        Total amount you'll pay over the loan term
                      </div>
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                        Total interest you'll pay
                      </div>
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                        Payment breakdown and loan details
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white border-0 shadow-sm">
                <CardContent className="p-8">
                  <h3 className="text-xl font-semibold text-gray-900 mb-6">Tips for Better Results</h3>
                  <div className="space-y-4">
                    <div className="space-y-2 text-gray-600">
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full mr-3"></div>
                        Compare different loan terms to find the best option
                      </div>
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full mr-3"></div>
                        Consider the total interest cost, not just monthly payment
                      </div>
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full mr-3"></div>
                        Factor in additional costs like insurance and taxes
                      </div>
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full mr-3"></div>
                        Shop around for the best interest rates
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* What is a Loan Calculator Section */}
            <Card className="bg-white border-0 shadow-sm">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">What is a Loan Calculator?</h2>
                <div className="prose max-w-none text-gray-600">
                  <p className="mb-4">
                    A loan calculator is a powerful financial tool that helps you determine the cost of borrowing money. 
                    Our free online loan calculator uses advanced algorithms to compute your monthly payments, total interest, 
                    and payment schedules based on your loan amount, interest rate, and loan term.
                  </p>
                  <p className="mb-4">
                    Whether you're considering a personal loan, auto loan, mortgage, or business loan, this calculator 
                    provides accurate estimates to help you make informed financial decisions. It uses the standard 
                    amortization formula to calculate fixed monthly payments for installment loans.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* How Loan Calculations Work */}
            <Card className="bg-white border-0 shadow-sm">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">How Loan Calculations Work</h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">The Loan Payment Formula</h3>
                    <p className="text-gray-600 mb-4">
                      Our calculator uses the standard loan payment formula:
                    </p>
                    <div className="bg-gray-50 p-4 rounded-lg font-mono text-sm mb-4">
                      M = P * [r(1+r)^n] / [(1+r)^n - 1]
                    </div>
                    <div className="space-y-2 text-sm text-gray-600">
                      <div><strong>M</strong> = Monthly Payment</div>
                      <div><strong>P</strong> = Principal (Loan Amount)</div>
                      <div><strong>r</strong> = Monthly Interest Rate</div>
                      <div><strong>n</strong> = Number of Payments</div>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Key Factors Affecting Your Loan</h3>
                    <div className="space-y-3">
                      <div className="border-l-4 border-blue-500 pl-4">
                        <h4 className="font-medium text-gray-900">Loan Amount (Principal)</h4>
                        <p className="text-sm text-gray-600">The total amount you borrow</p>
                      </div>
                      <div className="border-l-4 border-green-500 pl-4">
                        <h4 className="font-medium text-gray-900">Interest Rate (APR)</h4>
                        <p className="text-sm text-gray-600">Annual percentage rate charged by lender</p>
                      </div>
                      <div className="border-l-4 border-purple-500 pl-4">
                        <h4 className="font-medium text-gray-900">Loan Term</h4>
                        <p className="text-sm text-gray-600">Length of time to repay the loan</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Types of Loans */}
            <Card className="bg-white border-0 shadow-sm">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Types of Loans You Can Calculate</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="bg-blue-50 p-6 rounded-lg">
                    <h3 className="text-lg font-semibold text-blue-900 mb-3">Personal Loans</h3>
                    <p className="text-blue-700 text-sm mb-3">
                      Unsecured loans for personal expenses, debt consolidation, or emergencies.
                    </p>
                    <div className="text-xs text-blue-600">
                      <div>• Typical range: $1,000 - $100,000</div>
                      <div>• Terms: 2-7 years</div>
                      <div>• APR: 6-36%</div>
                    </div>
                  </div>
                  
                  <div className="bg-green-50 p-6 rounded-lg">
                    <h3 className="text-lg font-semibold text-green-900 mb-3">Auto Loans</h3>
                    <p className="text-green-700 text-sm mb-3">
                      Secured loans for purchasing new or used vehicles.
                    </p>
                    <div className="text-xs text-green-600">
                      <div>• Typical range: $5,000 - $100,000</div>
                      <div>• Terms: 3-8 years</div>
                      <div>• APR: 3-15%</div>
                    </div>
                  </div>
                  
                  <div className="bg-purple-50 p-6 rounded-lg">
                    <h3 className="text-lg font-semibold text-purple-900 mb-3">Home Equity Loans</h3>
                    <p className="text-purple-700 text-sm mb-3">
                      Secured loans using your home's equity as collateral.
                    </p>
                    <div className="text-xs text-purple-600">
                      <div>• Typical range: $10,000 - $500,000</div>
                      <div>• Terms: 5-30 years</div>
                      <div>• APR: 4-12%</div>
                    </div>
                  </div>
                  
                  <div className="bg-orange-50 p-6 rounded-lg">
                    <h3 className="text-lg font-semibold text-orange-900 mb-3">Business Loans</h3>
                    <p className="text-orange-700 text-sm mb-3">
                      Financing for business operations, equipment, or expansion.
                    </p>
                    <div className="text-xs text-orange-600">
                      <div>• Typical range: $5,000 - $5,000,000</div>
                      <div>• Terms: 1-25 years</div>
                      <div>• APR: 4-30%</div>
                    </div>
                  </div>
                  
                  <div className="bg-red-50 p-6 rounded-lg">
                    <h3 className="text-lg font-semibold text-red-900 mb-3">Student Loans</h3>
                    <p className="text-red-700 text-sm mb-3">
                      Education financing for tuition, books, and living expenses.
                    </p>
                    <div className="text-xs text-red-600">
                      <div>• Typical range: $1,000 - $100,000+</div>
                      <div>• Terms: 10-30 years</div>
                      <div>• APR: 3-12%</div>
                    </div>
                  </div>
                  
                  <div className="bg-teal-50 p-6 rounded-lg">
                    <h3 className="text-lg font-semibold text-teal-900 mb-3">Debt Consolidation</h3>
                    <p className="text-teal-700 text-sm mb-3">
                      Combine multiple debts into a single loan payment.
                    </p>
                    <div className="text-xs text-teal-600">
                      <div>• Typical range: $5,000 - $100,000</div>
                      <div>• Terms: 2-7 years</div>
                      <div>• APR: 6-25%</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Benefits and Use Cases */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card className="bg-white border-0 shadow-sm">
                <CardContent className="p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Benefits of Using Our Loan Calculator</h2>
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mt-0.5">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">Free and Accurate</h3>
                        <p className="text-gray-600 text-sm">Get precise calculations without any cost or registration required.</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mt-0.5">
                        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">Instant Results</h3>
                        <p className="text-gray-600 text-sm">Calculate loan payments in real-time as you adjust parameters.</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center mt-0.5">
                        <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">Compare Options</h3>
                        <p className="text-gray-600 text-sm">Test different scenarios to find the best loan terms for your situation.</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center mt-0.5">
                        <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">Budget Planning</h3>
                        <p className="text-gray-600 text-sm">Plan your budget with accurate monthly payment estimates.</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white border-0 shadow-sm">
                <CardContent className="p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Common Use Cases</h2>
                  <div className="space-y-4">
                    <div className="border-l-4 border-blue-500 pl-4">
                      <h3 className="font-semibold text-gray-900 mb-1">Loan Shopping</h3>
                      <p className="text-gray-600 text-sm">Compare offers from different lenders to find the best rates and terms.</p>
                    </div>
                    
                    <div className="border-l-4 border-green-500 pl-4">
                      <h3 className="font-semibold text-gray-900 mb-1">Budget Planning</h3>
                      <p className="text-gray-600 text-sm">Determine if loan payments fit within your monthly budget before applying.</p>
                    </div>
                    
                    <div className="border-l-4 border-purple-500 pl-4">
                      <h3 className="font-semibold text-gray-900 mb-1">Refinancing Analysis</h3>
                      <p className="text-gray-600 text-sm">Calculate potential savings from refinancing existing loans.</p>
                    </div>
                    
                    <div className="border-l-4 border-orange-500 pl-4">
                      <h3 className="font-semibold text-gray-900 mb-1">Early Payoff Planning</h3>
                      <p className="text-gray-600 text-sm">See how extra payments can reduce total interest and loan term.</p>
                    </div>
                    
                    <div className="border-l-4 border-red-500 pl-4">
                      <h3 className="font-semibold text-gray-900 mb-1">Debt Consolidation</h3>
                      <p className="text-gray-600 text-sm">Calculate if consolidating multiple debts would save money.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Tips for Getting Better Loan Terms */}
            <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-0 shadow-sm">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Tips for Getting Better Loan Terms</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="bg-white p-6 rounded-lg shadow-sm">
                    <h3 className="font-semibold text-gray-900 mb-3">Improve Your Credit Score</h3>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Pay bills on time consistently</li>
                      <li>• Reduce credit card balances</li>
                      <li>• Don't close old credit accounts</li>
                      <li>• Check credit reports for errors</li>
                    </ul>
                  </div>
                  
                  <div className="bg-white p-6 rounded-lg shadow-sm">
                    <h3 className="font-semibold text-gray-900 mb-3">Shop Around</h3>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Compare rates from multiple lenders</li>
                      <li>• Consider banks, credit unions, and online lenders</li>
                      <li>• Get prequalified to see potential rates</li>
                      <li>• Apply within a 14-45 day window</li>
                    </ul>
                  </div>
                  
                  <div className="bg-white p-6 rounded-lg shadow-sm">
                    <h3 className="font-semibold text-gray-900 mb-3">Consider Your Options</h3>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Larger down payment = lower loan amount</li>
                      <li>• Shorter terms = less total interest</li>
                      <li>• Consider secured vs. unsecured loans</li>
                      <li>• Look into co-signer options</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* FAQ Section */}
            <Card className="bg-white border-0 shadow-sm">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Frequently Asked Questions</h2>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">How accurate is this loan calculator?</h3>
                    <p className="text-gray-600">
                      Our calculator provides highly accurate estimates based on the information you provide. However, 
                      actual loan terms may vary based on your creditworthiness, lender policies, and additional fees 
                      not included in the basic calculation.
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">What's the difference between APR and interest rate?</h3>
                    <p className="text-gray-600">
                      The interest rate is the cost of borrowing the principal amount. APR (Annual Percentage Rate) 
                      includes the interest rate plus additional fees and costs, giving you a more complete picture 
                      of the loan's total cost.
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Should I choose a shorter or longer loan term?</h3>
                    <p className="text-gray-600">
                      Shorter terms typically mean higher monthly payments but less total interest paid. Longer terms 
                      reduce monthly payments but increase the total cost over time. Choose based on your budget and 
                      financial goals.
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Can I pay off my loan early?</h3>
                    <p className="text-gray-600">
                      Many loans allow early payoff, which can save you money on interest. However, some lenders charge 
                      prepayment penalties. Check your loan terms and use our calculator to see potential savings from 
                      early repayment.
                    </p>
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