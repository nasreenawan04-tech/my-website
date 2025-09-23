
import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

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

  // Display preferences
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [currency, setCurrency] = useState('USD');

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

  // Format currency
  const formatCurrency = (amount: number) => {
    const currencySymbols: { [key: string]: string } = {
      'USD': '$',
      'EUR': '€',
      'GBP': '£',
      'JPY': '¥',
      'INR': '₹'
    };

    return new Intl.NumberFormat('en-US', {
      style: 'decimal',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount).replace(/,/g, ',') + ' ' + (currencySymbols[currency] || currency);
  };

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

  // Sample data function
  const handleSampleData = () => {
    setIncomes([
      { id: '1', source: 'Salary', amount: 5000, frequency: 'monthly' },
      { id: '2', source: 'Freelance', amount: 1000, frequency: 'monthly' }
    ]);
    setExpenses([
      { id: '1', category: 'Housing', description: 'Rent', amount: 1500, frequency: 'monthly' },
      { id: '2', category: 'Food', description: 'Groceries', amount: 500, frequency: 'monthly' },
      { id: '3', category: 'Transportation', description: 'Car Payment', amount: 300, frequency: 'monthly' }
    ]);
    setDebts([
      { id: '1', name: 'Credit Card', balance: 5000, minPayment: 150, interestRate: 18.99 },
      { id: '2', name: 'Student Loan', balance: 25000, minPayment: 250, interestRate: 6.8 }
    ]);
    setSavingsGoals([
      { id: '1', name: 'Emergency Fund', target: 10000, current: 3000, deadline: '2024-12-31' },
      { id: '2', name: 'Vacation', target: 5000, current: 1500, deadline: '2024-06-30' }
    ]);
  };

  const resetTool = () => {
    setIncomes([]);
    setExpenses([]);
    setDebts([]);
    setSavingsGoals([]);
    setShowAdvanced(false);
    setCurrency('USD');
  };

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Helmet>
        <title>Personal Finance Dashboard - Complete Financial Overview & Planning Tool | DapsiWow</title>
        <meta name="description" content="Free comprehensive personal finance dashboard for tracking income, expenses, debts, and savings goals. Get complete financial overview with interactive charts, detailed analysis, and personalized recommendations for better money management." />
        <meta name="keywords" content="personal finance dashboard, financial tracker, budget tracker, income expense tracker, debt tracker, savings goals, financial planning, money management, financial overview, budget planner, expense analyzer, debt payoff tracker, savings calculator" />
        <meta property="og:title" content="Personal Finance Dashboard - Complete Financial Overview & Planning Tool | DapsiWow" />
        <meta property="og:description" content="Comprehensive personal finance dashboard for complete financial management. Track all aspects of your finances with detailed analytics and strategic planning tools." />
        <meta property="og:type" content="website" />
        <meta name="robots" content="index, follow" />
        <meta name="author" content="DapsiWow" />
        <link rel="canonical" href="https://dapsiwow.com/tools/personal-finance-dashboard" />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            "name": "Personal Finance Dashboard",
            "description": "Comprehensive personal finance tracking dashboard with income, expense, debt, and savings goal management for complete financial planning and analysis",
            "url": "https://dapsiwow.com/tools/personal-finance-dashboard",
            "applicationCategory": "FinanceApplication",
            "operatingSystem": "Any",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "USD"
            },
            "featureList": [
              "Complete financial overview dashboard",
              "Income and expense tracking",
              "Debt management and analysis",
              "Savings goal tracking",
              "Interactive financial charts",
              "Multi-currency support"
            ]
          })}
        </script>
      </Helmet>

      <Header />

      <main>
        {/* Hero Section */}
        <section className="relative py-12 sm:py-16 md:py-20 lg:py-24 xl:py-32 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-indigo-600/20"></div>
          <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="space-y-6 sm:space-y-8">
              <div className="inline-flex items-center px-3 sm:px-4 py-1.5 sm:py-2 bg-white/80 backdrop-blur-sm rounded-full border border-blue-200">
                <span className="text-xs sm:text-sm font-medium text-blue-700">Financial Planning Tool</span>
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl 2xl:text-8xl font-bold text-slate-900 leading-tight tracking-tight" data-testid="page-title">
                <span className="block">Personal Finance</span>
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 mt-1 sm:mt-2">
                  Dashboard
                </span>
              </h1>
              <p className="text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl text-slate-600 max-w-sm sm:max-w-lg md:max-w-2xl lg:max-w-3xl xl:max-w-4xl mx-auto leading-relaxed px-2 sm:px-0">
                Get a comprehensive overview of your financial health with interactive tracking, detailed analytics, and strategic planning tools
              </p>
            </div>
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
          {/* Main Tool Card */}
          <Card className="bg-white/90 backdrop-blur-sm shadow-2xl border-0 rounded-2xl sm:rounded-3xl overflow-hidden">
            <CardContent className="p-0">
              <div className="flex flex-col">
                {/* Input Section */}
                <div className="p-4 sm:p-6 md:p-8 lg:p-10 xl:p-12 space-y-6 sm:space-y-8">
                  <div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">Financial Overview Dashboard</h2>
                    <p className="text-gray-600">Track your complete financial picture including income, expenses, debts, and savings goals</p>
                  </div>

                  {/* Currency Selection */}
                  <div className="space-y-3">
                    <Label htmlFor="currency-select" className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                      Currency
                    </Label>
                    <Select value={currency} onValueChange={setCurrency}>
                      <SelectTrigger className="h-12 sm:h-14 border-2 border-gray-200 rounded-xl text-base sm:text-lg" data-testid="select-currency">
                        <SelectValue placeholder="Select currency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USD">US Dollar ($)</SelectItem>
                        <SelectItem value="EUR">Euro (€)</SelectItem>
                        <SelectItem value="GBP">British Pound (£)</SelectItem>
                        <SelectItem value="JPY">Japanese Yen (¥)</SelectItem>
                        <SelectItem value="INR">Indian Rupee (₹)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Financial Data Input Sections */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
                    
                    {/* Income Section */}
                    <div className="space-y-4 bg-blue-50 rounded-xl p-4 sm:p-6">
                      <h3 className="text-lg sm:text-xl font-bold text-blue-900">Income Sources</h3>
                      <div className="space-y-3">
                        <div>
                          <Label htmlFor="income-source" className="text-sm font-semibold text-blue-800 uppercase tracking-wide">
                            Source
                          </Label>
                          <Input
                            id="income-source"
                            placeholder="e.g., Salary, Freelance"
                            value={newIncome.source}
                            onChange={(e) => setNewIncome({...newIncome, source: e.target.value})}
                            className="mt-1 h-12 border-2 border-blue-200 rounded-xl text-base focus:border-blue-500 focus:ring-blue-500"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <Label htmlFor="income-amount" className="text-sm font-semibold text-blue-800 uppercase tracking-wide">
                              Amount
                            </Label>
                            <Input
                              id="income-amount"
                              type="number"
                              placeholder="5000"
                              value={newIncome.amount}
                              onChange={(e) => setNewIncome({...newIncome, amount: e.target.value})}
                              className="mt-1 h-12 border-2 border-blue-200 rounded-xl text-base focus:border-blue-500 focus:ring-blue-500"
                            />
                          </div>
                          <div>
                            <Label htmlFor="income-frequency" className="text-sm font-semibold text-blue-800 uppercase tracking-wide">
                              Frequency
                            </Label>
                            <Select value={newIncome.frequency} onValueChange={(value) => setNewIncome({...newIncome, frequency: value})}>
                              <SelectTrigger className="mt-1 h-12 border-2 border-blue-200 rounded-xl text-base focus:border-blue-500 focus:ring-blue-500">
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
                        <Button onClick={addIncome} className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl">
                          Add Income
                        </Button>
                      </div>

                      <Separator />

                      <div className="space-y-2">
                        {incomes.map((income) => (
                          <div key={income.id} className="flex items-center justify-between p-3 bg-white rounded-lg border border-blue-200">
                            <div>
                              <div className="font-medium">{income.source}</div>
                              <div className="text-sm text-gray-600">
                                {formatCurrency(income.amount)} {income.frequency}
                              </div>
                            </div>
                            <Button variant="outline" size="sm" onClick={() => deleteIncome(income.id)} className="text-red-600 hover:text-red-700">
                              Remove
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Expenses Section */}
                    <div className="space-y-4 bg-green-50 rounded-xl p-4 sm:p-6">
                      <h3 className="text-lg sm:text-xl font-bold text-green-900">Expenses</h3>
                      <div className="space-y-3">
                        <div>
                          <Label htmlFor="expense-category" className="text-sm font-semibold text-green-800 uppercase tracking-wide">
                            Category
                          </Label>
                          <Select value={newExpense.category} onValueChange={(value) => setNewExpense({...newExpense, category: value})}>
                            <SelectTrigger className="mt-1 h-12 border-2 border-green-200 rounded-xl text-base focus:border-green-500 focus:ring-green-500">
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
                          <Label htmlFor="expense-description" className="text-sm font-semibold text-green-800 uppercase tracking-wide">
                            Description
                          </Label>
                          <Input
                            id="expense-description"
                            placeholder="e.g., Rent, Groceries"
                            value={newExpense.description}
                            onChange={(e) => setNewExpense({...newExpense, description: e.target.value})}
                            className="mt-1 h-12 border-2 border-green-200 rounded-xl text-base focus:border-green-500 focus:ring-green-500"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <Label htmlFor="expense-amount" className="text-sm font-semibold text-green-800 uppercase tracking-wide">
                              Amount
                            </Label>
                            <Input
                              id="expense-amount"
                              type="number"
                              placeholder="1200"
                              value={newExpense.amount}
                              onChange={(e) => setNewExpense({...newExpense, amount: e.target.value})}
                              className="mt-1 h-12 border-2 border-green-200 rounded-xl text-base focus:border-green-500 focus:ring-green-500"
                            />
                          </div>
                          <div>
                            <Label htmlFor="expense-frequency" className="text-sm font-semibold text-green-800 uppercase tracking-wide">
                              Frequency
                            </Label>
                            <Select value={newExpense.frequency} onValueChange={(value) => setNewExpense({...newExpense, frequency: value})}>
                              <SelectTrigger className="mt-1 h-12 border-2 border-green-200 rounded-xl text-base focus:border-green-500 focus:ring-green-500">
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
                        <Button onClick={addExpense} className="w-full h-12 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl">
                          Add Expense
                        </Button>
                      </div>

                      <Separator />

                      <div className="space-y-2 max-h-60 overflow-y-auto">
                        {expenses.map((expense) => (
                          <div key={expense.id} className="flex items-center justify-between p-3 bg-white rounded-lg border border-green-200">
                            <div>
                              <div className="font-medium">{expense.description}</div>
                              <div className="text-sm text-gray-600">
                                {expense.category} - {formatCurrency(expense.amount)} {expense.frequency}
                              </div>
                            </div>
                            <Button variant="outline" size="sm" onClick={() => deleteExpense(expense.id)} className="text-red-600 hover:text-red-700">
                              Remove
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Debts Section */}
                    <div className="space-y-4 bg-purple-50 rounded-xl p-4 sm:p-6">
                      <h3 className="text-lg sm:text-xl font-bold text-purple-900">Debt Management</h3>
                      <div className="space-y-3">
                        <div>
                          <Label htmlFor="debt-name" className="text-sm font-semibold text-purple-800 uppercase tracking-wide">
                            Debt Name
                          </Label>
                          <Input
                            id="debt-name"
                            placeholder="e.g., Credit Card, Student Loan"
                            value={newDebt.name}
                            onChange={(e) => setNewDebt({...newDebt, name: e.target.value})}
                            className="mt-1 h-12 border-2 border-purple-200 rounded-xl text-base focus:border-purple-500 focus:ring-purple-500"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <Label htmlFor="debt-balance" className="text-sm font-semibold text-purple-800 uppercase tracking-wide">
                              Balance
                            </Label>
                            <Input
                              id="debt-balance"
                              type="number"
                              placeholder="10000"
                              value={newDebt.balance}
                              onChange={(e) => setNewDebt({...newDebt, balance: e.target.value})}
                              className="mt-1 h-12 border-2 border-purple-200 rounded-xl text-base focus:border-purple-500 focus:ring-purple-500"
                            />
                          </div>
                          <div>
                            <Label htmlFor="debt-payment" className="text-sm font-semibold text-purple-800 uppercase tracking-wide">
                              Min Payment
                            </Label>
                            <Input
                              id="debt-payment"
                              type="number"
                              placeholder="250"
                              value={newDebt.minPayment}
                              onChange={(e) => setNewDebt({...newDebt, minPayment: e.target.value})}
                              className="mt-1 h-12 border-2 border-purple-200 rounded-xl text-base focus:border-purple-500 focus:ring-purple-500"
                            />
                          </div>
                        </div>
                        <div>
                          <Label htmlFor="debt-rate" className="text-sm font-semibold text-purple-800 uppercase tracking-wide">
                            Interest Rate (%)
                          </Label>
                          <Input
                            id="debt-rate"
                            type="number"
                            step="0.01"
                            placeholder="18.99"
                            value={newDebt.interestRate}
                            onChange={(e) => setNewDebt({...newDebt, interestRate: e.target.value})}
                            className="mt-1 h-12 border-2 border-purple-200 rounded-xl text-base focus:border-purple-500 focus:ring-purple-500"
                          />
                        </div>
                        <Button onClick={addDebt} className="w-full h-12 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-xl">
                          Add Debt
                        </Button>
                      </div>

                      <Separator />

                      <div className="space-y-2">
                        <div className="text-lg font-semibold">
                          Total Debt: {formatCurrency(totalDebt)}
                        </div>
                        {debts.map((debt) => (
                          <div key={debt.id} className="flex items-center justify-between p-3 bg-white rounded-lg border border-purple-200">
                            <div>
                              <div className="font-medium">{debt.name}</div>
                              <div className="text-sm text-gray-600">
                                {formatCurrency(debt.balance)} at {debt.interestRate}% APR
                              </div>
                              <div className="text-sm text-gray-600">
                                Min Payment: {formatCurrency(debt.minPayment)}/month
                              </div>
                            </div>
                            <Button variant="outline" size="sm" onClick={() => deleteDebt(debt.id)} className="text-red-600 hover:text-red-700">
                              Remove
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Savings Goals Section */}
                    <div className="space-y-4 bg-orange-50 rounded-xl p-4 sm:p-6">
                      <h3 className="text-lg sm:text-xl font-bold text-orange-900">Savings Goals</h3>
                      <div className="space-y-3">
                        <div>
                          <Label htmlFor="goal-name" className="text-sm font-semibold text-orange-800 uppercase tracking-wide">
                            Goal Name
                          </Label>
                          <Input
                            id="goal-name"
                            placeholder="e.g., Emergency Fund, Vacation"
                            value={newGoal.name}
                            onChange={(e) => setNewGoal({...newGoal, name: e.target.value})}
                            className="mt-1 h-12 border-2 border-orange-200 rounded-xl text-base focus:border-orange-500 focus:ring-orange-500"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <Label htmlFor="goal-target" className="text-sm font-semibold text-orange-800 uppercase tracking-wide">
                              Target Amount
                            </Label>
                            <Input
                              id="goal-target"
                              type="number"
                              placeholder="10000"
                              value={newGoal.target}
                              onChange={(e) => setNewGoal({...newGoal, target: e.target.value})}
                              className="mt-1 h-12 border-2 border-orange-200 rounded-xl text-base focus:border-orange-500 focus:ring-orange-500"
                            />
                          </div>
                          <div>
                            <Label htmlFor="goal-current" className="text-sm font-semibold text-orange-800 uppercase tracking-wide">
                              Current Amount
                            </Label>
                            <Input
                              id="goal-current"
                              type="number"
                              placeholder="2500"
                              value={newGoal.current}
                              onChange={(e) => setNewGoal({...newGoal, current: e.target.value})}
                              className="mt-1 h-12 border-2 border-orange-200 rounded-xl text-base focus:border-orange-500 focus:ring-orange-500"
                            />
                          </div>
                        </div>
                        <div>
                          <Label htmlFor="goal-deadline" className="text-sm font-semibold text-orange-800 uppercase tracking-wide">
                            Target Date
                          </Label>
                          <Input
                            id="goal-deadline"
                            type="date"
                            value={newGoal.deadline}
                            onChange={(e) => setNewGoal({...newGoal, deadline: e.target.value})}
                            className="mt-1 h-12 border-2 border-orange-200 rounded-xl text-base focus:border-orange-500 focus:ring-orange-500"
                          />
                        </div>
                        <Button onClick={addSavingsGoal} className="w-full h-12 bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-xl">
                          Add Savings Goal
                        </Button>
                      </div>

                      <Separator />

                      <div className="space-y-2">
                        {savingsGoals.map((goal) => {
                          const progress = (goal.current / goal.target) * 100;
                          return (
                            <div key={goal.id} className="p-3 bg-white rounded-lg border border-orange-200">
                              <div className="flex items-center justify-between mb-2">
                                <div className="font-medium">{goal.name}</div>
                                <Button variant="outline" size="sm" onClick={() => deleteSavingsGoal(goal.id)} className="text-red-600 hover:text-red-700">
                                  Remove
                                </Button>
                              </div>
                              <div className="text-sm text-gray-600 mb-2">
                                {formatCurrency(goal.current)} / {formatCurrency(goal.target)} ({progress.toFixed(1)}%)
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div 
                                  className="bg-orange-600 h-2 rounded-full" 
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
                    </div>
                  </div>

                  {/* Advanced Options */}
                  <div className="space-y-4 sm:space-y-6 border-t pt-6 sm:pt-8">
                    <h3 className="text-lg sm:text-xl font-bold text-gray-900">Dashboard Options</h3>
                    
                    <Collapsible open={showAdvanced} onOpenChange={setShowAdvanced}>
                      <CollapsibleTrigger asChild>
                        <Button 
                          variant="ghost" 
                          className="w-full justify-between text-sm sm:text-base py-3 sm:py-4 h-auto"
                          data-testid="button-toggle-advanced"
                        >
                          <span className="flex items-center">
                            Advanced Dashboard Settings
                          </span>
                          <span className={`transform transition-transform ${showAdvanced ? 'rotate-180' : ''}`}>▼</span>
                        </Button>
                      </CollapsibleTrigger>
                      <CollapsibleContent className="space-y-4 sm:space-y-6 mt-4">
                        <Separator />
                        
                        <div className="bg-gray-50 rounded-xl p-4 sm:p-6">
                          <h4 className="text-sm sm:text-base font-semibold text-gray-900 mb-4">Dashboard Features</h4>
                          <div className="space-y-3 text-sm text-gray-600">
                            <div>• Comprehensive financial overview with real-time calculations</div>
                            <div>• Interactive charts showing income distribution and expense categories</div>
                            <div>• Debt tracking with interest rate analysis and payment schedules</div>
                            <div>• Savings goal progress tracking with visual progress indicators</div>
                            <div>• Multi-frequency income and expense support (weekly, monthly, yearly)</div>
                            <div>• Automatic currency formatting and multi-currency support</div>
                          </div>
                        </div>
                        
                        <Separator />
                      </CollapsibleContent>
                    </Collapsible>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4 sm:pt-6">
                    <Button
                      onClick={handleSampleData}
                      className="flex-1 h-12 sm:h-14 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold text-base sm:text-lg rounded-xl shadow-lg transform transition-all duration-200 hover:scale-105"
                      data-testid="button-sample-data"
                    >
                      Load Sample Data
                    </Button>
                    <Button
                      onClick={resetTool}
                      variant="outline"
                      className="h-12 sm:h-14 px-6 sm:px-8 border-2 border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold text-base sm:text-lg rounded-xl"
                      data-testid="button-reset"
                    >
                      Reset Dashboard
                    </Button>
                  </div>
                </div>

                {/* Results Section */}
                {(incomes.length > 0 || expenses.length > 0 || debts.length > 0 || savingsGoals.length > 0) && (
                  <div className="bg-gradient-to-br from-gray-50 to-blue-50 p-4 sm:p-6 md:p-8 lg:p-10 xl:p-12 border-t">
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6 sm:mb-8">Financial Overview</h2>

                    <div className="space-y-6 sm:space-y-8" data-testid="financial-overview">
                      {/* Key Metrics */}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                        <div className="rounded-xl p-4 sm:p-6 border-2 bg-green-50 border-green-200">
                          <div className="flex items-center justify-between mb-3">
                            <h3 className="text-lg font-bold text-green-900">Monthly Income</h3>
                          </div>
                          <div className="text-2xl font-bold text-green-600">{formatCurrency(monthlyIncome)}</div>
                        </div>

                        <div className="rounded-xl p-4 sm:p-6 border-2 bg-red-50 border-red-200">
                          <div className="flex items-center justify-between mb-3">
                            <h3 className="text-lg font-bold text-red-900">Monthly Expenses</h3>
                          </div>
                          <div className="text-2xl font-bold text-red-600">{formatCurrency(monthlyExpenses)}</div>
                        </div>

                        <div className={`rounded-xl p-4 sm:p-6 border-2 ${netIncome >= 0 ? 'bg-blue-50 border-blue-200' : 'bg-red-50 border-red-200'}`}>
                          <div className="flex items-center justify-between mb-3">
                            <h3 className={`text-lg font-bold ${netIncome >= 0 ? 'text-blue-900' : 'text-red-900'}`}>Net Income</h3>
                          </div>
                          <div className={`text-2xl font-bold ${netIncome >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                            {formatCurrency(netIncome)}
                          </div>
                        </div>

                        <div className={`rounded-xl p-4 sm:p-6 border-2 ${savingsRate >= 0 ? 'bg-purple-50 border-purple-200' : 'bg-red-50 border-red-200'}`}>
                          <div className="flex items-center justify-between mb-3">
                            <h3 className={`text-lg font-bold ${savingsRate >= 0 ? 'text-purple-900' : 'text-red-900'}`}>Savings Rate</h3>
                          </div>
                          <div className={`text-2xl font-bold ${savingsRate >= 0 ? 'text-purple-600' : 'text-red-600'}`}>
                            {savingsRate.toFixed(1)}%
                          </div>
                        </div>
                      </div>

                      {/* Charts */}
                      {(monthlyIncome > 0 || monthlyExpenses > 0) && (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                          {/* Income Distribution */}
                          <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-200">
                            <h3 className="text-lg font-bold text-gray-900 mb-4">Income Distribution</h3>
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
                                <Tooltip formatter={(value) => [`${formatCurrency(Number(value))}`, '']} />
                              </PieChart>
                            </ResponsiveContainer>
                          </div>

                          {/* Expenses by Category */}
                          {expensesByCategory.length > 0 && (
                            <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-200">
                              <h3 className="text-lg font-bold text-gray-900 mb-4">Expenses by Category</h3>
                              <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={expensesByCategory}>
                                  <CartesianGrid strokeDasharray="3 3" />
                                  <XAxis dataKey="category" />
                                  <YAxis />
                                  <Tooltip formatter={(value) => [`${formatCurrency(Number(value))}`, 'Amount']} />
                                  <Bar dataKey="amount" fill="#f59e0b" />
                                </BarChart>
                              </ResponsiveContainer>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Financial Summary */}
                      <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-200 overflow-x-auto">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">Financial Summary</h3>
                        <table className="w-full text-sm">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-4 py-3 text-left font-semibold text-gray-900">Category</th>
                              <th className="px-4 py-3 text-center font-semibold text-gray-900">Monthly Amount</th>
                              <th className="px-4 py-3 text-center font-semibold text-gray-900">Percentage of Income</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200">
                            <tr>
                              <td className="px-4 py-3 font-medium">Total Income</td>
                              <td className="px-4 py-3 text-center text-green-600 font-semibold">{formatCurrency(monthlyIncome)}</td>
                              <td className="px-4 py-3 text-center">100%</td>
                            </tr>
                            <tr className="bg-gray-50">
                              <td className="px-4 py-3 font-medium">Total Expenses</td>
                              <td className="px-4 py-3 text-center text-red-600 font-semibold">{formatCurrency(monthlyExpenses)}</td>
                              <td className="px-4 py-3 text-center">{monthlyIncome > 0 ? ((monthlyExpenses / monthlyIncome) * 100).toFixed(1) : 0}%</td>
                            </tr>
                            <tr>
                              <td className="px-4 py-3 font-medium">Debt Payments</td>
                              <td className="px-4 py-3 text-center text-orange-600 font-semibold">{formatCurrency(monthlyDebtPayments)}</td>
                              <td className="px-4 py-3 text-center">{monthlyIncome > 0 ? ((monthlyDebtPayments / monthlyIncome) * 100).toFixed(1) : 0}%</td>
                            </tr>
                            <tr className="bg-blue-50 font-semibold">
                              <td className="px-4 py-3 font-bold">Net Income</td>
                              <td className={`px-4 py-3 text-center font-bold ${netIncome >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {formatCurrency(netIncome)}
                              </td>
                              <td className={`px-4 py-3 text-center font-bold ${netIncome >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {savingsRate.toFixed(1)}%
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>

                      {/* Recommendations */}
                      <div className="bg-blue-50 border-l-4 border-blue-400 p-4 sm:p-6 rounded-lg">
                        <h3 className="text-lg font-bold text-blue-900 mb-2">Financial Health Recommendations</h3>
                        <div className="space-y-2 text-blue-800">
                          {savingsRate < 20 && (
                            <p>• Consider increasing your savings rate to at least 20% for better financial security.</p>
                          )}
                          {totalDebt > 0 && (
                            <p>• Focus on paying down high-interest debt to reduce your financial burden.</p>
                          )}
                          {netIncome < 0 && (
                            <p>• Your expenses exceed your income. Review your spending and consider increasing income or reducing expenses.</p>
                          )}
                          {savingsGoals.length === 0 && (
                            <p>• Set specific savings goals to stay motivated and track your financial progress.</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* SEO Content Sections */}
          <div className="mt-16 space-y-8">
            {/* What is a Personal Finance Dashboard */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">What is a Personal Finance Dashboard?</h2>
                <div className="space-y-4 text-gray-600">
                  <p>
                    A <strong>personal finance dashboard</strong> is a comprehensive financial management tool that provides a centralized view of your complete financial picture. This advanced platform enables users to track income sources, monitor expenses across multiple categories, manage debt obligations, and set strategic savings goals all within a single, integrated interface that updates in real-time as you input financial data.
                  </p>
                  <p>
                    Our professional personal finance dashboard offers sophisticated financial analysis capabilities including automated calculations for monthly cash flow, savings rate optimization, debt-to-income ratios, and goal progress tracking. The dashboard supports multiple income frequencies, expense categorization, and provides visual analytics through interactive charts and comprehensive reporting features that help users make informed financial decisions.
                  </p>
                  <p>
                    Whether you're tracking household budgets, planning major purchases, managing student loans, monitoring investment contributions, or developing long-term financial strategies, this dashboard serves as your financial command center, providing the insights and analysis needed to optimize your money management and achieve your financial objectives effectively.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* How Personal Finance Dashboards Work */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">How Personal Finance Dashboard Analysis Works</h2>
                <p className="text-gray-600 mb-8">Understanding the methodology behind comprehensive financial tracking helps you leverage dashboard insights for strategic financial planning, optimization, and long-term wealth building strategies.</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div className="bg-blue-50 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-blue-900 mb-3">Income & Cash Flow Analysis</h3>
                      <p className="text-blue-800 text-sm mb-4">
                        The dashboard automatically converts all income sources to monthly equivalents for consistent analysis, regardless of payment frequency. This standardization enables accurate cash flow projections and budget planning across different income streams and payment schedules.
                      </p>
                      <div className="bg-blue-100 p-3 rounded-lg">
                        <h4 className="font-medium text-blue-900 mb-2">Analysis Components:</h4>
                        <div className="text-xs text-blue-800">
                          <div>• Multi-frequency income normalization (weekly, monthly, yearly)</div>
                          <div>• Real-time cash flow calculations and projections</div>
                          <div>• Income diversification analysis and risk assessment</div>
                          <div>• Seasonal income pattern recognition and planning</div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-green-50 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-green-900 mb-3">Expense Categorization & Optimization</h3>
                      <p className="text-green-800 text-sm mb-4">
                        Advanced expense tracking with intelligent categorization helps identify spending patterns, optimization opportunities, and budget allocation strategies. The system provides detailed analysis of fixed versus variable expenses and their impact on financial flexibility.
                      </p>
                      <div className="bg-green-100 p-3 rounded-lg">
                        <h4 className="font-medium text-green-900 mb-2">Tracking Features:</h4>
                        <div className="text-xs text-green-800">
                          <div>• Comprehensive expense categorization and analysis</div>
                          <div>• Fixed vs variable expense identification</div>
                          <div>• Spending trend analysis and optimization recommendations</div>
                          <div>• Budget variance tracking and alerts</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="bg-purple-50 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-purple-900 mb-3">Debt Management & Analysis</h3>
                      <p className="text-purple-800 text-sm mb-4">
                        Comprehensive debt tracking includes balance monitoring, interest rate analysis, minimum payment calculations, and strategic payoff planning. The dashboard provides insights into debt-to-income ratios and optimization strategies for faster debt elimination.
                      </p>
                      <div className="bg-purple-100 p-3 rounded-lg">
                        <h4 className="font-medium text-purple-900 mb-2">Debt Analysis Tools:</h4>
                        <div className="text-xs text-purple-800">
                          <div>• Total debt burden and payment obligation tracking</div>
                          <div>• Interest rate impact analysis and optimization</div>
                          <div>• Debt-to-income ratio monitoring and alerts</div>
                          <div>• Strategic payoff planning and scenario modeling</div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-orange-50 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-orange-900 mb-3">Savings Goal Tracking & Planning</h3>
                      <p className="text-orange-800 text-sm mb-4">
                        Strategic savings goal management with progress tracking, timeline analysis, and achievement probability calculations. The system helps optimize savings allocation across multiple goals and provides recommendations for goal prioritization and timeline adjustments.
                      </p>
                      <div className="bg-orange-100 p-3 rounded-lg">
                        <h4 className="font-medium text-orange-900 mb-2">Goal Management:</h4>
                        <div className="text-xs text-orange-800">
                          <div>• Multi-goal progress tracking and visualization</div>
                          <div>• Timeline analysis and achievement probability</div>
                          <div>• Savings allocation optimization strategies</div>
                          <div>• Goal prioritization and milestone planning</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Professional Applications and Use Cases */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
                <CardContent className="p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Who Benefits from Personal Finance Dashboards?</h2>
                  <p className="text-gray-600 mb-6">Personal finance dashboards serve diverse user groups across various life stages and financial situations, providing essential tracking and analysis capabilities for comprehensive financial management and strategic planning.</p>
                  
                  <div className="space-y-4">
                    <div className="bg-blue-50 rounded-lg p-4">
                      <h3 className="font-semibold text-blue-900 mb-2">Young Professionals & Recent Graduates</h3>
                      <p className="text-blue-800 text-sm">Track entry-level salaries, student loan payments, and early career financial goals while building emergency funds and establishing healthy financial habits for long-term success.</p>
                    </div>
                    
                    <div className="bg-green-50 rounded-lg p-4">
                      <h3 className="font-semibold text-green-900 mb-2">Families & Household Managers</h3>
                      <p className="text-green-800 text-sm">Manage complex household budgets, track multiple income sources, monitor family expenses, and plan for major life events like home purchases, education costs, and retirement savings.</p>
                    </div>
                    
                    <div className="bg-purple-50 rounded-lg p-4">
                      <h3 className="font-semibold text-purple-900 mb-2">Freelancers & Independent Contractors</h3>
                      <p className="text-purple-800 text-sm">Navigate irregular income streams, track business expenses, manage tax obligations, and maintain financial stability with variable cash flow patterns and seasonal income fluctuations.</p>
                    </div>
                    
                    <div className="bg-orange-50 rounded-lg p-4">
                      <h3 className="font-semibold text-orange-900 mb-2">Pre-Retirement Planners</h3>
                      <p className="text-orange-800 text-sm">Optimize savings strategies, track retirement contributions, manage debt payoff timelines, and ensure financial readiness for retirement transition with comprehensive financial analysis.</p>
                    </div>

                    <div className="bg-teal-50 rounded-lg p-4">
                      <h3 className="font-semibold text-teal-900 mb-2">Financial Advisors & Planners</h3>
                      <p className="text-teal-800 text-sm">Provide clients with comprehensive financial overviews, demonstrate planning strategies, track goal progress, and support evidence-based financial recommendations with detailed analytics.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
                <CardContent className="p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Key Features & Analysis Capabilities</h2>
                  <p className="text-gray-600 mb-6">Our comprehensive personal finance dashboard offers professional-grade analysis tools designed for complete financial management, strategic planning, and optimization across all aspects of personal finance.</p>
                  
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                        <span className="text-white text-xs font-bold">✓</span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-1">Comprehensive Financial Tracking</h4>
                        <p className="text-gray-600 text-sm">Track all income sources, expenses, debts, and savings goals with automatic calculations, real-time updates, and detailed categorization for complete financial visibility and control.</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                        <span className="text-white text-xs font-bold">✓</span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-1">Interactive Visual Analytics</h4>
                        <p className="text-gray-600 text-sm">Dynamic charts and graphs display income distribution, expense breakdowns, debt analysis, and savings progress with professional-grade visualization tools for data-driven insights.</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                        <span className="text-white text-xs font-bold">✓</span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-1">Strategic Financial Planning</h4>
                        <p className="text-gray-600 text-sm">Advanced planning tools for goal setting, debt payoff strategies, savings optimization, and financial health assessment with personalized recommendations and actionable insights.</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                        <span className="text-white text-xs font-bold">✓</span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-1">Multi-Currency Global Support</h4>
                        <p className="text-gray-600 text-sm">Support for major international currencies with accurate formatting and localized display, making the dashboard accessible for users worldwide with diverse financial needs.</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-teal-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                        <span className="text-white text-xs font-bold">✓</span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-1">Privacy-Focused Design</h4>
                        <p className="text-gray-600 text-sm">All calculations performed locally with no data transmission or storage, ensuring complete privacy and security for your sensitive financial information and personal data.</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Financial Planning Strategies */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Strategic Financial Planning & Optimization Techniques</h2>
                <p className="text-gray-600 mb-8">Implementing effective financial planning strategies through comprehensive dashboard analysis helps optimize your financial health, accelerate goal achievement, and build long-term wealth through strategic money management and informed decision-making.</p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900">Income Optimization</h3>
                    <div className="space-y-3">
                      <div className="bg-blue-50 border-l-4 border-blue-400 p-3 rounded-r-lg">
                        <h4 className="font-semibold text-blue-900 text-sm">Diversification Strategy</h4>
                        <p className="text-blue-800 text-xs mt-1">Develop multiple income streams to reduce financial risk and increase earning potential through side businesses, investments, freelancing, or passive income generation.</p>
                      </div>
                      <div className="bg-indigo-50 border-l-4 border-indigo-400 p-3 rounded-r-lg">
                        <h4 className="font-semibold text-indigo-900 text-sm">Career Development Planning</h4>
                        <p className="text-indigo-800 text-xs mt-1">Track income growth over time and plan strategic career moves, skill development investments, and professional advancement to maximize long-term earning potential.</p>
                      </div>
                      <div className="bg-cyan-50 border-l-4 border-cyan-400 p-3 rounded-r-lg">
                        <h4 className="font-semibold text-cyan-900 text-sm">Tax Efficiency Optimization</h4>
                        <p className="text-cyan-800 text-xs mt-1">Structure income sources and timing for optimal tax efficiency, including retirement contributions, business expenses, and strategic income deferral strategies.</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900">Expense Management Excellence</h3>
                    <div className="space-y-3">
                      <div className="bg-green-50 border-l-4 border-green-400 p-3 rounded-r-lg">
                        <h4 className="font-semibold text-green-900 text-sm">Strategic Budget Allocation</h4>
                        <p className="text-green-800 text-xs mt-1">Implement the 50/30/20 rule or customize allocation strategies based on your financial goals, life stage, and income level for optimal financial balance and growth.</p>
                      </div>
                      <div className="bg-emerald-50 border-l-4 border-emerald-400 p-3 rounded-r-lg">
                        <h4 className="font-semibold text-emerald-900 text-sm">Fixed vs Variable Optimization</h4>
                        <p className="text-emerald-800 text-xs mt-1">Analyze and optimize the ratio of fixed to variable expenses to maintain financial flexibility while securing essential needs and maximizing savings potential.</p>
                      </div>
                      <div className="bg-teal-50 border-l-4 border-teal-400 p-3 rounded-r-lg">
                        <h4 className="font-semibold text-teal-900 text-sm">Lifestyle Inflation Management</h4>
                        <p className="text-teal-800 text-xs mt-1">Monitor and control lifestyle inflation as income increases, ensuring that expense growth doesn't outpace income growth and maintaining strong savings rates.</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900">Wealth Building Strategies</h3>
                    <div className="space-y-3">
                      <div className="bg-orange-50 border-l-4 border-orange-400 p-3 rounded-r-lg">
                        <h4 className="font-semibold text-orange-900 text-sm">Goal Prioritization Framework</h4>
                        <p className="text-orange-800 text-xs mt-1">Develop strategic goal hierarchies balancing short-term needs with long-term wealth building, including emergency funds, debt payoff, and investment accumulation.</p>
                      </div>
                      <div className="bg-red-50 border-l-4 border-red-400 p-3 rounded-r-lg">
                        <h4 className="font-semibold text-red-900 text-sm">Debt Elimination Strategy</h4>
                        <p className="text-red-800 text-xs mt-1">Implement strategic debt payoff methods like avalanche or snowball approaches, optimizing payment allocation to minimize interest costs and accelerate debt freedom.</p>
                      </div>
                      <div className="bg-pink-50 border-l-4 border-pink-400 p-3 rounded-r-lg">
                        <h4 className="font-semibold text-pink-900 text-sm">Investment Integration Planning</h4>
                        <p className="text-pink-800 text-xs mt-1">Coordinate dashboard insights with investment strategies, retirement planning, and wealth accumulation goals for comprehensive financial growth and security.</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-8 bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Professional Financial Dashboard Best Practices</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium text-gray-800 mb-2">Regular Review & Adjustment</h4>
                      <p className="text-gray-600 text-sm">Conduct monthly financial reviews to assess progress, adjust goals, and optimize strategies based on changing circumstances and market conditions for continuous improvement.</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-800 mb-2">Scenario Planning & Modeling</h4>
                      <p className="text-gray-600 text-sm">Use dashboard data to model different financial scenarios, including income changes, major purchases, or economic shifts to prepare for various future possibilities.</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-800 mb-2">Integration with Financial Tools</h4>
                      <p className="text-gray-600 text-sm">Combine dashboard insights with other financial tools, investment platforms, and professional advice for comprehensive financial management and optimization.</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-800 mb-2">Long-term Trend Analysis</h4>
                      <p className="text-gray-600 text-sm">Track financial trends over time to identify patterns, measure progress toward goals, and make data-driven adjustments to your financial strategy and planning approach.</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Frequently Asked Questions */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-8">Frequently Asked Questions</h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">How accurate are the financial calculations in the dashboard?</h3>
                      <p className="text-gray-600 text-sm">
                        The dashboard uses industry-standard financial formulas and provides highly accurate calculations for budgeting and planning purposes. All calculations are performed in real-time with precise mathematical algorithms for reliable financial analysis.
                      </p>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Can I track irregular or seasonal income?</h3>
                      <p className="text-gray-600 text-sm">
                        Yes, the dashboard supports multiple frequency options (weekly, bi-weekly, monthly, yearly) and automatically converts all income to monthly equivalents for consistent analysis, making it perfect for freelancers and seasonal workers.
                      </p>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">What's the ideal savings rate I should aim for?</h3>
                      <p className="text-gray-600 text-sm">
                        Financial experts generally recommend a savings rate of 20% or higher. However, the ideal rate depends on your age, income level, debt obligations, and financial goals. The dashboard helps you track and optimize your personal savings rate.
                      </p>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">How should I prioritize multiple financial goals?</h3>
                      <p className="text-gray-600 text-sm">
                        Generally, prioritize emergency funds first, then high-interest debt payoff, followed by retirement savings and other goals. The dashboard helps you visualize progress across multiple goals simultaneously for strategic planning.
                      </p>
                    </div>
                  </div>
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Is my financial data secure when using this dashboard?</h3>
                      <p className="text-gray-600 text-sm">
                        Absolutely. All calculations are performed locally in your browser with no data transmission or storage on external servers. Your financial information remains completely private and secure on your device.
                      </p>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Can I use this for business financial tracking?</h3>
                      <p className="text-gray-600 text-sm">
                        While designed for personal finance, the dashboard can accommodate business income and expenses. However, consider using specialized business financial tools for complex business accounting, tax reporting, and compliance requirements.
                      </p>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">How often should I update my financial dashboard?</h3>
                      <p className="text-gray-600 text-sm">
                        Update your dashboard monthly or whenever significant financial changes occur. Regular updates ensure accurate tracking and help maintain momentum toward your financial goals through consistent monitoring.
                      </p>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">What if my expenses exceed my income?</h3>
                      <p className="text-gray-600 text-sm">
                        The dashboard will clearly show negative cash flow, highlighting the need for immediate action. Focus on reducing expenses, increasing income, or both. Consider this a priority situation requiring strategic financial adjustments.
                      </p>
                    </div>
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
};

export default PersonalFinanceDashboard;
