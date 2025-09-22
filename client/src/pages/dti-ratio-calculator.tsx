
import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Calculator, PieChart, TrendingUp, AlertTriangle, CheckCircle, Info } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ToolHeroSection from '@/components/ToolHeroSection';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';

interface DebtItem {
  id: string;
  name: string;
  payment: number;
}

interface IncomeItem {
  id: string;
  name: string;
  amount: number;
}

const DTIRatioCalculator = () => {
  const [monthlyIncome, setMonthlyIncome] = useState<number>(0);
  const [incomeItems, setIncomeItems] = useState<IncomeItem[]>([
    { id: '1', name: 'Primary Job Salary', amount: 0 },
    { id: '2', name: 'Secondary Income', amount: 0 }
  ]);
  
  const [debtItems, setDebtItems] = useState<DebtItem[]>([
    { id: '1', name: 'Mortgage/Rent', payment: 0 },
    { id: '2', name: 'Car Loan', payment: 0 },
    { id: '3', name: 'Credit Cards', payment: 0 },
    { id: '4', name: 'Student Loans', payment: 0 },
    { id: '5', name: 'Personal Loans', payment: 0 }
  ]);

  const [results, setResults] = useState({
    totalIncome: 0,
    totalDebt: 0,
    dtiRatio: 0,
    frontEndRatio: 0,
    backEndRatio: 0
  });

  const calculateDTI = () => {
    const totalIncome = incomeItems.reduce((sum, item) => sum + (item.amount || 0), 0);
    const totalDebt = debtItems.reduce((sum, item) => sum + (item.payment || 0), 0);
    const housingDebt = debtItems.find(item => item.name.includes('Mortgage') || item.name.includes('Rent'))?.payment || 0;
    
    const dtiRatio = totalIncome > 0 ? (totalDebt / totalIncome) * 100 : 0;
    const frontEndRatio = totalIncome > 0 ? (housingDebt / totalIncome) * 100 : 0;
    const backEndRatio = dtiRatio;

    setResults({
      totalIncome,
      totalDebt,
      dtiRatio,
      frontEndRatio,
      backEndRatio
    });
  };

  useEffect(() => {
    calculateDTI();
  }, [incomeItems, debtItems]);

  const addIncomeItem = () => {
    const newItem: IncomeItem = {
      id: Date.now().toString(),
      name: 'Additional Income',
      amount: 0
    };
    setIncomeItems([...incomeItems, newItem]);
  };

  const addDebtItem = () => {
    const newItem: DebtItem = {
      id: Date.now().toString(),
      name: 'Other Debt',
      payment: 0
    };
    setDebtItems([...debtItems, newItem]);
  };

  const updateIncomeItem = (id: string, field: keyof IncomeItem, value: string | number) => {
    setIncomeItems(items => 
      items.map(item => 
        item.id === id ? { ...item, [field]: value } : item
      )
    );
  };

  const updateDebtItem = (id: string, field: keyof DebtItem, value: string | number) => {
    setDebtItems(items => 
      items.map(item => 
        item.id === id ? { ...item, [field]: value } : item
      )
    );
  };

  const removeIncomeItem = (id: string) => {
    setIncomeItems(items => items.filter(item => item.id !== id));
  };

  const removeDebtItem = (id: string) => {
    setDebtItems(items => items.filter(item => item.id !== id));
  };

  const getDTIStatus = (ratio: number) => {
    if (ratio <= 20) return { status: 'Excellent', color: 'text-green-600', bgColor: 'bg-green-50', icon: CheckCircle };
    if (ratio <= 36) return { status: 'Good', color: 'text-blue-600', bgColor: 'bg-blue-50', icon: CheckCircle };
    if (ratio <= 43) return { status: 'Fair', color: 'text-yellow-600', bgColor: 'bg-yellow-50', icon: AlertTriangle };
    return { status: 'High Risk', color: 'text-red-600', bgColor: 'bg-red-50', icon: AlertTriangle };
  };

  const dtiStatus = getDTIStatus(results.dtiRatio);
  const StatusIcon = dtiStatus.icon;

  return (
    <>
      <Helmet>
        <title>Free Debt-to-Income Ratio Calculator | DTI Calculator with Analysis | DapsiWow</title>
        <meta name="description" content="Calculate your debt-to-income ratio with our free DTI calculator. Get instant analysis, loan eligibility insights, and financial health assessment. Perfect for mortgage and loan applications." />
        <meta name="keywords" content="DTI calculator, debt to income ratio, DTI ratio calculator, mortgage qualification, loan eligibility, financial health calculator, debt ratio" />
        <meta property="og:title" content="Free Debt-to-Income Ratio Calculator | DTI Calculator" />
        <meta property="og:description" content="Calculate your DTI ratio instantly. Free tool with detailed analysis for loan eligibility and financial planning." />
        <meta property="og:type" content="website" />
        <link rel="canonical" href="https://dapsiwow.com/tools/dti-ratio-calculator" />
      </Helmet>

      <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 to-blue-50">
        <Header />
        
        <ToolHeroSection
          title="Debt-to-Income Ratio Calculator"
          description="Calculate your DTI ratio to assess financial health and loan eligibility with comprehensive analysis and recommendations"
        />

        <main className="flex-1 container mx-auto px-4 py-8 max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Input Section */}
            <div className="lg:col-span-2 space-y-6">
              {/* Monthly Income Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-green-600" />
                    Monthly Income
                  </CardTitle>
                  <CardDescription>
                    Enter all sources of monthly gross income before taxes
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {incomeItems.map((item, index) => (
                    <div key={item.id} className="flex gap-3 items-end">
                      <div className="flex-1">
                        <Label htmlFor={`income-name-${item.id}`}>Income Source</Label>
                        <Input
                          id={`income-name-${item.id}`}
                          value={item.name}
                          onChange={(e) => updateIncomeItem(item.id, 'name', e.target.value)}
                          placeholder="Income source name"
                        />
                      </div>
                      <div className="flex-1">
                        <Label htmlFor={`income-amount-${item.id}`}>Monthly Amount ($)</Label>
                        <Input
                          id={`income-amount-${item.id}`}
                          type="number"
                          value={item.amount || ''}
                          onChange={(e) => updateIncomeItem(item.id, 'amount', parseFloat(e.target.value) || 0)}
                          placeholder="0"
                        />
                      </div>
                      {incomeItems.length > 1 && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeIncomeItem(item.id)}
                          className="mb-0"
                        >
                          Remove
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button variant="outline" onClick={addIncomeItem} className="w-full">
                    + Add Income Source
                  </Button>
                </CardContent>
              </Card>

              {/* Monthly Debt Payments Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calculator className="w-5 h-5 text-red-600" />
                    Monthly Debt Payments
                  </CardTitle>
                  <CardDescription>
                    Enter minimum monthly payments for all debts and obligations
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {debtItems.map((item) => (
                    <div key={item.id} className="flex gap-3 items-end">
                      <div className="flex-1">
                        <Label htmlFor={`debt-name-${item.id}`}>Debt Type</Label>
                        <Input
                          id={`debt-name-${item.id}`}
                          value={item.name}
                          onChange={(e) => updateDebtItem(item.id, 'name', e.target.value)}
                          placeholder="Debt type"
                        />
                      </div>
                      <div className="flex-1">
                        <Label htmlFor={`debt-payment-${item.id}`}>Monthly Payment ($)</Label>
                        <Input
                          id={`debt-payment-${item.id}`}
                          type="number"
                          value={item.payment || ''}
                          onChange={(e) => updateDebtItem(item.id, 'payment', parseFloat(e.target.value) || 0)}
                          placeholder="0"
                        />
                      </div>
                      {debtItems.length > 1 && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeDebtItem(item.id)}
                          className="mb-0"
                        >
                          Remove
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button variant="outline" onClick={addDebtItem} className="w-full">
                    + Add Debt Payment
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Results Section */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChart className="w-5 h-5 text-blue-600" />
                    DTI Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Main DTI Ratio */}
                  <div className={`p-4 rounded-lg ${dtiStatus.bgColor}`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">Total DTI Ratio</span>
                      <StatusIcon className={`w-5 h-5 ${dtiStatus.color}`} />
                    </div>
                    <div className={`text-3xl font-bold ${dtiStatus.color}`}>
                      {results.dtiRatio.toFixed(1)}%
                    </div>
                    <div className={`text-sm ${dtiStatus.color} font-medium`}>
                      {dtiStatus.status}
                    </div>
                    <Progress 
                      value={Math.min(results.dtiRatio, 50)} 
                      className="mt-2"
                    />
                  </div>

                  {/* Front-end Ratio */}
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Housing Ratio</span>
                      <span className="text-sm">{results.frontEndRatio.toFixed(1)}%</span>
                    </div>
                    <Progress value={Math.min(results.frontEndRatio, 50)} />
                    <p className="text-xs text-gray-600">
                      Recommended: ≤ 28%
                    </p>
                  </div>

                  {/* Financial Summary */}
                  <div className="space-y-3 pt-4 border-t">
                    <div className="flex justify-between">
                      <span className="text-sm">Monthly Income:</span>
                      <span className="text-sm font-medium">${results.totalIncome.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Monthly Debts:</span>
                      <span className="text-sm font-medium">${results.totalDebt.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Available Income:</span>
                      <span className="text-sm font-medium text-green-600">
                        ${(results.totalIncome - results.totalDebt).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Recommendations */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Info className="w-5 h-5 text-blue-600" />
                    Recommendations
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {results.dtiRatio <= 20 && (
                    <Alert>
                      <CheckCircle className="h-4 w-4" />
                      <AlertDescription>
                        Excellent! You have a very healthy DTI ratio. You should easily qualify for most loans with favorable terms.
                      </AlertDescription>
                    </Alert>
                  )}
                  {results.dtiRatio > 20 && results.dtiRatio <= 36 && (
                    <Alert>
                      <CheckCircle className="h-4 w-4" />
                      <AlertDescription>
                        Good DTI ratio! You should qualify for most loans. Consider paying down debt to improve your ratio further.
                      </AlertDescription>
                    </Alert>
                  )}
                  {results.dtiRatio > 36 && results.dtiRatio <= 43 && (
                    <Alert>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        Your DTI is manageable but higher than ideal. Focus on paying down debt before taking on new loans.
                      </AlertDescription>
                    </Alert>
                  )}
                  {results.dtiRatio > 43 && (
                    <Alert>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        High DTI ratio. Consider debt consolidation, increasing income, or paying down debts before applying for new loans.
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Educational Content */}
          <div className="mt-12 space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>Understanding Debt-to-Income Ratio</CardTitle>
              </CardHeader>
              <CardContent className="prose prose-gray max-w-none">
                <p>
                  Your debt-to-income (DTI) ratio is a crucial financial metric that compares your monthly debt payments 
                  to your gross monthly income. Lenders use this ratio to assess your ability to manage monthly payments 
                  and repay borrowed money.
                </p>
                
                <h3>DTI Ratio Categories:</h3>
                <ul>
                  <li><strong>Excellent (0-20%):</strong> Very low debt relative to income. Excellent loan terms available.</li>
                  <li><strong>Good (21-36%):</strong> Manageable debt levels. Good loan approval chances.</li>
                  <li><strong>Fair (37-43%):</strong> Higher debt levels. May face higher interest rates.</li>
                  <li><strong>High Risk (44%+):</strong> High debt burden. Loan approval may be difficult.</li>
                </ul>

                <h3>Types of DTI Ratios:</h3>
                <ul>
                  <li><strong>Front-end Ratio:</strong> Housing expenses (mortgage, rent, insurance, taxes) ÷ gross income</li>
                  <li><strong>Back-end Ratio:</strong> All monthly debt payments ÷ gross income</li>
                </ul>

                <h3>Improving Your DTI Ratio:</h3>
                <ul>
                  <li>Pay down existing debt, especially high-interest credit cards</li>
                  <li>Increase your income through raises, side jobs, or additional income sources</li>
                  <li>Avoid taking on new debt</li>
                  <li>Consider debt consolidation to lower monthly payments</li>
                  <li>Make bi-weekly payments instead of monthly to pay off debt faster</li>
                </ul>

                <h3>Loan Qualification Guidelines:</h3>
                <ul>
                  <li><strong>Conventional Mortgages:</strong> Typically require DTI ≤ 43%</li>
                  <li><strong>FHA Loans:</strong> May allow DTI up to 57% with compensating factors</li>
                  <li><strong>VA Loans:</strong> No strict DTI limit, but 41% is preferred</li>
                  <li><strong>Auto Loans:</strong> Generally prefer DTI ≤ 36-40%</li>
                </ul>

                <p>
                  Remember, DTI is just one factor lenders consider. Your credit score, employment history, 
                  assets, and down payment also play important roles in loan approval decisions.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Frequently Asked Questions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">What income should I include in DTI calculations?</h4>
                  <p className="text-gray-600">
                    Include all gross monthly income before taxes: salary, bonuses, commissions, rental income, 
                    alimony, child support, and any other regular income sources.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">What debts are included in DTI?</h4>
                  <p className="text-gray-600">
                    Include all minimum monthly payments: mortgage/rent, car loans, credit cards, student loans, 
                    personal loans, alimony, child support, and other recurring debt obligations.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Should I include utilities and insurance?</h4>
                  <p className="text-gray-600">
                    Generally no. DTI focuses on debt payments. However, housing DTI may include property taxes, 
                    homeowners insurance, and HOA fees if you're a homeowner.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">How often should I calculate my DTI?</h4>
                  <p className="text-gray-600">
                    Review your DTI monthly or whenever your income or debt payments change significantly. 
                    This helps you stay on top of your financial health and loan readiness.
                  </p>
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

export default DTIRatioCalculator;
