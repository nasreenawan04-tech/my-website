import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calculator } from 'lucide-react';

interface RetirementResult {
  totalSavings: number;
  monthlyContribution: number;
  totalContributions: number;
  interestEarned: number;
  monthlyIncomeAtRetirement: number;
  yearsOfContributions: number;
}

const RetirementCalculator = () => {
  const [currentAge, setCurrentAge] = useState('');
  const [retirementAge, setRetirementAge] = useState('65');
  const [currentSavings, setCurrentSavings] = useState('');
  const [monthlyContribution, setMonthlyContribution] = useState('');
  const [expectedReturn, setExpectedReturn] = useState('7');
  const [withdrawalRate, setWithdrawalRate] = useState('4');
  const [currency, setCurrency] = useState('USD');
  const [result, setResult] = useState<RetirementResult | null>(null);

  const calculateRetirement = () => {
    const currentAgeNum = parseFloat(currentAge);
    const retirementAgeNum = parseFloat(retirementAge);
    const currentSavingsNum = parseFloat(currentSavings) || 0;
    const monthlyContrib = parseFloat(monthlyContribution) || 0;
    const annualReturn = parseFloat(expectedReturn) / 100;
    const monthlyReturn = annualReturn / 12;
    const withdrawalRateNum = parseFloat(withdrawalRate) / 100;

    if (currentAgeNum && retirementAgeNum && retirementAgeNum > currentAgeNum) {
      const yearsToRetirement = retirementAgeNum - currentAgeNum;
      const monthsToRetirement = yearsToRetirement * 12;

      // Future value of current savings
      const futureValueCurrentSavings = currentSavingsNum * Math.pow(1 + annualReturn, yearsToRetirement);

      // Future value of monthly contributions (annuity)
      let futureValueContributions = 0;
      if (monthlyContrib > 0 && monthlyReturn > 0) {
        futureValueContributions = monthlyContrib * 
          (Math.pow(1 + monthlyReturn, monthsToRetirement) - 1) / monthlyReturn;
      } else if (monthlyContrib > 0) {
        futureValueContributions = monthlyContrib * monthsToRetirement;
      }

      const totalSavings = futureValueCurrentSavings + futureValueContributions;
      const totalContributions = currentSavingsNum + (monthlyContrib * monthsToRetirement);
      const interestEarned = totalSavings - totalContributions;
      const monthlyIncomeAtRetirement = (totalSavings * withdrawalRateNum) / 12;

      setResult({
        totalSavings: Math.round(totalSavings * 100) / 100,
        monthlyContribution: monthlyContrib,
        totalContributions: Math.round(totalContributions * 100) / 100,
        interestEarned: Math.round(interestEarned * 100) / 100,
        monthlyIncomeAtRetirement: Math.round(monthlyIncomeAtRetirement * 100) / 100,
        yearsOfContributions: yearsToRetirement
      });
    }
  };

  const resetCalculator = () => {
    setCurrentAge('');
    setRetirementAge('65');
    setCurrentSavings('');
    setMonthlyContribution('');
    setExpectedReturn('7');
    setWithdrawalRate('4');
    setCurrency('USD');
    setResult(null);
  };

  const formatCurrency = (amount: number) => {
    const currencyMap: { [key: string]: { locale: string; currency: string } } = {
      USD: { locale: 'en-US', currency: 'USD' },
      EUR: { locale: 'de-DE', currency: 'EUR' },
      GBP: { locale: 'en-GB', currency: 'GBP' },
      INR: { locale: 'en-IN', currency: 'INR' },
      JPY: { locale: 'ja-JP', currency: 'JPY' },
      CAD: { locale: 'en-CA', currency: 'CAD' },
      AUD: { locale: 'en-AU', currency: 'AUD' },
      CNY: { locale: 'zh-CN', currency: 'CNY' },
      BRL: { locale: 'pt-BR', currency: 'BRL' },
      MXN: { locale: 'es-MX', currency: 'MXN' }
    };

    const config = currencyMap[currency] || currencyMap.USD;
    
    return new Intl.NumberFormat(config.locale, {
      style: 'currency',
      currency: config.currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  return (
    <>
      <Helmet>
        <title>Retirement Calculator - Free Retirement Planning Tool | Calculate 401k, IRA & Pension Savings | ToolForge</title>
        <meta name="description" content="Free retirement calculator with 4% withdrawal rule, compound interest projections & global currency support. Calculate 401k, IRA & pension savings for students, professionals & business owners. Plan your secure financial future!" />
        <meta name="keywords" content="retirement calculator, retirement planning calculator, 401k calculator, IRA calculator, pension calculator, retirement savings calculator, compound interest retirement, 4% withdrawal rule, retirement income calculator, financial independence calculator, early retirement calculator, retirement planning tool, retirement projections, retirement fund calculator, FIRE calculator, retirement age calculator, withdrawal rate calculator, retirement savings goals, retirement planning guide" />
        <meta property="og:title" content="Free Retirement Calculator - Plan Your 401k & IRA Savings | ToolForge" />
        <meta property="og:description" content="Calculate retirement savings with our comprehensive tool. Features 4% withdrawal rule, compound interest calculations, and support for 401k, IRA & pension planning worldwide." />
        <meta property="og:type" content="website" />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="/tools/retirement-calculator" />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            "name": "Retirement Calculator",
            "description": "Free retirement planning calculator with 4% rule, compound interest calculations, and multi-currency support",
            "applicationCategory": "FinanceApplication",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "USD"
            },
            "featureList": [
              "4% withdrawal rule calculations",
              "Compound interest projections",
              "Multi-currency support",
              "401k and IRA planning",
              "Visual retirement breakdown"
            ]
          })}
        </script>
      </Helmet>

      <div className="min-h-screen flex flex-col" data-testid="page-retirement-calculator">
        <Header />
        
        <main className="flex-1 bg-neutral-50">
          {/* Hero Section */}
          <section className="gradient-hero text-white py-16">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <div className="w-20 h-20 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <i className="fas fa-user-clock text-3xl"></i>
              </div>
              <h1 className="text-4xl sm:text-5xl font-bold mb-6" data-testid="text-page-title">
                Retirement Calculator
              </h1>
              <p className="text-xl text-blue-100 max-w-2xl mx-auto">
                Plan your retirement savings and calculate how much you need to save monthly for a secure financial future
              </p>
            </div>
          </section>

          {/* SEO Content Section */}
          <section className="py-16 bg-white">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
              {/* What is Retirement Calculator */}
              <div className="mb-16">
                <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">What is a Retirement Calculator?</h2>
                <div className="max-w-4xl mx-auto">
                  <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                    A retirement calculator is a powerful financial planning tool that helps you determine how much money you need to save 
                    for retirement and projects your future retirement income. Our comprehensive retirement planning calculator uses proven 
                    financial formulas, including compound interest calculations and the widely-accepted 4% withdrawal rule, to provide 
                    accurate projections for your retirement savings goals.
                  </p>
                  <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                    Whether you're planning 401(k) contributions, IRA investments, or general retirement savings, this calculator analyzes 
                    your current financial situation, monthly contributions, expected returns, and time horizon to show you exactly how 
                    much your retirement fund will grow over time. The tool also calculates your estimated monthly retirement income 
                    based on safe withdrawal rates, helping you plan for financial independence.
                  </p>
                </div>
              </div>

              {/* How It Works */}
              <div className="mb-16 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">How Our Retirement Calculator Works</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">Advanced Financial Calculations</h3>
                    <ul className="space-y-3 text-gray-600">
                      <li className="flex items-start">
                        <span className="text-blue-600 mr-3">•</span>
                        <span><strong>Compound Interest Formula:</strong> Calculates growth on both principal and accumulated interest</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-blue-600 mr-3">•</span>
                        <span><strong>Future Value Calculations:</strong> Projects current savings and monthly contributions separately</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-blue-600 mr-3">•</span>
                        <span><strong>4% Withdrawal Rule:</strong> Estimates sustainable retirement income</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-blue-600 mr-3">•</span>
                        <span><strong>Multi-Currency Support:</strong> Accurate calculations in 10 global currencies</span>
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">Key Input Parameters</h3>
                    <ul className="space-y-3 text-gray-600">
                      <li className="flex items-start">
                        <span className="text-green-600 mr-3">•</span>
                        <span><strong>Current Age & Retirement Age:</strong> Determines investment timeline</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-green-600 mr-3">•</span>
                        <span><strong>Current Retirement Savings:</strong> Existing 401(k), IRA, and pension balances</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-green-600 mr-3">•</span>
                        <span><strong>Monthly Contributions:</strong> Regular savings and investment amounts</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-green-600 mr-3">•</span>
                        <span><strong>Expected Returns:</strong> Historical market averages (typically 7-10%)</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Benefits for Different Audiences */}
              <div className="mb-16">
                <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Retirement Planning Benefits by Audience</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {/* Students & Young Professionals */}
                  <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                      <i className="fas fa-graduation-cap text-blue-600 text-xl"></i>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">Students & Young Professionals</h3>
                    <ul className="space-y-3 text-gray-600 text-sm">
                      <li>• <strong>Early Start Advantage:</strong> See how starting retirement savings in your 20s can lead to millions by retirement</li>
                      <li>• <strong>First Job Planning:</strong> Calculate optimal 401(k) contributions to maximize employer matching</li>
                      <li>• <strong>Student Loan Balance:</strong> Plan retirement savings alongside debt repayment strategies</li>
                      <li>• <strong>Career Growth Modeling:</strong> Project how salary increases affect long-term retirement wealth</li>
                      <li>• <strong>Roth vs Traditional:</strong> Compare tax-advantaged retirement account strategies</li>
                    </ul>
                    <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                      <p className="text-blue-800 text-sm font-medium">Starting at 25 vs 35 can result in 2-3x more retirement wealth!</p>
                    </div>
                  </div>

                  {/* Mid-Career Professionals */}
                  <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                      <i className="fas fa-briefcase text-green-600 text-xl"></i>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">Mid-Career Professionals</h3>
                    <ul className="space-y-3 text-gray-600 text-sm">
                      <li>• <strong>Catch-Up Strategies:</strong> Calculate increased contributions needed to meet retirement goals</li>
                      <li>• <strong>Peak Earning Years:</strong> Maximize retirement savings during highest income periods</li>
                      <li>• <strong>Multiple Account Management:</strong> Coordinate 401(k), IRA, and other retirement accounts</li>
                      <li>• <strong>Family Planning Integration:</strong> Balance retirement savings with education funding</li>
                      <li>• <strong>Career Change Impact:</strong> Assess how job transitions affect retirement timeline</li>
                    </ul>
                    <div className="mt-4 p-3 bg-green-50 rounded-lg">
                      <p className="text-green-800 text-sm font-medium">Ages 40-50 are critical for retirement wealth accumulation.</p>
                    </div>
                  </div>

                  {/* Business Owners & Entrepreneurs */}
                  <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                      <i className="fas fa-chart-line text-purple-600 text-xl"></i>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">Business Owners & Entrepreneurs</h3>
                    <ul className="space-y-3 text-gray-600 text-sm">
                      <li>• <strong>Variable Income Planning:</strong> Model retirement savings with fluctuating business income</li>
                      <li>• <strong>SEP-IRA & Solo 401(k):</strong> Calculate self-employed retirement contribution limits</li>
                      <li>• <strong>Business Exit Strategy:</strong> Plan retirement funding through business sale proceeds</li>
                      <li>• <strong>Tax Optimization:</strong> Balance current tax savings with future retirement tax planning</li>
                      <li>• <strong>Diversification Strategy:</strong> Reduce business-dependent retirement risk</li>
                    </ul>
                    <div className="mt-4 p-3 bg-purple-50 rounded-lg">
                      <p className="text-purple-800 text-sm font-medium">Self-employed individuals can contribute up to $69,000 annually!</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Related Financial Tools */}
              <div className="mb-16 bg-gray-50 rounded-2xl p-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Complete Your Financial Planning</h2>
                <p className="text-lg text-gray-600 mb-8 text-center max-w-3xl mx-auto">
                  Retirement planning is just one piece of your financial puzzle. Use our comprehensive suite of financial calculators 
                  to create a complete picture of your financial health and optimize your wealth-building strategy.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <a href="/tools/compound-interest-calculator" className="block p-6 bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all group">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-blue-200 transition-colors">
                      <i className="fas fa-chart-area text-blue-600"></i>
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">Compound Interest Calculator</h3>
                    <p className="text-gray-600 text-sm mb-3">See how compound interest grows your retirement savings over time.</p>
                    <span className="text-blue-600 text-sm font-medium">Calculate Growth →</span>
                  </a>

                  <a href="/tools/investment-return-calculator" className="block p-6 bg-white rounded-lg border border-gray-200 hover:border-green-300 hover:shadow-lg transition-all group">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-green-200 transition-colors">
                      <i className="fas fa-trending-up text-green-600"></i>
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">Investment Return Calculator</h3>
                    <p className="text-gray-600 text-sm mb-3">Analyze portfolio performance and optimize investment allocation.</p>
                    <span className="text-green-600 text-sm font-medium">Analyze Returns →</span>
                  </a>

                  <a href="/tools/inflation-calculator" className="block p-6 bg-white rounded-lg border border-gray-200 hover:border-orange-300 hover:shadow-lg transition-all group">
                    <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-orange-200 transition-colors">
                      <i className="fas fa-chart-line text-orange-600"></i>
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">Inflation Calculator</h3>
                    <p className="text-gray-600 text-sm mb-3">Understand inflation's impact on retirement purchasing power.</p>
                    <span className="text-orange-600 text-sm font-medium">Factor Inflation →</span>
                  </a>

                  <a href="/tools/net-worth-calculator" className="block p-6 bg-white rounded-lg border border-gray-200 hover:border-purple-300 hover:shadow-lg transition-all group">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-purple-200 transition-colors">
                      <i className="fas fa-wallet text-purple-600"></i>
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">Net Worth Calculator</h3>
                    <p className="text-gray-600 text-sm mb-3">Track overall financial health and retirement readiness.</p>
                    <span className="text-purple-600 text-sm font-medium">Calculate Net Worth →</span>
                  </a>
                </div>

                <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                  <a href="/tools/savings-goal-calculator" className="block p-4 bg-white rounded-lg border border-gray-200 hover:border-teal-300 hover:shadow-md transition-all">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-teal-100 rounded-lg flex items-center justify-center mr-3">
                        <i className="fas fa-bullseye text-teal-600 text-sm"></i>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 text-sm">Savings Goal Calculator</h4>
                        <p className="text-gray-600 text-xs">Plan monthly savings for specific retirement milestones.</p>
                      </div>
                    </div>
                  </a>

                  <a href="/tools/sip-calculator" className="block p-4 bg-white rounded-lg border border-gray-200 hover:border-indigo-300 hover:shadow-md transition-all">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center mr-3">
                        <i className="fas fa-coins text-indigo-600 text-sm"></i>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 text-sm">SIP Calculator</h4>
                        <p className="text-gray-600 text-xs">Calculate systematic investment plan returns for retirement.</p>
                      </div>
                    </div>
                  </a>

                  <a href="/tools/simple-interest-calculator" className="block p-4 bg-white rounded-lg border border-gray-200 hover:border-red-300 hover:shadow-md transition-all">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center mr-3">
                        <i className="fas fa-percentage text-red-600 text-sm"></i>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 text-sm">Simple Interest Calculator</h4>
                        <p className="text-gray-600 text-xs">Compare simple vs compound interest for retirement planning.</p>
                      </div>
                    </div>
                  </a>
                </div>
              </div>
            </div>
          </section>

          {/* Calculator Section */}
          <section className="py-16 bg-neutral-50">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
              <Card className="bg-white shadow-sm border-0">
                <CardContent className="p-8">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    {/* Input Section */}
                    <div className="space-y-6">
                      <h2 className="text-2xl font-semibold text-gray-900 mb-8">Retirement Details</h2>
                      
                      {/* Currency Selection */}
                      <div className="space-y-3">
                        <Label htmlFor="currency" className="text-sm font-medium text-gray-700">
                          Currency
                        </Label>
                        <Select value={currency} onValueChange={setCurrency}>
                          <SelectTrigger className="h-12 border-gray-200 rounded-lg" data-testid="select-currency">
                            <SelectValue placeholder="Select currency" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="USD">USD - US Dollar</SelectItem>
                            <SelectItem value="EUR">EUR - Euro</SelectItem>
                            <SelectItem value="GBP">GBP - British Pound</SelectItem>
                            <SelectItem value="INR">INR - Indian Rupee</SelectItem>
                            <SelectItem value="JPY">JPY - Japanese Yen</SelectItem>
                            <SelectItem value="CAD">CAD - Canadian Dollar</SelectItem>
                            <SelectItem value="AUD">AUD - Australian Dollar</SelectItem>
                            <SelectItem value="CNY">CNY - Chinese Yuan</SelectItem>
                            <SelectItem value="BRL">BRL - Brazilian Real</SelectItem>
                            <SelectItem value="MXN">MXN - Mexican Peso</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Current Age */}
                      <div className="space-y-3">
                        <Label htmlFor="current-age" className="text-sm font-medium text-gray-700">
                          Current Age
                        </Label>
                        <Input
                          id="current-age"
                          type="number"
                          value={currentAge}
                          onChange={(e) => setCurrentAge(e.target.value)}
                          className="h-12 text-base border-gray-200 rounded-lg"
                          placeholder="30"
                          min="18"
                          max="100"
                          data-testid="input-current-age"
                        />
                      </div>

                      {/* Retirement Age */}
                      <div className="space-y-3">
                        <Label htmlFor="retirement-age" className="text-sm font-medium text-gray-700">
                          Planned Retirement Age
                        </Label>
                        <Input
                          id="retirement-age"
                          type="number"
                          value={retirementAge}
                          onChange={(e) => setRetirementAge(e.target.value)}
                          className="h-12 text-base border-gray-200 rounded-lg"
                          placeholder="65"
                          min="50"
                          max="100"
                          data-testid="input-retirement-age"
                        />
                      </div>

                      {/* Current Savings */}
                      <div className="space-y-3">
                        <Label htmlFor="current-savings" className="text-sm font-medium text-gray-700">
                          Current Retirement Savings
                        </Label>
                        <Input
                          id="current-savings"
                          type="number"
                          value={currentSavings}
                          onChange={(e) => setCurrentSavings(e.target.value)}
                          className="h-12 text-base border-gray-200 rounded-lg"
                          placeholder="50000"
                          min="0"
                          step="100"
                          data-testid="input-current-savings"
                        />
                      </div>

                      {/* Monthly Contribution */}
                      <div className="space-y-3">
                        <Label htmlFor="monthly-contribution" className="text-sm font-medium text-gray-700">
                          Monthly Contribution
                        </Label>
                        <Input
                          id="monthly-contribution"
                          type="number"
                          value={monthlyContribution}
                          onChange={(e) => setMonthlyContribution(e.target.value)}
                          className="h-12 text-base border-gray-200 rounded-lg"
                          placeholder="500"
                          min="0"
                          step="10"
                          data-testid="input-monthly-contribution"
                        />
                      </div>

                      {/* Expected Annual Return */}
                      <div className="space-y-3">
                        <Label htmlFor="expected-return" className="text-sm font-medium text-gray-700">
                          Expected Annual Return (%)
                        </Label>
                        <Input
                          id="expected-return"
                          type="number"
                          value={expectedReturn}
                          onChange={(e) => setExpectedReturn(e.target.value)}
                          className="h-12 text-base border-gray-200 rounded-lg"
                          placeholder="7"
                          min="0"
                          max="20"
                          step="0.1"
                          data-testid="input-expected-return"
                        />
                      </div>

                      {/* Withdrawal Rate */}
                      <div className="space-y-3">
                        <Label htmlFor="withdrawal-rate" className="text-sm font-medium text-gray-700">
                          Safe Withdrawal Rate (%)
                        </Label>
                        <Input
                          id="withdrawal-rate"
                          type="number"
                          value={withdrawalRate}
                          onChange={(e) => setWithdrawalRate(e.target.value)}
                          className="h-12 text-base border-gray-200 rounded-lg"
                          placeholder="4"
                          min="1"
                          max="10"
                          step="0.1"
                          data-testid="input-withdrawal-rate"
                        />
                        <p className="text-xs text-muted-foreground">
                          The 4% rule is commonly used for retirement planning
                        </p>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-4 pt-6">
                        <Button
                          onClick={calculateRetirement}
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
                      <h2 className="text-2xl font-semibold text-gray-900 mb-8">Retirement Projection</h2>
                      
                      {result ? (
                        <div className="space-y-4" data-testid="retirement-results">
                          {/* Total Savings at Retirement */}
                          <div className="bg-white rounded-lg p-4 border-l-4 border-green-500">
                            <div className="flex justify-between items-center">
                              <span className="font-semibold text-gray-700">Total Savings at Retirement</span>
                              <span className="text-2xl font-bold text-green-600" data-testid="text-total-savings">
                                {formatCurrency(result.totalSavings)}
                              </span>
                            </div>
                          </div>

                          {/* Monthly Income in Retirement */}
                          <div className="bg-white rounded-lg p-4 border-l-4 border-blue-500">
                            <div className="flex justify-between items-center">
                              <span className="font-semibold text-gray-700">Monthly Income in Retirement</span>
                              <span className="text-xl font-bold text-blue-600" data-testid="text-monthly-income">
                                {formatCurrency(result.monthlyIncomeAtRetirement)}
                              </span>
                            </div>
                          </div>

                          {/* Savings Summary */}
                          <div className="space-y-3">
                            <div className="flex justify-between">
                              <span className="text-gray-600">Total Contributions</span>
                              <span className="font-semibold" data-testid="text-total-contributions">
                                {formatCurrency(result.totalContributions)}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Interest Earned</span>
                              <span className="font-semibold text-green-600" data-testid="text-interest-earned">
                                {formatCurrency(result.interestEarned)}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Years of Savings</span>
                              <span className="font-semibold" data-testid="text-years-contributing">
                                {result.yearsOfContributions} years
                              </span>
                            </div>
                          </div>

                          {/* Visual Breakdown */}
                          <div className="mt-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-3">Savings Breakdown</h3>
                            <div className="space-y-2">
                              <div className="flex items-center">
                                <div 
                                  className="h-4 bg-blue-500 rounded-l"
                                  style={{ width: `${(result.totalContributions / result.totalSavings) * 100}%` }}
                                ></div>
                                <div 
                                  className="h-4 bg-green-500 rounded-r"
                                  style={{ width: `${(result.interestEarned / result.totalSavings) * 100}%` }}
                                ></div>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span className="flex items-center">
                                  <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                                  Contributions ({Math.round((result.totalContributions / result.totalSavings) * 100)}%)
                                </span>
                                <span className="flex items-center">
                                  <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                                  Growth ({Math.round((result.interestEarned / result.totalSavings) * 100)}%)
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-8" data-testid="no-results">
                          <i className="fas fa-user-clock text-4xl text-gray-400 mb-4"></i>
                          <p className="text-gray-500">Enter your retirement details to see projections</p>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Educational Content */}
              <div className="mt-12 space-y-8">
                {/* Main Guide */}
                <div className="bg-white rounded-2xl shadow-lg p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Complete Retirement Planning Guide</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Understanding the 4% Rule</h3>
                      <p className="text-gray-600 mb-4">
                        The 4% rule is a retirement planning guideline that suggests you can withdraw 4% of your retirement 
                        savings annually without running out of money during a 30-year retirement. This rule, based on historical 
                        market data, helps determine how much you need to save for retirement. Our retirement calculator uses 
                        this proven method to estimate your monthly retirement income.
                      </p>
                      
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Power of Compound Interest in Retirement Savings</h3>
                      <p className="text-gray-600 mb-4">
                        Compound interest is your greatest ally in retirement planning. When you invest money, you earn returns 
                        not just on your initial investment, but also on the accumulated interest from previous years. Starting 
                        early gives your retirement savings more time to compound, potentially turning modest monthly contributions 
                        into substantial retirement wealth over decades.
                      </p>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Essential Retirement Planning Tips</h3>
                      <ul className="text-gray-600 space-y-2">
                        <li>• Start retirement savings as early as possible to maximize compound growth</li>
                        <li>• Take full advantage of employer 401(k) matching contributions</li>
                        <li>• Utilize tax-advantaged accounts (401k, IRA, Roth IRA)</li>
                        <li>• Diversify your retirement investment portfolio across asset classes</li>
                        <li>• Review and adjust your retirement plan annually</li>
                        <li>• Plan for increased healthcare costs in retirement</li>
                        <li>• Consider inflation's impact on your retirement purchasing power</li>
                        <li>• Have an emergency fund separate from retirement savings</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* How to Use */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">How to Use Our Retirement Calculator</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Step-by-Step Instructions</h3>
                      <ol className="text-gray-600 space-y-3 list-decimal list-inside">
                        <li><strong>Select your currency</strong> from our supported global currencies</li>
                        <li><strong>Enter your current age</strong> to calculate years until retirement</li>
                        <li><strong>Set your planned retirement age</strong> (typically 65-67)</li>
                        <li><strong>Input current retirement savings</strong> from all accounts</li>
                        <li><strong>Add your monthly contribution</strong> amount</li>
                        <li><strong>Set expected annual return</strong> (7% is historical average)</li>
                        <li><strong>Choose withdrawal rate</strong> (4% is standard)</li>
                        <li><strong>Click calculate</strong> to see your retirement projection</li>
                      </ol>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Understanding Your Results</h3>
                      <p className="text-gray-600 mb-4">
                        Our retirement calculator provides comprehensive results including your total savings at retirement, 
                        estimated monthly income during retirement, total contributions made, and interest earned through 
                        compound growth.
                      </p>
                      <p className="text-gray-600">
                        The visual breakdown shows the proportion of your retirement fund from contributions versus 
                        investment growth, helping you understand how compound interest builds your retirement wealth.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Advanced Features */}
                <div className="bg-white rounded-2xl shadow-lg p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Advanced Retirement Planning Features</h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center p-6 bg-gray-50 rounded-xl">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <i className="fas fa-globe-americas text-blue-600"></i>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Multi-Currency Support</h3>
                      <p className="text-gray-600 text-sm">
                        Calculate retirement savings in USD, EUR, GBP, INR, JPY, CAD, AUD, CNY, BRL, and MXN with 
                        accurate currency formatting.
                      </p>
                    </div>
                    <div className="text-center p-6 bg-gray-50 rounded-xl">
                      <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <i className="fas fa-chart-line text-green-600"></i>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Visual Analytics</h3>
                      <p className="text-gray-600 text-sm">
                        Interactive charts showing the breakdown between your contributions and compound interest 
                        growth over time.
                      </p>
                    </div>
                    <div className="text-center p-6 bg-gray-50 rounded-xl">
                      <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <i className="fas fa-calculator text-purple-600"></i>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Flexible Parameters</h3>
                      <p className="text-gray-600 text-sm">
                        Adjust expected returns, withdrawal rates, and contribution schedules to model different 
                        retirement scenarios.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Retirement Planning Strategies */}
                <div className="bg-white rounded-2xl shadow-lg p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Retirement Savings Strategies by Age</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="p-6 border border-gray-200 rounded-xl">
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">In Your 20s & 30s</h3>
                      <ul className="text-gray-600 space-y-2 text-sm">
                        <li>• Start with employer 401(k) match</li>
                        <li>• Open a Roth IRA for tax-free growth</li>
                        <li>• Aim to save 10-15% of income</li>
                        <li>• Take advantage of compound interest time</li>
                        <li>• Consider aggressive growth investments</li>
                      </ul>
                    </div>
                    <div className="p-6 border border-gray-200 rounded-xl">
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">In Your 40s & 50s</h3>
                      <ul className="text-gray-600 space-y-2 text-sm">
                        <li>• Increase savings rate to 15-20%</li>
                        <li>• Utilize catch-up contributions after 50</li>
                        <li>• Diversify investment portfolio</li>
                        <li>• Pay off high-interest debt</li>
                        <li>• Estimate retirement expenses</li>
                      </ul>
                    </div>
                    <div className="p-6 border border-gray-200 rounded-xl">
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Approaching Retirement</h3>
                      <ul className="text-gray-600 space-y-2 text-sm">
                        <li>• Shift to conservative investments</li>
                        <li>• Plan Social Security claiming strategy</li>
                        <li>• Consider healthcare costs</li>
                        <li>• Create retirement withdrawal plan</li>
                        <li>• Review estate planning documents</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* FAQ Section */}
                <div className="bg-gray-50 rounded-2xl p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Retirement Calculator FAQs</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">How accurate is this retirement calculator?</h3>
                      <p className="text-gray-600 text-sm mb-4">
                        Our retirement calculator uses proven financial formulas and the widely-accepted 4% withdrawal rule. 
                        While it provides reliable estimates, actual results may vary based on market conditions, inflation, 
                        and personal circumstances.
                      </p>
                      
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">What's a good retirement savings rate?</h3>
                      <p className="text-gray-600 text-sm mb-4">
                        Financial experts typically recommend saving 10-15% of your income for retirement, including employer 
                        matches. If you start later, you may need to save 15-20% or more to catch up.
                      </p>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">How much should I have saved by age 30, 40, 50?</h3>
                      <p className="text-gray-600 text-sm mb-4">
                        Common benchmarks: 1x annual salary by 30, 3x by 40, 6x by 50, 8x by 60, and 10x by 67. 
                        Use our calculator to see if you're on track for these retirement savings milestones.
                      </p>
                      
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Should I include Social Security in retirement planning?</h3>
                      <p className="text-gray-600 text-sm mb-4">
                        While Social Security provides valuable retirement income, it's designed to replace only about 40% 
                        of pre-retirement income. Our calculator focuses on personal savings to supplement Social Security benefits. 
                        Use our <a href="/tools/net-worth-calculator" className="text-blue-600 hover:text-blue-800 underline">Net Worth Calculator</a> to 
                        track your overall financial progress and our <a href="/tools/inflation-calculator" className="text-blue-600 hover:text-blue-800 underline">Inflation Calculator</a> to 
                        understand how inflation affects Social Security purchasing power over time.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Currency Information */}
                <div className="bg-blue-50 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    <i className="fas fa-globe mr-2"></i>
                    Global Retirement Planning Tool
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Our retirement calculator supports major global currencies including USD, EUR, GBP, INR, JPY, CAD, AUD, CNY, BRL, and MXN. 
                    Whether you're planning retirement in the United States, Europe, Asia, or anywhere else, our tool provides accurate 
                    calculations with proper currency formatting for your region. Plan your financial future regardless of your location 
                    or preferred currency.
                  </p>
                  <p className="text-gray-600">
                    <strong>Complete Financial Planning:</strong> Combine this retirement calculator with our 
                    <a href="/tools/currency-converter" className="text-blue-600 hover:text-blue-800 underline mx-1">Currency Converter</a> 
                    for international investment planning, and our 
                    <a href="/tools/investment-return-calculator" className="text-blue-600 hover:text-blue-800 underline mx-1">Investment Return Calculator</a> 
                    to optimize your portfolio across different markets and currencies.
                  </p>
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

export default RetirementCalculator;