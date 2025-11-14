
import { useState } from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { ToolSEOHead } from '@/components/seo/ToolSEOHead';
import { budgetCalculatorSEO } from '@/config/seo/tools/budget-calculator';

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

interface BudgetResult {
  totalIncome: number;
  totalExpenses: number;
  remainingAmount: number;
  savingsGoal: number;
  suggestedSavings: number;
  actualSavingsRate: number;
  status: 'excellent' | 'good' | 'warning';
  message: string;
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
  const [result, setResult] = useState<BudgetResult | null>(null);

  const calculateBudget = () => {
    const totalIncome = monthlyIncome.reduce((sum, income) => sum + income.amount, 0);
    const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
    const remainingAmount = totalIncome - totalExpenses;
    const suggestedSavings = totalIncome * (savingsGoal / 100);
    const actualSavingsRate = totalIncome > 0 ? ((remainingAmount / totalIncome) * 100) : 0;

    let status: 'excellent' | 'good' | 'warning';
    let message: string;

    if (remainingAmount > suggestedSavings) {
      status = 'excellent';
      message = 'Excellent! You\'re exceeding your savings goal.';
    } else if (remainingAmount > 0) {
      status = 'good';
      message = 'Good budget balance with some savings potential.';
    } else {
      status = 'warning';
      message = 'Warning: Expenses exceed income.';
    }

    setResult({
      totalIncome,
      totalExpenses,
      remainingAmount,
      savingsGoal,
      suggestedSavings,
      actualSavingsRate,
      status,
      message
    });
  };

  const resetCalculator = () => {
    setMonthlyIncome([{ id: '1', name: 'Primary Salary', amount: 0 }]);
    setExpenses([
      { id: '1', name: 'Housing', amount: 0, color: '#3B82F6' },
      { id: '2', name: 'Food', amount: 0, color: '#10B981' },
      { id: '3', name: 'Transportation', amount: 0, color: '#F59E0B' },
      { id: '4', name: 'Utilities', amount: 0, color: '#EF4444' },
      { id: '5', name: 'Entertainment', amount: 0, color: '#8B5CF6' },
      { id: '6', name: 'Healthcare', amount: 0, color: '#EC4899' }
    ]);
    setSavingsGoal(20);
    setResult(null);
  };

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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  const pieData = expenses.filter(expense => expense.amount > 0).map(expense => ({
    name: expense.name,
    value: expense.amount,
    color: expense.color
  }));

  const barData = [
    { name: 'Income', amount: result?.totalIncome || 0, color: '#10B981' },
    { name: 'Expenses', amount: result?.totalExpenses || 0, color: '#EF4444' },
    { name: 'Remaining', amount: Math.max(0, result?.remainingAmount || 0), color: '#3B82F6' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <ToolSEOHead config={budgetCalculatorSEO} />
      <Header />
      
      <main>
        {/* Hero Section */}
        <section className="relative py-8 sm:py-12 md:py-16 lg:py-20 xl:py-24 2xl:py-32 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-indigo-600/20"></div>
          <div className="relative max-w-5xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 text-center">
            <div className="space-y-4 sm:space-y-6 md:space-y-8">
              <div className="inline-flex items-center px-2 sm:px-3 md:px-4 py-1 sm:py-1.5 md:py-2 bg-white/80 backdrop-blur-sm rounded-full border border-blue-200">
                <span className="text-xs sm:text-sm font-medium text-blue-700">Professional Budget Planner</span>
              </div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl 2xl:text-7xl font-bold text-slate-900 leading-tight tracking-tight px-2 sm:px-0">
                <span className="block">Smart Budget</span>
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 mt-1 sm:mt-2">
                  Calculator
                </span>
              </h1>
              <p className="text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl 2xl:text-2xl text-slate-600 max-w-xs sm:max-w-sm md:max-w-lg lg:max-w-2xl xl:max-w-3xl 2xl:max-w-4xl mx-auto leading-relaxed px-3 sm:px-2 md:px-0">
                Track income, expenses, and savings goals with interactive charts and comprehensive financial analysis
              </p>
            </div>
          </div>
        </section>

        <div className="w-full max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-6 sm:py-8 md:py-12 lg:py-16">
          {/* Main Calculator Card */}
          <Card className="bg-white/90 backdrop-blur-sm shadow-2xl border-0 rounded-xl sm:rounded-2xl md:rounded-3xl overflow-hidden">
            <CardContent className="p-0">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-0">
                {/* Input Section */}
                <div className="lg:col-span-2 p-3 sm:p-4 md:p-6 lg:p-8 xl:p-10 2xl:p-12 space-y-4 sm:space-y-6 md:space-y-8">
                  <div className="text-center sm:text-left">
                    <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">Budget Configuration</h2>
                    <p className="text-sm sm:text-base text-gray-600">Enter your income and expense details for comprehensive budget analysis</p>
                  </div>
                  
                  {/* Income Section */}
                  <div className="space-y-3 sm:space-y-4 md:space-y-6">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
                      <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-800">Monthly Income</h3>
                      <Button
                        onClick={addIncomeSource}
                        variant="outline"
                        size="sm"
                        className="rounded-full text-xs sm:text-sm w-full sm:w-auto"
                        data-testid="button-add-income"
                      >
                        Add Source
                      </Button>
                    </div>
                    
                    {monthlyIncome.map((income) => (
                      <div key={income.id} className="grid grid-cols-1 md:grid-cols-3 gap-2 sm:gap-3">
                        <div className="md:col-span-2">
                          <Label htmlFor={`income-name-${income.id}`} className="text-xs sm:text-sm font-medium text-gray-700">
                            Income Source
                          </Label>
                          <Input
                            id={`income-name-${income.id}`}
                            type="text"
                            value={income.name}
                            onChange={(e) => updateIncomeSource(income.id, 'name', e.target.value)}
                            className="h-10 sm:h-12 border-2 border-gray-200 rounded-lg sm:rounded-xl focus:border-blue-500 focus:ring-blue-500 text-sm sm:text-base"
                            placeholder="Income source name"
                            data-testid={`input-income-name-${income.id}`}
                          />
                        </div>
                        <div className="relative">
                          <Label htmlFor={`income-amount-${income.id}`} className="text-xs sm:text-sm font-medium text-gray-700">
                            Amount
                          </Label>
                          <div className="relative">
                            <span className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm sm:text-base">$</span>
                            <Input
                              id={`income-amount-${income.id}`}
                              type="number"
                              value={income.amount || ''}
                              onChange={(e) => updateIncomeSource(income.id, 'amount', parseFloat(e.target.value) || 0)}
                              className="h-10 sm:h-12 pl-6 sm:pl-8 border-2 border-gray-200 rounded-lg sm:rounded-xl focus:border-blue-500 focus:ring-blue-500 text-sm sm:text-base"
                              placeholder="0.00"
                              data-testid={`input-income-amount-${income.id}`}
                            />
                          </div>
                          {monthlyIncome.length > 1 && (
                            <Button
                              onClick={() => removeIncomeSource(income.id)}
                              variant="outline"
                              size="sm"
                              className="absolute top-7 sm:top-8 -right-2 w-7 h-7 sm:w-8 sm:h-8 p-0 rounded-full text-red-600 text-base sm:text-lg"
                              data-testid={`button-remove-income-${income.id}`}
                            >
                              ×
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Expenses Section */}
                  <div className="space-y-3 sm:space-y-4 md:space-y-6">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
                      <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-800">Monthly Expenses</h3>
                      <Button
                        onClick={addExpenseCategory}
                        variant="outline"
                        size="sm"
                        className="rounded-full text-xs sm:text-sm w-full sm:w-auto"
                        data-testid="button-add-expense"
                      >
                        Add Category
                      </Button>
                    </div>
                    
                    {expenses.map((expense) => (
                      <div key={expense.id} className="grid grid-cols-1 md:grid-cols-3 gap-2 sm:gap-3">
                        <div className="md:col-span-2">
                          <Label htmlFor={`expense-name-${expense.id}`} className="text-xs sm:text-sm font-medium text-gray-700">
                            Category
                          </Label>
                          <div className="flex items-center space-x-2">
                            <div 
                              className="w-3 h-3 sm:w-4 sm:h-4 rounded-full flex-shrink-0"
                              style={{ backgroundColor: expense.color }}
                            ></div>
                            <Input
                              id={`expense-name-${expense.id}`}
                              type="text"
                              value={expense.name}
                              onChange={(e) => updateExpenseCategory(expense.id, 'name', e.target.value)}
                              className="h-10 sm:h-12 border-2 border-gray-200 rounded-lg sm:rounded-xl focus:border-blue-500 focus:ring-blue-500 text-sm sm:text-base"
                              placeholder="Category name"
                              data-testid={`input-expense-name-${expense.id}`}
                            />
                          </div>
                        </div>
                        <div className="relative">
                          <Label htmlFor={`expense-amount-${expense.id}`} className="text-xs sm:text-sm font-medium text-gray-700">
                            Amount
                          </Label>
                          <div className="relative">
                            <span className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm sm:text-base">$</span>
                            <Input
                              id={`expense-amount-${expense.id}`}
                              type="number"
                              value={expense.amount || ''}
                              onChange={(e) => updateExpenseCategory(expense.id, 'amount', parseFloat(e.target.value) || 0)}
                              className="h-10 sm:h-12 pl-6 sm:pl-8 border-2 border-gray-200 rounded-lg sm:rounded-xl focus:border-blue-500 focus:ring-blue-500 text-sm sm:text-base"
                              placeholder="0.00"
                              data-testid={`input-expense-amount-${expense.id}`}
                            />
                          </div>
                          {expenses.length > 1 && (
                            <Button
                              onClick={() => removeExpenseCategory(expense.id)}
                              variant="outline"
                              size="sm"
                              className="absolute top-7 sm:top-8 -right-2 w-7 h-7 sm:w-8 sm:h-8 p-0 rounded-full text-red-600 text-base sm:text-lg"
                              data-testid={`button-remove-expense-${expense.id}`}
                            >
                              ×
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Savings Goal */}
                  <div className="space-y-3 sm:space-y-4 bg-gray-50 rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-6">
                    <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-800">Savings Goal</h3>
                    <div className="space-y-3 sm:space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm sm:text-base text-gray-700 font-medium">Target Savings Rate</span>
                        <span className="text-xl sm:text-2xl font-bold text-blue-600">{savingsGoal}%</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="50"
                        step="1"
                        value={savingsGoal}
                        onChange={(e) => setSavingsGoal(parseInt(e.target.value))}
                        className="w-full h-2 bg-blue-200 rounded-lg appearance-none cursor-pointer"
                        data-testid="slider-savings-goal"
                      />
                      <div className="flex justify-between text-xs sm:text-sm text-gray-500">
                        <span>0%</span>
                        <span>50%</span>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 md:gap-4 pt-3 sm:pt-4 md:pt-6">
                    <Button
                      onClick={calculateBudget}
                      className="flex-1 h-12 sm:h-14 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold text-base sm:text-lg rounded-lg sm:rounded-xl shadow-lg transition-colors duration-200"
                      data-testid="button-calculate"
                    >
                      Analyze Budget
                    </Button>
                    <Button
                      onClick={resetCalculator}
                      variant="outline"
                      className="h-12 sm:h-14 px-6 sm:px-8 border-2 border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold text-base sm:text-lg rounded-lg sm:rounded-xl"
                      data-testid="button-reset"
                    >
                      Reset
                    </Button>
                  </div>
                </div>

                {/* Results Section */}
                <div className="bg-gradient-to-br from-gray-50 to-blue-50 p-3 sm:p-4 md:p-6 lg:p-8 xl:p-10 2xl:p-12 border-t lg:border-t-0 lg:border-l">
                  <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 mb-4 sm:mb-6 md:mb-8 text-center sm:text-left">Budget Analysis</h2>
                  
                  {result ? (
                    <div className="space-y-4 sm:space-y-6" data-testid="budget-results">
                      {/* Budget Status */}
                      <div className={`rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg border ${
                        result.status === 'excellent' ? 'bg-green-50 border-green-200' :
                        result.status === 'good' ? 'bg-blue-50 border-blue-200' :
                        'bg-red-50 border-red-200'
                      }`}>
                        <div className="text-xs sm:text-sm font-semibold text-gray-600 uppercase tracking-wide mb-2">Budget Status</div>
                        <div className={`text-base sm:text-lg font-bold mb-2 ${
                          result.status === 'excellent' ? 'text-green-800' :
                          result.status === 'good' ? 'text-blue-800' :
                          'text-red-800'
                        }`}>
                          {result.message}
                        </div>
                        <div className="text-xs sm:text-sm text-gray-600">
                          Savings Rate: {result.actualSavingsRate.toFixed(1)}% | Goal: {result.savingsGoal}%
                        </div>
                      </div>

                      {/* Financial Summary */}
                      <div className="space-y-3 sm:space-y-4">
                        <div className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 shadow-sm">
                          <div className="flex justify-between items-center gap-2">
                            <span className="font-medium text-gray-700 text-sm sm:text-base">Total Income</span>
                            <span className="font-bold text-green-600 text-sm sm:text-base" data-testid="text-total-income">
                              {formatCurrency(result.totalIncome)}
                            </span>
                          </div>
                        </div>
                        <div className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 shadow-sm">
                          <div className="flex justify-between items-center gap-2">
                            <span className="font-medium text-gray-700 text-sm sm:text-base">Total Expenses</span>
                            <span className="font-bold text-red-600 text-sm sm:text-base" data-testid="text-total-expenses">
                              {formatCurrency(result.totalExpenses)}
                            </span>
                          </div>
                        </div>
                        <div className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 shadow-sm">
                          <div className="flex justify-between items-center gap-2">
                            <span className="font-medium text-gray-700 text-sm sm:text-base">Remaining Amount</span>
                            <span className={`font-bold text-sm sm:text-base ${result.remainingAmount >= 0 ? 'text-blue-600' : 'text-red-600'}`} data-testid="text-remaining-amount">
                              {formatCurrency(result.remainingAmount)}
                            </span>
                          </div>
                        </div>
                        <div className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 shadow-sm">
                          <div className="flex justify-between items-center gap-2">
                            <span className="font-medium text-gray-700 text-sm sm:text-base">Suggested Savings</span>
                            <span className="font-bold text-purple-600 text-sm sm:text-base" data-testid="text-suggested-savings">
                              {formatCurrency(result.suggestedSavings)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 sm:py-12 md:py-16" data-testid="no-results">
                      <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-200 rounded-full mx-auto mb-4 sm:mb-6 flex items-center justify-center">
                        <div className="text-2xl sm:text-3xl font-bold text-gray-400">$</div>
                      </div>
                      <p className="text-gray-500 text-sm sm:text-base md:text-lg px-4">Enter your budget details to see financial analysis</p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Charts Section */}
          {result && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 md:gap-8 mt-4 sm:mt-6 md:mt-8">
              {/* Expense Breakdown Chart */}
              <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-xl sm:rounded-2xl">
                <CardContent className="p-4 sm:p-6 md:p-8">
                  <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">Expense Breakdown</h3>
                  {pieData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={pieData}
                          cx="50%"
                          cy="50%"
                          outerRadius={100}
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
                    <div className="flex items-center justify-center h-64 text-gray-500">
                      Add expenses to see breakdown
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Financial Overview Chart */}
              <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-xl sm:rounded-2xl">
                <CardContent className="p-4 sm:p-6 md:p-8">
                  <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">Financial Overview</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={barData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip formatter={(value: number) => [`$${value.toLocaleString()}`, 'Amount']} />
                      <Bar dataKey="amount" fill="#3B82F6" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          )}

          {/* SEO Content Section */}
          <div className="mt-8 sm:mt-12 md:mt-16 grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 md:gap-8">
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-xl sm:rounded-2xl">
              <CardContent className="p-4 sm:p-6 md:p-8">
                <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">What is Budget Planning?</h3>
                <div className="space-y-4 text-gray-600">
                  <p>
                    Budget planning is the process of creating a comprehensive financial plan that outlines your income sources 
                    and categorizes your expenses to achieve specific financial goals. Our budget calculator helps you track 
                    every dollar, understand spending patterns, and make informed decisions about your money.
                  </p>
                  <p>
                    Effective budgeting is the foundation of financial wellness, enabling you to save for emergencies, 
                    pay off debt, invest for the future, and maintain a balanced lifestyle. With our interactive tools, 
                    you can visualize your financial health and identify areas for improvement.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-xl sm:rounded-2xl">
              <CardContent className="p-4 sm:p-6 md:p-8">
                <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">How to Use Our Budget Calculator</h3>
                <div className="space-y-4 text-gray-600">
                  <p>
                    Using our budget calculator is simple and effective:
                  </p>
                  <ul className="space-y-2 list-disc list-inside">
                    <li>Enter all sources of monthly income including salary, freelance work, and investments</li>
                    <li>Categorize your monthly expenses from housing to entertainment</li>
                    <li>Set your target savings rate based on financial goals</li>
                    <li>Click analyze to get comprehensive budget insights</li>
                  </ul>
                  <p>
                    The calculator provides instant visual feedback with charts and detailed analysis to help you 
                    understand your financial position and make necessary adjustments.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-xl sm:rounded-2xl">
              <CardContent className="p-4 sm:p-6 md:p-8">
                <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">Budget Categories to Track</h3>
                <div className="space-y-2 sm:space-y-3 text-gray-600 text-sm sm:text-base">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span><strong>Housing:</strong> Rent, mortgage, property taxes, insurance, maintenance</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span><strong>Transportation:</strong> Car payments, gas, insurance, public transit, maintenance</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span><strong>Food & Dining:</strong> Groceries, restaurants, work lunches, meal delivery</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span><strong>Utilities:</strong> Electric, gas, water, internet, phone, streaming services</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span><strong>Healthcare:</strong> Insurance premiums, medications, doctor visits, dental care</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-pink-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span><strong>Entertainment:</strong> Movies, hobbies, subscriptions, travel, recreation</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-xl sm:rounded-2xl">
              <CardContent className="p-4 sm:p-6 md:p-8">
                <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">Benefits of Regular Budgeting</h3>
                <div className="space-y-2 sm:space-y-3 text-gray-600 text-sm sm:text-base">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Track spending patterns and identify areas to reduce costs</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Set and achieve realistic savings and investment goals</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Prepare for emergencies with adequate emergency funds</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Reduce financial stress through better money management</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Make informed decisions about major purchases and investments</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Popular Budgeting Methods */}
          <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-xl sm:rounded-2xl mt-4 sm:mt-6 md:mt-8">
            <CardContent className="p-4 sm:p-6 md:p-8">
              <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 mb-4 sm:mb-6 md:mb-8">Popular Budgeting Methods</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                <div className="bg-blue-50 rounded-lg p-6">
                  <h4 className="text-lg font-semibold text-blue-800 mb-3">50/30/20 Rule</h4>
                  <p className="text-blue-700 text-sm mb-4">
                    Allocate 50% for needs, 30% for wants, and 20% for savings and debt repayment.
                  </p>
                  <div className="space-y-2 text-xs text-blue-600">
                    <div>• 50% - Essential expenses</div>
                    <div>• 30% - Discretionary spending</div>
                    <div>• 20% - Savings and debt</div>
                  </div>
                </div>
                
                <div className="bg-green-50 rounded-lg p-6">
                  <h4 className="text-lg font-semibold text-green-800 mb-3">Zero-Based Budget</h4>
                  <p className="text-green-700 text-sm mb-4">
                    Give every dollar a purpose. Income minus expenses should equal zero.
                  </p>
                  <div className="space-y-2 text-xs text-green-600">
                    <div>• Assign every dollar a job</div>
                    <div>• No money sits unplanned</div>
                    <div>• Forces intentional spending</div>
                  </div>
                </div>
                
                <div className="bg-purple-50 rounded-lg p-6">
                  <h4 className="text-lg font-semibold text-purple-800 mb-3">Envelope Method</h4>
                  <p className="text-purple-700 text-sm mb-4">
                    Allocate specific amounts for categories and stick to those limits.
                  </p>
                  <div className="space-y-2 text-xs text-purple-600">
                    <div>• Physical or digital envelopes</div>
                    <div>• Prevents overspending</div>
                    <div>• Visual spending control</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Budgeting Tips and Strategies */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 md:gap-8 mt-4 sm:mt-6 md:mt-8">
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-xl sm:rounded-2xl">
              <CardContent className="p-4 sm:p-6 md:p-8">
                <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">Smart Budgeting Tips</h3>
                <div className="space-y-4 text-gray-600">
                  <div className="border-l-4 border-blue-500 pl-4">
                    <h4 className="font-semibold text-gray-800 mb-2">Track Everything</h4>
                    <p className="text-sm">Monitor all income and expenses for at least a month to understand your spending patterns.</p>
                  </div>
                  <div className="border-l-4 border-green-500 pl-4">
                    <h4 className="font-semibold text-gray-800 mb-2">Automate Savings</h4>
                    <p className="text-sm">Set up automatic transfers to savings accounts to pay yourself first.</p>
                  </div>
                  <div className="border-l-4 border-orange-500 pl-4">
                    <h4 className="font-semibold text-gray-800 mb-2">Review Regularly</h4>
                    <p className="text-sm">Check your budget monthly and adjust categories based on changing needs.</p>
                  </div>
                  <div className="border-l-4 border-purple-500 pl-4">
                    <h4 className="font-semibold text-gray-800 mb-2">Build Emergency Fund</h4>
                    <p className="text-sm">Aim for 3-6 months of expenses in a separate emergency savings account.</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-xl sm:rounded-2xl">
              <CardContent className="p-4 sm:p-6 md:p-8">
                <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">Common Budgeting Mistakes</h3>
                <div className="space-y-4 text-gray-600">
                  <div className="bg-red-50 rounded-lg p-4">
                    <h4 className="font-semibold text-red-800 mb-2">Unrealistic Expectations</h4>
                    <p className="text-sm text-red-700">Setting overly restrictive budgets that are impossible to maintain long-term.</p>
                  </div>
                  <div className="bg-orange-50 rounded-lg p-4">
                    <h4 className="font-semibold text-orange-800 mb-2">Forgetting Irregular Expenses</h4>
                    <p className="text-sm text-orange-700">Not accounting for annual expenses like insurance premiums or holiday gifts.</p>
                  </div>
                  <div className="bg-yellow-50 rounded-lg p-4">
                    <h4 className="font-semibold text-yellow-800 mb-2">Not Tracking Small Purchases</h4>
                    <p className="text-sm text-yellow-700">Ignoring small daily expenses that add up to significant amounts over time.</p>
                  </div>
                  <div className="bg-blue-50 rounded-lg p-4">
                    <h4 className="font-semibold text-blue-800 mb-2">No Emergency Buffer</h4>
                    <p className="text-sm text-blue-700">Creating budgets without room for unexpected expenses or income fluctuations.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Budget FAQs */}
          <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-xl sm:rounded-2xl mt-4 sm:mt-6 md:mt-8">
            <CardContent className="p-4 sm:p-6 md:p-8">
              <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 mb-4 sm:mb-6 md:mb-8">Frequently Asked Questions</h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 md:gap-8">
                <div className="space-y-6">
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2">How much should I save each month?</h4>
                    <p className="text-gray-600 text-sm">Financial experts recommend saving at least 20% of your income, but start with what you can afford and gradually increase this percentage as your income grows.</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2">What if my income varies each month?</h4>
                    <p className="text-gray-600 text-sm">Base your budget on your lowest expected monthly income and treat any additional income as bonus money for extra savings or debt payments.</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2">How often should I update my budget?</h4>
                    <p className="text-gray-600 text-sm">Review your budget monthly and make adjustments quarterly or whenever you experience significant life changes like job transitions or major purchases.</p>
                  </div>
                </div>
                <div className="space-y-6">
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2">Should I include debt payments in my budget?</h4>
                    <p className="text-gray-600 text-sm">Yes, all debt payments including minimum payments and extra payments should be included as essential expenses in your budget planning.</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2">What's the best way to cut expenses?</h4>
                    <p className="text-gray-600 text-sm">Start by reviewing discretionary spending like dining out and subscriptions. Then look at ways to reduce fixed costs like insurance or utility bills through comparison shopping.</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2">How do I budget for irregular expenses?</h4>
                    <p className="text-gray-600 text-sm">Calculate annual irregular expenses and divide by 12 to create monthly sinking funds. This helps spread the cost throughout the year.</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default BudgetCalculator;
