
import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Calculator, PlusCircle, MinusCircle, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ToolHeroSection from '@/components/ToolHeroSection';

interface ExpenseCategory {
  id: string;
  name: string;
  amount: number;
  color: string;
}

interface IncomeSource {
  id: string;
  name: string;
  amount: number;
}

const BudgetCalculator = () => {
  const [monthlyIncome, setMonthlyIncome] = useState<IncomeSource[]>([
    { id: '1', name: 'Primary Salary', amount: 0 }
  ]);
  const [expenses, setExpenses] = useState<ExpenseCategory[]>([
    { id: '1', name: 'Housing', amount: 0, color: '#3B82F6' },
    { id: '2', name: 'Food', amount: 0, color: '#10B981' },
    { id: '3', name: 'Transportation', amount: 0, color: '#F59E0B' },
    { id: '4', name: 'Utilities', amount: 0, color: '#EF4444' },
    { id: '5', name: 'Entertainment', amount: 0, color: '#8B5CF6' },
    { id: '6', name: 'Healthcare', amount: 0, color: '#EC4899' }
  ]);
  const [savingsGoal, setSavingsGoal] = useState(20);

  const totalIncome = monthlyIncome.reduce((sum, income) => sum + income.amount, 0);
  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const remainingAmount = totalIncome - totalExpenses;
  const suggestedSavings = totalIncome * (savingsGoal / 100);
  const actualSavingsRate = totalIncome > 0 ? ((remainingAmount / totalIncome) * 100) : 0;

  const addIncomeSource = () => {
    const newIncome: IncomeSource = {
      id: Date.now().toString(),
      name: 'Additional Income',
      amount: 0
    };
    setMonthlyIncome([...monthlyIncome, newIncome]);
  };

  const removeIncomeSource = (id: string) => {
    if (monthlyIncome.length > 1) {
      setMonthlyIncome(monthlyIncome.filter(income => income.id !== id));
    }
  };

  const updateIncomeSource = (id: string, field: keyof IncomeSource, value: string | number) => {
    setMonthlyIncome(monthlyIncome.map(income => 
      income.id === id ? { ...income, [field]: value } : income
    ));
  };

  const addExpenseCategory = () => {
    const colors = ['#6366F1', '#14B8A6', '#F97316', '#E11D48', '#7C3AED', '#059669'];
    const newExpense: ExpenseCategory = {
      id: Date.now().toString(),
      name: 'New Category',
      amount: 0,
      color: colors[expenses.length % colors.length]
    };
    setExpenses([...expenses, newExpense]);
  };

  const removeExpenseCategory = (id: string) => {
    if (expenses.length > 1) {
      setExpenses(expenses.filter(expense => expense.id !== id));
    }
  };

  const updateExpenseCategory = (id: string, field: keyof ExpenseCategory, value: string | number) => {
    setExpenses(expenses.map(expense => 
      expense.id === id ? { ...expense, [field]: value } : expense
    ));
  };

  const getBudgetStatus = () => {
    if (remainingAmount > suggestedSavings) {
      return { status: 'excellent', message: 'Excellent! You\'re exceeding your savings goal.', icon: CheckCircle, color: 'text-green-600' };
    } else if (remainingAmount > 0) {
      return { status: 'good', message: 'Good budget balance with some savings potential.', icon: TrendingUp, color: 'text-blue-600' };
    } else {
      return { status: 'warning', message: 'Warning: Expenses exceed income.', icon: AlertTriangle, color: 'text-red-600' };
    }
  };

  const budgetStatus = getBudgetStatus();
  const StatusIcon = budgetStatus.icon;

  const pieData = expenses.filter(expense => expense.amount > 0).map(expense => ({
    name: expense.name,
    value: expense.amount,
    color: expense.color
  }));

  const barData = [
    { name: 'Income', amount: totalIncome, color: '#10B981' },
    { name: 'Expenses', amount: totalExpenses, color: '#EF4444' },
    { name: 'Remaining', amount: Math.max(0, remainingAmount), color: '#3B82F6' }
  ];

  return (
    <>
      <Helmet>
        <title>Budget Calculator - Personal Finance Planning Tool | DapsiWow</title>
        <meta name="description" content="Free budget calculator to track income, expenses, and savings. Plan your personal finances with interactive charts and detailed budget analysis. No sign-up required." />
        <meta name="keywords" content="budget calculator, personal finance, expense tracker, income tracker, savings calculator, financial planning, budget planner" />
        <meta property="og:title" content="Budget Calculator - Personal Finance Planning Tool | DapsiWow" />
        <meta property="og:description" content="Track your income, expenses, and savings with our free budget calculator. Interactive charts and detailed financial analysis." />
        <meta property="og:type" content="website" />
        <link rel="canonical" href="https://dapsiwow.com/tools/budget-calculator" />
      </Helmet>

      <div className="min-h-screen flex flex-col">
        <Header />
        
        <ToolHeroSection
          title="Budget Calculator"
          description="Track your income, expenses, and savings goals with interactive charts and comprehensive financial analysis"
        />
        
        <main className="flex-1 bg-neutral-50 py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            
            {/* Calculator Section */}
            <div className="bg-white rounded-2xl shadow-lg p-8 mb-12">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                
                {/* Income Section */}
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold text-neutral-800 flex items-center">
                      <TrendingUp className="w-5 h-5 mr-2 text-green-600" />
                      Monthly Income
                    </h3>
                    <button
                      onClick={addIncomeSource}
                      className="flex items-center px-3 py-1 text-sm bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
                    >
                      <PlusCircle className="w-4 h-4 mr-1" />
                      Add Source
                    </button>
                  </div>
                  
                  {monthlyIncome.map((income) => (
                    <div key={income.id} className="flex items-center space-x-3">
                      <input
                        type="text"
                        value={income.name}
                        onChange={(e) => updateIncomeSource(income.id, 'name', e.target.value)}
                        className="flex-1 px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Income source name"
                      />
                      <div className="relative">
                        <span className="absolute left-3 top-2 text-neutral-500">$</span>
                        <input
                          type="number"
                          value={income.amount || ''}
                          onChange={(e) => updateIncomeSource(income.id, 'amount', parseFloat(e.target.value) || 0)}
                          className="w-32 pl-8 pr-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="0.00"
                        />
                      </div>
                      {monthlyIncome.length > 1 && (
                        <button
                          onClick={() => removeIncomeSource(income.id)}
                          className="p-1 text-red-600 hover:bg-red-50 rounded"
                        >
                          <MinusCircle className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                  
                  <div className="bg-green-50 rounded-lg p-4">
                    <div className="text-lg font-semibold text-green-800">
                      Total Monthly Income: ${totalIncome.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </div>
                  </div>
                </div>

                {/* Expenses Section */}
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold text-neutral-800 flex items-center">
                      <Calculator className="w-5 h-5 mr-2 text-red-600" />
                      Monthly Expenses
                    </h3>
                    <button
                      onClick={addExpenseCategory}
                      className="flex items-center px-3 py-1 text-sm bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                    >
                      <PlusCircle className="w-4 h-4 mr-1" />
                      Add Category
                    </button>
                  </div>
                  
                  {expenses.map((expense) => (
                    <div key={expense.id} className="flex items-center space-x-3">
                      <div className="flex items-center space-x-2 flex-1">
                        <div 
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: expense.color }}
                        ></div>
                        <input
                          type="text"
                          value={expense.name}
                          onChange={(e) => updateExpenseCategory(expense.id, 'name', e.target.value)}
                          className="flex-1 px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Category name"
                        />
                      </div>
                      <div className="relative">
                        <span className="absolute left-3 top-2 text-neutral-500">$</span>
                        <input
                          type="number"
                          value={expense.amount || ''}
                          onChange={(e) => updateExpenseCategory(expense.id, 'amount', parseFloat(e.target.value) || 0)}
                          className="w-32 pl-8 pr-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="0.00"
                        />
                      </div>
                      {expenses.length > 1 && (
                        <button
                          onClick={() => removeExpenseCategory(expense.id)}
                          className="p-1 text-red-600 hover:bg-red-50 rounded"
                        >
                          <MinusCircle className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                  
                  <div className="bg-red-50 rounded-lg p-4">
                    <div className="text-lg font-semibold text-red-800">
                      Total Monthly Expenses: ${totalExpenses.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </div>
                  </div>
                </div>
              </div>

              {/* Savings Goal */}
              <div className="mt-8 bg-blue-50 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-blue-800">Savings Goal</h3>
                  <div className="text-2xl font-bold text-blue-800">{savingsGoal}%</div>
                </div>
                <input
                  type="range"
                  min="0"
                  max="50"
                  step="1"
                  value={savingsGoal}
                  onChange={(e) => setSavingsGoal(parseInt(e.target.value))}
                  className="w-full h-2 bg-blue-200 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-sm text-blue-600 mt-2">
                  <span>0%</span>
                  <span>50%</span>
                </div>
              </div>
            </div>

            {/* Results Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
              {/* Budget Summary */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-xl font-bold text-neutral-800 mb-6">Budget Summary</h3>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-neutral-600">Total Income:</span>
                    <span className="font-semibold text-green-600">
                      ${totalIncome.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-600">Total Expenses:</span>
                    <span className="font-semibold text-red-600">
                      ${totalExpenses.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="border-t pt-2">
                    <div className="flex justify-between">
                      <span className="text-neutral-600">Remaining:</span>
                      <span className={`font-bold ${remainingAmount >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                        ${remainingAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-600">Savings Rate:</span>
                    <span className="font-semibold text-blue-600">
                      {actualSavingsRate.toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-600">Suggested Savings:</span>
                    <span className="font-semibold text-purple-600">
                      ${suggestedSavings.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
                
                <div className={`mt-6 p-4 rounded-lg ${budgetStatus.status === 'excellent' ? 'bg-green-50' : budgetStatus.status === 'good' ? 'bg-blue-50' : 'bg-red-50'}`}>
                  <div className={`flex items-center ${budgetStatus.color}`}>
                    <StatusIcon className="w-5 h-5 mr-2" />
                    <span className="font-medium">{budgetStatus.message}</span>
                  </div>
                </div>
              </div>

              {/* Expense Breakdown Chart */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-xl font-bold text-neutral-800 mb-6">Expense Breakdown</h3>
                {pieData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        dataKey="value"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: number) => [`$${value.toLocaleString()}`, 'Amount']} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-64 text-neutral-500">
                    Add expenses to see breakdown
                  </div>
                )}
              </div>

              {/* Income vs Expenses Chart */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-xl font-bold text-neutral-800 mb-6">Financial Overview</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={barData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value: number) => [`$${value.toLocaleString()}`, 'Amount']} />
                    <Bar dataKey="amount" fill={(entry) => entry.color} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Educational Content */}
            <div className="bg-white rounded-2xl shadow-lg p-8 mb-12">
              <h2 className="text-3xl font-bold text-neutral-800 mb-8">Master Your Personal Budget: Complete Guide to Financial Success</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                <div>
                  <h3 className="text-xl font-semibold text-neutral-800 mb-4">Why Budget Planning Matters</h3>
                  <p className="text-neutral-600 mb-4">
                    Effective budget planning is the cornerstone of financial stability and wealth building. Our budget calculator helps you:
                  </p>
                  <ul className="text-neutral-600 space-y-2">
                    <li>• Track all income sources and expenses accurately</li>
                    <li>• Identify spending patterns and areas for improvement</li>
                    <li>• Set realistic savings goals and monitor progress</li>
                    <li>• Make informed financial decisions</li>
                    <li>• Prepare for emergencies and future goals</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="text-xl font-semibold text-neutral-800 mb-4">Budget Categories to Consider</h3>
                  <p className="text-neutral-600 mb-4">
                    A comprehensive budget should include these essential categories:
                  </p>
                  <ul className="text-neutral-600 space-y-2">
                    <li>• <strong>Housing:</strong> Rent/mortgage, insurance, maintenance</li>
                    <li>• <strong>Transportation:</strong> Car payments, gas, insurance</li>
                    <li>• <strong>Food:</strong> Groceries, dining out, work lunches</li>
                    <li>• <strong>Utilities:</strong> Electric, gas, water, internet, phone</li>
                    <li>• <strong>Healthcare:</strong> Insurance, medications, doctor visits</li>
                    <li>• <strong>Entertainment:</strong> Movies, subscriptions, hobbies</li>
                  </ul>
                </div>
              </div>

              <div className="bg-blue-50 rounded-lg p-6 mb-8">
                <h3 className="text-xl font-semibold text-blue-800 mb-4">The 50/30/20 Budget Rule</h3>
                <p className="text-blue-700 mb-4">
                  This popular budgeting method allocates your after-tax income as follows:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-white rounded-lg p-4">
                    <div className="text-2xl font-bold text-blue-600 mb-2">50%</div>
                    <div className="font-semibold text-neutral-800">Needs</div>
                    <div className="text-sm text-neutral-600">Housing, utilities, groceries, minimum debt payments</div>
                  </div>
                  <div className="bg-white rounded-lg p-4">
                    <div className="text-2xl font-bold text-green-600 mb-2">30%</div>
                    <div className="font-semibold text-neutral-800">Wants</div>
                    <div className="text-sm text-neutral-600">Entertainment, dining out, hobbies, subscriptions</div>
                  </div>
                  <div className="bg-white rounded-lg p-4">
                    <div className="text-2xl font-bold text-purple-600 mb-2">20%</div>
                    <div className="font-semibold text-neutral-800">Savings & Debt</div>
                    <div className="text-sm text-neutral-600">Emergency fund, retirement, extra debt payments</div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-neutral-800 mb-4">Advanced Budgeting Strategies</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-neutral-800 mb-2">Zero-Based Budgeting</h4>
                    <p className="text-neutral-600 text-sm">
                      Assign every dollar a purpose before spending. Income minus expenses should equal zero, with any surplus going to savings or debt repayment.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-neutral-800 mb-2">Envelope Method</h4>
                    <p className="text-neutral-600 text-sm">
                      Allocate cash for different spending categories. When an envelope is empty, you've reached your limit for that category.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-neutral-800 mb-2">Pay Yourself First</h4>
                    <p className="text-neutral-600 text-sm">
                      Automatically transfer money to savings before paying bills. This ensures you prioritize your financial future.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-neutral-800 mb-2">Percentage-Based Budgeting</h4>
                    <p className="text-neutral-600 text-sm">
                      Allocate specific percentages of income to different categories, making it easy to scale with income changes.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Related Tools */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-8">
              <h2 className="text-2xl font-bold text-neutral-800 mb-6 text-center">Complete Your Financial Planning</h2>
              <p className="text-neutral-600 text-center mb-8">
                Use these related calculators to build a comprehensive financial plan
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <a href="/tools/savings-goal-calculator" className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow group">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-green-200 transition-colors">
                    <TrendingUp className="w-6 h-6 text-green-600" />
                  </div>
                  <h3 className="font-semibold text-neutral-800 mb-2">Savings Goal Calculator</h3>
                  <p className="text-neutral-600 text-sm">Plan and track your savings goals with monthly contribution calculations.</p>
                </a>
                
                <a href="/tools/debt-payoff-calculator" className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow group">
                  <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-red-200 transition-colors">
                    <Calculator className="w-6 h-6 text-red-600" />
                  </div>
                  <h3 className="font-semibold text-neutral-800 mb-2">Debt Payoff Calculator</h3>
                  <p className="text-neutral-600 text-sm">Calculate strategies to pay off debt faster and save on interest.</p>
                </a>
                
                <a href="/tools/net-worth-calculator" className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow group">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-blue-200 transition-colors">
                    <CheckCircle className="w-6 h-6 text-blue-600" />
                  </div>
                  <h3 className="font-semibold text-neutral-800 mb-2">Net Worth Calculator</h3>
                  <p className="text-neutral-600 text-sm">Track your total financial position by calculating assets minus liabilities.</p>
                </a>
                
                <a href="/tools/compound-interest-calculator" className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow group">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-purple-200 transition-colors">
                    <TrendingUp className="w-6 h-6 text-purple-600" />
                  </div>
                  <h3 className="font-semibold text-neutral-800 mb-2">Compound Interest Calculator</h3>
                  <p className="text-neutral-600 text-sm">Calculate investment growth over time with compound interest.</p>
                </a>
              </div>
            </div>
          </div>
        </main>
        
        <Footer />
      </div>
    </>
  );
};

export default BudgetCalculator;
