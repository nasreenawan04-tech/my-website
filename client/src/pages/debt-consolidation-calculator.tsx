
import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Calculator, DollarSign, TrendingDown, AlertCircle, CheckCircle, Info, Plus, Trash2 } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ToolHeroSection from '@/components/ToolHeroSection';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface Debt {
  id: string;
  name: string;
  balance: number;
  interestRate: number;
  minPayment: number;
}

interface ConsolidationOption {
  loanAmount: number;
  interestRate: number;
  termYears: number;
  monthlyPayment: number;
  totalInterest: number;
  totalCost: number;
  monthlySavings: number;
  totalSavings: number;
  payoffTime: number;
}

const DebtConsolidationCalculator = () => {
  const [debts, setDebts] = useState<Debt[]>([]);
  const [newDebt, setNewDebt] = useState({
    name: '',
    balance: '',
    interestRate: '',
    minPayment: ''
  });

  // Consolidation loan parameters
  const [consolidationRate, setConsolidationRate] = useState('');
  const [consolidationTerm, setConsolidationTerm] = useState('');

  const [results, setResults] = useState<ConsolidationOption | null>(null);

  // Add new debt
  const addDebt = () => {
    if (newDebt.name && newDebt.balance && newDebt.interestRate && newDebt.minPayment) {
      const debt: Debt = {
        id: Date.now().toString(),
        name: newDebt.name,
        balance: parseFloat(newDebt.balance),
        interestRate: parseFloat(newDebt.interestRate),
        minPayment: parseFloat(newDebt.minPayment)
      };
      setDebts([...debts, debt]);
      setNewDebt({ name: '', balance: '', interestRate: '', minPayment: '' });
    }
  };

  // Remove debt
  const removeDebt = (id: string) => {
    setDebts(debts.filter(debt => debt.id !== id));
  };

  // Calculate loan payment
  const calculateMonthlyPayment = (principal: number, annualRate: number, years: number): number => {
    const monthlyRate = annualRate / 100 / 12;
    const numberOfPayments = years * 12;
    
    if (monthlyRate === 0) {
      return principal / numberOfPayments;
    }
    
    return principal * (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) / 
           (Math.pow(1 + monthlyRate, numberOfPayments) - 1);
  };

  // Calculate time to pay off existing debts
  const calculatePayoffTime = (balance: number, payment: number, rate: number): number => {
    if (payment <= 0 || rate < 0) return 0;
    
    const monthlyRate = rate / 100 / 12;
    if (monthlyRate === 0) {
      return balance / payment;
    }
    
    if (payment <= balance * monthlyRate) {
      return 999; // Will never pay off
    }
    
    return Math.log(1 + (balance * monthlyRate) / (payment - balance * monthlyRate)) / Math.log(1 + monthlyRate);
  };

  // Calculate consolidation results
  useEffect(() => {
    if (debts.length > 0 && consolidationRate && consolidationTerm) {
      const totalBalance = debts.reduce((sum, debt) => sum + debt.balance, 0);
      const totalMinPayment = debts.reduce((sum, debt) => sum + debt.minPayment, 0);
      
      const rate = parseFloat(consolidationRate);
      const term = parseFloat(consolidationTerm);
      
      const monthlyPayment = calculateMonthlyPayment(totalBalance, rate, term);
      const totalCost = monthlyPayment * term * 12;
      const totalInterest = totalCost - totalBalance;
      
      // Calculate current debt totals
      let currentTotalInterest = 0;
      let currentTotalCost = 0;
      let averagePayoffTime = 0;
      
      debts.forEach(debt => {
        const payoffMonths = calculatePayoffTime(debt.balance, debt.minPayment, debt.interestRate);
        const totalPaid = debt.minPayment * payoffMonths;
        const interestPaid = totalPaid - debt.balance;
        
        currentTotalInterest += interestPaid;
        currentTotalCost += totalPaid;
        averagePayoffTime += payoffMonths * (debt.balance / totalBalance); // Weighted average
      });
      
      const monthlySavings = totalMinPayment - monthlyPayment;
      const totalSavings = currentTotalCost - totalCost;
      
      setResults({
        loanAmount: totalBalance,
        interestRate: rate,
        termYears: term,
        monthlyPayment,
        totalInterest,
        totalCost,
        monthlySavings,
        totalSavings,
        payoffTime: term * 12
      });
    } else {
      setResults(null);
    }
  }, [debts, consolidationRate, consolidationTerm]);

  const totalBalance = debts.reduce((sum, debt) => sum + debt.balance, 0);
  const totalMinPayment = debts.reduce((sum, debt) => sum + debt.minPayment, 0);
  const weightedAvgRate = debts.length > 0 ? 
    debts.reduce((sum, debt) => sum + (debt.interestRate * debt.balance), 0) / totalBalance : 0;

  return (
    <>
      <Helmet>
        <title>Debt Consolidation Calculator - Calculate Loan Savings | DapsiWow</title>
        <meta name="description" content="Free debt consolidation calculator to compare multiple debts vs. a single consolidated loan. Calculate potential monthly savings, total interest savings, and payoff timelines." />
        <meta name="keywords" content="debt consolidation calculator, loan consolidation, debt payoff calculator, credit card consolidation, personal loan calculator, debt management, financial planning, loan comparison" />
        <meta property="og:title" content="Debt Consolidation Calculator - Calculate Loan Savings | DapsiWow" />
        <meta property="og:description" content="Calculate potential savings from consolidating multiple debts into a single loan. Compare payments, interest rates, and payoff timelines." />
        <meta property="og:type" content="website" />
        <meta name="robots" content="index, follow" />
        <meta name="author" content="DapsiWow" />
        <link rel="canonical" href="https://dapsiwow.com/tools/debt-consolidation-calculator" />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            "name": "Debt Consolidation Calculator",
            "description": "Calculate potential savings and benefits of consolidating multiple debts into a single loan",
            "url": "https://dapsiwow.com/tools/debt-consolidation-calculator",
            "applicationCategory": "FinanceApplication",
            "operatingSystem": "Web Browser",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "USD"
            }
          })}
        </script>
      </Helmet>

      <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <Header />
        
        <ToolHeroSection
          title="Debt Consolidation Calculator"
          description="Calculate potential savings from consolidating multiple debts into a single loan. Compare monthly payments, interest costs, and payoff timelines to make informed decisions."
        />

        <main className="flex-1 py-12">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              {/* Input Section */}
              <div className="space-y-6">
                
                {/* Current Debts */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <DollarSign className="h-5 w-5" />
                      Current Debts
                    </CardTitle>
                    <CardDescription>Add your existing debts to analyze consolidation benefits</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    
                    {/* Add New Debt Form */}
                    <div className="grid grid-cols-1 gap-3 p-4 bg-gray-50 rounded-lg">
                      <div>
                        <Label htmlFor="debt-name">Debt Name</Label>
                        <Input
                          id="debt-name"
                          placeholder="e.g., Credit Card 1, Personal Loan"
                          value={newDebt.name}
                          onChange={(e) => setNewDebt({...newDebt, name: e.target.value})}
                        />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <Label htmlFor="debt-balance">Balance ($)</Label>
                          <Input
                            id="debt-balance"
                            type="number"
                            placeholder="10000"
                            value={newDebt.balance}
                            onChange={(e) => setNewDebt({...newDebt, balance: e.target.value})}
                          />
                        </div>
                        <div>
                          <Label htmlFor="debt-rate">Interest Rate (%)</Label>
                          <Input
                            id="debt-rate"
                            type="number"
                            step="0.01"
                            placeholder="18.99"
                            value={newDebt.interestRate}
                            onChange={(e) => setNewDebt({...newDebt, interestRate: e.target.value})}
                          />
                        </div>
                      </div>
                      
                      <div>
                        <Label htmlFor="debt-payment">Minimum Payment ($)</Label>
                        <Input
                          id="debt-payment"
                          type="number"
                          placeholder="250"
                          value={newDebt.minPayment}
                          onChange={(e) => setNewDebt({...newDebt, minPayment: e.target.value})}
                        />
                      </div>
                      
                      <Button onClick={addDebt} className="w-full">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Debt
                      </Button>
                    </div>

                    <Separator />

                    {/* Current Debts List */}
                    <div className="space-y-3">
                      {debts.length === 0 ? (
                        <p className="text-gray-500 text-center py-4">No debts added yet. Add your first debt above.</p>
                      ) : (
                        debts.map((debt) => (
                          <div key={debt.id} className="flex items-center justify-between p-4 bg-red-50 rounded-lg border">
                            <div className="flex-1">
                              <div className="font-semibold text-gray-900">{debt.name}</div>
                              <div className="text-sm text-gray-600 grid grid-cols-2 gap-2 mt-1">
                                <span>Balance: ${debt.balance.toLocaleString()}</span>
                                <span>Rate: {debt.interestRate}%</span>
                                <span>Min Payment: ${debt.minPayment.toLocaleString()}</span>
                              </div>
                            </div>
                            <Button variant="ghost" size="sm" onClick={() => removeDebt(debt.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ))
                      )}
                    </div>

                    {/* Current Totals */}
                    {debts.length > 0 && (
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <h4 className="font-semibold text-blue-900 mb-2">Current Debt Summary</h4>
                        <div className="grid grid-cols-2 gap-2 text-sm text-blue-800">
                          <span>Total Balance: ${totalBalance.toLocaleString()}</span>
                          <span>Total Min Payment: ${totalMinPayment.toLocaleString()}</span>
                          <span>Weighted Avg Rate: {weightedAvgRate.toFixed(2)}%</span>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Consolidation Loan Parameters */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calculator className="h-5 w-5" />
                      Consolidation Loan Terms
                    </CardTitle>
                    <CardDescription>Enter the terms for your potential consolidation loan</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <Label htmlFor="consolidation-rate">Interest Rate (%)</Label>
                        <Input
                          id="consolidation-rate"
                          type="number"
                          step="0.01"
                          placeholder="12.99"
                          value={consolidationRate}
                          onChange={(e) => setConsolidationRate(e.target.value)}
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="consolidation-term">Loan Term (years)</Label>
                        <Input
                          id="consolidation-term"
                          type="number"
                          placeholder="5"
                          value={consolidationTerm}
                          onChange={(e) => setConsolidationTerm(e.target.value)}
                        />
                      </div>
                    </div>

                    {totalBalance > 0 && (
                      <Alert>
                        <Info className="h-4 w-4" />
                        <AlertDescription>
                          Loan Amount: ${totalBalance.toLocaleString()} (total of all debts above)
                        </AlertDescription>
                      </Alert>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Results Section */}
              <div className="space-y-6">
                
                {results ? (
                  <>
                    {/* Comparison Overview */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <TrendingDown className="h-5 w-5" />
                          Consolidation Analysis
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 gap-4">
                          
                          {/* Monthly Payment Comparison */}
                          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg">
                            <h4 className="font-semibold text-gray-900 mb-3">Monthly Payment</h4>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <div className="text-sm text-gray-600">Current Total</div>
                                <div className="text-xl font-bold text-red-600">${totalMinPayment.toLocaleString()}</div>
                              </div>
                              <div>
                                <div className="text-sm text-gray-600">Consolidated</div>
                                <div className="text-xl font-bold text-green-600">${results.monthlyPayment.toLocaleString()}</div>
                              </div>
                            </div>
                            <div className="mt-3 pt-3 border-t border-gray-200">
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">Monthly Savings</span>
                                <div className="flex items-center">
                                  {results.monthlySavings > 0 ? (
                                    <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                                  ) : (
                                    <AlertCircle className="h-4 w-4 text-red-500 mr-1" />
                                  )}
                                  <span className={`font-semibold ${results.monthlySavings > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                    ${Math.abs(results.monthlySavings).toLocaleString()}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Total Interest Comparison */}
                          <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg">
                            <h4 className="font-semibold text-gray-900 mb-3">Total Interest Cost</h4>
                            <div className="grid grid-cols-1 gap-2">
                              <div className="flex justify-between">
                                <span className="text-sm text-gray-600">Consolidated Loan</span>
                                <span className="font-semibold">${results.totalInterest.toLocaleString()}</span>
                              </div>
                              {results.totalSavings !== 0 && (
                                <div className="flex justify-between pt-2 border-t border-gray-200">
                                  <span className="text-sm text-gray-600">Total Savings</span>
                                  <div className="flex items-center">
                                    {results.totalSavings > 0 ? (
                                      <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                                    ) : (
                                      <AlertCircle className="h-4 w-4 text-red-500 mr-1" />
                                    )}
                                    <span className={`font-semibold ${results.totalSavings > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                      ${Math.abs(results.totalSavings).toLocaleString()}
                                    </span>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Payoff Timeline */}
                          <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-lg">
                            <h4 className="font-semibold text-gray-900 mb-3">Payoff Timeline</h4>
                            <div className="text-center">
                              <div className="text-sm text-gray-600">Consolidated Loan</div>
                              <div className="text-2xl font-bold text-purple-600">
                                {results.termYears} years
                              </div>
                              <div className="text-sm text-gray-500 mt-1">
                                ({(results.payoffTime).toFixed(0)} months)
                              </div>
                            </div>
                          </div>

                        </div>
                      </CardContent>
                    </Card>

                    {/* Recommendations */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Recommendation</CardTitle>
                      </CardHeader>
                      <CardContent>
                        {results.monthlySavings > 0 && results.totalSavings > 0 ? (
                          <Alert className="border-green-200 bg-green-50">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            <AlertDescription className="text-green-800">
                              <strong>Debt consolidation looks beneficial!</strong> You could save ${results.monthlySavings.toLocaleString()} per month and ${results.totalSavings.toLocaleString()} in total interest costs.
                            </AlertDescription>
                          </Alert>
                        ) : (
                          <Alert className="border-red-200 bg-red-50">
                            <AlertCircle className="h-4 w-4 text-red-600" />
                            <AlertDescription className="text-red-800">
                              <strong>Consider other options.</strong> This consolidation loan may not provide significant savings. Look for better interest rates or consider alternative debt repayment strategies.
                            </AlertDescription>
                          </Alert>
                        )}
                      </CardContent>
                    </Card>
                  </>
                ) : (
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-center text-gray-500">
                        <Calculator className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                        <p>Add your debts and consolidation loan terms to see the analysis.</p>
                      </div>
                    </CardContent>
                  </Card>
                )}

              </div>
            </div>

            {/* Educational Content */}
            <div className="mt-16 space-y-12">
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Understanding Debt Consolidation</h2>
                
                <div className="prose max-w-none">
                  <p className="text-lg text-gray-700 mb-6">
                    Debt consolidation involves combining multiple debts into a single loan, typically with a lower interest rate. This strategy can simplify your finances and potentially save money on interest costs.
                  </p>

                  <h3 className="text-2xl font-semibold text-gray-900 mb-4">When Debt Consolidation Makes Sense</h3>
                  
                  <div className="grid md:grid-cols-2 gap-8 mb-8">
                    <div className="bg-green-50 p-6 rounded-lg">
                      <h4 className="text-xl font-semibold text-green-900 mb-3">✓ Good Candidates</h4>
                      <ul className="space-y-2 text-green-800">
                        <li>• Multiple high-interest debts (credit cards, personal loans)</li>
                        <li>• Good credit score to qualify for lower rates</li>
                        <li>• Stable income to support new payment schedule</li>
                        <li>• Discipline to avoid accumulating new debt</li>
                        <li>• Lower consolidation rate than current weighted average</li>
                      </ul>
                    </div>

                    <div className="bg-red-50 p-6 rounded-lg">
                      <h4 className="text-xl font-semibold text-red-900 mb-3">✗ Poor Candidates</h4>
                      <ul className="space-y-2 text-red-800">
                        <li>• History of accumulating debt after consolidation</li>
                        <li>• Consolidation rate higher than current average</li>
                        <li>• Unstable income or employment</li>
                        <li>• Only small amounts of debt that can be paid off quickly</li>
                        <li>• Already close to paying off existing debts</li>
                      </ul>
                    </div>
                  </div>

                  <h3 className="text-2xl font-semibold text-gray-900 mb-4">Types of Debt Consolidation</h3>
                  
                  <div className="space-y-6 mb-8">
                    <div className="border-l-4 border-blue-500 pl-6">
                      <h4 className="text-xl font-semibold text-gray-900 mb-2">Personal Loans</h4>
                      <p className="text-gray-700 mb-3">
                        Unsecured loans with fixed rates and terms, typically ranging from 2-7 years. Best for those with good credit scores.
                      </p>
                      <div className="text-sm text-gray-600">
                        <strong>Pros:</strong> Fixed payments, no collateral required, fast funding<br/>
                        <strong>Cons:</strong> Higher rates for poor credit, origination fees possible
                      </div>
                    </div>

                    <div className="border-l-4 border-green-500 pl-6">
                      <h4 className="text-xl font-semibold text-gray-900 mb-2">Balance Transfer Credit Cards</h4>
                      <p className="text-gray-700 mb-3">
                        Transfer existing credit card balances to a new card with a promotional 0% APR period.
                      </p>
                      <div className="text-sm text-gray-600">
                        <strong>Pros:</strong> 0% introductory rates, no monthly payments during promo<br/>
                        <strong>Cons:</strong> High rates after promo period, balance transfer fees, credit limit restrictions
                      </div>
                    </div>

                    <div className="border-l-4 border-purple-500 pl-6">
                      <h4 className="text-xl font-semibold text-gray-900 mb-2">Home Equity Loans/HELOC</h4>
                      <p className="text-gray-700 mb-3">
                        Use your home's equity as collateral for lower interest rates on larger loan amounts.
                      </p>
                      <div className="text-sm text-gray-600">
                        <strong>Pros:</strong> Lower rates, tax-deductible interest, larger loan amounts<br/>
                        <strong>Cons:</strong> Home at risk, closing costs, longer approval process
                      </div>
                    </div>
                  </div>

                  <h3 className="text-2xl font-semibold text-gray-900 mb-4">Best Practices for Successful Debt Consolidation</h3>
                  
                  <div className="bg-blue-50 rounded-lg p-6 mb-8">
                    <div className="space-y-4">
                      <div className="flex items-start">
                        <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm mr-4 mt-1">1</div>
                        <div>
                          <h4 className="font-semibold text-blue-900">Shop Around for Rates</h4>
                          <p className="text-blue-800">Compare offers from multiple lenders including banks, credit unions, and online lenders to find the best terms.</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start">
                        <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm mr-4 mt-1">2</div>
                        <div>
                          <h4 className="font-semibold text-blue-900">Avoid New Debt</h4>
                          <p className="text-blue-800">Close credit card accounts or remove them from your wallet to avoid the temptation of accumulating new debt.</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start">
                        <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm mr-4 mt-1">3</div>
                        <div>
                          <h4 className="font-semibold text-blue-900">Create a Budget</h4>
                          <p className="text-blue-800">Develop a comprehensive budget that ensures you can afford the new payment and prevents future debt accumulation.</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start">
                        <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm mr-4 mt-1">4</div>
                        <div>
                          <h4 className="font-semibold text-blue-900">Consider Professional Help</h4>
                          <p className="text-blue-800">If debt feels overwhelming, consider credit counseling services that can provide personalized guidance and debt management plans.</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <h3 className="text-2xl font-semibold text-gray-900 mb-4">Alternative Debt Repayment Strategies</h3>
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="bg-yellow-50 p-6 rounded-lg">
                      <h4 className="font-semibold text-yellow-900 mb-3">Debt Snowball Method</h4>
                      <p className="text-yellow-800 mb-3">Pay minimum on all debts, then focus extra payments on the smallest balance first.</p>
                      <div className="text-sm text-yellow-700">
                        <strong>Best for:</strong> Psychological motivation and quick wins
                      </div>
                    </div>

                    <div className="bg-orange-50 p-6 rounded-lg">
                      <h4 className="font-semibold text-orange-900 mb-3">Debt Avalanche Method</h4>
                      <p className="text-orange-800 mb-3">Pay minimum on all debts, then focus extra payments on the highest interest rate debt first.</p>
                      <div className="text-sm text-orange-700">
                        <strong>Best for:</strong> Minimizing total interest paid over time
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default DebtConsolidationCalculator;
