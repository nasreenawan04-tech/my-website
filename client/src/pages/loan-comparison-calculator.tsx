
import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Calculator, DollarSign, Percent, Calendar, TrendingUp, Info, BarChart3, PieChart } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ToolHeroSection from '@/components/ToolHeroSection';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface LoanComparison {
  loanAmount: number;
  interestRate: number;
  tenure: number;
  emi: number;
  totalInterest: number;
  totalAmount: number;
}

const LoanComparisonCalculator = () => {
  const [loan1, setLoan1] = useState({
    amount: 500000,
    rate: 8.5,
    tenure: 240 // months
  });

  const [loan2, setLoan2] = useState({
    amount: 500000,
    rate: 9.0,
    tenure: 240 // months
  });

  const [loan3, setLoan3] = useState({
    amount: 500000,
    rate: 8.0,
    tenure: 240 // months
  });

  const [comparisons, setComparisons] = useState<LoanComparison[]>([]);

  const calculateLoan = (amount: number, rate: number, tenure: number): LoanComparison => {
    const monthlyRate = rate / 100 / 12;
    const emi = (amount * monthlyRate * Math.pow(1 + monthlyRate, tenure)) / 
                 (Math.pow(1 + monthlyRate, tenure) - 1);
    const totalAmount = emi * tenure;
    const totalInterest = totalAmount - amount;

    return {
      loanAmount: amount,
      interestRate: rate,
      tenure,
      emi,
      totalInterest,
      totalAmount
    };
  };

  useEffect(() => {
    const comparison1 = calculateLoan(loan1.amount, loan1.rate, loan1.tenure);
    const comparison2 = calculateLoan(loan2.amount, loan2.rate, loan2.tenure);
    const comparison3 = calculateLoan(loan3.amount, loan3.rate, loan3.tenure);
    
    setComparisons([comparison1, comparison2, comparison3]);
  }, [loan1, loan2, loan3]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getBestLoan = () => {
    return comparisons.reduce((best, current, index) => {
      if (current.totalAmount < comparisons[best].totalAmount) {
        return index;
      }
      return best;
    }, 0);
  };

  const bestLoanIndex = getBestLoan();

  return (
    <>
      <Helmet>
        <title>Loan Comparison Calculator - Compare Multiple Loan Offers | DapsiWow</title>
        <meta name="description" content="Compare up to 3 loan offers side-by-side. Calculate EMI, total interest, and find the best loan deal with our comprehensive loan comparison calculator." />
        <meta name="keywords" content="loan comparison calculator, compare loans, EMI calculator, best loan rates, loan analysis, personal loan comparison" />
        <meta property="og:title" content="Loan Comparison Calculator - Compare Multiple Loan Offers | DapsiWow" />
        <meta property="og:description" content="Compare up to 3 loan offers side-by-side. Calculate EMI, total interest, and find the best loan deal." />
        <meta property="og:type" content="website" />
        <link rel="canonical" href="https://dapsiwow.com/tools/loan-comparison-calculator" />
      </Helmet>

      <div className="min-h-screen flex flex-col" data-testid="page-loan-comparison-calculator">
        <Header />
        
        <ToolHeroSection
          title="Loan Comparison Calculator"
          description="Compare multiple loan offers side-by-side to find the best deal. Analyze EMI, total interest, and overall cost to make informed financial decisions."
        />

        <main className="flex-1 bg-neutral-50 py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
              {/* Loan 1 */}
              <Card className="shadow-lg">
                <CardHeader className="bg-blue-50">
                  <CardTitle className="flex items-center gap-2 text-blue-700">
                    <Calculator className="w-5 h-5" />
                    Loan Option 1
                  </CardTitle>
                  <CardDescription>Enter details for first loan offer</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 pt-6">
                  <div>
                    <Label htmlFor="loan1-amount">Loan Amount (₹)</Label>
                    <Input
                      id="loan1-amount"
                      type="number"
                      value={loan1.amount}
                      onChange={(e) => setLoan1(prev => ({ ...prev, amount: Number(e.target.value) }))}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="loan1-rate">Interest Rate (%)</Label>
                    <Input
                      id="loan1-rate"
                      type="number"
                      step="0.1"
                      value={loan1.rate}
                      onChange={(e) => setLoan1(prev => ({ ...prev, rate: Number(e.target.value) }))}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="loan1-tenure">Tenure (Years)</Label>
                    <Input
                      id="loan1-tenure"
                      type="number"
                      value={loan1.tenure / 12}
                      onChange={(e) => setLoan1(prev => ({ ...prev, tenure: Number(e.target.value) * 12 }))}
                      className="mt-1"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Loan 2 */}
              <Card className="shadow-lg">
                <CardHeader className="bg-green-50">
                  <CardTitle className="flex items-center gap-2 text-green-700">
                    <Calculator className="w-5 h-5" />
                    Loan Option 2
                  </CardTitle>
                  <CardDescription>Enter details for second loan offer</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 pt-6">
                  <div>
                    <Label htmlFor="loan2-amount">Loan Amount (₹)</Label>
                    <Input
                      id="loan2-amount"
                      type="number"
                      value={loan2.amount}
                      onChange={(e) => setLoan2(prev => ({ ...prev, amount: Number(e.target.value) }))}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="loan2-rate">Interest Rate (%)</Label>
                    <Input
                      id="loan2-rate"
                      type="number"
                      step="0.1"
                      value={loan2.rate}
                      onChange={(e) => setLoan2(prev => ({ ...prev, rate: Number(e.target.value) }))}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="loan2-tenure">Tenure (Years)</Label>
                    <Input
                      id="loan2-tenure"
                      type="number"
                      value={loan2.tenure / 12}
                      onChange={(e) => setLoan2(prev => ({ ...prev, tenure: Number(e.target.value) * 12 }))}
                      className="mt-1"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Loan 3 */}
              <Card className="shadow-lg">
                <CardHeader className="bg-purple-50">
                  <CardTitle className="flex items-center gap-2 text-purple-700">
                    <Calculator className="w-5 h-5" />
                    Loan Option 3
                  </CardTitle>
                  <CardDescription>Enter details for third loan offer</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 pt-6">
                  <div>
                    <Label htmlFor="loan3-amount">Loan Amount (₹)</Label>
                    <Input
                      id="loan3-amount"
                      type="number"
                      value={loan3.amount}
                      onChange={(e) => setLoan3(prev => ({ ...prev, amount: Number(e.target.value) }))}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="loan3-rate">Interest Rate (%)</Label>
                    <Input
                      id="loan3-rate"
                      type="number"
                      step="0.1"
                      value={loan3.rate}
                      onChange={(e) => setLoan3(prev => ({ ...prev, rate: Number(e.target.value) }))}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="loan3-tenure">Tenure (Years)</Label>
                    <Input
                      id="loan3-tenure"
                      type="number"
                      value={loan3.tenure / 12}
                      onChange={(e) => setLoan3(prev => ({ ...prev, tenure: Number(e.target.value) * 12 }))}
                      className="mt-1"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Results Section */}
            <Card className="shadow-xl mb-12">
              <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                <CardTitle className="flex items-center gap-2 text-xl">
                  <BarChart3 className="w-6 h-6" />
                  Loan Comparison Results
                </CardTitle>
                <CardDescription className="text-blue-100">
                  Compare all loan options side-by-side
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Details</th>
                        <th className="px-6 py-4 text-center text-sm font-semibold text-blue-700">Loan Option 1</th>
                        <th className="px-6 py-4 text-center text-sm font-semibold text-green-700">Loan Option 2</th>
                        <th className="px-6 py-4 text-center text-sm font-semibold text-purple-700">Loan Option 3</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      <tr>
                        <td className="px-6 py-4 font-medium text-gray-900">Loan Amount</td>
                        <td className="px-6 py-4 text-center">{formatCurrency(comparisons[0]?.loanAmount || 0)}</td>
                        <td className="px-6 py-4 text-center">{formatCurrency(comparisons[1]?.loanAmount || 0)}</td>
                        <td className="px-6 py-4 text-center">{formatCurrency(comparisons[2]?.loanAmount || 0)}</td>
                      </tr>
                      <tr className="bg-gray-50">
                        <td className="px-6 py-4 font-medium text-gray-900">Interest Rate</td>
                        <td className="px-6 py-4 text-center">{comparisons[0]?.interestRate.toFixed(2)}%</td>
                        <td className="px-6 py-4 text-center">{comparisons[1]?.interestRate.toFixed(2)}%</td>
                        <td className="px-6 py-4 text-center">{comparisons[2]?.interestRate.toFixed(2)}%</td>
                      </tr>
                      <tr>
                        <td className="px-6 py-4 font-medium text-gray-900">Tenure</td>
                        <td className="px-6 py-4 text-center">{(comparisons[0]?.tenure || 0) / 12} years</td>
                        <td className="px-6 py-4 text-center">{(comparisons[1]?.tenure || 0) / 12} years</td>
                        <td className="px-6 py-4 text-center">{(comparisons[2]?.tenure || 0) / 12} years</td>
                      </tr>
                      <tr className="bg-blue-50 font-semibold">
                        <td className="px-6 py-4 font-bold text-gray-900">Monthly EMI</td>
                        <td className={`px-6 py-4 text-center ${bestLoanIndex === 0 ? 'text-green-600 font-bold' : ''}`}>
                          {formatCurrency(comparisons[0]?.emi || 0)}
                          {bestLoanIndex === 0 && <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">BEST</span>}
                        </td>
                        <td className={`px-6 py-4 text-center ${bestLoanIndex === 1 ? 'text-green-600 font-bold' : ''}`}>
                          {formatCurrency(comparisons[1]?.emi || 0)}
                          {bestLoanIndex === 1 && <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">BEST</span>}
                        </td>
                        <td className={`px-6 py-4 text-center ${bestLoanIndex === 2 ? 'text-green-600 font-bold' : ''}`}>
                          {formatCurrency(comparisons[2]?.emi || 0)}
                          {bestLoanIndex === 2 && <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">BEST</span>}
                        </td>
                      </tr>
                      <tr>
                        <td className="px-6 py-4 font-medium text-gray-900">Total Interest</td>
                        <td className="px-6 py-4 text-center text-red-600">{formatCurrency(comparisons[0]?.totalInterest || 0)}</td>
                        <td className="px-6 py-4 text-center text-red-600">{formatCurrency(comparisons[1]?.totalInterest || 0)}</td>
                        <td className="px-6 py-4 text-center text-red-600">{formatCurrency(comparisons[2]?.totalInterest || 0)}</td>
                      </tr>
                      <tr className="bg-yellow-50 font-semibold text-lg">
                        <td className="px-6 py-4 font-bold text-gray-900">Total Amount Payable</td>
                        <td className={`px-6 py-4 text-center ${bestLoanIndex === 0 ? 'text-green-600 font-bold' : ''}`}>
                          {formatCurrency(comparisons[0]?.totalAmount || 0)}
                        </td>
                        <td className={`px-6 py-4 text-center ${bestLoanIndex === 1 ? 'text-green-600 font-bold' : ''}`}>
                          {formatCurrency(comparisons[1]?.totalAmount || 0)}
                        </td>
                        <td className={`px-6 py-4 text-center ${bestLoanIndex === 2 ? 'text-green-600 font-bold' : ''}`}>
                          {formatCurrency(comparisons[2]?.totalAmount || 0)}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Best Loan Alert */}
            <Alert className="mb-12 border-green-200 bg-green-50">
              <TrendingUp className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                <strong>Recommendation:</strong> Loan Option {bestLoanIndex + 1} offers the best deal with the lowest total amount payable of{' '}
                <strong>{formatCurrency(comparisons[bestLoanIndex]?.totalAmount || 0)}</strong>.
                You'll save{' '}
                <strong>
                  {formatCurrency(
                    Math.max(...comparisons.map(c => c.totalAmount)) - (comparisons[bestLoanIndex]?.totalAmount || 0)
                  )}
                </strong>{' '}
                compared to the most expensive option.
              </AlertDescription>
            </Alert>

            {/* Educational Content */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Info className="w-5 h-5 text-blue-600" />
                    How to Use This Calculator
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">1</div>
                      <div>
                        <h4 className="font-semibold">Enter Loan Details</h4>
                        <p className="text-sm text-gray-600">Input the loan amount, interest rate, and tenure for each loan option you want to compare.</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">2</div>
                      <div>
                        <h4 className="font-semibold">Compare Results</h4>
                        <p className="text-sm text-gray-600">Review the comparison table to see EMI, total interest, and total amount for each loan.</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">3</div>
                      <div>
                        <h4 className="font-semibold">Make Decision</h4>
                        <p className="text-sm text-gray-600">Choose the loan with the lowest total amount or the EMI that fits your budget.</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChart className="w-5 h-5 text-green-600" />
                    Factors to Consider
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div>
                      <h4 className="font-semibold text-green-700">Interest Rate</h4>
                      <p className="text-sm text-gray-600">Lower interest rates mean lower total cost, but consider if the rate is fixed or floating.</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-blue-700">Processing Fees</h4>
                      <p className="text-sm text-gray-600">Factor in processing fees, documentation charges, and other hidden costs.</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-purple-700">Prepayment Options</h4>
                      <p className="text-sm text-gray-600">Check if the lender allows prepayment without penalties to save on interest.</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-orange-700">Customer Service</h4>
                      <p className="text-sm text-gray-600">Consider the lender's reputation, customer service quality, and loan processing time.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* SEO Content */}
            <div className="bg-white rounded-lg shadow-lg p-8 mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Complete Guide to Loan Comparison</h2>
              
              <div className="prose max-w-none">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">What is a Loan Comparison Calculator?</h3>
                <p className="text-gray-600 mb-6">
                  A loan comparison calculator is a powerful financial tool that helps you evaluate multiple loan offers side-by-side. 
                  By comparing key factors like EMI, total interest, and overall cost, you can make an informed decision about which 
                  loan option best suits your financial needs and budget constraints.
                </p>

                <h3 className="text-xl font-semibold text-gray-800 mb-4">Benefits of Using Our Loan Comparison Tool</h3>
                <ul className="list-disc list-inside text-gray-600 mb-6 space-y-2">
                  <li><strong>Save Money:</strong> Identify the loan with the lowest total cost and potential savings</li>
                  <li><strong>Save Time:</strong> Compare multiple offers instantly without manual calculations</li>
                  <li><strong>Better Decision Making:</strong> Make data-driven choices based on comprehensive analysis</li>
                  <li><strong>Budget Planning:</strong> Choose EMI amounts that fit comfortably within your budget</li>
                  <li><strong>Transparency:</strong> See exactly how much you'll pay in interest over the loan term</li>
                </ul>

                <h3 className="text-xl font-semibold text-gray-800 mb-4">Key Factors in Loan Comparison</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <h4 className="font-semibold text-blue-700 mb-2">Interest Rates</h4>
                    <p className="text-sm text-gray-600">
                      The interest rate directly impacts your EMI and total cost. Even a 0.5% difference can save thousands over the loan term.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-green-700 mb-2">Loan Tenure</h4>
                    <p className="text-sm text-gray-600">
                      Longer tenure means lower EMI but higher total interest. Shorter tenure increases EMI but reduces overall cost.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-purple-700 mb-2">Processing Fees</h4>
                    <p className="text-sm text-gray-600">
                      Include all upfront costs like processing fees, documentation charges, and insurance premiums in your comparison.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-orange-700 mb-2">Prepayment Terms</h4>
                    <p className="text-sm text-gray-600">
                      Loans with flexible prepayment options without penalties can help you save significantly on interest.
                    </p>
                  </div>
                </div>

                <h3 className="text-xl font-semibold text-gray-800 mb-4">Tips for Choosing the Best Loan</h3>
                <ol className="list-decimal list-inside text-gray-600 mb-6 space-y-2">
                  <li>Compare total amount payable, not just EMI amounts</li>
                  <li>Consider your monthly budget and choose sustainable EMI</li>
                  <li>Factor in all fees and charges, not just interest rates</li>
                  <li>Check the lender's reputation and customer service</li>
                  <li>Read all terms and conditions carefully</li>
                  <li>Consider loan insurance and its necessity</li>
                  <li>Evaluate prepayment flexibility for future savings</li>
                </ol>

                <h3 className="text-xl font-semibold text-gray-800 mb-4">When to Use This Calculator</h3>
                <p className="text-gray-600 mb-4">
                  This loan comparison calculator is ideal when you're:
                </p>
                <ul className="list-disc list-inside text-gray-600 mb-6 space-y-1">
                  <li>Shopping for personal loans from multiple lenders</li>
                  <li>Comparing home loan offers from different banks</li>
                  <li>Evaluating car loan options</li>
                  <li>Considering education loan alternatives</li>
                  <li>Refinancing an existing loan</li>
                  <li>Negotiating better terms with your current lender</li>
                </ul>
              </div>
            </div>

            {/* Related Tools */}
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">Related Financial Calculators</CardTitle>
                <CardDescription>Explore more tools to help with your financial planning</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <a href="/tools/loan-calculator" className="block p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
                    <div className="flex items-center gap-3 mb-2">
                      <Calculator className="w-5 h-5 text-blue-600" />
                      <h3 className="font-semibold text-blue-800">Loan Calculator</h3>
                    </div>
                    <p className="text-sm text-blue-600">Calculate EMI for a single loan with detailed amortization schedule.</p>
                  </a>
                  
                  <a href="/tools/emi-calculator" className="block p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors">
                    <div className="flex items-center gap-3 mb-2">
                      <DollarSign className="w-5 h-5 text-green-600" />
                      <h3 className="font-semibold text-green-800">EMI Calculator</h3>
                    </div>
                    <p className="text-sm text-green-600">Calculate Equated Monthly Installments for various types of loans.</p>
                  </a>
                  
                  <a href="/tools/compound-interest-calculator" className="block p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors">
                    <div className="flex items-center gap-3 mb-2">
                      <TrendingUp className="w-5 h-5 text-purple-600" />
                      <h3 className="font-semibold text-purple-800">Compound Interest</h3>
                    </div>
                    <p className="text-sm text-purple-600">Calculate compound interest on investments and savings.</p>
                  </a>
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

export default LoanComparisonCalculator;
