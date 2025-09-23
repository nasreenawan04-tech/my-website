
import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Calculator, DollarSign, TrendingUp, TrendingDown, PiggyBank, CreditCard, Plus, Trash2 } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ToolHeroSection from '@/components/ToolHeroSection';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';

interface IncomeItem {
  id: string;
  source: string;
  amount: number;
  frequency: 'monthly' | 'yearly' | 'weekly' | 'biweekly';
}

interface ExpenseItem {
  id: string;
  category: string;
  description: string;
  amount: number;
  frequency: 'monthly' | 'yearly' | 'weekly' | 'biweekly';
}

interface DebtItem {
  id: string;
  name: string;
  balance: number;
  minPayment: number;
  interestRate: number;
}

interface SavingsGoal {
  id: string;
  name: string;
  target: number;
  current: number;
  deadline: string;
}

const PersonalFinanceDashboard = () => {
  const [incomes, setIncomes] = useState<IncomeItem[]>([]);
  const [expenses, setExpenses] = useState<ExpenseItem[]>([]);
  const [debts, setDebts] = useState<DebtItem[]>([]);
  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>([]);

  // New item forms
  const [newIncome, setNewIncome] = useState({ source: '', amount: '', frequency: 'monthly' });
  const [newExpense, setNewExpense] = useState({ category: '', description: '', amount: '', frequency: 'monthly' });
  const [newDebt, setNewDebt] = useState({ name: '', balance: '', minPayment: '', interestRate: '' });
  const [newGoal, setNewGoal] = useState({ name: '', target: '', current: '', deadline: '' });

  const expenseCategories = [
    'Housing', 'Transportation', 'Food', 'Utilities', 'Insurance', 
    'Healthcare', 'Entertainment', 'Personal Care', 'Education', 'Other'
  ];

  const frequencies = [
    { value: 'weekly', label: 'Weekly' },
    { value: 'biweekly', label: 'Bi-weekly' },
    { value: 'monthly', label: 'Monthly' },
    { value: 'yearly', label: 'Yearly' }
  ];

  // Convert any frequency to monthly amount
  const toMonthlyAmount = (amount: number, frequency: string) => {
    switch (frequency) {
      case 'weekly': return amount * 4.33;
      case 'biweekly': return amount * 2.17;
      case 'yearly': return amount / 12;
      default: return amount;
    }
  };

  // Calculate totals
  const monthlyIncome = incomes.reduce((sum, income) => sum + toMonthlyAmount(income.amount, income.frequency), 0);
  const monthlyExpenses = expenses.reduce((sum, expense) => sum + toMonthlyAmount(expense.amount, expense.frequency), 0);
  const totalDebt = debts.reduce((sum, debt) => sum + debt.balance, 0);
  const monthlyDebtPayments = debts.reduce((sum, debt) => sum + debt.minPayment, 0);
  const netIncome = monthlyIncome - monthlyExpenses - monthlyDebtPayments;
  const savingsRate = monthlyIncome > 0 ? ((netIncome / monthlyIncome) * 100) : 0;

  // Add new items functions
  const addIncome = () => {
    if (newIncome.source && newIncome.amount) {
      setIncomes([...incomes, {
        id: Date.now().toString(),
        source: newIncome.source,
        amount: parseFloat(newIncome.amount),
        frequency: newIncome.frequency as any
      }]);
      setNewIncome({ source: '', amount: '', frequency: 'monthly' });
    }
  };

  const addExpense = () => {
    if (newExpense.category && newExpense.description && newExpense.amount) {
      setExpenses([...expenses, {
        id: Date.now().toString(),
        category: newExpense.category,
        description: newExpense.description,
        amount: parseFloat(newExpense.amount),
        frequency: newExpense.frequency as any
      }]);
      setNewExpense({ category: '', description: '', amount: '', frequency: 'monthly' });
    }
  };

  const addDebt = () => {
    if (newDebt.name && newDebt.balance && newDebt.minPayment && newDebt.interestRate) {
      setDebts([...debts, {
        id: Date.now().toString(),
        name: newDebt.name,
        balance: parseFloat(newDebt.balance),
        minPayment: parseFloat(newDebt.minPayment),
        interestRate: parseFloat(newDebt.interestRate)
      }]);
      setNewDebt({ name: '', balance: '', minPayment: '', interestRate: '' });
    }
  };

  const addSavingsGoal = () => {
    if (newGoal.name && newGoal.target && newGoal.current && newGoal.deadline) {
      setSavingsGoals([...savingsGoals, {
        id: Date.now().toString(),
        name: newGoal.name,
        target: parseFloat(newGoal.target),
        current: parseFloat(newGoal.current),
        deadline: newGoal.deadline
      }]);
      setNewGoal({ name: '', target: '', current: '', deadline: '' });
    }
  };

  // Delete functions
  const deleteIncome = (id: string) => setIncomes(incomes.filter(item => item.id !== id));
  const deleteExpense = (id: string) => setExpenses(expenses.filter(item => item.id !== id));
  const deleteDebt = (id: string) => setDebts(debts.filter(item => item.id !== id));
  const deleteSavingsGoal = (id: string) => setSavingsGoals(savingsGoals.filter(item => item.id !== id));

  // Chart data
  const pieData = [
    { name: 'Remaining Income', value: Math.max(netIncome, 0), color: '#10b981' },
    { name: 'Expenses', value: monthlyExpenses, color: '#f59e0b' },
    { name: 'Debt Payments', value: monthlyDebtPayments, color: '#ef4444' }
  ];

  const expensesByCategory = expenseCategories.map(category => {
    const categoryExpenses = expenses.filter(expense => expense.category === category);
    const total = categoryExpenses.reduce((sum, expense) => sum + toMonthlyAmount(expense.amount, expense.frequency), 0);
    return { category, amount: total };
  }).filter(item => item.amount > 0);

  const COLORS = ['#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#f97316'];

  return (
    <>
      <Helmet>
        <title>Personal Finance Dashboard - Comprehensive Financial Overview | DapsiWow</title>
        <meta name="description" content="Free personal finance dashboard to track income, expenses, debts, and savings goals. Get a complete overview of your financial health with interactive charts and detailed analytics." />
        <meta name="keywords" content="personal finance dashboard, financial tracker, budget tracker, income expense tracker, debt tracker, savings goals, financial planning, money management, financial overview" />
        <meta property="og:title" content="Personal Finance Dashboard - Comprehensive Financial Overview | DapsiWow" />
        <meta property="og:description" content="Track your complete financial picture with our comprehensive dashboard. Monitor income, expenses, debts, and savings goals all in one place." />
        <meta property="og:type" content="website" />
        <meta name="robots" content="index, follow" />
        <meta name="author" content="DapsiWow" />
        <link rel="canonical" href="https://dapsiwow.com/tools/personal-finance-dashboard" />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            "name": "Personal Finance Dashboard",
            "description": "Comprehensive personal finance tracking dashboard with income, expense, debt, and savings goal management",
            "url": "https://dapsiwow.com/tools/personal-finance-dashboard",
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
          title="Personal Finance Dashboard"
          description="Get a comprehensive overview of your financial health with our interactive dashboard. Track income, expenses, debts, and savings goals all in one place."
        />

        <main className="flex-1 py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Monthly Income</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">${monthlyIncome.toLocaleString()}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Monthly Expenses</CardTitle>
                  <TrendingDown className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">${monthlyExpenses.toLocaleString()}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Net Income</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className={`text-2xl font-bold ${netIncome >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    ${netIncome.toLocaleString()}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Savings Rate</CardTitle>
                  <PiggyBank className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className={`text-2xl font-bold ${savingsRate >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {savingsRate.toFixed(1)}%
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
              {/* Income Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle>Income Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`$${Number(value).toLocaleString()}`, '']} />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Expenses by Category */}
              <Card>
                <CardHeader>
                  <CardTitle>Expenses by Category</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={expensesByCategory}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="category" />
                      <YAxis />
                      <Tooltip formatter={(value) => [`$${Number(value).toLocaleString()}`, 'Amount']} />
                      <Bar dataKey="amount" fill="#f59e0b" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Data Input Sections */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              {/* Income Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    Income Sources
                  </CardTitle>
                  <CardDescription>Add and manage your income sources</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 gap-3">
                    <div>
                      <Label htmlFor="income-source">Source</Label>
                      <Input
                        id="income-source"
                        placeholder="e.g., Salary, Freelance"
                        value={newIncome.source}
                        onChange={(e) => setNewIncome({...newIncome, source: e.target.value})}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label htmlFor="income-amount">Amount</Label>
                        <Input
                          id="income-amount"
                          type="number"
                          placeholder="5000"
                          value={newIncome.amount}
                          onChange={(e) => setNewIncome({...newIncome, amount: e.target.value})}
                        />
                      </div>
                      <div>
                        <Label htmlFor="income-frequency">Frequency</Label>
                        <Select value={newIncome.frequency} onValueChange={(value) => setNewIncome({...newIncome, frequency: value})}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {frequencies.map(freq => (
                              <SelectItem key={freq.value} value={freq.value}>
                                {freq.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <Button onClick={addIncome} className="w-full">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Income
                    </Button>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    {incomes.map((income) => (
                      <div key={income.id} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                        <div>
                          <div className="font-medium">{income.source}</div>
                          <div className="text-sm text-gray-600">
                            ${income.amount.toLocaleString()} {income.frequency}
                          </div>
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => deleteIncome(income.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Expenses Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Expenses
                  </CardTitle>
                  <CardDescription>Track your monthly expenses</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 gap-3">
                    <div>
                      <Label htmlFor="expense-category">Category</Label>
                      <Select value={newExpense.category} onValueChange={(value) => setNewExpense({...newExpense, category: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {expenseCategories.map(category => (
                            <SelectItem key={category} value={category}>
                              {category}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="expense-description">Description</Label>
                      <Input
                        id="expense-description"
                        placeholder="e.g., Rent, Groceries"
                        value={newExpense.description}
                        onChange={(e) => setNewExpense({...newExpense, description: e.target.value})}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label htmlFor="expense-amount">Amount</Label>
                        <Input
                          id="expense-amount"
                          type="number"
                          placeholder="1200"
                          value={newExpense.amount}
                          onChange={(e) => setNewExpense({...newExpense, amount: e.target.value})}
                        />
                      </div>
                      <div>
                        <Label htmlFor="expense-frequency">Frequency</Label>
                        <Select value={newExpense.frequency} onValueChange={(value) => setNewExpense({...newExpense, frequency: value})}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {frequencies.map(freq => (
                              <SelectItem key={freq.value} value={freq.value}>
                                {freq.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <Button onClick={addExpense} className="w-full">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Expense
                    </Button>
                  </div>

                  <Separator />

                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {expenses.map((expense) => (
                      <div key={expense.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                        <div>
                          <div className="font-medium">{expense.description}</div>
                          <div className="text-sm text-gray-600">
                            {expense.category} - ${expense.amount.toLocaleString()} {expense.frequency}
                          </div>
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => deleteExpense(expense.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Debts Section */}
              <Card>
                <CardHeader>
                  <CardTitle>Debt Management</CardTitle>
                  <CardDescription>Track your debts and monthly payments</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 gap-3">
                    <div>
                      <Label htmlFor="debt-name">Debt Name</Label>
                      <Input
                        id="debt-name"
                        placeholder="e.g., Credit Card, Student Loan"
                        value={newDebt.name}
                        onChange={(e) => setNewDebt({...newDebt, name: e.target.value})}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label htmlFor="debt-balance">Balance</Label>
                        <Input
                          id="debt-balance"
                          type="number"
                          placeholder="10000"
                          value={newDebt.balance}
                          onChange={(e) => setNewDebt({...newDebt, balance: e.target.value})}
                        />
                      </div>
                      <div>
                        <Label htmlFor="debt-payment">Min Payment</Label>
                        <Input
                          id="debt-payment"
                          type="number"
                          placeholder="250"
                          value={newDebt.minPayment}
                          onChange={(e) => setNewDebt({...newDebt, minPayment: e.target.value})}
                        />
                      </div>
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
                    <Button onClick={addDebt} className="w-full">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Debt
                    </Button>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <div className="text-lg font-semibold">
                      Total Debt: ${totalDebt.toLocaleString()}
                    </div>
                    {debts.map((debt) => (
                      <div key={debt.id} className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                        <div>
                          <div className="font-medium">{debt.name}</div>
                          <div className="text-sm text-gray-600">
                            ${debt.balance.toLocaleString()} at {debt.interestRate}% APR
                          </div>
                          <div className="text-sm text-gray-600">
                            Min Payment: ${debt.minPayment.toLocaleString()}/month
                          </div>
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => deleteDebt(debt.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Savings Goals Section */}
              <Card>
                <CardHeader>
                  <CardTitle>Savings Goals</CardTitle>
                  <CardDescription>Set and track your savings objectives</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 gap-3">
                    <div>
                      <Label htmlFor="goal-name">Goal Name</Label>
                      <Input
                        id="goal-name"
                        placeholder="e.g., Emergency Fund, Vacation"
                        value={newGoal.name}
                        onChange={(e) => setNewGoal({...newGoal, name: e.target.value})}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label htmlFor="goal-target">Target Amount</Label>
                        <Input
                          id="goal-target"
                          type="number"
                          placeholder="10000"
                          value={newGoal.target}
                          onChange={(e) => setNewGoal({...newGoal, target: e.target.value})}
                        />
                      </div>
                      <div>
                        <Label htmlFor="goal-current">Current Amount</Label>
                        <Input
                          id="goal-current"
                          type="number"
                          placeholder="2500"
                          value={newGoal.current}
                          onChange={(e) => setNewGoal({...newGoal, current: e.target.value})}
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="goal-deadline">Target Date</Label>
                      <Input
                        id="goal-deadline"
                        type="date"
                        value={newGoal.deadline}
                        onChange={(e) => setNewGoal({...newGoal, deadline: e.target.value})}
                      />
                    </div>
                    <Button onClick={addSavingsGoal} className="w-full">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Savings Goal
                    </Button>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    {savingsGoals.map((goal) => {
                      const progress = (goal.current / goal.target) * 100;
                      return (
                        <div key={goal.id} className="p-3 bg-blue-50 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <div className="font-medium">{goal.name}</div>
                            <Button variant="ghost" size="sm" onClick={() => deleteSavingsGoal(goal.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                          <div className="text-sm text-gray-600 mb-2">
                            ${goal.current.toLocaleString()} / ${goal.target.toLocaleString()} ({progress.toFixed(1)}%)
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full" 
                              style={{ width: `${Math.min(progress, 100)}%` }}
                            ></div>
                          </div>
                          <div className="text-sm text-gray-600 mt-1">
                            Target: {new Date(goal.deadline).toLocaleDateString()}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Educational Content */}
            <div className="mt-16 space-y-12">
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Understanding Your Personal Finance Dashboard</h2>
                
                <div className="prose max-w-none">
                  <p className="text-lg text-gray-700 mb-6">
                    A personal finance dashboard is your command center for financial success. It provides a comprehensive view of your financial health, helping you make informed decisions about spending, saving, and investing.
                  </p>

                  <h3 className="text-2xl font-semibold text-gray-900 mb-4">Key Components of Financial Health</h3>
                  
                  <div className="grid md:grid-cols-2 gap-8 mb-8">
                    <div>
                      <h4 className="text-xl font-semibold text-gray-900 mb-3">Income Tracking</h4>
                      <p className="text-gray-700 mb-4">
                        Monitor all sources of income including salary, freelance work, investments, and passive income streams. Understanding your total income helps set realistic budgets and financial goals.
                      </p>
                      <ul className="list-disc list-inside text-gray-700 space-y-2">
                        <li>Primary employment income</li>
                        <li>Secondary income sources</li>
                        <li>Investment returns and dividends</li>
                        <li>Rental or business income</li>
                      </ul>
                    </div>

                    <div>
                      <h4 className="text-xl font-semibold text-gray-900 mb-3">Expense Management</h4>
                      <p className="text-gray-700 mb-4">
                        Categorize and track expenses to identify spending patterns and areas for optimization. The 50/30/20 rule suggests allocating 50% to needs, 30% to wants, and 20% to savings.
                      </p>
                      <ul className="list-disc list-inside text-gray-700 space-y-2">
                        <li>Fixed expenses (rent, utilities, insurance)</li>
                        <li>Variable expenses (food, entertainment)</li>
                        <li>Discretionary spending</li>
                        <li>Emergency and unexpected costs</li>
                      </ul>
                    </div>
                  </div>

                  <h3 className="text-2xl font-semibold text-gray-900 mb-4">Financial Health Indicators</h3>
                  
                  <div className="bg-blue-50 rounded-lg p-6 mb-8">
                    <div className="grid md:grid-cols-3 gap-6">
                      <div>
                        <h4 className="font-semibold text-blue-900 mb-2">Savings Rate</h4>
                        <p className="text-blue-800 text-sm">
                          Aim for 20% or higher. This indicates strong financial discipline and future security.
                        </p>
                      </div>
                      <div>
                        <h4 className="font-semibold text-blue-900 mb-2">Debt-to-Income Ratio</h4>
                        <p className="text-blue-800 text-sm">
                          Keep total debt payments below 36% of gross income for optimal financial health.
                        </p>
                      </div>
                      <div>
                        <h4 className="font-semibold text-blue-900 mb-2">Emergency Fund</h4>
                        <p className="text-blue-800 text-sm">
                          Maintain 3-6 months of expenses in an easily accessible emergency fund.
                        </p>
                      </div>
                    </div>
                  </div>

                  <h3 className="text-2xl font-semibold text-gray-900 mb-4">Best Practices for Financial Dashboard Management</h3>
                  
                  <div className="space-y-4 mb-8">
                    <div className="border-l-4 border-green-500 pl-4">
                      <h4 className="font-semibold text-gray-900">Regular Updates</h4>
                      <p className="text-gray-700">Review and update your dashboard weekly or monthly to maintain accuracy and stay on track with your goals.</p>
                    </div>
                    
                    <div className="border-l-4 border-blue-500 pl-4">
                      <h4 className="font-semibold text-gray-900">Goal Setting</h4>
                      <p className="text-gray-700">Set SMART financial goals (Specific, Measurable, Achievable, Relevant, Time-bound) and track progress regularly.</p>
                    </div>
                    
                    <div className="border-l-4 border-purple-500 pl-4">
                      <h4 className="font-semibold text-gray-900">Automation</h4>
                      <p className="text-gray-700">Automate savings and bill payments to ensure consistency and reduce the mental load of financial management.</p>
                    </div>
                  </div>

                  <h3 className="text-2xl font-semibold text-gray-900 mb-4">Common Financial Planning Mistakes to Avoid</h3>
                  
                  <div className="bg-red-50 rounded-lg p-6">
                    <ul className="space-y-3 text-red-800">
                      <li className="flex items-start">
                        <span className="font-semibold mr-2">•</span>
                        <span>Not tracking small, frequent expenses that add up over time</span>
                      </li>
                      <li className="flex items-start">
                        <span className="font-semibold mr-2">•</span>
                        <span>Focusing only on income without managing expenses effectively</span>
                      </li>
                      <li className="flex items-start">
                        <span className="font-semibold mr-2">•</span>
                        <span>Setting unrealistic financial goals that lead to discouragement</span>
                      </li>
                      <li className="flex items-start">
                        <span className="font-semibold mr-2">•</span>
                        <span>Neglecting to build an emergency fund before investing</span>
                      </li>
                    </ul>
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

export default PersonalFinanceDashboard;
